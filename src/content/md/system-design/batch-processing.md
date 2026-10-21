# Batch Processing

Design a batch processing framework

**Difficulty:** Hard

**Tags:** scheduling

## Functional Requirements

- a batch processing framework
- split work into parallel tasks?
- handle retries and failures?
- schedule and monitor jobs?
- make jobs idempotent?

## Non-Functional Requirements

- A batch processing framework runs large, well-defined computations over data
  that is too big for a single machine to handle in one pass.

- The core idea is divide and conquer: a job is split into many independent
  tasks, each task runs on a worker, and results are written to an output store.
- The framework owns the hard parts — scheduling, task distribution, retries,
  and monitoring — so an application developer writes a task function and
  declares its inputs, not a distributed system.

The architecture has four roles.

- A job console lets operators submit and inspect jobs.
- A job scheduler accepts submissions, tracks state, and decides which jobs run
  when.
- A job planner reads a job's input and splits it into tasks, computing the
  partition plan.
- A worker pool executes tasks pulled from a task queue, writing outputs and
  reporting progress.
- In the source diagram, this is the full loop: the console submits to the
  scheduler, the planner splits work into a task queue, workers execute and
  write outputs, a retry handler catches failures, and monitoring tracks
  progress against the job database.

The framework's contract is about what jobs can assume.

- Tasks are embarrassingly parallel — they must not depend on each other's
  runtime state, only on their own slice of input.
- Workers are interchangeable and can die at any moment, so tasks must be safely
  retryable on a different machine.
- Jobs are identified by a stable id, and every state transition is recorded so
  an operator can explain what a job did.
- Given that contract, the framework delivers scale by parallelizing tasks and
  reliability by retrying them..
- Splitting work is a planning problem: the planner must turn a job's inputs into
  a set of tasks that (a) cover the input completely, (b) overlap as little as
  possible, and (c) distribute load evenly across workers.

- The simplest correct split is by partition key: hash or range-partition the
  input records, and give each partition to one task.
- Range partitioning groups related records (all events for one user) which is
  great for per-entity computations but risks skew; hash partitioning spreads
  uniformly but scatters related records.
- The planner often uses range on the natural key and lets the worker re-group
  within a task.

The unit of split is the chunk, and chunk size is the tuning knob.

- Chunks that are too small create scheduling overhead (millions of tiny tasks);
  chunks that are too large cause stragglers — one slow task holding up a whole
  job.
- The planner therefore targets a chunk duration, not a byte count: it samples
  the input, estimates throughput per record, and sizes chunks so each task runs
  for roughly the same few minutes.
- The number of tasks is chosen against the worker pool size and data size, with
  the planner over-partitioning slightly so no worker idles while stragglers
  finish.

Splitting must also be deterministic.

- Failures are the default case, not the exception, at batch scale: with thousands
  of tasks running simultaneously, hardware, network, and code failures occur
  during every large run.

- The framework treats every task as atomic — it either completes and its output
  is committed, or it is retried.
- When a worker dies, its in-flight tasks return to the queue and are picked up
  by other workers.
- When a task fails (the worker reported an error), a retry handler re-queues it
  with a bounded attempt count and exponential backoff.
- Beyond the attempt budget, the task is parked as failed rather than retried
  forever.

The crucial detail is failure attribution: the framework must distinguish a task
that died before writing output from one that died after writing it.

- If the framework blindly re-runs both, the duplicate output can double-count.
- This is solved with atomic output commits — each task writes to a temporary
  path and renames into place as the final commit, so the framework detects
  completion by the presence of the committed marker.
- A task whose committed output exists is not re-run even if it later crashed,
  and a task that crashed early is safely re-run because its output never
  committed.

Job-level failures are handled differently from task-level failures.

- A transient outage that hits many tasks at once is a signal, not a coincidence
  — the framework's retry policy backs off globally rather than hammering the
  recovering dependency.
- If the planner itself fails, the job resumes from the last recorded state
  because the partition plan is persisted.
- A job that exceeds its failure-rate threshold moves to a failed state with a
  clear report, and operators either fix the input and retry, or restart the job
  from its checkpoints, rather than letting it run half-heartedly to a
  misleading "success"..
- Scheduling answers two questions: when should a job run, and what should run
  when there is contention.

- Time-based scheduling (cron-like) covers recurring workloads like daily
  aggregations; dependency-based scheduling covers pipelines where a job runs
  when its inputs or upstream jobs complete.
- The scheduler holds both and emits ready jobs.
- Contention is the real scheduler problem: if every hourly job fires at the top
  of the hour, the cluster peaks and idles.
- The design smooths this with offsets, priorities, and quotas per tenant so a
  misbehaving team cannot starve the pipeline, plus queue depth visibility so
  operators can move batch windows.

Monitoring is state-machine based.

- Every job tracks through submitted, scheduled, running, retrying, succeeded,
  and failed states, with timestamps on every transition, and the framework
  stores this in the job database.
- Progress is measured per task: completed tasks over total tasks, plus a
  throughput signal (records processed per second) and a lag signal (how far
  behind the job's target completion time it is).
- The combination of state, progress, and rate lets an operator answer the two
  questions that matter: is this job stuck, and will it finish on time?

Monitoring is not just dashboards — it is the retry and scaling brain.

- The monitor detects hung tasks (no heartbeat for a threshold period) and
  re-queues them, and it detects stragglers and either reruns them on a faster
  worker or scales up the worker pool mid-job.
- Alerts fire on state changes that need humans (job failed, retry budget
  exhausted, SLA breach) but not on routine state churn, to keep the on-call
  signal clean.
- Every run records the input hash, output location, and task counts, so after a
  bad job the first question — "what exactly did this job touch?" — has a
  precise answer..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Batch Processing
source: Data Sources
app: Job Console
gateway: API Gateway
scheduler: Job Scheduler
plan: Job Planner
worker: Worker Pool
queue: Task Queue
output: Output Store
retry: Retry Handler
monitor: Monitoring
db: Jobs DB

source ─► app ─► input
app ─► gateway ─► submit
gateway ─► scheduler ─► queue
scheduler ─► plan ─► split
plan ─► queue ─► tasks
queue ─► worker ─► execute
worker ─► output ─► write
worker ─► retry ─► fail
retry ─► queue ─► retry
worker ─► monitor ─► progress
scheduler ─► db ─► state
```

## Design

### Design a batch processing framework

A batch processing framework runs large, well-defined computations over data
that is too big for a single machine to handle in one pass.

- The core idea is divide and conquer: a job is split into many independent
  tasks, each task runs on a worker, and results are written to an output store.
- The framework owns the hard parts — scheduling, task distribution, retries,
  and monitoring — so an application developer writes a task function and
  declares its inputs, not a distributed system.

The architecture has four roles.

- A job console lets operators submit and inspect jobs.
- A job scheduler accepts submissions, tracks state, and decides which jobs run
  when.
- A job planner reads a job's input and splits it into tasks, computing the
  partition plan.
- A worker pool executes tasks pulled from a task queue, writing outputs and
  reporting progress.
- In the source diagram, this is the full loop: the console submits to the
  scheduler, the planner splits work into a task queue, workers execute and
  write outputs, a retry handler catches failures, and monitoring tracks
  progress against the job database.

The framework's contract is about what jobs can assume.

- Tasks are embarrassingly parallel — they must not depend on each other's
  runtime state, only on their own slice of input.
- Workers are interchangeable and can die at any moment, so tasks must be safely
  retryable on a different machine.
- Jobs are identified by a stable id, and every state transition is recorded so
  an operator can explain what a job did.
- Given that contract, the framework delivers scale by parallelizing tasks and
  reliability by retrying them.

### How do you split work into parallel tasks?

Splitting work is a planning problem: the planner must turn a job's inputs into
a set of tasks that (a) cover the input completely, (b) overlap as little as
possible, and (c) distribute load evenly across workers.

- The simplest correct split is by partition key: hash or range-partition the
  input records, and give each partition to one task.
- Range partitioning groups related records (all events for one user) which is
  great for per-entity computations but risks skew; hash partitioning spreads
  uniformly but scatters related records.
- The planner often uses range on the natural key and lets the worker re-group
  within a task.

The unit of split is the chunk, and chunk size is the tuning knob.

- Chunks that are too small create scheduling overhead (millions of tiny tasks);
  chunks that are too large cause stragglers — one slow task holding up a whole
  job.
- The planner therefore targets a chunk duration, not a byte count: it samples
  the input, estimates throughput per record, and sizes chunks so each task runs
  for roughly the same few minutes.
- The number of tasks is chosen against the worker pool size and data size, with
  the planner over-partitioning slightly so no worker idles while stragglers
  finish.

Splitting must also be deterministic. The same job submitted twice must produce
the same task plan, because retries and re-runs depend on it: a retried task
must process exactly the same slice of input as its failed predecessor.

- The planner records the partition plan (a list of input ranges with their
  hashes) in the job state, so any task can be re-derived and the job can be
  resumed from partial progress.
- Skew detection is a runtime monitoring signal: the planner compares actual
  task durations after the run and re-partitions inputs whose tasks deviate
  wildly from the median.

### How do you handle retries and failures?

Failures are the default case, not the exception, at batch scale: with thousands
of tasks running simultaneously, hardware, network, and code failures occur
during every large run.

- The framework treats every task as atomic — it either completes and its output
  is committed, or it is retried.
- When a worker dies, its in-flight tasks return to the queue and are picked up
  by other workers.
- When a task fails (the worker reported an error), a retry handler re-queues it
  with a bounded attempt count and exponential backoff.
- Beyond the attempt budget, the task is parked as failed rather than retried
  forever.

The crucial detail is failure attribution: the framework must distinguish a task
that died before writing output from one that died after writing it.

- If the framework blindly re-runs both, the duplicate output can double-count.
- This is solved with atomic output commits — each task writes to a temporary
  path and renames into place as the final commit, so the framework detects
  completion by the presence of the committed marker.
- A task whose committed output exists is not re-run even if it later crashed,
  and a task that crashed early is safely re-run because its output never
  committed.

Job-level failures are handled differently from task-level failures.

- A transient outage that hits many tasks at once is a signal, not a coincidence
  — the framework's retry policy backs off globally rather than hammering the
  recovering dependency.
- If the planner itself fails, the job resumes from the last recorded state
  because the partition plan is persisted.
- A job that exceeds its failure-rate threshold moves to a failed state with a
  clear report, and operators either fix the input and retry, or restart the job
  from its checkpoints, rather than letting it run half-heartedly to a
  misleading "success".

### How do you schedule and monitor jobs?

Scheduling answers two questions: when should a job run, and what should run
when there is contention.

- Time-based scheduling (cron-like) covers recurring workloads like daily
  aggregations; dependency-based scheduling covers pipelines where a job runs
  when its inputs or upstream jobs complete.
- The scheduler holds both and emits ready jobs.
- Contention is the real scheduler problem: if every hourly job fires at the top
  of the hour, the cluster peaks and idles.
- The design smooths this with offsets, priorities, and quotas per tenant so a
  misbehaving team cannot starve the pipeline, plus queue depth visibility so
  operators can move batch windows.

Monitoring is state-machine based.

- Every job tracks through submitted, scheduled, running, retrying, succeeded,
  and failed states, with timestamps on every transition, and the framework
  stores this in the job database.
- Progress is measured per task: completed tasks over total tasks, plus a
  throughput signal (records processed per second) and a lag signal (how far
  behind the job's target completion time it is).
- The combination of state, progress, and rate lets an operator answer the two
  questions that matter: is this job stuck, and will it finish on time?

Monitoring is not just dashboards — it is the retry and scaling brain.

- The monitor detects hung tasks (no heartbeat for a threshold period) and
  re-queues them, and it detects stragglers and either reruns them on a faster
  worker or scales up the worker pool mid-job.
- Alerts fire on state changes that need humans (job failed, retry budget
  exhausted, SLA breach) but not on routine state churn, to keep the on-call
  signal clean.
- Every run records the input hash, output location, and task counts, so after a
  bad job the first question — "what exactly did this job touch?" — has a
  precise answer.

### How do you make jobs idempotent?

Idempotency means a job can be run twice (or a task re-run after a partial
failure) and the result is the same as running it once.

- Batch systems need this because retries and re-runs are routine, and a
  non-idempotent job turns a harmless retry into double-counted revenue or
  duplicated writes.
- The first layer is deterministic inputs: each job run carries a stable run id,
  and every output is keyed by the input record's identity, so processing the
  same record twice targets the same output slot instead of appending a second
  copy.

The second layer is the commit model described with retries.

- Task output is written to a staging location and atomically committed by
  rename or by a metadata transaction.
- If a task is re-run, its commit is a no-op — the framework detects the
  committed output and skips the recomputation.
- For stateful downstreams, the output carries a watermark (the input range it
  covers and the run id), so a consumer that applies the output can reject a
  stale or duplicate application.
- This is the at-least-once execution, exactly-once-effect pattern, and it is
  what makes retries safe.

The final layer is job-level re-run semantics.

- A job that failed after writing 80 percent of its outputs must resume, not
  restart from zero — the framework records per-task completion in the job
  state, and on re-run only incomplete tasks execute.
- Conversely, a job whose logic was wrong (not a failure but a bug) must be
  re-run cleanly over the whole input, which is why the job can also be told to
  ignore prior outputs and process everything again into a fresh output set.
- Both paths require outputs that are replaceable by run id, which is why
  idempotency is a design constraint of the output store, not just of the task
  code.

## Source

```text
title: Batch Processing
node source: Data Sources [icon=cloud]
node app: Job Console [icon=browser]
node gateway: API Gateway [icon=server]
node scheduler: Job Scheduler [icon=compute]
node plan: Job Planner [icon=compute]
node worker: Worker Pool [icon=worker]
node queue: Task Queue [icon=queue]
node output: Output Store [cylinder, icon=file]
node retry: Retry Handler [icon=cache]
node monitor: Monitoring [icon=compute]
node db: Jobs DB [cylinder, icon=database]

edge source -> app: input
edge app -> gateway: submit
edge gateway -> scheduler: queue
edge scheduler -> plan: split
edge plan -> queue: tasks
edge queue -> worker: execute
edge worker -> output: write
edge worker -> retry: fail
edge retry -> queue: retry
edge worker -> monitor: progress
edge scheduler -> db: state
```

## Q&A

### Q: Design a batch processing framework

**A:** A batch processing framework runs large, well-defined computations over data
that is too big for a single machine to handle in one pass.

- The core idea is divide and conquer: a job is split into many independent
  tasks, each task runs on a worker, and results are written to an output store.
- The framework owns the hard parts — scheduling, task distribution, retries,
  and monitoring — so an application developer writes a task function and
  declares its inputs, not a distributed system.

The architecture has four roles.

- A job console lets operators submit and inspect jobs.
- A job scheduler accepts submissions, tracks state, and decides which jobs run
  when.
- A job planner reads a job's input and splits it into tasks, computing the
  partition plan.
- A worker pool executes tasks pulled from a task queue, writing outputs and
  reporting progress.
- In the source diagram, this is the full loop: the console submits to the
  scheduler, the planner splits work into a task queue, workers execute and
  write outputs, a retry handler catches failures, and monitoring tracks
  progress against the job database.

The framework's contract is about what jobs can assume.

- Tasks are embarrassingly parallel — they must not depend on each other's
  runtime state, only on their own slice of input.
- Workers are interchangeable and can die at any moment, so tasks must be safely
  retryable on a different machine.
- Jobs are identified by a stable id, and every state transition is recorded so
  an operator can explain what a job did.
- Given that contract, the framework delivers scale by parallelizing tasks and
  reliability by retrying them.

### Q: How do you split work into parallel tasks?

**A:** Splitting work is a planning problem: the planner must turn a job's inputs into
a set of tasks that (a) cover the input completely, (b) overlap as little as
possible, and (c) distribute load evenly across workers.

- The simplest correct split is by partition key: hash or range-partition the
  input records, and give each partition to one task.
- Range partitioning groups related records (all events for one user) which is
  great for per-entity computations but risks skew; hash partitioning spreads
  uniformly but scatters related records.
- The planner often uses range on the natural key and lets the worker re-group
  within a task.

The unit of split is the chunk, and chunk size is the tuning knob.

- Chunks that are too small create scheduling overhead (millions of tiny tasks);
  chunks that are too large cause stragglers — one slow task holding up a whole
  job.
- The planner therefore targets a chunk duration, not a byte count: it samples
  the input, estimates throughput per record, and sizes chunks so each task runs
  for roughly the same few minutes.
- The number of tasks is chosen against the worker pool size and data size, with
  the planner over-partitioning slightly so no worker idles while stragglers
  finish.

Splitting must also be deterministic. The same job submitted twice must produce
the same task plan, because retries and re-runs depend on it: a retried task
must process exactly the same slice of input as its failed predecessor.

- The planner records the partition plan (a list of input ranges with their
  hashes) in the job state, so any task can be re-derived and the job can be
  resumed from partial progress.
- Skew detection is a runtime monitoring signal: the planner compares actual
  task durations after the run and re-partitions inputs whose tasks deviate
  wildly from the median.

### Q: How do you handle retries and failures?

**A:** Failures are the default case, not the exception, at batch scale: with thousands
of tasks running simultaneously, hardware, network, and code failures occur
during every large run.

- The framework treats every task as atomic — it either completes and its output
  is committed, or it is retried.
- When a worker dies, its in-flight tasks return to the queue and are picked up
  by other workers.
- When a task fails (the worker reported an error), a retry handler re-queues it
  with a bounded attempt count and exponential backoff.
- Beyond the attempt budget, the task is parked as failed rather than retried
  forever.

The crucial detail is failure attribution: the framework must distinguish a task
that died before writing output from one that died after writing it.

- If the framework blindly re-runs both, the duplicate output can double-count.
- This is solved with atomic output commits — each task writes to a temporary
  path and renames into place as the final commit, so the framework detects
  completion by the presence of the committed marker.
- A task whose committed output exists is not re-run even if it later crashed,
  and a task that crashed early is safely re-run because its output never
  committed.

Job-level failures are handled differently from task-level failures.

- A transient outage that hits many tasks at once is a signal, not a coincidence
  — the framework's retry policy backs off globally rather than hammering the
  recovering dependency.
- If the planner itself fails, the job resumes from the last recorded state
  because the partition plan is persisted.
- A job that exceeds its failure-rate threshold moves to a failed state with a
  clear report, and operators either fix the input and retry, or restart the job
  from its checkpoints, rather than letting it run half-heartedly to a
  misleading "success".

### Q: How do you schedule and monitor jobs?

**A:** Scheduling answers two questions: when should a job run, and what should run
when there is contention.

- Time-based scheduling (cron-like) covers recurring workloads like daily
  aggregations; dependency-based scheduling covers pipelines where a job runs
  when its inputs or upstream jobs complete.
- The scheduler holds both and emits ready jobs.
- Contention is the real scheduler problem: if every hourly job fires at the top
  of the hour, the cluster peaks and idles.
- The design smooths this with offsets, priorities, and quotas per tenant so a
  misbehaving team cannot starve the pipeline, plus queue depth visibility so
  operators can move batch windows.

Monitoring is state-machine based.

- Every job tracks through submitted, scheduled, running, retrying, succeeded,
  and failed states, with timestamps on every transition, and the framework
  stores this in the job database.
- Progress is measured per task: completed tasks over total tasks, plus a
  throughput signal (records processed per second) and a lag signal (how far
  behind the job's target completion time it is).
- The combination of state, progress, and rate lets an operator answer the two
  questions that matter: is this job stuck, and will it finish on time?

Monitoring is not just dashboards — it is the retry and scaling brain.

- The monitor detects hung tasks (no heartbeat for a threshold period) and
  re-queues them, and it detects stragglers and either reruns them on a faster
  worker or scales up the worker pool mid-job.
- Alerts fire on state changes that need humans (job failed, retry budget
  exhausted, SLA breach) but not on routine state churn, to keep the on-call
  signal clean.
- Every run records the input hash, output location, and task counts, so after a
  bad job the first question — "what exactly did this job touch?" — has a
  precise answer.

### Q: How do you make jobs idempotent?

**A:** Idempotency means a job can be run twice (or a task re-run after a partial
failure) and the result is the same as running it once.

- Batch systems need this because retries and re-runs are routine, and a
  non-idempotent job turns a harmless retry into double-counted revenue or
  duplicated writes.
- The first layer is deterministic inputs: each job run carries a stable run id,
  and every output is keyed by the input record's identity, so processing the
  same record twice targets the same output slot instead of appending a second
  copy.

The second layer is the commit model described with retries.

- Task output is written to a staging location and atomically committed by
  rename or by a metadata transaction.
- If a task is re-run, its commit is a no-op — the framework detects the
  committed output and skips the recomputation.
- For stateful downstreams, the output carries a watermark (the input range it
  covers and the run id), so a consumer that applies the output can reject a
  stale or duplicate application.
- This is the at-least-once execution, exactly-once-effect pattern, and it is
  what makes retries safe.

The final layer is job-level re-run semantics.

- A job that failed after writing 80 percent of its outputs must resume, not
  restart from zero — the framework records per-task completion in the job
  state, and on re-run only incomplete tasks execute.
- Conversely, a job whose logic was wrong (not a failure but a bug) must be
  re-run cleanly over the whole input, which is why the job can also be told to
  ignore prior outputs and process everything again into a fresh output set.
- Both paths require outputs that are replaceable by run id, which is why
  idempotency is a design constraint of the output store, not just of the task
  code.

## Source

```text
title: Batch Processing
node source: Data Sources [icon=cloud]
node app: Job Console [icon=browser]
node gateway: API Gateway [icon=server]
node scheduler: Job Scheduler [icon=compute]
node plan: Job Planner [icon=compute]
node worker: Worker Pool [icon=worker]
node queue: Task Queue [icon=queue]
node output: Output Store [cylinder, icon=file]
node retry: Retry Handler [icon=cache]
node monitor: Monitoring [icon=compute]
node db: Jobs DB [cylinder, icon=database]

edge source -> app: input
edge app -> gateway: submit
edge gateway -> scheduler: queue
edge scheduler -> plan: split
edge plan -> queue: tasks
edge queue -> worker: execute
edge worker -> output: write
edge worker -> retry: fail
edge retry -> queue: retry
edge worker -> monitor: progress
edge scheduler -> db: state
```
