# CLAUDE.md

## Purpose

`spanish-daily` is a personalized AI Spanish learning system. Each day it selects a vocabulary word, uses the Claude API to generate a complete teaching lesson for it, records what has been learned, publishes the lesson to Notion for reading, and sends a notification through Telegram.

## Product goal

The vocabulary selection logic is the **core data layer, not the product**. The product is the daily lesson.

The intended daily pipeline:

```
select today's word
  ↓
generate a full lesson with the Claude API
  ↓
render a Markdown lesson
  ↓
store the learning record
  ↓
publish to Notion (the reading interface)
  ↓
notify via Telegram
```

Only the first step is being designed now. Everything after it is real and intended, but not yet built.

## Lesson content requirements

A daily lesson is a **complete piece of Spanish teaching material**, not a dictionary entry. Each generated Markdown lesson contains:

**1. Word basics**

- The Spanish word
- Chinese meanings, ordered by how commonly each sense is used
- Part of speech
- CEFR level, if obtainable
- Frequency information, if obtainable

**2. How the word is used**

- Common collocations
- Common phrases
- Real usage contexts
- Confusions and common mistakes (e.g. `ser` vs `estar`, `por` vs `para`)

**3. Word forms**

For verbs, a complete conjugation table covering: Presente, Pretérito, Imperfecto, Perfecto, Futuro, Condicional, Subjuntivo Presente, Imperativo. The table must be complete; it does **not** need an example sentence for every person of every tense. For irregular verbs, explain the reason or the pattern behind the irregularity.

For other parts of speech, provide the inflection information that matters for that part of speech.

**4. Example sentences**

Examples should span different grammar and usage situations, distributed evenly across the word's uses. Do not repeat the same structure just to be exhaustive — one representative sentence per major tense or important usage is enough. Each example includes the Spanish, a Chinese translation, and a grammar or usage note.

**5. Extended learning**

- Synonyms
- Antonyms, where applicable
- Easily confused related words

**Explicitly out of scope:** quizzes and gamification. Do not add them unless they are explicitly requested later.

## Vocabulary curriculum

The vocabulary dataset starts with roughly 1000 core high-frequency Spanish words. **1000 is the first curriculum milestone, not a system limit.** After the first round completes, more words are added and the curriculum continues.

Design the data layer for a vocabulary that grows for years. Do not optimize for exactly 1000 rows, and do not assume the dataset is ever "finished."

## Current stage

The repository is initialized and the data-layer design is settled (below). There is no application code, no `src/` directory, and no integrations. The next step is implementing word selection — not wiring up Claude, Notion, Telegram, or Actions.

## Settled design — data layer

**Word selection**

- Selection is a pure function of `(vocabulary, history, today's date)`.
- Pick the unlearned word with the lowest `order`. The curated order defines the learning sequence.
- No randomness, no shuffle.
- Duplicates are prevented structurally: selection draws from the complement of the learned set.
- Spaced review is a future feature, not part of the first implementation.

**State**

- The Git repository is the single source of truth. Notion is a future reading/publishing interface, never the source of truth.
- History lives in an append-only `history.jsonl`, one record per day, keyed by date.
- The learned set is *derived* from the history. Do not maintain it as a separate file — a second store can desync from the log.
- Selection is idempotent: if a record already exists for today, return that word. Re-running is always safe, which is the entire failure-recovery story. No locks, no "did it run?" flag.
- The commit is the durable write. The initial implementation commits the history record only after the lesson content has been successfully generated and stored in the intended publishing destination. Notification failures should not invalidate the generated lesson. If the pipeline later needs finer-grained progress tracking, introduce a more granular status design rather than relying on commit ordering.

**Word IDs**

- Use immutable zero-padded serial IDs: `w0001`, `w0002`, …
- An `id` is the word's **identity**. It does not encode learning sequence.
- The `order` field is the learning sequence. It can be adjusted, inserted into, or rearranged independently, and doing so never affects any `id`.
- IDs are never reused. If a word is deleted, its ID retires with it and is never assigned to another word.
- An ID that appears in the history but no longer exists in the vocabulary is **not an error**. It simply remains in the learned set.

**Vocabulary file**

- A JSON array, hand-maintained. Fields: `id`, `word`, `order`, `pos`.
- `pos` (part of speech) is a required field — lesson generation needs to know the word type (e.g. `verb`, `noun`, `adjective`) to produce the right conjugation or inflection content.
- Do not add any other field without an explicit feature requirement.
- JSON over CSV because Spanish content contains commas and accents, and CSV's escaping rules fail silently by shifting columns rather than raising an error.
- Validate on load and fail loudly: duplicate IDs, missing fields, malformed records.

**Timezone**

- The system runs on Taiwan time: `Asia/Taipei`, always.
- Defined once as a constant in code, not as an environment variable. It never varies by environment, and an env var only adds a place to forget it.
- Never read the host's local date — GitHub Actions runs in UTC. Compute "today" explicitly in `Asia/Taipei`.
- GitHub Actions cron is interpreted in UTC and does not understand `Asia/Taipei`. Convert the schedule and note the conversion in a comment in the workflow file.
- Taiwan has no daylight saving time, so UTC+8 is fixed year-round.

## Technology stack

**In use now**

- Node.js with TypeScript (strict mode, ES2022, NodeNext modules, ESM)
- npm for package management
- Dev dependencies are limited to `typescript` and `@types/node`

**Planned, not yet added**

- Claude API, used to generate the daily lessons
- Notion, Telegram, and GitHub Actions integrations

Implementation details not covered by the settled design above are still open. Do not assume an answer to them — ask.

## Development principles

- Build one capability at a time and keep it working before starting the next.
- Prefer the simplest thing that solves the problem at hand. This is a personal project, not a platform.
- Add a dependency only when it is needed for the feature being built.
- Defer decisions until the code forces them. An undecided detail is better than a wrong abstraction.
- Prefer explicit and reliable over clever. This system must stay maintainable for years.

## Rules for changes

- Do not add integrations (Notion, Telegram, GitHub Actions) ahead of the learning logic they are meant to carry.
- Do not create directories or scaffolding for features that do not exist yet.
- Do not install packages that the current step does not require.
- Do not change the vocabulary selection algorithm without an explicit decision to do so.
- When a design decision is genuinely open, ask rather than guessing and building on the guess.
- Keep `README.md` as the short public description; keep planning and context in this file.
