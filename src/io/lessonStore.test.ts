import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import {
  LESSON_SCHEMA_VERSION,
  LessonValidationError,
  parseLesson,
  renderLesson,
} from '../domain/lesson.js';
import type { Lesson, LessonMetadata } from '../domain/types.js';
import { LessonStoreError, writeLesson } from './lessonStore.js';

let workDir: string;
let rootCount = 0;

const BODY = [
  '## 基本資訊',
  '',
  'hablar — 說話',
  '',
  '## 用法',
  '',
  '常見搭配。',
  '',
  '## 詞形變化',
  '',
  '| yo | hablo |',
  '',
  '## 例句',
  '',
  'Hablo español.',
  '',
  '## 延伸學習',
  '',
  '近義詞：decir。',
].join('\n');

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-lessons-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

/** A fresh repository root for one test. */
async function repoRoot(): Promise<string> {
  rootCount += 1;
  const root = join(workDir, `repo-${rootCount}`);
  await mkdir(root, { recursive: true });
  return root;
}

function metadata(overrides: Partial<LessonMetadata> = {}): LessonMetadata {
  return {
    id: 'w0001',
    word: 'hablar',
    pos: 'verb',
    date: '2026-07-18',
    lessonSchemaVersion: LESSON_SCHEMA_VERSION,
    ...overrides,
  };
}

function lesson(overrides: Partial<Lesson> = {}): Lesson {
  return { metadata: metadata(), body: BODY, ...overrides };
}

/** Every entry under the root, relative and POSIX-style. */
async function tree(root: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(join(root, prefix), { withFileTypes: true });
  const out: string[] = [];

  for (const entry of entries) {
    const relative = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...(await tree(root, relative)));
    } else {
      out.push(relative);
    }
  }
  return out.sort();
}

describe('writeLesson — writing', () => {
  it('creates the year directory and writes the canonical document', async () => {
    const root = await repoRoot();
    const relative = await writeLesson(root, lesson());

    assert.equal(relative, 'lessons/2026/2026-07-18-w0001.md');
    assert.equal(
      await readFile(join(root, relative), 'utf8'),
      renderLesson(lesson()),
    );
  });

  it('returns the canonical relative path with POSIX separators', async () => {
    const relative = await writeLesson(await repoRoot(), lesson());

    assert.ok(!relative.includes('\\'));
    assert.ok(!relative.startsWith('/'));
  });

  it('shards by the year in the date', async () => {
    const root = await repoRoot();
    await writeLesson(root, lesson({ metadata: metadata({ date: '2026-12-31' }) }));
    await writeLesson(
      root,
      lesson({ metadata: metadata({ id: 'w0002', date: '2027-01-01' }) }),
    );

    assert.deepEqual(await tree(root), [
      'lessons/2026/2026-12-31-w0001.md',
      'lessons/2027/2027-01-01-w0002.md',
    ]);
  });

  it('writes the file into place and leaves no temporary behind', async () => {
    const root = await repoRoot();
    await writeLesson(root, lesson());

    assert.deepEqual(await tree(root), ['lessons/2026/2026-07-18-w0001.md']);
  });

  it('parses back into an equivalent lesson', async () => {
    const root = await repoRoot();
    const original = lesson();
    const relative = await writeLesson(root, original);

    const parsed = parseLesson(await readFile(join(root, relative), 'utf8'));

    assert.deepEqual(parsed.metadata, original.metadata);
    assert.equal(parsed.body, original.body);
  });

  it('writes nothing outside the repository root', async () => {
    const root = await repoRoot();
    await writeLesson(root, lesson());

    // Only the repo we asked for gained files.
    const siblings = await readdir(workDir);
    assert.ok(siblings.every((name) => name.startsWith('repo-')));
  });

  it('keeps sibling roots whose names share a prefix separate', async () => {
    // A containment check comparing raw prefixes would treat "root2" as being
    // inside "root".
    const root = join(workDir, 'prefix-root');
    const sibling = join(workDir, 'prefix-root2');
    await mkdir(root, { recursive: true });
    await mkdir(sibling, { recursive: true });

    await writeLesson(root, lesson());

    assert.deepEqual(await tree(root), ['lessons/2026/2026-07-18-w0001.md']);
    assert.deepEqual(await tree(sibling), []);
  });
});

describe('writeLesson — existing target', () => {
  it('is idempotent when the existing content is identical', async () => {
    const root = await repoRoot();

    const first = await writeLesson(root, lesson());
    const second = await writeLesson(root, lesson());

    assert.equal(first, second);
    assert.equal(
      await readFile(join(root, second), 'utf8'),
      renderLesson(lesson()),
    );
    assert.deepEqual(await tree(root), ['lessons/2026/2026-07-18-w0001.md']);
  });

  it('refuses to overwrite different content, and leaves it untouched', async () => {
    const root = await repoRoot();
    await writeLesson(root, lesson());

    const changed = lesson({ body: BODY.replace('說話', '講話') });

    await assert.rejects(
      () => writeLesson(root, changed),
      (error: unknown) => {
        assert.ok(error instanceof LessonStoreError);
        assert.match(error.message, /already exists/);
        return true;
      },
    );

    // The original survived intact.
    assert.equal(
      await readFile(join(root, 'lessons/2026/2026-07-18-w0001.md'), 'utf8'),
      renderLesson(lesson()),
    );
  });

  it('treats a differing metadata field as different content', async () => {
    const root = await repoRoot();
    await writeLesson(root, lesson());

    // Same id and date, so the same path — but a different word.
    const changed = lesson({ metadata: metadata({ word: 'comer' }) });

    await assert.rejects(() => writeLesson(root, changed), LessonStoreError);
  });
});

describe('writeLesson — failures', () => {
  it('rejects an invalid lesson before touching the filesystem', async () => {
    const root = await repoRoot();

    await assert.rejects(
      () => writeLesson(root, lesson({ metadata: metadata({ id: 'nope' }) })),
      LessonValidationError,
    );

    assert.deepEqual(await tree(root), []);
  });

  it('rejects an invalid body before touching the filesystem', async () => {
    const root = await repoRoot();

    await assert.rejects(
      () => writeLesson(root, lesson({ body: '## 用法\n\n只有一節。' })),
      LessonValidationError,
    );

    assert.deepEqual(await tree(root), []);
  });

  it('preserves the cause when the directory cannot be created', async () => {
    const root = await repoRoot();
    // A file where the `lessons` directory needs to be.
    await writeFile(join(root, 'lessons'), 'in the way', 'utf8');

    await assert.rejects(
      () => writeLesson(root, lesson()),
      (error: unknown) => {
        assert.ok(error instanceof LessonStoreError);
        assert.match(error.message, /Cannot create lesson directory/);
        assert.ok(error.cause instanceof Error, 'original cause should be kept');
        return true;
      },
    );
  });

  it('preserves the cause when the write fails, and cleans up the temporary', async () => {
    const root = await repoRoot();
    const yearDir = join(root, 'lessons', '2026');
    await mkdir(yearDir, { recursive: true });
    await chmod(yearDir, 0o500); // readable and traversable, not writable

    try {
      await assert.rejects(
        () => writeLesson(root, lesson()),
        (error: unknown) => {
          assert.ok(error instanceof LessonStoreError);
          assert.match(error.message, /Cannot write lesson to/);
          assert.ok(error.cause instanceof Error, 'original cause should be kept');
          return true;
        },
      );

      // No half-written file and no leftover temporary.
      assert.deepEqual(await readdir(yearDir), []);
    } finally {
      await chmod(yearDir, 0o700);
    }
  });

  it('reports an unreadable existing target rather than overwriting it', async () => {
    const root = await repoRoot();
    const target = join(root, 'lessons', '2026', '2026-07-18-w0001.md');
    await mkdir(join(root, 'lessons', '2026'), { recursive: true });
    // A directory where the lesson file should be: present, but not readable as a file.
    await mkdir(target, { recursive: true });

    await assert.rejects(
      () => writeLesson(root, lesson()),
      (error: unknown) => {
        assert.ok(error instanceof LessonStoreError);
        assert.match(error.message, /Cannot read the existing lesson/);
        assert.ok(error.cause instanceof Error);
        return true;
      },
    );
  });
});
