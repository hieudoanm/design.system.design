import type { Problem } from '../types';

export const ticketmasterEventBooking: Problem = {
  slug: 'ticketmaster-event-booking',
  title: 'Ticketmaster event booking',
  tagline:
    'Sell millions of seats for high-demand events with fairness, concurrency control, and fraud prevention.',
  difficulty: 'Hard',
  tags: ['Concurrency', 'Seat map', 'Idempotency', 'Queue'],
  group: 'search-media',
  functional: [
    'Publish events with seat maps (sections, rows, seats, pricing tiers).',
    'Handle on-sale: millions of users, thousands of requests/sec for hot events.',
    'Atomic seat hold (2-5 min TTL) → confirm purchase → release on timeout.',
    'Prevent bots/scalpers: CAPTCHA, queue, purchase limits, verified fan.',
  ],
  nonFunctional: [
    'Zero oversell: a seat sold exactly once.',
    'p99 seat hold latency under 200 ms.',
    'On-sale throughput: 100K requests/sec sustained.',
    'Seat map reads: p99 under 50 ms (CDN cached).',
  ],
  estimation: [
    'Hot event: 1M users in queue, 50K seats, 100K req/sec for 10 min.',
    'Seat map: 50K seats × 200 bytes = 10 MB (cached in Redis + CDN).',
    'Hold TTL: 5 min. 50K concurrent holds max.',
    'Inventory store: 50K seats × 3 replicas = 150K records.',
  ],
  diagram: `flowchart LR
  subgraph ONSALE [On-sale]
    CLIENT[Client] --> GW[API gateway] --> QUEUE[Virtual queue] --> EVT[Event service]
    EVT --> SEAT[Seat map cache]
  end
  subgraph HOLD [Seat hold]
    EVT --> HOLD_SVC[Seat hold service] --> INV[(Inventory store)]
    HOLD_SVC --> TTL[TTL manager]
  end
  subgraph BOOKING [Booking]
    EVT --> BOOK[Booking service] --> PAY[Payment service]
    BOOK --> INV
  end`,
  design: [
    {
      title: 'Virtual queue',
      body: 'On-sale starts with a virtual queue (randomized position). Users get a token and estimated wait time. The queue drains at a controlled rate (for example 10K/sec) into the event service. This protects downstream services from thundering herd. Queue position is stored in Redis sorted set by timestamp.',
    },
    {
      title: 'Seat hold with atomic compare-and-set',
      body: 'When a user selects seats, the seat hold service attempts an atomic CAS on the inventory store (Redis + Lua or etcd). The key is `seat:{event_id}:{seat_id}`. Value: `hold:{user_id}:{expiry}`. If CAS succeeds, the hold is created with a TTL. If it fails (already held), the UI shows the seat as taken. The hold reserves the seat for 5 minutes while the user completes payment.',
    },
    {
      title: 'Seat map',
      body: 'The seat map is a static JSON (section → rows → seats with coordinates and price tier). It is published to a CDN and cached in Redis. The event service reads from cache; on cache miss, it fetches from the metadata DB. Seat availability is a bitmap overlay (1 bit per seat) stored in Redis, updated on hold/release/confirm.',
    },
    {
      title: 'Booking and payment',
      body: 'On payment confirmation, the booking service converts the hold to a confirmed ticket (atomic CAS: hold → confirmed). The ticket record includes a barcode/QR code. Payment is idempotent (idempotency key from the hold). On payment failure or timeout, the hold expires and the seat is released automatically by the TTL manager.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a user who holds seats but never pays?',
      a: 'The TTL expires and the seat is released automatically. The hold service also tracks hold-to-conversion rate per user; abusers get lower priority in future on-sales.',
    },
    {
      q: 'What if two users select the same seat at the same millisecond?',
      a: 'The CAS operation in the inventory store is atomic. One succeeds, the other gets a "seat taken" response immediately. The UI re-fetches the seat map and shows the seat as unavailable.',
    },
    {
      q: 'How do you prevent bots from buying all tickets?',
      a: 'Layered defense: (1) CAPTCHA at queue entry, (2) verified fan registration (pre-sale), (3) purchase limit per account (for example 4 tickets), (4) behavioral analysis (mouse movements, typing cadence), (5) post-sale audit: cancel orders with mismatched names/addresses.',
    },
  ],
};
