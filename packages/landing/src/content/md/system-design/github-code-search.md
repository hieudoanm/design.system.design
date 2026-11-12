# GitHub — Code Search

Design a code search engine

**Difficulty:** Medium

**Tags:** search

## Functional Requirements

- a code search engine
- index large codebases?
- search code with high precision?
- keep the index up to date?
- rank search results?

## Non-Functional Requirements

- A code search engine lets developers find symbols, identifiers, and strings
  across a huge corpus of repositories.

- The core is an offline pipeline: new repository content is pushed to an index
  queue, consumed by an indexer, and turned into an inverted index that a query
  engine reads to answer searches.
- The query path parses the user's input, looks up matches in the index, applies
  filters such as language or repository, and ranks the results before returning
  them to the search UI.

The hardest part of code search is scale.

- The corpus is enormous and grows continuously, so indexing must be incremental
  and distributed.
- Shards are partitioned by repository or by a hash of the file path, and each
  shard keeps its own inverted index plus a document store that maps file
  identifiers back to repository, path, and line information.
- A search fans out to all shards in parallel and merges the ranked results,
  with a small per-shard timeout so a single slow shard cannot stall the whole
  query.

Precision matters as much as recall.

- Unlike web search, where ranking dominates, developers querying code need
  exact identifiers and are annoyed by fuzzy misses.
- The engine supports token-level queries, substring matching, symbol matches,
  and operators like `lang:` and `repo:` so a search can be narrowed
  deterministically.
- The result cache absorbs popular, repeated queries, and the ranking service
  keeps the best matches on top.
- Instrumentation is part of the design: every query records its parse time,
  shard fan-out, and result count, so engineers can tell whether a slow search
  is a query-shape problem or a capacity problem..
- For expensive or rare features, the search UI offers a degraded mode
  that still returns correct matches, keeping the system usable when the full
  structural index is unavailable.
- Every push, branch
  update, or file rename produces a change record that lands on the index queue,
  and indexer workers process the affected files and update the relevant shards.
  The queue gives the pipeline a buffer: bursts of pushes are absorbed and workers
  scale with backlog, while search continues serving the previous snapshot of the
  index.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Code Search
dev: Developer
app: Search UI
gateway: API Gateway
indexer: Indexer
repo: Repository Store
index: Code Index
query: Query Engine
filter: Filter Service
rank: Ranking Service
queue: Index Queue
cache: Result Cache

dev ─► app ─► search
app ─► gateway ─► query
gateway ─► query ─► parse
query ─► index ─► lookup
index ─► query ─► matches
query ─► filter ─► refine
filter ─► rank ─► order
rank ─► app ─► results
repo ─► queue ─► push
queue ─► indexer ─► process
indexer ─► index ─► update
```

## Design

### Design a code search engine

A code search engine lets developers find symbols, identifiers, and strings
across a huge corpus of repositories.

- The core is an offline pipeline: new repository content is pushed to an index
  queue, consumed by an indexer, and turned into an inverted index that a query
  engine reads to answer searches.
- The query path parses the user's input, looks up matches in the index, applies
  filters such as language or repository, and ranks the results before returning
  them to the search UI.

The hardest part of code search is scale.

- The corpus is enormous and grows continuously, so indexing must be incremental
  and distributed.
- Shards are partitioned by repository or by a hash of the file path, and each
  shard keeps its own inverted index plus a document store that maps file
  identifiers back to repository, path, and line information.
- A search fans out to all shards in parallel and merges the ranked results,
  with a small per-shard timeout so a single slow shard cannot stall the whole
  query.

Precision matters as much as recall.

- Unlike web search, where ranking dominates, developers querying code need
  exact identifiers and are annoyed by fuzzy misses.
- The engine supports token-level queries, substring matching, symbol matches,
  and operators like `lang:` and `repo:` so a search can be narrowed
  deterministically.
- The result cache absorbs popular, repeated queries, and the ranking service
  keeps the best matches on top.
- Instrumentation is part of the design: every query records its parse time,
  shard fan-out, and result count, so engineers can tell whether a slow search
  is a query-shape problem or a capacity problem.

### How do you index large codebases?

Indexing starts when a repository is created or updated.

- The repository store emits a change event onto an index queue, and indexer
  workers pull batches and process them independently from search traffic, so
  index lag never degrades query availability.
- Each file is tokenized according to its language, using a lexer that produces
  both exact identifiers and structural tokens like class and function names,
  which lets the index support symbol-aware queries later.

The inverted index maps tokens to document lists.

- Each posting stores the document ID, the token position, and whether the token
  is an exact identifier or appears in a comment, which later powers ranking and
  filters.
- To keep the index compact, the engine applies normalization, stopword
  treatment tuned to code rather than prose, and delta-encoded posting lists.
- Because a popular package name can appear in millions of files, the engine
  uses skip lists and compressed bitmaps so large postings stay queryable
  without loading everything into memory.

Indexing is also about evolution, not just initial load.

- When a file is deleted or edited, the indexer must remove stale postings and
  add new ones, ideally as a document-level replace rather than a full reindex.
- Shards are rebalanced as repositories grow, and a separate verification pass
  reconciles the index against the repository store to catch missed events.
- Backfills and reindexing are run as scheduled jobs with progress tracking,
  because a silent index gap is worse than a temporary lag.
- The indexer is versioned together with the tokenizer, so a change in how
  identifiers are split produces a new index generation that can be rolled out
  and rolled back independently of the search service.

### How do you search code with high precision?

Precision comes from how the query is parsed and matched. The query engine
breaks input into tokens and supports explicit operators, so
`isFunction keyword: delete` or `repo: kernel "OOM killer"` compile into a small
set of structured constraints rather than a single free-text bag. Exact
identifier matches, quoted substring matches, and case-sensitive matches are
handled with different index lookups, because mixing them is a common source of
wrong results.

Filtering shrinks the candidate set before expensive work happens. Language,
repository, path, branch, and author filters are pushed down into the index as
required terms, and when a filter is very selective it is evaluated first to cut
the fan-out. Symbol and structural metadata let the engine favor true
identifiers over matching words in comments or strings, which dramatically
improves the quality of results for short, common names.

The engine should also be honest about what it cannot do. Because code is highly
specific, the engine avoids aggressive query rewriting and synonym expansion,
which only add noise. Ranking then takes over: matches on exact identifiers, in
code rather than comments, and at a more central position in the file are
boosted. For expensive or rare features, the search UI offers a degraded mode
that still returns correct matches, keeping the system usable when the full
structural index is unavailable. For substring-style operators, the engine falls
back to a trigram index that bounds the candidate set, keeping exact queries
fast without making the common case pay the cost.

### How do you keep the index up to date?

Freshness is driven by events from the repository store. Every push, branch
update, or file rename produces a change record that lands on the index queue,
and indexer workers process the affected files and update the relevant shards.
The queue gives the pipeline a buffer: bursts of pushes are absorbed and workers
scale with backlog, while search continues serving the previous snapshot of the
index. The design targets near-real-time freshness, on the order of seconds to a
minute, without a global reindex on every push.

Consistency across shards needs care. A repository can touch several shards, and
an update is only visible once every affected shard has applied its portion.
Each shard maintains a monotonically increasing index generation, and the search
coordinator stamps queries with a minimum generation so results never mix a
partially applied update. In-flight queries hold a consistent snapshot, which
matters more than absolute freshness during large merges. Large batch events,
such as an organization importing thousands of repositories, are processed as a
scheduled backfill with rate control so they do not crowd out live updates on
the same shards.

Operational hygiene completes the loop. The indexer tracks lag per repository
and alerts when a shard falls behind, and a reconciliation job periodically
compares repository contents against the index to repair gaps. When indexing
logic changes, a targeted reindex of affected languages or repositories runs
behind the scenes. Finally, the index is deployed as an immutable artifact per
generation, so a bad indexing rule can be rolled back by serving the previous
generation instead of patching live data.

### How do you rank search results?

Ranking for code starts with match quality. Exact identifier matches score above
substring matches, matches in code score above matches in comments and strings,
and symbol definitions score above usages. The engine also considers how
recently the repository was updated, since developers usually want to fix code
in a living project rather than an archived one, and the popularity of the
repository, as a weak prior for relevance.

A small set of hand-tuned features keeps the ranking explainable. Frequency of
the term within the file matters but is dampened, because a token that appears
everywhere in a generated file is not more relevant. Token position in the file,
the specificity of the matched symbol, and the scarcity of the term across the
corpus all feed a score that blends precision with reasonable recall. The
ranking must stay cheap because it runs on every query against merged per-shard
results.

Ranking is only as good as the metrics. The system logs which results are
clicked, which queries have poor results, and which result sets are degenerate,
such as an exact identifier returning thousands of matches. Feedback feeds the
tuning loop for both ranking weights and indexing features. There is also a
qualitative dimension: developers complain loudly about ranking that buries the
obvious answer, so the design favors conservative, predictable ranking over
cleverness, and provides filter operators that let users override ranking
entirely when needed. Because ranking quality is subjective, the engine keeps
result ordering stable within a session and only surfaces new ranking logic
behind a flag that can be compared against the previous version.

## Source

```text
title: Code Search
node dev: Developer [round, icon=browser]
node app: Search UI [icon=browser]
node gateway: API Gateway [icon=server]
node indexer: Indexer [icon=worker]
node repo: Repository Store [cylinder, icon=database]
node index: Code Index [cylinder, icon=search]
node query: Query Engine [icon=compute]
node filter: Filter Service [icon=compute]
node rank: Ranking Service [icon=compute]
node queue: Index Queue [icon=queue]
node cache: Result Cache [cylinder, icon=cache]

edge dev -> app: search
edge app -> gateway: query
edge gateway -> query: parse
edge query -> index: lookup
edge index -> query: matches
edge query -> filter: refine
edge filter -> rank: order
edge rank -> app: results
edge repo -> queue: push
edge queue -> indexer: process
edge indexer -> index: update
```

## Q&A

### Q: Design a code search engine

**A:** A code search engine lets developers find symbols, identifiers, and strings
across a huge corpus of repositories.

- The core is an offline pipeline: new repository content is pushed to an index
  queue, consumed by an indexer, and turned into an inverted index that a query
  engine reads to answer searches.
- The query path parses the user's input, looks up matches in the index, applies
  filters such as language or repository, and ranks the results before returning
  them to the search UI.

The hardest part of code search is scale.

- The corpus is enormous and grows continuously, so indexing must be incremental
  and distributed.
- Shards are partitioned by repository or by a hash of the file path, and each
  shard keeps its own inverted index plus a document store that maps file
  identifiers back to repository, path, and line information.
- A search fans out to all shards in parallel and merges the ranked results,
  with a small per-shard timeout so a single slow shard cannot stall the whole
  query.

Precision matters as much as recall.

- Unlike web search, where ranking dominates, developers querying code need
  exact identifiers and are annoyed by fuzzy misses.
- The engine supports token-level queries, substring matching, symbol matches,
  and operators like `lang:` and `repo:` so a search can be narrowed
  deterministically.
- The result cache absorbs popular, repeated queries, and the ranking service
  keeps the best matches on top.
- Instrumentation is part of the design: every query records its parse time,
  shard fan-out, and result count, so engineers can tell whether a slow search
  is a query-shape problem or a capacity problem.

### Q: How do you index large codebases?

**A:** Indexing starts when a repository is created or updated.

- The repository store emits a change event onto an index queue, and indexer
  workers pull batches and process them independently from search traffic, so
  index lag never degrades query availability.
- Each file is tokenized according to its language, using a lexer that produces
  both exact identifiers and structural tokens like class and function names,
  which lets the index support symbol-aware queries later.

The inverted index maps tokens to document lists.

- Each posting stores the document ID, the token position, and whether the token
  is an exact identifier or appears in a comment, which later powers ranking and
  filters.
- To keep the index compact, the engine applies normalization, stopword
  treatment tuned to code rather than prose, and delta-encoded posting lists.
- Because a popular package name can appear in millions of files, the engine
  uses skip lists and compressed bitmaps so large postings stay queryable
  without loading everything into memory.

Indexing is also about evolution, not just initial load.

- When a file is deleted or edited, the indexer must remove stale postings and
  add new ones, ideally as a document-level replace rather than a full reindex.
- Shards are rebalanced as repositories grow, and a separate verification pass
  reconciles the index against the repository store to catch missed events.
- Backfills and reindexing are run as scheduled jobs with progress tracking,
  because a silent index gap is worse than a temporary lag.
- The indexer is versioned together with the tokenizer, so a change in how
  identifiers are split produces a new index generation that can be rolled out
  and rolled back independently of the search service.

### Q: How do you search code with high precision?

**A:** Precision comes from how the query is parsed and matched. The query engine
breaks input into tokens and supports explicit operators, so
`isFunction keyword: delete` or `repo: kernel "OOM killer"` compile into a small
set of structured constraints rather than a single free-text bag. Exact
identifier matches, quoted substring matches, and case-sensitive matches are
handled with different index lookups, because mixing them is a common source of
wrong results.

Filtering shrinks the candidate set before expensive work happens. Language,
repository, path, branch, and author filters are pushed down into the index as
required terms, and when a filter is very selective it is evaluated first to cut
the fan-out. Symbol and structural metadata let the engine favor true
identifiers over matching words in comments or strings, which dramatically
improves the quality of results for short, common names.

The engine should also be honest about what it cannot do. Because code is highly
specific, the engine avoids aggressive query rewriting and synonym expansion,
which only add noise. Ranking then takes over: matches on exact identifiers, in
code rather than comments, and at a more central position in the file are
boosted. For expensive or rare features, the search UI offers a degraded mode
that still returns correct matches, keeping the system usable when the full
structural index is unavailable. For substring-style operators, the engine falls
back to a trigram index that bounds the candidate set, keeping exact queries
fast without making the common case pay the cost.

### Q: How do you keep the index up to date?

**A:** Freshness is driven by events from the repository store. Every push, branch
update, or file rename produces a change record that lands on the index queue,
and indexer workers process the affected files and update the relevant shards.
The queue gives the pipeline a buffer: bursts of pushes are absorbed and workers
scale with backlog, while search continues serving the previous snapshot of the
index. The design targets near-real-time freshness, on the order of seconds to a
minute, without a global reindex on every push.

Consistency across shards needs care. A repository can touch several shards, and
an update is only visible once every affected shard has applied its portion.
Each shard maintains a monotonically increasing index generation, and the search
coordinator stamps queries with a minimum generation so results never mix a
partially applied update. In-flight queries hold a consistent snapshot, which
matters more than absolute freshness during large merges. Large batch events,
such as an organization importing thousands of repositories, are processed as a
scheduled backfill with rate control so they do not crowd out live updates on
the same shards.

Operational hygiene completes the loop. The indexer tracks lag per repository
and alerts when a shard falls behind, and a reconciliation job periodically
compares repository contents against the index to repair gaps. When indexing
logic changes, a targeted reindex of affected languages or repositories runs
behind the scenes. Finally, the index is deployed as an immutable artifact per
generation, so a bad indexing rule can be rolled back by serving the previous
generation instead of patching live data.

### Q: How do you rank search results?

**A:** Ranking for code starts with match quality. Exact identifier matches score above
substring matches, matches in code score above matches in comments and strings,
and symbol definitions score above usages. The engine also considers how
recently the repository was updated, since developers usually want to fix code
in a living project rather than an archived one, and the popularity of the
repository, as a weak prior for relevance.

A small set of hand-tuned features keeps the ranking explainable. Frequency of
the term within the file matters but is dampened, because a token that appears
everywhere in a generated file is not more relevant. Token position in the file,
the specificity of the matched symbol, and the scarcity of the term across the
corpus all feed a score that blends precision with reasonable recall. The
ranking must stay cheap because it runs on every query against merged per-shard
results.

Ranking is only as good as the metrics. The system logs which results are
clicked, which queries have poor results, and which result sets are degenerate,
such as an exact identifier returning thousands of matches. Feedback feeds the
tuning loop for both ranking weights and indexing features. There is also a
qualitative dimension: developers complain loudly about ranking that buries the
obvious answer, so the design favors conservative, predictable ranking over
cleverness, and provides filter operators that let users override ranking
entirely when needed. Because ranking quality is subjective, the engine keeps
result ordering stable within a session and only surfaces new ranking logic
behind a flag that can be compared against the previous version.

## Source

```text
title: Code Search
node dev: Developer [round, icon=browser]
node app: Search UI [icon=browser]
node gateway: API Gateway [icon=server]
node indexer: Indexer [icon=worker]
node repo: Repository Store [cylinder, icon=database]
node index: Code Index [cylinder, icon=search]
node query: Query Engine [icon=compute]
node filter: Filter Service [icon=compute]
node rank: Ranking Service [icon=compute]
node queue: Index Queue [icon=queue]
node cache: Result Cache [cylinder, icon=cache]

edge dev -> app: search
edge app -> gateway: query
edge gateway -> query: parse
edge query -> index: lookup
edge index -> query: matches
edge query -> filter: refine
edge filter -> rank: order
edge rank -> app: results
edge repo -> queue: push
edge queue -> indexer: process
edge indexer -> index: update
```
