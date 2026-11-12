# Fantasy Sports

Design a fantasy sports platform

**Difficulty:** Hard

**Tags:** ml, notification

## Functional Requirements

- a fantasy sports platform
- run live drafts with many users?
- score rosters against live games?
- power the waiver wire and trades?
- push real-time score updates?

## Non-Functional Requirements

- A fantasy sports platform lets team owners draft real athletes, manage rosters,
  and compete on the athletes' live game performance.

- The League Service owns leagues, memberships, and season structure, and the
  Roster Service tracks each team's players and lineups.
- The Draft Engine runs the live draft where owners take turns selecting
  players.
- During the season, a Stats Provider supplies live game data, the Live Scoring
  component computes fantasy points from that data, and the Roster Service
  applies the points to each team.
- Waiver claims and trades are processed by the Waiver and Trades service, and
  the Notification Service pushes score changes and transaction alerts.
- All league and roster state is durable in the Leagues DB.

The platform has two dramatically different phases.

- The draft is a synchronized, real-time event with a small window, where every
  owner acts in turn and the system must keep all participants on the same pick
  state.
- The season is an ongoing read-and-notify workload, where the dominant traffic
  is owners refreshing their scores while live games are being played.
- These phases impose different consistency and latency requirements, so they
  are built as separate services rather than one monolith, even though they
  share the league data model.

The hard consistency requirements are concentrated in the draft and in roster
transactions.

- Two owners must never be assigned the same player, a drafted player must be
  locked out of every other league's availability, and a trade must be atomic:
  both teams' rosters change together or not at all.
- Live scoring, by contrast, is derived data that can tolerate eventual
  consistency, since a few seconds of scoring lag is acceptable.
- The design keeps these guarantees localized, making the draft and transaction
  engines strictly serialized while the scoring and notification paths scale
  out..
- A draft is a strictly ordered event, so the Draft Engine is a state machine that
  owns whose turn it is and which players remain available.

- The league's draft order is fixed at creation, and the engine advances the
  turn only when the current owner picks or their clock expires.
- The engine is the single authority on pick validity: it checks that the
  selected player is still undrafted, that the pick is in order, and that any
  roster rules such as position limits are satisfied.
- Because there is one writer per league, the draft is naturally serializable,
  and the guarantee that no player is picked twice follows from that
  serialization.

All owners must see the same draft board instantly.

- The engine broadcasts every pick, timer reset, and turn change to all league
  members over a real-time channel, and each client renders the same
  authoritative state.
- When a pick lands, the engine publishes it, and every other league immediately
  marks that player unavailable.
- If an owner disconnects, the engine keeps running the clock; if the clock
  expires, the engine auto-picks the best available player according to a preset
  ranking, so a single absent owner does not stall the entire league.

The system must support drafts of very different sizes, from small casual
leagues to massive public leagues with hundreds of participants.

- The engine scales by running one independent state machine per league, so
  thousands of concurrent drafts are just thousands of independent, small state
  machines.
- The shared hot spot is the player availability check, which is served from a
  replicated in-memory index and updated through the pick events.
- A crash is recovered by replaying the pick log, so the draft can resume from
  the last committed pick rather than restarting..
- Scoring is a pure transformation from athlete performance to fantasy points.

- The Live Scoring component ingests the stats feed from the Stats Provider,
  which streams events such as a touchdown, a catch, or a passing yard, and maps
  each event to the fantasy scoring rules configured for the league.
- The mapping is deterministic and versioned, so the same event always produces
  the same points.
- Because scoring rules differ by league, the mapper resolves the league's
  scoring settings for each event rather than applying a single global formula,
  and the resulting points are credited to the roster that owns the athlete.

The flow is a fan-out from one athlete to many teams.

- A single event in one real game may affect thousands of rosters, so the
  scoring service cannot recompute each team's total per event.
- Instead, it computes the points for the athlete once, then applies the delta
  to every team with that athlete in their lineup, and updates the team totals
  incrementally.
- Team scores are maintained as running totals that move up as events land,
  which is exactly what owners expect from a live score ticker.
- Late stat corrections, where the official scorer revises an event, are handled
  by replaying the corrected event and applying a delta rather than recomputing
  the season.

Consistency matters only at the margins.

- The score the owner sees may lag the actual event by a moment, but it must
  never jump backward except for a legitimate stat correction, and the final
  score must match the official result.
- The system achieves this by keeping the stats feed as the ordering authority,
  applying events in the provider's order, and writing the final game totals as
  the authoritative result when the game ends.
- The live view is derived from the event stream, while the final standings read
  the settled totals, so the two never disagree once a game is official..
- The notification problem is one-to-many with strict latency: one scoring event
  must reach every interested owner within seconds.

- The system uses a publish-subscribe path per league, where the Live Scoring
  service publishes score deltas and the real-time delivery layer fans them out
  to the connected clients of that league.
- The fan-out is scoped, so an event in a game affects only the leagues that
  roster the involved athletes.
- Each owner receives a delta and the updated team total, and the client updates
  the display without refetching.

The push layer has to coexist with the fetch path.

- Owners are often on a web page or app that is not actively connected, so the
  system runs both a push channel for live connections and a query path backed
  by the aggregated scores for late or reconnecting viewers.
- When a client connects, it receives a full snapshot and then subscribes to
  deltas, so a reconnect is cheap and never misses a score.
- The push channel carries only the changed numbers, keeping bandwidth low even
  when thousands of owners watch the same Sunday slate of games.

Reliability and pacing shape the final design.

- A missed push must not lose a score, so the client reconciles against the
  aggregated store on reconnect, and the notification path retries in-flight
  deliveries.
- Alert cadence is controlled, so owners are not spammed by every small event:
  threshold-based alerts, such as a touchdown or a player reaching a point
  milestone, are sent as push notifications, while the ticker handles the
  continuous deltas.
- The notification service is decoupled from the scoring pipeline through a
  queue, so a slow delivery tier never backs up the scoring path that every
  league depends on.

## Source

````text
title: Fantasy Sports
node owner: Team Owner [round, icon=browser]
node app: Fantasy App [icon=browser]
node gateway: API Gateway [icon=server]
node league: League Service [icon=compute]
node draft: Draft Engine [icon=compute]
node roster: Roster Service [icon=compute]
node score: Live Scoring [icon=queue]
node stats: Stats Provider [icon=cloud]
node trade: Waiver & Trades [icon=compute]
node notify: Notifications [icon=message]
node db: Leagues DB [cylinder, icon=database]

edge owner -> app: draft
edge app -> gateway: pick
edge gateway -> draft: select
edge draft -> roster: assign
edge stats -> score: live data
edge score -> roster: points
edge roster -> app: update
edge owner -> app: waiver
edge gateway -> trade: process
edge trade -> roster: swap
edge score -> notify: alert
edge league -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Fantasy Sports
owner: Team Owner
app: Fantasy App
gateway: API Gateway
league: League Service
draft: Draft Engine
roster: Roster Service
score: Live Scoring
stats: Stats Provider
trade: Waiver & Trades
notify: Notifications
db: Leagues DB

owner ─► app ─► draft
app ─► gateway ─► pick
gateway ─► draft ─► select
draft ─► roster ─► assign
stats ─► score ─► live data
score ─► roster ─► points
roster ─► app ─► update
owner ─► app ─► waiver
gateway ─► trade ─► process
trade ─► roster ─► swap
score ─► notify ─► alert
league ─► db ─► store
````

## Design

### Design a fantasy sports platform

A fantasy sports platform lets team owners draft real athletes, manage rosters,
and compete on the athletes' live game performance.

- The League Service owns leagues, memberships, and season structure, and the
  Roster Service tracks each team's players and lineups.
- The Draft Engine runs the live draft where owners take turns selecting
  players.
- During the season, a Stats Provider supplies live game data, the Live Scoring
  component computes fantasy points from that data, and the Roster Service
  applies the points to each team.
- Waiver claims and trades are processed by the Waiver and Trades service, and
  the Notification Service pushes score changes and transaction alerts.
- All league and roster state is durable in the Leagues DB.

The platform has two dramatically different phases.

- The draft is a synchronized, real-time event with a small window, where every
  owner acts in turn and the system must keep all participants on the same pick
  state.
- The season is an ongoing read-and-notify workload, where the dominant traffic
  is owners refreshing their scores while live games are being played.
- These phases impose different consistency and latency requirements, so they
  are built as separate services rather than one monolith, even though they
  share the league data model.

The hard consistency requirements are concentrated in the draft and in roster
transactions.

- Two owners must never be assigned the same player, a drafted player must be
  locked out of every other league's availability, and a trade must be atomic:
  both teams' rosters change together or not at all.
- Live scoring, by contrast, is derived data that can tolerate eventual
  consistency, since a few seconds of scoring lag is acceptable.
- The design keeps these guarantees localized, making the draft and transaction
  engines strictly serialized while the scoring and notification paths scale
  out.

### How do you run live drafts with many users?

A draft is a strictly ordered event, so the Draft Engine is a state machine that
owns whose turn it is and which players remain available.

- The league's draft order is fixed at creation, and the engine advances the
  turn only when the current owner picks or their clock expires.
- The engine is the single authority on pick validity: it checks that the
  selected player is still undrafted, that the pick is in order, and that any
  roster rules such as position limits are satisfied.
- Because there is one writer per league, the draft is naturally serializable,
  and the guarantee that no player is picked twice follows from that
  serialization.

All owners must see the same draft board instantly.

- The engine broadcasts every pick, timer reset, and turn change to all league
  members over a real-time channel, and each client renders the same
  authoritative state.
- When a pick lands, the engine publishes it, and every other league immediately
  marks that player unavailable.
- If an owner disconnects, the engine keeps running the clock; if the clock
  expires, the engine auto-picks the best available player according to a preset
  ranking, so a single absent owner does not stall the entire league.

The system must support drafts of very different sizes, from small casual
leagues to massive public leagues with hundreds of participants.

- The engine scales by running one independent state machine per league, so
  thousands of concurrent drafts are just thousands of independent, small state
  machines.
- The shared hot spot is the player availability check, which is served from a
  replicated in-memory index and updated through the pick events.
- A crash is recovered by replaying the pick log, so the draft can resume from
  the last committed pick rather than restarting.

### How do you score rosters against live games?

Scoring is a pure transformation from athlete performance to fantasy points.

- The Live Scoring component ingests the stats feed from the Stats Provider,
  which streams events such as a touchdown, a catch, or a passing yard, and maps
  each event to the fantasy scoring rules configured for the league.
- The mapping is deterministic and versioned, so the same event always produces
  the same points.
- Because scoring rules differ by league, the mapper resolves the league's
  scoring settings for each event rather than applying a single global formula,
  and the resulting points are credited to the roster that owns the athlete.

The flow is a fan-out from one athlete to many teams.

- A single event in one real game may affect thousands of rosters, so the
  scoring service cannot recompute each team's total per event.
- Instead, it computes the points for the athlete once, then applies the delta
  to every team with that athlete in their lineup, and updates the team totals
  incrementally.
- Team scores are maintained as running totals that move up as events land,
  which is exactly what owners expect from a live score ticker.
- Late stat corrections, where the official scorer revises an event, are handled
  by replaying the corrected event and applying a delta rather than recomputing
  the season.

Consistency matters only at the margins.

- The score the owner sees may lag the actual event by a moment, but it must
  never jump backward except for a legitimate stat correction, and the final
  score must match the official result.
- The system achieves this by keeping the stats feed as the ordering authority,
  applying events in the provider's order, and writing the final game totals as
  the authoritative result when the game ends.
- The live view is derived from the event stream, while the final standings read
  the settled totals, so the two never disagree once a game is official.

### How do you power the waiver wire and trades?

Roster changes are governed by rules that make the system more than a simple
mutation.

- The waiver wire is a claim process: after each period of real games, owners
  submit claims for free agents, and the claims are processed in an order
  determined by league settings, typically worst team first.
- The Waiver and Trades service collects all claims, orders them, and awards
  each claimed player to exactly one owner, atomically dropping the player the
  claiming owner releases.
- Claim processing is a batch operation, not a live one, so it can be serialized
  per league and executed when the waiver window closes.

Trades are bilateral but still need atomicity and validation.

- A trade proposal swaps players and possibly draft picks between two rosters,
  and the exchange must be validated against position limits, salary or cap
  rules, and the league's trade review policy, such as a league vote or a
  commissioner veto.
- The critical guarantee is atomicity: either both rosters change or neither
  does, and no other transaction can interleave, because the two teams may
  otherwise briefly share the same player.
- The service therefore applies the whole exchange as a single database
  transaction with per-team locking.

Waivers and trades also have to stay consistent with the rest of the system.

- A player who was just drafted or claimed must not be immediately re-traded in
  a way that violates league rules, and a player on a team that is playing a
  live game may be locked by the roster rules.
- Every transaction is timestamped and recorded in the Leagues DB, so the
  transaction history is auditable and can be reversed by a commissioner.
- The service is the only writer to roster state, so live scoring and
  transaction processing never race over the same team.

### How do you push real-time score updates?

The notification problem is one-to-many with strict latency: one scoring event
must reach every interested owner within seconds.

- The system uses a publish-subscribe path per league, where the Live Scoring
  service publishes score deltas and the real-time delivery layer fans them out
  to the connected clients of that league.
- The fan-out is scoped, so an event in a game affects only the leagues that
  roster the involved athletes.
- Each owner receives a delta and the updated team total, and the client updates
  the display without refetching.

The push layer has to coexist with the fetch path.

- Owners are often on a web page or app that is not actively connected, so the
  system runs both a push channel for live connections and a query path backed
  by the aggregated scores for late or reconnecting viewers.
- When a client connects, it receives a full snapshot and then subscribes to
  deltas, so a reconnect is cheap and never misses a score.
- The push channel carries only the changed numbers, keeping bandwidth low even
  when thousands of owners watch the same Sunday slate of games.

Reliability and pacing shape the final design.

- A missed push must not lose a score, so the client reconciles against the
  aggregated store on reconnect, and the notification path retries in-flight
  deliveries.
- Alert cadence is controlled, so owners are not spammed by every small event:
  threshold-based alerts, such as a touchdown or a player reaching a point
  milestone, are sent as push notifications, while the ticker handles the
  continuous deltas.
- The notification service is decoupled from the scoring pipeline through a
  queue, so a slow delivery tier never backs up the scoring path that every
  league depends on.

## Source

```text
title: Fantasy Sports
node owner: Team Owner [round, icon=browser]
node app: Fantasy App [icon=browser]
node gateway: API Gateway [icon=server]
node league: League Service [icon=compute]
node draft: Draft Engine [icon=compute]
node roster: Roster Service [icon=compute]
node score: Live Scoring [icon=queue]
node stats: Stats Provider [icon=cloud]
node trade: Waiver & Trades [icon=compute]
node notify: Notifications [icon=message]
node db: Leagues DB [cylinder, icon=database]

edge owner -> app: draft
edge app -> gateway: pick
edge gateway -> draft: select
edge draft -> roster: assign
edge stats -> score: live data
edge score -> roster: points
edge roster -> app: update
edge owner -> app: waiver
edge gateway -> trade: process
edge trade -> roster: swap
edge score -> notify: alert
edge league -> db: store
```

## Q&A

### Q: Design a fantasy sports platform

**A:** A fantasy sports platform lets team owners draft real athletes, manage rosters,
and compete on the athletes' live game performance.

- The League Service owns leagues, memberships, and season structure, and the
  Roster Service tracks each team's players and lineups.
- The Draft Engine runs the live draft where owners take turns selecting
  players.
- During the season, a Stats Provider supplies live game data, the Live Scoring
  component computes fantasy points from that data, and the Roster Service
  applies the points to each team.
- Waiver claims and trades are processed by the Waiver and Trades service, and
  the Notification Service pushes score changes and transaction alerts.
- All league and roster state is durable in the Leagues DB.

The platform has two dramatically different phases.

- The draft is a synchronized, real-time event with a small window, where every
  owner acts in turn and the system must keep all participants on the same pick
  state.
- The season is an ongoing read-and-notify workload, where the dominant traffic
  is owners refreshing their scores while live games are being played.
- These phases impose different consistency and latency requirements, so they
  are built as separate services rather than one monolith, even though they
  share the league data model.

The hard consistency requirements are concentrated in the draft and in roster
transactions.

- Two owners must never be assigned the same player, a drafted player must be
  locked out of every other league's availability, and a trade must be atomic:
  both teams' rosters change together or not at all.
- Live scoring, by contrast, is derived data that can tolerate eventual
  consistency, since a few seconds of scoring lag is acceptable.
- The design keeps these guarantees localized, making the draft and transaction
  engines strictly serialized while the scoring and notification paths scale
  out.

### Q: How do you run live drafts with many users?

**A:** A draft is a strictly ordered event, so the Draft Engine is a state machine that
owns whose turn it is and which players remain available.

- The league's draft order is fixed at creation, and the engine advances the
  turn only when the current owner picks or their clock expires.
- The engine is the single authority on pick validity: it checks that the
  selected player is still undrafted, that the pick is in order, and that any
  roster rules such as position limits are satisfied.
- Because there is one writer per league, the draft is naturally serializable,
  and the guarantee that no player is picked twice follows from that
  serialization.

All owners must see the same draft board instantly.

- The engine broadcasts every pick, timer reset, and turn change to all league
  members over a real-time channel, and each client renders the same
  authoritative state.
- When a pick lands, the engine publishes it, and every other league immediately
  marks that player unavailable.
- If an owner disconnects, the engine keeps running the clock; if the clock
  expires, the engine auto-picks the best available player according to a preset
  ranking, so a single absent owner does not stall the entire league.

The system must support drafts of very different sizes, from small casual
leagues to massive public leagues with hundreds of participants.

- The engine scales by running one independent state machine per league, so
  thousands of concurrent drafts are just thousands of independent, small state
  machines.
- The shared hot spot is the player availability check, which is served from a
  replicated in-memory index and updated through the pick events.
- A crash is recovered by replaying the pick log, so the draft can resume from
  the last committed pick rather than restarting.

### Q: How do you score rosters against live games?

**A:** Scoring is a pure transformation from athlete performance to fantasy points.

- The Live Scoring component ingests the stats feed from the Stats Provider,
  which streams events such as a touchdown, a catch, or a passing yard, and maps
  each event to the fantasy scoring rules configured for the league.
- The mapping is deterministic and versioned, so the same event always produces
  the same points.
- Because scoring rules differ by league, the mapper resolves the league's
  scoring settings for each event rather than applying a single global formula,
  and the resulting points are credited to the roster that owns the athlete.

The flow is a fan-out from one athlete to many teams.

- A single event in one real game may affect thousands of rosters, so the
  scoring service cannot recompute each team's total per event.
- Instead, it computes the points for the athlete once, then applies the delta
  to every team with that athlete in their lineup, and updates the team totals
  incrementally.
- Team scores are maintained as running totals that move up as events land,
  which is exactly what owners expect from a live score ticker.
- Late stat corrections, where the official scorer revises an event, are handled
  by replaying the corrected event and applying a delta rather than recomputing
  the season.

Consistency matters only at the margins.

- The score the owner sees may lag the actual event by a moment, but it must
  never jump backward except for a legitimate stat correction, and the final
  score must match the official result.
- The system achieves this by keeping the stats feed as the ordering authority,
  applying events in the provider's order, and writing the final game totals as
  the authoritative result when the game ends.
- The live view is derived from the event stream, while the final standings read
  the settled totals, so the two never disagree once a game is official.

### Q: How do you power the waiver wire and trades?

**A:** Roster changes are governed by rules that make the system more than a simple
mutation.

- The waiver wire is a claim process: after each period of real games, owners
  submit claims for free agents, and the claims are processed in an order
  determined by league settings, typically worst team first.
- The Waiver and Trades service collects all claims, orders them, and awards
  each claimed player to exactly one owner, atomically dropping the player the
  claiming owner releases.
- Claim processing is a batch operation, not a live one, so it can be serialized
  per league and executed when the waiver window closes.

Trades are bilateral but still need atomicity and validation.

- A trade proposal swaps players and possibly draft picks between two rosters,
  and the exchange must be validated against position limits, salary or cap
  rules, and the league's trade review policy, such as a league vote or a
  commissioner veto.
- The critical guarantee is atomicity: either both rosters change or neither
  does, and no other transaction can interleave, because the two teams may
  otherwise briefly share the same player.
- The service therefore applies the whole exchange as a single database
  transaction with per-team locking.

Waivers and trades also have to stay consistent with the rest of the system.

- A player who was just drafted or claimed must not be immediately re-traded in
  a way that violates league rules, and a player on a team that is playing a
  live game may be locked by the roster rules.
- Every transaction is timestamped and recorded in the Leagues DB, so the
  transaction history is auditable and can be reversed by a commissioner.
- The service is the only writer to roster state, so live scoring and
  transaction processing never race over the same team.

### Q: How do you push real-time score updates?

**A:** The notification problem is one-to-many with strict latency: one scoring event
must reach every interested owner within seconds.

- The system uses a publish-subscribe path per league, where the Live Scoring
  service publishes score deltas and the real-time delivery layer fans them out
  to the connected clients of that league.
- The fan-out is scoped, so an event in a game affects only the leagues that
  roster the involved athletes.
- Each owner receives a delta and the updated team total, and the client updates
  the display without refetching.

The push layer has to coexist with the fetch path.

- Owners are often on a web page or app that is not actively connected, so the
  system runs both a push channel for live connections and a query path backed
  by the aggregated scores for late or reconnecting viewers.
- When a client connects, it receives a full snapshot and then subscribes to
  deltas, so a reconnect is cheap and never misses a score.
- The push channel carries only the changed numbers, keeping bandwidth low even
  when thousands of owners watch the same Sunday slate of games.

Reliability and pacing shape the final design.

- A missed push must not lose a score, so the client reconciles against the
  aggregated store on reconnect, and the notification path retries in-flight
  deliveries.
- Alert cadence is controlled, so owners are not spammed by every small event:
  threshold-based alerts, such as a touchdown or a player reaching a point
  milestone, are sent as push notifications, while the ticker handles the
  continuous deltas.
- The notification service is decoupled from the scoring pipeline through a
  queue, so a slow delivery tier never backs up the scoring path that every
  league depends on.

## Source

```text
title: Fantasy Sports
node owner: Team Owner [round, icon=browser]
node app: Fantasy App [icon=browser]
node gateway: API Gateway [icon=server]
node league: League Service [icon=compute]
node draft: Draft Engine [icon=compute]
node roster: Roster Service [icon=compute]
node score: Live Scoring [icon=queue]
node stats: Stats Provider [icon=cloud]
node trade: Waiver & Trades [icon=compute]
node notify: Notifications [icon=message]
node db: Leagues DB [cylinder, icon=database]

edge owner -> app: draft
edge app -> gateway: pick
edge gateway -> draft: select
edge draft -> roster: assign
edge stats -> score: live data
edge score -> roster: points
edge roster -> app: update
edge owner -> app: waiver
edge gateway -> trade: process
edge trade -> roster: swap
edge score -> notify: alert
edge league -> db: store
```
