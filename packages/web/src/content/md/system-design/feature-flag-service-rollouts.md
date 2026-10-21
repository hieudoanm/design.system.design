# Feature Flag Service — Rollouts

Design a feature flag service

**Difficulty:** Medium

**Tags:** cache, feature-flag, recommendation, security

## Functional Requirements

- a feature flag service
- evaluate flags with low latency?
- implement gradual rollouts and targeting?
- avoid cache stampedes on flag changes?
- audit who changed what and when?

## Non-Functional Requirements

- A feature flag service answers one question very fast: is this flag enabled for
  this user?

- The app SDK calls a flag API with a flag key and a context (user ID, group,
  device, country), and the API evaluates the flag's rules and returns a boolean
  or a typed variant.
- Flags live in a flag store — a relational or KV database holding every flag's
  default state, rollout percentage, targeting rules, and per-environment
  overrides.
- A rollout engine and a targeting evaluator implement the rules, while a flag
  cache keeps hot evaluations off the database and makes the read path cost
  microseconds rather than milliseconds.

Around that evaluation core sit three supporting planes.

- A control plane — the admin UI plus the rollout engine — lets engineers
  create, edit, and promote flags.
- An audit log records every change with actor and timestamp so "who changed
  what and when" is always answerable.
- A usage-metrics plane counts evaluations per flag and per route, so operators
  see which flags are hot and whether evaluation latency degrades.

Change propagation runs through the cache plus a pub/sub channel that pushes
invalidations to clients:

- A flag flip reaches the fleet in seconds instead of minutes.
- Because every application request may depend on a flag, the service must be
  ultra-available, low-latency, and carefully monitored.
- Flags are organized per environment, so the same key can hold independent
  state in development, staging, and production, and a promote action copies the
  reviewed state forward while recording it in the audit log..
- The evaluation path must stay off the database.

- The SDK keeps a local cache of flag rules and evaluates them client-side, so a
  flag check is a hash lookup with zero network round trips — this is the
  standard approach for mature flag services.
- On a cold start, or when the SDK is too constrained to cache, the evaluation
  goes to the flag API, which serves a bulk snapshot of all flag configurations
  for the environment from an in-memory cache.
- Server-side evaluation (for APIs without an SDK) reads the same snapshot and
  runs the same deterministic evaluator, so client and server never disagree
  about a flag's value.

Rules are compiled into a compact decision tree or an ordered condition list:

- Evaluation is a sequence of cheap comparisons rather than queries or joins.
- The flag API is stateless and scales horizontally; the only shared state is
  the snapshot cache, which is either sharded or replicated in-process per node.
- Determinism is a correctness property, not a performance nicety: the same
  context must yield the same result on any node, so evaluation is a pure
  function of context plus a version-stamped snapshot.

Request timeouts are short, and a flag outage degrades to the configured
default-on or default-off fallback rather than blocking the caller:

- Flag evaluation must never be a source of latency or outage for the
  applications that depend on it.

Batch evaluation exists too:

- Callers that need many flags, such as feature-gating a whole page, request a
  map of flag values in a single call, and the SDK caches the batch alongside
  individual evaluations..
- A gradual rollout is a percentage gate layered on the rule evaluation.

- The engine hashes a stable identifier from the context — normally a user or
  session ID — to a value in [0, 100), then turns the flag on when the hash
  falls below the rollout percentage.
- Because the hash is deterministic, a user who is on at 50% rollout stays on
  when the rollout rises to 75%; users are never toggled backward unless the
  rollout itself is reduced.
- This makes rollout a smooth ramp of the treated population without flapping
  users between states on every config change.

Targeting layers on top of the gate with ordered rules:

- An allowlist for users who always get the new behavior (employees, QA,
  specific accounts), segment rules for country, plan, browser, or cohort, and
  percentage gates combined with AND/OR operators.
- The evaluator walks the rule list in priority order and returns the first
  match, which gives flag authors a natural precedence model.
- Rules are versioned so an in-flight rollout can be rolled back instantly by
  pointing the environment at the previous snapshot.

Advanced platforms support multi-variant flags rather than boolean on/off:

- A single rollout can compare several behaviors; the same hash-and-gate
  machinery picks the variant, and each variant can carry its own rollout curve.

Rollout safety rails guard the ramp:

- A kill-switch flag overrides all others, an approval gate requires sign-off
  past 50%, and automatic rollback triggers on error-rate or latency regressions
  measured in the usage-metrics plane..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Feature Flags
app: App SDK
api: Flag API
store: Flag Store
cache: Flag Cache
rollout: Rollout Engine
target: Targeting
audit: Audit Log
ui: Admin UI
notify: Webhooks
metrics: Usage Metrics

app ─► api ─► evaluate
api ─► cache ─► lookup
cache ─► store ─► fallback
app ─► api ─► flag check
ui ─► rollout ─► update
rollout ─► store ─► persist
rollout ─► target ─► rules
rollout ─► notify ─► publish
api ─► audit ─► log
api ─► metrics ─► count
```

## Design

### Design a feature flag service

A feature flag service answers one question very fast: is this flag enabled for
this user?

- The app SDK calls a flag API with a flag key and a context (user ID, group,
  device, country), and the API evaluates the flag's rules and returns a boolean
  or a typed variant.
- Flags live in a flag store — a relational or KV database holding every flag's
  default state, rollout percentage, targeting rules, and per-environment
  overrides.
- A rollout engine and a targeting evaluator implement the rules, while a flag
  cache keeps hot evaluations off the database and makes the read path cost
  microseconds rather than milliseconds.

Around that evaluation core sit three supporting planes.

- A control plane — the admin UI plus the rollout engine — lets engineers
  create, edit, and promote flags.
- An audit log records every change with actor and timestamp so "who changed
  what and when" is always answerable.
- A usage-metrics plane counts evaluations per flag and per route, so operators
  see which flags are hot and whether evaluation latency degrades.

Change propagation runs through the cache plus a pub/sub channel that pushes
invalidations to clients:

- A flag flip reaches the fleet in seconds instead of minutes.
- Because every application request may depend on a flag, the service must be
  ultra-available, low-latency, and carefully monitored.
- Flags are organized per environment, so the same key can hold independent
  state in development, staging, and production, and a promote action copies the
  reviewed state forward while recording it in the audit log.

### How do you evaluate flags with low latency?

The evaluation path must stay off the database.

- The SDK keeps a local cache of flag rules and evaluates them client-side, so a
  flag check is a hash lookup with zero network round trips — this is the
  standard approach for mature flag services.
- On a cold start, or when the SDK is too constrained to cache, the evaluation
  goes to the flag API, which serves a bulk snapshot of all flag configurations
  for the environment from an in-memory cache.
- Server-side evaluation (for APIs without an SDK) reads the same snapshot and
  runs the same deterministic evaluator, so client and server never disagree
  about a flag's value.

Rules are compiled into a compact decision tree or an ordered condition list:

- Evaluation is a sequence of cheap comparisons rather than queries or joins.
- The flag API is stateless and scales horizontally; the only shared state is
  the snapshot cache, which is either sharded or replicated in-process per node.
- Determinism is a correctness property, not a performance nicety: the same
  context must yield the same result on any node, so evaluation is a pure
  function of context plus a version-stamped snapshot.

Request timeouts are short, and a flag outage degrades to the configured
default-on or default-off fallback rather than blocking the caller:

- Flag evaluation must never be a source of latency or outage for the
  applications that depend on it.

Batch evaluation exists too:

- Callers that need many flags, such as feature-gating a whole page, request a
  map of flag values in a single call, and the SDK caches the batch alongside
  individual evaluations.

### How do you implement gradual rollouts and targeting?

A gradual rollout is a percentage gate layered on the rule evaluation.

- The engine hashes a stable identifier from the context — normally a user or
  session ID — to a value in [0, 100), then turns the flag on when the hash
  falls below the rollout percentage.
- Because the hash is deterministic, a user who is on at 50% rollout stays on
  when the rollout rises to 75%; users are never toggled backward unless the
  rollout itself is reduced.
- This makes rollout a smooth ramp of the treated population without flapping
  users between states on every config change.

Targeting layers on top of the gate with ordered rules:

- An allowlist for users who always get the new behavior (employees, QA,
  specific accounts), segment rules for country, plan, browser, or cohort, and
  percentage gates combined with AND/OR operators.
- The evaluator walks the rule list in priority order and returns the first
  match, which gives flag authors a natural precedence model.
- Rules are versioned so an in-flight rollout can be rolled back instantly by
  pointing the environment at the previous snapshot.

Advanced platforms support multi-variant flags rather than boolean on/off:

- A single rollout can compare several behaviors; the same hash-and-gate
  machinery picks the variant, and each variant can carry its own rollout curve.

Rollout safety rails guard the ramp:

- A kill-switch flag overrides all others, an approval gate requires sign-off
  past 50%, and automatic rollback triggers on error-rate or latency regressions
  measured in the usage-metrics plane.

### How do you avoid cache stampedes on flag changes?

Two distinct stampedes matter, and they need different fixes.

The first is at the flag API:

- A snapshot is invalidated and every request node refetches it simultaneously,
  multiplying the load on the flag store by the node count.
- Mitigation is request coalescing — only one in-flight fetch per node, with
  concurrent callers awaiting the same promise — plus jittered expiry so caches
  on different nodes do not expire in lockstep.
- Stale snapshots remain servable during a refetch, so a fetch failure serves
  the previous version instead of erroring, which turns cache refetch into a
  background event rather than a correctness-critical path.

The second stampede is in the SDK fleet:

- When a flag flips to 100%, every client must learn about it, and pushing the
  change to every SDK would itself be a thundering herd.
- The service therefore uses a pull model with short polling, or a fan-out
  pub/sub channel that carries only a version counter, not the flag data.
- Each SDK compares the version and refetches the snapshot only when its local
  copy is stale, and refetches are staggered with jitter so the fleet does not
  request in sync.

The end result is bounded:

- A flag change propagates across the fleet in seconds while peak refetch load
  stays a small multiple of the steady-state rate — the system never turns one
  config edit into a self-inflicted denial of service.
- Capacity planning bounds the storm further: the flag store is sized for the
  refetch peak, and the pub/sub channel is monitored for lag so a propagation
  backlog is visible before it causes stale evaluations.

### How do you audit who changed what and when?

Every mutation to a flag — create, enable, edit rules, change rollout, delete —
flows through the rollout engine:

- An immutable audit event is written before committing the change, so no
  mutation can silently escape the log.
- Each event records the actor (authenticated by the admin UI), the previous and
  new flag state, the environment, an optional change reason or ticket link, and
  a timestamp.

Because the log is append-only, it doubles as a source of truth for recovery:

- The current state of any flag can be reconstructed from the last mutation, and
  an incident can be answered with "this flag turned on for region X at 14:32 by
  user Y" without guesswork.

Audit records are keyed by flag and environment, indexed by time, and retained
for compliance windows.

- The same log powers safety features: diff views show exactly which rule
  changed, release pipelines can gate a promotion on approvals recorded in the
  log, and risky flags can require two-person approval that is written into the
  same trail.
- Because the audit write is on the mutation path rather than async, there is a
  small write-cost per flag change, which is the accepted price of a guarantee
  that every change is attributable.
- This makes the audit log both a compliance artifact and the operational
  backstop for debugging rollout incidents.

Retention is tiered:

- Hot audit events live in a fast store for interactive querying while older
  records archive to object storage, preserving the trail at low cost for the
  full compliance horizon.

## Source

```text
title: Feature Flags
node app: App SDK [round, icon=browser]
node api: Flag API [icon=server]
node store: Flag Store [cylinder, icon=database]
node cache: Flag Cache [cylinder, icon=cache]
node rollout: Rollout Engine [icon=compute]
node target: Targeting [icon=search]
node audit: Audit Log [icon=file]
node ui: Admin UI [icon=browser]
node notify: Webhooks [icon=message]
node metrics: Usage Metrics [icon=worker]

edge app -> api: evaluate
edge api -> cache: lookup
edge cache -> store: fallback
edge app -> api: flag check
edge ui -> rollout: update
edge rollout -> store: persist
edge rollout -> target: rules
edge rollout -> notify: publish
edge api -> audit: log
edge api -> metrics: count
```

## Q&A

### Q: Design a feature flag service

**A:** A feature flag service answers one question very fast: is this flag enabled for
this user?

- The app SDK calls a flag API with a flag key and a context (user ID, group,
  device, country), and the API evaluates the flag's rules and returns a boolean
  or a typed variant.
- Flags live in a flag store — a relational or KV database holding every flag's
  default state, rollout percentage, targeting rules, and per-environment
  overrides.
- A rollout engine and a targeting evaluator implement the rules, while a flag
  cache keeps hot evaluations off the database and makes the read path cost
  microseconds rather than milliseconds.

Around that evaluation core sit three supporting planes.

- A control plane — the admin UI plus the rollout engine — lets engineers
  create, edit, and promote flags.
- An audit log records every change with actor and timestamp so "who changed
  what and when" is always answerable.
- A usage-metrics plane counts evaluations per flag and per route, so operators
  see which flags are hot and whether evaluation latency degrades.

Change propagation runs through the cache plus a pub/sub channel that pushes
invalidations to clients:

- A flag flip reaches the fleet in seconds instead of minutes.
- Because every application request may depend on a flag, the service must be
  ultra-available, low-latency, and carefully monitored.
- Flags are organized per environment, so the same key can hold independent
  state in development, staging, and production, and a promote action copies the
  reviewed state forward while recording it in the audit log.

### Q: How do you evaluate flags with low latency?

**A:** The evaluation path must stay off the database.

- The SDK keeps a local cache of flag rules and evaluates them client-side, so a
  flag check is a hash lookup with zero network round trips — this is the
  standard approach for mature flag services.
- On a cold start, or when the SDK is too constrained to cache, the evaluation
  goes to the flag API, which serves a bulk snapshot of all flag configurations
  for the environment from an in-memory cache.
- Server-side evaluation (for APIs without an SDK) reads the same snapshot and
  runs the same deterministic evaluator, so client and server never disagree
  about a flag's value.

Rules are compiled into a compact decision tree or an ordered condition list:

- Evaluation is a sequence of cheap comparisons rather than queries or joins.
- The flag API is stateless and scales horizontally; the only shared state is
  the snapshot cache, which is either sharded or replicated in-process per node.
- Determinism is a correctness property, not a performance nicety: the same
  context must yield the same result on any node, so evaluation is a pure
  function of context plus a version-stamped snapshot.

Request timeouts are short, and a flag outage degrades to the configured
default-on or default-off fallback rather than blocking the caller:

- Flag evaluation must never be a source of latency or outage for the
  applications that depend on it.

Batch evaluation exists too:

- Callers that need many flags, such as feature-gating a whole page, request a
  map of flag values in a single call, and the SDK caches the batch alongside
  individual evaluations.

### Q: How do you implement gradual rollouts and targeting?

**A:** A gradual rollout is a percentage gate layered on the rule evaluation.

- The engine hashes a stable identifier from the context — normally a user or
  session ID — to a value in [0, 100), then turns the flag on when the hash
  falls below the rollout percentage.
- Because the hash is deterministic, a user who is on at 50% rollout stays on
  when the rollout rises to 75%; users are never toggled backward unless the
  rollout itself is reduced.
- This makes rollout a smooth ramp of the treated population without flapping
  users between states on every config change.

Targeting layers on top of the gate with ordered rules:

- An allowlist for users who always get the new behavior (employees, QA,
  specific accounts), segment rules for country, plan, browser, or cohort, and
  percentage gates combined with AND/OR operators.
- The evaluator walks the rule list in priority order and returns the first
  match, which gives flag authors a natural precedence model.
- Rules are versioned so an in-flight rollout can be rolled back instantly by
  pointing the environment at the previous snapshot.

Advanced platforms support multi-variant flags rather than boolean on/off:

- A single rollout can compare several behaviors; the same hash-and-gate
  machinery picks the variant, and each variant can carry its own rollout curve.

Rollout safety rails guard the ramp:

- A kill-switch flag overrides all others, an approval gate requires sign-off
  past 50%, and automatic rollback triggers on error-rate or latency regressions
  measured in the usage-metrics plane.

### Q: How do you avoid cache stampedes on flag changes?

**A:** Two distinct stampedes matter, and they need different fixes.

The first is at the flag API:

- A snapshot is invalidated and every request node refetches it simultaneously,
  multiplying the load on the flag store by the node count.
- Mitigation is request coalescing — only one in-flight fetch per node, with
  concurrent callers awaiting the same promise — plus jittered expiry so caches
  on different nodes do not expire in lockstep.
- Stale snapshots remain servable during a refetch, so a fetch failure serves
  the previous version instead of erroring, which turns cache refetch into a
  background event rather than a correctness-critical path.

The second stampede is in the SDK fleet:

- When a flag flips to 100%, every client must learn about it, and pushing the
  change to every SDK would itself be a thundering herd.
- The service therefore uses a pull model with short polling, or a fan-out
  pub/sub channel that carries only a version counter, not the flag data.
- Each SDK compares the version and refetches the snapshot only when its local
  copy is stale, and refetches are staggered with jitter so the fleet does not
  request in sync.

The end result is bounded:

- A flag change propagates across the fleet in seconds while peak refetch load
  stays a small multiple of the steady-state rate — the system never turns one
  config edit into a self-inflicted denial of service.
- Capacity planning bounds the storm further: the flag store is sized for the
  refetch peak, and the pub/sub channel is monitored for lag so a propagation
  backlog is visible before it causes stale evaluations.

### Q: How do you audit who changed what and when?

**A:** Every mutation to a flag — create, enable, edit rules, change rollout, delete —
flows through the rollout engine:

- An immutable audit event is written before committing the change, so no
  mutation can silently escape the log.
- Each event records the actor (authenticated by the admin UI), the previous and
  new flag state, the environment, an optional change reason or ticket link, and
  a timestamp.

Because the log is append-only, it doubles as a source of truth for recovery:

- The current state of any flag can be reconstructed from the last mutation, and
  an incident can be answered with "this flag turned on for region X at 14:32 by
  user Y" without guesswork.

Audit records are keyed by flag and environment, indexed by time, and retained
for compliance windows.

- The same log powers safety features: diff views show exactly which rule
  changed, release pipelines can gate a promotion on approvals recorded in the
  log, and risky flags can require two-person approval that is written into the
  same trail.
- Because the audit write is on the mutation path rather than async, there is a
  small write-cost per flag change, which is the accepted price of a guarantee
  that every change is attributable.
- This makes the audit log both a compliance artifact and the operational
  backstop for debugging rollout incidents.

Retention is tiered:

- Hot audit events live in a fast store for interactive querying while older
  records archive to object storage, preserving the trail at low cost for the
  full compliance horizon.

## Source

```text
title: Feature Flags
node app: App SDK [round, icon=browser]
node api: Flag API [icon=server]
node store: Flag Store [cylinder, icon=database]
node cache: Flag Cache [cylinder, icon=cache]
node rollout: Rollout Engine [icon=compute]
node target: Targeting [icon=search]
node audit: Audit Log [icon=file]
node ui: Admin UI [icon=browser]
node notify: Webhooks [icon=message]
node metrics: Usage Metrics [icon=worker]

edge app -> api: evaluate
edge api -> cache: lookup
edge cache -> store: fallback
edge app -> api: flag check
edge ui -> rollout: update
edge rollout -> store: persist
edge rollout -> target: rules
edge rollout -> notify: publish
edge api -> audit: log
edge api -> metrics: count
```
