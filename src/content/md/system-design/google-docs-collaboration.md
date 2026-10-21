# Google Docs — Collaboration

Design Google Docs / real-time collaborative editing

**Difficulty:** Easy

**Tags:** collaboration, realtime

## Functional Requirements

- Google Docs / real-time collaborative editing
- OT vs CRDT: which do you choose and why?
- handle concurrent edits and conflicts?
- broadcast edits to hundreds of collaborators?
- presence and cursors for live collaboration

## Non-Functional Requirements

- Highly available
- Low latency
- Horizontally scalable

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Google Docs Collaboration
client: Client
ws: Collab Gateway
collab: Collab Service
crdt: OT / CRDT Engine
doc: Document Service
presence: Presence Service
history: Version History
db: Documents DB
cache: Session Cache

client ─► ws ─► connect
ws ─► presence ─► online
client ─► ws ─► edit op
ws ─► collab ─► apply op
collab ─► crdt ─► transform / merge
crdt ─► doc ─► apply
collab ─► ws ─► broadcast op
ws ─► client ─► peer edits
collab ─► cache ─► snapshot
doc ─► db ─► persist
doc ─► history ─► snapshot
client ─► doc ─► open
```

## Design

### Design Google Docs / real-time collaborative editing

The core is a shared document with a canonical, server-side ordered state and a
set of concurrent editors applying operations over WebSockets.

- Each keystroke generates an operation (insert/delete at an offset) that is
  sent to a collaboration gateway.
- The server applies operations in a consistent order, transforms concurrent ops
  so every client converges to the same document, and broadcasts the applied
  result to all connected editors.
- The document itself is kept in memory (an operational-log / state snapshot
  with a revision number) and durably persisted asynchronously with version
  snapshots for history and crash recovery.
- Presence tracks who is connected and where their cursor is.
- The hard problems are ordering and conflict resolution (OT/CRDT), throttling
  broadcast under many concurrent cursors, and reconciling offline edits when a
  client reconnects.

### OT vs CRDT: which do you choose and why?

OT (operational transformation) transforms an operation against previously
applied concurrent operations so both clients converge to the same result; it is
what Google Docs uses.

- It keeps documents compact and natural (string-level inserts/deletes with
  position-based indices), which matters for a text editor with rich formatting.
- The cost is significant complexity: you need a central server to serialize
  ops, a correct transform algorithm per operation type, and careful state
  reconciliation.

CRDTs (conflict-free replicated data types) are mathematically mergeable without
a central coordinator and require no transforms, making them great for
decentralized or offline-first editing (e.g. Figma, some wikis) and simpler to
reason about for append-heavy data (lists, counters).

- For document-style rich text, CRDTs use more memory and produce
  tombstone-laden, harder-to-compact histories.
- Choose OT when you have (or accept) a central server and rich-text documents;
  choose CRDT when you want decentralized replication, offline-first sync, or
  predictable merges without a server.

### How do you handle concurrent edits and conflicts?

The server is the ordering authority: every op gets a monotonically increasing
revision, and all clients apply ops in server-assigned order.

- When two ops overlap, the server uses transform (or CRDT merge) to produce a
  consistent result — for example, two people inserting at the same offset both
  keep their text, ordered deterministically by the transformation rules.
- Clients never resolve conflicts among themselves; they send ops, receive the
  canonical order, and apply.
- On reconnect, a client sends its last-seen revision and the server replays ops
  it missed, so even offline edits merge back through the same pipeline.
- Ambiguities are resolved deterministically (e.g. by editor ID and timestamp as
  tie-breakers) so every participant's document is bit-identical at every
  revision.

### How do you broadcast edits to hundreds of collaborators?

Hundreds of clients on one document makes naive "broadcast every op to everyone"
heavy, but because ops are small (a few bytes) it is feasible if the server
coalesces and throttles.

- Keep one authoritative gateway per document (consistent-hash the document to a
  collab node) so ordering and fan-out are local.
- Broadcast only deltas: the applied op plus a revision.
- Throttle the wire messages by batching ops per tick (e.g. flush every ~100ms)
  so a burst of keystrokes becomes one frame of updates.
- Use a publish/subscribe fan-out on the gateway over the existing WebSocket
  connections, and only to clients subscribed to that document.
- Cursor and presence moves are the real bandwidth hog — send those on a
  separate, aggressively throttled channel.
- The collab node keeps the document state in memory, so fan-out never touches
  disk.

### Design presence and cursors for live collaboration

Presence = who is viewing, and cursor = where their caret is.

- Both are high-frequency ephemeral signals, so never write them to the document
  store.
- Clients send cursor positions as throttled messages (e.g. 10–30/s max,
  batched) over the WebSocket; the server stores per-user cursor state in memory
  on the collab node and pushes it to other viewers as deltas.
- When a user scrolls or types, only their cursor moves, so broadcast just the
  change.
- On join/leave the server updates the viewer list and notifies participants.
- Add presence heartbeats with a short timeout to expire stale cursors.
- Because cursor data is volatile, crashes simply drop cursors — clients re-send
  their position on reconnect.
- Separate this high-frequency channel from the op pipeline so a flurry of
  cursor moves never delays actual document edits.

## Source

```text
title: Google Docs Collaboration
node client: Client [round, icon=browser]
node ws: Collab Gateway [icon=server]
node collab: Collab Service [icon=message]
node crdt: OT / CRDT Engine [icon=compute]
node doc: Document Service [icon=file]
node presence: Presence Service [icon=users]
node history: Version History [icon=sync]
node db: Documents DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> ws: connect
edge ws -> presence: online
edge client -> ws: edit op
edge ws -> collab: apply op
edge collab -> crdt: transform / merge
edge crdt -> doc: apply
edge collab -> ws: broadcast op
edge ws -> client: peer edits
edge collab -> cache: snapshot
edge doc -> db: persist
edge doc -> history: snapshot
edge client -> doc: open
```

## Q&A

### Q: Design Google Docs / real-time collaborative editing

**A:** The core is a shared document with a canonical, server-side ordered state and a
set of concurrent editors applying operations over WebSockets.

- Each keystroke generates an operation (insert/delete at an offset) that is
  sent to a collaboration gateway.
- The server applies operations in a consistent order, transforms concurrent ops
  so every client converges to the same document, and broadcasts the applied
  result to all connected editors.
- The document itself is kept in memory (an operational-log / state snapshot
  with a revision number) and durably persisted asynchronously with version
  snapshots for history and crash recovery.
- Presence tracks who is connected and where their cursor is.
- The hard problems are ordering and conflict resolution (OT/CRDT), throttling
  broadcast under many concurrent cursors, and reconciling offline edits when a
  client reconnects.

### Q: OT vs CRDT: which do you choose and why?

**A:** OT (operational transformation) transforms an operation against previously
applied concurrent operations so both clients converge to the same result; it is
what Google Docs uses.

- It keeps documents compact and natural (string-level inserts/deletes with
  position-based indices), which matters for a text editor with rich formatting.
- The cost is significant complexity: you need a central server to serialize
  ops, a correct transform algorithm per operation type, and careful state
  reconciliation.

CRDTs (conflict-free replicated data types) are mathematically mergeable without
a central coordinator and require no transforms, making them great for
decentralized or offline-first editing (e.g. Figma, some wikis) and simpler to
reason about for append-heavy data (lists, counters).

- For document-style rich text, CRDTs use more memory and produce
  tombstone-laden, harder-to-compact histories.
- Choose OT when you have (or accept) a central server and rich-text documents;
  choose CRDT when you want decentralized replication, offline-first sync, or
  predictable merges without a server.

### Q: How do you handle concurrent edits and conflicts?

**A:** The server is the ordering authority: every op gets a monotonically increasing
revision, and all clients apply ops in server-assigned order.

- When two ops overlap, the server uses transform (or CRDT merge) to produce a
  consistent result — for example, two people inserting at the same offset both
  keep their text, ordered deterministically by the transformation rules.
- Clients never resolve conflicts among themselves; they send ops, receive the
  canonical order, and apply.
- On reconnect, a client sends its last-seen revision and the server replays ops
  it missed, so even offline edits merge back through the same pipeline.
- Ambiguities are resolved deterministically (e.g. by editor ID and timestamp as
  tie-breakers) so every participant's document is bit-identical at every
  revision.

### Q: How do you broadcast edits to hundreds of collaborators?

**A:** Hundreds of clients on one document makes naive "broadcast every op to everyone"
heavy, but because ops are small (a few bytes) it is feasible if the server
coalesces and throttles.

- Keep one authoritative gateway per document (consistent-hash the document to a
  collab node) so ordering and fan-out are local.
- Broadcast only deltas: the applied op plus a revision.
- Throttle the wire messages by batching ops per tick (e.g. flush every ~100ms)
  so a burst of keystrokes becomes one frame of updates.
- Use a publish/subscribe fan-out on the gateway over the existing WebSocket
  connections, and only to clients subscribed to that document.
- Cursor and presence moves are the real bandwidth hog — send those on a
  separate, aggressively throttled channel.
- The collab node keeps the document state in memory, so fan-out never touches
  disk.

### Q: Design presence and cursors for live collaboration

**A:** Presence = who is viewing, and cursor = where their caret is.

- Both are high-frequency ephemeral signals, so never write them to the document
  store.
- Clients send cursor positions as throttled messages (e.g. 10–30/s max,
  batched) over the WebSocket; the server stores per-user cursor state in memory
  on the collab node and pushes it to other viewers as deltas.
- When a user scrolls or types, only their cursor moves, so broadcast just the
  change.
- On join/leave the server updates the viewer list and notifies participants.
- Add presence heartbeats with a short timeout to expire stale cursors.
- Because cursor data is volatile, crashes simply drop cursors — clients re-send
  their position on reconnect.
- Separate this high-frequency channel from the op pipeline so a flurry of
  cursor moves never delays actual document edits.

## Source

```text
title: Google Docs Collaboration
node client: Client [round, icon=browser]
node ws: Collab Gateway [icon=server]
node collab: Collab Service [icon=message]
node crdt: OT / CRDT Engine [icon=compute]
node doc: Document Service [icon=file]
node presence: Presence Service [icon=users]
node history: Version History [icon=sync]
node db: Documents DB [cylinder, icon=database]
node cache: Session Cache [cylinder, icon=cache]

edge client -> ws: connect
edge ws -> presence: online
edge client -> ws: edit op
edge ws -> collab: apply op
edge collab -> crdt: transform / merge
edge crdt -> doc: apply
edge collab -> ws: broadcast op
edge ws -> client: peer edits
edge collab -> cache: snapshot
edge doc -> db: persist
edge doc -> history: snapshot
edge client -> doc: open
```
