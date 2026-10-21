# Sentiment Analysis

Design a sentiment analysis service

**Difficulty:** Hard

**Tags:** analytics, ml, realtime

## Functional Requirements

- a sentiment analysis service
- classify sentiment at scale?
- aggregate sentiment over time?
- handle streaming data sources?
- evaluate and improve accuracy?

## Non-Functional Requirements

- A sentiment analysis service takes text from many sources, classifies each piece
  as positive, negative, or neutral, and presents the results as time-series
  trends and dashboards.

The flow is decoupled by an Event Queue:

- Data Sources stream text continuously, and the Dashboard App is the read side
  that renders aggregated results.
- An Ingestion Worker buffers incoming text, enqueues it, and a pool of
  classifier workers consume the queue and score each message with the Sentiment
  Model.
- Each scored message flows to the Aggregation Engine, which buckets results by
  time and dimension and writes aggregates into a Time Series Store.
- The Dashboard Service queries that store for the Dashboard App.
- The Model Monitor watches the classifier for drift while a Scores DB retains
  the raw scored records.

The queue is the backbone of the design because it decouples the write rate from
the read and processing rate:

- Sources produce text in bursts, and consumers cannot be allowed to fall behind
  permanently or to be overwhelmed.
- The queue absorbs the burst, lets the consumer fleet scale independently of
  the producers, and gives the pipeline replay semantics when a consumer fails.
- Buffering also lets the ingestion layer normalize formats, so every source,
  whether a tweet, a review, or a survey response, becomes a uniform event
  before classification.

The system must handle two distinct traffic shapes:

- Streaming sources arrive in real time and drive the live dashboards.
- Batch sources, such as historical reviews, arrive in large chunks and backfill
  the aggregates.
- Both paths converge on the same classification and aggregation stages, which
  keeps the machinery simple.
- The design goal is that a newly ingested message changes the dashboard within
  seconds, while the pipeline remains robust to producer outages, consumer
  failures, and wildly variable message volumes..
- Classification is a machine learning problem served as a stateless scoring
  service:

- Each message is tokenized, normalized, and converted into the feature
  representation the Sentiment Model expects, typically an embedding vector.
- The model predicts a probability distribution over sentiment classes, and the
  service emits the most likely class with a confidence score.
- Neutral is treated as a real class rather than the absence of signal, because
  in product reviews and social posts neutral is the majority of the traffic,
  and miscounting it corrupts every downstream trend.
- The confidence score is carried through the pipeline so downstream aggregation
  can weight or filter low-confidence predictions.

Throughput is governed by model inference cost, so the serving tier is built for
batching:

- Consumers collect messages into micro-batches, run the model on the batch in
  one pass on a GPU or an optimized CPU kernel, and emit one result per message.
- Batch inference is often an order of magnitude cheaper than per-message
  inference, so the queue size and consumer count are tuned to maximize batch
  fill without exceeding latency targets.
- The model service is horizontally scaled, and because inference is stateless,
  any message can be scored by any instance.

Scale also means defending the model from pathological input:

- Long documents are truncated or chunked with overlapping windows.
- Non-text payloads are rejected at ingestion.
- Adversarial or non-linguistic input is handled by a fallback path that yields
  neutral with low confidence.
- The Scores DB records every classification with its input hash, timestamp, and
  source, so the team can reproduce the scoring decision later.
- This raw store is also the foundation for monitoring, since the distribution
  of predicted classes and confidences is the first signal that the model has
  started misbehaving..
- Raw classifications are individual events, but the product value is the trend.

The Aggregation Engine consumes the scored stream and folds each message into
pre-aggregated buckets:

- Buckets are keyed by time window, source, and dimension such as product or
  topic.
- Buckets are typically one-minute or five-minute tumbling windows, and each
  bucket stores the count per sentiment class plus a rolling positivity score,
  which can be a weighted average of the class labels or the mean of the
  confidence-weighted score.
- Writing aggregates instead of raw events into the Time Series Store keeps the
  dashboard queries cheap and bounded, since the number of buckets is tiny
  compared to the number of messages.

Aggregation must handle two failure modes: late events and out-of-order arrival:

- A message that was queued during a slow consumer burst may arrive after its
  window closed, so the engine uses watermark-based windowing and explicitly
  re-aggregates late events into their correct bucket or into a correction
  bucket that the dashboard merges.
- Without this, the tails of the distribution are silently undercounted and
  trends drift.
- The bucket store is also designed for idempotent writes, so a replayed batch
  of messages updates counters in a way that is exactly computable regardless of
  duplication.

The Time Series Store serves the dashboard directly and is read-heavy:

- It is optimized for range scans and downsampling.
- The Dashboard Service rolls fine-grained buckets into hourly and daily series,
  so the same store serves both a live minute-by-minute view and a six-month
  trend with predictable latency.
- Aggregates are stored as compact rows rather than raw events, and the
  retention policy keeps raw events in the Scores DB for a shorter window while
  aggregates persist much longer, balancing cost against the ability to
  recompute history if the aggregation logic changes..
- Streaming is the dominant input pattern, and the design treats the ingestion
  tier as a throughput funnel:

- Each Data Source connects through a stable ingestion endpoint, and the
  Ingestion Worker validates, normalizes, and enriches the message before
  enqueueing it.
- Normalization matters because sources differ wildly: a tweet has emoji and
  truncation, a review has star ratings alongside text, and a chat message has
  slang.
- The worker also applies backpressure to producers, because a fast source must
  slow down or buffer rather than overwhelm the queue, and it tags each message
  with an arrival timestamp and source ID that flow through every downstream
  stage.

The Event Queue gives the pipeline its resilience properties:

- Producers and consumers are fully decoupled, so a source outage or a
  classifier outage does not take the other down.
- Consumers track their position in the queue and commit offsets only after a
  message is durably scored and written, which provides at-least-once delivery.
- That choice forces idempotency downstream: aggregation is designed so that a
  duplicated message updates a count exactly once.
- The queue also enables parallel consumption, with partitions per source or
  hash so that ordering within a source is preserved when it matters.

Streaming brings steady-state operation and monitoring concerns that batch
systems do not have:

- The consumer group lag is the primary health metric, because sustained lag
  means the dashboard is showing the past.
- Autoscaling of consumers is driven by lag rather than CPU, adding capacity
  when the backlog grows and shedding it when it shrinks.
- Replays are a deliberate feature, so when classification logic is fixed, the
  pipeline can rewind the queue position and reprocess a window of history,
  giving the team a cheap way to correct a bad stretch of predictions..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Sentiment Analysis
source: Data Sources
app: Dashboard App
gateway: API Gateway
ingest: Ingestion Worker
queue: Event Queue
classify: Sentiment Model
agg: Aggregation Engine
store: Time Series Store
dash: Dashboard Service
monitor: Model Monitor
db: Scores DB

source ─► app ─► stream
app ─► gateway ─► forward
gateway ─► ingest ─► buffer
ingest ─► queue ─► enqueue
queue ─► classify ─► score
classify ─► agg ─► aggregate
agg ─► store ─► buckets
store ─► dash ─► query
dash ─► app ─► render
classify ─► monitor ─► drift
classify ─► db ─► store
```

## Design

### Design a sentiment analysis service

A sentiment analysis service takes text from many sources, classifies each piece
as positive, negative, or neutral, and presents the results as time-series
trends and dashboards.

The flow is decoupled by an Event Queue:

- Data Sources stream text continuously, and the Dashboard App is the read side
  that renders aggregated results.
- An Ingestion Worker buffers incoming text, enqueues it, and a pool of
  classifier workers consume the queue and score each message with the Sentiment
  Model.
- Each scored message flows to the Aggregation Engine, which buckets results by
  time and dimension and writes aggregates into a Time Series Store.
- The Dashboard Service queries that store for the Dashboard App.
- The Model Monitor watches the classifier for drift while a Scores DB retains
  the raw scored records.

The queue is the backbone of the design because it decouples the write rate from
the read and processing rate:

- Sources produce text in bursts, and consumers cannot be allowed to fall behind
  permanently or to be overwhelmed.
- The queue absorbs the burst, lets the consumer fleet scale independently of
  the producers, and gives the pipeline replay semantics when a consumer fails.
- Buffering also lets the ingestion layer normalize formats, so every source,
  whether a tweet, a review, or a survey response, becomes a uniform event
  before classification.

The system must handle two distinct traffic shapes:

- Streaming sources arrive in real time and drive the live dashboards.
- Batch sources, such as historical reviews, arrive in large chunks and backfill
  the aggregates.
- Both paths converge on the same classification and aggregation stages, which
  keeps the machinery simple.
- The design goal is that a newly ingested message changes the dashboard within
  seconds, while the pipeline remains robust to producer outages, consumer
  failures, and wildly variable message volumes.

### How do you classify sentiment at scale?

Classification is a machine learning problem served as a stateless scoring
service:

- Each message is tokenized, normalized, and converted into the feature
  representation the Sentiment Model expects, typically an embedding vector.
- The model predicts a probability distribution over sentiment classes, and the
  service emits the most likely class with a confidence score.
- Neutral is treated as a real class rather than the absence of signal, because
  in product reviews and social posts neutral is the majority of the traffic,
  and miscounting it corrupts every downstream trend.
- The confidence score is carried through the pipeline so downstream aggregation
  can weight or filter low-confidence predictions.

Throughput is governed by model inference cost, so the serving tier is built for
batching:

- Consumers collect messages into micro-batches, run the model on the batch in
  one pass on a GPU or an optimized CPU kernel, and emit one result per message.
- Batch inference is often an order of magnitude cheaper than per-message
  inference, so the queue size and consumer count are tuned to maximize batch
  fill without exceeding latency targets.
- The model service is horizontally scaled, and because inference is stateless,
  any message can be scored by any instance.

Scale also means defending the model from pathological input:

- Long documents are truncated or chunked with overlapping windows.
- Non-text payloads are rejected at ingestion.
- Adversarial or non-linguistic input is handled by a fallback path that yields
  neutral with low confidence.
- The Scores DB records every classification with its input hash, timestamp, and
  source, so the team can reproduce the scoring decision later.
- This raw store is also the foundation for monitoring, since the distribution
  of predicted classes and confidences is the first signal that the model has
  started misbehaving.

### How do you aggregate sentiment over time?

Raw classifications are individual events, but the product value is the trend.

The Aggregation Engine consumes the scored stream and folds each message into
pre-aggregated buckets:

- Buckets are keyed by time window, source, and dimension such as product or
  topic.
- Buckets are typically one-minute or five-minute tumbling windows, and each
  bucket stores the count per sentiment class plus a rolling positivity score,
  which can be a weighted average of the class labels or the mean of the
  confidence-weighted score.
- Writing aggregates instead of raw events into the Time Series Store keeps the
  dashboard queries cheap and bounded, since the number of buckets is tiny
  compared to the number of messages.

Aggregation must handle two failure modes: late events and out-of-order arrival:

- A message that was queued during a slow consumer burst may arrive after its
  window closed, so the engine uses watermark-based windowing and explicitly
  re-aggregates late events into their correct bucket or into a correction
  bucket that the dashboard merges.
- Without this, the tails of the distribution are silently undercounted and
  trends drift.
- The bucket store is also designed for idempotent writes, so a replayed batch
  of messages updates counters in a way that is exactly computable regardless of
  duplication.

The Time Series Store serves the dashboard directly and is read-heavy:

- It is optimized for range scans and downsampling.
- The Dashboard Service rolls fine-grained buckets into hourly and daily series,
  so the same store serves both a live minute-by-minute view and a six-month
  trend with predictable latency.
- Aggregates are stored as compact rows rather than raw events, and the
  retention policy keeps raw events in the Scores DB for a shorter window while
  aggregates persist much longer, balancing cost against the ability to
  recompute history if the aggregation logic changes.

### How do you handle streaming data sources?

Streaming is the dominant input pattern, and the design treats the ingestion
tier as a throughput funnel:

- Each Data Source connects through a stable ingestion endpoint, and the
  Ingestion Worker validates, normalizes, and enriches the message before
  enqueueing it.
- Normalization matters because sources differ wildly: a tweet has emoji and
  truncation, a review has star ratings alongside text, and a chat message has
  slang.
- The worker also applies backpressure to producers, because a fast source must
  slow down or buffer rather than overwhelm the queue, and it tags each message
  with an arrival timestamp and source ID that flow through every downstream
  stage.

The Event Queue gives the pipeline its resilience properties:

- Producers and consumers are fully decoupled, so a source outage or a
  classifier outage does not take the other down.
- Consumers track their position in the queue and commit offsets only after a
  message is durably scored and written, which provides at-least-once delivery.
- That choice forces idempotency downstream: aggregation is designed so that a
  duplicated message updates a count exactly once.
- The queue also enables parallel consumption, with partitions per source or
  hash so that ordering within a source is preserved when it matters.

Streaming brings steady-state operation and monitoring concerns that batch
systems do not have:

- The consumer group lag is the primary health metric, because sustained lag
  means the dashboard is showing the past.
- Autoscaling of consumers is driven by lag rather than CPU, adding capacity
  when the backlog grows and shedding it when it shrinks.
- Replays are a deliberate feature, so when classification logic is fixed, the
  pipeline can rewind the queue position and reprocess a window of history,
  giving the team a cheap way to correct a bad stretch of predictions.

### How do you evaluate and improve accuracy?

Accuracy is a pipeline property, not just a model property, so evaluation starts
with labeled ground truth:

- The team maintains a labeled test set of messages spanning the sources and
  domains the product serves, and every candidate model or threshold change is
  scored against it before deployment.
- Precision, recall, and F1 are measured per class, and the acceptance bar is
  per-domain, because a model that nails product reviews may fail on sarcastic
  social posts.
- The same evaluation harness gates rule changes and model updates, so the
  system cannot silently regress.

The Model Monitor provides the runtime half of evaluation:

- It tracks the distribution of predicted classes, confidence scores, and
  vocabulary over time, and flags drift when the input distribution moves away
  from what the model was trained on.
- A classic failure is domain shift, where a new product launch or a new slang
  term changes the language without changing the labels.
- The monitor also samples scored messages for human review, producing
  continuously refreshed ground truth that feeds the evaluation set and detects
  accuracy decay that distribution monitoring alone cannot see.

Improvement closes the loop back into training:

- Sampled misclassifications from the monitor are labeled and added to the
  training set, and the model is retrained on a schedule, with the new version
  validated on a held-out window and compared against the current version before
  promotion.
- Aggregated acceptance data from the dashboard, such as how trends compared to
  expectations, feeds back as weak labels.
- Every version is logged in the Scores DB, so a change in dashboard behavior
  can be traced to the exact model and input distribution that produced it.

## Source

```text
title: Sentiment Analysis
node source: Data Sources [icon=cloud]
node app: Dashboard App [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Worker [icon=worker]
node queue: Event Queue [icon=queue]
node classify: Sentiment Model [icon=cloud]
node agg: Aggregation Engine [icon=compute]
node store: Time Series Store [cylinder, icon=database]
node dash: Dashboard Service [icon=search]
node monitor: Model Monitor [icon=cache]
node db: Scores DB [cylinder, icon=database]

edge source -> app: stream
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> queue: enqueue
edge queue -> classify: score
edge classify -> agg: aggregate
edge agg -> store: buckets
edge store -> dash: query
edge dash -> app: render
edge classify -> monitor: drift
edge classify -> db: store
```

## Q&A

### Q: Design a sentiment analysis service

**A:** A sentiment analysis service takes text from many sources, classifies each piece
as positive, negative, or neutral, and presents the results as time-series
trends and dashboards.

The flow is decoupled by an Event Queue:

- Data Sources stream text continuously, and the Dashboard App is the read side
  that renders aggregated results.
- An Ingestion Worker buffers incoming text, enqueues it, and a pool of
  classifier workers consume the queue and score each message with the Sentiment
  Model.
- Each scored message flows to the Aggregation Engine, which buckets results by
  time and dimension and writes aggregates into a Time Series Store.
- The Dashboard Service queries that store for the Dashboard App.
- The Model Monitor watches the classifier for drift while a Scores DB retains
  the raw scored records.

The queue is the backbone of the design because it decouples the write rate from
the read and processing rate:

- Sources produce text in bursts, and consumers cannot be allowed to fall behind
  permanently or to be overwhelmed.
- The queue absorbs the burst, lets the consumer fleet scale independently of
  the producers, and gives the pipeline replay semantics when a consumer fails.
- Buffering also lets the ingestion layer normalize formats, so every source,
  whether a tweet, a review, or a survey response, becomes a uniform event
  before classification.

The system must handle two distinct traffic shapes:

- Streaming sources arrive in real time and drive the live dashboards.
- Batch sources, such as historical reviews, arrive in large chunks and backfill
  the aggregates.
- Both paths converge on the same classification and aggregation stages, which
  keeps the machinery simple.
- The design goal is that a newly ingested message changes the dashboard within
  seconds, while the pipeline remains robust to producer outages, consumer
  failures, and wildly variable message volumes.

### Q: How do you classify sentiment at scale?

**A:** Classification is a machine learning problem served as a stateless scoring
service:

- Each message is tokenized, normalized, and converted into the feature
  representation the Sentiment Model expects, typically an embedding vector.
- The model predicts a probability distribution over sentiment classes, and the
  service emits the most likely class with a confidence score.
- Neutral is treated as a real class rather than the absence of signal, because
  in product reviews and social posts neutral is the majority of the traffic,
  and miscounting it corrupts every downstream trend.
- The confidence score is carried through the pipeline so downstream aggregation
  can weight or filter low-confidence predictions.

Throughput is governed by model inference cost, so the serving tier is built for
batching:

- Consumers collect messages into micro-batches, run the model on the batch in
  one pass on a GPU or an optimized CPU kernel, and emit one result per message.
- Batch inference is often an order of magnitude cheaper than per-message
  inference, so the queue size and consumer count are tuned to maximize batch
  fill without exceeding latency targets.
- The model service is horizontally scaled, and because inference is stateless,
  any message can be scored by any instance.

Scale also means defending the model from pathological input:

- Long documents are truncated or chunked with overlapping windows.
- Non-text payloads are rejected at ingestion.
- Adversarial or non-linguistic input is handled by a fallback path that yields
  neutral with low confidence.
- The Scores DB records every classification with its input hash, timestamp, and
  source, so the team can reproduce the scoring decision later.
- This raw store is also the foundation for monitoring, since the distribution
  of predicted classes and confidences is the first signal that the model has
  started misbehaving.

### Q: How do you aggregate sentiment over time?

**A:** Raw classifications are individual events, but the product value is the trend.

The Aggregation Engine consumes the scored stream and folds each message into
pre-aggregated buckets:

- Buckets are keyed by time window, source, and dimension such as product or
  topic.
- Buckets are typically one-minute or five-minute tumbling windows, and each
  bucket stores the count per sentiment class plus a rolling positivity score,
  which can be a weighted average of the class labels or the mean of the
  confidence-weighted score.
- Writing aggregates instead of raw events into the Time Series Store keeps the
  dashboard queries cheap and bounded, since the number of buckets is tiny
  compared to the number of messages.

Aggregation must handle two failure modes: late events and out-of-order arrival:

- A message that was queued during a slow consumer burst may arrive after its
  window closed, so the engine uses watermark-based windowing and explicitly
  re-aggregates late events into their correct bucket or into a correction
  bucket that the dashboard merges.
- Without this, the tails of the distribution are silently undercounted and
  trends drift.
- The bucket store is also designed for idempotent writes, so a replayed batch
  of messages updates counters in a way that is exactly computable regardless of
  duplication.

The Time Series Store serves the dashboard directly and is read-heavy:

- It is optimized for range scans and downsampling.
- The Dashboard Service rolls fine-grained buckets into hourly and daily series,
  so the same store serves both a live minute-by-minute view and a six-month
  trend with predictable latency.
- Aggregates are stored as compact rows rather than raw events, and the
  retention policy keeps raw events in the Scores DB for a shorter window while
  aggregates persist much longer, balancing cost against the ability to
  recompute history if the aggregation logic changes.

### Q: How do you handle streaming data sources?

**A:** Streaming is the dominant input pattern, and the design treats the ingestion
tier as a throughput funnel:

- Each Data Source connects through a stable ingestion endpoint, and the
  Ingestion Worker validates, normalizes, and enriches the message before
  enqueueing it.
- Normalization matters because sources differ wildly: a tweet has emoji and
  truncation, a review has star ratings alongside text, and a chat message has
  slang.
- The worker also applies backpressure to producers, because a fast source must
  slow down or buffer rather than overwhelm the queue, and it tags each message
  with an arrival timestamp and source ID that flow through every downstream
  stage.

The Event Queue gives the pipeline its resilience properties:

- Producers and consumers are fully decoupled, so a source outage or a
  classifier outage does not take the other down.
- Consumers track their position in the queue and commit offsets only after a
  message is durably scored and written, which provides at-least-once delivery.
- That choice forces idempotency downstream: aggregation is designed so that a
  duplicated message updates a count exactly once.
- The queue also enables parallel consumption, with partitions per source or
  hash so that ordering within a source is preserved when it matters.

Streaming brings steady-state operation and monitoring concerns that batch
systems do not have:

- The consumer group lag is the primary health metric, because sustained lag
  means the dashboard is showing the past.
- Autoscaling of consumers is driven by lag rather than CPU, adding capacity
  when the backlog grows and shedding it when it shrinks.
- Replays are a deliberate feature, so when classification logic is fixed, the
  pipeline can rewind the queue position and reprocess a window of history,
  giving the team a cheap way to correct a bad stretch of predictions.

### Q: How do you evaluate and improve accuracy?

**A:** Accuracy is a pipeline property, not just a model property, so evaluation starts
with labeled ground truth:

- The team maintains a labeled test set of messages spanning the sources and
  domains the product serves, and every candidate model or threshold change is
  scored against it before deployment.
- Precision, recall, and F1 are measured per class, and the acceptance bar is
  per-domain, because a model that nails product reviews may fail on sarcastic
  social posts.
- The same evaluation harness gates rule changes and model updates, so the
  system cannot silently regress.

The Model Monitor provides the runtime half of evaluation:

- It tracks the distribution of predicted classes, confidence scores, and
  vocabulary over time, and flags drift when the input distribution moves away
  from what the model was trained on.
- A classic failure is domain shift, where a new product launch or a new slang
  term changes the language without changing the labels.
- The monitor also samples scored messages for human review, producing
  continuously refreshed ground truth that feeds the evaluation set and detects
  accuracy decay that distribution monitoring alone cannot see.

Improvement closes the loop back into training:

- Sampled misclassifications from the monitor are labeled and added to the
  training set, and the model is retrained on a schedule, with the new version
  validated on a held-out window and compared against the current version before
  promotion.
- Aggregated acceptance data from the dashboard, such as how trends compared to
  expectations, feeds back as weak labels.
- Every version is logged in the Scores DB, so a change in dashboard behavior
  can be traced to the exact model and input distribution that produced it.

## Source

```text
title: Sentiment Analysis
node source: Data Sources [icon=cloud]
node app: Dashboard App [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Worker [icon=worker]
node queue: Event Queue [icon=queue]
node classify: Sentiment Model [icon=cloud]
node agg: Aggregation Engine [icon=compute]
node store: Time Series Store [cylinder, icon=database]
node dash: Dashboard Service [icon=search]
node monitor: Model Monitor [icon=cache]
node db: Scores DB [cylinder, icon=database]

edge source -> app: stream
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> queue: enqueue
edge queue -> classify: score
edge classify -> agg: aggregate
edge agg -> store: buckets
edge store -> dash: query
edge dash -> app: render
edge classify -> monitor: drift
edge classify -> db: store
```
