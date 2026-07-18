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
- [x] **Canonical Lesson model and lesson store** — `60427bc`
  - `domain/lesson.ts`, `io/lessonStore.ts`

## Current milestone

None in progress. Claude API work has **not** started; no dependency has been
added and `src/integrations/` does not exist.

The next milestone covers only:

- the Claude generator adapter
- prompt construction
- generation input `{ word, pos }` — nothing else reaches the generator
- body-only output, with no frontmatter
- validation of the generated body against the lesson content contract

Explicitly out of scope for that milestone:

- history append
- Git commit / push orchestration
- Notion
- Telegram
- GitHub Actions

## Remaining milestones

- [ ] Claude lesson generation adapter and generated-body validation
- [ ] History append and canonical write preparation
- [ ] Stage 1 orchestration and Git commit + push
- [ ] Notion projection
- [ ] Telegram notification
- [ ] GitHub Actions scheduling

## Open questions

Undecided, and each will block the milestone it belongs to.

| Question | Blocks |
|---|---|
| Which Claude model, and whether to use extended thinking (`docs/lesson-spec.md` §5 defers both to implementation) | Claude generation |
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
- `npm test` — 306 tests, 306 pass, 0 fail
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
