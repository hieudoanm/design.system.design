# Yelp — Reviews Service

Design a reviews platform

**Difficulty:** Hard

**Tags:** ecommerce, security

## Functional Requirements

- a reviews platform
- aggregate ratings fairly?
- verify reviews are authentic?
- power review search and ranking?
- handle review bias?

## Non-Functional Requirements

- A reviews platform pairs a catalog of business listings with a stream of
  user-generated reviews, and the read path dominates by orders of magnitude.

The design is built around a business service, a review service, and a rating
aggregator:

- Business service — owns listing data.
- Review service — owns individual reviews.
- Rating aggregator — maintains per-business statistics.
- Review verification — screens submissions for authenticity.
- Ranking service — orders reviews by usefulness.
- Search index — makes both listings and review content discoverable.
- Listing cache — serves the hot profile page.
- Reviews database — system of record for every review and rating.

The write path goes through verification before a review is visible:

- The user submits through the app, the gateway forwards it, and the
  verification service checks for evidence the reviewer actually transacted,
  such as a check-in, booking, or order.
- Verified reviews are accepted, then the rating aggregator recomputes the
  business's average, the cache refreshes, and the ranking service scores the
  review for display order.
- Unverified or suspect submissions are held, reviewed, and either rejected or
  published with a lower trust signal.
- Reads hit the cache and search index, so a popular listing page is served
  without touching the review database.

The central tradeoff is between the integrity of ratings and the volume of
reviews:

- Strict verification raises quality but suppresses the volume that makes a
  reviews platform useful, so the design uses tiered verification rather than a
  binary gate.
- The system is also multi-tenant in spirit: a business owner sees only their
  listing, so every query is scoped by business id, and the database is sharded
  by that id to keep a single listing's reviews colocated.
- The architecture accepts eventual consistency between a new review and its
  reflected aggregate, closing the gap with cache refresh and background
  re-aggregation..
- A naive average is easy to game and easy to mislead:

- A business with three five-star reviews should not outrank one with a hundred
  reviews.
- One angry coordinated campaign should not drag a great business down.
- I would compute a Bayesian aggregate that combines the observed rating with a
  prior: a weighted average where the weight scales with review count, so small
  samples regress toward the population mean.
- This produces a stable score that converges to the true mean as reviews
  accumulate and is hard to move with a handful of fake reviews.

Fairness also requires handling outliers:

- I would detect review bombs, where a burst of one-star reviews arrives in a
  short window from suspicious accounts, and exclude or downweight them pending
  review.
- Repeated reviews from the same user on the same business are collapsed to one
  contribution.
- The rating display should show more than a single number: the distribution
  histogram, the count, and recency are all honest signals, and I would expose
  them so users can judge the score for themselves.
- The aggregate is versioned and recomputed on events, not on read, so the cache
  serves a consistent number.

The aggregator must also be defensible to business owners, who are the
platform's paying customers:

- Every displayed number is derived from a deterministic, documented formula
  over stored reviews, so the platform can explain why a score is what it is.
- Recomputations are idempotent and replayable from the review database, which
  lets the team rerun history when the formula changes.
- I would separate the headline score from contextual aggregates such as
  recent-12-month rating, because a business that improved should not be judged
  forever by its early years.
- The tradeoff is that Bayesian aggregation is less intuitive than an average,
  so the UI documents how the number is computed..
- Search over reviews has two distinct workloads:

- Finding a business by name, category, location, and attributes, which the
  search index serves with filters over structured fields and geo-coordinates.
- Surfacing the most useful reviews for a given listing, which is a ranking
  problem rather than a relevance problem.
- I would use the search index for both: business documents contain listing
  metadata and aggregated rating signals, while review documents carry the
  review text, rating, and verification metadata.
- The index is updated asynchronously from review and business events.

Review ranking orders the reviews on a listing page by usefulness, not just
recency:

- A score combines recency, verified status, the rating's agreement with the
  aggregate, and votes from other users on whether the review was helpful.
- This surfaces informative reviews while letting new content still appear
  through a recency boost.
- I would personalize the ranking modestly: a user's own review and reviews from
  friends rank first, and text is highlighted when it matches the user's search
  terms.
- The ranking model is served as a score function over indexed features, so it
  can be tuned without reindexing.

Scale is managed with facets and result caps:

- Business search returns fewer than a hundred results with the aggregate rating
  embedded in each result document, so the listing page needs no join to display
  stars.
- Review search within a business is bounded by pagination and caching.
- The listing cache stores the top-N ranked reviews for hot businesses, which
  serves the vast majority of page views, while colder businesses query the
  index directly.
- The tradeoff is index freshness versus cost; a short reindex interval keeps
  new reviews visible within seconds, which is good enough for a workload where
  hours-old reviews rarely change user decisions..
- Review bias appears in two directions:

- The reviewer set is not representative.
- The platform's own systems can amplify or suppress certain reviews.
- Extreme experiences are over-represented because people who are furious or
  delighted are the most likely to write, so raw averages drift away from the
  typical experience.
- I would counter this by weighting contributions and by soliciting reviews
  systematically: after a confirmed transaction, a prompt reaches the reviewer,
  which brings in the middle of the distribution that would otherwise stay
  silent.
- A recency-weighted aggregate also reduces the influence of stale reviews that
  no longer describe the business.

Gaming bias is the second concern:

- Coordinated positive campaigns and competitive negative campaigns both distort
  scores, and the verification service feeds the aggregator, so suspicious
  reviews are excluded before they move the average.
- I would also damp the influence of extreme ratings from users who rate
  everything one or five stars, since their scale is not calibrated to the
  general population.
- This must be handled transparently: users see why a score is computed the way
  it is, and business owners see which reviews were excluded and why, so the
  system remains defensible rather than mysterious.

Platform design choices also create bias:

- Sort order determines what users read, so a ranking that over-weights
  sensational reviews shapes perception; I would surface verified reviews and
  diverse perspectives in the top positions.
- Featured reviews and awards must come from a documented policy, and the
  display of the distribution histogram helps users see the full picture rather
  than a single number.
- I would run ongoing measurement of rating drift against external signals such
  as transaction satisfaction surveys to detect when the aggregate has moved
  away from reality.
- The tradeoff is that bias correction is inherently a series of judgment calls,
  so the platform documents the policies and revises them from measured
  outcomes.

## Source

````text
title: Reviews Service
node user: User [round, icon=browser]
node app: Review App [icon=browser]
node gateway: API Gateway [icon=server]
node business: Business Service [icon=compute]
node review: Review Service [icon=compute]
node rating: Rating Aggregator [icon=compute]
node verify: Review Verification [icon=shield]
node rank: Review Ranking [icon=compute]
node search: Search Index [icon=search]
node cache: Listing Cache [cylinder, icon=cache]
node db: Reviews DB [cylinder, icon=database]

edge user -> app: write review
edge app -> gateway: submit
edge gateway -> verify: check
edge verify -> review: accept
edge review -> rating: update
edge rating -> cache: refresh
edge review -> rank: score
edge rank -> search: index
edge app -> gateway: browse
edge gateway -> business: load
edge review -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Reviews Service
user: User
app: Review App
gateway: API Gateway
business: Business Service
review: Review Service
rating: Rating Aggregator
verify: Review Verification
rank: Review Ranking
search: Search Index
cache: Listing Cache
db: Reviews DB

user ─► app ─► write review
app ─► gateway ─► submit
gateway ─► verify ─► check
verify ─► review ─► accept
review ─► rating ─► update
rating ─► cache ─► refresh
review ─► rank ─► score
rank ─► search ─► index
app ─► gateway ─► browse
gateway ─► business ─► load
review ─► db ─► store
````

## Design

### Design a reviews platform

A reviews platform pairs a catalog of business listings with a stream of
user-generated reviews, and the read path dominates by orders of magnitude.

The design is built around a business service, a review service, and a rating
aggregator:

- Business service — owns listing data.
- Review service — owns individual reviews.
- Rating aggregator — maintains per-business statistics.
- Review verification — screens submissions for authenticity.
- Ranking service — orders reviews by usefulness.
- Search index — makes both listings and review content discoverable.
- Listing cache — serves the hot profile page.
- Reviews database — system of record for every review and rating.

The write path goes through verification before a review is visible:

- The user submits through the app, the gateway forwards it, and the
  verification service checks for evidence the reviewer actually transacted,
  such as a check-in, booking, or order.
- Verified reviews are accepted, then the rating aggregator recomputes the
  business's average, the cache refreshes, and the ranking service scores the
  review for display order.
- Unverified or suspect submissions are held, reviewed, and either rejected or
  published with a lower trust signal.
- Reads hit the cache and search index, so a popular listing page is served
  without touching the review database.

The central tradeoff is between the integrity of ratings and the volume of
reviews:

- Strict verification raises quality but suppresses the volume that makes a
  reviews platform useful, so the design uses tiered verification rather than a
  binary gate.
- The system is also multi-tenant in spirit: a business owner sees only their
  listing, so every query is scoped by business id, and the database is sharded
  by that id to keep a single listing's reviews colocated.
- The architecture accepts eventual consistency between a new review and its
  reflected aggregate, closing the gap with cache refresh and background
  re-aggregation.

### How do you aggregate ratings fairly?

A naive average is easy to game and easy to mislead:

- A business with three five-star reviews should not outrank one with a hundred
  reviews.
- One angry coordinated campaign should not drag a great business down.
- I would compute a Bayesian aggregate that combines the observed rating with a
  prior: a weighted average where the weight scales with review count, so small
  samples regress toward the population mean.
- This produces a stable score that converges to the true mean as reviews
  accumulate and is hard to move with a handful of fake reviews.

Fairness also requires handling outliers:

- I would detect review bombs, where a burst of one-star reviews arrives in a
  short window from suspicious accounts, and exclude or downweight them pending
  review.
- Repeated reviews from the same user on the same business are collapsed to one
  contribution.
- The rating display should show more than a single number: the distribution
  histogram, the count, and recency are all honest signals, and I would expose
  them so users can judge the score for themselves.
- The aggregate is versioned and recomputed on events, not on read, so the cache
  serves a consistent number.

The aggregator must also be defensible to business owners, who are the
platform's paying customers:

- Every displayed number is derived from a deterministic, documented formula
  over stored reviews, so the platform can explain why a score is what it is.
- Recomputations are idempotent and replayable from the review database, which
  lets the team rerun history when the formula changes.
- I would separate the headline score from contextual aggregates such as
  recent-12-month rating, because a business that improved should not be judged
  forever by its early years.
- The tradeoff is that Bayesian aggregation is less intuitive than an average,
  so the UI documents how the number is computed.

### How do you verify reviews are authentic?

Authenticity verification is about evidence, reputation, and anomaly detection,
and it runs before a review becomes visible.

The strongest signal is proof of a real transaction:

- A booking, check-in, order, or reservation tied to the user and the business.
- I would structure the platform so transactions flow through it and emit
  verifiable events, so a review can reference one.
- A verified tag on the review communicates the evidence level, and verified
  reviews are weighted more heavily in aggregates.
- For platforms without first-party transactions, the verification service looks
  for indirect evidence and assigns a trust score.

Account and behavior signals complement transaction evidence:

- New accounts writing a first review of a never-reviewed business, accounts
  that review many competitors in one session, and users sharing an IP or device
  fingerprint all look suspicious.
- The verification service scores these signals and combines them with
  transaction evidence into a trust decision.
- I would maintain a reputation system where long-lived, active users with a
  history of accepted reviews accumulate trust, which lets their future reviews
  publish quickly while unknown users face more scrutiny.
- Blocks are shared across the platform so a known abusive account cannot start
  over trivially.

Anomaly detection catches the coordinated attacks that individual signals miss:

- I would run streaming detection over review volume per business, flagging
  bursts, clustering of identical text, and ratings that diverge sharply from
  the prior.
- Flagged reviews are routed to human review with the evidence surfaced, because
  automated systems alone are too brittle.
- The tradeoff is that aggressive verification suppresses legitimate reviews
  from new users, so the false-positive cost is managed by making rejections
  appealable and by preferring to hold rather than delete.
- All decisions are logged so the verification policy is auditable and tunable.

### How do you power review search and ranking?

Search over reviews has two distinct workloads:

- Finding a business by name, category, location, and attributes, which the
  search index serves with filters over structured fields and geo-coordinates.
- Surfacing the most useful reviews for a given listing, which is a ranking
  problem rather than a relevance problem.
- I would use the search index for both: business documents contain listing
  metadata and aggregated rating signals, while review documents carry the
  review text, rating, and verification metadata.
- The index is updated asynchronously from review and business events.

Review ranking orders the reviews on a listing page by usefulness, not just
recency:

- A score combines recency, verified status, the rating's agreement with the
  aggregate, and votes from other users on whether the review was helpful.
- This surfaces informative reviews while letting new content still appear
  through a recency boost.
- I would personalize the ranking modestly: a user's own review and reviews from
  friends rank first, and text is highlighted when it matches the user's search
  terms.
- The ranking model is served as a score function over indexed features, so it
  can be tuned without reindexing.

Scale is managed with facets and result caps:

- Business search returns fewer than a hundred results with the aggregate rating
  embedded in each result document, so the listing page needs no join to display
  stars.
- Review search within a business is bounded by pagination and caching.
- The listing cache stores the top-N ranked reviews for hot businesses, which
  serves the vast majority of page views, while colder businesses query the
  index directly.
- The tradeoff is index freshness versus cost; a short reindex interval keeps
  new reviews visible within seconds, which is good enough for a workload where
  hours-old reviews rarely change user decisions.

### How do you handle review bias?

Review bias appears in two directions:

- The reviewer set is not representative.
- The platform's own systems can amplify or suppress certain reviews.
- Extreme experiences are over-represented because people who are furious or
  delighted are the most likely to write, so raw averages drift away from the
  typical experience.
- I would counter this by weighting contributions and by soliciting reviews
  systematically: after a confirmed transaction, a prompt reaches the reviewer,
  which brings in the middle of the distribution that would otherwise stay
  silent.
- A recency-weighted aggregate also reduces the influence of stale reviews that
  no longer describe the business.

Gaming bias is the second concern:

- Coordinated positive campaigns and competitive negative campaigns both distort
  scores, and the verification service feeds the aggregator, so suspicious
  reviews are excluded before they move the average.
- I would also damp the influence of extreme ratings from users who rate
  everything one or five stars, since their scale is not calibrated to the
  general population.
- This must be handled transparently: users see why a score is computed the way
  it is, and business owners see which reviews were excluded and why, so the
  system remains defensible rather than mysterious.

Platform design choices also create bias:

- Sort order determines what users read, so a ranking that over-weights
  sensational reviews shapes perception; I would surface verified reviews and
  diverse perspectives in the top positions.
- Featured reviews and awards must come from a documented policy, and the
  display of the distribution histogram helps users see the full picture rather
  than a single number.
- I would run ongoing measurement of rating drift against external signals such
  as transaction satisfaction surveys to detect when the aggregate has moved
  away from reality.
- The tradeoff is that bias correction is inherently a series of judgment calls,
  so the platform documents the policies and revises them from measured
  outcomes.

## Source

```text
title: Reviews Service
node user: User [round, icon=browser]
node app: Review App [icon=browser]
node gateway: API Gateway [icon=server]
node business: Business Service [icon=compute]
node review: Review Service [icon=compute]
node rating: Rating Aggregator [icon=compute]
node verify: Review Verification [icon=shield]
node rank: Review Ranking [icon=compute]
node search: Search Index [icon=search]
node cache: Listing Cache [cylinder, icon=cache]
node db: Reviews DB [cylinder, icon=database]

edge user -> app: write review
edge app -> gateway: submit
edge gateway -> verify: check
edge verify -> review: accept
edge review -> rating: update
edge rating -> cache: refresh
edge review -> rank: score
edge rank -> search: index
edge app -> gateway: browse
edge gateway -> business: load
edge review -> db: store
```

## Q&A

### Q: Design a reviews platform

**A:** A reviews platform pairs a catalog of business listings with a stream of
user-generated reviews, and the read path dominates by orders of magnitude.

The design is built around a business service, a review service, and a rating
aggregator:

- Business service — owns listing data.
- Review service — owns individual reviews.
- Rating aggregator — maintains per-business statistics.
- Review verification — screens submissions for authenticity.
- Ranking service — orders reviews by usefulness.
- Search index — makes both listings and review content discoverable.
- Listing cache — serves the hot profile page.
- Reviews database — system of record for every review and rating.

The write path goes through verification before a review is visible:

- The user submits through the app, the gateway forwards it, and the
  verification service checks for evidence the reviewer actually transacted,
  such as a check-in, booking, or order.
- Verified reviews are accepted, then the rating aggregator recomputes the
  business's average, the cache refreshes, and the ranking service scores the
  review for display order.
- Unverified or suspect submissions are held, reviewed, and either rejected or
  published with a lower trust signal.
- Reads hit the cache and search index, so a popular listing page is served
  without touching the review database.

The central tradeoff is between the integrity of ratings and the volume of
reviews:

- Strict verification raises quality but suppresses the volume that makes a
  reviews platform useful, so the design uses tiered verification rather than a
  binary gate.
- The system is also multi-tenant in spirit: a business owner sees only their
  listing, so every query is scoped by business id, and the database is sharded
  by that id to keep a single listing's reviews colocated.
- The architecture accepts eventual consistency between a new review and its
  reflected aggregate, closing the gap with cache refresh and background
  re-aggregation.

### Q: How do you aggregate ratings fairly?

**A:** A naive average is easy to game and easy to mislead:

- A business with three five-star reviews should not outrank one with a hundred
  reviews.
- One angry coordinated campaign should not drag a great business down.
- I would compute a Bayesian aggregate that combines the observed rating with a
  prior: a weighted average where the weight scales with review count, so small
  samples regress toward the population mean.
- This produces a stable score that converges to the true mean as reviews
  accumulate and is hard to move with a handful of fake reviews.

Fairness also requires handling outliers:

- I would detect review bombs, where a burst of one-star reviews arrives in a
  short window from suspicious accounts, and exclude or downweight them pending
  review.
- Repeated reviews from the same user on the same business are collapsed to one
  contribution.
- The rating display should show more than a single number: the distribution
  histogram, the count, and recency are all honest signals, and I would expose
  them so users can judge the score for themselves.
- The aggregate is versioned and recomputed on events, not on read, so the cache
  serves a consistent number.

The aggregator must also be defensible to business owners, who are the
platform's paying customers:

- Every displayed number is derived from a deterministic, documented formula
  over stored reviews, so the platform can explain why a score is what it is.
- Recomputations are idempotent and replayable from the review database, which
  lets the team rerun history when the formula changes.
- I would separate the headline score from contextual aggregates such as
  recent-12-month rating, because a business that improved should not be judged
  forever by its early years.
- The tradeoff is that Bayesian aggregation is less intuitive than an average,
  so the UI documents how the number is computed.

### Q: How do you verify reviews are authentic?

**A:** Authenticity verification is about evidence, reputation, and anomaly detection,
and it runs before a review becomes visible.

The strongest signal is proof of a real transaction:

- A booking, check-in, order, or reservation tied to the user and the business.
- I would structure the platform so transactions flow through it and emit
  verifiable events, so a review can reference one.
- A verified tag on the review communicates the evidence level, and verified
  reviews are weighted more heavily in aggregates.
- For platforms without first-party transactions, the verification service looks
  for indirect evidence and assigns a trust score.

Account and behavior signals complement transaction evidence:

- New accounts writing a first review of a never-reviewed business, accounts
  that review many competitors in one session, and users sharing an IP or device
  fingerprint all look suspicious.
- The verification service scores these signals and combines them with
  transaction evidence into a trust decision.
- I would maintain a reputation system where long-lived, active users with a
  history of accepted reviews accumulate trust, which lets their future reviews
  publish quickly while unknown users face more scrutiny.
- Blocks are shared across the platform so a known abusive account cannot start
  over trivially.

Anomaly detection catches the coordinated attacks that individual signals miss:

- I would run streaming detection over review volume per business, flagging
  bursts, clustering of identical text, and ratings that diverge sharply from
  the prior.
- Flagged reviews are routed to human review with the evidence surfaced, because
  automated systems alone are too brittle.
- The tradeoff is that aggressive verification suppresses legitimate reviews
  from new users, so the false-positive cost is managed by making rejections
  appealable and by preferring to hold rather than delete.
- All decisions are logged so the verification policy is auditable and tunable.

### Q: How do you power review search and ranking?

**A:** Search over reviews has two distinct workloads:

- Finding a business by name, category, location, and attributes, which the
  search index serves with filters over structured fields and geo-coordinates.
- Surfacing the most useful reviews for a given listing, which is a ranking
  problem rather than a relevance problem.
- I would use the search index for both: business documents contain listing
  metadata and aggregated rating signals, while review documents carry the
  review text, rating, and verification metadata.
- The index is updated asynchronously from review and business events.

Review ranking orders the reviews on a listing page by usefulness, not just
recency:

- A score combines recency, verified status, the rating's agreement with the
  aggregate, and votes from other users on whether the review was helpful.
- This surfaces informative reviews while letting new content still appear
  through a recency boost.
- I would personalize the ranking modestly: a user's own review and reviews from
  friends rank first, and text is highlighted when it matches the user's search
  terms.
- The ranking model is served as a score function over indexed features, so it
  can be tuned without reindexing.

Scale is managed with facets and result caps:

- Business search returns fewer than a hundred results with the aggregate rating
  embedded in each result document, so the listing page needs no join to display
  stars.
- Review search within a business is bounded by pagination and caching.
- The listing cache stores the top-N ranked reviews for hot businesses, which
  serves the vast majority of page views, while colder businesses query the
  index directly.
- The tradeoff is index freshness versus cost; a short reindex interval keeps
  new reviews visible within seconds, which is good enough for a workload where
  hours-old reviews rarely change user decisions.

### Q: How do you handle review bias?

**A:** Review bias appears in two directions:

- The reviewer set is not representative.
- The platform's own systems can amplify or suppress certain reviews.
- Extreme experiences are over-represented because people who are furious or
  delighted are the most likely to write, so raw averages drift away from the
  typical experience.
- I would counter this by weighting contributions and by soliciting reviews
  systematically: after a confirmed transaction, a prompt reaches the reviewer,
  which brings in the middle of the distribution that would otherwise stay
  silent.
- A recency-weighted aggregate also reduces the influence of stale reviews that
  no longer describe the business.

Gaming bias is the second concern:

- Coordinated positive campaigns and competitive negative campaigns both distort
  scores, and the verification service feeds the aggregator, so suspicious
  reviews are excluded before they move the average.
- I would also damp the influence of extreme ratings from users who rate
  everything one or five stars, since their scale is not calibrated to the
  general population.
- This must be handled transparently: users see why a score is computed the way
  it is, and business owners see which reviews were excluded and why, so the
  system remains defensible rather than mysterious.

Platform design choices also create bias:

- Sort order determines what users read, so a ranking that over-weights
  sensational reviews shapes perception; I would surface verified reviews and
  diverse perspectives in the top positions.
- Featured reviews and awards must come from a documented policy, and the
  display of the distribution histogram helps users see the full picture rather
  than a single number.
- I would run ongoing measurement of rating drift against external signals such
  as transaction satisfaction surveys to detect when the aggregate has moved
  away from reality.
- The tradeoff is that bias correction is inherently a series of judgment calls,
  so the platform documents the policies and revises them from measured
  outcomes.

## Source

```text
title: Reviews Service
node user: User [round, icon=browser]
node app: Review App [icon=browser]
node gateway: API Gateway [icon=server]
node business: Business Service [icon=compute]
node review: Review Service [icon=compute]
node rating: Rating Aggregator [icon=compute]
node verify: Review Verification [icon=shield]
node rank: Review Ranking [icon=compute]
node search: Search Index [icon=search]
node cache: Listing Cache [cylinder, icon=cache]
node db: Reviews DB [cylinder, icon=database]

edge user -> app: write review
edge app -> gateway: submit
edge gateway -> verify: check
edge verify -> review: accept
edge review -> rating: update
edge rating -> cache: refresh
edge review -> rank: score
edge rank -> search: index
edge app -> gateway: browse
edge gateway -> business: load
edge review -> db: store
```
