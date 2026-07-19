# Implementation Plan

## Purpose

This is the working state of the build: what is done, what is next, and what is
still undecided. It is a **handoff document**, and the entry point after a
context reset or a new session.

It is not architecture and not a contract. It never decides how the system works
— it only records how far the work has got.

## Working rules

- Architecture and contracts are owned by their authoritative documents. This
  file defers to them and never redefines them.
- Track progress here only. Do not restate specifications.
- One milestone at a time. Do not start the next one early.
- Tick a milestone only after it is implemented, reviewed, verified, committed,
  and pushed.
- When a milestone closes, update the current milestone, the next steps, and the
  open questions below.

## Completed milestones

- [x] **Documentation and architecture** — `a99c592`
  - Also: `53c2483`, `8618890`, `381b68e` (contracts), `061ee76`, `ddcb2b9`
- [x] **Vocabulary validation and loader** — `106aace`
  - `domain/vocabulary.ts`, `io/vocabularyStore.ts`
- [x] **History parsing, Taipei date, and word selection** — `0d6421d`
  - `domain/history.ts`, `domain/date.ts`, `domain/selection.ts`,
    `io/historyStore.ts`
- [x] **Read-only daily selection CLI** — `e5527de`
  - `cli/today.ts`
- [x] **Canonical Lesson model** — `60427bc`
  - `domain/lesson.ts`. The `io/lessonStore.ts` written in the same commit was
    removed by the architecture correction below — the generation action writes
    the lesson file, so nothing in Node writes one.
- [x] **Architecture correction for Claude Code Action generation** — `a19f05b`
  - Lesson generation is a Claude Code GitHub Action, not an Anthropic Messages
    API client. The abandoned API work and `io/lessonStore.ts` were removed, and
    `docs/architecture.md`, `docs/lesson-spec.md`, and `CLAUDE.md` were
    synchronized. Settled: generation runs through `anthropics/claude-code-action`
    authenticated by a `CLAUDE_CODE_OAUTH_TOKEN`; the agent writes one complete
    canonical lesson file and never touches history, never commits, and never
    decides the word; Node prepares the task context, accepts or rejects the
    result, appends history, and commits + pushes both in one commit; the prompt
    and the lesson contract constrain teaching quality, while the Node validator
    is an objective acceptance gate only.
- [x] **Node prepare and lesson acceptance contracts** — `97924eb`
  - `domain/lessonTask.ts`: the two Node-side steps of Stage 1, both pure.
    **prepare** composes `selectWord` into a deterministic task — `id`, `word`,
    `pos`, `date`, lesson schema version, and the one path the lesson may be
    written to — and produces no task on `replay` or `exhausted`. **acceptance**
    checks the returned document against that task: exact path, then parse, then
    metadata field by field, then canonical form. Settled: acceptance compares
    the **raw** bytes (`renderLesson(parseLesson(document)) === document`), so a
    CRLF document, a missing final newline, or non-canonical quoting or spacing
    is rejected and never repaired; it does not re-run `validateLessonBody`,
    because `parseLesson` already runs the whole canonical contract; and an
    invalid `today` fails before any branch, including replay and exhaustion.

- [x] **Stage 1 operational finalize foundations** — `8aa9b6e`
  - `io/historyStore.ts` gains `appendHistoryRecord`; `io/git.ts` is new and
    read-only. Settled: **append creates the file when it is missing** — that is
    day one — while **`loadHistory` still fails on a missing file**, because a
    read of history that is not there is a caller's mistake. A duplicate `date`
    or `id` is refused rather than absorbed; an append is not a replay API. The
    whole existing file must pass `parseHistory` before anything is written, and
    existing bytes are copied through untouched, so a history already using CRLF
    or carrying blank lines is never silently rewritten. Durability is
    single-process — temp file in the target's own directory, exclusive create,
    then rename — with no lock and no support for concurrent writers.
    Inspection reads `git status --porcelain=v1 -z --untracked-files=all` through
    a non-shell invocation, so paths containing spaces, quotes, non-ASCII, or
    newlines survive intact; ignored files never count; ordering is by code unit.
    **Stage 1 requires a completely clean worktree to begin**, which settles
    `docs/architecture.md` §8 in the "refuse to run" direction, and **the only
    change generation may leave is one new untracked, unstaged file at the task's
    target path**. Repository-root equality is by realpath on both sides, because
    Git resolves symlinks when it reports the worktree root.

- [x] **Stage 1 durable write** — `6b367cb`
  - `pipeline/finalize.ts` is the first composition root: it decides the order of
    operations and nothing else. `io/git.ts` gains the write side. Settled: the
    sequence is fixed — inspect → confirm only the lesson changed → read it →
    accept it → append history → re-inspect → stage exactly two paths → confirm
    the index holds exactly those two → commit → push — and **completion is
    returned only after the push**, because on an ephemeral runner an unpushed
    commit does not exist. **The durable write owns the canonical history path**:
    `HISTORY_PATH` is fixed in the module, not accepted from a caller, since a
    caller that could name another file could name the lesson just accepted and
    append a JSONL row into canonical content after every check that would have
    caught it. The history record is likewise derived from the task, never
    supplied. **Staging is by exact path after `--`** — no `git add .`, no
    `git add -A` — the index is verified before the commit, and the commit is
    given no paths so it takes exactly what was verified. The upstream is never
    guessed: a branch without one fails loudly, and the system sets neither a
    remote nor a branch. **Nothing is rolled back** — no reset, checkout, revert,
    or force push — and each error names the stage, what is on disk, and, after a
    failed push, the local commit hash. `GitWriteError` joins
    `GitInspectionError`, mirroring the `HistoryStoreError` / `HistoryLoadError`
    split.

## Current milestone

**Stage 1 orchestration and CLI** — not started.

The milestone that joins the pieces into a run, without yet scheduling one.

- confirm a clean working tree **before** generation, not only after
- compose prepare → the external generation boundary → the durable finalize
- the `replay` and `exhausted` flows, which never reach generation
- a partial-run recovery policy: an unpushed commit survives on a developer
  machine, and nothing currently resumes from it
- the `prepare` and `finalize` CLI contracts

Explicitly out of scope for this milestone:

- the GitHub Actions workflow YAML
- the Claude Code Action prompt
- `CLAUDE_CODE_OAUTH_TOKEN` setup
- Notion
- Telegram

## Remaining milestones

- [ ] Stage 1 orchestration and the prepare / finalize CLI
- [ ] Claude Code Action workflow and generation prompt
- [ ] Notion projection
- [ ] Telegram notification
- [ ] GitHub Actions scheduling

## Open questions

Undecided, and each will block the milestone it belongs to.

| Question | Blocks |
|---|---|
| The `anthropics/claude-code-action` version to pin | Workflow |
| The model argument the action is given | Workflow |
| The exact tool-restriction syntax that keeps the agent to one file | Workflow |
| `CLAUDE_CODE_OAUTH_TOKEN` setup and the repository secret name | Workflow |
| Seed vocabulary content — the word list is the maintainer's decision (`docs/vocabulary-spec.md` §1); a small hand-verified set is enough to exercise the pipeline | End-to-end runs |
| How a partially completed run is recovered — an unpushed commit on a developer machine survives, and nothing currently resumes from it | Orchestration |
| The Git identity used for commits in GitHub Actions | Scheduling |
| The Notion database Title property, and Markdown → Notion block conversion | Notion projection |

## Verification baseline

State as of the latest completed milestone. Replace it when a milestone closes;
do not accumulate history here.

- Latest commit: `6b367cb` on `main`, pushed
- `npm run typecheck` — passes
- `npm run build` — passes
- `npm test` — 459 tests, 459 pass, 0 fail (64 suites)
- Working tree expected clean
- Dependencies: `typescript` and `@types/node` only — no runtime dependency

Known and deliberately unfixed: `package.json` says version `0.1.0` while
`package-lock.json` records `1.0.0`. Any npm command will rewrite the lockfile to
match. It is left for its own chore commit rather than riding along with
unrelated work.

## Handoff

**Read first:** `CLAUDE.md`, then this file. Read `docs/architecture.md` for the
pipeline and boundaries, and the relevant contract — `docs/vocabulary-spec.md` or
`docs/lesson-spec.md` — before touching the code it governs.

**Then:** confirm the baseline above still holds (`npm run typecheck`,
`npm test`, clean tree), and start the current milestone only.

**Do not:** redesign the architecture or the contracts, start a later milestone
early, add a dependency the current milestone does not need, create planning or
status files beyond this one, or commit without review.
