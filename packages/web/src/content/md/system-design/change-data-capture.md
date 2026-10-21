# Change Data Capture

Design a change data capture pipeline

**Difficulty:** Hard

**Tags:** event-driven, logging

## Functional Requirements

- a change data capture pipeline
- capture changes from a database?
- keep downstream systems consistent?
- handle schema changes?
- replay from a point in time?

## Non-Functional Requirements

- Change data capture (CDC) turns the database's own change stream into a durable,
  queryable event log that other systems consume.

- Instead of a source system calling out to every consumer after each write, CDC
  observes the database directly and publishes inserts, updates, and deletes as
  ordered events, so downstream systems (search indexes, caches, analytics
  warehouses, other databases) stay in sync without coupling their correctness
  to the application's post-write notification logic.

The pipeline has four stages.

- Capture reads the change stream from the source database.
- Publish writes those changes to a durable log such as Kafka, ordered per key
  and replays-by-offset.
- Transform enriches, filters, or re-shapes the records for specific consumers,
  often with schema-driven serialization.
- Apply delivers to downstream sinks, typically with idempotent semantics so
  redelivery is harmless.
- The diagram in the source block shows exactly this shape: a CDC agent tails
  the WAL, a parser decodes changes into a change topic, a transformer enriches,
  and sinks apply the result, with a checkpoint store recording consumed
  offsets.

The crucial design decision is ordering versus throughput.

- Change events for a single row must stay in order or the final state is wrong,
  so the log keys events by the row's primary key, which gives per-row ordering
  at the cost of losing global order across rows.
- Most consumers only need per-entity ordering, so this is the right trade.
- The pipeline is also a single source of truth for data movement: consumers
  never poll the source database, which would add read load and re-introduce the
  coupling CDC exists to remove..
- The reliable mechanism is log-based capture, reading the database's write-ahead
  log (WAL) or its replication stream, because the WAL contains every committed
  mutation as an ordered sequence that survives crashes.

- The CDC agent acts as a replica: it connects to the source as a reader,
  receives each change record (old and new row values plus metadata like
  transaction id), and publishes it to the change topic.
- Because the WAL is the database's own durability record, the agent never
  misses a committed change even if the application layer is broken — which is
  the fundamental advantage over trigger or application-level capture, where the
  change is lost if the notifier fails.

Log-based capture does require the database to retain log entries long enough
for the agent to consume them, so retention sizing is part of the design.

- The agent maintains a checkpoint — the last published log position — persisted
  periodically to a durable store.
- On startup or crash recovery it resumes from the checkpoint, not from zero, so
  a restart re-processes only the small window of changes after the last
  checkpoint.
- Checkpointing frequency trades durability against overhead: checkpoints that
  are too frequent add write load, while rare checkpoints lengthen the re-scan
  on recovery.

Alternatives exist but are weaker.

- Polling a change timestamp column only catches inserts and updates that set
  the column, misses deletes, and is non-deterministic under concurrent writes.
- Triggers add per-write latency and store into a side table that can be
  inconsistent with the main table under a crash.
- Both are reasonable only when the source cannot expose a WAL.
- The practice is to prefer WAL capture, validate it with a periodic
  reconciliation job, and design consumers to tolerate duplicates and
  out-of-order arrival anyway, because redelivery is inherent to distributed
  delivery..
- Consistency across systems is achieved by making the change log the ordering
  authority and by making every consumer idempotent.

- Each change event carries a primary key and a version (the source's update
  timestamp or an ever-increasing log offset).
- Consumers apply changes in offset order per key and ignore any event with a
  version not newer than what they already hold, so even if the same change is
  delivered twice, or a stale event arrives late, the sink converges to the
  latest value.
- This "last write wins with version check" discipline turns eventual
  consistency into a bounded, self-healing property.

A second lever is atomic publication plus outbox pattern on the source side.

- If the application must guarantee that a business operation and its change
  event both happen or neither happens, the source writes to a transactionally
  consistent outbox table in the same transaction as the business data.
- CDC then captures the outbox — the log of the same commit — so consumers see
  an event for every committed operation with exactly-once-per-commit semantics
  at the source.
- This removes the classic race where an external notification happens even
  though the transaction rolled back.

The sink must define its consistency target.

- A search index or cache usually needs at-most-minutes staleness and can apply
  idempotent upserts.
- An analytics warehouse wants at-least-once with deduplication on load.
- A second database in the same region can accept near-real-time lag but needs
  ordering preserved.
- The pipeline makes each consumer's job easier by emitting full row snapshots
  on updates rather than deltas, so a consumer can apply an update without
  joining against the old value.
- Health is monitored by tracking the lag between the last published offset and
  the last applied offset per sink, alerting when lag grows beyond its budget..
- The discipline is
  compatibility.

- Every published change event is versioned, and the version describes the
  schema it conforms to.
- The pipeline holds a schema registry that maps version numbers to schemas and
  enforces evolution rules — adding an optional field is safe, renaming or
  changing a field's type is a breaking change that requires coordinated
  rollout.
- Consumers read the version and decode accordingly, and the registry keeps
  every historical version so replay works even after the current schema has
  moved on.

The pipeline handles schema evolution by decoupling source change from consumer
change.

- The capture layer must be tolerant of additive changes: a new column appears
  in the WAL, and the parser emits records with the new field without breaking
  consumers that ignore unknown fields.
- A removed column is handled by backfilling a default during a transition
  window.
- The transform layer can absorb breaking changes for consumers that have not
  migrated by maintaining a compatibility projection — serving the old shape
  until all consumers upgrade — which lets the source migrate independently of
  consumers.

Breaking changes need an explicit, ordered rollout rather than hope.

- The sequence is: register the new schema version, release the consumer to
  accept both old and new, run the source migration, then drop the old version.
- Because events are versioned and the registry is durable, a consumer that
  missed the transition can still decode historical records.
- The registry also doubles as documentation and drift detection: a diff between
  the source's declared schema and the registry's recorded version flags
  unexpected writes before they poison downstream systems..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Change Data Capture
source: Source DB
agent: CDC Agent
gateway: API Gateway
log: WAL Reader
parse: Change Parser
topic: Change Topic
sink: Downstream Sinks
transform: Transformer
schema: Schema Registry
checkpoint: Checkpoint Store
db: CDC State DB

source ─► log ─► changes
agent ─► gateway ─► tail
gateway ─► parse ─► decode
parse ─► topic ─► publish
topic ─► transform ─► enrich
transform ─► sink ─► apply
topic ─► schema ─► register
agent ─► checkpoint ─► offset
checkpoint ─► db ─► save
agent ─► log ─► resume
parse ─► db ─► state
```

## Design

### Design a change data capture pipeline

Change data capture (CDC) turns the database's own change stream into a durable,
queryable event log that other systems consume.

- Instead of a source system calling out to every consumer after each write, CDC
  observes the database directly and publishes inserts, updates, and deletes as
  ordered events, so downstream systems (search indexes, caches, analytics
  warehouses, other databases) stay in sync without coupling their correctness
  to the application's post-write notification logic.

The pipeline has four stages.

- Capture reads the change stream from the source database.
- Publish writes those changes to a durable log such as Kafka, ordered per key
  and replays-by-offset.
- Transform enriches, filters, or re-shapes the records for specific consumers,
  often with schema-driven serialization.
- Apply delivers to downstream sinks, typically with idempotent semantics so
  redelivery is harmless.
- The diagram in the source block shows exactly this shape: a CDC agent tails
  the WAL, a parser decodes changes into a change topic, a transformer enriches,
  and sinks apply the result, with a checkpoint store recording consumed
  offsets.

The crucial design decision is ordering versus throughput.

- Change events for a single row must stay in order or the final state is wrong,
  so the log keys events by the row's primary key, which gives per-row ordering
  at the cost of losing global order across rows.
- Most consumers only need per-entity ordering, so this is the right trade.
- The pipeline is also a single source of truth for data movement: consumers
  never poll the source database, which would add read load and re-introduce the
  coupling CDC exists to remove.

### How do you capture changes from a database?

The reliable mechanism is log-based capture, reading the database's write-ahead
log (WAL) or its replication stream, because the WAL contains every committed
mutation as an ordered sequence that survives crashes.

- The CDC agent acts as a replica: it connects to the source as a reader,
  receives each change record (old and new row values plus metadata like
  transaction id), and publishes it to the change topic.
- Because the WAL is the database's own durability record, the agent never
  misses a committed change even if the application layer is broken — which is
  the fundamental advantage over trigger or application-level capture, where the
  change is lost if the notifier fails.

Log-based capture does require the database to retain log entries long enough
for the agent to consume them, so retention sizing is part of the design.

- The agent maintains a checkpoint — the last published log position — persisted
  periodically to a durable store.
- On startup or crash recovery it resumes from the checkpoint, not from zero, so
  a restart re-processes only the small window of changes after the last
  checkpoint.
- Checkpointing frequency trades durability against overhead: checkpoints that
  are too frequent add write load, while rare checkpoints lengthen the re-scan
  on recovery.

Alternatives exist but are weaker.

- Polling a change timestamp column only catches inserts and updates that set
  the column, misses deletes, and is non-deterministic under concurrent writes.
- Triggers add per-write latency and store into a side table that can be
  inconsistent with the main table under a crash.
- Both are reasonable only when the source cannot expose a WAL.
- The practice is to prefer WAL capture, validate it with a periodic
  reconciliation job, and design consumers to tolerate duplicates and
  out-of-order arrival anyway, because redelivery is inherent to distributed
  delivery.

### How do you keep downstream systems consistent?

Consistency across systems is achieved by making the change log the ordering
authority and by making every consumer idempotent.

- Each change event carries a primary key and a version (the source's update
  timestamp or an ever-increasing log offset).
- Consumers apply changes in offset order per key and ignore any event with a
  version not newer than what they already hold, so even if the same change is
  delivered twice, or a stale event arrives late, the sink converges to the
  latest value.
- This "last write wins with version check" discipline turns eventual
  consistency into a bounded, self-healing property.

A second lever is atomic publication plus outbox pattern on the source side.

- If the application must guarantee that a business operation and its change
  event both happen or neither happens, the source writes to a transactionally
  consistent outbox table in the same transaction as the business data.
- CDC then captures the outbox — the log of the same commit — so consumers see
  an event for every committed operation with exactly-once-per-commit semantics
  at the source.
- This removes the classic race where an external notification happens even
  though the transaction rolled back.

The sink must define its consistency target.

- A search index or cache usually needs at-most-minutes staleness and can apply
  idempotent upserts.
- An analytics warehouse wants at-least-once with deduplication on load.
- A second database in the same region can accept near-real-time lag but needs
  ordering preserved.
- The pipeline makes each consumer's job easier by emitting full row snapshots
  on updates rather than deltas, so a consumer can apply an update without
  joining against the old value.
- Health is monitored by tracking the lag between the last published offset and
  the last applied offset per sink, alerting when lag grows beyond its budget.

### How do you handle schema changes?

Schema changes are the highest-risk event in a CDC pipeline because source and
consumer can disagree about the shape of a record. The discipline is
compatibility.

- Every published change event is versioned, and the version describes the
  schema it conforms to.
- The pipeline holds a schema registry that maps version numbers to schemas and
  enforces evolution rules — adding an optional field is safe, renaming or
  changing a field's type is a breaking change that requires coordinated
  rollout.
- Consumers read the version and decode accordingly, and the registry keeps
  every historical version so replay works even after the current schema has
  moved on.

The pipeline handles schema evolution by decoupling source change from consumer
change.

- The capture layer must be tolerant of additive changes: a new column appears
  in the WAL, and the parser emits records with the new field without breaking
  consumers that ignore unknown fields.
- A removed column is handled by backfilling a default during a transition
  window.
- The transform layer can absorb breaking changes for consumers that have not
  migrated by maintaining a compatibility projection — serving the old shape
  until all consumers upgrade — which lets the source migrate independently of
  consumers.

Breaking changes need an explicit, ordered rollout rather than hope.

- The sequence is: register the new schema version, release the consumer to
  accept both old and new, run the source migration, then drop the old version.
- Because events are versioned and the registry is durable, a consumer that
  missed the transition can still decode historical records.
- The registry also doubles as documentation and drift detection: a diff between
  the source's declared schema and the registry's recorded version flags
  unexpected writes before they poison downstream systems.

### How do you replay from a point in time?

Replay is the property that makes CDC a safety net rather than just a feed.

- It rests on the change topic being durable and offset-addressed: every event
  has a stable log position and the topic retains data for a retention window,
  so a consumer can re-read from any position in that window.
- Replay means starting a consumer at a chosen offset and processing forward
  from there, which is exactly how a new consumer bootstraps without requiring
  the source database to hold state for it.

Bootstrap-to-replay is the key pattern.

- A consumer that starts from scratch first loads a consistent snapshot of the
  source, then applies all changes after the snapshot's point-in-time.
- The pipeline supports this by making snapshots point-in-time consistent: the
  snapshot captures a position (a log offset or a transaction id), the consumer
  loads the snapshot, then replays the log from that position forward, merging
  to the current state.
- Storing a table of snapshot-to-offset mappings lets any consumer be rebuilt at
  any historical point within the retention window.
- For repairs, replay into a broken sink happens on the same idempotent path
  used for live delivery, so the sink converges instead of corrupting.

Replay is also the mechanism for correctness fixes.

- When a transformer had a bug that mis-shaped events for a period, operators
  fix the transformer and re-run that offset range into the affected sink.
- The WAL reader itself replays from its checkpoint after a crash, which is a
  bounded, automatic replay of the un-acked window.
- Boundaries come from storage economics: deep replay requires retention, and
  retention costs money, so the pipeline tiers replay depth — minutes of hot
  in-memory retention for rapid debugging, days or weeks of durable retention on
  tiered storage for full rebuilds, and snapshot-based bootstrap beyond the
  retention window.

## Source

```text
title: Change Data Capture
node source: Source DB [cylinder, icon=database]
node agent: CDC Agent [icon=worker]
node gateway: API Gateway [icon=server]
node log: WAL Reader [icon=compute]
node parse: Change Parser [icon=compute]
node topic: Change Topic [icon=queue]
node sink: Downstream Sinks [icon=cloud]
node transform: Transformer [icon=compute]
node schema: Schema Registry [cylinder, icon=database]
node checkpoint: Checkpoint Store [icon=cache]
node db: CDC State DB [cylinder, icon=database]

edge source -> log: changes
edge agent -> gateway: tail
edge gateway -> parse: decode
edge parse -> topic: publish
edge topic -> transform: enrich
edge transform -> sink: apply
edge topic -> schema: register
edge agent -> checkpoint: offset
edge checkpoint -> db: save
edge agent -> log: resume
edge parse -> db: state
```

## Q&A

### Q: Design a change data capture pipeline

**A:** Change data capture (CDC) turns the database's own change stream into a durable,
queryable event log that other systems consume.

- Instead of a source system calling out to every consumer after each write, CDC
  observes the database directly and publishes inserts, updates, and deletes as
  ordered events, so downstream systems (search indexes, caches, analytics
  warehouses, other databases) stay in sync without coupling their correctness
  to the application's post-write notification logic.

The pipeline has four stages.

- Capture reads the change stream from the source database.
- Publish writes those changes to a durable log such as Kafka, ordered per key
  and replays-by-offset.
- Transform enriches, filters, or re-shapes the records for specific consumers,
  often with schema-driven serialization.
- Apply delivers to downstream sinks, typically with idempotent semantics so
  redelivery is harmless.
- The diagram in the source block shows exactly this shape: a CDC agent tails
  the WAL, a parser decodes changes into a change topic, a transformer enriches,
  and sinks apply the result, with a checkpoint store recording consumed
  offsets.

The crucial design decision is ordering versus throughput.

- Change events for a single row must stay in order or the final state is wrong,
  so the log keys events by the row's primary key, which gives per-row ordering
  at the cost of losing global order across rows.
- Most consumers only need per-entity ordering, so this is the right trade.
- The pipeline is also a single source of truth for data movement: consumers
  never poll the source database, which would add read load and re-introduce the
  coupling CDC exists to remove.

### Q: How do you capture changes from a database?

**A:** The reliable mechanism is log-based capture, reading the database's write-ahead
log (WAL) or its replication stream, because the WAL contains every committed
mutation as an ordered sequence that survives crashes.

- The CDC agent acts as a replica: it connects to the source as a reader,
  receives each change record (old and new row values plus metadata like
  transaction id), and publishes it to the change topic.
- Because the WAL is the database's own durability record, the agent never
  misses a committed change even if the application layer is broken — which is
  the fundamental advantage over trigger or application-level capture, where the
  change is lost if the notifier fails.

Log-based capture does require the database to retain log entries long enough
for the agent to consume them, so retention sizing is part of the design.

- The agent maintains a checkpoint — the last published log position — persisted
  periodically to a durable store.
- On startup or crash recovery it resumes from the checkpoint, not from zero, so
  a restart re-processes only the small window of changes after the last
  checkpoint.
- Checkpointing frequency trades durability against overhead: checkpoints that
  are too frequent add write load, while rare checkpoints lengthen the re-scan
  on recovery.

Alternatives exist but are weaker.

- Polling a change timestamp column only catches inserts and updates that set
  the column, misses deletes, and is non-deterministic under concurrent writes.
- Triggers add per-write latency and store into a side table that can be
  inconsistent with the main table under a crash.
- Both are reasonable only when the source cannot expose a WAL.
- The practice is to prefer WAL capture, validate it with a periodic
  reconciliation job, and design consumers to tolerate duplicates and
  out-of-order arrival anyway, because redelivery is inherent to distributed
  delivery.

### Q: How do you keep downstream systems consistent?

**A:** Consistency across systems is achieved by making the change log the ordering
authority and by making every consumer idempotent.

- Each change event carries a primary key and a version (the source's update
  timestamp or an ever-increasing log offset).
- Consumers apply changes in offset order per key and ignore any event with a
  version not newer than what they already hold, so even if the same change is
  delivered twice, or a stale event arrives late, the sink converges to the
  latest value.
- This "last write wins with version check" discipline turns eventual
  consistency into a bounded, self-healing property.

A second lever is atomic publication plus outbox pattern on the source side.

- If the application must guarantee that a business operation and its change
  event both happen or neither happens, the source writes to a transactionally
  consistent outbox table in the same transaction as the business data.
- CDC then captures the outbox — the log of the same commit — so consumers see
  an event for every committed operation with exactly-once-per-commit semantics
  at the source.
- This removes the classic race where an external notification happens even
  though the transaction rolled back.

The sink must define its consistency target.

- A search index or cache usually needs at-most-minutes staleness and can apply
  idempotent upserts.
- An analytics warehouse wants at-least-once with deduplication on load.
- A second database in the same region can accept near-real-time lag but needs
  ordering preserved.
- The pipeline makes each consumer's job easier by emitting full row snapshots
  on updates rather than deltas, so a consumer can apply an update without
  joining against the old value.
- Health is monitored by tracking the lag between the last published offset and
  the last applied offset per sink, alerting when lag grows beyond its budget.

### Q: How do you handle schema changes?

**A:** Schema changes are the highest-risk event in a CDC pipeline because source and
consumer can disagree about the shape of a record. The discipline is
compatibility.

- Every published change event is versioned, and the version describes the
  schema it conforms to.
- The pipeline holds a schema registry that maps version numbers to schemas and
  enforces evolution rules — adding an optional field is safe, renaming or
  changing a field's type is a breaking change that requires coordinated
  rollout.
- Consumers read the version and decode accordingly, and the registry keeps
  every historical version so replay works even after the current schema has
  moved on.

The pipeline handles schema evolution by decoupling source change from consumer
change.

- The capture layer must be tolerant of additive changes: a new column appears
  in the WAL, and the parser emits records with the new field without breaking
  consumers that ignore unknown fields.
- A removed column is handled by backfilling a default during a transition
  window.
- The transform layer can absorb breaking changes for consumers that have not
  migrated by maintaining a compatibility projection — serving the old shape
  until all consumers upgrade — which lets the source migrate independently of
  consumers.

Breaking changes need an explicit, ordered rollout rather than hope.

- The sequence is: register the new schema version, release the consumer to
  accept both old and new, run the source migration, then drop the old version.
- Because events are versioned and the registry is durable, a consumer that
  missed the transition can still decode historical records.
- The registry also doubles as documentation and drift detection: a diff between
  the source's declared schema and the registry's recorded version flags
  unexpected writes before they poison downstream systems.

### Q: How do you replay from a point in time?

**A:** Replay is the property that makes CDC a safety net rather than just a feed.

- It rests on the change topic being durable and offset-addressed: every event
  has a stable log position and the topic retains data for a retention window,
  so a consumer can re-read from any position in that window.
- Replay means starting a consumer at a chosen offset and processing forward
  from there, which is exactly how a new consumer bootstraps without requiring
  the source database to hold state for it.

Bootstrap-to-replay is the key pattern.

- A consumer that starts from scratch first loads a consistent snapshot of the
  source, then applies all changes after the snapshot's point-in-time.
- The pipeline supports this by making snapshots point-in-time consistent: the
  snapshot captures a position (a log offset or a transaction id), the consumer
  loads the snapshot, then replays the log from that position forward, merging
  to the current state.
- Storing a table of snapshot-to-offset mappings lets any consumer be rebuilt at
  any historical point within the retention window.
- For repairs, replay into a broken sink happens on the same idempotent path
  used for live delivery, so the sink converges instead of corrupting.

Replay is also the mechanism for correctness fixes.

- When a transformer had a bug that mis-shaped events for a period, operators
  fix the transformer and re-run that offset range into the affected sink.
- The WAL reader itself replays from its checkpoint after a crash, which is a
  bounded, automatic replay of the un-acked window.
- Boundaries come from storage economics: deep replay requires retention, and
  retention costs money, so the pipeline tiers replay depth — minutes of hot
  in-memory retention for rapid debugging, days or weeks of durable retention on
  tiered storage for full rebuilds, and snapshot-based bootstrap beyond the
  retention window.

## Source

```text
title: Change Data Capture
node source: Source DB [cylinder, icon=database]
node agent: CDC Agent [icon=worker]
node gateway: API Gateway [icon=server]
node log: WAL Reader [icon=compute]
node parse: Change Parser [icon=compute]
node topic: Change Topic [icon=queue]
node sink: Downstream Sinks [icon=cloud]
node transform: Transformer [icon=compute]
node schema: Schema Registry [cylinder, icon=database]
node checkpoint: Checkpoint Store [icon=cache]
node db: CDC State DB [cylinder, icon=database]

edge source -> log: changes
edge agent -> gateway: tail
edge gateway -> parse: decode
edge parse -> topic: publish
edge topic -> transform: enrich
edge transform -> sink: apply
edge topic -> schema: register
edge agent -> checkpoint: offset
edge checkpoint -> db: save
edge agent -> log: resume
edge parse -> db: state
```
