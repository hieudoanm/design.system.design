# Apple — App Store

Design an app store

**Difficulty:** Hard

**Tags:** ecommerce, mobile

## Functional Requirements

- an app store
- process developer uploads and reviews?
- serve downloads at global scale?
- push app updates?
- handle app discovery and search?

## Non-Functional Requirements

- An app store is a large-scale distribution platform with two very different
  users.

- Developers upload binaries, submit metadata, and wait for review; end users
  browse a catalog, install apps, and receive updates.
- The system must handle an enormous asymmetry: uploads are rare and small
  relative to traffic, but downloads and update checks dominate the load, with
  every device checking for updates repeatedly each day.
- The store is therefore a publisher pipeline on the developer side and a
  content delivery network on the user side.

The pipeline has four stages.

- Upload receives developer submissions and stores the binary.
- Review screens submissions against policy, both automated checks and human
  review.
- Catalog records approved apps and their metadata (name, version, screenshots,
  ratings) in the app catalog.
- Delivery serves binaries and updates to devices through a CDN.
- The source diagram shows this loop end to end: the developer portal hands
  uploads to the review pipeline, approved apps enter the catalog and binary
  store, users browse and search, and the update service checks versions against
  the catalog and fetches binaries through the CDN.

Three properties define the design.

- Security, because an app store is a trusted software supply chain — every
  binary is signed and vetted before a device will execute it.
- Scale, because catalog data is small but delivery traffic is massive and
  global.
- Freshness, because the store must serve hundreds of millions of update checks
  per day yet only deliver bytes when an update actually exists.
- Each subsystem optimizes for one of these without compromising the others..
- Automated checks run
  first.

- The binary is unpacked in an isolated sandbox, scanned for malware, verified
  against the declared permissions, and checked for policy violations in code
  and metadata, including signature validation that the submission is actually
  from the registered developer.
- The automated stage also runs static analysis and, for many submissions,
  execution in a test harness.
- Only submissions that pass the automated gates reach human review, where an
  approver examines the app's behavior and metadata against policy, and can
  approve, reject with reasons, or require changes.

The review pipeline is designed for throughput and transparency.

- Submissions queue in a review pipeline with priority heuristics (a fixed
  version of a popular app gets faster review), and every decision is recorded
  against the submission id so developers see exactly which check failed.
- Approval writes the catalog record: the binary becomes visible to users, the
  metadata becomes searchable, and the catalog version is incremented.
- Rollback is the reverse path — a signed take-down or update removes the app
  from the catalog and invalidates the binary at the CDN, which is the
  supply-chain property that makes the whole model work..
- Downloads are a CDN problem: the payload is large, the volume is enormous, and
  the serving points are distributed globally.

- The binary store holds the master copy of every approved binary, and the CDN
  caches and serves downloads from edge locations close to users.
- The catalog (a compact metadata record per app) is served from regional
  endpoints, while the binary itself travels over CDN paths optimized for
  throughput.
- This split is deliberate: metadata must be snappy and cacheable, binaries need
  maximum bandwidth, and the two workloads have different performance
  characteristics.

The CDN is keyed by binary id, not by a generic URL, so an update to an app
produces a new immutable object and old URLs never change meaning.

- Cache consistency is trivial because binaries are immutable — a new version is
  a new id, and the CDN can hold old versions as long as retention policy
  allows, then expire them.
- To protect the origin under a release spike (a hugely popular app updates on
  the same day), the CDN is pre-warmed for expected releases and the catalog
  throttles download initiation for the hottest items so edges fill proactively
  instead of under stampede.

Scale extends beyond raw bandwidth to device reality.

- Downloads resume after interruption, so the delivery protocol supports
  byte-range requests and the binary is internally segmented to make partial
  delivery efficient.
- The store records a delivery telemetry stream (which version was downloaded by
  which device class, from which region) that feeds capacity planning and also
  powers the update service — if a release shows a spike in installation
  failures, the store can pause its rollout.
- Downloads are additionally throttled and queued per region to smooth load,
  with devices that have already installed the version never re-fetching..
- The update model is pull-with-hints rather than push: devices check in
  periodically, learn the latest available version, and download when their
  installed version is older.

- This is the only design that scales to hundreds of millions of devices — the
  store cannot initiate connections to devices, but it can tell devices exactly
  what changed on their next check-in.
- The update service answers each check with the delta between what the device
  has and what is available, and it returns the update URL plus the binary
  signature the device will verify before installing.

The bulk of update traffic is the check, not the download.

- Each check is a tiny request answered from a regional cache keyed by app id
  and installed version, and most checks return "you are current" with a minimal
  response.
- To avoid a thundering herd when a large release publishes, the store staggers
  visibility: the catalog marks the new version available in phases (percentage
  of devices over time), so the initial update check wave is spread out instead
  of hitting the CDN at once.
- Devices that fail a download retry with backoff, and the store tracks update
  success per version to detect a bad release early.

The update payload is a delta where possible — the store computes the difference
between the installed and new binary and serves only the changed bytes, which
turns a large update into a small one for versions only one or two steps behind.

- Devices far behind receive a full binary instead, since delta chains get
  inefficient.
- Every update is signed and verified on the device, and a signed rollback path
  exists so a device can revert to a known- good version after a bad install.
- The update service also enforces policy — mandatory security updates bypass
  the user's automatic-update setting, while optional updates respect it — which
  is a requirement, not a feature flag..
- Discovery turns the catalog into a queryable surface.

- The search index holds the app catalog's searchable fields — name, developer,
  description, keywords, category — and serves typeahead and full queries from
  the device and web clients.
- Ranking is the interesting part: it blends relevance (text match) with
  popularity signals (install counts, ratings, recent velocity) and quality
  signals (crash rate, review quality), all aggregated over time windows so a
  well-reviewed old app stays discoverable without drowning out a new release.
- Ranking models are trained on behavior — which results users click and install
  — and re-ranked periodically, not per query.

Browse surfaces are precomputed rather than computed live.

- "Top charts" and "featured" lists are ranked offline and cached with a short
  TTL, because serving the same ranked list to a region from cache is far
  cheaper than computing per-request.
- Personalization complicates this: per-user signals (past installs, category
  affinity) blend with the global ranking, so the system computes a small set of
  personalized list variants per user segment and serves them from cache,
  reserving fully dynamic ranking for search queries.
- This keeps discovery latency low at catalog scale.

The serving path is a read-heavy cache hierarchy.

- The search index sits in memory on serving nodes with a replication factor per
  region, the catalog snapshot (the full metadata needed to render an app page)
  is distributed to regional stores, and app pages are cached at the CDN with
  short TTLs so a popular new release does not stampede the catalog database.
- Because the catalog is small relative to traffic, the whole metadata set fits
  in regional memory, which means discovery reads rarely touch a central
  database at all.
- Every query, click, and install is logged into the same analytics stream that
  feeds ranking, closing the loop between what users do and what the store
  surfaces.

## Source

````text
title: App Store
node user: User [round, icon=browser]
node dev: Developer [round, icon=browser]
node app: Developer Portal [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node review: Review Pipeline [icon=shield]
node catalog: App Catalog [cylinder, icon=database]
node binary: Binary Store [cylinder, icon=file]
node search: Search Index [icon=search]
node update: Update Service [icon=compute]
node cdn: Content Delivery [icon=cloud]
node db: Metadata DB [cylinder, icon=database]

edge dev -> app: upload
edge app -> gateway: submit
edge gateway -> review: screen
edge review -> catalog: approve
edge catalog -> binary: store
edge user -> app: browse
edge app -> gateway: search
edge gateway -> search: index
edge user -> app: install
edge app -> update: check
edge update -> cdn: fetch
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: App Store
user: User
dev: Developer
app: Developer Portal
gateway: API Gateway
upload: Upload Service
review: Review Pipeline
catalog: App Catalog
binary: Binary Store
search: Search Index
update: Update Service
cdn: Content Delivery
db: Metadata DB

dev ─► app ─► upload
app ─► gateway ─► submit
gateway ─► review ─► screen
review ─► catalog ─► approve
catalog ─► binary ─► store
user ─► app ─► browse
app ─► gateway ─► search
gateway ─► search ─► index
user ─► app ─► install
app ─► update ─► check
update ─► cdn ─► fetch
````

## Design

### Design an app store

An app store is a large-scale distribution platform with two very different
users.

- Developers upload binaries, submit metadata, and wait for review; end users
  browse a catalog, install apps, and receive updates.
- The system must handle an enormous asymmetry: uploads are rare and small
  relative to traffic, but downloads and update checks dominate the load, with
  every device checking for updates repeatedly each day.
- The store is therefore a publisher pipeline on the developer side and a
  content delivery network on the user side.

The pipeline has four stages.

- Upload receives developer submissions and stores the binary.
- Review screens submissions against policy, both automated checks and human
  review.
- Catalog records approved apps and their metadata (name, version, screenshots,
  ratings) in the app catalog.
- Delivery serves binaries and updates to devices through a CDN.
- The source diagram shows this loop end to end: the developer portal hands
  uploads to the review pipeline, approved apps enter the catalog and binary
  store, users browse and search, and the update service checks versions against
  the catalog and fetches binaries through the CDN.

Three properties define the design.

- Security, because an app store is a trusted software supply chain — every
  binary is signed and vetted before a device will execute it.
- Scale, because catalog data is small but delivery traffic is massive and
  global.
- Freshness, because the store must serve hundreds of millions of update checks
  per day yet only deliver bytes when an update actually exists.
- Each subsystem optimizes for one of these without compromising the others.

### How do you process developer uploads and reviews?

Upload starts as a binary transfer to an upload service.

- The service streams the file to durable object storage and returns a
  submission id.
- Large files are resumed and verified by hash so a dropped connection does not
  force a restart.
- The submission is versioned — a developer can upload v1.2 before v1.1 finishes
  review — and the store associates each binary with the app's identity and the
  developer's account.
- On completion, the upload service computes a fingerprint (hashes plus signed
  metadata) that becomes the binary's immutable identity for the rest of the
  pipeline.

Review is a staged pipeline, not a single human judgment. Automated checks run
first.

- The binary is unpacked in an isolated sandbox, scanned for malware, verified
  against the declared permissions, and checked for policy violations in code
  and metadata, including signature validation that the submission is actually
  from the registered developer.
- The automated stage also runs static analysis and, for many submissions,
  execution in a test harness.
- Only submissions that pass the automated gates reach human review, where an
  approver examines the app's behavior and metadata against policy, and can
  approve, reject with reasons, or require changes.

The review pipeline is designed for throughput and transparency.

- Submissions queue in a review pipeline with priority heuristics (a fixed
  version of a popular app gets faster review), and every decision is recorded
  against the submission id so developers see exactly which check failed.
- Approval writes the catalog record: the binary becomes visible to users, the
  metadata becomes searchable, and the catalog version is incremented.
- Rollback is the reverse path — a signed take-down or update removes the app
  from the catalog and invalidates the binary at the CDN, which is the
  supply-chain property that makes the whole model work.

### How do you serve downloads at global scale?

Downloads are a CDN problem: the payload is large, the volume is enormous, and
the serving points are distributed globally.

- The binary store holds the master copy of every approved binary, and the CDN
  caches and serves downloads from edge locations close to users.
- The catalog (a compact metadata record per app) is served from regional
  endpoints, while the binary itself travels over CDN paths optimized for
  throughput.
- This split is deliberate: metadata must be snappy and cacheable, binaries need
  maximum bandwidth, and the two workloads have different performance
  characteristics.

The CDN is keyed by binary id, not by a generic URL, so an update to an app
produces a new immutable object and old URLs never change meaning.

- Cache consistency is trivial because binaries are immutable — a new version is
  a new id, and the CDN can hold old versions as long as retention policy
  allows, then expire them.
- To protect the origin under a release spike (a hugely popular app updates on
  the same day), the CDN is pre-warmed for expected releases and the catalog
  throttles download initiation for the hottest items so edges fill proactively
  instead of under stampede.

Scale extends beyond raw bandwidth to device reality.

- Downloads resume after interruption, so the delivery protocol supports
  byte-range requests and the binary is internally segmented to make partial
  delivery efficient.
- The store records a delivery telemetry stream (which version was downloaded by
  which device class, from which region) that feeds capacity planning and also
  powers the update service — if a release shows a spike in installation
  failures, the store can pause its rollout.
- Downloads are additionally throttled and queued per region to smooth load,
  with devices that have already installed the version never re-fetching.

### How do you push app updates?

The update model is pull-with-hints rather than push: devices check in
periodically, learn the latest available version, and download when their
installed version is older.

- This is the only design that scales to hundreds of millions of devices — the
  store cannot initiate connections to devices, but it can tell devices exactly
  what changed on their next check-in.
- The update service answers each check with the delta between what the device
  has and what is available, and it returns the update URL plus the binary
  signature the device will verify before installing.

The bulk of update traffic is the check, not the download.

- Each check is a tiny request answered from a regional cache keyed by app id
  and installed version, and most checks return "you are current" with a minimal
  response.
- To avoid a thundering herd when a large release publishes, the store staggers
  visibility: the catalog marks the new version available in phases (percentage
  of devices over time), so the initial update check wave is spread out instead
  of hitting the CDN at once.
- Devices that fail a download retry with backoff, and the store tracks update
  success per version to detect a bad release early.

The update payload is a delta where possible — the store computes the difference
between the installed and new binary and serves only the changed bytes, which
turns a large update into a small one for versions only one or two steps behind.

- Devices far behind receive a full binary instead, since delta chains get
  inefficient.
- Every update is signed and verified on the device, and a signed rollback path
  exists so a device can revert to a known- good version after a bad install.
- The update service also enforces policy — mandatory security updates bypass
  the user's automatic-update setting, while optional updates respect it — which
  is a requirement, not a feature flag.

### How do you handle app discovery and search?

Discovery turns the catalog into a queryable surface.

- The search index holds the app catalog's searchable fields — name, developer,
  description, keywords, category — and serves typeahead and full queries from
  the device and web clients.
- Ranking is the interesting part: it blends relevance (text match) with
  popularity signals (install counts, ratings, recent velocity) and quality
  signals (crash rate, review quality), all aggregated over time windows so a
  well-reviewed old app stays discoverable without drowning out a new release.
- Ranking models are trained on behavior — which results users click and install
  — and re-ranked periodically, not per query.

Browse surfaces are precomputed rather than computed live.

- "Top charts" and "featured" lists are ranked offline and cached with a short
  TTL, because serving the same ranked list to a region from cache is far
  cheaper than computing per-request.
- Personalization complicates this: per-user signals (past installs, category
  affinity) blend with the global ranking, so the system computes a small set of
  personalized list variants per user segment and serves them from cache,
  reserving fully dynamic ranking for search queries.
- This keeps discovery latency low at catalog scale.

The serving path is a read-heavy cache hierarchy.

- The search index sits in memory on serving nodes with a replication factor per
  region, the catalog snapshot (the full metadata needed to render an app page)
  is distributed to regional stores, and app pages are cached at the CDN with
  short TTLs so a popular new release does not stampede the catalog database.
- Because the catalog is small relative to traffic, the whole metadata set fits
  in regional memory, which means discovery reads rarely touch a central
  database at all.
- Every query, click, and install is logged into the same analytics stream that
  feeds ranking, closing the loop between what users do and what the store
  surfaces.

## Source

```text
title: App Store
node user: User [round, icon=browser]
node dev: Developer [round, icon=browser]
node app: Developer Portal [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node review: Review Pipeline [icon=shield]
node catalog: App Catalog [cylinder, icon=database]
node binary: Binary Store [cylinder, icon=file]
node search: Search Index [icon=search]
node update: Update Service [icon=compute]
node cdn: Content Delivery [icon=cloud]
node db: Metadata DB [cylinder, icon=database]

edge dev -> app: upload
edge app -> gateway: submit
edge gateway -> review: screen
edge review -> catalog: approve
edge catalog -> binary: store
edge user -> app: browse
edge app -> gateway: search
edge gateway -> search: index
edge user -> app: install
edge app -> update: check
edge update -> cdn: fetch
```

## Q&A

### Q: Design an app store

**A:** An app store is a large-scale distribution platform with two very different
users.

- Developers upload binaries, submit metadata, and wait for review; end users
  browse a catalog, install apps, and receive updates.
- The system must handle an enormous asymmetry: uploads are rare and small
  relative to traffic, but downloads and update checks dominate the load, with
  every device checking for updates repeatedly each day.
- The store is therefore a publisher pipeline on the developer side and a
  content delivery network on the user side.

The pipeline has four stages.

- Upload receives developer submissions and stores the binary.
- Review screens submissions against policy, both automated checks and human
  review.
- Catalog records approved apps and their metadata (name, version, screenshots,
  ratings) in the app catalog.
- Delivery serves binaries and updates to devices through a CDN.
- The source diagram shows this loop end to end: the developer portal hands
  uploads to the review pipeline, approved apps enter the catalog and binary
  store, users browse and search, and the update service checks versions against
  the catalog and fetches binaries through the CDN.

Three properties define the design.

- Security, because an app store is a trusted software supply chain — every
  binary is signed and vetted before a device will execute it.
- Scale, because catalog data is small but delivery traffic is massive and
  global.
- Freshness, because the store must serve hundreds of millions of update checks
  per day yet only deliver bytes when an update actually exists.
- Each subsystem optimizes for one of these without compromising the others.

### Q: How do you process developer uploads and reviews?

**A:** Upload starts as a binary transfer to an upload service.

- The service streams the file to durable object storage and returns a
  submission id.
- Large files are resumed and verified by hash so a dropped connection does not
  force a restart.
- The submission is versioned — a developer can upload v1.2 before v1.1 finishes
  review — and the store associates each binary with the app's identity and the
  developer's account.
- On completion, the upload service computes a fingerprint (hashes plus signed
  metadata) that becomes the binary's immutable identity for the rest of the
  pipeline.

Review is a staged pipeline, not a single human judgment. Automated checks run
first.

- The binary is unpacked in an isolated sandbox, scanned for malware, verified
  against the declared permissions, and checked for policy violations in code
  and metadata, including signature validation that the submission is actually
  from the registered developer.
- The automated stage also runs static analysis and, for many submissions,
  execution in a test harness.
- Only submissions that pass the automated gates reach human review, where an
  approver examines the app's behavior and metadata against policy, and can
  approve, reject with reasons, or require changes.

The review pipeline is designed for throughput and transparency.

- Submissions queue in a review pipeline with priority heuristics (a fixed
  version of a popular app gets faster review), and every decision is recorded
  against the submission id so developers see exactly which check failed.
- Approval writes the catalog record: the binary becomes visible to users, the
  metadata becomes searchable, and the catalog version is incremented.
- Rollback is the reverse path — a signed take-down or update removes the app
  from the catalog and invalidates the binary at the CDN, which is the
  supply-chain property that makes the whole model work.

### Q: How do you serve downloads at global scale?

**A:** Downloads are a CDN problem: the payload is large, the volume is enormous, and
the serving points are distributed globally.

- The binary store holds the master copy of every approved binary, and the CDN
  caches and serves downloads from edge locations close to users.
- The catalog (a compact metadata record per app) is served from regional
  endpoints, while the binary itself travels over CDN paths optimized for
  throughput.
- This split is deliberate: metadata must be snappy and cacheable, binaries need
  maximum bandwidth, and the two workloads have different performance
  characteristics.

The CDN is keyed by binary id, not by a generic URL, so an update to an app
produces a new immutable object and old URLs never change meaning.

- Cache consistency is trivial because binaries are immutable — a new version is
  a new id, and the CDN can hold old versions as long as retention policy
  allows, then expire them.
- To protect the origin under a release spike (a hugely popular app updates on
  the same day), the CDN is pre-warmed for expected releases and the catalog
  throttles download initiation for the hottest items so edges fill proactively
  instead of under stampede.

Scale extends beyond raw bandwidth to device reality.

- Downloads resume after interruption, so the delivery protocol supports
  byte-range requests and the binary is internally segmented to make partial
  delivery efficient.
- The store records a delivery telemetry stream (which version was downloaded by
  which device class, from which region) that feeds capacity planning and also
  powers the update service — if a release shows a spike in installation
  failures, the store can pause its rollout.
- Downloads are additionally throttled and queued per region to smooth load,
  with devices that have already installed the version never re-fetching.

### Q: How do you push app updates?

**A:** The update model is pull-with-hints rather than push: devices check in
periodically, learn the latest available version, and download when their
installed version is older.

- This is the only design that scales to hundreds of millions of devices — the
  store cannot initiate connections to devices, but it can tell devices exactly
  what changed on their next check-in.
- The update service answers each check with the delta between what the device
  has and what is available, and it returns the update URL plus the binary
  signature the device will verify before installing.

The bulk of update traffic is the check, not the download.

- Each check is a tiny request answered from a regional cache keyed by app id
  and installed version, and most checks return "you are current" with a minimal
  response.
- To avoid a thundering herd when a large release publishes, the store staggers
  visibility: the catalog marks the new version available in phases (percentage
  of devices over time), so the initial update check wave is spread out instead
  of hitting the CDN at once.
- Devices that fail a download retry with backoff, and the store tracks update
  success per version to detect a bad release early.

The update payload is a delta where possible — the store computes the difference
between the installed and new binary and serves only the changed bytes, which
turns a large update into a small one for versions only one or two steps behind.

- Devices far behind receive a full binary instead, since delta chains get
  inefficient.
- Every update is signed and verified on the device, and a signed rollback path
  exists so a device can revert to a known- good version after a bad install.
- The update service also enforces policy — mandatory security updates bypass
  the user's automatic-update setting, while optional updates respect it — which
  is a requirement, not a feature flag.

### Q: How do you handle app discovery and search?

**A:** Discovery turns the catalog into a queryable surface.

- The search index holds the app catalog's searchable fields — name, developer,
  description, keywords, category — and serves typeahead and full queries from
  the device and web clients.
- Ranking is the interesting part: it blends relevance (text match) with
  popularity signals (install counts, ratings, recent velocity) and quality
  signals (crash rate, review quality), all aggregated over time windows so a
  well-reviewed old app stays discoverable without drowning out a new release.
- Ranking models are trained on behavior — which results users click and install
  — and re-ranked periodically, not per query.

Browse surfaces are precomputed rather than computed live.

- "Top charts" and "featured" lists are ranked offline and cached with a short
  TTL, because serving the same ranked list to a region from cache is far
  cheaper than computing per-request.
- Personalization complicates this: per-user signals (past installs, category
  affinity) blend with the global ranking, so the system computes a small set of
  personalized list variants per user segment and serves them from cache,
  reserving fully dynamic ranking for search queries.
- This keeps discovery latency low at catalog scale.

The serving path is a read-heavy cache hierarchy.

- The search index sits in memory on serving nodes with a replication factor per
  region, the catalog snapshot (the full metadata needed to render an app page)
  is distributed to regional stores, and app pages are cached at the CDN with
  short TTLs so a popular new release does not stampede the catalog database.
- Because the catalog is small relative to traffic, the whole metadata set fits
  in regional memory, which means discovery reads rarely touch a central
  database at all.
- Every query, click, and install is logged into the same analytics stream that
  feeds ranking, closing the loop between what users do and what the store
  surfaces.

## Source

```text
title: App Store
node user: User [round, icon=browser]
node dev: Developer [round, icon=browser]
node app: Developer Portal [icon=browser]
node gateway: API Gateway [icon=server]
node upload: Upload Service [icon=worker]
node review: Review Pipeline [icon=shield]
node catalog: App Catalog [cylinder, icon=database]
node binary: Binary Store [cylinder, icon=file]
node search: Search Index [icon=search]
node update: Update Service [icon=compute]
node cdn: Content Delivery [icon=cloud]
node db: Metadata DB [cylinder, icon=database]

edge dev -> app: upload
edge app -> gateway: submit
edge gateway -> review: screen
edge review -> catalog: approve
edge catalog -> binary: store
edge user -> app: browse
edge app -> gateway: search
edge gateway -> search: index
edge user -> app: install
edge app -> update: check
edge update -> cdn: fetch
```
