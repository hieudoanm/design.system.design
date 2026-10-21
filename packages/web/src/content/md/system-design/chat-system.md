# Chat system

Real-time one-to-one and group messaging with delivery guarantees, presence and history.

**Difficulty:** Hard

**Tags:** WebSockets, Ordering, Presence

## Functional Requirements

- One-to-one and group chat (up to a few hundred members).
- Online and offline presence.
- Message history that syncs across a user's devices.
- Delivery and read receipts.
- Media attachments, stored in a blob store and sent as links.

## Non-Functional Requirements

- Delivery in under about 200 ms for online users.
- Messages in a conversation appear in the same order for everyone.
- No lost messages. Duplicates are removed.
- Highly available at billions of messages per day.

## Estimation

- 500M daily users sending 40 messages each is 20B messages per day, about 230k per second.
- At about 100 bytes of text each that is roughly 2 TB per day, before indexes and replication.

## Architecture Diagram

```
 Client A ◄═ WebSocket ═► Chat gateway ─► Message service ─► Message store
                                 │  ▲                │             (wide-column)
           Session registry ◄────┘  │                │
           (user ─► gateway)        │                ├─► Kafka ─► Push notifications
                                    │                │            (offline users)
  Client B ◄═ WebSocket ═► Chat gateway ◄────────────┘
                                    ▲
                   Presence service (heartbeats with TTL)
```

## Design

### Connections

Clients keep a persistent **WebSocket** to a stateful chat gateway, which allows the server to push messages instantly. Gateways are scaled horizontally, and a session registry (Redis) records which gateway each user is connected to. Long polling is the fallback for networks that block WebSockets.

### Sending a message

The sender's gateway passes the message to the message service. It assigns a per-conversation sequence number, persists the message, and looks up the recipient's gateway in the session registry to push it. If the recipient is offline, a push notification goes out and the message waits in storage. When the client reconnects it asks for everything after the last sequence number it has seen.

### Storage

Messages fit a wide-column store such as Cassandra or HBase: partition by conversation ID, order by message ID (a time-ordered ID like Snowflake). Reading recent history is then a single-partition range scan. Keep users, groups and settings in a relational database.

### Group chat

For small groups, write one copy of the message and deliver it to each member's connection, or write to each member's inbox. For very large groups, keep one shared log per group and let members pull from it, since writing to thousands of inboxes is too costly.

### Presence

Clients send periodic heartbeats. The presence service stores a short-lived key per user, so an expired key means offline. Only publish changes to people who care (contacts viewing the user), and debounce brief disconnects so presence does not flicker.

## Q&A

### Q: WebSockets, long polling or server-sent events?

**A:** Chat needs two-way, low-latency traffic, so WebSockets are the usual choice. Long polling works everywhere but wastes requests. Server-sent events are one-way (server to client) and would still need a separate path for sending.

### Q: How do you guarantee message order?

**A:** Assign a monotonically increasing sequence number per conversation at a single writer, such as the partition leader for that conversation. Clients sort by that number, not by their local clock. Global ordering is unnecessary.

### Q: How do you avoid lost or duplicated messages?

**A:** Use acknowledgements at each hop and have the client retry until acknowledged. Give each message a client-generated ID so retries are idempotent: the server stores it once and ignores repeats. That gives at-least-once delivery with deduplication.

### Q: How do offline users and multiple devices work?

**A:** Store messages durably, and track the last message each device has received. On reconnect, a device fetches everything after its cursor. Push notifications wake the app, and the notification itself is not the source of truth.

### Q: How do you scale presence?

**A:** Heartbeats with a TTL in Redis keep it cheap, and the fan-out is the real cost. Send updates only to online contacts who are looking at that user, batch them, and fetch presence on demand for large groups rather than pushing every change.

### Q: How would end-to-end encryption change the design?

**A:** The server stores and relays only ciphertext, so it cannot read or search messages. Clients exchange keys (for example with the Signal protocol), and group chats need key management when members join or leave. Features that need server-side content, such as search and spam filtering, must move to the client.
