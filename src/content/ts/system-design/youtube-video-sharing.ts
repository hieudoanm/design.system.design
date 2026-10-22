import type { Problem } from './types';

export const youtubeVideoSharing: Problem = {
  slug: 'youtube-video-sharing',
  title: 'Video streaming service',
  tagline: 'Ingest, transcode and stream video to every screen through a CDN.',
  difficulty: 'Hard',
  tags: ['cdn', 'social', 'video'],
  functional: [
    'Upload a video and have it transcoded into several renditions.',
    'Watch with adaptive bitrate, pause, resume and seek.',
    'Browse and search the catalog, subscribe to channels and comment.',
    'Recommend videos and count views.',
  ],
  nonFunctional: [
    'Playback starts in about a second and rebuffering stays under 1%.',
    'Video bytes are served by the CDN, never by the API tier.',
    'Uploads are resumable and processing is asynchronous.',
    'Storage and egress cost dominate every other constraint.',
  ],
  estimation: [
    '2B users watching 1B hours a day is about 11.5k hours per second.',
    'At 5 Mbps that is roughly 7 TB per second of egress at peak, which only a CDN can serve.',
    '500 hours uploaded per minute is 720k hours a day; five renditions at about 1 GB per hour is 3.6 PB per day before dedupe.',
    'Metadata is about 1 KB per video for 1B videos, roughly 1 TB, small enough to keep hot.',
  ],
  diagram: ` UPLOAD  Client ─► API gateway ─► Upload service ─► Encoding pipeline ─► Video storage
                                                              │                 (chunks)
                                                              └─► Metadata DB / cache

 WATCH   Client ─► CDN ─► Video storage
            │
            └─► API gateway ─► Catalog service ─► Metadata cache ─► Metadata DB
                      │                │
                      ├─► Recommendations
                      └─► Comments ─► Notifications`,
  design: [
    {
      title: 'Overview',
      body: 'The system splits cleanly into a control plane and a media plane.\n\n- Clients talk to an API gateway for metadata, comments, and subscriptions, while bytes travel separately.\n- Uploads go to an Upload Service, are transcoded by an Encoding Pipeline, and land as content-addressed chunks in Video Storage (blob storage) fronted by a CDN.\n- On watch, the client asks the Catalog Service for the asset manifest and then streams segments straight from the CDN.\n- The API never touches heavy payloads.\n- Metadata — title, channel, duration, quality labels, thumbnails — lives in a Metadata DB read through a hot cache.\n- Supporting services attach to the write path: Comments persist and fan out notifications.\n- View events feed the Recommendations service.\n\nData models are small and denormalized for a read-heavy workload.\n\n- A `videos` table keyed by video ID tracks status (uploading, processing, ready), author, and availability time.\n- A `streams` table maps a quality label (144p–4K) and codec (H.264, VP9, AV1) to an object key and byte range.\n- `subscriptions` holds (channel, subscriber) pairs used for fan-out.\n- `comments` is keyed by video and timestamp.\n- Status is duplicated on the row because the watch path reads it on every request while writes are rare.\n\nTrade-offs shape most decisions.\n\n- Transcoding amplifies storage cost several-fold, so you tier object storage (hot, warm, cold archive) and transcode lazily — render only the qualities viewers actually request.\n- Encoding is CPU-heavy, so the pipeline is asynchronous with a job queue.\n- A video becomes playable as soon as the lowest rendition is ready.\n- Failure handling means resumable chunked uploads.\n- Encode jobs are retryable with a dead-letter queue.\n- CDN-absorbed playback spikes keep origin storage from ever being the bottleneck.\n- Metadata is eventually consistent; the catalog propagates asynchronously and readers retry.',
    },
  ],
  qa: [
    {
      q: 'How do you process and store uploaded videos at scale?',
      a: "Uploads are decoupled from processing.\n\n- The client receives a presigned upload URL pointing at blob storage and streams the raw file in chunks with resumable PUT semantics.\n- A dropped connection resumes from the last acknowledged byte instead of restarting.\n- When the final part lands, an upload-complete event is enqueued.\n- A worker set pulls it, verifies checksums, scans for malware and duplicate content (content-hash match against existing videos), and submits transcode jobs.\n- Splitting the file into GOP-aligned segments lets each segment be transcoded as an independent job.\n- This gives massive parallelism across a GPU/CPU pool.\n\nEach rendition is produced as a sequence of HLS/DASH segments (2–6 seconds) plus a manifest.\n\n- Segments are written back to blob storage under a per-video prefix.\n- A metadata row records which renditions are ready so the watch path only advertises what exists.\n- Per-title encoding decides the codec and resolution ladder from the source's bitrate and motion.\n- A talking-head vlog doesn't waste 4K encode minutes on content that looks identical at 1080p.\n- Lazy transcoding renders only qualities actually requested and fills in the rest on demand.\n\nStorage uses content-addressed chunking for deduplication and erasure coding or 3-way replication for durability.\n\n- Cold videos are tiered to cheaper archive media, since only a small fraction of uploads ever get views.\n- Popular videos are pre-populated onto the CDN at encode time.\n- The encode queue must size for spikes — a trending upload can need hundreds of jobs.\n- Workers scale with queue depth.\n- Jobs carry idempotency keys for retry.\n\nCost is the dominant trade-off: every resolution multiplies stored bytes and CPU.\n\n- Tiering and per-title encoding exist to keep spend in check.\n- Failure handling requires checkpointing per segment — a worker dying mid-video restarts only unfinished segments.\n- A dead-letter queue for permanently failed encodes marks the video failed and notifies the uploader.\n- Metrics on encode success rate and queue lag feed capacity planning.",
    },
    {
      q: 'How do you stream video with adaptive bitrate and low startup latency?',
      a: "Adaptive bitrate rests on segmented delivery.\n\n- The encode pipeline emits each rendition as short segments plus a master manifest listing them.\n- The player measures throughput and switches quality between segments by picking a matching rendition from the manifest.\n- HLS and DASH both support this.\n- For live-adjacent latency you add LL-HLS or CMAF chunked delivery, where a single segment is streamed as smaller chunks.\n- This cuts startup to a couple of seconds.\n\nThe ABR algorithm is the player's core.\n\n- It estimates bandwidth with a smoothed exponential moving average.\n- It predicts buffer drain.\n- It selects the largest quality that won't stall.\n- Hysteresis and settling timers prevent oscillation between adjacent ladders.\n- An emergency mode drops two tiers at once when the buffer is nearly empty.\n\nStartup latency is attacked on the serving side.\n\n- The player fetches the manifest and the smallest-quality first segment immediately while estimating bandwidth.\n- Segments are 2–6 seconds (shorter lowers latency, longer improves compression and cuts request rate).\n- HTTP/2 or QUIC multiplexes segments.\n- The CDN caches the manifest, thumbnails, and first segments per video so the first bytes come from an edge.\n- Anycast and geo-based edge selection put the CDN node close to the viewer.\n\nThe trade-off is segment granularity versus overhead and compression.\n\n- Tiny segments add per-request overhead and hurt compression ratios.\n- You pick the chunk size by measured playback behavior.\n- Popularity shapes caching — hot videos are pre-populated on edges, cold long-tail content is fetched through and cached after first view.\n- On failure, the player retries lower-quality renditions and switches CDNs.\n- Multi-CDN and origin offload keep a spike from starving playback.",
    },
    {
      q: 'Design a recommendation system for videos',
      a: "Recommendations run as a two-stage pipeline: candidate generation then ranking.\n\n- Candidates come from multiple sources — collaborative filtering over co-viewed and co-liked video pairs, content similarity from titles/descriptions/tags and video embeddings, subscription and channel signals, trending, and user history.\n- Candidate generation runs offline in batch jobs that output per-user lists of a few thousand candidates.\n- A lightweight online path covers fresh videos so a video published minutes ago can still surface.\n\nRanking is a learned model — typically a two-tower embedding model for candidate recall plus a deep CTR/watch-time model for the final order.\n\n- It is scored from features like predicted watch time, completion rate, freshness, language, and diversity penalties.\n- The top-N per user are cached so a feed request is one cache read, not a model invocation.\n- Exploration is deliberate: a small fraction of slots serve lower-confidence items to gather labels.\n- This trades short-term accuracy for long-term signal.\n\nThe pipeline consumes every view, like, and search event into an analytics platform.\n\n- Events are aggregated into training data, and models refresh on a schedule.\n- Online serving reads features from a feature store so a model update doesn't require retraining the whole system.\n- Freshness matters — a model that can't see today's trends recommends yesterday's content.\n- Incremental updates and feature recomputation run continuously.\n\nCold start falls back to trending and popular-in-region content.\n\n- New videos inherit candidates from similar items.\n- Trade-offs include diversity versus engagement (pure CTR feeds narrow the experience and drive echo chambers).\n- Other trade-offs are freshness versus training stability, and privacy-sensitive signals.\n- Scaling means sharding users across model servers and serving top-N from a distributed cache with a merge fallback.\n- A/B testing gates every model change.",
    },
    {
      q: 'How do you support live streaming alongside video-on-demand?',
      a: "Live shares the VOD substrate but inverts the pipeline.\n\n- A streamer publishes via RTMP/SRT to an ingest cluster.\n- An encoder takes that single feed and produces several renditions as LL-HLS/CMAF segments pushed continuously to the CDN.\n- Because every viewer watches the same segments, the CDN's natural caching does the fan-out.\n- One ingest feed can reach millions.\n- The player is the same adaptive-bitrate client used for VOD — only the manifest is different.\n\nLatency is the key difference: end-to-end below a few seconds.\n\n- Chunked CMAF with ~2-second groups achieves this while keeping scalability.\n- A recording service subscribes to the segments and archives them into the same blob storage used for VOD.\n- A stream becomes watchable as a replay the moment it ends.\n- Chat, reactions, and moderation attach to the ingest path.\n- DVR windows let late joiners scrub back through the stream.\n\nScaling means placing ingest and transcode capacity near the streamer and using regional relays to bridge continents.\n\n- If the encoder dies, a redundant ingest path takes over with stream continuity.\n- Very large events use enterprise/eCDN or multicast-style delivery on top of the public CDN to cut egress cost.\n- Transcoding live is real-time, so the pipeline must keep end-to-end encode delay under a second per rendition.\n\nThe trade-off is latency versus scale.\n\n- Unicasting a separate stream per viewer doesn't scale, so you accept segment-group latency to inherit the CDN.\n- Failure handling includes auto-restart on stream drop.\n- Status notifications cover stream events.\n- Recording resumption ensures archives aren't lost mid-outage.\n- QoE metrics track buffering and join time separately for live and VOD.",
    },
  ],
};
