# Tinder — Dating App

Design Tinder / a dating app

**Difficulty:** Easy

**Tags:** geo, matching, messaging, mobile, realtime

## Functional Requirements

- Tinder / a dating app
- build a swipe deck of nearby profiles?
- match users and notify them in real time?
- store and serve profile media?
- the chat after a match

## Non-Functional Requirements

- Tinder's core loop is geo-located profiles presented as a swipe deck,
  right-swipe to like, a mutual like producing a match, and then realtime chat.

- The API gateway fronts browse (deck), swipe (record), chat (messages), and
  profile (media).
- The Geo Index resolves "users near me" via geohash cells.
- The Matching Service scores candidate decks and detects matches.
- Swipes persists like/pass decisions.
- The Chat Service delivers messages over persistent connections.
- A media CDN serves profile photos.
- Notifications push match alerts to offline users.

The system is read-heavy for decks but has a distinctive write pattern.

- Swipe writes are high-volume and mostly low-value (most swipes are one-sided),
  yet match detection must be fast and exactly-once.
- Consistency requirements are soft for deck ordering and recency.
- Match creation is the exception — a mutual like must be detected exactly once
  and surfaced instantly.
- Privacy matters: exact coordinates are never exposed, only coarse cells and
  derived distances.
- Scale: millions of DAU, hundreds of swipes per second per region at peak.
- Chat traffic is comparable to a messaging service but only for matched pairs..
- Each swipe is a write.

- `(swiper_id, swiped_id, action, timestamp)` is recorded idempotently in the
  Swipes table with a unique `(swiper_id, swiped_id)` key and published to a
  stream.
- The Matching Service consumes the stream.
- On a like, it checks the reverse edge — did the other user already like this
  user?
- If yes, it creates a match: write a match row, publish a match event, and
  trigger both a realtime push over the Chat gateway's persistent connection and
  a notification if the other user is offline.
- Exactly-once match creation uses a unique key on the unordered pair
  `(min(id), max(id))` so two concurrent mutual swipes cannot create duplicate
  matches.

Latency is the differentiator.

- Mutual-like detection should feel instant, so the reverse-edge check hits
  Redis first (recent like sets per user) with the DB as the source of truth.
- Failure handling: if the consumer lags, matches are delayed but never lost —
  the durable match event is the point after which the chat opens.
- Notifications dedupe match and first-message events to avoid spamming.
- Sharding: swipe records shard by swiper id, so checking whether user B liked
  user A is a single point query on B's shard..
- Chat resembles a small messaging service.

- Persistent connections through a WS gateway.
- A Chat Service routing messages within the matched pair.
- A Messages DB for history.
- Strict per-conversation ordering.
- Messages are keyed `(conversation_id, seq)` where conversation_id is the match
  id and seq comes from a per-conversation monotonic counter, so both users
  observe a consistent order.
- Delivery is at-least-once: the gateway acks on receipt, the Chat Service
  retries, and offline users get a push notification; clients dedupe on message
  id.
- Read and delivered receipts update per-message status in cache and flush to
  the DB in batches.

Conversation history loads lazily.

- The last 50 messages load first, then pagination.
- Real-time presence and typing indicators ride the same gateway.
- Scaling: matches are a fan-out of exactly two, so there is no broadcast
  amplification.
- The WS gateway scales horizontally with sticky sessions per user.
- Messages shard by conversation id so both members' history lives on one shard.
- Failure handling: the push fallback covers offline delivery.
- A message queue absorbs write bursts.
- The client optimistically appends with a pending state until the ack returns.

## Source

````text
title: Tinder Dating
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node geo: Geo Index [icon=search]
node profile: Profile Service [icon=compute]
node matching: Matching Service [icon=queue]
node swipe: Swipes [icon=sync]
node chat: Chat Service [icon=message]
node cdn: Media CDN [ellipse, icon=cloud]
node notify: Notifications [icon=mail]
node db: Profiles DB [cylinder, icon=database]
node cache: Swipe Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> geo: nearby users
edge geo -> matching: candidates
edge matching -> client: deck
edge client -> api: swipe
edge api -> swipe: record
edge swipe -> matching: score
edge matching -> notify: match
edge api -> chat: message
edge chat -> client: realtime
edge api -> cdn: media
edge api -> db: persist
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Tinder Dating
client: Client
api: API Gateway
geo: Geo Index
profile: Profile Service
matching: Matching Service
swipe: Swipes
chat: Chat Service
cdn: Media CDN
notify: Notifications
db: Profiles DB
cache: Swipe Cache

client ─► api ─► browse
api ─► geo ─► nearby users
geo ─► matching ─► candidates
matching ─► client ─► deck
client ─► api ─► swipe
api ─► swipe ─► record
swipe ─► matching ─► score
matching ─► notify ─► match
api ─► chat ─► message
chat ─► client ─► realtime
api ─► cdn ─► media
api ─► db ─► persist
````

## Design

### Design Tinder / a dating app

Tinder's core loop is geo-located profiles presented as a swipe deck,
right-swipe to like, a mutual like producing a match, and then realtime chat.

- The API gateway fronts browse (deck), swipe (record), chat (messages), and
  profile (media).
- The Geo Index resolves "users near me" via geohash cells.
- The Matching Service scores candidate decks and detects matches.
- Swipes persists like/pass decisions.
- The Chat Service delivers messages over persistent connections.
- A media CDN serves profile photos.
- Notifications push match alerts to offline users.

The system is read-heavy for decks but has a distinctive write pattern.

- Swipe writes are high-volume and mostly low-value (most swipes are one-sided),
  yet match detection must be fast and exactly-once.
- Consistency requirements are soft for deck ordering and recency.
- Match creation is the exception — a mutual like must be detected exactly once
  and surfaced instantly.
- Privacy matters: exact coordinates are never exposed, only coarse cells and
  derived distances.
- Scale: millions of DAU, hundreds of swipes per second per region at peak.
- Chat traffic is comparable to a messaging service but only for matched pairs.

### How do you build a swipe deck of nearby profiles?

The deck is a scored, ordered set of candidate profiles near the user's
location.

- The Geo Index stores each active user's current geohash cell.
- Location updates are throttled and cached in Redis with a TTL so the write
  path is bounded.
- Candidate selection queries the user's cell plus surrounding ring cells for
  radius coverage.
- The Matching Service filters by age range, preferences, distance, and mutual
  eligibility.
- It excludes already-swiped profiles using a per-user set of seen ids in the
  Swipe Cache.
- It ranks the rest by an online score blending distance, profile quality,
  activity recency, and personalization signals (e.g. who tends to right-swipe
  similar profiles).

The deck is paginated.

- The first page is precomputed and cached eagerly.
- Subsequent pages are computed on demand from the same cell query as the user
  advances.
- Trade-offs: precomputing a full deck per user is wasteful when most users
  swipe a few dozen profiles a session, so the system computes a small fast page
  and extends it lazily.
- Empty cells in rural areas require radius expansion.
- Dense cities need cell sharding to avoid hot geohash cells.
- Location staleness of minutes is acceptable because movement within a browse
  session rarely changes the deck materially.

### How do you match users and notify them in real time?

Each swipe is a write.

- `(swiper_id, swiped_id, action, timestamp)` is recorded idempotently in the
  Swipes table with a unique `(swiper_id, swiped_id)` key and published to a
  stream.
- The Matching Service consumes the stream.
- On a like, it checks the reverse edge — did the other user already like this
  user?
- If yes, it creates a match: write a match row, publish a match event, and
  trigger both a realtime push over the Chat gateway's persistent connection and
  a notification if the other user is offline.
- Exactly-once match creation uses a unique key on the unordered pair
  `(min(id), max(id))` so two concurrent mutual swipes cannot create duplicate
  matches.

Latency is the differentiator.

- Mutual-like detection should feel instant, so the reverse-edge check hits
  Redis first (recent like sets per user) with the DB as the source of truth.
- Failure handling: if the consumer lags, matches are delayed but never lost —
  the durable match event is the point after which the chat opens.
- Notifications dedupe match and first-message events to avoid spamming.
- Sharding: swipe records shard by swiper id, so checking whether user B liked
  user A is a single point query on B's shard.

### How do you store and serve profile media?

Profile photos are the heavyweight: they must load fast on mobile over variable
networks.

- The pipeline: upload → Media Service validates and strips EXIF metadata for
  privacy → a worker transcodes into multiple resolutions (thumbnail, card,
  full) → originals go to object storage → delivery is via a CDN keyed by
  profile id.
- Profiles DB stores only media URLs, never blobs, so the deck reads thumbnail
  URLs from a cached Profile Service row.
- Every URL carries a version or content hash so profile edits bust the CDN
  cache.
- A miss falls back to origin storage.

Cost is the main lever.

- Originals are retained briefly and compressed variants are kept long-term.
- Deleted profiles purge after a grace period for legal reasons.
- The read path is nearly all CDN hits, keeping the API layer light.
- Face and age verification can run as a consumer over the transcoder stream for
  moderation.
- Trade-offs: lower resolutions cut bandwidth dramatically on the deck — a
  session can pull hundreds of thumbnails.
- Full resolution is reserved for the profile view, keeping payloads
  proportional to value.

### Design the chat after a match

Chat resembles a small messaging service.

- Persistent connections through a WS gateway.
- A Chat Service routing messages within the matched pair.
- A Messages DB for history.
- Strict per-conversation ordering.
- Messages are keyed `(conversation_id, seq)` where conversation_id is the match
  id and seq comes from a per-conversation monotonic counter, so both users
  observe a consistent order.
- Delivery is at-least-once: the gateway acks on receipt, the Chat Service
  retries, and offline users get a push notification; clients dedupe on message
  id.
- Read and delivered receipts update per-message status in cache and flush to
  the DB in batches.

Conversation history loads lazily.

- The last 50 messages load first, then pagination.
- Real-time presence and typing indicators ride the same gateway.
- Scaling: matches are a fan-out of exactly two, so there is no broadcast
  amplification.
- The WS gateway scales horizontally with sticky sessions per user.
- Messages shard by conversation id so both members' history lives on one shard.
- Failure handling: the push fallback covers offline delivery.
- A message queue absorbs write bursts.
- The client optimistically appends with a pending state until the ack returns.

## Source

```text
title: Tinder Dating
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node geo: Geo Index [icon=search]
node profile: Profile Service [icon=compute]
node matching: Matching Service [icon=queue]
node swipe: Swipes [icon=sync]
node chat: Chat Service [icon=message]
node cdn: Media CDN [ellipse, icon=cloud]
node notify: Notifications [icon=mail]
node db: Profiles DB [cylinder, icon=database]
node cache: Swipe Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> geo: nearby users
edge geo -> matching: candidates
edge matching -> client: deck
edge client -> api: swipe
edge api -> swipe: record
edge swipe -> matching: score
edge matching -> notify: match
edge api -> chat: message
edge chat -> client: realtime
edge api -> cdn: media
edge api -> db: persist
```

## Q&A

### Q: Design Tinder / a dating app

**A:** Tinder's core loop is geo-located profiles presented as a swipe deck,
right-swipe to like, a mutual like producing a match, and then realtime chat.

- The API gateway fronts browse (deck), swipe (record), chat (messages), and
  profile (media).
- The Geo Index resolves "users near me" via geohash cells.
- The Matching Service scores candidate decks and detects matches.
- Swipes persists like/pass decisions.
- The Chat Service delivers messages over persistent connections.
- A media CDN serves profile photos.
- Notifications push match alerts to offline users.

The system is read-heavy for decks but has a distinctive write pattern.

- Swipe writes are high-volume and mostly low-value (most swipes are one-sided),
  yet match detection must be fast and exactly-once.
- Consistency requirements are soft for deck ordering and recency.
- Match creation is the exception — a mutual like must be detected exactly once
  and surfaced instantly.
- Privacy matters: exact coordinates are never exposed, only coarse cells and
  derived distances.
- Scale: millions of DAU, hundreds of swipes per second per region at peak.
- Chat traffic is comparable to a messaging service but only for matched pairs.

### Q: How do you build a swipe deck of nearby profiles?

**A:** The deck is a scored, ordered set of candidate profiles near the user's
location.

- The Geo Index stores each active user's current geohash cell.
- Location updates are throttled and cached in Redis with a TTL so the write
  path is bounded.
- Candidate selection queries the user's cell plus surrounding ring cells for
  radius coverage.
- The Matching Service filters by age range, preferences, distance, and mutual
  eligibility.
- It excludes already-swiped profiles using a per-user set of seen ids in the
  Swipe Cache.
- It ranks the rest by an online score blending distance, profile quality,
  activity recency, and personalization signals (e.g. who tends to right-swipe
  similar profiles).

The deck is paginated.

- The first page is precomputed and cached eagerly.
- Subsequent pages are computed on demand from the same cell query as the user
  advances.
- Trade-offs: precomputing a full deck per user is wasteful when most users
  swipe a few dozen profiles a session, so the system computes a small fast page
  and extends it lazily.
- Empty cells in rural areas require radius expansion.
- Dense cities need cell sharding to avoid hot geohash cells.
- Location staleness of minutes is acceptable because movement within a browse
  session rarely changes the deck materially.

### Q: How do you match users and notify them in real time?

**A:** Each swipe is a write.

- `(swiper_id, swiped_id, action, timestamp)` is recorded idempotently in the
  Swipes table with a unique `(swiper_id, swiped_id)` key and published to a
  stream.
- The Matching Service consumes the stream.
- On a like, it checks the reverse edge — did the other user already like this
  user?
- If yes, it creates a match: write a match row, publish a match event, and
  trigger both a realtime push over the Chat gateway's persistent connection and
  a notification if the other user is offline.
- Exactly-once match creation uses a unique key on the unordered pair
  `(min(id), max(id))` so two concurrent mutual swipes cannot create duplicate
  matches.

Latency is the differentiator.

- Mutual-like detection should feel instant, so the reverse-edge check hits
  Redis first (recent like sets per user) with the DB as the source of truth.
- Failure handling: if the consumer lags, matches are delayed but never lost —
  the durable match event is the point after which the chat opens.
- Notifications dedupe match and first-message events to avoid spamming.
- Sharding: swipe records shard by swiper id, so checking whether user B liked
  user A is a single point query on B's shard.

### Q: How do you store and serve profile media?

**A:** Profile photos are the heavyweight: they must load fast on mobile over variable
networks.

- The pipeline: upload → Media Service validates and strips EXIF metadata for
  privacy → a worker transcodes into multiple resolutions (thumbnail, card,
  full) → originals go to object storage → delivery is via a CDN keyed by
  profile id.
- Profiles DB stores only media URLs, never blobs, so the deck reads thumbnail
  URLs from a cached Profile Service row.
- Every URL carries a version or content hash so profile edits bust the CDN
  cache.
- A miss falls back to origin storage.

Cost is the main lever.

- Originals are retained briefly and compressed variants are kept long-term.
- Deleted profiles purge after a grace period for legal reasons.
- The read path is nearly all CDN hits, keeping the API layer light.
- Face and age verification can run as a consumer over the transcoder stream for
  moderation.
- Trade-offs: lower resolutions cut bandwidth dramatically on the deck — a
  session can pull hundreds of thumbnails.
- Full resolution is reserved for the profile view, keeping payloads
  proportional to value.

### Q: Design the chat after a match

**A:** Chat resembles a small messaging service.

- Persistent connections through a WS gateway.
- A Chat Service routing messages within the matched pair.
- A Messages DB for history.
- Strict per-conversation ordering.
- Messages are keyed `(conversation_id, seq)` where conversation_id is the match
  id and seq comes from a per-conversation monotonic counter, so both users
  observe a consistent order.
- Delivery is at-least-once: the gateway acks on receipt, the Chat Service
  retries, and offline users get a push notification; clients dedupe on message
  id.
- Read and delivered receipts update per-message status in cache and flush to
  the DB in batches.

Conversation history loads lazily.

- The last 50 messages load first, then pagination.
- Real-time presence and typing indicators ride the same gateway.
- Scaling: matches are a fan-out of exactly two, so there is no broadcast
  amplification.
- The WS gateway scales horizontally with sticky sessions per user.
- Messages shard by conversation id so both members' history lives on one shard.
- Failure handling: the push fallback covers offline delivery.
- A message queue absorbs write bursts.
- The client optimistically appends with a pending state until the ack returns.

## Source

```text
title: Tinder Dating
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node geo: Geo Index [icon=search]
node profile: Profile Service [icon=compute]
node matching: Matching Service [icon=queue]
node swipe: Swipes [icon=sync]
node chat: Chat Service [icon=message]
node cdn: Media CDN [ellipse, icon=cloud]
node notify: Notifications [icon=mail]
node db: Profiles DB [cylinder, icon=database]
node cache: Swipe Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> geo: nearby users
edge geo -> matching: candidates
edge matching -> client: deck
edge client -> api: swipe
edge api -> swipe: record
edge swipe -> matching: score
edge matching -> notify: match
edge api -> chat: message
edge chat -> client: realtime
edge api -> cdn: media
edge api -> db: persist
```
