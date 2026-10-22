import type { Problem } from './types';

export const uberRideHailing: Problem = {
  slug: 'uber-ride-hailing',
  title: 'Ride-hailing service',
  tagline: 'Match riders to nearby drivers in real time and dispatch trips at scale.',
  difficulty: 'Easy',
  tags: ['delivery', 'matching', 'mobile', 'payments'],
  functional: [
    'A rider requests a trip and a driver goes online or offline.',
    'Match the rider to a nearby available driver, who accepts or declines.',
    'Track the trip in real time, price it and charge the rider.',
    'Surge pricing, receipts and ratings.',
  ],
  nonFunctional: [
    'Location updates arrive every few seconds and matching completes in under 30 seconds.',
    'The nearby-driver query answers in under 100 ms.',
    'The service stays available at 99.99%; a lost location update is harmless.',
    'Charging is exactly once, even when a driver’s phone retries.',
  ],
  estimation: [
    '10M drivers online at peak, each reporting every 4 seconds, is 2.5M location writes per second.',
    '20M trips a day is about 230 matches per second, each scanning tens of candidate drivers.',
    'Keeping 10M live locations in memory is under 1 GB, so the geo index fits on a few nodes.',
    'Trips at 1 KB each and 20M per day is 20 GB per day, about 7 TB a year.',
  ],
  diagram: ` Rider app ─► API gateway ─► Ride matching ─► Geo index
                                  ▲               │  nearby drivers
                                  └───────────────┘
                                  │
                                  ├─► Dispatch queue ─► Driver app (accept / decline)
                                  ├─► Surge pricing
                                  └─► Trip service ─► Trips DB
                                            └─► Payment service ─► Notifications

 Driver app ─► API gateway ─► Driver location cache (heartbeat)`,
  design: [
    {
      title: 'Overview',
      body: 'A real-time geospatial system connecting riders and drivers.\n\n- Riders send requests through the API gateway; drivers report location periodically to a driver-location service backed by an in-memory geo-index (grid/geohash or quadtree over cells, served from a low-latency store like Redis or a spatial DB).\n- The Ride Matching service queries nearby candidates, filters by rating, direction, and ETA, and scores them (e.g., by ETA and surge).\n- Assignments go through a dispatch queue with a lease/timeout (driver must accept within ~15s or the offer is re-queued).\n- The Trip service owns state transitions (accepted, en route, arrived, completed), while payments and notifications run asynchronously.\n- Scale by partitioning the geo-index per zone and sharding by grid cell so queries stay bounded and writes are spread.',
    },
  ],
  qa: [
    {
      q: 'How would you handle 100k drivers coming online at rush hour?',
      a: "This is a write-heavy burst that must not overwhelm the gateway or the geo-index write path.\n\n- Have drivers report over persistent channels (WebSocket or gRPC streams) with batched location updates every few seconds instead of request/response polling.\n- Buffer updates through a message queue (Kafka) consumed by a fleet of geospatial index workers, so the index becomes eventually consistent and writes are decoupled from reads.\n- Shard the driver-location index by geographic region with consistent hashing so each shard only absorbs its own region's load.\n- Apply rate limiting, backpressure, and idempotent keys (driver_id + sequence number) to avoid double-processing.\n- Pre-scale gateway pods and index workers ahead of the predicted rush window based on historical demand curves.",
    },
    {
      q: 'Design Uber surge pricing',
      a: 'Surge pricing balances supply and demand.\n\n- Collect per-zone metrics over rolling windows (e.g., 5-minute buckets): open ride requests, available drivers, and estimated wait times.\n- Compute a demand/supply ratio; when it crosses a threshold, raise the multiplier in small steps (1.1x, 1.3x, 1.5x) with hysteresis to avoid oscillation.\n- Publish the multiplier to riders and drivers with a validity window, and lock the price at booking.\n- The fare calculator is idempotent: price = base + distance + time, all scaled by the surge multiplier, recomputed at trip start for correctness.\n- Serve pricing lookups from a cache (Redis) keyed by zone since reads dominate.\n- Run the recalculation loop as a stream job over Kafka so zones update independently and fail without blocking bookings.',
    },
    {
      q: 'How do you run geospatial queries at scale (finding nearby drivers)?',
      a: 'The requirement is low-latency nearest-N queries against millions of moving points.\n\n- Common approaches: geohash cells (query the cell plus neighbors, then filter by Haversine distance), a quadtree/R-tree per shard, or spatial indexes such as Redis GEO, PostGIS, and the S2/H3 libraries (Uber uses H3).\n- Keep driver locations in memory in a cache cluster sharded by region with consistent hashing, so each query is bounded to one zone with single-digit millisecond latency.\n- Writes flow from the gateway through a queue (Kafka) into the index workers, keeping the read path fast and the write path decoupled.\n- For accuracy, do a radial bounding-box pre-filter followed by exact distance sorting; choose cell size to keep candidate counts small.\n- Replicate each shard for availability and to absorb read spikes.',
    },
    {
      q: 'Design a ride payment + receipt flow',
      a: 'Payments need correctness, idempotency, and async processing.\n\n- On trip end, the Trip service computes the fare and calls the Payment service with a unique idempotency key (trip_id).\n- The Payment service debits the rider through an external provider (Stripe/Adyen) using idempotent API calls, credits the driver (or batches driver payouts), and records the charge in a payments DB, emitting events to a ledger topic in Kafka.\n- Use double-entry records (rider debit, driver credit) with a reconciliation job to catch mismatches.\n- Handle failures with retries and exponential backoff, a dead-letter queue for terminal errors, and a refund path for disputes.\n- After settlement, the receipt service generates an in-app/email receipt with the fare breakdown (base, distance, time, surge, taxes, tip).\n- At-least-once delivery plus dedupe by the idempotency key keeps the flow correct.',
    },
  ],
};
