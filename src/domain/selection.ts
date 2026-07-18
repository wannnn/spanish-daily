/**
 * Daily word selection — a pure function. No I/O, no clock, no randomness.
 *
 * Contract: docs/architecture.md §5. Selection picks the unlearned word with the
 * lowest `order`; the curated `order` defines the learning sequence. The same
 * inputs always yield the same result.
 */

import { learnedIds } from './history.js';
import type { HistoryRecord, VocabularyEntry } from './types.js';

/**
 * What today's run should do.
 *
 * - `selected` — today has no record yet; this is the next word to teach.
 * - `replay` — today already has a record; the day is done and re-running is a
 *   no-op. The record is returned rather than a vocabulary entry: a record is
 *   self-describing (docs/architecture.md §3), so replay holds even after the
 *   word has left the curriculum.
 * - `exhausted` — today has no record and every vocabulary id has been learned.
 */
export type SelectionResult =
  | { readonly kind: 'selected'; readonly entry: VocabularyEntry }
  | { readonly kind: 'replay'; readonly record: HistoryRecord }
  | { readonly kind: 'exhausted' };

/**
 * Decide today's word.
 *
 * @param vocabulary The validated vocabulary, in any order.
 * @param history The validated history.
 * @param today The Asia/Taipei date, as `YYYY-MM-DD`.
 */
export function selectWord(
  vocabulary: readonly VocabularyEntry[],
  history: readonly HistoryRecord[],
  today: string,
): SelectionResult {
  // Idempotent replay comes first: once today is recorded, nothing is selected
  // again, whether or not the recorded id still exists in the vocabulary.
  const todaysRecord = history.find((record) => record.date === today);
  if (todaysRecord !== undefined) {
    return { kind: 'replay', record: todaysRecord };
  }

  // The candidate set is the complement of the learned set, which is what makes
  // teaching the same word twice structurally impossible (§7).
  const learned = learnedIds(history);

  // A single pass rather than a sort, so the caller's array is never touched.
  // `order` is unique across the vocabulary, so there is no tie to break and the
  // result does not depend on input order.
  let next: VocabularyEntry | undefined;
  for (const entry of vocabulary) {
    if (learned.has(entry.id)) continue;
    if (next === undefined || entry.order < next.order) {
      next = entry;
    }
  }

  if (next === undefined) {
    return { kind: 'exhausted' };
  }

  return { kind: 'selected', entry: next };
}
