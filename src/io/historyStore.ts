/**
 * History file access: the filesystem boundary for `history.jsonl`.
 *
 * Every structural rule belongs to the domain layer, which this module
 * delegates to after reading. Nothing here knows about lessons, Git, or any
 * platform, and nothing here reads a clock.
 *
 * Reading and appending deliberately disagree about a missing file. A read of a
 * file that is not there is an error: the caller asked for history that does not
 * exist, and silently returning nothing would make a typo look like a first run.
 * An append to a file that is not there is the first write: appending is what
 * *creates* canonical history, so there is nothing to be missing yet.
 */

import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { parseHistory } from '../domain/history.js';
import type { HistoryRecord } from '../domain/types.js';

export class HistoryLoadError extends Error {
  override readonly name = 'HistoryLoadError';
}

/**
 * An append could not be performed.
 *
 * Corruption *already in the file* is not reported through this type: it
 * surfaces as the domain's `HistoryValidationError`, exactly as it does when
 * reading. This type means "this append is not allowed or did not work" —
 * an invalid record, a duplicate, or a filesystem failure.
 */
export class HistoryStoreError extends Error {
  override readonly name = 'HistoryStoreError';
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

/**
 * Append one record to the history file, creating it if it does not exist.
 *
 * The whole existing file is validated before anything is written, so a
 * corrupted history is never appended to and never silently repaired. The new
 * row is added at the end; existing bytes are copied through untouched, so a
 * file that already uses CRLF endings or carries blank lines keeps them. This
 * function does not canonicalize history it did not write.
 *
 * Not idempotent, and deliberately so: an append that would repeat a `date` or
 * an `id` is rejected rather than absorbed. Skipping a day that is already
 * recorded is Stage 1's replay guard, not the writer's, and putting a second
 * copy of that rule here would give the system two places to disagree.
 *
 * Durability is single-process: the new content is written to a temporary file
 * in the same directory and renamed over the target, so a reader never observes
 * a half-written file. There is no lock, and concurrent writers are not
 * supported.
 *
 * @param filePath Path to `history.jsonl`.
 * @param record The record to append. Not modified.
 * @throws {HistoryStoreError} The record is invalid, it would duplicate an
 *   existing `date` or `id`, or the filesystem operation failed.
 * @throws {import('../domain/history.js').HistoryValidationError}
 *   The existing file violates the history contract.
 */
export async function appendHistoryRecord(
  filePath: string,
  record: HistoryRecord,
): Promise<void> {
  const row = serializeRecord(record);

  // Validated by the same parser that reads the file, so the writer cannot
  // accept a record the reader would later reject. The caller's static type is
  // not evidence at runtime — the value may have come from JSON.
  try {
    parseHistory(row);
  } catch (cause) {
    throw new HistoryStoreError(
      `Cannot append to ${filePath}: the record is invalid. ${messageOf(cause)}`,
      { cause },
    );
  }

  const existing = await readExisting(filePath);
  // A missing file is the first write. Anything already there is validated in
  // full first: a broken history is never appended to.
  const records = existing === undefined ? [] : parseHistory(existing);

  assertNoConflict(records, record, filePath);

  const prospective = joinRow(existing ?? '', row);

  // The final guard: the bytes about to be written must themselves parse. The
  // checks above should already guarantee it, so this catches a defect in the
  // assembly rather than bad input.
  try {
    parseHistory(prospective);
  } catch (cause) {
    throw new HistoryStoreError(
      `Cannot append to ${filePath}: the resulting file would not be valid history. ` +
        `${messageOf(cause)}`,
      { cause },
    );
  }

  await writeAtomically(filePath, prospective);
}

/** The canonical row: fixed field order, compact, one line. */
function serializeRecord(record: HistoryRecord): string {
  // Built field by field rather than stringifying the record, so the output
  // order is the contract's and not the caller's property insertion order.
  return JSON.stringify({
    date: record.date,
    id: record.id,
    word: record.word,
  });
}

/** The file's current contents, or `undefined` if it does not exist yet. */
async function readExisting(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (cause) {
    if (isMissingFile(cause)) return undefined;

    throw new HistoryStoreError(
      `Cannot read history file at ${filePath} before appending: ${messageOf(cause)}`,
      { cause },
    );
  }
}

function isMissingFile(cause: unknown): boolean {
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'code' in cause &&
    (cause as { code?: unknown }).code === 'ENOENT'
  );
}

/**
 * One record per day, and a word is never taught twice
 * (docs/architecture.md §3).
 */
function assertNoConflict(
  records: readonly HistoryRecord[],
  record: HistoryRecord,
  filePath: string,
): void {
  if (records.some((existing) => existing.date === record.date)) {
    throw new HistoryStoreError(
      `Cannot append to ${filePath}: ${JSON.stringify(record.date)} is already ` +
        'recorded. History holds one record per day.',
    );
  }

  if (records.some((existing) => existing.id === record.id)) {
    throw new HistoryStoreError(
      `Cannot append to ${filePath}: ${JSON.stringify(record.id)} is already ` +
        'recorded. A word is never taught twice.',
    );
  }
}

/**
 * Existing bytes, then the new row, then a final newline.
 *
 * The only edit made to what is already there is the line boundary the new row
 * needs. A file that ends with CRLF already ends with `\n` and so is left
 * exactly as it was.
 */
function joinRow(existing: string, row: string): string {
  if (existing === '') return `${row}\n`;
  const boundary = existing.endsWith('\n') ? '' : '\n';

  return `${existing}${boundary}${row}\n`;
}

/**
 * Write via a temporary file in the target's own directory, then rename.
 *
 * Same directory so the rename stays within one filesystem and is therefore
 * atomic. Exclusive create, so an existing file is never written through. This
 * protects a reader from seeing a partial file; it is not a concurrency
 * mechanism, and two writers at once are still unsupported.
 */
async function writeAtomically(filePath: string, content: string): Promise<void> {
  const tempPath = join(dirname(filePath), `.history-${randomUUID()}.tmp`);

  try {
    await writeFile(tempPath, content, { encoding: 'utf8', flag: 'wx' });
  } catch (cause) {
    throw new HistoryStoreError(
      `Cannot write the temporary history file at ${tempPath}: ${messageOf(cause)}`,
      { cause },
    );
  }

  try {
    await rename(tempPath, filePath);
  } catch (cause) {
    // Best effort: the append has already failed, and a cleanup problem must
    // not replace the reason it failed.
    await rm(tempPath, { force: true }).catch(() => undefined);

    throw new HistoryStoreError(
      `Cannot move the new history file into place at ${filePath}: ${messageOf(cause)}`,
      { cause },
    );
  }
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
