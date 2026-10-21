# Evernote — Notes App

Design a notes / note-taking app

**Difficulty:** Hard

**Tags:** file-sync, mobile, search

## Functional Requirements

- a notes / note-taking app
- sync notes across devices?
- handle offline edits and conflict resolution?
- implement full-text search over notes?
- handle attachments and media?

## Non-Functional Requirements

- Cross-device sync is a distributed systems problem dressed up as a feature.

- Each device keeps a local copy of a user's notes, and any device can change
  anything, so the system must converge without a central lock.
- The design is operation-based: every edit becomes an operation with a note ID,
  a client generated operation ID, a base version, and a timestamp, and the Sync
  Engine applies operations in a total order per note.
- The server assigns a global monotonic version to each accepted operation,
  which becomes the watermark every device uses to know what it still needs to
  fetch.

Delta sync is what keeps this cheap.

- Instead of re-downloading a note body on every change, the client uploads only
  the changed fields, and the server stores the current state plus a compact
  operation log.
- When a device comes online, it sends its last-seen version per note and
  receives only the deltas after that point.
- Batching and pipelining matter on mobile networks, where round trips are
  expensive; a sync session can carry hundreds of deltas in one request.
- Backpressure is handled by chunking large sync responses so a phone on a slow
  connection does not time out.

The server must be careful about what it promises.

- Per-note ordering is guaranteed, but cross-note ordering is not; a note's
  version is independent of every other note, which lets sync parallelize across
  notes.
- Deletion sync uses tombstones so a delete on one device propagates to all
  devices instead of resurrecting.
- Finally, the server exposes a push signal, usually over a WebSocket, telling a
  device that new changes are waiting, while polling remains as the fallback.
- This combination keeps latency low and correctness high, even when a user has
  a notebook with thousands of notes across five devices..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Notes App
user: User
app: Notes App
gateway: API Gateway
note: Note Service
sync: Sync Engine
version: Version Control
attach: Attachment Store
search: Search Index
share: Sharing
notify: Notifications
db: Notes DB

user ─► app ─► create note
app ─► gateway ─► upload
gateway ─► note ─► save
note ─► sync ─► delta
sync ─► version ─► history
app ─► attach ─► store
note ─► search ─► index
user ─► app ─► search
search ─► app ─► results
note ─► share ─► collaborate
share ─► notify ─► comment
note ─► db ─► store
```

## Design

### Design a notes / note-taking app

A notes app is a personal information system: capture on any device, sync to
every device, and retrieve by search.

- The core artifact is the note, a document with a title, body, tags, and an
  optional set of attachments.
- The architecture keeps a thin client and a strong server.
- The Notes App on each device edits locally, the API gateway accepts uploads
  and downloads, the Note Service owns the note records, the Sync Engine
  reconciles changes between devices, and a Search Index makes the corpus
  queryable.
- Because users trust a notes app with private data, encryption and access
  control are first-class, not add-ons.

The write path is designed around sync, not simple saves.

- When a user creates or edits a note, the app updates a local copy immediately,
  then uploads a delta to the server.
- The Note Service stores the canonical version in the Notes DB, a relational
  store keyed by user, while the Sync Engine records the change as a versioned
  operation.
- Search indexing and sharing events subscribe to the change stream so they
  never block the save.
- This async decoupling is what allows a device to sync hundreds of changes from
  offline work in a single batch.

The read path must feel instant.

- Opening a note on a device that already has it cached requires no network
  call; the app reconciles local state with the server in the background.
- Attachments go to an object store, fetched lazily through a CDN so images
  render fast.
- Sharing is a layer on top of the note model: a shared note is a permission
  entry that lets another user read or edit, with the Sync Engine pushing
  updates to collaborators in near real time.
- The result is a system optimized for the app's primary promise: your notes are
  always there, wherever you are.

### How do you sync notes across devices?

Cross-device sync is a distributed systems problem dressed up as a feature.

- Each device keeps a local copy of a user's notes, and any device can change
  anything, so the system must converge without a central lock.
- The design is operation-based: every edit becomes an operation with a note ID,
  a client generated operation ID, a base version, and a timestamp, and the Sync
  Engine applies operations in a total order per note.
- The server assigns a global monotonic version to each accepted operation,
  which becomes the watermark every device uses to know what it still needs to
  fetch.

Delta sync is what keeps this cheap.

- Instead of re-downloading a note body on every change, the client uploads only
  the changed fields, and the server stores the current state plus a compact
  operation log.
- When a device comes online, it sends its last-seen version per note and
  receives only the deltas after that point.
- Batching and pipelining matter on mobile networks, where round trips are
  expensive; a sync session can carry hundreds of deltas in one request.
- Backpressure is handled by chunking large sync responses so a phone on a slow
  connection does not time out.

The server must be careful about what it promises.

- Per-note ordering is guaranteed, but cross-note ordering is not; a note's
  version is independent of every other note, which lets sync parallelize across
  notes.
- Deletion sync uses tombstones so a delete on one device propagates to all
  devices instead of resurrecting.
- Finally, the server exposes a push signal, usually over a WebSocket, telling a
  device that new changes are waiting, while polling remains as the fallback.
- This combination keeps latency low and correctness high, even when a user has
  a notebook with thousands of notes across five devices.

### How do you handle offline edits and conflict resolution?

Offline editing means two devices can edit the same note without knowing about
each other, so conflicts are guaranteed to happen and must resolve without data
loss.

- The client is optimistic: an edit is applied locally immediately, and the
  operation is queued for upload.
- When connectivity returns, the client sends its queued operations to the
  server, which checks each one against the current version.
- If the base version matches, the operation applies cleanly.
- If not, the server detects a conflict and must decide what happens next.

The resolution strategy is last-writer-wins with a merge assist.

- For different fields of the note, such as title and body, the engine merges
  automatically, keeping the newer field value for each field independently.
- For same-field edits, the server applies the operation with the higher clock
  value and records the loser as an earlier revision, so nothing is destroyed.
- Logical clocks avoid the wall-clock skew problem: each device tracks a counter
  that increments on every edit, and the tuple of device ID and counter orders
  concurrent edits deterministically, even when clocks on two phones disagree.

The tricky part is that users edit the same sentence on two devices, and neither
side should be silently discarded.

- The app therefore surfaces conflicts that touched the same region: it shows a
  banner with the other version, lets the user pick or merge manually, and
  stores the result as a new operation.
- Conflict history is preserved per note so a user can recover from a bad merge.
- Storage rules keep this bounded: the server retains a limited revision window
  per note, and the sync log is compacted once a device acknowledges, so the
  system never grows without bound.

### How do you implement full-text search over notes?

Full-text search over notes is the retrieval mechanism that justifies the whole
product, so it must be fast, fresh, and tokenized well.

- Each note becomes a search document containing title, body, tags, and
  attachment text where extractable.
- A text analysis pipeline normalizes the content: it lower cases, splits into
  tokens, removes stop words, and applies stemming so searches for "running"
  match "run".
- The indexer consumes the note change stream, so a note is searchable within
  seconds of an edit.
- Because a user's notes can number in the tens of thousands, the index is
  sharded by user, keeping every query scoped to a single shard.

Query matching combines lexical and semantic signals.

- Exact tokens and phrases match with high weight, while a semantic layer using
  embeddings catches intent: a search for "meeting notes from March" should
  surface the note titled "Q1 planning" even with no shared tokens.
- The two result sets are merged and re-ranked by a small model that blends text
  relevance, recency, tag match, and click history.
- Tag filters and notebook filters narrow results, and the query parser compiles
  user syntax such as notebook:work into the index query plan.

Freshness has to beat expectation.

- The search index is updated from the sync event stream, with a per-user cursor
  so retries are safe, and a short time-to-live cache on frequent searches
  absorbs repeat queries.
- When an indexed attachment is deleted, the same stream removes it.
- The index is finally a privacy boundary: documents are only ever retrieved
  through user-scoped queries, and any sharing permission change triggers an
  immediate update of the document's access scope, so a note shared with you
  today and unshared tomorrow cannot leak through a stale index entry.

### How do you handle attachments and media?

Attachments stretch a notes app beyond text into a media library.

- The attachment store is object storage, addressed by a content hash or UUID,
  with metadata kept in the relational database: owner, note association, MIME
  type, size, and processing state.
- When a user attaches an image, the app uploads it directly to a pre-signed URL
  to avoid funneling large files through the API gateway, then records the
  attachment reference in the note.
- The hash-based addressing gives deduplication: the same photo attached to
  three notes is stored once, and only the reference rows differ.

Media needs processing pipelines.

- Images get thumbnails and resized variants for fast grid rendering, audio
  recordings get waveform previews, and PDFs get page thumbnails and text
  extraction for search.
- These run as asynchronous workers driven by a job queue, because transcoding
  an hour of audio cannot block a note save.
- The note record stores the base attachment plus the derived variants as a
  list, and the client picks the smallest variant that fits the current screen.
- A CDN fronts the object store so shared and hot media load quickly from the
  edge.

Storage and sync are the governance problems.

- Attachments are excluded from the delta sync stream; a note syncs its
  attachment references and metadata, while the bytes move only when the user
  opens them.
- This keeps sync fast and mobile plans intact.
- Quotas are enforced at upload time per user tier, and a garbage collector
  removes orphaned objects whose reference rows no longer exist, with a grace
  period for sync in flight.
- Retention policy lets users offload large media to cold storage automatically.
- The design accepts that attachments are heavy, and optimizes around keeping
  the common path of note text light and instant.

## Source

```text
title: Notes App
node user: User [round, icon=browser]
node app: Notes App [icon=browser]
node gateway: API Gateway [icon=server]
node note: Note Service [icon=compute]
node sync: Sync Engine [icon=sync]
node version: Version Control [icon=compute]
node attach: Attachment Store [cylinder, icon=file]
node search: Search Index [icon=search]
node share: Sharing [icon=users]
node notify: Notifications [icon=message]
node db: Notes DB [cylinder, icon=database]

edge user -> app: create note
edge app -> gateway: upload
edge gateway -> note: save
edge note -> sync: delta
edge sync -> version: history
edge app -> attach: store
edge note -> search: index
edge user -> app: search
edge search -> app: results
edge note -> share: collaborate
edge share -> notify: comment
edge note -> db: store
```

## Q&A

### Q: Design a notes / note-taking app

**A:** A notes app is a personal information system: capture on any device, sync to
every device, and retrieve by search.

- The core artifact is the note, a document with a title, body, tags, and an
  optional set of attachments.
- The architecture keeps a thin client and a strong server.
- The Notes App on each device edits locally, the API gateway accepts uploads
  and downloads, the Note Service owns the note records, the Sync Engine
  reconciles changes between devices, and a Search Index makes the corpus
  queryable.
- Because users trust a notes app with private data, encryption and access
  control are first-class, not add-ons.

The write path is designed around sync, not simple saves.

- When a user creates or edits a note, the app updates a local copy immediately,
  then uploads a delta to the server.
- The Note Service stores the canonical version in the Notes DB, a relational
  store keyed by user, while the Sync Engine records the change as a versioned
  operation.
- Search indexing and sharing events subscribe to the change stream so they
  never block the save.
- This async decoupling is what allows a device to sync hundreds of changes from
  offline work in a single batch.

The read path must feel instant.

- Opening a note on a device that already has it cached requires no network
  call; the app reconciles local state with the server in the background.
- Attachments go to an object store, fetched lazily through a CDN so images
  render fast.
- Sharing is a layer on top of the note model: a shared note is a permission
  entry that lets another user read or edit, with the Sync Engine pushing
  updates to collaborators in near real time.
- The result is a system optimized for the app's primary promise: your notes are
  always there, wherever you are.

### Q: How do you sync notes across devices?

**A:** Cross-device sync is a distributed systems problem dressed up as a feature.

- Each device keeps a local copy of a user's notes, and any device can change
  anything, so the system must converge without a central lock.
- The design is operation-based: every edit becomes an operation with a note ID,
  a client generated operation ID, a base version, and a timestamp, and the Sync
  Engine applies operations in a total order per note.
- The server assigns a global monotonic version to each accepted operation,
  which becomes the watermark every device uses to know what it still needs to
  fetch.

Delta sync is what keeps this cheap.

- Instead of re-downloading a note body on every change, the client uploads only
  the changed fields, and the server stores the current state plus a compact
  operation log.
- When a device comes online, it sends its last-seen version per note and
  receives only the deltas after that point.
- Batching and pipelining matter on mobile networks, where round trips are
  expensive; a sync session can carry hundreds of deltas in one request.
- Backpressure is handled by chunking large sync responses so a phone on a slow
  connection does not time out.

The server must be careful about what it promises.

- Per-note ordering is guaranteed, but cross-note ordering is not; a note's
  version is independent of every other note, which lets sync parallelize across
  notes.
- Deletion sync uses tombstones so a delete on one device propagates to all
  devices instead of resurrecting.
- Finally, the server exposes a push signal, usually over a WebSocket, telling a
  device that new changes are waiting, while polling remains as the fallback.
- This combination keeps latency low and correctness high, even when a user has
  a notebook with thousands of notes across five devices.

### Q: How do you handle offline edits and conflict resolution?

**A:** Offline editing means two devices can edit the same note without knowing about
each other, so conflicts are guaranteed to happen and must resolve without data
loss.

- The client is optimistic: an edit is applied locally immediately, and the
  operation is queued for upload.
- When connectivity returns, the client sends its queued operations to the
  server, which checks each one against the current version.
- If the base version matches, the operation applies cleanly.
- If not, the server detects a conflict and must decide what happens next.

The resolution strategy is last-writer-wins with a merge assist.

- For different fields of the note, such as title and body, the engine merges
  automatically, keeping the newer field value for each field independently.
- For same-field edits, the server applies the operation with the higher clock
  value and records the loser as an earlier revision, so nothing is destroyed.
- Logical clocks avoid the wall-clock skew problem: each device tracks a counter
  that increments on every edit, and the tuple of device ID and counter orders
  concurrent edits deterministically, even when clocks on two phones disagree.

The tricky part is that users edit the same sentence on two devices, and neither
side should be silently discarded.

- The app therefore surfaces conflicts that touched the same region: it shows a
  banner with the other version, lets the user pick or merge manually, and
  stores the result as a new operation.
- Conflict history is preserved per note so a user can recover from a bad merge.
- Storage rules keep this bounded: the server retains a limited revision window
  per note, and the sync log is compacted once a device acknowledges, so the
  system never grows without bound.

### Q: How do you implement full-text search over notes?

**A:** Full-text search over notes is the retrieval mechanism that justifies the whole
product, so it must be fast, fresh, and tokenized well.

- Each note becomes a search document containing title, body, tags, and
  attachment text where extractable.
- A text analysis pipeline normalizes the content: it lower cases, splits into
  tokens, removes stop words, and applies stemming so searches for "running"
  match "run".
- The indexer consumes the note change stream, so a note is searchable within
  seconds of an edit.
- Because a user's notes can number in the tens of thousands, the index is
  sharded by user, keeping every query scoped to a single shard.

Query matching combines lexical and semantic signals.

- Exact tokens and phrases match with high weight, while a semantic layer using
  embeddings catches intent: a search for "meeting notes from March" should
  surface the note titled "Q1 planning" even with no shared tokens.
- The two result sets are merged and re-ranked by a small model that blends text
  relevance, recency, tag match, and click history.
- Tag filters and notebook filters narrow results, and the query parser compiles
  user syntax such as notebook:work into the index query plan.

Freshness has to beat expectation.

- The search index is updated from the sync event stream, with a per-user cursor
  so retries are safe, and a short time-to-live cache on frequent searches
  absorbs repeat queries.
- When an indexed attachment is deleted, the same stream removes it.
- The index is finally a privacy boundary: documents are only ever retrieved
  through user-scoped queries, and any sharing permission change triggers an
  immediate update of the document's access scope, so a note shared with you
  today and unshared tomorrow cannot leak through a stale index entry.

### Q: How do you handle attachments and media?

**A:** Attachments stretch a notes app beyond text into a media library.

- The attachment store is object storage, addressed by a content hash or UUID,
  with metadata kept in the relational database: owner, note association, MIME
  type, size, and processing state.
- When a user attaches an image, the app uploads it directly to a pre-signed URL
  to avoid funneling large files through the API gateway, then records the
  attachment reference in the note.
- The hash-based addressing gives deduplication: the same photo attached to
  three notes is stored once, and only the reference rows differ.

Media needs processing pipelines.

- Images get thumbnails and resized variants for fast grid rendering, audio
  recordings get waveform previews, and PDFs get page thumbnails and text
  extraction for search.
- These run as asynchronous workers driven by a job queue, because transcoding
  an hour of audio cannot block a note save.
- The note record stores the base attachment plus the derived variants as a
  list, and the client picks the smallest variant that fits the current screen.
- A CDN fronts the object store so shared and hot media load quickly from the
  edge.

Storage and sync are the governance problems.

- Attachments are excluded from the delta sync stream; a note syncs its
  attachment references and metadata, while the bytes move only when the user
  opens them.
- This keeps sync fast and mobile plans intact.
- Quotas are enforced at upload time per user tier, and a garbage collector
  removes orphaned objects whose reference rows no longer exist, with a grace
  period for sync in flight.
- Retention policy lets users offload large media to cold storage automatically.
- The design accepts that attachments are heavy, and optimizes around keeping
  the common path of note text light and instant.

## Source

```text
title: Notes App
node user: User [round, icon=browser]
node app: Notes App [icon=browser]
node gateway: API Gateway [icon=server]
node note: Note Service [icon=compute]
node sync: Sync Engine [icon=sync]
node version: Version Control [icon=compute]
node attach: Attachment Store [cylinder, icon=file]
node search: Search Index [icon=search]
node share: Sharing [icon=users]
node notify: Notifications [icon=message]
node db: Notes DB [cylinder, icon=database]

edge user -> app: create note
edge app -> gateway: upload
edge gateway -> note: save
edge note -> sync: delta
edge sync -> version: history
edge app -> attach: store
edge note -> search: index
edge user -> app: search
edge search -> app: results
edge note -> share: collaborate
edge share -> notify: comment
edge note -> db: store
```
