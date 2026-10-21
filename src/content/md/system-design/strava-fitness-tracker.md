# Strava — Fitness Tracker

Design a fitness / activity tracking service

**Difficulty:** Medium

**Tags:** geo, social

## Functional Requirements

- a fitness / activity tracking service
- ingest high-frequency GPS track points?
- compute routes and segment stats?
- build leaderboards and challenges?
- make the social feed real-time?

## Non-Functional Requirements

- A one-hour run at one point per second produces thousands of points, and
  millions of concurrent workouts mean the ingest path must be cheap and durable.

- I would accept uploads in compressed batches through the gateway into an
  ingest service that buffers to a queue, then batch-write to the workout store.
- The athlete's device is authoritative for timing, so the system stores raw
  points first and does processing asynchronously, never making the upload wait
  for analytics.
- Batching by the client also reduces mobile battery drain, which matters more
  than a few seconds of upload latency.

Deduplication matters because devices retry failed uploads.

- Each point batch carries a monotonic sequence and a workout id, and the store
  ignores sequences already received.
- I would partition the workout store by workout id so all points of one
  activity land on one node, making aggregation and range queries fast, and use
  a time-series-friendly format with compression for storage cost since GPS data
  is voluminous.
- Dead-letter handling catches malformed batches so a buggy device firmware does
  not corrupt an entire workout.

The tradeoff is real-time feedback versus final accuracy.

- During the workout the app shows live pace from smoothed points, while the
  stored, authoritative record is reprocessed after upload.
- Smoothing removes GPS jitter but risks over-filtering; I would run multiple
  smoothing passes for display and keep the raw points for recomputation when a
  device supplies better-grade accuracy later.
- Resume semantics allow a partially uploaded workout to be finished on the next
  sync, tolerating dropped connections mid-run..
- Leaderboards are read-heavy rank queries over segment efforts and challenge
  participation, so I would keep them derived and cached rather than computed per
  request.

- When a segment effort is recorded, a leaderboard worker updates the segment's
  ranked set; on the read side, a user's rank is a lookup into that set.
- Global boards are huge, so I would shard the ranked set by segment or
  challenge and provide top-N plus rank-around-me views.
- Friends leaderboards are a join between the athlete's social graph and the
  effort set, so the worker keeps a per-user friend-board cache.

Challenges define a goal (distance in a month, a climbing total) and a window;
each participant's progress aggregates from workout summaries over the window.

- Progress is materialized incrementally and cached with a short TTL, and
  milestone events fire notifications when an athlete crosses a threshold or
  overtakes a friend.
- Because challenges are temporal, the pipeline rolls them on a schedule and
  archives completed ones without blocking new ones.
- Group challenges need anti-flocking rules, and activity types like runs versus
  rides rank in separate boards.

The hard part is fairness at scale: recomputing all ranks after every effort is
impossible, so leaderboards use approximate or batched updates.

- I would accept that the board is eventually consistent, typically refreshing
  within minutes, and expose the refresh time to avoid confusion.
- Anti-cheating matters for credibility; a validation layer flags implausible
  efforts, like distances inconsistent with the track, before they enter the
  board, trading a little latency for trust.
- The same materialized views power the medals and the year-in-review summary,
  so one pipeline serves many products..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Fitness Tracker
athlete: Athlete
app: Tracker App
gateway: API Gateway
ingest: Activity Ingest
gps: GPS Processing
workout: Workout Store
stats: Stats Engine
segments: Segment Engine
social: Social Feed
leaderboard: Leaderboards
notify: Notifications
db: Profiles DB

athlete ─► app ─► record workout
app ─► gateway ─► upload track
gateway ─► ingest ─► points
ingest ─► gps ─► smooth
gps ─► workout ─► save
gps ─► stats ─► summarize
gps ─► segments ─► match
workout ─► social ─► share
social ─► leaderboard ─► rank
leaderboard ─► notify ─► medal
app ─► db ─► profile
```

## Design

### Design a fitness / activity tracking service

A fitness tracker is a write-heavy data pipeline in front of a social product:
athletes record workouts, GPS points stream in, and statistics and challenges
are derived from that data.

- I would structure it as a gateway in front of an activity ingest service, GPS
  processing, a workout store, and stats, segments, social, and leaderboard
  services, with a Profiles DB for athletes.
- The write path is high-frequency during workouts; the read path is mostly
  short queries for the latest summary.
- This split matters because a user's peak ingestion happens in the evening and
  on weekends, so ingest capacity must be planned for those bursts.

An athlete records a workout in the app; points upload to ingest, are smoothed
by GPS processing, and are saved to the workout store.

- The same processing pass feeds the stats engine, which summarizes distance,
  pace, and elevation, and the segment engine, which matches the track against
  known segments.
- The workout can then be shared to the social feed, where leaderboards rank it
  against friends and challenges, and notifications celebrate achievements.
- Privacy settings gate every derived view, so the social layer reads through a
  permission check rather than trusting the raw data.

I would design the workout record as immutable: once saved, a completed activity
is never rewritten, only annotated.

- That makes caching, recomputation, and leaderboard rebuilds idempotent.
- The tradeoff is between real-time processing during the activity and eventual
  batch analysis after it ends; a good middle ground is to write summary rows
  continuously during recording and defer heavy analytics like segment matching
  to a worker queue.
- Leaderboards and challenges refresh asynchronously so an athlete finishing a
  run does not wait for a global rank.

### How do you ingest high-frequency GPS track points?

A one-hour run at one point per second produces thousands of points, and
millions of concurrent workouts mean the ingest path must be cheap and durable.

- I would accept uploads in compressed batches through the gateway into an
  ingest service that buffers to a queue, then batch-write to the workout store.
- The athlete's device is authoritative for timing, so the system stores raw
  points first and does processing asynchronously, never making the upload wait
  for analytics.
- Batching by the client also reduces mobile battery drain, which matters more
  than a few seconds of upload latency.

Deduplication matters because devices retry failed uploads.

- Each point batch carries a monotonic sequence and a workout id, and the store
  ignores sequences already received.
- I would partition the workout store by workout id so all points of one
  activity land on one node, making aggregation and range queries fast, and use
  a time-series-friendly format with compression for storage cost since GPS data
  is voluminous.
- Dead-letter handling catches malformed batches so a buggy device firmware does
  not corrupt an entire workout.

The tradeoff is real-time feedback versus final accuracy.

- During the workout the app shows live pace from smoothed points, while the
  stored, authoritative record is reprocessed after upload.
- Smoothing removes GPS jitter but risks over-filtering; I would run multiple
  smoothing passes for display and keep the raw points for recomputation when a
  device supplies better-grade accuracy later.
- Resume semantics allow a partially uploaded workout to be finished on the next
  sync, tolerating dropped connections mid-run.

### How do you compute routes and segment stats?

Computing a route's stats is a geometry problem: snap raw points to a map,
measure distance, elevation, and pace, and produce a polyline that renders
smoothly in the UI.

- I would run map matching against the road and trail graph to project each
  point onto the nearest path, then compute segment-by-segment distances and
  cumulative elevation gain from the smoothed track.
- This is expensive enough that it belongs in a worker, not the request path.
- Heart rate and power data ride along on the same points, so the summary
  includes cardio zones and workout load computed in the same pass.

Segments are the killer feature: known named sections of road or trail with
their own leaderboards.

- The segment engine indexes segments by bounding box, matches each new workout
  track against candidate segments by proximity, and computes the athlete's time
  on each matched segment.
- Because the same route can be run many times, the engine emits a segment
  effort record that feeds both the athlete's personal records and the global
  leaderboard.
- Climbing segments treat grade-adjusted time rather than raw time, which
  requires grade data from the map, so segment matching bundles the map tile
  lookup.

The tradeoff is accuracy versus cost.

- Naive point-to-point distance overestimates on trails because of GPS error;
  map matching fixes this but requires a geospatial index and can be slow for
  long activities.
- I would cache matched segments per workout and store raw point counts, letting
  the stats engine re-derive summaries cheaply whenever a better map or
  algorithm ships, since workout records are immutable and reprocessing is
  idempotent.
- The pipeline emits segments in order of confidence and discards matches that
  are geometrically implausible.

### How do you build leaderboards and challenges?

Leaderboards are read-heavy rank queries over segment efforts and challenge
participation, so I would keep them derived and cached rather than computed per
request.

- When a segment effort is recorded, a leaderboard worker updates the segment's
  ranked set; on the read side, a user's rank is a lookup into that set.
- Global boards are huge, so I would shard the ranked set by segment or
  challenge and provide top-N plus rank-around-me views.
- Friends leaderboards are a join between the athlete's social graph and the
  effort set, so the worker keeps a per-user friend-board cache.

Challenges define a goal (distance in a month, a climbing total) and a window;
each participant's progress aggregates from workout summaries over the window.

- Progress is materialized incrementally and cached with a short TTL, and
  milestone events fire notifications when an athlete crosses a threshold or
  overtakes a friend.
- Because challenges are temporal, the pipeline rolls them on a schedule and
  archives completed ones without blocking new ones.
- Group challenges need anti-flocking rules, and activity types like runs versus
  rides rank in separate boards.

The hard part is fairness at scale: recomputing all ranks after every effort is
impossible, so leaderboards use approximate or batched updates.

- I would accept that the board is eventually consistent, typically refreshing
  within minutes, and expose the refresh time to avoid confusion.
- Anti-cheating matters for credibility; a validation layer flags implausible
  efforts, like distances inconsistent with the track, before they enter the
  board, trading a little latency for trust.
- The same materialized views power the medals and the year-in-review summary,
  so one pipeline serves many products.

### How do you make the social feed real-time?

The social feed is a fan-out problem: when an athlete shares a workout,
followers should see it almost immediately.

- I would implement a push-based fan-out on share events, writing the activity
  summary into each follower's feed cache, and fall back to a pull-based merge
  when follower counts exceed a threshold, because celebrity athletes would
  otherwise create write amplification at share time.
- Interaction events like kudos and comments flow through the same pipeline, and
  the composer sends a lightweight update rather than the full workout record.

Real-time delivery needs a persistent channel.

- The notification service pushes updates over WebSockets or server-sent events
  when the client is online, and stores a digest for offline clients that
  rehydrate on reconnect.
- I would order feed items by a shared timeline clock, so devices converge on
  the same ordering, and deduplicate kudos, comments, and new-workout events
  that arrive as both push and poll.
- Client-side optimistic rendering covers the gap between the athlete's own
  completion and the follower's view.

The tradeoff is between freshness and load.

- Per-follower caches make reads trivial but amplify writes; read-through
  merging keeps writes cheap but risks a thundering herd when a viral workout
  lands.
- I would start with the hybrid: push for small graphs, pull with caching for
  large ones, and tune the boundary from metrics.
- Feed content is derived from immutable workout records, so a feed rebuild from
  scratch is always possible and consistent.
- Capacity planning follows time zones, since the evening run wave cascades
  around the globe and the feed pipeline must absorb it without head-of-line
  blocking.

## Source

```text
title: Fitness Tracker
node athlete: Athlete [round, icon=browser]
node app: Tracker App [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Activity Ingest [icon=worker]
node gps: GPS Processing [icon=compute]
node workout: Workout Store [cylinder, icon=database]
node stats: Stats Engine [icon=compute]
node segments: Segment Engine [icon=search]
node social: Social Feed [icon=users]
node leaderboard: Leaderboards [icon=cache]
node notify: Notifications [icon=message]
node db: Profiles DB [cylinder, icon=database]

edge athlete -> app: record workout
edge app -> gateway: upload track
edge gateway -> ingest: points
edge ingest -> gps: smooth
edge gps -> workout: save
edge gps -> stats: summarize
edge gps -> segments: match
edge workout -> social: share
edge social -> leaderboard: rank
edge leaderboard -> notify: medal
edge app -> db: profile
```

## Q&A

### Q: Design a fitness / activity tracking service

**A:** A fitness tracker is a write-heavy data pipeline in front of a social product:
athletes record workouts, GPS points stream in, and statistics and challenges
are derived from that data.

- I would structure it as a gateway in front of an activity ingest service, GPS
  processing, a workout store, and stats, segments, social, and leaderboard
  services, with a Profiles DB for athletes.
- The write path is high-frequency during workouts; the read path is mostly
  short queries for the latest summary.
- This split matters because a user's peak ingestion happens in the evening and
  on weekends, so ingest capacity must be planned for those bursts.

An athlete records a workout in the app; points upload to ingest, are smoothed
by GPS processing, and are saved to the workout store.

- The same processing pass feeds the stats engine, which summarizes distance,
  pace, and elevation, and the segment engine, which matches the track against
  known segments.
- The workout can then be shared to the social feed, where leaderboards rank it
  against friends and challenges, and notifications celebrate achievements.
- Privacy settings gate every derived view, so the social layer reads through a
  permission check rather than trusting the raw data.

I would design the workout record as immutable: once saved, a completed activity
is never rewritten, only annotated.

- That makes caching, recomputation, and leaderboard rebuilds idempotent.
- The tradeoff is between real-time processing during the activity and eventual
  batch analysis after it ends; a good middle ground is to write summary rows
  continuously during recording and defer heavy analytics like segment matching
  to a worker queue.
- Leaderboards and challenges refresh asynchronously so an athlete finishing a
  run does not wait for a global rank.

### Q: How do you ingest high-frequency GPS track points?

**A:** A one-hour run at one point per second produces thousands of points, and
millions of concurrent workouts mean the ingest path must be cheap and durable.

- I would accept uploads in compressed batches through the gateway into an
  ingest service that buffers to a queue, then batch-write to the workout store.
- The athlete's device is authoritative for timing, so the system stores raw
  points first and does processing asynchronously, never making the upload wait
  for analytics.
- Batching by the client also reduces mobile battery drain, which matters more
  than a few seconds of upload latency.

Deduplication matters because devices retry failed uploads.

- Each point batch carries a monotonic sequence and a workout id, and the store
  ignores sequences already received.
- I would partition the workout store by workout id so all points of one
  activity land on one node, making aggregation and range queries fast, and use
  a time-series-friendly format with compression for storage cost since GPS data
  is voluminous.
- Dead-letter handling catches malformed batches so a buggy device firmware does
  not corrupt an entire workout.

The tradeoff is real-time feedback versus final accuracy.

- During the workout the app shows live pace from smoothed points, while the
  stored, authoritative record is reprocessed after upload.
- Smoothing removes GPS jitter but risks over-filtering; I would run multiple
  smoothing passes for display and keep the raw points for recomputation when a
  device supplies better-grade accuracy later.
- Resume semantics allow a partially uploaded workout to be finished on the next
  sync, tolerating dropped connections mid-run.

### Q: How do you compute routes and segment stats?

**A:** Computing a route's stats is a geometry problem: snap raw points to a map,
measure distance, elevation, and pace, and produce a polyline that renders
smoothly in the UI.

- I would run map matching against the road and trail graph to project each
  point onto the nearest path, then compute segment-by-segment distances and
  cumulative elevation gain from the smoothed track.
- This is expensive enough that it belongs in a worker, not the request path.
- Heart rate and power data ride along on the same points, so the summary
  includes cardio zones and workout load computed in the same pass.

Segments are the killer feature: known named sections of road or trail with
their own leaderboards.

- The segment engine indexes segments by bounding box, matches each new workout
  track against candidate segments by proximity, and computes the athlete's time
  on each matched segment.
- Because the same route can be run many times, the engine emits a segment
  effort record that feeds both the athlete's personal records and the global
  leaderboard.
- Climbing segments treat grade-adjusted time rather than raw time, which
  requires grade data from the map, so segment matching bundles the map tile
  lookup.

The tradeoff is accuracy versus cost.

- Naive point-to-point distance overestimates on trails because of GPS error;
  map matching fixes this but requires a geospatial index and can be slow for
  long activities.
- I would cache matched segments per workout and store raw point counts, letting
  the stats engine re-derive summaries cheaply whenever a better map or
  algorithm ships, since workout records are immutable and reprocessing is
  idempotent.
- The pipeline emits segments in order of confidence and discards matches that
  are geometrically implausible.

### Q: How do you build leaderboards and challenges?

**A:** Leaderboards are read-heavy rank queries over segment efforts and challenge
participation, so I would keep them derived and cached rather than computed per
request.

- When a segment effort is recorded, a leaderboard worker updates the segment's
  ranked set; on the read side, a user's rank is a lookup into that set.
- Global boards are huge, so I would shard the ranked set by segment or
  challenge and provide top-N plus rank-around-me views.
- Friends leaderboards are a join between the athlete's social graph and the
  effort set, so the worker keeps a per-user friend-board cache.

Challenges define a goal (distance in a month, a climbing total) and a window;
each participant's progress aggregates from workout summaries over the window.

- Progress is materialized incrementally and cached with a short TTL, and
  milestone events fire notifications when an athlete crosses a threshold or
  overtakes a friend.
- Because challenges are temporal, the pipeline rolls them on a schedule and
  archives completed ones without blocking new ones.
- Group challenges need anti-flocking rules, and activity types like runs versus
  rides rank in separate boards.

The hard part is fairness at scale: recomputing all ranks after every effort is
impossible, so leaderboards use approximate or batched updates.

- I would accept that the board is eventually consistent, typically refreshing
  within minutes, and expose the refresh time to avoid confusion.
- Anti-cheating matters for credibility; a validation layer flags implausible
  efforts, like distances inconsistent with the track, before they enter the
  board, trading a little latency for trust.
- The same materialized views power the medals and the year-in-review summary,
  so one pipeline serves many products.

### Q: How do you make the social feed real-time?

**A:** The social feed is a fan-out problem: when an athlete shares a workout,
followers should see it almost immediately.

- I would implement a push-based fan-out on share events, writing the activity
  summary into each follower's feed cache, and fall back to a pull-based merge
  when follower counts exceed a threshold, because celebrity athletes would
  otherwise create write amplification at share time.
- Interaction events like kudos and comments flow through the same pipeline, and
  the composer sends a lightweight update rather than the full workout record.

Real-time delivery needs a persistent channel.

- The notification service pushes updates over WebSockets or server-sent events
  when the client is online, and stores a digest for offline clients that
  rehydrate on reconnect.
- I would order feed items by a shared timeline clock, so devices converge on
  the same ordering, and deduplicate kudos, comments, and new-workout events
  that arrive as both push and poll.
- Client-side optimistic rendering covers the gap between the athlete's own
  completion and the follower's view.

The tradeoff is between freshness and load.

- Per-follower caches make reads trivial but amplify writes; read-through
  merging keeps writes cheap but risks a thundering herd when a viral workout
  lands.
- I would start with the hybrid: push for small graphs, pull with caching for
  large ones, and tune the boundary from metrics.
- Feed content is derived from immutable workout records, so a feed rebuild from
  scratch is always possible and consistent.
- Capacity planning follows time zones, since the evening run wave cascades
  around the globe and the feed pipeline must absorb it without head-of-line
  blocking.

## Source

```text
title: Fitness Tracker
node athlete: Athlete [round, icon=browser]
node app: Tracker App [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Activity Ingest [icon=worker]
node gps: GPS Processing [icon=compute]
node workout: Workout Store [cylinder, icon=database]
node stats: Stats Engine [icon=compute]
node segments: Segment Engine [icon=search]
node social: Social Feed [icon=users]
node leaderboard: Leaderboards [icon=cache]
node notify: Notifications [icon=message]
node db: Profiles DB [cylinder, icon=database]

edge athlete -> app: record workout
edge app -> gateway: upload track
edge gateway -> ingest: points
edge ingest -> gps: smooth
edge gps -> workout: save
edge gps -> stats: summarize
edge gps -> segments: match
edge workout -> social: share
edge social -> leaderboard: rank
edge leaderboard -> notify: medal
edge app -> db: profile
```
