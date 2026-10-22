# Ticket booking system

Hold seats under contention and never sell the same ticket twice.

**Difficulty:** Medium

**Tags:** booking, payments, search

## Functional Requirements

- Browse and search events and view a seat map.
- Hold seats for a short window and then purchase them.
- Charge payment and issue tickets; release expired holds.
- Handle refunds and ticket resale.

## Non-Functional Requirements

- Seat allocation is serialisable per event, so a seat is never sold twice.
- A hold expires after about 10 minutes and is released automatically.
- The read path survives a 100× spike when tickets go on sale.
- Payment is exactly once, even when the buyer retries.

## Estimation

- 10M buyers hitting a stadium sale in 5 minutes is about 33k requests per second, mostly seat-map reads.
- A 50k-seat event plus 100k holds a day keeps inventory writes small and bounded per event.
- The seat map is static enough to cache at the edge; only holds and purchases hit the inventory store.
- 1M bookings a day at 2 KB is 2 GB a day, but payment records are kept for years.

## Architecture Diagram

```text
 Client ─► API gateway ─► Event service ─► Event cache
              │                  │
              │                  └─► Seat map (availability, CDN-cached)
              └─► Seat hold ─► Inventory store (atomic reserve, TTL)
                                   │
                                   └─► Booking service ─► Payment service
                                              │                 │
                                              ├─► Bookings DB   └─► Notifications (tickets)
                                              └─► release expired holds
```

## Design

### Overview

The platform breaks into a browse path and a checkout path.

- On browse, the client hits the API gateway, which queries an Event Service
  backed by a search index and an Event Cache for metadata, seat maps, and venue
  info.
- On checkout, the client selects seats, the Seat Map service issues a hold
  against the Inventory Store, and the Booking Service confirms the reservation
  before charging the Payment Service and persisting the final booking in a
  Bookings DB.
- A notifications service emails tickets and QR codes once payment succeeds.

The inventory store is the heart:

- Seats are represented as discrete units with states (available, held, sold,
  disabled), and every transition must be atomic because a single event can
  sustain millions of concurrent requests at on-sale time.

Key entities:

- `event` (venue, dates, capacity), `seat` (section, row, number, state), `hold`
  (seat, owner session, expiry), and `booking` (seats, amount, status).
- Events and seats are read-mostly and heavily cached; bookings and holds are
  write-hot and need careful concurrency control.
- Availability reads are served from cache for snappy seat-map rendering, while
  reservation writes always round-trip to the authoritative inventory store.
- The system must also survive queue jumps: during a popular on-sale, a virtual
  waiting room funnels traffic into the booking path so the inventory backend
  sees a bounded request rate.

## Q&A

### Q: How do you prevent overselling seats under high concurrency?

Overselling happens when two requests read "available" and both proceed to sell
the same seat — a classic check-then-act race. The fix is to make the
availability-to-reserve transition atomic in one place.

- Keep a Redis inventory store with a key per seat and use a Lua script that
  checks the seat state and flips it from `available` to `held` in a single
  atomic operation, so the check and the write cannot be interleaved.
- Alternatively, encode capacity as a counter per section and use `DECR` on a
  remaining-seats key, rejecting when it goes negative.
- No matter the primitive, the invariant is: the inventory store is the single
  source of truth, and caches are never allowed to grant a seat — they only
  render availability optimistically.

Beyond atomicity, you need bounded admission:

- A virtual queue or waiting room gates how many users can actively book per
  event; a token bucket or per-session rate limit on the booking endpoint
  prevents any one client from flooding the inventory store.
- Batch settlement also helps: holding a reservation intent in a queue and
  applying it in small, serialized batches (or using a single-node serialization
  for the hottest events) avoids thundering-herd contention.
- When a hold expires, the seat must return to `available` through the same
  atomic path, and the remaining-capacity counter must be incremented back, or
  you leak inventory.
- Monitor oversell rates and hold-expiry rates per event as first-class metrics.

### Q: How do you implement seat holds with timeouts?

A hold reserves a seat for a specific buyer for a limited window — typically
5–10 minutes — during which only that buyer can convert it into a booking.

- Implement holds as entries in Redis with a TTL: key `hold:{seat_id}` to
  `{user_id, expires_at}`, set with `SET ... NX EX`.
- On reserve, the Lua script only succeeds if the seat is `available`; on
  success it flips the seat to `held` and stores the holder.
- Each subsequent call (refresh, pay now, checkout) validates that the requester
  is the holder and that the TTL hasn't fired, and a successful payment extends
  the hold atomically just long enough to commit the booking.
- If the user never pays, Redis evicts the key on TTL and a background
  reconciler flips the seat back to `available`.

Two mechanisms keep the system correct under failure:

- First, a sweeper (repeated `SCAN` plus a conditional Lua script) periodically
  reclaims expired holds in the rare case of an eviction without the expected
  state transition, guaranteeing eventual release even if a node dies
  mid-transaction.
- Second, the checkout flow must be idempotent: a `hold_id` is passed through
  booking and payment so a retried charge doesn't double-commit or resurrect an
  expired hold.
- Trade-off: longer TTLs reduce abandonment friction and increase conversion but
  tie up scarce inventory; shorter TTLs increase seat availability and enable
  rapid re-selling but frustrate buyers.
- Derive the TTL from a configurable policy per event tier, and always show a
  live countdown so the client can refresh the hold before expiry.

### Q: Design the event search and browse experience

Browse is a read-heavy, latency-sensitive path: users explore events by
category, city, date, artist, and venue long before they buy.

- Put an Elasticsearch/OpenSearch cluster in front of the Event Service,
  indexing events with fields for name, artist, venue, genre, and dates.
- Serve faceted filtering (date ranges, price buckets, city, genre) directly
  from the index.
- Rank results by a blend of relevance (BM25 on text), popularity (search
  volume, sales velocity), and freshness (upcoming events first), re-scored
  offline so the online path stays fast.
- Hot queries — big tours, holidays — are cached in the Event Cache with short
  TTLs (seconds to minutes), while venue metadata, seat maps, and static event
  details live in a longer-lived cache.

Events are created in bursts, so the indexer must be near-real-time:

- An artist announces a tour and 40 shows appear at once; publishing an event
  writes to the Bookings DB and emits an index event consumed by workers that
  upsert the document within seconds.
- Availability is shown as a lightweight badge (available / low / sold out)
  derived from the inventory store and denormalized into the index with a short
  TTL rather than queried live on every result page — trying to count seats per
  event inline would melt the inventory store.
- For the hottest events, serve a pre-built landing page from the cache and
  front it with the waiting room so browse stays responsive even when a million
  fans hammer the same artist.

### Q: How do you handle ticket resale and refunds?

Both flows mutate inventory and money, so they reuse the same booking
infrastructure.

- For refunds, the Booking Service flips a `booking` from confirmed to refunded
  only if the event hasn't happened (policy check), then calls the Payment
  Service to reverse or credit the charge.
- A refund ledger records the original charge, the reversal, and status
  transitions so retries are idempotent; the seats return to `available` through
  the same atomic inventory path used for hold expiry.
- Rule-based (grace periods, event postponement) vs merchant-optional (no
  refunds) policies live in a config service and are enforced before any ledger
  mutation.
- Payment reversals are asynchronous and can fail, so a reconciler matches
  refund requests against bank settlement reports and retries credits until they
  land.

Resale is a mini-marketplace:

- A seller lists a ticket, the platform validates ownership, takes the ticket
  out of circulation into a `resale_listing` state, and when a buyer purchases,
  inventory is re-issued to the new owner and the original is voided.
- Because the seat identity on the actual ticket may need to change, the booking
  record is updated atomically with the ownership transfer and a new barcode/QR
  is issued while the old one is blacklisted — double-use prevention is a fraud
  and infrastructure concern, not just a data one.
- Pricing can be capped at face value or market-based; in either case,
  list-to-sell latency is a cache/queue problem: listings are indexed in search,
  and a sold-out event shows resale availability from the index with the live
  inventory re-checked only at checkout.

## Source

````text
title: Ticketmaster Booking
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node event: Event Service [icon=search]
node seat: Seat Map [icon=compute]
node booking: Booking Service [icon=queue]
node payment: Payment Service [icon=shield]
node inventory: Inventory Store [cylinder, icon=database]
node notify: Notifications [icon=mail]
node db: Bookings DB [cylinder, icon=database]
node cache: Event Cache [cylinder, icon=cache]

edge client -> api: browse events
edge api -> event: search
edge event -> cache: read
edge client -> api: select seats
edge api -> seat: hold
edge seat -> inventory: reserve
edge inventory -> booking: confirm
edge booking -> payment: charge
edge payment -> booking: success
edge booking -> db: persist
edge booking -> notify: tickets
edge seat -> cache: availability
```.

## Source


```text
title: Ticketmaster Booking
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node event: Event Service [icon=search]
node seat: Seat Map [icon=compute]
node booking: Booking Service [icon=queue]
node payment: Payment Service [icon=shield]
node inventory: Inventory Store [cylinder, icon=database]
node notify: Notifications [icon=mail]
node db: Bookings DB [cylinder, icon=database]
node cache: Event Cache [cylinder, icon=cache]

edge client -> api: browse events
edge api -> event: search
edge event -> cache: read
edge client -> api: select seats
edge api -> seat: hold
edge seat -> inventory: reserve
edge inventory -> booking: confirm
edge booking -> payment: charge
edge payment -> booking: success
edge booking -> db: persist
edge booking -> notify: tickets
edge seat -> cache: availability
```

## Source


```text
title: Ticketmaster Booking
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node event: Event Service [icon=search]
node seat: Seat Map [icon=compute]
node booking: Booking Service [icon=queue]
node payment: Payment Service [icon=shield]
node inventory: Inventory Store [cylinder, icon=database]
node notify: Notifications [icon=mail]
node db: Bookings DB [cylinder, icon=database]
node cache: Event Cache [cylinder, icon=cache]

edge client -> api: browse events
edge api -> event: search
edge event -> cache: read
edge client -> api: select seats
edge api -> seat: hold
edge seat -> inventory: reserve
edge inventory -> booking: confirm
edge booking -> payment: charge
edge payment -> booking: success
edge booking -> db: persist
edge booking -> notify: tickets
edge seat -> cache: availability
```
````
