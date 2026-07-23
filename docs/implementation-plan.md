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

## Static lesson web application (v1) — completed

Completed and live at https://wannnn.github.io/spanish-daily/. A read-only static
projection of the canonical data in Git; it gates nothing in Stage 1
(`docs/architecture.md` §1, §5, §6, §10). Its shape and boundaries are fixed in
`docs/architecture.md` §10 and its v1 design in `docs/web-design.md`; this entry
records the delivered scope, the settled build decisions, and the final live state.

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

### Slices delivered (commits)

- **Static site + single-lesson route + deploy chain** — `d3221d4`. Astro in `web/`,
  a filesystem loader over `lessons/**/*.md` through the compiled `parseLesson`,
  `marked` GFM rendering, one `/lessons/YYYY-MM-DD-id/` route per lesson, and a
  separate `pages.yml` Pages workflow. Also scoped root `tsconfig.json` to
  `include: ["src"]` so the root build never compiles the site. Verified end to end
  on the live URL.
- **Paginated lesson-archive homepage** — `afef484`. Real homepage replacing the
  stub; `Lesson N` from `history.jsonl` completion order; strict lesson↔history 1:1
  join (build aborts on any mismatch); newest-first; static pagination.
- **Card refinement** — `56eaa16`. Lessons presented as lightweight cards.
- **Final app icons** — `95c99ea`. PNG manifest icons (192, 512) + apple-touch-icon
  (180, opaque white); the provisional SVG removed; the design source moved to
  `web/assets/`, out of the deployed `public/`.
- **Layout refinement** — `3959001`. 10 lessons per page, date right-aligned on one
  line, warm-ivory cards (`#fbf6ec`) with a subtle shadow.

### Final live state (verified on the project page)

- The homepage **is** the paginated lesson archive — **10 per page** (`PAGE_SIZE`),
  newest-first (metadata `date` desc, `id` tie-break); no `/page/*` until there are
  more than 10 lessons.
- Each lesson is a lightweight **warm-ivory card** (`#fbf6ec`) with a light border
  and a **subtle** shadow; `Lesson N` + word on the left, the **date on the right,
  one line**; the homepage shows no `pos` (the lesson page keeps it).
- The pagination footer is separated by spacing, with no divider line above it.
- Lesson page: single-page read; a back-to-home link; previous/next by completion
  order; GFM conjugation tables render full-width with small-screen horizontal
  scroll.
- Final **PNG** manifest icons + **apple-touch-icon**; iPhone add-to-home-screen and
  `standalone` launch verified by hand.
- `Lesson N` derives from `history.jsonl` completion order; the v1 design is owned by
  `docs/web-design.md`.

## Current milestone

**Vocabulary curriculum expansion** — in progress. `vocabulary.json` currently holds
**750 entries** (`w0001`–`w0750`, orders 1–750).

Progress:

- [x] **Pilot (`w0011`–`w0050`)** — complete. 40 human-approved items appended to the
  original 10; audit trail in `docs/vocabulary-pilot-candidates.md`.
- [x] **Batch 51–250 (`w0051`–`w0250`)** — complete. 200 human-approved items
  (199 candidates unchanged + `vale`→`que` replacement and five metadata corrections)
  appended; `id N` ↔ `order N`; `w0001`–`w0050` unchanged. Audit trail in
  `docs/vocabulary-expansion-0051-0250.md`.
- [x] **Batch 251–500 (`w0251`–`w0500`)** — complete. 250 human-approved items
  (249 candidates unchanged + `marido`→`profesor` replacement and the `azúcar`
  metadata correction) appended; `id N` ↔ `order N`; `w0001`–`w0250` unchanged. Audit
  trail in `docs/vocabulary-expansion-0251-0500.md`.
- [x] **Batch 501–750 (`w0501`–`w0750`)** — complete. 250 human-approved items
  (all candidates approved + two metadata corrections: `medio` stored as `adjective`,
  and a stale `bajo` id reference fixed to the real `w0224`); `id N` ↔ `order N`;
  `w0001`–`w0500` unchanged. Audit trail in
  `docs/vocabulary-expansion-0501-0750.md`.
- [ ] **Batch 751–1000** — the final batch, same method.

The per-batch review worktables (`docs/vocabulary-pilot-candidates.md`,
`docs/vocabulary-expansion-0051-0250.md`, `docs/vocabulary-expansion-0251-0500.md`,
`docs/vocabulary-expansion-0501-0750.md`, and the final batch) are kept as-is during
the build; they are consolidated/cleaned up once the full ~1000-word curriculum is
complete, not before.

Contract and canonical-form rules are owned by `docs/vocabulary-spec.md`; this entry
records only the milestone's scope and working method.

Settled principles (not to be re-litigated):

- `vocabulary.json` is always a **human-maintained source of truth**.
- AI does **not** decide, on its own, what is included, what is removed, or the
  final ordering.
- AI only assists mechanically: format conversion, POS mapping, canonical-form
  (lemma) checks, de-duplication, `id`/`order` assignment, and validation.
- `pos` continues to use the closed enum already in `docs/vocabulary-spec.md`.
- Frequency is used only to build the **candidate pool**; it is **not** the
  curriculum `order`.
- Curriculum ordering is decided by the human, on teaching value.
- Store **lemmas** only; no conjugated / inflected word forms are imported.
- **DRAE** adjudicates the canonical **headword** only — it is not a frequency
  source.
- **Staged batches:** expand toward 1000 in human-reviewed batches (pilot →
  51–250 → 251–500 → 501–750 → 751–1000); each batch is proposed, reviewed, and
  only then written.
- Preserve every already-assigned `id`, `word`, and `pos` unchanged; `id` is never
  reused.
- Do not modify `history.jsonl` or any existing lesson.

Source strategy (recorded for the build):

- **Instituto Cervantes A1–A2 inventories** — reference for teaching scope and
  ordering.
- **Davies, *A Frequency Dictionary of Spanish*** — reference for manual frequency
  review; its full ranking is not redistributed.
- **hermitdave/FrequencyWords** — open frequency cross-check; requires attribution
  and must not be imported as raw, uncleaned word forms.
- **DRAE** — canonical lemma adjudication.

**Next step:** propose the final **751–1000** batch for human review, then do the
mechanical conversion once approved. AI does not generate or write words without human
approval.

**Explicitly out of scope for the expansion:** changing the vocabulary schema, the
POS enum, or any validation rule; importing frequency ranks as `order`; adding
metadata fields; touching any already-assigned entry, `history.jsonl`, or existing
lessons.

## Remaining milestones

- [ ] Vocabulary curriculum — continue the staged expansion toward ~1000 lexical
  items (final batch: **751–1000**), in human-decided order
- [ ] Notification (Firebase Cloud Messaging) — deferred future candidate, not
  scheduled

## Open questions

Undecided, and each will block the milestone it belongs to.

| Question | Blocks |
|---|---|
| How a partially completed run is *resumed*, if ever — the policy is now "fail loudly and leave it to a person"; an automatic path would need its own design | A future recovery milestone |
| Each vocabulary batch's candidate list must be human-reviewed and approved before AI writes it to `vocabulary.json` | Vocabulary curriculum expansion (final: 751–1000) |
| Firebase Cloud Messaging setup and the minimal Service Worker it needs | Notification (future) |

## Verification baseline

State as of the latest completed milestone. Replace it when a milestone closes;
do not accumulate history here.

- Latest commit: `3959001` on `main`, pushed
- `npm run typecheck` — passes
- `npm run build` — passes (root)
- `npm test` — 532 tests, 532 pass, 0 fail (75 suites); unchanged since the web
  work touched only `web/` and docs, not `src/`
- `npm --prefix web ci` — passes; `npm --prefix web run build` — passes (6 pages;
  build-time artifact assertions pass)
- GitHub Pages deploy verified live at https://wannnn.github.io/spanish-daily/
- `npm ci` succeeds despite the version mismatch below, and does not rewrite the
  lockfile — checked in an isolated copy, because the workflow depends on it
- Working tree expected clean
- Dependencies: root has `typescript` and `@types/node` only (no runtime
  dependency); `web/` has `astro` and `marked` as web-local dependencies, none added
  to the root

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
