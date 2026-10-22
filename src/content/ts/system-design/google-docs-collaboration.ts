import type { Problem } from './types';

export const googleDocsCollaboration: Problem = {
  slug: 'google-docs-collaboration',
  title: 'Collaborative editor',
  tagline: 'Let many people edit the same document at once without conflicts.',
  difficulty: 'Easy',
  tags: ['collaboration', 'realtime'],
  functional: [
    'Open and edit a document with several collaborators at once.',
    'Broadcast edits, presence and cursors in real time.',
    'Persist the document and keep a version history.',
    'Reconnect after a drop and merge what was typed offline.',
  ],
  nonFunctional: [
    'A local keystroke echoes immediately and remote edits arrive within 200 ms.',
    'Every client converges to the same text once edits stop.',
    'A document supports hundreds of concurrent editors.',
    'Reconnecting must not lose or duplicate edits.',
  ],
  estimation: [
    '100M documents in use with 10 editors each is 1M live WebSocket connections.',
    'One edit per editor every 5 seconds is 200k operations per second.',
    'At 200 bytes an operation the op log is about 40 GB a day before compaction.',
    'Snapshotting every 1000 operations at 10 KB per snapshot is about 1 TB for 100M documents.',
  ],
  diagram: ` Client A ─┐
 Client B ─┼─► Collab gateway ─► Collab service ─► OT / CRDT engine
 Client C ─┘        ▲                  │                    │
                    │                  ├─► Presence service │
                    └── peer edits ◄───┘                    ▼
                                                    Document service ─► Documents DB
                                                          │
                                                          └─► Version history (snapshots)`,
  design: [
    {
      title: 'Overview',
      body: 'The core is a shared document with a canonical, server-side ordered state and a set of concurrent editors applying operations over WebSockets.\n\n- Each keystroke generates an operation (insert/delete at an offset) that is sent to a collaboration gateway.\n- The server applies operations in a consistent order, transforms concurrent ops so every client converges to the same document, and broadcasts the applied result to all connected editors.\n- The document itself is kept in memory (an operational-log / state snapshot with a revision number) and durably persisted asynchronously with version snapshots for history and crash recovery.\n- Presence tracks who is connected and where their cursor is.\n- The hard problems are ordering and conflict resolution (OT/CRDT), throttling broadcast under many concurrent cursors, and reconciling offline edits when a client reconnects.',
    },
  ],
  qa: [
    {
      q: 'OT vs CRDT: which do you choose and why?',
      a: 'OT (operational transformation) transforms an operation against previously applied concurrent operations so both clients converge to the same result; it is what Google Docs uses.\n\n- It keeps documents compact and natural (string-level inserts/deletes with position-based indices), which matters for a text editor with rich formatting.\n- The cost is significant complexity: you need a central server to serialize ops, a correct transform algorithm per operation type, and careful state reconciliation.\n\nCRDTs (conflict-free replicated data types) are mathematically mergeable without a central coordinator and require no transforms, making them great for decentralized or offline-first editing (e.g. Figma, some wikis) and simpler to reason about for append-heavy data (lists, counters).\n\n- For document-style rich text, CRDTs use more memory and produce tombstone-laden, harder-to-compact histories.\n- Choose OT when you have (or accept) a central server and rich-text documents; choose CRDT when you want decentralized replication, offline-first sync, or predictable merges without a server.',
    },
    {
      q: 'How do you handle concurrent edits and conflicts?',
      a: "The server is the ordering authority: every op gets a monotonically increasing revision, and all clients apply ops in server-assigned order.\n\n- When two ops overlap, the server uses transform (or CRDT merge) to produce a consistent result — for example, two people inserting at the same offset both keep their text, ordered deterministically by the transformation rules.\n- Clients never resolve conflicts among themselves; they send ops, receive the canonical order, and apply.\n- On reconnect, a client sends its last-seen revision and the server replays ops it missed, so even offline edits merge back through the same pipeline.\n- Ambiguities are resolved deterministically (e.g. by editor ID and timestamp as tie-breakers) so every participant's document is bit-identical at every revision.",
    },
    {
      q: 'How do you broadcast edits to hundreds of collaborators?',
      a: 'Hundreds of clients on one document makes naive "broadcast every op to everyone" heavy, but because ops are small (a few bytes) it is feasible if the server coalesces and throttles.\n\n- Keep one authoritative gateway per document (consistent-hash the document to a collab node) so ordering and fan-out are local.\n- Broadcast only deltas: the applied op plus a revision.\n- Throttle the wire messages by batching ops per tick (e.g. flush every ~100ms) so a burst of keystrokes becomes one frame of updates.\n- Use a publish/subscribe fan-out on the gateway over the existing WebSocket connections, and only to clients subscribed to that document.\n- Cursor and presence moves are the real bandwidth hog — send those on a separate, aggressively throttled channel.\n- The collab node keeps the document state in memory, so fan-out never touches disk.',
    },
    {
      q: 'Design presence and cursors for live collaboration',
      a: 'Presence = who is viewing, and cursor = where their caret is.\n\n- Both are high-frequency ephemeral signals, so never write them to the document store.\n- Clients send cursor positions as throttled messages (e.g. 10–30/s max, batched) over the WebSocket; the server stores per-user cursor state in memory on the collab node and pushes it to other viewers as deltas.\n- When a user scrolls or types, only their cursor moves, so broadcast just the change.\n- On join/leave the server updates the viewer list and notifies participants.\n- Add presence heartbeats with a short timeout to expire stale cursors.\n- Because cursor data is volatile, crashes simply drop cursors — clients re-send their position on reconnect.\n- Separate this high-frequency channel from the op pipeline so a flurry of cursor moves never delays actual document edits.',
    },
  ],
};
