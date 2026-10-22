import type { Problem } from './types';

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
  diagram: ` WRITE   Client ─► API gateway ─► Create service ─► Key generator
                                        │
                                        ▼
                                 Sharded KV store
                                 (short key ─► long URL)
                                        ▲
                                        │ cache miss
 READ    Client ─► CDN ─► Redirect service ─► Redis cache
                                │
                                └─► Kafka ─► click analytics`,
  design: [
    {
      title: 'Generating the short key',
      body: 'There are three common options.\n\n**Hash the URL** (MD5 or SHA-256, keep the first 7 base62 characters). It is stateless, but collisions are possible, so you must check the store and re-hash with a salt on conflict.\n\n**Counter plus base62.** Encode an incrementing integer. Collisions are impossible, but a single counter is a bottleneck. Hand each app server a block of IDs (for example 1M at a time) from ZooKeeper or a database row, and let it allocate locally.\n\n**Pre-generated key service.** A separate service fills a table of unused random keys and hands them out. Simple at read time, at the cost of one more component.\n\nA good default is range-allocated counters, with the integer scrambled (for example a Feistel permutation) so links are not guessable in sequence.',
    },
    {
      title: 'Storage',
      body: 'The data is a plain key-value mapping: `short_key` to `{long_url, created_at, expires_at, owner}`. There are no joins, so a sharded key-value store such as DynamoDB or Cassandra fits well. A sharded relational database also works. Shard by a hash of the short key so load spreads evenly.',
    },
    {
      title: 'The redirect path',
      body: 'Check the cache first (Redis, with an LRU policy), then the store. Link popularity follows a power law, so a small cache serves most traffic. Popular links can also be cached at the CDN edge.\n\nUse **301** if you want browsers to cache the redirect and cut load, or **302/307** if every click must reach you, for analytics or for the ability to change the target later.',
    },
    {
      title: 'Analytics without slowing redirects',
      body: 'Never write to the database on the redirect path. Emit a click event to Kafka and aggregate it with a stream job. Counts are eventually consistent, which is fine for this use.',
    },
  ],
  qa: [
    {
      q: 'How do you generate unique short keys without collisions?',
      a: 'Use a counter that cannot collide and encode it in base62. To avoid a single point of contention, allocate ID ranges to each app server from a coordination service, so most allocations are local and need no network call. If you prefer hashing, you must detect collisions with a lookup and retry with a salt.',
    },
    {
      q: 'Should the redirect be a 301 or a 302?',
      a: 'A 301 is permanent, so browsers and intermediaries cache it. That reduces your load but hides later clicks from your analytics and makes the target hard to change. A 302 (or 307) is temporary, so every click comes back through your service. Most products that sell analytics use 302.',
    },
    {
      q: 'How do you handle a link that suddenly goes viral?',
      a: 'Serve it from the edge. CDN caching absorbs most of the traffic. Behind that, keep a small in-process cache on each redirect server and replicate hot keys across Redis nodes. Request coalescing makes sure a thundering herd of misses triggers only one database read.',
    },
    {
      q: 'How would you shard the database?',
      a: 'Hash the short key and map it to a shard with consistent hashing. This spreads load evenly. Sharding by key range would create hotspots, because new links all get recent, sequential-looking keys.',
    },
    {
      q: 'How do expiry and cleanup work?',
      a: 'Store `expires_at` with each record and check it on read, so expired links stop working immediately. Remove the data lazily or with a background sweeper. Stores with native TTL, such as DynamoDB and Cassandra, can do it for you. Be careful about recycling old keys, since someone may still hold the old link.',
    },
  ],
};
