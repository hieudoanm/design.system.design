import type { Problem } from '../types';

export const rateLimiter: Problem = {
  slug: 'rate-limiter',
  title: 'Rate limiter',
  tagline:
    'Protect services from traffic spikes with token buckets, sliding windows, and distributed coordination.',
  difficulty: 'Easy',
  tags: ['Token bucket', 'Sliding window', 'Redis', 'Lua'],
  group: 'foundations',
  functional: [
    'Enforce a maximum request rate per client (for example 100 req/s).',
    'Support multiple algorithms: fixed window, sliding window, token bucket.',
    'Return standard headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.',
    'Allow rule configuration per route, per client tier, or globally.',
  ],
  nonFunctional: [
    'Added latency per request must be under 2 ms at p99.',
    'Horizontally scalable: adding limiter nodes must not require rebalancing.',
    'Strong consistency for the counter — no double-counting under contention.',
    'Rules are cached locally; config changes propagate within seconds.',
  ],
  estimation: [
    '100K RPS peak across the fleet, each request hits the limiter once.',
    'A Redis cluster with 6 shards handles the counter volume comfortably.',
    'Lua scripts keep the check-and-increment atomic in one round trip.',
    'Rule config is small (< 10 KB), cached in every API gateway instance.',
  ],
  diagram: `flowchart LR
  Client --> GW[API gateway] --> RL[Rate limiter] --> BS[Backend services]
  GW -.->|rules| CONFIG[(Config store)]
  RL -.->|atomic counter| REDIS[(Redis cluster)]
  CONFIG -.->|cached locally| GW
  RL -.->|Lua script| REDIS`,
  design: [
    {
      title: 'Algorithm choice',
      body: '**Fixed window** is simple but allows bursts at window boundaries. **Sliding window log** is precise but stores every request timestamp. **Sliding window counter** approximates with two fixed windows. **Token bucket** allows burst up to bucket size, then smooths to the refill rate. For most APIs, token bucket or sliding window counter is the right trade-off.',
    },
    {
      title: 'Distributed counters',
      body: 'Use Redis with a Lua script so check-and-increment is atomic. The key is `ratelimit:{rule_id}:{client_id}:{window}`. The script returns the remaining count and TTL, which the gateway turns into headers. Shard by client_id to spread load. A 6-shard cluster handles 100K RPS with headroom.',
    },
    {
      title: 'Rule configuration',
      body: 'Rules live in a config store (etcd, Consul, or a DB with TTL). Each gateway instance watches the config and caches it locally. On a cache miss or config version change, it fetches the latest. Propagation delay is the TTL (typically 1–5 s). Rules include algorithm, rate, burst, and scope (route, client tier, IP prefix).',
    },
  ],
  qa: [
    {
      q: 'How do you handle a client that exceeds the limit?',
      a: 'Return 429 Too Many Requests with Retry-After set to the window reset time. Include X-RateLimit-Limit, X-RateLimit-Remaining (0), and X-RateLimit-Reset headers so the client can back off correctly.',
    },
    {
      q: 'What if Redis is unavailable?',
      a: 'Fail open for non-critical paths (log and allow), fail closed for critical paths (return 503). The choice depends on whether overloading the backend is worse than rejecting legitimate traffic.',
    },
    {
      q: 'How do you prevent a single client from exhausting a shared Redis connection?',
      a: 'Use connection pooling with per-client quotas, or run a sidecar rate limiter per gateway instance that aggregates locally before flushing to Redis.',
    },
  ],
};
