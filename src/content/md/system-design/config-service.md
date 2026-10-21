# Config Service

Design a distributed configuration service

**Difficulty:** Medium

**Tags:** infra, storage

## Functional Requirements

- a distributed configuration service
- version and rollback configs?
- push config changes to clients?
- validate config before rollout?
- handle secrets in config?

## Non-Functional Requirements

- A distributed configuration service centralizes the settings every service needs
  to run — feature flags, timeouts, resource limits, URLs, and tuning parameters —
  so that operators change one value and every node of every service eventually
  reflects it.

- The system separates a control plane from a data plane.
- Operators edit config in a portal that writes through an API gateway to a
  validation layer, which checks the change before committing an immutable
  version to a version store.
- An environment service scopes every value to a specific environment, so the
  same key can hold independent values in development, staging, and production,
  and a promotion flow copies reviewed changes forward between environments.

On the data plane, a publisher fans changes out to client SDKs embedded in every
service instance.

- Each SDK keeps a local, versioned cache of the config and reconciles it
  against the server so reads are in-memory and cheap.
- An audit log records every edit with actor and timestamp, making the service
  both a runtime dependency and a governance artifact.

The hard parts are consistency and availability.

- Config is read on hot paths, so the read path must stay off the database, but
  config also changes rarely, so the write path can be slow and deliberate.
- A configuration service that is down must never take down the services that
  depend on it; clients fall back to their last good cached version and retry
  the fetch in the background, so the failure mode is staleness, not outage..
- Latency targets shape the mechanism: environments that need
  sub-second propagation use the push channel, while batch and best-effort
  consumers rely on polling.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Config Service
admin: Operator
app: Config Portal
gateway: API Gateway
config: Config Service
env: Environment Service
version: Version Store
publish: Publisher
client: Client SDK
validate: Validation
audit: Audit Log
db: Config DB

admin ─► app ─► edit config
app ─► gateway ─► save
gateway ─► validate ─► check
validate ─► version ─► commit
version ─► env ─► scope
env ─► publish ─► push
publish ─► client ─► update
client ─► app ─► apply
config ─► audit ─► log
app ─► gateway ─► rollback
gateway ─► version ─► revert
```

## Design

### Design a distributed configuration service

A distributed configuration service centralizes the settings every service needs
to run — feature flags, timeouts, resource limits, URLs, and tuning parameters —
so that operators change one value and every node of every service eventually
reflects it.

- The system separates a control plane from a data plane.
- Operators edit config in a portal that writes through an API gateway to a
  validation layer, which checks the change before committing an immutable
  version to a version store.
- An environment service scopes every value to a specific environment, so the
  same key can hold independent values in development, staging, and production,
  and a promotion flow copies reviewed changes forward between environments.

On the data plane, a publisher fans changes out to client SDKs embedded in every
service instance.

- Each SDK keeps a local, versioned cache of the config and reconciles it
  against the server so reads are in-memory and cheap.
- An audit log records every edit with actor and timestamp, making the service
  both a runtime dependency and a governance artifact.

The hard parts are consistency and availability.

- Config is read on hot paths, so the read path must stay off the database, but
  config also changes rarely, so the write path can be slow and deliberate.
- A configuration service that is down must never take down the services that
  depend on it; clients fall back to their last good cached version and retry
  the fetch in the background, so the failure mode is staleness, not outage.

### How do you version and rollback configs?

Every mutation creates a new immutable version rather than overwriting state.

- The version store treats each commit as a snapshot of the full key set for an
  environment, stamped with a monotonically increasing version number, the
  operator identity, and a timestamp.
- Because versions are append-only, the entire history is preserved and any
  prior state can be reconstructed by reading a snapshot or replaying commits.
- The service also records a short reason or ticket reference with each change,
  which turns debugging from "what was the value yesterday" into "why did this
  value change and who approved it."

Rollback is then cheap and mechanical.

- Pointing the environment at a previous version triggers a new commit that
  restores that snapshot, and the normal publish path distributes it to every
  SDK.
- Because a rollback is itself a versioned commit, it shows up in the audit
  trail like any other change, and a rollback of a rollback is just another
  revert.
- The service retains a configurable retention window of versions so operators
  can inspect diffs between any two snapshots, and it flags rollbacks for review
  — a rollback that happens minutes after a rollout usually signals a failed
  deployment, and the audit log ties that story together.
- Versioning doubles as the foundation for rollouts, since a percentage-based
  rollout can be expressed as a version with a progressive population gate.
- Client SDKs echo back the version they are running, so operators see in real
  time how far a change has propagated and which instances are still holding an
  old snapshot.

### How do you push config changes to clients?

The push path is designed for a fleet of clients that cannot tolerate polling
thundering herds. Each SDK subscribes through a lightweight pub/sub channel that
carries a version counter or invalidation hint rather than the config payload
itself. When a change commits, the publisher broadcasts the new version number,
and every SDK compares it with its local version, fetching the full snapshot
only when its copy is stale. This decouples propagation from payload size: a
config with megabytes of rules still pushes a few bytes of notification, and
clients pull the data they actually need.

The pull side provides the safety net. SDKs that miss a notification — or that
lost connectivity — reconcile on a jittered poll interval, so the fleet
converges even if the pub/sub channel is down. Client SDKs cache config locally,
and on connection loss they keep serving the last known good version
indefinitely while logging staleness. To reach clients that cannot hold a
persistent connection, the publisher also exposes a versioned HTTP endpoint that
returns the latest snapshot plus a checksum, and long-polling or short polling
picks up the diff. Latency targets shape the mechanism: environments that need
sub-second propagation use the push channel, while batch and best-effort
consumers rely on polling. The end state is a system where changes reach all
clients in seconds, regardless of how many instances are subscribed. Delivery
guarantees are tuned per environment, from at-most-once notifications for
best-effort clients to acknowledgements and retries for subscribers that must
not miss a change.

### How do you validate config before rollout?

Validation runs before a config is ever committed, because a bad config at the
bottom of a dependency chain can take down an entire fleet. The validation layer
statically checks the change first: schema conformance, correct types, required
keys, allowed enum values, and reference integrity such as URLs and connection
strings that point at real endpoints. It also enforces cross-field invariants,
like a minimum larger than a maximum or a port within the valid range, which
catches the majority of operator typos before they reach any service.

Dynamic validation goes further by applying the proposed config to a synthetic
or canary workload. A dry-run mode renders the exact configuration object each
service type would receive, then loads it into a validation harness that
simulates startup and a representative request, surfacing parse errors or
missing keys that static checks miss. For high-risk changes the service supports
staged rollout validation: publish to a small canary environment, watch health
checks, error rates, and startup success for a watch window, and only then
promote to the full environment. Validation gates every step of the pipeline,
and a change that fails any gate is blocked with a precise error message rather
than silently committed. This makes config changes as reviewable as code changes
— tested, gated, and safe to apply, with the option to auto-rollback when
post-rollout health metrics regress. A validation summary is attached to each
committed version, so operators can audit exactly what was checked and which
gates a released change passed.

### How do you handle secrets in config?

Secrets are the one thing a configuration service must never treat like normal
config. Values such as database passwords, API keys, and signing material never
live in the version store, the cache, or the push payload; instead the config
stores a typed reference, like a secret key name, and the client SDK resolves
the actual value at runtime through a dedicated secret manager with its own
access control and audit trail. This separation means a config dump, a version
history view, or a debug log can never leak secret material, and secret rotation
is handled by the secret manager without any config change at all.

The secret manager enforces least privilege: each service and environment holds
a narrow set of permissions and can fetch only the secrets it is allowed to see,
with access logged for compliance. Secrets are encrypted in transit and at rest,
encrypted with per-environment keys, and rotated on a schedule with versioned
secret values so a rollback never exposes an old password. The config portal
shows only masked references, and writes into secret storage require separate
approval from config edits. Since the resolution happens on the client side,
SDKs fetch secrets lazily and cache them in memory only, never on disk, and they
fail closed when a secret is missing rather than booting with a blank value.
This design keeps the convenience of centralized config without making the
config service a single point of compromise for the entire infrastructure.

## Source

```text
title: Config Service
node admin: Operator [round, icon=browser]
node app: Config Portal [icon=browser]
node gateway: API Gateway [icon=server]
node config: Config Service [icon=compute]
node env: Environment Service [icon=compute]
node version: Version Store [cylinder, icon=database]
node publish: Publisher [icon=queue]
node client: Client SDK [icon=server]
node validate: Validation [icon=shield]
node audit: Audit Log [icon=file]
node db: Config DB [cylinder, icon=database]

edge admin -> app: edit config
edge app -> gateway: save
edge gateway -> validate: check
edge validate -> version: commit
edge version -> env: scope
edge env -> publish: push
edge publish -> client: update
edge client -> app: apply
edge config -> audit: log
edge app -> gateway: rollback
edge gateway -> version: revert
```

## Q&A

### Q: Design a distributed configuration service

**A:** A distributed configuration service centralizes the settings every service needs
to run — feature flags, timeouts, resource limits, URLs, and tuning parameters —
so that operators change one value and every node of every service eventually
reflects it.

- The system separates a control plane from a data plane.
- Operators edit config in a portal that writes through an API gateway to a
  validation layer, which checks the change before committing an immutable
  version to a version store.
- An environment service scopes every value to a specific environment, so the
  same key can hold independent values in development, staging, and production,
  and a promotion flow copies reviewed changes forward between environments.

On the data plane, a publisher fans changes out to client SDKs embedded in every
service instance.

- Each SDK keeps a local, versioned cache of the config and reconciles it
  against the server so reads are in-memory and cheap.
- An audit log records every edit with actor and timestamp, making the service
  both a runtime dependency and a governance artifact.

The hard parts are consistency and availability.

- Config is read on hot paths, so the read path must stay off the database, but
  config also changes rarely, so the write path can be slow and deliberate.
- A configuration service that is down must never take down the services that
  depend on it; clients fall back to their last good cached version and retry
  the fetch in the background, so the failure mode is staleness, not outage.

### Q: How do you version and rollback configs?

**A:** Every mutation creates a new immutable version rather than overwriting state.

- The version store treats each commit as a snapshot of the full key set for an
  environment, stamped with a monotonically increasing version number, the
  operator identity, and a timestamp.
- Because versions are append-only, the entire history is preserved and any
  prior state can be reconstructed by reading a snapshot or replaying commits.
- The service also records a short reason or ticket reference with each change,
  which turns debugging from "what was the value yesterday" into "why did this
  value change and who approved it."

Rollback is then cheap and mechanical.

- Pointing the environment at a previous version triggers a new commit that
  restores that snapshot, and the normal publish path distributes it to every
  SDK.
- Because a rollback is itself a versioned commit, it shows up in the audit
  trail like any other change, and a rollback of a rollback is just another
  revert.
- The service retains a configurable retention window of versions so operators
  can inspect diffs between any two snapshots, and it flags rollbacks for review
  — a rollback that happens minutes after a rollout usually signals a failed
  deployment, and the audit log ties that story together.
- Versioning doubles as the foundation for rollouts, since a percentage-based
  rollout can be expressed as a version with a progressive population gate.
- Client SDKs echo back the version they are running, so operators see in real
  time how far a change has propagated and which instances are still holding an
  old snapshot.

### Q: How do you push config changes to clients?

**A:** The push path is designed for a fleet of clients that cannot tolerate polling
thundering herds. Each SDK subscribes through a lightweight pub/sub channel that
carries a version counter or invalidation hint rather than the config payload
itself. When a change commits, the publisher broadcasts the new version number,
and every SDK compares it with its local version, fetching the full snapshot
only when its copy is stale. This decouples propagation from payload size: a
config with megabytes of rules still pushes a few bytes of notification, and
clients pull the data they actually need.

The pull side provides the safety net. SDKs that miss a notification — or that
lost connectivity — reconcile on a jittered poll interval, so the fleet
converges even if the pub/sub channel is down. Client SDKs cache config locally,
and on connection loss they keep serving the last known good version
indefinitely while logging staleness. To reach clients that cannot hold a
persistent connection, the publisher also exposes a versioned HTTP endpoint that
returns the latest snapshot plus a checksum, and long-polling or short polling
picks up the diff. Latency targets shape the mechanism: environments that need
sub-second propagation use the push channel, while batch and best-effort
consumers rely on polling. The end state is a system where changes reach all
clients in seconds, regardless of how many instances are subscribed. Delivery
guarantees are tuned per environment, from at-most-once notifications for
best-effort clients to acknowledgements and retries for subscribers that must
not miss a change.

### Q: How do you validate config before rollout?

**A:** Validation runs before a config is ever committed, because a bad config at the
bottom of a dependency chain can take down an entire fleet. The validation layer
statically checks the change first: schema conformance, correct types, required
keys, allowed enum values, and reference integrity such as URLs and connection
strings that point at real endpoints. It also enforces cross-field invariants,
like a minimum larger than a maximum or a port within the valid range, which
catches the majority of operator typos before they reach any service.

Dynamic validation goes further by applying the proposed config to a synthetic
or canary workload. A dry-run mode renders the exact configuration object each
service type would receive, then loads it into a validation harness that
simulates startup and a representative request, surfacing parse errors or
missing keys that static checks miss. For high-risk changes the service supports
staged rollout validation: publish to a small canary environment, watch health
checks, error rates, and startup success for a watch window, and only then
promote to the full environment. Validation gates every step of the pipeline,
and a change that fails any gate is blocked with a precise error message rather
than silently committed. This makes config changes as reviewable as code changes
— tested, gated, and safe to apply, with the option to auto-rollback when
post-rollout health metrics regress. A validation summary is attached to each
committed version, so operators can audit exactly what was checked and which
gates a released change passed.

### Q: How do you handle secrets in config?

**A:** Secrets are the one thing a configuration service must never treat like normal
config. Values such as database passwords, API keys, and signing material never
live in the version store, the cache, or the push payload; instead the config
stores a typed reference, like a secret key name, and the client SDK resolves
the actual value at runtime through a dedicated secret manager with its own
access control and audit trail. This separation means a config dump, a version
history view, or a debug log can never leak secret material, and secret rotation
is handled by the secret manager without any config change at all.

The secret manager enforces least privilege: each service and environment holds
a narrow set of permissions and can fetch only the secrets it is allowed to see,
with access logged for compliance. Secrets are encrypted in transit and at rest,
encrypted with per-environment keys, and rotated on a schedule with versioned
secret values so a rollback never exposes an old password. The config portal
shows only masked references, and writes into secret storage require separate
approval from config edits. Since the resolution happens on the client side,
SDKs fetch secrets lazily and cache them in memory only, never on disk, and they
fail closed when a secret is missing rather than booting with a blank value.
This design keeps the convenience of centralized config without making the
config service a single point of compromise for the entire infrastructure.

## Source

```text
title: Config Service
node admin: Operator [round, icon=browser]
node app: Config Portal [icon=browser]
node gateway: API Gateway [icon=server]
node config: Config Service [icon=compute]
node env: Environment Service [icon=compute]
node version: Version Store [cylinder, icon=database]
node publish: Publisher [icon=queue]
node client: Client SDK [icon=server]
node validate: Validation [icon=shield]
node audit: Audit Log [icon=file]
node db: Config DB [cylinder, icon=database]

edge admin -> app: edit config
edge app -> gateway: save
edge gateway -> validate: check
edge validate -> version: commit
edge version -> env: scope
edge env -> publish: push
edge publish -> client: update
edge client -> app: apply
edge config -> audit: log
edge app -> gateway: rollback
edge gateway -> version: revert
```
