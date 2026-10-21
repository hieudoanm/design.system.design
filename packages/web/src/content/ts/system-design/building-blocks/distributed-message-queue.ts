import type { Problem } from '../types';

export const distributedMessageQueue: Problem = {
  slug: 'distributed-message-queue',
  title: 'Distributed message queue',
  tagline:
    'Build a Kafka-like log: partitioned, replicated, with consumer groups and exactly-once semantics.',
  difficulty: 'Hard',
  tags: ['Partitioned log', 'Consumer groups', 'Replication', 'Exactly-once'],
  group: 'building-blocks',
  functional: [
    'Producers append messages to topics (partitioned by key).',
    'Consumers read in consumer groups (each partition → one consumer).',
    'Message retention: time-based (7 days) or size-based (1 TB).',
    'Exactly-once semantics: idempotent producers + transactional consumers.',
    'Replication factor 3; ISR (in-sync replicas) for durability.',
  ],
  nonFunctional: [
    'p99 produce latency under 10 ms.',
    'Throughput: 10 MB/sec/partition, 1M msg/sec/broker.',
    'Zero data loss: ack=all waits for ISR.',
    'Consumer lag monitoring and alerting.',
  ],
  estimation: [
    '100 topics, 100 partitions each = 10K partitions.',
    '3 brokers × 10 TB = 30 TB raw. 10K partitions × 3 replicas = 30K partition replicas.',
    'Retention: 7 days × 100 GB/day = 700 GB per topic average.',
    'Consumer group rebalance: < 30 sec for 1K consumers.',
  ],
  diagram: `flowchart LR
  subgraph PRODUCER [Producer]
    PROD[Producers] --> CLUSTER[Broker cluster]
  end
  subgraph CLUSTER [Broker cluster]
    CLUSTER --> LOG[Partition log]
    LOG --> REP[Replicas (ISR)]
  end
  subgraph CONSUMER [Consumer]
    LOG --> CG[Consumer group] --> CONS[Consumers]
    CG --> OFFSET[Offset store]
  end`,
  design: [
    {
      title: 'Partitioned log',
      body: 'A topic is split into partitions. Each partition is an append-only log of messages with offsets. The partition key (hash of message key) determines partition assignment. Ordering is guaranteed per partition. Partitions are distributed across brokers for parallelism.',
    },
    {
      title: 'Replication and ISR',
      body: 'Each partition has N replicas (default 3). One is the leader; followers replicate from the leader. The ISR (in-sync replicas) are followers caught up to the leader. `acks=all` means the leader waits for all ISR replicas to acknowledge before responding to the producer. If a follower falls behind, it is removed from ISR; if the leader fails, a new leader is elected from ISR.',
    },
    {
      title: 'Consumer groups',
      body: 'Consumers form a group. Each partition is assigned to exactly one consumer in the group. The group coordinator (a broker) manages assignment via a protocol (range, round-robin, sticky). On rebalance (consumer join/leave), partitions are reassigned. Consumers commit offsets to a special `__consumer_offsets` topic (compacted).',
    },
    {
      title: 'Exactly-once semantics',
      body: 'Idempotent producer: each message gets a PID + sequence number per partition. The broker deduplicates on receipt. Transactional producer: `beginTransaction`, `send` (multiple partitions), `commitTransaction` — all or nothing. Transactional consumer: read-process-write in a single transaction (consume-transform-produce). The offset commit is part of the transaction.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a slow consumer?',
      a: 'Monitor consumer lag (high-water-mark - committed-offset). Alert if lag > threshold. Scale the consumer group (add consumers) or increase partition count (requires topic re-partitioning). Dead letter queue for poison pills.',
    },
    {
      q: 'What if a broker loses its disk?',
      a: 'The broker restarts, fetches missing data from ISR replicas (if any), or replicates from the new leader. If no ISR replicas (catastrophic), the partition is under-replicated until the broker catches up. Data loss only if all replicas lost simultaneously.',
    },
    {
      q: 'How do you implement delayed/retry queues?',
      a: 'Use a separate retry topic with a TTL header. A delayed consumer reads from the main topic, writes to the retry topic with a timestamp. A timer service (or Kafka Streams) moves messages back to the main topic when the delay expires. Or use a plugin like Kafka Delayed Operations.',
    },
  ],
};
