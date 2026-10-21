# Voting System

Design a voting system

**Difficulty:** Hard

**Tags:** auth, security, voting

## Functional Requirements

- a voting system
- prevent double voting?
- keep ballots anonymous yet verifiable?
- tally votes accurately?
- handle partial failures?

## Non-Functional Requirements

- Highly available
- Low latency
- Horizontally scalable

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Voting System
voter: Voter
app: Voting Portal
gateway: API Gateway
auth: Voter Auth
ballot: Ballot Service
vote: Vote Recording
ledger: Immutable Ledger
tally: Tally Engine
audit: Audit Trail
result: Results Service
db: Votes DB

voter ─► app ─► login
app ─► gateway ─► verify
gateway ─► auth ─► check
voter ─► app ─► cast
gateway ─► ballot ─► submit
ballot ─► vote ─► record
vote ─► ledger ─► append
vote ─► tally ─► aggregate
tally ─► result ─► publish
vote ─► audit ─► log
ballot ─► db ─► store
```

## Design

### Design a voting system

A voting system is an exercise in integrity first and performance second.

- I would build it around voter auth, a ballot service, vote recording, an
  immutable ledger, and a tally engine.
- Voter auth establishes identity against the voter roll.
- The ballot service presents the correct ballot for the voter's jurisdiction.
- Vote recording commits the cast ballot.
- The ledger stores an append-only record for audit.
- The tally engine aggregates results.
- An audit trail logs every system event, and a results service publishes
  outcomes.
- A votes database is the system of record, with the ledger as its integrity
  backstop.

The flow separates identity from the ballot.

- The voter logs in through the portal.
- The gateway delegates to voter auth.
- A successful check returns a one-time ballot token.
- The voter then casts through a separate call, so the ballot submission carries
  a token rather than the voter's identity.
- The ballot service validates the token and ballot.
- Vote recording commits the choices.
- The ledger appends a signed record.
- The tally engine aggregates asynchronously, and the audit trail records the
  event.
- Because the token ties a single voter to a single ballot session, double
  voting is prevented at the entry point, not by scanning votes.

The central tradeoff is anonymity against verifiability.

- Voters must trust the system produced a fair tally, and that requires
  independent verification.
- The system must never reveal how any individual voted.
- The design resolves this by separating the secret ballot from the
  tamper-evident audit log: the ledger proves the collection was append-only and
  the tally was computed from it.
- Cryptographic techniques such as commit-and-reveal or mixnets hide individual
  choices.
- Every component is deterministic and replayable, so any independent party can
  recompute the tally from the recorded data.

### How do you prevent double voting?

Double voting is prevented at the identity boundary before any ballot is cast.

- Voter auth checks the voter roll and issues a single-use ballot token for the
  election.
- The token is stored with a state, and casting atomically transitions it from
  issued to consumed.
- I would enforce this with a conditional update in a transactional store: the
  token row is updated from issued to cast only if it is still issued.
- A second attempt fails even under concurrency.
- The token is bound to the specific election and jurisdiction.
- It cannot be reused across races or replayed in a later session.

Tightening that single-use token is not enough on its own.

- The same person might register twice or vote by mail and online.
- The voter roll is the source of truth: voter auth looks up the canonical voter
  record.
- Any prior ballot in the election, by any channel, marks the record as already
  voted.
- I would implement idempotency at the voting session level, so a network retry
  of the same cast request returns the same confirmation instead of casting
  again.
- A voter who submits twice is recorded once.
- The system keeps the first valid ballot and flags the duplicate for the audit
  trail.

Coordination across channels is the hardest part.

- Mail, in-person, and online voting must share one record.
- The election system is a distributed transaction across the channels with the
  voter record as the arbiter.
- I would also enforce device and session constraints: one active session per
  voter, session expiry, and lockout after suspicious reuse.
- Cross-channel duplicates that somehow occur are resolved by the election board
  through the audit trail.
- The audit trail preserves the first accepted ballot and logs the conflict.
- The tradeoff is strictness against usability; the single-use token makes abuse
  hard while keeping the online ballot flow a short, one-shot interaction.

### How do you keep ballots anonymous yet verifiable?

Anonymity and verifiability pull in opposite directions, and the design
separates them with cryptography.

- The ballot service records each vote in two forms: a secret form that hides
  the choice and a public form that proves a valid vote was included.
- One standard construction is a commitment: the voter's choice is committed
  with a random blinding factor.
- The commitment is appended to the public ledger.
- The choice itself is stored separately under the ballot token.
- Anyone can verify the commitment is well-formed, but no one can read the
  choice from the ledger.
- After tallying, voters can check that their commitment was counted without
  revealing it.

A mixnet or homomorphic aggregation takes this further.

- With a mixnet, ballots pass through a series of mixing servers that reorder
  and re-encrypt them, breaking the link between voter and ballot while proving
  each step was correct.
- With homomorphic tallying, votes are encrypted such that the sum can be
  computed without decrypting individual votes.
- A zero-knowledge proof demonstrates the aggregate was computed from the stored
  ciphertexts.
- I would choose the approach by the threat model.
- Homomorphic tallying is efficient for simple yes/no or ranking elections.
- A mixnet handles arbitrary ballot formats.

The voter-facing verification is a verification code derived from the committed
ballot.

- After casting, the voter receives a code they can use later to confirm their
  ballot appears in the ledger.
- The system must not beable to associate that code with the voter's identity,
  so the code is derived from the ballot token which is itself unlinkable to the
  voter record.
- The tradeoff is that any verification scheme leaks a small amount of
  information.
- The design must also prevent coercion, where a voter is forced to prove how
  they voted.
- The verification scheme therefore lets the voter generate a code for a
  simulated ballot as well as a real one, giving them a plausible deniability
  story.

### How do you tally votes accurately?

Accurate tallying starts with an unambiguous record of every ballot and a
deterministic aggregation that anyone can reproduce.

- Each ballot is recorded in the votes database with the full audit chain.
- The tally engine reads the recorded ballots, not live traffic, so counting
  happens after the election closes.
- I would make the tally a pure function of the recorded ballots and the
  election configuration.
- The same inputs produce the same result on any machine.
- The tally engine validates each ballot against the ballot definition before
  counting.
- It rejects malformed ballots and flags them for the audit trail rather than
  silently discarding them.

The vote recording layer and the tally engine can disagree, so the design
reconciles them.

- A reconciliation job compares the ledger against the votes database after the
  close of polls.
- It verifies that every ledger entry has a matching database record and vice
  versa.
- Discrepancies are surfaced to the election board, because in an election a
  single lost or duplicated ballot matters.
- I would also produce a risk-limiting audit sample: a statistical sample of
  ballots is manually or independently recounted and compared against the
  system's records.
- The sample size is chosen so the audit has a high probability of catching a
  wrong outcome.

Verification of the tally itself is part of the design.

- For homomorphic schemes, a zero-knowledge proof accompanies the aggregate.
- For plaintext tallies, the tally is recomputed independently by a second
  process and the results compared.
- The tally engine is deterministic and versioned, so a software change between
  elections does not break comparability.
- Results are published with the aggregate plus proof artifacts.
- The tally is computed at multiple granularities (state, district, precinct) so
  independent parties can cross-check subtotals.
- The tradeoff is compute and complexity for integrity.
- An election tallied twice with proofs is far more defensible than one tallied
  once with no way to verify.

### How do you handle partial failures?

Elections cannot have a maintenance window, so the system must fail partially
without failing the election.

- Every write path is backed by durable storage and retried: ballot cast, ledger
  append, and audit log write are queued as transactional units.
- I would make the ballot cast atomic and idempotent.
- A retry after a timeout either completes the same cast or returns the existing
  confirmation, never a duplicate ballot.
- The ledger and the votes database are written through a transaction log.
- A crash after one succeeds but not the other is recoverable by replaying the
  log in order.

Component isolation determines blast radius.

- The online portal, the tally engine, and the results service are independently
  deployable.
- A tally outage during the voting window does not stop voters from casting.
- State is separated by function: ballot tokens live in one store, ballots in
  another, and the ledger in a third.
- A degraded subsystem does not take the whole election down.
- I would run the platform across multiple availability zones and treat the
  ledger as the recovery point.
- Any component can be rebuilt from it because the ledger is append-only and
  complete.

Partial failures during a live election need a human decision path, not just
automation.

- An anomaly such as an unrecovered ballot or an unreconcilable ledger entry is
  quarantined and escalated to the election board with full context.
- Some failures are resolved by procedure rather than by retry.
- The system logs every event with an event id that tracks across components.
- An operator can reconstruct the lifecycle of any ballot.
- A full drill and disaster-recovery runbook is tested before the election.
- Failure modes that are known and rehearsed are far less damaging than ones
  discovered live.
- The tradeoff is that the redundancy costs money and complexity, which is the
  correct price for an election that must complete correctly under any partial
  failure.

## Source

```text
title: Voting System
node voter: Voter [round, icon=browser]
node app: Voting Portal [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Voter Auth [icon=shield]
node ballot: Ballot Service [icon=compute]
node vote: Vote Recording [icon=compute]
node ledger: Immutable Ledger [cylinder, icon=database]
node tally: Tally Engine [icon=compute]
node audit: Audit Trail [icon=file]
node result: Results Service [icon=search]
node db: Votes DB [cylinder, icon=database]

edge voter -> app: login
edge app -> gateway: verify
edge gateway -> auth: check
edge voter -> app: cast
edge gateway -> ballot: submit
edge ballot -> vote: record
edge vote -> ledger: append
edge vote -> tally: aggregate
edge tally -> result: publish
edge vote -> audit: log
edge ballot -> db: store
```

## Q&A

### Q: Design a voting system

**A:** A voting system is an exercise in integrity first and performance second.

- I would build it around voter auth, a ballot service, vote recording, an
  immutable ledger, and a tally engine.
- Voter auth establishes identity against the voter roll.
- The ballot service presents the correct ballot for the voter's jurisdiction.
- Vote recording commits the cast ballot.
- The ledger stores an append-only record for audit.
- The tally engine aggregates results.
- An audit trail logs every system event, and a results service publishes
  outcomes.
- A votes database is the system of record, with the ledger as its integrity
  backstop.

The flow separates identity from the ballot.

- The voter logs in through the portal.
- The gateway delegates to voter auth.
- A successful check returns a one-time ballot token.
- The voter then casts through a separate call, so the ballot submission carries
  a token rather than the voter's identity.
- The ballot service validates the token and ballot.
- Vote recording commits the choices.
- The ledger appends a signed record.
- The tally engine aggregates asynchronously, and the audit trail records the
  event.
- Because the token ties a single voter to a single ballot session, double
  voting is prevented at the entry point, not by scanning votes.

The central tradeoff is anonymity against verifiability.

- Voters must trust the system produced a fair tally, and that requires
  independent verification.
- The system must never reveal how any individual voted.
- The design resolves this by separating the secret ballot from the
  tamper-evident audit log: the ledger proves the collection was append-only and
  the tally was computed from it.
- Cryptographic techniques such as commit-and-reveal or mixnets hide individual
  choices.
- Every component is deterministic and replayable, so any independent party can
  recompute the tally from the recorded data.

### Q: How do you prevent double voting?

**A:** Double voting is prevented at the identity boundary before any ballot is cast.

- Voter auth checks the voter roll and issues a single-use ballot token for the
  election.
- The token is stored with a state, and casting atomically transitions it from
  issued to consumed.
- I would enforce this with a conditional update in a transactional store: the
  token row is updated from issued to cast only if it is still issued.
- A second attempt fails even under concurrency.
- The token is bound to the specific election and jurisdiction.
- It cannot be reused across races or replayed in a later session.

Tightening that single-use token is not enough on its own.

- The same person might register twice or vote by mail and online.
- The voter roll is the source of truth: voter auth looks up the canonical voter
  record.
- Any prior ballot in the election, by any channel, marks the record as already
  voted.
- I would implement idempotency at the voting session level, so a network retry
  of the same cast request returns the same confirmation instead of casting
  again.
- A voter who submits twice is recorded once.
- The system keeps the first valid ballot and flags the duplicate for the audit
  trail.

Coordination across channels is the hardest part.

- Mail, in-person, and online voting must share one record.
- The election system is a distributed transaction across the channels with the
  voter record as the arbiter.
- I would also enforce device and session constraints: one active session per
  voter, session expiry, and lockout after suspicious reuse.
- Cross-channel duplicates that somehow occur are resolved by the election board
  through the audit trail.
- The audit trail preserves the first accepted ballot and logs the conflict.
- The tradeoff is strictness against usability; the single-use token makes abuse
  hard while keeping the online ballot flow a short, one-shot interaction.

### Q: How do you keep ballots anonymous yet verifiable?

**A:** Anonymity and verifiability pull in opposite directions, and the design
separates them with cryptography.

- The ballot service records each vote in two forms: a secret form that hides
  the choice and a public form that proves a valid vote was included.
- One standard construction is a commitment: the voter's choice is committed
  with a random blinding factor.
- The commitment is appended to the public ledger.
- The choice itself is stored separately under the ballot token.
- Anyone can verify the commitment is well-formed, but no one can read the
  choice from the ledger.
- After tallying, voters can check that their commitment was counted without
  revealing it.

A mixnet or homomorphic aggregation takes this further.

- With a mixnet, ballots pass through a series of mixing servers that reorder
  and re-encrypt them, breaking the link between voter and ballot while proving
  each step was correct.
- With homomorphic tallying, votes are encrypted such that the sum can be
  computed without decrypting individual votes.
- A zero-knowledge proof demonstrates the aggregate was computed from the stored
  ciphertexts.
- I would choose the approach by the threat model.
- Homomorphic tallying is efficient for simple yes/no or ranking elections.
- A mixnet handles arbitrary ballot formats.

The voter-facing verification is a verification code derived from the committed
ballot.

- After casting, the voter receives a code they can use later to confirm their
  ballot appears in the ledger.
- The system must not beable to associate that code with the voter's identity,
  so the code is derived from the ballot token which is itself unlinkable to the
  voter record.
- The tradeoff is that any verification scheme leaks a small amount of
  information.
- The design must also prevent coercion, where a voter is forced to prove how
  they voted.
- The verification scheme therefore lets the voter generate a code for a
  simulated ballot as well as a real one, giving them a plausible deniability
  story.

### Q: How do you tally votes accurately?

**A:** Accurate tallying starts with an unambiguous record of every ballot and a
deterministic aggregation that anyone can reproduce.

- Each ballot is recorded in the votes database with the full audit chain.
- The tally engine reads the recorded ballots, not live traffic, so counting
  happens after the election closes.
- I would make the tally a pure function of the recorded ballots and the
  election configuration.
- The same inputs produce the same result on any machine.
- The tally engine validates each ballot against the ballot definition before
  counting.
- It rejects malformed ballots and flags them for the audit trail rather than
  silently discarding them.

The vote recording layer and the tally engine can disagree, so the design
reconciles them.

- A reconciliation job compares the ledger against the votes database after the
  close of polls.
- It verifies that every ledger entry has a matching database record and vice
  versa.
- Discrepancies are surfaced to the election board, because in an election a
  single lost or duplicated ballot matters.
- I would also produce a risk-limiting audit sample: a statistical sample of
  ballots is manually or independently recounted and compared against the
  system's records.
- The sample size is chosen so the audit has a high probability of catching a
  wrong outcome.

Verification of the tally itself is part of the design.

- For homomorphic schemes, a zero-knowledge proof accompanies the aggregate.
- For plaintext tallies, the tally is recomputed independently by a second
  process and the results compared.
- The tally engine is deterministic and versioned, so a software change between
  elections does not break comparability.
- Results are published with the aggregate plus proof artifacts.
- The tally is computed at multiple granularities (state, district, precinct) so
  independent parties can cross-check subtotals.
- The tradeoff is compute and complexity for integrity.
- An election tallied twice with proofs is far more defensible than one tallied
  once with no way to verify.

### Q: How do you handle partial failures?

**A:** Elections cannot have a maintenance window, so the system must fail partially
without failing the election.

- Every write path is backed by durable storage and retried: ballot cast, ledger
  append, and audit log write are queued as transactional units.
- I would make the ballot cast atomic and idempotent.
- A retry after a timeout either completes the same cast or returns the existing
  confirmation, never a duplicate ballot.
- The ledger and the votes database are written through a transaction log.
- A crash after one succeeds but not the other is recoverable by replaying the
  log in order.

Component isolation determines blast radius.

- The online portal, the tally engine, and the results service are independently
  deployable.
- A tally outage during the voting window does not stop voters from casting.
- State is separated by function: ballot tokens live in one store, ballots in
  another, and the ledger in a third.
- A degraded subsystem does not take the whole election down.
- I would run the platform across multiple availability zones and treat the
  ledger as the recovery point.
- Any component can be rebuilt from it because the ledger is append-only and
  complete.

Partial failures during a live election need a human decision path, not just
automation.

- An anomaly such as an unrecovered ballot or an unreconcilable ledger entry is
  quarantined and escalated to the election board with full context.
- Some failures are resolved by procedure rather than by retry.
- The system logs every event with an event id that tracks across components.
- An operator can reconstruct the lifecycle of any ballot.
- A full drill and disaster-recovery runbook is tested before the election.
- Failure modes that are known and rehearsed are far less damaging than ones
  discovered live.
- The tradeoff is that the redundancy costs money and complexity, which is the
  correct price for an election that must complete correctly under any partial
  failure.

## Source

```text
title: Voting System
node voter: Voter [round, icon=browser]
node app: Voting Portal [icon=browser]
node gateway: API Gateway [icon=server]
node auth: Voter Auth [icon=shield]
node ballot: Ballot Service [icon=compute]
node vote: Vote Recording [icon=compute]
node ledger: Immutable Ledger [cylinder, icon=database]
node tally: Tally Engine [icon=compute]
node audit: Audit Trail [icon=file]
node result: Results Service [icon=search]
node db: Votes DB [cylinder, icon=database]

edge voter -> app: login
edge app -> gateway: verify
edge gateway -> auth: check
edge voter -> app: cast
edge gateway -> ballot: submit
edge ballot -> vote: record
edge vote -> ledger: append
edge vote -> tally: aggregate
edge tally -> result: publish
edge vote -> audit: log
edge ballot -> db: store
```
