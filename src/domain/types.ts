/**
 * Domain types.
 *
 * Vocabulary contract: docs/vocabulary-spec.md (Schema Version 1).
 * History contract: docs/architecture.md §3.
 */

/**
 * The closed POS enumeration (vocabulary-spec §4).
 *
 * The set of values may grow with a spec version bump; the field never becomes
 * free text or optional.
 */
export const POS_VALUES = [
  'verb',
  'noun',
  'adjective',
  'adverb',
  'pronoun',
  'determiner',
  'numeral',
  'preposition',
  'conjunction',
  'interjection',
] as const;

export type Pos = (typeof POS_VALUES)[number];

/**
 * One vocabulary entry: a lexical item stored in its canonical (dictionary)
 * form. Exactly four fields — no more, no fewer (vocabulary-spec §2).
 */
export type VocabularyEntry = {
  /** Permanent, immutable identity. Pattern `^w[0-9]{4,}$`. Never reused. */
  readonly id: string;
  /** The canonical Spanish word: lowercase, NFC-normalized, no annotations. */
  readonly word: string;
  /** Curriculum position. Positive integer, unique, gaps allowed. */
  readonly order: number;
  /** Grammatical category, from the closed enum. */
  readonly pos: Pos;
};

/**
 * One day's learning record (docs/architecture.md §3).
 *
 * `history.jsonl` is append-only, one record per day, keyed by date. `word` is
 * redundant against the vocabulary but kept deliberately: an entry may be
 * removed from the vocabulary while its `id` remains here, so a record must stay
 * readable on its own.
 */
export type HistoryRecord = {
  /** The Asia/Taipei calendar date, strictly `YYYY-MM-DD`. Unique per file. */
  readonly date: string;
  /** The vocabulary entry's id. Same format as `VocabularyEntry.id`. */
  readonly id: string;
  /** The word taught that day, as it stood in the vocabulary at the time. */
  readonly word: string;
};
