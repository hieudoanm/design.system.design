import type { Problem } from './types';

export const serviceDiscovery: Problem = {
  slug: 'service-discovery',
  title: 'Service discovery',
  tagline: 'Let services find each other as instances come and go.',
  difficulty: 'Medium',
  tags: ['dns', 'infra'],
  functional: [
    'Register and deregister a service instance.',
    'Health-check instances and expire stale entries.',
    'Resolve a healthy instance for a caller.',
    'Notify subscribers when the instance set changes.',
  ],
  nonFunctional: [
    'Resolution answers in under 10 ms, from a client-side cache.',
    'The registry stays available during a partition and converges afterwards.',
    'A change propagates to callers within seconds.',
    'It handles 100k instances and a million lookups per second.',
  ],
  estimation: [
    '100k instances heartbeating every 10 seconds is 10k writes per second.',
    '100k services with 10 instances each at 200 bytes is about 200 MB of registry state.',
    'A million lookups per second at 500 bytes is 500 MB per second, cut to near zero by client caching.',
    'Health checks for 100k instances every 10 seconds is 10k checks per second across checkers.',
  ],
  diagram: ` Service instance ─► Sidecar agent ─► Registry ─► Registry DB
                          ▲               │
                          │ heartbeat     ├─► Health checker (status)
                          └───────────────┘
                                          ├─► Watch service ─► push changes
                                          └─► Resolution service ─► Resolver cache

 Client app ─► API gateway ─► Resolution service (or client-side load balancing)`,
  design: [
    {
      title: 'Overview',
      body: 'Service discovery answers one question: given a service name, which live instances can I talk to?\n\n- In a dynamic environment where instances are constantly launched and terminated by autoscaling or deploys, hardcoding IP addresses breaks, so the system maintains a registry mapping service names to instance addresses with metadata such as version, zone, and capacity.\n- Clients and gateways consult the registry on startup and periodically afterward, and the result is cached locally to keep the steady-state path fast.\n\nThe architecture splits into registration and resolution.\n\n- Registration is write-heavy and low-frequency per instance: a sidecar agent on each host registers the local service, sends heartbeats, and deregisters on shutdown.\n- Resolution is read-heavy and latency-sensitive: the gateway or client library queries the registry, caches the instance list, and applies its own load balancing and retries.\n- The registry itself is a replicated, strongly consistent store, because a stale or split view of the instance list directly causes routing errors, and it is fronted by a cache and a watch channel so that hot paths never pay full registry cost.\n\nA good design separates the data path from the control path.\n\n- The registry is the control path — it answers "what instances exist" and changes rarely in absolute terms.\n- The data path is the client-side cache plus a resolver that rechecks the registry on failure or on TTL expiry.\n- This matters for scale: millions of clients re-resolving against a single registry would collapse it, so caching, watches (push-based updates), and subscription batching keep the registry load proportional to churn, not to request volume.',
    },
  ],
  qa: [
    {
      q: 'How do services register themselves?',
      a: 'Registration is the lifecycle problem: the system must know when an instance appears, when it is ready, and when it disappears.\n\n- The cleanest pattern is the sidecar agent.\n- Each host runs an agent next to the service process; the agent probes a local health endpoint, and once the service reports ready, the agent registers the instance with the registry, including the IP, port, and metadata like version, zone, and a unique instance id.\n- Using a sidecar keeps registration out of the application code and standardizes behavior across languages and frameworks.\n\nThe ready distinction matters because a process that has bound a port is not the same as a service that can serve traffic.\n\n- Many systems therefore support two signals: a startup registration that marks the instance as "pending" and a readiness signal that moves it to "healthy".\n- This prevents the classic deployment bug where traffic arrives at an instance that is still warming caches or loading models.\n- Deregistration is equally important: on a graceful shutdown the agent removes the instance and drains connections before exit, and the registry assigns a short TTL to every registration so a crashed process is removed automatically when its lease expires.\n\nDuplicates and stale entries are handled through idempotent writes keyed by instance id, so an agent that restarts overwrites its previous entry instead of leaving a ghost.\n\n- Version and environment metadata attached at registration enables canary routing and blue-green deploys, because the resolver can filter instances by label rather than treating the service name as a single homogeneous pool.',
    },
    {
      q: 'How do you keep the registry fresh?',
      a: 'Freshness is maintained by heartbeats plus active probing.\n\n- The sidecar agent sends a heartbeat to the registry on an interval (commonly a few seconds), and the registry attaches a lease with a TTL a few multiples of that interval.\n- If a heartbeat does not renew the lease, the entry expires and the instance is removed from the active set.\n- This gives eventual consistency under crash: the system converges on the correct instance list within roughly one TTL window.\n- Heartbeats should be cheap — a single small write batched by the agent — so that churn does not become the dominant registry load.\n\nHeartbeats alone are not enough because they only prove the process is alive, not that it can serve traffic.\n\n- The registry therefore pairs the passive heartbeat signal with active health checks: a health checker probes each instance over the network (TCP connect or HTTP endpoint) and flips its status when a probe fails.\n- The two mechanisms are complementary — heartbeats catch process death fast, active probes catch a wedged or misbehaving process that is still alive enough to heartbeat.\n- Combined, the registry can distinguish "registered but not ready", "healthy", and "unhealthy", and only healthy instances are returned to resolvers.\n\nRenewal pressure is reduced by making the registry store short-lived data: it is a cache with a source of truth, not a durable database.\n\n- Registration records are recreated from heartbeats, so a registry replica that restarts rebuilds its view from live agents rather than from disk.\n- This also bounds staleness after a partition heals, because both sides reconcile to the same lease semantics rather than merging conflicting lists.',
    },
    {
      q: 'How do clients resolve healthy instances?',
      a: "Resolution happens on the client side and is layered to protect the registry.\n\n- On first use, the client asks the resolution service for the instance list of a service name, receives the healthy instances with metadata, and caches it locally with a TTL.\n- Subsequent lookups are served from the cache, so steady-state request traffic never touches the registry.\n- On cache expiry, or when a cached instance starts failing, the client re-resolves in the background.\n\nHealthy means more than registered: the resolver filters on status from health checks, and typically applies policy.\n\n- Load-aware resolution weights instances by reported capacity or recent latency so that slower or more loaded instances receive less traffic.\n- Zone affinity is common in multi-region deployments — preferring instances in the same zone reduces latency and cross-zone bandwidth costs — with the registry storing zone as metadata.\n- The resolution service returns a full list plus change metadata so clients can detect whether the set actually changed instead of rebalancing on every refresh.\n\nWatch-based updates complement the polling cache.\n\n- The registry publishes change events for a service (instance added, removed, or unhealthy), and the resolution service forwards them to subscribed clients over a watch channel, usually a long-lived connection.\n- This collapses the freshness window from a polling interval to near-zero for changes while keeping registry load proportional to the number of distinct watched service names.\n- The cache and the watch cover each other's failure modes: a watch that silently drops still gets eventual consistency through TTL refresh, and a cache miss is always a valid fallback to the registry.",
    },
    {
      q: 'How do you handle network partitions?',
      a: "A partition is the moment when the registry's consistency model gets tested.\n\n- The registry is replicated with a quorum-based consensus protocol such as Raft, so a partitioned minority cannot accept writes and stops admitting new registrations; this prevents two disjoint halves of the network from believing they both own the same service.\n- The cost is that during a partition the minority side cannot register new instances, so the design mitigates this by keeping registration near the quorum and by preferring small, fast quorums for the registry itself.\n\nClients tolerate partitions through stale-read caching.\n\n- When the registry is unreachable, resolvers serve the last known instance list instead of erroring, relying on TTL to bound staleness.\n- During the outage, failed instances are skipped via local health checks so the client does not send traffic to dead replicas even with a stale list.\n- The key insight is that the client's own connection attempts are the fastest health signal, so a client that holds a stale cache plus retry logic can keep serving while the registry heals.\n\nAfter the partition heals, reconciliation is lease-based: expired entries are dropped, surviving agents re-heartbeat, and the registry converges to the true instance set without manual intervention.\n\n- Health checks biased to fail closed — an instance unreachable from the checker is marked unhealthy — ensure that unreachable nodes are excluded rather than accidentally marked healthy.\n- The system therefore keeps three guarantees: registered instances are eventually visible, failed instances are eventually removed, and during any disruption a client always has a usable (if stale) view plus fast local failure detection.",
    },
  ],
};
