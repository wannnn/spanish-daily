/**
 * Build-time lesson archive loader.
 *
 * The website is a read-only projection (docs/architecture.md §10). It reads the
 * canonical data straight from Git at build time and parses it with the ONE
 * canonical parser for each file: the compiled `parseLesson` and `parseHistory`
 * from the Node pipeline. It never reimplements either format (the whole point of
 * those parsers being the single portability asset, docs/architecture.md §4).
 *
 * `Lesson N` and the ordering rules are owned by docs/web-design.md.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { marked } from 'marked';

import { parseLesson } from '../../../dist/src/domain/lesson.js';
import { parseHistory } from '../../../dist/src/domain/history.js';
import type { Lesson, LessonMetadata, HistoryRecord } from '../../../dist/src/domain/types.js';

// npm runs this package's scripts with the cwd set to `web/`, so the repository
// root — where `lessons/` and `history.jsonl` live — is one level up.
const REPO_ROOT = resolve(process.cwd(), '..');
const LESSONS_DIR = join(REPO_ROOT, 'lessons');
const HISTORY_FILE = join(REPO_ROOT, 'history.jsonl');

/** Homepage page size — the single source (docs/web-design.md). */
export const PAGE_SIZE = 10;

// GFM is what the conjugation tables rely on (pipe tables). The lesson content is
// generated and human-reviewed canonical data, so it is trusted; no HTML
// sanitizer is introduced here.
marked.setOptions({ gfm: true });

export interface LessonView {
  /** 1-based position in `history.jsonl` completion order (docs/web-design.md). */
  readonly number: number;
  /** `YYYY-MM-DD-id`, matching the canonical filename stem and the route. */
  readonly slug: string;
  readonly id: string;
  readonly word: string;
  readonly date: string;
  readonly pos: string;
  /** The lesson body (lesson-spec §2 sections) rendered to HTML. */
  readonly bodyHtml: string;
}

export interface Archive {
  /** Ascending `Lesson N` (history completion order) — used for prev/next. */
  readonly byCompletion: readonly LessonView[];
  /** Homepage order: metadata `date` newest-first, `id` as stable tie-breaker. */
  readonly newestFirst: readonly LessonView[];
}

/** Total number of static homepage pages for a given lesson count. */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

interface ParsedLesson {
  readonly metadata: LessonMetadata;
  readonly bodyHtml: string;
}

/**
 * Load, validate, number, and order every canonical lesson.
 *
 * Enforces a strict 1:1 correspondence between the lesson files and
 * `history.jsonl` (docs/web-design.md): equal counts, each history record matched
 * to exactly one lesson on `id`, `word`, and `date`, and no lesson left over.
 * Any missing, duplicated, or inconsistent record aborts the build — there is no
 * unnumbered lesson and no fallback numbering.
 */
export async function loadArchive(): Promise<Archive> {
  const records = parseHistory(await readFile(HISTORY_FILE, 'utf8'));
  const lessonsById = await readLessonsById();

  if (records.length !== lessonsById.size) {
    throw new Error(
      `lesson/history mismatch: ${lessonsById.size} lesson file(s) but ` +
        `${records.length} history record(s). They must be 1:1 (docs/web-design.md).`,
    );
  }

  const byCompletion: LessonView[] = records.map((record, index) =>
    matchRecord(record, index + 1, lessonsById),
  );

  // Equal counts + every record matched a distinct existing id (no duplicate ids
  // in history, guaranteed by parseHistory) ⇒ bijection. This guard names the
  // orphan explicitly rather than relying on the counting argument alone.
  if (byCompletion.length !== lessonsById.size) {
    const matched = new Set(byCompletion.map((view) => view.id));
    const orphan = [...lessonsById.keys()].find((id) => !matched.has(id));
    throw new Error(
      `lesson ${JSON.stringify(orphan)} has no matching history record ` +
        `(docs/web-design.md requires 1:1).`,
    );
  }

  const newestFirst = [...byCompletion].sort(compareNewestFirst);

  return { byCompletion, newestFirst };
}

/** Match one history record to its lesson, checking id, word, and date agree. */
function matchRecord(
  record: HistoryRecord,
  number: number,
  lessonsById: ReadonlyMap<string, ParsedLesson>,
): LessonView {
  const lesson = lessonsById.get(record.id);
  if (lesson === undefined) {
    throw new Error(
      `history record ${JSON.stringify(record.id)} (${record.date}) has no lesson file.`,
    );
  }

  const { metadata } = lesson;
  if (metadata.word !== record.word || metadata.date !== record.date) {
    throw new Error(
      `lesson/history inconsistency for ${JSON.stringify(record.id)}: history has ` +
        `word=${JSON.stringify(record.word)} date=${record.date}, lesson has ` +
        `word=${JSON.stringify(metadata.word)} date=${metadata.date}.`,
    );
  }

  return {
    number,
    slug: `${metadata.date}-${metadata.id}`,
    id: metadata.id,
    word: metadata.word,
    date: metadata.date,
    pos: metadata.pos,
    bodyHtml: lesson.bodyHtml,
  };
}

/** Read and parse every `lessons/**\/*.md`, keyed by id (duplicates rejected). */
async function readLessonsById(): Promise<ReadonlyMap<string, ParsedLesson>> {
  const dirents = await readdir(LESSONS_DIR, { recursive: true, withFileTypes: true });
  const files = dirents
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.md'))
    .map((dirent) => join(dirent.parentPath, dirent.name))
    .sort();

  if (files.length === 0) {
    throw new Error(`no canonical lessons found under ${LESSONS_DIR}`);
  }

  const lessonsById = new Map<string, ParsedLesson>();
  for (const file of files) {
    const lesson: Lesson = parseLesson(await readFile(file, 'utf8'));
    if (lessonsById.has(lesson.metadata.id)) {
      throw new Error(
        `duplicate lesson id ${JSON.stringify(lesson.metadata.id)} across lesson files.`,
      );
    }
    lessonsById.set(lesson.metadata.id, { metadata: lesson.metadata, bodyHtml: renderBody(lesson.body) });
  }

  return lessonsById;
}

/**
 * Render a lesson body to HTML, wrapping every table so a wide table can scroll
 * horizontally on a narrow screen while still filling the content width
 * (docs/web-design.md → Tables). marked emits bare `<table>` tags, so a simple
 * paired wrap is enough and does not need a full HTML parser.
 */
function renderBody(body: string): string {
  return (marked.parse(body) as string)
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

function compareNewestFirst(a: LessonView, b: LessonView): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1; // newest first
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; // stable tie-breaker
}
