# Google Search — Web Search

Design a web search engine

**Difficulty:** Medium

**Tags:** cache, crawler, search

## Functional Requirements

- a web search engine
- build and update the inverted index?
- rank search results at scale?
- serve autocomplete suggestions?
- handle cache misses and hot queries?

## Non-Functional Requirements

- The inverted index maps each term to a posting list — a sorted list of document
  IDs with frequencies and positions.

- Building it is a batch MapReduce-style job: the indexer tokenizes each page,
  emits (term, docID) pairs, and a reduce phase merges postings by term and
  writes them into sorted segments.
- Documents are stored in the page store and addressed by an internal 64-bit
  docID.
- The index is sharded by term range across index servers and replicated for
  redundancy and query fan-out.

Fresh content requires two paths: a full rebuild for new shards and
near-real-time updates.

- New documents are appended into small in-memory buffers that periodically
  flush to new segments, and old segments are compacted in the background; a
  per-shard refresh interval (e.g., seconds) makes fresh documents visible while
  queries still read from a consistent snapshot.

Deliberate design choices keep the index healthy.

- Posting lists are compressed (delta-encoding docIDs and varint/frame-of-
  reference encoding) to reduce IO and memory.
- Deletions and updates are handled with tombstones and re-crawls rather than
  in-place edits.
- A delete queue marks removed documents, and compaction sweeps them.
- Because crawlers are continuous, the index is never complete — it is always a
  moving window over the web.
- Monitoring tracks the average index freshness (lag between page fetch and
  queryable), the segment count, and the merge backlog; if merges fall behind,
  query latency degrades, so tuning the compaction policy is a first-class
  operational concern..
- Ranking is split into two phases to bound cost.

- Retrieval (top-k candidate generation) uses the inverted index to fetch the
  most promising documents with cheap scoring — conjunctive or disjunctive query
  evaluation over posting lists with a heap of the top k — because full scoring
  over millions of postings is infeasible per query.
- Then a scoring/reranking phase computes expensive features on the top ~1,000
  candidates: static features (PageRank, page quality, freshness) are
  precomputed offline and stored alongside the index, while query-dependent
  features (BM25, term proximity, exact-phrase matches, click-through
  statistics) are computed at query time.
- A lightweight scorer (e.g., linear combination or a small tree model) sorts
  the top results for the snippet stage; heavy neural rankers are reserved for
  the top 10–100 when compute budget allows.

Scale comes from sharding and parallelism.

- The index is partitioned across many machines, each returns its local top-k,
  and a coordinating layer merges partial results with rank-based merging.
- Static scores like PageRank are computed offline by iterating the link graph
  with a random-walk algorithm (power iteration over a sparse adjacency matrix,
  typically in MapReduce), so they add zero query-time cost.
- The ranker must also mix diverse sources — news, images, videos — via result
  merging and deduplication so a single domain does not dominate.
- Because click data is the ground truth for relevance, every result click is
  logged and periodically re-mines ranking features; this closes the loop that
  improves ranking models without touching query latency..
- Autocomplete is a prefix problem: given a typed prefix, return the top N
  completions fast.

- The standard structure is a compact trie over a frequency-ranked dictionary,
  where each trie node stores the top completions for that prefix (precomputed)
  so lookups are O(prefix length) and can be answered from a single node.
- Because the dictionary is large, the trie is sharded by prefix range across
  suggestion servers and loaded from a replicated snapshot, with an in-memory
  read-optimized representation for cache-friendly traversal.
- Suggestions are generated offline from query logs: frequent and trending
  queries are weighted by count, recency, and geographic context, then filtered
  for safety before being indexed into the trie.

Hot paths matter because users fire a request per keystroke.

- The client debounces and sends only the final few keystrokes; the gateway
  reads a small cached prefix set (e.g., top-10 for each prefix) rather than
  computing on the fly.
- A distributed cache (e.g., Redis or a CDN-style edge cache) absorbs repeats,
  since most prefixes follow a power-law distribution.
- Personalization and context (location, language, history) refine the ranked
  completions at query time by reordering the precomputed list.
- Because users keep typing, incremental updates rebuild the trie in the
  background and hot-swap it without downtime; the result is sub-millisecond
  suggestion latency while the underlying dictionary evolves every few minutes..
- Query traffic is heavily skewed — a small number of hot queries generate most of
  the load — so caching is the primary defense.

- A multilevel cache sits in front of the ranking pipeline: an edge/HTTP cache
  for identical queries, then a result cache (e.g., Redis or Memcached) keyed by
  normalized query plus filters (language, region, safe-search), storing
  serialized result pages with a short TTL.
- Since ranking is expensive, only the final result page is cached, and
  near-identical queries are collapsed by normalization (lowercasing, stemming,
  dedup of whitespace).
- Cache misses fall through to the full query pipeline; to protect the backend
  from a thundering herd on a popular cache-expired query, only one request
  computes the result and the rest either wait on a short lease or are served a
  slightly stale cached copy.

Hot-query and hot-shard management are about containment.

- A single extremely hot term (a trending event) can overload the index shard
  owning that posting list; mitigations include replicating hot shards, caching
  the posting lists of popular terms in memory across replicas, and shedding
  load by serving cached results with relaxed freshness.
- A circuit breaker monitors shard latency and auto-degrades — for example,
  falling back to a narrower candidate set or skipping expensive rerank features
  — while an analytics stream tracks miss rates per shard to drive rebalancing.
- Capacity is sized so that the combined cache hit rate keeps backend CPU low;
  monitoring miss-rate spikes is the early warning that a cache key design is
  fragmenting traffic or a news event has arrived.

## Source

````text
title: Web Search
node user: User [round, icon=browser]
node app: Search App [icon=browser]
node gateway: API Gateway [icon=server]
node crawler: Web Crawler [icon=worker]
node indexer: Indexer [icon=compute]
node index: Inverted Index [cylinder, icon=search]
node store: Page Store [cylinder, icon=database]
node query: Query Engine [icon=search]
node rank: Ranking Service [icon=compute]
node cache: Result Cache [cylinder, icon=cache]
node suggest: Autocomplete [icon=search]
node analytics: Query Analytics [icon=worker]
node graph: Link Graph [cylinder, icon=users]

edge user -> app: search query
edge app -> gateway: query
edge gateway -> query: parse
edge query -> index: lookup
edge index -> query: candidates
edge query -> rank: score
edge rank -> gateway: results
edge gateway -> cache: cache results
edge gateway -> suggest: prefixes
edge crawler -> store: raw pages
edge crawler -> indexer: content
edge indexer -> index: terms
edge indexer -> graph: links
edge query -> analytics: log
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Web Search
user: User
app: Search App
gateway: API Gateway
crawler: Web Crawler
indexer: Indexer
index: Inverted Index
store: Page Store
query: Query Engine
rank: Ranking Service
cache: Result Cache
suggest: Autocomplete
analytics: Query Analytics
graph: Link Graph

user ─► app ─► search query
app ─► gateway ─► query
gateway ─► query ─► parse
query ─► index ─► lookup
index ─► query ─► candidates
query ─► rank ─► score
rank ─► gateway ─► results
gateway ─► cache ─► cache results
gateway ─► suggest ─► prefixes
crawler ─► store ─► raw pages
crawler ─► indexer ─► content
indexer ─► index ─► terms
indexer ─► graph ─► links
query ─► analytics ─► log
````

## Design

### Design a web search engine

A web search engine is a pipeline of five loosely coupled stages: crawl, index,
query, rank, and serve.

- The crawler discovers URLs via link extraction and a frontier queue, fetches
  pages with a politeness layer (per-host rate limits), and stores raw HTML in a
  page store such as an object store backed by a deduplicated blob system.
- The indexer parses the raw pages — tokenization, normalization, stop-word
  handling, language detection — and writes terms into a distributed inverted
  index (Google's is called BigTable-like columnar stores; open implementations
  use Lucene/Elasticsearch).
- The query path parses the user query, resolves synonyms and spell corrections,
  looks up posting lists in the inverted index, and produces a candidate set.

Ranking sits between retrieval and serving.

- Candidates are scored with a mix of lexical signals (TF–IDF/BM25), link
  analysis (PageRank over a link graph), and learned models (RankSVM,
  gradient-boosted trees, neural retrievers) computed offline as
  query-independent and online as query-dependent features.
- The front end caches popular results in a result cache and serves autocomplete
  from a trie-based suggestion service.
- All queries flow to query analytics for query log mining, which feeds back
  into spelling, ranking, and suggestion quality.
- The whole system must tolerate partial index failures, so the index is
  replicated and sharded, and queries degrade gracefully by falling back to
  fewer shards under load.

### How do you build and update the inverted index?

The inverted index maps each term to a posting list — a sorted list of document
IDs with frequencies and positions.

- Building it is a batch MapReduce-style job: the indexer tokenizes each page,
  emits (term, docID) pairs, and a reduce phase merges postings by term and
  writes them into sorted segments.
- Documents are stored in the page store and addressed by an internal 64-bit
  docID.
- The index is sharded by term range across index servers and replicated for
  redundancy and query fan-out.

Fresh content requires two paths: a full rebuild for new shards and
near-real-time updates.

- New documents are appended into small in-memory buffers that periodically
  flush to new segments, and old segments are compacted in the background; a
  per-shard refresh interval (e.g., seconds) makes fresh documents visible while
  queries still read from a consistent snapshot.

Deliberate design choices keep the index healthy.

- Posting lists are compressed (delta-encoding docIDs and varint/frame-of-
  reference encoding) to reduce IO and memory.
- Deletions and updates are handled with tombstones and re-crawls rather than
  in-place edits.
- A delete queue marks removed documents, and compaction sweeps them.
- Because crawlers are continuous, the index is never complete — it is always a
  moving window over the web.
- Monitoring tracks the average index freshness (lag between page fetch and
  queryable), the segment count, and the merge backlog; if merges fall behind,
  query latency degrades, so tuning the compaction policy is a first-class
  operational concern.

### How do you rank search results at scale?

Ranking is split into two phases to bound cost.

- Retrieval (top-k candidate generation) uses the inverted index to fetch the
  most promising documents with cheap scoring — conjunctive or disjunctive query
  evaluation over posting lists with a heap of the top k — because full scoring
  over millions of postings is infeasible per query.
- Then a scoring/reranking phase computes expensive features on the top ~1,000
  candidates: static features (PageRank, page quality, freshness) are
  precomputed offline and stored alongside the index, while query-dependent
  features (BM25, term proximity, exact-phrase matches, click-through
  statistics) are computed at query time.
- A lightweight scorer (e.g., linear combination or a small tree model) sorts
  the top results for the snippet stage; heavy neural rankers are reserved for
  the top 10–100 when compute budget allows.

Scale comes from sharding and parallelism.

- The index is partitioned across many machines, each returns its local top-k,
  and a coordinating layer merges partial results with rank-based merging.
- Static scores like PageRank are computed offline by iterating the link graph
  with a random-walk algorithm (power iteration over a sparse adjacency matrix,
  typically in MapReduce), so they add zero query-time cost.
- The ranker must also mix diverse sources — news, images, videos — via result
  merging and deduplication so a single domain does not dominate.
- Because click data is the ground truth for relevance, every result click is
  logged and periodically re-mines ranking features; this closes the loop that
  improves ranking models without touching query latency.

### How do you serve autocomplete suggestions?

Autocomplete is a prefix problem: given a typed prefix, return the top N
completions fast.

- The standard structure is a compact trie over a frequency-ranked dictionary,
  where each trie node stores the top completions for that prefix (precomputed)
  so lookups are O(prefix length) and can be answered from a single node.
- Because the dictionary is large, the trie is sharded by prefix range across
  suggestion servers and loaded from a replicated snapshot, with an in-memory
  read-optimized representation for cache-friendly traversal.
- Suggestions are generated offline from query logs: frequent and trending
  queries are weighted by count, recency, and geographic context, then filtered
  for safety before being indexed into the trie.

Hot paths matter because users fire a request per keystroke.

- The client debounces and sends only the final few keystrokes; the gateway
  reads a small cached prefix set (e.g., top-10 for each prefix) rather than
  computing on the fly.
- A distributed cache (e.g., Redis or a CDN-style edge cache) absorbs repeats,
  since most prefixes follow a power-law distribution.
- Personalization and context (location, language, history) refine the ranked
  completions at query time by reordering the precomputed list.
- Because users keep typing, incremental updates rebuild the trie in the
  background and hot-swap it without downtime; the result is sub-millisecond
  suggestion latency while the underlying dictionary evolves every few minutes.

### How do you handle cache misses and hot queries?

Query traffic is heavily skewed — a small number of hot queries generate most of
the load — so caching is the primary defense.

- A multilevel cache sits in front of the ranking pipeline: an edge/HTTP cache
  for identical queries, then a result cache (e.g., Redis or Memcached) keyed by
  normalized query plus filters (language, region, safe-search), storing
  serialized result pages with a short TTL.
- Since ranking is expensive, only the final result page is cached, and
  near-identical queries are collapsed by normalization (lowercasing, stemming,
  dedup of whitespace).
- Cache misses fall through to the full query pipeline; to protect the backend
  from a thundering herd on a popular cache-expired query, only one request
  computes the result and the rest either wait on a short lease or are served a
  slightly stale cached copy.

Hot-query and hot-shard management are about containment.

- A single extremely hot term (a trending event) can overload the index shard
  owning that posting list; mitigations include replicating hot shards, caching
  the posting lists of popular terms in memory across replicas, and shedding
  load by serving cached results with relaxed freshness.
- A circuit breaker monitors shard latency and auto-degrades — for example,
  falling back to a narrower candidate set or skipping expensive rerank features
  — while an analytics stream tracks miss rates per shard to drive rebalancing.
- Capacity is sized so that the combined cache hit rate keeps backend CPU low;
  monitoring miss-rate spikes is the early warning that a cache key design is
  fragmenting traffic or a news event has arrived.

## Source

```text
title: Web Search
node user: User [round, icon=browser]
node app: Search App [icon=browser]
node gateway: API Gateway [icon=server]
node crawler: Web Crawler [icon=worker]
node indexer: Indexer [icon=compute]
node index: Inverted Index [cylinder, icon=search]
node store: Page Store [cylinder, icon=database]
node query: Query Engine [icon=search]
node rank: Ranking Service [icon=compute]
node cache: Result Cache [cylinder, icon=cache]
node suggest: Autocomplete [icon=search]
node analytics: Query Analytics [icon=worker]
node graph: Link Graph [cylinder, icon=users]

edge user -> app: search query
edge app -> gateway: query
edge gateway -> query: parse
edge query -> index: lookup
edge index -> query: candidates
edge query -> rank: score
edge rank -> gateway: results
edge gateway -> cache: cache results
edge gateway -> suggest: prefixes
edge crawler -> store: raw pages
edge crawler -> indexer: content
edge indexer -> index: terms
edge indexer -> graph: links
edge query -> analytics: log
```

## Q&A

### Q: Design a web search engine

**A:** A web search engine is a pipeline of five loosely coupled stages: crawl, index,
query, rank, and serve.

- The crawler discovers URLs via link extraction and a frontier queue, fetches
  pages with a politeness layer (per-host rate limits), and stores raw HTML in a
  page store such as an object store backed by a deduplicated blob system.
- The indexer parses the raw pages — tokenization, normalization, stop-word
  handling, language detection — and writes terms into a distributed inverted
  index (Google's is called BigTable-like columnar stores; open implementations
  use Lucene/Elasticsearch).
- The query path parses the user query, resolves synonyms and spell corrections,
  looks up posting lists in the inverted index, and produces a candidate set.

Ranking sits between retrieval and serving.

- Candidates are scored with a mix of lexical signals (TF–IDF/BM25), link
  analysis (PageRank over a link graph), and learned models (RankSVM,
  gradient-boosted trees, neural retrievers) computed offline as
  query-independent and online as query-dependent features.
- The front end caches popular results in a result cache and serves autocomplete
  from a trie-based suggestion service.
- All queries flow to query analytics for query log mining, which feeds back
  into spelling, ranking, and suggestion quality.
- The whole system must tolerate partial index failures, so the index is
  replicated and sharded, and queries degrade gracefully by falling back to
  fewer shards under load.

### Q: How do you build and update the inverted index?

**A:** The inverted index maps each term to a posting list — a sorted list of document
IDs with frequencies and positions.

- Building it is a batch MapReduce-style job: the indexer tokenizes each page,
  emits (term, docID) pairs, and a reduce phase merges postings by term and
  writes them into sorted segments.
- Documents are stored in the page store and addressed by an internal 64-bit
  docID.
- The index is sharded by term range across index servers and replicated for
  redundancy and query fan-out.

Fresh content requires two paths: a full rebuild for new shards and
near-real-time updates.

- New documents are appended into small in-memory buffers that periodically
  flush to new segments, and old segments are compacted in the background; a
  per-shard refresh interval (e.g., seconds) makes fresh documents visible while
  queries still read from a consistent snapshot.

Deliberate design choices keep the index healthy.

- Posting lists are compressed (delta-encoding docIDs and varint/frame-of-
  reference encoding) to reduce IO and memory.
- Deletions and updates are handled with tombstones and re-crawls rather than
  in-place edits.
- A delete queue marks removed documents, and compaction sweeps them.
- Because crawlers are continuous, the index is never complete — it is always a
  moving window over the web.
- Monitoring tracks the average index freshness (lag between page fetch and
  queryable), the segment count, and the merge backlog; if merges fall behind,
  query latency degrades, so tuning the compaction policy is a first-class
  operational concern.

### Q: How do you rank search results at scale?

**A:** Ranking is split into two phases to bound cost.

- Retrieval (top-k candidate generation) uses the inverted index to fetch the
  most promising documents with cheap scoring — conjunctive or disjunctive query
  evaluation over posting lists with a heap of the top k — because full scoring
  over millions of postings is infeasible per query.
- Then a scoring/reranking phase computes expensive features on the top ~1,000
  candidates: static features (PageRank, page quality, freshness) are
  precomputed offline and stored alongside the index, while query-dependent
  features (BM25, term proximity, exact-phrase matches, click-through
  statistics) are computed at query time.
- A lightweight scorer (e.g., linear combination or a small tree model) sorts
  the top results for the snippet stage; heavy neural rankers are reserved for
  the top 10–100 when compute budget allows.

Scale comes from sharding and parallelism.

- The index is partitioned across many machines, each returns its local top-k,
  and a coordinating layer merges partial results with rank-based merging.
- Static scores like PageRank are computed offline by iterating the link graph
  with a random-walk algorithm (power iteration over a sparse adjacency matrix,
  typically in MapReduce), so they add zero query-time cost.
- The ranker must also mix diverse sources — news, images, videos — via result
  merging and deduplication so a single domain does not dominate.
- Because click data is the ground truth for relevance, every result click is
  logged and periodically re-mines ranking features; this closes the loop that
  improves ranking models without touching query latency.

### Q: How do you serve autocomplete suggestions?

**A:** Autocomplete is a prefix problem: given a typed prefix, return the top N
completions fast.

- The standard structure is a compact trie over a frequency-ranked dictionary,
  where each trie node stores the top completions for that prefix (precomputed)
  so lookups are O(prefix length) and can be answered from a single node.
- Because the dictionary is large, the trie is sharded by prefix range across
  suggestion servers and loaded from a replicated snapshot, with an in-memory
  read-optimized representation for cache-friendly traversal.
- Suggestions are generated offline from query logs: frequent and trending
  queries are weighted by count, recency, and geographic context, then filtered
  for safety before being indexed into the trie.

Hot paths matter because users fire a request per keystroke.

- The client debounces and sends only the final few keystrokes; the gateway
  reads a small cached prefix set (e.g., top-10 for each prefix) rather than
  computing on the fly.
- A distributed cache (e.g., Redis or a CDN-style edge cache) absorbs repeats,
  since most prefixes follow a power-law distribution.
- Personalization and context (location, language, history) refine the ranked
  completions at query time by reordering the precomputed list.
- Because users keep typing, incremental updates rebuild the trie in the
  background and hot-swap it without downtime; the result is sub-millisecond
  suggestion latency while the underlying dictionary evolves every few minutes.

### Q: How do you handle cache misses and hot queries?

**A:** Query traffic is heavily skewed — a small number of hot queries generate most of
the load — so caching is the primary defense.

- A multilevel cache sits in front of the ranking pipeline: an edge/HTTP cache
  for identical queries, then a result cache (e.g., Redis or Memcached) keyed by
  normalized query plus filters (language, region, safe-search), storing
  serialized result pages with a short TTL.
- Since ranking is expensive, only the final result page is cached, and
  near-identical queries are collapsed by normalization (lowercasing, stemming,
  dedup of whitespace).
- Cache misses fall through to the full query pipeline; to protect the backend
  from a thundering herd on a popular cache-expired query, only one request
  computes the result and the rest either wait on a short lease or are served a
  slightly stale cached copy.

Hot-query and hot-shard management are about containment.

- A single extremely hot term (a trending event) can overload the index shard
  owning that posting list; mitigations include replicating hot shards, caching
  the posting lists of popular terms in memory across replicas, and shedding
  load by serving cached results with relaxed freshness.
- A circuit breaker monitors shard latency and auto-degrades — for example,
  falling back to a narrower candidate set or skipping expensive rerank features
  — while an analytics stream tracks miss rates per shard to drive rebalancing.
- Capacity is sized so that the combined cache hit rate keeps backend CPU low;
  monitoring miss-rate spikes is the early warning that a cache key design is
  fragmenting traffic or a news event has arrived.

## Source

```text
title: Web Search
node user: User [round, icon=browser]
node app: Search App [icon=browser]
node gateway: API Gateway [icon=server]
node crawler: Web Crawler [icon=worker]
node indexer: Indexer [icon=compute]
node index: Inverted Index [cylinder, icon=search]
node store: Page Store [cylinder, icon=database]
node query: Query Engine [icon=search]
node rank: Ranking Service [icon=compute]
node cache: Result Cache [cylinder, icon=cache]
node suggest: Autocomplete [icon=search]
node analytics: Query Analytics [icon=worker]
node graph: Link Graph [cylinder, icon=users]

edge user -> app: search query
edge app -> gateway: query
edge gateway -> query: parse
edge query -> index: lookup
edge index -> query: candidates
edge query -> rank: score
edge rank -> gateway: results
edge gateway -> cache: cache results
edge gateway -> suggest: prefixes
edge crawler -> store: raw pages
edge crawler -> indexer: content
edge indexer -> index: terms
edge indexer -> graph: links
edge query -> analytics: log
```
