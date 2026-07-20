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
| `docs/implementation-plan.md` | What is built so far, the current milestone, and open questions. |
| `CLAUDE.md` | Agent context, development principles, rules for changes. |

This document describes the system's **intended shape**, not its current extent.
Parts of it are not implemented yet, and it does not track that —
`docs/implementation-plan.md` does.

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

This is the **target** structure: where each responsibility belongs once the
whole pipeline exists. It is not a description of the repository as it stands —
several of these modules are not written yet. For what exists today and what is
next, see `docs/implementation-plan.md`.

```
src/
  domain/                      pure functions — no I/O, no clock, no network
    types.ts                   VocabularyEntry, HistoryRecord, Lesson
    date.ts                    Asia/Taipei date calculation; owns TIMEZONE
    vocabulary.ts              validation per docs/vocabulary-spec.md §5
    history.ts                 JSONL parsing, learned-set derivation
    selection.ts               word selection
    lesson.ts                  canonical Lesson model; owns LESSON_SCHEMA_VERSION

  io/                          filesystem and Git boundary — thin, no decisions
    vocabularyStore.ts
    historyStore.ts
    git.ts                     (planned)

  integrations/                one file per external platform (all planned)
    notion.ts                  lesson projection
    telegram.ts                notification

  pipeline/                    (planned)
    prepare.ts                 selection → task context
    finalize.ts                acceptance → history → commit + push

  cli/
    today.ts                   read-only: print today's selection
    prepare.ts                 (planned) emit today's task context
    finalize.ts                (planned) accept the generated lesson and commit
```

**There is no `integrations/claude.ts`.** Lesson generation does not go through
an API client this application owns — a Claude Code GitHub Action writes the
lesson file directly (§5, Stage 1). Nothing under `io/` writes lesson files
either, for the same reason.

**Domain constants live with the contract they belong to**, not in an
application config module. `TIMEZONE` is part of the date contract and lives in
`domain/date.ts`; `LESSON_SCHEMA_VERSION` is part of the lesson contract and
lives in `domain/lesson.ts`. Neither is environment configuration — neither ever
varies by environment, so neither belongs in one. A `config.ts` is not required
by this architecture and should be introduced only if application-level values
such as canonical paths actually need a home.

**Dependency rule (the one rule that must not bend):**

- `domain/` must not import `io/` or `integrations/`, and must never name a
  platform.
- `io/` and `integrations/` may depend on `domain/` types.
- `pipeline/` may depend on everything. It is the **composition root** and the
  only place in the system permitted to name an adapter by name.

Adapters are named after their platform (`notion.ts`, `telegram.ts`), not after
a generic role. An honest name keeps the boundary visible and makes "add another
consumer" obviously additive.

Clock, filesystem, and network are injected at the edges. The domain layer does
not know they exist.

## 3. Canonical data and source of truth

| Data | Source of truth | Writer | Notes |
|---|---|---|---|
| Which words, in what order | `vocabulary.json` (Git) | **human only** | The system reads it and never writes it. See `docs/vocabulary-spec.md`. |
| What has been learned | `history.jsonl` (Git) | system, append-only | The learned set is *derived* from it; never stored separately. |
| Lesson content | `lessons/**/*.md` (Git) | the generation action, written once | Canonical, and accepted by finalize before it is committed. Notion is its projection. |
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
type LessonMetadata = { id, word, pos, date, lessonSchemaVersion }
type Lesson = {
  metadata: LessonMetadata
  body: string        // Markdown: the fixed sections of lesson-spec §2
}

parseLesson(document: string): Lesson                 // pure
renderLesson(lesson: Lesson): string                  // pure
validateLessonBody(body: string): void                // pure; throws
lessonRelativePath(metadata: LessonMetadata): string  // pure; throws
```

`parseLesson` is the system's real portability asset: every future consumer — a
static site generator, a search index, a mobile app — reads `lessons/**/*.md`
through this one function rather than reimplementing the format.

### Who writes the lesson file

**A Claude Code GitHub Action writes the whole canonical file — frontmatter and
all.** The application does not call a generation API and does not assemble the
document from a returned string.

```
Node prepare       →  task context: id, word, pos, date, schema version,
                      and the single allowed target path
Claude Code Action →  reads docs/lesson-spec.md and writes exactly that file
Node finalize      →  parse, verify, append history, commit + push
```

This still keeps `docs/lesson-spec.md` §1 true — the metadata is not the
generator's to invent. The difference is *how* it is enforced: the task context
states the exact `id`, `date`, and target path, and finalize rejects the file if
what was written disagrees with it. Enforcement moved from "the generator never
receives these values" to "the generator is given them and is checked against
them".

`renderLesson` is therefore not part of the daily write path. It stays because
finalize uses it as the canonical-form check —
`renderLesson(parseLesson(document)) === document` proves the file is in
canonical serialized form and not merely parseable.

### Validation is an acceptance gate, not a critic

Finalize asks one question: *is this file acceptable as canonical data?* It
answers with objective checks only.

**What it checks** — the expected file exists; `parseLesson` succeeds; the
metadata equals the task context exactly; the lesson schema version is the one
this build supports; `validateLessonBody` passes; the document is in canonical
form; and the working tree's changed-file set contains nothing but that one
lesson file.

**What it must never check** — whether the Spanish is correct, whether a
conjugation is right, whether the Chinese reads naturally, whether the material
is deep enough, or how good the examples are. None of that is decidable from the
text. A validator that guesses at it produces false rejections that throw away
good work, which is worse than not checking.

**Teaching quality is the prompt's job, not the validator's.** The lesson
contract and the generation prompt are what make a lesson good; the validator
only keeps malformed data out of Git. There is no semantic scoring and no
second AI review pass.

**Canonical structural validation** — `validateLessonBody(body)` — is the piece
that every consumer relies on, not just generation: it checks the five section
headings present in the fixed order, no duplicated or extra `##` sections, no
frontmatter in the body, and a non-empty body. A `##` line inside a fenced code
block is not a section; an unclosed fence fails, because the structure cannot
then be determined. It applies equally to a freshly written lesson and to one
read back out of Git years later.

## 5. Pipeline stages

### Stage 1 — CANONICAL

The only stage that defines whether a day is complete.

| | |
|---|---|
| **Input** | `vocabulary.json`, `history.jsonl`, injected clock |
| **Output** | `lessons/YYYY/YYYY-MM-DD-{id}.md` and one appended `history.jsonl` record, in **one commit + push** |
| **Steps** | **prepare** (select → task context) → **generate** (Claude Code Action writes the file) → **finalize** (accept → append history → commit → push) |
| **Idempotency** | a history record for today exists ⇒ the entire stage is skipped |
| **Failure** | abort, non-zero exit. A rejected lesson **never reaches history and never gets committed**. |

Prepare touches no network. "Which word is today's" is decided by pure functions
and can be answered offline at zero cost.

#### The three steps

**Prepare** — Node. Loads the vocabulary and history, computes today in
`Asia/Taipei`, and runs selection. On `replay` or `exhausted` it stops and the
generation step never runs. On `selected` it emits a **task context**: the `id`,
`word`, `pos`, `date`, lesson schema version, and the single repository-relative
path the lesson may be written to. Every value in it is derived, not negotiated.

**Generate** — a Claude Code GitHub Action. It reads `docs/lesson-spec.md` and
writes exactly one file, at exactly the path the task context names, complete
with frontmatter and the five sections. It may run the repository's own
validation command and fix its own output.

It must not: touch `history.jsonl`, the vocabulary, application code,
documentation, or any other lesson; commit or push; decide which word today is;
alter any value in the task context; or ask the user anything.

**Finalize** — Node. Applies the acceptance gate of §4, and only if every check
passes appends the history record, stages the lesson and the history together,
commits, and pushes.

**Ordering rule:** nothing is appended to history and nothing is committed until
the generated file has passed every acceptance check. A rejected lesson leaves
history untouched, so the day stays unfinished and re-running is safe.

The two canonical writes — the lesson file and the history record — must land in
**one commit**, and that is finalize's responsibility. No single store provides a
cross-file transaction; the invariant belongs to Stage 1 as a whole.

#### Claude is an agent here, not an API client

- Generation runs through the `anthropics/claude-code-action` GitHub Action.
- Authentication uses a `CLAUDE_CODE_OAUTH_TOKEN` produced by
  `claude setup-token`, held as a repository secret.
- The application does **not** depend on `@anthropic-ai/sdk` and does **not**
  read `ANTHROPIC_API_KEY`. There is no generation client in `src/`.
- The model is selected through the action's own arguments, not in application
  code.
- Interactive questioning must be disabled — the run is unattended, and a
  question would hang it rather than surface a decision.
- The agent never commits, never pushes, and never records completion. Only
  finalize does.

The exact action version, model identifier, and tool-restriction syntax are
deliberately not pinned here. They are verified against the official
documentation during the GitHub Actions milestone rather than guessed now.

#### What the workflow file may and may not do

The workflow orchestrates three steps rather than invoking one command, but it
stays a shell: it wires up the environment and calls the external action.

Every business rule — selection, replay and exhaustion, the expected target
path, metadata comparison, the allowed changed-file set, history append, the
single commit, the push, and what counts as done — is enforced by Node functions
and commands. None of it may be reimplemented in YAML, where it would be
untestable and would drift from the code that owns it.

**Selection algorithm** — `domain/selection.ts`, a pure function of
`(vocabulary, history, today)`:

```ts
type SelectionResult =
  | { kind: 'selected'; entry: VocabularyEntry }
  | { kind: 'replay'; record: HistoryRecord }
  | { kind: 'exhausted' }
```

- **Replay wins first.** If the history already holds a record for today, that
  record is returned and nothing else is selected. The record is returned rather
  than a vocabulary entry, so replay holds even when the recorded `id` has since
  retired from the vocabulary — that is **not an error** (§3).
- Otherwise, pick the **unlearned word with the lowest `order`**. The curated
  `order` defines the learning sequence (`docs/vocabulary-spec.md` §2).
- No randomness and no shuffle. The same inputs always yield the same result, and
  the order of the vocabulary array is irrelevant.
- Duplicates are prevented structurally: the candidate set is the complement of
  the learned set, so a learned word cannot be selected again.
- An `id` present in the history but absent from the vocabulary stays in the
  learned set. Words can be removed from the curriculum; what has been learned
  does not become unlearned.
- `exhausted` is an ordinary success, not an error: it is a named variant, never
  `null`, `undefined`, or a thrown exception. The run then exits 0.
- Spaced review is a future feature and no part of this (§13).

### Stage 2 — PROJECTION

| | |
|---|---|
| **Input** | the canonical Lesson, read from Git via `parseLesson`, plus adapter configuration |
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
| Lesson generation (the action) | a file may be left in the working tree | abort; nothing is appended or committed | ≠0 | regenerates |
| **Lesson acceptance** | a rejected file may be left in the working tree | abort; **history untouched, nothing committed** | ≠0 | regenerates |
| Commit or push | local only — see below | abort | ≠0 | see below |
| **Notion projection** | canonical data already committed | abort, **no rollback** | ≠0 | **re-projects from Git; does not call Claude** |
| **Telegram** | learning record already complete | warn only | **0** | not re-sent |

The core invariant: **the history record is the sole definition of "done."** Until
it is pushed, the day is unfinished and re-running is safe. After it is pushed,
the day is finished and nothing downstream can undo it.

### When the commit or the push fails

"Not pushed" means the canonical remote does not have the day, so the day is not
complete. It does **not** mean nothing happened locally: the working tree may
hold written files, and a local commit may already exist.

What becomes of that local state depends on where the run happened:

- **On an ephemeral CI runner**, the workspace is discarded when the job ends, so
  unpushed work disappears and the next scheduled run starts from the remote.
- **On a developer machine**, the working tree and any local commit persist. The
  next run therefore starts from a repository that is *not* in the same state as
  a fresh clone.

Stage 1 must therefore either handle an unclean local state or refuse to run
until it is resolved — and say which, out loud. It must never write canonical
data on top of a state it has not accounted for.

Which of those two it does is **not decided here**, and no retry, rebase, or
conflict-resolution behaviour is designed in this document. That is a decision
for the Stage 1 orchestration milestone, to be made when the code forces it.

## 9. Boundaries

### domain → pipeline → adapter

- `domain/` never names a platform. Not in code, not in types, not in identifiers.
- The pipeline modules import their adapters directly — `finalize.ts` will name
  `notion.ts`, not resolve it. This is **deliberate**: they are the composition
  root, and eliminating that import with a registry or dependency injection is
  exactly the premature abstraction §1 forbids.
- **An adapter may depend on the canonical Lesson model. The canonical Lesson
  model may never depend on an adapter.**

### Platform-specific knowledge is contained

Notion database schema, page IDs, block structure, API tokens, and every
equivalent for any other adapter live **only inside that adapter file**. They must
never reach `vocabulary.json`, `history.jsonl`, the canonical lesson content, the
domain layer, or any core pipeline decision.

Adapter configuration is read inside its own adapter, never gathered into a
shared module that would then know every platform at once.

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
`parseLesson`. No change to canonical data, the domain layer, or the
existing adapters. Nothing is built in advance to enable this.

## 10. Adapter contracts

Each adapter is a module of plain functions. There is no shared interface, no base
class, and no registry.

Lesson generation has no adapter here — it is a GitHub Action, not a client
this application owns (§5).

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
- Taiwan observes no daylight saving, so UTC+8 is fixed year-round.

**The schedule and the date are two different things.** A scheduled workflow
states its own timezone — `Asia/Taipei`, the same one — so the trigger reads as
the intent rather than as a hand-converted UTC time. That only decides *when the
run is asked to start*. It never supplies the date: "today" is still computed by
`domain/date.ts` from the instant the run actually begins.

Keeping them separate is what makes a late run harmless. GitHub delays scheduled
runs under load, and may drop them outright; the start of every hour is a named
high-load time, so the schedule avoids it. A delayed run is still correct,
because it takes the Taipei date of the moment it runs. A dropped run costs that
day's lesson and nothing more: selection takes the unlearned word with the lowest
`order`, so the word simply moves to the next day and the curriculum stays intact.

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

Questions that are still open change as the work proceeds, so they are tracked in
`docs/implementation-plan.md` rather than here. This document records decisions
that have been made.

## Changelog

- **v1** — Initial architecture: three-stage pipeline, canonical-first durable
  write with a single commit, per-stage idempotency, layer and adapter boundaries,
  the canonical Lesson content model, and the anti-premature-abstraction policy.
