# Google Maps — Location Services

Design Google Maps / a location-based service

**Difficulty:** Medium

**Tags:** geo, realtime

## Functional Requirements

- Google Maps / a location-based service
- serve map tiles at global scale?
- build routing and ETA at scale?
- ingest real-time traffic data?
- geocoding and place search

## Non-Functional Requirements

- Treat tiles as immutable, content-addressed objects and push them to a CDN, so
  the origin only handles cache misses and tile-generation pipelines.

- A tile is identified by zoom, x, y, and style; requests for missing or
  zoom-dependent tiles are normalized (round the viewport to whole tiles, drop
  tiles outside the visible bounds) so the cache key space stays bounded.
- Pre-generate tiles offline for static layers and mark generation timestamps;
  clients request only tiles differing from what they already have, and prefetch
  the ring around the viewport so panning is seamless.
- For user-visible freshness, a tile version header lets clients re-validate on
  zoom-in instead of re-downloading everything.

Hot tiles (downtown at 9am) can exceed any single server, so cache them in
multiple tiers: an edge CDN, a regional in-memory cache, and a disk cache at the
origin, with consistent hashing to spread keys.

- Vector tiles reduce bandwidth and allow server-side style changes without
  regeneration, but push rendering cost to the client and make the cache more
  complex (per-style variants).
- Storage scales as zoom grows — each zoom level multiplies tiles by 4 — so most
  tiles are never accessed; serve them from cheap object storage via lazy
  generation, and promote frequently used tiles into the fast cache.
- Monitor cache hit rate per region and per zoom as the primary SLO proxy..
- Routing is a weighted shortest-path problem over the road graph, typically a
  bidirectional Dijkstra or A* for point-to-point queries, with landmark-based
  heuristics (pre-compute distances from a set of landmarks to every node) to
  guide the search toward the target.

- Since travel time depends on conditions, edge weights come from the live
  traffic model, not static distance.
- Run the search on a pre-processed graph held in memory per region, partitioned
  geographically so a query only touches the relevant shard; a two-level
  approach (macro routing on highways plus local expansion on surface streets)
  bounds the search frontier.
- Run-time budget is strict — a route must return in well under a second — so
  the graph is compacted (simplified geometry, collapsed chains of degree-2
  nodes) and the search prunes aggressively.

ETA extends routing: after the path is fixed, compute a per-segment traversal
time using a blend of historical baseline speed and live traffic, and sum with
confidence bounds.

- Because most users drive the same corridors, cache point-to-point ETAs
  (origin, destination, time-of-day, traffic state) so repeated requests skip
  the search entirely; a hot-query cache in front of the routing engine absorbs
  the tail.
- Handle scale by pre-computing route distances between all pairs of significant
  places in a region (the "betweenness" matrix) so common queries become a table
  lookup.
- Recompute ETA for en-route users on a schedule as traffic shifts rather than
  continuously.
- Failure handling: fall back to historical averages when live speeds are stale,
  and return a slower-but-valid route if the live traffic feed is down..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Google Maps
client: Client
api: API Gateway
tiles: Tile Service
geo: Geo Index
geocode: Geocoding
routing: Routing Engine
traffic: Traffic Ingestion
eta: ETA Service
db: Map DB
cache: Tile Cache

client ─► api ─► search
api ─► geocode ─► address
geocode ─► geo ─► places
client ─► tiles ─► load map
tiles ─► cache ─► tiles
api ─► routing ─► directions
routing ─► traffic ─► live speeds
traffic ─► eta ─► estimate
eta ─► client ─► ETA
routing ─► db ─► road graph
api ─► cache ─► hot queries
```

## Design

### Design Google Maps / a location-based service

The system splits into a heavily cached read path and a set of compute-heavy
services.

- The client talks to an API gateway; map rendering loads pre-rendered tiles
  from a Tile Service backed by a CDN and Tile Cache, while search, geocoding,
  routing, and ETA are dedicated services.
- Geocoding converts a free-text address into coordinates via a Geo Index of
  places; routing runs a shortest-path search over a road graph in the Map DB;
  traffic ingestion streams live speed probes into the routing and ETA services
  so directions reflect current conditions.
- Because map interaction is read-dominated (a pan zooms through a dozen tile
  fetches with no writes), caching and prefetching dominate the design, while
  the write path is a background ingest pipeline of road and traffic data.

Core data models:

- The road graph is a directed, weighted graph where edges are road segments and
  weights are travel time.
- Tiles are images (or vector tiles) identified by `(zoom, x, y)`.
- Places are entities with address, coordinates, and categories.
- Traffic is time-series speed and incident data keyed by segment and timestamp.

Trade-offs:

- Pre-rendered raster tiles are simple to serve but can't restyle, vector tiles
  shift rendering to the client but need a renderer; on-device caching cuts
  server load at the cost of staleness.
- The source-of-truth road data updates slowly (monthly feeds), so derived
  artifacts — tiles, routing pre-computations, geocode indexes — are refreshed
  offline and swapped atomically.

### How do you serve map tiles at global scale?

Treat tiles as immutable, content-addressed objects and push them to a CDN, so
the origin only handles cache misses and tile-generation pipelines.

- A tile is identified by zoom, x, y, and style; requests for missing or
  zoom-dependent tiles are normalized (round the viewport to whole tiles, drop
  tiles outside the visible bounds) so the cache key space stays bounded.
- Pre-generate tiles offline for static layers and mark generation timestamps;
  clients request only tiles differing from what they already have, and prefetch
  the ring around the viewport so panning is seamless.
- For user-visible freshness, a tile version header lets clients re-validate on
  zoom-in instead of re-downloading everything.

Hot tiles (downtown at 9am) can exceed any single server, so cache them in
multiple tiers: an edge CDN, a regional in-memory cache, and a disk cache at the
origin, with consistent hashing to spread keys.

- Vector tiles reduce bandwidth and allow server-side style changes without
  regeneration, but push rendering cost to the client and make the cache more
  complex (per-style variants).
- Storage scales as zoom grows — each zoom level multiplies tiles by 4 — so most
  tiles are never accessed; serve them from cheap object storage via lazy
  generation, and promote frequently used tiles into the fast cache.
- Monitor cache hit rate per region and per zoom as the primary SLO proxy.

### How do you build routing and ETA at scale?

Routing is a weighted shortest-path problem over the road graph, typically a
bidirectional Dijkstra or A* for point-to-point queries, with landmark-based
heuristics (pre-compute distances from a set of landmarks to every node) to
guide the search toward the target.

- Since travel time depends on conditions, edge weights come from the live
  traffic model, not static distance.
- Run the search on a pre-processed graph held in memory per region, partitioned
  geographically so a query only touches the relevant shard; a two-level
  approach (macro routing on highways plus local expansion on surface streets)
  bounds the search frontier.
- Run-time budget is strict — a route must return in well under a second — so
  the graph is compacted (simplified geometry, collapsed chains of degree-2
  nodes) and the search prunes aggressively.

ETA extends routing: after the path is fixed, compute a per-segment traversal
time using a blend of historical baseline speed and live traffic, and sum with
confidence bounds.

- Because most users drive the same corridors, cache point-to-point ETAs
  (origin, destination, time-of-day, traffic state) so repeated requests skip
  the search entirely; a hot-query cache in front of the routing engine absorbs
  the tail.
- Handle scale by pre-computing route distances between all pairs of significant
  places in a region (the "betweenness" matrix) so common queries become a table
  lookup.
- Recompute ETA for en-route users on a schedule as traffic shifts rather than
  continuously.
- Failure handling: fall back to historical averages when live speeds are stale,
  and return a slower-but-valid route if the live traffic feed is down.

### How do you ingest real-time traffic data?

Traffic comes from many sources — GPS probes from phones and fleet vehicles,
loop sensors, incident reports, and vendor feeds — all landing on a Traffic
Ingestion service.

- Normalize each sample into `(segment_id, timestamp, speed)`: the segment_id is
  resolved by map-matching each probe to the nearest road edge, usually a Hidden
  Markov Model that snaps noisy GPS points to a plausible path.
- Aggregate samples into buckets (a 2–5 minute window per segment), rejecting
  outliers, and publish the aggregated speeds and incidents to the routing and
  ETA services.
- Data volumes are enormous — billions of probes per day — so the pipeline is
  streaming: Kafka topics partitioned by region, consumers that map-match and
  aggregate, and a compacted state store per segment holding the current speed.

Map-matching is the hard algorithmic piece: ambiguous points near parallel
roads, tunnels with no signal, and stale timestamps must all be handled.

- Use a streaming matcher that carries a short sliding window of candidates and
  a transition cost (distance to road, direction of travel, continuity of the
  preceding path) to pick the most likely edge.
- Downstream, decay older samples so a segment's speed converges to the
  historical baseline when reporting stops.
- Write the aggregated model to a speed overlay (segment → current and
  historical speed) consumed by routing, and persist raw and aggregated data for
  offline training and replay.
- On failure, regional aggregators buffer and replay; a missing region's routes
  simply fall back to historical baselines with a "traffic may be stale"
  indicator.

### Design geocoding and place search

Geocoding maps free text ("1600 Amphitheatre Pkwy") to coordinates, and reverse
geocoding maps coordinates to addresses; place search finds POIs (cafes, gas
stations) by name and category.

- Both rest on a Geo Index: for geocoding, an inverted index over normalized
  address components (street, number, city, ZIP) with a scoring model that
  prefers full street+number matches and penalizes ambiguous tokens; for places,
  an index over name, category, and coordinates.
- Rank candidates with a blend of textual similarity and spatial closeness to
  any hint in the query, and boost prominent places using popularity signals.
- Reverse geocoding needs the opposite: a spatial structure (a geohash or a
  quadtree / S2-cell index) that finds the nearest known address or place to a
  point.

Because queries are bursty and hugely skewed ("Starbucks" alone is millions of
queries a day), cache aggressively: per-prefix, per-query, and per-viewport
caches with short TTLs absorb repeats, while a warm-top list serves the most
popular queries from memory.

- Regional sharding by country keeps the index small per shard and lets queries
  with a location hint hit one shard.
- Normalization and synonym handling (St, Saint, Saint Louis) happen at index
  and query time so both sides meet in the middle.
- Freshness is a background pipeline: new places are geo-coded, validated
  against street data, and pushed to the index within hours, with a quality gate
  that rejects points landing in water or off-road.
- Trade-off: high precision on a noisy, incomplete world means every result
  carries a match score and the UI shows a ranked list with a "did you mean"
  fallback when no candidate clears the confidence bar.

## Source

```text
title: Google Maps
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node tiles: Tile Service [ellipse, icon=cloud]
node geo: Geo Index [icon=search]
node geocode: Geocoding [icon=compute]
node routing: Routing Engine [icon=worker]
node traffic: Traffic Ingestion [icon=sync]
node eta: ETA Service [icon=cache]
node db: Map DB [cylinder, icon=database]
node cache: Tile Cache [cylinder, icon=cache]

edge client -> api: search
edge api -> geocode: address
edge geocode -> geo: places
edge client -> tiles: load map
edge tiles -> cache: tiles
edge api -> routing: directions
edge routing -> traffic: live speeds
edge traffic -> eta: estimate
edge eta -> client: ETA
edge routing -> db: road graph
edge api -> cache: hot queries
```

## Q&A

### Q: Design Google Maps / a location-based service

**A:** The system splits into a heavily cached read path and a set of compute-heavy
services.

- The client talks to an API gateway; map rendering loads pre-rendered tiles
  from a Tile Service backed by a CDN and Tile Cache, while search, geocoding,
  routing, and ETA are dedicated services.
- Geocoding converts a free-text address into coordinates via a Geo Index of
  places; routing runs a shortest-path search over a road graph in the Map DB;
  traffic ingestion streams live speed probes into the routing and ETA services
  so directions reflect current conditions.
- Because map interaction is read-dominated (a pan zooms through a dozen tile
  fetches with no writes), caching and prefetching dominate the design, while
  the write path is a background ingest pipeline of road and traffic data.

Core data models:

- The road graph is a directed, weighted graph where edges are road segments and
  weights are travel time.
- Tiles are images (or vector tiles) identified by `(zoom, x, y)`.
- Places are entities with address, coordinates, and categories.
- Traffic is time-series speed and incident data keyed by segment and timestamp.

Trade-offs:

- Pre-rendered raster tiles are simple to serve but can't restyle, vector tiles
  shift rendering to the client but need a renderer; on-device caching cuts
  server load at the cost of staleness.
- The source-of-truth road data updates slowly (monthly feeds), so derived
  artifacts — tiles, routing pre-computations, geocode indexes — are refreshed
  offline and swapped atomically.

### Q: How do you serve map tiles at global scale?

**A:** Treat tiles as immutable, content-addressed objects and push them to a CDN, so
the origin only handles cache misses and tile-generation pipelines.

- A tile is identified by zoom, x, y, and style; requests for missing or
  zoom-dependent tiles are normalized (round the viewport to whole tiles, drop
  tiles outside the visible bounds) so the cache key space stays bounded.
- Pre-generate tiles offline for static layers and mark generation timestamps;
  clients request only tiles differing from what they already have, and prefetch
  the ring around the viewport so panning is seamless.
- For user-visible freshness, a tile version header lets clients re-validate on
  zoom-in instead of re-downloading everything.

Hot tiles (downtown at 9am) can exceed any single server, so cache them in
multiple tiers: an edge CDN, a regional in-memory cache, and a disk cache at the
origin, with consistent hashing to spread keys.

- Vector tiles reduce bandwidth and allow server-side style changes without
  regeneration, but push rendering cost to the client and make the cache more
  complex (per-style variants).
- Storage scales as zoom grows — each zoom level multiplies tiles by 4 — so most
  tiles are never accessed; serve them from cheap object storage via lazy
  generation, and promote frequently used tiles into the fast cache.
- Monitor cache hit rate per region and per zoom as the primary SLO proxy.

### Q: How do you build routing and ETA at scale?

**A:** Routing is a weighted shortest-path problem over the road graph, typically a
bidirectional Dijkstra or A* for point-to-point queries, with landmark-based
heuristics (pre-compute distances from a set of landmarks to every node) to
guide the search toward the target.

- Since travel time depends on conditions, edge weights come from the live
  traffic model, not static distance.
- Run the search on a pre-processed graph held in memory per region, partitioned
  geographically so a query only touches the relevant shard; a two-level
  approach (macro routing on highways plus local expansion on surface streets)
  bounds the search frontier.
- Run-time budget is strict — a route must return in well under a second — so
  the graph is compacted (simplified geometry, collapsed chains of degree-2
  nodes) and the search prunes aggressively.

ETA extends routing: after the path is fixed, compute a per-segment traversal
time using a blend of historical baseline speed and live traffic, and sum with
confidence bounds.

- Because most users drive the same corridors, cache point-to-point ETAs
  (origin, destination, time-of-day, traffic state) so repeated requests skip
  the search entirely; a hot-query cache in front of the routing engine absorbs
  the tail.
- Handle scale by pre-computing route distances between all pairs of significant
  places in a region (the "betweenness" matrix) so common queries become a table
  lookup.
- Recompute ETA for en-route users on a schedule as traffic shifts rather than
  continuously.
- Failure handling: fall back to historical averages when live speeds are stale,
  and return a slower-but-valid route if the live traffic feed is down.

### Q: How do you ingest real-time traffic data?

**A:** Traffic comes from many sources — GPS probes from phones and fleet vehicles,
loop sensors, incident reports, and vendor feeds — all landing on a Traffic
Ingestion service.

- Normalize each sample into `(segment_id, timestamp, speed)`: the segment_id is
  resolved by map-matching each probe to the nearest road edge, usually a Hidden
  Markov Model that snaps noisy GPS points to a plausible path.
- Aggregate samples into buckets (a 2–5 minute window per segment), rejecting
  outliers, and publish the aggregated speeds and incidents to the routing and
  ETA services.
- Data volumes are enormous — billions of probes per day — so the pipeline is
  streaming: Kafka topics partitioned by region, consumers that map-match and
  aggregate, and a compacted state store per segment holding the current speed.

Map-matching is the hard algorithmic piece: ambiguous points near parallel
roads, tunnels with no signal, and stale timestamps must all be handled.

- Use a streaming matcher that carries a short sliding window of candidates and
  a transition cost (distance to road, direction of travel, continuity of the
  preceding path) to pick the most likely edge.
- Downstream, decay older samples so a segment's speed converges to the
  historical baseline when reporting stops.
- Write the aggregated model to a speed overlay (segment → current and
  historical speed) consumed by routing, and persist raw and aggregated data for
  offline training and replay.
- On failure, regional aggregators buffer and replay; a missing region's routes
  simply fall back to historical baselines with a "traffic may be stale"
  indicator.

### Q: Design geocoding and place search

**A:** Geocoding maps free text ("1600 Amphitheatre Pkwy") to coordinates, and reverse
geocoding maps coordinates to addresses; place search finds POIs (cafes, gas
stations) by name and category.

- Both rest on a Geo Index: for geocoding, an inverted index over normalized
  address components (street, number, city, ZIP) with a scoring model that
  prefers full street+number matches and penalizes ambiguous tokens; for places,
  an index over name, category, and coordinates.
- Rank candidates with a blend of textual similarity and spatial closeness to
  any hint in the query, and boost prominent places using popularity signals.
- Reverse geocoding needs the opposite: a spatial structure (a geohash or a
  quadtree / S2-cell index) that finds the nearest known address or place to a
  point.

Because queries are bursty and hugely skewed ("Starbucks" alone is millions of
queries a day), cache aggressively: per-prefix, per-query, and per-viewport
caches with short TTLs absorb repeats, while a warm-top list serves the most
popular queries from memory.

- Regional sharding by country keeps the index small per shard and lets queries
  with a location hint hit one shard.
- Normalization and synonym handling (St, Saint, Saint Louis) happen at index
  and query time so both sides meet in the middle.
- Freshness is a background pipeline: new places are geo-coded, validated
  against street data, and pushed to the index within hours, with a quality gate
  that rejects points landing in water or off-road.
- Trade-off: high precision on a noisy, incomplete world means every result
  carries a match score and the UI shows a ranked list with a "did you mean"
  fallback when no candidate clears the confidence bar.

## Source

```text
title: Google Maps
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node tiles: Tile Service [ellipse, icon=cloud]
node geo: Geo Index [icon=search]
node geocode: Geocoding [icon=compute]
node routing: Routing Engine [icon=worker]
node traffic: Traffic Ingestion [icon=sync]
node eta: ETA Service [icon=cache]
node db: Map DB [cylinder, icon=database]
node cache: Tile Cache [cylinder, icon=cache]

edge client -> api: search
edge api -> geocode: address
edge geocode -> geo: places
edge client -> tiles: load map
edge tiles -> cache: tiles
edge api -> routing: directions
edge routing -> traffic: live speeds
edge traffic -> eta: estimate
edge eta -> client: ETA
edge routing -> db: road graph
edge api -> cache: hot queries
```
