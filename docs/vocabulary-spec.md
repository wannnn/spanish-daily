# Vocabulary Specification

- **Schema Version:** 1
- **Status:** authoritative data contract for `vocabulary.json`.

`vocabulary.json` is the single source of truth for *which* words this system
teaches and *in what sequence*. This document defines the data contract for a
vocabulary entry so the file can stay stable and machine-verifiable for years.
It governs structure only; it does not decide the word list itself.

Related context (project background, product goal, development principles) lives
in `CLAUDE.md`. This document is the data contract and is maintained separately.

## 1. Design principles

These principles are the reason the schema is shaped the way it is. They take
precedence over convenience when the two conflict.

### A vocabulary entry represents a lexical item

An entry is a **learning unit**, not merely a string. It represents one lexical
item — the thing a learner studies — stored in its canonical (dictionary) form.

- Verbs are always stored as the infinitive.
- The lesson generator is responsible for producing every conjugated form.
- A conjugated verb form is **never** a separate vocabulary entry.
- The same principle applies to every part of speech: vocabulary stores the
  **canonical form**, never an inflected form. Inflected forms are derived
  downstream, not persisted here.

### The vocabulary dataset is long-lived

1000 words is the **first curriculum milestone, not a system limit.** After the
first round completes, more words are added and the curriculum continues.

- `id` is never reused.
- `order` can be adjusted.
- The dataset can keep growing indefinitely.
- No part of the design may assume the dataset is ever "finished" or capped at
  1000 rows.

### The human is the final authority

The vocabulary dataset is always a **hand-maintained source of truth.** AI may
assist with mechanical work:

- converting formats,
- filling in `pos`,
- assigning `id`,
- validating data,
- helping organize metadata.

AI does **not** decide, on its own:

- which words are added,
- which words are removed,
- the final curriculum ordering.

Those decisions remain with the human maintainer.

## 2. Entry schema

An entry is a JSON object with **exactly** four fields — no more, no fewer.

### `id` — identity

- **Purpose:** the permanent, immutable identity of a lexical item. Everything
  else about an entry may change; `id` may not.
- **Type:** string.
- **Format:** `w` followed by a zero-padded serial number, minimum 4 digits:
  `w0001`, `w0002`, … Pattern: `^w[0-9]{4,}$`. The `{4,}` (four or more digits)
  lets the list grow past `w9999` without changing the format; there is no upper
  limit.
- **Constraints:** unique across the file; assigned once at creation; never
  modified; never reused after deletion. It does **not** encode learning
  sequence, alphabetical order, or frequency. It is an opaque key that happens to
  be issued in creation order.

### `word` — the canonical surface form

- **Purpose:** the Spanish word stored in canonical (dictionary) form. See §3.
- **Type:** string.
- **Constraints:** non-empty; Unicode NFC-normalized; no leading or trailing
  whitespace; accents and `ñ` preserved; lowercase (the first-1000 scope contains
  no proper nouns — revisit if that changes). Stores the bare word only: no
  article, no gender marker, no annotation (`mesa`, never `la mesa`).

### `order` — learning sequence

- **Purpose:** the word's position in the curriculum. Selection picks the
  unlearned word with the lowest `order`.
- **Type:** integer.
- **Constraints:** positive (`>= 1`); unique across the file; **not required to
  be contiguous** — gaps are intentional and legal, so a word can be inserted
  between two others without renumbering the whole file. Mutable: reordering the
  curriculum edits `order` and never touches `id`.

### `pos` — part of speech

- **Purpose:** the grammatical category, which tells lesson generation what kind
  of inflection content to produce (a conjugation table for a verb, agreement
  content for an adjective, nothing for a preposition).
- **Type:** string.
- **Constraints:** required; must be one of the POS enum values in §4. No free
  text.

## 3. Canonical form

**Governing rule:** store the **citation form (lemma)** — the headword under
which the word appears in a standard monolingual dictionary (DRAE). All inflected
forms are *derived by lesson generation* from this lemma; storing an inflected
form would be redundant and a source of drift. This is what keeps one lexical
item equal to one entry (it prevents `ser`/`es`/`son`/`era` from becoming four
rows).

| POS | Canonical form | Reason |
|---|---|---|
| verb | infinitive (`hablar`, `comer`, `vivir`, `ser`) | Universal citation form; the whole conjugation table is generated from it. |
| noun | singular (`casa`, `tiempo`) | Citation form; the plural is regularly derivable. **Exception:** nouns that are inherently plural (`gafas`, `vacaciones`) are stored plural — that *is* their citation form. |
| adjective | masculine singular (`alto`, `bueno`) | Citation form; feminine and plural agreement are derived. Invariable adjectives (`azul`, `feliz`) have only one form. |
| adverb | the adverb as-is (`bien`, `muy`, `siempre`, `rápidamente`) | Uninflected. |
| pronoun | base/subject citation form (`yo`, `esto`, `alguien`) | Stored as listed in the dictionary. |
| determiner | masculine singular where it inflects (`el`, `un`, `este`, `mucho`, `todo`) | Citation form; agreement is derived. |
| numeral | cardinal in base form (`uno`, `dos`, `cien`); ordinal in masculine singular (`primero`, `segundo`) | Citation form; agreement forms (`una`, `doscientas`, `primera`) are derived. |
| preposition / conjunction / interjection | as-is (`de`, `pero`, `hola`) | Invariable. |

**Tie-breaker for any edge case:** the canonical form is *the DRAE headword*.
Deferring to an external authority keeps this deterministic instead of relying on
a judgment call.

**Deliberately not stored yet:** the grammatical gender of nouns. It is not
derivable from the lemma (`el problema`, `la mano` are irregular) and lesson
generation will eventually need it — but lesson generation does not exist, so per
the project principles it is deferred. See §6; it is the most likely *first*
future field.

## 4. POS enumeration (v1)

A closed set. Deliberately small — sized to cover roughly 1000 high-frequency
words, not to model Spanish grammar exhaustively.

| Value | Covers | Why it earns a slot |
|---|---|---|
| `verb` | all verbs | Needs a full conjugation table — the most content-heavy lesson type. |
| `noun` | common nouns | Core vocabulary; needs gender/number handling. |
| `adjective` | qualifying adjectives | Needs agreement content. |
| `adverb` | adverbs of manner, time, place, degree | Distinct lesson shape; no inflection. |
| `pronoun` | personal, demonstrative, indefinite, relative pronouns | High-frequency function words with their own usage notes. |
| `determiner` | articles, demonstratives, possessives, quantifiers (`el`, `un`, `este`, `mi`, `mucho`) | Folded into one category to avoid a proliferation of tiny classes; matches modern RAE treatment. Not split into finer classes until a lesson template actually requires it. |
| `numeral` | cardinals and ordinals (`uno`, `dos`, `primero`) | A natural, self-contained learning unit; its teaching content differs from adjectives and determiners. |
| `preposition` | `de`, `en`, `para`, … | Very high frequency; usage-note heavy (`por`/`para`). |
| `conjunction` | `y`, `pero`, `porque`, `que` (conj.) | Function words. |
| `interjection` | `hola`, `gracias`, `sí` (as a response), `ay` | Common, and none of the above fit. |

**Homographs (`que`, `bajo`, `nada`):** one entry carries exactly one `pos` — the
sense being taught. If two senses deserve separate lessons, they are two entries
with two `id`s and the same `word` string. This is why a duplicate `word` is
permitted (see §5).

## 5. Validation rules

| Rule | Verdict | Rationale |
|---|---|---|
| Duplicate `id` | **ERROR** | `id` is identity; a collision is corruption. |
| Duplicate `order` | **ERROR** | `order` must be a total ordering; a tie makes "next word" nondeterministic. |
| Duplicate `word` | **ALLOWED** | Homographs are legitimate (see §4). |
| Duplicate `(word, pos)` pair | **ERROR** | Same word plus same category is an accidental duplicate. |
| Non-contiguous `order` (gaps) | **ALLOWED** | Gaps enable insertion without mass renumbering. |
| `id` modification | **FORBIDDEN (process rule)** | Immutable forever. A stateless loader cannot detect a rename on its own — enforced by review and git history, not by the loader. |
| `word` modification | **CONDITIONAL** | Editing to fix a typo or to normalize the *same* lexical item is fine. Changing it to a *different* lexical item is a delete-plus-add: retire the old `id`, issue a new one. |
| `pos` outside the enum | **ERROR** | Closed set; §4 only. |
| Unknown field present | **ERROR** | Strict schema. See below. |

### Loader behavior

Validation runs at load time, before any selection. There is no partial-accept
mode: a file that violates any ERROR rule is rejected whole, and the loader halts
immediately rather than continuing to run.

The loader must fail loudly on:

1. The file does not parse as a JSON array.
2. An entry is missing a required field, or carries an **unknown field**
   (strict — see the unknown-field contract below).
3. `id` fails the pattern `^w[0-9]{4,}$`, or is duplicated.
4. `word` is empty, not NFC-normalized, has surrounding whitespace, or is not
   lowercase.
5. `order` is not a positive integer, or is duplicated.
6. `pos` is not in the enum.
7. The `(word, pos)` pair is duplicated.

The loader may emit an informational, non-fatal note when a `word` is duplicated
across differing `pos` values — this confirms an intentional homograph rather
than masking an error.

### Why JSON, not CSV

Spanish vocabulary data contains commas, accents, and `ñ`. CSV escaping introduces
parsing ambiguity around exactly that content, and its characteristic failure is
silent: a mis-escaped field shifts the remaining columns instead of raising an
error, so `pos` can quietly become a `word`. A JSON array makes the structure
explicit, so every violation above is detectable and the loader can fail loudly
rather than accept corrupted data.

### Unknown-field contract

Unknown fields are a validation error and stop the load immediately. Because this
file is hand-maintained for years and runs in an unattended pipeline, the error
message must make the mistake obvious. It must state:

- the `id` of the offending entry (or, if `id` itself is missing or malformed,
  the entry's position in the array),
- the unknown field name that was found,
- the list of allowed fields (`id`, `word`, `order`, `pos`),
- when the unknown field name is within a small edit distance of an allowed field,
  a spelling suggestion (for example, `oder` -> did you mean `order`?).

## 6. Future evolution

**Permanently fixed — never revisit:**

- `id` is immutable identity, never reused.
- The separation of `id` (identity) from `order` (sequence).
- `pos` is required and drawn from a closed enum. (The *set of values* may grow;
  the field never becomes free text or optional.)
- The canonical/lemma storage rule (§3).
- JSON array, whole-file, fail-loud loading.

**Safely extensible later — additive optional fields, added only when a consumer
exists:**

| Candidate field | Recommendation | Reason |
|---|---|---|
| `gender` (nouns) | Defer, but earmark as the first likely addition. | Not lemma-derivable; lesson generation *will* need it. Add the day lesson generation is built — not before. |
| `cefr` | Defer. | `order` already encodes sequence, so CEFR would be descriptive metadata with no consumer. Add only to display level in lessons or to re-derive `order` from level. |
| `frequency` | Defer. | Meaningless without provenance (which corpus? rank or per-million?). Nothing consumes it. If ever added, store as `{source, rank}`, not a bare number. |
| `source` | Defer; may earn its place during the dataset build. | Provenance for a multi-source merge; useful only while auditing the merge. |
| `tags` (themes) | Strongly defer. | Open-ended, no consumer, and freeform tags rot into inconsistency. Add only with a concrete feature such as thematic review. |

**Why nothing is added now:** every field above currently has no reader. A field
with no consumer must still be filled for 1000+ rows, can silently rot, and
implies a precision that cannot be guaranteed. The strict "unknown fields are an
error" rule (§5) makes each future field a deliberate, reviewed change to this
contract — which is exactly the "defer decisions until the code forces them"
principle. Adding a field later is cheap and additive; carrying a wrong or empty
field for years is not.

## 7. Schema versioning

This document carries a **Schema Version** (see the header). The version tracks
the data contract, not the word list: adding a field, changing a validation rule,
or extending the POS enum bumps the version and is recorded in the changelog
below. Editing the word list does not.

The version lives in **this document only.** `vocabulary.json` deliberately does
**not** carry a version field. The file, the loader, and this specification live
in one repository and are committed together, so the loader always matches the
file — there is no scenario where a reader encounters a `vocabulary.json` of
unknown vintage. Under the strict schema (§5), an in-file version field would also
be a required field with no consumer, which contradicts the §6 principle of not
adding unconsumed fields. If the file ever undergoes a breaking structural
migration that a migration script must detect, an in-file version can be
introduced then, with a concrete reason.

## Changelog

- **v1** — Initial data contract: four-field entry schema (`id`, `word`, `order`,
  `pos`), canonical-form rule, ten-value POS enum, strict validation rules, and
  future-evolution policy.
