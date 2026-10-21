# Stream Processing

Design a stream processing system

**Difficulty:** Medium

**Tags:** event-driven, realtime

## Functional Requirements

- a stream processing system
- guarantee exactly-once semantics?
- handle windowing and out-of-order events?
- scale stream operators?
- handle stream reprocessing?

## Non-Functional Requirements

- A stream processing system ingests a continuous flow of events and computes
  results over them in real time, rather than waiting for batch loads.

- The architecture starts with a topic cluster — a durable, partitioned log that
  holds events and is the source of truth for everything downstream.
- Producers publish through the gateway, and consumers subscribe to partitions
  and process events in order.
- Around consumption sit the operators: windowing buckets events into time
  intervals, aggregations compute running results, joins combine streams on
  keys, and output sinks emit results to downstream systems.
- The state store holds the per-operator state that the computation needs, and
  the checkpoints database records progress so the pipeline can recover.

The design has two defining tensions.

- The first is statefulness: most useful processing is not a stateless map but a
  stateful aggregate that must remember what it has seen, so state is treated as
  a first-class component with its own storage, backup, and recovery.
- The second is the correctness contract: at-least-once is easy, exactly-once is
  hard, and the system must choose one and make it cheap enough to use.

The pipeline is also elastic — operators scale horizontally by partitioning the
keyspace across parallel tasks — and recoverable, since consumers can always go
back to the topic and replay.

- The result is a system that trades batch's ability to recompute anything for
  the ability to answer a query with sub-second freshness.
- Operational concerns complete the design: monitoring tracks end-to-end
  latency, lag per partition, and state size, so operators can see where a
  pipeline is slow or a topic is falling behind before users notice..
- Exactly-once means every event contributes to the result exactly once even when
  the pipeline retries, fails, and restarts.

The system combines three mechanisms.

- The source is durable and offset-based: each event has a stable identity in
  the topic, and the consumer commits its read offset only after the event's
  effects are complete, so a restart re-reads from the committed offset and
  never skips or duplicates within a partition.
- The state store is transactional: updates to operator state and the output
  being emitted are written atomically with the checkpoint, so an operator
  cannot end up in a state where its output went out but its state did not
  advance.

The third mechanism is idempotent sinks and output commits.

- If the sink — a database or message queue — is transaction-capable, the
  operator writes its results and the checkpoint marker in the same transaction,
  so the sink and the pipeline state commit or fail together.
- Where the sink cannot transact, the pipeline writes through a staging topic
  and a sink writer performs the final deduplicated apply, using event IDs to
  make the apply idempotent.

The cost is real:

- Transactional checkpointing adds latency and storage, so exactly-once is
  applied per pipeline and per sink, not globally for free.
- The guarantee is end-to-end only if every hop participates — source,
  processing, sink — and the pipeline makes each hop's contract explicit so a
  chain of exactly-once segments yields an exactly-once end-to-end result.
- The checkpoint cadence is also a tunable: frequent checkpoints shorten
  recovery but add overhead, so the pipeline lets operators trade recovery time
  against checkpoint cost per job..
- Windowing converts an unbounded stream into finite, queryable pieces.

- The operator assigns each event to a window by its event timestamp — tumbling
  windows partition time into fixed non-overlapping intervals, sliding windows
  overlap, and session windows close after a gap of inactivity.
- The choice depends on the query: counting page views wants tumbling, a moving
  average wants sliding, and grouping a user's activity wants sessions.
- Windows are processed with watermark logic: the watermark is the system's
  estimate of the latest time by which all earlier events have arrived, and a
  window closes when the watermark passes its end, so the operator emits a
  complete result rather than a guess.

Out-of-order events are the reason watermarks exist.

- Network and producer delays mean events can arrive minutes after earlier
  events of the same window, so the system buffers a window's events until its
  watermark passes, then emits and discards the state.
- No estimate is perfect, so the system supports late-data handling: late events
  after a window closed can update the result within a bounded late window, be
  routed to a separate stream for correction, or be dropped if the application
  only needs near-real-time accuracy.
- The engine also tracks event-time lag per partition so operators can see how
  far behind the processing is.

The tension is fundamental — holding windows open longer improves accuracy but
increases state and latency — so the watermark and late-window policies are
tunable per query rather than baked in, and the tuning is exposed through the
query interface..

- Stream operators scale by partitioning, the same trick that scales the topic.

- Each logical stream is split into parallel partitions, and each operator task
  processes a subset of the partitions independently, so throughput scales
  linearly with the number of tasks.
- The keyspace distribution decides correctness: events that must be aggregated
  together — all events for a user, all clicks for a session — are hashed to the
  same partition, so the operator holds the complete state for its keys without
  shuffling.
- A stateless operator, like a filter, can process any partition with any task,
  while a stateful operator pins each key to a task because the state lives with
  the task.

State is what makes scaling hard.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Stream Processing
source: Event Sources
app: Producer App
gateway: API Gateway
topic: Topic Cluster
consume: Consumers
window: Windowing
agg: Aggregations
join: Stream Joins
state: State Store
sink: Output Sinks
db: Checkpoints DB

source ─► app ─► events
app ─► gateway ─► produce
gateway ─► topic ─► publish
topic ─► consume ─► subscribe
consume ─► window ─► bucket
window ─► agg ─► aggregate
agg ─► join ─► combine
join ─► sink ─► emit
consume ─► state ─► checkpoint
state ─► db ─► persist
topic ─► app ─► replay
```

## Design

### Design a stream processing system

A stream processing system ingests a continuous flow of events and computes
results over them in real time, rather than waiting for batch loads.

- The architecture starts with a topic cluster — a durable, partitioned log that
  holds events and is the source of truth for everything downstream.
- Producers publish through the gateway, and consumers subscribe to partitions
  and process events in order.
- Around consumption sit the operators: windowing buckets events into time
  intervals, aggregations compute running results, joins combine streams on
  keys, and output sinks emit results to downstream systems.
- The state store holds the per-operator state that the computation needs, and
  the checkpoints database records progress so the pipeline can recover.

The design has two defining tensions.

- The first is statefulness: most useful processing is not a stateless map but a
  stateful aggregate that must remember what it has seen, so state is treated as
  a first-class component with its own storage, backup, and recovery.
- The second is the correctness contract: at-least-once is easy, exactly-once is
  hard, and the system must choose one and make it cheap enough to use.

The pipeline is also elastic — operators scale horizontally by partitioning the
keyspace across parallel tasks — and recoverable, since consumers can always go
back to the topic and replay.

- The result is a system that trades batch's ability to recompute anything for
  the ability to answer a query with sub-second freshness.
- Operational concerns complete the design: monitoring tracks end-to-end
  latency, lag per partition, and state size, so operators can see where a
  pipeline is slow or a topic is falling behind before users notice.

### How do you guarantee exactly-once semantics?

Exactly-once means every event contributes to the result exactly once even when
the pipeline retries, fails, and restarts.

The system combines three mechanisms.

- The source is durable and offset-based: each event has a stable identity in
  the topic, and the consumer commits its read offset only after the event's
  effects are complete, so a restart re-reads from the committed offset and
  never skips or duplicates within a partition.
- The state store is transactional: updates to operator state and the output
  being emitted are written atomically with the checkpoint, so an operator
  cannot end up in a state where its output went out but its state did not
  advance.

The third mechanism is idempotent sinks and output commits.

- If the sink — a database or message queue — is transaction-capable, the
  operator writes its results and the checkpoint marker in the same transaction,
  so the sink and the pipeline state commit or fail together.
- Where the sink cannot transact, the pipeline writes through a staging topic
  and a sink writer performs the final deduplicated apply, using event IDs to
  make the apply idempotent.

The cost is real:

- Transactional checkpointing adds latency and storage, so exactly-once is
  applied per pipeline and per sink, not globally for free.
- The guarantee is end-to-end only if every hop participates — source,
  processing, sink — and the pipeline makes each hop's contract explicit so a
  chain of exactly-once segments yields an exactly-once end-to-end result.
- The checkpoint cadence is also a tunable: frequent checkpoints shorten
  recovery but add overhead, so the pipeline lets operators trade recovery time
  against checkpoint cost per job.

### How do you handle windowing and out-of-order events?

Windowing converts an unbounded stream into finite, queryable pieces.

- The operator assigns each event to a window by its event timestamp — tumbling
  windows partition time into fixed non-overlapping intervals, sliding windows
  overlap, and session windows close after a gap of inactivity.
- The choice depends on the query: counting page views wants tumbling, a moving
  average wants sliding, and grouping a user's activity wants sessions.
- Windows are processed with watermark logic: the watermark is the system's
  estimate of the latest time by which all earlier events have arrived, and a
  window closes when the watermark passes its end, so the operator emits a
  complete result rather than a guess.

Out-of-order events are the reason watermarks exist.

- Network and producer delays mean events can arrive minutes after earlier
  events of the same window, so the system buffers a window's events until its
  watermark passes, then emits and discards the state.
- No estimate is perfect, so the system supports late-data handling: late events
  after a window closed can update the result within a bounded late window, be
  routed to a separate stream for correction, or be dropped if the application
  only needs near-real-time accuracy.
- The engine also tracks event-time lag per partition so operators can see how
  far behind the processing is.

The tension is fundamental — holding windows open longer improves accuracy but
increases state and latency — so the watermark and late-window policies are
tunable per query rather than baked in, and the tuning is exposed through the
query interface.

### How do you scale stream operators?

Stream operators scale by partitioning, the same trick that scales the topic.

- Each logical stream is split into parallel partitions, and each operator task
  processes a subset of the partitions independently, so throughput scales
  linearly with the number of tasks.
- The keyspace distribution decides correctness: events that must be aggregated
  together — all events for a user, all clicks for a session — are hashed to the
  same partition, so the operator holds the complete state for its keys without
  shuffling.
- A stateless operator, like a filter, can process any partition with any task,
  while a stateful operator pins each key to a task because the state lives with
  the task.

State is what makes scaling hard. When the pipeline adds tasks, keys must
migrate between tasks, and their state moves with them; the engine performs a
rebalance that re-shards the state store and lets old and new tasks drain and
catch up so no key is processed by two tasks at once. The state store itself is
a distributed store sharded by the same keyspace, so it scales with the
operators and survives task failure. Backpressure completes the picture: if a
downstream sink is slow, the consumers lag, and the engine signals the slower
producers through the topic's buffering and retention rather than unboundedly
accumulating. The design goal is that adding a task should increase aggregate
throughput while each individual event path stays identical — scaling changes
the number of lanes, not the semantics.

### How do you handle stream reprocessing?

Reprocessing replays a stream from an earlier point, and it must be a routine
operation because deployments, bug fixes, and corrected logic all require
recomputing history. The foundation is the topic's retention and replay
capability: events are stored durably with their offsets, and a consumer can
subscribe from any offset or any timestamp, not just the latest. To reprocess,
the operator starts a new application instance pointed at the past, with a fresh
state store, and replays the events forward; the checkpoint database lets the
instance restart mid-replay if it fails. The output of a reprocessing run is a
new dataset — a new table or topic — which is then swapped in atomically once
the run catches up to the present, so live consumers see a consistent switch
rather than partial results.

Three design decisions make reprocessing practical. First, the pipeline must be
deterministic: replaying the same events must produce the same output, which is
why operators avoid wall-clock time in computation and use event time instead.
Second, the output swap must be atomic from the consumer's point of view, which
is why results go to a versioned sink and the swap is a metadata flip rather
than a data migration. Third, replay must not disturb the live pipeline, so
reprocessing runs in parallel with lower priority or in a separate environment.
The combination of durable storage, deterministic operators, and atomic output
swap turns reprocessing from a risky operation into a standard tool for fixing a
wrong computation without waiting for a nightly batch.

## Source

```text
title: Stream Processing
node source: Event Sources [icon=cloud]
node app: Producer App [icon=browser]
node gateway: API Gateway [icon=server]
node topic: Topic Cluster [icon=queue]
node consume: Consumers [icon=worker]
node window: Windowing [icon=compute]
node agg: Aggregations [icon=compute]
node join: Stream Joins [icon=compute]
node state: State Store [cylinder, icon=database]
node sink: Output Sinks [icon=cloud]
node db: Checkpoints DB [cylinder, icon=database]

edge source -> app: events
edge app -> gateway: produce
edge gateway -> topic: publish
edge topic -> consume: subscribe
edge consume -> window: bucket
edge window -> agg: aggregate
edge agg -> join: combine
edge join -> sink: emit
edge consume -> state: checkpoint
edge state -> db: persist
edge topic -> app: replay
```

## Q&A

### Q: Design a stream processing system

**A:** A stream processing system ingests a continuous flow of events and computes
results over them in real time, rather than waiting for batch loads.

- The architecture starts with a topic cluster — a durable, partitioned log that
  holds events and is the source of truth for everything downstream.
- Producers publish through the gateway, and consumers subscribe to partitions
  and process events in order.
- Around consumption sit the operators: windowing buckets events into time
  intervals, aggregations compute running results, joins combine streams on
  keys, and output sinks emit results to downstream systems.
- The state store holds the per-operator state that the computation needs, and
  the checkpoints database records progress so the pipeline can recover.

The design has two defining tensions.

- The first is statefulness: most useful processing is not a stateless map but a
  stateful aggregate that must remember what it has seen, so state is treated as
  a first-class component with its own storage, backup, and recovery.
- The second is the correctness contract: at-least-once is easy, exactly-once is
  hard, and the system must choose one and make it cheap enough to use.

The pipeline is also elastic — operators scale horizontally by partitioning the
keyspace across parallel tasks — and recoverable, since consumers can always go
back to the topic and replay.

- The result is a system that trades batch's ability to recompute anything for
  the ability to answer a query with sub-second freshness.
- Operational concerns complete the design: monitoring tracks end-to-end
  latency, lag per partition, and state size, so operators can see where a
  pipeline is slow or a topic is falling behind before users notice.

### Q: How do you guarantee exactly-once semantics?

**A:** Exactly-once means every event contributes to the result exactly once even when
the pipeline retries, fails, and restarts.

The system combines three mechanisms.

- The source is durable and offset-based: each event has a stable identity in
  the topic, and the consumer commits its read offset only after the event's
  effects are complete, so a restart re-reads from the committed offset and
  never skips or duplicates within a partition.
- The state store is transactional: updates to operator state and the output
  being emitted are written atomically with the checkpoint, so an operator
  cannot end up in a state where its output went out but its state did not
  advance.

The third mechanism is idempotent sinks and output commits.

- If the sink — a database or message queue — is transaction-capable, the
  operator writes its results and the checkpoint marker in the same transaction,
  so the sink and the pipeline state commit or fail together.
- Where the sink cannot transact, the pipeline writes through a staging topic
  and a sink writer performs the final deduplicated apply, using event IDs to
  make the apply idempotent.

The cost is real:

- Transactional checkpointing adds latency and storage, so exactly-once is
  applied per pipeline and per sink, not globally for free.
- The guarantee is end-to-end only if every hop participates — source,
  processing, sink — and the pipeline makes each hop's contract explicit so a
  chain of exactly-once segments yields an exactly-once end-to-end result.
- The checkpoint cadence is also a tunable: frequent checkpoints shorten
  recovery but add overhead, so the pipeline lets operators trade recovery time
  against checkpoint cost per job.

### Q: How do you handle windowing and out-of-order events?

**A:** Windowing converts an unbounded stream into finite, queryable pieces.

- The operator assigns each event to a window by its event timestamp — tumbling
  windows partition time into fixed non-overlapping intervals, sliding windows
  overlap, and session windows close after a gap of inactivity.
- The choice depends on the query: counting page views wants tumbling, a moving
  average wants sliding, and grouping a user's activity wants sessions.
- Windows are processed with watermark logic: the watermark is the system's
  estimate of the latest time by which all earlier events have arrived, and a
  window closes when the watermark passes its end, so the operator emits a
  complete result rather than a guess.

Out-of-order events are the reason watermarks exist.

- Network and producer delays mean events can arrive minutes after earlier
  events of the same window, so the system buffers a window's events until its
  watermark passes, then emits and discards the state.
- No estimate is perfect, so the system supports late-data handling: late events
  after a window closed can update the result within a bounded late window, be
  routed to a separate stream for correction, or be dropped if the application
  only needs near-real-time accuracy.
- The engine also tracks event-time lag per partition so operators can see how
  far behind the processing is.

The tension is fundamental — holding windows open longer improves accuracy but
increases state and latency — so the watermark and late-window policies are
tunable per query rather than baked in, and the tuning is exposed through the
query interface.

### Q: How do you scale stream operators?

**A:** Stream operators scale by partitioning, the same trick that scales the topic.

- Each logical stream is split into parallel partitions, and each operator task
  processes a subset of the partitions independently, so throughput scales
  linearly with the number of tasks.
- The keyspace distribution decides correctness: events that must be aggregated
  together — all events for a user, all clicks for a session — are hashed to the
  same partition, so the operator holds the complete state for its keys without
  shuffling.
- A stateless operator, like a filter, can process any partition with any task,
  while a stateful operator pins each key to a task because the state lives with
  the task.

State is what makes scaling hard. When the pipeline adds tasks, keys must
migrate between tasks, and their state moves with them; the engine performs a
rebalance that re-shards the state store and lets old and new tasks drain and
catch up so no key is processed by two tasks at once. The state store itself is
a distributed store sharded by the same keyspace, so it scales with the
operators and survives task failure. Backpressure completes the picture: if a
downstream sink is slow, the consumers lag, and the engine signals the slower
producers through the topic's buffering and retention rather than unboundedly
accumulating. The design goal is that adding a task should increase aggregate
throughput while each individual event path stays identical — scaling changes
the number of lanes, not the semantics.

### Q: How do you handle stream reprocessing?

**A:** Reprocessing replays a stream from an earlier point, and it must be a routine
operation because deployments, bug fixes, and corrected logic all require
recomputing history. The foundation is the topic's retention and replay
capability: events are stored durably with their offsets, and a consumer can
subscribe from any offset or any timestamp, not just the latest. To reprocess,
the operator starts a new application instance pointed at the past, with a fresh
state store, and replays the events forward; the checkpoint database lets the
instance restart mid-replay if it fails. The output of a reprocessing run is a
new dataset — a new table or topic — which is then swapped in atomically once
the run catches up to the present, so live consumers see a consistent switch
rather than partial results.

Three design decisions make reprocessing practical. First, the pipeline must be
deterministic: replaying the same events must produce the same output, which is
why operators avoid wall-clock time in computation and use event time instead.
Second, the output swap must be atomic from the consumer's point of view, which
is why results go to a versioned sink and the swap is a metadata flip rather
than a data migration. Third, replay must not disturb the live pipeline, so
reprocessing runs in parallel with lower priority or in a separate environment.
The combination of durable storage, deterministic operators, and atomic output
swap turns reprocessing from a risky operation into a standard tool for fixing a
wrong computation without waiting for a nightly batch.

## Source

```text
title: Stream Processing
node source: Event Sources [icon=cloud]
node app: Producer App [icon=browser]
node gateway: API Gateway [icon=server]
node topic: Topic Cluster [icon=queue]
node consume: Consumers [icon=worker]
node window: Windowing [icon=compute]
node agg: Aggregations [icon=compute]
node join: Stream Joins [icon=compute]
node state: State Store [cylinder, icon=database]
node sink: Output Sinks [icon=cloud]
node db: Checkpoints DB [cylinder, icon=database]

edge source -> app: events
edge app -> gateway: produce
edge gateway -> topic: publish
edge topic -> consume: subscribe
edge consume -> window: bucket
edge window -> agg: aggregate
edge agg -> join: combine
edge join -> sink: emit
edge consume -> state: checkpoint
edge state -> db: persist
edge topic -> app: replay
```
