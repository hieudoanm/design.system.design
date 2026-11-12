# npm — Package Registry

Design a package registry

**Difficulty:** Medium

**Tags:** package

## Functional Requirements

- a package registry
- store and serve package versions?
- resolve dependency trees?
- protect against supply chain attacks?
- handle hot downloads?

## Non-Functional Requirements

- A package registry stores distributable packages and serves them to tools like
  npm, pip, and cargo during installs.

- The write path is publish: a developer submits a tarball through the gateway,
  it is scanned for security issues, stored durably, indexed for search, and
  recorded in the registry database.
- The read path is install: a client asks for a dependency tree, the resolver
  computes the exact versions to fetch, and the package store serves the
  tarballs, ideally from a fast cache.

The diagram captures both paths.

- Publish flows from the developer through the gateway to a security scan; only
  an allowed package proceeds to the store and search index.
- Install starts with the client asking the gateway to resolve a tree, the
  resolver walks dependencies against the package store, and downloads are
  served from a cache.
- The registry database is the source of truth for metadata, while the blob
  store holds the actual package contents.

The dominant engineering constraints are read throughput and correctness of
resolution.

- Install tools hammer the registry with metadata requests, often for tiny
  metadata files, so a cache in front of the metadata store absorbs most
  traffic.
- Dependency resolution must be deterministic and reproducible, which means
  version ranges, semver rules, and lockfile compatibility all have to be
  handled exactly, and any ambiguity surfaces as broken builds for millions of
  developers.
- The registry must also stay compatible with ecosystem semantics, such as
  dist-tags and version ranges, because tools depend on behaviors that clients
  have learned to expect over years..
- Each package version is a logical unit with two parts: metadata, such as the
  manifest, description, and dependency ranges, and a tarball of the code.

- The metadata lives in a structured store that supports fast, point lookups by
  package name and version, while the tarball lives in an immutable blob store
  addressed by a content hash.
- Immutability is a correctness requirement: once a version is published it must
  never change, because builds replay the exact bytes that produced a given
  hash.

Serving separates hot from cold data.

- The blob store handles high-volume downloads with CDNs and edge caching, and
  metadata is served through a read-through cache so that the most popular
  requests never touch the database.
- Version lists for a package, which can be long for popular libraries, are
  compacted and cached as single records.
- Deprecated and unpublished versions are recorded as tombstone metadata so the
  client is told the version no longer exists instead of getting a generic
  failure.
- Large tarballs are served as streams with ranged requests and checksums
  verified on the fly, so a client can resume an interrupted download without
  starting over.

Consistency between metadata and blobs matters during publish.

- The registry commits metadata only after the blob is durably stored, so an
  install can never resolve a version whose bytes are missing.
- On the read side, the design tolerates eventual consistency for search indexes
  but keeps the resolution path strongly consistent, because a resolver seeing
  two different answers for the same request is one of the worst failure modes a
  package manager can produce..
- Resolution starts from a root manifest that lists direct dependencies, often
  with semver ranges rather than exact versions.

- The resolver asks the registry for the available versions of each dependency,
  applies the range constraints, and picks versions that are mutually
  compatible, which is the hard part: transitive dependencies can conflict, and
  different package managers choose different strategies, from nesting to flat
  deduplication, for reconciling them.
- The output is a concrete tree that can be written to a lockfile and replayed
  deterministically.

The resolver must be efficient against a real registry.

- For every resolution it issues version-metadata lookups, often in parallel,
  and each lookup can chain further resolvable dependencies, so a naive
  implementation can explode into thousands of requests.
- Caching metadata, batching lookups, and reusing previously resolved subtrees
  keep resolution fast, while a well-known-satisfier approach solves the
  constraint-satisfaction problem in one pass rather than backtracking
  combinatorially.

Correctness wins over cleverness.

- The same input must produce the same tree, and resolution must respect peer
  dependencies, engines, and platform tags without silently violating them.
- Lockfiles make installs reproducible, so the registry supports returning the
  exact versions a lockfile pins.
- When a range is unsatisfiable, the error should name the conflicting
  constraints, because helpful diagnostics prevent a huge share of developer
  frustration and support tickets.
- Resolution also has to cope with unpublished versions: a version that was
  removed must still resolve from a lockfile until a defined cutoff, otherwise
  historical builds break silently.
- The registry therefore keeps tombstones for unpublished versions and returns
  explicit deprecation metadata to clients that request them..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Package Registry
dev: Developer
app: Package App
gateway: API Gateway
publish: Publish Service
package: Package Store
resolve: Resolver
search: Search Index
security: Security Scan
cache: Download Cache
queue: Audit Queue
db: Registry DB

dev ─► app ─► publish
app ─► gateway ─► submit
gateway ─► security ─► scan
security ─► publish ─► allow
publish ─► package ─► store
dev ─► app ─► install
app ─► gateway ─► resolve
gateway ─► resolve ─► tree
resolve ─► package ─► fetch
package ─► cache ─► serve
publish ─► search ─► index
```

## Design

### Design a package registry

A package registry stores distributable packages and serves them to tools like
npm, pip, and cargo during installs.

- The write path is publish: a developer submits a tarball through the gateway,
  it is scanned for security issues, stored durably, indexed for search, and
  recorded in the registry database.
- The read path is install: a client asks for a dependency tree, the resolver
  computes the exact versions to fetch, and the package store serves the
  tarballs, ideally from a fast cache.

The diagram captures both paths.

- Publish flows from the developer through the gateway to a security scan; only
  an allowed package proceeds to the store and search index.
- Install starts with the client asking the gateway to resolve a tree, the
  resolver walks dependencies against the package store, and downloads are
  served from a cache.
- The registry database is the source of truth for metadata, while the blob
  store holds the actual package contents.

The dominant engineering constraints are read throughput and correctness of
resolution.

- Install tools hammer the registry with metadata requests, often for tiny
  metadata files, so a cache in front of the metadata store absorbs most
  traffic.
- Dependency resolution must be deterministic and reproducible, which means
  version ranges, semver rules, and lockfile compatibility all have to be
  handled exactly, and any ambiguity surfaces as broken builds for millions of
  developers.
- The registry must also stay compatible with ecosystem semantics, such as
  dist-tags and version ranges, because tools depend on behaviors that clients
  have learned to expect over years.

### How do you store and serve package versions?

Each package version is a logical unit with two parts: metadata, such as the
manifest, description, and dependency ranges, and a tarball of the code.

- The metadata lives in a structured store that supports fast, point lookups by
  package name and version, while the tarball lives in an immutable blob store
  addressed by a content hash.
- Immutability is a correctness requirement: once a version is published it must
  never change, because builds replay the exact bytes that produced a given
  hash.

Serving separates hot from cold data.

- The blob store handles high-volume downloads with CDNs and edge caching, and
  metadata is served through a read-through cache so that the most popular
  requests never touch the database.
- Version lists for a package, which can be long for popular libraries, are
  compacted and cached as single records.
- Deprecated and unpublished versions are recorded as tombstone metadata so the
  client is told the version no longer exists instead of getting a generic
  failure.
- Large tarballs are served as streams with ranged requests and checksums
  verified on the fly, so a client can resume an interrupted download without
  starting over.

Consistency between metadata and blobs matters during publish.

- The registry commits metadata only after the blob is durably stored, so an
  install can never resolve a version whose bytes are missing.
- On the read side, the design tolerates eventual consistency for search indexes
  but keeps the resolution path strongly consistent, because a resolver seeing
  two different answers for the same request is one of the worst failure modes a
  package manager can produce.

### How do you resolve dependency trees?

Resolution starts from a root manifest that lists direct dependencies, often
with semver ranges rather than exact versions.

- The resolver asks the registry for the available versions of each dependency,
  applies the range constraints, and picks versions that are mutually
  compatible, which is the hard part: transitive dependencies can conflict, and
  different package managers choose different strategies, from nesting to flat
  deduplication, for reconciling them.
- The output is a concrete tree that can be written to a lockfile and replayed
  deterministically.

The resolver must be efficient against a real registry.

- For every resolution it issues version-metadata lookups, often in parallel,
  and each lookup can chain further resolvable dependencies, so a naive
  implementation can explode into thousands of requests.
- Caching metadata, batching lookups, and reusing previously resolved subtrees
  keep resolution fast, while a well-known-satisfier approach solves the
  constraint-satisfaction problem in one pass rather than backtracking
  combinatorially.

Correctness wins over cleverness.

- The same input must produce the same tree, and resolution must respect peer
  dependencies, engines, and platform tags without silently violating them.
- Lockfiles make installs reproducible, so the registry supports returning the
  exact versions a lockfile pins.
- When a range is unsatisfiable, the error should name the conflicting
  constraints, because helpful diagnostics prevent a huge share of developer
  frustration and support tickets.
- Resolution also has to cope with unpublished versions: a version that was
  removed must still resolve from a lockfile until a defined cutoff, otherwise
  historical builds break silently.
- The registry therefore keeps tombstones for unpublished versions and returns
  explicit deprecation metadata to clients that request them.

### How do you protect against supply chain attacks?

The publish path is the trust boundary.

- Every submission passes through a security scan that checks for known malware
  patterns, dangerous install scripts, suspicious network activity, and
  typo-squatted names that mimic popular packages.
- Package names are reserved or reviewed to prevent confusable registrations,
  and strong authentication, such as scoped tokens and two-factor or
  hardware-key enforcement for popular packages, gates who can publish.
- The scan result is recorded and a failed scan blocks publication.

Provenance and integrity protect consumers.

- Each published tarball is content-addressed and signed, and the signature
  chain points back to the publishing identity, so consumers can verify that the
  bytes they download are exactly what was published.
- Organizations can adopt allowlisting and dependency-approval workflows where
  the registry acts as a proxy that only resolves packages on an approved list.
- Reproducible builds and post-publish scanning catch malicious changes that
  slip in through compromised maintainer accounts.

Detection and response close the loop.

- The registry monitors for anomalous publish activity, such as a sudden flood
  of releases from a legitimate account, and can quarantine packages when
  malware is reported after the fact.
- When a malicious package is found, the response is a coordinated takedown plus
  a notification push to affected consumers through the registry metadata
  itself.
- The audit queue records every publish, deprecation, and deletion so a
  compromise can be reconstructed and attributed.
- The response is also transparent: when a package is removed, the community
  should see why, so a takedown never looks arbitrary and consumers can react
  deliberately.

### How do you handle hot downloads?

Hot downloads concentrate on a small number of popular packages that can see
millions of requests per day, so the serving path must avoid hitting a single
database.

- The first line of defense is a CDN and edge cache: tarballs are
  content-addressed and immutable, so they are trivially cacheable with long
  TTLs, and metadata records are cached with short TTLs that honor the
  publish-time invalidation.
- A read-through cache in front of the metadata store absorbs the long tail of
  repeated version queries.

The cache must handle thundering-herd behavior.

- When a package releases a new version, thousands of CI systems may request the
  new metadata simultaneously; if each request misses the cache and hits the
  database, the registry can be overwhelmed.
- The design uses request coalescing, where a single upstream request fills the
  cache and concurrent requests wait for it, plus prefetching of just-published
  metadata so the first wave of requests hits a warm cache.
- Backpressure and queuing protect the database from bursts.

Download accounting itself is a scaling problem.

- Every tarball fetch and metadata request is logged for analytics, and these
  logs alone can dwarf the actual serving load, so tracking is decoupled onto a
  queue and processed asynchronously rather than synchronously in the hot path.
- Capacity planning is driven by real traffic: the registry publishes which
  versions are popular, and the team uses that data to ensure the cache fleet
  and CDN distribution are provisioned for the spike profile of a major release.

## Source

```text
title: Package Registry
node dev: Developer [round, icon=browser]
node app: Package App [icon=browser]
node gateway: API Gateway [icon=server]
node publish: Publish Service [icon=compute]
node package: Package Store [cylinder, icon=database]
node resolve: Resolver [icon=compute]
node search: Search Index [icon=search]
node security: Security Scan [icon=shield]
node cache: Download Cache [icon=cache]
node queue: Audit Queue [icon=queue]
node db: Registry DB [cylinder, icon=database]

edge dev -> app: publish
edge app -> gateway: submit
edge gateway -> security: scan
edge security -> publish: allow
edge publish -> package: store
edge dev -> app: install
edge app -> gateway: resolve
edge gateway -> resolve: tree
edge resolve -> package: fetch
edge package -> cache: serve
edge publish -> search: index
```

## Q&A

### Q: Design a package registry

**A:** A package registry stores distributable packages and serves them to tools like
npm, pip, and cargo during installs.

- The write path is publish: a developer submits a tarball through the gateway,
  it is scanned for security issues, stored durably, indexed for search, and
  recorded in the registry database.
- The read path is install: a client asks for a dependency tree, the resolver
  computes the exact versions to fetch, and the package store serves the
  tarballs, ideally from a fast cache.

The diagram captures both paths.

- Publish flows from the developer through the gateway to a security scan; only
  an allowed package proceeds to the store and search index.
- Install starts with the client asking the gateway to resolve a tree, the
  resolver walks dependencies against the package store, and downloads are
  served from a cache.
- The registry database is the source of truth for metadata, while the blob
  store holds the actual package contents.

The dominant engineering constraints are read throughput and correctness of
resolution.

- Install tools hammer the registry with metadata requests, often for tiny
  metadata files, so a cache in front of the metadata store absorbs most
  traffic.
- Dependency resolution must be deterministic and reproducible, which means
  version ranges, semver rules, and lockfile compatibility all have to be
  handled exactly, and any ambiguity surfaces as broken builds for millions of
  developers.
- The registry must also stay compatible with ecosystem semantics, such as
  dist-tags and version ranges, because tools depend on behaviors that clients
  have learned to expect over years.

### Q: How do you store and serve package versions?

**A:** Each package version is a logical unit with two parts: metadata, such as the
manifest, description, and dependency ranges, and a tarball of the code.

- The metadata lives in a structured store that supports fast, point lookups by
  package name and version, while the tarball lives in an immutable blob store
  addressed by a content hash.
- Immutability is a correctness requirement: once a version is published it must
  never change, because builds replay the exact bytes that produced a given
  hash.

Serving separates hot from cold data.

- The blob store handles high-volume downloads with CDNs and edge caching, and
  metadata is served through a read-through cache so that the most popular
  requests never touch the database.
- Version lists for a package, which can be long for popular libraries, are
  compacted and cached as single records.
- Deprecated and unpublished versions are recorded as tombstone metadata so the
  client is told the version no longer exists instead of getting a generic
  failure.
- Large tarballs are served as streams with ranged requests and checksums
  verified on the fly, so a client can resume an interrupted download without
  starting over.

Consistency between metadata and blobs matters during publish.

- The registry commits metadata only after the blob is durably stored, so an
  install can never resolve a version whose bytes are missing.
- On the read side, the design tolerates eventual consistency for search indexes
  but keeps the resolution path strongly consistent, because a resolver seeing
  two different answers for the same request is one of the worst failure modes a
  package manager can produce.

### Q: How do you resolve dependency trees?

**A:** Resolution starts from a root manifest that lists direct dependencies, often
with semver ranges rather than exact versions.

- The resolver asks the registry for the available versions of each dependency,
  applies the range constraints, and picks versions that are mutually
  compatible, which is the hard part: transitive dependencies can conflict, and
  different package managers choose different strategies, from nesting to flat
  deduplication, for reconciling them.
- The output is a concrete tree that can be written to a lockfile and replayed
  deterministically.

The resolver must be efficient against a real registry.

- For every resolution it issues version-metadata lookups, often in parallel,
  and each lookup can chain further resolvable dependencies, so a naive
  implementation can explode into thousands of requests.
- Caching metadata, batching lookups, and reusing previously resolved subtrees
  keep resolution fast, while a well-known-satisfier approach solves the
  constraint-satisfaction problem in one pass rather than backtracking
  combinatorially.

Correctness wins over cleverness.

- The same input must produce the same tree, and resolution must respect peer
  dependencies, engines, and platform tags without silently violating them.
- Lockfiles make installs reproducible, so the registry supports returning the
  exact versions a lockfile pins.
- When a range is unsatisfiable, the error should name the conflicting
  constraints, because helpful diagnostics prevent a huge share of developer
  frustration and support tickets.
- Resolution also has to cope with unpublished versions: a version that was
  removed must still resolve from a lockfile until a defined cutoff, otherwise
  historical builds break silently.
- The registry therefore keeps tombstones for unpublished versions and returns
  explicit deprecation metadata to clients that request them.

### Q: How do you protect against supply chain attacks?

**A:** The publish path is the trust boundary.

- Every submission passes through a security scan that checks for known malware
  patterns, dangerous install scripts, suspicious network activity, and
  typo-squatted names that mimic popular packages.
- Package names are reserved or reviewed to prevent confusable registrations,
  and strong authentication, such as scoped tokens and two-factor or
  hardware-key enforcement for popular packages, gates who can publish.
- The scan result is recorded and a failed scan blocks publication.

Provenance and integrity protect consumers.

- Each published tarball is content-addressed and signed, and the signature
  chain points back to the publishing identity, so consumers can verify that the
  bytes they download are exactly what was published.
- Organizations can adopt allowlisting and dependency-approval workflows where
  the registry acts as a proxy that only resolves packages on an approved list.
- Reproducible builds and post-publish scanning catch malicious changes that
  slip in through compromised maintainer accounts.

Detection and response close the loop.

- The registry monitors for anomalous publish activity, such as a sudden flood
  of releases from a legitimate account, and can quarantine packages when
  malware is reported after the fact.
- When a malicious package is found, the response is a coordinated takedown plus
  a notification push to affected consumers through the registry metadata
  itself.
- The audit queue records every publish, deprecation, and deletion so a
  compromise can be reconstructed and attributed.
- The response is also transparent: when a package is removed, the community
  should see why, so a takedown never looks arbitrary and consumers can react
  deliberately.

### Q: How do you handle hot downloads?

**A:** Hot downloads concentrate on a small number of popular packages that can see
millions of requests per day, so the serving path must avoid hitting a single
database.

- The first line of defense is a CDN and edge cache: tarballs are
  content-addressed and immutable, so they are trivially cacheable with long
  TTLs, and metadata records are cached with short TTLs that honor the
  publish-time invalidation.
- A read-through cache in front of the metadata store absorbs the long tail of
  repeated version queries.

The cache must handle thundering-herd behavior.

- When a package releases a new version, thousands of CI systems may request the
  new metadata simultaneously; if each request misses the cache and hits the
  database, the registry can be overwhelmed.
- The design uses request coalescing, where a single upstream request fills the
  cache and concurrent requests wait for it, plus prefetching of just-published
  metadata so the first wave of requests hits a warm cache.
- Backpressure and queuing protect the database from bursts.

Download accounting itself is a scaling problem.

- Every tarball fetch and metadata request is logged for analytics, and these
  logs alone can dwarf the actual serving load, so tracking is decoupled onto a
  queue and processed asynchronously rather than synchronously in the hot path.
- Capacity planning is driven by real traffic: the registry publishes which
  versions are popular, and the team uses that data to ensure the cache fleet
  and CDN distribution are provisioned for the spike profile of a major release.

## Source

```text
title: Package Registry
node dev: Developer [round, icon=browser]
node app: Package App [icon=browser]
node gateway: API Gateway [icon=server]
node publish: Publish Service [icon=compute]
node package: Package Store [cylinder, icon=database]
node resolve: Resolver [icon=compute]
node search: Search Index [icon=search]
node security: Security Scan [icon=shield]
node cache: Download Cache [icon=cache]
node queue: Audit Queue [icon=queue]
node db: Registry DB [cylinder, icon=database]

edge dev -> app: publish
edge app -> gateway: submit
edge gateway -> security: scan
edge security -> publish: allow
edge publish -> package: store
edge dev -> app: install
edge app -> gateway: resolve
edge gateway -> resolve: tree
edge resolve -> package: fetch
edge package -> cache: serve
edge publish -> search: index
```
