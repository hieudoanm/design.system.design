# Distributed Scheduler — Cron

Design a distributed job scheduler

**Difficulty:** Hard

**Tags:** distributed, scheduling

## Functional Requirements

- a distributed job scheduler
- ensure a job runs exactly once?
- handle missed executions and retries?
- prevent thundering-herd at schedule boundaries?
- rebalance jobs across workers?

## Non-Functional Requirements

- Mitigate with batching and
  jitter.

- The `Dispatcher` processes due jobs in bounded batches per tick — e.g., 1,000
  per pass — rather than flooding, and it advances the `next_run_at` of each
  claimed job so a partially processed batch does not re-enqueue on the next
  tick.
- Apply per-job jitter at registration: offset each job's effective schedule by
  a small random delta (`next_run_at = cron + rand(0, jitter_window)`), so
  identical cron expressions stagger naturally.
- This is nearly free and collapses the peak without changing the semantics that
  matter.

For genuinely synchronized bursts — a market open, a data refresh — rate-limit
enqueue into the `Ready Queue` and let the consumer group scale workers out to
drain faster.

- Cap in-flight executions so the database and downstream systems are not
  overloaded.
- Stagger by priority: latency-sensitive jobs get no jitter and run early; batch
  jobs get large jitter and run in the background.
- Track peak enqueue rate and queue depth as SLOs, so you can detect when a
  boundary is approaching the limits and pre-scale workers before it arrives.
- The trade-off is a small loss of scheduling precision — a jittered job may run
  a few seconds late — against collapsing a destructive spike into a smooth
  drain.

Extend the mitigation to the consumer side.

- Batch-claim from the queue (claim N jobs in one operation) so workers do not
  each pay a round trip per job.
- Pre-claim work a tick early so the drain starts before the boundary hits the
  workers.
- For the store, do the `next_run_at` advance in the same statement as the
  claim, so there is no double-read window.
- Make the boundaries visible in operations: log the top enqueue bursts, track
  the enqueue-rate curve, and pre-scale workers by predicting the next boundary
  from the schedule table — the scheduler knows the future, so it should use it..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Distributed Scheduler
app: App
api: Scheduler API
store: Job Store
dispatcher: Dispatcher
queue: Ready Queue
workers: Worker Pool
leader: Leader Elector
retry: Retry Handler
monitor: Monitor
notify: Notifier

app ─► api ─► schedule
api ─► store ─► persist
store ─► dispatcher ─► due jobs
dispatcher ─► queue ─► enqueue
queue ─► workers ─► claim
workers ─► api ─► result
leader ─► dispatcher ─► elect
retry ─► queue ─► redeliver
monitor ─► store ─► scan
dispatcher ─► notify ─► alert
```

## Design

### Design a distributed job scheduler

Apps register jobs through the `Scheduler API`, which persists the job
definition — cron expression, timeout, retry policy — in the `Job Store` (a
durable DB).

- A `Dispatcher` wakes periodically, scans the store for jobs whose
  `next_run_at` has passed, and enqueues them into a `Ready Queue`.
- Workers in a `Worker Pool` claim jobs, execute them, and report results back
  through the API.
- A `Leader Elector` (e.g., `etcd`, `ZooKeeper`, or `Redis`) ensures only one
  dispatcher instance scans at a time, avoiding duplicate scheduling.
- A `Monitor` scans for stuck or overdue jobs, a `Retry Handler` redelivers
  failed executions, and a `Notifier` alerts on failures.

The model is a state machine per job run: scheduled → claimed → running →
succeeded or failed → retried.

- Two distinct clocks matter and must not be conflated: wall-clock time (when is
  a job due) and distributed agreement (who owns the scan).
- Conflating them causes the classic double-run — two schedulers both decide a
  job is due.
- The durable `Job Store` is the source of truth for the schedule and job state;
  the queue and workers are an execution accelerator that must reconcile back to
  the store.
- The design therefore treats the DB as authoritative and the queue as a fast
  dispatch path: a crash anywhere leaves the job's state in the store, and a
  monitor reconciles it.

Operationally, keep the dispatcher's scan cheap.

- Advance `next_run_at` on claim so the same job is not re-scanned in the same
  tick.
- Index the store on `(status, next_run_at)` so the scan is a narrow range read.
- Run the scan against a replica separate from the workers so heavy job
  execution does not contend with scheduling.
- Expose queue depth, scan duration, and lease expirations as metrics so a
  backlog is visible before it becomes a missed job, and alert on the pipeline's
  own health as loudly as on job failures.

### How do you ensure a job runs exactly once?

Exactly-once is achieved by making the transition from `due` to `running` atomic
and idempotent, not by hoping workers never crash.

- The `Dispatcher` claims a due job with a conditional update —
  `UPDATE jobs SET status='claimed' WHERE id=? AND status='scheduled'` — which
  atomically wins against all other contenders, so exactly one claim succeeds.
- The claim carries a lease (`lease_until`); the worker must renew it or lose
  the lease.
- The same pattern holds at the queue: workers claim work with an atomic pop
  plus an in-flight lease, so a crash mid-run lets the job return to `ready`
  after the lease expires.

Exactly-once _delivery_ is impossible in the presence of crashes — that is the
classic at-least-once versus at-most-once trap — so you implement exactly-once
_effects_.

- Give every run a unique `run_id`, execute with idempotent handlers (the job's
  side effects are safe to re-apply), and have the result store ignore duplicate
  results for the same `run_id`.
- The three layers combine: the `Leader Elector` guarantees a single scanner,
  the conditional update guarantees a single claim, and idempotency guarantees a
  single effect even if a retry re-executes.
- The invariant is that two workers may transiently believe they own a job
  during a lease handoff, but only one result is ever recorded and no double
  effect happens.

Two practical details harden the claim.

- Time synchronization matters at the boundary — a worker's clock skew changes
  how long it thinks it holds a lease, so use the store's time for lease
  arithmetic or keep skew within a few hundred milliseconds and add a safety
  margin to the lease.
- Make lease renewal periodic, not one-shot: a worker must renew on a cadence
  far shorter than the lease duration, so a slow worker loses the lease before
  it finishes a stale run.
- Combined with the conditional update, this makes the happy path single-owner
  and the failure path bounded and convergent.

### How do you handle missed executions and retries?

Separate three failure classes: the worker died mid-run (recoverable), the job
failed deterministically (retryable with policy), and the scheduler missed a
window entirely (catch-up).

- For worker death, the lease handles it — when `lease_until` passes without
  renewal, the `Monitor` resets the job to `ready` and it is re-dispatched.
- For job failure, the `Retry Handler` redelivers with exponential backoff and
  jitter up to a per-job `max_retries`, tracking attempt count and last error in
  the store; retries re-enter the `Ready Queue` rather than re-scanning the
  schedule, so they do not wait for the next cron boundary.

For missed windows — the whole scheduler was down, or a dependency outage
blocked a run — decide a catch-up policy per job and store it with the job.

- Run the latest missed execution, run all missed, or skip.
- Do not blindly catch up everything: a job that missed fifty runs because the
  cluster was down should usually run once, not fifty times.
- Record `last_run_at` and `last_result` on every attempt, and make skipped runs
  visible — surface them to the `Notifier` rather than silently swallowing them,
  because a silently skipped payment sweep is an incident waiting to happen.
- The design principle is that every missed, failed, or skipped execution leaves
  an audit trail, and the retry policy is explicit per job instead of a
  platform-wide guess.

Make retries observable and bounded.

- Persist every attempt with its error, attempt number, and backoff deadline in
  the job record, so a reviewer sees the full failure history without scanning
  logs.
- Enforce a global retry budget — max attempts per job and a global cap on
  in-flight retries — so a poisoned job (e.g., a bad query) cannot consume the
  worker pool.
- Treat retry storms as a hazard: backoff with full jitter spreads retries over
  the window instead of aligning them, and a failing job that has exhausted
  retries is parked and alerted rather than retried forever.

### How do you prevent thundering-herd at schedule boundaries?

If 10,000 jobs are due at midnight, naive scheduling enqueues them all at once,
slamming the workers, the queue, and the database. Mitigate with batching and
jitter.

- The `Dispatcher` processes due jobs in bounded batches per tick — e.g., 1,000
  per pass — rather than flooding, and it advances the `next_run_at` of each
  claimed job so a partially processed batch does not re-enqueue on the next
  tick.
- Apply per-job jitter at registration: offset each job's effective schedule by
  a small random delta (`next_run_at = cron + rand(0, jitter_window)`), so
  identical cron expressions stagger naturally.
- This is nearly free and collapses the peak without changing the semantics that
  matter.

For genuinely synchronized bursts — a market open, a data refresh — rate-limit
enqueue into the `Ready Queue` and let the consumer group scale workers out to
drain faster.

- Cap in-flight executions so the database and downstream systems are not
  overloaded.
- Stagger by priority: latency-sensitive jobs get no jitter and run early; batch
  jobs get large jitter and run in the background.
- Track peak enqueue rate and queue depth as SLOs, so you can detect when a
  boundary is approaching the limits and pre-scale workers before it arrives.
- The trade-off is a small loss of scheduling precision — a jittered job may run
  a few seconds late — against collapsing a destructive spike into a smooth
  drain.

Extend the mitigation to the consumer side.

- Batch-claim from the queue (claim N jobs in one operation) so workers do not
  each pay a round trip per job.
- Pre-claim work a tick early so the drain starts before the boundary hits the
  workers.
- For the store, do the `next_run_at` advance in the same statement as the
  claim, so there is no double-read window.
- Make the boundaries visible in operations: log the top enqueue bursts, track
  the enqueue-rate curve, and pre-scale workers by predicting the next boundary
  from the schedule table — the scheduler knows the future, so it should use it.

### How do you rebalance jobs across workers?

Jobs must move when workers die, join, or lag, and they must do so without
manual intervention. Lease ownership is the mechanism.

- A running job is owned by a worker only while its `lease_until` is renewed.
- When a worker dies, its leases expire and the `Monitor` returns those jobs to
  `ready`; the claim protocol then redistributes them across the remaining
  healthy workers automatically.
- When a worker joins, new claims spread across it via the queue's consumer
  group or a consistent-hash assignment, so adding capacity immediately helps
  drain the backlog.

When a worker is slow — still renewing but falling behind — the scheduler can
preempt.

- Revoke the lease and re-enqueue after the current attempt's grace period, with
  a guard so the slow worker's eventual result is ignored if the job was already
  redelivered (dedupe by `run_id`).
- For assignment-based jobs, rebalance on membership change by re-hashing the
  job space and moving only the affected shard, not everything — moving all jobs
  on every membership change is a thundering herd of its own.
- The important subtlety: never interrupt a genuinely long-running job just
  because another worker is idle.
- Rebalance by waiting for natural completion plus lease expiry, and use an
  explicit per-job `timeout` so neither a runaway job nor a stuck worker blocks
  the pool forever.
- The design goal is that any worker can vanish and the system converges to a
  balanced, fully-served schedule within a few lease periods.

Finally, keep rebalancing safe and observable.

- All rebalance actions flow through the store's conditional updates, so even a
  flapping worker (join, die, join) cannot corrupt state — each claim and lease
  is atomic regardless of membership churn.
- Log every lease acquisition, renewal, and expiry with the worker id, and alert
  on repeated preemptions of the same job, which usually signals a job that runs
  longer than its lease.
- The invariant to protect is liveness over balance: a slightly unbalanced
  schedule is fine, a schedule that stops because a rebalance moved a job twice
  is not.
- Prefer converged eventual distribution over prompt but disruptive
  redistribution.

## Source

```text
title: Distributed Scheduler
node app: App [round, icon=browser]
node api: Scheduler API [icon=server]
node store: Job Store [cylinder, icon=database]
node dispatcher: Dispatcher [icon=compute]
node queue: Ready Queue [icon=queue]
node workers: Worker Pool [icon=worker]
node leader: Leader Elector [icon=shield]
node retry: Retry Handler [icon=sync]
node monitor: Monitor [icon=search]
node notify: Notifier [icon=message]

edge app -> api: schedule
edge api -> store: persist
edge store -> dispatcher: due jobs
edge dispatcher -> queue: enqueue
edge queue -> workers: claim
edge workers -> api: result
edge leader -> dispatcher: elect
edge retry -> queue: redeliver
edge monitor -> store: scan
edge dispatcher -> notify: alert
```

## Q&A

### Q: Design a distributed job scheduler

**A:** Apps register jobs through the `Scheduler API`, which persists the job
definition — cron expression, timeout, retry policy — in the `Job Store` (a
durable DB).

- A `Dispatcher` wakes periodically, scans the store for jobs whose
  `next_run_at` has passed, and enqueues them into a `Ready Queue`.
- Workers in a `Worker Pool` claim jobs, execute them, and report results back
  through the API.
- A `Leader Elector` (e.g., `etcd`, `ZooKeeper`, or `Redis`) ensures only one
  dispatcher instance scans at a time, avoiding duplicate scheduling.
- A `Monitor` scans for stuck or overdue jobs, a `Retry Handler` redelivers
  failed executions, and a `Notifier` alerts on failures.

The model is a state machine per job run: scheduled → claimed → running →
succeeded or failed → retried.

- Two distinct clocks matter and must not be conflated: wall-clock time (when is
  a job due) and distributed agreement (who owns the scan).
- Conflating them causes the classic double-run — two schedulers both decide a
  job is due.
- The durable `Job Store` is the source of truth for the schedule and job state;
  the queue and workers are an execution accelerator that must reconcile back to
  the store.
- The design therefore treats the DB as authoritative and the queue as a fast
  dispatch path: a crash anywhere leaves the job's state in the store, and a
  monitor reconciles it.

Operationally, keep the dispatcher's scan cheap.

- Advance `next_run_at` on claim so the same job is not re-scanned in the same
  tick.
- Index the store on `(status, next_run_at)` so the scan is a narrow range read.
- Run the scan against a replica separate from the workers so heavy job
  execution does not contend with scheduling.
- Expose queue depth, scan duration, and lease expirations as metrics so a
  backlog is visible before it becomes a missed job, and alert on the pipeline's
  own health as loudly as on job failures.

### Q: How do you ensure a job runs exactly once?

**A:** Exactly-once is achieved by making the transition from `due` to `running` atomic
and idempotent, not by hoping workers never crash.

- The `Dispatcher` claims a due job with a conditional update —
  `UPDATE jobs SET status='claimed' WHERE id=? AND status='scheduled'` — which
  atomically wins against all other contenders, so exactly one claim succeeds.
- The claim carries a lease (`lease_until`); the worker must renew it or lose
  the lease.
- The same pattern holds at the queue: workers claim work with an atomic pop
  plus an in-flight lease, so a crash mid-run lets the job return to `ready`
  after the lease expires.

Exactly-once _delivery_ is impossible in the presence of crashes — that is the
classic at-least-once versus at-most-once trap — so you implement exactly-once
_effects_.

- Give every run a unique `run_id`, execute with idempotent handlers (the job's
  side effects are safe to re-apply), and have the result store ignore duplicate
  results for the same `run_id`.
- The three layers combine: the `Leader Elector` guarantees a single scanner,
  the conditional update guarantees a single claim, and idempotency guarantees a
  single effect even if a retry re-executes.
- The invariant is that two workers may transiently believe they own a job
  during a lease handoff, but only one result is ever recorded and no double
  effect happens.

Two practical details harden the claim.

- Time synchronization matters at the boundary — a worker's clock skew changes
  how long it thinks it holds a lease, so use the store's time for lease
  arithmetic or keep skew within a few hundred milliseconds and add a safety
  margin to the lease.
- Make lease renewal periodic, not one-shot: a worker must renew on a cadence
  far shorter than the lease duration, so a slow worker loses the lease before
  it finishes a stale run.
- Combined with the conditional update, this makes the happy path single-owner
  and the failure path bounded and convergent.

### Q: How do you handle missed executions and retries?

**A:** Separate three failure classes: the worker died mid-run (recoverable), the job
failed deterministically (retryable with policy), and the scheduler missed a
window entirely (catch-up).

- For worker death, the lease handles it — when `lease_until` passes without
  renewal, the `Monitor` resets the job to `ready` and it is re-dispatched.
- For job failure, the `Retry Handler` redelivers with exponential backoff and
  jitter up to a per-job `max_retries`, tracking attempt count and last error in
  the store; retries re-enter the `Ready Queue` rather than re-scanning the
  schedule, so they do not wait for the next cron boundary.

For missed windows — the whole scheduler was down, or a dependency outage
blocked a run — decide a catch-up policy per job and store it with the job.

- Run the latest missed execution, run all missed, or skip.
- Do not blindly catch up everything: a job that missed fifty runs because the
  cluster was down should usually run once, not fifty times.
- Record `last_run_at` and `last_result` on every attempt, and make skipped runs
  visible — surface them to the `Notifier` rather than silently swallowing them,
  because a silently skipped payment sweep is an incident waiting to happen.
- The design principle is that every missed, failed, or skipped execution leaves
  an audit trail, and the retry policy is explicit per job instead of a
  platform-wide guess.

Make retries observable and bounded.

- Persist every attempt with its error, attempt number, and backoff deadline in
  the job record, so a reviewer sees the full failure history without scanning
  logs.
- Enforce a global retry budget — max attempts per job and a global cap on
  in-flight retries — so a poisoned job (e.g., a bad query) cannot consume the
  worker pool.
- Treat retry storms as a hazard: backoff with full jitter spreads retries over
  the window instead of aligning them, and a failing job that has exhausted
  retries is parked and alerted rather than retried forever.

### Q: How do you prevent thundering-herd at schedule boundaries?

**A:** If 10,000 jobs are due at midnight, naive scheduling enqueues them all at once,
slamming the workers, the queue, and the database. Mitigate with batching and
jitter.

- The `Dispatcher` processes due jobs in bounded batches per tick — e.g., 1,000
  per pass — rather than flooding, and it advances the `next_run_at` of each
  claimed job so a partially processed batch does not re-enqueue on the next
  tick.
- Apply per-job jitter at registration: offset each job's effective schedule by
  a small random delta (`next_run_at = cron + rand(0, jitter_window)`), so
  identical cron expressions stagger naturally.
- This is nearly free and collapses the peak without changing the semantics that
  matter.

For genuinely synchronized bursts — a market open, a data refresh — rate-limit
enqueue into the `Ready Queue` and let the consumer group scale workers out to
drain faster.

- Cap in-flight executions so the database and downstream systems are not
  overloaded.
- Stagger by priority: latency-sensitive jobs get no jitter and run early; batch
  jobs get large jitter and run in the background.
- Track peak enqueue rate and queue depth as SLOs, so you can detect when a
  boundary is approaching the limits and pre-scale workers before it arrives.
- The trade-off is a small loss of scheduling precision — a jittered job may run
  a few seconds late — against collapsing a destructive spike into a smooth
  drain.

Extend the mitigation to the consumer side.

- Batch-claim from the queue (claim N jobs in one operation) so workers do not
  each pay a round trip per job.
- Pre-claim work a tick early so the drain starts before the boundary hits the
  workers.
- For the store, do the `next_run_at` advance in the same statement as the
  claim, so there is no double-read window.
- Make the boundaries visible in operations: log the top enqueue bursts, track
  the enqueue-rate curve, and pre-scale workers by predicting the next boundary
  from the schedule table — the scheduler knows the future, so it should use it.

### Q: How do you rebalance jobs across workers?

**A:** Jobs must move when workers die, join, or lag, and they must do so without
manual intervention. Lease ownership is the mechanism.

- A running job is owned by a worker only while its `lease_until` is renewed.
- When a worker dies, its leases expire and the `Monitor` returns those jobs to
  `ready`; the claim protocol then redistributes them across the remaining
  healthy workers automatically.
- When a worker joins, new claims spread across it via the queue's consumer
  group or a consistent-hash assignment, so adding capacity immediately helps
  drain the backlog.

When a worker is slow — still renewing but falling behind — the scheduler can
preempt.

- Revoke the lease and re-enqueue after the current attempt's grace period, with
  a guard so the slow worker's eventual result is ignored if the job was already
  redelivered (dedupe by `run_id`).
- For assignment-based jobs, rebalance on membership change by re-hashing the
  job space and moving only the affected shard, not everything — moving all jobs
  on every membership change is a thundering herd of its own.
- The important subtlety: never interrupt a genuinely long-running job just
  because another worker is idle.
- Rebalance by waiting for natural completion plus lease expiry, and use an
  explicit per-job `timeout` so neither a runaway job nor a stuck worker blocks
  the pool forever.
- The design goal is that any worker can vanish and the system converges to a
  balanced, fully-served schedule within a few lease periods.

Finally, keep rebalancing safe and observable.

- All rebalance actions flow through the store's conditional updates, so even a
  flapping worker (join, die, join) cannot corrupt state — each claim and lease
  is atomic regardless of membership churn.
- Log every lease acquisition, renewal, and expiry with the worker id, and alert
  on repeated preemptions of the same job, which usually signals a job that runs
  longer than its lease.
- The invariant to protect is liveness over balance: a slightly unbalanced
  schedule is fine, a schedule that stops because a rebalance moved a job twice
  is not.
- Prefer converged eventual distribution over prompt but disruptive
  redistribution.

## Source

```text
title: Distributed Scheduler
node app: App [round, icon=browser]
node api: Scheduler API [icon=server]
node store: Job Store [cylinder, icon=database]
node dispatcher: Dispatcher [icon=compute]
node queue: Ready Queue [icon=queue]
node workers: Worker Pool [icon=worker]
node leader: Leader Elector [icon=shield]
node retry: Retry Handler [icon=sync]
node monitor: Monitor [icon=search]
node notify: Notifier [icon=message]

edge app -> api: schedule
edge api -> store: persist
edge store -> dispatcher: due jobs
edge dispatcher -> queue: enqueue
edge queue -> workers: claim
edge workers -> api: result
edge leader -> dispatcher: elect
edge retry -> queue: redeliver
edge monitor -> store: scan
edge dispatcher -> notify: alert
```
