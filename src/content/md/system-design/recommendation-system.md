# Recommendation system

Generate candidates, rank them and serve personalised results in milliseconds.

**Difficulty:** Hard

**Tags:** recommendation

## Functional Requirements

- Return a ranked list of items for a user and context.
- Use history, item features and real-time signals.
- Handle users and items with no history yet.
- Collect feedback and retrain the models.

## Non-Functional Requirements

- Serving stays under 200 ms p99 for 100M+ users.
- A missing feature falls back to popularity instead of failing.
- Models update without downtime and features refresh within minutes.
- Results stay diverse and obey policy filters.

## Estimation

- 100M daily users at 20 requests each is 2B requests a day, about 23k per second.
- Retrieve 1k candidates, then rank 100, so the expensive model sees 10% of the traffic.
- User embeddings at 128 floats for 100M users is about 51 GB; the item index is a few GB.
- 100 features per request at 23k requests per second is 2.3M feature-store reads per second.

## Architecture Diagram

```text
 User ─► Web app ─► API gateway ─► Recommendation service ─► Candidate generation
                                        ▲                        │ (ANN over item index)
                                        │                        ▼
                                        │                    Ranking model ◄─ Feature store
                                        │                        │
                                        └──── results ◄── Serving policy (filters, diversity)
                                                                 │
 Events DB ◄─ log ◄───────────────────────────────────────────────┘
      └─► Training pipeline ─► Feature store (offline / online)
```

## Design

### Overview

A recommendation system selects a handful of items, from a catalog of millions,
that a specific user is most likely to want. The architecture is a funnel with
three stages.

- First, the Recommendation Service receives a request and asks the Candidate
  Generation component to retrieve a few thousand plausible items per user,
  drawn from collaborative signals such as "users who liked this also liked
  that", content similarity, and trending behavior.
- Second, the Ranking Model scores those candidates with a model that considers
  user features, item features, and their interactions, producing a finely
  ordered list.
- Third, the Serving Policy applies business constraints, diversity, freshness,
  and rules such as excluding purchased items, and returns the final list.
- The Feature Store supplies both stages, and every impression and click flows
  back through the Feedback Loop into the Training Pipeline.

The funnel exists because the cost and precision of each stage is different.

- Candidate generation must be cheap and broad, so it uses fast retrieval
  indexes over a few simple signals.
- Ranking must be precise, so it runs a larger model on a much smaller set.
- This two-stage design is what lets the system give every user a personalized
  list at the latency of a single request.
- The Serving Policy is deliberately separate from the model so that business
  logic can change without retraining, and the Feedback Loop closes the loop so
  the system improves as it serves.

The system is evaluated on engagement, not just accuracy.

- A list that ranks perfectly by predicted preference but surfaces the same
  obvious items is worse than one that balances relevance with surprise,
  diversity, and freshness.
- The design therefore treats recommendations as an optimization over long-term
  engagement, using online experimentation to compare list quality and offline
  evaluation to iterate on models cheaply.
- The serving layer is designed for strict latency budgets, because a
  recommendation that arrives late is worse than one that is slightly less
  perfect.

## Q&A

### Q: How do you generate candidate items?

Candidate generation narrows the catalog from millions to thousands using fast,
approximate signals. The most powerful signal is collaborative filtering: items
that users who share your history have engaged with are good candidates.

- The Candidate Generation component maintains two kinds of indexes. An
  item-to-item index, built from co-occurrence, maps each item to the items that
  tend to be consumed alongside it, and a user-to-item index, built from
  embedding similarity, maps the user's profile vector to nearby items.
- Both are stored as approximate nearest neighbor indexes, typically using an
  embedding space with a locality-sensitive or graph-based search structure,
  which returns candidates in milliseconds without scanning the catalog.

The candidate pool is assembled from multiple generators in parallel.

- Collaborative generators use the user's engagement history, content generators
  use similarity between the items the user has seen and the rest of the
  catalog, and global generators contribute fresh and trending items so that the
  pool is not stale.
- Each generator returns a scored list, and the pool is a union, not a single
  list, because each source covers a different slice of user interest.
- The pool size is a tuning parameter: too small and the ranker is starved of
  good options, too large and the ranking stage gets expensive.
- Diversity is already shaped here, since a pool that is all copies of the
  user's recent history cannot produce a diverse final list.

The indexes are built offline and refreshed on a schedule.

- The embedding space is trained on engagement data, and the item-to-item index
  is rebuilt periodically, while the user-side embedding is updated
  incrementally as new engagement arrives.
- Candidate generation must also respect inventory: items that are out of stock,
  geographically unavailable, or withdrawn are excluded before ranking.
- The whole stage is designed so that a user with a long history and a user with
  almost no history both get a pool, just from different sources, which is the
  first step of handling the cold start.

### Q: How do you rank candidates for each user?

Ranking takes the candidate pool and orders it precisely for the user. The
Ranking Model is a large machine learning model, typically a neural network
trained on engagement data, that predicts the probability the user will engage
with each candidate item.

- Its inputs are the user features from the Feature Store, the item features,
  and interaction features such as how often this item type appears in the
  user's history and whether the user has already seen it.
- Each candidate is scored independently, and the pool is sorted by score.
- The model is trained to optimize the target that matters, click through rate,
  watch time, or conversion, depending on the product.

Serving the ranking model at scale requires the same tricks as any ML serving
system.

- Candidate features are precomputed and fetched in batch for the whole pool
  rather than one at a time, so the ranker makes one efficient inference pass
  over all candidates.
- The user features are fetched once per request and reused.
- The model is served from a model serving tier with batching and autoscaling,
  and the whole scoring pass fits within the latency budget.
- Because the ranker is the most expensive stage in the funnel, its input size,
  the candidate pool, is controlled carefully.

The output of the ranker is not the final list. The Serving Policy layer applies
constraints that the model cannot encode: hard filters such as excluding items
the user has bought or already rated, diversity enforcement so the list does not
collapse into one category, freshness boosting so new items get a chance, and
positional rules.

- This separation is deliberate, because business rules change more often than
  models and are easier to tune as a policy than to bake into training.
- The ranking stage is also the natural place for experimentation: models are
  compared by serving different versions to different user segments and
  measuring engagement.

### Q: How do you handle cold-start users?

A cold-start user has little or no engagement history, so the system cannot rely
on collaborative signals at all. The response is to lean on whatever signals do
exist.

- If the user signed up with a profile, such as preferences and location, those
  become content-based features.
- If the user has performed any action, such as one search or one click, that
  action seeds the profile even if it is tiny.
- For a completely new user, the fallback is popularity and trending: globally
  popular items, items trending in the user's region, and a curated new-user
  feed.
- These are deliberately broad because the goal is not the perfect first list
  but the fastest path to enough signal to personalize.

The key technique is exploration. A cold-start user is exactly where the system
has the most uncertainty, so the list is biased toward items whose feedback is
most informative, a balance of popular items that are likely to engage and
diverse items that reveal the user's taste.

- Every interaction with the cold-start list is used to warm the profile
  immediately: a click on a category, a longer dwell, or a skip all feed the
  feature store within minutes rather than waiting for a nightly batch.
- The system tracks how quickly a new user converges to a personalized
  experience as a first-class metric, because that convergence speed directly
  affects retention.

Warmup is also handled at the model level.

- The ranker is trained to handle sparse features, and the feature store fills
  the missing history with population priors that are smoothed toward the
  average user.
- As the user engages, the profile weight shifts from the population prior
  toward the individual's own data.
- The candidate generation stage uses the same strategy: the content and
  trending generators dominate for new users, and the collaborative generators
  take over as history accumulates.
- The design assumes every user was once a new user, so the cold-start path is
  not an edge case but a fully engineered onboarding flow.

### Q: How do you update features and retrain models?

The system runs on a feedback loop where serving produces data and data improves
serving.

- Every impression, click, skip, and purchase is logged to the Events DB, and
  the Feedback Loop streams these events into the feature and training
  pipelines.
- Features have different freshness requirements: session-level features, such
  as what the user just clicked, must update in real time because they change
  the very next request, while long-term features, such as a user's category
  affinity over months, update on a slower cadence.
- The Feature Store therefore supports both a real-time path, which writes
  recent engagement into the serving feature tables, and a batch path, which
  recomputes the aggregate features on a schedule.

Model retraining follows a versioned pipeline.

- The Training Pipeline takes the accumulated engagement data, computes the
  features with the same code that serves them, and trains a new model version
  offline.
- The new model is evaluated against a held-out window, compared to the current
  model on the engagement metrics, and tested in shadow mode before deployment.
- The schedule depends on how fast the product's taste changes: engagement
  models may retrain daily or continuously, while the item embeddings retrain
  less frequently.
- Every served decision is logged with the model version that made it, so the
  team can trace a change in behavior to a specific model.

The loop is closed through experimentation.

- Model changes are validated by A/B testing on real traffic, where the
  engagement difference between the new model and the control determines
  promotion.
- The feature store is audited for skew between the training-time and
  serving-time values, because a mismatch silently corrupts every model trained
  on it.
- Data quality monitoring is as important as the model itself: the system
  watches for missing features, stale user profiles, and drift in engagement,
  and it alerts when the pipeline's assumptions break.
- The entire design assumes that a recommendation system is never done, only
  continuously updated.

## Source

```text
title: Recommendation System
node user: User [round, icon=browser]
node app: Web App [icon=browser]
node gateway: API Gateway [icon=server]
node feature: Feature Store [icon=cache]
node candidate: Candidate Generation [icon=compute]
node rank: Ranking Model [icon=cloud]
node policy: Serving Policy [icon=compute]
node recs: Recommendation Service [icon=search]
node feedback: Feedback Loop [icon=queue]
node train: Training Pipeline [icon=worker]
node db: Events DB [cylinder, icon=database]

edge user -> app: browse
edge app -> gateway: request
edge gateway -> recs: get
edge recs -> candidate: pool
edge candidate -> rank: score
edge rank -> policy: filter
edge policy -> recs: serve
edge recs -> app: results
edge app -> feedback: clicks
edge feedback -> train: retrain
edge train -> feature: update
edge recs -> db: log
```

## Source

```text
title: Recommendation System
node user: User [round, icon=browser]
node app: Web App [icon=browser]
node gateway: API Gateway [icon=server]
node feature: Feature Store [icon=cache]
node candidate: Candidate Generation [icon=compute]
node rank: Ranking Model [icon=cloud]
node policy: Serving Policy [icon=compute]
node recs: Recommendation Service [icon=search]
node feedback: Feedback Loop [icon=queue]
node train: Training Pipeline [icon=worker]
node db: Events DB [cylinder, icon=database]

edge user -> app: browse
edge app -> gateway: request
edge gateway -> recs: get
edge recs -> candidate: pool
edge candidate -> rank: score
edge rank -> policy: filter
edge policy -> recs: serve
edge recs -> app: results
edge app -> feedback: clicks
edge feedback -> train: retrain
edge train -> feature: update
edge recs -> db: log
```
