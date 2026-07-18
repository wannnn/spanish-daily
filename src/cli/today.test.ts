import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import type { CliOutput } from './today.js';
import { runToday } from './today.js';

let workDir: string;

/** 2026-07-18 12:00 in Taipei. */
const NOON_IN_TAIPEI = new Date('2026-07-18T04:00:00Z');

const VOCABULARY = [
  { id: 'w0001', word: 'ser', order: 1, pos: 'verb' },
  { id: 'w0002', word: 'casa', order: 2, pos: 'noun' },
  { id: 'w0003', word: 'alto', order: 3, pos: 'adjective' },
];

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-cli-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

let fixtureCount = 0;

/** Write a file into the work dir under a unique name and return its path. */
async function fixture(name: string, contents: string): Promise<string> {
  fixtureCount += 1;
  const path = join(workDir, `${fixtureCount}-${name}`);
  await writeFile(path, contents, 'utf8');
  return path;
}

async function vocabularyFile(
  entries: readonly unknown[] = VOCABULARY,
): Promise<string> {
  return fixture('vocabulary.json', JSON.stringify(entries));
}

async function historyFile(...records: readonly unknown[]): Promise<string> {
  return fixture(
    'history.jsonl',
    records.map((record) => JSON.stringify(record)).join('\n'),
  );
}

/** A path inside the work dir that nothing has been written to. */
function missingPath(name: string): string {
  return join(workDir, `absent-${name}`);
}

type Run = {
  readonly code: number;
  readonly stdout: string[];
  readonly stderr: string[];
};

/** Run the command with collected output instead of real streams. */
async function run(
  args: readonly string[],
  options: { now?: Date; defaultHistoryPath?: string } = {},
): Promise<Run> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const out: CliOutput = {
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
  };

  const code = await runToday(
    args,
    options.now ?? NOON_IN_TAIPEI,
    out,
    options.defaultHistoryPath ?? missingPath('default-history.jsonl'),
  );

  return { code, stdout, stderr };
}

/** Assert success and return the single parsed stdout line. */
function successPayload(result: Run): Record<string, unknown> {
  assert.equal(result.code, 0, `expected success, stderr: ${result.stderr.join('\n')}`);
  assert.equal(result.stderr.length, 0, 'stderr should be empty on success');
  assert.equal(result.stdout.length, 1, 'stdout should be exactly one line');

  return JSON.parse(result.stdout[0]!) as Record<string, unknown>;
}

/** Assert failure, empty stdout, and a diagnostic mentioning each fragment. */
function assertFailed(result: Run, ...fragments: string[]): void {
  assert.notEqual(result.code, 0, 'expected a non-zero exit code');
  assert.deepEqual(result.stdout, [], 'stdout must stay empty on failure');
  assert.ok(result.stderr.length > 0, 'expected a diagnostic on stderr');

  const combined = result.stderr.join('\n');
  for (const fragment of fragments) {
    assert.ok(
      combined.includes(fragment),
      `expected stderr to mention ${JSON.stringify(fragment)}, got: ${combined}`,
    );
  }
  assert.ok(!combined.includes('    at '), 'stderr must not contain a stack trace');
}

describe('today — results', () => {
  it('prints the selected word when there is no history', async () => {
    const result = await run([await vocabularyFile()]);

    assert.deepEqual(successPayload(result), {
      kind: 'selected',
      date: '2026-07-18',
      id: 'w0001',
      word: 'ser',
      order: 1,
      pos: 'verb',
    });
  });

  it('skips learned words', async () => {
    const history = await historyFile({
      date: '2026-07-17',
      id: 'w0001',
      word: 'ser',
    });

    const payload = successPayload(await run([await vocabularyFile(), history]));

    assert.equal(payload['id'], 'w0002');
    assert.equal(payload['word'], 'casa');
  });

  it('prints a replay when today already has a record', async () => {
    const history = await historyFile({
      date: '2026-07-18',
      id: 'w0001',
      word: 'ser',
    });

    assert.deepEqual(successPayload(await run([await vocabularyFile(), history])), {
      kind: 'replay',
      date: '2026-07-18',
      id: 'w0001',
      word: 'ser',
    });
  });

  it('replays a word that has retired from the vocabulary', async () => {
    const history = await historyFile({
      date: '2026-07-18',
      id: 'w9999',
      word: 'obsoleto',
    });

    const payload = successPayload(await run([await vocabularyFile(), history]));

    assert.equal(payload['kind'], 'replay');
    assert.equal(payload['id'], 'w9999');
  });

  it('prints exhausted when every word has been learned, and still succeeds', async () => {
    const history = await historyFile(
      { date: '2026-07-15', id: 'w0001', word: 'ser' },
      { date: '2026-07-16', id: 'w0002', word: 'casa' },
      { date: '2026-07-17', id: 'w0003', word: 'alto' },
    );

    const result = await run([await vocabularyFile(), history]);

    assert.equal(result.code, 0, 'exhausted is a success, not a failure');
    assert.deepEqual(successPayload(result), {
      kind: 'exhausted',
      date: '2026-07-18',
    });
  });

  it('is unaffected by the order of the vocabulary file', async () => {
    const shuffled = [VOCABULARY[2], VOCABULARY[0], VOCABULARY[1]];
    const reversed = [...VOCABULARY].reverse();

    const fromShuffled = successPayload(await run([await vocabularyFile(shuffled)]));
    const fromReversed = successPayload(await run([await vocabularyFile(reversed)]));
    const fromSorted = successPayload(await run([await vocabularyFile()]));

    assert.deepEqual(fromShuffled, fromSorted);
    assert.deepEqual(fromReversed, fromSorted);
    assert.equal(fromSorted['id'], 'w0001');
  });
});

describe('today — date handling', () => {
  it('uses the Taipei date of the given instant', async () => {
    const payload = successPayload(
      await run([await vocabularyFile()], { now: NOON_IN_TAIPEI }),
    );

    assert.equal(payload['date'], '2026-07-18');
  });

  it('has already rolled over at 16:00 UTC', async () => {
    // The same instant is still 2026-07-18 in UTC but 2026-07-19 in Taipei.
    const payload = successPayload(
      await run([await vocabularyFile()], { now: new Date('2026-07-18T16:00:00Z') }),
    );

    assert.equal(payload['date'], '2026-07-19');
  });

  it('replays against the Taipei date, not the UTC date', async () => {
    const history = await historyFile({
      date: '2026-07-19',
      id: 'w0001',
      word: 'ser',
    });

    const payload = successPayload(
      await run([await vocabularyFile(), history], {
        now: new Date('2026-07-18T16:00:00Z'),
      }),
    );

    assert.equal(payload['kind'], 'replay');
    assert.equal(payload['date'], '2026-07-19');
  });
});

describe('today — missing history', () => {
  it('treats a missing default history as a first run', async () => {
    const result = await run([await vocabularyFile()], {
      defaultHistoryPath: missingPath('never-written.jsonl'),
    });

    assert.equal(successPayload(result)['kind'], 'selected');
  });

  it('fails when a history path the user gave does not exist', async () => {
    // A typo must not be silently read as "no history yet".
    const typo = missingPath('histroy.jsonl');
    const result = await run([await vocabularyFile(), typo]);

    assertFailed(result, 'Cannot read history file', typo);
  });

  it('fails on a read error that is not a missing file, even for the default', async () => {
    // A directory in place of the file: readable path, unreadable as a file.
    const asDirectory = join(workDir, 'history-as-directory');
    await mkdir(asDirectory, { recursive: true });

    const result = await run([await vocabularyFile()], {
      defaultHistoryPath: asDirectory,
    });

    assertFailed(result, 'Cannot read history file');
  });

  it('fails when the vocabulary file is missing', async () => {
    const result = await run([missingPath('vocabulary.json')]);

    assertFailed(result, 'Cannot read vocabulary file');
  });
});

describe('today — invalid input', () => {
  it('fails on vocabulary that is not valid JSON', async () => {
    const path = await fixture('broken.json', '[{ "id": "w0001", }]');

    assertFailed(await run([path]), 'not valid JSON');
  });

  it('fails on vocabulary that violates the contract', async () => {
    const path = await vocabularyFile([
      { id: 'w0001', word: 'ser', order: 1, pos: 'not-a-pos' },
    ]);

    assertFailed(await run([path]), '"pos" must be one of');
  });

  it('fails on history that is not valid JSONL', async () => {
    const history = await fixture('broken.jsonl', 'not json at all');

    assertFailed(await run([await vocabularyFile(), history]), 'history line 1');
  });

  it('fails on history that violates the contract', async () => {
    const history = await historyFile({
      date: '2026-02-30',
      id: 'w0001',
      word: 'ser',
    });

    assertFailed(
      await run([await vocabularyFile(), history]),
      'real calendar date',
    );
  });

  it('fails on a duplicate history date', async () => {
    const history = await historyFile(
      { date: '2026-07-17', id: 'w0001', word: 'ser' },
      { date: '2026-07-17', id: 'w0002', word: 'casa' },
    );

    assertFailed(await run([await vocabularyFile(), history]), 'duplicate date');
  });
});

describe('today — arguments', () => {
  it('fails with usage when no vocabulary path is given', async () => {
    assertFailed(await run([]), 'vocabulary path is required', 'usage:');
  });

  it('fails with usage when given too many arguments', async () => {
    const result = await run([
      await vocabularyFile(),
      await historyFile(),
      'extra',
    ]);

    assertFailed(result, 'at most 2 arguments', 'usage:');
  });
});

describe('today — output discipline', () => {
  it('writes exactly one line of valid JSON to stdout on success', async () => {
    const result = await run([await vocabularyFile()]);

    assert.equal(result.stdout.length, 1);
    assert.doesNotThrow(() => JSON.parse(result.stdout[0]!));
    assert.ok(!result.stdout[0]!.includes('\n'));
  });

  it('writes nothing to stdout on failure', async () => {
    const result = await run([]);

    assert.deepEqual(result.stdout, []);
  });

  it('mentions no publishing platform in its output', async () => {
    const result = await run([await vocabularyFile()]);
    const combined = [...result.stdout, ...result.stderr].join('\n').toLowerCase();

    for (const platform of ['notion', 'telegram', 'claude', 'anthropic']) {
      assert.ok(!combined.includes(platform), `output should not mention ${platform}`);
    }
  });
});
