# Gmail — Email Service

Design an email system

**Difficulty:** Medium

**Tags:** email, messaging, search, security

## Functional Requirements

- an email system
- store mailboxes so reads and searches stay fast?
- deliver mail reliably and handle bounces?
- detect spam and phishing?
- support search across all of a users mail?

## Non-Functional Requirements

- An email system splits into a sending path, a receiving path, and a
  storage/search layer.

- Sending: the user composes in the client, the API gateway accepts the message,
  the send service persists it and enqueues it for the delivery agent, which
  negotiates SMTP with the recipient's MX servers with retries and backoff.
- Receiving: an inbound queue accepts messages via SMTP, runs each through the
  spam filter, routes it to the correct mailbox, and stores the message plus its
  attachments.
- The mailbox DB holds per-user message metadata and bodies; a search index
  provides full-text search; attachment bytes live in a separate attachment
  store referenced by ID.
- Push notifications tell the client when mail arrives.

Reliability dominates the design because mail must never be lost.

- Every stage — inbound queue, outbound queue, indexing — is a durable queue
  with at-least-once delivery and idempotent processing, so a crash replays
  rather than loses a message.
- The sending path tracks delivery state per recipient (delivered, deferred,
  bounced) and the receiving path honors backoff and RFC-compliant responses.
- Users expect near-instant local reads, so the mailbox store is optimized for
  append-heavy writes and fast per-user range reads, while search is eventually
  consistent — a message is visible in the inbox before its full-text entry
  appears.
- The whole system is multi-tenant at the app level: mailboxes are isolated per
  user but stored in shared, horizontally sharded infrastructure to keep
  marginal cost per mailbox tiny..
- The mailbox is modeled as an append-only event log per user: each message
  insert/read/delete/flag is a record in a sharded store keyed by (user_id,
  mailbox_label), with a monotonic sequence or timestamp per message so the inbox
  renders as a range query of the latest N rows.

- Message bodies are stored separately (a message store) from the per-user
  folder rows, so one email sent to many users is stored once and referenced
  many times, avoiding duplication of large blobs.
- Reads are fast because of locality — all of a user's mail sorts under a small
  key range on a small number of shards — and an in-memory cache serves the most
  recent few hundred messages per mailbox, which is what the client's inbox
  shows.
- The store is chosen for write throughput and read-your-writes consistency;
  relational or log-structured stores both work, with heavy reliance on index
  (user, sequence) range scans.

Search is the separate hard path.

- A full-text index (e.g., an inverted index built on Lucene-like technology,
  sharded by user range or hash) indexes subject, body, and attachment text.
- Indexing is asynchronous: a worker consumes the message event log and updates
  the index, so there is a small lag between delivery and searchability.
- Because "all of a user's mail" is the query scope, the index shards by user,
  and a search fan-out touches only the user's shards.
- The trade-off is index freshness vs write load — indexing every message
  immediately is wasteful, so batching is used and monitoring tracks the index
  lag.
- For hot accounts (large mailboxes), the index partitions by time, letting
  searches first prune to likely year ranges and fall back to full scans only
  for wildcard queries..
- Delivery reliability comes from a state machine per recipient.

- The delivery agent looks up the recipient's MX records, connects over SMTP,
  and either succeeds, defers (temporary failure — the server is busy or
  greylisting), or bounces (permanent failure — mailbox doesn't exist, domain is
  dead).
- Deferred mail goes back into a retry queue with exponential backoff and a
  per-message deadline (typically several days); each retry records a delivery
  attempt so operators can see the delay history.
- Permanent failures and retry exhaustion become bounces: the system generates a
  non-delivery report to the sender, updates the sender's analytics (delivery
  rate, bounce rate), and, if the sender is bulk, throttles or quarantines
  addresses that bounce consistently to protect sender reputation.
- The outbound queue is durable, so a restart mid-flight resumes exactly where
  the state machine left off.

Two subtleties matter.

- First, SMTP is not idempotent — a timeout may mean the message was delivered
  or lost — so the delivery agent uses the message ID and RFC 3834-style
  semantics to avoid duplicates where possible, and the sender-side UI shows
  best-effort status rather than a false "sent" claim.
- Second, recipient trust: the sending path must also handle SPF/DKIM/DMARC
  signing, otherwise legitimate mail is flagged as spam; the delivery agent
  attaches signatures before queuing.
- Monitoring tracks queue depth, retry counts, and deferred-to-bounced ratios
  per recipient domain.
- Fail-open behavior at the inbound side (accept mail into a quarantine box
  rather than reject outright when the spam filter is down) means the receiving
  path preserves mail even during degraded filter performance..
- Detection runs on every inbound message before it reaches the mailbox.

- The spam filter scores a message along several independent signals: content
  features (lexical patterns, URL reputation, image OCR), header and envelope
  features (reverse DNS, SPF/DKIM/DMARC alignment, sending IP reputation), and
  behavioral signals (rate of sending, unusual recipient lists, new-domain
  patterns).
- Each signal produces a probability, and an ensemble (gradient-boosted trees or
  logistic regression over the feature vector) combines them into a spam score.
- Messages above a hard threshold are rejected or quarantined; borderline
  messages go to the spam folder with a link for the user to mark as not spam —
  and user feedback is the ground truth that feeds the retraining loop,
  alongside labeled honeypot accounts.

Phishing adds content-level and abuse-level defenses on top.

- URL rewriting that sandboxes link clicks through a reputation check,
  known-malware hash matching on attachments, and brand-impersonation models
  that catch lookalike domains and display-name spoofing.
- Detection must trade false positives against false negatives — an
  over-aggressive filter silently eats legitimate mail, so quarantine rather
  than delete is the default and per-user sensitivity thresholds exist.
- The pipeline is a cascade for cost: cheap, high-precision rules run first and
  let most benign mail through without the expensive model, so only the
  ambiguous tail hits the heavy classifier.
- All scores and decisions are logged for continuous evaluation, and the models
  are periodically re-trained because spam adapts within hours..
- Search is served by a per-user full-text index sharded across index servers.

- Every delivered message produces an index update (subject, body, sender,
  recipients, attachment text after OCR/parsing), and the client's search
  request hits the search service, which fan-outs to the shards holding that
  user's data, merges ranked results (relevance from BM25-style scoring with
  recency and folder weight), and returns message IDs that the mailbox store
  resolves to full messages.
- Queries are expanded server-side — synonyms, typo tolerance, operators like
  `from:`, `to:`, `has:attachment` compile into term and filter clauses — and
  the index stores not just terms but the fields they appear in, so fielded
  search is a filter, not a post-pass.

The hard part is the latency/freshness trade-off.

- Indexing is asynchronous, so search lags the inbox by seconds; a user who
  searches immediately after reading a just-arrived message sees it in the inbox
  list but its full-text entry may still be indexing.
- Mitigations include a small in-memory postings buffer for the most recent
  writes and a search-within-results fallback that also scans recent message
  bodies.
- Because power-law traffic means a few heavy users dominate, index shards are
  hot-shard aware: the busiest mailboxes get dedicated index partitions, and
  merge/compaction policy is tuned per shard to keep query latency bounded.
- Analytics track per-user search latency and index freshness, and when
  freshness is poor, the indexer scales out before user-facing search degrades.

## Source

````text
title: Email Service
node user: User [round, icon=browser]
node client: Email Client [icon=browser]
node api: API Gateway [icon=server]
node send: Send Service [icon=mail]
node inbound: Inbound Queue [icon=queue]
node delivery: Delivery Agent [icon=worker]
node index: Search Index [icon=search]
node spam: Spam Filter [icon=shield]
node mailbox: Mailbox DB [cylinder, icon=database]
node attach: Attachment Store [cylinder, icon=file]
node notify: Push Notifications [icon=message]

edge user -> client: compose
edge client -> api: send
edge api -> send: queue
edge send -> inbound: relay
edge inbound -> spam: filter
edge inbound -> delivery: route
edge delivery -> mailbox: store
edge send -> attach: save
edge mailbox -> index: index
edge api -> notify: alert
edge client -> api: search
edge api -> index: lookup
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Email Service
user: User
client: Email Client
api: API Gateway
send: Send Service
inbound: Inbound Queue
delivery: Delivery Agent
index: Search Index
spam: Spam Filter
mailbox: Mailbox DB
attach: Attachment Store
notify: Push Notifications

user ─► client ─► compose
client ─► api ─► send
api ─► send ─► queue
send ─► inbound ─► relay
inbound ─► spam ─► filter
inbound ─► delivery ─► route
delivery ─► mailbox ─► store
send ─► attach ─► save
mailbox ─► index ─► index
api ─► notify ─► alert
client ─► api ─► search
api ─► index ─► lookup
````

## Design

### Design an email system

An email system splits into a sending path, a receiving path, and a
storage/search layer.

- Sending: the user composes in the client, the API gateway accepts the message,
  the send service persists it and enqueues it for the delivery agent, which
  negotiates SMTP with the recipient's MX servers with retries and backoff.
- Receiving: an inbound queue accepts messages via SMTP, runs each through the
  spam filter, routes it to the correct mailbox, and stores the message plus its
  attachments.
- The mailbox DB holds per-user message metadata and bodies; a search index
  provides full-text search; attachment bytes live in a separate attachment
  store referenced by ID.
- Push notifications tell the client when mail arrives.

Reliability dominates the design because mail must never be lost.

- Every stage — inbound queue, outbound queue, indexing — is a durable queue
  with at-least-once delivery and idempotent processing, so a crash replays
  rather than loses a message.
- The sending path tracks delivery state per recipient (delivered, deferred,
  bounced) and the receiving path honors backoff and RFC-compliant responses.
- Users expect near-instant local reads, so the mailbox store is optimized for
  append-heavy writes and fast per-user range reads, while search is eventually
  consistent — a message is visible in the inbox before its full-text entry
  appears.
- The whole system is multi-tenant at the app level: mailboxes are isolated per
  user but stored in shared, horizontally sharded infrastructure to keep
  marginal cost per mailbox tiny.

### How do you store mailboxes so reads and searches stay fast?

The mailbox is modeled as an append-only event log per user: each message
insert/read/delete/flag is a record in a sharded store keyed by (user_id,
mailbox_label), with a monotonic sequence or timestamp per message so the inbox
renders as a range query of the latest N rows.

- Message bodies are stored separately (a message store) from the per-user
  folder rows, so one email sent to many users is stored once and referenced
  many times, avoiding duplication of large blobs.
- Reads are fast because of locality — all of a user's mail sorts under a small
  key range on a small number of shards — and an in-memory cache serves the most
  recent few hundred messages per mailbox, which is what the client's inbox
  shows.
- The store is chosen for write throughput and read-your-writes consistency;
  relational or log-structured stores both work, with heavy reliance on index
  (user, sequence) range scans.

Search is the separate hard path.

- A full-text index (e.g., an inverted index built on Lucene-like technology,
  sharded by user range or hash) indexes subject, body, and attachment text.
- Indexing is asynchronous: a worker consumes the message event log and updates
  the index, so there is a small lag between delivery and searchability.
- Because "all of a user's mail" is the query scope, the index shards by user,
  and a search fan-out touches only the user's shards.
- The trade-off is index freshness vs write load — indexing every message
  immediately is wasteful, so batching is used and monitoring tracks the index
  lag.
- For hot accounts (large mailboxes), the index partitions by time, letting
  searches first prune to likely year ranges and fall back to full scans only
  for wildcard queries.

### How do you deliver mail reliably and handle bounces?

Delivery reliability comes from a state machine per recipient.

- The delivery agent looks up the recipient's MX records, connects over SMTP,
  and either succeeds, defers (temporary failure — the server is busy or
  greylisting), or bounces (permanent failure — mailbox doesn't exist, domain is
  dead).
- Deferred mail goes back into a retry queue with exponential backoff and a
  per-message deadline (typically several days); each retry records a delivery
  attempt so operators can see the delay history.
- Permanent failures and retry exhaustion become bounces: the system generates a
  non-delivery report to the sender, updates the sender's analytics (delivery
  rate, bounce rate), and, if the sender is bulk, throttles or quarantines
  addresses that bounce consistently to protect sender reputation.
- The outbound queue is durable, so a restart mid-flight resumes exactly where
  the state machine left off.

Two subtleties matter.

- First, SMTP is not idempotent — a timeout may mean the message was delivered
  or lost — so the delivery agent uses the message ID and RFC 3834-style
  semantics to avoid duplicates where possible, and the sender-side UI shows
  best-effort status rather than a false "sent" claim.
- Second, recipient trust: the sending path must also handle SPF/DKIM/DMARC
  signing, otherwise legitimate mail is flagged as spam; the delivery agent
  attaches signatures before queuing.
- Monitoring tracks queue depth, retry counts, and deferred-to-bounced ratios
  per recipient domain.
- Fail-open behavior at the inbound side (accept mail into a quarantine box
  rather than reject outright when the spam filter is down) means the receiving
  path preserves mail even during degraded filter performance.

### How do you detect spam and phishing?

Detection runs on every inbound message before it reaches the mailbox.

- The spam filter scores a message along several independent signals: content
  features (lexical patterns, URL reputation, image OCR), header and envelope
  features (reverse DNS, SPF/DKIM/DMARC alignment, sending IP reputation), and
  behavioral signals (rate of sending, unusual recipient lists, new-domain
  patterns).
- Each signal produces a probability, and an ensemble (gradient-boosted trees or
  logistic regression over the feature vector) combines them into a spam score.
- Messages above a hard threshold are rejected or quarantined; borderline
  messages go to the spam folder with a link for the user to mark as not spam —
  and user feedback is the ground truth that feeds the retraining loop,
  alongside labeled honeypot accounts.

Phishing adds content-level and abuse-level defenses on top.

- URL rewriting that sandboxes link clicks through a reputation check,
  known-malware hash matching on attachments, and brand-impersonation models
  that catch lookalike domains and display-name spoofing.
- Detection must trade false positives against false negatives — an
  over-aggressive filter silently eats legitimate mail, so quarantine rather
  than delete is the default and per-user sensitivity thresholds exist.
- The pipeline is a cascade for cost: cheap, high-precision rules run first and
  let most benign mail through without the expensive model, so only the
  ambiguous tail hits the heavy classifier.
- All scores and decisions are logged for continuous evaluation, and the models
  are periodically re-trained because spam adapts within hours.

### How do you support search across all of a users mail?

Search is served by a per-user full-text index sharded across index servers.

- Every delivered message produces an index update (subject, body, sender,
  recipients, attachment text after OCR/parsing), and the client's search
  request hits the search service, which fan-outs to the shards holding that
  user's data, merges ranked results (relevance from BM25-style scoring with
  recency and folder weight), and returns message IDs that the mailbox store
  resolves to full messages.
- Queries are expanded server-side — synonyms, typo tolerance, operators like
  `from:`, `to:`, `has:attachment` compile into term and filter clauses — and
  the index stores not just terms but the fields they appear in, so fielded
  search is a filter, not a post-pass.

The hard part is the latency/freshness trade-off.

- Indexing is asynchronous, so search lags the inbox by seconds; a user who
  searches immediately after reading a just-arrived message sees it in the inbox
  list but its full-text entry may still be indexing.
- Mitigations include a small in-memory postings buffer for the most recent
  writes and a search-within-results fallback that also scans recent message
  bodies.
- Because power-law traffic means a few heavy users dominate, index shards are
  hot-shard aware: the busiest mailboxes get dedicated index partitions, and
  merge/compaction policy is tuned per shard to keep query latency bounded.
- Analytics track per-user search latency and index freshness, and when
  freshness is poor, the indexer scales out before user-facing search degrades.

## Source

```text
title: Email Service
node user: User [round, icon=browser]
node client: Email Client [icon=browser]
node api: API Gateway [icon=server]
node send: Send Service [icon=mail]
node inbound: Inbound Queue [icon=queue]
node delivery: Delivery Agent [icon=worker]
node index: Search Index [icon=search]
node spam: Spam Filter [icon=shield]
node mailbox: Mailbox DB [cylinder, icon=database]
node attach: Attachment Store [cylinder, icon=file]
node notify: Push Notifications [icon=message]

edge user -> client: compose
edge client -> api: send
edge api -> send: queue
edge send -> inbound: relay
edge inbound -> spam: filter
edge inbound -> delivery: route
edge delivery -> mailbox: store
edge send -> attach: save
edge mailbox -> index: index
edge api -> notify: alert
edge client -> api: search
edge api -> index: lookup
```

## Q&A

### Q: Design an email system

**A:** An email system splits into a sending path, a receiving path, and a
storage/search layer.

- Sending: the user composes in the client, the API gateway accepts the message,
  the send service persists it and enqueues it for the delivery agent, which
  negotiates SMTP with the recipient's MX servers with retries and backoff.
- Receiving: an inbound queue accepts messages via SMTP, runs each through the
  spam filter, routes it to the correct mailbox, and stores the message plus its
  attachments.
- The mailbox DB holds per-user message metadata and bodies; a search index
  provides full-text search; attachment bytes live in a separate attachment
  store referenced by ID.
- Push notifications tell the client when mail arrives.

Reliability dominates the design because mail must never be lost.

- Every stage — inbound queue, outbound queue, indexing — is a durable queue
  with at-least-once delivery and idempotent processing, so a crash replays
  rather than loses a message.
- The sending path tracks delivery state per recipient (delivered, deferred,
  bounced) and the receiving path honors backoff and RFC-compliant responses.
- Users expect near-instant local reads, so the mailbox store is optimized for
  append-heavy writes and fast per-user range reads, while search is eventually
  consistent — a message is visible in the inbox before its full-text entry
  appears.
- The whole system is multi-tenant at the app level: mailboxes are isolated per
  user but stored in shared, horizontally sharded infrastructure to keep
  marginal cost per mailbox tiny.

### Q: How do you store mailboxes so reads and searches stay fast?

**A:** The mailbox is modeled as an append-only event log per user: each message
insert/read/delete/flag is a record in a sharded store keyed by (user_id,
mailbox_label), with a monotonic sequence or timestamp per message so the inbox
renders as a range query of the latest N rows.

- Message bodies are stored separately (a message store) from the per-user
  folder rows, so one email sent to many users is stored once and referenced
  many times, avoiding duplication of large blobs.
- Reads are fast because of locality — all of a user's mail sorts under a small
  key range on a small number of shards — and an in-memory cache serves the most
  recent few hundred messages per mailbox, which is what the client's inbox
  shows.
- The store is chosen for write throughput and read-your-writes consistency;
  relational or log-structured stores both work, with heavy reliance on index
  (user, sequence) range scans.

Search is the separate hard path.

- A full-text index (e.g., an inverted index built on Lucene-like technology,
  sharded by user range or hash) indexes subject, body, and attachment text.
- Indexing is asynchronous: a worker consumes the message event log and updates
  the index, so there is a small lag between delivery and searchability.
- Because "all of a user's mail" is the query scope, the index shards by user,
  and a search fan-out touches only the user's shards.
- The trade-off is index freshness vs write load — indexing every message
  immediately is wasteful, so batching is used and monitoring tracks the index
  lag.
- For hot accounts (large mailboxes), the index partitions by time, letting
  searches first prune to likely year ranges and fall back to full scans only
  for wildcard queries.

### Q: How do you deliver mail reliably and handle bounces?

**A:** Delivery reliability comes from a state machine per recipient.

- The delivery agent looks up the recipient's MX records, connects over SMTP,
  and either succeeds, defers (temporary failure — the server is busy or
  greylisting), or bounces (permanent failure — mailbox doesn't exist, domain is
  dead).
- Deferred mail goes back into a retry queue with exponential backoff and a
  per-message deadline (typically several days); each retry records a delivery
  attempt so operators can see the delay history.
- Permanent failures and retry exhaustion become bounces: the system generates a
  non-delivery report to the sender, updates the sender's analytics (delivery
  rate, bounce rate), and, if the sender is bulk, throttles or quarantines
  addresses that bounce consistently to protect sender reputation.
- The outbound queue is durable, so a restart mid-flight resumes exactly where
  the state machine left off.

Two subtleties matter.

- First, SMTP is not idempotent — a timeout may mean the message was delivered
  or lost — so the delivery agent uses the message ID and RFC 3834-style
  semantics to avoid duplicates where possible, and the sender-side UI shows
  best-effort status rather than a false "sent" claim.
- Second, recipient trust: the sending path must also handle SPF/DKIM/DMARC
  signing, otherwise legitimate mail is flagged as spam; the delivery agent
  attaches signatures before queuing.
- Monitoring tracks queue depth, retry counts, and deferred-to-bounced ratios
  per recipient domain.
- Fail-open behavior at the inbound side (accept mail into a quarantine box
  rather than reject outright when the spam filter is down) means the receiving
  path preserves mail even during degraded filter performance.

### Q: How do you detect spam and phishing?

**A:** Detection runs on every inbound message before it reaches the mailbox.

- The spam filter scores a message along several independent signals: content
  features (lexical patterns, URL reputation, image OCR), header and envelope
  features (reverse DNS, SPF/DKIM/DMARC alignment, sending IP reputation), and
  behavioral signals (rate of sending, unusual recipient lists, new-domain
  patterns).
- Each signal produces a probability, and an ensemble (gradient-boosted trees or
  logistic regression over the feature vector) combines them into a spam score.
- Messages above a hard threshold are rejected or quarantined; borderline
  messages go to the spam folder with a link for the user to mark as not spam —
  and user feedback is the ground truth that feeds the retraining loop,
  alongside labeled honeypot accounts.

Phishing adds content-level and abuse-level defenses on top.

- URL rewriting that sandboxes link clicks through a reputation check,
  known-malware hash matching on attachments, and brand-impersonation models
  that catch lookalike domains and display-name spoofing.
- Detection must trade false positives against false negatives — an
  over-aggressive filter silently eats legitimate mail, so quarantine rather
  than delete is the default and per-user sensitivity thresholds exist.
- The pipeline is a cascade for cost: cheap, high-precision rules run first and
  let most benign mail through without the expensive model, so only the
  ambiguous tail hits the heavy classifier.
- All scores and decisions are logged for continuous evaluation, and the models
  are periodically re-trained because spam adapts within hours.

### Q: How do you support search across all of a users mail?

**A:** Search is served by a per-user full-text index sharded across index servers.

- Every delivered message produces an index update (subject, body, sender,
  recipients, attachment text after OCR/parsing), and the client's search
  request hits the search service, which fan-outs to the shards holding that
  user's data, merges ranked results (relevance from BM25-style scoring with
  recency and folder weight), and returns message IDs that the mailbox store
  resolves to full messages.
- Queries are expanded server-side — synonyms, typo tolerance, operators like
  `from:`, `to:`, `has:attachment` compile into term and filter clauses — and
  the index stores not just terms but the fields they appear in, so fielded
  search is a filter, not a post-pass.

The hard part is the latency/freshness trade-off.

- Indexing is asynchronous, so search lags the inbox by seconds; a user who
  searches immediately after reading a just-arrived message sees it in the inbox
  list but its full-text entry may still be indexing.
- Mitigations include a small in-memory postings buffer for the most recent
  writes and a search-within-results fallback that also scans recent message
  bodies.
- Because power-law traffic means a few heavy users dominate, index shards are
  hot-shard aware: the busiest mailboxes get dedicated index partitions, and
  merge/compaction policy is tuned per shard to keep query latency bounded.
- Analytics track per-user search latency and index freshness, and when
  freshness is poor, the indexer scales out before user-facing search degrades.

## Source

```text
title: Email Service
node user: User [round, icon=browser]
node client: Email Client [icon=browser]
node api: API Gateway [icon=server]
node send: Send Service [icon=mail]
node inbound: Inbound Queue [icon=queue]
node delivery: Delivery Agent [icon=worker]
node index: Search Index [icon=search]
node spam: Spam Filter [icon=shield]
node mailbox: Mailbox DB [cylinder, icon=database]
node attach: Attachment Store [cylinder, icon=file]
node notify: Push Notifications [icon=message]

edge user -> client: compose
edge client -> api: send
edge api -> send: queue
edge send -> inbound: relay
edge inbound -> spam: filter
edge inbound -> delivery: route
edge delivery -> mailbox: store
edge send -> attach: save
edge mailbox -> index: index
edge api -> notify: alert
edge client -> api: search
edge api -> index: lookup
```
