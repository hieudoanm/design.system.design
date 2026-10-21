# OAuth Provider

Design an OAuth 2.0 provider

**Difficulty:** Hard

**Tags:** auth

## Functional Requirements

- an OAuth 2.0 provider
- issue and validate tokens securely?
- manage consent screens?
- handle refresh tokens and rotation?
- revoke access quickly?

## Non-Functional Requirements

- Highly available
- Low latency
- Horizontally scalable

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: OAuth Provider
user: User
app: Client App
gateway: API Gateway
auth: Auth Server
consent: Consent Service
token: Token Service
sign: Token Signer
client: Client Registry
validate: Token Validation
cache: Token Cache
db: Grants DB

user ─► app ─► login
app ─► auth ─► authorize
auth ─► consent ─► prompt
consent ─► user ─► approve
auth ─► token ─► exchange
token ─► sign ─► issue
token ─► db ─► store
app ─► gateway ─► api
gateway ─► validate ─► check
validate ─► cache ─► lookup
token ─► cache ─► cache
```

## Design

### Design an OAuth 2.0 provider

An OAuth provider sits between users, client applications, and resource servers,
so its architecture is about keeping the security-critical paths isolated.

- I would build it around an auth server that owns the authorization code and
  consent flow, a consent service that records what a user approved, and a token
  service that issues access and refresh tokens.
- The token signer holds the private keys, the client registry stores registered
  application metadata and secrets, and the token validation service is what
  resource servers call to verify access.
- A grants database records authorizations, and a token cache serves the
  high-volume validation path.

The flow is the standard authorization code dance.

- The user logs in at the client app, which redirects to the auth server; the
  auth server authenticates the user, shows the consent screen, and on approval
  issues a short-lived authorization code bound to the client and redirect URI.
- The client exchanges the code at the token endpoint, and the token service
  signs an access token, issues a refresh token, and records the grant.
- When the client later calls the API through the gateway, the resource server
  validates the access token through the validation service, which consults the
  cache before the token store.

The core design principle is separation of trust.

- Signing keys live only in the signer, user credentials only in the auth
  server, and validation is stateless so any resource server can check a token
  with just the public key.
- The token cache makes validation cheap even though it must handle an enormous
  read rate.
- The tradeoff is that stateless JWT access tokens cannot be instantly revoked,
  which is why the design pairs short-lived access tokens with refresh tokens
  and a revocation path through the cache and grants database.

### How do you issue and validate tokens securely?

Token issuance starts with a signed, structured access token such as a JWT
carrying the user id, client id, scopes, audience, issuer, and expiry.

- The token signer holds asymmetric keys, signs the token, and keeps the private
  key in a hardware-backed secret store; it never leaves the signer.
- I would use short-lived access tokens, on the order of minutes to an hour,
  because a leaked token is only useful until it expires.
- Each token carries the issuer and audience claims so a token issued by one
  deployment cannot be accepted by another, and the signer rotates keys on a
  schedule while keeping the previous public key valid for a grace period.

Validation is layered and mostly stateless.

- A resource server verifies the signature with the provider's public key,
  checks the issuer and audience, checks expiry, and confirms the scopes it
  requires.
- I would add a validation service for the cases that need state, such as
  revoked tokens or sub-second rotation, which consults a token cache and falls
  back to the grants database.
- Validation must reject ambiguous results, so an expired signature, an unknown
  key id, or a scope mismatch is an error rather than a best-effort allowance.
- Clock skew is handled with a small leeway on the issuer and validation sides.

The authorization code and refresh token are the secrets that matter most, so
they get the strongest protections.

- Codes are single-use, bound to the client and redirect URI, and expire within
  minutes.
- Refresh tokens are opaque random values stored hashed, never returned by the
  resource API, and bound to the specific client and grant.
- Every token is scoped to the narrowest set the consent granted.
- I would log issuance and validation events without logging the tokens
  themselves, so an investigator can reconstruct who issued what while the
  tokens stay unreadable in logs.

### How do you manage consent screens?

Consent is the user-facing contract between the provider, the client, and the
user, so it must be accurate, understandable, and revocable.

- The consent service computes what the client is requesting: identity profile,
  email, offline access, and specific API scopes.
- Each scope maps to a user-readable description, and the screen shows exactly
  those descriptions, never the raw scope names.
- I would categorize scopes by sensitivity, so reading a user's contacts
  triggers a stricter consent presentation than reading their display name, and
  sensitive scopes can be approved independently rather than bundled into one
  blanket yes.

The consent service persists grants and reuses them.

- A grant records the client, the user, the approved scopes, and the approval
  timestamp, so a returning client does not re-prompt for scopes the user
  already granted.
- Any new scope added to a request triggers a fresh prompt for just that scope.
- I would make consent updates explicit: if the user revokes a scope, existing
  tokens with that scope stop being renewed.
- Because consent decisions are durable, they survive sessions, and the user can
  review and revoke all their grants from a single settings page, which drives
  the whole revocation lifecycle.

The consent screen itself is a security boundary.

- It must be shown inside the provider's own origin so a malicious client cannot
  spoof it, and the client cannot suppress or alter it.
- Each screen carries the client's verified name and the redirect destination so
  the user knows exactly where their data goes.
- I would add per-user consent history so both the user and security teams can
  audit what was approved.
- The tradeoff is friction: more prompts protect users but reduce conversion, so
  the design reuses valid grants aggressively, only prompting when the request
  truly changes.

### How do you handle refresh tokens and rotation?

Refresh tokens exist because access tokens are short-lived, and a client needs a
way to obtain new ones without re-prompting the user.

- The refresh token is issued alongside the access token, bound to the user,
  client, and scope set of the original grant, and stored hashed in the grants
  database.
- On refresh, the token service verifies the hash, checks the grant is still
  valid, checks the client is the same one, and issues a new access token.
- If the refresh token is expired, revoked, or its grant was removed, the
  request fails and the client must restart the authorization flow.

Rotation means every refresh issues a new refresh token and invalidates the old
one.

- This turns token theft into a detectable event: if an attacker replays an old
  refresh token, the new one has already been issued and the replay fails,
  signaling a compromise.
- I would record the rotation chain per grant and flag concurrent-use anomalies.
- Rotation has a cost, because a client that loses the new token in a network
  failure locks itself out, so the design pairs rotation with a short overlap
  window where the just-replaced token is still accepted once to absorb that
  race.

Refresh tokens carry their own lifecycle.

- Absolute lifetime limits force re-authentication for sensitive scopes on a
  schedule, independent of the access token lifetime.
- Device- and context-binding, such as tying a refresh token to an expected
  client id and issuer, raises the bar against replay from a different context.
- I would also enforce per-grant refresh limits to cap how long a stolen token
  can extend a session.
- The tradeoff is that rotation and expiry add protocol complexity and client
  coordination, but they are the difference between a stolen token being a blip
  and a full account compromise.

### How do you revoke access quickly?

Revocation has to work at two speeds: instant for a known breach, and eventual
for the stateless access tokens that are already circulating.

- The revocation model is built around the grant.
- Revoking a grant invalidates the user's consent, marks the refresh token dead,
  and adds the access token ids to a revocation list.
- The token cache is the first gate: the validation service checks the cache
  before anything else, and cache entries carry a per-grant version that bumps
  on revocation, so a revoked grant fails validation immediately.
- The grants database is the durable backstop for cache misses and for
  re-validation after a cache flush.

Stateless JWTs cannot be un-issued, so instant revocation of a signed access
token is done by revocation windowing.

- Access tokens are short-lived by design, so the revocation list needs to cover
  only the tokens that could still be live, which bounds its size.
- For a user-level revocation such as a password change or a security incident,
  I would bump the grant version, which invalidates all refresh tokens and
  forces the next refresh to fail, and drop the cached access tokens.
- Client-level revocation, such as an app being banned, invalidates every grant
  for that client in one sweep.

Revocation events propagate through the same events that drive the cache.

- I would publish a revocation event to each validation region so the caches
  invalidate quickly even in a multi-region deployment, and the validation
  service treats any unknown or stale cache entry as a full store check rather
  than a trust.
- The user-facing settings page shows every active grant with revoke buttons,
  which is both a product feature and the primary hygiene mechanism for stale
  access.
- The tradeoff is that full instant revocation of signed tokens is impossible
  without short lifetimes or token introspection on every call, so the design
  chooses short access tokens, fast cache invalidation, and rotation-aware
  refresh tokens.

## Source

```text
title: OAuth Provider
node user: User [round, icon=browser]
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Auth Server [icon=shield]
node consent: Consent Service [icon=compute]
node token: Token Service [icon=compute]
node sign: Token Signer [icon=shield]
node client: Client Registry [cylinder, icon=database]
node validate: Token Validation [icon=compute]
node cache: Token Cache [cylinder, icon=cache]
node db: Grants DB [cylinder, icon=database]

edge user -> app: login
edge app -> auth: authorize
edge auth -> consent: prompt
edge consent -> user: approve
edge auth -> token: exchange
edge token -> sign: issue
edge token -> db: store
edge app -> gateway: api
edge gateway -> validate: check
edge validate -> cache: lookup
edge token -> cache: cache
```

## Q&A

### Q: Design an OAuth 2.0 provider

**A:** An OAuth provider sits between users, client applications, and resource servers,
so its architecture is about keeping the security-critical paths isolated.

- I would build it around an auth server that owns the authorization code and
  consent flow, a consent service that records what a user approved, and a token
  service that issues access and refresh tokens.
- The token signer holds the private keys, the client registry stores registered
  application metadata and secrets, and the token validation service is what
  resource servers call to verify access.
- A grants database records authorizations, and a token cache serves the
  high-volume validation path.

The flow is the standard authorization code dance.

- The user logs in at the client app, which redirects to the auth server; the
  auth server authenticates the user, shows the consent screen, and on approval
  issues a short-lived authorization code bound to the client and redirect URI.
- The client exchanges the code at the token endpoint, and the token service
  signs an access token, issues a refresh token, and records the grant.
- When the client later calls the API through the gateway, the resource server
  validates the access token through the validation service, which consults the
  cache before the token store.

The core design principle is separation of trust.

- Signing keys live only in the signer, user credentials only in the auth
  server, and validation is stateless so any resource server can check a token
  with just the public key.
- The token cache makes validation cheap even though it must handle an enormous
  read rate.
- The tradeoff is that stateless JWT access tokens cannot be instantly revoked,
  which is why the design pairs short-lived access tokens with refresh tokens
  and a revocation path through the cache and grants database.

### Q: How do you issue and validate tokens securely?

**A:** Token issuance starts with a signed, structured access token such as a JWT
carrying the user id, client id, scopes, audience, issuer, and expiry.

- The token signer holds asymmetric keys, signs the token, and keeps the private
  key in a hardware-backed secret store; it never leaves the signer.
- I would use short-lived access tokens, on the order of minutes to an hour,
  because a leaked token is only useful until it expires.
- Each token carries the issuer and audience claims so a token issued by one
  deployment cannot be accepted by another, and the signer rotates keys on a
  schedule while keeping the previous public key valid for a grace period.

Validation is layered and mostly stateless.

- A resource server verifies the signature with the provider's public key,
  checks the issuer and audience, checks expiry, and confirms the scopes it
  requires.
- I would add a validation service for the cases that need state, such as
  revoked tokens or sub-second rotation, which consults a token cache and falls
  back to the grants database.
- Validation must reject ambiguous results, so an expired signature, an unknown
  key id, or a scope mismatch is an error rather than a best-effort allowance.
- Clock skew is handled with a small leeway on the issuer and validation sides.

The authorization code and refresh token are the secrets that matter most, so
they get the strongest protections.

- Codes are single-use, bound to the client and redirect URI, and expire within
  minutes.
- Refresh tokens are opaque random values stored hashed, never returned by the
  resource API, and bound to the specific client and grant.
- Every token is scoped to the narrowest set the consent granted.
- I would log issuance and validation events without logging the tokens
  themselves, so an investigator can reconstruct who issued what while the
  tokens stay unreadable in logs.

### Q: How do you manage consent screens?

**A:** Consent is the user-facing contract between the provider, the client, and the
user, so it must be accurate, understandable, and revocable.

- The consent service computes what the client is requesting: identity profile,
  email, offline access, and specific API scopes.
- Each scope maps to a user-readable description, and the screen shows exactly
  those descriptions, never the raw scope names.
- I would categorize scopes by sensitivity, so reading a user's contacts
  triggers a stricter consent presentation than reading their display name, and
  sensitive scopes can be approved independently rather than bundled into one
  blanket yes.

The consent service persists grants and reuses them.

- A grant records the client, the user, the approved scopes, and the approval
  timestamp, so a returning client does not re-prompt for scopes the user
  already granted.
- Any new scope added to a request triggers a fresh prompt for just that scope.
- I would make consent updates explicit: if the user revokes a scope, existing
  tokens with that scope stop being renewed.
- Because consent decisions are durable, they survive sessions, and the user can
  review and revoke all their grants from a single settings page, which drives
  the whole revocation lifecycle.

The consent screen itself is a security boundary.

- It must be shown inside the provider's own origin so a malicious client cannot
  spoof it, and the client cannot suppress or alter it.
- Each screen carries the client's verified name and the redirect destination so
  the user knows exactly where their data goes.
- I would add per-user consent history so both the user and security teams can
  audit what was approved.
- The tradeoff is friction: more prompts protect users but reduce conversion, so
  the design reuses valid grants aggressively, only prompting when the request
  truly changes.

### Q: How do you handle refresh tokens and rotation?

**A:** Refresh tokens exist because access tokens are short-lived, and a client needs a
way to obtain new ones without re-prompting the user.

- The refresh token is issued alongside the access token, bound to the user,
  client, and scope set of the original grant, and stored hashed in the grants
  database.
- On refresh, the token service verifies the hash, checks the grant is still
  valid, checks the client is the same one, and issues a new access token.
- If the refresh token is expired, revoked, or its grant was removed, the
  request fails and the client must restart the authorization flow.

Rotation means every refresh issues a new refresh token and invalidates the old
one.

- This turns token theft into a detectable event: if an attacker replays an old
  refresh token, the new one has already been issued and the replay fails,
  signaling a compromise.
- I would record the rotation chain per grant and flag concurrent-use anomalies.
- Rotation has a cost, because a client that loses the new token in a network
  failure locks itself out, so the design pairs rotation with a short overlap
  window where the just-replaced token is still accepted once to absorb that
  race.

Refresh tokens carry their own lifecycle.

- Absolute lifetime limits force re-authentication for sensitive scopes on a
  schedule, independent of the access token lifetime.
- Device- and context-binding, such as tying a refresh token to an expected
  client id and issuer, raises the bar against replay from a different context.
- I would also enforce per-grant refresh limits to cap how long a stolen token
  can extend a session.
- The tradeoff is that rotation and expiry add protocol complexity and client
  coordination, but they are the difference between a stolen token being a blip
  and a full account compromise.

### Q: How do you revoke access quickly?

**A:** Revocation has to work at two speeds: instant for a known breach, and eventual
for the stateless access tokens that are already circulating.

- The revocation model is built around the grant.
- Revoking a grant invalidates the user's consent, marks the refresh token dead,
  and adds the access token ids to a revocation list.
- The token cache is the first gate: the validation service checks the cache
  before anything else, and cache entries carry a per-grant version that bumps
  on revocation, so a revoked grant fails validation immediately.
- The grants database is the durable backstop for cache misses and for
  re-validation after a cache flush.

Stateless JWTs cannot be un-issued, so instant revocation of a signed access
token is done by revocation windowing.

- Access tokens are short-lived by design, so the revocation list needs to cover
  only the tokens that could still be live, which bounds its size.
- For a user-level revocation such as a password change or a security incident,
  I would bump the grant version, which invalidates all refresh tokens and
  forces the next refresh to fail, and drop the cached access tokens.
- Client-level revocation, such as an app being banned, invalidates every grant
  for that client in one sweep.

Revocation events propagate through the same events that drive the cache.

- I would publish a revocation event to each validation region so the caches
  invalidate quickly even in a multi-region deployment, and the validation
  service treats any unknown or stale cache entry as a full store check rather
  than a trust.
- The user-facing settings page shows every active grant with revoke buttons,
  which is both a product feature and the primary hygiene mechanism for stale
  access.
- The tradeoff is that full instant revocation of signed tokens is impossible
  without short lifetimes or token introspection on every call, so the design
  chooses short access tokens, fast cache invalidation, and rotation-aware
  refresh tokens.

## Source

```text
title: OAuth Provider
node user: User [round, icon=browser]
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Auth Server [icon=shield]
node consent: Consent Service [icon=compute]
node token: Token Service [icon=compute]
node sign: Token Signer [icon=shield]
node client: Client Registry [cylinder, icon=database]
node validate: Token Validation [icon=compute]
node cache: Token Cache [cylinder, icon=cache]
node db: Grants DB [cylinder, icon=database]

edge user -> app: login
edge app -> auth: authorize
edge auth -> consent: prompt
edge consent -> user: approve
edge auth -> token: exchange
edge token -> sign: issue
edge token -> db: store
edge app -> gateway: api
edge gateway -> validate: check
edge validate -> cache: lookup
edge token -> cache: cache
```
