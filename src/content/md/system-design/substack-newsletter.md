# Substack — Newsletter

Design a newsletter / mailing platform

**Difficulty:** Hard

**Tags:** analytics, social

## Functional Requirements

- a newsletter / mailing platform
- send campaigns to millions of subscribers?
- handle bounces and unsubscribes?
- track opens and clicks?
- manage paid subscriptions?

## Non-Functional Requirements

- A newsletter platform is an email delivery system with an authoring product
  wrapped around it.

- The author writes in a browser, the Campaign Service turns the post into a
  scheduled send, the Subscriber Service provides the audience list, and a Send
  Engine pushes the message to every recipient.
- Because delivery is the core, everything downstream of the author edit is
  built for throughput, deliverability, and observability.
- The API gateway is the entry point for authoring, list management, and the
  analytics dashboard, while the actual sending happens through queues and
  worker pools so the request path never blocks on the volume of mail.

The lifecycle of a post makes the architecture clear.

- An author publishes, a campaign record is created with its schedule and
  audience segment, and the recipient list is resolved as a snapshot so later
  subscription changes do not silently alter who receives the mail.
- The list is enqueued as batches into the Send Queue, workers dispatch each
  batch through an email delivery provider, and delivery reports stream back to
  update status and analytics.
- The Subscribers DB holds the canonical audience state, while the analytics
  layer accumulates opens, clicks, and bounces for the author's dashboard.

The design splits reads from writes cleanly.

- A campaign with a million subscribers is a write problem solved by batching
  and parallelism; an author checking open rates is a read problem solved by
  pre-aggregated reports.
- Both paths share the same event stream: every delivery, open, and click is an
  event, consumed by the analytics pipeline and by the lists that track
  deliverability health.
- This event backbone is what lets the platform answer two questions at once:
  did the campaign go out, and did anyone care about it?.
- Sending to millions means parallelizing the send while respecting the
  constraints of the internet.

- The campaign is broken into batches of a few hundred recipients each, and
  batches are distributed across worker pools, each of which submits to the
  email delivery provider or sends directly via SMTP.
- The Send Queue is the buffer that absorbs rate differences: if the delivery
  provider throttles, workers back off and the queue holds the remainder.
- A campaign of a million recipients is therefore not one send but thousands of
  small sends, spread over minutes, coordinated by a cursor so every recipient
  is attempted exactly once.

Rate shaping is the art of the send.

- Providers and ISPs penalize senders whose volume spikes, so the Send Engine
  ramps up gradually, uses warm-up profiles for new domains, and honors
  per-domain and per-ISP rate limits.
- The queue is partitioned by sending domain, so a problem with one domain's
  reputation cannot stall the whole campaign.
- Delivery is distributed across multiple providers for resilience; if one
  provider's throughput collapses, a circuit breaker diverts new batches to the
  others.
- Failures are retried with backoff, and persistent failures land in a
  dead-letter state for the author to see as "not delivered".

The sender reputation is the hidden currency.

- The platform tracks complaint rates, bounce rates, and spam-list status per
  sending domain, because a single bad campaign can burn a domain for weeks.
- Authentication such as DKIM and SPF is configured per domain, and the platform
  monitors alignment continuously.
- The design goal is a durable throughput curve, not a raw burst: the queue, the
  workers, and the provider pool are all sized so that a million-recipient
  campaign completes in minutes without ever tripping a reputation alarm..
- Open tracking is a pixel that reports without the reader knowing.

- Each campaign email embeds a unique tracking URL pointing at an image the
  client fetches, and that request carries a per-recipient token that links the
  open to the subscriber and the campaign.
- Because many clients block images or prefetch aggressively, the open count is
  a lower bound on real reads, and the platform treats it as a trend signal
  rather than an exact count.
- The token is opaque and single-purpose, so recipients cannot be correlated
  outside the campaign context.

Click tracking wraps every link in the email.

- The visible href points at a redirect service that logs the click, then
  forwards to the real destination.
- This gives precise per-link statistics and also enables safety checks, since
  the platform can flag links that resolve to known phishing or malware
  destinations.
- Both open and click events are written to a high-throughput event stream,
  batched, and aggregated per campaign, per hour, and per link so the author's
  dashboard renders quickly even while events are still arriving.

Counting is harder than it looks.

- An event is unique per recipient per campaign, so the pipeline deduplicates by
  recipient and event type; a recipient who opens ten times counts once for
  "open rate" but contributes ten to "opens".
- Time zones and delayed mail clients mean events arrive for days after a send,
  so reports are recomputed with an as-of window.
- The analytics store is a columnar or time-series database that makes per-link
  and per-recipient slicing fast, and the raw event log is retained separately
  for audits and deeper analysis.
- The result is a dashboard that answers how many people opened, clicked, and
  stayed until the end..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Newsletter
author: Author
app: Writing App
gateway: API Gateway
campaign: Campaign Service
subscriber: Subscriber Service
send: Send Engine
queue: Send Queue
mail: Email Delivery
track: Tracking Pixel
analytics: Analytics
db: Subscribers DB

author ─► app ─► publish post
app ─► gateway ─► create
gateway ─► campaign ─► schedule
campaign ─► subscriber ─► list
subscriber ─► queue ─► enqueue
queue ─► send ─► dispatch
send ─► mail ─► deliver
mail ─► track ─► opens
track ─► analytics ─► events
campaign ─► analytics ─► report
campaign ─► db ─► store
```

## Design

### Design a newsletter / mailing platform

A newsletter platform is an email delivery system with an authoring product
wrapped around it.

- The author writes in a browser, the Campaign Service turns the post into a
  scheduled send, the Subscriber Service provides the audience list, and a Send
  Engine pushes the message to every recipient.
- Because delivery is the core, everything downstream of the author edit is
  built for throughput, deliverability, and observability.
- The API gateway is the entry point for authoring, list management, and the
  analytics dashboard, while the actual sending happens through queues and
  worker pools so the request path never blocks on the volume of mail.

The lifecycle of a post makes the architecture clear.

- An author publishes, a campaign record is created with its schedule and
  audience segment, and the recipient list is resolved as a snapshot so later
  subscription changes do not silently alter who receives the mail.
- The list is enqueued as batches into the Send Queue, workers dispatch each
  batch through an email delivery provider, and delivery reports stream back to
  update status and analytics.
- The Subscribers DB holds the canonical audience state, while the analytics
  layer accumulates opens, clicks, and bounces for the author's dashboard.

The design splits reads from writes cleanly.

- A campaign with a million subscribers is a write problem solved by batching
  and parallelism; an author checking open rates is a read problem solved by
  pre-aggregated reports.
- Both paths share the same event stream: every delivery, open, and click is an
  event, consumed by the analytics pipeline and by the lists that track
  deliverability health.
- This event backbone is what lets the platform answer two questions at once:
  did the campaign go out, and did anyone care about it?

### How do you send campaigns to millions of subscribers?

Sending to millions means parallelizing the send while respecting the
constraints of the internet.

- The campaign is broken into batches of a few hundred recipients each, and
  batches are distributed across worker pools, each of which submits to the
  email delivery provider or sends directly via SMTP.
- The Send Queue is the buffer that absorbs rate differences: if the delivery
  provider throttles, workers back off and the queue holds the remainder.
- A campaign of a million recipients is therefore not one send but thousands of
  small sends, spread over minutes, coordinated by a cursor so every recipient
  is attempted exactly once.

Rate shaping is the art of the send.

- Providers and ISPs penalize senders whose volume spikes, so the Send Engine
  ramps up gradually, uses warm-up profiles for new domains, and honors
  per-domain and per-ISP rate limits.
- The queue is partitioned by sending domain, so a problem with one domain's
  reputation cannot stall the whole campaign.
- Delivery is distributed across multiple providers for resilience; if one
  provider's throughput collapses, a circuit breaker diverts new batches to the
  others.
- Failures are retried with backoff, and persistent failures land in a
  dead-letter state for the author to see as "not delivered".

The sender reputation is the hidden currency.

- The platform tracks complaint rates, bounce rates, and spam-list status per
  sending domain, because a single bad campaign can burn a domain for weeks.
- Authentication such as DKIM and SPF is configured per domain, and the platform
  monitors alignment continuously.
- The design goal is a durable throughput curve, not a raw burst: the queue, the
  workers, and the provider pool are all sized so that a million-recipient
  campaign completes in minutes without ever tripping a reputation alarm.

### How do you handle bounces and unsubscribes?

Bounces and unsubscribes are the signal from the real world that the list
quality is changing, and handling them correctly is what keeps a sending domain
alive.

- A bounce is classified as hard or soft.
- A hard bounce, a permanently invalid address, removes the subscriber from the
  list immediately and records the reason; a soft bounce, a full mailbox or a
  temporarily down host, triggers a retry with backoff, and the subscriber is
  only removed after a threshold of consecutive soft bounces.
- The classification happens in the email ingestion pipeline that parses
  provider delivery reports and SMTP bounce codes, not in the send path, so
  sending workers are never blocked.

Unsubscribes must be honored with legal precision.

- Every campaign email carries an unsubscribe link that resolves to a one-click
  endpoint, and every compliance regime, such as CAN-SPAM and GDPR, treats a
  failed unsubscribe as a serious violation.
- The Subscriber Service processes the unsubscribe immediately, writes the
  suppression record, and propagates it through an index so no future campaign
  can include that address.
- A global suppression list sits in front of every send, because a user who
  unsubscribed from one newsletter must not be re-added by an imported list.

The system also learns from the failure modes.

- A list is only as good as its freshness, so re-engagement campaigns target
  subscribers who have gone cold, and addresses that never open are gradually
  retired.
- Complaint feedback loops, where the user marks mail as spam at the mailbox
  provider, feed a similar list.
- Bounce and complaint rates are aggregated per domain and per campaign, and
  thresholds trigger warnings to the author before a list becomes a reputation
  liability.
- All of this is surfaced in the dashboard so the author sees deliverability as
  an actionable metric, not an afterthought.

### How do you track opens and clicks?

Open tracking is a pixel that reports without the reader knowing.

- Each campaign email embeds a unique tracking URL pointing at an image the
  client fetches, and that request carries a per-recipient token that links the
  open to the subscriber and the campaign.
- Because many clients block images or prefetch aggressively, the open count is
  a lower bound on real reads, and the platform treats it as a trend signal
  rather than an exact count.
- The token is opaque and single-purpose, so recipients cannot be correlated
  outside the campaign context.

Click tracking wraps every link in the email.

- The visible href points at a redirect service that logs the click, then
  forwards to the real destination.
- This gives precise per-link statistics and also enables safety checks, since
  the platform can flag links that resolve to known phishing or malware
  destinations.
- Both open and click events are written to a high-throughput event stream,
  batched, and aggregated per campaign, per hour, and per link so the author's
  dashboard renders quickly even while events are still arriving.

Counting is harder than it looks.

- An event is unique per recipient per campaign, so the pipeline deduplicates by
  recipient and event type; a recipient who opens ten times counts once for
  "open rate" but contributes ten to "opens".
- Time zones and delayed mail clients mean events arrive for days after a send,
  so reports are recomputed with an as-of window.
- The analytics store is a columnar or time-series database that makes per-link
  and per-recipient slicing fast, and the raw event log is retained separately
  for audits and deeper analysis.
- The result is a dashboard that answers how many people opened, clicked, and
  stayed until the end.

### How do you manage paid subscriptions?

Paid subscriptions turn a mailing platform into a commerce system with a
recurring billing component.

- The platform integrates with a payment processor that handles the actual card
  charging, while the Subscription Service owns the business state: plan tier,
  status, billing period, and next renewal date.
- When a reader subscribes, a checkout flow captures payment details, the
  processor stores them on a tokenized vault, and the Subscription Service
  records the grant, which in turn activates paid-only content access.
- The authoring side exposes which posts are paywalled, and the access check
  runs at read time against the subscription state.

Lifecycle events drive the system.

- A successful renewal extends the grant, a failed payment starts a retry
  sequence with a grace period, and a subscription that cannot be recovered
  downgrades to a limited state rather than vanishing.
- The processor's webhooks are the source of truth for money events, and the
  platform reconciles them against its own records daily so a missed webhook
  does not create a silent gap.
- Because a subscriber can also get a refund or chargeback, the ledger must
  support reversals, and the access grants are revoked accordingly.
- This money path is kept deliberately separate from the email path, so a
  billing outage never blocks an author from sending a post.

The product layer sits on top.

- Authors set prices and tiers, and the platform handles pro-ration, coupons,
  and annual-versus-monthly billing through the subscription plan model.
- Analytics attribute revenue to posts, so an author sees which articles
  converted readers into paying subscribers.
- Compliance matters: the platform issues receipts, honors tax requirements in
  supported jurisdictions, and retains the audit trail that a payment business
  needs.
- The design principle is that subscriptions are a separate bounded context,
  integrated with the rest of the product only through clean interfaces for
  access control and revenue reporting.

## Source

```text
title: Newsletter
node author: Author [round, icon=browser]
node app: Writing App [icon=browser]
node gateway: API Gateway [icon=server]
node campaign: Campaign Service [icon=compute]
node subscriber: Subscriber Service [icon=users]
node send: Send Engine [icon=worker]
node queue: Send Queue [icon=queue]
node mail: Email Delivery [icon=mail]
node track: Tracking Pixel [icon=cache]
node analytics: Analytics [icon=compute]
node db: Subscribers DB [cylinder, icon=database]

edge author -> app: publish post
edge app -> gateway: create
edge gateway -> campaign: schedule
edge campaign -> subscriber: list
edge subscriber -> queue: enqueue
edge queue -> send: dispatch
edge send -> mail: deliver
edge mail -> track: opens
edge track -> analytics: events
edge campaign -> analytics: report
edge campaign -> db: store
```

## Q&A

### Q: Design a newsletter / mailing platform

**A:** A newsletter platform is an email delivery system with an authoring product
wrapped around it.

- The author writes in a browser, the Campaign Service turns the post into a
  scheduled send, the Subscriber Service provides the audience list, and a Send
  Engine pushes the message to every recipient.
- Because delivery is the core, everything downstream of the author edit is
  built for throughput, deliverability, and observability.
- The API gateway is the entry point for authoring, list management, and the
  analytics dashboard, while the actual sending happens through queues and
  worker pools so the request path never blocks on the volume of mail.

The lifecycle of a post makes the architecture clear.

- An author publishes, a campaign record is created with its schedule and
  audience segment, and the recipient list is resolved as a snapshot so later
  subscription changes do not silently alter who receives the mail.
- The list is enqueued as batches into the Send Queue, workers dispatch each
  batch through an email delivery provider, and delivery reports stream back to
  update status and analytics.
- The Subscribers DB holds the canonical audience state, while the analytics
  layer accumulates opens, clicks, and bounces for the author's dashboard.

The design splits reads from writes cleanly.

- A campaign with a million subscribers is a write problem solved by batching
  and parallelism; an author checking open rates is a read problem solved by
  pre-aggregated reports.
- Both paths share the same event stream: every delivery, open, and click is an
  event, consumed by the analytics pipeline and by the lists that track
  deliverability health.
- This event backbone is what lets the platform answer two questions at once:
  did the campaign go out, and did anyone care about it?

### Q: How do you send campaigns to millions of subscribers?

**A:** Sending to millions means parallelizing the send while respecting the
constraints of the internet.

- The campaign is broken into batches of a few hundred recipients each, and
  batches are distributed across worker pools, each of which submits to the
  email delivery provider or sends directly via SMTP.
- The Send Queue is the buffer that absorbs rate differences: if the delivery
  provider throttles, workers back off and the queue holds the remainder.
- A campaign of a million recipients is therefore not one send but thousands of
  small sends, spread over minutes, coordinated by a cursor so every recipient
  is attempted exactly once.

Rate shaping is the art of the send.

- Providers and ISPs penalize senders whose volume spikes, so the Send Engine
  ramps up gradually, uses warm-up profiles for new domains, and honors
  per-domain and per-ISP rate limits.
- The queue is partitioned by sending domain, so a problem with one domain's
  reputation cannot stall the whole campaign.
- Delivery is distributed across multiple providers for resilience; if one
  provider's throughput collapses, a circuit breaker diverts new batches to the
  others.
- Failures are retried with backoff, and persistent failures land in a
  dead-letter state for the author to see as "not delivered".

The sender reputation is the hidden currency.

- The platform tracks complaint rates, bounce rates, and spam-list status per
  sending domain, because a single bad campaign can burn a domain for weeks.
- Authentication such as DKIM and SPF is configured per domain, and the platform
  monitors alignment continuously.
- The design goal is a durable throughput curve, not a raw burst: the queue, the
  workers, and the provider pool are all sized so that a million-recipient
  campaign completes in minutes without ever tripping a reputation alarm.

### Q: How do you handle bounces and unsubscribes?

**A:** Bounces and unsubscribes are the signal from the real world that the list
quality is changing, and handling them correctly is what keeps a sending domain
alive.

- A bounce is classified as hard or soft.
- A hard bounce, a permanently invalid address, removes the subscriber from the
  list immediately and records the reason; a soft bounce, a full mailbox or a
  temporarily down host, triggers a retry with backoff, and the subscriber is
  only removed after a threshold of consecutive soft bounces.
- The classification happens in the email ingestion pipeline that parses
  provider delivery reports and SMTP bounce codes, not in the send path, so
  sending workers are never blocked.

Unsubscribes must be honored with legal precision.

- Every campaign email carries an unsubscribe link that resolves to a one-click
  endpoint, and every compliance regime, such as CAN-SPAM and GDPR, treats a
  failed unsubscribe as a serious violation.
- The Subscriber Service processes the unsubscribe immediately, writes the
  suppression record, and propagates it through an index so no future campaign
  can include that address.
- A global suppression list sits in front of every send, because a user who
  unsubscribed from one newsletter must not be re-added by an imported list.

The system also learns from the failure modes.

- A list is only as good as its freshness, so re-engagement campaigns target
  subscribers who have gone cold, and addresses that never open are gradually
  retired.
- Complaint feedback loops, where the user marks mail as spam at the mailbox
  provider, feed a similar list.
- Bounce and complaint rates are aggregated per domain and per campaign, and
  thresholds trigger warnings to the author before a list becomes a reputation
  liability.
- All of this is surfaced in the dashboard so the author sees deliverability as
  an actionable metric, not an afterthought.

### Q: How do you track opens and clicks?

**A:** Open tracking is a pixel that reports without the reader knowing.

- Each campaign email embeds a unique tracking URL pointing at an image the
  client fetches, and that request carries a per-recipient token that links the
  open to the subscriber and the campaign.
- Because many clients block images or prefetch aggressively, the open count is
  a lower bound on real reads, and the platform treats it as a trend signal
  rather than an exact count.
- The token is opaque and single-purpose, so recipients cannot be correlated
  outside the campaign context.

Click tracking wraps every link in the email.

- The visible href points at a redirect service that logs the click, then
  forwards to the real destination.
- This gives precise per-link statistics and also enables safety checks, since
  the platform can flag links that resolve to known phishing or malware
  destinations.
- Both open and click events are written to a high-throughput event stream,
  batched, and aggregated per campaign, per hour, and per link so the author's
  dashboard renders quickly even while events are still arriving.

Counting is harder than it looks.

- An event is unique per recipient per campaign, so the pipeline deduplicates by
  recipient and event type; a recipient who opens ten times counts once for
  "open rate" but contributes ten to "opens".
- Time zones and delayed mail clients mean events arrive for days after a send,
  so reports are recomputed with an as-of window.
- The analytics store is a columnar or time-series database that makes per-link
  and per-recipient slicing fast, and the raw event log is retained separately
  for audits and deeper analysis.
- The result is a dashboard that answers how many people opened, clicked, and
  stayed until the end.

### Q: How do you manage paid subscriptions?

**A:** Paid subscriptions turn a mailing platform into a commerce system with a
recurring billing component.

- The platform integrates with a payment processor that handles the actual card
  charging, while the Subscription Service owns the business state: plan tier,
  status, billing period, and next renewal date.
- When a reader subscribes, a checkout flow captures payment details, the
  processor stores them on a tokenized vault, and the Subscription Service
  records the grant, which in turn activates paid-only content access.
- The authoring side exposes which posts are paywalled, and the access check
  runs at read time against the subscription state.

Lifecycle events drive the system.

- A successful renewal extends the grant, a failed payment starts a retry
  sequence with a grace period, and a subscription that cannot be recovered
  downgrades to a limited state rather than vanishing.
- The processor's webhooks are the source of truth for money events, and the
  platform reconciles them against its own records daily so a missed webhook
  does not create a silent gap.
- Because a subscriber can also get a refund or chargeback, the ledger must
  support reversals, and the access grants are revoked accordingly.
- This money path is kept deliberately separate from the email path, so a
  billing outage never blocks an author from sending a post.

The product layer sits on top.

- Authors set prices and tiers, and the platform handles pro-ration, coupons,
  and annual-versus-monthly billing through the subscription plan model.
- Analytics attribute revenue to posts, so an author sees which articles
  converted readers into paying subscribers.
- Compliance matters: the platform issues receipts, honors tax requirements in
  supported jurisdictions, and retains the audit trail that a payment business
  needs.
- The design principle is that subscriptions are a separate bounded context,
  integrated with the rest of the product only through clean interfaces for
  access control and revenue reporting.

## Source

```text
title: Newsletter
node author: Author [round, icon=browser]
node app: Writing App [icon=browser]
node gateway: API Gateway [icon=server]
node campaign: Campaign Service [icon=compute]
node subscriber: Subscriber Service [icon=users]
node send: Send Engine [icon=worker]
node queue: Send Queue [icon=queue]
node mail: Email Delivery [icon=mail]
node track: Tracking Pixel [icon=cache]
node analytics: Analytics [icon=compute]
node db: Subscribers DB [cylinder, icon=database]

edge author -> app: publish post
edge app -> gateway: create
edge gateway -> campaign: schedule
edge campaign -> subscriber: list
edge subscriber -> queue: enqueue
edge queue -> send: dispatch
edge send -> mail: deliver
edge mail -> track: opens
edge track -> analytics: events
edge campaign -> analytics: report
edge campaign -> db: store
```
