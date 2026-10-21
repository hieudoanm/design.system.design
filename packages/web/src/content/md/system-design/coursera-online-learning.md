# Coursera — Online Learning

Design an online learning platform

**Difficulty:** Hard

**Tags:** video

## Functional Requirements

- an online learning platform
- stream video lessons at scale?
- track learner progress?
- build quizzes and grading?
- issue certificates?

## Non-Functional Requirements

- An online learning platform delivers structured courses, tracks each learner's
  progress, grades assessments, and issues credentials.

- The learner interacts through the Learning App, which routes requests through
  the API Gateway.
- The Course Service owns the catalog, enrollments, and course structure, while
  the Video Platform streams recorded lessons.
- As a student watches and completes items, the Progress Tracker records
  milestones that drive what the app offers next.
- Quizzes are managed by the Quiz Engine and graded by the Grading Service, and
  when a course is completed, the Certificate Service issues a verifiable
  credential and the Notification Service emails the student.
- Enrollments and progress records live in the Enrollments DB.

The three pillars, content delivery, progress tracking, and assessment, have
very different requirements.

- Video is a read-heavy delivery problem that demands a CDN and bandwidth
  planning.
- Progress is a write-heavy consistency problem, since every pause, resume, and
  completion is an event that must be recorded durably and reflected immediately
  in the UI.
- Assessment is a correctness and fairness problem, with the added requirement
  that grades and certificates must be tamper-evident.
- Keeping these as separate services lets each scale and fail independently,
  which matters because a video outage is annoying but a grading outage is
  unacceptable.

The learner's experience depends on the platform knowing exactly where they are,
on any device, at any moment.

- That makes progress the connective tissue of the system, feeding the course
  map, the certificate eligibility check, and the resume-watching feature.
- The design therefore treats progress writes as first-class, idempotent events
  and makes the progress read path fast with caching, so the course interface
  always reflects the latest state without overloading the database..
- Video is the dominant bandwidth cost, and the architecture is built around
  encoding and delivery rather than storage.

- When a lesson is published, it is transcoded into multiple renditions, from
  low-bitrate mobile to high-definition desktop, and segmented into short chunks
  that can be fetched independently.
- The Video Platform stores the segments in object storage and fronts them with
  a CDN, so the origin is hit only on a cache miss.
- The player requests a manifest that lists the renditions and segments, and it
  switches renditions dynamically based on measured bandwidth, which keeps
  playback smooth on flaky connections.

Caching is what makes global scale affordable.

- A lesson is identical for every student, so popular content gets enormous
  cache hit rates at the CDN edge, and the origin storage cost is paid once
  while the delivery cost is spread across a global edge network.
- Cache control is deliberate: published lessons are effectively immutable and
  can be cached aggressively, while re-encoded or replaced lessons are versioned
  with new URLs so stale chunks are never served.
- The main scaling concern is cold-start, when a freshly published lesson is
  first requested worldwide, so the system pre-warms the edge by pushing the
  segments out ahead of the launch.

The interactive features are built around the same segments.

- The player reports playback positions and pauses to the Progress Tracker, and
  seek requests map to segment boundaries so a seek is just fetching from the
  CDN at a different offset.
- Streaming must degrade gracefully under load: when the CDN degrades or a
  region is saturated, the player falls back to lower renditions and the
  platform can fall back to a second CDN provider.
- Monitoring is per-region and per-ISP, because a smooth stream in one region
  says nothing about another..
- Progress is the learner's state machine.

- The system tracks two levels: item-level events, such as "watched 80 percent
  of this video" or "completed this quiz", and course-level completion, which is
  derived by aggregating the item states.
- The Progress Tracker consumes events from the app, normalizes them, and writes
  them as idempotent updates keyed by student and course.
- Idempotency matters because the app retries writes and because a student may
  watch the same segment on two devices, so the same event must not
  double-count.
- Each write updates both the item state and the precomputed course summary.

Consistency between the write path and the read path is the hard problem.

- The student's next-lesson button must reflect their latest state immediately,
  but the write volume is enormous, spanning every pause and resume.
- The design separates the hot read path from the durable store: the Progress
  Tracker maintains a fast in-memory state for active sessions that the app
  queries through the gateway, while a committed log drains to the Enrollments
  DB asynchronously.
- On crash recovery, the durable store is the source of truth and the in-memory
  state is rebuilt from it, so a transient loss of a session only delays, never
  erases, recorded progress.

Progress also defines what the student is allowed to do.

- Unlocking a quiz until prerequisite items are complete, marking a module done,
  and computing course completion all read the aggregated state.
- Because progress is event-based, the system can reprocess history: if
  completion rules change, for example a lesson is added, the existing events
  can be replayed against the new rules to recompute every affected course
  state.
- The aggregated summary is what certificates consume, so its integrity is
  treated as a first-class concern..
- Quizzes are authored content, like lessons, but they are executed interactively.

- The Quiz Engine owns the quiz lifecycle: it serves questions one at a time,
  collects answers, and enforces the rules of the assessment, such as time
  limits, attempt limits, and whether a student can return to a previous
  question.
- The question bank is versioned with courses, so a change to a question creates
  a new version rather than mutating the old one, which is essential for fair
  retakes and for auditing.
- Each quiz attempt creates a session that records every answer with a
  timestamp.

Grading is deliberately separated from quizzing.

- The Grading Service scores an attempt deterministically: multiple-choice
  answers map to keys, and free-response answers are checked by model-based
  grading or human review.
- Deterministic grading is idempotent, so a graded attempt can be recomputed and
  the result is always identical, which is a requirement when a student disputes
  a score.
- The grading result updates the attempt record and the course progress in one
  atomic step, so a grade and its progress effect cannot disagree.
- Partial credit, penalties, and pass thresholds are all configuration on the
  course, applied at grading time.

Fairness and integrity shape the design more than raw scale.

- The system detects irregular patterns, such as near-identical submissions or
  answers submitted in implausibly short times, and flags them for review
  without disrupting the student.
- Retake rules are enforced in the Quiz Engine, which checks attempt limits
  before starting a session.
- Because grades feed certificates, the grading path is immutable and audited:
  an attempt, its answer set, the scoring inputs, and the resulting grade form
  an append-only record that can be reproduced at any time..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Online Learning
student: Student
app: Learning App
gateway: API Gateway
course: Course Service
video: Video Platform
progress: Progress Tracker
quiz: Quiz Engine
grade: Grading Service
cert: Certificate Service
notify: Notifications
db: Enrollments DB

student ─► app ─► enroll
app ─► gateway ─► join
gateway ─► course ─► register
student ─► app ─► watch
app ─► video ─► stream
app ─► progress ─► update
student ─► app ─► take quiz
gateway ─► quiz ─► submit
quiz ─► grade ─► score
grade ─► cert ─► award
progress ─► db ─► store
cert ─► notify ─► email
```

## Design

### Design an online learning platform

An online learning platform delivers structured courses, tracks each learner's
progress, grades assessments, and issues credentials.

- The learner interacts through the Learning App, which routes requests through
  the API Gateway.
- The Course Service owns the catalog, enrollments, and course structure, while
  the Video Platform streams recorded lessons.
- As a student watches and completes items, the Progress Tracker records
  milestones that drive what the app offers next.
- Quizzes are managed by the Quiz Engine and graded by the Grading Service, and
  when a course is completed, the Certificate Service issues a verifiable
  credential and the Notification Service emails the student.
- Enrollments and progress records live in the Enrollments DB.

The three pillars, content delivery, progress tracking, and assessment, have
very different requirements.

- Video is a read-heavy delivery problem that demands a CDN and bandwidth
  planning.
- Progress is a write-heavy consistency problem, since every pause, resume, and
  completion is an event that must be recorded durably and reflected immediately
  in the UI.
- Assessment is a correctness and fairness problem, with the added requirement
  that grades and certificates must be tamper-evident.
- Keeping these as separate services lets each scale and fail independently,
  which matters because a video outage is annoying but a grading outage is
  unacceptable.

The learner's experience depends on the platform knowing exactly where they are,
on any device, at any moment.

- That makes progress the connective tissue of the system, feeding the course
  map, the certificate eligibility check, and the resume-watching feature.
- The design therefore treats progress writes as first-class, idempotent events
  and makes the progress read path fast with caching, so the course interface
  always reflects the latest state without overloading the database.

### How do you stream video lessons at scale?

Video is the dominant bandwidth cost, and the architecture is built around
encoding and delivery rather than storage.

- When a lesson is published, it is transcoded into multiple renditions, from
  low-bitrate mobile to high-definition desktop, and segmented into short chunks
  that can be fetched independently.
- The Video Platform stores the segments in object storage and fronts them with
  a CDN, so the origin is hit only on a cache miss.
- The player requests a manifest that lists the renditions and segments, and it
  switches renditions dynamically based on measured bandwidth, which keeps
  playback smooth on flaky connections.

Caching is what makes global scale affordable.

- A lesson is identical for every student, so popular content gets enormous
  cache hit rates at the CDN edge, and the origin storage cost is paid once
  while the delivery cost is spread across a global edge network.
- Cache control is deliberate: published lessons are effectively immutable and
  can be cached aggressively, while re-encoded or replaced lessons are versioned
  with new URLs so stale chunks are never served.
- The main scaling concern is cold-start, when a freshly published lesson is
  first requested worldwide, so the system pre-warms the edge by pushing the
  segments out ahead of the launch.

The interactive features are built around the same segments.

- The player reports playback positions and pauses to the Progress Tracker, and
  seek requests map to segment boundaries so a seek is just fetching from the
  CDN at a different offset.
- Streaming must degrade gracefully under load: when the CDN degrades or a
  region is saturated, the player falls back to lower renditions and the
  platform can fall back to a second CDN provider.
- Monitoring is per-region and per-ISP, because a smooth stream in one region
  says nothing about another.

### How do you track learner progress?

Progress is the learner's state machine.

- The system tracks two levels: item-level events, such as "watched 80 percent
  of this video" or "completed this quiz", and course-level completion, which is
  derived by aggregating the item states.
- The Progress Tracker consumes events from the app, normalizes them, and writes
  them as idempotent updates keyed by student and course.
- Idempotency matters because the app retries writes and because a student may
  watch the same segment on two devices, so the same event must not
  double-count.
- Each write updates both the item state and the precomputed course summary.

Consistency between the write path and the read path is the hard problem.

- The student's next-lesson button must reflect their latest state immediately,
  but the write volume is enormous, spanning every pause and resume.
- The design separates the hot read path from the durable store: the Progress
  Tracker maintains a fast in-memory state for active sessions that the app
  queries through the gateway, while a committed log drains to the Enrollments
  DB asynchronously.
- On crash recovery, the durable store is the source of truth and the in-memory
  state is rebuilt from it, so a transient loss of a session only delays, never
  erases, recorded progress.

Progress also defines what the student is allowed to do.

- Unlocking a quiz until prerequisite items are complete, marking a module done,
  and computing course completion all read the aggregated state.
- Because progress is event-based, the system can reprocess history: if
  completion rules change, for example a lesson is added, the existing events
  can be replayed against the new rules to recompute every affected course
  state.
- The aggregated summary is what certificates consume, so its integrity is
  treated as a first-class concern.

### How do you build quizzes and grading?

Quizzes are authored content, like lessons, but they are executed interactively.

- The Quiz Engine owns the quiz lifecycle: it serves questions one at a time,
  collects answers, and enforces the rules of the assessment, such as time
  limits, attempt limits, and whether a student can return to a previous
  question.
- The question bank is versioned with courses, so a change to a question creates
  a new version rather than mutating the old one, which is essential for fair
  retakes and for auditing.
- Each quiz attempt creates a session that records every answer with a
  timestamp.

Grading is deliberately separated from quizzing.

- The Grading Service scores an attempt deterministically: multiple-choice
  answers map to keys, and free-response answers are checked by model-based
  grading or human review.
- Deterministic grading is idempotent, so a graded attempt can be recomputed and
  the result is always identical, which is a requirement when a student disputes
  a score.
- The grading result updates the attempt record and the course progress in one
  atomic step, so a grade and its progress effect cannot disagree.
- Partial credit, penalties, and pass thresholds are all configuration on the
  course, applied at grading time.

Fairness and integrity shape the design more than raw scale.

- The system detects irregular patterns, such as near-identical submissions or
  answers submitted in implausibly short times, and flags them for review
  without disrupting the student.
- Retake rules are enforced in the Quiz Engine, which checks attempt limits
  before starting a session.
- Because grades feed certificates, the grading path is immutable and audited:
  an attempt, its answer set, the scoring inputs, and the resulting grade form
  an append-only record that can be reproduced at any time.

### How do you issue certificates?

A certificate is the terminal credential of the course, and its integrity
matters more than its volume.

- The Certificate Service awards a certificate only when the aggregated course
  progress satisfies the completion requirements, so the eligibility check is a
  query against the Progress Tracker, not a user-facing flag that could be
  spoofed.
- The award is a one-time, idempotent operation: no matter how many times the
  completion condition is observed, exactly one certificate is issued.
- Each certificate carries a unique identifier, the student identity, the
  course, the completion date, and a cryptographic signature from the platform.

The signature is what makes the credential verifiable.

- A signed digest lets any third party check that a certificate was issued by
  the platform and was not tampered with, and the signature is generated by a
  key held in a secure store separate from the certificate-serving path.
- The certificate record is written to a durable, append-only store at issuance
  time, which makes the ledger of awards authoritative even if a rendering
  system fails.
- The student-facing PDF or badge is a presentation of that record, not the
  record itself, so a corrupted download can be regenerated without touching the
  ledger.

Certificate correctness depends on the grading and progress paths feeding it
accurate data.

- Because an award is derived from course state, the system disallows
  retroactive awards when the completion requirements change after a learner has
  already passed, except through an explicit, audited exception process.
- When a learner is found to have violated assessment integrity, a revocation
  flow invalidates the signed record, and verification reflects the revocation.
- The Notification Service sends the confirmation email, and the certificate
  remains queryable by the learner long after the course retirement, so the
  certificate store is designed for permanent retention rather than eviction.

## Source

```text
title: Online Learning
node student: Student [round, icon=browser]
node app: Learning App [icon=browser]
node gateway: API Gateway [icon=server]
node course: Course Service [icon=compute]
node video: Video Platform [icon=cloud]
node progress: Progress Tracker [icon=compute]
node quiz: Quiz Engine [icon=compute]
node grade: Grading Service [icon=compute]
node cert: Certificate Service [icon=shield]
node notify: Notifications [icon=message]
node db: Enrollments DB [cylinder, icon=database]

edge student -> app: enroll
edge app -> gateway: join
edge gateway -> course: register
edge student -> app: watch
edge app -> video: stream
edge app -> progress: update
edge student -> app: take quiz
edge gateway -> quiz: submit
edge quiz -> grade: score
edge grade -> cert: award
edge progress -> db: store
edge cert -> notify: email
```

## Q&A

### Q: Design an online learning platform

**A:** An online learning platform delivers structured courses, tracks each learner's
progress, grades assessments, and issues credentials.

- The learner interacts through the Learning App, which routes requests through
  the API Gateway.
- The Course Service owns the catalog, enrollments, and course structure, while
  the Video Platform streams recorded lessons.
- As a student watches and completes items, the Progress Tracker records
  milestones that drive what the app offers next.
- Quizzes are managed by the Quiz Engine and graded by the Grading Service, and
  when a course is completed, the Certificate Service issues a verifiable
  credential and the Notification Service emails the student.
- Enrollments and progress records live in the Enrollments DB.

The three pillars, content delivery, progress tracking, and assessment, have
very different requirements.

- Video is a read-heavy delivery problem that demands a CDN and bandwidth
  planning.
- Progress is a write-heavy consistency problem, since every pause, resume, and
  completion is an event that must be recorded durably and reflected immediately
  in the UI.
- Assessment is a correctness and fairness problem, with the added requirement
  that grades and certificates must be tamper-evident.
- Keeping these as separate services lets each scale and fail independently,
  which matters because a video outage is annoying but a grading outage is
  unacceptable.

The learner's experience depends on the platform knowing exactly where they are,
on any device, at any moment.

- That makes progress the connective tissue of the system, feeding the course
  map, the certificate eligibility check, and the resume-watching feature.
- The design therefore treats progress writes as first-class, idempotent events
  and makes the progress read path fast with caching, so the course interface
  always reflects the latest state without overloading the database.

### Q: How do you stream video lessons at scale?

**A:** Video is the dominant bandwidth cost, and the architecture is built around
encoding and delivery rather than storage.

- When a lesson is published, it is transcoded into multiple renditions, from
  low-bitrate mobile to high-definition desktop, and segmented into short chunks
  that can be fetched independently.
- The Video Platform stores the segments in object storage and fronts them with
  a CDN, so the origin is hit only on a cache miss.
- The player requests a manifest that lists the renditions and segments, and it
  switches renditions dynamically based on measured bandwidth, which keeps
  playback smooth on flaky connections.

Caching is what makes global scale affordable.

- A lesson is identical for every student, so popular content gets enormous
  cache hit rates at the CDN edge, and the origin storage cost is paid once
  while the delivery cost is spread across a global edge network.
- Cache control is deliberate: published lessons are effectively immutable and
  can be cached aggressively, while re-encoded or replaced lessons are versioned
  with new URLs so stale chunks are never served.
- The main scaling concern is cold-start, when a freshly published lesson is
  first requested worldwide, so the system pre-warms the edge by pushing the
  segments out ahead of the launch.

The interactive features are built around the same segments.

- The player reports playback positions and pauses to the Progress Tracker, and
  seek requests map to segment boundaries so a seek is just fetching from the
  CDN at a different offset.
- Streaming must degrade gracefully under load: when the CDN degrades or a
  region is saturated, the player falls back to lower renditions and the
  platform can fall back to a second CDN provider.
- Monitoring is per-region and per-ISP, because a smooth stream in one region
  says nothing about another.

### Q: How do you track learner progress?

**A:** Progress is the learner's state machine.

- The system tracks two levels: item-level events, such as "watched 80 percent
  of this video" or "completed this quiz", and course-level completion, which is
  derived by aggregating the item states.
- The Progress Tracker consumes events from the app, normalizes them, and writes
  them as idempotent updates keyed by student and course.
- Idempotency matters because the app retries writes and because a student may
  watch the same segment on two devices, so the same event must not
  double-count.
- Each write updates both the item state and the precomputed course summary.

Consistency between the write path and the read path is the hard problem.

- The student's next-lesson button must reflect their latest state immediately,
  but the write volume is enormous, spanning every pause and resume.
- The design separates the hot read path from the durable store: the Progress
  Tracker maintains a fast in-memory state for active sessions that the app
  queries through the gateway, while a committed log drains to the Enrollments
  DB asynchronously.
- On crash recovery, the durable store is the source of truth and the in-memory
  state is rebuilt from it, so a transient loss of a session only delays, never
  erases, recorded progress.

Progress also defines what the student is allowed to do.

- Unlocking a quiz until prerequisite items are complete, marking a module done,
  and computing course completion all read the aggregated state.
- Because progress is event-based, the system can reprocess history: if
  completion rules change, for example a lesson is added, the existing events
  can be replayed against the new rules to recompute every affected course
  state.
- The aggregated summary is what certificates consume, so its integrity is
  treated as a first-class concern.

### Q: How do you build quizzes and grading?

**A:** Quizzes are authored content, like lessons, but they are executed interactively.

- The Quiz Engine owns the quiz lifecycle: it serves questions one at a time,
  collects answers, and enforces the rules of the assessment, such as time
  limits, attempt limits, and whether a student can return to a previous
  question.
- The question bank is versioned with courses, so a change to a question creates
  a new version rather than mutating the old one, which is essential for fair
  retakes and for auditing.
- Each quiz attempt creates a session that records every answer with a
  timestamp.

Grading is deliberately separated from quizzing.

- The Grading Service scores an attempt deterministically: multiple-choice
  answers map to keys, and free-response answers are checked by model-based
  grading or human review.
- Deterministic grading is idempotent, so a graded attempt can be recomputed and
  the result is always identical, which is a requirement when a student disputes
  a score.
- The grading result updates the attempt record and the course progress in one
  atomic step, so a grade and its progress effect cannot disagree.
- Partial credit, penalties, and pass thresholds are all configuration on the
  course, applied at grading time.

Fairness and integrity shape the design more than raw scale.

- The system detects irregular patterns, such as near-identical submissions or
  answers submitted in implausibly short times, and flags them for review
  without disrupting the student.
- Retake rules are enforced in the Quiz Engine, which checks attempt limits
  before starting a session.
- Because grades feed certificates, the grading path is immutable and audited:
  an attempt, its answer set, the scoring inputs, and the resulting grade form
  an append-only record that can be reproduced at any time.

### Q: How do you issue certificates?

**A:** A certificate is the terminal credential of the course, and its integrity
matters more than its volume.

- The Certificate Service awards a certificate only when the aggregated course
  progress satisfies the completion requirements, so the eligibility check is a
  query against the Progress Tracker, not a user-facing flag that could be
  spoofed.
- The award is a one-time, idempotent operation: no matter how many times the
  completion condition is observed, exactly one certificate is issued.
- Each certificate carries a unique identifier, the student identity, the
  course, the completion date, and a cryptographic signature from the platform.

The signature is what makes the credential verifiable.

- A signed digest lets any third party check that a certificate was issued by
  the platform and was not tampered with, and the signature is generated by a
  key held in a secure store separate from the certificate-serving path.
- The certificate record is written to a durable, append-only store at issuance
  time, which makes the ledger of awards authoritative even if a rendering
  system fails.
- The student-facing PDF or badge is a presentation of that record, not the
  record itself, so a corrupted download can be regenerated without touching the
  ledger.

Certificate correctness depends on the grading and progress paths feeding it
accurate data.

- Because an award is derived from course state, the system disallows
  retroactive awards when the completion requirements change after a learner has
  already passed, except through an explicit, audited exception process.
- When a learner is found to have violated assessment integrity, a revocation
  flow invalidates the signed record, and verification reflects the revocation.
- The Notification Service sends the confirmation email, and the certificate
  remains queryable by the learner long after the course retirement, so the
  certificate store is designed for permanent retention rather than eviction.

## Source

```text
title: Online Learning
node student: Student [round, icon=browser]
node app: Learning App [icon=browser]
node gateway: API Gateway [icon=server]
node course: Course Service [icon=compute]
node video: Video Platform [icon=cloud]
node progress: Progress Tracker [icon=compute]
node quiz: Quiz Engine [icon=compute]
node grade: Grading Service [icon=compute]
node cert: Certificate Service [icon=shield]
node notify: Notifications [icon=message]
node db: Enrollments DB [cylinder, icon=database]

edge student -> app: enroll
edge app -> gateway: join
edge gateway -> course: register
edge student -> app: watch
edge app -> video: stream
edge app -> progress: update
edge student -> app: take quiz
edge gateway -> quiz: submit
edge quiz -> grade: score
edge grade -> cert: award
edge progress -> db: store
edge cert -> notify: email
```
