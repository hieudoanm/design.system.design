import type { Problem } from '../types';

export const webCrawlerSearchEngine: Problem = {
  slug: 'web-crawler-search-engine',
  title: 'Web crawler & search engine',
  tagline: 'Crawl the web, build an inverted index, and serve ranked search results at scale.',
  difficulty: 'Hard',
  tags: ['Crawler', 'Inverted index', 'Ranking', 'Distributed'],
  group: 'building-blocks',
  functional: [
    'Crawl billions of pages: fetch, parse, extract links, respect robots.txt.',
    'Build an inverted index: term → (doc_id, positions, tf-idf).',
    'Rank results: BM25 + PageRank + freshness + personalization.',
    'Serve queries with autocomplete, spelling correction, and snippets.',
    'Recrawl: prioritize by change frequency and importance.',
  ],
  nonFunctional: [
    'Crawl 10B pages, 100 TB raw HTML.',
    'Index update latency: new page searchable within 1 hour.',
    'Query p99 latency under 100 ms.',
    '99.9% availability for search API.',
  ],
  estimation: [
    '10B pages × 10 KB = 100 TB HTML. Compressed: 20 TB.',
    'Inverted index: 100B unique terms × avg 100 postings = 10T postings.',
    'Index size: ~5 PB (compressed, with positions).',
    'Crawl rate: 1M pages/sec = 86B pages/day (with politeness).',
  ],
  diagram: `flowchart LR
  subgraph CRAWL [Crawl]
    SEEDS[Seeds] --> FRONTIER[URL frontier] --> FETCHER[Fetcher]
    FETCHER --> EXTRACTOR[Extractor] --> INDEXER[Indexer] --> INV_IDX[(Inverted index)]
    EXTRACTOR -->|new links| FRONTIER
    FETCHER --> PAGE_DB[(Page DB)]
  end
  subgraph SEARCH [Search]
    CLIENT[Client] --> QAPI[Query API] --> RANK[Ranking service] --> INV_IDX
    RANK --> FEAT[Feature store] --> RESULTS[Results]
  end`,
  design: [
    {
      title: 'Crawler architecture',
      body: 'The URL frontier is a priority queue (by PageRank, freshness, politeness). Fetchers pull URLs, respect robots.txt and crawl-delay, fetch with conditional GET (ETag/Last-Modified), and parse HTML. The extractor emits (1) outlinks → frontier, (2) page content → indexer. The fetcher is distributed: each host is assigned to one fetcher (politeness), using consistent hashing.',
    },
    {
      title: 'Inverted index',
      body: 'The indexer tokenizes (language-specific), stems, and builds postings: term → list of (doc_id, positions, tf). The index is sharded by term (hash partitioning). Each shard is an LSM tree (like RocksDB) for write throughput. Merges compact postings and compute tf-idf. Positions enable phrase queries and proximity ranking.',
    },
    {
      title: 'Ranking',
      body: 'Query → rewrite (synonyms, spelling correction) → retrieve candidate docs from inverted index (top-K by BM25) → rerank with ML model (Learning to Rank: LambdaMART or neural). Features: BM25, PageRank, freshness, click-through rate, geo, personalization. The reranker runs on a GPU/TPU cluster. Top 10 returned with snippets (extracted from stored page content).',
    },
    {
      title: 'Recrawl and freshness',
      body: 'Pages have a recrawl priority: high PageRank + high change frequency = recrawl often. A change detector (checksum or content hash) avoids re-indexing unchanged pages. The frontier scheduler allocates crawl budget per host. Freshness SLA: news sites within minutes, static sites within days.',
    },
  ],
  qa: [
    {
      q: 'How do you handle duplicate content?',
      a: 'Simhash or MinHash near-deduplication at index time. Cluster near-duplicates; index only the canonical. At query time, collapse duplicates in results.',
    },
    {
      q: 'What about JavaScript-rendered pages?',
      a: 'Headless browser (Puppeteer/Playwright) for a subset of high-value sites. Render, wait for network idle, then extract. Expensive: run on a separate fleet with lower priority.',
    },
    {
      q: 'How do you scale the query path?',
      a: 'Inverted index shards are replicated (read replicas). Query fan-out: broadcast to all shards, each returns top-K local, coordinator merges. Cache hot queries (top 1M) in Redis. Autocomplete from a separate prefix trie.',
    },
  ],
};
