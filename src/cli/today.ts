/**
 * `today` — print which word today's lesson is for.
 *
 * The first executable slice of the pipeline: load vocabulary, load history,
 * compute the Asia/Taipei date, select, and print. It is strictly read-only —
 * nothing is written, committed, generated, or published.
 *
 * This file is the composition boundary. It is the only place that reads the
 * clock and the process arguments; the domain layer does neither.
 */

import { pathToFileURL } from 'node:url';

import { taipeiDate } from '../domain/date.js';
import { selectWord } from '../domain/selection.js';
import type { HistoryRecord } from '../domain/types.js';
import { HistoryLoadError, loadHistory } from '../io/historyStore.js';
import { loadVocabulary } from '../io/vocabularyStore.js';

/** The history file the project uses when none is given, relative to the cwd. */
export const DEFAULT_HISTORY_FILE = 'history.jsonl';

const USAGE = 'usage: today <vocabulary-path> [history-path]';

/** Where output goes. Plain callbacks so tests can collect instead of print. */
export type CliOutput = {
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
};

/**
 * Run the command.
 *
 * @param args Positional arguments, without the node and script paths.
 * @param now The instant to treat as "now", supplied by the caller.
 * @param out Where the result and any diagnostics go.
 * @param defaultHistoryPath The history file to use when none is given.
 * @returns The process exit code: 0 on success, non-zero on failure.
 */
export async function runToday(
  args: readonly string[],
  now: Date,
  out: CliOutput,
  defaultHistoryPath: string,
): Promise<number> {
  if (args.length === 0) {
    out.stderr('error: a vocabulary path is required');
    out.stderr(USAGE);
    return 1;
  }
  if (args.length > 2) {
    out.stderr(`error: expected at most 2 arguments, got ${args.length}`);
    out.stderr(USAGE);
    return 1;
  }

  const vocabularyPath = args[0]!;
  const givenHistoryPath = args[1];
  const historyPath = givenHistoryPath ?? defaultHistoryPath;

  try {
    const vocabulary = await loadVocabulary(vocabularyPath);
    const history = await loadHistoryForRun(
      historyPath,
      givenHistoryPath === undefined,
    );

    const date = taipeiDate(now);
    const result = selectWord(vocabulary, history, date);

    out.stdout(JSON.stringify(present(result, date)));
    return 0;
  } catch (error) {
    // Diagnostics only — the messages from the loaders and validators already
    // locate the problem, and a stack trace is noise for a CLI user.
    out.stderr(`error: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

/**
 * Load the history, treating a missing *default* file as a first run.
 *
 * The loader's contract stays strict: it fails on any read error. That
 * interpretation belongs here, at the composition boundary, and only for the
 * path the CLI chose itself. A history path the user typed is never silently
 * ignored — a typo must not look like an empty history.
 */
async function loadHistoryForRun(
  historyPath: string,
  isDefaultPath: boolean,
): Promise<HistoryRecord[]> {
  try {
    return await loadHistory(historyPath);
  } catch (error) {
    if (isDefaultPath && isMissingFile(error)) {
      return [];
    }
    throw error;
  }
}

/** Whether a history load failed specifically because the file is not there. */
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

/**
 * Map a selection to the printed shape.
 *
 * Presentation only. This is not a domain model and nothing else should read it.
 */
function present(
  result: ReturnType<typeof selectWord>,
  date: string,
): Record<string, unknown> {
  switch (result.kind) {
    case 'selected':
      return {
        kind: 'selected',
        date,
        id: result.entry.id,
        word: result.entry.word,
        order: result.entry.order,
        pos: result.entry.pos,
      };
    case 'replay':
      return {
        kind: 'replay',
        date,
        id: result.record.id,
        word: result.record.word,
      };
    case 'exhausted':
      return { kind: 'exhausted', date };
  }
}

/* Entry point. Thin on purpose: arguments, clock, streams, exit code. */
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out: CliOutput = {
    stdout: (line) => process.stdout.write(`${line}\n`),
    stderr: (line) => process.stderr.write(`${line}\n`),
  };

  // Set rather than exit, so buffered output is flushed before the process ends.
  process.exitCode = await runToday(
    process.argv.slice(2),
    new Date(),
    out,
    DEFAULT_HISTORY_FILE,
  );
}
