import type { Problem } from '../types';

export const chatSystem: Problem = {
  slug: 'chat-system',
  title: 'Chat system',
  tagline: 'Build a real-time messaging system with 1:1, groups, presence, and message history.',
  difficulty: 'Medium',
  tags: ['WebSocket', 'Message ordering', 'Presence', 'Push notifications'],
  group: 'collaboration-commerce',
  functional: [
    'Send/receive text, images, files in 1:1 and group chats (up to 500 members).',
    'Message ordering and deduplication.',
    'Online/offline presence with last-seen.',
    'Push notifications for offline users.',
    'Message search and history pagination.',
  ],
  nonFunctional: [
    'Message delivery latency p99 under 200 ms.',
    'Support 10M concurrent connections.',
    'Message durability: no loss on server restart.',
    'Presence updates propagated within 2 seconds.',
  ],
  estimation: [
    '10M DAU, 1B messages/day = 11.5K msg/sec average, 100K/sec peak.',
    'WebSocket connections: 10M persistent. 1 connection per session.',
    'Message store: 1B msgs/day × 1 KB = 1 TB/day. Wide-column (Cassandra/Scylla).',
    'Presence: 10M users × 100 bytes = 1 GB in Redis.',
  ],
  diagram: `flowchart LR
  subgraph SEND [Send path]
    CA[Client A] --> WS[WebSocket gateway] --> MSG[Message service] --> MSTORE[(Message store)]
    MSG --> KAFKA[Kafka]
  end
  subgraph RECV [Receive path]
    KAFKA --> FANOUT[Fanout workers] --> WS2[WebSocket gateway] --> CB[Client B]
    KAFKA --> PUSH[Push notifications] --> OFFLINE[Offline users]
  end
  subgraph PRESENCE [Presence]
    CA -.-> PRES[Presence service] --> REG[Session registry]
    REG -.-> CB
  end`,
  design: [
    {
      title: 'WebSocket gateway',
      body: 'Stateless gateway fleet behind a load balancer. Each connection maps to a gateway instance (stored in Redis: `user_id → gateway_id`). The gateway handles auth, heartbeats, and message framing. Horizontal scaling adds gateway instances. Connection drain on deploy.',
    },
    {
      title: 'Message ordering and durability',
      body: 'The message service assigns a monotonic sequence ID per conversation (using a per-conversation counter in Redis or a snowflake ID). It writes to the message store (wide-column: partition by conversation_id, cluster by timestamp) and publishes to Kafka. Kafka provides the ordered log for fan-out and replay. Exactly-once semantics: deduplicate on client-side using message IDs.',
    },
    {
      title: 'Fan-out and push',
      body: 'Fan-out workers consume from Kafka per conversation. For each message, they look up online recipients from the session registry and push via their WebSocket gateway. Offline recipients get a push notification (FCM/APNs). The push payload includes a summary; the client fetches full history on app open.',
    },
    {
      title: 'Presence',
      body: 'The presence service tracks `user_id → {status, last_seen, device_id}`. Status: online, away, offline. Heartbeats every 30 sec; missed 2 heartbeats → away; missed 5 → offline. Status changes are published to Kafka; fan-out workers push presence updates to relevant conversation participants.',
    },
  ],
  qa: [
    {
      q: 'How do you handle message ordering in group chats?',
      a: 'Single-writer per conversation: the message service is the sequencer. It assigns the sequence ID before writing. All recipients see the same order. For multi-region, use a global sequencer (for example, Spanner) or accept eventual consistency with conflict resolution.',
    },
    {
      q: 'What if a user has multiple devices?',
      a: 'Each device has a separate WebSocket connection and session entry. Messages are fanned out to all online devices. Presence is per-user (aggregate of devices). Read receipts are per-device.',
    },
    {
      q: 'How do you scale to 10M connections?',
      a: 'Stateless gateways + Redis session registry. Each gateway handles ~50K connections. Auto-scale on connection count. Use a connection pool for upstream services. Monitor gateway CPU/memory and connection latency.',
    },
  ],
};
