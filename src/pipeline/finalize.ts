/**
 * Stage 1's durable write — the step that makes a day complete.
 *
 * Contract: docs/architecture.md §5–§6. This is a composition root: it decides
 * the *order* of operations and nothing else. Every rule it enforces is owned
 * elsewhere — selection and acceptance by `domain/`, the history file by
 * `io/historyStore.ts`, the repository by `io/git.ts` — and this module names
 * those adapters directly, which is the one place in the system permitted to.
 *
 * The ordering rule is the whole point:
 *
 *   > Nothing is appended to history and nothing is committed until the
 *   > generated file has passed every acceptance check.
 *
 * A rejected lesson therefore leaves history untouched, the day stays
 * unfinished, and re-running is safe. The two canonical writes — the lesson file
 * and the history record — land in one commit, because they are two halves of
 * one fact.
 *
 * **The durable write is the commit plus the push.** On an ephemeral runner an
 * unpushed commit does not exist, so completion is reported only after the push
 * returns.
 *
 * This module does not generate, does not select, and does not project. It runs
 * no scheduler and knows nothing about GitHub Actions, Claude, Notion, or
 * Telegram.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  acceptGeneratedLesson,
  parsePreparedTask,
  type LessonGenerationTask,
} from '../domain/lessonTask.js';
import type { HistoryRecord } from '../domain/types.js';
import {
  assertChangedPathsAre,
  assertFullyStaged,
  assertOnlyGeneratedLessonChange,
  createCommit,
  inspectWorkingTree,
  pushCurrentBranch,
  stagePaths,
} from '../io/git.js';
import { appendHistoryRecord } from '../io/historyStore.js';

/**
 * The canonical history file, relative to the repository root.
 *
 * Fixed here rather than accepted from a caller. `history.jsonl` is *the* source
 * of truth for what has been learned (docs/architecture.md §3) — there is only
 * ever one of it, so a caller that could name a different one could only ever be
 * wrong. Worse, it could name the lesson file that was just accepted, and a
 * JSONL row would be appended into canonical lesson content after every check
 * that would have caught it had already run.
 */
export const HISTORY_PATH = 'history.jsonl';

export type DurableWriteInput = {
  /** The worktree root. Not a subdirectory of it. */
  readonly repositoryRoot: string;
  /** The task the generation step was given. */
  readonly task: LessonGenerationTask;
  /** Overrides the message derived from the task. */
  readonly commitMessage?: string;
};

/**
 * What was durably written.
 *
 * A record of what happened, not a verdict about it: this value exists only
 * when the push has already succeeded, so there is no boolean to inspect and no
 * status to interpret. Failure is an exception, never a returned shape.
 */
export type DurableWriteResult = {
  /** Repository-relative path of the committed lesson. */
  readonly lessonPath: string;
  /** Always `HISTORY_PATH`. Reported so a caller need not restate it. */
  readonly historyPath: string;
  /** Full hash of the commit carrying both, now on the remote. */
  readonly commit: string;
};

/** A stage of the durable write failed. The `cause` is the original error. */
export class DurableWriteError extends Error {
  override readonly name = 'DurableWriteError';
}

/**
 * The commit message for a lesson, derived from its task.
 *
 * Deterministic, so the same day always produces the same message and a caller
 * that wants the default does not have to compose one.
 */
export function lessonCommitMessage(task: LessonGenerationTask): string {
  return `lesson: add ${task.word} (${task.id}) for ${task.date}`;
}

/**
 * Accept the generated lesson and durably record the day.
 *
 * The sequence, in the only order that preserves the invariant:
 *
 * 1. inspect the working tree
 * 2. confirm generation changed only the expected lesson file
 * 3. read that file
 * 4. accept it against the task
 * 5. append the history record
 * 6. re-inspect: the lesson and the history file, and nothing else
 * 7. stage exactly those two paths
 * 8. confirm the index holds exactly those two paths
 * 9. commit
 * 10. push
 *
 * Nothing is undone on failure. There is no reset, no checkout, no revert, and
 * no force push — a failed run leaves the repository exactly as it was when the
 * step failed, because guessing at a rollback can destroy work this function did
 * not create. Each error names the stage and what is known to be on disk.
 *
 * @throws {DurableWriteError} Any stage failed. See `cause` for the original.
 */
export async function finalizeLesson(
  input: DurableWriteInput,
): Promise<DurableWriteResult> {
  const { repositoryRoot, task } = input;

  const lessonPath = task.targetPath;
  const historyPath = HISTORY_PATH;

  // The lesson path is generated, not fixed, so the two could in principle
  // collide. If they ever did, appending history would corrupt the lesson that
  // was just accepted — after every check that could have caught it.
  if (lessonPath === historyPath) {
    throw new DurableWriteError(
      `The task's target path is ${JSON.stringify(historyPath)}, which is the ` +
        'canonical history file. A lesson can never be written there.',
    );
  }

  const expectedPaths = [lessonPath, historyPath];
  const message = input.commitMessage ?? lessonCommitMessage(task);

  const generated = await during(
    'inspecting the working tree after generation',
    'Nothing has been written or committed.',
    () => inspectWorkingTree(repositoryRoot),
  );

  await during(
    'checking that generation changed only the lesson file',
    'History is untouched and nothing has been committed.',
    () => assertOnlyGeneratedLessonChange(generated, lessonPath),
  );

  const document = await during(
    `reading the generated lesson at ${lessonPath}`,
    'History is untouched and nothing has been committed.',
    () => readFile(join(repositoryRoot, lessonPath), 'utf8'),
  );

  await during(
    'accepting the generated lesson',
    'History is untouched and nothing has been committed. The generated file is ' +
      'left in place so it can be inspected.',
    () => acceptGeneratedLesson(task, lessonPath, document),
  );

  // The record is derived from the task, never supplied. A caller-provided
  // record could disagree with the lesson that was just accepted, and then the
  // two halves of the commit would describe different days.
  const record: HistoryRecord = { date: task.date, id: task.id, word: task.word };

  await during(
    'appending the history record',
    `The lesson at ${lessonPath} is left in place and nothing has been committed.`,
    () => appendHistoryRecord(join(repositoryRoot, historyPath), record),
  );

  const written = await during(
    're-inspecting the working tree before staging',
    `The history record has been appended, but nothing has been staged or committed.`,
    () => inspectWorkingTree(repositoryRoot),
  );

  await during(
    'checking that only the lesson and the history file changed',
    'The history record has been appended, but nothing has been staged or committed.',
    () => assertChangedPathsAre(written, expectedPaths),
  );

  await during(
    'staging the lesson and the history record',
    'Both files are written; the index may be partially staged.',
    () => stagePaths(repositoryRoot, expectedPaths),
  );

  const staged = await during(
    'checking the staged changes',
    'Both files are written and staged; nothing has been committed.',
    () => inspectWorkingTree(repositoryRoot),
  );

  await during(
    'checking that exactly the lesson and the history record are staged',
    'Both files are written; nothing has been committed.',
    () => assertFullyStaged(staged, expectedPaths),
  );

  const commit = await during(
    'creating the commit',
    'Both files are written and staged; nothing has been committed or pushed.',
    () => createCommit(repositoryRoot, message),
  );

  // The push is what makes the day real, so its failure gets a message of its
  // own: the commit hash is the single most useful thing to know afterwards.
  try {
    await pushCurrentBranch(repositoryRoot);
  } catch (cause) {
    throw new DurableWriteError(
      `Stage 1 created commit ${commit} but could not push it: ${messageOf(cause)} ` +
        '— the day is not complete until the push succeeds. The commit is preserved ' +
        'locally and nothing has been undone.',
      { cause },
    );
  }

  return { lessonPath, historyPath, commit };
}

export type FinalizeDailyLessonInput = {
  /** The worktree root. Not a subdirectory of it. */
  readonly repositoryRoot: string;
  /**
   * Path to the JSON the preparation step printed. Must be outside the
   * repository working tree — it is scratch data, not repository content.
   */
  readonly taskFilePath: string;
  /** Overrides the message derived from the task. */
  readonly commitMessage?: string;
};

/**
 * Read the task the preparation step produced, then run the durable write.
 *
 * The task has been outside the process — written to a file, carried across a
 * step boundary, possibly edited — so it is validated in full before it is
 * trusted, including that its `targetPath` is the one its own metadata derives.
 *
 * **Recovery is not automatic.** If this fails after the commit was created,
 * re-running is not guaranteed to work: the lesson and the history record are
 * already committed locally, so a second run would find a repository that is not
 * clean and would refuse. Nothing here resets, reverts, checks out, or
 * force-pushes to make a retry possible; diagnosing and resolving a partial run
 * is a person's job today.
 *
 * @throws {DurableWriteError} The task file could not be read or parsed, or any
 *   stage of the durable write failed.
 */
export async function finalizeDailyLesson(
  input: FinalizeDailyLessonInput,
): Promise<DurableWriteResult> {
  const raw = await during(
    `reading the generation task at ${input.taskFilePath}`,
    'Nothing has been written or committed.',
    () => readFile(input.taskFilePath, 'utf8'),
  );

  const parsed = await during(
    `parsing the generation task at ${input.taskFilePath}`,
    'Nothing has been written or committed.',
    () => JSON.parse(raw) as unknown,
  );

  const task = await during(
    `validating the generation task at ${input.taskFilePath}`,
    'Nothing has been written or committed.',
    () => parsePreparedTask(parsed),
  );

  return finalizeLesson({
    repositoryRoot: input.repositoryRoot,
    task,
    ...(input.commitMessage === undefined ? {} : { commitMessage: input.commitMessage }),
  });
}

/**
 * Run one stage, and on failure say which stage it was and what is on disk.
 *
 * The original error is kept as `cause`, so nothing about *why* it failed is
 * lost — this only adds where in the sequence it happened, which the underlying
 * error cannot know.
 */
async function during<T>(
  stage: string,
  state: string,
  action: () => Promise<T> | T,
): Promise<T> {
  try {
    return await action();
  } catch (cause) {
    throw new DurableWriteError(
      `Stage 1 failed while ${stage}: ${messageOf(cause)} — ${state}`,
      { cause },
    );
  }
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
