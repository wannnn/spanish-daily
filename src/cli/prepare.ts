/**
 * `prepare` — decide what today's run should do, and print it as JSON.
 *
 * The first half of Stage 1, as a command. It reads committed data, checks that
 * the repository is clean, and prints either the generation task, the record
 * being replayed, or that the curriculum is finished. It writes nothing,
 * commits nothing, and calls no external service.
 *
 * **stdout carries JSON and nothing else**, so the output can be redirected to a
 * file and handed to `finalize` unchanged. Every diagnostic goes to stderr.
 *
 * **Redirect that file to somewhere outside the repository.** A task is
 * scratch data passed between two steps, not repository content. A shell
 * creates a redirection target *before* the command runs, so `> task.json`
 * inside the worktree would make the repository dirty before this command could
 * even look at it — and would then be an unexpected change when `finalize`
 * checks what generation produced.
 *
 * This file is a composition boundary: the only place that reads the clock, the
 * process arguments, and the working directory.
 */

import { pathToFileURL } from 'node:url';

import { prepareDailyLesson } from '../pipeline/prepare.js';

const USAGE = [
  'usage: prepare [repository-root]',
  '',
  'Prints one JSON object on stdout: a generation task, the record being',
  'replayed, or that the curriculum is exhausted. All three exit 0.',
  '',
  'Redirect the output to a path OUTSIDE the repository — a task file is scratch',
  'data, not repository content, and a file inside the worktree makes the tree',
  'dirty, which both this command and finalize refuse:',
  '',
  '  TASK_FILE="$(mktemp)"',
  '  prepare > "$TASK_FILE"',
  '  # ... the external generation step writes the lesson ...',
  '  finalize "$TASK_FILE"',
  '  rm -f "$TASK_FILE"',
].join('\n');

/** Where output goes. Plain callbacks so tests can collect instead of print. */
export type CliOutput = {
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
};

/**
 * Run the command.
 *
 * `generate`, `replay`, and `exhausted` are all successes and all exit 0: a day
 * with nothing to generate is an ordinary outcome, not a failure. Only an
 * operational problem — a dirty repository, unreadable or invalid canonical
 * data — exits non-zero.
 *
 * @param args Positional arguments, without the node and script paths.
 * @param now The instant to treat as "now", supplied by the caller.
 * @param out Where the result and any diagnostics go.
 * @param defaultRoot The repository root to use when none is given.
 * @returns The process exit code.
 */
export async function runPrepare(
  args: readonly string[],
  now: Date,
  out: CliOutput,
  defaultRoot: string,
): Promise<number> {
  if (args.length > 1) {
    out.stderr(`error: expected at most 1 argument, got ${args.length}`);
    out.stderr(USAGE);
    return 1;
  }

  const repositoryRoot = args[0] ?? defaultRoot;

  try {
    const result = await prepareDailyLesson({ repositoryRoot, now });

    out.stdout(JSON.stringify(result));
    return 0;
  } catch (error) {
    // Diagnostics only: the underlying errors already locate the problem, and a
    // stack trace is noise for a CLI user.
    out.stderr(`error: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

/* Entry point. Thin on purpose: arguments, clock, streams, exit code. */
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out: CliOutput = {
    stdout: (line) => process.stdout.write(`${line}\n`),
    stderr: (line) => process.stderr.write(`${line}\n`),
  };

  // Set rather than exit, so buffered output is flushed before the process ends.
  process.exitCode = await runPrepare(process.argv.slice(2), new Date(), out, process.cwd());
}
