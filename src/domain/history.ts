/**
 * History parsing and learned-set derivation — pure functions over file
 * contents. This module performs no I/O.
 *
 * Contract: docs/architecture.md §3. `history.jsonl` is append-only, one record
 * per day, keyed by date. The learned set is *derived* from it and is never
 * stored separately, because a second store can desync from the log.
 *
 * A history parse failure is treated as corruption (§8): the file is rejected
 * whole, never partially accepted.
 */

import { isCalendarDate } from './date.js';
import type { HistoryRecord } from './types.js';
import { canonicalWordViolation, isVocabularyId } from './vocabulary.js';

/** The only fields a record may carry. */
export const HISTORY_FIELDS = ['date', 'id', 'word'] as const;

export class HistoryValidationError extends Error {
  override readonly name = 'HistoryValidationError';
}

/**
 * Parse and fully validate the contents of `history.jsonl`.
 *
 * Blank lines are ignored so the file tolerates a trailing newline and stray
 * spacing. Every other line must be one complete JSON object.
 *
 * @param content The raw file contents.
 * @returns The records, in file order.
 * @throws {HistoryValidationError} On the first violation found.
 */
export function parseHistory(content: string): HistoryRecord[] {
  const parsed: { record: HistoryRecord; lineNumber: number }[] = [];

  content.split('\n').forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();

    if (line === '') return;

    parsed.push({ record: parseRecord(line, lineNumber), lineNumber });
  });

  assertNoDuplicates(parsed);

  return parsed.map(({ record }) => record);
}

/**
 * The set of vocabulary ids that have been learned.
 *
 * Identity is the `id` alone — never the `word`, which is only a readable copy
 * of what the vocabulary held at the time. An id that no longer exists in the
 * vocabulary stays in this set: words can leave the curriculum, but what has
 * been learned does not become unlearned (docs/architecture.md §5).
 */
export function learnedIds(records: readonly HistoryRecord[]): ReadonlySet<string> {
  return new Set(records.map((record) => record.id));
}

function parseRecord(line: string, lineNumber: number): HistoryRecord {
  const where = `history line ${lineNumber}`;

  let raw: unknown;
  try {
    raw = JSON.parse(line);
  } catch (cause) {
    throw fail(
      `${where}: not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw fail(`${where}: must be a JSON object, but found ${describeType(raw)}.`);
  }

  const record = raw as Record<string, unknown>;

  for (const field of Object.keys(record)) {
    if (!(HISTORY_FIELDS as readonly string[]).includes(field)) {
      throw fail(
        `${where}: unknown field ${JSON.stringify(field)}. ` +
          `Allowed fields are ${formatList(HISTORY_FIELDS)}.`,
      );
    }
  }

  const missing = HISTORY_FIELDS.filter((field) => !(field in record));
  if (missing.length > 0) {
    throw fail(
      `${where}: missing required ${missing.length === 1 ? 'field' : 'fields'} ` +
        `${formatList(missing)}. Every record must carry ${formatList(HISTORY_FIELDS)}.`,
    );
  }

  const date = record['date'];
  if (typeof date !== 'string') {
    throw fail(`${where}: "date" must be a string, but found ${describeType(date)}.`);
  }
  if (!isCalendarDate(date)) {
    throw fail(
      `${where}: "date" must be a real calendar date in YYYY-MM-DD form, ` +
        `but found ${JSON.stringify(date)}.`,
    );
  }

  const id = record['id'];
  if (typeof id !== 'string') {
    throw fail(`${where}: "id" must be a string, but found ${describeType(id)}.`);
  }
  if (!isVocabularyId(id)) {
    throw fail(
      `${where}: "id" must be a "w" followed by at least four digits ` +
        `(e.g. "w0001"), but found ${JSON.stringify(id)}.`,
    );
  }

  const word = record['word'];
  if (typeof word !== 'string') {
    throw fail(`${where}: "word" must be a string, but found ${describeType(word)}.`);
  }
  const violation = canonicalWordViolation(word);
  if (violation !== undefined) {
    throw fail(`${where}: "word" ${violation}, but found ${JSON.stringify(word)}.`);
  }

  return { date, id, word };
}

/**
 * One record per day, keyed by date (docs/architecture.md §3).
 *
 * A duplicate `id` is rejected for the same reason: the system cannot produce
 * one — selection draws from the complement of the learned set, so the same word
 * can never be selected twice (§7) — and spaced review is explicitly deferred
 * with no mechanism reserved for it (§13). A repeat therefore means the file has
 * been corrupted or hand-edited, which §8 says to surface, not absorb.
 */
function assertNoDuplicates(
  parsed: readonly { record: HistoryRecord; lineNumber: number }[],
): void {
  const seenDates = new Map<string, number>();
  const seenIds = new Map<string, number>();

  for (const { record, lineNumber } of parsed) {
    const firstDateLine = seenDates.get(record.date);
    if (firstDateLine !== undefined) {
      throw fail(
        `history line ${lineNumber}: duplicate date ${JSON.stringify(record.date)}, ` +
          `already recorded on line ${firstDateLine}. History holds one record per day.`,
      );
    }
    seenDates.set(record.date, lineNumber);

    const firstIdLine = seenIds.get(record.id);
    if (firstIdLine !== undefined) {
      throw fail(
        `history line ${lineNumber}: duplicate id ${JSON.stringify(record.id)}, ` +
          `already recorded on line ${firstIdLine}. A word is never taught twice.`,
      );
    }
    seenIds.set(record.id, lineNumber);
  }
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'object') return 'an object';
  return `${typeof value} (${JSON.stringify(value)})`;
}

function formatList(values: readonly string[]): string {
  return values.map((value) => `"${value}"`).join(', ');
}

function fail(message: string): HistoryValidationError {
  return new HistoryValidationError(message);
}
