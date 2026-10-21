# Alexa — Voice Assistant

Design a voice assistant

**Difficulty:** Hard

**Tags:** ml, speech

## Functional Requirements

- a voice assistant
- handle wake word detection on device?
- convert speech to intent reliably?
- orchestrate skills and actions?
- handle errors and fallbacks?

## Non-Functional Requirements

- A voice assistant takes a spoken command and performs an action, and the entire
  product is a latency chain: every stage from wake word to response adds to the
  time before the device speaks back.

- The architecture is split between on-device and cloud processing.
- On the device, the Wake Word Engine runs continuously and cheaply, listening
  for the trigger phrase.
- When detected, the device streams audio to the Assistant Gateway.
- The gateway runs the Speech-to-Text service to produce text.
- It then runs the Intent Parser to extract the user's goal and slots such as
  the song name or room.
- The Skill Router dispatches the intent to the appropriate skill or action
  provider.
- The Action Service executes it.
- The Text-to-Speech service synthesizes a response that the device plays.
- A Response Cache and a Session DB handle repeats and multi-turn conversation
  respectively.

The defining design constraint is the coupling between real-time audio and all
the services behind it.

- Speech cannot be retried the way an HTTP request can, so the gateway treats
  each utterance as an event that flows through the pipeline exactly once.
- The session context is attached so the assistant understands references like
  "turn it off".
- The response must be spoken quickly enough to feel natural, typically under a
  couple of seconds for the audio reply to start.
- This forces each stage to be fast and the whole chain to be observable.
- The system is designed as a vertical pipeline where every stage can fail
  independently.
- The failure handling decides whether the user perceives the product as
  intelligent or broken.

The system also has to handle a fundamental ambiguity: what to do when the
assistant is not sure.

- Confidences are propagated from speech recognition through intent parsing.
- Low confidence at any stage routes to a confirmation question rather than a
  wrong action.
- The skill ecosystem is open, so the Skill Router is a registry with
  authentication and rate limits rather than a fixed list.
- Session state keeps conversations coherent.
- Privacy controls, including on-device processing and audio deletion, shape
  where each stage runs..
- Wake word detection runs on the device because it has to listen for the trigger
  phrase constantly, from power-on to power-off.

- Streaming all that audio to the cloud would be both expensive and invasive.
- The Wake Word Engine is a small neural network, a few megabytes, designed to
  run on a low-power DSP or the device's main processor.
- It consumes a rolling window of audio frames, often every 20 to 40
  milliseconds, and scores each window for how likely it contains the wake word.
- To be useful it must be nearly always correct: a false wake triggers a cloud
  round trip and interrupts the user.
- The threshold is tuned to favor missed triggers slightly over false triggers.
- A second-stage verification on the device rejects obvious false positives
  before any audio leaves the device.

The device-side design manages the resource tradeoffs.

- The continuous listener must not drain the battery or block other audio.
- It runs in a low-power mode with aggressive audio preprocessing that reduces
  the sampling rate and suppresses background noise before scoring.
- The wake word model is personalized: the system adapts to the user's voice and
  accent over time.
- A competing-word model actively learns the phrases users commonly say that
  sound similar, so the engine can reject lookalike utterances.
- Privacy shapes the design too, because the wake word is the boundary after
  which audio is processed.
- The engine's design goal is making that boundary reliable.

The cloud is still involved in wake word quality, asynchronously.

- Device logs report near-miss events, audio that scored just below the trigger
  threshold, and false-wake samples with the user's reaction.
- These are aggregated to retrain the wake word model and tune the thresholds
  per device family.
- The result is a feedback loop between the device and the cloud that improves
  wake word accuracy without streaming continuous audio.
- Because the wake word is the first gate of the whole assistant, its false wake
  rate and missed wake rate are among the most carefully measured metrics in the
  product.
- The models are versioned and rolled out through device firmware updates..
- Converting speech to intent is a two-stage pipeline: speech to text, then text
  to meaning.

- The Speech-to-Text stage transcribes the utterance.
- The Intent Parser then maps the transcript to an intent, such as "play music"
  or "set an alarm", with slot values, such as the artist or the time.
- Each stage carries confidence, and the product decision is made on the
  combination.
- A transcript with high acoustic confidence but low intent confidence, or the
  reverse, is treated as uncertain.
- The system does not silently guess: it propagates the joint confidence forward
  so the orchestrator can decide whether to act, ask a clarifying question, or
  escalate.

Reliability comes from constraining the problem.

- The intent parser is trained on the assistant's skill schema, so it knows the
  set of possible intents and slot types.
- It extracts entities using a combination of neural semantic parsing and
  rule-based extraction for well-structured slots such as numbers, times, and
  names.
- Slots are validated against the domain: an alarm time must be a real time, a
  media query must resolve to a real artist.
- The design also uses context heavily, because the same words mean different
  things mid-conversation: "play it again" depends on what was played before,
  and "set it to five" depends on the attribute being discussed.
- The Session DB provides that state to the parser on every turn.

The system is evaluated on end-to-end accuracy, not stage accuracy.

- The metric that matters is whether the right action happens.
- Transcripts and intents are sampled and judged jointly, and the feedback feeds
  both the speech model and the intent model.
- Ambiguity is handled by design rather than by chance: when two intents score
  closely, the assistant asks a disambiguating question.
- Asking is better than executing the wrong action.
- The pipeline also exposes a confidence breakdown to skill developers so skills
  can make their own decisions about low-confidence requests..
- The Skill Router is the control plane that decides which skill handles an
  intent.

- It holds a registry of skills, each declaring the intents it can handle, the
  slots it expects, and the permissions it needs.
- When the Intent Parser produces an intent, the router looks up candidate
  skills.
- It resolves the best one using both the intent confidence and the skill's
  declared compatibility, and invokes it.
- Skills may be first-party, such as timers and music, or third-party, so the
  router is also a marketplace boundary.
- It authenticates the skill invocation, applies rate limits, and isolates
  third-party failures.
- A slow or buggy skill cannot degrade the whole assistant.

Orchestration is where sessions come together.

- A single user turn can require multiple actions, such as turning on lights in
  several rooms.
- The orchestrator expands the intent into an action list and executes each one,
  collecting the results for the response.
- Some actions are asynchronous, such as starting a robot vacuum.
- The orchestrator distinguishes a completed action with an immediate response
  from a pending action with a follow-up notification.
- The Action Service is the boundary to the physical world, talking to device
  clouds and home hubs.
- Every action carries idempotency keys to prevent duplicate execution when a
  network retry happens.

Reliability in orchestration means failing safely.

- If a skill is slow, the orchestrator either times it out and asks the user to
  retry or falls back to a more capable general skill.
- If the action requires a permission the user has not granted, the flow stops
  at a consent prompt rather than silently failing.
- Every invocation is logged with the intent, skill, latency, and outcome.
- The logs power both quality monitoring and developer dashboards.
- The routing layer is deliberately thin: it performs no domain logic, so new
  skills can be added and promoted by configuration.
- The whole system scales by adding more stateless orchestrator replicas behind
  the gateway..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Voice Assistant
user: User
device: Smart Device
wake: Wake Word Engine
gateway: Assistant Gateway
asr: Speech-to-Text
nlu: Intent Parser
skill: Skill Router
action: Action Service
tts: Text-to-Speech
cache: Response Cache
db: Session DB

user ─► device ─► "hey device"
device ─► wake ─► detect
wake ─► gateway ─► start
gateway ─► asr ─► audio
asr ─► nlu ─► text
nlu ─► skill ─► intent
skill ─► action ─► execute
action ─► tts ─► respond
tts ─► device ─► speak
skill ─► cache ─► reuse
gateway ─► db ─► session
```

## Design

### Design a voice assistant

A voice assistant takes a spoken command and performs an action, and the entire
product is a latency chain: every stage from wake word to response adds to the
time before the device speaks back.

- The architecture is split between on-device and cloud processing.
- On the device, the Wake Word Engine runs continuously and cheaply, listening
  for the trigger phrase.
- When detected, the device streams audio to the Assistant Gateway.
- The gateway runs the Speech-to-Text service to produce text.
- It then runs the Intent Parser to extract the user's goal and slots such as
  the song name or room.
- The Skill Router dispatches the intent to the appropriate skill or action
  provider.
- The Action Service executes it.
- The Text-to-Speech service synthesizes a response that the device plays.
- A Response Cache and a Session DB handle repeats and multi-turn conversation
  respectively.

The defining design constraint is the coupling between real-time audio and all
the services behind it.

- Speech cannot be retried the way an HTTP request can, so the gateway treats
  each utterance as an event that flows through the pipeline exactly once.
- The session context is attached so the assistant understands references like
  "turn it off".
- The response must be spoken quickly enough to feel natural, typically under a
  couple of seconds for the audio reply to start.
- This forces each stage to be fast and the whole chain to be observable.
- The system is designed as a vertical pipeline where every stage can fail
  independently.
- The failure handling decides whether the user perceives the product as
  intelligent or broken.

The system also has to handle a fundamental ambiguity: what to do when the
assistant is not sure.

- Confidences are propagated from speech recognition through intent parsing.
- Low confidence at any stage routes to a confirmation question rather than a
  wrong action.
- The skill ecosystem is open, so the Skill Router is a registry with
  authentication and rate limits rather than a fixed list.
- Session state keeps conversations coherent.
- Privacy controls, including on-device processing and audio deletion, shape
  where each stage runs.

### How do you handle wake word detection on device?

Wake word detection runs on the device because it has to listen for the trigger
phrase constantly, from power-on to power-off.

- Streaming all that audio to the cloud would be both expensive and invasive.
- The Wake Word Engine is a small neural network, a few megabytes, designed to
  run on a low-power DSP or the device's main processor.
- It consumes a rolling window of audio frames, often every 20 to 40
  milliseconds, and scores each window for how likely it contains the wake word.
- To be useful it must be nearly always correct: a false wake triggers a cloud
  round trip and interrupts the user.
- The threshold is tuned to favor missed triggers slightly over false triggers.
- A second-stage verification on the device rejects obvious false positives
  before any audio leaves the device.

The device-side design manages the resource tradeoffs.

- The continuous listener must not drain the battery or block other audio.
- It runs in a low-power mode with aggressive audio preprocessing that reduces
  the sampling rate and suppresses background noise before scoring.
- The wake word model is personalized: the system adapts to the user's voice and
  accent over time.
- A competing-word model actively learns the phrases users commonly say that
  sound similar, so the engine can reject lookalike utterances.
- Privacy shapes the design too, because the wake word is the boundary after
  which audio is processed.
- The engine's design goal is making that boundary reliable.

The cloud is still involved in wake word quality, asynchronously.

- Device logs report near-miss events, audio that scored just below the trigger
  threshold, and false-wake samples with the user's reaction.
- These are aggregated to retrain the wake word model and tune the thresholds
  per device family.
- The result is a feedback loop between the device and the cloud that improves
  wake word accuracy without streaming continuous audio.
- Because the wake word is the first gate of the whole assistant, its false wake
  rate and missed wake rate are among the most carefully measured metrics in the
  product.
- The models are versioned and rolled out through device firmware updates.

### How do you convert speech to intent reliably?

Converting speech to intent is a two-stage pipeline: speech to text, then text
to meaning.

- The Speech-to-Text stage transcribes the utterance.
- The Intent Parser then maps the transcript to an intent, such as "play music"
  or "set an alarm", with slot values, such as the artist or the time.
- Each stage carries confidence, and the product decision is made on the
  combination.
- A transcript with high acoustic confidence but low intent confidence, or the
  reverse, is treated as uncertain.
- The system does not silently guess: it propagates the joint confidence forward
  so the orchestrator can decide whether to act, ask a clarifying question, or
  escalate.

Reliability comes from constraining the problem.

- The intent parser is trained on the assistant's skill schema, so it knows the
  set of possible intents and slot types.
- It extracts entities using a combination of neural semantic parsing and
  rule-based extraction for well-structured slots such as numbers, times, and
  names.
- Slots are validated against the domain: an alarm time must be a real time, a
  media query must resolve to a real artist.
- The design also uses context heavily, because the same words mean different
  things mid-conversation: "play it again" depends on what was played before,
  and "set it to five" depends on the attribute being discussed.
- The Session DB provides that state to the parser on every turn.

The system is evaluated on end-to-end accuracy, not stage accuracy.

- The metric that matters is whether the right action happens.
- Transcripts and intents are sampled and judged jointly, and the feedback feeds
  both the speech model and the intent model.
- Ambiguity is handled by design rather than by chance: when two intents score
  closely, the assistant asks a disambiguating question.
- Asking is better than executing the wrong action.
- The pipeline also exposes a confidence breakdown to skill developers so skills
  can make their own decisions about low-confidence requests.

### How do you orchestrate skills and actions?

The Skill Router is the control plane that decides which skill handles an
intent.

- It holds a registry of skills, each declaring the intents it can handle, the
  slots it expects, and the permissions it needs.
- When the Intent Parser produces an intent, the router looks up candidate
  skills.
- It resolves the best one using both the intent confidence and the skill's
  declared compatibility, and invokes it.
- Skills may be first-party, such as timers and music, or third-party, so the
  router is also a marketplace boundary.
- It authenticates the skill invocation, applies rate limits, and isolates
  third-party failures.
- A slow or buggy skill cannot degrade the whole assistant.

Orchestration is where sessions come together.

- A single user turn can require multiple actions, such as turning on lights in
  several rooms.
- The orchestrator expands the intent into an action list and executes each one,
  collecting the results for the response.
- Some actions are asynchronous, such as starting a robot vacuum.
- The orchestrator distinguishes a completed action with an immediate response
  from a pending action with a follow-up notification.
- The Action Service is the boundary to the physical world, talking to device
  clouds and home hubs.
- Every action carries idempotency keys to prevent duplicate execution when a
  network retry happens.

Reliability in orchestration means failing safely.

- If a skill is slow, the orchestrator either times it out and asks the user to
  retry or falls back to a more capable general skill.
- If the action requires a permission the user has not granted, the flow stops
  at a consent prompt rather than silently failing.
- Every invocation is logged with the intent, skill, latency, and outcome.
- The logs power both quality monitoring and developer dashboards.
- The routing layer is deliberately thin: it performs no domain logic, so new
  skills can be added and promoted by configuration.
- The whole system scales by adding more stateless orchestrator replicas behind
  the gateway.

### How do you handle errors and fallbacks?

Error handling is what separates a usable assistant from a frustrating one,
because a voice interface gives the user no error dialog and no retry button.

- The system defines a ladder of fallbacks based on confidence.
- When the pipeline is confident, the assistant acts and speaks a short
  confirmation.
- When confidence is moderate, it asks a clarifying question, echoing what it
  understood so the user can correct it.
- When confidence is low, it plays a universal fallback: "I'm not sure I
  understood" combined with a suggestion of related capabilities.
- Each rung of the ladder trades speed for safety.
- The fallback text is written to sound helpful rather than broken, because the
  user's perception of failure is shaped by how the failure is handled.

Skill failures are handled separately from understanding failures.

- A skill that times out, throws an error, or returns an unexpected result
  triggers a retry with a fresh attempt.
- It then gives a fallback response that explains the problem and offers an
  alternative.
- The Assistant Gateway tracks conversation state so a fallback can ask the user
  to rephrase without losing the session context.
- Errors are also ranked: a failure to connect to a device cloud gets a
  different response than a failure to understand the request.
- The system learns which fallback messages recover the conversation best by
  measuring whether the user continues speaking.

Observability is the foundation of all fallback design.

- Every turn is logged with the confidence breakdown at each stage, the error
  type if any, and the fallback that was triggered.
- These logs are analyzed to find the most common failure modes.
- Frequent patterns are fed back as training data for the intent parser and as
  documentation for skill developers.
- The fallback itself can be personalized: for a user who repeatedly tries one
  skill, the assistant surfaces that skill's help content.
- The design principle is that a voice assistant should never respond with
  silence, because silence is the only error the user cannot forgive.

## Source

```text
title: Voice Assistant
node user: User [round, icon=browser]
node device: Smart Device [icon=browser]
node wake: Wake Word Engine [icon=compute]
node gateway: Assistant Gateway [icon=server]
node asr: Speech-to-Text [icon=compute]
node nlu: Intent Parser [icon=search]
node skill: Skill Router [icon=compute]
node action: Action Service [icon=worker]
node tts: Text-to-Speech [icon=compute]
node cache: Response Cache [cylinder, icon=cache]
node db: Session DB [cylinder, icon=database]

edge user -> device: "hey device"
edge device -> wake: detect
edge wake -> gateway: start
edge gateway -> asr: audio
edge asr -> nlu: text
edge nlu -> skill: intent
edge skill -> action: execute
edge action -> tts: respond
edge tts -> device: speak
edge skill -> cache: reuse
edge gateway -> db: session
```

## Q&A

### Q: Design a voice assistant

**A:** A voice assistant takes a spoken command and performs an action, and the entire
product is a latency chain: every stage from wake word to response adds to the
time before the device speaks back.

- The architecture is split between on-device and cloud processing.
- On the device, the Wake Word Engine runs continuously and cheaply, listening
  for the trigger phrase.
- When detected, the device streams audio to the Assistant Gateway.
- The gateway runs the Speech-to-Text service to produce text.
- It then runs the Intent Parser to extract the user's goal and slots such as
  the song name or room.
- The Skill Router dispatches the intent to the appropriate skill or action
  provider.
- The Action Service executes it.
- The Text-to-Speech service synthesizes a response that the device plays.
- A Response Cache and a Session DB handle repeats and multi-turn conversation
  respectively.

The defining design constraint is the coupling between real-time audio and all
the services behind it.

- Speech cannot be retried the way an HTTP request can, so the gateway treats
  each utterance as an event that flows through the pipeline exactly once.
- The session context is attached so the assistant understands references like
  "turn it off".
- The response must be spoken quickly enough to feel natural, typically under a
  couple of seconds for the audio reply to start.
- This forces each stage to be fast and the whole chain to be observable.
- The system is designed as a vertical pipeline where every stage can fail
  independently.
- The failure handling decides whether the user perceives the product as
  intelligent or broken.

The system also has to handle a fundamental ambiguity: what to do when the
assistant is not sure.

- Confidences are propagated from speech recognition through intent parsing.
- Low confidence at any stage routes to a confirmation question rather than a
  wrong action.
- The skill ecosystem is open, so the Skill Router is a registry with
  authentication and rate limits rather than a fixed list.
- Session state keeps conversations coherent.
- Privacy controls, including on-device processing and audio deletion, shape
  where each stage runs.

### Q: How do you handle wake word detection on device?

**A:** Wake word detection runs on the device because it has to listen for the trigger
phrase constantly, from power-on to power-off.

- Streaming all that audio to the cloud would be both expensive and invasive.
- The Wake Word Engine is a small neural network, a few megabytes, designed to
  run on a low-power DSP or the device's main processor.
- It consumes a rolling window of audio frames, often every 20 to 40
  milliseconds, and scores each window for how likely it contains the wake word.
- To be useful it must be nearly always correct: a false wake triggers a cloud
  round trip and interrupts the user.
- The threshold is tuned to favor missed triggers slightly over false triggers.
- A second-stage verification on the device rejects obvious false positives
  before any audio leaves the device.

The device-side design manages the resource tradeoffs.

- The continuous listener must not drain the battery or block other audio.
- It runs in a low-power mode with aggressive audio preprocessing that reduces
  the sampling rate and suppresses background noise before scoring.
- The wake word model is personalized: the system adapts to the user's voice and
  accent over time.
- A competing-word model actively learns the phrases users commonly say that
  sound similar, so the engine can reject lookalike utterances.
- Privacy shapes the design too, because the wake word is the boundary after
  which audio is processed.
- The engine's design goal is making that boundary reliable.

The cloud is still involved in wake word quality, asynchronously.

- Device logs report near-miss events, audio that scored just below the trigger
  threshold, and false-wake samples with the user's reaction.
- These are aggregated to retrain the wake word model and tune the thresholds
  per device family.
- The result is a feedback loop between the device and the cloud that improves
  wake word accuracy without streaming continuous audio.
- Because the wake word is the first gate of the whole assistant, its false wake
  rate and missed wake rate are among the most carefully measured metrics in the
  product.
- The models are versioned and rolled out through device firmware updates.

### Q: How do you convert speech to intent reliably?

**A:** Converting speech to intent is a two-stage pipeline: speech to text, then text
to meaning.

- The Speech-to-Text stage transcribes the utterance.
- The Intent Parser then maps the transcript to an intent, such as "play music"
  or "set an alarm", with slot values, such as the artist or the time.
- Each stage carries confidence, and the product decision is made on the
  combination.
- A transcript with high acoustic confidence but low intent confidence, or the
  reverse, is treated as uncertain.
- The system does not silently guess: it propagates the joint confidence forward
  so the orchestrator can decide whether to act, ask a clarifying question, or
  escalate.

Reliability comes from constraining the problem.

- The intent parser is trained on the assistant's skill schema, so it knows the
  set of possible intents and slot types.
- It extracts entities using a combination of neural semantic parsing and
  rule-based extraction for well-structured slots such as numbers, times, and
  names.
- Slots are validated against the domain: an alarm time must be a real time, a
  media query must resolve to a real artist.
- The design also uses context heavily, because the same words mean different
  things mid-conversation: "play it again" depends on what was played before,
  and "set it to five" depends on the attribute being discussed.
- The Session DB provides that state to the parser on every turn.

The system is evaluated on end-to-end accuracy, not stage accuracy.

- The metric that matters is whether the right action happens.
- Transcripts and intents are sampled and judged jointly, and the feedback feeds
  both the speech model and the intent model.
- Ambiguity is handled by design rather than by chance: when two intents score
  closely, the assistant asks a disambiguating question.
- Asking is better than executing the wrong action.
- The pipeline also exposes a confidence breakdown to skill developers so skills
  can make their own decisions about low-confidence requests.

### Q: How do you orchestrate skills and actions?

**A:** The Skill Router is the control plane that decides which skill handles an
intent.

- It holds a registry of skills, each declaring the intents it can handle, the
  slots it expects, and the permissions it needs.
- When the Intent Parser produces an intent, the router looks up candidate
  skills.
- It resolves the best one using both the intent confidence and the skill's
  declared compatibility, and invokes it.
- Skills may be first-party, such as timers and music, or third-party, so the
  router is also a marketplace boundary.
- It authenticates the skill invocation, applies rate limits, and isolates
  third-party failures.
- A slow or buggy skill cannot degrade the whole assistant.

Orchestration is where sessions come together.

- A single user turn can require multiple actions, such as turning on lights in
  several rooms.
- The orchestrator expands the intent into an action list and executes each one,
  collecting the results for the response.
- Some actions are asynchronous, such as starting a robot vacuum.
- The orchestrator distinguishes a completed action with an immediate response
  from a pending action with a follow-up notification.
- The Action Service is the boundary to the physical world, talking to device
  clouds and home hubs.
- Every action carries idempotency keys to prevent duplicate execution when a
  network retry happens.

Reliability in orchestration means failing safely.

- If a skill is slow, the orchestrator either times it out and asks the user to
  retry or falls back to a more capable general skill.
- If the action requires a permission the user has not granted, the flow stops
  at a consent prompt rather than silently failing.
- Every invocation is logged with the intent, skill, latency, and outcome.
- The logs power both quality monitoring and developer dashboards.
- The routing layer is deliberately thin: it performs no domain logic, so new
  skills can be added and promoted by configuration.
- The whole system scales by adding more stateless orchestrator replicas behind
  the gateway.

### Q: How do you handle errors and fallbacks?

**A:** Error handling is what separates a usable assistant from a frustrating one,
because a voice interface gives the user no error dialog and no retry button.

- The system defines a ladder of fallbacks based on confidence.
- When the pipeline is confident, the assistant acts and speaks a short
  confirmation.
- When confidence is moderate, it asks a clarifying question, echoing what it
  understood so the user can correct it.
- When confidence is low, it plays a universal fallback: "I'm not sure I
  understood" combined with a suggestion of related capabilities.
- Each rung of the ladder trades speed for safety.
- The fallback text is written to sound helpful rather than broken, because the
  user's perception of failure is shaped by how the failure is handled.

Skill failures are handled separately from understanding failures.

- A skill that times out, throws an error, or returns an unexpected result
  triggers a retry with a fresh attempt.
- It then gives a fallback response that explains the problem and offers an
  alternative.
- The Assistant Gateway tracks conversation state so a fallback can ask the user
  to rephrase without losing the session context.
- Errors are also ranked: a failure to connect to a device cloud gets a
  different response than a failure to understand the request.
- The system learns which fallback messages recover the conversation best by
  measuring whether the user continues speaking.

Observability is the foundation of all fallback design.

- Every turn is logged with the confidence breakdown at each stage, the error
  type if any, and the fallback that was triggered.
- These logs are analyzed to find the most common failure modes.
- Frequent patterns are fed back as training data for the intent parser and as
  documentation for skill developers.
- The fallback itself can be personalized: for a user who repeatedly tries one
  skill, the assistant surfaces that skill's help content.
- The design principle is that a voice assistant should never respond with
  silence, because silence is the only error the user cannot forgive.

## Source

```text
title: Voice Assistant
node user: User [round, icon=browser]
node device: Smart Device [icon=browser]
node wake: Wake Word Engine [icon=compute]
node gateway: Assistant Gateway [icon=server]
node asr: Speech-to-Text [icon=compute]
node nlu: Intent Parser [icon=search]
node skill: Skill Router [icon=compute]
node action: Action Service [icon=worker]
node tts: Text-to-Speech [icon=compute]
node cache: Response Cache [cylinder, icon=cache]
node db: Session DB [cylinder, icon=database]

edge user -> device: "hey device"
edge device -> wake: detect
edge wake -> gateway: start
edge gateway -> asr: audio
edge asr -> nlu: text
edge nlu -> skill: intent
edge skill -> action: execute
edge action -> tts: respond
edge tts -> device: speak
edge skill -> cache: reuse
edge gateway -> db: session
```
