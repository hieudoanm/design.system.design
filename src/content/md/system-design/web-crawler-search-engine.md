# Web crawler

Crawl the web politely, index it, and answer queries from an inverted index.

**Difficulty:** Easy

**Tags:** cache, crawler, search

## Functional Requirements

- Crawl from seed URLs and follow discovered links.
- Respect robots.txt and per-host politeness.
- Parse, deduplicate and index page content.
- Answer queries from the inverted index, ranked.

## Non-Functional Requirements

- One request per host every few seconds, never more.
- Tens of billions of pages, re-crawled on a schedule.
- Breaking news is re-indexed within minutes.
- A query answers in under 200 ms p99.

## Estimation

- 10B pages re-crawled monthly is about 4k pages per second, 40k at peak.
- At 1 MB per page that is 10 PB of raw content, so the index is compressed and partitioned.
- The URL frontier holds 10B URLs at 100 bytes each, about 1 TB.
- 10B documents of posting lists is about 100 TB, served sharded with replicas.

## Architecture Diagram

```text
 Seeds ─► URL frontier ─► Fetcher ─► Extractor ─► Indexer ─► Inverted index
              ▲             │           │              │           │
              │             │           └─► Page DB    └─► dedupe  │
              └─ new links ─┴───────────────────────────────────────┘

 Client ─► Query API ─► Ranking service ─► Inverted index (sharded)
                              └─► Result cache
```

## Design

### Overview

The crawler decomposes into a small set of components.

- URL frontier — a distributed priority queue.
- Fetchers that download pages.
- An extractor that parses HTML into clean text and new links.
- An indexer that builds an inverted index.
- A page DB storing raw HTML and content hashes.
- A ranking service.

The pipeline runs in a loop.

- The frontier yields URLs.
- Fetchers download with bounded concurrency.
- The extractor feeds new links back and hands content to the indexer and page
  DB.

Scale comes from partitioning, deduplication, and scheduling.

- Partition the frontier by hostname hash so each domain is pinned to one
  fetcher (politeness).
- Add fetchers horizontally.
- Use bloom filters to avoid re-enqueuing seen URLs.
- Re-crawling is scheduled by page importance and change frequency.
- Monitor crawl rate, per-domain errors, and queue depth.

## Q&A

### Q: How do you manage the URL frontier and politeness?

The frontier is a distributed priority queue sharded by hostname.

- Each domain gets its own FIFO queue so a crawler only has one in-flight
  request per host at a time.

Politeness rules keep the crawler welcome on target sites.

- Parse `robots.txt` and honor `Disallow` and `Crawl-delay`.
- Enforce a minimum delay (often a few seconds) between requests to the same
  host.
- Rotate through many hosts concurrently to keep aggregate throughput high.

Sharding, priorities, and dedup keep the queue healthy.

- Consistent hashing assigns each domain to a fixed fetcher, which keeps
  per-host timing state local and prevents two workers racing the same site.
- Frontier priorities weight pages by importance (seed pages, inlink count,
  change frequency) so high-value URLs crawl first.
- Bloom filters dedupe enqueued URLs to keep queues lean.

### Q: How do you detect duplicate pages across the web?

First canonicalize each page.

- Normalize the URL — strip tracking params and resolve redirects.
- Normalize the content — remove whitespace, boilerplate, and markup.

Exact duplicates are found by hashing normalized content.

- Hash normalized content (e.g., SHA-256) and look the hash up in a distributed
  store.
- A bloom filter in front makes most lookups cheap without touching storage.

Near-duplicates — pages with slight template differences — need fuzzy
techniques.

- Shingling: sets of fixed-size token windows with Jaccard similarity.
- Simhash with a Hamming-distance threshold.
- MinHash + LSH scales this to billions of pages.
- Simhash updates are incremental and efficient.

Duplicates are grouped under a canonical representative.

- The index stores one version and search results dedupe.

### Q: Design an inverted index for full-text search

Build postings lists over normalized documents.

- Tokenize and normalize documents — lowercase, stemming, stopword removal.
- Build postings lists of the form term to (docID, term frequency, positions).

The index is sharded and log-structured.

- Partition the index either by term or by document range; each shard holds its
  own segment files plus an in-memory mapping for hot terms.
- The indexer batches new documents and writes immutable segments, merging them
  log-structured (LSM-style) so lookups stay fast and memory stays bounded.
- Updates go to new segments with tombstones rather than in-place mutation.

Queries and caching keep lookups fast.

- Queries intersect or union postings lists, using skip pointers for faster
  intersections.
- Position data enables phrase queries; docID-sorted postings enable
  doc-at-a-time scoring.
- Cache the postings of hot terms and top results per query.

### Q: How do you rank and cache query results at scale?

Ranking blends lexical and popularity signals.

- Lexical scores from BM25, using TF/IDF statistics stored with each postings
  list.
- Popularity signals like PageRank and freshness.
- At query time you compute a candidate set, score the top candidates
  doc-at-a-time, and return the top-K.

A result cache sits in front to serve high QPS.

- Key by normalized query (plus filters and locale).
- Cache the top-K doc IDs and snippets with LRU and a short TTL.
- Pin the hottest queries in memory so they never touch the index.
- This absorbs query skew — a small set of queries generates most traffic.
- Version cache keys when the index changes significantly, and shard by query
  hash across instances.

## Source

```text
title: Web Crawler
node client: Client [round, icon=browser]
node api: Query API [icon=server]
node crawler: Crawler [icon=worker]
node frontier: URL Frontier [icon=queue]
node fetcher: Fetcher [icon=server]
node extractor: Extractor [icon=file]
node indexer: Indexer [icon=compute]
node index: Inverted Index [cylinder, icon=search]
node rank: Ranking Service [icon=sync]
node cache: Result Cache [cylinder, icon=cache]
node db: Page DB [cylinder, icon=database]

edge crawler -> frontier: next urls
edge frontier -> fetcher: fetch
edge fetcher -> extractor: parse html
edge extractor -> frontier: new links
edge extractor -> indexer: content
edge indexer -> index: build
edge indexer -> db: store
edge client -> api: search
edge api -> rank: query
edge rank -> index: lookup
edge rank -> cache: cached results
edge rank -> api: ranked results
```

## Source

```text
title: Web Crawler
node client: Client [round, icon=browser]
node api: Query API [icon=server]
node crawler: Crawler [icon=worker]
node frontier: URL Frontier [icon=queue]
node fetcher: Fetcher [icon=server]
node extractor: Extractor [icon=file]
node indexer: Indexer [icon=compute]
node index: Inverted Index [cylinder, icon=search]
node rank: Ranking Service [icon=sync]
node cache: Result Cache [cylinder, icon=cache]
node db: Page DB [cylinder, icon=database]

edge crawler -> frontier: next urls
edge frontier -> fetcher: fetch
edge fetcher -> extractor: parse html
edge extractor -> frontier: new links
edge extractor -> indexer: content
edge indexer -> index: build
edge indexer -> db: store
edge client -> api: search
edge api -> rank: query
edge rank -> index: lookup
edge rank -> cache: cached results
edge rank -> api: ranked results
```
