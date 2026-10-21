import type { Problem } from './types';

export const uniqueIdGenerator: Problem = {
  slug: 'unique-id-generator',
  title: 'Unique ID generator',
  tagline:
    'Generate globally unique, roughly time-sortable IDs across many machines without coordination.',
  difficulty: 'Medium',
  tags: ['Snowflake', 'Clocks', 'Coordination'],
  functional: [
    'IDs are unique across all servers and data centers.',
    'IDs fit in 64 bits and are numeric.',
    'IDs are roughly sortable by creation time.',
  ],
  nonFunctional: [
    'Generate at least 10,000 IDs per second per node.',
    'No single point of failure.',
    'Generation is local and fast: no network call on the hot path.',
  ],
  estimation: [
    '41 bits of milliseconds since a custom epoch last about 69 years.',
    '10 bits for the machine ID allows 1,024 nodes.',
    '12 bits of sequence allow 4,096 IDs per millisecond per node, about 4M per second.',
  ],
  diagram: ` bit layout (64 bits)
 ┌───┬─────────────────────────┬─────────────┬──────────────┐
 │ 0 │ 41 bits: timestamp (ms) │ 10 bits:    │ 12 bits:     │
 │   │ since custom epoch      │ node ID     │ sequence     │
 └───┴─────────────────────────┴─────────────┴──────────────┘

 App server ─► ID library (in process) ─► (time << 22) | (node << 12) | seq

 At startup:  node ID leased from ZooKeeper or etcd`,
  design: [
    {
      title: 'The options',
      body: '**Database auto-increment.** Simple, but one database is a bottleneck and a single point of failure.\n\n**UUID v4.** No coordination, but 128 bits, and random values scatter inserts across a B-tree index, hurting write performance.\n\n**Ticket server.** A central service hands out IDs, sometimes two databases with odd and even offsets. Easy, but still a dependency.\n\n**Snowflake-style.** Each node builds IDs from the time, its own ID and a counter. No coordination at generation time.\n\n**UUIDv7 or ULID.** Time-ordered 128-bit IDs. Good if you do not need 64 bits.',
    },
    {
      title: 'Snowflake layout',
      body: 'The top bit stays 0 so the value is a positive signed integer. Then come 41 bits of milliseconds, 10 bits identifying the node, and a 12-bit sequence that resets every millisecond. Because the timestamp is in the high bits, IDs sort by time, and IDs from one node are strictly increasing.',
    },
    {
      title: 'Clock problems',
      body: 'If the clock moves backwards, a node could reissue an old timestamp and produce duplicates. The safe responses are to wait until the clock passes the last used time, or to refuse to generate IDs and raise an alert. Configure NTP to slew the clock gradually instead of stepping it, and persist the last timestamp so a restart cannot go backwards.',
    },
    {
      title: 'Assigning node IDs',
      body: 'Each node needs a unique 10-bit value. Lease it from ZooKeeper or etcd at startup, with a heartbeat so an ID is not reused while a stale node is still running. Static config also works for small, fixed fleets.',
    },
  ],
  qa: [
    {
      q: 'Why not just use UUIDs?',
      a: 'UUID v4 values are 128 bits, which doubles index and storage size, and they are random, so inserts land all over a B-tree and cause page splits and cache misses. They also carry no time order. Time-based IDs such as Snowflake or UUIDv7 keep inserts roughly sequential.',
    },
    {
      q: 'What happens if the system clock goes backwards?',
      a: 'The generator may produce duplicates. Detect that the current time is lower than the last timestamp, then either wait until time catches up (for small drifts) or fail and alert (for large ones). Prevent most of it by using NTP slewing and by storing the last timestamp durably.',
    },
    {
      q: 'What if a node needs more than 4,096 IDs in one millisecond?',
      a: "Wait for the next millisecond. If that limit is genuinely too low, shift bits: use fewer node bits and more sequence bits, or add more nodes. Each node's rate is bounded by the sequence width.",
    },
    {
      q: 'How do you guarantee node IDs are unique?',
      a: 'Lease them from a coordination service such as ZooKeeper or etcd, with expiry, so two live nodes never hold the same ID. Static assignment is acceptable when the fleet is small and managed by hand.',
    },
    {
      q: 'Are Snowflake IDs strictly ordered?',
      a: 'No. Within a node they are strictly increasing. Across nodes they are only roughly ordered, bounded by clock skew between machines. If you need strict global order you need a single sequencer, which brings back the bottleneck.',
    },
  ],
};
