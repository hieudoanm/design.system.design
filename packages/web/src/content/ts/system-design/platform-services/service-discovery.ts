import type { Problem } from '../types';

export const serviceDiscovery: Problem = {
  slug: 'service-discovery',
  title: 'Service discovery',
  tagline: 'Register, health-check, and resolve service instances with client-side load balancing.',
  difficulty: 'Medium',
  tags: ['Registry', 'Health checks', 'Client-side LB', 'Watch'],
  group: 'platform-services',
  functional: [
    'Register service instances (IP, port, metadata) on startup.',
    'Health checks: active (HTTP/gRPC) and passive (heartbeat).',
    'Clients resolve service names to instance lists (with TTL).',
    'Watch for changes: push updates to clients in real time.',
    'Support multiple zones/regions with zone-aware routing.',
  ],
  nonFunctional: [
    'Registration latency under 100 ms.',
    'Health check failure detection within 5 seconds.',
    'Resolution p99 under 5 ms (cached).',
    'Survive registry partition: clients use stale cache.',
  ],
  estimation: [
    '1K services, 100 instances each = 100K instances.',
    'Registry: 100K keys × 500 bytes = 50 MB (in-memory).',
    'Watch connections: 100K clients × 10 services = 1M watches.',
    'Health checks: 100K instances × 10 sec = 10K checks/sec.',
  ],
  diagram: `flowchart LR
  INSTANCE[Service instance] --> AGENT[Sidecar agent] --> REG[Registry]
  REG --> DB[(Registry DB)]
  REG --> HC[Health checker]
  REG --> WATCH[Watch service] --> PUSH[Push changes]
  REG --> RESOLVE[Resolution service] --> RCACHE[Resolver cache]`,
  design: [
    {
      title: 'Registration',
      body: 'Each service instance runs a sidecar agent (or library) that registers with the registry on startup: `service_name`, `instance_id`, `ip`, `port`, `zone`, `metadata` (version, tags). The agent heartbeats every 5-10 sec. On graceful shutdown, it deregisters. The registry stores this in a strongly consistent store (etcd, Consul, or a CP database).',
    },
    {
      title: 'Health checking',
      body: 'Active: the registry (or a separate health checker) probes `/health` on each instance every 10 sec. Passive: the agent heartbeats; missed heartbeats mark the instance unhealthy. Unhealthy instances are removed from the resolution set but kept in the registry for debugging. The health status is part of the instance record.',
    },
    {
      title: 'Resolution and client-side load balancing',
      body: 'Clients query the resolution service (or watch for changes) to get the instance list for a service. The resolver returns healthy instances, optionally filtered by zone (prefer same-zone). The client caches the list (TTL 10-30 sec) and does client-side load balancing (round-robin, least-request, or consistent hash). On cache miss or watch event, the client re-resolves.',
    },
    {
      title: 'Watch and push',
      body: 'The watch service maintains long-lived connections (gRPC streaming, WebSocket, or long-poll) from clients. On registry change (register, deregister, health change), it pushes the updated instance list to affected watchers. This keeps client caches fresh without polling. The push is best-effort; clients fall back to TTL-based re-resolution.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a registry partition?',
      a: 'Clients use their cached instance list (stale but functional). The registry remains available for writes in the majority partition. When the partition heals, watches push the delta. This is the CP trade-off: consistency over availability for writes.',
    },
    {
      q: "What if a client's cache is stale?",
      a: 'The TTL bounds staleness. On a request failure (connection refused, 5xx), the client immediately re-resolves. The sidecar can also proactively refresh on watch events.',
    },
    {
      q: 'How do you support multiple versions (canary)?',
      a: 'Instances register with a `version` tag. The resolver can filter by version or weight traffic (for example, 90% v1, 10% v2). The client-side LB applies the weights.',
    },
  ],
};
