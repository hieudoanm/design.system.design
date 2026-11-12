# Reddit — Community Forum

Design Reddit / a community forum

**Difficulty:** Medium

**Tags:** social, voting

## Functional Requirements

- Reddit / a community forum
- model subreddits and posts?
- rank content (hot / top / new)?
- the comment tree at scale
- detect vote fraud and spam?

## Non-Functional Requirements

- Reddit is a collection of subreddits — per-topic communities — each hosting
  posts that accrue votes and threaded comments.

- The API gateway fronts the read-heavy workload (browse, list posts, render
  comment threads) and the write path (submit, vote, comment).
- The Post Service persists submissions to Posts DB and streams new posts to the
  Ranking Worker and Search Service.
- Votes arrive as a firehose of small writes sharded by post id; the Ranking
  Worker periodically consumes vote deltas and recomputes each post's score,
  writing the top-N into the Hot Cache that the browse path reads.
- Comments are stored adjacent to their parent post for cheap tree assembly, and
  the Moderation Service screens new submissions against spam heuristics before
  they go fully live.

Scale is dominated by reads: the front page and each subreddit's sorted list are
precomputed, cached lists refreshed every few minutes, so a single request is a
cache hit, not a DB scan.

- Writes — votes above all — are appended to a durable log and aggregated
  asynchronously rather than applied eagerly to the hot path.
- Availability matters more than strict consistency here: a slightly stale hot
  list is acceptable, so the system uses async reconciliation instead of
  transactions.
- Rough estimates: millions of browse requests per minute, tens of thousands of
  vote writes per second during spikes, and comment volume an order of magnitude
  below that..
- a Wilson
  lower bound) so a 2-vote answer cannot outrank a 1000-vote one.

- Comment votes batch through the same delta pipeline as post votes.
- Persistence: shard the comment table by `post_id` (hash of post id) so a whole
  thread lives on one shard and tree queries stay local; subtree collapse
  metadata (which replies are hidden) lives in cache, not the DB.
- Failure handling: a thread render falls back to the shard's index with a
  recursive CTE when the cache is cold, trading latency for correctness during
  cache storms..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Reddit Community
client: Client
api: API Gateway
subreddit: Subreddits
post: Post Service
vote: Votes
rank: Ranking Worker
comment: Comments
search: Search Service
mod: Moderation
db: Posts DB
cache: Hot Cache

client ─► api ─► browse
api ─► subreddit ─► list posts
subreddit ─► db ─► read
client ─► api ─► submit
api ─► post ─► publish
post ─► db ─► persist
client ─► api ─► vote
api ─► vote ─► record
vote ─► rank ─► score
rank ─► cache ─► hot list
api ─► comment ─► reply
api ─► search ─► index
api ─► mod ─► review
```

## Design

### Design Reddit / a community forum

Reddit is a collection of subreddits — per-topic communities — each hosting
posts that accrue votes and threaded comments.

- The API gateway fronts the read-heavy workload (browse, list posts, render
  comment threads) and the write path (submit, vote, comment).
- The Post Service persists submissions to Posts DB and streams new posts to the
  Ranking Worker and Search Service.
- Votes arrive as a firehose of small writes sharded by post id; the Ranking
  Worker periodically consumes vote deltas and recomputes each post's score,
  writing the top-N into the Hot Cache that the browse path reads.
- Comments are stored adjacent to their parent post for cheap tree assembly, and
  the Moderation Service screens new submissions against spam heuristics before
  they go fully live.

Scale is dominated by reads: the front page and each subreddit's sorted list are
precomputed, cached lists refreshed every few minutes, so a single request is a
cache hit, not a DB scan.

- Writes — votes above all — are appended to a durable log and aggregated
  asynchronously rather than applied eagerly to the hot path.
- Availability matters more than strict consistency here: a slightly stale hot
  list is acceptable, so the system uses async reconciliation instead of
  transactions.
- Rough estimates: millions of browse requests per minute, tens of thousands of
  vote writes per second during spikes, and comment volume an order of magnitude
  below that.

### How do you model subreddits and posts?

Subreddits are lightweight entities in their own table (id, slug, title,
privacy/NSFW flags, moderator set), so every post carries a `subreddit_id`
foreign key and moderation/membership data is read as a separate lookup.

- Posts are the large table: id, author_id, subreddit_id, kind
  (link/text/image/video), title, body, created_at, and denormalized `score` /
  `hot_score` columns that the ranking worker updates in batches rather than on
  every vote.
- The hot listing path uses a secondary index on `(subreddit_id, created_at)`
  for pagination and cache rebuilds, while the live list is served from a
  per-subreddit sorted set in Redis.

Because post bodies can be large, the table is vertically split: a slim OLTP row
for ids, score, and timestamps, and full text plus rendered HTML in object
storage or a columnar store.

- Comments form a tree referencing `post_id` and `parent_id`, with a
  materialized path (an ancestor-id array or `ltree`-style string) so "all
  descendants of X" is a prefix scan, not a recursive CTE.
- Trending needs rolling aggregates of vote deltas, so per-post counters of
  time-bucketed up/down deltas live in Redis or a time-series store, letting the
  ranker recompute scores without scanning the full vote table.

### How do you rank content (hot / top / new)?

"New" is trivially `created_at DESC` served from the secondary index; "Top" is
cumulative score over a configurable window — a rolling aggregation of up/down
vote deltas by time bucket.

- "Hot" is the classic Reddit formula: the score grows logarithmically with
  votes and decays with age, e.g. a `sign * log10(|score|)` term divided by an
  age penalty that grows with hours since submission, tuned so a fresh post with
  a modest vote count can outrank an old one with many.
- The key architectural insight is that these lists are precomputed, not
  computed per request: the Ranking Worker drains vote deltas from a queue every
  few minutes, recomputes hot/top for affected posts, and writes the sorted
  top-N into the Hot Cache.

Per-subreddit lists and the global front page are separate cache keys
(`hot:subreddit:{id}`, `hot:global`); pagination uses cursor offsets over the
cached list so users don't observe recompute churn mid-scroll.

- Trade-offs: precomputation introduces staleness — a post can reach the front
  page minutes after a vote burst — but it keeps the read path at pure cache
  speed and makes vote manipulation slower to distort ranking.
- Small/new subreddits fall back to a direct DB query over the
  `(subreddit_id, created_at)` index until their cached list warms up.

### Design the comment tree at scale

Comments are append-heavy and read-heavy per post; a single popular post can
accumulate tens of thousands of replies.

- Model them as a self-referencing table: (id, post_id, parent_id, author_id,
  body, created_at, score).
- To render a full thread without recursive queries, store a materialized path —
  an array of ancestor ids or an `ltree`-style string — so subtree retrieval is
  a single prefix scan.
- Popular post pages serialize the whole comment tree into a versioned cache
  entry, invalidated by new comments or vote updates, so the first render is a
  cache hit and "load more" fetches collapsed subtrees lazily.

Sort modes (best, top, new, controversial) are per-node scores recomputed by the
worker; the default "best" applies a confidence-style correction (e.g. a Wilson
lower bound) so a 2-vote answer cannot outrank a 1000-vote one.

- Comment votes batch through the same delta pipeline as post votes.
- Persistence: shard the comment table by `post_id` (hash of post id) so a whole
  thread lives on one shard and tree queries stay local; subtree collapse
  metadata (which replies are hidden) lives in cache, not the DB.
- Failure handling: a thread render falls back to the shard's index with a
  recursive CTE when the cache is cold, trading latency for correctness during
  cache storms.

### How do you detect vote fraud and spam?

Vote fraud: every user–post vote is recorded idempotently with a unique
`(user_id, post_id)` key and rate-limited per user. The Vote Service appends to
a durable log; a fraud worker correlates signals — same IP/device cluster voting
in lockstep, sudden vote spikes from newly created accounts, instant votes right
after account creation, and per-user voting velocity — using per-account and
per-post aggregate counters in Redis. Suspicious votes are queued for review
instead of being applied to scores immediately, so a coordinated burst cannot
distort the hot ranking before it is inspected.

Spam: the Moderation Service runs heuristics on submissions — URL blacklists,
near-duplicate content detection via SimHash-style fingerprints, known-bad
account lists, and text features — then escalates borderline cases to human
moderators who can remove, ban, or set subreddit rules. Both systems share a
feedback loop: confirmed bans retrain the models, and votes on removed posts are
rescinded by the Ranking Worker. Trade-offs: aggressive filtering reduces spam
but risks false positives and user churn, so most filters emit a review queue
rather than hard deletion; the whole pipeline is async, meaning a post is
visible immediately but its score is only trusted after the fraud check settles.

## Source

```text
title: Reddit Community
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node subreddit: Subreddits [icon=message]
node post: Post Service [icon=compute]
node vote: Votes [icon=sync]
node rank: Ranking Worker [icon=worker]
node comment: Comments [icon=message]
node search: Search Service [icon=search]
node mod: Moderation [icon=shield]
node db: Posts DB [cylinder, icon=database]
node cache: Hot Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> subreddit: list posts
edge subreddit -> db: read
edge client -> api: submit
edge api -> post: publish
edge post -> db: persist
edge client -> api: vote
edge api -> vote: record
edge vote -> rank: score
edge rank -> cache: hot list
edge api -> comment: reply
edge api -> search: index
edge api -> mod: review
```

## Q&A

### Q: Design Reddit / a community forum

**A:** Reddit is a collection of subreddits — per-topic communities — each hosting
posts that accrue votes and threaded comments.

- The API gateway fronts the read-heavy workload (browse, list posts, render
  comment threads) and the write path (submit, vote, comment).
- The Post Service persists submissions to Posts DB and streams new posts to the
  Ranking Worker and Search Service.
- Votes arrive as a firehose of small writes sharded by post id; the Ranking
  Worker periodically consumes vote deltas and recomputes each post's score,
  writing the top-N into the Hot Cache that the browse path reads.
- Comments are stored adjacent to their parent post for cheap tree assembly, and
  the Moderation Service screens new submissions against spam heuristics before
  they go fully live.

Scale is dominated by reads: the front page and each subreddit's sorted list are
precomputed, cached lists refreshed every few minutes, so a single request is a
cache hit, not a DB scan.

- Writes — votes above all — are appended to a durable log and aggregated
  asynchronously rather than applied eagerly to the hot path.
- Availability matters more than strict consistency here: a slightly stale hot
  list is acceptable, so the system uses async reconciliation instead of
  transactions.
- Rough estimates: millions of browse requests per minute, tens of thousands of
  vote writes per second during spikes, and comment volume an order of magnitude
  below that.

### Q: How do you model subreddits and posts?

**A:** Subreddits are lightweight entities in their own table (id, slug, title,
privacy/NSFW flags, moderator set), so every post carries a `subreddit_id`
foreign key and moderation/membership data is read as a separate lookup.

- Posts are the large table: id, author_id, subreddit_id, kind
  (link/text/image/video), title, body, created_at, and denormalized `score` /
  `hot_score` columns that the ranking worker updates in batches rather than on
  every vote.
- The hot listing path uses a secondary index on `(subreddit_id, created_at)`
  for pagination and cache rebuilds, while the live list is served from a
  per-subreddit sorted set in Redis.

Because post bodies can be large, the table is vertically split: a slim OLTP row
for ids, score, and timestamps, and full text plus rendered HTML in object
storage or a columnar store.

- Comments form a tree referencing `post_id` and `parent_id`, with a
  materialized path (an ancestor-id array or `ltree`-style string) so "all
  descendants of X" is a prefix scan, not a recursive CTE.
- Trending needs rolling aggregates of vote deltas, so per-post counters of
  time-bucketed up/down deltas live in Redis or a time-series store, letting the
  ranker recompute scores without scanning the full vote table.

### Q: How do you rank content (hot / top / new)?

**A:** "New" is trivially `created_at DESC` served from the secondary index; "Top" is
cumulative score over a configurable window — a rolling aggregation of up/down
vote deltas by time bucket.

- "Hot" is the classic Reddit formula: the score grows logarithmically with
  votes and decays with age, e.g. a `sign * log10(|score|)` term divided by an
  age penalty that grows with hours since submission, tuned so a fresh post with
  a modest vote count can outrank an old one with many.
- The key architectural insight is that these lists are precomputed, not
  computed per request: the Ranking Worker drains vote deltas from a queue every
  few minutes, recomputes hot/top for affected posts, and writes the sorted
  top-N into the Hot Cache.

Per-subreddit lists and the global front page are separate cache keys
(`hot:subreddit:{id}`, `hot:global`); pagination uses cursor offsets over the
cached list so users don't observe recompute churn mid-scroll.

- Trade-offs: precomputation introduces staleness — a post can reach the front
  page minutes after a vote burst — but it keeps the read path at pure cache
  speed and makes vote manipulation slower to distort ranking.
- Small/new subreddits fall back to a direct DB query over the
  `(subreddit_id, created_at)` index until their cached list warms up.

### Q: Design the comment tree at scale

**A:** Comments are append-heavy and read-heavy per post; a single popular post can
accumulate tens of thousands of replies.

- Model them as a self-referencing table: (id, post_id, parent_id, author_id,
  body, created_at, score).
- To render a full thread without recursive queries, store a materialized path —
  an array of ancestor ids or an `ltree`-style string — so subtree retrieval is
  a single prefix scan.
- Popular post pages serialize the whole comment tree into a versioned cache
  entry, invalidated by new comments or vote updates, so the first render is a
  cache hit and "load more" fetches collapsed subtrees lazily.

Sort modes (best, top, new, controversial) are per-node scores recomputed by the
worker; the default "best" applies a confidence-style correction (e.g. a Wilson
lower bound) so a 2-vote answer cannot outrank a 1000-vote one.

- Comment votes batch through the same delta pipeline as post votes.
- Persistence: shard the comment table by `post_id` (hash of post id) so a whole
  thread lives on one shard and tree queries stay local; subtree collapse
  metadata (which replies are hidden) lives in cache, not the DB.
- Failure handling: a thread render falls back to the shard's index with a
  recursive CTE when the cache is cold, trading latency for correctness during
  cache storms.

### Q: How do you detect vote fraud and spam?

**A:** Vote fraud: every user–post vote is recorded idempotently with a unique
`(user_id, post_id)` key and rate-limited per user. The Vote Service appends to
a durable log; a fraud worker correlates signals — same IP/device cluster voting
in lockstep, sudden vote spikes from newly created accounts, instant votes right
after account creation, and per-user voting velocity — using per-account and
per-post aggregate counters in Redis. Suspicious votes are queued for review
instead of being applied to scores immediately, so a coordinated burst cannot
distort the hot ranking before it is inspected.

Spam: the Moderation Service runs heuristics on submissions — URL blacklists,
near-duplicate content detection via SimHash-style fingerprints, known-bad
account lists, and text features — then escalates borderline cases to human
moderators who can remove, ban, or set subreddit rules. Both systems share a
feedback loop: confirmed bans retrain the models, and votes on removed posts are
rescinded by the Ranking Worker. Trade-offs: aggressive filtering reduces spam
but risks false positives and user churn, so most filters emit a review queue
rather than hard deletion; the whole pipeline is async, meaning a post is
visible immediately but its score is only trusted after the fraud check settles.

## Source

```text
title: Reddit Community
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node subreddit: Subreddits [icon=message]
node post: Post Service [icon=compute]
node vote: Votes [icon=sync]
node rank: Ranking Worker [icon=worker]
node comment: Comments [icon=message]
node search: Search Service [icon=search]
node mod: Moderation [icon=shield]
node db: Posts DB [cylinder, icon=database]
node cache: Hot Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> subreddit: list posts
edge subreddit -> db: read
edge client -> api: submit
edge api -> post: publish
edge post -> db: persist
edge client -> api: vote
edge api -> vote: record
edge vote -> rank: score
edge rank -> cache: hot list
edge api -> comment: reply
edge api -> search: index
edge api -> mod: review
```
