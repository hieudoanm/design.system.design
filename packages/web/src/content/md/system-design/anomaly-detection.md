# Anomaly Detection

Design an anomaly detection service

**Difficulty:** Medium

**Tags:** analytics, ml, monitoring, time-series

## Functional Requirements

- an anomaly detection service
- detect anomalies in time series?
- reduce false positives?
- score streams in real-time?
- explain detected anomalies?

## Non-Functional Requirements

- An anomaly detection service continuously monitors time series metrics —
  latency, error rates, throughput, resource utilization, business counters — and
  flags behavior that departs from what is expected.

- The pipeline starts at ingestion: metric sources stream into an ingestion
  service that buffers, deduplicates, and normalizes points into a uniform
  schema with consistent time bucketing.
- Points flow through an event queue that decouples ingestion from scoring, so a
  slow model or an alerting storm never backs up the collectors.
- The detection model compares each point against a baseline stored in a
  baseline store, and the scoring engine turns the comparison into a normalized
  anomaly score with a threshold.

The output side matters as much as detection.

- A scoring engine that only emits booleans is not very useful; the service
  surfaces a score, a direction, a confidence, and an explanation for every
  anomaly.
- Alerting is fed by scores above threshold, with deduplication and escalation,
  and the same scores are written to a metrics database that powers dashboards
  and retrospective analysis.

Two design tensions dominate:

- Latency versus accuracy, since real-time scoring cannot wait for expensive
  context.
- Sensitivity versus noise, since alert fatigue destroys trust.

The architecture keeps those tunable by making the baseline store, the model,
and the scoring thresholds separate components that operators can adjust
independently and per metric.

- The service also exposes per-metric dashboards and model-health metrics, so
  operators can see when a detector is degrading before it starts misfiring.
- This visibility is the leading indicator that prevents alert fatigue..
- Time series anomaly detection is fundamentally about comparing an observed value
  to a distribution of expected values.

- The service maintains a baseline for every metric stream — a rolling model of
  the normal range per hour of day and day of week, because traffic has strong
  seasonality.
- Simple metrics use statistical baselines: rolling mean and standard deviation,
  percentiles, or exponentially weighted moving averages, with the anomaly
  defined as deviation beyond a number of sigma or above a percentile band.
- Season-aware models separate trend, seasonal, and residual components so a
  predictable Monday spike is not flagged while a deviation from the Monday
  pattern is.

More complex metrics use density-based or model-based approaches.

- Isolation forests or one-class classifiers learn the normal region of the
  feature space and flag points that fall outside it, while supervised or
  self-supervised models can capture higher-order interactions between
  correlated metrics.
- The detection model combines multiple signals into one score and compares it
  against the baseline.

Because metrics have very different characteristics, the service supports
per-series models and per-series thresholds, selected by the metric type and
history, and it retrains baselines incrementally so the notion of normal drifts
with the business rather than going stale.

- Choosing the right detector is itself a per-series decision: the service
  evaluates candidate models on held-out history, picks the one with the best
  precision at the target latency, and switches baselines atomically so a
  metrics team can tune detection without rearchitecting the pipeline.
- The choice is recorded per series and versioned..
- False positives are the death of an alerting system — teams learn to ignore
  them, then a real incident slips through.

- The first defense is smarter baselines: seasonal and holiday-aware models
  reduce the false positives that come from normal periodic behavior, and
  per-series thresholds are tuned from historical alert history rather than set
  globally.
- Confirmation also matters: a point that is anomalous on a single observation
  is far less convincing than a sustained deviation, so the service applies
  minimum duration and consecutive-sample rules, and it requires corroboration
  across related metrics — one error-rate spike confirmed by rising latency and
  CPU is real, a lone blip usually is not.

The second defense is a feedback loop.

- Detected anomalies get labels — confirmed incident, noise, expected
  maintenance — and those labels retrain and recalibrate thresholds, effectively
  teaching the model what this team considers important.
- Suppression and deduplication rules collapse repeated alerts from the same
  root cause into one, and digest-style aggregation cuts the raw alert volume.
- Unsupervised models are naturally prone to false positives; the service
  therefore favors semi-supervised or supervised refinements once labeled
  history accumulates, and it exposes precision and recall tradeoff controls per
  alert route.

The goal is not zero false positives — that would hide true anomalies — but a
controlled, labeled rate that the on-call team can tolerate.

- Muting and maintenance windows handle the legitimate exceptions, known
  deployments and scheduled jobs, so those do not burn goodwill or pollute the
  label set..
- Real-time scoring is a streaming problem, not a batch one.

- Each metric point must be scored as it arrives, with low latency and without
  replaying history.
- The service processes points in streaming windows: the scoring engine keeps a
  small in-memory state per series — the recent window, the current baseline
  parameters, and running statistics — and updates them incrementally as points
  arrive.
- The queue in front of scoring smooths bursts and provides backpressure, while
  parallel scoring workers are sharded by series so each series is processed by
  exactly one worker, which keeps its state consistent and lock-free.
- This is the same partitioning pattern stream processors use, and it makes
  per-series memory bounded.

The baseline itself must update in real time too.

- Rather than recomputing from stored history, the service uses streaming
  estimators — exponentially weighted moving averages, online variance, and
  sliding-window statistics — that fold new points in cheaply and let old points
  decay.
- Scoring is a small constant-time computation per point: fetch or update the
  estimator, compute the deviation, and emit a score.
- That arithmetic per point is tiny, so a single worker handles tens of
  thousands of points per second, and the fleet scales horizontally by adding
  shards.

Bounded state is critical:

- If per-series state grows unbounded, workers spill to disk or handle fewer
  series, so the service bounds window sizes and evicts idle series to the
  baseline store.
- When a series' state must be rebuilt, the service replays a bounded history
  from the metrics database rather than waiting for new points, so scoring is
  correct shortly after a worker restart or shard migration..
- An anomaly score without context is noise; an anomaly with an explanation is
  actionable.

- The explanation service reconstructs why a point was flagged: which signal
  contributed most, which metric dimension drifted — host, region, endpoint —
  how far the value sat from the baseline, and how it compares with history.
- For statistical models this is natural: the service reports the mean, the
  standard deviation, the observed value, and the magnitude of the deviation.
- For model-based detectors, attribution techniques such as feature importance
  or counterfactual baselines identify the contributing dimensions, and the
  service always lists correlated metrics to show the blast radius.

Explanations do double duty:

- They make alert triage faster.
- They are the raw material for reducing false positives, because a confirmed
  explanation becomes training data.

The service also produces a short natural-language summary and links to the
dashboard view of the metric during the anomaly window, so an on-call engineer
goes from page to diagnosis without opening five different tools.

- Explanations are generated asynchronously relative to the score — the alert
  fires immediately, and the explanation fills in within seconds — so alert
  latency is not sacrificed.

Keeping the explanation deterministic and reproducible matters for
debuggability:

- The same input window and model version must produce the same explanation,
  which is why the service pins model versions and replays the exact features at
  scoring time.
- Explanations also feed the alert UI and the incident workflow, attaching the
  why to the page so the on-call engineer can act and the next model iteration
  has clean, labeled examples.

## Source

````text
title: Anomaly Detection
node source: Metric Sources [icon=cloud]
node app: Dashboard [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Service [icon=worker]
node queue: Event Queue [icon=queue]
node model: Detection Model [icon=cloud]
node baseline: Baseline Store [cylinder, icon=database]
node score: Scoring Engine [icon=compute]
node alert: Alerting [icon=message]
node explain: Explanation Service [icon=compute]
node db: Metrics DB [cylinder, icon=database]

edge source -> app: stream
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> queue: enqueue
edge queue -> model: score
edge model -> baseline: compare
edge baseline -> score: threshold
edge score -> alert: trigger
edge alert -> app: notify
edge score -> explain: reason
edge score -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Anomaly Detection
source: Metric Sources
app: Dashboard
gateway: API Gateway
ingest: Ingestion Service
queue: Event Queue
model: Detection Model
baseline: Baseline Store
score: Scoring Engine
alert: Alerting
explain: Explanation Service
db: Metrics DB

source ─► app ─► stream
app ─► gateway ─► forward
gateway ─► ingest ─► buffer
ingest ─► queue ─► enqueue
queue ─► model ─► score
model ─► baseline ─► compare
baseline ─► score ─► threshold
score ─► alert ─► trigger
alert ─► app ─► notify
score ─► explain ─► reason
score ─► db ─► store
````

## Design

### Design an anomaly detection service

An anomaly detection service continuously monitors time series metrics —
latency, error rates, throughput, resource utilization, business counters — and
flags behavior that departs from what is expected.

- The pipeline starts at ingestion: metric sources stream into an ingestion
  service that buffers, deduplicates, and normalizes points into a uniform
  schema with consistent time bucketing.
- Points flow through an event queue that decouples ingestion from scoring, so a
  slow model or an alerting storm never backs up the collectors.
- The detection model compares each point against a baseline stored in a
  baseline store, and the scoring engine turns the comparison into a normalized
  anomaly score with a threshold.

The output side matters as much as detection.

- A scoring engine that only emits booleans is not very useful; the service
  surfaces a score, a direction, a confidence, and an explanation for every
  anomaly.
- Alerting is fed by scores above threshold, with deduplication and escalation,
  and the same scores are written to a metrics database that powers dashboards
  and retrospective analysis.

Two design tensions dominate:

- Latency versus accuracy, since real-time scoring cannot wait for expensive
  context.
- Sensitivity versus noise, since alert fatigue destroys trust.

The architecture keeps those tunable by making the baseline store, the model,
and the scoring thresholds separate components that operators can adjust
independently and per metric.

- The service also exposes per-metric dashboards and model-health metrics, so
  operators can see when a detector is degrading before it starts misfiring.
- This visibility is the leading indicator that prevents alert fatigue.

### How do you detect anomalies in time series?

Time series anomaly detection is fundamentally about comparing an observed value
to a distribution of expected values.

- The service maintains a baseline for every metric stream — a rolling model of
  the normal range per hour of day and day of week, because traffic has strong
  seasonality.
- Simple metrics use statistical baselines: rolling mean and standard deviation,
  percentiles, or exponentially weighted moving averages, with the anomaly
  defined as deviation beyond a number of sigma or above a percentile band.
- Season-aware models separate trend, seasonal, and residual components so a
  predictable Monday spike is not flagged while a deviation from the Monday
  pattern is.

More complex metrics use density-based or model-based approaches.

- Isolation forests or one-class classifiers learn the normal region of the
  feature space and flag points that fall outside it, while supervised or
  self-supervised models can capture higher-order interactions between
  correlated metrics.
- The detection model combines multiple signals into one score and compares it
  against the baseline.

Because metrics have very different characteristics, the service supports
per-series models and per-series thresholds, selected by the metric type and
history, and it retrains baselines incrementally so the notion of normal drifts
with the business rather than going stale.

- Choosing the right detector is itself a per-series decision: the service
  evaluates candidate models on held-out history, picks the one with the best
  precision at the target latency, and switches baselines atomically so a
  metrics team can tune detection without rearchitecting the pipeline.
- The choice is recorded per series and versioned.

### How do you reduce false positives?

False positives are the death of an alerting system — teams learn to ignore
them, then a real incident slips through.

- The first defense is smarter baselines: seasonal and holiday-aware models
  reduce the false positives that come from normal periodic behavior, and
  per-series thresholds are tuned from historical alert history rather than set
  globally.
- Confirmation also matters: a point that is anomalous on a single observation
  is far less convincing than a sustained deviation, so the service applies
  minimum duration and consecutive-sample rules, and it requires corroboration
  across related metrics — one error-rate spike confirmed by rising latency and
  CPU is real, a lone blip usually is not.

The second defense is a feedback loop.

- Detected anomalies get labels — confirmed incident, noise, expected
  maintenance — and those labels retrain and recalibrate thresholds, effectively
  teaching the model what this team considers important.
- Suppression and deduplication rules collapse repeated alerts from the same
  root cause into one, and digest-style aggregation cuts the raw alert volume.
- Unsupervised models are naturally prone to false positives; the service
  therefore favors semi-supervised or supervised refinements once labeled
  history accumulates, and it exposes precision and recall tradeoff controls per
  alert route.

The goal is not zero false positives — that would hide true anomalies — but a
controlled, labeled rate that the on-call team can tolerate.

- Muting and maintenance windows handle the legitimate exceptions, known
  deployments and scheduled jobs, so those do not burn goodwill or pollute the
  label set.

### How do you score streams in real-time?

Real-time scoring is a streaming problem, not a batch one.

- Each metric point must be scored as it arrives, with low latency and without
  replaying history.
- The service processes points in streaming windows: the scoring engine keeps a
  small in-memory state per series — the recent window, the current baseline
  parameters, and running statistics — and updates them incrementally as points
  arrive.
- The queue in front of scoring smooths bursts and provides backpressure, while
  parallel scoring workers are sharded by series so each series is processed by
  exactly one worker, which keeps its state consistent and lock-free.
- This is the same partitioning pattern stream processors use, and it makes
  per-series memory bounded.

The baseline itself must update in real time too.

- Rather than recomputing from stored history, the service uses streaming
  estimators — exponentially weighted moving averages, online variance, and
  sliding-window statistics — that fold new points in cheaply and let old points
  decay.
- Scoring is a small constant-time computation per point: fetch or update the
  estimator, compute the deviation, and emit a score.
- That arithmetic per point is tiny, so a single worker handles tens of
  thousands of points per second, and the fleet scales horizontally by adding
  shards.

Bounded state is critical:

- If per-series state grows unbounded, workers spill to disk or handle fewer
  series, so the service bounds window sizes and evicts idle series to the
  baseline store.
- When a series' state must be rebuilt, the service replays a bounded history
  from the metrics database rather than waiting for new points, so scoring is
  correct shortly after a worker restart or shard migration.

### How do you explain detected anomalies?

An anomaly score without context is noise; an anomaly with an explanation is
actionable.

- The explanation service reconstructs why a point was flagged: which signal
  contributed most, which metric dimension drifted — host, region, endpoint —
  how far the value sat from the baseline, and how it compares with history.
- For statistical models this is natural: the service reports the mean, the
  standard deviation, the observed value, and the magnitude of the deviation.
- For model-based detectors, attribution techniques such as feature importance
  or counterfactual baselines identify the contributing dimensions, and the
  service always lists correlated metrics to show the blast radius.

Explanations do double duty:

- They make alert triage faster.
- They are the raw material for reducing false positives, because a confirmed
  explanation becomes training data.

The service also produces a short natural-language summary and links to the
dashboard view of the metric during the anomaly window, so an on-call engineer
goes from page to diagnosis without opening five different tools.

- Explanations are generated asynchronously relative to the score — the alert
  fires immediately, and the explanation fills in within seconds — so alert
  latency is not sacrificed.

Keeping the explanation deterministic and reproducible matters for
debuggability:

- The same input window and model version must produce the same explanation,
  which is why the service pins model versions and replays the exact features at
  scoring time.
- Explanations also feed the alert UI and the incident workflow, attaching the
  why to the page so the on-call engineer can act and the next model iteration
  has clean, labeled examples.

## Source

```text
title: Anomaly Detection
node source: Metric Sources [icon=cloud]
node app: Dashboard [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Service [icon=worker]
node queue: Event Queue [icon=queue]
node model: Detection Model [icon=cloud]
node baseline: Baseline Store [cylinder, icon=database]
node score: Scoring Engine [icon=compute]
node alert: Alerting [icon=message]
node explain: Explanation Service [icon=compute]
node db: Metrics DB [cylinder, icon=database]

edge source -> app: stream
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> queue: enqueue
edge queue -> model: score
edge model -> baseline: compare
edge baseline -> score: threshold
edge score -> alert: trigger
edge alert -> app: notify
edge score -> explain: reason
edge score -> db: store
```

## Q&A

### Q: Design an anomaly detection service

**A:** An anomaly detection service continuously monitors time series metrics —
latency, error rates, throughput, resource utilization, business counters — and
flags behavior that departs from what is expected.

- The pipeline starts at ingestion: metric sources stream into an ingestion
  service that buffers, deduplicates, and normalizes points into a uniform
  schema with consistent time bucketing.
- Points flow through an event queue that decouples ingestion from scoring, so a
  slow model or an alerting storm never backs up the collectors.
- The detection model compares each point against a baseline stored in a
  baseline store, and the scoring engine turns the comparison into a normalized
  anomaly score with a threshold.

The output side matters as much as detection.

- A scoring engine that only emits booleans is not very useful; the service
  surfaces a score, a direction, a confidence, and an explanation for every
  anomaly.
- Alerting is fed by scores above threshold, with deduplication and escalation,
  and the same scores are written to a metrics database that powers dashboards
  and retrospective analysis.

Two design tensions dominate:

- Latency versus accuracy, since real-time scoring cannot wait for expensive
  context.
- Sensitivity versus noise, since alert fatigue destroys trust.

The architecture keeps those tunable by making the baseline store, the model,
and the scoring thresholds separate components that operators can adjust
independently and per metric.

- The service also exposes per-metric dashboards and model-health metrics, so
  operators can see when a detector is degrading before it starts misfiring.
- This visibility is the leading indicator that prevents alert fatigue.

### Q: How do you detect anomalies in time series?

**A:** Time series anomaly detection is fundamentally about comparing an observed value
to a distribution of expected values.

- The service maintains a baseline for every metric stream — a rolling model of
  the normal range per hour of day and day of week, because traffic has strong
  seasonality.
- Simple metrics use statistical baselines: rolling mean and standard deviation,
  percentiles, or exponentially weighted moving averages, with the anomaly
  defined as deviation beyond a number of sigma or above a percentile band.
- Season-aware models separate trend, seasonal, and residual components so a
  predictable Monday spike is not flagged while a deviation from the Monday
  pattern is.

More complex metrics use density-based or model-based approaches.

- Isolation forests or one-class classifiers learn the normal region of the
  feature space and flag points that fall outside it, while supervised or
  self-supervised models can capture higher-order interactions between
  correlated metrics.
- The detection model combines multiple signals into one score and compares it
  against the baseline.

Because metrics have very different characteristics, the service supports
per-series models and per-series thresholds, selected by the metric type and
history, and it retrains baselines incrementally so the notion of normal drifts
with the business rather than going stale.

- Choosing the right detector is itself a per-series decision: the service
  evaluates candidate models on held-out history, picks the one with the best
  precision at the target latency, and switches baselines atomically so a
  metrics team can tune detection without rearchitecting the pipeline.
- The choice is recorded per series and versioned.

### Q: How do you reduce false positives?

**A:** False positives are the death of an alerting system — teams learn to ignore
them, then a real incident slips through.

- The first defense is smarter baselines: seasonal and holiday-aware models
  reduce the false positives that come from normal periodic behavior, and
  per-series thresholds are tuned from historical alert history rather than set
  globally.
- Confirmation also matters: a point that is anomalous on a single observation
  is far less convincing than a sustained deviation, so the service applies
  minimum duration and consecutive-sample rules, and it requires corroboration
  across related metrics — one error-rate spike confirmed by rising latency and
  CPU is real, a lone blip usually is not.

The second defense is a feedback loop.

- Detected anomalies get labels — confirmed incident, noise, expected
  maintenance — and those labels retrain and recalibrate thresholds, effectively
  teaching the model what this team considers important.
- Suppression and deduplication rules collapse repeated alerts from the same
  root cause into one, and digest-style aggregation cuts the raw alert volume.
- Unsupervised models are naturally prone to false positives; the service
  therefore favors semi-supervised or supervised refinements once labeled
  history accumulates, and it exposes precision and recall tradeoff controls per
  alert route.

The goal is not zero false positives — that would hide true anomalies — but a
controlled, labeled rate that the on-call team can tolerate.

- Muting and maintenance windows handle the legitimate exceptions, known
  deployments and scheduled jobs, so those do not burn goodwill or pollute the
  label set.

### Q: How do you score streams in real-time?

**A:** Real-time scoring is a streaming problem, not a batch one.

- Each metric point must be scored as it arrives, with low latency and without
  replaying history.
- The service processes points in streaming windows: the scoring engine keeps a
  small in-memory state per series — the recent window, the current baseline
  parameters, and running statistics — and updates them incrementally as points
  arrive.
- The queue in front of scoring smooths bursts and provides backpressure, while
  parallel scoring workers are sharded by series so each series is processed by
  exactly one worker, which keeps its state consistent and lock-free.
- This is the same partitioning pattern stream processors use, and it makes
  per-series memory bounded.

The baseline itself must update in real time too.

- Rather than recomputing from stored history, the service uses streaming
  estimators — exponentially weighted moving averages, online variance, and
  sliding-window statistics — that fold new points in cheaply and let old points
  decay.
- Scoring is a small constant-time computation per point: fetch or update the
  estimator, compute the deviation, and emit a score.
- That arithmetic per point is tiny, so a single worker handles tens of
  thousands of points per second, and the fleet scales horizontally by adding
  shards.

Bounded state is critical:

- If per-series state grows unbounded, workers spill to disk or handle fewer
  series, so the service bounds window sizes and evicts idle series to the
  baseline store.
- When a series' state must be rebuilt, the service replays a bounded history
  from the metrics database rather than waiting for new points, so scoring is
  correct shortly after a worker restart or shard migration.

### Q: How do you explain detected anomalies?

**A:** An anomaly score without context is noise; an anomaly with an explanation is
actionable.

- The explanation service reconstructs why a point was flagged: which signal
  contributed most, which metric dimension drifted — host, region, endpoint —
  how far the value sat from the baseline, and how it compares with history.
- For statistical models this is natural: the service reports the mean, the
  standard deviation, the observed value, and the magnitude of the deviation.
- For model-based detectors, attribution techniques such as feature importance
  or counterfactual baselines identify the contributing dimensions, and the
  service always lists correlated metrics to show the blast radius.

Explanations do double duty:

- They make alert triage faster.
- They are the raw material for reducing false positives, because a confirmed
  explanation becomes training data.

The service also produces a short natural-language summary and links to the
dashboard view of the metric during the anomaly window, so an on-call engineer
goes from page to diagnosis without opening five different tools.

- Explanations are generated asynchronously relative to the score — the alert
  fires immediately, and the explanation fills in within seconds — so alert
  latency is not sacrificed.

Keeping the explanation deterministic and reproducible matters for
debuggability:

- The same input window and model version must produce the same explanation,
  which is why the service pins model versions and replays the exact features at
  scoring time.
- Explanations also feed the alert UI and the incident workflow, attaching the
  why to the page so the on-call engineer can act and the next model iteration
  has clean, labeled examples.

## Source

```text
title: Anomaly Detection
node source: Metric Sources [icon=cloud]
node app: Dashboard [icon=browser]
node gateway: API Gateway [icon=server]
node ingest: Ingestion Service [icon=worker]
node queue: Event Queue [icon=queue]
node model: Detection Model [icon=cloud]
node baseline: Baseline Store [cylinder, icon=database]
node score: Scoring Engine [icon=compute]
node alert: Alerting [icon=message]
node explain: Explanation Service [icon=compute]
node db: Metrics DB [cylinder, icon=database]

edge source -> app: stream
edge app -> gateway: forward
edge gateway -> ingest: buffer
edge ingest -> queue: enqueue
edge queue -> model: score
edge model -> baseline: compare
edge baseline -> score: threshold
edge score -> alert: trigger
edge alert -> app: notify
edge score -> explain: reason
edge score -> db: store
```
