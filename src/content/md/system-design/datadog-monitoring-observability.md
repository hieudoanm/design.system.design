# Datadog — Monitoring & Observability

Design a monitoring and observability platform

**Difficulty:** Medium

**Tags:** monitoring, storage, time-series

## Functional Requirements

- a monitoring and observability platform
- ingest metrics at high write rates?
- store and query time-series data?
- alert reliably without noise?
- sample and retain traces efficiently?

## Non-Functional Requirements

- A `Host Agent` runs on every host and pushes metrics to the `Ingest API`.

- The `Ingest API` validates and buffers into a `Metrics Queue` before a
  `Stream Processor` aggregates and writes to the `Metric Store`.
- The write path is decoupled from the read path: dashboards query the
  `Query API`, which scans the `Metric Store` and resolves dimensions through a
  `Tag Index`.
- The `Alert Engine` evaluates thresholds against the series and pages on-call
  via `Pager Notifier`.
- This split is deliberate — ingestion must absorb a firehose without dropping
  points, while queries must return in milliseconds even when the store is under
  heavy write load.

The platform actually handles two data shapes that deserve separate designs.

- Metrics are dense, numeric, and write-mostly, while traces are sparse and
  high-cardinality.
- The write path is a fan-in — thousands of agents sending millions of points
  per second — absorbed by a queue that decouples bursty hosts from the store
  and provides at-least-once delivery with dedupe on
  `(metric, tags, timestamp)`.
- Durability matters: a dropped metric during an incident is a blind spot, so
  the queue must survive a store outage.
- The key trade-off is fidelity versus storage cost: do not keep every raw point
  forever; aggregate and downsample in the stream before data hits long-term
  storage, keep raw points only for a recent hot window, and derive dashboards
  from rolled-up series.

Operationally, think about failure semantics.

- The agent is on the critical path of nothing, so it should degrade gracefully:
  give it a heartbeat the platform monitors and a local buffer it can fall back
  to when the ingest path is slow.
- Query correctness depends on consistent tag naming, so define a tag schema
  (service, environment, host) and enforce it at ingest, or dashboards silently
  split into `host` versus `hostname`.
- Finally, the platform is only useful if it observes itself — ingest lag, drop
  rates, and store latency must be first-class metrics with their own alerts..
- Accept that
  ingestion is approximate — pre-aggregation intentionally loses per-point
  fidelity in exchange for throughput — and size the pipeline so P99 write latency
  stays in the single-digit milliseconds at peak.
- The design goal is bounded query
  latency at any retention depth, which is what makes dashboards usable during an
  incident when everyone is looking.

Failure handling and multi-tenancy complete the picture.

- Use relative-baseline and
  multi-condition alerts instead of raw thresholds for noisy metrics like latency
  percentiles — alert on "P99 latency 2x its 14-day baseline for 10 minutes," not
  "P99 > 500ms."

Give every alert a lifecycle — firing, acknowledged, resolved — keyed by
`(rule, series)`, and have the notifier throttle repeat pages and escalate only
if still firing after acknowledgment.

- Net effect: keep roughly 10–20% of traces in the
  hot store for interactive exploration, which is enough to answer most debugging
  questions at a fraction of the cost.

For everything else, retain aggregates rather than raw traces: per-service
rollups of request rate, error rate, and latency percentiles by operation,
computed from the full traffic, not the sample.

## Estimation

- engineers actually investigate. Net effect: keep roughly 10–20% of traces in the

## Architecture Diagram

```text
title: Monitoring
agent: Host Agent
ingest: Ingest API
queue: Metrics Queue
stream: Stream Processor
series: Metric Store
tags: Tag Index
alert: Alert Engine
api: Query API
dash: Dashboard
notify: Pager Notifier

agent ─► ingest ─► push metrics
ingest ─► queue ─► buffer
queue ─► stream ─► aggregate
stream ─► series ─► store
stream ─► tags ─► index
alert ─► series ─► evaluate
alert ─► notify ─► page
dash ─► api ─► query
api ─► series ─► range
agent ─► ingest ─► heartbeat
```

## Design

### Design a monitoring and observability platform

A `Host Agent` runs on every host and pushes metrics to the `Ingest API`.

- The `Ingest API` validates and buffers into a `Metrics Queue` before a
  `Stream Processor` aggregates and writes to the `Metric Store`.
- The write path is decoupled from the read path: dashboards query the
  `Query API`, which scans the `Metric Store` and resolves dimensions through a
  `Tag Index`.
- The `Alert Engine` evaluates thresholds against the series and pages on-call
  via `Pager Notifier`.
- This split is deliberate — ingestion must absorb a firehose without dropping
  points, while queries must return in milliseconds even when the store is under
  heavy write load.

The platform actually handles two data shapes that deserve separate designs.

- Metrics are dense, numeric, and write-mostly, while traces are sparse and
  high-cardinality.
- The write path is a fan-in — thousands of agents sending millions of points
  per second — absorbed by a queue that decouples bursty hosts from the store
  and provides at-least-once delivery with dedupe on
  `(metric, tags, timestamp)`.
- Durability matters: a dropped metric during an incident is a blind spot, so
  the queue must survive a store outage.
- The key trade-off is fidelity versus storage cost: do not keep every raw point
  forever; aggregate and downsample in the stream before data hits long-term
  storage, keep raw points only for a recent hot window, and derive dashboards
  from rolled-up series.

Operationally, think about failure semantics.

- The agent is on the critical path of nothing, so it should degrade gracefully:
  give it a heartbeat the platform monitors and a local buffer it can fall back
  to when the ingest path is slow.
- Query correctness depends on consistent tag naming, so define a tag schema
  (service, environment, host) and enforce it at ingest, or dashboards silently
  split into `host` versus `hostname`.
- Finally, the platform is only useful if it observes itself — ingest lag, drop
  rates, and store latency must be first-class metrics with their own alerts.

### How do you ingest metrics at high write rates?

Metrics are tiny writes with massive fan-in, so optimize for throughput and
batching, not per-request elegance. Agents buffer points and batch them over a
short window (say 10 seconds) to the `Ingest API`, which validates the envelope,
attaches tags, and appends to the `Metrics Queue` (`Kafka`) partitioned by
metric name. Partitioning by metric gives horizontal scale — add partitions to
absorb more hosts — and preserves per-metric ordering. The queue decouples
producers from the store: when the store lags, the queue absorbs the backlog
instead of failing requests. Compression and encoding matter a great deal:
time-series points compress extremely well with delta encoding of timestamps and
XOR-of-adjacent-floats encoding of values, so store points in columnar blocks
per series rather than as rows.

The `Stream Processor` consumes the queue and does three things: pre-aggregates
identical `(metric, tags)` points in a window, applies dedupe on
`(metric, tags, timestamp)` to make at-least-once delivery idempotent, and
downsamples before writing to the store. Failure handling is by design: if the
store is down, the queue holds and the processor retries with backoff; if a
single host bursts, the agent spills to local disk and replays. Accept that
ingestion is approximate — pre-aggregation intentionally loses per-point
fidelity in exchange for throughput — and size the pipeline so P99 write latency
stays in the single-digit milliseconds at peak. Never block on a synchronous
store write in the ingest path; that is what turns a store blip into an
ingestion outage.

### How do you store and query time-series data?

Store series in columnar blocks grouped by `(metric, tags)` and time range, in a
TSDB-style engine (`InfluxDB`, `Prometheus`, or a custom block store on object
storage). Each block holds one series' points in a tightly compressed columnar
layout, enabling fast range scans and vectorized aggregation. A `Tag Index` maps
tag combinations (`cpu.usage{host=*, dc=us-east}`) to a concrete set of series
IDs, so a query resolves its series set before touching any data. The
`Query API` pushes aggregation down into the store: downsampled tiers (raw → 1m
→ 5m → 1h) answer long-range queries without scanning raw blocks, and
pre-aggregated cross-host rollups serve dashboard averages.

The hot tier lives on fast local disks; old blocks tier automatically to object
storage, with a block index in the metadata layer so a query knows which blocks
to touch and can skip downsampled tiers for long windows. Trade-offs: raw
fidelity for recent windows, rolled-up aggregates for history; and watch
cardinality — high-cardinality tags (request IDs, user IDs) explode series
count, so cap cardinality per metric and collapse dimensions at ingest. Range
queries degrade gracefully: a 30-day view scans hourly rollups, not raw points,
so read cost stays bounded as data grows. The design goal is bounded query
latency at any retention depth, which is what makes dashboards usable during an
incident when everyone is looking.

Failure handling and multi-tenancy complete the picture. Replication protects
against node loss — write to a quorum in the hot tier and rely on the block
index to rebuild missing blocks from object storage. Enforce per-tenant
cardinality and query quotas so one noisy account cannot degrade global query
latency. And keep a compact table of series metadata (metric name, tag set,
block locations) in memory so resolution is a point lookup; a series count in
the hundreds of millions still fits when each entry is a few dozen bytes.

### How do you alert reliably without noise?

Reliable alerting means three things: rules evaluate on correct data, pages fire
only on real incidents, and they recover cleanly. The `Alert Engine` runs rules
such as `avg(cpu) > 90% for 5m` by querying the series at the rule's evaluation
interval, and the evaluation interval must align with data granularity or a rule
will silently miss points. The main source of noise is single-point spikes, so
require the condition to hold over a `for` duration window and add hysteresis so
an alert does not flap at the threshold. Use relative-baseline and
multi-condition alerts instead of raw thresholds for noisy metrics like latency
percentiles — alert on "P99 latency 2x its 14-day baseline for 10 minutes," not
"P99 > 500ms."

Give every alert a lifecycle — firing, acknowledged, resolved — keyed by
`(rule, series)`, and have the notifier throttle repeat pages and escalate only
if still firing after acknowledgment. Every rule should carry a runbook link and
a paging tier; high-severity (outage, data-loss) pages, informational issues
only notify. Treat `no_data` as a first-class state: a missing series can mean
the host died (page) or the metric was removed (suppress), so the engine
distinguishes them. Track rule hygiene — charge a review for every rule, and
drop rules that never fire or page constantly. Finally, alert on the pipeline
itself: an alerting system that goes quiet during an ingestion outage is worse
than a noisy one, so monitor evaluation failures and ingest lag as first-class
signals.

### How do you sample and retain traces efficiently?

Traces are high-volume and high-cardinality, so you cannot keep everything at
full fidelity. Use head-based sampling at the SDK or agent: decide per request
before it completes, using a deterministic rule such as
`hash(trace_id) % 100 < N`, which keeps whole traces and keeps the decision
stable across services so a trace is either fully kept or fully dropped.
Complement with tail-based sampling at the collector: keep traces that are slow,
errored, or rare even if head sampling dropped them, since those are the ones
engineers actually investigate. Net effect: keep roughly 10–20% of traces in the
hot store for interactive exploration, which is enough to answer most debugging
questions at a fraction of the cost.

For everything else, retain aggregates rather than raw traces: per-service
rollups of request rate, error rate, and latency percentiles by operation,
computed from the full traffic, not the sample. This is critical because
sampling biases percentile estimates — the raw sample under-represents rare slow
requests — so dashboards read percentiles from the aggregate layer and use
samples only for individual-trace detail. Cap span cardinality: strip excessive
attributes, merge noisy child spans, and set an upper bound on span count per
trace. Tier the storage: recent traces in fast storage, rolled-up summaries kept
long-term, raw traces archived to cold object storage for on-demand deep
debugging. This keeps storage cost proportional to investigation value rather
than to raw request volume.

Also plan for pipeline failure. The collector must handle backpressure and retry
without re-sampling the same trace twice, so trace IDs dedupe across retries.
Correlate traces with logs and metrics by `trace_id` and shared tags, since
debugging value comes from joining the three signals, not from the trace in
isolation. And make sampling configurable per service — high-value services
sample at higher rates while high-volume, low-value endpoints sample low — so
operators trade cost against fidelity where it matters.

## Source

```text
title: Monitoring
node agent: Host Agent [round, icon=worker]
node ingest: Ingest API [icon=server]
node queue: Metrics Queue [icon=queue]
node stream: Stream Processor [icon=compute]
node series: Metric Store [cylinder, icon=database]
node tags: Tag Index [icon=search]
node alert: Alert Engine [icon=message]
node api: Query API [icon=server]
node dash: Dashboard [icon=browser]
node notify: Pager Notifier [icon=mail]

edge agent -> ingest: push metrics
edge ingest -> queue: buffer
edge queue -> stream: aggregate
edge stream -> series: store
edge stream -> tags: index
edge alert -> series: evaluate
edge alert -> notify: page
edge dash -> api: query
edge api -> series: range
edge agent -> ingest: heartbeat
```

## Q&A

### Q: Design a monitoring and observability platform

**A:** A `Host Agent` runs on every host and pushes metrics to the `Ingest API`.

- The `Ingest API` validates and buffers into a `Metrics Queue` before a
  `Stream Processor` aggregates and writes to the `Metric Store`.
- The write path is decoupled from the read path: dashboards query the
  `Query API`, which scans the `Metric Store` and resolves dimensions through a
  `Tag Index`.
- The `Alert Engine` evaluates thresholds against the series and pages on-call
  via `Pager Notifier`.
- This split is deliberate — ingestion must absorb a firehose without dropping
  points, while queries must return in milliseconds even when the store is under
  heavy write load.

The platform actually handles two data shapes that deserve separate designs.

- Metrics are dense, numeric, and write-mostly, while traces are sparse and
  high-cardinality.
- The write path is a fan-in — thousands of agents sending millions of points
  per second — absorbed by a queue that decouples bursty hosts from the store
  and provides at-least-once delivery with dedupe on
  `(metric, tags, timestamp)`.
- Durability matters: a dropped metric during an incident is a blind spot, so
  the queue must survive a store outage.
- The key trade-off is fidelity versus storage cost: do not keep every raw point
  forever; aggregate and downsample in the stream before data hits long-term
  storage, keep raw points only for a recent hot window, and derive dashboards
  from rolled-up series.

Operationally, think about failure semantics.

- The agent is on the critical path of nothing, so it should degrade gracefully:
  give it a heartbeat the platform monitors and a local buffer it can fall back
  to when the ingest path is slow.
- Query correctness depends on consistent tag naming, so define a tag schema
  (service, environment, host) and enforce it at ingest, or dashboards silently
  split into `host` versus `hostname`.
- Finally, the platform is only useful if it observes itself — ingest lag, drop
  rates, and store latency must be first-class metrics with their own alerts.

### Q: How do you ingest metrics at high write rates?

**A:** Metrics are tiny writes with massive fan-in, so optimize for throughput and
batching, not per-request elegance. Agents buffer points and batch them over a
short window (say 10 seconds) to the `Ingest API`, which validates the envelope,
attaches tags, and appends to the `Metrics Queue` (`Kafka`) partitioned by
metric name. Partitioning by metric gives horizontal scale — add partitions to
absorb more hosts — and preserves per-metric ordering. The queue decouples
producers from the store: when the store lags, the queue absorbs the backlog
instead of failing requests. Compression and encoding matter a great deal:
time-series points compress extremely well with delta encoding of timestamps and
XOR-of-adjacent-floats encoding of values, so store points in columnar blocks
per series rather than as rows.

The `Stream Processor` consumes the queue and does three things: pre-aggregates
identical `(metric, tags)` points in a window, applies dedupe on
`(metric, tags, timestamp)` to make at-least-once delivery idempotent, and
downsamples before writing to the store. Failure handling is by design: if the
store is down, the queue holds and the processor retries with backoff; if a
single host bursts, the agent spills to local disk and replays. Accept that
ingestion is approximate — pre-aggregation intentionally loses per-point
fidelity in exchange for throughput — and size the pipeline so P99 write latency
stays in the single-digit milliseconds at peak. Never block on a synchronous
store write in the ingest path; that is what turns a store blip into an
ingestion outage.

### Q: How do you store and query time-series data?

**A:** Store series in columnar blocks grouped by `(metric, tags)` and time range, in a
TSDB-style engine (`InfluxDB`, `Prometheus`, or a custom block store on object
storage). Each block holds one series' points in a tightly compressed columnar
layout, enabling fast range scans and vectorized aggregation. A `Tag Index` maps
tag combinations (`cpu.usage{host=*, dc=us-east}`) to a concrete set of series
IDs, so a query resolves its series set before touching any data. The
`Query API` pushes aggregation down into the store: downsampled tiers (raw → 1m
→ 5m → 1h) answer long-range queries without scanning raw blocks, and
pre-aggregated cross-host rollups serve dashboard averages.

The hot tier lives on fast local disks; old blocks tier automatically to object
storage, with a block index in the metadata layer so a query knows which blocks
to touch and can skip downsampled tiers for long windows. Trade-offs: raw
fidelity for recent windows, rolled-up aggregates for history; and watch
cardinality — high-cardinality tags (request IDs, user IDs) explode series
count, so cap cardinality per metric and collapse dimensions at ingest. Range
queries degrade gracefully: a 30-day view scans hourly rollups, not raw points,
so read cost stays bounded as data grows. The design goal is bounded query
latency at any retention depth, which is what makes dashboards usable during an
incident when everyone is looking.

Failure handling and multi-tenancy complete the picture. Replication protects
against node loss — write to a quorum in the hot tier and rely on the block
index to rebuild missing blocks from object storage. Enforce per-tenant
cardinality and query quotas so one noisy account cannot degrade global query
latency. And keep a compact table of series metadata (metric name, tag set,
block locations) in memory so resolution is a point lookup; a series count in
the hundreds of millions still fits when each entry is a few dozen bytes.

### Q: How do you alert reliably without noise?

**A:** Reliable alerting means three things: rules evaluate on correct data, pages fire
only on real incidents, and they recover cleanly. The `Alert Engine` runs rules
such as `avg(cpu) > 90% for 5m` by querying the series at the rule's evaluation
interval, and the evaluation interval must align with data granularity or a rule
will silently miss points. The main source of noise is single-point spikes, so
require the condition to hold over a `for` duration window and add hysteresis so
an alert does not flap at the threshold. Use relative-baseline and
multi-condition alerts instead of raw thresholds for noisy metrics like latency
percentiles — alert on "P99 latency 2x its 14-day baseline for 10 minutes," not
"P99 > 500ms."

Give every alert a lifecycle — firing, acknowledged, resolved — keyed by
`(rule, series)`, and have the notifier throttle repeat pages and escalate only
if still firing after acknowledgment. Every rule should carry a runbook link and
a paging tier; high-severity (outage, data-loss) pages, informational issues
only notify. Treat `no_data` as a first-class state: a missing series can mean
the host died (page) or the metric was removed (suppress), so the engine
distinguishes them. Track rule hygiene — charge a review for every rule, and
drop rules that never fire or page constantly. Finally, alert on the pipeline
itself: an alerting system that goes quiet during an ingestion outage is worse
than a noisy one, so monitor evaluation failures and ingest lag as first-class
signals.

### Q: How do you sample and retain traces efficiently?

**A:** Traces are high-volume and high-cardinality, so you cannot keep everything at
full fidelity. Use head-based sampling at the SDK or agent: decide per request
before it completes, using a deterministic rule such as
`hash(trace_id) % 100 < N`, which keeps whole traces and keeps the decision
stable across services so a trace is either fully kept or fully dropped.
Complement with tail-based sampling at the collector: keep traces that are slow,
errored, or rare even if head sampling dropped them, since those are the ones
engineers actually investigate. Net effect: keep roughly 10–20% of traces in the
hot store for interactive exploration, which is enough to answer most debugging
questions at a fraction of the cost.

For everything else, retain aggregates rather than raw traces: per-service
rollups of request rate, error rate, and latency percentiles by operation,
computed from the full traffic, not the sample. This is critical because
sampling biases percentile estimates — the raw sample under-represents rare slow
requests — so dashboards read percentiles from the aggregate layer and use
samples only for individual-trace detail. Cap span cardinality: strip excessive
attributes, merge noisy child spans, and set an upper bound on span count per
trace. Tier the storage: recent traces in fast storage, rolled-up summaries kept
long-term, raw traces archived to cold object storage for on-demand deep
debugging. This keeps storage cost proportional to investigation value rather
than to raw request volume.

Also plan for pipeline failure. The collector must handle backpressure and retry
without re-sampling the same trace twice, so trace IDs dedupe across retries.
Correlate traces with logs and metrics by `trace_id` and shared tags, since
debugging value comes from joining the three signals, not from the trace in
isolation. And make sampling configurable per service — high-value services
sample at higher rates while high-volume, low-value endpoints sample low — so
operators trade cost against fidelity where it matters.

## Source

```text
title: Monitoring
node agent: Host Agent [round, icon=worker]
node ingest: Ingest API [icon=server]
node queue: Metrics Queue [icon=queue]
node stream: Stream Processor [icon=compute]
node series: Metric Store [cylinder, icon=database]
node tags: Tag Index [icon=search]
node alert: Alert Engine [icon=message]
node api: Query API [icon=server]
node dash: Dashboard [icon=browser]
node notify: Pager Notifier [icon=mail]

edge agent -> ingest: push metrics
edge ingest -> queue: buffer
edge queue -> stream: aggregate
edge stream -> series: store
edge stream -> tags: index
edge alert -> series: evaluate
edge alert -> notify: page
edge dash -> api: query
edge api -> series: range
edge agent -> ingest: heartbeat
```
