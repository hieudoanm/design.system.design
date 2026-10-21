# Payment system

Move money exactly once, with idempotency, ledgers and reconciliation.

**Difficulty:** Easy

**Tags:** auth, payments, realtime, security

## Functional Requirements

- Create a charge or authorization for a merchant.
- Store payment methods and settle with the card network.
- Record double-entry ledger entries and account balances.
- Emit webhooks and reconcile settlement files from the bank.

## Non-Functional Requirements

- A retried charge never charges twice.
- Ledger writes are strongly consistent and atomic per account.
- The API answers in under a second, excluding the network round trip.
- Every movement of money is immutable and auditable.

## Estimation

- 100M transactions a day is about 1.2k per second and 10k at peak.
- Idempotency keys kept for 24 hours at 100 bytes each is about 10 GB.
- Two ledger entries per transaction at 1 KB is 200 GB a day, retained for seven years.
- Webhooks average three attempts, so about 300M deliveries a day.

## Architecture Diagram

```text
 Buyer ─► Payments API ─► Payments service ──► PSP / network (authorize)
                              │      ▲
              idempotency key │      │ result
                              ▼      │
                       Idempotency cache
                              │
                              ├─► Fraud detection
                              ├─► Ledger service ─► Transactions DB (ACID)
                              ├─► Wallet balance
                              └─► Webhook dispatcher ─► Merchant (retry, backoff)
```

## Design

### Overview

The system is built from a set of core services:

- A Payments API fronting a Payments Service.
- An abstraction over PSP networks for authorization and settlement.
- A Ledger Service writing double-entry records.
- A wallet/balance system.
- A webhook dispatcher.
- Fraud screening.
- Notifications.

The transactional store is a single-write, ACID database partitioned by account
so charges and ledger entries commit atomically.

Data models: transactions, payment methods, ledger entries, balances.

Trade-offs: correctness demands a strongly consistent ledger, so writes funnel
through one source of truth while reads scale via caching and replication.

To scale:

- Shard by account/merchant.
- Add idempotency caching for retries.
- Decouple webhooks through a durable queue.

Settlement is async:

- Authorize synchronously, then settle or refund through the PSP with
  reconciliation against bank statements.

## Q&A

### Q: How do you guarantee exactly-once charge semantics?

True exactly-once is impossible across networks, so the standard is
at-least-once delivery plus idempotent deduplication at the application layer.

- The client sends an `Idempotency-Key` on every charge.
- The Payments Service performs an atomic check-and-set against an idempotency
  cache/table keyed by (account, key).
- On a miss it executes the charge and stores the result and response body
  together in one transaction; on a hit it returns the previously stored result
  instead of charging again.
- PSP calls are retried with the same key so the network's own idempotency
  shields double auths.
- Ledger entries are written once with unique entry IDs.
- A background reconciler compares ledger balances against PSP settlement
  reports to catch and fix residual drift.

### Q: Why does idempotency matter in payment APIs?

Payments sit behind unreliable networks: a client timeout or gateway retry can
fire after a charge already succeeded, and without protection that retry creates
a second, accidental charge.

- Idempotency keys let the server recognize a repeated request and replay the
  original response, making retries safe.
- They give clients a simple contract — retry with backoff until you get a
  definitive answer.
- This prevents double charges, keeps merchant and customer balances consistent,
  and avoids expensive manual refunds.
- On the backend it translates to a keyed store with an atomic insert and a TTL,
  so duplicates are cheaply deduped without re-running the PSP flow.
- It also composes with eventing: webhook events carry the same idempotent IDs
  so downstream consumers dedupe consistently.

### Q: How do you reconcile money across ledgers and banks?

The ledger is the system of record: every money movement is posted as
double-entry journal entries so debits and credits always balance.

- Wallet balances are derived projections of that ledger, not independent
  stores.
- Reconciliation matches the internally consistent ledger against external
  bank/PSP settlement files, typically nightly.
- Each line — charges, refunds, fees, chargebacks — is paired with a ledger
  entry, and unmatched items go to a discrepancy queue for investigation.
- Posting must be idempotent, using unique entry IDs, so repeated settlement
  files cannot double-count.
- Anomalies like failed debits or surprise network fees are auto-flagged.
- When totals drift, you bisect the batch to isolate the mismatch.
- This gives a provable money trail and catches bugs before they hit customer
  balances.

### Q: Design webhook delivery with retries and backoff

The webhook dispatcher reads events from a durable queue (SQS/Kafka) and POSTs
them to each merchant's registered endpoint.

- Delivery policy: HTTP 2xx marks success; timeouts and non-2xx trigger retry
  with exponential backoff plus jitter (e.g., 1s to 2s to 4s capped, max
  attempts roughly 5-10), after which the event moves to a dead-letter queue for
  manual replay.
- Every payload is signed with an HMAC and carries a unique event ID so
  merchants can verify authenticity and dedupe.
- The dispatcher must respect per-endpoint rate limits and honor
  `Retry-After`/429s to avoid hammering slow servers.
- Provide a dashboard with delivery logs and one-click replay.
- Emit metrics on delivery latency and failure rates for alerting.

## Source

````text
title: Stripe Payments
node merchant: Merchant Dashboard [round, icon=browser]
node buyer: Buyer [round, icon=browser]
node api: Payments API [icon=server]
node payments: Payments Service [icon=shield]
node psp: PSP / Network [icon=sync]
node ledger: Ledger Service [icon=compute]
node wallet: Wallet Balance [icon=cache]
node webhook: Webhook Dispatcher [icon=worker]
node fraud: Fraud Detection [icon=search]
node notify: Notifications [icon=mail]
node db: Transactions DB [cylinder, icon=database]
node cache: Idempotency Cache [cylinder, icon=cache]

edge buyer -> api: charge
edge api -> payments: process
edge payments -> cache: idempotency key
edge payments -> psp: authorize
edge psp -> payments: result
edge payments -> ledger: record
edge ledger -> db: persist
edge payments -> wallet: settle
edge payments -> webhook: emit event
edge webhook -> merchant: callback
edge payments -> fraud: screen
edge fraud -> payments: verdict
edge payments -> notify: receipt
```.

## Source


```text
title: Stripe Payments
node merchant: Merchant Dashboard [round, icon=browser]
node buyer: Buyer [round, icon=browser]
node api: Payments API [icon=server]
node payments: Payments Service [icon=shield]
node psp: PSP / Network [icon=sync]
node ledger: Ledger Service [icon=compute]
node wallet: Wallet Balance [icon=cache]
node webhook: Webhook Dispatcher [icon=worker]
node fraud: Fraud Detection [icon=search]
node notify: Notifications [icon=mail]
node db: Transactions DB [cylinder, icon=database]
node cache: Idempotency Cache [cylinder, icon=cache]

edge buyer -> api: charge
edge api -> payments: process
edge payments -> cache: idempotency key
edge payments -> psp: authorize
edge psp -> payments: result
edge payments -> ledger: record
edge ledger -> db: persist
edge payments -> wallet: settle
edge payments -> webhook: emit event
edge webhook -> merchant: callback
edge payments -> fraud: screen
edge fraud -> payments: verdict
edge payments -> notify: receipt
```

## Source


```text
title: Stripe Payments
node merchant: Merchant Dashboard [round, icon=browser]
node buyer: Buyer [round, icon=browser]
node api: Payments API [icon=server]
node payments: Payments Service [icon=shield]
node psp: PSP / Network [icon=sync]
node ledger: Ledger Service [icon=compute]
node wallet: Wallet Balance [icon=cache]
node webhook: Webhook Dispatcher [icon=worker]
node fraud: Fraud Detection [icon=search]
node notify: Notifications [icon=mail]
node db: Transactions DB [cylinder, icon=database]
node cache: Idempotency Cache [cylinder, icon=cache]

edge buyer -> api: charge
edge api -> payments: process
edge payments -> cache: idempotency key
edge payments -> psp: authorize
edge psp -> payments: result
edge payments -> ledger: record
edge ledger -> db: persist
edge payments -> wallet: settle
edge payments -> webhook: emit event
edge webhook -> merchant: callback
edge payments -> fraud: screen
edge fraud -> payments: verdict
edge payments -> notify: receipt
```
````
