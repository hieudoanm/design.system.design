# Distributed Cache

Design a distributed cache (Redis-like)

**Difficulty:** Medium

**Tags:** cache, distributed

## Functional Requirements

- a distributed cache (Redis-like)
- Cache-aside vs write-through: which do you use?
- invalidate cache entries consistently?
- handle cache stampedes and hot keys?
- ensure consistency between cache and source of truth?

## Non-Functional Requirements

- A distributed cache sits between applications and the source of truth to turn
  slow, per-request DB reads into sub-millisecond memory reads.

- The architecture is a cluster of cache nodes sharded by key: a client-side
  consistent-hash ring or a proxy routes each key to the node owning its hash
  slot, and every node holds its shard in memory.
- The data model matters: Redis-style caches support strings, hashes, sorted
  sets, and lists, so you can cache JSON documents, counters, sets of IDs, and
  ranked lists instead of opaque blobs.
- Every entry carries a `TTL`, so stale data eventually expires even if explicit
  invalidation is missed.

The request flow is cache-aside.

- The application reads from the cache; on a hit it's done; on a miss it loads
  from the source DB and writes the value back for future reads.
- Concurrency is handled with atomic primitives — `SETNX` for single-writer
  semantics, Lua scripts for multi-step check-and-set, and `INCR`/`DECR` for
  counters — so parallel writers can't corrupt state.
- Scaling is horizontal: add nodes and rehash, using virtual nodes so only a
  fraction of keys move on each change.
- Availability is handled by replicating each shard (replicas serve reads) and
  by falling back to the source DB when a cache node is down, degrading
  performance rather than correctness.

Memory is finite, so eviction and admission policy are first-class concerns.

- `maxmemory` plus an LRU/LFU/random eviction policy decides what is dropped
  under pressure, and hot data should be pinned or given longer TTLs.
- Persistence is a trade-off — `AOF` (append-only file) recovers more recent
  writes at a latency cost, `RDB` snapshots are cheaper but lose the last
  interval — and for a cache, losing everything and refilling from the source is
  often the cheapest failure mode.
- A monitor tracks hit rate, evictions, latency percentiles, and per-shard skew
  so you can right-size the cluster before users feel it..
- Cache-aside (lazy loading): the application reads from the cache, and on a miss
  loads from the DB and populates the cache, usually with a TTL.

- Writes go only to the DB; the cache is invalidated on write or left to expire.
- Pros: the cache holds only hot data, memory is used efficiently, the write
  path pays no cache cost, and the DB remains the single source of truth — a
  wrong cache entry is merely slow, never incorrect.
- Cons: the first read after a miss is slow (cache warming), and staleness
  persists until invalidation or TTL expiry, so a recently updated row can serve
  old data for up to the TTL.

Write-through: every write goes through the cache, which writes the value to the
DB before acknowledging, so the cache always holds the latest value and reads
almost never miss.

- The cost is that every write pays the DB latency on the critical path, cold
  data gets cached and wastes memory, and if the DB is down the write fails even
  though the cache could have served it.
- Write-behind loosens that: the cache acknowledges immediately and persists
  asynchronously through a queue, which makes writes fast but risks losing
  acknowledged writes if a node crashes before flush — so you pair it with a
  durable queue and retries.

Recommendation: cache-aside with TTLs for read-heavy workloads where write
latency matters and reads are what you optimize.

- Write-through when the cache is effectively the read model and you need strong
  freshness or want reads to never warm up.
- Write-behind for high-volume write streams where you can tolerate a small loss
  window in exchange for speed.
- In practice you combine them: cache-aside for general reads, an invalidation
  channel that deletes on write so updates propagate quickly, and a reserved
  write-behind path for counters and event-style writes where freshness within
  seconds is acceptable..
- Invalidation is where caches go wrong.

- The simplest mechanism is TTL: entries expire after a fixed window, giving
  bounded staleness with zero coordination — but you accept a delay between a DB
  update and the refreshed cache.
- For prompt propagation, publish an invalidation event: after a successful DB
  write, the source emits a delete for the affected keys to a channel (Redis
  pub/sub, Kafka, or a CDC stream) that all cache nodes subscribe to.
- Delete, don't overwrite: deleting is idempotent and safe, because a concurrent
  stale write can't clobber a newer value the way a stale `SET` can; the next
  read repopulates from the current DB state.

Ordering is the failure mode.

- A reader that misses, fetches an old value from a replica, and writes it back
  just after the invalidation has reintroduced a stale entry — the classic
  read/update race.
- Counter it by storing versioned values and using compare-and-set (e.g., a Lua
  script that only sets if the stored version is older), so a stale writer is
  rejected; or, simpler, avoid write-on-read after a recent invalidation and let
  the TTL clean up.
- The cleanest source of invalidation events is a change-data-capture stream
  from the DB's binlog, because it also captures updates that bypass the
  application code.

Under write-heavy load, per-key deletes can become an invalidation storm, and a
miss storm follows — all readers of a deleted key hit the source at once.

- Mitigate with jittered TTLs as a backstop, coalescing invalidation events on
  the bus (one delete per key per window), and rate limiting the invalidation
  channel.
- Accept that cache consistency is best-effort: combine TTL as the safety net,
  an at-least-once idempotent invalidation channel for promptness, versioned CAS
  writes to kill the read/update race, and a design that always falls back to
  the source of truth when correctness demands it..
- A cache stampede (thundering herd) hits when a hot key's entry expires and
  thousands of concurrent requests miss together, then all load from the source
  and repopulate.

- Single-flight/request coalescing: one in-flight loader per key, and every
  other request awaits the same future, implemented with a per-key mutex map or
  Redis locking.
- Jittered TTLs so entries never expire in lockstep.
- Stale-while-revalidate, serving the stale value while a background task
  refreshes so reads never block.
- Refresh-ahead, where a worker proactively recomputes just before expiry for
  expensive keys.
- All of these trade a little extra CPU for collapsing thousands of DB calls
  into one.

Hot keys are a different failure: a single key with disproportionate traffic is
owned by exactly one shard, so even a healthy cluster forms a hotspot and one
node saturates while the rest idle.

- Replicate the hot key to several nodes under variant keys (`key`, `key:1`,
  `key:2`) so reads fan out across shards — writes must update every copy, so
  keep the replica count small.
- Split the key into sub-keys (`user:42:{0..N}`) hashed across the ring and
  merge on read.
- Or push the hot value into a small in-process local cache on every application
  node with a short TTL, which is how the largest hot keys are often served.

Treat hot keys as an operational problem.

- A monitor that tracks per-key request rates and per-shard latency skew will
  catch a hotspot before the pager does.
- On detection, promote the key to the fan-out or local-cache strategy, then
  demote when traffic recedes.
- The trade-off across strategies is consistency — every extra copy multiplies
  write cost and invalidation fan-out — so hot-key handling should be
  policy-driven and reversible, with the source DB always able to absorb the
  fallback load if a cache node dies..
- The cache is a denormalized copy, so its consistency is bounded.

- Under normal cache-aside operation with invalidation, staleness is bounded by
  the TTL and the invalidation channel latency.
- The correctness property you want is eventual consistency in the right
  direction: after the DB commits a write, any cache entry for that key must
  eventually reflect the new value or be absent.
- Make the invalidation event at-least-once and idempotent (a delete is
  idempotent), and publish it on the same stream as the DB commit — a
  change-data-capture stream from the binlog is cleanest, because it also
  catches updates that bypass the application.

The hard cases are races and crashes.

- A reader repopulating from a stale DB snapshot, or a DB write that fails after
  partial invalidation, can re-introduce staleness.
- Use versioned entries with CAS, accept a small staleness window, and treat the
  cache as disposable — any node can drop and rebuild it.
- For read-your-writes consistency, route reads of recently written keys
  directly to the source, or use read-through against a replicated read replica.
- In short: TTL for bounded staleness, binlog-driven invalidation for
  promptness, and a design that never lets the cache block correctness.

## Source

````text
title: Distributed Cache
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node cache: Cache Cluster [icon=cache]
node shard: Shards [icon=queue]
node source: Source DB [cylinder, icon=database]
node invalidate: Invalidation [icon=sync]
node monitor: Monitor [icon=worker]
node backup: Backup [cylinder, icon=database]

edge client -> api: request
edge api -> cache: read
edge cache -> shard: hash lookup
edge shard -> api: hit
edge api -> source: miss
edge source -> api: value
edge api -> cache: write-back
edge source -> invalidate: notify
edge invalidate -> cache: invalidate
edge cache -> backup: snapshot
edge monitor -> cache: health
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Distributed Cache
client: Client
api: API Gateway
cache: Cache Cluster
shard: Shards
source: Source DB
invalidate: Invalidation
monitor: Monitor
backup: Backup

client ─► api ─► request
api ─► cache ─► read
cache ─► shard ─► hash lookup
shard ─► api ─► hit
api ─► source ─► miss
source ─► api ─► value
api ─► cache ─► write-back
source ─► invalidate ─► notify
invalidate ─► cache ─► invalidate
cache ─► backup ─► snapshot
monitor ─► cache ─► health
````

## Design

### Design a distributed cache (Redis-like)

A distributed cache sits between applications and the source of truth to turn
slow, per-request DB reads into sub-millisecond memory reads.

- The architecture is a cluster of cache nodes sharded by key: a client-side
  consistent-hash ring or a proxy routes each key to the node owning its hash
  slot, and every node holds its shard in memory.
- The data model matters: Redis-style caches support strings, hashes, sorted
  sets, and lists, so you can cache JSON documents, counters, sets of IDs, and
  ranked lists instead of opaque blobs.
- Every entry carries a `TTL`, so stale data eventually expires even if explicit
  invalidation is missed.

The request flow is cache-aside.

- The application reads from the cache; on a hit it's done; on a miss it loads
  from the source DB and writes the value back for future reads.
- Concurrency is handled with atomic primitives — `SETNX` for single-writer
  semantics, Lua scripts for multi-step check-and-set, and `INCR`/`DECR` for
  counters — so parallel writers can't corrupt state.
- Scaling is horizontal: add nodes and rehash, using virtual nodes so only a
  fraction of keys move on each change.
- Availability is handled by replicating each shard (replicas serve reads) and
  by falling back to the source DB when a cache node is down, degrading
  performance rather than correctness.

Memory is finite, so eviction and admission policy are first-class concerns.

- `maxmemory` plus an LRU/LFU/random eviction policy decides what is dropped
  under pressure, and hot data should be pinned or given longer TTLs.
- Persistence is a trade-off — `AOF` (append-only file) recovers more recent
  writes at a latency cost, `RDB` snapshots are cheaper but lose the last
  interval — and for a cache, losing everything and refilling from the source is
  often the cheapest failure mode.
- A monitor tracks hit rate, evictions, latency percentiles, and per-shard skew
  so you can right-size the cluster before users feel it.

### Cache-aside vs write-through: which do you use?

Cache-aside (lazy loading): the application reads from the cache, and on a miss
loads from the DB and populates the cache, usually with a TTL.

- Writes go only to the DB; the cache is invalidated on write or left to expire.
- Pros: the cache holds only hot data, memory is used efficiently, the write
  path pays no cache cost, and the DB remains the single source of truth — a
  wrong cache entry is merely slow, never incorrect.
- Cons: the first read after a miss is slow (cache warming), and staleness
  persists until invalidation or TTL expiry, so a recently updated row can serve
  old data for up to the TTL.

Write-through: every write goes through the cache, which writes the value to the
DB before acknowledging, so the cache always holds the latest value and reads
almost never miss.

- The cost is that every write pays the DB latency on the critical path, cold
  data gets cached and wastes memory, and if the DB is down the write fails even
  though the cache could have served it.
- Write-behind loosens that: the cache acknowledges immediately and persists
  asynchronously through a queue, which makes writes fast but risks losing
  acknowledged writes if a node crashes before flush — so you pair it with a
  durable queue and retries.

Recommendation: cache-aside with TTLs for read-heavy workloads where write
latency matters and reads are what you optimize.

- Write-through when the cache is effectively the read model and you need strong
  freshness or want reads to never warm up.
- Write-behind for high-volume write streams where you can tolerate a small loss
  window in exchange for speed.
- In practice you combine them: cache-aside for general reads, an invalidation
  channel that deletes on write so updates propagate quickly, and a reserved
  write-behind path for counters and event-style writes where freshness within
  seconds is acceptable.

### How do you invalidate cache entries consistently?

Invalidation is where caches go wrong.

- The simplest mechanism is TTL: entries expire after a fixed window, giving
  bounded staleness with zero coordination — but you accept a delay between a DB
  update and the refreshed cache.
- For prompt propagation, publish an invalidation event: after a successful DB
  write, the source emits a delete for the affected keys to a channel (Redis
  pub/sub, Kafka, or a CDC stream) that all cache nodes subscribe to.
- Delete, don't overwrite: deleting is idempotent and safe, because a concurrent
  stale write can't clobber a newer value the way a stale `SET` can; the next
  read repopulates from the current DB state.

Ordering is the failure mode.

- A reader that misses, fetches an old value from a replica, and writes it back
  just after the invalidation has reintroduced a stale entry — the classic
  read/update race.
- Counter it by storing versioned values and using compare-and-set (e.g., a Lua
  script that only sets if the stored version is older), so a stale writer is
  rejected; or, simpler, avoid write-on-read after a recent invalidation and let
  the TTL clean up.
- The cleanest source of invalidation events is a change-data-capture stream
  from the DB's binlog, because it also captures updates that bypass the
  application code.

Under write-heavy load, per-key deletes can become an invalidation storm, and a
miss storm follows — all readers of a deleted key hit the source at once.

- Mitigate with jittered TTLs as a backstop, coalescing invalidation events on
  the bus (one delete per key per window), and rate limiting the invalidation
  channel.
- Accept that cache consistency is best-effort: combine TTL as the safety net,
  an at-least-once idempotent invalidation channel for promptness, versioned CAS
  writes to kill the read/update race, and a design that always falls back to
  the source of truth when correctness demands it.

### How do you handle cache stampedes and hot keys?

A cache stampede (thundering herd) hits when a hot key's entry expires and
thousands of concurrent requests miss together, then all load from the source
and repopulate.

- Single-flight/request coalescing: one in-flight loader per key, and every
  other request awaits the same future, implemented with a per-key mutex map or
  Redis locking.
- Jittered TTLs so entries never expire in lockstep.
- Stale-while-revalidate, serving the stale value while a background task
  refreshes so reads never block.
- Refresh-ahead, where a worker proactively recomputes just before expiry for
  expensive keys.
- All of these trade a little extra CPU for collapsing thousands of DB calls
  into one.

Hot keys are a different failure: a single key with disproportionate traffic is
owned by exactly one shard, so even a healthy cluster forms a hotspot and one
node saturates while the rest idle.

- Replicate the hot key to several nodes under variant keys (`key`, `key:1`,
  `key:2`) so reads fan out across shards — writes must update every copy, so
  keep the replica count small.
- Split the key into sub-keys (`user:42:{0..N}`) hashed across the ring and
  merge on read.
- Or push the hot value into a small in-process local cache on every application
  node with a short TTL, which is how the largest hot keys are often served.

Treat hot keys as an operational problem.

- A monitor that tracks per-key request rates and per-shard latency skew will
  catch a hotspot before the pager does.
- On detection, promote the key to the fan-out or local-cache strategy, then
  demote when traffic recedes.
- The trade-off across strategies is consistency — every extra copy multiplies
  write cost and invalidation fan-out — so hot-key handling should be
  policy-driven and reversible, with the source DB always able to absorb the
  fallback load if a cache node dies.

### How do you ensure consistency between cache and source of truth?

The cache is a denormalized copy, so its consistency is bounded.

- Under normal cache-aside operation with invalidation, staleness is bounded by
  the TTL and the invalidation channel latency.
- The correctness property you want is eventual consistency in the right
  direction: after the DB commits a write, any cache entry for that key must
  eventually reflect the new value or be absent.
- Make the invalidation event at-least-once and idempotent (a delete is
  idempotent), and publish it on the same stream as the DB commit — a
  change-data-capture stream from the binlog is cleanest, because it also
  catches updates that bypass the application.

The hard cases are races and crashes.

- A reader repopulating from a stale DB snapshot, or a DB write that fails after
  partial invalidation, can re-introduce staleness.
- Use versioned entries with CAS, accept a small staleness window, and treat the
  cache as disposable — any node can drop and rebuild it.
- For read-your-writes consistency, route reads of recently written keys
  directly to the source, or use read-through against a replicated read replica.
- In short: TTL for bounded staleness, binlog-driven invalidation for
  promptness, and a design that never lets the cache block correctness.

## Source

```text
title: Distributed Cache
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node cache: Cache Cluster [icon=cache]
node shard: Shards [icon=queue]
node source: Source DB [cylinder, icon=database]
node invalidate: Invalidation [icon=sync]
node monitor: Monitor [icon=worker]
node backup: Backup [cylinder, icon=database]

edge client -> api: request
edge api -> cache: read
edge cache -> shard: hash lookup
edge shard -> api: hit
edge api -> source: miss
edge source -> api: value
edge api -> cache: write-back
edge source -> invalidate: notify
edge invalidate -> cache: invalidate
edge cache -> backup: snapshot
edge monitor -> cache: health
```

## Q&A

### Q: Design a distributed cache (Redis-like)

**A:** A distributed cache sits between applications and the source of truth to turn
slow, per-request DB reads into sub-millisecond memory reads.

- The architecture is a cluster of cache nodes sharded by key: a client-side
  consistent-hash ring or a proxy routes each key to the node owning its hash
  slot, and every node holds its shard in memory.
- The data model matters: Redis-style caches support strings, hashes, sorted
  sets, and lists, so you can cache JSON documents, counters, sets of IDs, and
  ranked lists instead of opaque blobs.
- Every entry carries a `TTL`, so stale data eventually expires even if explicit
  invalidation is missed.

The request flow is cache-aside.

- The application reads from the cache; on a hit it's done; on a miss it loads
  from the source DB and writes the value back for future reads.
- Concurrency is handled with atomic primitives — `SETNX` for single-writer
  semantics, Lua scripts for multi-step check-and-set, and `INCR`/`DECR` for
  counters — so parallel writers can't corrupt state.
- Scaling is horizontal: add nodes and rehash, using virtual nodes so only a
  fraction of keys move on each change.
- Availability is handled by replicating each shard (replicas serve reads) and
  by falling back to the source DB when a cache node is down, degrading
  performance rather than correctness.

Memory is finite, so eviction and admission policy are first-class concerns.

- `maxmemory` plus an LRU/LFU/random eviction policy decides what is dropped
  under pressure, and hot data should be pinned or given longer TTLs.
- Persistence is a trade-off — `AOF` (append-only file) recovers more recent
  writes at a latency cost, `RDB` snapshots are cheaper but lose the last
  interval — and for a cache, losing everything and refilling from the source is
  often the cheapest failure mode.
- A monitor tracks hit rate, evictions, latency percentiles, and per-shard skew
  so you can right-size the cluster before users feel it.

### Q: Cache-aside vs write-through: which do you use?

**A:** Cache-aside (lazy loading): the application reads from the cache, and on a miss
loads from the DB and populates the cache, usually with a TTL.

- Writes go only to the DB; the cache is invalidated on write or left to expire.
- Pros: the cache holds only hot data, memory is used efficiently, the write
  path pays no cache cost, and the DB remains the single source of truth — a
  wrong cache entry is merely slow, never incorrect.
- Cons: the first read after a miss is slow (cache warming), and staleness
  persists until invalidation or TTL expiry, so a recently updated row can serve
  old data for up to the TTL.

Write-through: every write goes through the cache, which writes the value to the
DB before acknowledging, so the cache always holds the latest value and reads
almost never miss.

- The cost is that every write pays the DB latency on the critical path, cold
  data gets cached and wastes memory, and if the DB is down the write fails even
  though the cache could have served it.
- Write-behind loosens that: the cache acknowledges immediately and persists
  asynchronously through a queue, which makes writes fast but risks losing
  acknowledged writes if a node crashes before flush — so you pair it with a
  durable queue and retries.

Recommendation: cache-aside with TTLs for read-heavy workloads where write
latency matters and reads are what you optimize.

- Write-through when the cache is effectively the read model and you need strong
  freshness or want reads to never warm up.
- Write-behind for high-volume write streams where you can tolerate a small loss
  window in exchange for speed.
- In practice you combine them: cache-aside for general reads, an invalidation
  channel that deletes on write so updates propagate quickly, and a reserved
  write-behind path for counters and event-style writes where freshness within
  seconds is acceptable.

### Q: How do you invalidate cache entries consistently?

**A:** Invalidation is where caches go wrong.

- The simplest mechanism is TTL: entries expire after a fixed window, giving
  bounded staleness with zero coordination — but you accept a delay between a DB
  update and the refreshed cache.
- For prompt propagation, publish an invalidation event: after a successful DB
  write, the source emits a delete for the affected keys to a channel (Redis
  pub/sub, Kafka, or a CDC stream) that all cache nodes subscribe to.
- Delete, don't overwrite: deleting is idempotent and safe, because a concurrent
  stale write can't clobber a newer value the way a stale `SET` can; the next
  read repopulates from the current DB state.

Ordering is the failure mode.

- A reader that misses, fetches an old value from a replica, and writes it back
  just after the invalidation has reintroduced a stale entry — the classic
  read/update race.
- Counter it by storing versioned values and using compare-and-set (e.g., a Lua
  script that only sets if the stored version is older), so a stale writer is
  rejected; or, simpler, avoid write-on-read after a recent invalidation and let
  the TTL clean up.
- The cleanest source of invalidation events is a change-data-capture stream
  from the DB's binlog, because it also captures updates that bypass the
  application code.

Under write-heavy load, per-key deletes can become an invalidation storm, and a
miss storm follows — all readers of a deleted key hit the source at once.

- Mitigate with jittered TTLs as a backstop, coalescing invalidation events on
  the bus (one delete per key per window), and rate limiting the invalidation
  channel.
- Accept that cache consistency is best-effort: combine TTL as the safety net,
  an at-least-once idempotent invalidation channel for promptness, versioned CAS
  writes to kill the read/update race, and a design that always falls back to
  the source of truth when correctness demands it.

### Q: How do you handle cache stampedes and hot keys?

**A:** A cache stampede (thundering herd) hits when a hot key's entry expires and
thousands of concurrent requests miss together, then all load from the source
and repopulate.

- Single-flight/request coalescing: one in-flight loader per key, and every
  other request awaits the same future, implemented with a per-key mutex map or
  Redis locking.
- Jittered TTLs so entries never expire in lockstep.
- Stale-while-revalidate, serving the stale value while a background task
  refreshes so reads never block.
- Refresh-ahead, where a worker proactively recomputes just before expiry for
  expensive keys.
- All of these trade a little extra CPU for collapsing thousands of DB calls
  into one.

Hot keys are a different failure: a single key with disproportionate traffic is
owned by exactly one shard, so even a healthy cluster forms a hotspot and one
node saturates while the rest idle.

- Replicate the hot key to several nodes under variant keys (`key`, `key:1`,
  `key:2`) so reads fan out across shards — writes must update every copy, so
  keep the replica count small.
- Split the key into sub-keys (`user:42:{0..N}`) hashed across the ring and
  merge on read.
- Or push the hot value into a small in-process local cache on every application
  node with a short TTL, which is how the largest hot keys are often served.

Treat hot keys as an operational problem.

- A monitor that tracks per-key request rates and per-shard latency skew will
  catch a hotspot before the pager does.
- On detection, promote the key to the fan-out or local-cache strategy, then
  demote when traffic recedes.
- The trade-off across strategies is consistency — every extra copy multiplies
  write cost and invalidation fan-out — so hot-key handling should be
  policy-driven and reversible, with the source DB always able to absorb the
  fallback load if a cache node dies.

### Q: How do you ensure consistency between cache and source of truth?

**A:** The cache is a denormalized copy, so its consistency is bounded.

- Under normal cache-aside operation with invalidation, staleness is bounded by
  the TTL and the invalidation channel latency.
- The correctness property you want is eventual consistency in the right
  direction: after the DB commits a write, any cache entry for that key must
  eventually reflect the new value or be absent.
- Make the invalidation event at-least-once and idempotent (a delete is
  idempotent), and publish it on the same stream as the DB commit — a
  change-data-capture stream from the binlog is cleanest, because it also
  catches updates that bypass the application.

The hard cases are races and crashes.

- A reader repopulating from a stale DB snapshot, or a DB write that fails after
  partial invalidation, can re-introduce staleness.
- Use versioned entries with CAS, accept a small staleness window, and treat the
  cache as disposable — any node can drop and rebuild it.
- For read-your-writes consistency, route reads of recently written keys
  directly to the source, or use read-through against a replicated read replica.
- In short: TTL for bounded staleness, binlog-driven invalidation for
  promptness, and a design that never lets the cache block correctness.

## Source

```text
title: Distributed Cache
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node cache: Cache Cluster [icon=cache]
node shard: Shards [icon=queue]
node source: Source DB [cylinder, icon=database]
node invalidate: Invalidation [icon=sync]
node monitor: Monitor [icon=worker]
node backup: Backup [cylinder, icon=database]

edge client -> api: request
edge api -> cache: read
edge cache -> shard: hash lookup
edge shard -> api: hit
edge api -> source: miss
edge source -> api: value
edge api -> cache: write-back
edge source -> invalidate: notify
edge invalidate -> cache: invalidate
edge cache -> backup: snapshot
edge monitor -> cache: health
```
