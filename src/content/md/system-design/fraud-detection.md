# Fraud Detection

Design a fraud detection system

**Difficulty:** Hard

**Tags:** database, ml, realtime, security

## Functional Requirements

- a fraud detection system
- score transactions in real-time?
- combine rules with ML models?
- retrain models with new fraud patterns?
- avoid false positives?

## Non-Functional Requirements

- A fraud detection system evaluates every transaction in milliseconds and decides
  whether to allow it, block it, or flag it for review.

- The client starts a payment through the Payment App, and the API Gateway
  forwards it to the Transaction Service, which creates a transaction record and
  hands it to the scoring path.
- The Rule Engine applies fast, deterministic checks, such as velocity limits
  and country mismatches, while the Feature Store supplies the enrichment needed
  by the ML Model Service, historical spend, device signals, and account age.
- The Risk Scoring service combines the rule results and the model output into a
  single risk score, and the score maps to an action: allow, block, or
  challenge.
- Events from every decision flow into the Event Queue for downstream alerting
  and model training, and all transactions are recorded in the Transactions DB.

The architecture separates the decision path from the learning path.

- The decision path must be extremely fast, typically returning a verdict within
  tens of milliseconds, because it sits on the payment hot path.
- The learning path is asynchronous: fraud events stream through the Event Queue
  and are used to retrain models and tune rules offline.
- This separation means the decision path stays simple and low-latency while the
  complexity of detecting new fraud patterns lives in the offline pipeline.
- The two paths meet only through the Feature Store and the model registry, so a
  model update is a controlled deployment, not a live code change.

The fundamental challenge is that fraud detection is an adversarial arms race.

- Fraud patterns change constantly, and the system must detect novel attacks it
  has never seen while not disrupting legitimate customers.
- The design responds with redundancy: rules catch patterns that are already
  known, models generalize to patterns that are similar to known fraud, and
  human-in-the-loop review handles the ambiguous cases.
- Every part of the system is evaluated against both sides of the error matrix,
  because the cost of a missed fraud chargeback is very different from the cost
  of blocking a loyal customer..
- Real-time scoring is a pipeline with a strict latency budget.

- When a transaction arrives, the Transaction Service first runs the fastest
  checks: format validation, card status, and basic account velocity.
- The Rule Engine then evaluates rules that are cheap by design, such as "more
  than N transactions in a minute" or "billing country differs from shipping
  country", and each rule contributes either a hard block or a signal to the
  final score.
- In parallel, the Feature Store fetches the features that contextualize the
  transaction, and the ML Model Service scores the enriched feature vector.
- The Risk Scoring component merges everything: a weighted combination of model
  probability and rule signals, adjusted by account history.

The critical constraint is that feature lookup is on the path.

- A model is only as good as its features, so the Feature Store is built for
  low-latency reads, keeping per-account and per-card aggregates in memory and
  updating them asynchronously from the event stream rather than synchronously
  from the transaction itself.
- This introduces slight staleness, but fraud features are robust to it.
- The model itself is served from a model serving layer with batching and
  caching, and the whole decision path is profiled per component so that a
  regression in one stage is caught before it blows the end-to-end budget.

The pipeline is designed to degrade gracefully under load.

- If the model service is slow or down, the system falls back to a rules-only
  decision, which is less precise but still protective.
- If the feature store is slow, the system scores with the features it can fetch
  fast rather than blocking the transaction.
- Every decision records which components contributed and how fast they ran, so
  the operations team can see both correctness and performance.
- The latency of the decision path is measured at the tail, because the p99, not
  the average, determines whether users feel the fraud check at all..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Fraud Detection
user: User
app: Payment App
gateway: API Gateway
txn: Transaction Service
rules: Rule Engine
model: ML Model Service
feature: Feature Store
risk: Risk Scoring
queue: Event Queue
notify: Alerts
db: Transactions DB

user ─► app ─► pay
app ─► gateway ─► charge
gateway ─► txn ─► create
txn ─► rules ─► evaluate
rules ─► feature ─► enrich
feature ─► model ─► predict
model ─► risk ─► score
risk ─► txn ─► allow
risk ─► queue ─► events
queue ─► notify ─► alert
txn ─► db ─► store
```

## Design

### Design a fraud detection system

A fraud detection system evaluates every transaction in milliseconds and decides
whether to allow it, block it, or flag it for review.

- The client starts a payment through the Payment App, and the API Gateway
  forwards it to the Transaction Service, which creates a transaction record and
  hands it to the scoring path.
- The Rule Engine applies fast, deterministic checks, such as velocity limits
  and country mismatches, while the Feature Store supplies the enrichment needed
  by the ML Model Service, historical spend, device signals, and account age.
- The Risk Scoring service combines the rule results and the model output into a
  single risk score, and the score maps to an action: allow, block, or
  challenge.
- Events from every decision flow into the Event Queue for downstream alerting
  and model training, and all transactions are recorded in the Transactions DB.

The architecture separates the decision path from the learning path.

- The decision path must be extremely fast, typically returning a verdict within
  tens of milliseconds, because it sits on the payment hot path.
- The learning path is asynchronous: fraud events stream through the Event Queue
  and are used to retrain models and tune rules offline.
- This separation means the decision path stays simple and low-latency while the
  complexity of detecting new fraud patterns lives in the offline pipeline.
- The two paths meet only through the Feature Store and the model registry, so a
  model update is a controlled deployment, not a live code change.

The fundamental challenge is that fraud detection is an adversarial arms race.

- Fraud patterns change constantly, and the system must detect novel attacks it
  has never seen while not disrupting legitimate customers.
- The design responds with redundancy: rules catch patterns that are already
  known, models generalize to patterns that are similar to known fraud, and
  human-in-the-loop review handles the ambiguous cases.
- Every part of the system is evaluated against both sides of the error matrix,
  because the cost of a missed fraud chargeback is very different from the cost
  of blocking a loyal customer.

### How do you score transactions in real-time?

Real-time scoring is a pipeline with a strict latency budget.

- When a transaction arrives, the Transaction Service first runs the fastest
  checks: format validation, card status, and basic account velocity.
- The Rule Engine then evaluates rules that are cheap by design, such as "more
  than N transactions in a minute" or "billing country differs from shipping
  country", and each rule contributes either a hard block or a signal to the
  final score.
- In parallel, the Feature Store fetches the features that contextualize the
  transaction, and the ML Model Service scores the enriched feature vector.
- The Risk Scoring component merges everything: a weighted combination of model
  probability and rule signals, adjusted by account history.

The critical constraint is that feature lookup is on the path.

- A model is only as good as its features, so the Feature Store is built for
  low-latency reads, keeping per-account and per-card aggregates in memory and
  updating them asynchronously from the event stream rather than synchronously
  from the transaction itself.
- This introduces slight staleness, but fraud features are robust to it.
- The model itself is served from a model serving layer with batching and
  caching, and the whole decision path is profiled per component so that a
  regression in one stage is caught before it blows the end-to-end budget.

The pipeline is designed to degrade gracefully under load.

- If the model service is slow or down, the system falls back to a rules-only
  decision, which is less precise but still protective.
- If the feature store is slow, the system scores with the features it can fetch
  fast rather than blocking the transaction.
- Every decision records which components contributed and how fast they ran, so
  the operations team can see both correctness and performance.
- The latency of the decision path is measured at the tail, because the p99, not
  the average, determines whether users feel the fraud check at all.

### How do you combine rules with ML models?

Rules and models complement each other because they fail differently.

- Rules are deterministic, explainable, and immediately changeable, but they
  only catch patterns someone has already written down.
- Models generalize to new variations of known fraud but are harder to explain
  and slower to update.
- The system therefore runs them in parallel and combines their outputs.
- The Rule Engine produces a set of rule hits, each with a severity, and the
  model produces a fraud probability.
- The Risk Scoring service merges the two with a policy function that can be
  tuned per payment method, per merchant, and per risk tier.

The merge is where the product's risk appetite lives.

- A very strong rule hit can veto a low model score, and a very strong model
  score can override the absence of rule hits, while medium-strength signals
  from both are averaged with weights.
- This is expressed as an explicit policy table rather than buried in code, so
  the risk team can adjust thresholds without a deployment.
- The policy also decides the action: allow, block, or send to manual review.
- The explanation for any decision is the set of rule hits plus the model's top
  contributing features, which is what makes the system auditable and lets
  support agents explain decisions to customers.

Rules and models also train each other.

- When the model identifies fraud patterns with high confidence, those patterns
  are distilled into rules so they can be caught deterministically and cheaply.
- When a rule fires repeatedly with a low fraction of confirmed fraud, it is a
  candidate for retirement or threshold adjustment.
- Both are versioned and evaluated together offline: a proposed rule or model
  change is replayed over recent transactions to estimate what would have
  changed before it goes live.
- The combined system is stronger than either half alone, which is the point of
  running them in parallel rather than choosing one.

### How do you retrain models with new fraud patterns?

Retraining is a continuous loop driven by the ground truth that flows back after
each transaction.

- The fraud label for a transaction is not known at decision time; it is
  confirmed later when the cardholder disputes it, the charge is charged back,
  or a merchant reports it.
- The Event Queue carries every transaction with its features and decision, and
  an offline labeling job joins transactions with their eventual outcomes to
  produce a training set.
- The Training Pipeline builds a new model from this data, with recent
  transactions weighted more heavily, because fraud patterns shift and the model
  must track the current attack rather than the historical one.

Model updates are managed through a strict release process.

- A new model is trained against a held-out window of recent fraud, compared to
  the current model on precision and recall per category, and only promoted if
  it wins or ties on the metrics that matter.
- Before going live, the new model runs in shadow mode, scoring transactions and
  logging what it would have decided without affecting the live verdict.
- If the shadow results look correct, the model is deployed and its decisions
  are monitored for drift.
- Every model carries its training data date and version so that any decision
  can be traced to the model that made it.

The loop also feeds rules and features.

- New fraud patterns discovered in training are examined for their
  distinguishing signals, which may become new features in the Feature Store or
  new rules in the Rule Engine.
- Adversarial novelty is measured by how much fraud the current model missed,
  and those misses become the seed of the next training set.
- The system is evaluated on the fraud rate of the newest cohort, not the
  historical average, because the newest transactions are where the current
  attackers are.
- The entire retraining cycle is automated but gated, so the system improves
  continuously while humans approve every release.

### How do you avoid false positives?

False positives are the system's most expensive output, because every legitimate
customer blocked is a loyalty cost and every transaction declined needs support.

- The first defense is separating confidence from action.
- The model produces a continuous score, and the policy maps score bands to
  actions, so the system can treat the top of the distribution differently from
  the middle.
- Hard blocks are reserved for high-confidence and high-severity cases, medium
  scores trigger a verification step, such as a confirmation prompt or a code
  sent to the cardholder's phone, rather than a block, and low scores pass
  through.
- The verification step converts a binary error into a recoverable one.

The second defense is context and personalization.

- The same signals mean different things for different customers, so scoring is
  conditioned on account history and behavior baselines.
- A customer who normally buys only locally triggering a foreign transaction is
  treated differently from one who travels monthly, and the system learns
  per-customer baselines that decay over time.
- Features are chosen for their separation between fraud and legitimate
  behavior, and noise-prone features are used carefully.
- The training objective explicitly weights the cost of false positives, so the
  model is tuned to accept a slightly higher fraud miss rate in exchange for
  fewer false blocks.

The third defense is feedback at every stage.

- Every blocked or challenged transaction that the customer resolves favorably
  is a false-positive label that feeds the retraining loop, and those examples
  are weighted heavily in the next model.
- Declined-transaction rates and support contacts are tracked per merchant and
  per payment method, and persistent false-positive patterns trigger rule
  adjustments.
- The design philosophy is that fraud detection is an optimization over total
  cost, where the cost of blocking a good customer is measured as carefully as
  the cost of a fraud loss, and the system is tuned to that balance
  continuously.

## Source

```text
title: Fraud Detection
node user: User [round, icon=browser]
node app: Payment App [icon=browser]
node gateway: API Gateway [icon=server]
node txn: Transaction Service [icon=compute]
node rules: Rule Engine [icon=compute]
node model: ML Model Service [icon=cloud]
node feature: Feature Store [icon=cache]
node risk: Risk Scoring [icon=shield]
node queue: Event Queue [icon=queue]
node notify: Alerts [icon=message]
node db: Transactions DB [cylinder, icon=database]

edge user -> app: pay
edge app -> gateway: charge
edge gateway -> txn: create
edge txn -> rules: evaluate
edge rules -> feature: enrich
edge feature -> model: predict
edge model -> risk: score
edge risk -> txn: allow
edge risk -> queue: events
edge queue -> notify: alert
edge txn -> db: store
```

## Q&A

### Q: Design a fraud detection system

**A:** A fraud detection system evaluates every transaction in milliseconds and decides
whether to allow it, block it, or flag it for review.

- The client starts a payment through the Payment App, and the API Gateway
  forwards it to the Transaction Service, which creates a transaction record and
  hands it to the scoring path.
- The Rule Engine applies fast, deterministic checks, such as velocity limits
  and country mismatches, while the Feature Store supplies the enrichment needed
  by the ML Model Service, historical spend, device signals, and account age.
- The Risk Scoring service combines the rule results and the model output into a
  single risk score, and the score maps to an action: allow, block, or
  challenge.
- Events from every decision flow into the Event Queue for downstream alerting
  and model training, and all transactions are recorded in the Transactions DB.

The architecture separates the decision path from the learning path.

- The decision path must be extremely fast, typically returning a verdict within
  tens of milliseconds, because it sits on the payment hot path.
- The learning path is asynchronous: fraud events stream through the Event Queue
  and are used to retrain models and tune rules offline.
- This separation means the decision path stays simple and low-latency while the
  complexity of detecting new fraud patterns lives in the offline pipeline.
- The two paths meet only through the Feature Store and the model registry, so a
  model update is a controlled deployment, not a live code change.

The fundamental challenge is that fraud detection is an adversarial arms race.

- Fraud patterns change constantly, and the system must detect novel attacks it
  has never seen while not disrupting legitimate customers.
- The design responds with redundancy: rules catch patterns that are already
  known, models generalize to patterns that are similar to known fraud, and
  human-in-the-loop review handles the ambiguous cases.
- Every part of the system is evaluated against both sides of the error matrix,
  because the cost of a missed fraud chargeback is very different from the cost
  of blocking a loyal customer.

### Q: How do you score transactions in real-time?

**A:** Real-time scoring is a pipeline with a strict latency budget.

- When a transaction arrives, the Transaction Service first runs the fastest
  checks: format validation, card status, and basic account velocity.
- The Rule Engine then evaluates rules that are cheap by design, such as "more
  than N transactions in a minute" or "billing country differs from shipping
  country", and each rule contributes either a hard block or a signal to the
  final score.
- In parallel, the Feature Store fetches the features that contextualize the
  transaction, and the ML Model Service scores the enriched feature vector.
- The Risk Scoring component merges everything: a weighted combination of model
  probability and rule signals, adjusted by account history.

The critical constraint is that feature lookup is on the path.

- A model is only as good as its features, so the Feature Store is built for
  low-latency reads, keeping per-account and per-card aggregates in memory and
  updating them asynchronously from the event stream rather than synchronously
  from the transaction itself.
- This introduces slight staleness, but fraud features are robust to it.
- The model itself is served from a model serving layer with batching and
  caching, and the whole decision path is profiled per component so that a
  regression in one stage is caught before it blows the end-to-end budget.

The pipeline is designed to degrade gracefully under load.

- If the model service is slow or down, the system falls back to a rules-only
  decision, which is less precise but still protective.
- If the feature store is slow, the system scores with the features it can fetch
  fast rather than blocking the transaction.
- Every decision records which components contributed and how fast they ran, so
  the operations team can see both correctness and performance.
- The latency of the decision path is measured at the tail, because the p99, not
  the average, determines whether users feel the fraud check at all.

### Q: How do you combine rules with ML models?

**A:** Rules and models complement each other because they fail differently.

- Rules are deterministic, explainable, and immediately changeable, but they
  only catch patterns someone has already written down.
- Models generalize to new variations of known fraud but are harder to explain
  and slower to update.
- The system therefore runs them in parallel and combines their outputs.
- The Rule Engine produces a set of rule hits, each with a severity, and the
  model produces a fraud probability.
- The Risk Scoring service merges the two with a policy function that can be
  tuned per payment method, per merchant, and per risk tier.

The merge is where the product's risk appetite lives.

- A very strong rule hit can veto a low model score, and a very strong model
  score can override the absence of rule hits, while medium-strength signals
  from both are averaged with weights.
- This is expressed as an explicit policy table rather than buried in code, so
  the risk team can adjust thresholds without a deployment.
- The policy also decides the action: allow, block, or send to manual review.
- The explanation for any decision is the set of rule hits plus the model's top
  contributing features, which is what makes the system auditable and lets
  support agents explain decisions to customers.

Rules and models also train each other.

- When the model identifies fraud patterns with high confidence, those patterns
  are distilled into rules so they can be caught deterministically and cheaply.
- When a rule fires repeatedly with a low fraction of confirmed fraud, it is a
  candidate for retirement or threshold adjustment.
- Both are versioned and evaluated together offline: a proposed rule or model
  change is replayed over recent transactions to estimate what would have
  changed before it goes live.
- The combined system is stronger than either half alone, which is the point of
  running them in parallel rather than choosing one.

### Q: How do you retrain models with new fraud patterns?

**A:** Retraining is a continuous loop driven by the ground truth that flows back after
each transaction.

- The fraud label for a transaction is not known at decision time; it is
  confirmed later when the cardholder disputes it, the charge is charged back,
  or a merchant reports it.
- The Event Queue carries every transaction with its features and decision, and
  an offline labeling job joins transactions with their eventual outcomes to
  produce a training set.
- The Training Pipeline builds a new model from this data, with recent
  transactions weighted more heavily, because fraud patterns shift and the model
  must track the current attack rather than the historical one.

Model updates are managed through a strict release process.

- A new model is trained against a held-out window of recent fraud, compared to
  the current model on precision and recall per category, and only promoted if
  it wins or ties on the metrics that matter.
- Before going live, the new model runs in shadow mode, scoring transactions and
  logging what it would have decided without affecting the live verdict.
- If the shadow results look correct, the model is deployed and its decisions
  are monitored for drift.
- Every model carries its training data date and version so that any decision
  can be traced to the model that made it.

The loop also feeds rules and features.

- New fraud patterns discovered in training are examined for their
  distinguishing signals, which may become new features in the Feature Store or
  new rules in the Rule Engine.
- Adversarial novelty is measured by how much fraud the current model missed,
  and those misses become the seed of the next training set.
- The system is evaluated on the fraud rate of the newest cohort, not the
  historical average, because the newest transactions are where the current
  attackers are.
- The entire retraining cycle is automated but gated, so the system improves
  continuously while humans approve every release.

### Q: How do you avoid false positives?

**A:** False positives are the system's most expensive output, because every legitimate
customer blocked is a loyalty cost and every transaction declined needs support.

- The first defense is separating confidence from action.
- The model produces a continuous score, and the policy maps score bands to
  actions, so the system can treat the top of the distribution differently from
  the middle.
- Hard blocks are reserved for high-confidence and high-severity cases, medium
  scores trigger a verification step, such as a confirmation prompt or a code
  sent to the cardholder's phone, rather than a block, and low scores pass
  through.
- The verification step converts a binary error into a recoverable one.

The second defense is context and personalization.

- The same signals mean different things for different customers, so scoring is
  conditioned on account history and behavior baselines.
- A customer who normally buys only locally triggering a foreign transaction is
  treated differently from one who travels monthly, and the system learns
  per-customer baselines that decay over time.
- Features are chosen for their separation between fraud and legitimate
  behavior, and noise-prone features are used carefully.
- The training objective explicitly weights the cost of false positives, so the
  model is tuned to accept a slightly higher fraud miss rate in exchange for
  fewer false blocks.

The third defense is feedback at every stage.

- Every blocked or challenged transaction that the customer resolves favorably
  is a false-positive label that feeds the retraining loop, and those examples
  are weighted heavily in the next model.
- Declined-transaction rates and support contacts are tracked per merchant and
  per payment method, and persistent false-positive patterns trigger rule
  adjustments.
- The design philosophy is that fraud detection is an optimization over total
  cost, where the cost of blocking a good customer is measured as carefully as
  the cost of a fraud loss, and the system is tuned to that balance
  continuously.

## Source

```text
title: Fraud Detection
node user: User [round, icon=browser]
node app: Payment App [icon=browser]
node gateway: API Gateway [icon=server]
node txn: Transaction Service [icon=compute]
node rules: Rule Engine [icon=compute]
node model: ML Model Service [icon=cloud]
node feature: Feature Store [icon=cache]
node risk: Risk Scoring [icon=shield]
node queue: Event Queue [icon=queue]
node notify: Alerts [icon=message]
node db: Transactions DB [cylinder, icon=database]

edge user -> app: pay
edge app -> gateway: charge
edge gateway -> txn: create
edge txn -> rules: evaluate
edge rules -> feature: enrich
edge feature -> model: predict
edge model -> risk: score
edge risk -> txn: allow
edge risk -> queue: events
edge queue -> notify: alert
edge txn -> db: store
```
