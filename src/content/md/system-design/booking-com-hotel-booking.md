# Booking.com — Hotel Booking

Design a hotel booking platform

**Difficulty:** Hard

**Tags:** booking, payments, search

## Functional Requirements

- a hotel booking platform
- prevent double-booking and overbooking?
- design search and filtering for millions of rooms?
- handle payments, refunds, and currency conversion?
- handle cancellations and pricing changes?

## Non-Functional Requirements

- A hotel booking platform is best decomposed into small, horizontally scalable
  services behind an API gateway, each owning its data.

- The search service keeps a denormalized index of hotels, room types,
  amenities, and prices so guests can filter and rank results quickly.
- The availability engine owns inventory and tracks supply by property, room
  type, and date range.
- The booking service orchestrates reservation state machines, and the payment
  service owns charging, refunds, and currency conversion.
- A relational Bookings DB stores reservations, a search cache backs hot read
  paths, and a room inventory store guards supply.

The primary flow starts when a guest searches through the app.

- The gateway routes the query to search, which reads its cache, then asks the
  availability engine to confirm open dates, and returns ranked results.
- When the guest proceeds to book, the booking service locks inventory for the
  requested nights, triggers a charge through payment, persists the reservation,
  and publishes a confirmation event that the notification service consumes.
- Cancellations, no-shows, and price changes flow through the same state
  machine, releasing locks and issuing refunds.
- Booking is modeled as an idempotent workflow with explicit states (pending,
  confirmed, cancelled, completed), so retries and partial failures never create
  duplicate reservations.

I would connect services with an event bus.

- Availability changes, confirmations, and cancellations propagate
  asynchronously to search, cache, and notification workers.
- This keeps the synchronous path short while enabling price-drop alerts and
  inventory reconciliation.
- The main tradeoff is eventual consistency: search may briefly show stale
  availability, which is acceptable because the availability engine revalidates
  the instant a guest commits to booking.
- Sharded databases and read replicas absorb read-heavy search traffic, while a
  short-lived inventory lock prevents two guests from claiming the same night..
- Double-booking happens when two reservations claim the same room-night, while
  overbooking is a deliberate policy of selling more inventory than exists to
  hedge against cancellations and no-shows.

- I would prevent double-booking at the source with a pessimistic lock: before
  confirming, the availability engine atomically decrements capacity for every
  requested night in a single transaction against the inventory store.
- Because the decrement is conditional on remaining capacity being positive, the
  second concurrent request for the same night fails instead of silently
  succeeding.

For low-latency booking flows:

- Use a conditional UPDATE on the inventory row (update capacity where capacity
  is greater than zero) or a Redis-based lock on the room-night key, and fall
  back to the database for final authority.
- The lock is short-lived and released after the reservation is committed, so
  hot dates do not serialize the whole system.
- Idempotency keys on booking requests prevent a client retry from decrementing
  inventory twice; the engine returns a booking id and dedupes repeats by key
  before touching inventory.
- Overbooking is then a tuned oversell factor applied to specific room types and
  dates, kept below a threshold derived from historical no-show rates.

Because cancellations are common, an overbooking policy must be coupled to an
overflow strategy.

- When oversold inventory is realized, the platform procures a comparable
  alternative room or comps the guest.
- I would monitor the realized no-show rate against the model continuously and
  adjust the oversell factor, because overbooking that exceeds real no-shows
  produces angry guests and compensation costs.
- The ledger of locks, releases, and overflow events also feeds analytics that
  fine-tune the policy over time.
- Credit-card-backed reservations reduce no-shows at premium tables and give the
  platform a recovery mechanism, layered on top of the base policy..
- Search over millions of rooms is a read-heavy pattern that suits an inverted
  index over denormalized documents.

- Each hotel document stores city, neighborhood, star rating, price band,
  amenity flags, and room inventory for the next rolling horizon.
- I would index these in Elasticsearch for free-text and geo queries, while the
  availability engine provides a compact summary of open date ranges used for
  coarse pre-filtering.
- Typical filters (city, dates, guests, star, price) are structured fields, so
  most searches are filtered term lookups over a few hundred thousand hotels
  plus a room-type expansion.

To keep latency bounded, I would add a caching tier between the gateway and the
index.

- Popular city-plus-date combos are cached with a short TTL, so a spike like a
  holiday weekend hits the cache rather than the cluster.
- Query results include facets computed at index time, letting the UI offer
  filters for price, rating, and amenities without recomputing counts per
  request.
- For personalized results, a user context service injects signals like past
  city, price preference, and loyalty tier into the query.
- Because inventory changes constantly, the cache TTL and the availability
  re-check reconcile freshness with cost.

At this scale I would shard the index by region or city cluster.

- A typical query touches a small number of shards, and I would run read
  replicas sized for peak browsing load.
- Ranking combines editorial signals like relevance, rating, price, and partner
  bid, computed by a lightweight model over the cached facets.
- Compact binary summaries of open slots are embedded in the cached facets so
  search can pre-filter bookable hotels before hitting the index.
- Scaling out is mostly adding replicas and cache nodes; the hot-path query
  shape stays simple, which keeps p99 latency in the tens of milliseconds.
- The tradeoff is between index freshness and query cost; daily reindex plus
  near-real-time updates keeps search accurate enough for a booking flow..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Hotel Booking
guest: Guest
app: Booking App
gateway: API Gateway
search: Search Service
avail: Availability Engine
booking: Booking Service
payment: Payment Service
inventory: Room Inventory
cache: Search Cache
notify: Notifications
db: Bookings DB

guest ─► app ─► search
app ─► gateway ─► query
gateway ─► search ─► hotels
search ─► avail ─► check dates
avail ─► inventory ─► lock room
gateway ─► booking ─► book
booking ─► payment ─► charge
booking ─► db ─► store
payment ─► notify ─► confirm
gateway ─► cache ─► cache results
search ─► cache ─► read
booking ─► avail ─► release
```

## Design

### Design a hotel booking platform

A hotel booking platform is best decomposed into small, horizontally scalable
services behind an API gateway, each owning its data.

- The search service keeps a denormalized index of hotels, room types,
  amenities, and prices so guests can filter and rank results quickly.
- The availability engine owns inventory and tracks supply by property, room
  type, and date range.
- The booking service orchestrates reservation state machines, and the payment
  service owns charging, refunds, and currency conversion.
- A relational Bookings DB stores reservations, a search cache backs hot read
  paths, and a room inventory store guards supply.

The primary flow starts when a guest searches through the app.

- The gateway routes the query to search, which reads its cache, then asks the
  availability engine to confirm open dates, and returns ranked results.
- When the guest proceeds to book, the booking service locks inventory for the
  requested nights, triggers a charge through payment, persists the reservation,
  and publishes a confirmation event that the notification service consumes.
- Cancellations, no-shows, and price changes flow through the same state
  machine, releasing locks and issuing refunds.
- Booking is modeled as an idempotent workflow with explicit states (pending,
  confirmed, cancelled, completed), so retries and partial failures never create
  duplicate reservations.

I would connect services with an event bus.

- Availability changes, confirmations, and cancellations propagate
  asynchronously to search, cache, and notification workers.
- This keeps the synchronous path short while enabling price-drop alerts and
  inventory reconciliation.
- The main tradeoff is eventual consistency: search may briefly show stale
  availability, which is acceptable because the availability engine revalidates
  the instant a guest commits to booking.
- Sharded databases and read replicas absorb read-heavy search traffic, while a
  short-lived inventory lock prevents two guests from claiming the same night.

### How do you prevent double-booking and overbooking?

Double-booking happens when two reservations claim the same room-night, while
overbooking is a deliberate policy of selling more inventory than exists to
hedge against cancellations and no-shows.

- I would prevent double-booking at the source with a pessimistic lock: before
  confirming, the availability engine atomically decrements capacity for every
  requested night in a single transaction against the inventory store.
- Because the decrement is conditional on remaining capacity being positive, the
  second concurrent request for the same night fails instead of silently
  succeeding.

For low-latency booking flows:

- Use a conditional UPDATE on the inventory row (update capacity where capacity
  is greater than zero) or a Redis-based lock on the room-night key, and fall
  back to the database for final authority.
- The lock is short-lived and released after the reservation is committed, so
  hot dates do not serialize the whole system.
- Idempotency keys on booking requests prevent a client retry from decrementing
  inventory twice; the engine returns a booking id and dedupes repeats by key
  before touching inventory.
- Overbooking is then a tuned oversell factor applied to specific room types and
  dates, kept below a threshold derived from historical no-show rates.

Because cancellations are common, an overbooking policy must be coupled to an
overflow strategy.

- When oversold inventory is realized, the platform procures a comparable
  alternative room or comps the guest.
- I would monitor the realized no-show rate against the model continuously and
  adjust the oversell factor, because overbooking that exceeds real no-shows
  produces angry guests and compensation costs.
- The ledger of locks, releases, and overflow events also feeds analytics that
  fine-tune the policy over time.
- Credit-card-backed reservations reduce no-shows at premium tables and give the
  platform a recovery mechanism, layered on top of the base policy.

### How do you design search and filtering for millions of rooms?

Search over millions of rooms is a read-heavy pattern that suits an inverted
index over denormalized documents.

- Each hotel document stores city, neighborhood, star rating, price band,
  amenity flags, and room inventory for the next rolling horizon.
- I would index these in Elasticsearch for free-text and geo queries, while the
  availability engine provides a compact summary of open date ranges used for
  coarse pre-filtering.
- Typical filters (city, dates, guests, star, price) are structured fields, so
  most searches are filtered term lookups over a few hundred thousand hotels
  plus a room-type expansion.

To keep latency bounded, I would add a caching tier between the gateway and the
index.

- Popular city-plus-date combos are cached with a short TTL, so a spike like a
  holiday weekend hits the cache rather than the cluster.
- Query results include facets computed at index time, letting the UI offer
  filters for price, rating, and amenities without recomputing counts per
  request.
- For personalized results, a user context service injects signals like past
  city, price preference, and loyalty tier into the query.
- Because inventory changes constantly, the cache TTL and the availability
  re-check reconcile freshness with cost.

At this scale I would shard the index by region or city cluster.

- A typical query touches a small number of shards, and I would run read
  replicas sized for peak browsing load.
- Ranking combines editorial signals like relevance, rating, price, and partner
  bid, computed by a lightweight model over the cached facets.
- Compact binary summaries of open slots are embedded in the cached facets so
  search can pre-filter bookable hotels before hitting the index.
- Scaling out is mostly adding replicas and cache nodes; the hot-path query
  shape stays simple, which keeps p99 latency in the tens of milliseconds.
- The tradeoff is between index freshness and query cost; daily reindex plus
  near-real-time updates keeps search accurate enough for a booking flow.

### How do you handle payments, refunds, and currency conversion?

Payments must be idempotent, auditable, and resilient to provider outages, so I
would isolate them in a dedicated payment service that talks to one or more
acquiring partners.

- Every charge or refund is keyed by a unique idempotency key generated when the
  booking is created, so retries after timeouts never double-charge.
- The payment service persists the transaction lifecycle (authorized, captured,
  refunded, failed) and reconciles against provider settlement reports
  asynchronously, because bank-side state is authoritative and can diverge from
  ours.
- A webhook to the booking service flips reservation state on authorization
  success rather than trusting the client.

Currency conversion is handled at authorization time using an exchange-rate
service that snapshots rates per currency pair with a timestamp.

- I would store the rate applied on the transaction record so the price shown to
  the guest is exactly the price charged, and use conservative rounding that
  pushes any remainder to a merchant margin rather than a surprise for the
  guest.
- Multi-currency pricing is cached and refreshed periodically; live fluctuations
  between cache refreshes are absorbed within a small tolerance.

Refunds flow through the same state machine in reverse.

- A cancellation event triggers a refund calculation that respects the hotel's
  cancellation policy and fees, then issues a reverse transaction against the
  original capture.
- Failure handling matters because refunds can fail after a cancellation is
  confirmed; a durable retry queue replays them until success, and a dead-letter
  queue surfaces persistent failures to ops.
- Compliance is preserved by keeping every money movement in an append-only
  ledger and hashing the whole chain for audits.
- The same ledger feeds currency exposure reporting, so finance sees gross
  exposure per currency daily.

### How do you handle cancellations and pricing changes?

Cancellations are state transitions on a reservation that must release inventory
and settle money in the right order.

- When a guest cancels, the booking service computes the refund amount from the
  cancellation policy of the rate plan, releases the locked room-nights back to
  the availability engine, issues the refund through payment, and emits a
  cancellation event that search consumes to refresh availability.
- I would make this a saga: release inventory first if the policy is
  non-refundable, otherwise issue the refund before releasing, and compensate
  with a re-lock and re-charge if a downstream step fails.

Pricing changes arrive from revenue management as new rate plans or dynamic
per-night prices.

- I model prices as per-date room rates stored in the inventory record rather
  than a single scalar on the room type, so a booking spanning several nights
  composes per-night prices.
- Because an in-progress booking must be quoted consistently, the availability
  engine snapshots the price quote at reservation time and binds it; changes
  after that only affect new bookings, and re-quotes are explicit user actions.

In-flight changes such as a guest modifying dates are implemented as cancel plus
rebook inside a single transaction to avoid double-holding inventory.

- Rate plans support advance-purchase discounts and refund windows, and the
  cancellation policy lookup is versioned so historical reservations keep the
  policy they booked under.
- Surge pricing on high-demand nights and last-minute discounts both flow
  through the per-date model, so the search cache reflects the latest effective
  price.
- Notifications keep the guest informed at each transition, and reconciliation
  jobs compare issued refunds against policy expectations nightly, catching
  drift early before it becomes a dispute.

## Source

```text
title: Hotel Booking
node guest: Guest [round, icon=browser]
node app: Booking App [icon=browser]
node gateway: API Gateway [icon=server]
node search: Search Service [icon=search]
node avail: Availability Engine [icon=cache]
node booking: Booking Service [icon=compute]
node payment: Payment Service [icon=shield]
node inventory: Room Inventory [cylinder, icon=database]
node cache: Search Cache [cylinder, icon=cache]
node notify: Notifications [icon=message]
node db: Bookings DB [cylinder, icon=database]

edge guest -> app: search
edge app -> gateway: query
edge gateway -> search: hotels
edge search -> avail: check dates
edge avail -> inventory: lock room
edge gateway -> booking: book
edge booking -> payment: charge
edge booking -> db: store
edge payment -> notify: confirm
edge gateway -> cache: cache results
edge search -> cache: read
edge booking -> avail: release
```

## Q&A

### Q: Design a hotel booking platform

**A:** A hotel booking platform is best decomposed into small, horizontally scalable
services behind an API gateway, each owning its data.

- The search service keeps a denormalized index of hotels, room types,
  amenities, and prices so guests can filter and rank results quickly.
- The availability engine owns inventory and tracks supply by property, room
  type, and date range.
- The booking service orchestrates reservation state machines, and the payment
  service owns charging, refunds, and currency conversion.
- A relational Bookings DB stores reservations, a search cache backs hot read
  paths, and a room inventory store guards supply.

The primary flow starts when a guest searches through the app.

- The gateway routes the query to search, which reads its cache, then asks the
  availability engine to confirm open dates, and returns ranked results.
- When the guest proceeds to book, the booking service locks inventory for the
  requested nights, triggers a charge through payment, persists the reservation,
  and publishes a confirmation event that the notification service consumes.
- Cancellations, no-shows, and price changes flow through the same state
  machine, releasing locks and issuing refunds.
- Booking is modeled as an idempotent workflow with explicit states (pending,
  confirmed, cancelled, completed), so retries and partial failures never create
  duplicate reservations.

I would connect services with an event bus.

- Availability changes, confirmations, and cancellations propagate
  asynchronously to search, cache, and notification workers.
- This keeps the synchronous path short while enabling price-drop alerts and
  inventory reconciliation.
- The main tradeoff is eventual consistency: search may briefly show stale
  availability, which is acceptable because the availability engine revalidates
  the instant a guest commits to booking.
- Sharded databases and read replicas absorb read-heavy search traffic, while a
  short-lived inventory lock prevents two guests from claiming the same night.

### Q: How do you prevent double-booking and overbooking?

**A:** Double-booking happens when two reservations claim the same room-night, while
overbooking is a deliberate policy of selling more inventory than exists to
hedge against cancellations and no-shows.

- I would prevent double-booking at the source with a pessimistic lock: before
  confirming, the availability engine atomically decrements capacity for every
  requested night in a single transaction against the inventory store.
- Because the decrement is conditional on remaining capacity being positive, the
  second concurrent request for the same night fails instead of silently
  succeeding.

For low-latency booking flows:

- Use a conditional UPDATE on the inventory row (update capacity where capacity
  is greater than zero) or a Redis-based lock on the room-night key, and fall
  back to the database for final authority.
- The lock is short-lived and released after the reservation is committed, so
  hot dates do not serialize the whole system.
- Idempotency keys on booking requests prevent a client retry from decrementing
  inventory twice; the engine returns a booking id and dedupes repeats by key
  before touching inventory.
- Overbooking is then a tuned oversell factor applied to specific room types and
  dates, kept below a threshold derived from historical no-show rates.

Because cancellations are common, an overbooking policy must be coupled to an
overflow strategy.

- When oversold inventory is realized, the platform procures a comparable
  alternative room or comps the guest.
- I would monitor the realized no-show rate against the model continuously and
  adjust the oversell factor, because overbooking that exceeds real no-shows
  produces angry guests and compensation costs.
- The ledger of locks, releases, and overflow events also feeds analytics that
  fine-tune the policy over time.
- Credit-card-backed reservations reduce no-shows at premium tables and give the
  platform a recovery mechanism, layered on top of the base policy.

### Q: How do you design search and filtering for millions of rooms?

**A:** Search over millions of rooms is a read-heavy pattern that suits an inverted
index over denormalized documents.

- Each hotel document stores city, neighborhood, star rating, price band,
  amenity flags, and room inventory for the next rolling horizon.
- I would index these in Elasticsearch for free-text and geo queries, while the
  availability engine provides a compact summary of open date ranges used for
  coarse pre-filtering.
- Typical filters (city, dates, guests, star, price) are structured fields, so
  most searches are filtered term lookups over a few hundred thousand hotels
  plus a room-type expansion.

To keep latency bounded, I would add a caching tier between the gateway and the
index.

- Popular city-plus-date combos are cached with a short TTL, so a spike like a
  holiday weekend hits the cache rather than the cluster.
- Query results include facets computed at index time, letting the UI offer
  filters for price, rating, and amenities without recomputing counts per
  request.
- For personalized results, a user context service injects signals like past
  city, price preference, and loyalty tier into the query.
- Because inventory changes constantly, the cache TTL and the availability
  re-check reconcile freshness with cost.

At this scale I would shard the index by region or city cluster.

- A typical query touches a small number of shards, and I would run read
  replicas sized for peak browsing load.
- Ranking combines editorial signals like relevance, rating, price, and partner
  bid, computed by a lightweight model over the cached facets.
- Compact binary summaries of open slots are embedded in the cached facets so
  search can pre-filter bookable hotels before hitting the index.
- Scaling out is mostly adding replicas and cache nodes; the hot-path query
  shape stays simple, which keeps p99 latency in the tens of milliseconds.
- The tradeoff is between index freshness and query cost; daily reindex plus
  near-real-time updates keeps search accurate enough for a booking flow.

### Q: How do you handle payments, refunds, and currency conversion?

**A:** Payments must be idempotent, auditable, and resilient to provider outages, so I
would isolate them in a dedicated payment service that talks to one or more
acquiring partners.

- Every charge or refund is keyed by a unique idempotency key generated when the
  booking is created, so retries after timeouts never double-charge.
- The payment service persists the transaction lifecycle (authorized, captured,
  refunded, failed) and reconciles against provider settlement reports
  asynchronously, because bank-side state is authoritative and can diverge from
  ours.
- A webhook to the booking service flips reservation state on authorization
  success rather than trusting the client.

Currency conversion is handled at authorization time using an exchange-rate
service that snapshots rates per currency pair with a timestamp.

- I would store the rate applied on the transaction record so the price shown to
  the guest is exactly the price charged, and use conservative rounding that
  pushes any remainder to a merchant margin rather than a surprise for the
  guest.
- Multi-currency pricing is cached and refreshed periodically; live fluctuations
  between cache refreshes are absorbed within a small tolerance.

Refunds flow through the same state machine in reverse.

- A cancellation event triggers a refund calculation that respects the hotel's
  cancellation policy and fees, then issues a reverse transaction against the
  original capture.
- Failure handling matters because refunds can fail after a cancellation is
  confirmed; a durable retry queue replays them until success, and a dead-letter
  queue surfaces persistent failures to ops.
- Compliance is preserved by keeping every money movement in an append-only
  ledger and hashing the whole chain for audits.
- The same ledger feeds currency exposure reporting, so finance sees gross
  exposure per currency daily.

### Q: How do you handle cancellations and pricing changes?

**A:** Cancellations are state transitions on a reservation that must release inventory
and settle money in the right order.

- When a guest cancels, the booking service computes the refund amount from the
  cancellation policy of the rate plan, releases the locked room-nights back to
  the availability engine, issues the refund through payment, and emits a
  cancellation event that search consumes to refresh availability.
- I would make this a saga: release inventory first if the policy is
  non-refundable, otherwise issue the refund before releasing, and compensate
  with a re-lock and re-charge if a downstream step fails.

Pricing changes arrive from revenue management as new rate plans or dynamic
per-night prices.

- I model prices as per-date room rates stored in the inventory record rather
  than a single scalar on the room type, so a booking spanning several nights
  composes per-night prices.
- Because an in-progress booking must be quoted consistently, the availability
  engine snapshots the price quote at reservation time and binds it; changes
  after that only affect new bookings, and re-quotes are explicit user actions.

In-flight changes such as a guest modifying dates are implemented as cancel plus
rebook inside a single transaction to avoid double-holding inventory.

- Rate plans support advance-purchase discounts and refund windows, and the
  cancellation policy lookup is versioned so historical reservations keep the
  policy they booked under.
- Surge pricing on high-demand nights and last-minute discounts both flow
  through the per-date model, so the search cache reflects the latest effective
  price.
- Notifications keep the guest informed at each transition, and reconciliation
  jobs compare issued refunds against policy expectations nightly, catching
  drift early before it becomes a dispute.

## Source

```text
title: Hotel Booking
node guest: Guest [round, icon=browser]
node app: Booking App [icon=browser]
node gateway: API Gateway [icon=server]
node search: Search Service [icon=search]
node avail: Availability Engine [icon=cache]
node booking: Booking Service [icon=compute]
node payment: Payment Service [icon=shield]
node inventory: Room Inventory [cylinder, icon=database]
node cache: Search Cache [cylinder, icon=cache]
node notify: Notifications [icon=message]
node db: Bookings DB [cylinder, icon=database]

edge guest -> app: search
edge app -> gateway: query
edge gateway -> search: hotels
edge search -> avail: check dates
edge avail -> inventory: lock room
edge gateway -> booking: book
edge booking -> payment: charge
edge booking -> db: store
edge payment -> notify: confirm
edge gateway -> cache: cache results
edge search -> cache: read
edge booking -> avail: release
```
