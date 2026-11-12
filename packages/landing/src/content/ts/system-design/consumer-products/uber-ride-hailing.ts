import type { Problem } from '../types';

export const uberRideHailing: Problem = {
  slug: 'uber-ride-hailing',
  title: 'Uber ride hailing',
  tagline: 'Match riders to drivers in real time with geo-indexing, surge pricing, and dispatch.',
  difficulty: 'Hard',
  tags: ['Geo-index', 'Real-time matching', 'Surge pricing', 'WebSocket'],
  group: 'consumer-products',
  functional: [
    'Rider requests a ride with pickup/drop-off locations.',
    'Find nearby drivers (within 5 min ETA) and dispatch to the best match.',
    'Driver accepts/declines; on decline, re-dispatch.',
    'Track trip in real time; support surge pricing during high demand.',
  ],
  nonFunctional: [
    'Match latency p99 under 2 seconds.',
    'Handle 1M concurrent rides, 10M requests/sec peak.',
    'Driver location updates every 2-4 seconds.',
    'Surge pricing updates every minute per hex cell.',
  ],
  estimation: [
    '1M active drivers, location update every 3 sec = 333K updates/sec.',
    'Geo index: H3 hex grid (resolution 8) ≈ 1.2M cells worldwide.',
    'Dispatch: 10K requests/sec, each scans ~100 nearby drivers.',
    'WebSocket connections: 1M drivers + 5M riders = 6M persistent connections.',
  ],
  diagram: `flowchart LR
  subgraph MATCH [Matching]
    RAPP[Rider app] --> GW[API gateway] --> RM[Ride matching] --> GEO[Geo index]
    GEO --> DISPATCH[Dispatch queue] --> DAPP[Driver app]
  end
  subgraph SURGE [Surge pricing]
    DEMAND[Demand signal] --> SURGE[Surge engine] --> HEX[Hex cells]
    HEX --> DAPP
  end
  subgraph TRIP [Trip tracking]
    DAPP -.-> WS[WebSocket gateway] -.-> RAPP
    DAPP -.-> LOC[Location service]
  end`,
  design: [
    {
      title: 'Geo indexing with H3',
      body: "Uber uses Uber H3 (hexagonal hierarchical spatial index). The world is divided into hex cells at multiple resolutions. Resolution 8 (≈ 0.7 km edge) is used for dispatch. Each driver's location is mapped to a cell and stored in a distributed in-memory store (Redis Cluster). Finding nearby drivers = query the rider's cell + ring of neighbors (K-ring). This is O(1) per cell and highly parallelisable.",
    },
    {
      title: 'Matching and dispatch',
      body: 'On ride request, the ride matching service queries the geo index for drivers in the K-ring. It scores candidates by ETA, driver rating, vehicle type, and acceptance rate. The top candidate gets a dispatch offer (WebSocket push). The driver has 10-15 seconds to accept. On decline or timeout, the next candidate is offered. The dispatch queue ensures fairness and prevents starvation.',
    },
    {
      title: 'Surge pricing',
      body: 'Surge is computed per hex cell per minute. Inputs: demand (open requests in cell), supply (active drivers in cell), historical baseline. The surge engine outputs a multiplier (1.0x to 5.0x+). The multiplier is pushed to drivers in the cell and shown to riders requesting in the cell. Surge attracts drivers to high-demand areas and dampens rider demand.',
    },
    {
      title: 'Real-time tracking',
      body: 'Driver and rider apps maintain WebSocket connections to a gateway fleet. Location updates (lat, lon, bearing, speed) are sent every few seconds. The gateway fans out to the other party in the trip. The location service also updates the geo index for matching. The WebSocket gateway is stateless; connection state is in Redis.',
    },
  ],
  qa: [
    {
      q: 'What if no driver accepts?',
      a: 'Expand the K-ring (search wider), increase surge multiplier, and notify the rider of the delay. After a timeout (for example 5 min), cancel and offer a scheduled ride or alternative.',
    },
    {
      q: 'How do you handle driver location spoofing?',
      a: 'Validate location updates: speed limit checks, route consistency, and map-matching to roads. Anomalous updates are discarded. Persistent spoofing triggers fraud review.',
    },
    {
      q: 'How do you scale WebSocket connections?',
      a: 'Stateless gateway fleet behind a load balancer. Connection ID maps to gateway instance in Redis. Horizontal scaling adds gateway instances. Use connection sharding by user ID for affinity.',
    },
  ],
};
