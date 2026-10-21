# Salesforce — CRM

Design a customer relationship management system

**Difficulty:** Hard

**Tags:** analytics

## Functional Requirements

- a customer relationship management system
- model leads, contacts, and accounts?
- track sales pipelines and forecasts?
- support custom objects and fields?
- integrate email and notifications?

## Non-Functional Requirements

- A CRM platform like Salesforce centralizes how a sales organization captures and
  manages every interaction with prospects and customers.

- The core object model starts with a lead, an unqualified person or company
  captured from web forms, events, or imported lists.
- When a sales rep qualifies a lead, the system converts it into canonical
  records: a contact for the individual and an account for the company, while
  simultaneously opening an opportunity, the revenue-bearing deal.
- The diagram shows this flow: the Lead Service captures new leads, the Contact
  Service keeps profiles current, the Opportunity Service holds the deal record,
  and the Pipeline Engine moves deals through stages such as prospecting,
  qualification, negotiation, and closed-won.

Such a system must be multi-tenant and horizontally scalable.

- The API gateway authenticates each request, resolves the tenant, and routes to
  the right microservice.
- The CRM DB is a sharded relational store keyed by tenant ID, so queries for
  all accounts owned by a given rep stay within one shard and never scan the
  cluster.
- Read-heavy workloads such as list views and dashboards are served from caches
  and read replicas to keep the hot path off the primary database.
- Because reps open dozens of records per minute, the API tier is stateless so
  any gateway can serve any tenant, and records use optimistic locking to
  prevent lost updates when two reps edit the same account concurrently.

The hard problems are metadata-driven customization, reporting latency, and
external integration.

- Enterprises expect to add custom fields and objects without a schema
  migration, which points to an extension table or JSONB layer on top of the
  core tables.
- Forecasting requires materializing pipeline data into an analytics store so
  executives can slice by team, region, or quarter without hammering the
  operational database.
- Finally, email sync and notifications are asynchronous: an Email Sync worker
  pulls mailbox messages, links them to the right contact, and appends them to
  the activity timeline, while the notification service fans out alerts for
  mentions, follow-up reminders, and stage changes through a queue.
- That separation keeps the interactive path snappy and makes the platform feel
  real-time to the rep..
- This keeps latency off the interactive request and makes
  the system resilient, because a stalled mail worker does not block saving an
  opportunity.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: CRM
sales: Sales Rep
app: CRM App
gateway: API Gateway
lead: Lead Service
contact: Contact Service
account: Account Service
opp: Opportunity Service
pipeline: Pipeline Engine
report: Reports & Dashboards
mail: Email Sync
notify: Notifications
db: CRM DB

sales ─► app ─► log activity
app ─► gateway ─► save
gateway ─► lead ─► capture
gateway ─► contact ─► update
lead ─► opp ─► convert
contact ─► account ─► associate
opp ─► pipeline ─► stage
pipeline ─► report ─► forecast
mail ─► contact ─► sync
report ─► notify ─► alert
lead ─► db ─► store
```

## Design

### Design a customer relationship management system

A CRM platform like Salesforce centralizes how a sales organization captures and
manages every interaction with prospects and customers.

- The core object model starts with a lead, an unqualified person or company
  captured from web forms, events, or imported lists.
- When a sales rep qualifies a lead, the system converts it into canonical
  records: a contact for the individual and an account for the company, while
  simultaneously opening an opportunity, the revenue-bearing deal.
- The diagram shows this flow: the Lead Service captures new leads, the Contact
  Service keeps profiles current, the Opportunity Service holds the deal record,
  and the Pipeline Engine moves deals through stages such as prospecting,
  qualification, negotiation, and closed-won.

Such a system must be multi-tenant and horizontally scalable.

- The API gateway authenticates each request, resolves the tenant, and routes to
  the right microservice.
- The CRM DB is a sharded relational store keyed by tenant ID, so queries for
  all accounts owned by a given rep stay within one shard and never scan the
  cluster.
- Read-heavy workloads such as list views and dashboards are served from caches
  and read replicas to keep the hot path off the primary database.
- Because reps open dozens of records per minute, the API tier is stateless so
  any gateway can serve any tenant, and records use optimistic locking to
  prevent lost updates when two reps edit the same account concurrently.

The hard problems are metadata-driven customization, reporting latency, and
external integration.

- Enterprises expect to add custom fields and objects without a schema
  migration, which points to an extension table or JSONB layer on top of the
  core tables.
- Forecasting requires materializing pipeline data into an analytics store so
  executives can slice by team, region, or quarter without hammering the
  operational database.
- Finally, email sync and notifications are asynchronous: an Email Sync worker
  pulls mailbox messages, links them to the right contact, and appends them to
  the activity timeline, while the notification service fans out alerts for
  mentions, follow-up reminders, and stage changes through a queue.
- That separation keeps the interactive path snappy and makes the platform feel
  real-time to the rep.

### How do you model leads, contacts, and accounts?

The data model separates intent from identity.

- A lead is a raw, unqualified record carrying minimal information such as name,
  company, email, and source; it is disposable and frequently duplicated, since
  the same prospect may fill out several forms.
- The moment a rep qualifies a lead, the system converts it into canonical
  records.
- A contact represents a person, an account represents the company that person
  works for, and a role table links the two so a person can move between
  companies or hold multiple roles.
- This normalization avoids duplication: one account can have many contacts, one
  contact can belong to many accounts through a junction table, and an
  opportunity always references a contact, an account, or both.

The conversion flow must be idempotent and duplicate-aware.

- When a lead is converted, the system matches it against existing contacts and
  accounts using normalized email and domain keys, then either merges into the
  existing record or creates a new one.
- In the diagram this is the convert edge from lead to opportunity and the
  associate edge from contact to account.
- Under the hood it is a transaction: the lead is marked converted, the contact
  and account rows are inserted or updated, and the opportunity is created
  atomically, so a midway failure cannot leave the data half-written.
- Field mappings are configurable because companies disagree about what
  qualifies as a lead versus a prospect, so the schema stores source fields and
  maps them through a template per conversion style.

Identity is also temporal.

- Contacts change employers, accounts get renamed, and email addresses go stale.
- The model therefore keeps both a current-state table for fast reads and an
  activity timeline that records every event on the record.
- Deduplication runs at ingest time using deterministic keys such as email and
  phone, and again as a background job that groups likely duplicates by fuzzy
  matching and suggests merges for human approval.
- The design trades storage for correctness: canonical identity tables plus an
  append-only activity log make every record cheap to read and every historical
  question answerable.

### How do you track sales pipelines and forecasts?

Pipeline tracking is a state machine. Every opportunity carries a stage, an
amount, and a close date, and the Pipeline Engine enforces legal transitions,
such as disallowing a move from closed-won back to negotiation without approval.
As deals change stage, the engine writes stage history and recomputes derived
metrics like pipeline value, weighted amount, and stage conversion rates.
Because reps update opportunities constantly, the pipeline table must serve
high-write, high-read traffic; a normalized current-state table holds the live
stage while a history table appends every change for auditing and reporting.

Forecasting builds on pipeline data but is a distinct concern. A forecast is a
revenue projection over a period, computed by summing opportunity amounts
weighted by stage probability and adjusted by historical close rates per rep and
region. Rather than calculating this live from the operational database, a
scheduled job materializes pipeline snapshots into an analytics warehouse, where
executives query trends, pipeline coverage, and expected closes. This separation
keeps the rep-facing screen interactive while returning forecast answers in
seconds. The forecast edge from the pipeline engine to the reports and
dashboards service captures that materialization step.

The subtle parts are uncertainty and time. Close dates slip, deal values change,
and probabilities are subjective. A robust system stores stage timestamps and
amount history so forecasts can be recomputed as of any date, and it surfaces
forecast variance rather than a single point estimate. Reports and dashboards
are decoupled and can feed many BI tools, so revising a probability curve or
adding a new forecast model does not touch the operational path. Finally, an
alerting layer notifies owners when a high-value deal stagnates in a stage or
the pipeline dips below target.

### How do you support custom objects and fields?

Supporting customization without breaking the core schema is the defining
constraint of an enterprise CRM. The standard approach is a hybrid model: base
tables keep strongly typed core columns such as name, owner, amount, and stage
for hot paths, while an extension table stores custom attributes keyed by record
type. Implementations range from sparse column tables, where each nullable slot
is a typed column, to generic key-value tables and JSONB documents. Sparse
columns give type safety and indexability at the cost of many nulls; JSONB is
flexible but slower to query and index. Mature platforms typically expose custom
fields as columns in a per-object extension table, backed by a central metadata
registry.

That registry is what makes customization feel like a product feature. It
defines object names, field names, field types, picklist values, required flags,
and page layouts. When a rep opens an edit form, the app fetches the metadata
for that object and renders fields dynamically, so adding a field needs no code
deploy. All record operations go through a generic API: read and write custom
fields by name, validate against the metadata types, and index only the fields a
tenant marks as filterable. Because metadata can diverge wildly between tenants,
the registry is cached by tenant ID and invalidated on schema change, a rare
event compared with data writes.

Customization leaks into every layer. Search must index custom fields so a rep
can filter on them, reporting must join custom data into dashboards, and the
model must record which standard fields a tenant has disabled. Custom objects
also need their own permission rules, so they inherit the same ACL model as
standard objects. The tradeoff is complexity: every layer depends on the
metadata registry, and a tenant schema change can ripple into a reindex. The
mitigations are to serve metadata from an immutable, versioned cache within a
session and to run background reindexing so the interactive path never blocks on
schema evolution.

### How do you integrate email and notifications?

Email acts as both input and output. As input, reps want every relevant message
attached to the right contact. The Email Sync service connects to a rep mailbox
over IMAP or a provider API, fetches new messages, and runs them through a
parsing step that extracts sender, recipients, subject, and body. A resolver
maps those addresses to contacts using the same identity tables used during lead
conversion, then creates an activity record and threads the message into the
timeline. Because mailboxes change continuously, sync runs as a per-mailbox
worker with pagination and change markers so a crash only re-fetches a small
window of messages.

As output, notifications cover mentions, assignment changes, approaching
follow-ups, and stage milestones. The notification service subscribes to domain
events published by the other services, fans out to the relevant users through a
queue, and delivers over several channels including the in-app feed, email
digests, and mobile push. Rate limits prevent a burst of updates from becoming
spam; editing ten fields on one record produces one coalesced notification
rather than ten. Idempotency keys and deduplication matter because delivery
retries are common.

The glue is an event bus. Services do not call email or notification systems
synchronously on the critical path; instead they publish events that workers
consume asynchronously. This keeps latency off the interactive request and makes
the system resilient, because a stalled mail worker does not block saving an
opportunity. The tradeoff is eventual consistency: a rep may see a record saved
before its email arrives in the timeline, which is acceptable here. Bounce
handling, digest unsubscribes, and per-user channel preferences all funnel
through the same delivery pipeline, giving operators one place to reason about
deliverability and load.

## Source

```text
title: CRM
node sales: Sales Rep [round, icon=browser]
node app: CRM App [icon=browser]
node gateway: API Gateway [icon=server]
node lead: Lead Service [icon=compute]
node contact: Contact Service [icon=users]
node account: Account Service [icon=compute]
node opp: Opportunity Service [icon=compute]
node pipeline: Pipeline Engine [icon=compute]
node report: Reports & Dashboards [icon=file]
node mail: Email Sync [icon=mail]
node notify: Notifications [icon=message]
node db: CRM DB [cylinder, icon=database]

edge sales -> app: log activity
edge app -> gateway: save
edge gateway -> lead: capture
edge gateway -> contact: update
edge lead -> opp: convert
edge contact -> account: associate
edge opp -> pipeline: stage
edge pipeline -> report: forecast
edge mail -> contact: sync
edge report -> notify: alert
edge lead -> db: store
```

## Q&A

### Q: Design a customer relationship management system

**A:** A CRM platform like Salesforce centralizes how a sales organization captures and
manages every interaction with prospects and customers.

- The core object model starts with a lead, an unqualified person or company
  captured from web forms, events, or imported lists.
- When a sales rep qualifies a lead, the system converts it into canonical
  records: a contact for the individual and an account for the company, while
  simultaneously opening an opportunity, the revenue-bearing deal.
- The diagram shows this flow: the Lead Service captures new leads, the Contact
  Service keeps profiles current, the Opportunity Service holds the deal record,
  and the Pipeline Engine moves deals through stages such as prospecting,
  qualification, negotiation, and closed-won.

Such a system must be multi-tenant and horizontally scalable.

- The API gateway authenticates each request, resolves the tenant, and routes to
  the right microservice.
- The CRM DB is a sharded relational store keyed by tenant ID, so queries for
  all accounts owned by a given rep stay within one shard and never scan the
  cluster.
- Read-heavy workloads such as list views and dashboards are served from caches
  and read replicas to keep the hot path off the primary database.
- Because reps open dozens of records per minute, the API tier is stateless so
  any gateway can serve any tenant, and records use optimistic locking to
  prevent lost updates when two reps edit the same account concurrently.

The hard problems are metadata-driven customization, reporting latency, and
external integration.

- Enterprises expect to add custom fields and objects without a schema
  migration, which points to an extension table or JSONB layer on top of the
  core tables.
- Forecasting requires materializing pipeline data into an analytics store so
  executives can slice by team, region, or quarter without hammering the
  operational database.
- Finally, email sync and notifications are asynchronous: an Email Sync worker
  pulls mailbox messages, links them to the right contact, and appends them to
  the activity timeline, while the notification service fans out alerts for
  mentions, follow-up reminders, and stage changes through a queue.
- That separation keeps the interactive path snappy and makes the platform feel
  real-time to the rep.

### Q: How do you model leads, contacts, and accounts?

**A:** The data model separates intent from identity.

- A lead is a raw, unqualified record carrying minimal information such as name,
  company, email, and source; it is disposable and frequently duplicated, since
  the same prospect may fill out several forms.
- The moment a rep qualifies a lead, the system converts it into canonical
  records.
- A contact represents a person, an account represents the company that person
  works for, and a role table links the two so a person can move between
  companies or hold multiple roles.
- This normalization avoids duplication: one account can have many contacts, one
  contact can belong to many accounts through a junction table, and an
  opportunity always references a contact, an account, or both.

The conversion flow must be idempotent and duplicate-aware.

- When a lead is converted, the system matches it against existing contacts and
  accounts using normalized email and domain keys, then either merges into the
  existing record or creates a new one.
- In the diagram this is the convert edge from lead to opportunity and the
  associate edge from contact to account.
- Under the hood it is a transaction: the lead is marked converted, the contact
  and account rows are inserted or updated, and the opportunity is created
  atomically, so a midway failure cannot leave the data half-written.
- Field mappings are configurable because companies disagree about what
  qualifies as a lead versus a prospect, so the schema stores source fields and
  maps them through a template per conversion style.

Identity is also temporal.

- Contacts change employers, accounts get renamed, and email addresses go stale.
- The model therefore keeps both a current-state table for fast reads and an
  activity timeline that records every event on the record.
- Deduplication runs at ingest time using deterministic keys such as email and
  phone, and again as a background job that groups likely duplicates by fuzzy
  matching and suggests merges for human approval.
- The design trades storage for correctness: canonical identity tables plus an
  append-only activity log make every record cheap to read and every historical
  question answerable.

### Q: How do you track sales pipelines and forecasts?

**A:** Pipeline tracking is a state machine. Every opportunity carries a stage, an
amount, and a close date, and the Pipeline Engine enforces legal transitions,
such as disallowing a move from closed-won back to negotiation without approval.
As deals change stage, the engine writes stage history and recomputes derived
metrics like pipeline value, weighted amount, and stage conversion rates.
Because reps update opportunities constantly, the pipeline table must serve
high-write, high-read traffic; a normalized current-state table holds the live
stage while a history table appends every change for auditing and reporting.

Forecasting builds on pipeline data but is a distinct concern. A forecast is a
revenue projection over a period, computed by summing opportunity amounts
weighted by stage probability and adjusted by historical close rates per rep and
region. Rather than calculating this live from the operational database, a
scheduled job materializes pipeline snapshots into an analytics warehouse, where
executives query trends, pipeline coverage, and expected closes. This separation
keeps the rep-facing screen interactive while returning forecast answers in
seconds. The forecast edge from the pipeline engine to the reports and
dashboards service captures that materialization step.

The subtle parts are uncertainty and time. Close dates slip, deal values change,
and probabilities are subjective. A robust system stores stage timestamps and
amount history so forecasts can be recomputed as of any date, and it surfaces
forecast variance rather than a single point estimate. Reports and dashboards
are decoupled and can feed many BI tools, so revising a probability curve or
adding a new forecast model does not touch the operational path. Finally, an
alerting layer notifies owners when a high-value deal stagnates in a stage or
the pipeline dips below target.

### Q: How do you support custom objects and fields?

**A:** Supporting customization without breaking the core schema is the defining
constraint of an enterprise CRM. The standard approach is a hybrid model: base
tables keep strongly typed core columns such as name, owner, amount, and stage
for hot paths, while an extension table stores custom attributes keyed by record
type. Implementations range from sparse column tables, where each nullable slot
is a typed column, to generic key-value tables and JSONB documents. Sparse
columns give type safety and indexability at the cost of many nulls; JSONB is
flexible but slower to query and index. Mature platforms typically expose custom
fields as columns in a per-object extension table, backed by a central metadata
registry.

That registry is what makes customization feel like a product feature. It
defines object names, field names, field types, picklist values, required flags,
and page layouts. When a rep opens an edit form, the app fetches the metadata
for that object and renders fields dynamically, so adding a field needs no code
deploy. All record operations go through a generic API: read and write custom
fields by name, validate against the metadata types, and index only the fields a
tenant marks as filterable. Because metadata can diverge wildly between tenants,
the registry is cached by tenant ID and invalidated on schema change, a rare
event compared with data writes.

Customization leaks into every layer. Search must index custom fields so a rep
can filter on them, reporting must join custom data into dashboards, and the
model must record which standard fields a tenant has disabled. Custom objects
also need their own permission rules, so they inherit the same ACL model as
standard objects. The tradeoff is complexity: every layer depends on the
metadata registry, and a tenant schema change can ripple into a reindex. The
mitigations are to serve metadata from an immutable, versioned cache within a
session and to run background reindexing so the interactive path never blocks on
schema evolution.

### Q: How do you integrate email and notifications?

**A:** Email acts as both input and output. As input, reps want every relevant message
attached to the right contact. The Email Sync service connects to a rep mailbox
over IMAP or a provider API, fetches new messages, and runs them through a
parsing step that extracts sender, recipients, subject, and body. A resolver
maps those addresses to contacts using the same identity tables used during lead
conversion, then creates an activity record and threads the message into the
timeline. Because mailboxes change continuously, sync runs as a per-mailbox
worker with pagination and change markers so a crash only re-fetches a small
window of messages.

As output, notifications cover mentions, assignment changes, approaching
follow-ups, and stage milestones. The notification service subscribes to domain
events published by the other services, fans out to the relevant users through a
queue, and delivers over several channels including the in-app feed, email
digests, and mobile push. Rate limits prevent a burst of updates from becoming
spam; editing ten fields on one record produces one coalesced notification
rather than ten. Idempotency keys and deduplication matter because delivery
retries are common.

The glue is an event bus. Services do not call email or notification systems
synchronously on the critical path; instead they publish events that workers
consume asynchronously. This keeps latency off the interactive request and makes
the system resilient, because a stalled mail worker does not block saving an
opportunity. The tradeoff is eventual consistency: a rep may see a record saved
before its email arrives in the timeline, which is acceptable here. Bounce
handling, digest unsubscribes, and per-user channel preferences all funnel
through the same delivery pipeline, giving operators one place to reason about
deliverability and load.

## Source

```text
title: CRM
node sales: Sales Rep [round, icon=browser]
node app: CRM App [icon=browser]
node gateway: API Gateway [icon=server]
node lead: Lead Service [icon=compute]
node contact: Contact Service [icon=users]
node account: Account Service [icon=compute]
node opp: Opportunity Service [icon=compute]
node pipeline: Pipeline Engine [icon=compute]
node report: Reports & Dashboards [icon=file]
node mail: Email Sync [icon=mail]
node notify: Notifications [icon=message]
node db: CRM DB [cylinder, icon=database]

edge sales -> app: log activity
edge app -> gateway: save
edge gateway -> lead: capture
edge gateway -> contact: update
edge lead -> opp: convert
edge contact -> account: associate
edge opp -> pipeline: stage
edge pipeline -> report: forecast
edge mail -> contact: sync
edge report -> notify: alert
edge lead -> db: store
```
