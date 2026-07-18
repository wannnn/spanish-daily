/**
 * Domain types.
 *
 * Vocabulary contract: docs/vocabulary-spec.md (Schema Version 1).
 * History contract: docs/architecture.md §3.
 * Lesson contract: docs/lesson-spec.md (Lesson Schema Version 1).
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

/**
 * The frontmatter of a canonical lesson document (docs/lesson-spec.md §2).
 *
 * Pipeline metadata only — it carries no teaching content, and the generator
 * never supplies it. Nothing adapter-specific belongs here.
 */
export type LessonMetadata = {
  /** The vocabulary entry this lesson belongs to. */
  readonly id: string;
  /** The canonical Spanish word being taught. */
  readonly word: string;
  /** Part of speech, which selects the Word-forms template. */
  readonly pos: Pos;
  /** The Asia/Taipei date the lesson was generated for, as `YYYY-MM-DD`. */
  readonly date: string;
  /** Serialized as `lesson_schema_version` in the frontmatter. */
  readonly lessonSchemaVersion: number;
};

/**
 * A canonical lesson: the first-class Git artifact of this system
 * (docs/architecture.md §4).
 *
 * `body` is the teaching material — the fixed sections of lesson-spec §2 — and
 * never includes the frontmatter, which is assembled at render time.
 */
export type Lesson = {
  readonly metadata: LessonMetadata;
  readonly body: string;
};
