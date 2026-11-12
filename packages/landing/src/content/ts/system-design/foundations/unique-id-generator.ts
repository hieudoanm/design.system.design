import type { Problem } from '../types';

export const uniqueIdGenerator: Problem = {
  slug: 'unique-id-generator',
  title: 'Unique ID generator',
  tagline:
    'Generate globally unique, roughly sortable IDs at high throughput without a central bottleneck.',
  difficulty: 'Easy',
  tags: ['Snowflake', 'Bit allocation', 'Clock drift'],
  group: 'foundations',
  functional: [
    'Generate 64-bit IDs that are unique across all nodes.',
    'IDs should be roughly time-ordered (newer IDs > older IDs).',
    'Support at least 10K IDs/second per node.',
    'No single point of failure or coordination bottleneck.',
  ],
  nonFunctional: [
    'ID generation latency under 100 µs at p99.',
    'Tolerate clock drift up to a few milliseconds.',
    'Node IDs assigned at startup, no central registry required.',
    'IDs must be URL-safe when encoded (base62 or similar).',
  ],
  estimation: [
    '41-bit timestamp (ms since custom epoch) gives ~69 years.',
    '10-bit node ID supports 1,024 nodes.',
    '12-bit sequence gives 4,096 IDs/ms per node — 4M IDs/s per node.',
    'Total throughput: billions of IDs/sec across the fleet.',
  ],
  diagram: `flowchart LR
  subgraph Node [ID Generation Node]
    TS[Timestamp 41 bits] --> SHIFT[Shift & Combine]
    NID[Node ID 10 bits] --> SHIFT
    SEQ[Sequence 12 bits] --> SHIFT
    SHIFT --> OUT[64-bit ID]
  end
  NTP[NTP / System clock] -.-> TS
  CONFIG[Node ID from config] -.-> NID
  COUNTER[Atomic counter] -.-> SEQ`,
  design: [
    {
      title: 'Bit layout',
      body: '```\n ┌───┬─────────────────────────┬─────────────┬──────────────┐\n │ 0 │ 41 bits: timestamp (ms) │ 10 bits:    │ 12 bits:     │\n │   │ since custom epoch      │ node ID     │ sequence     │\n └───┴─────────────────────────┴─────────────┴──────────────┘\n```\nThe sign bit (bit 63) is always 0 so the ID stays positive in signed languages. The custom epoch (for example 2020-01-01) maximises the timestamp runway.',
    },
    {
      title: 'Clock drift handling',
      body: 'If the system clock moves backward, the generator must not emit duplicate IDs. Options: (1) wait until the clock catches up (blocks the thread), (2) return an error to the caller, (3) use a logical clock that only moves forward. The pragmatic choice is to wait up to a configurable threshold (for example 10 ms), then error. NTP keeps drift under a few ms in practice.',
    },
    {
      title: 'Node ID assignment',
      body: 'Assign node IDs from a coordination service (ZooKeeper, etcd, Consul) at startup, or derive them from the pod IP / instance ID modulo 1024. The assignment must be stable for the lifetime of the process. If a node restarts, it should get the same ID to avoid wasting the ID space.',
    },
  ],
  qa: [
    {
      q: 'What if you need more than 1,024 nodes?',
      a: 'Steal bits from the sequence (for example 11 bits node, 11 bits sequence) or use a 128-bit ID (UUIDv7 style). The 64-bit layout is a sweet spot for most systems; only planet-scale systems need more.',
    },
    {
      q: 'How do you encode the ID for URLs?',
      a: 'Base62 (0-9, a-z, A-Z) is URL-safe and gives 11 characters for 64 bits. Avoid base64 because + and / need escaping. Crockford base32 is another option — slightly longer but case-insensitive and avoids ambiguous characters.',
    },
    {
      q: 'Can you generate IDs in a serverless function?',
      a: 'Yes, but you must solve node ID assignment. Use a deterministic hash of the function name + region + instance ID, or allocate a block of node IDs per deployment. The sequence counter must be in-memory (not shared) because cold starts reset it.',
    },
  ],
};
