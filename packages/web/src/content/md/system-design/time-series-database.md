# Time-series Database

Design a time-series database

**Difficulty:** Medium

**Tags:** database, time-series

## Functional Requirements

- a time-series database
- ingest high-frequency writes efficiently?
- compress and downsample old data?
- query ranges and aggregations fast?
- handle out-of-order and late data?

## Non-Functional Requirements

- A time-series database (TSDB) is specialized for a workload that general-purpose
  databases handle badly.

- Many sensors or hosts each write small, timestamped samples continuously.
- Reads are almost always range queries or aggregations over a time interval.
- The write path buffers samples in a queue, groups them per series in memory,
  and flushes them into immutable, sorted segment files on disk.
- Each segment is written sequentially with no random updates, so writes
  amortize into sequential I/O and steady-state write throughput is bounded by
  disk bandwidth rather than by random-seek latency.
- This immutable, append-only design is the defining architectural choice of
  every major TSDB.

The read path uses a time index that maps a series identifier to its list of
segments and byte offsets.

- A range query seeks directly into the relevant segments instead of scanning
  the whole store.
- A hot cache serves recent segments and in-memory buffers.
- A downsampler compacts older segments into lower-resolution summaries.
- Because data is immutable, the TSDB never updates in place: compaction
  rewrites old segments, and deletes become tombstones that are reclaimed during
  compaction.
- Label and series indexes round out the model, letting a query resolve
  "host=prod and metric=cpu" to a small set of series IDs before touching data.
- The same segment-plus-index-plus-compaction skeleton appears in Prometheus,
  InfluxDB, and TimescaleDB alike.
- This design also gives predictable failure behavior: a crashed writer loses at
  most its in-memory buffer, which is recovered by WAL replay.
- A segment read during compaction is served from the old copy until the new
  segment is committed..
- The key is batching and sequential writes.

- Writers do not insert one row per sample into a B-tree; they buffer samples in
  memory, group them by series, sort by timestamp, and flush large blocks at
  once.
- This amortizes per-sample overhead — each sample becomes a few bytes inside a
  block.
- It turns what would be random inserts into sequential appends.
- The ingest API accepts batches over HTTP or gRPC.
- A write queue decouples the API from the disk flush so a slow compaction never
  back-pressures ingestion.
- Backpressure only applies at the buffer level, where a full queue tells the
  client to slow down rather than dropping silently.

Because samples for a series arrive in near-time order, each writer keeps an
append-only buffer per active series and spills to disk only when the buffer
fills.

- Multiple writer nodes shard by series — consistent hashing over the series ID
  spreads load evenly — and each shard writes its own segment files.
- Write throughput scales with the number of writers.
- On failure, the queue redelivers and the TSDB deduplicates identical (series,
  timestamp, value) tuples, so retries are safe.
- Idempotent writes plus buffered, sharded, sequential flushes are what let a
  single cluster absorb millions of points per second while keeping disk I/O
  near its theoretical maximum.
- The queue itself is partitioned and replicated so a writer outage does not
  lose buffered data.
- The ingest path reports per-series write throughput and queue depth as
  first-class metrics so operators see saturation before latency collapses..
- Range queries lean on the time index plus the sorted, immutable segment layout.

- The index maps series ID to its segment list and block offsets.
- A query resolves the series and issues a seek into the first block at the
  requested start time, then reads forward sequentially to the end time.
- Because blocks are sorted by timestamp, the query skips everything outside its
  range — it never scans the full series.
- The hot cache serves recent ranges from memory.
- The query engine prefers cached block summaries over full scans when a coarser
  answer suffices.
- A label filter is resolved first through the series index, so a query for "cpu
  and host=prod" touches only the matching series instead of everything.

Aggregations exploit precomputation.

- The downsample tier already holds min/max/mean/sum per bucket, so a range
  aggregation over an older window sums bucket summaries instead of iterating
  points.
- For raw-range aggregations, the engine reads blocks and reduces incrementally,
  parallelizing across shards and folding partial results in a merge step.
- The query API exposes downsampled views by default and raw point views when
  explicitly requested.
- This keeps dashboard queries fast even on multi-year ranges.
- Correctness is maintained by routing queries through the same index and by
  carrying the aggregation metadata in the segment headers.
- The engine always knows which precomputed aggregates exist and which
  resolution to use.
- Cardinality control is part of query performance: the series index is kept
  healthy by enforcing bounded labels and per-series write limits.
- Runaway series cardinality degrades both indexing and range seeks regardless
  of the storage engine..
- Real systems deliver samples late — a network partition, a rebuffered agent, or
  a clock-skewed sensor — and a TSDB must ingest them without corrupting the
  append-only timeline.

- The design separates in-order from out-of-order handling.
- In-order samples append to the active buffer as usual.
- Late samples, whose timestamp predates the current buffer's high-water mark,
  are routed to a separate out-of-order buffer keyed by (series, timestamp).
- The writer merges them into existing segments during the next compaction pass,
  when a sorted merge reorders the timeline correctly.
- This keeps the main ingest path append-only while the merge handles reordering
  cheaply and in bulk.

The out-of-order buffer is bounded.

- Each series keeps a configurable window (often minutes to hours).
- Samples older than that are rejected or dropped to a dead-letter queue with an
  error surfaced to the writer.
- Deduplication handles the duplicate case — a retried write with the identical
  (series, timestamp, value) tuple is idempotent and silently ignored.
- Downsampling must also tolerate late data: buckets are not finalized until a
  grace period passes.
- A late sample arriving after a bucket was compacted is folded into the next
  compaction pass rather than lost.
- The TSDB exposes the effective watermark per series — the latest timestamp for
  which all samples are present.
- A range query can tell users whether it has seen everything, preventing
  misleading gaps in dashboards during an ingestion backlog.
- The watermark is indexed so a query can cheaply report "data through 14:00"
  and flag any gap.
- Operators can widen the out-of-order window for known-flaky sources while
  keeping the default tight for the steady state.

## Source

````text
title: Time-series DB
node source: Sensor [round, icon=worker]
node ingest: Ingest API [icon=server]
node queue: Write Queue [icon=queue]
node writer: TSDB Writer [icon=compute]
node storage: Segment Store [cylinder, icon=database]
node index: Time Index [icon=search]
node downsample: Downsampler [icon=compute]
node query: Query Engine [icon=search]
node cache: Hot Cache [cylinder, icon=cache]
node api: Query API [icon=server]

edge source -> ingest: write
edge ingest -> queue: buffer
edge queue -> writer: flush
edge writer -> storage: segment
edge writer -> index: build
edge storage -> downsample: compact
edge api -> query: read
edge query -> cache: hit
edge query -> storage: scan
edge query -> index: locate
```.

## Estimation

- compression, a typical 16-byte sample can compress to about 2 bytes — a 5–8x

## Architecture Diagram

```text
title: Time-series DB
source: Sensor
ingest: Ingest API
queue: Write Queue
writer: TSDB Writer
storage: Segment Store
index: Time Index
downsample: Downsampler
query: Query Engine
cache: Hot Cache
api: Query API

source ─► ingest ─► write
ingest ─► queue ─► buffer
queue ─► writer ─► flush
writer ─► storage ─► segment
writer ─► index ─► build
storage ─► downsample ─► compact
api ─► query ─► read
query ─► cache ─► hit
query ─► storage ─► scan
query ─► index ─► locate
````

## Design

### Design a time-series database

A time-series database (TSDB) is specialized for a workload that general-purpose
databases handle badly.

- Many sensors or hosts each write small, timestamped samples continuously.
- Reads are almost always range queries or aggregations over a time interval.
- The write path buffers samples in a queue, groups them per series in memory,
  and flushes them into immutable, sorted segment files on disk.
- Each segment is written sequentially with no random updates, so writes
  amortize into sequential I/O and steady-state write throughput is bounded by
  disk bandwidth rather than by random-seek latency.
- This immutable, append-only design is the defining architectural choice of
  every major TSDB.

The read path uses a time index that maps a series identifier to its list of
segments and byte offsets.

- A range query seeks directly into the relevant segments instead of scanning
  the whole store.
- A hot cache serves recent segments and in-memory buffers.
- A downsampler compacts older segments into lower-resolution summaries.
- Because data is immutable, the TSDB never updates in place: compaction
  rewrites old segments, and deletes become tombstones that are reclaimed during
  compaction.
- Label and series indexes round out the model, letting a query resolve
  "host=prod and metric=cpu" to a small set of series IDs before touching data.
- The same segment-plus-index-plus-compaction skeleton appears in Prometheus,
  InfluxDB, and TimescaleDB alike.
- This design also gives predictable failure behavior: a crashed writer loses at
  most its in-memory buffer, which is recovered by WAL replay.
- A segment read during compaction is served from the old copy until the new
  segment is committed.

### How do you ingest high-frequency writes efficiently?

The key is batching and sequential writes.

- Writers do not insert one row per sample into a B-tree; they buffer samples in
  memory, group them by series, sort by timestamp, and flush large blocks at
  once.
- This amortizes per-sample overhead — each sample becomes a few bytes inside a
  block.
- It turns what would be random inserts into sequential appends.
- The ingest API accepts batches over HTTP or gRPC.
- A write queue decouples the API from the disk flush so a slow compaction never
  back-pressures ingestion.
- Backpressure only applies at the buffer level, where a full queue tells the
  client to slow down rather than dropping silently.

Because samples for a series arrive in near-time order, each writer keeps an
append-only buffer per active series and spills to disk only when the buffer
fills.

- Multiple writer nodes shard by series — consistent hashing over the series ID
  spreads load evenly — and each shard writes its own segment files.
- Write throughput scales with the number of writers.
- On failure, the queue redelivers and the TSDB deduplicates identical (series,
  timestamp, value) tuples, so retries are safe.
- Idempotent writes plus buffered, sharded, sequential flushes are what let a
  single cluster absorb millions of points per second while keeping disk I/O
  near its theoretical maximum.
- The queue itself is partitioned and replicated so a writer outage does not
  lose buffered data.
- The ingest path reports per-series write throughput and queue depth as
  first-class metrics so operators see saturation before latency collapses.

### How do you compress and downsample old data?

Raw time-series samples compress extremely well because adjacent timestamps and
values are correlated.

- Timestamps are stored as deltas, and deltas-of-deltas (the Gorilla scheme from
  Facebook) shrinks most timestamps to one or two bytes.
- Values are XOR-encoded against the previous value, so unchanged or slowly
  changing series cost almost nothing per point.
- Combined with dictionary encoding for repeated label values and LZ-style block
  compression, a typical 16-byte sample can compress to about 2 bytes — a 5–8x
  reduction.
- That is why a TSDB can hold months of data on modest disks.

Downsampling reduces the data that is no longer hot but still needs to be
queryable.

- A downsampler periodically compacts older segments into coarser resolutions —
  1-second raw points become 1-minute min/max/mean/sum, then 1-hour — and stores
  the precomputed aggregates alongside the raw range.
- Queries that fit the coarser bucket read far less data.
- The raw points can be deleted or moved to cold object storage after a
  retention window.
- Because compaction is a merge of immutable segments, it is crash-safe: a
  partially compacted segment is simply rebuilt from its inputs.
- Tombstones from deletes are only reclaimed during compaction.
- Retention policy is the final lever, trading storage cost against query
  precision across hot, warm, and cold tiers.
- Compression ratios are verified continuously: the writer samples encoded block
  size against raw size.
- A ratio that degrades — for example after a label schema change — alerts
  before storage costs balloon.

### How do you query ranges and aggregations fast?

Range queries lean on the time index plus the sorted, immutable segment layout.

- The index maps series ID to its segment list and block offsets.
- A query resolves the series and issues a seek into the first block at the
  requested start time, then reads forward sequentially to the end time.
- Because blocks are sorted by timestamp, the query skips everything outside its
  range — it never scans the full series.
- The hot cache serves recent ranges from memory.
- The query engine prefers cached block summaries over full scans when a coarser
  answer suffices.
- A label filter is resolved first through the series index, so a query for "cpu
  and host=prod" touches only the matching series instead of everything.

Aggregations exploit precomputation.

- The downsample tier already holds min/max/mean/sum per bucket, so a range
  aggregation over an older window sums bucket summaries instead of iterating
  points.
- For raw-range aggregations, the engine reads blocks and reduces incrementally,
  parallelizing across shards and folding partial results in a merge step.
- The query API exposes downsampled views by default and raw point views when
  explicitly requested.
- This keeps dashboard queries fast even on multi-year ranges.
- Correctness is maintained by routing queries through the same index and by
  carrying the aggregation metadata in the segment headers.
- The engine always knows which precomputed aggregates exist and which
  resolution to use.
- Cardinality control is part of query performance: the series index is kept
  healthy by enforcing bounded labels and per-series write limits.
- Runaway series cardinality degrades both indexing and range seeks regardless
  of the storage engine.

### How do you handle out-of-order and late data?

Real systems deliver samples late — a network partition, a rebuffered agent, or
a clock-skewed sensor — and a TSDB must ingest them without corrupting the
append-only timeline.

- The design separates in-order from out-of-order handling.
- In-order samples append to the active buffer as usual.
- Late samples, whose timestamp predates the current buffer's high-water mark,
  are routed to a separate out-of-order buffer keyed by (series, timestamp).
- The writer merges them into existing segments during the next compaction pass,
  when a sorted merge reorders the timeline correctly.
- This keeps the main ingest path append-only while the merge handles reordering
  cheaply and in bulk.

The out-of-order buffer is bounded.

- Each series keeps a configurable window (often minutes to hours).
- Samples older than that are rejected or dropped to a dead-letter queue with an
  error surfaced to the writer.
- Deduplication handles the duplicate case — a retried write with the identical
  (series, timestamp, value) tuple is idempotent and silently ignored.
- Downsampling must also tolerate late data: buckets are not finalized until a
  grace period passes.
- A late sample arriving after a bucket was compacted is folded into the next
  compaction pass rather than lost.
- The TSDB exposes the effective watermark per series — the latest timestamp for
  which all samples are present.
- A range query can tell users whether it has seen everything, preventing
  misleading gaps in dashboards during an ingestion backlog.
- The watermark is indexed so a query can cheaply report "data through 14:00"
  and flag any gap.
- Operators can widen the out-of-order window for known-flaky sources while
  keeping the default tight for the steady state.

## Source

```text
title: Time-series DB
node source: Sensor [round, icon=worker]
node ingest: Ingest API [icon=server]
node queue: Write Queue [icon=queue]
node writer: TSDB Writer [icon=compute]
node storage: Segment Store [cylinder, icon=database]
node index: Time Index [icon=search]
node downsample: Downsampler [icon=compute]
node query: Query Engine [icon=search]
node cache: Hot Cache [cylinder, icon=cache]
node api: Query API [icon=server]

edge source -> ingest: write
edge ingest -> queue: buffer
edge queue -> writer: flush
edge writer -> storage: segment
edge writer -> index: build
edge storage -> downsample: compact
edge api -> query: read
edge query -> cache: hit
edge query -> storage: scan
edge query -> index: locate
```

## Q&A

### Q: Design a time-series database

**A:** A time-series database (TSDB) is specialized for a workload that general-purpose
databases handle badly.

- Many sensors or hosts each write small, timestamped samples continuously.
- Reads are almost always range queries or aggregations over a time interval.
- The write path buffers samples in a queue, groups them per series in memory,
  and flushes them into immutable, sorted segment files on disk.
- Each segment is written sequentially with no random updates, so writes
  amortize into sequential I/O and steady-state write throughput is bounded by
  disk bandwidth rather than by random-seek latency.
- This immutable, append-only design is the defining architectural choice of
  every major TSDB.

The read path uses a time index that maps a series identifier to its list of
segments and byte offsets.

- A range query seeks directly into the relevant segments instead of scanning
  the whole store.
- A hot cache serves recent segments and in-memory buffers.
- A downsampler compacts older segments into lower-resolution summaries.
- Because data is immutable, the TSDB never updates in place: compaction
  rewrites old segments, and deletes become tombstones that are reclaimed during
  compaction.
- Label and series indexes round out the model, letting a query resolve
  "host=prod and metric=cpu" to a small set of series IDs before touching data.
- The same segment-plus-index-plus-compaction skeleton appears in Prometheus,
  InfluxDB, and TimescaleDB alike.
- This design also gives predictable failure behavior: a crashed writer loses at
  most its in-memory buffer, which is recovered by WAL replay.
- A segment read during compaction is served from the old copy until the new
  segment is committed.

### Q: How do you ingest high-frequency writes efficiently?

**A:** The key is batching and sequential writes.

- Writers do not insert one row per sample into a B-tree; they buffer samples in
  memory, group them by series, sort by timestamp, and flush large blocks at
  once.
- This amortizes per-sample overhead — each sample becomes a few bytes inside a
  block.
- It turns what would be random inserts into sequential appends.
- The ingest API accepts batches over HTTP or gRPC.
- A write queue decouples the API from the disk flush so a slow compaction never
  back-pressures ingestion.
- Backpressure only applies at the buffer level, where a full queue tells the
  client to slow down rather than dropping silently.

Because samples for a series arrive in near-time order, each writer keeps an
append-only buffer per active series and spills to disk only when the buffer
fills.

- Multiple writer nodes shard by series — consistent hashing over the series ID
  spreads load evenly — and each shard writes its own segment files.
- Write throughput scales with the number of writers.
- On failure, the queue redelivers and the TSDB deduplicates identical (series,
  timestamp, value) tuples, so retries are safe.
- Idempotent writes plus buffered, sharded, sequential flushes are what let a
  single cluster absorb millions of points per second while keeping disk I/O
  near its theoretical maximum.
- The queue itself is partitioned and replicated so a writer outage does not
  lose buffered data.
- The ingest path reports per-series write throughput and queue depth as
  first-class metrics so operators see saturation before latency collapses.

### Q: How do you compress and downsample old data?

**A:** Raw time-series samples compress extremely well because adjacent timestamps and
values are correlated.

- Timestamps are stored as deltas, and deltas-of-deltas (the Gorilla scheme from
  Facebook) shrinks most timestamps to one or two bytes.
- Values are XOR-encoded against the previous value, so unchanged or slowly
  changing series cost almost nothing per point.
- Combined with dictionary encoding for repeated label values and LZ-style block
  compression, a typical 16-byte sample can compress to about 2 bytes — a 5–8x
  reduction.
- That is why a TSDB can hold months of data on modest disks.

Downsampling reduces the data that is no longer hot but still needs to be
queryable.

- A downsampler periodically compacts older segments into coarser resolutions —
  1-second raw points become 1-minute min/max/mean/sum, then 1-hour — and stores
  the precomputed aggregates alongside the raw range.
- Queries that fit the coarser bucket read far less data.
- The raw points can be deleted or moved to cold object storage after a
  retention window.
- Because compaction is a merge of immutable segments, it is crash-safe: a
  partially compacted segment is simply rebuilt from its inputs.
- Tombstones from deletes are only reclaimed during compaction.
- Retention policy is the final lever, trading storage cost against query
  precision across hot, warm, and cold tiers.
- Compression ratios are verified continuously: the writer samples encoded block
  size against raw size.
- A ratio that degrades — for example after a label schema change — alerts
  before storage costs balloon.

### Q: How do you query ranges and aggregations fast?

**A:** Range queries lean on the time index plus the sorted, immutable segment layout.

- The index maps series ID to its segment list and block offsets.
- A query resolves the series and issues a seek into the first block at the
  requested start time, then reads forward sequentially to the end time.
- Because blocks are sorted by timestamp, the query skips everything outside its
  range — it never scans the full series.
- The hot cache serves recent ranges from memory.
- The query engine prefers cached block summaries over full scans when a coarser
  answer suffices.
- A label filter is resolved first through the series index, so a query for "cpu
  and host=prod" touches only the matching series instead of everything.

Aggregations exploit precomputation.

- The downsample tier already holds min/max/mean/sum per bucket, so a range
  aggregation over an older window sums bucket summaries instead of iterating
  points.
- For raw-range aggregations, the engine reads blocks and reduces incrementally,
  parallelizing across shards and folding partial results in a merge step.
- The query API exposes downsampled views by default and raw point views when
  explicitly requested.
- This keeps dashboard queries fast even on multi-year ranges.
- Correctness is maintained by routing queries through the same index and by
  carrying the aggregation metadata in the segment headers.
- The engine always knows which precomputed aggregates exist and which
  resolution to use.
- Cardinality control is part of query performance: the series index is kept
  healthy by enforcing bounded labels and per-series write limits.
- Runaway series cardinality degrades both indexing and range seeks regardless
  of the storage engine.

### Q: How do you handle out-of-order and late data?

**A:** Real systems deliver samples late — a network partition, a rebuffered agent, or
a clock-skewed sensor — and a TSDB must ingest them without corrupting the
append-only timeline.

- The design separates in-order from out-of-order handling.
- In-order samples append to the active buffer as usual.
- Late samples, whose timestamp predates the current buffer's high-water mark,
  are routed to a separate out-of-order buffer keyed by (series, timestamp).
- The writer merges them into existing segments during the next compaction pass,
  when a sorted merge reorders the timeline correctly.
- This keeps the main ingest path append-only while the merge handles reordering
  cheaply and in bulk.

The out-of-order buffer is bounded.

- Each series keeps a configurable window (often minutes to hours).
- Samples older than that are rejected or dropped to a dead-letter queue with an
  error surfaced to the writer.
- Deduplication handles the duplicate case — a retried write with the identical
  (series, timestamp, value) tuple is idempotent and silently ignored.
- Downsampling must also tolerate late data: buckets are not finalized until a
  grace period passes.
- A late sample arriving after a bucket was compacted is folded into the next
  compaction pass rather than lost.
- The TSDB exposes the effective watermark per series — the latest timestamp for
  which all samples are present.
- A range query can tell users whether it has seen everything, preventing
  misleading gaps in dashboards during an ingestion backlog.
- The watermark is indexed so a query can cheaply report "data through 14:00"
  and flag any gap.
- Operators can widen the out-of-order window for known-flaky sources while
  keeping the default tight for the steady state.

## Source

```text
title: Time-series DB
node source: Sensor [round, icon=worker]
node ingest: Ingest API [icon=server]
node queue: Write Queue [icon=queue]
node writer: TSDB Writer [icon=compute]
node storage: Segment Store [cylinder, icon=database]
node index: Time Index [icon=search]
node downsample: Downsampler [icon=compute]
node query: Query Engine [icon=search]
node cache: Hot Cache [cylinder, icon=cache]
node api: Query API [icon=server]

edge source -> ingest: write
edge ingest -> queue: buffer
edge queue -> writer: flush
edge writer -> storage: segment
edge writer -> index: build
edge storage -> downsample: compact
edge api -> query: read
edge query -> cache: hit
edge query -> storage: scan
edge query -> index: locate
```
