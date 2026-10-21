import type { Problem } from './types';

export const rateLimiter: Problem = {
  slug: 'rate-limiter',
  title: 'Rate limiter',
  tagline: 'Protect services by capping how many requests a client can make in a time window.',
  difficulty: 'Medium',
  tags: ['Algorithms', 'Redis', 'Distributed counters'],
  functional: [
    'Limit by user, IP address, API key or endpoint.',
    'Reject excess requests with HTTP 429 and a Retry-After header.',
    'Change rules without redeploying.',
    'Work correctly across many application servers.',
  ],
  nonFunctional: [
    'Add only a few milliseconds to each request.',
    'Decide up front whether to fail open or fail closed if the limiter breaks.',
    'Be accurate enough under distributed load.',
    'Use little memory per client.',
  ],
  estimation: [
    '1M active clients at about 100 bytes of state each is about 100 MB. That fits in one Redis shard.',
    '500k checks per second at peak across the fleet means sharding Redis by client key.',
  ],
  diagram: ` Client ─► API gateway ─► Rate limiter ─► Backend services
                            │    ▲
                  rules ◄───┘    └───► Redis cluster
             (config store,            (counters, atomic Lua scripts)
              cached locally)

 Over the limit:  Rate limiter ─► 429 + Retry-After`,
  design: [
    {
      title: 'Algorithms',
      body: '**Token bucket.** A bucket holds up to N tokens and refills at a steady rate. Each request takes one. It allows short bursts and needs only two numbers per client.\n\n**Leaky bucket.** Requests enter a queue that drains at a fixed rate. It smooths traffic into a constant output.\n\n**Fixed window counter.** Count requests per minute. Simple, but a client can send double the limit around a window boundary.\n\n**Sliding window log.** Keep a timestamp for every request. Exact, but memory grows with the limit.\n\n**Sliding window counter.** Blend the current and previous window counts by overlap. Close to exact and cheap.',
    },
    {
      title: 'Where it runs',
      body: 'Client-side limiting cannot be trusted. The usual home is the API gateway or a middleware in front of the services. In a service mesh it can run as a sidecar. Keep the rules in a config store and cache them in each limiter, so changing a limit does not require a deploy.',
    },
    {
      title: 'Getting counts right across servers',
      body: 'A read-modify-write from many servers creates race conditions. Do the check and update atomically in Redis, with a Lua script or `INCR` plus `EXPIRE`. For lower latency, each node can keep a local counter and sync to Redis periodically, trading some accuracy for speed.',
    },
    {
      title: 'What the client sees',
      body: 'Return `429 Too Many Requests` with `Retry-After`. Many APIs also send `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` so clients can back off before they are blocked.',
    },
  ],
  qa: [
    {
      q: 'Which algorithm would you choose, and why?',
      a: 'Token bucket is a strong default: it permits bursts, which real clients produce, uses O(1) memory and is easy to reason about. Choose a sliding window counter if you need smoother, stricter limits. Choose a leaky bucket if the downstream system needs a constant request rate.',
    },
    {
      q: 'How do you keep counts consistent across many servers?',
      a: "Keep the counter in a shared store and make the check atomic, using a Redis Lua script. Shard Redis by client key so each client's counter lives on one node. If the extra network hop is too slow, use local counters that sync periodically and accept some overshoot.",
    },
    {
      q: 'Should the limiter fail open or fail closed if Redis is down?',
      a: 'It depends on what you protect. Failing open keeps the product available but removes protection, which is usually right for ordinary APIs. Failing closed is safer for expensive or abuse-prone endpoints such as login or payments. Either way, alert on it and consider a local in-memory fallback.',
    },
    {
      q: 'How do you handle attackers who use many IP addresses?',
      a: 'Layer the limits: per IP, per account, per API key, and a global cap per endpoint. Put coarse filtering at the CDN or WAF, and use account-based limits for authenticated routes, since those are harder to rotate than IPs.',
    },
    {
      q: 'How would you rate limit across multiple regions?',
      a: 'Giving each region a share of the global quota is simple and fast, but wastes capacity when traffic is uneven. Replicating counters asynchronously between regions is more accurate but allows brief overshoot. Most systems accept that approximation.',
    },
  ],
};
