/**
 * Canonical lesson file persistence.
 *
 * Writing is atomic within the target directory: the document is written to a
 * temporary file and renamed into place, so a canonical lesson is never a
 * half-written file. Nothing here touches Git, history, or any adapter.
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';

import { lessonRelativePath, renderLesson } from '../domain/lesson.js';
import type { Lesson } from '../domain/types.js';

export class LessonStoreError extends Error {
  override readonly name = 'LessonStoreError';
}

/**
 * Write a lesson to its canonical path under `repositoryRoot`.
 *
 * Existing-target semantics:
 *
 * - absent — written;
 * - present with identical content — success, nothing written;
 * - present with different content — fails, and the existing file is left alone.
 *
 * The check and the rename are separate steps, so this holds for a single
 * process, which is all the system currently needs. Two processes writing the
 * same path concurrently could still race between the two, and no lock is taken
 * to prevent it.
 *
 * @returns The canonical repository-relative path, with POSIX separators.
 * @throws {LessonStoreError} On any filesystem failure, or on a content conflict.
 * @throws {import('../domain/lesson.js').LessonValidationError} If the lesson is invalid.
 */
export async function writeLesson(
  repositoryRoot: string,
  lesson: Lesson,
): Promise<string> {
  // Rendering validates, so an invalid lesson never reaches the filesystem.
  const document = renderLesson(lesson);
  const relativePath = lessonRelativePath(lesson.metadata);

  const target = resolve(repositoryRoot, relativePath);
  assertInsideRoot(repositoryRoot, target);

  const existing = await readIfPresent(target);
  if (existing !== undefined) {
    if (existing === document) {
      return relativePath;
    }
    throw new LessonStoreError(
      `A different lesson already exists at ${relativePath}. ` +
        'A canonical lesson is never overwritten; remove or reconcile it deliberately.',
    );
  }

  const directory = dirname(target);
  try {
    await mkdir(directory, { recursive: true });
  } catch (cause) {
    throw new LessonStoreError(
      `Cannot create lesson directory ${directory}: ${messageOf(cause)}`,
      { cause },
    );
  }

  // The temporary file sits in the target directory, so the rename stays within
  // one filesystem and is therefore atomic. Its name can never collide with the
  // canonical target.
  const temporary = join(directory, `.${randomUUID()}.tmp`);

  try {
    // Exclusive create: if that name somehow already exists, fail rather than
    // clobber whatever is there. No retry — a UUID collision is not a condition
    // worth recovering from silently.
    await writeFile(temporary, document, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, target);
  } catch (cause) {
    await discard(temporary);
    throw new LessonStoreError(
      `Cannot write lesson to ${relativePath}: ${messageOf(cause)}`,
      { cause },
    );
  }

  return relativePath;
}

/** The file's contents, or `undefined` if nothing can exist at that path yet. */
async function readIfPresent(target: string): Promise<string | undefined> {
  try {
    return await readFile(target, 'utf8');
  } catch (cause) {
    // ENOTDIR means a parent is a file, so nothing exists here either. Treating
    // it as absent lets the failure surface at mkdir, which explains the real
    // problem instead of reporting an unreadable file that was never there.
    if (isAbsent(cause)) return undefined;

    throw new LessonStoreError(
      `Cannot read the existing lesson at ${target}: ${messageOf(cause)}`,
      { cause },
    );
  }
}

/**
 * Remove a temporary file after a failure.
 *
 * Cleanup is best-effort by design: a failure to delete the leftover must never
 * replace the error that actually explains what went wrong.
 */
async function discard(temporary: string): Promise<void> {
  try {
    await unlink(temporary);
  } catch {
    // Intentionally ignored.
  }
}

/**
 * Defence in depth: the canonical path is built from a validated id and date and
 * so cannot traverse upward, but the target is checked anyway.
 *
 * The comparison is lexical. It does not resolve symlinks, so it is not a
 * guarantee against a symlinked parent directory pointing outside the root.
 */
function assertInsideRoot(repositoryRoot: string, target: string): void {
  const root = resolve(repositoryRoot);
  if (target !== root && !target.startsWith(root.endsWith(sep) ? root : root + sep)) {
    throw new LessonStoreError(
      `Refusing to write outside the repository root: ${target} is not under ${root}.`,
    );
  }
}

function isAbsent(cause: unknown): boolean {
  if (typeof cause !== 'object' || cause === null || !('code' in cause)) return false;

  const code = (cause as { code?: unknown }).code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
