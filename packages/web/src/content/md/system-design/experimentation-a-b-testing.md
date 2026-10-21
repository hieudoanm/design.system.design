# Experimentation — A/B Testing

Design an A/B testing platform

**Difficulty:** Medium

**Tags:** experimentation, time-series

## Functional Requirements

- an A/B testing platform
- assign users to variants consistently?
- ensure statistical validity across metrics?
- run experiments at scale without pollution?
- detect and stop bad experiments early?

## Non-Functional Requirements

- The platform has two halves that must stay decoupled: a real-time decision path
  that tells each client which variant to show, and an offline analysis path that
  proves whether the variant caused an effect.

- On the decision path, the app SDK calls a flag API, which asks an assignment
  service to bucket the user into a variant.
- Assignment is deterministic — the same user always receives the same variant —
  so results stay stable across sessions and devices.
- Variant configuration and traffic splits come from an allocation store that
  the experiment UI persists to, and an event collector records which variant
  each user saw.

On the analysis path, an event collector ingests exposure and outcome events,
and a metrics pipeline aggregates them into per-variant summaries.

- The analysis engine runs statistical tests, writes conclusions plus guardrail
  metrics to a results store, and alerts when an experiment crosses stop or
  restart thresholds.

The separation of serving from analysis is deliberate:

- A bad experiment can be killed instantly by flipping the flag, while analysis
  of the collected data continues independently.
- No shared mutable state couples the paths, so serving latency, analysis
  latency, and experiment management each scale and fail on their own.
- The data model anchors both paths: exposures and outcomes are keyed by
  (experiment_id, variant, user_id, timestamp), and the results store keeps
  per-variant summaries plus references to the raw events so any published
  conclusion can be audited.
- Both paths are horizontally scalable and independently deployable, which keeps
  the experiment backlog small even as the product team runs dozens of
  concurrent tests..
- Assignment is a pure function of a stable key — typically the user ID or a
  per-experiment salt-mixed identifier — so any server computes the same answer
  without a round trip or a shared database.

- The standard scheme hashes the key (e.g., `SHA256(user_id || salt)`), takes a
  64-bit slice, and maps that value into a bucket range.
- Each experiment declares a traffic split, and every variant owns an interval
  of the hash space; the user's hash lands in exactly one interval, which is
  their variant.
- The per-experiment salt prevents the same user from always landing in the same
  group and makes assignments unpredictable to anyone gaming the system.

Persistence is optional but valuable:

- The allocation store can record the assignment so analysis can join exposures
  to outcomes even if the user later switches devices.
- When a split changes mid-experiment, the system must decide whether to
  re-bucket or to freeze existing users — freezing (reusing the stored
  assignment) avoids contaminating users who already saw the old variant, which
  is why most mature platforms freeze on split changes.
- The SDK caches the result, and the flag API can serve a coarse-grained bucket
  from a local cache, so assignment costs microseconds.
- Consistency comes from the deterministic hash function itself, not from
  locking, which is what lets assignment scale to millions of users per second.
- One subtlety: the hash function and salt are versioned, so changing them
  requires a coordinated re-randomization rather than silently reassigning
  existing users mid-experiment..
- Validity starts before data is collected.

- Every experiment pre-registers a primary metric and a set of guardrail
  metrics, and the platform computes the sample size needed to detect the
  minimum meaningful effect (MDE) at the chosen power and significance level.
- Testing then runs on a fixed horizon, or with sequential testing that bounds
  error as data streams in — either way the platform prevents the classic
  mistake of peeking at the p-value repeatedly and declaring victory at the
  first dip.
- Because an experiment usually measures many metrics, per-metric adjustments
  (Bonferroni or a false-discovery-rate control) keep the overall false-positive
  rate bounded.

The statistics must match the metric's shape.

- Simple averages use a t-test, ordinal outcomes use Mann–Whitney, and ratio
  metrics like revenue-per-user need the delta method or bootstrap to build
  valid confidence intervals.
- Variance reduction keeps experiments fast and cheap: CUPED regresses the
  outcome on the pre-experiment value of the same metric, shrinking noise
  without biasing the estimate, which cuts the required sample size
  substantially.
- The engine also checks assignment balance — if bucketing is skewed by
  geography or device, it can re-run with stratified randomization — and
  guardrail metrics are analyzed with the same rigor as the primary, so a
  conversion win is never hiding a latency or revenue regression.
- The engine also reports confidence intervals, not just p-values, so
  stakeholders see the magnitude of an effect and its uncertainty, and it flags
  when the executed design deviates from the pre-registered test, forcing a
  documented decision rather than silent drift..
- Experiments interfere when the same user is assigned to two experiments that
  touch the same metric.

- The dominant fix is multi-layer, orthogonal bucketing: each layer (UI,
  ranking, pricing) uses its own independent hash function, so a user's
  assignment in one layer is statistically independent of their assignment in
  another.
- Because orthogonal layers use independent salts over the same user base,
  hundreds of experiments can run concurrently without correlated exposure.
- On top of that, the platform maintains a metric-exclusivity map that blocks
  two experiments from modifying the same metric on the same population — a
  guard against interference that orthogonality alone cannot provide.

Some interference cannot be bucketed away.

- For experiments where one user's variant affects another — marketplaces,
  social features, network effects — individual randomization is statistically
  invalid, so the platform supports cluster randomization by geographic or
  network partition and analyzes with cluster-robust estimators.
- Novelty and learning effects are handled by ramp schedules: traffic is ramped
  gradually and a washout period is excluded from analysis so early user
  behavior does not contaminate the steady-state estimate.
- Finally, the platform monitors "pollution" operationally — exposures served
  from stale flag config, variant allocations that do not sum to 100%, and
  unusual correlation across concurrent experiments all trip alerts before they
  corrupt a conclusion.
- Interference checks are also explicit: the platform can cross-tabulate a
  subset of users across overlapping experiments and compare per-cell effects,
  quarantining the later experiment when a conflict is confirmed.
- This combination — orthogonal layers plus explicit conflict resolution — is
  what lets the platform scale to many concurrent experiments without the
  results drifting apart..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Experimentation
app: App SDK
api: Flag API
assign: Assignment Service
alloc: Allocation Store
event: Event Collector
metrics: Metrics Pipeline
analyze: Analysis Engine
results: Results Store
ui: Experiment UI
notify: Alerts

app ─► api ─► get variants
api ─► assign ─► bucket
assign ─► alloc ─► lookup
app ─► event ─► log
event ─► metrics ─► aggregate
metrics ─► analyze ─► test
analyze ─► results ─► save
ui ─► api ─► create
api ─► alloc ─► persist
analyze ─► notify ─► alert
```

## Design

### Design an A/B testing platform

The platform has two halves that must stay decoupled: a real-time decision path
that tells each client which variant to show, and an offline analysis path that
proves whether the variant caused an effect.

- On the decision path, the app SDK calls a flag API, which asks an assignment
  service to bucket the user into a variant.
- Assignment is deterministic — the same user always receives the same variant —
  so results stay stable across sessions and devices.
- Variant configuration and traffic splits come from an allocation store that
  the experiment UI persists to, and an event collector records which variant
  each user saw.

On the analysis path, an event collector ingests exposure and outcome events,
and a metrics pipeline aggregates them into per-variant summaries.

- The analysis engine runs statistical tests, writes conclusions plus guardrail
  metrics to a results store, and alerts when an experiment crosses stop or
  restart thresholds.

The separation of serving from analysis is deliberate:

- A bad experiment can be killed instantly by flipping the flag, while analysis
  of the collected data continues independently.
- No shared mutable state couples the paths, so serving latency, analysis
  latency, and experiment management each scale and fail on their own.
- The data model anchors both paths: exposures and outcomes are keyed by
  (experiment_id, variant, user_id, timestamp), and the results store keeps
  per-variant summaries plus references to the raw events so any published
  conclusion can be audited.
- Both paths are horizontally scalable and independently deployable, which keeps
  the experiment backlog small even as the product team runs dozens of
  concurrent tests.

### How do you assign users to variants consistently?

Assignment is a pure function of a stable key — typically the user ID or a
per-experiment salt-mixed identifier — so any server computes the same answer
without a round trip or a shared database.

- The standard scheme hashes the key (e.g., `SHA256(user_id || salt)`), takes a
  64-bit slice, and maps that value into a bucket range.
- Each experiment declares a traffic split, and every variant owns an interval
  of the hash space; the user's hash lands in exactly one interval, which is
  their variant.
- The per-experiment salt prevents the same user from always landing in the same
  group and makes assignments unpredictable to anyone gaming the system.

Persistence is optional but valuable:

- The allocation store can record the assignment so analysis can join exposures
  to outcomes even if the user later switches devices.
- When a split changes mid-experiment, the system must decide whether to
  re-bucket or to freeze existing users — freezing (reusing the stored
  assignment) avoids contaminating users who already saw the old variant, which
  is why most mature platforms freeze on split changes.
- The SDK caches the result, and the flag API can serve a coarse-grained bucket
  from a local cache, so assignment costs microseconds.
- Consistency comes from the deterministic hash function itself, not from
  locking, which is what lets assignment scale to millions of users per second.
- One subtlety: the hash function and salt are versioned, so changing them
  requires a coordinated re-randomization rather than silently reassigning
  existing users mid-experiment.

### How do you ensure statistical validity across metrics?

Validity starts before data is collected.

- Every experiment pre-registers a primary metric and a set of guardrail
  metrics, and the platform computes the sample size needed to detect the
  minimum meaningful effect (MDE) at the chosen power and significance level.
- Testing then runs on a fixed horizon, or with sequential testing that bounds
  error as data streams in — either way the platform prevents the classic
  mistake of peeking at the p-value repeatedly and declaring victory at the
  first dip.
- Because an experiment usually measures many metrics, per-metric adjustments
  (Bonferroni or a false-discovery-rate control) keep the overall false-positive
  rate bounded.

The statistics must match the metric's shape.

- Simple averages use a t-test, ordinal outcomes use Mann–Whitney, and ratio
  metrics like revenue-per-user need the delta method or bootstrap to build
  valid confidence intervals.
- Variance reduction keeps experiments fast and cheap: CUPED regresses the
  outcome on the pre-experiment value of the same metric, shrinking noise
  without biasing the estimate, which cuts the required sample size
  substantially.
- The engine also checks assignment balance — if bucketing is skewed by
  geography or device, it can re-run with stratified randomization — and
  guardrail metrics are analyzed with the same rigor as the primary, so a
  conversion win is never hiding a latency or revenue regression.
- The engine also reports confidence intervals, not just p-values, so
  stakeholders see the magnitude of an effect and its uncertainty, and it flags
  when the executed design deviates from the pre-registered test, forcing a
  documented decision rather than silent drift.

### How do you run experiments at scale without pollution?

Experiments interfere when the same user is assigned to two experiments that
touch the same metric.

- The dominant fix is multi-layer, orthogonal bucketing: each layer (UI,
  ranking, pricing) uses its own independent hash function, so a user's
  assignment in one layer is statistically independent of their assignment in
  another.
- Because orthogonal layers use independent salts over the same user base,
  hundreds of experiments can run concurrently without correlated exposure.
- On top of that, the platform maintains a metric-exclusivity map that blocks
  two experiments from modifying the same metric on the same population — a
  guard against interference that orthogonality alone cannot provide.

Some interference cannot be bucketed away.

- For experiments where one user's variant affects another — marketplaces,
  social features, network effects — individual randomization is statistically
  invalid, so the platform supports cluster randomization by geographic or
  network partition and analyzes with cluster-robust estimators.
- Novelty and learning effects are handled by ramp schedules: traffic is ramped
  gradually and a washout period is excluded from analysis so early user
  behavior does not contaminate the steady-state estimate.
- Finally, the platform monitors "pollution" operationally — exposures served
  from stale flag config, variant allocations that do not sum to 100%, and
  unusual correlation across concurrent experiments all trip alerts before they
  corrupt a conclusion.
- Interference checks are also explicit: the platform can cross-tabulate a
  subset of users across overlapping experiments and compare per-cell effects,
  quarantining the later experiment when a conflict is confirmed.
- This combination — orthogonal layers plus explicit conflict resolution — is
  what lets the platform scale to many concurrent experiments without the
  results drifting apart.

### How do you detect and stop bad experiments early?

Detection runs on two loops with very different speeds.

- The operational loop is nearly instant: the platform watches exposure volumes,
  variant-to-audience leakage, and event-pipeline error rates, and fires alerts
  when a variant stops being served, starts being served to users it should not
  reach, or the data pipeline drops events.
- Because serving is decoupled from analysis, a bad experiment is killable in
  seconds — the UI flips the allocation to 100% control or removes the flag, and
  the change propagates through the cached flag store long before any
  statistical test could react.
- These infrastructure alerts catch breakage even when the point estimate still
  looks fine.

The statistical loop is fast but principled:

- The analysis engine evaluates the pre-registered sequential test after each
  data batch and stops for either significance or futility.
- A sequential design keeps both error types bounded, so a large regression in a
  guardrail metric stops the experiment within days instead of at the
  pre-computed end.
- For experiments that are merely unpromising rather than harmful, a futility
  boundary halts them early and frees traffic for more promising tests.
- Every stop writes a post-mortem record — exposure counts, observed effects,
  stop reason — into the results store, so no bad experiment disappears silently
  and the platform learns a reusable signal about what went wrong.
- Finally, all detection is log-based and replayable: the same event stream that
  drives the real-time alerts feeds the post-hoc analysis, so a near-miss that
  never tripped a threshold can still be diagnosed after the fact.

## Source

```text
title: Experimentation
node app: App SDK [round, icon=browser]
node api: Flag API [icon=server]
node assign: Assignment Service [icon=compute]
node alloc: Allocation Store [cylinder, icon=cache]
node event: Event Collector [icon=queue]
node metrics: Metrics Pipeline [icon=worker]
node analyze: Analysis Engine [icon=search]
node results: Results Store [cylinder, icon=database]
node ui: Experiment UI [icon=browser]
node notify: Alerts [icon=message]

edge app -> api: get variants
edge api -> assign: bucket
edge assign -> alloc: lookup
edge app -> event: log
edge event -> metrics: aggregate
edge metrics -> analyze: test
edge analyze -> results: save
edge ui -> api: create
edge api -> alloc: persist
edge analyze -> notify: alert
```

## Q&A

### Q: Design an A/B testing platform

**A:** The platform has two halves that must stay decoupled: a real-time decision path
that tells each client which variant to show, and an offline analysis path that
proves whether the variant caused an effect.

- On the decision path, the app SDK calls a flag API, which asks an assignment
  service to bucket the user into a variant.
- Assignment is deterministic — the same user always receives the same variant —
  so results stay stable across sessions and devices.
- Variant configuration and traffic splits come from an allocation store that
  the experiment UI persists to, and an event collector records which variant
  each user saw.

On the analysis path, an event collector ingests exposure and outcome events,
and a metrics pipeline aggregates them into per-variant summaries.

- The analysis engine runs statistical tests, writes conclusions plus guardrail
  metrics to a results store, and alerts when an experiment crosses stop or
  restart thresholds.

The separation of serving from analysis is deliberate:

- A bad experiment can be killed instantly by flipping the flag, while analysis
  of the collected data continues independently.
- No shared mutable state couples the paths, so serving latency, analysis
  latency, and experiment management each scale and fail on their own.
- The data model anchors both paths: exposures and outcomes are keyed by
  (experiment_id, variant, user_id, timestamp), and the results store keeps
  per-variant summaries plus references to the raw events so any published
  conclusion can be audited.
- Both paths are horizontally scalable and independently deployable, which keeps
  the experiment backlog small even as the product team runs dozens of
  concurrent tests.

### Q: How do you assign users to variants consistently?

**A:** Assignment is a pure function of a stable key — typically the user ID or a
per-experiment salt-mixed identifier — so any server computes the same answer
without a round trip or a shared database.

- The standard scheme hashes the key (e.g., `SHA256(user_id || salt)`), takes a
  64-bit slice, and maps that value into a bucket range.
- Each experiment declares a traffic split, and every variant owns an interval
  of the hash space; the user's hash lands in exactly one interval, which is
  their variant.
- The per-experiment salt prevents the same user from always landing in the same
  group and makes assignments unpredictable to anyone gaming the system.

Persistence is optional but valuable:

- The allocation store can record the assignment so analysis can join exposures
  to outcomes even if the user later switches devices.
- When a split changes mid-experiment, the system must decide whether to
  re-bucket or to freeze existing users — freezing (reusing the stored
  assignment) avoids contaminating users who already saw the old variant, which
  is why most mature platforms freeze on split changes.
- The SDK caches the result, and the flag API can serve a coarse-grained bucket
  from a local cache, so assignment costs microseconds.
- Consistency comes from the deterministic hash function itself, not from
  locking, which is what lets assignment scale to millions of users per second.
- One subtlety: the hash function and salt are versioned, so changing them
  requires a coordinated re-randomization rather than silently reassigning
  existing users mid-experiment.

### Q: How do you ensure statistical validity across metrics?

**A:** Validity starts before data is collected.

- Every experiment pre-registers a primary metric and a set of guardrail
  metrics, and the platform computes the sample size needed to detect the
  minimum meaningful effect (MDE) at the chosen power and significance level.
- Testing then runs on a fixed horizon, or with sequential testing that bounds
  error as data streams in — either way the platform prevents the classic
  mistake of peeking at the p-value repeatedly and declaring victory at the
  first dip.
- Because an experiment usually measures many metrics, per-metric adjustments
  (Bonferroni or a false-discovery-rate control) keep the overall false-positive
  rate bounded.

The statistics must match the metric's shape.

- Simple averages use a t-test, ordinal outcomes use Mann–Whitney, and ratio
  metrics like revenue-per-user need the delta method or bootstrap to build
  valid confidence intervals.
- Variance reduction keeps experiments fast and cheap: CUPED regresses the
  outcome on the pre-experiment value of the same metric, shrinking noise
  without biasing the estimate, which cuts the required sample size
  substantially.
- The engine also checks assignment balance — if bucketing is skewed by
  geography or device, it can re-run with stratified randomization — and
  guardrail metrics are analyzed with the same rigor as the primary, so a
  conversion win is never hiding a latency or revenue regression.
- The engine also reports confidence intervals, not just p-values, so
  stakeholders see the magnitude of an effect and its uncertainty, and it flags
  when the executed design deviates from the pre-registered test, forcing a
  documented decision rather than silent drift.

### Q: How do you run experiments at scale without pollution?

**A:** Experiments interfere when the same user is assigned to two experiments that
touch the same metric.

- The dominant fix is multi-layer, orthogonal bucketing: each layer (UI,
  ranking, pricing) uses its own independent hash function, so a user's
  assignment in one layer is statistically independent of their assignment in
  another.
- Because orthogonal layers use independent salts over the same user base,
  hundreds of experiments can run concurrently without correlated exposure.
- On top of that, the platform maintains a metric-exclusivity map that blocks
  two experiments from modifying the same metric on the same population — a
  guard against interference that orthogonality alone cannot provide.

Some interference cannot be bucketed away.

- For experiments where one user's variant affects another — marketplaces,
  social features, network effects — individual randomization is statistically
  invalid, so the platform supports cluster randomization by geographic or
  network partition and analyzes with cluster-robust estimators.
- Novelty and learning effects are handled by ramp schedules: traffic is ramped
  gradually and a washout period is excluded from analysis so early user
  behavior does not contaminate the steady-state estimate.
- Finally, the platform monitors "pollution" operationally — exposures served
  from stale flag config, variant allocations that do not sum to 100%, and
  unusual correlation across concurrent experiments all trip alerts before they
  corrupt a conclusion.
- Interference checks are also explicit: the platform can cross-tabulate a
  subset of users across overlapping experiments and compare per-cell effects,
  quarantining the later experiment when a conflict is confirmed.
- This combination — orthogonal layers plus explicit conflict resolution — is
  what lets the platform scale to many concurrent experiments without the
  results drifting apart.

### Q: How do you detect and stop bad experiments early?

**A:** Detection runs on two loops with very different speeds.

- The operational loop is nearly instant: the platform watches exposure volumes,
  variant-to-audience leakage, and event-pipeline error rates, and fires alerts
  when a variant stops being served, starts being served to users it should not
  reach, or the data pipeline drops events.
- Because serving is decoupled from analysis, a bad experiment is killable in
  seconds — the UI flips the allocation to 100% control or removes the flag, and
  the change propagates through the cached flag store long before any
  statistical test could react.
- These infrastructure alerts catch breakage even when the point estimate still
  looks fine.

The statistical loop is fast but principled:

- The analysis engine evaluates the pre-registered sequential test after each
  data batch and stops for either significance or futility.
- A sequential design keeps both error types bounded, so a large regression in a
  guardrail metric stops the experiment within days instead of at the
  pre-computed end.
- For experiments that are merely unpromising rather than harmful, a futility
  boundary halts them early and frees traffic for more promising tests.
- Every stop writes a post-mortem record — exposure counts, observed effects,
  stop reason — into the results store, so no bad experiment disappears silently
  and the platform learns a reusable signal about what went wrong.
- Finally, all detection is log-based and replayable: the same event stream that
  drives the real-time alerts feeds the post-hoc analysis, so a near-miss that
  never tripped a threshold can still be diagnosed after the fact.

## Source

```text
title: Experimentation
node app: App SDK [round, icon=browser]
node api: Flag API [icon=server]
node assign: Assignment Service [icon=compute]
node alloc: Allocation Store [cylinder, icon=cache]
node event: Event Collector [icon=queue]
node metrics: Metrics Pipeline [icon=worker]
node analyze: Analysis Engine [icon=search]
node results: Results Store [cylinder, icon=database]
node ui: Experiment UI [icon=browser]
node notify: Alerts [icon=message]

edge app -> api: get variants
edge api -> assign: bucket
edge assign -> alloc: lookup
edge app -> event: log
edge event -> metrics: aggregate
edge metrics -> analyze: test
edge analyze -> results: save
edge ui -> api: create
edge api -> alloc: persist
edge analyze -> notify: alert
```
