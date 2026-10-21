# Netflix — Streaming

Design Netflix / a video streaming service

**Difficulty:** Easy

**Tags:** cdn, ecommerce, realtime, video

## Functional Requirements

- Netflix / a video streaming service
- Why are CDNs essential for streaming? How do you pick edge servers?
- encode and store videos at scale (transcoding pipeline)?
- a recommendation engine for movies
- resume playback across devices?

## Non-Functional Requirements

- Netflix is video-on-demand with a pipeline from studio to player.

- Studios upload raw masters; the Encoding pipeline transcodes to multiple
  resolutions and bitrates (4K down to 240p) and segments output into 2-6s
  chunks (DASH/HLS).
- Chunks are stored in object storage and replicated to CDN edge nodes for
  low-latency delivery.
- The player fetches a manifest from the API/Catalog service, then pulls
  segments from the nearest edge using adaptive bitrate streaming (ABR).
- A DRM/licensing service issues signed licenses and enforces playback rights.
- Catalog metadata lives in a DB behind a cache; Watch History and Analytics
  track playback and feed recommendations.
- The catalog/CDN routing layer picks the best edge node.
- Scalability hinges on CDN offload, amortized encode compute, and cacheable
  metadata reads..
- A single 4K stream sustains several Mbps, so serving every request from origin
  (object storage) is impossible and would congest the Internet backbone.

- CDNs replicate popular content to edge nodes near users, cutting latency,
  bandwidth cost, and origin load — without them streaming would buffer
  constantly and not scale.
- Picking an edge: use anycast DNS so users resolve to the nearest/cheapest
  node, and route by geographic proximity (RTT), node health, and current
  capacity/utilization.
- The player should also choose per-manifest based on measured bandwidth and
  latency to candidate nodes.
- Providers like Netflix's Open Connect pre-place content proactively using
  popularity heatmaps and real-time telemetry, rebalancing load as demand
  shifts..
- Ingest the raw master into object storage, then trigger a job through a queue
  (SQS/Kafka) to a pool of transcoder workers.

- For each title, produce multiple rendition profiles (resolution x bitrate,
  e.g., H.264/HEVC/AV1 from 240p to 4K) segmented into DASH/HLS chunks.
- Transcoding is compute-heavy, so scale a GPU/CPU worker fleet and encode
  segments in parallel, assembling manifests afterward.
- Use tiered encoding: a baseline profile first for fast availability, enhanced
  profiles asynchronously later.
- Store outputs in object storage with content-addressed or versioned keys;
  chunk-level dedupe saves space.
- A metadata index maps title -> rendition -> segment.
- Use a job orchestrator with retries and dead-letter handling, and push popular
  titles to CDN edges automatically..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Netflix Streaming
client: Player
cdn: CDN
api: API Gateway
catalog: Catalog Service
drm: DRM / Auth
encode: Encoding Pipeline
recommend: Recommendations
history: Watch History
analytics: Analytics
storage: Video Storage
db: Catalog DB
cache: Metadata Cache

client ─► api ─► browse
api ─► catalog ─► title metadata
catalog ─► db ─► read
catalog ─► cache ─► read / write
client ─► drm ─► license
client ─► cdn ─► stream segments
edge upload: Studio -> encode: raw video
encode ─► storage ─► encoded chunks
cdn ─► storage ─► fetch
client ─► api ─► playback start
api ─► history ─► log
history ─► recommend ─► personalize
api ─► analytics ─► metrics
```

## Design

### Design Netflix / a video streaming service

Netflix is video-on-demand with a pipeline from studio to player.

- Studios upload raw masters; the Encoding pipeline transcodes to multiple
  resolutions and bitrates (4K down to 240p) and segments output into 2-6s
  chunks (DASH/HLS).
- Chunks are stored in object storage and replicated to CDN edge nodes for
  low-latency delivery.
- The player fetches a manifest from the API/Catalog service, then pulls
  segments from the nearest edge using adaptive bitrate streaming (ABR).
- A DRM/licensing service issues signed licenses and enforces playback rights.
- Catalog metadata lives in a DB behind a cache; Watch History and Analytics
  track playback and feed recommendations.
- The catalog/CDN routing layer picks the best edge node.
- Scalability hinges on CDN offload, amortized encode compute, and cacheable
  metadata reads.

### Why are CDNs essential for streaming? How do you pick edge servers?

A single 4K stream sustains several Mbps, so serving every request from origin
(object storage) is impossible and would congest the Internet backbone.

- CDNs replicate popular content to edge nodes near users, cutting latency,
  bandwidth cost, and origin load — without them streaming would buffer
  constantly and not scale.
- Picking an edge: use anycast DNS so users resolve to the nearest/cheapest
  node, and route by geographic proximity (RTT), node health, and current
  capacity/utilization.
- The player should also choose per-manifest based on measured bandwidth and
  latency to candidate nodes.
- Providers like Netflix's Open Connect pre-place content proactively using
  popularity heatmaps and real-time telemetry, rebalancing load as demand
  shifts.

### How do you encode and store videos at scale (transcoding pipeline)?

Ingest the raw master into object storage, then trigger a job through a queue
(SQS/Kafka) to a pool of transcoder workers.

- For each title, produce multiple rendition profiles (resolution x bitrate,
  e.g., H.264/HEVC/AV1 from 240p to 4K) segmented into DASH/HLS chunks.
- Transcoding is compute-heavy, so scale a GPU/CPU worker fleet and encode
  segments in parallel, assembling manifests afterward.
- Use tiered encoding: a baseline profile first for fast availability, enhanced
  profiles asynchronously later.
- Store outputs in object storage with content-addressed or versioned keys;
  chunk-level dedupe saves space.
- A metadata index maps title -> rendition -> segment.
- Use a job orchestrator with retries and dead-letter handling, and push popular
  titles to CDN edges automatically.

### Design a recommendation engine for movies

Use a three-stage pipeline: candidate generation, ranking, re-ranking.

- Candidates come from multiple sources — collaborative filtering (matrix
  factorization/embeddings for user-item similarity), content-based matching
  (genre, cast, metadata), and popularity/trending so new titles get exposure.
- Offline batch training (Spark/ML) produces nightly embeddings; online serving
  loads them into a vector store (FAISS/Annoy) for nearest-neighbor retrieval.
- Rank candidates with a lightweight ML model (logistic regression or gradient
  boosting) over features from a feature store (Redis): watch history, recency,
  time of day, and predicted engagement.
- Re-rank for diversity, freshness, and business constraints.
- Watch/rating events stream to Kafka to refresh embeddings and features,
  closing the feedback loop; cold-start users fall back to popularity.

### How do you resume playback across devices?

Resume requires a server-side playback position store, not local-only state.

- The client reports position periodically and on pause/exit to the Playback
  service, keyed by (user_id, content_id), with a device_id + session sequence
  so stale writes don't overwrite newer ones (at-least-once with dedupe).
- Persist to a wide-column store (Cassandra/DynamoDB) that handles high write
  volume.
- On resume, the client calls the API; the service returns the saved position,
  the last playback profile, and the manifest.
- The client seeks to max(0, position - small offset) and requests the nearest
  segment.
- For concurrent playback on multiple devices, use last-write-wins per timestamp
  or let the user pick a device; a separate "continue watching" index surfaces
  per-title resume points in the catalog UI.

## Source

```text
title: Netflix Streaming
node client: Player [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node catalog: Catalog Service [icon=search]
node drm: DRM / Auth [icon=shield]
node encode: Encoding Pipeline [icon=compute]
node recommend: Recommendations [icon=cache]
node history: Watch History [icon=file]
node analytics: Analytics [icon=worker]
node storage: Video Storage [cylinder, icon=file]
node db: Catalog DB [cylinder, icon=database]
node cache: Metadata Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> catalog: title metadata
edge catalog -> db: read
edge catalog -> cache: read / write
edge client -> drm: license
edge client -> cdn: stream segments
edge upload: Studio -> encode: raw video
edge encode -> storage: encoded chunks
edge cdn -> storage: fetch
edge client -> api: playback start
edge api -> history: log
edge history -> recommend: personalize
edge api -> analytics: metrics
```

## Q&A

### Q: Design Netflix / a video streaming service

**A:** Netflix is video-on-demand with a pipeline from studio to player.

- Studios upload raw masters; the Encoding pipeline transcodes to multiple
  resolutions and bitrates (4K down to 240p) and segments output into 2-6s
  chunks (DASH/HLS).
- Chunks are stored in object storage and replicated to CDN edge nodes for
  low-latency delivery.
- The player fetches a manifest from the API/Catalog service, then pulls
  segments from the nearest edge using adaptive bitrate streaming (ABR).
- A DRM/licensing service issues signed licenses and enforces playback rights.
- Catalog metadata lives in a DB behind a cache; Watch History and Analytics
  track playback and feed recommendations.
- The catalog/CDN routing layer picks the best edge node.
- Scalability hinges on CDN offload, amortized encode compute, and cacheable
  metadata reads.

### Q: Why are CDNs essential for streaming? How do you pick edge servers?

**A:** A single 4K stream sustains several Mbps, so serving every request from origin
(object storage) is impossible and would congest the Internet backbone.

- CDNs replicate popular content to edge nodes near users, cutting latency,
  bandwidth cost, and origin load — without them streaming would buffer
  constantly and not scale.
- Picking an edge: use anycast DNS so users resolve to the nearest/cheapest
  node, and route by geographic proximity (RTT), node health, and current
  capacity/utilization.
- The player should also choose per-manifest based on measured bandwidth and
  latency to candidate nodes.
- Providers like Netflix's Open Connect pre-place content proactively using
  popularity heatmaps and real-time telemetry, rebalancing load as demand
  shifts.

### Q: How do you encode and store videos at scale (transcoding pipeline)?

**A:** Ingest the raw master into object storage, then trigger a job through a queue
(SQS/Kafka) to a pool of transcoder workers.

- For each title, produce multiple rendition profiles (resolution x bitrate,
  e.g., H.264/HEVC/AV1 from 240p to 4K) segmented into DASH/HLS chunks.
- Transcoding is compute-heavy, so scale a GPU/CPU worker fleet and encode
  segments in parallel, assembling manifests afterward.
- Use tiered encoding: a baseline profile first for fast availability, enhanced
  profiles asynchronously later.
- Store outputs in object storage with content-addressed or versioned keys;
  chunk-level dedupe saves space.
- A metadata index maps title -> rendition -> segment.
- Use a job orchestrator with retries and dead-letter handling, and push popular
  titles to CDN edges automatically.

### Q: Design a recommendation engine for movies

**A:** Use a three-stage pipeline: candidate generation, ranking, re-ranking.

- Candidates come from multiple sources — collaborative filtering (matrix
  factorization/embeddings for user-item similarity), content-based matching
  (genre, cast, metadata), and popularity/trending so new titles get exposure.
- Offline batch training (Spark/ML) produces nightly embeddings; online serving
  loads them into a vector store (FAISS/Annoy) for nearest-neighbor retrieval.
- Rank candidates with a lightweight ML model (logistic regression or gradient
  boosting) over features from a feature store (Redis): watch history, recency,
  time of day, and predicted engagement.
- Re-rank for diversity, freshness, and business constraints.
- Watch/rating events stream to Kafka to refresh embeddings and features,
  closing the feedback loop; cold-start users fall back to popularity.

### Q: How do you resume playback across devices?

**A:** Resume requires a server-side playback position store, not local-only state.

- The client reports position periodically and on pause/exit to the Playback
  service, keyed by (user_id, content_id), with a device_id + session sequence
  so stale writes don't overwrite newer ones (at-least-once with dedupe).
- Persist to a wide-column store (Cassandra/DynamoDB) that handles high write
  volume.
- On resume, the client calls the API; the service returns the saved position,
  the last playback profile, and the manifest.
- The client seeks to max(0, position - small offset) and requests the nearest
  segment.
- For concurrent playback on multiple devices, use last-write-wins per timestamp
  or let the user pick a device; a separate "continue watching" index surfaces
  per-title resume points in the catalog UI.

## Source

```text
title: Netflix Streaming
node client: Player [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node catalog: Catalog Service [icon=search]
node drm: DRM / Auth [icon=shield]
node encode: Encoding Pipeline [icon=compute]
node recommend: Recommendations [icon=cache]
node history: Watch History [icon=file]
node analytics: Analytics [icon=worker]
node storage: Video Storage [cylinder, icon=file]
node db: Catalog DB [cylinder, icon=database]
node cache: Metadata Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> catalog: title metadata
edge catalog -> db: read
edge catalog -> cache: read / write
edge client -> drm: license
edge client -> cdn: stream segments
edge upload: Studio -> encode: raw video
edge encode -> storage: encoded chunks
edge cdn -> storage: fetch
edge client -> api: playback start
edge api -> history: log
edge history -> recommend: personalize
edge api -> analytics: metrics
```
