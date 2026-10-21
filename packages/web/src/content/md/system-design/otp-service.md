# OTP Service

Design a one-time password service

**Difficulty:** Medium

**Tags:** auth, infra, security

## Functional Requirements

- a one-time password service
- generate secure OTP codes?
- deliver codes across channels?
- prevent brute force?
- handle resend and expiry?

## Non-Functional Requirements

- Delivery is abstracted behind a channel interface so the same code can go out
  over SMS, email, push, or a voice call.

- Each channel is backed by one or more providers with their own quirks: SMS has
  strict per-number and per-shortcode throughput limits, email is cheap but slow
  and can land in spam, and push requires a registered device token.
- The delivery service picks a channel based on availability, cost, user
  preference, and the sensitivity of the operation, then records the attempt and
  its provider response in the audit log.

Reliability matters more than speed for delivery.

- Provider calls can time out or return undeliverable, so the send path should
  be idempotent: re-sending the same logical attempt must not mint a new code.
- A retry with exponential backoff and a provider failover list ensures a code
  still reaches the user when the primary carrier is degraded.
- Delivery confirmation should be asynchronous, with the provider acknowledgment
  updating a delivery status table rather than blocking the request.

Multi-channel support also changes the abuse surface.

- SMS is expensive and subject to toll fraud, so the service must enforce hard
  caps per phone number, per sender, and globally per window.
- Email delivery needs sender reputation management, including warm-up, domain
  alignment, and bounce handling.
- The choice of channel should also be user-confirmable, and any
  channel-specific identifier, like a phone number, must be validated and
  normalized before it is used for anything.
- Providers should be treated as untrusted: the service verifies that the
  address the code went to matches the one the user registered, and it never
  echoes the code back through the same channel it was sent on..
- Brute force protection operates on two fronts: limiting the number of guess
  attempts and limiting how many codes can be generated.

- The verification service keeps a per-identifier counter of failed attempts,
  and once the threshold is reached the code is invalidated and further attempts
  are rejected until the user starts a fresh flow.
- The limiter also caps codes per identifier and per client IP per hour so an
  attacker cannot simply reissue codes to get new guesses at a cheap rate.

Sliding-window rate limiting, implemented in a fast in-memory store such as
Redis with keys that expire, handles the hot path with low latency, while a
durable counter in the OTP store provides an authoritative backstop for
accounting.

- Because both the generation and verification paths are throttled, an attacker
  cannot amplify a single compromised channel into unbounded guessing.
- Lockout events and the client IP should be written to the audit log so
  patterns can be detected across many accounts.
- The limiter should budget SMS, email, and verification separately, because an
  attacker who exhausts one channel should not gain headroom in another.

Defense-in-depth matters even when guessing is slow.

- Codes should be useless once the TTL expires, so the guessing window is
  bounded.
- For high-value operations the system can require a second factor, delay
  verification behind a CAPTCHA after repeated failures, or force a cooldown
  before the next code can be requested.
- Since numeric codes are only six digits of entropy, the real protection is the
  combination of short expiry, attempt limits, and throttling, not the length of
  the code itself..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: OTP Service
user: User
app: Mobile App
gateway: API Gateway
otp: OTP Service
gen: Code Generator
send: Delivery Service
verify: Verification Service
rate: Rate Limiter
provider: SMS / Email
audit: Audit Log
db: OTP Store

user ─► app ─► request code
app ─► gateway ─► send
gateway ─► otp ─► generate
otp ─► gen ─► code
gen ─► rate ─► check
rate ─► send ─► deliver
send ─► provider ─► transmit
user ─► app ─► enter code
gateway ─► verify ─► validate
verify ─► db ─► check
otp ─► audit ─► log
```

## Design

### Design a one-time password service

A one-time password service generates a short-lived secret, delivers it to a
user through some out-of-band channel, and then validates the code the user
returns before allowing a sensitive operation such as login or a transaction.

- The core components are a code generator, a delivery layer that talks to SMS
  and email providers, a verification service that checks submitted codes, and a
  rate limiter that protects every stage of the flow.
- All activity is written to an audit log so that abuse and delivery failures
  can be investigated later.
- The OTP store holds the code, its hash, the target identifier, an expiry
  timestamp, and the number of failed attempts.

The flow starts when the client requests a code.

- The gateway forwards the request to the OTP service, which asks the generator
  for a fresh code, checks the rate limiter, and hands the code to the delivery
  service for transmission over the chosen channel.
- When the user enters a code, the gateway routes it to the verification
  service, which compares the submission against the stored, hashed value and
  returns an accept or reject decision.
- Because codes are single-use, a successful verification must atomically
  invalidate the code so that replaying it fails.

The critical concerns are security and abuse resistance.

- Codes must be cryptographically random, never stored in plaintext, and valid
  for only a few minutes.
- Every endpoint needs rate limiting, because the same identifier can be used to
  hammer delivery costs or brute force a code.
- The system must also tolerate channel failure gracefully: if the SMS provider
  is down, delivery should retry, fall back to email, or surface a controlled
  error instead of leaving the user stuck with a silent failure.

### How do you generate secure OTP codes?

The generator should use a cryptographically secure random number source, never
a predictable seed such as a timestamp or a counter.

- For numeric codes of six digits, you derive the value from secure random bytes
  and reject any value outside the valid range so the distribution stays
  uniform.
- Storing only a salted hash of the code rather than the plaintext limits the
  damage if the store is breached, though it does complicate hashing of numeric
  codes, which have low entropy and are easy to brute force offline unless a
  per-code random salt is used.

You should also keep the same code unique across delivery attempts so that a
repeated request produces a different value.

- This prevents an attacker from pre-empting a resend to see the old value
  echoed back.
- Codes must be short-lived; a typical time-to-live is three to five minutes,
  which balances usability against the window an attacker has to guess.
- Store the expiry with the hash and have the verification path reject any code
  older than the TTL.
- Record the generation timestamp and chosen channel alongside the code so
  support can diagnose a late delivery, and treat a code that was requested but
  never acknowledged by the provider as a distinct state in monitoring.

Finally, generation must be coupled to rate limiting.

- Without a cap on how many codes can be generated per identifier per hour, an
  attacker can repeatedly trigger deliveries, exhausting your messaging budget
  or annoying the user, and each code gives them another guessing attempt.
- A per-identifier and per-IP budget is checked before generation and before
  delivery so that both the generator and the messaging channel are protected.

### How do you deliver codes across channels?

Delivery is abstracted behind a channel interface so the same code can go out
over SMS, email, push, or a voice call.

- Each channel is backed by one or more providers with their own quirks: SMS has
  strict per-number and per-shortcode throughput limits, email is cheap but slow
  and can land in spam, and push requires a registered device token.
- The delivery service picks a channel based on availability, cost, user
  preference, and the sensitivity of the operation, then records the attempt and
  its provider response in the audit log.

Reliability matters more than speed for delivery.

- Provider calls can time out or return undeliverable, so the send path should
  be idempotent: re-sending the same logical attempt must not mint a new code.
- A retry with exponential backoff and a provider failover list ensures a code
  still reaches the user when the primary carrier is degraded.
- Delivery confirmation should be asynchronous, with the provider acknowledgment
  updating a delivery status table rather than blocking the request.

Multi-channel support also changes the abuse surface.

- SMS is expensive and subject to toll fraud, so the service must enforce hard
  caps per phone number, per sender, and globally per window.
- Email delivery needs sender reputation management, including warm-up, domain
  alignment, and bounce handling.
- The choice of channel should also be user-confirmable, and any
  channel-specific identifier, like a phone number, must be validated and
  normalized before it is used for anything.
- Providers should be treated as untrusted: the service verifies that the
  address the code went to matches the one the user registered, and it never
  echoes the code back through the same channel it was sent on.

### How do you prevent brute force?

Brute force protection operates on two fronts: limiting the number of guess
attempts and limiting how many codes can be generated.

- The verification service keeps a per-identifier counter of failed attempts,
  and once the threshold is reached the code is invalidated and further attempts
  are rejected until the user starts a fresh flow.
- The limiter also caps codes per identifier and per client IP per hour so an
  attacker cannot simply reissue codes to get new guesses at a cheap rate.

Sliding-window rate limiting, implemented in a fast in-memory store such as
Redis with keys that expire, handles the hot path with low latency, while a
durable counter in the OTP store provides an authoritative backstop for
accounting.

- Because both the generation and verification paths are throttled, an attacker
  cannot amplify a single compromised channel into unbounded guessing.
- Lockout events and the client IP should be written to the audit log so
  patterns can be detected across many accounts.
- The limiter should budget SMS, email, and verification separately, because an
  attacker who exhausts one channel should not gain headroom in another.

Defense-in-depth matters even when guessing is slow.

- Codes should be useless once the TTL expires, so the guessing window is
  bounded.
- For high-value operations the system can require a second factor, delay
  verification behind a CAPTCHA after repeated failures, or force a cooldown
  before the next code can be requested.
- Since numeric codes are only six digits of entropy, the real protection is the
  combination of short expiry, attempt limits, and throttling, not the length of
  the code itself.

### How do you handle resend and expiry?

Resend is the most abused operation in an OTP service, so it must be gated by
its own rate limits, separate from generation and verification.

- Each resend should reuse the same logical request but must never reuse the
  same code, to avoid the "I know the old value" attack.
- If the original delivery actually succeeded, a resend is wasted cost; if it
  failed, the service should prefer to retry the failed channel or fail over to
  another before minting a new send.

Expiry is enforced in both the data and the validation paths.

- Every stored code carries a TTL, and verification rejects codes that have
  lapsed regardless of whether the user typed them correctly.
- A background sweep, or lazy expiration on read, removes stale rows so the
  store does not grow without bound.
- When a code expires, the user must be able to request a new one, which again
  goes through the generator and the rate limiter.

The user experience around expiry should be explicit and recoverable.

- If the user submits an expired code, the response should distinguish "wrong
  code" from "code expired" so the client can trigger a resend automatically
  instead of asking the user to retype.
- State transitions, including every resend, delivery ack, expiry, and
  verification, belong in the audit log, which also gives operations a trail for
  debugging why a particular user never received their code.
- The log should record the reason for every resend and expiry event, so support
  has a complete picture when a user reports a code that silently never arrived.

## Source

```text
title: OTP Service
node user: User [round, icon=browser]
node app: Mobile App [icon=browser]
node gateway: API Gateway [icon=server]
node otp: OTP Service [icon=compute]
node gen: Code Generator [icon=compute]
node send: Delivery Service [icon=mail]
node verify: Verification Service [icon=shield]
node rate: Rate Limiter [icon=cache]
node provider: SMS / Email [icon=cloud]
node audit: Audit Log [icon=file]
node db: OTP Store [cylinder, icon=database]

edge user -> app: request code
edge app -> gateway: send
edge gateway -> otp: generate
edge otp -> gen: code
edge gen -> rate: check
edge rate -> send: deliver
edge send -> provider: transmit
edge user -> app: enter code
edge gateway -> verify: validate
edge verify -> db: check
edge otp -> audit: log
```

## Q&A

### Q: Design a one-time password service

**A:** A one-time password service generates a short-lived secret, delivers it to a
user through some out-of-band channel, and then validates the code the user
returns before allowing a sensitive operation such as login or a transaction.

- The core components are a code generator, a delivery layer that talks to SMS
  and email providers, a verification service that checks submitted codes, and a
  rate limiter that protects every stage of the flow.
- All activity is written to an audit log so that abuse and delivery failures
  can be investigated later.
- The OTP store holds the code, its hash, the target identifier, an expiry
  timestamp, and the number of failed attempts.

The flow starts when the client requests a code.

- The gateway forwards the request to the OTP service, which asks the generator
  for a fresh code, checks the rate limiter, and hands the code to the delivery
  service for transmission over the chosen channel.
- When the user enters a code, the gateway routes it to the verification
  service, which compares the submission against the stored, hashed value and
  returns an accept or reject decision.
- Because codes are single-use, a successful verification must atomically
  invalidate the code so that replaying it fails.

The critical concerns are security and abuse resistance.

- Codes must be cryptographically random, never stored in plaintext, and valid
  for only a few minutes.
- Every endpoint needs rate limiting, because the same identifier can be used to
  hammer delivery costs or brute force a code.
- The system must also tolerate channel failure gracefully: if the SMS provider
  is down, delivery should retry, fall back to email, or surface a controlled
  error instead of leaving the user stuck with a silent failure.

### Q: How do you generate secure OTP codes?

**A:** The generator should use a cryptographically secure random number source, never
a predictable seed such as a timestamp or a counter.

- For numeric codes of six digits, you derive the value from secure random bytes
  and reject any value outside the valid range so the distribution stays
  uniform.
- Storing only a salted hash of the code rather than the plaintext limits the
  damage if the store is breached, though it does complicate hashing of numeric
  codes, which have low entropy and are easy to brute force offline unless a
  per-code random salt is used.

You should also keep the same code unique across delivery attempts so that a
repeated request produces a different value.

- This prevents an attacker from pre-empting a resend to see the old value
  echoed back.
- Codes must be short-lived; a typical time-to-live is three to five minutes,
  which balances usability against the window an attacker has to guess.
- Store the expiry with the hash and have the verification path reject any code
  older than the TTL.
- Record the generation timestamp and chosen channel alongside the code so
  support can diagnose a late delivery, and treat a code that was requested but
  never acknowledged by the provider as a distinct state in monitoring.

Finally, generation must be coupled to rate limiting.

- Without a cap on how many codes can be generated per identifier per hour, an
  attacker can repeatedly trigger deliveries, exhausting your messaging budget
  or annoying the user, and each code gives them another guessing attempt.
- A per-identifier and per-IP budget is checked before generation and before
  delivery so that both the generator and the messaging channel are protected.

### Q: How do you deliver codes across channels?

**A:** Delivery is abstracted behind a channel interface so the same code can go out
over SMS, email, push, or a voice call.

- Each channel is backed by one or more providers with their own quirks: SMS has
  strict per-number and per-shortcode throughput limits, email is cheap but slow
  and can land in spam, and push requires a registered device token.
- The delivery service picks a channel based on availability, cost, user
  preference, and the sensitivity of the operation, then records the attempt and
  its provider response in the audit log.

Reliability matters more than speed for delivery.

- Provider calls can time out or return undeliverable, so the send path should
  be idempotent: re-sending the same logical attempt must not mint a new code.
- A retry with exponential backoff and a provider failover list ensures a code
  still reaches the user when the primary carrier is degraded.
- Delivery confirmation should be asynchronous, with the provider acknowledgment
  updating a delivery status table rather than blocking the request.

Multi-channel support also changes the abuse surface.

- SMS is expensive and subject to toll fraud, so the service must enforce hard
  caps per phone number, per sender, and globally per window.
- Email delivery needs sender reputation management, including warm-up, domain
  alignment, and bounce handling.
- The choice of channel should also be user-confirmable, and any
  channel-specific identifier, like a phone number, must be validated and
  normalized before it is used for anything.
- Providers should be treated as untrusted: the service verifies that the
  address the code went to matches the one the user registered, and it never
  echoes the code back through the same channel it was sent on.

### Q: How do you prevent brute force?

**A:** Brute force protection operates on two fronts: limiting the number of guess
attempts and limiting how many codes can be generated.

- The verification service keeps a per-identifier counter of failed attempts,
  and once the threshold is reached the code is invalidated and further attempts
  are rejected until the user starts a fresh flow.
- The limiter also caps codes per identifier and per client IP per hour so an
  attacker cannot simply reissue codes to get new guesses at a cheap rate.

Sliding-window rate limiting, implemented in a fast in-memory store such as
Redis with keys that expire, handles the hot path with low latency, while a
durable counter in the OTP store provides an authoritative backstop for
accounting.

- Because both the generation and verification paths are throttled, an attacker
  cannot amplify a single compromised channel into unbounded guessing.
- Lockout events and the client IP should be written to the audit log so
  patterns can be detected across many accounts.
- The limiter should budget SMS, email, and verification separately, because an
  attacker who exhausts one channel should not gain headroom in another.

Defense-in-depth matters even when guessing is slow.

- Codes should be useless once the TTL expires, so the guessing window is
  bounded.
- For high-value operations the system can require a second factor, delay
  verification behind a CAPTCHA after repeated failures, or force a cooldown
  before the next code can be requested.
- Since numeric codes are only six digits of entropy, the real protection is the
  combination of short expiry, attempt limits, and throttling, not the length of
  the code itself.

### Q: How do you handle resend and expiry?

**A:** Resend is the most abused operation in an OTP service, so it must be gated by
its own rate limits, separate from generation and verification.

- Each resend should reuse the same logical request but must never reuse the
  same code, to avoid the "I know the old value" attack.
- If the original delivery actually succeeded, a resend is wasted cost; if it
  failed, the service should prefer to retry the failed channel or fail over to
  another before minting a new send.

Expiry is enforced in both the data and the validation paths.

- Every stored code carries a TTL, and verification rejects codes that have
  lapsed regardless of whether the user typed them correctly.
- A background sweep, or lazy expiration on read, removes stale rows so the
  store does not grow without bound.
- When a code expires, the user must be able to request a new one, which again
  goes through the generator and the rate limiter.

The user experience around expiry should be explicit and recoverable.

- If the user submits an expired code, the response should distinguish "wrong
  code" from "code expired" so the client can trigger a resend automatically
  instead of asking the user to retype.
- State transitions, including every resend, delivery ack, expiry, and
  verification, belong in the audit log, which also gives operations a trail for
  debugging why a particular user never received their code.
- The log should record the reason for every resend and expiry event, so support
  has a complete picture when a user reports a code that silently never arrived.

## Source

```text
title: OTP Service
node user: User [round, icon=browser]
node app: Mobile App [icon=browser]
node gateway: API Gateway [icon=server]
node otp: OTP Service [icon=compute]
node gen: Code Generator [icon=compute]
node send: Delivery Service [icon=mail]
node verify: Verification Service [icon=shield]
node rate: Rate Limiter [icon=cache]
node provider: SMS / Email [icon=cloud]
node audit: Audit Log [icon=file]
node db: OTP Store [cylinder, icon=database]

edge user -> app: request code
edge app -> gateway: send
edge gateway -> otp: generate
edge otp -> gen: code
edge gen -> rate: check
edge rate -> send: deliver
edge send -> provider: transmit
edge user -> app: enter code
edge gateway -> verify: validate
edge verify -> db: check
edge otp -> audit: log
```
