# Facebook — Social Network

Design Facebook / a social network

**Difficulty:** Hard

**Tags:** event-driven, graph, notification, photo, social

## Functional Requirements

- Facebook / a social network
- build and traverse a friend graph at scale?
- the news feed (push vs pull fanout)
- recommend friends (friend suggestions)?
- reactions and notifications

## Non-Functional Requirements

- The system is built around a friend graph and a read-heavy feed.

- Clients hit an API gateway for everything; the Post Service persists posts to
  a Posts DB and hands them to a Fanout Worker, which reads friend IDs from the
  Friend Graph and writes a copy of the post into each friend's timeline in the
  Feed Cache.
- The home feed is then a cache read of a per-user timeline — fast and
  consistent with what the fanout produced.

Media uploads take a separate path:

- The client streams to a Media Upload service, which stores bytes in object
  storage and serves them through the CDN, leaving a small URL reference on the
  post.
- Search, notifications, and reactions hang off the same core — the post is the
  center of gravity.

Data models are denormalized for reads:

- Posts keyed by ID with author and timestamp, friendships as an adjacency list,
  and per-user timelines as sorted sets in the cache.

Trade-offs center on fan-out.

- Push (write-time) gives fast reads but floods the writer for celebrities; pull
  (read-time) is cheap to write but slow to read; the real system hybridizes and
  merges the two paths at read time.
- Consistency is eventual — a post appears on a friend's feed asynchronously —
  and ranking, filtering, and spam removal all happen before materialization.

Failure handling means fanout workers retry through queues with idempotent
writes:

- A post pushed twice must appear once, cache misses fall back to rebuilding the
  timeline from the graph, and DB writes are acknowledged before fanout so no
  post is ever lost even if the queue lags.
- Read/write ratios of hundreds to one justify the heavy caching of timelines..
- The friend graph is a large, sparse adjacency list.

- A `friendships` table stores edges as rows — either undirected rows or both
  directions — keyed by the smaller user ID, with metadata like accepted-at
  timestamp.
- For traversals, what matters is that each user's neighbor list is retrievable
  in one hop, so a dedicated graph or graph cache holds per-user adjacency lists
  (e.g., Redis sets) sharded by user ID.

Traversal is breadth-first search with a visited set.

- Friend-of-friend queries (2 hops) — the backbone of suggestions and
  mutual-friend counts — are just set intersections over two adjacency lists;
  deeper queries like "who do my friends know that I don't" run BFS to depth 3
  with pruning.
- The expensive part is fan-out on wide nodes: a celebrity's list of millions
  makes any traversal over it expensive, so those are handled with sparse
  reverse indexes and capped samples.

In production, a system like Facebook's TAO caches objects and associations in a
graph-shaped cache in front of MySQL:

- Reads hit the cache and writes propagate asynchronously.
- The graph API exposes edges (friendships, likes, memberships) as first-class
  objects with pagination, and cache invalidation is delayed and batched rather
  than synchronous.

Scaling means sharding by user ID, keeping neighbor lists small and cached, and
precomputing expensive aggregates (mutual counts) offline.

- Trade-offs: relational tables are flexible and durable but slow for multi-hop
  queries; a graph DB or cache layer trades that for fast adjacency access.
- Consistency is monotonic — you eventually see your new friend and their edges,
  never a partial graph.
- Failure handling degrades suggestions to fewer hops rather than blocking
  reads..
- Push fan-out writes the post into every friend's timeline at publish time, so
  reads are one cache lookup:

- Great for a feed that's read far more than written, and fine for a typical
  user with a few hundred friends.
- The cost is the write amplification on the publisher: each post multiplies
  into N timeline writes, and a celebrity with 100M followers would fan out 100M
  times per post.

Pull reads the friends' recent posts at read time and merges them:

- Cheap for the writer, expensive for the reader, and slow when a user has
  thousands of friends.
- Pull also gives every reader the freshest content with no cache to maintain,
  but the merge cost grows with degree and you need per-friend indexes anyway.

The classic answer is hybrid:

- Push for most users, pull for celebrities and other supernodes whose fan-out
  would overwhelm the writer.
- Each user's timeline is a per-user sorted set (post ID, score =
  timestamp/rank) in the cache; a fan-out worker consumes publish events from a
  queue and batches timeline writes.
- Read-time merge fills gaps — for a celebrity-heavy feed, you pull the
  supernode's recent posts and merge them into the cached timeline.

Ranking and filtering run before materialization:

- Spam and blocked authors are filtered, and a rank score (recency, affinity,
  engagement) decides the order.

Failure handling is a read-time fallback:

- If the cache timeline is missing, the feed is rebuilt from the graph with the
  pull path.
- Eventual consistency is acceptable: a post may lag a friend's feed by seconds,
  but must never be duplicated, so fanout is idempotent..
- Reactions are modeled as rows:

- (user_id, post_id, type, created_at) with a unique constraint on (user_id,
  post_id), so a user's reaction is always a single row — re-reacting updates
  the type in place.
- The schema keeps a full audit of who reacted and when, which also supports
  unfriending and GDPR deletion.

Counts are denormalized onto the post (one counter per reaction type) and
updated asynchronously:

- An aggregator consumes reaction events, applies idempotent deltas, and
  periodically reconciles to the source rows, so transient duplicates never
  inflate counts.
- Reconciliation guards against counter drift from lost events, and unread
  notification counts are similarly materialized per user.
- Hot posts are read on millions of feeds, so the counter service keeps per-post
  counters in cache and flushes deltas in batches.

Notifications start the same way:

- An event (someone reacted, commented, or tagged you) is enqueued and a fan-out
  worker converts it into an inbox entry per recipient.
- The key scaling challenge is write amplification and dedupe: when 200 friends
  like one post, they become a single aggregated notification, so the worker
  groups events by (target, subject) before writing to the recipient's
  notification store.

Delivery respects preference filters (email, push, in-app, mute), and outbound
pushes go through provider queues with exponential-backoff retries and a DLQ.

- Push throttling batches per-app rate limits, and provider outages degrade to
  email fallback rather than dropping events.
- Counters and inboxes both favor eventual consistency over exactness.
- Scaling means sharding by post for reactions and by recipient for
  notifications, and keeping the hot counters in a cache-backed counter service.
- Failure handling leaves counts momentarily stale rather than blocking the
  write path.

## Source

````text
title: Facebook Social Network
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node post: Post Service [icon=compute]
node graph: Friend Graph [icon=users]
node fanout: Fanout Worker [icon=worker]
node feed: News Feed [icon=message]
node upload: Media Upload [icon=file]
node search: Search Service [icon=search]
node notify: Notifications [icon=mail]
node db: Posts DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> post: publish
edge post -> db: persist
edge post -> fanout: push to friends
edge fanout -> graph: friend ids
edge graph -> fanout: friends
edge fanout -> cache: timelines
edge client -> api: home feed
edge api -> feed: build
edge feed -> cache: read
edge client -> api: upload photo
edge api -> upload: store
edge upload -> cdn: serve
edge api -> notify: alerts
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Facebook Social Network
client: Client
cdn: CDN
api: API Gateway
post: Post Service
graph: Friend Graph
fanout: Fanout Worker
feed: News Feed
upload: Media Upload
search: Search Service
notify: Notifications
db: Posts DB
cache: Feed Cache

client ─► api ─► browse
api ─► post ─► publish
post ─► db ─► persist
post ─► fanout ─► push to friends
fanout ─► graph ─► friend ids
graph ─► fanout ─► friends
fanout ─► cache ─► timelines
client ─► api ─► home feed
api ─► feed ─► build
feed ─► cache ─► read
client ─► api ─► upload photo
api ─► upload ─► store
upload ─► cdn ─► serve
api ─► notify ─► alerts
````

## Design

### Design Facebook / a social network

The system is built around a friend graph and a read-heavy feed.

- Clients hit an API gateway for everything; the Post Service persists posts to
  a Posts DB and hands them to a Fanout Worker, which reads friend IDs from the
  Friend Graph and writes a copy of the post into each friend's timeline in the
  Feed Cache.
- The home feed is then a cache read of a per-user timeline — fast and
  consistent with what the fanout produced.

Media uploads take a separate path:

- The client streams to a Media Upload service, which stores bytes in object
  storage and serves them through the CDN, leaving a small URL reference on the
  post.
- Search, notifications, and reactions hang off the same core — the post is the
  center of gravity.

Data models are denormalized for reads:

- Posts keyed by ID with author and timestamp, friendships as an adjacency list,
  and per-user timelines as sorted sets in the cache.

Trade-offs center on fan-out.

- Push (write-time) gives fast reads but floods the writer for celebrities; pull
  (read-time) is cheap to write but slow to read; the real system hybridizes and
  merges the two paths at read time.
- Consistency is eventual — a post appears on a friend's feed asynchronously —
  and ranking, filtering, and spam removal all happen before materialization.

Failure handling means fanout workers retry through queues with idempotent
writes:

- A post pushed twice must appear once, cache misses fall back to rebuilding the
  timeline from the graph, and DB writes are acknowledged before fanout so no
  post is ever lost even if the queue lags.
- Read/write ratios of hundreds to one justify the heavy caching of timelines.

### How do you build and traverse a friend graph at scale?

The friend graph is a large, sparse adjacency list.

- A `friendships` table stores edges as rows — either undirected rows or both
  directions — keyed by the smaller user ID, with metadata like accepted-at
  timestamp.
- For traversals, what matters is that each user's neighbor list is retrievable
  in one hop, so a dedicated graph or graph cache holds per-user adjacency lists
  (e.g., Redis sets) sharded by user ID.

Traversal is breadth-first search with a visited set.

- Friend-of-friend queries (2 hops) — the backbone of suggestions and
  mutual-friend counts — are just set intersections over two adjacency lists;
  deeper queries like "who do my friends know that I don't" run BFS to depth 3
  with pruning.
- The expensive part is fan-out on wide nodes: a celebrity's list of millions
  makes any traversal over it expensive, so those are handled with sparse
  reverse indexes and capped samples.

In production, a system like Facebook's TAO caches objects and associations in a
graph-shaped cache in front of MySQL:

- Reads hit the cache and writes propagate asynchronously.
- The graph API exposes edges (friendships, likes, memberships) as first-class
  objects with pagination, and cache invalidation is delayed and batched rather
  than synchronous.

Scaling means sharding by user ID, keeping neighbor lists small and cached, and
precomputing expensive aggregates (mutual counts) offline.

- Trade-offs: relational tables are flexible and durable but slow for multi-hop
  queries; a graph DB or cache layer trades that for fast adjacency access.
- Consistency is monotonic — you eventually see your new friend and their edges,
  never a partial graph.
- Failure handling degrades suggestions to fewer hops rather than blocking
  reads.

### Design the news feed (push vs pull fanout)

Push fan-out writes the post into every friend's timeline at publish time, so
reads are one cache lookup:

- Great for a feed that's read far more than written, and fine for a typical
  user with a few hundred friends.
- The cost is the write amplification on the publisher: each post multiplies
  into N timeline writes, and a celebrity with 100M followers would fan out 100M
  times per post.

Pull reads the friends' recent posts at read time and merges them:

- Cheap for the writer, expensive for the reader, and slow when a user has
  thousands of friends.
- Pull also gives every reader the freshest content with no cache to maintain,
  but the merge cost grows with degree and you need per-friend indexes anyway.

The classic answer is hybrid:

- Push for most users, pull for celebrities and other supernodes whose fan-out
  would overwhelm the writer.
- Each user's timeline is a per-user sorted set (post ID, score =
  timestamp/rank) in the cache; a fan-out worker consumes publish events from a
  queue and batches timeline writes.
- Read-time merge fills gaps — for a celebrity-heavy feed, you pull the
  supernode's recent posts and merge them into the cached timeline.

Ranking and filtering run before materialization:

- Spam and blocked authors are filtered, and a rank score (recency, affinity,
  engagement) decides the order.

Failure handling is a read-time fallback:

- If the cache timeline is missing, the feed is rebuilt from the graph with the
  pull path.
- Eventual consistency is acceptable: a post may lag a friend's feed by seconds,
  but must never be duplicated, so fanout is idempotent.

### How do you recommend friends (friend suggestions)?

Friend suggestions are mostly a graph problem:

- Friends-of-friends you don't already know, weighted by how many mutual friends
  you share, plus auxiliary signals — same school, workplace, or network,
  imported contacts, and people you interact with.
- The core algorithm is a 2-hop count: for each candidate, count mutual friends
  by intersecting adjacency lists; candidates below a threshold are discarded.

Score a candidate with a blend:

- Mutual-friend count (the strongest signal), shared network memberships, and
  interaction history; optionally a learned ranker over graph embeddings that
  captures "similar networks have similar friends."
- Embeddings let you find structurally similar users even when they share few
  explicit signals.

The heavy lifting runs offline:

- Batch jobs traverse the graph and precompute a top-k list per user — while the
  online path adds fresh signals (a new connection, a new contact sync)
  incrementally.
- Batch processing partitions the graph across workers and runs 2-hop counting
  in map-reduce style, capping work on huge-degree nodes by sampling.
- Because the graph changes constantly, batch jobs recompute on a rolling
  cadence and a reconciliation pass corrects lists that drift from live edges.

Serving is one cache read of the precomputed top-k list, refreshed on a schedule
and invalidated when the user's network changes.

- Trade-offs: precomputation is cheap at read time but stale, and it costs
  storage; privacy settings must suppress candidates from private or blocked
  users.
- Scaling means partitioning the graph across the batch processors and sharding
  the suggestion cache by user.
- Failure handling falls back to a lighter, graph-only candidate set.
- The suggestion surface also carries explainable reasons — "You both know
  Maria" — which come directly from the mutual-friend computation and improve
  accept rates.

### Design reactions and notifications

Reactions are modeled as rows:

- (user_id, post_id, type, created_at) with a unique constraint on (user_id,
  post_id), so a user's reaction is always a single row — re-reacting updates
  the type in place.
- The schema keeps a full audit of who reacted and when, which also supports
  unfriending and GDPR deletion.

Counts are denormalized onto the post (one counter per reaction type) and
updated asynchronously:

- An aggregator consumes reaction events, applies idempotent deltas, and
  periodically reconciles to the source rows, so transient duplicates never
  inflate counts.
- Reconciliation guards against counter drift from lost events, and unread
  notification counts are similarly materialized per user.
- Hot posts are read on millions of feeds, so the counter service keeps per-post
  counters in cache and flushes deltas in batches.

Notifications start the same way:

- An event (someone reacted, commented, or tagged you) is enqueued and a fan-out
  worker converts it into an inbox entry per recipient.
- The key scaling challenge is write amplification and dedupe: when 200 friends
  like one post, they become a single aggregated notification, so the worker
  groups events by (target, subject) before writing to the recipient's
  notification store.

Delivery respects preference filters (email, push, in-app, mute), and outbound
pushes go through provider queues with exponential-backoff retries and a DLQ.

- Push throttling batches per-app rate limits, and provider outages degrade to
  email fallback rather than dropping events.
- Counters and inboxes both favor eventual consistency over exactness.
- Scaling means sharding by post for reactions and by recipient for
  notifications, and keeping the hot counters in a cache-backed counter service.
- Failure handling leaves counts momentarily stale rather than blocking the
  write path.

## Source

```text
title: Facebook Social Network
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node post: Post Service [icon=compute]
node graph: Friend Graph [icon=users]
node fanout: Fanout Worker [icon=worker]
node feed: News Feed [icon=message]
node upload: Media Upload [icon=file]
node search: Search Service [icon=search]
node notify: Notifications [icon=mail]
node db: Posts DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> post: publish
edge post -> db: persist
edge post -> fanout: push to friends
edge fanout -> graph: friend ids
edge graph -> fanout: friends
edge fanout -> cache: timelines
edge client -> api: home feed
edge api -> feed: build
edge feed -> cache: read
edge client -> api: upload photo
edge api -> upload: store
edge upload -> cdn: serve
edge api -> notify: alerts
```

## Q&A

### Q: Design Facebook / a social network

**A:** The system is built around a friend graph and a read-heavy feed.

- Clients hit an API gateway for everything; the Post Service persists posts to
  a Posts DB and hands them to a Fanout Worker, which reads friend IDs from the
  Friend Graph and writes a copy of the post into each friend's timeline in the
  Feed Cache.
- The home feed is then a cache read of a per-user timeline — fast and
  consistent with what the fanout produced.

Media uploads take a separate path:

- The client streams to a Media Upload service, which stores bytes in object
  storage and serves them through the CDN, leaving a small URL reference on the
  post.
- Search, notifications, and reactions hang off the same core — the post is the
  center of gravity.

Data models are denormalized for reads:

- Posts keyed by ID with author and timestamp, friendships as an adjacency list,
  and per-user timelines as sorted sets in the cache.

Trade-offs center on fan-out.

- Push (write-time) gives fast reads but floods the writer for celebrities; pull
  (read-time) is cheap to write but slow to read; the real system hybridizes and
  merges the two paths at read time.
- Consistency is eventual — a post appears on a friend's feed asynchronously —
  and ranking, filtering, and spam removal all happen before materialization.

Failure handling means fanout workers retry through queues with idempotent
writes:

- A post pushed twice must appear once, cache misses fall back to rebuilding the
  timeline from the graph, and DB writes are acknowledged before fanout so no
  post is ever lost even if the queue lags.
- Read/write ratios of hundreds to one justify the heavy caching of timelines.

### Q: How do you build and traverse a friend graph at scale?

**A:** The friend graph is a large, sparse adjacency list.

- A `friendships` table stores edges as rows — either undirected rows or both
  directions — keyed by the smaller user ID, with metadata like accepted-at
  timestamp.
- For traversals, what matters is that each user's neighbor list is retrievable
  in one hop, so a dedicated graph or graph cache holds per-user adjacency lists
  (e.g., Redis sets) sharded by user ID.

Traversal is breadth-first search with a visited set.

- Friend-of-friend queries (2 hops) — the backbone of suggestions and
  mutual-friend counts — are just set intersections over two adjacency lists;
  deeper queries like "who do my friends know that I don't" run BFS to depth 3
  with pruning.
- The expensive part is fan-out on wide nodes: a celebrity's list of millions
  makes any traversal over it expensive, so those are handled with sparse
  reverse indexes and capped samples.

In production, a system like Facebook's TAO caches objects and associations in a
graph-shaped cache in front of MySQL:

- Reads hit the cache and writes propagate asynchronously.
- The graph API exposes edges (friendships, likes, memberships) as first-class
  objects with pagination, and cache invalidation is delayed and batched rather
  than synchronous.

Scaling means sharding by user ID, keeping neighbor lists small and cached, and
precomputing expensive aggregates (mutual counts) offline.

- Trade-offs: relational tables are flexible and durable but slow for multi-hop
  queries; a graph DB or cache layer trades that for fast adjacency access.
- Consistency is monotonic — you eventually see your new friend and their edges,
  never a partial graph.
- Failure handling degrades suggestions to fewer hops rather than blocking
  reads.

### Q: Design the news feed (push vs pull fanout)

**A:** Push fan-out writes the post into every friend's timeline at publish time, so
reads are one cache lookup:

- Great for a feed that's read far more than written, and fine for a typical
  user with a few hundred friends.
- The cost is the write amplification on the publisher: each post multiplies
  into N timeline writes, and a celebrity with 100M followers would fan out 100M
  times per post.

Pull reads the friends' recent posts at read time and merges them:

- Cheap for the writer, expensive for the reader, and slow when a user has
  thousands of friends.
- Pull also gives every reader the freshest content with no cache to maintain,
  but the merge cost grows with degree and you need per-friend indexes anyway.

The classic answer is hybrid:

- Push for most users, pull for celebrities and other supernodes whose fan-out
  would overwhelm the writer.
- Each user's timeline is a per-user sorted set (post ID, score =
  timestamp/rank) in the cache; a fan-out worker consumes publish events from a
  queue and batches timeline writes.
- Read-time merge fills gaps — for a celebrity-heavy feed, you pull the
  supernode's recent posts and merge them into the cached timeline.

Ranking and filtering run before materialization:

- Spam and blocked authors are filtered, and a rank score (recency, affinity,
  engagement) decides the order.

Failure handling is a read-time fallback:

- If the cache timeline is missing, the feed is rebuilt from the graph with the
  pull path.
- Eventual consistency is acceptable: a post may lag a friend's feed by seconds,
  but must never be duplicated, so fanout is idempotent.

### Q: How do you recommend friends (friend suggestions)?

**A:** Friend suggestions are mostly a graph problem:

- Friends-of-friends you don't already know, weighted by how many mutual friends
  you share, plus auxiliary signals — same school, workplace, or network,
  imported contacts, and people you interact with.
- The core algorithm is a 2-hop count: for each candidate, count mutual friends
  by intersecting adjacency lists; candidates below a threshold are discarded.

Score a candidate with a blend:

- Mutual-friend count (the strongest signal), shared network memberships, and
  interaction history; optionally a learned ranker over graph embeddings that
  captures "similar networks have similar friends."
- Embeddings let you find structurally similar users even when they share few
  explicit signals.

The heavy lifting runs offline:

- Batch jobs traverse the graph and precompute a top-k list per user — while the
  online path adds fresh signals (a new connection, a new contact sync)
  incrementally.
- Batch processing partitions the graph across workers and runs 2-hop counting
  in map-reduce style, capping work on huge-degree nodes by sampling.
- Because the graph changes constantly, batch jobs recompute on a rolling
  cadence and a reconciliation pass corrects lists that drift from live edges.

Serving is one cache read of the precomputed top-k list, refreshed on a schedule
and invalidated when the user's network changes.

- Trade-offs: precomputation is cheap at read time but stale, and it costs
  storage; privacy settings must suppress candidates from private or blocked
  users.
- Scaling means partitioning the graph across the batch processors and sharding
  the suggestion cache by user.
- Failure handling falls back to a lighter, graph-only candidate set.
- The suggestion surface also carries explainable reasons — "You both know
  Maria" — which come directly from the mutual-friend computation and improve
  accept rates.

### Q: Design reactions and notifications

**A:** Reactions are modeled as rows:

- (user_id, post_id, type, created_at) with a unique constraint on (user_id,
  post_id), so a user's reaction is always a single row — re-reacting updates
  the type in place.
- The schema keeps a full audit of who reacted and when, which also supports
  unfriending and GDPR deletion.

Counts are denormalized onto the post (one counter per reaction type) and
updated asynchronously:

- An aggregator consumes reaction events, applies idempotent deltas, and
  periodically reconciles to the source rows, so transient duplicates never
  inflate counts.
- Reconciliation guards against counter drift from lost events, and unread
  notification counts are similarly materialized per user.
- Hot posts are read on millions of feeds, so the counter service keeps per-post
  counters in cache and flushes deltas in batches.

Notifications start the same way:

- An event (someone reacted, commented, or tagged you) is enqueued and a fan-out
  worker converts it into an inbox entry per recipient.
- The key scaling challenge is write amplification and dedupe: when 200 friends
  like one post, they become a single aggregated notification, so the worker
  groups events by (target, subject) before writing to the recipient's
  notification store.

Delivery respects preference filters (email, push, in-app, mute), and outbound
pushes go through provider queues with exponential-backoff retries and a DLQ.

- Push throttling batches per-app rate limits, and provider outages degrade to
  email fallback rather than dropping events.
- Counters and inboxes both favor eventual consistency over exactness.
- Scaling means sharding by post for reactions and by recipient for
  notifications, and keeping the hot counters in a cache-backed counter service.
- Failure handling leaves counts momentarily stale rather than blocking the
  write path.

## Source

```text
title: Facebook Social Network
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node post: Post Service [icon=compute]
node graph: Friend Graph [icon=users]
node fanout: Fanout Worker [icon=worker]
node feed: News Feed [icon=message]
node upload: Media Upload [icon=file]
node search: Search Service [icon=search]
node notify: Notifications [icon=mail]
node db: Posts DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> post: publish
edge post -> db: persist
edge post -> fanout: push to friends
edge fanout -> graph: friend ids
edge graph -> fanout: friends
edge fanout -> cache: timelines
edge client -> api: home feed
edge api -> feed: build
edge feed -> cache: read
edge client -> api: upload photo
edge api -> upload: store
edge upload -> cdn: serve
edge api -> notify: alerts
```
