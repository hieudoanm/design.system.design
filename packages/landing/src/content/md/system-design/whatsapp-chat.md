# WhatsApp — Chat

Design WhatsApp / a chat application

**Difficulty:** Easy

**Tags:** messaging, mobile, queue, realtime

## Functional Requirements

- WhatsApp / a chat application
- deliver messages reliably (at-least-once vs exactly-once)?
- support large group chats?
- scale persistent WebSocket connections?
- presence (online/typing) status at scale

## Non-Functional Requirements

- At-least-once is the pragmatic default for chat.

- Persist the message durably first, then deliver.
- If a delivery attempt fails or times out, retry.
- The recipient deduplicates by message ID (each message carries a
  server-assigned globally unique ID), which makes retries harmless.
- Exactly-once requires end-to-end deduplication plus exactly-once
  acknowledgment and is overkill for chat UX — a duplicate message is far
  cheaper than a lost one.
- To avoid out-of-order delivery, each recipient keeps a monotonically
  increasing sequence number per conversation.
- The client reorders or requests a gap-fill on reconnect.
- In practice you pair at-least-once transport with idempotent consumers: the
  message store is the single source of truth.
- Sockets deliver a cursor the client can use to recover anything missed while
  offline..
- Make the gateway tier stateless and horizontally scalable so the only thing
  bound to a connection is the socket itself.

- Each gateway holds a map of live sockets and registers the socket location
  (`gateway-id`, `connection-id`) in a shared presence/registry service (Redis).
- To deliver a message, the delivery layer looks up the recipient's registered
  gateway and forwards the payload over an internal RPC bus.
- The gateway then pushes to the socket.
- Balance the load with sticky routing and heartbeat pings to detect dead
  connections, with a configurable idle timeout.
- If a gateway dies, its connections drop and clients reconnect to any healthy
  gateway, re-syncing missed messages by cursor from the message store.
- Because no per-connection state lives in shared memory, you scale out by
  adding gateway instances behind an L7 load balancer..
- once per few
  seconds), and auto-expire if the user stops typing.
- For a chat with many online users, do not write every heartbeat to disk —
  batch and age out stale entries.
- Client-side, every viewer subscribes to the presence channel of the users
  they're chatting with.
- The server pushes only deltas (a user went online/offline).
- Final state for the "last seen" label is persisted asynchronously (periodic or
  on-signal flush) so the hot path stays in-memory.
- Write-heavy presence never scales with the chat workload.

## Source

````text
title: WhatsApp Chat
node client: Client [round, icon=browser]
node gateway: WS Gateway [icon=server]
node chat: Chat Service [icon=message]
node queue: Message Queue [icon=queue]
node presence: Presence Service [icon=users]
node group: Group Service [icon=users]
node media: Media Service [icon=file]
node notify: Notifications [icon=mail]
node db: Messages DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> gateway: connect
edge gateway -> presence: online status
edge client -> gateway: send message
edge gateway -> chat: route
edge chat -> queue: enqueue
edge chat -> db: persist
edge queue -> gateway: deliver to peers
edge client -> gateway: read receipts
edge gateway -> notify: offline alert
edge chat -> group: broadcast
edge group -> queue: fan out
edge client -> media: attach
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: WhatsApp Chat
client: Client
gateway: WS Gateway
chat: Chat Service
queue: Message Queue
presence: Presence Service
group: Group Service
media: Media Service
notify: Notifications
db: Messages DB
cache: Session Cache

client ─► gateway ─► connect
gateway ─► presence ─► online status
client ─► gateway ─► send message
gateway ─► chat ─► route
chat ─► queue ─► enqueue
chat ─► db ─► persist
queue ─► gateway ─► deliver to peers
client ─► gateway ─► read receipts
gateway ─► notify ─► offline alert
chat ─► group ─► broadcast
group ─► queue ─► fan out
client ─► media ─► attach
````

## Design

### Design WhatsApp / a chat application

Start with the messaging primitives: a 1:1 chat, group chats, and a global event
stream.

- Clients hold a persistent WebSocket connection to a stateless gateway layer
  that authenticates on connect and routes messages to the appropriate backend.
- The chat service persists every message to a durable store and enqueues it for
  delivery.
- An outbound delivery worker fans the message out to the online recipient's
  gateway so it can push over the live socket.
- Offline recipients are served by push notifications and by pulling missed
  messages (a sync cursor / sequence number) on reconnect.
- Media is uploaded to blob storage and referenced by ID in the message so the
  message bus stays small.
- Key scaling levers are sharding the message store by conversation, keeping
  connection state (which gateway a user is on) in Redis, and making the gateway
  layer horizontally scalable and stateless.

### How do you deliver messages reliably (at-least-once vs exactly-once)?

At-least-once is the pragmatic default for chat.

- Persist the message durably first, then deliver.
- If a delivery attempt fails or times out, retry.
- The recipient deduplicates by message ID (each message carries a
  server-assigned globally unique ID), which makes retries harmless.
- Exactly-once requires end-to-end deduplication plus exactly-once
  acknowledgment and is overkill for chat UX — a duplicate message is far
  cheaper than a lost one.
- To avoid out-of-order delivery, each recipient keeps a monotonically
  increasing sequence number per conversation.
- The client reorders or requests a gap-fill on reconnect.
- In practice you pair at-least-once transport with idempotent consumers: the
  message store is the single source of truth.
- Sockets deliver a cursor the client can use to recover anything missed while
  offline.

### How do you support large group chats?

Large groups (thousands of members) break naive fan-out: copying the message to
every member's inbox is too expensive. Use hybrid fan-out.

- For groups under a threshold (e.g. 1,000 members), write the message once to
  the group thread and push a copy to each online member's delivery queue.
- Store a single row in the group's inbox so members can sync by cursor.
- For very large groups, store the message once per group and have members pull
  it (pagination by message index) with a real-time notification.
- This is the "read-only follower" pattern.
- Cap group size (WhatsApp caps at 1,024) and shard group membership by group
  ID.
- Admins-only broadcast messages are handled by the same pull path.
- The cursor / sequence number per member is what lets both models reconcile
  with the delivery queue.

### How do you scale persistent WebSocket connections?

Make the gateway tier stateless and horizontally scalable so the only thing
bound to a connection is the socket itself.

- Each gateway holds a map of live sockets and registers the socket location
  (`gateway-id`, `connection-id`) in a shared presence/registry service (Redis).
- To deliver a message, the delivery layer looks up the recipient's registered
  gateway and forwards the payload over an internal RPC bus.
- The gateway then pushes to the socket.
- Balance the load with sticky routing and heartbeat pings to detect dead
  connections, with a configurable idle timeout.
- If a gateway dies, its connections drop and clients reconnect to any healthy
  gateway, re-syncing missed messages by cursor from the message store.
- Because no per-connection state lives in shared memory, you scale out by
  adding gateway instances behind an L7 load balancer.

### Design presence (online/typing) status at scale

Presence is a high-frequency, ephemeral signal, so keep it out of the main
database.

- On connect/disconnect the gateway updates a presence set in Redis (e.g. a
  sorted set keyed by user with a heartbeat timestamp).
- Typing indicators are more transient than "online" and should be broadcast to
  only the current conversation participants, throttled (e.g. once per few
  seconds), and auto-expire if the user stops typing.
- For a chat with many online users, do not write every heartbeat to disk —
  batch and age out stale entries.
- Client-side, every viewer subscribes to the presence channel of the users
  they're chatting with.
- The server pushes only deltas (a user went online/offline).
- Final state for the "last seen" label is persisted asynchronously (periodic or
  on-signal flush) so the hot path stays in-memory.
- Write-heavy presence never scales with the chat workload.

## Source

```text
title: WhatsApp Chat
node client: Client [round, icon=browser]
node gateway: WS Gateway [icon=server]
node chat: Chat Service [icon=message]
node queue: Message Queue [icon=queue]
node presence: Presence Service [icon=users]
node group: Group Service [icon=users]
node media: Media Service [icon=file]
node notify: Notifications [icon=mail]
node db: Messages DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> gateway: connect
edge gateway -> presence: online status
edge client -> gateway: send message
edge gateway -> chat: route
edge chat -> queue: enqueue
edge chat -> db: persist
edge queue -> gateway: deliver to peers
edge client -> gateway: read receipts
edge gateway -> notify: offline alert
edge chat -> group: broadcast
edge group -> queue: fan out
edge client -> media: attach
```

## Q&A

### Q: Design WhatsApp / a chat application

**A:** Start with the messaging primitives: a 1:1 chat, group chats, and a global event
stream.

- Clients hold a persistent WebSocket connection to a stateless gateway layer
  that authenticates on connect and routes messages to the appropriate backend.
- The chat service persists every message to a durable store and enqueues it for
  delivery.
- An outbound delivery worker fans the message out to the online recipient's
  gateway so it can push over the live socket.
- Offline recipients are served by push notifications and by pulling missed
  messages (a sync cursor / sequence number) on reconnect.
- Media is uploaded to blob storage and referenced by ID in the message so the
  message bus stays small.
- Key scaling levers are sharding the message store by conversation, keeping
  connection state (which gateway a user is on) in Redis, and making the gateway
  layer horizontally scalable and stateless.

### Q: How do you deliver messages reliably (at-least-once vs exactly-once)?

**A:** At-least-once is the pragmatic default for chat.

- Persist the message durably first, then deliver.
- If a delivery attempt fails or times out, retry.
- The recipient deduplicates by message ID (each message carries a
  server-assigned globally unique ID), which makes retries harmless.
- Exactly-once requires end-to-end deduplication plus exactly-once
  acknowledgment and is overkill for chat UX — a duplicate message is far
  cheaper than a lost one.
- To avoid out-of-order delivery, each recipient keeps a monotonically
  increasing sequence number per conversation.
- The client reorders or requests a gap-fill on reconnect.
- In practice you pair at-least-once transport with idempotent consumers: the
  message store is the single source of truth.
- Sockets deliver a cursor the client can use to recover anything missed while
  offline.

### Q: How do you support large group chats?

**A:** Large groups (thousands of members) break naive fan-out: copying the message to
every member's inbox is too expensive. Use hybrid fan-out.

- For groups under a threshold (e.g. 1,000 members), write the message once to
  the group thread and push a copy to each online member's delivery queue.
- Store a single row in the group's inbox so members can sync by cursor.
- For very large groups, store the message once per group and have members pull
  it (pagination by message index) with a real-time notification.
- This is the "read-only follower" pattern.
- Cap group size (WhatsApp caps at 1,024) and shard group membership by group
  ID.
- Admins-only broadcast messages are handled by the same pull path.
- The cursor / sequence number per member is what lets both models reconcile
  with the delivery queue.

### Q: How do you scale persistent WebSocket connections?

**A:** Make the gateway tier stateless and horizontally scalable so the only thing
bound to a connection is the socket itself.

- Each gateway holds a map of live sockets and registers the socket location
  (`gateway-id`, `connection-id`) in a shared presence/registry service (Redis).
- To deliver a message, the delivery layer looks up the recipient's registered
  gateway and forwards the payload over an internal RPC bus.
- The gateway then pushes to the socket.
- Balance the load with sticky routing and heartbeat pings to detect dead
  connections, with a configurable idle timeout.
- If a gateway dies, its connections drop and clients reconnect to any healthy
  gateway, re-syncing missed messages by cursor from the message store.
- Because no per-connection state lives in shared memory, you scale out by
  adding gateway instances behind an L7 load balancer.

### Q: Design presence (online/typing) status at scale

**A:** Presence is a high-frequency, ephemeral signal, so keep it out of the main
database.

- On connect/disconnect the gateway updates a presence set in Redis (e.g. a
  sorted set keyed by user with a heartbeat timestamp).
- Typing indicators are more transient than "online" and should be broadcast to
  only the current conversation participants, throttled (e.g. once per few
  seconds), and auto-expire if the user stops typing.
- For a chat with many online users, do not write every heartbeat to disk —
  batch and age out stale entries.
- Client-side, every viewer subscribes to the presence channel of the users
  they're chatting with.
- The server pushes only deltas (a user went online/offline).
- Final state for the "last seen" label is persisted asynchronously (periodic or
  on-signal flush) so the hot path stays in-memory.
- Write-heavy presence never scales with the chat workload.

## Source

```text
title: WhatsApp Chat
node client: Client [round, icon=browser]
node gateway: WS Gateway [icon=server]
node chat: Chat Service [icon=message]
node queue: Message Queue [icon=queue]
node presence: Presence Service [icon=users]
node group: Group Service [icon=users]
node media: Media Service [icon=file]
node notify: Notifications [icon=mail]
node db: Messages DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> gateway: connect
edge gateway -> presence: online status
edge client -> gateway: send message
edge gateway -> chat: route
edge chat -> queue: enqueue
edge chat -> db: persist
edge queue -> gateway: deliver to peers
edge client -> gateway: read receipts
edge gateway -> notify: offline alert
edge chat -> group: broadcast
edge group -> queue: fan out
edge client -> media: attach
```
