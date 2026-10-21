# Docker — Container Registry

Design a container image registry

**Difficulty:** Medium

**Tags:** container, storage

## Functional Requirements

- a container image registry
- store layers with deduplication?
- stream image pulls efficiently?
- enforce policies and scanning?
- handle concurrent pushes?

## Non-Functional Requirements

- A container registry stores container images as a set of content-addressable
  layers plus a manifest that ties them together.

- The push path uploads the image layers, deduplicates them against existing
  content, records a manifest, and triggers a vulnerability scan.
- The pull path resolves the manifest, determines which layers the client
  already has, and serves the missing ones.
- Both paths are governed by a registry database that holds metadata, while the
  layer store keeps the actual blob content.

The diagram shows the split clearly.

- On push, the gateway forwards uploaded layers to the push service, which
  checks layer dedup before storing new blobs and writing the manifest.
- On pull, the gateway hands the fetch request to the pull service, which reads
  the needed layers and serves them, ideally from a blob cache.
- The vulnerability scan inspects pushed images and writes its report to the
  registry database.

The defining property of container storage is content addressability.

- Every layer is identified by a digest of its bytes, so identical layers are
  stored once and shared across all images that reference them.
- This makes dedup natural, but it also means the registry must treat blobs as
  immutable, handle garbage collection carefully, and make the manifest the
  single source of truth for what an image actually is.
- The manifest is small but read constantly, so it is served from a hot cache
  with strong consistency guarantees, while large layer blobs are cached at the
  edge, where immutability makes staleness impossible.
- The API also exposes upload and pull progress so clients can show meaningful
  status instead of sitting on a silent transfer..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Container Registry
dev: Developer
app: Docker CLI
gateway: API Gateway
push: Push Service
manifest: Manifest Store
layer: Layer Store
dedupe: Layer Dedup
pull: Pull Service
cache: Blob Cache
scan: Vulnerability Scan
db: Registry DB

dev ─► app ─► push
app ─► gateway ─► upload
gateway ─► push ─► layers
push ─► dedupe ─► check
dedupe ─► layer ─► store
push ─► manifest ─► record
dev ─► app ─► pull
app ─► gateway ─► fetch
gateway ─► pull ─► layers
pull ─► layer ─► read
push ─► scan ─► inspect
scan ─► db ─► report
```

## Design

### Design a container image registry

A container registry stores container images as a set of content-addressable
layers plus a manifest that ties them together.

- The push path uploads the image layers, deduplicates them against existing
  content, records a manifest, and triggers a vulnerability scan.
- The pull path resolves the manifest, determines which layers the client
  already has, and serves the missing ones.
- Both paths are governed by a registry database that holds metadata, while the
  layer store keeps the actual blob content.

The diagram shows the split clearly.

- On push, the gateway forwards uploaded layers to the push service, which
  checks layer dedup before storing new blobs and writing the manifest.
- On pull, the gateway hands the fetch request to the pull service, which reads
  the needed layers and serves them, ideally from a blob cache.
- The vulnerability scan inspects pushed images and writes its report to the
  registry database.

The defining property of container storage is content addressability.

- Every layer is identified by a digest of its bytes, so identical layers are
  stored once and shared across all images that reference them.
- This makes dedup natural, but it also means the registry must treat blobs as
  immutable, handle garbage collection carefully, and make the manifest the
  single source of truth for what an image actually is.
- The manifest is small but read constantly, so it is served from a hot cache
  with strong consistency guarantees, while large layer blobs are cached at the
  edge, where immutability makes staleness impossible.
- The API also exposes upload and pull progress so clients can show meaningful
  status instead of sitting on a silent transfer.

### How do you store layers with deduplication?

Layers are immutable blobs keyed by their digest, and deduplication is simply
refusing to store a blob whose digest already exists.

- On push, the client sends the digest of each layer first; the registry checks
  the layer store, and for layers already present it returns an acknowledgment
  without requiring the upload.
- This saves bandwidth for the common case of pushing an image built on top of a
  base image that the registry already holds.

The layer store separates metadata from content.

- A blob metadata table tracks digest, size, upload state, and which manifests
  reference the blob, while the actual bytes live in a blob store built for
  large immutable objects, such as an object store or a distributed filesystem.
- Content-addressable storage enables transparent peer-to-peer and cross-region
  replication, because any replica can verify it holds the correct bytes by
  hashing them.
- Compression and chunking can be applied at the blob layer without changing the
  logical model.

Garbage collection is where dedup gets risky.

- Because blobs are shared, a naive delete can break images that still reference
  a blob.
- The registry maintains reference counts from manifests to blobs and runs
  garbage collection in two phases: mark, which enumerates all reachable blobs
  from live manifests, and sweep, which deletes only unreachable content.
- Deletions are asynchronous and always safe with respect to in-flight pulls, so
  a pull never races a garbage collector into a partial image.
- Dedup also extends to identical image manifests, so pushing a tag that already
  exists is a no-op that updates only the tag reference rather than duplicating
  stored metadata.

### How do you stream image pulls efficiently?

A pull begins with the client asking for a manifest, which lists each layer by
digest, size, and media type. The pull service then compares the digests against
what the client already has, using the client's layer inventory, and serves only
the missing layers. Sending everything is a waste for a client that already has
the base image, so the digest-based handshake is the primary efficiency
mechanism in the whole system.

Layer transfer is streaming and resumable. Each layer is served as a stream with
chunked encoding, so the client can begin extracting while bytes are still
arriving, and a large layer can be resumed from an offset if the connection
drops. The registry exposes the blob via a direct link to the blob store or
cache rather than proxying bytes through application servers, which avoids
bottlenecking a single service. Parallel layer fetches and a configurable
concurrency limit let clients overlap downloads.

Caching sits at the edge of the pull path. A blob cache in front of the layer
store serves the most requested layers without touching the durable store, and
an image manifest cache absorbs repeated metadata requests. Because blobs are
immutable and content-addressed, cache entries never go stale and can be served
with indefinite validity, which is what makes the pull path highly cacheable at
every level from the CDN down to the local registry mirror. The pull service
also supports authenticated requests and token caching, so a cold cluster
starting hundreds of replicas does not hammer the authorization endpoint with
redundant round trips.

### How do you enforce policies and scanning?

Policies gate both push and pull. On push, an admission policy can restrict
which repositories are writable, who may push, whether the image must carry a
signature or a signed attestation, and whether the build is reproducible. On
pull, a policy can block images from unknown sources or images that fail
compliance checks. Policies are evaluated before the manifest is accepted or
served, and policy decisions are recorded so that a rejection is explainable to
the developer.

Vulnerability scanning runs after push and as a background job on stored images.
The scanner extracts the layer contents, matches installed packages against
vulnerability databases, and writes a report that identifies the image, the
affected layers, and the severity of each finding. Scanning must be scalable:
images are deduplicated by layer, so a layer that appears in many images is
scanned once and its results are reused, and scans run in a distributed pool
with a queue so a surge of pushes cannot stall the pipeline. Scan results are
versioned by the vulnerability database, so the report shows not just whether a
fix is needed but against which advisory version, which matters when a newly
published CVE changes the picture.

Enforcement integrates with the deploy pipeline rather than only the registry.
The registry exposes the scan report through its API so CI systems can block
deployment of images that fail a severity threshold, and it can support
signatures with cosign-style attestation so only verified images are allowed in
production clusters. Break-glass policies, where an operator can temporarily
admit a vulnerable image, must themselves be audited, because the policy system
is only as trustworthy as its override path.

### How do you handle concurrent pushes?

Concurrent pushes to the same repository or even the same digest must not
corrupt state. Uploads are tracked as upload sessions: a client begins a
session, uploads the blob in chunks, and commits it, and the registry rejects a
commit whose assembled blob does not hash to the declared digest. Two clients
pushing the same digest converge on the same stored blob, and the second commit
simply finds the blob already present. Concurrent pushes of different digests
proceed independently, so no global lock serializes uploads.

Manifest writes need stronger coordination. Two images can reference the same
layer, and manifests can be pushed concurrently while a pull is in flight, so
the registry uses optimistic concurrency on the manifest: a push includes the
digest of the manifest it expects to be current, and the registry rejects the
write if the repository head has changed. The mapping from tag to manifest is
updated atomically, so readers always observe either the old or the new tag
value, never a torn state.

The dedup check itself must be race-safe. The registry uses a conditional write,
such as a put-if-absent on the blob key, so two clients uploading the same layer
both believe they own it, but only one actually stores the bytes and the other's
write is ignored as a no-op. Upload state is tracked in a store that survives
worker restarts, so a client resuming an interrupted push continues its session
instead of restarting the whole transfer.

## Source

```text
title: Container Registry
node dev: Developer [round, icon=browser]
node app: Docker CLI [icon=browser]
node gateway: API Gateway [icon=server]
node push: Push Service [icon=compute]
node manifest: Manifest Store [cylinder, icon=database]
node layer: Layer Store [cylinder, icon=file]
node dedupe: Layer Dedup [icon=cache]
node pull: Pull Service [icon=compute]
node cache: Blob Cache [icon=cache]
node scan: Vulnerability Scan [icon=shield]
node db: Registry DB [cylinder, icon=database]

edge dev -> app: push
edge app -> gateway: upload
edge gateway -> push: layers
edge push -> dedupe: check
edge dedupe -> layer: store
edge push -> manifest: record
edge dev -> app: pull
edge app -> gateway: fetch
edge gateway -> pull: layers
edge pull -> layer: read
edge push -> scan: inspect
edge scan -> db: report
```

## Q&A

### Q: Design a container image registry

**A:** A container registry stores container images as a set of content-addressable
layers plus a manifest that ties them together.

- The push path uploads the image layers, deduplicates them against existing
  content, records a manifest, and triggers a vulnerability scan.
- The pull path resolves the manifest, determines which layers the client
  already has, and serves the missing ones.
- Both paths are governed by a registry database that holds metadata, while the
  layer store keeps the actual blob content.

The diagram shows the split clearly.

- On push, the gateway forwards uploaded layers to the push service, which
  checks layer dedup before storing new blobs and writing the manifest.
- On pull, the gateway hands the fetch request to the pull service, which reads
  the needed layers and serves them, ideally from a blob cache.
- The vulnerability scan inspects pushed images and writes its report to the
  registry database.

The defining property of container storage is content addressability.

- Every layer is identified by a digest of its bytes, so identical layers are
  stored once and shared across all images that reference them.
- This makes dedup natural, but it also means the registry must treat blobs as
  immutable, handle garbage collection carefully, and make the manifest the
  single source of truth for what an image actually is.
- The manifest is small but read constantly, so it is served from a hot cache
  with strong consistency guarantees, while large layer blobs are cached at the
  edge, where immutability makes staleness impossible.
- The API also exposes upload and pull progress so clients can show meaningful
  status instead of sitting on a silent transfer.

### Q: How do you store layers with deduplication?

**A:** Layers are immutable blobs keyed by their digest, and deduplication is simply
refusing to store a blob whose digest already exists.

- On push, the client sends the digest of each layer first; the registry checks
  the layer store, and for layers already present it returns an acknowledgment
  without requiring the upload.
- This saves bandwidth for the common case of pushing an image built on top of a
  base image that the registry already holds.

The layer store separates metadata from content.

- A blob metadata table tracks digest, size, upload state, and which manifests
  reference the blob, while the actual bytes live in a blob store built for
  large immutable objects, such as an object store or a distributed filesystem.
- Content-addressable storage enables transparent peer-to-peer and cross-region
  replication, because any replica can verify it holds the correct bytes by
  hashing them.
- Compression and chunking can be applied at the blob layer without changing the
  logical model.

Garbage collection is where dedup gets risky.

- Because blobs are shared, a naive delete can break images that still reference
  a blob.
- The registry maintains reference counts from manifests to blobs and runs
  garbage collection in two phases: mark, which enumerates all reachable blobs
  from live manifests, and sweep, which deletes only unreachable content.
- Deletions are asynchronous and always safe with respect to in-flight pulls, so
  a pull never races a garbage collector into a partial image.
- Dedup also extends to identical image manifests, so pushing a tag that already
  exists is a no-op that updates only the tag reference rather than duplicating
  stored metadata.

### Q: How do you stream image pulls efficiently?

**A:** A pull begins with the client asking for a manifest, which lists each layer by
digest, size, and media type. The pull service then compares the digests against
what the client already has, using the client's layer inventory, and serves only
the missing layers. Sending everything is a waste for a client that already has
the base image, so the digest-based handshake is the primary efficiency
mechanism in the whole system.

Layer transfer is streaming and resumable. Each layer is served as a stream with
chunked encoding, so the client can begin extracting while bytes are still
arriving, and a large layer can be resumed from an offset if the connection
drops. The registry exposes the blob via a direct link to the blob store or
cache rather than proxying bytes through application servers, which avoids
bottlenecking a single service. Parallel layer fetches and a configurable
concurrency limit let clients overlap downloads.

Caching sits at the edge of the pull path. A blob cache in front of the layer
store serves the most requested layers without touching the durable store, and
an image manifest cache absorbs repeated metadata requests. Because blobs are
immutable and content-addressed, cache entries never go stale and can be served
with indefinite validity, which is what makes the pull path highly cacheable at
every level from the CDN down to the local registry mirror. The pull service
also supports authenticated requests and token caching, so a cold cluster
starting hundreds of replicas does not hammer the authorization endpoint with
redundant round trips.

### Q: How do you enforce policies and scanning?

**A:** Policies gate both push and pull. On push, an admission policy can restrict
which repositories are writable, who may push, whether the image must carry a
signature or a signed attestation, and whether the build is reproducible. On
pull, a policy can block images from unknown sources or images that fail
compliance checks. Policies are evaluated before the manifest is accepted or
served, and policy decisions are recorded so that a rejection is explainable to
the developer.

Vulnerability scanning runs after push and as a background job on stored images.
The scanner extracts the layer contents, matches installed packages against
vulnerability databases, and writes a report that identifies the image, the
affected layers, and the severity of each finding. Scanning must be scalable:
images are deduplicated by layer, so a layer that appears in many images is
scanned once and its results are reused, and scans run in a distributed pool
with a queue so a surge of pushes cannot stall the pipeline. Scan results are
versioned by the vulnerability database, so the report shows not just whether a
fix is needed but against which advisory version, which matters when a newly
published CVE changes the picture.

Enforcement integrates with the deploy pipeline rather than only the registry.
The registry exposes the scan report through its API so CI systems can block
deployment of images that fail a severity threshold, and it can support
signatures with cosign-style attestation so only verified images are allowed in
production clusters. Break-glass policies, where an operator can temporarily
admit a vulnerable image, must themselves be audited, because the policy system
is only as trustworthy as its override path.

### Q: How do you handle concurrent pushes?

**A:** Concurrent pushes to the same repository or even the same digest must not
corrupt state. Uploads are tracked as upload sessions: a client begins a
session, uploads the blob in chunks, and commits it, and the registry rejects a
commit whose assembled blob does not hash to the declared digest. Two clients
pushing the same digest converge on the same stored blob, and the second commit
simply finds the blob already present. Concurrent pushes of different digests
proceed independently, so no global lock serializes uploads.

Manifest writes need stronger coordination. Two images can reference the same
layer, and manifests can be pushed concurrently while a pull is in flight, so
the registry uses optimistic concurrency on the manifest: a push includes the
digest of the manifest it expects to be current, and the registry rejects the
write if the repository head has changed. The mapping from tag to manifest is
updated atomically, so readers always observe either the old or the new tag
value, never a torn state.

The dedup check itself must be race-safe. The registry uses a conditional write,
such as a put-if-absent on the blob key, so two clients uploading the same layer
both believe they own it, but only one actually stores the bytes and the other's
write is ignored as a no-op. Upload state is tracked in a store that survives
worker restarts, so a client resuming an interrupted push continues its session
instead of restarting the whole transfer.

## Source

```text
title: Container Registry
node dev: Developer [round, icon=browser]
node app: Docker CLI [icon=browser]
node gateway: API Gateway [icon=server]
node push: Push Service [icon=compute]
node manifest: Manifest Store [cylinder, icon=database]
node layer: Layer Store [cylinder, icon=file]
node dedupe: Layer Dedup [icon=cache]
node pull: Pull Service [icon=compute]
node cache: Blob Cache [icon=cache]
node scan: Vulnerability Scan [icon=shield]
node db: Registry DB [cylinder, icon=database]

edge dev -> app: push
edge app -> gateway: upload
edge gateway -> push: layers
edge push -> dedupe: check
edge dedupe -> layer: store
edge push -> manifest: record
edge dev -> app: pull
edge app -> gateway: fetch
edge gateway -> pull: layers
edge pull -> layer: read
edge push -> scan: inspect
edge scan -> db: report
```
