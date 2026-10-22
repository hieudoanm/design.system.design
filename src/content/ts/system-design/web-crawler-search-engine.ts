import type { Problem } from './types';

export const webCrawlerSearchEngine: Problem = {
  slug: 'web-crawler-search-engine',
  title: 'Web crawler',
  tagline: 'Crawl the web politely, index it, and answer queries from an inverted index.',
  difficulty: 'Easy',
  tags: ['cache', 'crawler', 'search'],
  group: 'building-blocks',
  functional: [
    'Crawl from seed URLs and follow discovered links.',
    'Respect robots.txt and per-host politeness.',
    'Parse, deduplicate and index page content.',
    'Answer queries from the inverted index, ranked.',
  ],
  nonFunctional: [
    'One request per host every few seconds, never more.',
    'Tens of billions of pages, re-crawled on a schedule.',
    'Breaking news is re-indexed within minutes.',
    'A query answers in under 200 ms p99.',
  ],
  estimation: [
    '10B pages re-crawled monthly is about 4k pages per second, 40k at peak.',
    'At 1 MB per page that is 10 PB of raw content, so the index is compressed and partitioned.',
    'The URL frontier holds 10B URLs at 100 bytes each, about 1 TB.',
    '10B documents of posting lists is about 100 TB, served sharded with replicas.',
  ],
  diagram: ` Seeds ─► URL frontier ─► Fetcher ─► Extractor ─► Indexer ─► Inverted index
              ▲             │           │              │           │
              │             │           └─► Page DB    └─► dedupe  │
              └─ new links ─┴───────────────────────────────────────┘

 Client ─► Query API ─► Ranking service ─► Inverted index (sharded)
                              └─► Result cache`,
  design: [
    {
      title: 'Overview',
      body: 'The crawler decomposes into a small set of components.\n\n- URL frontier — a distributed priority queue.\n- Fetchers that download pages.\n- An extractor that parses HTML into clean text and new links.\n- An indexer that builds an inverted index.\n- A page DB storing raw HTML and content hashes.\n- A ranking service.\n\nThe pipeline runs in a loop.\n\n- The frontier yields URLs.\n- Fetchers download with bounded concurrency.\n- The extractor feeds new links back and hands content to the indexer and page DB.\n\nScale comes from partitioning, deduplication, and scheduling.\n\n- Partition the frontier by hostname hash so each domain is pinned to one fetcher (politeness).\n- Add fetchers horizontally.\n- Use bloom filters to avoid re-enqueuing seen URLs.\n- Re-crawling is scheduled by page importance and change frequency.\n- Monitor crawl rate, per-domain errors, and queue depth.',
    },
  ],
  qa: [
    {
      q: 'How do you manage the URL frontier and politeness?',
      a: 'The frontier is a distributed priority queue sharded by hostname.\n\n- Each domain gets its own FIFO queue so a crawler only has one in-flight request per host at a time.\n\nPoliteness rules keep the crawler welcome on target sites.\n\n- Parse `robots.txt` and honor `Disallow` and `Crawl-delay`.\n- Enforce a minimum delay (often a few seconds) between requests to the same host.\n- Rotate through many hosts concurrently to keep aggregate throughput high.\n\nSharding, priorities, and dedup keep the queue healthy.\n\n- Consistent hashing assigns each domain to a fixed fetcher, which keeps per-host timing state local and prevents two workers racing the same site.\n- Frontier priorities weight pages by importance (seed pages, inlink count, change frequency) so high-value URLs crawl first.\n- Bloom filters dedupe enqueued URLs to keep queues lean.',
    },
    {
      q: 'How do you detect duplicate pages across the web?',
      a: 'First canonicalize each page.\n\n- Normalize the URL — strip tracking params and resolve redirects.\n- Normalize the content — remove whitespace, boilerplate, and markup.\n\nExact duplicates are found by hashing normalized content.\n\n- Hash normalized content (e.g., SHA-256) and look the hash up in a distributed store.\n- A bloom filter in front makes most lookups cheap without touching storage.\n\nNear-duplicates — pages with slight template differences — need fuzzy techniques.\n\n- Shingling: sets of fixed-size token windows with Jaccard similarity.\n- Simhash with a Hamming-distance threshold.\n- MinHash + LSH scales this to billions of pages.\n- Simhash updates are incremental and efficient.\n\nDuplicates are grouped under a canonical representative.\n\n- The index stores one version and search results dedupe.',
    },
    {
      q: 'Design an inverted index for full-text search',
      a: 'Build postings lists over normalized documents.\n\n- Tokenize and normalize documents — lowercase, stemming, stopword removal.\n- Build postings lists of the form term to (docID, term frequency, positions).\n\nThe index is sharded and log-structured.\n\n- Partition the index either by term or by document range; each shard holds its own segment files plus an in-memory mapping for hot terms.\n- The indexer batches new documents and writes immutable segments, merging them log-structured (LSM-style) so lookups stay fast and memory stays bounded.\n- Updates go to new segments with tombstones rather than in-place mutation.\n\nQueries and caching keep lookups fast.\n\n- Queries intersect or union postings lists, using skip pointers for faster intersections.\n- Position data enables phrase queries; docID-sorted postings enable doc-at-a-time scoring.\n- Cache the postings of hot terms and top results per query.',
    },
    {
      q: 'How do you rank and cache query results at scale?',
      a: 'Ranking blends lexical and popularity signals.\n\n- Lexical scores from BM25, using TF/IDF statistics stored with each postings list.\n- Popularity signals like PageRank and freshness.\n- At query time you compute a candidate set, score the top candidates doc-at-a-time, and return the top-K.\n\nA result cache sits in front to serve high QPS.\n\n- Key by normalized query (plus filters and locale).\n- Cache the top-K doc IDs and snippets with LRU and a short TTL.\n- Pin the hottest queries in memory so they never touch the index.\n- This absorbs query skew — a small set of queries generates most traffic.\n- Version cache keys when the index changes significantly, and shard by query hash across instances.',
    },
  ],
};
