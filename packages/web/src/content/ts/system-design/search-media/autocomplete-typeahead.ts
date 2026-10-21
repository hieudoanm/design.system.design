import type { Problem } from '../types';

export const autocompleteTypeahead: Problem = {
  slug: 'autocomplete-typeahead',
  title: 'Autocomplete / typeahead',
  tagline:
    'Return ranked suggestions in under 50 ms as the user types, with typo tolerance and personalization.',
  difficulty: 'Medium',
  tags: ['Trie', 'Inverted index', 'Ranking', 'Cache'],
  group: 'search-media',
  functional: [
    'Return up to 10 suggestions per keystroke.',
    'Support prefix matching, typo tolerance (edit distance ≤ 2), and synonyms.',
    'Personalize: boost recent/frequent queries for the user.',
    'Freshness: new trending queries appear within minutes.',
  ],
  nonFunctional: [
    'p99 latency under 50 ms (including network).',
    'Handle 100K QPS peak, 10B queries/day.',
    'Index updates (new queries, trend changes) visible within 1 minute.',
    'Graceful degradation: if personalization fails, fall back to global ranking.',
  ],
  estimation: [
    '10B queries/day = 115K QPS average, 500K QPS peak.',
    'Unique query corpus: ~100M terms. Trie fits in memory (~2 GB).',
    'Hot prefix cache (top 1M prefixes) serves 80% of requests.',
    'Suggester sharded by prefix hash; 16 shards for throughput.',
  ],
  diagram: `flowchart LR
  CLIENT[Client] --> GW[API gateway] --> SUGG[Suggester] --> TRIE[Trie service]
  TRIE --> HOT[Hot prefix cache]
  TRIE --> CAND[Candidates]
  SUGG --> RANK[Ranker] --> PERS[Personalization]
  PERS --> RESP[Response]`,
  design: [
    {
      title: 'Data structure: Trie + inverted index',
      body: 'The core is a compressed trie (radix tree) storing all prefixes. Each node holds the top-K suggestion IDs (pre-ranked globally). For typo tolerance, a secondary inverted index maps n-grams (trigrams) to query IDs; at query time, generate typo variants, look up candidates, and merge. The trie is rebuilt daily from query logs; hot prefixes are cached in Redis.',
    },
    {
      title: 'Ranking',
      body: 'Global score = f(frequency, recency, CTR, freshness boost). Personalization adds user-specific signals: past selections, location, language, time of day. The ranker runs in the suggester service (not the trie) so it can be updated independently. Top 10 are returned.',
    },
    {
      title: 'Sharding and caching',
      body: 'The trie is sharded by prefix hash (first 2-3 characters). Each shard is a separate service instance with its own in-memory trie. A hot prefix cache (Redis) stores the top-10 for the most frequent 1M prefixes, serving 80% of requests without hitting the trie. Cache TTL = 1 hour; invalidated on trie rebuild.',
    },
    {
      title: 'Freshness pipeline',
      body: 'Query logs stream to Kafka → Flink/Spark Streaming counts frequencies per 5-min window → writes to a "trending" table. The trie rebuild job reads this table daily. For intra-day freshness, a small "delta trie" holds new trending queries and is merged at query time.',
    },
  ],
  qa: [
    {
      q: 'How do you handle multi-language?',
      a: 'Separate trie per language (detected from Accept-Language or user setting). Unicode normalization (NFKC) before indexing. For CJK, use n-gram index instead of character trie.',
    },
    {
      q: 'What if the trie rebuild takes too long?',
      a: 'Build the new trie in a staging shard, then atomically swap the pointer. Zero-downtime deploy. The old trie stays until all in-flight requests finish.',
    },
    {
      q: 'How do you prevent suggestion injection attacks?',
      a: 'Only index queries that resulted in a click (CTR > threshold). Rate-limit per IP. Human review for suspicious spikes.',
    },
  ],
};
