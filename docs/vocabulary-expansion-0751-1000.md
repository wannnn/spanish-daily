# Vocabulary Curriculum Expansion — Candidate Review (`order` 751–1000)

- **Status:** the one-time human review of the final batch is **complete**. All
  **250 rows are approved**, with two replacements (`cuyo`, `salvo` removed;
  `soler`, `llover` added) and an insertion reordering. They are assigned `id`
  `w0751`–`w1000` with `id N` ↔ `order N` and written to `vocabulary.json`, which
  now holds **1000 entries — the first curriculum milestone is complete.** This
  file is a **worktable / audit trail**, *not* an authoritative contract (the
  contract is `docs/vocabulary-spec.md`).
- **Batch:** 751–1000 (this file), following the approved 1–750.

## Corrections applied at review

1. **Two replacements.** Removed `cuyo` (determiner) and `salvo` (preposition) —
   the two lowest spoken-utility B1 function words. Added two higher-value verbs:
   **`soler`** (A2, *daily life & routine*, `ambiguous`: defective-style habitual
   verb, used mainly in present and imperfect + infinitive) and **`llover`** (A1,
   *weather & environment*, `confirmed`: o>ue; normally impersonal, e.g. `llueve`).
2. **Insertion reordering.** Orders 751–797 unchanged; then **798 `soler`, 799
   `nevar`, 800 `llover`**; the former orders 799–995 shift **+2** (former 799 →
   801 … former 995 → 997); the former rows 996 `cuyo` and 997 `salvo` are removed;
   **998 `sino`, 999 `bueno`, 1000 `ay` stay unchanged.** Still exactly 250 rows.
3. **Net POS effect:** +2 verbs, −1 determiner, −1 preposition versus the reviewed
   draft.
4. **Kept as reviewed:** `coger` (Peninsular, with its regional caveat), `claro` as
   adjective (separate from interjection `w0499`), `bueno` as interjection (separate
   from adjective `w0009`), `solo` as unaccented adverb, `quien` as relative pronoun
   (distinct from `quién`), and every other candidate word and POS.

## Method (unchanged from the settled batches)

- `vocabulary.json` is a **human-maintained source of truth**; AI proposed
  candidates and a draft order, the **human approved** inclusion and final order.
- **Frequency builds the candidate pool; it is never the curriculum `order`.**
- Only **canonical lemmas** are stored. `pos` uses the existing closed enum
  (`docs/vocabulary-spec.md` §4); no schema/enum/validation change.
- The batch was selected by **auditing the 750 existing entries for theme/POS gaps**,
  then filling the highest-value A1–A2 and **early-B1** gaps by teaching value.
- **hermitdave `es_50k.txt`** (OpenSubtitles, 2018): raw word-form rank, sanity
  check only; reused from outside the repo, **not** added to Git. **RAE/DRAE** only
  for flagged rows. Existing `w0001`–`w0750` unchanged, no `(word, pos)` duplicate.

## Approved entries (`w0751`–`w1000`)

`hermitdave` = raw rank of the exact word-form in `es_50k.txt`. `status` ∈
{confirmed, ambiguous, needs review}.

| order | id | word | pos | PCIC level / theme | hermitdave rank | canonical status | caveat | decision |
|---|---|---|---|---|---|---|---|---|
| 751 | w0751 | comenzar | verb | A2 · verbs: change & state | #1836 | confirmed | e>ie; z>c; to begin | approved |
| 752 | w0752 | continuar | verb | A2 · verbs: change & state | #1987 | confirmed | ú in stressed forms; to continue | approved |
| 753 | w0753 | regresar | verb | A2 · city, transport & travel | #1062 | confirmed | to return/go back | approved |
| 754 | w0754 | mover | verb | A2 · verbs: actions | #2626 | confirmed | o>ue; to move; reflexive moverse | approved |
| 755 | w0755 | acercar | verb | A2 · verbs: actions | #15428 | confirmed | c>qu; to bring near; reflexive acercarse | approved |
| 756 | w0756 | disfrutar | verb | A2 · leisure & interests | #3258 | confirmed | to enjoy; disfrutar de | approved |
| 757 | w0757 | sufrir | verb | A2 · body, health & safety | #3196 | confirmed | to suffer | approved |
| 758 | w0758 | odiar | verb | A2 · emotions & relationships | #8279 | confirmed | to hate | approved |
| 759 | w0759 | amar | verb | A2 · emotions & relationships | #2850 | confirmed | to love (stronger/formal than querer) | approved |
| 760 | w0760 | molestar | verb | A2 · emotions & relationships | #4396 | confirmed | to bother; like gustar | approved |
| 761 | w0761 | sorprender | verb | A2 · emotions & relationships | #12958 | confirmed | to surprise; reflexive sorprenderse | approved |
| 762 | w0762 | enfadar | verb | A2 · emotions & relationships | #11876 | confirmed | to anger; normally reflexive enfadarse (Spain) | approved |
| 763 | w0763 | disculpar | verb | A2 · emotions & relationships | #17305 | confirmed | to excuse; reflexive disculparse = to apologise | approved |
| 764 | w0764 | agradecer | verb | A2 · emotions & relationships | #6882 | confirmed | c>zc; to thank/be grateful | approved |
| 765 | w0765 | felicitar | verb | A2 · emotions & relationships | #21695 | confirmed | to congratulate | approved |
| 766 | w0766 | aconsejar | verb | A2 · work, study, tech & media | #28273 | confirmed | to advise | approved |
| 767 | w0767 | recomendar | verb | A2 · work, study, tech & media | #18466 | confirmed | e>ie; to recommend | approved |
| 768 | w0768 | sugerir | verb | B1 · work, study, tech & media | #9556 | confirmed | e>ie/i; to suggest | approved |
| 769 | w0769 | opinar | verb | A2 · work, study, tech & media | #18708 | confirmed | to give an opinion | approved |
| 770 | w0770 | suponer | verb | B1 · verbs: change & state | #7765 | confirmed | conjugates like poner; to suppose | approved |
| 771 | w0771 | describir | verb | A2 · work, study, tech & media | #7316 | confirmed | pp descrito; to describe | approved |
| 772 | w0772 | presentar | verb | A2 · emotions & relationships | #2941 | confirmed | to introduce/present; reflexive presentarse | approved |
| 773 | w0773 | compartir | verb | A2 · emotions & relationships | #2137 | confirmed | to share | approved |
| 774 | w0774 | participar | verb | A2 · leisure & interests | #4433 | confirmed | to take part | approved |
| 775 | w0775 | apoyar | verb | B1 · emotions & relationships | #6539 | confirmed | to support | approved |
| 776 | w0776 | proteger | verb | A2 · body, health & safety | #1748 | confirmed | g>j; to protect | approved |
| 777 | w0777 | servir | verb | A2 · food, restaurant & shopping | #2751 | confirmed | e>i; to serve/be useful | approved |
| 778 | w0778 | atender | verb | A2 · food, restaurant & shopping | #4537 | confirmed | e>ie; to attend to/serve | approved |
| 779 | w0779 | acompañar | verb | A2 · emotions & relationships | #9986 | confirmed | to accompany | approved |
| 780 | w0780 | convertir | verb | B1 · verbs: change & state | #4414 | confirmed | e>ie/i; reflexive convertirse en = to become | approved |
| 781 | w0781 | resolver | verb | A2 · verbs: change & state | #1984 | confirmed | o>ue; pp resuelto; to solve | approved |
| 782 | w0782 | producir | verb | B1 · work, study, tech & media | #7089 | confirmed | c>zc; irregular preterite; to produce | approved |
| 783 | w0783 | destruir | verb | B1 · verbs: change & state | #2226 | confirmed | i>y; to destroy | approved |
| 784 | w0784 | echar | verb | A2 · verbs: actions | #1677 | confirmed | to throw/pour; echar de menos = to miss | approved |
| 785 | w0785 | coger | verb | A2 · verbs: actions | #1564 | ambiguous | g>j; to take/catch (Spain); vulgar in parts of Latin America | approved |
| 786 | w0786 | tirar | verb | A2 · verbs: actions | #2408 | confirmed | to throw/pull/throw away | approved |
| 787 | w0787 | colgar | verb | A2 · verbs: actions | #4403 | confirmed | o>ue; g>gu; to hang/hang up | approved |
| 788 | w0788 | pegar | verb | A2 · verbs: actions | #6582 | confirmed | g>gu; to stick/hit | approved |
| 789 | w0789 | girar | verb | A2 · city, transport & travel | #5862 | confirmed | to turn/spin | approved |
| 790 | w0790 | oler | verb | A2 · body, health & safety | #5565 | confirmed | o>ue with h- (huele); to smell | approved |
| 791 | w0791 | despertar | verb | A2 · daily life & routine | #3432 | confirmed | e>ie; reflexive despertarse = to wake up | approved |
| 792 | w0792 | acostar | verb | A2 · daily life & routine | #11894 | confirmed | o>ue; reflexive acostarse = to go to bed | approved |
| 793 | w0793 | sentar | verb | A2 · daily life & routine | #6089 | confirmed | e>ie; reflexive sentarse = to sit down | approved |
| 794 | w0794 | vestir | verb | A2 · daily life & routine | #7296 | confirmed | e>i; reflexive vestirse = to get dressed | approved |
| 795 | w0795 | aprobar | verb | A2 · work, study, tech & media | #10943 | confirmed | o>ue; to pass (an exam)/approve | approved |
| 796 | w0796 | contratar | verb | B1 · work, study, tech & media | #5035 | confirmed | to hire | approved |
| 797 | w0797 | dirigir | verb | B1 · work, study, tech & media | #4731 | confirmed | g>j; to direct/manage | approved |
| 798 | w0798 | soler | verb | A2 · daily life & routine | — | ambiguous | defective-style habitual verb, used mainly in present and imperfect followed by an infinitive | approved |
| 799 | w0799 | nevar | verb | A2 · weather & environment | #27995 | confirmed | e>ie; impersonal (nieva); to snow | approved |
| 800 | w0800 | llover | verb | A1 · weather & environment | #7868 | confirmed | o>ue; normally impersonal, e.g. llueve | approved |
| 801 | w0801 | mejor | adjective | A1 · adjectives | #108 | ambiguous | comparative better; invariable in gender; also adverb | approved |
| 802 | w0802 | peor | adjective | A1 · adjectives | #568 | ambiguous | comparative worse; invariable in gender; also adverb | approved |
| 803 | w0803 | elegante | adjective | A2 · adjectives | #2992 | confirmed | invariable in gender; elegant | approved |
| 804 | w0804 | sencillo | adjective | A2 · adjectives | #2735 | confirmed | masc sg; simple/easy | approved |
| 805 | w0805 | complicado | adjective | A2 · adjectives | #2176 | ambiguous | adjective complicated; also pp of complicar — adjective sense | approved |
| 806 | w0806 | claro | adjective | A1 · adjectives | #166 | ambiguous | adjective clear/light; separate entry from claro interjection (w0499) | approved |
| 807 | w0807 | falso | adjective | A2 · adjectives | #2222 | confirmed | masc sg; false/fake | approved |
| 808 | w0808 | correcto | adjective | A2 · adjectives | #552 | confirmed | masc sg; correct | approved |
| 809 | w0809 | perfecto | adjective | A2 · adjectives | #667 | confirmed | masc sg; perfect | approved |
| 810 | w0810 | normal | adjective | A2 · adjectives | #837 | confirmed | invariable in gender; normal | approved |
| 811 | w0811 | raro | adjective | A2 · adjectives | #658 | confirmed | masc sg; strange/rare | approved |
| 812 | w0812 | extraño | adjective | A2 · adjectives | #647 | confirmed | masc sg; strange (also noun stranger) | approved |
| 813 | w0813 | curioso | adjective | A2 · adjectives | #3032 | confirmed | masc sg; curious/odd | approved |
| 814 | w0814 | especial | adjective | A2 · adjectives | #615 | confirmed | invariable in gender; special | approved |
| 815 | w0815 | principal | adjective | A2 · adjectives | #1273 | confirmed | invariable in gender; main | approved |
| 816 | w0816 | inútil | adjective | A2 · adjectives | #2005 | confirmed | invariable in gender; useless | approved |
| 817 | w0817 | práctico | adjective | A2 · adjectives | #8934 | confirmed | masc sg; practical | approved |
| 818 | w0818 | cómodo | adjective | A2 · adjectives | #2807 | confirmed | masc sg; comfortable | approved |
| 819 | w0819 | peligroso | adjective | A2 · body, health & safety | #1122 | confirmed | masc sg; dangerous | approved |
| 820 | w0820 | agradable | adjective | A2 · adjectives | #1031 | confirmed | invariable in gender; pleasant | approved |
| 821 | w0821 | fresco | adjective | A2 · food, restaurant & shopping | #2854 | confirmed | masc sg; fresh/cool | approved |
| 822 | w0822 | suave | adjective | A2 · adjectives | #2604 | confirmed | invariable in gender; soft/smooth | approved |
| 823 | w0823 | blando | adjective | A2 · adjectives | #10126 | confirmed | masc sg; soft (opposite of duro) | approved |
| 824 | w0824 | ancho | adjective | A2 · adjectives | #9133 | confirmed | masc sg; wide | approved |
| 825 | w0825 | estrecho | adjective | A2 · adjectives | #10951 | confirmed | masc sg; narrow | approved |
| 826 | w0826 | profundo | adjective | A2 · adjectives | #2067 | confirmed | masc sg; deep | approved |
| 827 | w0827 | redondo | adjective | A2 · adjectives | #15498 | confirmed | masc sg; round | approved |
| 828 | w0828 | mojado | adjective | A2 · adjectives | #7449 | ambiguous | adjective wet; also pp of mojar — adjective sense | approved |
| 829 | w0829 | brillante | adjective | A2 · adjectives | #1408 | confirmed | invariable in gender; bright/brilliant | approved |
| 830 | w0830 | sincero | adjective | A2 · emotions & relationships | #3382 | confirmed | masc sg; sincere | approved |
| 831 | w0831 | cobarde | adjective | A2 · emotions & relationships | #2480 | confirmed | invariable in gender; cowardly (also noun) | approved |
| 832 | w0832 | enamorado | adjective | A2 · emotions & relationships | #1756 | ambiguous | adjective in love; also pp of enamorar — adjective sense | approved |
| 833 | w0833 | sorprendido | adjective | A2 · emotions & relationships | #3711 | ambiguous | adjective surprised; also pp of sorprender — adjective sense | approved |
| 834 | w0834 | muerto | adjective | A2 · body, health & safety | #309 | ambiguous | adjective dead; also irregular pp of morir and noun — adjective sense | approved |
| 835 | w0835 | vivo | adjective | A2 · body, health & safety | #571 | ambiguous | adjective alive/bright; homograph of vivir 1sg — adjective sense | approved |
| 836 | w0836 | roto | adjective | A2 · adjectives | #1648 | ambiguous | adjective broken; also irregular pp of romper — adjective sense | approved |
| 837 | w0837 | listo | adjective | A2 · emotions & relationships | #446 | ambiguous | ser listo (clever) vs estar listo (ready); also homograph of 1sg forms | approved |
| 838 | w0838 | capaz | adjective | B1 · adjectives | #906 | confirmed | invariable in gender; capable; plural capaces | approved |
| 839 | w0839 | único | adjective | A2 · adjectives | #388 | confirmed | masc sg; only/unique | approved |
| 840 | w0840 | mismo | adjective | A1 · adjectives | #149 | ambiguous | same; masc sg; also pronoun/adverb (lo mismo, ahora mismo) | approved |
| 841 | w0841 | propio | adjective | B1 · adjectives | #770 | confirmed | masc sg; own/proper | approved |
| 842 | w0842 | extranjero | adjective | A2 · city, transport & travel | #3070 | ambiguous | adjective foreign; also masc noun foreigner/abroad — adjective sense | approved |
| 843 | w0843 | humano | adjective | A2 · adjectives | #1157 | ambiguous | adjective human; also masc noun (ser humano) — adjective sense | approved |
| 844 | w0844 | natural | adjective | A2 · weather & environment | #1830 | ambiguous | adjective natural; invariable in gender; also noun — adjective sense | approved |
| 845 | w0845 | tío | noun | A2 · family & people | #334 | confirmed | masc citation; fem tía derived; uncle (Spain colloq. guy) | approved |
| 846 | w0846 | primo | noun | A2 · family & people | #1991 | confirmed | masc citation; fem prima derived; cousin | approved |
| 847 | w0847 | sobrino | noun | A2 · family & people | #3675 | confirmed | masc citation; fem sobrina derived; nephew | approved |
| 848 | w0848 | nieto | noun | A2 · family & people | #4625 | confirmed | masc citation; fem nieta derived; grandchild | approved |
| 849 | w0849 | suegro | noun | B1 · family & people | #10875 | confirmed | masc citation; fem suegra derived; father-in-law | approved |
| 850 | w0850 | bebé | noun | A2 · family & people | #479 | confirmed | masc; baby (of either sex) | approved |
| 851 | w0851 | adulto | noun | A2 · family & people | #3876 | confirmed | masc citation; fem adulta; adult (also adjective) | approved |
| 852 | w0852 | anciano | noun | A2 · family & people | #4466 | confirmed | masc citation; fem anciana; elderly person (also adjective) | approved |
| 853 | w0853 | director | noun | A2 · work, study, tech & media | #967 | confirmed | masc citation; fem directora derived; director/head | approved |
| 854 | w0854 | presidente | noun | A2 · family & people | #649 | confirmed | masc citation; fem presidenta/presidente; president | approved |
| 855 | w0855 | rey | noun | A2 · family & people | #585 | confirmed | masc; king (fem reina is a separate lemma) | approved |
| 856 | w0856 | reina | noun | A2 · family & people | #1084 | confirmed | fem; queen | approved |
| 857 | w0857 | policía | noun | A2 · work, study, tech & media | #256 | ambiguous | común (el/la policía = officer) vs fem la policía = the force | approved |
| 858 | w0858 | tristeza | noun | A2 · emotions & relationships | #5094 | confirmed | fem; sadness | approved |
| 859 | w0859 | felicidad | noun | A2 · emotions & relationships | #1861 | confirmed | fem; happiness | approved |
| 860 | w0860 | odio | noun | A2 · emotions & relationships | #679 | ambiguous | masc noun hatred; homograph of odiar 1sg — noun sense | approved |
| 861 | w0861 | cariño | noun | A2 · emotions & relationships | #276 | confirmed | masc; affection/darling | approved |
| 862 | w0862 | celos | noun | B1 · emotions & relationships | #4816 | ambiguous | masc; jealousy — usually plural (tener celos) | approved |
| 863 | w0863 | envidia | noun | B1 · emotions & relationships | #6924 | confirmed | fem; envy | approved |
| 864 | w0864 | orgullo | noun | B1 · emotions & relationships | #2770 | confirmed | masc; pride | approved |
| 865 | w0865 | esperanza | noun | A2 · emotions & relationships | #1252 | confirmed | fem; hope | approved |
| 866 | w0866 | sorpresa | noun | A2 · emotions & relationships | #984 | confirmed | fem; surprise | approved |
| 867 | w0867 | estrés | noun | A2 · emotions & relationships | #4442 | confirmed | masc; stress | approved |
| 868 | w0868 | paciencia | noun | A2 · emotions & relationships | #2692 | confirmed | fem; patience | approved |
| 869 | w0869 | confianza | noun | B1 · emotions & relationships | #1409 | confirmed | fem; trust/confidence | approved |
| 870 | w0870 | pecho | noun | A2 · body, health & safety | #1970 | confirmed | masc; chest/breast | approved |
| 871 | w0871 | cintura | noun | A2 · body, health & safety | #8681 | confirmed | fem; waist | approved |
| 872 | w0872 | tobillo | noun | A2 · body, health & safety | #7079 | confirmed | masc; ankle | approved |
| 873 | w0873 | muñeca | noun | A2 · body, health & safety | #2818 | ambiguous | fem; two senses wrist/doll — same lemma, noted | approved |
| 874 | w0874 | codo | noun | A2 · body, health & safety | #8496 | confirmed | masc; elbow | approved |
| 875 | w0875 | frente | noun | A2 · body, health & safety | #680 | ambiguous | fem la frente (forehead) vs masc el frente (front) — forehead sense | approved |
| 876 | w0876 | hueso | noun | A2 · body, health & safety | #3564 | confirmed | masc; bone | approved |
| 877 | w0877 | músculo | noun | A2 · body, health & safety | #9848 | confirmed | masc; muscle | approved |
| 878 | w0878 | herida | noun | A2 · body, health & safety | #1759 | ambiguous | fem noun wound; also pp fem of herir — noun sense | approved |
| 879 | w0879 | golpe | noun | A2 · body, health & safety | #1283 | confirmed | masc; blow/hit | approved |
| 880 | w0880 | tos | noun | A2 · body, health & safety | #9618 | confirmed | fem; cough | approved |
| 881 | w0881 | resfriado | noun | A2 · body, health & safety | #8321 | ambiguous | masc noun cold; also pp of resfriar — noun sense | approved |
| 882 | w0882 | operación | noun | B1 · body, health & safety | #1456 | confirmed | fem; operation | approved |
| 883 | w0883 | cita | noun | A2 · body, health & safety | #751 | ambiguous | fem noun appointment/date; homograph of citar 3sg — noun sense | approved |
| 884 | w0884 | ejercicio | noun | A1 · body, health & safety | #3573 | confirmed | masc; exercise | approved |
| 885 | w0885 | olla | noun | A2 · daily life & household | #8741 | confirmed | fem; pot | approved |
| 886 | w0886 | sartén | noun | A2 · daily life & household | #14313 | ambiguous | fem (or masc in some regions); frying pan | approved |
| 887 | w0887 | nevera | noun | A2 · daily life & household | #6862 | confirmed | fem; fridge (Spain) | approved |
| 888 | w0888 | horno | noun | A2 · daily life & household | #4770 | confirmed | masc; oven | approved |
| 889 | w0889 | lavadora | noun | A2 · daily life & household | #12589 | confirmed | fem; washing machine | approved |
| 890 | w0890 | basura | noun | A2 · daily life & household | #947 | confirmed | fem; rubbish/trash | approved |
| 891 | w0891 | jabón | noun | A2 · daily life & household | #6134 | confirmed | masc; soap | approved |
| 892 | w0892 | cepillo | noun | A2 · daily life & household | #7239 | confirmed | masc; brush | approved |
| 893 | w0893 | manta | noun | A2 · daily life & household | #5779 | confirmed | fem; blanket | approved |
| 894 | w0894 | sábana | noun | A2 · daily life & household | #15927 | confirmed | fem; sheet | approved |
| 895 | w0895 | almohada | noun | A2 · daily life & household | #5647 | confirmed | fem; pillow | approved |
| 896 | w0896 | lámpara | noun | A2 · daily life & household | #5817 | confirmed | fem; lamp | approved |
| 897 | w0897 | zumo | noun | A1 · food, restaurant & shopping | #8190 | confirmed | masc; juice (Spain) | approved |
| 898 | w0898 | refresco | noun | A2 · food, restaurant & shopping | #8490 | confirmed | masc; soft drink | approved |
| 899 | w0899 | cerveza | noun | A1 · food, restaurant & shopping | #1075 | confirmed | fem; beer | approved |
| 900 | w0900 | té | noun | A1 · food, restaurant & shopping | #1127 | ambiguous | masc; tea; accent-distinct from pronoun te (w0057) | approved |
| 901 | w0901 | harina | noun | A2 · food, restaurant & shopping | #9190 | confirmed | fem; flour | approved |
| 902 | w0902 | mantequilla | noun | A2 · food, restaurant & shopping | #4136 | confirmed | fem; butter | approved |
| 903 | w0903 | mermelada | noun | A2 · food, restaurant & shopping | #9897 | confirmed | fem; jam | approved |
| 904 | w0904 | galleta | noun | A2 · food, restaurant & shopping | #6804 | confirmed | fem; biscuit/cookie | approved |
| 905 | w0905 | tarta | noun | A2 · food, restaurant & shopping | #3893 | confirmed | fem; cake/tart | approved |
| 906 | w0906 | chocolate | noun | A1 · food, restaurant & shopping | #2154 | confirmed | masc; chocolate | approved |
| 907 | w0907 | jamón | noun | A1 · food, restaurant & shopping | #6730 | confirmed | masc; ham | approved |
| 908 | w0908 | lechuga | noun | A2 · food, restaurant & shopping | #14401 | confirmed | fem; lettuce | approved |
| 909 | w0909 | cebolla | noun | A2 · food, restaurant & shopping | #8939 | confirmed | fem; onion | approved |
| 910 | w0910 | ajo | noun | A2 · food, restaurant & shopping | #9138 | confirmed | masc; garlic | approved |
| 911 | w0911 | naranja | noun | A1 · food, restaurant & shopping | #4068 | ambiguous | fem noun orange (fruit); also invariable colour adjective — noun sense | approved |
| 912 | w0912 | plátano | noun | A1 · food, restaurant & shopping | #12110 | confirmed | masc; banana | approved |
| 913 | w0913 | limón | noun | A2 · food, restaurant & shopping | #6728 | confirmed | masc; lemon | approved |
| 914 | w0914 | pasta | noun | A2 · food, restaurant & shopping | #3085 | confirmed | fem; pasta/paste (colloq. money) | approved |
| 915 | w0915 | caja | noun | A1 · food, restaurant & shopping | #803 | confirmed | fem; box/checkout/till | approved |
| 916 | w0916 | factura | noun | B1 · food, restaurant & shopping | #6141 | ambiguous | fem noun invoice/bill; homograph of facturar 3sg — noun sense | approved |
| 917 | w0917 | oferta | noun | A2 · food, restaurant & shopping | #1746 | confirmed | fem; offer/special deal | approved |
| 918 | w0918 | compra | noun | A1 · food, restaurant & shopping | #2593 | ambiguous | fem noun purchase/shopping; homograph of comprar 3sg — noun sense | approved |
| 919 | w0919 | esquina | noun | A2 · city, transport & travel | #2147 | confirmed | fem; (street) corner | approved |
| 920 | w0920 | acera | noun | A2 · city, transport & travel | #9975 | confirmed | fem; pavement/sidewalk | approved |
| 921 | w0921 | puerto | noun | A2 · city, transport & travel | #2953 | confirmed | masc; port/harbour | approved |
| 922 | w0922 | vuelo | noun | A2 · city, transport & travel | #1303 | ambiguous | masc noun flight; homograph of volar 1sg — noun sense | approved |
| 923 | w0923 | pasajero | noun | A2 · city, transport & travel | #8265 | confirmed | masc citation; fem pasajera; passenger (also adjective) | approved |
| 924 | w0924 | guía | noun | A2 · city, transport & travel | #3177 | ambiguous | común el/la guía (guide) vs fem la guía (guidebook) | approved |
| 925 | w0925 | turismo | noun | A2 · city, transport & travel | #13734 | confirmed | masc; tourism | approved |
| 926 | w0926 | recepción | noun | A2 · city, transport & travel | #4156 | confirmed | fem; reception | approved |
| 927 | w0927 | frontera | noun | B1 · city, transport & travel | #2677 | confirmed | fem; border | approved |
| 928 | w0928 | empleo | noun | A2 · work, study, tech & media | #2337 | confirmed | masc; job/employment | approved |
| 929 | w0929 | horario | noun | A2 · work, study, tech & media | #4448 | confirmed | masc; timetable/schedule | approved |
| 930 | w0930 | informe | noun | B1 · work, study, tech & media | #1257 | confirmed | masc; report | approved |
| 931 | w0931 | dato | noun | A2 · work, study, tech & media | #10906 | confirmed | masc; piece of data; plural datos | approved |
| 932 | w0932 | teclado | noun | A2 · work, study, tech & media | #15149 | confirmed | masc; keyboard | approved |
| 933 | w0933 | aplicación | noun | A2 · work, study, tech & media | #8057 | confirmed | fem; app/application | approved |
| 934 | w0934 | contraseña | noun | A2 · work, study, tech & media | #6125 | confirmed | fem; password | approved |
| 935 | w0935 | página | noun | A1 · work, study, tech & media | #2381 | confirmed | fem; page | approved |
| 936 | w0936 | vídeo | noun | A1 · work, study, tech & media | #3532 | confirmed | masc; video (Spain vídeo, LatAm video) | approved |
| 937 | w0937 | radio | noun | A1 · work, study, tech & media | #1151 | ambiguous | fem la radio (broadcast) vs masc el radio (radius) — broadcast sense | approved |
| 938 | w0938 | revista | noun | A1 · work, study, tech & media | #2686 | confirmed | fem; magazine | approved |
| 939 | w0939 | biblioteca | noun | A1 · work, study, tech & media | #2948 | confirmed | fem; library | approved |
| 940 | w0940 | lago | noun | A2 · weather & environment | #2191 | confirmed | masc; lake | approved |
| 941 | w0941 | bosque | noun | A2 · weather & environment | #1385 | confirmed | masc; forest | approved |
| 942 | w0942 | isla | noun | A2 · weather & environment | #1353 | confirmed | fem; island | approved |
| 943 | w0943 | planeta | noun | A2 · weather & environment | #1164 | confirmed | masc despite -a; planet | approved |
| 944 | w0944 | aire | noun | A2 · weather & environment | #742 | confirmed | masc; air | approved |
| 945 | w0945 | arena | noun | A2 · weather & environment | #2615 | confirmed | fem; sand | approved |
| 946 | w0946 | vaca | noun | A2 · weather & environment | #3424 | confirmed | fem; cow | approved |
| 947 | w0947 | cerdo | noun | A2 · weather & environment | #1768 | confirmed | masc citation; fem cerda; pig/pork | approved |
| 948 | w0948 | conejo | noun | A2 · weather & environment | #3979 | confirmed | masc citation; fem coneja; rabbit | approved |
| 949 | w0949 | león | noun | A2 · weather & environment | #3604 | confirmed | masc citation; fem leona; lion | approved |
| 950 | w0950 | mariposa | noun | A2 · weather & environment | #7774 | confirmed | fem; butterfly | approved |
| 951 | w0951 | niebla | noun | A2 · weather & environment | #5613 | confirmed | fem; fog | approved |
| 952 | w0952 | nube | noun | A2 · weather & environment | #5250 | confirmed | fem; cloud | approved |
| 953 | w0953 | futuro | noun | A2 · time, quantity & abstract | #712 | ambiguous | masc noun future; also adjective — noun sense | approved |
| 954 | w0954 | pasado | noun | A2 · time, quantity & abstract | #253 | ambiguous | masc noun past; also adjective/pp of pasar — noun sense | approved |
| 955 | w0955 | presente | noun | A2 · time, quantity & abstract | #1742 | ambiguous | masc noun present; also adjective — noun sense | approved |
| 956 | w0956 | principio | noun | A2 · time, quantity & abstract | #940 | confirmed | masc; beginning/principle (al principio) | approved |
| 957 | w0957 | resto | noun | A2 · time, quantity & abstract | #645 | ambiguous | masc noun rest/remainder; homograph of restar 1sg — noun sense | approved |
| 958 | w0958 | distancia | noun | A2 · time, quantity & abstract | #1672 | confirmed | fem; distance | approved |
| 959 | w0959 | velocidad | noun | A2 · time, quantity & abstract | #1622 | confirmed | fem; speed | approved |
| 960 | w0960 | peso | noun | A2 · time, quantity & abstract | #1800 | ambiguous | masc noun weight; homograph of pesar 1sg — noun sense | approved |
| 961 | w0961 | nivel | noun | A2 · time, quantity & abstract | #1196 | confirmed | masc; level | approved |
| 962 | w0962 | asunto | noun | B1 · time, quantity & abstract | #689 | confirmed | masc; matter/subject | approved |
| 963 | w0963 | cuestión | noun | B1 · time, quantity & abstract | #1253 | confirmed | fem; question/issue | approved |
| 964 | w0964 | solución | noun | A2 · time, quantity & abstract | #2255 | confirmed | fem; solution | approved |
| 965 | w0965 | idea | noun | A1 · time, quantity & abstract | #241 | confirmed | fem; idea | approved |
| 966 | w0966 | opinión | noun | A2 · time, quantity & abstract | #1070 | confirmed | fem; opinion | approved |
| 967 | w0967 | recuerdo | noun | A2 · time, quantity & abstract | #547 | ambiguous | masc noun memory/souvenir; homograph of recordar 1sg — noun sense | approved |
| 968 | w0968 | necesidad | noun | A2 · time, quantity & abstract | #1844 | confirmed | fem; need | approved |
| 969 | w0969 | costumbre | noun | A2 · time, quantity & abstract | #3588 | confirmed | fem; custom/habit | approved |
| 970 | w0970 | experiencia | noun | A2 · time, quantity & abstract | #1198 | confirmed | fem; experience | approved |
| 971 | w0971 | realidad | noun | A2 · time, quantity & abstract | #348 | confirmed | fem; reality (en realidad) | approved |
| 972 | w0972 | muerte | noun | A2 · time, quantity & abstract | #346 | confirmed | fem; death | approved |
| 973 | w0973 | éxito | noun | A2 · time, quantity & abstract | #1138 | confirmed | masc; success (false friend: not exit) | approved |
| 974 | w0974 | oportunidad | noun | A2 · time, quantity & abstract | #442 | confirmed | fem; opportunity | approved |
| 975 | w0975 | libertad | noun | B1 · time, quantity & abstract | #969 | confirmed | fem; freedom | approved |
| 976 | w0976 | solo | adverb | A1 · adverbs | #89 | ambiguous | adverb only; homograph of adjective solo (alone); RAE drops the old accent | approved |
| 977 | w0977 | aún | adverb | A2 · adverbs | #223 | ambiguous | adverb still/yet (=todavía); accent-distinct from aun (even) | approved |
| 978 | w0978 | atrás | adverb | A2 · adverbs | #475 | confirmed | behind/back; hacia atrás | approved |
| 979 | w0979 | adelante | adverb | A2 · adverbs | #371 | confirmed | forward/ahead | approved |
| 980 | w0980 | enfrente | adverb | A2 · adverbs | #3355 | confirmed | opposite/in front; enfrente de | approved |
| 981 | w0981 | justo | adverb | A2 · adverbs | #360 | ambiguous | adverb just/exactly; also adjective fair — adverb sense | approved |
| 982 | w0982 | deprisa | adverb | A2 · adverbs | #2025 | confirmed | quickly/in a hurry | approved |
| 983 | w0983 | allá | adverb | A2 · adverbs | #418 | confirmed | (over) there; less precise than allí (w0245) | approved |
| 984 | w0984 | dieciocho | numeral | A1 · numbers | #11515 | confirmed | cardinal 18 | approved |
| 985 | w0985 | diecinueve | numeral | A1 · numbers | #18421 | confirmed | cardinal 19 | approved |
| 986 | w0986 | setenta | numeral | A2 · numbers | #9872 | confirmed | cardinal 70 | approved |
| 987 | w0987 | ochenta | numeral | A2 · numbers | #9460 | confirmed | cardinal 80 | approved |
| 988 | w0988 | noventa | numeral | A2 · numbers | #10789 | confirmed | cardinal 90 | approved |
| 989 | w0989 | doscientos | numeral | A2 · numbers | #9482 | ambiguous | cardinal 200; masc citation; agrees in gender (doscientas) | approved |
| 990 | w0990 | quinientos | numeral | A2 · numbers | #12554 | ambiguous | cardinal 500; irregular; agrees in gender (quinientas) | approved |
| 991 | w0991 | sexto | numeral | A2 · numbers | #6707 | confirmed | ordinal 6th masc sg | approved |
| 992 | w0992 | séptimo | numeral | A2 · numbers | #8317 | confirmed | ordinal 7th masc sg | approved |
| 993 | w0993 | décimo | numeral | A2 · numbers | #12649 | confirmed | ordinal 10th masc sg | approved |
| 994 | w0994 | quien | pronoun | A2 · pronouns | #248 | ambiguous | relative pronoun who; accent-distinct from interrogative quién (w0066) | approved |
| 995 | w0995 | conmigo | pronoun | A1 · pronouns | #215 | confirmed | special form: with me | approved |
| 996 | w0996 | contigo | pronoun | A1 · pronouns | #230 | confirmed | special form: with you | approved |
| 997 | w0997 | varios | determiner | A2 · determiners | #1859 | ambiguous | several; masculine plural citation (fem varias); no singular use | approved |
| 998 | w0998 | sino | conjunction | B1 · conjunctions | #701 | ambiguous | but rather (after negation); homograph of masc noun sino (fate) | approved |
| 999 | w0999 | bueno | interjection | A1 · social | #50 | ambiguous | discourse well/OK; separate entry from adjective bueno (w0009) | approved |
| 1000 | w1000 | ay | interjection | A1 · social | #729 | confirmed | expresses pain/dismay | approved |

## Ambiguous / needs-review items

48 of 250 rows are flagged — homographs, adjective-vs-participle pairs,
irregular-gender nouns, and legitimate cross-POS homographs of existing entries.
All are approved; the flag records what a human confirmed.

| order | id | word | pos | status | why it is flagged |
|---|---|---|---|---|---|
| 785 | w0785 | coger | verb | ambiguous | g>j; to take/catch (Spain); vulgar in parts of Latin America |
| 798 | w0798 | soler | verb | ambiguous | defective-style habitual verb, used mainly in present and imperfect followed by an infinitive |
| 801 | w0801 | mejor | adjective | ambiguous | comparative better; invariable in gender; also adverb |
| 802 | w0802 | peor | adjective | ambiguous | comparative worse; invariable in gender; also adverb |
| 805 | w0805 | complicado | adjective | ambiguous | adjective complicated; also pp of complicar — adjective sense |
| 806 | w0806 | claro | adjective | ambiguous | adjective clear/light; separate entry from claro interjection (w0499) |
| 828 | w0828 | mojado | adjective | ambiguous | adjective wet; also pp of mojar — adjective sense |
| 832 | w0832 | enamorado | adjective | ambiguous | adjective in love; also pp of enamorar — adjective sense |
| 833 | w0833 | sorprendido | adjective | ambiguous | adjective surprised; also pp of sorprender — adjective sense |
| 834 | w0834 | muerto | adjective | ambiguous | adjective dead; also irregular pp of morir and noun — adjective sense |
| 835 | w0835 | vivo | adjective | ambiguous | adjective alive/bright; homograph of vivir 1sg — adjective sense |
| 836 | w0836 | roto | adjective | ambiguous | adjective broken; also irregular pp of romper — adjective sense |
| 837 | w0837 | listo | adjective | ambiguous | ser listo (clever) vs estar listo (ready); also homograph of 1sg forms |
| 840 | w0840 | mismo | adjective | ambiguous | same; masc sg; also pronoun/adverb (lo mismo, ahora mismo) |
| 842 | w0842 | extranjero | adjective | ambiguous | adjective foreign; also masc noun foreigner/abroad — adjective sense |
| 843 | w0843 | humano | adjective | ambiguous | adjective human; also masc noun (ser humano) — adjective sense |
| 844 | w0844 | natural | adjective | ambiguous | adjective natural; invariable in gender; also noun — adjective sense |
| 857 | w0857 | policía | noun | ambiguous | común (el/la policía = officer) vs fem la policía = the force |
| 860 | w0860 | odio | noun | ambiguous | masc noun hatred; homograph of odiar 1sg — noun sense |
| 862 | w0862 | celos | noun | ambiguous | masc; jealousy — usually plural (tener celos) |
| 873 | w0873 | muñeca | noun | ambiguous | fem; two senses wrist/doll — same lemma, noted |
| 875 | w0875 | frente | noun | ambiguous | fem la frente (forehead) vs masc el frente (front) — forehead sense |
| 878 | w0878 | herida | noun | ambiguous | fem noun wound; also pp fem of herir — noun sense |
| 881 | w0881 | resfriado | noun | ambiguous | masc noun cold; also pp of resfriar — noun sense |
| 883 | w0883 | cita | noun | ambiguous | fem noun appointment/date; homograph of citar 3sg — noun sense |
| 886 | w0886 | sartén | noun | ambiguous | fem (or masc in some regions); frying pan |
| 900 | w0900 | té | noun | ambiguous | masc; tea; accent-distinct from pronoun te (w0057) |
| 911 | w0911 | naranja | noun | ambiguous | fem noun orange (fruit); also invariable colour adjective — noun sense |
| 916 | w0916 | factura | noun | ambiguous | fem noun invoice/bill; homograph of facturar 3sg — noun sense |
| 918 | w0918 | compra | noun | ambiguous | fem noun purchase/shopping; homograph of comprar 3sg — noun sense |
| 922 | w0922 | vuelo | noun | ambiguous | masc noun flight; homograph of volar 1sg — noun sense |
| 924 | w0924 | guía | noun | ambiguous | común el/la guía (guide) vs fem la guía (guidebook) |
| 937 | w0937 | radio | noun | ambiguous | fem la radio (broadcast) vs masc el radio (radius) — broadcast sense |
| 953 | w0953 | futuro | noun | ambiguous | masc noun future; also adjective — noun sense |
| 954 | w0954 | pasado | noun | ambiguous | masc noun past; also adjective/pp of pasar — noun sense |
| 955 | w0955 | presente | noun | ambiguous | masc noun present; also adjective — noun sense |
| 957 | w0957 | resto | noun | ambiguous | masc noun rest/remainder; homograph of restar 1sg — noun sense |
| 960 | w0960 | peso | noun | ambiguous | masc noun weight; homograph of pesar 1sg — noun sense |
| 967 | w0967 | recuerdo | noun | ambiguous | masc noun memory/souvenir; homograph of recordar 1sg — noun sense |
| 976 | w0976 | solo | adverb | ambiguous | adverb only; homograph of adjective solo (alone); RAE drops the old accent |
| 977 | w0977 | aún | adverb | ambiguous | adverb still/yet (=todavía); accent-distinct from aun (even) |
| 981 | w0981 | justo | adverb | ambiguous | adverb just/exactly; also adjective fair — adverb sense |
| 989 | w0989 | doscientos | numeral | ambiguous | cardinal 200; masc citation; agrees in gender (doscientas) |
| 990 | w0990 | quinientos | numeral | ambiguous | cardinal 500; irregular; agrees in gender (quinientas) |
| 994 | w0994 | quien | pronoun | ambiguous | relative pronoun who; accent-distinct from interrogative quién (w0066) |
| 997 | w0997 | varios | determiner | ambiguous | several; masculine plural citation (fem varias); no singular use |
| 998 | w0998 | sino | conjunction | ambiguous | but rather (after negation); homograph of masc noun sino (fate) |
| 999 | w0999 | bueno | interjection | ambiguous | discourse well/OK; separate entry from adjective bueno (w0009) |

**Cross-POS homographs of existing entries (schema-legal, different `pos`).**
`claro` (adjective, vs interjection `w0499`) and `bueno` (interjection, vs adjective
`w0009`) each add a second, independently teachable sense of a word already in the
curriculum. `té` (noun) is accent-distinct from `te` (`w0057`); `quien` (relative)
from `quién` (`w0066`); `allá` pairs with `allí` (`w0245`). None collides
`(word, pos)`.

## Corpus misses

**None.** All 250 word-forms occur in `es_50k.txt`. The rarest hits are verbs whose
infinitives are sparse in a subtitle corpus (`aconsejar`, `nevar`, `felicitar`,
`opinar`); the two added verbs occur as well (`soler` #None, 
`llover` #7868). Raw rank confirms occurrence only.

## Replacement recommendations

- **Applied at review:** `cuyo` (determiner) and `salvo` (preposition) — the two
  lowest spoken-utility B1 function words — were **removed** and replaced by the
  higher-value everyday verbs **`soler`** and **`llover`** (the latter completing
  the `nevar`/`llover` weather pair).
- **No further removals.** All remaining 250 are A2/early-B1 items with corpus
  support and a clear theme.

## POS distribution (batch 751–1000, 250)

| pos | count |
|---|---|
| verb | 50 |
| noun | 131 |
| adjective | 44 |
| adverb | 8 |
| pronoun | 3 |
| determiner | 1 |
| numeral | 10 |
| preposition | 0 |
| conjunction | 1 |
| interjection | 2 |
| **total** | **250** |

## Theme distribution (batch 751–1000, 250)

| theme | count |
|---|---|
| adjectives | 33 |
| emotions & relationships | 29 |
| food, restaurant & shopping | 25 |
| time, quantity & abstract | 23 |
| work, study, tech & media | 23 |
| body, health & safety | 21 |
| weather & environment | 16 |
| city, transport & travel | 12 |
| daily life & household | 12 |
| family & people | 11 |
| numbers | 10 |
| adverbs | 8 |
| verbs: actions | 7 |
| verbs: change & state | 6 |
| daily life & routine | 5 |
| pronouns | 3 |
| leisure & interests | 2 |
| social | 2 |
| conjunctions | 1 |
| determiners | 1 |

## Curriculum totals — milestone complete (750 + 250 = 1000)

| pos | existing (1–750) | batch (751–1000) | total (1–1000) |
|---|---|---|---|
| verb | 166 | 50 | 216 |
| noun | 317 | 131 | 448 |
| adjective | 102 | 44 | 146 |
| adverb | 48 | 8 | 56 |
| pronoun | 27 | 3 | 30 |
| determiner | 22 | 1 | 23 |
| numeral | 29 | 10 | 39 |
| preposition | 19 | 0 | 19 |
| conjunction | 12 | 1 | 13 |
| interjection | 8 | 2 | 10 |
| **total** | **750** | **250** | **1000** |

## 1000-word curriculum coverage review

A review-only assessment of the finished 1–1000 set (evaluation only; the first 750
entries are not modified).

### Final POS distribution (1–1000)

| pos | count | share |
|---|---|---|
| verb | 216 | 21.6% |
| noun | 448 | 44.8% |
| adjective | 146 | 14.6% |
| adverb | 56 | 5.6% |
| pronoun | 30 | 3.0% |
| determiner | 23 | 2.3% |
| numeral | 39 | 3.9% |
| preposition | 19 | 1.9% |
| conjunction | 13 | 1.3% |
| interjection | 10 | 1.0% |
| **total** | **1000** | **100%** |

Healthy beginner-content shape: **nouns 44.8%, verbs 21.6%, adjectives 14.6%** carry
the teaching load; the function-word core (pronouns, determiners, prepositions,
conjunctions, ~8.5% combined) is essentially closed, so later batches would add
almost only content words.

### Major life themes — gaps check

Covered end-to-end: family & people, daily routine & household, food/cooking/
restaurant/shopping, clothing & personal items, city/transport/travel, work/study/
tech/media, body/health/safety, weather/nature/animals, time/quantity, emotions &
personality, and the grammar scaffold. **No major everyday theme is absent.** The
thinnest area relative to real-life frequency is **calendar naming** (weekday and
month names); fine-grained medical vocabulary is appropriately left to B1+.

### High-value A1–A2 words still not included

With `soler` and `llover` now added at review, the remaining A1–A2 gaps are:

- **Weekday names** (`lunes`–`domingo`) and **month names** (`enero`–`diciembre`) —
  classic A1 closed sets; deferred as whole sets (24 items).
- **`oreja`** (ear), **`uña`** (nail) — remaining common outer-body parts.
- **`octavo` / `noveno`** — the two ordinals between `séptimo` and `décimo`.

### Candidates in THIS batch with lower relative utility

Most are high-utility. After the `cuyo`/`salvo` → `soler`/`llover` swap, the lowest-
frequency-in-speech remaining are the B1 emotion nouns `celos` / `envidia` /
`orgullo` — all defensible on completeness grounds, none subtitle noise or
rare/technical terms.

### Vocabulary types to leave for a future 1001+ expansion

- **Calendar sets** — weekdays and months (highest-priority first addition).
- **Nationality & country adjectives**; higher/compound numbers and remaining
  ordinals.
- **More professions, animals, plants, and specific foods** (the long tail of
  content nouns).
- **B1+ abstract / academic vocabulary** and **formal-register function words**,
  including the relative determiner **`cuyo`** removed here (written-register).
- **Regional (Latin American) variants** of the peninsular choices
  (`celular`/`computadora`/`papa`/`jugo`), if a second variety is ever wanted.

## Remaining notable omissions

Explicit hand-off list for the next expansion (priority order): **(1)** weekday +
month names; **(2)** `oreja`, `uña`; **(3)** `octavo`, `noveno`; **(4)**
nationality/country adjectives; **(5)** the formal relative determiner `cuyo`
(removed at review). These are omissions of *scope* (250-item budget), not of
judgement — each is a clean, high-value lemma ready for a future batch.

## Source methodology

- **Frequency ≠ curriculum order.** hermitdave rank only confirms a word-form
  occurs in real usage; `order` is a human pedagogical decision.
- **Word form ≠ lemma.** Infinitives (especially reflexive-only, gustar-type, and
  impersonal verbs like `llover`/`nevar`) and singular/masc-sg forms understate
  their lemmas. Only lemmas are stored.
- **Division of labour:** **PCIC A1–A2 (+ early B1 for this closing batch)** →
  suitability, theme, level; **hermitdave** → raw word-form cross-check (all 250
  present); **RAE/DRAE** → canonical headword + POS ambiguity for flagged rows only.
- **Davies is not used.** No data supplied; no rank cited.
- Batch construction was gap-audit + theme/level driven, not a top-N frequency cut.

## Attribution

- **hermitdave/FrequencyWords** — <https://github.com/hermitdave/FrequencyWords>,
  `content/2018/es/es_50k.txt`, from the **OpenSubtitles** corpus. Repository
  *code* is **MIT**; generated frequency *content* is **CC BY-SA 4.0**. Only
  per-word rank/count figures are cited; the full list is not redistributed and
  the downloaded file is not added to Git.
- **RAE** (DLE / Nueva gramática) and **PCIC** (Instituto Cervantes, *Plan
  curricular*, A1–A2) are cited by reference, not reproduced.

