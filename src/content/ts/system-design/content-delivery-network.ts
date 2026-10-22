import type { Problem } from './types';

export const contentDeliveryNetwork: Problem = {
  slug: 'content-delivery-network',
  title: 'Content delivery network',
  tagline: 'Cache content at the edge and route every request to the nearest node.',
  difficulty: 'Medium',
  tags: ['analytics', 'cache', 'cdn'],
  group: 'building-blocks',
  functional: [
    'Serve content from an edge node near the user.',
    'Cache objects and revalidate them against the origin.',
    'Purge or invalidate objects across the network.',
    'Route each request to the nearest healthy edge.',
  ],
  nonFunctional: [
    'Static assets hit the cache more than 95% of the time.',
    'Time to first byte stays under 50 ms p99 at the edge.',
    'Peak egress reaches tens of terabits per second.',
    'A purge reaches every edge within seconds, and stale content is served if the origin is down.',
  ],
  estimation: [
    '1,000 points of presence, each with 10–100 TB of SSD cache.',
    '10 Tbps of egress is 1.25 TB per second; a 1 MB object at a million requests per second needs about 8 Gbps per PoP.',
    'An origin shield cuts origin traffic to roughly 1% of edge misses.',
    'Access logs at a million requests per second and 200 bytes each are 17 TB a day.',
  ],
  diagram: ` User ─► DNS / anycast router ─► Nearest edge ─► Edge cache ── hit ──► User
                                     │                │
                                     │                └─ miss ─► Origin shield ─► Origin store
                                     └─► Access logs ─► Analytics

 Control plane ─► Invalidation ─► purge edges`,
  design: [
    {
      title: 'Overview',
      body: "A CDN moves content closer to users by caching it on edge servers distributed across the world, so the vast majority of requests never reach the origin.\n\n- The user resolves the domain through a DNS router, which returns the IP of the nearest healthy edge — nearest by measured network distance and load.\n- The user then requests content from that edge, which serves it from the edge cache on a hit, or fetches it from the origin on a miss, caches it, and streams it back.\n- Large objects such as video are served as byte ranges and streamed, so a CDN is functionally a reverse-proxy cache with a large, multi-tier storage layout.\n\nBehind the data plane sits a control plane that owns cache policy (TTLs, cache keys, vary rules), runs invalidation to purge stale content across all edges, and tracks origin health.\n\n- Access logs stream from every edge to an analytics pipeline that produces per-URL, per-PoP, and per-customer metrics.\n- Replication is inherent — every point of presence independently caches — so the design must balance hit ratio against cost: more copies raise hit ratio but consume capacity and make purges slower.\n- The classic tension is between serving from the closest edge and serving from the edge most likely to already hold the content; routing heuristics trade off these goals, and cache fill strategies (proactive push for scheduled events, lazy fill otherwise) bias the trade in favor of the workload.\n- Capacity planning is per-PoP: each pop's disk, bandwidth, and origin-fetch budget are monitored, and over-provisioned pops are preferred for new content fills while constrained pops shed cold content to make room.",
    },
  ],
  qa: [
    {
      q: 'How do you route users to the nearest edge?',
      a: "Routing starts at DNS.\n\n- The CDN's authoritative DNS servers see the resolver's IP — or, with EDNS Client Subnet, the actual user's subnet — and return the IPs of the closest point of presence (PoP).\n- \"Closest\" is computed from a map of network distances built from RTT measurements and IP-to-PoP tables, not from pure geography, because undersea cable paths routinely beat straight-line distance.\n- The DNS response returns several edge IPs with a short TTL so routing can adapt to failures and load shifts, and the DNS layer can shed a PoP by simply removing it from responses.\n\nMany CDNs reinforce DNS routing with anycast: every PoP advertises the same addresses, and the network itself delivers each packet to the nearest PoP.\n\n- Anycast gives failover for free — a dead PoP stops advertising and traffic reroutes — but it can steer a user's connections to different PoPs, so HTTP keep-alives are pinned per connection to avoid cross-PoP hops.\n- Larger CDNs prefer unicast with a global load balancer that tracks per-PoP load and health, gaining explicit control to divert traffic off a congested or degraded PoP.\n- Either way, the control plane periodically re-measures RTTs to tune the distance map, and a user who lands on an uncached or overloaded PoP can be redirected at the request layer to a better edge.\n- Routing also accounts for content type: video and large downloads may be directed to pops with spare bandwidth even if a slightly closer pop is congested, while HTML and API traffic favor the lowest-latency path.",
    },
    {
      q: 'How do you keep edge caches consistent with origin?',
      a: 'Cache consistency is governed by cache-control headers from the origin plus explicit invalidation.\n\n- The origin sets TTLs per object — static assets get long TTLs (hours to a year), HTML and API responses get short ones — and edges honor `max-age`, `s-maxage`, `stale-while-revalidate`, and `ETag`/`Last-Modified` headers.\n- On a miss or an expired entry, the edge revalidates with the origin using a conditional request (`If-None-Match`); a 304 returns the cached copy, a 200 refreshes it.\n- Most content is deliberately served slightly stale, because true freshness would require an origin round trip for every single read, which would defeat the entire purpose of the CDN.\n\nFor changes that must propagate immediately — a corrected image, a revoked resource — the control plane runs an invalidation.\n\n- Invalidation is asynchronous by design: the origin submits a purge job, the control plane spreads it to every PoP, and each edge marks the affected cache entries stale and fetches fresh on the next request.\n- Because propagating to thousands of edges takes seconds to minutes, purges are reconciled with versioned cache keys or manifests: content URLs embed a version or hash (`v=123`), so the origin simply serves the new URL and lets the old object expire naturally.\n- Content versioning is the highest throughput invalidation mechanism of all — it turns a global purge into a cache-key cleanup job and makes the "consistent with origin" question mostly a matter of correct TTL configuration.\n- Cache-key design is part of consistency: keys incorporate host, path, query, and the configured vary headers (`Vary: Accept-Encoding`, `Vary: Cookie`), so responses that differ between users never share an entry — and cookies are stripped from keys unless explicitly allowed.',
    },
    {
      q: 'How do you handle cache stampedes and thundering herds?',
      a: "A stampede happens when a cache entry expires and a burst of requests arrives simultaneously: without protection, one miss turns into thousands of simultaneous origin fetches.\n\n- The first defense is stale-while-revalidate: the edge serves the stale copy immediately while exactly one request refreshes the cache in the background, so users never wait and the origin receives a single refresh instead of a herd.\n- Request coalescing extends this — concurrent misses for the same cache key wait on a single in-flight fetch rather than each fetching from the origin independently, so the origin sees one request no matter how many users arrive at once.\n\nThe second defense spreads expiry in time.\n\n- If a popular object has a fixed TTL, all copies at all PoPs expire at once; staggering TTLs per PoP or per edge node smooths revalidation load over time so the origin is never hit by a synchronized wave.\n- A health-based backstop protects the origin further: when the control plane sees origin load spike or origin health degrade, it instructs edges to serve stale content for a grace period and to shield — funneling all origin fetches for an object through a single shield tier per region, which absorbs the herd and caches the result.\n- These layers together let the system survive the release of a viral video or a breaking-news event without collapsing the origin under revalidation traffic.\n- The same controls protect against hot-object amplification: a single object's fill rate is capped per PoP, and origin health checks propagate a degraded state to every edge so the whole network backs off as one instead of each pop hammering the origin independently.",
    },
    {
      q: 'How do you purge content across the network?',
      a: 'A purge begins at the control plane, which takes a request for a URL, URL prefix, or cache tag and turns it into an invalidation event.\n\n- The event is broadcast to every PoP over the CDN\'s control channel, and each edge applies it to its local cache index — marking matching entries stale, removing them, or instantly replacing them with a freshly fetched version, depending on the purge type.\n- Because the fleet is enormous, the control plane batches events, assigns each purge a sequence number, and tracks per-PoP acknowledgement so an operator sees purge completion, not just submission.\n- Purge propagation time is a product spec: some guarantees are minutes, some seconds, and the system advertises them honestly.\n\nCorrectness requires ordering: a purge must not race with a fetch that re-populates the stale entry.\n\n- Edges handle this by checking the purge generation — every cache entry records the purge version it was created under, and a newer purge invalidates older entries even if they were refreshed first.\n- The purge model also defines its own consistency boundary: purges are eventually consistent across PoPs, so a client hitting one PoP may briefly see content that another PoP already purged.\n- For hard guarantees, content is versioned at the URL level, which converts "purge everywhere" into "serve the new URL," and purging becomes a housekeeping job rather than a correctness-critical path.\n- Access logs record purge activity alongside delivery, so analytics can correlate a purge storm with a hit-ratio dip.',
    },
  ],
};
