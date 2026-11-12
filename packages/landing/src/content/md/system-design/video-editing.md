# Video Editing

Design a cloud video editing service

**Difficulty:** Medium

**Tags:** social, video

## Functional Requirements

- a cloud video editing service
- transcode videos at scale?
- support timeline editing in the browser?
- render final videos efficiently?
- manage storage costs?

## Non-Functional Requirements

- A cloud video editing service combines heavy media pipelines with interactive
  editing, so the architecture splits the hot path from the compute path.

- The upload service streams raw footage into object storage.
- The transcoding cluster converts it into segmented, multi-bitrate formats for
  the browser.
- The segment service cuts those files into small chunks that the editor can
  scrub and rearrange.
- Rendering is fully asynchronous: when the user exports, the gateway submits a
  job to the render farm through a durable queue.
- The final video is written back to storage and served through a CDN.

The user flow is designed around the segment model.

- A raw upload is immediately transcoded into low-resolution proxies, so the
  browser can play previews without downloading the original.
- The editor manipulates a timeline of segment references rather than whole
  files.
- Every edit is recorded as a sequence of operations over segments.
- On export, the render farm recombines the segments at full resolution, applies
  the timeline effects, and produces the master file plus web-optimized
  renditions.
- The metadata database tracks project, asset, and job state, so any worker can
  resume work after a crash.

The key tradeoff is between interactive latency and rendering cost.

- Proxies give instant previews at the price of a transcoding step.
- Full-resolution rendering is batched and prioritized through the queue.
- Segmenting the source enables parallel processing, resume points, and cheap
  retries, because a failed render only re-does the affected chunks.
- The design accepts that the render farm is the scaling bottleneck and measures
  queue depth to autoscale workers.
- This keeps the synchronous edit path small and responsive..
- Transcoding is embarrassingly parallel if you segment first.

- The raw file is split into short chunks, typically two to six seconds, aligned
  to keyframes.
- Each chunk is transcoded independently to every target bitrate and resolution.
- I would drive this with a job queue where each chunk is a unit of work.
- A transcoding cluster scales out on queue depth.
- Workers pull chunks, run the encoder, and push results to object storage.
- Because chunks are independent, a 4K file with hundreds of chunks can use
  hundreds of workers with no coordination.

Correct segmentation requires that chunks align on closed GOP boundaries so they
splice together without artifacts.

- The transcoding cluster first does a pass to identify keyframe positions.
- It then encodes each segment with a repeating GOP structure so the segmenter
  can cut cleanly.
- I would store each chunk with a deterministic naming scheme that encodes its
  timeline position, bitrate, and resolution, so reassembly is a simple
  concatenation.
- Audio is segmented on the same boundaries and muxed back at the end.
- A manifest (HLS or DASH) is generated to reference every variant.

Scale and cost are managed together.

- Encoding is CPU or GPU intensive, so I would choose hardware encoders for the
  most common targets and keep workers on pinned images so output is
  reproducible.
- Duplicate work is avoided by content-addressed chunk storage: if a chunk hash
  already exists, it is skipped.
- Transcode results are immutable and cached at the CDN edge.
- The queue provides natural backpressure and priority, so a single user's large
  upload does not starve short preview jobs.
- A failed chunk retries independently instead of forcing a full re-encode..
- Browser editing works because the browser never touches raw footage.

- Each transcoded video is segmented into small files.
- The editor plays a sequence of proxy segments while the user scrubs and
  arranges clips on the timeline.
- A segment service resolves the project timeline into an ordered list of chunk
  URLs.
- The player fetches only the chunks needed for the current viewport of the
  timeline, prefetching neighbors ahead of playback.
- This keeps memory bounded and lets a long project edit fluidly without ever
  loading the whole file.

The timeline itself is a document of operations, not a rendered video.

- I would model it as a tree: clips reference source segments, tracks group
  clips, and the sequence defines order.
- The editor sends mutations to the segment service.
- The segment service validates them, persists a versioned project document, and
  returns a compact diff for optimistic UI updates.
- Thumbnails for each clip are generated during transcoding and served from the
  CDN, so hovering over the timeline shows frames instantly.
- Undo and redo are cheap because the project is just a set of reversible
  operations.

Latency and synchronization are the hard parts.

- I would use a state protocol where the client applies local changes
  immediately and the server confirms order, with a version stamp on each
  mutation to resolve conflicts.
- Co-editing, if needed, follows the same protocol with operation-based CRDTs
  scoped to the project.
- When the user exports, the server reconstructs the timeline from the versioned
  document at full resolution, so preview quality and final output can differ.
- The tradeoff is that previews are lossy by design; the editor trades fidelity
  for responsiveness, and accuracy is restored at render time..
- Rendering must be embarrassingly parallel, so I would never render the timeline
  as one monolithic job.

- The render farm splits the export into segment-sized units.
- It applies the timeline effects to each segment at the source's native
  resolution, and encodes the pieces independently.
- A final pass concatenates and muxes.
- A dependency graph expresses which segments depend on overlapping source
  material so workers can cache intermediate frames.
- This makes a 4K export scale linearly with the number of workers rather than
  with wall-clock duration.

The export job is a declarative spec serialized to the queue: source segments,
effect chain, output codec, resolution, and frame rate.

- The render farm executes it deterministically, so retries produce identical
  output and partial failure only re-renders the missing segments.
- I would use an incremental cache keyed on the effect graph.
- If a user changes only the last ten seconds, the earlier segments are reused
  rather than re-encoded.
- This is the single largest cost saving for a service where users iterate
  repeatedly.

GPU utilization is the main cost driver.

- I would bin workers by codec and effect complexity and let the scheduler place
  jobs on the right pool.
- Priorities come from the queue: exports are interactive enough that a user
  expects a result in minutes, while backfill jobs run off-peak.
- Progress is reported per segment so the client can show a granular progress
  bar.
- The metadata database records job metrics.
- The master file is produced in a mezzanine codec for archiving.
- Distribution renditions are encoded once and cached at the CDN, so the
  expensive render pass happens exactly once..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Video Editing
user: User
app: Editor App
gateway: API Gateway
upload: Upload Service
store: Object Storage
transcode: Transcoding Cluster
segment: Segment Service
queue: Job Queue
render: Render Farm
cache: CDN Cache
db: Metadata DB

user ─► app ─► upload
app ─► gateway ─► submit
gateway ─► upload ─► transfer
upload ─► store ─► raw
transcode ─► segment ─► chunks
segment ─► store ─► proxies
app ─► segment ─► edit
gateway ─► render ─► export
render ─► queue ─► jobs
render ─► store ─► final
store ─► cache ─► stream
```

## Design

### Design a cloud video editing service

A cloud video editing service combines heavy media pipelines with interactive
editing, so the architecture splits the hot path from the compute path.

- The upload service streams raw footage into object storage.
- The transcoding cluster converts it into segmented, multi-bitrate formats for
  the browser.
- The segment service cuts those files into small chunks that the editor can
  scrub and rearrange.
- Rendering is fully asynchronous: when the user exports, the gateway submits a
  job to the render farm through a durable queue.
- The final video is written back to storage and served through a CDN.

The user flow is designed around the segment model.

- A raw upload is immediately transcoded into low-resolution proxies, so the
  browser can play previews without downloading the original.
- The editor manipulates a timeline of segment references rather than whole
  files.
- Every edit is recorded as a sequence of operations over segments.
- On export, the render farm recombines the segments at full resolution, applies
  the timeline effects, and produces the master file plus web-optimized
  renditions.
- The metadata database tracks project, asset, and job state, so any worker can
  resume work after a crash.

The key tradeoff is between interactive latency and rendering cost.

- Proxies give instant previews at the price of a transcoding step.
- Full-resolution rendering is batched and prioritized through the queue.
- Segmenting the source enables parallel processing, resume points, and cheap
  retries, because a failed render only re-does the affected chunks.
- The design accepts that the render farm is the scaling bottleneck and measures
  queue depth to autoscale workers.
- This keeps the synchronous edit path small and responsive.

### How do you transcode videos at scale?

Transcoding is embarrassingly parallel if you segment first.

- The raw file is split into short chunks, typically two to six seconds, aligned
  to keyframes.
- Each chunk is transcoded independently to every target bitrate and resolution.
- I would drive this with a job queue where each chunk is a unit of work.
- A transcoding cluster scales out on queue depth.
- Workers pull chunks, run the encoder, and push results to object storage.
- Because chunks are independent, a 4K file with hundreds of chunks can use
  hundreds of workers with no coordination.

Correct segmentation requires that chunks align on closed GOP boundaries so they
splice together without artifacts.

- The transcoding cluster first does a pass to identify keyframe positions.
- It then encodes each segment with a repeating GOP structure so the segmenter
  can cut cleanly.
- I would store each chunk with a deterministic naming scheme that encodes its
  timeline position, bitrate, and resolution, so reassembly is a simple
  concatenation.
- Audio is segmented on the same boundaries and muxed back at the end.
- A manifest (HLS or DASH) is generated to reference every variant.

Scale and cost are managed together.

- Encoding is CPU or GPU intensive, so I would choose hardware encoders for the
  most common targets and keep workers on pinned images so output is
  reproducible.
- Duplicate work is avoided by content-addressed chunk storage: if a chunk hash
  already exists, it is skipped.
- Transcode results are immutable and cached at the CDN edge.
- The queue provides natural backpressure and priority, so a single user's large
  upload does not starve short preview jobs.
- A failed chunk retries independently instead of forcing a full re-encode.

### How do you support timeline editing in the browser?

Browser editing works because the browser never touches raw footage.

- Each transcoded video is segmented into small files.
- The editor plays a sequence of proxy segments while the user scrubs and
  arranges clips on the timeline.
- A segment service resolves the project timeline into an ordered list of chunk
  URLs.
- The player fetches only the chunks needed for the current viewport of the
  timeline, prefetching neighbors ahead of playback.
- This keeps memory bounded and lets a long project edit fluidly without ever
  loading the whole file.

The timeline itself is a document of operations, not a rendered video.

- I would model it as a tree: clips reference source segments, tracks group
  clips, and the sequence defines order.
- The editor sends mutations to the segment service.
- The segment service validates them, persists a versioned project document, and
  returns a compact diff for optimistic UI updates.
- Thumbnails for each clip are generated during transcoding and served from the
  CDN, so hovering over the timeline shows frames instantly.
- Undo and redo are cheap because the project is just a set of reversible
  operations.

Latency and synchronization are the hard parts.

- I would use a state protocol where the client applies local changes
  immediately and the server confirms order, with a version stamp on each
  mutation to resolve conflicts.
- Co-editing, if needed, follows the same protocol with operation-based CRDTs
  scoped to the project.
- When the user exports, the server reconstructs the timeline from the versioned
  document at full resolution, so preview quality and final output can differ.
- The tradeoff is that previews are lossy by design; the editor trades fidelity
  for responsiveness, and accuracy is restored at render time.

### How do you render final videos efficiently?

Rendering must be embarrassingly parallel, so I would never render the timeline
as one monolithic job.

- The render farm splits the export into segment-sized units.
- It applies the timeline effects to each segment at the source's native
  resolution, and encodes the pieces independently.
- A final pass concatenates and muxes.
- A dependency graph expresses which segments depend on overlapping source
  material so workers can cache intermediate frames.
- This makes a 4K export scale linearly with the number of workers rather than
  with wall-clock duration.

The export job is a declarative spec serialized to the queue: source segments,
effect chain, output codec, resolution, and frame rate.

- The render farm executes it deterministically, so retries produce identical
  output and partial failure only re-renders the missing segments.
- I would use an incremental cache keyed on the effect graph.
- If a user changes only the last ten seconds, the earlier segments are reused
  rather than re-encoded.
- This is the single largest cost saving for a service where users iterate
  repeatedly.

GPU utilization is the main cost driver.

- I would bin workers by codec and effect complexity and let the scheduler place
  jobs on the right pool.
- Priorities come from the queue: exports are interactive enough that a user
  expects a result in minutes, while backfill jobs run off-peak.
- Progress is reported per segment so the client can show a granular progress
  bar.
- The metadata database records job metrics.
- The master file is produced in a mezzanine codec for archiving.
- Distribution renditions are encoded once and cached at the CDN, so the
  expensive render pass happens exactly once.

### How do you manage storage costs?

Video is the most expensive asset type, so storage strategy dominates costs.

- Raw uploads are stored once in cold storage with a lifecycle policy that
  deletes them after a grace period once transcoding completes.
- Proxies and segment chunks are stored in standard storage because they are the
  hot working set for editing.
- Final renders move to the CDN origin.
- I would keep exactly one copy of each content-addressed asset and deduplicate
  aggressively.
- The same clip imported into many projects references the same chunks instead
  of duplicating bytes.

Tiering and retention need explicit policies.

- Raw footage goes to cold tier immediately after encoding and is purged on a
  schedule.
- Proxies are regenerable, so they are candidates for expiry after the project
  is inactive.
- The service can re-render them on demand from the original.
- Final exports are immutable and kept.
- I would offer users the option to archive projects, which moves chunks to cold
  storage and deletes the origin cache.
- A quota system per user or team, surfaced in the UI, prevents unbounded
  growth.

The cost of re-encoding is the tradeoff against storage.

- Deleting proxies saves bytes but risks a re-render when a user returns to an
  old project.
- I would keep a compact set of thumbnails and a low-bitrate proxy for every
  project forever, since those are tiny.
- Analytics on access frequency drive tier transitions.
- A bill-of-materials table per project links every byte to the asset that
  produced it, so finance can report storage cost by user.
- The result is that hot assets are fast, cold assets are cheap, and nothing is
  stored twice.

## Source

```text
title: Video Editing
node user: User [round, icon=browser]
node app: Editor App [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node store: Object Storage [cylinder, icon=file]
node transcode: Transcoding Cluster [icon=compute]
node segment: Segment Service [icon=compute]
node queue: Job Queue [icon=queue]
node render: Render Farm [icon=compute]
node cache: CDN Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> upload: transfer
edge upload -> store: raw
edge transcode -> segment: chunks
edge segment -> store: proxies
edge app -> segment: edit
edge gateway -> render: export
edge render -> queue: jobs
edge render -> store: final
edge store -> cache: stream
```

## Q&A

### Q: Design a cloud video editing service

**A:** A cloud video editing service combines heavy media pipelines with interactive
editing, so the architecture splits the hot path from the compute path.

- The upload service streams raw footage into object storage.
- The transcoding cluster converts it into segmented, multi-bitrate formats for
  the browser.
- The segment service cuts those files into small chunks that the editor can
  scrub and rearrange.
- Rendering is fully asynchronous: when the user exports, the gateway submits a
  job to the render farm through a durable queue.
- The final video is written back to storage and served through a CDN.

The user flow is designed around the segment model.

- A raw upload is immediately transcoded into low-resolution proxies, so the
  browser can play previews without downloading the original.
- The editor manipulates a timeline of segment references rather than whole
  files.
- Every edit is recorded as a sequence of operations over segments.
- On export, the render farm recombines the segments at full resolution, applies
  the timeline effects, and produces the master file plus web-optimized
  renditions.
- The metadata database tracks project, asset, and job state, so any worker can
  resume work after a crash.

The key tradeoff is between interactive latency and rendering cost.

- Proxies give instant previews at the price of a transcoding step.
- Full-resolution rendering is batched and prioritized through the queue.
- Segmenting the source enables parallel processing, resume points, and cheap
  retries, because a failed render only re-does the affected chunks.
- The design accepts that the render farm is the scaling bottleneck and measures
  queue depth to autoscale workers.
- This keeps the synchronous edit path small and responsive.

### Q: How do you transcode videos at scale?

**A:** Transcoding is embarrassingly parallel if you segment first.

- The raw file is split into short chunks, typically two to six seconds, aligned
  to keyframes.
- Each chunk is transcoded independently to every target bitrate and resolution.
- I would drive this with a job queue where each chunk is a unit of work.
- A transcoding cluster scales out on queue depth.
- Workers pull chunks, run the encoder, and push results to object storage.
- Because chunks are independent, a 4K file with hundreds of chunks can use
  hundreds of workers with no coordination.

Correct segmentation requires that chunks align on closed GOP boundaries so they
splice together without artifacts.

- The transcoding cluster first does a pass to identify keyframe positions.
- It then encodes each segment with a repeating GOP structure so the segmenter
  can cut cleanly.
- I would store each chunk with a deterministic naming scheme that encodes its
  timeline position, bitrate, and resolution, so reassembly is a simple
  concatenation.
- Audio is segmented on the same boundaries and muxed back at the end.
- A manifest (HLS or DASH) is generated to reference every variant.

Scale and cost are managed together.

- Encoding is CPU or GPU intensive, so I would choose hardware encoders for the
  most common targets and keep workers on pinned images so output is
  reproducible.
- Duplicate work is avoided by content-addressed chunk storage: if a chunk hash
  already exists, it is skipped.
- Transcode results are immutable and cached at the CDN edge.
- The queue provides natural backpressure and priority, so a single user's large
  upload does not starve short preview jobs.
- A failed chunk retries independently instead of forcing a full re-encode.

### Q: How do you support timeline editing in the browser?

**A:** Browser editing works because the browser never touches raw footage.

- Each transcoded video is segmented into small files.
- The editor plays a sequence of proxy segments while the user scrubs and
  arranges clips on the timeline.
- A segment service resolves the project timeline into an ordered list of chunk
  URLs.
- The player fetches only the chunks needed for the current viewport of the
  timeline, prefetching neighbors ahead of playback.
- This keeps memory bounded and lets a long project edit fluidly without ever
  loading the whole file.

The timeline itself is a document of operations, not a rendered video.

- I would model it as a tree: clips reference source segments, tracks group
  clips, and the sequence defines order.
- The editor sends mutations to the segment service.
- The segment service validates them, persists a versioned project document, and
  returns a compact diff for optimistic UI updates.
- Thumbnails for each clip are generated during transcoding and served from the
  CDN, so hovering over the timeline shows frames instantly.
- Undo and redo are cheap because the project is just a set of reversible
  operations.

Latency and synchronization are the hard parts.

- I would use a state protocol where the client applies local changes
  immediately and the server confirms order, with a version stamp on each
  mutation to resolve conflicts.
- Co-editing, if needed, follows the same protocol with operation-based CRDTs
  scoped to the project.
- When the user exports, the server reconstructs the timeline from the versioned
  document at full resolution, so preview quality and final output can differ.
- The tradeoff is that previews are lossy by design; the editor trades fidelity
  for responsiveness, and accuracy is restored at render time.

### Q: How do you render final videos efficiently?

**A:** Rendering must be embarrassingly parallel, so I would never render the timeline
as one monolithic job.

- The render farm splits the export into segment-sized units.
- It applies the timeline effects to each segment at the source's native
  resolution, and encodes the pieces independently.
- A final pass concatenates and muxes.
- A dependency graph expresses which segments depend on overlapping source
  material so workers can cache intermediate frames.
- This makes a 4K export scale linearly with the number of workers rather than
  with wall-clock duration.

The export job is a declarative spec serialized to the queue: source segments,
effect chain, output codec, resolution, and frame rate.

- The render farm executes it deterministically, so retries produce identical
  output and partial failure only re-renders the missing segments.
- I would use an incremental cache keyed on the effect graph.
- If a user changes only the last ten seconds, the earlier segments are reused
  rather than re-encoded.
- This is the single largest cost saving for a service where users iterate
  repeatedly.

GPU utilization is the main cost driver.

- I would bin workers by codec and effect complexity and let the scheduler place
  jobs on the right pool.
- Priorities come from the queue: exports are interactive enough that a user
  expects a result in minutes, while backfill jobs run off-peak.
- Progress is reported per segment so the client can show a granular progress
  bar.
- The metadata database records job metrics.
- The master file is produced in a mezzanine codec for archiving.
- Distribution renditions are encoded once and cached at the CDN, so the
  expensive render pass happens exactly once.

### Q: How do you manage storage costs?

**A:** Video is the most expensive asset type, so storage strategy dominates costs.

- Raw uploads are stored once in cold storage with a lifecycle policy that
  deletes them after a grace period once transcoding completes.
- Proxies and segment chunks are stored in standard storage because they are the
  hot working set for editing.
- Final renders move to the CDN origin.
- I would keep exactly one copy of each content-addressed asset and deduplicate
  aggressively.
- The same clip imported into many projects references the same chunks instead
  of duplicating bytes.

Tiering and retention need explicit policies.

- Raw footage goes to cold tier immediately after encoding and is purged on a
  schedule.
- Proxies are regenerable, so they are candidates for expiry after the project
  is inactive.
- The service can re-render them on demand from the original.
- Final exports are immutable and kept.
- I would offer users the option to archive projects, which moves chunks to cold
  storage and deletes the origin cache.
- A quota system per user or team, surfaced in the UI, prevents unbounded
  growth.

The cost of re-encoding is the tradeoff against storage.

- Deleting proxies saves bytes but risks a re-render when a user returns to an
  old project.
- I would keep a compact set of thumbnails and a low-bitrate proxy for every
  project forever, since those are tiny.
- Analytics on access frequency drive tier transitions.
- A bill-of-materials table per project links every byte to the asset that
  produced it, so finance can report storage cost by user.
- The result is that hot assets are fast, cold assets are cheap, and nothing is
  stored twice.

## Source

```text
title: Video Editing
node user: User [round, icon=browser]
node app: Editor App [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node store: Object Storage [cylinder, icon=file]
node transcode: Transcoding Cluster [icon=compute]
node segment: Segment Service [icon=compute]
node queue: Job Queue [icon=queue]
node render: Render Farm [icon=compute]
node cache: CDN Cache [icon=cache]
node db: Metadata DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> upload: transfer
edge upload -> store: raw
edge transcode -> segment: chunks
edge segment -> store: proxies
edge app -> segment: edit
edge gateway -> render: export
edge render -> queue: jobs
edge render -> store: final
edge store -> cache: stream
```
