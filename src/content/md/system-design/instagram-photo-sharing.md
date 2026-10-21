# Instagram — Photo Sharing

Design Instagram

**Difficulty:** Easy

**Tags:** photo, social, storage

## Functional Requirements

- Instagram
- store and serve billions of photos?
- the photo upload + processing pipeline
- design the Instagram feed?
- build a like/comment system with counters at scale?

## Non-Functional Requirements

- Plan capacity with 3x replication for
  durability and tiered storage (hot/cold) so old or rarely-viewed images move to
  cheaper tiers..
- Use the photo_id as an idempotency key to prevent double
  processing, autoscale workers on queue depth, and TTL-clean orphaned uploads..
- Writes
  hit Redis first (INCR per post_id), giving instant consistency for display and
  buffering write amplification; a background flusher snapshots counters to a
  durable wide-column store (Cassandra/DynamoDB) holding the like set (post_id,
  user_id, timestamp) for history and audit, plus aggregated counts.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Instagram Photo Sharing
client: Client
cdn: CDN
api: API Gateway
upload: Media Upload
process: Media Processor
feed: Feed Service
graph: User Graph
social: Likes & Comments
notify: Notifications
storage: Photo Storage
db: Media DB
cache: Feed Cache

client ─► api ─► upload photo
api ─► upload ─► accept
upload ─► process ─► transcode / thumbnail
process ─► storage ─► store
process ─► db ─► index
client ─► api ─► view feed
api ─► feed ─► build feed
feed ─► graph ─► follow graph
feed ─► cache ─► cached feed
api ─► social ─► like / comment
social ─► notify ─► push
api ─► cache ─► read
```

## Design

### Design Instagram

Instagram is a media upload pipeline combined with a social feed.

- The upload flow goes client -> API -> Media Upload service -> Media Processor
  (transcode, thumbnails, moderation) -> object storage plus a metadata DB.
- A follow graph (graph DB) feeds a Feed service that pre-computes cached
  timelines (Redis) via fanout, like a Twitter feed but media-heavy.
- Likes/comments have their own service with counters; notifications push events
  asynchronously.
- Serve images from a CDN using content-addressed URLs so caching is
  deterministic and duplicates are deduped.
- Reads dominate, so cache aggressively and make writes async through a queue
  (Kafka).
- Shard by user_id; keep counters in Redis with periodic flush to a durable
  counter store (Cassandra).
- Discovery/search and reels/stories slot in as separate services off the same
  graph.

### How do you store and serve billions of photos?

Keep blobs out of relational storage: store photos in an object store (S3) keyed
by content hash so identical uploads dedupe and CDN keys are deterministic; the
database holds only metadata (owner, dimensions, timestamps, content hash).
Generate several resolutions (thumbnail, 320, 640, 1080) at processing time,
each under a predictable key. Serve through a CDN: the client gets CDN URLs,
edges cache popular images with long immutable TTLs, and origin (object storage)
is only hit on miss — this is what makes billions of photos affordable. Shard
the metadata DB by user_id or photo hash. Plan capacity with 3x replication for
durability and tiered storage (hot/cold) so old or rarely-viewed images move to
cheaper tiers.

### Design the photo upload + processing pipeline

Client uploads to the API gateway (authed, rate-limited), which hands off to the
Media Upload service. To avoid proxying megabytes through app servers, return a
pre-signed URL so the client writes directly to object storage. When the object
arrives, an event fires to a queue (Kafka/SQS); the client gets an immediate
ack. A pool of Media Processor workers consume events: validate the file,
transcode/compress, generate thumbnail sizes and filter versions, read EXIF for
orientation, and run moderation (NSFW/abuse). Outputs go back to object storage
under content-addressed keys, then the metadata DB is updated and notifications
are triggered. Use the photo_id as an idempotency key to prevent double
processing, autoscale workers on queue depth, and TTL-clean orphaned uploads.

### How do you design the Instagram feed?

The feed is a media-heavy timeline. The follow graph determines candidate
authors; on a new post, a Fanout Worker pushes the post ID into followers' feed
caches (Redis sorted sets scored by timestamp/rank). For celebrity accounts
switch to pull/hybrid to avoid fanout explosion: fetch their recent posts at
read time and merge. At read time the Feed service merges cached IDs, fetches
metadata and media URLs from cache/DB, ranks by recency, engagement, and
predicted relevance (with ad insertion), and paginates with cursors. Cache only
IDs and pointers, not full media, to keep memory small; backfill from the DB on
cache miss. Stories and reels are separate containers carrying a type flag.
Media is served from the CDN so feed reads stay cheap.

### How do you build a like/comment system with counters at scale?

Likes are high-write and hot (popular posts), so use a two-tier counter. Writes
hit Redis first (INCR per post_id), giving instant consistency for display and
buffering write amplification; a background flusher snapshots counters to a
durable wide-column store (Cassandra/DynamoDB) holding the like set (post_id,
user_id, timestamp) for history and audit, plus aggregated counts. Keep a
per-post set in Redis to dedupe and support unlike. Comments are rows
partitioned by post_id with cursor pagination (created_at). For hot posts,
replicate the counter key or use sharded counters with read-repair so one post
can't become a bottleneck. Counts are eventually consistent — show slight lag in
UI and read exact totals from the durable store on demand.

## Source

```text
title: Instagram Photo Sharing
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node upload: Media Upload [icon=file]
node process: Media Processor [icon=compute]
node feed: Feed Service [icon=message]
node graph: User Graph [icon=users]
node social: Likes & Comments [icon=sync]
node notify: Notifications [icon=mail]
node storage: Photo Storage [cylinder, icon=file]
node db: Media DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: upload photo
edge api -> upload: accept
edge upload -> process: transcode / thumbnail
edge process -> storage: store
edge process -> db: index
edge client -> api: view feed
edge api -> feed: build feed
edge feed -> graph: follow graph
edge feed -> cache: cached feed
edge api -> social: like / comment
edge social -> notify: push
edge api -> cache: read
```

## Q&A

### Q: Design Instagram

**A:** Instagram is a media upload pipeline combined with a social feed.

- The upload flow goes client -> API -> Media Upload service -> Media Processor
  (transcode, thumbnails, moderation) -> object storage plus a metadata DB.
- A follow graph (graph DB) feeds a Feed service that pre-computes cached
  timelines (Redis) via fanout, like a Twitter feed but media-heavy.
- Likes/comments have their own service with counters; notifications push events
  asynchronously.
- Serve images from a CDN using content-addressed URLs so caching is
  deterministic and duplicates are deduped.
- Reads dominate, so cache aggressively and make writes async through a queue
  (Kafka).
- Shard by user_id; keep counters in Redis with periodic flush to a durable
  counter store (Cassandra).
- Discovery/search and reels/stories slot in as separate services off the same
  graph.

### Q: How do you store and serve billions of photos?

**A:** Keep blobs out of relational storage: store photos in an object store (S3) keyed
by content hash so identical uploads dedupe and CDN keys are deterministic; the
database holds only metadata (owner, dimensions, timestamps, content hash).
Generate several resolutions (thumbnail, 320, 640, 1080) at processing time,
each under a predictable key. Serve through a CDN: the client gets CDN URLs,
edges cache popular images with long immutable TTLs, and origin (object storage)
is only hit on miss — this is what makes billions of photos affordable. Shard
the metadata DB by user_id or photo hash. Plan capacity with 3x replication for
durability and tiered storage (hot/cold) so old or rarely-viewed images move to
cheaper tiers.

### Q: Design the photo upload + processing pipeline

**A:** Client uploads to the API gateway (authed, rate-limited), which hands off to the
Media Upload service. To avoid proxying megabytes through app servers, return a
pre-signed URL so the client writes directly to object storage. When the object
arrives, an event fires to a queue (Kafka/SQS); the client gets an immediate
ack. A pool of Media Processor workers consume events: validate the file,
transcode/compress, generate thumbnail sizes and filter versions, read EXIF for
orientation, and run moderation (NSFW/abuse). Outputs go back to object storage
under content-addressed keys, then the metadata DB is updated and notifications
are triggered. Use the photo_id as an idempotency key to prevent double
processing, autoscale workers on queue depth, and TTL-clean orphaned uploads.

### Q: How do you design the Instagram feed?

**A:** The feed is a media-heavy timeline. The follow graph determines candidate
authors; on a new post, a Fanout Worker pushes the post ID into followers' feed
caches (Redis sorted sets scored by timestamp/rank). For celebrity accounts
switch to pull/hybrid to avoid fanout explosion: fetch their recent posts at
read time and merge. At read time the Feed service merges cached IDs, fetches
metadata and media URLs from cache/DB, ranks by recency, engagement, and
predicted relevance (with ad insertion), and paginates with cursors. Cache only
IDs and pointers, not full media, to keep memory small; backfill from the DB on
cache miss. Stories and reels are separate containers carrying a type flag.
Media is served from the CDN so feed reads stay cheap.

### Q: How do you build a like/comment system with counters at scale?

**A:** Likes are high-write and hot (popular posts), so use a two-tier counter. Writes
hit Redis first (INCR per post_id), giving instant consistency for display and
buffering write amplification; a background flusher snapshots counters to a
durable wide-column store (Cassandra/DynamoDB) holding the like set (post_id,
user_id, timestamp) for history and audit, plus aggregated counts. Keep a
per-post set in Redis to dedupe and support unlike. Comments are rows
partitioned by post_id with cursor pagination (created_at). For hot posts,
replicate the counter key or use sharded counters with read-repair so one post
can't become a bottleneck. Counts are eventually consistent — show slight lag in
UI and read exact totals from the durable store on demand.

## Source

```text
title: Instagram Photo Sharing
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node upload: Media Upload [icon=file]
node process: Media Processor [icon=compute]
node feed: Feed Service [icon=message]
node graph: User Graph [icon=users]
node social: Likes & Comments [icon=sync]
node notify: Notifications [icon=mail]
node storage: Photo Storage [cylinder, icon=file]
node db: Media DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: upload photo
edge api -> upload: accept
edge upload -> process: transcode / thumbnail
edge process -> storage: store
edge process -> db: index
edge client -> api: view feed
edge api -> feed: build feed
edge feed -> graph: follow graph
edge feed -> cache: cached feed
edge api -> social: like / comment
edge social -> notify: push
edge api -> cache: read
```
