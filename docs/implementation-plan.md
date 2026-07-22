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
- [x] **Stage 1 orchestration and CLI** — `897ff5f`
  - `pipeline/prepare.ts` and two commands, `cli/prepare.ts` and
    `cli/finalize.ts`. Stage 1 is now runnable end to end by hand, with
    generation performed externally between the two commands. Settled: **the
    clean-worktree check runs before generation**, because a tree that is already
    dirty makes it impossible to tell afterwards what the generation step wrote.
    `vocabulary.json` and `history.jsonl` are fixed repository-relative paths;
    only the repository root is an argument, defaulting to the working directory.
    **A missing `history.jsonl` is the first run inside the pipeline** — the
    pipeline chose that path, so it cannot be a typo, which is exactly why
    `loadHistory` itself still refuses to invent an empty history. **The task
    file is what `prepare` printed, whole**: `finalize` reads a
    `PrepareLessonResult`, so `prepare > "$F"; finalize "$F"` needs no extraction
    step and no `jq`, and a file recording a `replay` or `exhausted` day is
    refused with a message that says so. Every envelope shape is strict, and its
    shape is checked before its outcome is reported. **The task file must live
    outside the working tree** — a shell creates a redirection target before the
    command runs, so `prepare > task.json` inside the repository dirties the tree
    before `prepare` can inspect it, and written later it is a change generation
    was not authorized to make. Neither command deletes it. A task read back is
    validated in full, including that its `targetPath` is what its own metadata
    derives. Both commands print JSON on stdout and nothing else; `generate`,
    `replay`, and `exhausted` all exit 0, and `finalize` prints no partial
    success. **Recovery is not automatic and is not claimed to be**: nothing
    resets, reverts, checks out, or force-pushes, and a failure after the commit
    leaves a local commit that a re-run will refuse to work around.

- [x] **GitHub Actions generation workflow** — `bbaeed6`
  - `.github/workflows/daily-lesson.yml`. The workflow is a shell: it wires up an
    environment and calls prepare, the generation action, and finalize in order,
    while every business rule stays in Node. Verified against official
    documentation rather than guessed: the action is
    `anthropics/claude-code-action@v1`; the OAuth input is
    `claude_code_oauth_token`; CLI options go through `claude_args` one per line,
    the beta's separate `model` / `allowed_tools` / `disallowed_tools` inputs
    having been removed; the model is the pinned full name `claude-sonnet-5`
    rather than the `sonnet` alias; and the tool strings are the exact names from
    the tools reference. Settled: **the task file is written to
    `${{ runner.temp }}`**, never into the checkout; **the task is carried into
    the prompt as a value** re-serialized by Node, so the agent never opens a file
    outside the working directory and the shell never parses JSON; the envelope is
    read with Node rather than `jq`; **`replay` and `exhausted` skip both the
    generation and finalization steps** and the job still succeeds; permissions are
    `contents: write` and nothing else; the committing identity is
    `github-actions[bot]`, set repository-locally, which settles the Git identity
    question; concurrency is a fixed group with `cancel-in-progress: false`,
    because a cancelled run may already have committed and be partway through
    pushing; the schedule was `0 0 * * *` UTC, since corrected — see the hosted
    validation entry below. **Tool restrictions are one layer, not a sandbox** — the prompt and
    the Node acceptance gate are the others, and only the gate decides what is
    committed. `show_full_output` is left off so tool output and file contents stay
    out of the Actions log.

- [x] **First hosted workflow validation** — run
  [29690769583](https://github.com/wannnn/spanish-daily/actions/runs/29690769583),
  which produced lesson commit `297722f`
  - The first end-to-end run on a real runner, triggered by `workflow_dispatch`.
    It succeeded in 1m24s and the whole chain is now verified in the only place
    it could be: prepare → Claude Code Action → finalize → push.

    Confirmed by the run's own log rather than by inference:

    - The `CLAUDE_CODE_OAUTH_TOKEN` secret authenticates.
    - The supplied-token path is taken —
      `Using provided GITHUB_TOKEN for authentication`, with no
      `Requesting OIDC token...` anywhere. `id-token: write` is genuinely not
      needed, and no GitHub App is installed.
    - **`contents: write` alone is enough**, which settles the question that
      could not be answered off a hosted runner.
    - The model argument is accepted: `"model": "claude-sonnet-5"`.
    - The tool restrictions are not too tight —
      `permission_denials_count: 0` across 5 turns. `Read,Write,Edit,Glob,Grep`
      was sufficient to write a lesson.
    - The lesson and the history record landed in **one commit of exactly two
      files**, and the push reached the remote.
    - The generated document passed the acceptance gate unchanged: it parses,
      its metadata equals the task, and it is byte-identical to canonical form
      (`renderLesson(parseLesson(document)) === document`) on the first attempt.

    Fixed by the same milestone: the **committing identity was being overwritten
    by the generation action**, whose `bot_name` / `bot_id` defaults set the
    repository-local git identity for the git work it does in issue and
    pull-request workflows. The first lesson commit is therefore authored by
    `claude[bot]`. The identity step now runs after generation and immediately
    before finalize, so the commit belongs to the CLI that makes it. Also
    upgraded `actions/setup-node` from v4 to v6, which moves the action off the
    deprecated Node 20 runtime the run warned about.

    The **first scheduled run** —
    [29712720252](https://github.com/wannnn/spanish-daily/actions/runs/29712720252),
    lesson commit `e41b139` — then succeeded unattended and confirmed the identity
    fix: it is authored by `github-actions[bot]`, not `claude[bot]`.

    It also exposed the schedule itself. Asked for 00:00 UTC, it started at
    02:30 UTC — **about two and a half hours late**. `0 0 * * *` is both the top
    of an hour and UTC midnight, which GitHub names as a high-load time where
    runs are delayed and may be dropped. The schedule is now
    `30 8 * * *` with `timezone: "Asia/Taipei"`, which states the product's
    timezone directly and stays off the hour. This also corrected
    `docs/architecture.md` §11, which claimed GitHub cron is UTC-only and cannot
    understand `Asia/Taipei`; the `timezone` key exists, so that was simply out
    of date. The section now separates the two concerns it had conflated: the
    schedule decides when a run is asked to start, while `domain/date.ts` still
    computes the date from the instant it actually begins — which is why a
    delayed run stays correct, and a dropped one costs only that day, since
    selection just carries the word to the next.

## Current milestone

**Static lesson web application** — not started; architecture settled, first slice
defined below.

Stage 1 is complete and running. The website is the first projection of the
canonical data already in Git, and it may not gate whether a day counts as learned
(`docs/architecture.md` §1, §5, §6). Its shape and boundaries are fixed in
`docs/architecture.md` §10; this entry records the milestone scope, the settled
build decisions, and the first slice.

**In scope for version 1:**

- A read-only static site that reads `lessons/**/*.md` (via `parseLesson`) at build
  time and emits static HTML. Git stays the single source of truth —
  `vocabulary.json`, `history.jsonl`, and `lessons/**/*.md`.
- Hosted on GitHub Pages, built and deployed by a **separate** workflow triggered by
  commits — never inside the daily lesson workflow. A failed site build must not
  affect lesson durable completion.
- Mobile-first; installable to the iPhone home screen (manifest, icons,
  `display: standalone`).
- Exactly three things to read: a lesson archive, a single-lesson page, and a
  homepage entry point.

**Out of scope for version 1:** a Service Worker, search, and notification.

**Only sanctioned future candidates** (none scheduled, none built ahead):
client-side search, Firebase Cloud Messaging notification, and the minimal Service
Worker notification requires. No login, user account, progress sync, or application
backend is planned.

### Settled build decisions

- **Framework: Astro, static output** (`output: 'static'`). Chosen over Vite +
  React: SSG with zero client JS by default is the native model for a read-only
  content projection, while React would need a bolted-on SSG layer and ships a
  client runtime the v1 has no interactivity to justify. Islands keep the future
  search and notification additions local, and a React island stays available later
  if a widget wants one.
- **Location:** the site lives in `web/` with its **own `package.json`**. No npm
  workspace, no shared package, and no dependency added to the root.
- **Canonical reuse — no second parser.** The site reads lessons through the
  existing `parseLesson` (`src/domain/lesson.ts`). It does **not** copy the parser,
  reimplement the frontmatter, use Astro Content Collections to parse canonical
  lessons, add a resolver alias, or introduce a shared package. `src/content/` is
  deliberately not used for the lessons.
- **How `parseLesson` is consumed:** the Pages workflow runs the **root `tsc` build
  first**, then the site imports the **compiled** `dist/src/domain/lesson.js`.
  Importing the `.ts` source is avoided because a Vite-based resolver does not
  rewrite the NodeNext `.js` import specifiers `parseLesson` uses.
- **Loader:** `web/src/lib/lessons.ts` reads `lessons/**/*.md` from the repository
  root at build time via the **filesystem** — not an Astro glob of `src/content/` —
  and passes each document through the compiled `parseLesson`.
- **Body rendering:** the Markdown body is rendered to HTML by a small,
  **GFM-table-capable** renderer; **`marked`** is the current choice. It is a
  `web/`-local dependency only. (The conjugation tables are the test of correctness.)
- **URL scheme:** `/lessons/YYYY-MM-DD-id/`, matching the canonical filename
  `lessons/YYYY/YYYY-MM-DD-{id}.md`.
- **GitHub Pages target:** the project page `wannnn.github.io/spanish-daily` first.
  Astro `site` and `base` hold the Pages path centrally (`base: '/spanish-daily/'`);
  no page hardcodes the repo base.
- A **provisional icon** is acceptable and does not block the first slice; the final
  visual design and icons stay deferred.
- No generic projection framework, repository abstraction, plugin system, or
  scaffolding for the deferred candidates (`docs/architecture.md` §1).

### First slice

The smallest vertical that de-risks the two hardest integration points —
`parseLesson` reuse and base-path / workflow separation — before any archive or
homepage work:

1. Scaffold Astro in `web/` (`output: 'static'`, with `site` + `base` set for the
   project page).
2. `web/src/lib/lessons.ts`: filesystem-read `lessons/**/*.md` from the repository
   root and run each document through the compiled `dist/src/domain/lesson.js`
   `parseLesson`.
3. Render the Markdown body to HTML with `marked` — GFM tables must render, the
   conjugation tables being the test.
4. **One** static route, `/lessons/YYYY-MM-DD-id/`, rendering one real committed
   lesson (its frontmatter fields plus the full body) under a mobile-first base
   layout that links a minimal manifest with a provisional icon and
   `display: standalone`.
5. A **separate** GitHub Pages workflow (`.github/workflows/pages.yml`) that runs
   the root build, then the Astro build, and deploys — distinct from, and never
   entangled with, `daily-lesson.yml`.
6. Verify on the live project-page URL that the base path resolves — assets and the
   lesson route load correctly under `/spanish-daily/`.

**Not in this slice:** the lesson archive, the homepage, and search. Archive and
homepage follow only once the single-lesson render and the deploy chain are proven.

## Remaining milestones

- [ ] Static lesson web application — read-only projection on GitHub Pages
- [ ] Notification (Firebase Cloud Messaging) — deferred future candidate, not
  scheduled

## Open questions

Undecided, and each will block the milestone it belongs to.

| Question | Blocks |
|---|---|
| How a partially completed run is *resumed*, if ever — the policy is now "fail loudly and leave it to a person"; an automatic path would need its own design | A future recovery milestone |
| The Pages workflow's exact trigger and path scoping, and how it sequences the root `tsc` build before the Astro build | Static lesson web application (first slice) |
| Component layout, styling, and the final (non-provisional) icons and visual design | Static lesson web application (after the first slice) |
| Firebase Cloud Messaging setup and the minimal Service Worker it needs | Notification (future) |

## Verification baseline

State as of the latest completed milestone. Replace it when a milestone closes;
do not accumulate history here.

- Latest commit: `bbaeed6` on `main`, pushed
- `npm run typecheck` — passes
- `npm run build` — passes
- `npm test` — 532 tests, 532 pass, 0 fail (75 suites)
- `npm ci` succeeds despite the version mismatch below, and does not rewrite the
  lockfile — checked in an isolated copy, because the workflow depends on it
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
