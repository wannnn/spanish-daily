import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { VOCABULARY_PATH } from '../pipeline/prepare.js';
import { HISTORY_PATH } from '../pipeline/finalize.js';
import { runPrepare, type CliOutput } from './prepare.js';

const run = promisify(execFile);

const NOW = new Date('2026-07-18T04:00:00Z');

const VOCABULARY = JSON.stringify([{ id: 'w0001', word: 'hablar', order: 1, pos: 'verb' }]);

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-cli-prepare-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

/** Collects what the command writes, so nothing reaches the real streams. */
function collector(): { out: CliOutput; stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    out: { stdout: (line) => stdout.push(line), stderr: (line) => stderr.push(line) },
    stdout,
    stderr,
  };
}

async function git(cwd: string, ...args: string[]): Promise<void> {
  await run('git', args, { cwd });
}

async function repository(
  name: string,
  options: { readonly history?: string } = {},
): Promise<string> {
  const root = join(workDir, name);
  await mkdir(root, { recursive: true });

  await git(root, 'init', '--initial-branch=main', '--quiet');
  await git(root, 'config', 'user.name', 'Test');
  await git(root, 'config', 'user.email', 'test@example.invalid');

  await writeFile(join(root, VOCABULARY_PATH), VOCABULARY, 'utf8');
  if (options.history !== undefined) {
    await writeFile(join(root, HISTORY_PATH), options.history, 'utf8');
  }

  await git(root, 'add', '--all');
  await git(root, 'commit', '--quiet', '--message', 'canonical data');

  return root;
}

describe('runPrepare — output', () => {
  it('prints the generation task as a single JSON line and exits 0', async () => {
    const root = await repository('generate');
    const { out, stdout, stderr } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 0);

    assert.equal(stdout.length, 1);
    assert.deepEqual(JSON.parse(stdout[0]!), {
      kind: 'generate',
      task: {
        id: 'w0001',
        word: 'hablar',
        pos: 'verb',
        date: '2026-07-18',
        lessonSchemaVersion: 1,
        targetPath: 'lessons/2026/2026-07-18-w0001.md',
      },
    });
    assert.deepEqual(stderr, []);
  });

  it('prints a replay result and exits 0', async () => {
    const root = await repository('replay', {
      history: '{"date":"2026-07-18","id":"w0009","word":"antiguo"}\n',
    });
    const { out, stdout } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 0);

    assert.deepEqual(JSON.parse(stdout[0]!), {
      kind: 'replay',
      record: { date: '2026-07-18', id: 'w0009', word: 'antiguo' },
    });
  });

  it('prints exhaustion and exits 0 — a finished curriculum is not a failure', async () => {
    const root = await repository('exhausted', {
      history: '{"date":"2026-07-17","id":"w0001","word":"hablar"}\n',
    });
    const { out, stdout } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 0);

    assert.deepEqual(JSON.parse(stdout[0]!), { kind: 'exhausted' });
  });

  it('writes only parseable JSON to stdout, never a diagnostic', async () => {
    const root = await repository('json-purity');
    await writeFile(join(root, 'stray.txt'), 'x\n', 'utf8');
    const { out, stdout, stderr } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.ok(stderr.length > 0);
  });

  it('uses the default root when none is given', async () => {
    const root = await repository('default-root');
    const { out, stdout } = collector();

    assert.equal(await runPrepare([], NOW, out, root), 0);

    assert.equal(JSON.parse(stdout[0]!).kind, 'generate');
  });

  it('handles a repository path containing spaces', async () => {
    const root = await repository('a prepare repo with spaces');
    const { out, stdout } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 0);

    assert.equal(JSON.parse(stdout[0]!).kind, 'generate');
  });
});

describe('runPrepare — failures', () => {
  it('exits non-zero when the repository is dirty', async () => {
    const root = await repository('dirty');
    await writeFile(join(root, 'stray.txt'), 'x\n', 'utf8');
    const { out, stderr } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 1);
    assert.match(stderr.join('\n'), /clean before generation/);
  });

  it('exits non-zero when the vocabulary is unreadable', async () => {
    const root = join(workDir, 'no-vocabulary');
    await mkdir(root, { recursive: true });
    await git(root, 'init', '--initial-branch=main', '--quiet');
    const { out, stdout } = collector();

    assert.equal(await runPrepare([root], NOW, out, workDir), 1);
    assert.deepEqual(stdout, []);
  });

  it('exits non-zero when the path is not a repository', async () => {
    const plain = join(workDir, 'plain');
    await mkdir(plain, { recursive: true });
    const { out } = collector();

    assert.equal(await runPrepare([plain], NOW, out, workDir), 1);
  });

  it('rejects extra arguments without running anything', async () => {
    const { out, stdout, stderr } = collector();

    assert.equal(await runPrepare(['a', 'b'], NOW, out, workDir), 1);

    assert.deepEqual(stdout, []);
    assert.match(stderr.join('\n'), /usage: prepare/);
  });
});
