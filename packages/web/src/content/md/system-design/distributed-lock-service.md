# Distributed lock service

Hand out leases so only one node acts at a time, even after a failure.

**Difficulty:** Medium

**Tags:** distributed

## Functional Requirements

- Acquire and release a named lock.
- Renew the lease while the holder is alive.
- Queue waiters and hand the lock over fairly.
- Issue fencing tokens so a stale holder cannot write.

## Non-Functional Requirements

- Mutual exclusion holds even through a network partition.
- Acquisition answers in under 10 ms and leases expire in seconds.
- A crashed holder never leaves the lock stuck.
- Every acquisition is audited.

## Estimation

- 10k acquisitions per second at peak, with about 1M locks held at once.
- A lock record of 100 bytes for 1M locks is 100 MB, tripled for replication.
- A 10-second lease with a 3-second heartbeat is about 3.3k renewals per second for 10k holders.
- Wait queues are short, so a per-lock FIFO list is cheaper than a global queue.

## Architecture Diagram

```text
 Client ─► Lock API ─► Lease manager ─► Lock store (consensus, CP)
              │             │                 │
              ├─ acquire / release              └─► expire on a missed heartbeat
              ├─► Fencing tokens (monotonic)
              ├─► Wait queue (FIFO)
              └─► Audit log

 Client ─► Heartbeat ─► Lock store (renew TTL)
 Monitor ─► detect and expire dead holders
```

## Design

### Overview

The service coordinates mutually exclusive access to a shared resource across
many processes.

- A client calls the lock API to acquire a lock on a named key; the API attempts
  an atomic write in the lock store — typically Redis with `SET key token NX PX
ttl` — and if the write succeeds, the client holds the lock.
- Every lock carries a lease (TTL), because a crashed holder must not block
  everyone else forever.
- A lease manager tracks expiry, a heartbeat endpoint lets a healthy holder
  renew its lease while it still works, and a monitor scans for expired locks so
  the store can be reclaimed.

Acquisition, renewal, and release are all token-driven.

- The store grants a unique token per acquisition, and release uses a
  compare-and-delete so a client can only release the lock it actually holds.
- A wait queue holds contending clients fairly instead of letting them race by
  polling.
- When the client finishes, it deletes the lock; when it crashes, the lease
  expires and the lock is re-issued to the next waiter.
- An audit log records every acquire, renew, and release for debugging
  contention and deadlocks.
- The service's core guarantee is mutual exclusion under normal operation, with
  leases bounding how long exclusion survives a holder failure and fencing
  tokens making even stale holders harmless.
- Locks are scoped per resource namespace and environment so production and
  staging never contend, and the API exposes TTL, queue position, and current
  holder so callers can debug contention without guessing.

## Q&A

### Q: How do you guarantee mutual exclusion across nodes?

Mutual exclusion must come from an atomic primitive in a single, strongly
consistent store — it cannot be built from application-layer reads and writes,
because two nodes can observe stale state and both conclude the lock is free.
Redis provides `SET key token NX PX ttl`, which succeeds only if the key does
not exist, so exactly one acquirer wins. Other backends work the same way: a
database `INSERT` on a primary-keyed lock row, or an atomic create-if-absent on
an etcd or ZooKeeper key with a TTL attached. The key itself encodes the
resource name, so locks on different resources never contend with each other.

The subtle part is the check-then-act sequence across the API and the store. The
API must never decide "the lock is free" by reading and then writing — the
entire decide-and-claim must be one atomic operation, which is why Lua scripts
or the store's native conditional primitives are used. Release has the same
requirement: it must compare the held token (compare-and-delete) so a stale
client cannot delete a lock that has already expired and been reacquired by
someone else. With those atomic primitives in place, mutual exclusion holds as
long as clocks and TTLs behave — and handling the ways they can misbehave is
exactly what leases, fencing tokens, and failover design are for. Consistency
mode matters too: the store must use a majority quorum rather than a primary
that can fail over with lost writes, since a resurrected lock store can
resurrect a duplicate lock — the failure this design most fears.

### Q: How do you handle lock expiry and fencing?

A lease solves liveness, not safety. If a holder pauses longer than the TTL — a
GC pause, a slow disk, a network partition — the lock expires and another client
acquires it; the original holder, waking up, still believes it holds the lock
and will corrupt shared state. Two mechanisms defend against this. First, lease
renewal: the holder heartbeats and renews its lease in the background, so expiry
only happens when the holder is genuinely stuck. Renewal cannot be guaranteed
under a partition, so expiry must remain possible and the protocol must be safe
when it happens.

Second, fencing makes expiry safe. Each acquisition grants a strictly increasing
fencing token, and the shared resource rejects any write whose token is lower
than the highest it has accepted. The canonical example is a storage API that
requires `fencing_token` greater than or equal to the last token it saw. Then
even a stale holder acting after its lease expired cannot overwrite newer
writes, because its old token loses the comparison. Practically, this requires
the lock service and the resource to cooperate: the resource must validate
tokens. TTLs are sized against the maximum expected hold time plus a safety
margin, renewal runs on a short interval (about TTL/3), and the monitor reclaims
expired locks only after a grace period so the final renewal is not lost to
clock skew between nodes. For very short critical sections, a single-round-trip
acquire with a generous TTL and no renewal is often safer than renewal logic,
because it removes the renewal failure mode entirely at the cost of a longer
recovery when a holder does pause.

### Q: How do you make locks fair and starvation-free?

Naive acquire loops — try every 50ms until success — are deeply unfair: a fast
retryer can overtake a long waiter, and under contention bursts of retries make
the lock effectively random, so a persistent loser starves. The standard fix is
a wait queue with FIFO handoff. Each contender registers in a per-lock queue and
acquires only when it reaches the head; the current holder hands off to the next
waiter on release instead of letting a free-for-all scramble for the key. etcd
and ZooKeeper support this natively via sequential keys; in Redis a sorted set
or list per lock key plays the same role, with the waiter that owns the lowest
sequence number going next.

Fairness still has to interact with leases. A waiter at the head of the queue
must not be starved by an infinitely renewing holder, so the queue enforces a
maximum hold time and preemption: the head waiter is granted after the current
lease expires regardless of renewal. Clients also need timeouts — a bounded wait
beyond which they give up — and the API offers a non-blocking acquire with a
bounded retry policy for callers that cannot block on a queue, because every
waiter ties up a thread or connection. Fairness is ultimately a queueing
property, which means the queue itself must be consistent: a queue lost in a
failover must be rebuilt deterministically, or the fairness guarantee quietly
degrades to the very retry race the design set out to eliminate.

### Q: How do you protect against split-brain failures?

Split brain occurs when two nodes both believe they hold the lock — either
because the store itself divided, or because a network partition isolated
clients from the store and both sides acted on stale knowledge. The first
defense is to centralize the decision in a store that cannot serve two winners:
a single Redis master, or a quorum-based system such as etcd or ZooKeeper that
only commits when a majority of nodes acknowledge. A client partitioned away
from the store must fail to acquire rather than assume success, and a holder
must stop doing work when its heartbeat can no longer renew — the design chooses
safety over availability in the moment of uncertainty.

The deeper defense is fencing tokens, as described above: even under a genuine
split, the resource accepts writes only from the current token, so a stale
partition cannot corrupt state no matter how confused the lock holders are. For
Redis specifically, the widely discussed caveat is that a lone master can fail
over and resurrect a lost lock; quorum schemes such as Redlock reduce but do not
eliminate this, and many designs accept the residual risk because fencing tokens
make a stale holder harmless anyway. The lease mechanism is the final clock-skew
guard: TTLs are checked against server time with skew tolerances, and renewal
grace periods absorb short partitions. Monitoring detects unreachable holders
and force-expires their locks only after both the lease and a leader-determined
grace period have elapsed.

## Source

```text
title: Distributed Lock
node client: Client [round, icon=browser]
node api: Lock API [icon=server]
node backend: Lock Store [cylinder, icon=database]
node lease: Lease Manager [icon=compute]
node fencing: Fencing Tokens [icon=shield]
node wait: Wait Queue [icon=queue]
node heartbeat: Heartbeat [icon=sync]
node monitor: Monitor [icon=worker]
node audit: Audit Log [icon=file]

edge client -> api: acquire
edge api -> backend: try lock
edge backend -> api: grant
edge api -> lease: ttl
edge client -> heartbeat: renew
edge heartbeat -> backend: refresh
edge api -> fencing: token
edge api -> wait: queue
edge client -> api: release
edge api -> audit: record
edge monitor -> backend: expire
```

## Source

```text
title: Distributed Lock
node client: Client [round, icon=browser]
node api: Lock API [icon=server]
node backend: Lock Store [cylinder, icon=database]
node lease: Lease Manager [icon=compute]
node fencing: Fencing Tokens [icon=shield]
node wait: Wait Queue [icon=queue]
node heartbeat: Heartbeat [icon=sync]
node monitor: Monitor [icon=worker]
node audit: Audit Log [icon=file]

edge client -> api: acquire
edge api -> backend: try lock
edge backend -> api: grant
edge api -> lease: ttl
edge client -> heartbeat: renew
edge heartbeat -> backend: refresh
edge api -> fencing: token
edge api -> wait: queue
edge client -> api: release
edge api -> audit: record
edge monitor -> backend: expire
```
