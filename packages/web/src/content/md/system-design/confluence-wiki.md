# Confluence — Wiki

Design a wiki / knowledge base

**Difficulty:** Hard

**Tags:** auth, notification, search

## Functional Requirements

- a wiki / knowledge base
- model page revisions and history?
- implement permissions across spaces?
- index pages for search?
- handle concurrent edits?

## Non-Functional Requirements

- Permissioning in a wiki is a hierarchy with space at the center.

- Every page belongs to a space, so access is primarily determined by the
  space's ACL: who can view, comment on, or edit the pages inside it.
- Individual pages and even individual page versions can override the space
  defaults with restrictions.
- Those are exceptions recorded as extra entries on the page record.
- The Permissions service resolves any request by first finding the space ACL.
- It then overlays page restrictions.
- Finally it applies group membership, because users are typically granted
  access through groups rather than individually.

Evaluation order and caching decide the cost.

- Resolving a single access check must be fast, because a page render triggers
  several checks: view, edit, and comment permissions are checked independently.
- The service caches resolved permissions per user and per space, with the cache
  keyed by ACL version.
- Any change to a space's permissions bumps the version and invalidates the
  cached grants.
- For the common case of a user reading pages inside their own space, the check
  is a single cached lookup.
- Denials are also cached, with a shorter TTL.
- An unauthorized user cannot hammer the database probing pages.

The subtle problems are inheritance and anonymous access.

- Public spaces are a product feature, so the permission model must represent
  the special "anonymous" and "logged-in" principals alongside real users and
  groups.
- Inheritance becomes tricky with nested page trees: a restriction on a parent
  page must propagate to its children, but an explicit grant on a child can
  override it.
- The resolution algorithm walks from the most specific entry upward.
- The cache stores the outcome per page subtree.
- Every permission change is logged to an audit trail, both for security and
  because wikis frequently become part of a compliance regime where who could
  see what at a given date matters..
- Search turns a wiki from a document store into a knowledge base.

- Every page is indexed with its title, body text, labels, author, space, and
  last modified time.
- Queries combine free-text relevance with structured filters like space and
  label.
- Indexing runs off the change-event stream: when a page is created or edited,
  an event lands on a queue and the indexer updates that document.
- This decouples the write path from indexing cost.
- An indexing backlog is a health signal rather than a user-facing failure.

Relevance needs wiki-specific weighting.

- Page titles and labels carry more weight than body text.
- Recently edited pages rank higher than stale ones.
- Pages in spaces the user belongs to are preferred.
- The index stores document fields and boosts them at query time.
- A search for a term that appears in a title can return the right page even
  when hundreds of pages mention it in the body.
- Permissions shape the index as well: each document records the visibility
  scope derived from its space.
- The query filters documents by the requester's access set, reusing the cached
  permission resolution from the ACL service.

Freshness and consistency are the practical concerns.

- A user who just saved a page expects it to appear in search immediately.
- The index is designed for sub-second propagation while tolerating brief
  staleness during failures.
- Retries with a cursor keep the indexer eventually consistent with the source
  of truth.
- Periodically, a reconciliation job compares the index against the database to
  repair documents that drifted.
- Large attachments are not indexed into the text index.
- They are handled by a separate attachment pipeline that extracts text only for
  supported file types.
- This keeps the main index lean and fast..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Wiki
author: Author
app: Wiki App
gateway: API Gateway
page: Page Service
space: Space Service
revision: Revision Engine
acl: Permissions
search: Search Index
cache: Page Cache
notify: Notifications
db: Pages DB

author ─► app ─► edit page
app ─► gateway ─► save
gateway ─► page ─► validate
page ─► revision ─► snapshot
page ─► space ─► organize
page ─► acl ─► check
acl ─► page ─► allow
page ─► search ─► index
page ─► cache ─► invalidate
page ─► notify ─► watchers
page ─► db ─► store
```

## Design

### Design a wiki / knowledge base

A wiki is a shared document store organized into spaces, where anyone with
permission can create and edit pages and every change is recorded.

- The core concepts are simple: a Page Service owns the content of pages.
- A Space Service organizes pages into sections.
- A Revision Engine snapshots every edit.
- A Permissions service guards access.
- A Search Index makes the corpus discoverable.
- Everything sits behind an API gateway that authenticates the author and
  authorizes the request before it touches a page.
- This authorization-first design is central, because the value of a wiki
  depends on trust that internal pages stay internal.

The write path is where a wiki differs from a plain document store.

- When an author saves a page, the Page Service validates the input, checks
  permissions, writes the new content, and hands the previous version to the
  Revision Engine, which snapshots it.
- Search indexing, cache invalidation, and watcher notifications all subscribe
  to the change event rather than blocking the save.
- Pages DB is a relational store partitioned by space, so most operations are
  scoped to a single partition.
- Page content is stored separately from metadata because documents can be large
  and are fetched infrequently compared with page titles and trees.

The read path serves two very different audiences.

- Browsing walks the page tree, which favors a cached hierarchy.
- Searching jumps straight to relevant documents, which favors an inverted
  index.
- The Page Cache holds hot pages and tree fragments so repeat views never hit
  the database.
- Notifications complete the loop: watchers subscribe to pages or whole spaces.
- Any edit fans out an email or in-app alert.
- The architecture keeps these concerns decoupled.
- A spike in search traffic never slows down saving an edit.
- A heavy edit burst never starves the search indexer.

### How do you model page revisions and history?

Revisions are the identity of a wiki page over time.

- Each page has a permanent ID.
- Each save creates a new revision with a sequence number, the author, a
  timestamp, and a change summary.
- The current content lives in a read-optimized row, while the full history is
  an append-only revision log.
- Storing every full copy would balloon storage, so mature designs use delta
  compression: the current version is stored whole, older versions are
  reconstructed from deltas.
- Periodic full snapshots bound reconstruction cost.
- A view history endpoint returns the list.
- A compare endpoint computes a three-way diff between any two revisions.

The revision model must also capture intent.

- Confluence supports concurrent editing, so a page can have a chain of
  revisions and a concurrent branch that gets merged.
- Each revision records its parent revision IDs, which lets the system build a
  DAG rather than a linear list when conflicts occur.
- Metadata such as page title and labels is revisioned alongside content,
  because renaming a page or retagging it is also a meaningful change.
- The revision engine therefore snapshots the whole page state, not just the
  body text.

History queries need to be fast even on huge wikis.

- Comparing two revisions is reduced to comparing their stored states or
  replaying a bounded delta chain.
- The per-page index on the revision log means listing history for a single page
  is a point lookup.
- Cleanup is a deliberate policy: space administrators can squash old revisions
  to reclaim space, with an audit record of the squash.
- Versioning also powers restore, where the page is set to an old revision.
- The restore itself becomes a new revision so the rollback is visible in
  history rather than silently destroying later edits.

### How do you implement permissions across spaces?

Permissioning in a wiki is a hierarchy with space at the center.

- Every page belongs to a space, so access is primarily determined by the
  space's ACL: who can view, comment on, or edit the pages inside it.
- Individual pages and even individual page versions can override the space
  defaults with restrictions.
- Those are exceptions recorded as extra entries on the page record.
- The Permissions service resolves any request by first finding the space ACL.
- It then overlays page restrictions.
- Finally it applies group membership, because users are typically granted
  access through groups rather than individually.

Evaluation order and caching decide the cost.

- Resolving a single access check must be fast, because a page render triggers
  several checks: view, edit, and comment permissions are checked independently.
- The service caches resolved permissions per user and per space, with the cache
  keyed by ACL version.
- Any change to a space's permissions bumps the version and invalidates the
  cached grants.
- For the common case of a user reading pages inside their own space, the check
  is a single cached lookup.
- Denials are also cached, with a shorter TTL.
- An unauthorized user cannot hammer the database probing pages.

The subtle problems are inheritance and anonymous access.

- Public spaces are a product feature, so the permission model must represent
  the special "anonymous" and "logged-in" principals alongside real users and
  groups.
- Inheritance becomes tricky with nested page trees: a restriction on a parent
  page must propagate to its children, but an explicit grant on a child can
  override it.
- The resolution algorithm walks from the most specific entry upward.
- The cache stores the outcome per page subtree.
- Every permission change is logged to an audit trail, both for security and
  because wikis frequently become part of a compliance regime where who could
  see what at a given date matters.

### How do you index pages for search?

Search turns a wiki from a document store into a knowledge base.

- Every page is indexed with its title, body text, labels, author, space, and
  last modified time.
- Queries combine free-text relevance with structured filters like space and
  label.
- Indexing runs off the change-event stream: when a page is created or edited,
  an event lands on a queue and the indexer updates that document.
- This decouples the write path from indexing cost.
- An indexing backlog is a health signal rather than a user-facing failure.

Relevance needs wiki-specific weighting.

- Page titles and labels carry more weight than body text.
- Recently edited pages rank higher than stale ones.
- Pages in spaces the user belongs to are preferred.
- The index stores document fields and boosts them at query time.
- A search for a term that appears in a title can return the right page even
  when hundreds of pages mention it in the body.
- Permissions shape the index as well: each document records the visibility
  scope derived from its space.
- The query filters documents by the requester's access set, reusing the cached
  permission resolution from the ACL service.

Freshness and consistency are the practical concerns.

- A user who just saved a page expects it to appear in search immediately.
- The index is designed for sub-second propagation while tolerating brief
  staleness during failures.
- Retries with a cursor keep the indexer eventually consistent with the source
  of truth.
- Periodically, a reconciliation job compares the index against the database to
  repair documents that drifted.
- Large attachments are not indexed into the text index.
- They are handled by a separate attachment pipeline that extracts text only for
  supported file types.
- This keeps the main index lean and fast.

### How do you handle concurrent edits?

Concurrent editing is the case that separates a wiki from a static document
host.

- Two authors can open the same page at once, both edit, and both save.
- The system prevents lost updates with a version check: the save request
  carries the revision it was based on, and if the stored revision is newer, the
  save is rejected with a conflict.
- The server keeps the page content as the authoritative version and gives the
  later editor a chance to merge.
- Simply overwriting would silently destroy work, so conflict detection is the
  non-negotiable baseline.

Three policies handle conflicts.

- First, last-write-wins is acceptable only for page metadata where both edits
  are equivalent, and even then it is applied with an explicit revision bump.
- Second, an automated merge succeeds when the edits touch disjoint sections.
- The system uses a diff against the common ancestor to detect overlap.
- Third, when edits overlap, the platform presents a merge screen showing the
  two versions side by side.
- It lets the author choose, and records the result as a new revision with both
  authors credited.
- The result is that concurrent edits rarely block a user, and every resolution
  is visible in history.

Soft conflicts add another layer.

- One author editing the body while another edits the title should also produce
  a merge rather than a clobber.
- The revision engine snapshots title and body independently and merges per
  field.
- This is the reason the page model separates content into distinct fields.
- Autosave further complicates things: periodic draft snapshots can arrive out
  of order.
- Each draft carries the base revision and is ignored if it is older than what
  the server already has.
- Taken together, the design accepts that conflicts are unavoidable and instead
  minimizes their blast radius.
- It keeps the single source of truth on the server at all times.

## Source

```text
title: Wiki
node author: Author [round, icon=browser]
node app: Wiki App [icon=browser]
node gateway: API Gateway [icon=server]
node page: Page Service [icon=compute]
node space: Space Service [icon=compute]
node revision: Revision Engine [icon=compute]
node acl: Permissions [icon=shield]
node search: Search Index [icon=search]
node cache: Page Cache [cylinder, icon=cache]
node notify: Notifications [icon=message]
node db: Pages DB [cylinder, icon=database]

edge author -> app: edit page
edge app -> gateway: save
edge gateway -> page: validate
edge page -> revision: snapshot
edge page -> space: organize
edge page -> acl: check
edge acl -> page: allow
edge page -> search: index
edge page -> cache: invalidate
edge page -> notify: watchers
edge page -> db: store
```

## Q&A

### Q: Design a wiki / knowledge base

**A:** A wiki is a shared document store organized into spaces, where anyone with
permission can create and edit pages and every change is recorded.

- The core concepts are simple: a Page Service owns the content of pages.
- A Space Service organizes pages into sections.
- A Revision Engine snapshots every edit.
- A Permissions service guards access.
- A Search Index makes the corpus discoverable.
- Everything sits behind an API gateway that authenticates the author and
  authorizes the request before it touches a page.
- This authorization-first design is central, because the value of a wiki
  depends on trust that internal pages stay internal.

The write path is where a wiki differs from a plain document store.

- When an author saves a page, the Page Service validates the input, checks
  permissions, writes the new content, and hands the previous version to the
  Revision Engine, which snapshots it.
- Search indexing, cache invalidation, and watcher notifications all subscribe
  to the change event rather than blocking the save.
- Pages DB is a relational store partitioned by space, so most operations are
  scoped to a single partition.
- Page content is stored separately from metadata because documents can be large
  and are fetched infrequently compared with page titles and trees.

The read path serves two very different audiences.

- Browsing walks the page tree, which favors a cached hierarchy.
- Searching jumps straight to relevant documents, which favors an inverted
  index.
- The Page Cache holds hot pages and tree fragments so repeat views never hit
  the database.
- Notifications complete the loop: watchers subscribe to pages or whole spaces.
- Any edit fans out an email or in-app alert.
- The architecture keeps these concerns decoupled.
- A spike in search traffic never slows down saving an edit.
- A heavy edit burst never starves the search indexer.

### Q: How do you model page revisions and history?

**A:** Revisions are the identity of a wiki page over time.

- Each page has a permanent ID.
- Each save creates a new revision with a sequence number, the author, a
  timestamp, and a change summary.
- The current content lives in a read-optimized row, while the full history is
  an append-only revision log.
- Storing every full copy would balloon storage, so mature designs use delta
  compression: the current version is stored whole, older versions are
  reconstructed from deltas.
- Periodic full snapshots bound reconstruction cost.
- A view history endpoint returns the list.
- A compare endpoint computes a three-way diff between any two revisions.

The revision model must also capture intent.

- Confluence supports concurrent editing, so a page can have a chain of
  revisions and a concurrent branch that gets merged.
- Each revision records its parent revision IDs, which lets the system build a
  DAG rather than a linear list when conflicts occur.
- Metadata such as page title and labels is revisioned alongside content,
  because renaming a page or retagging it is also a meaningful change.
- The revision engine therefore snapshots the whole page state, not just the
  body text.

History queries need to be fast even on huge wikis.

- Comparing two revisions is reduced to comparing their stored states or
  replaying a bounded delta chain.
- The per-page index on the revision log means listing history for a single page
  is a point lookup.
- Cleanup is a deliberate policy: space administrators can squash old revisions
  to reclaim space, with an audit record of the squash.
- Versioning also powers restore, where the page is set to an old revision.
- The restore itself becomes a new revision so the rollback is visible in
  history rather than silently destroying later edits.

### Q: How do you implement permissions across spaces?

**A:** Permissioning in a wiki is a hierarchy with space at the center.

- Every page belongs to a space, so access is primarily determined by the
  space's ACL: who can view, comment on, or edit the pages inside it.
- Individual pages and even individual page versions can override the space
  defaults with restrictions.
- Those are exceptions recorded as extra entries on the page record.
- The Permissions service resolves any request by first finding the space ACL.
- It then overlays page restrictions.
- Finally it applies group membership, because users are typically granted
  access through groups rather than individually.

Evaluation order and caching decide the cost.

- Resolving a single access check must be fast, because a page render triggers
  several checks: view, edit, and comment permissions are checked independently.
- The service caches resolved permissions per user and per space, with the cache
  keyed by ACL version.
- Any change to a space's permissions bumps the version and invalidates the
  cached grants.
- For the common case of a user reading pages inside their own space, the check
  is a single cached lookup.
- Denials are also cached, with a shorter TTL.
- An unauthorized user cannot hammer the database probing pages.

The subtle problems are inheritance and anonymous access.

- Public spaces are a product feature, so the permission model must represent
  the special "anonymous" and "logged-in" principals alongside real users and
  groups.
- Inheritance becomes tricky with nested page trees: a restriction on a parent
  page must propagate to its children, but an explicit grant on a child can
  override it.
- The resolution algorithm walks from the most specific entry upward.
- The cache stores the outcome per page subtree.
- Every permission change is logged to an audit trail, both for security and
  because wikis frequently become part of a compliance regime where who could
  see what at a given date matters.

### Q: How do you index pages for search?

**A:** Search turns a wiki from a document store into a knowledge base.

- Every page is indexed with its title, body text, labels, author, space, and
  last modified time.
- Queries combine free-text relevance with structured filters like space and
  label.
- Indexing runs off the change-event stream: when a page is created or edited,
  an event lands on a queue and the indexer updates that document.
- This decouples the write path from indexing cost.
- An indexing backlog is a health signal rather than a user-facing failure.

Relevance needs wiki-specific weighting.

- Page titles and labels carry more weight than body text.
- Recently edited pages rank higher than stale ones.
- Pages in spaces the user belongs to are preferred.
- The index stores document fields and boosts them at query time.
- A search for a term that appears in a title can return the right page even
  when hundreds of pages mention it in the body.
- Permissions shape the index as well: each document records the visibility
  scope derived from its space.
- The query filters documents by the requester's access set, reusing the cached
  permission resolution from the ACL service.

Freshness and consistency are the practical concerns.

- A user who just saved a page expects it to appear in search immediately.
- The index is designed for sub-second propagation while tolerating brief
  staleness during failures.
- Retries with a cursor keep the indexer eventually consistent with the source
  of truth.
- Periodically, a reconciliation job compares the index against the database to
  repair documents that drifted.
- Large attachments are not indexed into the text index.
- They are handled by a separate attachment pipeline that extracts text only for
  supported file types.
- This keeps the main index lean and fast.

### Q: How do you handle concurrent edits?

**A:** Concurrent editing is the case that separates a wiki from a static document
host.

- Two authors can open the same page at once, both edit, and both save.
- The system prevents lost updates with a version check: the save request
  carries the revision it was based on, and if the stored revision is newer, the
  save is rejected with a conflict.
- The server keeps the page content as the authoritative version and gives the
  later editor a chance to merge.
- Simply overwriting would silently destroy work, so conflict detection is the
  non-negotiable baseline.

Three policies handle conflicts.

- First, last-write-wins is acceptable only for page metadata where both edits
  are equivalent, and even then it is applied with an explicit revision bump.
- Second, an automated merge succeeds when the edits touch disjoint sections.
- The system uses a diff against the common ancestor to detect overlap.
- Third, when edits overlap, the platform presents a merge screen showing the
  two versions side by side.
- It lets the author choose, and records the result as a new revision with both
  authors credited.
- The result is that concurrent edits rarely block a user, and every resolution
  is visible in history.

Soft conflicts add another layer.

- One author editing the body while another edits the title should also produce
  a merge rather than a clobber.
- The revision engine snapshots title and body independently and merges per
  field.
- This is the reason the page model separates content into distinct fields.
- Autosave further complicates things: periodic draft snapshots can arrive out
  of order.
- Each draft carries the base revision and is ignored if it is older than what
  the server already has.
- Taken together, the design accepts that conflicts are unavoidable and instead
  minimizes their blast radius.
- It keeps the single source of truth on the server at all times.

## Source

```text
title: Wiki
node author: Author [round, icon=browser]
node app: Wiki App [icon=browser]
node gateway: API Gateway [icon=server]
node page: Page Service [icon=compute]
node space: Space Service [icon=compute]
node revision: Revision Engine [icon=compute]
node acl: Permissions [icon=shield]
node search: Search Index [icon=search]
node cache: Page Cache [cylinder, icon=cache]
node notify: Notifications [icon=message]
node db: Pages DB [cylinder, icon=database]

edge author -> app: edit page
edge app -> gateway: save
edge gateway -> page: validate
edge page -> revision: snapshot
edge page -> space: organize
edge page -> acl: check
edge acl -> page: allow
edge page -> search: index
edge page -> cache: invalidate
edge page -> notify: watchers
edge page -> db: store
```
