# Distributed Database

Design a distributed database

**Difficulty:** Medium

**Tags:** database, distributed

## Functional Requirements

- a distributed database
- shard data across nodes?
- replicate for durability?
- keep replicas consistent?
- support distributed transactions?

## Non-Functional Requirements

- The architecture has four layers.

- A query router that accepts requests and routes them.
- A sharded data layer where each shard owns a subset of the keyspace and runs
  its own storage engine.
- A replication layer where each shard has a leader and replicas.
- A consensus layer that orders writes among the replicas.
- The write path goes router to leader, the leader proposes the write to
  consensus, consensus appends it to a replicated write-ahead log, and replicas
  apply it.
- Reads go router to the appropriate shard, served from the leader or a replica
  depending on the consistency requirement, with a query cache absorbing hot
  reads.

The design is a negotiation among three properties that cannot all be maximized:
consistency, availability, and partition tolerance.

- The database picks a model and exposes it per operation — strong consistency
  for money-like data, session or eventual consistency for hot reads — and the
  router enforces the choice.
- The metadata database tracks the cluster topology: which shards exist, which
  nodes lead each shard, and how data is distributed.
- Around the core sit the operational machinery: a rebalancer that moves data
  when nodes join or leave, membership and failure detection, and snapshot and
  log-based backup.
- The hard engineering is coordination, not storage: making writes durable,
  reads correct, and the cluster self-healing when nodes die.
- The same four layers also define the failure modes: a node loss is contained
  to the shards it hosts, a leader loss is a re-election, and a metadata loss is
  a topology problem, each with a different recovery path..
- Sharding splits the keyspace across nodes so each node owns a disjoint slice and
  the cluster scales horizontally.
- The database
  replicates at the log level.

- The leader appends each write to its write-ahead log, and a replication stream
  carries those log entries to replicas, which apply them to their local
  storage.
- Durability is defined by an acknowledgment policy — a write is committed only
  once a quorum of nodes have acknowledged it in the log, so the database can
  report success only when the data is truly safe.
- The replication factor is typically three, with replicas placed across failure
  domains, different racks or availability zones, so a whole-domain failure
  still leaves the data available.

The harder case is recovering a lagging replica.

- A replica that fell behind replays the log from its last position; if the gap
  is large, it falls back to loading a snapshot and then replaying log entries
  after the snapshot.
- The leader tracks each replica's lag and routes reads away from replicas that
  are too far behind to serve the required freshness.
- The replication stream is also the source of the backup system: continuous log
  shipping to object storage gives point-in-time recovery, and snapshotting is
  done from replicas rather than the leader to avoid stalling writes.
- The design goal is to make the durability window as small as possible — the
  committed data lives on multiple independent nodes before the client hears
  success — so that any single-node or even single-rack failure is a performance
  event, not a data-loss event..
- The consensus module — Raft or Paxos — decides a single
  total order for the writes to each shard.

- The leader proposes log entries, a quorum of nodes agree on the next index,
  and only then is an entry committed.
- Because every node that applies the log applies entries in the same order,
  replicas converge on identical state.
- This makes strong consistency achievable: a read routed to the leader sees
  every committed write, and a quorum read from replicas is guaranteed to
  reflect at least one node that has the latest committed entry.
- The cost is latency — the write must round-trip to a quorum — and availability
  during leader loss, since a new leader must be elected before writes resume.

Not every workload needs that cost, so the database exposes consistency levels
per operation.

- Linearizable or strong reads go to the leader or quorum; session consistency
  pins a client to a replica that has seen its own writes; and eventual
  consistency lets reads go to the fastest replica, accepting bounded staleness.
- The risk is the read-your-writes and monotonic-read anomalies, which the
  session layer prevents by tracking which replicas the client has already
  observed.
- Behind consistency sits correctness under failure: a stale leader that still
  thinks it is authoritative must be fenced, and its log truncated to the
  committed point before it accepts new writes.
- The consistent core — consensus, a durable log, quorum acknowledgment — is
  deliberately small, because the correctness of everything else, including the
  distributed transactions, is built on it..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Distributed Database
app: Application
gateway: API Gateway
proxy: Query Router
leader: Leader Node
replica: Replica Nodes
shard: Shards
consensus: Consensus
log: Write-ahead Log
cache: Query Cache
balance: Rebalancer
db: Metadata DB

app ─► gateway ─► request
gateway ─► proxy ─► route
proxy ─► leader ─► write
leader ─► consensus ─► agree
consensus ─► log ─► append
log ─► replica ─► replicate
proxy ─► shard ─► read
shard ─► cache ─► hit
leader ─► balance ─► rebalance
balance ─► shard ─► move
proxy ─► db ─► meta
```

## Design

### Design a distributed database

A distributed database presents the interface of a single database while
physically spreading data across many nodes. The architecture has four layers.

- A query router that accepts requests and routes them.
- A sharded data layer where each shard owns a subset of the keyspace and runs
  its own storage engine.
- A replication layer where each shard has a leader and replicas.
- A consensus layer that orders writes among the replicas.
- The write path goes router to leader, the leader proposes the write to
  consensus, consensus appends it to a replicated write-ahead log, and replicas
  apply it.
- Reads go router to the appropriate shard, served from the leader or a replica
  depending on the consistency requirement, with a query cache absorbing hot
  reads.

The design is a negotiation among three properties that cannot all be maximized:
consistency, availability, and partition tolerance.

- The database picks a model and exposes it per operation — strong consistency
  for money-like data, session or eventual consistency for hot reads — and the
  router enforces the choice.
- The metadata database tracks the cluster topology: which shards exist, which
  nodes lead each shard, and how data is distributed.
- Around the core sit the operational machinery: a rebalancer that moves data
  when nodes join or leave, membership and failure detection, and snapshot and
  log-based backup.
- The hard engineering is coordination, not storage: making writes durable,
  reads correct, and the cluster self-healing when nodes die.
- The same four layers also define the failure modes: a node loss is contained
  to the shards it hosts, a leader loss is a re-election, and a metadata loss is
  a topology problem, each with a different recovery path.

### How do you shard data across nodes?

Sharding splits the keyspace across nodes so each node owns a disjoint slice and
the cluster scales horizontally. The first decision is the shard key.

- A good key spreads writes evenly, keeps related data co-located for common
  queries, and is immutable.
- Hash sharding, where the key is hashed into a range of buckets, gives
  excellent distribution and is the default for workloads without natural
  locality.
- Range sharding, where contiguous key ranges map to shards, makes range scans
  and prefix queries local but risks hot spots on skewed keys.
- Composite strategies, like hashing the tenant and ranging within the tenant,
  trade generality for locality.

The second decision is how shards are addressed.

- Direct mapping keeps a fixed table of key ranges to shards, while consistent
  hashing maps keys to a ring where each node owns an interval, so adding a node
  moves only the keys in its neighbors' intervals rather than resharding
  everything.
- The router consults the metadata database to route each request and caches the
  mapping locally.
- Shard sizing is bounded: when a shard grows past its target, the rebalancer
  splits it into two, and it merges when small.
- The real danger is a hot key — one celebrity row or one account absorbing
  traffic — so the system supports splitting hot keys into virtual shards and,
  for skewed workloads, allows range keys to be hashed at a finer grain.
- Sharding buys parallelism but adds coordination: cross-shard queries must fan
  out and merge, and the router must stay correct through rebalancing.

### How do you replicate for durability?

Replication writes every committed update to multiple nodes so that a single
node's disk, process, or rack failure does not lose data. The database
replicates at the log level.

- The leader appends each write to its write-ahead log, and a replication stream
  carries those log entries to replicas, which apply them to their local
  storage.
- Durability is defined by an acknowledgment policy — a write is committed only
  once a quorum of nodes have acknowledged it in the log, so the database can
  report success only when the data is truly safe.
- The replication factor is typically three, with replicas placed across failure
  domains, different racks or availability zones, so a whole-domain failure
  still leaves the data available.

The harder case is recovering a lagging replica.

- A replica that fell behind replays the log from its last position; if the gap
  is large, it falls back to loading a snapshot and then replaying log entries
  after the snapshot.
- The leader tracks each replica's lag and routes reads away from replicas that
  are too far behind to serve the required freshness.
- The replication stream is also the source of the backup system: continuous log
  shipping to object storage gives point-in-time recovery, and snapshotting is
  done from replicas rather than the leader to avoid stalling writes.
- The design goal is to make the durability window as small as possible — the
  committed data lives on multiple independent nodes before the client hears
  success — so that any single-node or even single-rack failure is a performance
  event, not a data-loss event.

### How do you keep replicas consistent?

Replicas diverge unless the database imposes an order, and ordering is what
consensus provides. The consensus module — Raft or Paxos — decides a single
total order for the writes to each shard.

- The leader proposes log entries, a quorum of nodes agree on the next index,
  and only then is an entry committed.
- Because every node that applies the log applies entries in the same order,
  replicas converge on identical state.
- This makes strong consistency achievable: a read routed to the leader sees
  every committed write, and a quorum read from replicas is guaranteed to
  reflect at least one node that has the latest committed entry.
- The cost is latency — the write must round-trip to a quorum — and availability
  during leader loss, since a new leader must be elected before writes resume.

Not every workload needs that cost, so the database exposes consistency levels
per operation.

- Linearizable or strong reads go to the leader or quorum; session consistency
  pins a client to a replica that has seen its own writes; and eventual
  consistency lets reads go to the fastest replica, accepting bounded staleness.
- The risk is the read-your-writes and monotonic-read anomalies, which the
  session layer prevents by tracking which replicas the client has already
  observed.
- Behind consistency sits correctness under failure: a stale leader that still
  thinks it is authoritative must be fenced, and its log truncated to the
  committed point before it accepts new writes.
- The consistent core — consensus, a durable log, quorum acknowledgment — is
  deliberately small, because the correctness of everything else, including the
  distributed transactions, is built on it.

### How do you support distributed transactions?

A distributed transaction spans multiple shards, and making it atomic is where
the database earns its keep. The standard protocol is two-phase commit.

- A coordinator asks every participating shard to prepare by writing its part to
  the log and holding locks, and only when all shards are prepared does the
  coordinator tell them to commit.
- This guarantees atomicity — either all shards commit or all abort — but the
  coordinator becomes a liveness risk if it fails mid-protocol, so in practice
  the coordination is replicated or the system uses a transaction log that can
  recover in-flight transactions.
- Each shard's part is still a normal consensus-replicated write, so the
  transaction is atomic across the shards and durable within each one.

The harder design decisions are around isolation and performance.

- Distributed locking across shards is expensive, so the database either uses
  distributed locks on the rows involved, optimistic concurrency control that
  aborts on conflict, or a single-coordinator approach that routes all reads and
  writes of a transaction through one node that serializes them.
- The read-your-writes guarantee inside a transaction must hold across shards,
  so the coordinator tracks versions.
- Most production databases do not route every multi-key update through full
  two-phase commit; instead they detect which operations actually cross shard
  boundaries, run single-shard transactions locally, and reserve the coordinator
  protocol for the rare true cross-shard case.
- The failure cases — a prepared but never committed transaction, a shard that
  lost its prepare record — are handled by a transaction recovery process that
  scans for in-doubt transactions and resolves them once the cluster heals.

## Source

```text
title: Distributed Database
node app: Application [icon=browser]
node gateway: API Gateway [icon=server]
node proxy: Query Router [icon=compute]
node leader: Leader Node [icon=server]
node replica: Replica Nodes [icon=server]
node shard: Shards [icon=compute]
node consensus: Consensus [icon=shield]
node log: Write-ahead Log [cylinder, icon=file]
node cache: Query Cache [icon=cache]
node balance: Rebalancer [icon=worker]
node db: Metadata DB [cylinder, icon=database]

edge app -> gateway: request
edge gateway -> proxy: route
edge proxy -> leader: write
edge leader -> consensus: agree
edge consensus -> log: append
edge log -> replica: replicate
edge proxy -> shard: read
edge shard -> cache: hit
edge leader -> balance: rebalance
edge balance -> shard: move
edge proxy -> db: meta
```

## Q&A

### Q: Design a distributed database

**A:** A distributed database presents the interface of a single database while
physically spreading data across many nodes. The architecture has four layers.

- A query router that accepts requests and routes them.
- A sharded data layer where each shard owns a subset of the keyspace and runs
  its own storage engine.
- A replication layer where each shard has a leader and replicas.
- A consensus layer that orders writes among the replicas.
- The write path goes router to leader, the leader proposes the write to
  consensus, consensus appends it to a replicated write-ahead log, and replicas
  apply it.
- Reads go router to the appropriate shard, served from the leader or a replica
  depending on the consistency requirement, with a query cache absorbing hot
  reads.

The design is a negotiation among three properties that cannot all be maximized:
consistency, availability, and partition tolerance.

- The database picks a model and exposes it per operation — strong consistency
  for money-like data, session or eventual consistency for hot reads — and the
  router enforces the choice.
- The metadata database tracks the cluster topology: which shards exist, which
  nodes lead each shard, and how data is distributed.
- Around the core sit the operational machinery: a rebalancer that moves data
  when nodes join or leave, membership and failure detection, and snapshot and
  log-based backup.
- The hard engineering is coordination, not storage: making writes durable,
  reads correct, and the cluster self-healing when nodes die.
- The same four layers also define the failure modes: a node loss is contained
  to the shards it hosts, a leader loss is a re-election, and a metadata loss is
  a topology problem, each with a different recovery path.

### Q: How do you shard data across nodes?

**A:** Sharding splits the keyspace across nodes so each node owns a disjoint slice and
the cluster scales horizontally. The first decision is the shard key.

- A good key spreads writes evenly, keeps related data co-located for common
  queries, and is immutable.
- Hash sharding, where the key is hashed into a range of buckets, gives
  excellent distribution and is the default for workloads without natural
  locality.
- Range sharding, where contiguous key ranges map to shards, makes range scans
  and prefix queries local but risks hot spots on skewed keys.
- Composite strategies, like hashing the tenant and ranging within the tenant,
  trade generality for locality.

The second decision is how shards are addressed.

- Direct mapping keeps a fixed table of key ranges to shards, while consistent
  hashing maps keys to a ring where each node owns an interval, so adding a node
  moves only the keys in its neighbors' intervals rather than resharding
  everything.
- The router consults the metadata database to route each request and caches the
  mapping locally.
- Shard sizing is bounded: when a shard grows past its target, the rebalancer
  splits it into two, and it merges when small.
- The real danger is a hot key — one celebrity row or one account absorbing
  traffic — so the system supports splitting hot keys into virtual shards and,
  for skewed workloads, allows range keys to be hashed at a finer grain.
- Sharding buys parallelism but adds coordination: cross-shard queries must fan
  out and merge, and the router must stay correct through rebalancing.

### Q: How do you replicate for durability?

**A:** Replication writes every committed update to multiple nodes so that a single
node's disk, process, or rack failure does not lose data. The database
replicates at the log level.

- The leader appends each write to its write-ahead log, and a replication stream
  carries those log entries to replicas, which apply them to their local
  storage.
- Durability is defined by an acknowledgment policy — a write is committed only
  once a quorum of nodes have acknowledged it in the log, so the database can
  report success only when the data is truly safe.
- The replication factor is typically three, with replicas placed across failure
  domains, different racks or availability zones, so a whole-domain failure
  still leaves the data available.

The harder case is recovering a lagging replica.

- A replica that fell behind replays the log from its last position; if the gap
  is large, it falls back to loading a snapshot and then replaying log entries
  after the snapshot.
- The leader tracks each replica's lag and routes reads away from replicas that
  are too far behind to serve the required freshness.
- The replication stream is also the source of the backup system: continuous log
  shipping to object storage gives point-in-time recovery, and snapshotting is
  done from replicas rather than the leader to avoid stalling writes.
- The design goal is to make the durability window as small as possible — the
  committed data lives on multiple independent nodes before the client hears
  success — so that any single-node or even single-rack failure is a performance
  event, not a data-loss event.

### Q: How do you keep replicas consistent?

**A:** Replicas diverge unless the database imposes an order, and ordering is what
consensus provides. The consensus module — Raft or Paxos — decides a single
total order for the writes to each shard.

- The leader proposes log entries, a quorum of nodes agree on the next index,
  and only then is an entry committed.
- Because every node that applies the log applies entries in the same order,
  replicas converge on identical state.
- This makes strong consistency achievable: a read routed to the leader sees
  every committed write, and a quorum read from replicas is guaranteed to
  reflect at least one node that has the latest committed entry.
- The cost is latency — the write must round-trip to a quorum — and availability
  during leader loss, since a new leader must be elected before writes resume.

Not every workload needs that cost, so the database exposes consistency levels
per operation.

- Linearizable or strong reads go to the leader or quorum; session consistency
  pins a client to a replica that has seen its own writes; and eventual
  consistency lets reads go to the fastest replica, accepting bounded staleness.
- The risk is the read-your-writes and monotonic-read anomalies, which the
  session layer prevents by tracking which replicas the client has already
  observed.
- Behind consistency sits correctness under failure: a stale leader that still
  thinks it is authoritative must be fenced, and its log truncated to the
  committed point before it accepts new writes.
- The consistent core — consensus, a durable log, quorum acknowledgment — is
  deliberately small, because the correctness of everything else, including the
  distributed transactions, is built on it.

### Q: How do you support distributed transactions?

**A:** A distributed transaction spans multiple shards, and making it atomic is where
the database earns its keep. The standard protocol is two-phase commit.

- A coordinator asks every participating shard to prepare by writing its part to
  the log and holding locks, and only when all shards are prepared does the
  coordinator tell them to commit.
- This guarantees atomicity — either all shards commit or all abort — but the
  coordinator becomes a liveness risk if it fails mid-protocol, so in practice
  the coordination is replicated or the system uses a transaction log that can
  recover in-flight transactions.
- Each shard's part is still a normal consensus-replicated write, so the
  transaction is atomic across the shards and durable within each one.

The harder design decisions are around isolation and performance.

- Distributed locking across shards is expensive, so the database either uses
  distributed locks on the rows involved, optimistic concurrency control that
  aborts on conflict, or a single-coordinator approach that routes all reads and
  writes of a transaction through one node that serializes them.
- The read-your-writes guarantee inside a transaction must hold across shards,
  so the coordinator tracks versions.
- Most production databases do not route every multi-key update through full
  two-phase commit; instead they detect which operations actually cross shard
  boundaries, run single-shard transactions locally, and reserve the coordinator
  protocol for the rare true cross-shard case.
- The failure cases — a prepared but never committed transaction, a shard that
  lost its prepare record — are handled by a transaction recovery process that
  scans for in-doubt transactions and resolves them once the cluster heals.

## Source

```text
title: Distributed Database
node app: Application [icon=browser]
node gateway: API Gateway [icon=server]
node proxy: Query Router [icon=compute]
node leader: Leader Node [icon=server]
node replica: Replica Nodes [icon=server]
node shard: Shards [icon=compute]
node consensus: Consensus [icon=shield]
node log: Write-ahead Log [cylinder, icon=file]
node cache: Query Cache [icon=cache]
node balance: Rebalancer [icon=worker]
node db: Metadata DB [cylinder, icon=database]

edge app -> gateway: request
edge gateway -> proxy: route
edge proxy -> leader: write
edge leader -> consensus: agree
edge consensus -> log: append
edge log -> replica: replicate
edge proxy -> shard: read
edge shard -> cache: hit
edge leader -> balance: rebalance
edge balance -> shard: move
edge proxy -> db: meta
```
