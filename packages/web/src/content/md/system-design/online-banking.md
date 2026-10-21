# Online Banking

Design an online banking system

**Difficulty:** Hard

**Tags:** database, finance, notification, payments

## Functional Requirements

- an online banking system
- ensure transfers are atomic and consistent?
- design the ledger and double-entry accounting?
- detect fraud and flag suspicious activity?
- handle high traffic on paydays?

## Non-Functional Requirements

- Online banking is a correctness-first system wrapped in a modern API:

- Accounts, transfers, payments, and notifications all sit on top of an
  authoritative ledger.
- I would build a gateway in front of auth, account, transfer, ledger, fraud
  detection, and payment services, with an Accounts DB and a notification
  service.
- Every write is validated against a double-entry ledger, and the read side is
  served from materialized views so customers always see consistent balances.
- Sessions are short-lived with re-authentication for sensitive actions like
  adding a payee or changing a password.

The customer flow is straightforward:

- Login through the app, authenticate through the auth service, then query
  balances or initiate transfers.
- A transfer is a saga across services (debit the source account, record both
  entries in the ledger, settle through payments, and notify both parties)
  coordinated so that a failure anywhere rolls back to a consistent state.
- Reads are read-heavy and cacheable, so the balance endpoint never touches the
  hot ledger path.
- Mobile pushes and SMS carry receipts, but the app also refreshes from the
  authoritative state so a push can never be the only source of truth.

The defining constraint is that money systems cannot lose a write:

- The ledger is append-only, every entry has a unique id, and idempotency keys
  make retries safe.
- The tradeoff is that strong consistency costs latency and throughput, which is
  why the system separates the interactive path from the settlement path.
- Batch processes like statement generation and interest accrual read from the
  same ledger without interfering with live traffic.
- The design deliberately avoids a single shared database across services, using
  events to keep views fresh while each service owns its writes..
- A transfer is two accounting entries that must either both happen or neither
  happen:

- I would implement it as a transaction that debits the source account and
  credits the destination in a single atomic operation, executed by the transfer
  service against the account service with the ledger as the durable record.
- The key is the ordering: debit first, then credit, within one distributed
  transaction or, when accounts share a shard, one local database transaction.
- The same mechanism covers bill payments and peer-to-peer transfers, so one
  well-tested transfer core serves every product.

When accounts live on different shards, a local transaction is impossible:

- I would use a two-phase commit or, more practically, a saga with compensating
  actions: debit the source, reserve the credit, and if the credit fails,
  reverse the debit.
- Because reversal can also fail, each step is idempotent and the saga is
  replayed until it reaches a terminal state.
- The balance invariant is checked at every step (a source that cannot cover the
  debit rejects the transfer entirely rather than going negative).
- Notifications fire only after the saga commits, so customers never see a
  failed transfer acknowledged as success.

Consistency is also about ordering:

- Transfers are serialized per account so a double-spend race is impossible.
- I would attach a version or sequence to each account balance, and a transfer
  only commits if the version it read is unchanged.
- The tradeoff is that strong serialization reduces concurrency per account,
  which is acceptable because a single customer's transfers are naturally
  low-frequency compared with the system's total throughput.
- Read replicas serve balance history, while the authoritative balance lives
  only on the primary path that performs writes..
- Fraud detection runs in two speeds: real-time gating on the transaction path and
  offline analytics over the full history:

- I would place a fraud screening step between the transfer service and
  settlement so a suspicious transfer can be blocked before money moves.
- The real-time layer combines rules (velocity, amount thresholds, unusual
  geography, new device) with a machine-learned score, and only transactions
  that pass both reach the ledger.
- Device fingerprinting and behavioral signals like typing rhythm add
  frictionless context at the gateway.

The offline layer trains on labeled fraud, with features like spend history,
merchant categories, and device reputation, served from a feature store:

- Because fraudsters adapt quickly, the model retrains frequently on fresh
  labels, and the rules are versioned so an investigator can see which version
  decided each case.
- False positives are expensive and erode trust, so the system scores rather
  than blocks: only high-confidence signals hard-block, while moderate signals
  trigger step-up verification like an OTP.
- Feedback from investigations is collected as labels, closing the loop between
  the review queue and model training.

The tradeoff is latency versus coverage:

- Deep analytics cannot finish inside the 200-millisecond budget of a payment,
  so the design layers them: rules and a fast model gate the transaction, a
  slower ensemble reviews asynchronously for post-hoc blocking and account
  review.
- Notifications alert the customer on risky activity, and a review queue gives
  analysts the transaction graph with all context.
- Every decision is logged for both customer support and regulatory defense.
- Local anomalies, such as a card used in two cities an hour apart, fire rules
  before the model even runs..
- Payday concentrates writes:

- Millions of employers send direct deposits and customers immediately transfer,
  pay bills, and check balances.
- The read side spikes as everyone checks their balance in the first minutes.
- I would pre-scale the read path (caches, read replicas, and materialized
  balance views) and shape the write path with queueing so that settlement
  absorbs the burst without dropping a single deposit.
- Historical payday load plus projected payroll growth drives the capacity plan,
  re-run before every major payday event.

Direct deposits are scheduled, so I would stage them:

- Employers submit files ahead of the payday window, the bank ingests and
  validates them in batches, and settlement is released at the agreed effective
  time.
- Because these are batch writes, they naturally distribute load across the
  window rather than a single midnight stampede.
- Customer-initiated transfers still go through the normal serialized path, and
  the queue gives them back-pressure and an explicit status instead of timeouts.
- If a single employer file fails validation, it is quarantined and retried, not
  merged into the live queue, so one bad file cannot stall everyone.

The queue must never lose money:

- A deposit that sits in the queue is acknowledged, durable, and ordered, and
  consumers process it exactly once.
- I would monitor queue depth and consumer lag as the primary payday signals and
  pre-provision consumers for the forecast load.
- The tradeoff is that queued settlement introduces minutes of delay, which is
  invisible to customers as long as the promise is honored at the bank's value
  time.
- Read replicas scale horizontally and the cache is warmed with expected
  balances so the first tap after midnight is fast.

## Source

````text
title: Online Banking
node customer: Customer [round, icon=browser]
node app: Banking App [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Auth Service [icon=shield]
node account: Account Service [icon=compute]
node transfer: Transfer Service [icon=compute]
node ledger: Ledger [cylinder, icon=database]
node fraud: Fraud Detection [icon=shield]
node pay: Payments [icon=compute]
node notify: Notifications [icon=message]
node db: Accounts DB [cylinder, icon=database]

edge customer -> app: login
edge app -> gateway: request
edge gateway -> auth: verify
edge customer -> app: transfer
edge gateway -> transfer: initiate
edge transfer -> account: debit
edge account -> ledger: record
edge ledger -> pay: settle
edge pay -> notify: receipt
edge gateway -> fraud: screen
edge fraud -> transfer: block
edge account -> db: balance
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Online Banking
customer: Customer
app: Banking App
gateway: API Gateway
auth: Auth Service
account: Account Service
transfer: Transfer Service
ledger: Ledger
fraud: Fraud Detection
pay: Payments
notify: Notifications
db: Accounts DB

customer ─► app ─► login
app ─► gateway ─► request
gateway ─► auth ─► verify
customer ─► app ─► transfer
gateway ─► transfer ─► initiate
transfer ─► account ─► debit
account ─► ledger ─► record
ledger ─► pay ─► settle
pay ─► notify ─► receipt
gateway ─► fraud ─► screen
fraud ─► transfer ─► block
account ─► db ─► balance
````

## Design

### Design an online banking system

Online banking is a correctness-first system wrapped in a modern API:

- Accounts, transfers, payments, and notifications all sit on top of an
  authoritative ledger.
- I would build a gateway in front of auth, account, transfer, ledger, fraud
  detection, and payment services, with an Accounts DB and a notification
  service.
- Every write is validated against a double-entry ledger, and the read side is
  served from materialized views so customers always see consistent balances.
- Sessions are short-lived with re-authentication for sensitive actions like
  adding a payee or changing a password.

The customer flow is straightforward:

- Login through the app, authenticate through the auth service, then query
  balances or initiate transfers.
- A transfer is a saga across services (debit the source account, record both
  entries in the ledger, settle through payments, and notify both parties)
  coordinated so that a failure anywhere rolls back to a consistent state.
- Reads are read-heavy and cacheable, so the balance endpoint never touches the
  hot ledger path.
- Mobile pushes and SMS carry receipts, but the app also refreshes from the
  authoritative state so a push can never be the only source of truth.

The defining constraint is that money systems cannot lose a write:

- The ledger is append-only, every entry has a unique id, and idempotency keys
  make retries safe.
- The tradeoff is that strong consistency costs latency and throughput, which is
  why the system separates the interactive path from the settlement path.
- Batch processes like statement generation and interest accrual read from the
  same ledger without interfering with live traffic.
- The design deliberately avoids a single shared database across services, using
  events to keep views fresh while each service owns its writes.

### How do you ensure transfers are atomic and consistent?

A transfer is two accounting entries that must either both happen or neither
happen:

- I would implement it as a transaction that debits the source account and
  credits the destination in a single atomic operation, executed by the transfer
  service against the account service with the ledger as the durable record.
- The key is the ordering: debit first, then credit, within one distributed
  transaction or, when accounts share a shard, one local database transaction.
- The same mechanism covers bill payments and peer-to-peer transfers, so one
  well-tested transfer core serves every product.

When accounts live on different shards, a local transaction is impossible:

- I would use a two-phase commit or, more practically, a saga with compensating
  actions: debit the source, reserve the credit, and if the credit fails,
  reverse the debit.
- Because reversal can also fail, each step is idempotent and the saga is
  replayed until it reaches a terminal state.
- The balance invariant is checked at every step (a source that cannot cover the
  debit rejects the transfer entirely rather than going negative).
- Notifications fire only after the saga commits, so customers never see a
  failed transfer acknowledged as success.

Consistency is also about ordering:

- Transfers are serialized per account so a double-spend race is impossible.
- I would attach a version or sequence to each account balance, and a transfer
  only commits if the version it read is unchanged.
- The tradeoff is that strong serialization reduces concurrency per account,
  which is acceptable because a single customer's transfers are naturally
  low-frequency compared with the system's total throughput.
- Read replicas serve balance history, while the authoritative balance lives
  only on the primary path that performs writes.

### How do you design the ledger and double-entry accounting?

The ledger is the backbone of a bank: it records every movement of money in a
way that can be proven to balance:

- I would use a double-entry design where each transaction creates at least two
  entries (a debit and a credit) that sum to zero, so the ledger can be balanced
  at any time by summing accounts.
- Every entry carries the account id, amount, currency, timestamp, and a unique
  transaction id, and entries are written append-only so history is never
  amended.
- Currency is explicit on every entry because a bank crosses currency boundaries
  constantly, and conversion entries pair a buy with a sell.

Because the ledger is append-only, corrections are themselves new entries that
reverse the original rather than edits:

- I would shard the ledger by account while keeping transactions spanning two
  accounts on one shard as much as possible, using an event log with sequence
  numbers to guarantee a total order per account.
- The ledger's invariant (total debits equal total credits) is checked
  continuously by a balancing worker, and any imbalance blocks further
  settlement on that shard.
- Balances are derived, never stored redundantly, so a corrupted balance can
  always be rebuilt from the ledger.

The ledger serves both operations and audit:

- Regulators and accountants need to trace any balance to the transactions that
  produced it, so the ledger keeps a hash chain over entries that makes
  tampering detectable.
- The tradeoff is storage growth: append-only data grows forever, so I would
  tier it, keeping recent entries hot in a primary database and archiving older
  ones with their hashes intact so the chain remains verifiable across tiers.

### How do you detect fraud and flag suspicious activity?

Fraud detection runs in two speeds: real-time gating on the transaction path and
offline analytics over the full history:

- I would place a fraud screening step between the transfer service and
  settlement so a suspicious transfer can be blocked before money moves.
- The real-time layer combines rules (velocity, amount thresholds, unusual
  geography, new device) with a machine-learned score, and only transactions
  that pass both reach the ledger.
- Device fingerprinting and behavioral signals like typing rhythm add
  frictionless context at the gateway.

The offline layer trains on labeled fraud, with features like spend history,
merchant categories, and device reputation, served from a feature store:

- Because fraudsters adapt quickly, the model retrains frequently on fresh
  labels, and the rules are versioned so an investigator can see which version
  decided each case.
- False positives are expensive and erode trust, so the system scores rather
  than blocks: only high-confidence signals hard-block, while moderate signals
  trigger step-up verification like an OTP.
- Feedback from investigations is collected as labels, closing the loop between
  the review queue and model training.

The tradeoff is latency versus coverage:

- Deep analytics cannot finish inside the 200-millisecond budget of a payment,
  so the design layers them: rules and a fast model gate the transaction, a
  slower ensemble reviews asynchronously for post-hoc blocking and account
  review.
- Notifications alert the customer on risky activity, and a review queue gives
  analysts the transaction graph with all context.
- Every decision is logged for both customer support and regulatory defense.
- Local anomalies, such as a card used in two cities an hour apart, fire rules
  before the model even runs.

### How do you handle high traffic on paydays?

Payday concentrates writes:

- Millions of employers send direct deposits and customers immediately transfer,
  pay bills, and check balances.
- The read side spikes as everyone checks their balance in the first minutes.
- I would pre-scale the read path (caches, read replicas, and materialized
  balance views) and shape the write path with queueing so that settlement
  absorbs the burst without dropping a single deposit.
- Historical payday load plus projected payroll growth drives the capacity plan,
  re-run before every major payday event.

Direct deposits are scheduled, so I would stage them:

- Employers submit files ahead of the payday window, the bank ingests and
  validates them in batches, and settlement is released at the agreed effective
  time.
- Because these are batch writes, they naturally distribute load across the
  window rather than a single midnight stampede.
- Customer-initiated transfers still go through the normal serialized path, and
  the queue gives them back-pressure and an explicit status instead of timeouts.
- If a single employer file fails validation, it is quarantined and retried, not
  merged into the live queue, so one bad file cannot stall everyone.

The queue must never lose money:

- A deposit that sits in the queue is acknowledged, durable, and ordered, and
  consumers process it exactly once.
- I would monitor queue depth and consumer lag as the primary payday signals and
  pre-provision consumers for the forecast load.
- The tradeoff is that queued settlement introduces minutes of delay, which is
  invisible to customers as long as the promise is honored at the bank's value
  time.
- Read replicas scale horizontally and the cache is warmed with expected
  balances so the first tap after midnight is fast.

## Source

```text
title: Online Banking
node customer: Customer [round, icon=browser]
node app: Banking App [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Auth Service [icon=shield]
node account: Account Service [icon=compute]
node transfer: Transfer Service [icon=compute]
node ledger: Ledger [cylinder, icon=database]
node fraud: Fraud Detection [icon=shield]
node pay: Payments [icon=compute]
node notify: Notifications [icon=message]
node db: Accounts DB [cylinder, icon=database]

edge customer -> app: login
edge app -> gateway: request
edge gateway -> auth: verify
edge customer -> app: transfer
edge gateway -> transfer: initiate
edge transfer -> account: debit
edge account -> ledger: record
edge ledger -> pay: settle
edge pay -> notify: receipt
edge gateway -> fraud: screen
edge fraud -> transfer: block
edge account -> db: balance
```

## Q&A

### Q: Design an online banking system

**A:** Online banking is a correctness-first system wrapped in a modern API:

- Accounts, transfers, payments, and notifications all sit on top of an
  authoritative ledger.
- I would build a gateway in front of auth, account, transfer, ledger, fraud
  detection, and payment services, with an Accounts DB and a notification
  service.
- Every write is validated against a double-entry ledger, and the read side is
  served from materialized views so customers always see consistent balances.
- Sessions are short-lived with re-authentication for sensitive actions like
  adding a payee or changing a password.

The customer flow is straightforward:

- Login through the app, authenticate through the auth service, then query
  balances or initiate transfers.
- A transfer is a saga across services (debit the source account, record both
  entries in the ledger, settle through payments, and notify both parties)
  coordinated so that a failure anywhere rolls back to a consistent state.
- Reads are read-heavy and cacheable, so the balance endpoint never touches the
  hot ledger path.
- Mobile pushes and SMS carry receipts, but the app also refreshes from the
  authoritative state so a push can never be the only source of truth.

The defining constraint is that money systems cannot lose a write:

- The ledger is append-only, every entry has a unique id, and idempotency keys
  make retries safe.
- The tradeoff is that strong consistency costs latency and throughput, which is
  why the system separates the interactive path from the settlement path.
- Batch processes like statement generation and interest accrual read from the
  same ledger without interfering with live traffic.
- The design deliberately avoids a single shared database across services, using
  events to keep views fresh while each service owns its writes.

### Q: How do you ensure transfers are atomic and consistent?

**A:** A transfer is two accounting entries that must either both happen or neither
happen:

- I would implement it as a transaction that debits the source account and
  credits the destination in a single atomic operation, executed by the transfer
  service against the account service with the ledger as the durable record.
- The key is the ordering: debit first, then credit, within one distributed
  transaction or, when accounts share a shard, one local database transaction.
- The same mechanism covers bill payments and peer-to-peer transfers, so one
  well-tested transfer core serves every product.

When accounts live on different shards, a local transaction is impossible:

- I would use a two-phase commit or, more practically, a saga with compensating
  actions: debit the source, reserve the credit, and if the credit fails,
  reverse the debit.
- Because reversal can also fail, each step is idempotent and the saga is
  replayed until it reaches a terminal state.
- The balance invariant is checked at every step (a source that cannot cover the
  debit rejects the transfer entirely rather than going negative).
- Notifications fire only after the saga commits, so customers never see a
  failed transfer acknowledged as success.

Consistency is also about ordering:

- Transfers are serialized per account so a double-spend race is impossible.
- I would attach a version or sequence to each account balance, and a transfer
  only commits if the version it read is unchanged.
- The tradeoff is that strong serialization reduces concurrency per account,
  which is acceptable because a single customer's transfers are naturally
  low-frequency compared with the system's total throughput.
- Read replicas serve balance history, while the authoritative balance lives
  only on the primary path that performs writes.

### Q: How do you design the ledger and double-entry accounting?

**A:** The ledger is the backbone of a bank: it records every movement of money in a
way that can be proven to balance:

- I would use a double-entry design where each transaction creates at least two
  entries (a debit and a credit) that sum to zero, so the ledger can be balanced
  at any time by summing accounts.
- Every entry carries the account id, amount, currency, timestamp, and a unique
  transaction id, and entries are written append-only so history is never
  amended.
- Currency is explicit on every entry because a bank crosses currency boundaries
  constantly, and conversion entries pair a buy with a sell.

Because the ledger is append-only, corrections are themselves new entries that
reverse the original rather than edits:

- I would shard the ledger by account while keeping transactions spanning two
  accounts on one shard as much as possible, using an event log with sequence
  numbers to guarantee a total order per account.
- The ledger's invariant (total debits equal total credits) is checked
  continuously by a balancing worker, and any imbalance blocks further
  settlement on that shard.
- Balances are derived, never stored redundantly, so a corrupted balance can
  always be rebuilt from the ledger.

The ledger serves both operations and audit:

- Regulators and accountants need to trace any balance to the transactions that
  produced it, so the ledger keeps a hash chain over entries that makes
  tampering detectable.
- The tradeoff is storage growth: append-only data grows forever, so I would
  tier it, keeping recent entries hot in a primary database and archiving older
  ones with their hashes intact so the chain remains verifiable across tiers.

### Q: How do you detect fraud and flag suspicious activity?

**A:** Fraud detection runs in two speeds: real-time gating on the transaction path and
offline analytics over the full history:

- I would place a fraud screening step between the transfer service and
  settlement so a suspicious transfer can be blocked before money moves.
- The real-time layer combines rules (velocity, amount thresholds, unusual
  geography, new device) with a machine-learned score, and only transactions
  that pass both reach the ledger.
- Device fingerprinting and behavioral signals like typing rhythm add
  frictionless context at the gateway.

The offline layer trains on labeled fraud, with features like spend history,
merchant categories, and device reputation, served from a feature store:

- Because fraudsters adapt quickly, the model retrains frequently on fresh
  labels, and the rules are versioned so an investigator can see which version
  decided each case.
- False positives are expensive and erode trust, so the system scores rather
  than blocks: only high-confidence signals hard-block, while moderate signals
  trigger step-up verification like an OTP.
- Feedback from investigations is collected as labels, closing the loop between
  the review queue and model training.

The tradeoff is latency versus coverage:

- Deep analytics cannot finish inside the 200-millisecond budget of a payment,
  so the design layers them: rules and a fast model gate the transaction, a
  slower ensemble reviews asynchronously for post-hoc blocking and account
  review.
- Notifications alert the customer on risky activity, and a review queue gives
  analysts the transaction graph with all context.
- Every decision is logged for both customer support and regulatory defense.
- Local anomalies, such as a card used in two cities an hour apart, fire rules
  before the model even runs.

### Q: How do you handle high traffic on paydays?

**A:** Payday concentrates writes:

- Millions of employers send direct deposits and customers immediately transfer,
  pay bills, and check balances.
- The read side spikes as everyone checks their balance in the first minutes.
- I would pre-scale the read path (caches, read replicas, and materialized
  balance views) and shape the write path with queueing so that settlement
  absorbs the burst without dropping a single deposit.
- Historical payday load plus projected payroll growth drives the capacity plan,
  re-run before every major payday event.

Direct deposits are scheduled, so I would stage them:

- Employers submit files ahead of the payday window, the bank ingests and
  validates them in batches, and settlement is released at the agreed effective
  time.
- Because these are batch writes, they naturally distribute load across the
  window rather than a single midnight stampede.
- Customer-initiated transfers still go through the normal serialized path, and
  the queue gives them back-pressure and an explicit status instead of timeouts.
- If a single employer file fails validation, it is quarantined and retried, not
  merged into the live queue, so one bad file cannot stall everyone.

The queue must never lose money:

- A deposit that sits in the queue is acknowledged, durable, and ordered, and
  consumers process it exactly once.
- I would monitor queue depth and consumer lag as the primary payday signals and
  pre-provision consumers for the forecast load.
- The tradeoff is that queued settlement introduces minutes of delay, which is
  invisible to customers as long as the promise is honored at the bank's value
  time.
- Read replicas scale horizontally and the cache is warmed with expected
  balances so the first tap after midnight is fast.

## Source

```text
title: Online Banking
node customer: Customer [round, icon=browser]
node app: Banking App [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Auth Service [icon=shield]
node account: Account Service [icon=compute]
node transfer: Transfer Service [icon=compute]
node ledger: Ledger [cylinder, icon=database]
node fraud: Fraud Detection [icon=shield]
node pay: Payments [icon=compute]
node notify: Notifications [icon=message]
node db: Accounts DB [cylinder, icon=database]

edge customer -> app: login
edge app -> gateway: request
edge gateway -> auth: verify
edge customer -> app: transfer
edge gateway -> transfer: initiate
edge transfer -> account: debit
edge account -> ledger: record
edge ledger -> pay: settle
edge pay -> notify: receipt
edge gateway -> fraud: screen
edge fraud -> transfer: block
edge account -> db: balance
```
