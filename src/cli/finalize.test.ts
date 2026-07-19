import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { LESSON_SCHEMA_VERSION, renderLesson } from '../domain/lesson.js';
import type { LessonGenerationTask } from '../domain/lessonTask.js';
import { HISTORY_PATH } from '../pipeline/finalize.js';
import { runFinalize, type CliOutput } from './finalize.js';

const run = promisify(execFile);

const TASK: LessonGenerationTask = {
  id: 'w0001',
  word: 'hablar',
  pos: 'verb',
  date: '2026-07-18',
  lessonSchemaVersion: LESSON_SCHEMA_VERSION,
  targetPath: 'lessons/2026/2026-07-18-w0001.md',
};

const BODY = [
  '## 基本資訊',
  'hablar（動詞）：說、講。',
  '',
  '## 用法',
  '日常對話中最常見的「說」。',
  '',
  '## 詞形變化',
  'Presente: hablo, hablas, habla.',
  '',
  '## 例句',
  'Hablo español. — 我說西班牙語。',
  '',
  '## 延伸學習',
  '近義詞：decir, conversar。',
].join('\n');

function document(overrides: Partial<LessonGenerationTask> = {}): string {
  return renderLesson({
    metadata: {
      id: overrides.id ?? TASK.id,
      word: overrides.word ?? TASK.word,
      pos: overrides.pos ?? TASK.pos,
      date: overrides.date ?? TASK.date,
      lessonSchemaVersion: TASK.lessonSchemaVersion,
    },
    body: BODY,
  });
}

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-cli-finalize-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

function collector(): { out: CliOutput; stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    out: { stdout: (line) => stdout.push(line), stderr: (line) => stderr.push(line) },
    stdout,
    stderr,
  };
}

async function git(cwd: string, ...args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd });
  return stdout;
}

async function write(root: string, relativePath: string, contents: string): Promise<void> {
  const path = join(root, relativePath);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, contents, 'utf8');
}

/** A repository with the lesson generated, tracking a local bare remote. */
async function scenario(
  name: string,
  options: { readonly lesson?: string; readonly upstream?: boolean } = {},
): Promise<{ root: string; bare: string; taskFile: string }> {
  const bare = join(workDir, `${name}.git`);
  await mkdir(bare, { recursive: true });
  await git(bare, 'init', '--bare', '--initial-branch=main', '--quiet');

  const root = join(workDir, name);
  await mkdir(root, { recursive: true });
  await git(root, 'init', '--initial-branch=main', '--quiet');
  await git(root, 'config', 'user.name', 'Test');
  await git(root, 'config', 'user.email', 'test@example.invalid');

  await write(root, 'README.md', 'baseline\n');
  await git(root, 'add', '--', 'README.md');
  await git(root, 'commit', '--quiet', '--message', 'baseline');

  if (options.upstream !== false) {
    await git(root, 'remote', 'add', 'origin', bare);
    await git(root, 'push', '--quiet', '--set-upstream', 'origin', 'main');
  }

  await write(root, TASK.targetPath, options.lesson ?? document());

  // The task file lives outside the repository, so it is never a working-tree
  // change of its own.
  const taskFile = join(workDir, `${name}.task.json`);
  await writeFile(taskFile, JSON.stringify({ kind: 'generate', task: TASK }), 'utf8');

  return { root, bare, taskFile };
}

describe('runFinalize — success', () => {
  it('prints the durable write result as JSON and exits 0', async () => {
    const { root, bare, taskFile } = await scenario('success');
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 0);

    assert.equal(stdout.length, 1);
    const result = JSON.parse(stdout[0]!) as Record<string, string>;
    assert.equal(result['lessonPath'], TASK.targetPath);
    assert.equal(result['historyPath'], HISTORY_PATH);
    assert.match(result['commit']!, /^[0-9a-f]{40}$/);
    assert.deepEqual(stderr, []);

    // Durable means it reached the remote.
    assert.equal((await git(bare, 'rev-parse', 'main')).trim(), result['commit']);
  });

  it('uses the default root when none is given', async () => {
    const { root, taskFile } = await scenario('default-root');
    const { out, stdout } = collector();

    assert.equal(await runFinalize([taskFile], out, root), 0);
    assert.equal(JSON.parse(stdout[0]!).lessonPath, TASK.targetPath);
  });

  it('handles a repository path containing spaces', async () => {
    const { root, taskFile } = await scenario('a finalize repo with spaces');
    const { out, stdout } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 0);
    assert.equal(JSON.parse(stdout[0]!).historyPath, HISTORY_PATH);
  });

  it('does not modify the task file', async () => {
    const { root, taskFile } = await scenario('task-untouched');
    const before = await readFile(taskFile, 'utf8');
    const { out } = collector();

    await runFinalize([taskFile, root], out, workDir);

    assert.equal(await readFile(taskFile, 'utf8'), before);
  });
});

describe('runFinalize — failures', () => {
  it('exits non-zero and prints nothing to stdout when the task file is missing', async () => {
    const { root } = await scenario('missing-task');
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([join(workDir, 'nowhere.json'), root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /reading the generation task/);
  });

  it('exits non-zero when the task file is not JSON', async () => {
    const { root } = await scenario('bad-json');
    const taskFile = join(workDir, 'bad.json');
    await writeFile(taskFile, 'not json at all', 'utf8');
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /parsing the generation task/);
  });

  it('exits non-zero when the task is JSON but not a valid task', async () => {
    const { root } = await scenario('invalid-task');
    const taskFile = join(workDir, 'invalid.json');
    await writeFile(
      taskFile,
      JSON.stringify({ kind: 'generate', task: { ...TASK, id: 'nope' } }),
      'utf8',
    );
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /validating the generation task/);
  });

  it('says plainly that a replay task file has nothing to finalize', async () => {
    const { root } = await scenario('replay-envelope');
    const taskFile = join(workDir, 'replay.json');
    await writeFile(
      taskFile,
      JSON.stringify({
        kind: 'replay',
        record: { date: '2026-07-18', id: 'w0001', word: 'hablar' },
      }),
      'utf8',
    );
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /records a replay/);
    assert.match(stderr.join('\n'), /nothing to finalize/);
  });

  it('says plainly that an exhausted task file has nothing to finalize', async () => {
    const { root } = await scenario('exhausted-envelope');
    const taskFile = join(workDir, 'exhausted.json');
    await writeFile(taskFile, JSON.stringify({ kind: 'exhausted' }), 'utf8');
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /exhausted curriculum/);
    assert.match(stderr.join('\n'), /nothing to finalize/);
  });

  it('exits non-zero when the lesson metadata disagrees with the task', async () => {
    const { root, bare, taskFile } = await scenario('metadata-mismatch', {
      lesson: document({ word: 'comer' }),
    });
    const remoteBefore = (await git(bare, 'rev-parse', 'main')).trim();
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /accepting the generated lesson/);
    // Nothing was recorded: the day stays unfinished.
    assert.equal((await git(bare, 'rev-parse', 'main')).trim(), remoteBefore);
    await assert.rejects(() => readFile(join(root, HISTORY_PATH), 'utf8'));
  });

  it('exits non-zero when the push fails, and prints no partial success', async () => {
    const { root, bare, taskFile } = await scenario('push-failure');
    await rm(bare, { recursive: true, force: true });
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /could not push/);
    // The local commit is preserved, and nothing was undone.
    assert.match((await git(root, 'rev-parse', 'HEAD')).trim(), /^[0-9a-f]{40}$/);
    assert.equal(await git(root, 'status', '--porcelain'), '');
  });

  it('exits non-zero when the branch has no upstream', async () => {
    const { root, taskFile } = await scenario('no-upstream', { upstream: false });
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /no upstream/);
  });

  it('requires a task file', async () => {
    const { out, stdout, stderr } = collector();

    assert.equal(await runFinalize([], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /a task file is required/);
  });

  it('rejects extra arguments', async () => {
    const { out, stderr } = collector();

    assert.equal(await runFinalize(['a', 'b', 'c'], out, workDir), 1);
    assert.match(stderr.join('\n'), /usage: finalize/);
  });

  it('states in its usage that a failed run is not simply re-runnable', async () => {
    const { out, stderr } = collector();

    await runFinalize([], out, workDir);

    const usage = stderr.join('\n');
    assert.match(usage, /no reset, no revert, no checkout, no force push/);
    assert.match(usage, /re-running will refuse/);
  });
});
