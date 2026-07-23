# Vocabulary Curriculum Expansion — Candidate Review (`order` 51–250)

- **Status:** the one-time human review of the first formal expansion batch is
  **complete**. Of 200 candidates, **199 were approved unchanged** and **1 was
  replaced** (`vale` → `que`); five further metadata corrections were applied
  (below). All 200 rows are **approved** and assigned `id` `w0051`–`w0250` with
  `id N` ↔ `order N`. They are written to `vocabulary.json` (250 entries total).
  This file is a **worktable / audit trail**, *not* an authoritative contract
  (the contract is `docs/vocabulary-spec.md`; the pilot trail is
  `docs/vocabulary-pilot-candidates.md`).
- **Batch:** 51–250 (this file). Later batches — 251–500, 501–750, 751–1000 —
  reuse the same method.

## Corrections applied at review

1. **Replaced `order` 250:** removed `vale` (interjection); added **`que`
   (conjunction)** — A1 subordinate-clause connector, `status: ambiguous`
   (unaccented conjunction, distinct from the interrogative pronoun `qué`).
2. **`mar`** canonical status `confirmed` → **`ambiguous`** (both masculine and
   feminine usage exist: *el mar* / *la mar*).
3. **`se`** caveat corrected to *accent-distinct from `sé` of `saber`*.
4. Stale accent-section `order` references fixed: **`si` is `order` 94**,
   **`cuando` is `order` 95**.
5. Removed the earlier claim that `que` was *"implied elsewhere"* — `que` now
   has its **own** lexical entry (`w0250`).
6. Theme reclassification: **`amor` → emotions / relationships**,
   **`vida` → general concepts**. (`contento` / `cansado` deliberately not added
   in this batch.)

## Method (unchanged from the settled pilot method)

- `vocabulary.json` is a **human-maintained source of truth**; AI proposed
  candidates and a draft order, the **human approved** inclusion and final order.
- **Frequency builds the candidate pool; it is never the curriculum `order`.**
  `order` below is a **teaching sequence**, not a frequency rank.
- Only **canonical lemmas** are stored (verbs infinitive, nouns singular,
  adjectives masc. sg.). No inflected forms. `pos` uses the existing closed enum
  (`docs/vocabulary-spec.md` §4); no schema/enum/validation change is proposed.
- **hermitdave `content/2018/es/es_50k.txt`** (OpenSubtitles, 2018) gives a raw
  **word-form** rank as a sanity check only (understates lemmas). Downloaded once
  to a scratch path **outside the repo**; **not** added to Git.
- **RAE/DRAE** consulted only for flagged canonical/homograph/POS-ambiguity rows;
  **PCIC A1–A2** gives level and theme. Existing `w0001`–`w0050` are unchanged
  and not duplicated `(word, pos)`.

## Approved entries (`w0051`–`w0250`)

`hermitdave` = raw rank of the exact word-form in `es_50k.txt`. `status` ∈
{confirmed, ambiguous, needs review}.

| order | id | word | pos | PCIC level / theme | hermitdave rank | canonical status | caveat | decision |
|---|---|---|---|---|---|---|---|---|
| 51 | w0051 | ella | pronoun | A1 · pronouns | #66 | confirmed | 3rd person feminine subject pronoun | approved |
| 52 | w0052 | nosotros | pronoun | A1 · pronouns | #143 | confirmed | 1st person plural; fem nosotras derived | approved |
| 53 | w0053 | vosotros | pronoun | A1 · pronouns | #765 | confirmed | 2nd plural (peninsular); needed for full conjugation | approved |
| 54 | w0054 | ellos | pronoun | A1 · pronouns | #156 | confirmed | 3rd plural; fem ellas derived | approved |
| 55 | w0055 | usted | pronoun | A1 · pronouns | #86 | confirmed | formal you; takes 3rd person verb | approved |
| 56 | w0056 | me | pronoun | A1 · pronouns | #14 | confirmed | 1st person object/reflexive clitic | approved |
| 57 | w0057 | te | pronoun | A1 · pronouns | #18 | confirmed | 2nd person object/reflexive clitic | approved |
| 58 | w0058 | se | pronoun | A2 · pronouns | #17 | ambiguous | reflexive/impersonal clitic; accent-distinct from sé of saber | approved |
| 59 | w0059 | lo | pronoun | A2 · pronouns | #10 | ambiguous | direct-object pronoun; homograph of neuter article lo | approved |
| 60 | w0060 | esto | pronoun | A1 · pronouns | #38 | confirmed | neuter demonstrative pronoun | approved |
| 61 | w0061 | algo | pronoun | A2 · pronouns | #48 | confirmed | indefinite pronoun something | approved |
| 62 | w0062 | alguien | pronoun | A2 · pronouns | #123 | confirmed | indefinite pronoun someone | approved |
| 63 | w0063 | nadie | pronoun | A2 · pronouns | #151 | confirmed | negative indefinite pronoun | approved |
| 64 | w0064 | nada | pronoun | A2 · pronouns | #58 | ambiguous | pronoun nothing; homograph of nadar 3sg and adverb nada | approved |
| 65 | w0065 | qué | pronoun | A1 · interrogatives | #13 | ambiguous | interrogative; accent-distinct from conjunction que | approved |
| 66 | w0066 | quién | pronoun | A1 · interrogatives | #93 | confirmed | interrogative who | approved |
| 67 | w0067 | cuál | pronoun | A2 · interrogatives | #312 | confirmed | interrogative which | approved |
| 68 | w0068 | este | determiner | A1 · determiners | #60 | confirmed | proximal demonstrative; agreement derived | approved |
| 69 | w0069 | ese | determiner | A1 · determiners | #85 | confirmed | medial demonstrative | approved |
| 70 | w0070 | aquel | determiner | A2 · determiners | #1301 | confirmed | distal demonstrative | approved |
| 71 | w0071 | tu | determiner | A1 · determiners | #34 | ambiguous | possessive your; accent-distinct from pronoun tú (w0016) | approved |
| 72 | w0072 | su | determiner | A1 · determiners | #28 | confirmed | possessive his/her/their/your-formal | approved |
| 73 | w0073 | nuestro | determiner | A1 · determiners | #194 | confirmed | possessive our; agreement derived | approved |
| 74 | w0074 | todo | determiner | A1 · determiners | #39 | ambiguous | quantifier all; also pronoun/adverb — determiner sense taught | approved |
| 75 | w0075 | mucho | determiner | A1 · determiners | #103 | ambiguous | quantifier much/many; also adverb — determiner sense taught | approved |
| 76 | w0076 | poco | determiner | A2 · determiners | #133 | ambiguous | quantifier little/few; also adverb/noun — determiner sense taught | approved |
| 77 | w0077 | otro | determiner | A1 · determiners | #171 | confirmed | another/other; agreement derived | approved |
| 78 | w0078 | cuánto | determiner | A1 · interrogatives | #343 | ambiguous | interrogative quantifier how much; accent-distinct from cuanto | approved |
| 79 | w0079 | cómo | adverb | A1 · interrogatives | #59 | ambiguous | interrogative how; accent-distinct from conjunction como | approved |
| 80 | w0080 | cuándo | adverb | A1 · interrogatives | #394 | ambiguous | interrogative when; accent-distinct from conjunction cuando | approved |
| 81 | w0081 | dónde | adverb | A1 · interrogatives | #99 | ambiguous | interrogative where; accent-distinct from relative donde | approved |
| 82 | w0082 | más | adverb | A1 · adverbs | #36 | confirmed | comparative more; accent-distinct from conjunction mas | approved |
| 83 | w0083 | menos | adverb | A1 · adverbs | #190 | confirmed | comparative less | approved |
| 84 | w0084 | también | adverb | A1 · adverbs | #112 | confirmed | additive also | approved |
| 85 | w0085 | tampoco | adverb | A2 · adverbs | #504 | confirmed | negative additive neither | approved |
| 86 | w0086 | por | preposition | A1 · prepositions | #12 | ambiguous | por/para contrast is a core usage note | approved |
| 87 | w0087 | para | preposition | A1 · prepositions | #20 | ambiguous | por/para contrast; homograph of parar 3sg | approved |
| 88 | w0088 | sin | preposition | A2 · prepositions | #115 | confirmed | without | approved |
| 89 | w0089 | sobre | preposition | A2 · prepositions | #113 | ambiguous | preposition on/about; also noun (envelope) — prep sense taught | approved |
| 90 | w0090 | entre | preposition | A2 · prepositions | #251 | confirmed | between/among | approved |
| 91 | w0091 | hasta | preposition | A2 · prepositions | #126 | confirmed | until/up to; also adverb even | approved |
| 92 | w0092 | desde | preposition | A2 · prepositions | #163 | confirmed | from/since | approved |
| 93 | w0093 | o | conjunction | A1 · conjunctions | #61 | confirmed | disjunction; becomes u before o-/ho- | approved |
| 94 | w0094 | si | conjunction | A1 · conjunctions | #25 | ambiguous | conditional if; accent-distinct from sí (w0013) | approved |
| 95 | w0095 | cuando | conjunction | A2 · conjunctions | #53 | ambiguous | temporal conjunction; accent-distinct from interrogative cuándo | approved |
| 96 | w0096 | decir | verb | A1 · verbs: daily actions | #111 | confirmed | irregular -ir; to say/tell | approved |
| 97 | w0097 | dar | verb | A1 · verbs: daily actions | #453 | confirmed | irregular -ar; to give | approved |
| 98 | w0098 | saber | verb | A1 · verbs: daily actions | #236 | ambiguous | to know (facts); also masc noun el saber — verb sense | approved |
| 99 | w0099 | venir | verb | A1 · verbs: daily actions | #339 | confirmed | irregular -ir; to come | approved |
| 100 | w0100 | poner | verb | A2 · verbs: daily actions | #606 | confirmed | irregular -er; to put | approved |
| 101 | w0101 | salir | verb | A1 · verbs: daily actions | #265 | confirmed | to leave/go out | approved |
| 102 | w0102 | llegar | verb | A1 · verbs: daily actions | #400 | confirmed | to arrive | approved |
| 103 | w0103 | pasar | verb | A2 · verbs: daily actions | #323 | confirmed | to pass/happen | approved |
| 104 | w0104 | llevar | verb | A2 · verbs: daily actions | #602 | confirmed | to carry/wear/take | approved |
| 105 | w0105 | dejar | verb | A2 · verbs: daily actions | #347 | confirmed | to leave/let | approved |
| 106 | w0106 | llamar | verb | A1 · verbs: daily actions | #581 | confirmed | to call; reflexive llamarse for names | approved |
| 107 | w0107 | pensar | verb | A2 · verbs: daily actions | #423 | confirmed | e>ie stem change; to think | approved |
| 108 | w0108 | creer | verb | A2 · verbs: daily actions | #497 | confirmed | to believe/think | approved |
| 109 | w0109 | deber | verb | A2 · verbs: daily actions | #1969 | ambiguous | must/owe; also noun deber/deberes — verb sense taught | approved |
| 110 | w0110 | encontrar | verb | A2 · verbs: daily actions | #372 | confirmed | o>ue stem change; to find | approved |
| 111 | w0111 | empezar | verb | A2 · verbs: daily actions | #619 | confirmed | e>ie; z>c spelling; to begin | approved |
| 112 | w0112 | entender | verb | A2 · verbs: daily actions | #1064 | confirmed | e>ie; to understand | approved |
| 113 | w0113 | esperar | verb | A2 · verbs: daily actions | #522 | confirmed | to wait/hope | approved |
| 114 | w0114 | buscar | verb | A1 · verbs: daily actions | #635 | confirmed | c>qu spelling; to look for | approved |
| 115 | w0115 | trabajar | verb | A1 · verbs: daily actions | #431 | confirmed | to work; regular -ar | approved |
| 116 | w0116 | estudiar | verb | A1 · verbs: daily actions | #2477 | confirmed | to study | approved |
| 117 | w0117 | escribir | verb | A1 · verbs: daily actions | #1178 | confirmed | to write; irregular past participle escrito | approved |
| 118 | w0118 | leer | verb | A1 · verbs: daily actions | #1171 | confirmed | to read | approved |
| 119 | w0119 | aprender | verb | A1 · verbs: daily actions | #1229 | confirmed | to learn | approved |
| 120 | w0120 | conocer | verb | A1 · verbs: daily actions | #1039 | confirmed | c>zc 1sg; to know (people/places) | approved |
| 121 | w0121 | sentir | verb | A2 · verbs: daily actions | #798 | confirmed | e>ie/i; to feel | approved |
| 122 | w0122 | comprar | verb | A1 · food & shopping | #818 | confirmed | to buy | approved |
| 123 | w0123 | abrir | verb | A1 · verbs: daily actions | #1261 | confirmed | to open; irregular pp abierto | approved |
| 124 | w0124 | cerrar | verb | A1 · verbs: daily actions | #1798 | confirmed | e>ie; to close | approved |
| 125 | w0125 | usar | verb | A2 · verbs: daily actions | #666 | confirmed | to use | approved |
| 126 | w0126 | ayudar | verb | A2 · verbs: daily actions | #559 | confirmed | to help | approved |
| 127 | w0127 | dormir | verb | A1 · verbs: daily actions | #557 | confirmed | o>ue/u; to sleep | approved |
| 128 | w0128 | mirar | verb | A1 · verbs: daily actions | #1065 | confirmed | to look at/watch | approved |
| 129 | w0129 | escuchar | verb | A1 · verbs: daily actions | #888 | confirmed | to listen | approved |
| 130 | w0130 | tomar | verb | A1 · verbs: daily actions | #387 | confirmed | to take/drink | approved |
| 131 | w0131 | volver | verb | A2 · verbs: daily actions | #301 | confirmed | o>ue; irregular pp vuelto; to return | approved |
| 132 | w0132 | preguntar | verb | A2 · verbs: daily actions | #1507 | confirmed | to ask | approved |
| 133 | w0133 | viajar | verb | A1 · places & transport | #2530 | confirmed | to travel | approved |
| 134 | w0134 | persona | noun | A1 · people & relationships | #310 | confirmed | fem; refers to any gender | approved |
| 135 | w0135 | amigo | noun | A1 · people & relationships | #192 | confirmed | masc citation; fem amiga derived | approved |
| 136 | w0136 | niño | noun | A1 · people & relationships | #375 | confirmed | masc citation; fem niña derived | approved |
| 137 | w0137 | padre | noun | A1 · people & relationships | #147 | confirmed | masc; plural padres = parents | approved |
| 138 | w0138 | madre | noun | A1 · people & relationships | #175 | confirmed | fem | approved |
| 139 | w0139 | hermano | noun | A1 · people & relationships | #271 | confirmed | masc citation; fem hermana derived | approved |
| 140 | w0140 | hijo | noun | A1 · people & relationships | #188 | confirmed | masc citation; plural hijos = children | approved |
| 141 | w0141 | abuelo | noun | A2 · people & relationships | #980 | confirmed | masc citation; fem abuela derived | approved |
| 142 | w0142 | señor | noun | A1 · people & relationships | #107 | confirmed | masc; Mr/sir; fem señora derived | approved |
| 143 | w0143 | gente | noun | A2 · people & relationships | #145 | confirmed | fem singular collective (people) | approved |
| 144 | w0144 | nombre | noun | A1 · people & relationships | #216 | confirmed | masc; name | approved |
| 145 | w0145 | hora | noun | A1 · time & date | #245 | confirmed | fem; hour/time-of-clock | approved |
| 146 | w0146 | semana | noun | A1 · time & date | #326 | confirmed | fem; week | approved |
| 147 | w0147 | mes | noun | A1 · time & date | #822 | confirmed | masc; month | approved |
| 148 | w0148 | año | noun | A1 · time & date | #331 | confirmed | masc; year | approved |
| 149 | w0149 | mañana | noun | A1 · time & date | #173 | ambiguous | noun morning; homograph of adverb mañana (tomorrow) — noun sense | approved |
| 150 | w0150 | tarde | noun | A1 · time & date | #243 | ambiguous | noun afternoon; homograph of adverb tarde (late) — noun sense | approved |
| 151 | w0151 | noche | noun | A1 · time & date | #136 | confirmed | fem; night | approved |
| 152 | w0152 | minuto | noun | A2 · time & date | #579 | confirmed | masc; minute | approved |
| 153 | w0153 | tres | numeral | A1 · numbers | #202 | confirmed | cardinal 3; invariable | approved |
| 154 | w0154 | cuatro | numeral | A1 · numbers | #411 | confirmed | cardinal 4 | approved |
| 155 | w0155 | cinco | numeral | A1 · numbers | #374 | confirmed | cardinal 5 | approved |
| 156 | w0156 | seis | numeral | A1 · numbers | #528 | confirmed | cardinal 6 | approved |
| 157 | w0157 | siete | numeral | A1 · numbers | #844 | confirmed | cardinal 7 | approved |
| 158 | w0158 | ocho | numeral | A1 · numbers | #928 | confirmed | cardinal 8 | approved |
| 159 | w0159 | nueve | numeral | A1 · numbers | #1288 | confirmed | cardinal 9 | approved |
| 160 | w0160 | diez | numeral | A1 · numbers | #594 | confirmed | cardinal 10 | approved |
| 161 | w0161 | cien | numeral | A2 · numbers | #1899 | confirmed | cardinal 100; spec §3 lists cien as base form (apocope of ciento) | approved |
| 162 | w0162 | mil | numeral | A2 · numbers | #716 | confirmed | cardinal 1000 | approved |
| 163 | w0163 | primero | numeral | A2 · numbers | #324 | ambiguous | ordinal 1st masc sg; apocope primer; also adverb — numeral sense | approved |
| 164 | w0164 | pan | noun | A1 · food & shopping | #1549 | confirmed | masc; bread | approved |
| 165 | w0165 | leche | noun | A1 · food & shopping | #1495 | confirmed | fem; milk | approved |
| 166 | w0166 | café | noun | A1 · food & shopping | #617 | confirmed | masc; coffee/café | approved |
| 167 | w0167 | fruta | noun | A1 · food & shopping | #4693 | confirmed | fem; fruit | approved |
| 168 | w0168 | carne | noun | A1 · food & shopping | #1032 | confirmed | fem; meat | approved |
| 169 | w0169 | pescado | noun | A2 · food & shopping | #2464 | ambiguous | masc noun fish (food); vs pez (live) and pp of pescar — noun sense | approved |
| 170 | w0170 | huevo | noun | A2 · food & shopping | #3193 | confirmed | masc; egg | approved |
| 171 | w0171 | vino | noun | A2 · food & shopping | #489 | ambiguous | masc noun wine; homograph of venir 3sg pret — noun sense | approved |
| 172 | w0172 | restaurante | noun | A1 · food & shopping | #1488 | confirmed | masc; restaurant | approved |
| 173 | w0173 | tienda | noun | A1 · food & shopping | #817 | confirmed | fem; shop | approved |
| 174 | w0174 | mercado | noun | A2 · food & shopping | #1767 | confirmed | masc; market | approved |
| 175 | w0175 | dinero | noun | A1 · food & shopping | #164 | confirmed | masc; money | approved |
| 176 | w0176 | mesa | noun | A1 · home & housing | #828 | confirmed | fem; table | approved |
| 177 | w0177 | silla | noun | A1 · home & housing | #1579 | confirmed | fem; chair | approved |
| 178 | w0178 | cama | noun | A1 · home & housing | #540 | confirmed | fem; bed | approved |
| 179 | w0179 | puerta | noun | A1 · home & housing | #321 | confirmed | fem; door | approved |
| 180 | w0180 | ventana | noun | A1 · home & housing | #1140 | confirmed | fem; window | approved |
| 181 | w0181 | cocina | noun | A1 · home & housing | #1017 | ambiguous | fem noun kitchen; homograph of cocinar 3sg — noun sense | approved |
| 182 | w0182 | habitación | noun | A1 · home & housing | #496 | confirmed | fem; room | approved |
| 183 | w0183 | baño | noun | A1 · home & housing | #715 | confirmed | masc; bathroom/bath | approved |
| 184 | w0184 | piso | noun | A2 · home & housing | #1007 | confirmed | masc; flat/floor | approved |
| 185 | w0185 | cosa | noun | A1 · home & housing | #187 | confirmed | fem; thing | approved |
| 186 | w0186 | ciudad | noun | A1 · places & transport | #336 | confirmed | fem; city | approved |
| 187 | w0187 | calle | noun | A1 · places & transport | #607 | confirmed | fem; street | approved |
| 188 | w0188 | país | noun | A1 · places & transport | #583 | confirmed | masc; country | approved |
| 189 | w0189 | lugar | noun | A2 · places & transport | #177 | confirmed | masc; place | approved |
| 190 | w0190 | pueblo | noun | A2 · places & transport | #570 | confirmed | masc; town/village/people | approved |
| 191 | w0191 | mundo | noun | A2 · places & transport | #165 | confirmed | masc; world | approved |
| 192 | w0192 | coche | noun | A1 · places & transport | #408 | confirmed | masc; car | approved |
| 193 | w0193 | tren | noun | A1 · places & transport | #951 | confirmed | masc; train | approved |
| 194 | w0194 | autobús | noun | A1 · places & transport | #1702 | confirmed | masc; bus | approved |
| 195 | w0195 | avión | noun | A2 · places & transport | #929 | confirmed | masc; plane | approved |
| 196 | w0196 | trabajo | noun | A1 · work & study | #142 | ambiguous | masc noun work/job; homograph of trabajar 1sg — noun sense | approved |
| 197 | w0197 | escuela | noun | A1 · work & study | #463 | confirmed | fem; school | approved |
| 198 | w0198 | clase | noun | A1 · work & study | #410 | confirmed | fem; class/lesson | approved |
| 199 | w0199 | libro | noun | A1 · work & study | #612 | confirmed | masc; book | approved |
| 200 | w0200 | palabra | noun | A2 · work & study | #534 | confirmed | fem; word | approved |
| 201 | w0201 | papel | noun | A2 · work & study | #935 | confirmed | masc; paper/role | approved |
| 202 | w0202 | problema | noun | A2 · work & study | #244 | confirmed | masc despite -a ending | approved |
| 203 | w0203 | pregunta | noun | A2 · work & study | #470 | ambiguous | fem noun question; homograph of preguntar 3sg — noun sense | approved |
| 204 | w0204 | historia | noun | A2 · work & study | #314 | confirmed | fem; story/history | approved |
| 205 | w0205 | cuerpo | noun | A2 · body & health | #435 | confirmed | masc; body | approved |
| 206 | w0206 | cabeza | noun | A2 · body & health | #274 | confirmed | fem; head | approved |
| 207 | w0207 | mano | noun | A1 · body & health | #373 | ambiguous | fem despite -o ending (la mano) | approved |
| 208 | w0208 | ojo | noun | A2 · body & health | #1240 | confirmed | masc; eye | approved |
| 209 | w0209 | corazón | noun | A2 · body & health | #355 | confirmed | masc; heart | approved |
| 210 | w0210 | salud | noun | A2 · body & health | #983 | confirmed | fem; health | approved |
| 211 | w0211 | médico | noun | A2 · body & health | #704 | confirmed | masc citation; fem médica derived; doctor | approved |
| 212 | w0212 | amor | noun | A2 · emotions / relationships | #250 | confirmed | masc; love | approved |
| 213 | w0213 | vida | noun | A2 · general concepts | #122 | confirmed | fem; life | approved |
| 214 | w0214 | sol | noun | A1 · weather & nature | #824 | confirmed | masc; sun | approved |
| 215 | w0215 | lluvia | noun | A2 · weather & nature | #2173 | confirmed | fem; rain | approved |
| 216 | w0216 | calor | noun | A1 · weather & nature | #1369 | confirmed | masc; heat (hace calor) | approved |
| 217 | w0217 | cielo | noun | A2 · weather & nature | #623 | confirmed | masc; sky | approved |
| 218 | w0218 | mar | noun | A2 · weather & nature | #1036 | ambiguous | masc/fem; sea (el mar / la mar both used) | approved |
| 219 | w0219 | árbol | noun | A2 · weather & nature | #1517 | confirmed | masc; tree | approved |
| 220 | w0220 | perro | noun | A1 · weather & nature | #622 | confirmed | masc citation; fem perra derived; dog | approved |
| 221 | w0221 | gato | noun | A1 · weather & nature | #1531 | confirmed | masc citation; fem gata derived; cat | approved |
| 222 | w0222 | malo | adjective | A1 · adjectives | #476 | confirmed | masc sg; apocope mal; opposite of bueno | approved |
| 223 | w0223 | alto | adjective | A1 · adjectives | #525 | confirmed | masc sg; tall/high | approved |
| 224 | w0224 | bajo | adjective | A1 · adjectives | #380 | ambiguous | adjective short/low; also preposition/adverb/noun — adjective sense | approved |
| 225 | w0225 | largo | adjective | A2 · adjectives | #709 | confirmed | masc sg; long (false friend: not large) | approved |
| 226 | w0226 | viejo | adjective | A1 · adjectives | #382 | confirmed | masc sg; old | approved |
| 227 | w0227 | joven | adjective | A2 · adjectives | #506 | confirmed | invariable in gender; plural jóvenes; young | approved |
| 228 | w0228 | bonito | adjective | A1 · adjectives | #805 | confirmed | masc sg; pretty | approved |
| 229 | w0229 | difícil | adjective | A2 · adjectives | #404 | confirmed | invariable in gender; difficult | approved |
| 230 | w0230 | fácil | adjective | A2 · adjectives | #487 | confirmed | invariable in gender; easy | approved |
| 231 | w0231 | importante | adjective | A2 · adjectives | #353 | confirmed | invariable in gender; important | approved |
| 232 | w0232 | blanco | adjective | A1 · adjectives | #850 | confirmed | masc sg; white | approved |
| 233 | w0233 | negro | adjective | A1 · adjectives | #739 | confirmed | masc sg; black | approved |
| 234 | w0234 | rojo | adjective | A1 · adjectives | #1313 | confirmed | masc sg; red | approved |
| 235 | w0235 | verde | adjective | A1 · adjectives | #1611 | confirmed | invariable in gender; green | approved |
| 236 | w0236 | azul | adjective | A1 · adjectives | #1244 | confirmed | invariable in gender; blue | approved |
| 237 | w0237 | frío | adjective | A1 · adjectives | #1044 | ambiguous | adjective cold; also noun el frío — adjective sense taught | approved |
| 238 | w0238 | ahora | adverb | A1 · adverbs | #42 | confirmed | now | approved |
| 239 | w0239 | siempre | adverb | A1 · adverbs | #125 | confirmed | always | approved |
| 240 | w0240 | nunca | adverb | A1 · adverbs | #98 | confirmed | never | approved |
| 241 | w0241 | después | adverb | A1 · adverbs | #161 | confirmed | after/afterwards | approved |
| 242 | w0242 | antes | adverb | A1 · adverbs | #130 | confirmed | before/beforehand | approved |
| 243 | w0243 | ya | adverb | A1 · adverbs | #40 | confirmed | already/now | approved |
| 244 | w0244 | todavía | adverb | A2 · adverbs | #264 | confirmed | still/yet | approved |
| 245 | w0245 | allí | adverb | A1 · adverbs | #189 | confirmed | there (distal); pairs with aquí (w0046) | approved |
| 246 | w0246 | cerca | adverb | A1 · adverbs | #381 | confirmed | near; cerca de | approved |
| 247 | w0247 | lejos | adverb | A1 · adverbs | #523 | confirmed | far; lejos de | approved |
| 248 | w0248 | adiós | interjection | A1 · social | #297 | confirmed | goodbye; RAE interjection | approved |
| 249 | w0249 | perdón | interjection | A1 · social | #586 | ambiguous | interjection sorry/excuse-me; also masc noun — interjection sense | approved |
| 250 | w0250 | que | conjunction | A1 · conjunctions | #2 | ambiguous | unaccented conjunction, distinct from interrogative pronoun qué | approved |

## Ambiguous / needs-review items

33 of 200 rows are flagged — homographs / multi-POS forms where the
stored sense is a deliberate choice, accent-distinct minimal pairs, and gendered
nouns. All are approved; the flag records what a human confirmed.

| order | id | word | pos | status | why it is flagged |
|---|---|---|---|---|---|
| 58 | w0058 | se | pronoun | ambiguous | reflexive/impersonal clitic; accent-distinct from sé of saber |
| 59 | w0059 | lo | pronoun | ambiguous | direct-object pronoun; homograph of neuter article lo |
| 64 | w0064 | nada | pronoun | ambiguous | pronoun nothing; homograph of nadar 3sg and adverb nada |
| 65 | w0065 | qué | pronoun | ambiguous | interrogative; accent-distinct from conjunction que |
| 71 | w0071 | tu | determiner | ambiguous | possessive your; accent-distinct from pronoun tú (w0016) |
| 74 | w0074 | todo | determiner | ambiguous | quantifier all; also pronoun/adverb — determiner sense taught |
| 75 | w0075 | mucho | determiner | ambiguous | quantifier much/many; also adverb — determiner sense taught |
| 76 | w0076 | poco | determiner | ambiguous | quantifier little/few; also adverb/noun — determiner sense taught |
| 78 | w0078 | cuánto | determiner | ambiguous | interrogative quantifier how much; accent-distinct from cuanto |
| 79 | w0079 | cómo | adverb | ambiguous | interrogative how; accent-distinct from conjunction como |
| 80 | w0080 | cuándo | adverb | ambiguous | interrogative when; accent-distinct from conjunction cuando |
| 81 | w0081 | dónde | adverb | ambiguous | interrogative where; accent-distinct from relative donde |
| 86 | w0086 | por | preposition | ambiguous | por/para contrast is a core usage note |
| 87 | w0087 | para | preposition | ambiguous | por/para contrast; homograph of parar 3sg |
| 89 | w0089 | sobre | preposition | ambiguous | preposition on/about; also noun (envelope) — prep sense taught |
| 94 | w0094 | si | conjunction | ambiguous | conditional if; accent-distinct from sí (w0013) |
| 95 | w0095 | cuando | conjunction | ambiguous | temporal conjunction; accent-distinct from interrogative cuándo |
| 98 | w0098 | saber | verb | ambiguous | to know (facts); also masc noun el saber — verb sense |
| 109 | w0109 | deber | verb | ambiguous | must/owe; also noun deber/deberes — verb sense taught |
| 149 | w0149 | mañana | noun | ambiguous | noun morning; homograph of adverb mañana (tomorrow) — noun sense |
| 150 | w0150 | tarde | noun | ambiguous | noun afternoon; homograph of adverb tarde (late) — noun sense |
| 163 | w0163 | primero | numeral | ambiguous | ordinal 1st masc sg; apocope primer; also adverb — numeral sense |
| 169 | w0169 | pescado | noun | ambiguous | masc noun fish (food); vs pez (live) and pp of pescar — noun sense |
| 171 | w0171 | vino | noun | ambiguous | masc noun wine; homograph of venir 3sg pret — noun sense |
| 181 | w0181 | cocina | noun | ambiguous | fem noun kitchen; homograph of cocinar 3sg — noun sense |
| 196 | w0196 | trabajo | noun | ambiguous | masc noun work/job; homograph of trabajar 1sg — noun sense |
| 203 | w0203 | pregunta | noun | ambiguous | fem noun question; homograph of preguntar 3sg — noun sense |
| 207 | w0207 | mano | noun | ambiguous | fem despite -o ending (la mano) |
| 218 | w0218 | mar | noun | ambiguous | masc/fem; sea (el mar / la mar both used) |
| 224 | w0224 | bajo | adjective | ambiguous | adjective short/low; also preposition/adverb/noun — adjective sense |
| 237 | w0237 | frío | adjective | ambiguous | adjective cold; also noun el frío — adjective sense taught |
| 249 | w0249 | perdón | interjection | ambiguous | interjection sorry/excuse-me; also masc noun — interjection sense |
| 250 | w0250 | que | conjunction | ambiguous | unaccented conjunction, distinct from interrogative pronoun qué |

### Accent-distinct minimal pairs (distinct lemmas, not duplicates)

Only the listed member is included; its accented/unaccented partner is a separate
lexical item. Consistent with the pilot's `el`/`él` treatment.

- `tu` (determiner, *your*, order 71) vs `tú` (pronoun, `w0016`).
- `si` (conjunction, *if*, **order 94**) vs `sí` (interjection, `w0013`).
- `que` (conjunction, **order 250, `w0250`**) vs `qué` (interrogative pronoun,
  order 65, `w0065`) — **both are included as their own entries**; neither is
  implied by the other.
- `cuando` (conjunction, **order 95**) vs `cuándo` (interrogative adverb, order 80).
- The interrogatives `qué`/`quién`/`cuál`/`cómo`/`cuándo`/`dónde`/`cuánto` are the
  **accented** interrogative lemmas; their unaccented relative partners
  (`como`, `donde`, `cuanto`) are distinct and deferred to a later batch.

## Corpus misses

**None.** All 200 approved word-forms occur in `es_50k.txt`; the rarest hit is
`fruta` (#4693). Raw word-form rank understates a lemma spread across inflected
forms, so a modest rank on an infinitive or singular noun is expected.

## Replacement recommendations

- **Applied:** `vale` (order 250) was replaced by **`que` (conjunction)**. `vale`
  was a colloquial peninsular *OK* with an uncertain POS/register; `que` is a
  core A1 subordinator that every later lesson relies on and was previously
  missing its own entry.
- No other removals. All remaining judgement calls are recorded as `ambiguous`
  above rather than replaced.

## POS distribution (batch 51–250, 200)

| pos | count |
|---|---|
| verb | 38 |
| noun | 77 |
| adjective | 16 |
| adverb | 17 |
| pronoun | 17 |
| determiner | 11 |
| numeral | 11 |
| preposition | 7 |
| conjunction | 4 |
| interjection | 2 |
| **total** | **200** |

## Theme distribution (batch 51–250, 200)

| theme | count |
|---|---|
| verbs: daily actions | 36 |
| adjectives | 16 |
| adverbs | 14 |
| pronouns | 14 |
| food & shopping | 13 |
| numbers | 11 |
| people & relationships | 11 |
| places & transport | 11 |
| determiners | 10 |
| home & housing | 10 |
| work & study | 9 |
| time & date | 8 |
| weather & nature | 8 |
| body & health | 7 |
| interrogatives | 7 |
| prepositions | 7 |
| conjunctions | 4 |
| social | 2 |
| emotions / relationships | 1 |
| general concepts | 1 |

## Curriculum totals after this batch (existing 50 + batch 200 = 250)

| pos | existing (1–50) | batch (51–250) | total |
|---|---|---|---|
| verb | 14 | 38 | 52 |
| noun | 8 | 77 | 85 |
| adjective | 5 | 16 | 21 |
| adverb | 5 | 17 | 22 |
| pronoun | 3 | 17 | 20 |
| determiner | 3 | 11 | 14 |
| numeral | 2 | 11 | 13 |
| preposition | 4 | 7 | 11 |
| conjunction | 3 | 4 | 7 |
| interjection | 3 | 2 | 5 |
| **total** | **50** | **200** | **250** |

## Source methodology

- **Frequency ≠ curriculum order.** hermitdave rank only confirms a word-form
  occurs in real usage; `order` is a human pedagogical decision.
- **Word form ≠ lemma.** `es_50k.txt` is a word-form list; an infinitive or
  singular/masc-sg form understates the lemma. Only lemmas are stored.
- **Division of labour:** **PCIC A1–A2** → suitability, theme, level; **hermitdave**
  → raw word-form cross-check (all 200 present); **RAE/DRAE** → canonical headword
  + POS ambiguity for flagged rows only. Where RAE and the enum diverge, the enum
  (`docs/vocabulary-spec.md` §4) governs storage and the divergence is flagged.
- **Davies is not used.** No data supplied; no rank cited.
- Batch construction was theme-and-level driven (PCIC), not a top-N frequency cut,
  to avoid subtitle noise, proper nouns, and rare/loanword forms.

## Attribution

- **hermitdave/FrequencyWords** — <https://github.com/hermitdave/FrequencyWords>,
  `content/2018/es/es_50k.txt`, from the **OpenSubtitles** corpus. Repository
  *code* is **MIT**; generated frequency *content* is **CC BY-SA 4.0**. Only
  per-word rank/count figures are cited; the full list is not redistributed and
  the downloaded file is not added to Git.
- **RAE** (DLE / Nueva gramática) and **PCIC** (Instituto Cervantes, *Plan
  curricular*, A1–A2) are cited by reference, not reproduced.

