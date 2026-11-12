# Digital Wallet — Payments

Design a digital wallet

**Difficulty:** Easy

**Tags:** notification, payments, security

## Functional Requirements

- a digital wallet
- guarantee balance consistency?
- avoid double-spending in transfers?
- reconcile with external payment rails?
- handle chargebacks and disputes?

## Non-Functional Requirements

- Balance consistency comes from treating money as an append-only sequence of
  ledger entries and deriving balances, never storing a mutable "current balance"
  as truth.

- Every entry records `(account_id, amount, currency, type, ref, seq)` with a
  per-account strictly increasing sequence number.
- A unique constraint on `(account_id, seq)` plus `(ref, type)` makes duplicate
  or out-of-order writes impossible.
- The debit/credit invariant — every transfer posts one debit and one equal
  credit — means the sum across all accounts is conserved.
- A reconciler that replays the ledger every few minutes can detect skew and
  alert.
- For hot accounts, hold the account lock (a single-writer row lock or a Redis
  distributed lock) during the check-and-post transaction so concurrent
  transfers serialize.
- For read-heavy accounts, keep a balance projection with an invariant
  `balance = sum(credits) - sum(debits)` enforced at write time.
- The Balance Cache is eventually consistent and rebuilt from the ledger on
  miss, so a crash never corrupts the source of truth..
- Double-spending is prevented by making check-and-spend atomic inside one
  transaction, not by locking at the app layer.

- A transfer reads the account balance and available holds, verifies `available
  > = amount`, then writes the debit and credit entries under a single account
  > lock.
- Because every spend is a conditional update against the same sequence-checked
  ledger, two concurrent requests cannot both pass the balance check.
- Holds are key: funds are reserved (posting a `hold` entry) before the actual
  debit.
- A pending payment locks the amount, and a later authorize/charge flow either
  settles the hold into a debit or releases it.
- Idempotency keys make retries safe — replaying a transfer with the same key
  hits the uniqueness constraint and returns the original result instead of
  spending twice.
- For cross-shard transfers, use a two-phase approach: post the debit and credit
  in a distributed transaction or a transactional outbox, then asynchronously
  confirm.
- Any failed leg is compensated by a reversing entry so money is never created
  or destroyed..
- External rails are treated as unreliable peers: the wallet is optimistic and
  reconciliation is the source of truth.

- Each outbound settlement records a `payment_ref` with the provider and posts a
  pending state.
- When the provider webhook confirms or bounces, the ledger resolves that entry
  into a completed or reversed state.
- Incoming deposits (cards, ACH, bank transfers) often arrive before any API
  call.
- The wallet matches inbound bank statements to user accounts by reference
  fields (account number + amount + date).
- It posts an unallocated-funds bucket when a match is unclear.
- A nightly reconciliation job pulls provider settlement reports and compares
  totals against the ledger.
- It flags any `payment_ref` that is not terminal within a deadline so ops can
  re-push or refund.
- Idempotency and retry with exponential backoff handle provider outages.
- All differences are logged with a disposition field for audit.
- The design accepts that the external rail's balance and the ledger will
  diverge briefly, and it resolves divergence via the reconciler rather than
  forcing synchronous consistency..
- Chargebacks arrive as an external event, usually through a provider webhook, and
  are handled as a new ledger lifecycle rather than a reversal of the original
  entry.

- On chargeback, the wallet posts a `hold` on the original transaction
  reference.
- It freezes the disputed amount in the user's available balance.
- It opens a dispute case with evidence (merchant record, proof of delivery,
  timestamps).
- The wallet then runs the dispute workflow: present evidence, wait for
  resolution.
- On outcome it posts either a `reversal` (user wins, funds returned) or a
  `finalize` (wallet wins, hold released and any fee charged).
- Chargebacks are tracked per account with velocity rules — repeated chargebacks
  lower the account's risk score and can trigger holds or KYC re-verification.
- They are reported back to payment providers to protect the wallet's own
  merchant reputation.
- Because chargeback windows last months, the ledger keeps the original entry
  immutable and stores dispute state separately.
- This keeps the money trail always auditable.
- Metrics on chargeback rate by merchant, card, and currency feed both fraud
  detection and business reviews.

## Source

````text
title: Digital Wallet
node user: User [round, icon=browser]
node app: Wallet App [icon=browser]
node api: Wallet API [icon=server]
node ledger: Ledger Service [icon=compute]
node account: Account Store [cylinder, icon=database]
node auth: Auth Service [icon=auth]
node pay: Payment Rail [icon=shield]
node kyc: Compliance [icon=search]
node notify: Notifications [icon=message]
node cache: Balance Cache [cylinder, icon=cache]

edge user -> app: top up
edge app -> api: deposit
edge api -> auth: verify
edge api -> ledger: credit
edge ledger -> account: balance
edge user -> app: pay
edge app -> api: transfer
edge api -> pay: settle
edge api -> ledger: debit
edge ledger -> notify: receipt
edge api -> kyc: screen
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Digital Wallet
user: User
app: Wallet App
api: Wallet API
ledger: Ledger Service
account: Account Store
auth: Auth Service
pay: Payment Rail
kyc: Compliance
notify: Notifications
cache: Balance Cache

user ─► app ─► top up
app ─► api ─► deposit
api ─► auth ─► verify
api ─► ledger ─► credit
ledger ─► account ─► balance
user ─► app ─► pay
app ─► api ─► transfer
api ─► pay ─► settle
api ─► ledger ─► debit
ledger ─► notify ─► receipt
api ─► kyc ─► screen
````

## Design

### Design a digital wallet

The wallet exposes an API that authenticates the user, screens the account
through KYC/AML checks, and routes every financial mutation through a single
Ledger Service.

- The ledger is the system of record: it appends immutable entries (deposits,
  debits, credits, holds, releases) to an append-only store backed by PostgreSQL
  or a purpose-built ledger database.
- It maintains per- account balances as a derived projection.
- Deposits flow in from a Payment Rail provider.
- Transfers move money between internal accounts as debit/credit pairs.
- Every completed mutation triggers a receipt notification.
- The ledger is wrapped in a hot Balance Cache for read paths — balance lookups,
  transaction history — while writes always hit the authoritative ledger.
- Scaling: the ledger shards by account (consistent hashing on account id) so a
  single account's transactions stay on one shard and remain serializable.
- Caches are invalidated on write.
- For failure handling, deposits and transfers are idempotent by
  `idempotency_key` so retried requests never double-post.

### How do you guarantee balance consistency?

Balance consistency comes from treating money as an append-only sequence of
ledger entries and deriving balances, never storing a mutable "current balance"
as truth.

- Every entry records `(account_id, amount, currency, type, ref, seq)` with a
  per-account strictly increasing sequence number.
- A unique constraint on `(account_id, seq)` plus `(ref, type)` makes duplicate
  or out-of-order writes impossible.
- The debit/credit invariant — every transfer posts one debit and one equal
  credit — means the sum across all accounts is conserved.
- A reconciler that replays the ledger every few minutes can detect skew and
  alert.
- For hot accounts, hold the account lock (a single-writer row lock or a Redis
  distributed lock) during the check-and-post transaction so concurrent
  transfers serialize.
- For read-heavy accounts, keep a balance projection with an invariant
  `balance = sum(credits) - sum(debits)` enforced at write time.
- The Balance Cache is eventually consistent and rebuilt from the ledger on
  miss, so a crash never corrupts the source of truth.

### How do you avoid double-spending in transfers?

Double-spending is prevented by making check-and-spend atomic inside one
transaction, not by locking at the app layer.

- A transfer reads the account balance and available holds, verifies `available
  > = amount`, then writes the debit and credit entries under a single account
  > lock.
- Because every spend is a conditional update against the same sequence-checked
  ledger, two concurrent requests cannot both pass the balance check.
- Holds are key: funds are reserved (posting a `hold` entry) before the actual
  debit.
- A pending payment locks the amount, and a later authorize/charge flow either
  settles the hold into a debit or releases it.
- Idempotency keys make retries safe — replaying a transfer with the same key
  hits the uniqueness constraint and returns the original result instead of
  spending twice.
- For cross-shard transfers, use a two-phase approach: post the debit and credit
  in a distributed transaction or a transactional outbox, then asynchronously
  confirm.
- Any failed leg is compensated by a reversing entry so money is never created
  or destroyed.

### How do you reconcile with external payment rails?

External rails are treated as unreliable peers: the wallet is optimistic and
reconciliation is the source of truth.

- Each outbound settlement records a `payment_ref` with the provider and posts a
  pending state.
- When the provider webhook confirms or bounces, the ledger resolves that entry
  into a completed or reversed state.
- Incoming deposits (cards, ACH, bank transfers) often arrive before any API
  call.
- The wallet matches inbound bank statements to user accounts by reference
  fields (account number + amount + date).
- It posts an unallocated-funds bucket when a match is unclear.
- A nightly reconciliation job pulls provider settlement reports and compares
  totals against the ledger.
- It flags any `payment_ref` that is not terminal within a deadline so ops can
  re-push or refund.
- Idempotency and retry with exponential backoff handle provider outages.
- All differences are logged with a disposition field for audit.
- The design accepts that the external rail's balance and the ledger will
  diverge briefly, and it resolves divergence via the reconciler rather than
  forcing synchronous consistency.

### How do you handle chargebacks and disputes?

Chargebacks arrive as an external event, usually through a provider webhook, and
are handled as a new ledger lifecycle rather than a reversal of the original
entry.

- On chargeback, the wallet posts a `hold` on the original transaction
  reference.
- It freezes the disputed amount in the user's available balance.
- It opens a dispute case with evidence (merchant record, proof of delivery,
  timestamps).
- The wallet then runs the dispute workflow: present evidence, wait for
  resolution.
- On outcome it posts either a `reversal` (user wins, funds returned) or a
  `finalize` (wallet wins, hold released and any fee charged).
- Chargebacks are tracked per account with velocity rules — repeated chargebacks
  lower the account's risk score and can trigger holds or KYC re-verification.
- They are reported back to payment providers to protect the wallet's own
  merchant reputation.
- Because chargeback windows last months, the ledger keeps the original entry
  immutable and stores dispute state separately.
- This keeps the money trail always auditable.
- Metrics on chargeback rate by merchant, card, and currency feed both fraud
  detection and business reviews.

## Source

```text
title: Digital Wallet
node user: User [round, icon=browser]
node app: Wallet App [icon=browser]
node api: Wallet API [icon=server]
node ledger: Ledger Service [icon=compute]
node account: Account Store [cylinder, icon=database]
node auth: Auth Service [icon=auth]
node pay: Payment Rail [icon=shield]
node kyc: Compliance [icon=search]
node notify: Notifications [icon=message]
node cache: Balance Cache [cylinder, icon=cache]

edge user -> app: top up
edge app -> api: deposit
edge api -> auth: verify
edge api -> ledger: credit
edge ledger -> account: balance
edge user -> app: pay
edge app -> api: transfer
edge api -> pay: settle
edge api -> ledger: debit
edge ledger -> notify: receipt
edge api -> kyc: screen
```

## Q&A

### Q: Design a digital wallet

**A:** The wallet exposes an API that authenticates the user, screens the account
through KYC/AML checks, and routes every financial mutation through a single
Ledger Service.

- The ledger is the system of record: it appends immutable entries (deposits,
  debits, credits, holds, releases) to an append-only store backed by PostgreSQL
  or a purpose-built ledger database.
- It maintains per- account balances as a derived projection.
- Deposits flow in from a Payment Rail provider.
- Transfers move money between internal accounts as debit/credit pairs.
- Every completed mutation triggers a receipt notification.
- The ledger is wrapped in a hot Balance Cache for read paths — balance lookups,
  transaction history — while writes always hit the authoritative ledger.
- Scaling: the ledger shards by account (consistent hashing on account id) so a
  single account's transactions stay on one shard and remain serializable.
- Caches are invalidated on write.
- For failure handling, deposits and transfers are idempotent by
  `idempotency_key` so retried requests never double-post.

### Q: How do you guarantee balance consistency?

**A:** Balance consistency comes from treating money as an append-only sequence of
ledger entries and deriving balances, never storing a mutable "current balance"
as truth.

- Every entry records `(account_id, amount, currency, type, ref, seq)` with a
  per-account strictly increasing sequence number.
- A unique constraint on `(account_id, seq)` plus `(ref, type)` makes duplicate
  or out-of-order writes impossible.
- The debit/credit invariant — every transfer posts one debit and one equal
  credit — means the sum across all accounts is conserved.
- A reconciler that replays the ledger every few minutes can detect skew and
  alert.
- For hot accounts, hold the account lock (a single-writer row lock or a Redis
  distributed lock) during the check-and-post transaction so concurrent
  transfers serialize.
- For read-heavy accounts, keep a balance projection with an invariant
  `balance = sum(credits) - sum(debits)` enforced at write time.
- The Balance Cache is eventually consistent and rebuilt from the ledger on
  miss, so a crash never corrupts the source of truth.

### Q: How do you avoid double-spending in transfers?

**A:** Double-spending is prevented by making check-and-spend atomic inside one
transaction, not by locking at the app layer.

- A transfer reads the account balance and available holds, verifies `available
  > = amount`, then writes the debit and credit entries under a single account
  > lock.
- Because every spend is a conditional update against the same sequence-checked
  ledger, two concurrent requests cannot both pass the balance check.
- Holds are key: funds are reserved (posting a `hold` entry) before the actual
  debit.
- A pending payment locks the amount, and a later authorize/charge flow either
  settles the hold into a debit or releases it.
- Idempotency keys make retries safe — replaying a transfer with the same key
  hits the uniqueness constraint and returns the original result instead of
  spending twice.
- For cross-shard transfers, use a two-phase approach: post the debit and credit
  in a distributed transaction or a transactional outbox, then asynchronously
  confirm.
- Any failed leg is compensated by a reversing entry so money is never created
  or destroyed.

### Q: How do you reconcile with external payment rails?

**A:** External rails are treated as unreliable peers: the wallet is optimistic and
reconciliation is the source of truth.

- Each outbound settlement records a `payment_ref` with the provider and posts a
  pending state.
- When the provider webhook confirms or bounces, the ledger resolves that entry
  into a completed or reversed state.
- Incoming deposits (cards, ACH, bank transfers) often arrive before any API
  call.
- The wallet matches inbound bank statements to user accounts by reference
  fields (account number + amount + date).
- It posts an unallocated-funds bucket when a match is unclear.
- A nightly reconciliation job pulls provider settlement reports and compares
  totals against the ledger.
- It flags any `payment_ref` that is not terminal within a deadline so ops can
  re-push or refund.
- Idempotency and retry with exponential backoff handle provider outages.
- All differences are logged with a disposition field for audit.
- The design accepts that the external rail's balance and the ledger will
  diverge briefly, and it resolves divergence via the reconciler rather than
  forcing synchronous consistency.

### Q: How do you handle chargebacks and disputes?

**A:** Chargebacks arrive as an external event, usually through a provider webhook, and
are handled as a new ledger lifecycle rather than a reversal of the original
entry.

- On chargeback, the wallet posts a `hold` on the original transaction
  reference.
- It freezes the disputed amount in the user's available balance.
- It opens a dispute case with evidence (merchant record, proof of delivery,
  timestamps).
- The wallet then runs the dispute workflow: present evidence, wait for
  resolution.
- On outcome it posts either a `reversal` (user wins, funds returned) or a
  `finalize` (wallet wins, hold released and any fee charged).
- Chargebacks are tracked per account with velocity rules — repeated chargebacks
  lower the account's risk score and can trigger holds or KYC re-verification.
- They are reported back to payment providers to protect the wallet's own
  merchant reputation.
- Because chargeback windows last months, the ledger keeps the original entry
  immutable and stores dispute state separately.
- This keeps the money trail always auditable.
- Metrics on chargeback rate by merchant, card, and currency feed both fraud
  detection and business reviews.

## Source

```text
title: Digital Wallet
node user: User [round, icon=browser]
node app: Wallet App [icon=browser]
node api: Wallet API [icon=server]
node ledger: Ledger Service [icon=compute]
node account: Account Store [cylinder, icon=database]
node auth: Auth Service [icon=auth]
node pay: Payment Rail [icon=shield]
node kyc: Compliance [icon=search]
node notify: Notifications [icon=message]
node cache: Balance Cache [cylinder, icon=cache]

edge user -> app: top up
edge app -> api: deposit
edge api -> auth: verify
edge api -> ledger: credit
edge ledger -> account: balance
edge user -> app: pay
edge app -> api: transfer
edge api -> pay: settle
edge api -> ledger: debit
edge ledger -> notify: receipt
edge api -> kyc: screen
```
