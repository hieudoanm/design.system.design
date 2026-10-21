# Autocomplete / Typeahead

Design a typeahead / autocomplete system

**Difficulty:** Easy

**Tags:** cache, search

## Functional Requirements

- a typeahead / autocomplete system
- return top-k suggestions for a prefix quickly?
- store the trie and scale reads?
- keep suggestions fresh from query logs?
- handle typos and personalization?

## Non-Functional Requirements

- As the user types each keystroke, the client sends the current prefix to an API
  gateway, which routes to a Suggester service that returns the top-k completed
  phrases for that prefix.

- The core data structure is a trie (prefix tree) keyed by the query text, where
  each node stores the aggregated popularity of the phrases beneath it so a
  prefix lookup returns the best candidates directly.
- A Ranking Worker scores candidates from frequency signals.
- A Hot Prefix Cache serves the most popular prefixes in microseconds without
  touching the trie.
- After a user picks a suggestion, the client logs the selection to a Query Log.
- An Indexer aggregates logs offline and periodically rebuilds the trie, so
  suggestions reflect real search behavior rather than a hand-maintained list.

Latency is the defining constraint.

- A typeahead fires on every keystroke, so the p95 target is in the tens of
  milliseconds and the read load is far higher than for normal search.
- That means in-memory serving, aggressive caching, and asynchronous writes.
- The write path (logging, aggregation, rebuild) is eventually consistent and
  can lag by minutes or hours; the read path must never block on it.
- Key trade-offs: memory (a full trie is large, so compaction and distribution
  matter) versus freshness (rebuilding frequently keeps suggestions current but
  costs CPU and write amplification on the serving layer)..
- The classic approach is a trie in which each node stores the top-k suggestions
  reachable from it, precomputed from the underlying frequencies.

- A lookup then walks down the trie along the typed prefix (O(prefix length))
  and reads the precomputed list at the terminal node — no traversal or sorting
  at query time, which is what keeps p95 latency at milliseconds even under
  heavy load.
- For large data, the trie is built over a frequency-ordered dictionary so the
  top-k at each node is cheap to materialize, and stale-but-close lists are
  acceptable because a rebuild fixes them.

Two optimizations matter at scale.

- First, a multi-tier cache: a hot-prefix cache (cache-aside on the full trie,
  keyed by prefix) absorbs the enormous skew — a small set of prefixes accounts
  for the majority of traffic.
- Second, shorten the critical path: route by the first character or two to the
  shard owning that subtree, so each machine keeps a small trie and the lookup
  stays local.
- Back-of-the-envelope: with ~1B distinct phrases you can fit the top-k lists
  (say top 10, 4 bytes per id plus length) compactly in a few tens of GB across
  the cluster, and each node answering in microseconds.
- When a prefix has no results or the trie misses, fall back to the slightly
  relaxed prefix (last keystroke ignored) before returning an empty list..
- The trie is an in-memory structure, but a node-per-character implementation is
  too memory-heavy.

- One small object per character inflates memory by an order of magnitude.
- Instead, store the trie in a compact, flat encoding — an array of nodes with
  fixed-width entries (child bitmap, offsets, and the top-k bucket) or a DAFSA
  (deterministic acyclic finite state automaton) that merges shared suffixes,
  cutting size by a large factor.
- The frequency data lives in the same structure as integer ids and counts,
  never as strings, so nodes are small and cache-friendly.
- Rebuilds produce a new immutable snapshot that is swapped in atomically, so
  readers never see a partially written trie.

Reads scale by sharding.

- Partition the trie by the first few characters of the phrase, so each prefix
  routes deterministically to one shard and every shard is read-mostly and
  horizontally replicable.
- Add replicas behind a load balancer and put a CDN or edge cache in front of
  the API gateway for the hottest prefixes, so the trie cluster only sees misses
  and long-tail queries.
- Consistent hashing lets you add shards without a full rebuild.
- A replication factor of 2–3 covers node loss.
- Since reads are in-memory, throughput is bounded by networking rather than
  CPU, so co-locating the Suggester with the trie (same process) avoids a
  per-request RPC and roughly doubles capacity..
- Typos require going beyond exact-prefix matching.

- A pragmatic approach is a second structure with edit-distance support: index
  phrases by a few clever keys such as n-gram shingles (bigrams/trigrams) or a
  BK-tree, then when the trie returns too few results for a prefix, generate
  small edit-distance variants of the typed prefix and look each up in the trie.
- Better, build a fuzzy trie that walks characters while allowing one or two
  insertions, deletions, or substitutions, producing candidates ranked by both
  edit distance and popularity so a correct but rare suggestion beats a wrong
  but popular one.
- Also treat common misspellings directly: keep a misspelling-to-canonical
  mapping learned from the query log itself, since users repeatedly type the
  same mistakes.
- The cost is latency and memory, so fuzzy lookup is only triggered when the
  exact path under-serves.

Personalization ranks candidates relative to the user instead of the global
counts.

- Compute per-user or per-segment frequencies (a compact user-model: recent
  queries, clicked phrases, categorical affinities) and blend them into the
  global score — e.g., `score = w1 * global_popularity + w2 * user_affinity`,
  with the weights tuned so a user's frequent destinations jump ahead of the
  global list without flooding it.
- Locale and geo context are the simplest, highest-value form: a query in NYC
  should rank "Pizza" by local popularity, so the trie is per-region or the
  scores are mixed with a location factor at query time.
- The hard trade-offs are privacy (storing enough history to personalize without
  retaining raw queries too long) and latency (personalized scoring must still
  run inside the keystroke budget).
- Resolve most personalization from a small per-user cache rather than a live
  join.

## Source

````text
title: Typeahead Search
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node suggester: Suggester [icon=search]
node trie: Trie Service [icon=cache]
node rank: Ranking Worker [icon=worker]
node index: Indexer [icon=queue]
node querylog: Query Log [cylinder, icon=database]
node cache: Hot Prefix Cache [cylinder, icon=cache]

edge client -> api: type prefix
edge api -> suggester: top-k
edge suggester -> trie: match
edge trie -> suggester: candidates
edge suggester -> rank: score
edge rank -> api: results
edge client -> api: select
edge api -> querylog: log
edge querylog -> index: aggregate
edge index -> trie: rebuild
edge suggester -> cache: hot prefixes
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Typeahead Search
client: Client
api: API Gateway
suggester: Suggester
trie: Trie Service
rank: Ranking Worker
index: Indexer
querylog: Query Log
cache: Hot Prefix Cache

client ─► api ─► type prefix
api ─► suggester ─► top-k
suggester ─► trie ─► match
trie ─► suggester ─► candidates
suggester ─► rank ─► score
rank ─► api ─► results
client ─► api ─► select
api ─► querylog ─► log
querylog ─► index ─► aggregate
index ─► trie ─► rebuild
suggester ─► cache ─► hot prefixes
````

## Design

### Design a typeahead / autocomplete system

As the user types each keystroke, the client sends the current prefix to an API
gateway, which routes to a Suggester service that returns the top-k completed
phrases for that prefix.

- The core data structure is a trie (prefix tree) keyed by the query text, where
  each node stores the aggregated popularity of the phrases beneath it so a
  prefix lookup returns the best candidates directly.
- A Ranking Worker scores candidates from frequency signals.
- A Hot Prefix Cache serves the most popular prefixes in microseconds without
  touching the trie.
- After a user picks a suggestion, the client logs the selection to a Query Log.
- An Indexer aggregates logs offline and periodically rebuilds the trie, so
  suggestions reflect real search behavior rather than a hand-maintained list.

Latency is the defining constraint.

- A typeahead fires on every keystroke, so the p95 target is in the tens of
  milliseconds and the read load is far higher than for normal search.
- That means in-memory serving, aggressive caching, and asynchronous writes.
- The write path (logging, aggregation, rebuild) is eventually consistent and
  can lag by minutes or hours; the read path must never block on it.
- Key trade-offs: memory (a full trie is large, so compaction and distribution
  matter) versus freshness (rebuilding frequently keeps suggestions current but
  costs CPU and write amplification on the serving layer).

### How do you return top-k suggestions for a prefix quickly?

The classic approach is a trie in which each node stores the top-k suggestions
reachable from it, precomputed from the underlying frequencies.

- A lookup then walks down the trie along the typed prefix (O(prefix length))
  and reads the precomputed list at the terminal node — no traversal or sorting
  at query time, which is what keeps p95 latency at milliseconds even under
  heavy load.
- For large data, the trie is built over a frequency-ordered dictionary so the
  top-k at each node is cheap to materialize, and stale-but-close lists are
  acceptable because a rebuild fixes them.

Two optimizations matter at scale.

- First, a multi-tier cache: a hot-prefix cache (cache-aside on the full trie,
  keyed by prefix) absorbs the enormous skew — a small set of prefixes accounts
  for the majority of traffic.
- Second, shorten the critical path: route by the first character or two to the
  shard owning that subtree, so each machine keeps a small trie and the lookup
  stays local.
- Back-of-the-envelope: with ~1B distinct phrases you can fit the top-k lists
  (say top 10, 4 bytes per id plus length) compactly in a few tens of GB across
  the cluster, and each node answering in microseconds.
- When a prefix has no results or the trie misses, fall back to the slightly
  relaxed prefix (last keystroke ignored) before returning an empty list.

### How do you store the trie and scale reads?

The trie is an in-memory structure, but a node-per-character implementation is
too memory-heavy.

- One small object per character inflates memory by an order of magnitude.
- Instead, store the trie in a compact, flat encoding — an array of nodes with
  fixed-width entries (child bitmap, offsets, and the top-k bucket) or a DAFSA
  (deterministic acyclic finite state automaton) that merges shared suffixes,
  cutting size by a large factor.
- The frequency data lives in the same structure as integer ids and counts,
  never as strings, so nodes are small and cache-friendly.
- Rebuilds produce a new immutable snapshot that is swapped in atomically, so
  readers never see a partially written trie.

Reads scale by sharding.

- Partition the trie by the first few characters of the phrase, so each prefix
  routes deterministically to one shard and every shard is read-mostly and
  horizontally replicable.
- Add replicas behind a load balancer and put a CDN or edge cache in front of
  the API gateway for the hottest prefixes, so the trie cluster only sees misses
  and long-tail queries.
- Consistent hashing lets you add shards without a full rebuild.
- A replication factor of 2–3 covers node loss.
- Since reads are in-memory, throughput is bounded by networking rather than
  CPU, so co-locating the Suggester with the trie (same process) avoids a
  per-request RPC and roughly doubles capacity.

### How do you keep suggestions fresh from query logs?

Freshness is a pipeline, not an inline write.

- Every accepted suggestion (and raw search query) is written to a Query Log — a
  Kafka topic partitioned by phrase hash so all events for one phrase land on
  the same consumer.
- An Indexer consumes the logs in batches, aggregates counts into a rolling
  window (e.g., last 7 days weighted toward recent activity), and merges them
  with the existing frequency distribution.
- When the new model is ready, it rebuilds the compact trie snapshot and deploys
  it to all serving shards with an atomic swap.
- The rebuild cadence trades staleness against cost: minutes for a burst-prone
  product, hours for a large index — and because the trie is immutable,
  deployment is a file copy plus a pointer flip.

Two details keep the pipeline correct.

- First, dedupe and normalization: the same phrase typed as "starbucks",
  "starbucks.", and "starbucks near me" must collapse into one node, or the
  counts fragment and top-k quality drops; normalize at ingest time (lowercase,
  strip punctuation, trim).
- Second, guard against manipulation and noise: a spammer hammering a phrase can
  boost it into every prefix's top-k, so apply per-user caps, bot detection, and
  a minimum-count threshold before a phrase becomes eligible.
- On the serving side, add a lease/expiry to cached lists so a hot-prefix cache
  never outlives the rebuild.
- Between rebuilds, allow real-time popularity (a small deltas structure
  overlaid on the static trie) so breaking news still surfaces immediately.

### How do you handle typos and personalization?

Typos require going beyond exact-prefix matching.

- A pragmatic approach is a second structure with edit-distance support: index
  phrases by a few clever keys such as n-gram shingles (bigrams/trigrams) or a
  BK-tree, then when the trie returns too few results for a prefix, generate
  small edit-distance variants of the typed prefix and look each up in the trie.
- Better, build a fuzzy trie that walks characters while allowing one or two
  insertions, deletions, or substitutions, producing candidates ranked by both
  edit distance and popularity so a correct but rare suggestion beats a wrong
  but popular one.
- Also treat common misspellings directly: keep a misspelling-to-canonical
  mapping learned from the query log itself, since users repeatedly type the
  same mistakes.
- The cost is latency and memory, so fuzzy lookup is only triggered when the
  exact path under-serves.

Personalization ranks candidates relative to the user instead of the global
counts.

- Compute per-user or per-segment frequencies (a compact user-model: recent
  queries, clicked phrases, categorical affinities) and blend them into the
  global score — e.g., `score = w1 * global_popularity + w2 * user_affinity`,
  with the weights tuned so a user's frequent destinations jump ahead of the
  global list without flooding it.
- Locale and geo context are the simplest, highest-value form: a query in NYC
  should rank "Pizza" by local popularity, so the trie is per-region or the
  scores are mixed with a location factor at query time.
- The hard trade-offs are privacy (storing enough history to personalize without
  retaining raw queries too long) and latency (personalized scoring must still
  run inside the keystroke budget).
- Resolve most personalization from a small per-user cache rather than a live
  join.

## Source

```text
title: Typeahead Search
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node suggester: Suggester [icon=search]
node trie: Trie Service [icon=cache]
node rank: Ranking Worker [icon=worker]
node index: Indexer [icon=queue]
node querylog: Query Log [cylinder, icon=database]
node cache: Hot Prefix Cache [cylinder, icon=cache]

edge client -> api: type prefix
edge api -> suggester: top-k
edge suggester -> trie: match
edge trie -> suggester: candidates
edge suggester -> rank: score
edge rank -> api: results
edge client -> api: select
edge api -> querylog: log
edge querylog -> index: aggregate
edge index -> trie: rebuild
edge suggester -> cache: hot prefixes
```

## Q&A

### Q: Design a typeahead / autocomplete system

**A:** As the user types each keystroke, the client sends the current prefix to an API
gateway, which routes to a Suggester service that returns the top-k completed
phrases for that prefix.

- The core data structure is a trie (prefix tree) keyed by the query text, where
  each node stores the aggregated popularity of the phrases beneath it so a
  prefix lookup returns the best candidates directly.
- A Ranking Worker scores candidates from frequency signals.
- A Hot Prefix Cache serves the most popular prefixes in microseconds without
  touching the trie.
- After a user picks a suggestion, the client logs the selection to a Query Log.
- An Indexer aggregates logs offline and periodically rebuilds the trie, so
  suggestions reflect real search behavior rather than a hand-maintained list.

Latency is the defining constraint.

- A typeahead fires on every keystroke, so the p95 target is in the tens of
  milliseconds and the read load is far higher than for normal search.
- That means in-memory serving, aggressive caching, and asynchronous writes.
- The write path (logging, aggregation, rebuild) is eventually consistent and
  can lag by minutes or hours; the read path must never block on it.
- Key trade-offs: memory (a full trie is large, so compaction and distribution
  matter) versus freshness (rebuilding frequently keeps suggestions current but
  costs CPU and write amplification on the serving layer).

### Q: How do you return top-k suggestions for a prefix quickly?

**A:** The classic approach is a trie in which each node stores the top-k suggestions
reachable from it, precomputed from the underlying frequencies.

- A lookup then walks down the trie along the typed prefix (O(prefix length))
  and reads the precomputed list at the terminal node — no traversal or sorting
  at query time, which is what keeps p95 latency at milliseconds even under
  heavy load.
- For large data, the trie is built over a frequency-ordered dictionary so the
  top-k at each node is cheap to materialize, and stale-but-close lists are
  acceptable because a rebuild fixes them.

Two optimizations matter at scale.

- First, a multi-tier cache: a hot-prefix cache (cache-aside on the full trie,
  keyed by prefix) absorbs the enormous skew — a small set of prefixes accounts
  for the majority of traffic.
- Second, shorten the critical path: route by the first character or two to the
  shard owning that subtree, so each machine keeps a small trie and the lookup
  stays local.
- Back-of-the-envelope: with ~1B distinct phrases you can fit the top-k lists
  (say top 10, 4 bytes per id plus length) compactly in a few tens of GB across
  the cluster, and each node answering in microseconds.
- When a prefix has no results or the trie misses, fall back to the slightly
  relaxed prefix (last keystroke ignored) before returning an empty list.

### Q: How do you store the trie and scale reads?

**A:** The trie is an in-memory structure, but a node-per-character implementation is
too memory-heavy.

- One small object per character inflates memory by an order of magnitude.
- Instead, store the trie in a compact, flat encoding — an array of nodes with
  fixed-width entries (child bitmap, offsets, and the top-k bucket) or a DAFSA
  (deterministic acyclic finite state automaton) that merges shared suffixes,
  cutting size by a large factor.
- The frequency data lives in the same structure as integer ids and counts,
  never as strings, so nodes are small and cache-friendly.
- Rebuilds produce a new immutable snapshot that is swapped in atomically, so
  readers never see a partially written trie.

Reads scale by sharding.

- Partition the trie by the first few characters of the phrase, so each prefix
  routes deterministically to one shard and every shard is read-mostly and
  horizontally replicable.
- Add replicas behind a load balancer and put a CDN or edge cache in front of
  the API gateway for the hottest prefixes, so the trie cluster only sees misses
  and long-tail queries.
- Consistent hashing lets you add shards without a full rebuild.
- A replication factor of 2–3 covers node loss.
- Since reads are in-memory, throughput is bounded by networking rather than
  CPU, so co-locating the Suggester with the trie (same process) avoids a
  per-request RPC and roughly doubles capacity.

### Q: How do you keep suggestions fresh from query logs?

**A:** Freshness is a pipeline, not an inline write.

- Every accepted suggestion (and raw search query) is written to a Query Log — a
  Kafka topic partitioned by phrase hash so all events for one phrase land on
  the same consumer.
- An Indexer consumes the logs in batches, aggregates counts into a rolling
  window (e.g., last 7 days weighted toward recent activity), and merges them
  with the existing frequency distribution.
- When the new model is ready, it rebuilds the compact trie snapshot and deploys
  it to all serving shards with an atomic swap.
- The rebuild cadence trades staleness against cost: minutes for a burst-prone
  product, hours for a large index — and because the trie is immutable,
  deployment is a file copy plus a pointer flip.

Two details keep the pipeline correct.

- First, dedupe and normalization: the same phrase typed as "starbucks",
  "starbucks.", and "starbucks near me" must collapse into one node, or the
  counts fragment and top-k quality drops; normalize at ingest time (lowercase,
  strip punctuation, trim).
- Second, guard against manipulation and noise: a spammer hammering a phrase can
  boost it into every prefix's top-k, so apply per-user caps, bot detection, and
  a minimum-count threshold before a phrase becomes eligible.
- On the serving side, add a lease/expiry to cached lists so a hot-prefix cache
  never outlives the rebuild.
- Between rebuilds, allow real-time popularity (a small deltas structure
  overlaid on the static trie) so breaking news still surfaces immediately.

### Q: How do you handle typos and personalization?

**A:** Typos require going beyond exact-prefix matching.

- A pragmatic approach is a second structure with edit-distance support: index
  phrases by a few clever keys such as n-gram shingles (bigrams/trigrams) or a
  BK-tree, then when the trie returns too few results for a prefix, generate
  small edit-distance variants of the typed prefix and look each up in the trie.
- Better, build a fuzzy trie that walks characters while allowing one or two
  insertions, deletions, or substitutions, producing candidates ranked by both
  edit distance and popularity so a correct but rare suggestion beats a wrong
  but popular one.
- Also treat common misspellings directly: keep a misspelling-to-canonical
  mapping learned from the query log itself, since users repeatedly type the
  same mistakes.
- The cost is latency and memory, so fuzzy lookup is only triggered when the
  exact path under-serves.

Personalization ranks candidates relative to the user instead of the global
counts.

- Compute per-user or per-segment frequencies (a compact user-model: recent
  queries, clicked phrases, categorical affinities) and blend them into the
  global score — e.g., `score = w1 * global_popularity + w2 * user_affinity`,
  with the weights tuned so a user's frequent destinations jump ahead of the
  global list without flooding it.
- Locale and geo context are the simplest, highest-value form: a query in NYC
  should rank "Pizza" by local popularity, so the trie is per-region or the
  scores are mixed with a location factor at query time.
- The hard trade-offs are privacy (storing enough history to personalize without
  retaining raw queries too long) and latency (personalized scoring must still
  run inside the keystroke budget).
- Resolve most personalization from a small per-user cache rather than a live
  join.

## Source

```text
title: Typeahead Search
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node suggester: Suggester [icon=search]
node trie: Trie Service [icon=cache]
node rank: Ranking Worker [icon=worker]
node index: Indexer [icon=queue]
node querylog: Query Log [cylinder, icon=database]
node cache: Hot Prefix Cache [cylinder, icon=cache]

edge client -> api: type prefix
edge api -> suggester: top-k
edge suggester -> trie: match
edge trie -> suggester: candidates
edge suggester -> rank: score
edge rank -> api: results
edge client -> api: select
edge api -> querylog: log
edge querylog -> index: aggregate
edge index -> trie: rebuild
edge suggester -> cache: hot prefixes
```
