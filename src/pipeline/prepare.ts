/**
 * Stage 1's preparation step — everything that happens before generation.
 *
 * Contract: docs/architecture.md §5. A composition root, like `finalize.ts`: it
 * decides the order of operations and owns the canonical paths, and every rule
 * it applies belongs to a module underneath it.
 *
 * It touches no network and writes nothing. "Which word is today's" is answered
 * by pure functions from committed data, so it can be answered offline and at
 * no cost.
 *
 * The clock is supplied by the caller. Nothing here reads the current time,
 * and nothing here knows about Claude, GitHub Actions, or any projection.
 */

import { join } from 'node:path';

import { taipeiDate } from '../domain/date.js';
import { prepareLesson, type PrepareLessonResult } from '../domain/lessonTask.js';
import type { HistoryRecord } from '../domain/types.js';
import { assertWorkingTreeClean, inspectWorkingTree } from '../io/git.js';
import { HistoryLoadError, loadHistory } from '../io/historyStore.js';
import { loadVocabulary } from '../io/vocabularyStore.js';
import { HISTORY_PATH } from './finalize.js';

/**
 * The canonical vocabulary file, relative to the repository root.
 *
 * Fixed for the same reason `HISTORY_PATH` is: there is exactly one of it
 * (docs/architecture.md §3), so a caller that could name another could only be
 * naming the wrong one.
 */
export const VOCABULARY_PATH = 'vocabulary.json';

export type PrepareDailyLessonInput = {
  /** The worktree root. Not a subdirectory of it. */
  readonly repositoryRoot: string;
  /** The instant to treat as now. Converted to the Asia/Taipei date. */
  readonly now: Date;
};

/** Preparation could not run. Not "there is nothing to do" — that is a result. */
export class DailyPrepareError extends Error {
  override readonly name = 'DailyPrepareError';
}

/**
 * Decide what today's run should do, and on `generate` produce the task.
 *
 * The clean-worktree check comes first and is the reason this function exists
 * rather than the domain function alone. Stage 1 must begin from a repository
 * whose state it can account for: if something is already modified, staged, or
 * untracked, then after generation there would be no way to tell what the
 * generation step wrote from what was already there, and the run would commit
 * work it did not produce (docs/architecture.md §8).
 *
 * A missing `history.jsonl` is the first run. This path is chosen here, not
 * typed by a user, so it cannot be a typo — which is exactly the reason
 * `loadHistory` itself still refuses to invent an empty history.
 *
 * @throws {DailyPrepareError} The repository is dirty, or the canonical data
 *   could not be read. The original error is kept as `cause`.
 */
export async function prepareDailyLesson(
  input: PrepareDailyLessonInput,
): Promise<PrepareLessonResult> {
  const { repositoryRoot, now } = input;

  const changes = await during(
    'inspecting the working tree',
    () => inspectWorkingTree(repositoryRoot),
  );

  await during(
    'checking that the repository is clean before generation',
    () => assertWorkingTreeClean(changes),
  );

  const vocabulary = await during(
    `loading ${VOCABULARY_PATH}`,
    () => loadVocabulary(join(repositoryRoot, VOCABULARY_PATH)),
  );

  const history = await during(
    `loading ${HISTORY_PATH}`,
    () => loadTodaysHistory(join(repositoryRoot, HISTORY_PATH)),
  );

  const today = await during('computing the Asia/Taipei date', () => taipeiDate(now));

  return prepareLesson(vocabulary, history, today);
}

/** The committed history, or an empty one on the very first run. */
async function loadTodaysHistory(historyPath: string): Promise<HistoryRecord[]> {
  try {
    return await loadHistory(historyPath);
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

function isMissingFile(error: unknown): boolean {
  if (!(error instanceof HistoryLoadError)) return false;

  const cause: unknown = error.cause;
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'code' in cause &&
    (cause as { code?: unknown }).code === 'ENOENT'
  );
}

/** Run one step, and on failure say which step it was. */
async function during<T>(step: string, action: () => Promise<T> | T): Promise<T> {
  try {
    return await action();
  } catch (cause) {
    throw new DailyPrepareError(
      `Stage 1 could not prepare today's lesson while ${step}: ` +
        `${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}
