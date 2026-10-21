# Realtime Analytics

Design a realtime analytics platform

**Difficulty:** Hard

**Tags:** analytics, event-driven, monitoring, realtime

## Functional Requirements

- a realtime analytics platform
- ingest millions of events per second?
- query streaming data?
- render live dashboards?
- keep query results accurate?

## Non-Functional Requirements

- A platform that promises
  "within seconds" must bound every hop: producer to ingest, ingest to topic,
  topic to compute, compute to store, store to dashboard.

- End-to-end latency targets in the low single digits of seconds mean each hop
  has only a few hundred milliseconds of budget, which rules out batching on the
  hot path and any polling that waits for a full interval before moving data.
- The design therefore favors streaming windows with low emit frequency and
  incremental aggregation rather than recomputation.

Two contrasting workloads share the platform.

- The design uses a fleet of stateless ingest workers in front of a
  durable topic.

- Producers send events to a local or edge endpoint; the ingest workers
  validate, enrich lightly (adding arrival time and a global id), and publish to
  a partitioned topic where the partition key determines ordering.
- Statelessness is what makes ingestion scalable — the fleet scales horizontally
  with partition count, and any worker can accept any event, so a spike is
  absorbed by adding capacity rather than by a single choke point.

The transport is a log, not a queue, for a specific reason: a queue delivers
each message once and forgets it, while a log stores the stream durably and
allows re-reading.

- A realtime analytics platform needs replay for recovery and backfill, so
  events land in a topic with retention and are consumed by compute at their own
  pace.
- Backpressure is handled end to end: producers retry with exponential backoff
  and bounded buffering, the ingest tier drops or degrades only under a
  negotiated load-shedding policy (sampling low-priority events before dropping
  high-priority ones), and consumers keep their lag bounded so the platform
  degrades gracefully rather than queueing unboundedly.

Partitioning is the central tuning knob.

- Events are keyed so that all events for one entity land in one partition,
  which is what lets per-entity aggregation be correct without global
  coordination.
- Skew is the enemy: a single hot key can saturate a partition.
- Rendering is the last-mile latency problem: the data is fresh, and the browser
  must see it fresh.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Realtime Analytics
source: Event Sources
app: Dashboard App
gateway: API Gateway
ingest: Ingest Cluster
topic: Event Topic
compute: Streaming Compute
store: Analytics Store
dash: Dashboard Service
push: Realtime Push
alert: Alert Engine
db: Metadata DB

source ─► app ─► events
app ─► gateway ─► forward
gateway ─► ingest ─► buffer
ingest ─► topic ─► publish
topic ─► compute ─► process
compute ─► store ─► aggregate
store ─► dash ─► query
dash ─► push ─► stream
push ─► app ─► render
compute ─► alert ─► detect
alert ─► app ─► notify
```

## Design

### Design a realtime analytics platform

A realtime analytics platform turns a firehose of events into live numbers:
counts, rates, and distributions that update within seconds of the underlying
events. The pipeline is ingestion, transport, computation, serving, and
delivery.

- Events are produced by sources spread across the infrastructure, buffered by
  an ingest tier, published to a durable topic, computed over by a streaming
  engine, stored in an analytics store, and finally pushed to dashboards and fed
  to an alert engine.
- The diagram in the source block shows exactly this shape, from event sources
  through the ingest cluster and topic to the streaming compute, store,
  dashboard, push, and alert layers.

The defining requirement is the freshness budget. A platform that promises
"within seconds" must bound every hop: producer to ingest, ingest to topic,
topic to compute, compute to store, store to dashboard.

- End-to-end latency targets in the low single digits of seconds mean each hop
  has only a few hundred milliseconds of budget, which rules out batching on the
  hot path and any polling that waits for a full interval before moving data.
- The design therefore favors streaming windows with low emit frequency and
  incremental aggregation rather than recomputation.

Two contrasting workloads share the platform. Interactive dashboards need low
latency and low cardinality — a handful of aggregates visible to a human.
Alerting needs precision — a rule must fire when a metric crosses a threshold,
and it must not fire spuriously.

- Both consume the same stream, which is why compute and serving are separate
  stages: the streaming engine produces incremental aggregates, the store serves
  point queries and ranges, and the dashboard and alert paths read from these
  outputs rather than re-consuming the raw stream.

### How do you ingest millions of events per second?

Ingestion is the wall: events arrive at arbitrary rates and must be buffered
without loss. The design uses a fleet of stateless ingest workers in front of a
durable topic.

- Producers send events to a local or edge endpoint; the ingest workers
  validate, enrich lightly (adding arrival time and a global id), and publish to
  a partitioned topic where the partition key determines ordering.
- Statelessness is what makes ingestion scalable — the fleet scales horizontally
  with partition count, and any worker can accept any event, so a spike is
  absorbed by adding capacity rather than by a single choke point.

The transport is a log, not a queue, for a specific reason: a queue delivers
each message once and forgets it, while a log stores the stream durably and
allows re-reading.

- A realtime analytics platform needs replay for recovery and backfill, so
  events land in a topic with retention and are consumed by compute at their own
  pace.
- Backpressure is handled end to end: producers retry with exponential backoff
  and bounded buffering, the ingest tier drops or degrades only under a
  negotiated load-shedding policy (sampling low-priority events before dropping
  high-priority ones), and consumers keep their lag bounded so the platform
  degrades gracefully rather than queueing unboundedly.

Partitioning is the central tuning knob.

- Events are keyed so that all events for one entity land in one partition,
  which is what lets per-entity aggregation be correct without global
  coordination.
- Skew is the enemy: a single hot key can saturate a partition. The design
  mitigates this with a two-level key (entity plus a shard suffix) for hot
  entities, computing at the shard level and merging in a second stage.
- The ingest layer also handles the classic failure modes — malformed events go
  to a quarantine topic with their metadata instead of crashing the pipeline,
  and duplicate events are deduplicated downstream by the idempotency key each
  producer attaches.

### How do you query streaming data?

Streaming data is queried in two modes, and the platform supports both because
they answer different questions. The first is streaming queries: standing
aggregations that update as events arrive.

- The compute layer maintains state per aggregation key and per window (a
  60-second count, a 5-minute average), and each incoming event updates the
  relevant in-memory aggregates incrementally.
- The results are emitted as new events, not recomputed — the cost of an update
  is proportional to the keys touched, not to the size of the stream.

The second mode is ad-hoc queries against the stored aggregates: "what was the
error rate per region in the last hour?" Here the analytics store answers the
query, and the design decision is which queries it can serve fast.

- Real-time stores use columnar or inverted layouts optimized for time-bounded
  scans over a moderate number of dimensions, so the platform defines which
  dimensions are queryable at design time (they become columns or index keys)
  and keeps the arbitrary-query surface small.
- Pre-aggregation is what makes this fast: the compute layer maintains rollups
  at multiple granularities (1-minute, 5-minute, 1-hour) so a query rarely scans
  the raw store.

The boundary between the two modes is where design gets interesting.

- A dashboard showing "top pages now" is best served by a streaming query held
  in memory.
- A dashboard showing "requests per minute for the last 24 hours" is best served
  by the store's pre-aggregated rollups.
- The platform routes each visualization to the right engine, and both engines
  agree on the definition of a window — aligned boundaries, consistent time
  zones — so a chart that spans the live edge of a window does not jump or gap.
- Streaming queries also need a defined behavior when a consumer falls behind,
  usually skipping stale windows with a gap marker rather than emitting nonsense
  aggregates.

### How do you render live dashboards?

Rendering is the last-mile latency problem: the data is fresh, and the browser
must see it fresh. The dashboard service reads the latest aggregates from the
store and opens a persistent connection to the browser (WebSocket or SSE), and
the streaming engine pushes updates for the specific metrics a dashboard
subscribed to.

- Pushing updates beats polling because it sends bytes only when data changes,
  and it keeps client-side logic simple — the browser just redraws the charts it
  receives.
- The subscription model is per-metric: a dashboard declares the aggregation
  queries it needs, and the push layer fans out exactly those streams.

The dashboards and the push layer are separated from the compute engine so a
flood of dashboard clients cannot stall ingestion.

- The dashboard service holds a client subscription registry, coalesces bursts
  (several updates within a frame are collapsed into one), and applies
  per-client throttling so a slow network does not queue unbounded data on the
  server.
- Initial load uses a snapshot: the client first fetches the current state of
  every metric it displays from the store, then receives incremental updates.
- This avoids the classic bug where a chart starts empty and fills in slowly.

Scalability comes from state, not connections.

- Each connection is cheap, but the same aggregate is computed once and
  broadcast to many clients, so the push layer fans out from one computed value
  instead of re-computing per client.
- To fan out at scale, the platform tier the connections: edge nodes hold
  WebSocket connections and subscribe to a central distribution topic, so a
  spike in browsers adds edge load without adding compute load.
- When a dashboard is inactive, subscriptions expire, because a live chart
  nobody is watching is pure waste.
- Every render is logged to the same analytics stream, which also tells
  operators which dashboards are actually used.

### How do you keep query results accurate?

Accuracy has three enemies: lost events, duplicated events, and window
misalignment. Lost events are handled at ingestion — the pipeline is
at-least-once end to end, meaning every event is either delivered or explicitly
dropped with a counter, never silently forgotten.

- Duplicates are handled with idempotency keys: each event carries a unique id,
  and the compute layer tracks recent ids per partition so replays do not
  double-count.
- The remaining drift is measured, not hidden: the platform computes
  reconciliation metrics (events ingested versus events counted) and exposes the
  difference as a first-class signal.

Windows are where most surprises live.

- A tumbling window of 60 seconds emits once with a fixed boundary; a hopping or
  sliding window overlaps and can double-count boundary events if the emitter
  and consumer disagree on alignment.
- The platform forces a single time authority: event time (when the event
  happened) rather than processing time (when it arrived), with a tolerance for
  late events.
- Late arrivals within the tolerance update the affected window and emit a
  correction; arrivals beyond tolerance go to a late queue for offline repair
  rather than corrupting live numbers.
- Watermarks track the frontier of observed event time, so downstream consumers
  know how complete a window is before they trust it.

Accuracy also means matching the answer to the question.

- A count computed over a 5-minute window differs from a count over a 60-minute
  window, so the store labels every aggregate with its window definition and
  granularity, and the dashboard never mixes granularities in one chart without
  making the mix visible.
- Trend queries use the rollup tiers, and "now" queries use streaming state,
  with the boundary rendered honestly.
- Finally, alerting and dashboards share the same computed values — the alert
  engine consumes the same streaming aggregates the dashboards render — so a
  number in the UI is exactly the number that triggered an alert, which is what
  makes incident response sane.

## Source

```text
title: Realtime Analytics
node source: Event Sources [icon=cloud]
node app: Dashboard App [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingest Cluster [icon=worker]
node topic: Event Topic [icon=queue]
node compute: Streaming Compute [icon=compute]
node store: Analytics Store [cylinder, icon=database]
node dash: Dashboard Service [icon=search]
node push: Realtime Push [icon=sync]
node alert: Alert Engine [icon=message]
node db: Metadata DB [cylinder, icon=database]

edge source -> app: events
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> topic: publish
edge topic -> compute: process
edge compute -> store: aggregate
edge store -> dash: query
edge dash -> push: stream
edge push -> app: render
edge compute -> alert: detect
edge alert -> app: notify
```

## Q&A

### Q: Design a realtime analytics platform

**A:** A realtime analytics platform turns a firehose of events into live numbers:
counts, rates, and distributions that update within seconds of the underlying
events. The pipeline is ingestion, transport, computation, serving, and
delivery.

- Events are produced by sources spread across the infrastructure, buffered by
  an ingest tier, published to a durable topic, computed over by a streaming
  engine, stored in an analytics store, and finally pushed to dashboards and fed
  to an alert engine.
- The diagram in the source block shows exactly this shape, from event sources
  through the ingest cluster and topic to the streaming compute, store,
  dashboard, push, and alert layers.

The defining requirement is the freshness budget. A platform that promises
"within seconds" must bound every hop: producer to ingest, ingest to topic,
topic to compute, compute to store, store to dashboard.

- End-to-end latency targets in the low single digits of seconds mean each hop
  has only a few hundred milliseconds of budget, which rules out batching on the
  hot path and any polling that waits for a full interval before moving data.
- The design therefore favors streaming windows with low emit frequency and
  incremental aggregation rather than recomputation.

Two contrasting workloads share the platform. Interactive dashboards need low
latency and low cardinality — a handful of aggregates visible to a human.
Alerting needs precision — a rule must fire when a metric crosses a threshold,
and it must not fire spuriously.

- Both consume the same stream, which is why compute and serving are separate
  stages: the streaming engine produces incremental aggregates, the store serves
  point queries and ranges, and the dashboard and alert paths read from these
  outputs rather than re-consuming the raw stream.

### Q: How do you ingest millions of events per second?

**A:** Ingestion is the wall: events arrive at arbitrary rates and must be buffered
without loss. The design uses a fleet of stateless ingest workers in front of a
durable topic.

- Producers send events to a local or edge endpoint; the ingest workers
  validate, enrich lightly (adding arrival time and a global id), and publish to
  a partitioned topic where the partition key determines ordering.
- Statelessness is what makes ingestion scalable — the fleet scales horizontally
  with partition count, and any worker can accept any event, so a spike is
  absorbed by adding capacity rather than by a single choke point.

The transport is a log, not a queue, for a specific reason: a queue delivers
each message once and forgets it, while a log stores the stream durably and
allows re-reading.

- A realtime analytics platform needs replay for recovery and backfill, so
  events land in a topic with retention and are consumed by compute at their own
  pace.
- Backpressure is handled end to end: producers retry with exponential backoff
  and bounded buffering, the ingest tier drops or degrades only under a
  negotiated load-shedding policy (sampling low-priority events before dropping
  high-priority ones), and consumers keep their lag bounded so the platform
  degrades gracefully rather than queueing unboundedly.

Partitioning is the central tuning knob.

- Events are keyed so that all events for one entity land in one partition,
  which is what lets per-entity aggregation be correct without global
  coordination.
- Skew is the enemy: a single hot key can saturate a partition. The design
  mitigates this with a two-level key (entity plus a shard suffix) for hot
  entities, computing at the shard level and merging in a second stage.
- The ingest layer also handles the classic failure modes — malformed events go
  to a quarantine topic with their metadata instead of crashing the pipeline,
  and duplicate events are deduplicated downstream by the idempotency key each
  producer attaches.

### Q: How do you query streaming data?

**A:** Streaming data is queried in two modes, and the platform supports both because
they answer different questions. The first is streaming queries: standing
aggregations that update as events arrive.

- The compute layer maintains state per aggregation key and per window (a
  60-second count, a 5-minute average), and each incoming event updates the
  relevant in-memory aggregates incrementally.
- The results are emitted as new events, not recomputed — the cost of an update
  is proportional to the keys touched, not to the size of the stream.

The second mode is ad-hoc queries against the stored aggregates: "what was the
error rate per region in the last hour?" Here the analytics store answers the
query, and the design decision is which queries it can serve fast.

- Real-time stores use columnar or inverted layouts optimized for time-bounded
  scans over a moderate number of dimensions, so the platform defines which
  dimensions are queryable at design time (they become columns or index keys)
  and keeps the arbitrary-query surface small.
- Pre-aggregation is what makes this fast: the compute layer maintains rollups
  at multiple granularities (1-minute, 5-minute, 1-hour) so a query rarely scans
  the raw store.

The boundary between the two modes is where design gets interesting.

- A dashboard showing "top pages now" is best served by a streaming query held
  in memory.
- A dashboard showing "requests per minute for the last 24 hours" is best served
  by the store's pre-aggregated rollups.
- The platform routes each visualization to the right engine, and both engines
  agree on the definition of a window — aligned boundaries, consistent time
  zones — so a chart that spans the live edge of a window does not jump or gap.
- Streaming queries also need a defined behavior when a consumer falls behind,
  usually skipping stale windows with a gap marker rather than emitting nonsense
  aggregates.

### Q: How do you render live dashboards?

**A:** Rendering is the last-mile latency problem: the data is fresh, and the browser
must see it fresh. The dashboard service reads the latest aggregates from the
store and opens a persistent connection to the browser (WebSocket or SSE), and
the streaming engine pushes updates for the specific metrics a dashboard
subscribed to.

- Pushing updates beats polling because it sends bytes only when data changes,
  and it keeps client-side logic simple — the browser just redraws the charts it
  receives.
- The subscription model is per-metric: a dashboard declares the aggregation
  queries it needs, and the push layer fans out exactly those streams.

The dashboards and the push layer are separated from the compute engine so a
flood of dashboard clients cannot stall ingestion.

- The dashboard service holds a client subscription registry, coalesces bursts
  (several updates within a frame are collapsed into one), and applies
  per-client throttling so a slow network does not queue unbounded data on the
  server.
- Initial load uses a snapshot: the client first fetches the current state of
  every metric it displays from the store, then receives incremental updates.
- This avoids the classic bug where a chart starts empty and fills in slowly.

Scalability comes from state, not connections.

- Each connection is cheap, but the same aggregate is computed once and
  broadcast to many clients, so the push layer fans out from one computed value
  instead of re-computing per client.
- To fan out at scale, the platform tier the connections: edge nodes hold
  WebSocket connections and subscribe to a central distribution topic, so a
  spike in browsers adds edge load without adding compute load.
- When a dashboard is inactive, subscriptions expire, because a live chart
  nobody is watching is pure waste.
- Every render is logged to the same analytics stream, which also tells
  operators which dashboards are actually used.

### Q: How do you keep query results accurate?

**A:** Accuracy has three enemies: lost events, duplicated events, and window
misalignment. Lost events are handled at ingestion — the pipeline is
at-least-once end to end, meaning every event is either delivered or explicitly
dropped with a counter, never silently forgotten.

- Duplicates are handled with idempotency keys: each event carries a unique id,
  and the compute layer tracks recent ids per partition so replays do not
  double-count.
- The remaining drift is measured, not hidden: the platform computes
  reconciliation metrics (events ingested versus events counted) and exposes the
  difference as a first-class signal.

Windows are where most surprises live.

- A tumbling window of 60 seconds emits once with a fixed boundary; a hopping or
  sliding window overlaps and can double-count boundary events if the emitter
  and consumer disagree on alignment.
- The platform forces a single time authority: event time (when the event
  happened) rather than processing time (when it arrived), with a tolerance for
  late events.
- Late arrivals within the tolerance update the affected window and emit a
  correction; arrivals beyond tolerance go to a late queue for offline repair
  rather than corrupting live numbers.
- Watermarks track the frontier of observed event time, so downstream consumers
  know how complete a window is before they trust it.

Accuracy also means matching the answer to the question.

- A count computed over a 5-minute window differs from a count over a 60-minute
  window, so the store labels every aggregate with its window definition and
  granularity, and the dashboard never mixes granularities in one chart without
  making the mix visible.
- Trend queries use the rollup tiers, and "now" queries use streaming state,
  with the boundary rendered honestly.
- Finally, alerting and dashboards share the same computed values — the alert
  engine consumes the same streaming aggregates the dashboards render — so a
  number in the UI is exactly the number that triggered an alert, which is what
  makes incident response sane.

## Source

```text
title: Realtime Analytics
node source: Event Sources [icon=cloud]
node app: Dashboard App [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingest Cluster [icon=worker]
node topic: Event Topic [icon=queue]
node compute: Streaming Compute [icon=compute]
node store: Analytics Store [cylinder, icon=database]
node dash: Dashboard Service [icon=search]
node push: Realtime Push [icon=sync]
node alert: Alert Engine [icon=message]
node db: Metadata DB [cylinder, icon=database]

edge source -> app: events
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> topic: publish
edge topic -> compute: process
edge compute -> store: aggregate
edge store -> dash: query
edge dash -> push: stream
edge push -> app: render
edge compute -> alert: detect
edge alert -> app: notify
```
