import type { Problem } from './types';

export const autocompleteTypeahead: Problem = {
  slug: 'autocomplete-typeahead',
  title: 'Typeahead',
  tagline: 'Suggest the top queries for a prefix while the user is still typing.',
  difficulty: 'Easy',
  tags: ['cache', 'search'],
  functional: [
    'Return the top-k suggestions for every prefix.',
    'Rank by popularity, recency and personalisation.',
    'Learn from query logs and filter unsafe suggestions.',
    'Tolerate small typos.',
  ],
  nonFunctional: [
    'Suggestions arrive in under 50 ms p99, from memory.',
    'Thousands of prefix requests per second at peak.',
    'New trends show up within minutes, not days.',
    'Hot prefixes are cached, because prefix traffic is extremely skewed.',
  ],
  estimation: [
    '10M searches a day with 5 keystrokes each is 50M prefix requests a day, about 580 per second.',
    'A trie of 100M queries with 20 characters each is a few GB, split across shards.',
    'Ten suggestions of 8 bytes per trie node is 80 bytes per node, so only hot nodes stay in cache.',
    'Query logs at 200 bytes per search are 2 GB a day, aggregated hourly.',
  ],
  diagram: ` Client ─► API gateway ─► Suggester ─► Trie service (sharded, in memory)
                             ▲ │             │
              hot prefixes   │ │             └─► candidates
                             │ ▼
                        Hot prefix cache
                             │
                             └─► Ranking worker ─► results

 Query log ─► hourly aggregation ─► Trie rebuild (offline)`,
  design: [
    {
      title: 'Overview',
      body: 'As the user types each keystroke, the client sends the current prefix to an API gateway, which routes to a Suggester service that returns the top-k completed phrases for that prefix.\n\n- The core data structure is a trie (prefix tree) keyed by the query text, where each node stores the aggregated popularity of the phrases beneath it so a prefix lookup returns the best candidates directly.\n- A Ranking Worker scores candidates from frequency signals.\n- A Hot Prefix Cache serves the most popular prefixes in microseconds without touching the trie.\n- After a user picks a suggestion, the client logs the selection to a Query Log.\n- An Indexer aggregates logs offline and periodically rebuilds the trie, so suggestions reflect real search behavior rather than a hand-maintained list.\n\nLatency is the defining constraint.\n\n- A typeahead fires on every keystroke, so the p95 target is in the tens of milliseconds and the read load is far higher than for normal search.\n- That means in-memory serving, aggressive caching, and asynchronous writes.\n- The write path (logging, aggregation, rebuild) is eventually consistent and can lag by minutes or hours; the read path must never block on it.\n- Key trade-offs: memory (a full trie is large, so compaction and distribution matter) versus freshness (rebuilding frequently keeps suggestions current but costs CPU and write amplification on the serving layer).',
    },
  ],
  qa: [
    {
      q: 'How do you return top-k suggestions for a prefix quickly?',
      a: 'The classic approach is a trie in which each node stores the top-k suggestions reachable from it, precomputed from the underlying frequencies.\n\n- A lookup then walks down the trie along the typed prefix (O(prefix length)) and reads the precomputed list at the terminal node — no traversal or sorting at query time, which is what keeps p95 latency at milliseconds even under heavy load.\n- For large data, the trie is built over a frequency-ordered dictionary so the top-k at each node is cheap to materialize, and stale-but-close lists are acceptable because a rebuild fixes them.\n\nTwo optimizations matter at scale.\n\n- First, a multi-tier cache: a hot-prefix cache (cache-aside on the full trie, keyed by prefix) absorbs the enormous skew — a small set of prefixes accounts for the majority of traffic.\n- Second, shorten the critical path: route by the first character or two to the shard owning that subtree, so each machine keeps a small trie and the lookup stays local.\n- Back-of-the-envelope: with ~1B distinct phrases you can fit the top-k lists (say top 10, 4 bytes per id plus length) compactly in a few tens of GB across the cluster, and each node answering in microseconds.\n- When a prefix has no results or the trie misses, fall back to the slightly relaxed prefix (last keystroke ignored) before returning an empty list.',
    },
    {
      q: 'How do you store the trie and scale reads?',
      a: 'The trie is an in-memory structure, but a node-per-character implementation is too memory-heavy.\n\n- One small object per character inflates memory by an order of magnitude.\n- Instead, store the trie in a compact, flat encoding — an array of nodes with fixed-width entries (child bitmap, offsets, and the top-k bucket) or a DAFSA (deterministic acyclic finite state automaton) that merges shared suffixes, cutting size by a large factor.\n- The frequency data lives in the same structure as integer ids and counts, never as strings, so nodes are small and cache-friendly.\n- Rebuilds produce a new immutable snapshot that is swapped in atomically, so readers never see a partially written trie.\n\nReads scale by sharding.\n\n- Partition the trie by the first few characters of the phrase, so each prefix routes deterministically to one shard and every shard is read-mostly and horizontally replicable.\n- Add replicas behind a load balancer and put a CDN or edge cache in front of the API gateway for the hottest prefixes, so the trie cluster only sees misses and long-tail queries.\n- Consistent hashing lets you add shards without a full rebuild.\n- A replication factor of 2–3 covers node loss.\n- Since reads are in-memory, throughput is bounded by networking rather than CPU, so co-locating the Suggester with the trie (same process) avoids a per-request RPC and roughly doubles capacity.',
    },
    {
      q: 'How do you keep suggestions fresh from query logs?',
      a: 'Freshness is a pipeline, not an inline write.\n\n- Every accepted suggestion (and raw search query) is written to a Query Log — a Kafka topic partitioned by phrase hash so all events for one phrase land on the same consumer.\n- An Indexer consumes the logs in batches, aggregates counts into a rolling window (e.g., last 7 days weighted toward recent activity), and merges them with the existing frequency distribution.\n- When the new model is ready, it rebuilds the compact trie snapshot and deploys it to all serving shards with an atomic swap.\n- The rebuild cadence trades staleness against cost: minutes for a burst-prone product, hours for a large index — and because the trie is immutable, deployment is a file copy plus a pointer flip.\n\nTwo details keep the pipeline correct.\n\n- First, dedupe and normalization: the same phrase typed as "starbucks", "starbucks.", and "starbucks near me" must collapse into one node, or the counts fragment and top-k quality drops; normalize at ingest time (lowercase, strip punctuation, trim).\n- Second, guard against manipulation and noise: a spammer hammering a phrase can boost it into every prefix\'s top-k, so apply per-user caps, bot detection, and a minimum-count threshold before a phrase becomes eligible.\n- On the serving side, add a lease/expiry to cached lists so a hot-prefix cache never outlives the rebuild.\n- Between rebuilds, allow real-time popularity (a small deltas structure overlaid on the static trie) so breaking news still surfaces immediately.',
    },
    {
      q: 'How do you handle typos and personalization?',
      a: 'Typos require going beyond exact-prefix matching.\n\n- A pragmatic approach is a second structure with edit-distance support: index phrases by a few clever keys such as n-gram shingles (bigrams/trigrams) or a BK-tree, then when the trie returns too few results for a prefix, generate small edit-distance variants of the typed prefix and look each up in the trie.\n- Better, build a fuzzy trie that walks characters while allowing one or two insertions, deletions, or substitutions, producing candidates ranked by both edit distance and popularity so a correct but rare suggestion beats a wrong but popular one.\n- Also treat common misspellings directly: keep a misspelling-to-canonical mapping learned from the query log itself, since users repeatedly type the same mistakes.\n- The cost is latency and memory, so fuzzy lookup is only triggered when the exact path under-serves.\n\nPersonalization ranks candidates relative to the user instead of the global counts.\n\n- Compute per-user or per-segment frequencies (a compact user-model: recent queries, clicked phrases, categorical affinities) and blend them into the global score — e.g., `score = w1 * global_popularity + w2 * user_affinity`, with the weights tuned so a user\'s frequent destinations jump ahead of the global list without flooding it.\n- Locale and geo context are the simplest, highest-value form: a query in NYC should rank "Pizza" by local popularity, so the trie is per-region or the scores are mixed with a location factor at query time.\n- The hard trade-offs are privacy (storing enough history to personalize without retaining raw queries too long) and latency (personalized scoring must still run inside the keystroke budget).\n- Resolve most personalization from a small per-user cache rather than a live join.',
    },
  ],
};
