# YouTube — Video Sharing

Design YouTube / a video-sharing platform

**Difficulty:** Hard

**Tags:** cdn, social, video

## Functional Requirements

- YouTube / a video-sharing platform
- process and store uploaded videos at scale?
- stream video with adaptive bitrate and low startup latency?
- a recommendation system for videos
- support live streaming alongside video-on-demand?

## Non-Functional Requirements

- Uploads are decoupled from processing.

- The client receives a presigned upload URL pointing at blob storage and
  streams the raw file in chunks with resumable PUT semantics.
- A dropped connection resumes from the last acknowledged byte instead of
  restarting.
- When the final part lands, an upload-complete event is enqueued.
- A worker set pulls it, verifies checksums, scans for malware and duplicate
  content (content-hash match against existing videos), and submits transcode
  jobs.
- Splitting the file into GOP-aligned segments lets each segment be transcoded
  as an independent job.
- This gives massive parallelism across a GPU/CPU pool.

Each rendition is produced as a sequence of HLS/DASH segments (2–6 seconds) plus
a manifest.

- Segments are written back to blob storage under a per-video prefix.
- A metadata row records which renditions are ready so the watch path only
  advertises what exists.
- Per-title encoding decides the codec and resolution ladder from the source's
  bitrate and motion.
- A talking-head vlog doesn't waste 4K encode minutes on content that looks
  identical at 1080p.
- Lazy transcoding renders only qualities actually requested and fills in the
  rest on demand.

Storage uses content-addressed chunking for deduplication and erasure coding or
3-way replication for durability.

- Cold videos are tiered to cheaper archive media, since only a small fraction
  of uploads ever get views.
- Popular videos are pre-populated onto the CDN at encode time.
- The encode queue must size for spikes — a trending upload can need hundreds of
  jobs.
- Workers scale with queue depth.
- Jobs carry idempotency keys for retry.

Cost is the dominant trade-off: every resolution multiplies stored bytes and
CPU.

- Tiering and per-title encoding exist to keep spend in check.
- Failure handling requires checkpointing per segment — a worker dying mid-video
  restarts only unfinished segments.
- A dead-letter queue for permanently failed encodes marks the video failed and
  notifies the uploader.
- Metrics on encode success rate and queue lag feed capacity planning..
- Adaptive bitrate rests on segmented delivery.

- The encode pipeline emits each rendition as short segments plus a master
  manifest listing them.
- The player measures throughput and switches quality between segments by
  picking a matching rendition from the manifest.
- HLS and DASH both support this.
- For live-adjacent latency you add LL-HLS or CMAF chunked delivery, where a
  single segment is streamed as smaller chunks.
- This cuts startup to a couple of seconds.

The ABR algorithm is the player's core.

- It estimates bandwidth with a smoothed exponential moving average.
- It predicts buffer drain.
- It selects the largest quality that won't stall.
- Hysteresis and settling timers prevent oscillation between adjacent ladders.
- An emergency mode drops two tiers at once when the buffer is nearly empty.

Startup latency is attacked on the serving side.

- The player fetches the manifest and the smallest-quality first segment
  immediately while estimating bandwidth.
- Segments are 2–6 seconds (shorter lowers latency, longer improves compression
  and cuts request rate).
- HTTP/2 or QUIC multiplexes segments.
- The CDN caches the manifest, thumbnails, and first segments per video so the
  first bytes come from an edge.
- Anycast and geo-based edge selection put the CDN node close to the viewer.

The trade-off is segment granularity versus overhead and compression.

- Tiny segments add per-request overhead and hurt compression ratios.
- You pick the chunk size by measured playback behavior.
- Popularity shapes caching — hot videos are pre-populated on edges, cold
  long-tail content is fetched through and cached after first view.
- On failure, the player retries lower-quality renditions and switches CDNs.
- Multi-CDN and origin offload keep a spike from starving playback..
- Live shares the VOD substrate but inverts the pipeline.

- A streamer publishes via RTMP/SRT to an ingest cluster.
- An encoder takes that single feed and produces several renditions as
  LL-HLS/CMAF segments pushed continuously to the CDN.
- Because every viewer watches the same segments, the CDN's natural caching does
  the fan-out.
- One ingest feed can reach millions.
- The player is the same adaptive-bitrate client used for VOD — only the
  manifest is different.

Latency is the key difference: end-to-end below a few seconds.

- Chunked CMAF with ~2-second groups achieves this while keeping scalability.
- A recording service subscribes to the segments and archives them into the same
  blob storage used for VOD.
- A stream becomes watchable as a replay the moment it ends.
- Chat, reactions, and moderation attach to the ingest path.
- DVR windows let late joiners scrub back through the stream.

Scaling means placing ingest and transcode capacity near the streamer and using
regional relays to bridge continents.

- If the encoder dies, a redundant ingest path takes over with stream
  continuity.
- Very large events use enterprise/eCDN or multicast-style delivery on top of
  the public CDN to cut egress cost.
- Transcoding live is real-time, so the pipeline must keep end-to-end encode
  delay under a second per rendition.

The trade-off is latency versus scale.

- Unicasting a separate stream per viewer doesn't scale, so you accept
  segment-group latency to inherit the CDN.
- Failure handling includes auto-restart on stream drop.
- Status notifications cover stream events.
- Recording resumption ensures archives aren't lost mid-outage.
- QoE metrics track buffering and join time separately for live and VOD.

## Source

````text
title: YouTube Video Sharing
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=file]
node encode: Encoding Pipeline [icon=compute]
node catalog: Catalog Service [icon=search]
node recs: Recommendations [icon=cache]
node comment: Comments [icon=message]
node notify: Notifications [icon=mail]
node storage: Video Storage [cylinder, icon=file]
node db: Metadata DB [cylinder, icon=database]
node cache: Metadata Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> catalog: metadata
edge catalog -> db: read
edge catalog -> cache: read / write
edge client -> api: upload video
edge api -> upload: accept
edge upload -> encode: transcode
edge encode -> storage: chunks
edge client -> api: watch
edge api -> recs: personalize
edge client -> cdn: stream
edge cdn -> storage: fetch
edge api -> comment: post
edge comment -> notify: alerts
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: YouTube Video Sharing
client: Client
cdn: CDN
api: API Gateway
upload: Upload Service
encode: Encoding Pipeline
catalog: Catalog Service
recs: Recommendations
comment: Comments
notify: Notifications
storage: Video Storage
db: Metadata DB
cache: Metadata Cache

client ─► api ─► browse
api ─► catalog ─► metadata
catalog ─► db ─► read
catalog ─► cache ─► read / write
client ─► api ─► upload video
api ─► upload ─► accept
upload ─► encode ─► transcode
encode ─► storage ─► chunks
client ─► api ─► watch
api ─► recs ─► personalize
client ─► cdn ─► stream
cdn ─► storage ─► fetch
api ─► comment ─► post
comment ─► notify ─► alerts
````

## Design

### Design YouTube / a video-sharing platform

The system splits cleanly into a control plane and a media plane.

- Clients talk to an API gateway for metadata, comments, and subscriptions,
  while bytes travel separately.
- Uploads go to an Upload Service, are transcoded by an Encoding Pipeline, and
  land as content-addressed chunks in Video Storage (blob storage) fronted by a
  CDN.
- On watch, the client asks the Catalog Service for the asset manifest and then
  streams segments straight from the CDN.
- The API never touches heavy payloads.
- Metadata — title, channel, duration, quality labels, thumbnails — lives in a
  Metadata DB read through a hot cache.
- Supporting services attach to the write path: Comments persist and fan out
  notifications.
- View events feed the Recommendations service.

Data models are small and denormalized for a read-heavy workload.

- A `videos` table keyed by video ID tracks status (uploading, processing,
  ready), author, and availability time.
- A `streams` table maps a quality label (144p–4K) and codec (H.264, VP9, AV1)
  to an object key and byte range.
- `subscriptions` holds (channel, subscriber) pairs used for fan-out.
- `comments` is keyed by video and timestamp.
- Status is duplicated on the row because the watch path reads it on every
  request while writes are rare.

Trade-offs shape most decisions.

- Transcoding amplifies storage cost several-fold, so you tier object storage
  (hot, warm, cold archive) and transcode lazily — render only the qualities
  viewers actually request.
- Encoding is CPU-heavy, so the pipeline is asynchronous with a job queue.
- A video becomes playable as soon as the lowest rendition is ready.
- Failure handling means resumable chunked uploads.
- Encode jobs are retryable with a dead-letter queue.
- CDN-absorbed playback spikes keep origin storage from ever being the
  bottleneck.
- Metadata is eventually consistent; the catalog propagates asynchronously and
  readers retry.

### How do you process and store uploaded videos at scale?

Uploads are decoupled from processing.

- The client receives a presigned upload URL pointing at blob storage and
  streams the raw file in chunks with resumable PUT semantics.
- A dropped connection resumes from the last acknowledged byte instead of
  restarting.
- When the final part lands, an upload-complete event is enqueued.
- A worker set pulls it, verifies checksums, scans for malware and duplicate
  content (content-hash match against existing videos), and submits transcode
  jobs.
- Splitting the file into GOP-aligned segments lets each segment be transcoded
  as an independent job.
- This gives massive parallelism across a GPU/CPU pool.

Each rendition is produced as a sequence of HLS/DASH segments (2–6 seconds) plus
a manifest.

- Segments are written back to blob storage under a per-video prefix.
- A metadata row records which renditions are ready so the watch path only
  advertises what exists.
- Per-title encoding decides the codec and resolution ladder from the source's
  bitrate and motion.
- A talking-head vlog doesn't waste 4K encode minutes on content that looks
  identical at 1080p.
- Lazy transcoding renders only qualities actually requested and fills in the
  rest on demand.

Storage uses content-addressed chunking for deduplication and erasure coding or
3-way replication for durability.

- Cold videos are tiered to cheaper archive media, since only a small fraction
  of uploads ever get views.
- Popular videos are pre-populated onto the CDN at encode time.
- The encode queue must size for spikes — a trending upload can need hundreds of
  jobs.
- Workers scale with queue depth.
- Jobs carry idempotency keys for retry.

Cost is the dominant trade-off: every resolution multiplies stored bytes and
CPU.

- Tiering and per-title encoding exist to keep spend in check.
- Failure handling requires checkpointing per segment — a worker dying mid-video
  restarts only unfinished segments.
- A dead-letter queue for permanently failed encodes marks the video failed and
  notifies the uploader.
- Metrics on encode success rate and queue lag feed capacity planning.

### How do you stream video with adaptive bitrate and low startup latency?

Adaptive bitrate rests on segmented delivery.

- The encode pipeline emits each rendition as short segments plus a master
  manifest listing them.
- The player measures throughput and switches quality between segments by
  picking a matching rendition from the manifest.
- HLS and DASH both support this.
- For live-adjacent latency you add LL-HLS or CMAF chunked delivery, where a
  single segment is streamed as smaller chunks.
- This cuts startup to a couple of seconds.

The ABR algorithm is the player's core.

- It estimates bandwidth with a smoothed exponential moving average.
- It predicts buffer drain.
- It selects the largest quality that won't stall.
- Hysteresis and settling timers prevent oscillation between adjacent ladders.
- An emergency mode drops two tiers at once when the buffer is nearly empty.

Startup latency is attacked on the serving side.

- The player fetches the manifest and the smallest-quality first segment
  immediately while estimating bandwidth.
- Segments are 2–6 seconds (shorter lowers latency, longer improves compression
  and cuts request rate).
- HTTP/2 or QUIC multiplexes segments.
- The CDN caches the manifest, thumbnails, and first segments per video so the
  first bytes come from an edge.
- Anycast and geo-based edge selection put the CDN node close to the viewer.

The trade-off is segment granularity versus overhead and compression.

- Tiny segments add per-request overhead and hurt compression ratios.
- You pick the chunk size by measured playback behavior.
- Popularity shapes caching — hot videos are pre-populated on edges, cold
  long-tail content is fetched through and cached after first view.
- On failure, the player retries lower-quality renditions and switches CDNs.
- Multi-CDN and origin offload keep a spike from starving playback.

### Design a recommendation system for videos

Recommendations run as a two-stage pipeline: candidate generation then ranking.

- Candidates come from multiple sources — collaborative filtering over co-viewed
  and co-liked video pairs, content similarity from titles/descriptions/tags and
  video embeddings, subscription and channel signals, trending, and user
  history.
- Candidate generation runs offline in batch jobs that output per-user lists of
  a few thousand candidates.
- A lightweight online path covers fresh videos so a video published minutes ago
  can still surface.

Ranking is a learned model — typically a two-tower embedding model for candidate
recall plus a deep CTR/watch-time model for the final order.

- It is scored from features like predicted watch time, completion rate,
  freshness, language, and diversity penalties.
- The top-N per user are cached so a feed request is one cache read, not a model
  invocation.
- Exploration is deliberate: a small fraction of slots serve lower-confidence
  items to gather labels.
- This trades short-term accuracy for long-term signal.

The pipeline consumes every view, like, and search event into an analytics
platform.

- Events are aggregated into training data, and models refresh on a schedule.
- Online serving reads features from a feature store so a model update doesn't
  require retraining the whole system.
- Freshness matters — a model that can't see today's trends recommends
  yesterday's content.
- Incremental updates and feature recomputation run continuously.

Cold start falls back to trending and popular-in-region content.

- New videos inherit candidates from similar items.
- Trade-offs include diversity versus engagement (pure CTR feeds narrow the
  experience and drive echo chambers).
- Other trade-offs are freshness versus training stability, and
  privacy-sensitive signals.
- Scaling means sharding users across model servers and serving top-N from a
  distributed cache with a merge fallback.
- A/B testing gates every model change.

### How do you support live streaming alongside video-on-demand?

Live shares the VOD substrate but inverts the pipeline.

- A streamer publishes via RTMP/SRT to an ingest cluster.
- An encoder takes that single feed and produces several renditions as
  LL-HLS/CMAF segments pushed continuously to the CDN.
- Because every viewer watches the same segments, the CDN's natural caching does
  the fan-out.
- One ingest feed can reach millions.
- The player is the same adaptive-bitrate client used for VOD — only the
  manifest is different.

Latency is the key difference: end-to-end below a few seconds.

- Chunked CMAF with ~2-second groups achieves this while keeping scalability.
- A recording service subscribes to the segments and archives them into the same
  blob storage used for VOD.
- A stream becomes watchable as a replay the moment it ends.
- Chat, reactions, and moderation attach to the ingest path.
- DVR windows let late joiners scrub back through the stream.

Scaling means placing ingest and transcode capacity near the streamer and using
regional relays to bridge continents.

- If the encoder dies, a redundant ingest path takes over with stream
  continuity.
- Very large events use enterprise/eCDN or multicast-style delivery on top of
  the public CDN to cut egress cost.
- Transcoding live is real-time, so the pipeline must keep end-to-end encode
  delay under a second per rendition.

The trade-off is latency versus scale.

- Unicasting a separate stream per viewer doesn't scale, so you accept
  segment-group latency to inherit the CDN.
- Failure handling includes auto-restart on stream drop.
- Status notifications cover stream events.
- Recording resumption ensures archives aren't lost mid-outage.
- QoE metrics track buffering and join time separately for live and VOD.

## Source

```text
title: YouTube Video Sharing
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=file]
node encode: Encoding Pipeline [icon=compute]
node catalog: Catalog Service [icon=search]
node recs: Recommendations [icon=cache]
node comment: Comments [icon=message]
node notify: Notifications [icon=mail]
node storage: Video Storage [cylinder, icon=file]
node db: Metadata DB [cylinder, icon=database]
node cache: Metadata Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> catalog: metadata
edge catalog -> db: read
edge catalog -> cache: read / write
edge client -> api: upload video
edge api -> upload: accept
edge upload -> encode: transcode
edge encode -> storage: chunks
edge client -> api: watch
edge api -> recs: personalize
edge client -> cdn: stream
edge cdn -> storage: fetch
edge api -> comment: post
edge comment -> notify: alerts
```

## Q&A

### Q: Design YouTube / a video-sharing platform

**A:** The system splits cleanly into a control plane and a media plane.

- Clients talk to an API gateway for metadata, comments, and subscriptions,
  while bytes travel separately.
- Uploads go to an Upload Service, are transcoded by an Encoding Pipeline, and
  land as content-addressed chunks in Video Storage (blob storage) fronted by a
  CDN.
- On watch, the client asks the Catalog Service for the asset manifest and then
  streams segments straight from the CDN.
- The API never touches heavy payloads.
- Metadata — title, channel, duration, quality labels, thumbnails — lives in a
  Metadata DB read through a hot cache.
- Supporting services attach to the write path: Comments persist and fan out
  notifications.
- View events feed the Recommendations service.

Data models are small and denormalized for a read-heavy workload.

- A `videos` table keyed by video ID tracks status (uploading, processing,
  ready), author, and availability time.
- A `streams` table maps a quality label (144p–4K) and codec (H.264, VP9, AV1)
  to an object key and byte range.
- `subscriptions` holds (channel, subscriber) pairs used for fan-out.
- `comments` is keyed by video and timestamp.
- Status is duplicated on the row because the watch path reads it on every
  request while writes are rare.

Trade-offs shape most decisions.

- Transcoding amplifies storage cost several-fold, so you tier object storage
  (hot, warm, cold archive) and transcode lazily — render only the qualities
  viewers actually request.
- Encoding is CPU-heavy, so the pipeline is asynchronous with a job queue.
- A video becomes playable as soon as the lowest rendition is ready.
- Failure handling means resumable chunked uploads.
- Encode jobs are retryable with a dead-letter queue.
- CDN-absorbed playback spikes keep origin storage from ever being the
  bottleneck.
- Metadata is eventually consistent; the catalog propagates asynchronously and
  readers retry.

### Q: How do you process and store uploaded videos at scale?

**A:** Uploads are decoupled from processing.

- The client receives a presigned upload URL pointing at blob storage and
  streams the raw file in chunks with resumable PUT semantics.
- A dropped connection resumes from the last acknowledged byte instead of
  restarting.
- When the final part lands, an upload-complete event is enqueued.
- A worker set pulls it, verifies checksums, scans for malware and duplicate
  content (content-hash match against existing videos), and submits transcode
  jobs.
- Splitting the file into GOP-aligned segments lets each segment be transcoded
  as an independent job.
- This gives massive parallelism across a GPU/CPU pool.

Each rendition is produced as a sequence of HLS/DASH segments (2–6 seconds) plus
a manifest.

- Segments are written back to blob storage under a per-video prefix.
- A metadata row records which renditions are ready so the watch path only
  advertises what exists.
- Per-title encoding decides the codec and resolution ladder from the source's
  bitrate and motion.
- A talking-head vlog doesn't waste 4K encode minutes on content that looks
  identical at 1080p.
- Lazy transcoding renders only qualities actually requested and fills in the
  rest on demand.

Storage uses content-addressed chunking for deduplication and erasure coding or
3-way replication for durability.

- Cold videos are tiered to cheaper archive media, since only a small fraction
  of uploads ever get views.
- Popular videos are pre-populated onto the CDN at encode time.
- The encode queue must size for spikes — a trending upload can need hundreds of
  jobs.
- Workers scale with queue depth.
- Jobs carry idempotency keys for retry.

Cost is the dominant trade-off: every resolution multiplies stored bytes and
CPU.

- Tiering and per-title encoding exist to keep spend in check.
- Failure handling requires checkpointing per segment — a worker dying mid-video
  restarts only unfinished segments.
- A dead-letter queue for permanently failed encodes marks the video failed and
  notifies the uploader.
- Metrics on encode success rate and queue lag feed capacity planning.

### Q: How do you stream video with adaptive bitrate and low startup latency?

**A:** Adaptive bitrate rests on segmented delivery.

- The encode pipeline emits each rendition as short segments plus a master
  manifest listing them.
- The player measures throughput and switches quality between segments by
  picking a matching rendition from the manifest.
- HLS and DASH both support this.
- For live-adjacent latency you add LL-HLS or CMAF chunked delivery, where a
  single segment is streamed as smaller chunks.
- This cuts startup to a couple of seconds.

The ABR algorithm is the player's core.

- It estimates bandwidth with a smoothed exponential moving average.
- It predicts buffer drain.
- It selects the largest quality that won't stall.
- Hysteresis and settling timers prevent oscillation between adjacent ladders.
- An emergency mode drops two tiers at once when the buffer is nearly empty.

Startup latency is attacked on the serving side.

- The player fetches the manifest and the smallest-quality first segment
  immediately while estimating bandwidth.
- Segments are 2–6 seconds (shorter lowers latency, longer improves compression
  and cuts request rate).
- HTTP/2 or QUIC multiplexes segments.
- The CDN caches the manifest, thumbnails, and first segments per video so the
  first bytes come from an edge.
- Anycast and geo-based edge selection put the CDN node close to the viewer.

The trade-off is segment granularity versus overhead and compression.

- Tiny segments add per-request overhead and hurt compression ratios.
- You pick the chunk size by measured playback behavior.
- Popularity shapes caching — hot videos are pre-populated on edges, cold
  long-tail content is fetched through and cached after first view.
- On failure, the player retries lower-quality renditions and switches CDNs.
- Multi-CDN and origin offload keep a spike from starving playback.

### Q: Design a recommendation system for videos

**A:** Recommendations run as a two-stage pipeline: candidate generation then ranking.

- Candidates come from multiple sources — collaborative filtering over co-viewed
  and co-liked video pairs, content similarity from titles/descriptions/tags and
  video embeddings, subscription and channel signals, trending, and user
  history.
- Candidate generation runs offline in batch jobs that output per-user lists of
  a few thousand candidates.
- A lightweight online path covers fresh videos so a video published minutes ago
  can still surface.

Ranking is a learned model — typically a two-tower embedding model for candidate
recall plus a deep CTR/watch-time model for the final order.

- It is scored from features like predicted watch time, completion rate,
  freshness, language, and diversity penalties.
- The top-N per user are cached so a feed request is one cache read, not a model
  invocation.
- Exploration is deliberate: a small fraction of slots serve lower-confidence
  items to gather labels.
- This trades short-term accuracy for long-term signal.

The pipeline consumes every view, like, and search event into an analytics
platform.

- Events are aggregated into training data, and models refresh on a schedule.
- Online serving reads features from a feature store so a model update doesn't
  require retraining the whole system.
- Freshness matters — a model that can't see today's trends recommends
  yesterday's content.
- Incremental updates and feature recomputation run continuously.

Cold start falls back to trending and popular-in-region content.

- New videos inherit candidates from similar items.
- Trade-offs include diversity versus engagement (pure CTR feeds narrow the
  experience and drive echo chambers).
- Other trade-offs are freshness versus training stability, and
  privacy-sensitive signals.
- Scaling means sharding users across model servers and serving top-N from a
  distributed cache with a merge fallback.
- A/B testing gates every model change.

### Q: How do you support live streaming alongside video-on-demand?

**A:** Live shares the VOD substrate but inverts the pipeline.

- A streamer publishes via RTMP/SRT to an ingest cluster.
- An encoder takes that single feed and produces several renditions as
  LL-HLS/CMAF segments pushed continuously to the CDN.
- Because every viewer watches the same segments, the CDN's natural caching does
  the fan-out.
- One ingest feed can reach millions.
- The player is the same adaptive-bitrate client used for VOD — only the
  manifest is different.

Latency is the key difference: end-to-end below a few seconds.

- Chunked CMAF with ~2-second groups achieves this while keeping scalability.
- A recording service subscribes to the segments and archives them into the same
  blob storage used for VOD.
- A stream becomes watchable as a replay the moment it ends.
- Chat, reactions, and moderation attach to the ingest path.
- DVR windows let late joiners scrub back through the stream.

Scaling means placing ingest and transcode capacity near the streamer and using
regional relays to bridge continents.

- If the encoder dies, a redundant ingest path takes over with stream
  continuity.
- Very large events use enterprise/eCDN or multicast-style delivery on top of
  the public CDN to cut egress cost.
- Transcoding live is real-time, so the pipeline must keep end-to-end encode
  delay under a second per rendition.

The trade-off is latency versus scale.

- Unicasting a separate stream per viewer doesn't scale, so you accept
  segment-group latency to inherit the CDN.
- Failure handling includes auto-restart on stream drop.
- Status notifications cover stream events.
- Recording resumption ensures archives aren't lost mid-outage.
- QoE metrics track buffering and join time separately for live and VOD.

## Source

```text
title: YouTube Video Sharing
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=file]
node encode: Encoding Pipeline [icon=compute]
node catalog: Catalog Service [icon=search]
node recs: Recommendations [icon=cache]
node comment: Comments [icon=message]
node notify: Notifications [icon=mail]
node storage: Video Storage [cylinder, icon=file]
node db: Metadata DB [cylinder, icon=database]
node cache: Metadata Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> catalog: metadata
edge catalog -> db: read
edge catalog -> cache: read / write
edge client -> api: upload video
edge api -> upload: accept
edge upload -> encode: transcode
edge encode -> storage: chunks
edge client -> api: watch
edge api -> recs: personalize
edge client -> cdn: stream
edge cdn -> storage: fetch
edge api -> comment: post
edge comment -> notify: alerts
```
