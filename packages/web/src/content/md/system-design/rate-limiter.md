# Rate limiter

Protect services by capping how many requests a client can make in a time window.

**Difficulty:** Medium

**Tags:** Algorithms, Redis, Distributed counters

## Functional Requirements

- Limit by user, IP address, API key or endpoint.
- Reject excess requests with HTTP 429 and a Retry-After header.
- Change rules without redeploying.
- Work correctly across many application servers.

## Non-Functional Requirements

- Add only a few milliseconds to each request.
- Decide up front whether to fail open or fail closed if the limiter breaks.
- Be accurate enough under distributed load.
- Use little memory per client.

## Estimation

- 1M active clients at about 100 bytes of state each is about 100 MB. That fits in one Redis shard.
- 500k checks per second at peak across the fleet means sharding Redis by client key.

## Architecture Diagram

```
 Client ─► API gateway ─► Rate limiter ─► Backend services
                             │    ▲
                   rules ◄───┘    └───► Redis cluster
              (config store,            (counters, atomic Lua scripts)
               cached locally)

 Over the limit:  Rate limiter ─► 429 + Retry-After
```

## Design

### Algorithms

**Token bucket.** A bucket holds up to N tokens and refills at a steady rate. Each request takes one. It allows short bursts and needs only two numbers per client.

**Leaky bucket.** Requests enter a queue that drains at a fixed rate. It smooths traffic into a constant output.

**Fixed window counter.** Count requests per minute. Simple, but a client can send double the limit around a window boundary.

**Sliding window log.** Keep a timestamp for every request. Exact, but memory grows with the limit.

**Sliding window counter.** Blend the current and previous window counts by overlap. Close to exact and cheap.

### Where it runs

Client-side limiting cannot be trusted. The usual home is the API gateway or a middleware in front of the services. In a service mesh it can run as a sidecar. Keep the rules in a config store and cache them in each limiter, so changing a limit does not require a deploy.

### Getting counts right across servers

A read-modify-write from many servers creates race conditions. Do the check and update atomically in Redis, with a Lua script or `INCR` plus `EXPIRE`. For lower latency, each node can keep a local counter and sync to Redis periodically, trading some accuracy for speed.

### What the client sees

Return `429 Too Many Requests` with `Retry-After`. Many APIs also send `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset` so clients can back off before they are blocked.

## Q&A

### Q: Which algorithm would you choose, and why?

**A:** Token bucket is a strong default: it permits bursts, which real clients produce, uses O(1) memory and is easy to reason about. Choose a sliding window counter if you need smoother, stricter limits. Choose a leaky bucket if the downstream system needs a constant request rate.

### Q: How do you keep counts consistent across many servers?

**A:** Keep the counter in a shared store and make the check atomic, using a Redis Lua script. Shard Redis by client key so each client's counter lives on one node. If the extra network hop is too slow, use local counters that sync periodically and accept some overshoot.

### Q: Should the limiter fail open or fail closed if Redis is down?

**A:** It depends on what you protect. Failing open keeps the product available but removes protection, which is usually right for ordinary APIs. Failing closed is safer for expensive or abuse-prone endpoints such as login or payments. Either way, alert on it and consider a local in-memory fallback.

### Q: How do you handle attackers who use many IP addresses?

**A:** Layer the limits: per IP, per account, per API key, and a global cap per endpoint. Put coarse filtering at the CDN or WAF, and use account-based limits for authenticated routes, since those are harder to rotate than IPs.

### Q: How would you rate limit across multiple regions?

**A:** Giving each region a share of the global quota is simple and fast, but wastes capacity when traffic is uneven. Replicating counters asynchronously between regions is more accurate but allows brief overshoot. Most systems accept that approximation.
