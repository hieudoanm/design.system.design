# Google News — News Aggregator

Design a news aggregator

**Difficulty:** Hard

**Tags:** recommendation, social

## Functional Requirements

- a news aggregator
- crawl and parse news sources?
- rank stories for a personalized feed?
- cluster related articles?
- handle breaking news in real-time?

## Non-Functional Requirements

- Crawling the news web means respecting both scale and the publishers.

- The crawler maintains a per-domain fetch schedule based on how often a source
  publishes, since a wire service changes constantly while a niche blog may post
  weekly.
- Each URL is normalized, deduplicated by content hash and canonical tag, and
  fetched with a budget: redirects resolved, encoding detected, and timeouts
  enforced.
- Robots policies are honored, and a per-domain rate limiter prevents the
  crawler from becoming a load problem.
- A queue backed by the Articles DB drives the crawl, and URLs discovered in
  pages and feeds are added to it with a freshness score.

Parsing turns pages into structured articles.

- The Article Parser extracts the headline, body, byline, publication time, and
  featured images, using a combination of site-agnostic heuristics and per-site
  extraction rules tuned for the highest-traffic domains.
- Extraction must be robust to redesigns, so confidence scoring flags pages
  where the extraction looks wrong and routes them to an alternate strategy or a
  human-reviewed override.
- Published time matters enormously, because recency drives ranking, so the
  parser disambiguates dates from headers, URL slugs, and metadata and stores
  both the publisher-claimed time and the crawl time.

The output quality gates the rest of the system.

- A parsed article carries a fingerprint, and near-duplicate detection at parse
  time prevents the same content, republished across outlets, from flooding the
  database.
- Structured data is also extracted: author, outlet category, and topics, which
  feed clustering and ranking downstream.
- The Articles DB is sharded by article range, with an index on publication time
  so the "latest stories" query is a scan of recent data rather than a full
  search.
- The crawl pipeline is sized so the freshest sources are revisited within
  minutes, keeping the corpus current..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: News Aggregator
reader: Reader
app: News App
gateway: API Gateway
crawler: Feed Crawler
parser: Article Parser
cluster: Story Clustering
rank: Ranking Service
feed: Personalized Feed
realtime: Breaking News
cache: Feed Cache
db: Articles DB

reader ─► app ─► open feed
crawler ─► parser ─► raw pages
parser ─► db ─► store
parser ─► cluster ─► group
cluster ─► rank ─► stories
rank ─► feed ─► personalize
feed ─► cache ─► serve
realtime ─► feed ─► inject
app ─► gateway ─► request
gateway ─► feed ─► read
cache ─► app ─► fast load
```

## Design

### Design a news aggregator

A news aggregator collects articles from thousands of publishers, organizes them
into stories, and serves each reader a personalized feed.

- The pipeline starts with the Feed Crawler, which continuously polls publisher
  feeds and web pages, and the Article Parser, which converts raw HTML and RSS
  into structured articles with titles, bodies, authors, and timestamps.
- The Story Clustering component groups articles that cover the same event into
  a single story, the Ranking Service decides which stories matter, and the
  Personalized Feed assembles them per reader.
- The Articles DB is the canonical store, with a cache in front for the hot
  serving path.

The system is a batch stream fused with a real-time stream.

- The bulk of crawling and parsing runs as a steady background workload,
  refreshing feeds on publisher cadence, while a breaking-news channel injects
  fresh stories as soon as they are detected.
- Both paths converge on the same pipeline: parse, cluster, rank, and serve.
- This dual design is what lets the product feel simultaneously comprehensive
  and immediate.
- Serving must be fast, so feeds are rendered from cache and personalized
  signals are applied at query time without blocking the read.

The aggregation layer is where the product earns its value.

- No single article from a single outlet defines an event; the story cluster
  does, aggregating a primary article plus alternative viewpoints, images, and
  video.
- The reader gets the event, not just one report of it.
- Personalization then ranks those stories against the reader's topics and
  history.
- The architecture keeps the content pipeline, which is shared by everyone,
  strictly separated from the ranking layer, which is per reader, so expensive
  crawling work is done once and reused across the whole user base.

### How do you crawl and parse news sources?

Crawling the news web means respecting both scale and the publishers.

- The crawler maintains a per-domain fetch schedule based on how often a source
  publishes, since a wire service changes constantly while a niche blog may post
  weekly.
- Each URL is normalized, deduplicated by content hash and canonical tag, and
  fetched with a budget: redirects resolved, encoding detected, and timeouts
  enforced.
- Robots policies are honored, and a per-domain rate limiter prevents the
  crawler from becoming a load problem.
- A queue backed by the Articles DB drives the crawl, and URLs discovered in
  pages and feeds are added to it with a freshness score.

Parsing turns pages into structured articles.

- The Article Parser extracts the headline, body, byline, publication time, and
  featured images, using a combination of site-agnostic heuristics and per-site
  extraction rules tuned for the highest-traffic domains.
- Extraction must be robust to redesigns, so confidence scoring flags pages
  where the extraction looks wrong and routes them to an alternate strategy or a
  human-reviewed override.
- Published time matters enormously, because recency drives ranking, so the
  parser disambiguates dates from headers, URL slugs, and metadata and stores
  both the publisher-claimed time and the crawl time.

The output quality gates the rest of the system.

- A parsed article carries a fingerprint, and near-duplicate detection at parse
  time prevents the same content, republished across outlets, from flooding the
  database.
- Structured data is also extracted: author, outlet category, and topics, which
  feed clustering and ranking downstream.
- The Articles DB is sharded by article range, with an index on publication time
  so the "latest stories" query is a scan of recent data rather than a full
  search.
- The crawl pipeline is sized so the freshest sources are revisited within
  minutes, keeping the corpus current.

### How do you rank stories for a personalized feed?

Ranking decides what the reader sees first, and it combines two signals: global
importance and personal relevance.

- Global importance captures how significant a story is across the whole news
  ecosystem, using freshness, the number of distinct outlets covering the story,
  authority of those outlets, and engagement volume.
- Personal relevance captures what this specific reader cares about, drawn from
  the topics they read, the sources they trust, and their click and dwell
  behavior.
- The Ranking Service blends the two with weights that shift by context,
  favoring global news in a top story header and personal preferences in a
  section list.

The serving architecture keeps ranking fast.

- The candidate pool is the set of recent, top-scoring stories, typically a few
  thousand; for each reader request, the service applies the personalization
  model to that pool and scores the top subset.
- Because the pool is shared and only the scoring is per reader, the heavy
  feature computation is done once per story and cached, while the per-reader
  portion uses compact feature vectors.
- The reader's profile is a set of topic weights and source preferences, updated
  from a feedback stream of clicks, skips, and read time, with a short time
  window so a reader's interest in a sports event fades naturally.

The ranking must also be honest about its inputs.

- Spam and low-quality outlets are downweighted by reputation scores, and
  stories are surfaced with their source prominently, because a feed that hides
  provenance destroys trust.
- Personalization is explainable in aggregate: readers can see and edit the
  topics the system thinks they care about.
- The metric is not clicks alone but dwell time and return visits, which rewards
  the ranking for sending the reader to a story they actually finish.
- Freshness is enforced at the tail, so stale stories decay out of the feed even
  if their scores were once high.

### How do you cluster related articles?

Clustering turns hundreds of articles about one event into one story card.

- The pipeline runs on newly parsed articles in near real time: each article is
  embedded into a semantic vector using a language model, and its headline and
  body are hashed into topical fingerprints.
- Articles whose vectors are close enough in the embedding space, and whose
  fingerprints overlap on key entities and time windows, are candidates for the
  same cluster.
- The Story Clustering service then makes the decision, creating a new story for
  the first article of an event and assigning subsequent articles to it as long
  as they refer to the same entities within a rolling time window.

The cluster is a living object.

- It has a representative headline, chosen from the most authoritative outlet, a
  list of member articles, and aggregate metadata such as the first and latest
  publication time and the number of outlets.
- As new articles arrive, the cluster merges them, updates the headline, and
  recomputes the story's importance signal, since a story that suddenly has
  thirty outlets covering it is more important than one with three.
- Breaking news clustering must tolerate a messy start: early articles about an
  event are fragmentary, so clusters use a soft match and expand as confirmation
  arrives.

Clustering quality is a tuning problem.

- Too tight and the story card misses follow-up coverage; too loose and
  unrelated events merge into nonsense.
- The system uses entity-aware matching, so two articles about different
  companies named "Delta" do not cluster just because they share a word.
- Evaluation runs against human-labeled pairs, and cluster assignments are
  logged so the model can be retrained when precision or recall drifts.
- The output is the unit of the feed: the reader browses stories, and individual
  articles are reachable inside each story, which is exactly how a human news
  consumer thinks about an event.

### How do you handle breaking news in real-time?

Breaking news is the moment the aggregator must be fastest.

- A wire service moves a story, and within seconds readers expect to see it.
- The real-time path bypasses the normal crawl cadence: a dedicated channel
  watches high-speed sources such as wire feeds and alerts, and any new item is
  parsed, clustered, and injected into the feed immediately.
- The Breaking News service acts as an accelerator, tagging items with urgency
  and pushing them to the feed builder as soon as the cluster exists, rather
  than waiting for the next scheduled crawl tick.

The challenge is separating genuine breaking news from noise.

- Early articles are short, unverified, and often contradictory.
- The system applies a confidence threshold before promoting an item to top
  placement, using source authority and corroboration: a story is not breaking
  until at least two independent outlets confirm it.
- Meanwhile the item is visible in a lower-priority slot, so the reader sees it
  without the feed overclaiming.
- As confirmation arrives, the cluster matures and the story moves up.
- This progressive promotion is the core mechanism balancing speed with
  accuracy.

Serving must keep up with the surge.

- Breaking stories spike read traffic to a single story, so the feed cache is
  warmed aggressively for trending items and the ranking pool is updated
  incrementally rather than rebuilt.
- The cache layer absorbs the spike so the database and the crawler are not
  crushed by the same event that made the news.
- Distributed systems practice matters here: hot spots are sharded, and the
  system degrades gracefully by serving a slightly less fresh feed before it
  serves no feed.
- The metric of success is time to first display, measured from the wire move to
  the story appearing in the reader's feed, and the architecture is tuned around
  keeping that number in seconds.

## Source

```text
title: News Aggregator
node reader: Reader [round, icon=browser]
node app: News App [icon=browser]
node gateway: API Gateway [icon=server]
node crawler: Feed Crawler [icon=worker]
node parser: Article Parser [icon=compute]
node cluster: Story Clustering [icon=compute]
node rank: Ranking Service [icon=compute]
node feed: Personalized Feed [icon=search]
node realtime: Breaking News [icon=queue]
node cache: Feed Cache [cylinder, icon=cache]
node db: Articles DB [cylinder, icon=database]

edge reader -> app: open feed
edge crawler -> parser: raw pages
edge parser -> db: store
edge parser -> cluster: group
edge cluster -> rank: stories
edge rank -> feed: personalize
edge feed -> cache: serve
edge realtime -> feed: inject
edge app -> gateway: request
edge gateway -> feed: read
edge cache -> app: fast load
```

## Q&A

### Q: Design a news aggregator

**A:** A news aggregator collects articles from thousands of publishers, organizes them
into stories, and serves each reader a personalized feed.

- The pipeline starts with the Feed Crawler, which continuously polls publisher
  feeds and web pages, and the Article Parser, which converts raw HTML and RSS
  into structured articles with titles, bodies, authors, and timestamps.
- The Story Clustering component groups articles that cover the same event into
  a single story, the Ranking Service decides which stories matter, and the
  Personalized Feed assembles them per reader.
- The Articles DB is the canonical store, with a cache in front for the hot
  serving path.

The system is a batch stream fused with a real-time stream.

- The bulk of crawling and parsing runs as a steady background workload,
  refreshing feeds on publisher cadence, while a breaking-news channel injects
  fresh stories as soon as they are detected.
- Both paths converge on the same pipeline: parse, cluster, rank, and serve.
- This dual design is what lets the product feel simultaneously comprehensive
  and immediate.
- Serving must be fast, so feeds are rendered from cache and personalized
  signals are applied at query time without blocking the read.

The aggregation layer is where the product earns its value.

- No single article from a single outlet defines an event; the story cluster
  does, aggregating a primary article plus alternative viewpoints, images, and
  video.
- The reader gets the event, not just one report of it.
- Personalization then ranks those stories against the reader's topics and
  history.
- The architecture keeps the content pipeline, which is shared by everyone,
  strictly separated from the ranking layer, which is per reader, so expensive
  crawling work is done once and reused across the whole user base.

### Q: How do you crawl and parse news sources?

**A:** Crawling the news web means respecting both scale and the publishers.

- The crawler maintains a per-domain fetch schedule based on how often a source
  publishes, since a wire service changes constantly while a niche blog may post
  weekly.
- Each URL is normalized, deduplicated by content hash and canonical tag, and
  fetched with a budget: redirects resolved, encoding detected, and timeouts
  enforced.
- Robots policies are honored, and a per-domain rate limiter prevents the
  crawler from becoming a load problem.
- A queue backed by the Articles DB drives the crawl, and URLs discovered in
  pages and feeds are added to it with a freshness score.

Parsing turns pages into structured articles.

- The Article Parser extracts the headline, body, byline, publication time, and
  featured images, using a combination of site-agnostic heuristics and per-site
  extraction rules tuned for the highest-traffic domains.
- Extraction must be robust to redesigns, so confidence scoring flags pages
  where the extraction looks wrong and routes them to an alternate strategy or a
  human-reviewed override.
- Published time matters enormously, because recency drives ranking, so the
  parser disambiguates dates from headers, URL slugs, and metadata and stores
  both the publisher-claimed time and the crawl time.

The output quality gates the rest of the system.

- A parsed article carries a fingerprint, and near-duplicate detection at parse
  time prevents the same content, republished across outlets, from flooding the
  database.
- Structured data is also extracted: author, outlet category, and topics, which
  feed clustering and ranking downstream.
- The Articles DB is sharded by article range, with an index on publication time
  so the "latest stories" query is a scan of recent data rather than a full
  search.
- The crawl pipeline is sized so the freshest sources are revisited within
  minutes, keeping the corpus current.

### Q: How do you rank stories for a personalized feed?

**A:** Ranking decides what the reader sees first, and it combines two signals: global
importance and personal relevance.

- Global importance captures how significant a story is across the whole news
  ecosystem, using freshness, the number of distinct outlets covering the story,
  authority of those outlets, and engagement volume.
- Personal relevance captures what this specific reader cares about, drawn from
  the topics they read, the sources they trust, and their click and dwell
  behavior.
- The Ranking Service blends the two with weights that shift by context,
  favoring global news in a top story header and personal preferences in a
  section list.

The serving architecture keeps ranking fast.

- The candidate pool is the set of recent, top-scoring stories, typically a few
  thousand; for each reader request, the service applies the personalization
  model to that pool and scores the top subset.
- Because the pool is shared and only the scoring is per reader, the heavy
  feature computation is done once per story and cached, while the per-reader
  portion uses compact feature vectors.
- The reader's profile is a set of topic weights and source preferences, updated
  from a feedback stream of clicks, skips, and read time, with a short time
  window so a reader's interest in a sports event fades naturally.

The ranking must also be honest about its inputs.

- Spam and low-quality outlets are downweighted by reputation scores, and
  stories are surfaced with their source prominently, because a feed that hides
  provenance destroys trust.
- Personalization is explainable in aggregate: readers can see and edit the
  topics the system thinks they care about.
- The metric is not clicks alone but dwell time and return visits, which rewards
  the ranking for sending the reader to a story they actually finish.
- Freshness is enforced at the tail, so stale stories decay out of the feed even
  if their scores were once high.

### Q: How do you cluster related articles?

**A:** Clustering turns hundreds of articles about one event into one story card.

- The pipeline runs on newly parsed articles in near real time: each article is
  embedded into a semantic vector using a language model, and its headline and
  body are hashed into topical fingerprints.
- Articles whose vectors are close enough in the embedding space, and whose
  fingerprints overlap on key entities and time windows, are candidates for the
  same cluster.
- The Story Clustering service then makes the decision, creating a new story for
  the first article of an event and assigning subsequent articles to it as long
  as they refer to the same entities within a rolling time window.

The cluster is a living object.

- It has a representative headline, chosen from the most authoritative outlet, a
  list of member articles, and aggregate metadata such as the first and latest
  publication time and the number of outlets.
- As new articles arrive, the cluster merges them, updates the headline, and
  recomputes the story's importance signal, since a story that suddenly has
  thirty outlets covering it is more important than one with three.
- Breaking news clustering must tolerate a messy start: early articles about an
  event are fragmentary, so clusters use a soft match and expand as confirmation
  arrives.

Clustering quality is a tuning problem.

- Too tight and the story card misses follow-up coverage; too loose and
  unrelated events merge into nonsense.
- The system uses entity-aware matching, so two articles about different
  companies named "Delta" do not cluster just because they share a word.
- Evaluation runs against human-labeled pairs, and cluster assignments are
  logged so the model can be retrained when precision or recall drifts.
- The output is the unit of the feed: the reader browses stories, and individual
  articles are reachable inside each story, which is exactly how a human news
  consumer thinks about an event.

### Q: How do you handle breaking news in real-time?

**A:** Breaking news is the moment the aggregator must be fastest.

- A wire service moves a story, and within seconds readers expect to see it.
- The real-time path bypasses the normal crawl cadence: a dedicated channel
  watches high-speed sources such as wire feeds and alerts, and any new item is
  parsed, clustered, and injected into the feed immediately.
- The Breaking News service acts as an accelerator, tagging items with urgency
  and pushing them to the feed builder as soon as the cluster exists, rather
  than waiting for the next scheduled crawl tick.

The challenge is separating genuine breaking news from noise.

- Early articles are short, unverified, and often contradictory.
- The system applies a confidence threshold before promoting an item to top
  placement, using source authority and corroboration: a story is not breaking
  until at least two independent outlets confirm it.
- Meanwhile the item is visible in a lower-priority slot, so the reader sees it
  without the feed overclaiming.
- As confirmation arrives, the cluster matures and the story moves up.
- This progressive promotion is the core mechanism balancing speed with
  accuracy.

Serving must keep up with the surge.

- Breaking stories spike read traffic to a single story, so the feed cache is
  warmed aggressively for trending items and the ranking pool is updated
  incrementally rather than rebuilt.
- The cache layer absorbs the spike so the database and the crawler are not
  crushed by the same event that made the news.
- Distributed systems practice matters here: hot spots are sharded, and the
  system degrades gracefully by serving a slightly less fresh feed before it
  serves no feed.
- The metric of success is time to first display, measured from the wire move to
  the story appearing in the reader's feed, and the architecture is tuned around
  keeping that number in seconds.

## Source

```text
title: News Aggregator
node reader: Reader [round, icon=browser]
node app: News App [icon=browser]
node gateway: API Gateway [icon=server]
node crawler: Feed Crawler [icon=worker]
node parser: Article Parser [icon=compute]
node cluster: Story Clustering [icon=compute]
node rank: Ranking Service [icon=compute]
node feed: Personalized Feed [icon=search]
node realtime: Breaking News [icon=queue]
node cache: Feed Cache [cylinder, icon=cache]
node db: Articles DB [cylinder, icon=database]

edge reader -> app: open feed
edge crawler -> parser: raw pages
edge parser -> db: store
edge parser -> cluster: group
edge cluster -> rank: stories
edge rank -> feed: personalize
edge feed -> cache: serve
edge realtime -> feed: inject
edge app -> gateway: request
edge gateway -> feed: read
edge cache -> app: fast load
```
