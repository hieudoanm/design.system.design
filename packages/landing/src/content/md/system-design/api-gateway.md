# API gateway

One entry point for auth, rate limits, routing and observability.

**Difficulty:** Medium

**Tags:** auth, infra, monitoring

## Functional Requirements

- Route a request to the right service.
- Authenticate, authorise and rate limit it.
- Aggregate several backend responses into one.
- Emit metrics, logs and traces.

## Non-Functional Requirements

- The gateway adds less than 10 ms p99.
- It handles more than 100k requests per second and scales horizontally.
- A failing backend trips a circuit breaker instead of stalling every request.
- Routes and limits change without a redeploy.

## Estimation

- 100k requests per second over 50 gateway instances is 2k per instance.
- A 10 KB response at 100k requests per second is 1 GB per second of egress.
- A route table of 1k routes at 1 KB each is 1 MB, small enough to keep in every process.
- Sampling 10% of traces at 1 KB per request is about 10 MB per second of telemetry.

## Architecture Diagram

```text
 Client app ─► API gateway ─► Auth filter ─► Rate limiter ─► Router ─► Microservices
                    ▲                                            │
                    │                                            └─► Response cache
                    └─ aggregator ◄── responses ─────────────────┘
                    │
                    ├─► Observability (metrics, logs, traces)
                    └─► Routes DB (config)
```

## Design

### Overview

An API gateway is the single entry point for client traffic into a microservices
architecture.

- It terminates client connections, presents a stable external API, and forwards
  requests to internal services.
- The gateway decouples clients from service topology: services can move, split,
  or be renamed without changing client code, and cross-cutting concerns such as
  authentication, rate limiting, TLS, request routing, logging, and response
  aggregation are implemented once instead of in every service.
- Clients talk to the gateway over public HTTP while internal calls happen on a
  private network.

A gateway typically sits behind a load balancer and is itself stateless, so it
scales horizontally behind a DNS or LB layer.

- It holds the route table (a mapping from path or host to service name) in
  memory and fetches it from a config store on startup, and it keeps connection
  pools to backends to avoid re-establishing sockets per request.

Two common flavors exist:

- The edge gateway, which faces external clients and owns auth, TLS, and rate
  limiting.
- The backend-for-frontend (BFF), which is specialized per client platform and
  aggregates the exact calls a given screen needs.

The flavor choice matters:

- A single generic edge gateway is simple.
- BFFs reduce payload sizes and make per-platform policies possible at the cost
  of more moving parts.

Key design concerns are latency overhead, single point of failure, and
throughput.

- Every request pays one extra hop, so routing and filtering logic must be
  cheap, and the gateway should stream responses rather than buffer whole
  bodies.
- Availability is handled with stateless replicas, health checks, and circuit
  breakers so a degraded gateway does not take down all traffic.
- Throughput is protected by separating the control path (route updates, rate
  limit rules, config) from the data path, and by pushing route data to gateways
  so a config-store outage does not stall request forwarding.

## Q&A

### Q: How do you route requests to services?

Routing is a two-stage lookup.

- The gateway first matches the incoming request against route rules keyed by
  host, path prefix, HTTP method, and sometimes headers or query parameters.
- Each rule points at a service name, and the gateway then resolves that name to
  a concrete set of instances, typically through service discovery or the
  configured load balancer, applying weights, canary labels, or environment
  overrides.
- Matching uses longest-prefix semantics on the path so specific routes take
  precedence over generic ones, and the rules are compiled into a trie at
  startup so per-request matching is a handful of memory comparisons rather than
  a scan of every rule.

Routes are versioned with the rest of the configuration, and changes are
distributed by a control plane that pushes the new route table to every gateway
replica.

- This matters because a routing change is effectively a deployment: a wrong
  rule can blackhole traffic or send it to the wrong service.
- Gateways keep the route table in memory and apply updates via a change stream,
  each replica independently, avoiding a thundering herd on config reload.
- Timeouts, retries, and circuit-breaking policies are attached per route rather
  than globally, so a slow downstream service only degrades the routes that
  depend on it.

Edge cases include overlapping rules, trailing slashes, case sensitivity, and
query strings, so the gateway normalizes URLs before matching.

- Path rewriting (like stripping an API version prefix) and header manipulation
  (forwarding only allowlisted headers and injecting trace IDs) are part of
  routing.
- For safe rollouts, routes support shadowing: a percentage of traffic is copied
  to a new version without affecting responses, building confidence before full
  cutover.

### Q: How do you enforce auth and rate limits?

Auth is enforced as a filter in the gateway's middleware chain, before routing
and forwarding.

- The gateway validates tokens, checking JWT signature and expiry or session
  validity against a validation service, enforces scopes and permissions, and
  injects the caller identity (user id, tenant, roles) as headers forwarded to
  downstream services.
- Offloading auth to the gateway means services trust the gateway-issued
  identity and never re-implement token validation, but it concentrates risk: a
  bug in the filter affects every API, so the filter stays small, well-tested,
  and its crypto dependencies updated aggressively.

Rate limiting must be cheap and distributed.

- Because the gateway fleet is stateless and horizontally scaled, a local
  in-memory token bucket only works per instance; distributed limits require a
  shared store such as Redis, where the gateway atomically decrements a counter
  per key (user, tenant, IP, or a composite).
- The tradeoff is latency versus accuracy: a Redis round trip per request adds
  overhead, so gateways typically keep a local cached allowance and reconcile
  with the central store asynchronously, accepting that limits are approximate
  over short bursts.
- Bucket dimensions (window size, burst allowance) are configurable per plan
  tier.

Failures in these paths must fail safely.

- An auth outage fails closed for sensitive endpoints, while a rate-limit store
  outage uses local fail-open with degraded limits so it does not block all
  traffic.
- Every rejection and allowed request is logged with caller identity, route, and
  outcome, so operations can trace abuse, tune limits, and prove compliance
  after the fact.

### Q: How do you aggregate multiple services?

Aggregation exists because a single client screen often needs data from several
services.

- The gateway's aggregator issues parallel downstream calls, joins their
  results, and composes a single response, cutting client round trips and
  shifting fan-out into the infrastructure.
- The aggregator models the request in terms of the data each screen needs,
  which is why the BFF pattern fits well here, and it issues downstream calls
  concurrently, bounded by a max concurrency and a global timeout.

The hard part is error semantics.

- If four of five downstream calls succeed and one fails, what does the client
  receive? The usual approach distinguishes critical data (fail the whole
  request) from non-critical enrichments (return partial data with a degraded
  flag or omit the field).
- Each downstream call gets its own timeout, retry budget, and circuit breaker,
  so a single slow service delays only the fields it provides.
- Responses are streamed where possible so the client receives the first chunk
  before all backends have answered.

Aggregation introduces the risk of latency multiplication and partial death.

- Circuit breakers are essential: once a downstream service exceeds a failure
  threshold, the aggregator fails fast instead of hanging on timeouts.
- Idempotency keys and caching of stable reads (catalog, pricing, profiles)
  reduce downstream call volume.
- The aggregator is also deliberately scoped — hiding too much logic in the
  gateway recreates the monolith — so it performs composition and joining only,
  never business rules.

### Q: How do you handle partial failures?

Partial failures are the norm in a distributed system, and the gateway is where
they surface because it fans out to many services.

- The first defense is per-call isolation: each downstream request has its own
  timeout, retry budget, and circuit breaker, so a hung or failing service
  cannot consume the gateway's resources indefinitely.
- The circuit breaker trips after a configurable error rate, then fails fast for
  a cooldown window with a cheap fallback response rather than allowing requests
  to pile up.

The second defense is graceful degradation.

- When a non-critical dependency fails, the gateway returns partial data with a
  status flag indicating degradation instead of failing the entire request.
- For critical dependencies, the gateway can serve a stale cached response when
  freshness cannot be guaranteed.
- Every fallback path is logged and monitored, and circuit-breaker state is
  surfaced in dashboards so operations sees exactly which dependency is degraded
  at a glance.

The final layer limits blast radius:

- Per-route concurrency limits prevent one hot client from exhausting the
  gateway's worker pool.
- Bulkheaded connection pools prevent a slow backend from holding all sockets.
- Health-based load shedding lets the gateway reject or downgrade non-critical
  traffic when it is overloaded.
- Crucially, failures are made visible through structured logs, metrics per
  route and status, and trace IDs propagated to downstream calls, because an
  unobserved partial failure is indistinguishable from a success when debugging
  an outage.

## Source

```text
title: API Gateway
node client: Client [round, icon=browser]
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node router: Router [icon=compute]
node auth: Auth Filter [icon=shield]
node rate: Rate Limiter [icon=cache]
node agg: Aggregator [icon=compute]
node svc: Microservices [icon=server]
node cache: Response Cache [cylinder, icon=cache]
node metric: Observability [icon=compute]
node db: Routes DB [cylinder, icon=database]

edge client -> app: request
edge app -> gateway: call
edge gateway -> auth: verify
edge auth -> rate: throttle
edge rate -> router: route
edge router -> svc: forward
edge svc -> agg: responses
edge agg -> gateway: return
edge gateway -> cache: cache
edge gateway -> metric: log
edge router -> db: lookup
```

## Source

```text
title: API Gateway
node client: Client [round, icon=browser]
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node router: Router [icon=compute]
node auth: Auth Filter [icon=shield]
node rate: Rate Limiter [icon=cache]
node agg: Aggregator [icon=compute]
node svc: Microservices [icon=server]
node cache: Response Cache [cylinder, icon=cache]
node metric: Observability [icon=compute]
node db: Routes DB [cylinder, icon=database]

edge client -> app: request
edge app -> gateway: call
edge gateway -> auth: verify
edge auth -> rate: throttle
edge rate -> router: route
edge router -> svc: forward
edge svc -> agg: responses
edge agg -> gateway: return
edge gateway -> cache: cache
edge gateway -> metric: log
edge router -> db: lookup
```
