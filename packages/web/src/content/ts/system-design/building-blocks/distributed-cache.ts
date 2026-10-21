import type { Problem } from '../types';

export const distributedCache: Problem = {
  slug: 'distributed-cache',
  title: 'Distributed cache',
  tagline:
    'A scalable, highly available cache with consistent hashing, replication, and cache-aside patterns.',
  difficulty: 'Medium',
  tags: ['Consistent hashing', 'Replication', 'Cache-aside', 'Read-through'],
  group: 'building-blocks',
  functional: [
    'Get/set/del with sub-millisecond latency.',
    'Consistent hashing for partition distribution.',
    'Replication (primary + async replicas) for availability.',
    'Cache-aside and read-through/write-through patterns.',
    'TTL, LRU eviction, and memory limits per node.',
  ],
  nonFunctional: [
    'p99 get latency under 2 ms (local), 5 ms (remote).',
    '99.99% availability for reads (replicas serve on primary failure).',
    'Linear scalability: add nodes, rebalance automatically.',
    'Support 1M ops/sec per node.',
  ],
  estimation: [
    '1 TB data, 3x replication = 3 TB raw. 10 nodes × 100 GB each.',
    '100K ops/sec per node. 1M ops/sec cluster-wide.',
    'Consistent hashing ring with 256 virtual nodes per physical node.',
    'Replication lag < 10 ms (async, within same DC).',
  ],
  diagram: `flowchart LR
  CLIENT[Client] --> GW[API gateway / client library] --> CLUSTER[Cache cluster]
  CLUSTER --> RING[Consistent hash ring]
  RING --> SHARD_A[Shard A (primary + replica)]
  RING --> SHARD_B[Shard B (primary + replica)]
  RING --> SHARD_C[Shard C (primary + replica)]
  GW -.->|miss| DB[Source DB] --> GW
  GW -.->|read-through| CLUSTER`,
  design: [
    {
      title: 'Consistent hashing',
      body: 'Keys are hashed (for example, Murmur3) to a 32-bit ring. Each physical node owns multiple virtual nodes (vnodes) for better load distribution. The client library (or a proxy) computes the hash and routes directly to the primary node. On node join/leave, only the affected vnode ranges move (K/N keys). This minimizes reshuffling.',
    },
    {
      title: 'Replication',
      body: 'Each partition has a primary and 1-2 async replicas. Writes go to the primary; the primary replicates to followers. Reads can go to the primary (strong consistency) or any replica (eventual, lower latency). On primary failure, a replica is promoted (automatic failover via Raft or a coordinator). The client library handles retries and re-routing.',
    },
    {
      title: 'Cache patterns',
      body: 'Cache-aside: the application checks cache, on miss fetches from DB and populates cache. Read-through: the cache service fetches from DB on miss (configured with a loader). Write-through: writes go to cache and DB synchronously. Write-behind: writes go to cache, DB updated asynchronously (risk of data loss). The choice depends on consistency needs.',
    },
    {
      title: 'Eviction and memory',
      body: 'Each node enforces a memory limit (for example 80% of RAM). LRU eviction removes least-recently-used entries. TTL provides time-based expiry. Large values are compressed (LZ4) or stored off-heap. Hot keys are detected and optionally replicated to more nodes.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a hot key?',
      a: "Split the hot key's vnode range and migrate to a less-loaded node. Or add a local L2 cache (in-process) in the client library for the hottest keys. Rate-limit the key at the application level.",
    },
    {
      q: 'What about cache warming on deploy?',
      a: 'Pre-populate the cache from a snapshot or run a warming job that fetches hot keys from the DB. Rolling deploy: new nodes warm up before receiving traffic.',
    },
    {
      q: 'How do you ensure cache and DB consistency?',
      a: 'Cache-aside: on DB write, invalidate or update the cache key (async, best-effort). For strong consistency, use write-through or a transactional outbox pattern. Accept that cache is eventually consistent; the DB is the source of truth.',
    },
  ],
};
