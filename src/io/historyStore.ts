/**
 * History file loading: filesystem access only.
 *
 * Every structural rule belongs to the domain layer, which this module
 * delegates to after reading. Writing is not implemented — appending a record
 * belongs to the pipeline milestone, not here.
 */

import { readFile } from 'node:fs/promises';

import { parseHistory } from '../domain/history.js';
import type { HistoryRecord } from '../domain/types.js';

export class HistoryLoadError extends Error {
  override readonly name = 'HistoryLoadError';
}

/**
 * Read and fully validate the history file.
 *
 * @param filePath Path to `history.jsonl`.
 * @returns The validated records, in file order.
 * @throws {HistoryLoadError} The file cannot be read.
 * @throws {import('../domain/history.js').HistoryValidationError}
 *   The file is readable but violates the history contract.
 */
export async function loadHistory(filePath: string): Promise<HistoryRecord[]> {
  let content: string;
  try {
    content = await readFile(filePath, 'utf8');
  } catch (cause) {
    throw new HistoryLoadError(
      `Cannot read history file at ${filePath}: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }

  return parseHistory(content);
}
