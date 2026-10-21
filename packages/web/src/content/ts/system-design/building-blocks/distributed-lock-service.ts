import type { Problem } from '../types';

export const distributedLockService: Problem = {
  slug: 'distributed-lock-service',
  title: 'Distributed lock service',
  tagline:
    'Provide mutual exclusion with leases, fencing tokens, and linearizable semantics across a cluster.',
  difficulty: 'Medium',
  tags: ['Consensus', 'Lease', 'Fencing', 'Linearizability', 'CP'],
  group: 'building-blocks',
  functional: [
    'Acquire lock with TTL (auto-release on client crash).',
    'Release lock explicitly or let lease expire.',
    'Fencing tokens: monotonic integer per lock acquisition.',
    'Wait queue (FIFO) with optional timeout.',
    'Lock metadata: owner, acquired_at, expires_at.',
  ],
  nonFunctional: [
    'Linearizable: acquire/release appear atomic.',
    'p99 acquire latency under 50 ms.',
    'Survive minority node failures (CP).',
    'No lock loss on leader failover.',
  ],
  estimation: [
    '10K locks, 1M acquire/sec peak.',
    'Consensus cluster: 5 nodes (Raft).',
    'Lease TTL: 10-30 sec. Heartbeat every TTL/3.',
    'Fencing token: 64-bit monotonic counter per lock.',
  ],
  diagram: `flowchart LR
  CLIENT[Client] --> API[Lock API] --> LEASE[Lease manager] --> STORE[(Lock store)]
  LEASE -->|heartbeat| CLIENT
  LEASE -->|expire| STORE
  STORE -.->|Raft consensus| STORE2[(Replica)]
  STORE -.->|Raft consensus| STORE3[(Replica)]`,
  design: [
    {
      title: 'Consensus-based lock store',
      body: 'The lock store is a replicated state machine (Raft or Paxos). Each lock is a key with value: `{owner, fence_token, expiry}`. Acquire and release are log entries. The leader serializes all operations, providing linearizability. A 5-node cluster tolerates 2 failures.',
    },
    {
      title: 'Leases and heartbeats',
      body: 'On acquire, the server sets an expiry (now + TTL) and returns a fence token. The client must heartbeat (renew) before expiry. The lease manager runs a background scanner: if expiry < now, the lock is released and the next waiter is notified. Heartbeat interval = TTL / 3 (for example 10 sec TTL → 3 sec heartbeat).',
    },
    {
      title: 'Fencing tokens',
      body: "Each successful acquire increments a per-lock counter. The token is returned to the client. The protected resource (for example, a database) must require the token on write and reject stale tokens. This prevents split-brain: if client A's lease expires but it still thinks it holds the lock, its writes are rejected because the token is old.",
    },
    {
      title: 'Wait queue',
      body: 'If a lock is held, the client can enqueue (blocking acquire). The queue is FIFO per lock. On release or expiry, the lock manager pops the next waiter and grants the lock (new fence token). The waiter is notified via WebSocket/long-poll. Timeout cancels the wait.',
    },
  ],
  qa: [
    {
      q: 'What if the client crashes after acquire but before heartbeat?',
      a: "The lease expires after TTL. The lock is released automatically. The next waiter gets it. The crashed client's fence token is now stale.",
    },
    {
      q: 'How do you handle clock skew between client and server?',
      a: 'Lease expiry is set by the server (server time). The client heartbeats based on its local clock but the server decides expiry. Use NTP; allow a few seconds of skew in the TTL buffer.',
    },
    {
      q: 'Can you use this for leader election?',
      a: "Yes. The lock key is the election name (for example `leader:payment-service`). The acquire winner becomes leader. On lease expiry, a new election occurs. Fencing tokens protect the leader's writes.",
    },
  ],
};
