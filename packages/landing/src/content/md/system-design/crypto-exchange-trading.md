# Crypto Exchange — Trading

Design a cryptocurrency exchange

**Difficulty:** Easy

**Tags:** finance, matching, payments

## Functional Requirements

- a cryptocurrency exchange
- match buy and sell orders fairly?
- keep the order book consistent under load?
- settle trades atomically?
- prevent flash crashes and manipulation?

## Non-Functional Requirements

- The exchange accepts orders through a low-latency API.

- The API authenticates the trader, checks account balance and risk limits, then
  submits the order to a Matching Engine.
- The matching engine maintains the Order Book per trading pair in memory,
  matches incoming limit and market orders against resting orders using
  price-time priority, and emits each trade to the Settlement Service.
- Settlement moves tokens between wallet balances — debit the maker, credit the
  taker — and appends an immutable record to the Ledger DB.
- Market data (ticker, order book snapshots, trade stream) is published as an
  ordered event stream to a message bus and fanned out to clients over
  WebSockets.

The design is event-sourced.

- The order book can be replayed from the persisted log, so a replica can
  rebuild state and the ledger stays the authority for balances.
- Read paths — balances, trade history, open orders — hit a cache backed by the
  ledger.

Scaling centers on the single-threaded matching engine per symbol.

- When volume grows, symbols are partitioned across engine instances, and
  sequence numbers keep all published events globally ordered and auditable..
- The market data pipeline is latency-monitored: a flash
  crash is often visible as a burst of zero-trade, stale-quote behavior, so the
  engine tracks quote/trade ratios and flags anomalies.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Crypto Exchange
trader: Trader
api: Exchange API
auth: Auth Service
order: Order Service
matching: Matching Engine
book: Order Book
settle: Settlement
wallet: Wallet Service
market: Market Data
ledger: Ledger DB

trader ─► api ─► place order
api ─► auth ─► verify
api ─► order ─► submit
order ─► matching ─► match
matching ─► book ─► update
matching ─► market ─► publish
matching ─► settle ─► trade
settle ─► wallet ─► transfer
settle ─► ledger ─► record
api ─► ledger ─► balance
```

## Design

### Design a cryptocurrency exchange

The exchange accepts orders through a low-latency API.

- The API authenticates the trader, checks account balance and risk limits, then
  submits the order to a Matching Engine.
- The matching engine maintains the Order Book per trading pair in memory,
  matches incoming limit and market orders against resting orders using
  price-time priority, and emits each trade to the Settlement Service.
- Settlement moves tokens between wallet balances — debit the maker, credit the
  taker — and appends an immutable record to the Ledger DB.
- Market data (ticker, order book snapshots, trade stream) is published as an
  ordered event stream to a message bus and fanned out to clients over
  WebSockets.

The design is event-sourced.

- The order book can be replayed from the persisted log, so a replica can
  rebuild state and the ledger stays the authority for balances.
- Read paths — balances, trade history, open orders — hit a cache backed by the
  ledger.

Scaling centers on the single-threaded matching engine per symbol.

- When volume grows, symbols are partitioned across engine instances, and
  sequence numbers keep all published events globally ordered and auditable.

### How do you match buy and sell orders fairly?

Fairness comes from price-time priority and a strict sequence.

- A resting order at a better price always executes before a worse-priced one,
  and among orders at the same price the earliest timestamp wins.
- Each order gets a monotonically increasing sequence number on entry, which is
  also what the market data stream uses, so there is an unambiguous total order
  of every event.
- A matching pass pops the best-priced order from the opposite side's book,
  checks it against the incoming order, and either fully or partially fills it,
  then re-checks until the incoming order is filled, loses price priority, or is
  fully cancelled — all in one atomic pass with no interleaving.
- Because the engine is single-threaded per symbol, there is no race between two
  orders arriving simultaneously; the sequence assignment itself determines
  precedence, and trades are timestamped from the sequence rather than wall
  clock.
- Client order IDs and engine-generated IDs are both recorded so every fill is
  traceable and replayable for audits.

### How do you keep the order book consistent under load?

The order book lives in memory inside the matching engine — not in a database —
because even single-digit-millisecond database round trips would serialize
matching. Writes (new orders, cancels, fills) are applied through an in-memory
balanced tree or skip list keyed by price with a FIFO list per price level, and
every mutation is also appended to a write-ahead log before the in-memory change
is committed, so the book can be rebuilt after a crash. Reads are snapshot +
stream: the engine periodically publishes a full order book snapshot and a
deltas stream, and consumers (market data fan-out, dashboards, trading bots)
stitch the two. To handle hot books, the engine processes events in batches per
sequence number, and a replica engine consumes the same log so it can take over
on failure; because replay is deterministic, the replica reproduces an identical
book. Backpressure is explicit — if ingestion is faster than the engine can
drain, the inbound queue applies rate limiting and rejects with a clear error
rather than dropping or reordering events.

### How do you settle trades atomically?

Settlement treats the trade as a single atomic unit that either commits
completely or not at all. The matching engine hands the settlement service a
trade record containing both legs (maker account, taker account, base amount,
quote amount, price, trade id), and settlement posts a debit to one wallet and a
credit to the other within one database transaction, keyed by trade id so a
retry can never double-apply. The Ledger DB is the authoritative balance store,
so wallet balances are projected from ledger entries and protected by a
per-account unique sequence check — the same technique as a bank ledger, where
the sum of credits minus debits is invariant. The matching engine and settlement
are separated by a durable queue (transactional outbox): the trade is enqueued
in the same transaction that persists the order, and the settlement consumer is
idempotent. If settlement fails, the trade is marked for reconciliation and a
compensating entry restores both wallets, while the published market data is
adjusted with a correction event so consumers never see phantom fills.

### How do you prevent flash crashes and manipulation?

Protection is layered: circuit breakers, kill switches, rate limiting, and
surveillance. A circuit breaker watches for abnormal market conditions — price
moving more than a configured percentage in a short window, or the order book
thinning to a minimum depth — and halts matching for that symbol, rejecting new
orders and notifying ops. Per-client limits cap order rate, notional size, and
open-order count, and leverage (if offered) is capped per account so no single
trader can corner a book. The market data pipeline is latency-monitored: a flash
crash is often visible as a burst of zero-trade, stale-quote behavior, so the
engine tracks quote/trade ratios and flags anomalies. Surveillance runs off the
event-sourced log — wash-trade detection (same party both sides), spoofing
(large orders placed then cancelled before execution), and front-running checks
against account relationships — with case files generated from replayed
sequences. All price formation is deterministic from the log, so regulators and
internal risk can reproduce any moment in time exactly, and rollback is possible
by truncating the log to a clean sequence and replaying.

## Source

```text
title: Crypto Exchange
node trader: Trader [round, icon=browser]
node api: Exchange API [icon=server]
node auth: Auth Service [icon=auth]
node order: Order Service [icon=compute]
node matching: Matching Engine [icon=compute]
node book: Order Book [cylinder, icon=cache]
node settle: Settlement [icon=shield]
node wallet: Wallet Service [icon=file]
node market: Market Data [icon=queue]
node ledger: Ledger DB [cylinder, icon=database]

edge trader -> api: place order
edge api -> auth: verify
edge api -> order: submit
edge order -> matching: match
edge matching -> book: update
edge matching -> market: publish
edge matching -> settle: trade
edge settle -> wallet: transfer
edge settle -> ledger: record
edge api -> ledger: balance
```

## Q&A

### Q: Design a cryptocurrency exchange

**A:** The exchange accepts orders through a low-latency API.

- The API authenticates the trader, checks account balance and risk limits, then
  submits the order to a Matching Engine.
- The matching engine maintains the Order Book per trading pair in memory,
  matches incoming limit and market orders against resting orders using
  price-time priority, and emits each trade to the Settlement Service.
- Settlement moves tokens between wallet balances — debit the maker, credit the
  taker — and appends an immutable record to the Ledger DB.
- Market data (ticker, order book snapshots, trade stream) is published as an
  ordered event stream to a message bus and fanned out to clients over
  WebSockets.

The design is event-sourced.

- The order book can be replayed from the persisted log, so a replica can
  rebuild state and the ledger stays the authority for balances.
- Read paths — balances, trade history, open orders — hit a cache backed by the
  ledger.

Scaling centers on the single-threaded matching engine per symbol.

- When volume grows, symbols are partitioned across engine instances, and
  sequence numbers keep all published events globally ordered and auditable.

### Q: How do you match buy and sell orders fairly?

**A:** Fairness comes from price-time priority and a strict sequence.

- A resting order at a better price always executes before a worse-priced one,
  and among orders at the same price the earliest timestamp wins.
- Each order gets a monotonically increasing sequence number on entry, which is
  also what the market data stream uses, so there is an unambiguous total order
  of every event.
- A matching pass pops the best-priced order from the opposite side's book,
  checks it against the incoming order, and either fully or partially fills it,
  then re-checks until the incoming order is filled, loses price priority, or is
  fully cancelled — all in one atomic pass with no interleaving.
- Because the engine is single-threaded per symbol, there is no race between two
  orders arriving simultaneously; the sequence assignment itself determines
  precedence, and trades are timestamped from the sequence rather than wall
  clock.
- Client order IDs and engine-generated IDs are both recorded so every fill is
  traceable and replayable for audits.

### Q: How do you keep the order book consistent under load?

**A:** The order book lives in memory inside the matching engine — not in a database —
because even single-digit-millisecond database round trips would serialize
matching. Writes (new orders, cancels, fills) are applied through an in-memory
balanced tree or skip list keyed by price with a FIFO list per price level, and
every mutation is also appended to a write-ahead log before the in-memory change
is committed, so the book can be rebuilt after a crash. Reads are snapshot +
stream: the engine periodically publishes a full order book snapshot and a
deltas stream, and consumers (market data fan-out, dashboards, trading bots)
stitch the two. To handle hot books, the engine processes events in batches per
sequence number, and a replica engine consumes the same log so it can take over
on failure; because replay is deterministic, the replica reproduces an identical
book. Backpressure is explicit — if ingestion is faster than the engine can
drain, the inbound queue applies rate limiting and rejects with a clear error
rather than dropping or reordering events.

### Q: How do you settle trades atomically?

**A:** Settlement treats the trade as a single atomic unit that either commits
completely or not at all. The matching engine hands the settlement service a
trade record containing both legs (maker account, taker account, base amount,
quote amount, price, trade id), and settlement posts a debit to one wallet and a
credit to the other within one database transaction, keyed by trade id so a
retry can never double-apply. The Ledger DB is the authoritative balance store,
so wallet balances are projected from ledger entries and protected by a
per-account unique sequence check — the same technique as a bank ledger, where
the sum of credits minus debits is invariant. The matching engine and settlement
are separated by a durable queue (transactional outbox): the trade is enqueued
in the same transaction that persists the order, and the settlement consumer is
idempotent. If settlement fails, the trade is marked for reconciliation and a
compensating entry restores both wallets, while the published market data is
adjusted with a correction event so consumers never see phantom fills.

### Q: How do you prevent flash crashes and manipulation?

**A:** Protection is layered: circuit breakers, kill switches, rate limiting, and
surveillance. A circuit breaker watches for abnormal market conditions — price
moving more than a configured percentage in a short window, or the order book
thinning to a minimum depth — and halts matching for that symbol, rejecting new
orders and notifying ops. Per-client limits cap order rate, notional size, and
open-order count, and leverage (if offered) is capped per account so no single
trader can corner a book. The market data pipeline is latency-monitored: a flash
crash is often visible as a burst of zero-trade, stale-quote behavior, so the
engine tracks quote/trade ratios and flags anomalies. Surveillance runs off the
event-sourced log — wash-trade detection (same party both sides), spoofing
(large orders placed then cancelled before execution), and front-running checks
against account relationships — with case files generated from replayed
sequences. All price formation is deterministic from the log, so regulators and
internal risk can reproduce any moment in time exactly, and rollback is possible
by truncating the log to a clean sequence and replaying.

## Source

```text
title: Crypto Exchange
node trader: Trader [round, icon=browser]
node api: Exchange API [icon=server]
node auth: Auth Service [icon=auth]
node order: Order Service [icon=compute]
node matching: Matching Engine [icon=compute]
node book: Order Book [cylinder, icon=cache]
node settle: Settlement [icon=shield]
node wallet: Wallet Service [icon=file]
node market: Market Data [icon=queue]
node ledger: Ledger DB [cylinder, icon=database]

edge trader -> api: place order
edge api -> auth: verify
edge api -> order: submit
edge order -> matching: match
edge matching -> book: update
edge matching -> market: publish
edge matching -> settle: trade
edge settle -> wallet: transfer
edge settle -> ledger: record
edge api -> ledger: balance
```
