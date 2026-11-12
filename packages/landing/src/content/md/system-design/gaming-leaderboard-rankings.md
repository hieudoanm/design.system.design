# Gaming Leaderboard — Rankings

Design a gaming leaderboard service

**Difficulty:** Hard

**Tags:** gaming

## Functional Requirements

- a gaming leaderboard service
- store and update scores under concurrency?
- query top N and a players rank fast?
- handle ties and rank stability?
- scale to millions of players?

## Non-Functional Requirements

- Players submit scores through the `Game API`, which validates and hands them to
  the `Score Service`.

- The score lands in a `Sorted Set` (e.g., `Redis` `ZADD`) — the ranking data
  structure — and is persisted to the `Player DB` for durability.
- The `Rank Resolver` reads the sorted set for top-N ranges and per-player rank
  lookups; periodic `Snapshots` dump the state for rewards, history, and offline
  computation.
- On rank changes the system pushes `Notify` events and the `Reward Service`
  grants prizes.

The core insight is that an in-memory `Redis` sorted set is a near-perfect fit.

- Leaderboards are hot, read-heavy, and need O(log n) rank operations on a
  single structure.
- The durable DB is the source of truth for history, replay, and accounting.
- This drives a clean read/write split — score writes are small atomic ops on
  `Redis`, while top-N reads are range scans of the same structure, both served
  without table scans.
- The failure mode to guard against is divergence: if `Redis` loses data or
  crashes, the leaderboard must be rebuilt from the `Player DB` and the delta
  log.
- So the design pairs an in-memory primary structure with a durable replay
  source and snapshots, giving low latency on the hot path and a guaranteed
  rebuild path on failure.

Two more considerations shape the design.

- Latency matters because rank reads ride the critical path of the game client —
  the top-N view and "where am I?" render within one request — so the resolver's
  reads must be sub-millisecond and never touch the DB.
- Consistency is bounded, not absolute: a player's score may lag a few seconds
  between game server and display, but the value a player sees must never go
  backward.
- That ordering — `Redis` for speed, DB for durability, snapshots for history —
  is the whole architecture in one sentence..
- A player's score is a single authoritative number, so updates must be atomic to
  avoid lost updates when two matches report at the same time.

- `Redis` sorted sets make this trivial: `ZINCRBY leaderboard score player_id`
  atomically adds to the player's current value, and the `Score Service` just
  forwards validated increments.
- Because increments commute, there is no lost-update race on the primary
  structure.
- Idempotency matters for retries: tag each submission with a `match_id` so a
  retried packet cannot double-increment — `ZINCRBY` is not naturally
  idempotent, so dedupe by `match_id` before applying.

The `Redis` write is the fast path; persistence is asynchronous.

- Batch score deltas to the `Player DB` (or a queue feeding it), and treat that
  delta log as the replay source for a rebuild — so a `Redis` crash loses
  nothing that cannot be reconstructed.
- On the durable side, apply deltas rather than blind overwrites, or use
  last-writer-wins on the final value since intermediate increments commute; the
  durable store converges to the same total as `Redis`.
- The trade-off: keeping `Redis` primary gives the lowest write latency but
  requires a replay mechanism; keeping the DB primary avoids divergence but adds
  a write hop on the hot path.
- The pragmatic answer is `Redis`-primary with a durable delta log and periodic
  reconciliation, so divergence is bounded and detectable rather than silent.

Failure handling for the concurrent path:

- If `Redis` is unavailable, the score service should buffer increments in a
  bounded local queue and replay them on recovery rather than dropping scores —
  a dropped score in a competitive game is a support ticket.
- Make the persistence path idempotent by `match_id` so replays and retries
  never double-apply.
- And because scores are money-adjacent in reward systems, keep an audit trail
  of every `ZINCRBY` delta applied per player, so a reward dispute can be traced
  to the exact matches that produced the score..
- A single `Redis` sorted set stores millions of members efficiently — a few
  hundred MB for typical 64-bit scores — so start single-node before
  over-engineering.

- Beyond that, shard: split the leaderboard by region, game mode, or season so
  each set stays small, because most reads are within a shard (a player looks at
  their region, not the whole globe).
- Global views merge per-shard `ZREVRANGE` results at the `Rank Resolver` and
  re-sort the merged window, which bounds per-request work.
- Writes fan out only to the shard keyed by `(leaderboard_id, player_id)`, so no
  shard becomes a global write hotspot.

Separate the hot structure from the durable one.

- `Redis` handles live reads and writes while `Player DB` plus `Snapshots`
  provide durability, history, and analytics — scaling then becomes a matter of
  keeping `Redis` memory bounded and reconciling DB write throughput.
- Write amplification is the real ceiling: millions of players submitting
  frequently means millions of `ZINCRBY`, so batch the async persistence and
  shard the delta log by shard id so backfill and replay stay parallel.
- Consider seasonal leaderboards: archiving each season to snapshots shrinks the
  live set, keeps hot data small, and makes the "new season reset" a cheap
  operation instead of a rewrite of the whole structure.
- The design goal is a hot path that stays sub-millisecond at any player count
  and a rebuild path that completes in minutes, not hours.

Also think about durability and the seasonal lifecycle.

- Because `Redis` is memory and lossy on crash without the delta log, size the
  rebuild budget up front: snapshot frequency should make a rebuild a fast apply
  of deltas since the last snapshot, not a full replay of all time.
- For seasons, treat the transition as a data migration: snapshot the season,
  create a fresh set under a new key, and archive the old set — this keeps the
  live structure small and makes "last season" a read from snapshots.
- Monitor memory-per-shard and delta-log growth so the hot structure's cost is
  known before it becomes a problem.

## Source

````text
title: Leaderboard
node player: Player [round, icon=browser]
node api: Game API [icon=server]
node score: Score Service [icon=compute]
node zset: Sorted Set [cylinder, icon=cache]
node db: Player DB [cylinder, icon=database]
node rank: Rank Resolver [icon=search]
node snapshot: Snapshots [icon=file]
node notify: Push [icon=message]
node prize: Reward Service [icon=shield]

edge player -> api: submit score
edge api -> score: validate
edge score -> zset: insert
edge zset -> rank: lookup
edge player -> api: view top
edge api -> rank: top N
edge rank -> zset: range
edge score -> db: persist
edge db -> snapshot: dump
edge zset -> notify: rank change
edge notify -> prize: reward
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Leaderboard
player: Player
api: Game API
score: Score Service
zset: Sorted Set
db: Player DB
rank: Rank Resolver
snapshot: Snapshots
notify: Push
prize: Reward Service

player ─► api ─► submit score
api ─► score ─► validate
score ─► zset ─► insert
zset ─► rank ─► lookup
player ─► api ─► view top
api ─► rank ─► top N
rank ─► zset ─► range
score ─► db ─► persist
db ─► snapshot ─► dump
zset ─► notify ─► rank change
notify ─► prize ─► reward
````

## Design

### Design a gaming leaderboard service

Players submit scores through the `Game API`, which validates and hands them to
the `Score Service`.

- The score lands in a `Sorted Set` (e.g., `Redis` `ZADD`) — the ranking data
  structure — and is persisted to the `Player DB` for durability.
- The `Rank Resolver` reads the sorted set for top-N ranges and per-player rank
  lookups; periodic `Snapshots` dump the state for rewards, history, and offline
  computation.
- On rank changes the system pushes `Notify` events and the `Reward Service`
  grants prizes.

The core insight is that an in-memory `Redis` sorted set is a near-perfect fit.

- Leaderboards are hot, read-heavy, and need O(log n) rank operations on a
  single structure.
- The durable DB is the source of truth for history, replay, and accounting.
- This drives a clean read/write split — score writes are small atomic ops on
  `Redis`, while top-N reads are range scans of the same structure, both served
  without table scans.
- The failure mode to guard against is divergence: if `Redis` loses data or
  crashes, the leaderboard must be rebuilt from the `Player DB` and the delta
  log.
- So the design pairs an in-memory primary structure with a durable replay
  source and snapshots, giving low latency on the hot path and a guaranteed
  rebuild path on failure.

Two more considerations shape the design.

- Latency matters because rank reads ride the critical path of the game client —
  the top-N view and "where am I?" render within one request — so the resolver's
  reads must be sub-millisecond and never touch the DB.
- Consistency is bounded, not absolute: a player's score may lag a few seconds
  between game server and display, but the value a player sees must never go
  backward.
- That ordering — `Redis` for speed, DB for durability, snapshots for history —
  is the whole architecture in one sentence.

### How do you store and update scores under concurrency?

A player's score is a single authoritative number, so updates must be atomic to
avoid lost updates when two matches report at the same time.

- `Redis` sorted sets make this trivial: `ZINCRBY leaderboard score player_id`
  atomically adds to the player's current value, and the `Score Service` just
  forwards validated increments.
- Because increments commute, there is no lost-update race on the primary
  structure.
- Idempotency matters for retries: tag each submission with a `match_id` so a
  retried packet cannot double-increment — `ZINCRBY` is not naturally
  idempotent, so dedupe by `match_id` before applying.

The `Redis` write is the fast path; persistence is asynchronous.

- Batch score deltas to the `Player DB` (or a queue feeding it), and treat that
  delta log as the replay source for a rebuild — so a `Redis` crash loses
  nothing that cannot be reconstructed.
- On the durable side, apply deltas rather than blind overwrites, or use
  last-writer-wins on the final value since intermediate increments commute; the
  durable store converges to the same total as `Redis`.
- The trade-off: keeping `Redis` primary gives the lowest write latency but
  requires a replay mechanism; keeping the DB primary avoids divergence but adds
  a write hop on the hot path.
- The pragmatic answer is `Redis`-primary with a durable delta log and periodic
  reconciliation, so divergence is bounded and detectable rather than silent.

Failure handling for the concurrent path:

- If `Redis` is unavailable, the score service should buffer increments in a
  bounded local queue and replay them on recovery rather than dropping scores —
  a dropped score in a competitive game is a support ticket.
- Make the persistence path idempotent by `match_id` so replays and retries
  never double-apply.
- And because scores are money-adjacent in reward systems, keep an audit trail
  of every `ZINCRBY` delta applied per player, so a reward dispute can be traced
  to the exact matches that produced the score.

### How do you query top N and a players rank fast?

Both operations are native to a `Redis` sorted set.

- `ZREVRANGE leaderboard 0 N-1` returns the top N in O(log n + m), and
  `ZREVRANK leaderboard player_id` returns a player's rank in O(log n) — no
  table scans and no `ORDER BY` over millions of rows, which is what a SQL
  approach would cost per request.
- The `Rank Resolver` serves these reads directly off `Redis`, with the top-N
  window cached since it changes slowly at the top.
- Cache page 1 (the podium) aggressively with a short TTL, compute deeper pages
  on demand, and write-through the most-viewed pages.

For the durable layer, the `Player DB` stores a score column indexed by
`(score DESC)`.

- Occasional full-history rebuilds and joins stay reasonable, but never route
  interactive rank reads through SQL — a full sort per request would not survive
  traffic.
- Combine with snapshots: hourly snapshots of the sorted set to `Snapshots`
  allow historical queries and make the top-N cache warm on cold start, so the
  first request after a restart does not wait for a full rebuild.
- If a single sorted set outgrows one node, shard by score range or by game and
  serve cross-shard top-N by merging per-shard results — O(shards) reads, which
  stays bounded because shard count is small.

Handle the read hot spots explicitly.

- The top of the leaderboard attracts far more reads than the middle, so cache
  the top-100 in the resolver with a short TTL and serve it without touching
  `Redis`; a player's own rank, by contrast, is nearly unique per user and is
  computed on demand.
- Rate-limit deep page access and pre-compute page snapshots for events such as
  a tournament end, where the whole board is viewed at once.
- This keeps the common case a cache hit and the uncommon case an O(log n)
  `Redis` op.

### How do you handle ties and rank stability?

Naive scoring by raw value creates ambiguous ties and jumpy ranks — at a global
reset, thousands of players at zero points reorder on every submit.

- Two fixes: tie-breakers and stable rank semantics.
- In `Redis`, make the effective score a composite — for example
  `score * 1e9 + (MAX_TIMESTAMP - completion_time)` — so equal point totals
  order by who finished first, giving deterministic ordering and
  competition-grade ranks.
- This is the common gaming pattern: the player who reached a score earlier
  ranks higher within the tie.

Alternatively, keep the integer score and define rank as _competition rank_.

- `ZREVRANK` counts members strictly ahead, so players with equal scores share
  the same displayed rank (two players at 1000 are both rank 3), and the next
  distinct score starts at 5.
- This is a display-layer decision, but the underlying set still needs a stable
  total order for `ZREVRANGE`.
- The `Notify` service should only fire rank-change events when the _displayed_
  rank changes, otherwise a tie reshuffle spams pushes and churns the reward
  service.
- Trade-offs: composite scores complicate reading raw points (decode score and
  tie-breaker) and break integer compression slightly, while competition ranks
  complicate top-N pagination because ties straddle page boundaries.
- Pick one semantic, apply it consistently, and make tie handling visible in the
  UI so players understand the ordering.

Choose the tie-breaker deliberately and document it.

- Most games want earliest-finish-first among equal scores, which the
  composite-score encoding gives for free; some want most-recent-first (a "hot
  streak" feel), which you get by inverting the timestamp component.
- Decide whether rank stability or absolute ordering matters more: competition
  rank changes only when someone overtakes a displayed position, which is stable
  and intuitive, whereas strict ordering changes on every tie-member update and
  causes rank jitter.
- The right answer is product-dependent — but pick one and make `ZREVRANK` and
  `ZREVRANGE` consistent with it everywhere, including snapshots and history.

### How do you scale to millions of players?

A single `Redis` sorted set stores millions of members efficiently — a few
hundred MB for typical 64-bit scores — so start single-node before
over-engineering.

- Beyond that, shard: split the leaderboard by region, game mode, or season so
  each set stays small, because most reads are within a shard (a player looks at
  their region, not the whole globe).
- Global views merge per-shard `ZREVRANGE` results at the `Rank Resolver` and
  re-sort the merged window, which bounds per-request work.
- Writes fan out only to the shard keyed by `(leaderboard_id, player_id)`, so no
  shard becomes a global write hotspot.

Separate the hot structure from the durable one.

- `Redis` handles live reads and writes while `Player DB` plus `Snapshots`
  provide durability, history, and analytics — scaling then becomes a matter of
  keeping `Redis` memory bounded and reconciling DB write throughput.
- Write amplification is the real ceiling: millions of players submitting
  frequently means millions of `ZINCRBY`, so batch the async persistence and
  shard the delta log by shard id so backfill and replay stay parallel.
- Consider seasonal leaderboards: archiving each season to snapshots shrinks the
  live set, keeps hot data small, and makes the "new season reset" a cheap
  operation instead of a rewrite of the whole structure.
- The design goal is a hot path that stays sub-millisecond at any player count
  and a rebuild path that completes in minutes, not hours.

Also think about durability and the seasonal lifecycle.

- Because `Redis` is memory and lossy on crash without the delta log, size the
  rebuild budget up front: snapshot frequency should make a rebuild a fast apply
  of deltas since the last snapshot, not a full replay of all time.
- For seasons, treat the transition as a data migration: snapshot the season,
  create a fresh set under a new key, and archive the old set — this keeps the
  live structure small and makes "last season" a read from snapshots.
- Monitor memory-per-shard and delta-log growth so the hot structure's cost is
  known before it becomes a problem.

## Source

```text
title: Leaderboard
node player: Player [round, icon=browser]
node api: Game API [icon=server]
node score: Score Service [icon=compute]
node zset: Sorted Set [cylinder, icon=cache]
node db: Player DB [cylinder, icon=database]
node rank: Rank Resolver [icon=search]
node snapshot: Snapshots [icon=file]
node notify: Push [icon=message]
node prize: Reward Service [icon=shield]

edge player -> api: submit score
edge api -> score: validate
edge score -> zset: insert
edge zset -> rank: lookup
edge player -> api: view top
edge api -> rank: top N
edge rank -> zset: range
edge score -> db: persist
edge db -> snapshot: dump
edge zset -> notify: rank change
edge notify -> prize: reward
```

## Q&A

### Q: Design a gaming leaderboard service

**A:** Players submit scores through the `Game API`, which validates and hands them to
the `Score Service`.

- The score lands in a `Sorted Set` (e.g., `Redis` `ZADD`) — the ranking data
  structure — and is persisted to the `Player DB` for durability.
- The `Rank Resolver` reads the sorted set for top-N ranges and per-player rank
  lookups; periodic `Snapshots` dump the state for rewards, history, and offline
  computation.
- On rank changes the system pushes `Notify` events and the `Reward Service`
  grants prizes.

The core insight is that an in-memory `Redis` sorted set is a near-perfect fit.

- Leaderboards are hot, read-heavy, and need O(log n) rank operations on a
  single structure.
- The durable DB is the source of truth for history, replay, and accounting.
- This drives a clean read/write split — score writes are small atomic ops on
  `Redis`, while top-N reads are range scans of the same structure, both served
  without table scans.
- The failure mode to guard against is divergence: if `Redis` loses data or
  crashes, the leaderboard must be rebuilt from the `Player DB` and the delta
  log.
- So the design pairs an in-memory primary structure with a durable replay
  source and snapshots, giving low latency on the hot path and a guaranteed
  rebuild path on failure.

Two more considerations shape the design.

- Latency matters because rank reads ride the critical path of the game client —
  the top-N view and "where am I?" render within one request — so the resolver's
  reads must be sub-millisecond and never touch the DB.
- Consistency is bounded, not absolute: a player's score may lag a few seconds
  between game server and display, but the value a player sees must never go
  backward.
- That ordering — `Redis` for speed, DB for durability, snapshots for history —
  is the whole architecture in one sentence.

### Q: How do you store and update scores under concurrency?

**A:** A player's score is a single authoritative number, so updates must be atomic to
avoid lost updates when two matches report at the same time.

- `Redis` sorted sets make this trivial: `ZINCRBY leaderboard score player_id`
  atomically adds to the player's current value, and the `Score Service` just
  forwards validated increments.
- Because increments commute, there is no lost-update race on the primary
  structure.
- Idempotency matters for retries: tag each submission with a `match_id` so a
  retried packet cannot double-increment — `ZINCRBY` is not naturally
  idempotent, so dedupe by `match_id` before applying.

The `Redis` write is the fast path; persistence is asynchronous.

- Batch score deltas to the `Player DB` (or a queue feeding it), and treat that
  delta log as the replay source for a rebuild — so a `Redis` crash loses
  nothing that cannot be reconstructed.
- On the durable side, apply deltas rather than blind overwrites, or use
  last-writer-wins on the final value since intermediate increments commute; the
  durable store converges to the same total as `Redis`.
- The trade-off: keeping `Redis` primary gives the lowest write latency but
  requires a replay mechanism; keeping the DB primary avoids divergence but adds
  a write hop on the hot path.
- The pragmatic answer is `Redis`-primary with a durable delta log and periodic
  reconciliation, so divergence is bounded and detectable rather than silent.

Failure handling for the concurrent path:

- If `Redis` is unavailable, the score service should buffer increments in a
  bounded local queue and replay them on recovery rather than dropping scores —
  a dropped score in a competitive game is a support ticket.
- Make the persistence path idempotent by `match_id` so replays and retries
  never double-apply.
- And because scores are money-adjacent in reward systems, keep an audit trail
  of every `ZINCRBY` delta applied per player, so a reward dispute can be traced
  to the exact matches that produced the score.

### Q: How do you query top N and a players rank fast?

**A:** Both operations are native to a `Redis` sorted set.

- `ZREVRANGE leaderboard 0 N-1` returns the top N in O(log n + m), and
  `ZREVRANK leaderboard player_id` returns a player's rank in O(log n) — no
  table scans and no `ORDER BY` over millions of rows, which is what a SQL
  approach would cost per request.
- The `Rank Resolver` serves these reads directly off `Redis`, with the top-N
  window cached since it changes slowly at the top.
- Cache page 1 (the podium) aggressively with a short TTL, compute deeper pages
  on demand, and write-through the most-viewed pages.

For the durable layer, the `Player DB` stores a score column indexed by
`(score DESC)`.

- Occasional full-history rebuilds and joins stay reasonable, but never route
  interactive rank reads through SQL — a full sort per request would not survive
  traffic.
- Combine with snapshots: hourly snapshots of the sorted set to `Snapshots`
  allow historical queries and make the top-N cache warm on cold start, so the
  first request after a restart does not wait for a full rebuild.
- If a single sorted set outgrows one node, shard by score range or by game and
  serve cross-shard top-N by merging per-shard results — O(shards) reads, which
  stays bounded because shard count is small.

Handle the read hot spots explicitly.

- The top of the leaderboard attracts far more reads than the middle, so cache
  the top-100 in the resolver with a short TTL and serve it without touching
  `Redis`; a player's own rank, by contrast, is nearly unique per user and is
  computed on demand.
- Rate-limit deep page access and pre-compute page snapshots for events such as
  a tournament end, where the whole board is viewed at once.
- This keeps the common case a cache hit and the uncommon case an O(log n)
  `Redis` op.

### Q: How do you handle ties and rank stability?

**A:** Naive scoring by raw value creates ambiguous ties and jumpy ranks — at a global
reset, thousands of players at zero points reorder on every submit.

- Two fixes: tie-breakers and stable rank semantics.
- In `Redis`, make the effective score a composite — for example
  `score * 1e9 + (MAX_TIMESTAMP - completion_time)` — so equal point totals
  order by who finished first, giving deterministic ordering and
  competition-grade ranks.
- This is the common gaming pattern: the player who reached a score earlier
  ranks higher within the tie.

Alternatively, keep the integer score and define rank as _competition rank_.

- `ZREVRANK` counts members strictly ahead, so players with equal scores share
  the same displayed rank (two players at 1000 are both rank 3), and the next
  distinct score starts at 5.
- This is a display-layer decision, but the underlying set still needs a stable
  total order for `ZREVRANGE`.
- The `Notify` service should only fire rank-change events when the _displayed_
  rank changes, otherwise a tie reshuffle spams pushes and churns the reward
  service.
- Trade-offs: composite scores complicate reading raw points (decode score and
  tie-breaker) and break integer compression slightly, while competition ranks
  complicate top-N pagination because ties straddle page boundaries.
- Pick one semantic, apply it consistently, and make tie handling visible in the
  UI so players understand the ordering.

Choose the tie-breaker deliberately and document it.

- Most games want earliest-finish-first among equal scores, which the
  composite-score encoding gives for free; some want most-recent-first (a "hot
  streak" feel), which you get by inverting the timestamp component.
- Decide whether rank stability or absolute ordering matters more: competition
  rank changes only when someone overtakes a displayed position, which is stable
  and intuitive, whereas strict ordering changes on every tie-member update and
  causes rank jitter.
- The right answer is product-dependent — but pick one and make `ZREVRANK` and
  `ZREVRANGE` consistent with it everywhere, including snapshots and history.

### Q: How do you scale to millions of players?

**A:** A single `Redis` sorted set stores millions of members efficiently — a few
hundred MB for typical 64-bit scores — so start single-node before
over-engineering.

- Beyond that, shard: split the leaderboard by region, game mode, or season so
  each set stays small, because most reads are within a shard (a player looks at
  their region, not the whole globe).
- Global views merge per-shard `ZREVRANGE` results at the `Rank Resolver` and
  re-sort the merged window, which bounds per-request work.
- Writes fan out only to the shard keyed by `(leaderboard_id, player_id)`, so no
  shard becomes a global write hotspot.

Separate the hot structure from the durable one.

- `Redis` handles live reads and writes while `Player DB` plus `Snapshots`
  provide durability, history, and analytics — scaling then becomes a matter of
  keeping `Redis` memory bounded and reconciling DB write throughput.
- Write amplification is the real ceiling: millions of players submitting
  frequently means millions of `ZINCRBY`, so batch the async persistence and
  shard the delta log by shard id so backfill and replay stay parallel.
- Consider seasonal leaderboards: archiving each season to snapshots shrinks the
  live set, keeps hot data small, and makes the "new season reset" a cheap
  operation instead of a rewrite of the whole structure.
- The design goal is a hot path that stays sub-millisecond at any player count
  and a rebuild path that completes in minutes, not hours.

Also think about durability and the seasonal lifecycle.

- Because `Redis` is memory and lossy on crash without the delta log, size the
  rebuild budget up front: snapshot frequency should make a rebuild a fast apply
  of deltas since the last snapshot, not a full replay of all time.
- For seasons, treat the transition as a data migration: snapshot the season,
  create a fresh set under a new key, and archive the old set — this keeps the
  live structure small and makes "last season" a read from snapshots.
- Monitor memory-per-shard and delta-log growth so the hot structure's cost is
  known before it becomes a problem.

## Source

```text
title: Leaderboard
node player: Player [round, icon=browser]
node api: Game API [icon=server]
node score: Score Service [icon=compute]
node zset: Sorted Set [cylinder, icon=cache]
node db: Player DB [cylinder, icon=database]
node rank: Rank Resolver [icon=search]
node snapshot: Snapshots [icon=file]
node notify: Push [icon=message]
node prize: Reward Service [icon=shield]

edge player -> api: submit score
edge api -> score: validate
edge score -> zset: insert
edge zset -> rank: lookup
edge player -> api: view top
edge api -> rank: top N
edge rank -> zset: range
edge score -> db: persist
edge db -> snapshot: dump
edge zset -> notify: rank change
edge notify -> prize: reward
```
