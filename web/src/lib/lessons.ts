/**
 * Build-time lesson loader.
 *
 * The website is a read-only projection (docs/architecture.md §10). It reads the
 * canonical lessons straight from the repository at build time and parses them
 * with the ONE canonical parser — the compiled `parseLesson` from the Node
 * pipeline. It never reimplements the frontmatter format and never copies the
 * parser (the whole point of `parseLesson` being the single portability asset,
 * docs/architecture.md §4).
 *
 * Consuming the *compiled* `dist/src/domain/lesson.js` is deliberate: the Pages
 * workflow runs the root `tsc` build first, so this import resolves to real
 * emitted `.js` files (its own NodeNext `.js` specifiers resolve cleanly), with
 * no resolver alias and no shared package.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { marked } from 'marked';

import { parseLesson } from '../../../dist/src/domain/lesson.js';
import type { Lesson, LessonMetadata } from '../../../dist/src/domain/types.js';

// npm runs this package's scripts with the cwd set to `web/`, so the repository
// root — where `lessons/` lives — is one level up. This avoids depending on the
// bundled value of `import.meta.url`.
const REPO_ROOT = resolve(process.cwd(), '..');
const LESSONS_DIR = join(REPO_ROOT, 'lessons');

// GFM is what the conjugation tables rely on (pipe tables). The lesson content
// is generated and human-reviewed canonical data, so it is trusted; no HTML
// sanitizer is introduced here.
marked.setOptions({ gfm: true });

export interface LessonEntry {
  /** `YYYY-MM-DD-id`, matching the canonical filename stem and the route. */
  readonly slug: string;
  readonly metadata: LessonMetadata;
  /** The lesson body (lesson-spec §2 sections) rendered to HTML. */
  readonly bodyHtml: string;
}

/**
 * Read every `lessons/**\/*.md`, parse it with the canonical parser, and render
 * its body to HTML. Throws if none are found, so a broken loader fails the build
 * rather than producing an empty site.
 */
export async function loadLessons(): Promise<LessonEntry[]> {
  const dirents = await readdir(LESSONS_DIR, { recursive: true, withFileTypes: true });
  const files = dirents
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.md'))
    .map((dirent) => join(dirent.parentPath, dirent.name))
    .sort();

  if (files.length === 0) {
    throw new Error(`no canonical lessons found under ${LESSONS_DIR}`);
  }

  const entries: LessonEntry[] = [];
  for (const file of files) {
    const document = await readFile(file, 'utf8');
    const lesson: Lesson = parseLesson(document);
    const slug = `${lesson.metadata.date}-${lesson.metadata.id}`;
    const bodyHtml = marked.parse(lesson.body) as string;
    entries.push({ slug, metadata: lesson.metadata, bodyHtml });
  }

  return entries;
}
