import type { Problem } from './types';

export const stripePayments: Problem = {
  slug: 'stripe-payments',
  title: 'Payment system',
  tagline: 'Move money exactly once, with idempotency, ledgers and reconciliation.',
  difficulty: 'Easy',
  tags: ['auth', 'payments', 'realtime', 'security'],
  functional: [
    'Create a charge or authorization for a merchant.',
    'Store payment methods and settle with the card network.',
    'Record double-entry ledger entries and account balances.',
    'Emit webhooks and reconcile settlement files from the bank.',
  ],
  nonFunctional: [
    'A retried charge never charges twice.',
    'Ledger writes are strongly consistent and atomic per account.',
    'The API answers in under a second, excluding the network round trip.',
    'Every movement of money is immutable and auditable.',
  ],
  estimation: [
    '100M transactions a day is about 1.2k per second and 10k at peak.',
    'Idempotency keys kept for 24 hours at 100 bytes each is about 10 GB.',
    'Two ledger entries per transaction at 1 KB is 200 GB a day, retained for seven years.',
    'Webhooks average three attempts, so about 300M deliveries a day.',
  ],
  diagram: ` Buyer ─► Payments API ─► Payments service ──► PSP / network (authorize)
                              │      ▲
              idempotency key │      │ result
                              ▼      │
                       Idempotency cache
                              │
                              ├─► Fraud detection
                              ├─► Ledger service ─► Transactions DB (ACID)
                              ├─► Wallet balance
                              └─► Webhook dispatcher ─► Merchant (retry, backoff)`,
  design: [
    {
      title: 'Overview',
      body: 'The system is built from a set of core services:\n\n- A Payments API fronting a Payments Service.\n- An abstraction over PSP networks for authorization and settlement.\n- A Ledger Service writing double-entry records.\n- A wallet/balance system.\n- A webhook dispatcher.\n- Fraud screening.\n- Notifications.\n\nThe transactional store is a single-write, ACID database partitioned by account so charges and ledger entries commit atomically.\n\nData models: transactions, payment methods, ledger entries, balances.\n\nTrade-offs: correctness demands a strongly consistent ledger, so writes funnel through one source of truth while reads scale via caching and replication.\n\nTo scale:\n\n- Shard by account/merchant.\n- Add idempotency caching for retries.\n- Decouple webhooks through a durable queue.\n\nSettlement is async:\n\n- Authorize synchronously, then settle or refund through the PSP with reconciliation against bank statements.',
    },
  ],
  qa: [
    {
      q: 'How do you guarantee exactly-once charge semantics?',
      a: "True exactly-once is impossible across networks, so the standard is at-least-once delivery plus idempotent deduplication at the application layer.\n\n- The client sends an `Idempotency-Key` on every charge.\n- The Payments Service performs an atomic check-and-set against an idempotency cache/table keyed by (account, key).\n- On a miss it executes the charge and stores the result and response body together in one transaction; on a hit it returns the previously stored result instead of charging again.\n- PSP calls are retried with the same key so the network's own idempotency shields double auths.\n- Ledger entries are written once with unique entry IDs.\n- A background reconciler compares ledger balances against PSP settlement reports to catch and fix residual drift.",
    },
    {
      q: 'Why does idempotency matter in payment APIs?',
      a: 'Payments sit behind unreliable networks: a client timeout or gateway retry can fire after a charge already succeeded, and without protection that retry creates a second, accidental charge.\n\n- Idempotency keys let the server recognize a repeated request and replay the original response, making retries safe.\n- They give clients a simple contract — retry with backoff until you get a definitive answer.\n- This prevents double charges, keeps merchant and customer balances consistent, and avoids expensive manual refunds.\n- On the backend it translates to a keyed store with an atomic insert and a TTL, so duplicates are cheaply deduped without re-running the PSP flow.\n- It also composes with eventing: webhook events carry the same idempotent IDs so downstream consumers dedupe consistently.',
    },
    {
      q: 'How do you reconcile money across ledgers and banks?',
      a: 'The ledger is the system of record: every money movement is posted as double-entry journal entries so debits and credits always balance.\n\n- Wallet balances are derived projections of that ledger, not independent stores.\n- Reconciliation matches the internally consistent ledger against external bank/PSP settlement files, typically nightly.\n- Each line — charges, refunds, fees, chargebacks — is paired with a ledger entry, and unmatched items go to a discrepancy queue for investigation.\n- Posting must be idempotent, using unique entry IDs, so repeated settlement files cannot double-count.\n- Anomalies like failed debits or surprise network fees are auto-flagged.\n- When totals drift, you bisect the batch to isolate the mismatch.\n- This gives a provable money trail and catches bugs before they hit customer balances.',
    },
    {
      q: 'Design webhook delivery with retries and backoff',
      a: "The webhook dispatcher reads events from a durable queue (SQS/Kafka) and POSTs them to each merchant's registered endpoint.\n\n- Delivery policy: HTTP 2xx marks success; timeouts and non-2xx trigger retry with exponential backoff plus jitter (e.g., 1s to 2s to 4s capped, max attempts roughly 5-10), after which the event moves to a dead-letter queue for manual replay.\n- Every payload is signed with an HMAC and carries a unique event ID so merchants can verify authenticity and dedupe.\n- The dispatcher must respect per-endpoint rate limits and honor `Retry-After`/429s to avoid hammering slow servers.\n- Provide a dashboard with delivery logs and one-click replay.\n- Emit metrics on delivery latency and failure rates for alerting.",
    },
  ],
};
