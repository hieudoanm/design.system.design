# Data Warehouse

Design a cloud data warehouse

**Difficulty:** Medium

**Tags:** analytics, database, storage

## Functional Requirements

- a cloud data warehouse
- store data for fast analytics?
- run massive parallel queries?
- ingest data from many sources?
- optimize query performance?

## Non-Functional Requirements

- A cloud data warehouse is a system built to answer analytical SQL at petabyte
  scale over data collected from many operational sources.

- The architecture splits storage from compute: a columnar store holds
  compressed data on object storage, while separate MPP compute clusters execute
  queries on demand, so you can scale query capacity independently of storage
  cost and even spin compute down when no one is querying.
- Data lands through an ingestion pipeline into a staging area, an ETL engine
  transforms and validates it, and a loader writes clean tables into the
  columnar store.
- A query engine accepts SQL, parses and optimizes a plan, and hands execution
  to MPP workers that scan only the relevant columns and partitions.

The system serves three populations that need different treatment.

- Analysts run ad hoc SQL through an analytics UI, engineers load data, and
  dashboards fire the same queries repeatedly.
- A metadata database tracks schemas, table statistics, partitions, and lineage,
  and a result cache short-circuits repeated queries.
- Because storage and compute are decoupled, the hardest engineering problems
  are not about raw disk but about coordination: consistent metadata,
  transactional visibility of loaded data, concurrency control between readers
  and writers, and query scheduling across a fleet of workers.
- The design goal is to make the common path — scan a narrow slice of a huge
  table and aggregate it — fast, while making failure recovery cheap by
  recomputing rather than recovering complex state.
- Elastic scaling also shapes pricing and experience: idle clusters scale to
  zero, and a burst of query traffic scales compute out in seconds, making the
  warehouse cost proportional to actual analysis rather than provisioned
  capacity..
- Fault tolerance is
  handled at the fragment level — failed tasks are retried on other nodes, so a
  slow or dead worker does not fail the query.
- Monitoring closes the loop: per-source
  lag, per-pipeline throughput, and per-table quality checks are surfaced to
  operators, so a failing feed is repaired before anyone trusts the numbers it
  feeds.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Data Warehouse
user: Analyst
source: Data Sources
app: Analytics UI
gateway: API Gateway
ingest: Ingestion Pipeline
stage: Staging Area
etl: ETL Engine
store: Columnar Store
query: Query Engine
mpp: MPP Compute
cache: Result Cache
db: Metadata DB

source ─► app ─► send
app ─► gateway ─► ingest
gateway ─► ingest ─► load
ingest ─► stage ─► raw
stage ─► etl ─► transform
etl ─► store ─► load
user ─► app ─► query
app ─► gateway ─► sql
gateway ─► query ─► plan
query ─► mpp ─► execute
query ─► cache ─► reuse
query ─► store ─► scan
```

## Design

### Design a cloud data warehouse

A cloud data warehouse is a system built to answer analytical SQL at petabyte
scale over data collected from many operational sources.

- The architecture splits storage from compute: a columnar store holds
  compressed data on object storage, while separate MPP compute clusters execute
  queries on demand, so you can scale query capacity independently of storage
  cost and even spin compute down when no one is querying.
- Data lands through an ingestion pipeline into a staging area, an ETL engine
  transforms and validates it, and a loader writes clean tables into the
  columnar store.
- A query engine accepts SQL, parses and optimizes a plan, and hands execution
  to MPP workers that scan only the relevant columns and partitions.

The system serves three populations that need different treatment.

- Analysts run ad hoc SQL through an analytics UI, engineers load data, and
  dashboards fire the same queries repeatedly.
- A metadata database tracks schemas, table statistics, partitions, and lineage,
  and a result cache short-circuits repeated queries.
- Because storage and compute are decoupled, the hardest engineering problems
  are not about raw disk but about coordination: consistent metadata,
  transactional visibility of loaded data, concurrency control between readers
  and writers, and query scheduling across a fleet of workers.
- The design goal is to make the common path — scan a narrow slice of a huge
  table and aggregate it — fast, while making failure recovery cheap by
  recomputing rather than recovering complex state.
- Elastic scaling also shapes pricing and experience: idle clusters scale to
  zero, and a burst of query traffic scales compute out in seconds, making the
  warehouse cost proportional to actual analysis rather than provisioned
  capacity.

### How do you store data for fast analytics?

Analytics workloads scan huge row counts but touch a few columns, so the store
is columnar: each column is stored contiguously, and a query reads only the
columns it needs, reducing I/O by an order of magnitude. Values are compressed
heavily — dictionary encoding, run-length encoding, and delta encoding for
sorted columns — and modern systems operate on compressed vectors directly,
which multiplies the effective bandwidth of both disk and CPU. Data is
partitioned by time and bucketed by a high-cardinality key, so pruning skips
whole files based on partition predicates and zone maps that record the minimum
and maximum per column per block.

The file format matters as much as the logical layout. Tables are written as
immutable, sorted files with a columnar layout and embedded statistics, and
metadata allows the query engine to skip blocks whose ranges cannot match the
filter. This design trades write flexibility for read performance: updates are
rare in analytics, so the store appends new files and uses delete markers or
full partition rewrites for changes, keeping reads sequential and
cache-friendly. The data is layered — a raw or bronze layer, a transformed or
silver layer, and a curated or gold layer — so the same physical files serve
increasingly refined views, and catalog statistics keep the optimizer informed
about what each file contains. Storage tiering completes the picture: hot tables
stay on fast object storage while cold partitions migrate to cheaper tiers or
archival formats, so retention does not have to mean a performance tax.

### How do you run massive parallel queries?

Massive parallel processing turns one SQL statement into thousands of parallel
tasks. The query engine parses and optimizes SQL into a logical plan, then a
scheduler splits it into physical fragments — scans, filters, shuffles, joins,
aggregations — and distributes them across worker nodes. Each worker owns a
slice of the data through partitioning, so scans are local: a worker reads the
files assigned to its partition and never touches another's. Shuffle-based
operations redistribute rows when a join or group-by needs a different key, and
the engine picks broadcast joins for small tables to avoid shuffles entirely. A
coordinator gathers partial results and merges them into the final answer.

Elasticity is what makes this work in the cloud. Compute clusters are sized from
the query's cost estimate, and mid-query elasticity lets a cluster grow during a
long-running analysis. Query scheduling is cost-aware: the engine estimates
bytes scanned, and a query over a huge unpruned table is either re-planned to
exploit partitions or throttled by the resource governor. Fault tolerance is
handled at the fragment level — failed tasks are retried on other nodes, so a
slow or dead worker does not fail the query. Concurrency is managed by queues
and memory pools, so many small queries and a few large ones share the fleet
fairly, and the result cache absorbs the repeated dashboard traffic that would
otherwise dominate the cluster. Query results are cached at the result cache
and, for fast-moving dashboards, precomputed via materialized views refreshed on
a schedule, so the interactive path avoids re-scanning by construction.

### How do you ingest data from many sources?

Data arrives from heterogeneous sources — OLTP databases, application logs,
mobile events, third-party feeds, files in object storage — each with different
schemas, cadence, and reliability. The ingestion pipeline normalizes the
plumbing: connectors handle transport for each source type, the pipeline assigns
a schema version and raw payload to the staging area, and a metadata catalog
records what was ingested and when, so the raw layer is immutable and
replayable. From staging, the ETL engine transforms: cleaning, type coercion,
joins against dimension data, deduplication, and aggregation into fact tables,
then loading into the columnar store in efficient batches.

Two properties dominate the design: exactly-once semantics and backpressure.
Ingest jobs checkpoint their position in each source — binlog offsets for
databases, partition offsets for streams — so a retried job does not
double-count, and load transactions make a batch visible atomically. Source lag
is managed end to end: streaming sources feed near-real-time micro-batches while
large bulk loads run on schedules, and the system tracks lag per source so a
slow partner feed is visible rather than silent. Schema evolution is handled
explicitly — the pipeline carries schema versions and validates changes before
they propagate, because in analytics, a wrong-column table silently corrupts
every downstream report that reads it. Monitoring closes the loop: per-source
lag, per-pipeline throughput, and per-table quality checks are surfaced to
operators, so a failing feed is repaired before anyone trusts the numbers it
feeds. Alerting on quality checks completes the pipeline's contract.

### How do you optimize query performance?

Optimization starts before the query runs: a cost-based optimizer rewrites SQL
to more efficient forms — pushing filters and projections down, eliminating
redundant joins, and rewriting subqueries — then chooses join strategies and
scan order from table statistics stored in the metadata database. Columnar
pruning, partition elimination, and zone maps shrink the physical data scanned,
and the query engine reads compressed vectors directly so CPU and bandwidth are
used at the theoretical limit. Small or repeated results come from the result
cache, and hot tables get materialized views or precomputed aggregations
maintained incrementally as data loads.

The system also optimizes around the workload. Clustering and sort order are
tuned to the dominant query patterns so zone maps are effective, and file sizes
are compacted to the sweet spot between scan parallelism and scheduling
overhead. Resource management separates concerns: per-query memory pools, query
queues with priorities, and a resource governor that throttles runaway scans
keep one analyst's query from starving the dashboard. Statistics freshness is
managed continuously — stale statistics cause bad plans, so the catalog updates
statistics and histograms after loads. Finally, profiling closes the loop: the
query engine records per-operator metrics, and an explain and profile view tells
the analyst whether the bottleneck was scan, shuffle, or aggregation, turning
optimization into an iterative, evidence-driven process. Benchmarking and cost
telemetry are surfaced per query, so engineers can see which reports cost the
most and target optimization where it pays off. Over time this turns the
warehouse into a system that tunes itself.

## Source

```text
title: Data Warehouse
node user: Analyst [round, icon=browser]
node source: Data Sources [icon=cloud]
node app: Analytics UI [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Pipeline [icon=worker]
node stage: Staging Area [cylinder, icon=file]
node etl: ETL Engine [icon=compute]
node store: Columnar Store [cylinder, icon=database]
node query: Query Engine [icon=compute]
node mpp: MPP Compute [icon=cloud]
node cache: Result Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge source -> app: send
edge app -> gateway: ingest
edge gateway -> ingest: load
edge ingest -> stage: raw
edge stage -> etl: transform
edge etl -> store: load
edge user -> app: query
edge app -> gateway: sql
edge gateway -> query: plan
edge query -> mpp: execute
edge query -> cache: reuse
edge query -> store: scan
```

## Q&A

### Q: Design a cloud data warehouse

**A:** A cloud data warehouse is a system built to answer analytical SQL at petabyte
scale over data collected from many operational sources.

- The architecture splits storage from compute: a columnar store holds
  compressed data on object storage, while separate MPP compute clusters execute
  queries on demand, so you can scale query capacity independently of storage
  cost and even spin compute down when no one is querying.
- Data lands through an ingestion pipeline into a staging area, an ETL engine
  transforms and validates it, and a loader writes clean tables into the
  columnar store.
- A query engine accepts SQL, parses and optimizes a plan, and hands execution
  to MPP workers that scan only the relevant columns and partitions.

The system serves three populations that need different treatment.

- Analysts run ad hoc SQL through an analytics UI, engineers load data, and
  dashboards fire the same queries repeatedly.
- A metadata database tracks schemas, table statistics, partitions, and lineage,
  and a result cache short-circuits repeated queries.
- Because storage and compute are decoupled, the hardest engineering problems
  are not about raw disk but about coordination: consistent metadata,
  transactional visibility of loaded data, concurrency control between readers
  and writers, and query scheduling across a fleet of workers.
- The design goal is to make the common path — scan a narrow slice of a huge
  table and aggregate it — fast, while making failure recovery cheap by
  recomputing rather than recovering complex state.
- Elastic scaling also shapes pricing and experience: idle clusters scale to
  zero, and a burst of query traffic scales compute out in seconds, making the
  warehouse cost proportional to actual analysis rather than provisioned
  capacity.

### Q: How do you store data for fast analytics?

**A:** Analytics workloads scan huge row counts but touch a few columns, so the store
is columnar: each column is stored contiguously, and a query reads only the
columns it needs, reducing I/O by an order of magnitude. Values are compressed
heavily — dictionary encoding, run-length encoding, and delta encoding for
sorted columns — and modern systems operate on compressed vectors directly,
which multiplies the effective bandwidth of both disk and CPU. Data is
partitioned by time and bucketed by a high-cardinality key, so pruning skips
whole files based on partition predicates and zone maps that record the minimum
and maximum per column per block.

The file format matters as much as the logical layout. Tables are written as
immutable, sorted files with a columnar layout and embedded statistics, and
metadata allows the query engine to skip blocks whose ranges cannot match the
filter. This design trades write flexibility for read performance: updates are
rare in analytics, so the store appends new files and uses delete markers or
full partition rewrites for changes, keeping reads sequential and
cache-friendly. The data is layered — a raw or bronze layer, a transformed or
silver layer, and a curated or gold layer — so the same physical files serve
increasingly refined views, and catalog statistics keep the optimizer informed
about what each file contains. Storage tiering completes the picture: hot tables
stay on fast object storage while cold partitions migrate to cheaper tiers or
archival formats, so retention does not have to mean a performance tax.

### Q: How do you run massive parallel queries?

**A:** Massive parallel processing turns one SQL statement into thousands of parallel
tasks. The query engine parses and optimizes SQL into a logical plan, then a
scheduler splits it into physical fragments — scans, filters, shuffles, joins,
aggregations — and distributes them across worker nodes. Each worker owns a
slice of the data through partitioning, so scans are local: a worker reads the
files assigned to its partition and never touches another's. Shuffle-based
operations redistribute rows when a join or group-by needs a different key, and
the engine picks broadcast joins for small tables to avoid shuffles entirely. A
coordinator gathers partial results and merges them into the final answer.

Elasticity is what makes this work in the cloud. Compute clusters are sized from
the query's cost estimate, and mid-query elasticity lets a cluster grow during a
long-running analysis. Query scheduling is cost-aware: the engine estimates
bytes scanned, and a query over a huge unpruned table is either re-planned to
exploit partitions or throttled by the resource governor. Fault tolerance is
handled at the fragment level — failed tasks are retried on other nodes, so a
slow or dead worker does not fail the query. Concurrency is managed by queues
and memory pools, so many small queries and a few large ones share the fleet
fairly, and the result cache absorbs the repeated dashboard traffic that would
otherwise dominate the cluster. Query results are cached at the result cache
and, for fast-moving dashboards, precomputed via materialized views refreshed on
a schedule, so the interactive path avoids re-scanning by construction.

### Q: How do you ingest data from many sources?

**A:** Data arrives from heterogeneous sources — OLTP databases, application logs,
mobile events, third-party feeds, files in object storage — each with different
schemas, cadence, and reliability. The ingestion pipeline normalizes the
plumbing: connectors handle transport for each source type, the pipeline assigns
a schema version and raw payload to the staging area, and a metadata catalog
records what was ingested and when, so the raw layer is immutable and
replayable. From staging, the ETL engine transforms: cleaning, type coercion,
joins against dimension data, deduplication, and aggregation into fact tables,
then loading into the columnar store in efficient batches.

Two properties dominate the design: exactly-once semantics and backpressure.
Ingest jobs checkpoint their position in each source — binlog offsets for
databases, partition offsets for streams — so a retried job does not
double-count, and load transactions make a batch visible atomically. Source lag
is managed end to end: streaming sources feed near-real-time micro-batches while
large bulk loads run on schedules, and the system tracks lag per source so a
slow partner feed is visible rather than silent. Schema evolution is handled
explicitly — the pipeline carries schema versions and validates changes before
they propagate, because in analytics, a wrong-column table silently corrupts
every downstream report that reads it. Monitoring closes the loop: per-source
lag, per-pipeline throughput, and per-table quality checks are surfaced to
operators, so a failing feed is repaired before anyone trusts the numbers it
feeds. Alerting on quality checks completes the pipeline's contract.

### Q: How do you optimize query performance?

**A:** Optimization starts before the query runs: a cost-based optimizer rewrites SQL
to more efficient forms — pushing filters and projections down, eliminating
redundant joins, and rewriting subqueries — then chooses join strategies and
scan order from table statistics stored in the metadata database. Columnar
pruning, partition elimination, and zone maps shrink the physical data scanned,
and the query engine reads compressed vectors directly so CPU and bandwidth are
used at the theoretical limit. Small or repeated results come from the result
cache, and hot tables get materialized views or precomputed aggregations
maintained incrementally as data loads.

The system also optimizes around the workload. Clustering and sort order are
tuned to the dominant query patterns so zone maps are effective, and file sizes
are compacted to the sweet spot between scan parallelism and scheduling
overhead. Resource management separates concerns: per-query memory pools, query
queues with priorities, and a resource governor that throttles runaway scans
keep one analyst's query from starving the dashboard. Statistics freshness is
managed continuously — stale statistics cause bad plans, so the catalog updates
statistics and histograms after loads. Finally, profiling closes the loop: the
query engine records per-operator metrics, and an explain and profile view tells
the analyst whether the bottleneck was scan, shuffle, or aggregation, turning
optimization into an iterative, evidence-driven process. Benchmarking and cost
telemetry are surfaced per query, so engineers can see which reports cost the
most and target optimization where it pays off. Over time this turns the
warehouse into a system that tunes itself.

## Source

```text
title: Data Warehouse
node user: Analyst [round, icon=browser]
node source: Data Sources [icon=cloud]
node app: Analytics UI [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Pipeline [icon=worker]
node stage: Staging Area [cylinder, icon=file]
node etl: ETL Engine [icon=compute]
node store: Columnar Store [cylinder, icon=database]
node query: Query Engine [icon=compute]
node mpp: MPP Compute [icon=cloud]
node cache: Result Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge source -> app: send
edge app -> gateway: ingest
edge gateway -> ingest: load
edge ingest -> stage: raw
edge stage -> etl: transform
edge etl -> store: load
edge user -> app: query
edge app -> gateway: sql
edge gateway -> query: plan
edge query -> mpp: execute
edge query -> cache: reuse
edge query -> store: scan
```
