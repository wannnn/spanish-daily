# Website Design (v1)

- **Status:** records the **confirmed v1 design** of the static website — its
  homepage, its lesson page, table styling, and the visual direction. It is **not**
  a design system, and it does not try to be complete.

This document owns *what the v1 pages look like and how they read*. It does **not**
own the website's architectural boundaries — those stay in `docs/architecture.md`
§10 (read-only projection, separate Pages workflow, failure never gates
completion). It changes **no** canonical data and **no** lesson contract: the site
only reads `lessons/**/*.md` and `history.jsonl` and renders them.

Anything not written here is undecided and must not be invented. Colours are
recorded as **provisional tokens** and may be nudged during implementation.

## Homepage

- Lives at the GitHub Pages root (`/`).
- Shows the site title and a one-line subtitle:
  - title: `Spanish Daily`
  - subtitle: `每天一個西班牙文單字，慢慢累積。`
- Below that, lists **all** canonical lessons, newest lesson at the top.
- **10 lessons per page**, defined once as an adjustable constant (`PAGE_SIZE`),
  not scattered.
- **Static pagination** — real routes, not client state:
  - `/` is page 1,
  - `/page/2/`,
  - `/page/3/`, …
- The title and subtitle stay identical across pages; only the lesson list changes.
- A footer gives **previous page**, **page information**, and **next page**,
  separated from the list by spacing rather than a divider line.
- No client-side pagination state.

### Each lesson row shows

- Each lesson is a **lightweight card**, and the **whole card is one link** to the
  existing `/lessons/YYYY-MM-DD-id/` page.
- On a single line: `Lesson N` and the word to the left, the **date aligned to the
  right**.
- It does **not** show the part of speech (`pos`), the vocabulary `id`, or the full
  slug. `pos` appears on the lesson page, not on the homepage.

### What `Lesson N` means

- Determined by the **successful-completion order** in `history.jsonl` — the
  1-based position of the record, joined to each lesson file by `id`.
- The first history line is **Lesson 1**.
- It does **not** use the vocabulary `order`.
- When the curriculum order is later adjusted, an already-completed lesson's number
  must **not** change. (History is append-only and independent of the vocabulary
  order, so the number is stable by construction — `docs/architecture.md` §3.)

### Lesson ↔ history integrity

`Lesson N` depends on a strict 1:1 correspondence between the canonical lessons and
`history.jsonl`, so the build enforces it rather than trusting it:

- Every lesson file must correspond to **exactly one** history record.
- Every history record must correspond to **exactly one** lesson file.
- They are matched on `id`, `word`, and `date` — all three must agree.
- If any record is **missing, duplicated, or inconsistent**, the website build
  **aborts**.
- There is no unnumbered lesson and no fallback numbering.

### Sorting

- The homepage is ordered by metadata `date`, **newest first**.
- Ties on the same date are broken by `id`, as a stable tie-breaker.

## Lesson page

- Stays a single-page, top-to-bottom read.
- Keeps the existing canonical Markdown's section and list structure as-is.
- Provides a **back to all lessons** link at the top.
- Provides **previous lesson** and **next lesson** at the bottom.
- Previous / next are decided by **completion order** (the history position), not by
  date sort or vocabulary order; they are omitted at the ends.
- No tabs, no collapse/accordion, and no floating table of contents.

## Tables

- Canonical GFM tables keep rendering to HTML `<table>` elements.
- A table fills the content width.
- The header row uses a **low-chroma background**.
- Conjugation values may be **slightly emphasised** (light bold).
- On small screens, an over-wide table may **scroll horizontally**.
- Tables are **not** split into cards.

## Visual direction

- **Mobile-first.**
- Single-column reading; the desktop keeps a **limited content width**.
- Warm earth tones with a natural feel: off-white background, dark brown-grey body
  text, forest-green as the primary colour, terracotta only as a small accent, a
  light-sand surface / table background.
- Light borders, low decoration.
- Lessons are shown as **lightweight cards**: a warm-ivory card surface, a light
  border, a small radius, and a **subtle** (never heavy) shadow.
- The accent colours appear **only** on section headings, links, and table headers.
- No gradients, no heavy cards, no dashboard look.

### Provisional colour tokens

Recorded now, adjustable at implementation time:

| Token | Value |
|---|---|
| `background` | `#f7f3ea` |
| `surface` | `#fffdf8` |
| `card` | `#fbf6ec` |
| `text` | `#342f29` |
| `muted` | `#756d62` |
| `primary` | `#4f6650` |
| `accent` | `#a66f4f` |
| `border` | `#ded5c7` |
| `table header` | `#e4eadf` |

## Out of scope for v1

Deferred, with no mechanism reserved for them: search, a Service Worker,
notification, login, a backend, completion state, quizzes, favourites, a
client-side router, and a design-system framework.
