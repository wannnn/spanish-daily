/**
 * The canonical lesson content model — pure functions, no I/O.
 *
 * Contract: docs/lesson-spec.md §2 (Lesson Schema Version 1) and
 * docs/architecture.md §4. A lesson document is a YAML frontmatter block
 * followed by the five fixed sections, and `lessons/**\/*.md` is canonical:
 * every future consumer reads it through `parseLesson` rather than
 * reimplementing the format.
 *
 * Validation here is **structural only**. Whether the Spanish is correct, the
 * examples natural, or the conjugations right is not decidable here and is not
 * attempted.
 */

import { isCalendarDate } from './date.js';
import { POS_VALUES, type Lesson, type LessonMetadata, type Pos } from './types.js';
import { canonicalWordViolation, isVocabularyId } from './vocabulary.js';

/** The lesson schema this build reads and writes (docs/lesson-spec.md header). */
export const LESSON_SCHEMA_VERSION = 1;

/** The five fixed section headings, in their required order (lesson-spec §2). */
export const LESSON_SECTIONS = [
  '## 基本資訊',
  '## 用法',
  '## 詞形變化',
  '## 例句',
  '## 延伸學習',
] as const;

/** Frontmatter keys, in canonical order. `word` is the only free-form value. */
const FRONTMATTER_KEYS = ['id', 'word', 'pos', 'date', 'lesson_schema_version'] as const;

const FENCE = '---';

/** Level-2 heading, not level 3 or deeper. Subheadings inside a section are fine. */
const SECTION_HEADING = /^##(?!#)\s*(.*?)\s*$/;

/**
 * A Markdown fenced code block delimiter: three or more backticks or tildes.
 * Group 1 is the run itself, group 2 whatever follows it on the line.
 *
 * Enough to keep a `##` line inside a code block from being read as a section.
 * It is not a CommonMark implementation and does not try to be.
 */
const CODE_FENCE = /^(`{3,}|~{3,})\s*(.*?)\s*$/;

/** `key: value`, the only frontmatter line shape the canonical format uses. */
const FRONTMATTER_LINE = /^([a-z_]+): (.*)$/;

/**
 * A word is written as a bare YAML scalar only when it provably needs no
 * quoting: a letter followed by letters, digits, or hyphens. Anything else —
 * punctuation, spaces, an indicator character — is quoted.
 */
const PLAIN_SAFE_WORD = /^\p{L}[\p{L}\p{N}\-]*$/u;

/**
 * Tokens a YAML 1.1 reader resolves to a boolean or null rather than a string.
 *
 * This is not hypothetical: `no` and `y` are both high-frequency Spanish words.
 * Written bare, an external YAML parser would read `word: no` as `false`.
 *
 * The comparison is case-sensitive and the set holds only lowercase forms,
 * which is sufficient because metadata validation rejects any `word` that is
 * not lowercase before it reaches here.
 */
const YAML_RESERVED_WORDS = new Set([
  'y', 'n', 'yes', 'no', 'on', 'off', 'true', 'false', 'null',
]);

export class LessonValidationError extends Error {
  override readonly name = 'LessonValidationError';
}

/**
 * Render a lesson to its canonical document form.
 *
 * Deterministic: the same lesson always produces byte-identical output. The
 * body is normalized (surrounding blank lines removed) and the document ends
 * with exactly one newline.
 */
export function renderLesson(lesson: Lesson): string {
  assertMetadata(lesson.metadata);

  // Line endings are normalized here, not only on the way in: the rendered
  // document is the canonical artifact, so the same lesson must produce the
  // same bytes whether its body arrived with LF or CRLF endings.
  const body = normalize(lesson.body);
  validateLessonBody(body);

  const frontmatter = [
    `id: ${lesson.metadata.id}`,
    `word: ${encodeWord(lesson.metadata.word)}`,
    `pos: ${lesson.metadata.pos}`,
    `date: ${lesson.metadata.date}`,
    `lesson_schema_version: ${lesson.metadata.lessonSchemaVersion}`,
  ];

  return `${FENCE}\n${frontmatter.join('\n')}\n${FENCE}\n\n${body}\n`;
}

/**
 * Parse a canonical lesson document.
 *
 * Only the canonical form is accepted; this is deliberately not a general YAML
 * or Markdown reader. The returned value is a fresh plain object.
 *
 * @throws {LessonValidationError} On the first structural violation.
 */
export function parseLesson(document: string): Lesson {
  const lines = normalize(document).split('\n');

  if (lines[0] !== FENCE) {
    throw fail(
      `lesson must begin with a "${FENCE}" frontmatter fence on line 1, ` +
        `but found ${JSON.stringify(lines[0] ?? '')}.`,
    );
  }

  const closingIndex = lines.indexOf(FENCE, 1);
  if (closingIndex === -1) {
    throw fail(`lesson frontmatter is never closed by a "${FENCE}" line.`);
  }

  const fields = parseFrontmatter(lines.slice(1, closingIndex));
  const metadata = buildMetadata(fields);

  // Everything after the first closing fence is body, so a `---` further down
  // is ordinary content and is never read as another frontmatter block.
  const body = lines.slice(closingIndex + 1).join('\n').trim();
  validateLessonBody(body);

  return { metadata, body };
}

/**
 * Structural validation of a lesson body (lesson-spec §2).
 *
 * Checks that the five sections are present, in order, without duplicates or
 * additions, and that the body carries no frontmatter. Content *within* a
 * section — tables, lists, subheadings — is unconstrained: the specification
 * fixes the section set and order, not what fills them.
 *
 * @throws {LessonValidationError}
 */
export function validateLessonBody(body: string): void {
  const trimmed = normalize(body);

  if (trimmed === '') {
    throw fail('lesson body must not be empty.');
  }
  if (trimmed.startsWith(FENCE)) {
    throw fail(
      'lesson body must not contain frontmatter; ' +
        'the frontmatter is assembled separately and prepended at render time.',
    );
  }

  const headings = sectionHeadings(trimmed);

  const expected = LESSON_SECTIONS as readonly string[];

  for (const heading of headings) {
    if (!expected.includes(heading)) {
      throw fail(
        `lesson body has an unexpected section ${JSON.stringify(heading)}. ` +
          `The sections are fixed: ${expected.join(', ')}. ` +
          'A misspelled heading is the usual cause.',
      );
    }
  }

  const seen = new Set<string>();
  for (const heading of headings) {
    if (seen.has(heading)) {
      throw fail(`lesson body repeats the section ${JSON.stringify(heading)}.`);
    }
    seen.add(heading);
  }

  const missing = expected.filter((section) => !seen.has(section));
  if (missing.length > 0) {
    throw fail(
      `lesson body is missing the ${missing.length === 1 ? 'section' : 'sections'} ` +
        `${missing.map((section) => JSON.stringify(section)).join(', ')}. ` +
        'Every section is always present, even when it only states that it does not apply.',
    );
  }

  for (let index = 0; index < expected.length; index += 1) {
    if (headings[index] !== expected[index]) {
      throw fail(
        `lesson body has its sections out of order: expected ` +
          `${JSON.stringify(expected[index]!)} in position ${index + 1}, ` +
          `but found ${JSON.stringify(headings[index]!)}. ` +
          `The required order is ${expected.join(', ')}.`,
      );
    }
  }
}

/**
 * The canonical repository-relative path for a lesson
 * (docs/architecture.md §4): `lessons/YYYY/YYYY-MM-DD-{id}.md`.
 *
 * The year is derived from the date; a caller cannot supply one separately and
 * so cannot make the two disagree. POSIX separators, always relative, and — as
 * a consequence of the validated `id` and `date` — never traversing upward.
 *
 * @throws {LessonValidationError} If the metadata is not valid.
 */
export function lessonRelativePath(metadata: LessonMetadata): string {
  assertMetadata(metadata);

  const year = metadata.date.slice(0, 4);

  return `lessons/${year}/${metadata.date}-${metadata.id}.md`;
}

/**
 * The level-2 headings of a body, in order, ignoring anything inside a fenced
 * code block.
 *
 * The fence state is a single open-marker string — deliberately the smallest
 * thing that prevents a `##` line in a code block from being read as a section.
 * An unclosed fence means the body's structure cannot be determined, so it
 * fails rather than being silently accepted.
 */
function sectionHeadings(body: string): string[] {
  const headings: string[] = [];
  let openFence: string | undefined;

  for (const line of body.split('\n')) {
    const fence = CODE_FENCE.exec(line);

    if (openFence === undefined) {
      if (fence !== null) {
        openFence = fence[1]!;
        continue;
      }
    } else {
      // A closing fence uses the same character, is at least as long, and
      // carries nothing else on the line.
      const closes =
        fence !== null &&
        fence[1]![0] === openFence[0] &&
        fence[1]!.length >= openFence.length &&
        fence[2] === '';

      if (closes) openFence = undefined;
      continue;
    }

    const match = SECTION_HEADING.exec(line);
    if (match !== null) headings.push(`## ${match[1]}`);
  }

  if (openFence !== undefined) {
    throw fail(
      `lesson body has an unclosed code fence opened by ${JSON.stringify(openFence)}; ` +
        'its section structure cannot be determined.',
    );
  }

  return headings;
}

/** Canonical line endings, with surrounding blank space removed. */
function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

function parseFrontmatter(lines: readonly string[]): Map<string, string> {
  const fields = new Map<string, string>();

  lines.forEach((line, index) => {
    const lineNumber = index + 2; // line 1 is the opening fence

    const match = FRONTMATTER_LINE.exec(line);
    if (match === null) {
      throw fail(
        `lesson frontmatter line ${lineNumber} is not a "key: value" pair: ` +
          `${JSON.stringify(line)}.`,
      );
    }

    const key = match[1]!;
    if (!(FRONTMATTER_KEYS as readonly string[]).includes(key)) {
      throw fail(
        `lesson frontmatter line ${lineNumber}: unknown field ${JSON.stringify(key)}. ` +
          `Allowed fields are ${FRONTMATTER_KEYS.map((k) => `"${k}"`).join(', ')}.`,
      );
    }
    if (fields.has(key)) {
      throw fail(
        `lesson frontmatter line ${lineNumber}: duplicate field ${JSON.stringify(key)}.`,
      );
    }

    fields.set(key, match[2]!);
  });

  const missing = FRONTMATTER_KEYS.filter((key) => !fields.has(key));
  if (missing.length > 0) {
    throw fail(
      `lesson frontmatter is missing ${missing.map((k) => `"${k}"`).join(', ')}. ` +
        `Every lesson must carry ${FRONTMATTER_KEYS.map((k) => `"${k}"`).join(', ')}.`,
    );
  }

  return fields;
}

function buildMetadata(fields: ReadonlyMap<string, string>): LessonMetadata {
  const version = fields.get('lesson_schema_version')!;
  if (!/^\d+$/.test(version)) {
    throw fail(
      `lesson frontmatter "lesson_schema_version" must be an integer, ` +
        `but found ${JSON.stringify(version)}.`,
    );
  }
  const lessonSchemaVersion = Number(version);
  if (lessonSchemaVersion !== LESSON_SCHEMA_VERSION) {
    throw fail(
      `unsupported lesson_schema_version ${lessonSchemaVersion}; ` +
        `this build reads version ${LESSON_SCHEMA_VERSION}.`,
    );
  }

  const metadata: LessonMetadata = {
    id: fields.get('id')!,
    word: decodeWord(fields.get('word')!),
    pos: fields.get('pos') as Pos,
    date: fields.get('date')!,
    lessonSchemaVersion,
  };

  assertMetadata(metadata);

  return metadata;
}

/** The metadata rules, reusing the vocabulary and date contracts. */
function assertMetadata(metadata: LessonMetadata): void {
  if (!isVocabularyId(metadata.id)) {
    throw fail(
      `lesson "id" must be a "w" followed by at least four digits (e.g. "w0001"), ` +
        `but found ${JSON.stringify(metadata.id)}.`,
    );
  }

  const wordViolation = canonicalWordViolation(metadata.word);
  if (wordViolation !== undefined) {
    throw fail(`lesson "word" ${wordViolation}, but found ${JSON.stringify(metadata.word)}.`);
  }

  if (!(POS_VALUES as readonly string[]).includes(metadata.pos)) {
    throw fail(
      `lesson "pos" must be one of ${POS_VALUES.map((p) => `"${p}"`).join(', ')}, ` +
        `but found ${JSON.stringify(metadata.pos)}.`,
    );
  }

  if (!isCalendarDate(metadata.date)) {
    throw fail(
      `lesson "date" must be a real calendar date in YYYY-MM-DD form, ` +
        `but found ${JSON.stringify(metadata.date)}.`,
    );
  }

  if (metadata.lessonSchemaVersion !== LESSON_SCHEMA_VERSION) {
    throw fail(
      `unsupported lesson_schema_version ${metadata.lessonSchemaVersion}; ` +
        `this build reads version ${LESSON_SCHEMA_VERSION}.`,
    );
  }
}

/**
 * Serialize `word` as a YAML scalar.
 *
 * Bare when provably safe, otherwise double-quoted with a closed, reversible
 * escape set: backslash, double quote, and newline. No other escape is emitted,
 * and none other is accepted on the way back in.
 */
function encodeWord(word: string): string {
  if (isPlainWord(word)) {
    return word;
  }

  const escaped = word
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');

  return `"${escaped}"`;
}

/**
 * Whether a word may be written as a bare scalar.
 *
 * Both the encoder and the decoder consult this, so the parser accepts exactly
 * the bare values the renderer produces — no more and no less.
 */
function isPlainWord(word: string): boolean {
  return PLAIN_SAFE_WORD.test(word) && !YAML_RESERVED_WORDS.has(word);
}

function decodeWord(raw: string): string {
  if (!raw.startsWith('"')) {
    if (!isPlainWord(raw)) {
      throw fail(
        `lesson frontmatter "word" is not a canonical plain scalar: ${JSON.stringify(raw)}. ` +
          'A word the renderer would quote must be written in double-quoted form.',
      );
    }
    return raw;
  }

  if (raw.length < 2 || !raw.endsWith('"')) {
    throw fail(`lesson frontmatter "word" has an unterminated quote: ${JSON.stringify(raw)}.`);
  }

  const inner = raw.slice(1, -1);
  let decoded = '';

  for (let index = 0; index < inner.length; index += 1) {
    const char = inner[index]!;

    if (char !== '\\') {
      if (char === '"') {
        throw fail(
          `lesson frontmatter "word" has an unescaped quote: ${JSON.stringify(raw)}.`,
        );
      }
      decoded += char;
      continue;
    }

    const next = inner[index + 1];
    if (next === '\\' || next === '"') {
      decoded += next;
    } else if (next === 'n') {
      decoded += '\n';
    } else {
      throw fail(
        `lesson frontmatter "word" has an unsupported escape "\\${next ?? ''}"; ` +
          'only \\\\, \\" and \\n are used.',
      );
    }
    index += 1;
  }

  return decoded;
}

function fail(message: string): LessonValidationError {
  return new LessonValidationError(message);
}
