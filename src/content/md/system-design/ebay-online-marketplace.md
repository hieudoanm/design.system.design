# eBay — Online Marketplace

Design an online marketplace

**Difficulty:** Hard

**Tags:** ecommerce, payments, search

## Functional Requirements

- an online marketplace
- model listings and categories?
- run auctions with strict deadlines?
- prevent double-sales and over-bidding?
- handle search over millions of listings?

## Non-Functional Requirements

- The `API Gateway` fronts the platform.

- Sellers create listings through the `Listing Service`, which persists to
  `Listings DB` and indexes into `Listing Search` so buyers can find them.
- Buyers place bids through the `Bidding Engine`, which records the bid, checks
  the `Auction Timer` for the deadline, and holds funds via `Escrow` so a
  winning bidder is committed.
- When the timer fires, the winning bid settles through the `Payment Service`,
  and `Notifications` fan out outbid, win, and ship events.

The system has two dominant and separable workloads: writes (listing creation,
bid placement) and reads (search, listing views, category browse).

- Separate them cleanly — read requests hit the search index and caches, while
  writes serialize on the listing and bidding services.
- Hot, high-velocity listings live in a `Redis` cache backed by the durable DB,
  and search runs on a dedicated inverted index.
- Correctness concentrates in the bid path: it must be atomic, deadline-aware,
  and race-free.
- Everything downstream of a winning bid — escrow hold, payment settlement,
  seller notification — is a saga: each step persists its local state and emits
  an event, with compensation (refund the escrow) if a later step fails.
- The design goal is that under any mix of concurrent bids and searches, exactly
  one buyer wins each auction and every buyer sees a consistent state.

Scale and failure handling reinforce the split.

- The read path scales horizontally behind the index and cache, so heavy search
  traffic never competes with bid writes.
- The bid path stays correct under any failure — its state lives in durable
  stores with idempotent handlers, and the hot listing key is isolated from
  everything else.
- This separation also makes the system predictable: a search-index rebuild
  degrades discovery, never the auction..
- An auction must end exactly at its deadline regardless of activity, and the
  final state must be consistent — one winner, one price.

- Never rely on a lazy check at bid time; run an explicit timer.
- The `Auction Timer` holds a sorted set of `(end_time, auction_id)` in `Redis`
  with workers popping due items, or uses scheduled queues per shard, and
  atomically transitions the auction from `active` to `ended`, freezing the
  winning bid.
- Bid placement and the deadline are serialized on the same key: a single Lua
  script or DB transaction checks `now < end_time` and
  `new_price > current_price` and writes the new high bid in one atomic step, so
  a bid racing the deadline can never land after it.

Support anti-sniping: when a bid arrives in the final seconds, extend the
auction by bumping `end_time` within the same atomic script, so last-second
bidders cannot insta-win.

- The deadline itself must be derived from the authoritative record in
  `Listings DB`, never from in-memory state, so a worker crash or restart cannot
  delay settlement.
- The timer is a dispatch mechanism, not the source of truth: after the timer
  fires, it writes the ended state to the DB.
- If a timer worker dies, a monitor re-scans the sorted set and fires missed
  deadlines.
- The settlement step (escrow release to seller, charge to buyer, status to
  `sold`) then runs as an idempotent job keyed by auction id, safe to re-run
  after any crash.

Latency and durability also shape the design.

- The timer must tolerate being slightly late, but never early — settle at
  `end_time`, not before — and the escrow and payment steps must be idempotent
  because settlement may be retried after a crash.
- Monitor the gap between the fired timer and the stored end time as an SLO: a
  timer that drifts late erodes buyer trust even when no individual auction is
  wrong..
- Search is read-heavy and forgiving of slight staleness, so index asynchronously
  and cache aggressively.

- The `Listing Search` service runs an inverted index (e.g., `Elasticsearch`)
  sharded by a hash of the listing id.
- At write time, the `Listing Service` publishes listing documents to a queue
  and an indexer updates the index — write latency is decoupled from indexing,
  so listing creation is fast and a large re-index does not block the write
  path.
- Query flow: the buyer hits the gateway, the gateway queries the index for
  matching documents with filters (category, price range, condition) and a sort
  (relevance, recency, price), then hydrates the top results from a cache of hot
  listing payloads in `Redis`.

Keep the index documents flat and pre-aggregated — no joins, no per-query
hydration from the DB — so a search is purely an index round trip.

- Add ranking signals (seller rating, view velocity, sales velocity) as indexed
  fields rather than scoring at query time, which keeps ranking cheap and
  tunable.
- Use filter caches for popular facets, replicate index shards for read scaling,
  and accept a small window of indexing lag — a listing appears in search
  seconds after creation, which buyers and sellers tolerate.
- Warm the index continuously and monitor query latency per shard; a slow shard
  is split, not healed by retries.
- The design goal: P99 search latency of tens of milliseconds at millions of
  listings with freshness measured in seconds, not minutes.

Operationally, protect search quality and cost.

- Tune relevance with click-through feedback — which listings buyers open and
  buy from — collected as logs and folded into scoring offline.
- Cap query cost with pagination limits and facet counts, and keep the index
  itself cheap by storing only searchable fields; heavy payloads live in the
  cache and DB.
- The result is a system where a million listings feel small to the user and the
  infrastructure stays flat regardless of listing growth.

## Source

````text
title: Online Marketplace
node buyer: Buyer [round, icon=browser]
node seller: Seller [round, icon=browser]
node api: API Gateway [icon=server]
node listing: Listing Service [icon=file]
node search: Listing Search [icon=search]
node bid: Bidding Engine [icon=compute]
node auction: Auction Timer [icon=worker]
node escrow: Escrow Service [icon=shield]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node db: Listings DB [cylinder, icon=database]
node cache: Hot Listings [cylinder, icon=cache]

edge seller -> api: create listing
edge api -> listing: persist
edge listing -> db: store
edge listing -> search: index
edge buyer -> api: place bid
edge api -> bid: record
edge bid -> auction: deadline
edge bid -> escrow: hold funds
edge escrow -> pay: settle
edge auction -> notify: outbid
edge buyer -> api: search
edge api -> search: query
edge search -> cache: hit
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Online Marketplace
buyer: Buyer
seller: Seller
api: API Gateway
listing: Listing Service
search: Listing Search
bid: Bidding Engine
auction: Auction Timer
escrow: Escrow Service
pay: Payment Service
notify: Notifications
db: Listings DB
cache: Hot Listings

seller ─► api ─► create listing
api ─► listing ─► persist
listing ─► db ─► store
listing ─► search ─► index
buyer ─► api ─► place bid
api ─► bid ─► record
bid ─► auction ─► deadline
bid ─► escrow ─► hold funds
escrow ─► pay ─► settle
auction ─► notify ─► outbid
buyer ─► api ─► search
api ─► search ─► query
search ─► cache ─► hit
````

## Design

### Design an online marketplace

A marketplace has two user classes with different roles: sellers create listings
and buyers discover and bid on them. The `API Gateway` fronts the platform.

- Sellers create listings through the `Listing Service`, which persists to
  `Listings DB` and indexes into `Listing Search` so buyers can find them.
- Buyers place bids through the `Bidding Engine`, which records the bid, checks
  the `Auction Timer` for the deadline, and holds funds via `Escrow` so a
  winning bidder is committed.
- When the timer fires, the winning bid settles through the `Payment Service`,
  and `Notifications` fan out outbid, win, and ship events.

The system has two dominant and separable workloads: writes (listing creation,
bid placement) and reads (search, listing views, category browse).

- Separate them cleanly — read requests hit the search index and caches, while
  writes serialize on the listing and bidding services.
- Hot, high-velocity listings live in a `Redis` cache backed by the durable DB,
  and search runs on a dedicated inverted index.
- Correctness concentrates in the bid path: it must be atomic, deadline-aware,
  and race-free.
- Everything downstream of a winning bid — escrow hold, payment settlement,
  seller notification — is a saga: each step persists its local state and emits
  an event, with compensation (refund the escrow) if a later step fails.
- The design goal is that under any mix of concurrent bids and searches, exactly
  one buyer wins each auction and every buyer sees a consistent state.

Scale and failure handling reinforce the split.

- The read path scales horizontally behind the index and cache, so heavy search
  traffic never competes with bid writes.
- The bid path stays correct under any failure — its state lives in durable
  stores with idempotent handlers, and the hot listing key is isolated from
  everything else.
- This separation also makes the system predictable: a search-index rebuild
  degrades discovery, never the auction.

### How do you model listings and categories?

Listings are semi-structured: a fixed core (title, price, seller, condition,
status) plus custom attributes that vary wildly by category — color for a
t-shirt, engine size for a car, storage for a phone.

- Model the fixed fields as columns on a `listing` table, and the flexible ones
  as a JSON/JSONB attribute map or an EAV-style attribute table, so new
  categories ship without schema migrations.
- A `category(id, parent_id, name)` tree supports multi-level browse and faceted
  filtering; each listing references a leaf category, and the tree lets queries
  aggregate up.
- Keep the canonical document in the `Listing Service` store and flatten it into
  the search index at write time, precomputing facets and filters so
  category-specific searches are index lookups rather than runtime joins.

Auction listings need auction-specific state: current bid, minimum increment,
start/end time, reserve price, and bid history.

- Keep those as columns on the auction subtype or a separate table, updated
  transactionally with bid state.
- Listing `status` — `active`, `ended`, `sold`, `cancelled` — drives visibility
  in search and must change atomically with the bid that ends the auction.
- The trade-off in the flexible schema is that typed queries become harder, so
  validation of attribute schemas happens at write time per category, and the
  search index carries the denormalized attributes that queries actually filter
  on.
- This keeps the write model simple while making the read model fast.

Two operational considerations round out the model.

- Bulk import and migration need an idempotent upsert path — sellers re-publish
  the same listing without duplicating it — and every write emits an event that
  drives the search index, notifications, and analytics.
- The model must also survive abuse: flag listings with implausible attribute
  combinations or reused photos at write time, so the catalog stays trustworthy
  and search quality stays high.

### How do you run auctions with strict deadlines?

An auction must end exactly at its deadline regardless of activity, and the
final state must be consistent — one winner, one price.

- Never rely on a lazy check at bid time; run an explicit timer.
- The `Auction Timer` holds a sorted set of `(end_time, auction_id)` in `Redis`
  with workers popping due items, or uses scheduled queues per shard, and
  atomically transitions the auction from `active` to `ended`, freezing the
  winning bid.
- Bid placement and the deadline are serialized on the same key: a single Lua
  script or DB transaction checks `now < end_time` and
  `new_price > current_price` and writes the new high bid in one atomic step, so
  a bid racing the deadline can never land after it.

Support anti-sniping: when a bid arrives in the final seconds, extend the
auction by bumping `end_time` within the same atomic script, so last-second
bidders cannot insta-win.

- The deadline itself must be derived from the authoritative record in
  `Listings DB`, never from in-memory state, so a worker crash or restart cannot
  delay settlement.
- The timer is a dispatch mechanism, not the source of truth: after the timer
  fires, it writes the ended state to the DB.
- If a timer worker dies, a monitor re-scans the sorted set and fires missed
  deadlines.
- The settlement step (escrow release to seller, charge to buyer, status to
  `sold`) then runs as an idempotent job keyed by auction id, safe to re-run
  after any crash.

Latency and durability also shape the design.

- The timer must tolerate being slightly late, but never early — settle at
  `end_time`, not before — and the escrow and payment steps must be idempotent
  because settlement may be retried after a crash.
- Monitor the gap between the fired timer and the stored end time as an SLO: a
  timer that drifts late erodes buyer trust even when no individual auction is
  wrong.

### How do you prevent double-sales and over-bidding?

Two distinct problems: two buyers must not both win the same auction, and a
buyer must not hold a winning position they cannot pay for.

- The first is solved by making the bid transition atomic.
- The `Bidding Engine` runs a single compare-and-set against the current high
  bid — a Lua script over `Redis` that rejects if `new_price <= current_price`
  or the auction has ended, else writes the new high bid — so concurrent bids
  serialize on one key and exactly one becomes the winner.
- No two requests can both observe the old price and both place a winning bid.

The second is solved with escrow.

- When a bid is placed, the `Escrow Service` holds funds (or an authorization)
  with the `Payment Service` before the bid is accepted, so a bidder cannot
  occupy the top position with no committed money.
- Over-bidding is further constrained by the increment rule — the minimum valid
  bid is current price plus increment — enforced inside the same atomic script.
- Handle the edge cases explicitly: reject seller self-bidding and shill bids
  using identity and history signals (they are fee and trust attacks, not
  concurrency bugs); make bid retries idempotent with a per-bidder, per-auction
  token so a network retry cannot place the same bid twice; and release the
  escrow of an outbid bidder immediately so their funds are not tied up.
- The result is a bid path where correctness comes from atomicity plus
  commitment, not from hoping requests arrive one at a time.

### How do you handle search over millions of listings?

Search is read-heavy and forgiving of slight staleness, so index asynchronously
and cache aggressively.

- The `Listing Search` service runs an inverted index (e.g., `Elasticsearch`)
  sharded by a hash of the listing id.
- At write time, the `Listing Service` publishes listing documents to a queue
  and an indexer updates the index — write latency is decoupled from indexing,
  so listing creation is fast and a large re-index does not block the write
  path.
- Query flow: the buyer hits the gateway, the gateway queries the index for
  matching documents with filters (category, price range, condition) and a sort
  (relevance, recency, price), then hydrates the top results from a cache of hot
  listing payloads in `Redis`.

Keep the index documents flat and pre-aggregated — no joins, no per-query
hydration from the DB — so a search is purely an index round trip.

- Add ranking signals (seller rating, view velocity, sales velocity) as indexed
  fields rather than scoring at query time, which keeps ranking cheap and
  tunable.
- Use filter caches for popular facets, replicate index shards for read scaling,
  and accept a small window of indexing lag — a listing appears in search
  seconds after creation, which buyers and sellers tolerate.
- Warm the index continuously and monitor query latency per shard; a slow shard
  is split, not healed by retries.
- The design goal: P99 search latency of tens of milliseconds at millions of
  listings with freshness measured in seconds, not minutes.

Operationally, protect search quality and cost.

- Tune relevance with click-through feedback — which listings buyers open and
  buy from — collected as logs and folded into scoring offline.
- Cap query cost with pagination limits and facet counts, and keep the index
  itself cheap by storing only searchable fields; heavy payloads live in the
  cache and DB.
- The result is a system where a million listings feel small to the user and the
  infrastructure stays flat regardless of listing growth.

## Source

```text
title: Online Marketplace
node buyer: Buyer [round, icon=browser]
node seller: Seller [round, icon=browser]
node api: API Gateway [icon=server]
node listing: Listing Service [icon=file]
node search: Listing Search [icon=search]
node bid: Bidding Engine [icon=compute]
node auction: Auction Timer [icon=worker]
node escrow: Escrow Service [icon=shield]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node db: Listings DB [cylinder, icon=database]
node cache: Hot Listings [cylinder, icon=cache]

edge seller -> api: create listing
edge api -> listing: persist
edge listing -> db: store
edge listing -> search: index
edge buyer -> api: place bid
edge api -> bid: record
edge bid -> auction: deadline
edge bid -> escrow: hold funds
edge escrow -> pay: settle
edge auction -> notify: outbid
edge buyer -> api: search
edge api -> search: query
edge search -> cache: hit
```

## Q&A

### Q: Design an online marketplace

**A:** A marketplace has two user classes with different roles: sellers create listings
and buyers discover and bid on them. The `API Gateway` fronts the platform.

- Sellers create listings through the `Listing Service`, which persists to
  `Listings DB` and indexes into `Listing Search` so buyers can find them.
- Buyers place bids through the `Bidding Engine`, which records the bid, checks
  the `Auction Timer` for the deadline, and holds funds via `Escrow` so a
  winning bidder is committed.
- When the timer fires, the winning bid settles through the `Payment Service`,
  and `Notifications` fan out outbid, win, and ship events.

The system has two dominant and separable workloads: writes (listing creation,
bid placement) and reads (search, listing views, category browse).

- Separate them cleanly — read requests hit the search index and caches, while
  writes serialize on the listing and bidding services.
- Hot, high-velocity listings live in a `Redis` cache backed by the durable DB,
  and search runs on a dedicated inverted index.
- Correctness concentrates in the bid path: it must be atomic, deadline-aware,
  and race-free.
- Everything downstream of a winning bid — escrow hold, payment settlement,
  seller notification — is a saga: each step persists its local state and emits
  an event, with compensation (refund the escrow) if a later step fails.
- The design goal is that under any mix of concurrent bids and searches, exactly
  one buyer wins each auction and every buyer sees a consistent state.

Scale and failure handling reinforce the split.

- The read path scales horizontally behind the index and cache, so heavy search
  traffic never competes with bid writes.
- The bid path stays correct under any failure — its state lives in durable
  stores with idempotent handlers, and the hot listing key is isolated from
  everything else.
- This separation also makes the system predictable: a search-index rebuild
  degrades discovery, never the auction.

### Q: How do you model listings and categories?

**A:** Listings are semi-structured: a fixed core (title, price, seller, condition,
status) plus custom attributes that vary wildly by category — color for a
t-shirt, engine size for a car, storage for a phone.

- Model the fixed fields as columns on a `listing` table, and the flexible ones
  as a JSON/JSONB attribute map or an EAV-style attribute table, so new
  categories ship without schema migrations.
- A `category(id, parent_id, name)` tree supports multi-level browse and faceted
  filtering; each listing references a leaf category, and the tree lets queries
  aggregate up.
- Keep the canonical document in the `Listing Service` store and flatten it into
  the search index at write time, precomputing facets and filters so
  category-specific searches are index lookups rather than runtime joins.

Auction listings need auction-specific state: current bid, minimum increment,
start/end time, reserve price, and bid history.

- Keep those as columns on the auction subtype or a separate table, updated
  transactionally with bid state.
- Listing `status` — `active`, `ended`, `sold`, `cancelled` — drives visibility
  in search and must change atomically with the bid that ends the auction.
- The trade-off in the flexible schema is that typed queries become harder, so
  validation of attribute schemas happens at write time per category, and the
  search index carries the denormalized attributes that queries actually filter
  on.
- This keeps the write model simple while making the read model fast.

Two operational considerations round out the model.

- Bulk import and migration need an idempotent upsert path — sellers re-publish
  the same listing without duplicating it — and every write emits an event that
  drives the search index, notifications, and analytics.
- The model must also survive abuse: flag listings with implausible attribute
  combinations or reused photos at write time, so the catalog stays trustworthy
  and search quality stays high.

### Q: How do you run auctions with strict deadlines?

**A:** An auction must end exactly at its deadline regardless of activity, and the
final state must be consistent — one winner, one price.

- Never rely on a lazy check at bid time; run an explicit timer.
- The `Auction Timer` holds a sorted set of `(end_time, auction_id)` in `Redis`
  with workers popping due items, or uses scheduled queues per shard, and
  atomically transitions the auction from `active` to `ended`, freezing the
  winning bid.
- Bid placement and the deadline are serialized on the same key: a single Lua
  script or DB transaction checks `now < end_time` and
  `new_price > current_price` and writes the new high bid in one atomic step, so
  a bid racing the deadline can never land after it.

Support anti-sniping: when a bid arrives in the final seconds, extend the
auction by bumping `end_time` within the same atomic script, so last-second
bidders cannot insta-win.

- The deadline itself must be derived from the authoritative record in
  `Listings DB`, never from in-memory state, so a worker crash or restart cannot
  delay settlement.
- The timer is a dispatch mechanism, not the source of truth: after the timer
  fires, it writes the ended state to the DB.
- If a timer worker dies, a monitor re-scans the sorted set and fires missed
  deadlines.
- The settlement step (escrow release to seller, charge to buyer, status to
  `sold`) then runs as an idempotent job keyed by auction id, safe to re-run
  after any crash.

Latency and durability also shape the design.

- The timer must tolerate being slightly late, but never early — settle at
  `end_time`, not before — and the escrow and payment steps must be idempotent
  because settlement may be retried after a crash.
- Monitor the gap between the fired timer and the stored end time as an SLO: a
  timer that drifts late erodes buyer trust even when no individual auction is
  wrong.

### Q: How do you prevent double-sales and over-bidding?

**A:** Two distinct problems: two buyers must not both win the same auction, and a
buyer must not hold a winning position they cannot pay for.

- The first is solved by making the bid transition atomic.
- The `Bidding Engine` runs a single compare-and-set against the current high
  bid — a Lua script over `Redis` that rejects if `new_price <= current_price`
  or the auction has ended, else writes the new high bid — so concurrent bids
  serialize on one key and exactly one becomes the winner.
- No two requests can both observe the old price and both place a winning bid.

The second is solved with escrow.

- When a bid is placed, the `Escrow Service` holds funds (or an authorization)
  with the `Payment Service` before the bid is accepted, so a bidder cannot
  occupy the top position with no committed money.
- Over-bidding is further constrained by the increment rule — the minimum valid
  bid is current price plus increment — enforced inside the same atomic script.
- Handle the edge cases explicitly: reject seller self-bidding and shill bids
  using identity and history signals (they are fee and trust attacks, not
  concurrency bugs); make bid retries idempotent with a per-bidder, per-auction
  token so a network retry cannot place the same bid twice; and release the
  escrow of an outbid bidder immediately so their funds are not tied up.
- The result is a bid path where correctness comes from atomicity plus
  commitment, not from hoping requests arrive one at a time.

### Q: How do you handle search over millions of listings?

**A:** Search is read-heavy and forgiving of slight staleness, so index asynchronously
and cache aggressively.

- The `Listing Search` service runs an inverted index (e.g., `Elasticsearch`)
  sharded by a hash of the listing id.
- At write time, the `Listing Service` publishes listing documents to a queue
  and an indexer updates the index — write latency is decoupled from indexing,
  so listing creation is fast and a large re-index does not block the write
  path.
- Query flow: the buyer hits the gateway, the gateway queries the index for
  matching documents with filters (category, price range, condition) and a sort
  (relevance, recency, price), then hydrates the top results from a cache of hot
  listing payloads in `Redis`.

Keep the index documents flat and pre-aggregated — no joins, no per-query
hydration from the DB — so a search is purely an index round trip.

- Add ranking signals (seller rating, view velocity, sales velocity) as indexed
  fields rather than scoring at query time, which keeps ranking cheap and
  tunable.
- Use filter caches for popular facets, replicate index shards for read scaling,
  and accept a small window of indexing lag — a listing appears in search
  seconds after creation, which buyers and sellers tolerate.
- Warm the index continuously and monitor query latency per shard; a slow shard
  is split, not healed by retries.
- The design goal: P99 search latency of tens of milliseconds at millions of
  listings with freshness measured in seconds, not minutes.

Operationally, protect search quality and cost.

- Tune relevance with click-through feedback — which listings buyers open and
  buy from — collected as logs and folded into scoring offline.
- Cap query cost with pagination limits and facet counts, and keep the index
  itself cheap by storing only searchable fields; heavy payloads live in the
  cache and DB.
- The result is a system where a million listings feel small to the user and the
  infrastructure stays flat regardless of listing growth.

## Source

```text
title: Online Marketplace
node buyer: Buyer [round, icon=browser]
node seller: Seller [round, icon=browser]
node api: API Gateway [icon=server]
node listing: Listing Service [icon=file]
node search: Listing Search [icon=search]
node bid: Bidding Engine [icon=compute]
node auction: Auction Timer [icon=worker]
node escrow: Escrow Service [icon=shield]
node pay: Payment Service [icon=shield]
node notify: Notifications [icon=message]
node db: Listings DB [cylinder, icon=database]
node cache: Hot Listings [cylinder, icon=cache]

edge seller -> api: create listing
edge api -> listing: persist
edge listing -> db: store
edge listing -> search: index
edge buyer -> api: place bid
edge api -> bid: record
edge bid -> auction: deadline
edge bid -> escrow: hold funds
edge escrow -> pay: settle
edge auction -> notify: outbid
edge buyer -> api: search
edge api -> search: query
edge search -> cache: hit
```
