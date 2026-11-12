# DoorDash — Food Delivery

Design DoorDash / a food delivery service

**Difficulty:** Easy

**Tags:** delivery, mobile, search

## Functional Requirements

- DoorDash / a food delivery service
- match orders to nearby dashers?
- show live order tracking with low latency?
- the order lifecycle from pickup to delivery
- handle surge demand during lunch and dinner?

## Non-Functional Requirements

- Dasher apps stream location updates into a geospatial index (S2 cells or
  GeoHash) in Redis.

- On order placement, the dispatch service queries dashers within a radius and
  scores candidates by proximity, ETA, current load (active orders),
  availability, and ratings.
- Matching is auction-style: send offers with a short TTL, and assign on
  acceptance, or re-dispatch after timeout or decline.
- Zone-based partitioning keeps matching local so dispatch workers don't need
  global coordination.
- During peaks, batch stacked orders along an optimized route so one dasher
  serves multiple orders.
- The goal is to minimize order-to-accept latency while keeping dashers
  efficient and balanced across zones..
- Expect a 5–10x peak and plan capacity accordingly.

- Queue orders when dasher supply is short, autoscale stateless services on CPU
  and queue depth, and scale stateful stores with orders DB read replicas and
  Redis.
- Buffer spikes in Kafka so downstream consumers drain at their own pace.
- On the supply side, use demand-based surge pricing and boost-zone incentives
  to pull more dashers online, and batch stacked orders.
- Cache menu and search read paths to absorb browse traffic.
- Protect the API gateway with rate limiting and backpressure, keep payment
  idempotency intact under retry storms, and degrade gracefully with
  extended-ETA messaging rather than hard failure.

## Source

````text
title: DoorDash Food Delivery
node customer: Customer App [round, icon=browser]
node dasher: Dasher App [round, icon=browser]
node api: API Gateway [icon=server]
node search: Restaurant Search [icon=search]
node order: Order Service [icon=compute]
node dispatch: Dispatch Service [icon=worker]
node track: Tracking Service [icon=sync]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node menu: Menu Cache [cylinder, icon=cache]
node db: Orders DB [cylinder, icon=database]
node geo: Geo Index [cylinder, icon=search]

edge customer -> api: browse
edge api -> search: query
edge api -> menu: read
edge customer -> api: place order
edge api -> order: create
edge order -> pay: charge
edge order -> db: persist
edge order -> dispatch: assign
edge dispatch -> geo: find dashers
edge geo -> dispatch: candidates
edge dispatch -> dasher: offer
edge dasher -> dispatch: accept
edge dasher -> track: location
edge track -> customer: live status
edge dispatch -> notify: alerts
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: DoorDash Food Delivery
customer: Customer App
dasher: Dasher App
api: API Gateway
search: Restaurant Search
order: Order Service
dispatch: Dispatch Service
track: Tracking Service
pay: Payment Service
notify: Notifications
menu: Menu Cache
db: Orders DB
geo: Geo Index

customer ─► api ─► browse
api ─► search ─► query
api ─► menu ─► read
customer ─► api ─► place order
api ─► order ─► create
order ─► pay ─► charge
order ─► db ─► persist
order ─► dispatch ─► assign
dispatch ─► geo ─► find dashers
geo ─► dispatch ─► candidates
dispatch ─► dasher ─► offer
dasher ─► dispatch ─► accept
dasher ─► track ─► location
track ─► customer ─► live status
dispatch ─► notify ─► alerts
````

## Design

### Design DoorDash / a food delivery service

There are two client surfaces (customer and dasher) fronted by an API gateway.

- Restaurant search is backed by a geospatial index and a menu cache; the order
  service creates orders, integrates payment, and persists to the orders DB.
- Dispatch matches orders to nearby dashers using the geo index, sends offers
  with a TTL, and tracks acceptances.
- The tracking service ingests dasher locations over WebSockets and streams live
  status to the customer.
- Notifications handle push and SMS.
- The hardest component is dispatch: zone-based matching, offer negotiation, and
  batching.
- Use geo hashing (S2/GeoHash) for proximity, Kafka for event-driven state
  transitions, idempotent payments, and an explicit state machine for the order
  lifecycle.

### How do you match orders to nearby dashers?

Dasher apps stream location updates into a geospatial index (S2 cells or
GeoHash) in Redis.

- On order placement, the dispatch service queries dashers within a radius and
  scores candidates by proximity, ETA, current load (active orders),
  availability, and ratings.
- Matching is auction-style: send offers with a short TTL, and assign on
  acceptance, or re-dispatch after timeout or decline.
- Zone-based partitioning keeps matching local so dispatch workers don't need
  global coordination.
- During peaks, batch stacked orders along an optimized route so one dasher
  serves multiple orders.
- The goal is to minimize order-to-accept latency while keeping dashers
  efficient and balanced across zones.

### How do you show live order tracking with low latency?

Dasher apps report GPS every few seconds over WebSockets; the tracking service
ingests these events, publishes to Kafka, and forwards updates through a
realtime hub to the customer's subscribed socket.

- Keep a publish-subscribe model keyed by order id so each customer receives
  only their order's updates, and offer short-interval polling as a fallback for
  clients that drop the socket.
- Compute ETA server-side from route and predicted speed, pushing snapshots
  rather than raw coordinates.
- Consider: filter noisy GPS readings, resume reconnects with the last-known
  position, and place realtime hubs regionally so updates travel minimal network
  distance to the customer.

### Design the order lifecycle from pickup to delivery

Model the order as an explicit state machine: created to payment authorized,
placed, preparing, ready, dasher assigned, picked up, in transit, delivered,
with failure states such as canceled, failed payment, or no dasher found.

- The order service persists state to the orders DB and emits an event per
  transition to Kafka; downstream services (dispatch, tracking, notifications,
  payment) react to those events.
- Idempotency keys protect payment retries, and timeouts drive escalation when a
  dasher doesn't accept or pickup stalls.
- Use the outbox pattern so event emission is atomic with the DB write, and
  sagas coordinate cross-service steps without distributed transactions.

### How do you handle surge demand during lunch and dinner?

Expect a 5–10x peak and plan capacity accordingly.

- Queue orders when dasher supply is short, autoscale stateless services on CPU
  and queue depth, and scale stateful stores with orders DB read replicas and
  Redis.
- Buffer spikes in Kafka so downstream consumers drain at their own pace.
- On the supply side, use demand-based surge pricing and boost-zone incentives
  to pull more dashers online, and batch stacked orders.
- Cache menu and search read paths to absorb browse traffic.
- Protect the API gateway with rate limiting and backpressure, keep payment
  idempotency intact under retry storms, and degrade gracefully with
  extended-ETA messaging rather than hard failure.

## Source

```text
title: DoorDash Food Delivery
node customer: Customer App [round, icon=browser]
node dasher: Dasher App [round, icon=browser]
node api: API Gateway [icon=server]
node search: Restaurant Search [icon=search]
node order: Order Service [icon=compute]
node dispatch: Dispatch Service [icon=worker]
node track: Tracking Service [icon=sync]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node menu: Menu Cache [cylinder, icon=cache]
node db: Orders DB [cylinder, icon=database]
node geo: Geo Index [cylinder, icon=search]

edge customer -> api: browse
edge api -> search: query
edge api -> menu: read
edge customer -> api: place order
edge api -> order: create
edge order -> pay: charge
edge order -> db: persist
edge order -> dispatch: assign
edge dispatch -> geo: find dashers
edge geo -> dispatch: candidates
edge dispatch -> dasher: offer
edge dasher -> dispatch: accept
edge dasher -> track: location
edge track -> customer: live status
edge dispatch -> notify: alerts
```

## Q&A

### Q: Design DoorDash / a food delivery service

**A:** There are two client surfaces (customer and dasher) fronted by an API gateway.

- Restaurant search is backed by a geospatial index and a menu cache; the order
  service creates orders, integrates payment, and persists to the orders DB.
- Dispatch matches orders to nearby dashers using the geo index, sends offers
  with a TTL, and tracks acceptances.
- The tracking service ingests dasher locations over WebSockets and streams live
  status to the customer.
- Notifications handle push and SMS.
- The hardest component is dispatch: zone-based matching, offer negotiation, and
  batching.
- Use geo hashing (S2/GeoHash) for proximity, Kafka for event-driven state
  transitions, idempotent payments, and an explicit state machine for the order
  lifecycle.

### Q: How do you match orders to nearby dashers?

**A:** Dasher apps stream location updates into a geospatial index (S2 cells or
GeoHash) in Redis.

- On order placement, the dispatch service queries dashers within a radius and
  scores candidates by proximity, ETA, current load (active orders),
  availability, and ratings.
- Matching is auction-style: send offers with a short TTL, and assign on
  acceptance, or re-dispatch after timeout or decline.
- Zone-based partitioning keeps matching local so dispatch workers don't need
  global coordination.
- During peaks, batch stacked orders along an optimized route so one dasher
  serves multiple orders.
- The goal is to minimize order-to-accept latency while keeping dashers
  efficient and balanced across zones.

### Q: How do you show live order tracking with low latency?

**A:** Dasher apps report GPS every few seconds over WebSockets; the tracking service
ingests these events, publishes to Kafka, and forwards updates through a
realtime hub to the customer's subscribed socket.

- Keep a publish-subscribe model keyed by order id so each customer receives
  only their order's updates, and offer short-interval polling as a fallback for
  clients that drop the socket.
- Compute ETA server-side from route and predicted speed, pushing snapshots
  rather than raw coordinates.
- Consider: filter noisy GPS readings, resume reconnects with the last-known
  position, and place realtime hubs regionally so updates travel minimal network
  distance to the customer.

### Q: Design the order lifecycle from pickup to delivery

**A:** Model the order as an explicit state machine: created to payment authorized,
placed, preparing, ready, dasher assigned, picked up, in transit, delivered,
with failure states such as canceled, failed payment, or no dasher found.

- The order service persists state to the orders DB and emits an event per
  transition to Kafka; downstream services (dispatch, tracking, notifications,
  payment) react to those events.
- Idempotency keys protect payment retries, and timeouts drive escalation when a
  dasher doesn't accept or pickup stalls.
- Use the outbox pattern so event emission is atomic with the DB write, and
  sagas coordinate cross-service steps without distributed transactions.

### Q: How do you handle surge demand during lunch and dinner?

**A:** Expect a 5–10x peak and plan capacity accordingly.

- Queue orders when dasher supply is short, autoscale stateless services on CPU
  and queue depth, and scale stateful stores with orders DB read replicas and
  Redis.
- Buffer spikes in Kafka so downstream consumers drain at their own pace.
- On the supply side, use demand-based surge pricing and boost-zone incentives
  to pull more dashers online, and batch stacked orders.
- Cache menu and search read paths to absorb browse traffic.
- Protect the API gateway with rate limiting and backpressure, keep payment
  idempotency intact under retry storms, and degrade gracefully with
  extended-ETA messaging rather than hard failure.

## Source

```text
title: DoorDash Food Delivery
node customer: Customer App [round, icon=browser]
node dasher: Dasher App [round, icon=browser]
node api: API Gateway [icon=server]
node search: Restaurant Search [icon=search]
node order: Order Service [icon=compute]
node dispatch: Dispatch Service [icon=worker]
node track: Tracking Service [icon=sync]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node menu: Menu Cache [cylinder, icon=cache]
node db: Orders DB [cylinder, icon=database]
node geo: Geo Index [cylinder, icon=search]

edge customer -> api: browse
edge api -> search: query
edge api -> menu: read
edge customer -> api: place order
edge api -> order: create
edge order -> pay: charge
edge order -> db: persist
edge order -> dispatch: assign
edge dispatch -> geo: find dashers
edge geo -> dispatch: candidates
edge dispatch -> dasher: offer
edge dasher -> dispatch: accept
edge dasher -> track: location
edge track -> customer: live status
edge dispatch -> notify: alerts
```
