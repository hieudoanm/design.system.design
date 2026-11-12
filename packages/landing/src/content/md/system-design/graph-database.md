# Graph Database

Design a graph database

**Difficulty:** Medium

**Tags:** database, graph

## Functional Requirements

- a graph database
- store graph data efficiently?
- run deep traversals fast?
- handle hot nodes?
- partition a graph at scale?

## Non-Functional Requirements

- A graph database stores entities as nodes and the relationships between them as
  edges, and it makes the relationships first-class: queries traverse edges rather
  than joining tables.

- The architecture centers on a graph store that holds node storage and edge
  storage, a traversal engine that walks the graph, and a property index for
  filtering nodes by attributes.
- The gateway parses incoming queries, the query service plans them, and the
  traversal engine executes walks against the store, using the cache for hot
  paths and consulting the metadata database for schema and partition
  information.
- The defining property of the storage is index-free adjacency: each node keeps
  direct pointers to its neighbors, so following an edge is a pointer
  dereference, not a lookup.

The choice of edge direction matters.

- Edges are directed and typed, and the storage keeps both incoming and outgoing
  adjacency lists so traversals can run in either direction at equal cost.
- Nodes and edges both carry properties, and the query language — Cypher,
  Gremlin, or GQL — expresses patterns like finding friends of friends or the
  shortest path between two users.
- Because the interesting queries are relationship-heavy, the design goal is to
  make multi-hop traversals fast in memory while keeping cold data cheap.
- The hard problems are scale-out, hot nodes, and query planning, since a naive
  traversal can fan out exponentially: starting from a celebrity node, two hops
  over following edges visits millions of nodes.
- The design also keeps the query surface small and typed: schema enforcement
  validates node labels and edge types up front, so malformed queries fail fast
  at plan time instead of walking the whole graph..
- Hot nodes — celebrities, popular items, central hubs — create two problems: the
  read path saturates because every traversal touches them, and the write path
  contends because many edges attach to them.

- The read side is handled by the hot path cache.
- Subgraphs that repeatedly include the same hot nodes, like the followers of a
  celebrity or related products for a popular listing, are materialized and
  served from memory, and the cache is keyed by the entry point and depth so a
  fan-out from a hot node becomes a cache hit instead of a walk of hundreds of
  thousands of edges.
- Partitioning matters too: a hot node and its immediate neighborhood should
  live on one node, so traversals through it stay local.

The write side is the harder problem.

- A celebrity gaining a million followers means a million edge insertions to one
  logical node, and if those inserts serialize on that node's adjacency list,
  the write path collapses.
- The store separates the hot node's adjacency into sharded edge partitions, so
  inserts can proceed in parallel, and it may maintain the node's core identity
  on one partition while its high-degree adjacency fans out across several.
- The degree counter is updated with eventual consistency and corrected by
  background aggregation.
- When a node becomes hot — a viral post or a sudden surge — the partitioner
  reacts by splitting its edges across more partitions and warming the cache.
- Monitoring degree and read rates per node drives these decisions, because a
  node that is merely popular today can be the one that brings the cluster down
  tomorrow..
- Partitioning a graph is fundamentally hard because edges want to cross the
  partition boundary.

- If the store naively shards by node ID, a traversal that crosses partitions
  turns into distributed round trips, and deep traversals become
  network-latency-bound.
- The answer is locality-aware partitioning: the partitioner assigns nodes to
  shards so that dense communities stay together, using hash-based clustering or
  a graph partitioning algorithm that minimizes cut edges.
- Frequent query patterns — the users who interact, the pages that link — are
  placed on the same shard so the common traversals stay local.
- A replication factor covers the boundary edges: a replicated edge or a
  replicated copy of a hot node lets a traversal proceed locally instead of
  fetching across the wire.

Because real graphs change, partitioning cannot be a one-time choice.

- The partitioner observes access patterns and degree growth, and it rebalances
  by moving nodes or migrating subgraphs between shards during low-traffic
  windows, with the metadata database tracking where each node currently lives.
- Cross-partition queries are still supported — the query planner breaks a
  traversal into local segments and coordinates between shards — but they are
  the fallback, not the norm.
- Distributed transactions across shards are avoided where possible because they
  are expensive; updates are scoped to a single partition for the common case,
  and multi-partition updates use a two-phase or saga approach.
- The design goal is to push shared-nothing reality as far down as possible:
  shards are the failure domain and the scale unit, and the closer the graph
  sits to its community, the less often a query leaves home.

## Source

````text
title: Graph Database
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node query: Query Service [icon=compute]
node graph: Graph Store [icon=compute]
node node: Node Storage [cylinder, icon=database]
node edge: Edge Storage [cylinder, icon=database]
node index: Property Index [icon=search]
node traverse: Traversal Engine [icon=compute]
node cache: Hot Path Cache [icon=cache]
node partition: Partitioner [icon=worker]
node db: Metadata DB [cylinder, icon=database]

edge app -> gateway: query
edge gateway -> query: parse
edge query -> traverse: plan
edge traverse -> graph: walk
edge graph -> node: load
edge graph -> edge: follow
edge traverse -> index: lookup
edge traverse -> cache: check
edge cache -> traverse: hit
edge partition -> graph: shard
edge query -> db: meta
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Graph Database
app: Client App
gateway: API Gateway
query: Query Service
graph: Graph Store
node: Node Storage
edge: Edge Storage
index: Property Index
traverse: Traversal Engine
cache: Hot Path Cache
partition: Partitioner
db: Metadata DB

app ─► gateway ─► query
gateway ─► query ─► parse
query ─► traverse ─► plan
traverse ─► graph ─► walk
graph ─► node ─► load
graph ─► edge ─► follow
traverse ─► index ─► lookup
traverse ─► cache ─► check
cache ─► traverse ─► hit
partition ─► graph ─► shard
query ─► db ─► meta
````

## Design

### Design a graph database

A graph database stores entities as nodes and the relationships between them as
edges, and it makes the relationships first-class: queries traverse edges rather
than joining tables.

- The architecture centers on a graph store that holds node storage and edge
  storage, a traversal engine that walks the graph, and a property index for
  filtering nodes by attributes.
- The gateway parses incoming queries, the query service plans them, and the
  traversal engine executes walks against the store, using the cache for hot
  paths and consulting the metadata database for schema and partition
  information.
- The defining property of the storage is index-free adjacency: each node keeps
  direct pointers to its neighbors, so following an edge is a pointer
  dereference, not a lookup.

The choice of edge direction matters.

- Edges are directed and typed, and the storage keeps both incoming and outgoing
  adjacency lists so traversals can run in either direction at equal cost.
- Nodes and edges both carry properties, and the query language — Cypher,
  Gremlin, or GQL — expresses patterns like finding friends of friends or the
  shortest path between two users.
- Because the interesting queries are relationship-heavy, the design goal is to
  make multi-hop traversals fast in memory while keeping cold data cheap.
- The hard problems are scale-out, hot nodes, and query planning, since a naive
  traversal can fan out exponentially: starting from a celebrity node, two hops
  over following edges visits millions of nodes.
- The design also keeps the query surface small and typed: schema enforcement
  validates node labels and edge types up front, so malformed queries fail fast
  at plan time instead of walking the whole graph.

### How do you store graph data efficiently?

Graph storage is organized around adjacency.

- The node store holds each node's identity, its properties, and a label or
  type; the edge store holds each edge's source, target, type, and properties.
- Efficient layout is key: the store keeps adjacency lists physically
  contiguous, so following all outgoing edges of a node means scanning a
  sequential run of memory rather than scattering across pages.
- The edge store maintains both forward and backward adjacency lists, and it
  stores edges grouped by source node so that a traversal that fans out reads
  contiguous blocks.
- Properties are compressed and stored off the adjacency path, so a traversal
  that only needs neighbor identities does not pay for property bloat.

The relationship between node and edge storage is designed for locality.

- Each node row embeds a pointer or a range reference into the adjacency lists,
  making a hop a single address computation.
- High-degree structures are handled with a degree counter stored on the node,
  so the planner knows the fan-out before traversing.
- The store also supports duplicate-free edges and composite keys so there is a
  canonical identity per relationship.
- Writes are append-mostly — adding an edge appends to the adjacency list —
  which keeps writes cheap, and deletes mark tombstones that are reclaimed
  during compaction.
- This layout is what makes index-free adjacency real: the storage format and
  the traversal engine are designed together so that the expensive part of a
  graph query is reading neighbors, not finding them.
- The layout is validated by benchmarks on real traversals.

### How do you run deep traversals fast?

Deep traversals — six or more hops — fail fast if the engine expands blindly.

- The traversal engine plans an execution strategy before walking: it reads the
  degree of each frontier node, estimates the fan-out at each depth, and chooses
  an order that prunes the search space early.
- For queries with a fixed pattern, like shortest path, bidirectional search
  expands from both ends and meets in the middle, which turns a fan-out of ten
  per hop over five hops into two walks of about three hops each, cutting the
  work from ten to the fifth power to roughly two times ten to the third.
- Bounded-depth traversals can also stop once the target set is found.

The engine also caches aggressively.

- The hot path cache holds frequently repeated subgraph results — friends of a
  user, the comment thread for a post — so repeat queries never re-walk the
  graph, and the cache is invalidated only when the involved nodes or edges
  change.
- Columnar or vectorized adjacency iteration lets the engine process entire
  frontiers in batches rather than one node at a time, and parallel traversal
  splits frontiers across threads when the subgraph is safe to visit
  independently.
- When a deep traversal legitimately needs to inspect a large portion of the
  graph, the engine converts it into a batched, potentially external-memory walk
  with a visited set, so memory use is bounded even when the result is huge.
- The planner's job is to make the fast case fast and the hard case predictable.

### How do you handle hot nodes?

Hot nodes — celebrities, popular items, central hubs — create two problems: the
read path saturates because every traversal touches them, and the write path
contends because many edges attach to them.

- The read side is handled by the hot path cache.
- Subgraphs that repeatedly include the same hot nodes, like the followers of a
  celebrity or related products for a popular listing, are materialized and
  served from memory, and the cache is keyed by the entry point and depth so a
  fan-out from a hot node becomes a cache hit instead of a walk of hundreds of
  thousands of edges.
- Partitioning matters too: a hot node and its immediate neighborhood should
  live on one node, so traversals through it stay local.

The write side is the harder problem.

- A celebrity gaining a million followers means a million edge insertions to one
  logical node, and if those inserts serialize on that node's adjacency list,
  the write path collapses.
- The store separates the hot node's adjacency into sharded edge partitions, so
  inserts can proceed in parallel, and it may maintain the node's core identity
  on one partition while its high-degree adjacency fans out across several.
- The degree counter is updated with eventual consistency and corrected by
  background aggregation.
- When a node becomes hot — a viral post or a sudden surge — the partitioner
  reacts by splitting its edges across more partitions and warming the cache.
- Monitoring degree and read rates per node drives these decisions, because a
  node that is merely popular today can be the one that brings the cluster down
  tomorrow.

### How do you partition a graph at scale?

Partitioning a graph is fundamentally hard because edges want to cross the
partition boundary.

- If the store naively shards by node ID, a traversal that crosses partitions
  turns into distributed round trips, and deep traversals become
  network-latency-bound.
- The answer is locality-aware partitioning: the partitioner assigns nodes to
  shards so that dense communities stay together, using hash-based clustering or
  a graph partitioning algorithm that minimizes cut edges.
- Frequent query patterns — the users who interact, the pages that link — are
  placed on the same shard so the common traversals stay local.
- A replication factor covers the boundary edges: a replicated edge or a
  replicated copy of a hot node lets a traversal proceed locally instead of
  fetching across the wire.

Because real graphs change, partitioning cannot be a one-time choice.

- The partitioner observes access patterns and degree growth, and it rebalances
  by moving nodes or migrating subgraphs between shards during low-traffic
  windows, with the metadata database tracking where each node currently lives.
- Cross-partition queries are still supported — the query planner breaks a
  traversal into local segments and coordinates between shards — but they are
  the fallback, not the norm.
- Distributed transactions across shards are avoided where possible because they
  are expensive; updates are scoped to a single partition for the common case,
  and multi-partition updates use a two-phase or saga approach.
- The design goal is to push shared-nothing reality as far down as possible:
  shards are the failure domain and the scale unit, and the closer the graph
  sits to its community, the less often a query leaves home.

## Source

```text
title: Graph Database
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node query: Query Service [icon=compute]
node graph: Graph Store [icon=compute]
node node: Node Storage [cylinder, icon=database]
node edge: Edge Storage [cylinder, icon=database]
node index: Property Index [icon=search]
node traverse: Traversal Engine [icon=compute]
node cache: Hot Path Cache [icon=cache]
node partition: Partitioner [icon=worker]
node db: Metadata DB [cylinder, icon=database]

edge app -> gateway: query
edge gateway -> query: parse
edge query -> traverse: plan
edge traverse -> graph: walk
edge graph -> node: load
edge graph -> edge: follow
edge traverse -> index: lookup
edge traverse -> cache: check
edge cache -> traverse: hit
edge partition -> graph: shard
edge query -> db: meta
```

## Q&A

### Q: Design a graph database

**A:** A graph database stores entities as nodes and the relationships between them as
edges, and it makes the relationships first-class: queries traverse edges rather
than joining tables.

- The architecture centers on a graph store that holds node storage and edge
  storage, a traversal engine that walks the graph, and a property index for
  filtering nodes by attributes.
- The gateway parses incoming queries, the query service plans them, and the
  traversal engine executes walks against the store, using the cache for hot
  paths and consulting the metadata database for schema and partition
  information.
- The defining property of the storage is index-free adjacency: each node keeps
  direct pointers to its neighbors, so following an edge is a pointer
  dereference, not a lookup.

The choice of edge direction matters.

- Edges are directed and typed, and the storage keeps both incoming and outgoing
  adjacency lists so traversals can run in either direction at equal cost.
- Nodes and edges both carry properties, and the query language — Cypher,
  Gremlin, or GQL — expresses patterns like finding friends of friends or the
  shortest path between two users.
- Because the interesting queries are relationship-heavy, the design goal is to
  make multi-hop traversals fast in memory while keeping cold data cheap.
- The hard problems are scale-out, hot nodes, and query planning, since a naive
  traversal can fan out exponentially: starting from a celebrity node, two hops
  over following edges visits millions of nodes.
- The design also keeps the query surface small and typed: schema enforcement
  validates node labels and edge types up front, so malformed queries fail fast
  at plan time instead of walking the whole graph.

### Q: How do you store graph data efficiently?

**A:** Graph storage is organized around adjacency.

- The node store holds each node's identity, its properties, and a label or
  type; the edge store holds each edge's source, target, type, and properties.
- Efficient layout is key: the store keeps adjacency lists physically
  contiguous, so following all outgoing edges of a node means scanning a
  sequential run of memory rather than scattering across pages.
- The edge store maintains both forward and backward adjacency lists, and it
  stores edges grouped by source node so that a traversal that fans out reads
  contiguous blocks.
- Properties are compressed and stored off the adjacency path, so a traversal
  that only needs neighbor identities does not pay for property bloat.

The relationship between node and edge storage is designed for locality.

- Each node row embeds a pointer or a range reference into the adjacency lists,
  making a hop a single address computation.
- High-degree structures are handled with a degree counter stored on the node,
  so the planner knows the fan-out before traversing.
- The store also supports duplicate-free edges and composite keys so there is a
  canonical identity per relationship.
- Writes are append-mostly — adding an edge appends to the adjacency list —
  which keeps writes cheap, and deletes mark tombstones that are reclaimed
  during compaction.
- This layout is what makes index-free adjacency real: the storage format and
  the traversal engine are designed together so that the expensive part of a
  graph query is reading neighbors, not finding them.
- The layout is validated by benchmarks on real traversals.

### Q: How do you run deep traversals fast?

**A:** Deep traversals — six or more hops — fail fast if the engine expands blindly.

- The traversal engine plans an execution strategy before walking: it reads the
  degree of each frontier node, estimates the fan-out at each depth, and chooses
  an order that prunes the search space early.
- For queries with a fixed pattern, like shortest path, bidirectional search
  expands from both ends and meets in the middle, which turns a fan-out of ten
  per hop over five hops into two walks of about three hops each, cutting the
  work from ten to the fifth power to roughly two times ten to the third.
- Bounded-depth traversals can also stop once the target set is found.

The engine also caches aggressively.

- The hot path cache holds frequently repeated subgraph results — friends of a
  user, the comment thread for a post — so repeat queries never re-walk the
  graph, and the cache is invalidated only when the involved nodes or edges
  change.
- Columnar or vectorized adjacency iteration lets the engine process entire
  frontiers in batches rather than one node at a time, and parallel traversal
  splits frontiers across threads when the subgraph is safe to visit
  independently.
- When a deep traversal legitimately needs to inspect a large portion of the
  graph, the engine converts it into a batched, potentially external-memory walk
  with a visited set, so memory use is bounded even when the result is huge.
- The planner's job is to make the fast case fast and the hard case predictable.

### Q: How do you handle hot nodes?

**A:** Hot nodes — celebrities, popular items, central hubs — create two problems: the
read path saturates because every traversal touches them, and the write path
contends because many edges attach to them.

- The read side is handled by the hot path cache.
- Subgraphs that repeatedly include the same hot nodes, like the followers of a
  celebrity or related products for a popular listing, are materialized and
  served from memory, and the cache is keyed by the entry point and depth so a
  fan-out from a hot node becomes a cache hit instead of a walk of hundreds of
  thousands of edges.
- Partitioning matters too: a hot node and its immediate neighborhood should
  live on one node, so traversals through it stay local.

The write side is the harder problem.

- A celebrity gaining a million followers means a million edge insertions to one
  logical node, and if those inserts serialize on that node's adjacency list,
  the write path collapses.
- The store separates the hot node's adjacency into sharded edge partitions, so
  inserts can proceed in parallel, and it may maintain the node's core identity
  on one partition while its high-degree adjacency fans out across several.
- The degree counter is updated with eventual consistency and corrected by
  background aggregation.
- When a node becomes hot — a viral post or a sudden surge — the partitioner
  reacts by splitting its edges across more partitions and warming the cache.
- Monitoring degree and read rates per node drives these decisions, because a
  node that is merely popular today can be the one that brings the cluster down
  tomorrow.

### Q: How do you partition a graph at scale?

**A:** Partitioning a graph is fundamentally hard because edges want to cross the
partition boundary.

- If the store naively shards by node ID, a traversal that crosses partitions
  turns into distributed round trips, and deep traversals become
  network-latency-bound.
- The answer is locality-aware partitioning: the partitioner assigns nodes to
  shards so that dense communities stay together, using hash-based clustering or
  a graph partitioning algorithm that minimizes cut edges.
- Frequent query patterns — the users who interact, the pages that link — are
  placed on the same shard so the common traversals stay local.
- A replication factor covers the boundary edges: a replicated edge or a
  replicated copy of a hot node lets a traversal proceed locally instead of
  fetching across the wire.

Because real graphs change, partitioning cannot be a one-time choice.

- The partitioner observes access patterns and degree growth, and it rebalances
  by moving nodes or migrating subgraphs between shards during low-traffic
  windows, with the metadata database tracking where each node currently lives.
- Cross-partition queries are still supported — the query planner breaks a
  traversal into local segments and coordinates between shards — but they are
  the fallback, not the norm.
- Distributed transactions across shards are avoided where possible because they
  are expensive; updates are scoped to a single partition for the common case,
  and multi-partition updates use a two-phase or saga approach.
- The design goal is to push shared-nothing reality as far down as possible:
  shards are the failure domain and the scale unit, and the closer the graph
  sits to its community, the less often a query leaves home.

## Source

```text
title: Graph Database
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node query: Query Service [icon=compute]
node graph: Graph Store [icon=compute]
node node: Node Storage [cylinder, icon=database]
node edge: Edge Storage [cylinder, icon=database]
node index: Property Index [icon=search]
node traverse: Traversal Engine [icon=compute]
node cache: Hot Path Cache [icon=cache]
node partition: Partitioner [icon=worker]
node db: Metadata DB [cylinder, icon=database]

edge app -> gateway: query
edge gateway -> query: parse
edge query -> traverse: plan
edge traverse -> graph: walk
edge graph -> node: load
edge graph -> edge: follow
edge traverse -> index: lookup
edge traverse -> cache: check
edge cache -> traverse: hit
edge partition -> graph: shard
edge query -> db: meta
```
