import type { Problem } from './types';

export const dropboxFileSync: Problem = {
  slug: 'dropbox-file-sync',
  title: 'File sync service',
  tagline: 'Store files as deduplicated blocks and keep every device in sync.',
  difficulty: 'Easy',
  tags: ['file-sync', 'storage'],
  functional: [
    'Upload and download files and folders.',
    'Sync changes across every device a user owns.',
    'Resume interrupted uploads and downloads.',
    'Keep version history and restore an old version.',
  ],
  nonFunctional: [
    'A small change reaches other devices within a few seconds.',
    'Stored bytes are durable and deduplicated per account.',
    'Clients on bad networks resume instead of restarting.',
    'Conflicting edits produce a conflicted copy rather than silent data loss.',
  ],
  estimation: [
    '500M users with 10 GB each is 5 EB of raw data; dedupe and compression trim it but it stays in the exabytes.',
    '100M files a day at 1 MB average is 100 TB of new bytes before dedupe.',
    'With 4 MB chunks, metadata is a small manifest per file, about 1 KB, so 100 GB a day.',
    '500M devices polling every 30 seconds would be 17M requests per second, so changes are pushed, not polled.',
  ],
  diagram: ` Client ─► API gateway ─► Sync worker ─► Metadata DB
   │            │              │              ▲
   │            │              └─► Metadata service
   │            └─► Upload service ─► Block storage (content-addressed)
   │                        │
   └─◄ Notifications ◄──────┴─► Versioning ─► Block storage (history)

 A chunk is stored once per account, keyed by its hash.`,
  design: [
    {
      title: 'Overview',
      body: "Clients watch the filesystem for changes, split files into fixed-size blocks, and compute content hashes so only new blocks upload.\n\n- An API gateway fronts upload, metadata, and sync services.\n- The upload service stores blocks in object storage; the metadata service persists the file tree, block references, and per-client cursors in a metadata DB.\n- Sync workers diff the client's snapshot against server state, then push or pull changes, with notifications telling other devices to fetch.\n- Versioning snapshots preserve history as content-addressed manifests.\n- Key trade-offs: dedupe at block granularity, delta sync over whole-file transfer, bandwidth throttling for uploads, and a well-defined conflict resolution policy for concurrent edits.",
    },
  ],
  qa: [
    {
      q: 'How do you detect and sync file changes efficiently?',
      a: "The client keeps a local snapshot of each file (size, mtime, and per-block hashes) and compares it against the server's tree.\n\n- Changes are detected by walking directories and re-hashing file blocks with SHA-256, transferring only missing or modified blocks.\n- Content addressing lets you skip unchanged blocks even when the file changes elsewhere, and renames are handled by fingerprint rather than path.\n- On the server, a sync worker compares the client's cursor against committed metadata and computes an add/update/delete diff.\n- Incremental sync is cursor-based so each device pulls only deltas after the first full sync.\n- Use notifications or long polling to trigger reconciliation rather than periodic full scans.",
    },
    {
      q: 'Why store files as content-addressed blocks?',
      a: 'Splitting files into fixed-size blocks keyed by their content hash (SHA-256) gives deduplication: identical blocks across files and users are stored once, so a shared dependency or a duplicate upload costs nothing extra.\n\n- It also enables efficient delta sync, since a new version references reused blocks and only changed ones upload.\n- Content addressing provides integrity verification, because a hash mismatch exposes corruption, and makes blocks immutable, which simplifies replication and CDN caching.\n- The metadata layer keeps the manifest: file id, ordered block list, and logical path.\n- Trade-offs: block-index overhead and hashing cost on small files, so use a minimum file threshold or variable-size chunking (rolling hash) to balance dedupe against compute.',
    },
    {
      q: 'How do you handle concurrent edits to the same file?',
      a: 'Use a versioned, optimistic model.\n\n- Every accepted edit creates a new version; the server records the head version for each file.\n- On upload the client sends the base version it edited; if the server head has advanced, the server rejects the write with the current version, and the client either fetches and retries or writes a conflict copy such as "Name (User\'s conflicted copy)".\n- Commits are serialized per file via a version counter, and metadata updates are transactional so a stale client can never silently overwrite newer data.\n- Most sync products choose last-writer-wins plus conflict copies over automatic three-way merge because sequential collaborators rarely collide, making the behavior predictable and recoverable.',
    },
    {
      q: 'Design version history and rollback',
      a: "Every committed snapshot is a manifest of content-addressed blocks, so history is a chain of manifests in the metadata DB; versions share blocks, meaning storage cost is only the delta.\n\n- An API lists versions (id, author, timestamp, size).\n- Restore is atomic pointer-swap: point the file's current manifest at an older one, with no data copy because blocks are immutable.\n- Garbage-collect orphaned blocks by reference counting once no manifest references them.\n- Retention policies thin history over time (full history for N days, then hourly or weekly snapshots).\n- Folder-wide restore applies the same pointer-swap per file in a transaction.\n- Version listing is read-heavy and served from cache.",
    },
  ],
};
