import type { Problem } from './types';

export const notificationService: Problem = {
  slug: 'notification-service',
  title: 'Notification service',
  tagline: 'Deliver email, SMS, push and in-app messages reliably, without spamming users.',
  difficulty: 'Medium',
  tags: ['event-driven', 'notification'],
  functional: [
    'Accept notification requests from other services.',
    'Fan a request out to millions of users.',
    'Respect per-user preferences, quiet hours and opt-outs.',
    'Retry failures, deduplicate and keep a delivery log and inbox.',
  ],
  nonFunctional: [
    'A request is accepted in under 100 ms; delivery is asynchronous.',
    'Delivery is at least once with an idempotency key, so nobody is told twice.',
    'The system absorbs 10× the normal rate during a campaign burst.',
    'A provider outage delays notifications but never loses them.',
  ],
  estimation: [
    '1B notifications a day is about 12k per second on average and 100k per second at campaign peak.',
    'One campaign to 100M users becomes 100M queue messages, so fanout has to be incremental.',
    'A 24-hour dedupe cache at 40 bytes per id for 1B ids is about 40 GB.',
    'The delivery log at 500 bytes per notification is 500 GB a day, tiered after a month.',
  ],
  diagram: ` Services ─► Event ingestion ─► Fanout workers ─► Push provider
                                   │      │
                                   ├──────┼─► Email service
                                   │      └─► SMS gateway
                                   ├─► Preference service (filter, quiet hours)
                                   ├─► Dedupe cache (idempotency)
                                   └─► Notification DB ─► Inbox API`,
  design: [
    {
      title: 'Overview',
      body: 'The service is an async, event-driven pipeline between producers (other microservices) and delivery providers.\n\n- Producers push an event into an Event Ingestion queue; a Fanout Worker then resolves the audience, filters it through the Preference Service, dedupes, and dispatches one notification per user-and-channel to the appropriate provider — Push Provider, Email Service, or SMS Gateway.\n- Every send attempt is logged to a Notification DB that also serves the user\'s in-app inbox, so the inbox is just a read over the same records the delivery path writes.\n- Clients subscribe or change preferences through the API gateway, which updates the Preference Service.\n\nThe core abstraction is a notification: `{id, user_id, type, title, body, payload, channels, status}`.\n\n- Events are upstream facts ("you were tagged", "order shipped"), and the worker turns each event into one or more channel-targeted notifications.\n- Because delivery is inherently unreliable (APNs and SMS gateways fail, are rate-limited, and sometimes silently drop), the service is built around at-least-once semantics: retries with exponential backoff, a dead-letter queue for poison messages, and dedupe at the worker so retries don\'t produce duplicates.\n- Delivery is decoupled from creation — the sender never blocks on a push round-trip — and the inbox guarantees the user eventually sees everything even if every push channel is down.',
    },
  ],
  qa: [
    {
      q: 'How do you fan out notifications to millions of users?',
      a: 'Fanout is the scalability bottleneck: one event ("flash sale live") can target tens of millions of users.\n\n- Partition the problem.\n- First, resolve the audience as a query or a stream rather than a list — a User Graph or segment index can yield IDs in pages instead of materializing one giant list.\n- Then chunk the audience into batches and let the Fanout Worker shard them across a pool of worker instances, each consuming a slice from the queue.\n- Parallelism comes from the chunking, not from any single process: a million-user fanout is ~10k batches of 100, spread across as many workers as the queue has partitions.\n- Kafka partitioned by user_id (or a hash of it) keeps one user\'s notifications ordered and gives each partition its own consumer.\n\nBackpressure and politeness matter as much as throughput.\n\n- Push providers and SMS gateways rate-limit aggressively and have per-app ceilings, so the worker must shape the dispatch rate — a token bucket per provider tokenizes sends, and providers get queued, paced deliveries instead of a burst.\n- Chunking also enables staggering: deliver in waves (first 1%, observe error rates, then the rest) so a misconfigured template or dead provider doesn\'t burn the whole audience.\n- If a worker dies mid-fanout, the queue redelivers its chunk (at-least-once), and the dedupe key per (user, event, channel) makes the replay idempotent.\n- Monotonic progress is tracked with a fanout record: a single `fanout_id` row counting delivered/total, updated asynchronously by workers, so a human or scheduler can pause, resume, or abort an in-flight broadcast.',
    },
    {
      q: 'How do you choose delivery channels (push, email, SMS)?',
      a: "Channel selection is a preference-driven decision, not a fixed rule.\n\n- The Preference Service stores per-user rules — which channels a user has enabled, which event types they care about, quiet hours, and channel-specific addresses (device tokens, email, phone) — and the Fanout Worker resolves each event against those rules to produce the channel set.\n- The decision also considers event semantics and urgency: time-sensitive or transactional events (password reset, security alert) tend to demand SMS or push regardless of marketing preferences, while a breaking-news blast might use push with an email digest as a fallback for users whose app is silent.\n- A tiering model is common: high-urgency events go out on every enabled channel, normal events default to push + inbox, and low-priority events collapse into a daily digest email.\n\nPracticalities shape the choice too.\n\n- Cost is a first-class input — SMS is an order of magnitude more expensive than push or email — so SMS is reserved for true urgency and protected by per-user daily caps.\n- Deliverability differs: push is immediate but volatile (tokens expire, devices go offline), email is reliable and cheap but slow and easy to ignore, SMS is immediate and hard to ignore but expensive and spammy.\n- Add fallback chains: if the preferred channel fails or the user is offline after N attempts, promote to a secondary channel, and route through whatever integration (vendor) the user's region supports.\n- Finally, keep channel state per user and update it on delivery failures — a dead device token should be pruned so the next fanout doesn't burn time on it.",
    },
    {
      q: 'How do you guarantee delivery with retries and dedupe?',
      a: "Delivery guarantees stop at at-least-once; exactly-once is impossible when downstream providers are unreliable, so the design makes duplicates cheap and loss hard.\n\n- Each notification carries a stable dedupe key — usually `(user_id, event_id, channel)` — written to a Dedupe Cache (Redis) with a TTL before the first send.\n- Every worker retry checks and, critically, claims the key atomically (a Lua `SET NX` or an INCR-with-expiry pattern) so two retries of the same notification can't both dispatch.\n- The send itself is tracked in the Notification DB with states `pending → sent → delivered / failed`, and the provider's async delivery receipt (APNs callback, SES notification, SMS DLR) advances the state; a receipt that never arrives triggers a retry scheduler.\n\nRetries are systematic: exponential backoff with jitter (e.g., 1s, 4s, 16s up to a cap of a few hours), a max attempt count, and then a move to a dead-letter queue for inspection rather than infinite retry.\n\n- Idempotency extends through the providers where possible — APNs uses a notification UUID so a duplicate send is a no-op — but where it doesn't, dedupe on our side plus provider rate limits keeps the duplicate rate negligible.\n- For the inbox path, dedupe is natural: the record is keyed by the dedupe key with a unique constraint, so inbox writes can't double.\n- On the failure side, treat provider outages as retryable, track provider-level health to pause dispatch to a sick provider, and make the queue durable so a crash at any stage resumes from the last ack, not from the start.",
    },
    {
      q: 'How do you respect user notification preferences?',
      a: 'Preferences are the gate every notification must pass, so they live in a fast, always-available service — a Redis-backed Preference Service with the source of truth in a durable store — and the Fanout Worker resolves them for every recipient before dispatching.\n\n- The model is three-dimensional: what topics the user subscribed to (type or category: mentions, promotions, product updates), which channels are enabled per topic (push, email, SMS, inbox), and global settings such as quiet hours and a master mute.\n- A negative default — opt-in for marketing, opt-out for transactional core like security or delivery — prevents the service from ever being a spam vector.\n- Quiet hours are enforced at dispatch: notifications targeting a sleeping user are deferred to the next allowed window or converted to an inbox-only copy.\n\nChecking preferences for millions of recipients per fanout can\'t be a per-user RPC, so the worker batches preference lookups (pipeline a Redis `MGET` or `MULTI` for thousands of users per request) and caches per-user preference blobs locally with a short TTL.\n\n- Enforcement points: the worker filters the channel set per user; a policy layer also applies global rules (anti-abuse caps, per-user daily notification limits, spam classification) that override even enabled preferences.\n- On the write side, preference updates must be eventually consistent and never silent — a user unsubscribing from a campaign must see the change reflected in the next fanout, so preference changes are propagated to caches and the fanout pipeline checks a version stamp.\n- Finally, audit and self-serve: log the preference decision with each notification so "why did I get this?" is answerable, and provide unsubscribe links that update preferences through the same API the fanout reads.',
    },
  ],
};
