/**
 * Vocabulary domain types.
 *
 * Contract: docs/vocabulary-spec.md (Schema Version 1).
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
