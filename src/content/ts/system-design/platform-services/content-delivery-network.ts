import type { Problem } from '../types';

export const contentDeliveryNetwork: Problem = {
  slug: 'content-delivery-network',
  title: 'Content delivery network (CDN)',
  tagline: 'Cache content at the edge, invalidate on demand, and route users to the nearest PoP.',
  difficulty: 'Medium',
  tags: ['Edge caching', 'Anycast', 'Invalidation', 'Origin shield'],
  group: 'platform-services',
  functional: [
    'Cache static assets (images, JS, CSS, video chunks) at edge PoPs.',
    'Anycast DNS routes users to the nearest healthy PoP.',
    'Cache invalidation: purge by URL, tag, or wildcard (propagate < 30 sec).',
    'Origin shield: a mid-tier cache between edge and origin.',
    'HTTPS termination, compression (gzip/brotli), and HTTP/2/3 at the edge.',
  ],
  nonFunctional: [
    'Cache hit ratio > 95% for cacheable content.',
    'Edge latency p99 under 50 ms (cached), 200 ms (origin shield hit).',
    'Invalidation propagated globally within 30 seconds.',
    'Handle 10M RPS aggregate across PoPs.',
  ],
  estimation: [
    '100 PoPs worldwide, 10 TB cache each = 1 PB edge cache.',
    'Origin shield: 10 regional shields × 100 TB = 1 PB.',
    'Invalidation: 1M purges/day. Propagation via gossip or pub/sub.',
    'DNS: 1M zones, TTL 30 sec for anycast failover.',
  ],
  diagram: `flowchart LR
  USER[User] --> DNS[DNS / anycast router] --> EDGE[Nearest edge PoP]
  EDGE --> ECACHE[Edge cache]
  ECACHE -->|hit| USER
  ECACHE -->|miss| SHIELD[Origin shield]
  SHIELD -->|hit| EDGE
  SHIELD -->|miss| ORIGIN[Origin store]
  CONTROL[Control plane] --> INVAL[Invalidation] --> EDGE`,
  design: [
    {
      title: 'Anycast routing',
      body: 'The same IP prefix is announced from multiple PoPs. BGP routes the user to the nearest PoP (by AS-path length). Health checks withdraw the prefix from unhealthy PoPs. DNS-based fallback: a short TTL (30 sec) A/AAAA record per PoP; the client picks the lowest-latency IP from the response.',
    },
    {
      title: 'Cache hierarchy',
      body: 'Edge cache (small, hot objects) → Origin shield (larger, regional) → Origin (source of truth). The shield absorbs cache misses from multiple edge PoPs, reducing origin load. Cache key = normalized URL (sorted query params, stripped tracking params). Vary headers (Accept-Encoding, Accept-Language) create multiple variants.',
    },
    {
      title: 'Invalidation',
      body: 'Purge API accepts URL, tag (surrogate-key), or wildcard. The control plane publishes invalidation events to a gossip protocol or pub/sub (Kafka). Each PoP receives and evicts matching entries from its cache. Invalidation latency target: < 30 sec global. Tag-based invalidation is preferred (for example, `product:123` purges all product images).',
    },
    {
      title: 'Edge compute',
      body: 'Run lightweight code at the edge (Workers, Lambda@Edge): A/B testing, auth, redirects, image resizing, personalization. Execution time limit (for example 50 ms CPU). Isolate untrusted code (V8 isolates, WebAssembly). Logs and metrics streamed to central observability.',
    },
  ],
  qa: [
    {
      q: 'How do you handle cache stampede on a cold key?',
      a: 'Request collapsing: the first miss acquires a lock; subsequent requests wait for the same fetch. Or use stale-while-revalidate: serve stale content while asynchronously revalidating.',
    },
    {
      q: 'What if the origin is down?',
      a: 'Serve stale content (if configured) with a `Warning: 110` header. The shield and edge can serve stale for hours. Health checks route around the origin shield if it fails.',
    },
    {
      q: 'How do you measure cache efficiency?',
      a: 'Hit ratio (hits / (hits + misses)), byte hit ratio (bytes served from cache / total bytes), and origin offload ratio. Per-PoP and per-content-type breakdowns.',
    },
  ],
};
