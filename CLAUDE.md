# CLAUDE.md

## Purpose

`spanish-daily` is a personalized AI Spanish learning **content** system. Each day it selects a vocabulary word, uses the Claude API to generate a complete teaching lesson for it, stores the lesson and the learning record in Git, projects the lesson to Notion for reading, and sends a notification through Telegram.

The vocabulary selection logic is the **core data layer, not the product**. The product is the daily lesson.

The vocabulary dataset begins with roughly 1000 core high-frequency words. 1000 is the first curriculum milestone, not a system limit — design for a dataset that grows for years and is never "finished."

## Authoritative documents

Every design decision has exactly one owning document. Read the owner before changing anything in its area, and record new decisions there rather than here.

| Document | Owns |
|---|---|
| `docs/vocabulary-spec.md` | Vocabulary data contract: entry schema, identity, `order`, POS enum, validation rules, loader behaviour. |
| `docs/lesson-spec.md` | Lesson content and generation contract: input contract, Markdown structure, example-sentence rules, prompt architecture. |
| `docs/architecture.md` | Application architecture: layers, pipeline stages, completion semantics, idempotency, failure and retry behaviour, adapter boundaries. |
| `docs/implementation-plan.md` | What is built so far, the current milestone, open questions, and the handoff state. |
| `CLAUDE.md` (this file) | Agent context, development principles, rules for changes. |

Do not duplicate the contents of those documents here. A short summary with a reference is fine; a second full copy will drift.

**Before starting implementation work, read `docs/implementation-plan.md` for the current milestone and handoff state.** This file deliberately records no progress: it holds only what stays true between milestones.

## Architecture in brief

Full detail in `docs/architecture.md`. The essentials an agent must not violate:

- This is a **content** system, not a Notion-based system. `lessons/**/*.md` is the canonical lesson content; Notion, Telegram, and any future consumer are projections that must be re-derivable from Git.
- The daily pipeline has three stages: **Stage 1 CANONICAL** (select → generate → validate → write lesson + history → one Git commit + push), **Stage 2 PROJECTION** (Notion), **Stage 3 NOTIFICATION** (Telegram).
- **Only Stage 1 defines whether a day is complete.** A projection or notification failure never rolls back, invalidates, or regenerates committed canonical data.
- The Git repository is the single source of truth. Progress is always *derived* from committed data — never from a status flag or status table.
- `domain/` is pure and never names a platform. `pipeline/` is the composition root. Platform-specific knowledge stays inside its own adapter.

## Technology stack

**In use**

- Node.js with TypeScript (strict mode, ES2022, NodeNext modules, ESM)
- npm for package management
- Dev dependencies limited to `typescript` and `@types/node`
- Tests use the built-in `node:test` — no test framework dependency

**Planned integrations, not yet added**

- Claude API for lesson generation
- Notion, Telegram, and GitHub Actions

Adding any of these is part of the milestone that needs it, never earlier.

Implementation details not covered by the authoritative documents are still open. Do not assume an answer — ask.

## Development principles

- Build one capability at a time and keep it working before starting the next.
- Prefer the simplest thing that solves the problem at hand. This is a personal project, not a platform.
- Add a dependency only when it is needed for the feature being built.
- Defer decisions until the code forces them. An undecided detail is better than a wrong abstraction.
- Prefer explicit and reliable over clever. This system must stay maintainable for years.

## Rules for changes

- Do not add integrations (Notion, Telegram, GitHub Actions) ahead of the learning logic they are meant to carry.
- Platform-specific concepts stay inside their own adapter. Canonical data and the domain layer must not depend on any adapter. Full rules, rationale, and failure scenarios: `docs/architecture.md` §9.
- Do not build premature abstractions. The explicit prohibitions are listed in `docs/architecture.md` §1.
- Do not create directories or scaffolding for features that do not exist yet.
- Do not install packages that the current step does not require.
- Do not change the vocabulary selection algorithm without an explicit decision to do so.
- When a design decision is genuinely open, ask rather than guessing and building on the guess.
- Keep `README.md` as the short public description; keep planning and context in this file.
