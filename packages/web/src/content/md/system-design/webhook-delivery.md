# Webhook Delivery

Design a webhook delivery system

**Difficulty:** Medium

**Tags:** event-driven, realtime, security

## Functional Requirements

- a webhook delivery system
- deliver events reliably?
- handle retries and backoff?
- secure webhook payloads?
- handle slow or down endpoints?

## Non-Functional Requirements

- I would build it around four components.

- A subscription service stores which endpoint receives which event types.
- A delivery engine turns events into HTTP deliveries.
- A durable delivery queue decouples event production from outbound HTTP.
- A retry scheduler plus dead-letter queue handles the inevitable failures.
- A delivery database records every attempt, status, and payload so the whole
  system is observable and replayable.

The flow starts when an event source emits an event to the service, which
forwards it through the gateway to the delivery engine.

- The engine resolves the endpoint from the subscription store, signs the
  payload, and enqueues a delivery task.
- Workers pick the task up, perform the POST, and await an acknowledgement.
- Success is recorded as a single attempt.
- Failure schedules a retry with backoff through the retry scheduler, and
  persistent failures eventually land in the dead-letter queue for inspection
  and replay.

Reliability is the dominant design concern, so everything is built for
at-least-once delivery with idempotency.

- The delivery queue is the source of truth for pending work; if a worker
  crashes mid-POST, the task is re-delivered.
- The customer sees an idempotency header on every payload and can deduplicate.
- The tradeoff is that the customer must be prepared for duplicates, which is
  standard practice for webhook systems such as Stripe.
- The design also keeps delivery latency bounded: it never blocks the event
  source, so producers see a fast acknowledgement and delivery happens on its
  own schedule..
- Reliable delivery means every accepted event is either delivered or recorded as
  failed, even when endpoints are down.

- The delivery queue is durable and replicated, and a task is only acknowledged
  after the HTTP request completes.
- The delivery engine batches events for the same endpoint where sensible, but
  keeps each event independent in the queue so one slow event never blocks the
  rest.
- I would write the attempt outcome to the delivery database on every
  transition, giving an audit trail of exactly what was sent, when, and what the
  response was.

The synchronous path stays minimal.

- The event source publishes to the gateway, the engine resolves subscriptions
  and enqueues, and the worker performs the delivery asynchronously.
- Because the queue sits between production and delivery, a burst of events or a
  down endpoint does not back up the producers.
- Ordering is preserved per endpoint when the customer requires it, which I
  would implement by keying the queue on endpoint so a single consumer processes
  events for that endpoint in order, while different endpoints run in parallel.

The hardest part is knowing when a delivery actually succeeded.

- A 2xx response is success.
- Anything else is a candidate for retry, but timeouts are ambiguous: the
  endpoint may have processed the event and then died before responding.
- The design handles this by making every payload carry an event id and a
  timestamp, and by documenting at-least-once semantics so customers build
  idempotent receivers.
- A reconciliation job scans the delivery database for attempts stuck in flight
  past a timeout and re-enqueues them, which closes the gap between what the
  customer saw and what we think they saw..
- Retries exist because transient failures are common and most endpoints recover
  within seconds or minutes.

- The retry scheduler maintains a per-delivery schedule with exponential
  backoff: start at a few seconds, double each attempt, add jitter to avoid
  thundering herds, and cap the interval at a few minutes.
- I would separate the retry scheduler from the main delivery queue so failed
  deliveries do not sit at the head of the queue and block new events.
- Each retry re-enters the delivery queue with an updated due time, and the
  scheduler is the component that decides when that happens.

Not every failure deserves the same treatment.

- A 429 rate-limit response should retry with respect for the Retry-After
  header.
- A 5xx should retry with standard backoff.
- A 4xx client error such as 404 usually means the endpoint is misconfigured and
  should fail fast.
- I would classify errors on receipt, set an attempt budget per delivery, and
  move permanently failing deliveries to the dead-letter queue with the full
  request and response history so an operator can replay them after fixing the
  endpoint.

Backoff must coordinate with the endpoint's tolerance.

- If every failed webhook retries at the same moment, a recovering endpoint gets
  a burst that knocks it down again, so jitter is mandatory.
- I would also implement circuit breaking per endpoint: after consecutive
  failures the scheduler pauses deliveries to that endpoint and resumes on a
  timer, which protects both the customer's infrastructure and ours.
- The tradeoff is that circuit breaking adds latency to legitimate deliveries,
  so the thresholds are tuned per endpoint tier.
- All retry state is derived from the delivery database, so a scheduler crash
  does not lose the schedule..
- Slow and down endpoints are the normal case for webhooks, so the system is
  designed to contain their impact.

- The delivery queue gives each task an HTTP timeout, and a slow endpoint is
  detected by measuring p95 latency across attempts.
- The engine concurrency limits per endpoint prevent slow deliveries from
  consuming the whole worker pool; when a down endpoint fails its attempts, its
  tasks back up in the queue while other endpoints proceed.
- I would isolate endpoints by assigning them dedicated queues, so one
  customer's outage never delays another customer's deliveries.

Down endpoints go through a defined lifecycle.

- When deliveries keep failing, the retry scheduler backs off and eventually
  marks the endpoint as paused, halting deliveries until a liveness check
  succeeds.
- The customer is notified through the dashboard that their endpoint is paused,
  which is an operator signal they can act on.
- During the outage the queue absorbs the backlog, bounded by a retention
  policy; events older than the retention window are dropped into the
  dead-letter queue so they are not lost silently.

The design trades backlog for simplicity.

- Keeping events for hours during an outage preserves their value, but an
  unbounded backlog threatens the whole system, so I would set a per-endpoint
  cap and a global cap with clear semantics for what gets dropped first.
- When the endpoint recovers, the engine drains the backlog with a controlled
  concurrency ramp so it does not overwhelm the customer's now-healthy server.
- Replay is supported from the delivery database, and the dead-letter queue lets
  an operator re-inject individual deliveries after fixing a root cause.
- The result is that a single dead endpoint degrades nothing except its own
  deliveries.

## Source

````text
title: Webhook Delivery
node source: Event Source [icon=cloud]
node app: Service [icon=server]
node gateway: API Gateway [icon=server]
node sub: Subscription Service [icon=compute]
node deliver: Delivery Engine [icon=worker]
node queue: Delivery Queue [icon=queue]
node endpoint: Customer Endpoint [icon=server]
node sign: Payload Signer [icon=shield]
node retry: Retry Scheduler [icon=cache]
node dlq: Dead Letter Queue [icon=queue]
node db: Delivery DB [cylinder, icon=database]

edge source -> app: event
edge app -> gateway: forward
edge gateway -> deliver: submit
edge deliver -> sub: endpoints
edge sub -> queue: enqueue
edge deliver -> sign: payload
edge sign -> endpoint: send
edge endpoint -> deliver: ack
edge deliver -> retry: backoff
edge retry -> dlq: fail
edge deliver -> db: log
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Webhook Delivery
source: Event Source
app: Service
gateway: API Gateway
sub: Subscription Service
deliver: Delivery Engine
queue: Delivery Queue
endpoint: Customer Endpoint
sign: Payload Signer
retry: Retry Scheduler
dlq: Dead Letter Queue
db: Delivery DB

source ─► app ─► event
app ─► gateway ─► forward
gateway ─► deliver ─► submit
deliver ─► sub ─► endpoints
sub ─► queue ─► enqueue
deliver ─► sign ─► payload
sign ─► endpoint ─► send
endpoint ─► deliver ─► ack
deliver ─► retry ─► backoff
retry ─► dlq ─► fail
deliver ─► db ─► log
````

## Design

### Design a webhook delivery system

A webhook delivery system moves events from an internal service to
customer-owned endpoints over the public internet, which is inherently
unreliable. I would build it around four components.

- A subscription service stores which endpoint receives which event types.
- A delivery engine turns events into HTTP deliveries.
- A durable delivery queue decouples event production from outbound HTTP.
- A retry scheduler plus dead-letter queue handles the inevitable failures.
- A delivery database records every attempt, status, and payload so the whole
  system is observable and replayable.

The flow starts when an event source emits an event to the service, which
forwards it through the gateway to the delivery engine.

- The engine resolves the endpoint from the subscription store, signs the
  payload, and enqueues a delivery task.
- Workers pick the task up, perform the POST, and await an acknowledgement.
- Success is recorded as a single attempt.
- Failure schedules a retry with backoff through the retry scheduler, and
  persistent failures eventually land in the dead-letter queue for inspection
  and replay.

Reliability is the dominant design concern, so everything is built for
at-least-once delivery with idempotency.

- The delivery queue is the source of truth for pending work; if a worker
  crashes mid-POST, the task is re-delivered.
- The customer sees an idempotency header on every payload and can deduplicate.
- The tradeoff is that the customer must be prepared for duplicates, which is
  standard practice for webhook systems such as Stripe.
- The design also keeps delivery latency bounded: it never blocks the event
  source, so producers see a fast acknowledgement and delivery happens on its
  own schedule.

### How do you deliver events reliably?

Reliable delivery means every accepted event is either delivered or recorded as
failed, even when endpoints are down.

- The delivery queue is durable and replicated, and a task is only acknowledged
  after the HTTP request completes.
- The delivery engine batches events for the same endpoint where sensible, but
  keeps each event independent in the queue so one slow event never blocks the
  rest.
- I would write the attempt outcome to the delivery database on every
  transition, giving an audit trail of exactly what was sent, when, and what the
  response was.

The synchronous path stays minimal.

- The event source publishes to the gateway, the engine resolves subscriptions
  and enqueues, and the worker performs the delivery asynchronously.
- Because the queue sits between production and delivery, a burst of events or a
  down endpoint does not back up the producers.
- Ordering is preserved per endpoint when the customer requires it, which I
  would implement by keying the queue on endpoint so a single consumer processes
  events for that endpoint in order, while different endpoints run in parallel.

The hardest part is knowing when a delivery actually succeeded.

- A 2xx response is success.
- Anything else is a candidate for retry, but timeouts are ambiguous: the
  endpoint may have processed the event and then died before responding.
- The design handles this by making every payload carry an event id and a
  timestamp, and by documenting at-least-once semantics so customers build
  idempotent receivers.
- A reconciliation job scans the delivery database for attempts stuck in flight
  past a timeout and re-enqueues them, which closes the gap between what the
  customer saw and what we think they saw.

### How do you handle retries and backoff?

Retries exist because transient failures are common and most endpoints recover
within seconds or minutes.

- The retry scheduler maintains a per-delivery schedule with exponential
  backoff: start at a few seconds, double each attempt, add jitter to avoid
  thundering herds, and cap the interval at a few minutes.
- I would separate the retry scheduler from the main delivery queue so failed
  deliveries do not sit at the head of the queue and block new events.
- Each retry re-enters the delivery queue with an updated due time, and the
  scheduler is the component that decides when that happens.

Not every failure deserves the same treatment.

- A 429 rate-limit response should retry with respect for the Retry-After
  header.
- A 5xx should retry with standard backoff.
- A 4xx client error such as 404 usually means the endpoint is misconfigured and
  should fail fast.
- I would classify errors on receipt, set an attempt budget per delivery, and
  move permanently failing deliveries to the dead-letter queue with the full
  request and response history so an operator can replay them after fixing the
  endpoint.

Backoff must coordinate with the endpoint's tolerance.

- If every failed webhook retries at the same moment, a recovering endpoint gets
  a burst that knocks it down again, so jitter is mandatory.
- I would also implement circuit breaking per endpoint: after consecutive
  failures the scheduler pauses deliveries to that endpoint and resumes on a
  timer, which protects both the customer's infrastructure and ours.
- The tradeoff is that circuit breaking adds latency to legitimate deliveries,
  so the thresholds are tuned per endpoint tier.
- All retry state is derived from the delivery database, so a scheduler crash
  does not lose the schedule.

### How do you secure webhook payloads?

Webhooks are privileged calls from a trusted platform into a customer's
infrastructure, so the customer must be able to verify the payload came from us
and was not tampered with.

- I would use asymmetric signing: the platform holds a private key, and each
  customer endpoint verifies a signature derived from the payload.
- The signature covers the raw body plus a timestamp, so replaying an old
  payload with a fresh timestamp fails verification.
- Customers receive the public key through the dashboard, and the payload signer
  component generates a fresh signature for every attempt.

Replay and timestamping need explicit handling.

- The signature includes a timestamp, and customers are instructed to reject
  deliveries older than a small skew window.
- Because webhooks can legitimately be delayed by retries, I would allow the
  customer to configure the skew window rather than hardcoding it.
- Delivery attempts to the same endpoint should be distinguishable; each attempt
  gets a unique delivery id that is included in the signed data, so a replayed
  request from a previous attempt is rejected even though the payload event is
  identical.

Sensitive content is handled at the source.

- The signer runs on a dedicated path so keys never enter the application tier,
  and the delivery engine fetches the signing key from a secret store.
- Payloads are delivered over TLS only, and delivery bodies may contain
  sensitive fields; I would let event producers mark fields as redacted so the
  payload sent to the customer omits them or includes them encrypted to the
  customer's public key.
- The delivery database stores payload hashes rather than full bodies where
  possible, so a database leak does not expose customer data.
- Verification failures are logged and can trigger alerting, since they usually
  indicate a misconfigured or compromised endpoint.

### How do you handle slow or down endpoints?

Slow and down endpoints are the normal case for webhooks, so the system is
designed to contain their impact.

- The delivery queue gives each task an HTTP timeout, and a slow endpoint is
  detected by measuring p95 latency across attempts.
- The engine concurrency limits per endpoint prevent slow deliveries from
  consuming the whole worker pool; when a down endpoint fails its attempts, its
  tasks back up in the queue while other endpoints proceed.
- I would isolate endpoints by assigning them dedicated queues, so one
  customer's outage never delays another customer's deliveries.

Down endpoints go through a defined lifecycle.

- When deliveries keep failing, the retry scheduler backs off and eventually
  marks the endpoint as paused, halting deliveries until a liveness check
  succeeds.
- The customer is notified through the dashboard that their endpoint is paused,
  which is an operator signal they can act on.
- During the outage the queue absorbs the backlog, bounded by a retention
  policy; events older than the retention window are dropped into the
  dead-letter queue so they are not lost silently.

The design trades backlog for simplicity.

- Keeping events for hours during an outage preserves their value, but an
  unbounded backlog threatens the whole system, so I would set a per-endpoint
  cap and a global cap with clear semantics for what gets dropped first.
- When the endpoint recovers, the engine drains the backlog with a controlled
  concurrency ramp so it does not overwhelm the customer's now-healthy server.
- Replay is supported from the delivery database, and the dead-letter queue lets
  an operator re-inject individual deliveries after fixing a root cause.
- The result is that a single dead endpoint degrades nothing except its own
  deliveries.

## Source

```text
title: Webhook Delivery
node source: Event Source [icon=cloud]
node app: Service [icon=server]
node gateway: API Gateway [icon=server]
node sub: Subscription Service [icon=compute]
node deliver: Delivery Engine [icon=worker]
node queue: Delivery Queue [icon=queue]
node endpoint: Customer Endpoint [icon=server]
node sign: Payload Signer [icon=shield]
node retry: Retry Scheduler [icon=cache]
node dlq: Dead Letter Queue [icon=queue]
node db: Delivery DB [cylinder, icon=database]

edge source -> app: event
edge app -> gateway: forward
edge gateway -> deliver: submit
edge deliver -> sub: endpoints
edge sub -> queue: enqueue
edge deliver -> sign: payload
edge sign -> endpoint: send
edge endpoint -> deliver: ack
edge deliver -> retry: backoff
edge retry -> dlq: fail
edge deliver -> db: log
```

## Q&A

### Q: Design a webhook delivery system

**A:** A webhook delivery system moves events from an internal service to
customer-owned endpoints over the public internet, which is inherently
unreliable. I would build it around four components.

- A subscription service stores which endpoint receives which event types.
- A delivery engine turns events into HTTP deliveries.
- A durable delivery queue decouples event production from outbound HTTP.
- A retry scheduler plus dead-letter queue handles the inevitable failures.
- A delivery database records every attempt, status, and payload so the whole
  system is observable and replayable.

The flow starts when an event source emits an event to the service, which
forwards it through the gateway to the delivery engine.

- The engine resolves the endpoint from the subscription store, signs the
  payload, and enqueues a delivery task.
- Workers pick the task up, perform the POST, and await an acknowledgement.
- Success is recorded as a single attempt.
- Failure schedules a retry with backoff through the retry scheduler, and
  persistent failures eventually land in the dead-letter queue for inspection
  and replay.

Reliability is the dominant design concern, so everything is built for
at-least-once delivery with idempotency.

- The delivery queue is the source of truth for pending work; if a worker
  crashes mid-POST, the task is re-delivered.
- The customer sees an idempotency header on every payload and can deduplicate.
- The tradeoff is that the customer must be prepared for duplicates, which is
  standard practice for webhook systems such as Stripe.
- The design also keeps delivery latency bounded: it never blocks the event
  source, so producers see a fast acknowledgement and delivery happens on its
  own schedule.

### Q: How do you deliver events reliably?

**A:** Reliable delivery means every accepted event is either delivered or recorded as
failed, even when endpoints are down.

- The delivery queue is durable and replicated, and a task is only acknowledged
  after the HTTP request completes.
- The delivery engine batches events for the same endpoint where sensible, but
  keeps each event independent in the queue so one slow event never blocks the
  rest.
- I would write the attempt outcome to the delivery database on every
  transition, giving an audit trail of exactly what was sent, when, and what the
  response was.

The synchronous path stays minimal.

- The event source publishes to the gateway, the engine resolves subscriptions
  and enqueues, and the worker performs the delivery asynchronously.
- Because the queue sits between production and delivery, a burst of events or a
  down endpoint does not back up the producers.
- Ordering is preserved per endpoint when the customer requires it, which I
  would implement by keying the queue on endpoint so a single consumer processes
  events for that endpoint in order, while different endpoints run in parallel.

The hardest part is knowing when a delivery actually succeeded.

- A 2xx response is success.
- Anything else is a candidate for retry, but timeouts are ambiguous: the
  endpoint may have processed the event and then died before responding.
- The design handles this by making every payload carry an event id and a
  timestamp, and by documenting at-least-once semantics so customers build
  idempotent receivers.
- A reconciliation job scans the delivery database for attempts stuck in flight
  past a timeout and re-enqueues them, which closes the gap between what the
  customer saw and what we think they saw.

### Q: How do you handle retries and backoff?

**A:** Retries exist because transient failures are common and most endpoints recover
within seconds or minutes.

- The retry scheduler maintains a per-delivery schedule with exponential
  backoff: start at a few seconds, double each attempt, add jitter to avoid
  thundering herds, and cap the interval at a few minutes.
- I would separate the retry scheduler from the main delivery queue so failed
  deliveries do not sit at the head of the queue and block new events.
- Each retry re-enters the delivery queue with an updated due time, and the
  scheduler is the component that decides when that happens.

Not every failure deserves the same treatment.

- A 429 rate-limit response should retry with respect for the Retry-After
  header.
- A 5xx should retry with standard backoff.
- A 4xx client error such as 404 usually means the endpoint is misconfigured and
  should fail fast.
- I would classify errors on receipt, set an attempt budget per delivery, and
  move permanently failing deliveries to the dead-letter queue with the full
  request and response history so an operator can replay them after fixing the
  endpoint.

Backoff must coordinate with the endpoint's tolerance.

- If every failed webhook retries at the same moment, a recovering endpoint gets
  a burst that knocks it down again, so jitter is mandatory.
- I would also implement circuit breaking per endpoint: after consecutive
  failures the scheduler pauses deliveries to that endpoint and resumes on a
  timer, which protects both the customer's infrastructure and ours.
- The tradeoff is that circuit breaking adds latency to legitimate deliveries,
  so the thresholds are tuned per endpoint tier.
- All retry state is derived from the delivery database, so a scheduler crash
  does not lose the schedule.

### Q: How do you secure webhook payloads?

**A:** Webhooks are privileged calls from a trusted platform into a customer's
infrastructure, so the customer must be able to verify the payload came from us
and was not tampered with.

- I would use asymmetric signing: the platform holds a private key, and each
  customer endpoint verifies a signature derived from the payload.
- The signature covers the raw body plus a timestamp, so replaying an old
  payload with a fresh timestamp fails verification.
- Customers receive the public key through the dashboard, and the payload signer
  component generates a fresh signature for every attempt.

Replay and timestamping need explicit handling.

- The signature includes a timestamp, and customers are instructed to reject
  deliveries older than a small skew window.
- Because webhooks can legitimately be delayed by retries, I would allow the
  customer to configure the skew window rather than hardcoding it.
- Delivery attempts to the same endpoint should be distinguishable; each attempt
  gets a unique delivery id that is included in the signed data, so a replayed
  request from a previous attempt is rejected even though the payload event is
  identical.

Sensitive content is handled at the source.

- The signer runs on a dedicated path so keys never enter the application tier,
  and the delivery engine fetches the signing key from a secret store.
- Payloads are delivered over TLS only, and delivery bodies may contain
  sensitive fields; I would let event producers mark fields as redacted so the
  payload sent to the customer omits them or includes them encrypted to the
  customer's public key.
- The delivery database stores payload hashes rather than full bodies where
  possible, so a database leak does not expose customer data.
- Verification failures are logged and can trigger alerting, since they usually
  indicate a misconfigured or compromised endpoint.

### Q: How do you handle slow or down endpoints?

**A:** Slow and down endpoints are the normal case for webhooks, so the system is
designed to contain their impact.

- The delivery queue gives each task an HTTP timeout, and a slow endpoint is
  detected by measuring p95 latency across attempts.
- The engine concurrency limits per endpoint prevent slow deliveries from
  consuming the whole worker pool; when a down endpoint fails its attempts, its
  tasks back up in the queue while other endpoints proceed.
- I would isolate endpoints by assigning them dedicated queues, so one
  customer's outage never delays another customer's deliveries.

Down endpoints go through a defined lifecycle.

- When deliveries keep failing, the retry scheduler backs off and eventually
  marks the endpoint as paused, halting deliveries until a liveness check
  succeeds.
- The customer is notified through the dashboard that their endpoint is paused,
  which is an operator signal they can act on.
- During the outage the queue absorbs the backlog, bounded by a retention
  policy; events older than the retention window are dropped into the
  dead-letter queue so they are not lost silently.

The design trades backlog for simplicity.

- Keeping events for hours during an outage preserves their value, but an
  unbounded backlog threatens the whole system, so I would set a per-endpoint
  cap and a global cap with clear semantics for what gets dropped first.
- When the endpoint recovers, the engine drains the backlog with a controlled
  concurrency ramp so it does not overwhelm the customer's now-healthy server.
- Replay is supported from the delivery database, and the dead-letter queue lets
  an operator re-inject individual deliveries after fixing a root cause.
- The result is that a single dead endpoint degrades nothing except its own
  deliveries.

## Source

```text
title: Webhook Delivery
node source: Event Source [icon=cloud]
node app: Service [icon=server]
node gateway: API Gateway [icon=server]
node sub: Subscription Service [icon=compute]
node deliver: Delivery Engine [icon=worker]
node queue: Delivery Queue [icon=queue]
node endpoint: Customer Endpoint [icon=server]
node sign: Payload Signer [icon=shield]
node retry: Retry Scheduler [icon=cache]
node dlq: Dead Letter Queue [icon=queue]
node db: Delivery DB [cylinder, icon=database]

edge source -> app: event
edge app -> gateway: forward
edge gateway -> deliver: submit
edge deliver -> sub: endpoints
edge sub -> queue: enqueue
edge deliver -> sign: payload
edge sign -> endpoint: send
edge endpoint -> deliver: ack
edge deliver -> retry: backoff
edge retry -> dlq: fail
edge deliver -> db: log
```
