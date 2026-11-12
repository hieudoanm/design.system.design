# Speech Recognition

Design a speech-to-text service

**Difficulty:** Hard

**Tags:** audio, ml, realtime, speech

## Functional Requirements

- a speech-to-text service
- stream audio and transcribe in real-time?
- handle speaker diarization?
- improve accuracy with context?
- process batch audio files?

## Non-Functional Requirements

- A speech-to-text service converts audio into text, and its defining feature is
  that the audio is temporal: input arrives continuously, and users expect words
  to appear as they are spoken.

- The system has a real-time path and a batch path over a shared core.
- In the real-time path, the client opens a stream through the API Gateway, the
  Audio Stream service buffers audio chunks in arrival order, and the ASR Engine
  consumes chunks incrementally, emitting partial hypotheses.
- The Model Serving tier performs the acoustic decoding, while the Speaker
  Diarization component assigns each utterance to a speaker and the Context
  Service refines recognition using domain vocabulary.
- In the batch path, long files enter the Batch Queue and are processed with the
  same ASR engine but with larger context windows and no latency pressure.
- All transcripts land in the Transcripts DB, and completion is signaled through
  notifications.

The core tradeoff is latency against accuracy.

- A streaming recognizer must emit words within a few hundred milliseconds of
  speech, but the strongest model decisions depend on future context, on what
  the speaker says next.
- The design resolves this with a two-stage approach: a fast, low-latency model
  produces provisional text in real time, and a higher-quality model rewrites
  the finalized segments once enough audio has been observed.
- Users see live text during speech and a corrected, punctuated transcript
  shortly after.
- The architecture keeps the two passes over the same audio, with the first
  optimized for responsiveness and the second for correctness.

The system is also a study in graceful degradation.

- Audio arrives at variable rates, with interruptions, background noise, and
  multiple voices.
- The Audio Stream layer handles reordering, jitter, and lost chunks, and the
  ASR engine produces confidence scores per token so downstream features can
  signal uncertainty rather than pretend perfection.
- Speech services are highly sensitive to quality, so every transcript is stored
  with its audio reference and metadata, enabling continuous evaluation, model
  retraining, and the ability to re-transcribe old audio when a model improves..
- Streaming transcription is a sequence of incremental decisions made under a
  deadline.

- The client captures 16 kHz or 8 kHz audio and uploads small frames, typically
  20 to 100 milliseconds, through a persistent connection.
- The Audio Stream service reassembles the frames into larger recognition chunks
  of roughly 300 to 500 milliseconds and delivers them to the ASR Engine in
  order.
- The engine runs a streaming acoustic model that emits partial hypotheses after
  each chunk: a running word lattice that grows and is occasionally revised as
  more audio arrives.
- Latency is measured from the end of an utterance to its text appearing, and
  the target is usually under a second end to end.

The critical mechanism is the endpointing decision.

- The engine must detect when a speaker has finished a thought, to finalize the
  text, versus a natural pause within a sentence.
- Endpointing uses a combination of silence duration, speech cadence, and a
  language model's confidence that the current hypothesis is complete.
- Finalizing too early locks in errors; finalizing too late adds perceived
  delay.
- The design uses a configurable endpoint timeout that is relaxed during fluent
  speech and tightened during silence, and it can be overridden by the client
  signaling end of speech explicitly.

Partial results are served with a caveat: the text shown live can be revised.

- The ASR engine emits a partial hypothesis after every chunk, and the app
  renders it immediately, then replaces it when the finalized segment arrives.
- This creates a smooth user experience as long as the engine is consistent, so
  the streaming model is designed to stabilize earlier words while only the
  trailing words change.
- Backpressure protects the pipeline, because a slow decoder must never drop
  audio; if the client outpaces the engine, the stream buffers and eventually
  the client is told to slow its sampling rather than losing speech..
- Recognition accuracy improves when the model knows what is being talked about,
  because ambiguous sounds resolve differently in different domains.

- The Context Service supplies that knowledge in two forms.
- Domain and vocabulary context provides a custom lexicon: a medical client
  supplies drug names and medical terms, a support center supplies product names
  and jargon, and these words are weighted heavily during decoding so the model
  prefers them over phonetically similar common words.
- Conversation context uses the transcript itself, so a term mentioned earlier
  raises the probability of related terms later.
- The acoustic model produces a lattice of possible words, and the context layer
  rescales the lattice, not just the final answer.

The second lever is language modeling over the decoded text.

- The streaming decoder combines the acoustic model with a language model that
  scores how likely a sequence of words is, and that language model can be
  augmented at runtime with the context vocabulary.
- This is how the service handles proper nouns and technical terms without
  retraining: by injecting them into the decoding graph on a per-session basis.
- Acoustic context also matters, so the service can be seeded with the acoustic
  conditions of the expected audio, such as a noisy call center, which changes
  the noise handling.

Context is applied carefully because it can cause the model to hallucinate.

- A biased vocabulary turns every ambiguous sound into a preferred term, so each
  contextual boost is bounded and applied with a confidence check: if the
  acoustics are very uncertain, the context may win, but if the audio clearly
  says something else, the context must yield.
- Corrections from users are a powerful signal, so accepted corrections update
  the domain lexicon and are fed back into the evaluation set.
- The result is a loop where the service gets more accurate for a customer over
  time as it learns their vocabulary, without ever modifying the core acoustic
  model..
- Batch processing exists for audio that is too long or too asynchronous for
  streaming, such as recorded meetings, voice mails, and archived podcasts.

- The client uploads the file through the API Gateway, which validates the
  format, codec, and length, then enqueues a job in the Batch Queue with
  metadata such as the expected language and domain.
- Workers pull jobs and route them to the same ASR Engine used for streaming,
  but configured for accuracy: larger context windows, more decoding passes, and
  no latency deadline.
- Each job carries an identifier, and the client polls for status or receives a
  notification when the transcript is ready.

Large files are processed in segments to bound memory and enable parallelism.

- The audio is split into overlapping chunks, each chunk is transcribed
  independently, and the overlap lets the assembler stitch the segments back
  together without losing words at the boundaries.
- Because segments are independent, the workload parallelizes across a worker
  pool, and queue depth becomes the scaling signal: when jobs back up, more
  workers spin up.
- The overlap region also gives the service a natural place to reconcile
  duplicate words and to keep diarization and timestamps consistent across
  segment boundaries.

Batch quality is monitored differently from streaming quality.

- Each job's transcripts carry confidence distributions, and jobs are sampled
  for human or model-based evaluation to catch systematic degradation.
- Long jobs are resumable, so a worker crash does not restart an hour of audio
  from scratch; progress is checkpointed per segment.
- Jobs also have priority tiers, so a small urgent file can skip ahead of a
  queue full of long meetings.
- The transcript is stored with the audio reference, the model version, and
  timing information, making every batch job auditable and reproducible when the
  model improves.

## Source

````text
title: Speech Recognition
node user: User [round, icon=browser]
node app: Speech App [icon=browser]
node gateway: API Gateway [icon=server]
node stream: Audio Stream [icon=queue]
node asr: ASR Engine [icon=compute]
node diarize: Speaker Diarization [icon=users]
node models: Model Serving [icon=cloud]
node context: Context Service [icon=search]
node queue: Batch Queue [icon=queue]
node notify: Notifications [icon=message]
node db: Transcripts DB [cylinder, icon=database]

edge user -> app: speak
edge app -> gateway: stream
edge gateway -> stream: buffer
edge stream -> asr: chunks
edge asr -> models: decode
edge asr -> diarize: speakers
edge asr -> context: refine
edge context -> app: live text
edge gateway -> queue: batch
edge queue -> asr: process
edge asr -> db: store
edge gateway -> notify: done
```.

## Estimation

- of roughly 300 to 500 milliseconds and delivers them to the ASR Engine in

## Architecture Diagram

```text
title: Speech Recognition
user: User
app: Speech App
gateway: API Gateway
stream: Audio Stream
asr: ASR Engine
diarize: Speaker Diarization
models: Model Serving
context: Context Service
queue: Batch Queue
notify: Notifications
db: Transcripts DB

user ─► app ─► speak
app ─► gateway ─► stream
gateway ─► stream ─► buffer
stream ─► asr ─► chunks
asr ─► models ─► decode
asr ─► diarize ─► speakers
asr ─► context ─► refine
context ─► app ─► live text
gateway ─► queue ─► batch
queue ─► asr ─► process
asr ─► db ─► store
gateway ─► notify ─► done
````

## Design

### Design a speech-to-text service

A speech-to-text service converts audio into text, and its defining feature is
that the audio is temporal: input arrives continuously, and users expect words
to appear as they are spoken.

- The system has a real-time path and a batch path over a shared core.
- In the real-time path, the client opens a stream through the API Gateway, the
  Audio Stream service buffers audio chunks in arrival order, and the ASR Engine
  consumes chunks incrementally, emitting partial hypotheses.
- The Model Serving tier performs the acoustic decoding, while the Speaker
  Diarization component assigns each utterance to a speaker and the Context
  Service refines recognition using domain vocabulary.
- In the batch path, long files enter the Batch Queue and are processed with the
  same ASR engine but with larger context windows and no latency pressure.
- All transcripts land in the Transcripts DB, and completion is signaled through
  notifications.

The core tradeoff is latency against accuracy.

- A streaming recognizer must emit words within a few hundred milliseconds of
  speech, but the strongest model decisions depend on future context, on what
  the speaker says next.
- The design resolves this with a two-stage approach: a fast, low-latency model
  produces provisional text in real time, and a higher-quality model rewrites
  the finalized segments once enough audio has been observed.
- Users see live text during speech and a corrected, punctuated transcript
  shortly after.
- The architecture keeps the two passes over the same audio, with the first
  optimized for responsiveness and the second for correctness.

The system is also a study in graceful degradation.

- Audio arrives at variable rates, with interruptions, background noise, and
  multiple voices.
- The Audio Stream layer handles reordering, jitter, and lost chunks, and the
  ASR engine produces confidence scores per token so downstream features can
  signal uncertainty rather than pretend perfection.
- Speech services are highly sensitive to quality, so every transcript is stored
  with its audio reference and metadata, enabling continuous evaluation, model
  retraining, and the ability to re-transcribe old audio when a model improves.

### How do you stream audio and transcribe in real-time?

Streaming transcription is a sequence of incremental decisions made under a
deadline.

- The client captures 16 kHz or 8 kHz audio and uploads small frames, typically
  20 to 100 milliseconds, through a persistent connection.
- The Audio Stream service reassembles the frames into larger recognition chunks
  of roughly 300 to 500 milliseconds and delivers them to the ASR Engine in
  order.
- The engine runs a streaming acoustic model that emits partial hypotheses after
  each chunk: a running word lattice that grows and is occasionally revised as
  more audio arrives.
- Latency is measured from the end of an utterance to its text appearing, and
  the target is usually under a second end to end.

The critical mechanism is the endpointing decision.

- The engine must detect when a speaker has finished a thought, to finalize the
  text, versus a natural pause within a sentence.
- Endpointing uses a combination of silence duration, speech cadence, and a
  language model's confidence that the current hypothesis is complete.
- Finalizing too early locks in errors; finalizing too late adds perceived
  delay.
- The design uses a configurable endpoint timeout that is relaxed during fluent
  speech and tightened during silence, and it can be overridden by the client
  signaling end of speech explicitly.

Partial results are served with a caveat: the text shown live can be revised.

- The ASR engine emits a partial hypothesis after every chunk, and the app
  renders it immediately, then replaces it when the finalized segment arrives.
- This creates a smooth user experience as long as the engine is consistent, so
  the streaming model is designed to stabilize earlier words while only the
  trailing words change.
- Backpressure protects the pipeline, because a slow decoder must never drop
  audio; if the client outpaces the engine, the stream buffers and eventually
  the client is told to slow its sampling rather than losing speech.

### How do you handle speaker diarization?

Speaker diarization answers the question "who said what", which is what makes a
transcript of a meeting or a call readable.

- The process runs in three stages after transcription.
- First, the audio is segmented into utterances at silence and speaker-change
  boundaries.
- Second, for each segment the Diarization component computes an embedding, a
  compact vector that summarizes the voice characteristics of the speaker.
- Third, the embeddings are clustered so that segments spoken by the same person
  land in the same cluster, without knowing in advance how many speakers exist.
- The result is a sequence of speaker turns, and each turn is then labeled with
  a generic identifier such as Speaker 1, Speaker 2, to be mapped to real names
  through a separate enrollment step.

Clustering is where the tricky decisions live.

- The number of speakers is unknown, so the service uses a clustering method
  that estimates the count from the data, penalizing an excessive number of tiny
  clusters.
- Voices can change over a long call, and two people with similar voices are
  hard to separate, so the clustering is tuned with a confidence threshold that
  prefers keeping ambiguous segments attached to a known speaker over creating
  spurious new speakers.
- Diarization is computed on the whole audio rather than live, which is why it
  is decoupled from the real-time text path; live transcription shows text, and
  diarized labels appear once the full recording is analyzed.

Diarization quality is evaluated per turn rather than per word.

- The metric is diarization error rate, which combines how much speech was
  assigned to the wrong speaker with how much was missed entirely.
- The service integrates diarization with the transcript so that the final
  output is a series of timed speaker turns, each with its text.
- Accuracy is improved by running diarization on denoised audio and by giving
  the clustering a soft upper bound on speakers from the audio length.
- The output is stored with the transcript so it can be replayed, corrected by a
  user, and reused to train the clustering on the label corrections.

### How do you improve accuracy with context?

Recognition accuracy improves when the model knows what is being talked about,
because ambiguous sounds resolve differently in different domains.

- The Context Service supplies that knowledge in two forms.
- Domain and vocabulary context provides a custom lexicon: a medical client
  supplies drug names and medical terms, a support center supplies product names
  and jargon, and these words are weighted heavily during decoding so the model
  prefers them over phonetically similar common words.
- Conversation context uses the transcript itself, so a term mentioned earlier
  raises the probability of related terms later.
- The acoustic model produces a lattice of possible words, and the context layer
  rescales the lattice, not just the final answer.

The second lever is language modeling over the decoded text.

- The streaming decoder combines the acoustic model with a language model that
  scores how likely a sequence of words is, and that language model can be
  augmented at runtime with the context vocabulary.
- This is how the service handles proper nouns and technical terms without
  retraining: by injecting them into the decoding graph on a per-session basis.
- Acoustic context also matters, so the service can be seeded with the acoustic
  conditions of the expected audio, such as a noisy call center, which changes
  the noise handling.

Context is applied carefully because it can cause the model to hallucinate.

- A biased vocabulary turns every ambiguous sound into a preferred term, so each
  contextual boost is bounded and applied with a confidence check: if the
  acoustics are very uncertain, the context may win, but if the audio clearly
  says something else, the context must yield.
- Corrections from users are a powerful signal, so accepted corrections update
  the domain lexicon and are fed back into the evaluation set.
- The result is a loop where the service gets more accurate for a customer over
  time as it learns their vocabulary, without ever modifying the core acoustic
  model.

### How do you process batch audio files?

Batch processing exists for audio that is too long or too asynchronous for
streaming, such as recorded meetings, voice mails, and archived podcasts.

- The client uploads the file through the API Gateway, which validates the
  format, codec, and length, then enqueues a job in the Batch Queue with
  metadata such as the expected language and domain.
- Workers pull jobs and route them to the same ASR Engine used for streaming,
  but configured for accuracy: larger context windows, more decoding passes, and
  no latency deadline.
- Each job carries an identifier, and the client polls for status or receives a
  notification when the transcript is ready.

Large files are processed in segments to bound memory and enable parallelism.

- The audio is split into overlapping chunks, each chunk is transcribed
  independently, and the overlap lets the assembler stitch the segments back
  together without losing words at the boundaries.
- Because segments are independent, the workload parallelizes across a worker
  pool, and queue depth becomes the scaling signal: when jobs back up, more
  workers spin up.
- The overlap region also gives the service a natural place to reconcile
  duplicate words and to keep diarization and timestamps consistent across
  segment boundaries.

Batch quality is monitored differently from streaming quality.

- Each job's transcripts carry confidence distributions, and jobs are sampled
  for human or model-based evaluation to catch systematic degradation.
- Long jobs are resumable, so a worker crash does not restart an hour of audio
  from scratch; progress is checkpointed per segment.
- Jobs also have priority tiers, so a small urgent file can skip ahead of a
  queue full of long meetings.
- The transcript is stored with the audio reference, the model version, and
  timing information, making every batch job auditable and reproducible when the
  model improves.

## Source

```text
title: Speech Recognition
node user: User [round, icon=browser]
node app: Speech App [icon=browser]
node gateway: API Gateway [icon=server]
node stream: Audio Stream [icon=queue]
node asr: ASR Engine [icon=compute]
node diarize: Speaker Diarization [icon=users]
node models: Model Serving [icon=cloud]
node context: Context Service [icon=search]
node queue: Batch Queue [icon=queue]
node notify: Notifications [icon=message]
node db: Transcripts DB [cylinder, icon=database]

edge user -> app: speak
edge app -> gateway: stream
edge gateway -> stream: buffer
edge stream -> asr: chunks
edge asr -> models: decode
edge asr -> diarize: speakers
edge asr -> context: refine
edge context -> app: live text
edge gateway -> queue: batch
edge queue -> asr: process
edge asr -> db: store
edge gateway -> notify: done
```

## Q&A

### Q: Design a speech-to-text service

**A:** A speech-to-text service converts audio into text, and its defining feature is
that the audio is temporal: input arrives continuously, and users expect words
to appear as they are spoken.

- The system has a real-time path and a batch path over a shared core.
- In the real-time path, the client opens a stream through the API Gateway, the
  Audio Stream service buffers audio chunks in arrival order, and the ASR Engine
  consumes chunks incrementally, emitting partial hypotheses.
- The Model Serving tier performs the acoustic decoding, while the Speaker
  Diarization component assigns each utterance to a speaker and the Context
  Service refines recognition using domain vocabulary.
- In the batch path, long files enter the Batch Queue and are processed with the
  same ASR engine but with larger context windows and no latency pressure.
- All transcripts land in the Transcripts DB, and completion is signaled through
  notifications.

The core tradeoff is latency against accuracy.

- A streaming recognizer must emit words within a few hundred milliseconds of
  speech, but the strongest model decisions depend on future context, on what
  the speaker says next.
- The design resolves this with a two-stage approach: a fast, low-latency model
  produces provisional text in real time, and a higher-quality model rewrites
  the finalized segments once enough audio has been observed.
- Users see live text during speech and a corrected, punctuated transcript
  shortly after.
- The architecture keeps the two passes over the same audio, with the first
  optimized for responsiveness and the second for correctness.

The system is also a study in graceful degradation.

- Audio arrives at variable rates, with interruptions, background noise, and
  multiple voices.
- The Audio Stream layer handles reordering, jitter, and lost chunks, and the
  ASR engine produces confidence scores per token so downstream features can
  signal uncertainty rather than pretend perfection.
- Speech services are highly sensitive to quality, so every transcript is stored
  with its audio reference and metadata, enabling continuous evaluation, model
  retraining, and the ability to re-transcribe old audio when a model improves.

### Q: How do you stream audio and transcribe in real-time?

**A:** Streaming transcription is a sequence of incremental decisions made under a
deadline.

- The client captures 16 kHz or 8 kHz audio and uploads small frames, typically
  20 to 100 milliseconds, through a persistent connection.
- The Audio Stream service reassembles the frames into larger recognition chunks
  of roughly 300 to 500 milliseconds and delivers them to the ASR Engine in
  order.
- The engine runs a streaming acoustic model that emits partial hypotheses after
  each chunk: a running word lattice that grows and is occasionally revised as
  more audio arrives.
- Latency is measured from the end of an utterance to its text appearing, and
  the target is usually under a second end to end.

The critical mechanism is the endpointing decision.

- The engine must detect when a speaker has finished a thought, to finalize the
  text, versus a natural pause within a sentence.
- Endpointing uses a combination of silence duration, speech cadence, and a
  language model's confidence that the current hypothesis is complete.
- Finalizing too early locks in errors; finalizing too late adds perceived
  delay.
- The design uses a configurable endpoint timeout that is relaxed during fluent
  speech and tightened during silence, and it can be overridden by the client
  signaling end of speech explicitly.

Partial results are served with a caveat: the text shown live can be revised.

- The ASR engine emits a partial hypothesis after every chunk, and the app
  renders it immediately, then replaces it when the finalized segment arrives.
- This creates a smooth user experience as long as the engine is consistent, so
  the streaming model is designed to stabilize earlier words while only the
  trailing words change.
- Backpressure protects the pipeline, because a slow decoder must never drop
  audio; if the client outpaces the engine, the stream buffers and eventually
  the client is told to slow its sampling rather than losing speech.

### Q: How do you handle speaker diarization?

**A:** Speaker diarization answers the question "who said what", which is what makes a
transcript of a meeting or a call readable.

- The process runs in three stages after transcription.
- First, the audio is segmented into utterances at silence and speaker-change
  boundaries.
- Second, for each segment the Diarization component computes an embedding, a
  compact vector that summarizes the voice characteristics of the speaker.
- Third, the embeddings are clustered so that segments spoken by the same person
  land in the same cluster, without knowing in advance how many speakers exist.
- The result is a sequence of speaker turns, and each turn is then labeled with
  a generic identifier such as Speaker 1, Speaker 2, to be mapped to real names
  through a separate enrollment step.

Clustering is where the tricky decisions live.

- The number of speakers is unknown, so the service uses a clustering method
  that estimates the count from the data, penalizing an excessive number of tiny
  clusters.
- Voices can change over a long call, and two people with similar voices are
  hard to separate, so the clustering is tuned with a confidence threshold that
  prefers keeping ambiguous segments attached to a known speaker over creating
  spurious new speakers.
- Diarization is computed on the whole audio rather than live, which is why it
  is decoupled from the real-time text path; live transcription shows text, and
  diarized labels appear once the full recording is analyzed.

Diarization quality is evaluated per turn rather than per word.

- The metric is diarization error rate, which combines how much speech was
  assigned to the wrong speaker with how much was missed entirely.
- The service integrates diarization with the transcript so that the final
  output is a series of timed speaker turns, each with its text.
- Accuracy is improved by running diarization on denoised audio and by giving
  the clustering a soft upper bound on speakers from the audio length.
- The output is stored with the transcript so it can be replayed, corrected by a
  user, and reused to train the clustering on the label corrections.

### Q: How do you improve accuracy with context?

**A:** Recognition accuracy improves when the model knows what is being talked about,
because ambiguous sounds resolve differently in different domains.

- The Context Service supplies that knowledge in two forms.
- Domain and vocabulary context provides a custom lexicon: a medical client
  supplies drug names and medical terms, a support center supplies product names
  and jargon, and these words are weighted heavily during decoding so the model
  prefers them over phonetically similar common words.
- Conversation context uses the transcript itself, so a term mentioned earlier
  raises the probability of related terms later.
- The acoustic model produces a lattice of possible words, and the context layer
  rescales the lattice, not just the final answer.

The second lever is language modeling over the decoded text.

- The streaming decoder combines the acoustic model with a language model that
  scores how likely a sequence of words is, and that language model can be
  augmented at runtime with the context vocabulary.
- This is how the service handles proper nouns and technical terms without
  retraining: by injecting them into the decoding graph on a per-session basis.
- Acoustic context also matters, so the service can be seeded with the acoustic
  conditions of the expected audio, such as a noisy call center, which changes
  the noise handling.

Context is applied carefully because it can cause the model to hallucinate.

- A biased vocabulary turns every ambiguous sound into a preferred term, so each
  contextual boost is bounded and applied with a confidence check: if the
  acoustics are very uncertain, the context may win, but if the audio clearly
  says something else, the context must yield.
- Corrections from users are a powerful signal, so accepted corrections update
  the domain lexicon and are fed back into the evaluation set.
- The result is a loop where the service gets more accurate for a customer over
  time as it learns their vocabulary, without ever modifying the core acoustic
  model.

### Q: How do you process batch audio files?

**A:** Batch processing exists for audio that is too long or too asynchronous for
streaming, such as recorded meetings, voice mails, and archived podcasts.

- The client uploads the file through the API Gateway, which validates the
  format, codec, and length, then enqueues a job in the Batch Queue with
  metadata such as the expected language and domain.
- Workers pull jobs and route them to the same ASR Engine used for streaming,
  but configured for accuracy: larger context windows, more decoding passes, and
  no latency deadline.
- Each job carries an identifier, and the client polls for status or receives a
  notification when the transcript is ready.

Large files are processed in segments to bound memory and enable parallelism.

- The audio is split into overlapping chunks, each chunk is transcribed
  independently, and the overlap lets the assembler stitch the segments back
  together without losing words at the boundaries.
- Because segments are independent, the workload parallelizes across a worker
  pool, and queue depth becomes the scaling signal: when jobs back up, more
  workers spin up.
- The overlap region also gives the service a natural place to reconcile
  duplicate words and to keep diarization and timestamps consistent across
  segment boundaries.

Batch quality is monitored differently from streaming quality.

- Each job's transcripts carry confidence distributions, and jobs are sampled
  for human or model-based evaluation to catch systematic degradation.
- Long jobs are resumable, so a worker crash does not restart an hour of audio
  from scratch; progress is checkpointed per segment.
- Jobs also have priority tiers, so a small urgent file can skip ahead of a
  queue full of long meetings.
- The transcript is stored with the audio reference, the model version, and
  timing information, making every batch job auditable and reproducible when the
  model improves.

## Source

```text
title: Speech Recognition
node user: User [round, icon=browser]
node app: Speech App [icon=browser]
node gateway: API Gateway [icon=server]
node stream: Audio Stream [icon=queue]
node asr: ASR Engine [icon=compute]
node diarize: Speaker Diarization [icon=users]
node models: Model Serving [icon=cloud]
node context: Context Service [icon=search]
node queue: Batch Queue [icon=queue]
node notify: Notifications [icon=message]
node db: Transcripts DB [cylinder, icon=database]

edge user -> app: speak
edge app -> gateway: stream
edge gateway -> stream: buffer
edge stream -> asr: chunks
edge asr -> models: decode
edge asr -> diarize: speakers
edge asr -> context: refine
edge context -> app: live text
edge gateway -> queue: batch
edge queue -> asr: process
edge asr -> db: store
edge gateway -> notify: done
```
