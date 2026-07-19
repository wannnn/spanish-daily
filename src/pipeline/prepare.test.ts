import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { LESSON_SCHEMA_VERSION } from '../domain/lesson.js';
import { HISTORY_PATH } from './finalize.js';
import { DailyPrepareError, VOCABULARY_PATH, prepareDailyLesson } from './prepare.js';

const run = promisify(execFile);

/** Midday in Taipei on 2026-07-18, so the date never depends on the host. */
const NOW = new Date('2026-07-18T04:00:00Z');

const VOCABULARY = JSON.stringify([
  { id: 'w0001', word: 'hablar', order: 1, pos: 'verb' },
  { id: 'w0002', word: 'casa', order: 2, pos: 'noun' },
]);

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-prepare-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function git(cwd: string, ...args: string[]): Promise<void> {
  await run('git', args, { cwd });
}

async function write(root: string, relativePath: string, contents: string): Promise<void> {
  const path = join(root, relativePath);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, contents, 'utf8');
}

/**
 * A committed repository holding the canonical vocabulary, and optionally a
 * history. Identity is local; the developer's global git config is untouched.
 */
async function repository(
  name: string,
  options: { readonly history?: string; readonly vocabulary?: string } = {},
): Promise<string> {
  const root = join(workDir, name);
  await mkdir(root, { recursive: true });

  await git(root, 'init', '--initial-branch=main', '--quiet');
  await git(root, 'config', 'user.name', 'Test');
  await git(root, 'config', 'user.email', 'test@example.invalid');

  await write(root, VOCABULARY_PATH, options.vocabulary ?? VOCABULARY);
  if (options.history !== undefined) {
    await write(root, HISTORY_PATH, options.history);
  }

  await git(root, 'add', '--all');
  await git(root, 'commit', '--quiet', '--message', 'canonical data');

  return root;
}

describe('prepareDailyLesson — deciding the day', () => {
  it('produces a task for the lowest unlearned order', async () => {
    const root = await repository('selected');

    const result = await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    assert.deepEqual(result, {
      kind: 'generate',
      task: {
        id: 'w0001',
        word: 'hablar',
        pos: 'verb',
        date: '2026-07-18',
        lessonSchemaVersion: LESSON_SCHEMA_VERSION,
        targetPath: 'lessons/2026/2026-07-18-w0001.md',
      },
    });
  });

  it('treats a missing history file as the first run', async () => {
    const root = await repository('no-history');

    const result = await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    assert.equal(result.kind, 'generate');
  });

  it('skips words already recorded', async () => {
    const root = await repository('partial-history', {
      history: '{"date":"2026-07-17","id":"w0001","word":"hablar"}\n',
    });

    const result = await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    assert.equal(result.kind, 'generate');
    if (result.kind === 'generate') assert.equal(result.task.id, 'w0002');
  });

  it('replays a day that is already recorded', async () => {
    const root = await repository('replay', {
      history: '{"date":"2026-07-18","id":"w0009","word":"antiguo"}\n',
    });

    const result = await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    assert.deepEqual(result, {
      kind: 'replay',
      record: { date: '2026-07-18', id: 'w0009', word: 'antiguo' },
    });
  });

  it('reports exhaustion once every word is learned', async () => {
    const root = await repository('exhausted', {
      history:
        '{"date":"2026-07-16","id":"w0001","word":"hablar"}\n' +
        '{"date":"2026-07-17","id":"w0002","word":"casa"}\n',
    });

    const result = await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    assert.deepEqual(result, { kind: 'exhausted' });
  });

  it('computes the date in Asia/Taipei, not in UTC', async () => {
    const root = await repository('timezone');
    // 2026-07-18T17:00Z is already 2026-07-19 in Taipei.
    const result = await prepareDailyLesson({
      repositoryRoot: root,
      now: new Date('2026-07-18T17:00:00Z'),
    });

    assert.equal(result.kind, 'generate');
    if (result.kind === 'generate') assert.equal(result.task.date, '2026-07-19');
  });
});

describe('prepareDailyLesson — refusing', () => {
  it('refuses to start in a repository with an untracked file', async () => {
    const root = await repository('dirty-untracked');
    await write(root, 'stray.txt', 'left over\n');

    await assert.rejects(() => prepareDailyLesson({ repositoryRoot: root, now: NOW }), {
      name: 'DailyPrepareError',
      message: /clean before generation/,
    });
  });

  it('refuses to start with an uncommitted modification', async () => {
    const root = await repository('dirty-modified');
    await write(root, VOCABULARY_PATH, '[]');

    await assert.rejects(
      () => prepareDailyLesson({ repositoryRoot: root, now: NOW }),
      DailyPrepareError,
    );
  });

  it('refuses to start with a staged change', async () => {
    const root = await repository('dirty-staged');
    await write(root, 'added.txt', 'x\n');
    await git(root, 'add', '--', 'added.txt');

    await assert.rejects(
      () => prepareDailyLesson({ repositoryRoot: root, now: NOW }),
      DailyPrepareError,
    );
  });

  it('checks the repository before reading any canonical data', async () => {
    // The vocabulary is invalid *and* the tree is dirty. The clean check must be
    // what reports, because a dirty tree makes everything after it unreliable.
    const root = await repository('dirty-first', { vocabulary: '[]' });
    await write(root, 'stray.txt', 'x\n');

    await assert.rejects(() => prepareDailyLesson({ repositoryRoot: root, now: NOW }), {
      message: /clean before generation/,
    });
  });

  it('fails when the repository root is not a worktree root', async () => {
    const plain = join(workDir, 'not-a-repo');
    await mkdir(plain, { recursive: true });

    await assert.rejects(
      () => prepareDailyLesson({ repositoryRoot: plain, now: NOW }),
      DailyPrepareError,
    );
  });

  it('fails when the vocabulary is missing', async () => {
    const root = join(workDir, 'no-vocabulary');
    await mkdir(root, { recursive: true });
    await git(root, 'init', '--initial-branch=main', '--quiet');
    await git(root, 'config', 'user.name', 'Test');
    await git(root, 'config', 'user.email', 'test@example.invalid');

    await assert.rejects(() => prepareDailyLesson({ repositoryRoot: root, now: NOW }), {
      name: 'DailyPrepareError',
      message: /vocabulary\.json/,
    });
  });

  it('fails when the vocabulary violates its contract', async () => {
    const root = await repository('bad-vocabulary', {
      vocabulary: JSON.stringify([{ id: 'nope', word: 'hablar', order: 1, pos: 'verb' }]),
    });

    await assert.rejects(() => prepareDailyLesson({ repositoryRoot: root, now: NOW }), {
      name: 'DailyPrepareError',
      message: /loading vocabulary\.json/,
    });
  });

  it('fails when the history is corrupt rather than treating it as empty', async () => {
    const root = await repository('bad-history', { history: 'not json\n' });

    await assert.rejects(() => prepareDailyLesson({ repositoryRoot: root, now: NOW }), {
      name: 'DailyPrepareError',
      message: /loading history\.jsonl/,
    });
  });

  it('keeps the underlying failure as the cause', async () => {
    const root = await repository('cause', { history: 'not json\n' });

    await assert.rejects(
      () => prepareDailyLesson({ repositoryRoot: root, now: NOW }),
      (error: unknown) => {
        assert.ok(error instanceof DailyPrepareError);
        assert.ok(error.cause instanceof Error);
        return true;
      },
    );
  });

  it('works when the repository path contains spaces', async () => {
    const root = await repository('a repo with spaces');

    const result = await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    assert.equal(result.kind, 'generate');
  });

  it('writes nothing', async () => {
    const root = await repository('read-only');

    await prepareDailyLesson({ repositoryRoot: root, now: NOW });

    const { stdout } = await run('git', ['status', '--porcelain'], { cwd: root });
    assert.equal(stdout, '');
  });
});
