# Bot Detection

Design a bot detection system

**Difficulty:** Hard

**Tags:** analytics, security

## Functional Requirements

- a bot detection system
- distinguish bots from humans?
- use behavioral signals?
- scale checks without hurting latency?
- handle CAPTCHA challenges?

## Non-Functional Requirements

- A bot detection system inspects every request and decides whether the actor
  behind it is a human, a legitimate automated client such as a search crawler, or
  a malicious bot.

- The traffic path flows from the Client through the Web App to the API Gateway,
  where the Traffic Analyzer collects the request attributes that are visible at
  the network edge: IP address, headers, TLS fingerprint, and request patterns.
- The Behavioral Signals component adds interaction data, such as mouse
  movements, typing speed, and page navigation, gathered by a small script
  running in the browser.
- The Device Fingerprint service assembles a persistent identifier from browser
  and hardware characteristics, and the Bot Model classifies the combined signal
  set.
- The Blocking Engine then decides what to do, issuing a CAPTCHA challenge to
  borderline clients, and all traffic observations are logged to the Signals DB
  through the Event Queue for offline analysis.

The defining challenge is that the system must make its judgment with no
cooperation from the attacker.

- Bots try to look like humans, so the signals are chosen for properties that
  are hard to fake, such as the subtle timing and randomness of real
  interaction, and the model is trained to detect the differences that matter.
- The system also has to classify the full spectrum: a headless scraper is
  different from a distributed botnet and different again from a user on a
  shared NAT address.
- The design therefore scores on a continuum rather than a binary, and the
  action escalates from observation to challenge to block as confidence grows.

Latency and security pull against each other.

- Every request must be classified quickly enough to sit in the serving path, so
  the scoring is layered: cheap checks run on every request, expensive checks
  run only on suspicious ones.
- The system is built to learn continuously, because bots evolve faster than
  humans, and the Signals DB is the raw material for retraining the model and
  refining the fingerprints.
- The end result is a system that is deliberately conservative in its actions,
  preferring to challenge and observe rather than to block on the first hint of
  doubt..
- The most reliable signals are interaction-based: the way a human moves
  a mouse, the timing of keystrokes, the sequence of elements they hover over, and
  the pauses between actions.

- These traces have a statistical signature that is very difficult for a
  scripted bot to reproduce, because humans are noisy and inconsistent in
  specific, measurable ways.
- The Behavioral Signals service captures these traces from a script in the page
  and computes features such as movement curvature, velocity jitter, and
  inter-keystroke timing.
- The Bot Model combines these with the network-layer signals to produce the
  classification.

Network-layer signals are weaker but available on every request.

- The IP address is checked against known botnet ranges, data center ranges, and
  proxies, since real humans rarely come from cloud providers.
- The TLS fingerprint and HTTP header ordering reveal the underlying library a
  bot uses, because every HTTP client stack emits a distinctive pattern.
- Consistency across a session matters too: a request that claims to come from a
  phone while presenting a desktop browser fingerprint is suspicious.
- Each of these signals is individually weak, which is why the model fuses them
  into a score rather than any single check deciding.

The system also exploits the fact that bots behave differently in aggregate.

- A botnet sends many requests from many addresses but with coordinated timing,
  and scraping behavior has a tell: it fetches systematically, covers the URL
  space evenly, and rarely clicks through normally.
- Distributional signals such as these are computed per session and per IP pool.
- The model is calibrated to output a confidence, and the system is tuned so
  that genuine uncertainty routes to a challenge rather than a hard block.
- No single signal is trusted, because the whole point is that bots can fake any
  one of them; only the combination is hard to reproduce..
- Scaling is achieved by making the cheap checks do the heavy lifting.

- Every request hits the first layer: IP reputation, fingerprint lookup, and a
  small model that runs on the request attributes available at the edge.
- This layer is designed to complete in under a few milliseconds and to classify
  the large majority of traffic confidently.
- Clean traffic is passed through immediately, and only the uncertain tail is
  promoted to the deeper pipeline, which runs the full behavioral scoring and
  the heavyweight model.
- This means the expensive computation runs on a small fraction of requests, so
  the average cost per request stays low while the protection is thorough.

The second scaling lever is caching and precomputation.

- Device fingerprints are looked up in a distributed cache keyed by fingerprint,
  so a returning device is classified on cached state rather than re-analyzed.
- IP reputation is refreshed asynchronously and stored in a fast lookup table,
  not computed on the request path.
- Model inference is served from a model serving tier with batching, so the deep
  classifier processes many requests per GPU call.
- The design also uses tiered actions: rather than blocking the suspicious tail
  outright on every request, the system sets a flag on the request and the Web
  App serves a challenge, which offloads the decision cost to the human on the
  other side.

The third lever is statistical sampling for the offline path.

- Full behavioral data is sampled for a fraction of sessions rather than stored
  for all, and the Event Queue decouples logging from serving so that heavy
  analysis never blocks the request path.
- The scoring is designed to be incrementally computed: the first layer can emit
  a preliminary verdict before the session's behavioral data has fully arrived,
  and the verdict is refined as more signals come in.
- The system's latency is measured as the p99 of the first-layer verdict, which
  stays flat as traffic grows because the deep checks never sit on the hot path..
- CAPTCHA is the system's last line of defense and its most expensive instruments
  to use, so it is deployed deliberately.

- The Blocking Engine issues a challenge only when the score sits in a band
  where neither allow nor block is defensible, or when a confirmed-suspicious
  actor attempts a high-value action such as login or checkout.
- The CAPTCHA Service generates a task that is easy for a human and hard for a
  bot, and the client renders it in place of the normal action.
- When the user solves it, the result is verified on the server, the session is
  upgraded to human status, and the behavioral data collected during the
  challenge is used as a labeled human sample for retraining.

The design of the challenge itself has changed as bots improved.

- Classic distorted-text CAPTCHAs are now solvable by automated services, so
  modern challenges use interactive proof-of-work: a task that requires real
  human vision and interaction, such as selecting images or completing a subtle
  drag gesture, combined with invisible challenges that only measure the
  interaction.
- The client-side script collects how the challenge was solved, which gives a
  rich behavioral signature that is hard to automate.
- Challenge variants are rotated continuously so that bot builders cannot adapt
  to a single fixed task, and each variant is tracked by its solve rate and its
  automation rate.

The product cost of a CAPTCHA is real: it interrupts the user and adds latency,
and a badly designed challenge can be worse than a bot attack.

- The system therefore measures challenge placement against abandonment rate and
  uses challenges only where they protect value.
- A challenge that is solved converts the session from suspicious to verified,
  and repeated solves build a trusted fingerprint for that device.
- Failed challenges are escalated with backoff, eventually to a block, and the
  whole sequence is logged so that bot operators see escalating cost.
- The goal is to make automated abuse unprofitable while keeping the friction
  for genuine users as low as possible.

## Source

````text
title: Bot Detection
node client: Client [round, icon=browser]
node app: Web App [icon=browser]
node gateway: API Gateway [icon=server]
node traffic: Traffic Analyzer [icon=compute]
node behavior: Behavioral Signals [icon=compute]
node device: Device Fingerprint [icon=cache]
node model: Bot Model [icon=cloud]
node captcha: CAPTCHA Service [icon=shield]
node block: Blocking Engine [icon=shield]
node queue: Event Queue [icon=queue]
node db: Signals DB [cylinder, icon=database]

edge client -> app: request
edge app -> gateway: pass
edge gateway -> traffic: analyze
edge traffic -> behavior: score
edge behavior -> device: fingerprint
edge device -> model: classify
edge model -> block: decide
edge block -> captcha: challenge
edge captcha -> client: verify
edge traffic -> queue: log
edge queue -> db: store
```.

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Bot Detection
client: Client
app: Web App
gateway: API Gateway
traffic: Traffic Analyzer
behavior: Behavioral Signals
device: Device Fingerprint
model: Bot Model
captcha: CAPTCHA Service
block: Blocking Engine
queue: Event Queue
db: Signals DB

client ─► app ─► request
app ─► gateway ─► pass
gateway ─► traffic ─► analyze
traffic ─► behavior ─► score
behavior ─► device ─► fingerprint
device ─► model ─► classify
model ─► block ─► decide
block ─► captcha ─► challenge
captcha ─► client ─► verify
traffic ─► queue ─► log
queue ─► db ─► store
````

## Design

### Design a bot detection system

A bot detection system inspects every request and decides whether the actor
behind it is a human, a legitimate automated client such as a search crawler, or
a malicious bot.

- The traffic path flows from the Client through the Web App to the API Gateway,
  where the Traffic Analyzer collects the request attributes that are visible at
  the network edge: IP address, headers, TLS fingerprint, and request patterns.
- The Behavioral Signals component adds interaction data, such as mouse
  movements, typing speed, and page navigation, gathered by a small script
  running in the browser.
- The Device Fingerprint service assembles a persistent identifier from browser
  and hardware characteristics, and the Bot Model classifies the combined signal
  set.
- The Blocking Engine then decides what to do, issuing a CAPTCHA challenge to
  borderline clients, and all traffic observations are logged to the Signals DB
  through the Event Queue for offline analysis.

The defining challenge is that the system must make its judgment with no
cooperation from the attacker.

- Bots try to look like humans, so the signals are chosen for properties that
  are hard to fake, such as the subtle timing and randomness of real
  interaction, and the model is trained to detect the differences that matter.
- The system also has to classify the full spectrum: a headless scraper is
  different from a distributed botnet and different again from a user on a
  shared NAT address.
- The design therefore scores on a continuum rather than a binary, and the
  action escalates from observation to challenge to block as confidence grows.

Latency and security pull against each other.

- Every request must be classified quickly enough to sit in the serving path, so
  the scoring is layered: cheap checks run on every request, expensive checks
  run only on suspicious ones.
- The system is built to learn continuously, because bots evolve faster than
  humans, and the Signals DB is the raw material for retraining the model and
  refining the fingerprints.
- The end result is a system that is deliberately conservative in its actions,
  preferring to challenge and observe rather than to block on the first hint of
  doubt.

### How do you distinguish bots from humans?

Distinguishing bots from humans means finding features that are genuinely hard
to forge. The most reliable signals are interaction-based: the way a human moves
a mouse, the timing of keystrokes, the sequence of elements they hover over, and
the pauses between actions.

- These traces have a statistical signature that is very difficult for a
  scripted bot to reproduce, because humans are noisy and inconsistent in
  specific, measurable ways.
- The Behavioral Signals service captures these traces from a script in the page
  and computes features such as movement curvature, velocity jitter, and
  inter-keystroke timing.
- The Bot Model combines these with the network-layer signals to produce the
  classification.

Network-layer signals are weaker but available on every request.

- The IP address is checked against known botnet ranges, data center ranges, and
  proxies, since real humans rarely come from cloud providers.
- The TLS fingerprint and HTTP header ordering reveal the underlying library a
  bot uses, because every HTTP client stack emits a distinctive pattern.
- Consistency across a session matters too: a request that claims to come from a
  phone while presenting a desktop browser fingerprint is suspicious.
- Each of these signals is individually weak, which is why the model fuses them
  into a score rather than any single check deciding.

The system also exploits the fact that bots behave differently in aggregate.

- A botnet sends many requests from many addresses but with coordinated timing,
  and scraping behavior has a tell: it fetches systematically, covers the URL
  space evenly, and rarely clicks through normally.
- Distributional signals such as these are computed per session and per IP pool.
- The model is calibrated to output a confidence, and the system is tuned so
  that genuine uncertainty routes to a challenge rather than a hard block.
- No single signal is trusted, because the whole point is that bots can fake any
  one of them; only the combination is hard to reproduce.

### How do you use behavioral signals?

Behavioral signals are the strongest discriminator because they measure how a
human actually operates the interface.

- A small script in the page records a stream of interaction events: mouse
  position samples, scroll velocity, keyboard timing, focus changes, and clicks
  with their coordinates.
- These events are aggregated into features that describe the shape of the
  interaction, such as whether movement is smooth and curved, whether the
  session shows pauses and corrections, and how consistently the user types.
- Humans produce movement with characteristic micro-accelerations that scripted
  automation cannot cheaply mimic, and this is the core signal the Behavioral
  Signals component extracts.

The behavioral features are computed in small windows and streamed with the
request, not stored raw at full fidelity.

- A session produces thousands of events, so the component reduces them to a
  compact feature vector, hashed and sent with bounded size, and the raw events
  are kept only for a short period for analysis.
- The features are designed to be computed cheaply on the client and scored
  cheaply on the server, because they ride along on every interaction.
- This also preserves privacy: the service needs the statistical signature of
  human behavior, not the specific content the user typed, so the payload is
  deliberately minimal.

Behavioral scores are used as a prior that changes over a session.

- Early in a session the system has little data, so behavioral confidence is low
  and other signals dominate; as the session continues and the traces
  accumulate, the behavioral score becomes the decisive input.
- A session that never produced any behavioral signal at all is itself a signal,
  since real users always generate a trace.
- The behavioral model is retrained on labeled traffic, where bots are
  identified through confirmed abuse and humans through successful completions
  of challenges, and it is continuously evaluated on how well its scores
  separate the two populations.

### How do you scale checks without hurting latency?

Scaling is achieved by making the cheap checks do the heavy lifting.

- Every request hits the first layer: IP reputation, fingerprint lookup, and a
  small model that runs on the request attributes available at the edge.
- This layer is designed to complete in under a few milliseconds and to classify
  the large majority of traffic confidently.
- Clean traffic is passed through immediately, and only the uncertain tail is
  promoted to the deeper pipeline, which runs the full behavioral scoring and
  the heavyweight model.
- This means the expensive computation runs on a small fraction of requests, so
  the average cost per request stays low while the protection is thorough.

The second scaling lever is caching and precomputation.

- Device fingerprints are looked up in a distributed cache keyed by fingerprint,
  so a returning device is classified on cached state rather than re-analyzed.
- IP reputation is refreshed asynchronously and stored in a fast lookup table,
  not computed on the request path.
- Model inference is served from a model serving tier with batching, so the deep
  classifier processes many requests per GPU call.
- The design also uses tiered actions: rather than blocking the suspicious tail
  outright on every request, the system sets a flag on the request and the Web
  App serves a challenge, which offloads the decision cost to the human on the
  other side.

The third lever is statistical sampling for the offline path.

- Full behavioral data is sampled for a fraction of sessions rather than stored
  for all, and the Event Queue decouples logging from serving so that heavy
  analysis never blocks the request path.
- The scoring is designed to be incrementally computed: the first layer can emit
  a preliminary verdict before the session's behavioral data has fully arrived,
  and the verdict is refined as more signals come in.
- The system's latency is measured as the p99 of the first-layer verdict, which
  stays flat as traffic grows because the deep checks never sit on the hot path.

### How do you handle CAPTCHA challenges?

CAPTCHA is the system's last line of defense and its most expensive instruments
to use, so it is deployed deliberately.

- The Blocking Engine issues a challenge only when the score sits in a band
  where neither allow nor block is defensible, or when a confirmed-suspicious
  actor attempts a high-value action such as login or checkout.
- The CAPTCHA Service generates a task that is easy for a human and hard for a
  bot, and the client renders it in place of the normal action.
- When the user solves it, the result is verified on the server, the session is
  upgraded to human status, and the behavioral data collected during the
  challenge is used as a labeled human sample for retraining.

The design of the challenge itself has changed as bots improved.

- Classic distorted-text CAPTCHAs are now solvable by automated services, so
  modern challenges use interactive proof-of-work: a task that requires real
  human vision and interaction, such as selecting images or completing a subtle
  drag gesture, combined with invisible challenges that only measure the
  interaction.
- The client-side script collects how the challenge was solved, which gives a
  rich behavioral signature that is hard to automate.
- Challenge variants are rotated continuously so that bot builders cannot adapt
  to a single fixed task, and each variant is tracked by its solve rate and its
  automation rate.

The product cost of a CAPTCHA is real: it interrupts the user and adds latency,
and a badly designed challenge can be worse than a bot attack.

- The system therefore measures challenge placement against abandonment rate and
  uses challenges only where they protect value.
- A challenge that is solved converts the session from suspicious to verified,
  and repeated solves build a trusted fingerprint for that device.
- Failed challenges are escalated with backoff, eventually to a block, and the
  whole sequence is logged so that bot operators see escalating cost.
- The goal is to make automated abuse unprofitable while keeping the friction
  for genuine users as low as possible.

## Source

```text
title: Bot Detection
node client: Client [round, icon=browser]
node app: Web App [icon=browser]
node gateway: API Gateway [icon=server]
node traffic: Traffic Analyzer [icon=compute]
node behavior: Behavioral Signals [icon=compute]
node device: Device Fingerprint [icon=cache]
node model: Bot Model [icon=cloud]
node captcha: CAPTCHA Service [icon=shield]
node block: Blocking Engine [icon=shield]
node queue: Event Queue [icon=queue]
node db: Signals DB [cylinder, icon=database]

edge client -> app: request
edge app -> gateway: pass
edge gateway -> traffic: analyze
edge traffic -> behavior: score
edge behavior -> device: fingerprint
edge device -> model: classify
edge model -> block: decide
edge block -> captcha: challenge
edge captcha -> client: verify
edge traffic -> queue: log
edge queue -> db: store
```

## Q&A

### Q: Design a bot detection system

**A:** A bot detection system inspects every request and decides whether the actor
behind it is a human, a legitimate automated client such as a search crawler, or
a malicious bot.

- The traffic path flows from the Client through the Web App to the API Gateway,
  where the Traffic Analyzer collects the request attributes that are visible at
  the network edge: IP address, headers, TLS fingerprint, and request patterns.
- The Behavioral Signals component adds interaction data, such as mouse
  movements, typing speed, and page navigation, gathered by a small script
  running in the browser.
- The Device Fingerprint service assembles a persistent identifier from browser
  and hardware characteristics, and the Bot Model classifies the combined signal
  set.
- The Blocking Engine then decides what to do, issuing a CAPTCHA challenge to
  borderline clients, and all traffic observations are logged to the Signals DB
  through the Event Queue for offline analysis.

The defining challenge is that the system must make its judgment with no
cooperation from the attacker.

- Bots try to look like humans, so the signals are chosen for properties that
  are hard to fake, such as the subtle timing and randomness of real
  interaction, and the model is trained to detect the differences that matter.
- The system also has to classify the full spectrum: a headless scraper is
  different from a distributed botnet and different again from a user on a
  shared NAT address.
- The design therefore scores on a continuum rather than a binary, and the
  action escalates from observation to challenge to block as confidence grows.

Latency and security pull against each other.

- Every request must be classified quickly enough to sit in the serving path, so
  the scoring is layered: cheap checks run on every request, expensive checks
  run only on suspicious ones.
- The system is built to learn continuously, because bots evolve faster than
  humans, and the Signals DB is the raw material for retraining the model and
  refining the fingerprints.
- The end result is a system that is deliberately conservative in its actions,
  preferring to challenge and observe rather than to block on the first hint of
  doubt.

### Q: How do you distinguish bots from humans?

**A:** Distinguishing bots from humans means finding features that are genuinely hard
to forge. The most reliable signals are interaction-based: the way a human moves
a mouse, the timing of keystrokes, the sequence of elements they hover over, and
the pauses between actions.

- These traces have a statistical signature that is very difficult for a
  scripted bot to reproduce, because humans are noisy and inconsistent in
  specific, measurable ways.
- The Behavioral Signals service captures these traces from a script in the page
  and computes features such as movement curvature, velocity jitter, and
  inter-keystroke timing.
- The Bot Model combines these with the network-layer signals to produce the
  classification.

Network-layer signals are weaker but available on every request.

- The IP address is checked against known botnet ranges, data center ranges, and
  proxies, since real humans rarely come from cloud providers.
- The TLS fingerprint and HTTP header ordering reveal the underlying library a
  bot uses, because every HTTP client stack emits a distinctive pattern.
- Consistency across a session matters too: a request that claims to come from a
  phone while presenting a desktop browser fingerprint is suspicious.
- Each of these signals is individually weak, which is why the model fuses them
  into a score rather than any single check deciding.

The system also exploits the fact that bots behave differently in aggregate.

- A botnet sends many requests from many addresses but with coordinated timing,
  and scraping behavior has a tell: it fetches systematically, covers the URL
  space evenly, and rarely clicks through normally.
- Distributional signals such as these are computed per session and per IP pool.
- The model is calibrated to output a confidence, and the system is tuned so
  that genuine uncertainty routes to a challenge rather than a hard block.
- No single signal is trusted, because the whole point is that bots can fake any
  one of them; only the combination is hard to reproduce.

### Q: How do you use behavioral signals?

**A:** Behavioral signals are the strongest discriminator because they measure how a
human actually operates the interface.

- A small script in the page records a stream of interaction events: mouse
  position samples, scroll velocity, keyboard timing, focus changes, and clicks
  with their coordinates.
- These events are aggregated into features that describe the shape of the
  interaction, such as whether movement is smooth and curved, whether the
  session shows pauses and corrections, and how consistently the user types.
- Humans produce movement with characteristic micro-accelerations that scripted
  automation cannot cheaply mimic, and this is the core signal the Behavioral
  Signals component extracts.

The behavioral features are computed in small windows and streamed with the
request, not stored raw at full fidelity.

- A session produces thousands of events, so the component reduces them to a
  compact feature vector, hashed and sent with bounded size, and the raw events
  are kept only for a short period for analysis.
- The features are designed to be computed cheaply on the client and scored
  cheaply on the server, because they ride along on every interaction.
- This also preserves privacy: the service needs the statistical signature of
  human behavior, not the specific content the user typed, so the payload is
  deliberately minimal.

Behavioral scores are used as a prior that changes over a session.

- Early in a session the system has little data, so behavioral confidence is low
  and other signals dominate; as the session continues and the traces
  accumulate, the behavioral score becomes the decisive input.
- A session that never produced any behavioral signal at all is itself a signal,
  since real users always generate a trace.
- The behavioral model is retrained on labeled traffic, where bots are
  identified through confirmed abuse and humans through successful completions
  of challenges, and it is continuously evaluated on how well its scores
  separate the two populations.

### Q: How do you scale checks without hurting latency?

**A:** Scaling is achieved by making the cheap checks do the heavy lifting.

- Every request hits the first layer: IP reputation, fingerprint lookup, and a
  small model that runs on the request attributes available at the edge.
- This layer is designed to complete in under a few milliseconds and to classify
  the large majority of traffic confidently.
- Clean traffic is passed through immediately, and only the uncertain tail is
  promoted to the deeper pipeline, which runs the full behavioral scoring and
  the heavyweight model.
- This means the expensive computation runs on a small fraction of requests, so
  the average cost per request stays low while the protection is thorough.

The second scaling lever is caching and precomputation.

- Device fingerprints are looked up in a distributed cache keyed by fingerprint,
  so a returning device is classified on cached state rather than re-analyzed.
- IP reputation is refreshed asynchronously and stored in a fast lookup table,
  not computed on the request path.
- Model inference is served from a model serving tier with batching, so the deep
  classifier processes many requests per GPU call.
- The design also uses tiered actions: rather than blocking the suspicious tail
  outright on every request, the system sets a flag on the request and the Web
  App serves a challenge, which offloads the decision cost to the human on the
  other side.

The third lever is statistical sampling for the offline path.

- Full behavioral data is sampled for a fraction of sessions rather than stored
  for all, and the Event Queue decouples logging from serving so that heavy
  analysis never blocks the request path.
- The scoring is designed to be incrementally computed: the first layer can emit
  a preliminary verdict before the session's behavioral data has fully arrived,
  and the verdict is refined as more signals come in.
- The system's latency is measured as the p99 of the first-layer verdict, which
  stays flat as traffic grows because the deep checks never sit on the hot path.

### Q: How do you handle CAPTCHA challenges?

**A:** CAPTCHA is the system's last line of defense and its most expensive instruments
to use, so it is deployed deliberately.

- The Blocking Engine issues a challenge only when the score sits in a band
  where neither allow nor block is defensible, or when a confirmed-suspicious
  actor attempts a high-value action such as login or checkout.
- The CAPTCHA Service generates a task that is easy for a human and hard for a
  bot, and the client renders it in place of the normal action.
- When the user solves it, the result is verified on the server, the session is
  upgraded to human status, and the behavioral data collected during the
  challenge is used as a labeled human sample for retraining.

The design of the challenge itself has changed as bots improved.

- Classic distorted-text CAPTCHAs are now solvable by automated services, so
  modern challenges use interactive proof-of-work: a task that requires real
  human vision and interaction, such as selecting images or completing a subtle
  drag gesture, combined with invisible challenges that only measure the
  interaction.
- The client-side script collects how the challenge was solved, which gives a
  rich behavioral signature that is hard to automate.
- Challenge variants are rotated continuously so that bot builders cannot adapt
  to a single fixed task, and each variant is tracked by its solve rate and its
  automation rate.

The product cost of a CAPTCHA is real: it interrupts the user and adds latency,
and a badly designed challenge can be worse than a bot attack.

- The system therefore measures challenge placement against abandonment rate and
  uses challenges only where they protect value.
- A challenge that is solved converts the session from suspicious to verified,
  and repeated solves build a trusted fingerprint for that device.
- Failed challenges are escalated with backoff, eventually to a block, and the
  whole sequence is logged so that bot operators see escalating cost.
- The goal is to make automated abuse unprofitable while keeping the friction
  for genuine users as low as possible.

## Source

```text
title: Bot Detection
node client: Client [round, icon=browser]
node app: Web App [icon=browser]
node gateway: API Gateway [icon=server]
node traffic: Traffic Analyzer [icon=compute]
node behavior: Behavioral Signals [icon=compute]
node device: Device Fingerprint [icon=cache]
node model: Bot Model [icon=cloud]
node captcha: CAPTCHA Service [icon=shield]
node block: Blocking Engine [icon=shield]
node queue: Event Queue [icon=queue]
node db: Signals DB [cylinder, icon=database]

edge client -> app: request
edge app -> gateway: pass
edge gateway -> traffic: analyze
edge traffic -> behavior: score
edge behavior -> device: fingerprint
edge device -> model: classify
edge model -> block: decide
edge block -> captcha: challenge
edge captcha -> client: verify
edge traffic -> queue: log
edge queue -> db: store
```
