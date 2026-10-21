# Instacart — Grocery Delivery

Design a grocery delivery service

**Difficulty:** Hard

**Tags:** delivery, ecommerce, matching

## Functional Requirements

- a grocery delivery service
- match shoppers with orders at scale?
- keep inventory in sync across stores?
- handle delivery time windows and routing?
- handle order substitutions and refunds?

## Non-Functional Requirements

- Shopper matching is an assignment problem: pair each pending order with an
  available shopper who is physically near the store, has the right vehicle
  capacity, and is on duty.

- I would model it as a two-phase system.
- A coordination layer maintains a live registry of online shoppers with their
  current GPS location, state, and active-order count.
- When an order is ready for assignment, a matcher evaluates candidate shoppers
  within a radius, ranks them by distance, utilization, and estimated readiness,
  and assigns the winner.

At scale, a single global matcher becomes a bottleneck, so I would shard by
store or fulfillment zone.

- Each zone runs its own matcher with a local view, reducing contention and
  keeping decisions geographically local.
- Pending orders wait in a zone-level queue, and shoppers report availability
  through a mobile app; a short reservation on the shopper prevents the same
  shopper from being assigned two orders simultaneously.
- The matcher also respects shopper preferences like distance caps and batch
  limits, and re-pushes orders that were not claimed within a timeout.

Assignment is only a first cut; routes and times update as shoppers move.

- When a shopper finishes a delivery, the system reassigns from the zone queue,
  so high-demand windows stay balanced.
- The tradeoff is optimality versus latency: a greedy local match delivers in
  milliseconds while a global optimizer might save minutes per route but cannot
  keep up with live movement.
- I would start greedy, measure utilization and wait times, and only add
  optimization heuristics where they clearly reduce delivery cost.
- Notifications to the shopper include the store, item count, and window, with
  an explicit accept or reject path..
- Time windows are a promise that must be jointly feasible for the store, the
  shopper, and the route.

- At order time, the system computes available windows from store capacity,
  current shopper availability, and zone load, then returns the earliest
  feasible slot.
- I would model windows as capacity units: each store-zone pair has a number of
  delivery slots per window, decremented on reservation and released on
  cancellation, which prevents overselling the promise while shoppers can still
  batch deliveries.
- Fees vary by window and zone, which naturally shapes demand toward off-peak
  slots and makes the scheduling model self-balancing.

Routing is a vehicle routing problem with time windows solved by the delivery
routing service.

- For a small fleet per zone I would use an exact or heuristic solver that
  sequences stops by due time and travel time; as zones scale, cluster-first,
  route-second keeps solver time bounded.
- Live GPS positions feed the router so delays on one stop automatically
  re-optimize the remaining stops rather than blindly following the original
  plan.
- Travel time estimates come from historical map data rather than live traffic
  alone, so plan times are stable even when current conditions are noisy.

Because routing decisions happen after checkout, the system only needs soft
constraints at booking time.

- I would keep route planning asynchronous, then expose the customer's live
  position and ETA through notifications.
- The key failure case is traffic or a missing item late in the route; the
  router re-plans, and the notification service explains the delay honestly,
  since a credible ETA matters more than a perfect route.
- Each store also caps concurrent shoppers to avoid crowding the aisles..
- Substitutions are the defining edge case of grocery delivery: the shopper cannot
  find an item and must decide whether to swap it or refund it.

- I would encode per-item substitution preferences chosen by the customer (allow
  similar, allow any, or refund only) and let the shopper app make the decision
  against the live inventory snapshot.
- The shopper scans the replacement barcode, and the order service revalidates
  the price difference against the customer's saved payment method.
- Real-time availability inside the store comes from the shopper's own scan
  events, which is more accurate than any forecast, so the app blocks impossible
  choices before they are presented.

Refunds for missing or substituted items flow through the payment service as a
partial refund keyed by the original order, with the reason recorded for
analytics.

- I would apply refunds automatically for refund-only items and require a
  one-tap confirmation for substitutions that change price materially.
- Because refunds are post-delivery, the order service must track line-level
  state, so the snapshot model keeps every item's planned and actual identity,
  quantity, and price.
- No-show shoppers and order abandonments also release reserved stock through
  the same line-level state machine.

The system should also learn from substitution patterns.

- Repeat stock-outs of an item across stores raise it in the replenishment feed,
  and items frequently substituted downward get demoted in the catalog to avoid
  disappointing customers.
- A nightly reconciliation ensures that every delivered line has either a
  matching charge or a refund, and any mismatch is flagged to a finance queue.
- Notifications keep the customer informed during the swap decision window, so
  nothing silently changes on the receipt.
- This keeps the trust layer of the product (accurate receipts) intact at scale.

## Source

````text
title: Grocery Delivery
node customer: Customer [round, icon=browser]
node app: Store App [icon=browser]
node gateway: API Gateway [icon=server]
node catalog: Catalog [icon=search]
node cart: Cart Service [icon=compute]
node order: Order Service [icon=compute]
node inventory: Inventory Sync [icon=sync]
node shopper: Shopper Matching [icon=users]
node route: Delivery Routing [icon=compute]
node payment: Payment [icon=shield]
node notify: Notifications [icon=message]
node db: Orders DB [cylinder, icon=database]

edge customer -> app: shop
edge app -> gateway: add to cart
edge gateway -> cart: items
edge cart -> catalog: prices
edge gateway -> order: checkout
edge order -> inventory: check stock
edge order -> shopper: assign
edge shopper -> route: plan
edge order -> payment: charge
edge order -> db: store
edge payment -> notify: receipt
edge order -> notify: status
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Grocery Delivery
customer: Customer
app: Store App
gateway: API Gateway
catalog: Catalog
cart: Cart Service
order: Order Service
inventory: Inventory Sync
shopper: Shopper Matching
route: Delivery Routing
payment: Payment
notify: Notifications
db: Orders DB

customer ─► app ─► shop
app ─► gateway ─► add to cart
gateway ─► cart ─► items
cart ─► catalog ─► prices
gateway ─► order ─► checkout
order ─► inventory ─► check stock
order ─► shopper ─► assign
shopper ─► route ─► plan
order ─► payment ─► charge
order ─► db ─► store
payment ─► notify ─► receipt
order ─► notify ─► status
````

## Design

### Design a grocery delivery service

A grocery delivery service is a marketplace that combines an e-commerce catalog
with a logistics problem: picking items from physical stores and delivering them
within a promised window.

- I would structure it as an API gateway in front of domain services (catalog,
  cart, order, inventory sync, shopper matching, delivery routing) backed by an
  Orders DB and a notification service.
- I would also keep menu and per-store pricing separate so a chain with regional
  pricing can serve one catalog across many stores.
- The catalog is read-heavy and cached; the cart is a short-lived session store;
  orders own the state machine from placed to delivered.

The checkout flow calls the order service, which validates stock through the
inventory sync layer, assigns a shopper, plans a route, and charges payment
before persisting.

- Because stores run independent point-of-sale systems, inventory is a sync
  problem rather than a single database: per-store counts stream in from store
  systems and are reconciled continuously, with conservative safety buffers so
  an order never asks a shopper to pick items that are not actually on the
  shelf.

The hard scaling questions are geographic: order volume concentrates in dense
urban zones during evening windows.

- Sharding the Orders DB by region and routing requests by store zone keeps hot
  data local.
- The design deliberately separates synchronous order capture from asynchronous
  fulfillment so a checkout never waits on route planning or shopper assignment,
  and notifications push status changes to the customer.
- Metrics that matter are order-to-door time, substitution rate, and shopper
  utilization; a metrics pipeline feeds capacity planning and the dynamic fees
  shown at checkout.

### How do you match shoppers with orders at scale?

Shopper matching is an assignment problem: pair each pending order with an
available shopper who is physically near the store, has the right vehicle
capacity, and is on duty.

- I would model it as a two-phase system.
- A coordination layer maintains a live registry of online shoppers with their
  current GPS location, state, and active-order count.
- When an order is ready for assignment, a matcher evaluates candidate shoppers
  within a radius, ranks them by distance, utilization, and estimated readiness,
  and assigns the winner.

At scale, a single global matcher becomes a bottleneck, so I would shard by
store or fulfillment zone.

- Each zone runs its own matcher with a local view, reducing contention and
  keeping decisions geographically local.
- Pending orders wait in a zone-level queue, and shoppers report availability
  through a mobile app; a short reservation on the shopper prevents the same
  shopper from being assigned two orders simultaneously.
- The matcher also respects shopper preferences like distance caps and batch
  limits, and re-pushes orders that were not claimed within a timeout.

Assignment is only a first cut; routes and times update as shoppers move.

- When a shopper finishes a delivery, the system reassigns from the zone queue,
  so high-demand windows stay balanced.
- The tradeoff is optimality versus latency: a greedy local match delivers in
  milliseconds while a global optimizer might save minutes per route but cannot
  keep up with live movement.
- I would start greedy, measure utilization and wait times, and only add
  optimization heuristics where they clearly reduce delivery cost.
- Notifications to the shopper include the store, item count, and window, with
  an explicit accept or reject path.

### How do you keep inventory in sync across stores?

Stores do not share one inventory system, so sync is the hard part.

- Each store pushes counts from its point-of-sale and shelf systems to the
  inventory sync layer through a CDC pipeline or periodic batch uploads.
- I would model inventory as per-store, per-item on-hand counts with an event
  stream, and maintain both a transactional snapshot for order validation and a
  read model for the catalog UI that shows in-stock badges per store.
- The event stream is also the source for analytics like best sellers per store
  and for predicting demand, which feeds automated replenishment suggestions
  back to store managers.

Because store feeds are noisy and lag behind reality, I would add safety
buffers.

- The system treats reported on-hand counts as an upper bound and applies a
  small shrinkage factor, and an order only commits stock with a soft
  reservation that the shopper confirms by scanning the item in the store.
- Reconciliation jobs compare order captures, returns, and waste against the
  store feed nightly, adjusting buffers where drift is persistent.
- Item substitutions during picking update the snapshot in the same flow, so the
  customer's final receipt always reflects what was actually bagged.

The tradeoff is freshness versus correctness.

- Live sync gives better conversion, but store systems fail; I would degrade
  gracefully by marking a store's items as lower confidence and hiding low-stock
  items rather than overselling.
- Cross-store transfers, delisted items, and price changes all flow through the
  same event stream so the catalog, cart, and order services stay consistent
  without a shared database.
- Inventory events are idempotent and keyed by item and store, so replays from a
  temporarily offline feed do not corrupt counts.

### How do you handle delivery time windows and routing?

Time windows are a promise that must be jointly feasible for the store, the
shopper, and the route.

- At order time, the system computes available windows from store capacity,
  current shopper availability, and zone load, then returns the earliest
  feasible slot.
- I would model windows as capacity units: each store-zone pair has a number of
  delivery slots per window, decremented on reservation and released on
  cancellation, which prevents overselling the promise while shoppers can still
  batch deliveries.
- Fees vary by window and zone, which naturally shapes demand toward off-peak
  slots and makes the scheduling model self-balancing.

Routing is a vehicle routing problem with time windows solved by the delivery
routing service.

- For a small fleet per zone I would use an exact or heuristic solver that
  sequences stops by due time and travel time; as zones scale, cluster-first,
  route-second keeps solver time bounded.
- Live GPS positions feed the router so delays on one stop automatically
  re-optimize the remaining stops rather than blindly following the original
  plan.
- Travel time estimates come from historical map data rather than live traffic
  alone, so plan times are stable even when current conditions are noisy.

Because routing decisions happen after checkout, the system only needs soft
constraints at booking time.

- I would keep route planning asynchronous, then expose the customer's live
  position and ETA through notifications.
- The key failure case is traffic or a missing item late in the route; the
  router re-plans, and the notification service explains the delay honestly,
  since a credible ETA matters more than a perfect route.
- Each store also caps concurrent shoppers to avoid crowding the aisles.

### How do you handle order substitutions and refunds?

Substitutions are the defining edge case of grocery delivery: the shopper cannot
find an item and must decide whether to swap it or refund it.

- I would encode per-item substitution preferences chosen by the customer (allow
  similar, allow any, or refund only) and let the shopper app make the decision
  against the live inventory snapshot.
- The shopper scans the replacement barcode, and the order service revalidates
  the price difference against the customer's saved payment method.
- Real-time availability inside the store comes from the shopper's own scan
  events, which is more accurate than any forecast, so the app blocks impossible
  choices before they are presented.

Refunds for missing or substituted items flow through the payment service as a
partial refund keyed by the original order, with the reason recorded for
analytics.

- I would apply refunds automatically for refund-only items and require a
  one-tap confirmation for substitutions that change price materially.
- Because refunds are post-delivery, the order service must track line-level
  state, so the snapshot model keeps every item's planned and actual identity,
  quantity, and price.
- No-show shoppers and order abandonments also release reserved stock through
  the same line-level state machine.

The system should also learn from substitution patterns.

- Repeat stock-outs of an item across stores raise it in the replenishment feed,
  and items frequently substituted downward get demoted in the catalog to avoid
  disappointing customers.
- A nightly reconciliation ensures that every delivered line has either a
  matching charge or a refund, and any mismatch is flagged to a finance queue.
- Notifications keep the customer informed during the swap decision window, so
  nothing silently changes on the receipt.
- This keeps the trust layer of the product (accurate receipts) intact at scale.

## Source

```text
title: Grocery Delivery
node customer: Customer [round, icon=browser]
node app: Store App [icon=browser]
node gateway: API Gateway [icon=server]
node catalog: Catalog [icon=search]
node cart: Cart Service [icon=compute]
node order: Order Service [icon=compute]
node inventory: Inventory Sync [icon=sync]
node shopper: Shopper Matching [icon=users]
node route: Delivery Routing [icon=compute]
node payment: Payment [icon=shield]
node notify: Notifications [icon=message]
node db: Orders DB [cylinder, icon=database]

edge customer -> app: shop
edge app -> gateway: add to cart
edge gateway -> cart: items
edge cart -> catalog: prices
edge gateway -> order: checkout
edge order -> inventory: check stock
edge order -> shopper: assign
edge shopper -> route: plan
edge order -> payment: charge
edge order -> db: store
edge payment -> notify: receipt
edge order -> notify: status
```

## Q&A

### Q: Design a grocery delivery service

**A:** A grocery delivery service is a marketplace that combines an e-commerce catalog
with a logistics problem: picking items from physical stores and delivering them
within a promised window.

- I would structure it as an API gateway in front of domain services (catalog,
  cart, order, inventory sync, shopper matching, delivery routing) backed by an
  Orders DB and a notification service.
- I would also keep menu and per-store pricing separate so a chain with regional
  pricing can serve one catalog across many stores.
- The catalog is read-heavy and cached; the cart is a short-lived session store;
  orders own the state machine from placed to delivered.

The checkout flow calls the order service, which validates stock through the
inventory sync layer, assigns a shopper, plans a route, and charges payment
before persisting.

- Because stores run independent point-of-sale systems, inventory is a sync
  problem rather than a single database: per-store counts stream in from store
  systems and are reconciled continuously, with conservative safety buffers so
  an order never asks a shopper to pick items that are not actually on the
  shelf.

The hard scaling questions are geographic: order volume concentrates in dense
urban zones during evening windows.

- Sharding the Orders DB by region and routing requests by store zone keeps hot
  data local.
- The design deliberately separates synchronous order capture from asynchronous
  fulfillment so a checkout never waits on route planning or shopper assignment,
  and notifications push status changes to the customer.
- Metrics that matter are order-to-door time, substitution rate, and shopper
  utilization; a metrics pipeline feeds capacity planning and the dynamic fees
  shown at checkout.

### Q: How do you match shoppers with orders at scale?

**A:** Shopper matching is an assignment problem: pair each pending order with an
available shopper who is physically near the store, has the right vehicle
capacity, and is on duty.

- I would model it as a two-phase system.
- A coordination layer maintains a live registry of online shoppers with their
  current GPS location, state, and active-order count.
- When an order is ready for assignment, a matcher evaluates candidate shoppers
  within a radius, ranks them by distance, utilization, and estimated readiness,
  and assigns the winner.

At scale, a single global matcher becomes a bottleneck, so I would shard by
store or fulfillment zone.

- Each zone runs its own matcher with a local view, reducing contention and
  keeping decisions geographically local.
- Pending orders wait in a zone-level queue, and shoppers report availability
  through a mobile app; a short reservation on the shopper prevents the same
  shopper from being assigned two orders simultaneously.
- The matcher also respects shopper preferences like distance caps and batch
  limits, and re-pushes orders that were not claimed within a timeout.

Assignment is only a first cut; routes and times update as shoppers move.

- When a shopper finishes a delivery, the system reassigns from the zone queue,
  so high-demand windows stay balanced.
- The tradeoff is optimality versus latency: a greedy local match delivers in
  milliseconds while a global optimizer might save minutes per route but cannot
  keep up with live movement.
- I would start greedy, measure utilization and wait times, and only add
  optimization heuristics where they clearly reduce delivery cost.
- Notifications to the shopper include the store, item count, and window, with
  an explicit accept or reject path.

### Q: How do you keep inventory in sync across stores?

**A:** Stores do not share one inventory system, so sync is the hard part.

- Each store pushes counts from its point-of-sale and shelf systems to the
  inventory sync layer through a CDC pipeline or periodic batch uploads.
- I would model inventory as per-store, per-item on-hand counts with an event
  stream, and maintain both a transactional snapshot for order validation and a
  read model for the catalog UI that shows in-stock badges per store.
- The event stream is also the source for analytics like best sellers per store
  and for predicting demand, which feeds automated replenishment suggestions
  back to store managers.

Because store feeds are noisy and lag behind reality, I would add safety
buffers.

- The system treats reported on-hand counts as an upper bound and applies a
  small shrinkage factor, and an order only commits stock with a soft
  reservation that the shopper confirms by scanning the item in the store.
- Reconciliation jobs compare order captures, returns, and waste against the
  store feed nightly, adjusting buffers where drift is persistent.
- Item substitutions during picking update the snapshot in the same flow, so the
  customer's final receipt always reflects what was actually bagged.

The tradeoff is freshness versus correctness.

- Live sync gives better conversion, but store systems fail; I would degrade
  gracefully by marking a store's items as lower confidence and hiding low-stock
  items rather than overselling.
- Cross-store transfers, delisted items, and price changes all flow through the
  same event stream so the catalog, cart, and order services stay consistent
  without a shared database.
- Inventory events are idempotent and keyed by item and store, so replays from a
  temporarily offline feed do not corrupt counts.

### Q: How do you handle delivery time windows and routing?

**A:** Time windows are a promise that must be jointly feasible for the store, the
shopper, and the route.

- At order time, the system computes available windows from store capacity,
  current shopper availability, and zone load, then returns the earliest
  feasible slot.
- I would model windows as capacity units: each store-zone pair has a number of
  delivery slots per window, decremented on reservation and released on
  cancellation, which prevents overselling the promise while shoppers can still
  batch deliveries.
- Fees vary by window and zone, which naturally shapes demand toward off-peak
  slots and makes the scheduling model self-balancing.

Routing is a vehicle routing problem with time windows solved by the delivery
routing service.

- For a small fleet per zone I would use an exact or heuristic solver that
  sequences stops by due time and travel time; as zones scale, cluster-first,
  route-second keeps solver time bounded.
- Live GPS positions feed the router so delays on one stop automatically
  re-optimize the remaining stops rather than blindly following the original
  plan.
- Travel time estimates come from historical map data rather than live traffic
  alone, so plan times are stable even when current conditions are noisy.

Because routing decisions happen after checkout, the system only needs soft
constraints at booking time.

- I would keep route planning asynchronous, then expose the customer's live
  position and ETA through notifications.
- The key failure case is traffic or a missing item late in the route; the
  router re-plans, and the notification service explains the delay honestly,
  since a credible ETA matters more than a perfect route.
- Each store also caps concurrent shoppers to avoid crowding the aisles.

### Q: How do you handle order substitutions and refunds?

**A:** Substitutions are the defining edge case of grocery delivery: the shopper cannot
find an item and must decide whether to swap it or refund it.

- I would encode per-item substitution preferences chosen by the customer (allow
  similar, allow any, or refund only) and let the shopper app make the decision
  against the live inventory snapshot.
- The shopper scans the replacement barcode, and the order service revalidates
  the price difference against the customer's saved payment method.
- Real-time availability inside the store comes from the shopper's own scan
  events, which is more accurate than any forecast, so the app blocks impossible
  choices before they are presented.

Refunds for missing or substituted items flow through the payment service as a
partial refund keyed by the original order, with the reason recorded for
analytics.

- I would apply refunds automatically for refund-only items and require a
  one-tap confirmation for substitutions that change price materially.
- Because refunds are post-delivery, the order service must track line-level
  state, so the snapshot model keeps every item's planned and actual identity,
  quantity, and price.
- No-show shoppers and order abandonments also release reserved stock through
  the same line-level state machine.

The system should also learn from substitution patterns.

- Repeat stock-outs of an item across stores raise it in the replenishment feed,
  and items frequently substituted downward get demoted in the catalog to avoid
  disappointing customers.
- A nightly reconciliation ensures that every delivered line has either a
  matching charge or a refund, and any mismatch is flagged to a finance queue.
- Notifications keep the customer informed during the swap decision window, so
  nothing silently changes on the receipt.
- This keeps the trust layer of the product (accurate receipts) intact at scale.

## Source

```text
title: Grocery Delivery
node customer: Customer [round, icon=browser]
node app: Store App [icon=browser]
node gateway: API Gateway [icon=server]
node catalog: Catalog [icon=search]
node cart: Cart Service [icon=compute]
node order: Order Service [icon=compute]
node inventory: Inventory Sync [icon=sync]
node shopper: Shopper Matching [icon=users]
node route: Delivery Routing [icon=compute]
node payment: Payment [icon=shield]
node notify: Notifications [icon=message]
node db: Orders DB [cylinder, icon=database]

edge customer -> app: shop
edge app -> gateway: add to cart
edge gateway -> cart: items
edge cart -> catalog: prices
edge gateway -> order: checkout
edge order -> inventory: check stock
edge order -> shopper: assign
edge shopper -> route: plan
edge order -> payment: charge
edge order -> db: store
edge payment -> notify: receipt
edge order -> notify: status
```
