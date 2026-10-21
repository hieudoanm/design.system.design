# LinkedIn — Professional Network

Design LinkedIn / a professional network

**Difficulty:** Medium

**Tags:** graph, scheduling, search, social

## Functional Requirements

- LinkedIn / a professional network
- model a connection graph and degrees of separation?
- the professional feed and relevance ranking
- design job search and matching?
- scale profile and connection requests?

## Non-Functional Requirements

- LinkedIn is a professional graph with a feed and search on top.

- Clients hit an API gateway; the Profile Service serves member profiles from a
  Profiles DB through a cache, the Connections service handles requests and edge
  mutations on the Connection Graph, and the Feed Service builds the feed from
  the member's network.
- Job Search runs against a Search Index, and Notifications closes the loop on
  connection requests, mentions, and job alerts.

The core data model is an undirected graph of members where an edge is a
confirmed connection.

- `members` (profile, work history, education, skills), `connections` (member_a,
  member_b, since), `requests` in a pending state, and `posts` plus
  `endorsements` (a skill endorsed by a connection).
- Degrees of separation — 1st, 2nd, 3rd — are derived from this graph and are
  the vocabulary LinkedIn uses to show relevance.
- The graph is also the source of truth for visibility — what a member can see
  is filtered by connection tier and privacy settings.

Trade-offs follow from the read-heavy profile surface and the write-heavy
connection graph.

- Profile reads are cached aggressively and served partly from the CDN; graph
  mutations are rare but must be idempotent and rate-limited to stop request
  spam.
- Feed and job services are downstream consumers of the graph and must tolerate
  stale edges.

Consistency is eventually consistent for feeds and suggestion counts, while the
connection edge itself must be strongly consistent to prevent duplicate or
contradictory requests.

- Failure handling routes around graph cache misses by falling back to the
  durable store, and notification delivery retries through queues.
- Monitoring tracks graph read latency and request-accept throughput..
- Connections form a large, sparse undirected graph.

- Store it as an adjacency list: a `connections` table with rows for each pair
  (ordered by member ID to dedupe), plus per-member neighbor lists kept in a
  graph cache.
- Each member's degree is the size of their list, and 1st-degree is a direct
  lookup; the interesting queries are 2nd and 3rd degree.

Degrees of separation are computed by breadth-first search to a depth cap
(LinkedIn's limit is 3rd).

- The 2nd-degree query is the common one — friends-of-friends you're not
  connected to — and it's a set union/intersection over adjacency lists, which
  is exactly the "People you may know" computation.
- In a dedicated graph store you keep cached lists per node; in SQL you'd shard
  by member and join at most two levels to bound cost.

Because BFS fans out multiplicatively (a member with 500 connections produces up
to 250k 2nd-degree pairs), the expensive computations are precomputed in batch
graph jobs.

- 2nd-degree neighbor counts are computed offline and cached, so interactive
  "degree of separation" UI is a lookup, not a live BFS.
- Degree-1 and degree-2 caches are invalidated only when an edge is added or
  removed.

Scaling means partitioning the graph across batch processors by member hash, and
sharding the adjacency cache by member ID.

- Trade-offs: exact BFS to depth 3 on every request is too expensive at scale,
  so you cap depth, cache results, and accept staleness measured in minutes.
- Failure handling degrades to fewer hops or cached snapshots rather than
  blocking the request..
- Job search is a classic inverted index over postings.

- Title, skills, seniority, location, company, industry — supporting filters and
  faceted aggregation; geo is represented as a location hierarchy
  (city/region/country) plus radius search for "jobs near me".
- The index is sharded by document range, and hot queries (popular searches, big
  employers) are cached.

Each posting is tokenized into terms with field weights.

- Queries combine a text clause with structured filters (location, seniority,
  remote flag), and the index returns candidate document IDs that satisfy both.
- Query rewriting expands synonyms and normalizes titles, so "SWE" and "software
  engineer" hit the same documents.
- Faceted counts come from per-shard aggregations merged at query time, and
  location uses a grid to bucket postings for radius searches.

Matching is where LinkedIn differentiates.

- It parses the member's profile into a query — skills from a taxonomy, job
  titles, years of experience, location — and scores candidates with BM25 plus
  semantic embeddings of the job description and profile.
- Signals like "members with similar profiles applied to this job" give
  collaborative lift.
- "Recommended for you" personalizes by combining the profile query with viewing
  and application behavior.

Trade-offs:

- BM25 is fast but keyword-bound, embeddings capture meaning but need model
  serving and add latency, so you blend both and A/B test.
- Freshness matters — closed or filled jobs must drop from results quickly.
- Scaling means sharded search clusters with replication for read-heavy query
  load, facet caches, and query logging that feeds ranking.
- Recruiter-side dashboards reuse the same index with different filtering.
- Failure handling degrades to keyword-only search..
- Profile reads dominate traffic — every browse, every feed, every connection page
  reads profiles.

- The Profile Service serves from a cache (with the CDN for public profiles) and
  invalidates on update; reads are O(1) cache lookups, and the DB absorbs only
  cache misses.
- Popular profiles (celebrities, executives) are pinned in cache, and hot reads
  never reach the DB.
- Cache TTLs bound staleness, and a profile update invalidates only the changed
  member's entry, not a whole tier.

Connection requests are a write path with a state machine: request → pending →
accepted/ignored.

- The `requests` store enforces uniqueness per (from, to) so a duplicate request
  is idempotent, and rate limiting caps how many requests one member can send
  per day to prevent spam.
- On accept, a batch job creates the graph edge, notifies both sides, and
  updates suggestion counts.

Scaling the write side means sharding requests by target member (the hot side of
the write — one target may receive thousands of requests) and by sender for rate
limiting.

- Queue the notification and feed fan-out, and batch graph-edge writes so a
  burst of accepts doesn't hammer the graph store.

The trade-off is strong consistency on the request/edge (must not double-
connect) versus eventual consistency everywhere downstream, like suggestion
counts and feed visibility.

- Failure handling retries the fan-out through queues with a DLQ and lets
  profile reads continue during a graph outage because they don't depend on it.
- Monitoring tracks request latency, accept rates, and cache hit ratios.
- Alerted-on spikes in connection requests trigger rate-limit tightening.

## Source

````text
title: LinkedIn Professional Network
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node graph: Connection Graph [icon=users]
node profile: Profile Service [icon=search]
node connection: Connections [icon=sync]
node feed: Feed Service [icon=message]
node job: Job Service [icon=compute]
node search: Search Index [icon=search]
node notify: Notifications [icon=mail]
node db: Profiles DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> profile: view
edge profile -> db: read
edge api -> connection: request
edge connection -> graph: update
edge graph -> profile: connections
edge client -> api: feed
edge api -> feed: build
edge feed -> graph: network
edge api -> job: search
edge job -> search: query
edge api -> notify: alerts
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: LinkedIn Professional Network
client: Client
api: API Gateway
graph: Connection Graph
profile: Profile Service
connection: Connections
feed: Feed Service
job: Job Service
search: Search Index
notify: Notifications
db: Profiles DB
cache: Feed Cache

client ─► api ─► browse
api ─► profile ─► view
profile ─► db ─► read
api ─► connection ─► request
connection ─► graph ─► update
graph ─► profile ─► connections
client ─► api ─► feed
api ─► feed ─► build
feed ─► graph ─► network
api ─► job ─► search
job ─► search ─► query
api ─► notify ─► alerts
````

## Design

### Design LinkedIn / a professional network

LinkedIn is a professional graph with a feed and search on top.

- Clients hit an API gateway; the Profile Service serves member profiles from a
  Profiles DB through a cache, the Connections service handles requests and edge
  mutations on the Connection Graph, and the Feed Service builds the feed from
  the member's network.
- Job Search runs against a Search Index, and Notifications closes the loop on
  connection requests, mentions, and job alerts.

The core data model is an undirected graph of members where an edge is a
confirmed connection.

- `members` (profile, work history, education, skills), `connections` (member_a,
  member_b, since), `requests` in a pending state, and `posts` plus
  `endorsements` (a skill endorsed by a connection).
- Degrees of separation — 1st, 2nd, 3rd — are derived from this graph and are
  the vocabulary LinkedIn uses to show relevance.
- The graph is also the source of truth for visibility — what a member can see
  is filtered by connection tier and privacy settings.

Trade-offs follow from the read-heavy profile surface and the write-heavy
connection graph.

- Profile reads are cached aggressively and served partly from the CDN; graph
  mutations are rare but must be idempotent and rate-limited to stop request
  spam.
- Feed and job services are downstream consumers of the graph and must tolerate
  stale edges.

Consistency is eventually consistent for feeds and suggestion counts, while the
connection edge itself must be strongly consistent to prevent duplicate or
contradictory requests.

- Failure handling routes around graph cache misses by falling back to the
  durable store, and notification delivery retries through queues.
- Monitoring tracks graph read latency and request-accept throughput.

### How do you model a connection graph and degrees of separation?

Connections form a large, sparse undirected graph.

- Store it as an adjacency list: a `connections` table with rows for each pair
  (ordered by member ID to dedupe), plus per-member neighbor lists kept in a
  graph cache.
- Each member's degree is the size of their list, and 1st-degree is a direct
  lookup; the interesting queries are 2nd and 3rd degree.

Degrees of separation are computed by breadth-first search to a depth cap
(LinkedIn's limit is 3rd).

- The 2nd-degree query is the common one — friends-of-friends you're not
  connected to — and it's a set union/intersection over adjacency lists, which
  is exactly the "People you may know" computation.
- In a dedicated graph store you keep cached lists per node; in SQL you'd shard
  by member and join at most two levels to bound cost.

Because BFS fans out multiplicatively (a member with 500 connections produces up
to 250k 2nd-degree pairs), the expensive computations are precomputed in batch
graph jobs.

- 2nd-degree neighbor counts are computed offline and cached, so interactive
  "degree of separation" UI is a lookup, not a live BFS.
- Degree-1 and degree-2 caches are invalidated only when an edge is added or
  removed.

Scaling means partitioning the graph across batch processors by member hash, and
sharding the adjacency cache by member ID.

- Trade-offs: exact BFS to depth 3 on every request is too expensive at scale,
  so you cap depth, cache results, and accept staleness measured in minutes.
- Failure handling degrades to fewer hops or cached snapshots rather than
  blocking the request.

### Design the professional feed and relevance ranking

The feed shows posts, shares, job changes, and profile updates from your network
— LinkedIn's graph is sparse and low-frequency compared to Facebook, so fan-out
is cheaper, but the professional signal is what matters.

- Hybrid fan-out still applies: push to the network on publish, pull from a
  small set of followed influencers.
- Timelines live in a per-member Feed Cache; a fanout-style worker writes copies
  on publish.
- Feed items are deduped across the push and pull paths using the post ID, and
  muted or blocked authors are filtered before materialization.

Relevance ranking weighs both engagement and professional fit.

- Affinity with the author (how often you interact, mutual connections), content
  type (job changes and long-form posts rank differently than likes), freshness,
  and topical relevance from embeddings of the member's industry, skills, and
  content.
- Embeddings let the system rank a post about data engineering for a data
  engineer even with no direct interaction.

A two-stage pipeline — candidate generation from the network and followed
subjects, then a learned ranker — decides order, with diversity and spam filters
applied before ranking.

- Ranking features come from a feature store: author affinity, engagement rate,
  freshness decay, content type, and the signal strength of the poster's own
  network.

Trade-offs are cold start and privacy.

- A new member has no engagement history, so candidates come from network and
  industry.
- A member's activity is visible to network tiers and public connections only as
  configured.
- Scaling is timeline-cache reads with a merge fallback when the cache misses.
- Failure handling falls back to recency ordering if the ranker is degraded.

### How do you design job search and matching?

Job search is a classic inverted index over postings.

- Title, skills, seniority, location, company, industry — supporting filters and
  faceted aggregation; geo is represented as a location hierarchy
  (city/region/country) plus radius search for "jobs near me".
- The index is sharded by document range, and hot queries (popular searches, big
  employers) are cached.

Each posting is tokenized into terms with field weights.

- Queries combine a text clause with structured filters (location, seniority,
  remote flag), and the index returns candidate document IDs that satisfy both.
- Query rewriting expands synonyms and normalizes titles, so "SWE" and "software
  engineer" hit the same documents.
- Faceted counts come from per-shard aggregations merged at query time, and
  location uses a grid to bucket postings for radius searches.

Matching is where LinkedIn differentiates.

- It parses the member's profile into a query — skills from a taxonomy, job
  titles, years of experience, location — and scores candidates with BM25 plus
  semantic embeddings of the job description and profile.
- Signals like "members with similar profiles applied to this job" give
  collaborative lift.
- "Recommended for you" personalizes by combining the profile query with viewing
  and application behavior.

Trade-offs:

- BM25 is fast but keyword-bound, embeddings capture meaning but need model
  serving and add latency, so you blend both and A/B test.
- Freshness matters — closed or filled jobs must drop from results quickly.
- Scaling means sharded search clusters with replication for read-heavy query
  load, facet caches, and query logging that feeds ranking.
- Recruiter-side dashboards reuse the same index with different filtering.
- Failure handling degrades to keyword-only search.

### How do you scale profile and connection requests?

Profile reads dominate traffic — every browse, every feed, every connection page
reads profiles.

- The Profile Service serves from a cache (with the CDN for public profiles) and
  invalidates on update; reads are O(1) cache lookups, and the DB absorbs only
  cache misses.
- Popular profiles (celebrities, executives) are pinned in cache, and hot reads
  never reach the DB.
- Cache TTLs bound staleness, and a profile update invalidates only the changed
  member's entry, not a whole tier.

Connection requests are a write path with a state machine: request → pending →
accepted/ignored.

- The `requests` store enforces uniqueness per (from, to) so a duplicate request
  is idempotent, and rate limiting caps how many requests one member can send
  per day to prevent spam.
- On accept, a batch job creates the graph edge, notifies both sides, and
  updates suggestion counts.

Scaling the write side means sharding requests by target member (the hot side of
the write — one target may receive thousands of requests) and by sender for rate
limiting.

- Queue the notification and feed fan-out, and batch graph-edge writes so a
  burst of accepts doesn't hammer the graph store.

The trade-off is strong consistency on the request/edge (must not double-
connect) versus eventual consistency everywhere downstream, like suggestion
counts and feed visibility.

- Failure handling retries the fan-out through queues with a DLQ and lets
  profile reads continue during a graph outage because they don't depend on it.
- Monitoring tracks request latency, accept rates, and cache hit ratios.
- Alerted-on spikes in connection requests trigger rate-limit tightening.

## Source

```text
title: LinkedIn Professional Network
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node graph: Connection Graph [icon=users]
node profile: Profile Service [icon=search]
node connection: Connections [icon=sync]
node feed: Feed Service [icon=message]
node job: Job Service [icon=compute]
node search: Search Index [icon=search]
node notify: Notifications [icon=mail]
node db: Profiles DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> profile: view
edge profile -> db: read
edge api -> connection: request
edge connection -> graph: update
edge graph -> profile: connections
edge client -> api: feed
edge api -> feed: build
edge feed -> graph: network
edge api -> job: search
edge job -> search: query
edge api -> notify: alerts
```

## Q&A

### Q: Design LinkedIn / a professional network

**A:** LinkedIn is a professional graph with a feed and search on top.

- Clients hit an API gateway; the Profile Service serves member profiles from a
  Profiles DB through a cache, the Connections service handles requests and edge
  mutations on the Connection Graph, and the Feed Service builds the feed from
  the member's network.
- Job Search runs against a Search Index, and Notifications closes the loop on
  connection requests, mentions, and job alerts.

The core data model is an undirected graph of members where an edge is a
confirmed connection.

- `members` (profile, work history, education, skills), `connections` (member_a,
  member_b, since), `requests` in a pending state, and `posts` plus
  `endorsements` (a skill endorsed by a connection).
- Degrees of separation — 1st, 2nd, 3rd — are derived from this graph and are
  the vocabulary LinkedIn uses to show relevance.
- The graph is also the source of truth for visibility — what a member can see
  is filtered by connection tier and privacy settings.

Trade-offs follow from the read-heavy profile surface and the write-heavy
connection graph.

- Profile reads are cached aggressively and served partly from the CDN; graph
  mutations are rare but must be idempotent and rate-limited to stop request
  spam.
- Feed and job services are downstream consumers of the graph and must tolerate
  stale edges.

Consistency is eventually consistent for feeds and suggestion counts, while the
connection edge itself must be strongly consistent to prevent duplicate or
contradictory requests.

- Failure handling routes around graph cache misses by falling back to the
  durable store, and notification delivery retries through queues.
- Monitoring tracks graph read latency and request-accept throughput.

### Q: How do you model a connection graph and degrees of separation?

**A:** Connections form a large, sparse undirected graph.

- Store it as an adjacency list: a `connections` table with rows for each pair
  (ordered by member ID to dedupe), plus per-member neighbor lists kept in a
  graph cache.
- Each member's degree is the size of their list, and 1st-degree is a direct
  lookup; the interesting queries are 2nd and 3rd degree.

Degrees of separation are computed by breadth-first search to a depth cap
(LinkedIn's limit is 3rd).

- The 2nd-degree query is the common one — friends-of-friends you're not
  connected to — and it's a set union/intersection over adjacency lists, which
  is exactly the "People you may know" computation.
- In a dedicated graph store you keep cached lists per node; in SQL you'd shard
  by member and join at most two levels to bound cost.

Because BFS fans out multiplicatively (a member with 500 connections produces up
to 250k 2nd-degree pairs), the expensive computations are precomputed in batch
graph jobs.

- 2nd-degree neighbor counts are computed offline and cached, so interactive
  "degree of separation" UI is a lookup, not a live BFS.
- Degree-1 and degree-2 caches are invalidated only when an edge is added or
  removed.

Scaling means partitioning the graph across batch processors by member hash, and
sharding the adjacency cache by member ID.

- Trade-offs: exact BFS to depth 3 on every request is too expensive at scale,
  so you cap depth, cache results, and accept staleness measured in minutes.
- Failure handling degrades to fewer hops or cached snapshots rather than
  blocking the request.

### Q: Design the professional feed and relevance ranking

**A:** The feed shows posts, shares, job changes, and profile updates from your network
— LinkedIn's graph is sparse and low-frequency compared to Facebook, so fan-out
is cheaper, but the professional signal is what matters.

- Hybrid fan-out still applies: push to the network on publish, pull from a
  small set of followed influencers.
- Timelines live in a per-member Feed Cache; a fanout-style worker writes copies
  on publish.
- Feed items are deduped across the push and pull paths using the post ID, and
  muted or blocked authors are filtered before materialization.

Relevance ranking weighs both engagement and professional fit.

- Affinity with the author (how often you interact, mutual connections), content
  type (job changes and long-form posts rank differently than likes), freshness,
  and topical relevance from embeddings of the member's industry, skills, and
  content.
- Embeddings let the system rank a post about data engineering for a data
  engineer even with no direct interaction.

A two-stage pipeline — candidate generation from the network and followed
subjects, then a learned ranker — decides order, with diversity and spam filters
applied before ranking.

- Ranking features come from a feature store: author affinity, engagement rate,
  freshness decay, content type, and the signal strength of the poster's own
  network.

Trade-offs are cold start and privacy.

- A new member has no engagement history, so candidates come from network and
  industry.
- A member's activity is visible to network tiers and public connections only as
  configured.
- Scaling is timeline-cache reads with a merge fallback when the cache misses.
- Failure handling falls back to recency ordering if the ranker is degraded.

### Q: How do you design job search and matching?

**A:** Job search is a classic inverted index over postings.

- Title, skills, seniority, location, company, industry — supporting filters and
  faceted aggregation; geo is represented as a location hierarchy
  (city/region/country) plus radius search for "jobs near me".
- The index is sharded by document range, and hot queries (popular searches, big
  employers) are cached.

Each posting is tokenized into terms with field weights.

- Queries combine a text clause with structured filters (location, seniority,
  remote flag), and the index returns candidate document IDs that satisfy both.
- Query rewriting expands synonyms and normalizes titles, so "SWE" and "software
  engineer" hit the same documents.
- Faceted counts come from per-shard aggregations merged at query time, and
  location uses a grid to bucket postings for radius searches.

Matching is where LinkedIn differentiates.

- It parses the member's profile into a query — skills from a taxonomy, job
  titles, years of experience, location — and scores candidates with BM25 plus
  semantic embeddings of the job description and profile.
- Signals like "members with similar profiles applied to this job" give
  collaborative lift.
- "Recommended for you" personalizes by combining the profile query with viewing
  and application behavior.

Trade-offs:

- BM25 is fast but keyword-bound, embeddings capture meaning but need model
  serving and add latency, so you blend both and A/B test.
- Freshness matters — closed or filled jobs must drop from results quickly.
- Scaling means sharded search clusters with replication for read-heavy query
  load, facet caches, and query logging that feeds ranking.
- Recruiter-side dashboards reuse the same index with different filtering.
- Failure handling degrades to keyword-only search.

### Q: How do you scale profile and connection requests?

**A:** Profile reads dominate traffic — every browse, every feed, every connection page
reads profiles.

- The Profile Service serves from a cache (with the CDN for public profiles) and
  invalidates on update; reads are O(1) cache lookups, and the DB absorbs only
  cache misses.
- Popular profiles (celebrities, executives) are pinned in cache, and hot reads
  never reach the DB.
- Cache TTLs bound staleness, and a profile update invalidates only the changed
  member's entry, not a whole tier.

Connection requests are a write path with a state machine: request → pending →
accepted/ignored.

- The `requests` store enforces uniqueness per (from, to) so a duplicate request
  is idempotent, and rate limiting caps how many requests one member can send
  per day to prevent spam.
- On accept, a batch job creates the graph edge, notifies both sides, and
  updates suggestion counts.

Scaling the write side means sharding requests by target member (the hot side of
the write — one target may receive thousands of requests) and by sender for rate
limiting.

- Queue the notification and feed fan-out, and batch graph-edge writes so a
  burst of accepts doesn't hammer the graph store.

The trade-off is strong consistency on the request/edge (must not double-
connect) versus eventual consistency everywhere downstream, like suggestion
counts and feed visibility.

- Failure handling retries the fan-out through queues with a DLQ and lets
  profile reads continue during a graph outage because they don't depend on it.
- Monitoring tracks request latency, accept rates, and cache hit ratios.
- Alerted-on spikes in connection requests trigger rate-limit tightening.

## Source

```text
title: LinkedIn Professional Network
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node graph: Connection Graph [icon=users]
node profile: Profile Service [icon=search]
node connection: Connections [icon=sync]
node feed: Feed Service [icon=message]
node job: Job Service [icon=compute]
node search: Search Index [icon=search]
node notify: Notifications [icon=mail]
node db: Profiles DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: browse
edge api -> profile: view
edge profile -> db: read
edge api -> connection: request
edge connection -> graph: update
edge graph -> profile: connections
edge client -> api: feed
edge api -> feed: build
edge feed -> graph: network
edge api -> job: search
edge job -> search: query
edge api -> notify: alerts
```
