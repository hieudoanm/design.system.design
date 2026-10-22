import type { Problem } from './types';

export const keyValueStore: Problem = {
  slug: 'key-value-store',
  title: 'Distributed key-value store',
  tagline:
    'Design a highly available, horizontally scalable store in the style of Dynamo or Cassandra.',
  difficulty: 'Hard',
  tags: ['Consistent hashing', 'Replication', 'Quorums'],
  group: 'foundations',
  functional: [
    'put(key, value), get(key) and delete(key).',
    'Values up to a few hundred kilobytes.',
    'Tunable consistency per request.',
  ],
  nonFunctional: [
    'Scale out by adding nodes, with little data movement.',
    'Stay available through node and network failures (AP by default).',
    'Single-digit millisecond reads and writes.',
    'Recover automatically from failures.',
  ],
  estimation: [
    '1B keys at 1 KB each with 3 replicas is about 3 TB.',
    'At about 500 GB of data per node that is roughly 8 to 10 nodes, before accounting for throughput and headroom.',
  ],
  diagram: `              Client
                │   (any node can coordinate)
                ▼
        ┌── Coordinator ──┐        hash ring, N = 3 replicas
        ▼        ▼        ▼
     Node A   Node B   Node C
        │
        ├─ commit log (append only)
        ├─ memtable (in memory)
        └─ SSTables on disk + Bloom filters

 Failure handling: gossip, hinted handoff, Merkle-tree repair`,
  design: [
    {
      title: 'Partitioning',
      body: 'Place nodes on a hash ring using **consistent hashing**. A key belongs to the first node clockwise from its hash. Each physical node owns many **virtual nodes** spread around the ring, which balances load and makes adding or removing nodes move only a small slice of data.',
    },
    {
      title: 'Replication and consistency',
      body: 'Copy each key to N nodes: the owner and the next N-1 distinct physical nodes. Reads wait for R replicas and writes for W. If **R + W > N** the read and write sets overlap, so reads see the latest write. With N=3, W=2, R=2 you tolerate one node down. Lower W or R for speed, raise them for safety.\n\n**Sloppy quorum with hinted handoff:** if a replica is down, another node accepts the write and forwards it when the replica returns.',
    },
    {
      title: 'Conflict resolution',
      body: 'Concurrent writes to different replicas can diverge. **Vector clocks** record causality so the system can tell which version supersedes another and surface true conflicts to the application. **Last-write-wins** by timestamp is simpler but can silently lose writes. CRDTs merge automatically for suitable data types.',
    },
    {
      title: 'Detecting and repairing failures',
      body: 'Nodes exchange state by **gossip**, and a failure detector such as phi accrual decides when a peer is down. Hinted handoff covers short outages. For longer divergence, **anti-entropy** compares replicas with **Merkle trees** and copies only the differing ranges.',
    },
    {
      title: 'Storage engine',
      body: 'Writes append to a commit log for durability, then go into an in-memory memtable. When it fills, it is flushed to an immutable sorted file (SSTable). Reads check the memtable, then use Bloom filters to skip SSTables that cannot contain the key. Background compaction merges files and drops deleted data. This LSM-tree design makes writes sequential and fast.',
    },
  ],
  qa: [
    {
      q: 'Explain the CAP theorem. Where does this design sit?',
      a: 'During a network partition you must choose between consistency and availability. This design chooses availability: it keeps accepting reads and writes on both sides of a partition and reconciles later. Strictly, the choice only applies while a partition exists. The rest of the time the trade-off is between latency and consistency (PACELC).',
    },
    {
      q: 'How do you choose N, R and W?',
      a: 'N is the replication factor, commonly 3. Pick R and W so that R + W > N for strong reads, for example W=2, R=2. For read-heavy workloads use R=1 and W=N. For write-heavy workloads use W=1 and R=N. For maximum availability and speed, R=W=1, accepting stale reads.',
    },
    {
      q: 'How do you detect a failed node?',
      a: 'Use gossip: each node periodically shares its view of the cluster with random peers, so membership and health spread without a central coordinator. A failure detector turns missed heartbeats into a suspicion level, avoiding false alarms from a brief slowdown.',
    },
    {
      q: 'How do you resolve conflicting versions of a value?',
      a: "Track versions with vector clocks and keep both when neither descends from the other, letting the client merge them (Dynamo's shopping cart is the classic example). If simplicity matters more than never losing a write, use last-write-wins with timestamps.",
    },
    {
      q: 'Why use an LSM tree for storage?',
      a: 'It turns random writes into sequential ones: append to a log, update memory, flush sorted files. That gives very high write throughput. The cost is slower or more complex reads, which Bloom filters and compaction reduce.',
    },
    {
      q: 'How do you add a node without reshuffling all the data?',
      a: 'Consistent hashing with virtual nodes means the new node takes over small ranges from many existing nodes. It streams those ranges while the old owners keep serving, then ownership switches. Only about 1/N of the data moves.',
    },
  ],
};
