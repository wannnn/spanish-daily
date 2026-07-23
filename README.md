# spanish-daily

A personal, automated Spanish learning **content** system. Each day it selects the
next vocabulary word, has a Claude Code GitHub Action write a complete teaching
lesson for it, and stores the lesson and the learning record in Git. A read-only
static website projects the lessons for reading.

**Live site:** https://wannnn.github.io/spanish-daily/

The product is the daily lesson. Vocabulary selection is the core data layer beneath
it.

## How it works

The daily pipeline (**Stage 1**) is the only thing that decides whether a day is
complete. It runs three steps in order, wired together by a GitHub Actions workflow:

1. **prepare** (Node) — computes today's date in `Asia/Taipei`, reads the vocabulary
   and history, selects the unlearned word with the lowest `order`, and emits a task
   context (the word, its part of speech, the date, and the one path the lesson may
   be written to).
2. **generate** (Claude Code GitHub Action) — reads `docs/lesson-spec.md` and writes
   exactly one canonical lesson file at that path. It never commits, never touches
   history, and never decides which word today is.
3. **finalize** (Node) — accepts the generated file against the task, appends the
   history record, and commits **and pushes** the lesson and the record in a single
   commit. A day is complete only after the push.

The static website is a **separate** projection: its own workflow rebuilds the whole
site from Git on every push to `main` and deploys it to GitHub Pages. A failed site
build never affects whether a day counts as learned.

## Canonical data (the single source of truth, all in Git)

- `vocabulary.json` — which words to teach, and in what order. Human-maintained; the
  system reads it and never writes it.
- `history.jsonl` — what has been learned, append-only, one record per day. The
  learned set is *derived* from it, never stored separately.
- `lessons/**/*.md` — the canonical lesson content. Everything else (the website, any
  future consumer) is a projection that can be rebuilt from these.

## Status

- **Stage 1 daily pipeline** — implemented and running on a schedule.
- **Static website v1** — implemented and live on GitHub Pages (mobile-first,
  installable to the iPhone home screen).
- **Vocabulary** — the first **1000-word** curriculum milestone is complete
  (`w0001`–`w1000`). 1000 is the first milestone, not a cap; growth beyond it is
  possible future work and is not currently scheduled.

## Technology

- Node.js + TypeScript (strict, ES2022, NodeNext, ESM). The root has no runtime
  dependencies; dev dependencies are `typescript` and `@types/node` only.
- Tests use the built-in `node:test` — no test framework.
- The website (`web/`) is [Astro](https://astro.build/) with
  [`marked`](https://github.com/markedjs/marked), with its own `package.json` (no
  dependency is added to the root).
- Lesson generation is the `anthropics/claude-code-action` GitHub Action — an action,
  not an API client. The application depends on no Anthropic SDK.

## Local setup

```bash
npm ci          # root
npm --prefix web ci   # website (only needed to work on the site)
```

## Common commands

Root:

| Command | What it does |
|---|---|
| `npm run build` | Compile `src/` to `dist/` (`rm -rf dist && tsc`). |
| `npm run typecheck` | Type-check without emitting. |
| `npm test` | Build, then run `node:test` over `dist/**/*.test.js`. |
| `npm run today` | Print today's selection (read-only; makes no changes). |

Website (run inside `web/`, or with `npm --prefix web`):

| Command | What it does |
|---|---|
| `npm run dev` | Local Astro dev server. |
| `npm run build` | Build the static site, then run build-time artifact assertions. |
| `npm run preview` | Preview the built site. |

The website build imports the compiled canonical parser from `dist/`, so run the
root `npm run build` before building the site locally.

## Running the daily workflow manually

The daily pipeline runs on a schedule (06:44 `Asia/Taipei`). To trigger a run by
hand, use the **Daily lesson** workflow's *Run workflow* button on the Actions tab,
or with the GitHub CLI:

```bash
gh workflow run "Daily lesson"
```

A run with nothing to teach (today already recorded, or every word learned) succeeds
without generating or committing anything.

## Documentation

| Document | Owns |
|---|---|
| `CLAUDE.md` | Agent context, development principles, rules for changes. |
| `docs/architecture.md` | Application architecture: layers, pipeline stages, completion semantics, boundaries. |
| `docs/vocabulary-spec.md` | Vocabulary **data contract**: entry schema, identity, `order`, POS enum, validation. |
| `docs/vocabulary-curation.md` | Vocabulary **curation process**: how the word list is built and extended. |
| `docs/lesson-spec.md` | Lesson content and generation contract. |
| `docs/web-design.md` | Website v1 design: pages, sorting, pagination, visual direction. |
