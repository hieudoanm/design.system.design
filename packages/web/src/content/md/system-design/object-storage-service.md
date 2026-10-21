# Object Storage Service

Design an object storage service

**Difficulty:** Medium

**Tags:** database, storage

## Functional Requirements

- an object storage service
- scale writes across many servers?
- keep metadata consistent and durable?
- replicate objects across regions?
- handle large objects and multipart uploads?

## Non-Functional Requirements

- Object storage is a flat, durable key-value store:

- The key is a bucket plus object name, and the value is an opaque byte blob
  with metadata — size, content type, checksums, timestamps, and access control.
- The storage API exposes `PUT`, `GET`, and `DELETE`, authenticating every
  request against an auth service before touching data.
- The architecture splits cleanly into a metadata plane and a data plane: the
  metadata DB tracks where each object lives and its attributes, while a chunk
  store holds the actual bytes, replicated for durability.
- An object is content-addressed by hash, which makes deduplication and
  integrity checking straightforward.

Writes and reads are orchestrated by a few coordinating services:

- A partitioner routes writes by hashing the object key to a partition, so load
  distributes across many servers.
- A placement service decides which servers hold which chunks, and a replicator
  copies each chunk to the configured number of nodes (typically three, or
  erasure-coded to reduce storage overhead).
- A garbage collector reclaims chunks that no live metadata references, and a
  monitor tracks disk health, replication lag, and missing replicas to trigger
  repair.
- Reads resolve metadata first, then stream the chunk from the nearest available
  copy.

The design carries two notable tradeoffs:

- The data model — immutable objects, hashed placement, no in-place updates — is
  what makes object storage cheap, durable, and trivially replicated, at the
  cost of eventual-consistency semantics that callers must be designed to
  tolerate.
- Authentication is orthogonal to the data path: the auth service issues scoped
  credentials at the bucket and prefix level, and the API enforces them before
  metadata lookup, so authorization cost does not multiply with object count..
- Writes scale by spreading objects across shards and keeping the hot path
  parallel:

- The partitioner hashes the object key (bucket plus name) and maps the hash to
  a partition owning a range of hash space; each partition's data lives on its
  own set of storage nodes, so aggregate write throughput is roughly
  per-partition throughput times the number of partitions.
- Consistent hashing with virtual nodes keeps moves small when servers join or
  leave, and the partition-to-server assignment lives in the metadata plane, so
  any stateless API node can route a request without a global lock.
- The routing table is the scaling linchpin: it is small, cached, and versioned,
  so rebalancing a range is just a metadata update plus a background data move.

Within a partition, writes are batched and parallelized:

- Small objects are buffered and flushed in groups, while large objects are
  chunked into fixed-size pieces written concurrently to the replica set.
- A `PUT` is acknowledged only after a quorum of replicas confirm, so a single
  disk failure never loses data.
- When a node becomes a hotspot — a popular object or a skew in hash
  distribution — the partitioner rebalances ranges, moving the hottest hash
  ranges to underloaded nodes, the same machinery that absorbs server failures
  and new capacity.
- The result is a system where write capacity is a function of how many
  partitions you run, not a property of any single server.

Retries are safe by design:

- Writes are retryable and idempotent: the API assigns a request ID, and a
  retried `PUT` with the same ID overwrites the previous attempt, so clients can
  retry safely without creating duplicate objects..
- Metadata is the single source of truth for object existence and location, so it
  must be strongly consistent and durable:

- The metadata DB is a distributed, replicated, transactional store — a sharded
  relational database or a Raft/Paxos-backed KV — sharded by bucket and
  object-name hash.
- A `PUT` writes the chunk replicas first and commits the metadata record last,
  so a reader can never see metadata pointing at data that was not yet
  replicated.
- The commit is a transaction that inserts the object row with its checksum and
  storage location; if the transaction fails, the replicator's garbage collector
  eventually removes the orphaned chunks, keeping the two planes consistent.

Consistency across the data plane is maintained by versioning:

- Every object carries a version ID, and reads resolve against the latest
  committed version.
- If a chunk is missing or corrupt at read time, the placement service locates
  another replica or rebuilds the chunk from erasure-coded shards, and the
  monitor triggers repair to restore the replication factor.
- The metadata model also defines the consistency boundary: within a region,
  reads are strongly consistent after a successful `PUT`; cross-region reads are
  eventually consistent because replication is asynchronous.
- Buckets can be configured for stronger cross-region modes at higher latency
  cost, and the API documents the effective consistency guarantee so callers
  know what they can rely on.
- Metadata durability is independent of the data plane: even if every chunk copy
  of an object is lost, the metadata row persists and triggers repair or an
  explicit error rather than a silent 404, keeping failure modes observable..
- Replication is layered by distance:

- Within a region, the replicator writes chunks to the configured replica set
  synchronously on the write path — the `PUT` succeeds only after a quorum of
  local replicas acknowledges, giving durability against single-disk and
  single-node failures.
- For large objects, erasure coding (for example, 12-of-16 shards) replaces full
  copies: any 12 of the 16 shards can reconstruct the object, cutting storage
  overhead while keeping the object available even if several nodes fail.
- The replicator also runs an async repair loop that resynchronizes any replica
  that falls behind or fails a checksum, converging the cluster back to full
  replication factor over time.

Cross-region replication is asynchronous and metadata-driven:

- Each region runs its own metadata DB; a replication log of object writes
  streams to remote regions, which replay the writes against their own chunk
  stores.
- Because replication is asynchronous, the source and destination are briefly
  inconsistent — surfaced as replication-lag metrics per bucket rather than
  hidden.
- Versioned buckets make cross-region replication safe: the log carries the
  version ID, so a slow replica converges to the latest version without
  reordering corruption, and last-write-wins conflicts resolve deterministically
  by version.
- Failover works by promoting a replica region — promote its metadata DB and
  repoint DNS — so a region outage degrades availability but never durability,
  because every object still exists in multiple regions.
- Replication follows the metadata write order, and per-bucket replication
  filters — such as replicating only certain prefixes — keep cross-region
  traffic proportional to what actually needs to move..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Object Storage
client: Client
api: Storage API
auth: Auth Service
metadata: Metadata DB
partition: Partitioner
chunks: Chunk Store
placement: Placement
replication: Replicator
gc: Garbage Collector
monitor: Monitor

client ─► api ─► put
api ─► auth ─► verify
api ─► partition ─► route
partition ─► chunks ─► write
partition ─► metadata ─► index
chunks ─► replication ─► copy
metadata ─► placement ─► locate
client ─► api ─► get
api ─► metadata ─► lookup
api ─► chunks ─► read
chunks ─► gc ─► collect
```

## Design

### Design an object storage service

Object storage is a flat, durable key-value store:

- The key is a bucket plus object name, and the value is an opaque byte blob
  with metadata — size, content type, checksums, timestamps, and access control.
- The storage API exposes `PUT`, `GET`, and `DELETE`, authenticating every
  request against an auth service before touching data.
- The architecture splits cleanly into a metadata plane and a data plane: the
  metadata DB tracks where each object lives and its attributes, while a chunk
  store holds the actual bytes, replicated for durability.
- An object is content-addressed by hash, which makes deduplication and
  integrity checking straightforward.

Writes and reads are orchestrated by a few coordinating services:

- A partitioner routes writes by hashing the object key to a partition, so load
  distributes across many servers.
- A placement service decides which servers hold which chunks, and a replicator
  copies each chunk to the configured number of nodes (typically three, or
  erasure-coded to reduce storage overhead).
- A garbage collector reclaims chunks that no live metadata references, and a
  monitor tracks disk health, replication lag, and missing replicas to trigger
  repair.
- Reads resolve metadata first, then stream the chunk from the nearest available
  copy.

The design carries two notable tradeoffs:

- The data model — immutable objects, hashed placement, no in-place updates — is
  what makes object storage cheap, durable, and trivially replicated, at the
  cost of eventual-consistency semantics that callers must be designed to
  tolerate.
- Authentication is orthogonal to the data path: the auth service issues scoped
  credentials at the bucket and prefix level, and the API enforces them before
  metadata lookup, so authorization cost does not multiply with object count.

### How do you scale writes across many servers?

Writes scale by spreading objects across shards and keeping the hot path
parallel:

- The partitioner hashes the object key (bucket plus name) and maps the hash to
  a partition owning a range of hash space; each partition's data lives on its
  own set of storage nodes, so aggregate write throughput is roughly
  per-partition throughput times the number of partitions.
- Consistent hashing with virtual nodes keeps moves small when servers join or
  leave, and the partition-to-server assignment lives in the metadata plane, so
  any stateless API node can route a request without a global lock.
- The routing table is the scaling linchpin: it is small, cached, and versioned,
  so rebalancing a range is just a metadata update plus a background data move.

Within a partition, writes are batched and parallelized:

- Small objects are buffered and flushed in groups, while large objects are
  chunked into fixed-size pieces written concurrently to the replica set.
- A `PUT` is acknowledged only after a quorum of replicas confirm, so a single
  disk failure never loses data.
- When a node becomes a hotspot — a popular object or a skew in hash
  distribution — the partitioner rebalances ranges, moving the hottest hash
  ranges to underloaded nodes, the same machinery that absorbs server failures
  and new capacity.
- The result is a system where write capacity is a function of how many
  partitions you run, not a property of any single server.

Retries are safe by design:

- Writes are retryable and idempotent: the API assigns a request ID, and a
  retried `PUT` with the same ID overwrites the previous attempt, so clients can
  retry safely without creating duplicate objects.

### How do you keep metadata consistent and durable?

Metadata is the single source of truth for object existence and location, so it
must be strongly consistent and durable:

- The metadata DB is a distributed, replicated, transactional store — a sharded
  relational database or a Raft/Paxos-backed KV — sharded by bucket and
  object-name hash.
- A `PUT` writes the chunk replicas first and commits the metadata record last,
  so a reader can never see metadata pointing at data that was not yet
  replicated.
- The commit is a transaction that inserts the object row with its checksum and
  storage location; if the transaction fails, the replicator's garbage collector
  eventually removes the orphaned chunks, keeping the two planes consistent.

Consistency across the data plane is maintained by versioning:

- Every object carries a version ID, and reads resolve against the latest
  committed version.
- If a chunk is missing or corrupt at read time, the placement service locates
  another replica or rebuilds the chunk from erasure-coded shards, and the
  monitor triggers repair to restore the replication factor.
- The metadata model also defines the consistency boundary: within a region,
  reads are strongly consistent after a successful `PUT`; cross-region reads are
  eventually consistent because replication is asynchronous.
- Buckets can be configured for stronger cross-region modes at higher latency
  cost, and the API documents the effective consistency guarantee so callers
  know what they can rely on.
- Metadata durability is independent of the data plane: even if every chunk copy
  of an object is lost, the metadata row persists and triggers repair or an
  explicit error rather than a silent 404, keeping failure modes observable.

### How do you replicate objects across regions?

Replication is layered by distance:

- Within a region, the replicator writes chunks to the configured replica set
  synchronously on the write path — the `PUT` succeeds only after a quorum of
  local replicas acknowledges, giving durability against single-disk and
  single-node failures.
- For large objects, erasure coding (for example, 12-of-16 shards) replaces full
  copies: any 12 of the 16 shards can reconstruct the object, cutting storage
  overhead while keeping the object available even if several nodes fail.
- The replicator also runs an async repair loop that resynchronizes any replica
  that falls behind or fails a checksum, converging the cluster back to full
  replication factor over time.

Cross-region replication is asynchronous and metadata-driven:

- Each region runs its own metadata DB; a replication log of object writes
  streams to remote regions, which replay the writes against their own chunk
  stores.
- Because replication is asynchronous, the source and destination are briefly
  inconsistent — surfaced as replication-lag metrics per bucket rather than
  hidden.
- Versioned buckets make cross-region replication safe: the log carries the
  version ID, so a slow replica converges to the latest version without
  reordering corruption, and last-write-wins conflicts resolve deterministically
  by version.
- Failover works by promoting a replica region — promote its metadata DB and
  repoint DNS — so a region outage degrades availability but never durability,
  because every object still exists in multiple regions.
- Replication follows the metadata write order, and per-bucket replication
  filters — such as replicating only certain prefixes — keep cross-region
  traffic proportional to what actually needs to move.

### How do you handle large objects and multipart uploads?

Large objects use a multipart upload model:

- Small objects are written as a single chunk; large objects (gigabytes to
  terabytes) are split into fixed-size parts, typically 5–100MB, and uploaded
  independently.
- The API initiates a multipart upload, the client uploads parts in parallel,
  and a completion call tells the service to assemble the part list into an
  object manifest.
- The manifest — an ordered list of part references plus metadata — is what the
  metadata DB stores, and reads reassemble the object by streaming the parts in
  order.
- This design delivers resumability (a failed part restarts alone instead of
  re-uploading the whole object), high bandwidth (parallel uploads saturate the
  client's connection), and simplicity in the data plane (a part is just another
  chunk).

The chunk store and read path treat parts as first-class:

- The chunk store treats every part like a standalone chunk: hashed, replicated,
  and garbage-collected if the upload is aborted.
- Server-side copy, encryption, and checksum validation operate per part, and a
  final checksum over the whole manifest verifies integrity at completion.
- Reads stream parts sequentially with bounded read-ahead, and byte-range
  requests can seek directly to a part boundary, which is what makes video and
  large-file serving efficient.
- Because objects are immutable, an overwrite simply writes a new manifest and
  leaves old chunks to garbage collection — the same mechanism that keeps
  versioned object snapshots.
- The part model extends naturally to large downloads, conditional reads, and
  object locking.

Multipart concurrency is coordinated through the manifest:

- A completion racing an abort is resolved by version check, and server-side
  copy of a large object is implemented as a metadata-only operation that lazily
  points at the source parts until the first write.

## Source

```text
title: Object Storage
node client: Client [round, icon=browser]
node api: Storage API [icon=server]
node auth: Auth Service [icon=auth]
node metadata: Metadata DB [cylinder, icon=database]
node partition: Partitioner [icon=compute]
node chunks: Chunk Store [cylinder, icon=file]
node placement: Placement [icon=search]
node replication: Replicator [icon=sync]
node gc: Garbage Collector [icon=worker]
node monitor: Monitor [icon=search]

edge client -> api: put
edge api -> auth: verify
edge api -> partition: route
edge partition -> chunks: write
edge partition -> metadata: index
edge chunks -> replication: copy
edge metadata -> placement: locate
edge client -> api: get
edge api -> metadata: lookup
edge api -> chunks: read
edge chunks -> gc: collect
```

## Q&A

### Q: Design an object storage service

**A:** Object storage is a flat, durable key-value store:

- The key is a bucket plus object name, and the value is an opaque byte blob
  with metadata — size, content type, checksums, timestamps, and access control.
- The storage API exposes `PUT`, `GET`, and `DELETE`, authenticating every
  request against an auth service before touching data.
- The architecture splits cleanly into a metadata plane and a data plane: the
  metadata DB tracks where each object lives and its attributes, while a chunk
  store holds the actual bytes, replicated for durability.
- An object is content-addressed by hash, which makes deduplication and
  integrity checking straightforward.

Writes and reads are orchestrated by a few coordinating services:

- A partitioner routes writes by hashing the object key to a partition, so load
  distributes across many servers.
- A placement service decides which servers hold which chunks, and a replicator
  copies each chunk to the configured number of nodes (typically three, or
  erasure-coded to reduce storage overhead).
- A garbage collector reclaims chunks that no live metadata references, and a
  monitor tracks disk health, replication lag, and missing replicas to trigger
  repair.
- Reads resolve metadata first, then stream the chunk from the nearest available
  copy.

The design carries two notable tradeoffs:

- The data model — immutable objects, hashed placement, no in-place updates — is
  what makes object storage cheap, durable, and trivially replicated, at the
  cost of eventual-consistency semantics that callers must be designed to
  tolerate.
- Authentication is orthogonal to the data path: the auth service issues scoped
  credentials at the bucket and prefix level, and the API enforces them before
  metadata lookup, so authorization cost does not multiply with object count.

### Q: How do you scale writes across many servers?

**A:** Writes scale by spreading objects across shards and keeping the hot path
parallel:

- The partitioner hashes the object key (bucket plus name) and maps the hash to
  a partition owning a range of hash space; each partition's data lives on its
  own set of storage nodes, so aggregate write throughput is roughly
  per-partition throughput times the number of partitions.
- Consistent hashing with virtual nodes keeps moves small when servers join or
  leave, and the partition-to-server assignment lives in the metadata plane, so
  any stateless API node can route a request without a global lock.
- The routing table is the scaling linchpin: it is small, cached, and versioned,
  so rebalancing a range is just a metadata update plus a background data move.

Within a partition, writes are batched and parallelized:

- Small objects are buffered and flushed in groups, while large objects are
  chunked into fixed-size pieces written concurrently to the replica set.
- A `PUT` is acknowledged only after a quorum of replicas confirm, so a single
  disk failure never loses data.
- When a node becomes a hotspot — a popular object or a skew in hash
  distribution — the partitioner rebalances ranges, moving the hottest hash
  ranges to underloaded nodes, the same machinery that absorbs server failures
  and new capacity.
- The result is a system where write capacity is a function of how many
  partitions you run, not a property of any single server.

Retries are safe by design:

- Writes are retryable and idempotent: the API assigns a request ID, and a
  retried `PUT` with the same ID overwrites the previous attempt, so clients can
  retry safely without creating duplicate objects.

### Q: How do you keep metadata consistent and durable?

**A:** Metadata is the single source of truth for object existence and location, so it
must be strongly consistent and durable:

- The metadata DB is a distributed, replicated, transactional store — a sharded
  relational database or a Raft/Paxos-backed KV — sharded by bucket and
  object-name hash.
- A `PUT` writes the chunk replicas first and commits the metadata record last,
  so a reader can never see metadata pointing at data that was not yet
  replicated.
- The commit is a transaction that inserts the object row with its checksum and
  storage location; if the transaction fails, the replicator's garbage collector
  eventually removes the orphaned chunks, keeping the two planes consistent.

Consistency across the data plane is maintained by versioning:

- Every object carries a version ID, and reads resolve against the latest
  committed version.
- If a chunk is missing or corrupt at read time, the placement service locates
  another replica or rebuilds the chunk from erasure-coded shards, and the
  monitor triggers repair to restore the replication factor.
- The metadata model also defines the consistency boundary: within a region,
  reads are strongly consistent after a successful `PUT`; cross-region reads are
  eventually consistent because replication is asynchronous.
- Buckets can be configured for stronger cross-region modes at higher latency
  cost, and the API documents the effective consistency guarantee so callers
  know what they can rely on.
- Metadata durability is independent of the data plane: even if every chunk copy
  of an object is lost, the metadata row persists and triggers repair or an
  explicit error rather than a silent 404, keeping failure modes observable.

### Q: How do you replicate objects across regions?

**A:** Replication is layered by distance:

- Within a region, the replicator writes chunks to the configured replica set
  synchronously on the write path — the `PUT` succeeds only after a quorum of
  local replicas acknowledges, giving durability against single-disk and
  single-node failures.
- For large objects, erasure coding (for example, 12-of-16 shards) replaces full
  copies: any 12 of the 16 shards can reconstruct the object, cutting storage
  overhead while keeping the object available even if several nodes fail.
- The replicator also runs an async repair loop that resynchronizes any replica
  that falls behind or fails a checksum, converging the cluster back to full
  replication factor over time.

Cross-region replication is asynchronous and metadata-driven:

- Each region runs its own metadata DB; a replication log of object writes
  streams to remote regions, which replay the writes against their own chunk
  stores.
- Because replication is asynchronous, the source and destination are briefly
  inconsistent — surfaced as replication-lag metrics per bucket rather than
  hidden.
- Versioned buckets make cross-region replication safe: the log carries the
  version ID, so a slow replica converges to the latest version without
  reordering corruption, and last-write-wins conflicts resolve deterministically
  by version.
- Failover works by promoting a replica region — promote its metadata DB and
  repoint DNS — so a region outage degrades availability but never durability,
  because every object still exists in multiple regions.
- Replication follows the metadata write order, and per-bucket replication
  filters — such as replicating only certain prefixes — keep cross-region
  traffic proportional to what actually needs to move.

### Q: How do you handle large objects and multipart uploads?

**A:** Large objects use a multipart upload model:

- Small objects are written as a single chunk; large objects (gigabytes to
  terabytes) are split into fixed-size parts, typically 5–100MB, and uploaded
  independently.
- The API initiates a multipart upload, the client uploads parts in parallel,
  and a completion call tells the service to assemble the part list into an
  object manifest.
- The manifest — an ordered list of part references plus metadata — is what the
  metadata DB stores, and reads reassemble the object by streaming the parts in
  order.
- This design delivers resumability (a failed part restarts alone instead of
  re-uploading the whole object), high bandwidth (parallel uploads saturate the
  client's connection), and simplicity in the data plane (a part is just another
  chunk).

The chunk store and read path treat parts as first-class:

- The chunk store treats every part like a standalone chunk: hashed, replicated,
  and garbage-collected if the upload is aborted.
- Server-side copy, encryption, and checksum validation operate per part, and a
  final checksum over the whole manifest verifies integrity at completion.
- Reads stream parts sequentially with bounded read-ahead, and byte-range
  requests can seek directly to a part boundary, which is what makes video and
  large-file serving efficient.
- Because objects are immutable, an overwrite simply writes a new manifest and
  leaves old chunks to garbage collection — the same mechanism that keeps
  versioned object snapshots.
- The part model extends naturally to large downloads, conditional reads, and
  object locking.

Multipart concurrency is coordinated through the manifest:

- A completion racing an abort is resolved by version check, and server-side
  copy of a large object is implemented as a metadata-only operation that lazily
  points at the source parts until the first write.

## Source

```text
title: Object Storage
node client: Client [round, icon=browser]
node api: Storage API [icon=server]
node auth: Auth Service [icon=auth]
node metadata: Metadata DB [cylinder, icon=database]
node partition: Partitioner [icon=compute]
node chunks: Chunk Store [cylinder, icon=file]
node placement: Placement [icon=search]
node replication: Replicator [icon=sync]
node gc: Garbage Collector [icon=worker]
node monitor: Monitor [icon=search]

edge client -> api: put
edge api -> auth: verify
edge api -> partition: route
edge partition -> chunks: write
edge partition -> metadata: index
edge chunks -> replication: copy
edge metadata -> placement: locate
edge client -> api: get
edge api -> metadata: lookup
edge api -> chunks: read
edge chunks -> gc: collect
```
