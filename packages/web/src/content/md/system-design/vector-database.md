# Vector Database

Design a vector database

**Difficulty:** Medium

**Tags:** database, ml, search, storage, vector

## Functional Requirements

- a vector database
- index millions of vectors?
- run approximate nearest neighbor search?
- handle hybrid search with filters?
- keep embeddings fresh?

## Non-Functional Requirements

- A vector database stores embeddings — dense numeric vectors produced by machine
  learning models — and answers similarity queries: given a vector, return the
  most similar vectors.

- The core components are an embedding service that converts text, images, or
  other inputs into vectors using an embedding model; a vector index that
  organizes vectors for fast approximate lookup; an ANN search engine that
  probes the index; a metadata store that holds the structured fields attached
  to each vector; and an ingestion queue that decouples writes from index
  updates.
- The gateway accepts both queries and upserts, and a re-ranking step refines
  approximate results before returning the top k.

Two things distinguish a vector database from a plain ANN library.

- It manages the full lifecycle of vectors.
- It combines vector similarity with metadata filtering.
- Each vector carries an ID and metadata — tenant, type, timestamp, labels — and
  search can constrain candidates by those fields before or after the vector
  search.
- The service must also keep the index consistent with the metadata store,
  handle deletes and updates without corruption, and serve many tenants without
  one tenant's load or data leaking into another's results.
- Latency targets are strict because vector search sits on the query path of
  features like semantic search, recommendations, and retrieval-augmented
  generation, so the read path must stay sub-second at scale.
- Operational concerns round out the design: observability into index build
  progress, recall probes that sample query results against an exact search, and
  capacity planning for the memory that in-memory indexes require..
- Exact nearest-neighbor search is linear per query and does not scale past a few
  million vectors, so the index is approximate by design.

- The dominant structure is HNSW — a hierarchical graph of small-world links
  where queries start at a coarse layer and descend to a fine layer, following
  edges to neighbors.
- HNSW gives excellent recall and low latency but keeps all vectors in memory,
  which is expensive at very large scale.
- The alternative is IVF — an inverted-file index that clusters vectors at build
  time and searches only the clusters nearest the query — which trades a little
  recall for much lower memory and works well with disk-backed storage.
- Many systems layer the two: IVF for the on-disk population and HNSW for hot
  partitions.

Index quality degrades as vectors are inserted, so the database uses a two-tier
model.

- New vectors land in a small, freshly built index while the large index serves
  reads.
- A background process merges the small index into the large one, or rebuilds it
  incrementally, during quiet periods.
- This separates the write path from the read path.
- Memory is the scarce resource, so the database quantizes vectors — scalar or
  product quantization — shrinking each vector to a fraction of its size with
  bounded recall loss, and it may keep full-precision vectors only for
  re-ranking.
- The choice of index and its parameters is exposed per collection, because
  recall, memory, and latency trade off differently for different workloads.
- Per-workload profiles make the choice explicit and repeatable..
- Approximate nearest neighbor search trades a guaranteed exact answer for a much
  faster one.

- The ANN engine receives a query vector, walks the index — following graph
  edges in HNSW or probing the nearest clusters in IVF — and returns a candidate
  set that is a superset of the best matches.
- Each candidate is scored by exact distance to the query, and the top k by
  score are returned.
- The tradeoff is controlled by parameters: the number of probes or the graph's
  search effort, which the caller or the service sets per query.
- Higher effort means better recall at higher latency, and production systems
  expose recall as a query-level dial rather than a hidden constant.

The candidate set then flows through the rest of the pipeline.

- Metadata filters prune candidates whose attributes do not match.
- A re-ranking stage applies a more expensive but more accurate scoring —
  full-precision distance, cross-encoder relevance, or business rank — over the
  remaining candidates before the final top k is returned.
- This coarse-to-fine structure is what makes the system practical: the cheap
  ANN pass narrows millions of vectors to hundreds, and the expensive pass
  scores only those hundreds.
- ANN search is also highly parallel, so the engine probes many graph layers or
  clusters concurrently and uses SIMD-optimized distance kernels to keep the
  per-query cost small.
- The engine also bounds worst-case latency: a probe budget caps how many
  clusters or graph edges a query may visit, so even a pathological query
  returns within the service-level objective..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Vector Database
app: Client App
gateway: API Gateway
embed: Embedding Service
model: Embedding Model
index: Vector Index
ann: ANN Search
filter: Metadata Filter
rerank: Re-ranking
queue: Ingestion Queue
cache: Result Cache
db: Metadata Store

app ─► gateway ─► query
gateway ─► embed ─► vector
embed ─► model ─► encode
gateway ─► ann ─► search
ann ─► index ─► probe
index ─► filter ─► prune
filter ─► rerank ─► score
rerank ─► app ─► top k
app ─► gateway ─► upsert
gateway ─► queue ─► index
queue ─► index ─► update
```

## Design

### Design a vector database

A vector database stores embeddings — dense numeric vectors produced by machine
learning models — and answers similarity queries: given a vector, return the
most similar vectors.

- The core components are an embedding service that converts text, images, or
  other inputs into vectors using an embedding model; a vector index that
  organizes vectors for fast approximate lookup; an ANN search engine that
  probes the index; a metadata store that holds the structured fields attached
  to each vector; and an ingestion queue that decouples writes from index
  updates.
- The gateway accepts both queries and upserts, and a re-ranking step refines
  approximate results before returning the top k.

Two things distinguish a vector database from a plain ANN library.

- It manages the full lifecycle of vectors.
- It combines vector similarity with metadata filtering.
- Each vector carries an ID and metadata — tenant, type, timestamp, labels — and
  search can constrain candidates by those fields before or after the vector
  search.
- The service must also keep the index consistent with the metadata store,
  handle deletes and updates without corruption, and serve many tenants without
  one tenant's load or data leaking into another's results.
- Latency targets are strict because vector search sits on the query path of
  features like semantic search, recommendations, and retrieval-augmented
  generation, so the read path must stay sub-second at scale.
- Operational concerns round out the design: observability into index build
  progress, recall probes that sample query results against an exact search, and
  capacity planning for the memory that in-memory indexes require.

### How do you index millions of vectors?

Exact nearest-neighbor search is linear per query and does not scale past a few
million vectors, so the index is approximate by design.

- The dominant structure is HNSW — a hierarchical graph of small-world links
  where queries start at a coarse layer and descend to a fine layer, following
  edges to neighbors.
- HNSW gives excellent recall and low latency but keeps all vectors in memory,
  which is expensive at very large scale.
- The alternative is IVF — an inverted-file index that clusters vectors at build
  time and searches only the clusters nearest the query — which trades a little
  recall for much lower memory and works well with disk-backed storage.
- Many systems layer the two: IVF for the on-disk population and HNSW for hot
  partitions.

Index quality degrades as vectors are inserted, so the database uses a two-tier
model.

- New vectors land in a small, freshly built index while the large index serves
  reads.
- A background process merges the small index into the large one, or rebuilds it
  incrementally, during quiet periods.
- This separates the write path from the read path.
- Memory is the scarce resource, so the database quantizes vectors — scalar or
  product quantization — shrinking each vector to a fraction of its size with
  bounded recall loss, and it may keep full-precision vectors only for
  re-ranking.
- The choice of index and its parameters is exposed per collection, because
  recall, memory, and latency trade off differently for different workloads.
- Per-workload profiles make the choice explicit and repeatable.

### How do you run approximate nearest neighbor search?

Approximate nearest neighbor search trades a guaranteed exact answer for a much
faster one.

- The ANN engine receives a query vector, walks the index — following graph
  edges in HNSW or probing the nearest clusters in IVF — and returns a candidate
  set that is a superset of the best matches.
- Each candidate is scored by exact distance to the query, and the top k by
  score are returned.
- The tradeoff is controlled by parameters: the number of probes or the graph's
  search effort, which the caller or the service sets per query.
- Higher effort means better recall at higher latency, and production systems
  expose recall as a query-level dial rather than a hidden constant.

The candidate set then flows through the rest of the pipeline.

- Metadata filters prune candidates whose attributes do not match.
- A re-ranking stage applies a more expensive but more accurate scoring —
  full-precision distance, cross-encoder relevance, or business rank — over the
  remaining candidates before the final top k is returned.
- This coarse-to-fine structure is what makes the system practical: the cheap
  ANN pass narrows millions of vectors to hundreds, and the expensive pass
  scores only those hundreds.
- ANN search is also highly parallel, so the engine probes many graph layers or
  clusters concurrently and uses SIMD-optimized distance kernels to keep the
  per-query cost small.
- The engine also bounds worst-case latency: a probe budget caps how many
  clusters or graph edges a query may visit, so even a pathological query
  returns within the service-level objective.

### How do you handle hybrid search with filters?

Pure vector similarity is rarely the whole query. Real workloads filter by
tenant, type, date, price, or category, and hybrid search must combine vector
ranking with metadata predicates. The clean approaches sit at two extremes:
filter-then-search scans the index but restricts candidates to those matching
the filter, which is precise but slow when the filter is selective;
search-then-filter runs the ANN search and drops non-matching results, which is
fast but can return too few matches when the filter eliminates most of the
candidate set. The database supports both and picks based on the filter's
selectivity, since neither works well for all cases.

The middle ground is pre-filtering integrated into the index. In IVF, each
cluster carries a metadata bitmap, and the query skips clusters or probes within
clusters using the filter, so selectivity is applied during the walk rather than
after it. In HNSW, filtering happens during graph traversal — edges to nodes
that fail the filter are not followed, with careful handling to avoid getting
stuck in dead ends. The metadata store keeps inverted or bitwise indexes over
attributes so selectivity estimates are cheap, and the query planner uses those
estimates to choose filter-then-search, search-then-filter, or filtered
traversal. The re-ranking stage is the final arbiter, and it can also enforce
hard predicates that the approximate pass could not guarantee, keeping hybrid
results both relevant and correct. Because metadata filters are also used for
security isolation, the planner treats tenant predicates as mandatory, applying
them before ranking and never leaking candidates across the boundary.

### How do you keep embeddings fresh?

Embeddings go stale in two ways: the underlying item changes, and the model that
produced the vectors changes. The service handles the first through the
ingestion queue — each upsert carries the new vector and version, the queue
orders updates, and the index is updated in the background so reads never block
writes. Deletes and updates are tombstoned in the metadata store and lazily
removed from the index during compaction, because surgically removing a point
from an HNSW graph or an IVF cluster is expensive and error-prone. Consumers are
told to re-embed on source data change, and the database tracks vector
provenance — which model, which version, which timestamp — so stale rows are
detectable.

Model changes are the harder problem because a new embedding model changes the
meaning of every vector, and mixing vectors from different models in one index
silently corrupts similarity. The service therefore supports model-versioned
collections: a new model version gets its own index or namespace, queries are
routed against a consistent model version, and migration is a background rebuild
that re-encodes the source data and swaps the index atomically. This is why the
embedding service and the model are explicit components rather than hidden
details. Freshness is also a data-hygiene concern: re-embedding everything
continuously is expensive, so the service prioritizes re-encoding by churn and
staleness age, and it exposes an API for callers to trigger selective
re-embedding after important updates. Observability for freshness tracks
re-embed lag per collection, so operators can see when a model or data change is
still producing stale vectors in search results.

## Source

```text
title: Vector Database
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node embed: Embedding Service [icon=compute]
node model: Embedding Model [icon=cloud]
node index: Vector Index [icon=search]
node ann: ANN Search [icon=compute]
node filter: Metadata Filter [icon=compute]
node rerank: Re-ranking [icon=compute]
node queue: Ingestion Queue [icon=queue]
node cache: Result Cache [cylinder, icon=cache]
node db: Metadata Store [cylinder, icon=database]

edge app -> gateway: query
edge gateway -> embed: vector
edge embed -> model: encode
edge gateway -> ann: search
edge ann -> index: probe
edge index -> filter: prune
edge filter -> rerank: score
edge rerank -> app: top k
edge app -> gateway: upsert
edge gateway -> queue: index
edge queue -> index: update
```

## Q&A

### Q: Design a vector database

**A:** A vector database stores embeddings — dense numeric vectors produced by machine
learning models — and answers similarity queries: given a vector, return the
most similar vectors.

- The core components are an embedding service that converts text, images, or
  other inputs into vectors using an embedding model; a vector index that
  organizes vectors for fast approximate lookup; an ANN search engine that
  probes the index; a metadata store that holds the structured fields attached
  to each vector; and an ingestion queue that decouples writes from index
  updates.
- The gateway accepts both queries and upserts, and a re-ranking step refines
  approximate results before returning the top k.

Two things distinguish a vector database from a plain ANN library.

- It manages the full lifecycle of vectors.
- It combines vector similarity with metadata filtering.
- Each vector carries an ID and metadata — tenant, type, timestamp, labels — and
  search can constrain candidates by those fields before or after the vector
  search.
- The service must also keep the index consistent with the metadata store,
  handle deletes and updates without corruption, and serve many tenants without
  one tenant's load or data leaking into another's results.
- Latency targets are strict because vector search sits on the query path of
  features like semantic search, recommendations, and retrieval-augmented
  generation, so the read path must stay sub-second at scale.
- Operational concerns round out the design: observability into index build
  progress, recall probes that sample query results against an exact search, and
  capacity planning for the memory that in-memory indexes require.

### Q: How do you index millions of vectors?

**A:** Exact nearest-neighbor search is linear per query and does not scale past a few
million vectors, so the index is approximate by design.

- The dominant structure is HNSW — a hierarchical graph of small-world links
  where queries start at a coarse layer and descend to a fine layer, following
  edges to neighbors.
- HNSW gives excellent recall and low latency but keeps all vectors in memory,
  which is expensive at very large scale.
- The alternative is IVF — an inverted-file index that clusters vectors at build
  time and searches only the clusters nearest the query — which trades a little
  recall for much lower memory and works well with disk-backed storage.
- Many systems layer the two: IVF for the on-disk population and HNSW for hot
  partitions.

Index quality degrades as vectors are inserted, so the database uses a two-tier
model.

- New vectors land in a small, freshly built index while the large index serves
  reads.
- A background process merges the small index into the large one, or rebuilds it
  incrementally, during quiet periods.
- This separates the write path from the read path.
- Memory is the scarce resource, so the database quantizes vectors — scalar or
  product quantization — shrinking each vector to a fraction of its size with
  bounded recall loss, and it may keep full-precision vectors only for
  re-ranking.
- The choice of index and its parameters is exposed per collection, because
  recall, memory, and latency trade off differently for different workloads.
- Per-workload profiles make the choice explicit and repeatable.

### Q: How do you run approximate nearest neighbor search?

**A:** Approximate nearest neighbor search trades a guaranteed exact answer for a much
faster one.

- The ANN engine receives a query vector, walks the index — following graph
  edges in HNSW or probing the nearest clusters in IVF — and returns a candidate
  set that is a superset of the best matches.
- Each candidate is scored by exact distance to the query, and the top k by
  score are returned.
- The tradeoff is controlled by parameters: the number of probes or the graph's
  search effort, which the caller or the service sets per query.
- Higher effort means better recall at higher latency, and production systems
  expose recall as a query-level dial rather than a hidden constant.

The candidate set then flows through the rest of the pipeline.

- Metadata filters prune candidates whose attributes do not match.
- A re-ranking stage applies a more expensive but more accurate scoring —
  full-precision distance, cross-encoder relevance, or business rank — over the
  remaining candidates before the final top k is returned.
- This coarse-to-fine structure is what makes the system practical: the cheap
  ANN pass narrows millions of vectors to hundreds, and the expensive pass
  scores only those hundreds.
- ANN search is also highly parallel, so the engine probes many graph layers or
  clusters concurrently and uses SIMD-optimized distance kernels to keep the
  per-query cost small.
- The engine also bounds worst-case latency: a probe budget caps how many
  clusters or graph edges a query may visit, so even a pathological query
  returns within the service-level objective.

### Q: How do you handle hybrid search with filters?

**A:** Pure vector similarity is rarely the whole query. Real workloads filter by
tenant, type, date, price, or category, and hybrid search must combine vector
ranking with metadata predicates. The clean approaches sit at two extremes:
filter-then-search scans the index but restricts candidates to those matching
the filter, which is precise but slow when the filter is selective;
search-then-filter runs the ANN search and drops non-matching results, which is
fast but can return too few matches when the filter eliminates most of the
candidate set. The database supports both and picks based on the filter's
selectivity, since neither works well for all cases.

The middle ground is pre-filtering integrated into the index. In IVF, each
cluster carries a metadata bitmap, and the query skips clusters or probes within
clusters using the filter, so selectivity is applied during the walk rather than
after it. In HNSW, filtering happens during graph traversal — edges to nodes
that fail the filter are not followed, with careful handling to avoid getting
stuck in dead ends. The metadata store keeps inverted or bitwise indexes over
attributes so selectivity estimates are cheap, and the query planner uses those
estimates to choose filter-then-search, search-then-filter, or filtered
traversal. The re-ranking stage is the final arbiter, and it can also enforce
hard predicates that the approximate pass could not guarantee, keeping hybrid
results both relevant and correct. Because metadata filters are also used for
security isolation, the planner treats tenant predicates as mandatory, applying
them before ranking and never leaking candidates across the boundary.

### Q: How do you keep embeddings fresh?

**A:** Embeddings go stale in two ways: the underlying item changes, and the model that
produced the vectors changes. The service handles the first through the
ingestion queue — each upsert carries the new vector and version, the queue
orders updates, and the index is updated in the background so reads never block
writes. Deletes and updates are tombstoned in the metadata store and lazily
removed from the index during compaction, because surgically removing a point
from an HNSW graph or an IVF cluster is expensive and error-prone. Consumers are
told to re-embed on source data change, and the database tracks vector
provenance — which model, which version, which timestamp — so stale rows are
detectable.

Model changes are the harder problem because a new embedding model changes the
meaning of every vector, and mixing vectors from different models in one index
silently corrupts similarity. The service therefore supports model-versioned
collections: a new model version gets its own index or namespace, queries are
routed against a consistent model version, and migration is a background rebuild
that re-encodes the source data and swaps the index atomically. This is why the
embedding service and the model are explicit components rather than hidden
details. Freshness is also a data-hygiene concern: re-embedding everything
continuously is expensive, so the service prioritizes re-encoding by churn and
staleness age, and it exposes an API for callers to trigger selective
re-embedding after important updates. Observability for freshness tracks
re-embed lag per collection, so operators can see when a model or data change is
still producing stale vectors in search results.

## Source

```text
title: Vector Database
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node embed: Embedding Service [icon=compute]
node model: Embedding Model [icon=cloud]
node index: Vector Index [icon=search]
node ann: ANN Search [icon=compute]
node filter: Metadata Filter [icon=compute]
node rerank: Re-ranking [icon=compute]
node queue: Ingestion Queue [icon=queue]
node cache: Result Cache [cylinder, icon=cache]
node db: Metadata Store [cylinder, icon=database]

edge app -> gateway: query
edge gateway -> embed: vector
edge embed -> model: encode
edge gateway -> ann: search
edge ann -> index: probe
edge index -> filter: prune
edge filter -> rerank: score
edge rerank -> app: top k
edge app -> gateway: upsert
edge gateway -> queue: index
edge queue -> index: update
```
