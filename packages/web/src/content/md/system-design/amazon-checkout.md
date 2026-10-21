# Amazon — Checkout

Design Amazon / an e-commerce checkout flow

**Difficulty:** Easy

**Tags:** ecommerce, payments

## Functional Requirements

- Amazon / an e-commerce checkout flow
- keep inventory consistent under high concurrency?
- an order service with idempotent retries
- design a payment flow with exactly-once semantics?
- handle cart → order → payment failure recovery?

## Non-Functional Requirements

- Model checkout as an order state machine rather than one monolithic call.

- Client → API gateway → order service, which validates the cart, reserves
  inventory, computes totals, and creates an order in a pending state.
- The payment service charges the buyer (via a PSP) and the order moves to
  confirmed; only then is inventory decremented for real.
- The catalog and search are read paths served from cache; cart is a
  low-consistency, user-scoped store keyed by session/user ID.

The whole flow is driven by durable, idempotent steps:

- Each transition is retried via a workflow (e.g.
- 10 minutes) so abandoned checkouts release
  stock.
- Only a confirmed payment converts a hold into a final decrement.
- For extremely hot SKUs (Flash sales), shard or segment the quantity into
  sub-buckets and later reconcile.

Keep two notions separate: available-to-promise (reservable) versus on-hand
quantity.

- Log every reservation/consumption as an immutable inventory event so you can
  audit and reconcile drift..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Amazon Checkout
client: Client
cdn: CDN
api: API Gateway
product: Product Service
cart: Cart Service
inventory: Inventory Service
order: Order Service
payment: Payment Service
notify: Notifications
search: Search Service
db: Orders DB
cache: Catalog Cache

client ─► api ─► browse
api ─► search ─► query
api ─► product ─► details
product ─► cache ─► read / write
client ─► api ─► add to cart
api ─► cart ─► save
client ─► api ─► checkout
api ─► order ─► place order
order ─► inventory ─► reserve
inventory ─► order ─► ok / fail
order ─► payment ─► charge
payment ─► order ─► confirmation
order ─► db ─► persist
order ─► notify ─► email
```

## Design

### Design Amazon / an e-commerce checkout flow

Model checkout as an order state machine rather than one monolithic call.

- Client → API gateway → order service, which validates the cart, reserves
  inventory, computes totals, and creates an order in a pending state.
- The payment service charges the buyer (via a PSP) and the order moves to
  confirmed; only then is inventory decremented for real.
- The catalog and search are read paths served from cache; cart is a
  low-consistency, user-scoped store keyed by session/user ID.

The whole flow is driven by durable, idempotent steps:

- Each transition is retried via a workflow (e.g. Step Functions/Temporal
  style), so a crash between "payment charged" and "order confirmed" resumes
  from the recorded state instead of double-charging.
- Order data is written to an append-only orders store and read models (order
  history, seller views) are derived asynchronously.

### How do you keep inventory consistent under high concurrency?

The classic failure is overselling when many requests reserve the same SKU.

- Reserve inventory in an atomic store — Redis with a Lua-scripted decrement or
  a SQL `UPDATE ... SET qty = qty - ? WHERE sku = ? AND qty >= ?` guarded update
  — so the check-and-set is a single atomic operation, never read-then-write in
  app code.

Treat reservations as short-lived holds:

- Give each hold an expiry (e.g. 10 minutes) so abandoned checkouts release
  stock.
- Only a confirmed payment converts a hold into a final decrement.
- For extremely hot SKUs (Flash sales), shard or segment the quantity into
  sub-buckets and later reconcile.

Keep two notions separate: available-to-promise (reservable) versus on-hand
quantity.

- Log every reservation/consumption as an immutable inventory event so you can
  audit and reconcile drift.

### Design an order service with idempotent retries

Clients retry when they see a timeout, so the order service must tolerate the
same request arriving twice.

- Require an idempotency key (a client-generated UUID) for order creation and
  store it alongside the order with a unique constraint.
- On retry, look up the key first: if an order exists for it, return that order
  instead of creating a duplicate.
- Every downstream call (inventory reserve, payment, notifications) is also
  idempotent and tagged with the order/request ID, so retrying any step is safe.

Model the steps as a workflow:

- Record state transitions (created → reserved → paid → confirmed) and use a
  deterministic retry with backoff.
- A step that already succeeded is skipped, not re-run.

This makes the whole order pipeline recoverable by re-drive:

- Replay the state machine from its last committed transition.

### How do you design a payment flow with exactly-once semantics?

True exactly-once over a network is impossible to guarantee, so you design for
exactly-once _effect_ by making payments idempotent.

- The client sends a unique `payment_id`; the payment service checks an
  idempotency store before charging the PSP and returns the stored result for
  repeat calls.
- The charge itself is created once with the PSP's own idempotency key.

The money movement is recorded as immutable ledger entries (double-entry: debit
buyer, credit seller) so a replayed event cannot double-credit.

- Delivery of the result (webhook, receipt) is at-least-once with a
  consumer-side dedupe by event ID.

Handle the dangerous edge where the PSP returns a timeout after actually
charging:

- Reconcile with a reconciliation job / webhook that queries the PSP and updates
  the payment record to the true terminal state.

Recording state _before_ side effects and making each side effect idempotent is
what yields exactly-once behavior.

### How do you handle cart → order → payment failure recovery?

Treat the pipeline as a saga: a sequence of steps with compensating actions for
each failure.

- Cart read → order created (pending) → inventory reserved → payment attempted →
  confirm.

If payment fails, run the compensation:

- Release the inventory hold (or let it expire) and mark the order
  `payment_failed` so the user can retry from a known state — never silently
  drop the order.
- If the process crashes mid-way, the order's persisted state lets a workflow
  worker resume the right next step: re-attempt payment if it never reached the
  PSP, or reconcile with the PSP if the result was ambiguous.
- Return a recoverable error code to the client (e.g. "payment timed out, retry
  safe") and keep the idempotency key so the retry does not duplicate.

Finally, a periodic reconciliation job scans orders stuck in intermediate states
and either completes or compensates them.

## Source

```text
title: Amazon Checkout
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node product: Product Service [icon=search]
node cart: Cart Service [icon=file]
node inventory: Inventory Service [icon=queue]
node order: Order Service [icon=compute]
node payment: Payment Service [icon=shield]
node notify: Notifications [icon=mail]
node search: Search Service [icon=search]
node db: Orders DB [cylinder, icon=database]
node cache: Catalog Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> search: query
edge api -> product: details
edge product -> cache: read / write
edge client -> api: add to cart
edge api -> cart: save
edge client -> api: checkout
edge api -> order: place order
edge order -> inventory: reserve
edge inventory -> order: ok / fail
edge order -> payment: charge
edge payment -> order: confirmation
edge order -> db: persist
edge order -> notify: email
```

## Q&A

### Q: Design Amazon / an e-commerce checkout flow

**A:** Model checkout as an order state machine rather than one monolithic call.

- Client → API gateway → order service, which validates the cart, reserves
  inventory, computes totals, and creates an order in a pending state.
- The payment service charges the buyer (via a PSP) and the order moves to
  confirmed; only then is inventory decremented for real.
- The catalog and search are read paths served from cache; cart is a
  low-consistency, user-scoped store keyed by session/user ID.

The whole flow is driven by durable, idempotent steps:

- Each transition is retried via a workflow (e.g. Step Functions/Temporal
  style), so a crash between "payment charged" and "order confirmed" resumes
  from the recorded state instead of double-charging.
- Order data is written to an append-only orders store and read models (order
  history, seller views) are derived asynchronously.

### Q: How do you keep inventory consistent under high concurrency?

**A:** The classic failure is overselling when many requests reserve the same SKU.

- Reserve inventory in an atomic store — Redis with a Lua-scripted decrement or
  a SQL `UPDATE ... SET qty = qty - ? WHERE sku = ? AND qty >= ?` guarded update
  — so the check-and-set is a single atomic operation, never read-then-write in
  app code.

Treat reservations as short-lived holds:

- Give each hold an expiry (e.g. 10 minutes) so abandoned checkouts release
  stock.
- Only a confirmed payment converts a hold into a final decrement.
- For extremely hot SKUs (Flash sales), shard or segment the quantity into
  sub-buckets and later reconcile.

Keep two notions separate: available-to-promise (reservable) versus on-hand
quantity.

- Log every reservation/consumption as an immutable inventory event so you can
  audit and reconcile drift.

### Q: Design an order service with idempotent retries

**A:** Clients retry when they see a timeout, so the order service must tolerate the
same request arriving twice.

- Require an idempotency key (a client-generated UUID) for order creation and
  store it alongside the order with a unique constraint.
- On retry, look up the key first: if an order exists for it, return that order
  instead of creating a duplicate.
- Every downstream call (inventory reserve, payment, notifications) is also
  idempotent and tagged with the order/request ID, so retrying any step is safe.

Model the steps as a workflow:

- Record state transitions (created → reserved → paid → confirmed) and use a
  deterministic retry with backoff.
- A step that already succeeded is skipped, not re-run.

This makes the whole order pipeline recoverable by re-drive:

- Replay the state machine from its last committed transition.

### Q: How do you design a payment flow with exactly-once semantics?

**A:** True exactly-once over a network is impossible to guarantee, so you design for
exactly-once _effect_ by making payments idempotent.

- The client sends a unique `payment_id`; the payment service checks an
  idempotency store before charging the PSP and returns the stored result for
  repeat calls.
- The charge itself is created once with the PSP's own idempotency key.

The money movement is recorded as immutable ledger entries (double-entry: debit
buyer, credit seller) so a replayed event cannot double-credit.

- Delivery of the result (webhook, receipt) is at-least-once with a
  consumer-side dedupe by event ID.

Handle the dangerous edge where the PSP returns a timeout after actually
charging:

- Reconcile with a reconciliation job / webhook that queries the PSP and updates
  the payment record to the true terminal state.

Recording state _before_ side effects and making each side effect idempotent is
what yields exactly-once behavior.

### Q: How do you handle cart → order → payment failure recovery?

**A:** Treat the pipeline as a saga: a sequence of steps with compensating actions for
each failure.

- Cart read → order created (pending) → inventory reserved → payment attempted →
  confirm.

If payment fails, run the compensation:

- Release the inventory hold (or let it expire) and mark the order
  `payment_failed` so the user can retry from a known state — never silently
  drop the order.
- If the process crashes mid-way, the order's persisted state lets a workflow
  worker resume the right next step: re-attempt payment if it never reached the
  PSP, or reconcile with the PSP if the result was ambiguous.
- Return a recoverable error code to the client (e.g. "payment timed out, retry
  safe") and keep the idempotency key so the retry does not duplicate.

Finally, a periodic reconciliation job scans orders stuck in intermediate states
and either completes or compensates them.

## Source

```text
title: Amazon Checkout
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node product: Product Service [icon=search]
node cart: Cart Service [icon=file]
node inventory: Inventory Service [icon=queue]
node order: Order Service [icon=compute]
node payment: Payment Service [icon=shield]
node notify: Notifications [icon=mail]
node search: Search Service [icon=search]
node db: Orders DB [cylinder, icon=database]
node cache: Catalog Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> search: query
edge api -> product: details
edge product -> cache: read / write
edge client -> api: add to cart
edge api -> cart: save
edge client -> api: checkout
edge api -> order: place order
edge order -> inventory: reserve
edge inventory -> order: ok / fail
edge order -> payment: charge
edge payment -> order: confirmation
edge order -> db: persist
edge order -> notify: email
```
