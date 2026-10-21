# Google Translate — Translation

Design a translation service

**Difficulty:** Hard

**Tags:** cache, ml, translation

## Functional Requirements

- a translation service
- serve translation models at scale?
- detect source language automatically?
- translate documents while preserving format?
- cache translations safely?

## Non-Functional Requirements

- A translation service accepts text in one language and returns it in another,
  and the hard problems are all about the model serving layer.

- The client sends text through the API Gateway.
- The gateway first asks the Language Detect service to identify the source
  language when it is not supplied.
- It then passes the request to the Translation Engine.
- The engine consults the Translation Cache for an exact or fuzzy match.
- On a miss it performs a neural model inference through the Model Serving tier.
- A Format Preserver handles the special case of structured documents, keeping
  layout and markup intact while only the natural-language content is
  translated.
- Batch jobs flow through the Batch Queue.
- The Usage Tracking service logs every translation for billing and model
  improvement.

The architectural heart is the separation between a stateless, latency critical
inference path and a durable, asynchronous accounting and training path.

- Individual text translation must return in well under a second, so it runs
  against a dedicated GPU inference fleet sized for peak load.
- Everything that can be decided without the model is decided earlier.
- The cache absorbs repeated phrases.
- Language detection uses a fast statistical model before any heavy neural work.
- The result is that only genuinely novel text reaches the expensive inference
  tier, which both controls cost and keeps latency predictable.

Quality is the product, so the service must balance three currencies: speed,
cost, and accuracy.

- Latency drives the serving architecture.
- GPU cost drives caching and batching.
- Accuracy drives model choice and continuous evaluation.
- The design deliberately keeps the model serving layer pluggable, because
  models are retrained and replaced frequently.
- A feedback loop collects user corrections and system-sampled evaluations to
  measure quality drift per language pair.
- A deployment pipeline can roll out a new model to a fraction of traffic before
  promoting it broadly..
- Model serving is the cost center of the system, so it is engineered for
  throughput per GPU.

- The Translation Engine does not talk to one monolithic model; it talks to a
  Model Serving tier that runs a family of models, one per language pair or
  language family.
- It routes each request to the smallest model that can handle it.
- Models are batched at the serving layer: a GPU decoder is dramatically more
  efficient when it processes many sentences in one batch.
- The engine buffers requests for a few milliseconds and packs them into a
  single inference call.
- This adds a controlled amount of latency in exchange for an order of magnitude
  better hardware utilization.

The fleet is sharded by language.

- Popular pairs such as English to Spanish get dedicated capacity, while
  long-tail pairs share pools.
- A spike in one language does not steal capacity from another.
- Autoscaling is driven by queue depth at the serving tier rather than CPU,
  because the correct signal is how long inference waits behind the batch.
- Each model version runs alongside the previous one during rollout, with a
  shadow or canary phase.
- A regression in translation quality can be caught and rolled back without
  affecting all users.

Serving also relies on a hot model cache.

- Common sentences, greetings, and high-frequency business phrases are cached in
  front of the model.
- A hash of the normalized source and target language indexes the cache.
- The cache is most effective for repeated strings such as UI text, product
  descriptions, and customer replies.
- Because models improve, cache entries are versioned by model ID so a new model
  invalidates the cache naturally.
- The inference tier is the only place the expensive work happens.
- Every layer in front of it exists to ensure the model is asked to do as little
  as possible..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Translation Service
user: User
app: Translate App
gateway: API Gateway
detect: Language Detect
translate: Translation Engine
models: Model Serving
format: Format Preserver
cache: Translation Cache
queue: Batch Queue
audit: Usage Tracking
db: Usage DB

user ─► app ─► input text
app ─► gateway ─► request
gateway ─► detect ─► language
gateway ─► translate ─► translate
translate ─► models ─► infer
translate ─► cache ─► check
models ─► cache ─► store
gateway ─► format ─► document
format ─► app ─► output
gateway ─► queue ─► batch
queue ─► audit ─► log
audit ─► db ─► store
```

## Design

### Design a translation service

A translation service accepts text in one language and returns it in another,
and the hard problems are all about the model serving layer.

- The client sends text through the API Gateway.
- The gateway first asks the Language Detect service to identify the source
  language when it is not supplied.
- It then passes the request to the Translation Engine.
- The engine consults the Translation Cache for an exact or fuzzy match.
- On a miss it performs a neural model inference through the Model Serving tier.
- A Format Preserver handles the special case of structured documents, keeping
  layout and markup intact while only the natural-language content is
  translated.
- Batch jobs flow through the Batch Queue.
- The Usage Tracking service logs every translation for billing and model
  improvement.

The architectural heart is the separation between a stateless, latency critical
inference path and a durable, asynchronous accounting and training path.

- Individual text translation must return in well under a second, so it runs
  against a dedicated GPU inference fleet sized for peak load.
- Everything that can be decided without the model is decided earlier.
- The cache absorbs repeated phrases.
- Language detection uses a fast statistical model before any heavy neural work.
- The result is that only genuinely novel text reaches the expensive inference
  tier, which both controls cost and keeps latency predictable.

Quality is the product, so the service must balance three currencies: speed,
cost, and accuracy.

- Latency drives the serving architecture.
- GPU cost drives caching and batching.
- Accuracy drives model choice and continuous evaluation.
- The design deliberately keeps the model serving layer pluggable, because
  models are retrained and replaced frequently.
- A feedback loop collects user corrections and system-sampled evaluations to
  measure quality drift per language pair.
- A deployment pipeline can roll out a new model to a fraction of traffic before
  promoting it broadly.

### How do you serve translation models at scale?

Model serving is the cost center of the system, so it is engineered for
throughput per GPU.

- The Translation Engine does not talk to one monolithic model; it talks to a
  Model Serving tier that runs a family of models, one per language pair or
  language family.
- It routes each request to the smallest model that can handle it.
- Models are batched at the serving layer: a GPU decoder is dramatically more
  efficient when it processes many sentences in one batch.
- The engine buffers requests for a few milliseconds and packs them into a
  single inference call.
- This adds a controlled amount of latency in exchange for an order of magnitude
  better hardware utilization.

The fleet is sharded by language.

- Popular pairs such as English to Spanish get dedicated capacity, while
  long-tail pairs share pools.
- A spike in one language does not steal capacity from another.
- Autoscaling is driven by queue depth at the serving tier rather than CPU,
  because the correct signal is how long inference waits behind the batch.
- Each model version runs alongside the previous one during rollout, with a
  shadow or canary phase.
- A regression in translation quality can be caught and rolled back without
  affecting all users.

Serving also relies on a hot model cache.

- Common sentences, greetings, and high-frequency business phrases are cached in
  front of the model.
- A hash of the normalized source and target language indexes the cache.
- The cache is most effective for repeated strings such as UI text, product
  descriptions, and customer replies.
- Because models improve, cache entries are versioned by model ID so a new model
  invalidates the cache naturally.
- The inference tier is the only place the expensive work happens.
- Every layer in front of it exists to ensure the model is asked to do as little
  as possible.

### How do you detect source language automatically?

Language detection runs before translation and needs to be near-instant and
cheap.

- The detection model is statistical rather than neural: it uses character
  n-gram distributions, because each language has a distinctive profile of which
  letter sequences are common, plus a small list of highly discriminative
  function words.
- The detector scores the input text against every language model it knows and
  returns the highest-probability match with a confidence score.
- For very short inputs, where character statistics are weak, the detector
  combines script detection — the character set itself often identifies the
  language family — with fallback rules and a list of common words.

The real challenge is ambiguity.

- "Hello" is English, but single words and proper nouns can be ambiguous across
  languages.
- Code-switched text mixes languages within one sentence.
- The detector is therefore trained to produce a confidence value.
- Low-confidence results are handled explicitly rather than guessed.
- When the user supplies a source language, detection is skipped entirely.
- The API returns the detected language alongside the translation so clients can
  confirm it.
- Mixing within a document is handled at the sentence level, which is a good
  unit for both detection and translation.

Detection must also degrade gracefully under adversarial or unusual input.

- Emoji, URLs, brand names, and markup add noise, so text is normalized before
  scoring: markup is stripped, URLs are removed, and casing is ignored.
- The detector is trained on the same noisy distribution it sees in production,
  including tweets and chat messages, not clean prose.
- A special case is short text from a language that shares a script, such as
  Serbian and Croatian, where n-gram models are very close.
- For these pairs the service may report a family-level language and let the
  translation model handle the ambiguity.

### How do you translate documents while preserving format?

Translating a document is fundamentally different from translating a plain
string, because the content is interleaved with structure that must survive
translation.

- The Format Preserver first parses the document into a tree of blocks:
  headings, paragraphs, tables, lists, and code spans, with their formatting
  attributes.
- Only the leaf text nodes are extracted as segments for translation, while the
  surrounding structure is held aside as a template.
- After each text segment is translated, it is reinserted into its original
  position in the tree.
- The document is serialized back to its native format.
- The output is a translated document that is structurally identical to the
  input.

Markup and placeholders are the subtle danger.

- URLs, HTML entities, template variables, and inline code must not be
  translated, so the parser marks them as protected spans before segmentation.
- The translation engine receives placeholder tokens in place of these spans and
  restores them afterward.
- This also protects the model from being confused by embedded syntax.
- The same mechanism handles formatting boundaries that the model must not
  cross, such as a sentence split across a bold tag, where the translator is
  forced to keep the formatting split in the same place.
- Length constraints are handled at this layer too, since translated text is
  often longer or shorter than the source and must still fit table columns.

The service batches structured translation asynchronously.

- Large documents are split into many segments, which are processed through the
  same batch path as other bulk translation and reassembled by the format layer
  once all segments complete.
- Long-running jobs return a job identifier and the client polls for completion.
- Alignment must be preserved end to end, so each segment carries a stable
  identifier that maps it back to its position in the document tree.
- The final check is a round-trip validation that every source segment has
  exactly one translated counterpart, catching dropped or duplicated segments
  before the document is released.

### How do you cache translations safely?

Caching translations saves money but risks serving stale or wrong output, so the
cache is designed conservatively.

- The cache key is the normalized source text, source language, target language,
  and model version.
- Only high-confidence translations are written into it.
- A phrase that the model produced with low confidence is never cached, because
  serving that guess to thousands of users compounds one weak inference.
- The Translation Cache is a distributed cache with a TTL.
- Entries are versioned so a model upgrade invalidates the old translations
  without a manual flush.
- Content that is naturally cacheable — UI strings, product names, and templates
  — dominates the hit rate while free-form user text rarely hits.

Safety also means not caching content that must not be retained.

- Sensitive text, personal messages, and legally protected content are handled
  differently.
- The service marks requests with a no-store policy.
- Compliance rules prevent certain tenants from being written to the cache at
  all.
- Cache reads are exact-match on normalized text.
- Normalization is deliberate — lowercasing and trimming — so subtle differences
  do not produce near-miss collisions that serve the wrong translation for a
  slightly different input.
- Hash collisions are resolved by storing the full key with the value and
  verifying it on every read.

Cache poisoning is guarded against because the cache is write-only from the
translation path.

- Only the Translation Engine can write entries, and it writes only from
  verified model output, so a client cannot inject a value.
- The cache is monitored for hit-rate and correctness drift per language pair.
- A sudden change in either triggers an investigation before the model or cache
  is trusted again.
- TTLs are chosen per content class — shorter for slang and idiomatic phrases
  that change meaning quickly, longer for technical terminology.
- The whole layer is designed so that a total cache failure degrades to slower
  service, never to incorrect service.

## Source

```text
title: Translation Service
node user: User [round, icon=browser]
node app: Translate App [icon=browser]
node gateway: API Gateway [icon=server]
node detect: Language Detect [icon=search]
node translate: Translation Engine [icon=compute]
node models: Model Serving [icon=cloud]
node format: Format Preserver [icon=file]
node cache: Translation Cache [cylinder, icon=cache]
node queue: Batch Queue [icon=queue]
node audit: Usage Tracking [icon=compute]
node db: Usage DB [cylinder, icon=database]

edge user -> app: input text
edge app -> gateway: request
edge gateway -> detect: language
edge gateway -> translate: translate
edge translate -> models: infer
edge translate -> cache: check
edge models -> cache: store
edge gateway -> format: document
edge format -> app: output
edge gateway -> queue: batch
edge queue -> audit: log
edge audit -> db: store
```

## Q&A

### Q: Design a translation service

**A:** A translation service accepts text in one language and returns it in another,
and the hard problems are all about the model serving layer.

- The client sends text through the API Gateway.
- The gateway first asks the Language Detect service to identify the source
  language when it is not supplied.
- It then passes the request to the Translation Engine.
- The engine consults the Translation Cache for an exact or fuzzy match.
- On a miss it performs a neural model inference through the Model Serving tier.
- A Format Preserver handles the special case of structured documents, keeping
  layout and markup intact while only the natural-language content is
  translated.
- Batch jobs flow through the Batch Queue.
- The Usage Tracking service logs every translation for billing and model
  improvement.

The architectural heart is the separation between a stateless, latency critical
inference path and a durable, asynchronous accounting and training path.

- Individual text translation must return in well under a second, so it runs
  against a dedicated GPU inference fleet sized for peak load.
- Everything that can be decided without the model is decided earlier.
- The cache absorbs repeated phrases.
- Language detection uses a fast statistical model before any heavy neural work.
- The result is that only genuinely novel text reaches the expensive inference
  tier, which both controls cost and keeps latency predictable.

Quality is the product, so the service must balance three currencies: speed,
cost, and accuracy.

- Latency drives the serving architecture.
- GPU cost drives caching and batching.
- Accuracy drives model choice and continuous evaluation.
- The design deliberately keeps the model serving layer pluggable, because
  models are retrained and replaced frequently.
- A feedback loop collects user corrections and system-sampled evaluations to
  measure quality drift per language pair.
- A deployment pipeline can roll out a new model to a fraction of traffic before
  promoting it broadly.

### Q: How do you serve translation models at scale?

**A:** Model serving is the cost center of the system, so it is engineered for
throughput per GPU.

- The Translation Engine does not talk to one monolithic model; it talks to a
  Model Serving tier that runs a family of models, one per language pair or
  language family.
- It routes each request to the smallest model that can handle it.
- Models are batched at the serving layer: a GPU decoder is dramatically more
  efficient when it processes many sentences in one batch.
- The engine buffers requests for a few milliseconds and packs them into a
  single inference call.
- This adds a controlled amount of latency in exchange for an order of magnitude
  better hardware utilization.

The fleet is sharded by language.

- Popular pairs such as English to Spanish get dedicated capacity, while
  long-tail pairs share pools.
- A spike in one language does not steal capacity from another.
- Autoscaling is driven by queue depth at the serving tier rather than CPU,
  because the correct signal is how long inference waits behind the batch.
- Each model version runs alongside the previous one during rollout, with a
  shadow or canary phase.
- A regression in translation quality can be caught and rolled back without
  affecting all users.

Serving also relies on a hot model cache.

- Common sentences, greetings, and high-frequency business phrases are cached in
  front of the model.
- A hash of the normalized source and target language indexes the cache.
- The cache is most effective for repeated strings such as UI text, product
  descriptions, and customer replies.
- Because models improve, cache entries are versioned by model ID so a new model
  invalidates the cache naturally.
- The inference tier is the only place the expensive work happens.
- Every layer in front of it exists to ensure the model is asked to do as little
  as possible.

### Q: How do you detect source language automatically?

**A:** Language detection runs before translation and needs to be near-instant and
cheap.

- The detection model is statistical rather than neural: it uses character
  n-gram distributions, because each language has a distinctive profile of which
  letter sequences are common, plus a small list of highly discriminative
  function words.
- The detector scores the input text against every language model it knows and
  returns the highest-probability match with a confidence score.
- For very short inputs, where character statistics are weak, the detector
  combines script detection — the character set itself often identifies the
  language family — with fallback rules and a list of common words.

The real challenge is ambiguity.

- "Hello" is English, but single words and proper nouns can be ambiguous across
  languages.
- Code-switched text mixes languages within one sentence.
- The detector is therefore trained to produce a confidence value.
- Low-confidence results are handled explicitly rather than guessed.
- When the user supplies a source language, detection is skipped entirely.
- The API returns the detected language alongside the translation so clients can
  confirm it.
- Mixing within a document is handled at the sentence level, which is a good
  unit for both detection and translation.

Detection must also degrade gracefully under adversarial or unusual input.

- Emoji, URLs, brand names, and markup add noise, so text is normalized before
  scoring: markup is stripped, URLs are removed, and casing is ignored.
- The detector is trained on the same noisy distribution it sees in production,
  including tweets and chat messages, not clean prose.
- A special case is short text from a language that shares a script, such as
  Serbian and Croatian, where n-gram models are very close.
- For these pairs the service may report a family-level language and let the
  translation model handle the ambiguity.

### Q: How do you translate documents while preserving format?

**A:** Translating a document is fundamentally different from translating a plain
string, because the content is interleaved with structure that must survive
translation.

- The Format Preserver first parses the document into a tree of blocks:
  headings, paragraphs, tables, lists, and code spans, with their formatting
  attributes.
- Only the leaf text nodes are extracted as segments for translation, while the
  surrounding structure is held aside as a template.
- After each text segment is translated, it is reinserted into its original
  position in the tree.
- The document is serialized back to its native format.
- The output is a translated document that is structurally identical to the
  input.

Markup and placeholders are the subtle danger.

- URLs, HTML entities, template variables, and inline code must not be
  translated, so the parser marks them as protected spans before segmentation.
- The translation engine receives placeholder tokens in place of these spans and
  restores them afterward.
- This also protects the model from being confused by embedded syntax.
- The same mechanism handles formatting boundaries that the model must not
  cross, such as a sentence split across a bold tag, where the translator is
  forced to keep the formatting split in the same place.
- Length constraints are handled at this layer too, since translated text is
  often longer or shorter than the source and must still fit table columns.

The service batches structured translation asynchronously.

- Large documents are split into many segments, which are processed through the
  same batch path as other bulk translation and reassembled by the format layer
  once all segments complete.
- Long-running jobs return a job identifier and the client polls for completion.
- Alignment must be preserved end to end, so each segment carries a stable
  identifier that maps it back to its position in the document tree.
- The final check is a round-trip validation that every source segment has
  exactly one translated counterpart, catching dropped or duplicated segments
  before the document is released.

### Q: How do you cache translations safely?

**A:** Caching translations saves money but risks serving stale or wrong output, so the
cache is designed conservatively.

- The cache key is the normalized source text, source language, target language,
  and model version.
- Only high-confidence translations are written into it.
- A phrase that the model produced with low confidence is never cached, because
  serving that guess to thousands of users compounds one weak inference.
- The Translation Cache is a distributed cache with a TTL.
- Entries are versioned so a model upgrade invalidates the old translations
  without a manual flush.
- Content that is naturally cacheable — UI strings, product names, and templates
  — dominates the hit rate while free-form user text rarely hits.

Safety also means not caching content that must not be retained.

- Sensitive text, personal messages, and legally protected content are handled
  differently.
- The service marks requests with a no-store policy.
- Compliance rules prevent certain tenants from being written to the cache at
  all.
- Cache reads are exact-match on normalized text.
- Normalization is deliberate — lowercasing and trimming — so subtle differences
  do not produce near-miss collisions that serve the wrong translation for a
  slightly different input.
- Hash collisions are resolved by storing the full key with the value and
  verifying it on every read.

Cache poisoning is guarded against because the cache is write-only from the
translation path.

- Only the Translation Engine can write entries, and it writes only from
  verified model output, so a client cannot inject a value.
- The cache is monitored for hit-rate and correctness drift per language pair.
- A sudden change in either triggers an investigation before the model or cache
  is trusted again.
- TTLs are chosen per content class — shorter for slang and idiomatic phrases
  that change meaning quickly, longer for technical terminology.
- The whole layer is designed so that a total cache failure degrades to slower
  service, never to incorrect service.

## Source

```text
title: Translation Service
node user: User [round, icon=browser]
node app: Translate App [icon=browser]
node gateway: API Gateway [icon=server]
node detect: Language Detect [icon=search]
node translate: Translation Engine [icon=compute]
node models: Model Serving [icon=cloud]
node format: Format Preserver [icon=file]
node cache: Translation Cache [cylinder, icon=cache]
node queue: Batch Queue [icon=queue]
node audit: Usage Tracking [icon=compute]
node db: Usage DB [cylinder, icon=database]

edge user -> app: input text
edge app -> gateway: request
edge gateway -> detect: language
edge gateway -> translate: translate
edge translate -> models: infer
edge translate -> cache: check
edge models -> cache: store
edge gateway -> format: document
edge format -> app: output
edge gateway -> queue: batch
edge queue -> audit: log
edge audit -> db: store
```
