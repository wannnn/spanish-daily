# Vocabulary Pilot — Candidate Review (source-backed)

- **Status:** the one-time human review is **complete**. All 40 candidates were
  **approved** (none replaced) and assigned `w0011`–`w0050`; they are written to
  `vocabulary.json`. This file remains a **worktable / audit trail**, *not* an
  authoritative contract (the contract is `docs/vocabulary-spec.md`).

## Approval outcome

- **Human review completed.** All **40** candidate lexical items **approved**; **0**
  replaced.
- **Final order** is the human-decided order below (11–50). `id` was assigned so that
  `id N` corresponds to `order N` (`w0011`–`w0050`).
- Written to `vocabulary.json` → **50** entries total; validated by the loader; the
  existing `w0001`–`w0010` are unchanged.
- Each candidate keeps its reviewed POS.

## Sources actually consulted

| Source | Used for | Access |
|---|---|---|
| **PCIC A1–A2 inventories** (Instituto Cervantes) | beginner suitability, theme/scope, the A1/A2 level + category behind each item | WebFetch, four inventory pages (URLs below) |
| **hermitdave/FrequencyWords** — `content/2018/es/es_50k.txt` | raw **word-form** frequency cross-check (rank = line; count = occurrences) | downloaded and grepped directly |
| **RAE** (DLE / Nueva gramática) | canonical headword + POS-ambiguity adjudication | WebSearch (dle.rae.es returns 403 to direct fetch; official RAE snippets used) |
| **Davies, *A Frequency Dictionary of Spanish*** | — | **NOT used** — no data supplied; no rank quoted |

PCIC inventory pages (all A1–A2):
- Gramática — <https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm> `[PCIC-Gram]`
- Funciones — <https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/05_funciones_inventario_a1-a2.htm> `[PCIC-Func]`
- Nociones generales — <https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/08_nociones_generales_inventario_a1-a2.htm> `[PCIC-NG]`
- Nociones específicas — <https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/09_nociones_especificas_inventario_a1-a2.htm> `[PCIC-NE]`

**hermitdave caveat (applies to every frequency figure):** `es_50k.txt` is a
**word-form** list from OpenSubtitles, **not a lemma list**. A lemma's frequency is
spread across all its forms, so the raw rank of an infinitive or masculine-singular
form **understates** the lemma. Raw rank is only a sanity check that the form occurs
in real usage — it is **never** used as curriculum order.

## Existing entries (`w0001`–`w0010`) — locked, unchanged

| id | word | pos | order | status |
|---|---|---|---|---|
| w0001 | hablar | verb | 1 | locked |
| w0002 | ser | verb | 2 | locked |
| w0003 | estar | verb | 3 | locked |
| w0004 | tener | verb | 4 | locked |
| w0005 | ir | verb | 5 | locked |
| w0006 | hacer | verb | 6 | locked |
| w0007 | casa | noun | 7 | locked |
| w0008 | tiempo | noun | 8 | locked |
| w0009 | bueno | adjective | 9 | locked |
| w0010 | hoy | adverb | 10 | locked |

## Approved new entries (`w0011`–`w0050`)

In final (human-approved) order. Decision tags: **S** = supported · **C** =
supported with caveat. `hermitdave` shows `rank / count` of the exact word-form.

| order | id | word | pos | canonical (RAE) | PCIC evidence | hermitdave (form) | pedagogical reason | ambiguity / limitation | decision |
|---|---|---|---|---|---|---|---|---|---|
| 11 | w0011 | hola | interjection | RAE interjection (apelativa) | A1 · 5.1 Saludar `[PCIC-Func]` | #88 / 602k | often the first word taught | — | S · approved |
| 12 | w0012 | gracias | interjection | RAE interjection (apelativa; listed with "adiós … gracias, hola") | A1 · 5.12 Agradecer `[PCIC-Func]` | #70 / 780k | politeness | homograph: plural of noun `gracia` | S · approved |
| 13 | w0013 | sí | interjection | **RAE: adverbio de afirmación** (dle.rae.es/sí, rae.es/dpd/sí) | A1 · 1.5 Confirmar la información previa `[PCIC-Func]` | #24 / 2.35M | yes/no responses | **POS divergence:** RAE = adverb; project enum §4 folds "sí (as a response)" into interjection — kept as interjection per spec | C · approved |
| 14 | w0014 | no | adverb | lemma ✓; RAE adv. de negación | A1 · 8.2 Adverbios nucleares o de predicado `[PCIC-Gram]` | #3 / 12.4M | negation from day one | can also be an interjection | S · approved |
| 15 | w0015 | yo | pronoun | lemma ✓ (DLE) | A1 · 7.1.1 Pronombre sujeto `[PCIC-Gram]` | #30 / 1.92M | anchors verb conjugation | — | S · approved |
| 16 | w0016 | tú | pronoun | lemma ✓ (DLE) | A1 · 7.1.1 Pronombre sujeto `[PCIC-Gram]` | #56 / 906k | informal "you" | accent-distinct from det. `tu` (your) | S · approved |
| 17 | w0017 | él | pronoun | lemma ✓ (DLE) | A1 · 7.1.1 Pronombre sujeto `[PCIC-Gram]` | #52 / 931k | 3rd person for conjugation | accent-distinct from article `el` | S · approved |
| 18 | w0018 | el | determiner | lemma ✓ (DLE) | A1 · 3.1 El artículo definido `[PCIC-Gram]` | #6 / 7.53M | most basic article | fem `la`/plurals derived | S · approved |
| 19 | w0019 | un | determiner | lemma ✓ (DLE) | A1 · 3.2 El artículo indefinido `[PCIC-Gram]` | #11 / 5.61M | "a/an" | distinct from numeral `uno` (apocope) | S · approved |
| 20 | w0020 | mi | determiner | lemma ✓ (DLE) | A1 · 5 Los posesivos `[PCIC-Gram]` | #22 / 2.40M | possession | accent-distinct from pronoun `mí` (me) | S · approved |
| 21 | w0021 | y | conjunction | lemma ✓ (DLE) | A1 · 14.1 Copulativas `[PCIC-Gram]` | #7 / 7.13M | basic connector | → `e` before i-/hi- | S · approved |
| 22 | w0022 | de | preposition | lemma ✓ (DLE) | A1 (foundational; no standalone prep. inventory) `[PCIC-Gram]` | #1 / 14.46M | possession/origin | see prepositions note | S · approved |
| 23 | w0023 | en | preposition | lemma ✓ (DLE) | A1 (as above) `[PCIC-Gram]` | #9 / 6.82M | location/time | prepositions note | S · approved |
| 24 | w0024 | a | preposition | lemma ✓ (DLE) | A1 (as above) `[PCIC-Gram]` | #4 / 9.55M | direction + personal `a` | homophone of verb form `ha` (excluded) | S · approved |
| 25 | w0025 | con | preposition | lemma ✓ (DLE) | A1 (as above) `[PCIC-Gram]` | #19 / 3.03M | accompaniment | prepositions note | S · approved |
| 26 | w0026 | querer | verb | infinitive ✓ (DLE) | A1 · 3.8 Expresar deseos `[PCIC-Func]` | #1557 / 22k | expressing wants | infinitive rare; lemma dispersed (quiero #67, quiere #152) | C · approved |
| 27 | w0027 | poder | verb | infinitive ✓; RAE verb **and** masc. noun (dle.rae.es/poder) | A1 · 4.8 Pedir permiso; 2.23 Expresar habilidad `[PCIC-Func]` | #362 / 115k | ability/permission | homograph: noun `el poder` — verb sense here | C · approved |
| 28 | w0028 | gustar | verb | infinitive ✓ (DLE) | A1 · 3.2 Expresar gustos e intereses; 3.5 Expresar preferencia `[PCIC-Func]` | #4220 / 6.9k | likes/dislikes — key A1 topic | taught via `me gusta`; infinitive very rare (gusta #207) | C · approved |
| 29 | w0029 | ver | verb | infinitive ✓ (DLE) | A1 · 2.3 Sensaciones y percepciones físicas `[PCIC-NE]` | #120 / 463k | perception verb | lemma dispersed (veo #269, ve #252) | C · approved |
| 30 | w0030 | comer | verb | infinitive ✓ (DLE) | A1 · 5.1 Dieta y nutrición `[PCIC-NE]` | #488 / 87k | daily routine; model -er | lemma dispersed (como #32, come #1457) | C · approved |
| 31 | w0031 | beber | verb | infinitive ✓ (DLE) | A1 · 5.2 Bebida `[PCIC-NE]` | #1053 / 35k | food/drink theme | infinitive form; lemma dispersed | C · approved |
| 32 | w0032 | vivir | verb | infinitive ✓ (DLE) | A1 · 10.1.3 Ocupación ("vivir en una casa…") `[PCIC-NE]` | #454 / 93k | "to live"; model -ir | lemma dispersed (vive #809, vivo #571) | C · approved |
| 33 | w0033 | necesitar | verb | infinitive ✓ (DLE) | A1 · 2.17 Expresar obligación y necesidad `[PCIC-Func]` | #1692 / 20k | expressing needs | infinitive rare; lemma dispersed (necesito #204) | C · approved |
| 34 | w0034 | día | noun | lemma ✓ (DLE), masc. | A1 · 4.1 Referencias generales (tiempo) `[PCIC-NG]` | #134 / 395k | time/calendar; "buenos días" | masc. despite -a ending | S · approved |
| 35 | w0035 | agua | noun | lemma ✓ (DLE), fem. | A2 · 5.2 Bebida `[PCIC-NE]` | #358 / 118k | basic need | fem. but "el agua" in sg. | S · approved |
| 36 | w0036 | comida | noun | lemma ✓; RAE f. noun (dle.rae.es/comida) | A1 · 5.1 Dieta y nutrición `[PCIC-NE]` | #483 / 88k | food theme | also fem. past participle of `comer`; noun sense; raw count conflates both | C · approved |
| 37 | w0037 | familia | noun | lemma ✓ (DLE), fem. | A1 · 4.1 Relaciones familiares `[PCIC-NE]` | #254 / 178k | family theme (A1) | — | S · approved |
| 38 | w0038 | hombre | noun | lemma ✓ (DLE), masc. | A2 · 3.1.7 Sexo `[PCIC-NE]` | #121 / 460k | people vocabulary | — | S · approved |
| 39 | w0039 | mujer | noun | lemma ✓ (DLE), fem. | A2 · 3.1.7 Sexo `[PCIC-NE]` | #195 / 250k | people vocabulary | — | S · approved |
| 40 | w0040 | grande | adjective | lemma ✓ (DLE) | A1 · 2.6.3 Tamaño `[PCIC-NG]` | #398 / 106k | size description | invariable in gender; apocope `gran` | S · approved |
| 41 | w0041 | pequeño | adjective | lemma ✓ (DLE), masc. sg. | A1 · 2.6.3 Tamaño `[PCIC-NG]` | #414 / 103k | opposite of grande | fem./plural forms disperse the lemma | S · approved |
| 42 | w0042 | nuevo | adjective | lemma ✓ (DLE), masc. sg. | A1 · 5.13 Edad, vejez `[PCIC-NG]` | #185 / 270k | very common descriptor | gender/number dispersion | S · approved |
| 43 | w0043 | feliz | adjective | lemma ✓ (DLE), invariable | **not located** in `[PCIC-NG]` A1–A2 | #338 / 126k | feelings; invariable example | PCIC word-level unconfirmed — supported by frequency + pedagogy | C · approved |
| 44 | w0044 | muy | adverb | lemma ✓ (DLE) | A1 · 11.2 Complementos y modificadores `[PCIC-Gram]` | #43 / 1.09M | intensity (muy bueno) | apocope of `mucho` before adj/adv | S · approved |
| 45 | w0045 | bien | adverb | lemma ✓ (DLE) | A1 · 8.2 Adverbios nucleares o de predicado `[PCIC-Gram]` | #26 / 2.05M | greetings (¿qué tal? — bien) | — | S · approved |
| 46 | w0046 | aquí | adverb | lemma ✓ (DLE) | A1 · 8.2 Adverbios `[PCIC-Gram]`; 3.1 Localización `[PCIC-NG]` | #33 / 1.63M | location deixis | — | S · approved |
| 47 | w0047 | uno | numeral | lemma ✓ (DLE); RAE adj./pron./noun | A1 · números cardinales (category, not enumerated) `[PCIC-NG]` | #135 / 393k | counting starts here | apocopates to `un`; raw count mixes uses | C · approved |
| 48 | w0048 | dos | numeral | lemma ✓ (DLE) | A1 · números cardinales (category) `[PCIC-NG]` | #96 / 556k | counting | category-level PCIC only | C · approved |
| 49 | w0049 | pero | conjunction | lemma ✓ (DLE) | A1 · 14.3 Adversativas `[PCIC-Gram]` | #23 / 2.37M | contrast connector | — | S · approved |
| 50 | w0050 | porque | conjunction | lemma ✓ (DLE) | A1 · 15.3.4 Causales `[PCIC-Gram]` | #76 / 685k | giving reasons | one word; distinct from `por qué` | S · approved |

**Prepositions note (`de`, `en`, `a`, `con`):** the PCIC A1–A2 *Gramática* inventory
`[PCIC-Gram]` has **no standalone preposition section** (it runs to §15; prepositions
appear inside complement structures, not as an enumerated list). These four are the
highest-utility prepositions, with overwhelming corpus frequency (de #1, a #4, en #9,
con #19) and unambiguous A1 pedagogy — approved on the frequency-plus-pedagogy branch,
with this honest PCIC caveat.

## Decision summary

- **Supported (S): 27** · **Supported with caveat (C): 13** · **Replaced: 0** ·
  **Unsupported: 0.**
- The 13 caveats: the 8 verbs (raw infinitive understates the dispersed lemma),
  `comida` (noun/participle homograph), `feliz` (PCIC word-level unconfirmed),
  `uno`/`dos` (PCIC category-level only), `sí` (RAE adverb vs project interjection).

## Approved order — rationale (teaching sequence, not frequency)

The human-approved order leads with social language and sentence scaffolding, then
content words: 11–13 social openers (hola, gracias, sí); 14 negation (no); 15–17
subject pronouns; 18–20 determiners (el, un, mi); 21 the connector `y`; 22–25 the
core prepositions; 26–33 high-value verbs; 34–39 everyday nouns; 40–43 adjectives;
44–46 qualifier/place adverbs; 47–48 numerals; 49–50 conjunctions (pero, porque).
This is a pedagogical decision, independent of corpus rank; the schema allows gaps,
so future insertions need no renumbering.

## Ambiguities, homographs, and limitations

**Diacritical-accent minimal pairs — distinct lemmas, NOT duplicates.** Only the
listed member was approved; its partner is a valid future candidate.
- `el` (det.) vs `él` (pron.) — both approved (18, 17).
- `tú` (pron.) vs `tu` (det., "your") — only `tú` approved (`tu` #34 in corpus).
- `mi` (det.) vs `mí` (pron., "me") — only `mi` approved (`mí` #104 in corpus).
- `sí` (yes) vs `si` (conj., "if") — only `sí` approved (`si` #25 in corpus).

**Apocope — distinct lexical items (`docs/vocabulary-spec.md` §3).**
- `un` (det., article) vs `uno` (numeral) — both approved (19, 47).

**POS homographs — one sense approved; RAE-checked.**
- `poder` — **verb** (RAE also lists masc. noun `el poder`).
- `comida` — **noun** (RAE f. noun); morphologically also the participle of `comer`.
- `gracias` — **interjection** (RAE apelativa); noun `gracia` is a separate lemma.
- `no` — **adverb** (RAE adv. de negación); can also be an interjection.

**RAE ↔ project-enum divergences (flagged; project enum governs storage).**
- `sí` — RAE: *adverbio de afirmación*; stored as `interjection` per spec §4.
- `uno`, `dos` — RAE treats numbers as adjective/pronoun/noun; stored as `numeral`
  per the project's dedicated category (spec §4).

**hermitdave word-form limitations (recorded).** Verb infinitives rank low (usage
spread across conjugations); masculine-singular adjectives / singular nouns
understate their lemmas; `comida`/`poder`/`no`/`uno` counts mix parts of speech. No
conjugated verb form was admitted as a lemma — all eight verbs are `-ar/-er/-ir`
infinitives.

## Coverage summary

Existing (10) + approved (40) = **50**. Approved POS distribution:

| pos | count |
|---|---|
| verb | 8 |
| noun | 6 |
| adjective | 4 |
| adverb | 4 |
| pronoun | 3 |
| determiner | 3 |
| preposition | 4 |
| conjunction | 3 |
| numeral | 2 |
| interjection | 3 |
| **total** | **40** |

All ten enum categories represented.

## Source methodology

- **Frequency ≠ curriculum order.** hermitdave rank only confirms a word-form occurs
  in real usage; curriculum `order` is a human pedagogical decision.
- **Word form ≠ lemma.** hermitdave is a word-form corpus; raw ranks understate
  lemmas. Only lemmas are stored in `vocabulary.json`.
- **Division of labour:** **PCIC** decides beginner suitability, theme, and the
  A1/A2 level + category; **hermitdave** provides a raw word-form frequency
  cross-check (with the word-form caveat); **RAE** adjudicates the canonical headword
  and POS ambiguity. Where RAE and the project enum disagree (e.g. `sí`), the enum in
  `docs/vocabulary-spec.md` §4 governs storage and the divergence is flagged.
- **Davies is not used.** No data was supplied; no rank is cited or implied.
- This file is a worktable / audit trail, not an authoritative contract.

## Attribution

- **hermitdave/FrequencyWords** — <https://github.com/hermitdave/FrequencyWords>,
  file `content/2018/es/es_50k.txt`, generated from the **OpenSubtitles** corpus.
  **Licensing:** the repository's *code* is **MIT**; the *generated
  frequency-list content* (including `es_50k.txt`) is **CC BY-SA 4.0**. `es_50k.txt`
  is therefore **CC BY-SA 4.0 content — not MIT**. Only aggregate rank/count figures
  for individual candidate word-forms are cited here; the full ranked list is not
  redistributed.
- **RAE** references (Diccionario de la lengua española / Nueva gramática) are the
  Real Academia Española's; **PCIC** references are the Instituto Cervantes' *Plan
  curricular*. Both cited by URL, not reproduced.

## Outcome

Approved and written: `w0011`–`w0050` appended to `vocabulary.json` (50 entries
total), validated by the loader; `w0001`–`w0010` unchanged; `history.jsonl` and
existing lessons untouched. The next milestone expands the curriculum toward ~1000
lexical items in staged batches, reusing this same methodology.
