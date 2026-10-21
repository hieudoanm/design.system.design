# Google Analytics — Web Analytics

Design a web analytics platform

**Difficulty:** Medium

**Tags:** analytics, event-driven

## Functional Requirements

- a web analytics platform
- collect and ingest billions of events per day?
- aggregate metrics without losing accuracy?
- run funnel and cohort queries fast?
- generate and cache dashboard reports?

## Non-Functional Requirements

- The platform is a high-volume data pipeline followed by a low-latency reporting
  layer.

- On the ingest side, a JavaScript SDK on each site fires events (pageviews,
  clicks, conversions) to an event collector.
- The collector validates and batches events into an ingestion pipeline — a
  distributed log — and a stream processor enriches them (IP-to-geo, user agent
  parsing, session stitching) before writing raw events to an event store.
- Downstream, an aggregator rolls raw events into pre-aggregated cubes (OLAP
  cubes keyed by time, dimension, and metric), and the reporting API answers
  dashboard queries from those cubes.
- A separate funnel analyzer runs segment and funnel computations, and a report
  cache serves the most requested dashboards.

The architecture separates hot and cold paths.

- Raw events must be written durably and cheaply at massive scale, so they land
  in a columnar event store partitioned by time and by site/property; analytical
  queries never scan raw data — they hit pre-aggregated cubes.
- This is a classic trade: keeping raw events enables arbitrary retroactive
  queries and recomputation of any broken rollup, but pre-aggregation is what
  makes interactive dashboards (seconds, not minutes) possible.
- The system must also handle schema evolution: events grow new fields as
  products ship, so the collector and stream processor treat the event schema as
  versioned and store unknown fields in a dynamic column, letting dashboards
  expose new dimensions without a pipeline migration..
- Ingestion is built around cheap, durable writes.

- The collector is a horizontally scaled, stateless edge tier that accepts
  batched events over HTTP(S), validates them (size limits, required fields),
  and writes them to a distributed, partitioned log (like Kafka) that holds days
  of data as a buffer.
- The stream processor consumes partitions in parallel, enriches each event
  (geolocation, session ID, user ID resolution), and writes enriched events to
  the event store — a columnar store partitioned by time, so writes are
  append-only segment files and scans are time-windowed.
- Batching is essential: the SDK buffers events client-side and flushes on an
  interval or on page unload (with `sendBeacon` for reliability), so the
  collector handles far fewer, larger requests than raw per-event traffic.

The hard constraints are throughput and data loss.

- At billions of events per day, any synchronous processing would bottleneck, so
  the collector writes asynchronously and the log absorbs spikes; backpressure
  appears as lag, not as dropped requests.
- To protect correctness, the SDK adds a client-generated event ID, and the
  pipeline deduplicates by (event_id) at ingest, making at-least-once delivery
  safe.
- Partitioning matters: events are partitioned by property and approximate time
  so the aggregator can read contiguous ranges per property.
- Monitoring tracks collector latency, log lag, and the ingest-to-storage drop
  rate; because a single rogue site can generate a flash flood, the collector
  enforces per-property rate limits and can drop or sample the worst offenders
  without degrading everyone else..
- Dashboards are the read path, and they are served almost entirely from
  precomputed data.

- The reporting API resolves each dashboard widget to an OLAP cube query,
  executes it over the aggregated cube, and renders a response.
- The most popular dashboards are additionally cached in a report cache (e.g.,
  Redis or a CDN-style cache) keyed by (property, widget, time range, filters,
  granularity), with TTLs matched to the cube's refresh cadence.
- On cache miss, the API serves the cube and asynchronously repopulates the
  cache, so a hot dashboard's steady-state traffic never touches the cube.
- Cache invalidation is time-based rather than event-based — the cube refreshes
  on a schedule (e.g., every few minutes for the current day, hourly for older
  data), and the cache TTL is aligned to that schedule to avoid serving stale
  mid-refresh numbers.

Correctness and cost trade off here.

- The dashboard must not flicker: the cube's aggregator writes a new
  day-partition and swaps atomically, so readers always see either the previous
  complete state or the new one, never a partial hour.
- Cache hits return instantly, but the fill process must avoid a thundering herd
  when a widget's cache expires — a single in-flight computation with other
  requesters waiting on the same key.
- Since most sites are small, the cube is dominated by a few massive properties;
  those are partitioned per property with their own cube shards and cache
  budgets, so a noisy neighbor can't evict everyone's reports.
- Monitoring tracks cache hit rate, cube query latency, and staleness per
  property, and a drift check periodically compares cube aggregates against the
  raw event store to catch silent rollup bugs.

## Source

````text
title: Web Analytics
node site: Website [round, icon=browser]
node collector: Event Collector [icon=server]
node ingest: Ingestion Pipeline [icon=queue]
node stream: Stream Processor [icon=compute]
node store: Event Store [cylinder, icon=database]
node agg: Aggregator [icon=worker]
node cube: OLAP Cube [cylinder, icon=search]
node api: Reporting API [icon=server]
node dash: Dashboard [icon=browser]
node funnel: Funnel Analyzer [icon=compute]
node cache: Report Cache [cylinder, icon=cache]

edge site -> collector: pageview
edge collector -> ingest: batch
edge ingest -> stream: events
edge stream -> store: raw
edge store -> agg: rollup
edge agg -> cube: dimensions
edge api -> cube: query
edge api -> cache: cached
edge dash -> api: report
edge store -> funnel: segments
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Web Analytics
site: Website
collector: Event Collector
ingest: Ingestion Pipeline
stream: Stream Processor
store: Event Store
agg: Aggregator
cube: OLAP Cube
api: Reporting API
dash: Dashboard
funnel: Funnel Analyzer
cache: Report Cache

site ─► collector ─► pageview
collector ─► ingest ─► batch
ingest ─► stream ─► events
stream ─► store ─► raw
store ─► agg ─► rollup
agg ─► cube ─► dimensions
api ─► cube ─► query
api ─► cache ─► cached
dash ─► api ─► report
store ─► funnel ─► segments
````

## Design

### Design a web analytics platform

The platform is a high-volume data pipeline followed by a low-latency reporting
layer.

- On the ingest side, a JavaScript SDK on each site fires events (pageviews,
  clicks, conversions) to an event collector.
- The collector validates and batches events into an ingestion pipeline — a
  distributed log — and a stream processor enriches them (IP-to-geo, user agent
  parsing, session stitching) before writing raw events to an event store.
- Downstream, an aggregator rolls raw events into pre-aggregated cubes (OLAP
  cubes keyed by time, dimension, and metric), and the reporting API answers
  dashboard queries from those cubes.
- A separate funnel analyzer runs segment and funnel computations, and a report
  cache serves the most requested dashboards.

The architecture separates hot and cold paths.

- Raw events must be written durably and cheaply at massive scale, so they land
  in a columnar event store partitioned by time and by site/property; analytical
  queries never scan raw data — they hit pre-aggregated cubes.
- This is a classic trade: keeping raw events enables arbitrary retroactive
  queries and recomputation of any broken rollup, but pre-aggregation is what
  makes interactive dashboards (seconds, not minutes) possible.
- The system must also handle schema evolution: events grow new fields as
  products ship, so the collector and stream processor treat the event schema as
  versioned and store unknown fields in a dynamic column, letting dashboards
  expose new dimensions without a pipeline migration.

### How do you collect and ingest billions of events per day?

Ingestion is built around cheap, durable writes.

- The collector is a horizontally scaled, stateless edge tier that accepts
  batched events over HTTP(S), validates them (size limits, required fields),
  and writes them to a distributed, partitioned log (like Kafka) that holds days
  of data as a buffer.
- The stream processor consumes partitions in parallel, enriches each event
  (geolocation, session ID, user ID resolution), and writes enriched events to
  the event store — a columnar store partitioned by time, so writes are
  append-only segment files and scans are time-windowed.
- Batching is essential: the SDK buffers events client-side and flushes on an
  interval or on page unload (with `sendBeacon` for reliability), so the
  collector handles far fewer, larger requests than raw per-event traffic.

The hard constraints are throughput and data loss.

- At billions of events per day, any synchronous processing would bottleneck, so
  the collector writes asynchronously and the log absorbs spikes; backpressure
  appears as lag, not as dropped requests.
- To protect correctness, the SDK adds a client-generated event ID, and the
  pipeline deduplicates by (event_id) at ingest, making at-least-once delivery
  safe.
- Partitioning matters: events are partitioned by property and approximate time
  so the aggregator can read contiguous ranges per property.
- Monitoring tracks collector latency, log lag, and the ingest-to-storage drop
  rate; because a single rogue site can generate a flash flood, the collector
  enforces per-property rate limits and can drop or sample the worst offenders
  without degrading everyone else.

### How do you aggregate metrics without losing accuracy?

Metrics (pageviews, sessions, conversions, revenue) are computed by rollups over
time dimensions.

- The aggregator consumes the event stream and increments counters for every
  (property, dimension, granularity) combination, writing pre-aggregated rows
  into an OLAP cube with multiple granularities (hour, day) so dashboard
  time-ranges read a few rows instead of millions of events.
- To avoid losing accuracy under load, aggregation must be exact where possible
  and approximate only where it is justified.
- Counts and sums are exact because they are simple increments; uniques (unique
  users, sessions) are the hard case — an exact distinct count requires per-user
  state, which is expensive, so analytics platforms use HyperLogLog, a
  probabilistic data structure that gives near-exact uniques with constant
  memory, accepting a small, well-understood error (~0.5–2%).

The cube and the raw store are kept consistent with a reconciliation loop.

- The aggregator is at-least-once, so a failure can double-count; each rollup
  batch carries the event ranges it covered, and a rewind/recompute mechanism
  can replay a range over the raw event store to fix a bad aggregate.
- Late-arriving events (a mobile SDK flushing hours later) are handled by
  re-aggregating the affected hourly window rather than appending out-of-order,
  which would corrupt time series.
- Accuracy is also preserved by dimension sparsity handling: high-cardinality
  dimensions (URLs) are aggregated per distinct value only when they matter,
  while the cube keeps the top-K plus an "(other)" bucket.
- Sampling is reserved for the deepest, least-visited drill-downs, clearly
  labeled so analysts know when numbers are estimates.

### How do you run funnel and cohort queries fast?

Funnel and cohort queries are not simple rollups — they are multi-step queries
over ordered user events.

- A funnel ("users who viewed, added to cart, then purchased") requires joining
  events per user in sequence and computing how many reached each step.
- A cohort ("users who signed up in March, what was their 30-day retention?")
  requires grouping users by acquisition time and measuring subsequent behavior.
- The funnel analyzer precomputes both: for funnels it builds per-user event
  sequences in the event store and runs a windowed join (e.g., a sliding-window
  or session-window aggregation) that assembles each user's ordered steps, then
  aggregates the transition counts step by step.
- For cohorts, it builds a retention matrix offline — for each acquisition day,
  the count of users active on each subsequent day — so a dashboard cohort chart
  reads the matrix instead of scanning events.

Speed comes from precomputation and columnar layout.

- Funnel results are cached per (funnel definition, time range); cohort matrices
  are materialized daily.
- Queries over the cube use columnar scans that touch only the needed columns
  and partitions.
- The trade-off is definition flexibility: precomputed funnels are fast but lock
  you into a fixed step definition, so the platform offers both — precomputed
  funnel IDs for common paths and an ad-hoc mode that runs a smaller,
  time-bounded computation over raw events for exploration, with a timeout and a
  hint to save it as a custom funnel.
- Because users are the join key, the raw event store is partitioned by user
  hash within the time range, so the sequence assembly for a funnel stays on a
  bounded number of shards rather than scanning everything.

### How do you generate and cache dashboard reports?

Dashboards are the read path, and they are served almost entirely from
precomputed data.

- The reporting API resolves each dashboard widget to an OLAP cube query,
  executes it over the aggregated cube, and renders a response.
- The most popular dashboards are additionally cached in a report cache (e.g.,
  Redis or a CDN-style cache) keyed by (property, widget, time range, filters,
  granularity), with TTLs matched to the cube's refresh cadence.
- On cache miss, the API serves the cube and asynchronously repopulates the
  cache, so a hot dashboard's steady-state traffic never touches the cube.
- Cache invalidation is time-based rather than event-based — the cube refreshes
  on a schedule (e.g., every few minutes for the current day, hourly for older
  data), and the cache TTL is aligned to that schedule to avoid serving stale
  mid-refresh numbers.

Correctness and cost trade off here.

- The dashboard must not flicker: the cube's aggregator writes a new
  day-partition and swaps atomically, so readers always see either the previous
  complete state or the new one, never a partial hour.
- Cache hits return instantly, but the fill process must avoid a thundering herd
  when a widget's cache expires — a single in-flight computation with other
  requesters waiting on the same key.
- Since most sites are small, the cube is dominated by a few massive properties;
  those are partitioned per property with their own cube shards and cache
  budgets, so a noisy neighbor can't evict everyone's reports.
- Monitoring tracks cache hit rate, cube query latency, and staleness per
  property, and a drift check periodically compares cube aggregates against the
  raw event store to catch silent rollup bugs.

## Source

```text
title: Web Analytics
node site: Website [round, icon=browser]
node collector: Event Collector [icon=server]
node ingest: Ingestion Pipeline [icon=queue]
node stream: Stream Processor [icon=compute]
node store: Event Store [cylinder, icon=database]
node agg: Aggregator [icon=worker]
node cube: OLAP Cube [cylinder, icon=search]
node api: Reporting API [icon=server]
node dash: Dashboard [icon=browser]
node funnel: Funnel Analyzer [icon=compute]
node cache: Report Cache [cylinder, icon=cache]

edge site -> collector: pageview
edge collector -> ingest: batch
edge ingest -> stream: events
edge stream -> store: raw
edge store -> agg: rollup
edge agg -> cube: dimensions
edge api -> cube: query
edge api -> cache: cached
edge dash -> api: report
edge store -> funnel: segments
```

## Q&A

### Q: Design a web analytics platform

**A:** The platform is a high-volume data pipeline followed by a low-latency reporting
layer.

- On the ingest side, a JavaScript SDK on each site fires events (pageviews,
  clicks, conversions) to an event collector.
- The collector validates and batches events into an ingestion pipeline — a
  distributed log — and a stream processor enriches them (IP-to-geo, user agent
  parsing, session stitching) before writing raw events to an event store.
- Downstream, an aggregator rolls raw events into pre-aggregated cubes (OLAP
  cubes keyed by time, dimension, and metric), and the reporting API answers
  dashboard queries from those cubes.
- A separate funnel analyzer runs segment and funnel computations, and a report
  cache serves the most requested dashboards.

The architecture separates hot and cold paths.

- Raw events must be written durably and cheaply at massive scale, so they land
  in a columnar event store partitioned by time and by site/property; analytical
  queries never scan raw data — they hit pre-aggregated cubes.
- This is a classic trade: keeping raw events enables arbitrary retroactive
  queries and recomputation of any broken rollup, but pre-aggregation is what
  makes interactive dashboards (seconds, not minutes) possible.
- The system must also handle schema evolution: events grow new fields as
  products ship, so the collector and stream processor treat the event schema as
  versioned and store unknown fields in a dynamic column, letting dashboards
  expose new dimensions without a pipeline migration.

### Q: How do you collect and ingest billions of events per day?

**A:** Ingestion is built around cheap, durable writes.

- The collector is a horizontally scaled, stateless edge tier that accepts
  batched events over HTTP(S), validates them (size limits, required fields),
  and writes them to a distributed, partitioned log (like Kafka) that holds days
  of data as a buffer.
- The stream processor consumes partitions in parallel, enriches each event
  (geolocation, session ID, user ID resolution), and writes enriched events to
  the event store — a columnar store partitioned by time, so writes are
  append-only segment files and scans are time-windowed.
- Batching is essential: the SDK buffers events client-side and flushes on an
  interval or on page unload (with `sendBeacon` for reliability), so the
  collector handles far fewer, larger requests than raw per-event traffic.

The hard constraints are throughput and data loss.

- At billions of events per day, any synchronous processing would bottleneck, so
  the collector writes asynchronously and the log absorbs spikes; backpressure
  appears as lag, not as dropped requests.
- To protect correctness, the SDK adds a client-generated event ID, and the
  pipeline deduplicates by (event_id) at ingest, making at-least-once delivery
  safe.
- Partitioning matters: events are partitioned by property and approximate time
  so the aggregator can read contiguous ranges per property.
- Monitoring tracks collector latency, log lag, and the ingest-to-storage drop
  rate; because a single rogue site can generate a flash flood, the collector
  enforces per-property rate limits and can drop or sample the worst offenders
  without degrading everyone else.

### Q: How do you aggregate metrics without losing accuracy?

**A:** Metrics (pageviews, sessions, conversions, revenue) are computed by rollups over
time dimensions.

- The aggregator consumes the event stream and increments counters for every
  (property, dimension, granularity) combination, writing pre-aggregated rows
  into an OLAP cube with multiple granularities (hour, day) so dashboard
  time-ranges read a few rows instead of millions of events.
- To avoid losing accuracy under load, aggregation must be exact where possible
  and approximate only where it is justified.
- Counts and sums are exact because they are simple increments; uniques (unique
  users, sessions) are the hard case — an exact distinct count requires per-user
  state, which is expensive, so analytics platforms use HyperLogLog, a
  probabilistic data structure that gives near-exact uniques with constant
  memory, accepting a small, well-understood error (~0.5–2%).

The cube and the raw store are kept consistent with a reconciliation loop.

- The aggregator is at-least-once, so a failure can double-count; each rollup
  batch carries the event ranges it covered, and a rewind/recompute mechanism
  can replay a range over the raw event store to fix a bad aggregate.
- Late-arriving events (a mobile SDK flushing hours later) are handled by
  re-aggregating the affected hourly window rather than appending out-of-order,
  which would corrupt time series.
- Accuracy is also preserved by dimension sparsity handling: high-cardinality
  dimensions (URLs) are aggregated per distinct value only when they matter,
  while the cube keeps the top-K plus an "(other)" bucket.
- Sampling is reserved for the deepest, least-visited drill-downs, clearly
  labeled so analysts know when numbers are estimates.

### Q: How do you run funnel and cohort queries fast?

**A:** Funnel and cohort queries are not simple rollups — they are multi-step queries
over ordered user events.

- A funnel ("users who viewed, added to cart, then purchased") requires joining
  events per user in sequence and computing how many reached each step.
- A cohort ("users who signed up in March, what was their 30-day retention?")
  requires grouping users by acquisition time and measuring subsequent behavior.
- The funnel analyzer precomputes both: for funnels it builds per-user event
  sequences in the event store and runs a windowed join (e.g., a sliding-window
  or session-window aggregation) that assembles each user's ordered steps, then
  aggregates the transition counts step by step.
- For cohorts, it builds a retention matrix offline — for each acquisition day,
  the count of users active on each subsequent day — so a dashboard cohort chart
  reads the matrix instead of scanning events.

Speed comes from precomputation and columnar layout.

- Funnel results are cached per (funnel definition, time range); cohort matrices
  are materialized daily.
- Queries over the cube use columnar scans that touch only the needed columns
  and partitions.
- The trade-off is definition flexibility: precomputed funnels are fast but lock
  you into a fixed step definition, so the platform offers both — precomputed
  funnel IDs for common paths and an ad-hoc mode that runs a smaller,
  time-bounded computation over raw events for exploration, with a timeout and a
  hint to save it as a custom funnel.
- Because users are the join key, the raw event store is partitioned by user
  hash within the time range, so the sequence assembly for a funnel stays on a
  bounded number of shards rather than scanning everything.

### Q: How do you generate and cache dashboard reports?

**A:** Dashboards are the read path, and they are served almost entirely from
precomputed data.

- The reporting API resolves each dashboard widget to an OLAP cube query,
  executes it over the aggregated cube, and renders a response.
- The most popular dashboards are additionally cached in a report cache (e.g.,
  Redis or a CDN-style cache) keyed by (property, widget, time range, filters,
  granularity), with TTLs matched to the cube's refresh cadence.
- On cache miss, the API serves the cube and asynchronously repopulates the
  cache, so a hot dashboard's steady-state traffic never touches the cube.
- Cache invalidation is time-based rather than event-based — the cube refreshes
  on a schedule (e.g., every few minutes for the current day, hourly for older
  data), and the cache TTL is aligned to that schedule to avoid serving stale
  mid-refresh numbers.

Correctness and cost trade off here.

- The dashboard must not flicker: the cube's aggregator writes a new
  day-partition and swaps atomically, so readers always see either the previous
  complete state or the new one, never a partial hour.
- Cache hits return instantly, but the fill process must avoid a thundering herd
  when a widget's cache expires — a single in-flight computation with other
  requesters waiting on the same key.
- Since most sites are small, the cube is dominated by a few massive properties;
  those are partitioned per property with their own cube shards and cache
  budgets, so a noisy neighbor can't evict everyone's reports.
- Monitoring tracks cache hit rate, cube query latency, and staleness per
  property, and a drift check periodically compares cube aggregates against the
  raw event store to catch silent rollup bugs.

## Source

```text
title: Web Analytics
node site: Website [round, icon=browser]
node collector: Event Collector [icon=server]
node ingest: Ingestion Pipeline [icon=queue]
node stream: Stream Processor [icon=compute]
node store: Event Store [cylinder, icon=database]
node agg: Aggregator [icon=worker]
node cube: OLAP Cube [cylinder, icon=search]
node api: Reporting API [icon=server]
node dash: Dashboard [icon=browser]
node funnel: Funnel Analyzer [icon=compute]
node cache: Report Cache [cylinder, icon=cache]

edge site -> collector: pageview
edge collector -> ingest: batch
edge ingest -> stream: events
edge stream -> store: raw
edge store -> agg: rollup
edge agg -> cube: dimensions
edge api -> cube: query
edge api -> cache: cached
edge dash -> api: report
edge store -> funnel: segments
```
