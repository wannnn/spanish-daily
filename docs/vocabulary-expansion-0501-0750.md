# Vocabulary Curriculum Expansion — Candidate Review (`order` 501–750)

- **Status:** the one-time human review of the fourth batch is **complete**. All
  **250 candidates were approved**, with two metadata corrections (`medio` → stored
  as `adjective`; a stale `bajo` id reference fixed to the real `w0224`). All 250
  rows are **approved** and assigned `id` `w0501`–`w0750` with `id N` ↔ `order N`.
  They are written to `vocabulary.json` (750 entries total). This file is a
  **worktable / audit trail**, *not* an authoritative contract (the contract is
  `docs/vocabulary-spec.md`; prior trails are `docs/vocabulary-pilot-candidates.md`,
  `docs/vocabulary-expansion-0051-0250.md`, `docs/vocabulary-expansion-0251-0500.md`).
- **Batch:** 501–750 (this file), following the approved 1–500. The final batch —
  751–1000 — reuses the same method.

## Corrections applied at review

1. **`medio` (order 740) stored as `adjective`, not `determiner`** — `status:
   ambiguous`; caveat: masculine singular adjective meaning *half*; feminine
   *media* is derived; also functions as adverb and noun in other senses. (Theme
   moved from *determiners* to *adjectives* to match.)
2. **Stale `bajo` id reference fixed.** The existing adjective `bajo` was looked up
   in `vocabulary.json` and is **`w0224`** (not the earlier draft's `w0056`, which
   is actually `me`/pronoun). Every `bajo` id reference in this file now uses
   `w0224`.
3. **`quejar` kept as `verb`** — the stored canonical lemma remains the bare
   infinitive `quejar`; the complaint meaning is normally pronominal `quejarse`
   (recorded in the caveat). The stored word is not changed to `quejarse`.
4. **Kept unchanged:** all Peninsular Spanish choices, `vaya` as `interjection`,
   and every other candidate's order and POS.

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
  **word-form** rank as a sanity check only (understates lemmas). Reused from the
  earlier batches at a scratch path **outside the repo**; **not** added to Git.
- **RAE/DRAE** consulted only for flagged rows; **PCIC A1–A2** gives level and
  theme. Existing `w0001`–`w0500` are unchanged and not duplicated `(word, pos)`.

## Approved entries (`w0501`–`w0750`)

`hermitdave` = raw rank of the exact word-form in `es_50k.txt`. `status` ∈
{confirmed, ambiguous, needs review}.

| order | id | word | pos | PCIC level / theme | hermitdave rank | canonical status | caveat | decision |
|---|---|---|---|---|---|---|---|---|
| 501 | w0501 | comprender | verb | A2 · verbs: daily actions | #3823 | confirmed | to understand/comprehend | approved |
| 502 | w0502 | conducir | verb | A2 · city, transport & travel | #1719 | confirmed | c>zc; to drive | approved |
| 503 | w0503 | construir | verb | A2 · verbs: daily actions | #2252 | confirmed | i>y; to build | approved |
| 504 | w0504 | morir | verb | A2 · body, health & medicine | #484 | confirmed | o>ue/u; irregular pp muerto; to die | approved |
| 505 | w0505 | nacer | verb | A2 · body, health & medicine | #5851 | confirmed | c>zc; to be born | approved |
| 506 | w0506 | crecer | verb | A2 · verbs: daily actions | #3068 | confirmed | c>zc; to grow | approved |
| 507 | w0507 | caer | verb | A2 · verbs: daily actions | #1493 | confirmed | irregular; to fall; reflexive caerse | approved |
| 508 | w0508 | tocar | verb | A2 · leisure & hobbies | #1262 | confirmed | c>qu; to touch/play (instrument) | approved |
| 509 | w0509 | sonar | verb | A2 · verbs: daily actions | #3641 | confirmed | o>ue; to sound/ring | approved |
| 510 | w0510 | apagar | verb | A2 · work, study, tech & communication | #4917 | confirmed | g>gu; to turn off | approved |
| 511 | w0511 | encender | verb | A2 · work, study, tech & communication | #5129 | confirmed | e>ie; to turn on/light | approved |
| 512 | w0512 | funcionar | verb | A2 · work, study, tech & communication | #1989 | confirmed | to work/function (machines) | approved |
| 513 | w0513 | aceptar | verb | A2 · verbs: daily actions | #1720 | confirmed | to accept | approved |
| 514 | w0514 | permitir | verb | A2 · verbs: daily actions | #2599 | confirmed | to allow | approved |
| 515 | w0515 | prohibir | verb | A2 · verbs: daily actions | #19989 | confirmed | í accent; to forbid | approved |
| 516 | w0516 | ofrecer | verb | A2 · verbs: daily actions | #4238 | confirmed | c>zc; to offer | approved |
| 517 | w0517 | prestar | verb | A2 · verbs: daily actions | #7892 | confirmed | to lend | approved |
| 518 | w0518 | devolver | verb | A2 · verbs: daily actions | #3949 | confirmed | o>ue; pp devuelto; to return (something) | approved |
| 519 | w0519 | costar | verb | A2 · food, cooking & restaurant | #8133 | confirmed | o>ue; to cost; like gustar in use | approved |
| 520 | w0520 | valer | verb | A2 · food, cooking & restaurant | #9644 | confirmed | irregular 1sg valgo; to be worth/cost | approved |
| 521 | w0521 | cobrar | verb | A2 · work, study, tech & communication | #5511 | confirmed | to charge/get paid | approved |
| 522 | w0522 | alquilar | verb | A2 · city, transport & travel | #8007 | confirmed | to rent | approved |
| 523 | w0523 | reservar | verb | A2 · city, transport & travel | #13900 | confirmed | to reserve/book | approved |
| 524 | w0524 | firmar | verb | A2 · work, study, tech & communication | #2816 | confirmed | to sign | approved |
| 525 | w0525 | comunicar | verb | A2 · work, study, tech & communication | #15564 | confirmed | c>qu; to communicate | approved |
| 526 | w0526 | informar | verb | A2 · work, study, tech & communication | #4914 | confirmed | to inform | approved |
| 527 | w0527 | avisar | verb | A2 · work, study, tech & communication | #5689 | confirmed | to warn/let know | approved |
| 528 | w0528 | discutir | verb | A2 · emotions & personality | #2112 | confirmed | to argue/discuss | approved |
| 529 | w0529 | pelear | verb | A2 · emotions & personality | #1675 | confirmed | to fight; reflexive pelearse | approved |
| 530 | w0530 | mentir | verb | A2 · emotions & personality | #2729 | confirmed | e>ie/i; to lie | approved |
| 531 | w0531 | prometer | verb | A2 · verbs: daily actions | #9276 | confirmed | to promise | approved |
| 532 | w0532 | quejar | verb | A2 · emotions & personality | #21836 | ambiguous | almost always reflexive quejarse = to complain | approved |
| 533 | w0533 | cuidar | verb | A2 · body, health & medicine | #1703 | confirmed | to look after; reflexive cuidarse | approved |
| 534 | w0534 | curar | verb | A2 · body, health & medicine | #5653 | confirmed | to cure/heal | approved |
| 535 | w0535 | descubrir | verb | A2 · verbs: daily actions | #2044 | confirmed | pp descubierto; to discover | approved |
| 536 | w0536 | inventar | verb | A2 · verbs: daily actions | #7865 | confirmed | to invent | approved |
| 537 | w0537 | elegir | verb | A2 · verbs: daily actions | #1895 | confirmed | e>i; g>j; to choose | approved |
| 538 | w0538 | cumplir | verb | A2 · verbs: daily actions | #2555 | confirmed | to fulfil/turn (age) | approved |
| 539 | w0539 | tratar | verb | A2 · verbs: daily actions | #1210 | confirmed | to treat; tratar de + inf = to try | approved |
| 540 | w0540 | ocurrir | verb | A2 · verbs: daily actions | #3389 | confirmed | to happen/occur (3rd person) | approved |
| 541 | w0541 | existir | verb | A2 · verbs: daily actions | #6484 | confirmed | to exist | approved |
| 542 | w0542 | faltar | verb | A2 · verbs: daily actions | #10400 | confirmed | to be missing/lacking; like gustar | approved |
| 543 | w0543 | aparecer | verb | A2 · verbs: daily actions | #3551 | confirmed | c>zc; to appear | approved |
| 544 | w0544 | mejorar | verb | A2 · body, health & medicine | #3379 | confirmed | to improve/get better | approved |
| 545 | w0545 | aumentar | verb | A2 · time & quantity | #6519 | confirmed | to increase | approved |
| 546 | w0546 | evitar | verb | A2 · verbs: daily actions | #1319 | confirmed | to avoid | approved |
| 547 | w0547 | mantener | verb | A2 · verbs: daily actions | #933 | confirmed | conjugates like tener; to maintain/keep | approved |
| 548 | w0548 | recoger | verb | A2 · verbs: daily actions | #2124 | confirmed | g>j; to pick up/collect | approved |
| 549 | w0549 | notar | verb | A2 · verbs: daily actions | #7740 | confirmed | to notice | approved |
| 550 | w0550 | probar | verb | A2 · food, cooking & restaurant | #1295 | confirmed | o>ue; to try/taste/test | approved |
| 551 | w0551 | mezclar | verb | A2 · food, cooking & restaurant | #11486 | confirmed | to mix | approved |
| 552 | w0552 | cortar | verb | A2 · food, cooking & restaurant | #2291 | confirmed | to cut | approved |
| 553 | w0553 | calentar | verb | A2 · food, cooking & restaurant | #11017 | confirmed | e>ie; to heat up | approved |
| 554 | w0554 | pintar | verb | A2 · leisure & hobbies | #4948 | confirmed | to paint | approved |
| 555 | w0555 | dibujar | verb | A2 · leisure & hobbies | #8640 | confirmed | to draw | approved |
| 556 | w0556 | nadar | verb | A2 · leisure & hobbies | #3141 | confirmed | to swim | approved |
| 557 | w0557 | alegre | adjective | A2 · emotions & personality | #3822 | confirmed | invariable in gender; cheerful | approved |
| 558 | w0558 | nervioso | adjective | A2 · emotions & personality | #1613 | confirmed | masc sg; nervous (with estar) | approved |
| 559 | w0559 | preocupado | adjective | A2 · emotions & personality | #1487 | ambiguous | adjective worried; also pp of preocupar — adjective sense | approved |
| 560 | w0560 | aburrido | adjective | A2 · emotions & personality | #2388 | ambiguous | ser aburrido (boring) vs estar aburrido (bored); also pp of aburrir | approved |
| 561 | w0561 | divertido | adjective | A2 · emotions & personality | #684 | ambiguous | adjective fun/funny; also pp of divertir — adjective sense | approved |
| 562 | w0562 | interesante | adjective | A2 · emotions & personality | #886 | confirmed | invariable in gender; interesting | approved |
| 563 | w0563 | serio | adjective | A2 · emotions & personality | #239 | confirmed | masc sg; serious | approved |
| 564 | w0564 | gracioso | adjective | A2 · emotions & personality | #938 | confirmed | masc sg; funny | approved |
| 565 | w0565 | loco | adjective | A2 · emotions & personality | #426 | confirmed | masc sg; crazy (also noun) | approved |
| 566 | w0566 | valiente | adjective | A2 · emotions & personality | #1968 | confirmed | invariable in gender; brave | approved |
| 567 | w0567 | tímido | adjective | A2 · emotions & personality | #6296 | confirmed | masc sg; shy | approved |
| 568 | w0568 | orgulloso | adjective | A2 · emotions & personality | #1681 | confirmed | masc sg; proud | approved |
| 569 | w0569 | generoso | adjective | A2 · emotions & personality | #4806 | confirmed | masc sg; generous | approved |
| 570 | w0570 | egoísta | adjective | A2 · emotions & personality | #3785 | confirmed | invariable in gender (-ista); selfish | approved |
| 571 | w0571 | educado | adjective | A2 · emotions & personality | #7074 | ambiguous | adjective polite; also pp of educar — adjective sense | approved |
| 572 | w0572 | trabajador | adjective | A2 · emotions & personality | #6038 | confirmed | masc sg; hard-working (also noun worker) | approved |
| 573 | w0573 | vago | adjective | A2 · emotions & personality | #6742 | confirmed | masc sg; lazy/vague | approved |
| 574 | w0574 | famoso | adjective | A2 · adjectives | #2258 | confirmed | masc sg; famous | approved |
| 575 | w0575 | popular | adjective | A2 · adjectives | #2933 | confirmed | invariable in gender; popular | approved |
| 576 | w0576 | maravilloso | adjective | A2 · adjectives | #977 | confirmed | masc sg; wonderful | approved |
| 577 | w0577 | terrible | adjective | A2 · adjectives | #916 | confirmed | invariable in gender; terrible | approved |
| 578 | w0578 | horrible | adjective | A2 · adjectives | #892 | confirmed | invariable in gender; horrible | approved |
| 579 | w0579 | precioso | adjective | A2 · adjectives | #2189 | confirmed | masc sg; lovely/beautiful | approved |
| 580 | w0580 | delgado | adjective | A2 · body, health & medicine | #6532 | confirmed | masc sg; thin/slim | approved |
| 581 | w0581 | gordo | adjective | A2 · body, health & medicine | #2045 | confirmed | masc sg; fat | approved |
| 582 | w0582 | mayor | adjective | A2 · adjectives | #482 | ambiguous | comparative bigger/older; invariable in gender; also noun | approved |
| 583 | w0583 | menor | adjective | A2 · adjectives | #1867 | ambiguous | comparative smaller/younger; invariable in gender; also noun (minor) | approved |
| 584 | w0584 | dulce | adjective | A2 · food, cooking & restaurant | #920 | ambiguous | adjective sweet; also masc noun (a sweet) — adjective sense | approved |
| 585 | w0585 | salado | adjective | A2 · food, cooking & restaurant | #16178 | ambiguous | adjective salty; also pp of salar — adjective sense | approved |
| 586 | w0586 | picante | adjective | A2 · food, cooking & restaurant | #7359 | confirmed | invariable in gender; spicy | approved |
| 587 | w0587 | delicioso | adjective | A2 · food, cooking & restaurant | #3133 | confirmed | masc sg; delicious | approved |
| 588 | w0588 | húmedo | adjective | A2 · weather, nature & animals | #9433 | confirmed | masc sg; damp/humid | approved |
| 589 | w0589 | nublado | adjective | A2 · weather, nature & animals | #19931 | ambiguous | adjective cloudy; also pp of nublar — adjective sense | approved |
| 590 | w0590 | moderno | adjective | A2 · adjectives | #5874 | confirmed | masc sg; modern | approved |
| 591 | w0591 | antiguo | adjective | A2 · adjectives | #2013 | confirmed | masc sg; old/ancient | approved |
| 592 | w0592 | próximo | adjective | A2 · adjectives | #1213 | confirmed | masc sg; next | approved |
| 593 | w0593 | siguiente | adjective | A2 · adjectives | #700 | confirmed | invariable in gender; following/next | approved |
| 594 | w0594 | común | adjective | A2 · adjectives | #1300 | confirmed | invariable in gender; common; plural comunes | approved |
| 595 | w0595 | útil | adjective | A2 · adjectives | #2394 | confirmed | invariable in gender; useful | approved |
| 596 | w0596 | seguro | adjective | A2 · adjectives | #180 | ambiguous | adjective sure/safe; also adverb/masc noun (insurance) — adjective sense | approved |
| 597 | w0597 | carácter | noun | A2 · emotions & personality | #3817 | confirmed | masc; character; plural caracteres (stress shift) | approved |
| 598 | w0598 | humor | noun | A2 · emotions & personality | #1789 | confirmed | masc; mood/humour | approved |
| 599 | w0599 | sonrisa | noun | A2 · emotions & personality | #2479 | confirmed | fem; smile | approved |
| 600 | w0600 | beso | noun | A2 · emotions & personality | #1463 | confirmed | masc; kiss | approved |
| 601 | w0601 | abrazo | noun | A2 · emotions & personality | #3672 | confirmed | masc; hug | approved |
| 602 | w0602 | amistad | noun | A2 · emotions & personality | #2367 | confirmed | fem; friendship | approved |
| 603 | w0603 | vergüenza | noun | A2 · emotions & personality | #1698 | confirmed | fem; embarrassment/shame | approved |
| 604 | w0604 | culpa | noun | A2 · emotions & personality | #461 | confirmed | fem; fault/blame (tener la culpa) | approved |
| 605 | w0605 | error | noun | A2 · emotions & personality | #707 | confirmed | masc; error/mistake | approved |
| 606 | w0606 | respeto | noun | A2 · emotions & personality | #1175 | confirmed | masc; respect | approved |
| 607 | w0607 | fiesta | noun | A1 · leisure & hobbies | #447 | confirmed | fem; party/holiday | approved |
| 608 | w0608 | juego | noun | A1 · leisure & hobbies | #433 | ambiguous | masc noun game; homograph of jugar 1sg — noun sense | approved |
| 609 | w0609 | deporte | noun | A1 · leisure & hobbies | #4299 | confirmed | masc; sport | approved |
| 610 | w0610 | partido | noun | A2 · leisure & hobbies | #1094 | ambiguous | masc noun match/(political) party; also pp of partir — noun sense | approved |
| 611 | w0611 | entrada | noun | A2 · leisure & hobbies | #1316 | ambiguous | fem noun ticket/entrance; also pp fem of entrar — noun sense | approved |
| 612 | w0612 | canción | noun | A1 · leisure & hobbies | #866 | confirmed | fem; song | approved |
| 613 | w0613 | concierto | noun | A2 · leisure & hobbies | #2800 | confirmed | masc; concert | approved |
| 614 | w0614 | foto | noun | A1 · leisure & hobbies | #767 | ambiguous | fem despite -o; apocope of fotografía | approved |
| 615 | w0615 | vacaciones | noun | A1 · leisure & hobbies | #1400 | ambiguous | fem; inherently plural — plural is the citation form (spec §3) | approved |
| 616 | w0616 | paseo | noun | A2 · leisure & hobbies | #1709 | ambiguous | masc noun walk/stroll; homograph of pasear 1sg — noun sense | approved |
| 617 | w0617 | plan | noun | A1 · leisure & hobbies | #565 | confirmed | masc; plan | approved |
| 618 | w0618 | cumpleaños | noun | A1 · leisure & hobbies | #863 | confirmed | masc; invariable sg/pl; birthday | approved |
| 619 | w0619 | menú | noun | A1 · food, cooking & restaurant | #5786 | confirmed | masc; menu | approved |
| 620 | w0620 | cuchara | noun | A2 · food, cooking & restaurant | #8814 | confirmed | fem; spoon | approved |
| 621 | w0621 | cuchillo | noun | A2 · food, cooking & restaurant | #1631 | confirmed | masc; knife | approved |
| 622 | w0622 | tenedor | noun | A2 · food, cooking & restaurant | #10326 | confirmed | masc; fork | approved |
| 623 | w0623 | botella | noun | A1 · food, cooking & restaurant | #1657 | confirmed | fem; bottle | approved |
| 624 | w0624 | taza | noun | A1 · food, cooking & restaurant | #2443 | confirmed | fem; cup/mug | approved |
| 625 | w0625 | bebida | noun | A1 · food, cooking & restaurant | #2169 | ambiguous | fem noun drink; also pp fem of beber — noun sense | approved |
| 626 | w0626 | postre | noun | A2 · food, cooking & restaurant | #4492 | confirmed | masc; dessert | approved |
| 627 | w0627 | pastel | noun | A2 · food, cooking & restaurant | #1905 | confirmed | masc; cake | approved |
| 628 | w0628 | helado | noun | A1 · food, cooking & restaurant | #2231 | ambiguous | masc noun ice cream; also pp of helar — noun sense | approved |
| 629 | w0629 | bocadillo | noun | A2 · food, cooking & restaurant | #11705 | confirmed | masc; sandwich (Spain) | approved |
| 630 | w0630 | aceite | noun | A2 · food, cooking & restaurant | #3412 | confirmed | masc; oil | approved |
| 631 | w0631 | sal | noun | A2 · food, cooking & restaurant | #881 | ambiguous | fem noun salt; homograph of salir imperative sal — noun sense | approved |
| 632 | w0632 | bolso | noun | A2 · clothing & personal items | #2358 | confirmed | masc; handbag | approved |
| 633 | w0633 | reloj | noun | A1 · clothing & personal items | #1530 | confirmed | masc; watch/clock | approved |
| 634 | w0634 | bufanda | noun | A2 · clothing & personal items | #10312 | confirmed | fem; scarf | approved |
| 635 | w0635 | cinturón | noun | A2 · clothing & personal items | #3416 | confirmed | masc; belt | approved |
| 636 | w0636 | bolsa | noun | A1 · clothing & personal items | #1216 | confirmed | fem; bag | approved |
| 637 | w0637 | mochila | noun | A2 · clothing & personal items | #5422 | confirmed | fem; backpack | approved |
| 638 | w0638 | paraguas | noun | A2 · clothing & personal items | #8706 | confirmed | masc; invariable sg/pl; umbrella | approved |
| 639 | w0639 | cartera | noun | A2 · clothing & personal items | #3517 | confirmed | fem; wallet/satchel | approved |
| 640 | w0640 | maleta | noun | A1 · clothing & personal items | #3226 | confirmed | fem; suitcase | approved |
| 641 | w0641 | toalla | noun | A2 · clothing & personal items | #5272 | confirmed | fem; towel | approved |
| 642 | w0642 | espejo | noun | A2 · clothing & personal items | #2621 | confirmed | masc; mirror | approved |
| 643 | w0643 | sofá | noun | A1 · home | #2809 | confirmed | masc; sofa; plural sofás | approved |
| 644 | w0644 | salón | noun | A1 · home | #2163 | confirmed | masc; living room | approved |
| 645 | w0645 | comedor | noun | A2 · home | #5226 | confirmed | masc; dining room | approved |
| 646 | w0646 | dormitorio | noun | A2 · home | #3445 | confirmed | masc; bedroom | approved |
| 647 | w0647 | garaje | noun | A2 · home | #3602 | confirmed | masc; garage | approved |
| 648 | w0648 | jardín | noun | A1 · home | #1829 | confirmed | masc; garden | approved |
| 649 | w0649 | techo | noun | A2 · home | #2103 | confirmed | masc; ceiling/roof | approved |
| 650 | w0650 | suelo | noun | A2 · home | #893 | ambiguous | masc noun floor/ground; homograph of soler 1sg — noun sense | approved |
| 651 | w0651 | barrio | noun | A2 · home | #2329 | confirmed | masc; neighbourhood | approved |
| 652 | w0652 | avenida | noun | A2 · city, transport & travel | #5519 | confirmed | fem; avenue | approved |
| 653 | w0653 | semáforo | noun | A2 · city, transport & travel | #14972 | confirmed | masc; traffic light | approved |
| 654 | w0654 | puente | noun | A2 · city, transport & travel | #1670 | confirmed | masc; bridge | approved |
| 655 | w0655 | parada | noun | A2 · city, transport & travel | #2567 | ambiguous | fem noun stop; also pp fem of parar — noun sense | approved |
| 656 | w0656 | billete | noun | A1 · city, transport & travel | #3981 | confirmed | masc; ticket/banknote (Spain) | approved |
| 657 | w0657 | pasaporte | noun | A2 · city, transport & travel | #4119 | confirmed | masc; passport | approved |
| 658 | w0658 | mapa | noun | A1 · city, transport & travel | #2241 | confirmed | masc despite -a; map | approved |
| 659 | w0659 | carretera | noun | A2 · city, transport & travel | #1951 | confirmed | fem; road/highway | approved |
| 660 | w0660 | camino | noun | A2 · city, transport & travel | #305 | ambiguous | masc noun path/way; homograph of caminar 1sg — noun sense | approved |
| 661 | w0661 | montaña | noun | A1 · weather, nature & animals | #2026 | confirmed | fem; mountain | approved |
| 662 | w0662 | campo | noun | A2 · weather, nature & animals | #760 | confirmed | masc; countryside/field | approved |
| 663 | w0663 | río | noun | A1 · weather, nature & animals | #1259 | confirmed | masc; river | approved |
| 664 | w0664 | sueldo | noun | A2 · work, study, tech & communication | #4105 | confirmed | masc; salary/wage | approved |
| 665 | w0665 | contrato | noun | A2 · work, study, tech & communication | #1725 | ambiguous | masc noun contract; homograph of contratar 1sg — noun sense | approved |
| 666 | w0666 | entrevista | noun | A2 · work, study, tech & communication | #2218 | confirmed | fem; interview | approved |
| 667 | w0667 | compañero | noun | A2 · work, study, tech & communication | #1101 | confirmed | masc citation; fem compañera derived; colleague/classmate | approved |
| 668 | w0668 | cliente | noun | A2 · work, study, tech & communication | #1110 | confirmed | masc citation; fem clienta/cliente; customer | approved |
| 669 | w0669 | negocio | noun | A2 · work, study, tech & communication | #757 | confirmed | masc; business | approved |
| 670 | w0670 | máquina | noun | A2 · work, study, tech & communication | #1320 | confirmed | fem; machine | approved |
| 671 | w0671 | pantalla | noun | A2 · work, study, tech & communication | #3152 | confirmed | fem; screen | approved |
| 672 | w0672 | internet | noun | A1 · work, study, tech & communication | #2003 | ambiguous | masc or fem; often used without article; internet | approved |
| 673 | w0673 | correo | noun | A1 · work, study, tech & communication | #1875 | confirmed | masc; mail/email (correo electrónico) | approved |
| 674 | w0674 | periódico | noun | A2 · work, study, tech & communication | #1974 | confirmed | masc; newspaper | approved |
| 675 | w0675 | noticia | noun | A2 · work, study, tech & communication | #1443 | confirmed | fem; (piece of) news | approved |
| 676 | w0676 | programa | noun | A1 · work, study, tech & communication | #861 | confirmed | masc despite -a; programme/program | approved |
| 677 | w0677 | idioma | noun | A1 · work, study, tech & communication | #4692 | confirmed | masc despite -a; language | approved |
| 678 | w0678 | cuello | noun | A2 · body, health & medicine | #1321 | confirmed | masc; neck/collar | approved |
| 679 | w0679 | hombro | noun | A2 · body, health & medicine | #3337 | confirmed | masc; shoulder | approved |
| 680 | w0680 | rodilla | noun | A2 · body, health & medicine | #5318 | confirmed | fem; knee | approved |
| 681 | w0681 | lengua | noun | A2 · body, health & medicine | #2021 | confirmed | fem; tongue/language | approved |
| 682 | w0682 | garganta | noun | A2 · body, health & medicine | #2887 | confirmed | fem; throat | approved |
| 683 | w0683 | estómago | noun | A2 · body, health & medicine | #2318 | confirmed | masc; stomach | approved |
| 684 | w0684 | piel | noun | A2 · body, health & medicine | #1355 | confirmed | fem; skin | approved |
| 685 | w0685 | sangre | noun | A2 · body, health & medicine | #427 | confirmed | fem; blood | approved |
| 686 | w0686 | gripe | noun | A2 · body, health & medicine | #6481 | confirmed | fem; flu | approved |
| 687 | w0687 | hospital | noun | A1 · body, health & medicine | #596 | confirmed | masc; hospital | approved |
| 688 | w0688 | clima | noun | A2 · weather, nature & animals | #3814 | confirmed | masc despite -a; climate | approved |
| 689 | w0689 | temperatura | noun | A2 · weather, nature & animals | #3569 | confirmed | fem; temperature | approved |
| 690 | w0690 | tormenta | noun | A2 · weather, nature & animals | #2151 | confirmed | fem; storm | approved |
| 691 | w0691 | hielo | noun | A2 · weather, nature & animals | #1553 | confirmed | masc; ice | approved |
| 692 | w0692 | primavera | noun | A1 · weather, nature & animals | #2900 | confirmed | fem; spring | approved |
| 693 | w0693 | verano | noun | A1 · weather, nature & animals | #1331 | confirmed | masc; summer | approved |
| 694 | w0694 | otoño | noun | A1 · weather, nature & animals | #5113 | confirmed | masc; autumn | approved |
| 695 | w0695 | invierno | noun | A1 · weather, nature & animals | #2609 | confirmed | masc; winter | approved |
| 696 | w0696 | naturaleza | noun | A2 · weather, nature & animals | #1577 | confirmed | fem; nature | approved |
| 697 | w0697 | pez | noun | A2 · weather, nature & animals | #2724 | confirmed | masc; fish (live); plural peces; cf pescado (food) | approved |
| 698 | w0698 | rato | noun | A2 · time & quantity | #979 | confirmed | masc; a while | approved |
| 699 | w0699 | siglo | noun | A2 · time & quantity | #2287 | confirmed | masc; century | approved |
| 700 | w0700 | época | noun | A2 · time & quantity | #1669 | confirmed | fem; era/time (of year) | approved |
| 701 | w0701 | calendario | noun | A2 · time & quantity | #7139 | confirmed | masc; calendar | approved |
| 702 | w0702 | fin | noun | A1 · time & quantity | #386 | confirmed | masc; end; fin de semana | approved |
| 703 | w0703 | mediodía | noun | A2 · time & quantity | #4125 | confirmed | masc; midday/noon | approved |
| 704 | w0704 | cantidad | noun | A2 · time & quantity | #1590 | confirmed | fem; amount/quantity | approved |
| 705 | w0705 | kilo | noun | A1 · time & quantity | #8832 | confirmed | masc; kilo (apocope of kilogramo) | approved |
| 706 | w0706 | tamaño | noun | A2 · time & quantity | #2053 | confirmed | masc; size | approved |
| 707 | w0707 | tema | noun | A2 · general concepts | #1086 | confirmed | masc despite -a; topic/subject | approved |
| 708 | w0708 | caso | noun | A2 · general concepts | #288 | confirmed | masc; case (en caso de) | approved |
| 709 | w0709 | ejemplo | noun | A1 · general concepts | #1149 | confirmed | masc; example (por ejemplo) | approved |
| 710 | w0710 | causa | noun | A2 · general concepts | #1097 | ambiguous | fem noun cause; homograph of causar 3sg — noun sense | approved |
| 711 | w0711 | cambio | noun | A2 · general concepts | #640 | ambiguous | masc noun change; homograph of cambiar 1sg — noun sense | approved |
| 712 | w0712 | diferencia | noun | A2 · general concepts | #1144 | ambiguous | fem noun difference; homograph of diferenciar 3sg — noun sense | approved |
| 713 | w0713 | respuesta | noun | A1 · general concepts | #829 | confirmed | fem; answer/response | approved |
| 714 | w0714 | duda | noun | A2 · general concepts | #1037 | ambiguous | fem noun doubt; homograph of dudar 3sg — noun sense | approved |
| 715 | w0715 | así | adverb | A1 · adverbs | #46 | confirmed | like this/so | approved |
| 716 | w0716 | tarde | adverb | A1 · adverbs | #243 | ambiguous | adverb late; homograph of noun tarde (afternoon, w0150) — adverb sense | approved |
| 717 | w0717 | mal | adverb | A1 · adverbs | #219 | ambiguous | adverb badly; apocope-linked to malo; also masc noun el mal — adverb sense | approved |
| 718 | w0718 | despacio | adverb | A2 · adverbs | #1760 | confirmed | slowly | approved |
| 719 | w0719 | enseguida | adverb | A2 · adverbs | #1029 | confirmed | right away | approved |
| 720 | w0720 | apenas | adverb | A2 · adverbs | #1073 | confirmed | hardly/barely | approved |
| 721 | w0721 | jamás | adverb | A2 · adverbs | #708 | confirmed | never (emphatic) | approved |
| 722 | w0722 | delante | adverb | A2 · adverbs | #941 | confirmed | in front; delante de | approved |
| 723 | w0723 | detrás | adverb | A2 · adverbs | #627 | confirmed | behind; detrás de | approved |
| 724 | w0724 | encima | adverb | A2 · adverbs | #692 | confirmed | on top/above; encima de | approved |
| 725 | w0725 | debajo | adverb | A2 · adverbs | #1176 | confirmed | underneath; debajo de | approved |
| 726 | w0726 | alrededor | adverb | A2 · adverbs | #771 | confirmed | around; alrededor de | approved |
| 727 | w0727 | catorce | numeral | A1 · numbers | #8734 | confirmed | cardinal 14 | approved |
| 728 | w0728 | dieciséis | numeral | A2 · numbers | #10755 | confirmed | cardinal 16 | approved |
| 729 | w0729 | diecisiete | numeral | A2 · numbers | #12632 | confirmed | cardinal 17 | approved |
| 730 | w0730 | cuarenta | numeral | A2 · numbers | #4782 | confirmed | cardinal 40 | approved |
| 731 | w0731 | cincuenta | numeral | A2 · numbers | #3987 | confirmed | cardinal 50 | approved |
| 732 | w0732 | sesenta | numeral | A2 · numbers | #7843 | confirmed | cardinal 60 | approved |
| 733 | w0733 | cuarto | numeral | A2 · numbers | #628 | ambiguous | ordinal 4th masc sg; also masc noun room/quarter — numeral sense | approved |
| 734 | w0734 | quinto | numeral | A2 · numbers | #5079 | confirmed | ordinal 5th masc sg | approved |
| 735 | w0735 | os | pronoun | A2 · pronouns | #344 | confirmed | 2nd plural object/reflexive clitic (peninsular) | approved |
| 736 | w0736 | mío | pronoun | A2 · pronouns | #224 | confirmed | possessive pronoun mine; agreement derived; also stressed determiner | approved |
| 737 | w0737 | tuyo | pronoun | A2 · pronouns | #759 | confirmed | possessive pronoun yours; agreement derived | approved |
| 738 | w0738 | suyo | pronoun | A2 · pronouns | #1309 | confirmed | possessive pronoun his/hers/theirs; agreement derived | approved |
| 739 | w0739 | cierto | determiner | A2 · determiners | #246 | ambiguous | a certain; also adjective true — determiner sense; agreement derived | approved |
| 740 | w0740 | medio | adjective | A2 · adjectives | #516 | ambiguous | masculine singular adjective meaning half; feminine media is derived; also functions as adverb and noun in other senses | approved |
| 741 | w0741 | ambos | determiner | A2 · determiners | #728 | ambiguous | both; inherently plural (ambos/ambas) — plural citation | approved |
| 742 | w0742 | tal | determiner | A2 · determiners | #158 | ambiguous | such; invariable in gender; also pronoun/adverb (¿qué tal?) | approved |
| 743 | w0743 | demás | determiner | A2 · determiners | #672 | confirmed | the rest/others; invariable (los demás) | approved |
| 744 | w0744 | tras | preposition | A2 · prepositions | #763 | confirmed | after/behind | approved |
| 745 | w0745 | ante | preposition | A2 · prepositions | #999 | confirmed | before/in the presence of | approved |
| 746 | w0746 | bajo | preposition | A2 · prepositions | #380 | ambiguous | preposition under; homograph of adjective bajo (w0224) and adverb/noun — prep sense | approved |
| 747 | w0747 | excepto | preposition | A2 · prepositions | #1128 | confirmed | except | approved |
| 748 | w0748 | como | conjunction | A2 · conjunctions | #32 | ambiguous | as/since/like; homograph of comer 1sg and interrogative cómo — conjunction sense | approved |
| 749 | w0749 | pues | conjunction | A2 · conjunctions | #296 | ambiguous | so/then/since; also discourse interjection — conjunction sense | approved |
| 750 | w0750 | vaya | interjection | A2 · social | #267 | ambiguous | expresses surprise/dismay; homograph of ir subjunctive — interjection sense | approved |

## Ambiguous / needs-review items

40 of 250 rows are flagged — homographs / multi-POS forms where the
stored sense is a deliberate choice, participle-vs-adjective pairs, inherently-plural
and irregular-gender nouns, and two legitimate cross-POS homographs of existing
entries (`bajo` prep. vs `w0224` adj.; `tarde` adv. vs `w0150` noun). All are
approved; the flag records what a human confirmed.

| order | id | word | pos | status | why it is flagged |
|---|---|---|---|---|---|
| 532 | w0532 | quejar | verb | ambiguous | almost always reflexive quejarse = to complain |
| 559 | w0559 | preocupado | adjective | ambiguous | adjective worried; also pp of preocupar — adjective sense |
| 560 | w0560 | aburrido | adjective | ambiguous | ser aburrido (boring) vs estar aburrido (bored); also pp of aburrir |
| 561 | w0561 | divertido | adjective | ambiguous | adjective fun/funny; also pp of divertir — adjective sense |
| 571 | w0571 | educado | adjective | ambiguous | adjective polite; also pp of educar — adjective sense |
| 582 | w0582 | mayor | adjective | ambiguous | comparative bigger/older; invariable in gender; also noun |
| 583 | w0583 | menor | adjective | ambiguous | comparative smaller/younger; invariable in gender; also noun (minor) |
| 584 | w0584 | dulce | adjective | ambiguous | adjective sweet; also masc noun (a sweet) — adjective sense |
| 585 | w0585 | salado | adjective | ambiguous | adjective salty; also pp of salar — adjective sense |
| 589 | w0589 | nublado | adjective | ambiguous | adjective cloudy; also pp of nublar — adjective sense |
| 596 | w0596 | seguro | adjective | ambiguous | adjective sure/safe; also adverb/masc noun (insurance) — adjective sense |
| 608 | w0608 | juego | noun | ambiguous | masc noun game; homograph of jugar 1sg — noun sense |
| 610 | w0610 | partido | noun | ambiguous | masc noun match/(political) party; also pp of partir — noun sense |
| 611 | w0611 | entrada | noun | ambiguous | fem noun ticket/entrance; also pp fem of entrar — noun sense |
| 614 | w0614 | foto | noun | ambiguous | fem despite -o; apocope of fotografía |
| 615 | w0615 | vacaciones | noun | ambiguous | fem; inherently plural — plural is the citation form (spec §3) |
| 616 | w0616 | paseo | noun | ambiguous | masc noun walk/stroll; homograph of pasear 1sg — noun sense |
| 625 | w0625 | bebida | noun | ambiguous | fem noun drink; also pp fem of beber — noun sense |
| 628 | w0628 | helado | noun | ambiguous | masc noun ice cream; also pp of helar — noun sense |
| 631 | w0631 | sal | noun | ambiguous | fem noun salt; homograph of salir imperative sal — noun sense |
| 650 | w0650 | suelo | noun | ambiguous | masc noun floor/ground; homograph of soler 1sg — noun sense |
| 655 | w0655 | parada | noun | ambiguous | fem noun stop; also pp fem of parar — noun sense |
| 660 | w0660 | camino | noun | ambiguous | masc noun path/way; homograph of caminar 1sg — noun sense |
| 665 | w0665 | contrato | noun | ambiguous | masc noun contract; homograph of contratar 1sg — noun sense |
| 672 | w0672 | internet | noun | ambiguous | masc or fem; often used without article; internet |
| 710 | w0710 | causa | noun | ambiguous | fem noun cause; homograph of causar 3sg — noun sense |
| 711 | w0711 | cambio | noun | ambiguous | masc noun change; homograph of cambiar 1sg — noun sense |
| 712 | w0712 | diferencia | noun | ambiguous | fem noun difference; homograph of diferenciar 3sg — noun sense |
| 714 | w0714 | duda | noun | ambiguous | fem noun doubt; homograph of dudar 3sg — noun sense |
| 716 | w0716 | tarde | adverb | ambiguous | adverb late; homograph of noun tarde (afternoon, w0150) — adverb sense |
| 717 | w0717 | mal | adverb | ambiguous | adverb badly; apocope-linked to malo; also masc noun el mal — adverb sense |
| 733 | w0733 | cuarto | numeral | ambiguous | ordinal 4th masc sg; also masc noun room/quarter — numeral sense |
| 739 | w0739 | cierto | determiner | ambiguous | a certain; also adjective true — determiner sense; agreement derived |
| 740 | w0740 | medio | adjective | ambiguous | masculine singular adjective meaning half; feminine media is derived; also functions as adverb and noun in other senses |
| 741 | w0741 | ambos | determiner | ambiguous | both; inherently plural (ambos/ambas) — plural citation |
| 742 | w0742 | tal | determiner | ambiguous | such; invariable in gender; also pronoun/adverb (¿qué tal?) |
| 746 | w0746 | bajo | preposition | ambiguous | preposition under; homograph of adjective bajo (w0224) and adverb/noun — prep sense |
| 748 | w0748 | como | conjunction | ambiguous | as/since/like; homograph of comer 1sg and interrogative cómo — conjunction sense |
| 749 | w0749 | pues | conjunction | ambiguous | so/then/since; also discourse interjection — conjunction sense |
| 750 | w0750 | vaya | interjection | ambiguous | expresses surprise/dismay; homograph of ir subjunctive — interjection sense |

**Recurring patterns.** (1) **Noun ↔ verb-form homographs** — `juego`/jugar,
`paseo`/pasear, `parada`/parar, `camino`/caminar, `cambio`/cambiar, `causa`/causar,
`duda`/dudar, `contrato`/contratar, `suelo`/soler, `sal`/salir(imp.); the **noun**
is stored. (2) **Adjective ↔ past-participle** — `preocupado`, `divertido`,
`educado`, `salado`, `nublado`, `aburrido`; the **adjective** is stored (the
participle is derived from its verb). (3) **Cross-POS homographs of existing
entries** — `bajo` (prep., vs adjective `w0224`) and `tarde` (adv., vs noun
`w0150`) reuse a `word` string already stored under a different `pos`, which the
schema explicitly allows (`docs/vocabulary-spec.md` §4–§5); neither collides
`(word, pos)`.

## Corpus misses

**None.** All 250 word-forms occur in `es_50k.txt`. The rarest hits are `quejar`
(#21836), `prohibir` (#19989), and the weather adjectives `nublado` (#19931) /
`salado` (#16178). Expected word-form artefacts: `quejar` occurs almost only as
reflexive `quejarse`, and weather adjectives are sparse in a subtitle corpus. Raw
rank confirms occurrence only; it is never the curriculum order.

## Replacement recommendations

- **No removals.** All 250 approved. Corrections applied were metadata only
  (`medio` POS; `bajo` id reference).
- **Peninsular vocabulary** continues the curriculum's established variety
  (`bocadillo`, `billete` = banknote, `os` with the existing `vosotros`/`vuestro`);
  kept deliberately.
- **`medio`** (order 740) is stored as an **adjective** (*media hora*); it remains
  multi-POS (adverb/noun in other senses), recorded in the caveat.
- **`quejar`** is stored as the bare infinitive per the lemma rule, though used
  almost exclusively as reflexive `quejarse`; the caveat records this.

## POS distribution (batch 501–750, 250)

| pos | count |
|---|---|
| verb | 56 |
| noun | 118 |
| adjective | 41 |
| adverb | 12 |
| pronoun | 4 |
| determiner | 4 |
| numeral | 8 |
| preposition | 4 |
| conjunction | 2 |
| interjection | 1 |
| **total** | **250** |

## Theme distribution (batch 501–750, 250)

| theme | count |
|---|---|
| emotions & personality | 31 |
| verbs: daily actions | 25 |
| food, cooking & restaurant | 23 |
| work, study, tech & communication | 22 |
| body, health & medicine | 17 |
| adjectives | 16 |
| leisure & hobbies | 16 |
| weather, nature & animals | 15 |
| adverbs | 12 |
| city, transport & travel | 12 |
| clothing & personal items | 11 |
| time & quantity | 10 |
| home | 9 |
| general concepts | 8 |
| numbers | 8 |
| determiners | 4 |
| prepositions | 4 |
| pronouns | 4 |
| conjunctions | 2 |
| social | 1 |

## Curriculum totals after this batch (existing 500 + batch 250 = 750)

| pos | existing (1–500) | batch (501–750) | total |
|---|---|---|---|
| verb | 110 | 56 | 166 |
| noun | 199 | 118 | 317 |
| adjective | 61 | 41 | 102 |
| adverb | 36 | 12 | 48 |
| pronoun | 23 | 4 | 27 |
| determiner | 18 | 4 | 22 |
| numeral | 21 | 8 | 29 |
| preposition | 15 | 4 | 19 |
| conjunction | 10 | 2 | 12 |
| interjection | 7 | 1 | 8 |
| **total** | **500** | **250** | **750** |

## Source methodology

- **Frequency ≠ curriculum order.** hermitdave rank only confirms a word-form
  occurs in real usage; `order` is a human pedagogical decision.
- **Word form ≠ lemma.** `es_50k.txt` is a word-form list; infinitives (especially
  reflexive-only and gustar-type verbs), singular nouns, and masc-sg adjectives
  understate their lemmas. Only lemmas are stored.
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

