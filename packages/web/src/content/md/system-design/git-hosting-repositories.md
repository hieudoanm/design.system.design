# Git Hosting — Repositories

Design a git hosting service

**Difficulty:** Easy

**Tags:** devops, storage

## Functional Requirements

- a git hosting service
- store git objects at scale?
- make clone and fetch operations fast?
- run CI on pushed commits?
- handle large repositories and monorepos?

## Non-Functional Requirements

- Highly available
- Low latency
- Horizontally scalable

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Git Hosting
dev: Developer
client: Git Client
gateway: Git Gateway
repo: Repo Service
object: Object Store
refs: Ref Service
ci: CI Runner
review: PR Service
web: Web UI
notify: Notifications

dev ─► client ─► push
client ─► gateway ─► pack
gateway ─► repo ─► receive
repo ─► object ─► store
repo ─► refs ─► update
dev ─► web ─► open PR
web ─► review ─► create
review ─► ci ─► build
ci ─► review ─► status
review ─► notify ─► comment
```

## Design

### Design a git hosting service

The service terminates git protocol traffic (smart HTTP, SSH) at a Git Gateway,
which authenticates the developer, resolves the repository, and runs the
receive-pack or upload-pack conversation against the Repo Service.

- A push accepts the packfile, writes the referenced objects into the Object
  Store, and updates the refs (branches, tags) through the Ref Service in a
  fast-forward-checked transaction — ref updates are atomic per repository.
- The Web UI lets developers open a PR, which the PR Service creates with a
  head/base pair, runs review workflows, and reports CI status; Notifications
  fan out comments, reviews, and status changes.
- Object storage is content-addressed by SHA-1/SHA-256, so identical blobs and
  trees are deduplicated across the whole platform; refs are the only mutable
  state.
- Read paths dominate, so clones are served from hot caches and packfile caches,
  while writes land in durable blob storage.
- Failure handling covers interrupted pushes (orphaned objects are
  garbage-collected), concurrent ref updates (atomic compare-and-swap), and CI
  outages (status is reported asynchronously via webhooks rather than blocking
  the push).

### How do you store git objects at scale?

Git objects are stored content-addressed in an Object Store partitioned by the
first two hex characters of the object hash, which spreads writes across shards
while keeping lookups local to a bucket.

- Loose objects are written on push and later batched into packfiles by a
  background job to reduce the object count and compress deltas; the store is
  write-once and immutable, so a shared packfile cache serves identical content
  to many clones.
- Every object has a reference count derived from reachability — refs plus the
  PR data referencing commits — and a garbage collector removes objects
  unreachable from any ref after a grace period, with atomic reachability
  sweeps.
- Duplicate pushes are cheap because a re-pushed commit whose objects already
  exist only writes the new ref.
- To bound cost, large blobs are stored as a single object (with optional LFS
  offloading) and storage tiers move cold repositories to cheaper media.
- Integrity is verified with periodic object-hash re-checks and
  repair-from-replica, because a corrupted object in a content-addressed store
  is silently dangerous to every downstream clone.

### How do you make clone and fetch operations fast?

Clone speed is dominated by packfile construction, so the service caches
precomputed packs per repository and serves the delta-compressed pack rather
than re-building it per request.

- The gateway runs the negotiation protocol (e.g., fetch negotiation with
  `have`/`want`) to send only missing objects, and the server generates a thin
  pack of just those objects when a precomputed pack does not match.
- Repositories with long history benefit from bitmap indexes in packfiles, which
  answer reachability questions (which objects does a ref actually need) without
  walking the graph.
- Hot repositories are pinned on fast local disks with an in-memory object
  cache, while cold repositories are served from the archive tier; a repository
  moves tiers on access patterns.
- Partial clone and blobless clone are advertised for huge repositories so
  developers fetch only what they need, and shallow clones cap the history
  transferred for CI and one-off fetches.
- The gateway runs on many instances behind the repository sharding (repo →
  shard mapping in a registry), so clone load spreads horizontally and a hot
  repo does not collapse a single machine.

### How do you run CI on pushed commits?

When a push updates a ref, the gateway publishes a push event containing the new
commit sha and the repo to a CI event stream; CI runs are triggered per event,
never polled.

- The CI runner schedules jobs on a worker pool, clones the commit (with a cache
  of dependencies and build artifacts keyed by repo + commit graph), executes
  the pipeline, and reports status back to the PR Service and to commit status
  APIs.
- Deduplication prevents redundant work: identical commit shas or identical
  (repo, tree) combinations reuse cached results, and "cancelled superceded"
  semantics stop a slow job when a newer push lands on the same branch.
- Runners are isolated per job — container or VM — so untrusted pipeline code
  cannot affect other tenants, with resource quotas on CPU, memory, and network.
- Results are written to a status store and pushed via webhooks to the PR UI in
  real time; logs stream to an object-backed log store that supports tailing.
- Failures are handled with retries for transient errors and a clear fail status
  for genuine test failures, and the event stream replays missed events so a
  runner crash never silently drops a CI run.

### How do you handle large repositories and monorepos?

Large repositories and monorepos strain clone times, CI, and ref lookups, so the
platform shifts cost out of the naive path.

- Blobless and tree-less partial clones let developers clone metadata and fetch
  objects on demand, which turns a multi-GB monorepo clone into a small metadata
  fetch.
- CI for a monorepo uses change detection: a diff between the base and head
  commit identifies which projects actually changed, and the scheduler builds
  and tests only affected projects, with a no-change fast path that reports
  success immediately.
- Pack serving uses a sharded object cache per repository and path-filtered
  packfiles so a checkout only materializes the subdirectories a job needs.
- Ref lookups and reachability use a commit-graph cache (generation numbers) to
  avoid walking entire histories.
- Scaling concerns include oversized single blobs (mitigated by LFS and size
  limits) and many refs (ref advertisements are paginated and cached).
- Governance tooling — path-based code owners, required status checks per
  subtree — becomes necessary, and the service optimizes for the monorepo's
  wide-fanout PR traffic by caching PR base snapshots.

## Source

```text
title: Git Hosting
node dev: Developer [round, icon=browser]
node client: Git Client [icon=browser]
node gateway: Git Gateway [icon=server]
node repo: Repo Service [icon=file]
node object: Object Store [cylinder, icon=database]
node refs: Ref Service [icon=search]
node ci: CI Runner [icon=worker]
node review: PR Service [icon=users]
node web: Web UI [icon=browser]
node notify: Notifications [icon=message]

edge dev -> client: push
edge client -> gateway: pack
edge gateway -> repo: receive
edge repo -> object: store
edge repo -> refs: update
edge dev -> web: open PR
edge web -> review: create
edge review -> ci: build
edge ci -> review: status
edge review -> notify: comment
```

## Q&A

### Q: Design a git hosting service

**A:** The service terminates git protocol traffic (smart HTTP, SSH) at a Git Gateway,
which authenticates the developer, resolves the repository, and runs the
receive-pack or upload-pack conversation against the Repo Service.

- A push accepts the packfile, writes the referenced objects into the Object
  Store, and updates the refs (branches, tags) through the Ref Service in a
  fast-forward-checked transaction — ref updates are atomic per repository.
- The Web UI lets developers open a PR, which the PR Service creates with a
  head/base pair, runs review workflows, and reports CI status; Notifications
  fan out comments, reviews, and status changes.
- Object storage is content-addressed by SHA-1/SHA-256, so identical blobs and
  trees are deduplicated across the whole platform; refs are the only mutable
  state.
- Read paths dominate, so clones are served from hot caches and packfile caches,
  while writes land in durable blob storage.
- Failure handling covers interrupted pushes (orphaned objects are
  garbage-collected), concurrent ref updates (atomic compare-and-swap), and CI
  outages (status is reported asynchronously via webhooks rather than blocking
  the push).

### Q: How do you store git objects at scale?

**A:** Git objects are stored content-addressed in an Object Store partitioned by the
first two hex characters of the object hash, which spreads writes across shards
while keeping lookups local to a bucket.

- Loose objects are written on push and later batched into packfiles by a
  background job to reduce the object count and compress deltas; the store is
  write-once and immutable, so a shared packfile cache serves identical content
  to many clones.
- Every object has a reference count derived from reachability — refs plus the
  PR data referencing commits — and a garbage collector removes objects
  unreachable from any ref after a grace period, with atomic reachability
  sweeps.
- Duplicate pushes are cheap because a re-pushed commit whose objects already
  exist only writes the new ref.
- To bound cost, large blobs are stored as a single object (with optional LFS
  offloading) and storage tiers move cold repositories to cheaper media.
- Integrity is verified with periodic object-hash re-checks and
  repair-from-replica, because a corrupted object in a content-addressed store
  is silently dangerous to every downstream clone.

### Q: How do you make clone and fetch operations fast?

**A:** Clone speed is dominated by packfile construction, so the service caches
precomputed packs per repository and serves the delta-compressed pack rather
than re-building it per request.

- The gateway runs the negotiation protocol (e.g., fetch negotiation with
  `have`/`want`) to send only missing objects, and the server generates a thin
  pack of just those objects when a precomputed pack does not match.
- Repositories with long history benefit from bitmap indexes in packfiles, which
  answer reachability questions (which objects does a ref actually need) without
  walking the graph.
- Hot repositories are pinned on fast local disks with an in-memory object
  cache, while cold repositories are served from the archive tier; a repository
  moves tiers on access patterns.
- Partial clone and blobless clone are advertised for huge repositories so
  developers fetch only what they need, and shallow clones cap the history
  transferred for CI and one-off fetches.
- The gateway runs on many instances behind the repository sharding (repo →
  shard mapping in a registry), so clone load spreads horizontally and a hot
  repo does not collapse a single machine.

### Q: How do you run CI on pushed commits?

**A:** When a push updates a ref, the gateway publishes a push event containing the new
commit sha and the repo to a CI event stream; CI runs are triggered per event,
never polled.

- The CI runner schedules jobs on a worker pool, clones the commit (with a cache
  of dependencies and build artifacts keyed by repo + commit graph), executes
  the pipeline, and reports status back to the PR Service and to commit status
  APIs.
- Deduplication prevents redundant work: identical commit shas or identical
  (repo, tree) combinations reuse cached results, and "cancelled superceded"
  semantics stop a slow job when a newer push lands on the same branch.
- Runners are isolated per job — container or VM — so untrusted pipeline code
  cannot affect other tenants, with resource quotas on CPU, memory, and network.
- Results are written to a status store and pushed via webhooks to the PR UI in
  real time; logs stream to an object-backed log store that supports tailing.
- Failures are handled with retries for transient errors and a clear fail status
  for genuine test failures, and the event stream replays missed events so a
  runner crash never silently drops a CI run.

### Q: How do you handle large repositories and monorepos?

**A:** Large repositories and monorepos strain clone times, CI, and ref lookups, so the
platform shifts cost out of the naive path.

- Blobless and tree-less partial clones let developers clone metadata and fetch
  objects on demand, which turns a multi-GB monorepo clone into a small metadata
  fetch.
- CI for a monorepo uses change detection: a diff between the base and head
  commit identifies which projects actually changed, and the scheduler builds
  and tests only affected projects, with a no-change fast path that reports
  success immediately.
- Pack serving uses a sharded object cache per repository and path-filtered
  packfiles so a checkout only materializes the subdirectories a job needs.
- Ref lookups and reachability use a commit-graph cache (generation numbers) to
  avoid walking entire histories.
- Scaling concerns include oversized single blobs (mitigated by LFS and size
  limits) and many refs (ref advertisements are paginated and cached).
- Governance tooling — path-based code owners, required status checks per
  subtree — becomes necessary, and the service optimizes for the monorepo's
  wide-fanout PR traffic by caching PR base snapshots.

## Source

```text
title: Git Hosting
node dev: Developer [round, icon=browser]
node client: Git Client [icon=browser]
node gateway: Git Gateway [icon=server]
node repo: Repo Service [icon=file]
node object: Object Store [cylinder, icon=database]
node refs: Ref Service [icon=search]
node ci: CI Runner [icon=worker]
node review: PR Service [icon=users]
node web: Web UI [icon=browser]
node notify: Notifications [icon=message]

edge dev -> client: push
edge client -> gateway: pack
edge gateway -> repo: receive
edge repo -> object: store
edge repo -> refs: update
edge dev -> web: open PR
edge web -> review: create
edge review -> ci: build
edge ci -> review: status
edge review -> notify: comment
```
