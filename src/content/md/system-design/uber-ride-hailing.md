# Uber — Ride Hailing

Design Uber / Lyft ride matching and dispatch

**Difficulty:** Easy

**Tags:** delivery, matching, mobile, payments

## Functional Requirements

- Uber / Lyft ride matching and dispatch
- How would you handle 100k drivers coming online at rush hour?
- Uber surge pricing
- run geospatial queries at scale (finding nearby drivers)?
- a ride payment + receipt flow

## Non-Functional Requirements

- A real-time geospatial system connecting riders and drivers.

- Riders send requests through the API gateway; drivers report location
  periodically to a driver-location service backed by an in-memory geo-index
  (grid/geohash or quadtree over cells, served from a low-latency store like
  Redis or a spatial DB).
- The Ride Matching service queries nearby candidates, filters by rating,
  direction, and ETA, and scores them (e.g., by ETA and surge).
- Assignments go through a dispatch queue with a lease/timeout (driver must
  accept within ~15s or the offer is re-queued).
- The Trip service owns state transitions (accepted, en route, arrived,
  completed), while payments and notifications run asynchronously.
- Scale by partitioning the geo-index per zone and sharding by grid cell so
  queries stay bounded and writes are spread..
- This is a write-heavy burst that must not overwhelm the gateway or the geo-index
  write path.

- Have drivers report over persistent channels (WebSocket or gRPC streams) with
  batched location updates every few seconds instead of request/response
  polling.
- Buffer updates through a message queue (Kafka) consumed by a fleet of
  geospatial index workers, so the index becomes eventually consistent and
  writes are decoupled from reads.
- Shard the driver-location index by geographic region with consistent hashing
  so each shard only absorbs its own region's load.
- Apply rate limiting, backpressure, and idempotent keys (driver_id + sequence
  number) to avoid double-processing.
- Pre-scale gateway pods and index workers ahead of the predicted rush window
  based on historical demand curves..
- Surge pricing balances supply and demand.

- Collect per-zone metrics over rolling windows (e.g., 5-minute buckets): open
  ride requests, available drivers, and estimated wait times.
- Compute a demand/supply ratio; when it crosses a threshold, raise the
  multiplier in small steps (1.1x, 1.3x, 1.5x) with hysteresis to avoid
  oscillation.
- Publish the multiplier to riders and drivers with a validity window, and lock
  the price at booking.
- The fare calculator is idempotent: price = base + distance + time, all scaled
  by the surge multiplier, recomputed at trip start for correctness.
- Serve pricing lookups from a cache (Redis) keyed by zone since reads dominate.
- Run the recalculation loop as a stream job over Kafka so zones update
  independently and fail without blocking bookings..
- The requirement is low-latency nearest-N queries against millions of moving
  points.

- Common approaches: geohash cells (query the cell plus neighbors, then filter
  by Haversine distance), a quadtree/R-tree per shard, or spatial indexes such
  as Redis GEO, PostGIS, and the S2/H3 libraries (Uber uses H3).
- Keep driver locations in memory in a cache cluster sharded by region with
  consistent hashing, so each query is bounded to one zone with single-digit
  millisecond latency.
- Writes flow from the gateway through a queue (Kafka) into the index workers,
  keeping the read path fast and the write path decoupled.
- For accuracy, do a radial bounding-box pre-filter followed by exact distance
  sorting; choose cell size to keep candidate counts small.
- Replicate each shard for availability and to absorb read spikes..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Uber Ride Hailing
rider: Rider App
driver: Driver App
api: API Gateway
matching: Ride Matching
dispatch: Dispatch Queue
surge: Surge Pricing
geo: Geo Index
trip: Trip Service
pay: Payment Service
notify: Notifications
db: Trips DB
cache: Driver Locations Cache

rider ─► api ─► request ride
driver ─► api ─► go online
api ─► matching ─► rider + nearby drivers
matching ─► geo ─► find nearby
geo ─► matching ─► candidates
matching ─► dispatch ─► assignment
dispatch ─► driver ─► accept
surge ─► api ─► dynamic price
rider ─► trip ─► start / end
trip ─► pay ─► charge
pay ─► notify ─► receipt
trip ─► db ─► store
api ─► cache ─► read / write
```

## Design

### Design Uber / Lyft ride matching and dispatch

A real-time geospatial system connecting riders and drivers.

- Riders send requests through the API gateway; drivers report location
  periodically to a driver-location service backed by an in-memory geo-index
  (grid/geohash or quadtree over cells, served from a low-latency store like
  Redis or a spatial DB).
- The Ride Matching service queries nearby candidates, filters by rating,
  direction, and ETA, and scores them (e.g., by ETA and surge).
- Assignments go through a dispatch queue with a lease/timeout (driver must
  accept within ~15s or the offer is re-queued).
- The Trip service owns state transitions (accepted, en route, arrived,
  completed), while payments and notifications run asynchronously.
- Scale by partitioning the geo-index per zone and sharding by grid cell so
  queries stay bounded and writes are spread.

### How would you handle 100k drivers coming online at rush hour?

This is a write-heavy burst that must not overwhelm the gateway or the geo-index
write path.

- Have drivers report over persistent channels (WebSocket or gRPC streams) with
  batched location updates every few seconds instead of request/response
  polling.
- Buffer updates through a message queue (Kafka) consumed by a fleet of
  geospatial index workers, so the index becomes eventually consistent and
  writes are decoupled from reads.
- Shard the driver-location index by geographic region with consistent hashing
  so each shard only absorbs its own region's load.
- Apply rate limiting, backpressure, and idempotent keys (driver_id + sequence
  number) to avoid double-processing.
- Pre-scale gateway pods and index workers ahead of the predicted rush window
  based on historical demand curves.

### Design Uber surge pricing

Surge pricing balances supply and demand.

- Collect per-zone metrics over rolling windows (e.g., 5-minute buckets): open
  ride requests, available drivers, and estimated wait times.
- Compute a demand/supply ratio; when it crosses a threshold, raise the
  multiplier in small steps (1.1x, 1.3x, 1.5x) with hysteresis to avoid
  oscillation.
- Publish the multiplier to riders and drivers with a validity window, and lock
  the price at booking.
- The fare calculator is idempotent: price = base + distance + time, all scaled
  by the surge multiplier, recomputed at trip start for correctness.
- Serve pricing lookups from a cache (Redis) keyed by zone since reads dominate.
- Run the recalculation loop as a stream job over Kafka so zones update
  independently and fail without blocking bookings.

### How do you run geospatial queries at scale (finding nearby drivers)?

The requirement is low-latency nearest-N queries against millions of moving
points.

- Common approaches: geohash cells (query the cell plus neighbors, then filter
  by Haversine distance), a quadtree/R-tree per shard, or spatial indexes such
  as Redis GEO, PostGIS, and the S2/H3 libraries (Uber uses H3).
- Keep driver locations in memory in a cache cluster sharded by region with
  consistent hashing, so each query is bounded to one zone with single-digit
  millisecond latency.
- Writes flow from the gateway through a queue (Kafka) into the index workers,
  keeping the read path fast and the write path decoupled.
- For accuracy, do a radial bounding-box pre-filter followed by exact distance
  sorting; choose cell size to keep candidate counts small.
- Replicate each shard for availability and to absorb read spikes.

### Design a ride payment + receipt flow

Payments need correctness, idempotency, and async processing.

- On trip end, the Trip service computes the fare and calls the Payment service
  with a unique idempotency key (trip_id).
- The Payment service debits the rider through an external provider
  (Stripe/Adyen) using idempotent API calls, credits the driver (or batches
  driver payouts), and records the charge in a payments DB, emitting events to a
  ledger topic in Kafka.
- Use double-entry records (rider debit, driver credit) with a reconciliation
  job to catch mismatches.
- Handle failures with retries and exponential backoff, a dead-letter queue for
  terminal errors, and a refund path for disputes.
- After settlement, the receipt service generates an in-app/email receipt with
  the fare breakdown (base, distance, time, surge, taxes, tip).
- At-least-once delivery plus dedupe by the idempotency key keeps the flow
  correct.

## Source

```text
title: Uber Ride Hailing
node rider: Rider App [round, icon=browser]
node driver: Driver App [round, icon=browser]
node api: API Gateway [icon=server]
node matching: Ride Matching [icon=compute]
node dispatch: Dispatch Queue [icon=queue]
node surge: Surge Pricing [icon=cache]
node geo: Geo Index [icon=search]
node trip: Trip Service [icon=worker]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node db: Trips DB [cylinder, icon=database]
node cache: Driver Locations Cache [cylinder, icon=cache]

edge rider -> api: request ride
edge driver -> api: go online
edge api -> matching: rider + nearby drivers
edge matching -> geo: find nearby
edge geo -> matching: candidates
edge matching -> dispatch: assignment
edge dispatch -> driver: accept
edge surge -> api: dynamic price
edge rider -> trip: start / end
edge trip -> pay: charge
edge pay -> notify: receipt
edge trip -> db: store
edge api -> cache: read / write
```

## Q&A

### Q: Design Uber / Lyft ride matching and dispatch

**A:** A real-time geospatial system connecting riders and drivers.

- Riders send requests through the API gateway; drivers report location
  periodically to a driver-location service backed by an in-memory geo-index
  (grid/geohash or quadtree over cells, served from a low-latency store like
  Redis or a spatial DB).
- The Ride Matching service queries nearby candidates, filters by rating,
  direction, and ETA, and scores them (e.g., by ETA and surge).
- Assignments go through a dispatch queue with a lease/timeout (driver must
  accept within ~15s or the offer is re-queued).
- The Trip service owns state transitions (accepted, en route, arrived,
  completed), while payments and notifications run asynchronously.
- Scale by partitioning the geo-index per zone and sharding by grid cell so
  queries stay bounded and writes are spread.

### Q: How would you handle 100k drivers coming online at rush hour?

**A:** This is a write-heavy burst that must not overwhelm the gateway or the geo-index
write path.

- Have drivers report over persistent channels (WebSocket or gRPC streams) with
  batched location updates every few seconds instead of request/response
  polling.
- Buffer updates through a message queue (Kafka) consumed by a fleet of
  geospatial index workers, so the index becomes eventually consistent and
  writes are decoupled from reads.
- Shard the driver-location index by geographic region with consistent hashing
  so each shard only absorbs its own region's load.
- Apply rate limiting, backpressure, and idempotent keys (driver_id + sequence
  number) to avoid double-processing.
- Pre-scale gateway pods and index workers ahead of the predicted rush window
  based on historical demand curves.

### Q: Design Uber surge pricing

**A:** Surge pricing balances supply and demand.

- Collect per-zone metrics over rolling windows (e.g., 5-minute buckets): open
  ride requests, available drivers, and estimated wait times.
- Compute a demand/supply ratio; when it crosses a threshold, raise the
  multiplier in small steps (1.1x, 1.3x, 1.5x) with hysteresis to avoid
  oscillation.
- Publish the multiplier to riders and drivers with a validity window, and lock
  the price at booking.
- The fare calculator is idempotent: price = base + distance + time, all scaled
  by the surge multiplier, recomputed at trip start for correctness.
- Serve pricing lookups from a cache (Redis) keyed by zone since reads dominate.
- Run the recalculation loop as a stream job over Kafka so zones update
  independently and fail without blocking bookings.

### Q: How do you run geospatial queries at scale (finding nearby drivers)?

**A:** The requirement is low-latency nearest-N queries against millions of moving
points.

- Common approaches: geohash cells (query the cell plus neighbors, then filter
  by Haversine distance), a quadtree/R-tree per shard, or spatial indexes such
  as Redis GEO, PostGIS, and the S2/H3 libraries (Uber uses H3).
- Keep driver locations in memory in a cache cluster sharded by region with
  consistent hashing, so each query is bounded to one zone with single-digit
  millisecond latency.
- Writes flow from the gateway through a queue (Kafka) into the index workers,
  keeping the read path fast and the write path decoupled.
- For accuracy, do a radial bounding-box pre-filter followed by exact distance
  sorting; choose cell size to keep candidate counts small.
- Replicate each shard for availability and to absorb read spikes.

### Q: Design a ride payment + receipt flow

**A:** Payments need correctness, idempotency, and async processing.

- On trip end, the Trip service computes the fare and calls the Payment service
  with a unique idempotency key (trip_id).
- The Payment service debits the rider through an external provider
  (Stripe/Adyen) using idempotent API calls, credits the driver (or batches
  driver payouts), and records the charge in a payments DB, emitting events to a
  ledger topic in Kafka.
- Use double-entry records (rider debit, driver credit) with a reconciliation
  job to catch mismatches.
- Handle failures with retries and exponential backoff, a dead-letter queue for
  terminal errors, and a refund path for disputes.
- After settlement, the receipt service generates an in-app/email receipt with
  the fare breakdown (base, distance, time, surge, taxes, tip).
- At-least-once delivery plus dedupe by the idempotency key keeps the flow
  correct.

## Source

```text
title: Uber Ride Hailing
node rider: Rider App [round, icon=browser]
node driver: Driver App [round, icon=browser]
node api: API Gateway [icon=server]
node matching: Ride Matching [icon=compute]
node dispatch: Dispatch Queue [icon=queue]
node surge: Surge Pricing [icon=cache]
node geo: Geo Index [icon=search]
node trip: Trip Service [icon=worker]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node db: Trips DB [cylinder, icon=database]
node cache: Driver Locations Cache [cylinder, icon=cache]

edge rider -> api: request ride
edge driver -> api: go online
edge api -> matching: rider + nearby drivers
edge matching -> geo: find nearby
edge geo -> matching: candidates
edge matching -> dispatch: assignment
edge dispatch -> driver: accept
edge surge -> api: dynamic price
edge rider -> trip: start / end
edge trip -> pay: charge
edge pay -> notify: receipt
edge trip -> db: store
edge api -> cache: read / write
```
