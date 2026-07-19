/**
 * The generation task and the acceptance gate — pure functions, no I/O.
 *
 * Contract: docs/architecture.md §4–§5. Stage 1 has three steps, and the two
 * Node-side ones live here:
 *
 * - **prepare** turns validated vocabulary and history into a deterministic
 *   task: exactly what a lesson needs, and the single path it may be written to.
 * - **accept** checks the document that came back against that task.
 *
 * Neither knows how generation is invoked. Nothing here reads a clock, a file,
 * the process, or the network, and nothing here names a platform.
 *
 * Acceptance is a gate, not a critic. It asks whether the document is usable as
 * canonical data — never whether the Spanish is good. That is the prompt's job
 * (docs/lesson-spec.md §5), and a validator that guessed at it would throw away
 * good work.
 */

import { isCalendarDate } from './date.js';
import {
  LESSON_SCHEMA_VERSION,
  LessonValidationError,
  lessonRelativePath,
  parseLesson,
  renderLesson,
} from './lesson.js';
import { selectWord } from './selection.js';
import type {
  HistoryRecord,
  Lesson,
  LessonMetadata,
  Pos,
  VocabularyEntry,
} from './types.js';

/**
 * Everything the generation step is trusted with, and nothing else.
 *
 * Every value is derived, not negotiated: the generator copies the metadata
 * verbatim into the frontmatter and writes to `targetPath` alone. Acceptance
 * then checks the result against this same task, which is what keeps
 * docs/lesson-spec.md §1 true — the metadata is not the generator's to invent.
 *
 * Deliberately absent: `order` (curriculum position, irrelevant to content),
 * history, prompt, model, Git or platform metadata, and any status flag.
 */
export type LessonGenerationTask = {
  /** The vocabulary entry this lesson belongs to. */
  readonly id: string;
  /** The canonical Spanish word to teach, as a lemma. */
  readonly word: string;
  /** Part of speech, which selects the Word-forms template. */
  readonly pos: Pos;
  /** The Asia/Taipei date this lesson is for, as `YYYY-MM-DD`. */
  readonly date: string;
  /** The schema the document must be written to. */
  readonly lessonSchemaVersion: number;
  /** The one repository-relative POSIX path the lesson may be written to. */
  readonly targetPath: string;
};

/**
 * What today's run should do.
 *
 * A named variant, never `null` or `undefined`: a day with nothing to generate
 * is an ordinary outcome, not a missing value.
 *
 * - `generate` — this is the task for today.
 * - `replay` — today is already recorded; generation must not run.
 * - `exhausted` — every vocabulary id has been learned. An ordinary success.
 */
export type PrepareLessonResult =
  | { readonly kind: 'generate'; readonly task: LessonGenerationTask }
  | { readonly kind: 'replay'; readonly record: HistoryRecord }
  | { readonly kind: 'exhausted' };

/** Preparation could not produce a trustworthy task. */
export class LessonPreparationError extends Error {
  override readonly name = 'LessonPreparationError';
}

/** A generated document is not acceptable as canonical data. */
export class LessonAcceptanceError extends Error {
  override readonly name = 'LessonAcceptanceError';
}

/** The metadata fields a document must reproduce exactly, in frontmatter order. */
const TASK_METADATA_FIELDS = ['id', 'word', 'pos', 'date', 'lessonSchemaVersion'] as const;

/** Every field a task carries, and no others. */
const TASK_FIELDS = [...TASK_METADATA_FIELDS, 'targetPath'] as const;

/**
 * Validate a task that has come back from outside the process.
 *
 * A task written to a file and read again has crossed a boundary where the
 * static type means nothing, so every field is checked as if it were untrusted —
 * because it is.
 *
 * `targetPath` is not merely checked for shape: it must be exactly what
 * `lessonRelativePath` derives from the rest of the task. The path therefore
 * carries no independent information, and a hand-edited task cannot redirect a
 * lesson somewhere the metadata does not point.
 *
 * @throws {LessonPreparationError} The value is not a trustworthy task.
 */
export function parseGenerationTask(raw: unknown): LessonGenerationTask {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new LessonPreparationError(
      `A generation task must be a JSON object, but found ${describeType(raw)}.`,
    );
  }

  const value = raw as Record<string, unknown>;

  assertExactFields(value, TASK_FIELDS, 'A generation task');

  for (const field of ['id', 'word', 'pos', 'date', 'targetPath'] as const) {
    if (typeof value[field] !== 'string') {
      throw new LessonPreparationError(
        `A generation task's ${JSON.stringify(field)} must be a string, ` +
          `but found ${describeType(value[field])}.`,
      );
    }
  }
  if (typeof value['lessonSchemaVersion'] !== 'number') {
    throw new LessonPreparationError(
      `A generation task's "lessonSchemaVersion" must be a number, ` +
        `but found ${describeType(value['lessonSchemaVersion'])}.`,
    );
  }

  const metadata: LessonMetadata = {
    id: value['id'] as string,
    word: value['word'] as string,
    pos: value['pos'] as Pos,
    date: value['date'] as string,
    lessonSchemaVersion: value['lessonSchemaVersion'],
  };

  // Derives the path, which also runs the whole metadata contract: a bad id,
  // word, pos, date, or schema version fails here rather than being carried
  // forward into a commit.
  let derivedPath: string;
  try {
    derivedPath = lessonRelativePath(metadata);
  } catch (cause) {
    throw new LessonPreparationError(
      `A generation task is not valid: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }

  const targetPath = value['targetPath'] as string;
  if (targetPath !== derivedPath) {
    throw new LessonPreparationError(
      `A generation task's "targetPath" is ${JSON.stringify(targetPath)}, but its ` +
        `metadata derives ${JSON.stringify(derivedPath)}. The path is not a ` +
        'separate choice — it follows from the id and the date.',
    );
  }

  return { ...metadata, targetPath };
}

/**
 * Read back exactly what the preparation step printed, and return its task.
 *
 * The unit passed between the two steps is a whole `PrepareLessonResult`, not a
 * bare task: preparation has three outcomes and only one of them carries a task,
 * so the envelope is what makes the other two legible instead of looking like a
 * malformed file.
 *
 * A `replay` or `exhausted` result is a refusal, not a failure of the file. It
 * says the day needed no generation, so there is nothing to finalize — and a run
 * that got this far was sequenced wrongly.
 *
 * @throws {LessonPreparationError} The value is not a preparation result, or is
 *   one that carries no task.
 */
export function parsePreparedTask(raw: unknown): LessonGenerationTask {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new LessonPreparationError(
      `A prepared result must be a JSON object, but found ${describeType(raw)}.`,
    );
  }

  const value = raw as Record<string, unknown>;
  const kind = value['kind'];

  // Each variant's shape is checked before its outcome is reported, so a
  // malformed file is never mistaken for a well-formed refusal — "this is not a
  // preparation result" and "this day needed no lesson" are different problems.
  switch (kind) {
    case 'generate':
      assertExactFields(value, ['kind', 'task'], 'A prepared "generate" result');
      return parseGenerationTask(value['task']);

    case 'replay':
      assertExactFields(value, ['kind', 'record'], 'A prepared "replay" result');
      throw new LessonPreparationError(
        'This prepared result records a replay: the day was already learned, so no ' +
          'lesson was generated and there is nothing to finalize.',
      );

    case 'exhausted':
      assertExactFields(value, ['kind'], 'A prepared "exhausted" result');
      throw new LessonPreparationError(
        'This prepared result records an exhausted curriculum: no word was selected, ' +
          'so no lesson was generated and there is nothing to finalize.',
      );

    default:
      throw new LessonPreparationError(
        `A prepared result must have a "kind" of "generate", "replay", or ` +
          `"exhausted", but found ${describeType(kind)}.`,
      );
  }
}

/**
 * Exactly these fields, no more and no fewer.
 *
 * Shared by the two parsers in this module rather than written out four times.
 * It is deliberately not exported and not a general utility: it exists because
 * this file validates four closely related object shapes, and a second copy of
 * the loop would be a second place for the wording to drift.
 *
 * @param what How to name the value in an error, e.g. "A generation task".
 * @throws {LessonPreparationError}
 */
function assertExactFields(
  value: Record<string, unknown>,
  fields: readonly string[],
  what: string,
): void {
  for (const field of Object.keys(value)) {
    if (!fields.includes(field)) {
      throw new LessonPreparationError(
        `${what} has an unknown field ${JSON.stringify(field)}. ` +
          `Allowed fields are ${fields.map((name) => `"${name}"`).join(', ')}.`,
      );
    }
  }

  const missing = fields.filter((field) => !(field in value));
  if (missing.length > 0) {
    throw new LessonPreparationError(
      `${what} is missing ${missing.map((name) => `"${name}"`).join(', ')}.`,
    );
  }
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'nothing';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'object') return 'an object';
  return `${typeof value} (${JSON.stringify(value)})`;
}

/**
 * Decide what today's run should do, and on `generate` build the task.
 *
 * Deterministic and non-mutating: the same inputs always yield the same result,
 * and neither input array is touched. Selection itself is not reimplemented
 * here — `selectWord` owns the algorithm (docs/architecture.md §5) and this
 * function only composes it.
 *
 * @param vocabulary The already-validated vocabulary, in any order.
 * @param history The already-validated history.
 * @param today The Asia/Taipei date, as `YYYY-MM-DD`.
 * @throws {LessonPreparationError} If `today` is not a real calendar date.
 * @throws {LessonValidationError} If a validated entry still fails the lesson
 *   metadata rules. Unreachable through the loaders, and left unwrapped so that
 *   a contract drift between the two layers surfaces as itself.
 */
export function prepareLesson(
  vocabulary: readonly VocabularyEntry[],
  history: readonly HistoryRecord[],
  today: string,
): PrepareLessonResult {
  // `today` is a runtime input, and the date is compared against history and
  // baked into both the frontmatter and the path. `lessonRelativePath` would
  // catch a bad one on the `generate` branch, but replay and exhaustion never
  // reach it — an invalid date would silently match no record and look like an
  // ordinary outcome. Checking once here covers all three.
  if (!isCalendarDate(today)) {
    throw new LessonPreparationError(
      `today must be a real calendar date in YYYY-MM-DD form, ` +
        `but found ${JSON.stringify(today)}.`,
    );
  }

  const selection = selectWord(vocabulary, history, today);

  switch (selection.kind) {
    case 'replay':
      return { kind: 'replay', record: selection.record };

    case 'exhausted':
      return { kind: 'exhausted' };

    case 'selected': {
      const metadata: LessonMetadata = {
        id: selection.entry.id,
        word: selection.entry.word,
        pos: selection.entry.pos,
        date: today,
        lessonSchemaVersion: LESSON_SCHEMA_VERSION,
      };

      // `order` is deliberately dropped here: it decides which word is taught,
      // never what the lesson says (docs/lesson-spec.md §1).
      return {
        kind: 'generate',
        task: { ...metadata, targetPath: lessonRelativePath(metadata) },
      };
    }
  }
}

/**
 * Accept — or reject — the document the generation step wrote.
 *
 * The checks, in order: the path is the one the task named; the document parses;
 * its metadata equals the task field by field; and the document is already in
 * canonical form.
 *
 * Structural validation is not repeated here. `parseLesson` runs the full
 * canonical contract — frontmatter fields, metadata rules, schema version, and
 * `validateLessonBody` — so re-checking would only duplicate it.
 *
 * @param task The task the generation step was given.
 * @param actualPath The repository-relative path the document was written to.
 * @param document The file's exact contents.
 * @returns The parsed lesson, for the caller to commit.
 * @throws {LessonAcceptanceError} On the first failed check. A parse failure
 *   keeps the underlying `LessonValidationError` as its `cause`.
 */
export function acceptGeneratedLesson(
  task: LessonGenerationTask,
  actualPath: string,
  document: string,
): Lesson {
  if (actualPath !== task.targetPath) {
    throw new LessonAcceptanceError(
      `lesson was written to ${JSON.stringify(actualPath)}, but the task allows ` +
        `only ${JSON.stringify(task.targetPath)}.`,
    );
  }

  let lesson: Lesson;
  try {
    lesson = parseLesson(document);
  } catch (error) {
    if (error instanceof LessonValidationError) {
      // The document itself is never quoted into the message: it is a whole
      // lesson, and the underlying error already locates the problem.
      throw new LessonAcceptanceError(
        `lesson at ${task.targetPath} is not a valid canonical document: ${error.message}`,
        { cause: error },
      );
    }
    throw error;
  }

  assertMetadataMatchesTask(lesson.metadata, task);

  // The canonical form check, against the raw bytes rather than a normalized
  // copy (docs/architecture.md §4). The generator's job is to write a canonical
  // file, so a document that would only pass after being cleaned up has not done
  // that job. Acceptance never rewrites or repairs.
  const canonical = renderLesson(lesson);
  if (canonical !== document) {
    throw new LessonAcceptanceError(
      `lesson at ${task.targetPath} is not in canonical form: ` +
        `${describeDrift(document, canonical)}. The file must be written exactly as ` +
        'the canonical renderer would write it; acceptance does not rewrite it.',
    );
  }

  return lesson;
}

/**
 * Every metadata field must be reproduced exactly.
 *
 * Field by field rather than by comparing serialized forms, so the message names
 * what disagrees. The values are short identifiers, safe to quote.
 */
function assertMetadataMatchesTask(
  metadata: LessonMetadata,
  task: LessonGenerationTask,
): void {
  for (const field of TASK_METADATA_FIELDS) {
    if (metadata[field] !== task[field]) {
      throw new LessonAcceptanceError(
        `lesson at ${task.targetPath} has ${JSON.stringify(field)} ` +
          `${JSON.stringify(metadata[field])}, but the task specifies ` +
          `${JSON.stringify(task[field])}. The task's metadata is copied verbatim, ` +
          'never chosen by the generator.',
      );
    }
  }
}

/**
 * Why a document is not canonical, in one short clause.
 *
 * The three whole-file causes are named directly because they are the likely
 * ones and a line number would not explain them. Anything else falls back to the
 * first differing line — a location, never the content.
 */
function describeDrift(document: string, canonical: string): string {
  if (document.includes('\r\n')) {
    return 'it uses CRLF line endings, and a canonical lesson uses LF';
  }
  if (!document.endsWith('\n')) {
    return 'it does not end with a newline';
  }
  if (document.endsWith('\n\n')) {
    return 'it ends with more than one newline';
  }

  return `it first differs from canonical form at line ${firstDifferingLine(document, canonical)}`;
}

/** The 1-based number of the first line on which two documents differ. */
function firstDifferingLine(document: string, canonical: string): number {
  const actual = document.split('\n');
  const expected = canonical.split('\n');
  const limit = Math.max(actual.length, expected.length);

  for (let index = 0; index < limit; index += 1) {
    if (actual[index] !== expected[index]) return index + 1;
  }

  // Only reached if the two are equal, which the caller has already ruled out.
  return limit;
}
