# Vocabulary Curation

- **Status:** authoritative document for **how the vocabulary word list is built and
  extended over time** — the selection method, the sources, and the human-review
  workflow. It is the permanent successor to the per-batch review worktables used to
  reach the first 1000 words, which have been removed now that the milestone is
  complete.

This document owns the **process**. It does **not** own the data contract: the entry
schema, `id`/`order`/`pos` rules, the POS enum, canonical-form rules, validation
rules, and loader behaviour all live in `docs/vocabulary-spec.md` and are not
restated here. Read that first when touching the schema; read this when adding words.

## 1. First principles

- **`vocabulary.json` is a human-maintained source of truth.** The system reads it
  and never writes it. Every word added or removed, and the final ordering, is a
  human decision.
- **What AI may do:** propose candidate words, propose a draft teaching order, map
  part of speech, check canonical (lemma) form, cross-check frequency, de-duplicate,
  assign `id`/`order`, and validate.
- **What AI may not do on its own:** decide which words are included or removed, or
  decide the final curriculum order. Those stay with the human maintainer, who
  approves each batch before anything is written to canonical data.
- **Frequency ≠ curriculum order.** Frequency data only builds the *candidate pool*
  and confirms a word occurs in real usage. The teaching `order` is a human
  pedagogical decision, never a frequency rank copied in.
- **Word form ≠ lemma.** Corpus frequency lists count *word forms*; a lemma's use is
  spread across all its inflected forms, so an infinitive, a singular noun, or a
  masculine-singular adjective always *understates* the lemma. Only canonical lemmas
  are stored (`docs/vocabulary-spec.md` §3); raw rank is a sanity check, not a score.
- **1000 is the first milestone, not a cap.** The dataset is designed to grow for
  years. `id` is immutable and never reused; `order` may be adjusted with gaps, so
  new words insert without renumbering (`docs/vocabulary-spec.md` §2).

## 2. Sources — use and limits

| Source | Used for | Limits |
|---|---|---|
| **PCIC** — Instituto Cervantes *Plan curricular*, A1–A2 inventories | Beginner suitability, theme, and level | A1–A2 only; some items are category-level, not word-level. Early-B1 items have no PCIC A1–A2 evidence and are marked as such. |
| **hermitdave/FrequencyWords** — `content/2018/es/es_50k.txt` (OpenSubtitles) | Raw **word-form** frequency cross-check (occurrence evidence) | Word-form list, not lemmas (see §1). Subtitle register: favours spoken/plural forms, contains noise. **CC BY-SA 4.0** content — attribute, do not redistribute the full list, and do not commit the downloaded file. |
| **RAE / DRAE** (DLE, *Nueva gramática*) | Canonical **headword** and POS/homograph adjudication | Consult **only** for words whose canonical form, POS, or homograph status is genuinely in doubt — not every word. Where RAE and the project POS enum diverge, the enum (`docs/vocabulary-spec.md` §4) governs storage and the divergence is flagged. |
| **Davies**, *A Frequency Dictionary of Spanish* | — | **Not used.** No data supplied; no rank is cited or implied. |

**Regional variety.** The curriculum's chosen primary variety is **Peninsular
(European) Spanish** — e.g. `vosotros`, `coche`, `móvil`, `ordenador`, `patata`,
`zumo`, `bocadillo`, `billete` (banknote). Keep new choices consistent with it.
Latin American variants (`celular`, `computadora`, `papa`, `jugo`, …) are a possible
future second-variety expansion, not mixed in ad hoc.

## 3. Staged human-review workflow

Vocabulary grows in **batches**, each proposed, reviewed, and only then written:

1. **Audit** the existing entries for theme and POS gaps.
2. **Fetch** the frequency list once to a scratch path **outside the repository**
   (never added to Git); look up ranks in bulk with a script — do not web-search word
   by word.
3. **Build** a candidate list by PCIC theme and teaching value, avoiding proper
   nouns, subtitle noise, rare/technical terms, unnecessary loanwords, and any
   `(word, pos)` already present. Do not pad low-value words to hit a POS quota.
4. **Adjudicate** only the doubtful canonical forms / homographs against RAE.
5. **Record** the candidates in a temporary worktable (see §4) for human review.
6. **Approve** — the human confirms inclusion, order, and any corrections.
7. **Write** the approved batch to `vocabulary.json`: assign immutable `id`s in
   `id N` ↔ `order N` correspondence, preserving all existing entries exactly.
8. **Validate** (see §5), commit, push.

A temporary per-batch plan/worktable may be created for the batch in progress and is
**removed once the batch is written and the work has converged** — the permanent
method lives here, not in a running log.

## 4. Candidate worktable

While a batch is under review, its worktable is a one-time human-review artifact
(not a contract). One compact row per candidate, with:

- proposed `order`
- `word`
- proposed `pos`
- PCIC level / theme
- hermitdave raw rank
- canonical status — one of `confirmed`, `ambiguous`, `needs review`
- caveat (short)
- decision — `pending` until reviewed, then `approved`

Keep source notes and methodology at the head or foot of the table, not per row.
Do **not** paste large amounts of source text or long per-word essays.

**Canonical status:**

- **confirmed** — clean lemma, single dominant sense, storage unambiguous.
- **ambiguous** — a homograph or multi-POS form where the stored sense is a
  deliberate choice (e.g. noun `cuenta` vs `contar`; adjective `mojado` vs the
  participle; `bajo` preposition vs the existing adjective), a gendered-irregular or
  inherently-plural noun, or an accent-distinct minimal pair. The caveat records what
  was chosen and why. These are legitimate — a duplicate `word` string with a
  *different* `pos` is allowed (`docs/vocabulary-spec.md` §4–§5); a duplicate
  `(word, pos)` is not.
- **needs review** — canonical form or POS genuinely uncertain; the human should
  verify against RAE before it is written.

Every `ambiguous` / `needs-review` row is a point the human confirms at approval.

## 5. Validation checklist (before writing canonical data)

Run these on any proposed batch; the loader (`docs/vocabulary-spec.md` §5) enforces
the schema-level rules, and a batch must additionally satisfy:

- exactly the intended number of candidates;
- proposed `order`s form the intended contiguous range and are unique;
- every `pos` is in the enum;
- every `word` is lowercase, NFC-normalized, no surrounding whitespace;
- every verb is stored as an infinitive (accent-aware, e.g. `reír`);
- no duplicate `(word, pos)` within the batch;
- no duplicate `(word, pos)` against existing entries;
- existing entries are unchanged (`id`, `word`, `order`, `pos`);
- assigned `id`s continue the sequence with no reuse;
- any existing-`id` reference written into a worktable caveat is **looked up against
  `vocabulary.json`**, never hardcoded from memory;
- the downloaded frequency file is not tracked by Git;
- `git diff --check` is clean.

Then confirm the human-approved corrections were applied, and only then commit.

## 6. First 1000-word milestone — summary

The first milestone is **complete**: `vocabulary.json` holds **1000 entries**
(`w0001`–`w1000`, orders 1–1000), built from the original 10 words through a pilot
and four human-reviewed batches (11–50, 51–250, 251–500, 501–750, 751–1000).

Final POS distribution (approximate share): noun ~45%, verb ~22%, adjective ~15%,
adverb ~6%, numeral ~4%, pronoun ~3%, determiner ~2%, preposition ~2%, conjunction
~1%, interjection ~1%. This is a healthy beginner-content shape — content words carry
the teaching load and the function-word core is essentially closed. All ten POS
categories are represented; no major everyday theme is absent.

## 7. Deferred vocabulary (not scheduled)

High-value items deliberately left out of the first 1000, in rough priority order
for any future expansion:

- **Weekday names** (`lunes`–`domingo`) and **month names** (`enero`–`diciembre`) —
  classic A1 closed sets, best added as whole sets (24 items).
- **`oreja`** (ear) and **`uña`** (nail) — remaining common outer-body parts.
- **`octavo` / `noveno`** — the ordinals between the included `séptimo` and `décimo`.
- **Nationality and country adjectives.**
- **`cuyo`** — the formal relative determiner (written register), dropped from the
  1000 to make room for higher-frequency everyday verbs.
- **Regional Latin American variants** of the Peninsular choices (see §2), if a
  second variety is ever wanted.

Growing the curriculum beyond 1000 — and with which of these first — is a possible
**future milestone**, not a scheduled one.
