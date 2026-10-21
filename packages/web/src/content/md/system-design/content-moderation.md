# Content Moderation

Design a content moderation system

**Difficulty:** Hard

**Tags:** ml, security

## Functional Requirements

- a content moderation system
- detect violating images and text?
- combine automated and human review?
- handle policy changes?
- scale to millions of uploads?

## Non-Functional Requirements

- A content moderation system screens every upload against a content policy and
  decides what is allowed, what is removed, and what needs a human judgment.

- The upload flows from the client through the API Gateway into the Moderation
  Pipeline, which runs automated checks in parallel.
- The Image Detector and the Text Detector each invoke the ML Models tier, a set
  of specialized models for categories such as adult content, violence, hate
  speech, and spam, and each model returns a category and a confidence score.
- The pipeline combines the scores into a single policy verdict.
- Clear violations are rejected immediately, clearly clean content is accepted,
  and everything in the middle is routed to the Human Review queue, where
  reviewers adjudicate and the decision is recorded in the Moderation DB before
  the user is notified.

The architecture is organized around the cost of mistakes.

- A false positive, removing content that is fine, is a user trust failure,
  while a false negative, letting a violation through, is a safety failure, and
  the tiered design lets the operator choose the balance for each content type
  and audience.
- Latency and throughput also pull in opposite directions: the automated path
  must be fast enough to feel synchronous, typically under a second for the
  verdict, while the human path is inherently slower and asynchronous.
- The design therefore keeps the automated verdict path as the scaling core and
  treats human review as a managed backlog with priority classes rather than as
  part of the request hot path.

Moderation is also a continuously changing problem.

- Policy changes, new attack patterns, and model updates mean the system is
  never finished.
- Every automated decision is logged with the full feature vector that produced
  it, so a policy change can be replayed over historical decisions without
  reprocessing the original media.
- The pipeline is versioned as a whole, and shadow runs of a new model version
  are compared against the current one before rollout.
- This makes the moderation system as much a data platform as a classifier..
- Image and text detection both follow the pattern of running multiple specialized
  models and combining their scores, but the media processing is very different.

- For images, the pipeline first produces compact representations: it downscales
  the image, samples frames for video, extracts perceptual hashes, and generates
  embeddings from a vision model.
- The perceptual hash enables instant matching against a database of known bad
  content, and the embedding enables similarity search against known violating
  categories.
- Deep learning classifiers then score the image for each policy category, and
  the scores are combined with a category-specific aggregation, so nudity and
  violence are evaluated with separate models and separate thresholds.

Text detection works on the text content plus the context around it.

- The Text Detector scans the visible text, including OCR for text inside
  images, and also the metadata, captions, and comments, because a violation can
  hide in any of them.
- Rule-based signals catch obvious spam, exact-match blocklists for known terms
  and URLs, while a language model scores the semantic content for categories
  such as hate speech and harassment.
- Because text is cheap to reprocess, the text path runs more models and is more
  tolerant of adding checks than the image path.
- Both paths emit category, confidence, and a set of explaining features that a
  human reviewer can inspect.

Detection must anticipate evasion.

- Users and attackers adapt, so the system combines deterministic checks with
  learned ones: hashes catch exact reuse, similarity search catches near
  duplicates such as recolored or mirrored images, and the learned classifiers
  catch novel content.
- Adversarial modifications are measured by how often modified content evades
  the classifiers, and evasion samples are fed back as training data.
- The scoring is calibrated so that borderline categories are routed to human
  review instead of being decided by a low-confidence model, which is the
  design's acknowledgment that automated detection will never be perfect and the
  system must know when it is not certain..
- Review consistency is measured by
  sending calibration items, items with a known correct answer, to reviewers, and
  inconsistent reviewers are retrained or reassigned.
- The pipeline is stateless:
  every upload is processed by a pool of workers that pull from a submission
  queue, so capacity scales by adding workers and the queue absorbs spikes.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Content Moderation
user: User
app: Upload App
gateway: API Gateway
pipeline: Moderation Pipeline
image: Image Detector
text: Text Detector
model: ML Models
review: Human Review
queue: Review Queue
notify: Notifications
db: Moderation DB

user ─► app ─► upload
app ─► gateway ─► submit
gateway ─► pipeline ─► score
pipeline ─► image ─► scan
pipeline ─► text ─► scan
image ─► model ─► predict
text ─► model ─► predict
pipeline ─► queue ─► flag
queue ─► review ─► adjudicate
review ─► db ─► decision
review ─► notify ─► result
```

## Design

### Design a content moderation system

A content moderation system screens every upload against a content policy and
decides what is allowed, what is removed, and what needs a human judgment.

- The upload flows from the client through the API Gateway into the Moderation
  Pipeline, which runs automated checks in parallel.
- The Image Detector and the Text Detector each invoke the ML Models tier, a set
  of specialized models for categories such as adult content, violence, hate
  speech, and spam, and each model returns a category and a confidence score.
- The pipeline combines the scores into a single policy verdict.
- Clear violations are rejected immediately, clearly clean content is accepted,
  and everything in the middle is routed to the Human Review queue, where
  reviewers adjudicate and the decision is recorded in the Moderation DB before
  the user is notified.

The architecture is organized around the cost of mistakes.

- A false positive, removing content that is fine, is a user trust failure,
  while a false negative, letting a violation through, is a safety failure, and
  the tiered design lets the operator choose the balance for each content type
  and audience.
- Latency and throughput also pull in opposite directions: the automated path
  must be fast enough to feel synchronous, typically under a second for the
  verdict, while the human path is inherently slower and asynchronous.
- The design therefore keeps the automated verdict path as the scaling core and
  treats human review as a managed backlog with priority classes rather than as
  part of the request hot path.

Moderation is also a continuously changing problem.

- Policy changes, new attack patterns, and model updates mean the system is
  never finished.
- Every automated decision is logged with the full feature vector that produced
  it, so a policy change can be replayed over historical decisions without
  reprocessing the original media.
- The pipeline is versioned as a whole, and shadow runs of a new model version
  are compared against the current one before rollout.
- This makes the moderation system as much a data platform as a classifier.

### How do you detect violating images and text?

Image and text detection both follow the pattern of running multiple specialized
models and combining their scores, but the media processing is very different.

- For images, the pipeline first produces compact representations: it downscales
  the image, samples frames for video, extracts perceptual hashes, and generates
  embeddings from a vision model.
- The perceptual hash enables instant matching against a database of known bad
  content, and the embedding enables similarity search against known violating
  categories.
- Deep learning classifiers then score the image for each policy category, and
  the scores are combined with a category-specific aggregation, so nudity and
  violence are evaluated with separate models and separate thresholds.

Text detection works on the text content plus the context around it.

- The Text Detector scans the visible text, including OCR for text inside
  images, and also the metadata, captions, and comments, because a violation can
  hide in any of them.
- Rule-based signals catch obvious spam, exact-match blocklists for known terms
  and URLs, while a language model scores the semantic content for categories
  such as hate speech and harassment.
- Because text is cheap to reprocess, the text path runs more models and is more
  tolerant of adding checks than the image path.
- Both paths emit category, confidence, and a set of explaining features that a
  human reviewer can inspect.

Detection must anticipate evasion.

- Users and attackers adapt, so the system combines deterministic checks with
  learned ones: hashes catch exact reuse, similarity search catches near
  duplicates such as recolored or mirrored images, and the learned classifiers
  catch novel content.
- Adversarial modifications are measured by how often modified content evades
  the classifiers, and evasion samples are fed back as training data.
- The scoring is calibrated so that borderline categories are routed to human
  review instead of being decided by a low-confidence model, which is the
  design's acknowledgment that automated detection will never be perfect and the
  system must know when it is not certain.

### How do you combine automated and human review?

The combination is a triage system with a feedback loop. The Moderation Pipeline
classifies every item into one of three buckets: clearly allowed, clearly
violating, or uncertain. Only the uncertain bucket goes to the Human Review
queue, which keeps human effort proportional to the genuinely hard cases. Items
in the queue are prioritized by risk, such as content from new accounts, content
with high reach, and categories with the most severe consequences, so that the
highest-impact decisions are made first. Reviewers work in a workspace that
shows the item, the model scores, and the explaining features, so a human
decision is informed rather than blind.

Human decisions are not just final answers; they are training data. Every
reviewed item is recorded in the Moderation DB with the model scores that were
present when the review was made, and this labeled set is sampled to retrain the
classifiers and recalibrate thresholds. Review consistency is measured by
sending calibration items, items with a known correct answer, to reviewers, and
inconsistent reviewers are retrained or reassigned. Disagreement between
reviewers on the same item is itself a signal: when humans cannot agree, the
policy needs clarification, and those items are surfaced to the policy team.

The system must also decide what to do with content while it is in review.
Depending on policy and reach, ambiguous content may be held invisible, shown
only to the author, or shown publicly while flagged. This choice is a policy
decision encoded in the pipeline configuration, and it balances free expression
against safety. The feedback loop closes when enough human decisions accumulate
on a category that the automated scores for that category can be trusted to move
more traffic out of the human queue. The goal is a shrinking loop: the
classifiers handle more cases correctly over time, and human reviewers focus on
the long tail of novel and borderline cases.

### How do you handle policy changes?

Policy changes are handled as data, not code, which is the core design
principle. Each policy is a versioned configuration: a set of categories,
thresholds, and action rules, plus pointers to the model versions that produce
the scores. When policy changes, the operator publishes a new policy version and
chooses a rollout strategy. Because every historical decision is stored with its
feature vector and scores, the impact of a new policy can be estimated by
replaying it over past decisions before going live, showing how many additional
items would be removed or allowed. This replay turns a risky judgment call into
a measurable change.

The rollout itself is staged. The new policy is applied in shadow mode, logging
what it would have decided, while the live policy continues to serve. Once the
shadow results match expectations, the policy is promoted for new content, and
finally a backfill job reprocesses historical content that might be affected,
such as reinstating content that was removed under a now-abolished category.
Backfill is throttled and prioritized, because reprocessing millions of items
against image and text models is expensive. The Moderation DB keeps a full audit
trail: every item records which policy version and model versions produced each
decision, so any decision can be explained.

Changes are also pushed through the model side. A new policy category requires a
new classifier, and an existing category may need retraining on new violations,
so the model pipeline and the policy version are deployed together and versioned
together. Reviewer guidance is updated to match the policy so that human and
automated decisions stay aligned. Measuring the effect of a change continues
after rollout: policy teams watch the rate of human reversals, appeals, and user
reports around the changed categories, because the ultimate check on a policy
change is whether decisions made under it hold up in practice.

### How do you scale to millions of uploads?

Scaling moderation is about making the automated path horizontally scalable and
keeping the human path from becoming the bottleneck. The pipeline is stateless:
every upload is processed by a pool of workers that pull from a submission
queue, so capacity scales by adding workers and the queue absorbs spikes. The
image and text detectors call the ML Models tier through a model serving layer
that batches inference requests for GPU efficiency, exactly like the serving
tier for any other ML product. The first-level checks, hashing, OCR, and
blocklist matching, are designed to be so cheap that they can reject a large
fraction of spam and known violations before any expensive deep-learning model
runs.

The architecture exploits the skew of real traffic. Most uploads are either
obviously clean or obviously malicious, and both are cheap to classify. The
expensive models are reserved for the narrow band of content that needs them, so
the cost per upload is dominated by a few cheap checks rather than a full model
ensemble on everything. Per-account features, such as an account's history of
violations, are used as a prior that changes which checks run and how deep the
pipeline goes. Deduplication across uploads is handled at the hash layer, so the
same spam image uploaded a million times is scanned once and rejected by cache
thereafter.

The human review queue is scaled through queuing discipline rather than just
headcount. Items are prioritized by risk and SLA class, reviewers are assigned
by expertise, for example, the team handling violence differs from the team
handling spam, and the queue is measured by time-to-decision per priority.
Automated checks are always re-run when the human decides, so the model learns
from the review at scale. The whole system is monitored with three metrics:
detection rate, the fraction of violations caught by the automated path, human
queue depth and wait time, and the model cost per upload, and scaling decisions
are made by watching all three together.

## Source

```text
title: Content Moderation
node user: User [round, icon=browser]
node app: Upload App [icon=browser]
node gateway: API Gateway [icon=server]
node pipeline: Moderation Pipeline [icon=compute]
node image: Image Detector [icon=compute]
node text: Text Detector [icon=compute]
node model: ML Models [icon=cloud]
node review: Human Review [icon=users]
node queue: Review Queue [icon=queue]
node notify: Notifications [icon=message]
node db: Moderation DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> pipeline: score
edge pipeline -> image: scan
edge pipeline -> text: scan
edge image -> model: predict
edge text -> model: predict
edge pipeline -> queue: flag
edge queue -> review: adjudicate
edge review -> db: decision
edge review -> notify: result
```

## Q&A

### Q: Design a content moderation system

**A:** A content moderation system screens every upload against a content policy and
decides what is allowed, what is removed, and what needs a human judgment.

- The upload flows from the client through the API Gateway into the Moderation
  Pipeline, which runs automated checks in parallel.
- The Image Detector and the Text Detector each invoke the ML Models tier, a set
  of specialized models for categories such as adult content, violence, hate
  speech, and spam, and each model returns a category and a confidence score.
- The pipeline combines the scores into a single policy verdict.
- Clear violations are rejected immediately, clearly clean content is accepted,
  and everything in the middle is routed to the Human Review queue, where
  reviewers adjudicate and the decision is recorded in the Moderation DB before
  the user is notified.

The architecture is organized around the cost of mistakes.

- A false positive, removing content that is fine, is a user trust failure,
  while a false negative, letting a violation through, is a safety failure, and
  the tiered design lets the operator choose the balance for each content type
  and audience.
- Latency and throughput also pull in opposite directions: the automated path
  must be fast enough to feel synchronous, typically under a second for the
  verdict, while the human path is inherently slower and asynchronous.
- The design therefore keeps the automated verdict path as the scaling core and
  treats human review as a managed backlog with priority classes rather than as
  part of the request hot path.

Moderation is also a continuously changing problem.

- Policy changes, new attack patterns, and model updates mean the system is
  never finished.
- Every automated decision is logged with the full feature vector that produced
  it, so a policy change can be replayed over historical decisions without
  reprocessing the original media.
- The pipeline is versioned as a whole, and shadow runs of a new model version
  are compared against the current one before rollout.
- This makes the moderation system as much a data platform as a classifier.

### Q: How do you detect violating images and text?

**A:** Image and text detection both follow the pattern of running multiple specialized
models and combining their scores, but the media processing is very different.

- For images, the pipeline first produces compact representations: it downscales
  the image, samples frames for video, extracts perceptual hashes, and generates
  embeddings from a vision model.
- The perceptual hash enables instant matching against a database of known bad
  content, and the embedding enables similarity search against known violating
  categories.
- Deep learning classifiers then score the image for each policy category, and
  the scores are combined with a category-specific aggregation, so nudity and
  violence are evaluated with separate models and separate thresholds.

Text detection works on the text content plus the context around it.

- The Text Detector scans the visible text, including OCR for text inside
  images, and also the metadata, captions, and comments, because a violation can
  hide in any of them.
- Rule-based signals catch obvious spam, exact-match blocklists for known terms
  and URLs, while a language model scores the semantic content for categories
  such as hate speech and harassment.
- Because text is cheap to reprocess, the text path runs more models and is more
  tolerant of adding checks than the image path.
- Both paths emit category, confidence, and a set of explaining features that a
  human reviewer can inspect.

Detection must anticipate evasion.

- Users and attackers adapt, so the system combines deterministic checks with
  learned ones: hashes catch exact reuse, similarity search catches near
  duplicates such as recolored or mirrored images, and the learned classifiers
  catch novel content.
- Adversarial modifications are measured by how often modified content evades
  the classifiers, and evasion samples are fed back as training data.
- The scoring is calibrated so that borderline categories are routed to human
  review instead of being decided by a low-confidence model, which is the
  design's acknowledgment that automated detection will never be perfect and the
  system must know when it is not certain.

### Q: How do you combine automated and human review?

**A:** The combination is a triage system with a feedback loop. The Moderation Pipeline
classifies every item into one of three buckets: clearly allowed, clearly
violating, or uncertain. Only the uncertain bucket goes to the Human Review
queue, which keeps human effort proportional to the genuinely hard cases. Items
in the queue are prioritized by risk, such as content from new accounts, content
with high reach, and categories with the most severe consequences, so that the
highest-impact decisions are made first. Reviewers work in a workspace that
shows the item, the model scores, and the explaining features, so a human
decision is informed rather than blind.

Human decisions are not just final answers; they are training data. Every
reviewed item is recorded in the Moderation DB with the model scores that were
present when the review was made, and this labeled set is sampled to retrain the
classifiers and recalibrate thresholds. Review consistency is measured by
sending calibration items, items with a known correct answer, to reviewers, and
inconsistent reviewers are retrained or reassigned. Disagreement between
reviewers on the same item is itself a signal: when humans cannot agree, the
policy needs clarification, and those items are surfaced to the policy team.

The system must also decide what to do with content while it is in review.
Depending on policy and reach, ambiguous content may be held invisible, shown
only to the author, or shown publicly while flagged. This choice is a policy
decision encoded in the pipeline configuration, and it balances free expression
against safety. The feedback loop closes when enough human decisions accumulate
on a category that the automated scores for that category can be trusted to move
more traffic out of the human queue. The goal is a shrinking loop: the
classifiers handle more cases correctly over time, and human reviewers focus on
the long tail of novel and borderline cases.

### Q: How do you handle policy changes?

**A:** Policy changes are handled as data, not code, which is the core design
principle. Each policy is a versioned configuration: a set of categories,
thresholds, and action rules, plus pointers to the model versions that produce
the scores. When policy changes, the operator publishes a new policy version and
chooses a rollout strategy. Because every historical decision is stored with its
feature vector and scores, the impact of a new policy can be estimated by
replaying it over past decisions before going live, showing how many additional
items would be removed or allowed. This replay turns a risky judgment call into
a measurable change.

The rollout itself is staged. The new policy is applied in shadow mode, logging
what it would have decided, while the live policy continues to serve. Once the
shadow results match expectations, the policy is promoted for new content, and
finally a backfill job reprocesses historical content that might be affected,
such as reinstating content that was removed under a now-abolished category.
Backfill is throttled and prioritized, because reprocessing millions of items
against image and text models is expensive. The Moderation DB keeps a full audit
trail: every item records which policy version and model versions produced each
decision, so any decision can be explained.

Changes are also pushed through the model side. A new policy category requires a
new classifier, and an existing category may need retraining on new violations,
so the model pipeline and the policy version are deployed together and versioned
together. Reviewer guidance is updated to match the policy so that human and
automated decisions stay aligned. Measuring the effect of a change continues
after rollout: policy teams watch the rate of human reversals, appeals, and user
reports around the changed categories, because the ultimate check on a policy
change is whether decisions made under it hold up in practice.

### Q: How do you scale to millions of uploads?

**A:** Scaling moderation is about making the automated path horizontally scalable and
keeping the human path from becoming the bottleneck. The pipeline is stateless:
every upload is processed by a pool of workers that pull from a submission
queue, so capacity scales by adding workers and the queue absorbs spikes. The
image and text detectors call the ML Models tier through a model serving layer
that batches inference requests for GPU efficiency, exactly like the serving
tier for any other ML product. The first-level checks, hashing, OCR, and
blocklist matching, are designed to be so cheap that they can reject a large
fraction of spam and known violations before any expensive deep-learning model
runs.

The architecture exploits the skew of real traffic. Most uploads are either
obviously clean or obviously malicious, and both are cheap to classify. The
expensive models are reserved for the narrow band of content that needs them, so
the cost per upload is dominated by a few cheap checks rather than a full model
ensemble on everything. Per-account features, such as an account's history of
violations, are used as a prior that changes which checks run and how deep the
pipeline goes. Deduplication across uploads is handled at the hash layer, so the
same spam image uploaded a million times is scanned once and rejected by cache
thereafter.

The human review queue is scaled through queuing discipline rather than just
headcount. Items are prioritized by risk and SLA class, reviewers are assigned
by expertise, for example, the team handling violence differs from the team
handling spam, and the queue is measured by time-to-decision per priority.
Automated checks are always re-run when the human decides, so the model learns
from the review at scale. The whole system is monitored with three metrics:
detection rate, the fraction of violations caught by the automated path, human
queue depth and wait time, and the model cost per upload, and scaling decisions
are made by watching all three together.

## Source

```text
title: Content Moderation
node user: User [round, icon=browser]
node app: Upload App [icon=browser]
node gateway: API Gateway [icon=server]
node pipeline: Moderation Pipeline [icon=compute]
node image: Image Detector [icon=compute]
node text: Text Detector [icon=compute]
node model: ML Models [icon=cloud]
node review: Human Review [icon=users]
node queue: Review Queue [icon=queue]
node notify: Notifications [icon=message]
node db: Moderation DB [cylinder, icon=database]

edge user -> app: upload
edge app -> gateway: submit
edge gateway -> pipeline: score
edge pipeline -> image: scan
edge pipeline -> text: scan
edge image -> model: predict
edge text -> model: predict
edge pipeline -> queue: flag
edge queue -> review: adjudicate
edge review -> db: decision
edge review -> notify: result
```
