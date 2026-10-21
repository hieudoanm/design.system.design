# Grammarly — Grammar Checker

Design a grammar and writing assistant

**Difficulty:** Hard

**Tags:** ml

## Functional Requirements

- a grammar and writing assistant
- detect grammar errors at scale?
- combine rules with language models?
- suggest style improvements?
- protect user privacy?

## Non-Functional Requirements

- A writing assistant inspects text as it is typed and flags grammar, style, and
  clarity issues with suggestions.

- The request path starts in the Editor Plugin, which batches a segment of the
  user's writing and submits it through the API Gateway.
- The Parsing Service splits the text into sentences and builds a syntactic
  parse, then hands the parsed structure to the Rule Engine, which applies
  deterministic grammar and punctuation rules.
- The Language Model verifies and augments the rule findings with a softer,
  statistical view of what a fluent speaker would write.
- The Style Scorer evaluates the same text for readability and tone, and the
  Rewrite Service turns any flagged issue into concrete suggested text that
  flows back to the plugin for display.

The key architectural decision is layering deterministic rules under a language
model.

- Rules are fast, explainable, and precise for the cases they cover, such as
  subject-verb agreement and comma placement.
- The model catches everything a rule list cannot enumerate, but it is slower,
  more expensive, and harder to explain.
- By running rules first and using the model for verification and coverage of
  the long tail, the system keeps the common path cheap while still handling
  novel phrasing.
- A Check Cache memoizes identical segments, and a Privacy Filter sits between
  the user and storage so raw text never reaches persistent logs unfiltered.

Latency is the binding constraint because checking is interactive.

- The plugin submits a sentence at a time, not a whole document, so the first
  result arrives in a few hundred milliseconds and the rest stream in.
- The pipeline is designed to return partial results, showing the certain rule
  findings immediately and appending model-driven suggestions as they finish.
- Scale is handled by stateless services behind the gateway, so check capacity
  grows by adding instances, and the cache absorbs the heavy duplication of
  people writing similar sentences..
- Grammar detection starts with parsing.

- The Parsing Service must assign a parts-of-speech tag and a dependency or
  phrase-structure parse to every sentence, because nearly every grammar rule is
  expressed over that structure.
- The parser runs on a server with precomputed models, and the resulting tree is
  the shared input to all downstream stages.
- Parsing is the expensive part of the pipeline, so it is the natural place to
  cache and to bound input size.
- Sentences are processed independently, which makes the work embarrassingly
  parallel across the fleet and across the document.

On top of the parse, the Rule Engine applies a catalog of deterministic checks.

- Each rule is a pattern over tokens and their syntactic roles, such as "a
  determiner before a plural noun is missing" or "the verb does not agree with
  the subject in person and number".
- Rules are compiled into an efficient matcher that walks the parse once, and
  each match produces a category, a severity, and a message.
- This stage is extremely fast and fully deterministic, which means it is
  unit-testable and its behavior can be tuned precisely.
- The rule catalog is versioned and shipped as data, not code, so new checks
  deploy without redeploying services.

Scaling detection means making the pipeline stateless and horizontally
replicable.

- Any instance can parse and check any sentence, so the gateway load-balances
  freely and failures are retried on a different instance.
- The per-instance cache stores parses and results keyed by a hash of the text,
  so repeated submissions of the same sentence, which happen constantly in
  editing, never reach the parser again.
- Throughput is governed by parser cost rather than rule cost, so the system
  measures parser latency and autoscales that tier aggressively while the rule
  tier rides along cheaply..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Grammar Checker
user: User
app: Editor Plugin
gateway: API Gateway
parse: Parsing Service
rules: Rule Engine
model: Language Model
style: Style Scorer
rewrite: Rewrite Service
cache: Check Cache
privacy: Privacy Filter
db: Usage DB

user ─► app ─► write
app ─► gateway ─► submit
gateway ─► parse ─► sentences
parse ─► rules ─► check
rules ─► model ─► verify
model ─► style ─► score
style ─► rewrite ─► suggest
rewrite ─► app ─► display
app ─► privacy ─► scrub
privacy ─► cache ─► store
gateway ─► db ─► log
```

## Design

### Design a grammar and writing assistant

A writing assistant inspects text as it is typed and flags grammar, style, and
clarity issues with suggestions.

- The request path starts in the Editor Plugin, which batches a segment of the
  user's writing and submits it through the API Gateway.
- The Parsing Service splits the text into sentences and builds a syntactic
  parse, then hands the parsed structure to the Rule Engine, which applies
  deterministic grammar and punctuation rules.
- The Language Model verifies and augments the rule findings with a softer,
  statistical view of what a fluent speaker would write.
- The Style Scorer evaluates the same text for readability and tone, and the
  Rewrite Service turns any flagged issue into concrete suggested text that
  flows back to the plugin for display.

The key architectural decision is layering deterministic rules under a language
model.

- Rules are fast, explainable, and precise for the cases they cover, such as
  subject-verb agreement and comma placement.
- The model catches everything a rule list cannot enumerate, but it is slower,
  more expensive, and harder to explain.
- By running rules first and using the model for verification and coverage of
  the long tail, the system keeps the common path cheap while still handling
  novel phrasing.
- A Check Cache memoizes identical segments, and a Privacy Filter sits between
  the user and storage so raw text never reaches persistent logs unfiltered.

Latency is the binding constraint because checking is interactive.

- The plugin submits a sentence at a time, not a whole document, so the first
  result arrives in a few hundred milliseconds and the rest stream in.
- The pipeline is designed to return partial results, showing the certain rule
  findings immediately and appending model-driven suggestions as they finish.
- Scale is handled by stateless services behind the gateway, so check capacity
  grows by adding instances, and the cache absorbs the heavy duplication of
  people writing similar sentences.

### How do you detect grammar errors at scale?

Grammar detection starts with parsing.

- The Parsing Service must assign a parts-of-speech tag and a dependency or
  phrase-structure parse to every sentence, because nearly every grammar rule is
  expressed over that structure.
- The parser runs on a server with precomputed models, and the resulting tree is
  the shared input to all downstream stages.
- Parsing is the expensive part of the pipeline, so it is the natural place to
  cache and to bound input size.
- Sentences are processed independently, which makes the work embarrassingly
  parallel across the fleet and across the document.

On top of the parse, the Rule Engine applies a catalog of deterministic checks.

- Each rule is a pattern over tokens and their syntactic roles, such as "a
  determiner before a plural noun is missing" or "the verb does not agree with
  the subject in person and number".
- Rules are compiled into an efficient matcher that walks the parse once, and
  each match produces a category, a severity, and a message.
- This stage is extremely fast and fully deterministic, which means it is
  unit-testable and its behavior can be tuned precisely.
- The rule catalog is versioned and shipped as data, not code, so new checks
  deploy without redeploying services.

Scaling detection means making the pipeline stateless and horizontally
replicable.

- Any instance can parse and check any sentence, so the gateway load-balances
  freely and failures are retried on a different instance.
- The per-instance cache stores parses and results keyed by a hash of the text,
  so repeated submissions of the same sentence, which happen constantly in
  editing, never reach the parser again.
- Throughput is governed by parser cost rather than rule cost, so the system
  measures parser latency and autoscales that tier aggressively while the rule
  tier rides along cheaply.

### How do you combine rules with language models?

Rules and language models are complementary, and the architecture treats the
model as a verification and generalization layer rather than a replacement.

- A rule fires with high precision on a narrow pattern, but it cannot judge
  whether the flagged construction is actually natural in context.
- The Language Model scores the sentence as written and the sentence as the rule
  proposes fixing it; if the model strongly prefers the corrected version, the
  suggestion is surfaced with confidence, and if the model considers both
  equally natural or prefers the original, the finding is downgraded or
  suppressed.
- This prevents the classic failure where a grammar checker corrects idiomatic
  phrasing into stilted prose.

The model also extends coverage to errors no rule encodes.

- Agreement between distant words, awkward collocations, and preposition choices
  are all better expressed as probabilities over a sequence than as pattern
  matches.
- For these, the model produces a candidate repair by scoring alternative
  continuations and selecting the most probable one, subject to a minimum
  confidence threshold.
- Because model inference is expensive, the pipeline runs rules first and only
  invokes the model when needed, either to verify a rule finding or to examine
  sentence regions that rules could not classify confidently.

Combining the two requires a confidence framework that decides which source wins
when they disagree.

- Every finding carries a score, and a policy layer merges rule findings and
  model findings into a single ordered list for the user.
- The merge is tuned against labeled evaluation data, where the ground truth is
  whether a native speaker would accept the suggestion.
- The language model itself is versioned and monitored for drift, and both the
  rule output and the model output are logged so the team can trace why a
  particular suggestion appeared.

### How do you suggest style improvements?

Style is distinct from grammar: grammar errors are objectively wrong, while
style suggestions are about clarity, tone, and readability.

- The Style Scorer evaluates the text along dimensions such as sentence length,
  passive voice, nominalizations, redundancy, and vocabulary sophistication.
- Each dimension produces a score, and the scores are combined into an overall
  readability and tone profile.
- The scorer is deliberately rule-based and interpretable, so a user can see why
  a suggestion was made, rather than a black box.
- Style preferences differ by audience, so the scorer is parameterized by a
  target tone, such as formal, casual, or persuasive.

The Rewrite Service turns a style score into concrete text.

- For each dimension that falls below target, it generates one or more rewrites
  of the affected sentence, favoring minimal edits over wholesale rewrites
  because users accept small changes far more often.
- The Language Model generates the candidate rewrites, and a scoring step
  selects the best one by balancing fluency, the style score improvement, and
  the edit distance from the original.
- Suggestions that change the user's meaning are rejected, which is the critical
  quality gate, because a fluent but wrong rewrite destroys trust.

Style suggestions are served separately from grammar findings so the user can
act on them selectively.

- Because style is subjective, the system learns preferences from the user's
  accept and dismiss behavior, stored per user and used to tune the style
  targets and the rewrite style.
- Aggregated acceptance data also tunes the global system, so the rewrite
  selector improves over time.
- The whole stage is designed to be conservative: a missed style suggestion
  costs little, while a bad rewrite that misrepresents the user's words costs a
  lot.

### How do you protect user privacy?

The writing that flows through the system is deeply sensitive, so privacy is an
architectural requirement rather than an afterthought.

- The Privacy Filter is placed on the write path, before any text is stored or
  sent to external services.
- Its job is to transform the user's text into a form that cannot be reassembled
  into the original while still being usable for improvement.
- The filter strips identifiers, hashes substrings, and can redact or replace
  named entities, and only the scrubbed form reaches the cache, the Usage DB,
  and any logging.
- The raw text exists only transiently in the request pipeline and is never
  persisted.

The serving path is designed to minimize contact with raw text at all.

- Inference runs on infrastructure that is contractually isolated, and the
  privacy scrub applies to cache keys and stored check results so that even a
  compromised cache cannot reveal what the user wrote.
- When external language model providers are used, only the minimal sentence
  needed for inference is sent, with the same scrubbing applied, and a policy
  requires that inputs are not retained.
- The user controls the tradeoff explicitly, with toggles for whether their text
  may be used to improve the product at all.

Privacy protection extends to what can be inferred from behavior.

- The system avoids storing user-identifiable writing patterns in the Usage DB,
  keeping only aggregated, anonymized error and acceptance statistics that
  cannot be joined back to an individual.
- Differential aggregation and strict access controls cover the analytics tier.
- The design treats privacy as a data-flow property: any component that touches
  text must declare whether it stores, retains, or shares, and the Privacy
  Filter enforces those declarations at the boundary.
- The result is that the product can learn from mistakes without ever learning
  what the user actually wrote.

## Source

```text
title: Grammar Checker
node user: User [round, icon=browser]
node app: Editor Plugin [icon=browser]
node gateway: API Gateway [icon=server]
node parse: Parsing Service [icon=compute]
node rules: Rule Engine [icon=compute]
node model: Language Model [icon=cloud]
node style: Style Scorer [icon=compute]
node rewrite: Rewrite Service [icon=compute]
node cache: Check Cache [cylinder, icon=cache]
node privacy: Privacy Filter [icon=shield]
node db: Usage DB [cylinder, icon=database]

edge user -> app: write
edge app -> gateway: submit
edge gateway -> parse: sentences
edge parse -> rules: check
edge rules -> model: verify
edge model -> style: score
edge style -> rewrite: suggest
edge rewrite -> app: display
edge app -> privacy: scrub
edge privacy -> cache: store
edge gateway -> db: log
```

## Q&A

### Q: Design a grammar and writing assistant

**A:** A writing assistant inspects text as it is typed and flags grammar, style, and
clarity issues with suggestions.

- The request path starts in the Editor Plugin, which batches a segment of the
  user's writing and submits it through the API Gateway.
- The Parsing Service splits the text into sentences and builds a syntactic
  parse, then hands the parsed structure to the Rule Engine, which applies
  deterministic grammar and punctuation rules.
- The Language Model verifies and augments the rule findings with a softer,
  statistical view of what a fluent speaker would write.
- The Style Scorer evaluates the same text for readability and tone, and the
  Rewrite Service turns any flagged issue into concrete suggested text that
  flows back to the plugin for display.

The key architectural decision is layering deterministic rules under a language
model.

- Rules are fast, explainable, and precise for the cases they cover, such as
  subject-verb agreement and comma placement.
- The model catches everything a rule list cannot enumerate, but it is slower,
  more expensive, and harder to explain.
- By running rules first and using the model for verification and coverage of
  the long tail, the system keeps the common path cheap while still handling
  novel phrasing.
- A Check Cache memoizes identical segments, and a Privacy Filter sits between
  the user and storage so raw text never reaches persistent logs unfiltered.

Latency is the binding constraint because checking is interactive.

- The plugin submits a sentence at a time, not a whole document, so the first
  result arrives in a few hundred milliseconds and the rest stream in.
- The pipeline is designed to return partial results, showing the certain rule
  findings immediately and appending model-driven suggestions as they finish.
- Scale is handled by stateless services behind the gateway, so check capacity
  grows by adding instances, and the cache absorbs the heavy duplication of
  people writing similar sentences.

### Q: How do you detect grammar errors at scale?

**A:** Grammar detection starts with parsing.

- The Parsing Service must assign a parts-of-speech tag and a dependency or
  phrase-structure parse to every sentence, because nearly every grammar rule is
  expressed over that structure.
- The parser runs on a server with precomputed models, and the resulting tree is
  the shared input to all downstream stages.
- Parsing is the expensive part of the pipeline, so it is the natural place to
  cache and to bound input size.
- Sentences are processed independently, which makes the work embarrassingly
  parallel across the fleet and across the document.

On top of the parse, the Rule Engine applies a catalog of deterministic checks.

- Each rule is a pattern over tokens and their syntactic roles, such as "a
  determiner before a plural noun is missing" or "the verb does not agree with
  the subject in person and number".
- Rules are compiled into an efficient matcher that walks the parse once, and
  each match produces a category, a severity, and a message.
- This stage is extremely fast and fully deterministic, which means it is
  unit-testable and its behavior can be tuned precisely.
- The rule catalog is versioned and shipped as data, not code, so new checks
  deploy without redeploying services.

Scaling detection means making the pipeline stateless and horizontally
replicable.

- Any instance can parse and check any sentence, so the gateway load-balances
  freely and failures are retried on a different instance.
- The per-instance cache stores parses and results keyed by a hash of the text,
  so repeated submissions of the same sentence, which happen constantly in
  editing, never reach the parser again.
- Throughput is governed by parser cost rather than rule cost, so the system
  measures parser latency and autoscales that tier aggressively while the rule
  tier rides along cheaply.

### Q: How do you combine rules with language models?

**A:** Rules and language models are complementary, and the architecture treats the
model as a verification and generalization layer rather than a replacement.

- A rule fires with high precision on a narrow pattern, but it cannot judge
  whether the flagged construction is actually natural in context.
- The Language Model scores the sentence as written and the sentence as the rule
  proposes fixing it; if the model strongly prefers the corrected version, the
  suggestion is surfaced with confidence, and if the model considers both
  equally natural or prefers the original, the finding is downgraded or
  suppressed.
- This prevents the classic failure where a grammar checker corrects idiomatic
  phrasing into stilted prose.

The model also extends coverage to errors no rule encodes.

- Agreement between distant words, awkward collocations, and preposition choices
  are all better expressed as probabilities over a sequence than as pattern
  matches.
- For these, the model produces a candidate repair by scoring alternative
  continuations and selecting the most probable one, subject to a minimum
  confidence threshold.
- Because model inference is expensive, the pipeline runs rules first and only
  invokes the model when needed, either to verify a rule finding or to examine
  sentence regions that rules could not classify confidently.

Combining the two requires a confidence framework that decides which source wins
when they disagree.

- Every finding carries a score, and a policy layer merges rule findings and
  model findings into a single ordered list for the user.
- The merge is tuned against labeled evaluation data, where the ground truth is
  whether a native speaker would accept the suggestion.
- The language model itself is versioned and monitored for drift, and both the
  rule output and the model output are logged so the team can trace why a
  particular suggestion appeared.

### Q: How do you suggest style improvements?

**A:** Style is distinct from grammar: grammar errors are objectively wrong, while
style suggestions are about clarity, tone, and readability.

- The Style Scorer evaluates the text along dimensions such as sentence length,
  passive voice, nominalizations, redundancy, and vocabulary sophistication.
- Each dimension produces a score, and the scores are combined into an overall
  readability and tone profile.
- The scorer is deliberately rule-based and interpretable, so a user can see why
  a suggestion was made, rather than a black box.
- Style preferences differ by audience, so the scorer is parameterized by a
  target tone, such as formal, casual, or persuasive.

The Rewrite Service turns a style score into concrete text.

- For each dimension that falls below target, it generates one or more rewrites
  of the affected sentence, favoring minimal edits over wholesale rewrites
  because users accept small changes far more often.
- The Language Model generates the candidate rewrites, and a scoring step
  selects the best one by balancing fluency, the style score improvement, and
  the edit distance from the original.
- Suggestions that change the user's meaning are rejected, which is the critical
  quality gate, because a fluent but wrong rewrite destroys trust.

Style suggestions are served separately from grammar findings so the user can
act on them selectively.

- Because style is subjective, the system learns preferences from the user's
  accept and dismiss behavior, stored per user and used to tune the style
  targets and the rewrite style.
- Aggregated acceptance data also tunes the global system, so the rewrite
  selector improves over time.
- The whole stage is designed to be conservative: a missed style suggestion
  costs little, while a bad rewrite that misrepresents the user's words costs a
  lot.

### Q: How do you protect user privacy?

**A:** The writing that flows through the system is deeply sensitive, so privacy is an
architectural requirement rather than an afterthought.

- The Privacy Filter is placed on the write path, before any text is stored or
  sent to external services.
- Its job is to transform the user's text into a form that cannot be reassembled
  into the original while still being usable for improvement.
- The filter strips identifiers, hashes substrings, and can redact or replace
  named entities, and only the scrubbed form reaches the cache, the Usage DB,
  and any logging.
- The raw text exists only transiently in the request pipeline and is never
  persisted.

The serving path is designed to minimize contact with raw text at all.

- Inference runs on infrastructure that is contractually isolated, and the
  privacy scrub applies to cache keys and stored check results so that even a
  compromised cache cannot reveal what the user wrote.
- When external language model providers are used, only the minimal sentence
  needed for inference is sent, with the same scrubbing applied, and a policy
  requires that inputs are not retained.
- The user controls the tradeoff explicitly, with toggles for whether their text
  may be used to improve the product at all.

Privacy protection extends to what can be inferred from behavior.

- The system avoids storing user-identifiable writing patterns in the Usage DB,
  keeping only aggregated, anonymized error and acceptance statistics that
  cannot be joined back to an individual.
- Differential aggregation and strict access controls cover the analytics tier.
- The design treats privacy as a data-flow property: any component that touches
  text must declare whether it stores, retains, or shares, and the Privacy
  Filter enforces those declarations at the boundary.
- The result is that the product can learn from mistakes without ever learning
  what the user actually wrote.

## Source

```text
title: Grammar Checker
node user: User [round, icon=browser]
node app: Editor Plugin [icon=browser]
node gateway: API Gateway [icon=server]
node parse: Parsing Service [icon=compute]
node rules: Rule Engine [icon=compute]
node model: Language Model [icon=cloud]
node style: Style Scorer [icon=compute]
node rewrite: Rewrite Service [icon=compute]
node cache: Check Cache [cylinder, icon=cache]
node privacy: Privacy Filter [icon=shield]
node db: Usage DB [cylinder, icon=database]

edge user -> app: write
edge app -> gateway: submit
edge gateway -> parse: sentences
edge parse -> rules: check
edge rules -> model: verify
edge model -> style: score
edge style -> rewrite: suggest
edge rewrite -> app: display
edge app -> privacy: scrub
edge privacy -> cache: store
edge gateway -> db: log
```
