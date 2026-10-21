# Photo Editing

Design a photo editing service

**Difficulty:** Hard

**Tags:** photo, scheduling, storage

## Functional Requirements

- a photo editing service
- handle large image uploads?
- apply filters and edits at scale?
- manage processing job queues?
- serve edited images fast?

## Non-Functional Requirements

- A photo editing service is best built as a set of stateless services behind an
  API gateway, each owning a distinct concern.

- The upload service handles large transfers into object storage, the edit job
  manager records pending operations, the render workers execute filters against
  the original image, and a metadata database tracks state for every asset.
- The gateway is the only entry point clients touch, so authentication, rate
  limiting, and request validation happen in one place.
- Rendering is deliberately decoupled from the upload path through a durable job
  queue, which means the user gets a fast acknowledgement while the actual pixel
  work happens asynchronously.

The end-to-end flow starts when a user uploads a photo through the editor app.

- The gateway forwards the bytes to the upload service, which streams them into
  object storage and returns an object key.
- The gateway then creates an edit job referencing that key plus the ordered
  list of operations the user applied.
- The queue distributes the job to a render worker, which pulls the original
  image, applies the filter library steps, writes the result back to storage,
  and finally updates the job status in the metadata database.
- A CDN cache in front of the result URLs absorbs repeated reads, which are
  overwhelmingly more common than writes.

The main tradeoffs are between latency, cost, and freshness.

- The synchronous path stays short so uploads and previews feel instant, while
  heavy rendering happens off the critical path.
- Compute is the dominant cost, so render workers are sized for batch throughput
  and scale out on queue depth.
- Preview thumbnails are generated eagerly at multiple resolutions so the editor
  can show near-instant feedback, while full-resolution output renders once the
  user finishes.
- The design accepts eventual consistency between job submission and completion;
  the UI polls status and shows a progress indicator rather than blocking..
- Filters and edits are CPU-bound pixel operations, so the strategy is to separate
  them from the request path and parallelize them across a worker fleet.

- Each edit job declares a deterministic pipeline of operations (crop, rotate,
  color grade, resize, watermark) that the render worker executes against the
  original file.
- Because the pipeline is declarative and versioned, it is repeatable,
  replayable, and testable.
- I would also represent the pipeline as a serializable document stored with the
  job, so a user can re-apply edits to a newer original without recomputing from
  scratch.

To parallelize, a single job is split into tiles.

- The worker divides the image into regions, applies the same operations to each
  region, and a final pass stitches the tiles.
- This maps naturally to a pool of stateless workers, each processing a tile
  with a bounded memory footprint.
- Filter kernels that are separable run as two one-dimensional passes, and
  common operations use SIMD or GPU shaders when available.
- Thumbnail and preview variants are rendered at the same time from the same
  pipeline so the cost of decoding the source image is paid once.

Scale comes from queue depth: when a surge of edits arrives, workers scale out
horizontally, and each worker picks up an independent tile.

- Deduplication prevents two jobs from processing the same original twice for
  identical output, and the filter library itself is content-addressed so
  workers can fetch it from a shared artifact store.
- The pipeline runs on a pinned container image, so rendering is deterministic
  across retries.
- This keeps the design simple: stateless workers, durable jobs, and a versioned
  operations document, with any single stage retried by re-enqueuing just that
  tile..
- A job queue is the backbone of the editing system because render work is
  asynchronous, bursty, and must survive crashes.

- I would use a durable queue such as SQS, Kafka, or Redis Streams with
  at-least-once delivery, backed by a job table in the metadata database that
  holds the authoritative state.
- Each job moves through explicit states: queued, processing, retrying, done,
  and failed.
- The worker acknowledges a job only after the render completes and the result
  is persisted, so a crash mid-render re-delivers the job rather than losing it.

Idempotency is essential because at-least-once delivery means the same job can
arrive twice.

- Every job carries a unique id and a version, and the worker checks the
  metadata store before starting; if the output already exists for that job id,
  the work is skipped and the job is marked done.
- I would make the render output deterministic for a given original and pipeline
  version so a re-run produces a byte-identical file.
- Retries with exponential backoff and a maximum attempt count move a persistent
  failure to a dead-letter queue for operator review.

The queue also shapes capacity.

- I would measure queue depth per priority class and autoscale the worker fleet
  on that signal, so a weekend photo dump scales up compute without manual
  intervention.
- Long-running jobs are monitored with heartbeats; a worker that stops sending
  heartbeats is assumed dead and its job is re-enqueued.
- Visibility timeouts must exceed the worst-case tile time or jobs get processed
  twice.
- Finally, every job transition is logged so the team can query time-in-queue,
  time-in-render, and failure reasons, which turns the queue into both an
  execution engine and an observability surface..
- Serving speed comes from cache placement, pre-generation, and making the origin
  cheap.

- Edited results are immutable, so they are perfect candidates for a CDN.
- Each result URL contains the asset id and a version or hash of the pipeline;
  when the user finishes editing, the render writes the file and the URL
  changes, so the CDN never serves a stale result and cache invalidation is
  trivial.
- The most common reads, thumbnails and previews, are generated at multiple
  resolutions during the render pass and cached ahead of time, so the editor UI
  never waits on a miss.

The CDN is the first layer, but I would add an in-region cache and an origin
optimized for the hottest assets.

- Because edited images are immutable, the origin can use content-addressed
  storage and return short cache-control headers that let both the CDN and
  browsers reuse copies aggressively.
- For very hot assets the metadata database records access counts, and the top
  items are pinned in the cache.
- A user browsing a photo album reads mostly distinct images, so the cache hit
  ratio depends on popularity; editors' preview and undo history reuse recent
  frames, which the client-side cache already covers.

Cold misses must still be fast.

- The origin falls back to the render workers only if the output was never
  produced, which is the exception rather than the rule.
- If a miss happens, a fast path renders a reduced-resolution version first and
  swaps in full resolution once ready.
- I would also vary cache behavior by user: authenticated editors may need
  per-user watermark overlays, so those are cached with the user id in the key.
- Metrics on hit ratio, miss latency, and bytes served drive decisions about
  when to add edge caching in more regions.

## Source

````text
title: Photo Editing
node user: User [round, icon=browser]
node app: Editor App [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node store: Object Storage [cylinder, icon=file]
node job: Edit Job [icon=compute]
node queue: Job Queue [icon=queue]
node render: Render Workers [icon=compute]
node filter: Filter Library [icon=file]
node cache: CDN Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> upload: transfer
edge upload -> store: save
edge gateway -> job: create
edge job -> queue: enqueue
edge queue -> render: process
edge render -> filter: apply
edge render -> store: write
edge store -> cache: deliver
edge job -> db: metadata
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Photo Editing
user: User
app: Editor App
gateway: API Gateway
upload: Upload Service
store: Object Storage
job: Edit Job
queue: Job Queue
render: Render Workers
filter: Filter Library
cache: CDN Cache
db: Metadata DB

user ─► app ─► upload
app ─► gateway ─► submit
gateway ─► upload ─► transfer
upload ─► store ─► save
gateway ─► job ─► create
job ─► queue ─► enqueue
queue ─► render ─► process
render ─► filter ─► apply
render ─► store ─► write
store ─► cache ─► deliver
job ─► db ─► metadata
````

## Design

### Design a photo editing service

A photo editing service is best built as a set of stateless services behind an
API gateway, each owning a distinct concern.

- The upload service handles large transfers into object storage, the edit job
  manager records pending operations, the render workers execute filters against
  the original image, and a metadata database tracks state for every asset.
- The gateway is the only entry point clients touch, so authentication, rate
  limiting, and request validation happen in one place.
- Rendering is deliberately decoupled from the upload path through a durable job
  queue, which means the user gets a fast acknowledgement while the actual pixel
  work happens asynchronously.

The end-to-end flow starts when a user uploads a photo through the editor app.

- The gateway forwards the bytes to the upload service, which streams them into
  object storage and returns an object key.
- The gateway then creates an edit job referencing that key plus the ordered
  list of operations the user applied.
- The queue distributes the job to a render worker, which pulls the original
  image, applies the filter library steps, writes the result back to storage,
  and finally updates the job status in the metadata database.
- A CDN cache in front of the result URLs absorbs repeated reads, which are
  overwhelmingly more common than writes.

The main tradeoffs are between latency, cost, and freshness.

- The synchronous path stays short so uploads and previews feel instant, while
  heavy rendering happens off the critical path.
- Compute is the dominant cost, so render workers are sized for batch throughput
  and scale out on queue depth.
- Preview thumbnails are generated eagerly at multiple resolutions so the editor
  can show near-instant feedback, while full-resolution output renders once the
  user finishes.
- The design accepts eventual consistency between job submission and completion;
  the UI polls status and shows a progress indicator rather than blocking.

### How do you handle large image uploads?

Large uploads fail with naive approaches: a single request ties up a connection,
retries re-send the whole body, and the app server cannot buffer a
multi-hundred-megabyte file in memory.

- I would implement resumable chunked uploads with presigned URLs.
- The client splits the file into fixed-size chunks, the upload service hands
  back a presigned URL into object storage, and each chunk is PUT directly to
  storage, bypassing the gateway entirely.
- The client tracks which chunks completed and resumes from the first missing
  one on failure or network switch.
- This keeps server memory flat and makes retries cheap.

A chunk registry records the upload session, chunk offsets, and checksums so
partial progress is never lost.

- On completion, the client calls a finalize endpoint that verifies all chunks
  are present, reassembles or commits the object, and generates the variants the
  editor needs.
- I would cap chunk size around ten megabytes and use a dedicated bucket per
  tenant or upload so cleanup and lifecycle policies are straightforward.
- For the common case of camera-phone photos the whole file fits in a few
  chunks, so the overhead is small.

Timeouts and duplicate chunks need explicit handling.

- Each chunk carries an idempotency key so a retried PUT is ignored rather than
  written twice.
- A background sweeper deletes stale sessions past a TTL to avoid orphaned
  storage.
- Because the user experience depends on the browser knowing progress, the
  upload endpoint streams status back through a websocket or server-sent events.
- The gateway still validates authentication and applies rate limits at the
  start of the session, but the heavy bytes never touch application memory.

### How do you apply filters and edits at scale?

Filters and edits are CPU-bound pixel operations, so the strategy is to separate
them from the request path and parallelize them across a worker fleet.

- Each edit job declares a deterministic pipeline of operations (crop, rotate,
  color grade, resize, watermark) that the render worker executes against the
  original file.
- Because the pipeline is declarative and versioned, it is repeatable,
  replayable, and testable.
- I would also represent the pipeline as a serializable document stored with the
  job, so a user can re-apply edits to a newer original without recomputing from
  scratch.

To parallelize, a single job is split into tiles.

- The worker divides the image into regions, applies the same operations to each
  region, and a final pass stitches the tiles.
- This maps naturally to a pool of stateless workers, each processing a tile
  with a bounded memory footprint.
- Filter kernels that are separable run as two one-dimensional passes, and
  common operations use SIMD or GPU shaders when available.
- Thumbnail and preview variants are rendered at the same time from the same
  pipeline so the cost of decoding the source image is paid once.

Scale comes from queue depth: when a surge of edits arrives, workers scale out
horizontally, and each worker picks up an independent tile.

- Deduplication prevents two jobs from processing the same original twice for
  identical output, and the filter library itself is content-addressed so
  workers can fetch it from a shared artifact store.
- The pipeline runs on a pinned container image, so rendering is deterministic
  across retries.
- This keeps the design simple: stateless workers, durable jobs, and a versioned
  operations document, with any single stage retried by re-enqueuing just that
  tile.

### How do you manage processing job queues?

A job queue is the backbone of the editing system because render work is
asynchronous, bursty, and must survive crashes.

- I would use a durable queue such as SQS, Kafka, or Redis Streams with
  at-least-once delivery, backed by a job table in the metadata database that
  holds the authoritative state.
- Each job moves through explicit states: queued, processing, retrying, done,
  and failed.
- The worker acknowledges a job only after the render completes and the result
  is persisted, so a crash mid-render re-delivers the job rather than losing it.

Idempotency is essential because at-least-once delivery means the same job can
arrive twice.

- Every job carries a unique id and a version, and the worker checks the
  metadata store before starting; if the output already exists for that job id,
  the work is skipped and the job is marked done.
- I would make the render output deterministic for a given original and pipeline
  version so a re-run produces a byte-identical file.
- Retries with exponential backoff and a maximum attempt count move a persistent
  failure to a dead-letter queue for operator review.

The queue also shapes capacity.

- I would measure queue depth per priority class and autoscale the worker fleet
  on that signal, so a weekend photo dump scales up compute without manual
  intervention.
- Long-running jobs are monitored with heartbeats; a worker that stops sending
  heartbeats is assumed dead and its job is re-enqueued.
- Visibility timeouts must exceed the worst-case tile time or jobs get processed
  twice.
- Finally, every job transition is logged so the team can query time-in-queue,
  time-in-render, and failure reasons, which turns the queue into both an
  execution engine and an observability surface.

### How do you serve edited images fast?

Serving speed comes from cache placement, pre-generation, and making the origin
cheap.

- Edited results are immutable, so they are perfect candidates for a CDN.
- Each result URL contains the asset id and a version or hash of the pipeline;
  when the user finishes editing, the render writes the file and the URL
  changes, so the CDN never serves a stale result and cache invalidation is
  trivial.
- The most common reads, thumbnails and previews, are generated at multiple
  resolutions during the render pass and cached ahead of time, so the editor UI
  never waits on a miss.

The CDN is the first layer, but I would add an in-region cache and an origin
optimized for the hottest assets.

- Because edited images are immutable, the origin can use content-addressed
  storage and return short cache-control headers that let both the CDN and
  browsers reuse copies aggressively.
- For very hot assets the metadata database records access counts, and the top
  items are pinned in the cache.
- A user browsing a photo album reads mostly distinct images, so the cache hit
  ratio depends on popularity; editors' preview and undo history reuse recent
  frames, which the client-side cache already covers.

Cold misses must still be fast.

- The origin falls back to the render workers only if the output was never
  produced, which is the exception rather than the rule.
- If a miss happens, a fast path renders a reduced-resolution version first and
  swaps in full resolution once ready.
- I would also vary cache behavior by user: authenticated editors may need
  per-user watermark overlays, so those are cached with the user id in the key.
- Metrics on hit ratio, miss latency, and bytes served drive decisions about
  when to add edge caching in more regions.

## Source

```text
title: Photo Editing
node user: User [round, icon=browser]
node app: Editor App [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node store: Object Storage [cylinder, icon=file]
node job: Edit Job [icon=compute]
node queue: Job Queue [icon=queue]
node render: Render Workers [icon=compute]
node filter: Filter Library [icon=file]
node cache: CDN Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> upload: transfer
edge upload -> store: save
edge gateway -> job: create
edge job -> queue: enqueue
edge queue -> render: process
edge render -> filter: apply
edge render -> store: write
edge store -> cache: deliver
edge job -> db: metadata
```

## Q&A

### Q: Design a photo editing service

**A:** A photo editing service is best built as a set of stateless services behind an
API gateway, each owning a distinct concern.

- The upload service handles large transfers into object storage, the edit job
  manager records pending operations, the render workers execute filters against
  the original image, and a metadata database tracks state for every asset.
- The gateway is the only entry point clients touch, so authentication, rate
  limiting, and request validation happen in one place.
- Rendering is deliberately decoupled from the upload path through a durable job
  queue, which means the user gets a fast acknowledgement while the actual pixel
  work happens asynchronously.

The end-to-end flow starts when a user uploads a photo through the editor app.

- The gateway forwards the bytes to the upload service, which streams them into
  object storage and returns an object key.
- The gateway then creates an edit job referencing that key plus the ordered
  list of operations the user applied.
- The queue distributes the job to a render worker, which pulls the original
  image, applies the filter library steps, writes the result back to storage,
  and finally updates the job status in the metadata database.
- A CDN cache in front of the result URLs absorbs repeated reads, which are
  overwhelmingly more common than writes.

The main tradeoffs are between latency, cost, and freshness.

- The synchronous path stays short so uploads and previews feel instant, while
  heavy rendering happens off the critical path.
- Compute is the dominant cost, so render workers are sized for batch throughput
  and scale out on queue depth.
- Preview thumbnails are generated eagerly at multiple resolutions so the editor
  can show near-instant feedback, while full-resolution output renders once the
  user finishes.
- The design accepts eventual consistency between job submission and completion;
  the UI polls status and shows a progress indicator rather than blocking.

### Q: How do you handle large image uploads?

**A:** Large uploads fail with naive approaches: a single request ties up a connection,
retries re-send the whole body, and the app server cannot buffer a
multi-hundred-megabyte file in memory.

- I would implement resumable chunked uploads with presigned URLs.
- The client splits the file into fixed-size chunks, the upload service hands
  back a presigned URL into object storage, and each chunk is PUT directly to
  storage, bypassing the gateway entirely.
- The client tracks which chunks completed and resumes from the first missing
  one on failure or network switch.
- This keeps server memory flat and makes retries cheap.

A chunk registry records the upload session, chunk offsets, and checksums so
partial progress is never lost.

- On completion, the client calls a finalize endpoint that verifies all chunks
  are present, reassembles or commits the object, and generates the variants the
  editor needs.
- I would cap chunk size around ten megabytes and use a dedicated bucket per
  tenant or upload so cleanup and lifecycle policies are straightforward.
- For the common case of camera-phone photos the whole file fits in a few
  chunks, so the overhead is small.

Timeouts and duplicate chunks need explicit handling.

- Each chunk carries an idempotency key so a retried PUT is ignored rather than
  written twice.
- A background sweeper deletes stale sessions past a TTL to avoid orphaned
  storage.
- Because the user experience depends on the browser knowing progress, the
  upload endpoint streams status back through a websocket or server-sent events.
- The gateway still validates authentication and applies rate limits at the
  start of the session, but the heavy bytes never touch application memory.

### Q: How do you apply filters and edits at scale?

**A:** Filters and edits are CPU-bound pixel operations, so the strategy is to separate
them from the request path and parallelize them across a worker fleet.

- Each edit job declares a deterministic pipeline of operations (crop, rotate,
  color grade, resize, watermark) that the render worker executes against the
  original file.
- Because the pipeline is declarative and versioned, it is repeatable,
  replayable, and testable.
- I would also represent the pipeline as a serializable document stored with the
  job, so a user can re-apply edits to a newer original without recomputing from
  scratch.

To parallelize, a single job is split into tiles.

- The worker divides the image into regions, applies the same operations to each
  region, and a final pass stitches the tiles.
- This maps naturally to a pool of stateless workers, each processing a tile
  with a bounded memory footprint.
- Filter kernels that are separable run as two one-dimensional passes, and
  common operations use SIMD or GPU shaders when available.
- Thumbnail and preview variants are rendered at the same time from the same
  pipeline so the cost of decoding the source image is paid once.

Scale comes from queue depth: when a surge of edits arrives, workers scale out
horizontally, and each worker picks up an independent tile.

- Deduplication prevents two jobs from processing the same original twice for
  identical output, and the filter library itself is content-addressed so
  workers can fetch it from a shared artifact store.
- The pipeline runs on a pinned container image, so rendering is deterministic
  across retries.
- This keeps the design simple: stateless workers, durable jobs, and a versioned
  operations document, with any single stage retried by re-enqueuing just that
  tile.

### Q: How do you manage processing job queues?

**A:** A job queue is the backbone of the editing system because render work is
asynchronous, bursty, and must survive crashes.

- I would use a durable queue such as SQS, Kafka, or Redis Streams with
  at-least-once delivery, backed by a job table in the metadata database that
  holds the authoritative state.
- Each job moves through explicit states: queued, processing, retrying, done,
  and failed.
- The worker acknowledges a job only after the render completes and the result
  is persisted, so a crash mid-render re-delivers the job rather than losing it.

Idempotency is essential because at-least-once delivery means the same job can
arrive twice.

- Every job carries a unique id and a version, and the worker checks the
  metadata store before starting; if the output already exists for that job id,
  the work is skipped and the job is marked done.
- I would make the render output deterministic for a given original and pipeline
  version so a re-run produces a byte-identical file.
- Retries with exponential backoff and a maximum attempt count move a persistent
  failure to a dead-letter queue for operator review.

The queue also shapes capacity.

- I would measure queue depth per priority class and autoscale the worker fleet
  on that signal, so a weekend photo dump scales up compute without manual
  intervention.
- Long-running jobs are monitored with heartbeats; a worker that stops sending
  heartbeats is assumed dead and its job is re-enqueued.
- Visibility timeouts must exceed the worst-case tile time or jobs get processed
  twice.
- Finally, every job transition is logged so the team can query time-in-queue,
  time-in-render, and failure reasons, which turns the queue into both an
  execution engine and an observability surface.

### Q: How do you serve edited images fast?

**A:** Serving speed comes from cache placement, pre-generation, and making the origin
cheap.

- Edited results are immutable, so they are perfect candidates for a CDN.
- Each result URL contains the asset id and a version or hash of the pipeline;
  when the user finishes editing, the render writes the file and the URL
  changes, so the CDN never serves a stale result and cache invalidation is
  trivial.
- The most common reads, thumbnails and previews, are generated at multiple
  resolutions during the render pass and cached ahead of time, so the editor UI
  never waits on a miss.

The CDN is the first layer, but I would add an in-region cache and an origin
optimized for the hottest assets.

- Because edited images are immutable, the origin can use content-addressed
  storage and return short cache-control headers that let both the CDN and
  browsers reuse copies aggressively.
- For very hot assets the metadata database records access counts, and the top
  items are pinned in the cache.
- A user browsing a photo album reads mostly distinct images, so the cache hit
  ratio depends on popularity; editors' preview and undo history reuse recent
  frames, which the client-side cache already covers.

Cold misses must still be fast.

- The origin falls back to the render workers only if the output was never
  produced, which is the exception rather than the rule.
- If a miss happens, a fast path renders a reduced-resolution version first and
  swaps in full resolution once ready.
- I would also vary cache behavior by user: authenticated editors may need
  per-user watermark overlays, so those are cached with the user id in the key.
- Metrics on hit ratio, miss latency, and bytes served drive decisions about
  when to add edge caching in more regions.

## Source

```text
title: Photo Editing
node user: User [round, icon=browser]
node app: Editor App [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node store: Object Storage [cylinder, icon=file]
node job: Edit Job [icon=compute]
node queue: Job Queue [icon=queue]
node render: Render Workers [icon=compute]
node filter: Filter Library [icon=file]
node cache: CDN Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> upload: transfer
edge upload -> store: save
edge gateway -> job: create
edge job -> queue: enqueue
edge queue -> render: process
edge render -> filter: apply
edge render -> store: write
edge store -> cache: deliver
edge job -> db: metadata
```
