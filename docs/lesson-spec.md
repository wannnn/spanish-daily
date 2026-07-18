# Lesson Generation Specification

- **Lesson Schema Version:** 1
- **Status:** authoritative contract for the daily lesson generation layer.

The core product of this system is not vocabulary selection — it is the **daily
lesson**: a complete piece of Spanish teaching material generated for one
vocabulary entry each day. This document defines the contract for that layer: what
the generator receives, what it must produce, and how its prompt is structured.

Pipeline position:

```
vocabulary entry  ->  lesson generation  ->  canonical lesson in Git  ->  projections / notifications
```

The canonical lesson in Git is the destination this document is responsible for.
Projections (such as Notion) and notifications are downstream consumers of that
canonical content and are out of scope here.

Only the generation contract is specified here. No API, Notion, Telegram, or
Actions integration is built by this document. Authoritative sources for adjacent
areas: the vocabulary data contract lives in `docs/vocabulary-spec.md`; the
application architecture, pipeline stages, and boundaries live in
`docs/architecture.md`; `CLAUDE.md` holds high-level project instructions and
navigation. Lesson content requirements are owned by **this** document.

## Design principles

The vocabulary-layer principles (canonical form, long-lived dataset, human as
final authority) carry over. Lesson-specific principles:

- **The input word is a lemma; the generator expands it.** The generator
  receives the canonical form (e.g. the infinitive `hablar`) and is responsible
  for producing every inflected form. It never expects an inflected input.
- **A lesson is teaching material, not a dictionary entry.** It explains usage,
  not just meaning.
- **Representative coverage over exhaustive enumeration.** Complete where
  completeness teaches (conjugation tables); representative where exhaustiveness
  would only pad (example sentences).
- **Honesty over completeness for uncertain facts.** Metadata the generator is
  not confident about (CEFR, frequency) is omitted, never fabricated.
- **Structural consistency.** Every lesson uses the same fixed section order so
  that years of lessons read consistently and can be published deterministically.
- **The generator only transforms; it never curates.** The lesson generator never
  decides vocabulary selection, ordering, or inclusion. It only transforms an
  existing vocabulary entry into teaching material.

## 1. Input contract

Each generation request corresponds to one vocabulary entry. Its fields play
distinct roles, and only two of them affect the generated content:

| Field | Role | Used by generation? |
|---|---|---|
| `word` | The canonical Spanish word to teach. | Yes — drives all content. |
| `pos` | Part of speech (from the vocabulary POS enum). | Yes — selects which "Word forms" template applies. |
| `id` | Correlation key: which entry this lesson belongs to. | No — supplied to the generator, copied verbatim into the frontmatter, and carried into the learning record. |
| `order` | Curriculum position. | No — irrelevant to content; not sent to the generator. |

**No additional input metadata is introduced.** Each candidate was considered and
rejected as an input for the first implementation:

- **`gender` (nouns).** The generator determines gender and must state it
  explicitly in the lesson (see §2, Word forms → Noun). The entire lesson is
  model-generated and human-reviewed; gender is not more special than the
  conjugation tables, so it is generated content verified at review, not a
  human-supplied input. This keeps `vocabulary.json` at Schema Version 1.
  Generated linguistic metadata (gender, CEFR, frequency, and the like) is
  **lesson content, not an authoritative source of truth** — the authoritative
  source of truth remains `vocabulary.json`. Validation or review of this
  generated metadata may be added in the future. If experience shows
  authoritative human-supplied gender is needed, that is a vocabulary-spec change
  (add a field), decided separately.
- **`cefr`, `frequency`.** Produced by the generator only when it is confident,
  and omitted otherwise (§2, Word basics). They are not inputs.

The generator therefore requires exactly `word` and `pos` to produce teaching
content. `id`, `date`, and the lesson schema version are **pipeline metadata**
used for association and traceability: they are supplied so the generator can
write the frontmatter correctly, and they never influence what the lesson says.

## 2. Lesson output structure

The lesson is a single Markdown document with a **fixed section order**. Every
section is always present; when a section does not apply to a part of speech, it
states so briefly rather than being omitted, so the structure is predictable and
machine-checkable.

Explanatory language is **Traditional Chinese**; Spanish content (the word,
conjugations, example sentences) stays in Spanish. Section headings are the fixed
Chinese strings given below.

### Frontmatter

The canonical lesson document carries a minimal YAML frontmatter block for
traceability and idempotent republishing. Its values are supplied by the
pipeline; the generator writes them out exactly as given and never invents them
(see §5, Output constraints):

```
---
id: w0001
word: hablar
pos: verb
date: 2026-07-16
lesson_schema_version: 1
---
```

`date` is the Asia/Taipei date the lesson was generated for (see the timezone rule
in `docs/architecture.md`). The frontmatter carries no teaching content; the lesson body
begins at Word basics.

### Section 1 — Word basics (`## 基本資訊`)

- The Spanish word.
- Chinese meanings, ordered by how commonly each sense is used (most common
  first).
- Part of speech.
- CEFR level — only if the generator is confident; otherwise omitted.
- Frequency information — only if the generator is confident; otherwise omitted.

### Section 2 — Usage (`## 用法`)

- Common meanings in real use.
- Real usage contexts.
- Common collocations.
- Common phrases / fixed expressions.
- Easily confused related words (e.g. `ser` vs `estar`, `por` vs `para`).
- Common mistakes learners make.

### Section 3 — Word forms (`## 詞形變化`)

Content is conditional on `pos`. The section is always present.

**Design principle:** Word forms should prioritize practical, learner-facing
paradigms over theoretical grammatical completeness. The goal is a language
learning tool, not a comprehensive Spanish grammar reference.

**verb** — the vocabulary entry is always the infinitive (e.g. `hablar`, never
`hablo` / `habló`); the generator expands it. Provide a **complete** conjugation
table covering:

- Presente
- Pretérito (indefinido)
- Imperfecto
- Perfecto (pretérito perfecto compuesto)
- Futuro
- Condicional
- Subjuntivo Presente
- Imperativo

One sub-table per tense/mood. "Complete" means every valid person is filled
(`yo`, `tú`, `él/ella/usted`, `nosotros/as`, `vosotros/as`, `ellos/ellas/ustedes`);
Imperativo includes only its valid persons (no `yo`). Completeness of the *table*
does not require an example sentence for every person — that is governed by §4.
For irregular verbs, explain the reason or the pattern behind the irregularity
(stem change, orthographic change, fully irregular, etc.).

**noun** — state grammatical gender explicitly, the singular and plural forms, and
typical article usage (`el`/`la`/`un`/`una`, and notable cases such as feminine
nouns taking `el` in the singular, e.g. `el agua`).

**adjective** — masculine/feminine forms and singular/plural agreement. Note
invariable adjectives (e.g. `azul`, `feliz`) explicitly.

**adverb** — normally invariable; state so. Where relevant, note formation from an
adjective (`-mente`) and comparative/superlative usage.

**pronoun** — present the relevant paradigm or contrasting forms for the sense
taught (e.g. subject vs object forms), not an exhaustive grammar of all pronouns.

**determiner** — agreement forms (gender/number) where the determiner inflects;
note apocopated forms where they occur.

**numeral** — cardinal vs ordinal behaviour, agreement (`uno`/`una`,
`doscientos`/`doscientas`, `primero`/`primera`), and apocope (`uno` -> `un`,
`primero` -> `primer`).

**preposition / conjunction / interjection** — invariable; state so briefly. Note
relevant fixed contractions where applicable (`a + el` -> `al`, `de + el` ->
`del`).

### Section 4 — Example sentences (`## 例句`)

See §4 below for the detailed rules. The section renders the representative
examples, each with its Spanish sentence, Chinese translation, and grammar/usage
note.

### Section 5 — Extended learning (`## 延伸學習`)

- Synonyms.
- Antonyms, where applicable.

(Easily confused related words are covered under Usage, Section 2, and are not
repeated here.)

## 3. Example sentence requirements

Example sentences aim for **representative coverage, not maximum quantity.**

- **Do not** list every person of a tense, and do not repeat the same structure
  just to be exhaustive.
- **Do** provide one representative sentence per important tense/mood or important
  usage.

Each example includes:

- the Spanish sentence,
- a Traditional Chinese translation,
- a grammar or usage explanation (in Chinese).

For verbs, examples should **normally cover all** major requested tenses/moods
(Presente, Pretérito, Imperfecto, Perfecto, Futuro, Condicional, Subjuntivo,
Imperativo). Skipping a tense is only acceptable when producing an example would
be genuinely unnatural or misleading.

For non-verbs, examples span the word's major senses and usage contexts instead
of tenses.

**Naturalness overrides coverage.** If a natural, useful sentence cannot be formed
for a given tense or usage, skip it. A skipped tense is acceptable and strongly
preferred over an unnatural sentence produced only to complete the set. There is
no fixed sentence count.

**Guiding principle:** examples should prioritize learner usefulness and
naturalness over artificially covering grammar categories.

## 4. Explicitly out of scope

The lesson must **not** include:

- quizzes,
- gamification,
- any scoring system.

It is teaching material for reading and study, not an interactive exercise. These
are excluded until and unless they are explicitly requested as a future feature.

## 5. Prompt architecture

This describes how the generator is instructed. It is a design, not an
implementation — no workflow or prompt file is built here.

The prompt, together with this document, is the **primary constraint on teaching
quality**. The pipeline's validation is an acceptance gate for well-formed
canonical data, not a critic of the material (`docs/architecture.md` §4) — so
whatever makes a lesson good has to come from the contract and the prompt.

**System prompt — responsibilities**

- Establish the role: an expert Spanish teacher and curriculum designer producing
  complete teaching material for a Traditional-Chinese-speaking learner.
- Fix the output contract: the exact section order and headings from §2, Markdown
  only, every section always present.
- Set the language policy: explanations and headings in Traditional Chinese;
  Spanish word, conjugations, and example sentences in Spanish.
- State the canonical-form expectation: the input word is a lemma; the generator
  expands all inflected forms.
- Enforce accuracy: correct conjugations, correct gender, correct irregular
  explanations.
- Enforce honesty: omit CEFR/frequency (and any uncertain fact) rather than
  guessing.
- Enforce scope: no quizzes, gamification, or scoring (§4).

**Input data (per request)**

- Content inputs: `word` and `pos` — the only fields that affect the generated
  content.
- Correlation key: `id` — pipeline metadata for association and traceability, not
  a content input (per §1).
- `pos` selects which Word-forms template the generator applies.

**Output constraints**

- The generator writes **one complete canonical lesson document**: the
  frontmatter of §2 followed by the five fixed sections of §2, in order. It
  writes the whole file, not a fragment handed back for assembly.
- The frontmatter values are **supplied to the generator**, not chosen by it.
  `id`, `word`, `pos`, `date`, and `lesson_schema_version` come from the task
  context the pipeline prepares; the generator copies them exactly. It must not
  invent, alter, or omit any of them — consistent with §1, where `id` is
  correlation metadata rather than a generation input.
- The document is written at exactly the one path the task context names, and no
  other file is touched.
- Complete conjugation tables for verbs; representative examples per §3.
- Deterministic structure (fixed headings) so the result can be validated and
  projected without fragile parsing.

The pipeline parses and validates the finished document before accepting it; how
generation is invoked, and what the acceptance gate checks, belong to
`docs/architecture.md` §4–§5 rather than to this contract.

**Quality requirements**

- Linguistic accuracy is the top priority; a wrong conjugation or gender is a
  defect.
- Example sentences must be natural and genuinely useful.
- Chinese meanings ordered by real usage frequency.
- Cross-lesson consistency: the same structure every day.
- Irregularities explained by pattern, not merely listed.

**Deferred implementation details** (decided when the layer is built, not now):
how generation is invoked and which model runs it. Those are settled in
`docs/architecture.md` §5 and pinned during the scheduling milestone, not here —
this document constrains what a lesson must contain, not how it is produced.

What is settled: the generator writes fixed-heading Markdown, and the pipeline
accepts it through a structural check on the finished document. A structured
(JSON) output format is a future option, not a current requirement.

## 6. Long-term considerations

The system is intended to run for years: roughly 1000 core words in the first
milestone, then continuous vocabulary expansion.

**Fixed for stability:**

- The section set and order of §2. Consistency across thousands of lessons depends
  on this not drifting casually.
- The out-of-scope boundary of §4.

**Evolution space (additive, deliberate, version-bumped):**

- New Word-forms templates if the vocabulary POS enum ever grows.
- A new optional section (e.g. etymology, register notes) — added deliberately
  with a Lesson Schema Version bump, never ad hoc.
- New input fields (e.g. authoritative `gender`) if the vocabulary contract later
  supplies them; this specification's input contract (§1) widens in step.
- Prompt versioning for reproducibility. A generated lesson is conceptually a
  function of:

  ```
  (vocabulary entry, prompt version, lesson schema version)
  ```

  Pinning the prompt version alongside the lesson schema version lets any lesson
  be regenerated reproducibly and lets a change in output be traced to which input
  changed. Introduced when regeneration or auditing needs it.

**Deliberately not designed now** (avoiding premature design): difficulty
progression, spaced-repetition scheduling, audio/pronunciation media, and
per-learner personalization. None has a consumer yet; each would be a separate,
explicit feature.

## Changelog

- **v1** — Initial lesson contract: input contract (`word`, `pos`, `id`), fixed
  Markdown output structure (frontmatter, Word basics, Usage, Word forms, Example
  sentences, Extended learning), example-sentence rules, out-of-scope boundary,
  prompt architecture, and long-term evolution policy.
