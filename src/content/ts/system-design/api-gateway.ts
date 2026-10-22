import type { Problem } from './types';

export const apiGateway: Problem = {
  slug: 'api-gateway',
  title: 'API gateway',
  tagline: 'One entry point for auth, rate limits, routing and observability.',
  difficulty: 'Medium',
  tags: ['auth', 'infra', 'monitoring'],
  functional: [
    'Route a request to the right service.',
    'Authenticate, authorise and rate limit it.',
    'Aggregate several backend responses into one.',
    'Emit metrics, logs and traces.',
  ],
  nonFunctional: [
    'The gateway adds less than 10 ms p99.',
    'It handles more than 100k requests per second and scales horizontally.',
    'A failing backend trips a circuit breaker instead of stalling every request.',
    'Routes and limits change without a redeploy.',
  ],
  estimation: [
    '100k requests per second over 50 gateway instances is 2k per instance.',
    'A 10 KB response at 100k requests per second is 1 GB per second of egress.',
    'A route table of 1k routes at 1 KB each is 1 MB, small enough to keep in every process.',
    'Sampling 10% of traces at 1 KB per request is about 10 MB per second of telemetry.',
  ],
  diagram: ` Client app ─► API gateway ─► Auth filter ─► Rate limiter ─► Router ─► Microservices
                    ▲                                            │
                    │                                            └─► Response cache
                    └─ aggregator ◄── responses ─────────────────┘
                    │
                    ├─► Observability (metrics, logs, traces)
                    └─► Routes DB (config)`,
  design: [
    {
      title: 'Overview',
      body: 'An API gateway is the single entry point for client traffic into a microservices architecture.\n\n- It terminates client connections, presents a stable external API, and forwards requests to internal services.\n- The gateway decouples clients from service topology: services can move, split, or be renamed without changing client code, and cross-cutting concerns such as authentication, rate limiting, TLS, request routing, logging, and response aggregation are implemented once instead of in every service.\n- Clients talk to the gateway over public HTTP while internal calls happen on a private network.\n\nA gateway typically sits behind a load balancer and is itself stateless, so it scales horizontally behind a DNS or LB layer.\n\n- It holds the route table (a mapping from path or host to service name) in memory and fetches it from a config store on startup, and it keeps connection pools to backends to avoid re-establishing sockets per request.\n\nTwo common flavors exist:\n\n- The edge gateway, which faces external clients and owns auth, TLS, and rate limiting.\n- The backend-for-frontend (BFF), which is specialized per client platform and aggregates the exact calls a given screen needs.\n\nThe flavor choice matters:\n\n- A single generic edge gateway is simple.\n- BFFs reduce payload sizes and make per-platform policies possible at the cost of more moving parts.\n\nKey design concerns are latency overhead, single point of failure, and throughput.\n\n- Every request pays one extra hop, so routing and filtering logic must be cheap, and the gateway should stream responses rather than buffer whole bodies.\n- Availability is handled with stateless replicas, health checks, and circuit breakers so a degraded gateway does not take down all traffic.\n- Throughput is protected by separating the control path (route updates, rate limit rules, config) from the data path, and by pushing route data to gateways so a config-store outage does not stall request forwarding.',
    },
  ],
  qa: [
    {
      q: 'How do you route requests to services?',
      a: 'Routing is a two-stage lookup.\n\n- The gateway first matches the incoming request against route rules keyed by host, path prefix, HTTP method, and sometimes headers or query parameters.\n- Each rule points at a service name, and the gateway then resolves that name to a concrete set of instances, typically through service discovery or the configured load balancer, applying weights, canary labels, or environment overrides.\n- Matching uses longest-prefix semantics on the path so specific routes take precedence over generic ones, and the rules are compiled into a trie at startup so per-request matching is a handful of memory comparisons rather than a scan of every rule.\n\nRoutes are versioned with the rest of the configuration, and changes are distributed by a control plane that pushes the new route table to every gateway replica.\n\n- This matters because a routing change is effectively a deployment: a wrong rule can blackhole traffic or send it to the wrong service.\n- Gateways keep the route table in memory and apply updates via a change stream, each replica independently, avoiding a thundering herd on config reload.\n- Timeouts, retries, and circuit-breaking policies are attached per route rather than globally, so a slow downstream service only degrades the routes that depend on it.\n\nEdge cases include overlapping rules, trailing slashes, case sensitivity, and query strings, so the gateway normalizes URLs before matching.\n\n- Path rewriting (like stripping an API version prefix) and header manipulation (forwarding only allowlisted headers and injecting trace IDs) are part of routing.\n- For safe rollouts, routes support shadowing: a percentage of traffic is copied to a new version without affecting responses, building confidence before full cutover.',
    },
    {
      q: 'How do you enforce auth and rate limits?',
      a: "Auth is enforced as a filter in the gateway's middleware chain, before routing and forwarding.\n\n- The gateway validates tokens, checking JWT signature and expiry or session validity against a validation service, enforces scopes and permissions, and injects the caller identity (user id, tenant, roles) as headers forwarded to downstream services.\n- Offloading auth to the gateway means services trust the gateway-issued identity and never re-implement token validation, but it concentrates risk: a bug in the filter affects every API, so the filter stays small, well-tested, and its crypto dependencies updated aggressively.\n\nRate limiting must be cheap and distributed.\n\n- Because the gateway fleet is stateless and horizontally scaled, a local in-memory token bucket only works per instance; distributed limits require a shared store such as Redis, where the gateway atomically decrements a counter per key (user, tenant, IP, or a composite).\n- The tradeoff is latency versus accuracy: a Redis round trip per request adds overhead, so gateways typically keep a local cached allowance and reconcile with the central store asynchronously, accepting that limits are approximate over short bursts.\n- Bucket dimensions (window size, burst allowance) are configurable per plan tier.\n\nFailures in these paths must fail safely.\n\n- An auth outage fails closed for sensitive endpoints, while a rate-limit store outage uses local fail-open with degraded limits so it does not block all traffic.\n- Every rejection and allowed request is logged with caller identity, route, and outcome, so operations can trace abuse, tune limits, and prove compliance after the fact.",
    },
    {
      q: 'How do you aggregate multiple services?',
      a: "Aggregation exists because a single client screen often needs data from several services.\n\n- The gateway's aggregator issues parallel downstream calls, joins their results, and composes a single response, cutting client round trips and shifting fan-out into the infrastructure.\n- The aggregator models the request in terms of the data each screen needs, which is why the BFF pattern fits well here, and it issues downstream calls concurrently, bounded by a max concurrency and a global timeout.\n\nThe hard part is error semantics.\n\n- If four of five downstream calls succeed and one fails, what does the client receive? The usual approach distinguishes critical data (fail the whole request) from non-critical enrichments (return partial data with a degraded flag or omit the field).\n- Each downstream call gets its own timeout, retry budget, and circuit breaker, so a single slow service delays only the fields it provides.\n- Responses are streamed where possible so the client receives the first chunk before all backends have answered.\n\nAggregation introduces the risk of latency multiplication and partial death.\n\n- Circuit breakers are essential: once a downstream service exceeds a failure threshold, the aggregator fails fast instead of hanging on timeouts.\n- Idempotency keys and caching of stable reads (catalog, pricing, profiles) reduce downstream call volume.\n- The aggregator is also deliberately scoped — hiding too much logic in the gateway recreates the monolith — so it performs composition and joining only, never business rules.",
    },
    {
      q: 'How do you handle partial failures?',
      a: "Partial failures are the norm in a distributed system, and the gateway is where they surface because it fans out to many services.\n\n- The first defense is per-call isolation: each downstream request has its own timeout, retry budget, and circuit breaker, so a hung or failing service cannot consume the gateway's resources indefinitely.\n- The circuit breaker trips after a configurable error rate, then fails fast for a cooldown window with a cheap fallback response rather than allowing requests to pile up.\n\nThe second defense is graceful degradation.\n\n- When a non-critical dependency fails, the gateway returns partial data with a status flag indicating degradation instead of failing the entire request.\n- For critical dependencies, the gateway can serve a stale cached response when freshness cannot be guaranteed.\n- Every fallback path is logged and monitored, and circuit-breaker state is surfaced in dashboards so operations sees exactly which dependency is degraded at a glance.\n\nThe final layer limits blast radius:\n\n- Per-route concurrency limits prevent one hot client from exhausting the gateway's worker pool.\n- Bulkheaded connection pools prevent a slow backend from holding all sockets.\n- Health-based load shedding lets the gateway reject or downgrade non-critical traffic when it is overloaded.\n- Crucially, failures are made visible through structured logs, metrics per route and status, and trace IDs propagated to downstream calls, because an unobserved partial failure is indistinguishable from a success when debugging an outage.",
    },
  ],
};
