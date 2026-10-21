# Multiplayer Game

Design a multiplayer online game backend

**Difficulty:** Medium

**Tags:** file-sync, gaming, messaging, realtime

## Functional Requirements

- a multiplayer online game backend
- synchronize game state at 60fps?
- run the authoritative tick loop?
- handle lag and prediction?
- scale players across servers?

## Non-Functional Requirements

- A multiplayer game backend is a real-time simulation shared across many players,
  where the server is the source of truth.

- Players send inputs from the Game Client through a Gateway, which routes each
  player to a Session Service that owns their connection and their place in the
  world.
- A Tick Loop advances the simulation on a fixed schedule, mutating the
  authoritative Game State, and a State Sync layer diffs the state and sends
  updates back to the clients.
- The world is split into World Shards so different zones run on different
  processes.
- A separate Chat Service carries player messages, and a Snapshot Service
  periodically checkpoints the world to the Game DB so the game can survive a
  crash.

The two performance-critical paths are the input path and the state path.

- Inputs must reach the simulation fast and be processed in order, because the
  simulation result depends on the exact sequence of actions.
- State updates must be minimized, because broadcasting the entire world state
  every tick would saturate the network; instead, only the deltas since the last
  acknowledged update are sent.
- These two constraints, ordered inputs in, minimal diffs out, define the shape
  of the whole system.

The backend trades off three goals that cannot all be maximized: latency,
consistency, and throughput.

- Lowering latency favors running simulation close to players and sending
  frequent updates.
- Consistency favors a single authoritative source that makes everyone agree.
- Throughput favors sharding and parallelism that can conflict with consistency.
- The design makes an explicit choice: the server is authoritative, consistency
  is relaxed through client prediction and interpolation, and sharding is done
  by world zone so that consistency within a zone is preserved..
- Synchronization at high frequency is impossible if the server sends complete
  state every tick, so the design minimizes both what is sent and how often.

- The Tick Loop runs the simulation at a fixed rate, and the State Sync layer
  computes the delta between the previous snapshot and the current one: only
  entities that changed, only their changed fields, with coordinates quantized
  to reduce size.
- The server also adapts the send rate to the client, dropping or batching
  updates for players who cannot consume them, so a player on a slow connection
  is not flooded with updates they will discard.

Deltas must be expressed against a shared baseline or they become meaningless.

- Each update references the previous snapshot the client acknowledged, so the
  client can always compute the current state from its last known state plus the
  deltas.
- This requires the server to retain a short history of snapshots per client, so
  a lost update can be repaired by resending from an acknowledged point rather
  than restarting synchronization.
- Position is interpolated between received snapshots, so the rendered world
  moves smoothly even though updates arrive in discrete packets.

The pipeline is designed for bounded bandwidth regardless of player count.

- Rather than per-player full state, the server sends each client the entities
  it can see, based on relevance and interest management, which limits updates
  to the local neighborhood.
- Aggregating many small updates into fewer, larger packets improves throughput
  on the wire, and compression is applied to the packets.
- The synchronization layer is also the place where security boundaries are
  drawn: clients never send state directly, they only send inputs, and every
  state change originates from the simulation..
- The Tick Loop is the heartbeat of the simulation, advancing the world on a fixed
  timestep, typically 10 to 30 ticks per second.

- The Session Service delivers each player's buffered inputs to the tick, and
  the simulation applies them deterministically in the order they were received,
  mutating the Game State.
- A fixed timestep is essential: the simulation must produce the same result
  given the same inputs, so all players see a consistent world even if their
  frames arrive at irregular intervals.
- The loop catches up or slows down rather than tying simulation time to
  wall-clock jitter.

Determinism is the property that makes the loop trustworthy.

- The tick step is a pure function of the previous state and the input batch,
  with no floating-point ambiguity that would let two replicas diverge.
- This is what allows World Shards to run in parallel, because each shard's
  simulation is independent given its inputs, and what allows a crash-restarted
  shard to reconstruct a consistent state from checkpoints and the replayable
  input log.
- The Game State is held in memory, in a structure designed for fast mutation
  and fast diffing rather than for database-shaped queries.

The tick loop is also the reliability boundary.

- If the loop runs slow, the game slows down for everyone on that shard, so the
  loop is monitored for tick duration and the workload is kept light enough to
  always complete within the budget.
- Snapshot Service checkpoints run out of band, capturing the state without
  pausing the loop, so persistence never stalls the simulation.
- Because the loop is the single writer of authoritative state, every other
  system, sync, snapshots, and analytics, reads from it rather than competing
  for writes..
- Lag is the gap between a player acting and the result appearing, and the design
  attacks it with client-side prediction and reconciliation.

- When the player issues an input, the client applies it immediately to a local
  prediction of the world, so their own character responds instantly instead of
  waiting a round trip.
- When the authoritative server state arrives, the client compares it with its
  prediction, and if they differ, it rewinds to the last confirmed state and
  replays the intervening inputs.
- This is called reconciliation, and it keeps the player's view responsive while
  the server remains the final authority.

For the rest of the world, the client uses interpolation between the two most
recent server snapshots.

- Remote entities are always slightly behind the server because their state
  arrives after the fact, but interpolation renders them moving smoothly rather
  than jumping.
- The two techniques, prediction for the player's own avatar and interpolation
  for everything else, work together: own action feels instant, remote action
  feels smooth, and neither requires the client to trust its own view over the
  server.

Latency compensation is a server-side counterpart to prediction.

- When a player shoots at a target, the server evaluates the shot against the
  world as it appeared at the player's client time, not the current server time.
- This prevents players with higher latency from being systematically
  disadvantaged, at the cost of occasionally allowing hits that are not exactly
  current.
- The combination, prediction on the client, interpolation of remote entities,
  and lag compensation on the server, is what makes a high-latency game still
  feel fair and responsive..
- Scaling comes from sharding the world rather than from making one process
  bigger.

- The World Shards partition the game world into zones, and each shard runs its
  own Tick Loop and owns its own slice of Game State on one process.
- Players are assigned to the shard that owns their current location, and the
  Gateway routes them there.
- The benefit is that player capacity scales with the number of shard processes,
  and the cost is that interactions across shard boundaries must be mediated,
  which is why sharding is typically by zone or by match instance, keeping the
  simulation boundaries aligned with gameplay boundaries.

Two coordination problems dominate the design.

- The first is moving players between shards, either by traveling between zones
  or by load rebalancing.
- A transfer freezes the player's state briefly, migrates it to the target
  shard, and reconnects the player with a synchronized snapshot, so the player
  experiences a moment of handoff rather than a reset.
- The second is global services that every player touches, such as matchmaking,
  chat, and persistence, which are separated into their own tiers and scale
  independently of the simulation.

The system must also handle uneven population and hardware failure.

- A shard that is overloaded, for example a popular zone, can be split into two
  zones or the world can be dynamically rebalanced, moving entities and players
  to underused shards.
- When a shard process dies, players must be reconnected and the shard restored
  from its latest checkpoint plus the input log, so the design keeps input
  logging and checkpointing cheap enough to be continuous.
- Capacity planning is done per shard with a known ceiling, and the Gateway
  backs off new joins when a shard approaches its limit rather than letting it
  fail under load.

## Source

````text
title: Multiplayer Game
node player: Player [round, icon=browser]
node app: Game Client [icon=browser]
node gateway: Gateway [icon=server]
node session: Session Service [icon=compute]
node tick: Tick Loop [icon=compute]
node state: Game State [icon=cache]
node world: World Shards [icon=compute]
node sync: State Sync [icon=sync]
node chat: Chat Service [icon=message]
node save: Snapshot Service [icon=worker]
node db: Game DB [cylinder, icon=database]

edge player -> app: input
edge app -> gateway: command
edge gateway -> session: route
edge session -> tick: step
edge tick -> state: mutate
edge state -> sync: diff
edge sync -> app: update
edge tick -> world: zone
edge app -> chat: message
edge tick -> save: checkpoint
edge save -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Multiplayer Game
player: Player
app: Game Client
gateway: Gateway
session: Session Service
tick: Tick Loop
state: Game State
world: World Shards
sync: State Sync
chat: Chat Service
save: Snapshot Service
db: Game DB

player ─► app ─► input
app ─► gateway ─► command
gateway ─► session ─► route
session ─► tick ─► step
tick ─► state ─► mutate
state ─► sync ─► diff
sync ─► app ─► update
tick ─► world ─► zone
app ─► chat ─► message
tick ─► save ─► checkpoint
save ─► db ─► store
````

## Design

### Design a multiplayer online game backend

A multiplayer game backend is a real-time simulation shared across many players,
where the server is the source of truth.

- Players send inputs from the Game Client through a Gateway, which routes each
  player to a Session Service that owns their connection and their place in the
  world.
- A Tick Loop advances the simulation on a fixed schedule, mutating the
  authoritative Game State, and a State Sync layer diffs the state and sends
  updates back to the clients.
- The world is split into World Shards so different zones run on different
  processes.
- A separate Chat Service carries player messages, and a Snapshot Service
  periodically checkpoints the world to the Game DB so the game can survive a
  crash.

The two performance-critical paths are the input path and the state path.

- Inputs must reach the simulation fast and be processed in order, because the
  simulation result depends on the exact sequence of actions.
- State updates must be minimized, because broadcasting the entire world state
  every tick would saturate the network; instead, only the deltas since the last
  acknowledged update are sent.
- These two constraints, ordered inputs in, minimal diffs out, define the shape
  of the whole system.

The backend trades off three goals that cannot all be maximized: latency,
consistency, and throughput.

- Lowering latency favors running simulation close to players and sending
  frequent updates.
- Consistency favors a single authoritative source that makes everyone agree.
- Throughput favors sharding and parallelism that can conflict with consistency.
- The design makes an explicit choice: the server is authoritative, consistency
  is relaxed through client prediction and interpolation, and sharding is done
  by world zone so that consistency within a zone is preserved.

### How do you synchronize game state at 60fps?

Synchronization at high frequency is impossible if the server sends complete
state every tick, so the design minimizes both what is sent and how often.

- The Tick Loop runs the simulation at a fixed rate, and the State Sync layer
  computes the delta between the previous snapshot and the current one: only
  entities that changed, only their changed fields, with coordinates quantized
  to reduce size.
- The server also adapts the send rate to the client, dropping or batching
  updates for players who cannot consume them, so a player on a slow connection
  is not flooded with updates they will discard.

Deltas must be expressed against a shared baseline or they become meaningless.

- Each update references the previous snapshot the client acknowledged, so the
  client can always compute the current state from its last known state plus the
  deltas.
- This requires the server to retain a short history of snapshots per client, so
  a lost update can be repaired by resending from an acknowledged point rather
  than restarting synchronization.
- Position is interpolated between received snapshots, so the rendered world
  moves smoothly even though updates arrive in discrete packets.

The pipeline is designed for bounded bandwidth regardless of player count.

- Rather than per-player full state, the server sends each client the entities
  it can see, based on relevance and interest management, which limits updates
  to the local neighborhood.
- Aggregating many small updates into fewer, larger packets improves throughput
  on the wire, and compression is applied to the packets.
- The synchronization layer is also the place where security boundaries are
  drawn: clients never send state directly, they only send inputs, and every
  state change originates from the simulation.

### How do you run the authoritative tick loop?

The Tick Loop is the heartbeat of the simulation, advancing the world on a fixed
timestep, typically 10 to 30 ticks per second.

- The Session Service delivers each player's buffered inputs to the tick, and
  the simulation applies them deterministically in the order they were received,
  mutating the Game State.
- A fixed timestep is essential: the simulation must produce the same result
  given the same inputs, so all players see a consistent world even if their
  frames arrive at irregular intervals.
- The loop catches up or slows down rather than tying simulation time to
  wall-clock jitter.

Determinism is the property that makes the loop trustworthy.

- The tick step is a pure function of the previous state and the input batch,
  with no floating-point ambiguity that would let two replicas diverge.
- This is what allows World Shards to run in parallel, because each shard's
  simulation is independent given its inputs, and what allows a crash-restarted
  shard to reconstruct a consistent state from checkpoints and the replayable
  input log.
- The Game State is held in memory, in a structure designed for fast mutation
  and fast diffing rather than for database-shaped queries.

The tick loop is also the reliability boundary.

- If the loop runs slow, the game slows down for everyone on that shard, so the
  loop is monitored for tick duration and the workload is kept light enough to
  always complete within the budget.
- Snapshot Service checkpoints run out of band, capturing the state without
  pausing the loop, so persistence never stalls the simulation.
- Because the loop is the single writer of authoritative state, every other
  system, sync, snapshots, and analytics, reads from it rather than competing
  for writes.

### How do you handle lag and prediction?

Lag is the gap between a player acting and the result appearing, and the design
attacks it with client-side prediction and reconciliation.

- When the player issues an input, the client applies it immediately to a local
  prediction of the world, so their own character responds instantly instead of
  waiting a round trip.
- When the authoritative server state arrives, the client compares it with its
  prediction, and if they differ, it rewinds to the last confirmed state and
  replays the intervening inputs.
- This is called reconciliation, and it keeps the player's view responsive while
  the server remains the final authority.

For the rest of the world, the client uses interpolation between the two most
recent server snapshots.

- Remote entities are always slightly behind the server because their state
  arrives after the fact, but interpolation renders them moving smoothly rather
  than jumping.
- The two techniques, prediction for the player's own avatar and interpolation
  for everything else, work together: own action feels instant, remote action
  feels smooth, and neither requires the client to trust its own view over the
  server.

Latency compensation is a server-side counterpart to prediction.

- When a player shoots at a target, the server evaluates the shot against the
  world as it appeared at the player's client time, not the current server time.
- This prevents players with higher latency from being systematically
  disadvantaged, at the cost of occasionally allowing hits that are not exactly
  current.
- The combination, prediction on the client, interpolation of remote entities,
  and lag compensation on the server, is what makes a high-latency game still
  feel fair and responsive.

### How do you scale players across servers?

Scaling comes from sharding the world rather than from making one process
bigger.

- The World Shards partition the game world into zones, and each shard runs its
  own Tick Loop and owns its own slice of Game State on one process.
- Players are assigned to the shard that owns their current location, and the
  Gateway routes them there.
- The benefit is that player capacity scales with the number of shard processes,
  and the cost is that interactions across shard boundaries must be mediated,
  which is why sharding is typically by zone or by match instance, keeping the
  simulation boundaries aligned with gameplay boundaries.

Two coordination problems dominate the design.

- The first is moving players between shards, either by traveling between zones
  or by load rebalancing.
- A transfer freezes the player's state briefly, migrates it to the target
  shard, and reconnects the player with a synchronized snapshot, so the player
  experiences a moment of handoff rather than a reset.
- The second is global services that every player touches, such as matchmaking,
  chat, and persistence, which are separated into their own tiers and scale
  independently of the simulation.

The system must also handle uneven population and hardware failure.

- A shard that is overloaded, for example a popular zone, can be split into two
  zones or the world can be dynamically rebalanced, moving entities and players
  to underused shards.
- When a shard process dies, players must be reconnected and the shard restored
  from its latest checkpoint plus the input log, so the design keeps input
  logging and checkpointing cheap enough to be continuous.
- Capacity planning is done per shard with a known ceiling, and the Gateway
  backs off new joins when a shard approaches its limit rather than letting it
  fail under load.

## Source

```text
title: Multiplayer Game
node player: Player [round, icon=browser]
node app: Game Client [icon=browser]
node gateway: Gateway [icon=server]
node session: Session Service [icon=compute]
node tick: Tick Loop [icon=compute]
node state: Game State [icon=cache]
node world: World Shards [icon=compute]
node sync: State Sync [icon=sync]
node chat: Chat Service [icon=message]
node save: Snapshot Service [icon=worker]
node db: Game DB [cylinder, icon=database]

edge player -> app: input
edge app -> gateway: command
edge gateway -> session: route
edge session -> tick: step
edge tick -> state: mutate
edge state -> sync: diff
edge sync -> app: update
edge tick -> world: zone
edge app -> chat: message
edge tick -> save: checkpoint
edge save -> db: store
```

## Q&A

### Q: Design a multiplayer online game backend

**A:** A multiplayer game backend is a real-time simulation shared across many players,
where the server is the source of truth.

- Players send inputs from the Game Client through a Gateway, which routes each
  player to a Session Service that owns their connection and their place in the
  world.
- A Tick Loop advances the simulation on a fixed schedule, mutating the
  authoritative Game State, and a State Sync layer diffs the state and sends
  updates back to the clients.
- The world is split into World Shards so different zones run on different
  processes.
- A separate Chat Service carries player messages, and a Snapshot Service
  periodically checkpoints the world to the Game DB so the game can survive a
  crash.

The two performance-critical paths are the input path and the state path.

- Inputs must reach the simulation fast and be processed in order, because the
  simulation result depends on the exact sequence of actions.
- State updates must be minimized, because broadcasting the entire world state
  every tick would saturate the network; instead, only the deltas since the last
  acknowledged update are sent.
- These two constraints, ordered inputs in, minimal diffs out, define the shape
  of the whole system.

The backend trades off three goals that cannot all be maximized: latency,
consistency, and throughput.

- Lowering latency favors running simulation close to players and sending
  frequent updates.
- Consistency favors a single authoritative source that makes everyone agree.
- Throughput favors sharding and parallelism that can conflict with consistency.
- The design makes an explicit choice: the server is authoritative, consistency
  is relaxed through client prediction and interpolation, and sharding is done
  by world zone so that consistency within a zone is preserved.

### Q: How do you synchronize game state at 60fps?

**A:** Synchronization at high frequency is impossible if the server sends complete
state every tick, so the design minimizes both what is sent and how often.

- The Tick Loop runs the simulation at a fixed rate, and the State Sync layer
  computes the delta between the previous snapshot and the current one: only
  entities that changed, only their changed fields, with coordinates quantized
  to reduce size.
- The server also adapts the send rate to the client, dropping or batching
  updates for players who cannot consume them, so a player on a slow connection
  is not flooded with updates they will discard.

Deltas must be expressed against a shared baseline or they become meaningless.

- Each update references the previous snapshot the client acknowledged, so the
  client can always compute the current state from its last known state plus the
  deltas.
- This requires the server to retain a short history of snapshots per client, so
  a lost update can be repaired by resending from an acknowledged point rather
  than restarting synchronization.
- Position is interpolated between received snapshots, so the rendered world
  moves smoothly even though updates arrive in discrete packets.

The pipeline is designed for bounded bandwidth regardless of player count.

- Rather than per-player full state, the server sends each client the entities
  it can see, based on relevance and interest management, which limits updates
  to the local neighborhood.
- Aggregating many small updates into fewer, larger packets improves throughput
  on the wire, and compression is applied to the packets.
- The synchronization layer is also the place where security boundaries are
  drawn: clients never send state directly, they only send inputs, and every
  state change originates from the simulation.

### Q: How do you run the authoritative tick loop?

**A:** The Tick Loop is the heartbeat of the simulation, advancing the world on a fixed
timestep, typically 10 to 30 ticks per second.

- The Session Service delivers each player's buffered inputs to the tick, and
  the simulation applies them deterministically in the order they were received,
  mutating the Game State.
- A fixed timestep is essential: the simulation must produce the same result
  given the same inputs, so all players see a consistent world even if their
  frames arrive at irregular intervals.
- The loop catches up or slows down rather than tying simulation time to
  wall-clock jitter.

Determinism is the property that makes the loop trustworthy.

- The tick step is a pure function of the previous state and the input batch,
  with no floating-point ambiguity that would let two replicas diverge.
- This is what allows World Shards to run in parallel, because each shard's
  simulation is independent given its inputs, and what allows a crash-restarted
  shard to reconstruct a consistent state from checkpoints and the replayable
  input log.
- The Game State is held in memory, in a structure designed for fast mutation
  and fast diffing rather than for database-shaped queries.

The tick loop is also the reliability boundary.

- If the loop runs slow, the game slows down for everyone on that shard, so the
  loop is monitored for tick duration and the workload is kept light enough to
  always complete within the budget.
- Snapshot Service checkpoints run out of band, capturing the state without
  pausing the loop, so persistence never stalls the simulation.
- Because the loop is the single writer of authoritative state, every other
  system, sync, snapshots, and analytics, reads from it rather than competing
  for writes.

### Q: How do you handle lag and prediction?

**A:** Lag is the gap between a player acting and the result appearing, and the design
attacks it with client-side prediction and reconciliation.

- When the player issues an input, the client applies it immediately to a local
  prediction of the world, so their own character responds instantly instead of
  waiting a round trip.
- When the authoritative server state arrives, the client compares it with its
  prediction, and if they differ, it rewinds to the last confirmed state and
  replays the intervening inputs.
- This is called reconciliation, and it keeps the player's view responsive while
  the server remains the final authority.

For the rest of the world, the client uses interpolation between the two most
recent server snapshots.

- Remote entities are always slightly behind the server because their state
  arrives after the fact, but interpolation renders them moving smoothly rather
  than jumping.
- The two techniques, prediction for the player's own avatar and interpolation
  for everything else, work together: own action feels instant, remote action
  feels smooth, and neither requires the client to trust its own view over the
  server.

Latency compensation is a server-side counterpart to prediction.

- When a player shoots at a target, the server evaluates the shot against the
  world as it appeared at the player's client time, not the current server time.
- This prevents players with higher latency from being systematically
  disadvantaged, at the cost of occasionally allowing hits that are not exactly
  current.
- The combination, prediction on the client, interpolation of remote entities,
  and lag compensation on the server, is what makes a high-latency game still
  feel fair and responsive.

### Q: How do you scale players across servers?

**A:** Scaling comes from sharding the world rather than from making one process
bigger.

- The World Shards partition the game world into zones, and each shard runs its
  own Tick Loop and owns its own slice of Game State on one process.
- Players are assigned to the shard that owns their current location, and the
  Gateway routes them there.
- The benefit is that player capacity scales with the number of shard processes,
  and the cost is that interactions across shard boundaries must be mediated,
  which is why sharding is typically by zone or by match instance, keeping the
  simulation boundaries aligned with gameplay boundaries.

Two coordination problems dominate the design.

- The first is moving players between shards, either by traveling between zones
  or by load rebalancing.
- A transfer freezes the player's state briefly, migrates it to the target
  shard, and reconnects the player with a synchronized snapshot, so the player
  experiences a moment of handoff rather than a reset.
- The second is global services that every player touches, such as matchmaking,
  chat, and persistence, which are separated into their own tiers and scale
  independently of the simulation.

The system must also handle uneven population and hardware failure.

- A shard that is overloaded, for example a popular zone, can be split into two
  zones or the world can be dynamically rebalanced, moving entities and players
  to underused shards.
- When a shard process dies, players must be reconnected and the shard restored
  from its latest checkpoint plus the input log, so the design keeps input
  logging and checkpointing cheap enough to be continuous.
- Capacity planning is done per shard with a known ceiling, and the Gateway
  backs off new joins when a shard approaches its limit rather than letting it
  fail under load.

## Source

```text
title: Multiplayer Game
node player: Player [round, icon=browser]
node app: Game Client [icon=browser]
node gateway: Gateway [icon=server]
node session: Session Service [icon=compute]
node tick: Tick Loop [icon=compute]
node state: Game State [icon=cache]
node world: World Shards [icon=compute]
node sync: State Sync [icon=sync]
node chat: Chat Service [icon=message]
node save: Snapshot Service [icon=worker]
node db: Game DB [cylinder, icon=database]

edge player -> app: input
edge app -> gateway: command
edge gateway -> session: route
edge session -> tick: step
edge tick -> state: mutate
edge state -> sync: diff
edge sync -> app: update
edge tick -> world: zone
edge app -> chat: message
edge tick -> save: checkpoint
edge save -> db: store
```
