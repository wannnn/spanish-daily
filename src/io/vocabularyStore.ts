/**
 * Vocabulary file loading: filesystem access and JSON parsing.
 *
 * This is the only place that knows the vocabulary lives in a file. Every
 * structural rule belongs to the domain layer, which this module delegates to
 * after parsing — validation runs at load time, before any selection
 * (docs/vocabulary-spec.md §5).
 */

import { readFile } from 'node:fs/promises';

import type { VocabularyEntry } from '../domain/types.js';
import { validateVocabulary } from '../domain/vocabulary.js';

export class VocabularyLoadError extends Error {
  override readonly name = 'VocabularyLoadError';
}

/**
 * Read, parse, and fully validate the vocabulary file.
 *
 * @param filePath Path to the vocabulary JSON file.
 * @returns The validated entries, in file order.
 * @throws {VocabularyLoadError} The file cannot be read, or is not valid JSON.
 * @throws {import('../domain/vocabulary.js').VocabularyValidationError}
 *   The file parses but violates the vocabulary contract.
 */
export async function loadVocabulary(
  filePath: string,
): Promise<VocabularyEntry[]> {
  let text: string;
  try {
    text = await readFile(filePath, 'utf8');
  } catch (cause) {
    throw new VocabularyLoadError(
      `Cannot read vocabulary file at ${filePath}: ${messageOf(cause)}`,
      { cause },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (cause) {
    throw new VocabularyLoadError(
      `Vocabulary file at ${filePath} is not valid JSON: ${messageOf(cause)}`,
      { cause },
    );
  }

  return validateVocabulary(parsed);
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
