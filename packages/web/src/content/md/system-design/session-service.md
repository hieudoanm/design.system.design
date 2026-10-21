# Session Service

Design a session management service

**Difficulty:** Medium

**Tags:** auth

## Functional Requirements

- a session management service
- issue and validate session tokens?
- support multiple devices?
- revoke sessions remotely?
- handle session expiry?

## Non-Functional Requirements

- A session service tracks authenticated users across requests.

- After the login service verifies credentials, it asks the session service to
  create a session, which issues a token to the client and records the session
  state server-side.
- On every subsequent request, the gateway validates the presented token against
  the session store, and when the user logs out or the session is compromised,
  the service revokes it so it can no longer be used.
- The central design tension is stateless versus stateful tokens: opaque random
  tokens require a store lookup on every request, while signed tokens such as
  JWTs can be validated without touching a database but are much harder to
  revoke before they expire.

The building blocks are a token issuer, a session store, a validator, a device
registry, and a revocation component.

- The issuer mints a high-entropy random token, stores a hash of it along with
  metadata like the user ID, device, IP, and expiry, and returns the raw token
  to the client.
- The validator parses the token from the Authorization header, checks it
  against the store, and enforces expiry and any one-session-per-device policies
  before letting the request proceed.

Latency is the main performance concern.

- Every authenticated request passes through validation, so the hot path needs a
  fast in-memory cache keyed by the token hash, with the durable session store
  as the source of truth for revocation and recovery.
- The design must also account for security events: credential compromise, a
  stolen device, or a suspicious login should be able to kill sessions
  immediately, which is only possible if the system retains enough server-side
  state to enumerate and invalidate tokens..
- Multiple devices are modeled as multiple sessions for the same user, each keyed
  by a device identifier provided at login.

- The device registry records the device name, platform, last-seen time, and the
  sessions currently active on it, giving users a management UI that lists what
  is signed in and lets them act on a single device.
- Sessions are independent, so one device logging out never affects another, but
  the system can still apply global policies such as a maximum number of active
  sessions per account.

Consistency between the device registry and the session store must be
maintained.

- When a device is removed, all its sessions should be revoked; when a session
  expires, the registry entry is updated or marked stale.
- A background sweep reconciles the two views, because devices can vanish
  without a clean logout.
- Each login should also generate a security notification to the other devices
  so a user can recognize an unexpected new login immediately.

The device model also enables step-up behavior.

- A new device often needs extra verification, such as an email code, before it
  can access high-value actions.
- The session record can carry a trust level, and the gateway can escalate or
  downgrade requests based on that level.
- Storing device context on the session also powers analytics and anomaly
  detection, since a session that suddenly appears from a different IP or
  platform is a strong signal of a stolen token.
- Device metadata feeds security scoring, so a session from a known device that
  starts behaving from an unfamiliar network can be challenged before it is
  trusted for sensitive operations..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Session Service
user: User
app: Client App
gateway: API Gateway
login: Login Service
session: Session Service
issue: Token Issuer
store: Session Store
validate: Session Validator
device: Device Registry
revoke: Revocation
db: Sessions DB

user ─► app ─► login
app ─► gateway ─► authenticate
gateway ─► login ─► verify
login ─► session ─► create
session ─► issue ─► token
issue ─► store ─► save
app ─► gateway ─► request
gateway ─► validate ─► check
validate ─► store ─► lookup
user ─► app ─► revoke
revoke ─► db ─► invalidate
```

## Design

### Design a session management service

A session service tracks authenticated users across requests.

- After the login service verifies credentials, it asks the session service to
  create a session, which issues a token to the client and records the session
  state server-side.
- On every subsequent request, the gateway validates the presented token against
  the session store, and when the user logs out or the session is compromised,
  the service revokes it so it can no longer be used.
- The central design tension is stateless versus stateful tokens: opaque random
  tokens require a store lookup on every request, while signed tokens such as
  JWTs can be validated without touching a database but are much harder to
  revoke before they expire.

The building blocks are a token issuer, a session store, a validator, a device
registry, and a revocation component.

- The issuer mints a high-entropy random token, stores a hash of it along with
  metadata like the user ID, device, IP, and expiry, and returns the raw token
  to the client.
- The validator parses the token from the Authorization header, checks it
  against the store, and enforces expiry and any one-session-per-device policies
  before letting the request proceed.

Latency is the main performance concern.

- Every authenticated request passes through validation, so the hot path needs a
  fast in-memory cache keyed by the token hash, with the durable session store
  as the source of truth for revocation and recovery.
- The design must also account for security events: credential compromise, a
  stolen device, or a suspicious login should be able to kill sessions
  immediately, which is only possible if the system retains enough server-side
  state to enumerate and invalidate tokens.

### How do you issue and validate session tokens?

Tokens should be opaque random strings with at least 256 bits of entropy,
generated from a cryptographic random source.

- The raw token is returned to the client exactly once, while only its hash is
  persisted, so a database breach does not leak usable tokens.
- A standard format is a versioned identifier plus a random payload, which lets
  the validator route to the right signing or hashing scheme as the system
  evolves.
- Optionally, an encrypted JWT can carry claims like user ID and expiry so
  validation can be done without a lookup, at the cost of revocation difficulty.

Validation walks a defined order.

- First the token is parsed and structurally checked, then its signature or hash
  is verified, then the expiry is compared against the current time, then the
  session record is located and checked for revocation.
- A cache in front of the store lets repeated requests from the same session
  skip the database read; the cache entry stores the revocation state so a
  revoke can bust or invalidate it.
- All validation failures are logged with a reason code so engineers can
  distinguish expired, malformed, revoked, and unknown tokens.

The issuance side must be idempotent and auditable.

- A login creates one session and returns one token; retries should not stack
  multiple active sessions unless the policy allows it.
- Issuance should also rotate the token on promotion, for example when a session
  is upgraded after step-up authentication.
- Because tokens are bearer credentials, they are sent over TLS only, stored
  client-side in a secure mechanism, and validated with a constant-time
  comparison to resist timing attacks.

### How do you support multiple devices?

Multiple devices are modeled as multiple sessions for the same user, each keyed
by a device identifier provided at login.

- The device registry records the device name, platform, last-seen time, and the
  sessions currently active on it, giving users a management UI that lists what
  is signed in and lets them act on a single device.
- Sessions are independent, so one device logging out never affects another, but
  the system can still apply global policies such as a maximum number of active
  sessions per account.

Consistency between the device registry and the session store must be
maintained.

- When a device is removed, all its sessions should be revoked; when a session
  expires, the registry entry is updated or marked stale.
- A background sweep reconciles the two views, because devices can vanish
  without a clean logout.
- Each login should also generate a security notification to the other devices
  so a user can recognize an unexpected new login immediately.

The device model also enables step-up behavior.

- A new device often needs extra verification, such as an email code, before it
  can access high-value actions.
- The session record can carry a trust level, and the gateway can escalate or
  downgrade requests based on that level.
- Storing device context on the session also powers analytics and anomaly
  detection, since a session that suddenly appears from a different IP or
  platform is a strong signal of a stolen token.
- Device metadata feeds security scoring, so a session from a known device that
  starts behaving from an unfamiliar network can be challenged before it is
  trusted for sensitive operations.

### How do you revoke sessions remotely?

Remote revocation requires server-side state, because a stateless token cannot
be unissued after it leaves the server.

- The revocation component marks the session record as invalid in the store and
  invalidates the corresponding cache entry, so the next validation attempt
  fails immediately.
- For a single-device revoke, the record is updated in place; for a full
  logout-everywhere, all sessions belonging to the user are enumerated and
  invalidated in one batch.

Revocation has to propagate fast.

- If validation reads from a cache and the revoke only touches the durable
  store, clients could keep using a revoked token until the cache entry expires.
- The standard solution is to delete or overwrite the cache key on revoke, or to
  hold a small per-user revocation generation number in the token validation
  path so that a bump invalidates all sessions at once.
- The revoke operation itself must be idempotent and race-free against
  concurrent validations.
- Revocation is part of the release tests: an integration test logs in on
  several devices, revokes one, and asserts the token is rejected on the next
  request while the others keep working.

Remote revocation also covers device removal, password changes, and breach
responses.

- Changing a password should revoke all sessions except the current one, and a
  support ticket can force a full reset.
- Every revoke is written to an audit trail with the actor, the target, and a
  reason, because revocation requests from customer support are themselves a
  liability surface.
- Finally, the token is not just marked dead server-side; the client is told to
  discard it, and a session that surfaces after revocation is treated as a
  security event.

### How do you handle session expiry?

Sessions carry an absolute lifetime and an inactivity timeout, and both are
enforced by the validator.

- The inactivity timeout, often called sliding expiry, is refreshed whenever the
  session is used within its window, which keeps active users signed in while
  dropping idle sessions.
- The absolute lifetime caps how long any session can live regardless of
  activity, forcing a re-login on a schedule that balances security against
  convenience.
- Expiry values should be configurable per policy, with higher-risk contexts
  getting shorter windows.

Expiry is enforced lazily at validation time and eagerly by a sweeper.

- Every session row stores its expiry timestamp, and validation rejects anything
  past it, returning a distinct "session expired" error so the client can
  trigger a refresh flow.
- A periodic background job expires rows in bulk and removes stale device
  registry entries, keeping the tables from growing without bound.
- This combination avoids a write on every request while still reclaiming
  storage.

A renewal flow keeps the user experience smooth.

- When a session is near expiry, the client can call a refresh endpoint that
  validates the current token, issues a new one, and invalidates the old one,
  preferably using rotation so a stolen old token cannot be replayed after
  renewal.
- Renewal itself is rate limited and audited.
- Expiry must never be silently bypassed by a cache that was populated before
  the deadline, so the validator compares the stored expiry against the clock on
  every authoritative check.
- Clock skew between the session service and the validator can cause premature
  or late expiry, so the system relies on a single authoritative clock source
  and monitors skew across regions.

## Source

```text
title: Session Service
node user: User [round, icon=browser]
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node login: Login Service [icon=shield]
node session: Session Service [icon=compute]
node issue: Token Issuer [icon=compute]
node store: Session Store [cylinder, icon=cache]
node validate: Session Validator [icon=compute]
node device: Device Registry [icon=compute]
node revoke: Revocation [icon=shield]
node db: Sessions DB [cylinder, icon=database]

edge user -> app: login
edge app -> gateway: authenticate
edge gateway -> login: verify
edge login -> session: create
edge session -> issue: token
edge issue -> store: save
edge app -> gateway: request
edge gateway -> validate: check
edge validate -> store: lookup
edge user -> app: revoke
edge revoke -> db: invalidate
```

## Q&A

### Q: Design a session management service

**A:** A session service tracks authenticated users across requests.

- After the login service verifies credentials, it asks the session service to
  create a session, which issues a token to the client and records the session
  state server-side.
- On every subsequent request, the gateway validates the presented token against
  the session store, and when the user logs out or the session is compromised,
  the service revokes it so it can no longer be used.
- The central design tension is stateless versus stateful tokens: opaque random
  tokens require a store lookup on every request, while signed tokens such as
  JWTs can be validated without touching a database but are much harder to
  revoke before they expire.

The building blocks are a token issuer, a session store, a validator, a device
registry, and a revocation component.

- The issuer mints a high-entropy random token, stores a hash of it along with
  metadata like the user ID, device, IP, and expiry, and returns the raw token
  to the client.
- The validator parses the token from the Authorization header, checks it
  against the store, and enforces expiry and any one-session-per-device policies
  before letting the request proceed.

Latency is the main performance concern.

- Every authenticated request passes through validation, so the hot path needs a
  fast in-memory cache keyed by the token hash, with the durable session store
  as the source of truth for revocation and recovery.
- The design must also account for security events: credential compromise, a
  stolen device, or a suspicious login should be able to kill sessions
  immediately, which is only possible if the system retains enough server-side
  state to enumerate and invalidate tokens.

### Q: How do you issue and validate session tokens?

**A:** Tokens should be opaque random strings with at least 256 bits of entropy,
generated from a cryptographic random source.

- The raw token is returned to the client exactly once, while only its hash is
  persisted, so a database breach does not leak usable tokens.
- A standard format is a versioned identifier plus a random payload, which lets
  the validator route to the right signing or hashing scheme as the system
  evolves.
- Optionally, an encrypted JWT can carry claims like user ID and expiry so
  validation can be done without a lookup, at the cost of revocation difficulty.

Validation walks a defined order.

- First the token is parsed and structurally checked, then its signature or hash
  is verified, then the expiry is compared against the current time, then the
  session record is located and checked for revocation.
- A cache in front of the store lets repeated requests from the same session
  skip the database read; the cache entry stores the revocation state so a
  revoke can bust or invalidate it.
- All validation failures are logged with a reason code so engineers can
  distinguish expired, malformed, revoked, and unknown tokens.

The issuance side must be idempotent and auditable.

- A login creates one session and returns one token; retries should not stack
  multiple active sessions unless the policy allows it.
- Issuance should also rotate the token on promotion, for example when a session
  is upgraded after step-up authentication.
- Because tokens are bearer credentials, they are sent over TLS only, stored
  client-side in a secure mechanism, and validated with a constant-time
  comparison to resist timing attacks.

### Q: How do you support multiple devices?

**A:** Multiple devices are modeled as multiple sessions for the same user, each keyed
by a device identifier provided at login.

- The device registry records the device name, platform, last-seen time, and the
  sessions currently active on it, giving users a management UI that lists what
  is signed in and lets them act on a single device.
- Sessions are independent, so one device logging out never affects another, but
  the system can still apply global policies such as a maximum number of active
  sessions per account.

Consistency between the device registry and the session store must be
maintained.

- When a device is removed, all its sessions should be revoked; when a session
  expires, the registry entry is updated or marked stale.
- A background sweep reconciles the two views, because devices can vanish
  without a clean logout.
- Each login should also generate a security notification to the other devices
  so a user can recognize an unexpected new login immediately.

The device model also enables step-up behavior.

- A new device often needs extra verification, such as an email code, before it
  can access high-value actions.
- The session record can carry a trust level, and the gateway can escalate or
  downgrade requests based on that level.
- Storing device context on the session also powers analytics and anomaly
  detection, since a session that suddenly appears from a different IP or
  platform is a strong signal of a stolen token.
- Device metadata feeds security scoring, so a session from a known device that
  starts behaving from an unfamiliar network can be challenged before it is
  trusted for sensitive operations.

### Q: How do you revoke sessions remotely?

**A:** Remote revocation requires server-side state, because a stateless token cannot
be unissued after it leaves the server.

- The revocation component marks the session record as invalid in the store and
  invalidates the corresponding cache entry, so the next validation attempt
  fails immediately.
- For a single-device revoke, the record is updated in place; for a full
  logout-everywhere, all sessions belonging to the user are enumerated and
  invalidated in one batch.

Revocation has to propagate fast.

- If validation reads from a cache and the revoke only touches the durable
  store, clients could keep using a revoked token until the cache entry expires.
- The standard solution is to delete or overwrite the cache key on revoke, or to
  hold a small per-user revocation generation number in the token validation
  path so that a bump invalidates all sessions at once.
- The revoke operation itself must be idempotent and race-free against
  concurrent validations.
- Revocation is part of the release tests: an integration test logs in on
  several devices, revokes one, and asserts the token is rejected on the next
  request while the others keep working.

Remote revocation also covers device removal, password changes, and breach
responses.

- Changing a password should revoke all sessions except the current one, and a
  support ticket can force a full reset.
- Every revoke is written to an audit trail with the actor, the target, and a
  reason, because revocation requests from customer support are themselves a
  liability surface.
- Finally, the token is not just marked dead server-side; the client is told to
  discard it, and a session that surfaces after revocation is treated as a
  security event.

### Q: How do you handle session expiry?

**A:** Sessions carry an absolute lifetime and an inactivity timeout, and both are
enforced by the validator.

- The inactivity timeout, often called sliding expiry, is refreshed whenever the
  session is used within its window, which keeps active users signed in while
  dropping idle sessions.
- The absolute lifetime caps how long any session can live regardless of
  activity, forcing a re-login on a schedule that balances security against
  convenience.
- Expiry values should be configurable per policy, with higher-risk contexts
  getting shorter windows.

Expiry is enforced lazily at validation time and eagerly by a sweeper.

- Every session row stores its expiry timestamp, and validation rejects anything
  past it, returning a distinct "session expired" error so the client can
  trigger a refresh flow.
- A periodic background job expires rows in bulk and removes stale device
  registry entries, keeping the tables from growing without bound.
- This combination avoids a write on every request while still reclaiming
  storage.

A renewal flow keeps the user experience smooth.

- When a session is near expiry, the client can call a refresh endpoint that
  validates the current token, issues a new one, and invalidates the old one,
  preferably using rotation so a stolen old token cannot be replayed after
  renewal.
- Renewal itself is rate limited and audited.
- Expiry must never be silently bypassed by a cache that was populated before
  the deadline, so the validator compares the stored expiry against the clock on
  every authoritative check.
- Clock skew between the session service and the validator can cause premature
  or late expiry, so the system relies on a single authoritative clock source
  and monitors skew across regions.

## Source

```text
title: Session Service
node user: User [round, icon=browser]
node app: Client App [icon=browser]
node gateway: API Gateway [icon=server]
node login: Login Service [icon=shield]
node session: Session Service [icon=compute]
node issue: Token Issuer [icon=compute]
node store: Session Store [cylinder, icon=cache]
node validate: Session Validator [icon=compute]
node device: Device Registry [icon=compute]
node revoke: Revocation [icon=shield]
node db: Sessions DB [cylinder, icon=database]

edge user -> app: login
edge app -> gateway: authenticate
edge gateway -> login: verify
edge login -> session: create
edge session -> issue: token
edge issue -> store: save
edge app -> gateway: request
edge gateway -> validate: check
edge validate -> store: lookup
edge user -> app: revoke
edge revoke -> db: invalidate
```
