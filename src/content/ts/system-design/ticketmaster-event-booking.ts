import type { Problem } from './types';

export const ticketmasterEventBooking: Problem = {
  slug: 'ticketmaster-event-booking',
  title: 'Ticket booking system',
  tagline: 'Hold seats under contention and never sell the same ticket twice.',
  difficulty: 'Medium',
  tags: ['booking', 'payments', 'search'],
  functional: [
    'Browse and search events and view a seat map.',
    'Hold seats for a short window and then purchase them.',
    'Charge payment and issue tickets; release expired holds.',
    'Handle refunds and ticket resale.',
  ],
  nonFunctional: [
    'Seat allocation is serialisable per event, so a seat is never sold twice.',
    'A hold expires after about 10 minutes and is released automatically.',
    'The read path survives a 100× spike when tickets go on sale.',
    'Payment is exactly once, even when the buyer retries.',
  ],
  estimation: [
    '10M buyers hitting a stadium sale in 5 minutes is about 33k requests per second, mostly seat-map reads.',
    'A 50k-seat event plus 100k holds a day keeps inventory writes small and bounded per event.',
    'The seat map is static enough to cache at the edge; only holds and purchases hit the inventory store.',
    '1M bookings a day at 2 KB is 2 GB a day, but payment records are kept for years.',
  ],
  diagram: ` Client ─► API gateway ─► Event service ─► Event cache
              │                  │
              │                  └─► Seat map (availability, CDN-cached)
              └─► Seat hold ─► Inventory store (atomic reserve, TTL)
                                   │
                                   └─► Booking service ─► Payment service
                                              │                 │
                                              ├─► Bookings DB   └─► Notifications (tickets)
                                              └─► release expired holds`,
  design: [
    {
      title: 'Overview',
      body: 'The platform breaks into a browse path and a checkout path.\n\n- On browse, the client hits the API gateway, which queries an Event Service backed by a search index and an Event Cache for metadata, seat maps, and venue info.\n- On checkout, the client selects seats, the Seat Map service issues a hold against the Inventory Store, and the Booking Service confirms the reservation before charging the Payment Service and persisting the final booking in a Bookings DB.\n- A notifications service emails tickets and QR codes once payment succeeds.\n\nThe inventory store is the heart:\n\n- Seats are represented as discrete units with states (available, held, sold, disabled), and every transition must be atomic because a single event can sustain millions of concurrent requests at on-sale time.\n\nKey entities:\n\n- `event` (venue, dates, capacity), `seat` (section, row, number, state), `hold` (seat, owner session, expiry), and `booking` (seats, amount, status).\n- Events and seats are read-mostly and heavily cached; bookings and holds are write-hot and need careful concurrency control.\n- Availability reads are served from cache for snappy seat-map rendering, while reservation writes always round-trip to the authoritative inventory store.\n- The system must also survive queue jumps: during a popular on-sale, a virtual waiting room funnels traffic into the booking path so the inventory backend sees a bounded request rate.',
    },
  ],
  qa: [
    {
      q: 'How do you prevent overselling seats under high concurrency?',
      a: 'Overselling happens when two requests read "available" and both proceed to sell the same seat — a classic check-then-act race. The fix is to make the availability-to-reserve transition atomic in one place.\n\n- Keep a Redis inventory store with a key per seat and use a Lua script that checks the seat state and flips it from `available` to `held` in a single atomic operation, so the check and the write cannot be interleaved.\n- Alternatively, encode capacity as a counter per section and use `DECR` on a remaining-seats key, rejecting when it goes negative.\n- No matter the primitive, the invariant is: the inventory store is the single source of truth, and caches are never allowed to grant a seat — they only render availability optimistically.\n\nBeyond atomicity, you need bounded admission:\n\n- A virtual queue or waiting room gates how many users can actively book per event; a token bucket or per-session rate limit on the booking endpoint prevents any one client from flooding the inventory store.\n- Batch settlement also helps: holding a reservation intent in a queue and applying it in small, serialized batches (or using a single-node serialization for the hottest events) avoids thundering-herd contention.\n- When a hold expires, the seat must return to `available` through the same atomic path, and the remaining-capacity counter must be incremented back, or you leak inventory.\n- Monitor oversell rates and hold-expiry rates per event as first-class metrics.',
    },
    {
      q: 'How do you implement seat holds with timeouts?',
      a: "A hold reserves a seat for a specific buyer for a limited window — typically 5–10 minutes — during which only that buyer can convert it into a booking.\n\n- Implement holds as entries in Redis with a TTL: key `hold:{seat_id}` to `{user_id, expires_at}`, set with `SET ... NX EX`.\n- On reserve, the Lua script only succeeds if the seat is `available`; on success it flips the seat to `held` and stores the holder.\n- Each subsequent call (refresh, pay now, checkout) validates that the requester is the holder and that the TTL hasn't fired, and a successful payment extends the hold atomically just long enough to commit the booking.\n- If the user never pays, Redis evicts the key on TTL and a background reconciler flips the seat back to `available`.\n\nTwo mechanisms keep the system correct under failure:\n\n- First, a sweeper (repeated `SCAN` plus a conditional Lua script) periodically reclaims expired holds in the rare case of an eviction without the expected state transition, guaranteeing eventual release even if a node dies mid-transaction.\n- Second, the checkout flow must be idempotent: a `hold_id` is passed through booking and payment so a retried charge doesn't double-commit or resurrect an expired hold.\n- Trade-off: longer TTLs reduce abandonment friction and increase conversion but tie up scarce inventory; shorter TTLs increase seat availability and enable rapid re-selling but frustrate buyers.\n- Derive the TTL from a configurable policy per event tier, and always show a live countdown so the client can refresh the hold before expiry.",
    },
    {
      q: 'Design the event search and browse experience',
      a: 'Browse is a read-heavy, latency-sensitive path: users explore events by category, city, date, artist, and venue long before they buy.\n\n- Put an Elasticsearch/OpenSearch cluster in front of the Event Service, indexing events with fields for name, artist, venue, genre, and dates.\n- Serve faceted filtering (date ranges, price buckets, city, genre) directly from the index.\n- Rank results by a blend of relevance (BM25 on text), popularity (search volume, sales velocity), and freshness (upcoming events first), re-scored offline so the online path stays fast.\n- Hot queries — big tours, holidays — are cached in the Event Cache with short TTLs (seconds to minutes), while venue metadata, seat maps, and static event details live in a longer-lived cache.\n\nEvents are created in bursts, so the indexer must be near-real-time:\n\n- An artist announces a tour and 40 shows appear at once; publishing an event writes to the Bookings DB and emits an index event consumed by workers that upsert the document within seconds.\n- Availability is shown as a lightweight badge (available / low / sold out) derived from the inventory store and denormalized into the index with a short TTL rather than queried live on every result page — trying to count seats per event inline would melt the inventory store.\n- For the hottest events, serve a pre-built landing page from the cache and front it with the waiting room so browse stays responsive even when a million fans hammer the same artist.',
    },
    {
      q: 'How do you handle ticket resale and refunds?',
      a: "Both flows mutate inventory and money, so they reuse the same booking infrastructure.\n\n- For refunds, the Booking Service flips a `booking` from confirmed to refunded only if the event hasn't happened (policy check), then calls the Payment Service to reverse or credit the charge.\n- A refund ledger records the original charge, the reversal, and status transitions so retries are idempotent; the seats return to `available` through the same atomic inventory path used for hold expiry.\n- Rule-based (grace periods, event postponement) vs merchant-optional (no refunds) policies live in a config service and are enforced before any ledger mutation.\n- Payment reversals are asynchronous and can fail, so a reconciler matches refund requests against bank settlement reports and retries credits until they land.\n\nResale is a mini-marketplace:\n\n- A seller lists a ticket, the platform validates ownership, takes the ticket out of circulation into a `resale_listing` state, and when a buyer purchases, inventory is re-issued to the new owner and the original is voided.\n- Because the seat identity on the actual ticket may need to change, the booking record is updated atomically with the ownership transfer and a new barcode/QR is issued while the old one is blacklisted — double-use prevention is a fraud and infrastructure concern, not just a data one.\n- Pricing can be capped at face value or market-based; in either case, list-to-sell latency is a cache/queue problem: listings are indexed in search, and a sold-out event shows resale availability from the index with the live inventory re-checked only at checkout.",
    },
  ],
};
