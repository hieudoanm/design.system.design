# Flight Booking — Travel

Design a flight booking system

**Difficulty:** Easy

**Tags:** booking, search

## Functional Requirements

- a flight booking system
- avoid overselling seats?
- handle price changes and fare rules?
- manage partial payments and refunds?
- integrate with airline inventory systems?

## Non-Functional Requirements

- The booking app sends search and reservation requests through an API Gateway to
  a Flight Search service.

- Search queries a fare cache and the seat inventory store to return priced
  itineraries: the Fare Service computes the price from base fare plus taxes and
  fees per the fare rules, and the inventory service reports how many seats
  remain per cabin.
- The booking flow is a state machine — PENDING, ON HOLD, PAID, TICKETED,
  CANCELLED — managed by the Booking Service.
- When a user books, the service creates a reservation, holds seats by
  decrementing inventory, charges the payment service, and once the charge is
  captured the Ticket Service issues the e-ticket and the API notifies the user.
- Because fares and inventory change continuously, every screen shows a quote
  with an expiry, and the reservation captures the quoted fare at hold time.
- Read paths are cached heavily — search results and fare quotes are cached with
  short TTLs — while the reservation and inventory writes hit authoritative
  stores.
- Failure handling is the crux: holds expire, payment can fail mid-flow, and
  inventory can run out between search and book, so the system must surface "no
  longer available" cleanly and support retry..
- Avoiding oversell means the seat count you advertise must be the same count you
  actually commit, enforced at the point of write.

- Inventory is stored per flight segment per cabin as a count plus a lock
  counter; a reservation atomically checks `available > 0` and decrements it in
  one database statement, so two concurrent bookings cannot both take the last
  seat.
- Because an airline flight has multiple fare buckets sharing the same physical
  seats, availability is modeled as seat pools rather than per-fare totals: each
  cabin has a pool, and fare classes draw from the pool, with the Fare Service
  dictating how many seats each class may sell.
- Holds reduce available seats immediately; if the user never pays, a timeout
  releases the hold and restores the count.
- The booking and inventory update happen in the same transaction, or the
  inventory decrement is recorded in a transactional outbox to guarantee
  exactly-once application.
- When the real-time booking source is unavailable, the system can serve from a
  cached allocation, but it is always conservative — it never over-commits
  beyond the cached availability — so the cache never causes overselling..
- Airlines expose availability and booking through standards like NDC, or legacy
  GDS/EDIFACT endpoints, so the integration layer wraps them behind adapter
  services with a unified internal model.

- Live availability is fetched from the airline for the search path — with
  aggressive caching and TTLs to avoid hammering the GDS — while bookings are
  written through the adapter synchronously to guarantee the seat is actually
  held before the user is told it is reserved.
- Booking happens in two phases to tolerate airline latency: the internal
  reservation is created first as PENDING, then the adapter calls the airline to
  create the PNR; if the airline call fails or times out, the hold expires and
  the user is notified rather than the system silently proceeding.
- A synchronization job reconciles internal reservations against airline PNRs
  (active, cancelled, ticketed) so a change made by the airline (schedule
  change, involuntary cancellation) is mirrored back into the booking state.
- Since airline APIs are slow and rate-limited, the design separates "search the
  world" (cache + shopping APIs) from "commit" (synchronous booking) and never
  lets a slow upstream block the read path.

## Source

````text
title: Flight Booking
node user: User [round, icon=browser]
node app: Booking App [icon=browser]
node api: API Gateway [icon=server]
node search: Flight Search [icon=search]
node fare: Fare Service [icon=cache]
node inventory: Seat Inventory [cylinder, icon=database]
node booking: Booking Service [icon=compute]
node payment: Payment Service [icon=shield]
node ticket: Ticket Service [icon=file]
node notify: Notifications [icon=mail]

edge user -> app: search
edge app -> search: query
edge search -> fare: price
edge search -> inventory: seats
edge user -> app: book
edge app -> api: reserve
edge api -> booking: hold
edge booking -> payment: charge
edge booking -> inventory: decrement
edge booking -> ticket: issue
edge api -> notify: confirm
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Flight Booking
user: User
app: Booking App
api: API Gateway
search: Flight Search
fare: Fare Service
inventory: Seat Inventory
booking: Booking Service
payment: Payment Service
ticket: Ticket Service
notify: Notifications

user ─► app ─► search
app ─► search ─► query
search ─► fare ─► price
search ─► inventory ─► seats
user ─► app ─► book
app ─► api ─► reserve
api ─► booking ─► hold
booking ─► payment ─► charge
booking ─► inventory ─► decrement
booking ─► ticket ─► issue
api ─► notify ─► confirm
````

## Design

### Design a flight booking system

The booking app sends search and reservation requests through an API Gateway to
a Flight Search service.

- Search queries a fare cache and the seat inventory store to return priced
  itineraries: the Fare Service computes the price from base fare plus taxes and
  fees per the fare rules, and the inventory service reports how many seats
  remain per cabin.
- The booking flow is a state machine — PENDING, ON HOLD, PAID, TICKETED,
  CANCELLED — managed by the Booking Service.
- When a user books, the service creates a reservation, holds seats by
  decrementing inventory, charges the payment service, and once the charge is
  captured the Ticket Service issues the e-ticket and the API notifies the user.
- Because fares and inventory change continuously, every screen shows a quote
  with an expiry, and the reservation captures the quoted fare at hold time.
- Read paths are cached heavily — search results and fare quotes are cached with
  short TTLs — while the reservation and inventory writes hit authoritative
  stores.
- Failure handling is the crux: holds expire, payment can fail mid-flow, and
  inventory can run out between search and book, so the system must surface "no
  longer available" cleanly and support retry.

### How do you avoid overselling seats?

Avoiding oversell means the seat count you advertise must be the same count you
actually commit, enforced at the point of write.

- Inventory is stored per flight segment per cabin as a count plus a lock
  counter; a reservation atomically checks `available > 0` and decrements it in
  one database statement, so two concurrent bookings cannot both take the last
  seat.
- Because an airline flight has multiple fare buckets sharing the same physical
  seats, availability is modeled as seat pools rather than per-fare totals: each
  cabin has a pool, and fare classes draw from the pool, with the Fare Service
  dictating how many seats each class may sell.
- Holds reduce available seats immediately; if the user never pays, a timeout
  releases the hold and restores the count.
- The booking and inventory update happen in the same transaction, or the
  inventory decrement is recorded in a transactional outbox to guarantee
  exactly-once application.
- When the real-time booking source is unavailable, the system can serve from a
  cached allocation, but it is always conservative — it never over-commits
  beyond the cached availability — so the cache never causes overselling.

### How do you handle price changes and fare rules?

Fares are not a single number: a fare is a rule set (booking class, advance
purchase, refundability, change fees, blackout dates) plus a base price, and the
Fare Service evaluates those rules to quote the final price at the moment of
search.

- Prices change by publishing new fare values with effective time ranges, so a
  quote is only valid within its validity window; the search result carries a
  `quote_id` and expiry, and the booking step revalidates the quote against the
  current fare before charging.
- If the fare changed upward in that window, the user is shown the new price
  before confirming; if it dropped, the already-quoted price is honored.
- Rules like baggage and refund policies are resolved at booking time and
  snapshotted onto the reservation record so a later fare update cannot silently
  change what the customer purchased.
- The fare cache is keyed by `(route, cabin, class, date)` and invalidated on
  fare publication; historical fare data is kept to support refund calculations,
  audits, and price-repayment policies.

### How do you manage partial payments and refunds?

Payments and refunds are modeled as a money lifecycle on the reservation, not as
single immutable transactions.

- A booking can be paid in installments or split across payment methods, so the
  Booking Service records payments as line items with statuses (AUTHORIZED,
  CAPTURED, REFUNDED, PARTIAL) and the reservation stores the total due, amount
  paid, and outstanding balance.
- A partial refund (cancel one segment, downgrade a cabin) issues a credit for
  the difference after applying fare rules and cancellation fees, and posts a
  `CREDIT` or cash-refund entry to the wallet/payment provider.
- Every payment operation carries an idempotency key so retries never
  double-charge, and provider webhooks reconcile each captured/refunded amount
  against the booking state.
- Refunds follow the rule engine: refundable fare minus penalty yields the
  amount, and the timing of when money returns to the card depends on the
  provider, so the system tracks refund status and retries until the provider
  confirms.
- The reservation state machine only transitions to REFUNDED when the
  outstanding balance reaches zero, keeping the money trail auditable end to
  end.

### How do you integrate with airline inventory systems?

Airlines expose availability and booking through standards like NDC, or legacy
GDS/EDIFACT endpoints, so the integration layer wraps them behind adapter
services with a unified internal model.

- Live availability is fetched from the airline for the search path — with
  aggressive caching and TTLs to avoid hammering the GDS — while bookings are
  written through the adapter synchronously to guarantee the seat is actually
  held before the user is told it is reserved.
- Booking happens in two phases to tolerate airline latency: the internal
  reservation is created first as PENDING, then the adapter calls the airline to
  create the PNR; if the airline call fails or times out, the hold expires and
  the user is notified rather than the system silently proceeding.
- A synchronization job reconciles internal reservations against airline PNRs
  (active, cancelled, ticketed) so a change made by the airline (schedule
  change, involuntary cancellation) is mirrored back into the booking state.
- Since airline APIs are slow and rate-limited, the design separates "search the
  world" (cache + shopping APIs) from "commit" (synchronous booking) and never
  lets a slow upstream block the read path.

## Source

```text
title: Flight Booking
node user: User [round, icon=browser]
node app: Booking App [icon=browser]
node api: API Gateway [icon=server]
node search: Flight Search [icon=search]
node fare: Fare Service [icon=cache]
node inventory: Seat Inventory [cylinder, icon=database]
node booking: Booking Service [icon=compute]
node payment: Payment Service [icon=shield]
node ticket: Ticket Service [icon=file]
node notify: Notifications [icon=mail]

edge user -> app: search
edge app -> search: query
edge search -> fare: price
edge search -> inventory: seats
edge user -> app: book
edge app -> api: reserve
edge api -> booking: hold
edge booking -> payment: charge
edge booking -> inventory: decrement
edge booking -> ticket: issue
edge api -> notify: confirm
```

## Q&A

### Q: Design a flight booking system

**A:** The booking app sends search and reservation requests through an API Gateway to
a Flight Search service.

- Search queries a fare cache and the seat inventory store to return priced
  itineraries: the Fare Service computes the price from base fare plus taxes and
  fees per the fare rules, and the inventory service reports how many seats
  remain per cabin.
- The booking flow is a state machine — PENDING, ON HOLD, PAID, TICKETED,
  CANCELLED — managed by the Booking Service.
- When a user books, the service creates a reservation, holds seats by
  decrementing inventory, charges the payment service, and once the charge is
  captured the Ticket Service issues the e-ticket and the API notifies the user.
- Because fares and inventory change continuously, every screen shows a quote
  with an expiry, and the reservation captures the quoted fare at hold time.
- Read paths are cached heavily — search results and fare quotes are cached with
  short TTLs — while the reservation and inventory writes hit authoritative
  stores.
- Failure handling is the crux: holds expire, payment can fail mid-flow, and
  inventory can run out between search and book, so the system must surface "no
  longer available" cleanly and support retry.

### Q: How do you avoid overselling seats?

**A:** Avoiding oversell means the seat count you advertise must be the same count you
actually commit, enforced at the point of write.

- Inventory is stored per flight segment per cabin as a count plus a lock
  counter; a reservation atomically checks `available > 0` and decrements it in
  one database statement, so two concurrent bookings cannot both take the last
  seat.
- Because an airline flight has multiple fare buckets sharing the same physical
  seats, availability is modeled as seat pools rather than per-fare totals: each
  cabin has a pool, and fare classes draw from the pool, with the Fare Service
  dictating how many seats each class may sell.
- Holds reduce available seats immediately; if the user never pays, a timeout
  releases the hold and restores the count.
- The booking and inventory update happen in the same transaction, or the
  inventory decrement is recorded in a transactional outbox to guarantee
  exactly-once application.
- When the real-time booking source is unavailable, the system can serve from a
  cached allocation, but it is always conservative — it never over-commits
  beyond the cached availability — so the cache never causes overselling.

### Q: How do you handle price changes and fare rules?

**A:** Fares are not a single number: a fare is a rule set (booking class, advance
purchase, refundability, change fees, blackout dates) plus a base price, and the
Fare Service evaluates those rules to quote the final price at the moment of
search.

- Prices change by publishing new fare values with effective time ranges, so a
  quote is only valid within its validity window; the search result carries a
  `quote_id` and expiry, and the booking step revalidates the quote against the
  current fare before charging.
- If the fare changed upward in that window, the user is shown the new price
  before confirming; if it dropped, the already-quoted price is honored.
- Rules like baggage and refund policies are resolved at booking time and
  snapshotted onto the reservation record so a later fare update cannot silently
  change what the customer purchased.
- The fare cache is keyed by `(route, cabin, class, date)` and invalidated on
  fare publication; historical fare data is kept to support refund calculations,
  audits, and price-repayment policies.

### Q: How do you manage partial payments and refunds?

**A:** Payments and refunds are modeled as a money lifecycle on the reservation, not as
single immutable transactions.

- A booking can be paid in installments or split across payment methods, so the
  Booking Service records payments as line items with statuses (AUTHORIZED,
  CAPTURED, REFUNDED, PARTIAL) and the reservation stores the total due, amount
  paid, and outstanding balance.
- A partial refund (cancel one segment, downgrade a cabin) issues a credit for
  the difference after applying fare rules and cancellation fees, and posts a
  `CREDIT` or cash-refund entry to the wallet/payment provider.
- Every payment operation carries an idempotency key so retries never
  double-charge, and provider webhooks reconcile each captured/refunded amount
  against the booking state.
- Refunds follow the rule engine: refundable fare minus penalty yields the
  amount, and the timing of when money returns to the card depends on the
  provider, so the system tracks refund status and retries until the provider
  confirms.
- The reservation state machine only transitions to REFUNDED when the
  outstanding balance reaches zero, keeping the money trail auditable end to
  end.

### Q: How do you integrate with airline inventory systems?

**A:** Airlines expose availability and booking through standards like NDC, or legacy
GDS/EDIFACT endpoints, so the integration layer wraps them behind adapter
services with a unified internal model.

- Live availability is fetched from the airline for the search path — with
  aggressive caching and TTLs to avoid hammering the GDS — while bookings are
  written through the adapter synchronously to guarantee the seat is actually
  held before the user is told it is reserved.
- Booking happens in two phases to tolerate airline latency: the internal
  reservation is created first as PENDING, then the adapter calls the airline to
  create the PNR; if the airline call fails or times out, the hold expires and
  the user is notified rather than the system silently proceeding.
- A synchronization job reconciles internal reservations against airline PNRs
  (active, cancelled, ticketed) so a change made by the airline (schedule
  change, involuntary cancellation) is mirrored back into the booking state.
- Since airline APIs are slow and rate-limited, the design separates "search the
  world" (cache + shopping APIs) from "commit" (synchronous booking) and never
  lets a slow upstream block the read path.

## Source

```text
title: Flight Booking
node user: User [round, icon=browser]
node app: Booking App [icon=browser]
node api: API Gateway [icon=server]
node search: Flight Search [icon=search]
node fare: Fare Service [icon=cache]
node inventory: Seat Inventory [cylinder, icon=database]
node booking: Booking Service [icon=compute]
node payment: Payment Service [icon=shield]
node ticket: Ticket Service [icon=file]
node notify: Notifications [icon=mail]

edge user -> app: search
edge app -> search: query
edge search -> fare: price
edge search -> inventory: seats
edge user -> app: book
edge app -> api: reserve
edge api -> booking: hold
edge booking -> payment: charge
edge booking -> inventory: decrement
edge booking -> ticket: issue
edge api -> notify: confirm
```
