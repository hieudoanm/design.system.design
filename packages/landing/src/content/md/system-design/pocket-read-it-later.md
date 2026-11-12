# Pocket — Read It Later

Design a read-it-later service

**Difficulty:** Hard

**Tags:** search

## Functional Requirements

- a read-it-later service
- fetch and extract article content reliably?
- handle paywalls and dynamic pages?
- recommend articles and tag content?
- sync reading progress across devices?

## Non-Functional Requirements

- The system has two halves.

- The save half takes a URL, fetches the underlying page, extracts the article
  text and images, and stores a normalized copy.
- The read half serves that copy to the user, tracks reading progress, and
  supports search and tagging across the saved library.
- The Save Service handles the entry point, a Fetch Worker does the crawling,
  and the Content Extractor produces the clean document that the Articles DB
  stores.

Save must be asynchronous and reliable.

- The Fetch Worker
  receives a URL from the queue, resolves redirects, negotiates content encoding,
  and downloads the HTML with a timeout.

- The interesting part is scale: a domain that changes once a day and a news
  site that changes every minute need different treatment.
- The system keeps a per-domain crawl budget, throttling request rate so
  publishers do not treat it as an attack, and it respects robots directives
  where legally appropriate.
- A failed fetch is retried with exponential backoff, and a URL that fails
  persistently is flagged rather than retried forever.

Extraction turns messy HTML into a clean article.

- A
  paywall is a paywall because the full text is not available to an anonymous
  fetch; the Fetch Worker will get only the teaser.

- The honest solution is not to bypass the paywall, but to recognize it and fall
  back to whatever is legitimately available: the preview paragraphs, the
  metered free content, or the article's headline and summary.
- The extractor scores the result and, if the text is below a completeness
  threshold, stores the fragment and records that the save is partial, letting
  the user decide whether to keep it or read on the publisher site.

Dynamic pages render their content with JavaScript, so a plain HTML fetch
returns an empty shell.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Read It Later
user: Reader
app: Reader App
gateway: API Gateway
save: Save Service
fetch: Fetch Worker
extract: Content Extractor
queue: Fetch Queue
tag: Tagging
progress: Reading Progress
cache: Article Cache
db: Articles DB

user ─► app ─► save url
app ─► gateway ─► request
gateway ─► save ─► queue
save ─► queue ─► enqueue
queue ─► fetch ─► crawl
fetch ─► extract ─► parse
extract ─► db ─► store
extract ─► cache ─► cache
user ─► app ─► read
app ─► progress ─► track
db ─► tag ─► classify
tag ─► app ─► filter
```

## Design

### Design a read-it-later service

A read-it-later service like Pocket solves a simple pain: you find an article
you cannot read now, save it, and it appears later as a clean, readable version
on any device. The system has two halves.

- The save half takes a URL, fetches the underlying page, extracts the article
  text and images, and stores a normalized copy.
- The read half serves that copy to the user, tracks reading progress, and
  supports search and tagging across the saved library.
- The Save Service handles the entry point, a Fetch Worker does the crawling,
  and the Content Extractor produces the clean document that the Articles DB
  stores.

Save must be asynchronous and reliable. Saving a URL is a cheap request that
returns immediately; the real work, fetching and parsing a page that may be
slow, heavy, or down, happens in the background through a Fetch Queue.

- This queue gives the system control over crawl rate, retries, and backoff, so
  a flood of saves to a single domain does not overwhelm either the site or the
  fetchers.
- Deduplication prevents saving the same article twice: the Save Service checks
  the URL hash and canonical URL before enqueueing, and if the article already
  exists, it just links it to the new user.

Reading is the payoff. The reader renders the extracted article, not the
original page, which is both the product's value and its guarantee: no popups,
no navigation noise, and text that reflows at any size.

- Reading progress is synced per article per user, so a phone and a tablet stay
  in step.
- Search over the saved library and auto-tagging complete the loop, turning a
  stack of saved links into an actually findable archive.
- The separation of the save pipeline from the read path means a slow crawl
  never degrades the snappy reading experience.

### How do you fetch and extract article content reliably?

Fetching the web is an exercise in handling unreliability. The Fetch Worker
receives a URL from the queue, resolves redirects, negotiates content encoding,
and downloads the HTML with a timeout.

- The interesting part is scale: a domain that changes once a day and a news
  site that changes every minute need different treatment.
- The system keeps a per-domain crawl budget, throttling request rate so
  publishers do not treat it as an attack, and it respects robots directives
  where legally appropriate.
- A failed fetch is retried with exponential backoff, and a URL that fails
  persistently is flagged rather than retried forever.

Extraction turns messy HTML into a clean article. The Content Extractor parses
the document and identifies the main content block using a scoring algorithm
that weights paragraphs, text density, and known layout heuristics, then strips
navigation, footers, and widgets.

- The output is a normalized document with the title, author, publication date,
  and extracted images.
- Because publisher markup changes constantly, extraction rules must degrade
  gracefully: the system maintains readability heuristics that need no site
  specific configuration, plus a per-domain override layer that fixes known
  trouble sites without shipping new code.

Correctness is judged by what the reader sees.

- Each extraction run records a score for confidence, and low-confidence results
  are re-extracted with alternate strategies, such as trying alternate URLs or
  the AMP or RSS version.
- Deduplication of the same article fetched twice uses canonical link tags and
  content hashing.
- The stored copy is the extracted document, so the archive survives the
  original page being edited or removed; a background re-fetch job refreshes
  articles only when the saved document is missing required fields.
- Reliability here means the user almost never sees an empty or broken saved
  article.

### How do you handle paywalls and dynamic pages?

Paywalls and dynamic pages are the two hard realities of web extraction. A
paywall is a paywall because the full text is not available to an anonymous
fetch; the Fetch Worker will get only the teaser.

- The honest solution is not to bypass the paywall, but to recognize it and fall
  back to whatever is legitimately available: the preview paragraphs, the
  metered free content, or the article's headline and summary.
- The extractor scores the result and, if the text is below a completeness
  threshold, stores the fragment and records that the save is partial, letting
  the user decide whether to keep it or read on the publisher site.

Dynamic pages render their content with JavaScript, so a plain HTML fetch
returns an empty shell. The system therefore uses a headless browser renderer as
a fallback path.

- When static extraction yields too little content, the fetcher runs the page in
  a headless browser, waits for the main rendering cycle, and captures the
  resulting DOM before extraction.
- This is expensive, roughly an order of magnitude costlier than a raw fetch, so
  it is gated by a threshold and rate-limited per domain, and the results are
  cached aggressively.
- A repository of known-dynamic domains is used to route those pages straight to
  the renderer.

Detection and policy combine.

- The extractor applies heuristics to identify paywall markup and login walls,
  and it avoids running the renderer on pages that are clearly empty or blocked,
  to save cost.
- There is a principled line between rendering a page the way a browser would
  and circumventing access controls; the system stays on the legitimate side,
  and publishers that object can use the opt-out mechanism.
- Operationally, the design keeps a graceful degradation ladder: raw fetch
  first, renderer second, fragment last, so every save request eventually
  resolves to a useful result instead of a dead end.

### How do you recommend articles and tag content?

Recommendation turns a passive archive into a useful library. The ranking
service starts with explicit signals: the user's tags, the domains they save
from, and the articles they actually open versus just store.

- It then adds collaborative signals from the aggregate read-later population,
  so an article that many similar users saved and finished gets boosted.
- The output is a "you may like" feed surfaced at save time and in the app,
  blending freshness with relevance so users do not see the same old items
  repeatedly.

Tagging is the structured layer. Auto-tagging runs when an article is saved: the
Tagging service applies a model over the extracted text and metadata to assign
category labels such as technology, health, or finance, alongside extracted
topics and named entities.

- These tags drive filtering and clustering, so a user can ask for everything on
  machine learning and get a coherent set even though each article was saved
  months apart.
- Tags are also the scaffolding for collections, letting users bundle articles
  into themed groups without managing links manually.

The feedback loop is explicit.

- Every open, read, archive, and delete is logged as an event, and the
  recommender is retrained periodically on that event stream.
- For a new user with no history, cold start is solved with popularity and
  editor-curated lists; the system rapidly personalizes as the first saves and
  opens arrive.
- Privacy shapes the design: recommendation features are derived per user,
  aggregated statistics are anonymized, and a user can disable personalization
  entirely.
- The metric is not click-through alone, but whether saved articles actually get
  read, which is why finish rate carries the most weight.

### How do you sync reading progress across devices?

Reading progress sync lets a user close an article on a laptop and open it on a
phone at the exact same scroll position. The model is per-article and per-user:
a row storing the position as a percentage and a cursor into the text, updated
on a debounced timer as the user reads.

- Updates are fire-and-forget with a version stamp, so rapid scroll events
  coalesce into a few writes rather than a flood.
- When the reader opens an article, it fetches the stored position; when the
  user stops reading, the final position is flushed with a last-guarantee write
  so the state is not lost on app kill.

Concurrent reads on two devices create a simple conflict: which position wins?

- The rule is last-writer-wins per device session, with a logical clock so the
  most recent read wins rather than the most recently synced.
- Because the state is small and rarely contended, there is no need for a merge;
  the system just records the newest update.
- Sync is a push-pull: the app pushes its local position after each read
  session, and it pulls positions for the currently open article whenever
  connectivity returns.
- A short-lived position cache serves the open article instantly, and the
  authoritative row in the database is the durable record.

Progress integrates with the rest of the reading model.

- A finished article flips to archived, which changes its presentation and
  removes it from the queue; an article saved again after editing counts as a
  fresh read.
- Progress also feeds recommendation signals and a reading streak feature, so
  the data has product value beyond continuity.
- The design keeps the read state in the same user-scoped store as the rest of
  the library, so the sync engine moves progress along with article metadata in
  one consistent batch rather than as a fragile secondary system.

## Source

```text
title: Read It Later
node user: Reader [round, icon=browser]
node app: Reader App [icon=browser]
node gateway: API Gateway [icon=server]
node save: Save Service [icon=compute]
node fetch: Fetch Worker [icon=worker]
node extract: Content Extractor [icon=compute]
node queue: Fetch Queue [icon=queue]
node tag: Tagging [icon=search]
node progress: Reading Progress [icon=sync]
node cache: Article Cache [cylinder, icon=cache]
node db: Articles DB [cylinder, icon=database]

edge user -> app: save url
edge app -> gateway: request
edge gateway -> save: queue
edge save -> queue: enqueue
edge queue -> fetch: crawl
edge fetch -> extract: parse
edge extract -> db: store
edge extract -> cache: cache
edge user -> app: read
edge app -> progress: track
edge db -> tag: classify
edge tag -> app: filter
```

## Q&A

### Q: Design a read-it-later service

**A:** A read-it-later service like Pocket solves a simple pain: you find an article
you cannot read now, save it, and it appears later as a clean, readable version
on any device. The system has two halves.

- The save half takes a URL, fetches the underlying page, extracts the article
  text and images, and stores a normalized copy.
- The read half serves that copy to the user, tracks reading progress, and
  supports search and tagging across the saved library.
- The Save Service handles the entry point, a Fetch Worker does the crawling,
  and the Content Extractor produces the clean document that the Articles DB
  stores.

Save must be asynchronous and reliable. Saving a URL is a cheap request that
returns immediately; the real work, fetching and parsing a page that may be
slow, heavy, or down, happens in the background through a Fetch Queue.

- This queue gives the system control over crawl rate, retries, and backoff, so
  a flood of saves to a single domain does not overwhelm either the site or the
  fetchers.
- Deduplication prevents saving the same article twice: the Save Service checks
  the URL hash and canonical URL before enqueueing, and if the article already
  exists, it just links it to the new user.

Reading is the payoff. The reader renders the extracted article, not the
original page, which is both the product's value and its guarantee: no popups,
no navigation noise, and text that reflows at any size.

- Reading progress is synced per article per user, so a phone and a tablet stay
  in step.
- Search over the saved library and auto-tagging complete the loop, turning a
  stack of saved links into an actually findable archive.
- The separation of the save pipeline from the read path means a slow crawl
  never degrades the snappy reading experience.

### Q: How do you fetch and extract article content reliably?

**A:** Fetching the web is an exercise in handling unreliability. The Fetch Worker
receives a URL from the queue, resolves redirects, negotiates content encoding,
and downloads the HTML with a timeout.

- The interesting part is scale: a domain that changes once a day and a news
  site that changes every minute need different treatment.
- The system keeps a per-domain crawl budget, throttling request rate so
  publishers do not treat it as an attack, and it respects robots directives
  where legally appropriate.
- A failed fetch is retried with exponential backoff, and a URL that fails
  persistently is flagged rather than retried forever.

Extraction turns messy HTML into a clean article. The Content Extractor parses
the document and identifies the main content block using a scoring algorithm
that weights paragraphs, text density, and known layout heuristics, then strips
navigation, footers, and widgets.

- The output is a normalized document with the title, author, publication date,
  and extracted images.
- Because publisher markup changes constantly, extraction rules must degrade
  gracefully: the system maintains readability heuristics that need no site
  specific configuration, plus a per-domain override layer that fixes known
  trouble sites without shipping new code.

Correctness is judged by what the reader sees.

- Each extraction run records a score for confidence, and low-confidence results
  are re-extracted with alternate strategies, such as trying alternate URLs or
  the AMP or RSS version.
- Deduplication of the same article fetched twice uses canonical link tags and
  content hashing.
- The stored copy is the extracted document, so the archive survives the
  original page being edited or removed; a background re-fetch job refreshes
  articles only when the saved document is missing required fields.
- Reliability here means the user almost never sees an empty or broken saved
  article.

### Q: How do you handle paywalls and dynamic pages?

**A:** Paywalls and dynamic pages are the two hard realities of web extraction. A
paywall is a paywall because the full text is not available to an anonymous
fetch; the Fetch Worker will get only the teaser.

- The honest solution is not to bypass the paywall, but to recognize it and fall
  back to whatever is legitimately available: the preview paragraphs, the
  metered free content, or the article's headline and summary.
- The extractor scores the result and, if the text is below a completeness
  threshold, stores the fragment and records that the save is partial, letting
  the user decide whether to keep it or read on the publisher site.

Dynamic pages render their content with JavaScript, so a plain HTML fetch
returns an empty shell. The system therefore uses a headless browser renderer as
a fallback path.

- When static extraction yields too little content, the fetcher runs the page in
  a headless browser, waits for the main rendering cycle, and captures the
  resulting DOM before extraction.
- This is expensive, roughly an order of magnitude costlier than a raw fetch, so
  it is gated by a threshold and rate-limited per domain, and the results are
  cached aggressively.
- A repository of known-dynamic domains is used to route those pages straight to
  the renderer.

Detection and policy combine.

- The extractor applies heuristics to identify paywall markup and login walls,
  and it avoids running the renderer on pages that are clearly empty or blocked,
  to save cost.
- There is a principled line between rendering a page the way a browser would
  and circumventing access controls; the system stays on the legitimate side,
  and publishers that object can use the opt-out mechanism.
- Operationally, the design keeps a graceful degradation ladder: raw fetch
  first, renderer second, fragment last, so every save request eventually
  resolves to a useful result instead of a dead end.

### Q: How do you recommend articles and tag content?

**A:** Recommendation turns a passive archive into a useful library. The ranking
service starts with explicit signals: the user's tags, the domains they save
from, and the articles they actually open versus just store.

- It then adds collaborative signals from the aggregate read-later population,
  so an article that many similar users saved and finished gets boosted.
- The output is a "you may like" feed surfaced at save time and in the app,
  blending freshness with relevance so users do not see the same old items
  repeatedly.

Tagging is the structured layer. Auto-tagging runs when an article is saved: the
Tagging service applies a model over the extracted text and metadata to assign
category labels such as technology, health, or finance, alongside extracted
topics and named entities.

- These tags drive filtering and clustering, so a user can ask for everything on
  machine learning and get a coherent set even though each article was saved
  months apart.
- Tags are also the scaffolding for collections, letting users bundle articles
  into themed groups without managing links manually.

The feedback loop is explicit.

- Every open, read, archive, and delete is logged as an event, and the
  recommender is retrained periodically on that event stream.
- For a new user with no history, cold start is solved with popularity and
  editor-curated lists; the system rapidly personalizes as the first saves and
  opens arrive.
- Privacy shapes the design: recommendation features are derived per user,
  aggregated statistics are anonymized, and a user can disable personalization
  entirely.
- The metric is not click-through alone, but whether saved articles actually get
  read, which is why finish rate carries the most weight.

### Q: How do you sync reading progress across devices?

**A:** Reading progress sync lets a user close an article on a laptop and open it on a
phone at the exact same scroll position. The model is per-article and per-user:
a row storing the position as a percentage and a cursor into the text, updated
on a debounced timer as the user reads.

- Updates are fire-and-forget with a version stamp, so rapid scroll events
  coalesce into a few writes rather than a flood.
- When the reader opens an article, it fetches the stored position; when the
  user stops reading, the final position is flushed with a last-guarantee write
  so the state is not lost on app kill.

Concurrent reads on two devices create a simple conflict: which position wins?

- The rule is last-writer-wins per device session, with a logical clock so the
  most recent read wins rather than the most recently synced.
- Because the state is small and rarely contended, there is no need for a merge;
  the system just records the newest update.
- Sync is a push-pull: the app pushes its local position after each read
  session, and it pulls positions for the currently open article whenever
  connectivity returns.
- A short-lived position cache serves the open article instantly, and the
  authoritative row in the database is the durable record.

Progress integrates with the rest of the reading model.

- A finished article flips to archived, which changes its presentation and
  removes it from the queue; an article saved again after editing counts as a
  fresh read.
- Progress also feeds recommendation signals and a reading streak feature, so
  the data has product value beyond continuity.
- The design keeps the read state in the same user-scoped store as the rest of
  the library, so the sync engine moves progress along with article metadata in
  one consistent batch rather than as a fragile secondary system.

## Source

```text
title: Read It Later
node user: Reader [round, icon=browser]
node app: Reader App [icon=browser]
node gateway: API Gateway [icon=server]
node save: Save Service [icon=compute]
node fetch: Fetch Worker [icon=worker]
node extract: Content Extractor [icon=compute]
node queue: Fetch Queue [icon=queue]
node tag: Tagging [icon=search]
node progress: Reading Progress [icon=sync]
node cache: Article Cache [cylinder, icon=cache]
node db: Articles DB [cylinder, icon=database]

edge user -> app: save url
edge app -> gateway: request
edge gateway -> save: queue
edge save -> queue: enqueue
edge queue -> fetch: crawl
edge fetch -> extract: parse
edge extract -> db: store
edge extract -> cache: cache
edge user -> app: read
edge app -> progress: track
edge db -> tag: classify
edge tag -> app: filter
```
