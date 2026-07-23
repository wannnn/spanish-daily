# Vocabulary Curriculum Expansion — Candidate Review (`order` 251–500)

- **Status:** the one-time human review of the third batch is **complete**. Of 250
  candidates, **249 were approved unchanged** and **1 was replaced**
  (`marido` → `profesor`); one further metadata correction was applied
  (`azúcar` → ambiguous). All 250 rows are **approved** and assigned `id`
  `w0251`–`w0500` with `id N` ↔ `order N`. They are written to `vocabulary.json`
  (500 entries total). This file is a **worktable / audit trail**, *not* an
  authoritative contract (the contract is `docs/vocabulary-spec.md`; prior trails
  are `docs/vocabulary-pilot-candidates.md` and
  `docs/vocabulary-expansion-0051-0250.md`).
- **Batch:** 251–500 (this file), following the approved 1–250. Later batches —
  501–750, 751–1000 — reuse the same method.

## Corrections applied at review

1. **Replaced `order` 350:** removed `marido` (noun); added **`profesor` (noun)**,
   A1 · work, study & communication, `confirmed` (masculine citation form;
   feminine `profesora` derived). `esposo` stays at `order` 349.
2. **`azúcar`** canonical status `confirmed` → **`ambiguous`** (noun with variable
   grammatical gender; masculine is common).
3. **Peninsular Spanish choices kept unchanged:** `móvil`, `ordenador`, `patata`,
   consistent with `vosotros` / `coche` from earlier batches.
4. **`claro` kept at `order` 499 as `interjection`** (discourse *of course*); the
   adjective `claro` (*clear/light*) may be added later as a separate
   `(word, pos)` entry.
5. All other candidates approved with their proposed `order` and `pos` unchanged.

## Method (unchanged from the settled batches)

- `vocabulary.json` is a **human-maintained source of truth**; AI proposed
  candidates and a draft order, the **human approved** inclusion and final order.
- **Frequency builds the candidate pool; it is never the curriculum `order`.**
  `order` below is a **teaching sequence** (thematically grouped), not a rank.
- Only **canonical lemmas** are stored (verbs infinitive, nouns singular unless
  inherently plural, adjectives masc. sg.). No inflected forms. `pos` uses the
  existing closed enum (`docs/vocabulary-spec.md` §4); no schema/enum/validation
  change is proposed.
- **hermitdave `content/2018/es/es_50k.txt`** (OpenSubtitles, 2018) gives a raw
  **word-form** rank as a sanity check only (understates lemmas). Downloaded once
  to a scratch path **outside the repo**; **not** added to Git.
- **RAE/DRAE** consulted only for flagged rows; **PCIC A1–A2** gives level and
  theme. Existing `w0001`–`w0250` are unchanged and not duplicated `(word, pos)`.

## Approved entries (`w0251`–`w0500`)

`hermitdave` = raw rank of the exact word-form in `es_50k.txt`. `status` ∈
{confirmed, ambiguous, needs review}.

| order | id | word | pos | PCIC level / theme | hermitdave rank | canonical status | caveat | decision |
|---|---|---|---|---|---|---|---|---|
| 251 | w0251 | entrar | verb | A1 · verbs: daily actions | #438 | confirmed | to enter/go in | approved |
| 252 | w0252 | subir | verb | A1 · verbs: daily actions | #1484 | confirmed | to go up/get on/raise | approved |
| 253 | w0253 | bajar | verb | A1 · verbs: daily actions | #1612 | confirmed | to go down/get off/lower | approved |
| 254 | w0254 | correr | verb | A1 · verbs: daily actions | #1339 | confirmed | to run | approved |
| 255 | w0255 | andar | verb | A2 · verbs: daily actions | #2449 | confirmed | to walk/go; irregular preterite anduve | approved |
| 256 | w0256 | caminar | verb | A1 · verbs: daily actions | #1560 | confirmed | to walk | approved |
| 257 | w0257 | parar | verb | A2 · verbs: daily actions | #1172 | confirmed | to stop | approved |
| 258 | w0258 | seguir | verb | A2 · verbs: daily actions | #512 | confirmed | e>i; g>g spelling; to follow/continue | approved |
| 259 | w0259 | terminar | verb | A1 · verbs: daily actions | #909 | confirmed | to finish | approved |
| 260 | w0260 | acabar | verb | A2 · verbs: daily actions | #1435 | confirmed | to finish; acabar de + inf | approved |
| 261 | w0261 | cambiar | verb | A2 · verbs: daily actions | #699 | confirmed | to change | approved |
| 262 | w0262 | ganar | verb | A1 · verbs: daily actions | #740 | confirmed | to win/earn | approved |
| 263 | w0263 | perder | verb | A2 · verbs: daily actions | #653 | confirmed | e>ie; to lose/miss | approved |
| 264 | w0264 | jugar | verb | A1 · verbs: daily actions | #639 | confirmed | u>ue (only such verb); to play (games) | approved |
| 265 | w0265 | cantar | verb | A1 · verbs: daily actions | #1620 | confirmed | to sing | approved |
| 266 | w0266 | bailar | verb | A1 · verbs: daily actions | #1222 | confirmed | to dance | approved |
| 267 | w0267 | levantar | verb | A1 · verbs: routine | #3516 | confirmed | to raise; reflexive levantarse = to get up | approved |
| 268 | w0268 | lavar | verb | A1 · verbs: routine | #4560 | confirmed | to wash; reflexive lavarse | approved |
| 269 | w0269 | descansar | verb | A2 · verbs: routine | #1937 | confirmed | to rest | approved |
| 270 | w0270 | limpiar | verb | A2 · verbs: routine | #1980 | confirmed | to clean | approved |
| 271 | w0271 | cocinar | verb | A2 · verbs: routine | #3132 | confirmed | to cook | approved |
| 272 | w0272 | recibir | verb | A2 · verbs: daily actions | #1753 | confirmed | to receive | approved |
| 273 | w0273 | enviar | verb | A2 · communication | #1942 | confirmed | í accent in stressed forms; to send | approved |
| 274 | w0274 | mandar | verb | A2 · communication | #3878 | confirmed | to send/order | approved |
| 275 | w0275 | traer | verb | A2 · verbs: daily actions | #1297 | confirmed | irregular; to bring | approved |
| 276 | w0276 | sacar | verb | A2 · verbs: daily actions | #1066 | confirmed | c>qu; to take out/get | approved |
| 277 | w0277 | meter | verb | A2 · verbs: daily actions | #2534 | confirmed | to put in | approved |
| 278 | w0278 | quitar | verb | A2 · verbs: daily actions | #3247 | confirmed | to remove; reflexive quitarse | approved |
| 279 | w0279 | guardar | verb | A2 · verbs: daily actions | #3092 | confirmed | to keep/put away | approved |
| 280 | w0280 | romper | verb | A2 · verbs: daily actions | #1826 | confirmed | irregular pp roto; to break | approved |
| 281 | w0281 | arreglar | verb | A2 · verbs: daily actions | #1583 | confirmed | to fix/tidy | approved |
| 282 | w0282 | crear | verb | A2 · verbs: daily actions | #1981 | confirmed | to create | approved |
| 283 | w0283 | recordar | verb | A2 · verbs: daily actions | #1383 | confirmed | o>ue; to remember | approved |
| 284 | w0284 | olvidar | verb | A2 · verbs: daily actions | #2071 | confirmed | to forget | approved |
| 285 | w0285 | imaginar | verb | A2 · verbs: daily actions | #2296 | confirmed | to imagine | approved |
| 286 | w0286 | soñar | verb | A2 · emotions & states | #5974 | confirmed | o>ue; to dream; soñar con | approved |
| 287 | w0287 | preocupar | verb | A2 · emotions & states | #11762 | confirmed | to worry; reflexive preocuparse | approved |
| 288 | w0288 | doler | verb | A2 · body & health | #7661 | confirmed | o>ue; like gustar (me duele) | approved |
| 289 | w0289 | encantar | verb | A2 · emotions & states | #6805 | confirmed | like gustar (me encanta) | approved |
| 290 | w0290 | importar | verb | A2 · emotions & states | #3519 | confirmed | to matter; like gustar | approved |
| 291 | w0291 | interesar | verb | A2 · emotions & states | #20674 | confirmed | to interest; like gustar | approved |
| 292 | w0292 | enseñar | verb | A1 · work, study & communication | #3179 | confirmed | to teach/show | approved |
| 293 | w0293 | pagar | verb | A1 · food & shopping | #775 | confirmed | g>gu; to pay | approved |
| 294 | w0294 | vender | verb | A1 · food & shopping | #1522 | confirmed | to sell | approved |
| 295 | w0295 | gastar | verb | A2 · food & shopping | #4902 | confirmed | to spend | approved |
| 296 | w0296 | preparar | verb | A2 · verbs: daily actions | #2987 | confirmed | to prepare | approved |
| 297 | w0297 | explicar | verb | A2 · work, study & communication | #1982 | confirmed | c>qu; to explain | approved |
| 298 | w0298 | contar | verb | A2 · work, study & communication | #1264 | confirmed | o>ue; to count/tell | approved |
| 299 | w0299 | repetir | verb | A2 · work, study & communication | #5482 | confirmed | e>i; to repeat | approved |
| 300 | w0300 | decidir | verb | A2 · verbs: daily actions | #2560 | confirmed | to decide | approved |
| 301 | w0301 | intentar | verb | A2 · verbs: daily actions | #1347 | confirmed | to try | approved |
| 302 | w0302 | conseguir | verb | A2 · verbs: daily actions | #560 | confirmed | e>i; g>g; to get/achieve | approved |
| 303 | w0303 | parecer | verb | A2 · verbs: daily actions | #1211 | ambiguous | c>zc; to seem; also masc noun el parecer — verb sense | approved |
| 304 | w0304 | quedar | verb | A2 · verbs: daily actions | #1290 | confirmed | to remain/arrange to meet; reflexive quedarse | approved |
| 305 | w0305 | invitar | verb | A2 · work, study & communication | #5616 | confirmed | to invite | approved |
| 306 | w0306 | saludar | verb | A2 · work, study & communication | #5604 | confirmed | to greet | approved |
| 307 | w0307 | llorar | verb | A2 · emotions & states | #1595 | confirmed | to cry | approved |
| 308 | w0308 | reír | verb | A2 · emotions & states | #3669 | confirmed | e>i; to laugh; infinitive carries accent (reír) | approved |
| 309 | w0309 | amarillo | adjective | A1 · adjectives | #4254 | confirmed | masc sg; yellow | approved |
| 310 | w0310 | gris | adjective | A2 · adjectives | #4398 | confirmed | invariable in gender; grey | approved |
| 311 | w0311 | marrón | adjective | A2 · adjectives | #6305 | confirmed | invariable in gender; brown | approved |
| 312 | w0312 | caliente | adjective | A1 · adjectives | #1098 | confirmed | invariable in gender; hot | approved |
| 313 | w0313 | corto | adjective | A1 · adjectives | #2224 | ambiguous | adjective short; homograph of cortar 1sg — adjective sense | approved |
| 314 | w0314 | lleno | adjective | A2 · adjectives | #1173 | confirmed | masc sg; full | approved |
| 315 | w0315 | vacío | adjective | A2 · adjectives | #2247 | confirmed | masc sg; empty | approved |
| 316 | w0316 | limpio | adjective | A1 · adjectives | #1872 | confirmed | masc sg; clean | approved |
| 317 | w0317 | sucio | adjective | A1 · adjectives | #2164 | confirmed | masc sg; dirty | approved |
| 318 | w0318 | seco | adjective | A2 · adjectives | #4361 | ambiguous | adjective dry; homograph of secar 1sg — adjective sense | approved |
| 319 | w0319 | duro | adjective | A2 · adjectives | #618 | confirmed | masc sg; hard | approved |
| 320 | w0320 | caro | adjective | A1 · food & shopping | #3034 | confirmed | masc sg; expensive | approved |
| 321 | w0321 | barato | adjective | A1 · food & shopping | #3627 | confirmed | masc sg; cheap | approved |
| 322 | w0322 | rico | adjective | A2 · adjectives | #1396 | confirmed | masc sg; rich/tasty | approved |
| 323 | w0323 | pobre | adjective | A2 · adjectives | #756 | confirmed | invariable in gender; poor | approved |
| 324 | w0324 | fuerte | adjective | A2 · adjectives | #465 | confirmed | invariable in gender; strong | approved |
| 325 | w0325 | débil | adjective | A2 · adjectives | #1954 | confirmed | invariable in gender; weak | approved |
| 326 | w0326 | rápido | adjective | A1 · adjectives | #311 | ambiguous | adjective fast; also used adverbially — adjective sense | approved |
| 327 | w0327 | lento | adjective | A2 · adjectives | #3076 | confirmed | masc sg; slow | approved |
| 328 | w0328 | posible | adjective | A2 · adjectives | #455 | confirmed | invariable in gender; possible | approved |
| 329 | w0329 | imposible | adjective | A2 · adjectives | #834 | confirmed | invariable in gender; impossible | approved |
| 330 | w0330 | necesario | adjective | A2 · adjectives | #880 | confirmed | masc sg; necessary | approved |
| 331 | w0331 | verdadero | adjective | A2 · adjectives | #954 | confirmed | masc sg; true/real | approved |
| 332 | w0332 | oscuro | adjective | A2 · adjectives | #1766 | confirmed | masc sg; dark | approved |
| 333 | w0333 | guapo | adjective | A1 · adjectives | #1986 | confirmed | masc sg; good-looking | approved |
| 334 | w0334 | feo | adjective | A1 · adjectives | #2907 | confirmed | masc sg; ugly | approved |
| 335 | w0335 | simpático | adjective | A1 · adjectives | #6124 | confirmed | masc sg; nice/likeable | approved |
| 336 | w0336 | amable | adjective | A2 · adjectives | #919 | confirmed | invariable in gender; kind | approved |
| 337 | w0337 | inteligente | adjective | A2 · adjectives | #1019 | confirmed | invariable in gender; intelligent | approved |
| 338 | w0338 | contento | adjective | A1 · emotions & states | #1809 | confirmed | masc sg; happy/glad (used with estar) | approved |
| 339 | w0339 | triste | adjective | A1 · emotions & states | #987 | confirmed | invariable in gender; sad | approved |
| 340 | w0340 | cansado | adjective | A1 · emotions & states | #1469 | ambiguous | adjective tired; also pp of cansar — adjective sense | approved |
| 341 | w0341 | enfermo | adjective | A1 · emotions & states | #1184 | confirmed | masc sg; ill (also noun the patient) | approved |
| 342 | w0342 | sano | adjective | A2 · emotions & states | #4063 | confirmed | masc sg; healthy | approved |
| 343 | w0343 | tranquilo | adjective | A2 · emotions & states | #804 | confirmed | masc sg; calm | approved |
| 344 | w0344 | ocupado | adjective | A2 · emotions & states | #1191 | ambiguous | adjective busy; also pp of ocupar — adjective sense | approved |
| 345 | w0345 | libre | adjective | A2 · adjectives | #634 | confirmed | invariable in gender; free | approved |
| 346 | w0346 | diferente | adjective | A2 · adjectives | #694 | confirmed | invariable in gender; different | approved |
| 347 | w0347 | igual | adjective | A2 · adjectives | #425 | ambiguous | adjective equal/same; also adverb — adjective sense | approved |
| 348 | w0348 | último | adjective | A2 · adjectives | #542 | confirmed | masc sg; last | approved |
| 349 | w0349 | esposo | noun | A2 · people & relationships | #950 | confirmed | masc citation; fem esposa derived; husband | approved |
| 350 | w0350 | profesor | noun | A1 · work, study & communication | #562 | confirmed | masculine citation form; feminine profesora derived | approved |
| 351 | w0351 | pareja | noun | A2 · people & relationships | #1330 | confirmed | fem; couple/partner (either gender) | approved |
| 352 | w0352 | novio | noun | A2 · people & relationships | #836 | confirmed | masc citation; fem novia derived; boyfriend | approved |
| 353 | w0353 | jefe | noun | A2 · work, study & communication | #357 | confirmed | masc citation; fem jefa derived; boss | approved |
| 354 | w0354 | vecino | noun | A2 · people & relationships | #3260 | confirmed | masc citation; fem vecina derived; neighbour | approved |
| 355 | w0355 | estudiante | noun | A1 · work, study & communication | #2250 | confirmed | common gender (el/la estudiante) | approved |
| 356 | w0356 | miedo | noun | A2 · emotions & states | #356 | confirmed | masc; fear (tener miedo) | approved |
| 357 | w0357 | alegría | noun | A2 · emotions & states | #2328 | confirmed | fem; joy | approved |
| 358 | w0358 | suerte | noun | A2 · emotions & states | #335 | confirmed | fem; luck (tener suerte) | approved |
| 359 | w0359 | sueño | noun | A2 · emotions & states | #722 | ambiguous | masc noun sleep/dream; homograph of soñar 1sg — noun sense | approved |
| 360 | w0360 | hambre | noun | A1 · emotions & states | #826 | ambiguous | fem but el hambre in sg (stressed a-); tener hambre | approved |
| 361 | w0361 | sed | noun | A2 · emotions & states | #3476 | confirmed | fem; thirst (tener sed) | approved |
| 362 | w0362 | dolor | noun | A2 · body & health | #733 | confirmed | masc; pain | approved |
| 363 | w0363 | cara | noun | A1 · body & health | #378 | ambiguous | fem noun face; homograph of fem of adjective caro — noun sense | approved |
| 364 | w0364 | pie | noun | A1 · body & health | #738 | confirmed | masc; foot (a pie) | approved |
| 365 | w0365 | brazo | noun | A2 · body & health | #1378 | confirmed | masc; arm | approved |
| 366 | w0366 | pierna | noun | A2 · body & health | #1676 | confirmed | fem; leg | approved |
| 367 | w0367 | dedo | noun | A2 · body & health | #1889 | confirmed | masc; finger/toe | approved |
| 368 | w0368 | boca | noun | A2 · body & health | #705 | confirmed | fem; mouth | approved |
| 369 | w0369 | nariz | noun | A2 · body & health | #1693 | confirmed | fem; nose | approved |
| 370 | w0370 | diente | noun | A2 · body & health | #5809 | confirmed | masc; tooth | approved |
| 371 | w0371 | pelo | noun | A1 · body & health | #785 | confirmed | masc; hair | approved |
| 372 | w0372 | espalda | noun | A2 · body & health | #1136 | confirmed | fem; back | approved |
| 373 | w0373 | enfermedad | noun | A2 · health & medicine | #1607 | confirmed | fem; illness | approved |
| 374 | w0374 | fiebre | noun | A2 · health & medicine | #3120 | confirmed | fem; fever | approved |
| 375 | w0375 | medicina | noun | A2 · health & medicine | #1838 | confirmed | fem; medicine | approved |
| 376 | w0376 | pastilla | noun | A2 · health & medicine | #8797 | confirmed | fem; pill | approved |
| 377 | w0377 | farmacia | noun | A2 · health & medicine | #6877 | confirmed | fem; pharmacy | approved |
| 378 | w0378 | ropa | noun | A1 · clothing & objects | #652 | confirmed | fem; clothes (uncountable sg) | approved |
| 379 | w0379 | camisa | noun | A1 · clothing & objects | #2116 | confirmed | fem; shirt | approved |
| 380 | w0380 | camiseta | noun | A1 · clothing & objects | #3926 | confirmed | fem; t-shirt | approved |
| 381 | w0381 | pantalón | noun | A1 · clothing & objects | #9783 | ambiguous | masc; usually plural pantalones — singular lemma stored | approved |
| 382 | w0382 | falda | noun | A1 · clothing & objects | #6436 | confirmed | fem; skirt | approved |
| 383 | w0383 | vestido | noun | A1 · clothing & objects | #1018 | ambiguous | masc noun dress; also pp of vestir — noun sense | approved |
| 384 | w0384 | zapato | noun | A1 · clothing & objects | #4628 | confirmed | masc; shoe | approved |
| 385 | w0385 | abrigo | noun | A2 · clothing & objects | #2475 | confirmed | masc; coat | approved |
| 386 | w0386 | chaqueta | noun | A2 · clothing & objects | #2451 | confirmed | fem; jacket | approved |
| 387 | w0387 | gafas | noun | A2 · clothing & objects | #3673 | ambiguous | fem; inherently plural — plural is the citation form (spec §3) | approved |
| 388 | w0388 | móvil | noun | A1 · clothing & objects | #2244 | ambiguous | masc noun mobile phone (Spain); also adjective — noun sense | approved |
| 389 | w0389 | ordenador | noun | A1 · clothing & objects | #3218 | confirmed | masc; computer (Spain) | approved |
| 390 | w0390 | televisión | noun | A1 · clothing & objects | #1561 | confirmed | fem; television | approved |
| 391 | w0391 | llave | noun | A2 · home & objects | #1131 | confirmed | fem; key | approved |
| 392 | w0392 | luz | noun | A2 · home & objects | #551 | confirmed | fem; light; plural luces | approved |
| 393 | w0393 | pared | noun | A2 · home & objects | #1574 | confirmed | fem; wall | approved |
| 394 | w0394 | vaso | noun | A1 · home & objects | #2522 | confirmed | masc; glass (drinking) | approved |
| 395 | w0395 | plato | noun | A1 · home & objects | #2257 | confirmed | masc; plate/dish | approved |
| 396 | w0396 | desayuno | noun | A1 · food & shopping | #1953 | confirmed | masc; breakfast | approved |
| 397 | w0397 | cena | noun | A1 · food & shopping | #797 | ambiguous | fem noun dinner; homograph of cenar 3sg — noun sense | approved |
| 398 | w0398 | sopa | noun | A2 · food & shopping | #2648 | confirmed | fem; soup | approved |
| 399 | w0399 | ensalada | noun | A2 · food & shopping | #4192 | confirmed | fem; salad | approved |
| 400 | w0400 | pollo | noun | A1 · food & shopping | #1858 | confirmed | masc; chicken | approved |
| 401 | w0401 | verdura | noun | A2 · food & shopping | #24570 | confirmed | fem; vegetable(s) | approved |
| 402 | w0402 | patata | noun | A2 · food & shopping | #10719 | confirmed | fem; potato (Spain) | approved |
| 403 | w0403 | tomate | noun | A2 · food & shopping | #6660 | confirmed | masc; tomato | approved |
| 404 | w0404 | manzana | noun | A2 · food & shopping | #3475 | confirmed | fem; apple (also city block) | approved |
| 405 | w0405 | azúcar | noun | A2 · food & shopping | #2630 | ambiguous | noun with variable grammatical gender; masculine is common | approved |
| 406 | w0406 | queso | noun | A1 · food & shopping | #2030 | confirmed | masc; cheese | approved |
| 407 | w0407 | supermercado | noun | A1 · shopping & money | #6786 | confirmed | masc; supermarket | approved |
| 408 | w0408 | euro | noun | A1 · shopping & money | #30398 | confirmed | masc; euro | approved |
| 409 | w0409 | tarjeta | noun | A2 · shopping & money | #1336 | confirmed | fem; card | approved |
| 410 | w0410 | cuenta | noun | A2 · shopping & money | #262 | ambiguous | fem noun bill/account; homograph of contar 3sg — noun sense | approved |
| 411 | w0411 | precio | noun | A1 · shopping & money | #1230 | confirmed | masc; price | approved |
| 412 | w0412 | plaza | noun | A2 · city & places | #3505 | confirmed | fem; square | approved |
| 413 | w0413 | parque | noun | A1 · city & places | #1646 | confirmed | masc; park | approved |
| 414 | w0414 | banco | noun | A1 · city & places | #1103 | ambiguous | masc; two senses bank/bench — same lemma, noted | approved |
| 415 | w0415 | iglesia | noun | A2 · city & places | #1000 | confirmed | fem; church | approved |
| 416 | w0416 | museo | noun | A2 · city & places | #3190 | confirmed | masc; museum | approved |
| 417 | w0417 | cine | noun | A1 · city & places | #1406 | confirmed | masc; cinema | approved |
| 418 | w0418 | bar | noun | A1 · city & places | #1024 | confirmed | masc; bar | approved |
| 419 | w0419 | hotel | noun | A1 · city & places | #764 | confirmed | masc; hotel | approved |
| 420 | w0420 | aeropuerto | noun | A2 · transport & travel | #2069 | confirmed | masc; airport | approved |
| 421 | w0421 | estación | noun | A1 · transport & travel | #1179 | confirmed | fem; station/season | approved |
| 422 | w0422 | playa | noun | A1 · city & places | #1619 | confirmed | fem; beach | approved |
| 423 | w0423 | metro | noun | A1 · transport & travel | #3230 | confirmed | masc; metro/metre | approved |
| 424 | w0424 | barco | noun | A2 · transport & travel | #849 | confirmed | masc; boat/ship | approved |
| 425 | w0425 | bicicleta | noun | A1 · transport & travel | #3371 | confirmed | fem; bicycle | approved |
| 426 | w0426 | moto | noun | A2 · transport & travel | #3274 | ambiguous | fem despite -o; apocope of motocicleta | approved |
| 427 | w0427 | taxi | noun | A1 · transport & travel | #1504 | confirmed | masc; taxi | approved |
| 428 | w0428 | viaje | noun | A1 · transport & travel | #626 | ambiguous | masc noun trip; homograph of viajar subjunctive — noun sense | approved |
| 429 | w0429 | oficina | noun | A1 · work, study & communication | #537 | confirmed | fem; office | approved |
| 430 | w0430 | empresa | noun | A2 · work, study & communication | #1458 | confirmed | fem; company | approved |
| 431 | w0431 | reunión | noun | A2 · work, study & communication | #855 | confirmed | fem; meeting | approved |
| 432 | w0432 | proyecto | noun | A2 · work, study & communication | #1573 | confirmed | masc; project | approved |
| 433 | w0433 | examen | noun | A1 · work, study & communication | #2024 | confirmed | masc; exam; plural exámenes | approved |
| 434 | w0434 | curso | noun | A1 · work, study & communication | #2186 | confirmed | masc; course | approved |
| 435 | w0435 | universidad | noun | A1 · work, study & communication | #868 | confirmed | fem; university | approved |
| 436 | w0436 | música | noun | A1 · work, study & communication | #577 | confirmed | fem; music | approved |
| 437 | w0437 | película | noun | A1 · work, study & communication | #641 | confirmed | fem; film | approved |
| 438 | w0438 | mensaje | noun | A1 · work, study & communication | #691 | confirmed | masc; message | approved |
| 439 | w0439 | animal | noun | A1 · weather, nature & animals | #1722 | confirmed | masc; animal | approved |
| 440 | w0440 | pájaro | noun | A2 · weather, nature & animals | #2821 | confirmed | masc; bird | approved |
| 441 | w0441 | caballo | noun | A2 · weather, nature & animals | #1021 | confirmed | masc; horse | approved |
| 442 | w0442 | flor | noun | A1 · weather, nature & animals | #3172 | confirmed | fem; flower | approved |
| 443 | w0443 | planta | noun | A2 · weather, nature & animals | #2372 | ambiguous | fem noun plant/floor; homograph of plantar 3sg — noun sense | approved |
| 444 | w0444 | tierra | noun | A2 · weather, nature & animals | #421 | confirmed | fem; earth/land | approved |
| 445 | w0445 | luna | noun | A2 · weather, nature & animals | #1042 | confirmed | fem; moon | approved |
| 446 | w0446 | estrella | noun | A2 · weather, nature & animals | #1183 | confirmed | fem; star | approved |
| 447 | w0447 | viento | noun | A2 · weather, nature & animals | #1658 | confirmed | masc; wind (hace viento) | approved |
| 448 | w0448 | nieve | noun | A2 · weather, nature & animals | #2273 | confirmed | fem; snow | approved |
| 449 | w0449 | momento | noun | A1 · time & quantity | #167 | confirmed | masc; moment | approved |
| 450 | w0450 | vez | noun | A1 · time & quantity | #71 | confirmed | fem; time/occasion; plural veces | approved |
| 451 | w0451 | final | noun | A2 · time & quantity | #445 | ambiguous | masc noun end; also adjective — noun sense | approved |
| 452 | w0452 | fecha | noun | A1 · time & quantity | #2275 | ambiguous | fem noun date; homograph of fechar 3sg — noun sense | approved |
| 453 | w0453 | edad | noun | A1 · time & quantity | #736 | confirmed | fem; age | approved |
| 454 | w0454 | parte | noun | A2 · general concepts | #211 | ambiguous | fem noun part; homograph of partir 3sg and masc el parte — fem noun sense | approved |
| 455 | w0455 | mitad | noun | A2 · time & quantity | #783 | confirmed | fem; half | approved |
| 456 | w0456 | número | noun | A1 · time & quantity | #458 | confirmed | masc; number | approved |
| 457 | w0457 | verdad | noun | A1 · general concepts | #90 | confirmed | fem; truth (¿verdad?) | approved |
| 458 | w0458 | mentira | noun | A2 · general concepts | #1335 | confirmed | fem; lie | approved |
| 459 | w0459 | manera | noun | A2 · general concepts | #308 | confirmed | fem; way/manner | approved |
| 460 | w0460 | forma | noun | A2 · general concepts | #283 | ambiguous | fem noun form/shape; homograph of formar 3sg — noun sense | approved |
| 461 | w0461 | razón | noun | A2 · general concepts | #233 | confirmed | fem; reason (tener razón) | approved |
| 462 | w0462 | color | noun | A1 · general concepts | #1207 | confirmed | masc; colour | approved |
| 463 | w0463 | entonces | adverb | A1 · adverbs | #87 | confirmed | then/so | approved |
| 464 | w0464 | luego | adverb | A1 · adverbs | #197 | confirmed | later/then | approved |
| 465 | w0465 | temprano | adverb | A2 · adverbs | #1085 | confirmed | early | approved |
| 466 | w0466 | pronto | adverb | A1 · adverbs | #333 | confirmed | soon | approved |
| 467 | w0467 | casi | adverb | A1 · adverbs | #320 | confirmed | almost | approved |
| 468 | w0468 | demasiado | adverb | A2 · adverbs | #249 | ambiguous | adverb too much; also determiner — adverb sense | approved |
| 469 | w0469 | bastante | adverb | A2 · adverbs | #385 | ambiguous | adverb quite/enough; also determiner — adverb sense | approved |
| 470 | w0470 | además | adverb | A2 · adverbs | #541 | confirmed | besides/moreover | approved |
| 471 | w0471 | incluso | adverb | A2 · adverbs | #401 | confirmed | even | approved |
| 472 | w0472 | quizás | adverb | A2 · adverbs | #328 | confirmed | maybe (also quizá) | approved |
| 473 | w0473 | arriba | adverb | A2 · adverbs | #420 | confirmed | up/above | approved |
| 474 | w0474 | abajo | adverb | A2 · adverbs | #462 | confirmed | down/below | approved |
| 475 | w0475 | fuera | adverb | A2 · adverbs | #160 | ambiguous | adverb outside; homograph of ser/ir imperfect subj — adverb sense | approved |
| 476 | w0476 | dentro | adverb | A2 · adverbs | #319 | confirmed | inside; dentro de | approved |
| 477 | w0477 | once | numeral | A1 · numbers | #4019 | confirmed | cardinal 11 | approved |
| 478 | w0478 | doce | numeral | A1 · numbers | #2827 | confirmed | cardinal 12 | approved |
| 479 | w0479 | trece | numeral | A2 · numbers | #7996 | confirmed | cardinal 13 | approved |
| 480 | w0480 | quince | numeral | A2 · numbers | #3660 | confirmed | cardinal 15 | approved |
| 481 | w0481 | veinte | numeral | A1 · numbers | #2499 | confirmed | cardinal 20 | approved |
| 482 | w0482 | treinta | numeral | A2 · numbers | #3276 | confirmed | cardinal 30 | approved |
| 483 | w0483 | segundo | numeral | A2 · numbers | #480 | ambiguous | ordinal 2nd masc sg; also masc noun second (time) — numeral sense | approved |
| 484 | w0484 | tercero | numeral | A2 · numbers | #4763 | ambiguous | ordinal 3rd masc sg; apocope tercer — numeral sense | approved |
| 485 | w0485 | le | pronoun | A2 · pronouns | #37 | confirmed | indirect-object clitic (to him/her/you-formal) | approved |
| 486 | w0486 | eso | pronoun | A1 · pronouns | #27 | confirmed | neuter demonstrative pronoun (that) | approved |
| 487 | w0487 | nos | pronoun | A2 · pronouns | #57 | confirmed | 1st plural object/reflexive clitic | approved |
| 488 | w0488 | cada | determiner | A1 · determiners | #227 | confirmed | invariable distributive each/every | approved |
| 489 | w0489 | tanto | determiner | A2 · determiners | #235 | ambiguous | quantifier so much/many; also adverb/pronoun — determiner sense | approved |
| 490 | w0490 | cualquier | determiner | A2 · determiners | #282 | ambiguous | apocope of cualquiera before a noun (any) | approved |
| 491 | w0491 | vuestro | determiner | A2 · determiners | #1445 | confirmed | possessive your-plural (peninsular); agreement derived | approved |
| 492 | w0492 | durante | preposition | A2 · prepositions | #306 | confirmed | during/for | approved |
| 493 | w0493 | según | preposition | A2 · prepositions | #991 | ambiguous | preposition according to; also adverb/conjunction — prep sense | approved |
| 494 | w0494 | contra | preposition | A2 · prepositions | #304 | confirmed | against | approved |
| 495 | w0495 | hacia | preposition | A2 · prepositions | #327 | confirmed | towards | approved |
| 496 | w0496 | aunque | conjunction | A2 · conjunctions | #405 | confirmed | although/even though | approved |
| 497 | w0497 | mientras | conjunction | A2 · conjunctions | #284 | ambiguous | conjunction while; also adverb — conjunction sense | approved |
| 498 | w0498 | ni | conjunction | A2 · conjunctions | #132 | confirmed | nor/not even (ni...ni) | approved |
| 499 | w0499 | claro | interjection | A1 · social | #166 | ambiguous | discourse of course; also adjective/adverb — interjection sense taught | approved |
| 500 | w0500 | ojalá | interjection | A2 · social | #1280 | confirmed | expresses hope; triggers subjunctive | approved |

## Ambiguous / needs-review items

35 of 250 rows are flagged — homographs / multi-POS forms where the
stored sense is a deliberate choice, plus gendered-irregular and inherently-plural
nouns. All are approved; the flag records what a human confirmed.

| order | id | word | pos | status | why it is flagged |
|---|---|---|---|---|---|
| 303 | w0303 | parecer | verb | ambiguous | c>zc; to seem; also masc noun el parecer — verb sense |
| 313 | w0313 | corto | adjective | ambiguous | adjective short; homograph of cortar 1sg — adjective sense |
| 318 | w0318 | seco | adjective | ambiguous | adjective dry; homograph of secar 1sg — adjective sense |
| 326 | w0326 | rápido | adjective | ambiguous | adjective fast; also used adverbially — adjective sense |
| 340 | w0340 | cansado | adjective | ambiguous | adjective tired; also pp of cansar — adjective sense |
| 344 | w0344 | ocupado | adjective | ambiguous | adjective busy; also pp of ocupar — adjective sense |
| 347 | w0347 | igual | adjective | ambiguous | adjective equal/same; also adverb — adjective sense |
| 359 | w0359 | sueño | noun | ambiguous | masc noun sleep/dream; homograph of soñar 1sg — noun sense |
| 360 | w0360 | hambre | noun | ambiguous | fem but el hambre in sg (stressed a-); tener hambre |
| 363 | w0363 | cara | noun | ambiguous | fem noun face; homograph of fem of adjective caro — noun sense |
| 381 | w0381 | pantalón | noun | ambiguous | masc; usually plural pantalones — singular lemma stored |
| 383 | w0383 | vestido | noun | ambiguous | masc noun dress; also pp of vestir — noun sense |
| 387 | w0387 | gafas | noun | ambiguous | fem; inherently plural — plural is the citation form (spec §3) |
| 388 | w0388 | móvil | noun | ambiguous | masc noun mobile phone (Spain); also adjective — noun sense |
| 397 | w0397 | cena | noun | ambiguous | fem noun dinner; homograph of cenar 3sg — noun sense |
| 405 | w0405 | azúcar | noun | ambiguous | noun with variable grammatical gender; masculine is common |
| 410 | w0410 | cuenta | noun | ambiguous | fem noun bill/account; homograph of contar 3sg — noun sense |
| 414 | w0414 | banco | noun | ambiguous | masc; two senses bank/bench — same lemma, noted |
| 426 | w0426 | moto | noun | ambiguous | fem despite -o; apocope of motocicleta |
| 428 | w0428 | viaje | noun | ambiguous | masc noun trip; homograph of viajar subjunctive — noun sense |
| 443 | w0443 | planta | noun | ambiguous | fem noun plant/floor; homograph of plantar 3sg — noun sense |
| 451 | w0451 | final | noun | ambiguous | masc noun end; also adjective — noun sense |
| 452 | w0452 | fecha | noun | ambiguous | fem noun date; homograph of fechar 3sg — noun sense |
| 454 | w0454 | parte | noun | ambiguous | fem noun part; homograph of partir 3sg and masc el parte — fem noun sense |
| 460 | w0460 | forma | noun | ambiguous | fem noun form/shape; homograph of formar 3sg — noun sense |
| 468 | w0468 | demasiado | adverb | ambiguous | adverb too much; also determiner — adverb sense |
| 469 | w0469 | bastante | adverb | ambiguous | adverb quite/enough; also determiner — adverb sense |
| 475 | w0475 | fuera | adverb | ambiguous | adverb outside; homograph of ser/ir imperfect subj — adverb sense |
| 483 | w0483 | segundo | numeral | ambiguous | ordinal 2nd masc sg; also masc noun second (time) — numeral sense |
| 484 | w0484 | tercero | numeral | ambiguous | ordinal 3rd masc sg; apocope tercer — numeral sense |
| 489 | w0489 | tanto | determiner | ambiguous | quantifier so much/many; also adverb/pronoun — determiner sense |
| 490 | w0490 | cualquier | determiner | ambiguous | apocope of cualquiera before a noun (any) |
| 493 | w0493 | según | preposition | ambiguous | preposition according to; also adverb/conjunction — prep sense |
| 497 | w0497 | mientras | conjunction | ambiguous | conjunction while; also adverb — conjunction sense |
| 499 | w0499 | claro | interjection | ambiguous | discourse of course; also adjective/adverb — interjection sense taught |

**Recurring pattern — noun ↔ verb-form homographs.** Several everyday nouns share a
spelling with a conjugated verb form (`cuenta`/contar, `cena`/cenar, `forma`/formar,
`planta`/plantar, `fecha`/fechar, `viaje`/viajar, `parte`/partir, `sueño`/soñar,
`vestido`/vestir). The **noun lemma** is the stored sense; the verb is either
already in the curriculum or a separate future lemma. Legitimate under the schema
(a duplicate `word` string with a different `pos` is allowed;
`docs/vocabulary-spec.md` §4–§5) and none collide `(word, pos)` with an existing
entry.

## Corpus misses

**None.** All 250 word-forms occur in `es_50k.txt`. The rarest hits are `euro`
(#30398), `verdura` (#24570), and the gustar-type infinitives `interesar` (#20674)
/ `preocupar` (#11762) — expected word-form artefacts (subtitle corpora favour
plural forms `euros`/`verduras`/`patatas`; gustar-type verbs concentrate usage on
3sg `me interesa`), so the lemma is understated, not rare.

## Replacement recommendations

- **Applied:** `marido` (order 350) was replaced by **`profesor` (noun)** — a
  higher-value everyday role noun that also introduces the masc/fem citation
  pattern (`profesor`/`profesora`); `esposo` already covers the spouse sense.
- No other removals. Peninsular forms (`móvil`, `ordenador`, `patata`) are kept
  deliberately, consistent with the curriculum's existing peninsular choices.
  `claro` stays as `interjection`; the adjective sense is a future separate entry.

## POS distribution (batch 251–500, 250)

| pos | count |
|---|---|
| verb | 58 |
| noun | 114 |
| adjective | 40 |
| adverb | 14 |
| pronoun | 3 |
| determiner | 4 |
| numeral | 8 |
| preposition | 4 |
| conjunction | 3 |
| interjection | 2 |
| **total** | **250** |

## Theme distribution (batch 251–500, 250)

| theme | count |
|---|---|
| verbs: daily actions | 34 |
| adjectives | 31 |
| emotions & states | 20 |
| work, study & communication | 19 |
| food & shopping | 16 |
| adverbs | 14 |
| clothing & objects | 13 |
| body & health | 12 |
| weather, nature & animals | 10 |
| city & places | 9 |
| numbers | 8 |
| transport & travel | 8 |
| general concepts | 7 |
| time & quantity | 7 |
| health & medicine | 5 |
| home & objects | 5 |
| shopping & money | 5 |
| verbs: routine | 5 |
| determiners | 4 |
| people & relationships | 4 |
| prepositions | 4 |
| conjunctions | 3 |
| pronouns | 3 |
| communication | 2 |
| social | 2 |

## Curriculum totals after this batch (existing 250 + batch 250 = 500)

| pos | existing (1–250) | batch (251–500) | total |
|---|---|---|---|
| verb | 52 | 58 | 110 |
| noun | 85 | 114 | 199 |
| adjective | 21 | 40 | 61 |
| adverb | 22 | 14 | 36 |
| pronoun | 20 | 3 | 23 |
| determiner | 14 | 4 | 18 |
| numeral | 13 | 8 | 21 |
| preposition | 11 | 4 | 15 |
| conjunction | 7 | 3 | 10 |
| interjection | 5 | 2 | 7 |
| **total** | **250** | **250** | **500** |

## Source methodology

- **Frequency ≠ curriculum order.** hermitdave rank only confirms a word-form
  occurs in real usage; `order` is a human pedagogical decision.
- **Word form ≠ lemma.** `es_50k.txt` is a word-form list; infinitives, singular
  nouns, and masc-sg adjectives understate their lemmas. Only lemmas are stored.
- **Division of labour:** **PCIC A1–A2** → suitability, theme, level; **hermitdave**
  → raw word-form cross-check (all 250 present); **RAE/DRAE** → canonical headword
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

