# Ride-hailing service

Match riders to nearby drivers in real time and dispatch trips at scale.

**Difficulty:** Easy

**Tags:** delivery, matching, mobile, payments

## Functional Requirements

- A rider requests a trip and a driver goes online or offline.
- Match the rider to a nearby available driver, who accepts or declines.
- Track the trip in real time, price it and charge the rider.
- Surge pricing, receipts and ratings.

## Non-Functional Requirements

- Location updates arrive every few seconds and matching completes in under 30 seconds.
- The nearby-driver query answers in under 100 ms.
- The service stays available at 99.99%; a lost location update is harmless.
- Charging is exactly once, even when a driver’s phone retries.

## Estimation

- 10M drivers online at peak, each reporting every 4 seconds, is 2.5M location writes per second.
- 20M trips a day is about 230 matches per second, each scanning tens of candidate drivers.
- Keeping 10M live locations in memory is under 1 GB, so the geo index fits on a few nodes.
- Trips at 1 KB each and 20M per day is 20 GB per day, about 7 TB a year.

## Architecture Diagram

```text
 Rider app ─► API gateway ─► Ride matching ─► Geo index
                                  ▲               │  nearby drivers
                                  └───────────────┘
                                  │
                                  ├─► Dispatch queue ─► Driver app (accept / decline)
                                  ├─► Surge pricing
                                  └─► Trip service ─► Trips DB
                                            └─► Payment service ─► Notifications

 Driver app ─► API gateway ─► Driver location cache (heartbeat)
```

## Design

### Overview

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

## Q&A

### Q: How would you handle 100k drivers coming online at rush hour?

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

### Q: Design Uber surge pricing

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

### Q: How do you run geospatial queries at scale (finding nearby drivers)?

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

### Q: Design a ride payment + receipt flow

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
