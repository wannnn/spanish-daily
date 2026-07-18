# Application Architecture

- **Status:** authoritative document for the application architecture, the daily
  pipeline, state semantics, and system boundaries.

This document defines *how the system is built*: its layers, its stages, what
counts as durably done, and which knowledge is allowed to cross which boundary.

It does not define *what* is taught or *what a lesson contains*. Those live in
their own contracts:

| Document | Owns |
|---|---|
| `docs/vocabulary-spec.md` | The vocabulary data contract: entry schema, identity, ordering, POS, validation. |
| `docs/lesson-spec.md` | The lesson content and generation contract: input contract, Markdown structure, prompt architecture. |
| **this document** | Application architecture, pipeline stages, state semantics, boundaries. |
| `CLAUDE.md` | Agent context, development principles, rules for changes, current project status. |

## 1. Architectural principles

### A content system, not a Notion system

This is a Spanish learning **content** system built to evolve for years. It is not
a Notion-based system, and Notion holds no privileged position over any other
consumer.

- `lessons/**/*.md` is the **canonical lesson content**: a first-class Git
  artifact, not a cache and not a byproduct.
- Notion, Telegram, and any future static website, mobile app, or search index are
  **external adapters / projections**. None of them belongs to the core domain.
- Every projection must be re-derivable from the canonical data in Git alone. If a
  projection is destroyed, it can be rebuilt and nothing is lost with it.
- The core domain — vocabulary selection, history, lesson generation, and the
  lesson content model — must not depend on any presentation platform.
- **The completion semantics of the pipeline must not depend on any projection.**
  No external service may veto whether a day counts as learned.

### Future-proof the boundaries, not the feature set

The goal is that replacing the presentation layer never requires touching the core
system. That goal is met by keeping the core ignorant of platforms — **not** by
building a framework that anticipates platforms.

Adding a consumer later must mean **adding an adapter**, never modifying the
canonical data or the core domain.

**Explicitly forbidden as premature abstraction:**

- a generic publisher framework,
- an abstract adapter hierarchy or base class,
- a plugin system or adapter registry,
- an event bus or queue,
- a generic repository abstraction,
- a dependency-injection framework,
- a status table or workflow engine,
- a schema designed for a consumer that does not exist yet.

Portability comes from *the core not naming a platform*, not from *the core
defining an interface for platforms*. The latter only relocates the coupling.

## 2. Layers and module structure

```
        cli/            entry point, arguments, exit codes
          │
        pipeline/       the only orchestrator: stage order and failure handling
          │
   ┌──────┴───────┐
 domain/         io/  +  integrations/
 pure functions   all I/O and external services
```

```
src/
  config.ts                    core constants only: TIMEZONE, paths,
                               LESSON_SCHEMA_VERSION

  domain/                      pure functions — no I/O, no clock, no network
    types.ts                   VocabularyEntry, HistoryRecord, Lesson
    date.ts                    Asia/Taipei date calculation
    vocabulary.ts              validation per docs/vocabulary-spec.md §5
    history.ts                 JSONL parsing, learned-set derivation
    selection.ts               word selection
    lesson.ts                  canonical Lesson model: parse, render, validate

  io/                          filesystem and Git boundary — thin, no decisions
    vocabularyStore.ts
    historyStore.ts
    lessonStore.ts
    git.ts

  integrations/                one file per external platform
    claude.ts                  lesson generation
    notion.ts                  lesson projection
    telegram.ts                notification

  pipeline/
    runDaily.ts                composition root

  cli/
    daily.ts
```

**Dependency rule (the one rule that must not bend):**

- `domain/` must not import `io/` or `integrations/`, and must never name a
  platform.
- `io/` and `integrations/` may depend on `domain/` types.
- `pipeline/` may depend on everything. It is the **composition root** and the
  only place in the system permitted to name an adapter by name.

Adapters are named after their platform (`claude.ts`, `notion.ts`,
`telegram.ts`), not after a generic role. An honest name keeps the boundary
visible and makes "add another consumer" obviously additive.

Clock, filesystem, and network are injected at the edges. The domain layer does
not know they exist.

## 3. Canonical data and source of truth

| Data | Source of truth | Writer | Notes |
|---|---|---|---|
| Which words, in what order | `vocabulary.json` (Git) | **human only** | The system reads it and never writes it. See `docs/vocabulary-spec.md`. |
| What has been learned | `history.jsonl` (Git) | system, append-only | The learned set is *derived* from it; never stored separately. |
| Lesson content | `lessons/**/*.md` (Git) | system, written once | Canonical. Notion is its projection. |
| Notion pages | **not a source of truth** | system | Disposable and rebuildable. |
| Telegram messages | stateless | system | Carry no state whatsoever. |
| Today's date | derived from `Asia/Taipei` (§11) | — | Never read from the host locale. |

**Test of the boundary:** if Notion and Telegram both disappeared, the system
would still be complete. Nothing of value lives only outside Git.

### `history.jsonl`

Append-only, one record per day, keyed by date. Record fields:

```json
{ "date": "2026-07-18", "id": "w0001", "word": "hablar" }
```

`word` is redundant against `vocabulary.json` but kept deliberately. An entry may
be removed from the vocabulary while its `id` remains in the history, and `id`s
are never reused (`docs/vocabulary-spec.md` §2), so a history record must stay
self-describing and readable on its own.

No `lessonSchemaVersion`, no `promptVersion`, and no `notionPageId`. A projection
identifier must never enter the source of truth.

## 4. The canonical Lesson content model

```
lessons/YYYY/YYYY-MM-DD-{id}.md
```

Date first so files sort chronologically; `id` included so a file correlates to
its vocabulary entry; sharded by year because the dataset grows for years.

The file content is the frontmatter and fixed sections defined by
`docs/lesson-spec.md` §2.

`domain/lesson.ts` owns this model and exposes it as **plain data**, not as an
interface:

```ts
type Lesson = {
  metadata: { id, word, pos, date, lessonSchemaVersion }
  body: string        // Markdown: the fixed sections of lesson-spec §2
}

parse(document: string): Lesson       // pure
render(lesson: Lesson): string        // pure
validateBody(body: string, pos: string): void   // pure; throws
```

`parse` is the system's real portability asset: every future consumer — a static
site generator, a search index, a mobile app — reads `lessons/**/*.md` through
this one function rather than reimplementing the format.

### Who assembles the frontmatter

The generator produces the **body only**. Frontmatter is assembled afterwards by
`domain/lesson.render` from pipeline-known facts.

```
claude.ts          →  body only (## 基本資訊 … ## 延伸學習)
domain/lesson      →  validateBody(body, pos)     ← validates untrusted output
domain/lesson      →  render({ metadata, body })  ← adds frontmatter
io/lessonStore     →  write to lessons/YYYY/…
```

This is what makes `docs/lesson-spec.md` §1 — that `id` is pipeline metadata and
never a generation input — structurally true rather than merely documented. The
generator receives `{ word, pos }` and cannot reference `id`, `date`, or `order`
because it never has them, so it cannot fabricate them.

Validation runs on the generator's output, before assembly. The assembled
document is produced by our own pure function and is not re-validated.

`validateBody` checks: the five section headings present in the fixed order; no
extra `##` sections; no frontmatter in the body (the generator emitting one means
it disobeyed its contract); for `pos === 'verb'`, all eight required tense/mood
sub-tables present; no empty section.

## 5. Pipeline stages

### Stage 1 — CANONICAL

The only stage that defines whether a day is complete.

| | |
|---|---|
| **Input** | `vocabulary.json`, `history.jsonl`, injected clock |
| **Output** | `lessons/YYYY/YYYY-MM-DD-{id}.md` and one appended `history.jsonl` record, in **one commit + push** |
| **Steps** | select → generate → validate → render → write both files → commit → push |
| **Idempotency** | a history record for today exists ⇒ the entire stage is skipped |
| **Failure** | abort, non-zero exit. Validation failure writes **nothing** — an incomplete lesson never reaches Git. |

Steps up to and including selection touch no network. "Which word is today's" is
decided by pure functions and can be answered offline at zero cost.

**Selection algorithm** — `domain/selection.ts`, a pure function of
`(vocabulary, history)`:

- Pick the **unlearned word with the lowest `order`**. The curated `order` defines
  the learning sequence (`docs/vocabulary-spec.md` §2).
- No randomness and no shuffle. The same inputs always yield the same word.
- Duplicates are prevented structurally: the candidate set is the complement of
  the learned set, so a learned word cannot be selected again.
- An `id` present in the history but absent from the vocabulary stays in the
  learned set and is **not an error**. Words can be removed from the curriculum;
  what has been learned does not become unlearned.
- Returns nothing when the curriculum is exhausted; the run then exits 0.
- Spaced review is a future feature and no part of this (§13).

### Stage 2 — PROJECTION

| | |
|---|---|
| **Input** | the canonical Lesson, read from Git via `domain/lesson.parse`, plus adapter configuration |
| **Output** | a Notion page (side effect); returns a URL held in memory only |
| **Idempotency** | the adapter's own upsert, keyed on `id` |
| **Failure** | non-zero exit so the scheduler reports failure — but **no rollback**, and committed canonical data is never touched or regenerated |

**This stage runs whether or not Stage 1 was skipped.** Running it
unconditionally is what makes a failed projection self-healing on the next run:
the lesson is already canonical, so the retry re-projects from Git instead of
calling Claude again. No status field is required to achieve this.

### Stage 3 — NOTIFICATION

| | |
|---|---|
| **Input** | `{ word, date, link? }` — `link` is a platform-neutral URL supplied by the projection stage |
| **Idempotency** | fires **only** when Stage 1 wrote a record during this run |
| **Failure** | warning only; does not affect the exit code |

A notification is a one-shot event, not a projection. It is never replayed, so a
re-run never re-notifies.

## 6. Completion semantics and the canonical-first durable write

- **The durable write is a commit plus a push.** On an ephemeral CI runner an
  unpushed commit does not exist.
- **The lesson file and the history record are written in one commit.** They are
  two halves of one fact. This yields the invariant:

  > A committed lesson file exists **if and only if** a history record exists for
  > it.

  No orphan lesson files, and no history entry without content.
- That commit happens as soon as the lesson has been generated and structurally
  validated — **before** any projection or notification. Once it lands, the day is
  complete.
- Progress is always **derived** from committed data. There is no status flag, no
  status table, and no "did it run?" marker anywhere in the system.

**Git is invoked by the Node application, not by the workflow file.** Commit
timing is part of the pipeline's meaning, not a deployment detail, and keeping it
in the application makes local runs and scheduled runs behave identically. The
workflow reduces to: checkout, setup Node, inject secrets, run the command.

`io/git.ts` exposes `commitAndPush(paths, message)`. It performs no rebase, no
conflict resolution, and no retry; a failed push throws. Concurrency is prevented
by a `concurrency` group in the workflow, not by a lock in the application.

## 7. Idempotency and duplicate prevention

| Risk | Mechanism | Enforced at |
|---|---|---|
| The same word selected twice | selection draws from the complement of the learned set | structurally impossible |
| Generating twice in one day | today's history record already exists ⇒ Stage 1 skipped | Stage 1 entry |
| Duplicate Notion pages | query by `id`, then update or create | adapter |
| Duplicate history rows | same guard as Stage 1 | Stage 1 entry |
| Duplicate notifications | Stage 3 fires only on a fresh Stage 1 write | Stage 3 entry |

Each stage carries the idempotency mechanism appropriate to its nature: Stage 1 is
guarded by committed state, Stage 2 by an upsert, Stage 3 by a one-shot condition.

## 8. Failure and retry behaviour

| Failure point | Side effects already produced | Behaviour | Exit | On re-run |
|---|---|---|---|---|
| Vocabulary validation | none | abort with a locating error message | ≠0 | normal once fixed |
| History parse | none | abort — treated as corruption | ≠0 | needs manual repair |
| No word left to select | none | log "curriculum complete" | 0 | same |
| Claude generation | none | abort | ≠0 | regenerates |
| **Lesson validation** | **none** — validated before writing | abort, nothing written | ≠0 | regenerates |
| Commit or push | local files only (lost with the runner) | abort | ≠0 | regenerates |
| **Notion projection** | canonical data already committed | abort, **no rollback** | ≠0 | **re-projects from Git; does not call Claude** |
| **Telegram** | learning record already complete | warn only | **0** | not re-sent |

The core invariant: **the history record is the sole definition of "done."** Until
it is pushed, the day is unfinished and re-running is safe. After it is pushed,
the day is finished and nothing downstream can undo it.

## 9. Boundaries

### domain → pipeline → adapter

- `domain/` never names a platform. Not in code, not in types, not in identifiers.
- `pipeline/runDaily.ts` imports `notion.ts` directly. This is **deliberate**: it
  is the composition root, and eliminating that import with a registry or
  dependency injection is exactly the premature abstraction §1 forbids.
- **An adapter may depend on the canonical Lesson model. The canonical Lesson
  model may never depend on an adapter.**

### Platform-specific knowledge is contained

Notion database schema, page IDs, block structure, API tokens, and every
equivalent for any other adapter live **only inside that adapter file**. They must
never reach `vocabulary.json`, `history.jsonl`, the canonical lesson content, the
domain layer, or any core pipeline decision.

Adapter configuration is read inside its own adapter. `config.ts` holds core
constants only; it must not accumulate knowledge of external platforms.

### The reverse leak to guard against

The subtle failure mode is not a platform concept leaking *outward* — it is a
platform's limitations leaking *inward*.

When the Notion converter meets Markdown it cannot map, the tempting fix is to
constrain the generator prompt to "Markdown that Notion can render." **That would
let Notion silently define the canonical content model.**

The rule: the shape of canonical Markdown is decided by `docs/lesson-spec.md` and
nothing else. A converter that cannot map a valid structure fails loudly; that is
a defect in the converter, not in the content.

### Adding a future consumer

A static site generator, search index, or mobile app content consumer is added as
a new file under `integrations/` that reads `lessons/**/*.md` through
`domain/lesson.parse`. No change to canonical data, the domain layer, or the
existing adapters. Nothing is built in advance to enable this.

## 10. Adapter contracts

Each adapter is a module of plain functions. There is no shared interface, no base
class, and no registry.

### `integrations/claude.ts`

```ts
generateLesson(input: { word: string, pos: string }): Promise<string>   // body only
```

The signature is the enforcement mechanism for `docs/lesson-spec.md` §1: the
generator transforms and never curates, so it receives no `id` and no `order`.

### `integrations/notion.ts`

```ts
publishToNotion(lesson: Lesson, config: NotionConfig): Promise<{ url: string }>
```

The returned URL exists in memory only and is never persisted.

**Notion database schema — an external precondition, created by hand:**

| Property | Notion type | Role |
|---|---|---|
| `word` | Title | page title and reading entry point |
| `id` | Rich text | **upsert key** |
| `date` | Date | learning date; sorting and retrieval |
| `pos` | Select | category browsing |

**Upsert:** query the database where `id` equals the lesson's `id`.

- 0 results → create the page.
- 1 result → update its properties and replace its children.
- 2 or more → **abort.** The projection has been corrupted externally; do not
  guess which one is right.

**Markdown → Notion blocks** is converted by a purpose-built converter that
targets the fixed lesson structure. No general-purpose Markdown parsing framework
is introduced. The converter may know the Lesson schema; the Lesson schema must
not know the converter (see §9).

### `integrations/telegram.ts`

```ts
notify(input: { word: string, date: string, link?: string }, config): Promise<void>
```

`link` is a neutral URL. The notifier does not know which platform produced it.

## 11. Timezone

- The system runs on Taiwan time — `Asia/Taipei`, always.
- Defined once as a constant in code, never as an environment variable. It does
  not vary by environment, and an env var only adds a place to forget it.
- Never read the host's local date. Compute "today" explicitly in `Asia/Taipei`.
- GitHub Actions cron is interpreted in UTC and does not understand `Asia/Taipei`.
  Convert the schedule and record the conversion in a comment in the workflow file.
- Taiwan observes no daylight saving, so UTC+8 is fixed year-round.

## 12. Testing

Tests use the Node.js built-in `node:test`. No Jest, no Vitest, no additional
dependency.

The value of the pure domain layer is that it is testable without mocks: date
calculation, the whole of vocabulary validation, history parsing and learned-set
derivation, selection, and lesson structure validation are all exercised with
fixed inputs. The orchestrator is the only part requiring integration testing.

## 13. Out of scope for the first implementation

Deferred with **no mechanism reserved for them**:

spaced review and scheduling, prompt versioning, a lesson regeneration command, a
projection reconcile/backfill command, structured JSON lesson output, retry with
backoff, more than one word per day, reverse sync from any projection, a separate
notify command, and any UI.

Each is a separate, explicit future feature. None is designed for now.

## 14. Open decisions

Recorded so they are not silently assumed. None has been decided.

- Seed vocabulary entries: content is chosen by the human maintainer
  (`docs/vocabulary-spec.md` §1). A small hand-verified set validates the pipeline
  before the dataset is expanded.
- The Claude model and whether to use extended thinking
  (`docs/lesson-spec.md` §5 lists these as deferred to implementation).
- The Git identity used for commits in GitHub Actions.

## Changelog

- **v1** — Initial architecture: three-stage pipeline, canonical-first durable
  write with a single commit, per-stage idempotency, layer and adapter boundaries,
  the canonical Lesson content model, and the anti-premature-abstraction policy.
