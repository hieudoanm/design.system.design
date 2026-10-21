# Shopify — E-commerce Platform

Design an e-commerce platform

**Difficulty:** Hard

**Tags:** ecommerce, payments

## Functional Requirements

- an e-commerce platform
- model products, variants, and inventory?
- keep the cart consistent under concurrency?
- process payments safely?
- scale flash-sale traffic?

## Non-Functional Requirements

- Break the platform into focused services behind an API gateway.

- The `Storefront` renders the catalog from the `Catalog Service`, which pulls
  products and variants from a read-optimized store and indexes them into
  `Product Search` for faceted queries.
- Buyers manage a `Cart Service` — Redis-backed, one cart per buyer — and
  checkout goes through the `Order Service`, the orchestrator.
- On order placement the system reserves inventory in the `Inventory Service`,
  charges the `Payment Service`, hands off to the `Shipping Service` for
  fulfillment, sends a receipt via `Notifications`, and persists the order in
  `Orders DB`.
- This is a write path: each step must be idempotent and retryable, with the
  order advancing through an explicit state machine (pending, confirmed,
  fulfilled, refunded).

Separate the read path from the write path.

- Browsing and search are read-heavy and hit caches and the search index, while
  checkout mutations serialize on the order pipeline.
- The trade-off of splitting into services is independent scaling — the catalog
  can be aggressively cached and fronted by a `CDN` while the order path scales
  separately — but it costs distributed-transaction complexity.
- You solve multi-service consistency with sagas and an outbox pattern rather
  than 2PC: each step commits its local change and emits an event; a
  compensating action rolls back on failure.
- An order is created in `pending`, then confirmed only after inventory
  reservation and payment both succeed; any failure triggers compensation
  (release the reservation, void the authorization).
- The result is a system that never shows a buyer a confirmed order that was not
  actually paid and reserved..
- A product is a logical grouping — a t-shirt — and owns shared attributes like
  title, brand, and description.

- Variants carry the sellable, priceable units: size, color, SKU, and barcode,
  so a product has N variants, each with its own price and inventory.
- Inventory is tracked per variant (or per SKU-plus-warehouse for
  multi-warehouse sellers), because availability is what checkout actually
  validates.
- The schema is roughly `product(id, title, description, status)`,
  `variant(id, product_id, sku, price, attributes)`,
  `inventory(variant_id, warehouse_id, on_hand, reserved)`.
- The critical relationship is that available stock equals `on_hand - reserved`,
  and that computed value must be enforced atomically at checkout, not derived
  lazily.

The oversell problem is solved with a guarded atomic decrement.

- Use a SQL statement of the form
  `UPDATE inventory SET reserved=reserved+1 WHERE id=? AND on_hand-reserved>=?`
  — the `WHERE` clause makes the reservation fail cleanly when stock runs out,
  so two concurrent checkouts cannot both take the last unit.
- Because high-frequency stock checks cannot hit the relational DB on every page
  view, keep hot availability counters in `Redis` (e.g., `DECR`-style), serve
  those to the storefront, and reconcile periodically against the durable
  `Inventory Service` as source of truth.
- Trade-offs: in-memory counters are fast but can drift on crashes, so you need
  a reconciliation job and a conservative buffer — the `Redis` counter reserves
  a margin and the authoritative DB is the final arbiter at order confirmation.

Also model which warehouses can fulfill which orders and track per-location
quantities, so checkout can pick a fulfillment source and regional storefronts
can show local availability.

- This turns the availability query into a join across locations, which the
  `Redis` counter summarizes per region to keep the read path fast.
- Keep the model normalized enough to be correct and denormalized enough to be
  fast — the schema is the contract between catalog, cart, and fulfillment, so
  changing it later is expensive..
- A cart is read-heavy, append-focused state keyed by `buyer_id`, best held in
  `Redis` as a hash (`HSET cart:{id} variant_id qty`) with a TTL so abandoned
  carts expire.

- The consistency risk concentrates at checkout: a buyer can be adding or
  modifying items in multiple tabs while checkout is reading the cart, and
  concurrent checkouts must not double-charge.
- Handle reads as a single snapshot (`HGETALL`) and, at checkout, atomically
  transition the cart to a locked state via `SETNX cart:{id}:lock` with a short
  TTL — the loser fails fast with a retryable error instead of proceeding.
- Validate every cart line against current price and availability before
  charging: prices change and stock sells, so the amounts shown earlier may be
  stale.

The `Order Service` serializes finalization.

- If payment fails or inventory cannot be reserved, unlock the cart and mark the
  order failed so the buyer can retry with a fresh attempt.
- Use a per-cart version counter (`INCR`) so a client sending a stale cart is
  rejected, and treat ordinary cart mutations as last-writer-wins while strict
  serialization applies only across the lock boundary.
- Two edge cases matter: an item added after checkout started must not silently
  appear in the frozen order (re-read after lock), and a cart with an item that
  became unavailable should prompt the buyer rather than fail the whole order.
- This gives buyers responsive browsing and sellers a guarantee that every
  charged order matches exactly the cart the buyer confirmed.

One more consistency knob: reconcile cart contents against the catalog on read,
not on write.

- If a product goes inactive or a price changes, refresh the displayed line and
  surface the change to the buyer at checkout review rather than failing at
  payment.
- This keeps the happy path fast and moves rare inconsistencies to a visible,
  recoverable point instead of a surprise failure at the card step..
- A flash sale concentrates demand on a few SKUs in minutes, so the strategy is to
  absorb reads with cache and serialize writes tightly.

- Cache the hot product page and its live availability in `Redis` (and
  edge-cache the page via `CDN`) so the storefront never re-renders from origin
  at peak; browsers poll or the storefront pushes availability deltas instead of
  each request triggering a backend round trip.
- Rate-limit the buy button client-side and at the gateway so a single user
  cannot hammer the reserve endpoint.

For writes, admit only N concurrent reservations for the hot SKU.

- Use a distributed pre-sale counter (`INCR` + `EXPIRE` in `Redis`) or a per-SKU
  lock so the `Inventory Service` never sees a stampede.
- Oversubscribe slightly — let the authoritative inventory reserve be the final
  arbiter — and reject cleanly with `sold out` once the cap is hit.
- Make order creation asynchronous: the gateway accepts, decrements the
  reservation, enqueues the order, and returns a processing status instead of
  blocking the request on synchronous payment and DB work; a worker drains the
  queue and confirms.
- Use `circuit breakers` so a slow payment provider degrades the sale (orders
  hold in `pending`) rather than cascading failures.
- Load-test the hot path at projected peak, pre-provision the queue and workers
  ahead of the drop, and treat the flash-sale path as a separate, smaller system
  — one optimized for a million concurrent browsers but only a few thousand
  actual sales.

Finally, instrument the flash-sale path end to end.

- Measure reservation latency, queue depth, and conversion (views to sale) in
  real time, so a degraded payment provider or a misconfigured cap is visible
  while the sale is live.
- A flash sale that fails is a brand event, so you want the ability to cut over
  to a backup provider or extend the sale window without redeploying.

## Source

````text
title: E-commerce Platform
node buyer: Buyer [round, icon=browser]
node store: Storefront [icon=browser]
node api: API Gateway [icon=server]
node catalog: Catalog Service [icon=search]
node cart: Cart Service [icon=cache]
node order: Order Service [icon=compute]
node inv: Inventory Service [icon=file]
node pay: Payment Service [icon=shield]
node ship: Shipping Service [icon=worker]
node notify: Notifications [icon=mail]
node db: Orders DB [cylinder, icon=database]
node search: Product Search [icon=search]

edge buyer -> store: browse
edge store -> catalog: products
edge buyer -> cart: add
edge cart -> api: checkout
edge api -> order: place
edge order -> inv: reserve
edge order -> pay: charge
edge order -> ship: fulfill
edge order -> notify: receipt
edge order -> db: persist
edge store -> search: query
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: E-commerce Platform
buyer: Buyer
store: Storefront
api: API Gateway
catalog: Catalog Service
cart: Cart Service
order: Order Service
inv: Inventory Service
pay: Payment Service
ship: Shipping Service
notify: Notifications
db: Orders DB
search: Product Search

buyer ─► store ─► browse
store ─► catalog ─► products
buyer ─► cart ─► add
cart ─► api ─► checkout
api ─► order ─► place
order ─► inv ─► reserve
order ─► pay ─► charge
order ─► ship ─► fulfill
order ─► notify ─► receipt
order ─► db ─► persist
store ─► search ─► query
````

## Design

### Design an e-commerce platform

Break the platform into focused services behind an API gateway.

- The `Storefront` renders the catalog from the `Catalog Service`, which pulls
  products and variants from a read-optimized store and indexes them into
  `Product Search` for faceted queries.
- Buyers manage a `Cart Service` — Redis-backed, one cart per buyer — and
  checkout goes through the `Order Service`, the orchestrator.
- On order placement the system reserves inventory in the `Inventory Service`,
  charges the `Payment Service`, hands off to the `Shipping Service` for
  fulfillment, sends a receipt via `Notifications`, and persists the order in
  `Orders DB`.
- This is a write path: each step must be idempotent and retryable, with the
  order advancing through an explicit state machine (pending, confirmed,
  fulfilled, refunded).

Separate the read path from the write path.

- Browsing and search are read-heavy and hit caches and the search index, while
  checkout mutations serialize on the order pipeline.
- The trade-off of splitting into services is independent scaling — the catalog
  can be aggressively cached and fronted by a `CDN` while the order path scales
  separately — but it costs distributed-transaction complexity.
- You solve multi-service consistency with sagas and an outbox pattern rather
  than 2PC: each step commits its local change and emits an event; a
  compensating action rolls back on failure.
- An order is created in `pending`, then confirmed only after inventory
  reservation and payment both succeed; any failure triggers compensation
  (release the reservation, void the authorization).
- The result is a system that never shows a buyer a confirmed order that was not
  actually paid and reserved.

### How do you model products, variants, and inventory?

A product is a logical grouping — a t-shirt — and owns shared attributes like
title, brand, and description.

- Variants carry the sellable, priceable units: size, color, SKU, and barcode,
  so a product has N variants, each with its own price and inventory.
- Inventory is tracked per variant (or per SKU-plus-warehouse for
  multi-warehouse sellers), because availability is what checkout actually
  validates.
- The schema is roughly `product(id, title, description, status)`,
  `variant(id, product_id, sku, price, attributes)`,
  `inventory(variant_id, warehouse_id, on_hand, reserved)`.
- The critical relationship is that available stock equals `on_hand - reserved`,
  and that computed value must be enforced atomically at checkout, not derived
  lazily.

The oversell problem is solved with a guarded atomic decrement.

- Use a SQL statement of the form
  `UPDATE inventory SET reserved=reserved+1 WHERE id=? AND on_hand-reserved>=?`
  — the `WHERE` clause makes the reservation fail cleanly when stock runs out,
  so two concurrent checkouts cannot both take the last unit.
- Because high-frequency stock checks cannot hit the relational DB on every page
  view, keep hot availability counters in `Redis` (e.g., `DECR`-style), serve
  those to the storefront, and reconcile periodically against the durable
  `Inventory Service` as source of truth.
- Trade-offs: in-memory counters are fast but can drift on crashes, so you need
  a reconciliation job and a conservative buffer — the `Redis` counter reserves
  a margin and the authoritative DB is the final arbiter at order confirmation.

Also model which warehouses can fulfill which orders and track per-location
quantities, so checkout can pick a fulfillment source and regional storefronts
can show local availability.

- This turns the availability query into a join across locations, which the
  `Redis` counter summarizes per region to keep the read path fast.
- Keep the model normalized enough to be correct and denormalized enough to be
  fast — the schema is the contract between catalog, cart, and fulfillment, so
  changing it later is expensive.

### How do you keep the cart consistent under concurrency?

A cart is read-heavy, append-focused state keyed by `buyer_id`, best held in
`Redis` as a hash (`HSET cart:{id} variant_id qty`) with a TTL so abandoned
carts expire.

- The consistency risk concentrates at checkout: a buyer can be adding or
  modifying items in multiple tabs while checkout is reading the cart, and
  concurrent checkouts must not double-charge.
- Handle reads as a single snapshot (`HGETALL`) and, at checkout, atomically
  transition the cart to a locked state via `SETNX cart:{id}:lock` with a short
  TTL — the loser fails fast with a retryable error instead of proceeding.
- Validate every cart line against current price and availability before
  charging: prices change and stock sells, so the amounts shown earlier may be
  stale.

The `Order Service` serializes finalization.

- If payment fails or inventory cannot be reserved, unlock the cart and mark the
  order failed so the buyer can retry with a fresh attempt.
- Use a per-cart version counter (`INCR`) so a client sending a stale cart is
  rejected, and treat ordinary cart mutations as last-writer-wins while strict
  serialization applies only across the lock boundary.
- Two edge cases matter: an item added after checkout started must not silently
  appear in the frozen order (re-read after lock), and a cart with an item that
  became unavailable should prompt the buyer rather than fail the whole order.
- This gives buyers responsive browsing and sellers a guarantee that every
  charged order matches exactly the cart the buyer confirmed.

One more consistency knob: reconcile cart contents against the catalog on read,
not on write.

- If a product goes inactive or a price changes, refresh the displayed line and
  surface the change to the buyer at checkout review rather than failing at
  payment.
- This keeps the happy path fast and moves rare inconsistencies to a visible,
  recoverable point instead of a surprise failure at the card step.

### How do you process payments safely?

Never charge before reserving inventory, never trust client-supplied totals, and
never let a retry double-charge.

- The `Order Service` computes the authoritative amount and passes an
  idempotency key (the order id) to the `Payment Service`, which calls the PSP
  (Stripe, Adyen) with an idempotent payment intent — retrying with the same key
  cannot create a second charge.
- Do not trust the synchronous redirect response for settlement; the PSP's
  confirmation arrives via webhook, and the webhook is what advances the order
  to `paid`.
- Maintain a payment ledger with status transitions (authorized, captured,
  refunded) so every money movement is auditable and reconcilable.

Security is about shrinking the attack surface.

- PCI DSS scope is reduced by tokenization: the platform stores PSP-issued
  tokens, never raw card numbers or CVVs, and card-entry UI is rendered by the
  PSP's hosted fields.
- On failure, be careful with timeouts: if the PSP call times out, poll the PSP
  for the actual payment status instead of assuming success or failure, then
  reconcile against the ledger.
- Provide a first-class refund path driven by the ledger and webhooks, since
  refunds have their own lifecycles and can be partial.
- Finally, run a daily reconciliation job that compares ledger totals against
  PSP settlement statements, because drift between the two is how fraud and
  accounting errors hide.
- The invariant the whole design protects: one order id maps to exactly one net
  charge, and the ledger is the single record of truth that both the buyer and
  finance teams read.

### How do you scale flash-sale traffic?

A flash sale concentrates demand on a few SKUs in minutes, so the strategy is to
absorb reads with cache and serialize writes tightly.

- Cache the hot product page and its live availability in `Redis` (and
  edge-cache the page via `CDN`) so the storefront never re-renders from origin
  at peak; browsers poll or the storefront pushes availability deltas instead of
  each request triggering a backend round trip.
- Rate-limit the buy button client-side and at the gateway so a single user
  cannot hammer the reserve endpoint.

For writes, admit only N concurrent reservations for the hot SKU.

- Use a distributed pre-sale counter (`INCR` + `EXPIRE` in `Redis`) or a per-SKU
  lock so the `Inventory Service` never sees a stampede.
- Oversubscribe slightly — let the authoritative inventory reserve be the final
  arbiter — and reject cleanly with `sold out` once the cap is hit.
- Make order creation asynchronous: the gateway accepts, decrements the
  reservation, enqueues the order, and returns a processing status instead of
  blocking the request on synchronous payment and DB work; a worker drains the
  queue and confirms.
- Use `circuit breakers` so a slow payment provider degrades the sale (orders
  hold in `pending`) rather than cascading failures.
- Load-test the hot path at projected peak, pre-provision the queue and workers
  ahead of the drop, and treat the flash-sale path as a separate, smaller system
  — one optimized for a million concurrent browsers but only a few thousand
  actual sales.

Finally, instrument the flash-sale path end to end.

- Measure reservation latency, queue depth, and conversion (views to sale) in
  real time, so a degraded payment provider or a misconfigured cap is visible
  while the sale is live.
- A flash sale that fails is a brand event, so you want the ability to cut over
  to a backup provider or extend the sale window without redeploying.

## Source

```text
title: E-commerce Platform
node buyer: Buyer [round, icon=browser]
node store: Storefront [icon=browser]
node api: API Gateway [icon=server]
node catalog: Catalog Service [icon=search]
node cart: Cart Service [icon=cache]
node order: Order Service [icon=compute]
node inv: Inventory Service [icon=file]
node pay: Payment Service [icon=shield]
node ship: Shipping Service [icon=worker]
node notify: Notifications [icon=mail]
node db: Orders DB [cylinder, icon=database]
node search: Product Search [icon=search]

edge buyer -> store: browse
edge store -> catalog: products
edge buyer -> cart: add
edge cart -> api: checkout
edge api -> order: place
edge order -> inv: reserve
edge order -> pay: charge
edge order -> ship: fulfill
edge order -> notify: receipt
edge order -> db: persist
edge store -> search: query
```

## Q&A

### Q: Design an e-commerce platform

**A:** Break the platform into focused services behind an API gateway.

- The `Storefront` renders the catalog from the `Catalog Service`, which pulls
  products and variants from a read-optimized store and indexes them into
  `Product Search` for faceted queries.
- Buyers manage a `Cart Service` — Redis-backed, one cart per buyer — and
  checkout goes through the `Order Service`, the orchestrator.
- On order placement the system reserves inventory in the `Inventory Service`,
  charges the `Payment Service`, hands off to the `Shipping Service` for
  fulfillment, sends a receipt via `Notifications`, and persists the order in
  `Orders DB`.
- This is a write path: each step must be idempotent and retryable, with the
  order advancing through an explicit state machine (pending, confirmed,
  fulfilled, refunded).

Separate the read path from the write path.

- Browsing and search are read-heavy and hit caches and the search index, while
  checkout mutations serialize on the order pipeline.
- The trade-off of splitting into services is independent scaling — the catalog
  can be aggressively cached and fronted by a `CDN` while the order path scales
  separately — but it costs distributed-transaction complexity.
- You solve multi-service consistency with sagas and an outbox pattern rather
  than 2PC: each step commits its local change and emits an event; a
  compensating action rolls back on failure.
- An order is created in `pending`, then confirmed only after inventory
  reservation and payment both succeed; any failure triggers compensation
  (release the reservation, void the authorization).
- The result is a system that never shows a buyer a confirmed order that was not
  actually paid and reserved.

### Q: How do you model products, variants, and inventory?

**A:** A product is a logical grouping — a t-shirt — and owns shared attributes like
title, brand, and description.

- Variants carry the sellable, priceable units: size, color, SKU, and barcode,
  so a product has N variants, each with its own price and inventory.
- Inventory is tracked per variant (or per SKU-plus-warehouse for
  multi-warehouse sellers), because availability is what checkout actually
  validates.
- The schema is roughly `product(id, title, description, status)`,
  `variant(id, product_id, sku, price, attributes)`,
  `inventory(variant_id, warehouse_id, on_hand, reserved)`.
- The critical relationship is that available stock equals `on_hand - reserved`,
  and that computed value must be enforced atomically at checkout, not derived
  lazily.

The oversell problem is solved with a guarded atomic decrement.

- Use a SQL statement of the form
  `UPDATE inventory SET reserved=reserved+1 WHERE id=? AND on_hand-reserved>=?`
  — the `WHERE` clause makes the reservation fail cleanly when stock runs out,
  so two concurrent checkouts cannot both take the last unit.
- Because high-frequency stock checks cannot hit the relational DB on every page
  view, keep hot availability counters in `Redis` (e.g., `DECR`-style), serve
  those to the storefront, and reconcile periodically against the durable
  `Inventory Service` as source of truth.
- Trade-offs: in-memory counters are fast but can drift on crashes, so you need
  a reconciliation job and a conservative buffer — the `Redis` counter reserves
  a margin and the authoritative DB is the final arbiter at order confirmation.

Also model which warehouses can fulfill which orders and track per-location
quantities, so checkout can pick a fulfillment source and regional storefronts
can show local availability.

- This turns the availability query into a join across locations, which the
  `Redis` counter summarizes per region to keep the read path fast.
- Keep the model normalized enough to be correct and denormalized enough to be
  fast — the schema is the contract between catalog, cart, and fulfillment, so
  changing it later is expensive.

### Q: How do you keep the cart consistent under concurrency?

**A:** A cart is read-heavy, append-focused state keyed by `buyer_id`, best held in
`Redis` as a hash (`HSET cart:{id} variant_id qty`) with a TTL so abandoned
carts expire.

- The consistency risk concentrates at checkout: a buyer can be adding or
  modifying items in multiple tabs while checkout is reading the cart, and
  concurrent checkouts must not double-charge.
- Handle reads as a single snapshot (`HGETALL`) and, at checkout, atomically
  transition the cart to a locked state via `SETNX cart:{id}:lock` with a short
  TTL — the loser fails fast with a retryable error instead of proceeding.
- Validate every cart line against current price and availability before
  charging: prices change and stock sells, so the amounts shown earlier may be
  stale.

The `Order Service` serializes finalization.

- If payment fails or inventory cannot be reserved, unlock the cart and mark the
  order failed so the buyer can retry with a fresh attempt.
- Use a per-cart version counter (`INCR`) so a client sending a stale cart is
  rejected, and treat ordinary cart mutations as last-writer-wins while strict
  serialization applies only across the lock boundary.
- Two edge cases matter: an item added after checkout started must not silently
  appear in the frozen order (re-read after lock), and a cart with an item that
  became unavailable should prompt the buyer rather than fail the whole order.
- This gives buyers responsive browsing and sellers a guarantee that every
  charged order matches exactly the cart the buyer confirmed.

One more consistency knob: reconcile cart contents against the catalog on read,
not on write.

- If a product goes inactive or a price changes, refresh the displayed line and
  surface the change to the buyer at checkout review rather than failing at
  payment.
- This keeps the happy path fast and moves rare inconsistencies to a visible,
  recoverable point instead of a surprise failure at the card step.

### Q: How do you process payments safely?

**A:** Never charge before reserving inventory, never trust client-supplied totals, and
never let a retry double-charge.

- The `Order Service` computes the authoritative amount and passes an
  idempotency key (the order id) to the `Payment Service`, which calls the PSP
  (Stripe, Adyen) with an idempotent payment intent — retrying with the same key
  cannot create a second charge.
- Do not trust the synchronous redirect response for settlement; the PSP's
  confirmation arrives via webhook, and the webhook is what advances the order
  to `paid`.
- Maintain a payment ledger with status transitions (authorized, captured,
  refunded) so every money movement is auditable and reconcilable.

Security is about shrinking the attack surface.

- PCI DSS scope is reduced by tokenization: the platform stores PSP-issued
  tokens, never raw card numbers or CVVs, and card-entry UI is rendered by the
  PSP's hosted fields.
- On failure, be careful with timeouts: if the PSP call times out, poll the PSP
  for the actual payment status instead of assuming success or failure, then
  reconcile against the ledger.
- Provide a first-class refund path driven by the ledger and webhooks, since
  refunds have their own lifecycles and can be partial.
- Finally, run a daily reconciliation job that compares ledger totals against
  PSP settlement statements, because drift between the two is how fraud and
  accounting errors hide.
- The invariant the whole design protects: one order id maps to exactly one net
  charge, and the ledger is the single record of truth that both the buyer and
  finance teams read.

### Q: How do you scale flash-sale traffic?

**A:** A flash sale concentrates demand on a few SKUs in minutes, so the strategy is to
absorb reads with cache and serialize writes tightly.

- Cache the hot product page and its live availability in `Redis` (and
  edge-cache the page via `CDN`) so the storefront never re-renders from origin
  at peak; browsers poll or the storefront pushes availability deltas instead of
  each request triggering a backend round trip.
- Rate-limit the buy button client-side and at the gateway so a single user
  cannot hammer the reserve endpoint.

For writes, admit only N concurrent reservations for the hot SKU.

- Use a distributed pre-sale counter (`INCR` + `EXPIRE` in `Redis`) or a per-SKU
  lock so the `Inventory Service` never sees a stampede.
- Oversubscribe slightly — let the authoritative inventory reserve be the final
  arbiter — and reject cleanly with `sold out` once the cap is hit.
- Make order creation asynchronous: the gateway accepts, decrements the
  reservation, enqueues the order, and returns a processing status instead of
  blocking the request on synchronous payment and DB work; a worker drains the
  queue and confirms.
- Use `circuit breakers` so a slow payment provider degrades the sale (orders
  hold in `pending`) rather than cascading failures.
- Load-test the hot path at projected peak, pre-provision the queue and workers
  ahead of the drop, and treat the flash-sale path as a separate, smaller system
  — one optimized for a million concurrent browsers but only a few thousand
  actual sales.

Finally, instrument the flash-sale path end to end.

- Measure reservation latency, queue depth, and conversion (views to sale) in
  real time, so a degraded payment provider or a misconfigured cap is visible
  while the sale is live.
- A flash sale that fails is a brand event, so you want the ability to cut over
  to a backup provider or extend the sale window without redeploying.

## Source

```text
title: E-commerce Platform
node buyer: Buyer [round, icon=browser]
node store: Storefront [icon=browser]
node api: API Gateway [icon=server]
node catalog: Catalog Service [icon=search]
node cart: Cart Service [icon=cache]
node order: Order Service [icon=compute]
node inv: Inventory Service [icon=file]
node pay: Payment Service [icon=shield]
node ship: Shipping Service [icon=worker]
node notify: Notifications [icon=mail]
node db: Orders DB [cylinder, icon=database]
node search: Product Search [icon=search]

edge buyer -> store: browse
edge store -> catalog: products
edge buyer -> cart: add
edge cart -> api: checkout
edge api -> order: place
edge order -> inv: reserve
edge order -> pay: charge
edge order -> ship: fulfill
edge order -> notify: receipt
edge order -> db: persist
edge store -> search: query
```
