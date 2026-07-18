import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { HistoryValidationError } from '../domain/history.js';
import { HistoryLoadError, loadHistory } from './historyStore.js';

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-history-'));
});

after(async () => {
  await rm(workDir, { recursive: true, force: true });
});

/** Write `contents` verbatim to a temp file and return its path. */
async function fixture(name: string, contents: string): Promise<string> {
  const path = join(workDir, name);
  await writeFile(path, contents, 'utf8');
  return path;
}

describe('loadHistory', () => {
  it('reads, parses, and returns validated records', async () => {
    const path = await fixture(
      'valid.jsonl',
      '{"date":"2026-07-18","id":"w0001","word":"hablar"}\n' +
        '{"date":"2026-07-19","id":"w0002","word":"casa"}\n',
    );

    assert.deepEqual(await loadHistory(path), [
      { date: '2026-07-18', id: 'w0001', word: 'hablar' },
      { date: '2026-07-19', id: 'w0002', word: 'casa' },
    ]);
  });

  it('reads an empty file as an empty history', async () => {
    const path = await fixture('empty.jsonl', '');

    assert.deepEqual(await loadHistory(path), []);
  });

  it('preserves accented characters through the round trip', async () => {
    const path = await fixture(
      'accents.jsonl',
      `${JSON.stringify({ date: '2026-07-18', id: 'w0001', word: 'niño' })}\n`,
    );

    const [record] = await loadHistory(path);
    assert.equal(record?.word, 'niño');
  });

  it('reports a missing file as a load error, with the cause preserved', async () => {
    const path = join(workDir, 'does-not-exist.jsonl');

    await assert.rejects(
      () => loadHistory(path),
      (error: unknown) => {
        assert.ok(error instanceof HistoryLoadError);
        assert.match(error.message, /Cannot read history file/);
        assert.ok(error.message.includes(path), 'message should name the file');
        assert.ok(error.cause instanceof Error, 'original cause should be kept');
        return true;
      },
    );
  });

  it('surfaces contract violations from the domain layer unchanged', async () => {
    const path = await fixture(
      'bad-date.jsonl',
      '{"date":"2026-02-30","id":"w0001","word":"hablar"}\n',
    );

    await assert.rejects(
      () => loadHistory(path),
      (error: unknown) => {
        // Not a load error: the file read fine, the data is wrong.
        assert.ok(error instanceof HistoryValidationError);
        assert.match(error.message, /history line 1/);
        assert.match(error.message, /real calendar date/);
        return true;
      },
    );
  });

  it('returns nothing when a later line is invalid — no partial load', async () => {
    const path = await fixture(
      'partial.jsonl',
      '{"date":"2026-07-18","id":"w0001","word":"hablar"}\n' +
        '{"date":"2026-07-19","id":"nope","word":"casa"}\n',
    );

    await assert.rejects(() => loadHistory(path), HistoryValidationError);
  });
});
