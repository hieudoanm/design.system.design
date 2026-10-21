# Ad Serving — Ad Network

Design an ad serving platform

**Difficulty:** Medium

**Tags:** realtime, recommendation

## Functional Requirements

- an ad serving platform
- run a real-time auction under latency?
- target ads without hurting performance?
- enforce budgets and frequency caps?
- attribute conversions across touchpoints?

## Non-Functional Requirements

- The platform brokers a real-time auction between publishers who sell impressions
  and advertisers who buy them.

- When a user opens a publisher site, the page fires an ad request to the
  supply-side platform (SSP), which calls the ad exchange.
- The exchange fans the impression out to demand-side platforms (DSPs); each DSP
  evaluates its advertisers' targeting rules against the user, prices the
  impression, and returns a bid.
- The exchange selects the highest eligible bidder, and the SSP renders the
  winning creative.
- A tracking service logs the impression and click.
- Every step runs under a hard latency budget — the whole auction round trip
  must complete in roughly 100ms or the page forfeits the slot.

The data model is centered on a few stores:

- Ad store — creative metadata (size, destination URL, policy compliance).
- User profile store — segments and identifiers for targeting.
- Budget service — tracks spend per campaign.
- Reporting pipeline — turns raw impression and click events into advertiser
  dashboards.

The critical path is read-heavy and latency-bound, so the auction logic runs in
memory:

- Profiles are pre-loaded, and targeting is an inverted index.
- No database round trip happens between receiving a request and returning a
  bid.

Compliance and failure handling sit at the edges:

- Consent management: profile building and sharing honor opt-out and consent
  signals so targeted advertising stays lawful.
- Failure handling: if the exchange or a DSP times out, a fallback path serves a
  house ad so the page always has something to render.
- Observability: impression loss is measured so any degradation is visible..
- The auction is a fan-out-and-merge with a hard deadline.

- The exchange sends the impression to many DSPs in parallel over pre-warmed
  keep-alive connections.
- It waits for bids up to a deadline (commonly 80–100ms from request receipt),
  then picks the highest eligible bid above the seller's floor price.
- Nothing on the path may hit a slow store: user profiles and segment
  memberships are resident in RAM, and targeting is an in-memory lookup, so a
  DSP answers in single-digit milliseconds.
- The auction per node is single-threaded and event-driven, letting one exchange
  instance handle tens of thousands of concurrent impressions without lock
  contention.

Timeouts and validation:

- A DSP that misses the deadline is dropped and the auction proceeds with the
  bids that arrived — the page would rather show a cheaper ad than wait.
- Reserve price checks happen first, so the exchange short-circuits when even
  the best possible bid cannot clear the floor.
- Each bid is validated for price integrity and creative compliance before it
  can win; if nothing clears, a low-CPM house or remnant ad wins the pass.

Scaling:

- Exchange nodes are stateless, so horizontal scaling comes free.
- Impressions are hashed across nodes by site or user, and the profile data they
  need is replicated in each node's memory, keeping P99 auction latency stable
  as QPS grows.
- Load shedding is explicit: when a node exceeds its auction budget it stops
  accepting new requests rather than serving late bids, because a bid returned
  after the deadline is worthless..
- Targeting is split into a coarse stage and a fine stage so expensive logic only
  runs on a tiny candidate set.

Coarse targeting happens at bid time against pre-computed, in-memory segments:

- User attributes like geo, device, interests, and retargeting lists are
  materialized into segment memberships (bitsets or roaring bitmaps), refreshed
  asynchronously from streaming events.
- A DSP looks up the user's segment IDs and walks an inverted index from segment
  to eligible campaign IDs, yielding a candidate set in microseconds without
  touching a database.
- Consent and privacy rules gate which segments are usable per user, so blocked
  segments simply never appear in the index for that profile.

Fine targeting then runs on the handful of candidates that passed the coarse
filter, not on the full campaign table:

- It applies budget checks, frequency caps, creative constraints, and bid
  adjustment.
- Profile data is allowed to be minutes stale, which is acceptable because
  targeting accuracy barely moves in that window; the freshness trade-off buys a
  hot path that never reads from disk.
- Because the matching logic lives inside the DSP process and nodes are sharded
  by user ID, targeting capacity scales linearly with the number of DSP
  instances.

This two-stage design is the answer to "target without hurting performance": do
the broad narrowing in memory, then apply the precise rules to almost nothing.

- A/B benchmarking of targeting rules and index builds runs continuously, so a
  rule change that bloats the index or slows lookup is caught in staging before
  it ships to the real-time path..
- Spend tracking lives in a distributed counter store such as Redis.

- On every auction win, the budget service atomically increments a per-campaign
  daily-spend counter.
- If the increment would cross the budget, the campaign is removed from the
  candidate set for subsequent auctions.
- Because auctions are concurrent across many exchange nodes, reservation must
  be atomic — a Lua script that checks the remaining budget and increments in
  one step prevents overspend races.
- Budget enforcement is optimistic by design: a small overspend is tolerated
  within the auction window and reconciled in daily batch, so the system does
  not serialize every impression on a global lock.

Frequency caps are a separate set of counters keyed by (user, campaign):

- They count impressions over a rolling window and are checked in the fine
  targeting stage; counters expire with the window so cap state stays bounded.

Pacing smooths delivery across the day:

- The budget service computes an expected hourly spend and lowers the bid
  multiplier when a campaign is ahead of plan.
- A campaign therefore neither exhausts its budget at 9am nor trickles out at a
  constant low rate.

Failure handling:

- When the counter store is unavailable the auction fails open — the campaign
  bids without budget enforcement and the event is logged — rather than dropping
  all traffic.
- The reconciler corrects the drift once the store returns.
- Budget counters are sharded by campaign so a single campaign's spend rate
  never bottlenecks on one counter, and the reconciler reports over- and
  under-delivery per campaign..

## Estimation

- must complete in roughly 100ms or the page forfeits the slot.

## Architecture Diagram

```text
title: Ad Serving
user: User
site: Publisher Site
ssp: Ad Request
dsp: DSP Bidding
adx: Ad Exchange
profile: User Profile
target: Targeting Engine
budget: Budget Service
tracking: Tracking Service
adstore: Ad Store
report: Reporting

user ─► site ─► open
site ─► ssp ─► request
ssp ─► adx ─► auction
adx ─► dsp ─► bid
dsp ─► target ─► match
target ─► profile ─► lookup
adx ─► ssp ─► winner
ssp ─► user ─► ad
user ─► tracking ─► impression
tracking ─► budget ─► charge
tracking ─► report ─► log
```

## Design

### Design an ad serving platform

The platform brokers a real-time auction between publishers who sell impressions
and advertisers who buy them.

- When a user opens a publisher site, the page fires an ad request to the
  supply-side platform (SSP), which calls the ad exchange.
- The exchange fans the impression out to demand-side platforms (DSPs); each DSP
  evaluates its advertisers' targeting rules against the user, prices the
  impression, and returns a bid.
- The exchange selects the highest eligible bidder, and the SSP renders the
  winning creative.
- A tracking service logs the impression and click.
- Every step runs under a hard latency budget — the whole auction round trip
  must complete in roughly 100ms or the page forfeits the slot.

The data model is centered on a few stores:

- Ad store — creative metadata (size, destination URL, policy compliance).
- User profile store — segments and identifiers for targeting.
- Budget service — tracks spend per campaign.
- Reporting pipeline — turns raw impression and click events into advertiser
  dashboards.

The critical path is read-heavy and latency-bound, so the auction logic runs in
memory:

- Profiles are pre-loaded, and targeting is an inverted index.
- No database round trip happens between receiving a request and returning a
  bid.

Compliance and failure handling sit at the edges:

- Consent management: profile building and sharing honor opt-out and consent
  signals so targeted advertising stays lawful.
- Failure handling: if the exchange or a DSP times out, a fallback path serves a
  house ad so the page always has something to render.
- Observability: impression loss is measured so any degradation is visible.

### How do you run a real-time auction under latency?

The auction is a fan-out-and-merge with a hard deadline.

- The exchange sends the impression to many DSPs in parallel over pre-warmed
  keep-alive connections.
- It waits for bids up to a deadline (commonly 80–100ms from request receipt),
  then picks the highest eligible bid above the seller's floor price.
- Nothing on the path may hit a slow store: user profiles and segment
  memberships are resident in RAM, and targeting is an in-memory lookup, so a
  DSP answers in single-digit milliseconds.
- The auction per node is single-threaded and event-driven, letting one exchange
  instance handle tens of thousands of concurrent impressions without lock
  contention.

Timeouts and validation:

- A DSP that misses the deadline is dropped and the auction proceeds with the
  bids that arrived — the page would rather show a cheaper ad than wait.
- Reserve price checks happen first, so the exchange short-circuits when even
  the best possible bid cannot clear the floor.
- Each bid is validated for price integrity and creative compliance before it
  can win; if nothing clears, a low-CPM house or remnant ad wins the pass.

Scaling:

- Exchange nodes are stateless, so horizontal scaling comes free.
- Impressions are hashed across nodes by site or user, and the profile data they
  need is replicated in each node's memory, keeping P99 auction latency stable
  as QPS grows.
- Load shedding is explicit: when a node exceeds its auction budget it stops
  accepting new requests rather than serving late bids, because a bid returned
  after the deadline is worthless.

### How do you target ads without hurting performance?

Targeting is split into a coarse stage and a fine stage so expensive logic only
runs on a tiny candidate set.

Coarse targeting happens at bid time against pre-computed, in-memory segments:

- User attributes like geo, device, interests, and retargeting lists are
  materialized into segment memberships (bitsets or roaring bitmaps), refreshed
  asynchronously from streaming events.
- A DSP looks up the user's segment IDs and walks an inverted index from segment
  to eligible campaign IDs, yielding a candidate set in microseconds without
  touching a database.
- Consent and privacy rules gate which segments are usable per user, so blocked
  segments simply never appear in the index for that profile.

Fine targeting then runs on the handful of candidates that passed the coarse
filter, not on the full campaign table:

- It applies budget checks, frequency caps, creative constraints, and bid
  adjustment.
- Profile data is allowed to be minutes stale, which is acceptable because
  targeting accuracy barely moves in that window; the freshness trade-off buys a
  hot path that never reads from disk.
- Because the matching logic lives inside the DSP process and nodes are sharded
  by user ID, targeting capacity scales linearly with the number of DSP
  instances.

This two-stage design is the answer to "target without hurting performance": do
the broad narrowing in memory, then apply the precise rules to almost nothing.

- A/B benchmarking of targeting rules and index builds runs continuously, so a
  rule change that bloats the index or slows lookup is caught in staging before
  it ships to the real-time path.

### How do you enforce budgets and frequency caps?

Spend tracking lives in a distributed counter store such as Redis.

- On every auction win, the budget service atomically increments a per-campaign
  daily-spend counter.
- If the increment would cross the budget, the campaign is removed from the
  candidate set for subsequent auctions.
- Because auctions are concurrent across many exchange nodes, reservation must
  be atomic — a Lua script that checks the remaining budget and increments in
  one step prevents overspend races.
- Budget enforcement is optimistic by design: a small overspend is tolerated
  within the auction window and reconciled in daily batch, so the system does
  not serialize every impression on a global lock.

Frequency caps are a separate set of counters keyed by (user, campaign):

- They count impressions over a rolling window and are checked in the fine
  targeting stage; counters expire with the window so cap state stays bounded.

Pacing smooths delivery across the day:

- The budget service computes an expected hourly spend and lowers the bid
  multiplier when a campaign is ahead of plan.
- A campaign therefore neither exhausts its budget at 9am nor trickles out at a
  constant low rate.

Failure handling:

- When the counter store is unavailable the auction fails open — the campaign
  bids without budget enforcement and the event is logged — rather than dropping
  all traffic.
- The reconciler corrects the drift once the store returns.
- Budget counters are sharded by campaign so a single campaign's spend rate
  never bottlenecks on one counter, and the reconciler reports over- and
  under-delivery per campaign.

### How do you attribute conversions across touchpoints?

Every served ad embeds a unique click ID, and the tracking pixel carries it
through to the advertiser's site, so the tracking service receives impression,
click, and conversion events that share the same lineage.

- Each event is tagged with the click ID, user ID, campaign ID, and timestamp,
  and streamed into a data pipeline.
- Attribution joins conversions back to the click or impression that caused them
  within a configurable attribution window (typically 1–30 days).
- Joins are exact on the click ID, with cookie and device IDs as fallback keys
  when a conversion happens on a different page or browser.
- Click-through and view-through attribution are tracked separately because they
  have very different base rates.

Multi-touch models distribute credit across the ordered sequence of touchpoints
that preceded a conversion:

- Last-click, first-click, and time-decay all reduce to weighted sums over the
  user's event stream.
- The join is expensive, so it runs as a batched offline job over event logs
  rather than inline.
- The results feed both the reporting store and the budget optimizer's
  return-on-spend model.

Cross-device attribution is inherently approximate:

- Identifiers differ per device, so the system merges through a deterministic
  identity graph and clearly separates attributed from unattributed conversions
  in the reports.
- That honesty — plus configurable windows and models — is what makes the
  attribution numbers trusted by advertisers.
- The pipeline is idempotent — duplicate events are deduplicated on the
  (click_id, event_type, timestamp) key — so retries in the event collector
  never double-count a conversion.

## Source

```text
title: Ad Serving
node user: User [round, icon=browser]
node site: Publisher Site [icon=browser]
node ssp: Ad Request [icon=server]
node dsp: DSP Bidding [icon=compute]
node adx: Ad Exchange [icon=queue]
node profile: User Profile [cylinder, icon=database]
node target: Targeting Engine [icon=search]
node budget: Budget Service [icon=cache]
node tracking: Tracking Service [icon=worker]
node adstore: Ad Store [cylinder, icon=file]
node report: Reporting [icon=search]

edge user -> site: open
edge site -> ssp: request
edge ssp -> adx: auction
edge adx -> dsp: bid
edge dsp -> target: match
edge target -> profile: lookup
edge adx -> ssp: winner
edge ssp -> user: ad
edge user -> tracking: impression
edge tracking -> budget: charge
edge tracking -> report: log
```

## Q&A

### Q: Design an ad serving platform

**A:** The platform brokers a real-time auction between publishers who sell impressions
and advertisers who buy them.

- When a user opens a publisher site, the page fires an ad request to the
  supply-side platform (SSP), which calls the ad exchange.
- The exchange fans the impression out to demand-side platforms (DSPs); each DSP
  evaluates its advertisers' targeting rules against the user, prices the
  impression, and returns a bid.
- The exchange selects the highest eligible bidder, and the SSP renders the
  winning creative.
- A tracking service logs the impression and click.
- Every step runs under a hard latency budget — the whole auction round trip
  must complete in roughly 100ms or the page forfeits the slot.

The data model is centered on a few stores:

- Ad store — creative metadata (size, destination URL, policy compliance).
- User profile store — segments and identifiers for targeting.
- Budget service — tracks spend per campaign.
- Reporting pipeline — turns raw impression and click events into advertiser
  dashboards.

The critical path is read-heavy and latency-bound, so the auction logic runs in
memory:

- Profiles are pre-loaded, and targeting is an inverted index.
- No database round trip happens between receiving a request and returning a
  bid.

Compliance and failure handling sit at the edges:

- Consent management: profile building and sharing honor opt-out and consent
  signals so targeted advertising stays lawful.
- Failure handling: if the exchange or a DSP times out, a fallback path serves a
  house ad so the page always has something to render.
- Observability: impression loss is measured so any degradation is visible.

### Q: How do you run a real-time auction under latency?

**A:** The auction is a fan-out-and-merge with a hard deadline.

- The exchange sends the impression to many DSPs in parallel over pre-warmed
  keep-alive connections.
- It waits for bids up to a deadline (commonly 80–100ms from request receipt),
  then picks the highest eligible bid above the seller's floor price.
- Nothing on the path may hit a slow store: user profiles and segment
  memberships are resident in RAM, and targeting is an in-memory lookup, so a
  DSP answers in single-digit milliseconds.
- The auction per node is single-threaded and event-driven, letting one exchange
  instance handle tens of thousands of concurrent impressions without lock
  contention.

Timeouts and validation:

- A DSP that misses the deadline is dropped and the auction proceeds with the
  bids that arrived — the page would rather show a cheaper ad than wait.
- Reserve price checks happen first, so the exchange short-circuits when even
  the best possible bid cannot clear the floor.
- Each bid is validated for price integrity and creative compliance before it
  can win; if nothing clears, a low-CPM house or remnant ad wins the pass.

Scaling:

- Exchange nodes are stateless, so horizontal scaling comes free.
- Impressions are hashed across nodes by site or user, and the profile data they
  need is replicated in each node's memory, keeping P99 auction latency stable
  as QPS grows.
- Load shedding is explicit: when a node exceeds its auction budget it stops
  accepting new requests rather than serving late bids, because a bid returned
  after the deadline is worthless.

### Q: How do you target ads without hurting performance?

**A:** Targeting is split into a coarse stage and a fine stage so expensive logic only
runs on a tiny candidate set.

Coarse targeting happens at bid time against pre-computed, in-memory segments:

- User attributes like geo, device, interests, and retargeting lists are
  materialized into segment memberships (bitsets or roaring bitmaps), refreshed
  asynchronously from streaming events.
- A DSP looks up the user's segment IDs and walks an inverted index from segment
  to eligible campaign IDs, yielding a candidate set in microseconds without
  touching a database.
- Consent and privacy rules gate which segments are usable per user, so blocked
  segments simply never appear in the index for that profile.

Fine targeting then runs on the handful of candidates that passed the coarse
filter, not on the full campaign table:

- It applies budget checks, frequency caps, creative constraints, and bid
  adjustment.
- Profile data is allowed to be minutes stale, which is acceptable because
  targeting accuracy barely moves in that window; the freshness trade-off buys a
  hot path that never reads from disk.
- Because the matching logic lives inside the DSP process and nodes are sharded
  by user ID, targeting capacity scales linearly with the number of DSP
  instances.

This two-stage design is the answer to "target without hurting performance": do
the broad narrowing in memory, then apply the precise rules to almost nothing.

- A/B benchmarking of targeting rules and index builds runs continuously, so a
  rule change that bloats the index or slows lookup is caught in staging before
  it ships to the real-time path.

### Q: How do you enforce budgets and frequency caps?

**A:** Spend tracking lives in a distributed counter store such as Redis.

- On every auction win, the budget service atomically increments a per-campaign
  daily-spend counter.
- If the increment would cross the budget, the campaign is removed from the
  candidate set for subsequent auctions.
- Because auctions are concurrent across many exchange nodes, reservation must
  be atomic — a Lua script that checks the remaining budget and increments in
  one step prevents overspend races.
- Budget enforcement is optimistic by design: a small overspend is tolerated
  within the auction window and reconciled in daily batch, so the system does
  not serialize every impression on a global lock.

Frequency caps are a separate set of counters keyed by (user, campaign):

- They count impressions over a rolling window and are checked in the fine
  targeting stage; counters expire with the window so cap state stays bounded.

Pacing smooths delivery across the day:

- The budget service computes an expected hourly spend and lowers the bid
  multiplier when a campaign is ahead of plan.
- A campaign therefore neither exhausts its budget at 9am nor trickles out at a
  constant low rate.

Failure handling:

- When the counter store is unavailable the auction fails open — the campaign
  bids without budget enforcement and the event is logged — rather than dropping
  all traffic.
- The reconciler corrects the drift once the store returns.
- Budget counters are sharded by campaign so a single campaign's spend rate
  never bottlenecks on one counter, and the reconciler reports over- and
  under-delivery per campaign.

### Q: How do you attribute conversions across touchpoints?

**A:** Every served ad embeds a unique click ID, and the tracking pixel carries it
through to the advertiser's site, so the tracking service receives impression,
click, and conversion events that share the same lineage.

- Each event is tagged with the click ID, user ID, campaign ID, and timestamp,
  and streamed into a data pipeline.
- Attribution joins conversions back to the click or impression that caused them
  within a configurable attribution window (typically 1–30 days).
- Joins are exact on the click ID, with cookie and device IDs as fallback keys
  when a conversion happens on a different page or browser.
- Click-through and view-through attribution are tracked separately because they
  have very different base rates.

Multi-touch models distribute credit across the ordered sequence of touchpoints
that preceded a conversion:

- Last-click, first-click, and time-decay all reduce to weighted sums over the
  user's event stream.
- The join is expensive, so it runs as a batched offline job over event logs
  rather than inline.
- The results feed both the reporting store and the budget optimizer's
  return-on-spend model.

Cross-device attribution is inherently approximate:

- Identifiers differ per device, so the system merges through a deterministic
  identity graph and clearly separates attributed from unattributed conversions
  in the reports.
- That honesty — plus configurable windows and models — is what makes the
  attribution numbers trusted by advertisers.
- The pipeline is idempotent — duplicate events are deduplicated on the
  (click_id, event_type, timestamp) key — so retries in the event collector
  never double-count a conversion.

## Source

```text
title: Ad Serving
node user: User [round, icon=browser]
node site: Publisher Site [icon=browser]
node ssp: Ad Request [icon=server]
node dsp: DSP Bidding [icon=compute]
node adx: Ad Exchange [icon=queue]
node profile: User Profile [cylinder, icon=database]
node target: Targeting Engine [icon=search]
node budget: Budget Service [icon=cache]
node tracking: Tracking Service [icon=worker]
node adstore: Ad Store [cylinder, icon=file]
node report: Reporting [icon=search]

edge user -> site: open
edge site -> ssp: request
edge ssp -> adx: auction
edge adx -> dsp: bid
edge dsp -> target: match
edge target -> profile: lookup
edge adx -> ssp: winner
edge ssp -> user: ad
edge user -> tracking: impression
edge tracking -> budget: charge
edge tracking -> report: log
```
