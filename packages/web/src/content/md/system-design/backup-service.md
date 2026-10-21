# Backup Service

Design a backup service

**Difficulty:** Medium

**Tags:** scheduling, security, storage

## Functional Requirements

- a backup service
- take consistent snapshots?
- store backups efficiently?
- restore data quickly?
- verify backup integrity?

## Non-Functional Requirements

- A backup service protects data against loss by periodically copying it to an
  independent store that survives failures of the primary system.

- The service needs five capabilities: scheduling, so backups happen on a policy
  without human action; snapshotting, so each backup captures a consistent
  point-in-time; storage, so backups are written durably and cheaply;
  verification, so backups are known to be restorable; and restore, so data can
  be recovered quickly when needed.
- A backup that cannot be restored is not a backup — it is wasted disk.

The architecture separates control from execution.

- A scheduler holds the backup policy per protected asset (frequency, retention,
  destination) and triggers runs.
- The backup engine executes each run: it coordinates a snapshot, splits it into
  chunks, deduplicates against previously stored chunks, and writes new chunks
  to the backup store.
- The store is append-mostly and immutable, which is what protects against
  ransomware and accidental deletes — an attacker who compromises the primary
  cannot retroactively alter history.
- A verification layer re-reads chunks and, for databases, replays them into a
  throwaway instance to prove recoverability.

The design decisions that matter are consistency (can a snapshot be applied
correctly?), efficiency (how much storage and bandwidth does history cost?), and
recovery time (how fast can the newest and the oldest backups be restored?).

- These three goals pull against each other: full snapshots restore fast but
  cost the most; incremental-only backups cost little but chain restores
  together; and verification costs resources that protect the one property that
  actually matters — the ability to come back from data loss..
- Consistency is about producing a snapshot that represents a valid state of the
  data as of a single point in time, even though the data is being written
  constantly.

- For databases the problem is sharp: copying tables one by one can yield a
  mixture of transactions where row A reflects a later state than row B, and
  replaying that combination corrupts the restore.
- The standard solution is to coordinate with the database's own consistency
  machinery, using hot backups on transactional engines (where the engine
  exposes a snapshot transaction) or quiescing writes briefly while files are
  copied.

A common practical approach is the "copy then apply log" pattern.

- The backup engine first records the current log position, then copies the data
  files, then notes the log position at copy completion.
- The backup is the data files plus the log segment between the two positions,
  so a restore replays exactly the transactions that fall in that window.
- This gives crash-consistency without stopping writes, and it is why backups of
  database-backed systems almost always involve the database's log, not just its
  files.

For distributed systems, a single consistent snapshot is not enough; the
snapshot must also be ordered across components so a restore does not
reintroduce a read that references a record the backup of another component
dropped.

- The design handles this with a global snapshot coordination point that takes
  the snapshot at a well-defined offset across all volumes, then uses
  application-level reconciliation after restore for the remaining skew.
- Whatever the mechanism, the snapshot metadata records the exact time and log
  position, because that metadata is what makes incremental backup and
  point-in-time restore possible later..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Backup Service
admin: Operator
app: Backup Console
gateway: API Gateway
schedule: Scheduler
backup: Backup Engine
snapshot: Snapshot Service
store: Backup Store
dedupe: Deduplication
verify: Verification
restore: Restore Service
db: Backup DB

admin ─► app ─► configure
app ─► gateway ─► schedule
gateway ─► schedule ─► policy
schedule ─► backup ─► trigger
backup ─► snapshot ─► capture
snapshot ─► dedupe ─► chunks
dedupe ─► store ─► save
backup ─► verify ─► check
verify ─► db ─► status
admin ─► app ─► restore
app ─► restore ─► recover
```

## Design

### Design a backup service

A backup service protects data against loss by periodically copying it to an
independent store that survives failures of the primary system.

- The service needs five capabilities: scheduling, so backups happen on a policy
  without human action; snapshotting, so each backup captures a consistent
  point-in-time; storage, so backups are written durably and cheaply;
  verification, so backups are known to be restorable; and restore, so data can
  be recovered quickly when needed.
- A backup that cannot be restored is not a backup — it is wasted disk.

The architecture separates control from execution.

- A scheduler holds the backup policy per protected asset (frequency, retention,
  destination) and triggers runs.
- The backup engine executes each run: it coordinates a snapshot, splits it into
  chunks, deduplicates against previously stored chunks, and writes new chunks
  to the backup store.
- The store is append-mostly and immutable, which is what protects against
  ransomware and accidental deletes — an attacker who compromises the primary
  cannot retroactively alter history.
- A verification layer re-reads chunks and, for databases, replays them into a
  throwaway instance to prove recoverability.

The design decisions that matter are consistency (can a snapshot be applied
correctly?), efficiency (how much storage and bandwidth does history cost?), and
recovery time (how fast can the newest and the oldest backups be restored?).

- These three goals pull against each other: full snapshots restore fast but
  cost the most; incremental-only backups cost little but chain restores
  together; and verification costs resources that protect the one property that
  actually matters — the ability to come back from data loss.

### How do you take consistent snapshots?

Consistency is about producing a snapshot that represents a valid state of the
data as of a single point in time, even though the data is being written
constantly.

- For databases the problem is sharp: copying tables one by one can yield a
  mixture of transactions where row A reflects a later state than row B, and
  replaying that combination corrupts the restore.
- The standard solution is to coordinate with the database's own consistency
  machinery, using hot backups on transactional engines (where the engine
  exposes a snapshot transaction) or quiescing writes briefly while files are
  copied.

A common practical approach is the "copy then apply log" pattern.

- The backup engine first records the current log position, then copies the data
  files, then notes the log position at copy completion.
- The backup is the data files plus the log segment between the two positions,
  so a restore replays exactly the transactions that fall in that window.
- This gives crash-consistency without stopping writes, and it is why backups of
  database-backed systems almost always involve the database's log, not just its
  files.

For distributed systems, a single consistent snapshot is not enough; the
snapshot must also be ordered across components so a restore does not
reintroduce a read that references a record the backup of another component
dropped.

- The design handles this with a global snapshot coordination point that takes
  the snapshot at a well-defined offset across all volumes, then uses
  application-level reconciliation after restore for the remaining skew.
- Whatever the mechanism, the snapshot metadata records the exact time and log
  position, because that metadata is what makes incremental backup and
  point-in-time restore possible later.

### How do you store backups efficiently?

The two levers for storage efficiency are deduplication and incremental backup,
used together.

- Deduplication operates at the chunk level: the engine splits every file into
  fixed-size or content-defined chunks, hashes each chunk, and stores only
  chunks not already present in the store.
- Chunk-level hashing means a 2 KB edit to a large file costs only the affected
  chunks, and common data shared across many machines (an OS image, a shared
  library) is stored once globally.
- Content-defined chunking, where boundaries are derived from the data rather
  than fixed offsets, makes deduplication robust to inserts that would shift
  every fixed-size chunk.

Incremental backup complements deduplication by never resending what has not
changed.

- A periodic incremental compares the current snapshot against the last one,
  uploads only changed chunks, and records a new manifest that lists the chunks
  composing the backup.
- The manifest is small and cheap to keep; the chunks are large and stored once.
- Retention then becomes a manifest-management problem: deleting an old backup
  means discarding its manifest and garbage- collecting any chunks no longer
  referenced by any remaining manifest, which runs offline to avoid corrupting
  the store during active backup.

Storage tiering contains the cost of history.

- New backups land on fast tiered storage for quick recovery of recent data, and
  cold history rolls to cheaper object or archive tiers according to policy.
- Compression and encryption are applied before the chunks leave the backup
  engine — compression reduces bandwidth and space, encryption ensures the
  backup store cannot be read if it is exfiltrated, and both run before the
  bytes hit the network so the store never sees plaintext.
- The efficiency gains are substantial in practice: with daily incrementals and
  monthly fulls, a year of history typically costs a small multiple of one full
  backup's size.

### How do you restore data quickly?

Restore speed is measured two ways: how fast the most recent state can be
recovered, and how fast any historical point can be reached.

- Recent-state restore is optimized by keeping the latest full snapshot plus its
  recent incrementals in fast storage, and by restoring in parallel — chunk
  downloads are fanned out across storage workers, and the engine reassembles
  files concurrently.
- A database restore additionally replays the log segment, which is deliberately
  the smallest replayable unit, so the engine downloads chunks, writes files,
  and replays the log to land at the exact desired point.

Point-in-time recovery (PITR) is where the snapshot model pays off.

- Because the backup engine records the log position of every snapshot, an
  operator can request "the database as of 3:14 PM Tuesday", and the restore
  downloads the snapshot closest before that time plus the log segments up to
  the target timestamp.
- The engine then replays those segments, then truncates at the target.
- PITR converts a backup system from "you get last night" to "you get the state
  just before the incident", which is usually the operational goal.

Restore is also a scaling exercise: the first question after a failure is how
many restores can run in parallel without exhausting storage bandwidth or CPU.

- The design therefore treats restores as first-class jobs with their own queue,
  priority, and progress tracking, and it pre-computes per-job chunk lists so
  the heavy planning does not happen during the recovery window.
- Finally, restore is tested, not assumed: the verification process described
  next exercises the restore path on a schedule, so when the real recovery
  happens the code path has already proven itself in production.

### How do you verify backup integrity?

Verification exists because backups fail silently: the primary looks fine, the
storage looks fine, and the corruption or missing chunk is only discovered at
restore time, when it is too late. The first layer is automated, lightweight
verification on every backup run.

- After chunks are written, the engine re-reads a sample and recomputes hashes
  to detect corrupt or short writes, and each backup's manifest is checked to
  confirm every referenced chunk exists in the store.
- These checks catch the common causes — partial uploads, silent disk errors,
  lost objects.

The second layer is full integrity verification on a schedule.

- The verifier walks every manifest, confirms every chunk is present, and
  recomputes chunk hashes against the stored hash records.
- For database backups this runs deeper: the verifier spins up a throwaway
  restore of the latest backup into a disposable instance, replays the log, and
  runs validation queries (table counts, checksums, a representative query set)
  to prove the backup actually produces a working database.
- This is the strongest signal the service can emit, because it exercises the
  exact restore path with real machinery.

The third layer is the restore drill.

- Periodic tests restore the oldest retained backup, a mid-history point, and a
  PITR target into a sandbox, then report success or failure per target.
- If a backup is found corrupt, the pipeline reacts automatically: it raises an
  alert, quarantines the corrupt data, and if possible reconstructs the affected
  chunks from adjacent snapshots or by re-capturing from the primary.
- Every verification result is recorded in the backup catalog, so the catalog
  becomes a report card proving the stated retention policy is real — and it is
  the first thing an auditor or an operator checks during an incident.

## Source

```text
title: Backup Service
node admin: Operator [round, icon=browser]
node app: Backup Console [icon=browser]
node gateway: API Gateway [icon=server]
node schedule: Scheduler [icon=compute]
node backup: Backup Engine [icon=worker]
node snapshot: Snapshot Service [icon=compute]
node store: Backup Store [cylinder, icon=file]
node dedupe: Deduplication [icon=cache]
node verify: Verification [icon=shield]
node restore: Restore Service [icon=compute]
node db: Backup DB [cylinder, icon=database]

edge admin -> app: configure
edge app -> gateway: schedule
edge gateway -> schedule: policy
edge schedule -> backup: trigger
edge backup -> snapshot: capture
edge snapshot -> dedupe: chunks
edge dedupe -> store: save
edge backup -> verify: check
edge verify -> db: status
edge admin -> app: restore
edge app -> restore: recover
```

## Q&A

### Q: Design a backup service

**A:** A backup service protects data against loss by periodically copying it to an
independent store that survives failures of the primary system.

- The service needs five capabilities: scheduling, so backups happen on a policy
  without human action; snapshotting, so each backup captures a consistent
  point-in-time; storage, so backups are written durably and cheaply;
  verification, so backups are known to be restorable; and restore, so data can
  be recovered quickly when needed.
- A backup that cannot be restored is not a backup — it is wasted disk.

The architecture separates control from execution.

- A scheduler holds the backup policy per protected asset (frequency, retention,
  destination) and triggers runs.
- The backup engine executes each run: it coordinates a snapshot, splits it into
  chunks, deduplicates against previously stored chunks, and writes new chunks
  to the backup store.
- The store is append-mostly and immutable, which is what protects against
  ransomware and accidental deletes — an attacker who compromises the primary
  cannot retroactively alter history.
- A verification layer re-reads chunks and, for databases, replays them into a
  throwaway instance to prove recoverability.

The design decisions that matter are consistency (can a snapshot be applied
correctly?), efficiency (how much storage and bandwidth does history cost?), and
recovery time (how fast can the newest and the oldest backups be restored?).

- These three goals pull against each other: full snapshots restore fast but
  cost the most; incremental-only backups cost little but chain restores
  together; and verification costs resources that protect the one property that
  actually matters — the ability to come back from data loss.

### Q: How do you take consistent snapshots?

**A:** Consistency is about producing a snapshot that represents a valid state of the
data as of a single point in time, even though the data is being written
constantly.

- For databases the problem is sharp: copying tables one by one can yield a
  mixture of transactions where row A reflects a later state than row B, and
  replaying that combination corrupts the restore.
- The standard solution is to coordinate with the database's own consistency
  machinery, using hot backups on transactional engines (where the engine
  exposes a snapshot transaction) or quiescing writes briefly while files are
  copied.

A common practical approach is the "copy then apply log" pattern.

- The backup engine first records the current log position, then copies the data
  files, then notes the log position at copy completion.
- The backup is the data files plus the log segment between the two positions,
  so a restore replays exactly the transactions that fall in that window.
- This gives crash-consistency without stopping writes, and it is why backups of
  database-backed systems almost always involve the database's log, not just its
  files.

For distributed systems, a single consistent snapshot is not enough; the
snapshot must also be ordered across components so a restore does not
reintroduce a read that references a record the backup of another component
dropped.

- The design handles this with a global snapshot coordination point that takes
  the snapshot at a well-defined offset across all volumes, then uses
  application-level reconciliation after restore for the remaining skew.
- Whatever the mechanism, the snapshot metadata records the exact time and log
  position, because that metadata is what makes incremental backup and
  point-in-time restore possible later.

### Q: How do you store backups efficiently?

**A:** The two levers for storage efficiency are deduplication and incremental backup,
used together.

- Deduplication operates at the chunk level: the engine splits every file into
  fixed-size or content-defined chunks, hashes each chunk, and stores only
  chunks not already present in the store.
- Chunk-level hashing means a 2 KB edit to a large file costs only the affected
  chunks, and common data shared across many machines (an OS image, a shared
  library) is stored once globally.
- Content-defined chunking, where boundaries are derived from the data rather
  than fixed offsets, makes deduplication robust to inserts that would shift
  every fixed-size chunk.

Incremental backup complements deduplication by never resending what has not
changed.

- A periodic incremental compares the current snapshot against the last one,
  uploads only changed chunks, and records a new manifest that lists the chunks
  composing the backup.
- The manifest is small and cheap to keep; the chunks are large and stored once.
- Retention then becomes a manifest-management problem: deleting an old backup
  means discarding its manifest and garbage- collecting any chunks no longer
  referenced by any remaining manifest, which runs offline to avoid corrupting
  the store during active backup.

Storage tiering contains the cost of history.

- New backups land on fast tiered storage for quick recovery of recent data, and
  cold history rolls to cheaper object or archive tiers according to policy.
- Compression and encryption are applied before the chunks leave the backup
  engine — compression reduces bandwidth and space, encryption ensures the
  backup store cannot be read if it is exfiltrated, and both run before the
  bytes hit the network so the store never sees plaintext.
- The efficiency gains are substantial in practice: with daily incrementals and
  monthly fulls, a year of history typically costs a small multiple of one full
  backup's size.

### Q: How do you restore data quickly?

**A:** Restore speed is measured two ways: how fast the most recent state can be
recovered, and how fast any historical point can be reached.

- Recent-state restore is optimized by keeping the latest full snapshot plus its
  recent incrementals in fast storage, and by restoring in parallel — chunk
  downloads are fanned out across storage workers, and the engine reassembles
  files concurrently.
- A database restore additionally replays the log segment, which is deliberately
  the smallest replayable unit, so the engine downloads chunks, writes files,
  and replays the log to land at the exact desired point.

Point-in-time recovery (PITR) is where the snapshot model pays off.

- Because the backup engine records the log position of every snapshot, an
  operator can request "the database as of 3:14 PM Tuesday", and the restore
  downloads the snapshot closest before that time plus the log segments up to
  the target timestamp.
- The engine then replays those segments, then truncates at the target.
- PITR converts a backup system from "you get last night" to "you get the state
  just before the incident", which is usually the operational goal.

Restore is also a scaling exercise: the first question after a failure is how
many restores can run in parallel without exhausting storage bandwidth or CPU.

- The design therefore treats restores as first-class jobs with their own queue,
  priority, and progress tracking, and it pre-computes per-job chunk lists so
  the heavy planning does not happen during the recovery window.
- Finally, restore is tested, not assumed: the verification process described
  next exercises the restore path on a schedule, so when the real recovery
  happens the code path has already proven itself in production.

### Q: How do you verify backup integrity?

**A:** Verification exists because backups fail silently: the primary looks fine, the
storage looks fine, and the corruption or missing chunk is only discovered at
restore time, when it is too late. The first layer is automated, lightweight
verification on every backup run.

- After chunks are written, the engine re-reads a sample and recomputes hashes
  to detect corrupt or short writes, and each backup's manifest is checked to
  confirm every referenced chunk exists in the store.
- These checks catch the common causes — partial uploads, silent disk errors,
  lost objects.

The second layer is full integrity verification on a schedule.

- The verifier walks every manifest, confirms every chunk is present, and
  recomputes chunk hashes against the stored hash records.
- For database backups this runs deeper: the verifier spins up a throwaway
  restore of the latest backup into a disposable instance, replays the log, and
  runs validation queries (table counts, checksums, a representative query set)
  to prove the backup actually produces a working database.
- This is the strongest signal the service can emit, because it exercises the
  exact restore path with real machinery.

The third layer is the restore drill.

- Periodic tests restore the oldest retained backup, a mid-history point, and a
  PITR target into a sandbox, then report success or failure per target.
- If a backup is found corrupt, the pipeline reacts automatically: it raises an
  alert, quarantines the corrupt data, and if possible reconstructs the affected
  chunks from adjacent snapshots or by re-capturing from the primary.
- Every verification result is recorded in the backup catalog, so the catalog
  becomes a report card proving the stated retention policy is real — and it is
  the first thing an auditor or an operator checks during an incident.

## Source

```text
title: Backup Service
node admin: Operator [round, icon=browser]
node app: Backup Console [icon=browser]
node gateway: API Gateway [icon=server]
node schedule: Scheduler [icon=compute]
node backup: Backup Engine [icon=worker]
node snapshot: Snapshot Service [icon=compute]
node store: Backup Store [cylinder, icon=file]
node dedupe: Deduplication [icon=cache]
node verify: Verification [icon=shield]
node restore: Restore Service [icon=compute]
node db: Backup DB [cylinder, icon=database]

edge admin -> app: configure
edge app -> gateway: schedule
edge gateway -> schedule: policy
edge schedule -> backup: trigger
edge backup -> snapshot: capture
edge snapshot -> dedupe: chunks
edge dedupe -> store: save
edge backup -> verify: check
edge verify -> db: status
edge admin -> app: restore
edge app -> restore: recover
```
