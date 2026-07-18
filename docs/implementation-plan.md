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

## Current milestone

**Node prepare and finalize contracts** — not started.

The smallest vertical slice of the corrected Stage 1, in Node only:

- **prepare** — produce the deterministic task context for today: the `id`,
  `word`, `pos`, `date`, lesson schema version, and the single repository-relative
  path the lesson may be written to. On `replay` or `exhausted` it produces no
  task context.
- **finalize** — verify the lesson file the generation step wrote: that it parses,
  that its metadata equals the task context exactly, that it is in canonical form,
  and that the working tree's changed-file set contains nothing but that one file.

Explicitly out of scope for this milestone:

- the GitHub Actions workflow YAML
- the Claude Code Action prompt
- `CLAUDE_CODE_OAUTH_TOKEN` setup
- history append
- the Git commit and push implementation
- Notion
- Telegram

## Remaining milestones

- [ ] Stage 1 prepare: selection → task context
- [ ] Stage 1 finalize: acceptance gate, history append, commit + push
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
| Whether `history.jsonl` missing means "first run" outside the CLI, where `cli/today.ts` currently makes that call at its own composition boundary | Stage 1 orchestration |
| How Stage 1 handles an unclean local repository — handle it or refuse to run (`docs/architecture.md` §8) | Stage 1 orchestration |
| The Git identity used for commits in GitHub Actions | Scheduling |
| The Notion database Title property, and Markdown → Notion block conversion | Notion projection |

## Verification baseline

State as of the latest completed milestone. Replace it when a milestone closes;
do not accumulate history here.

- Latest commit: `a19f05b` on `main`, pushed
- `npm run typecheck` — passes
- `npm run build` — passes
- `npm test` — 291 tests, 291 pass, 0 fail (38 suites)
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
