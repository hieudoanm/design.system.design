# Discord — Chat & Voice

Design a real-time chat and voice application

**Difficulty:** Medium

**Tags:** event-driven, messaging, realtime

## Functional Requirements

- a real-time chat and voice application
- deliver messages with low latency at scale?
- scale presence across many servers?
- route voice without jitter?
- handle server partitions and failover?

## Non-Functional Requirements

- The system is built around persistent, real-time connections plus durable
  storage.

- Every client opens a long-lived WebSocket to a gateway, which authenticates
  the session and routes all live events — messages, presence, typing
  indicators.
- Messages are handled by a message service: a send is persisted to a messages
  DB, indexed for search, cached for recent reads, and fanned out to everyone
  connected to the target channel/room via the gateways.
- Voice is a parallel path: clients connect to a voice service, which relays
  audio through a media relay network, minimizing jitter and latency.
- A room service tracks channel/room membership so fan-out knows the recipient
  set, and a presence service maintains who is online and in which room.

The architecture separates connection state from application state.

- Gateways are pure connection endpoints — they hold sockets and route events
  but keep no durable data, so they can be drained and replaced freely.
- The message service, room service, and presence store are the source of truth
  and are sharded (typically by room or guild) so hot rooms stay on warm shards.
- Delivery is eventually consistent but ordered per channel: every message gets
  a monotonic sequence per channel, and clients render from the sequence so no
  reordering artifacts appear.
- Durability is shallow for live state (presence, typing) — it dies with the
  connection — while messages are durable and replayable, so a client that
  reconnects pulls a gap-free history..
- Latency is dominated by fan-out, so the design minimizes hops between the author
  and each recipient.

- When a message is sent, the gateway publishes it to a per-channel topic.
- A fan-out layer — a small set of delivery nodes per channel — receives it once
  and pushes to all connected clients in that channel, while the message service
  persists it in parallel.
- Ordering is enforced with a per-channel sequence number assigned at the
  message service, so every client applies messages in the same order regardless
  of which delivery node served them.
- Clients stay connected through one gateway, and the gateway maintains a local
  routing table of which sockets belong to which channel, so a hot channel's
  delivery stays within a small, warm set of nodes.
- Redis or an in-memory cache serves the last N messages so a reconnecting
  client backfills instantly without hitting the DB.

Scale concentrates in a few mega-channels, so fan-out is sharded per channel
with multicast trees.

- Each delivery node holds a subset of sockets and re-broadcasts each message
  locally rather than one node sending to a million connections.
- The trade-offs are batching vs latency: messages are delivered individually
  (latency) while lower-priority events (typing, presence) are coalesced and
  batched.
- Backpressure is per-connection — a slow consumer is coalesced or dropped,
  never blocking the fan-out tree.
- The gateway must also handle reconnects cheaply: on disconnect, the client's
  subscription state is reconstructed from the room service, and missed messages
  are replayed from the sequence cursor, so delivery is at-least-once with
  idempotent client apply.
- Monitoring tracks per-channel fan-out latency and P99 message-to-delivery time
  — the metric that defines the product..
- Presence answers two questions per user: online-or-offline and which
  room/channel they are in.

- The presence service derives both from gateway state — a user is online while
  a gateway holds their socket, and their room is wherever the client says it is
  — so presence is a projection over connection state rather than a separate
  write path.
- Gateways publish connection and room-change events to the presence store (a
  sharded, eventually consistent store with per-user rows and a per-room member
  set), and the fan-out layer broadcasts presence changes to room members.
- Heartbeats detect zombie sessions: the client pings at a fixed interval, and a
  missed deadline marks the user offline and triggers a presence event.
- Clients also send explicit presence (idle, DND, invisible) that is stored per
  user.

Scale pressures come from join/leave churn and the member-set sizes of busy
rooms.

- The presence store is sharded by room, and membership sets are kept in memory
  with a persistence layer for durability, so a room with tens of thousands of
  members stays on one warm shard.
- Read path is cheap — "who is in this room" is a cached set — while the write
  path is batched: presence transitions are coalesced per user per interval to
  avoid a storm of near-simultaneous events when a channel goes offline or a
  game starts.
- The trade-off is freshness: presence is never exact because offline detection
  is bounded by the heartbeat interval, so the system accepts seconds of
  staleness.
- On gateway failover, the presence service must reconcile — users whose
  gateways died are marked offline and then flipped back online as they
  reconnect, which is handled by versioned updates so stale writes can't
  resurrect a truly offline user..
- Voice is a real-time transport problem: audio must arrive with bounded jitter
  and low absolute latency.

- The client captures audio and sends it over UDP to the nearest voice relay;
  each relay maintains a short jitter buffer and forwards frames to the other
  participants' relays, which deliver to their listeners.
- RTP-style framing with sequence numbers and timestamps lets receivers detect
  loss and reorder frames, and the jitter buffer on the receive side smooths
  arrival-time variance into a steady playback stream — buffering a bit more
  (higher latency) buys fewer dropouts, and the buffer size adapts to measured
  network conditions.
- The relay network is chosen for proximity: a rendezvous/routing service picks
  relays close to both the sender and receivers, minimizing hops and avoiding
  congested inter-region paths when possible.

The design handles loss and congestion without TCP's head-of-line blocking.

- Voice uses UDP with optional forward error correction (FEC) — redundant
  packets let the receiver reconstruct a lost frame without retransmission,
  since a retransmitted audio packet is too late to be useful.
- Opus-style audio is variable bitrate, so under congestion the encoder drops to
  a lower bitrate rather than delaying frames.
- Echo cancellation and noise suppression happen in the client, keeping the
  relay path thin.
- For groups, the relay topology is a mesh or a select-star hybrid: a large
  voice call is broken into subgroups where a star relay per subgroup keeps
  latency low, rather than one relay fanning out to a hundred listeners.
- Monitoring tracks per-session jitter, packet loss, and inter-arrival gaps —
  and a rising loss rate triggers relay re-selection to a better path before
  quality degrades audibly..
- Partitions and failovers are handled per component because each has different
  consistency needs.

- For the gateway tier, gateways are stateless — if a gateway node dies, its
  clients' sockets drop, they reconnect to another gateway, and their
  subscriptions are rebuilt from the room service, so the impact is a brief
  reconnect instead of data loss.
- Message service shards own durable state: a shard failure is covered by a
  replicated store, and the shard's channels are served by a standby replica
  while the leader recovers; during the failover window, the platform can serve
  reads from the replica and queue writes, trading brief write unavailability
  for no message loss.
- Presence is the most partition-tolerant: a partitioned presence store is
  eventually consistent, and after reconnection the client resyncs its state, so
  presence may be wrong for seconds but never permanently inconsistent.

Client-visible failure handling is built into the protocol.

- The client's reconnect logic uses an exponential backoff with jitter, and on
  reconnect it sends its last seen sequence per channel so the server replays
  anything missed — messages that were delivered but unacknowledged are replayed
  and deduped client-side by message ID.
- Voice handles partitions via relay re-selection and the FEC/jitter-buffer
  stack, which absorbs a few seconds of path failure without dropping audio.
- Split-brain is the classic risk when a partition splits a shard: the system
  avoids it by requiring a quorum for leader election, so at most one side of
  the partition keeps accepting writes; the losing side returns errors
  (reconnect) rather than silently diverging.
- Each tier is monitored independently, and the failover playbooks are tested
  continuously, because a platform this real-time depends on recovery being
  automatic and boring.

## Source

````text
title: Chat & Voice
node user: User [round, icon=browser]
node client: Discord Client [icon=browser]
node gateway: Gateway [icon=server]
node message: Message Service [icon=message]
node rooms: Room Service [icon=users]
node presence: Presence [icon=users]
node voice: Voice Service [icon=worker]
node media: Media Relay [icon=cloud]
node index: Message Index [icon=search]
node db: Messages DB [cylinder, icon=database]
node cache: Hot Cache [cylinder, icon=cache]

edge user -> client: send
edge client -> gateway: websocket
edge gateway -> message: deliver
edge message -> db: store
edge message -> cache: recent
edge message -> index: index
edge gateway -> presence: status
edge client -> voice: connect
edge voice -> media: relay
edge client -> rooms: members
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Chat & Voice
user: User
client: Discord Client
gateway: Gateway
message: Message Service
rooms: Room Service
presence: Presence
voice: Voice Service
media: Media Relay
index: Message Index
db: Messages DB
cache: Hot Cache

user ─► client ─► send
client ─► gateway ─► websocket
gateway ─► message ─► deliver
message ─► db ─► store
message ─► cache ─► recent
message ─► index ─► index
gateway ─► presence ─► status
client ─► voice ─► connect
voice ─► media ─► relay
client ─► rooms ─► members
````

## Design

### Design a real-time chat and voice application

The system is built around persistent, real-time connections plus durable
storage.

- Every client opens a long-lived WebSocket to a gateway, which authenticates
  the session and routes all live events — messages, presence, typing
  indicators.
- Messages are handled by a message service: a send is persisted to a messages
  DB, indexed for search, cached for recent reads, and fanned out to everyone
  connected to the target channel/room via the gateways.
- Voice is a parallel path: clients connect to a voice service, which relays
  audio through a media relay network, minimizing jitter and latency.
- A room service tracks channel/room membership so fan-out knows the recipient
  set, and a presence service maintains who is online and in which room.

The architecture separates connection state from application state.

- Gateways are pure connection endpoints — they hold sockets and route events
  but keep no durable data, so they can be drained and replaced freely.
- The message service, room service, and presence store are the source of truth
  and are sharded (typically by room or guild) so hot rooms stay on warm shards.
- Delivery is eventually consistent but ordered per channel: every message gets
  a monotonic sequence per channel, and clients render from the sequence so no
  reordering artifacts appear.
- Durability is shallow for live state (presence, typing) — it dies with the
  connection — while messages are durable and replayable, so a client that
  reconnects pulls a gap-free history.

### How do you deliver messages with low latency at scale?

Latency is dominated by fan-out, so the design minimizes hops between the author
and each recipient.

- When a message is sent, the gateway publishes it to a per-channel topic.
- A fan-out layer — a small set of delivery nodes per channel — receives it once
  and pushes to all connected clients in that channel, while the message service
  persists it in parallel.
- Ordering is enforced with a per-channel sequence number assigned at the
  message service, so every client applies messages in the same order regardless
  of which delivery node served them.
- Clients stay connected through one gateway, and the gateway maintains a local
  routing table of which sockets belong to which channel, so a hot channel's
  delivery stays within a small, warm set of nodes.
- Redis or an in-memory cache serves the last N messages so a reconnecting
  client backfills instantly without hitting the DB.

Scale concentrates in a few mega-channels, so fan-out is sharded per channel
with multicast trees.

- Each delivery node holds a subset of sockets and re-broadcasts each message
  locally rather than one node sending to a million connections.
- The trade-offs are batching vs latency: messages are delivered individually
  (latency) while lower-priority events (typing, presence) are coalesced and
  batched.
- Backpressure is per-connection — a slow consumer is coalesced or dropped,
  never blocking the fan-out tree.
- The gateway must also handle reconnects cheaply: on disconnect, the client's
  subscription state is reconstructed from the room service, and missed messages
  are replayed from the sequence cursor, so delivery is at-least-once with
  idempotent client apply.
- Monitoring tracks per-channel fan-out latency and P99 message-to-delivery time
  — the metric that defines the product.

### How do you scale presence across many servers?

Presence answers two questions per user: online-or-offline and which
room/channel they are in.

- The presence service derives both from gateway state — a user is online while
  a gateway holds their socket, and their room is wherever the client says it is
  — so presence is a projection over connection state rather than a separate
  write path.
- Gateways publish connection and room-change events to the presence store (a
  sharded, eventually consistent store with per-user rows and a per-room member
  set), and the fan-out layer broadcasts presence changes to room members.
- Heartbeats detect zombie sessions: the client pings at a fixed interval, and a
  missed deadline marks the user offline and triggers a presence event.
- Clients also send explicit presence (idle, DND, invisible) that is stored per
  user.

Scale pressures come from join/leave churn and the member-set sizes of busy
rooms.

- The presence store is sharded by room, and membership sets are kept in memory
  with a persistence layer for durability, so a room with tens of thousands of
  members stays on one warm shard.
- Read path is cheap — "who is in this room" is a cached set — while the write
  path is batched: presence transitions are coalesced per user per interval to
  avoid a storm of near-simultaneous events when a channel goes offline or a
  game starts.
- The trade-off is freshness: presence is never exact because offline detection
  is bounded by the heartbeat interval, so the system accepts seconds of
  staleness.
- On gateway failover, the presence service must reconcile — users whose
  gateways died are marked offline and then flipped back online as they
  reconnect, which is handled by versioned updates so stale writes can't
  resurrect a truly offline user.

### How do you route voice without jitter?

Voice is a real-time transport problem: audio must arrive with bounded jitter
and low absolute latency.

- The client captures audio and sends it over UDP to the nearest voice relay;
  each relay maintains a short jitter buffer and forwards frames to the other
  participants' relays, which deliver to their listeners.
- RTP-style framing with sequence numbers and timestamps lets receivers detect
  loss and reorder frames, and the jitter buffer on the receive side smooths
  arrival-time variance into a steady playback stream — buffering a bit more
  (higher latency) buys fewer dropouts, and the buffer size adapts to measured
  network conditions.
- The relay network is chosen for proximity: a rendezvous/routing service picks
  relays close to both the sender and receivers, minimizing hops and avoiding
  congested inter-region paths when possible.

The design handles loss and congestion without TCP's head-of-line blocking.

- Voice uses UDP with optional forward error correction (FEC) — redundant
  packets let the receiver reconstruct a lost frame without retransmission,
  since a retransmitted audio packet is too late to be useful.
- Opus-style audio is variable bitrate, so under congestion the encoder drops to
  a lower bitrate rather than delaying frames.
- Echo cancellation and noise suppression happen in the client, keeping the
  relay path thin.
- For groups, the relay topology is a mesh or a select-star hybrid: a large
  voice call is broken into subgroups where a star relay per subgroup keeps
  latency low, rather than one relay fanning out to a hundred listeners.
- Monitoring tracks per-session jitter, packet loss, and inter-arrival gaps —
  and a rising loss rate triggers relay re-selection to a better path before
  quality degrades audibly.

### How do you handle server partitions and failover?

Partitions and failovers are handled per component because each has different
consistency needs.

- For the gateway tier, gateways are stateless — if a gateway node dies, its
  clients' sockets drop, they reconnect to another gateway, and their
  subscriptions are rebuilt from the room service, so the impact is a brief
  reconnect instead of data loss.
- Message service shards own durable state: a shard failure is covered by a
  replicated store, and the shard's channels are served by a standby replica
  while the leader recovers; during the failover window, the platform can serve
  reads from the replica and queue writes, trading brief write unavailability
  for no message loss.
- Presence is the most partition-tolerant: a partitioned presence store is
  eventually consistent, and after reconnection the client resyncs its state, so
  presence may be wrong for seconds but never permanently inconsistent.

Client-visible failure handling is built into the protocol.

- The client's reconnect logic uses an exponential backoff with jitter, and on
  reconnect it sends its last seen sequence per channel so the server replays
  anything missed — messages that were delivered but unacknowledged are replayed
  and deduped client-side by message ID.
- Voice handles partitions via relay re-selection and the FEC/jitter-buffer
  stack, which absorbs a few seconds of path failure without dropping audio.
- Split-brain is the classic risk when a partition splits a shard: the system
  avoids it by requiring a quorum for leader election, so at most one side of
  the partition keeps accepting writes; the losing side returns errors
  (reconnect) rather than silently diverging.
- Each tier is monitored independently, and the failover playbooks are tested
  continuously, because a platform this real-time depends on recovery being
  automatic and boring.

## Source

```text
title: Chat & Voice
node user: User [round, icon=browser]
node client: Discord Client [icon=browser]
node gateway: Gateway [icon=server]
node message: Message Service [icon=message]
node rooms: Room Service [icon=users]
node presence: Presence [icon=users]
node voice: Voice Service [icon=worker]
node media: Media Relay [icon=cloud]
node index: Message Index [icon=search]
node db: Messages DB [cylinder, icon=database]
node cache: Hot Cache [cylinder, icon=cache]

edge user -> client: send
edge client -> gateway: websocket
edge gateway -> message: deliver
edge message -> db: store
edge message -> cache: recent
edge message -> index: index
edge gateway -> presence: status
edge client -> voice: connect
edge voice -> media: relay
edge client -> rooms: members
```

## Q&A

### Q: Design a real-time chat and voice application

**A:** The system is built around persistent, real-time connections plus durable
storage.

- Every client opens a long-lived WebSocket to a gateway, which authenticates
  the session and routes all live events — messages, presence, typing
  indicators.
- Messages are handled by a message service: a send is persisted to a messages
  DB, indexed for search, cached for recent reads, and fanned out to everyone
  connected to the target channel/room via the gateways.
- Voice is a parallel path: clients connect to a voice service, which relays
  audio through a media relay network, minimizing jitter and latency.
- A room service tracks channel/room membership so fan-out knows the recipient
  set, and a presence service maintains who is online and in which room.

The architecture separates connection state from application state.

- Gateways are pure connection endpoints — they hold sockets and route events
  but keep no durable data, so they can be drained and replaced freely.
- The message service, room service, and presence store are the source of truth
  and are sharded (typically by room or guild) so hot rooms stay on warm shards.
- Delivery is eventually consistent but ordered per channel: every message gets
  a monotonic sequence per channel, and clients render from the sequence so no
  reordering artifacts appear.
- Durability is shallow for live state (presence, typing) — it dies with the
  connection — while messages are durable and replayable, so a client that
  reconnects pulls a gap-free history.

### Q: How do you deliver messages with low latency at scale?

**A:** Latency is dominated by fan-out, so the design minimizes hops between the author
and each recipient.

- When a message is sent, the gateway publishes it to a per-channel topic.
- A fan-out layer — a small set of delivery nodes per channel — receives it once
  and pushes to all connected clients in that channel, while the message service
  persists it in parallel.
- Ordering is enforced with a per-channel sequence number assigned at the
  message service, so every client applies messages in the same order regardless
  of which delivery node served them.
- Clients stay connected through one gateway, and the gateway maintains a local
  routing table of which sockets belong to which channel, so a hot channel's
  delivery stays within a small, warm set of nodes.
- Redis or an in-memory cache serves the last N messages so a reconnecting
  client backfills instantly without hitting the DB.

Scale concentrates in a few mega-channels, so fan-out is sharded per channel
with multicast trees.

- Each delivery node holds a subset of sockets and re-broadcasts each message
  locally rather than one node sending to a million connections.
- The trade-offs are batching vs latency: messages are delivered individually
  (latency) while lower-priority events (typing, presence) are coalesced and
  batched.
- Backpressure is per-connection — a slow consumer is coalesced or dropped,
  never blocking the fan-out tree.
- The gateway must also handle reconnects cheaply: on disconnect, the client's
  subscription state is reconstructed from the room service, and missed messages
  are replayed from the sequence cursor, so delivery is at-least-once with
  idempotent client apply.
- Monitoring tracks per-channel fan-out latency and P99 message-to-delivery time
  — the metric that defines the product.

### Q: How do you scale presence across many servers?

**A:** Presence answers two questions per user: online-or-offline and which
room/channel they are in.

- The presence service derives both from gateway state — a user is online while
  a gateway holds their socket, and their room is wherever the client says it is
  — so presence is a projection over connection state rather than a separate
  write path.
- Gateways publish connection and room-change events to the presence store (a
  sharded, eventually consistent store with per-user rows and a per-room member
  set), and the fan-out layer broadcasts presence changes to room members.
- Heartbeats detect zombie sessions: the client pings at a fixed interval, and a
  missed deadline marks the user offline and triggers a presence event.
- Clients also send explicit presence (idle, DND, invisible) that is stored per
  user.

Scale pressures come from join/leave churn and the member-set sizes of busy
rooms.

- The presence store is sharded by room, and membership sets are kept in memory
  with a persistence layer for durability, so a room with tens of thousands of
  members stays on one warm shard.
- Read path is cheap — "who is in this room" is a cached set — while the write
  path is batched: presence transitions are coalesced per user per interval to
  avoid a storm of near-simultaneous events when a channel goes offline or a
  game starts.
- The trade-off is freshness: presence is never exact because offline detection
  is bounded by the heartbeat interval, so the system accepts seconds of
  staleness.
- On gateway failover, the presence service must reconcile — users whose
  gateways died are marked offline and then flipped back online as they
  reconnect, which is handled by versioned updates so stale writes can't
  resurrect a truly offline user.

### Q: How do you route voice without jitter?

**A:** Voice is a real-time transport problem: audio must arrive with bounded jitter
and low absolute latency.

- The client captures audio and sends it over UDP to the nearest voice relay;
  each relay maintains a short jitter buffer and forwards frames to the other
  participants' relays, which deliver to their listeners.
- RTP-style framing with sequence numbers and timestamps lets receivers detect
  loss and reorder frames, and the jitter buffer on the receive side smooths
  arrival-time variance into a steady playback stream — buffering a bit more
  (higher latency) buys fewer dropouts, and the buffer size adapts to measured
  network conditions.
- The relay network is chosen for proximity: a rendezvous/routing service picks
  relays close to both the sender and receivers, minimizing hops and avoiding
  congested inter-region paths when possible.

The design handles loss and congestion without TCP's head-of-line blocking.

- Voice uses UDP with optional forward error correction (FEC) — redundant
  packets let the receiver reconstruct a lost frame without retransmission,
  since a retransmitted audio packet is too late to be useful.
- Opus-style audio is variable bitrate, so under congestion the encoder drops to
  a lower bitrate rather than delaying frames.
- Echo cancellation and noise suppression happen in the client, keeping the
  relay path thin.
- For groups, the relay topology is a mesh or a select-star hybrid: a large
  voice call is broken into subgroups where a star relay per subgroup keeps
  latency low, rather than one relay fanning out to a hundred listeners.
- Monitoring tracks per-session jitter, packet loss, and inter-arrival gaps —
  and a rising loss rate triggers relay re-selection to a better path before
  quality degrades audibly.

### Q: How do you handle server partitions and failover?

**A:** Partitions and failovers are handled per component because each has different
consistency needs.

- For the gateway tier, gateways are stateless — if a gateway node dies, its
  clients' sockets drop, they reconnect to another gateway, and their
  subscriptions are rebuilt from the room service, so the impact is a brief
  reconnect instead of data loss.
- Message service shards own durable state: a shard failure is covered by a
  replicated store, and the shard's channels are served by a standby replica
  while the leader recovers; during the failover window, the platform can serve
  reads from the replica and queue writes, trading brief write unavailability
  for no message loss.
- Presence is the most partition-tolerant: a partitioned presence store is
  eventually consistent, and after reconnection the client resyncs its state, so
  presence may be wrong for seconds but never permanently inconsistent.

Client-visible failure handling is built into the protocol.

- The client's reconnect logic uses an exponential backoff with jitter, and on
  reconnect it sends its last seen sequence per channel so the server replays
  anything missed — messages that were delivered but unacknowledged are replayed
  and deduped client-side by message ID.
- Voice handles partitions via relay re-selection and the FEC/jitter-buffer
  stack, which absorbs a few seconds of path failure without dropping audio.
- Split-brain is the classic risk when a partition splits a shard: the system
  avoids it by requiring a quorum for leader election, so at most one side of
  the partition keeps accepting writes; the losing side returns errors
  (reconnect) rather than silently diverging.
- Each tier is monitored independently, and the failover playbooks are tested
  continuously, because a platform this real-time depends on recovery being
  automatic and boring.

## Source

```text
title: Chat & Voice
node user: User [round, icon=browser]
node client: Discord Client [icon=browser]
node gateway: Gateway [icon=server]
node message: Message Service [icon=message]
node rooms: Room Service [icon=users]
node presence: Presence [icon=users]
node voice: Voice Service [icon=worker]
node media: Media Relay [icon=cloud]
node index: Message Index [icon=search]
node db: Messages DB [cylinder, icon=database]
node cache: Hot Cache [cylinder, icon=cache]

edge user -> client: send
edge client -> gateway: websocket
edge gateway -> message: deliver
edge message -> db: store
edge message -> cache: recent
edge message -> index: index
edge gateway -> presence: status
edge client -> voice: connect
edge voice -> media: relay
edge client -> rooms: members
```
