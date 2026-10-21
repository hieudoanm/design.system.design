# PagerDuty — Incident Management

Design an incident management system

**Difficulty:** Medium

**Tags:** monitoring

## Functional Requirements

- an incident management system
- dedupe and group alerts?
- route pages to the right on-call?
- run escalation policies?
- track incident timelines?

## Non-Functional Requirements

- An incident management system turns monitoring signals into people who fix
  things.

- Alerts from monitors arrive at a gateway, are deduplicated and grouped into
  incidents, and then drive paging, escalation, runbook suggestions, and a
  timeline that operators and executives can read.
- The system is only as good as its reliability: when a service is on fire, this
  is the tool that must still work.
- Availability and a tight feedback loop from alert ingestion to notification
  matter more than feature breadth.

The flow begins with ingestion.

- A monitor pushes an alert through the API gateway, which hands it to the
  deduplication layer.
- If the alert matches an existing, open incident, it is folded in as a new
  event; otherwise it opens a fresh incident.
- The incident service assigns ownership through the on-call scheduler, the
  paging engine notifies the responsible person, and an escalation policy
  decides what happens if nobody acknowledges in time.
- The runbook service attaches relevant playbooks.
- Every event, from open to resolve, is appended to the incident timeline and
  the incidents database.

The core engineering challenges are grouping correctness, scheduling accuracy,
and paging discipline.

- Too many incidents and pages create alert fatigue where operators start
  ignoring them; too few means real problems get missed.
- The design therefore centralizes deduplication.
- It makes the on-call schedule authoritative and easy to inspect.
- It gives every escalation a clear audit trail so that a misfired page can be
  traced to a rule rather than becoming a mystery..
- Routing maps an incident to a person by resolving the service's on-call schedule
  at the current time.

- The on-call scheduler maintains per-service and per-team rotation calendars,
  with shifts, handoffs, and overlapping coverage.
- It exposes a point-in-time lookup so a page can answer "who is on call for
  service X right now".
- Schedules must handle time zones, holidays, override days, and the swap
  requests that inevitably happen when someone is unavailable.
- The data model is therefore richer than a plain calendar.

The resolution chain should be explicit and layered.

- An incident looks up the primary rotation for the owning team, then the
  secondary rotation if the primary is unstaffed, and finally a fallback such as
  an escalation list.
- Each step records which schedule and which person were selected, so the page
  carries an auditable answer to "why was I paged".
- This becomes critical after an incident when the question of who was on call
  inevitably comes up.

Routing also needs a notion of freshness.

- A page that resolves a person who rotated off minutes ago, or who is in
  do-not-disturb, should fall through to the correct current owner.
- The scheduler is read-heavy at incident time and write-heavy at shift
  boundaries, so it typically sits behind a cache with near-real-time
  invalidation.
- Accuracy wins over cleverness here; the failure mode is a page to the wrong
  person, which erodes trust in the entire system.
- The routing step is kept deterministic and transparent.
- The rotation also feeds a coverage report, so teams can see thin coverage
  windows and fill them before an incident rather than discovering the gap the
  hard way..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Incident Management
monitor: Monitoring
app: Alert App
gateway: API Gateway
alert: Alert Service
dedupe: Deduplication
incident: Incident Service
oncall: On-Call Scheduler
page: Paging Engine
escalate: Escalation Policy
runbook: Runbooks
db: Incidents DB

monitor ─► app ─► alert
app ─► gateway ─► ingest
gateway ─► dedupe ─► group
dedupe ─► alert ─► create
alert ─► incident ─► open
incident ─► oncall ─► assign
oncall ─► page ─► notify
page ─► escalate ─► retry
escalate ─► incident ─► severity
incident ─► runbook ─► suggest
incident ─► db ─► log
```

## Design

### Design an incident management system

An incident management system turns monitoring signals into people who fix
things.

- Alerts from monitors arrive at a gateway, are deduplicated and grouped into
  incidents, and then drive paging, escalation, runbook suggestions, and a
  timeline that operators and executives can read.
- The system is only as good as its reliability: when a service is on fire, this
  is the tool that must still work.
- Availability and a tight feedback loop from alert ingestion to notification
  matter more than feature breadth.

The flow begins with ingestion.

- A monitor pushes an alert through the API gateway, which hands it to the
  deduplication layer.
- If the alert matches an existing, open incident, it is folded in as a new
  event; otherwise it opens a fresh incident.
- The incident service assigns ownership through the on-call scheduler, the
  paging engine notifies the responsible person, and an escalation policy
  decides what happens if nobody acknowledges in time.
- The runbook service attaches relevant playbooks.
- Every event, from open to resolve, is appended to the incident timeline and
  the incidents database.

The core engineering challenges are grouping correctness, scheduling accuracy,
and paging discipline.

- Too many incidents and pages create alert fatigue where operators start
  ignoring them; too few means real problems get missed.
- The design therefore centralizes deduplication.
- It makes the on-call schedule authoritative and easy to inspect.
- It gives every escalation a clear audit trail so that a misfired page can be
  traced to a rule rather than becoming a mystery.

### How do you dedupe and group alerts?

Deduplication uses a fingerprint computed from the alert source and its stable
fields, such as monitor name, service, and the failing entity.

- Alerts that share a fingerprint while an incident is open are absorbed as
  additional events rather than spawning new incidents.
- The fingerprint must be resilient: it should ignore volatile fields like
  timestamps and exact metric values.
- Otherwise the same outage generates a unique alert every cycle and floods the
  pipeline.

Grouping is often hierarchical.

- A coarse key such as "service" bundles related alerts during a broad outage,
  while a fine key such as "host" keeps distinct failures separate.
- Clustering can be extended with time windows, where alerts arriving within
  minutes of an incident open are merged, and with similarity matching for
  text-based alerts.
- The tradeoff is between noise reduction and signal loss: overly aggressive
  grouping hides the second, independent problem that happens to overlap in
  time.

Deduplication must be idempotent and durable.

- The system stores the mapping from fingerprint to incident, and an alert that
  was already processed must not be applied twice even if the pipeline retries
  after a crash.
- The grouping rules themselves need to be versioned and tunable per service.
- They need metrics, such as incidents per day and alerts per incident, so
  operators can see whether grouping is helping or hiding.
- Everything that gets merged is kept on the timeline so the full history
  remains recoverable.
- Grouping decisions should be reversible: an operator can split a merged
  incident, and the split must preserve the original event ordering so the
  timeline stays truthful after the correction.

### How do you route pages to the right on-call?

Routing maps an incident to a person by resolving the service's on-call schedule
at the current time.

- The on-call scheduler maintains per-service and per-team rotation calendars,
  with shifts, handoffs, and overlapping coverage.
- It exposes a point-in-time lookup so a page can answer "who is on call for
  service X right now".
- Schedules must handle time zones, holidays, override days, and the swap
  requests that inevitably happen when someone is unavailable.
- The data model is therefore richer than a plain calendar.

The resolution chain should be explicit and layered.

- An incident looks up the primary rotation for the owning team, then the
  secondary rotation if the primary is unstaffed, and finally a fallback such as
  an escalation list.
- Each step records which schedule and which person were selected, so the page
  carries an auditable answer to "why was I paged".
- This becomes critical after an incident when the question of who was on call
  inevitably comes up.

Routing also needs a notion of freshness.

- A page that resolves a person who rotated off minutes ago, or who is in
  do-not-disturb, should fall through to the correct current owner.
- The scheduler is read-heavy at incident time and write-heavy at shift
  boundaries, so it typically sits behind a cache with near-real-time
  invalidation.
- Accuracy wins over cleverness here; the failure mode is a page to the wrong
  person, which erodes trust in the entire system.
- The routing step is kept deterministic and transparent.
- The rotation also feeds a coverage report, so teams can see thin coverage
  windows and fill them before an incident rather than discovering the gap the
  hard way.

### How do you run escalation policies?

An escalation policy is a state machine over a sequence of levels.

- Each level lists one or more targets, usually on-call users or whole teams,
  and a timeout in minutes.
- When a page fires, the first level is notified; if no one acknowledges within
  the timeout, the next level is paged, and so on until the policy is exhausted
  or the incident is acknowledged.
- Acknowledgment stops escalation while the incident is actively worked, and
  re-paging resumes it if the incident falls stale again.

Execution must be correct under failure.

- The escalation engine timestamps each level transition, and a missed
  acknowledgment means the timeout must be recomputed from the last
  notification, not restarted from scratch on every retry.
- Notifications are sent through a paging engine with retries and provider
  failover.
- Every attempt, acknowledgment, and escalation step is written to the timeline.
- If a level has multiple targets, the policy can page all of them or a rotating
  subset; the choice affects on-call load and must be configurable per policy.

Policy design is as much about human behavior as about state machines.

- Too short a timeout creates constant noise; too long lets an incident sit
  unattended.
- The system should therefore track metrics like time-to-acknowledge and
  time-to-escalate per level, alerting on drift so policies get tuned.
- The paging engine should also respect quiet hours and overrides.
- It must prevent duplicate pages for the same incident from being fired by
  concurrent sources, since a double page during an outage reads as chaos.

### How do you track incident timelines?

The timeline is an append-only event stream for an incident.

- Each event is a typed record with a timestamp, an actor or source, and
  metadata, covering alert arrival, dedup merges, paging, acknowledgments,
  escalations, notes, status changes, and resolution.
- Because the events are immutable, the timeline reconstructs exactly what
  happened and when, which is what makes postmortems and audits trustworthy.
- The timeline is also the basis for key metrics like mean time to acknowledge
  and mean time to resolve.

Timeline correctness requires a single ordering authority.

- The incident service serializes events through a per-incident sequence so that
  concurrent writers do not interleave inconsistently, and clients receive the
  sequence in order.
- When a runbook executes and performs steps like joining a conference bridge or
  creating a status page, those are recorded as timeline events too, so the
  operational record matches the automated actions.
- Timestamps come from a monotonic source to avoid clock-skew inversions.
- Automated status changes, such as an incident auto-closing when the triggering
  alert clears, are also captured with a reason, so the record distinguishes a
  true fix from a monitoring gap.

The timeline is also a user-facing product.

- The incident page renders it as a scrollable, filterable log that reads like a
  story, and post-incident reviews turn it into an action plan.
- Because the raw stream can grow large during a long outage, it is stored
  durably with the incident record.
- A denormalized summary — current status, severity, and assignee — lives in a
  hot cache for dashboard queries.
- The design principle is simple: never overwrite history, always append, and
  let views derive from the single source of truth.

## Source

```text
title: Incident Management
node monitor: Monitoring [icon=cloud]
node app: Alert App [icon=browser]
node gateway: API Gateway [icon=server]
node alert: Alert Service [icon=compute]
node dedupe: Deduplication [icon=cache]
node incident: Incident Service [icon=compute]
node oncall: On-Call Scheduler [icon=users]
node page: Paging Engine [icon=message]
node escalate: Escalation Policy [icon=compute]
node runbook: Runbooks [icon=file]
node db: Incidents DB [cylinder, icon=database]

edge monitor -> app: alert
edge app -> gateway: ingest
edge gateway -> dedupe: group
edge dedupe -> alert: create
edge alert -> incident: open
edge incident -> oncall: assign
edge oncall -> page: notify
edge page -> escalate: retry
edge escalate -> incident: severity
edge incident -> runbook: suggest
edge incident -> db: log
```

## Q&A

### Q: Design an incident management system

**A:** An incident management system turns monitoring signals into people who fix
things.

- Alerts from monitors arrive at a gateway, are deduplicated and grouped into
  incidents, and then drive paging, escalation, runbook suggestions, and a
  timeline that operators and executives can read.
- The system is only as good as its reliability: when a service is on fire, this
  is the tool that must still work.
- Availability and a tight feedback loop from alert ingestion to notification
  matter more than feature breadth.

The flow begins with ingestion.

- A monitor pushes an alert through the API gateway, which hands it to the
  deduplication layer.
- If the alert matches an existing, open incident, it is folded in as a new
  event; otherwise it opens a fresh incident.
- The incident service assigns ownership through the on-call scheduler, the
  paging engine notifies the responsible person, and an escalation policy
  decides what happens if nobody acknowledges in time.
- The runbook service attaches relevant playbooks.
- Every event, from open to resolve, is appended to the incident timeline and
  the incidents database.

The core engineering challenges are grouping correctness, scheduling accuracy,
and paging discipline.

- Too many incidents and pages create alert fatigue where operators start
  ignoring them; too few means real problems get missed.
- The design therefore centralizes deduplication.
- It makes the on-call schedule authoritative and easy to inspect.
- It gives every escalation a clear audit trail so that a misfired page can be
  traced to a rule rather than becoming a mystery.

### Q: How do you dedupe and group alerts?

**A:** Deduplication uses a fingerprint computed from the alert source and its stable
fields, such as monitor name, service, and the failing entity.

- Alerts that share a fingerprint while an incident is open are absorbed as
  additional events rather than spawning new incidents.
- The fingerprint must be resilient: it should ignore volatile fields like
  timestamps and exact metric values.
- Otherwise the same outage generates a unique alert every cycle and floods the
  pipeline.

Grouping is often hierarchical.

- A coarse key such as "service" bundles related alerts during a broad outage,
  while a fine key such as "host" keeps distinct failures separate.
- Clustering can be extended with time windows, where alerts arriving within
  minutes of an incident open are merged, and with similarity matching for
  text-based alerts.
- The tradeoff is between noise reduction and signal loss: overly aggressive
  grouping hides the second, independent problem that happens to overlap in
  time.

Deduplication must be idempotent and durable.

- The system stores the mapping from fingerprint to incident, and an alert that
  was already processed must not be applied twice even if the pipeline retries
  after a crash.
- The grouping rules themselves need to be versioned and tunable per service.
- They need metrics, such as incidents per day and alerts per incident, so
  operators can see whether grouping is helping or hiding.
- Everything that gets merged is kept on the timeline so the full history
  remains recoverable.
- Grouping decisions should be reversible: an operator can split a merged
  incident, and the split must preserve the original event ordering so the
  timeline stays truthful after the correction.

### Q: How do you route pages to the right on-call?

**A:** Routing maps an incident to a person by resolving the service's on-call schedule
at the current time.

- The on-call scheduler maintains per-service and per-team rotation calendars,
  with shifts, handoffs, and overlapping coverage.
- It exposes a point-in-time lookup so a page can answer "who is on call for
  service X right now".
- Schedules must handle time zones, holidays, override days, and the swap
  requests that inevitably happen when someone is unavailable.
- The data model is therefore richer than a plain calendar.

The resolution chain should be explicit and layered.

- An incident looks up the primary rotation for the owning team, then the
  secondary rotation if the primary is unstaffed, and finally a fallback such as
  an escalation list.
- Each step records which schedule and which person were selected, so the page
  carries an auditable answer to "why was I paged".
- This becomes critical after an incident when the question of who was on call
  inevitably comes up.

Routing also needs a notion of freshness.

- A page that resolves a person who rotated off minutes ago, or who is in
  do-not-disturb, should fall through to the correct current owner.
- The scheduler is read-heavy at incident time and write-heavy at shift
  boundaries, so it typically sits behind a cache with near-real-time
  invalidation.
- Accuracy wins over cleverness here; the failure mode is a page to the wrong
  person, which erodes trust in the entire system.
- The routing step is kept deterministic and transparent.
- The rotation also feeds a coverage report, so teams can see thin coverage
  windows and fill them before an incident rather than discovering the gap the
  hard way.

### Q: How do you run escalation policies?

**A:** An escalation policy is a state machine over a sequence of levels.

- Each level lists one or more targets, usually on-call users or whole teams,
  and a timeout in minutes.
- When a page fires, the first level is notified; if no one acknowledges within
  the timeout, the next level is paged, and so on until the policy is exhausted
  or the incident is acknowledged.
- Acknowledgment stops escalation while the incident is actively worked, and
  re-paging resumes it if the incident falls stale again.

Execution must be correct under failure.

- The escalation engine timestamps each level transition, and a missed
  acknowledgment means the timeout must be recomputed from the last
  notification, not restarted from scratch on every retry.
- Notifications are sent through a paging engine with retries and provider
  failover.
- Every attempt, acknowledgment, and escalation step is written to the timeline.
- If a level has multiple targets, the policy can page all of them or a rotating
  subset; the choice affects on-call load and must be configurable per policy.

Policy design is as much about human behavior as about state machines.

- Too short a timeout creates constant noise; too long lets an incident sit
  unattended.
- The system should therefore track metrics like time-to-acknowledge and
  time-to-escalate per level, alerting on drift so policies get tuned.
- The paging engine should also respect quiet hours and overrides.
- It must prevent duplicate pages for the same incident from being fired by
  concurrent sources, since a double page during an outage reads as chaos.

### Q: How do you track incident timelines?

**A:** The timeline is an append-only event stream for an incident.

- Each event is a typed record with a timestamp, an actor or source, and
  metadata, covering alert arrival, dedup merges, paging, acknowledgments,
  escalations, notes, status changes, and resolution.
- Because the events are immutable, the timeline reconstructs exactly what
  happened and when, which is what makes postmortems and audits trustworthy.
- The timeline is also the basis for key metrics like mean time to acknowledge
  and mean time to resolve.

Timeline correctness requires a single ordering authority.

- The incident service serializes events through a per-incident sequence so that
  concurrent writers do not interleave inconsistently, and clients receive the
  sequence in order.
- When a runbook executes and performs steps like joining a conference bridge or
  creating a status page, those are recorded as timeline events too, so the
  operational record matches the automated actions.
- Timestamps come from a monotonic source to avoid clock-skew inversions.
- Automated status changes, such as an incident auto-closing when the triggering
  alert clears, are also captured with a reason, so the record distinguishes a
  true fix from a monitoring gap.

The timeline is also a user-facing product.

- The incident page renders it as a scrollable, filterable log that reads like a
  story, and post-incident reviews turn it into an action plan.
- Because the raw stream can grow large during a long outage, it is stored
  durably with the incident record.
- A denormalized summary — current status, severity, and assignee — lives in a
  hot cache for dashboard queries.
- The design principle is simple: never overwrite history, always append, and
  let views derive from the single source of truth.

## Source

```text
title: Incident Management
node monitor: Monitoring [icon=cloud]
node app: Alert App [icon=browser]
node gateway: API Gateway [icon=server]
node alert: Alert Service [icon=compute]
node dedupe: Deduplication [icon=cache]
node incident: Incident Service [icon=compute]
node oncall: On-Call Scheduler [icon=users]
node page: Paging Engine [icon=message]
node escalate: Escalation Policy [icon=compute]
node runbook: Runbooks [icon=file]
node db: Incidents DB [cylinder, icon=database]

edge monitor -> app: alert
edge app -> gateway: ingest
edge gateway -> dedupe: group
edge dedupe -> alert: create
edge alert -> incident: open
edge incident -> oncall: assign
edge oncall -> page: notify
edge page -> escalate: retry
edge escalate -> incident: severity
edge incident -> runbook: suggest
edge incident -> db: log
```
