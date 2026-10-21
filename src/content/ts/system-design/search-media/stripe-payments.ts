import type { Problem } from '../types';

export const stripePayments: Problem = {
  slug: 'stripe-payments',
  title: 'Stripe payments',
  tagline:
    'Process credit card payments with idempotency, authorization, capture, refunds, and PCI compliance.',
  difficulty: 'Hard',
  tags: ['PSP', 'Idempotency', 'PCI', 'Webhooks', '3DS'],
  group: 'search-media',
  functional: [
    'Accept payment methods: cards, wallets (Apple Pay, Google Pay), bank redirects.',
    'Two-step: authorize (reserve funds) → capture (settle) or cancel.',
    'Idempotency keys on every mutating request.',
    'Webhooks for async events (charge.succeeded, charge.refunded, dispute.created).',
    'Support 3D Secure (3DS2) for SCA compliance in Europe.',
  ],
  nonFunctional: [
    'p99 authorization latency under 500 ms (excluding 3DS challenge).',
    '99.999% availability for the payments API.',
    'Zero double-charge: idempotency guarantees exactly-once semantics.',
    'PCI DSS Level 1: card data never touches application servers.',
  ],
  estimation: [
    '10M payments/day = 115 TPS average, 10K TPS peak (Black Friday).',
    'PSP latency: 200-400 ms typical. 3DS challenge adds 5-15 sec.',
    'Idempotency key store: 10M keys/day × 100 bytes = 1 GB/day, TTL 30 days.',
    'Webhook delivery: at-least-once, exponential backoff, 72-hour retry.',
  ],
  diagram: `flowchart LR
  BUYER[Buyer] --> PAYAPI[Payments API] --> PAYSRV[Payments service]
  PAYSRV --> IDEMP[Idempotency cache]
  PAYSRV --> PSP[PSP / Network]
  PSP -.->|3DS challenge| BUYER
  PAYSRV --> WH[Webhook dispatcher]`,
  design: [
    {
      title: 'Idempotency',
      body: 'Every mutating endpoint (create payment, capture, refund) requires an `Idempotency-Key` header. The payments service checks the cache (Redis) before processing. If the key exists, it returns the stored response. If not, it processes, stores the response (status, body, headers) with a 30-day TTL, and returns it. This guarantees exactly-once semantics even with retries, network failures, or client bugs.',
    },
    {
      title: 'Authorization and capture',
      body: 'Authorize: the PSP reserves funds on the card (typically 7-day hold). Capture: the PSP moves funds from the hold to the merchant. The payments service exposes separate endpoints. Partial capture is allowed (for example, shipping only part of an order). If not captured within the hold window, the authorization expires automatically.',
    },
    {
      title: '3D Secure (3DS2)',
      body: 'For SCA-regulated transactions, the PSP returns a 3DS challenge URL. The payments service redirects the buyer (or the client SDK renders a challenge iframe). After the challenge, the PSP completes the authorization. The payments service polls or receives a webhook for the final result. Frictionless flow (no challenge) is used when the issuer has enough data.',
    },
    {
      title: 'Webhooks and reliability',
      body: 'Async events (succeeded, failed, refunded, disputed) are delivered via webhooks. The dispatcher retries with exponential backoff (1m, 5m, 15m, 1h, 6h, 24h) for 72 hours. The receiver must be idempotent (use the event ID). Webhook signatures (HMAC) verify authenticity. A dead-letter queue captures permanently failed deliveries for manual review.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a PSP outage?',
      a: 'Queue payments locally (Kafka) and replay when the PSP recovers. For authorizations, return a "pending" status to the client and process asynchronously. Never fail open (approve without PSP).',
    },
    {
      q: 'What about refunds after capture?',
      a: 'Refund is a separate idempotent operation. It creates a refund object linked to the charge. The PSP processes it asynchronously. Webhook notifies on completion. Partial refunds are allowed up to the captured amount.',
    },
    {
      q: 'How do you stay PCI compliant?',
      a: "Use Stripe Elements / Payment Element — the card form is an iframe served from Stripe's domain. Card data never touches your servers. Your API only sees a payment method token. Annual PCI SAQ A attestation.",
    },
  ],
};
