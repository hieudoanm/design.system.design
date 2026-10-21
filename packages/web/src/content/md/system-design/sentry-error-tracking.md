# Sentry — Error Tracking

Design an error tracking service

**Difficulty:** Hard

**Tags:** analytics, monitoring

## Functional Requirements

- an error tracking service
- ingest error events at scale?
- group similar errors into issues?
- correlate errors with releases?
- alert on regressions without noise?

## Non-Functional Requirements

- The `App SDK` captures exceptions and reports them to the `Ingest Endpoint`,
  which buffers into an `Event Queue`.

The pipeline runs ingest at scale → normalize → fingerprint → group → alert:

- A `Normalizer` parses and scrubs each event — PII removal, stack-trace
  extraction, environment and tag injection — then a `Grouping Service` computes
  a fingerprint to fold identical errors into issues.
- Events are written to the `Event Store` for detail and indexed in the
  `Event Index` for search.
- The `Release Service` tracks deploys and lets an issue be marked resolved for
  a release.
- The `Alert Service` watches thresholds and emails via `Notifications`.
- Dashboards query both the store and the index.

The key insight is that raw events are the substrate, but the unit of
user-facing value is the issue:

- One bug surfacing a thousand times should occupy one row in the dashboard, not
  a thousand.
- All correctness concentrates in the fingerprint — over-grouping hides distinct
  bugs, and under-grouping floods the issue list with duplicates.
- A secondary concern is load: an error storm (a bad deploy) can multiply event
  volume by a hundredfold, so the ingest path must absorb bursts without
  dropping events or slowing the customer's app.
- The design therefore separates a high-throughput, latency-tolerant ingest
  pipeline from interactive read paths, with grouping as the semantic bridge
  between them.

Operationally, the ingest and grouping stages must keep up under load:

- The `Event Queue` absorbs error storms and decouples bursty customers from the
  store.
- The `Grouping Service` needs enough concurrency to fingerprint events as fast
  as they arrive, because grouping is where an incident's signal is produced.
- Retention tiers matter: raw events age to cold storage while counts and
  fingerprints stay hot, so dashboards stay fast even after years of history..
- Error events are bursty — a bad deploy can 100x the error rate instantly — so
  ingest must absorb spikes without dropping events or blocking the host app.

The ingest path is intentionally dumb and fast; all semantics live downstream in
the normalizer and grouping service:

- The SDK batches events client-side and sends to the `Ingest Endpoint`, which
  validates the envelope (auth, project id, size caps) and pushes to the
  `Event Queue` (`Kafka`) partitioned by project.
- A burst then deepens the queue backlog; the queue decouples write latency from
  downstream processing, so a spike delays processing rather than dropping data
  or slowing the app.
- The `Normalizer` consumes from the queue: parse the payload by schema version,
  extract and canonicalize stack frames, strip PII (emails, IP addresses, file
  paths) against per-project rules, and dedupe identical frames.

Quotas and rate limits are enforced at ingest, not downstream:

- Per-project daily caps return a drop signal to the SDK so one noisy project
  cannot starve the platform.
- Because clients are untrusted, cap event size (reject over ~1 MB) and validate
  against a schema version so old SDKs keep working after the pipeline evolves.
- Availability is provided by the queue itself — events persist in it, so a
  downstream outage causes lag, not loss; the store writes are batched and
  idempotent by `event_id`, so at-least-once delivery never duplicates the
  visible record.

Quotas and fairness are part of correctness:

- A single noisy project must not consume the pipeline's capacity, so enforce
  per-project rate limits and daily quotas at the endpoint and return quota
  state to the SDK so it can throttle locally and sample deterministically — the
  same stack trace sampled the same way across retries.
- Buffer on the client too: a bounded in-memory queue plus a short flush
  interval means a burst in the app does not translate into a burst at ingest.
- This keeps ingest cost proportional to a project's configured quota, not to
  its actual error rate..
- Release correlation is only
  useful when it is fast, and the pre-aggregated rollups exist precisely so the
  answer is available the moment the dashboard loads..
- Default new rules to notify-only so they
  build a history before they page; require a minimum observation period so a rule
  does not fire on cold baselines; and make every alert actionable by linking the
  issue, the release, and the last known fix.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Error Tracking
app: App SDK
ingest: Ingest Endpoint
queue: Event Queue
normalize: Normalizer
group: Grouping Service
index: Event Index
store: Event Store
release: Release Service
alert: Alert Service
dash: Dashboard
notify: Notifications

app ─► ingest ─► report
ingest ─► queue ─► buffer
queue ─► normalize ─► parse
normalize ─► group ─► fingerprint
group ─► store ─► save
group ─► index ─► index
release ─► group ─► resolve
group ─► alert ─► threshold
alert ─► notify ─► email
dash ─► store ─► query
dash ─► index ─► search
```

## Design

### Design an error tracking service

The `App SDK` captures exceptions and reports them to the `Ingest Endpoint`,
which buffers into an `Event Queue`.

The pipeline runs ingest at scale → normalize → fingerprint → group → alert:

- A `Normalizer` parses and scrubs each event — PII removal, stack-trace
  extraction, environment and tag injection — then a `Grouping Service` computes
  a fingerprint to fold identical errors into issues.
- Events are written to the `Event Store` for detail and indexed in the
  `Event Index` for search.
- The `Release Service` tracks deploys and lets an issue be marked resolved for
  a release.
- The `Alert Service` watches thresholds and emails via `Notifications`.
- Dashboards query both the store and the index.

The key insight is that raw events are the substrate, but the unit of
user-facing value is the issue:

- One bug surfacing a thousand times should occupy one row in the dashboard, not
  a thousand.
- All correctness concentrates in the fingerprint — over-grouping hides distinct
  bugs, and under-grouping floods the issue list with duplicates.
- A secondary concern is load: an error storm (a bad deploy) can multiply event
  volume by a hundredfold, so the ingest path must absorb bursts without
  dropping events or slowing the customer's app.
- The design therefore separates a high-throughput, latency-tolerant ingest
  pipeline from interactive read paths, with grouping as the semantic bridge
  between them.

Operationally, the ingest and grouping stages must keep up under load:

- The `Event Queue` absorbs error storms and decouples bursty customers from the
  store.
- The `Grouping Service` needs enough concurrency to fingerprint events as fast
  as they arrive, because grouping is where an incident's signal is produced.
- Retention tiers matter: raw events age to cold storage while counts and
  fingerprints stay hot, so dashboards stay fast even after years of history.

### How do you ingest error events at scale?

Error events are bursty — a bad deploy can 100x the error rate instantly — so
ingest must absorb spikes without dropping events or blocking the host app.

The ingest path is intentionally dumb and fast; all semantics live downstream in
the normalizer and grouping service:

- The SDK batches events client-side and sends to the `Ingest Endpoint`, which
  validates the envelope (auth, project id, size caps) and pushes to the
  `Event Queue` (`Kafka`) partitioned by project.
- A burst then deepens the queue backlog; the queue decouples write latency from
  downstream processing, so a spike delays processing rather than dropping data
  or slowing the app.
- The `Normalizer` consumes from the queue: parse the payload by schema version,
  extract and canonicalize stack frames, strip PII (emails, IP addresses, file
  paths) against per-project rules, and dedupe identical frames.

Quotas and rate limits are enforced at ingest, not downstream:

- Per-project daily caps return a drop signal to the SDK so one noisy project
  cannot starve the platform.
- Because clients are untrusted, cap event size (reject over ~1 MB) and validate
  against a schema version so old SDKs keep working after the pipeline evolves.
- Availability is provided by the queue itself — events persist in it, so a
  downstream outage causes lag, not loss; the store writes are batched and
  idempotent by `event_id`, so at-least-once delivery never duplicates the
  visible record.

Quotas and fairness are part of correctness:

- A single noisy project must not consume the pipeline's capacity, so enforce
  per-project rate limits and daily quotas at the endpoint and return quota
  state to the SDK so it can throttle locally and sample deterministically — the
  same stack trace sampled the same way across retries.
- Buffer on the client too: a bounded in-memory queue plus a short flush
  interval means a burst in the app does not translate into a burst at ingest.
- This keeps ingest cost proportional to a project's configured quota, not to
  its actual error rate.

### How do you group similar errors into issues?

Grouping is the semantic heart of the system:

- Compute a fingerprint from the error's signature: exception type, top stack
  frames, module, and a normalized message, with function addresses, line
  numbers, and variable values stripped so small code shifts do not split an
  issue.
- The `Grouping Service` hashes these canonical features (a `sha1` over the
  signature) to produce a `group_id`; events sharing a `group_id` are the same
  issue.
- Matching must be resilient by design — ignore stack depth, temporary line
  numbers, and volatile values, but keep discriminators like class name, method,
  and error code — otherwise every deploy fragments the issue list.

Grouping logic lives in the pipeline, not the client, so it can evolve:

- When rules change, a re-index job re-groups existing events.
- Two levels refine it: grouping merges duplicates into an issue, while release
  affinity separates the same signature across releases when a new code path
  fails — a regression in v2 often deserves its own issue alongside the stable
  v1 one.
- The trade-off is tuning: too loose merges distinct causes into one confusing
  issue, too strict resurrects noise as separate issues, so make fingerprint
  rules per-language and expose the signature in the UI with manual
  merge/unmerge controls.
- The `group_id` becomes the join key for everything downstream — event counts,
  search, release correlation, and alerting — so a stable, explainable
  fingerprint is worth the engineering effort.

A few refinements keep grouping robust in practice:

- Aggregate stack frames by function rather than file line, so a one-line change
  does not create a new issue.
- Normalize external dependency versions so a library bump does not fragment
  issues.
- Strip volatile fields such as user IDs, timestamps, and request IDs from the
  signature.
- Also support manual merge and unmerge as first-class, persisted operations,
  because automated heuristics will always get some cases wrong — and the record
  of those decisions is itself valuable signal for tuning the grouping rules.

### How do you correlate errors with releases?

Every event carries a `release` — version hash, environment, commit — captured
by the SDK from build metadata at startup. The `Release Service` records deploys
and their commit ranges; when an issue is resolved for a release, the system
records `resolved_in = release_id`. Correlation then answers the two questions
teams actually ask: did this issue start with this deploy, and did a fixed issue
come back? On ingest, if an event's release is newer than the issue's
`resolved_in`, the issue is marked _regressed_ and reopens — that is how the UI
turns "error appeared after deploy" into a one-line statement.

For rollout analysis, compare per-issue event counts against the previous
release's baseline and highlight issues whose first-seen release matches the
deploy, so a reviewer sees "top new issues in v2.1.0" immediately after a
release. Store pre-aggregated `(group_id, release_id, count)` rollups so these
queries are point lookups rather than scans over the event store. The data
quality depends on accurate release metadata: the SDK enforces the version tag,
the service validates it against the release registry, and release reassignment
is allowed so a mis-tagged deploy can be corrected without losing history. The
trade-off is that release correlation only as good as the tags — so enforce
tagging at ingest, not at query time.

Failure cases must be handled explicitly. A release with no matched events (a
deploy that never reported) is marked and surfaced, so "no new issues" means "no
events at all" rather than "no new failures" — the two have opposite meanings to
an on-call engineer. Regression detection must also be resilient to quiet
periods: a fixed issue with no baseline traffic should not auto-close, and a
small burst after a deploy of a previously resolved issue should reopen it
immediately rather than waiting for a threshold. Release correlation is only
useful when it is fast, and the pre-aggregated rollups exist precisely so the
answer is available the moment the dashboard loads.

### How do you alert on regressions without noise?

Alert on _changes relative to baseline_ rather than raw error counts, because
noisy projects would page constantly on absolute thresholds. The `Alert Service`
maintains per-issue rate history (e.g., events per hour over the last 14 days)
and triggers when the current rate exceeds the baseline by a factor (say 3x)
sustained over a window, or when a new issue appears with meaningful volume.
Apply the standard noise-reduction machinery: a `for` duration before the alert
fires, no re-fire while an alert is open, and escalation only if still firing
after acknowledgment. Suppression rules silence known-benign issues, and alerts
dedupe by `(issue, release)` so a release-wide regression produces one alert,
not one per affected user.

Severity drives the notification channel: crash-level and security issues page
on-call, informational issues only notify or feed a digest. Every alert carries
the release and a direct issue link so an on-call engineer jumps straight to the
fix. The subtle failure mode is alerting on stale data — a rules engine that
misses a regression because the event pipeline is lagging is worse than a noisy
one — so monitor ingestion lag and evaluation failures as first-class alerts
themselves. Finally, route regressions by release: an issue that regressed with
the current deploy gets higher priority than an old issue that never fully
cleared, because that is what correlates with the deploy teams are
investigating.

Operational tuning prevents alert rot. Default new rules to notify-only so they
build a history before they page; require a minimum observation period so a rule
does not fire on cold baselines; and make every alert actionable by linking the
issue, the release, and the last known fix. Handle the quiet-problem case too:
an issue that slowly grows at 1.5x baseline may never trip a 3x alert, so add
absolute-volume guards (at least N events per hour) beneath the relative
thresholds. The alert engine's own health — evaluation failures, lag, and rule
syntax errors — must be monitored, because an alert that silently stops
evaluating is indistinguishable from a system with no failures.

## Source

```text
title: Error Tracking
node app: App SDK [round, icon=browser]
node ingest: Ingest Endpoint [icon=server]
node queue: Event Queue [icon=queue]
node normalize: Normalizer [icon=compute]
node group: Grouping Service [icon=search]
node index: Event Index [icon=search]
node store: Event Store [cylinder, icon=database]
node release: Release Service [icon=file]
node alert: Alert Service [icon=message]
node dash: Dashboard [icon=browser]
node notify: Notifications [icon=mail]

edge app -> ingest: report
edge ingest -> queue: buffer
edge queue -> normalize: parse
edge normalize -> group: fingerprint
edge group -> store: save
edge group -> index: index
edge release -> group: resolve
edge group -> alert: threshold
edge alert -> notify: email
edge dash -> store: query
edge dash -> index: search
```

## Q&A

### Q: Design an error tracking service

**A:** The `App SDK` captures exceptions and reports them to the `Ingest Endpoint`,
which buffers into an `Event Queue`.

The pipeline runs ingest at scale → normalize → fingerprint → group → alert:

- A `Normalizer` parses and scrubs each event — PII removal, stack-trace
  extraction, environment and tag injection — then a `Grouping Service` computes
  a fingerprint to fold identical errors into issues.
- Events are written to the `Event Store` for detail and indexed in the
  `Event Index` for search.
- The `Release Service` tracks deploys and lets an issue be marked resolved for
  a release.
- The `Alert Service` watches thresholds and emails via `Notifications`.
- Dashboards query both the store and the index.

The key insight is that raw events are the substrate, but the unit of
user-facing value is the issue:

- One bug surfacing a thousand times should occupy one row in the dashboard, not
  a thousand.
- All correctness concentrates in the fingerprint — over-grouping hides distinct
  bugs, and under-grouping floods the issue list with duplicates.
- A secondary concern is load: an error storm (a bad deploy) can multiply event
  volume by a hundredfold, so the ingest path must absorb bursts without
  dropping events or slowing the customer's app.
- The design therefore separates a high-throughput, latency-tolerant ingest
  pipeline from interactive read paths, with grouping as the semantic bridge
  between them.

Operationally, the ingest and grouping stages must keep up under load:

- The `Event Queue` absorbs error storms and decouples bursty customers from the
  store.
- The `Grouping Service` needs enough concurrency to fingerprint events as fast
  as they arrive, because grouping is where an incident's signal is produced.
- Retention tiers matter: raw events age to cold storage while counts and
  fingerprints stay hot, so dashboards stay fast even after years of history.

### Q: How do you ingest error events at scale?

**A:** Error events are bursty — a bad deploy can 100x the error rate instantly — so
ingest must absorb spikes without dropping events or blocking the host app.

The ingest path is intentionally dumb and fast; all semantics live downstream in
the normalizer and grouping service:

- The SDK batches events client-side and sends to the `Ingest Endpoint`, which
  validates the envelope (auth, project id, size caps) and pushes to the
  `Event Queue` (`Kafka`) partitioned by project.
- A burst then deepens the queue backlog; the queue decouples write latency from
  downstream processing, so a spike delays processing rather than dropping data
  or slowing the app.
- The `Normalizer` consumes from the queue: parse the payload by schema version,
  extract and canonicalize stack frames, strip PII (emails, IP addresses, file
  paths) against per-project rules, and dedupe identical frames.

Quotas and rate limits are enforced at ingest, not downstream:

- Per-project daily caps return a drop signal to the SDK so one noisy project
  cannot starve the platform.
- Because clients are untrusted, cap event size (reject over ~1 MB) and validate
  against a schema version so old SDKs keep working after the pipeline evolves.
- Availability is provided by the queue itself — events persist in it, so a
  downstream outage causes lag, not loss; the store writes are batched and
  idempotent by `event_id`, so at-least-once delivery never duplicates the
  visible record.

Quotas and fairness are part of correctness:

- A single noisy project must not consume the pipeline's capacity, so enforce
  per-project rate limits and daily quotas at the endpoint and return quota
  state to the SDK so it can throttle locally and sample deterministically — the
  same stack trace sampled the same way across retries.
- Buffer on the client too: a bounded in-memory queue plus a short flush
  interval means a burst in the app does not translate into a burst at ingest.
- This keeps ingest cost proportional to a project's configured quota, not to
  its actual error rate.

### Q: How do you group similar errors into issues?

**A:** Grouping is the semantic heart of the system:

- Compute a fingerprint from the error's signature: exception type, top stack
  frames, module, and a normalized message, with function addresses, line
  numbers, and variable values stripped so small code shifts do not split an
  issue.
- The `Grouping Service` hashes these canonical features (a `sha1` over the
  signature) to produce a `group_id`; events sharing a `group_id` are the same
  issue.
- Matching must be resilient by design — ignore stack depth, temporary line
  numbers, and volatile values, but keep discriminators like class name, method,
  and error code — otherwise every deploy fragments the issue list.

Grouping logic lives in the pipeline, not the client, so it can evolve:

- When rules change, a re-index job re-groups existing events.
- Two levels refine it: grouping merges duplicates into an issue, while release
  affinity separates the same signature across releases when a new code path
  fails — a regression in v2 often deserves its own issue alongside the stable
  v1 one.
- The trade-off is tuning: too loose merges distinct causes into one confusing
  issue, too strict resurrects noise as separate issues, so make fingerprint
  rules per-language and expose the signature in the UI with manual
  merge/unmerge controls.
- The `group_id` becomes the join key for everything downstream — event counts,
  search, release correlation, and alerting — so a stable, explainable
  fingerprint is worth the engineering effort.

A few refinements keep grouping robust in practice:

- Aggregate stack frames by function rather than file line, so a one-line change
  does not create a new issue.
- Normalize external dependency versions so a library bump does not fragment
  issues.
- Strip volatile fields such as user IDs, timestamps, and request IDs from the
  signature.
- Also support manual merge and unmerge as first-class, persisted operations,
  because automated heuristics will always get some cases wrong — and the record
  of those decisions is itself valuable signal for tuning the grouping rules.

### Q: How do you correlate errors with releases?

**A:** Every event carries a `release` — version hash, environment, commit — captured
by the SDK from build metadata at startup. The `Release Service` records deploys
and their commit ranges; when an issue is resolved for a release, the system
records `resolved_in = release_id`. Correlation then answers the two questions
teams actually ask: did this issue start with this deploy, and did a fixed issue
come back? On ingest, if an event's release is newer than the issue's
`resolved_in`, the issue is marked _regressed_ and reopens — that is how the UI
turns "error appeared after deploy" into a one-line statement.

For rollout analysis, compare per-issue event counts against the previous
release's baseline and highlight issues whose first-seen release matches the
deploy, so a reviewer sees "top new issues in v2.1.0" immediately after a
release. Store pre-aggregated `(group_id, release_id, count)` rollups so these
queries are point lookups rather than scans over the event store. The data
quality depends on accurate release metadata: the SDK enforces the version tag,
the service validates it against the release registry, and release reassignment
is allowed so a mis-tagged deploy can be corrected without losing history. The
trade-off is that release correlation only as good as the tags — so enforce
tagging at ingest, not at query time.

Failure cases must be handled explicitly. A release with no matched events (a
deploy that never reported) is marked and surfaced, so "no new issues" means "no
events at all" rather than "no new failures" — the two have opposite meanings to
an on-call engineer. Regression detection must also be resilient to quiet
periods: a fixed issue with no baseline traffic should not auto-close, and a
small burst after a deploy of a previously resolved issue should reopen it
immediately rather than waiting for a threshold. Release correlation is only
useful when it is fast, and the pre-aggregated rollups exist precisely so the
answer is available the moment the dashboard loads.

### Q: How do you alert on regressions without noise?

**A:** Alert on _changes relative to baseline_ rather than raw error counts, because
noisy projects would page constantly on absolute thresholds. The `Alert Service`
maintains per-issue rate history (e.g., events per hour over the last 14 days)
and triggers when the current rate exceeds the baseline by a factor (say 3x)
sustained over a window, or when a new issue appears with meaningful volume.
Apply the standard noise-reduction machinery: a `for` duration before the alert
fires, no re-fire while an alert is open, and escalation only if still firing
after acknowledgment. Suppression rules silence known-benign issues, and alerts
dedupe by `(issue, release)` so a release-wide regression produces one alert,
not one per affected user.

Severity drives the notification channel: crash-level and security issues page
on-call, informational issues only notify or feed a digest. Every alert carries
the release and a direct issue link so an on-call engineer jumps straight to the
fix. The subtle failure mode is alerting on stale data — a rules engine that
misses a regression because the event pipeline is lagging is worse than a noisy
one — so monitor ingestion lag and evaluation failures as first-class alerts
themselves. Finally, route regressions by release: an issue that regressed with
the current deploy gets higher priority than an old issue that never fully
cleared, because that is what correlates with the deploy teams are
investigating.

Operational tuning prevents alert rot. Default new rules to notify-only so they
build a history before they page; require a minimum observation period so a rule
does not fire on cold baselines; and make every alert actionable by linking the
issue, the release, and the last known fix. Handle the quiet-problem case too:
an issue that slowly grows at 1.5x baseline may never trip a 3x alert, so add
absolute-volume guards (at least N events per hour) beneath the relative
thresholds. The alert engine's own health — evaluation failures, lag, and rule
syntax errors — must be monitored, because an alert that silently stops
evaluating is indistinguishable from a system with no failures.

## Source

```text
title: Error Tracking
node app: App SDK [round, icon=browser]
node ingest: Ingest Endpoint [icon=server]
node queue: Event Queue [icon=queue]
node normalize: Normalizer [icon=compute]
node group: Grouping Service [icon=search]
node index: Event Index [icon=search]
node store: Event Store [cylinder, icon=database]
node release: Release Service [icon=file]
node alert: Alert Service [icon=message]
node dash: Dashboard [icon=browser]
node notify: Notifications [icon=mail]

edge app -> ingest: report
edge ingest -> queue: buffer
edge queue -> normalize: parse
edge normalize -> group: fingerprint
edge group -> store: save
edge group -> index: index
edge release -> group: resolve
edge group -> alert: threshold
edge alert -> notify: email
edge dash -> store: query
edge dash -> index: search
```
