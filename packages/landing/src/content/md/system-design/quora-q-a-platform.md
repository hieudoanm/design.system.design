# Quora — Q&A Platform

Design Quora / a Q&A platform

**Difficulty:** Easy

**Tags:** graph, security, social

## Functional Requirements

- Quora / a Q&A platform
- model questions, answers, and topics?
- rank answers and questions?
- the feed of recommended questions
- moderate content and detect duplicate questions?

## Non-Functional Requirements

- The API gateway splits the
  read-heavy browse path — feeds, question pages, ranked answers — from the write
  path: ask, answer, vote, follow.

- The Questions Service persists questions with canonical deduplication, the
  Answers Service attaches answers to question ids, Votes feed a Ranking Worker
  that maintains per-question and per-topic sorted lists in the Rank Cache, and
  the Moderation Service screens new content before it is fully trusted.
- The Topic Graph powers the follow-based feed and recommendations.

Reads dominate: each question page is a cache-backed render of the top answers,
with pagination hitting a score index only on deep scroll.

- Writes are moderate but bursty after a question goes viral.
- The system favors availability and eventual consistency in ranking, but
  question deduplication and answer attribution need careful coordination to
  avoid duplicate questions and lost answers.
- Scale estimates: tens of millions of questions, hundreds of millions of
  answers, and a read path at millions of QPS, with votes being the hottest
  write path..
- The feed blends three candidate sources: recent high-ranked questions in
  followed topics (pulled from the Topic Graph and weighted by topic affinity),
  questions with new answers from followed users and experts, and
  recommendation-engine candidates.

- The Feed Service merges these sets, applies a freshness-plus-quality score,
  and paginates with cursor offsets; results are cached per user with a short
  TTL.
- Candidate generation is pull-based, so a user's feed does not need a
  per-question fan-out push — the merge happens at read time from the topic and
  follow indexes.

Recommendation candidates come from an offline job that builds a user–topic
affinity matrix from follow, vote, and answer history, then scores candidate
questions by affinity × question quality × recency.

- Cold start uses trending-by-topic and popular-in-network defaults.
- Trade-offs: pull-based merge is cheap because topic membership is bounded, and
  scoring runs asynchronously so the live read path is cache-only.
- Feed freshness matters — a question with a hot new answer should resurface —
  so the worker refreshes the top of the feed more aggressively than the tail,
  and activity events trigger targeted invalidation..
- Moderation pipeline: every new question and answer passes through Moderation
  Service heuristics — toxicity and quality classifiers, length and formatting
  signals, spam URL patterns, and account-reputation gates.

- Flagged content goes to a human review queue, and content from new accounts is
  held under stricter review.
- Duplicate question detection is a separate pipeline: an inverted index over
  title tokens and shingles plus an embedding-based semantic similarity pass
  produces candidate pairs; a matcher worker clusters near-duplicates and
  proposes a canonical question.
- Merging keeps one canonical question and redirects the others while preserving
  their answer counts.

Both systems must be async so ask/answer latency stays low: content is shown
immediately but flagged or hidden within seconds-to-minutes if it fails checks,
and confirmed spam retrains the classifiers through a feedback loop.

- Trade-offs: aggressive auto-merge can wrongly combine distinct-but-related
  questions, so merges below a high similarity threshold are routed to human
  review.
- Vote manipulation reuses the fraud-signal store (velocity, account-cohort
  patterns) from the vote path, and the moderation and duplicate pipelines both
  scale as stream consumers over the write log.

## Source

````text
title: Quora Q&A
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node question: Questions [icon=message]
node answer: Answers [icon=compute]
node vote: Votes [icon=sync]
node topic: Topic Graph [icon=search]
node rank: Ranking Worker [icon=worker]
node mod: Moderation [icon=shield]
node notify: Notifications [icon=mail]
node db: Q&A DB [cylinder, icon=database]
node cache: Rank Cache [cylinder, icon=cache]

edge client -> api: ask
edge api -> question: create
edge question -> topic: classify
edge question -> db: persist
edge client -> api: answer
edge api -> answer: submit
edge answer -> question: attach
edge client -> api: vote
edge api -> vote: record
edge vote -> rank: score
edge rank -> cache: sorted
edge api -> mod: review
edge answer -> notify: followers
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Quora Q&A
client: Client
api: API Gateway
question: Questions
answer: Answers
vote: Votes
topic: Topic Graph
rank: Ranking Worker
mod: Moderation
notify: Notifications
db: Q&A DB
cache: Rank Cache

client ─► api ─► ask
api ─► question ─► create
question ─► topic ─► classify
question ─► db ─► persist
client ─► api ─► answer
api ─► answer ─► submit
answer ─► question ─► attach
client ─► api ─► vote
api ─► vote ─► record
vote ─► rank ─► score
rank ─► cache ─► sorted
api ─► mod ─► review
answer ─► notify ─► followers
````

## Design

### Design Quora / a Q&A platform

Quora is organized around questions that aggregate multiple answers from
knowledgeable users, all classified by a topic graph. The API gateway splits the
read-heavy browse path — feeds, question pages, ranked answers — from the write
path: ask, answer, vote, follow.

- The Questions Service persists questions with canonical deduplication, the
  Answers Service attaches answers to question ids, Votes feed a Ranking Worker
  that maintains per-question and per-topic sorted lists in the Rank Cache, and
  the Moderation Service screens new content before it is fully trusted.
- The Topic Graph powers the follow-based feed and recommendations.

Reads dominate: each question page is a cache-backed render of the top answers,
with pagination hitting a score index only on deep scroll.

- Writes are moderate but bursty after a question goes viral.
- The system favors availability and eventual consistency in ranking, but
  question deduplication and answer attribution need careful coordination to
  avoid duplicate questions and lost answers.
- Scale estimates: tens of millions of questions, hundreds of millions of
  answers, and a read path at millions of QPS, with votes being the hottest
  write path.

### How do you model questions, answers, and topics?

Questions: (id, title, body, `canonical_id`, created_at). Because the same query
is often phrased many ways, a canonicalization layer maps duplicate questions to
a single canonical question.

- All answers attach to the canonical id and duplicate variants redirect to the
  merged page.
- Answers: (id, question_id, author_id, body, created_at, score), with the slim
  row (ids, score, timestamps) in an OLTP store for fast ranking updates and the
  full body in object storage.
- Votes: `(user_id, answer_id)` / `(user_id, question_id)` with a unique key for
  idempotency, so a user cannot vote twice on the same item.

Topics form a DAG-like graph: (id, name, `parent_topic_id`) with many-to-many
edges to questions and answers; each question carries a topic weight vector used
by feeds and recommendations.

- The primary read patterns are answers-by-question (indexed by
  `question_id, score`), questions-by-topic (a topic–question join), and follow
  edges (`user_id -> topic_id` / `user_id -> question_id`).
- Hot question pages cache the top-K answers; "load more" reads the score index.
- Question deduplication requires an inverted index over title shingles/n-grams
  plus a fuzzy-match worker that proposes merges.

### How do you rank answers and questions?

Answer ranking blends raw votes (upvotes minus downvotes) with quality signals —
answer length, writer expertise in the specific topic (credibility accumulated
from past answers there), recency, and vote velocity.

- The final score is computed by the Ranking Worker; the displayed "best answer"
  uses a confidence-corrected score such as a Wilson lower bound so a 1-vote
  answer cannot outrank a 500-vote one.
- Writer-topic credibility is a multiplicative boost: an answer from a known
  expert in the topic outranks an anonymous equivalent, which is what keeps Q&A
  quality high.

Question ranking for feeds and search combines answer count, recent activity,
follower count, and velocity.

- Both rankers run offline or periodically: the worker drains vote deltas and
  re-ranks affected questions, writing sorted lists into the Rank Cache.
- Each question page supports multiple sort modes — top, recent, and all-time
  most upvoted — as separate precomputed lists.
- Trade-off: real-time per-vote scoring would make every vote a global write;
  batch re-ranking introduces minutes of staleness, which is acceptable for a
  read-dominant Q&A pattern.

### Design the feed of recommended questions

The feed blends three candidate sources: recent high-ranked questions in
followed topics (pulled from the Topic Graph and weighted by topic affinity),
questions with new answers from followed users and experts, and
recommendation-engine candidates.

- The Feed Service merges these sets, applies a freshness-plus-quality score,
  and paginates with cursor offsets; results are cached per user with a short
  TTL.
- Candidate generation is pull-based, so a user's feed does not need a
  per-question fan-out push — the merge happens at read time from the topic and
  follow indexes.

Recommendation candidates come from an offline job that builds a user–topic
affinity matrix from follow, vote, and answer history, then scores candidate
questions by affinity × question quality × recency.

- Cold start uses trending-by-topic and popular-in-network defaults.
- Trade-offs: pull-based merge is cheap because topic membership is bounded, and
  scoring runs asynchronously so the live read path is cache-only.
- Feed freshness matters — a question with a hot new answer should resurface —
  so the worker refreshes the top of the feed more aggressively than the tail,
  and activity events trigger targeted invalidation.

### How do you moderate content and detect duplicate questions?

Moderation pipeline: every new question and answer passes through Moderation
Service heuristics — toxicity and quality classifiers, length and formatting
signals, spam URL patterns, and account-reputation gates.

- Flagged content goes to a human review queue, and content from new accounts is
  held under stricter review.
- Duplicate question detection is a separate pipeline: an inverted index over
  title tokens and shingles plus an embedding-based semantic similarity pass
  produces candidate pairs; a matcher worker clusters near-duplicates and
  proposes a canonical question.
- Merging keeps one canonical question and redirects the others while preserving
  their answer counts.

Both systems must be async so ask/answer latency stays low: content is shown
immediately but flagged or hidden within seconds-to-minutes if it fails checks,
and confirmed spam retrains the classifiers through a feedback loop.

- Trade-offs: aggressive auto-merge can wrongly combine distinct-but-related
  questions, so merges below a high similarity threshold are routed to human
  review.
- Vote manipulation reuses the fraud-signal store (velocity, account-cohort
  patterns) from the vote path, and the moderation and duplicate pipelines both
  scale as stream consumers over the write log.

## Source

```text
title: Quora Q&A
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node question: Questions [icon=message]
node answer: Answers [icon=compute]
node vote: Votes [icon=sync]
node topic: Topic Graph [icon=search]
node rank: Ranking Worker [icon=worker]
node mod: Moderation [icon=shield]
node notify: Notifications [icon=mail]
node db: Q&A DB [cylinder, icon=database]
node cache: Rank Cache [cylinder, icon=cache]

edge client -> api: ask
edge api -> question: create
edge question -> topic: classify
edge question -> db: persist
edge client -> api: answer
edge api -> answer: submit
edge answer -> question: attach
edge client -> api: vote
edge api -> vote: record
edge vote -> rank: score
edge rank -> cache: sorted
edge api -> mod: review
edge answer -> notify: followers
```

## Q&A

### Q: Design Quora / a Q&A platform

**A:** Quora is organized around questions that aggregate multiple answers from
knowledgeable users, all classified by a topic graph. The API gateway splits the
read-heavy browse path — feeds, question pages, ranked answers — from the write
path: ask, answer, vote, follow.

- The Questions Service persists questions with canonical deduplication, the
  Answers Service attaches answers to question ids, Votes feed a Ranking Worker
  that maintains per-question and per-topic sorted lists in the Rank Cache, and
  the Moderation Service screens new content before it is fully trusted.
- The Topic Graph powers the follow-based feed and recommendations.

Reads dominate: each question page is a cache-backed render of the top answers,
with pagination hitting a score index only on deep scroll.

- Writes are moderate but bursty after a question goes viral.
- The system favors availability and eventual consistency in ranking, but
  question deduplication and answer attribution need careful coordination to
  avoid duplicate questions and lost answers.
- Scale estimates: tens of millions of questions, hundreds of millions of
  answers, and a read path at millions of QPS, with votes being the hottest
  write path.

### Q: How do you model questions, answers, and topics?

**A:** Questions: (id, title, body, `canonical_id`, created_at). Because the same query
is often phrased many ways, a canonicalization layer maps duplicate questions to
a single canonical question.

- All answers attach to the canonical id and duplicate variants redirect to the
  merged page.
- Answers: (id, question_id, author_id, body, created_at, score), with the slim
  row (ids, score, timestamps) in an OLTP store for fast ranking updates and the
  full body in object storage.
- Votes: `(user_id, answer_id)` / `(user_id, question_id)` with a unique key for
  idempotency, so a user cannot vote twice on the same item.

Topics form a DAG-like graph: (id, name, `parent_topic_id`) with many-to-many
edges to questions and answers; each question carries a topic weight vector used
by feeds and recommendations.

- The primary read patterns are answers-by-question (indexed by
  `question_id, score`), questions-by-topic (a topic–question join), and follow
  edges (`user_id -> topic_id` / `user_id -> question_id`).
- Hot question pages cache the top-K answers; "load more" reads the score index.
- Question deduplication requires an inverted index over title shingles/n-grams
  plus a fuzzy-match worker that proposes merges.

### Q: How do you rank answers and questions?

**A:** Answer ranking blends raw votes (upvotes minus downvotes) with quality signals —
answer length, writer expertise in the specific topic (credibility accumulated
from past answers there), recency, and vote velocity.

- The final score is computed by the Ranking Worker; the displayed "best answer"
  uses a confidence-corrected score such as a Wilson lower bound so a 1-vote
  answer cannot outrank a 500-vote one.
- Writer-topic credibility is a multiplicative boost: an answer from a known
  expert in the topic outranks an anonymous equivalent, which is what keeps Q&A
  quality high.

Question ranking for feeds and search combines answer count, recent activity,
follower count, and velocity.

- Both rankers run offline or periodically: the worker drains vote deltas and
  re-ranks affected questions, writing sorted lists into the Rank Cache.
- Each question page supports multiple sort modes — top, recent, and all-time
  most upvoted — as separate precomputed lists.
- Trade-off: real-time per-vote scoring would make every vote a global write;
  batch re-ranking introduces minutes of staleness, which is acceptable for a
  read-dominant Q&A pattern.

### Q: Design the feed of recommended questions

**A:** The feed blends three candidate sources: recent high-ranked questions in
followed topics (pulled from the Topic Graph and weighted by topic affinity),
questions with new answers from followed users and experts, and
recommendation-engine candidates.

- The Feed Service merges these sets, applies a freshness-plus-quality score,
  and paginates with cursor offsets; results are cached per user with a short
  TTL.
- Candidate generation is pull-based, so a user's feed does not need a
  per-question fan-out push — the merge happens at read time from the topic and
  follow indexes.

Recommendation candidates come from an offline job that builds a user–topic
affinity matrix from follow, vote, and answer history, then scores candidate
questions by affinity × question quality × recency.

- Cold start uses trending-by-topic and popular-in-network defaults.
- Trade-offs: pull-based merge is cheap because topic membership is bounded, and
  scoring runs asynchronously so the live read path is cache-only.
- Feed freshness matters — a question with a hot new answer should resurface —
  so the worker refreshes the top of the feed more aggressively than the tail,
  and activity events trigger targeted invalidation.

### Q: How do you moderate content and detect duplicate questions?

**A:** Moderation pipeline: every new question and answer passes through Moderation
Service heuristics — toxicity and quality classifiers, length and formatting
signals, spam URL patterns, and account-reputation gates.

- Flagged content goes to a human review queue, and content from new accounts is
  held under stricter review.
- Duplicate question detection is a separate pipeline: an inverted index over
  title tokens and shingles plus an embedding-based semantic similarity pass
  produces candidate pairs; a matcher worker clusters near-duplicates and
  proposes a canonical question.
- Merging keeps one canonical question and redirects the others while preserving
  their answer counts.

Both systems must be async so ask/answer latency stays low: content is shown
immediately but flagged or hidden within seconds-to-minutes if it fails checks,
and confirmed spam retrains the classifiers through a feedback loop.

- Trade-offs: aggressive auto-merge can wrongly combine distinct-but-related
  questions, so merges below a high similarity threshold are routed to human
  review.
- Vote manipulation reuses the fraud-signal store (velocity, account-cohort
  patterns) from the vote path, and the moderation and duplicate pipelines both
  scale as stream consumers over the write log.

## Source

```text
title: Quora Q&A
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node question: Questions [icon=message]
node answer: Answers [icon=compute]
node vote: Votes [icon=sync]
node topic: Topic Graph [icon=search]
node rank: Ranking Worker [icon=worker]
node mod: Moderation [icon=shield]
node notify: Notifications [icon=mail]
node db: Q&A DB [cylinder, icon=database]
node cache: Rank Cache [cylinder, icon=cache]

edge client -> api: ask
edge api -> question: create
edge question -> topic: classify
edge question -> db: persist
edge client -> api: answer
edge api -> answer: submit
edge answer -> question: attach
edge client -> api: vote
edge api -> vote: record
edge vote -> rank: score
edge rank -> cache: sorted
edge api -> mod: review
edge answer -> notify: followers
```
