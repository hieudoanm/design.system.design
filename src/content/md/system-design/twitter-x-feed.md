# Twitter / X — Feed

Design Twitter / X home timeline

**Difficulty:** Easy

**Tags:** event-driven, notification, search, social

## Functional Requirements

- Twitter / X home timeline
- Pull-based vs push-based fanout: when do you use which?
- rank or order a news feed?
- Twitter search / trending topics
- support a celebrity (supernode) with millions of followers?

## Non-Functional Requirements

- Push and pull are the two fanout models.

- Push (fanout-on-write) pre-computes timelines: on publish, write the tweet
  into every follower's cache, giving fast reads at the cost of O(followers)
  writes and duplicate storage.
- Pull (fanout-on-read) merges on demand: at read time, query the followed
  users' recent tweets, which is cheap to write but expensive and slower to
  read.

Real systems use a hybrid.

- Push for normal accounts (fanout-limited, e.g., under ~100k followers) and
  pull for celebrities to avoid fanout explosion, or lazily push only to
  recently-active followers.
- Additional levers: only push to users who logged in recently, and let
  celebrity tweets be merged at read time so their write path stays O(1).
- The trade-off is write amplification and read latency; choose the mode per
  account tier..
- Ranking scores candidate tweets rather than sorting purely by recency.

- Features include exponential time decay, engagement signals (likes, retweets,
  replies, video views), author quality, the user's interaction history with
  that author, and content type.
- Candidate generation fetches recent tweets from followed users (via the fanout
  cache), then an online ranking service applies per-user weights from a feature
  store and returns the top K.
- Real-time signals stream through Kafka into feature stores so weights refresh
  frequently.
- A common blend is recency for hard-followed accounts and engagement/relevance
  for discovery content, so both trending and high-quality items surface.
- Use predicted click/engagement models offline and validate thresholds with A/B
  testing.
- Ranker latency is critical, so score in parallel and cap candidate set size..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Twitter Feed
client: Client
cdn: CDN
api: API Gateway
tweet: Tweet Service
fanout: Fanout Worker
feed: Timeline Service
media: Media Service
search: Search Service
notify: Notification Service
db: Tweets DB
graph: Graph DB
cache: Feed Cache

client ─► cdn ─► static assets
client ─► api ─► post / read
api ─► tweet ─► publish
tweet ─► db ─► persist
tweet ─► fanout ─► push to followers
fanout ─► graph ─► get followers
graph ─► fanout ─► follower ids
fanout ─► cache ─► push feeds
client ─► api ─► home timeline
api ─► feed ─► build
feed ─► cache ─► cached feed
feed ─► cache ─► write
api ─► search ─► query
tweet ─► notify ─► alerts
```

## Design

### Design Twitter / X home timeline

The home timeline shows recent tweets from accounts a user follows.

- The Tweet service persists new tweets and emits them to a Fanout Worker.
- A graph/followers service supplies follower lists.
- Fanout copies each tweet into followers' timeline caches (Redis) — a push
  model.
- The Timeline service reads cached feeds, merges and ranks them, and returns
  results through the API gateway with cursor-based pagination.
- Cap the cached feed (e.g., 800 tweets) to bound memory.
- Media URLs point at a CDN to offload bytes.
- Writes are heavy but reads dominate by orders of magnitude, so reads must
  always hit the in-memory cache, never the primary tweets DB.
- Use replicas and read-through caching, plus a fanout queue (Kafka) with
  retry/dead-letter handling to absorb load during spikes.

### Pull-based vs push-based fanout: when do you use which?

Push and pull are the two fanout models.

- Push (fanout-on-write) pre-computes timelines: on publish, write the tweet
  into every follower's cache, giving fast reads at the cost of O(followers)
  writes and duplicate storage.
- Pull (fanout-on-read) merges on demand: at read time, query the followed
  users' recent tweets, which is cheap to write but expensive and slower to
  read.

Real systems use a hybrid.

- Push for normal accounts (fanout-limited, e.g., under ~100k followers) and
  pull for celebrities to avoid fanout explosion, or lazily push only to
  recently-active followers.
- Additional levers: only push to users who logged in recently, and let
  celebrity tweets be merged at read time so their write path stays O(1).
- The trade-off is write amplification and read latency; choose the mode per
  account tier.

### How do you rank or order a news feed?

Ranking scores candidate tweets rather than sorting purely by recency.

- Features include exponential time decay, engagement signals (likes, retweets,
  replies, video views), author quality, the user's interaction history with
  that author, and content type.
- Candidate generation fetches recent tweets from followed users (via the fanout
  cache), then an online ranking service applies per-user weights from a feature
  store and returns the top K.
- Real-time signals stream through Kafka into feature stores so weights refresh
  frequently.
- A common blend is recency for hard-followed accounts and engagement/relevance
  for discovery content, so both trending and high-quality items surface.
- Use predicted click/engagement models offline and validate thresholds with A/B
  testing.
- Ranker latency is critical, so score in parallel and cap candidate set size.

### Design Twitter search / trending topics

Search is a separate pipeline from the timeline.

- Tweets flow through Kafka into an ingest job that cleans text and indexes into
  a distributed full-text engine (Elasticsearch/Solr) with an inverted index
  supporting filters on user, time range, language, and location.
- Index in near real time with shards replicated for availability.
- The query path: API to Search service to the index, ranked by relevance (BM25)
  blended with recency and engagement.

Trending topics is a streaming aggregation over hashtags and normalized
keywords.

- Count occurrences in rolling windows (e.g., 10 minutes vs 24 hours) with a
  stream processor (Flink/Spark).
- Compare current velocity against baseline to detect spikes.
- Dedupe and normalize aliases, and serve the top K from a cache (Redis) with
  regional and language filters.

### How do you support a celebrity (supernode) with millions of followers?

The problem is fanout explosion: pushing one tweet into millions of follower
caches is too expensive and slow.

- The solution is hybrid fanout.
- For celebrity accounts, do not push — mark them as pull, and at read time the
  Timeline service fetches the celebrity's recent tweets from a dedicated
  hot-timeline store and merges them into the follower's feed.
- Combine with lazy fanout: skip followers inactive for a long period, pushing
  only to recently-logged-in users.

Other techniques:

- Cache follower lists and partition the graph by follower-count tier.
- Keep the celebrity's timeline sharded and hot in cache.
- Cap fanout with an LRU of active followers.
- Prioritize ranking the celebrity's tweets correctly at merge time.

The hybrid keeps the write path O(1) while reads stay fast.

## Source

```text
title: Twitter Feed
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node tweet: Tweet Service [icon=message]
node fanout: Fanout Worker [icon=worker]
node feed: Timeline Service [icon=compute]
node media: Media Service [icon=file]
node search: Search Service [icon=search]
node notify: Notification Service [icon=mail]
node db: Tweets DB [cylinder, icon=database]
node graph: Graph DB [cylinder, icon=users]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> cdn: static assets
edge client -> api: post / read
edge api -> tweet: publish
edge tweet -> db: persist
edge tweet -> fanout: push to followers
edge fanout -> graph: get followers
edge graph -> fanout: follower ids
edge fanout -> cache: push feeds
edge client -> api: home timeline
edge api -> feed: build
edge feed -> cache: cached feed
edge feed -> cache: write
edge api -> search: query
edge tweet -> notify: alerts
```

## Q&A

### Q: Design Twitter / X home timeline

**A:** The home timeline shows recent tweets from accounts a user follows.

- The Tweet service persists new tweets and emits them to a Fanout Worker.
- A graph/followers service supplies follower lists.
- Fanout copies each tweet into followers' timeline caches (Redis) — a push
  model.
- The Timeline service reads cached feeds, merges and ranks them, and returns
  results through the API gateway with cursor-based pagination.
- Cap the cached feed (e.g., 800 tweets) to bound memory.
- Media URLs point at a CDN to offload bytes.
- Writes are heavy but reads dominate by orders of magnitude, so reads must
  always hit the in-memory cache, never the primary tweets DB.
- Use replicas and read-through caching, plus a fanout queue (Kafka) with
  retry/dead-letter handling to absorb load during spikes.

### Q: Pull-based vs push-based fanout: when do you use which?

**A:** Push and pull are the two fanout models.

- Push (fanout-on-write) pre-computes timelines: on publish, write the tweet
  into every follower's cache, giving fast reads at the cost of O(followers)
  writes and duplicate storage.
- Pull (fanout-on-read) merges on demand: at read time, query the followed
  users' recent tweets, which is cheap to write but expensive and slower to
  read.

Real systems use a hybrid.

- Push for normal accounts (fanout-limited, e.g., under ~100k followers) and
  pull for celebrities to avoid fanout explosion, or lazily push only to
  recently-active followers.
- Additional levers: only push to users who logged in recently, and let
  celebrity tweets be merged at read time so their write path stays O(1).
- The trade-off is write amplification and read latency; choose the mode per
  account tier.

### Q: How do you rank or order a news feed?

**A:** Ranking scores candidate tweets rather than sorting purely by recency.

- Features include exponential time decay, engagement signals (likes, retweets,
  replies, video views), author quality, the user's interaction history with
  that author, and content type.
- Candidate generation fetches recent tweets from followed users (via the fanout
  cache), then an online ranking service applies per-user weights from a feature
  store and returns the top K.
- Real-time signals stream through Kafka into feature stores so weights refresh
  frequently.
- A common blend is recency for hard-followed accounts and engagement/relevance
  for discovery content, so both trending and high-quality items surface.
- Use predicted click/engagement models offline and validate thresholds with A/B
  testing.
- Ranker latency is critical, so score in parallel and cap candidate set size.

### Q: Design Twitter search / trending topics

**A:** Search is a separate pipeline from the timeline.

- Tweets flow through Kafka into an ingest job that cleans text and indexes into
  a distributed full-text engine (Elasticsearch/Solr) with an inverted index
  supporting filters on user, time range, language, and location.
- Index in near real time with shards replicated for availability.
- The query path: API to Search service to the index, ranked by relevance (BM25)
  blended with recency and engagement.

Trending topics is a streaming aggregation over hashtags and normalized
keywords.

- Count occurrences in rolling windows (e.g., 10 minutes vs 24 hours) with a
  stream processor (Flink/Spark).
- Compare current velocity against baseline to detect spikes.
- Dedupe and normalize aliases, and serve the top K from a cache (Redis) with
  regional and language filters.

### Q: How do you support a celebrity (supernode) with millions of followers?

**A:** The problem is fanout explosion: pushing one tweet into millions of follower
caches is too expensive and slow.

- The solution is hybrid fanout.
- For celebrity accounts, do not push — mark them as pull, and at read time the
  Timeline service fetches the celebrity's recent tweets from a dedicated
  hot-timeline store and merges them into the follower's feed.
- Combine with lazy fanout: skip followers inactive for a long period, pushing
  only to recently-logged-in users.

Other techniques:

- Cache follower lists and partition the graph by follower-count tier.
- Keep the celebrity's timeline sharded and hot in cache.
- Cap fanout with an LRU of active followers.
- Prioritize ranking the celebrity's tweets correctly at merge time.

The hybrid keeps the write path O(1) while reads stay fast.

## Source

```text
title: Twitter Feed
node client: Client [round, icon=browser]
node cdn: CDN [ellipse, icon=cloud]
node api: API Gateway [icon=server]
node tweet: Tweet Service [icon=message]
node fanout: Fanout Worker [icon=worker]
node feed: Timeline Service [icon=compute]
node media: Media Service [icon=file]
node search: Search Service [icon=search]
node notify: Notification Service [icon=mail]
node db: Tweets DB [cylinder, icon=database]
node graph: Graph DB [cylinder, icon=users]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> cdn: static assets
edge client -> api: post / read
edge api -> tweet: publish
edge tweet -> db: persist
edge tweet -> fanout: push to followers
edge fanout -> graph: get followers
edge graph -> fanout: follower ids
edge fanout -> cache: push feeds
edge client -> api: home timeline
edge api -> feed: build
edge feed -> cache: cached feed
edge feed -> cache: write
edge api -> search: query
edge tweet -> notify: alerts
```
