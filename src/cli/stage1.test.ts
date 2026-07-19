/**
 * Stage 1 end to end, as the two commands are actually run: prepare, an
 * external generation step, then finalize.
 *
 * The point of this suite is the boundary the two commands share — where the
 * task file lives — which neither command's own tests can show on its own.
 */

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { renderLesson } from '../domain/lesson.js';
import { parsePreparedTask } from '../domain/lessonTask.js';
import { HISTORY_PATH } from '../pipeline/finalize.js';
import { VOCABULARY_PATH } from '../pipeline/prepare.js';
import { runFinalize } from './finalize.js';
import { runPrepare, type CliOutput } from './prepare.js';

const run = promisify(execFile);

const NOW = new Date('2026-07-18T04:00:00Z');

const VOCABULARY = JSON.stringify([
  { id: 'w0001', word: 'hablar', order: 1, pos: 'verb' },
  { id: 'w0002', word: 'casa', order: 2, pos: 'noun' },
]);

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

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-stage1-'));
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

/** A committed repository with canonical vocabulary, tracking a bare remote. */
async function scenario(name: string): Promise<{ root: string; bare: string }> {
  const bare = join(workDir, `${name}.git`);
  await mkdir(bare, { recursive: true });
  await git(bare, 'init', '--bare', '--initial-branch=main', '--quiet');

  const root = join(workDir, name);
  await mkdir(root, { recursive: true });
  await git(root, 'init', '--initial-branch=main', '--quiet');
  await git(root, 'config', 'user.name', 'Test');
  await git(root, 'config', 'user.email', 'test@example.invalid');

  await write(root, VOCABULARY_PATH, VOCABULARY);
  await git(root, 'add', '--', VOCABULARY_PATH);
  await git(root, 'commit', '--quiet', '--message', 'canonical data');

  await git(root, 'remote', 'add', 'origin', bare);
  await git(root, 'push', '--quiet', '--set-upstream', 'origin', 'main');

  return { root, bare };
}

/**
 * Stand in for the Claude Code Action: write exactly the one file the task
 * names, complete with the frontmatter the task supplied.
 */
async function generate(root: string, preparedJson: string): Promise<void> {
  const task = parsePreparedTask(JSON.parse(preparedJson));

  await write(
    root,
    task.targetPath,
    renderLesson({
      metadata: {
        id: task.id,
        word: task.word,
        pos: task.pos,
        date: task.date,
        lessonSchemaVersion: task.lessonSchemaVersion,
      },
      body: BODY,
    }),
  );
}

describe('Stage 1 end to end', () => {
  it('runs prepare, generation, and finalize with the task file outside the repository', async () => {
    const { root, bare } = await scenario('outside');

    // The task file lives in the temp area, the way `mktemp` would place it —
    // never in the worktree, which a shell redirection into the repository
    // would make dirty before prepare could even run.
    const taskFile = join(workDir, 'outside.task.json');

    const prepared = collector();
    assert.equal(await runPrepare([root], NOW, prepared.out, workDir), 0);
    await writeFile(taskFile, prepared.stdout[0]!, 'utf8');

    await generate(root, prepared.stdout[0]!);

    const finalized = collector();
    assert.equal(await runFinalize([taskFile, root], finalized.out, workDir), 0);

    const result = JSON.parse(finalized.stdout[0]!) as Record<string, string>;
    assert.equal(result['lessonPath'], 'lessons/2026/2026-07-18-w0001.md');
    assert.equal(result['historyPath'], HISTORY_PATH);
    assert.equal((await git(bare, 'rev-parse', 'main')).trim(), result['commit']);
    assert.equal(await git(root, 'status', '--porcelain'), '');

    // The command does not clean up after the caller.
    assert.ok(await readFile(taskFile, 'utf8'));
  });

  it('the next day continues from the committed history', async () => {
    const { root } = await scenario('next-day');
    const taskFile = join(workDir, 'next-day.task.json');

    const first = collector();
    await runPrepare([root], NOW, first.out, workDir);
    await writeFile(taskFile, first.stdout[0]!, 'utf8');
    await generate(root, first.stdout[0]!);
    assert.equal(await runFinalize([taskFile, root], collector().out, workDir), 0);

    const second = collector();
    assert.equal(
      await runPrepare([root], new Date('2026-07-19T04:00:00Z'), second.out, workDir),
      0,
    );

    const next = JSON.parse(second.stdout[0]!) as { kind: string; task: { id: string } };
    assert.equal(next.kind, 'generate');
    assert.equal(next.task.id, 'w0002');
  });

  it('replays the same day rather than generating twice', async () => {
    const { root } = await scenario('same-day');
    const taskFile = join(workDir, 'same-day.task.json');

    const first = collector();
    await runPrepare([root], NOW, first.out, workDir);
    await writeFile(taskFile, first.stdout[0]!, 'utf8');
    await generate(root, first.stdout[0]!);
    await runFinalize([taskFile, root], collector().out, workDir);

    const again = collector();
    assert.equal(await runPrepare([root], NOW, again.out, workDir), 0);

    assert.deepEqual(JSON.parse(again.stdout[0]!), {
      kind: 'replay',
      record: { date: '2026-07-18', id: 'w0001', word: 'hablar' },
    });
  });
});

describe('Stage 1 — a task file inside the repository', () => {
  it('makes prepare refuse, because the redirection dirties the worktree first', async () => {
    const { root } = await scenario('inside-prepare');

    // Exactly what `prepare > task.json` does: the shell creates the file
    // before the command runs.
    await write(root, 'task.json', '');

    const { out, stdout, stderr } = collector();
    assert.equal(await runPrepare([root], NOW, out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /clean before generation/);
  });

  it('makes finalize refuse, because it is a change generation did not authorize', async () => {
    const { root, bare } = await scenario('inside-finalize');
    const remoteBefore = (await git(bare, 'rev-parse', 'main')).trim();

    const prepared = collector();
    await runPrepare([root], NOW, prepared.out, workDir);
    await generate(root, prepared.stdout[0]!);

    // The task file is written into the worktree only now — after prepare — so
    // it is finalize that has to catch it.
    const taskFile = join(root, 'task.json');
    await writeFile(taskFile, prepared.stdout[0]!, 'utf8');

    const { out, stdout, stderr } = collector();
    assert.equal(await runFinalize([taskFile, root], out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /exactly one new file/);
    // Nothing was recorded: the day stays unfinished.
    assert.equal((await git(bare, 'rev-parse', 'main')).trim(), remoteBefore);
    await assert.rejects(() => readFile(join(root, HISTORY_PATH), 'utf8'));
  });

  it('names the task file among the unexpected changes', async () => {
    const { root } = await scenario('inside-named');

    const prepared = collector();
    await runPrepare([root], NOW, prepared.out, workDir);
    await generate(root, prepared.stdout[0]!);

    const taskFile = join(root, 'task.json');
    await writeFile(taskFile, prepared.stdout[0]!, 'utf8');

    const { out, stderr } = collector();
    await runFinalize([taskFile, root], out, workDir);

    assert.match(stderr.join('\n'), /task\.json/);
  });
});

describe('Stage 1 — the commands say where the task file belongs', () => {
  it('prepare says so in its usage', async () => {
    const { out, stderr } = collector();

    await runPrepare(['a', 'b'], NOW, out, workDir);

    assert.match(stderr.join('\n'), /OUTSIDE the repository/);
    assert.match(stderr.join('\n'), /mktemp/);
  });

  it('finalize says so in its usage', async () => {
    const { out, stderr } = collector();

    await runFinalize([], out, workDir);

    assert.match(stderr.join('\n'), /OUTSIDE the repository working tree/);
    assert.match(stderr.join('\n'), /never deleted/);
  });
});
