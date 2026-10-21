# Online IDE

Design an online IDE

**Difficulty:** Medium

**Tags:** devops, security

## Functional Requirements

- an online IDE
- manage isolated execution environments?
- stream edits and terminal output?
- scale cloud builds?
- persist user workspaces?

## Non-Functional Requirements

- An online IDE replaces a local development machine with a browser experience:

- When a developer opens a project, the workspace service allocates an isolated
  environment, the editor backend serves the editing session, and an execution
  proxy runs commands and streams terminal output back to the browser.
- Builds and file persistence are handled by dedicated services, and session
  state tracks where each developer left off.
- The result must feel like a local editor even though all compute happens in a
  datacenter.

The diagram shows the main flow:

- The developer connects through the gateway, which asks the workspace service
  to allocate a workspace, and the workspace service creates a sandbox from a
  pool of pre-warmed environments.
- The editor backend handles file edits, the execution proxy routes run commands
  into the sandbox and streams output, and builds are dispatched to a separate
  build service.
- Workspace files are persisted to a file store, and metadata such as the
  project and last session lands in the workspaces database.

The defining constraint is latency to the user's keystrokes and the runtime:

- Keystroke-to-preview latency must stay low even though editor logic runs in
  the browser and execution runs in a container possibly thousands of miles
  away.
- The design therefore separates the frontend editor, which renders and handles
  local interactions instantly, from the backend that provides language services
  and execution, communicating over persistent WebSockets that compress traffic
  heavily.
- The design also degrades gracefully: when the backend connection drops, the
  editor keeps accepting keystrokes locally and reconciles on reconnect, so a
  network blip never loses a user's work..
- Isolation is achieved with per-user containers or lightweight virtual machines
  so that one user's code, and especially one user's malicious or memory-hungry
  code, cannot affect another:

- Each environment is single-tenant: the sandbox carries the user's files,
  runtime toolchains, and secrets, and it has network, CPU, memory, and storage
  quotas enforced by the host.
- Untrusted code runs inside the sandbox with no ability to reach the control
  plane or other users, and network egress is restricted to what the workload
  needs.

Startup latency is the enemy, so the sandbox service maintains a pool of
pre-warmed environments:

- Idle sandboxes boot their base image in advance, and when a user connects, the
  workspace service clones a warm sandbox, attaches the user's files, and hands
  out the connection.
- This brings time-to-first-key down from minutes to seconds.
- Long-running environments are suspended when idle and resumed on demand,
  trading memory for startup cost.

Sandboxes are ephemeral and cheap to recreate:

- Because persistence lives in a separate file store, a sandbox can be destroyed
  and rebuilt without losing work, which keeps the pool self-healing: crashed,
  leaked, or abandoned environments are reaped by a scheduler.
- Resource abuse is bounded by per-workspace quotas and automatic suspension,
  and the whole fleet is watched for anomalies.
- A leaked sandbox is bad, so environments are also given a hard lifetime and
  rotated regularly even when healthy.
- A per-workspace audit trail records when an environment was created, accessed,
  and destroyed, which matters for security reviews and for understanding the
  cost of the sandbox fleet..
- Edits flow over a persistent duplex connection between the browser and the
  editor backend:

- The frontend editor captures keystrokes, applies them locally for instant
  rendering, and sends the changes to the backend over WebSocket.
- The backend applies them to the shared filesystem and notifies language
  services and any other connected clients, such as a pair-programming partner.
- Optimistic updates plus conflict detection, using operation transforms or
  document versions, keep the local view correct when two sources modify the
  same file.

Terminal output has different requirements:

- Commands produce unbounded, high-frequency output, so the execution proxy
  sends a continuous stream of terminal frames over a separate channel with
  backpressure: if the browser cannot keep up, the proxy coalesces frames rather
  than queueing forever.
- The protocol is message-based with buffering on the client, and reconnection
  logic replays missed output so a dropped connection does not lose terminal
  history.
- Input, such as keystrokes to a running process, rides the same channel in the
  reverse direction.

Streaming infrastructure must be observable and cheap:

- Every connection carries heartbeat and latency telemetry, and backpressure at
  the browser, proxy, and process levels prevents one chatty process from
  exhausting memory.
- The proxy is stateful per connection, so reconnects must map to the same
  underlying process, typically by keeping a sticky mapping from session to
  execution environment.
- Logs are aggregated out-of-band so a user's terminal session is not the only
  record of what ran.
- Output from builds and long-running commands is also persisted to a log store,
  so a user who closes the tab can still retrieve the tail of what their process
  printed..
- Workers are ephemeral and
  stateless beyond the build, so the pool scales in and out with demand, and the
  interactive workspace is never starved by a compile.
- Consistency is
  eventual but bounded: the durability promise is that every acknowledged edit is
  safely persisted, and in-flight edits on a crashed sandbox are recovered on
  reconnect or surfaced as a conflict.

Multi-user and lifecycle concerns shape the data model.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Online IDE
dev: Developer
app: IDE Web App
gateway: API Gateway
ws: Workspace Service
sandbox: Sandbox Pool
editor: Editor Backend
exec: Execution Proxy
build: Build Service
fs: Workspace Files
session: Session Store
db: Workspaces DB

dev ─► app ─► open project
app ─► gateway ─► connect
gateway ─► ws ─► allocate
ws ─► sandbox ─► create
app ─► editor ─► edit
editor ─► exec ─► run
exec ─► sandbox ─► execute
editor ─► app ─► output
dev ─► app ─► build
app ─► build ─► compile
ws ─► fs ─► persist
ws ─► db ─► metadata
```

## Design

### Design an online IDE

An online IDE replaces a local development machine with a browser experience:

- When a developer opens a project, the workspace service allocates an isolated
  environment, the editor backend serves the editing session, and an execution
  proxy runs commands and streams terminal output back to the browser.
- Builds and file persistence are handled by dedicated services, and session
  state tracks where each developer left off.
- The result must feel like a local editor even though all compute happens in a
  datacenter.

The diagram shows the main flow:

- The developer connects through the gateway, which asks the workspace service
  to allocate a workspace, and the workspace service creates a sandbox from a
  pool of pre-warmed environments.
- The editor backend handles file edits, the execution proxy routes run commands
  into the sandbox and streams output, and builds are dispatched to a separate
  build service.
- Workspace files are persisted to a file store, and metadata such as the
  project and last session lands in the workspaces database.

The defining constraint is latency to the user's keystrokes and the runtime:

- Keystroke-to-preview latency must stay low even though editor logic runs in
  the browser and execution runs in a container possibly thousands of miles
  away.
- The design therefore separates the frontend editor, which renders and handles
  local interactions instantly, from the backend that provides language services
  and execution, communicating over persistent WebSockets that compress traffic
  heavily.
- The design also degrades gracefully: when the backend connection drops, the
  editor keeps accepting keystrokes locally and reconciles on reconnect, so a
  network blip never loses a user's work.

### How do you manage isolated execution environments?

Isolation is achieved with per-user containers or lightweight virtual machines
so that one user's code, and especially one user's malicious or memory-hungry
code, cannot affect another:

- Each environment is single-tenant: the sandbox carries the user's files,
  runtime toolchains, and secrets, and it has network, CPU, memory, and storage
  quotas enforced by the host.
- Untrusted code runs inside the sandbox with no ability to reach the control
  plane or other users, and network egress is restricted to what the workload
  needs.

Startup latency is the enemy, so the sandbox service maintains a pool of
pre-warmed environments:

- Idle sandboxes boot their base image in advance, and when a user connects, the
  workspace service clones a warm sandbox, attaches the user's files, and hands
  out the connection.
- This brings time-to-first-key down from minutes to seconds.
- Long-running environments are suspended when idle and resumed on demand,
  trading memory for startup cost.

Sandboxes are ephemeral and cheap to recreate:

- Because persistence lives in a separate file store, a sandbox can be destroyed
  and rebuilt without losing work, which keeps the pool self-healing: crashed,
  leaked, or abandoned environments are reaped by a scheduler.
- Resource abuse is bounded by per-workspace quotas and automatic suspension,
  and the whole fleet is watched for anomalies.
- A leaked sandbox is bad, so environments are also given a hard lifetime and
  rotated regularly even when healthy.
- A per-workspace audit trail records when an environment was created, accessed,
  and destroyed, which matters for security reviews and for understanding the
  cost of the sandbox fleet.

### How do you stream edits and terminal output?

Edits flow over a persistent duplex connection between the browser and the
editor backend:

- The frontend editor captures keystrokes, applies them locally for instant
  rendering, and sends the changes to the backend over WebSocket.
- The backend applies them to the shared filesystem and notifies language
  services and any other connected clients, such as a pair-programming partner.
- Optimistic updates plus conflict detection, using operation transforms or
  document versions, keep the local view correct when two sources modify the
  same file.

Terminal output has different requirements:

- Commands produce unbounded, high-frequency output, so the execution proxy
  sends a continuous stream of terminal frames over a separate channel with
  backpressure: if the browser cannot keep up, the proxy coalesces frames rather
  than queueing forever.
- The protocol is message-based with buffering on the client, and reconnection
  logic replays missed output so a dropped connection does not lose terminal
  history.
- Input, such as keystrokes to a running process, rides the same channel in the
  reverse direction.

Streaming infrastructure must be observable and cheap:

- Every connection carries heartbeat and latency telemetry, and backpressure at
  the browser, proxy, and process levels prevents one chatty process from
  exhausting memory.
- The proxy is stateful per connection, so reconnects must map to the same
  underlying process, typically by keeping a sticky mapping from session to
  execution environment.
- Logs are aggregated out-of-band so a user's terminal session is not the only
  record of what ran.
- Output from builds and long-running commands is also persisted to a log store,
  so a user who closes the tab can still retrieve the tail of what their process
  printed.

### How do you scale cloud builds?

Builds are resource-hungry and bursty, so they are decoupled from the
interactive sandbox. When the user asks to build or test, the build service
takes a snapshot of the workspace, dispatches the work to a pool of dedicated
build workers, and streams progress back to the IDE. Workers are ephemeral and
stateless beyond the build, so the pool scales in and out with demand, and the
interactive workspace is never starved by a compile. Build caching, by
dependency and by source hash, is the main lever for making repeated builds
fast.

The build pipeline is queued and parallelized. A queue absorbs bursts from many
users, and a scheduler splits a build into stages that can run across workers,
for example compiling independent modules concurrently. Because builds can be
cancelled, the scheduler tracks each job's state and reclaims workers promptly
when the user stops the build. Pre-built dependency caches and warm worker
images avoid reinstalling the same toolchain for every build.

Scaling is governed by admission control. A global concurrency limit caps active
builds, and queued builds are ordered by priority so interactive builds beat
background ones. Per-user and per-org quotas prevent a single account from
consuming the whole fleet, and builds that exceed resource budgets are killed
with a clear error. The build results, logs, and artifacts are persisted, so a
build that ran once can be replayed or inspected without re-executing the
compiler. The build service also records build duration, cache hit rate, and
queue wait per project, so teams can see when their builds are slow and whether
caching is actually helping.

### How do you persist user workspaces?

Persistence is split from compute. Workspace files live in a content-addressable
file store keyed by snapshot, while the workspaces database records metadata
such as the project, the owning user, the last opened session, and where each
snapshot is stored. The sandbox mounts the file store at startup and flushes
changes back on a schedule and on shutdown, so a destroyed sandbox can be
recreated with the user's exact files. The file store is the single source of
truth that survives every environment churn.

Writes are incremental, not wholesale. The editor sends change notifications
that the workspace service batches into commits, and each commit produces a new
snapshot with a manifest of changed files. This keeps persistence cheap for
large repositories because only diffs are transferred, and it enables
versioning, so a user can roll back to an earlier snapshot. Consistency is
eventual but bounded: the durability promise is that every acknowledged edit is
safely persisted, and in-flight edits on a crashed sandbox are recovered on
reconnect or surfaced as a conflict.

Multi-user and lifecycle concerns shape the data model. When a team works in the
same workspace, a merge strategy reconciles concurrent edits, and access control
on the workspace governs who may open or modify it. Idle workspaces are
suspended and their sandboxes reclaimed, but their files are untouched.
Retention policies handle storage growth, and export gives the user a tarball of
their work at any time, so no customer is ever locked into a workspace they
cannot take home.

## Source

```text
title: Online IDE
node dev: Developer [round, icon=browser]
node app: IDE Web App [icon=browser]
node gateway: API Gateway [icon=server]
node ws: Workspace Service [icon=compute]
node sandbox: Sandbox Pool [icon=cloud]
node editor: Editor Backend [icon=compute]
node exec: Execution Proxy [icon=worker]
node build: Build Service [icon=compute]
node fs: Workspace Files [cylinder, icon=file]
node session: Session Store [icon=cache]
node db: Workspaces DB [cylinder, icon=database]

edge dev -> app: open project
edge app -> gateway: connect
edge gateway -> ws: allocate
edge ws -> sandbox: create
edge app -> editor: edit
edge editor -> exec: run
edge exec -> sandbox: execute
edge editor -> app: output
edge dev -> app: build
edge app -> build: compile
edge ws -> fs: persist
edge ws -> db: metadata
```

## Q&A

### Q: Design an online IDE

**A:** An online IDE replaces a local development machine with a browser experience:

- When a developer opens a project, the workspace service allocates an isolated
  environment, the editor backend serves the editing session, and an execution
  proxy runs commands and streams terminal output back to the browser.
- Builds and file persistence are handled by dedicated services, and session
  state tracks where each developer left off.
- The result must feel like a local editor even though all compute happens in a
  datacenter.

The diagram shows the main flow:

- The developer connects through the gateway, which asks the workspace service
  to allocate a workspace, and the workspace service creates a sandbox from a
  pool of pre-warmed environments.
- The editor backend handles file edits, the execution proxy routes run commands
  into the sandbox and streams output, and builds are dispatched to a separate
  build service.
- Workspace files are persisted to a file store, and metadata such as the
  project and last session lands in the workspaces database.

The defining constraint is latency to the user's keystrokes and the runtime:

- Keystroke-to-preview latency must stay low even though editor logic runs in
  the browser and execution runs in a container possibly thousands of miles
  away.
- The design therefore separates the frontend editor, which renders and handles
  local interactions instantly, from the backend that provides language services
  and execution, communicating over persistent WebSockets that compress traffic
  heavily.
- The design also degrades gracefully: when the backend connection drops, the
  editor keeps accepting keystrokes locally and reconciles on reconnect, so a
  network blip never loses a user's work.

### Q: How do you manage isolated execution environments?

**A:** Isolation is achieved with per-user containers or lightweight virtual machines
so that one user's code, and especially one user's malicious or memory-hungry
code, cannot affect another:

- Each environment is single-tenant: the sandbox carries the user's files,
  runtime toolchains, and secrets, and it has network, CPU, memory, and storage
  quotas enforced by the host.
- Untrusted code runs inside the sandbox with no ability to reach the control
  plane or other users, and network egress is restricted to what the workload
  needs.

Startup latency is the enemy, so the sandbox service maintains a pool of
pre-warmed environments:

- Idle sandboxes boot their base image in advance, and when a user connects, the
  workspace service clones a warm sandbox, attaches the user's files, and hands
  out the connection.
- This brings time-to-first-key down from minutes to seconds.
- Long-running environments are suspended when idle and resumed on demand,
  trading memory for startup cost.

Sandboxes are ephemeral and cheap to recreate:

- Because persistence lives in a separate file store, a sandbox can be destroyed
  and rebuilt without losing work, which keeps the pool self-healing: crashed,
  leaked, or abandoned environments are reaped by a scheduler.
- Resource abuse is bounded by per-workspace quotas and automatic suspension,
  and the whole fleet is watched for anomalies.
- A leaked sandbox is bad, so environments are also given a hard lifetime and
  rotated regularly even when healthy.
- A per-workspace audit trail records when an environment was created, accessed,
  and destroyed, which matters for security reviews and for understanding the
  cost of the sandbox fleet.

### Q: How do you stream edits and terminal output?

**A:** Edits flow over a persistent duplex connection between the browser and the
editor backend:

- The frontend editor captures keystrokes, applies them locally for instant
  rendering, and sends the changes to the backend over WebSocket.
- The backend applies them to the shared filesystem and notifies language
  services and any other connected clients, such as a pair-programming partner.
- Optimistic updates plus conflict detection, using operation transforms or
  document versions, keep the local view correct when two sources modify the
  same file.

Terminal output has different requirements:

- Commands produce unbounded, high-frequency output, so the execution proxy
  sends a continuous stream of terminal frames over a separate channel with
  backpressure: if the browser cannot keep up, the proxy coalesces frames rather
  than queueing forever.
- The protocol is message-based with buffering on the client, and reconnection
  logic replays missed output so a dropped connection does not lose terminal
  history.
- Input, such as keystrokes to a running process, rides the same channel in the
  reverse direction.

Streaming infrastructure must be observable and cheap:

- Every connection carries heartbeat and latency telemetry, and backpressure at
  the browser, proxy, and process levels prevents one chatty process from
  exhausting memory.
- The proxy is stateful per connection, so reconnects must map to the same
  underlying process, typically by keeping a sticky mapping from session to
  execution environment.
- Logs are aggregated out-of-band so a user's terminal session is not the only
  record of what ran.
- Output from builds and long-running commands is also persisted to a log store,
  so a user who closes the tab can still retrieve the tail of what their process
  printed.

### Q: How do you scale cloud builds?

**A:** Builds are resource-hungry and bursty, so they are decoupled from the
interactive sandbox. When the user asks to build or test, the build service
takes a snapshot of the workspace, dispatches the work to a pool of dedicated
build workers, and streams progress back to the IDE. Workers are ephemeral and
stateless beyond the build, so the pool scales in and out with demand, and the
interactive workspace is never starved by a compile. Build caching, by
dependency and by source hash, is the main lever for making repeated builds
fast.

The build pipeline is queued and parallelized. A queue absorbs bursts from many
users, and a scheduler splits a build into stages that can run across workers,
for example compiling independent modules concurrently. Because builds can be
cancelled, the scheduler tracks each job's state and reclaims workers promptly
when the user stops the build. Pre-built dependency caches and warm worker
images avoid reinstalling the same toolchain for every build.

Scaling is governed by admission control. A global concurrency limit caps active
builds, and queued builds are ordered by priority so interactive builds beat
background ones. Per-user and per-org quotas prevent a single account from
consuming the whole fleet, and builds that exceed resource budgets are killed
with a clear error. The build results, logs, and artifacts are persisted, so a
build that ran once can be replayed or inspected without re-executing the
compiler. The build service also records build duration, cache hit rate, and
queue wait per project, so teams can see when their builds are slow and whether
caching is actually helping.

### Q: How do you persist user workspaces?

**A:** Persistence is split from compute. Workspace files live in a content-addressable
file store keyed by snapshot, while the workspaces database records metadata
such as the project, the owning user, the last opened session, and where each
snapshot is stored. The sandbox mounts the file store at startup and flushes
changes back on a schedule and on shutdown, so a destroyed sandbox can be
recreated with the user's exact files. The file store is the single source of
truth that survives every environment churn.

Writes are incremental, not wholesale. The editor sends change notifications
that the workspace service batches into commits, and each commit produces a new
snapshot with a manifest of changed files. This keeps persistence cheap for
large repositories because only diffs are transferred, and it enables
versioning, so a user can roll back to an earlier snapshot. Consistency is
eventual but bounded: the durability promise is that every acknowledged edit is
safely persisted, and in-flight edits on a crashed sandbox are recovered on
reconnect or surfaced as a conflict.

Multi-user and lifecycle concerns shape the data model. When a team works in the
same workspace, a merge strategy reconciles concurrent edits, and access control
on the workspace governs who may open or modify it. Idle workspaces are
suspended and their sandboxes reclaimed, but their files are untouched.
Retention policies handle storage growth, and export gives the user a tarball of
their work at any time, so no customer is ever locked into a workspace they
cannot take home.

## Source

```text
title: Online IDE
node dev: Developer [round, icon=browser]
node app: IDE Web App [icon=browser]
node gateway: API Gateway [icon=server]
node ws: Workspace Service [icon=compute]
node sandbox: Sandbox Pool [icon=cloud]
node editor: Editor Backend [icon=compute]
node exec: Execution Proxy [icon=worker]
node build: Build Service [icon=compute]
node fs: Workspace Files [cylinder, icon=file]
node session: Session Store [icon=cache]
node db: Workspaces DB [cylinder, icon=database]

edge dev -> app: open project
edge app -> gateway: connect
edge gateway -> ws: allocate
edge ws -> sandbox: create
edge app -> editor: edit
edge editor -> exec: run
edge exec -> sandbox: execute
edge editor -> app: output
edge dev -> app: build
edge app -> build: compile
edge ws -> fs: persist
edge ws -> db: metadata
```
