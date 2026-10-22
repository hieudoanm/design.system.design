import type { Problem } from './types';

export const distributedMessageQueue: Problem = {
  slug: 'distributed-message-queue',
  title: 'Message queue',
  tagline: 'A durable, ordered log that producers write to and consumer groups read from.',
  difficulty: 'Medium',
  tags: ['distributed', 'messaging', 'queue'],
  group: 'building-blocks',
  functional: [
    'Publish a message to a topic.',
    'Subscribe as a consumer group and read in partition order.',
    'Replay from a stored offset.',
    'Move poison messages to a dead-letter queue.',
  ],
  nonFunctional: [
    'An acknowledged message survives the loss of a broker.',
    'Ordering holds within a partition, not across partitions.',
    'Publish stays under 10 ms p99 at millions of messages per second.',
    'Consumers scale out by adding partitions and instances.',
  ],
  estimation: [
    '1M messages per second at 1 KB is 1 GB per second in, about 3 GB per second with three replicas.',
    'Seven days of retention at 1 GB per second is about 600 TB.',
    'A topic of 100 partitions at 10 MB per second each is 1 GB per second.',
    '100 consumers on a 1M per second topic each handle 10k messages per second.',
  ],
  diagram: ` Producers ─► Broker cluster ─► Partition log (append-only, replicated)
                                   │
                                   └─► Consumer group ─► Consumers (commit offsets)
                                             │
                                             └─► Offset store

 Coordinator ─► membership, rebalance
 Broker ─► Dead letter queue (poison messages)`,
  design: [
    {
      title: 'Overview',
      body: "At its core a Kafka-style queue is an append-only, ordered log.\n\n- Producers publish records to a named topic, which is split into ordered partitions, each hosted on exactly one broker in a broker cluster.\n- Partitions are the unit of parallelism and replication: each is copied to several brokers (leader/follower) for durability, and a coordinator manages cluster metadata (ZooKeeper or KRaft), assigns partitions to brokers, and tracks consumer group membership.\n- The coordinator also elects a leader for each partition and maintains a set of in-sync replicas (ISR) — replicas current enough to take over seamlessly.\n\nOn the write path, a producer first queries the coordinator to discover which broker leads each partition, then sends batched records to the leader, which appends them to the partition log and replicates to followers before acknowledging according to the `acks` setting.\n\n- Each appended record receives a monotonically increasing `offset` — its position in the log.\n- Consumers subscribe within a consumer group: each partition is consumed by exactly one group member, which reads sequentially and periodically commits its offset so it can resume after a crash.\n- Records are immutable; retention is time- or size-based.\n\nThe data model is a hierarchy: topic → partition → record `(key, value, headers, timestamp, offset)`.\n\n- A producer's key hashes to a partition, which is how ordering-by-key and parallelism are obtained; throughput is bounded by partition count, so you size partitions up front for the peak write rate and the consumer parallelism you plan to run.\n- Kafka deliberately trades per-record indexing for sequential I/O — brokers never index individual messages, relying on the OS page cache and read-ahead for throughput — which makes random access to one message slow.\n- Failure handling: when a leader dies, a follower from the ISR is elected, lagging replicas are excluded from the ISR and cannot become leader, and records that exceed retry limits are diverted to a dead letter queue so a poison message never stalls a consumer.",
    },
  ],
  qa: [
    {
      q: 'How do you guarantee ordering within a partition?',
      a: "Ordering exists only within a partition, and it is a total order.\n\n- A producer hashes its key to a partition, so all records sharing that key land in the same partition, and the leader appends them to the log in arrival order, assigning sequential offsets.\n- A consumer reads a partition strictly sequentially with a single thread, so it observes records in exactly the order the leader wrote them.\n- This makes the partition the natural place to implement per-entity ordering: in a payment pipeline, all events for one order carry the same key and are therefore processed in order.\n\nPreserving that order end to end means batching and retries must never reorder.\n\n- With an idempotent producer, the broker tracks a producer ID and per-partition sequence numbers, so retried batches are deduplicated and are inserted into the log before any later batch — a retry can never land after a subsequent record.\n- The broker also refuses concurrent in-flight requests to the same partition unless idempotence is disabled, which forces the producer to serialize writes per partition.\n- On the read side, a consumer that commits offset N has already processed every offset `< N`, so a restart replays only from the committed offset; records are immutable, so a re-read yields identical data.\n\nThe price of ordering is parallelism.\n\n- If you need a global order across all keys you must use a single-partition topic, which caps throughput at one broker's sequential write rate.\n- Ordering and scale are in direct tension: partitions enable parallel writes and reads, and any cross-partition order is lost.\n- The standard design therefore guarantees order per key, within a partition, with the consumer group enforcing exactly one member per partition, and you never parallelize consumption inside a partition when order matters.\n- If a consumer later needs to repartition state (for example, joining by key), you rebuild it from a compacted changelog topic rather than reordering the primary log.",
    },
    {
      q: 'How do you ensure durability and replay (offsets)?',
      a: 'Durability has two layers: the leader\'s local log and replication.\n\n- With `acks=all`, the leader waits until every in-sync replica has persisted a batch before acknowledging the producer, so an acknowledged record survives any single-broker crash; a follower from the ISR is promoted in its place.\n- Replication factor 3 spread across failure domains is the standard posture.\n- The partition log itself is immutable and write-sequential — records are appended, never edited — and retention is time- or size-based, which is exactly what makes replay possible: nothing is purged before the retention window says so.\n\nReplay is built on offsets.\n\n- Every record has a stable offset within its partition log, and consumers commit checkpoints of the offset they last finished processing, stored in a compacted internal topic (`__consumer_offsets`).\n- On restart or partition reassignment, the consumer seeks to its committed offset and re-reads from there; because the log is immutable, the re-read yields the same records.\n- Commit timing defines the semantics: commit after processing, and a crash between processing and commit redelivers (at-least-once, duplicates possible); commit before processing, and a crash loses records (at-most-once).\n- Most systems choose at-least-once and make consumers idempotent so duplicates are harmless.\n\nFor long-lived streams, retention interacts with replay.\n\n- Once the log trims old segments, you cannot seek before the retained offset, so the replay window is bounded by retention settings.\n- For high-churn keys, log compaction replaces pure time/size retention — the log keeps at least the latest value per key, giving an effective "current state" stream you can replay.\n- Operationally, a replica that falls too far behind re-syncs from a snapshot rather than replaying the whole log, and consumers should be tested against rebalancing: seeking to the committed offset after a partition move is the mechanism that prevents both loss and duplication across handovers.',
    },
    {
      q: 'How do consumers scale and handle rebalancing?',
      a: "Consumers join a consumer group, and the coordinator assigns each partition to exactly one member.\n\n- That yields the scaling model: throughput scales as partitions × consumers, because each partition is consumed by a single thread, and you add consumers up to the partition count — beyond it they idle.\n- Note the log/queue distinction: records are not deleted after reading, so many groups can read the same topic independently (pub/sub), while within one group the partition assignment makes it a work stream.\n- Partitions are therefore sized up front for both peak write rate and the consumer parallelism you plan to run.\n\nRebalancing occurs when a member joins, leaves, stalls, or crashes.\n\n- The coordinator detects failure via heartbeats and a session timeout, computes a new assignment, and tells members to revoke and re-acquire partitions.\n- The classic eager protocol stops the whole group and re-reads, which is disruptive when membership churns; cooperative-sticky rebalancing reassigns only the partitions that changed, letting everyone else keep consuming.\n- Members commit offsets before revoking and seek to the committed offset on reassignment, so no partition loses or duplicates records across the handover — at-least-once, with the rare overlap absorbed by idempotent consumers.\n\nOperationally, the pitfalls are self-inflicted rebalances.\n\n- Consumers that take longer than `max.poll.interval.ms` between polls are considered dead, triggering churn; too many consumers, noisy membership, or slow batch processing cause constant rebalancing that stalls the whole group.\n- Monitor rebalance frequency and consumer lag, and prefer the cooperative-sticky assignor when rebalances are frequent.\n- Ordering is preserved during a rebalance because a partition is never assigned to two members at once — the coordinator's assignment is a strict one-to-one mapping, and any transition keeps one member responsible until the other has revoked.",
    },
    {
      q: 'How do you handle at-least-once vs exactly-once semantics?',
      a: "By default Kafka delivers at-least-once.\n\n- A consumer that commits after processing re-reads from the committed offset, so a crash mid-batch redelivers records.\n- Exactly-once requires both sides.\n- On the producer side, enable idempotent producers: each batch carries a producer ID and sequence number, so the broker dedupes retried batches and writes each record once — exactly-once within a single partition.\n- To extend this across a pipeline, use transactions (KIP-98): the producer marks a transactional batch, consumers read only committed transactions, and the consumer's offset commit and its processing results land in the same transaction, so a crash cannot desync what was processed from what was committed.\n\nThose tools make exactly-once possible only within a Kafka-to-Kafka pipeline.\n\n- The moment a consumer writes to an external store, exactly-once becomes an end-to-end distributed transaction problem: you need idempotency keys in the sink, or you must write the record and the consumer state together in the target database.\n- The pragmatic answer is to design for at-least-once end to end, keep consumers idempotent, and retain an audit trail so duplicates are detectable and safe — reserving Kafka transactions for the small set of flows that truly need them.",
    },
  ],
};
