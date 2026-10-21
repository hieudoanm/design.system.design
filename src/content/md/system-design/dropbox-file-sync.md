# Dropbox — File Sync

Design Dropbox / a file sync service

**Difficulty:** Easy

**Tags:** file-sync, storage

## Functional Requirements

- Dropbox / a file sync service
- detect and sync file changes efficiently?
- Why store files as content-addressed blocks?
- handle concurrent edits to the same file?
- version history and rollback

## Non-Functional Requirements

- Highly available
- Low latency
- Horizontally scalable

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Dropbox File Sync
client: Desktop Client
api: API Gateway
upload: Upload Service
sync: Sync Worker
meta: Metadata Service
version: Versioning
notify: Notifications
storage: Block Storage
db: Metadata DB
cache: Session Cache

client ─► api ─► watch changes
api ─► sync ─► diff
sync ─► db ─► compare
client ─► api ─► upload chunk
api ─► upload ─► accept
upload ─► storage ─► store blocks
upload ─► meta ─► index
meta ─► db ─► persist
meta ─► cache ─► read / write
client ─► api ─► poll
api ─► sync ─► pending changes
sync ─► notify ─► push updates
sync ─► version ─► snapshot
version ─► storage ─► history
```

## Design

### Design Dropbox / a file sync service

Clients watch the filesystem for changes, split files into fixed-size blocks,
and compute content hashes so only new blocks upload.

- An API gateway fronts upload, metadata, and sync services.
- The upload service stores blocks in object storage; the metadata service
  persists the file tree, block references, and per-client cursors in a metadata
  DB.
- Sync workers diff the client's snapshot against server state, then push or
  pull changes, with notifications telling other devices to fetch.
- Versioning snapshots preserve history as content-addressed manifests.
- Key trade-offs: dedupe at block granularity, delta sync over whole-file
  transfer, bandwidth throttling for uploads, and a well-defined conflict
  resolution policy for concurrent edits.

### How do you detect and sync file changes efficiently?

The client keeps a local snapshot of each file (size, mtime, and per-block
hashes) and compares it against the server's tree.

- Changes are detected by walking directories and re-hashing file blocks with
  SHA-256, transferring only missing or modified blocks.
- Content addressing lets you skip unchanged blocks even when the file changes
  elsewhere, and renames are handled by fingerprint rather than path.
- On the server, a sync worker compares the client's cursor against committed
  metadata and computes an add/update/delete diff.
- Incremental sync is cursor-based so each device pulls only deltas after the
  first full sync.
- Use notifications or long polling to trigger reconciliation rather than
  periodic full scans.

### Why store files as content-addressed blocks?

Splitting files into fixed-size blocks keyed by their content hash (SHA-256)
gives deduplication: identical blocks across files and users are stored once, so
a shared dependency or a duplicate upload costs nothing extra.

- It also enables efficient delta sync, since a new version references reused
  blocks and only changed ones upload.
- Content addressing provides integrity verification, because a hash mismatch
  exposes corruption, and makes blocks immutable, which simplifies replication
  and CDN caching.
- The metadata layer keeps the manifest: file id, ordered block list, and
  logical path.
- Trade-offs: block-index overhead and hashing cost on small files, so use a
  minimum file threshold or variable-size chunking (rolling hash) to balance
  dedupe against compute.

### How do you handle concurrent edits to the same file?

Use a versioned, optimistic model.

- Every accepted edit creates a new version; the server records the head version
  for each file.
- On upload the client sends the base version it edited; if the server head has
  advanced, the server rejects the write with the current version, and the
  client either fetches and retries or writes a conflict copy such as "Name
  (User's conflicted copy)".
- Commits are serialized per file via a version counter, and metadata updates
  are transactional so a stale client can never silently overwrite newer data.
- Most sync products choose last-writer-wins plus conflict copies over automatic
  three-way merge because sequential collaborators rarely collide, making the
  behavior predictable and recoverable.

### Design version history and rollback

Every committed snapshot is a manifest of content-addressed blocks, so history
is a chain of manifests in the metadata DB; versions share blocks, meaning
storage cost is only the delta.

- An API lists versions (id, author, timestamp, size).
- Restore is atomic pointer-swap: point the file's current manifest at an older
  one, with no data copy because blocks are immutable.
- Garbage-collect orphaned blocks by reference counting once no manifest
  references them.
- Retention policies thin history over time (full history for N days, then
  hourly or weekly snapshots).
- Folder-wide restore applies the same pointer-swap per file in a transaction.
- Version listing is read-heavy and served from cache.

## Source

```text
title: Dropbox File Sync
node client: Desktop Client [round, icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=file]
node sync: Sync Worker [icon=worker]
node meta: Metadata Service [icon=compute]
node version: Versioning [icon=sync]
node notify: Notifications [icon=mail]
node storage: Block Storage [cylinder, icon=file]
node db: Metadata DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> api: watch changes
edge api -> sync: diff
edge sync -> db: compare
edge client -> api: upload chunk
edge api -> upload: accept
edge upload -> storage: store blocks
edge upload -> meta: index
edge meta -> db: persist
edge meta -> cache: read / write
edge client -> api: poll
edge api -> sync: pending changes
edge sync -> notify: push updates
edge sync -> version: snapshot
edge version -> storage: history
```

## Q&A

### Q: Design Dropbox / a file sync service

**A:** Clients watch the filesystem for changes, split files into fixed-size blocks,
and compute content hashes so only new blocks upload.

- An API gateway fronts upload, metadata, and sync services.
- The upload service stores blocks in object storage; the metadata service
  persists the file tree, block references, and per-client cursors in a metadata
  DB.
- Sync workers diff the client's snapshot against server state, then push or
  pull changes, with notifications telling other devices to fetch.
- Versioning snapshots preserve history as content-addressed manifests.
- Key trade-offs: dedupe at block granularity, delta sync over whole-file
  transfer, bandwidth throttling for uploads, and a well-defined conflict
  resolution policy for concurrent edits.

### Q: How do you detect and sync file changes efficiently?

**A:** The client keeps a local snapshot of each file (size, mtime, and per-block
hashes) and compares it against the server's tree.

- Changes are detected by walking directories and re-hashing file blocks with
  SHA-256, transferring only missing or modified blocks.
- Content addressing lets you skip unchanged blocks even when the file changes
  elsewhere, and renames are handled by fingerprint rather than path.
- On the server, a sync worker compares the client's cursor against committed
  metadata and computes an add/update/delete diff.
- Incremental sync is cursor-based so each device pulls only deltas after the
  first full sync.
- Use notifications or long polling to trigger reconciliation rather than
  periodic full scans.

### Q: Why store files as content-addressed blocks?

**A:** Splitting files into fixed-size blocks keyed by their content hash (SHA-256)
gives deduplication: identical blocks across files and users are stored once, so
a shared dependency or a duplicate upload costs nothing extra.

- It also enables efficient delta sync, since a new version references reused
  blocks and only changed ones upload.
- Content addressing provides integrity verification, because a hash mismatch
  exposes corruption, and makes blocks immutable, which simplifies replication
  and CDN caching.
- The metadata layer keeps the manifest: file id, ordered block list, and
  logical path.
- Trade-offs: block-index overhead and hashing cost on small files, so use a
  minimum file threshold or variable-size chunking (rolling hash) to balance
  dedupe against compute.

### Q: How do you handle concurrent edits to the same file?

**A:** Use a versioned, optimistic model.

- Every accepted edit creates a new version; the server records the head version
  for each file.
- On upload the client sends the base version it edited; if the server head has
  advanced, the server rejects the write with the current version, and the
  client either fetches and retries or writes a conflict copy such as "Name
  (User's conflicted copy)".
- Commits are serialized per file via a version counter, and metadata updates
  are transactional so a stale client can never silently overwrite newer data.
- Most sync products choose last-writer-wins plus conflict copies over automatic
  three-way merge because sequential collaborators rarely collide, making the
  behavior predictable and recoverable.

### Q: Design version history and rollback

**A:** Every committed snapshot is a manifest of content-addressed blocks, so history
is a chain of manifests in the metadata DB; versions share blocks, meaning
storage cost is only the delta.

- An API lists versions (id, author, timestamp, size).
- Restore is atomic pointer-swap: point the file's current manifest at an older
  one, with no data copy because blocks are immutable.
- Garbage-collect orphaned blocks by reference counting once no manifest
  references them.
- Retention policies thin history over time (full history for N days, then
  hourly or weekly snapshots).
- Folder-wide restore applies the same pointer-swap per file in a transaction.
- Version listing is read-heavy and served from cache.

## Source

```text
title: Dropbox File Sync
node client: Desktop Client [round, icon=browser]
node api: API Gateway [icon=server]
node upload: Upload Service [icon=file]
node sync: Sync Worker [icon=worker]
node meta: Metadata Service [icon=compute]
node version: Versioning [icon=sync]
node notify: Notifications [icon=mail]
node storage: Block Storage [cylinder, icon=file]
node db: Metadata DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> api: watch changes
edge api -> sync: diff
edge sync -> db: compare
edge client -> api: upload chunk
edge api -> upload: accept
edge upload -> storage: store blocks
edge upload -> meta: index
edge meta -> db: persist
edge meta -> cache: read / write
edge client -> api: poll
edge api -> sync: pending changes
edge sync -> notify: push updates
edge sync -> version: snapshot
edge version -> storage: history
```
