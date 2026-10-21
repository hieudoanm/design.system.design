import type { Problem } from '../types';

export const googleDocsCollaboration: Problem = {
  slug: 'google-docs-collaboration',
  title: 'Google Docs collaboration',
  tagline: 'Real-time collaborative editing with OT/CRDT, presence, comments, and offline support.',
  difficulty: 'Hard',
  tags: ['OT', 'CRDT', 'Operational transform', 'Conflict-free', 'Presence'],
  group: 'collaboration-commerce',
  functional: [
    'Multiple users edit the same document simultaneously.',
    'Character/word-level conflict resolution (OT or CRDT).',
    'Cursors and selections visible to all collaborators (presence).',
    'Comments, suggestions, and threaded discussions.',
    'Offline editing with sync on reconnect.',
    'Version history and restore.',
  ],
  nonFunctional: [
    'Keystroke-to-visibility latency p99 under 100 ms (same region).',
    'Support 100 concurrent editors per document.',
    'Document size up to 1M characters.',
    'No data loss: all operations persisted and replayable.',
  ],
  estimation: [
    '1M active documents, 10M ops/sec peak.',
    'Operation log: 10M ops/sec × 200 bytes = 2 GB/sec write.',
    'Presence: 100 editors × 50 Hz = 5K updates/sec per hot doc.',
    'History: 1M ops/day per doc × 100 bytes = 100 MB/day per doc.',
  ],
  diagram: `flowchart LR
  subgraph EDIT [Editing]
    CA[Client A] --> GW[Collab gateway] --> COLLAB[Collab service] --> OT[OT / CRDT engine]
    CB[Client B] --> GW
    CC[Client C] --> GW
    OT --> DOC[Document service] --> DOCS_DB[(Documents DB)]
  end
  subgraph PRESENCE [Presence]
    CA -.-> PRES[Presence service] --> CA
    CB -.-> PRES
    CC -.-> PRES
  end`,
  design: [
    {
      title: 'OT vs CRDT',
      body: 'Operational Transform (OT): central server transforms concurrent operations against each other so they appear sequential. CRDT (Conflict-free Replicated Data Type): operations are commutative by design (for example, RGA, YATA for text). Google Docs historically used OT (Jupiter); modern systems (Figma, Redis CRDT) use CRDT for decentralised editing. Both achieve convergence.',
    },
    {
      title: 'Collab service and gateway',
      body: 'The collab gateway (WebSocket) connects clients to the collab service. The service holds the document state in memory (for hot docs) and applies operations from clients. It broadcasts transformed operations to all other clients. The document service persists the operation log (append-only) and periodic snapshots.',
    },
    {
      title: 'Presence',
      body: 'Cursor position, selection range, and user color are sent as lightweight presence updates (separate WebSocket channel or multiplexed). The presence service fans out to all collaborators. Updates are throttled (50 Hz max) and compressed (delta encoding).',
    },
    {
      title: 'Offline and history',
      body: 'Offline: the client queues operations locally. On reconnect, it sends the queued ops with a base version. The server transforms them against the current state and applies. History: the operation log enables replay. Snapshots every N ops (for example 1,000) speed up loading. Version history UI lets users browse and restore.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a network partition?',
      a: 'Clients continue editing locally (optimistic). Operations are queued. On partition heal, the server reconciles. With CRDT, merges are automatic. With OT, the server transforms queued ops against the canonical state.',
    },
    {
      q: 'What about large documents (1M+ chars)?',
      a: 'Split the document into segments (for example, paragraphs). Each segment has its own OT/CRDT state. Operations target a segment. This reduces the transformation scope and memory footprint.',
    },
    {
      q: 'How do you test convergence?',
      a: 'Property-based testing: generate random concurrent operation sequences, apply to multiple replicas, verify final state equality. Run in CI for every engine change. Also test with network delay/failure injection.',
    },
  ],
};
