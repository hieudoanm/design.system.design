# Kahoot — Quiz Game

Design a live quiz / trivia game

**Difficulty:** Hard

**Tags:** gaming, ml

## Functional Requirements

- a live quiz / trivia game
- synchronize questions across players?
- handle answer latency and correctness?
- compute scores and leaderboards in real-time?
- scale to many concurrent lobbies?

## Non-Functional Requirements

- The Game Room maintains
  a single timeline for the current question, with phases such as countdown,
  question displayed, answer window, and reveal.

- The room broadcasts a phase event with the current timestamp to all players,
  and the client renders against that server timeline rather than its own wall
  clock.
- When a player joins mid-game, the room sends a state snapshot containing the
  current phase, the question, and the remaining time, so a late joiner is
  brought exactly in sync.
- Because the client does not advance the game on its own, drift between players
  is bounded by network latency rather than by accumulated client error.

The broadcast mechanism is a real-time push channel, typically a WebSocket
federation or a dedicated pub-sub bus scoped to the room.

- The room publishes each event once, and the delivery layer fans it out to
  every connection in that room.
- The system does not attempt to make arrival time equal; instead, it makes the
  game decision on the server clock, so players who receive an event slightly
  late still answer against the same deadline.
- This is the critical fairness property: the answering window is defined by
  server time, not by when each player's device rendered the question.

The room also reconciles state after any disruption.

- If a player's connection drops and reconnects, the room replays the current
  phase and state, so the player is not lost from the game.
- If the room process fails, a standby restores the latest snapshot and clients
  resubscribe.
- Synchronization therefore has two layers: the steady-state broadcast that
  keeps everyone on the same question, and the recovery path that brings
  stragglers and crashed rooms back to the shared timeline without restarting
  the game for everyone..
- Scoring is an incremental aggregation over each room.

- After a question closes, the Scoring Engine grades all accepted answers and
  produces a score delta per player, then applies the deltas to the running
  total held in the room state.
- The Live Leaderboard is maintained as an in-memory sorted structure per room,
  updated with each question's results, and broadcast to all players after the
  reveal.
- The design deliberately avoids recomputing the leaderboard from scratch,
  because that would make cost grow with the number of questions and players,
  whereas incremental update keeps the cost constant per question regardless of
  the game length.

Consistency between the displayed board and the authoritative score comes from a
single writer.

- The room is the only component that updates scores, so the leaderboard cannot
  diverge from the score state even though many clients receive broadcasts.
- The board is stored as a snapshot, not as a stream, so a reconnecting player
  receives the current ordering immediately.
- At game end, the final scores and board order are written to the Games DB as
  the durable record, and the room can be discarded.

The leaderboard also has to handle ties and per-question variation.

- Ties are broken deterministically, for example by completion time or by a
  stable player ID ordering, so two clients that render the same snapshot show
  the same ranks.
- Speed bonuses mean the board order can change substantially between questions,
  which is expected and desirable, and the broadcast after each reveal is what
  animates the live board for all players.
- Because the leaderboard is derived state, it is recomputable from the
  per-question results, which makes auditability and post-game reporting simple..
- The system scales by treating each room as an independent, small unit of work
  and routing players to the room's host process.

- A Lobby Service tracks which process owns which room, so a player joining with
  a code is directed to the correct server, and the host's game traffic stays
  collocated with its players.
- Rooms do not share state, so the workload is naturally parallel: adding
  capacity is adding room-hosting processes, and the only cross-room structures,
  the Lobby Service and the Question Bank, are shared but cheap and horizontally
  replicable.

The main scaling risk is a flood of concurrent games and the associated
connection fan-out.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Quiz Game
player: Player
host: Host
app: Game App
gateway: API Gateway
lobby: Lobby Service
room: Game Room
question: Question Bank
answer: Answer Collector
score: Scoring Engine
board: Live Leaderboard
db: Games DB

host ─► app ─► start game
app ─► lobby ─► create
lobby ─► room ─► join
player ─► app ─► join
room ─► question ─► load
room ─► app ─► broadcast
player ─► app ─► answer
answer ─► score ─► grade
score ─► board ─► update
board ─► app ─► push
room ─► db ─► save
```

## Design

### Design a live quiz / trivia game

A live quiz game is a real-time multiplayer experience with one host and many
players, all moving through the same questions at the same time.

- The host creates a game through the Lobby Service, which returns a join code
  that players use to enter the Game Room.
- The room is the core state container: it holds the roster, the current
  question, the phase of the game, and the clock.
- When the host starts the game, the room loads questions from the Question Bank
  and broadcasts each one to every connected player, then collects their answers
  through the Answer Collector, grades them in the Scoring Engine, and publishes
  the updated Live Leaderboard.
- Game results are saved to the Games DB when the room finishes.

The central challenge is synchronization. Every player must see the same
question start and end at the same instant, because fairness depends on everyone
having the same answering window.

- The room therefore owns an authoritative game clock, and the clients are
  treated as renderers that display server-sent state rather than as
  participants who advance the game.
- The server decides question start, the answer deadline, and the transition to
  the next question, and pushes those transitions to all clients.
- This removes any dependence on client clocks, which drift and can be tampered
  with.

The architecture separates the control plane from the data plane. The Lobby
Service and the room life cycle are lightweight control operations, while the
broadcast of questions and the flood of answers are the high-bandwidth data
plane.

- Keeping these apart means a room that is under heavy answer load does not
  block the creation of new lobbies, and a slow player's connection does not
  stall the room.
- The room itself is an in-memory state machine with durable snapshots, so
  losing a process does not lose the entire game.

### How do you synchronize questions across players?

Synchronization starts with an authoritative room clock. The Game Room maintains
a single timeline for the current question, with phases such as countdown,
question displayed, answer window, and reveal.

- The room broadcasts a phase event with the current timestamp to all players,
  and the client renders against that server timeline rather than its own wall
  clock.
- When a player joins mid-game, the room sends a state snapshot containing the
  current phase, the question, and the remaining time, so a late joiner is
  brought exactly in sync.
- Because the client does not advance the game on its own, drift between players
  is bounded by network latency rather than by accumulated client error.

The broadcast mechanism is a real-time push channel, typically a WebSocket
federation or a dedicated pub-sub bus scoped to the room.

- The room publishes each event once, and the delivery layer fans it out to
  every connection in that room.
- The system does not attempt to make arrival time equal; instead, it makes the
  game decision on the server clock, so players who receive an event slightly
  late still answer against the same deadline.
- This is the critical fairness property: the answering window is defined by
  server time, not by when each player's device rendered the question.

The room also reconciles state after any disruption.

- If a player's connection drops and reconnects, the room replays the current
  phase and state, so the player is not lost from the game.
- If the room process fails, a standby restores the latest snapshot and clients
  resubscribe.
- Synchronization therefore has two layers: the steady-state broadcast that
  keeps everyone on the same question, and the recovery path that brings
  stragglers and crashed rooms back to the shared timeline without restarting
  the game for everyone.

### How do you handle answer latency and correctness?

Answers arrive on a tight deadline, and the design must separate the network
layer from the game logic. Players submit answers through the app to the Answer
Collector, which is a per-room ingest point that stamps each answer with the
server time it arrived.

- The deadline check is applied here: the answer is accepted only if its server
  timestamp is before the close time of the current question.
- Because the deadline is enforced on the server, a fast connection or a slow
  one does not change what counts, and a player who guesses the timing cannot
  extend their window by manipulating the client.
- Timestamps are monotonic per room and consistent with the room clock.

Correctness is computed in the Scoring Engine after the window closes, not as
answers arrive. This has two benefits.

- First, it decouples scoring from the flood of submissions, so the room can
  accept answers at peak rate without computing on the hot path.
- Second, it makes scoring deterministic and replayable: the graded result for a
  question is a pure function of the accepted answer set, so a reprocessed
  question yields identical scores.
- Grading also accounts for timing, since many quiz games award bonus points for
  speed, and the server timestamp is the only timing input the engine trusts.

The system tolerates partial and malformed input.

- Missing answers are graded as incorrect rather than erroring, because a player
  whose answer never arrived must still get a score for the question.
- Duplicate answers from retries are deduplicated by player and question, with
  the first accepted submission winning.
- Late answers are logged separately from the graded set, so the team can
  measure how many players are being cut off by the deadline and tune the
  window.
- Correctness is verified end-to-end: the reveal shows the key, the player's
  answer, and their score, so a discrepancy surfaces immediately to the user
  rather than silently persisting.

### How do you compute scores and leaderboards in real-time?

Scoring is an incremental aggregation over each room.

- After a question closes, the Scoring Engine grades all accepted answers and
  produces a score delta per player, then applies the deltas to the running
  total held in the room state.
- The Live Leaderboard is maintained as an in-memory sorted structure per room,
  updated with each question's results, and broadcast to all players after the
  reveal.
- The design deliberately avoids recomputing the leaderboard from scratch,
  because that would make cost grow with the number of questions and players,
  whereas incremental update keeps the cost constant per question regardless of
  the game length.

Consistency between the displayed board and the authoritative score comes from a
single writer.

- The room is the only component that updates scores, so the leaderboard cannot
  diverge from the score state even though many clients receive broadcasts.
- The board is stored as a snapshot, not as a stream, so a reconnecting player
  receives the current ordering immediately.
- At game end, the final scores and board order are written to the Games DB as
  the durable record, and the room can be discarded.

The leaderboard also has to handle ties and per-question variation.

- Ties are broken deterministically, for example by completion time or by a
  stable player ID ordering, so two clients that render the same snapshot show
  the same ranks.
- Speed bonuses mean the board order can change substantially between questions,
  which is expected and desirable, and the broadcast after each reveal is what
  animates the live board for all players.
- Because the leaderboard is derived state, it is recomputable from the
  per-question results, which makes auditability and post-game reporting simple.

### How do you scale to many concurrent lobbies?

The system scales by treating each room as an independent, small unit of work
and routing players to the room's host process.

- A Lobby Service tracks which process owns which room, so a player joining with
  a code is directed to the correct server, and the host's game traffic stays
  collocated with its players.
- Rooms do not share state, so the workload is naturally parallel: adding
  capacity is adding room-hosting processes, and the only cross-room structures,
  the Lobby Service and the Question Bank, are shared but cheap and horizontally
  replicable.

The main scaling risk is a flood of concurrent games and the associated
connection fan-out. Each player holds a long-lived connection, so the connection
layer is the resource that runs out first.

- The design separates connection termination from room logic, letting a front
  tier hold connections and forward to the room host, and it sizes rooms against
  a predictable per-player bandwidth so capacity planning is arithmetic: players
  per server, rooms per server, servers per region.
- The Question Bank is read from a replicated cache, since many concurrent rooms
  request the same popular quizzes.

Isolation is what makes the numbers hold. A single misbehaving room, one with
thousands of players or a flood of retries, must not degrade other rooms, so the
room hosts enforce per-room resource limits and a global admission policy on
lobby creation.

- Load shedding at the front tier keeps the connection layer alive when demand
  spikes, dropping new joins with a clear error rather than degrading existing
  games.
- The Games DB is written as rooms finish, which smooths the write load, since
  the moment a game ends is spread randomly rather than synchronized across all
  games.

## Source

```text
title: Quiz Game
node player: Player [round, icon=browser]
node host: Host [round, icon=browser]
node app: Game App [icon=browser]
node gateway: API Gateway [icon=server]
node lobby: Lobby Service [icon=compute]
node room: Game Room [icon=compute]
node question: Question Bank [cylinder, icon=database]
node answer: Answer Collector [icon=queue]
node score: Scoring Engine [icon=compute]
node board: Live Leaderboard [icon=sync]
node db: Games DB [cylinder, icon=database]

edge host -> app: start game
edge app -> lobby: create
edge lobby -> room: join
edge player -> app: join
edge room -> question: load
edge room -> app: broadcast
edge player -> app: answer
edge answer -> score: grade
edge score -> board: update
edge board -> app: push
edge room -> db: save
```

## Q&A

### Q: Design a live quiz / trivia game

**A:** A live quiz game is a real-time multiplayer experience with one host and many
players, all moving through the same questions at the same time.

- The host creates a game through the Lobby Service, which returns a join code
  that players use to enter the Game Room.
- The room is the core state container: it holds the roster, the current
  question, the phase of the game, and the clock.
- When the host starts the game, the room loads questions from the Question Bank
  and broadcasts each one to every connected player, then collects their answers
  through the Answer Collector, grades them in the Scoring Engine, and publishes
  the updated Live Leaderboard.
- Game results are saved to the Games DB when the room finishes.

The central challenge is synchronization. Every player must see the same
question start and end at the same instant, because fairness depends on everyone
having the same answering window.

- The room therefore owns an authoritative game clock, and the clients are
  treated as renderers that display server-sent state rather than as
  participants who advance the game.
- The server decides question start, the answer deadline, and the transition to
  the next question, and pushes those transitions to all clients.
- This removes any dependence on client clocks, which drift and can be tampered
  with.

The architecture separates the control plane from the data plane. The Lobby
Service and the room life cycle are lightweight control operations, while the
broadcast of questions and the flood of answers are the high-bandwidth data
plane.

- Keeping these apart means a room that is under heavy answer load does not
  block the creation of new lobbies, and a slow player's connection does not
  stall the room.
- The room itself is an in-memory state machine with durable snapshots, so
  losing a process does not lose the entire game.

### Q: How do you synchronize questions across players?

**A:** Synchronization starts with an authoritative room clock. The Game Room maintains
a single timeline for the current question, with phases such as countdown,
question displayed, answer window, and reveal.

- The room broadcasts a phase event with the current timestamp to all players,
  and the client renders against that server timeline rather than its own wall
  clock.
- When a player joins mid-game, the room sends a state snapshot containing the
  current phase, the question, and the remaining time, so a late joiner is
  brought exactly in sync.
- Because the client does not advance the game on its own, drift between players
  is bounded by network latency rather than by accumulated client error.

The broadcast mechanism is a real-time push channel, typically a WebSocket
federation or a dedicated pub-sub bus scoped to the room.

- The room publishes each event once, and the delivery layer fans it out to
  every connection in that room.
- The system does not attempt to make arrival time equal; instead, it makes the
  game decision on the server clock, so players who receive an event slightly
  late still answer against the same deadline.
- This is the critical fairness property: the answering window is defined by
  server time, not by when each player's device rendered the question.

The room also reconciles state after any disruption.

- If a player's connection drops and reconnects, the room replays the current
  phase and state, so the player is not lost from the game.
- If the room process fails, a standby restores the latest snapshot and clients
  resubscribe.
- Synchronization therefore has two layers: the steady-state broadcast that
  keeps everyone on the same question, and the recovery path that brings
  stragglers and crashed rooms back to the shared timeline without restarting
  the game for everyone.

### Q: How do you handle answer latency and correctness?

**A:** Answers arrive on a tight deadline, and the design must separate the network
layer from the game logic. Players submit answers through the app to the Answer
Collector, which is a per-room ingest point that stamps each answer with the
server time it arrived.

- The deadline check is applied here: the answer is accepted only if its server
  timestamp is before the close time of the current question.
- Because the deadline is enforced on the server, a fast connection or a slow
  one does not change what counts, and a player who guesses the timing cannot
  extend their window by manipulating the client.
- Timestamps are monotonic per room and consistent with the room clock.

Correctness is computed in the Scoring Engine after the window closes, not as
answers arrive. This has two benefits.

- First, it decouples scoring from the flood of submissions, so the room can
  accept answers at peak rate without computing on the hot path.
- Second, it makes scoring deterministic and replayable: the graded result for a
  question is a pure function of the accepted answer set, so a reprocessed
  question yields identical scores.
- Grading also accounts for timing, since many quiz games award bonus points for
  speed, and the server timestamp is the only timing input the engine trusts.

The system tolerates partial and malformed input.

- Missing answers are graded as incorrect rather than erroring, because a player
  whose answer never arrived must still get a score for the question.
- Duplicate answers from retries are deduplicated by player and question, with
  the first accepted submission winning.
- Late answers are logged separately from the graded set, so the team can
  measure how many players are being cut off by the deadline and tune the
  window.
- Correctness is verified end-to-end: the reveal shows the key, the player's
  answer, and their score, so a discrepancy surfaces immediately to the user
  rather than silently persisting.

### Q: How do you compute scores and leaderboards in real-time?

**A:** Scoring is an incremental aggregation over each room.

- After a question closes, the Scoring Engine grades all accepted answers and
  produces a score delta per player, then applies the deltas to the running
  total held in the room state.
- The Live Leaderboard is maintained as an in-memory sorted structure per room,
  updated with each question's results, and broadcast to all players after the
  reveal.
- The design deliberately avoids recomputing the leaderboard from scratch,
  because that would make cost grow with the number of questions and players,
  whereas incremental update keeps the cost constant per question regardless of
  the game length.

Consistency between the displayed board and the authoritative score comes from a
single writer.

- The room is the only component that updates scores, so the leaderboard cannot
  diverge from the score state even though many clients receive broadcasts.
- The board is stored as a snapshot, not as a stream, so a reconnecting player
  receives the current ordering immediately.
- At game end, the final scores and board order are written to the Games DB as
  the durable record, and the room can be discarded.

The leaderboard also has to handle ties and per-question variation.

- Ties are broken deterministically, for example by completion time or by a
  stable player ID ordering, so two clients that render the same snapshot show
  the same ranks.
- Speed bonuses mean the board order can change substantially between questions,
  which is expected and desirable, and the broadcast after each reveal is what
  animates the live board for all players.
- Because the leaderboard is derived state, it is recomputable from the
  per-question results, which makes auditability and post-game reporting simple.

### Q: How do you scale to many concurrent lobbies?

**A:** The system scales by treating each room as an independent, small unit of work
and routing players to the room's host process.

- A Lobby Service tracks which process owns which room, so a player joining with
  a code is directed to the correct server, and the host's game traffic stays
  collocated with its players.
- Rooms do not share state, so the workload is naturally parallel: adding
  capacity is adding room-hosting processes, and the only cross-room structures,
  the Lobby Service and the Question Bank, are shared but cheap and horizontally
  replicable.

The main scaling risk is a flood of concurrent games and the associated
connection fan-out. Each player holds a long-lived connection, so the connection
layer is the resource that runs out first.

- The design separates connection termination from room logic, letting a front
  tier hold connections and forward to the room host, and it sizes rooms against
  a predictable per-player bandwidth so capacity planning is arithmetic: players
  per server, rooms per server, servers per region.
- The Question Bank is read from a replicated cache, since many concurrent rooms
  request the same popular quizzes.

Isolation is what makes the numbers hold. A single misbehaving room, one with
thousands of players or a flood of retries, must not degrade other rooms, so the
room hosts enforce per-room resource limits and a global admission policy on
lobby creation.

- Load shedding at the front tier keeps the connection layer alive when demand
  spikes, dropping new joins with a clear error rather than degrading existing
  games.
- The Games DB is written as rooms finish, which smooths the write load, since
  the moment a game ends is spread randomly rather than synchronized across all
  games.

## Source

```text
title: Quiz Game
node player: Player [round, icon=browser]
node host: Host [round, icon=browser]
node app: Game App [icon=browser]
node gateway: API Gateway [icon=server]
node lobby: Lobby Service [icon=compute]
node room: Game Room [icon=compute]
node question: Question Bank [cylinder, icon=database]
node answer: Answer Collector [icon=queue]
node score: Scoring Engine [icon=compute]
node board: Live Leaderboard [icon=sync]
node db: Games DB [cylinder, icon=database]

edge host -> app: start game
edge app -> lobby: create
edge lobby -> room: join
edge player -> app: join
edge room -> question: load
edge room -> app: broadcast
edge player -> app: answer
edge answer -> score: grade
edge score -> board: update
edge board -> app: push
edge room -> db: save
```
