# Google Calendar — Scheduling

Design a calendar / scheduling service

**Difficulty:** Medium

**Tags:** booking, scheduling

## Functional Requirements

- a calendar / scheduling service
- detect overlapping events and find free slots?
- distribute invites and manage RSVPs?
- handle recurring events?
- sync events across devices offline?

## Non-Functional Requirements

- The core is an event service that owns CRUD for events, a sync service that
  replicates changes to clients, and an availability engine that answers "when is
  this person free?"

- Each event has a title, time range, timezone, attendees, recurrence rule, and
  an organizer.
- Events persist in an events DB (typically a sharded relational store keyed by
  user, with time-range columns indexed) and are materialized into a search
  index for cross-user queries like "who is free on Tuesday."
- Invites go through an invitation service that creates attendee copies (or
  shared-event references), tracks RSVP state, and drives notifications.
- The API gateway fronts the mobile and web clients, and a notifier schedules
  reminders — email, push, or in-app — well before each event.

Design choices follow the product's requirements.

- Timezone handling is stored as the user's timezone with the event time in UTC
  plus an IANA zone; recurrence is never stored as expanded rows but as a rule
  with an exclusion set.
- Reads are heavily cached (a slots cache holds precomputed free/busy windows
  per user for the next N days) because availability queries are the hot path.
- Writes are transactional per user to avoid double-booking within a single
  calendar, while cross-user conflicts are resolved by the availability check
  rather than locks.
- The system must scale to many attendees without fan-out storms: for very large
  calendars, invites are batched and read-your-own-writes consistency is relaxed
  to eventual consistency across copies..
- Invites are modeled as attendee records attached to an event.

- When an organizer creates an event with attendees, the invitation service fans
  out: for small calendars each attendee gets a reference to the shared event
  plus an RSVP state (invited, accepted, declined, tentative); for very large
  audiences the service can create per-attendee copies or rely on shared-events
  with a counter.
- Each attendee's calendar needs to reflect the event, so writes propagate to
  the invitee's data via a sync feed rather than holding a global lock on the
  event.
- The RSVP flow is simple: an attendee accepts, the service updates the attendee
  record, marks the event on the attendee's calendar as busy, and notifies the
  organizer.
- Change propagation (reschedule, cancel, add attendee) is done by updating the
  event and emitting a versioned change that each affected attendee's calendar
  consumes.

Two failure modes matter.

- An unreliable attendee: RSVP status is tracked per attendee and the organizer
  gets a summary (X accepted, Y pending) computed by aggregation; reminders for
  unanswered invites are re-sent by the notifier before the event.
- Partial delivery: invites flow through a retryable queue so a temporarily
  unavailable mailbox or app doesn't lose the invite, and each client pulls its
  full event list on reconnect, so the RSVP and invite states reconcile by
  eventual consistency.
- The invitation service must also handle privacy — each attendee sees only
  their own participation and the shared event details, never the organizer's
  other commitments — which is why free/busy is exposed as busy-time, not event
  details, to third parties..
- Offline sync uses change-based replication with per-device cursors.

- Each event and its attachments carry a version (e.g., a logical clock or DB
  timestamp), and the sync service maintains a change log per user: every
  create/update/delete appends a change record with a monotonic sequence number.
- A device tracks the last sequence it saw and pulls the delta since then on
  reconnect; it also batches local edits into an outbox and pushes them, with
  conflict resolution — last-write-wins with timestamps or a three-way merge for
  text fields like descriptions and titles.
- Clients keep a local cache of the user's calendar, so read-only operations
  work fully offline and writes queue locally, stamped with a client-generated
  UUID so retries are idempotent.

Conflict handling is the crux.

- Two edits to the same event from different devices must merge: a simple "last
  writer wins" works for most fields, but changes like moving an event while
  another device edits the description need field-level merging, so edits are
  recorded as per-field operations.
- The sync service serializes the change log per user and hands each client the
  events it can see (respecting attendee/visibility permissions).
- For scale, users are sharded across sync servers and the change log is
  compacted periodically — old records are folded into a snapshot and clients
  that are too far behind rebuild from the snapshot plus recent deltas.
- Push updates (via WebSocket or push notifications) give near-real-time
  convergence, while the pull-on-reconnect path guarantees eventual consistency
  even if push is missed.
- Monitoring tracks sync lag and conflict rates per user to catch regressions in
  the merge logic.

## Source

````text
title: Calendar
node user: User [round, icon=browser]
node app: Calendar App [icon=browser]
node api: API Gateway [icon=server]
node event: Event Service [icon=compute]
node avail: Availability Engine [icon=search]
node invite: Invitation Service [icon=mail]
node sync: Sync Service [icon=sync]
node notifier: Reminders [icon=message]
node db: Events DB [cylinder, icon=database]
node cache: Slots Cache [cylinder, icon=cache]
node search: Event Search [icon=search]

edge user -> app: create event
edge app -> api: schedule
edge api -> event: CRUD
edge event -> db: persist
edge event -> avail: find slots
edge avail -> cache: query
edge event -> invite: notify guests
edge invite -> notifier: reminders
edge sync -> api: pull changes
edge api -> search: index events
edge event -> notifier: schedule reminders
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Calendar
user: User
app: Calendar App
api: API Gateway
event: Event Service
avail: Availability Engine
invite: Invitation Service
sync: Sync Service
notifier: Reminders
db: Events DB
cache: Slots Cache
search: Event Search

user ─► app ─► create event
app ─► api ─► schedule
api ─► event ─► CRUD
event ─► db ─► persist
event ─► avail ─► find slots
avail ─► cache ─► query
event ─► invite ─► notify guests
invite ─► notifier ─► reminders
sync ─► api ─► pull changes
api ─► search ─► index events
event ─► notifier ─► schedule reminders
````

## Design

### Design a calendar / scheduling service

The core is an event service that owns CRUD for events, a sync service that
replicates changes to clients, and an availability engine that answers "when is
this person free?"

- Each event has a title, time range, timezone, attendees, recurrence rule, and
  an organizer.
- Events persist in an events DB (typically a sharded relational store keyed by
  user, with time-range columns indexed) and are materialized into a search
  index for cross-user queries like "who is free on Tuesday."
- Invites go through an invitation service that creates attendee copies (or
  shared-event references), tracks RSVP state, and drives notifications.
- The API gateway fronts the mobile and web clients, and a notifier schedules
  reminders — email, push, or in-app — well before each event.

Design choices follow the product's requirements.

- Timezone handling is stored as the user's timezone with the event time in UTC
  plus an IANA zone; recurrence is never stored as expanded rows but as a rule
  with an exclusion set.
- Reads are heavily cached (a slots cache holds precomputed free/busy windows
  per user for the next N days) because availability queries are the hot path.
- Writes are transactional per user to avoid double-booking within a single
  calendar, while cross-user conflicts are resolved by the availability check
  rather than locks.
- The system must scale to many attendees without fan-out storms: for very large
  calendars, invites are batched and read-your-own-writes consistency is relaxed
  to eventual consistency across copies.

### How do you detect overlapping events and find free slots?

Detecting overlaps is a classic interval problem: two events overlap when
`startA < endB AND startB < endA`.

- For one user, the events DB stores rows with a (user_id, start_time, end_time)
  composite index, so a range query on the index returns candidate events in
  O(log n + k), and the service verifies overlaps in memory over the small
  result set.
- The availability engine inverts this: to find free slots it loads the user's
  busy intervals for the requested window (from a precomputed slots cache or by
  querying the index), merges adjacent intervals, and subtracts them from the
  requested range, respecting the user's working hours and out-of-office blocks.
- With many participants, the engine intersects each person's free windows —
  take one user's free intervals and filter by the next user's, iteratively —
  and ranks the remaining gaps by size and preference (earliest, longest, or
  during business hours).

Two practical concerns dominate.

- Caching: per-user free/busy windows for the next few weeks are expensive to
  recompute, so the availability engine writes them to a cache and invalidates
  on any event change; this makes group scheduling fast even though each
  participant's true availability is computed from the authoritative DB.
- Partial overlap: because attendees are rarely fully free, the engine must
  report gaps of at least a minimum duration and let the caller decide; tools
  like a binary interval-tree or a segment-tree per user support "earliest gap
  of duration X" queries in logarithmic time.
- Concurrency is handled by optimistic versioning — if two people book the same
  slot simultaneously, one commit wins and the other is told to retry.

### How do you distribute invites and manage RSVPs?

Invites are modeled as attendee records attached to an event.

- When an organizer creates an event with attendees, the invitation service fans
  out: for small calendars each attendee gets a reference to the shared event
  plus an RSVP state (invited, accepted, declined, tentative); for very large
  audiences the service can create per-attendee copies or rely on shared-events
  with a counter.
- Each attendee's calendar needs to reflect the event, so writes propagate to
  the invitee's data via a sync feed rather than holding a global lock on the
  event.
- The RSVP flow is simple: an attendee accepts, the service updates the attendee
  record, marks the event on the attendee's calendar as busy, and notifies the
  organizer.
- Change propagation (reschedule, cancel, add attendee) is done by updating the
  event and emitting a versioned change that each affected attendee's calendar
  consumes.

Two failure modes matter.

- An unreliable attendee: RSVP status is tracked per attendee and the organizer
  gets a summary (X accepted, Y pending) computed by aggregation; reminders for
  unanswered invites are re-sent by the notifier before the event.
- Partial delivery: invites flow through a retryable queue so a temporarily
  unavailable mailbox or app doesn't lose the invite, and each client pulls its
  full event list on reconnect, so the RSVP and invite states reconcile by
  eventual consistency.
- The invitation service must also handle privacy — each attendee sees only
  their own participation and the shared event details, never the organizer's
  other commitments — which is why free/busy is exposed as busy-time, not event
  details, to third parties.

### How do you handle recurring events?

Recurrence is stored as a rule (e.g., `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU`)
plus an exceptions list — individual instances that were moved, cancelled, or
had edits — rather than expanding every occurrence into a row.

- On query, the service expands the rule into concrete instances for the
  requested window using a recurrence engine (the iCalendar RRULE expansion
  algorithm with a bounded horizon, e.g., up to a few years), applies the
  exceptions, and merges in single-instance events.
- This keeps storage small and edits cheap: modifying one instance adds an
  override; modifying the whole series updates the rule and its version.
- Any overlap and conflict detection runs against the expanded instances for the
  window of interest.

The tricky parts are edge cases.

- A recurring event that spans months must not be fully expanded at write time,
  but a query needs only the instances overlapping its window, so expansion is a
  per-request, horizon-bounded computation.
- Moving or cancelling a single instance must survive the rule update: overrides
  are keyed by (series_id, original_start) and the recurrence engine checks
  overrides before emitting an instance.
- Deleting the series must decide whether to delete all overrides too.
- Timezone DST transitions shift instance times across boundaries, so expansion
  is always done in the event's stored timezone, then converted to UTC for the
  bus-cache and cross-user availability.
- Because expansion is cheap and stateless, it can run on many instances of the
  event service; the recurrence engine is pure and deterministic, which also
  makes it unit-testable in isolation.

### How do you sync events across devices offline?

Offline sync uses change-based replication with per-device cursors.

- Each event and its attachments carry a version (e.g., a logical clock or DB
  timestamp), and the sync service maintains a change log per user: every
  create/update/delete appends a change record with a monotonic sequence number.
- A device tracks the last sequence it saw and pulls the delta since then on
  reconnect; it also batches local edits into an outbox and pushes them, with
  conflict resolution — last-write-wins with timestamps or a three-way merge for
  text fields like descriptions and titles.
- Clients keep a local cache of the user's calendar, so read-only operations
  work fully offline and writes queue locally, stamped with a client-generated
  UUID so retries are idempotent.

Conflict handling is the crux.

- Two edits to the same event from different devices must merge: a simple "last
  writer wins" works for most fields, but changes like moving an event while
  another device edits the description need field-level merging, so edits are
  recorded as per-field operations.
- The sync service serializes the change log per user and hands each client the
  events it can see (respecting attendee/visibility permissions).
- For scale, users are sharded across sync servers and the change log is
  compacted periodically — old records are folded into a snapshot and clients
  that are too far behind rebuild from the snapshot plus recent deltas.
- Push updates (via WebSocket or push notifications) give near-real-time
  convergence, while the pull-on-reconnect path guarantees eventual consistency
  even if push is missed.
- Monitoring tracks sync lag and conflict rates per user to catch regressions in
  the merge logic.

## Source

```text
title: Calendar
node user: User [round, icon=browser]
node app: Calendar App [icon=browser]
node api: API Gateway [icon=server]
node event: Event Service [icon=compute]
node avail: Availability Engine [icon=search]
node invite: Invitation Service [icon=mail]
node sync: Sync Service [icon=sync]
node notifier: Reminders [icon=message]
node db: Events DB [cylinder, icon=database]
node cache: Slots Cache [cylinder, icon=cache]
node search: Event Search [icon=search]

edge user -> app: create event
edge app -> api: schedule
edge api -> event: CRUD
edge event -> db: persist
edge event -> avail: find slots
edge avail -> cache: query
edge event -> invite: notify guests
edge invite -> notifier: reminders
edge sync -> api: pull changes
edge api -> search: index events
edge event -> notifier: schedule reminders
```

## Q&A

### Q: Design a calendar / scheduling service

**A:** The core is an event service that owns CRUD for events, a sync service that
replicates changes to clients, and an availability engine that answers "when is
this person free?"

- Each event has a title, time range, timezone, attendees, recurrence rule, and
  an organizer.
- Events persist in an events DB (typically a sharded relational store keyed by
  user, with time-range columns indexed) and are materialized into a search
  index for cross-user queries like "who is free on Tuesday."
- Invites go through an invitation service that creates attendee copies (or
  shared-event references), tracks RSVP state, and drives notifications.
- The API gateway fronts the mobile and web clients, and a notifier schedules
  reminders — email, push, or in-app — well before each event.

Design choices follow the product's requirements.

- Timezone handling is stored as the user's timezone with the event time in UTC
  plus an IANA zone; recurrence is never stored as expanded rows but as a rule
  with an exclusion set.
- Reads are heavily cached (a slots cache holds precomputed free/busy windows
  per user for the next N days) because availability queries are the hot path.
- Writes are transactional per user to avoid double-booking within a single
  calendar, while cross-user conflicts are resolved by the availability check
  rather than locks.
- The system must scale to many attendees without fan-out storms: for very large
  calendars, invites are batched and read-your-own-writes consistency is relaxed
  to eventual consistency across copies.

### Q: How do you detect overlapping events and find free slots?

**A:** Detecting overlaps is a classic interval problem: two events overlap when
`startA < endB AND startB < endA`.

- For one user, the events DB stores rows with a (user_id, start_time, end_time)
  composite index, so a range query on the index returns candidate events in
  O(log n + k), and the service verifies overlaps in memory over the small
  result set.
- The availability engine inverts this: to find free slots it loads the user's
  busy intervals for the requested window (from a precomputed slots cache or by
  querying the index), merges adjacent intervals, and subtracts them from the
  requested range, respecting the user's working hours and out-of-office blocks.
- With many participants, the engine intersects each person's free windows —
  take one user's free intervals and filter by the next user's, iteratively —
  and ranks the remaining gaps by size and preference (earliest, longest, or
  during business hours).

Two practical concerns dominate.

- Caching: per-user free/busy windows for the next few weeks are expensive to
  recompute, so the availability engine writes them to a cache and invalidates
  on any event change; this makes group scheduling fast even though each
  participant's true availability is computed from the authoritative DB.
- Partial overlap: because attendees are rarely fully free, the engine must
  report gaps of at least a minimum duration and let the caller decide; tools
  like a binary interval-tree or a segment-tree per user support "earliest gap
  of duration X" queries in logarithmic time.
- Concurrency is handled by optimistic versioning — if two people book the same
  slot simultaneously, one commit wins and the other is told to retry.

### Q: How do you distribute invites and manage RSVPs?

**A:** Invites are modeled as attendee records attached to an event.

- When an organizer creates an event with attendees, the invitation service fans
  out: for small calendars each attendee gets a reference to the shared event
  plus an RSVP state (invited, accepted, declined, tentative); for very large
  audiences the service can create per-attendee copies or rely on shared-events
  with a counter.
- Each attendee's calendar needs to reflect the event, so writes propagate to
  the invitee's data via a sync feed rather than holding a global lock on the
  event.
- The RSVP flow is simple: an attendee accepts, the service updates the attendee
  record, marks the event on the attendee's calendar as busy, and notifies the
  organizer.
- Change propagation (reschedule, cancel, add attendee) is done by updating the
  event and emitting a versioned change that each affected attendee's calendar
  consumes.

Two failure modes matter.

- An unreliable attendee: RSVP status is tracked per attendee and the organizer
  gets a summary (X accepted, Y pending) computed by aggregation; reminders for
  unanswered invites are re-sent by the notifier before the event.
- Partial delivery: invites flow through a retryable queue so a temporarily
  unavailable mailbox or app doesn't lose the invite, and each client pulls its
  full event list on reconnect, so the RSVP and invite states reconcile by
  eventual consistency.
- The invitation service must also handle privacy — each attendee sees only
  their own participation and the shared event details, never the organizer's
  other commitments — which is why free/busy is exposed as busy-time, not event
  details, to third parties.

### Q: How do you handle recurring events?

**A:** Recurrence is stored as a rule (e.g., `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU`)
plus an exceptions list — individual instances that were moved, cancelled, or
had edits — rather than expanding every occurrence into a row.

- On query, the service expands the rule into concrete instances for the
  requested window using a recurrence engine (the iCalendar RRULE expansion
  algorithm with a bounded horizon, e.g., up to a few years), applies the
  exceptions, and merges in single-instance events.
- This keeps storage small and edits cheap: modifying one instance adds an
  override; modifying the whole series updates the rule and its version.
- Any overlap and conflict detection runs against the expanded instances for the
  window of interest.

The tricky parts are edge cases.

- A recurring event that spans months must not be fully expanded at write time,
  but a query needs only the instances overlapping its window, so expansion is a
  per-request, horizon-bounded computation.
- Moving or cancelling a single instance must survive the rule update: overrides
  are keyed by (series_id, original_start) and the recurrence engine checks
  overrides before emitting an instance.
- Deleting the series must decide whether to delete all overrides too.
- Timezone DST transitions shift instance times across boundaries, so expansion
  is always done in the event's stored timezone, then converted to UTC for the
  bus-cache and cross-user availability.
- Because expansion is cheap and stateless, it can run on many instances of the
  event service; the recurrence engine is pure and deterministic, which also
  makes it unit-testable in isolation.

### Q: How do you sync events across devices offline?

**A:** Offline sync uses change-based replication with per-device cursors.

- Each event and its attachments carry a version (e.g., a logical clock or DB
  timestamp), and the sync service maintains a change log per user: every
  create/update/delete appends a change record with a monotonic sequence number.
- A device tracks the last sequence it saw and pulls the delta since then on
  reconnect; it also batches local edits into an outbox and pushes them, with
  conflict resolution — last-write-wins with timestamps or a three-way merge for
  text fields like descriptions and titles.
- Clients keep a local cache of the user's calendar, so read-only operations
  work fully offline and writes queue locally, stamped with a client-generated
  UUID so retries are idempotent.

Conflict handling is the crux.

- Two edits to the same event from different devices must merge: a simple "last
  writer wins" works for most fields, but changes like moving an event while
  another device edits the description need field-level merging, so edits are
  recorded as per-field operations.
- The sync service serializes the change log per user and hands each client the
  events it can see (respecting attendee/visibility permissions).
- For scale, users are sharded across sync servers and the change log is
  compacted periodically — old records are folded into a snapshot and clients
  that are too far behind rebuild from the snapshot plus recent deltas.
- Push updates (via WebSocket or push notifications) give near-real-time
  convergence, while the pull-on-reconnect path guarantees eventual consistency
  even if push is missed.
- Monitoring tracks sync lag and conflict rates per user to catch regressions in
  the merge logic.

## Source

```text
title: Calendar
node user: User [round, icon=browser]
node app: Calendar App [icon=browser]
node api: API Gateway [icon=server]
node event: Event Service [icon=compute]
node avail: Availability Engine [icon=search]
node invite: Invitation Service [icon=mail]
node sync: Sync Service [icon=sync]
node notifier: Reminders [icon=message]
node db: Events DB [cylinder, icon=database]
node cache: Slots Cache [cylinder, icon=cache]
node search: Event Search [icon=search]

edge user -> app: create event
edge app -> api: schedule
edge api -> event: CRUD
edge event -> db: persist
edge event -> avail: find slots
edge avail -> cache: query
edge event -> invite: notify guests
edge invite -> notifier: reminders
edge sync -> api: pull changes
edge api -> search: index events
edge event -> notifier: schedule reminders
```
