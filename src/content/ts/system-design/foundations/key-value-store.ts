import type { Problem } from '../types';

export const keyValueStore: Problem = {
  slug: 'key-value-store',
  title: 'Distributed key-value store',
  tagline:
    'Build a linearly scalable, fault-tolerant KV store with consistent hashing, replication, and tunable consistency.',
  difficulty: 'Medium',
  tags: ['Consistent hashing', 'Quorum', 'LSM tree', 'Anti-entropy'],
  group: 'foundations',
  functional: [
    'Put, get, and delete keys with byte-array values (up to 1 MB).',
    'Support strong consistency (quorum reads/writes) and eventual consistency.',
    'Automatically rebalance when nodes join or leave.',
    'Provide a simple client library with retries and timeout handling.',
  ],
  nonFunctional: [
    '99.99% availability for single-key operations.',
    'p99 latency under 10 ms for gets, 20 ms for puts.',
    'Linear scalability: double the nodes, double the throughput.',
    'Survive simultaneous failure of any two nodes.',
  ],
  estimation: [
    '1 TB data, 3x replication = 3 TB raw. 10 nodes × 300 GB each.',
    '100K ops/sec per node, 1M ops/sec cluster-wide.',
    'Consistent hashing ring with 256 virtual nodes per physical node.',
    'Hinted handoff + anti-entropy repair for durability.',
  ],
  diagram: `flowchart LR
  Client --> COORD[Coordinator]
  COORD --> RING[Consistent hash ring]
  RING --> N1[Node A]
  RING --> N2[Node B]
  RING --> N3[Node C]
  N1 --> N1R[(Replica)]
  N2 --> N2R[(Replica)]
  N3 --> N3R[(Replica)]`,
  design: [
    {
      title: 'Partitioning',
      body: 'Consistent hashing maps keys to a ring. Each physical node owns multiple virtual nodes (vnodes) for better load distribution. The default replication factor N=3 means each key is stored on the next N nodes clockwise. The coordinator can be any node (client-side or a thin proxy); it routes the request to the primary and replicas.',
    },
    {
      title: 'Consistency levels',
      body: 'Write succeeds when W replicas acknowledge; read succeeds when R replicas respond. Strong consistency requires W + R > N (for example W=2, R=2, N=3). Eventual consistency uses W=1, R=1. The client chooses per request. Quorum reads also trigger read-repair to fix stale replicas.',
    },
    {
      title: 'Storage engine',
      body: 'Each node uses an LSM tree (like RocksDB) for write-optimised storage. Memtables flush to SSTables; background compaction merges and drops tombstones. Bloom filters avoid disk reads for missing keys. The write path: WAL → memtable → ack; the read path: memtable → block cache → SSTable.',
    },
    {
      title: 'Failure handling',
      body: 'Hinted handoff: if a replica is down, the coordinator writes the mutation to a local hint and replays it when the replica recovers. Anti-entropy: Merkle trees compare ranges between replicas on a schedule (daily) and repair differences. Node join: the new node streams data from its predecessors. Node leave: the node streams its data to successors before shutting down.',
    },
  ],
  qa: [
    {
      q: 'How do you handle hot keys?',
      a: "Split the hot key's vnode range and migrate it to a less-loaded node. Or add a caching layer (Redis) in front for read-heavy hot keys.",
    },
    {
      q: 'What about range queries?',
      a: 'A pure KV store does not support range queries efficiently. If you need them, use a different system (Cassandra with clustering keys, or a separate search/index layer).',
    },
    {
      q: 'How do you test chaos scenarios?',
      a: 'Use a chaos mesh: kill nodes, partition networks, inject latency. Verify that quorum operations still succeed, hinted handoff replays, and anti-entropy repairs divergence.',
    },
  ],
};
