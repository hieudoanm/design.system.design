import type { Problem } from './types';

export const loadBalancer: Problem = {
  slug: 'load-balancer',
  title: 'Load balancer',
  tagline: 'Spread traffic across healthy backends with L4 and L7 strategies.',
  difficulty: 'Hard',
  tags: ['infra'],
  functional: [
    'Distribute connections or requests across a backend pool.',
    'Health-check backends and drain the unhealthy ones.',
    'Pin a client to a backend when sessions require it.',
    'Terminate TLS and expose metrics.',
  ],
  nonFunctional: [
    'The hop adds under 1 ms at layer 4 and under 5 ms at layer 7.',
    'There is no single point of failure; balancers scale out too.',
    'A dead backend is detected and removed within seconds.',
    'Consistent hashing avoids rebalancing every connection on a change.',
  ],
  estimation: [
    '10M concurrent connections and 1M requests per second per cluster.',
    '100 backends at 1M requests per second is 10k per backend.',
    'Health checks every 5 seconds across 100 backends is 20 checks per second.',
    'Connection tracking for 10M connections at roughly 300 bytes each is 3 GB per node set.',
  ],
  diagram: ` Client ─► DNS ─► VIP / anycast ─► Load balancer ─► Scheduling algorithm ─► Backend pool
                                        │                    │
                                        ├─► TLS termination  └─► Session affinity
                                        ├─► Health checks ──► mark / drain backends
                                        └─► Metrics

 Config DB ─► routes, weights`,
  design: [
    {
      title: 'Overview',
      body: 'A load balancer sits in front of a pool of backend servers and distributes incoming connections or requests across them.\n\n- It presents a single virtual address, hides the pool behind it, and adds the operational superpowers that make pools manageable: health checks that remove dead backends, TLS termination so certificates are managed in one place, connection and request timeouts, and the ability to add or remove capacity without touching clients.\n- The client talks only to the load balancer, and the pool behind it is a private implementation detail.\n\nA production load balancer has a data plane and a control plane.\n\n- The data plane is the hot path: it terminates the client connection, applies the scheduling algorithm to pick a backend, manages the connection to the backend (reusing kept-alive connections to avoid per-request handshakes), and optionally proxies or transparently forwards the payload.\n- The control plane handles configuration, health checking, metrics, and membership updates.\n- The two planes are separated for a reason: config churn and health-check traffic must never compete with request forwarding on the hot path, and the data plane should continue to forward traffic even if the control plane degrades.\n\nHardware load balancers give raw throughput but are pricey and hard to scale; software load balancers (NGINX, HAProxy, Envoy) run on commodity servers and scale horizontally.\n\n- The design tradeoffs are throughput versus flexibility: hardware LBs excel at simple L4 forwarding, while software LBs support rich L7 features like path-based routing, retries, and per-route policies.\n- Most modern designs also push some distribution down into the client side via DNS and client-side load balancing, so the LB pool is one of several layers of distribution rather than the only one.',
    },
  ],
  qa: [
    {
      q: 'How do you distribute traffic across backends?',
      a: 'Distribution is a scheduling decision: given a set of healthy backends, which one should handle this request?\n\n- The simplest algorithms — round robin and random — spread load evenly but ignore differences in backend capacity, which is why weighted variants exist: each backend declares a weight, and the scheduler biases the selection proportionally, letting larger instances absorb more traffic.\n- Least-connections goes further by tracking in-flight requests per backend and preferring the least loaded, which matters when requests have wildly variable durations.\n\nBeyond raw algorithms, distribution needs load awareness.\n\n- The scheduler should estimate load per backend using a combination of connection counts, request counts, and reported CPU or latency, so a backend that is slow or saturated is downgraded even if it is healthy.\n- Consistency of the chosen backend matters for some workloads, which is where hashing and affinity come in — discussed with sticky sessions.\n- For L7 load balancers, distribution also includes routing decisions: path, host, header, or cookie rules select not just an instance but a backend pool, enabling canary and blue-green deployments where a fraction of traffic routes to a new version.\n\nBackend selection must be cheap and consistent.\n\n- The scheduler keeps the healthy-set in memory, recomputed on health-change events rather than on every request, and the selection itself is O(1) per request using a weighted random or a consistent-hash ring.\n- When a backend is removed, in-flight requests are allowed to finish within a grace window and new requests are never sent to it, which is the essence of graceful drain.\n- The metric loop samples per-backend load continuously so the algorithm reacts to drift within seconds.',
    },
    {
      q: 'How do you detect and drain unhealthy servers?',
      a: 'Detection is layered.\n\n- The first signal is passive: the load balancer observes failed connections, timeouts, and protocol errors for each backend and bumps an error counter.\n- A backend that fails a threshold percentage over a window is marked unhealthy without any additional traffic.\n- Passive detection is fast and costs nothing, but it requires real traffic, so it is paired with active health checks: the LB probes each backend on an interval (TCP connect, HTTP request to a health endpoint, or protocol-specific ping) and flips status based on probe results.\n- Active checks catch a wedged backend that happens to not be receiving traffic.\n\nThe health state machine has more than two states.\n\n- A backend that fails probes moves from "healthy" to "failing", and after a configurable threshold it is marked "unhealthy" and ejected from the pool.\n- When probes start succeeding again, it does not return instantly — it is marked "recovering" and observes a short quarantine so that a flapping backend does not oscillate in and out of the pool.\n- Each transition is logged and exposed as a metric, because an operator needs to see churn, not just the current state, to diagnose a rolling deploy or a network problem.\n\nDraining is the controlled removal path.\n\n- Before a backend is taken down for a deploy or maintenance, it is marked as draining: it stops receiving new connections or requests, but existing in-flight work finishes up to a drain timeout.\n- This matters for stateful workloads and long requests — killing a connection mid-request corrupts state and produces client errors.\n- Health checks complement draining: a backend under maintenance responds to probes with a non-200 status so the LB removes it naturally, and on a clean shutdown the backend deregisters itself.\n- The result is that removals are graceful when possible and only abrupt when the backend actually crashes.',
    },
    {
      q: 'How do you maintain sticky sessions?',
      a: "Sticky sessions pin a client to a specific backend across requests, which is needed when session state lives in the backend's memory (an in-progress multipart upload, a WebSocket, a shopping cart).\n\n- The standard mechanisms are a cookie or a hash.\n- In the cookie approach, the LB sets a cookie on the first response containing a backend identifier; subsequent requests carrying that cookie are routed to the same backend.\n- In the hash approach, the LB derives a stable key (client IP, or a session cookie value) and runs it through a consistent-hash ring, so the same client always maps to the same backend.\n\nThe tradeoff is between distribution and stickiness.\n\n- Pure hashing keeps distribution fair because keys spread across the ring, but adding or removing a backend re-maps some clients — that is what consistent hashing minimizes, re-mapping only roughly 1/N of keys per membership change.\n- Cookie-based stickiness is exact but can create hot spots: if a popular client lands on one backend, it stays there.\n- Both approaches degrade in the presence of the same failure, so the design must define what happens when the pinned backend dies.\n\nThe answer is re-pinning with a bounded cost.\n\n- When the pinned backend is unhealthy or draining, the LB falls back to a fresh scheduling decision and sets a new cookie, meaning the session is rebuilt on another backend.\n- The LB can also enforce stickiness as a preference rather than an absolute: if the pinned backend is overloaded, it re-binds to a healthier one.\n- Session data should not rely on stickiness alone, so production designs pair stickiness with a shared session store or replication that makes the pinned backend a fast path rather than the only copy of the state.",
    },
    {
      q: 'How do you scale the load balancer itself?',
      a: "A single load balancer is a single point of failure and a throughput ceiling, so the design must make the LB pool horizontally scalable and redundant.\n\n- The classic pattern is two or more LBs running active-passive, sharing a virtual IP via VRRP, where the standby takes over on failure.\n- The higher-scale pattern is active-active: all LBs are live, traffic is spread across them by DNS (multiple A records with short TTLs) or by anycast routing, and each LB handles its share of traffic.\n- Anycast gives near-automatic failover because a dead node stops advertising and packets reroute, at the cost of per-connection affinity management across data centers.\n\nHorizontal scaling pushes the distribution problem up one layer.\n\n- With multiple LBs, the scheduler must spread across backends while the DNS layer spreads across LBs.\n- Each LB runs the same scheduling logic against the same backend set, so the configuration and health-check state must be shared.\n- Config is pushed to all replicas from a control plane, and health state is either computed independently per LB (each probes on its own, which is fine for detecting backend failure) or shared for consistency.\n- Backend connection reuse means each LB holds a connection pool per backend, so capacity planning must count sockets, not just connections.\n\nScaling in tiers handles very large traffic.\n\n- An L4 layer (raw TCP or UDP distribution) absorbs the bulk of connections and forwards to an L7 layer that does routing and HTTP policy, so the expensive per-request work happens on fewer connections.\n- Client-side load balancing offloads the LBs entirely for internal services: the client fetches the instance list from service discovery and picks an instance itself, so the LB becomes the entry point only for external traffic.\n- Throughout, the LB's own state must stay minimal — no local session data beyond the cache, so any replica can serve any client — and autoscaling the pool is then just adding replicas behind the same virtual address.",
    },
  ],
};
