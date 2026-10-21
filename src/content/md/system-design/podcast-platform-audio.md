# Podcast Platform — Audio

Design a podcast platform

**Difficulty:** Easy

**Tags:** audio, social, video

## Functional Requirements

- a podcast platform
- ingest and transcode audio?
- generate RSS feeds at scale?
- track listen progress across devices?
- recommend shows to listeners?

## Non-Functional Requirements

- Creators upload episodes through the app into an Upload Service, which writes
  the raw audio to object storage and enqueues it for the Audio Pipeline.

- The pipeline transcodes the source into multiple bitrates and formats (MP3,
  AAC, opus), extracts chapters and artwork, validates loudness, and publishes
  the final files back to the Audio Store; only then does the episode become
  visible.
- The RSS Feed service generates each show's feed XML — the contract that
  podcast apps consume — and the Catalog service indexes shows and episodes for
  search and discovery.
- Listeners subscribe through the app, which writes their subscription state and
  streams playback progress to the Listen State store so an episode resumes on
  any device.
- The catalog publishes new-episode events to Notifications when a followed show
  releases.
- The platform is built for both a first-party app and third-party podcast
  clients hitting the RSS feeds, so the feed path must be cheap and cacheable
  while the app path adds personalization.
- Ingest and delivery scale independently: uploads are bursty, downloads are
  continuous, and the CDN (via signed URLs on the Audio Store) absorbs the
  delivery load..
- Progress is tracked as per-user, per-episode state — played seconds, completed
  flag, and a server-side record of the last position — so a listener can switch
  from phone to car to desktop and resume mid-episode.

- The client reports position periodically (throttled to a few seconds) to the
  API, which writes to the Listen State store, a low-latency key-value store
  keyed by (user, episode) with a small write amplification budget.
- Reads dominate at resume time, so recently listened episodes are cached per
  user.
- Conflict handling matters for offline playback: the client keeps a local
  position and merges with the server on reconnect, taking the later position or
  the most complete "listened" flag.
- Completed episodes are marked distinctly and drive auto-next behavior and
  recommendations.
- Privacy is a first-class constraint — listening history is sensitive — so the
  store is partitioned per user, retention is bounded, and aggregation for
  analytics is done on anonymized data.
- The write path is fire-and-forget with retry: a dropped progress report just
  resumes from the last synced position..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Podcast Platform
creator: Creator
app: Podcast App
api: API Gateway
upload: Upload Service
encode: Audio Pipeline
storage: Audio Store
feed: RSS Feed
catalog: Catalog Service
subscribe: Subscriptions
progress: Listen State
notify: Notifications

creator ─► app ─► upload
app ─► upload ─► submit
upload ─► encode ─► transcode
encode ─► storage ─► publish
storage ─► feed ─► update
feed ─► catalog ─► index
app ─► subscribe ─► follow
app ─► progress ─► save
progress ─► api ─► resume
catalog ─► notify ─► new episode
```

## Design

### Design a podcast platform

Creators upload episodes through the app into an Upload Service, which writes
the raw audio to object storage and enqueues it for the Audio Pipeline.

- The pipeline transcodes the source into multiple bitrates and formats (MP3,
  AAC, opus), extracts chapters and artwork, validates loudness, and publishes
  the final files back to the Audio Store; only then does the episode become
  visible.
- The RSS Feed service generates each show's feed XML — the contract that
  podcast apps consume — and the Catalog service indexes shows and episodes for
  search and discovery.
- Listeners subscribe through the app, which writes their subscription state and
  streams playback progress to the Listen State store so an episode resumes on
  any device.
- The catalog publishes new-episode events to Notifications when a followed show
  releases.
- The platform is built for both a first-party app and third-party podcast
  clients hitting the RSS feeds, so the feed path must be cheap and cacheable
  while the app path adds personalization.
- Ingest and delivery scale independently: uploads are bursty, downloads are
  continuous, and the CDN (via signed URLs on the Audio Store) absorbs the
  delivery load.

### How do you ingest and transcode audio?

Upload uses resumable, multipart uploads directly to object storage with a
presigned URL issued by the Upload Service, so the API never proxies the audio
bytes.

- A completed upload registers an episode object with the pipeline.
- The Audio Pipeline is a set of queue-driven workers: each episode goes through
  validation (format detection, duration, corrupt-frame check), normalization
  (loudness to the loudness target), and transcoding into the delivery formats.
- Transcoding is CPU-expensive, so jobs are chunked per episode and
  parallelized; each rendition is produced independently and progress is tracked
  so a worker crash resumes the missing renditions rather than restarting.
- Output is written to the Audio Store, and when all renditions are ready the
  episode transitions to published, which triggers feed regeneration and
  notification.
- The pipeline backpressures via the queue — ingest rate is capped by worker
  pool size — and failed episodes are retried with exponential backoff then
  quarantined for manual review.
- Dedup keys on the source file hash so a re-upload does not re-transcode.

### How do you generate RSS feeds at scale?

The RSS feed is the public contract, so it must be cheap to fetch and stable.

- Feeds are generated by the Feed service from the episode catalog and rendered
  as static XML that is cached aggressively — the feed URL is served from a CDN
  with a short TTL and revalidation, because thousands of podcast clients poll
  every show hourly.
- To keep feed regeneration cheap, feed XML is built on publication events
  rather than on every request: when an episode publishes, the show's cached
  feed is invalidated and rebuilt once.
- Each feed includes the full episode metadata the ecosystem expects — enclosure
  URL, duration, size, type, explicit flag, artwork — and enclosure URLs point
  to signed CDN links so downloads are tracked and revoked.
- Feed rendering is deterministic from the catalog snapshot, so a rebuild
  produces identical bytes and clients see stable guids.
- For shows with very large catalogs, pagination via `itunes:block` or
  date-limited feeds keeps the XML size bounded, and feed access logs feed
  analytics (listeners per episode) without blocking the read path.

### How do you track listen progress across devices?

Progress is tracked as per-user, per-episode state — played seconds, completed
flag, and a server-side record of the last position — so a listener can switch
from phone to car to desktop and resume mid-episode.

- The client reports position periodically (throttled to a few seconds) to the
  API, which writes to the Listen State store, a low-latency key-value store
  keyed by (user, episode) with a small write amplification budget.
- Reads dominate at resume time, so recently listened episodes are cached per
  user.
- Conflict handling matters for offline playback: the client keeps a local
  position and merges with the server on reconnect, taking the later position or
  the most complete "listened" flag.
- Completed episodes are marked distinctly and drive auto-next behavior and
  recommendations.
- Privacy is a first-class constraint — listening history is sensitive — so the
  store is partitioned per user, retention is bounded, and aggregation for
  analytics is done on anonymized data.
- The write path is fire-and-forget with retry: a dropped progress report just
  resumes from the last synced position.

### How do you recommend shows to listeners?

Recommendations combine collaborative filtering on listen history with content
signals, since most listeners have sparse data.

- The catalog tags episodes with topics, language, and publisher signals; a
  batch job computes show-to-show similarity from co-listen patterns and a
  per-user candidate pool of similar shows, ranked by predicted affinity and
  recency.
- Because the platform's first-party app has full behavior data, signals include
  subscriptions, completed vs abandoned episodes, search terms, and skips, all
  weighted and decayed over time.
- Serving is a cached rank per user (refreshed periodically) so the browse/feed
  path stays fast, and cold-start users get popularity-based picks by category.
- Exploration matters — a small fraction of recommended slots are reserved for
  new and diverse shows to avoid popularity bias, and feedback (subscribe, like,
  skip) is fed back into the next scoring run.
- The pipeline is offline-batch oriented (Spark-like job writing ranked lists),
  with lightweight online re-ranking for a just-played episode, and candidate
  generation is separated from ranking so either can be tuned independently.

## Source

```text
title: Podcast Platform
node creator: Creator [round, icon=browser]
node app: Podcast App [icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=cloud]
node encode: Audio Pipeline [icon=compute]
node storage: Audio Store [cylinder, icon=file]
node feed: RSS Feed [icon=queue]
node catalog: Catalog Service [icon=search]
node subscribe: Subscriptions [icon=users]
node progress: Listen State [cylinder, icon=cache]
node notify: Notifications [icon=message]

edge creator -> app: upload
edge app -> upload: submit
edge upload -> encode: transcode
edge encode -> storage: publish
edge storage -> feed: update
edge feed -> catalog: index
edge app -> subscribe: follow
edge app -> progress: save
edge progress -> api: resume
edge catalog -> notify: new episode
```

## Q&A

### Q: Design a podcast platform

**A:** Creators upload episodes through the app into an Upload Service, which writes
the raw audio to object storage and enqueues it for the Audio Pipeline.

- The pipeline transcodes the source into multiple bitrates and formats (MP3,
  AAC, opus), extracts chapters and artwork, validates loudness, and publishes
  the final files back to the Audio Store; only then does the episode become
  visible.
- The RSS Feed service generates each show's feed XML — the contract that
  podcast apps consume — and the Catalog service indexes shows and episodes for
  search and discovery.
- Listeners subscribe through the app, which writes their subscription state and
  streams playback progress to the Listen State store so an episode resumes on
  any device.
- The catalog publishes new-episode events to Notifications when a followed show
  releases.
- The platform is built for both a first-party app and third-party podcast
  clients hitting the RSS feeds, so the feed path must be cheap and cacheable
  while the app path adds personalization.
- Ingest and delivery scale independently: uploads are bursty, downloads are
  continuous, and the CDN (via signed URLs on the Audio Store) absorbs the
  delivery load.

### Q: How do you ingest and transcode audio?

**A:** Upload uses resumable, multipart uploads directly to object storage with a
presigned URL issued by the Upload Service, so the API never proxies the audio
bytes.

- A completed upload registers an episode object with the pipeline.
- The Audio Pipeline is a set of queue-driven workers: each episode goes through
  validation (format detection, duration, corrupt-frame check), normalization
  (loudness to the loudness target), and transcoding into the delivery formats.
- Transcoding is CPU-expensive, so jobs are chunked per episode and
  parallelized; each rendition is produced independently and progress is tracked
  so a worker crash resumes the missing renditions rather than restarting.
- Output is written to the Audio Store, and when all renditions are ready the
  episode transitions to published, which triggers feed regeneration and
  notification.
- The pipeline backpressures via the queue — ingest rate is capped by worker
  pool size — and failed episodes are retried with exponential backoff then
  quarantined for manual review.
- Dedup keys on the source file hash so a re-upload does not re-transcode.

### Q: How do you generate RSS feeds at scale?

**A:** The RSS feed is the public contract, so it must be cheap to fetch and stable.

- Feeds are generated by the Feed service from the episode catalog and rendered
  as static XML that is cached aggressively — the feed URL is served from a CDN
  with a short TTL and revalidation, because thousands of podcast clients poll
  every show hourly.
- To keep feed regeneration cheap, feed XML is built on publication events
  rather than on every request: when an episode publishes, the show's cached
  feed is invalidated and rebuilt once.
- Each feed includes the full episode metadata the ecosystem expects — enclosure
  URL, duration, size, type, explicit flag, artwork — and enclosure URLs point
  to signed CDN links so downloads are tracked and revoked.
- Feed rendering is deterministic from the catalog snapshot, so a rebuild
  produces identical bytes and clients see stable guids.
- For shows with very large catalogs, pagination via `itunes:block` or
  date-limited feeds keeps the XML size bounded, and feed access logs feed
  analytics (listeners per episode) without blocking the read path.

### Q: How do you track listen progress across devices?

**A:** Progress is tracked as per-user, per-episode state — played seconds, completed
flag, and a server-side record of the last position — so a listener can switch
from phone to car to desktop and resume mid-episode.

- The client reports position periodically (throttled to a few seconds) to the
  API, which writes to the Listen State store, a low-latency key-value store
  keyed by (user, episode) with a small write amplification budget.
- Reads dominate at resume time, so recently listened episodes are cached per
  user.
- Conflict handling matters for offline playback: the client keeps a local
  position and merges with the server on reconnect, taking the later position or
  the most complete "listened" flag.
- Completed episodes are marked distinctly and drive auto-next behavior and
  recommendations.
- Privacy is a first-class constraint — listening history is sensitive — so the
  store is partitioned per user, retention is bounded, and aggregation for
  analytics is done on anonymized data.
- The write path is fire-and-forget with retry: a dropped progress report just
  resumes from the last synced position.

### Q: How do you recommend shows to listeners?

**A:** Recommendations combine collaborative filtering on listen history with content
signals, since most listeners have sparse data.

- The catalog tags episodes with topics, language, and publisher signals; a
  batch job computes show-to-show similarity from co-listen patterns and a
  per-user candidate pool of similar shows, ranked by predicted affinity and
  recency.
- Because the platform's first-party app has full behavior data, signals include
  subscriptions, completed vs abandoned episodes, search terms, and skips, all
  weighted and decayed over time.
- Serving is a cached rank per user (refreshed periodically) so the browse/feed
  path stays fast, and cold-start users get popularity-based picks by category.
- Exploration matters — a small fraction of recommended slots are reserved for
  new and diverse shows to avoid popularity bias, and feedback (subscribe, like,
  skip) is fed back into the next scoring run.
- The pipeline is offline-batch oriented (Spark-like job writing ranked lists),
  with lightweight online re-ranking for a just-played episode, and candidate
  generation is separated from ranking so either can be tuned independently.

## Source

```text
title: Podcast Platform
node creator: Creator [round, icon=browser]
node app: Podcast App [icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=cloud]
node encode: Audio Pipeline [icon=compute]
node storage: Audio Store [cylinder, icon=file]
node feed: RSS Feed [icon=queue]
node catalog: Catalog Service [icon=search]
node subscribe: Subscriptions [icon=users]
node progress: Listen State [cylinder, icon=cache]
node notify: Notifications [icon=message]

edge creator -> app: upload
edge app -> upload: submit
edge upload -> encode: transcode
edge encode -> storage: publish
edge storage -> feed: update
edge feed -> catalog: index
edge app -> subscribe: follow
edge app -> progress: save
edge progress -> api: resume
edge catalog -> notify: new episode
```
