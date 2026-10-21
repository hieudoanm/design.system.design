import type { Problem } from '../types';

export const loadBalancer: Problem = {
  slug: 'load-balancer',
  title: 'Load balancer',
  tagline:
    'Distribute traffic across backends with health checks, session affinity, and TLS termination.',
  difficulty: 'Medium',
  tags: ['Scheduling', 'Health checks', 'TLS', 'Anycast', 'VIP'],
  group: 'platform-services',
  functional: [
    'Distribute requests across a backend pool (round-robin, least-connections, consistent hash).',
    'Active and passive health checks; drain unhealthy backends.',
    'Session affinity (sticky sessions) via cookie or consistent hash.',
    'TLS termination and certificate management.',
    'Layer 4 (TCP/UDP) and Layer 7 (HTTP/gRPC) modes.',
    'Metrics: latency, error rate, active connections per backend.',
  ],
  nonFunctional: [
    'p99 added latency under 1 ms (L4), 2 ms (L7).',
    'Handle 1M concurrent connections, 10M RPS.',
    'Failover within 5 seconds of health check failure.',
    'Zero-downtime config reload.',
  ],
  estimation: [
    'VIP via anycast: 10 PoPs × 10 Gbps = 100 Gbps capacity.',
    'Backend pool: 1K services × 100 instances = 100K backends.',
    'Health checks: HTTP GET /health every 10 sec, timeout 2 sec.',
    'TLS certs: 10K certs, OCSP stapling, auto-renewal.',
  ],
  diagram: `flowchart LR
  CLIENT[Client] --> DNS[DNS] --> VIP[VIP / anycast] --> LB[Load balancer]
  LB --> SCHED[Scheduling algorithm] --> POOL[Backend pool]
  LB -->|TLS termination| TLS[TLS certs]
  LB -->|health checks| HC[Health checks]
  LB -->|metrics| MET[Metrics]`,
  design: [
    {
      title: 'Scheduling algorithms',
      body: 'Round-robin: simple, even if requests have similar cost. Least connections: send to backend with fewest active connections (good for variable latency). Consistent hash: hash of client IP or session cookie → same backend (sticky). Weighted: assign weights for heterogeneous backends. gRPC: use least-request with OOB (out-of-band) load reports from the client.',
    },
    {
      title: 'Health checks',
      body: 'Active: periodic HTTP/TCP/gRPC probe to `/health`. Passive: monitor 5xx rate and latency; if > threshold, mark unhealthy. Draining: on config change or health failure, stop new connections, wait for in-flight to finish (drain timeout), then remove. The LB must support graceful shutdown of backends.',
    },
    {
      title: 'TLS termination',
      body: "The LB terminates TLS, offloading CPU from backends. Certificates managed via ACME (Let's Encrypt) or imported. SNI routes to the correct cert. OCSP stapling avoids client OCSP queries. HTTP/2 and HTTP/3 (QUIC) supported. Backends communicate over mTLS or plain HTTP (in trusted VPC).",
    },
    {
      title: 'Layer 4 vs Layer 7',
      body: 'L4 (TCP/UDP): lower latency, no HTTP parsing, works for any protocol. L7 (HTTP/gRPC): path-based routing, header manipulation, rate limiting, WAF. Many LBs do both: L4 in front (anycast, DDoS protection), L7 behind (application routing). Cloud LBs (AWS ALB/NLB, GCP Cloud Load Balancing) expose both.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a backend that is slow but not failing health checks?',
      a: 'Passive health checks: track latency percentiles. If p99 > threshold, reduce weight or mark unhealthy. Latency-based scheduling (least-request with latency awareness) naturally avoids slow backends.',
    },
    {
      q: 'What about connection draining on deploy?',
      a: 'Signal (SIGTERM) → stop accepting new connections → wait for in-flight to complete (configurable timeout, e.g., 30 sec) → force close remaining → exit. The LB must respect the drain period.',
    },
    {
      q: 'How do you scale the LB itself?',
      a: 'Stateless LB fleet behind anycast VIP. Add LB instances; anycast routes to nearest. Config synced via control plane. For L7, shared session cache (Redis) for sticky sessions. Connection count per LB instance is the scaling metric.',
    },
  ],
};
