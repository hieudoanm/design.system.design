# System Design Framework

The steps to follow in any system design interview.

## 1. Clarify requirements

Separate functional from non-functional requirements. Ask about scale, read/write ratio and what is out of scope.

## 2. Estimate

Work out requests per second, storage and bandwidth. Rough numbers are enough to decide whether you need sharding or caching.

## 3. Sketch the API and data model

List the main endpoints and entities. Pick storage that matches the access pattern.

## 4. Draw the high-level design

Clients, load balancer, services, data stores, caches and queues. Walk one request through end to end.

## 5. Go deep on the hard parts

Pick the one or two components that are hardest (key generation, fan-out, consistency) and discuss trade-offs.

## 6. Find bottlenecks and failures

What happens when a node, a zone or a dependency fails? Add replication, retries, monitoring and rate limits.
