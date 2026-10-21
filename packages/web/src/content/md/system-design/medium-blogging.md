# Medium — Blogging

Design Medium / a blogging platform

**Difficulty:** Easy

**Tags:** social

## Functional Requirements

- Medium / a blogging platform
- design the writing and publishing flow?
- a following feed with recommendations
- build discovery (tags, topics, trends)?
- measure and surface engagement (claps)?

## Non-Functional Requirements

- Medium combines a writing and editor backend, a publish service, a following
  feed, and a discovery layer.

- The API gateway separates the read-heavy browse path from the write path.
- The Editor Service manages drafts with debounced autosave and revision
  history; the Post Service handles publishing and persistence to Posts DB, then
  the Notifications service fans out to followers.
- The Feed Service builds the reader's feed from the Following Graph, while the
  Recommendations service injects candidate posts scored by tag affinity; the
  Tag Index powers tag browse and trends.
- Posts store structured JSON content plus rendered HTML, so the reader page is
  served almost entirely from cache.

Key constraints:

- Article content is far larger than a tweet yet is consumed in a social-feed
  pattern, so reads dominate by orders of magnitude while publishes are bursty
  and rare.
- Drafts must never be lost — every keystroke snapshot is durably persisted and
  reconciled on reconnect — while feed ranking is explicitly eventually
  consistent.
- Availability is the priority on the reader path; a single miss falls back to a
  DB read with the cache primed asynchronously.
- Scale estimates: millions of MAU, tens of thousands of reads per second,
  publishing at a tiny fraction of that, and clap writes landing somewhere
  between the two..
- 30 days).
- Drafts are private by default; a draft row holds status (`draft` /
  `published`), a unique slug, and a pointer to revision objects in object
  storage.
- Publishing is an explicit state transition: validate the document, run a
  link-unfurl and image-upload step, render HTML, set `status=published`,
  backfill the tag index and search index, then fire the follower notification.
- An idempotency key on the publish request prevents double-publishes.

The write path is fast because the document writes to a durable log/store
immediately while HTML rendering happens asynchronously; the post is only served
publicly once rendering completes and the cache is primed.

- Crashes mid-edit recover from the last snapshot with an undo/redo log.
- Trade-off: client-side snapshot sync is complex, but a per-keystroke server
  API would multiply latency and storage cost; diffing snapshots keeps payloads
  small.
- Concurrency is handled with optimistic locking on `updated_at`; Medium is
  single-author, so last-write-wins plus a revision log is enough — a
  multi-editor collaborative model would need OT/CRDT..
- Tags are first-class entities (id, slug); posts link to many tags through a join
  table, and the Tag Index maintains per-tag sorted lists of post ids by recency
  and score.

- Discovery surfaces three things: tag browse (all recent posts in a tag), topic
  pages (curated bundles of tags), and trends (tags and posts whose velocity has
  spiked).
- Velocity is measured from a rolling window of claps, reads, and new-post
  counts aggregated in a stream processor; a trend score is the current rate
  relative to baseline (z-score-style), so a consistently popular tag does not
  permanently dominate the trending slots.

The browse path reads from cache.

- Each tag has a sorted-set cache of post ids refreshed by the ranking worker,
  and topic pages are composed from their constituent tags' cached lists.
- Trending is recomputed every few minutes and cached globally since only a
  small number of trend slots exist.
- Trade-offs: tag cardinality is high but per-tag write rates are low, so
  per-tag cached lists scale fine; trends need fresh signal, so they bypass long
  TTLs and tolerate recompute cost.
- Trend manipulation is mitigated by requiring velocity to come from a diverse
  user set, reusing the vote-fraud signal pipeline..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Medium Blogging
client: Client
api: API Gateway
editor: Editor Service
post: Post Service
follow: Following Graph
feed: Feed Service
tag: Tag Index
recs: Recommendations
notify: Notifications
db: Posts DB
cache: Feed Cache

client ─► api ─► write
api ─► editor ─► draft
editor ─► post ─► save
post ─► db ─► persist
post ─► notify ─► followers
client ─► api ─► read feed
api ─► feed ─► build
feed ─► follow ─► authors
api ─► tag ─► browse
tag ─► recs ─► discover
recs ─► feed ─► candidates
api ─► cache ─► read
```

## Design

### Design Medium / a blogging platform

Medium combines a writing and editor backend, a publish service, a following
feed, and a discovery layer.

- The API gateway separates the read-heavy browse path from the write path.
- The Editor Service manages drafts with debounced autosave and revision
  history; the Post Service handles publishing and persistence to Posts DB, then
  the Notifications service fans out to followers.
- The Feed Service builds the reader's feed from the Following Graph, while the
  Recommendations service injects candidate posts scored by tag affinity; the
  Tag Index powers tag browse and trends.
- Posts store structured JSON content plus rendered HTML, so the reader page is
  served almost entirely from cache.

Key constraints:

- Article content is far larger than a tweet yet is consumed in a social-feed
  pattern, so reads dominate by orders of magnitude while publishes are bursty
  and rare.
- Drafts must never be lost — every keystroke snapshot is durably persisted and
  reconciled on reconnect — while feed ranking is explicitly eventually
  consistent.
- Availability is the priority on the reader path; a single miss falls back to a
  DB read with the cache primed asynchronously.
- Scale estimates: millions of MAU, tens of thousands of reads per second,
  publishing at a tiny fraction of that, and clap writes landing somewhere
  between the two.

### How do you design the writing and publishing flow?

The editor is a client-side rich-text application.

- Every keystroke produces an operational snapshot serialized as a structured
  JSON document model, not raw HTML.
- Debounced autosave pushes the latest snapshot to the Editor Service, which
  stores each revision and keeps a configurable history (e.g. 30 days).
- Drafts are private by default; a draft row holds status (`draft` /
  `published`), a unique slug, and a pointer to revision objects in object
  storage.
- Publishing is an explicit state transition: validate the document, run a
  link-unfurl and image-upload step, render HTML, set `status=published`,
  backfill the tag index and search index, then fire the follower notification.
- An idempotency key on the publish request prevents double-publishes.

The write path is fast because the document writes to a durable log/store
immediately while HTML rendering happens asynchronously; the post is only served
publicly once rendering completes and the cache is primed.

- Crashes mid-edit recover from the last snapshot with an undo/redo log.
- Trade-off: client-side snapshot sync is complex, but a per-keystroke server
  API would multiply latency and storage cost; diffing snapshots keeps payloads
  small.
- Concurrency is handled with optimistic locking on `updated_at`; Medium is
  single-author, so last-write-wins plus a revision log is enough — a
  multi-editor collaborative model would need OT/CRDT.

### Design a following feed with recommendations

Pull-based fanout fits Medium well.

- Authors are few relative to readers, and each user follows a modest set of
  authors, so at read time the Feed Service merges the latest posts of the
  followed authors from the Following Graph — a sparse adjacency list of
  `(follower_id, author_id)` edges.
- The merge reads each author's recent posts via an `(author_id, created_at)`
  index and interleaves recommendation candidates.
- Results are cached per user with a short TTL (minutes) so new posts surface
  quickly; invalidation fires when a followed author publishes.

Recommendations score candidate posts by author similarity to the user's
followed set (collaborative filtering over co-followed authors), tag affinity
from reading history, and engagement signals (claps, read ratio, dwell time).

- Cold-start users fall back to trending-by-tag and global popularity.
- Trade-offs: pure push fanout would flood the notification pipeline and waste
  writes on a platform where most follows are passive — pull keeps write
  amplification near zero at the cost of a per-read merge, which the cache
  absorbs.
- The feed supports two tabs — Following (strictly chronological merge) and For
  You (scored) — sharing the same per-user cache layer with different scoring
  paths.

### How do you build discovery (tags, topics, trends)?

Tags are first-class entities (id, slug); posts link to many tags through a join
table, and the Tag Index maintains per-tag sorted lists of post ids by recency
and score.

- Discovery surfaces three things: tag browse (all recent posts in a tag), topic
  pages (curated bundles of tags), and trends (tags and posts whose velocity has
  spiked).
- Velocity is measured from a rolling window of claps, reads, and new-post
  counts aggregated in a stream processor; a trend score is the current rate
  relative to baseline (z-score-style), so a consistently popular tag does not
  permanently dominate the trending slots.

The browse path reads from cache.

- Each tag has a sorted-set cache of post ids refreshed by the ranking worker,
  and topic pages are composed from their constituent tags' cached lists.
- Trending is recomputed every few minutes and cached globally since only a
  small number of trend slots exist.
- Trade-offs: tag cardinality is high but per-tag write rates are low, so
  per-tag cached lists scale fine; trends need fresh signal, so they bypass long
  TTLs and tolerate recompute cost.
- Trend manipulation is mitigated by requiring velocity to come from a diverse
  user set, reusing the vote-fraud signal pipeline.

### How do you measure and surface engagement (claps)?

Claps are Medium's engagement currency: one user can clap 1–50 times per post.

- The vote path records `(user_id, post_id, clap_count)` idempotently — a user
  can clap a post at most once, with repeated taps accumulating into that single
  event — and aggregates into per-post totals.
- The number displayed is a denormalized count updated by an aggregation worker;
  the per-user events are kept separately for audits and fraud checks.
- Claps are the dominant ranking feature, feeding both the post's own score and
  the recommendation engine's training signal.

The Claps Service rate-limits per user, dedupes session claps, and streams
events to analytics.

- Ranking weights claps but blends in read time and read ratio so a spammy-clap
  burst does not inflate a post.
- Surfacing: clap counts appear on cards in the feed, tag browse, and the post
  page, and "most clapped" lists are precomputed by the worker.
- Failure handling: a clap arriving during an outage is queued and replayed;
  counts are eventually consistent, so the UI shows an approximate total
  immediately and reconciles within seconds.

## Source

```text
title: Medium Blogging
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node editor: Editor Service [icon=file]
node post: Post Service [icon=compute]
node follow: Following Graph [icon=users]
node feed: Feed Service [icon=message]
node tag: Tag Index [icon=search]
node recs: Recommendations [icon=cache]
node notify: Notifications [icon=mail]
node db: Posts DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: write
edge api -> editor: draft
edge editor -> post: save
edge post -> db: persist
edge post -> notify: followers
edge client -> api: read feed
edge api -> feed: build
edge feed -> follow: authors
edge api -> tag: browse
edge tag -> recs: discover
edge recs -> feed: candidates
edge api -> cache: read
```

## Q&A

### Q: Design Medium / a blogging platform

**A:** Medium combines a writing and editor backend, a publish service, a following
feed, and a discovery layer.

- The API gateway separates the read-heavy browse path from the write path.
- The Editor Service manages drafts with debounced autosave and revision
  history; the Post Service handles publishing and persistence to Posts DB, then
  the Notifications service fans out to followers.
- The Feed Service builds the reader's feed from the Following Graph, while the
  Recommendations service injects candidate posts scored by tag affinity; the
  Tag Index powers tag browse and trends.
- Posts store structured JSON content plus rendered HTML, so the reader page is
  served almost entirely from cache.

Key constraints:

- Article content is far larger than a tweet yet is consumed in a social-feed
  pattern, so reads dominate by orders of magnitude while publishes are bursty
  and rare.
- Drafts must never be lost — every keystroke snapshot is durably persisted and
  reconciled on reconnect — while feed ranking is explicitly eventually
  consistent.
- Availability is the priority on the reader path; a single miss falls back to a
  DB read with the cache primed asynchronously.
- Scale estimates: millions of MAU, tens of thousands of reads per second,
  publishing at a tiny fraction of that, and clap writes landing somewhere
  between the two.

### Q: How do you design the writing and publishing flow?

**A:** The editor is a client-side rich-text application.

- Every keystroke produces an operational snapshot serialized as a structured
  JSON document model, not raw HTML.
- Debounced autosave pushes the latest snapshot to the Editor Service, which
  stores each revision and keeps a configurable history (e.g. 30 days).
- Drafts are private by default; a draft row holds status (`draft` /
  `published`), a unique slug, and a pointer to revision objects in object
  storage.
- Publishing is an explicit state transition: validate the document, run a
  link-unfurl and image-upload step, render HTML, set `status=published`,
  backfill the tag index and search index, then fire the follower notification.
- An idempotency key on the publish request prevents double-publishes.

The write path is fast because the document writes to a durable log/store
immediately while HTML rendering happens asynchronously; the post is only served
publicly once rendering completes and the cache is primed.

- Crashes mid-edit recover from the last snapshot with an undo/redo log.
- Trade-off: client-side snapshot sync is complex, but a per-keystroke server
  API would multiply latency and storage cost; diffing snapshots keeps payloads
  small.
- Concurrency is handled with optimistic locking on `updated_at`; Medium is
  single-author, so last-write-wins plus a revision log is enough — a
  multi-editor collaborative model would need OT/CRDT.

### Q: Design a following feed with recommendations

**A:** Pull-based fanout fits Medium well.

- Authors are few relative to readers, and each user follows a modest set of
  authors, so at read time the Feed Service merges the latest posts of the
  followed authors from the Following Graph — a sparse adjacency list of
  `(follower_id, author_id)` edges.
- The merge reads each author's recent posts via an `(author_id, created_at)`
  index and interleaves recommendation candidates.
- Results are cached per user with a short TTL (minutes) so new posts surface
  quickly; invalidation fires when a followed author publishes.

Recommendations score candidate posts by author similarity to the user's
followed set (collaborative filtering over co-followed authors), tag affinity
from reading history, and engagement signals (claps, read ratio, dwell time).

- Cold-start users fall back to trending-by-tag and global popularity.
- Trade-offs: pure push fanout would flood the notification pipeline and waste
  writes on a platform where most follows are passive — pull keeps write
  amplification near zero at the cost of a per-read merge, which the cache
  absorbs.
- The feed supports two tabs — Following (strictly chronological merge) and For
  You (scored) — sharing the same per-user cache layer with different scoring
  paths.

### Q: How do you build discovery (tags, topics, trends)?

**A:** Tags are first-class entities (id, slug); posts link to many tags through a join
table, and the Tag Index maintains per-tag sorted lists of post ids by recency
and score.

- Discovery surfaces three things: tag browse (all recent posts in a tag), topic
  pages (curated bundles of tags), and trends (tags and posts whose velocity has
  spiked).
- Velocity is measured from a rolling window of claps, reads, and new-post
  counts aggregated in a stream processor; a trend score is the current rate
  relative to baseline (z-score-style), so a consistently popular tag does not
  permanently dominate the trending slots.

The browse path reads from cache.

- Each tag has a sorted-set cache of post ids refreshed by the ranking worker,
  and topic pages are composed from their constituent tags' cached lists.
- Trending is recomputed every few minutes and cached globally since only a
  small number of trend slots exist.
- Trade-offs: tag cardinality is high but per-tag write rates are low, so
  per-tag cached lists scale fine; trends need fresh signal, so they bypass long
  TTLs and tolerate recompute cost.
- Trend manipulation is mitigated by requiring velocity to come from a diverse
  user set, reusing the vote-fraud signal pipeline.

### Q: How do you measure and surface engagement (claps)?

**A:** Claps are Medium's engagement currency: one user can clap 1–50 times per post.

- The vote path records `(user_id, post_id, clap_count)` idempotently — a user
  can clap a post at most once, with repeated taps accumulating into that single
  event — and aggregates into per-post totals.
- The number displayed is a denormalized count updated by an aggregation worker;
  the per-user events are kept separately for audits and fraud checks.
- Claps are the dominant ranking feature, feeding both the post's own score and
  the recommendation engine's training signal.

The Claps Service rate-limits per user, dedupes session claps, and streams
events to analytics.

- Ranking weights claps but blends in read time and read ratio so a spammy-clap
  burst does not inflate a post.
- Surfacing: clap counts appear on cards in the feed, tag browse, and the post
  page, and "most clapped" lists are precomputed by the worker.
- Failure handling: a clap arriving during an outage is queued and replayed;
  counts are eventually consistent, so the UI shows an approximate total
  immediately and reconciles within seconds.

## Source

```text
title: Medium Blogging
node client: Client [round, icon=browser]
node api: API Gateway [icon=server]
node editor: Editor Service [icon=file]
node post: Post Service [icon=compute]
node follow: Following Graph [icon=users]
node feed: Feed Service [icon=message]
node tag: Tag Index [icon=search]
node recs: Recommendations [icon=cache]
node notify: Notifications [icon=mail]
node db: Posts DB [cylinder, icon=database]
node cache: Feed Cache [cylinder, icon=cache]

edge client -> api: write
edge api -> editor: draft
edge editor -> post: save
edge post -> db: persist
edge post -> notify: followers
edge client -> api: read feed
edge api -> feed: build
edge feed -> follow: authors
edge api -> tag: browse
edge tag -> recs: discover
edge recs -> feed: candidates
edge api -> cache: read
```
