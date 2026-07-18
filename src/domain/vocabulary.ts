/**
 * Vocabulary validation — a pure function over already-parsed JSON.
 *
 * Authoritative contract: docs/vocabulary-spec.md (Schema Version 1).
 *
 * There is no partial-accept mode: a value that violates any ERROR rule is
 * rejected whole, and validation halts on the first violation it finds
 * (vocabulary-spec §5, "Loader behavior"). This module performs no I/O.
 */

import { POS_VALUES, type Pos, type VocabularyEntry } from './types.js';

/** The only fields an entry may carry. Strict schema (vocabulary-spec §5). */
export const ALLOWED_FIELDS = ['id', 'word', 'order', 'pos'] as const;

/** `w` followed by at least four digits, so the list can grow past `w9999`. */
const ID_PATTERN = /^w[0-9]{4,}$/;

/** Maximum edit distance at which an unknown field gets a spelling suggestion. */
const SUGGESTION_MAX_DISTANCE = 2;

export class VocabularyValidationError extends Error {
  override readonly name = 'VocabularyValidationError';
}

/**
 * Validate a parsed JSON value against the vocabulary contract.
 *
 * @param raw The result of `JSON.parse` on the vocabulary file.
 * @returns The validated entries.
 * @throws {VocabularyValidationError} On the first contract violation.
 */
export function validateVocabulary(raw: unknown): VocabularyEntry[] {
  if (!Array.isArray(raw)) {
    throw fail(
      `Vocabulary must be a JSON array, but found ${describeType(raw)}.`,
    );
  }

  // Array.from, not map: map skips holes in a sparse array, which would let
  // them through as undefined. Array.from materializes them so the entry check
  // rejects them like any other non-object.
  const entries = Array.from(raw, (entry, index) => validateEntry(entry, index));

  assertNoDuplicates(entries);

  return entries;
}

function validateEntry(raw: unknown, index: number): VocabularyEntry {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw fail(
      `Entry at index ${index} must be a JSON object, but found ${describeType(raw)}.`,
    );
  }

  const entry = raw as Record<string, unknown>;
  const where = locate(entry, index);

  assertNoUnknownFields(entry, where);
  assertNoMissingFields(entry, where);

  const id = entry['id'];
  if (typeof id !== 'string') {
    throw fail(`${where}: "id" must be a string, but found ${describeType(id)}.`);
  }
  if (!ID_PATTERN.test(id)) {
    throw fail(
      `${where}: "id" must match ${ID_PATTERN.source} ` +
        `(a "w" followed by at least four digits, e.g. "w0001"), but found ${JSON.stringify(id)}.`,
    );
  }

  const word = entry['word'];
  if (typeof word !== 'string') {
    throw fail(
      `${where}: "word" must be a string, but found ${describeType(word)}.`,
    );
  }
  assertCanonicalWord(word, where);

  const order = entry['order'];
  if (typeof order !== 'number' || !Number.isInteger(order)) {
    throw fail(
      `${where}: "order" must be an integer, but found ${describeType(order)}.`,
    );
  }
  if (order < 1) {
    throw fail(`${where}: "order" must be >= 1, but found ${order}.`);
  }

  const pos = entry['pos'];
  if (typeof pos !== 'string') {
    throw fail(`${where}: "pos" must be a string, but found ${describeType(pos)}.`);
  }
  if (!isPos(pos)) {
    throw fail(
      `${where}: "pos" must be one of ${formatList(POS_VALUES)}, ` +
        `but found ${JSON.stringify(pos)}.`,
    );
  }

  return { id, word, order, pos };
}

function assertNoUnknownFields(
  entry: Record<string, unknown>,
  where: string,
): void {
  for (const field of Object.keys(entry)) {
    if (isAllowedField(field)) continue;

    const suggestion = suggestField(field);
    throw fail(
      `${where}: unknown field ${JSON.stringify(field)}. ` +
        `Allowed fields are ${formatList(ALLOWED_FIELDS)}.` +
        (suggestion === undefined ? '' : ` Did you mean "${suggestion}"?`),
    );
  }
}

function assertNoMissingFields(
  entry: Record<string, unknown>,
  where: string,
): void {
  const missing = ALLOWED_FIELDS.filter((field) => !(field in entry));
  if (missing.length > 0) {
    throw fail(
      `${where}: missing required ${missing.length === 1 ? 'field' : 'fields'} ` +
        `${formatList(missing)}. Every entry must carry ${formatList(ALLOWED_FIELDS)}.`,
    );
  }
}

/** Canonical-form constraints on `word` (vocabulary-spec §2). */
function assertCanonicalWord(word: string, where: string): void {
  if (word.length === 0) {
    throw fail(`${where}: "word" must not be empty.`);
  }
  if (word !== word.trim()) {
    throw fail(
      `${where}: "word" must not have leading or trailing whitespace, but found ${JSON.stringify(word)}.`,
    );
  }
  if (word !== word.normalize('NFC')) {
    throw fail(
      `${where}: "word" must be Unicode NFC-normalized, but found a differently normalized form of ${JSON.stringify(word)}.`,
    );
  }
  if (word !== word.toLowerCase()) {
    throw fail(
      `${where}: "word" must be lowercase, but found ${JSON.stringify(word)}.`,
    );
  }
}

/**
 * Cross-entry uniqueness (vocabulary-spec §5).
 *
 * A duplicate `word` on its own is allowed — homographs are legitimate — but the
 * `(word, pos)` pair must be unique.
 */
function assertNoDuplicates(entries: readonly VocabularyEntry[]): void {
  const seenIds = new Map<string, number>();
  const seenOrders = new Map<number, string>();
  const seenWordPos = new Map<string, string>();

  entries.forEach((entry, index) => {
    const firstIdIndex = seenIds.get(entry.id);
    if (firstIdIndex !== undefined) {
      throw fail(
        `Duplicate "id" ${JSON.stringify(entry.id)} at index ${index}, ` +
          `already used at index ${firstIdIndex}. An id is an identity and must be unique.`,
      );
    }
    seenIds.set(entry.id, index);

    const firstOrderId = seenOrders.get(entry.order);
    if (firstOrderId !== undefined) {
      throw fail(
        `Duplicate "order" ${entry.order} on entries ${firstOrderId} and ${entry.id}. ` +
          `Order must be a total ordering, so a tie would make the next word nondeterministic.`,
      );
    }
    seenOrders.set(entry.order, entry.id);

    // JSON encoding of the tuple, so no separator character can collide.
    const pairKey = JSON.stringify([entry.word, entry.pos]);
    const firstPairId = seenWordPos.get(pairKey);
    if (firstPairId !== undefined) {
      throw fail(
        `Duplicate (word, pos) pair (${JSON.stringify(entry.word)}, ${JSON.stringify(entry.pos)}) ` +
          `on entries ${firstPairId} and ${entry.id}. The same word with the same part of speech is an accidental duplicate; ` +
          `a homograph must differ in "pos".`,
      );
    }
    seenWordPos.set(pairKey, entry.id);
  });
}

/**
 * Where an error happened: the entry's `id` when it is usable for locating the
 * problem, otherwise its position in the array (vocabulary-spec §5).
 */
function locate(entry: Record<string, unknown>, index: number): string {
  const id = entry['id'];
  if (typeof id === 'string' && ID_PATTERN.test(id)) {
    return `Entry ${id} (index ${index})`;
  }
  return `Entry at index ${index}`;
}

function isAllowedField(field: string): boolean {
  return (ALLOWED_FIELDS as readonly string[]).includes(field);
}

function isPos(value: string): value is Pos {
  return (POS_VALUES as readonly string[]).includes(value);
}

/**
 * The closest allowed field name, when one is close enough to be a plausible
 * typo. Deliberately a plain edit-distance check — no fuzzy-matching library.
 */
function suggestField(field: string): string | undefined {
  const candidate = field.toLowerCase();
  let best: string | undefined;
  let bestDistance = Infinity;

  for (const allowed of ALLOWED_FIELDS) {
    const distance = editDistance(candidate, allowed);

    // Close in absolute terms, and closer than the allowed name is long —
    // without the second condition every two-character field "matches" "id".
    if (distance > SUGGESTION_MAX_DISTANCE || distance >= allowed.length) {
      continue;
    }
    if (distance < bestDistance) {
      best = allowed;
      bestDistance = distance;
    }
  }

  return best;
}

/** Levenshtein distance. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      const insertion = current[j - 1]! + 1;
      const deletion = previous[j]! + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }
    previous = current;
  }

  return previous[b.length]!;
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return `the non-integer number ${value}`;
  }
  if (typeof value === 'object') return 'an object';
  if (typeof value === 'undefined') return 'undefined';
  return `${typeof value} (${JSON.stringify(value)})`;
}

function formatList(values: readonly string[]): string {
  return values.map((value) => `"${value}"`).join(', ');
}

function fail(message: string): VocabularyValidationError {
  return new VocabularyValidationError(message);
}
