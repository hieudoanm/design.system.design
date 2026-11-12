import type { Problem } from '../types';

export const apiGateway: Problem = {
  slug: 'api-gateway',
  title: 'API gateway',
  tagline:
    'Route, authenticate, rate-limit, and observe all external traffic to your microservices.',
  difficulty: 'Medium',
  tags: ['Routing', 'Auth', 'Rate limiting', 'Observability', 'TLS'],
  group: 'platform-services',
  functional: [
    'Route requests to backend services by path, header, or query.',
    'Authenticate: JWT validation, API keys, mTLS, OAuth2 introspection.',
    'Rate limit per client, route, or globally (token bucket).',
    'Request/response transformation: rewrite paths, add headers, JSON ↔ protobuf.',
    'TLS termination, certificate management, and SNI routing.',
    'Observability: access logs, metrics (latency, errors), distributed tracing.',
  ],
  nonFunctional: [
    'p99 added latency under 5 ms (excluding backend).',
    'Handle 100K RPS per gateway instance; horizontal scaling.',
    'Config changes (routes, rate limits) hot-reloaded without restart.',
    'Zero-downtime deploy: draining in-flight requests.',
  ],
  estimation: [
    '10K routes, 1M clients. Config size < 10 MB.',
    'Gateway fleet: 50 instances × 100K RPS = 5M RPS capacity.',
    'Rate limit counters in Redis (10M keys, TTL = window).',
    "TLS certs: 10K certs, auto-renewed via ACME (Let's Encrypt).",
  ],
  diagram: `flowchart LR
  CLIENT[Client app] --> DNS[DNS] --> GW[API gateway]
  GW --> AUTH[Auth filter] --> RL[Rate limiter] --> ROUTER[Router]
  ROUTER --> MS[Microservices]
  GW -.-> OBS[Observability]`,
  design: [
    {
      title: 'Architecture',
      body: 'The gateway is a stateless fleet (Envoy, Kong, NGINX, or custom Go/Rust). Each request passes through a filter chain: TLS → Auth → Rate limit → Router → Transformation → Upstream. Filters are pluggable; order matters. Config is stored in a control plane (etcd, Consul, or DB) and pushed to gateways via xDS or long-poll.',
    },
    {
      title: 'Authentication',
      body: 'JWT: validate signature (JWKS cached), check exp, aud, iss, and custom claims. API key: lookup in Redis/DB, check scopes. mTLS: verify client cert against CA. OAuth2 introspection: call auth server (cached). Failed auth returns 401 with `WWW-Authenticate` header. Auth results (user_id, scopes) are passed to upstream via headers.',
    },
    {
      title: 'Rate limiting',
      body: 'Token bucket per (client_id, route) or (client_id, global). Counters in Redis with Lua script for atomic check-and-decrement. Returns 429 with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`. Config: rate, burst, window. Distributed: each gateway instance shares Redis; local cache for hot keys reduces Redis load.',
    },
    {
      title: 'Routing and transformation',
      body: 'Routes match by path prefix, regex, header, or query. Upstream: service name (resolved via service discovery) or static host. Load balancing: round-robin, least-request, consistent hash (session affinity). Transformation: path rewrite, header add/remove, body transform (JSON ↔ protobuf via gRPC transcoding). Timeout, retry, and circuit breaker per route.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a backend service outage?',
      a: 'Circuit breaker: after 5% 5xx errors in 10 sec, open the breaker. Return 503 immediately for a cooldown period (30 sec). Half-open: allow probe requests. Fallback: static response or cached response for GET.',
    },
    {
      q: 'What about WebSocket and gRPC?',
      a: 'HTTP/2 upgrade for gRPC (h2c or TLS). WebSocket upgrade passthrough. The gateway must support long-lived connections and stream framing. Timeouts: idle timeout for streams, per-message timeout for gRPC.',
    },
    {
      q: 'How do you do canary releases?',
      a: 'Route 5% of traffic to the new version (by header, cookie, or random). Mirror: copy request to canary, discard response. Compare error rates and latency. Gradually shift traffic.',
    },
  ],
};
