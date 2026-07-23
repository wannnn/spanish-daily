# CLAUDE.md

## Purpose

`spanish-daily` is a personalized AI Spanish learning **content** system. Each day it selects a vocabulary word, has a Claude Code GitHub Action write a complete teaching lesson for it, and stores the lesson and the learning record in Git. A read-only static web application projects the lessons for reading.

The vocabulary selection logic is the **core data layer, not the product**. The product is the daily lesson.

The vocabulary dataset reached its first milestone of 1000 core high-frequency words. 1000 is the first curriculum milestone, not a system limit — the dataset is designed to grow for years and is never "finished."

## Current state

Everything below is **implemented and running**. There is no active build milestone; future features are unscheduled (see **Possible future work**).

- **Stage 1 daily pipeline — operational.** `prepare` (Node) → generation (Claude Code GitHub Action) → `finalize` (Node) runs on a schedule via `.github/workflows/daily-lesson.yml`, committing and pushing the lesson and history record in one commit.
- **Static website v1 — live.** A read-only Astro static site under `web/`, deployed to GitHub Pages by a **separate** workflow (`.github/workflows/pages.yml`) — https://wannnn.github.io/spanish-daily/.
- **Vocabulary — first 1000-word milestone complete.** `vocabulary.json` holds `w0001`–`w1000`.

## Authoritative documents

Every design decision has exactly one owning document. Read the owner before changing anything in its area, and record new decisions there rather than here. Do not duplicate their contents here — a short summary with a reference is fine; a second full copy will drift.

| Document | Owns |
|---|---|
| `docs/architecture.md` | Application architecture: layers, pipeline stages, completion semantics, idempotency, failure and retry behaviour, adapter boundaries. |
| `docs/vocabulary-spec.md` | Vocabulary **data contract**: entry schema, identity, `order`, POS enum, validation rules, loader behaviour. |
| `docs/vocabulary-curation.md` | Vocabulary **curation process**: how the word list is built and extended — selection method, sources, staged human-review workflow, validation checklist. |
| `docs/lesson-spec.md` | Lesson content and generation contract: input contract, Markdown structure, example-sentence rules, prompt architecture. |
| `docs/web-design.md` | Website v1 design: information architecture, page content, sorting, pagination, and visual direction. Not canonical content, the pipeline, or deployment architecture. |
| `CLAUDE.md` (this file) | Agent context, development principles, rules for changes. |

## Single ownership

- Every durable rule has exactly one owning document.
- Other files may reference that owner only when necessary, but must not restate the rule.
- Code comments explain local intent, invariants, and non-obvious constraints; they do not describe the repository's documentation structure.
- Do not add cross-file references for history or navigation alone.
- `README.md` may keep a concise documentation map; `CLAUDE.md` may keep the authoritative-document ownership map above.

## Architecture in brief

Full detail in `docs/architecture.md`. The essentials an agent must not violate:

- This is a **content** system, not a website-based system. `lessons/**/*.md` is the canonical lesson content; the web application and any future consumer are projections that must be re-derivable from Git.
- The daily pipeline's only canonical stage is **Stage 1** (Node prepares a task context → a Claude Code Action writes the lesson file → Node accepts it, appends history, and commits + pushes both in one commit). Reading and delivery are projections downstream of it; the static website is deployed by a **separate** workflow. See `docs/architecture.md` §5 and §10.
- **Only Stage 1 defines whether a day is complete.** A projection or notification failure never rolls back, invalidates, or regenerates committed canonical data.
- The Git repository is the single source of truth. Progress is always *derived* from committed data — never from a status flag or status table.
- `domain/` is pure and never names a platform. `pipeline/` is the composition root. Platform-specific knowledge stays inside its own adapter.

## Canonical data

The single source of truth, all in Git:

- `vocabulary.json` — which words, in what order (human-maintained; the system never writes it).
- `history.jsonl` — what has been learned (append-only; the learned set is derived, never stored).
- `lessons/**/*.md` — the canonical lesson content.

## Technology stack

- Node.js with TypeScript (strict mode, ES2022, NodeNext modules, ESM); npm.
- Root dev dependencies limited to `typescript` and `@types/node`; no runtime dependency. Tests use the built-in `node:test` — no test framework dependency.
- The website (`web/`) is Astro with `marked`, with its **own** `package.json` — no dependency is added to the root, no npm workspace.
- GitHub Actions runs two **separate** workflows: the daily lesson pipeline and the Pages deployment.
- Lesson generation is the **Claude Code GitHub Action** — an action, not an API client. The application depends on no Anthropic SDK and reads no `ANTHROPIC_API_KEY`.

Add an integration only as part of the feature that needs it, never earlier.

## Possible future work (none scheduled)

- **Vocabulary growth beyond 1000** — human-reviewed batches per `docs/vocabulary-curation.md`; the deferred candidates are listed there.
- **Website candidates** — client-side search, Firebase Cloud Messaging notification, and the minimal Service Worker notification would require. Nothing else is implied by these.

Out of scope entirely: login, user accounts, progress sync, any application backend, and (dropped) the Notion and Telegram projections.

## Development principles

- Build one capability at a time and keep it working before starting the next.
- Prefer the simplest thing that solves the problem at hand. This is a personal project, not a platform.
- Add a dependency only when it is needed for the feature being built.
- Defer decisions until the code forces them. An undecided detail is better than a wrong abstraction.
- Prefer explicit and reliable over clever. This system must stay maintainable for years.

## Rules for changes

- Do not add integrations or projections ahead of the learning logic they are meant to carry.
- Do not build premature abstractions: no generic projection framework, repository abstraction, plugin system, event bus, or scaffolding for unscheduled future candidates. The explicit prohibitions are in `docs/architecture.md` §1.
- Platform-specific concepts stay inside their own adapter. Canonical data and the domain layer must not depend on any adapter. Full rules and rationale: `docs/architecture.md` §9.
- Do not create directories or scaffolding for features that do not exist yet.
- Do not install packages that the current step does not require.
- Do not change the vocabulary selection algorithm without an explicit decision to do so.
- Extend the vocabulary only through the human-review workflow in `docs/vocabulary-curation.md`; AI never decides inclusion, removal, or final order on its own.
- When a design decision is genuinely open, ask rather than guessing and building on the guess.
- Keep `README.md` as the public description; keep agent context and change rules here.
