# Disqus — Comments Service

Design a comments system

**Difficulty:** Hard

**Tags:** messaging, notification, security

## Functional Requirements

- a comments system
- model threaded comments?
- handle moderation at scale?
- serve comment trees fast?
- handle spam and abuse?

## Non-Functional Requirements

- The tradeoff is latency of
  visibility: held comments take seconds to minutes to appear, which I would
  surface honestly in the UI.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Comments Service
user: User
site: Publisher Site
app: Comments Widget
gateway: API Gateway
thread: Thread Service
comment: Comment Service
nest: Tree Builder
moderate: Moderation
spam: Spam Filter
cache: Comment Cache
db: Comments DB

user ─► app ─► comment
app ─► gateway ─► submit
gateway ─► comment ─► create
comment ─► thread ─► attach
thread ─► nest ─► tree
nest ─► cache ─► build
gateway ─► moderate ─► scan
moderate ─► spam ─► filter
spam ─► comment ─► allow
cache ─► app ─► load
comment ─► db ─► store
```

## Design

### Design a comments system

A comments service is a read-heavy, multi-tenant system where thousands of
publisher sites share one infrastructure but see only their own data.

- I would build it around a thread service, a comment service, and a tree
  builder.
- The thread service owns thread metadata and lifecycle, the comment service
  owns individual comments and their relationships, and the tree builder
  assembles the nested structure the widget renders.
- Moderation runs as a side pipeline, the spam filter screens every inbound
  comment, and a comment cache serves the hot read path.
- A comments database is the system of record.

The write path is asynchronous so the publisher page never blocks.

- When a user posts through the widget, the gateway validates identity, the
  comment service persists the comment in a pending state, and moderation scans
  it in the background.
- If the spam filter and moderators clear it, the comment transitions to
  published, the thread service attaches it to the thread, and the tree builder
  marks the tree dirty for cache rebuild.
- The user sees their comment optimistically and a moderation notice if it is
  held.
- Reads are served from the cache, which stores fully built trees, so a popular
  article with thousands of comments loads in one round trip.

The tradeoff is between freshness and write cost.

- Comments appear quickly because of optimistic UI and cache invalidation on
  publish, but moderation introduces a short delay for held comments.
- Tenant isolation is achieved by scoping every query with the thread and site
  id; the database is sharded by thread hash so a single article's hot tree
  lives on one shard.
- The design accepts that the tree builder does the heavy assembly once per
  invalidation and amortizes it across many reads, which is the right balance
  for a workload dominated by page views.

### How do you model threaded comments?

Threaded comments are best modeled as a tree with a materialized path for
efficient subtree queries.

- Each comment stores a unique id, its thread id, its parent id, a depth, and a
  path that encodes the full ancestor chain, such as `root/12/34/56`.
- The path makes three common operations cheap: fetching all descendants of a
  comment, computing depth for indentation, and ordering siblings.
- Storing the path denormalized means the tree builder does not need recursive
  joins, which become unmanageable when a thread has tens of thousands of
  comments.

I would store comments in a relational database sharded by thread id.

- An index on `(thread_id, path)` lets a whole thread be read as an ordered
  scan.
- The parent id is retained for referential integrity and deletion handling.
- When a comment is deleted, I would keep the node but mark it deleted and
  replace its text with a placeholder, so the tree structure and replies remain
  intact rather than reparenting subtrees.
- A soft-deleted comment preserves the shape of the thread, which matters for
  long, active discussions.

Concurrency is handled with version stamps.

- Two replies to the same comment do not conflict because they are independent
  nodes, so the insert path is simple.
- Editing is an optimistic update that compares version numbers and rejects
  stale writes.
- The tree builder consumes the flat rows and assembles nested objects, which is
  a single pass over a sorted scan.
- For very deep threads I would cap the nesting depth and flatten deeper replies
  to the maximum level, because an infinite indentation tree is unreadable on a
  page and unbounded depth complicates every downstream consumer.

### How do you handle moderation at scale?

Moderation is a pipeline, not a single check, because no classifier is
authoritative. Every inbound comment is scanned by an automated moderation
service that runs the spam filter, policy checks for toxic content, and
site-specific rules. Each check produces a score and the scores are combined
into a verdict: allow, hold for human review, or block. The pipeline runs
asynchronously off the write path so the gateway never blocks on model
inference. Results are stored per comment so the verdict is auditable and
reviewable.

Automated checks get most of the volume, but ambiguous cases need humans. Held
comments flow into a review queue, which I would prioritize by thread traffic
and escalation score so moderators spend time where it matters. Moderator
decisions are fed back into the system as labels that retrain the models, which
is the mechanism that keeps precision high as language and abuse patterns drift.
A reputation tier lets trusted users post straight to published, bypassing the
queue, while new or low- reputation users are always held first.

Scale comes from making the pipeline stateless and idempotent. The moderation
service is horizontally scaled, each check is a pure function of the comment and
config, and the verdict is recomputable, so retries do not double-apply rules.
Rule configuration is versioned and stored centrally so a policy change
re-verdicts existing comments without code deploys. The tradeoff is latency of
visibility: held comments take seconds to minutes to appear, which I would
surface honestly in the UI. Throughput is capped by the review team, so the
queue length is monitored and the automated hold rate is tuned to keep it
bounded.

### How do you serve comment trees fast?

Comments are read far more often than written, so serving speed comes from
building trees once and caching them. The tree builder assembles a serialized,
fully nested tree per thread and stores it in the comment cache with a version
key. The widget loads the tree in a single request from the cache, so a thread
with thousands of comments is served without a single database query on the hot
path. Pagination for huge threads uses the cached structure plus a secondary
index on the newest comments, so the initial view is fast and infinite scroll
fetches only new pages.

Cache invalidation is the hard part. Publishing a comment invalidates the
thread's cached tree, which could be rebuilt immediately or lazily on next read;
I would rebuild lazily with a write-through pattern where the tree builder
refreshes the cache and the next reader gets a fresh copy. To avoid a stampede
when a popular article gets a burst of comments, the rebuild uses a
single-flight lock so only one builder populates the cache while others wait.
The version key on the tree makes stale reads detectable and lets the widget
show a refresh prompt when a thread changed since the page loaded.

The database remains the fallback for cold misses and deep pagination. A miss
reads the thread rows in one ordered scan and hands them to the tree builder;
because the builder is a pure function, any replica can produce an identical
tree. I would set the cache TTL as a backstop and rely primarily on
invalidation. Metrics on hit ratio, build time, and per-thread read volume drive
capacity planning, and hot threads can be pinned in cache. The tradeoff is that
invalidation carries a brief window of staleness, which is acceptable for
comments and far cheaper than assembling trees per request.

### How do you handle spam and abuse?

Spam is an economic attack, so the defense must be fast, layered, and constantly
updated. Every comment passes through a spam filter on the moderation pipeline
that scores signals: link density, known spammy domains, content similarity to
previously flagged comments, account behavior, and device fingerprint. Rules and
the model verdict combine into a decision, and confident spam is blocked
outright while uncertain cases are held. Because spam patterns shift quickly,
the filter trains on the continuous feedback from moderator decisions and user
reports.

Account-level signals matter as much as content. New accounts, accounts that
post the same text to many threads, and accounts behind proxies or data-center
IPs are treated with higher suspicion. I would maintain per-user reputation that
decays over time, and rate limit posting by user, IP, and thread so a single
attacker cannot flood a discussion. Challenge mechanisms such as CAPTCHAs appear
only when signals are ambiguous, because friction on every comment destroys the
user experience that keeps legitimate commenters engaged.

Abuse is a reporting and enforcement problem layered on spam detection. Users
can flag comments, and a queue of flagged items is prioritized and reviewed with
moderation history visible. Repeat offenders are suspended, with their account
and fingerprint blocked; the block is propagated to the automated checks so
their future content never reaches publishing. Everything is logged to a
moderation audit trail so appeals are resolvable and enforcement is fair. The
tradeoff is between false positives, which enrage legitimate users, and false
negatives, which let abuse spread; the feedback loop of labeling keeps the
balance tuned.

## Source

```text
title: Comments Service
node user: User [round, icon=browser]
node site: Publisher Site [icon=browser]
node app: Comments Widget [icon=browser]
node gateway: API Gateway [icon=server]
node thread: Thread Service [icon=compute]
node comment: Comment Service [icon=compute]
node nest: Tree Builder [icon=compute]
node moderate: Moderation [icon=shield]
node spam: Spam Filter [icon=compute]
node cache: Comment Cache [cylinder, icon=cache]
node db: Comments DB [cylinder, icon=database]

edge user -> app: comment
edge app -> gateway: submit
edge gateway -> comment: create
edge comment -> thread: attach
edge thread -> nest: tree
edge nest -> cache: build
edge gateway -> moderate: scan
edge moderate -> spam: filter
edge spam -> comment: allow
edge cache -> app: load
edge comment -> db: store
```

## Q&A

### Q: Design a comments system

**A:** A comments service is a read-heavy, multi-tenant system where thousands of
publisher sites share one infrastructure but see only their own data.

- I would build it around a thread service, a comment service, and a tree
  builder.
- The thread service owns thread metadata and lifecycle, the comment service
  owns individual comments and their relationships, and the tree builder
  assembles the nested structure the widget renders.
- Moderation runs as a side pipeline, the spam filter screens every inbound
  comment, and a comment cache serves the hot read path.
- A comments database is the system of record.

The write path is asynchronous so the publisher page never blocks.

- When a user posts through the widget, the gateway validates identity, the
  comment service persists the comment in a pending state, and moderation scans
  it in the background.
- If the spam filter and moderators clear it, the comment transitions to
  published, the thread service attaches it to the thread, and the tree builder
  marks the tree dirty for cache rebuild.
- The user sees their comment optimistically and a moderation notice if it is
  held.
- Reads are served from the cache, which stores fully built trees, so a popular
  article with thousands of comments loads in one round trip.

The tradeoff is between freshness and write cost.

- Comments appear quickly because of optimistic UI and cache invalidation on
  publish, but moderation introduces a short delay for held comments.
- Tenant isolation is achieved by scoping every query with the thread and site
  id; the database is sharded by thread hash so a single article's hot tree
  lives on one shard.
- The design accepts that the tree builder does the heavy assembly once per
  invalidation and amortizes it across many reads, which is the right balance
  for a workload dominated by page views.

### Q: How do you model threaded comments?

**A:** Threaded comments are best modeled as a tree with a materialized path for
efficient subtree queries.

- Each comment stores a unique id, its thread id, its parent id, a depth, and a
  path that encodes the full ancestor chain, such as `root/12/34/56`.
- The path makes three common operations cheap: fetching all descendants of a
  comment, computing depth for indentation, and ordering siblings.
- Storing the path denormalized means the tree builder does not need recursive
  joins, which become unmanageable when a thread has tens of thousands of
  comments.

I would store comments in a relational database sharded by thread id.

- An index on `(thread_id, path)` lets a whole thread be read as an ordered
  scan.
- The parent id is retained for referential integrity and deletion handling.
- When a comment is deleted, I would keep the node but mark it deleted and
  replace its text with a placeholder, so the tree structure and replies remain
  intact rather than reparenting subtrees.
- A soft-deleted comment preserves the shape of the thread, which matters for
  long, active discussions.

Concurrency is handled with version stamps.

- Two replies to the same comment do not conflict because they are independent
  nodes, so the insert path is simple.
- Editing is an optimistic update that compares version numbers and rejects
  stale writes.
- The tree builder consumes the flat rows and assembles nested objects, which is
  a single pass over a sorted scan.
- For very deep threads I would cap the nesting depth and flatten deeper replies
  to the maximum level, because an infinite indentation tree is unreadable on a
  page and unbounded depth complicates every downstream consumer.

### Q: How do you handle moderation at scale?

**A:** Moderation is a pipeline, not a single check, because no classifier is
authoritative. Every inbound comment is scanned by an automated moderation
service that runs the spam filter, policy checks for toxic content, and
site-specific rules. Each check produces a score and the scores are combined
into a verdict: allow, hold for human review, or block. The pipeline runs
asynchronously off the write path so the gateway never blocks on model
inference. Results are stored per comment so the verdict is auditable and
reviewable.

Automated checks get most of the volume, but ambiguous cases need humans. Held
comments flow into a review queue, which I would prioritize by thread traffic
and escalation score so moderators spend time where it matters. Moderator
decisions are fed back into the system as labels that retrain the models, which
is the mechanism that keeps precision high as language and abuse patterns drift.
A reputation tier lets trusted users post straight to published, bypassing the
queue, while new or low- reputation users are always held first.

Scale comes from making the pipeline stateless and idempotent. The moderation
service is horizontally scaled, each check is a pure function of the comment and
config, and the verdict is recomputable, so retries do not double-apply rules.
Rule configuration is versioned and stored centrally so a policy change
re-verdicts existing comments without code deploys. The tradeoff is latency of
visibility: held comments take seconds to minutes to appear, which I would
surface honestly in the UI. Throughput is capped by the review team, so the
queue length is monitored and the automated hold rate is tuned to keep it
bounded.

### Q: How do you serve comment trees fast?

**A:** Comments are read far more often than written, so serving speed comes from
building trees once and caching them. The tree builder assembles a serialized,
fully nested tree per thread and stores it in the comment cache with a version
key. The widget loads the tree in a single request from the cache, so a thread
with thousands of comments is served without a single database query on the hot
path. Pagination for huge threads uses the cached structure plus a secondary
index on the newest comments, so the initial view is fast and infinite scroll
fetches only new pages.

Cache invalidation is the hard part. Publishing a comment invalidates the
thread's cached tree, which could be rebuilt immediately or lazily on next read;
I would rebuild lazily with a write-through pattern where the tree builder
refreshes the cache and the next reader gets a fresh copy. To avoid a stampede
when a popular article gets a burst of comments, the rebuild uses a
single-flight lock so only one builder populates the cache while others wait.
The version key on the tree makes stale reads detectable and lets the widget
show a refresh prompt when a thread changed since the page loaded.

The database remains the fallback for cold misses and deep pagination. A miss
reads the thread rows in one ordered scan and hands them to the tree builder;
because the builder is a pure function, any replica can produce an identical
tree. I would set the cache TTL as a backstop and rely primarily on
invalidation. Metrics on hit ratio, build time, and per-thread read volume drive
capacity planning, and hot threads can be pinned in cache. The tradeoff is that
invalidation carries a brief window of staleness, which is acceptable for
comments and far cheaper than assembling trees per request.

### Q: How do you handle spam and abuse?

**A:** Spam is an economic attack, so the defense must be fast, layered, and constantly
updated. Every comment passes through a spam filter on the moderation pipeline
that scores signals: link density, known spammy domains, content similarity to
previously flagged comments, account behavior, and device fingerprint. Rules and
the model verdict combine into a decision, and confident spam is blocked
outright while uncertain cases are held. Because spam patterns shift quickly,
the filter trains on the continuous feedback from moderator decisions and user
reports.

Account-level signals matter as much as content. New accounts, accounts that
post the same text to many threads, and accounts behind proxies or data-center
IPs are treated with higher suspicion. I would maintain per-user reputation that
decays over time, and rate limit posting by user, IP, and thread so a single
attacker cannot flood a discussion. Challenge mechanisms such as CAPTCHAs appear
only when signals are ambiguous, because friction on every comment destroys the
user experience that keeps legitimate commenters engaged.

Abuse is a reporting and enforcement problem layered on spam detection. Users
can flag comments, and a queue of flagged items is prioritized and reviewed with
moderation history visible. Repeat offenders are suspended, with their account
and fingerprint blocked; the block is propagated to the automated checks so
their future content never reaches publishing. Everything is logged to a
moderation audit trail so appeals are resolvable and enforcement is fair. The
tradeoff is between false positives, which enrage legitimate users, and false
negatives, which let abuse spread; the feedback loop of labeling keeps the
balance tuned.

## Source

```text
title: Comments Service
node user: User [round, icon=browser]
node site: Publisher Site [icon=browser]
node app: Comments Widget [icon=browser]
node gateway: API Gateway [icon=server]
node thread: Thread Service [icon=compute]
node comment: Comment Service [icon=compute]
node nest: Tree Builder [icon=compute]
node moderate: Moderation [icon=shield]
node spam: Spam Filter [icon=compute]
node cache: Comment Cache [cylinder, icon=cache]
node db: Comments DB [cylinder, icon=database]

edge user -> app: comment
edge app -> gateway: submit
edge gateway -> comment: create
edge comment -> thread: attach
edge thread -> nest: tree
edge nest -> cache: build
edge gateway -> moderate: scan
edge moderate -> spam: filter
edge spam -> comment: allow
edge cache -> app: load
edge comment -> db: store
```
