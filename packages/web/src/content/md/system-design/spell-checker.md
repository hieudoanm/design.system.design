# Spell Checker

Design a spell checker

**Difficulty:** Hard

**Tags:** search

## Functional Requirements

- a spell checker
- store and query the dictionary?
- generate correction suggestions?
- rank suggestions by likelihood?
- handle context and proper nouns?

## Non-Functional Requirements

- A spell checker detects misspelled words and proposes corrections as a user
  types.

- The request flow starts in the Editor, where each keystroke triggers a check
  that reaches the Check Service through the API Gateway.
- The Check Service tokenizes the text into words, normalizes each word by
  lowercasing and stripping punctuation, and looks it up in the Dictionary.
- A hit means the word is correct and the pipeline stops.
- A miss hands the word to the Fuzzy Matcher, which produces likely candidates,
  and the Suggestion Ranker orders those candidates so the most probable
  correction appears first.
- A Lookup Cache sits in front to memoize repeated lookups, and every miss is
  logged to the Usage DB so the team can learn which corrections users actually
  accept.

The design separates detection from correction because the two problems need
different machinery.

- Detection is a membership test against a large dictionary and must be nearly
  free, since it runs on every word of every sentence.
- Correction is an approximate search over the edit distance between the
  misspelled word and known words, which is far more expensive and only runs on
  misses.
- Keeping them separate means the hot path stays a fast cache and hash lookup,
  while the expensive fuzzy search is confined to the small fraction of words
  that are actually wrong.

Scale shapes every choice.

- Dictionaries run to hundreds of thousands of entries and grow with names,
  technical terms, and new words, so the design needs an update path for the
  Dictionary data.
- Latency is the dominant constraint because the user sees the underline as they
  type, so suggestions must return in tens of milliseconds.
- The cache absorbs the repetition of common words, and the fuzzy matcher trades
  a small amount of precision for speed by operating on a limited candidate
  neighborhood rather than the whole dictionary..
- Given a misspelled word, the goal is to enumerate a small set of words from the
  dictionary that are close to it.

- The standard model is edit distance, where one operation is a single-character
  insertion, deletion, substitution, or transposition.
- The naive approach, comparing the word against every dictionary entry, is too
  slow at scale, so generation uses indexes built for approximate search.
- One widely used technique is generating the word's deletion keys: for each
  character position, the word with that character removed, and looking up
  dictionary words that share those keys.
- This catches many single-insertion and single-deletion errors directly.

The candidate set is then expanded in a controlled way.

- If a single edit yields nothing, the generator can apply the same idea with
  two deletions or use a symmetric deletion index that matches both directions,
  such as including dictionary words that are within one or two edits regardless
  of which string is the source.
- Each round of expansion increases the candidate pool, so the design caps the
  number of candidates passed to the ranker.
- Because the check happens as the user types, the generator also considers
  typo-adjacent substitutions, where a character is replaced by a nearby key on
  the keyboard, which ranks much higher than an edit at an arbitrary distance.

Generation must be bounded in cost.

- The deletion keys map to short buckets, so each lookup touches only dictionary
  words that could plausibly match.
- Per-user and per-session caches absorb repeated generation for the same
  misspelling.
- If the word is so far from every dictionary entry that no reasonable candidate
  exists, the system returns no suggestions rather than bad ones, because
  offering a wrong correction is worse than offering none.
- This is the point where the generator hands off to the ranker: generation
  produces a possibly large, unordered set, and ordering is a separate concern..

## Estimation

- TBD — add back-of-envelope estimates

## Architecture Diagram

```text
title: Spell Checker
user: User
app: Editor
gateway: API Gateway
check: Check Service
dict: Dictionary
fuzzy: Fuzzy Matcher
cand: Candidate Generator
rank: Suggestion Ranker
cache: Lookup Cache
model: Context Model
db: Usage DB

user ─► app ─► type
app ─► gateway ─► check
gateway ─► check ─► tokenize
check ─► dict ─► lookup
dict ─► check ─► hit
check ─► fuzzy ─► near match
fuzzy ─► cand ─► candidates
cand ─► rank ─► order
rank ─► app ─► suggestions
app ─► model ─► context
gateway ─► cache ─► memo
check ─► db ─► log
```

## Design

### Design a spell checker

A spell checker detects misspelled words and proposes corrections as a user
types.

- The request flow starts in the Editor, where each keystroke triggers a check
  that reaches the Check Service through the API Gateway.
- The Check Service tokenizes the text into words, normalizes each word by
  lowercasing and stripping punctuation, and looks it up in the Dictionary.
- A hit means the word is correct and the pipeline stops.
- A miss hands the word to the Fuzzy Matcher, which produces likely candidates,
  and the Suggestion Ranker orders those candidates so the most probable
  correction appears first.
- A Lookup Cache sits in front to memoize repeated lookups, and every miss is
  logged to the Usage DB so the team can learn which corrections users actually
  accept.

The design separates detection from correction because the two problems need
different machinery.

- Detection is a membership test against a large dictionary and must be nearly
  free, since it runs on every word of every sentence.
- Correction is an approximate search over the edit distance between the
  misspelled word and known words, which is far more expensive and only runs on
  misses.
- Keeping them separate means the hot path stays a fast cache and hash lookup,
  while the expensive fuzzy search is confined to the small fraction of words
  that are actually wrong.

Scale shapes every choice.

- Dictionaries run to hundreds of thousands of entries and grow with names,
  technical terms, and new words, so the design needs an update path for the
  Dictionary data.
- Latency is the dominant constraint because the user sees the underline as they
  type, so suggestions must return in tens of milliseconds.
- The cache absorbs the repetition of common words, and the fuzzy matcher trades
  a small amount of precision for speed by operating on a limited candidate
  neighborhood rather than the whole dictionary.

### How do you store and query the dictionary?

The dictionary is the core data structure, and the storage choice is about
reading far more than writing.

- The requirements are fast membership tests for valid words and support for the
  approximate lookups that feed candidate generation.
- The simplest correct answer is a hash set of all valid words, which gives an
  O(1) membership test and can live entirely in memory because a few hundred
  thousand words fit in tens of megabytes.
- That memory-resident hash set is the baseline: lookups never touch disk, and
  the dictionary can be sharded by word prefix across many servers if one
  machine cannot hold it.

For approximate lookup, the same dictionary is complemented by an index that
supports near matches.

- A common approach is to index words by a set of keys that are insensitive to
  one small error, such as the word with one character deleted, so that a
  misspelled word can generate the same keys and retrieve a candidate set.
- Another approach stores the dictionary as a compact trie or a bloom filter,
  where the bloom filter is used only to reject words cheaply and a follow-up
  exact check removes false positives.
- The fuzzy structures are separate from the membership structure so that the
  fast path stays fast.

The dictionary has to stay fresh.

- New words arrive from user behavior, product names, and language evolution, so
  there is a pipeline that merges a curated dictionary with auto-extracted
  vocabulary.
- Updates are deployed as a versioned snapshot rather than one-off writes, so
  all servers serve a consistent dictionary.
- This matters for fuzzy matching because the candidate set depends on what is
  in the dictionary, and a server split across dictionary versions would return
  different suggestions for the same word.

### How do you generate correction suggestions?

Given a misspelled word, the goal is to enumerate a small set of words from the
dictionary that are close to it.

- The standard model is edit distance, where one operation is a single-character
  insertion, deletion, substitution, or transposition.
- The naive approach, comparing the word against every dictionary entry, is too
  slow at scale, so generation uses indexes built for approximate search.
- One widely used technique is generating the word's deletion keys: for each
  character position, the word with that character removed, and looking up
  dictionary words that share those keys.
- This catches many single-insertion and single-deletion errors directly.

The candidate set is then expanded in a controlled way.

- If a single edit yields nothing, the generator can apply the same idea with
  two deletions or use a symmetric deletion index that matches both directions,
  such as including dictionary words that are within one or two edits regardless
  of which string is the source.
- Each round of expansion increases the candidate pool, so the design caps the
  number of candidates passed to the ranker.
- Because the check happens as the user types, the generator also considers
  typo-adjacent substitutions, where a character is replaced by a nearby key on
  the keyboard, which ranks much higher than an edit at an arbitrary distance.

Generation must be bounded in cost.

- The deletion keys map to short buckets, so each lookup touches only dictionary
  words that could plausibly match.
- Per-user and per-session caches absorb repeated generation for the same
  misspelling.
- If the word is so far from every dictionary entry that no reasonable candidate
  exists, the system returns no suggestions rather than bad ones, because
  offering a wrong correction is worse than offering none.
- This is the point where the generator hands off to the ranker: generation
  produces a possibly large, unordered set, and ordering is a separate concern.

### How do you rank suggestions by likelihood?

The candidate generator can return many plausible words, but the user should see
the most likely correction first.

- Ranking combines several signals.
- Edit distance is the strongest: a one-edit candidate is usually preferred over
  a two-edit candidate.
- Within the same distance, frequency of the candidate word in the language
  matters, since people misspell common words more often, and a well-known
  heuristic is to prefer the more frequent word when distance is tied.
- Keyboard adjacency adds signal for typo-driven errors, where a substitution
  between neighboring keys is more likely than one between distant keys.
- The ranker combines these into a single score and sorts the candidates.

The ranking can be a learned model or a hand-tuned function.

- A learned ranker trains on the Usage DB, which logs each misspelling together
  with the candidate the user actually selected, producing exactly the labels a
  model needs.
- The feature vector includes edit distance, candidate frequency, letter n-gram
  similarity, and the user's past acceptance behavior for this word.
- A lighter alternative is a weighted formula, which is cheaper to serve and
  easier to debug, and many production spell checkers start there before
  graduating to a model.
- Either way, the ranking happens only on the small candidate set, so its cost
  is bounded.

The ranker is also where context begins to enter.

- If the same misspelling has multiple valid corrections, the surrounding words
  disambiguate, so the ranker can incorporate the left and right neighbors as
  features.
- The ranking decision is not just about the single word but about which
  candidate makes the sentence coherent.
- Because rankings are logged with acceptance data, the team can measure quality
  directly by how often the top suggestion is the accepted one, and can tune the
  feature weights or retrain the model against that metric over time.

### How do you handle context and proper nouns?

Misspellings are ambiguous, and the surrounding text often decides which
correction is right.

- A Context Model looks at the words on both sides of the misspelling and scores
  how likely each candidate is given those neighbors.
- This handles the classic cases where the same misspelling has several valid
  corrections, and it also lets the checker catch real-word errors, where a word
  is spelled correctly but is wrong in context, such as "there" versus "their".
- The context signal is fetched at check time and used as an extra input to the
  Suggestion Ranker rather than as a separate path, keeping the architecture
  unchanged while making the output smarter.

Proper nouns and names need a distinct treatment because they look like
misspellings to any ordinary dictionary.

- The system keeps a separate, case-aware vocabulary of names, brands, and
  technical terms that ordinary words are not checked against in the same way.
- Capitalization is a strong signal: a capitalized word that matches a known
  proper noun suppresses the red underline, while a lowercase variant of the
  same token still gets checked.
- The name list is built from user activity, where frequent uncorrected words
  and accepted "ignore" actions teach the checker which terms the user community
  treats as valid, layered on top of curated lists.

The design keeps context and vocabulary learned at the user level.

- An individual's writing is filled with jargon, names, and domain terms that a
  global dictionary will never contain, so the system maintains a personal
  dictionary populated by words the user has explicitly ignored or accepted.
- The Context Model is also personalized over time, learning the user's common
  transpositions and frequent errors.
- Everything learned flows back into the Usage DB, which both improves ranking
  globally and seeds per-user models, closing the loop between what the checker
  suggests and what users actually accept.

## Source

```text
title: Spell Checker
node user: User [round, icon=browser]
node app: Editor [icon=browser]
node gateway: API Gateway [icon=server]
node check: Check Service [icon=compute]
node dict: Dictionary [cylinder, icon=database]
node fuzzy: Fuzzy Matcher [icon=search]
node cand: Candidate Generator [icon=compute]
node rank: Suggestion Ranker [icon=compute]
node cache: Lookup Cache [cylinder, icon=cache]
node model: Context Model [icon=cloud]
node db: Usage DB [cylinder, icon=database]

edge user -> app: type
edge app -> gateway: check
edge gateway -> check: tokenize
edge check -> dict: lookup
edge dict -> check: hit
edge check -> fuzzy: near match
edge fuzzy -> cand: candidates
edge cand -> rank: order
edge rank -> app: suggestions
edge app -> model: context
edge gateway -> cache: memo
edge check -> db: log
```

## Q&A

### Q: Design a spell checker

**A:** A spell checker detects misspelled words and proposes corrections as a user
types.

- The request flow starts in the Editor, where each keystroke triggers a check
  that reaches the Check Service through the API Gateway.
- The Check Service tokenizes the text into words, normalizes each word by
  lowercasing and stripping punctuation, and looks it up in the Dictionary.
- A hit means the word is correct and the pipeline stops.
- A miss hands the word to the Fuzzy Matcher, which produces likely candidates,
  and the Suggestion Ranker orders those candidates so the most probable
  correction appears first.
- A Lookup Cache sits in front to memoize repeated lookups, and every miss is
  logged to the Usage DB so the team can learn which corrections users actually
  accept.

The design separates detection from correction because the two problems need
different machinery.

- Detection is a membership test against a large dictionary and must be nearly
  free, since it runs on every word of every sentence.
- Correction is an approximate search over the edit distance between the
  misspelled word and known words, which is far more expensive and only runs on
  misses.
- Keeping them separate means the hot path stays a fast cache and hash lookup,
  while the expensive fuzzy search is confined to the small fraction of words
  that are actually wrong.

Scale shapes every choice.

- Dictionaries run to hundreds of thousands of entries and grow with names,
  technical terms, and new words, so the design needs an update path for the
  Dictionary data.
- Latency is the dominant constraint because the user sees the underline as they
  type, so suggestions must return in tens of milliseconds.
- The cache absorbs the repetition of common words, and the fuzzy matcher trades
  a small amount of precision for speed by operating on a limited candidate
  neighborhood rather than the whole dictionary.

### Q: How do you store and query the dictionary?

**A:** The dictionary is the core data structure, and the storage choice is about
reading far more than writing.

- The requirements are fast membership tests for valid words and support for the
  approximate lookups that feed candidate generation.
- The simplest correct answer is a hash set of all valid words, which gives an
  O(1) membership test and can live entirely in memory because a few hundred
  thousand words fit in tens of megabytes.
- That memory-resident hash set is the baseline: lookups never touch disk, and
  the dictionary can be sharded by word prefix across many servers if one
  machine cannot hold it.

For approximate lookup, the same dictionary is complemented by an index that
supports near matches.

- A common approach is to index words by a set of keys that are insensitive to
  one small error, such as the word with one character deleted, so that a
  misspelled word can generate the same keys and retrieve a candidate set.
- Another approach stores the dictionary as a compact trie or a bloom filter,
  where the bloom filter is used only to reject words cheaply and a follow-up
  exact check removes false positives.
- The fuzzy structures are separate from the membership structure so that the
  fast path stays fast.

The dictionary has to stay fresh.

- New words arrive from user behavior, product names, and language evolution, so
  there is a pipeline that merges a curated dictionary with auto-extracted
  vocabulary.
- Updates are deployed as a versioned snapshot rather than one-off writes, so
  all servers serve a consistent dictionary.
- This matters for fuzzy matching because the candidate set depends on what is
  in the dictionary, and a server split across dictionary versions would return
  different suggestions for the same word.

### Q: How do you generate correction suggestions?

**A:** Given a misspelled word, the goal is to enumerate a small set of words from the
dictionary that are close to it.

- The standard model is edit distance, where one operation is a single-character
  insertion, deletion, substitution, or transposition.
- The naive approach, comparing the word against every dictionary entry, is too
  slow at scale, so generation uses indexes built for approximate search.
- One widely used technique is generating the word's deletion keys: for each
  character position, the word with that character removed, and looking up
  dictionary words that share those keys.
- This catches many single-insertion and single-deletion errors directly.

The candidate set is then expanded in a controlled way.

- If a single edit yields nothing, the generator can apply the same idea with
  two deletions or use a symmetric deletion index that matches both directions,
  such as including dictionary words that are within one or two edits regardless
  of which string is the source.
- Each round of expansion increases the candidate pool, so the design caps the
  number of candidates passed to the ranker.
- Because the check happens as the user types, the generator also considers
  typo-adjacent substitutions, where a character is replaced by a nearby key on
  the keyboard, which ranks much higher than an edit at an arbitrary distance.

Generation must be bounded in cost.

- The deletion keys map to short buckets, so each lookup touches only dictionary
  words that could plausibly match.
- Per-user and per-session caches absorb repeated generation for the same
  misspelling.
- If the word is so far from every dictionary entry that no reasonable candidate
  exists, the system returns no suggestions rather than bad ones, because
  offering a wrong correction is worse than offering none.
- This is the point where the generator hands off to the ranker: generation
  produces a possibly large, unordered set, and ordering is a separate concern.

### Q: How do you rank suggestions by likelihood?

**A:** The candidate generator can return many plausible words, but the user should see
the most likely correction first.

- Ranking combines several signals.
- Edit distance is the strongest: a one-edit candidate is usually preferred over
  a two-edit candidate.
- Within the same distance, frequency of the candidate word in the language
  matters, since people misspell common words more often, and a well-known
  heuristic is to prefer the more frequent word when distance is tied.
- Keyboard adjacency adds signal for typo-driven errors, where a substitution
  between neighboring keys is more likely than one between distant keys.
- The ranker combines these into a single score and sorts the candidates.

The ranking can be a learned model or a hand-tuned function.

- A learned ranker trains on the Usage DB, which logs each misspelling together
  with the candidate the user actually selected, producing exactly the labels a
  model needs.
- The feature vector includes edit distance, candidate frequency, letter n-gram
  similarity, and the user's past acceptance behavior for this word.
- A lighter alternative is a weighted formula, which is cheaper to serve and
  easier to debug, and many production spell checkers start there before
  graduating to a model.
- Either way, the ranking happens only on the small candidate set, so its cost
  is bounded.

The ranker is also where context begins to enter.

- If the same misspelling has multiple valid corrections, the surrounding words
  disambiguate, so the ranker can incorporate the left and right neighbors as
  features.
- The ranking decision is not just about the single word but about which
  candidate makes the sentence coherent.
- Because rankings are logged with acceptance data, the team can measure quality
  directly by how often the top suggestion is the accepted one, and can tune the
  feature weights or retrain the model against that metric over time.

### Q: How do you handle context and proper nouns?

**A:** Misspellings are ambiguous, and the surrounding text often decides which
correction is right.

- A Context Model looks at the words on both sides of the misspelling and scores
  how likely each candidate is given those neighbors.
- This handles the classic cases where the same misspelling has several valid
  corrections, and it also lets the checker catch real-word errors, where a word
  is spelled correctly but is wrong in context, such as "there" versus "their".
- The context signal is fetched at check time and used as an extra input to the
  Suggestion Ranker rather than as a separate path, keeping the architecture
  unchanged while making the output smarter.

Proper nouns and names need a distinct treatment because they look like
misspellings to any ordinary dictionary.

- The system keeps a separate, case-aware vocabulary of names, brands, and
  technical terms that ordinary words are not checked against in the same way.
- Capitalization is a strong signal: a capitalized word that matches a known
  proper noun suppresses the red underline, while a lowercase variant of the
  same token still gets checked.
- The name list is built from user activity, where frequent uncorrected words
  and accepted "ignore" actions teach the checker which terms the user community
  treats as valid, layered on top of curated lists.

The design keeps context and vocabulary learned at the user level.

- An individual's writing is filled with jargon, names, and domain terms that a
  global dictionary will never contain, so the system maintains a personal
  dictionary populated by words the user has explicitly ignored or accepted.
- The Context Model is also personalized over time, learning the user's common
  transpositions and frequent errors.
- Everything learned flows back into the Usage DB, which both improves ranking
  globally and seeds per-user models, closing the loop between what the checker
  suggests and what users actually accept.

## Source

```text
title: Spell Checker
node user: User [round, icon=browser]
node app: Editor [icon=browser]
node gateway: API Gateway [icon=server]
node check: Check Service [icon=compute]
node dict: Dictionary [cylinder, icon=database]
node fuzzy: Fuzzy Matcher [icon=search]
node cand: Candidate Generator [icon=compute]
node rank: Suggestion Ranker [icon=compute]
node cache: Lookup Cache [cylinder, icon=cache]
node model: Context Model [icon=cloud]
node db: Usage DB [cylinder, icon=database]

edge user -> app: type
edge app -> gateway: check
edge gateway -> check: tokenize
edge check -> dict: lookup
edge dict -> check: hit
edge check -> fuzzy: near match
edge fuzzy -> cand: candidates
edge cand -> rank: order
edge rank -> app: suggestions
edge app -> model: context
edge gateway -> cache: memo
edge check -> db: log
```
