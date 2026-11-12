# Twitch — Live Streaming

Design a live streaming platform

**Difficulty:** Medium

**Tags:** messaging, realtime, video

## Functional Requirements

- a live streaming platform
- ingest and transcode live streams?
- keep stream latency low across regions?
- scale chat alongside the video stream?
- handle broadcaster failures gracefully?

## Non-Functional Requirements

- The platform has a real-time video pipeline and a real-time interaction layer.

- The broadcaster's encoder pushes a single high-bitrate stream (RTMP or
  WebRTC/SRT) to the nearest ingestion endpoint, which validates the stream key
  and splits the stream into short segments (2–4 seconds).
- The transcode pipeline re-encodes into multiple adaptive-bitrate renditions
  (1080p down to 480p) and writes them to an origin store.
- The CDN replicates segments to edge locations and viewers play via HLS or
  LL-HLS/CMAF.
- Parallel to video, a chat service fans messages out over WebSocket to every
  viewer of the channel, and a presence service tracks who is watching.
- Channel metadata, stream keys, and subscription state live in a channel DB.
- A recommender surfaces live channels to viewers.

The design separates stateful real-time components from stateless batch-friendly
ones.

- Ingest, chat, and presence are stateful and sharded per channel so a single
  channel's load stays on a small, warm set of servers.
- Transcoding is a CPU-heavy, horizontally scalable worker pool sized by
  concurrent streams and renditions per stream.
- Durability matters for live video — segments are written to origin storage as
  they are produced so a failed edge can re-serve them — but old segments are
  cheap to drop since live video is ephemeral.
- The platform must handle huge, spiky fan-out: one stream can be watched by a
  million people, so delivery is CDN-only and chat fan-out uses per-channel
  distribution trees rather than per-viewer connections to a single server..
- Ingestion starts when the encoder connects.

- The broadcaster authenticates with a stream key, the ingestion endpoint looks
  up the channel, and the encoder pushes a continuous stream.
- The ingest server chunks it into time-aligned segments (each with an
  independent keyframe so segments are individually decodable), writes the
  original to origin storage for archival, and feeds the transcode pipeline.
- Transcoding runs on a pool of GPU/CPU workers: each input rendition is decoded
  once, then re-encoded into multiple output renditions — different resolutions
  and bitrates — so viewers on slow connections can drop to a lower rendition
  without buffering.
- Each output rendition is segmented and published to the origin store, and a
  manifest is updated so players discover the available renditions.
- The pipeline is a streaming DAG, not a batch job.
- Workers are assigned per (channel, rendition) and must keep up in real time —
  falling behind means dropped frames and a lagging stream.

Transcode is also where value-add features attach: frame-rate normalization, ad
insertion at segment boundaries, and closed captions.

- The cost model matters — transcoding per stream per rendition is expensive, so
  many platforms transcode popular channels into many renditions (or use
  per-viewer transcoding, like Twitch) while small channels pass through the
  original single rendition.
- Segment loss is handled by origin buffering and retry: a player that misses a
  segment requests it again from the CDN/origin before moving on.
- Monitoring tracks transcode CPU, pipeline lag, and the percent of segments
  published within their target window, because a transcode backlog is the
  leading indicator of a degraded broadcast..
- Latency is bounded by the segment pipeline: broadcast delay equals segment
  duration + CDN propagation + player buffer.
- Chat is fan-out with strong ordering requirements per channel.

- When a viewer sends a message, the gateway validates it (rate limits,
  moderation) and publishes it to a per-channel chat topic.
- A fan-out layer delivers it to every viewer's WebSocket connection, with
  per-channel ordering and delivery confirmation so the message appears in the
  right sequence for everyone.
- Channels are the shard unit: a busy channel gets dedicated chat shards and
  fan-out servers.
- The per-channel event log (a Kafka-style topic) provides replay so a
  reconnecting viewer can backfill the last N messages.
- Moderation runs at ingest — filter spam, badges, and slow-mode per channel —
  and can be stateful per user so a banned viewer is dropped from delivery.
- Presence (who is online) is tracked by the same fan-out layer, which maintains
  a per-channel member set.

The hard part is a mega-channel: hundreds of thousands of concurrent chatters
make per-message broadcast to every connection a massive fan-out.

- The design uses a multicast tree — a small set of delivery servers, each
  holding a subset of connections, receiving each message once and
  re-broadcasting to their local sockets — rather than one server sending a
  million messages.
- Ordering is relaxed across shards where acceptable (only the global slow-mode
  stream must be strictly ordered) and strict within a viewer's session.
- Durability is intentionally shallow: chat is ephemeral, so messages live in a
  hot cache with a short retention, while a message index keeps a searchable
  recent history.
- Backpressure is per-connection (slow viewers are dropped or coalesced) and the
  channel's message rate is throttled at ingest so fan-out servers can't be
  overwhelmed..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Live Streaming
viewer: Viewer
streamer: Streamer
ingest: Ingestion Endpoint
transcode: Transcode Pipeline
origin: Origin Store
cdn: CDN
chat: Chat Service
presence: Presence
subscribe: Subscriptions
db: Channel DB
recommend: Recommender

streamer ─► ingest ─► push stream
ingest ─► transcode ─► segment
transcode ─► origin ─► publish
origin ─► cdn ─► replicate
cdn ─► viewer ─► play
viewer ─► chat ─► message
chat ─► presence ─► online
viewer ─► subscribe ─► follow
subscribe ─► db ─► persist
streamer ─► ingest ─► stream key
recommend ─► viewer ─► discover
```

## Design

### Design a live streaming platform

The platform has a real-time video pipeline and a real-time interaction layer.

- The broadcaster's encoder pushes a single high-bitrate stream (RTMP or
  WebRTC/SRT) to the nearest ingestion endpoint, which validates the stream key
  and splits the stream into short segments (2–4 seconds).
- The transcode pipeline re-encodes into multiple adaptive-bitrate renditions
  (1080p down to 480p) and writes them to an origin store.
- The CDN replicates segments to edge locations and viewers play via HLS or
  LL-HLS/CMAF.
- Parallel to video, a chat service fans messages out over WebSocket to every
  viewer of the channel, and a presence service tracks who is watching.
- Channel metadata, stream keys, and subscription state live in a channel DB.
- A recommender surfaces live channels to viewers.

The design separates stateful real-time components from stateless batch-friendly
ones.

- Ingest, chat, and presence are stateful and sharded per channel so a single
  channel's load stays on a small, warm set of servers.
- Transcoding is a CPU-heavy, horizontally scalable worker pool sized by
  concurrent streams and renditions per stream.
- Durability matters for live video — segments are written to origin storage as
  they are produced so a failed edge can re-serve them — but old segments are
  cheap to drop since live video is ephemeral.
- The platform must handle huge, spiky fan-out: one stream can be watched by a
  million people, so delivery is CDN-only and chat fan-out uses per-channel
  distribution trees rather than per-viewer connections to a single server.

### How do you ingest and transcode live streams?

Ingestion starts when the encoder connects.

- The broadcaster authenticates with a stream key, the ingestion endpoint looks
  up the channel, and the encoder pushes a continuous stream.
- The ingest server chunks it into time-aligned segments (each with an
  independent keyframe so segments are individually decodable), writes the
  original to origin storage for archival, and feeds the transcode pipeline.
- Transcoding runs on a pool of GPU/CPU workers: each input rendition is decoded
  once, then re-encoded into multiple output renditions — different resolutions
  and bitrates — so viewers on slow connections can drop to a lower rendition
  without buffering.
- Each output rendition is segmented and published to the origin store, and a
  manifest is updated so players discover the available renditions.
- The pipeline is a streaming DAG, not a batch job.
- Workers are assigned per (channel, rendition) and must keep up in real time —
  falling behind means dropped frames and a lagging stream.

Transcode is also where value-add features attach: frame-rate normalization, ad
insertion at segment boundaries, and closed captions.

- The cost model matters — transcoding per stream per rendition is expensive, so
  many platforms transcode popular channels into many renditions (or use
  per-viewer transcoding, like Twitch) while small channels pass through the
  original single rendition.
- Segment loss is handled by origin buffering and retry: a player that misses a
  segment requests it again from the CDN/origin before moving on.
- Monitoring tracks transcode CPU, pipeline lag, and the percent of segments
  published within their target window, because a transcode backlog is the
  leading indicator of a degraded broadcast.

### How do you keep stream latency low across regions?

Latency is bounded by the segment pipeline: broadcast delay equals segment
duration + CDN propagation + player buffer. The pipeline targets low end-to-end
latency (seconds, not tens of seconds) through three levers.

- Short segments: 2-second segments with a player that starts playback as soon
  as the first segment and its manifest arrive, rather than buffering several
  ahead.
- Low-latency protocols: LL-HLS/CMAF with partial segments, or WebRTC for the
  lowest-latency tier, lets players fetch parts of a segment as they are
  produced.
- Edge delivery: the CDN pushes newly published segments to edges in the
  viewers' regions, and players connect to the nearest edge, so a segment
  travels one hop from origin to edge rather than a global round trip.
- Origin replication is pre-fetched on demand — the CDN pulls a segment when the
  first viewer requests it and caches it for subsequent viewers on that edge.

Latency and quality trade off.

- Short segments reduce delay but increase encoding overhead and the chance of
  playback gaps on lossy networks, so the player adaptively buffers more when
  the network is bad and less when it is stable.
- Live also has a "time-to-sync" problem: a large global audience experiences
  different broadcast latencies, so interaction (chat reacting to a moment) has
  an inherent skew.
- Platforms accept skew within a region and prioritize a consistent, low
  absolute delay.
- Monitoring uses player-reported metrics (rebuffer ratio, time-to-first-frame,
  end-to-end delay) to tune segment size and buffer policies per region.
- For interactive tiers (WebRTC), the control plane picks the nearest media
  relay and applies jitter buffering at the player — a pure delay/quality trade
  with no CDN in the loop.

### How do you scale chat alongside the video stream?

Chat is fan-out with strong ordering requirements per channel.

- When a viewer sends a message, the gateway validates it (rate limits,
  moderation) and publishes it to a per-channel chat topic.
- A fan-out layer delivers it to every viewer's WebSocket connection, with
  per-channel ordering and delivery confirmation so the message appears in the
  right sequence for everyone.
- Channels are the shard unit: a busy channel gets dedicated chat shards and
  fan-out servers.
- The per-channel event log (a Kafka-style topic) provides replay so a
  reconnecting viewer can backfill the last N messages.
- Moderation runs at ingest — filter spam, badges, and slow-mode per channel —
  and can be stateful per user so a banned viewer is dropped from delivery.
- Presence (who is online) is tracked by the same fan-out layer, which maintains
  a per-channel member set.

The hard part is a mega-channel: hundreds of thousands of concurrent chatters
make per-message broadcast to every connection a massive fan-out.

- The design uses a multicast tree — a small set of delivery servers, each
  holding a subset of connections, receiving each message once and
  re-broadcasting to their local sockets — rather than one server sending a
  million messages.
- Ordering is relaxed across shards where acceptable (only the global slow-mode
  stream must be strictly ordered) and strict within a viewer's session.
- Durability is intentionally shallow: chat is ephemeral, so messages live in a
  hot cache with a short retention, while a message index keeps a searchable
  recent history.
- Backpressure is per-connection (slow viewers are dropped or coalesced) and the
  channel's message rate is throttled at ingest so fan-out servers can't be
  overwhelmed.

### How do you handle broadcaster failures gracefully?

Broadcasts fail at every layer, and the platform must degrade without harming
viewers or revenue.

- If the broadcaster's connection drops (network blip, app crash, power loss),
  the ingest endpoint detects the idle timeout, flags the channel as "offline,"
  and emits a status change to presence and the recommender.
- Viewers see the stream freeze briefly, then an offline card.
- Reconnect is the critical path — the encoder reconnects with the same stream
  key, and the platform must handle a new session without mixing old and new
  content: the new ingest session gets a fresh stream session ID, old segments
  are invalidated, and the channel resumes broadcasting with the manifest
  regenerated.
- To make reconnects seamless, the ingest endpoint supports a short grace window
  where it buffers a few seconds, and the encoder can fast-reconnect with a
  session token that resumes the previous stream.

Mid-stream failures are contained per component.

- If a transcode worker dies, the pipeline restarts the rendition from the
  origin's latest segment and the player seamlessly falls back to another
  rendition while it rebuilds.
- If an edge fails, the CDN reroutes viewers to a neighboring edge that re-pulls
  segments from origin.
- The channel DB records the outage with timestamps for analytics, and the
  platform can auto-restart archived replays so the VOD is not lost even when
  the live portion glitched.
- Operational detection uses watchdog health checks on the encoder's heartbeat
  and per-segment publication timestamps; when segments stop arriving, an alert
  fires before viewers complain.
- The design principle is that the live experience must never take down the
  broader platform — ingest, transcode, chat, and presence all degrade
  independently and recover without a global restart.

## Source

```text
title: Live Streaming
node viewer: Viewer [round, icon=browser]
node streamer: Streamer [round, icon=browser]
node ingest: Ingestion Endpoint [icon=server]
node transcode: Transcode Pipeline [icon=compute]
node origin: Origin Store [cylinder, icon=file]
node cdn: CDN [ellipse, icon=cloud]
node chat: Chat Service [icon=message]
node presence: Presence [icon=users]
node subscribe: Subscriptions [icon=shield]
node db: Channel DB [cylinder, icon=database]
node recommend: Recommender [icon=search]

edge streamer -> ingest: push stream
edge ingest -> transcode: segment
edge transcode -> origin: publish
edge origin -> cdn: replicate
edge cdn -> viewer: play
edge viewer -> chat: message
edge chat -> presence: online
edge viewer -> subscribe: follow
edge subscribe -> db: persist
edge streamer -> ingest: stream key
edge recommend -> viewer: discover
```

## Q&A

### Q: Design a live streaming platform

**A:** The platform has a real-time video pipeline and a real-time interaction layer.

- The broadcaster's encoder pushes a single high-bitrate stream (RTMP or
  WebRTC/SRT) to the nearest ingestion endpoint, which validates the stream key
  and splits the stream into short segments (2–4 seconds).
- The transcode pipeline re-encodes into multiple adaptive-bitrate renditions
  (1080p down to 480p) and writes them to an origin store.
- The CDN replicates segments to edge locations and viewers play via HLS or
  LL-HLS/CMAF.
- Parallel to video, a chat service fans messages out over WebSocket to every
  viewer of the channel, and a presence service tracks who is watching.
- Channel metadata, stream keys, and subscription state live in a channel DB.
- A recommender surfaces live channels to viewers.

The design separates stateful real-time components from stateless batch-friendly
ones.

- Ingest, chat, and presence are stateful and sharded per channel so a single
  channel's load stays on a small, warm set of servers.
- Transcoding is a CPU-heavy, horizontally scalable worker pool sized by
  concurrent streams and renditions per stream.
- Durability matters for live video — segments are written to origin storage as
  they are produced so a failed edge can re-serve them — but old segments are
  cheap to drop since live video is ephemeral.
- The platform must handle huge, spiky fan-out: one stream can be watched by a
  million people, so delivery is CDN-only and chat fan-out uses per-channel
  distribution trees rather than per-viewer connections to a single server.

### Q: How do you ingest and transcode live streams?

**A:** Ingestion starts when the encoder connects.

- The broadcaster authenticates with a stream key, the ingestion endpoint looks
  up the channel, and the encoder pushes a continuous stream.
- The ingest server chunks it into time-aligned segments (each with an
  independent keyframe so segments are individually decodable), writes the
  original to origin storage for archival, and feeds the transcode pipeline.
- Transcoding runs on a pool of GPU/CPU workers: each input rendition is decoded
  once, then re-encoded into multiple output renditions — different resolutions
  and bitrates — so viewers on slow connections can drop to a lower rendition
  without buffering.
- Each output rendition is segmented and published to the origin store, and a
  manifest is updated so players discover the available renditions.
- The pipeline is a streaming DAG, not a batch job.
- Workers are assigned per (channel, rendition) and must keep up in real time —
  falling behind means dropped frames and a lagging stream.

Transcode is also where value-add features attach: frame-rate normalization, ad
insertion at segment boundaries, and closed captions.

- The cost model matters — transcoding per stream per rendition is expensive, so
  many platforms transcode popular channels into many renditions (or use
  per-viewer transcoding, like Twitch) while small channels pass through the
  original single rendition.
- Segment loss is handled by origin buffering and retry: a player that misses a
  segment requests it again from the CDN/origin before moving on.
- Monitoring tracks transcode CPU, pipeline lag, and the percent of segments
  published within their target window, because a transcode backlog is the
  leading indicator of a degraded broadcast.

### Q: How do you keep stream latency low across regions?

**A:** Latency is bounded by the segment pipeline: broadcast delay equals segment
duration + CDN propagation + player buffer. The pipeline targets low end-to-end
latency (seconds, not tens of seconds) through three levers.

- Short segments: 2-second segments with a player that starts playback as soon
  as the first segment and its manifest arrive, rather than buffering several
  ahead.
- Low-latency protocols: LL-HLS/CMAF with partial segments, or WebRTC for the
  lowest-latency tier, lets players fetch parts of a segment as they are
  produced.
- Edge delivery: the CDN pushes newly published segments to edges in the
  viewers' regions, and players connect to the nearest edge, so a segment
  travels one hop from origin to edge rather than a global round trip.
- Origin replication is pre-fetched on demand — the CDN pulls a segment when the
  first viewer requests it and caches it for subsequent viewers on that edge.

Latency and quality trade off.

- Short segments reduce delay but increase encoding overhead and the chance of
  playback gaps on lossy networks, so the player adaptively buffers more when
  the network is bad and less when it is stable.
- Live also has a "time-to-sync" problem: a large global audience experiences
  different broadcast latencies, so interaction (chat reacting to a moment) has
  an inherent skew.
- Platforms accept skew within a region and prioritize a consistent, low
  absolute delay.
- Monitoring uses player-reported metrics (rebuffer ratio, time-to-first-frame,
  end-to-end delay) to tune segment size and buffer policies per region.
- For interactive tiers (WebRTC), the control plane picks the nearest media
  relay and applies jitter buffering at the player — a pure delay/quality trade
  with no CDN in the loop.

### Q: How do you scale chat alongside the video stream?

**A:** Chat is fan-out with strong ordering requirements per channel.

- When a viewer sends a message, the gateway validates it (rate limits,
  moderation) and publishes it to a per-channel chat topic.
- A fan-out layer delivers it to every viewer's WebSocket connection, with
  per-channel ordering and delivery confirmation so the message appears in the
  right sequence for everyone.
- Channels are the shard unit: a busy channel gets dedicated chat shards and
  fan-out servers.
- The per-channel event log (a Kafka-style topic) provides replay so a
  reconnecting viewer can backfill the last N messages.
- Moderation runs at ingest — filter spam, badges, and slow-mode per channel —
  and can be stateful per user so a banned viewer is dropped from delivery.
- Presence (who is online) is tracked by the same fan-out layer, which maintains
  a per-channel member set.

The hard part is a mega-channel: hundreds of thousands of concurrent chatters
make per-message broadcast to every connection a massive fan-out.

- The design uses a multicast tree — a small set of delivery servers, each
  holding a subset of connections, receiving each message once and
  re-broadcasting to their local sockets — rather than one server sending a
  million messages.
- Ordering is relaxed across shards where acceptable (only the global slow-mode
  stream must be strictly ordered) and strict within a viewer's session.
- Durability is intentionally shallow: chat is ephemeral, so messages live in a
  hot cache with a short retention, while a message index keeps a searchable
  recent history.
- Backpressure is per-connection (slow viewers are dropped or coalesced) and the
  channel's message rate is throttled at ingest so fan-out servers can't be
  overwhelmed.

### Q: How do you handle broadcaster failures gracefully?

**A:** Broadcasts fail at every layer, and the platform must degrade without harming
viewers or revenue.

- If the broadcaster's connection drops (network blip, app crash, power loss),
  the ingest endpoint detects the idle timeout, flags the channel as "offline,"
  and emits a status change to presence and the recommender.
- Viewers see the stream freeze briefly, then an offline card.
- Reconnect is the critical path — the encoder reconnects with the same stream
  key, and the platform must handle a new session without mixing old and new
  content: the new ingest session gets a fresh stream session ID, old segments
  are invalidated, and the channel resumes broadcasting with the manifest
  regenerated.
- To make reconnects seamless, the ingest endpoint supports a short grace window
  where it buffers a few seconds, and the encoder can fast-reconnect with a
  session token that resumes the previous stream.

Mid-stream failures are contained per component.

- If a transcode worker dies, the pipeline restarts the rendition from the
  origin's latest segment and the player seamlessly falls back to another
  rendition while it rebuilds.
- If an edge fails, the CDN reroutes viewers to a neighboring edge that re-pulls
  segments from origin.
- The channel DB records the outage with timestamps for analytics, and the
  platform can auto-restart archived replays so the VOD is not lost even when
  the live portion glitched.
- Operational detection uses watchdog health checks on the encoder's heartbeat
  and per-segment publication timestamps; when segments stop arriving, an alert
  fires before viewers complain.
- The design principle is that the live experience must never take down the
  broader platform — ingest, transcode, chat, and presence all degrade
  independently and recover without a global restart.

## Source

```text
title: Live Streaming
node viewer: Viewer [round, icon=browser]
node streamer: Streamer [round, icon=browser]
node ingest: Ingestion Endpoint [icon=server]
node transcode: Transcode Pipeline [icon=compute]
node origin: Origin Store [cylinder, icon=file]
node cdn: CDN [ellipse, icon=cloud]
node chat: Chat Service [icon=message]
node presence: Presence [icon=users]
node subscribe: Subscriptions [icon=shield]
node db: Channel DB [cylinder, icon=database]
node recommend: Recommender [icon=search]

edge streamer -> ingest: push stream
edge ingest -> transcode: segment
edge transcode -> origin: publish
edge origin -> cdn: replicate
edge cdn -> viewer: play
edge viewer -> chat: message
edge chat -> presence: online
edge viewer -> subscribe: follow
edge subscribe -> db: persist
edge streamer -> ingest: stream key
edge recommend -> viewer: discover
```
