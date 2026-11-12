# Telehealth — Remote Care

Design a telehealth platform

**Difficulty:** Easy

**Tags:** mobile, storage, video

## Functional Requirements

- a telehealth platform
- schedule and manage appointments?
- run secure video visits at scale?
- store and share patient records safely?
- handle emergency triage and escalations?

## Non-Functional Requirements

- Video uses WebRTC for peer-to-peer media, with a selective forwarding unit (SFU)
  to relay streams when NAT traversal fails or when group visits need multi-party
  routing.

- Signaling (offer/answer exchange, room creation, join tokens) runs over
  WebSocket through the Video Visit service, which issues short-lived
  credentials tied to the appointment so only authorized participants can join.
- Media is encrypted end-to-end in transit, and because WebRTC encrypts with
  DTLS-SRTP, the SFU relays ciphertext rather than decrypting it — a strong
  privacy property.

At scale:

- The SFU pool is autoscaled by concurrent sessions, and placement picks the SFU
  closest to the participants to minimize jitter.
- Dashboards track per-session RTT, packet loss, and resolution.

Fallback and reliability:

- If WebRTC fails behind a restrictive firewall, the system degrades to
  audio-only or a renegotiated relay path rather than dropping the visit.
- Quality-of-service knobs — dynamic bitrate adaptation, echo cancellation,
  bandwidth estimation — are configured in the client SDK.
- Recording (if enabled) happens on the SFU side and writes directly to
  encrypted storage with an audit entry, never through the browser..
- Triage is a rules-based service that evaluates patient input — symptom severity,
  red-flag responses (chest pain, difficulty breathing, stroke signs), vital
  ranges — against a clinician-reviewed decision tree and assigns an urgency tier
  (routine, urgent, emergent).

- Urgent and emergent cases are never left in a queue: the system routes them to
  an on-call provider roster with escalation timers, and if no provider
  acknowledges within a threshold, it pages the next tier and can trigger
  911/emergency-service handoff via a documented protocol.
- To keep triage available when the provider supply is saturated, emergent
  patients are offered an immediate phone or video assessment with a callback
  SLA rather than an appointment slot.
- Every escalation creates an incident record — patient, inputs, tier, who was
  paged, when it was acknowledged, and the outcome — for both clinical and
  operational review.
- The triage engine is a source of legal exposure, so all decisions log the
  exact inputs and rule version used, and any rule change is versioned and
  audited.
- Capacity monitoring feeds escalation: queue length, average wait, and provider
  load are streamed to alerting so a surge triggers on-call expansion before
  emergent cases are delayed.

## Source

````text
title: Telehealth
node patient: Patient [round, icon=browser]
node app: Patient App [icon=browser]
node api: Gateway [icon=server]
node auth: Auth Service [icon=auth]
node schedule: Scheduling [icon=compute]
node visit: Video Visit [icon=worker]
node record: EHR Store [cylinder, icon=database]
node triage: Triage Service [icon=search]
node rx: Prescription Service [icon=file]
node notify: Notifications [icon=message]

edge patient -> app: request
edge app -> api: book
edge api -> auth: verify
edge api -> schedule: slot
edge schedule -> notify: confirm
edge patient -> visit: join
edge visit -> record: chart
edge api -> triage: screen
edge triage -> rx: order
edge rx -> notify: ready
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Telehealth
patient: Patient
app: Patient App
api: Gateway
auth: Auth Service
schedule: Scheduling
visit: Video Visit
record: EHR Store
triage: Triage Service
rx: Prescription Service
notify: Notifications

patient ─► app ─► request
app ─► api ─► book
api ─► auth ─► verify
api ─► schedule ─► slot
schedule ─► notify ─► confirm
patient ─► visit ─► join
visit ─► record ─► chart
api ─► triage ─► screen
triage ─► rx ─► order
rx ─► notify ─► ready
````

## Design

### Design a telehealth platform

The platform lets patients request care through an app that authenticates via an
Auth Service, then routes the request through a Gateway into scheduling, triage,
and visit services.

- Scheduling service: manages provider calendars, open slots, and appointment
  state (REQUESTED, BOOKED, IN_PROGRESS, COMPLETED, CANCELLED); booking confirms
  the slot and notifies the patient.
- Video visits run on a WebRTC-based Video Visit service with a signaling/relay
  path, and each visit is documented into the EHR Store.
- Triage is a decision service that screens patient input (symptoms, vitals,
  urgency) and can route to a provider, order a prescription through the
  Prescription service, or escalate to emergency care.
- Notifications cover confirmations, reminders, and results.

The hard constraints are HIPAA-class security and availability:

- Patient data is encrypted at rest and in transit, and access is audited.
- The system is built so that scheduling and video can degrade independently.
- Provider availability is cached for fast slot lookup while bookings write to
  the authoritative schedule store.
- All medical data writes carry immutable audit records.

### How do you schedule and manage appointments?

Appointments are a slot-based state machine owned by the Scheduling service.

- Providers define their working hours and each day is decomposed into fixed
  slots; a slot is either free, held, or booked.
- Booking atomically transitions free → held → booked so two patients cannot
  claim the same slot.
- To reduce no-shows, slots are held for a short window while the patient
  confirms, then released to a waitlist.
- Reminders are sent 24h and 1h ahead and can auto-release slots if the patient
  does not confirm.
- The calendar supports recurring availability (per weekdays, per provider) and
  exceptions for vacation and on-call blocks.
- Schedules are queried through a cache for fast calendar rendering, with writes
  going to the schedule DB.
- Provider-side management — block time, extend visits, same-day overflow —
  rebalances the slot list, and conflicts are resolved at write time with an
  optimistic timestamp check.
- Time zones are a classic pitfall: slots are stored in provider-local time and
  converted at render, and appointment start/end are tracked in UTC to keep
  reminders and billing correct.

### How do you run secure video visits at scale?

Video uses WebRTC for peer-to-peer media, with a selective forwarding unit (SFU)
to relay streams when NAT traversal fails or when group visits need multi-party
routing.

- Signaling (offer/answer exchange, room creation, join tokens) runs over
  WebSocket through the Video Visit service, which issues short-lived
  credentials tied to the appointment so only authorized participants can join.
- Media is encrypted end-to-end in transit, and because WebRTC encrypts with
  DTLS-SRTP, the SFU relays ciphertext rather than decrypting it — a strong
  privacy property.

At scale:

- The SFU pool is autoscaled by concurrent sessions, and placement picks the SFU
  closest to the participants to minimize jitter.
- Dashboards track per-session RTT, packet loss, and resolution.

Fallback and reliability:

- If WebRTC fails behind a restrictive firewall, the system degrades to
  audio-only or a renegotiated relay path rather than dropping the visit.
- Quality-of-service knobs — dynamic bitrate adaptation, echo cancellation,
  bandwidth estimation — are configured in the client SDK.
- Recording (if enabled) happens on the SFU side and writes directly to
  encrypted storage with an audit entry, never through the browser.

### How do you store and share patient records safely?

The EHR Store keeps records encrypted at rest (AES-256 with keys managed by a
KMS) and scopes every record to a patient with a tenant and access-control
label.

- Access is enforced by the Auth Service and an authorization layer that checks
  role (patient, provider, billing, admin) and relationship (the requesting
  provider must be assigned to the care episode) before any read or write.
- Every access attempt writes to an immutable Audit Log with the actor, record,
  action, and timestamp.
- Sharing to a specialist or a second provider uses delegated access with expiry
  rather than copying records: a scoped grant is issued, logged, and revoked
  automatically.
- When the patient themselves requests export, the system produces a signed,
  encrypted download and records the event.
- Backups are encrypted, and data is replicated across regions with same-region
  affinity for compliance.
- For write safety, the EHR is append-only — clinical notes and vitals are new
  versions rather than overwrites — so a later correction is visible as an
  amendment, which is both a medical and a legal requirement.
- Breach-detection monitoring watches for anomalous access patterns and
  anomalies are alerted.

### How do you handle emergency triage and escalations?

Triage is a rules-based service that evaluates patient input — symptom severity,
red-flag responses (chest pain, difficulty breathing, stroke signs), vital
ranges — against a clinician-reviewed decision tree and assigns an urgency tier
(routine, urgent, emergent).

- Urgent and emergent cases are never left in a queue: the system routes them to
  an on-call provider roster with escalation timers, and if no provider
  acknowledges within a threshold, it pages the next tier and can trigger
  911/emergency-service handoff via a documented protocol.
- To keep triage available when the provider supply is saturated, emergent
  patients are offered an immediate phone or video assessment with a callback
  SLA rather than an appointment slot.
- Every escalation creates an incident record — patient, inputs, tier, who was
  paged, when it was acknowledged, and the outcome — for both clinical and
  operational review.
- The triage engine is a source of legal exposure, so all decisions log the
  exact inputs and rule version used, and any rule change is versioned and
  audited.
- Capacity monitoring feeds escalation: queue length, average wait, and provider
  load are streamed to alerting so a surge triggers on-call expansion before
  emergent cases are delayed.

## Source

```text
title: Telehealth
node patient: Patient [round, icon=browser]
node app: Patient App [icon=browser]
node api: Gateway [icon=server]
node auth: Auth Service [icon=auth]
node schedule: Scheduling [icon=compute]
node visit: Video Visit [icon=worker]
node record: EHR Store [cylinder, icon=database]
node triage: Triage Service [icon=search]
node rx: Prescription Service [icon=file]
node notify: Notifications [icon=message]

edge patient -> app: request
edge app -> api: book
edge api -> auth: verify
edge api -> schedule: slot
edge schedule -> notify: confirm
edge patient -> visit: join
edge visit -> record: chart
edge api -> triage: screen
edge triage -> rx: order
edge rx -> notify: ready
```

## Q&A

### Q: Design a telehealth platform

**A:** The platform lets patients request care through an app that authenticates via an
Auth Service, then routes the request through a Gateway into scheduling, triage,
and visit services.

- Scheduling service: manages provider calendars, open slots, and appointment
  state (REQUESTED, BOOKED, IN_PROGRESS, COMPLETED, CANCELLED); booking confirms
  the slot and notifies the patient.
- Video visits run on a WebRTC-based Video Visit service with a signaling/relay
  path, and each visit is documented into the EHR Store.
- Triage is a decision service that screens patient input (symptoms, vitals,
  urgency) and can route to a provider, order a prescription through the
  Prescription service, or escalate to emergency care.
- Notifications cover confirmations, reminders, and results.

The hard constraints are HIPAA-class security and availability:

- Patient data is encrypted at rest and in transit, and access is audited.
- The system is built so that scheduling and video can degrade independently.
- Provider availability is cached for fast slot lookup while bookings write to
  the authoritative schedule store.
- All medical data writes carry immutable audit records.

### Q: How do you schedule and manage appointments?

**A:** Appointments are a slot-based state machine owned by the Scheduling service.

- Providers define their working hours and each day is decomposed into fixed
  slots; a slot is either free, held, or booked.
- Booking atomically transitions free → held → booked so two patients cannot
  claim the same slot.
- To reduce no-shows, slots are held for a short window while the patient
  confirms, then released to a waitlist.
- Reminders are sent 24h and 1h ahead and can auto-release slots if the patient
  does not confirm.
- The calendar supports recurring availability (per weekdays, per provider) and
  exceptions for vacation and on-call blocks.
- Schedules are queried through a cache for fast calendar rendering, with writes
  going to the schedule DB.
- Provider-side management — block time, extend visits, same-day overflow —
  rebalances the slot list, and conflicts are resolved at write time with an
  optimistic timestamp check.
- Time zones are a classic pitfall: slots are stored in provider-local time and
  converted at render, and appointment start/end are tracked in UTC to keep
  reminders and billing correct.

### Q: How do you run secure video visits at scale?

**A:** Video uses WebRTC for peer-to-peer media, with a selective forwarding unit (SFU)
to relay streams when NAT traversal fails or when group visits need multi-party
routing.

- Signaling (offer/answer exchange, room creation, join tokens) runs over
  WebSocket through the Video Visit service, which issues short-lived
  credentials tied to the appointment so only authorized participants can join.
- Media is encrypted end-to-end in transit, and because WebRTC encrypts with
  DTLS-SRTP, the SFU relays ciphertext rather than decrypting it — a strong
  privacy property.

At scale:

- The SFU pool is autoscaled by concurrent sessions, and placement picks the SFU
  closest to the participants to minimize jitter.
- Dashboards track per-session RTT, packet loss, and resolution.

Fallback and reliability:

- If WebRTC fails behind a restrictive firewall, the system degrades to
  audio-only or a renegotiated relay path rather than dropping the visit.
- Quality-of-service knobs — dynamic bitrate adaptation, echo cancellation,
  bandwidth estimation — are configured in the client SDK.
- Recording (if enabled) happens on the SFU side and writes directly to
  encrypted storage with an audit entry, never through the browser.

### Q: How do you store and share patient records safely?

**A:** The EHR Store keeps records encrypted at rest (AES-256 with keys managed by a
KMS) and scopes every record to a patient with a tenant and access-control
label.

- Access is enforced by the Auth Service and an authorization layer that checks
  role (patient, provider, billing, admin) and relationship (the requesting
  provider must be assigned to the care episode) before any read or write.
- Every access attempt writes to an immutable Audit Log with the actor, record,
  action, and timestamp.
- Sharing to a specialist or a second provider uses delegated access with expiry
  rather than copying records: a scoped grant is issued, logged, and revoked
  automatically.
- When the patient themselves requests export, the system produces a signed,
  encrypted download and records the event.
- Backups are encrypted, and data is replicated across regions with same-region
  affinity for compliance.
- For write safety, the EHR is append-only — clinical notes and vitals are new
  versions rather than overwrites — so a later correction is visible as an
  amendment, which is both a medical and a legal requirement.
- Breach-detection monitoring watches for anomalous access patterns and
  anomalies are alerted.

### Q: How do you handle emergency triage and escalations?

**A:** Triage is a rules-based service that evaluates patient input — symptom severity,
red-flag responses (chest pain, difficulty breathing, stroke signs), vital
ranges — against a clinician-reviewed decision tree and assigns an urgency tier
(routine, urgent, emergent).

- Urgent and emergent cases are never left in a queue: the system routes them to
  an on-call provider roster with escalation timers, and if no provider
  acknowledges within a threshold, it pages the next tier and can trigger
  911/emergency-service handoff via a documented protocol.
- To keep triage available when the provider supply is saturated, emergent
  patients are offered an immediate phone or video assessment with a callback
  SLA rather than an appointment slot.
- Every escalation creates an incident record — patient, inputs, tier, who was
  paged, when it was acknowledged, and the outcome — for both clinical and
  operational review.
- The triage engine is a source of legal exposure, so all decisions log the
  exact inputs and rule version used, and any rule change is versioned and
  audited.
- Capacity monitoring feeds escalation: queue length, average wait, and provider
  load are streamed to alerting so a surge triggers on-call expansion before
  emergent cases are delayed.

## Source

```text
title: Telehealth
node patient: Patient [round, icon=browser]
node app: Patient App [icon=browser]
node api: Gateway [icon=server]
node auth: Auth Service [icon=auth]
node schedule: Scheduling [icon=compute]
node visit: Video Visit [icon=worker]
node record: EHR Store [cylinder, icon=database]
node triage: Triage Service [icon=search]
node rx: Prescription Service [icon=file]
node notify: Notifications [icon=message]

edge patient -> app: request
edge app -> api: book
edge api -> auth: verify
edge api -> schedule: slot
edge schedule -> notify: confirm
edge patient -> visit: join
edge visit -> record: chart
edge api -> triage: screen
edge triage -> rx: order
edge rx -> notify: ready
```
