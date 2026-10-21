# IAM Service

Design an identity and access management system

**Difficulty:** Medium

**Tags:** auth, security

## Functional Requirements

- an identity and access management system
- model roles and permissions?
- evaluate policies efficiently?
- support SSO and federation?
- keep an audit trail?

## Non-Functional Requirements

- An IAM system answers two questions for every request: who is the caller, and
  what is the caller allowed to do.

- Authentication verifies identity, usually against an internal store or a
  federated identity provider, and produces a token.
- Authorization then evaluates the caller against policies before the
  application acts.
- Because IAM sits in front of every request, the design must prioritize low
  latency, high availability, and a rigorous audit trail.
- The authorization model must be expressive enough to express fine-grained
  rules without exploding into unmanageable complexity.

The reference flow in the diagram starts when the user accesses an application
through the API gateway.

- The gateway sends the request to authentication, which verifies the credential
  and may federate to an external identity provider.
- Once the principal is established, the gateway invokes the authorization
  service, which evaluates applicable policies.
- Policy evaluation resolves roles through the role service and fetches data
  from the policies database.
- The decision is cached, and every check is recorded by the audit service
  before the allow or deny result is returned to the application.

Two architectural choices shape the whole system.

- Authorization must be decoupled from application code so that policy changes
  do not require redeploys, and so that a single place enforces rules
  consistently.
- The system must degrade safely: when the policy database or identity provider
  is unavailable, the gateway needs a defined behavior.
- That behavior typically fails closed for sensitive operations while relying on
  cached decisions and short token lifetimes to keep legitimate traffic flowing..
- Permissions are atomic rights such as "read repo" or "delete user".

- Roles are named collections of permissions that humans reason about, like
  "developer" or "admin".
- Users get access by being assigned roles, either directly or through groups.
- This role-based access control model keeps assignment simple, but it needs
  hierarchy and scoping to scale.
- Roles can inherit from other roles, and grants are scoped to a resource or
  tenancy so that an "admin" role only applies within a specific project or
  organization.

Groups add another layer between users and roles.

- Users join groups, groups map to roles, and roles map to permissions, so
  membership changes propagate without touching individual grants.
- The mapping tables are the core of the data model: user-group, group-role, and
  role-permission associations, plus role assignment directly to users for
  exceptions.
- Everything is versioned so that policy history can be reconstructed for audit
  and rollback purposes.
- Versioned snapshots of a role or policy also let the system answer historical
  questions, such as what a user was allowed to do on a specific date, without
  reconstructing state from change logs.

Policies generalize roles by expressing rules in terms of conditions rather than
just static permissions.

- Conditions look like "allow read only during business hours" or "allow delete
  if the caller holds a second approval".
- The role service resolves the effective permission set by walking inheritance
  and applying conditions.
- The tension is expressiveness versus simplicity: pure roles are easy to reason
  about but inflexible.
- Full policy languages can become undebuggable at scale, so a good design
  offers a small, predictable policy language with roles as the primary
  abstraction..
- Policy evaluation runs on the hot path of every request, so it must be fast and
  cheap.

- The classic approach is to precompute effective permissions when assignments
  change and store the flattened result.
- A request check then becomes a simple set membership lookup rather than a
  graph traversal.
- When policies include dynamic conditions, the service evaluates those
  conditions against request attributes.
- It short-circuits on the first decisive rule and denies by default, which
  keeps the common case to a single cache hit.

Caching is the dominant lever.

- A decision cache keyed by principal, action, and resource stores the last
  result with a short TTL.
- Invalidation signals bump the affected keys whenever roles or policies change.
- Because authorization data changes slowly relative to request volume, a warm
  cache absorbs nearly all traffic, with the policies database only touched on
  misses.
- Multi-region deployments replicate the cache to avoid cross-region round trips
  for every check.

Scale forces partitioning and limits.

- The policy engine must cap recursion depth and rule count per evaluation so a
  malformed policy cannot consume unbounded CPU.
- Evaluation is performed in an isolated execution context that can be
  terminated if it exceeds its budget.
- Denials should be cached too, but with shorter TTLs so a corrected policy
  propagates quickly.
- Every decision is returned with the version of the policy set that produced
  it, letting operators correlate behavior changes with policy deploys.
- The service should also expose the decision reason and the rules consulted, so
  an engineer who is unexpectedly denied can inspect the evaluation trace
  instead of guessing at policy semantics..
- Federation delegates authentication to an external identity provider such as
  Okta, Azure AD, or a SAML/OIDC IdP.

- The IAM service plays the role of service provider or relying party: it
  redirects the user to the IdP, receives a signed assertion back, validates the
  signature, and maps the provider's claims to an internal principal.
- The protocol choice matters: OIDC is typically preferred for its JSON-based
  flow, and SAML is still common in legacy enterprise environments.
- The design should support both behind a common adapter.

The identity mapping layer handles the hard part of federation.

- Provider subject identifiers must be translated into internal users, either by
  an explicit account-linking table or by an email-based automatic provisioning
  policy.
- Issuer trust is a security-critical configuration: only allowlisted issuers,
  validated certificates, and audience restrictions can be accepted.
- Federation also brings clock and replay concerns, so assertions carry expiries
  and nonces.
- The service rejects replays of previously consumed assertions.

Federated sessions still produce the IAM system's own tokens.

- After the IdP assertion is verified, the IAM service issues its internal
  session and applies the same authorization pipeline.
- This keeps downstream policy enforcement consistent regardless of login
  method.
- The tradeoff is availability and latency: when the IdP is down, users who
  already hold valid sessions can continue, but fresh logins fail.
- The design needs clear timeouts, fallback to local authentication for selected
  flows, and monitoring of IdP health.
- Monitoring should track federation failures by identity provider and protocol,
  so an outage at one IdP is detected and routed around before it surfaces as a
  broad login outage..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: IAM Service
user: User
app: Application
gateway: API Gateway
authn: Authentication
authz: Authorization
policy: Policy Engine
role: Role Service
idp: Identity Provider
audit: Audit Service
cache: Decision Cache
db: Policies DB

user ─► app ─► access
app ─► gateway ─► request
gateway ─► authn ─► verify
authn ─► idp ─► federate
gateway ─► authz ─► authorize
authz ─► policy ─► evaluate
policy ─► role ─► resolve
role ─► db ─► fetch
authz ─► cache ─► cache
gateway ─► audit ─► record
authz ─► app ─► allow
```

## Design

### Design an identity and access management system

An IAM system answers two questions for every request: who is the caller, and
what is the caller allowed to do.

- Authentication verifies identity, usually against an internal store or a
  federated identity provider, and produces a token.
- Authorization then evaluates the caller against policies before the
  application acts.
- Because IAM sits in front of every request, the design must prioritize low
  latency, high availability, and a rigorous audit trail.
- The authorization model must be expressive enough to express fine-grained
  rules without exploding into unmanageable complexity.

The reference flow in the diagram starts when the user accesses an application
through the API gateway.

- The gateway sends the request to authentication, which verifies the credential
  and may federate to an external identity provider.
- Once the principal is established, the gateway invokes the authorization
  service, which evaluates applicable policies.
- Policy evaluation resolves roles through the role service and fetches data
  from the policies database.
- The decision is cached, and every check is recorded by the audit service
  before the allow or deny result is returned to the application.

Two architectural choices shape the whole system.

- Authorization must be decoupled from application code so that policy changes
  do not require redeploys, and so that a single place enforces rules
  consistently.
- The system must degrade safely: when the policy database or identity provider
  is unavailable, the gateway needs a defined behavior.
- That behavior typically fails closed for sensitive operations while relying on
  cached decisions and short token lifetimes to keep legitimate traffic flowing.

### How do you model roles and permissions?

Permissions are atomic rights such as "read repo" or "delete user".

- Roles are named collections of permissions that humans reason about, like
  "developer" or "admin".
- Users get access by being assigned roles, either directly or through groups.
- This role-based access control model keeps assignment simple, but it needs
  hierarchy and scoping to scale.
- Roles can inherit from other roles, and grants are scoped to a resource or
  tenancy so that an "admin" role only applies within a specific project or
  organization.

Groups add another layer between users and roles.

- Users join groups, groups map to roles, and roles map to permissions, so
  membership changes propagate without touching individual grants.
- The mapping tables are the core of the data model: user-group, group-role, and
  role-permission associations, plus role assignment directly to users for
  exceptions.
- Everything is versioned so that policy history can be reconstructed for audit
  and rollback purposes.
- Versioned snapshots of a role or policy also let the system answer historical
  questions, such as what a user was allowed to do on a specific date, without
  reconstructing state from change logs.

Policies generalize roles by expressing rules in terms of conditions rather than
just static permissions.

- Conditions look like "allow read only during business hours" or "allow delete
  if the caller holds a second approval".
- The role service resolves the effective permission set by walking inheritance
  and applying conditions.
- The tension is expressiveness versus simplicity: pure roles are easy to reason
  about but inflexible.
- Full policy languages can become undebuggable at scale, so a good design
  offers a small, predictable policy language with roles as the primary
  abstraction.

### How do you evaluate policies efficiently?

Policy evaluation runs on the hot path of every request, so it must be fast and
cheap.

- The classic approach is to precompute effective permissions when assignments
  change and store the flattened result.
- A request check then becomes a simple set membership lookup rather than a
  graph traversal.
- When policies include dynamic conditions, the service evaluates those
  conditions against request attributes.
- It short-circuits on the first decisive rule and denies by default, which
  keeps the common case to a single cache hit.

Caching is the dominant lever.

- A decision cache keyed by principal, action, and resource stores the last
  result with a short TTL.
- Invalidation signals bump the affected keys whenever roles or policies change.
- Because authorization data changes slowly relative to request volume, a warm
  cache absorbs nearly all traffic, with the policies database only touched on
  misses.
- Multi-region deployments replicate the cache to avoid cross-region round trips
  for every check.

Scale forces partitioning and limits.

- The policy engine must cap recursion depth and rule count per evaluation so a
  malformed policy cannot consume unbounded CPU.
- Evaluation is performed in an isolated execution context that can be
  terminated if it exceeds its budget.
- Denials should be cached too, but with shorter TTLs so a corrected policy
  propagates quickly.
- Every decision is returned with the version of the policy set that produced
  it, letting operators correlate behavior changes with policy deploys.
- The service should also expose the decision reason and the rules consulted, so
  an engineer who is unexpectedly denied can inspect the evaluation trace
  instead of guessing at policy semantics.

### How do you support SSO and federation?

Federation delegates authentication to an external identity provider such as
Okta, Azure AD, or a SAML/OIDC IdP.

- The IAM service plays the role of service provider or relying party: it
  redirects the user to the IdP, receives a signed assertion back, validates the
  signature, and maps the provider's claims to an internal principal.
- The protocol choice matters: OIDC is typically preferred for its JSON-based
  flow, and SAML is still common in legacy enterprise environments.
- The design should support both behind a common adapter.

The identity mapping layer handles the hard part of federation.

- Provider subject identifiers must be translated into internal users, either by
  an explicit account-linking table or by an email-based automatic provisioning
  policy.
- Issuer trust is a security-critical configuration: only allowlisted issuers,
  validated certificates, and audience restrictions can be accepted.
- Federation also brings clock and replay concerns, so assertions carry expiries
  and nonces.
- The service rejects replays of previously consumed assertions.

Federated sessions still produce the IAM system's own tokens.

- After the IdP assertion is verified, the IAM service issues its internal
  session and applies the same authorization pipeline.
- This keeps downstream policy enforcement consistent regardless of login
  method.
- The tradeoff is availability and latency: when the IdP is down, users who
  already hold valid sessions can continue, but fresh logins fail.
- The design needs clear timeouts, fallback to local authentication for selected
  flows, and monitoring of IdP health.
- Monitoring should track federation failures by identity provider and protocol,
  so an outage at one IdP is detected and routed around before it surfaces as a
  broad login outage.

### How do you keep an audit trail?

Every decision, authentication event, and policy change is written to the audit
service, which appends to an append-only store.

- Each record carries the principal, the action attempted, the resource, the
  decision, the client context such as IP and user agent, and a timestamp.
- The data is retained in a structure that supports forensic queries, so a
  security team can answer questions like "who changed this permission and when"
  within seconds, even over long retention windows.

The audit trail must be tamper-evident.

- An append-only log is a good start, but a determined attacker with database
  access could edit it.
- Production systems chain record hashes together and periodically ship signed
  checkpoint snapshots to an immutable store.
- Storage costs grow quickly, so hot data lives in a queryable system while cold
  data is compressed and archived.
- A defined retention policy balances compliance requirements against cost.
- Retention also has to respect data residency, since audit records may be
  required to stay in the region where the account lives.
- That can rule out a single global store.

Audit and authorization must be coupled, not bolted on.

- The same request that produces an authorization decision emits the audit
  record, so there is no gap where a decision occurs without a trace.
- Policy changes are themselves audited with the old and new versions, tying
  each change to its actor.
- The audit stream feeds detection: aggregated logins from new devices, bursts
  of denied requests, or policy changes outside a change window are signals that
  should trigger automated alerts rather than waiting for a manual
  investigation.

## Source

```text
title: IAM Service
node user: User [round, icon=browser]
node app: Application [icon=browser]
node gateway: API Gateway [icon=server]
node authn: Authentication [icon=shield]
node authz: Authorization [icon=compute]
node policy: Policy Engine [icon=compute]
node role: Role Service [icon=users]
node idp: Identity Provider [icon=cloud]
node audit: Audit Service [icon=file]
node cache: Decision Cache [cylinder, icon=cache]
node db: Policies DB [cylinder, icon=database]

edge user -> app: access
edge app -> gateway: request
edge gateway -> authn: verify
edge authn -> idp: federate
edge gateway -> authz: authorize
edge authz -> policy: evaluate
edge policy -> role: resolve
edge role -> db: fetch
edge authz -> cache: cache
edge gateway -> audit: record
edge authz -> app: allow
```

## Q&A

### Q: Design an identity and access management system

**A:** An IAM system answers two questions for every request: who is the caller, and
what is the caller allowed to do.

- Authentication verifies identity, usually against an internal store or a
  federated identity provider, and produces a token.
- Authorization then evaluates the caller against policies before the
  application acts.
- Because IAM sits in front of every request, the design must prioritize low
  latency, high availability, and a rigorous audit trail.
- The authorization model must be expressive enough to express fine-grained
  rules without exploding into unmanageable complexity.

The reference flow in the diagram starts when the user accesses an application
through the API gateway.

- The gateway sends the request to authentication, which verifies the credential
  and may federate to an external identity provider.
- Once the principal is established, the gateway invokes the authorization
  service, which evaluates applicable policies.
- Policy evaluation resolves roles through the role service and fetches data
  from the policies database.
- The decision is cached, and every check is recorded by the audit service
  before the allow or deny result is returned to the application.

Two architectural choices shape the whole system.

- Authorization must be decoupled from application code so that policy changes
  do not require redeploys, and so that a single place enforces rules
  consistently.
- The system must degrade safely: when the policy database or identity provider
  is unavailable, the gateway needs a defined behavior.
- That behavior typically fails closed for sensitive operations while relying on
  cached decisions and short token lifetimes to keep legitimate traffic flowing.

### Q: How do you model roles and permissions?

**A:** Permissions are atomic rights such as "read repo" or "delete user".

- Roles are named collections of permissions that humans reason about, like
  "developer" or "admin".
- Users get access by being assigned roles, either directly or through groups.
- This role-based access control model keeps assignment simple, but it needs
  hierarchy and scoping to scale.
- Roles can inherit from other roles, and grants are scoped to a resource or
  tenancy so that an "admin" role only applies within a specific project or
  organization.

Groups add another layer between users and roles.

- Users join groups, groups map to roles, and roles map to permissions, so
  membership changes propagate without touching individual grants.
- The mapping tables are the core of the data model: user-group, group-role, and
  role-permission associations, plus role assignment directly to users for
  exceptions.
- Everything is versioned so that policy history can be reconstructed for audit
  and rollback purposes.
- Versioned snapshots of a role or policy also let the system answer historical
  questions, such as what a user was allowed to do on a specific date, without
  reconstructing state from change logs.

Policies generalize roles by expressing rules in terms of conditions rather than
just static permissions.

- Conditions look like "allow read only during business hours" or "allow delete
  if the caller holds a second approval".
- The role service resolves the effective permission set by walking inheritance
  and applying conditions.
- The tension is expressiveness versus simplicity: pure roles are easy to reason
  about but inflexible.
- Full policy languages can become undebuggable at scale, so a good design
  offers a small, predictable policy language with roles as the primary
  abstraction.

### Q: How do you evaluate policies efficiently?

**A:** Policy evaluation runs on the hot path of every request, so it must be fast and
cheap.

- The classic approach is to precompute effective permissions when assignments
  change and store the flattened result.
- A request check then becomes a simple set membership lookup rather than a
  graph traversal.
- When policies include dynamic conditions, the service evaluates those
  conditions against request attributes.
- It short-circuits on the first decisive rule and denies by default, which
  keeps the common case to a single cache hit.

Caching is the dominant lever.

- A decision cache keyed by principal, action, and resource stores the last
  result with a short TTL.
- Invalidation signals bump the affected keys whenever roles or policies change.
- Because authorization data changes slowly relative to request volume, a warm
  cache absorbs nearly all traffic, with the policies database only touched on
  misses.
- Multi-region deployments replicate the cache to avoid cross-region round trips
  for every check.

Scale forces partitioning and limits.

- The policy engine must cap recursion depth and rule count per evaluation so a
  malformed policy cannot consume unbounded CPU.
- Evaluation is performed in an isolated execution context that can be
  terminated if it exceeds its budget.
- Denials should be cached too, but with shorter TTLs so a corrected policy
  propagates quickly.
- Every decision is returned with the version of the policy set that produced
  it, letting operators correlate behavior changes with policy deploys.
- The service should also expose the decision reason and the rules consulted, so
  an engineer who is unexpectedly denied can inspect the evaluation trace
  instead of guessing at policy semantics.

### Q: How do you support SSO and federation?

**A:** Federation delegates authentication to an external identity provider such as
Okta, Azure AD, or a SAML/OIDC IdP.

- The IAM service plays the role of service provider or relying party: it
  redirects the user to the IdP, receives a signed assertion back, validates the
  signature, and maps the provider's claims to an internal principal.
- The protocol choice matters: OIDC is typically preferred for its JSON-based
  flow, and SAML is still common in legacy enterprise environments.
- The design should support both behind a common adapter.

The identity mapping layer handles the hard part of federation.

- Provider subject identifiers must be translated into internal users, either by
  an explicit account-linking table or by an email-based automatic provisioning
  policy.
- Issuer trust is a security-critical configuration: only allowlisted issuers,
  validated certificates, and audience restrictions can be accepted.
- Federation also brings clock and replay concerns, so assertions carry expiries
  and nonces.
- The service rejects replays of previously consumed assertions.

Federated sessions still produce the IAM system's own tokens.

- After the IdP assertion is verified, the IAM service issues its internal
  session and applies the same authorization pipeline.
- This keeps downstream policy enforcement consistent regardless of login
  method.
- The tradeoff is availability and latency: when the IdP is down, users who
  already hold valid sessions can continue, but fresh logins fail.
- The design needs clear timeouts, fallback to local authentication for selected
  flows, and monitoring of IdP health.
- Monitoring should track federation failures by identity provider and protocol,
  so an outage at one IdP is detected and routed around before it surfaces as a
  broad login outage.

### Q: How do you keep an audit trail?

**A:** Every decision, authentication event, and policy change is written to the audit
service, which appends to an append-only store.

- Each record carries the principal, the action attempted, the resource, the
  decision, the client context such as IP and user agent, and a timestamp.
- The data is retained in a structure that supports forensic queries, so a
  security team can answer questions like "who changed this permission and when"
  within seconds, even over long retention windows.

The audit trail must be tamper-evident.

- An append-only log is a good start, but a determined attacker with database
  access could edit it.
- Production systems chain record hashes together and periodically ship signed
  checkpoint snapshots to an immutable store.
- Storage costs grow quickly, so hot data lives in a queryable system while cold
  data is compressed and archived.
- A defined retention policy balances compliance requirements against cost.
- Retention also has to respect data residency, since audit records may be
  required to stay in the region where the account lives.
- That can rule out a single global store.

Audit and authorization must be coupled, not bolted on.

- The same request that produces an authorization decision emits the audit
  record, so there is no gap where a decision occurs without a trace.
- Policy changes are themselves audited with the old and new versions, tying
  each change to its actor.
- The audit stream feeds detection: aggregated logins from new devices, bursts
  of denied requests, or policy changes outside a change window are signals that
  should trigger automated alerts rather than waiting for a manual
  investigation.

## Source

```text
title: IAM Service
node user: User [round, icon=browser]
node app: Application [icon=browser]
node gateway: API Gateway [icon=server]
node authn: Authentication [icon=shield]
node authz: Authorization [icon=compute]
node policy: Policy Engine [icon=compute]
node role: Role Service [icon=users]
node idp: Identity Provider [icon=cloud]
node audit: Audit Service [icon=file]
node cache: Decision Cache [cylinder, icon=cache]
node db: Policies DB [cylinder, icon=database]

edge user -> app: access
edge app -> gateway: request
edge gateway -> authn: verify
edge authn -> idp: federate
edge gateway -> authz: authorize
edge authz -> policy: evaluate
edge policy -> role: resolve
edge role -> db: fetch
edge authz -> cache: cache
edge gateway -> audit: record
edge authz -> app: allow
```
