import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { LESSON_SCHEMA_VERSION, renderLesson } from '../domain/lesson.js';
import {
  LessonAcceptanceError,
  type LessonGenerationTask,
} from '../domain/lessonTask.js';
import { HistoryStoreError } from '../io/historyStore.js';
import {
  DurableWriteError,
  HISTORY_PATH,
  finalizeLesson,
  lessonCommitMessage,
} from './finalize.js';

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

/** The canonical document a correct generation step would have written. */
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
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-finalize-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function git(cwd: string, ...args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd });
  return stdout;
}

/** Write a file inside a repository, creating parent directories. */
async function write(root: string, relativePath: string, contents: string): Promise<void> {
  const path = join(root, relativePath);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, contents, 'utf8');
}

/**
 * A repository with one commit, tracking a local bare repository as `origin`.
 *
 * Local only: no network is involved, and the identity is set per-repository so
 * the developer's global git config is never read or written.
 */
async function scenario(
  name: string,
  options: { readonly upstream?: boolean } = {},
): Promise<{ root: string; bare: string }> {
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

  return { root, bare };
}

/** A repository with the lesson already generated into place. */
async function generated(
  name: string,
  options: { readonly upstream?: boolean } = {},
): Promise<{ root: string; bare: string }> {
  const paths = await scenario(name, options);
  await write(paths.root, TASK.targetPath, document());
  return paths;
}

/** The files a commit touched. */
async function committedFiles(root: string, revision = 'HEAD'): Promise<string[]> {
  const output = await git(root, 'show', '--name-only', '--pretty=format:', revision);
  return output.split('\n').filter((line) => line !== '');
}

function input(root: string, overrides: Record<string, unknown> = {}) {
  return { repositoryRoot: root, task: TASK, ...overrides };
}

describe('finalizeLesson — the durable write', () => {
  it('commits the lesson and the history record, and pushes them', async () => {
    const { root, bare } = await generated('success');

    const result = await finalizeLesson(input(root));

    assert.equal(result.lessonPath, TASK.targetPath);
    assert.equal(result.historyPath, HISTORY_PATH);
    assert.equal(result.commit, (await git(root, 'rev-parse', 'HEAD')).trim());
    // Durable means it reached the remote, not merely that it was committed.
    assert.equal((await git(bare, 'rev-parse', 'main')).trim(), result.commit);
  });

  it('carries both canonical writes in one commit, and nothing else', async () => {
    const { root } = await generated('one-commit');

    await finalizeLesson(input(root));

    assert.deepEqual((await committedFiles(root)).sort(), [
      HISTORY_PATH,
      TASK.targetPath,
    ]);
  });

  it('leaves the working tree clean', async () => {
    const { root } = await generated('clean-after');

    await finalizeLesson(input(root));

    assert.equal(await git(root, 'status', '--porcelain'), '');
  });

  it('creates the history file on the first run', async () => {
    const { root } = await generated('first-history');

    await finalizeLesson(input(root));

    assert.equal(
      await readFile(join(root, HISTORY_PATH), 'utf8'),
      '{"date":"2026-07-18","id":"w0001","word":"hablar"}\n',
    );
  });

  it('appends to an existing history file', async () => {
    const { root } = await generated('append-history');
    const existing = '{"date":"2026-07-17","id":"w0009","word":"casa"}\n';
    await write(root, HISTORY_PATH, existing);
    await git(root, 'add', '--', HISTORY_PATH);
    await git(root, 'commit', '--quiet', '--message', 'seed history');
    await git(root, 'push', '--quiet');

    await finalizeLesson(input(root));

    assert.equal(
      await readFile(join(root, HISTORY_PATH), 'utf8'),
      `${existing}{"date":"2026-07-18","id":"w0001","word":"hablar"}\n`,
    );
  });

  it('derives the history record from the task', async () => {
    const { root } = await generated('derived-record');

    await finalizeLesson(input(root));

    const [record] = (await readFile(join(root, HISTORY_PATH), 'utf8'))
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as unknown);

    assert.deepEqual(record, { date: TASK.date, id: TASK.id, word: TASK.word });
  });

  it('uses the message derived from the task by default', async () => {
    const { root } = await generated('default-message');

    await finalizeLesson(input(root));

    assert.equal(
      (await git(root, 'log', '-1', '--pretty=format:%s')).trim(),
      lessonCommitMessage(TASK),
    );
    assert.equal(lessonCommitMessage(TASK), 'lesson: add hablar (w0001) for 2026-07-18');
  });

  it('uses a supplied commit message instead', async () => {
    const { root } = await generated('given-message');

    await finalizeLesson(input(root, { commitMessage: 'a chosen message' }));

    assert.equal((await git(root, 'log', '-1', '--pretty=format:%s')).trim(), 'a chosen message');
  });

  it('does not modify the task it is given', async () => {
    const { root } = await generated('task-untouched');
    const before = JSON.stringify(TASK);

    await finalizeLesson(input(root));

    assert.equal(JSON.stringify(TASK), before);
  });
});

describe('finalizeLesson — refusing before anything is written', () => {
  it('stops when generation left a second change', async () => {
    const { root } = await generated('stray-change');
    await write(root, 'notes.txt', 'unrelated\n');

    await assert.rejects(() => finalizeLesson(input(root)), DurableWriteError);

    assert.rejects(() => readFile(join(root, HISTORY_PATH), 'utf8'));
  });

  it('stops when the repository was already dirty', async () => {
    const { root } = await generated('already-dirty');
    await write(root, 'README.md', 'meddled\n');

    await assert.rejects(() => finalizeLesson(input(root)), {
      name: 'DurableWriteError',
      message: /changed only the lesson file/,
    });
  });

  it('stops when the lesson was written to the wrong path', async () => {
    const { root } = await scenario('wrong-path');
    await write(root, 'lessons/2026/2026-07-18-w0002.md', document());

    await assert.rejects(() => finalizeLesson(input(root)), {
      name: 'DurableWriteError',
      message: /allows only/,
    });
  });

  it('stops when the generation step already staged the lesson', async () => {
    const { root } = await generated('pre-staged');
    await git(root, 'add', '--', TASK.targetPath);

    await assert.rejects(() => finalizeLesson(input(root)), DurableWriteError);
  });

  it('stops when the lesson metadata disagrees with the task', async () => {
    const { root } = await generated('wrong-metadata');
    await write(root, TASK.targetPath, document({ word: 'comer' }));

    await assert.rejects(() => finalizeLesson(input(root)), (error: unknown) => {
      assert.ok(error instanceof DurableWriteError);
      assert.ok(error.cause instanceof LessonAcceptanceError);
      assert.match(error.message, /accepting the generated lesson/);
      return true;
    });
  });

  it('stops when the document is not in canonical form', async () => {
    const { root } = await generated('non-canonical');
    await write(root, TASK.targetPath, document().replace(/\n/g, '\r\n'));

    await assert.rejects(() => finalizeLesson(input(root)), {
      name: 'DurableWriteError',
      message: /CRLF/,
    });
  });

  it('leaves history untouched and commits nothing when acceptance fails', async () => {
    const { root } = await generated('acceptance-failure');
    const existing = '{"date":"2026-07-17","id":"w0009","word":"casa"}\n';
    await write(root, HISTORY_PATH, existing);
    await git(root, 'add', '--', HISTORY_PATH);
    await git(root, 'commit', '--quiet', '--message', 'seed history');
    const before = (await git(root, 'rev-parse', 'HEAD')).trim();

    await write(root, TASK.targetPath, document({ id: 'w0002' }));

    await assert.rejects(() => finalizeLesson(input(root)), DurableWriteError);

    assert.equal(await readFile(join(root, HISTORY_PATH), 'utf8'), existing);
    assert.equal((await git(root, 'rev-parse', 'HEAD')).trim(), before);
  });

});

describe('finalizeLesson — the history path is not the caller’s to choose', () => {
  it('exposes the canonical path as a constant', () => {
    assert.equal(HISTORY_PATH, 'history.jsonl');
  });

  it('writes to the canonical path even when the input names another', async () => {
    const { root } = await generated('fixed-history');

    // The extra property is not part of the contract; TypeScript rejects it, and
    // this proves a caller crossing a process boundary cannot smuggle it in.
    const result = await finalizeLesson({
      ...input(root),
      historyPath: 'somewhere/else.jsonl',
    } as never);

    assert.equal(result.historyPath, HISTORY_PATH);
    assert.deepEqual((await committedFiles(root)).sort(), [HISTORY_PATH, TASK.targetPath]);
    await assert.rejects(() => readFile(join(root, 'somewhere/else.jsonl'), 'utf8'));
  });

  it('refuses a task whose target path is the history file itself', async () => {
    const { root } = await scenario('lesson-over-history');
    await write(root, HISTORY_PATH, 'placeholder\n');

    await assert.rejects(
      () =>
        finalizeLesson(
          input(root, { task: { ...TASK, targetPath: HISTORY_PATH } }),
        ),
      { name: 'DurableWriteError', message: /canonical history file/ },
    );

    // The lesson never reached acceptance, so the file is untouched.
    assert.equal(await readFile(join(root, HISTORY_PATH), 'utf8'), 'placeholder\n');
  });
});

describe('finalizeLesson — failing after acceptance', () => {
  it('does not commit when the history append fails', async () => {
    const { root } = await generated('history-failure');
    // A directory where the history file belongs: invisible to git while empty,
    // and unreadable as a file.
    await mkdir(join(root, HISTORY_PATH), { recursive: true });
    const before = (await git(root, 'rev-parse', 'HEAD')).trim();

    await assert.rejects(() => finalizeLesson(input(root)), (error: unknown) => {
      assert.ok(error instanceof DurableWriteError);
      assert.ok(error.cause instanceof HistoryStoreError);
      assert.match(error.message, /appending the history record/);
      return true;
    });

    assert.equal((await git(root, 'rev-parse', 'HEAD')).trim(), before);
  });

  it('does not push when the commit fails', async () => {
    const { root, bare } = await generated('commit-failure');
    const remoteBefore = (await git(bare, 'rev-parse', 'main')).trim();
    await writeFile(join(root, '.git', 'hooks', 'pre-commit'), '#!/bin/sh\nexit 1\n', {
      mode: 0o755,
    });

    await assert.rejects(() => finalizeLesson(input(root)), {
      name: 'DurableWriteError',
      message: /creating the commit/,
    });

    assert.equal((await git(bare, 'rev-parse', 'main')).trim(), remoteBefore);
    // The history record was written before the commit was attempted, and is
    // deliberately left in place rather than rolled back.
    assert.ok(await readFile(join(root, HISTORY_PATH), 'utf8'));
  });

  it('reports no completion when the push fails, and keeps the local commit', async () => {
    const { root, bare } = await generated('push-failure');
    await rm(bare, { recursive: true, force: true });

    await assert.rejects(() => finalizeLesson(input(root)), (error: unknown) => {
      assert.ok(error instanceof DurableWriteError);
      assert.match(error.message, /could not push/);
      assert.match(error.message, /preserved locally/);
      return true;
    });

    // The commit exists and carries both files; only the push is missing.
    assert.deepEqual((await committedFiles(root)).sort(), [HISTORY_PATH, TASK.targetPath]);
  });

  it('names the commit hash in the push failure', async () => {
    const { root, bare } = await generated('push-failure-hash');
    await rm(bare, { recursive: true, force: true });

    await assert.rejects(() => finalizeLesson(input(root)), (error: unknown) => {
      assert.ok(error instanceof DurableWriteError);
      const commit = (error.message.match(/commit ([0-9a-f]{40})/) ?? [])[1];
      assert.ok(commit !== undefined, 'the failure should name the commit');
      return true;
    });
  });

  it('fails loudly when the branch has no upstream', async () => {
    const { root } = await generated('no-upstream', { upstream: false });

    await assert.rejects(() => finalizeLesson(input(root)), {
      name: 'DurableWriteError',
      message: /no upstream/,
    });
  });

  it('does not guess a remote when there is no upstream', async () => {
    const { root, bare } = await generated('no-upstream-remote', { upstream: false });
    // A remote exists, but the branch does not track it. Pushing anyway would be
    // choosing a destination nobody configured.
    await git(root, 'remote', 'add', 'origin', bare);

    await assert.rejects(() => finalizeLesson(input(root)), { message: /no upstream/ });

    assert.rejects(() => git(bare, 'rev-parse', 'main'));
  });
});
