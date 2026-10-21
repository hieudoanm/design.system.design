# Game Matchmaking

Design a game matchmaking system

**Difficulty:** Hard

**Tags:** gaming, matching, queue

## Functional Requirements

- a game matchmaking system
- build a ranked queue?
- balance teams by skill?
- handle queue time targets?
- avoid bad matches?

## Non-Functional Requirements

- A matchmaking system takes players who want to play and groups them into a
  balanced match.

- A player joins through the app, and the API Gateway enqueues them into the
  Matchmaking Queue.
- The Skill Rating component maintains each player's rating, typically a version
  of Elo or Glicko stored in the Rating Store, and the queue organizes players
  by that rating.
- Parties join as groups, so the Party Service feeds pre-formed teams into the
  queue rather than individuals.
- The Matchmaker continuously scans the queue, selects a set of players whose
  ratings form a fair match, creates a Match Room, and the Notification Service
  prompts everyone to accept.
- Completed match records are written to the Matches DB.

The core tension in matchmaking is quality versus time.

- Waiting longer makes better matches possible, because the queue accumulates
  more candidates at the same skill, but players abandon if the wait is too
  long.
- The system therefore treats queue time as a tunable target and relaxes the
  match criteria as wait time grows.
- The Matchmaker searches for the best available grouping that meets the current
  tolerance, rather than the globally best possible grouping, so the search is
  bounded and the queue drains on schedule.

The system also has to respect the social structure of the game.

- Players arrive solo, in pairs, or in full parties, and the matchmaker must
  place a party as a unit or break the party's expectation.
- Rating is only the primary signal, not the only one: region, latency, game
  mode, and the player's current win or loss streak all influence which
  opponents are acceptable.
- The architecture separates these concerns, with rating in the Skill Rating
  service, grouping in the Party Service, and the decision policy in the
  Matchmaker, so each dimension can evolve independently..
- The ranked queue is not a plain FIFO; it is an index of waiting players keyed by
  the properties that matter for matching.

- The Matchmaking Queue maintains players grouped by game mode, region, and
  rating band, so the Matchmaker can search within a tight slice instead of
  scanning all waiting players.
- Joining is an insert into the appropriate bucket, and leaving is a remove,
  which happens when a player cancels, times out, or is drafted into a match.
- The queue must handle both operations efficiently at the rates the game
  produces them, which are spiky: queueing spikes when an event starts or a
  patch drops.

Queue integrity comes from the rating store being the source of truth.

- The Skill Rating component reads each player's current rating and volatility
  from the Rating Store at enqueue time, so the queue never works with stale
  ratings, and updates the rating only after a match completes.
- A player cannot enter the same queue twice, and a party is enqueued as a
  single unit with a representative rating, so the queue treats the group
  atomically.
- Every queue action is timestamped, because the waiting time since enqueue is
  the primary input to how much the system relaxes its standards.

The queue also has to protect itself from abuse and from its own popularity.

- Duplicate enqueues, rapid leave and rejoin, and players dodging into the same
  queue repeatedly are detected and throttled.
- When the queue is large, the Matchmaker drains it in parallel by partitioning
  the rating space, so different rating bands are matched independently, and the
  queue service scales by sharding on rating band.
- The queue is ephemeral by design: its state lives in memory and can be
  reconstructed from the authoritative rating store if a process fails..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Game Matchmaking
player: Player
app: Game App
gateway: API Gateway
queue: Matchmaking Queue
rating: Skill Rating
party: Party Service
match: Matchmaker
mmr: Rating Store
room: Match Rooms
notify: Notifications
db: Matches DB

player ─► app ─► queue
app ─► gateway ─► enqueue
gateway ─► queue ─► insert
queue ─► rating ─► rank
rating ─► mmr ─► lookup
party ─► queue ─► group
queue ─► match ─► form
match ─► room ─► create
room ─► notify ─► ready
notify ─► app ─► accept
match ─► db ─► store
```

## Design

### Design a game matchmaking system

A matchmaking system takes players who want to play and groups them into a
balanced match.

- A player joins through the app, and the API Gateway enqueues them into the
  Matchmaking Queue.
- The Skill Rating component maintains each player's rating, typically a version
  of Elo or Glicko stored in the Rating Store, and the queue organizes players
  by that rating.
- Parties join as groups, so the Party Service feeds pre-formed teams into the
  queue rather than individuals.
- The Matchmaker continuously scans the queue, selects a set of players whose
  ratings form a fair match, creates a Match Room, and the Notification Service
  prompts everyone to accept.
- Completed match records are written to the Matches DB.

The core tension in matchmaking is quality versus time.

- Waiting longer makes better matches possible, because the queue accumulates
  more candidates at the same skill, but players abandon if the wait is too
  long.
- The system therefore treats queue time as a tunable target and relaxes the
  match criteria as wait time grows.
- The Matchmaker searches for the best available grouping that meets the current
  tolerance, rather than the globally best possible grouping, so the search is
  bounded and the queue drains on schedule.

The system also has to respect the social structure of the game.

- Players arrive solo, in pairs, or in full parties, and the matchmaker must
  place a party as a unit or break the party's expectation.
- Rating is only the primary signal, not the only one: region, latency, game
  mode, and the player's current win or loss streak all influence which
  opponents are acceptable.
- The architecture separates these concerns, with rating in the Skill Rating
  service, grouping in the Party Service, and the decision policy in the
  Matchmaker, so each dimension can evolve independently.

### How do you build a ranked queue?

The ranked queue is not a plain FIFO; it is an index of waiting players keyed by
the properties that matter for matching.

- The Matchmaking Queue maintains players grouped by game mode, region, and
  rating band, so the Matchmaker can search within a tight slice instead of
  scanning all waiting players.
- Joining is an insert into the appropriate bucket, and leaving is a remove,
  which happens when a player cancels, times out, or is drafted into a match.
- The queue must handle both operations efficiently at the rates the game
  produces them, which are spiky: queueing spikes when an event starts or a
  patch drops.

Queue integrity comes from the rating store being the source of truth.

- The Skill Rating component reads each player's current rating and volatility
  from the Rating Store at enqueue time, so the queue never works with stale
  ratings, and updates the rating only after a match completes.
- A player cannot enter the same queue twice, and a party is enqueued as a
  single unit with a representative rating, so the queue treats the group
  atomically.
- Every queue action is timestamped, because the waiting time since enqueue is
  the primary input to how much the system relaxes its standards.

The queue also has to protect itself from abuse and from its own popularity.

- Duplicate enqueues, rapid leave and rejoin, and players dodging into the same
  queue repeatedly are detected and throttled.
- When the queue is large, the Matchmaker drains it in parallel by partitioning
  the rating space, so different rating bands are matched independently, and the
  queue service scales by sharding on rating band.
- The queue is ephemeral by design: its state lives in memory and can be
  reconstructed from the authoritative rating store if a process fails.

### How do you balance teams by skill?

Team balance is the goal of matching in team-based games: the two sides should
have roughly equal total skill so the match is competitive.

- The Matchmaker scores candidate groupings against a balance function that
  combines each player's rating and rating uncertainty into an expected
  win-probability model.
- For a 5v5 match, the score is the difference between the two teams' predicted
  win probabilities, and the matchmaker seeks the grouping closest to fifty
  percent.
- A one-sided match is penalized regardless of which side is stronger, because
  neither the favored nor the underdog enjoys a blowout.

Balance interacts with party structure.

- A party of strong players has a combined skill that is not simply the sum of
  its members, since coordination adds effective skill beyond individual
  ratings, so the model adjusts party skill upward.
- The system must decide whether to place the party's full strength on one team
  and compensate on the other side, or to match strong parties against other
  strong parties.
- The preference is to match groups of comparable structure, because solos
  against a coordinated party are unfair in ways rating alone does not capture.

Balance is enforced with constraints rather than optimization.

- The system defines hard limits, such as the maximum allowed rating spread
  within a team or across teams, and the Matchmaker only accepts groupings
  within those limits.
- When the queue cannot produce a balanced match within the time budget, the
  limits are widened gradually rather than abandoned, and a match is never
  formed with a spread so large that it guarantees a one-sided game.
- The resulting match composition is logged, so the matchmaker's decisions can
  be audited against the win rate outcomes.

### How do you handle queue time targets?

Queue time targets convert a quality problem into a control problem.

- The system defines an expected wait for each mode and rating band, and the
  Matchmaker expands its search in steps as players wait longer.
- Early in the queue, the matchmaker searches only the player's own rating band
  and requires the tightest balance.
- After the first target, it widens to adjacent bands, then farther, and finally
  relaxes balance and region constraints.
- The expansion is a ladder of tolerances, so a player who has waited the
  longest gets the most relaxed treatment and is never starved by a steady
  inflow of new, better-matched players.

The queue time target is enforced through the matchmaking policy, not through
guesswork.

- The system monitors the actual distribution of wait times per mode and band,
  and adjusts the ladder when waits miss the target, for example by widening
  faster during low-traffic hours when the queue is naturally thin.
- Player impatience is modeled as well: the wait is displayed with an expected
  range, and players leave when the range is exceeded, which raises the
  effective demand for faster matching.
- The matchmaker also prioritizes the oldest players within an acceptable band,
  so everyone makes progress.

There is a deliberate floor under how much the system will compromise.

- If the queue is so thin that even the most relaxed criteria cannot form a
  match, the system refuses to fabricate one and instead returns players to the
  lobby with a clear message.
- This protects the other target, match quality, from being destroyed by the
  queue time target.
- The two targets are therefore jointly monitored: the system tracks how many
  matches were formed at each tolerance level and how those matches played out,
  so the ladder can be tuned to balance wait against outcome quality.

### How do you avoid bad matches?

A bad match is one that players would rather not have played, and the design
avoids them by defining quality before matching and verifying it after.

- Quality starts with the signals: rating, rating uncertainty, region, mode, and
  party composition.
- High-uncertainty players are matched against each other rather than against
  stable veterans, because a player with no rating history should not decide a
  match for everyone else.
- The Matchmaker refuses groupings that violate hard constraints, and the
  softening of those constraints under queue pressure is capped so that the time
  ladder can never produce a game that is obviously unfair.

Bad matches are also avoided structurally by how parties and streaks are
handled.

- A party entering as a unit is only matched against parties or players that
  keep the expected win probability near balance, and a player on a long win or
  loss streak is treated as having shifted skill, so the system does not pair a
  tilted player into a guaranteed loss.
- The matchmaker avoids repeatedly placing the same players against each other
  when the queue has alternatives, because lopsided rematches feel broken even
  if the ratings say they are fair.

The loop closes with measurement.

- Every match is recorded in the Matches DB with the predicted win probability
  and the actual outcome, so the system can compute calibration: does a
  predicted sixty-forty match actually produce a sixty-forty outcome?
- Systematic gaps indicate stale ratings or missing signals, and feed tuning of
  the rating update and the balance function.
- Player surveys and abandonment rates are tracked as soft signals, and a rising
  abandon rate in a mode is treated as a quality regression even when the
  numerical balance looks fine.
- Avoiding bad matches is an ongoing calibration problem, not a one-time rule
  set.

## Source

```text
title: Game Matchmaking
node player: Player [round, icon=browser]
node app: Game App [icon=browser]
node gateway: API Gateway [icon=server]
node queue: Matchmaking Queue [icon=queue]
node rating: Skill Rating [icon=compute]
node party: Party Service [icon=users]
node match: Matchmaker [icon=compute]
node mmr: Rating Store [cylinder, icon=database]
node room: Match Rooms [icon=server]
node notify: Notifications [icon=message]
node db: Matches DB [cylinder, icon=database]

edge player -> app: queue
edge app -> gateway: enqueue
edge gateway -> queue: insert
edge queue -> rating: rank
edge rating -> mmr: lookup
edge party -> queue: group
edge queue -> match: form
edge match -> room: create
edge room -> notify: ready
edge notify -> app: accept
edge match -> db: store
```

## Q&A

### Q: Design a game matchmaking system

**A:** A matchmaking system takes players who want to play and groups them into a
balanced match.

- A player joins through the app, and the API Gateway enqueues them into the
  Matchmaking Queue.
- The Skill Rating component maintains each player's rating, typically a version
  of Elo or Glicko stored in the Rating Store, and the queue organizes players
  by that rating.
- Parties join as groups, so the Party Service feeds pre-formed teams into the
  queue rather than individuals.
- The Matchmaker continuously scans the queue, selects a set of players whose
  ratings form a fair match, creates a Match Room, and the Notification Service
  prompts everyone to accept.
- Completed match records are written to the Matches DB.

The core tension in matchmaking is quality versus time.

- Waiting longer makes better matches possible, because the queue accumulates
  more candidates at the same skill, but players abandon if the wait is too
  long.
- The system therefore treats queue time as a tunable target and relaxes the
  match criteria as wait time grows.
- The Matchmaker searches for the best available grouping that meets the current
  tolerance, rather than the globally best possible grouping, so the search is
  bounded and the queue drains on schedule.

The system also has to respect the social structure of the game.

- Players arrive solo, in pairs, or in full parties, and the matchmaker must
  place a party as a unit or break the party's expectation.
- Rating is only the primary signal, not the only one: region, latency, game
  mode, and the player's current win or loss streak all influence which
  opponents are acceptable.
- The architecture separates these concerns, with rating in the Skill Rating
  service, grouping in the Party Service, and the decision policy in the
  Matchmaker, so each dimension can evolve independently.

### Q: How do you build a ranked queue?

**A:** The ranked queue is not a plain FIFO; it is an index of waiting players keyed by
the properties that matter for matching.

- The Matchmaking Queue maintains players grouped by game mode, region, and
  rating band, so the Matchmaker can search within a tight slice instead of
  scanning all waiting players.
- Joining is an insert into the appropriate bucket, and leaving is a remove,
  which happens when a player cancels, times out, or is drafted into a match.
- The queue must handle both operations efficiently at the rates the game
  produces them, which are spiky: queueing spikes when an event starts or a
  patch drops.

Queue integrity comes from the rating store being the source of truth.

- The Skill Rating component reads each player's current rating and volatility
  from the Rating Store at enqueue time, so the queue never works with stale
  ratings, and updates the rating only after a match completes.
- A player cannot enter the same queue twice, and a party is enqueued as a
  single unit with a representative rating, so the queue treats the group
  atomically.
- Every queue action is timestamped, because the waiting time since enqueue is
  the primary input to how much the system relaxes its standards.

The queue also has to protect itself from abuse and from its own popularity.

- Duplicate enqueues, rapid leave and rejoin, and players dodging into the same
  queue repeatedly are detected and throttled.
- When the queue is large, the Matchmaker drains it in parallel by partitioning
  the rating space, so different rating bands are matched independently, and the
  queue service scales by sharding on rating band.
- The queue is ephemeral by design: its state lives in memory and can be
  reconstructed from the authoritative rating store if a process fails.

### Q: How do you balance teams by skill?

**A:** Team balance is the goal of matching in team-based games: the two sides should
have roughly equal total skill so the match is competitive.

- The Matchmaker scores candidate groupings against a balance function that
  combines each player's rating and rating uncertainty into an expected
  win-probability model.
- For a 5v5 match, the score is the difference between the two teams' predicted
  win probabilities, and the matchmaker seeks the grouping closest to fifty
  percent.
- A one-sided match is penalized regardless of which side is stronger, because
  neither the favored nor the underdog enjoys a blowout.

Balance interacts with party structure.

- A party of strong players has a combined skill that is not simply the sum of
  its members, since coordination adds effective skill beyond individual
  ratings, so the model adjusts party skill upward.
- The system must decide whether to place the party's full strength on one team
  and compensate on the other side, or to match strong parties against other
  strong parties.
- The preference is to match groups of comparable structure, because solos
  against a coordinated party are unfair in ways rating alone does not capture.

Balance is enforced with constraints rather than optimization.

- The system defines hard limits, such as the maximum allowed rating spread
  within a team or across teams, and the Matchmaker only accepts groupings
  within those limits.
- When the queue cannot produce a balanced match within the time budget, the
  limits are widened gradually rather than abandoned, and a match is never
  formed with a spread so large that it guarantees a one-sided game.
- The resulting match composition is logged, so the matchmaker's decisions can
  be audited against the win rate outcomes.

### Q: How do you handle queue time targets?

**A:** Queue time targets convert a quality problem into a control problem.

- The system defines an expected wait for each mode and rating band, and the
  Matchmaker expands its search in steps as players wait longer.
- Early in the queue, the matchmaker searches only the player's own rating band
  and requires the tightest balance.
- After the first target, it widens to adjacent bands, then farther, and finally
  relaxes balance and region constraints.
- The expansion is a ladder of tolerances, so a player who has waited the
  longest gets the most relaxed treatment and is never starved by a steady
  inflow of new, better-matched players.

The queue time target is enforced through the matchmaking policy, not through
guesswork.

- The system monitors the actual distribution of wait times per mode and band,
  and adjusts the ladder when waits miss the target, for example by widening
  faster during low-traffic hours when the queue is naturally thin.
- Player impatience is modeled as well: the wait is displayed with an expected
  range, and players leave when the range is exceeded, which raises the
  effective demand for faster matching.
- The matchmaker also prioritizes the oldest players within an acceptable band,
  so everyone makes progress.

There is a deliberate floor under how much the system will compromise.

- If the queue is so thin that even the most relaxed criteria cannot form a
  match, the system refuses to fabricate one and instead returns players to the
  lobby with a clear message.
- This protects the other target, match quality, from being destroyed by the
  queue time target.
- The two targets are therefore jointly monitored: the system tracks how many
  matches were formed at each tolerance level and how those matches played out,
  so the ladder can be tuned to balance wait against outcome quality.

### Q: How do you avoid bad matches?

**A:** A bad match is one that players would rather not have played, and the design
avoids them by defining quality before matching and verifying it after.

- Quality starts with the signals: rating, rating uncertainty, region, mode, and
  party composition.
- High-uncertainty players are matched against each other rather than against
  stable veterans, because a player with no rating history should not decide a
  match for everyone else.
- The Matchmaker refuses groupings that violate hard constraints, and the
  softening of those constraints under queue pressure is capped so that the time
  ladder can never produce a game that is obviously unfair.

Bad matches are also avoided structurally by how parties and streaks are
handled.

- A party entering as a unit is only matched against parties or players that
  keep the expected win probability near balance, and a player on a long win or
  loss streak is treated as having shifted skill, so the system does not pair a
  tilted player into a guaranteed loss.
- The matchmaker avoids repeatedly placing the same players against each other
  when the queue has alternatives, because lopsided rematches feel broken even
  if the ratings say they are fair.

The loop closes with measurement.

- Every match is recorded in the Matches DB with the predicted win probability
  and the actual outcome, so the system can compute calibration: does a
  predicted sixty-forty match actually produce a sixty-forty outcome?
- Systematic gaps indicate stale ratings or missing signals, and feed tuning of
  the rating update and the balance function.
- Player surveys and abandonment rates are tracked as soft signals, and a rising
  abandon rate in a mode is treated as a quality regression even when the
  numerical balance looks fine.
- Avoiding bad matches is an ongoing calibration problem, not a one-time rule
  set.

## Source

```text
title: Game Matchmaking
node player: Player [round, icon=browser]
node app: Game App [icon=browser]
node gateway: API Gateway [icon=server]
node queue: Matchmaking Queue [icon=queue]
node rating: Skill Rating [icon=compute]
node party: Party Service [icon=users]
node match: Matchmaker [icon=compute]
node mmr: Rating Store [cylinder, icon=database]
node room: Match Rooms [icon=server]
node notify: Notifications [icon=message]
node db: Matches DB [cylinder, icon=database]

edge player -> app: queue
edge app -> gateway: enqueue
edge gateway -> queue: insert
edge queue -> rating: rank
edge rating -> mmr: lookup
edge party -> queue: group
edge queue -> match: form
edge match -> room: create
edge room -> notify: ready
edge notify -> app: accept
edge match -> db: store
```
