import type { Problem } from '../types';

export const urlShortener: Problem = {
  slug: 'url-shortener',
  title: 'URL shortener',
  tagline: 'Turn long URLs into short links and redirect billions of clicks with low latency.',
  difficulty: 'Easy',
  tags: ['Key generation', 'Caching', 'Sharding'],
  group: 'foundations',
  functional: [
    'Create a short link from a long URL, with an optional custom alias and expiry date.',
    'Redirect a short link to its long URL.',
    'Track basic click analytics.',
    'Delete or expire links.',
  ],
  nonFunctional: [
    'Redirects must be fast: p99 under 100 ms.',
    'Highly available. Reads outnumber writes by roughly 100 to 1.',
    'Short keys should not be easy to enumerate.',
    'Mappings must be durable.',
  ],
  estimation: [
    '100M new URLs per month is about 40 writes per second.',
    'At 100:1 reads to writes that is about 4,000 redirects per second on average, and 10x that at peak.',
    '500 bytes per record, 100M records per month, kept 5 years: about 3 TB.',
    'A 7-character base62 key gives 62^7, about 3.5 trillion keys. Plenty.',
  ],
  diagram: `flowchart LR
  subgraph Write
    WC[Client] --> GW[API gateway] --> CS[Create service] --> KG[Key generator]
    CS --> KV[(Sharded KV store)]
  end
  subgraph Read
    RC[Client] --> CDN[CDN] --> RS[Redirect service] --> CACHE[(Redis cache)]
    RS --> KAFKA[Kafka] --> ANALYTICS[Click analytics]
  end`,
  design: [
    {
      title: 'Generating the short key',
      body: 'There are three common options.\n\n**Hash the URL** (MD5 or SHA-256, keep the first 7 base62 characters). It is stateless, but collisions are possible, so you must check the store and re-hash with a salt on conflict.\n\n**Counter plus base62.** Encode an incrementing integer. Collisions are impossible, but a single counter is a bottleneck. Hand each app server a block of IDs (for example 1M at a time) from ZooKeeper or a database row, and let it allocate locally.\n\n**Pre-generated key service.** A separate service fills a table of unused random keys and hands them out. Simple at read time, at the cost of one more component.\n\nA good default is range-allocated counters, with the integer scrambled (for example a Feistel permutation) so links are not guessable in sequence.',
    },
    {
      title: 'Redirect path',
      body: 'The read path is latency-critical. The short key is looked up in an in-memory Redis cache first. On a miss, the service falls back to the sharded KV store (for example DynamoDB or Cassandra) and backfills the cache. The redirect response is a 301 or 302 with the long URL in the Location header. Keep the response body empty and the headers minimal.',
    },
    {
      title: 'Analytics',
      body: 'Click events are fire-and-forget. The redirect service publishes to Kafka; a stream processor aggregates counts per key and window. The analytics API reads from a materialised view. This keeps the redirect path fast and decouples analytics scale from redirect scale.',
    },
  ],
  qa: [
    {
      q: 'How do you handle custom aliases?',
      a: 'Store them in the same KV store with a reserved prefix. On create, check the alias is not taken. On redirect, try the custom alias namespace first, then the generated key namespace.',
    },
    {
      q: 'What if the KV store is down?',
      a: 'The redirect service should have a local fallback cache of hot keys (top 1% by traffic). If both Redis and the KV store are unreachable, return a 503 with a retry-after header so clients back off gracefully.',
    },
    {
      q: 'How do you expire links?',
      a: 'Store a TTL with each record. A background job scans for expired keys and deletes them. On redirect, if the key is expired, return 410 Gone.',
    },
  ],
};
