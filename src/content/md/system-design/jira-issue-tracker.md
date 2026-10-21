# Jira — Issue Tracker

Design an issue tracking system

**Difficulty:** Hard

**Tags:** notification, search

## Functional Requirements

- an issue tracking system
- model issues, projects, and workflows?
- power board and backlog queries?
- support real-time collaboration?
- scale search across many issues?

## Non-Functional Requirements

- The issue is a rich document on top of a relational core.

- Every issue has a stable identifier such as PROJECT-123, a type, a summary, a
  description, a reporter, an assignee, and a status; teams then add custom
  fields such as story points, sprint, priority, and severity.
- The Project Service scopes these fields, because each project defines which
  issue types and fields are available, and it owns configuration such as
  default assignees and templates.
- A workflow defines the allowed statuses and the transitions between them,
  optionally with conditions, validators, and post-functions that run when a
  transition fires.
- This makes the workflow a small domain-specific state machine executed by the
  Workflow Engine.

Modeling choices matter at scale.

- Storing all fields on one wide row becomes unwieldy once teams customize
  heavily, so the canonical design keeps core columns typed and moves custom
  fields into an extension table or a JSONB column, with indexes on the fields
  teams filter by.
- Status is stored both as the current value on the issue and as an append-only
  history of transitions, so a team can answer questions like how long an issue
  spent in review.
- Sprints are modeled as a group plus a membership table, because an issue can
  move between sprints, and boards are derived projections: a board is just a
  saved filter over projects, assignees, and statuses rather than its own
  storage.

The workflow is versioned.

- When a team edits a workflow, the engine must keep old transitions valid for
  issues already in flight, so each transition record points to the workflow
  version that defined it.
- Approval gates and parallel statuses complicate the state machine further;
  some teams run multiple concurrent states, such as a code-review state and a
  QA state at once.
- The pragmatic answer is to model the workflow as a directed graph with
  explicit nodes and edges in a table rather than hard-coded statuses, so
  arbitrary graphs can be loaded and validated at runtime without deploying new
  code..
- Boards and backlogs are read-heavy views over issues.

- A board shows the current sprint filtered by status columns, while the backlog
  shows unstarted, unscheduled issues sorted by priority.
- Computing these by scanning the issues table on every request does not scale
  past a few thousand issues per project.
- The pragmatic approach is to maintain materialized projections: a background
  worker consumes issue change events and rebuilds board and backlog views into
  a projection store, so reading a board is a single keyed lookup rather than a
  multi-join query.
- The projection is keyed by project and sprint, with columns for the exact
  statuses and sort orders a board needs.

Queries still need flexibility.

- Teams filter by assignee, priority, label, epic, and custom fields, and they
  expect results in under a hundred milliseconds.
- Two complementary engines cover this: an OLTP index for structured filters and
  a search index for free text and complex JQL.
- The structured path can be served from projections with bitmap-style indexes
  on filter columns, while anything touching text, comments, or history goes to
  the search engine.
- Keeping both consistent requires an outbox pattern, where the issue
  transaction publishes events that both the projection builder and the search
  indexer consume; failures are retried by comparing a cursor of event IDs.

Caching sits in front of both engines.

- Board definitions and rendered column layouts are cached by project, and
  frequently opened backlogs are cached with a short TTL, invalidated on the
  next change event for that project.
- Because a single issue change can affect many boards, invalidation is coarse:
  the event carries the project and sprint keys, and the cache drops every
  affected entry rather than trying to diff views precisely.
- This over-invalidation is cheap compared with the cost of serving a stale
  board, and it keeps the projection builder idempotent and simple to reason
  about..
- Search in Jira means both free text over summaries and descriptions and
  structured JQL over fields like status, assignee, and sprint.

- Free text is served by a search engine such as Lucene or Elasticsearch.
- Documents are the issues, containing summary, description, comments, and key
  fields, and they are indexed incrementally from the change-event stream so
  indexing never sits on the write path.
- Sharding is by project or a range of keys, because almost every search is
  scoped to one project or a small set of projects; this keeps queries within a
  few shards and makes the index hot for the common case.

Structured queries are a different beast.

- JQL can join across projects, filter by custom fields, and combine with
  boolean logic.
- Translating JQL to a single query language is fragile, so the platform
  translates it into a query plan: the search engine handles the text portion
  and facets, while the relational store or a columnar index handles the
  structured filters, and the results are intersected.
- To keep this fast, documents are enriched with the field values that filters
  commonly use, so the search engine itself can satisfy many JQL filters without
  hitting the database.
- Fields the platform does not know about are handled by a schema registry that
  maps them to index attributes.

Relevance and freshness pull in opposite directions.

- Bulk reindexing keeps the index coherent after migrations, while continuous
  incremental indexing keeps it current; the design uses both, with a nightly
  rebuild for defragmentation and correction.
- Per-tenant indexes isolate noisy tenants and let the system size shards by
  data volume rather than by global count.
- Finally, permission filtering is a major cost: every result must be checked
  against project and issue-level permissions before display.
- The index stores the ACL groups each issue is visible to, so permission checks
  become a set intersection during query rather than a post-query join that
  would destroy latency.

## Source

````text
title: Issue Tracker
node dev: Developer [round, icon=browser]
node app: Tracker App [icon=browser]
node gateway: API Gateway [icon=server]
node issue: Issue Service [icon=compute]
node project: Project Service [icon=compute]
node workflow: Workflow Engine [icon=compute]
node sprint: Sprint Service [icon=compute]
node search: Search Index [icon=search]
node realtime: Realtime Updates [icon=sync]
node notify: Notifications [icon=message]
node db: Issues DB [cylinder, icon=database]

edge dev -> app: create issue
edge app -> gateway: submit
edge gateway -> issue: validate
edge issue -> project: link
edge issue -> workflow: transition
edge workflow -> sprint: assign
edge issue -> search: index
edge realtime -> app: push updates
edge search -> app: results
edge issue -> notify: mentions
edge issue -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Issue Tracker
dev: Developer
app: Tracker App
gateway: API Gateway
issue: Issue Service
project: Project Service
workflow: Workflow Engine
sprint: Sprint Service
search: Search Index
realtime: Realtime Updates
notify: Notifications
db: Issues DB

dev ─► app ─► create issue
app ─► gateway ─► submit
gateway ─► issue ─► validate
issue ─► project ─► link
issue ─► workflow ─► transition
workflow ─► sprint ─► assign
issue ─► search ─► index
realtime ─► app ─► push updates
search ─► app ─► results
issue ─► notify ─► mentions
issue ─► db ─► store
````

## Design

### Design an issue tracking system

An issue tracker such as Jira organizes software teams around a single artifact:
the issue.

- Every bug, task, story, or epic is an issue belonging to a project and passing
  through a workflow of states such as To Do, In Progress, In Review, and Done.
- The system therefore has a small set of core concepts: the Issue Service owns
  issue records and their fields, the Project Service links issues to projects
  and enforces project-level settings, the Workflow Engine validates state
  transitions, and the Sprint Service groups issues into time-boxed iterations.
- All of these sit behind a stateless API gateway so the client only ever talks
  to one entry point.

The write path is where correctness matters.

- Creating an issue validates required fields, enforces permissions, assigns a
  stable key, and writes to the Issues DB, a sharded relational store split by
  project or tenant.
- Transitions are guarded by the workflow so an issue cannot move to a state the
  project does not allow, and side effects such as reassignment, comment, or
  notification are published as events after the transaction commits.
- Search indexing is driven off those same events, so the search index is
  eventually consistent with the operational store but never blocks the write.
- This event-driven split is the backbone of the whole design.

Reads dominate the workload.

- Boards and backlogs are filtered, sorted views of potentially thousands of
  issues, and dashboards aggregate across many projects.
- The fast path caches board state and materialized lists, while the search
  index powers free-text and JQL-style queries.
- Realtime collaboration is handled by a push layer that fans out change events
  over WebSockets to every client watching a board or issue, so a transition
  made by one developer appears on every teammate's screen in near real time.
- The result is a system where writes are transactional and auditable while
  reads are eventually consistent and fast.

### How do you model issues, projects, and workflows?

The issue is a rich document on top of a relational core.

- Every issue has a stable identifier such as PROJECT-123, a type, a summary, a
  description, a reporter, an assignee, and a status; teams then add custom
  fields such as story points, sprint, priority, and severity.
- The Project Service scopes these fields, because each project defines which
  issue types and fields are available, and it owns configuration such as
  default assignees and templates.
- A workflow defines the allowed statuses and the transitions between them,
  optionally with conditions, validators, and post-functions that run when a
  transition fires.
- This makes the workflow a small domain-specific state machine executed by the
  Workflow Engine.

Modeling choices matter at scale.

- Storing all fields on one wide row becomes unwieldy once teams customize
  heavily, so the canonical design keeps core columns typed and moves custom
  fields into an extension table or a JSONB column, with indexes on the fields
  teams filter by.
- Status is stored both as the current value on the issue and as an append-only
  history of transitions, so a team can answer questions like how long an issue
  spent in review.
- Sprints are modeled as a group plus a membership table, because an issue can
  move between sprints, and boards are derived projections: a board is just a
  saved filter over projects, assignees, and statuses rather than its own
  storage.

The workflow is versioned.

- When a team edits a workflow, the engine must keep old transitions valid for
  issues already in flight, so each transition record points to the workflow
  version that defined it.
- Approval gates and parallel statuses complicate the state machine further;
  some teams run multiple concurrent states, such as a code-review state and a
  QA state at once.
- The pragmatic answer is to model the workflow as a directed graph with
  explicit nodes and edges in a table rather than hard-coded statuses, so
  arbitrary graphs can be loaded and validated at runtime without deploying new
  code.

### How do you power board and backlog queries?

Boards and backlogs are read-heavy views over issues.

- A board shows the current sprint filtered by status columns, while the backlog
  shows unstarted, unscheduled issues sorted by priority.
- Computing these by scanning the issues table on every request does not scale
  past a few thousand issues per project.
- The pragmatic approach is to maintain materialized projections: a background
  worker consumes issue change events and rebuilds board and backlog views into
  a projection store, so reading a board is a single keyed lookup rather than a
  multi-join query.
- The projection is keyed by project and sprint, with columns for the exact
  statuses and sort orders a board needs.

Queries still need flexibility.

- Teams filter by assignee, priority, label, epic, and custom fields, and they
  expect results in under a hundred milliseconds.
- Two complementary engines cover this: an OLTP index for structured filters and
  a search index for free text and complex JQL.
- The structured path can be served from projections with bitmap-style indexes
  on filter columns, while anything touching text, comments, or history goes to
  the search engine.
- Keeping both consistent requires an outbox pattern, where the issue
  transaction publishes events that both the projection builder and the search
  indexer consume; failures are retried by comparing a cursor of event IDs.

Caching sits in front of both engines.

- Board definitions and rendered column layouts are cached by project, and
  frequently opened backlogs are cached with a short TTL, invalidated on the
  next change event for that project.
- Because a single issue change can affect many boards, invalidation is coarse:
  the event carries the project and sprint keys, and the cache drops every
  affected entry rather than trying to diff views precisely.
- This over-invalidation is cheap compared with the cost of serving a stale
  board, and it keeps the projection builder idempotent and simple to reason
  about.

### How do you support real-time collaboration?

Real-time collaboration in an issue tracker means every participant sees changes
without refreshing.

- A comment appears, a status flips, an assignee changes, a drag-and-drop
  reorders the board.
- The architecture is a publish-subscribe layer on top of the event stream: when
  the issue service commits a transaction, it publishes a domain event
  describing the change and the affected resources.
- A realtime service subscribes to that stream, enriches the event with the
  payload needed to render it, and pushes it over WebSockets to every client
  that currently has the board or issue open.
- Clients filter incoming messages by their subscribed keys, so a client
  watching board A does not render events for board B.

Connection management is the scaling problem.

- Each WebSocket is a long-lived connection, and a big tenant can have tens of
  thousands open at once.
- The realtime service is therefore stateless for routing, with connection state
  held in a shared store and a consistent hash so a client's session is sticky
  to one node; a fan-out layer groups connections by subscribed topic so a
  single event is not duplicated per connection.
- Heartbeats, reconnect with sequence-based catch-up, and delivery receipts
  guard against flaky mobile connections.
- On reconnect, the client fetches the latest state via the API and reconciles
  it against the missed push events.

Ordering and conflicts are handled at the source of truth, not the push layer.

- Events carry a monotonically increasing sequence, and clients that reconnect
  replay missed ranges from the realtime buffer.
- Drag-and-drop reordering is the classic race: two people dragging different
  cards at once.
- The system resolves this with optimistic UI plus server-side serialization,
  where the drag operation is a transaction that recomputes the order and the
  losing client receives a corrected snapshot.
- This keeps the server authoritative while preserving the feel of instant,
  shared interaction.

### How do you scale search across many issues?

Search in Jira means both free text over summaries and descriptions and
structured JQL over fields like status, assignee, and sprint.

- Free text is served by a search engine such as Lucene or Elasticsearch.
- Documents are the issues, containing summary, description, comments, and key
  fields, and they are indexed incrementally from the change-event stream so
  indexing never sits on the write path.
- Sharding is by project or a range of keys, because almost every search is
  scoped to one project or a small set of projects; this keeps queries within a
  few shards and makes the index hot for the common case.

Structured queries are a different beast.

- JQL can join across projects, filter by custom fields, and combine with
  boolean logic.
- Translating JQL to a single query language is fragile, so the platform
  translates it into a query plan: the search engine handles the text portion
  and facets, while the relational store or a columnar index handles the
  structured filters, and the results are intersected.
- To keep this fast, documents are enriched with the field values that filters
  commonly use, so the search engine itself can satisfy many JQL filters without
  hitting the database.
- Fields the platform does not know about are handled by a schema registry that
  maps them to index attributes.

Relevance and freshness pull in opposite directions.

- Bulk reindexing keeps the index coherent after migrations, while continuous
  incremental indexing keeps it current; the design uses both, with a nightly
  rebuild for defragmentation and correction.
- Per-tenant indexes isolate noisy tenants and let the system size shards by
  data volume rather than by global count.
- Finally, permission filtering is a major cost: every result must be checked
  against project and issue-level permissions before display.
- The index stores the ACL groups each issue is visible to, so permission checks
  become a set intersection during query rather than a post-query join that
  would destroy latency.

## Source

```text
title: Issue Tracker
node dev: Developer [round, icon=browser]
node app: Tracker App [icon=browser]
node gateway: API Gateway [icon=server]
node issue: Issue Service [icon=compute]
node project: Project Service [icon=compute]
node workflow: Workflow Engine [icon=compute]
node sprint: Sprint Service [icon=compute]
node search: Search Index [icon=search]
node realtime: Realtime Updates [icon=sync]
node notify: Notifications [icon=message]
node db: Issues DB [cylinder, icon=database]

edge dev -> app: create issue
edge app -> gateway: submit
edge gateway -> issue: validate
edge issue -> project: link
edge issue -> workflow: transition
edge workflow -> sprint: assign
edge issue -> search: index
edge realtime -> app: push updates
edge search -> app: results
edge issue -> notify: mentions
edge issue -> db: store
```

## Q&A

### Q: Design an issue tracking system

**A:** An issue tracker such as Jira organizes software teams around a single artifact:
the issue.

- Every bug, task, story, or epic is an issue belonging to a project and passing
  through a workflow of states such as To Do, In Progress, In Review, and Done.
- The system therefore has a small set of core concepts: the Issue Service owns
  issue records and their fields, the Project Service links issues to projects
  and enforces project-level settings, the Workflow Engine validates state
  transitions, and the Sprint Service groups issues into time-boxed iterations.
- All of these sit behind a stateless API gateway so the client only ever talks
  to one entry point.

The write path is where correctness matters.

- Creating an issue validates required fields, enforces permissions, assigns a
  stable key, and writes to the Issues DB, a sharded relational store split by
  project or tenant.
- Transitions are guarded by the workflow so an issue cannot move to a state the
  project does not allow, and side effects such as reassignment, comment, or
  notification are published as events after the transaction commits.
- Search indexing is driven off those same events, so the search index is
  eventually consistent with the operational store but never blocks the write.
- This event-driven split is the backbone of the whole design.

Reads dominate the workload.

- Boards and backlogs are filtered, sorted views of potentially thousands of
  issues, and dashboards aggregate across many projects.
- The fast path caches board state and materialized lists, while the search
  index powers free-text and JQL-style queries.
- Realtime collaboration is handled by a push layer that fans out change events
  over WebSockets to every client watching a board or issue, so a transition
  made by one developer appears on every teammate's screen in near real time.
- The result is a system where writes are transactional and auditable while
  reads are eventually consistent and fast.

### Q: How do you model issues, projects, and workflows?

**A:** The issue is a rich document on top of a relational core.

- Every issue has a stable identifier such as PROJECT-123, a type, a summary, a
  description, a reporter, an assignee, and a status; teams then add custom
  fields such as story points, sprint, priority, and severity.
- The Project Service scopes these fields, because each project defines which
  issue types and fields are available, and it owns configuration such as
  default assignees and templates.
- A workflow defines the allowed statuses and the transitions between them,
  optionally with conditions, validators, and post-functions that run when a
  transition fires.
- This makes the workflow a small domain-specific state machine executed by the
  Workflow Engine.

Modeling choices matter at scale.

- Storing all fields on one wide row becomes unwieldy once teams customize
  heavily, so the canonical design keeps core columns typed and moves custom
  fields into an extension table or a JSONB column, with indexes on the fields
  teams filter by.
- Status is stored both as the current value on the issue and as an append-only
  history of transitions, so a team can answer questions like how long an issue
  spent in review.
- Sprints are modeled as a group plus a membership table, because an issue can
  move between sprints, and boards are derived projections: a board is just a
  saved filter over projects, assignees, and statuses rather than its own
  storage.

The workflow is versioned.

- When a team edits a workflow, the engine must keep old transitions valid for
  issues already in flight, so each transition record points to the workflow
  version that defined it.
- Approval gates and parallel statuses complicate the state machine further;
  some teams run multiple concurrent states, such as a code-review state and a
  QA state at once.
- The pragmatic answer is to model the workflow as a directed graph with
  explicit nodes and edges in a table rather than hard-coded statuses, so
  arbitrary graphs can be loaded and validated at runtime without deploying new
  code.

### Q: How do you power board and backlog queries?

**A:** Boards and backlogs are read-heavy views over issues.

- A board shows the current sprint filtered by status columns, while the backlog
  shows unstarted, unscheduled issues sorted by priority.
- Computing these by scanning the issues table on every request does not scale
  past a few thousand issues per project.
- The pragmatic approach is to maintain materialized projections: a background
  worker consumes issue change events and rebuilds board and backlog views into
  a projection store, so reading a board is a single keyed lookup rather than a
  multi-join query.
- The projection is keyed by project and sprint, with columns for the exact
  statuses and sort orders a board needs.

Queries still need flexibility.

- Teams filter by assignee, priority, label, epic, and custom fields, and they
  expect results in under a hundred milliseconds.
- Two complementary engines cover this: an OLTP index for structured filters and
  a search index for free text and complex JQL.
- The structured path can be served from projections with bitmap-style indexes
  on filter columns, while anything touching text, comments, or history goes to
  the search engine.
- Keeping both consistent requires an outbox pattern, where the issue
  transaction publishes events that both the projection builder and the search
  indexer consume; failures are retried by comparing a cursor of event IDs.

Caching sits in front of both engines.

- Board definitions and rendered column layouts are cached by project, and
  frequently opened backlogs are cached with a short TTL, invalidated on the
  next change event for that project.
- Because a single issue change can affect many boards, invalidation is coarse:
  the event carries the project and sprint keys, and the cache drops every
  affected entry rather than trying to diff views precisely.
- This over-invalidation is cheap compared with the cost of serving a stale
  board, and it keeps the projection builder idempotent and simple to reason
  about.

### Q: How do you support real-time collaboration?

**A:** Real-time collaboration in an issue tracker means every participant sees changes
without refreshing.

- A comment appears, a status flips, an assignee changes, a drag-and-drop
  reorders the board.
- The architecture is a publish-subscribe layer on top of the event stream: when
  the issue service commits a transaction, it publishes a domain event
  describing the change and the affected resources.
- A realtime service subscribes to that stream, enriches the event with the
  payload needed to render it, and pushes it over WebSockets to every client
  that currently has the board or issue open.
- Clients filter incoming messages by their subscribed keys, so a client
  watching board A does not render events for board B.

Connection management is the scaling problem.

- Each WebSocket is a long-lived connection, and a big tenant can have tens of
  thousands open at once.
- The realtime service is therefore stateless for routing, with connection state
  held in a shared store and a consistent hash so a client's session is sticky
  to one node; a fan-out layer groups connections by subscribed topic so a
  single event is not duplicated per connection.
- Heartbeats, reconnect with sequence-based catch-up, and delivery receipts
  guard against flaky mobile connections.
- On reconnect, the client fetches the latest state via the API and reconciles
  it against the missed push events.

Ordering and conflicts are handled at the source of truth, not the push layer.

- Events carry a monotonically increasing sequence, and clients that reconnect
  replay missed ranges from the realtime buffer.
- Drag-and-drop reordering is the classic race: two people dragging different
  cards at once.
- The system resolves this with optimistic UI plus server-side serialization,
  where the drag operation is a transaction that recomputes the order and the
  losing client receives a corrected snapshot.
- This keeps the server authoritative while preserving the feel of instant,
  shared interaction.

### Q: How do you scale search across many issues?

**A:** Search in Jira means both free text over summaries and descriptions and
structured JQL over fields like status, assignee, and sprint.

- Free text is served by a search engine such as Lucene or Elasticsearch.
- Documents are the issues, containing summary, description, comments, and key
  fields, and they are indexed incrementally from the change-event stream so
  indexing never sits on the write path.
- Sharding is by project or a range of keys, because almost every search is
  scoped to one project or a small set of projects; this keeps queries within a
  few shards and makes the index hot for the common case.

Structured queries are a different beast.

- JQL can join across projects, filter by custom fields, and combine with
  boolean logic.
- Translating JQL to a single query language is fragile, so the platform
  translates it into a query plan: the search engine handles the text portion
  and facets, while the relational store or a columnar index handles the
  structured filters, and the results are intersected.
- To keep this fast, documents are enriched with the field values that filters
  commonly use, so the search engine itself can satisfy many JQL filters without
  hitting the database.
- Fields the platform does not know about are handled by a schema registry that
  maps them to index attributes.

Relevance and freshness pull in opposite directions.

- Bulk reindexing keeps the index coherent after migrations, while continuous
  incremental indexing keeps it current; the design uses both, with a nightly
  rebuild for defragmentation and correction.
- Per-tenant indexes isolate noisy tenants and let the system size shards by
  data volume rather than by global count.
- Finally, permission filtering is a major cost: every result must be checked
  against project and issue-level permissions before display.
- The index stores the ACL groups each issue is visible to, so permission checks
  become a set intersection during query rather than a post-query join that
  would destroy latency.

## Source

```text
title: Issue Tracker
node dev: Developer [round, icon=browser]
node app: Tracker App [icon=browser]
node gateway: API Gateway [icon=server]
node issue: Issue Service [icon=compute]
node project: Project Service [icon=compute]
node workflow: Workflow Engine [icon=compute]
node sprint: Sprint Service [icon=compute]
node search: Search Index [icon=search]
node realtime: Realtime Updates [icon=sync]
node notify: Notifications [icon=message]
node db: Issues DB [cylinder, icon=database]

edge dev -> app: create issue
edge app -> gateway: submit
edge gateway -> issue: validate
edge issue -> project: link
edge issue -> workflow: transition
edge workflow -> sprint: assign
edge issue -> search: index
edge realtime -> app: push updates
edge search -> app: results
edge issue -> notify: mentions
edge issue -> db: store
```
