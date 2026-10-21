# TikTok — Short-form Video

Design a short-form video app

**Difficulty:** Medium

**Tags:** social, storage, video

## Functional Requirements

- a short-form video app
- store and serve millions of short videos?
- build the For You feed?
- make uploads fast and encoding cheap?
- handle viral spikes in traffic?

## Non-Functional Requirements

- The app has two pillars: an upload/encoding pipeline and a highly personalized
  read path.

- On upload, the client streams the video to an upload service, which queues it
  for encoding workers.
- The workers produce multiple adaptive renditions and split each into short
  segments, then publish to a video store fronted by a CDN.
- The read path is the feed: the client requests the next page, the feed service
  asks a ranker for a scored batch of candidate videos, and the videos stream
  from the CDN while the app logs watch signals (view time, likes, shares,
  skips) back to the system.
- A watch history store feeds the ranker.
- An effects service layers AR/effects on uploads.
- A notification service drives engagement.

Latency is the defining constraint.

- Scrolling to the next video must be instant, so candidate selection is
  precomputed and served from in-memory caches.
- Video delivery is CDN-only — the app itself never proxies video bytes.
- The upload path is de-coupled from the browse path: a creator's video is
  available to friends immediately (single fast rendition), while the heavy
  multi-rendition encoding happens asynchronously and upgrades quality over the
  next minutes.
- The system is built for asymmetry — a few thousand creators upload while tens
  of millions scroll.
- The feed path is optimized for cheap reads over a large, pre-scored catalog.
- The platform handles a long-tail catalog where most videos are watched by only
  a handful of users..
- Videos are stored as segmented adaptive content.

- Each upload is encoded into renditions (e.g., 1080p, 720p, 480p) and each
  rendition into ~2-second segments, all addressed by a content ID and stored in
  a distributed object store partitioned by video ID and time.
- Storing segments rather than one blob enables adaptive bitrate playback (the
  player requests per-segment from the nearest edge), cheap partial caching (an
  edge can cache the first segments that most viewers watch), and progressive
  availability (the first segment is served before later segments finish
  encoding).
- The video store keeps the full original for re-encoding, plus per-rendition
  segments for serving.
- Serving goes through a global CDN: the player requests segments from the
  nearest edge, edges pull on miss from origin, and origin pre-seeds the first
  few segments of trending videos to edges in the regions where they are
  trending.

Storage economics matter because short video is massive but mostly cold.

- The catalog metadata (video ID, creator, duration, captions, tags) lives
  separately in a metadata DB and search index, so browse never touches video
  bytes.
- Old and rarely-watched videos are moved to cheaper, colder tiers with longer
  retrieval times, while only the hot set is kept warm.
- Segment-level caching means even cold videos serve acceptably because only the
  first segments are fetched on first scroll.
- Deduplication and content hashing prevent re-uploads and link re-used clips to
  the original.
- Monitoring tracks CDN hit rate, per-segment fetch latency, and edge
  pull-back-to-origin rates.
- A low edge hit rate on a viral video is the first sign to pre-seed more edges..
- Upload speed comes from moving heavy work out of the request path.

- The client streams the video directly to the upload service with resumable,
  chunked transfer and parallel chunk upload.
- The service computes a content hash for dedupe (re-uploaded or recycled clips
  skip re-encoding), then immediately publishes a single fast rendition so the
  video is playable within seconds.
- Full encoding runs asynchronously on a GPU/CPU worker pool: the original is
  decoded once and re-encoded into multiple renditions for adaptive playback.
- A "priority-ordered" strategy — the most-watched rendition (e.g., 720p) is
  produced first, then the rest — makes quality improve progressively while the
  video is already live.
- A queue holds the jobs, and workers scale with backlog.

Cost optimization drives the encoding strategy.

- Renditions are produced on demand: a video with few views keeps only the fast
  rendition, and higher renditions are lazily generated only when the video
  shows enough watch time to justify the compute.
- Bitrate ladders are tuned per video — a static slideshow clip doesn't need
  1080p; a fast-action clip does — so the encoder picks the ladder from an
  analysis pass.
- Hardware acceleration (GPUs, ASICs) amortizes the dominant cost.
- Batch processing aligns with off-peak pricing when possible.
- Correctness is preserved by idempotent encoding jobs: a worker crash restarts
  from the source with the job marked not-done, and dedupe keys ensure the same
  content isn't encoded twice.
- Monitoring tracks upload-to-playable latency, encoding cost per video, and
  queue backlog — the leading indicators of the upload experience..
- The defense is layered.

- First, delivery: the CDN absorbs the read spike — a trending video's segments
  are pre-seeded to edges in the affected regions before the spike peaks
  (detected from early engagement velocity), so the origin sees mostly
  first-pulls.
- Segment-level caching means even a million concurrent viewers hit the same few
  hundred cached segments.
- Second, the feed path: trending candidates are pre-scored and cached, so the
  ranker is not re-run for each scroll.
- The feed service serves from the per-user cache and sheds by returning cached
  pages under load.
- Third, the upload path: dedupe and fast-rendition-only for the first minutes
  mean a viral re-upload does not trigger the full encoding ladder immediately.

Beyond capacity, viral handling is about isolation.

- The metadata DB and watch history store are sharded per user, so a flood of
  events from one viral video does not contend for other users' shards.
- The event ingestion pipeline backpressures via the queue rather than dropping.
- Rate limiting at the API gateway protects the catalog and notification
  services from retry storms when a viral push is sent.
- The platform deliberately sizes for elasticity — the worker pool and CDN burst
  scale on demand.
- Circuit breakers degrade non-critical features (effects, recommendations)
  under extreme load rather than letting one viral video take down scroll.
- Monitoring tracks per-video CDN edge hit rate, origin pull rate, and feed
  cache miss rate.
- A spike that pushes origin pulls up is the signal to pre-seed more edges
  before latency degrades.

## Source

````text
title: Short Video Feed
node user: User [round, icon=browser]
node app: Video App [icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=cloud]
node encode: Encoding Workers [icon=compute]
node storage: Video Store [cylinder, icon=file]
node feed: Feed Service [icon=compute]
node rank: Ranker [icon=cache]
node watch: Watch History [cylinder, icon=database]
node effect: Effects Service [icon=compute]
node notify: Notifications [icon=message]

edge user -> app: scroll
edge app -> feed: next videos
edge feed -> rank: score
edge rank -> storage: fetch
edge user -> app: upload
edge app -> upload: upload
edge upload -> encode: queue
edge encode -> storage: segments
edge feed -> watch: log view
edge watch -> rank: feedback
edge app -> notify: alerts
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Short Video Feed
user: User
app: Video App
api: API Gateway
upload: Upload Service
encode: Encoding Workers
storage: Video Store
feed: Feed Service
rank: Ranker
watch: Watch History
effect: Effects Service
notify: Notifications

user ─► app ─► scroll
app ─► feed ─► next videos
feed ─► rank ─► score
rank ─► storage ─► fetch
user ─► app ─► upload
app ─► upload ─► upload
upload ─► encode ─► queue
encode ─► storage ─► segments
feed ─► watch ─► log view
watch ─► rank ─► feedback
app ─► notify ─► alerts
````

## Design

### Design a short-form video app

The app has two pillars: an upload/encoding pipeline and a highly personalized
read path.

- On upload, the client streams the video to an upload service, which queues it
  for encoding workers.
- The workers produce multiple adaptive renditions and split each into short
  segments, then publish to a video store fronted by a CDN.
- The read path is the feed: the client requests the next page, the feed service
  asks a ranker for a scored batch of candidate videos, and the videos stream
  from the CDN while the app logs watch signals (view time, likes, shares,
  skips) back to the system.
- A watch history store feeds the ranker.
- An effects service layers AR/effects on uploads.
- A notification service drives engagement.

Latency is the defining constraint.

- Scrolling to the next video must be instant, so candidate selection is
  precomputed and served from in-memory caches.
- Video delivery is CDN-only — the app itself never proxies video bytes.
- The upload path is de-coupled from the browse path: a creator's video is
  available to friends immediately (single fast rendition), while the heavy
  multi-rendition encoding happens asynchronously and upgrades quality over the
  next minutes.
- The system is built for asymmetry — a few thousand creators upload while tens
  of millions scroll.
- The feed path is optimized for cheap reads over a large, pre-scored catalog.
- The platform handles a long-tail catalog where most videos are watched by only
  a handful of users.

### How do you store and serve millions of short videos?

Videos are stored as segmented adaptive content.

- Each upload is encoded into renditions (e.g., 1080p, 720p, 480p) and each
  rendition into ~2-second segments, all addressed by a content ID and stored in
  a distributed object store partitioned by video ID and time.
- Storing segments rather than one blob enables adaptive bitrate playback (the
  player requests per-segment from the nearest edge), cheap partial caching (an
  edge can cache the first segments that most viewers watch), and progressive
  availability (the first segment is served before later segments finish
  encoding).
- The video store keeps the full original for re-encoding, plus per-rendition
  segments for serving.
- Serving goes through a global CDN: the player requests segments from the
  nearest edge, edges pull on miss from origin, and origin pre-seeds the first
  few segments of trending videos to edges in the regions where they are
  trending.

Storage economics matter because short video is massive but mostly cold.

- The catalog metadata (video ID, creator, duration, captions, tags) lives
  separately in a metadata DB and search index, so browse never touches video
  bytes.
- Old and rarely-watched videos are moved to cheaper, colder tiers with longer
  retrieval times, while only the hot set is kept warm.
- Segment-level caching means even cold videos serve acceptably because only the
  first segments are fetched on first scroll.
- Deduplication and content hashing prevent re-uploads and link re-used clips to
  the original.
- Monitoring tracks CDN hit rate, per-segment fetch latency, and edge
  pull-back-to-origin rates.
- A low edge hit rate on a viral video is the first sign to pre-seed more edges.

### How do you build the For You feed?

The For You feed is a two-stage ranking system: candidate generation then
scoring.

- Candidate generation gathers a few hundred videos from multiple sources —
  following, topic clusters, related-to-recently-watched, and a global sample of
  fresh/popular content — using a lightweight retrieval from the video catalog
  (embedding similarity via an ANN index or tag-based filters) so the scorer
  sees a tractable candidate set.
- The ranker scores each candidate with a model (gradient-boosted trees or a
  neural ranker) over features: the user's watch history (viewed, liked, shared,
  skipped and for how long), video features (creator, topic, engagement
  velocity, recency), and context (time of day, network).
- Scores blend predicted engagement and diversity/exploration.
- A feed that only shows lookalikes kills retention, so the ranker adds an
  exploration term that varies over time and surface.

The feed is served from precomputed and cached state.

- Because per-request ranking over millions of videos is infeasible, each user's
  candidate pool and a ranked list are precomputed in batch (updated as watch
  history accumulates), refreshed in the background, and stored in a per-user
  feed cache.
- The feed service serves page N by slicing the cached list, and the client's
  skip signals trigger an asynchronous re-rank.
- The hard part is freshness vs cost: a fresh viral video must surface quickly,
  so the batch pipeline runs frequently (minutes, not days) and injects trending
  items on top of the ranked base list.
- Cold-start users get the global-trending blend until the model has watch data.
- Analytics loops back continuously — every scroll is logged.
- The ranker is retrained on engagement data.
- Feed quality is tracked by metrics like per-session watch time and
  skip-at-first-second rate.

### How do you make uploads fast and encoding cheap?

Upload speed comes from moving heavy work out of the request path.

- The client streams the video directly to the upload service with resumable,
  chunked transfer and parallel chunk upload.
- The service computes a content hash for dedupe (re-uploaded or recycled clips
  skip re-encoding), then immediately publishes a single fast rendition so the
  video is playable within seconds.
- Full encoding runs asynchronously on a GPU/CPU worker pool: the original is
  decoded once and re-encoded into multiple renditions for adaptive playback.
- A "priority-ordered" strategy — the most-watched rendition (e.g., 720p) is
  produced first, then the rest — makes quality improve progressively while the
  video is already live.
- A queue holds the jobs, and workers scale with backlog.

Cost optimization drives the encoding strategy.

- Renditions are produced on demand: a video with few views keeps only the fast
  rendition, and higher renditions are lazily generated only when the video
  shows enough watch time to justify the compute.
- Bitrate ladders are tuned per video — a static slideshow clip doesn't need
  1080p; a fast-action clip does — so the encoder picks the ladder from an
  analysis pass.
- Hardware acceleration (GPUs, ASICs) amortizes the dominant cost.
- Batch processing aligns with off-peak pricing when possible.
- Correctness is preserved by idempotent encoding jobs: a worker crash restarts
  from the source with the job marked not-done, and dedupe keys ensure the same
  content isn't encoded twice.
- Monitoring tracks upload-to-playable latency, encoding cost per video, and
  queue backlog — the leading indicators of the upload experience.

### How do you handle viral spikes in traffic?

A viral spike is a super-linear burst of reads on a handful of videos plus a
surge of new uploads imitating the trend. The defense is layered.

- First, delivery: the CDN absorbs the read spike — a trending video's segments
  are pre-seeded to edges in the affected regions before the spike peaks
  (detected from early engagement velocity), so the origin sees mostly
  first-pulls.
- Segment-level caching means even a million concurrent viewers hit the same few
  hundred cached segments.
- Second, the feed path: trending candidates are pre-scored and cached, so the
  ranker is not re-run for each scroll.
- The feed service serves from the per-user cache and sheds by returning cached
  pages under load.
- Third, the upload path: dedupe and fast-rendition-only for the first minutes
  mean a viral re-upload does not trigger the full encoding ladder immediately.

Beyond capacity, viral handling is about isolation.

- The metadata DB and watch history store are sharded per user, so a flood of
  events from one viral video does not contend for other users' shards.
- The event ingestion pipeline backpressures via the queue rather than dropping.
- Rate limiting at the API gateway protects the catalog and notification
  services from retry storms when a viral push is sent.
- The platform deliberately sizes for elasticity — the worker pool and CDN burst
  scale on demand.
- Circuit breakers degrade non-critical features (effects, recommendations)
  under extreme load rather than letting one viral video take down scroll.
- Monitoring tracks per-video CDN edge hit rate, origin pull rate, and feed
  cache miss rate.
- A spike that pushes origin pulls up is the signal to pre-seed more edges
  before latency degrades.

## Source

```text
title: Short Video Feed
node user: User [round, icon=browser]
node app: Video App [icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=cloud]
node encode: Encoding Workers [icon=compute]
node storage: Video Store [cylinder, icon=file]
node feed: Feed Service [icon=compute]
node rank: Ranker [icon=cache]
node watch: Watch History [cylinder, icon=database]
node effect: Effects Service [icon=compute]
node notify: Notifications [icon=message]

edge user -> app: scroll
edge app -> feed: next videos
edge feed -> rank: score
edge rank -> storage: fetch
edge user -> app: upload
edge app -> upload: upload
edge upload -> encode: queue
edge encode -> storage: segments
edge feed -> watch: log view
edge watch -> rank: feedback
edge app -> notify: alerts
```

## Q&A

### Q: Design a short-form video app

**A:** The app has two pillars: an upload/encoding pipeline and a highly personalized
read path.

- On upload, the client streams the video to an upload service, which queues it
  for encoding workers.
- The workers produce multiple adaptive renditions and split each into short
  segments, then publish to a video store fronted by a CDN.
- The read path is the feed: the client requests the next page, the feed service
  asks a ranker for a scored batch of candidate videos, and the videos stream
  from the CDN while the app logs watch signals (view time, likes, shares,
  skips) back to the system.
- A watch history store feeds the ranker.
- An effects service layers AR/effects on uploads.
- A notification service drives engagement.

Latency is the defining constraint.

- Scrolling to the next video must be instant, so candidate selection is
  precomputed and served from in-memory caches.
- Video delivery is CDN-only — the app itself never proxies video bytes.
- The upload path is de-coupled from the browse path: a creator's video is
  available to friends immediately (single fast rendition), while the heavy
  multi-rendition encoding happens asynchronously and upgrades quality over the
  next minutes.
- The system is built for asymmetry — a few thousand creators upload while tens
  of millions scroll.
- The feed path is optimized for cheap reads over a large, pre-scored catalog.
- The platform handles a long-tail catalog where most videos are watched by only
  a handful of users.

### Q: How do you store and serve millions of short videos?

**A:** Videos are stored as segmented adaptive content.

- Each upload is encoded into renditions (e.g., 1080p, 720p, 480p) and each
  rendition into ~2-second segments, all addressed by a content ID and stored in
  a distributed object store partitioned by video ID and time.
- Storing segments rather than one blob enables adaptive bitrate playback (the
  player requests per-segment from the nearest edge), cheap partial caching (an
  edge can cache the first segments that most viewers watch), and progressive
  availability (the first segment is served before later segments finish
  encoding).
- The video store keeps the full original for re-encoding, plus per-rendition
  segments for serving.
- Serving goes through a global CDN: the player requests segments from the
  nearest edge, edges pull on miss from origin, and origin pre-seeds the first
  few segments of trending videos to edges in the regions where they are
  trending.

Storage economics matter because short video is massive but mostly cold.

- The catalog metadata (video ID, creator, duration, captions, tags) lives
  separately in a metadata DB and search index, so browse never touches video
  bytes.
- Old and rarely-watched videos are moved to cheaper, colder tiers with longer
  retrieval times, while only the hot set is kept warm.
- Segment-level caching means even cold videos serve acceptably because only the
  first segments are fetched on first scroll.
- Deduplication and content hashing prevent re-uploads and link re-used clips to
  the original.
- Monitoring tracks CDN hit rate, per-segment fetch latency, and edge
  pull-back-to-origin rates.
- A low edge hit rate on a viral video is the first sign to pre-seed more edges.

### Q: How do you build the For You feed?

**A:** The For You feed is a two-stage ranking system: candidate generation then
scoring.

- Candidate generation gathers a few hundred videos from multiple sources —
  following, topic clusters, related-to-recently-watched, and a global sample of
  fresh/popular content — using a lightweight retrieval from the video catalog
  (embedding similarity via an ANN index or tag-based filters) so the scorer
  sees a tractable candidate set.
- The ranker scores each candidate with a model (gradient-boosted trees or a
  neural ranker) over features: the user's watch history (viewed, liked, shared,
  skipped and for how long), video features (creator, topic, engagement
  velocity, recency), and context (time of day, network).
- Scores blend predicted engagement and diversity/exploration.
- A feed that only shows lookalikes kills retention, so the ranker adds an
  exploration term that varies over time and surface.

The feed is served from precomputed and cached state.

- Because per-request ranking over millions of videos is infeasible, each user's
  candidate pool and a ranked list are precomputed in batch (updated as watch
  history accumulates), refreshed in the background, and stored in a per-user
  feed cache.
- The feed service serves page N by slicing the cached list, and the client's
  skip signals trigger an asynchronous re-rank.
- The hard part is freshness vs cost: a fresh viral video must surface quickly,
  so the batch pipeline runs frequently (minutes, not days) and injects trending
  items on top of the ranked base list.
- Cold-start users get the global-trending blend until the model has watch data.
- Analytics loops back continuously — every scroll is logged.
- The ranker is retrained on engagement data.
- Feed quality is tracked by metrics like per-session watch time and
  skip-at-first-second rate.

### Q: How do you make uploads fast and encoding cheap?

**A:** Upload speed comes from moving heavy work out of the request path.

- The client streams the video directly to the upload service with resumable,
  chunked transfer and parallel chunk upload.
- The service computes a content hash for dedupe (re-uploaded or recycled clips
  skip re-encoding), then immediately publishes a single fast rendition so the
  video is playable within seconds.
- Full encoding runs asynchronously on a GPU/CPU worker pool: the original is
  decoded once and re-encoded into multiple renditions for adaptive playback.
- A "priority-ordered" strategy — the most-watched rendition (e.g., 720p) is
  produced first, then the rest — makes quality improve progressively while the
  video is already live.
- A queue holds the jobs, and workers scale with backlog.

Cost optimization drives the encoding strategy.

- Renditions are produced on demand: a video with few views keeps only the fast
  rendition, and higher renditions are lazily generated only when the video
  shows enough watch time to justify the compute.
- Bitrate ladders are tuned per video — a static slideshow clip doesn't need
  1080p; a fast-action clip does — so the encoder picks the ladder from an
  analysis pass.
- Hardware acceleration (GPUs, ASICs) amortizes the dominant cost.
- Batch processing aligns with off-peak pricing when possible.
- Correctness is preserved by idempotent encoding jobs: a worker crash restarts
  from the source with the job marked not-done, and dedupe keys ensure the same
  content isn't encoded twice.
- Monitoring tracks upload-to-playable latency, encoding cost per video, and
  queue backlog — the leading indicators of the upload experience.

### Q: How do you handle viral spikes in traffic?

**A:** A viral spike is a super-linear burst of reads on a handful of videos plus a
surge of new uploads imitating the trend. The defense is layered.

- First, delivery: the CDN absorbs the read spike — a trending video's segments
  are pre-seeded to edges in the affected regions before the spike peaks
  (detected from early engagement velocity), so the origin sees mostly
  first-pulls.
- Segment-level caching means even a million concurrent viewers hit the same few
  hundred cached segments.
- Second, the feed path: trending candidates are pre-scored and cached, so the
  ranker is not re-run for each scroll.
- The feed service serves from the per-user cache and sheds by returning cached
  pages under load.
- Third, the upload path: dedupe and fast-rendition-only for the first minutes
  mean a viral re-upload does not trigger the full encoding ladder immediately.

Beyond capacity, viral handling is about isolation.

- The metadata DB and watch history store are sharded per user, so a flood of
  events from one viral video does not contend for other users' shards.
- The event ingestion pipeline backpressures via the queue rather than dropping.
- Rate limiting at the API gateway protects the catalog and notification
  services from retry storms when a viral push is sent.
- The platform deliberately sizes for elasticity — the worker pool and CDN burst
  scale on demand.
- Circuit breakers degrade non-critical features (effects, recommendations)
  under extreme load rather than letting one viral video take down scroll.
- Monitoring tracks per-video CDN edge hit rate, origin pull rate, and feed
  cache miss rate.
- A spike that pushes origin pulls up is the signal to pre-seed more edges
  before latency degrades.

## Source

```text
title: Short Video Feed
node user: User [round, icon=browser]
node app: Video App [icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=cloud]
node encode: Encoding Workers [icon=compute]
node storage: Video Store [cylinder, icon=file]
node feed: Feed Service [icon=compute]
node rank: Ranker [icon=cache]
node watch: Watch History [cylinder, icon=database]
node effect: Effects Service [icon=compute]
node notify: Notifications [icon=message]

edge user -> app: scroll
edge app -> feed: next videos
edge feed -> rank: score
edge rank -> storage: fetch
edge user -> app: upload
edge app -> upload: upload
edge upload -> encode: queue
edge encode -> storage: segments
edge feed -> watch: log view
edge watch -> rank: feedback
edge app -> notify: alerts
```
