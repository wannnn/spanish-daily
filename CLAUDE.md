# CLAUDE.md

## Purpose

`spanish-daily` is a personalized AI Spanish learning **content** system. Each day it selects a vocabulary word, has a Claude Code GitHub Action write a complete teaching lesson for it, and stores the lesson and the learning record in Git. A read-only static web application projects the lessons for reading.

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

- This is a **content** system, not a website-based system. `lessons/**/*.md` is the canonical lesson content; the web application and any future consumer are projections that must be re-derivable from Git.
- The daily pipeline's only canonical stage is **Stage 1** (Node prepares a task context → a Claude Code Action writes the lesson file → Node accepts it, appends history, and commits + pushes both in one commit). Reading and delivery are projections downstream of it: the current roadmap builds a static lesson web application, deployed by a **separate** workflow, and defers notification. See **Current roadmap** below, and `docs/architecture.md` §5 and §10 for the full contract.
- **Only Stage 1 defines whether a day is complete.** A projection or notification failure never rolls back, invalidates, or regenerates committed canonical data.
- The Git repository is the single source of truth. Progress is always *derived* from committed data — never from a status flag or status table.
- `domain/` is pure and never names a platform. `pipeline/` is the composition root. Platform-specific knowledge stays inside its own adapter.

## Current roadmap

The next milestone is a **static lesson web application**. This section records the confirmed direction so it is not re-litigated; the owning document is `docs/implementation-plan.md`, which is updated when the milestone actually begins — not here, and not yet.

Confirmed:

- **The Notion projection is dropped.** It is no longer on the roadmap.
- The website is a **read-only static projection**. Git — the vocabulary, the history, and the lesson Markdown — stays the single canonical source; the site is re-derivable from it and never writes back.
- Hosting is **GitHub Pages**. The build reads the canonical lesson Markdown at build time and emits static HTML.
- **Mobile-first.**
- Version 1 is installable to the iPhone home screen: a web app manifest, icons, and `display: standalone`. Nothing beyond that for installability.
- Version 1 does **not** include a Service Worker, search, or notification.
- The **only** sanctioned future candidates — none of them scheduled, none to be built ahead of time — are: client-side search; Firebase Cloud Messaging notification; and the minimal Service Worker that notification would require. Nothing else is implied by them.
- Out of scope entirely: login, user accounts, progress sync, and any application backend.
- The daily lesson workflow and the Pages deployment workflow are **separate workflows**. The deploy never runs inside the daily run.
- Do not build a generic projection framework, a repository abstraction, a plugin system, or empty scaffolding for the future candidates. Build the static site that exists, and nothing for the features that do not.

Deliberately still open — do not assume an answer: UI layout, visual design, URL structure, framework choice, component architecture, and any Firebase implementation detail.

## Technology stack

**In use**

- Node.js with TypeScript (strict mode, ES2022, NodeNext modules, ESM)
- npm for package management
- Dev dependencies limited to `typescript` and `@types/node`
- Tests use the built-in `node:test` — no test framework dependency
- GitHub Actions runs the daily lesson workflow (`.github/workflows/daily-lesson.yml`)
- Claude Code GitHub Action for lesson generation — an action, not an API client; the application depends on no Anthropic SDK and reads no `ANTHROPIC_API_KEY`

**Planned, not yet built**

- The static lesson web application and its GitHub Pages deployment workflow — the next milestone; confirmed scope is under **Current roadmap**. Notion and Telegram are dropped; notification is a deferred Firebase Cloud Messaging candidate, not planned work.

Adding any integration is part of the milestone that needs it, never earlier.

Implementation details not covered by the authoritative documents are still open. Do not assume an answer — ask.

## Development principles

- Build one capability at a time and keep it working before starting the next.
- Prefer the simplest thing that solves the problem at hand. This is a personal project, not a platform.
- Add a dependency only when it is needed for the feature being built.
- Defer decisions until the code forces them. An undecided detail is better than a wrong abstraction.
- Prefer explicit and reliable over clever. This system must stay maintainable for years.

## Rules for changes

- Do not add integrations or projections (the web application, notification delivery) ahead of the learning logic they are meant to carry.
- Do not build ahead of the web-application milestone's confirmed scope: no generic projection framework, repository abstraction, plugin system, or scaffolding for the deferred future candidates. The scope and its build-nothing-ahead constraints are under **Current roadmap**.
- Platform-specific concepts stay inside their own adapter. Canonical data and the domain layer must not depend on any adapter. Full rules, rationale, and failure scenarios: `docs/architecture.md` §9.
- Do not build premature abstractions. The explicit prohibitions are listed in `docs/architecture.md` §1.
- Do not create directories or scaffolding for features that do not exist yet.
- Do not install packages that the current step does not require.
- Do not change the vocabulary selection algorithm without an explicit decision to do so.
- When a design decision is genuinely open, ask rather than guessing and building on the guess.
- Keep `README.md` as the short public description; keep planning and context in this file.
