# Ledger System — Financial Posting

Design a double-entry ledger / accounting system

**Difficulty:** Hard

**Tags:** payments, consistency, realtime

## Functional Requirements

- a double-entry ledger / accounting system
- guarantee exactly-once posting for a money movement?
- ensure balance consistency at scale (debits = credits)?
- handle reconciliation and produce financial reports?
- make the ledger immutable, auditable, and tamper-evident?

## Non-Functional Requirements

- FOR UPDATE`) or using a compare-and-swap on a balance version.
- To scale beyond a single database, the journal is sharded by entry id and
  balances are sharded by account id; a cross-account batch serializes through
  per-account locks so the double-entry invariant still holds.

Corrections never rewrite history:

- Entries are never updated or deleted; mistakes are fixed with reversing
  entries posted as new journal batches, preserving the audit trail..
- Exactly-once is implemented as idempotent-at-least-once: the client retries
  freely, and the server makes duplicate requests harmless by keying every
  operation.

- The client generates a unique idempotency key per logical operation, for
  example `order_id + attempt_number`, and sends it on every retry.
- The posting service records the completed operation's result keyed by that
  idempotency key, in the same transaction that writes the journal entries.
- A unique constraint on the idempotency key means a second request either waits
  on the in-flight transaction or finds the stored result and returns it
  unchanged.
- This turns at-least-once delivery into exactly-once semantics at the
  application boundary.

Failure handling is deterministic:

- If the response is lost after commit, the client retries with the same key and
  receives the original stored result, so no money movement is duplicated.
- If the transaction never commits, the retry starts fresh under the same key;
  the unique constraint guarantees only one commit ever wins.
- Ambiguous outcomes such as timeouts and crashes mid-commit resolve
  deterministically, because the result depends only on the key.
- Idempotency records expire after a retention window (typically 24h–30d) sized
  to the retry policy of the downstream clients.

Reliable event delivery uses the outbox pattern:

- The ledger write and the outbox insert happen in the same transaction; a relay
  then publishes events with at-least-once delivery and consumers dedupe by
  message id.
- Failed deliveries are parked in a dead-letter queue alongside their original
  key, so operators can replay without ever creating a duplicate posting..
- Consistency is enforced where the write happens, not discovered afterward by
  post-hoc checks.

- Every batch is validated before commit: the sum of signed debits must equal
  the sum of signed credits, or the post is rejected outright.
- Balances are updated atomically with the entries, either by taking a row lock
  on each affected account or by a conditional update on a balance version.
- Contention is minimized by sharding: entries by entry id and balances by
  account id, so concurrent posts to different accounts never serialize.

Scaling the write path:

- Where a single cross-account transaction cannot be held (for example mass
  payouts with high fan-out), per-account locks in a sharded key-value store
  serialize all updates to one account while allowing parallelism across
  accounts.
- Idempotency keys remain the unit of deduplication in sharded layouts; the
  entry shard owns the unique constraint.

Detection and repair:

- A reconciler recomputes balances from the journal on a schedule and diffs them
  against the materialized balance store; any drift raises an alert.
- A trial-balance job sums debits and credits per account and per day, and the
  two totals must cancel to zero.
- Genuine defects are corrected only through compensating entries, which are
  themselves posted through the normal double-entry path.

Multi-currency handling:

- Balances are tracked per (account, currency), and FX conversions post through
  explicit conversion accounts so different currencies never silently merge.
- Monetary columns are integers with an explicit scale, avoiding float error in
  both storage and reporting..
- Reconciliation matches the ledger against an external or internal counterpart,
  and reporting projects the journal onto financial statements.

- Every entry carries references such as order id, payment id, and settlement
  id, so counterparty transactions can be matched by key.
- A daily batch job joins ledger entries to bank and payment-provider records;
  matches are confirmed automatically, and unmatched items flow to an exception
  queue for investigation.
- The general ledger aggregates subledgers such as accounts receivable, accounts
  payable, and payroll through offset accounts, keeping one source of truth.

Reporting is derived, never stored separately:

- Financial statements (trial balance, balance sheet, income statement) are
  computed by grouping the journal by account and effective date.
- Point-in-time correctness uses effective-dated entries: a report as of date D
  sums only entries with `effective_date <= D`, regardless of when they posted.
- Period close: once a period closes, posting to it is blocked; adjustments
  enter as dated entries in the open period, preserving the closed period's
  immutability.
- At scale, per-account daily aggregates are maintained so reporting does not
  re-scan the raw journal on every request.

Operational controls:

- Automated controls flag unbalanced batches, missing references, and stale
  reconciliations, and findings are tracked to resolution.
- Every report run records its definition and timestamp so an auditor can
  reproduce any figure exactly..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Ledger System
client: Merchant / API Client
gateway: Ledger API Gateway
posting: Posting Service
idem: Idempotency Store
journal: Journal DB
balance: Balance Store
account: Chart of Accounts
reconn: Reconciliation Job
report: Reporting / Statements
alert: Alerts
archive: Archive / Notary

client ─► gateway ─► post entries
gateway ─► posting ─► validate + idempotency
posting ─► idem ─► check / store key
posting ─► journal ─► insert entries (append-only)
posting ─► balance ─► update running totals
posting ─► account ─► lookup accounts
posting ─► gateway ─► commit result
journal ─► reconn ─► scan entries
reconn ─► alert ─► drift / unmatched
journal ─► report ─► aggregate by account
journal ─► archive ─► hash snapshots
archive ─► alert ─► integrity check
```

## Design

### Design a double-entry ledger / accounting system

A ledger is the system of record for every money movement. It enforces the
double-entry invariant: no amount is ever created or destroyed, because every
posting writes two entries — a debit to one account and a credit to another — so
the sum of debits always equals the sum of credits.

- The core invariant: each journal batch must post with Σ debits == Σ credits,
  which keeps the entire ledger in balance at all times.
- Account types determine direction: debits increase assets and expenses;
  credits increase liabilities, equity, and revenue.
- Amounts are stored as integer minor units (cents) with an explicit currency,
  which eliminates floating-point drift in both storage and arithmetic.

The write path is a short, well-defined sequence:

- The API validates the request shape, accounts, currencies, and permission.
- The posting service checks idempotency to reject duplicate operations.
- A single ACID transaction inserts the journal entries and updates the
  materialized balances, then commits atomically.

Storage is split by responsibility:

- Journal — an append-only table of entries; this is the single source of truth
  that every balance and report is derived from.
- Balance store — materialized running totals per (account, currency), rebuilt
  from the journal whenever needed.
- Account store — the chart of accounts with metadata such as account type,
  currency, and status.

Consistency and concurrency:

- Entries are posted inside one transaction per operation, and a unique
  constraint on the idempotency key makes double posting impossible.
- Contention is bounded by locking only the affected account rows
  (`SELECT ... FOR UPDATE`) or using a compare-and-swap on a balance version.
- To scale beyond a single database, the journal is sharded by entry id and
  balances are sharded by account id; a cross-account batch serializes through
  per-account locks so the double-entry invariant still holds.

Corrections never rewrite history:

- Entries are never updated or deleted; mistakes are fixed with reversing
  entries posted as new journal batches, preserving the audit trail.

### How do you guarantee exactly-once posting for a money movement?

Exactly-once is implemented as idempotent-at-least-once: the client retries
freely, and the server makes duplicate requests harmless by keying every
operation.

- The client generates a unique idempotency key per logical operation, for
  example `order_id + attempt_number`, and sends it on every retry.
- The posting service records the completed operation's result keyed by that
  idempotency key, in the same transaction that writes the journal entries.
- A unique constraint on the idempotency key means a second request either waits
  on the in-flight transaction or finds the stored result and returns it
  unchanged.
- This turns at-least-once delivery into exactly-once semantics at the
  application boundary.

Failure handling is deterministic:

- If the response is lost after commit, the client retries with the same key and
  receives the original stored result, so no money movement is duplicated.
- If the transaction never commits, the retry starts fresh under the same key;
  the unique constraint guarantees only one commit ever wins.
- Ambiguous outcomes such as timeouts and crashes mid-commit resolve
  deterministically, because the result depends only on the key.
- Idempotency records expire after a retention window (typically 24h–30d) sized
  to the retry policy of the downstream clients.

Reliable event delivery uses the outbox pattern:

- The ledger write and the outbox insert happen in the same transaction; a relay
  then publishes events with at-least-once delivery and consumers dedupe by
  message id.
- Failed deliveries are parked in a dead-letter queue alongside their original
  key, so operators can replay without ever creating a duplicate posting.

### How do you ensure balance consistency at scale (debits = credits)?

Consistency is enforced where the write happens, not discovered afterward by
post-hoc checks.

- Every batch is validated before commit: the sum of signed debits must equal
  the sum of signed credits, or the post is rejected outright.
- Balances are updated atomically with the entries, either by taking a row lock
  on each affected account or by a conditional update on a balance version.
- Contention is minimized by sharding: entries by entry id and balances by
  account id, so concurrent posts to different accounts never serialize.

Scaling the write path:

- Where a single cross-account transaction cannot be held (for example mass
  payouts with high fan-out), per-account locks in a sharded key-value store
  serialize all updates to one account while allowing parallelism across
  accounts.
- Idempotency keys remain the unit of deduplication in sharded layouts; the
  entry shard owns the unique constraint.

Detection and repair:

- A reconciler recomputes balances from the journal on a schedule and diffs them
  against the materialized balance store; any drift raises an alert.
- A trial-balance job sums debits and credits per account and per day, and the
  two totals must cancel to zero.
- Genuine defects are corrected only through compensating entries, which are
  themselves posted through the normal double-entry path.

Multi-currency handling:

- Balances are tracked per (account, currency), and FX conversions post through
  explicit conversion accounts so different currencies never silently merge.
- Monetary columns are integers with an explicit scale, avoiding float error in
  both storage and reporting.

### How do you handle reconciliation and produce financial reports?

Reconciliation matches the ledger against an external or internal counterpart,
and reporting projects the journal onto financial statements.

- Every entry carries references such as order id, payment id, and settlement
  id, so counterparty transactions can be matched by key.
- A daily batch job joins ledger entries to bank and payment-provider records;
  matches are confirmed automatically, and unmatched items flow to an exception
  queue for investigation.
- The general ledger aggregates subledgers such as accounts receivable, accounts
  payable, and payroll through offset accounts, keeping one source of truth.

Reporting is derived, never stored separately:

- Financial statements (trial balance, balance sheet, income statement) are
  computed by grouping the journal by account and effective date.
- Point-in-time correctness uses effective-dated entries: a report as of date D
  sums only entries with `effective_date <= D`, regardless of when they posted.
- Period close: once a period closes, posting to it is blocked; adjustments
  enter as dated entries in the open period, preserving the closed period's
  immutability.
- At scale, per-account daily aggregates are maintained so reporting does not
  re-scan the raw journal on every request.

Operational controls:

- Automated controls flag unbalanced batches, missing references, and stale
  reconciliations, and findings are tracked to resolution.
- Every report run records its definition and timestamp so an auditor can
  reproduce any figure exactly.

### How do you make the ledger immutable, auditable, and tamper-evident?

The journal is append-only by design: corrections are new entries, never edits
to old ones.

- No `UPDATE` or `DELETE` is permitted on the journal table, and database
  privileges restrict write access to the posting service alone.
- Corrections post a reversing entry linked by a `reverses_entry_id` reference,
  so the original remains intact and the chain stays traceable.
- The journal lives on append-only or WORM storage, with periodic hash snapshots
  archived to object storage that outlive the operational database.

Tamper-evidence is structural:

- Entries are hash-chained: each entry block stores the hash of the previous
  block, so altering any historical entry invalidates every subsequent hash.
- A Merkle tree commitment over each period's entries is published to an
  external notary, so integrity can be verified without trusting the database
  alone.
- Verification jobs recompute hashes on a schedule and alert on any mismatch.

Auditability is complete and enforced:

- Every entry records who or what initiated it, the source system, the
  idempotency key, the reference ids, and the exact timestamp.
- Read access is permissioned and itself audited; bulk exports are logged.
- Retention follows regulatory policy, typically five to seven years or more,
  and archived hashes allow integrity checks long after the data leaves the hot
  database.

## Source

```text
title: Ledger System
node client: Merchant / API Client [round, icon=browser]
node gateway: Ledger API Gateway [icon=server]
node posting: Posting Service [icon=compute]
node idem: Idempotency Store [cylinder, icon=key]
node journal: Journal DB [cylinder, icon=database]
node balance: Balance Store [cylinder, icon=cache]
node account: Chart of Accounts [cylinder, icon=file]
node reconn: Reconciliation Job [icon=worker]
node report: Reporting / Statements [icon=chart]
node alert: Alerts [icon=alert]
node archive: Archive / Notary [icon=archive]

edge client -> gateway: post entries
edge gateway -> posting: validate + idempotency
edge posting -> idem: check / store key
edge posting -> journal: insert entries (append-only)
edge posting -> balance: update running totals
edge posting -> account: lookup accounts
edge posting -> gateway: commit result
edge journal -> reconn: scan entries
edge reconn -> alert: drift / unmatched
edge journal -> report: aggregate by account
edge journal -> archive: hash snapshots
edge archive -> alert: integrity check
```

## Q&A

### Q: Design a double-entry ledger / accounting system

**A:** A ledger is the system of record for every money movement. It enforces the
double-entry invariant: no amount is ever created or destroyed, because every
posting writes two entries — a debit to one account and a credit to another — so
the sum of debits always equals the sum of credits.

- The core invariant: each journal batch must post with Σ debits == Σ credits,
  which keeps the entire ledger in balance at all times.
- Account types determine direction: debits increase assets and expenses;
  credits increase liabilities, equity, and revenue.
- Amounts are stored as integer minor units (cents) with an explicit currency,
  which eliminates floating-point drift in both storage and arithmetic.

The write path is a short, well-defined sequence:

- The API validates the request shape, accounts, currencies, and permission.
- The posting service checks idempotency to reject duplicate operations.
- A single ACID transaction inserts the journal entries and updates the
  materialized balances, then commits atomically.

Storage is split by responsibility:

- Journal — an append-only table of entries; this is the single source of truth
  that every balance and report is derived from.
- Balance store — materialized running totals per (account, currency), rebuilt
  from the journal whenever needed.
- Account store — the chart of accounts with metadata such as account type,
  currency, and status.

Consistency and concurrency:

- Entries are posted inside one transaction per operation, and a unique
  constraint on the idempotency key makes double posting impossible.
- Contention is bounded by locking only the affected account rows
  (`SELECT ... FOR UPDATE`) or using a compare-and-swap on a balance version.
- To scale beyond a single database, the journal is sharded by entry id and
  balances are sharded by account id; a cross-account batch serializes through
  per-account locks so the double-entry invariant still holds.

Corrections never rewrite history:

- Entries are never updated or deleted; mistakes are fixed with reversing
  entries posted as new journal batches, preserving the audit trail.

### Q: How do you guarantee exactly-once posting for a money movement?

**A:** Exactly-once is implemented as idempotent-at-least-once: the client retries
freely, and the server makes duplicate requests harmless by keying every
operation.

- The client generates a unique idempotency key per logical operation, for
  example `order_id + attempt_number`, and sends it on every retry.
- The posting service records the completed operation's result keyed by that
  idempotency key, in the same transaction that writes the journal entries.
- A unique constraint on the idempotency key means a second request either waits
  on the in-flight transaction or finds the stored result and returns it
  unchanged.
- This turns at-least-once delivery into exactly-once semantics at the
  application boundary.

Failure handling is deterministic:

- If the response is lost after commit, the client retries with the same key and
  receives the original stored result, so no money movement is duplicated.
- If the transaction never commits, the retry starts fresh under the same key;
  the unique constraint guarantees only one commit ever wins.
- Ambiguous outcomes such as timeouts and crashes mid-commit resolve
  deterministically, because the result depends only on the key.
- Idempotency records expire after a retention window (typically 24h–30d) sized
  to the retry policy of the downstream clients.

Reliable event delivery uses the outbox pattern:

- The ledger write and the outbox insert happen in the same transaction; a relay
  then publishes events with at-least-once delivery and consumers dedupe by
  message id.
- Failed deliveries are parked in a dead-letter queue alongside their original
  key, so operators can replay without ever creating a duplicate posting.

### Q: How do you ensure balance consistency at scale (debits = credits)?

**A:** Consistency is enforced where the write happens, not discovered afterward by
post-hoc checks.

- Every batch is validated before commit: the sum of signed debits must equal
  the sum of signed credits, or the post is rejected outright.
- Balances are updated atomically with the entries, either by taking a row lock
  on each affected account or by a conditional update on a balance version.
- Contention is minimized by sharding: entries by entry id and balances by
  account id, so concurrent posts to different accounts never serialize.

Scaling the write path:

- Where a single cross-account transaction cannot be held (for example mass
  payouts with high fan-out), per-account locks in a sharded key-value store
  serialize all updates to one account while allowing parallelism across
  accounts.
- Idempotency keys remain the unit of deduplication in sharded layouts; the
  entry shard owns the unique constraint.

Detection and repair:

- A reconciler recomputes balances from the journal on a schedule and diffs them
  against the materialized balance store; any drift raises an alert.
- A trial-balance job sums debits and credits per account and per day, and the
  two totals must cancel to zero.
- Genuine defects are corrected only through compensating entries, which are
  themselves posted through the normal double-entry path.

Multi-currency handling:

- Balances are tracked per (account, currency), and FX conversions post through
  explicit conversion accounts so different currencies never silently merge.
- Monetary columns are integers with an explicit scale, avoiding float error in
  both storage and reporting.

### Q: How do you handle reconciliation and produce financial reports?

**A:** Reconciliation matches the ledger against an external or internal counterpart,
and reporting projects the journal onto financial statements.

- Every entry carries references such as order id, payment id, and settlement
  id, so counterparty transactions can be matched by key.
- A daily batch job joins ledger entries to bank and payment-provider records;
  matches are confirmed automatically, and unmatched items flow to an exception
  queue for investigation.
- The general ledger aggregates subledgers such as accounts receivable, accounts
  payable, and payroll through offset accounts, keeping one source of truth.

Reporting is derived, never stored separately:

- Financial statements (trial balance, balance sheet, income statement) are
  computed by grouping the journal by account and effective date.
- Point-in-time correctness uses effective-dated entries: a report as of date D
  sums only entries with `effective_date <= D`, regardless of when they posted.
- Period close: once a period closes, posting to it is blocked; adjustments
  enter as dated entries in the open period, preserving the closed period's
  immutability.
- At scale, per-account daily aggregates are maintained so reporting does not
  re-scan the raw journal on every request.

Operational controls:

- Automated controls flag unbalanced batches, missing references, and stale
  reconciliations, and findings are tracked to resolution.
- Every report run records its definition and timestamp so an auditor can
  reproduce any figure exactly.

### Q: How do you make the ledger immutable, auditable, and tamper-evident?

**A:** The journal is append-only by design: corrections are new entries, never edits
to old ones.

- No `UPDATE` or `DELETE` is permitted on the journal table, and database
  privileges restrict write access to the posting service alone.
- Corrections post a reversing entry linked by a `reverses_entry_id` reference,
  so the original remains intact and the chain stays traceable.
- The journal lives on append-only or WORM storage, with periodic hash snapshots
  archived to object storage that outlive the operational database.

Tamper-evidence is structural:

- Entries are hash-chained: each entry block stores the hash of the previous
  block, so altering any historical entry invalidates every subsequent hash.
- A Merkle tree commitment over each period's entries is published to an
  external notary, so integrity can be verified without trusting the database
  alone.
- Verification jobs recompute hashes on a schedule and alert on any mismatch.

Auditability is complete and enforced:

- Every entry records who or what initiated it, the source system, the
  idempotency key, the reference ids, and the exact timestamp.
- Read access is permissioned and itself audited; bulk exports are logged.
- Retention follows regulatory policy, typically five to seven years or more,
  and archived hashes allow integrity checks long after the data leaves the hot
  database.

## Source

```text
title: Ledger System
node client: Merchant / API Client [round, icon=browser]
node gateway: Ledger API Gateway [icon=server]
node posting: Posting Service [icon=compute]
node idem: Idempotency Store [cylinder, icon=key]
node journal: Journal DB [cylinder, icon=database]
node balance: Balance Store [cylinder, icon=cache]
node account: Chart of Accounts [cylinder, icon=file]
node reconn: Reconciliation Job [icon=worker]
node report: Reporting / Statements [icon=chart]
node alert: Alerts [icon=alert]
node archive: Archive / Notary [icon=archive]

edge client -> gateway: post entries
edge gateway -> posting: validate + idempotency
edge posting -> idem: check / store key
edge posting -> journal: insert entries (append-only)
edge posting -> balance: update running totals
edge posting -> account: lookup accounts
edge posting -> gateway: commit result
edge journal -> reconn: scan entries
edge reconn -> alert: drift / unmatched
edge journal -> report: aggregate by account
edge journal -> archive: hash snapshots
edge archive -> alert: integrity check
```
