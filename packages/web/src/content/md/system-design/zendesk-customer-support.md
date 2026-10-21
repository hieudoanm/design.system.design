# Zendesk — Customer Support

Design a customer support / ticketing system

**Difficulty:** Hard

**Tags:** messaging, realtime

## Functional Requirements

- a customer support / ticketing system
- route tickets to the right agent?
- build the knowledge base and search?
- power live chat at scale?
- track SLAs and agent metrics?

## Non-Functional Requirements

- Routing is a decision problem with business rules on one side and operational
  state on the other.

- Every ticket carries attributes: channel, language, priority, product area,
  customer tier, and any skills required to answer it.
- The Routing Engine evaluates a policy that maps these attributes to candidate
  agents, for example language and product-match rules that companies configure
  in the admin UI.
- The engine then scores the candidates against live state: current workload,
  skills, availability, timezone, and past performance.
- The highest-scoring available agent receives the assignment, or the ticket is
  placed in a queue when no agent qualifies right now.

The scoring model must balance fairness with efficiency.

- Routing solely to the least-loaded agent can send a ticket to someone
  unqualified; routing to the most skilled agent can overload a handful of
  experts.
- Most platforms therefore use weighted scoring where skill match dominates,
  then workload and idle time break ties, and round-robin among equal scores
  prevents bias.
- Because agent state changes constantly, scoring uses a snapshot cache of agent
  status and queue depth with a short TTL, so the engine does not query the
  database for every ticket.
- Assignments are conditional: the engine reserves an agent for the ticket and
  only commits when the agent accepts, releasing the reservation if it times
  out.

The hard cases are escalations and VIP handling.

- A ticket whose SLA is about to breach must jump the queue and preempt
  lower-priority work.
- A customer from an enterprise tier expects the same agent who handled their
  last ticket, so the router consults a sticky-assignment table linking repeat
  customers to their prior agents.
- Finally, routing decisions must be auditable: each assignment logs the inputs,
  the policy version, and the scores, so a manager can see why a ticket landed
  where it did and adjust the rules without touching code..
- Co-browsing and agent-to-agent handoff are implemented as special
  message types on the same channel rather than separate systems.

Chat introduces latency expectations that email does not have.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Customer Support
customer: Customer
app: Support Portal
gateway: API Gateway
ticket: Ticket Service
routing: Routing Engine
agent: Agent Workspace
kb: Knowledge Base
chat: Live Chat
sla: SLA Tracker
notify: Notifications
db: Tickets DB

customer ─► app ─► submit ticket
app ─► gateway ─► request
gateway ─► ticket ─► create
ticket ─► routing ─► assign
routing ─► agent ─► queue
agent ─► ticket ─► respond
kb ─► agent ─► suggestions
customer ─► chat ─► message
chat ─► agent ─► stream
ticket ─► sla ─► monitor
sla ─► notify ─► escalate
ticket ─► db ─► store
```

## Design

### Design a customer support / ticketing system

A customer support platform such as Zendesk turns every customer interaction
into a ticket, the unit of work an agent can pick up, resolve, and measure.

- Tickets arrive from email, web forms, chat, phone, and social channels, so the
  first job of the system is normalization: every inbound message becomes a
  ticket with a channel, requester, subject, and body, regardless of origin.
- The Ticket Service owns the ticket record, the Routing Engine decides which
  agent or queue it goes to, the Agent Workspace presents a working view, and
  the SLA Tracker watches deadlines.
- The API gateway is the single entry point for all clients and internal
  services.

The architecture is event-driven from the start.

- Creating a ticket writes the record to the Tickets DB, a relational store
  partitioned by tenant, and then publishes an event so that routing, SLA
  monitoring, and notifications all react asynchronously.
- This matters because a ticket can trigger many downstream actions: an
  assignment, an auto-reply, a satisfaction survey, a knowledge base suggestion,
  and an SLA clock all start at creation.
- If those were done synchronously the request path would be slow and fragile,
  so each subscriber consumes the event independently and the routing decision
  can be re-run if an agent goes offline.

Reads are the other half of the workload.

- Agents poll for new work, search past tickets, and open knowledge base
  articles while composing a reply.
- The Ticket Service serves current state from the database, while a search
  index handles full-text lookup over ticket content, and a cache serves the
  most recently viewed tickets and agent queues.
- Multi-tenancy is enforced at every layer through tenant-scoped keys, because
  one noisy tenant must never be able to degrade another's queries.
- The end result is a system where creation is fast, assignment is fair, and
  agents can always see the full picture of a customer's history.

### How do you route tickets to the right agent?

Routing is a decision problem with business rules on one side and operational
state on the other.

- Every ticket carries attributes: channel, language, priority, product area,
  customer tier, and any skills required to answer it.
- The Routing Engine evaluates a policy that maps these attributes to candidate
  agents, for example language and product-match rules that companies configure
  in the admin UI.
- The engine then scores the candidates against live state: current workload,
  skills, availability, timezone, and past performance.
- The highest-scoring available agent receives the assignment, or the ticket is
  placed in a queue when no agent qualifies right now.

The scoring model must balance fairness with efficiency.

- Routing solely to the least-loaded agent can send a ticket to someone
  unqualified; routing to the most skilled agent can overload a handful of
  experts.
- Most platforms therefore use weighted scoring where skill match dominates,
  then workload and idle time break ties, and round-robin among equal scores
  prevents bias.
- Because agent state changes constantly, scoring uses a snapshot cache of agent
  status and queue depth with a short TTL, so the engine does not query the
  database for every ticket.
- Assignments are conditional: the engine reserves an agent for the ticket and
  only commits when the agent accepts, releasing the reservation if it times
  out.

The hard cases are escalations and VIP handling.

- A ticket whose SLA is about to breach must jump the queue and preempt
  lower-priority work.
- A customer from an enterprise tier expects the same agent who handled their
  last ticket, so the router consults a sticky-assignment table linking repeat
  customers to their prior agents.
- Finally, routing decisions must be auditable: each assignment logs the inputs,
  the policy version, and the scores, so a manager can see why a ticket landed
  where it did and adjust the rules without touching code.

### How do you build the knowledge base and search?

The knowledge base is a corpus of help articles that agents and customers share,
and its value depends on retrieval quality. Articles are authored in a
structured format with title, body, category, and metadata like product and
audience, and they are versioned so edits never destroy history. The search
index ingests articles and enriches them with synonyms, article type, and
popularity signals. Queries are then matched against this index, using relevance
features that include TF-IDF, semantic embeddings for intent matching, and
click-through data that promotes articles which resolved tickets.

Suggestions appear in two places. While a customer types a support request, the
system shows related articles to deflect the ticket before it is created. While
an agent writes a reply, the system suggests articles that answer the ticket,
often with a one-click insert into the response. Both flows share the same
retrieval service but apply different ranking: deflection favors the most
general, popular articles, while agent suggestions favor the most specific,
recently effective ones. A feedback loop captures whether a suggested article
actually closed a ticket, and that signal is folded back into the ranker.

The difficult part is measuring effectiveness. Platforms track deflection rate,
the share of customers whose search never becomes a ticket, and self-service
success, whether customers who read an article stopped needing an agent. These
metrics let a team know when an article is stale or missing. The system also
handles multilingual content by indexing each language separately and routing
queries by the detected language of the requester. Finally, permissions apply to
search: internal-only articles are excluded from the customer index, so a single
query path must always carry the requester's role and filter documents at query
time.

### How do you power live chat at scale?

Live chat is a real-time interaction layered on top of the same ticket
infrastructure. When a customer opens a chat, the Live Chat service creates a
session and a routing decision assigns a free agent. Messages flow over
WebSockets through a gateway, which maintains a long-lived connection per
participant. The key architectural choice is to make the chat transport
stateless: the gateway only pipes bytes, while the authoritative conversation
history lives in the Tickets DB and is replayed to any client that connects or
reconnects. This lets the gateway scale horizontally, adding nodes as the number
of concurrent chats grows, without owning durable state.

Concurrency is the metric that matters. Each chat occupies one agent but many
connections, and a platform serving thousands of concurrent chats needs a
gateway tier that shards by session. Connection state, such as which gateway
node serves a session, is kept in a shared store so any node can find any
session. Message ordering is enforced with a per-session sequence number, and
the server stamps arrival time so the transcript reflects reality even when two
messages race. Co-browsing and agent-to-agent handoff are implemented as special
message types on the same channel rather than separate systems.

Chat introduces latency expectations that email does not have. Agents see a
typing indicator, the customer waits in a queue with an estimated wait time, and
a bot may handle the first turn to collect context before a human joins. The
system must therefore publish presence and queue-depth updates frequently,
usually by streaming those metrics through the same push channel. If the
customer drops off, the session is persisted as a ticket and escalated to email
follow-up so the conversation is never lost. Monitoring covers message latency,
connect failures, and queue wait, because a chat experience dies quietly when
any link in the chain degrades.

### How do you track SLAs and agent metrics?

SLA tracking turns support quality into measurable deadlines. Each plan defines
targets such as first response within one hour or resolution within four
business hours, scoped by priority and customer tier. When a ticket is created
or updated, the SLA Tracker computes the target times and starts the relevant
clocks: time to first response, time to resolution, and time to follow-up. The
clocks pause and resume based on events, because a ticket waiting on the
customer should not count against the agent. Only approved pause states, such as
pending customer reply, stop the clock; everything else keeps ticking.

Breach prevention is the real purpose. The tracker continuously evaluates each
open ticket against its remaining time and emits warning and breach events.
Those events drive the notification system to alert the assigned agent, and
beyond a threshold, to escalate to the team lead or re-route the ticket to a
manager queue. Because checking every ticket against its SLA on every event
would be expensive, the tracker maintains a min-heap ordered by next-breach
time; a single scheduler wakes on the earliest deadline, and each event only
recomputes the affected tickets. This keeps SLA evaluation near-constant in cost
as ticket volume grows.

Agent metrics are a reporting layer over the same event stream. Every action an
agent takes, a reply, a status change, a resolution, produces an event that an
analytics pipeline aggregates into dashboards: tickets per hour, first response
time, CSAT, resolution rate, and reopens. The pipeline buckets events by day and
by agent, then materializes summaries so manager queries stay fast. One subtlety
is attribution: a ticket handled by several agents attributes first response to
one and resolution to another, so the metrics schema records role and time
explicitly. Accuracy matters more than prettiness here, because compensation and
coaching decisions rest on these numbers.

## Source

```text
title: Customer Support
node customer: Customer [round, icon=browser]
node app: Support Portal [icon=browser]
node gateway: API Gateway [icon=server]
node ticket: Ticket Service [icon=compute]
node routing: Routing Engine [icon=compute]
node agent: Agent Workspace [icon=users]
node kb: Knowledge Base [icon=search]
node chat: Live Chat [icon=message]
node sla: SLA Tracker [icon=cache]
node notify: Notifications [icon=message]
node db: Tickets DB [cylinder, icon=database]

edge customer -> app: submit ticket
edge app -> gateway: request
edge gateway -> ticket: create
edge ticket -> routing: assign
edge routing -> agent: queue
edge agent -> ticket: respond
edge kb -> agent: suggestions
edge customer -> chat: message
edge chat -> agent: stream
edge ticket -> sla: monitor
edge sla -> notify: escalate
edge ticket -> db: store
```

## Q&A

### Q: Design a customer support / ticketing system

**A:** A customer support platform such as Zendesk turns every customer interaction
into a ticket, the unit of work an agent can pick up, resolve, and measure.

- Tickets arrive from email, web forms, chat, phone, and social channels, so the
  first job of the system is normalization: every inbound message becomes a
  ticket with a channel, requester, subject, and body, regardless of origin.
- The Ticket Service owns the ticket record, the Routing Engine decides which
  agent or queue it goes to, the Agent Workspace presents a working view, and
  the SLA Tracker watches deadlines.
- The API gateway is the single entry point for all clients and internal
  services.

The architecture is event-driven from the start.

- Creating a ticket writes the record to the Tickets DB, a relational store
  partitioned by tenant, and then publishes an event so that routing, SLA
  monitoring, and notifications all react asynchronously.
- This matters because a ticket can trigger many downstream actions: an
  assignment, an auto-reply, a satisfaction survey, a knowledge base suggestion,
  and an SLA clock all start at creation.
- If those were done synchronously the request path would be slow and fragile,
  so each subscriber consumes the event independently and the routing decision
  can be re-run if an agent goes offline.

Reads are the other half of the workload.

- Agents poll for new work, search past tickets, and open knowledge base
  articles while composing a reply.
- The Ticket Service serves current state from the database, while a search
  index handles full-text lookup over ticket content, and a cache serves the
  most recently viewed tickets and agent queues.
- Multi-tenancy is enforced at every layer through tenant-scoped keys, because
  one noisy tenant must never be able to degrade another's queries.
- The end result is a system where creation is fast, assignment is fair, and
  agents can always see the full picture of a customer's history.

### Q: How do you route tickets to the right agent?

**A:** Routing is a decision problem with business rules on one side and operational
state on the other.

- Every ticket carries attributes: channel, language, priority, product area,
  customer tier, and any skills required to answer it.
- The Routing Engine evaluates a policy that maps these attributes to candidate
  agents, for example language and product-match rules that companies configure
  in the admin UI.
- The engine then scores the candidates against live state: current workload,
  skills, availability, timezone, and past performance.
- The highest-scoring available agent receives the assignment, or the ticket is
  placed in a queue when no agent qualifies right now.

The scoring model must balance fairness with efficiency.

- Routing solely to the least-loaded agent can send a ticket to someone
  unqualified; routing to the most skilled agent can overload a handful of
  experts.
- Most platforms therefore use weighted scoring where skill match dominates,
  then workload and idle time break ties, and round-robin among equal scores
  prevents bias.
- Because agent state changes constantly, scoring uses a snapshot cache of agent
  status and queue depth with a short TTL, so the engine does not query the
  database for every ticket.
- Assignments are conditional: the engine reserves an agent for the ticket and
  only commits when the agent accepts, releasing the reservation if it times
  out.

The hard cases are escalations and VIP handling.

- A ticket whose SLA is about to breach must jump the queue and preempt
  lower-priority work.
- A customer from an enterprise tier expects the same agent who handled their
  last ticket, so the router consults a sticky-assignment table linking repeat
  customers to their prior agents.
- Finally, routing decisions must be auditable: each assignment logs the inputs,
  the policy version, and the scores, so a manager can see why a ticket landed
  where it did and adjust the rules without touching code.

### Q: How do you build the knowledge base and search?

**A:** The knowledge base is a corpus of help articles that agents and customers share,
and its value depends on retrieval quality. Articles are authored in a
structured format with title, body, category, and metadata like product and
audience, and they are versioned so edits never destroy history. The search
index ingests articles and enriches them with synonyms, article type, and
popularity signals. Queries are then matched against this index, using relevance
features that include TF-IDF, semantic embeddings for intent matching, and
click-through data that promotes articles which resolved tickets.

Suggestions appear in two places. While a customer types a support request, the
system shows related articles to deflect the ticket before it is created. While
an agent writes a reply, the system suggests articles that answer the ticket,
often with a one-click insert into the response. Both flows share the same
retrieval service but apply different ranking: deflection favors the most
general, popular articles, while agent suggestions favor the most specific,
recently effective ones. A feedback loop captures whether a suggested article
actually closed a ticket, and that signal is folded back into the ranker.

The difficult part is measuring effectiveness. Platforms track deflection rate,
the share of customers whose search never becomes a ticket, and self-service
success, whether customers who read an article stopped needing an agent. These
metrics let a team know when an article is stale or missing. The system also
handles multilingual content by indexing each language separately and routing
queries by the detected language of the requester. Finally, permissions apply to
search: internal-only articles are excluded from the customer index, so a single
query path must always carry the requester's role and filter documents at query
time.

### Q: How do you power live chat at scale?

**A:** Live chat is a real-time interaction layered on top of the same ticket
infrastructure. When a customer opens a chat, the Live Chat service creates a
session and a routing decision assigns a free agent. Messages flow over
WebSockets through a gateway, which maintains a long-lived connection per
participant. The key architectural choice is to make the chat transport
stateless: the gateway only pipes bytes, while the authoritative conversation
history lives in the Tickets DB and is replayed to any client that connects or
reconnects. This lets the gateway scale horizontally, adding nodes as the number
of concurrent chats grows, without owning durable state.

Concurrency is the metric that matters. Each chat occupies one agent but many
connections, and a platform serving thousands of concurrent chats needs a
gateway tier that shards by session. Connection state, such as which gateway
node serves a session, is kept in a shared store so any node can find any
session. Message ordering is enforced with a per-session sequence number, and
the server stamps arrival time so the transcript reflects reality even when two
messages race. Co-browsing and agent-to-agent handoff are implemented as special
message types on the same channel rather than separate systems.

Chat introduces latency expectations that email does not have. Agents see a
typing indicator, the customer waits in a queue with an estimated wait time, and
a bot may handle the first turn to collect context before a human joins. The
system must therefore publish presence and queue-depth updates frequently,
usually by streaming those metrics through the same push channel. If the
customer drops off, the session is persisted as a ticket and escalated to email
follow-up so the conversation is never lost. Monitoring covers message latency,
connect failures, and queue wait, because a chat experience dies quietly when
any link in the chain degrades.

### Q: How do you track SLAs and agent metrics?

**A:** SLA tracking turns support quality into measurable deadlines. Each plan defines
targets such as first response within one hour or resolution within four
business hours, scoped by priority and customer tier. When a ticket is created
or updated, the SLA Tracker computes the target times and starts the relevant
clocks: time to first response, time to resolution, and time to follow-up. The
clocks pause and resume based on events, because a ticket waiting on the
customer should not count against the agent. Only approved pause states, such as
pending customer reply, stop the clock; everything else keeps ticking.

Breach prevention is the real purpose. The tracker continuously evaluates each
open ticket against its remaining time and emits warning and breach events.
Those events drive the notification system to alert the assigned agent, and
beyond a threshold, to escalate to the team lead or re-route the ticket to a
manager queue. Because checking every ticket against its SLA on every event
would be expensive, the tracker maintains a min-heap ordered by next-breach
time; a single scheduler wakes on the earliest deadline, and each event only
recomputes the affected tickets. This keeps SLA evaluation near-constant in cost
as ticket volume grows.

Agent metrics are a reporting layer over the same event stream. Every action an
agent takes, a reply, a status change, a resolution, produces an event that an
analytics pipeline aggregates into dashboards: tickets per hour, first response
time, CSAT, resolution rate, and reopens. The pipeline buckets events by day and
by agent, then materializes summaries so manager queries stay fast. One subtlety
is attribution: a ticket handled by several agents attributes first response to
one and resolution to another, so the metrics schema records role and time
explicitly. Accuracy matters more than prettiness here, because compensation and
coaching decisions rest on these numbers.

## Source

```text
title: Customer Support
node customer: Customer [round, icon=browser]
node app: Support Portal [icon=browser]
node gateway: API Gateway [icon=server]
node ticket: Ticket Service [icon=compute]
node routing: Routing Engine [icon=compute]
node agent: Agent Workspace [icon=users]
node kb: Knowledge Base [icon=search]
node chat: Live Chat [icon=message]
node sla: SLA Tracker [icon=cache]
node notify: Notifications [icon=message]
node db: Tickets DB [cylinder, icon=database]

edge customer -> app: submit ticket
edge app -> gateway: request
edge gateway -> ticket: create
edge ticket -> routing: assign
edge routing -> agent: queue
edge agent -> ticket: respond
edge kb -> agent: suggestions
edge customer -> chat: message
edge chat -> agent: stream
edge ticket -> sla: monitor
edge sla -> notify: escalate
edge ticket -> db: store
```
