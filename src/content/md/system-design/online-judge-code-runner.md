# Online Judge — Code Runner

Design an online judge / code runner

**Difficulty:** Hard

**Tags:** queue, security

## Functional Requirements

- an online judge / code runner
- execute untrusted code safely?
- isolate and limit resources?
- queue and parallelize submissions?
- detect cheating and plagiarism?

## Non-Functional Requirements

- Never run user code directly on the judge host's kernel.

- Execute inside a hardened sandbox, and pick the isolation primitive by threat
  model.
- Options include `gVisor` (a user-space kernel that intercepts syscalls),
  `Firecracker` microVMs (hardware isolation with a minimal guest), `nsjail`,
  and `seccomp-bpf` system-call filtering — the common principle is
  deny-by-default: only the syscalls a program legitimately needs are allowed,
  and everything else (`mount`, `ptrace`, `kexec`, privileged network
  operations) is blocked.
- Spawn a fresh sandbox per run and kill it after the time or memory limit;
  never reuse a sandbox across users or submissions, because residual state is a
  contamination and escape risk.

Isolate the environment completely: no access to the host filesystem (only a
private tmpfs), no outbound network, no shared state, and execution under a
fixed, unprivileged user with dropped capabilities.

- Treat the compile step as untrusted too — compilers consume user-controlled
  source — and run it under the same sandbox.
- Apply defense in depth: if the sandbox fails, the run fails loudly rather than
  degrading into an unsafe fallback.
- For very high stakes, run each submission in a separate microVM with a minimal
  guest image and no shared kernel, accepting higher startup cost in exchange
  for strong isolation.
- The rule is that a compromised sandbox must not compromise the judge.

Operational hardening matters as much as the initial choice of primitive.

- Keep the sandbox runtime pinned and audited, since a syscall-filter or microVM
  escape is a full remote-code-execution incident; treat sandbox updates as
  security releases with rollback.
- Add a capability review loop — re-run representative submissions against a new
  sandbox version before promoting it, because a too-strict sandbox that breaks
  valid solutions is as harmful as a too-loose one that risks escape.
- And quarantine anything anomalous: if a submission triggers an unusual syscall
  pattern or an attempted escape, capture it, kill the sandbox, and alert rather
  than continuing..
- The judge needs throughput on bursty workloads — the moment a contest starts,
  everyone submits at once.

- The `Submission Queue` (e.g., `Kafka`- or `Redis`-backed) absorbs the burst,
  and a pool of `Sandbox Runner` instances consume with bounded concurrency.
- Each runner executes one submission at a time, because concurrent jobs on one
  machine share CPU and corrupt time measurements — wall-clock limits become
  meaningless under contention.
- Distribute load by problem shape: fast small problems queue to cheap capacity,
  while heavy or C++/Rust compile jobs route to beefy nodes.

Use a consumer group with work-stealing semantics and pre-scale: when a contest
starts, spin up more runner instances ahead of time based on queue depth, then
scale back down.

- Priorities matter — contest submissions jump the line, and per-user in-flight
  bounds prevent one person from flooding the pool.
- Within a submission, test cases can run in parallel across cores, but keep
  total wall-clock deterministic by running cases in fixed order on the same
  runner.
- Persist the submission and verdict transactionally so a runner crash never
  loses a result; at-least-once delivery plus idempotent verdict writing (keyed
  by `run_id`) makes retries safe.
- The design goal is that a burst drains in minutes, not hours, and every
  submission gets a verdict.

Also engineer for contest-specific bursts.

- Pre-warm compilers and language runtimes so the common "compile hello world"
  path is a fast fork rather than a cold start; queue submissions by submission
  time within a contest so verdicts are deterministic in arrival order; and
  scale the pool down between contests to control cost.
- The `Verifier` is stateless and horizontally scalable, so its only concern is
  keeping up with the runners.
- Monitor queue depth, per-language compile time, and runner utilization so a
  bottleneck is visible while the contest is live, not after..
- Detect plagiarism on the submission corpus and anomalies in contest behavior.

- For plagiarism, compare each submission against the whole problem's submission
  history and the open internet.
- Normalize the source first — strip whitespace, comments, and formatting;
  rename identifiers and variables — then compute similarity using MOSS-style
  token hashing: chop the token stream into overlapping k-grams, hash them, and
  measure the overlap (Jaccard) between submissions.
- Flag pairs above a threshold for human review, and be tolerant of legitimately
  similar boilerplate (imports, template headers).
- This catches the classic copy-then-rename attack because identifier renaming
  is stripped before comparison.

Beyond text matching, catch _behavioral_ cheating: a submission that passes
suspiciously fast, identical wrong-answer fingerprints (same failing test, same
incorrect output pattern), and submissions that replicate another user's unique
coding quirks — variable names, comment style, idiosyncratic idioms.

- Also watch infrastructure signals: multiple accounts from the same IP or
  device submitting at contest start, or re-submits that mirror a live leader's
  code.
- Store submission snapshots plus metadata (user, time, language, length,
  verdict) in the `Result Store` to power these checks offline.
- The trade-off is false positives — trivial solutions legitimately look alike —
  so combine deterministic token matching with manual review and run checks
  asynchronously after contests, never on the latency-critical run path.

Make the checks proportionate and transparent.

- Plagiarism thresholds need calibration per language — boilerplate-heavy
  languages legitimately share more — and the flagged-pair report must show the
  exact similar segments so a human can judge intent quickly.
- Track the disposition of flagged cases to tune the thresholds over time.
- And keep the checks time-bounded: full corpus similarity after every contest
  is expensive, so batch it, compare against a rolling fingerprint index of past
  submissions, and run the expensive full-document pass only on near-matches.
- Contestants should also be told the policy up front; detection works best when
  it is a deterrent and an audit, not a whack-a-mole.

## Source

````text
title: Online Judge
node user: User [round, icon=browser]
node app: Problem App [icon=browser]
node api: Judge API [icon=server]
node problem: Problem Store [icon=file]
node queue: Submission Queue [icon=queue]
node runner: Sandbox Runner [icon=compute]
node checker: Verifier [icon=search]
node results: Result Store [cylinder, icon=database]
node stats: Leaderboard [icon=cache]
node notify: Notifications [icon=message]

edge user -> app: submit
edge app -> api: submit
edge api -> problem: fetch
edge api -> queue: enqueue
edge queue -> runner: execute
edge runner -> checker: verify
edge checker -> results: save
edge results -> api: verdict
edge api -> notify: result
edge results -> stats: update
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Online Judge
user: User
app: Problem App
api: Judge API
problem: Problem Store
queue: Submission Queue
runner: Sandbox Runner
checker: Verifier
results: Result Store
stats: Leaderboard
notify: Notifications

user ─► app ─► submit
app ─► api ─► submit
api ─► problem ─► fetch
api ─► queue ─► enqueue
queue ─► runner ─► execute
runner ─► checker ─► verify
checker ─► results ─► save
results ─► api ─► verdict
api ─► notify ─► result
results ─► stats ─► update
````

## Design

### Design an online judge / code runner

A user submits code through the `Problem App` to the `Judge API`, which fetches
the problem's test suite from the `Problem Store` and enqueues a submission into
the `Submission Queue`.

- A `Sandbox Runner` claims the job, compiles and executes the code inside an
  isolated sandbox per test case, and hands outputs to the `Verifier`, which
  compares them against expected results and derives a verdict — Accepted, Wrong
  Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error.
- The verdict is saved to the `Result Store`, returned to the user via the API,
  pushed through `Notifications`, and rolled into the `Leaderboard`.

The dominant concern is security: you execute arbitrary, untrusted programs, so
every line of the run path must be designed against escape and resource abuse.

- Everything else — parallelism, verdict accuracy, fairness across contestants —
  is shaped by that constraint.
- The pipeline is async by design: the user submits and polls, while
  compile-and-run work happens off the request path, so the `Submission Queue`
  decouples bursty submissions (a contest start floods the judge) from compute
  capacity.
- The runner pool is the scarce resource, the queue is the buffer, and the
  result store is the durable record — the user never blocks on a cold compile,
  and no verdict is lost if a runner crashes mid-job.

Fairness is a close second concern.

- All contestants must run under identical environments — same compiler
  versions, same time and memory limits, same machine characteristics — so a
  verdict depends on the code, not the runner.
- Deterministic execution (fixed test order, no load sharing on a runner
  mid-submission) and standardized limits per problem keep the contest
  trustworthy.
- Finally, observability: record per-test-case timing and memory, because
  contestants and problem setters both need the same evidence to diagnose a
  borderline time-limit verdict.

### How do you execute untrusted code safely?

Never run user code directly on the judge host's kernel.

- Execute inside a hardened sandbox, and pick the isolation primitive by threat
  model.
- Options include `gVisor` (a user-space kernel that intercepts syscalls),
  `Firecracker` microVMs (hardware isolation with a minimal guest), `nsjail`,
  and `seccomp-bpf` system-call filtering — the common principle is
  deny-by-default: only the syscalls a program legitimately needs are allowed,
  and everything else (`mount`, `ptrace`, `kexec`, privileged network
  operations) is blocked.
- Spawn a fresh sandbox per run and kill it after the time or memory limit;
  never reuse a sandbox across users or submissions, because residual state is a
  contamination and escape risk.

Isolate the environment completely: no access to the host filesystem (only a
private tmpfs), no outbound network, no shared state, and execution under a
fixed, unprivileged user with dropped capabilities.

- Treat the compile step as untrusted too — compilers consume user-controlled
  source — and run it under the same sandbox.
- Apply defense in depth: if the sandbox fails, the run fails loudly rather than
  degrading into an unsafe fallback.
- For very high stakes, run each submission in a separate microVM with a minimal
  guest image and no shared kernel, accepting higher startup cost in exchange
  for strong isolation.
- The rule is that a compromised sandbox must not compromise the judge.

Operational hardening matters as much as the initial choice of primitive.

- Keep the sandbox runtime pinned and audited, since a syscall-filter or microVM
  escape is a full remote-code-execution incident; treat sandbox updates as
  security releases with rollback.
- Add a capability review loop — re-run representative submissions against a new
  sandbox version before promoting it, because a too-strict sandbox that breaks
  valid solutions is as harmful as a too-loose one that risks escape.
- And quarantine anything anomalous: if a submission triggers an unusual syscall
  pattern or an attempted escape, capture it, kill the sandbox, and alert rather
  than continuing.

### How do you isolate and limit resources?

Resource limits are the contract with untrusted code: wall-clock time, CPU time,
memory, output size, and process count.

- Enforce time with a hard watchdog — SIGKILL at `time_limit + grace`, not just
  a SIGTERM, because a runaway process must be killed, not asked — and
  distinguish CPU time from wall time so I/O-heavy code cannot game the clock
  (the classic trick of sleeping instead of computing).
- Enforce memory with `RLIMIT_AS`/`RLIMIT_DATA` and cgroup memory limits so a
  `malloc` storm dies with a Memory Limit Exceeded verdict rather than
  OOM-killing neighbors on the host.
- Cap output by writing stdout through a bounded pipe that truncates at, say, 64
  MB — otherwise a submission that prints forever spins the disk and starves
  others.

Add a process-count limit (`RLIMIT_NPROC` plus clone restrictions) so code
cannot fork-bomb the runner, and put all limits on a fixed per-test-case budget
so a submission that exhausts one case cannot degrade the next.

- These limits are measured by the sandbox, never trusted to the code, and map
  directly to verdicts — TLE, MLE, OLE, RE — so a contestant always knows why a
  submission failed.
- Expose per-submission resource usage as metrics (CPU seconds, peak RSS, exit
  signal) so a leak in the runner is visible before it becomes an availability
  incident, and so problem setters can calibrate limits against real solutions.

Make the limits deterministic across the fleet.

- Runner machines should be homogeneous, or the limits calibrated per machine
  class, otherwise a submission times out on one runner and passes on another
  and contestants lose trust.
- Use a pre-run calibration harness — run a known solution set per machine and
  adjust grace periods — and record which runner a submission executed on along
  with its resource profile, so a disputed verdict can be audited.
- The limits should also be configurable per problem, because a 10-second
  brute-force problem and a 100-millisecond DP problem need different budgets;
  store limits in the `Problem Store` and pass them to the sandbox per job.

### How do you queue and parallelize submissions?

The judge needs throughput on bursty workloads — the moment a contest starts,
everyone submits at once.

- The `Submission Queue` (e.g., `Kafka`- or `Redis`-backed) absorbs the burst,
  and a pool of `Sandbox Runner` instances consume with bounded concurrency.
- Each runner executes one submission at a time, because concurrent jobs on one
  machine share CPU and corrupt time measurements — wall-clock limits become
  meaningless under contention.
- Distribute load by problem shape: fast small problems queue to cheap capacity,
  while heavy or C++/Rust compile jobs route to beefy nodes.

Use a consumer group with work-stealing semantics and pre-scale: when a contest
starts, spin up more runner instances ahead of time based on queue depth, then
scale back down.

- Priorities matter — contest submissions jump the line, and per-user in-flight
  bounds prevent one person from flooding the pool.
- Within a submission, test cases can run in parallel across cores, but keep
  total wall-clock deterministic by running cases in fixed order on the same
  runner.
- Persist the submission and verdict transactionally so a runner crash never
  loses a result; at-least-once delivery plus idempotent verdict writing (keyed
  by `run_id`) makes retries safe.
- The design goal is that a burst drains in minutes, not hours, and every
  submission gets a verdict.

Also engineer for contest-specific bursts.

- Pre-warm compilers and language runtimes so the common "compile hello world"
  path is a fast fork rather than a cold start; queue submissions by submission
  time within a contest so verdicts are deterministic in arrival order; and
  scale the pool down between contests to control cost.
- The `Verifier` is stateless and horizontally scalable, so its only concern is
  keeping up with the runners.
- Monitor queue depth, per-language compile time, and runner utilization so a
  bottleneck is visible while the contest is live, not after.

### How do you detect cheating and plagiarism?

Detect plagiarism on the submission corpus and anomalies in contest behavior.

- For plagiarism, compare each submission against the whole problem's submission
  history and the open internet.
- Normalize the source first — strip whitespace, comments, and formatting;
  rename identifiers and variables — then compute similarity using MOSS-style
  token hashing: chop the token stream into overlapping k-grams, hash them, and
  measure the overlap (Jaccard) between submissions.
- Flag pairs above a threshold for human review, and be tolerant of legitimately
  similar boilerplate (imports, template headers).
- This catches the classic copy-then-rename attack because identifier renaming
  is stripped before comparison.

Beyond text matching, catch _behavioral_ cheating: a submission that passes
suspiciously fast, identical wrong-answer fingerprints (same failing test, same
incorrect output pattern), and submissions that replicate another user's unique
coding quirks — variable names, comment style, idiosyncratic idioms.

- Also watch infrastructure signals: multiple accounts from the same IP or
  device submitting at contest start, or re-submits that mirror a live leader's
  code.
- Store submission snapshots plus metadata (user, time, language, length,
  verdict) in the `Result Store` to power these checks offline.
- The trade-off is false positives — trivial solutions legitimately look alike —
  so combine deterministic token matching with manual review and run checks
  asynchronously after contests, never on the latency-critical run path.

Make the checks proportionate and transparent.

- Plagiarism thresholds need calibration per language — boilerplate-heavy
  languages legitimately share more — and the flagged-pair report must show the
  exact similar segments so a human can judge intent quickly.
- Track the disposition of flagged cases to tune the thresholds over time.
- And keep the checks time-bounded: full corpus similarity after every contest
  is expensive, so batch it, compare against a rolling fingerprint index of past
  submissions, and run the expensive full-document pass only on near-matches.
- Contestants should also be told the policy up front; detection works best when
  it is a deterrent and an audit, not a whack-a-mole.

## Source

```text
title: Online Judge
node user: User [round, icon=browser]
node app: Problem App [icon=browser]
node api: Judge API [icon=server]
node problem: Problem Store [icon=file]
node queue: Submission Queue [icon=queue]
node runner: Sandbox Runner [icon=compute]
node checker: Verifier [icon=search]
node results: Result Store [cylinder, icon=database]
node stats: Leaderboard [icon=cache]
node notify: Notifications [icon=message]

edge user -> app: submit
edge app -> api: submit
edge api -> problem: fetch
edge api -> queue: enqueue
edge queue -> runner: execute
edge runner -> checker: verify
edge checker -> results: save
edge results -> api: verdict
edge api -> notify: result
edge results -> stats: update
```

## Q&A

### Q: Design an online judge / code runner

**A:** A user submits code through the `Problem App` to the `Judge API`, which fetches
the problem's test suite from the `Problem Store` and enqueues a submission into
the `Submission Queue`.

- A `Sandbox Runner` claims the job, compiles and executes the code inside an
  isolated sandbox per test case, and hands outputs to the `Verifier`, which
  compares them against expected results and derives a verdict — Accepted, Wrong
  Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error.
- The verdict is saved to the `Result Store`, returned to the user via the API,
  pushed through `Notifications`, and rolled into the `Leaderboard`.

The dominant concern is security: you execute arbitrary, untrusted programs, so
every line of the run path must be designed against escape and resource abuse.

- Everything else — parallelism, verdict accuracy, fairness across contestants —
  is shaped by that constraint.
- The pipeline is async by design: the user submits and polls, while
  compile-and-run work happens off the request path, so the `Submission Queue`
  decouples bursty submissions (a contest start floods the judge) from compute
  capacity.
- The runner pool is the scarce resource, the queue is the buffer, and the
  result store is the durable record — the user never blocks on a cold compile,
  and no verdict is lost if a runner crashes mid-job.

Fairness is a close second concern.

- All contestants must run under identical environments — same compiler
  versions, same time and memory limits, same machine characteristics — so a
  verdict depends on the code, not the runner.
- Deterministic execution (fixed test order, no load sharing on a runner
  mid-submission) and standardized limits per problem keep the contest
  trustworthy.
- Finally, observability: record per-test-case timing and memory, because
  contestants and problem setters both need the same evidence to diagnose a
  borderline time-limit verdict.

### Q: How do you execute untrusted code safely?

**A:** Never run user code directly on the judge host's kernel.

- Execute inside a hardened sandbox, and pick the isolation primitive by threat
  model.
- Options include `gVisor` (a user-space kernel that intercepts syscalls),
  `Firecracker` microVMs (hardware isolation with a minimal guest), `nsjail`,
  and `seccomp-bpf` system-call filtering — the common principle is
  deny-by-default: only the syscalls a program legitimately needs are allowed,
  and everything else (`mount`, `ptrace`, `kexec`, privileged network
  operations) is blocked.
- Spawn a fresh sandbox per run and kill it after the time or memory limit;
  never reuse a sandbox across users or submissions, because residual state is a
  contamination and escape risk.

Isolate the environment completely: no access to the host filesystem (only a
private tmpfs), no outbound network, no shared state, and execution under a
fixed, unprivileged user with dropped capabilities.

- Treat the compile step as untrusted too — compilers consume user-controlled
  source — and run it under the same sandbox.
- Apply defense in depth: if the sandbox fails, the run fails loudly rather than
  degrading into an unsafe fallback.
- For very high stakes, run each submission in a separate microVM with a minimal
  guest image and no shared kernel, accepting higher startup cost in exchange
  for strong isolation.
- The rule is that a compromised sandbox must not compromise the judge.

Operational hardening matters as much as the initial choice of primitive.

- Keep the sandbox runtime pinned and audited, since a syscall-filter or microVM
  escape is a full remote-code-execution incident; treat sandbox updates as
  security releases with rollback.
- Add a capability review loop — re-run representative submissions against a new
  sandbox version before promoting it, because a too-strict sandbox that breaks
  valid solutions is as harmful as a too-loose one that risks escape.
- And quarantine anything anomalous: if a submission triggers an unusual syscall
  pattern or an attempted escape, capture it, kill the sandbox, and alert rather
  than continuing.

### Q: How do you isolate and limit resources?

**A:** Resource limits are the contract with untrusted code: wall-clock time, CPU time,
memory, output size, and process count.

- Enforce time with a hard watchdog — SIGKILL at `time_limit + grace`, not just
  a SIGTERM, because a runaway process must be killed, not asked — and
  distinguish CPU time from wall time so I/O-heavy code cannot game the clock
  (the classic trick of sleeping instead of computing).
- Enforce memory with `RLIMIT_AS`/`RLIMIT_DATA` and cgroup memory limits so a
  `malloc` storm dies with a Memory Limit Exceeded verdict rather than
  OOM-killing neighbors on the host.
- Cap output by writing stdout through a bounded pipe that truncates at, say, 64
  MB — otherwise a submission that prints forever spins the disk and starves
  others.

Add a process-count limit (`RLIMIT_NPROC` plus clone restrictions) so code
cannot fork-bomb the runner, and put all limits on a fixed per-test-case budget
so a submission that exhausts one case cannot degrade the next.

- These limits are measured by the sandbox, never trusted to the code, and map
  directly to verdicts — TLE, MLE, OLE, RE — so a contestant always knows why a
  submission failed.
- Expose per-submission resource usage as metrics (CPU seconds, peak RSS, exit
  signal) so a leak in the runner is visible before it becomes an availability
  incident, and so problem setters can calibrate limits against real solutions.

Make the limits deterministic across the fleet.

- Runner machines should be homogeneous, or the limits calibrated per machine
  class, otherwise a submission times out on one runner and passes on another
  and contestants lose trust.
- Use a pre-run calibration harness — run a known solution set per machine and
  adjust grace periods — and record which runner a submission executed on along
  with its resource profile, so a disputed verdict can be audited.
- The limits should also be configurable per problem, because a 10-second
  brute-force problem and a 100-millisecond DP problem need different budgets;
  store limits in the `Problem Store` and pass them to the sandbox per job.

### Q: How do you queue and parallelize submissions?

**A:** The judge needs throughput on bursty workloads — the moment a contest starts,
everyone submits at once.

- The `Submission Queue` (e.g., `Kafka`- or `Redis`-backed) absorbs the burst,
  and a pool of `Sandbox Runner` instances consume with bounded concurrency.
- Each runner executes one submission at a time, because concurrent jobs on one
  machine share CPU and corrupt time measurements — wall-clock limits become
  meaningless under contention.
- Distribute load by problem shape: fast small problems queue to cheap capacity,
  while heavy or C++/Rust compile jobs route to beefy nodes.

Use a consumer group with work-stealing semantics and pre-scale: when a contest
starts, spin up more runner instances ahead of time based on queue depth, then
scale back down.

- Priorities matter — contest submissions jump the line, and per-user in-flight
  bounds prevent one person from flooding the pool.
- Within a submission, test cases can run in parallel across cores, but keep
  total wall-clock deterministic by running cases in fixed order on the same
  runner.
- Persist the submission and verdict transactionally so a runner crash never
  loses a result; at-least-once delivery plus idempotent verdict writing (keyed
  by `run_id`) makes retries safe.
- The design goal is that a burst drains in minutes, not hours, and every
  submission gets a verdict.

Also engineer for contest-specific bursts.

- Pre-warm compilers and language runtimes so the common "compile hello world"
  path is a fast fork rather than a cold start; queue submissions by submission
  time within a contest so verdicts are deterministic in arrival order; and
  scale the pool down between contests to control cost.
- The `Verifier` is stateless and horizontally scalable, so its only concern is
  keeping up with the runners.
- Monitor queue depth, per-language compile time, and runner utilization so a
  bottleneck is visible while the contest is live, not after.

### Q: How do you detect cheating and plagiarism?

**A:** Detect plagiarism on the submission corpus and anomalies in contest behavior.

- For plagiarism, compare each submission against the whole problem's submission
  history and the open internet.
- Normalize the source first — strip whitespace, comments, and formatting;
  rename identifiers and variables — then compute similarity using MOSS-style
  token hashing: chop the token stream into overlapping k-grams, hash them, and
  measure the overlap (Jaccard) between submissions.
- Flag pairs above a threshold for human review, and be tolerant of legitimately
  similar boilerplate (imports, template headers).
- This catches the classic copy-then-rename attack because identifier renaming
  is stripped before comparison.

Beyond text matching, catch _behavioral_ cheating: a submission that passes
suspiciously fast, identical wrong-answer fingerprints (same failing test, same
incorrect output pattern), and submissions that replicate another user's unique
coding quirks — variable names, comment style, idiosyncratic idioms.

- Also watch infrastructure signals: multiple accounts from the same IP or
  device submitting at contest start, or re-submits that mirror a live leader's
  code.
- Store submission snapshots plus metadata (user, time, language, length,
  verdict) in the `Result Store` to power these checks offline.
- The trade-off is false positives — trivial solutions legitimately look alike —
  so combine deterministic token matching with manual review and run checks
  asynchronously after contests, never on the latency-critical run path.

Make the checks proportionate and transparent.

- Plagiarism thresholds need calibration per language — boilerplate-heavy
  languages legitimately share more — and the flagged-pair report must show the
  exact similar segments so a human can judge intent quickly.
- Track the disposition of flagged cases to tune the thresholds over time.
- And keep the checks time-bounded: full corpus similarity after every contest
  is expensive, so batch it, compare against a rolling fingerprint index of past
  submissions, and run the expensive full-document pass only on near-matches.
- Contestants should also be told the policy up front; detection works best when
  it is a deterrent and an audit, not a whack-a-mole.

## Source

```text
title: Online Judge
node user: User [round, icon=browser]
node app: Problem App [icon=browser]
node api: Judge API [icon=server]
node problem: Problem Store [icon=file]
node queue: Submission Queue [icon=queue]
node runner: Sandbox Runner [icon=compute]
node checker: Verifier [icon=search]
node results: Result Store [cylinder, icon=database]
node stats: Leaderboard [icon=cache]
node notify: Notifications [icon=message]

edge user -> app: submit
edge app -> api: submit
edge api -> problem: fetch
edge api -> queue: enqueue
edge queue -> runner: execute
edge runner -> checker: verify
edge checker -> results: save
edge results -> api: verdict
edge api -> notify: result
edge results -> stats: update
```
