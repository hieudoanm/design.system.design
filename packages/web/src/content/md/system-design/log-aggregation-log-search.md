# Log Aggregation — Log Search

Design a log aggregation system

**Difficulty:** Hard

**Tags:** logging, search

## Functional Requirements

- a log aggregation system
- ship logs reliably from thousands of hosts?
- index and search structured logs fast?
- handle hot shards and uneven log volumes?
- archive old logs cheaply?

## Non-Functional Requirements

- A `Log Agent` runs on every `Host`, tails files (or receives app events),
  enriches them, and ships to `Collectors`, which batch into a `Log Queue`.

- The `Indexer` consumes, parses each line into structured fields (timestamp,
  level, service, host, message), writes the parsed record to the `Log Index`
  for search, and archives the raw payload to the `Archive Store`.
- Users search through the `Log UI`, which calls the `Query Service` — fast
  queries hit the `Log Index`, deep historical queries spill to the archive.
- `Alerting` watches the index for patterns and notifies the UI.

The design separates the write path from the read path.

- The write path is high-throughput fan-in and latency-tolerant — a log that
  arrives a second late is invisible to users.
- The read path is interactive and must return in seconds, even mid-incident
  when everyone is searching at once.
- Because log volume dwarfs metric volume — gigabytes per host per day — the
  whole system is about compression and tiering: index recent logs hot, archive
  cold, and never hold the full raw stream in the hot tier.
- Availability is best-effort by nature: losing the tail of a log is acceptable
  briefly, so use at-least-once semantics, let the queue absorb backpressure,
  and let the archive be the durable record.
- Correctness matters most for the searchable fields, not for byte-level
  fidelity of every raw line.

Scaling and failure handling complete the picture.

- The queue partitions by service and host so no single noisy tenant blocks
  another; the indexer autoscales against queue depth; and the hot tier is sized
  as a rolling window while the archive is the durable record.
- Quotas per service keep cost bounded and fair.
- Because logs are the first place engineers look during an incident,
  availability of the query path matters more than freshness of the last few
  seconds — so the index is replicated and the UI degrades to archive search
  when the hot tier is down..
- Shipping has three requirements: low overhead on the host, no data loss on host
  restart, and tolerance for collector outages.

- The `Log Agent` tails local files with checkpointing — it records byte offsets
  per file to a local buffer — so a restart resumes exactly where it stopped
  instead of re-reading or skipping.
- Agents batch lines, compress them (gzip gives roughly 10x on text), and send;
  when collectors are unreachable, they buffer to local disk and replay later.
- The `Collector` accepts, validates, and pushes to the `Log Queue` (`Kafka`)
  partitioned by a hash of `(service, host)`, which preserves per-host ordering
  so a host's logs stay in sequence downstream.

Backpressure handling matters.

- If the queue is full, the agent drops oldest or applies a sampling policy
  rather than unbounded local buffering, and it reports drop counts so the loss
  is visible.
- Because logs from many hosts interleave, the agent attaches source metadata
  (`host`, `service`, `env`) to every batch so queries can filter later without
  guessing.
- The trade-off is sync versus async: synchronous sends guarantee delivery but
  stall the app; fully async risks losing the last few lines on crash.
- The pragmatic answer is async with a bounded local spool, checkpointed
  offsets, and monitoring for drops — you lose at most the tail on a crash, and
  you see that loss in the dashboard rather than finding it during an incident.

Also consider multi-tenant isolation and observability of shipping itself.

- Tag every batch with service and environment at the agent, and enforce
  per-tenant bandwidth quotas at the collector so one noisy host cannot exhaust
  the queue.
- Ship agent metrics (buffered bytes, drop counts, send latency) to the
  monitoring platform so shipping health is visible — a host silently not
  shipping logs is invisible to every downstream system.
- Finally, make the wire protocol versioned and backward compatible, so agent
  upgrades can roll across a fleet without a coordinated cutover..
- Log volume is inherently skew-y: one noisy service or one incident can emit more
  than everything else combined, turning a hot shard into a bottleneck that hurts
  its neighbors on the same node.

- Mitigate at the source with routing — partition the queue and index by
  `(service, host)` so heavy producers spread across partitions instead of
  colliding.
- If a single partition is still hot, sub-shard by a secondary key (such as
  host) or shard by time-within-service so writes fan out across more shards.
- The `Indexer` autoscales against queue depth, so a spike adds consumers
  instead of backing up.

On the read side, keep hot shards on faster storage — SSD or local NVMe — while
cold shards tier to object storage automatically based on age and access
frequency.

- Add quotas per service: a `Log Agent` sending at 10x its allowance gets
  sampled or throttled so it cannot starve the index for everyone else.
- The time-based index layout helps operationally, because a slow shard ages out
  naturally; monitor shard size and per-shard query latency, and when a shard is
  oversized, split it rather than moving data — splitting keeps writes
  append-only and bounded.
- The design principle is to treat skew as the norm, not the exception: assume
  one tenant will always be the noisy one, and make the system shed or spread
  its load instead of failing.

Quantify the problem so you can tune it.

- Track per-partition lag, per-shard size, and each service's share of total
  volume; alert when one service exceeds, say, 20% of index capacity, so an
  operator can raise its quota or add shards before it degrades neighbors.
- Combine skew handling with backpressure at the queue — the queue holds, the
  indexer drains in batches, and the archive ingests continuously regardless of
  hot-tier pressure.
- The design principle is to make skew a monitored, tunable input rather than a
  surprise: the platform assumes one tenant is always the noisy one and prices,
  throttles, or spreads accordingly..
- Full-fidelity logs grow forever, so hot storage must be a rolling window and the
  archive the long-term home.

- Design a two-tier scheme: the hot `Log Index` keeps recent logs (e.g., 7–30
  days) for fast interactive search, while a `Cold Archive` on object storage
  (S3, GCS) keeps everything in compressed bulk files, never individually
  indexed.
- The `Indexer` writes each batch twice — to the hot index and to immutable
  archive segments partitioned by `(service, date)` in a compressed columnar
  format — so nothing is ever reprocessed for archival.
- Retention policies are per service and enforced by the data plane: delete hot
  shards past their window, and expire archive segments by lifecycle rules on
  the object store, so cost is bounded by policy rather than by accident.

Deep search over the archive is deliberately slow.

- The `Query Service` ships a query to the archive segments covering the
  requested range, scans them in parallel (a `Spark`/`Hadoop`-style job), and
  streams results back — minutes, not milliseconds, which is the acceptable
  price for last quarter's incident.
- The trade-off is explicit: you lose interactive latency on old data and gain
  orders-of-magnitude cost savings, because object storage plus columnar
  compression is tens of times cheaper per byte than a hot index.
- Only recent logs get the fast path; everything older is searchable-but-slow.
- Set expectations in the UI — label archive queries "slow search" — and give
  every archival segment a manifest so queries can skip irrelevant segments by
  metadata before scanning.

## Source

````text
title: Log Aggregation
node host: Host [round, icon=worker]
node agent: Log Agent [icon=worker]
node collector: Collector [icon=server]
node queue: Log Queue [icon=queue]
node indexer: Indexer [icon=compute]
node index: Log Index [icon=search]
node store: Archive Store [cylinder, icon=database]
node query: Query Service [icon=search]
node alert: Alerting [icon=message]
node ui: Log UI [icon=browser]

edge host -> agent: tail
edge agent -> collector: ship
edge collector -> queue: batch
edge queue -> indexer: parse
edge indexer -> index: index
edge indexer -> store: archive
edge ui -> query: search
edge query -> index: lookup
edge query -> store: deep
edge index -> alert: pattern
edge alert -> ui: notify
```.

## Estimation

- Agents batch lines, compress them (gzip gives roughly 10x on text), and send;

## Architecture Diagram

```text
title: Log Aggregation
host: Host
agent: Log Agent
collector: Collector
queue: Log Queue
indexer: Indexer
index: Log Index
store: Archive Store
query: Query Service
alert: Alerting
ui: Log UI

host ─► agent ─► tail
agent ─► collector ─► ship
collector ─► queue ─► batch
queue ─► indexer ─► parse
indexer ─► index ─► index
indexer ─► store ─► archive
ui ─► query ─► search
query ─► index ─► lookup
query ─► store ─► deep
index ─► alert ─► pattern
alert ─► ui ─► notify
````

## Design

### Design a log aggregation system

A `Log Agent` runs on every `Host`, tails files (or receives app events),
enriches them, and ships to `Collectors`, which batch into a `Log Queue`.

- The `Indexer` consumes, parses each line into structured fields (timestamp,
  level, service, host, message), writes the parsed record to the `Log Index`
  for search, and archives the raw payload to the `Archive Store`.
- Users search through the `Log UI`, which calls the `Query Service` — fast
  queries hit the `Log Index`, deep historical queries spill to the archive.
- `Alerting` watches the index for patterns and notifies the UI.

The design separates the write path from the read path.

- The write path is high-throughput fan-in and latency-tolerant — a log that
  arrives a second late is invisible to users.
- The read path is interactive and must return in seconds, even mid-incident
  when everyone is searching at once.
- Because log volume dwarfs metric volume — gigabytes per host per day — the
  whole system is about compression and tiering: index recent logs hot, archive
  cold, and never hold the full raw stream in the hot tier.
- Availability is best-effort by nature: losing the tail of a log is acceptable
  briefly, so use at-least-once semantics, let the queue absorb backpressure,
  and let the archive be the durable record.
- Correctness matters most for the searchable fields, not for byte-level
  fidelity of every raw line.

Scaling and failure handling complete the picture.

- The queue partitions by service and host so no single noisy tenant blocks
  another; the indexer autoscales against queue depth; and the hot tier is sized
  as a rolling window while the archive is the durable record.
- Quotas per service keep cost bounded and fair.
- Because logs are the first place engineers look during an incident,
  availability of the query path matters more than freshness of the last few
  seconds — so the index is replicated and the UI degrades to archive search
  when the hot tier is down.

### How do you ship logs reliably from thousands of hosts?

Shipping has three requirements: low overhead on the host, no data loss on host
restart, and tolerance for collector outages.

- The `Log Agent` tails local files with checkpointing — it records byte offsets
  per file to a local buffer — so a restart resumes exactly where it stopped
  instead of re-reading or skipping.
- Agents batch lines, compress them (gzip gives roughly 10x on text), and send;
  when collectors are unreachable, they buffer to local disk and replay later.
- The `Collector` accepts, validates, and pushes to the `Log Queue` (`Kafka`)
  partitioned by a hash of `(service, host)`, which preserves per-host ordering
  so a host's logs stay in sequence downstream.

Backpressure handling matters.

- If the queue is full, the agent drops oldest or applies a sampling policy
  rather than unbounded local buffering, and it reports drop counts so the loss
  is visible.
- Because logs from many hosts interleave, the agent attaches source metadata
  (`host`, `service`, `env`) to every batch so queries can filter later without
  guessing.
- The trade-off is sync versus async: synchronous sends guarantee delivery but
  stall the app; fully async risks losing the last few lines on crash.
- The pragmatic answer is async with a bounded local spool, checkpointed
  offsets, and monitoring for drops — you lose at most the tail on a crash, and
  you see that loss in the dashboard rather than finding it during an incident.

Also consider multi-tenant isolation and observability of shipping itself.

- Tag every batch with service and environment at the agent, and enforce
  per-tenant bandwidth quotas at the collector so one noisy host cannot exhaust
  the queue.
- Ship agent metrics (buffered bytes, drop counts, send latency) to the
  monitoring platform so shipping health is visible — a host silently not
  shipping logs is invisible to every downstream system.
- Finally, make the wire protocol versioned and backward compatible, so agent
  upgrades can roll across a fleet without a coordinated cutover.

### How do you index and search structured logs fast?

Parse logs into structured fields at ingest and index only the searchable
dimensions.

- The timestamp is always indexed, plus fields that queries actually filter on —
  `level`, `service`, `host`, `trace_id` — with the free-text `message`
  tokenized into an inverted index.
- Store the document in a compressed columnar layout so full-text range scans
  stay cheap.
- The `Log Index` shards by time (e.g., daily indices), so a query routes only
  to the shards overlapping its time window and drops everything outside the
  range — this is the single biggest query win, because most investigations are
  "the last hour."

The query path is:

- Parse the UI query into filters (time range, field equals, text match), hit
  the index for matching document IDs, then hydrate previews from the store.
- Dashboards avoid raw scans entirely by reading pre-aggregated counts — hourly
  events per `level` and `service` — computed continuously at ingest.
- Trade-offs: indexing every field is wasteful and slows ingest, so index a
  curated field set and keep `message` as the primary-term index; deep scrolling
  of large result sets is expensive, so cap result sizes and stream pages to the
  UI.
- The design goal is sub-second search over recent logs at high write volume,
  with freshness measured in seconds — new logs appear in search almost
  immediately after they are written.

A few operational details keep search fast and fair.

- Enforce a per-query time-window cap and a result cap so one expensive query
  cannot pin a shard; alias short time ranges to the covering shards so "last 5
  minutes" touches only today's shard.
- Tier the index by freshness — hot shards on fast disks, older shards on
  cheaper storage — since access probability decays sharply with age.
- And because the index is derived data, treat it as rebuildable: if a shard is
  corrupt, rebuild it from the archive rather than repairing in place, which is
  why the raw payload is archived before the parsed record is indexed.

### How do you handle hot shards and uneven log volumes?

Log volume is inherently skew-y: one noisy service or one incident can emit more
than everything else combined, turning a hot shard into a bottleneck that hurts
its neighbors on the same node.

- Mitigate at the source with routing — partition the queue and index by
  `(service, host)` so heavy producers spread across partitions instead of
  colliding.
- If a single partition is still hot, sub-shard by a secondary key (such as
  host) or shard by time-within-service so writes fan out across more shards.
- The `Indexer` autoscales against queue depth, so a spike adds consumers
  instead of backing up.

On the read side, keep hot shards on faster storage — SSD or local NVMe — while
cold shards tier to object storage automatically based on age and access
frequency.

- Add quotas per service: a `Log Agent` sending at 10x its allowance gets
  sampled or throttled so it cannot starve the index for everyone else.
- The time-based index layout helps operationally, because a slow shard ages out
  naturally; monitor shard size and per-shard query latency, and when a shard is
  oversized, split it rather than moving data — splitting keeps writes
  append-only and bounded.
- The design principle is to treat skew as the norm, not the exception: assume
  one tenant will always be the noisy one, and make the system shed or spread
  its load instead of failing.

Quantify the problem so you can tune it.

- Track per-partition lag, per-shard size, and each service's share of total
  volume; alert when one service exceeds, say, 20% of index capacity, so an
  operator can raise its quota or add shards before it degrades neighbors.
- Combine skew handling with backpressure at the queue — the queue holds, the
  indexer drains in batches, and the archive ingests continuously regardless of
  hot-tier pressure.
- The design principle is to make skew a monitored, tunable input rather than a
  surprise: the platform assumes one tenant is always the noisy one and prices,
  throttles, or spreads accordingly.

### How do you archive old logs cheaply?

Full-fidelity logs grow forever, so hot storage must be a rolling window and the
archive the long-term home.

- Design a two-tier scheme: the hot `Log Index` keeps recent logs (e.g., 7–30
  days) for fast interactive search, while a `Cold Archive` on object storage
  (S3, GCS) keeps everything in compressed bulk files, never individually
  indexed.
- The `Indexer` writes each batch twice — to the hot index and to immutable
  archive segments partitioned by `(service, date)` in a compressed columnar
  format — so nothing is ever reprocessed for archival.
- Retention policies are per service and enforced by the data plane: delete hot
  shards past their window, and expire archive segments by lifecycle rules on
  the object store, so cost is bounded by policy rather than by accident.

Deep search over the archive is deliberately slow.

- The `Query Service` ships a query to the archive segments covering the
  requested range, scans them in parallel (a `Spark`/`Hadoop`-style job), and
  streams results back — minutes, not milliseconds, which is the acceptable
  price for last quarter's incident.
- The trade-off is explicit: you lose interactive latency on old data and gain
  orders-of-magnitude cost savings, because object storage plus columnar
  compression is tens of times cheaper per byte than a hot index.
- Only recent logs get the fast path; everything older is searchable-but-slow.
- Set expectations in the UI — label archive queries "slow search" — and give
  every archival segment a manifest so queries can skip irrelevant segments by
  metadata before scanning.

## Source

```text
title: Log Aggregation
node host: Host [round, icon=worker]
node agent: Log Agent [icon=worker]
node collector: Collector [icon=server]
node queue: Log Queue [icon=queue]
node indexer: Indexer [icon=compute]
node index: Log Index [icon=search]
node store: Archive Store [cylinder, icon=database]
node query: Query Service [icon=search]
node alert: Alerting [icon=message]
node ui: Log UI [icon=browser]

edge host -> agent: tail
edge agent -> collector: ship
edge collector -> queue: batch
edge queue -> indexer: parse
edge indexer -> index: index
edge indexer -> store: archive
edge ui -> query: search
edge query -> index: lookup
edge query -> store: deep
edge index -> alert: pattern
edge alert -> ui: notify
```

## Q&A

### Q: Design a log aggregation system

**A:** A `Log Agent` runs on every `Host`, tails files (or receives app events),
enriches them, and ships to `Collectors`, which batch into a `Log Queue`.

- The `Indexer` consumes, parses each line into structured fields (timestamp,
  level, service, host, message), writes the parsed record to the `Log Index`
  for search, and archives the raw payload to the `Archive Store`.
- Users search through the `Log UI`, which calls the `Query Service` — fast
  queries hit the `Log Index`, deep historical queries spill to the archive.
- `Alerting` watches the index for patterns and notifies the UI.

The design separates the write path from the read path.

- The write path is high-throughput fan-in and latency-tolerant — a log that
  arrives a second late is invisible to users.
- The read path is interactive and must return in seconds, even mid-incident
  when everyone is searching at once.
- Because log volume dwarfs metric volume — gigabytes per host per day — the
  whole system is about compression and tiering: index recent logs hot, archive
  cold, and never hold the full raw stream in the hot tier.
- Availability is best-effort by nature: losing the tail of a log is acceptable
  briefly, so use at-least-once semantics, let the queue absorb backpressure,
  and let the archive be the durable record.
- Correctness matters most for the searchable fields, not for byte-level
  fidelity of every raw line.

Scaling and failure handling complete the picture.

- The queue partitions by service and host so no single noisy tenant blocks
  another; the indexer autoscales against queue depth; and the hot tier is sized
  as a rolling window while the archive is the durable record.
- Quotas per service keep cost bounded and fair.
- Because logs are the first place engineers look during an incident,
  availability of the query path matters more than freshness of the last few
  seconds — so the index is replicated and the UI degrades to archive search
  when the hot tier is down.

### Q: How do you ship logs reliably from thousands of hosts?

**A:** Shipping has three requirements: low overhead on the host, no data loss on host
restart, and tolerance for collector outages.

- The `Log Agent` tails local files with checkpointing — it records byte offsets
  per file to a local buffer — so a restart resumes exactly where it stopped
  instead of re-reading or skipping.
- Agents batch lines, compress them (gzip gives roughly 10x on text), and send;
  when collectors are unreachable, they buffer to local disk and replay later.
- The `Collector` accepts, validates, and pushes to the `Log Queue` (`Kafka`)
  partitioned by a hash of `(service, host)`, which preserves per-host ordering
  so a host's logs stay in sequence downstream.

Backpressure handling matters.

- If the queue is full, the agent drops oldest or applies a sampling policy
  rather than unbounded local buffering, and it reports drop counts so the loss
  is visible.
- Because logs from many hosts interleave, the agent attaches source metadata
  (`host`, `service`, `env`) to every batch so queries can filter later without
  guessing.
- The trade-off is sync versus async: synchronous sends guarantee delivery but
  stall the app; fully async risks losing the last few lines on crash.
- The pragmatic answer is async with a bounded local spool, checkpointed
  offsets, and monitoring for drops — you lose at most the tail on a crash, and
  you see that loss in the dashboard rather than finding it during an incident.

Also consider multi-tenant isolation and observability of shipping itself.

- Tag every batch with service and environment at the agent, and enforce
  per-tenant bandwidth quotas at the collector so one noisy host cannot exhaust
  the queue.
- Ship agent metrics (buffered bytes, drop counts, send latency) to the
  monitoring platform so shipping health is visible — a host silently not
  shipping logs is invisible to every downstream system.
- Finally, make the wire protocol versioned and backward compatible, so agent
  upgrades can roll across a fleet without a coordinated cutover.

### Q: How do you index and search structured logs fast?

**A:** Parse logs into structured fields at ingest and index only the searchable
dimensions.

- The timestamp is always indexed, plus fields that queries actually filter on —
  `level`, `service`, `host`, `trace_id` — with the free-text `message`
  tokenized into an inverted index.
- Store the document in a compressed columnar layout so full-text range scans
  stay cheap.
- The `Log Index` shards by time (e.g., daily indices), so a query routes only
  to the shards overlapping its time window and drops everything outside the
  range — this is the single biggest query win, because most investigations are
  "the last hour."

The query path is:

- Parse the UI query into filters (time range, field equals, text match), hit
  the index for matching document IDs, then hydrate previews from the store.
- Dashboards avoid raw scans entirely by reading pre-aggregated counts — hourly
  events per `level` and `service` — computed continuously at ingest.
- Trade-offs: indexing every field is wasteful and slows ingest, so index a
  curated field set and keep `message` as the primary-term index; deep scrolling
  of large result sets is expensive, so cap result sizes and stream pages to the
  UI.
- The design goal is sub-second search over recent logs at high write volume,
  with freshness measured in seconds — new logs appear in search almost
  immediately after they are written.

A few operational details keep search fast and fair.

- Enforce a per-query time-window cap and a result cap so one expensive query
  cannot pin a shard; alias short time ranges to the covering shards so "last 5
  minutes" touches only today's shard.
- Tier the index by freshness — hot shards on fast disks, older shards on
  cheaper storage — since access probability decays sharply with age.
- And because the index is derived data, treat it as rebuildable: if a shard is
  corrupt, rebuild it from the archive rather than repairing in place, which is
  why the raw payload is archived before the parsed record is indexed.

### Q: How do you handle hot shards and uneven log volumes?

**A:** Log volume is inherently skew-y: one noisy service or one incident can emit more
than everything else combined, turning a hot shard into a bottleneck that hurts
its neighbors on the same node.

- Mitigate at the source with routing — partition the queue and index by
  `(service, host)` so heavy producers spread across partitions instead of
  colliding.
- If a single partition is still hot, sub-shard by a secondary key (such as
  host) or shard by time-within-service so writes fan out across more shards.
- The `Indexer` autoscales against queue depth, so a spike adds consumers
  instead of backing up.

On the read side, keep hot shards on faster storage — SSD or local NVMe — while
cold shards tier to object storage automatically based on age and access
frequency.

- Add quotas per service: a `Log Agent` sending at 10x its allowance gets
  sampled or throttled so it cannot starve the index for everyone else.
- The time-based index layout helps operationally, because a slow shard ages out
  naturally; monitor shard size and per-shard query latency, and when a shard is
  oversized, split it rather than moving data — splitting keeps writes
  append-only and bounded.
- The design principle is to treat skew as the norm, not the exception: assume
  one tenant will always be the noisy one, and make the system shed or spread
  its load instead of failing.

Quantify the problem so you can tune it.

- Track per-partition lag, per-shard size, and each service's share of total
  volume; alert when one service exceeds, say, 20% of index capacity, so an
  operator can raise its quota or add shards before it degrades neighbors.
- Combine skew handling with backpressure at the queue — the queue holds, the
  indexer drains in batches, and the archive ingests continuously regardless of
  hot-tier pressure.
- The design principle is to make skew a monitored, tunable input rather than a
  surprise: the platform assumes one tenant is always the noisy one and prices,
  throttles, or spreads accordingly.

### Q: How do you archive old logs cheaply?

**A:** Full-fidelity logs grow forever, so hot storage must be a rolling window and the
archive the long-term home.

- Design a two-tier scheme: the hot `Log Index` keeps recent logs (e.g., 7–30
  days) for fast interactive search, while a `Cold Archive` on object storage
  (S3, GCS) keeps everything in compressed bulk files, never individually
  indexed.
- The `Indexer` writes each batch twice — to the hot index and to immutable
  archive segments partitioned by `(service, date)` in a compressed columnar
  format — so nothing is ever reprocessed for archival.
- Retention policies are per service and enforced by the data plane: delete hot
  shards past their window, and expire archive segments by lifecycle rules on
  the object store, so cost is bounded by policy rather than by accident.

Deep search over the archive is deliberately slow.

- The `Query Service` ships a query to the archive segments covering the
  requested range, scans them in parallel (a `Spark`/`Hadoop`-style job), and
  streams results back — minutes, not milliseconds, which is the acceptable
  price for last quarter's incident.
- The trade-off is explicit: you lose interactive latency on old data and gain
  orders-of-magnitude cost savings, because object storage plus columnar
  compression is tens of times cheaper per byte than a hot index.
- Only recent logs get the fast path; everything older is searchable-but-slow.
- Set expectations in the UI — label archive queries "slow search" — and give
  every archival segment a manifest so queries can skip irrelevant segments by
  metadata before scanning.

## Source

```text
title: Log Aggregation
node host: Host [round, icon=worker]
node agent: Log Agent [icon=worker]
node collector: Collector [icon=server]
node queue: Log Queue [icon=queue]
node indexer: Indexer [icon=compute]
node index: Log Index [icon=search]
node store: Archive Store [cylinder, icon=database]
node query: Query Service [icon=search]
node alert: Alerting [icon=message]
node ui: Log UI [icon=browser]

edge host -> agent: tail
edge agent -> collector: ship
edge collector -> queue: batch
edge queue -> indexer: parse
edge indexer -> index: index
edge indexer -> store: archive
edge ui -> query: search
edge query -> index: lookup
edge query -> store: deep
edge index -> alert: pattern
edge alert -> ui: notify
```
