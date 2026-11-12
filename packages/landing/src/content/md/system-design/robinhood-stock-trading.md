# Robinhood — Stock Trading

Design a stock trading platform

**Difficulty:** Medium

**Tags:** finance

## Functional Requirements

- a stock trading platform
- stream live market data to clients?
- place and match orders with low latency?
- manage risk and prevent losses?
- keep portfolio balances consistent?

## Non-Functional Requirements

- A stock trading platform combines a real-time market data system with an order
  lifecycle system, and the two have very different demands.

- Market data is a high-volume broadcast that must reach clients with minimal
  latency; orders are low-volume but must be validated, risk-checked, matched,
  and settled correctly.
- I would build a gateway in front of market feed, order, matching, risk, and
  portfolio services, with a ledger for settlement, a price cache for quotes,
  and an Orders DB.
- Compliance and reporting are baked into the same pipeline so that every order
  event is captured once, in order, and never reconstructed from screenshots.

A trader places an order through the app; the gateway submits it to the order
service, which validates and persists it, then passes it through risk checks
before the matching engine executes it against incoming or resting liquidity.

- On fill, the portfolio service updates positions and the ledger settles cash,
  and the trader receives a fill notification.
- Quotes stream in from the market data feed through a cache to the app, so the
  displayed price is always available even during bursts.
- Market orders, limit orders, and stop orders are all state machines over the
  same base order record, so the matching engine treats them uniformly.

The design must tolerate partial failure without losing money or orders.

- Order placement is idempotent via client order ids.
- Matching is single-threaded per instrument to preserve price-time priority.
- The ledger is append-only with reconciliation against the broker and clearing
  house.

The tradeoff is latency versus control:

- Batching and caching hurt latency but reduce cost, so the hot order path is
  kept lean while analytics and reporting run asynchronously..
- Market data is a broadcast problem: every subscriber wants the same quotes, at
  roughly the same time, and the volume is enormous because prices tick
  continuously during trading hours.

- I would use a multicast-style fan-out at the infrastructure level, with a
  market data feed service that normalizes data from exchanges and republishes
  it over WebSockets to connected clients, with throttling to protect both the
  exchange feed and client bandwidth.
- Regulators require fairness, so the fan-out must not systematically favor one
  subscriber over another in latency terms.

Clients rarely need every tick.

- I would implement subscription-based channels: a client subscribes to symbols,
  and the gateway pushes only updates for those symbols, batched by the
  millisecond so a burst of ticks becomes one message.
- A price cache holds the last price per symbol so a newly connecting client can
  snapshot current prices instantly, then apply live deltas, avoiding a full
  history transfer on every reconnect.
- Replay buffers per symbol let a slow consumer catch up without reconnecting,
  at the cost of memory.

Reliability matters because a stale quote is worse than no quote.

- Each message carries a sequence number per symbol, and the client detects gaps
  and requests a resync from the cache.
- Lossy compression and batching reduce bandwidth but add latency, so I would
  tune the tradeoff per data tier: full-fidelity for trading terminals,
  aggregated streams for casual apps.
- Monitoring tracks gap rates and staleness per symbol, alerting when a feed
  lags.
- Delayed quotes for non-subscribers are served from the same cache with a
  timestamp watermark..
- Matching is where correctness and speed collide.

- To preserve price-time priority, I would keep a per-symbol order book in
  memory, single-threaded per symbol so there are no locks and no races, with a
  matching engine that walks the book by price and then by arrival sequence.
- Orders arrive through the gateway, are validated and risk-checked, then handed
  to the matching engine, which either fills them immediately against resting
  liquidity or books them as resting orders.
- Order types with exotic conditions are compiled into the same book logic so
  one fast path serves all of them.

Latency is dominated by the number of hops.

- I would co-locate the matching engine close to the exchange, run it in-process
  with the order service, and keep the book entirely in memory with write-ahead
  logging for crash recovery.
- Persistence is asynchronous relative to the match decision: the match happens
  first, the durable log confirms it, and the Orders DB catches up, because
  waiting for a synchronous database commit would destroy latency.
- Network reliability comes from the gateway acking each order with an
  exchange-validated id before matching proceeds.

Scale comes from sharding by symbol: each symbol has exactly one owner at any
time, and the ownership table is replicated so failover moves a symbol to a hot
standby within seconds.

- The tradeoff is that cross-symbol features like portfolio-level netting need a
  separate layer that aggregates post-trade.
- Cancel and replace operations reuse the same book, and because the matching
  engine is deterministic, replaying the log reproduces the exact sequence of
  fills for audits..
- Portfolio balances must always reconcile with the ledger, so I would make the
  ledger the single source of truth for cash and positions, and derive the
  displayed portfolio from it rather than storing a separate balance.

- Every trade produces a pair of ledger entries (cash debited or credited and
  position changed) written in one atomic transaction, so a crash mid-trade
  cannot leave a half-applied position.
- Dividends, fees, and interest are the same kind of entry, just with different
  sources.
- Currency conversions and corporate actions like splits are modeled as explicit
  entries, keeping the math visible and auditable.

The displayed balance can then be a materialized view computed from the ledger
with an idempotency key per entry, recomputed on demand and cached.

- Concurrency is handled by serializing writes per account, so two simultaneous
  sell orders cannot both spend the same cash.
- The tradeoff is that recomputation can be expensive for an account with years
  of history, so I would keep a running balance per account with nightly full
  reconciliation against the ledger and against broker records.
- Caching invalidation is keyed on the account's entry sequence, so a new entry
  invalidates exactly the cached balances that matter.

Consistency failures surface as a difference between the ledger and the broker
or clearing-house statement.

- A reconciliation job compares the two and flags every discrepancy, and because
  the ledger is append-only with hashes, the platform can prove exactly which
  entries are authoritative.
- The user experience is built on this guarantee: available cash, buying power,
  and positions all derive from the same reconciled state, so a trader never
  sees two numbers that disagree.

## Source

````text
title: Stock Trading
node trader: Trader [round, icon=browser]
node app: Trading App [icon=browser]
node gateway: API Gateway [icon=server]
node market: Market Data Feed [icon=queue]
node order: Order Service [icon=compute]
node match: Matching Engine [icon=compute]
node risk: Risk Checks [icon=shield]
node portfolio: Portfolio Service [icon=compute]
node ledger: Ledger [cylinder, icon=database]
node notify: Notifications [icon=message]
node cache: Price Cache [cylinder, icon=cache]
node db: Orders DB [cylinder, icon=database]

edge trader -> app: place order
edge app -> gateway: submit
edge gateway -> order: validate
edge order -> risk: check
edge risk -> match: execute
edge match -> portfolio: update
edge portfolio -> ledger: settle
edge market -> cache: prices
edge cache -> app: quote stream
edge match -> notify: fill
edge order -> db: record
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Stock Trading
trader: Trader
app: Trading App
gateway: API Gateway
market: Market Data Feed
order: Order Service
match: Matching Engine
risk: Risk Checks
portfolio: Portfolio Service
ledger: Ledger
notify: Notifications
cache: Price Cache
db: Orders DB

trader ─► app ─► place order
app ─► gateway ─► submit
gateway ─► order ─► validate
order ─► risk ─► check
risk ─► match ─► execute
match ─► portfolio ─► update
portfolio ─► ledger ─► settle
market ─► cache ─► prices
cache ─► app ─► quote stream
match ─► notify ─► fill
order ─► db ─► record
````

## Design

### Design a stock trading platform

A stock trading platform combines a real-time market data system with an order
lifecycle system, and the two have very different demands.

- Market data is a high-volume broadcast that must reach clients with minimal
  latency; orders are low-volume but must be validated, risk-checked, matched,
  and settled correctly.
- I would build a gateway in front of market feed, order, matching, risk, and
  portfolio services, with a ledger for settlement, a price cache for quotes,
  and an Orders DB.
- Compliance and reporting are baked into the same pipeline so that every order
  event is captured once, in order, and never reconstructed from screenshots.

A trader places an order through the app; the gateway submits it to the order
service, which validates and persists it, then passes it through risk checks
before the matching engine executes it against incoming or resting liquidity.

- On fill, the portfolio service updates positions and the ledger settles cash,
  and the trader receives a fill notification.
- Quotes stream in from the market data feed through a cache to the app, so the
  displayed price is always available even during bursts.
- Market orders, limit orders, and stop orders are all state machines over the
  same base order record, so the matching engine treats them uniformly.

The design must tolerate partial failure without losing money or orders.

- Order placement is idempotent via client order ids.
- Matching is single-threaded per instrument to preserve price-time priority.
- The ledger is append-only with reconciliation against the broker and clearing
  house.

The tradeoff is latency versus control:

- Batching and caching hurt latency but reduce cost, so the hot order path is
  kept lean while analytics and reporting run asynchronously.

### How do you stream live market data to clients?

Market data is a broadcast problem: every subscriber wants the same quotes, at
roughly the same time, and the volume is enormous because prices tick
continuously during trading hours.

- I would use a multicast-style fan-out at the infrastructure level, with a
  market data feed service that normalizes data from exchanges and republishes
  it over WebSockets to connected clients, with throttling to protect both the
  exchange feed and client bandwidth.
- Regulators require fairness, so the fan-out must not systematically favor one
  subscriber over another in latency terms.

Clients rarely need every tick.

- I would implement subscription-based channels: a client subscribes to symbols,
  and the gateway pushes only updates for those symbols, batched by the
  millisecond so a burst of ticks becomes one message.
- A price cache holds the last price per symbol so a newly connecting client can
  snapshot current prices instantly, then apply live deltas, avoiding a full
  history transfer on every reconnect.
- Replay buffers per symbol let a slow consumer catch up without reconnecting,
  at the cost of memory.

Reliability matters because a stale quote is worse than no quote.

- Each message carries a sequence number per symbol, and the client detects gaps
  and requests a resync from the cache.
- Lossy compression and batching reduce bandwidth but add latency, so I would
  tune the tradeoff per data tier: full-fidelity for trading terminals,
  aggregated streams for casual apps.
- Monitoring tracks gap rates and staleness per symbol, alerting when a feed
  lags.
- Delayed quotes for non-subscribers are served from the same cache with a
  timestamp watermark.

### How do you place and match orders with low latency?

Matching is where correctness and speed collide.

- To preserve price-time priority, I would keep a per-symbol order book in
  memory, single-threaded per symbol so there are no locks and no races, with a
  matching engine that walks the book by price and then by arrival sequence.
- Orders arrive through the gateway, are validated and risk-checked, then handed
  to the matching engine, which either fills them immediately against resting
  liquidity or books them as resting orders.
- Order types with exotic conditions are compiled into the same book logic so
  one fast path serves all of them.

Latency is dominated by the number of hops.

- I would co-locate the matching engine close to the exchange, run it in-process
  with the order service, and keep the book entirely in memory with write-ahead
  logging for crash recovery.
- Persistence is asynchronous relative to the match decision: the match happens
  first, the durable log confirms it, and the Orders DB catches up, because
  waiting for a synchronous database commit would destroy latency.
- Network reliability comes from the gateway acking each order with an
  exchange-validated id before matching proceeds.

Scale comes from sharding by symbol: each symbol has exactly one owner at any
time, and the ownership table is replicated so failover moves a symbol to a hot
standby within seconds.

- The tradeoff is that cross-symbol features like portfolio-level netting need a
  separate layer that aggregates post-trade.
- Cancel and replace operations reuse the same book, and because the matching
  engine is deterministic, replaying the log reproduces the exact sequence of
  fills for audits.

### How do you manage risk and prevent losses?

Risk checks gate every order before it can match.

- I would implement a multi-layer risk framework: pre-trade checks reject orders
  that exceed buying power, violate position limits, or fail pattern-day-trading
  rules; real-time monitoring catches runaway behavior like rapid-fire churn;
  and post-trade surveillance detects anomalies after the fact.
- Each layer runs on a risk service with its own fast path so the check itself
  does not become the bottleneck.
- Fraud overlays like credential anomalies and unusual geolocation feed the same
  gate before funds can leave the account.

Because a trader's exposure depends on current prices, the risk service consumes
the same price stream as trading and maintains a live portfolio valuation.

- Buying-power checks are computed against mark-to-market equity with haircuts
  for volatile instruments, and orders are either rejected or partially allowed.

The design principle is fail-closed:

- If the risk service is unreachable, the order service rejects orders rather
  than guessing, because the cost of an uncaught loss far exceeds the cost of a
  rejected trade.
- Intraday limits on gross exposure stop compounding losses from a single bad
  strategy.

Risk also spans market events.

- Circuit breakers at the platform level halt trading in a symbol or account
  when conditions spike, and margin calls are automated within defined bounds.

The tradeoff is strictness versus friction:

- Tight risk reduces losses but also blocks legitimate clients, so limits are
  configurable per account class with escalation paths.
- Everything is logged, so a disputed rejection can be reconstructed and
  explained precisely.
- Simulated stress scenarios run nightly to validate that the limits would have
  held on historical crash days.

### How do you keep portfolio balances consistent?

Portfolio balances must always reconcile with the ledger, so I would make the
ledger the single source of truth for cash and positions, and derive the
displayed portfolio from it rather than storing a separate balance.

- Every trade produces a pair of ledger entries (cash debited or credited and
  position changed) written in one atomic transaction, so a crash mid-trade
  cannot leave a half-applied position.
- Dividends, fees, and interest are the same kind of entry, just with different
  sources.
- Currency conversions and corporate actions like splits are modeled as explicit
  entries, keeping the math visible and auditable.

The displayed balance can then be a materialized view computed from the ledger
with an idempotency key per entry, recomputed on demand and cached.

- Concurrency is handled by serializing writes per account, so two simultaneous
  sell orders cannot both spend the same cash.
- The tradeoff is that recomputation can be expensive for an account with years
  of history, so I would keep a running balance per account with nightly full
  reconciliation against the ledger and against broker records.
- Caching invalidation is keyed on the account's entry sequence, so a new entry
  invalidates exactly the cached balances that matter.

Consistency failures surface as a difference between the ledger and the broker
or clearing-house statement.

- A reconciliation job compares the two and flags every discrepancy, and because
  the ledger is append-only with hashes, the platform can prove exactly which
  entries are authoritative.
- The user experience is built on this guarantee: available cash, buying power,
  and positions all derive from the same reconciled state, so a trader never
  sees two numbers that disagree.

## Source

```text
title: Stock Trading
node trader: Trader [round, icon=browser]
node app: Trading App [icon=browser]
node gateway: API Gateway [icon=server]
node market: Market Data Feed [icon=queue]
node order: Order Service [icon=compute]
node match: Matching Engine [icon=compute]
node risk: Risk Checks [icon=shield]
node portfolio: Portfolio Service [icon=compute]
node ledger: Ledger [cylinder, icon=database]
node notify: Notifications [icon=message]
node cache: Price Cache [cylinder, icon=cache]
node db: Orders DB [cylinder, icon=database]

edge trader -> app: place order
edge app -> gateway: submit
edge gateway -> order: validate
edge order -> risk: check
edge risk -> match: execute
edge match -> portfolio: update
edge portfolio -> ledger: settle
edge market -> cache: prices
edge cache -> app: quote stream
edge match -> notify: fill
edge order -> db: record
```

## Q&A

### Q: Design a stock trading platform

**A:** A stock trading platform combines a real-time market data system with an order
lifecycle system, and the two have very different demands.

- Market data is a high-volume broadcast that must reach clients with minimal
  latency; orders are low-volume but must be validated, risk-checked, matched,
  and settled correctly.
- I would build a gateway in front of market feed, order, matching, risk, and
  portfolio services, with a ledger for settlement, a price cache for quotes,
  and an Orders DB.
- Compliance and reporting are baked into the same pipeline so that every order
  event is captured once, in order, and never reconstructed from screenshots.

A trader places an order through the app; the gateway submits it to the order
service, which validates and persists it, then passes it through risk checks
before the matching engine executes it against incoming or resting liquidity.

- On fill, the portfolio service updates positions and the ledger settles cash,
  and the trader receives a fill notification.
- Quotes stream in from the market data feed through a cache to the app, so the
  displayed price is always available even during bursts.
- Market orders, limit orders, and stop orders are all state machines over the
  same base order record, so the matching engine treats them uniformly.

The design must tolerate partial failure without losing money or orders.

- Order placement is idempotent via client order ids.
- Matching is single-threaded per instrument to preserve price-time priority.
- The ledger is append-only with reconciliation against the broker and clearing
  house.

The tradeoff is latency versus control:

- Batching and caching hurt latency but reduce cost, so the hot order path is
  kept lean while analytics and reporting run asynchronously.

### Q: How do you stream live market data to clients?

**A:** Market data is a broadcast problem: every subscriber wants the same quotes, at
roughly the same time, and the volume is enormous because prices tick
continuously during trading hours.

- I would use a multicast-style fan-out at the infrastructure level, with a
  market data feed service that normalizes data from exchanges and republishes
  it over WebSockets to connected clients, with throttling to protect both the
  exchange feed and client bandwidth.
- Regulators require fairness, so the fan-out must not systematically favor one
  subscriber over another in latency terms.

Clients rarely need every tick.

- I would implement subscription-based channels: a client subscribes to symbols,
  and the gateway pushes only updates for those symbols, batched by the
  millisecond so a burst of ticks becomes one message.
- A price cache holds the last price per symbol so a newly connecting client can
  snapshot current prices instantly, then apply live deltas, avoiding a full
  history transfer on every reconnect.
- Replay buffers per symbol let a slow consumer catch up without reconnecting,
  at the cost of memory.

Reliability matters because a stale quote is worse than no quote.

- Each message carries a sequence number per symbol, and the client detects gaps
  and requests a resync from the cache.
- Lossy compression and batching reduce bandwidth but add latency, so I would
  tune the tradeoff per data tier: full-fidelity for trading terminals,
  aggregated streams for casual apps.
- Monitoring tracks gap rates and staleness per symbol, alerting when a feed
  lags.
- Delayed quotes for non-subscribers are served from the same cache with a
  timestamp watermark.

### Q: How do you place and match orders with low latency?

**A:** Matching is where correctness and speed collide.

- To preserve price-time priority, I would keep a per-symbol order book in
  memory, single-threaded per symbol so there are no locks and no races, with a
  matching engine that walks the book by price and then by arrival sequence.
- Orders arrive through the gateway, are validated and risk-checked, then handed
  to the matching engine, which either fills them immediately against resting
  liquidity or books them as resting orders.
- Order types with exotic conditions are compiled into the same book logic so
  one fast path serves all of them.

Latency is dominated by the number of hops.

- I would co-locate the matching engine close to the exchange, run it in-process
  with the order service, and keep the book entirely in memory with write-ahead
  logging for crash recovery.
- Persistence is asynchronous relative to the match decision: the match happens
  first, the durable log confirms it, and the Orders DB catches up, because
  waiting for a synchronous database commit would destroy latency.
- Network reliability comes from the gateway acking each order with an
  exchange-validated id before matching proceeds.

Scale comes from sharding by symbol: each symbol has exactly one owner at any
time, and the ownership table is replicated so failover moves a symbol to a hot
standby within seconds.

- The tradeoff is that cross-symbol features like portfolio-level netting need a
  separate layer that aggregates post-trade.
- Cancel and replace operations reuse the same book, and because the matching
  engine is deterministic, replaying the log reproduces the exact sequence of
  fills for audits.

### Q: How do you manage risk and prevent losses?

**A:** Risk checks gate every order before it can match.

- I would implement a multi-layer risk framework: pre-trade checks reject orders
  that exceed buying power, violate position limits, or fail pattern-day-trading
  rules; real-time monitoring catches runaway behavior like rapid-fire churn;
  and post-trade surveillance detects anomalies after the fact.
- Each layer runs on a risk service with its own fast path so the check itself
  does not become the bottleneck.
- Fraud overlays like credential anomalies and unusual geolocation feed the same
  gate before funds can leave the account.

Because a trader's exposure depends on current prices, the risk service consumes
the same price stream as trading and maintains a live portfolio valuation.

- Buying-power checks are computed against mark-to-market equity with haircuts
  for volatile instruments, and orders are either rejected or partially allowed.

The design principle is fail-closed:

- If the risk service is unreachable, the order service rejects orders rather
  than guessing, because the cost of an uncaught loss far exceeds the cost of a
  rejected trade.
- Intraday limits on gross exposure stop compounding losses from a single bad
  strategy.

Risk also spans market events.

- Circuit breakers at the platform level halt trading in a symbol or account
  when conditions spike, and margin calls are automated within defined bounds.

The tradeoff is strictness versus friction:

- Tight risk reduces losses but also blocks legitimate clients, so limits are
  configurable per account class with escalation paths.
- Everything is logged, so a disputed rejection can be reconstructed and
  explained precisely.
- Simulated stress scenarios run nightly to validate that the limits would have
  held on historical crash days.

### Q: How do you keep portfolio balances consistent?

**A:** Portfolio balances must always reconcile with the ledger, so I would make the
ledger the single source of truth for cash and positions, and derive the
displayed portfolio from it rather than storing a separate balance.

- Every trade produces a pair of ledger entries (cash debited or credited and
  position changed) written in one atomic transaction, so a crash mid-trade
  cannot leave a half-applied position.
- Dividends, fees, and interest are the same kind of entry, just with different
  sources.
- Currency conversions and corporate actions like splits are modeled as explicit
  entries, keeping the math visible and auditable.

The displayed balance can then be a materialized view computed from the ledger
with an idempotency key per entry, recomputed on demand and cached.

- Concurrency is handled by serializing writes per account, so two simultaneous
  sell orders cannot both spend the same cash.
- The tradeoff is that recomputation can be expensive for an account with years
  of history, so I would keep a running balance per account with nightly full
  reconciliation against the ledger and against broker records.
- Caching invalidation is keyed on the account's entry sequence, so a new entry
  invalidates exactly the cached balances that matter.

Consistency failures surface as a difference between the ledger and the broker
or clearing-house statement.

- A reconciliation job compares the two and flags every discrepancy, and because
  the ledger is append-only with hashes, the platform can prove exactly which
  entries are authoritative.
- The user experience is built on this guarantee: available cash, buying power,
  and positions all derive from the same reconciled state, so a trader never
  sees two numbers that disagree.

## Source

```text
title: Stock Trading
node trader: Trader [round, icon=browser]
node app: Trading App [icon=browser]
node gateway: API Gateway [icon=server]
node market: Market Data Feed [icon=queue]
node order: Order Service [icon=compute]
node match: Matching Engine [icon=compute]
node risk: Risk Checks [icon=shield]
node portfolio: Portfolio Service [icon=compute]
node ledger: Ledger [cylinder, icon=database]
node notify: Notifications [icon=message]
node cache: Price Cache [cylinder, icon=cache]
node db: Orders DB [cylinder, icon=database]

edge trader -> app: place order
edge app -> gateway: submit
edge gateway -> order: validate
edge order -> risk: check
edge risk -> match: execute
edge match -> portfolio: update
edge portfolio -> ledger: settle
edge market -> cache: prices
edge cache -> app: quote stream
edge match -> notify: fill
edge order -> db: record
```
