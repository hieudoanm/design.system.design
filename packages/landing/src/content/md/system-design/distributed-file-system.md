# Distributed File System

Design a distributed file system

**Difficulty:** Medium

**Tags:** database, distributed, storage

## Functional Requirements

- a distributed file system
- split files into chunks?
- replicate chunks for durability?
- locate chunks quickly?
- recover from node failures?

## Non-Functional Requirements

- The architecture splits metadata from data.

- A NameNode manages the namespace — the directory tree, file names,
  permissions, and for each file the map from logical ranges to physical chunks
  — while a fleet of chunk servers holds the actual data.
- A file is broken into fixed-size chunks, each chunk stored on several chunk
  servers for redundancy, and each chunk server reports its health and inventory
  to the NameNode.
- The gateway handles uploads and reads: the chunk splitter divides incoming
  files, and the location service translates a read request into the list of
  chunk servers that hold the needed ranges.

The two planes have completely different scale profiles.

- Metadata is small — bytes per file — so the NameNode can hold the whole
  namespace in memory and answer every lookup in microseconds; data is huge, so
  chunk servers are sized by storage and bandwidth and are expected to fail
  constantly.
- This asymmetry is the point of the design: the metadata plane stays fast and
  consistent while the data plane scales out and self-heals.
- The file system also needs durable guarantees around atomic renames, open
  semantics, and snapshot or append operations, and it must tolerate concurrent
  readers and writers.
- The hard problems are chunk location, replication, and recovery — the NameNode
  must always know where every chunk lives and must always be able to rebuild a
  chunk that was lost.
- Availability and durability guarantees are published per file class..
- Files are split into fixed-size chunks, typically 64 MB or 128 MB, chosen to
  balance overhead against parallelism.

- A large chunk means few metadata entries — the NameNode tracks one mapping per
  chunk rather than per kilobyte — and it amortizes the per-chunk bookkeeping,
  but it reduces parallelism for small files and inflates the cost of a partial
  read.
- The splitter handles files of any size: a small file becomes one chunk, while
  a multi-terabyte file becomes tens of thousands.
- Each chunk gets a globally unique ID, and the NameNode records, per file, the
  ordered list of chunk IDs plus each chunk's version.
- Because chunks are immutable once written and replaced by new versions on
  rewrite, the mapping stays simple and the read path never needs locks on data.

Splitting also needs to deal with appends and partial writes.

- An append is handled as a new chunk or an extended chunk with a version bump,
  and the NameNode's mapping is updated transactionally so a reader either sees
  the old length or the new one, never a torn state.
- The chunk boundary interacts with read efficiency: clients read chunk-aligned
  ranges so the location service can return exactly the servers for the ranges
  requested, and the file system supports a sequential read pattern where the
  client requests the next chunk before finishing the current one, hiding
  network latency.
- Chunk size is also a replication and recovery unit — the smaller the chunk,
  the faster a lost chunk can be re-replicated from its peers, so the choice of
  size directly bounds the recovery time budget..
- The replication policy is chosen
  when the chunk is created.

- The system picks servers on different racks or failure domains, keeps the load
  balanced across servers, and prefers to place the replicas near clients that
  write or read the chunk most.
- When a client writes a chunk, one server is chosen as the pipeline leader; it
  receives the data and forwards it to the next replica in a chain, so the
  bandwidth cost of replicating three copies is roughly one copy, not three, and
  the client receives a single acknowledgment when all copies are durable.

The replication system is proactive, not reactive.

- The NameNode continuously reconciles its view of the world: each chunk server
  reports its chunk inventory on heartbeat, and the NameNode compares it against
  the desired state.
- A chunk that is under-replicated — because a server died or a new replica was
  requested — is added to a replication queue and rebuilt from an existing
  replica.
- Re-replication is rate-limited so that recovering from a failed server does
  not itself overload the cluster, and the system prioritizes chunks that are
  close to losing their last replica.
- This makes durability a closed loop: a write is durable when the pipeline
  finishes, and it stays durable because the NameNode notices any drift from the
  target replication factor and fixes it continuously..
- The NameNode holds the complete mapping in memory.

- For each file, the ordered chunk list; for each chunk, its replicas and their
  locations.
- A read begins at the gateway, which asks the location service for the chunk
  list of the requested byte range.
- The location service consults the NameNode, which answers in microseconds with
  the ordered list of chunk IDs and, for each chunk, the ranked list of chunk
  servers holding a replica.
- Ranking prefers a server in the same rack or zone as the client and one with
  spare capacity, so the client can fetch the nearest replica with minimal
  network crossing.

The trick is that the location answer must be correct even while the system is
changing.

- Chunk servers come and go, and replicas move, so the NameNode is the single
  source of truth and every mutation — server join, server death, replica
  creation, chunk deletion — updates the mapping transactionally.
- Clients cache chunk-to-server mappings briefly and retry through the gateway
  on staleness, which keeps the hot path fast without making the client part of
  the consistency machinery.
- Because the metadata store is small relative to the data, the NameNode can
  also replicate its state for availability and checkpoint it to a durable
  metadata database, so a NameNode failure means the mapping is restored quickly
  and the data plane continues to serve from the chunk servers..
- Failure is the default state of a distributed file system, so recovery is
  designed in rather than bolted on.

- Chunk servers send periodic heartbeats; when the NameNode stops hearing from
  one, it marks the server lost and schedules its chunks for re-replication.
- Chunk inventory on the heartbeats also catches silent corruption — each chunk
  stores a checksum, and reads or background scanners that find a mismatch
  trigger a rewrite from a healthy replica.
- The rebalancer and the NameNode prioritize repairs: chunks that are missing
  one of three replicas are re-replicated first, and the recovery rate is
  throttled so rebuilding a dead server does not saturate the network or starve
  live traffic.

The NameNode itself must also survive.

- Its metadata is checkpointed and journaled, and the system runs a standby
  NameNode that watches the primary's log, so a primary failure fails over to a
  standby in seconds rather than requiring a long metadata rebuild.
- If the metadata store is entirely lost, the system can reconstruct the
  namespace from the chunk servers' self-reported inventories, with the data
  plane intact — a last-resort recovery that restores the system to a
  consistent, if slightly stale, state.
- Replica placement is what bounds recovery: because chunks were spread across
  racks and servers, losing one server at a time is survivable, and the system
  deliberately avoids scheduling multiple replicas of a chunk on one machine or
  rack.
- The design goal is a system where a node dies, its data is repaired
  automatically, and nothing that depends on the file system notices anything
  beyond a few seconds of degraded parallelism.

## Source

````text
title: Distributed File System
node client: Client [round, icon=browser]
node app: File App [icon=browser]
node gateway: API Gateway [icon=server]
node name: NameNode [icon=compute]
node meta: Metadata Store [cylinder, icon=database]
node chunk: Chunk Servers [icon=server]
node split: Chunk Splitter [icon=compute]
node replicate: Replication [icon=sync]
node locate: Location Service [icon=search]
node heal: Rebalancer [icon=worker]
node db: File Metadata DB [cylinder, icon=database]

edge client -> app: write file
edge app -> gateway: upload
edge gateway -> split: chunks
edge split -> chunk: store
edge chunk -> replicate: copy
edge client -> app: read
edge app -> gateway: request
edge gateway -> locate: chunk list
edge locate -> meta: lookup
edge locate -> chunk: fetch
edge heal -> chunk: repair
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Distributed File System
client: Client
app: File App
gateway: API Gateway
name: NameNode
meta: Metadata Store
chunk: Chunk Servers
split: Chunk Splitter
replicate: Replication
locate: Location Service
heal: Rebalancer
db: File Metadata DB

client ─► app ─► write file
app ─► gateway ─► upload
gateway ─► split ─► chunks
split ─► chunk ─► store
chunk ─► replicate ─► copy
client ─► app ─► read
app ─► gateway ─► request
gateway ─► locate ─► chunk list
locate ─► meta ─► lookup
locate ─► chunk ─► fetch
heal ─► chunk ─► repair
````

## Design

### Design a distributed file system

A distributed file system stores files across many commodity machines while
presenting a single namespace. The architecture splits metadata from data.

- A NameNode manages the namespace — the directory tree, file names,
  permissions, and for each file the map from logical ranges to physical chunks
  — while a fleet of chunk servers holds the actual data.
- A file is broken into fixed-size chunks, each chunk stored on several chunk
  servers for redundancy, and each chunk server reports its health and inventory
  to the NameNode.
- The gateway handles uploads and reads: the chunk splitter divides incoming
  files, and the location service translates a read request into the list of
  chunk servers that hold the needed ranges.

The two planes have completely different scale profiles.

- Metadata is small — bytes per file — so the NameNode can hold the whole
  namespace in memory and answer every lookup in microseconds; data is huge, so
  chunk servers are sized by storage and bandwidth and are expected to fail
  constantly.
- This asymmetry is the point of the design: the metadata plane stays fast and
  consistent while the data plane scales out and self-heals.
- The file system also needs durable guarantees around atomic renames, open
  semantics, and snapshot or append operations, and it must tolerate concurrent
  readers and writers.
- The hard problems are chunk location, replication, and recovery — the NameNode
  must always know where every chunk lives and must always be able to rebuild a
  chunk that was lost.
- Availability and durability guarantees are published per file class.

### How do you split files into chunks?

Files are split into fixed-size chunks, typically 64 MB or 128 MB, chosen to
balance overhead against parallelism.

- A large chunk means few metadata entries — the NameNode tracks one mapping per
  chunk rather than per kilobyte — and it amortizes the per-chunk bookkeeping,
  but it reduces parallelism for small files and inflates the cost of a partial
  read.
- The splitter handles files of any size: a small file becomes one chunk, while
  a multi-terabyte file becomes tens of thousands.
- Each chunk gets a globally unique ID, and the NameNode records, per file, the
  ordered list of chunk IDs plus each chunk's version.
- Because chunks are immutable once written and replaced by new versions on
  rewrite, the mapping stays simple and the read path never needs locks on data.

Splitting also needs to deal with appends and partial writes.

- An append is handled as a new chunk or an extended chunk with a version bump,
  and the NameNode's mapping is updated transactionally so a reader either sees
  the old length or the new one, never a torn state.
- The chunk boundary interacts with read efficiency: clients read chunk-aligned
  ranges so the location service can return exactly the servers for the ranges
  requested, and the file system supports a sequential read pattern where the
  client requests the next chunk before finishing the current one, hiding
  network latency.
- Chunk size is also a replication and recovery unit — the smaller the chunk,
  the faster a lost chunk can be re-replicated from its peers, so the choice of
  size directly bounds the recovery time budget.

### How do you replicate chunks for durability?

Every chunk is stored on multiple chunk servers, by default three, so the loss
of one or even two servers does not lose data. The replication policy is chosen
when the chunk is created.

- The system picks servers on different racks or failure domains, keeps the load
  balanced across servers, and prefers to place the replicas near clients that
  write or read the chunk most.
- When a client writes a chunk, one server is chosen as the pipeline leader; it
  receives the data and forwards it to the next replica in a chain, so the
  bandwidth cost of replicating three copies is roughly one copy, not three, and
  the client receives a single acknowledgment when all copies are durable.

The replication system is proactive, not reactive.

- The NameNode continuously reconciles its view of the world: each chunk server
  reports its chunk inventory on heartbeat, and the NameNode compares it against
  the desired state.
- A chunk that is under-replicated — because a server died or a new replica was
  requested — is added to a replication queue and rebuilt from an existing
  replica.
- Re-replication is rate-limited so that recovering from a failed server does
  not itself overload the cluster, and the system prioritizes chunks that are
  close to losing their last replica.
- This makes durability a closed loop: a write is durable when the pipeline
  finishes, and it stays durable because the NameNode notices any drift from the
  target replication factor and fixes it continuously.

### How do you locate chunks quickly?

Chunk location is a pure metadata problem, and the design keeps it entirely off
the data path. The NameNode holds the complete mapping in memory.

- For each file, the ordered chunk list; for each chunk, its replicas and their
  locations.
- A read begins at the gateway, which asks the location service for the chunk
  list of the requested byte range.
- The location service consults the NameNode, which answers in microseconds with
  the ordered list of chunk IDs and, for each chunk, the ranked list of chunk
  servers holding a replica.
- Ranking prefers a server in the same rack or zone as the client and one with
  spare capacity, so the client can fetch the nearest replica with minimal
  network crossing.

The trick is that the location answer must be correct even while the system is
changing.

- Chunk servers come and go, and replicas move, so the NameNode is the single
  source of truth and every mutation — server join, server death, replica
  creation, chunk deletion — updates the mapping transactionally.
- Clients cache chunk-to-server mappings briefly and retry through the gateway
  on staleness, which keeps the hot path fast without making the client part of
  the consistency machinery.
- Because the metadata store is small relative to the data, the NameNode can
  also replicate its state for availability and checkpoint it to a durable
  metadata database, so a NameNode failure means the mapping is restored quickly
  and the data plane continues to serve from the chunk servers.

### How do you recover from node failures?

Failure is the default state of a distributed file system, so recovery is
designed in rather than bolted on.

- Chunk servers send periodic heartbeats; when the NameNode stops hearing from
  one, it marks the server lost and schedules its chunks for re-replication.
- Chunk inventory on the heartbeats also catches silent corruption — each chunk
  stores a checksum, and reads or background scanners that find a mismatch
  trigger a rewrite from a healthy replica.
- The rebalancer and the NameNode prioritize repairs: chunks that are missing
  one of three replicas are re-replicated first, and the recovery rate is
  throttled so rebuilding a dead server does not saturate the network or starve
  live traffic.

The NameNode itself must also survive.

- Its metadata is checkpointed and journaled, and the system runs a standby
  NameNode that watches the primary's log, so a primary failure fails over to a
  standby in seconds rather than requiring a long metadata rebuild.
- If the metadata store is entirely lost, the system can reconstruct the
  namespace from the chunk servers' self-reported inventories, with the data
  plane intact — a last-resort recovery that restores the system to a
  consistent, if slightly stale, state.
- Replica placement is what bounds recovery: because chunks were spread across
  racks and servers, losing one server at a time is survivable, and the system
  deliberately avoids scheduling multiple replicas of a chunk on one machine or
  rack.
- The design goal is a system where a node dies, its data is repaired
  automatically, and nothing that depends on the file system notices anything
  beyond a few seconds of degraded parallelism.

## Source

```text
title: Distributed File System
node client: Client [round, icon=browser]
node app: File App [icon=browser]
node gateway: API Gateway [icon=server]
node name: NameNode [icon=compute]
node meta: Metadata Store [cylinder, icon=database]
node chunk: Chunk Servers [icon=server]
node split: Chunk Splitter [icon=compute]
node replicate: Replication [icon=sync]
node locate: Location Service [icon=search]
node heal: Rebalancer [icon=worker]
node db: File Metadata DB [cylinder, icon=database]

edge client -> app: write file
edge app -> gateway: upload
edge gateway -> split: chunks
edge split -> chunk: store
edge chunk -> replicate: copy
edge client -> app: read
edge app -> gateway: request
edge gateway -> locate: chunk list
edge locate -> meta: lookup
edge locate -> chunk: fetch
edge heal -> chunk: repair
```

## Q&A

### Q: Design a distributed file system

**A:** A distributed file system stores files across many commodity machines while
presenting a single namespace. The architecture splits metadata from data.

- A NameNode manages the namespace — the directory tree, file names,
  permissions, and for each file the map from logical ranges to physical chunks
  — while a fleet of chunk servers holds the actual data.
- A file is broken into fixed-size chunks, each chunk stored on several chunk
  servers for redundancy, and each chunk server reports its health and inventory
  to the NameNode.
- The gateway handles uploads and reads: the chunk splitter divides incoming
  files, and the location service translates a read request into the list of
  chunk servers that hold the needed ranges.

The two planes have completely different scale profiles.

- Metadata is small — bytes per file — so the NameNode can hold the whole
  namespace in memory and answer every lookup in microseconds; data is huge, so
  chunk servers are sized by storage and bandwidth and are expected to fail
  constantly.
- This asymmetry is the point of the design: the metadata plane stays fast and
  consistent while the data plane scales out and self-heals.
- The file system also needs durable guarantees around atomic renames, open
  semantics, and snapshot or append operations, and it must tolerate concurrent
  readers and writers.
- The hard problems are chunk location, replication, and recovery — the NameNode
  must always know where every chunk lives and must always be able to rebuild a
  chunk that was lost.
- Availability and durability guarantees are published per file class.

### Q: How do you split files into chunks?

**A:** Files are split into fixed-size chunks, typically 64 MB or 128 MB, chosen to
balance overhead against parallelism.

- A large chunk means few metadata entries — the NameNode tracks one mapping per
  chunk rather than per kilobyte — and it amortizes the per-chunk bookkeeping,
  but it reduces parallelism for small files and inflates the cost of a partial
  read.
- The splitter handles files of any size: a small file becomes one chunk, while
  a multi-terabyte file becomes tens of thousands.
- Each chunk gets a globally unique ID, and the NameNode records, per file, the
  ordered list of chunk IDs plus each chunk's version.
- Because chunks are immutable once written and replaced by new versions on
  rewrite, the mapping stays simple and the read path never needs locks on data.

Splitting also needs to deal with appends and partial writes.

- An append is handled as a new chunk or an extended chunk with a version bump,
  and the NameNode's mapping is updated transactionally so a reader either sees
  the old length or the new one, never a torn state.
- The chunk boundary interacts with read efficiency: clients read chunk-aligned
  ranges so the location service can return exactly the servers for the ranges
  requested, and the file system supports a sequential read pattern where the
  client requests the next chunk before finishing the current one, hiding
  network latency.
- Chunk size is also a replication and recovery unit — the smaller the chunk,
  the faster a lost chunk can be re-replicated from its peers, so the choice of
  size directly bounds the recovery time budget.

### Q: How do you replicate chunks for durability?

**A:** Every chunk is stored on multiple chunk servers, by default three, so the loss
of one or even two servers does not lose data. The replication policy is chosen
when the chunk is created.

- The system picks servers on different racks or failure domains, keeps the load
  balanced across servers, and prefers to place the replicas near clients that
  write or read the chunk most.
- When a client writes a chunk, one server is chosen as the pipeline leader; it
  receives the data and forwards it to the next replica in a chain, so the
  bandwidth cost of replicating three copies is roughly one copy, not three, and
  the client receives a single acknowledgment when all copies are durable.

The replication system is proactive, not reactive.

- The NameNode continuously reconciles its view of the world: each chunk server
  reports its chunk inventory on heartbeat, and the NameNode compares it against
  the desired state.
- A chunk that is under-replicated — because a server died or a new replica was
  requested — is added to a replication queue and rebuilt from an existing
  replica.
- Re-replication is rate-limited so that recovering from a failed server does
  not itself overload the cluster, and the system prioritizes chunks that are
  close to losing their last replica.
- This makes durability a closed loop: a write is durable when the pipeline
  finishes, and it stays durable because the NameNode notices any drift from the
  target replication factor and fixes it continuously.

### Q: How do you locate chunks quickly?

**A:** Chunk location is a pure metadata problem, and the design keeps it entirely off
the data path. The NameNode holds the complete mapping in memory.

- For each file, the ordered chunk list; for each chunk, its replicas and their
  locations.
- A read begins at the gateway, which asks the location service for the chunk
  list of the requested byte range.
- The location service consults the NameNode, which answers in microseconds with
  the ordered list of chunk IDs and, for each chunk, the ranked list of chunk
  servers holding a replica.
- Ranking prefers a server in the same rack or zone as the client and one with
  spare capacity, so the client can fetch the nearest replica with minimal
  network crossing.

The trick is that the location answer must be correct even while the system is
changing.

- Chunk servers come and go, and replicas move, so the NameNode is the single
  source of truth and every mutation — server join, server death, replica
  creation, chunk deletion — updates the mapping transactionally.
- Clients cache chunk-to-server mappings briefly and retry through the gateway
  on staleness, which keeps the hot path fast without making the client part of
  the consistency machinery.
- Because the metadata store is small relative to the data, the NameNode can
  also replicate its state for availability and checkpoint it to a durable
  metadata database, so a NameNode failure means the mapping is restored quickly
  and the data plane continues to serve from the chunk servers.

### Q: How do you recover from node failures?

**A:** Failure is the default state of a distributed file system, so recovery is
designed in rather than bolted on.

- Chunk servers send periodic heartbeats; when the NameNode stops hearing from
  one, it marks the server lost and schedules its chunks for re-replication.
- Chunk inventory on the heartbeats also catches silent corruption — each chunk
  stores a checksum, and reads or background scanners that find a mismatch
  trigger a rewrite from a healthy replica.
- The rebalancer and the NameNode prioritize repairs: chunks that are missing
  one of three replicas are re-replicated first, and the recovery rate is
  throttled so rebuilding a dead server does not saturate the network or starve
  live traffic.

The NameNode itself must also survive.

- Its metadata is checkpointed and journaled, and the system runs a standby
  NameNode that watches the primary's log, so a primary failure fails over to a
  standby in seconds rather than requiring a long metadata rebuild.
- If the metadata store is entirely lost, the system can reconstruct the
  namespace from the chunk servers' self-reported inventories, with the data
  plane intact — a last-resort recovery that restores the system to a
  consistent, if slightly stale, state.
- Replica placement is what bounds recovery: because chunks were spread across
  racks and servers, losing one server at a time is survivable, and the system
  deliberately avoids scheduling multiple replicas of a chunk on one machine or
  rack.
- The design goal is a system where a node dies, its data is repaired
  automatically, and nothing that depends on the file system notices anything
  beyond a few seconds of degraded parallelism.

## Source

```text
title: Distributed File System
node client: Client [round, icon=browser]
node app: File App [icon=browser]
node gateway: API Gateway [icon=server]
node name: NameNode [icon=compute]
node meta: Metadata Store [cylinder, icon=database]
node chunk: Chunk Servers [icon=server]
node split: Chunk Splitter [icon=compute]
node replicate: Replication [icon=sync]
node locate: Location Service [icon=search]
node heal: Rebalancer [icon=worker]
node db: File Metadata DB [cylinder, icon=database]

edge client -> app: write file
edge app -> gateway: upload
edge gateway -> split: chunks
edge split -> chunk: store
edge chunk -> replicate: copy
edge client -> app: read
edge app -> gateway: request
edge gateway -> locate: chunk list
edge locate -> meta: lookup
edge locate -> chunk: fetch
edge heal -> chunk: repair
```
