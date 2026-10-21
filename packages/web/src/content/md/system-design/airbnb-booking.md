# Airbnb — Booking

Design Airbnb / a short-term rental platform

**Difficulty:** Easy

**Tags:** booking, ecommerce, payments, search

## Functional Requirements

- Airbnb / a short-term rental platform
- model listing availability calendars?
- prevent double-booking under concurrency?
- the search over price, location, and amenities
- handle the host payouts flow?

## Non-Functional Requirements

- Store availability per listing per date:

- Rows of `(listing_id, date, status, price)`, where status is
  `available`/`blocked`/`booked`.
- A unique index on `(listing_id, date)` and an index supporting range scans.

To prevent overlapping reservations, use PostgreSQL `daterange` columns with an
`EXCLUDE USING gist (listing_id WITH =, daterange WITH &&)` constraint so the
database rejects any booking that overlaps existing ones.

- Store the timezone per listing and convert before range queries.
- Missing dates mean "available" by default.
- Hosts can block or reprice individual nights.

For reads, denormalize a compact availability bitmap per listing so the search
service filters a date range in one lookup.

- The calendar is only ever mutated inside the booking transaction..
- Index listing documents in Elasticsearch.

- Location is a `geo_point`, so queries do radius or bounding-box matching with
  a distance sort.
- Price and per-night price are numerics supporting range filters and histogram
  aggregations.
- Amenities are keyword fields you filter on.

Availability is the tricky part:

- Store it as per-date fields or a dedicated filter so a query can require
  "available for these nights" using inverted-index lookups rather than a scan.
- Return faceted counts (price buckets, amenity counts) for refinement.

Near-real-time updates stream from the Listing Service via change data capture.

- Cache the hottest query/facet results, shard the index by listing, and scale
  replicas for read QPS..
- After a stay, a job computes host earnings (stay price minus service fees and
  taxes), and the Payment Service initiates a payout to the host's bank or PayPal
  via a payout provider.

- Money movement is recorded as double-entry ledger entries — debit the
  platform, credit the host — with unique entry IDs for idempotency.
- Payouts follow a state machine: pending, processing, paid/failed — run in
  daily or weekly batches per host preferences, with provider webhooks driving
  state transitions.
- Failed transfers retry with backoff and an idempotency key.
- Reconcile payout files against the ledger daily to catch fee drift.
- Fund-holding policies delay payouts until check-in passes, and fraud
  thresholds hold large amounts for review.
- Hosts get notifications at each state change.

## Source

````text
title: Airbnb Booking
node guest: Guest App [round, icon=browser]
node host: Host App [round, icon=browser]
node api: API Gateway [icon=server]
node search: Listing Search [icon=search]
node listing: Listing Service [icon=file]
node calendar: Calendar Service [icon=cache]
node booking: Booking Service [icon=compute]
node pay: Payment Service [icon=shield]
node review: Reviews Service [icon=message]
node notify: Notifications [icon=mail]
node db: Listings DB [cylinder, icon=database]
node cache: Search Cache [cylinder, icon=cache]

edge guest -> api: search
edge api -> search: query
edge search -> cache: results
edge search -> listing: details
edge listing -> db: read
edge guest -> api: book
edge api -> booking: reserve
edge booking -> calendar: lock dates
edge calendar -> booking: available
edge booking -> pay: charge
edge booking -> db: persist
edge booking -> notify: alert host
edge guest -> api: review
edge api -> review: post
edge review -> notify: alert
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Airbnb Booking
guest: Guest App
host: Host App
api: API Gateway
search: Listing Search
listing: Listing Service
calendar: Calendar Service
booking: Booking Service
pay: Payment Service
review: Reviews Service
notify: Notifications
db: Listings DB
cache: Search Cache

guest ─► api ─► search
api ─► search ─► query
search ─► cache ─► results
search ─► listing ─► details
listing ─► db ─► read
guest ─► api ─► book
api ─► booking ─► reserve
booking ─► calendar ─► lock dates
calendar ─► booking ─► available
booking ─► pay ─► charge
booking ─► db ─► persist
booking ─► notify ─► alert host
guest ─► api ─► review
api ─► review ─► post
review ─► notify ─► alert
````

## Design

### Design Airbnb / a short-term rental platform

Split into focused services:

- API gateway
- Listing Search (Elasticsearch)
- Listing Service
- Calendar Service for availability
- Booking Service
- Payment Service handling both guest charges and host payouts
- Reviews
- Notifications

Booking flow:

- Search
- View listing
- Reserve (atomically lock the requested dates)
- Charge the guest
- Confirm

Data model:

- Listings
- Availability entries
- Bookings
- Users
- Reviews
- Money-movement records

Reads dominate, so front them with search indexing and caching; writes funnel to
a strongly consistent store for calendars and bookings, where the database's
exclusion constraints are the real double-booking guard.

- Asynchronous side effects — host alerts, review prompts, payout scheduling —
  go through queues.
- Monetization: service fees split from the stay price and recorded via a
  double-entry ledger.

### How do you model listing availability calendars?

Store availability per listing per date:

- Rows of `(listing_id, date, status, price)`, where status is
  `available`/`blocked`/`booked`.
- A unique index on `(listing_id, date)` and an index supporting range scans.

To prevent overlapping reservations, use PostgreSQL `daterange` columns with an
`EXCLUDE USING gist (listing_id WITH =, daterange WITH &&)` constraint so the
database rejects any booking that overlaps existing ones.

- Store the timezone per listing and convert before range queries.
- Missing dates mean "available" by default.
- Hosts can block or reprice individual nights.

For reads, denormalize a compact availability bitmap per listing so the search
service filters a date range in one lookup.

- The calendar is only ever mutated inside the booking transaction.

### How do you prevent double-booking under concurrency?

The database is the source of truth.

- Each booking runs in a transaction that either locks the listing's calendar
  rows (`SELECT ... FOR UPDATE`) or inserts into a table whose `daterange`
  exclusion constraint forbids overlaps — both make conflicting reservations
  fail atomically, and exactly one wins.
- For hot listings, a per-listing distributed lock or a Redis `SETNX` on the
  date range gives a fast admission check before the DB work.

Always enforce a short hold:

- Reserve the dates, give the guest a few minutes to pay, then release on
  timeout.
- The booking and calendar updates commit together, so a charge never happens
  against released dates.

Optimistic concurrency with version columns is a fallback, but exclusion
constraints are the robust answer.

### Design the search over price, location, and amenities

Index listing documents in Elasticsearch.

- Location is a `geo_point`, so queries do radius or bounding-box matching with
  a distance sort.
- Price and per-night price are numerics supporting range filters and histogram
  aggregations.
- Amenities are keyword fields you filter on.

Availability is the tricky part:

- Store it as per-date fields or a dedicated filter so a query can require
  "available for these nights" using inverted-index lookups rather than a scan.
- Return faceted counts (price buckets, amenity counts) for refinement.

Near-real-time updates stream from the Listing Service via change data capture.

- Cache the hottest query/facet results, shard the index by listing, and scale
  replicas for read QPS.

### How do you handle the host payouts flow?

After a stay, a job computes host earnings (stay price minus service fees and
taxes), and the Payment Service initiates a payout to the host's bank or PayPal
via a payout provider.

- Money movement is recorded as double-entry ledger entries — debit the
  platform, credit the host — with unique entry IDs for idempotency.
- Payouts follow a state machine: pending, processing, paid/failed — run in
  daily or weekly batches per host preferences, with provider webhooks driving
  state transitions.
- Failed transfers retry with backoff and an idempotency key.
- Reconcile payout files against the ledger daily to catch fee drift.
- Fund-holding policies delay payouts until check-in passes, and fraud
  thresholds hold large amounts for review.
- Hosts get notifications at each state change.

## Source

```text
title: Airbnb Booking
node guest: Guest App [round, icon=browser]
node host: Host App [round, icon=browser]
node api: API Gateway [icon=server]
node search: Listing Search [icon=search]
node listing: Listing Service [icon=file]
node calendar: Calendar Service [icon=cache]
node booking: Booking Service [icon=compute]
node pay: Payment Service [icon=shield]
node review: Reviews Service [icon=message]
node notify: Notifications [icon=mail]
node db: Listings DB [cylinder, icon=database]
node cache: Search Cache [cylinder, icon=cache]

edge guest -> api: search
edge api -> search: query
edge search -> cache: results
edge search -> listing: details
edge listing -> db: read
edge guest -> api: book
edge api -> booking: reserve
edge booking -> calendar: lock dates
edge calendar -> booking: available
edge booking -> pay: charge
edge booking -> db: persist
edge booking -> notify: alert host
edge guest -> api: review
edge api -> review: post
edge review -> notify: alert
```

## Q&A

### Q: Design Airbnb / a short-term rental platform

**A:** Split into focused services:

- API gateway
- Listing Search (Elasticsearch)
- Listing Service
- Calendar Service for availability
- Booking Service
- Payment Service handling both guest charges and host payouts
- Reviews
- Notifications

Booking flow:

- Search
- View listing
- Reserve (atomically lock the requested dates)
- Charge the guest
- Confirm

Data model:

- Listings
- Availability entries
- Bookings
- Users
- Reviews
- Money-movement records

Reads dominate, so front them with search indexing and caching; writes funnel to
a strongly consistent store for calendars and bookings, where the database's
exclusion constraints are the real double-booking guard.

- Asynchronous side effects — host alerts, review prompts, payout scheduling —
  go through queues.
- Monetization: service fees split from the stay price and recorded via a
  double-entry ledger.

### Q: How do you model listing availability calendars?

**A:** Store availability per listing per date:

- Rows of `(listing_id, date, status, price)`, where status is
  `available`/`blocked`/`booked`.
- A unique index on `(listing_id, date)` and an index supporting range scans.

To prevent overlapping reservations, use PostgreSQL `daterange` columns with an
`EXCLUDE USING gist (listing_id WITH =, daterange WITH &&)` constraint so the
database rejects any booking that overlaps existing ones.

- Store the timezone per listing and convert before range queries.
- Missing dates mean "available" by default.
- Hosts can block or reprice individual nights.

For reads, denormalize a compact availability bitmap per listing so the search
service filters a date range in one lookup.

- The calendar is only ever mutated inside the booking transaction.

### Q: How do you prevent double-booking under concurrency?

**A:** The database is the source of truth.

- Each booking runs in a transaction that either locks the listing's calendar
  rows (`SELECT ... FOR UPDATE`) or inserts into a table whose `daterange`
  exclusion constraint forbids overlaps — both make conflicting reservations
  fail atomically, and exactly one wins.
- For hot listings, a per-listing distributed lock or a Redis `SETNX` on the
  date range gives a fast admission check before the DB work.

Always enforce a short hold:

- Reserve the dates, give the guest a few minutes to pay, then release on
  timeout.
- The booking and calendar updates commit together, so a charge never happens
  against released dates.

Optimistic concurrency with version columns is a fallback, but exclusion
constraints are the robust answer.

### Q: Design the search over price, location, and amenities

**A:** Index listing documents in Elasticsearch.

- Location is a `geo_point`, so queries do radius or bounding-box matching with
  a distance sort.
- Price and per-night price are numerics supporting range filters and histogram
  aggregations.
- Amenities are keyword fields you filter on.

Availability is the tricky part:

- Store it as per-date fields or a dedicated filter so a query can require
  "available for these nights" using inverted-index lookups rather than a scan.
- Return faceted counts (price buckets, amenity counts) for refinement.

Near-real-time updates stream from the Listing Service via change data capture.

- Cache the hottest query/facet results, shard the index by listing, and scale
  replicas for read QPS.

### Q: How do you handle the host payouts flow?

**A:** After a stay, a job computes host earnings (stay price minus service fees and
taxes), and the Payment Service initiates a payout to the host's bank or PayPal
via a payout provider.

- Money movement is recorded as double-entry ledger entries — debit the
  platform, credit the host — with unique entry IDs for idempotency.
- Payouts follow a state machine: pending, processing, paid/failed — run in
  daily or weekly batches per host preferences, with provider webhooks driving
  state transitions.
- Failed transfers retry with backoff and an idempotency key.
- Reconcile payout files against the ledger daily to catch fee drift.
- Fund-holding policies delay payouts until check-in passes, and fraud
  thresholds hold large amounts for review.
- Hosts get notifications at each state change.

## Source

```text
title: Airbnb Booking
node guest: Guest App [round, icon=browser]
node host: Host App [round, icon=browser]
node api: API Gateway [icon=server]
node search: Listing Search [icon=search]
node listing: Listing Service [icon=file]
node calendar: Calendar Service [icon=cache]
node booking: Booking Service [icon=compute]
node pay: Payment Service [icon=shield]
node review: Reviews Service [icon=message]
node notify: Notifications [icon=mail]
node db: Listings DB [cylinder, icon=database]
node cache: Search Cache [cylinder, icon=cache]

edge guest -> api: search
edge api -> search: query
edge search -> cache: results
edge search -> listing: details
edge listing -> db: read
edge guest -> api: book
edge api -> booking: reserve
edge booking -> calendar: lock dates
edge calendar -> booking: available
edge booking -> pay: charge
edge booking -> db: persist
edge booking -> notify: alert host
edge guest -> api: review
edge api -> review: post
edge review -> notify: alert
```
