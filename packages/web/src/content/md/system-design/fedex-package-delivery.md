# FedEx — Package Delivery

Design a package delivery / shipping system

**Difficulty:** Hard

**Tags:** delivery, package

## Functional Requirements

- a package delivery / shipping system
- generate and scan tracking events at scale?
- route packages through sorting hubs?
- plan last-mile delivery routes?
- handle delays and customer notifications?

## Non-Functional Requirements

- A package delivery system has two faces: the customer-facing shipping product
  (create shipment, generate label, track) and the operations backbone (sorting
  hubs, routes, and the delivery fleet).

- I would build it as a gateway in front of shipment, label, sorting, tracking,
  and route-planning services, with a Shipments DB and a notification service.
- Shipment creation is a write-heavy but low-latency flow; tracking is a
  read-heavy append-only flow; and sorting and routing are batch-oriented
  workloads.
- The label is the physical handshake between digital and physical systems, so
  it encodes a machine-readable identifier that survives printing and
  reprinting.

When a sender creates a shipment through the app, the shipment service registers
it, the label generator produces a scannable label, and the sorting engine
computes the network path through hubs.

- From there the route planner assigns the package to a delivery route, the
  carrier scans events during delivery, and the tracking service appends those
  events for the customer.
- The sender can then query tracking through the same app, so the read path and
  the operational path share one data model.
- Return shipments reuse the same pipeline with the roles of sender and receiver
  swapped, which avoids a second bespoke workflow.

I would separate the hot customer path from the operational pipeline with
queues: shipment creation publishes events consumed by sorting and routing
workers, so a surge of holiday parcels does not make the API slower.

- The tradeoff is that route assignments and ETAs are computed asynchronously
  and therefore slightly stale, which is acceptable because tracking shows
  real-time scans as the authoritative progress signal.
- Pricing and dimension validation happen at creation, so the label always
  reflects the contracted rate..
- Tracking events arrive from scanning devices on handhelds, conveyors, and gate
  scanners, and they can spike enormously during sortation.

- I would ingest them through an event queue so that a scan burst decouples from
  downstream processing, then append events to a tracking store optimized for
  the two access patterns: fetch the full timeline for one package, and compute
  the latest status per package for dashboards.
- Scan latency budgets are tight because a stopped conveyor means the whole hub
  waits, so the ingest path must be synchronous enough to avoid drops but never
  block sortation.

Each scan carries a package id, location, timestamp, and status code, and is
deduplicated by a unique event id because scanners retry when networks are
flaky.

- I would partition the tracking store by package id so a single package's
  timeline lives on one node, and store recent status in a cache for fast
  lookups.
- Retention tiers keep the last 90 days hot and archive older events to cheaper
  object storage, since full histories are rarely queried.
- Dead-letter handling flags scans that cannot be matched to a shipment for
  manual repair rather than silently dropping them.

The read side matters as much as the write side: customers poll the app, so
tracking endpoints must be cheap.

- I would serve the latest status from cache and fetch the full timeline from
  the store only when requested.
- Event ordering is preserved per package by writing to an append-only log keyed
  by sequence, which also gives the audit trail needed when a package is lost
  and a claim must be investigated.
- Analytics over the event stream drive reliability metrics like scan timeliness
  by hub..
- Last mile is the most expensive leg, and the route planner must sequence stops
  so that each driver respects time windows and capacity while travel distance
  stays low.

- I would feed the planner a set of packages assigned to a zone, each with a
  delivery window and a location, and solve a vehicle routing problem with
  capacity constraints.
- For the typical zone of tens to hundreds of stops, a cluster-first,
  route-second heuristic is fast enough and near-optimal.
- Capacity here includes package volume and vehicle type, so the planner matches
  stops to the right van or bike and respects driver shift hours.

Routes change during the day: a customer redirects, a stop is impossible, or a
package was misloaded.

- I would make the route mutable and re-optimize the remaining stops when a
  driver reports a deviation, pushing the updated sequence to the driver's
  handheld.
- The driver app is also the source of scan events that flow into tracking, so
  the route planner and the tracking pipeline share the same stop identifiers.
- Proof-of-delivery photos and signatures arrive as the last scan of each stop
  and close the loop for claims and notifications.

The tradeoff is optimization time versus responsiveness: a perfect global
solution is too slow to recompute mid-route, while a purely greedy plan degrades
quality.

- I would solve each zone independently so zones scale horizontally, and use
  travel time estimates from historical data rather than live traffic so plans
  are stable.
- Delivery windows promised to customers are soft constraints in the planner;
  the system tries hard to meet them and uses the same data to set honest ETAs.
- Rain, traffic, and construction are absorbed by the re-optimizer rather than
  by inflating every estimate..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Package Delivery
sender: Sender
app: Shipping App
gateway: API Gateway
ship: Shipment Service
label: Label Generator
sort: Sorting Engine
track: Tracking Service
route: Route Planner
carrier: Delivery Fleet
notify: Notifications
db: Shipments DB

sender ─► app ─► create shipment
app ─► gateway ─► request
gateway ─► ship ─► register
ship ─► label ─► generate
label ─► sort ─► route
sort ─► route ─► assign
route ─► carrier ─► deliver
carrier ─► track ─► scan events
track ─► notify ─► updates
ship ─► db ─► store
track ─► db ─► append
sender ─► app ─► track
```

## Design

### Design a package delivery / shipping system

A package delivery system has two faces: the customer-facing shipping product
(create shipment, generate label, track) and the operations backbone (sorting
hubs, routes, and the delivery fleet).

- I would build it as a gateway in front of shipment, label, sorting, tracking,
  and route-planning services, with a Shipments DB and a notification service.
- Shipment creation is a write-heavy but low-latency flow; tracking is a
  read-heavy append-only flow; and sorting and routing are batch-oriented
  workloads.
- The label is the physical handshake between digital and physical systems, so
  it encodes a machine-readable identifier that survives printing and
  reprinting.

When a sender creates a shipment through the app, the shipment service registers
it, the label generator produces a scannable label, and the sorting engine
computes the network path through hubs.

- From there the route planner assigns the package to a delivery route, the
  carrier scans events during delivery, and the tracking service appends those
  events for the customer.
- The sender can then query tracking through the same app, so the read path and
  the operational path share one data model.
- Return shipments reuse the same pipeline with the roles of sender and receiver
  swapped, which avoids a second bespoke workflow.

I would separate the hot customer path from the operational pipeline with
queues: shipment creation publishes events consumed by sorting and routing
workers, so a surge of holiday parcels does not make the API slower.

- The tradeoff is that route assignments and ETAs are computed asynchronously
  and therefore slightly stale, which is acceptable because tracking shows
  real-time scans as the authoritative progress signal.
- Pricing and dimension validation happen at creation, so the label always
  reflects the contracted rate.

### How do you generate and scan tracking events at scale?

Tracking events arrive from scanning devices on handhelds, conveyors, and gate
scanners, and they can spike enormously during sortation.

- I would ingest them through an event queue so that a scan burst decouples from
  downstream processing, then append events to a tracking store optimized for
  the two access patterns: fetch the full timeline for one package, and compute
  the latest status per package for dashboards.
- Scan latency budgets are tight because a stopped conveyor means the whole hub
  waits, so the ingest path must be synchronous enough to avoid drops but never
  block sortation.

Each scan carries a package id, location, timestamp, and status code, and is
deduplicated by a unique event id because scanners retry when networks are
flaky.

- I would partition the tracking store by package id so a single package's
  timeline lives on one node, and store recent status in a cache for fast
  lookups.
- Retention tiers keep the last 90 days hot and archive older events to cheaper
  object storage, since full histories are rarely queried.
- Dead-letter handling flags scans that cannot be matched to a shipment for
  manual repair rather than silently dropping them.

The read side matters as much as the write side: customers poll the app, so
tracking endpoints must be cheap.

- I would serve the latest status from cache and fetch the full timeline from
  the store only when requested.
- Event ordering is preserved per package by writing to an append-only log keyed
  by sequence, which also gives the audit trail needed when a package is lost
  and a claim must be investigated.
- Analytics over the event stream drive reliability metrics like scan timeliness
  by hub.

### How do you route packages through sorting hubs?

Sorting hubs are a network problem: a package must be moved from origin to
destination through one or more hub transfers, and each hub can only process so
many parcels per hour.

- I would model the network as a directed graph of hubs and lane capacities,
  then solve routing as a shortest-path problem where the cost is a blend of
  distance, transit time, and lane capacity headroom.
- The sorting engine computes the route when the label is generated and stamps
  it on the label data.
- Hubs operate on a schedule of waves, so the route must also respect cutoff
  times; a package missing its wave waits for the next one rather than delaying
  the whole trailer.

Because capacity changes in real time as hubs back up, I would recompute routes
periodically rather than once.

- A central orchestrator publishes hub load and lane health, and the sorting
  engine reroutes packages that have not yet left their origin.
- Priority tiers (express versus standard) are embedded as weight in the cost
  function, so express parcels are not stuck behind bulk standard volume on a
  saturated lane.
- Overnight redistribution moves packages between zones only when lane cost
  falls, keeping the plan adaptive but stable.

At peak, solving per-package shortest paths is wasteful; most packages in a
region share the same route, so I would compute routes per origin-destination
pair and cache them, then adjust only the edges near saturation.

- The tradeoff is that cached routes lag current conditions, so the orchestrator
  must detect a jammed hub and invalidate the affected pairs quickly.
- The label's machine-readable route id lets sorters at each hub act on the plan
  without any real-time dependency.

### How do you plan last-mile delivery routes?

Last mile is the most expensive leg, and the route planner must sequence stops
so that each driver respects time windows and capacity while travel distance
stays low.

- I would feed the planner a set of packages assigned to a zone, each with a
  delivery window and a location, and solve a vehicle routing problem with
  capacity constraints.
- For the typical zone of tens to hundreds of stops, a cluster-first,
  route-second heuristic is fast enough and near-optimal.
- Capacity here includes package volume and vehicle type, so the planner matches
  stops to the right van or bike and respects driver shift hours.

Routes change during the day: a customer redirects, a stop is impossible, or a
package was misloaded.

- I would make the route mutable and re-optimize the remaining stops when a
  driver reports a deviation, pushing the updated sequence to the driver's
  handheld.
- The driver app is also the source of scan events that flow into tracking, so
  the route planner and the tracking pipeline share the same stop identifiers.
- Proof-of-delivery photos and signatures arrive as the last scan of each stop
  and close the loop for claims and notifications.

The tradeoff is optimization time versus responsiveness: a perfect global
solution is too slow to recompute mid-route, while a purely greedy plan degrades
quality.

- I would solve each zone independently so zones scale horizontally, and use
  travel time estimates from historical data rather than live traffic so plans
  are stable.
- Delivery windows promised to customers are soft constraints in the planner;
  the system tries hard to meet them and uses the same data to set honest ETAs.
- Rain, traffic, and construction are absorbed by the re-optimizer rather than
  by inflating every estimate.

### How do you handle delays and customer notifications?

Delays are inevitable, and the goal is to convert a silent failure into a
managed promise.

- I would compute an expected delivery time from the route plan and predicted
  transit times, then compare actual scan times against it in the tracking
  pipeline.
- When a package misses a commit, a delay engine updates the ETA, publishes the
  change to the customer, and triggers exception handling for the most severe
  cases.
- High-value parcels get proactive outreach instead of passive status updates,
  while standard parcels simply receive the revised ETA.

Notifications are event-driven and templated: out for delivery, delayed,
attempted, delivered, and exception.

- I would route them through the notification service with per-channel
  preferences, and throttle so a customer does not receive ten messages in an
  hour.
- Because delivery windows shift, the notification includes the new window, and
  the system updates it when the route re-plans rather than sending a second,
  contradictory message.
- Preferences also matter for choice: some customers want SMS for every scan,
  others only for exceptions.

The design principle is that every customer-facing ETA is derived from the same
plan the driver follows.

- Delays caused by weather or misloads flow through the same delay engine, and
  the customer service console sees the same timeline a customer sees, so a
  support agent can explain exactly what happened.
- Analytics over delay causes feed back into capacity planning and
  promise-setting, gradually making the promises more accurate rather than just
  apologizing for them.
- A daily audit reconciles promised versus delivered windows and tracks on-time
  percentage as the north-star metric.

## Source

```text
title: Package Delivery
node sender: Sender [round, icon=browser]
node app: Shipping App [icon=browser]
node gateway: API Gateway [icon=server]
node ship: Shipment Service [icon=compute]
node label: Label Generator [icon=file]
node sort: Sorting Engine [icon=worker]
node track: Tracking Service [icon=search]
node route: Route Planner [icon=compute]
node carrier: Delivery Fleet [icon=users]
node notify: Notifications [icon=message]
node db: Shipments DB [cylinder, icon=database]

edge sender -> app: create shipment
edge app -> gateway: request
edge gateway -> ship: register
edge ship -> label: generate
edge label -> sort: route
edge sort -> route: assign
edge route -> carrier: deliver
edge carrier -> track: scan events
edge track -> notify: updates
edge ship -> db: store
edge track -> db: append
edge sender -> app: track
```

## Q&A

### Q: Design a package delivery / shipping system

**A:** A package delivery system has two faces: the customer-facing shipping product
(create shipment, generate label, track) and the operations backbone (sorting
hubs, routes, and the delivery fleet).

- I would build it as a gateway in front of shipment, label, sorting, tracking,
  and route-planning services, with a Shipments DB and a notification service.
- Shipment creation is a write-heavy but low-latency flow; tracking is a
  read-heavy append-only flow; and sorting and routing are batch-oriented
  workloads.
- The label is the physical handshake between digital and physical systems, so
  it encodes a machine-readable identifier that survives printing and
  reprinting.

When a sender creates a shipment through the app, the shipment service registers
it, the label generator produces a scannable label, and the sorting engine
computes the network path through hubs.

- From there the route planner assigns the package to a delivery route, the
  carrier scans events during delivery, and the tracking service appends those
  events for the customer.
- The sender can then query tracking through the same app, so the read path and
  the operational path share one data model.
- Return shipments reuse the same pipeline with the roles of sender and receiver
  swapped, which avoids a second bespoke workflow.

I would separate the hot customer path from the operational pipeline with
queues: shipment creation publishes events consumed by sorting and routing
workers, so a surge of holiday parcels does not make the API slower.

- The tradeoff is that route assignments and ETAs are computed asynchronously
  and therefore slightly stale, which is acceptable because tracking shows
  real-time scans as the authoritative progress signal.
- Pricing and dimension validation happen at creation, so the label always
  reflects the contracted rate.

### Q: How do you generate and scan tracking events at scale?

**A:** Tracking events arrive from scanning devices on handhelds, conveyors, and gate
scanners, and they can spike enormously during sortation.

- I would ingest them through an event queue so that a scan burst decouples from
  downstream processing, then append events to a tracking store optimized for
  the two access patterns: fetch the full timeline for one package, and compute
  the latest status per package for dashboards.
- Scan latency budgets are tight because a stopped conveyor means the whole hub
  waits, so the ingest path must be synchronous enough to avoid drops but never
  block sortation.

Each scan carries a package id, location, timestamp, and status code, and is
deduplicated by a unique event id because scanners retry when networks are
flaky.

- I would partition the tracking store by package id so a single package's
  timeline lives on one node, and store recent status in a cache for fast
  lookups.
- Retention tiers keep the last 90 days hot and archive older events to cheaper
  object storage, since full histories are rarely queried.
- Dead-letter handling flags scans that cannot be matched to a shipment for
  manual repair rather than silently dropping them.

The read side matters as much as the write side: customers poll the app, so
tracking endpoints must be cheap.

- I would serve the latest status from cache and fetch the full timeline from
  the store only when requested.
- Event ordering is preserved per package by writing to an append-only log keyed
  by sequence, which also gives the audit trail needed when a package is lost
  and a claim must be investigated.
- Analytics over the event stream drive reliability metrics like scan timeliness
  by hub.

### Q: How do you route packages through sorting hubs?

**A:** Sorting hubs are a network problem: a package must be moved from origin to
destination through one or more hub transfers, and each hub can only process so
many parcels per hour.

- I would model the network as a directed graph of hubs and lane capacities,
  then solve routing as a shortest-path problem where the cost is a blend of
  distance, transit time, and lane capacity headroom.
- The sorting engine computes the route when the label is generated and stamps
  it on the label data.
- Hubs operate on a schedule of waves, so the route must also respect cutoff
  times; a package missing its wave waits for the next one rather than delaying
  the whole trailer.

Because capacity changes in real time as hubs back up, I would recompute routes
periodically rather than once.

- A central orchestrator publishes hub load and lane health, and the sorting
  engine reroutes packages that have not yet left their origin.
- Priority tiers (express versus standard) are embedded as weight in the cost
  function, so express parcels are not stuck behind bulk standard volume on a
  saturated lane.
- Overnight redistribution moves packages between zones only when lane cost
  falls, keeping the plan adaptive but stable.

At peak, solving per-package shortest paths is wasteful; most packages in a
region share the same route, so I would compute routes per origin-destination
pair and cache them, then adjust only the edges near saturation.

- The tradeoff is that cached routes lag current conditions, so the orchestrator
  must detect a jammed hub and invalidate the affected pairs quickly.
- The label's machine-readable route id lets sorters at each hub act on the plan
  without any real-time dependency.

### Q: How do you plan last-mile delivery routes?

**A:** Last mile is the most expensive leg, and the route planner must sequence stops
so that each driver respects time windows and capacity while travel distance
stays low.

- I would feed the planner a set of packages assigned to a zone, each with a
  delivery window and a location, and solve a vehicle routing problem with
  capacity constraints.
- For the typical zone of tens to hundreds of stops, a cluster-first,
  route-second heuristic is fast enough and near-optimal.
- Capacity here includes package volume and vehicle type, so the planner matches
  stops to the right van or bike and respects driver shift hours.

Routes change during the day: a customer redirects, a stop is impossible, or a
package was misloaded.

- I would make the route mutable and re-optimize the remaining stops when a
  driver reports a deviation, pushing the updated sequence to the driver's
  handheld.
- The driver app is also the source of scan events that flow into tracking, so
  the route planner and the tracking pipeline share the same stop identifiers.
- Proof-of-delivery photos and signatures arrive as the last scan of each stop
  and close the loop for claims and notifications.

The tradeoff is optimization time versus responsiveness: a perfect global
solution is too slow to recompute mid-route, while a purely greedy plan degrades
quality.

- I would solve each zone independently so zones scale horizontally, and use
  travel time estimates from historical data rather than live traffic so plans
  are stable.
- Delivery windows promised to customers are soft constraints in the planner;
  the system tries hard to meet them and uses the same data to set honest ETAs.
- Rain, traffic, and construction are absorbed by the re-optimizer rather than
  by inflating every estimate.

### Q: How do you handle delays and customer notifications?

**A:** Delays are inevitable, and the goal is to convert a silent failure into a
managed promise.

- I would compute an expected delivery time from the route plan and predicted
  transit times, then compare actual scan times against it in the tracking
  pipeline.
- When a package misses a commit, a delay engine updates the ETA, publishes the
  change to the customer, and triggers exception handling for the most severe
  cases.
- High-value parcels get proactive outreach instead of passive status updates,
  while standard parcels simply receive the revised ETA.

Notifications are event-driven and templated: out for delivery, delayed,
attempted, delivered, and exception.

- I would route them through the notification service with per-channel
  preferences, and throttle so a customer does not receive ten messages in an
  hour.
- Because delivery windows shift, the notification includes the new window, and
  the system updates it when the route re-plans rather than sending a second,
  contradictory message.
- Preferences also matter for choice: some customers want SMS for every scan,
  others only for exceptions.

The design principle is that every customer-facing ETA is derived from the same
plan the driver follows.

- Delays caused by weather or misloads flow through the same delay engine, and
  the customer service console sees the same timeline a customer sees, so a
  support agent can explain exactly what happened.
- Analytics over delay causes feed back into capacity planning and
  promise-setting, gradually making the promises more accurate rather than just
  apologizing for them.
- A daily audit reconciles promised versus delivered windows and tracks on-time
  percentage as the north-star metric.

## Source

```text
title: Package Delivery
node sender: Sender [round, icon=browser]
node app: Shipping App [icon=browser]
node gateway: API Gateway [icon=server]
node ship: Shipment Service [icon=compute]
node label: Label Generator [icon=file]
node sort: Sorting Engine [icon=worker]
node track: Tracking Service [icon=search]
node route: Route Planner [icon=compute]
node carrier: Delivery Fleet [icon=users]
node notify: Notifications [icon=message]
node db: Shipments DB [cylinder, icon=database]

edge sender -> app: create shipment
edge app -> gateway: request
edge gateway -> ship: register
edge ship -> label: generate
edge label -> sort: route
edge sort -> route: assign
edge route -> carrier: deliver
edge carrier -> track: scan events
edge track -> notify: updates
edge ship -> db: store
edge track -> db: append
edge sender -> app: track
```
