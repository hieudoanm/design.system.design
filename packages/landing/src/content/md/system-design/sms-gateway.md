# SMS Gateway

Design an SMS gateway service

**Difficulty:** Hard

**Tags:** messaging

## Functional Requirements

- an SMS gateway service
- send SMS through multiple providers?
- handle delivery reports and retries?
- route messages to the best provider?
- enforce rate limits and compliance?

## Non-Functional Requirements

- An SMS gateway is fundamentally a delivery optimization problem: submit a
  message once, get it to a phone reliably, cheaply, and in compliance with
  regulations.

- I would build it as a set of services behind an API gateway.
- The SMS service validates messages, checks sender permissions, and applies
  business rules.
- The provider router chooses the best carrier from a pool of SMS providers.
- A durable send queue decouples submission from delivery, the retry engine
  handles failures, the delivery status service ingests carrier reports, and a
  compliance audit log records every message for regulatory purposes.
- A messages database is the system of record for the full lifecycle of each
  message.

The flow begins when a sender submits through the sending app.

- The gateway authenticates the API key and enforces rate limits, then hands the
  payload to the SMS service.
- After validation and templating, the router selects a provider and enqueues a
  send task.
- A worker delivers it over the provider's HTTP API, stores the provider message
  id, and waits for a delivery report.
- When the carrier reports a status (sent, delivered, failed), the status
  service updates the message record and either notifies the caller through a
  webhook or triggers a retry through the retry engine.

The central tradeoff is reliability against cost.

- Delivery is asynchronous and best-effort from the gateway's perspective
  because the carrier is the authority on final state, so the design must treat
  every outbound call as a promise with a delivery report.
- The queue gives at-least-once semantics and absorbs bursts.
- The architecture accepts that a retry might be delivered twice and provides
  idempotency keys so clients can deduplicate.
- Provider abstraction is what makes this design resilient; the router hides
  provider APIs behind one interface and fails over within milliseconds..
- Multiple providers are essential because no single carrier has coverage, price,
  and reliability everywhere, and because redundancy is the only way to avoid a
  single point of failure.

- I would abstract every provider behind one interface that takes a normalized
  message and returns a provider message id plus a cost.
- The router maintains a provider registry with health state, pricing, and
  per-destination constraints such as geographic support and features like
  unicode or long messages.
- Each provider is isolated behind a thin adapter, so adding a new carrier is
  adding an adapter plus a config entry.

Sending is asynchronous and provider-agnostic.

- The router selects a provider, the send queue enqueues the task, and a worker
  performs the HTTP call.
- Delivery reports arrive later through provider webhooks and are normalized
  into a single status model.
- Because the interface is uniform, failover is trivial: if a provider times out
  or the report never arrives, the retry engine re-enqueues the message and the
  router tries the next candidate provider.
- I would also deduplicate across providers by message id so a report from the
  fallback provider does not double-count a message.

Selection logic balances cost, reliability, and route health, and it should be
data-driven rather than hardcoded.

- The router scores providers from live metrics: success rate on recent reports,
  latency, price, and carrier reputation for the target destination.
- A feedback loop consumes delivery reports and updates these scores, so the
  router automatically shifts traffic away from a degrading provider.
- Capacity limits per provider prevent a burst from overwhelming one carrier.
- The tradeoff is that per-message routing adds latency, so the router caches
  its decisions and only re-evaluates on health changes or report anomalies..
- Provider routing is a scoring problem over live data.

- For each message, the router considers the destination country, the sender
  identity, and the message type, then builds a candidate set of providers that
  support that route.
- Each candidate is scored on historical delivery rate, current latency, price,
  and available capacity.
- The best score wins unless the message must be split across providers for
  redundancy.
- I would derive delivery rates from the same delivery report stream that the
  status service ingests, computed over a rolling window per destination and
  provider, so scores reflect reality rather than static contracts.

The router must be fast because it sits on the synchronous path, but it cannot
afford a remote lookup per message.

- I would keep a compact routing table in memory, updated asynchronously from a
  feature store, with the top providers per destination and their scores.
- Rules layer on top: a campaign can pin a provider, a compliance rule can
  exclude providers in certain jurisdictions, and a fallback list is always
  maintained.
- If the primary provider fails the actual send, the message is re-enqueued with
  a route hint excluding the failed provider, so failover happens without
  re-scoring.

Scoring is a tradeoff between cost and reliability.

- The cheapest provider may have the worst delivery rate, so the score is a
  weighted combination rather than pure price, with weights tuned per message
  type: transactional alerts favor reliability, marketing favors cost.
- I would continuously compare planned route against realized outcomes and feed
  the delta back into the scores, which makes the router self-correcting.
- Capacity is the final constraint; each provider gets a concurrency limit to
  avoid tripping their rate limits, and the router sheds load to alternates
  before a provider degrades the whole queue..
- SMS is heavily regulated, so compliance is a first-class requirement rather than
  a feature.

- Every message carries metadata: the sending tenant, the message type
  (transactional, promotional, verification), the destination, and the consent
  state.
- A compliance audit log records the payload, timestamps, provider, route
  decisions, and reports, and it is immutable so regulators can reconstruct what
  happened.
- I would also enforce sender-id policies, per-jurisdiction opt-in rules, and
  quiet hours where they are legally required, because sending promotional
  messages to the wrong list can cost the provider's contract.

Rate limits are enforced at two layers.

- The gateway applies per-tenant, per-destination, and global throughput limits
  before the message enters the queue, protecting the platform and the
  providers.
- Inside the send path, per-provider and per-phone thresholds prevent a single
  account from hammering one carrier, and dynamic throttling backs off when a
  provider reports 429 responses.
- Limits are centralized in a token-bucket store so multiple gateway instances
  share the same budget, and the limits themselves are configurable per tenant
  contract rather than hardcoded.

The main tension is between delivering fast and staying legal.

- A promotional burst may exceed the tenant's agreed daily cap, so the gateway
  either queues it for the next window or rejects it with a clear error, and the
  tenant sees the enforcement in the API response.
- Keyword responses such as STOP must be honored automatically, which means
  every inbound message is parsed and updates the tenant's suppression list in
  real time.
- I would run reconciliation jobs that compare sent volumes against regulatory
  thresholds and alert on anomalies.
- The result is that compliance decisions happen before a message is enqueued,
  not after an audit finds a violation.

## Source

````text
title: SMS Gateway
node sender: Sender [round, icon=browser]
node app: Sending App [icon=browser]
node gateway: API Gateway [icon=server]
node sms: SMS Service [icon=compute]
node route: Provider Router [icon=compute]
node queue: Send Queue [icon=queue]
node provider: SMS Providers [icon=cloud]
node status: Delivery Status [icon=message]
node retry: Retry Engine [icon=worker]
node audit: Compliance Audit [icon=file]
node db: Messages DB [cylinder, icon=database]

edge sender -> app: send
edge app -> gateway: submit
edge gateway -> sms: validate
edge sms -> route: choose
edge route -> queue: enqueue
edge queue -> provider: deliver
edge provider -> status: report
edge status -> sms: update
edge sms -> retry: retry
edge sms -> audit: log
edge sms -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: SMS Gateway
sender: Sender
app: Sending App
gateway: API Gateway
sms: SMS Service
route: Provider Router
queue: Send Queue
provider: SMS Providers
status: Delivery Status
retry: Retry Engine
audit: Compliance Audit
db: Messages DB

sender ─► app ─► send
app ─► gateway ─► submit
gateway ─► sms ─► validate
sms ─► route ─► choose
route ─► queue ─► enqueue
queue ─► provider ─► deliver
provider ─► status ─► report
status ─► sms ─► update
sms ─► retry ─► retry
sms ─► audit ─► log
sms ─► db ─► store
````

## Design

### Design an SMS gateway service

An SMS gateway is fundamentally a delivery optimization problem: submit a
message once, get it to a phone reliably, cheaply, and in compliance with
regulations.

- I would build it as a set of services behind an API gateway.
- The SMS service validates messages, checks sender permissions, and applies
  business rules.
- The provider router chooses the best carrier from a pool of SMS providers.
- A durable send queue decouples submission from delivery, the retry engine
  handles failures, the delivery status service ingests carrier reports, and a
  compliance audit log records every message for regulatory purposes.
- A messages database is the system of record for the full lifecycle of each
  message.

The flow begins when a sender submits through the sending app.

- The gateway authenticates the API key and enforces rate limits, then hands the
  payload to the SMS service.
- After validation and templating, the router selects a provider and enqueues a
  send task.
- A worker delivers it over the provider's HTTP API, stores the provider message
  id, and waits for a delivery report.
- When the carrier reports a status (sent, delivered, failed), the status
  service updates the message record and either notifies the caller through a
  webhook or triggers a retry through the retry engine.

The central tradeoff is reliability against cost.

- Delivery is asynchronous and best-effort from the gateway's perspective
  because the carrier is the authority on final state, so the design must treat
  every outbound call as a promise with a delivery report.
- The queue gives at-least-once semantics and absorbs bursts.
- The architecture accepts that a retry might be delivered twice and provides
  idempotency keys so clients can deduplicate.
- Provider abstraction is what makes this design resilient; the router hides
  provider APIs behind one interface and fails over within milliseconds.

### How do you send SMS through multiple providers?

Multiple providers are essential because no single carrier has coverage, price,
and reliability everywhere, and because redundancy is the only way to avoid a
single point of failure.

- I would abstract every provider behind one interface that takes a normalized
  message and returns a provider message id plus a cost.
- The router maintains a provider registry with health state, pricing, and
  per-destination constraints such as geographic support and features like
  unicode or long messages.
- Each provider is isolated behind a thin adapter, so adding a new carrier is
  adding an adapter plus a config entry.

Sending is asynchronous and provider-agnostic.

- The router selects a provider, the send queue enqueues the task, and a worker
  performs the HTTP call.
- Delivery reports arrive later through provider webhooks and are normalized
  into a single status model.
- Because the interface is uniform, failover is trivial: if a provider times out
  or the report never arrives, the retry engine re-enqueues the message and the
  router tries the next candidate provider.
- I would also deduplicate across providers by message id so a report from the
  fallback provider does not double-count a message.

Selection logic balances cost, reliability, and route health, and it should be
data-driven rather than hardcoded.

- The router scores providers from live metrics: success rate on recent reports,
  latency, price, and carrier reputation for the target destination.
- A feedback loop consumes delivery reports and updates these scores, so the
  router automatically shifts traffic away from a degrading provider.
- Capacity limits per provider prevent a burst from overwhelming one carrier.
- The tradeoff is that per-message routing adds latency, so the router caches
  its decisions and only re-evaluates on health changes or report anomalies.

### How do you handle delivery reports and retries?

Delivery reports are the source of truth, but they are asynchronous, sometimes
delayed, and occasionally wrong.

- Each provider exposes a webhook or polling endpoint that delivers status
  updates, and the status service normalizes them into a canonical state
  machine: accepted, sent, delivered, failed, and unknown.
- I would store the provider message id on the message record at send time so an
  inbound report can be matched even if the caller never checked the original
  response.
- Idempotency matters because providers may redeliver the same report; the
  status service dedupes by provider id and event sequence.

Retries are driven by a retry engine with a separate schedule from the main send
queue.

- A message is retryable when a report is late, an explicit failure is transient
  (provider error, network timeout, carrier down), or the status is ambiguous.
- Retries use exponential backoff with jitter, a maximum attempt count, and an
  overall TTL because an SMS that arrives hours late is often worse than none.
- I would retry on a different provider when the failure suggests provider-side
  trouble, and on the same provider for carrier-specific issues such as a
  temporarily out-of-service handset.

A late report needs the same rigor as a failure.

- If a message is stuck in a sent state past the carrier's expected report
  window, the retry engine queries the provider status endpoint before deciding.
- Messages that exhaust all attempts move to a dead-letter queue for operator
  review, and the audit trail preserves the full retry history.
- The caller is notified through a configurable webhook on each status
  transition, so applications can reconcile their own state.
- The key design point is that the gateway never assumes success; it keeps
  retrying until the carrier's report confirms delivery or the message is
  definitively failed.

### How do you route messages to the best provider?

Provider routing is a scoring problem over live data.

- For each message, the router considers the destination country, the sender
  identity, and the message type, then builds a candidate set of providers that
  support that route.
- Each candidate is scored on historical delivery rate, current latency, price,
  and available capacity.
- The best score wins unless the message must be split across providers for
  redundancy.
- I would derive delivery rates from the same delivery report stream that the
  status service ingests, computed over a rolling window per destination and
  provider, so scores reflect reality rather than static contracts.

The router must be fast because it sits on the synchronous path, but it cannot
afford a remote lookup per message.

- I would keep a compact routing table in memory, updated asynchronously from a
  feature store, with the top providers per destination and their scores.
- Rules layer on top: a campaign can pin a provider, a compliance rule can
  exclude providers in certain jurisdictions, and a fallback list is always
  maintained.
- If the primary provider fails the actual send, the message is re-enqueued with
  a route hint excluding the failed provider, so failover happens without
  re-scoring.

Scoring is a tradeoff between cost and reliability.

- The cheapest provider may have the worst delivery rate, so the score is a
  weighted combination rather than pure price, with weights tuned per message
  type: transactional alerts favor reliability, marketing favors cost.
- I would continuously compare planned route against realized outcomes and feed
  the delta back into the scores, which makes the router self-correcting.
- Capacity is the final constraint; each provider gets a concurrency limit to
  avoid tripping their rate limits, and the router sheds load to alternates
  before a provider degrades the whole queue.

### How do you enforce rate limits and compliance?

SMS is heavily regulated, so compliance is a first-class requirement rather than
a feature.

- Every message carries metadata: the sending tenant, the message type
  (transactional, promotional, verification), the destination, and the consent
  state.
- A compliance audit log records the payload, timestamps, provider, route
  decisions, and reports, and it is immutable so regulators can reconstruct what
  happened.
- I would also enforce sender-id policies, per-jurisdiction opt-in rules, and
  quiet hours where they are legally required, because sending promotional
  messages to the wrong list can cost the provider's contract.

Rate limits are enforced at two layers.

- The gateway applies per-tenant, per-destination, and global throughput limits
  before the message enters the queue, protecting the platform and the
  providers.
- Inside the send path, per-provider and per-phone thresholds prevent a single
  account from hammering one carrier, and dynamic throttling backs off when a
  provider reports 429 responses.
- Limits are centralized in a token-bucket store so multiple gateway instances
  share the same budget, and the limits themselves are configurable per tenant
  contract rather than hardcoded.

The main tension is between delivering fast and staying legal.

- A promotional burst may exceed the tenant's agreed daily cap, so the gateway
  either queues it for the next window or rejects it with a clear error, and the
  tenant sees the enforcement in the API response.
- Keyword responses such as STOP must be honored automatically, which means
  every inbound message is parsed and updates the tenant's suppression list in
  real time.
- I would run reconciliation jobs that compare sent volumes against regulatory
  thresholds and alert on anomalies.
- The result is that compliance decisions happen before a message is enqueued,
  not after an audit finds a violation.

## Source

```text
title: SMS Gateway
node sender: Sender [round, icon=browser]
node app: Sending App [icon=browser]
node gateway: API Gateway [icon=server]
node sms: SMS Service [icon=compute]
node route: Provider Router [icon=compute]
node queue: Send Queue [icon=queue]
node provider: SMS Providers [icon=cloud]
node status: Delivery Status [icon=message]
node retry: Retry Engine [icon=worker]
node audit: Compliance Audit [icon=file]
node db: Messages DB [cylinder, icon=database]

edge sender -> app: send
edge app -> gateway: submit
edge gateway -> sms: validate
edge sms -> route: choose
edge route -> queue: enqueue
edge queue -> provider: deliver
edge provider -> status: report
edge status -> sms: update
edge sms -> retry: retry
edge sms -> audit: log
edge sms -> db: store
```

## Q&A

### Q: Design an SMS gateway service

**A:** An SMS gateway is fundamentally a delivery optimization problem: submit a
message once, get it to a phone reliably, cheaply, and in compliance with
regulations.

- I would build it as a set of services behind an API gateway.
- The SMS service validates messages, checks sender permissions, and applies
  business rules.
- The provider router chooses the best carrier from a pool of SMS providers.
- A durable send queue decouples submission from delivery, the retry engine
  handles failures, the delivery status service ingests carrier reports, and a
  compliance audit log records every message for regulatory purposes.
- A messages database is the system of record for the full lifecycle of each
  message.

The flow begins when a sender submits through the sending app.

- The gateway authenticates the API key and enforces rate limits, then hands the
  payload to the SMS service.
- After validation and templating, the router selects a provider and enqueues a
  send task.
- A worker delivers it over the provider's HTTP API, stores the provider message
  id, and waits for a delivery report.
- When the carrier reports a status (sent, delivered, failed), the status
  service updates the message record and either notifies the caller through a
  webhook or triggers a retry through the retry engine.

The central tradeoff is reliability against cost.

- Delivery is asynchronous and best-effort from the gateway's perspective
  because the carrier is the authority on final state, so the design must treat
  every outbound call as a promise with a delivery report.
- The queue gives at-least-once semantics and absorbs bursts.
- The architecture accepts that a retry might be delivered twice and provides
  idempotency keys so clients can deduplicate.
- Provider abstraction is what makes this design resilient; the router hides
  provider APIs behind one interface and fails over within milliseconds.

### Q: How do you send SMS through multiple providers?

**A:** Multiple providers are essential because no single carrier has coverage, price,
and reliability everywhere, and because redundancy is the only way to avoid a
single point of failure.

- I would abstract every provider behind one interface that takes a normalized
  message and returns a provider message id plus a cost.
- The router maintains a provider registry with health state, pricing, and
  per-destination constraints such as geographic support and features like
  unicode or long messages.
- Each provider is isolated behind a thin adapter, so adding a new carrier is
  adding an adapter plus a config entry.

Sending is asynchronous and provider-agnostic.

- The router selects a provider, the send queue enqueues the task, and a worker
  performs the HTTP call.
- Delivery reports arrive later through provider webhooks and are normalized
  into a single status model.
- Because the interface is uniform, failover is trivial: if a provider times out
  or the report never arrives, the retry engine re-enqueues the message and the
  router tries the next candidate provider.
- I would also deduplicate across providers by message id so a report from the
  fallback provider does not double-count a message.

Selection logic balances cost, reliability, and route health, and it should be
data-driven rather than hardcoded.

- The router scores providers from live metrics: success rate on recent reports,
  latency, price, and carrier reputation for the target destination.
- A feedback loop consumes delivery reports and updates these scores, so the
  router automatically shifts traffic away from a degrading provider.
- Capacity limits per provider prevent a burst from overwhelming one carrier.
- The tradeoff is that per-message routing adds latency, so the router caches
  its decisions and only re-evaluates on health changes or report anomalies.

### Q: How do you handle delivery reports and retries?

**A:** Delivery reports are the source of truth, but they are asynchronous, sometimes
delayed, and occasionally wrong.

- Each provider exposes a webhook or polling endpoint that delivers status
  updates, and the status service normalizes them into a canonical state
  machine: accepted, sent, delivered, failed, and unknown.
- I would store the provider message id on the message record at send time so an
  inbound report can be matched even if the caller never checked the original
  response.
- Idempotency matters because providers may redeliver the same report; the
  status service dedupes by provider id and event sequence.

Retries are driven by a retry engine with a separate schedule from the main send
queue.

- A message is retryable when a report is late, an explicit failure is transient
  (provider error, network timeout, carrier down), or the status is ambiguous.
- Retries use exponential backoff with jitter, a maximum attempt count, and an
  overall TTL because an SMS that arrives hours late is often worse than none.
- I would retry on a different provider when the failure suggests provider-side
  trouble, and on the same provider for carrier-specific issues such as a
  temporarily out-of-service handset.

A late report needs the same rigor as a failure.

- If a message is stuck in a sent state past the carrier's expected report
  window, the retry engine queries the provider status endpoint before deciding.
- Messages that exhaust all attempts move to a dead-letter queue for operator
  review, and the audit trail preserves the full retry history.
- The caller is notified through a configurable webhook on each status
  transition, so applications can reconcile their own state.
- The key design point is that the gateway never assumes success; it keeps
  retrying until the carrier's report confirms delivery or the message is
  definitively failed.

### Q: How do you route messages to the best provider?

**A:** Provider routing is a scoring problem over live data.

- For each message, the router considers the destination country, the sender
  identity, and the message type, then builds a candidate set of providers that
  support that route.
- Each candidate is scored on historical delivery rate, current latency, price,
  and available capacity.
- The best score wins unless the message must be split across providers for
  redundancy.
- I would derive delivery rates from the same delivery report stream that the
  status service ingests, computed over a rolling window per destination and
  provider, so scores reflect reality rather than static contracts.

The router must be fast because it sits on the synchronous path, but it cannot
afford a remote lookup per message.

- I would keep a compact routing table in memory, updated asynchronously from a
  feature store, with the top providers per destination and their scores.
- Rules layer on top: a campaign can pin a provider, a compliance rule can
  exclude providers in certain jurisdictions, and a fallback list is always
  maintained.
- If the primary provider fails the actual send, the message is re-enqueued with
  a route hint excluding the failed provider, so failover happens without
  re-scoring.

Scoring is a tradeoff between cost and reliability.

- The cheapest provider may have the worst delivery rate, so the score is a
  weighted combination rather than pure price, with weights tuned per message
  type: transactional alerts favor reliability, marketing favors cost.
- I would continuously compare planned route against realized outcomes and feed
  the delta back into the scores, which makes the router self-correcting.
- Capacity is the final constraint; each provider gets a concurrency limit to
  avoid tripping their rate limits, and the router sheds load to alternates
  before a provider degrades the whole queue.

### Q: How do you enforce rate limits and compliance?

**A:** SMS is heavily regulated, so compliance is a first-class requirement rather than
a feature.

- Every message carries metadata: the sending tenant, the message type
  (transactional, promotional, verification), the destination, and the consent
  state.
- A compliance audit log records the payload, timestamps, provider, route
  decisions, and reports, and it is immutable so regulators can reconstruct what
  happened.
- I would also enforce sender-id policies, per-jurisdiction opt-in rules, and
  quiet hours where they are legally required, because sending promotional
  messages to the wrong list can cost the provider's contract.

Rate limits are enforced at two layers.

- The gateway applies per-tenant, per-destination, and global throughput limits
  before the message enters the queue, protecting the platform and the
  providers.
- Inside the send path, per-provider and per-phone thresholds prevent a single
  account from hammering one carrier, and dynamic throttling backs off when a
  provider reports 429 responses.
- Limits are centralized in a token-bucket store so multiple gateway instances
  share the same budget, and the limits themselves are configurable per tenant
  contract rather than hardcoded.

The main tension is between delivering fast and staying legal.

- A promotional burst may exceed the tenant's agreed daily cap, so the gateway
  either queues it for the next window or rejects it with a clear error, and the
  tenant sees the enforcement in the API response.
- Keyword responses such as STOP must be honored automatically, which means
  every inbound message is parsed and updates the tenant's suppression list in
  real time.
- I would run reconciliation jobs that compare sent volumes against regulatory
  thresholds and alert on anomalies.
- The result is that compliance decisions happen before a message is enqueued,
  not after an audit finds a violation.

## Source

```text
title: SMS Gateway
node sender: Sender [round, icon=browser]
node app: Sending App [icon=browser]
node gateway: API Gateway [icon=server]
node sms: SMS Service [icon=compute]
node route: Provider Router [icon=compute]
node queue: Send Queue [icon=queue]
node provider: SMS Providers [icon=cloud]
node status: Delivery Status [icon=message]
node retry: Retry Engine [icon=worker]
node audit: Compliance Audit [icon=file]
node db: Messages DB [cylinder, icon=database]

edge sender -> app: send
edge app -> gateway: submit
edge gateway -> sms: validate
edge sms -> route: choose
edge route -> queue: enqueue
edge queue -> provider: deliver
edge provider -> status: report
edge status -> sms: update
edge sms -> retry: retry
edge sms -> audit: log
edge sms -> db: store
```
