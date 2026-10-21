import type { Problem } from '../types';

export const dropboxFileSync: Problem = {
  slug: 'dropbox-file-sync',
  title: 'Dropbox file sync',
  tagline:
    'Sync files across devices with block-level deduplication, conflict resolution, and selective sync.',
  difficulty: 'Hard',
  tags: ['Content-addressed storage', 'Delta sync', 'Conflict resolution', 'Selective sync'],
  group: 'collaboration-commerce',
  functional: [
    'Sync files and folders across desktop, mobile, and web.',
    'Block-level deduplication: only changed blocks upload.',
    'Conflict resolution: last-writer-wins with copy-on-conflict.',
    'Selective sync: choose which folders occupy local disk.',
    'File requests and shared folders with permissions.',
  ],
  nonFunctional: [
    'Sync latency p99 under 5 seconds for small files.',
    'Handle 500M users, 10B files, 100 PB stored.',
    'Bandwidth efficient: resume interrupted transfers.',
    'Offline support: local changes queue and sync on reconnect.',
  ],
  estimation: [
    '10B files × avg 100 KB = 1 PB metadata. Metadata DB: 10B rows.',
    'Block size 4 MB. 100 PB / 4 MB = 25B blocks. Content-addressed (SHA-256).',
    'Daily active sync: 50M users × 100 files = 5B operations/day.',
    'Delta sync saves 90%+ bandwidth vs full file upload.',
  ],
  diagram: `flowchart LR
  subgraph CLIENT [Client]
    FS[File watcher] --> CHUNK[Chunker] --> HASH[SHA-256]
    HASH --> META[Metadata DB] --> PLAN[Sync plan]
    PLAN --> UP[Upload missing blocks] --> BLK[(Block storage)]
    PLAN --> DOWN[Download missing blocks] --> BLK
  end
  subgraph SERVER [Server]
    META --> VER[Versioning]
    VER --> CONF[Conflict resolver]
    CONF --> NOTIF[Notifications] --> OTHER[Other clients]
  end`,
  design: [
    {
      title: 'Content-addressed block storage',
      body: 'Files are split into 4 MB blocks (configurable). Each block is hashed (SHA-256) and stored in object storage keyed by hash. The metadata DB maps `file_id → [block_hashes]`. Deduplication: if a block already exists (same content), the upload is skipped. This works across users (global dedupe) and across versions of the same file.',
    },
    {
      title: 'Delta sync protocol',
      body: "The client watches the local filesystem (fsevents, inotify, ReadDirectoryChangesW). On change, it chunks the file, hashes blocks, and queries the metadata DB for which blocks are missing. It uploads only missing blocks. The server updates the file's block list and version. Other clients are notified via long-poll/WebSocket and download the new blocks.",
    },
    {
      title: 'Conflict resolution',
      body: 'If two clients modify the same file offline, the server detects a version conflict (divergent block lists). Resolution: keep both. The server creates a conflict copy: `File (Conflict from Laptop).ext`. The user decides which to keep. For shared folders, the same logic applies per-user.',
    },
    {
      title: 'Selective sync and smart sync',
      body: 'Selective sync: the user chooses folders to sync locally. Unselected folders exist only in the cloud. Smart sync (online-only): files show in the filesystem but are stubs (reparse points). On open, the client downloads blocks on-demand. This saves local disk for large, rarely-accessed files.',
    },
  ],
  qa: [
    {
      q: 'How do you handle a 10 GB file upload?',
      a: 'Chunked into 4 MB blocks (2,500 blocks). Upload in parallel (for example 8 concurrent). Resume on failure by checking which blocks are already in block storage. Verify final hash matches.',
    },
    {
      q: 'What if block storage loses a block?',
      a: 'Blocks are stored with 3x replication (or erasure coding). The metadata DB can verify block existence on read. A background job scans for missing blocks and triggers re-replication from other replicas.',
    },
    {
      q: 'How do you prevent sync loops?',
      a: 'Each change generates a new version vector. The client ignores notifications for versions it already has. The server includes the originating client ID in notifications; the sender ignores its own echoes.',
    },
  ],
};
