/**
 * Git working-tree inspection: read-only.
 *
 * This module answers one question — what has changed in the working tree —
 * and provides two objective judgements about the answer. It stages nothing,
 * commits nothing, and pushes nothing; the durable write is a later milestone.
 *
 * Git is invoked directly with `execFile`, never through a shell, so a path or a
 * repository root can never be interpreted as a command. There is no general
 * command runner here and no Git abstraction: this file knows about Git because
 * it is the Git adapter.
 */

import { execFile } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import { promisify } from 'node:util';

const run = promisify(execFile);

/** Generous, but bounded: a status listing should never approach this. */
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;

/** How many paths an error message will name before summarizing. */
const MAX_LISTED_PATHS = 10;

/** The porcelain v1 status codes, plus the untracked and ignored markers. */
const STATUS_CODES = new Set([' ', 'M', 'T', 'A', 'D', 'R', 'C', 'U', '?', '!']);

/**
 * One entry of `git status --porcelain=v1`.
 *
 * The two status characters are kept exactly as Git wrote them, including the
 * space that means "unchanged in this half". Interpreting them is the caller's
 * business; this type does not editorialize.
 */
export type GitChange = {
  /** The index (staged) status character. `?` for an untracked path. */
  readonly indexStatus: string;
  /** The working-tree (unstaged) status character. `?` for an untracked path. */
  readonly worktreeStatus: string;
  /** Repository-relative path, as Git reports it. POSIX separators. */
  readonly path: string;
  /** The path it came from — present only for a rename or a copy. */
  readonly originalPath?: string;
};

export class GitInspectionError extends Error {
  override readonly name = 'GitInspectionError';
}

/**
 * Every change in the working tree of `repositoryRoot`.
 *
 * Ignored files are not included: they are outside the system's concern by
 * definition, and counting them would make a stale build directory look like a
 * dirty repository.
 *
 * `repositoryRoot` must be the root of the worktree itself. A subdirectory is
 * rejected rather than silently accepted, because Git would happily report the
 * whole repository from inside one and the caller would be inspecting more than
 * it named. No parent directory is searched: the root is stated, never guessed.
 *
 * **Path comparison is by realpath**, on both sides. Git resolves symbolic
 * links when it reports the worktree root, so a lexical comparison would reject
 * a legitimate root reached through a symlinked path — which on macOS is the
 * ordinary case for anything under the temporary directory.
 *
 * @returns The changes, sorted by path. Empty means clean.
 * @throws {GitInspectionError} The root is not an accessible worktree root, Git
 *   failed, or its output could not be parsed.
 */
export async function inspectWorkingTree(
  repositoryRoot: string,
): Promise<readonly GitChange[]> {
  const root = await resolveWorktreeRoot(repositoryRoot);

  // `--untracked-files=all` lists untracked files individually. Without it Git
  // collapses a new directory to its name, and a lesson written into a fresh
  // year directory would be reported as `lessons/` rather than as the file.
  // Both flags are passed explicitly so a user's Git config cannot change what
  // this function sees.
  const output = await git(
    root,
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
  );

  return parsePorcelainStatus(output);
}

/**
 * Parse NUL-delimited `git status --porcelain=v1 -z` output.
 *
 * Exported so the format handling can be tested directly, including inputs a
 * real repository cannot easily be made to produce. It is the parser, not a
 * general Git output library.
 *
 * The `-z` format is a flat sequence of NUL-terminated fields. An entry is
 * `XY<space><path>`; a rename or a copy is followed by a second field holding
 * the original path. Splitting on NUL rather than on newlines is what makes
 * paths containing spaces, quotes, or newlines safe — and with `-z` Git never
 * quotes or escapes a path.
 *
 * @throws {GitInspectionError} On output that is not in this format.
 */
export function parsePorcelainStatus(output: string): readonly GitChange[] {
  const fields = output.split('\0');

  // Every entry is terminated rather than separated, so a well-formed output
  // leaves one empty field at the end.
  if (fields[fields.length - 1] === '') fields.pop();

  const changes: GitChange[] = [];

  for (let index = 0; index < fields.length; index += 1) {
    const entry = fields[index]!;

    // "XY p" is the shortest possible entry: two status codes, a space, and a
    // one-character path.
    if (entry.length < 4 || entry[2] !== ' ') {
      throw new GitInspectionError(
        `Cannot read git status output: ${JSON.stringify(truncate(entry))} is not ` +
          'an "XY <path>" entry.',
      );
    }

    const indexStatus = entry[0]!;
    const worktreeStatus = entry[1]!;

    if (!STATUS_CODES.has(indexStatus) || !STATUS_CODES.has(worktreeStatus)) {
      throw new GitInspectionError(
        `Cannot read git status output: ${JSON.stringify(indexStatus + worktreeStatus)} ` +
          `is not a known status pair, in ${JSON.stringify(truncate(entry))}.`,
      );
    }

    const path = entry.slice(3);

    if (!isRenameOrCopy(indexStatus) && !isRenameOrCopy(worktreeStatus)) {
      changes.push({ indexStatus, worktreeStatus, path });
      continue;
    }

    index += 1;
    const originalPath = fields[index];
    if (originalPath === undefined || originalPath === '') {
      throw new GitInspectionError(
        `Cannot read git status output: the rename or copy of ` +
          `${JSON.stringify(truncate(path))} is missing its original path.`,
      );
    }

    changes.push({ indexStatus, worktreeStatus, path, originalPath });
  }

  // Sorted explicitly rather than trusting Git's ordering, so the result is
  // deterministic by this module's own contract. Compared by code unit, which
  // no locale can reinterpret.
  return changes.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
}

/**
 * Stage 1 may only begin in a completely clean repository.
 *
 * Anything already changed — staged, modified, deleted, renamed, conflicted, or
 * merely untracked — means the run would be committing work it did not produce
 * and cannot account for (docs/architecture.md §8).
 *
 * A pure judgement over an inspection result: it runs no Git of its own, and it
 * does not modify what it is given.
 *
 * @throws {GitInspectionError} If anything has changed.
 */
export function assertWorkingTreeClean(changes: readonly GitChange[]): void {
  if (changes.length === 0) return;

  throw new GitInspectionError(
    `The repository must be clean before Stage 1 runs, but ${countOf(changes)}: ` +
      `${describeChanges(changes)}. Commit, stash, or remove them first.`,
  );
}

/**
 * The generation step's only authorized side effect is creating the one lesson
 * file it was told to write.
 *
 * The single accepted shape is a new, untracked, unstaged file at exactly
 * `expectedPath` — porcelain's `?? <path>`. A staged target, a modified tracked
 * target, a deletion, a rename, a conflict, or any second change means the agent
 * did more than write a lesson, and what else it did is not knowable from here.
 *
 * A pure judgement, like `assertWorkingTreeClean`: no Git, no mutation.
 *
 * @param expectedPath The task's target path. Re-checked at runtime — a static
 *   type is not evidence about a value that may have crossed a process boundary.
 * @throws {GitInspectionError} If the changes are anything else.
 */
export function assertOnlyGeneratedLessonChange(
  changes: readonly GitChange[],
  expectedPath: string,
): void {
  assertSafeRelativePath(expectedPath);

  if (changes.length !== 1) {
    throw new GitInspectionError(
      `Generation must create exactly one new file, ${JSON.stringify(expectedPath)}, ` +
        `but ${countOf(changes)}: ${describeChanges(changes)}.`,
    );
  }

  const change = changes[0]!;

  if (change.indexStatus !== '?' || change.worktreeStatus !== '?') {
    throw new GitInspectionError(
      `Generation must leave ${JSON.stringify(expectedPath)} as a new, unstaged, ` +
        `untracked file, but git reports it as ` +
        `${JSON.stringify(change.indexStatus + change.worktreeStatus)}. ` +
        'The generation step never stages, commits, or edits tracked files.',
    );
  }

  if (change.originalPath !== undefined) {
    throw new GitInspectionError(
      `Generation must create a new file, but git reports ` +
        `${JSON.stringify(change.path)} as coming from ` +
        `${JSON.stringify(change.originalPath)}.`,
    );
  }

  if (change.path !== expectedPath) {
    throw new GitInspectionError(
      `Generation wrote ${JSON.stringify(change.path)}, but the task allows only ` +
        `${JSON.stringify(expectedPath)}.`,
    );
  }
}

/**
 * A path that is safe to compare against Git's own output: relative, POSIX, and
 * contained.
 */
function assertSafeRelativePath(path: string): void {
  if (path === '') {
    throw new GitInspectionError('The expected lesson path must not be empty.');
  }
  if (path.startsWith('/')) {
    throw new GitInspectionError(
      `The expected lesson path must be repository-relative, but ${JSON.stringify(path)} ` +
        'is absolute.',
    );
  }
  if (path.includes('\\')) {
    throw new GitInspectionError(
      `The expected lesson path must use POSIX separators, but ${JSON.stringify(path)} ` +
        'contains a backslash. Git reports paths with "/" on every platform.',
    );
  }
  if (path.split('/').includes('..')) {
    throw new GitInspectionError(
      `The expected lesson path must stay inside the repository, but ` +
        `${JSON.stringify(path)} traverses upward.`,
    );
  }
}

/**
 * Resolve and verify the worktree root.
 *
 * @throws {GitInspectionError} The path is inaccessible, is not a repository, or
 *   is a subdirectory of one.
 */
async function resolveWorktreeRoot(repositoryRoot: string): Promise<string> {
  let resolved: string;
  try {
    resolved = await realpath(repositoryRoot);
  } catch (cause) {
    throw new GitInspectionError(
      `Cannot resolve the repository root ${repositoryRoot}: ${messageOf(cause)}`,
      { cause },
    );
  }

  const toplevel = await git(resolved, ['rev-parse', '--show-toplevel']);

  let resolvedToplevel: string;
  try {
    resolvedToplevel = await realpath(toplevel.trim());
  } catch (cause) {
    throw new GitInspectionError(
      `Cannot resolve the worktree root git reported (${toplevel.trim()}): ${messageOf(cause)}`,
      { cause },
    );
  }

  if (resolvedToplevel !== resolved) {
    throw new GitInspectionError(
      `${repositoryRoot} is not the root of its worktree — that is ` +
        `${resolvedToplevel}. Pass the worktree root itself, so the inspection ` +
        'covers exactly what was named.',
    );
  }

  return resolved;
}

/**
 * Run Git and return its stdout.
 *
 * `execFile` with an argument array: no shell, so nothing in a path is ever
 * interpreted. Only Git's own stderr is quoted back on failure, and only up to a
 * bound — never the environment, and never the whole output.
 */
async function git(cwd: string, args: readonly string[]): Promise<string> {
  try {
    const { stdout } = await run('git', [...args], {
      cwd,
      encoding: 'utf8',
      maxBuffer: MAX_OUTPUT_BYTES,
    });

    return stdout;
  } catch (cause) {
    throw new GitInspectionError(
      `git ${args.join(' ')} failed in ${cwd}: ${gitFailureDetail(cause)}`,
      { cause },
    );
  }
}

/**
 * The useful part of an `execFile` rejection.
 *
 * Git explains itself on stderr, which is far more locating than the generic
 * "Command failed" message. Stdout is not included: on failure it is either
 * empty or the partial output the caller already could not use.
 */
function gitFailureDetail(cause: unknown): string {
  if (typeof cause === 'object' && cause !== null && 'stderr' in cause) {
    const stderr = (cause as { stderr?: unknown }).stderr;
    if (typeof stderr === 'string' && stderr.trim() !== '') {
      return truncate(stderr.trim());
    }
  }

  return messageOf(cause);
}

function isRenameOrCopy(status: string): boolean {
  return status === 'R' || status === 'C';
}

/** `1 change` / `4 changes`, in the sentence shape the callers use. */
function countOf(changes: readonly GitChange[]): string {
  return changes.length === 1 ? 'there is 1 change' : `there are ${changes.length} changes`;
}

/**
 * The changes as a short diagnostic list.
 *
 * Bounded on purpose: a long listing in a CI log buries the point, and the count
 * is what matters once it is long.
 */
function describeChanges(changes: readonly GitChange[]): string {
  const listed = changes
    .slice(0, MAX_LISTED_PATHS)
    .map((change) => {
      const status = `${change.indexStatus}${change.worktreeStatus}`;
      const from = change.originalPath === undefined ? '' : ` (from ${truncate(change.originalPath)})`;

      return `${status} ${truncate(change.path)}${from}`;
    })
    .join(', ');

  const remaining = changes.length - MAX_LISTED_PATHS;

  return remaining > 0 ? `${listed}, and ${remaining} more` : listed;
}

/** Keep a value quotable in an error message. */
function truncate(value: string): string {
  return value.length <= 120 ? value : `${value.slice(0, 117)}...`;
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
