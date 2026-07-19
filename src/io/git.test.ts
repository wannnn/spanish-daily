import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import {
  GitInspectionError,
  GitWriteError,
  assertChangedPathsAre,
  assertFullyStaged,
  assertOnlyGeneratedLessonChange,
  assertSafeRepositoryPath,
  assertWorkingTreeClean,
  createCommit,
  inspectWorkingTree,
  parsePorcelainStatus,
  pushCurrentBranch,
  resolveHeadCommit,
  stagePaths,
  type GitChange,
} from './git.js';

const run = promisify(execFile);

const LESSON_PATH = 'lessons/2026/2026-07-18-w0001.md';

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-git-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

/** Run git in a repository, for arranging test state only. */
async function git(cwd: string, ...args: string[]): Promise<void> {
  await run('git', args, { cwd });
}

/**
 * A fresh repository with one committed file, so tracked-file states can be
 * arranged. The identity is set locally — the developer's global config is
 * never read or written.
 */
async function repository(name: string): Promise<string> {
  const root = join(workDir, name);
  await mkdir(root, { recursive: true });

  await git(root, 'init', '--quiet');
  await git(root, 'config', 'user.name', 'Test');
  await git(root, 'config', 'user.email', 'test@example.invalid');

  await writeFile(join(root, 'tracked.txt'), 'original\n', 'utf8');
  await git(root, 'add', 'tracked.txt');
  await git(root, 'commit', '--quiet', '-m', 'baseline');

  return root;
}

/** Write a file inside a repository, creating parent directories. */
async function write(root: string, relativePath: string, contents = 'x\n'): Promise<void> {
  const path = join(root, relativePath);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, contents, 'utf8');
}

function change(
  indexStatus: string,
  worktreeStatus: string,
  path: string,
  originalPath?: string,
): GitChange {
  return originalPath === undefined
    ? { indexStatus, worktreeStatus, path }
    : { indexStatus, worktreeStatus, path, originalPath };
}

describe('inspectWorkingTree — states', () => {
  it('reports nothing for a clean repository', async () => {
    const root = await repository('clean');

    assert.deepEqual(await inspectWorkingTree(root), []);
  });

  it('reports an untracked file', async () => {
    const root = await repository('untracked');
    await write(root, 'new.txt');

    assert.deepEqual(await inspectWorkingTree(root), [change('?', '?', 'new.txt')]);
  });

  it('reports an untracked file inside a new directory, not the directory', async () => {
    const root = await repository('untracked-nested');
    await write(root, LESSON_PATH);

    assert.deepEqual(await inspectWorkingTree(root), [change('?', '?', LESSON_PATH)]);
  });

  it('reports a modified tracked file', async () => {
    const root = await repository('modified');
    await write(root, 'tracked.txt', 'changed\n');

    assert.deepEqual(await inspectWorkingTree(root), [change(' ', 'M', 'tracked.txt')]);
  });

  it('reports a staged file', async () => {
    const root = await repository('staged');
    await write(root, 'added.txt');
    await git(root, 'add', 'added.txt');

    assert.deepEqual(await inspectWorkingTree(root), [change('A', ' ', 'added.txt')]);
  });

  it('reports a deleted file', async () => {
    const root = await repository('deleted');
    await rm(join(root, 'tracked.txt'));

    assert.deepEqual(await inspectWorkingTree(root), [change(' ', 'D', 'tracked.txt')]);
  });

  it('reports a rename with both of its paths', async () => {
    const root = await repository('renamed');
    await git(root, 'mv', 'tracked.txt', 'renamed.txt');

    assert.deepEqual(await inspectWorkingTree(root), [
      change('R', ' ', 'renamed.txt', 'tracked.txt'),
    ]);
  });

  it('handles a path containing spaces', async () => {
    const root = await repository('spaces');
    await write(root, 'a file with spaces.txt');

    assert.deepEqual(await inspectWorkingTree(root), [
      change('?', '?', 'a file with spaces.txt'),
    ]);
  });

  it('handles a path containing a newline', async () => {
    // The reason for NUL-delimited output: a newline in a filename would break
    // any line-based parser, and git would otherwise quote and escape the path.
    const root = await repository('newline');
    await write(root, 'two\nlines.txt');

    assert.deepEqual(await inspectWorkingTree(root), [change('?', '?', 'two\nlines.txt')]);
  });

  it('handles a path containing quotes and non-ASCII characters', async () => {
    const root = await repository('quoting');
    await write(root, 'niño "quoted".txt');

    assert.deepEqual(await inspectWorkingTree(root), [
      change('?', '?', 'niño "quoted".txt'),
    ]);
  });

  it('does not report ignored files', async () => {
    const root = await repository('ignored');
    await write(root, '.gitignore', 'build/\n');
    await git(root, 'add', '.gitignore');
    await git(root, 'commit', '--quiet', '-m', 'ignore build');
    await write(root, 'build/artifact.txt');

    assert.deepEqual(await inspectWorkingTree(root), []);
  });

  it('returns changes sorted by path, and the same result every time', async () => {
    const root = await repository('ordering');
    await write(root, 'c.txt');
    await write(root, 'a.txt');
    await write(root, 'b.txt');

    const first = await inspectWorkingTree(root);

    assert.deepEqual(
      first.map((entry) => entry.path),
      ['a.txt', 'b.txt', 'c.txt'],
    );
    assert.deepEqual(await inspectWorkingTree(root), first);
  });
});

describe('inspectWorkingTree — repository root', () => {
  it('rejects a path that does not exist', async () => {
    await assert.rejects(
      () => inspectWorkingTree(join(workDir, 'nowhere')),
      (error: unknown) => {
        assert.ok(error instanceof GitInspectionError);
        assert.equal((error.cause as { code?: string }).code, 'ENOENT');
        return true;
      },
    );
  });

  it('rejects a directory that is not a repository', async () => {
    const plain = join(workDir, 'not-a-repo');
    await mkdir(plain, { recursive: true });

    await assert.rejects(() => inspectWorkingTree(plain), GitInspectionError);
  });

  it('keeps the git failure as the cause', async () => {
    const plain = join(workDir, 'not-a-repo-cause');
    await mkdir(plain, { recursive: true });

    await assert.rejects(() => inspectWorkingTree(plain), (error: unknown) => {
      assert.ok(error instanceof GitInspectionError);
      assert.ok(error.cause instanceof Error);
      return true;
    });
  });

  it('rejects a subdirectory of a repository', async () => {
    const root = await repository('subdirectory');
    const inner = join(root, 'nested');
    await mkdir(inner, { recursive: true });

    await assert.rejects(() => inspectWorkingTree(inner), {
      name: 'GitInspectionError',
      message: /not the root of its worktree/,
    });
  });

  it('accepts a root reached through a symlinked path', async () => {
    // The ordinary macOS case: the temporary directory is itself behind a
    // symlink, so git reports a different string than the caller passed.
    const root = await repository('symlinked');

    assert.deepEqual(await inspectWorkingTree(root), []);
  });
});

describe('parsePorcelainStatus', () => {
  it('reads an empty status as no changes', () => {
    assert.deepEqual(parsePorcelainStatus(''), []);
  });

  it('reads several entries', () => {
    const output = '?? new.txt\0 M tracked.txt\0A  added.txt\0';

    assert.deepEqual(parsePorcelainStatus(output), [
      change('A', ' ', 'added.txt'),
      change('?', '?', 'new.txt'),
      change(' ', 'M', 'tracked.txt'),
    ]);
  });

  it('reads the original path of a rename from the following field', () => {
    const output = 'R  after.txt\0before.txt\0?? other.txt\0';

    assert.deepEqual(parsePorcelainStatus(output), [
      change('R', ' ', 'after.txt', 'before.txt'),
      change('?', '?', 'other.txt'),
    ]);
  });

  it('reads a copy the same way as a rename', () => {
    assert.deepEqual(parsePorcelainStatus('C  copy.txt\0source.txt\0'), [
      change('C', ' ', 'copy.txt', 'source.txt'),
    ]);
  });

  it('keeps a path that contains a space intact', () => {
    assert.deepEqual(parsePorcelainStatus('?? two words.txt\0'), [
      change('?', '?', 'two words.txt'),
    ]);
  });

  it('rejects an entry that is too short to hold a path', () => {
    assert.throws(() => parsePorcelainStatus('??\0'), GitInspectionError);
  });

  it('rejects an entry without the separating space', () => {
    assert.throws(() => parsePorcelainStatus('??new.txt\0'), {
      name: 'GitInspectionError',
      message: /is not an "XY <path>" entry/,
    });
  });

  it('rejects an unknown status character', () => {
    assert.throws(() => parsePorcelainStatus('Z? new.txt\0'), {
      name: 'GitInspectionError',
      message: /not a known status pair/,
    });
  });

  it('rejects a rename whose original path is missing', () => {
    assert.throws(() => parsePorcelainStatus('R  after.txt\0'), {
      name: 'GitInspectionError',
      message: /missing its original path/,
    });
  });
});

describe('assertWorkingTreeClean', () => {
  it('accepts no changes', () => {
    assert.doesNotThrow(() => assertWorkingTreeClean([]));
  });

  it('rejects an untracked file', () => {
    assert.throws(() => assertWorkingTreeClean([change('?', '?', 'stray.txt')]), {
      name: 'GitInspectionError',
      message: /must be clean/,
    });
  });

  it('rejects a staged change', () => {
    assert.throws(
      () => assertWorkingTreeClean([change('A', ' ', 'added.txt')]),
      GitInspectionError,
    );
  });

  it('rejects a tracked modification', () => {
    assert.throws(
      () => assertWorkingTreeClean([change(' ', 'M', 'tracked.txt')]),
      GitInspectionError,
    );
  });

  it('rejects a deletion', () => {
    assert.throws(
      () => assertWorkingTreeClean([change(' ', 'D', 'gone.txt')]),
      GitInspectionError,
    );
  });

  it('names the offending paths', () => {
    assert.throws(() => assertWorkingTreeClean([change('?', '?', 'stray.txt')]), {
      message: /stray\.txt/,
    });
  });

  it('summarizes rather than listing an unbounded number of changes', () => {
    const many = Array.from({ length: 25 }, (_, index) =>
      change('?', '?', `file-${String(index).padStart(2, '0')}.txt`),
    );

    assert.throws(() => assertWorkingTreeClean(many), { message: /and 15 more/ });
  });
});

describe('assertOnlyGeneratedLessonChange', () => {
  const created = [change('?', '?', LESSON_PATH)];

  it('accepts exactly one new untracked file at the expected path', () => {
    assert.doesNotThrow(() => assertOnlyGeneratedLessonChange(created, LESSON_PATH));
  });

  it('does not modify the changes it is given', () => {
    const changes = [change('?', '?', LESSON_PATH)];
    const before = JSON.stringify(changes);

    assertOnlyGeneratedLessonChange(changes, LESSON_PATH);

    assert.equal(JSON.stringify(changes), before);
  });

  it('rejects no changes at all', () => {
    assert.throws(() => assertOnlyGeneratedLessonChange([], LESSON_PATH), {
      name: 'GitInspectionError',
      message: /exactly one new file/,
    });
  });

  it('rejects a file written to the wrong path', () => {
    assert.throws(
      () =>
        assertOnlyGeneratedLessonChange(
          [change('?', '?', 'lessons/2026/2026-07-18-w0002.md')],
          LESSON_PATH,
        ),
      { name: 'GitInspectionError', message: /allows only/ },
    );
  });

  it('rejects a second untracked file', () => {
    assert.throws(
      () =>
        assertOnlyGeneratedLessonChange(
          [...created, change('?', '?', 'notes.txt')],
          LESSON_PATH,
        ),
      { name: 'GitInspectionError', message: /exactly one new file/ },
    );
  });

  it('rejects a target that has already been staged', () => {
    assert.throws(
      () => assertOnlyGeneratedLessonChange([change('A', ' ', LESSON_PATH)], LESSON_PATH),
      { name: 'GitInspectionError', message: /never stages/ },
    );
  });

  it('rejects a target that is a modified tracked file', () => {
    assert.throws(
      () => assertOnlyGeneratedLessonChange([change(' ', 'M', LESSON_PATH)], LESSON_PATH),
      GitInspectionError,
    );
  });

  it('rejects a deletion', () => {
    assert.throws(
      () => assertOnlyGeneratedLessonChange([change(' ', 'D', LESSON_PATH)], LESSON_PATH),
      GitInspectionError,
    );
  });

  it('rejects a rename onto the expected path', () => {
    assert.throws(
      () =>
        assertOnlyGeneratedLessonChange(
          [change('R', ' ', LESSON_PATH, 'lessons/2026/old.md')],
          LESSON_PATH,
        ),
      GitInspectionError,
    );
  });

  it('rejects an untracked entry that still carries an original path', () => {
    // Not a shape the parser produces — a rename never reports as `??`. It is
    // checked because this function is public and judges whatever it is handed.
    assert.throws(
      () =>
        assertOnlyGeneratedLessonChange(
          [change('?', '?', LESSON_PATH, 'lessons/2026/old.md')],
          LESSON_PATH,
        ),
      { name: 'GitInspectionError', message: /coming from/ },
    );
  });

  it('rejects an unmerged path', () => {
    assert.throws(
      () => assertOnlyGeneratedLessonChange([change('U', 'U', LESSON_PATH)], LESSON_PATH),
      GitInspectionError,
    );
  });

  it('rejects an empty expected path', () => {
    assert.throws(() => assertOnlyGeneratedLessonChange(created, ''), {
      name: 'GitInspectionError',
      message: /must not be empty/,
    });
  });

  it('rejects an absolute expected path', () => {
    assert.throws(() => assertOnlyGeneratedLessonChange(created, `/${LESSON_PATH}`), {
      name: 'GitInspectionError',
      message: /is absolute/,
    });
  });

  it('rejects an expected path that traverses upward', () => {
    assert.throws(
      () => assertOnlyGeneratedLessonChange(created, 'lessons/../../escape.md'),
      { name: 'GitInspectionError', message: /traverses upward/ },
    );
  });

  it('rejects an expected path with a backslash', () => {
    assert.throws(
      () => assertOnlyGeneratedLessonChange(created, 'lessons\\2026\\lesson.md'),
      { name: 'GitInspectionError', message: /backslash/ },
    );
  });

  it('checks the expected path before the changes', () => {
    // The path is invalid and the changes are also wrong; the path is what the
    // caller must fix first, so it is what the message must name.
    assert.throws(() => assertOnlyGeneratedLessonChange([], '/absolute.md'), {
      message: /is absolute/,
    });
  });
});

describe('inspectWorkingTree with the assertions', () => {
  it('a clean repository passes the clean assertion', async () => {
    const root = await repository('assert-clean');
    const changes = await inspectWorkingTree(root);

    assert.doesNotThrow(() => assertWorkingTreeClean(changes));
  });

  it('a written lesson passes the generation assertion', async () => {
    const root = await repository('assert-generated');
    await write(root, LESSON_PATH, '---\n');
    const changes = await inspectWorkingTree(root);

    assert.doesNotThrow(() => assertOnlyGeneratedLessonChange(changes, LESSON_PATH));
  });

  it('a written lesson plus a stray edit fails the generation assertion', async () => {
    const root = await repository('assert-generated-stray');
    await write(root, LESSON_PATH, '---\n');
    await write(root, 'tracked.txt', 'meddled\n');

    const changes = await inspectWorkingTree(root);

    assert.throws(() => assertOnlyGeneratedLessonChange(changes, LESSON_PATH), GitInspectionError);
  });
});

describe('assertSafeRepositoryPath', () => {
  it('accepts an ordinary repository-relative path', () => {
    assert.doesNotThrow(() => assertSafeRepositoryPath(LESSON_PATH));
  });

  it('names the path in the message using the supplied label', () => {
    assert.throws(() => assertSafeRepositoryPath('', 'The history path'), {
      message: /The history path must not be empty/,
    });
  });

  it('rejects absolute, upward, and backslash paths', () => {
    assert.throws(() => assertSafeRepositoryPath('/etc/passwd'), /is absolute/);
    assert.throws(() => assertSafeRepositoryPath('a/../../b'), /traverses upward/);
    assert.throws(() => assertSafeRepositoryPath('a\\b'), /backslash/);
  });
});

describe('assertChangedPathsAre', () => {
  const expected = [LESSON_PATH, 'history.jsonl'];

  it('accepts exactly the expected paths, in any order', () => {
    const changes = [change(' ', 'M', 'history.jsonl'), change('?', '?', LESSON_PATH)];

    assert.doesNotThrow(() => assertChangedPathsAre(changes, expected));
  });

  it('rejects an unexpected extra change', () => {
    const changes = [
      change('?', '?', LESSON_PATH),
      change('?', '?', 'history.jsonl'),
      change('?', '?', 'stray.txt'),
    ];

    assert.throws(() => assertChangedPathsAre(changes, expected), {
      name: 'GitInspectionError',
      message: /unexpected change: stray\.txt/,
    });
  });

  it('rejects a missing expected change', () => {
    assert.throws(() => assertChangedPathsAre([change('?', '?', LESSON_PATH)], expected), {
      name: 'GitInspectionError',
      message: /does not show the expected history\.jsonl/,
    });
  });

  it('rejects a rename', () => {
    const changes = [
      change('R', ' ', LESSON_PATH, 'old.md'),
      change('?', '?', 'history.jsonl'),
    ];

    assert.throws(() => assertChangedPathsAre(changes, expected), {
      message: /renamed or copied/,
    });
  });

  it('rejects an unsafe expected path', () => {
    assert.throws(() => assertChangedPathsAre([], ['../escape.md']), {
      message: /traverses upward/,
    });
  });

  it('does not modify the changes it is given', () => {
    const changes = [change('?', '?', LESSON_PATH), change('?', '?', 'history.jsonl')];
    const before = JSON.stringify(changes);

    assertChangedPathsAre(changes, expected);

    assert.equal(JSON.stringify(changes), before);
  });
});

describe('assertFullyStaged', () => {
  const expected = [LESSON_PATH, 'history.jsonl'];

  it('accepts paths that are staged with nothing left over', () => {
    const changes = [change('A', ' ', LESSON_PATH), change('M', ' ', 'history.jsonl')];

    assert.doesNotThrow(() => assertFullyStaged(changes, expected));
  });

  it('rejects a path that is still untracked', () => {
    const changes = [change('?', '?', LESSON_PATH), change('M', ' ', 'history.jsonl')];

    assert.throws(() => assertFullyStaged(changes, expected), {
      name: 'GitInspectionError',
      message: /is not staged/,
    });
  });

  it('rejects a path that is staged but modified again afterwards', () => {
    const changes = [change('A', 'M', LESSON_PATH), change('M', ' ', 'history.jsonl')];

    assert.throws(() => assertFullyStaged(changes, expected), {
      message: /unstaged changes left over/,
    });
  });

  it('still rejects anything beyond the expected paths', () => {
    const changes = [
      change('A', ' ', LESSON_PATH),
      change('M', ' ', 'history.jsonl'),
      change('A', ' ', 'extra.txt'),
    ];

    assert.throws(() => assertFullyStaged(changes, expected), /unexpected change/);
  });
});

describe('stagePaths', () => {
  it('stages exactly the paths it is given', async () => {
    const root = await repository('stage-exact');
    await write(root, 'wanted.txt');
    await write(root, 'unwanted.txt');

    await stagePaths(root, ['wanted.txt']);

    assert.deepEqual(await inspectWorkingTree(root), [
      change('A', ' ', 'wanted.txt'),
      change('?', '?', 'unwanted.txt'),
    ].sort((left, right) => (left.path < right.path ? -1 : 1)));
  });

  it('stages a path containing spaces', async () => {
    const root = await repository('stage-spaces');
    await write(root, 'a file.txt');

    await stagePaths(root, ['a file.txt']);

    assert.deepEqual(await inspectWorkingTree(root), [change('A', ' ', 'a file.txt')]);
  });

  it('rejects an empty path list', async () => {
    const root = await repository('stage-empty');

    await assert.rejects(() => stagePaths(root, []), GitInspectionError);
  });

  it('rejects an unsafe path', async () => {
    const root = await repository('stage-unsafe');

    await assert.rejects(() => stagePaths(root, ['../outside.txt']), {
      message: /traverses upward/,
    });
  });

  it('fails loudly when the path does not exist', async () => {
    const root = await repository('stage-missing');

    await assert.rejects(() => stagePaths(root, ['nowhere.txt']), (error: unknown) => {
      assert.ok(error instanceof GitWriteError);
      assert.ok(error.cause instanceof Error);
      return true;
    });
  });
});

describe('createCommit and resolveHeadCommit', () => {
  it('commits the index and returns the new hash', async () => {
    const root = await repository('commit-basic');
    await write(root, 'added.txt');
    await stagePaths(root, ['added.txt']);

    const commit = await createCommit(root, 'add a file');

    assert.match(commit, /^[0-9a-f]{40}$/);
    assert.equal(await resolveHeadCommit(root), commit);
    assert.deepEqual(await inspectWorkingTree(root), []);
  });

  it('commits only what is staged', async () => {
    const root = await repository('commit-staged-only');
    await write(root, 'staged.txt');
    await write(root, 'loose.txt');
    await stagePaths(root, ['staged.txt']);

    await createCommit(root, 'only the staged one');

    assert.deepEqual(await inspectWorkingTree(root), [change('?', '?', 'loose.txt')]);
  });

  it('rejects an empty commit message', async () => {
    const root = await repository('commit-no-message');

    await assert.rejects(() => createCommit(root, '   '), GitWriteError);
  });

  it('keeps git failure as the cause when there is nothing to commit', async () => {
    const root = await repository('commit-nothing');

    await assert.rejects(() => createCommit(root, 'empty'), (error: unknown) => {
      assert.ok(error instanceof GitWriteError);
      assert.ok(error.cause instanceof Error);
      return true;
    });
  });
});

describe('pushCurrentBranch', () => {
  it('fails loudly when the branch has no upstream', async () => {
    const root = await repository('push-no-upstream');

    await assert.rejects(() => pushCurrentBranch(root), {
      name: 'GitWriteError',
      message: /no upstream/,
    });
  });
});
