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
    removed during the architecture correction below — the generation action
    writes the lesson file, so nothing in Node writes one.

## Current milestone

**Architecture correction for Claude Code Action generation** — in progress, not
yet reviewed or committed.

Lesson generation does **not** go through the Anthropic Messages API. A Claude
Code GitHub Action writes the canonical lesson file directly. Settled:

- Generation runs through `anthropics/claude-code-action`, not `@anthropic-ai/sdk`.
- Authentication uses a `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` —
  the application holds no API key and reads no `ANTHROPIC_API_KEY`.
- The agent writes one complete canonical lesson file: frontmatter and all five
  sections. It never touches history, vocabulary, code, docs, or any other
  lesson, and it never commits.
- Node prepares a deterministic task context, then accepts or rejects the
  finished file, appends history, and commits + pushes both in one commit.
- The prompt and the lesson contract are the primary constraint on teaching
  quality; the Node validator is an objective acceptance gate only — no semantic
  scoring, no second AI review.

Done in this milestone: the abandoned Messages API work was rolled back (the SDK
dependency, the adapter, its generated-body validator, and `io/lessonStore.ts`,
which lost its only production consumer). `docs/architecture.md`,
`docs/lesson-spec.md`, and `CLAUDE.md` were synchronized.

Explicitly **not** implemented here: the workflow YAML, the action prompt, the
prepare and finalize CLIs, history append, commit and push, and any token setup.

## Next milestone

The Node-side prepare and finalize contracts — the smallest vertical slice of the
corrected Stage 1 — before any workflow YAML is written.

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

- Latest commit: `60427bc` on `main`, pushed
- `npm run typecheck` — passes
- `npm test` — see the correction milestone above; the lesson-store suite was
  removed with its module
- Working tree expected clean
- Dependencies: `typescript` and `@types/node` only

## Handoff

**Read first:** `CLAUDE.md`, then this file. Read `docs/architecture.md` for the
pipeline and boundaries, and the relevant contract — `docs/vocabulary-spec.md` or
`docs/lesson-spec.md` — before touching the code it governs.

**Then:** confirm the baseline above still holds (`npm run typecheck`,
`npm test`, clean tree), and start the current milestone only.

**Do not:** redesign the architecture or the contracts, start a later milestone
early, add a dependency the current milestone does not need, create planning or
status files beyond this one, or commit without review.
