# Email Delivery Service

Design an email delivery service

**Difficulty:** Medium

**Tags:** email

## Functional Requirements

- an email delivery service
- ensure high deliverability?
- manage sender reputation?
- handle bounces and complaints?
- prevent your service being used for spam?

## Non-Functional Requirements

- The service accepts a send request from an app, renders the email from a
  template, validates the recipient addresses, and hands the message to a queue.

- A fleet of sending agents consumes the queue and speaks SMTP to the receiving
  infrastructure (the recipient's MX servers), then tracks delivery, bounce, and
  open/click outcomes.
- The data plane is linear: Send API → template render → address validation →
  send queue → sending agent → SMTP → bounce and tracking feedback.
- Around it sit the reputation store, which records sender health, and an
  analytics pipeline that turns delivery events into reports.

The design choices are dominated by deliverability rather than raw throughput.

- Sending agents hold dedicated sender IPs and pool them by sender identity;
  messages are grouped by recipient domain and routed through separate IP pools
  so one abusive customer cannot poison another's reputation.
- Every message gets a unique message ID; tracking pixels and click links log
  opens and clicks.
- Bounce handling differentiates hard from soft bounces — hard bounces
  (permanent, e.g., unknown address) suppress the address, soft bounces
  (transient, e.g., mailbox full) are retried with backoff.
- The result is a system where delivery is observable end to end and where every
  sending decision is mediated by reputation, not just by SMTP mechanics.
- The queue is the reliability backbone: it is durable and at-least-once, so a
  sender-agent crash redelivers the message, and the delivery state machine
  (queued, sent, delivered, bounced, complained) is the single model that
  analytics, reputation, and the customer portal all read from..
- Deliverability is not a single feature; it is a set of practices across the
  whole stack.

- At the protocol level the service must pass authentication so receivers trust
  the mail: SPF (the sending IP is authorized for the domain), DKIM (the message
  is signed with a domain key), and DMARC (receivers know what to do with
  authentication failures).
- Without all three, major providers increasingly reject or quarantine mail
  regardless of content.
- Content matters too: rendering from validated templates, linking to real
  unsubscribe pages, and keeping a healthy image-to-text ratio reduce
  spam-filter classification risk.
- Replies and feedback loops must be accepted, because providers score domains
  partly on responsiveness.

Operationally, sending must be gentle.

- The service rate-limits per domain and per IP, honoring the limits the
  receiver states; it backs off on transient SMTP errors with exponential retry
  and rotates retries across IP pools.
- IP warming ramps new sending IPs from small to full volume over weeks so
  receivers build a trust history instead of seeing a sudden flood.
- Keep-alives and TLS make the SMTP sessions themselves reliable, and DNS
  records (MX, PTR for the IP, SPF, DKIM, DMARC) are validated before a pool can
  send.
- Finally, the feedback loop closes the circle: bounces, complaints, and
  spam-trap hits flow back into suppression lists and the reputation store, so a
  sender that repeatedly fails is automatically throttled before damage spreads
  to the pool.
- Monitoring ties it together: per-provider delivery rates, deferral codes, and
  time-to-inbox are graphed per pool, and a sustained drop in a provider's
  acceptance rate fires an alert so a reputation change is caught within hours,
  not weeks..
- Sender reputation is stored per sending identity — a combination of sender IP,
  sending domain, and customer — in the reputation store, updated from delivery
  outcomes.

- The core metric is a rolling window of hard-bounce rate, complaint rate,
  spam-trap hits, and unknown-user rate, compared against thresholds (common
  targets: under 2–3% bounces, under 0.1% complaints).
- Reputation is domain- and IP-specific, so the service maintains separate
  pools: a new customer starts on a low-volume pool with a warming schedule,
  graduates to the shared pool as their numbers improve, and is confined to an
  isolated pool or quarantined when their numbers degrade.
- A sending IP never changes owner, because an IP's history is its identity.

Reputation is managed proactively, not just reactively.

- The control plane applies per-pool sending limits, rotates IPs within a pool
  to avoid single-IP overload, and pauses a pool entirely when complaint or
  bounce rates spike.
- Bad actors are isolated so their problems never affect shared IPs.
- Reputation also feeds routing decisions: high-reputation traffic can use more
  aggressive parallelism and higher per-domain concurrency, while questionable
  traffic is throttled.
- Because reputation data changes slowly, it is cached and consulted on every
  send — cheap checks that prevent one bad day from becoming a blocked domain,
  and that let the service trade short-term throughput for long-term
  deliverability across the whole fleet.
- Reputation data also feeds the sender portal: customers see their bounce,
  complaint, and spam-trap rates against thresholds, so a customer can correct
  list-hygiene issues before the platform has to throttle them..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Email Delivery
sender: Sender
api: Send API
queue: Send Queue
template: Template Service
validate: Address Validator
agent: Sending Agent
bounce: Bounce Handler
reputation: Reputation Store
track: Tracking Pixel
report: Analytics

sender ─► api ─► send
api ─► template ─► render
api ─► validate ─► check
api ─► queue ─► enqueue
queue ─► agent ─► deliver
agent ─► bounce ─► track
bounce ─► reputation ─► update
agent ─► track ─► log
track ─► report ─► stats
api ─► queue ─► retry
```

## Design

### Design an email delivery service

The service accepts a send request from an app, renders the email from a
template, validates the recipient addresses, and hands the message to a queue.

- A fleet of sending agents consumes the queue and speaks SMTP to the receiving
  infrastructure (the recipient's MX servers), then tracks delivery, bounce, and
  open/click outcomes.
- The data plane is linear: Send API → template render → address validation →
  send queue → sending agent → SMTP → bounce and tracking feedback.
- Around it sit the reputation store, which records sender health, and an
  analytics pipeline that turns delivery events into reports.

The design choices are dominated by deliverability rather than raw throughput.

- Sending agents hold dedicated sender IPs and pool them by sender identity;
  messages are grouped by recipient domain and routed through separate IP pools
  so one abusive customer cannot poison another's reputation.
- Every message gets a unique message ID; tracking pixels and click links log
  opens and clicks.
- Bounce handling differentiates hard from soft bounces — hard bounces
  (permanent, e.g., unknown address) suppress the address, soft bounces
  (transient, e.g., mailbox full) are retried with backoff.
- The result is a system where delivery is observable end to end and where every
  sending decision is mediated by reputation, not just by SMTP mechanics.
- The queue is the reliability backbone: it is durable and at-least-once, so a
  sender-agent crash redelivers the message, and the delivery state machine
  (queued, sent, delivered, bounced, complained) is the single model that
  analytics, reputation, and the customer portal all read from.

### How do you ensure high deliverability?

Deliverability is not a single feature; it is a set of practices across the
whole stack.

- At the protocol level the service must pass authentication so receivers trust
  the mail: SPF (the sending IP is authorized for the domain), DKIM (the message
  is signed with a domain key), and DMARC (receivers know what to do with
  authentication failures).
- Without all three, major providers increasingly reject or quarantine mail
  regardless of content.
- Content matters too: rendering from validated templates, linking to real
  unsubscribe pages, and keeping a healthy image-to-text ratio reduce
  spam-filter classification risk.
- Replies and feedback loops must be accepted, because providers score domains
  partly on responsiveness.

Operationally, sending must be gentle.

- The service rate-limits per domain and per IP, honoring the limits the
  receiver states; it backs off on transient SMTP errors with exponential retry
  and rotates retries across IP pools.
- IP warming ramps new sending IPs from small to full volume over weeks so
  receivers build a trust history instead of seeing a sudden flood.
- Keep-alives and TLS make the SMTP sessions themselves reliable, and DNS
  records (MX, PTR for the IP, SPF, DKIM, DMARC) are validated before a pool can
  send.
- Finally, the feedback loop closes the circle: bounces, complaints, and
  spam-trap hits flow back into suppression lists and the reputation store, so a
  sender that repeatedly fails is automatically throttled before damage spreads
  to the pool.
- Monitoring ties it together: per-provider delivery rates, deferral codes, and
  time-to-inbox are graphed per pool, and a sustained drop in a provider's
  acceptance rate fires an alert so a reputation change is caught within hours,
  not weeks.

### How do you manage sender reputation?

Sender reputation is stored per sending identity — a combination of sender IP,
sending domain, and customer — in the reputation store, updated from delivery
outcomes.

- The core metric is a rolling window of hard-bounce rate, complaint rate,
  spam-trap hits, and unknown-user rate, compared against thresholds (common
  targets: under 2–3% bounces, under 0.1% complaints).
- Reputation is domain- and IP-specific, so the service maintains separate
  pools: a new customer starts on a low-volume pool with a warming schedule,
  graduates to the shared pool as their numbers improve, and is confined to an
  isolated pool or quarantined when their numbers degrade.
- A sending IP never changes owner, because an IP's history is its identity.

Reputation is managed proactively, not just reactively.

- The control plane applies per-pool sending limits, rotates IPs within a pool
  to avoid single-IP overload, and pauses a pool entirely when complaint or
  bounce rates spike.
- Bad actors are isolated so their problems never affect shared IPs.
- Reputation also feeds routing decisions: high-reputation traffic can use more
  aggressive parallelism and higher per-domain concurrency, while questionable
  traffic is throttled.
- Because reputation data changes slowly, it is cached and consulted on every
  send — cheap checks that prevent one bad day from becoming a blocked domain,
  and that let the service trade short-term throughput for long-term
  deliverability across the whole fleet.
- Reputation data also feeds the sender portal: customers see their bounce,
  complaint, and spam-trap rates against thresholds, so a customer can correct
  list-hygiene issues before the platform has to throttle them.

### How do you handle bounces and complaints?

Every SMTP response is classified by the bounce handler.

- Hard bounces (5xx permanent, e.g., "user does not exist") suppress the address
  globally and notify the customer: the address is added to a global suppression
  list so no future campaign can target it.
- Soft bounces (4xx transient: full mailbox, greylisting, rate limiting) are
  retried with exponential backoff and a maximum retry window (often 24–72
  hours), after which they are classified as failed and reported.
- Each attempt is logged with the exact SMTP code so analytics can distinguish
  causes — a spike in a particular 4xx code points to a specific provider policy
  change, not a blanket deliverability problem.

Complaints arrive via the complaint feedback loop — providers post abuse reports
to a feedback endpoint — and via the unsubscribe link, both feeding the same
suppression list.

- Suppression is the critical safety property: a suppressed address must never
  be emailed again by any sender in the service, checked synchronously at send
  time against a cached suppression index.
- Spam traps (honeypot addresses) are tracked separately because hitting them is
  stronger evidence of list-acquisition problems than ordinary bounces.
- The handler publishes every outcome as an event to analytics, so a customer
  sees delivered, bounced, complained, and suppressed counts per campaign rather
  than a single "sent" number — and the reputation store consumes the same
  events to score the sender.
- Suppression lists are versioned and exportable so customers can keep their own
  lists in sync, and each record stores its reason (hard bounce, complaint,
  unsubscribe) so a marketing team can tell a dead address from an angry one.

### How do you prevent your service being used for spam?

Abuse prevention starts at intake.

- Sending requires verified sender identity: the customer must prove domain
  ownership via a DNS record before sending from that domain, and every send
  must carry a valid DKIM signature for a verified domain.
- The template service renders only from configured templates with mandatory
  unsubscribe and physical-address footer blocks, so customers cannot strip
  compliance content.
- Address validation at send time catches syntactically bad, disposable, and
  obviously harvested addresses before they ever reach the queue, and new
  accounts are rate-limited until they build a history.

Detection runs continuously on behavior.

- The reputation store flags new domains that ramp too fast, unusual spike
  patterns, and high complaint or bounce ratios, and the control plane throttles
  or quarantines them.
- The send queue is partitioned per customer with per-identity rate limits, so a
  burst from one customer cannot overwhelm shared IPs or receiving providers.
- Finally, the service enforces hard policies at the edges: suppression lists
  are checked synchronously on every send, unsubscribes are processed within the
  regulatory window, and customers who persistently generate complaints are
  suspended.
- These layers — verified identity, filtered content, throttled volume, and
  reputation-driven isolation — make the service unattractive for bulk abuse
  while keeping the send path fast for legitimate senders.
- The controls are enforced synchronously in the Send API, not just as
  background checks: verification, suppression lookup, and quota checks run
  before a message is accepted, so abuse never even enters the queue.
- Over time these synchronous checks also produce a rich dataset of rejected
  requests that sharpens the behavioral models, making the service progressively
  harder to abuse.

## Source

```text
title: Email Delivery
node sender: Sender [round, icon=browser]
node api: Send API [icon=server]
node queue: Send Queue [icon=queue]
node template: Template Service [icon=file]
node validate: Address Validator [icon=search]
node agent: Sending Agent [icon=mail]
node bounce: Bounce Handler [icon=sync]
node reputation: Reputation Store [cylinder, icon=database]
node track: Tracking Pixel [icon=worker]
node report: Analytics [icon=search]

edge sender -> api: send
edge api -> template: render
edge api -> validate: check
edge api -> queue: enqueue
edge queue -> agent: deliver
edge agent -> bounce: track
edge bounce -> reputation: update
edge agent -> track: log
edge track -> report: stats
edge api -> queue: retry
```

## Q&A

### Q: Design an email delivery service

**A:** The service accepts a send request from an app, renders the email from a
template, validates the recipient addresses, and hands the message to a queue.

- A fleet of sending agents consumes the queue and speaks SMTP to the receiving
  infrastructure (the recipient's MX servers), then tracks delivery, bounce, and
  open/click outcomes.
- The data plane is linear: Send API → template render → address validation →
  send queue → sending agent → SMTP → bounce and tracking feedback.
- Around it sit the reputation store, which records sender health, and an
  analytics pipeline that turns delivery events into reports.

The design choices are dominated by deliverability rather than raw throughput.

- Sending agents hold dedicated sender IPs and pool them by sender identity;
  messages are grouped by recipient domain and routed through separate IP pools
  so one abusive customer cannot poison another's reputation.
- Every message gets a unique message ID; tracking pixels and click links log
  opens and clicks.
- Bounce handling differentiates hard from soft bounces — hard bounces
  (permanent, e.g., unknown address) suppress the address, soft bounces
  (transient, e.g., mailbox full) are retried with backoff.
- The result is a system where delivery is observable end to end and where every
  sending decision is mediated by reputation, not just by SMTP mechanics.
- The queue is the reliability backbone: it is durable and at-least-once, so a
  sender-agent crash redelivers the message, and the delivery state machine
  (queued, sent, delivered, bounced, complained) is the single model that
  analytics, reputation, and the customer portal all read from.

### Q: How do you ensure high deliverability?

**A:** Deliverability is not a single feature; it is a set of practices across the
whole stack.

- At the protocol level the service must pass authentication so receivers trust
  the mail: SPF (the sending IP is authorized for the domain), DKIM (the message
  is signed with a domain key), and DMARC (receivers know what to do with
  authentication failures).
- Without all three, major providers increasingly reject or quarantine mail
  regardless of content.
- Content matters too: rendering from validated templates, linking to real
  unsubscribe pages, and keeping a healthy image-to-text ratio reduce
  spam-filter classification risk.
- Replies and feedback loops must be accepted, because providers score domains
  partly on responsiveness.

Operationally, sending must be gentle.

- The service rate-limits per domain and per IP, honoring the limits the
  receiver states; it backs off on transient SMTP errors with exponential retry
  and rotates retries across IP pools.
- IP warming ramps new sending IPs from small to full volume over weeks so
  receivers build a trust history instead of seeing a sudden flood.
- Keep-alives and TLS make the SMTP sessions themselves reliable, and DNS
  records (MX, PTR for the IP, SPF, DKIM, DMARC) are validated before a pool can
  send.
- Finally, the feedback loop closes the circle: bounces, complaints, and
  spam-trap hits flow back into suppression lists and the reputation store, so a
  sender that repeatedly fails is automatically throttled before damage spreads
  to the pool.
- Monitoring ties it together: per-provider delivery rates, deferral codes, and
  time-to-inbox are graphed per pool, and a sustained drop in a provider's
  acceptance rate fires an alert so a reputation change is caught within hours,
  not weeks.

### Q: How do you manage sender reputation?

**A:** Sender reputation is stored per sending identity — a combination of sender IP,
sending domain, and customer — in the reputation store, updated from delivery
outcomes.

- The core metric is a rolling window of hard-bounce rate, complaint rate,
  spam-trap hits, and unknown-user rate, compared against thresholds (common
  targets: under 2–3% bounces, under 0.1% complaints).
- Reputation is domain- and IP-specific, so the service maintains separate
  pools: a new customer starts on a low-volume pool with a warming schedule,
  graduates to the shared pool as their numbers improve, and is confined to an
  isolated pool or quarantined when their numbers degrade.
- A sending IP never changes owner, because an IP's history is its identity.

Reputation is managed proactively, not just reactively.

- The control plane applies per-pool sending limits, rotates IPs within a pool
  to avoid single-IP overload, and pauses a pool entirely when complaint or
  bounce rates spike.
- Bad actors are isolated so their problems never affect shared IPs.
- Reputation also feeds routing decisions: high-reputation traffic can use more
  aggressive parallelism and higher per-domain concurrency, while questionable
  traffic is throttled.
- Because reputation data changes slowly, it is cached and consulted on every
  send — cheap checks that prevent one bad day from becoming a blocked domain,
  and that let the service trade short-term throughput for long-term
  deliverability across the whole fleet.
- Reputation data also feeds the sender portal: customers see their bounce,
  complaint, and spam-trap rates against thresholds, so a customer can correct
  list-hygiene issues before the platform has to throttle them.

### Q: How do you handle bounces and complaints?

**A:** Every SMTP response is classified by the bounce handler.

- Hard bounces (5xx permanent, e.g., "user does not exist") suppress the address
  globally and notify the customer: the address is added to a global suppression
  list so no future campaign can target it.
- Soft bounces (4xx transient: full mailbox, greylisting, rate limiting) are
  retried with exponential backoff and a maximum retry window (often 24–72
  hours), after which they are classified as failed and reported.
- Each attempt is logged with the exact SMTP code so analytics can distinguish
  causes — a spike in a particular 4xx code points to a specific provider policy
  change, not a blanket deliverability problem.

Complaints arrive via the complaint feedback loop — providers post abuse reports
to a feedback endpoint — and via the unsubscribe link, both feeding the same
suppression list.

- Suppression is the critical safety property: a suppressed address must never
  be emailed again by any sender in the service, checked synchronously at send
  time against a cached suppression index.
- Spam traps (honeypot addresses) are tracked separately because hitting them is
  stronger evidence of list-acquisition problems than ordinary bounces.
- The handler publishes every outcome as an event to analytics, so a customer
  sees delivered, bounced, complained, and suppressed counts per campaign rather
  than a single "sent" number — and the reputation store consumes the same
  events to score the sender.
- Suppression lists are versioned and exportable so customers can keep their own
  lists in sync, and each record stores its reason (hard bounce, complaint,
  unsubscribe) so a marketing team can tell a dead address from an angry one.

### Q: How do you prevent your service being used for spam?

**A:** Abuse prevention starts at intake.

- Sending requires verified sender identity: the customer must prove domain
  ownership via a DNS record before sending from that domain, and every send
  must carry a valid DKIM signature for a verified domain.
- The template service renders only from configured templates with mandatory
  unsubscribe and physical-address footer blocks, so customers cannot strip
  compliance content.
- Address validation at send time catches syntactically bad, disposable, and
  obviously harvested addresses before they ever reach the queue, and new
  accounts are rate-limited until they build a history.

Detection runs continuously on behavior.

- The reputation store flags new domains that ramp too fast, unusual spike
  patterns, and high complaint or bounce ratios, and the control plane throttles
  or quarantines them.
- The send queue is partitioned per customer with per-identity rate limits, so a
  burst from one customer cannot overwhelm shared IPs or receiving providers.
- Finally, the service enforces hard policies at the edges: suppression lists
  are checked synchronously on every send, unsubscribes are processed within the
  regulatory window, and customers who persistently generate complaints are
  suspended.
- These layers — verified identity, filtered content, throttled volume, and
  reputation-driven isolation — make the service unattractive for bulk abuse
  while keeping the send path fast for legitimate senders.
- The controls are enforced synchronously in the Send API, not just as
  background checks: verification, suppression lookup, and quota checks run
  before a message is accepted, so abuse never even enters the queue.
- Over time these synchronous checks also produce a rich dataset of rejected
  requests that sharpens the behavioral models, making the service progressively
  harder to abuse.

## Source

```text
title: Email Delivery
node sender: Sender [round, icon=browser]
node api: Send API [icon=server]
node queue: Send Queue [icon=queue]
node template: Template Service [icon=file]
node validate: Address Validator [icon=search]
node agent: Sending Agent [icon=mail]
node bounce: Bounce Handler [icon=sync]
node reputation: Reputation Store [cylinder, icon=database]
node track: Tracking Pixel [icon=worker]
node report: Analytics [icon=search]

edge sender -> api: send
edge api -> template: render
edge api -> validate: check
edge api -> queue: enqueue
edge queue -> agent: deliver
edge agent -> bounce: track
edge bounce -> reputation: update
edge agent -> track: log
edge track -> report: stats
edge api -> queue: retry
```
