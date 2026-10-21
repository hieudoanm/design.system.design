# Load Balancer

Design a load balancer

**Difficulty:** Hard

**Tags:** infra

## Functional Requirements

- a load balancer
- distribute traffic across backends?
- detect and drain unhealthy servers?
- maintain sticky sessions?
- scale the load balancer itself?

## Non-Functional Requirements

- A load balancer sits in front of a pool of backend servers and distributes
  incoming connections or requests across them.

- It presents a single virtual address, hides the pool behind it, and adds the
  operational superpowers that make pools manageable: health checks that remove
  dead backends, TLS termination so certificates are managed in one place,
  connection and request timeouts, and the ability to add or remove capacity
  without touching clients.
- The client talks only to the load balancer, and the pool behind it is a
  private implementation detail.

A production load balancer has a data plane and a control plane.

- The data plane is the hot path: it terminates the client connection, applies
  the scheduling algorithm to pick a backend, manages the connection to the
  backend (reusing kept-alive connections to avoid per-request handshakes), and
  optionally proxies or transparently forwards the payload.
- The control plane handles configuration, health checking, metrics, and
  membership updates.
- The two planes are separated for a reason: config churn and health-check
  traffic must never compete with request forwarding on the hot path, and the
  data plane should continue to forward traffic even if the control plane
  degrades.

Hardware load balancers give raw throughput but are pricey and hard to scale;
software load balancers (NGINX, HAProxy, Envoy) run on commodity servers and
scale horizontally.

- The design tradeoffs are throughput versus flexibility: hardware LBs excel at
  simple L4 forwarding, while software LBs support rich L7 features like
  path-based routing, retries, and per-route policies.
- Most modern designs also push some distribution down into the client side via
  DNS and client-side load balancing, so the LB pool is one of several layers of
  distribution rather than the only one..
- Distribution is a scheduling decision: given a set of healthy backends, which
  one should handle this request?

- The simplest algorithms — round robin and random — spread load evenly but
  ignore differences in backend capacity, which is why weighted variants exist:
  each backend declares a weight, and the scheduler biases the selection
  proportionally, letting larger instances absorb more traffic.
- Least-connections goes further by tracking in-flight requests per backend and
  preferring the least loaded, which matters when requests have wildly variable
  durations.

Beyond raw algorithms, distribution needs load awareness.

- The scheduler should estimate load per backend using a combination of
  connection counts, request counts, and reported CPU or latency, so a backend
  that is slow or saturated is downgraded even if it is healthy.
- Consistency of the chosen backend matters for some workloads, which is where
  hashing and affinity come in — discussed with sticky sessions.
- For L7 load balancers, distribution also includes routing decisions: path,
  host, header, or cookie rules select not just an instance but a backend pool,
  enabling canary and blue-green deployments where a fraction of traffic routes
  to a new version.

Backend selection must be cheap and consistent.

- The scheduler keeps the healthy-set in memory, recomputed on health-change
  events rather than on every request, and the selection itself is O(1) per
  request using a weighted random or a consistent-hash ring.
- When a backend is removed, in-flight requests are allowed to finish within a
  grace window and new requests are never sent to it, which is the essence of
  graceful drain.
- The metric loop samples per-backend load continuously so the algorithm reacts
  to drift within seconds..
- A single load balancer is a single point of failure and a throughput ceiling, so
  the design must make the LB pool horizontally scalable and redundant.

- The classic pattern is two or more LBs running active-passive, sharing a
  virtual IP via VRRP, where the standby takes over on failure.
- The higher-scale pattern is active-active: all LBs are live, traffic is spread
  across them by DNS (multiple A records with short TTLs) or by anycast routing,
  and each LB handles its share of traffic.
- Anycast gives near-automatic failover because a dead node stops advertising
  and packets reroute, at the cost of per-connection affinity management across
  data centers.

Horizontal scaling pushes the distribution problem up one layer.

- With multiple LBs, the scheduler must spread across backends while the DNS
  layer spreads across LBs.
- Each LB runs the same scheduling logic against the same backend set, so the
  configuration and health-check state must be shared.
- Config is pushed to all replicas from a control plane, and health state is
  either computed independently per LB (each probes on its own, which is fine
  for detecting backend failure) or shared for consistency.
- Backend connection reuse means each LB holds a connection pool per backend, so
  capacity planning must count sockets, not just connections.

Scaling in tiers handles very large traffic.

- An L4 layer (raw TCP or UDP distribution) absorbs the bulk of connections and
  forwards to an L7 layer that does routing and HTTP policy, so the expensive
  per-request work happens on fewer connections.
- Client-side load balancing offloads the LBs entirely for internal services:
  the client fetches the instance list from service discovery and picks an
  instance itself, so the LB becomes the entry point only for external traffic.
- Throughout, the LB's own state must stay minimal — no local session data
  beyond the cache, so any replica can serve any client — and autoscaling the
  pool is then just adding replicas behind the same virtual address.

## Source

````text
title: Load Balancer
node client: Client [round, icon=browser]
node app: Client App [icon=browser]
node dns: DNS [icon=server]
node lb: Load Balancer [icon=compute]
node pool: Backend Pool [icon=server]
node health: Health Checks [icon=compute]
node algo: Scheduling Algorithm [icon=compute]
node session: Session Affinity [icon=cache]
node tls: TLS Termination [icon=shield]
node metric: Metrics [icon=compute]
node db: Config DB [cylinder, icon=database]

edge client -> app: request
edge app -> dns: resolve
edge dns -> lb: endpoint
edge lb -> algo: choose
edge algo -> pool: backend
edge lb -> health: probe
edge health -> pool: mark
edge lb -> session: bind
edge session -> algo: pin
edge lb -> tls: terminate
edge lb -> metric: log
```.

## Estimation

- hashing minimizes, re-mapping only roughly 1/N of keys per membership change.

## Architecture Diagram

```text
title: Load Balancer
client: Client
app: Client App
dns: DNS
lb: Load Balancer
pool: Backend Pool
health: Health Checks
algo: Scheduling Algorithm
session: Session Affinity
tls: TLS Termination
metric: Metrics
db: Config DB

client ─► app ─► request
app ─► dns ─► resolve
dns ─► lb ─► endpoint
lb ─► algo ─► choose
algo ─► pool ─► backend
lb ─► health ─► probe
health ─► pool ─► mark
lb ─► session ─► bind
session ─► algo ─► pin
lb ─► tls ─► terminate
lb ─► metric ─► log
````

## Design

### Design a load balancer

A load balancer sits in front of a pool of backend servers and distributes
incoming connections or requests across them.

- It presents a single virtual address, hides the pool behind it, and adds the
  operational superpowers that make pools manageable: health checks that remove
  dead backends, TLS termination so certificates are managed in one place,
  connection and request timeouts, and the ability to add or remove capacity
  without touching clients.
- The client talks only to the load balancer, and the pool behind it is a
  private implementation detail.

A production load balancer has a data plane and a control plane.

- The data plane is the hot path: it terminates the client connection, applies
  the scheduling algorithm to pick a backend, manages the connection to the
  backend (reusing kept-alive connections to avoid per-request handshakes), and
  optionally proxies or transparently forwards the payload.
- The control plane handles configuration, health checking, metrics, and
  membership updates.
- The two planes are separated for a reason: config churn and health-check
  traffic must never compete with request forwarding on the hot path, and the
  data plane should continue to forward traffic even if the control plane
  degrades.

Hardware load balancers give raw throughput but are pricey and hard to scale;
software load balancers (NGINX, HAProxy, Envoy) run on commodity servers and
scale horizontally.

- The design tradeoffs are throughput versus flexibility: hardware LBs excel at
  simple L4 forwarding, while software LBs support rich L7 features like
  path-based routing, retries, and per-route policies.
- Most modern designs also push some distribution down into the client side via
  DNS and client-side load balancing, so the LB pool is one of several layers of
  distribution rather than the only one.

### How do you distribute traffic across backends?

Distribution is a scheduling decision: given a set of healthy backends, which
one should handle this request?

- The simplest algorithms — round robin and random — spread load evenly but
  ignore differences in backend capacity, which is why weighted variants exist:
  each backend declares a weight, and the scheduler biases the selection
  proportionally, letting larger instances absorb more traffic.
- Least-connections goes further by tracking in-flight requests per backend and
  preferring the least loaded, which matters when requests have wildly variable
  durations.

Beyond raw algorithms, distribution needs load awareness.

- The scheduler should estimate load per backend using a combination of
  connection counts, request counts, and reported CPU or latency, so a backend
  that is slow or saturated is downgraded even if it is healthy.
- Consistency of the chosen backend matters for some workloads, which is where
  hashing and affinity come in — discussed with sticky sessions.
- For L7 load balancers, distribution also includes routing decisions: path,
  host, header, or cookie rules select not just an instance but a backend pool,
  enabling canary and blue-green deployments where a fraction of traffic routes
  to a new version.

Backend selection must be cheap and consistent.

- The scheduler keeps the healthy-set in memory, recomputed on health-change
  events rather than on every request, and the selection itself is O(1) per
  request using a weighted random or a consistent-hash ring.
- When a backend is removed, in-flight requests are allowed to finish within a
  grace window and new requests are never sent to it, which is the essence of
  graceful drain.
- The metric loop samples per-backend load continuously so the algorithm reacts
  to drift within seconds.

### How do you detect and drain unhealthy servers?

Detection is layered.

- The first signal is passive: the load balancer observes failed connections,
  timeouts, and protocol errors for each backend and bumps an error counter.
- A backend that fails a threshold percentage over a window is marked unhealthy
  without any additional traffic.
- Passive detection is fast and costs nothing, but it requires real traffic, so
  it is paired with active health checks: the LB probes each backend on an
  interval (TCP connect, HTTP request to a health endpoint, or protocol-specific
  ping) and flips status based on probe results.
- Active checks catch a wedged backend that happens to not be receiving traffic.

The health state machine has more than two states.

- A backend that fails probes moves from "healthy" to "failing", and after a
  configurable threshold it is marked "unhealthy" and ejected from the pool.
- When probes start succeeding again, it does not return instantly — it is
  marked "recovering" and observes a short quarantine so that a flapping backend
  does not oscillate in and out of the pool.
- Each transition is logged and exposed as a metric, because an operator needs
  to see churn, not just the current state, to diagnose a rolling deploy or a
  network problem.

Draining is the controlled removal path.

- Before a backend is taken down for a deploy or maintenance, it is marked as
  draining: it stops receiving new connections or requests, but existing
  in-flight work finishes up to a drain timeout.
- This matters for stateful workloads and long requests — killing a connection
  mid-request corrupts state and produces client errors.
- Health checks complement draining: a backend under maintenance responds to
  probes with a non-200 status so the LB removes it naturally, and on a clean
  shutdown the backend deregisters itself.
- The result is that removals are graceful when possible and only abrupt when
  the backend actually crashes.

### How do you maintain sticky sessions?

Sticky sessions pin a client to a specific backend across requests, which is
needed when session state lives in the backend's memory (an in-progress
multipart upload, a WebSocket, a shopping cart).

- The standard mechanisms are a cookie or a hash.
- In the cookie approach, the LB sets a cookie on the first response containing
  a backend identifier; subsequent requests carrying that cookie are routed to
  the same backend.
- In the hash approach, the LB derives a stable key (client IP, or a session
  cookie value) and runs it through a consistent-hash ring, so the same client
  always maps to the same backend.

The tradeoff is between distribution and stickiness.

- Pure hashing keeps distribution fair because keys spread across the ring, but
  adding or removing a backend re-maps some clients — that is what consistent
  hashing minimizes, re-mapping only roughly 1/N of keys per membership change.
- Cookie-based stickiness is exact but can create hot spots: if a popular client
  lands on one backend, it stays there.
- Both approaches degrade in the presence of the same failure, so the design
  must define what happens when the pinned backend dies.

The answer is re-pinning with a bounded cost.

- When the pinned backend is unhealthy or draining, the LB falls back to a fresh
  scheduling decision and sets a new cookie, meaning the session is rebuilt on
  another backend.
- The LB can also enforce stickiness as a preference rather than an absolute: if
  the pinned backend is overloaded, it re-binds to a healthier one.
- Session data should not rely on stickiness alone, so production designs pair
  stickiness with a shared session store or replication that makes the pinned
  backend a fast path rather than the only copy of the state.

### How do you scale the load balancer itself?

A single load balancer is a single point of failure and a throughput ceiling, so
the design must make the LB pool horizontally scalable and redundant.

- The classic pattern is two or more LBs running active-passive, sharing a
  virtual IP via VRRP, where the standby takes over on failure.
- The higher-scale pattern is active-active: all LBs are live, traffic is spread
  across them by DNS (multiple A records with short TTLs) or by anycast routing,
  and each LB handles its share of traffic.
- Anycast gives near-automatic failover because a dead node stops advertising
  and packets reroute, at the cost of per-connection affinity management across
  data centers.

Horizontal scaling pushes the distribution problem up one layer.

- With multiple LBs, the scheduler must spread across backends while the DNS
  layer spreads across LBs.
- Each LB runs the same scheduling logic against the same backend set, so the
  configuration and health-check state must be shared.
- Config is pushed to all replicas from a control plane, and health state is
  either computed independently per LB (each probes on its own, which is fine
  for detecting backend failure) or shared for consistency.
- Backend connection reuse means each LB holds a connection pool per backend, so
  capacity planning must count sockets, not just connections.

Scaling in tiers handles very large traffic.

- An L4 layer (raw TCP or UDP distribution) absorbs the bulk of connections and
  forwards to an L7 layer that does routing and HTTP policy, so the expensive
  per-request work happens on fewer connections.
- Client-side load balancing offloads the LBs entirely for internal services:
  the client fetches the instance list from service discovery and picks an
  instance itself, so the LB becomes the entry point only for external traffic.
- Throughout, the LB's own state must stay minimal — no local session data
  beyond the cache, so any replica can serve any client — and autoscaling the
  pool is then just adding replicas behind the same virtual address.

## Source

```text
title: Load Balancer
node client: Client [round, icon=browser]
node app: Client App [icon=browser]
node dns: DNS [icon=server]
node lb: Load Balancer [icon=compute]
node pool: Backend Pool [icon=server]
node health: Health Checks [icon=compute]
node algo: Scheduling Algorithm [icon=compute]
node session: Session Affinity [icon=cache]
node tls: TLS Termination [icon=shield]
node metric: Metrics [icon=compute]
node db: Config DB [cylinder, icon=database]

edge client -> app: request
edge app -> dns: resolve
edge dns -> lb: endpoint
edge lb -> algo: choose
edge algo -> pool: backend
edge lb -> health: probe
edge health -> pool: mark
edge lb -> session: bind
edge session -> algo: pin
edge lb -> tls: terminate
edge lb -> metric: log
```

## Q&A

### Q: Design a load balancer

**A:** A load balancer sits in front of a pool of backend servers and distributes
incoming connections or requests across them.

- It presents a single virtual address, hides the pool behind it, and adds the
  operational superpowers that make pools manageable: health checks that remove
  dead backends, TLS termination so certificates are managed in one place,
  connection and request timeouts, and the ability to add or remove capacity
  without touching clients.
- The client talks only to the load balancer, and the pool behind it is a
  private implementation detail.

A production load balancer has a data plane and a control plane.

- The data plane is the hot path: it terminates the client connection, applies
  the scheduling algorithm to pick a backend, manages the connection to the
  backend (reusing kept-alive connections to avoid per-request handshakes), and
  optionally proxies or transparently forwards the payload.
- The control plane handles configuration, health checking, metrics, and
  membership updates.
- The two planes are separated for a reason: config churn and health-check
  traffic must never compete with request forwarding on the hot path, and the
  data plane should continue to forward traffic even if the control plane
  degrades.

Hardware load balancers give raw throughput but are pricey and hard to scale;
software load balancers (NGINX, HAProxy, Envoy) run on commodity servers and
scale horizontally.

- The design tradeoffs are throughput versus flexibility: hardware LBs excel at
  simple L4 forwarding, while software LBs support rich L7 features like
  path-based routing, retries, and per-route policies.
- Most modern designs also push some distribution down into the client side via
  DNS and client-side load balancing, so the LB pool is one of several layers of
  distribution rather than the only one.

### Q: How do you distribute traffic across backends?

**A:** Distribution is a scheduling decision: given a set of healthy backends, which
one should handle this request?

- The simplest algorithms — round robin and random — spread load evenly but
  ignore differences in backend capacity, which is why weighted variants exist:
  each backend declares a weight, and the scheduler biases the selection
  proportionally, letting larger instances absorb more traffic.
- Least-connections goes further by tracking in-flight requests per backend and
  preferring the least loaded, which matters when requests have wildly variable
  durations.

Beyond raw algorithms, distribution needs load awareness.

- The scheduler should estimate load per backend using a combination of
  connection counts, request counts, and reported CPU or latency, so a backend
  that is slow or saturated is downgraded even if it is healthy.
- Consistency of the chosen backend matters for some workloads, which is where
  hashing and affinity come in — discussed with sticky sessions.
- For L7 load balancers, distribution also includes routing decisions: path,
  host, header, or cookie rules select not just an instance but a backend pool,
  enabling canary and blue-green deployments where a fraction of traffic routes
  to a new version.

Backend selection must be cheap and consistent.

- The scheduler keeps the healthy-set in memory, recomputed on health-change
  events rather than on every request, and the selection itself is O(1) per
  request using a weighted random or a consistent-hash ring.
- When a backend is removed, in-flight requests are allowed to finish within a
  grace window and new requests are never sent to it, which is the essence of
  graceful drain.
- The metric loop samples per-backend load continuously so the algorithm reacts
  to drift within seconds.

### Q: How do you detect and drain unhealthy servers?

**A:** Detection is layered.

- The first signal is passive: the load balancer observes failed connections,
  timeouts, and protocol errors for each backend and bumps an error counter.
- A backend that fails a threshold percentage over a window is marked unhealthy
  without any additional traffic.
- Passive detection is fast and costs nothing, but it requires real traffic, so
  it is paired with active health checks: the LB probes each backend on an
  interval (TCP connect, HTTP request to a health endpoint, or protocol-specific
  ping) and flips status based on probe results.
- Active checks catch a wedged backend that happens to not be receiving traffic.

The health state machine has more than two states.

- A backend that fails probes moves from "healthy" to "failing", and after a
  configurable threshold it is marked "unhealthy" and ejected from the pool.
- When probes start succeeding again, it does not return instantly — it is
  marked "recovering" and observes a short quarantine so that a flapping backend
  does not oscillate in and out of the pool.
- Each transition is logged and exposed as a metric, because an operator needs
  to see churn, not just the current state, to diagnose a rolling deploy or a
  network problem.

Draining is the controlled removal path.

- Before a backend is taken down for a deploy or maintenance, it is marked as
  draining: it stops receiving new connections or requests, but existing
  in-flight work finishes up to a drain timeout.
- This matters for stateful workloads and long requests — killing a connection
  mid-request corrupts state and produces client errors.
- Health checks complement draining: a backend under maintenance responds to
  probes with a non-200 status so the LB removes it naturally, and on a clean
  shutdown the backend deregisters itself.
- The result is that removals are graceful when possible and only abrupt when
  the backend actually crashes.

### Q: How do you maintain sticky sessions?

**A:** Sticky sessions pin a client to a specific backend across requests, which is
needed when session state lives in the backend's memory (an in-progress
multipart upload, a WebSocket, a shopping cart).

- The standard mechanisms are a cookie or a hash.
- In the cookie approach, the LB sets a cookie on the first response containing
  a backend identifier; subsequent requests carrying that cookie are routed to
  the same backend.
- In the hash approach, the LB derives a stable key (client IP, or a session
  cookie value) and runs it through a consistent-hash ring, so the same client
  always maps to the same backend.

The tradeoff is between distribution and stickiness.

- Pure hashing keeps distribution fair because keys spread across the ring, but
  adding or removing a backend re-maps some clients — that is what consistent
  hashing minimizes, re-mapping only roughly 1/N of keys per membership change.
- Cookie-based stickiness is exact but can create hot spots: if a popular client
  lands on one backend, it stays there.
- Both approaches degrade in the presence of the same failure, so the design
  must define what happens when the pinned backend dies.

The answer is re-pinning with a bounded cost.

- When the pinned backend is unhealthy or draining, the LB falls back to a fresh
  scheduling decision and sets a new cookie, meaning the session is rebuilt on
  another backend.
- The LB can also enforce stickiness as a preference rather than an absolute: if
  the pinned backend is overloaded, it re-binds to a healthier one.
- Session data should not rely on stickiness alone, so production designs pair
  stickiness with a shared session store or replication that makes the pinned
  backend a fast path rather than the only copy of the state.

### Q: How do you scale the load balancer itself?

**A:** A single load balancer is a single point of failure and a throughput ceiling, so
the design must make the LB pool horizontally scalable and redundant.

- The classic pattern is two or more LBs running active-passive, sharing a
  virtual IP via VRRP, where the standby takes over on failure.
- The higher-scale pattern is active-active: all LBs are live, traffic is spread
  across them by DNS (multiple A records with short TTLs) or by anycast routing,
  and each LB handles its share of traffic.
- Anycast gives near-automatic failover because a dead node stops advertising
  and packets reroute, at the cost of per-connection affinity management across
  data centers.

Horizontal scaling pushes the distribution problem up one layer.

- With multiple LBs, the scheduler must spread across backends while the DNS
  layer spreads across LBs.
- Each LB runs the same scheduling logic against the same backend set, so the
  configuration and health-check state must be shared.
- Config is pushed to all replicas from a control plane, and health state is
  either computed independently per LB (each probes on its own, which is fine
  for detecting backend failure) or shared for consistency.
- Backend connection reuse means each LB holds a connection pool per backend, so
  capacity planning must count sockets, not just connections.

Scaling in tiers handles very large traffic.

- An L4 layer (raw TCP or UDP distribution) absorbs the bulk of connections and
  forwards to an L7 layer that does routing and HTTP policy, so the expensive
  per-request work happens on fewer connections.
- Client-side load balancing offloads the LBs entirely for internal services:
  the client fetches the instance list from service discovery and picks an
  instance itself, so the LB becomes the entry point only for external traffic.
- Throughout, the LB's own state must stay minimal — no local session data
  beyond the cache, so any replica can serve any client — and autoscaling the
  pool is then just adding replicas behind the same virtual address.

## Source

```text
title: Load Balancer
node client: Client [round, icon=browser]
node app: Client App [icon=browser]
node dns: DNS [icon=server]
node lb: Load Balancer [icon=compute]
node pool: Backend Pool [icon=server]
node health: Health Checks [icon=compute]
node algo: Scheduling Algorithm [icon=compute]
node session: Session Affinity [icon=cache]
node tls: TLS Termination [icon=shield]
node metric: Metrics [icon=compute]
node db: Config DB [cylinder, icon=database]

edge client -> app: request
edge app -> dns: resolve
edge dns -> lb: endpoint
edge lb -> algo: choose
edge algo -> pool: backend
edge lb -> health: probe
edge health -> pool: mark
edge lb -> session: bind
edge session -> algo: pin
edge lb -> tls: terminate
edge lb -> metric: log
```
