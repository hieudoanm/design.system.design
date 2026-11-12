# Weather Service

Design a weather service

**Difficulty:** Hard

**Tags:** cache, geo, monitoring

## Functional Requirements

- a weather service
- ingest data from multiple forecast providers?
- serve forecasts by location at scale?
- geocode locations and reverse-geocode?
- push severe weather alerts?

## Non-Functional Requirements

- The core pipeline
  has three phases.

- First, the Ingest Worker pulls model output and observation feeds from
  providers such as national weather agencies and commercial forecast vendors.
- Second, the Forecast Service organizes that data by geographic grid point and
  serves a single normalized forecast format to clients.
- Third, the Alert Engine watches the incoming data for conditions that exceed
  severe weather thresholds and dispatches push notifications.
- The Geocoding component maps a free-text location into coordinates, and the
  Weather DB stores the ingested forecast grid plus historical observations.

The design is dominated by a small number of large facts.

- Forecast data is produced on a fixed cadence, usually hourly, and applies to a
  global grid of tens of millions of points, which means ingest is a heavy batch
  workload while reads are tiny per user.
- The product therefore separates the write path, which is throughput bound,
  from the read path, which is latency bound.
- The Forecast Cache sits between them and serves the vast majority of requests
  without touching the database.
- The architecture also treats providers as pluggable sources, because contract
  differences, units, and refresh schedules vary, so an adapter layer normalizes
  each source into one internal schema.

The interesting engineering tension is freshness versus accuracy.

- Weather deteriorates with age, so forecasts are refreshed aggressively, yet
  the underlying model output is only recomputed by the provider at set
  intervals.
- The service must merge partial updates, reconcile conflicting provider
  readings with a blending strategy such as weighted averaging, and keep enough
  history to detect model bias.
- Availability matters as much as any consumer service, since users check
  weather exactly when the weather is worst, so the read path is replicated and
  the alert path has its own redundancy rather than sharing the forecast
  database..
- Serving starts with the Geocoding lookup, which resolves a request to latitude
  and longitude, then snaps that point to the nearest grid cell in the forecast
  model.

- The Forecast Service reads the cell's data and formats it as the public
  response, with current conditions, hourly and daily forecasts, and derived
  values such as feels-like temperature.
- This is deliberately cheap per request, so the bottleneck is the cache, not
  the database.
- The Forecast Cache keys on grid cell plus model run, and the vast majority of
  users hit the same hot cells, so cache hit rates are extremely high and the
  read path stays in microseconds.

The scaling trick is geographic partitioning.

- The global grid is sharded by region, so a lookup for a point in Japan never
  touches servers storing North American cells.
- Each shard owns a contiguous block of cells, which also makes ingest writes
  local and predictable.
- Cell-level granularity has a precision tradeoff: a grid point may be
  kilometers away from the actual location in mountainous or coastal terrain.
- The service addresses this with an interpolation pass, blending neighboring
  cells by distance, and stores per-cell derived statistics that are expensive
  to compute but cheap to reuse, such as sunrise, sunset, and daily high and
  low.

The serving layer handles spikes through the same patterns as any read-heavy
system.

- The cache is replicated and geographically distributed so a weather event in
  one region does not overload a single cache.
- When a forecast grid updates, the cache is invalidated per cell in a
  controlled sweep so the update does not cause a thundering herd of
  recomputations.
- Consistency is relaxed by design: it is acceptable for a user to see a
  forecast from a few minutes ago, so staleness bounds are generous and the
  system can absorb far more load than one that requires strong consistency on
  every read..
- The forward direction is what
  powers the main search box.

- The service normalizes the query, expands common abbreviations, and matches
  against a database of places with their bounding boxes and coordinate
  centroids.
- Matching is scored by population size and type, so a query for "Springfield"
  prefers the largest city over smaller towns, and partial matches are ranked
  using prefix and n-gram indexes.
- Ambiguous queries are resolved by also using the user's current location or
  time zone when available.

The internal representation is a geohash or a hierarchical grid index, which
gives the service fast prefix lookups.

- Any prefix of a geohash corresponds to a rectangular region, so a bounding-box
  search becomes a string prefix scan.
- Geocoding results are cached aggressively, both because location queries
  repeat heavily and because the place database changes slowly.
- The reverse direction starts from the snapped grid cell and walks up the
  hierarchy to find the nearest named locality, district, and country, which the
  forecast response uses to display a location label.

Accuracy and privacy pull in opposite directions.

- High precision is useful for personalized forecasts, but storing exact
  coordinates is sensitive, so the service works with grid-cell granularity and
  truncates coordinates in logs and analytics.
- Rare or newly named places, such as a new subdivision, must be added without a
  full reindex, so the place database supports incremental updates that are
  promoted into the search index on a schedule.
- Every geocode result carries a confidence score, and low-confidence queries
  fall back to a disambiguation step or prompt the user rather than guessing..
- Severe weather alerts are the feature where being fast matters most, so the path
  is separate from normal forecast serving.

- The Alert Engine continuously watches incoming forecast and observation data
  and applies threshold rules, such as wind speed above a limit or a heat index
  above a bound, per grid cell.
- When a threshold trips, the engine determines the affected geographic region
  and the population it covers, then creates an alert event.
- The event goes into the Alert Queue rather than being pushed synchronously,
  because one storm cell can generate millions of individual notifications and
  the delivery pipeline must absorb that burst without losing events.

Delivery is fan-out with deduplication.

- Each device is registered with its location, and the engine maps those
  registrations onto the affected cells to build the audience for a specific
  alert.
- Deduplication prevents a device from receiving the same alert from multiple
  grid cells or multiple model runs, so an alert carries an event identifier and
  devices suppress repeats.
- Updates are handled by alert lifecycle states: a new alert, an upgrade or
  downgrade, and an expiration.
- Expiring an alert is as important as issuing it, because stale warnings
  destroy trust in the product.

Reliability engineering dominates the design.

- A missed severe weather alert is a genuine safety failure, so the alert
  pipeline is built with redundant queues, at-least-once delivery with
  idempotent handling on the device side, and independent infrastructure from
  the forecast read path.
- Throttling is still required, since sending every cell's alert to every nearby
  device would spam users; the engine coalesces alerts by severity and region,
  including a severity downgrade for devices that have already been notified
  recently.
- The final design trades some latency for enormous robustness, which is the
  right trade for this feature.

## Source

````text
title: Weather Service
node user: User [round, icon=browser]
node app: Weather App [icon=browser]
node gateway: API Gateway [icon=server]
node provider: Forecast Providers [icon=cloud]
node ingest: Ingest Worker [icon=worker]
node forecast: Forecast Service [icon=compute]
node geocode: Geocoding [icon=search]
node cache: Forecast Cache [cylinder, icon=cache]
node alert: Alert Engine [icon=message]
node queue: Alert Queue [icon=queue]
node db: Weather DB [cylinder, icon=database]

edge user -> app: get forecast
edge app -> gateway: query
edge gateway -> geocode: locate
edge geocode -> forecast: lookup
edge forecast -> cache: read
edge cache -> forecast: miss
edge provider -> ingest: data
edge ingest -> db: store
edge ingest -> forecast: refresh
edge forecast -> alert: thresholds
edge alert -> queue: dispatch
edge queue -> user: push
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Weather Service
user: User
app: Weather App
gateway: API Gateway
provider: Forecast Providers
ingest: Ingest Worker
forecast: Forecast Service
geocode: Geocoding
cache: Forecast Cache
alert: Alert Engine
queue: Alert Queue
db: Weather DB

user ─► app ─► get forecast
app ─► gateway ─► query
gateway ─► geocode ─► locate
geocode ─► forecast ─► lookup
forecast ─► cache ─► read
cache ─► forecast ─► miss
provider ─► ingest ─► data
ingest ─► db ─► store
ingest ─► forecast ─► refresh
forecast ─► alert ─► thresholds
alert ─► queue ─► dispatch
queue ─► user ─► push
````

## Design

### Design a weather service

A weather service takes raw forecast data from meteorology providers and turns
it into timely, accurate forecasts for arbitrary locations. The core pipeline
has three phases.

- First, the Ingest Worker pulls model output and observation feeds from
  providers such as national weather agencies and commercial forecast vendors.
- Second, the Forecast Service organizes that data by geographic grid point and
  serves a single normalized forecast format to clients.
- Third, the Alert Engine watches the incoming data for conditions that exceed
  severe weather thresholds and dispatches push notifications.
- The Geocoding component maps a free-text location into coordinates, and the
  Weather DB stores the ingested forecast grid plus historical observations.

The design is dominated by a small number of large facts.

- Forecast data is produced on a fixed cadence, usually hourly, and applies to a
  global grid of tens of millions of points, which means ingest is a heavy batch
  workload while reads are tiny per user.
- The product therefore separates the write path, which is throughput bound,
  from the read path, which is latency bound.
- The Forecast Cache sits between them and serves the vast majority of requests
  without touching the database.
- The architecture also treats providers as pluggable sources, because contract
  differences, units, and refresh schedules vary, so an adapter layer normalizes
  each source into one internal schema.

The interesting engineering tension is freshness versus accuracy.

- Weather deteriorates with age, so forecasts are refreshed aggressively, yet
  the underlying model output is only recomputed by the provider at set
  intervals.
- The service must merge partial updates, reconcile conflicting provider
  readings with a blending strategy such as weighted averaging, and keep enough
  history to detect model bias.
- Availability matters as much as any consumer service, since users check
  weather exactly when the weather is worst, so the read path is replicated and
  the alert path has its own redundancy rather than sharing the forecast
  database.

### How do you ingest data from multiple forecast providers?

Ingestion is a scheduled batch pipeline rather than a request-driven one.

- Each provider exposes a feed in its own format, from binary GRIB model output
  to JSON and XML forecasts, so a provider adapter converts everything into a
  common internal schema with standardized units, coordinate system, and
  timestamps.
- The Ingest Worker runs on a cron cadence that matches the provider's publish
  schedule, fetches only the changed slices, and writes new records into the
  Weather DB.
- Fetch failures are retried with backoff, and a stuck provider triggers an
  alert so operators know the data is stale rather than silently serving old
  forecasts.

Reconciliation is the subtle part.

- Providers do not agree perfectly: two models may give different temperatures
  for the same point, and a single provider may revise its own output between
  runs.
- The ingest layer stamps each record with provider, model run time, and
  ingestion time, and the forecast assembly step decides which value wins.
- A common approach is to blend model output with recent observations,
  downweighting sources with historically high error for that region.
- Every input is kept immutable in the database so the blend can be recomputed
  later if a provider's quality changes or a bug is fixed.

The pipeline must also throttle itself.

- Pulling a full global grid every hour is a large transfer, so ingest fetches
  deltas, only areas the provider marks as updated, and applies backpressure by
  scheduling the largest downloads outside peak hours.
- Payloads are compressed and checksummed to catch corruption in transit.
- Because correctness compounds, a bad batch can poison forecasts for hours, so
  an ingestion integrity check compares the incoming data against plausible
  bounds and rejects outliers before they reach the serving path.

### How do you serve forecasts by location at scale?

Serving starts with the Geocoding lookup, which resolves a request to latitude
and longitude, then snaps that point to the nearest grid cell in the forecast
model.

- The Forecast Service reads the cell's data and formats it as the public
  response, with current conditions, hourly and daily forecasts, and derived
  values such as feels-like temperature.
- This is deliberately cheap per request, so the bottleneck is the cache, not
  the database.
- The Forecast Cache keys on grid cell plus model run, and the vast majority of
  users hit the same hot cells, so cache hit rates are extremely high and the
  read path stays in microseconds.

The scaling trick is geographic partitioning.

- The global grid is sharded by region, so a lookup for a point in Japan never
  touches servers storing North American cells.
- Each shard owns a contiguous block of cells, which also makes ingest writes
  local and predictable.
- Cell-level granularity has a precision tradeoff: a grid point may be
  kilometers away from the actual location in mountainous or coastal terrain.
- The service addresses this with an interpolation pass, blending neighboring
  cells by distance, and stores per-cell derived statistics that are expensive
  to compute but cheap to reuse, such as sunrise, sunset, and daily high and
  low.

The serving layer handles spikes through the same patterns as any read-heavy
system.

- The cache is replicated and geographically distributed so a weather event in
  one region does not overload a single cache.
- When a forecast grid updates, the cache is invalidated per cell in a
  controlled sweep so the update does not cause a thundering herd of
  recomputations.
- Consistency is relaxed by design: it is acceptable for a user to see a
  forecast from a few minutes ago, so staleness bounds are generous and the
  system can absorb far more load than one that requires strong consistency on
  every read.

### How do you geocode locations and reverse-geocode?

Geocoding turns free-form input into coordinates, and reverse geocoding turns
coordinates back into a human-readable place name. The forward direction is what
powers the main search box.

- The service normalizes the query, expands common abbreviations, and matches
  against a database of places with their bounding boxes and coordinate
  centroids.
- Matching is scored by population size and type, so a query for "Springfield"
  prefers the largest city over smaller towns, and partial matches are ranked
  using prefix and n-gram indexes.
- Ambiguous queries are resolved by also using the user's current location or
  time zone when available.

The internal representation is a geohash or a hierarchical grid index, which
gives the service fast prefix lookups.

- Any prefix of a geohash corresponds to a rectangular region, so a bounding-box
  search becomes a string prefix scan.
- Geocoding results are cached aggressively, both because location queries
  repeat heavily and because the place database changes slowly.
- The reverse direction starts from the snapped grid cell and walks up the
  hierarchy to find the nearest named locality, district, and country, which the
  forecast response uses to display a location label.

Accuracy and privacy pull in opposite directions.

- High precision is useful for personalized forecasts, but storing exact
  coordinates is sensitive, so the service works with grid-cell granularity and
  truncates coordinates in logs and analytics.
- Rare or newly named places, such as a new subdivision, must be added without a
  full reindex, so the place database supports incremental updates that are
  promoted into the search index on a schedule.
- Every geocode result carries a confidence score, and low-confidence queries
  fall back to a disambiguation step or prompt the user rather than guessing.

### How do you push severe weather alerts?

Severe weather alerts are the feature where being fast matters most, so the path
is separate from normal forecast serving.

- The Alert Engine continuously watches incoming forecast and observation data
  and applies threshold rules, such as wind speed above a limit or a heat index
  above a bound, per grid cell.
- When a threshold trips, the engine determines the affected geographic region
  and the population it covers, then creates an alert event.
- The event goes into the Alert Queue rather than being pushed synchronously,
  because one storm cell can generate millions of individual notifications and
  the delivery pipeline must absorb that burst without losing events.

Delivery is fan-out with deduplication.

- Each device is registered with its location, and the engine maps those
  registrations onto the affected cells to build the audience for a specific
  alert.
- Deduplication prevents a device from receiving the same alert from multiple
  grid cells or multiple model runs, so an alert carries an event identifier and
  devices suppress repeats.
- Updates are handled by alert lifecycle states: a new alert, an upgrade or
  downgrade, and an expiration.
- Expiring an alert is as important as issuing it, because stale warnings
  destroy trust in the product.

Reliability engineering dominates the design.

- A missed severe weather alert is a genuine safety failure, so the alert
  pipeline is built with redundant queues, at-least-once delivery with
  idempotent handling on the device side, and independent infrastructure from
  the forecast read path.
- Throttling is still required, since sending every cell's alert to every nearby
  device would spam users; the engine coalesces alerts by severity and region,
  including a severity downgrade for devices that have already been notified
  recently.
- The final design trades some latency for enormous robustness, which is the
  right trade for this feature.

## Source

```text
title: Weather Service
node user: User [round, icon=browser]
node app: Weather App [icon=browser]
node gateway: API Gateway [icon=server]
node provider: Forecast Providers [icon=cloud]
node ingest: Ingest Worker [icon=worker]
node forecast: Forecast Service [icon=compute]
node geocode: Geocoding [icon=search]
node cache: Forecast Cache [cylinder, icon=cache]
node alert: Alert Engine [icon=message]
node queue: Alert Queue [icon=queue]
node db: Weather DB [cylinder, icon=database]

edge user -> app: get forecast
edge app -> gateway: query
edge gateway -> geocode: locate
edge geocode -> forecast: lookup
edge forecast -> cache: read
edge cache -> forecast: miss
edge provider -> ingest: data
edge ingest -> db: store
edge ingest -> forecast: refresh
edge forecast -> alert: thresholds
edge alert -> queue: dispatch
edge queue -> user: push
```

## Q&A

### Q: Design a weather service

**A:** A weather service takes raw forecast data from meteorology providers and turns
it into timely, accurate forecasts for arbitrary locations. The core pipeline
has three phases.

- First, the Ingest Worker pulls model output and observation feeds from
  providers such as national weather agencies and commercial forecast vendors.
- Second, the Forecast Service organizes that data by geographic grid point and
  serves a single normalized forecast format to clients.
- Third, the Alert Engine watches the incoming data for conditions that exceed
  severe weather thresholds and dispatches push notifications.
- The Geocoding component maps a free-text location into coordinates, and the
  Weather DB stores the ingested forecast grid plus historical observations.

The design is dominated by a small number of large facts.

- Forecast data is produced on a fixed cadence, usually hourly, and applies to a
  global grid of tens of millions of points, which means ingest is a heavy batch
  workload while reads are tiny per user.
- The product therefore separates the write path, which is throughput bound,
  from the read path, which is latency bound.
- The Forecast Cache sits between them and serves the vast majority of requests
  without touching the database.
- The architecture also treats providers as pluggable sources, because contract
  differences, units, and refresh schedules vary, so an adapter layer normalizes
  each source into one internal schema.

The interesting engineering tension is freshness versus accuracy.

- Weather deteriorates with age, so forecasts are refreshed aggressively, yet
  the underlying model output is only recomputed by the provider at set
  intervals.
- The service must merge partial updates, reconcile conflicting provider
  readings with a blending strategy such as weighted averaging, and keep enough
  history to detect model bias.
- Availability matters as much as any consumer service, since users check
  weather exactly when the weather is worst, so the read path is replicated and
  the alert path has its own redundancy rather than sharing the forecast
  database.

### Q: How do you ingest data from multiple forecast providers?

**A:** Ingestion is a scheduled batch pipeline rather than a request-driven one.

- Each provider exposes a feed in its own format, from binary GRIB model output
  to JSON and XML forecasts, so a provider adapter converts everything into a
  common internal schema with standardized units, coordinate system, and
  timestamps.
- The Ingest Worker runs on a cron cadence that matches the provider's publish
  schedule, fetches only the changed slices, and writes new records into the
  Weather DB.
- Fetch failures are retried with backoff, and a stuck provider triggers an
  alert so operators know the data is stale rather than silently serving old
  forecasts.

Reconciliation is the subtle part.

- Providers do not agree perfectly: two models may give different temperatures
  for the same point, and a single provider may revise its own output between
  runs.
- The ingest layer stamps each record with provider, model run time, and
  ingestion time, and the forecast assembly step decides which value wins.
- A common approach is to blend model output with recent observations,
  downweighting sources with historically high error for that region.
- Every input is kept immutable in the database so the blend can be recomputed
  later if a provider's quality changes or a bug is fixed.

The pipeline must also throttle itself.

- Pulling a full global grid every hour is a large transfer, so ingest fetches
  deltas, only areas the provider marks as updated, and applies backpressure by
  scheduling the largest downloads outside peak hours.
- Payloads are compressed and checksummed to catch corruption in transit.
- Because correctness compounds, a bad batch can poison forecasts for hours, so
  an ingestion integrity check compares the incoming data against plausible
  bounds and rejects outliers before they reach the serving path.

### Q: How do you serve forecasts by location at scale?

**A:** Serving starts with the Geocoding lookup, which resolves a request to latitude
and longitude, then snaps that point to the nearest grid cell in the forecast
model.

- The Forecast Service reads the cell's data and formats it as the public
  response, with current conditions, hourly and daily forecasts, and derived
  values such as feels-like temperature.
- This is deliberately cheap per request, so the bottleneck is the cache, not
  the database.
- The Forecast Cache keys on grid cell plus model run, and the vast majority of
  users hit the same hot cells, so cache hit rates are extremely high and the
  read path stays in microseconds.

The scaling trick is geographic partitioning.

- The global grid is sharded by region, so a lookup for a point in Japan never
  touches servers storing North American cells.
- Each shard owns a contiguous block of cells, which also makes ingest writes
  local and predictable.
- Cell-level granularity has a precision tradeoff: a grid point may be
  kilometers away from the actual location in mountainous or coastal terrain.
- The service addresses this with an interpolation pass, blending neighboring
  cells by distance, and stores per-cell derived statistics that are expensive
  to compute but cheap to reuse, such as sunrise, sunset, and daily high and
  low.

The serving layer handles spikes through the same patterns as any read-heavy
system.

- The cache is replicated and geographically distributed so a weather event in
  one region does not overload a single cache.
- When a forecast grid updates, the cache is invalidated per cell in a
  controlled sweep so the update does not cause a thundering herd of
  recomputations.
- Consistency is relaxed by design: it is acceptable for a user to see a
  forecast from a few minutes ago, so staleness bounds are generous and the
  system can absorb far more load than one that requires strong consistency on
  every read.

### Q: How do you geocode locations and reverse-geocode?

**A:** Geocoding turns free-form input into coordinates, and reverse geocoding turns
coordinates back into a human-readable place name. The forward direction is what
powers the main search box.

- The service normalizes the query, expands common abbreviations, and matches
  against a database of places with their bounding boxes and coordinate
  centroids.
- Matching is scored by population size and type, so a query for "Springfield"
  prefers the largest city over smaller towns, and partial matches are ranked
  using prefix and n-gram indexes.
- Ambiguous queries are resolved by also using the user's current location or
  time zone when available.

The internal representation is a geohash or a hierarchical grid index, which
gives the service fast prefix lookups.

- Any prefix of a geohash corresponds to a rectangular region, so a bounding-box
  search becomes a string prefix scan.
- Geocoding results are cached aggressively, both because location queries
  repeat heavily and because the place database changes slowly.
- The reverse direction starts from the snapped grid cell and walks up the
  hierarchy to find the nearest named locality, district, and country, which the
  forecast response uses to display a location label.

Accuracy and privacy pull in opposite directions.

- High precision is useful for personalized forecasts, but storing exact
  coordinates is sensitive, so the service works with grid-cell granularity and
  truncates coordinates in logs and analytics.
- Rare or newly named places, such as a new subdivision, must be added without a
  full reindex, so the place database supports incremental updates that are
  promoted into the search index on a schedule.
- Every geocode result carries a confidence score, and low-confidence queries
  fall back to a disambiguation step or prompt the user rather than guessing.

### Q: How do you push severe weather alerts?

**A:** Severe weather alerts are the feature where being fast matters most, so the path
is separate from normal forecast serving.

- The Alert Engine continuously watches incoming forecast and observation data
  and applies threshold rules, such as wind speed above a limit or a heat index
  above a bound, per grid cell.
- When a threshold trips, the engine determines the affected geographic region
  and the population it covers, then creates an alert event.
- The event goes into the Alert Queue rather than being pushed synchronously,
  because one storm cell can generate millions of individual notifications and
  the delivery pipeline must absorb that burst without losing events.

Delivery is fan-out with deduplication.

- Each device is registered with its location, and the engine maps those
  registrations onto the affected cells to build the audience for a specific
  alert.
- Deduplication prevents a device from receiving the same alert from multiple
  grid cells or multiple model runs, so an alert carries an event identifier and
  devices suppress repeats.
- Updates are handled by alert lifecycle states: a new alert, an upgrade or
  downgrade, and an expiration.
- Expiring an alert is as important as issuing it, because stale warnings
  destroy trust in the product.

Reliability engineering dominates the design.

- A missed severe weather alert is a genuine safety failure, so the alert
  pipeline is built with redundant queues, at-least-once delivery with
  idempotent handling on the device side, and independent infrastructure from
  the forecast read path.
- Throttling is still required, since sending every cell's alert to every nearby
  device would spam users; the engine coalesces alerts by severity and region,
  including a severity downgrade for devices that have already been notified
  recently.
- The final design trades some latency for enormous robustness, which is the
  right trade for this feature.

## Source

```text
title: Weather Service
node user: User [round, icon=browser]
node app: Weather App [icon=browser]
node gateway: API Gateway [icon=server]
node provider: Forecast Providers [icon=cloud]
node ingest: Ingest Worker [icon=worker]
node forecast: Forecast Service [icon=compute]
node geocode: Geocoding [icon=search]
node cache: Forecast Cache [cylinder, icon=cache]
node alert: Alert Engine [icon=message]
node queue: Alert Queue [icon=queue]
node db: Weather DB [cylinder, icon=database]

edge user -> app: get forecast
edge app -> gateway: query
edge gateway -> geocode: locate
edge geocode -> forecast: lookup
edge forecast -> cache: read
edge cache -> forecast: miss
edge provider -> ingest: data
edge ingest -> db: store
edge ingest -> forecast: refresh
edge forecast -> alert: thresholds
edge alert -> queue: dispatch
edge queue -> user: push
```
