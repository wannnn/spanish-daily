/**
 * `finalize` — accept the generated lesson and durably record the day.
 *
 * The second half of Stage 1, as a command. It takes the task file `prepare`
 * produced, verifies that generation wrote exactly the lesson that task names,
 * and commits the lesson together with the history record before pushing.
 *
 * The task is read from a file rather than an argument: a task is a JSON object
 * with a path in it, and passing it through argv invites quoting mistakes on the
 * one input that must not be mangled.
 *
 * **That file must live outside the repository working tree.** It is scratch
 * data handed between two steps, not repository content. Generation's only
 * authorized side effect is creating the one lesson file, so a task file sitting
 * in the worktree is an unexpected change and this command refuses — correctly.
 * The command never deletes the file either: the caller created it and the
 * caller disposes of it.
 *
 * **stdout carries JSON and nothing else**, and only on success — there is no
 * partial result. Every diagnostic goes to stderr.
 *
 * **Re-running after a failure is not guaranteed to be safe.** See `USAGE`.
 */

import { pathToFileURL } from 'node:url';

import { finalizeDailyLesson } from '../pipeline/finalize.js';

const USAGE = [
  'usage: finalize <task-file> [repository-root]',
  '',
  'Accepts the generated lesson named by <task-file>, appends the history',
  'record, commits both in one commit, and pushes.',
  '',
  '<task-file> must be OUTSIDE the repository working tree. It is scratch data',
  'passed between steps, not repository content; a task file inside the worktree',
  'is an unexpected change and this command refuses. The file is never deleted',
  'here — whoever created it disposes of it:',
  '',
  '  TASK_FILE="$(mktemp)"',
  '  prepare > "$TASK_FILE"',
  '  # ... the external generation step writes the lesson ...',
  '  finalize "$TASK_FILE"',
  '  rm -f "$TASK_FILE"',
  '',
  'Completion is reported only after the push succeeds. On failure nothing is',
  'undone: no reset, no revert, no checkout, no force push. A failure before the',
  'commit leaves written files behind and can be re-run once they are removed; a',
  'failure after the commit leaves a local commit, and re-running will refuse',
  'because the repository is no longer clean. Resolving that is a manual step.',
].join('\n');

/** Where output goes. Plain callbacks so tests can collect instead of print. */
export type CliOutput = {
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
};

/**
 * Run the command.
 *
 * @param args Positional arguments, without the node and script paths.
 * @param out Where the result and any diagnostics go.
 * @param defaultRoot The repository root to use when none is given.
 * @returns The process exit code: 0 once the push has succeeded, 1 otherwise.
 */
export async function runFinalize(
  args: readonly string[],
  out: CliOutput,
  defaultRoot: string,
): Promise<number> {
  if (args.length === 0) {
    out.stderr('error: a task file is required');
    out.stderr(USAGE);
    return 1;
  }
  if (args.length > 2) {
    out.stderr(`error: expected at most 2 arguments, got ${args.length}`);
    out.stderr(USAGE);
    return 1;
  }

  const taskFilePath = args[0]!;
  const repositoryRoot = args[1] ?? defaultRoot;

  try {
    const result = await finalizeDailyLesson({ repositoryRoot, taskFilePath });

    // Written only here, after the push returned. There is no partial success
    // to report: anything short of a pushed commit is a failure.
    out.stdout(JSON.stringify(result));
    return 0;
  } catch (error) {
    out.stderr(`error: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

/* Entry point. Thin on purpose: arguments, streams, exit code. */
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out: CliOutput = {
    stdout: (line) => process.stdout.write(`${line}\n`),
    stderr: (line) => process.stderr.write(`${line}\n`),
  };

  // Set rather than exit, so buffered output is flushed before the process ends.
  process.exitCode = await runFinalize(process.argv.slice(2), out, process.cwd());
}
