import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { HistoryValidationError } from '../domain/history.js';
import type { HistoryRecord } from '../domain/types.js';
import {
  HistoryLoadError,
  HistoryStoreError,
  appendHistoryRecord,
  loadHistory,
} from './historyStore.js';

const RECORD: HistoryRecord = { date: '2026-07-18', id: 'w0001', word: 'hablar' };
const ROW = '{"date":"2026-07-18","id":"w0001","word":"hablar"}';

const SECOND: HistoryRecord = { date: '2026-07-19', id: 'w0002', word: 'casa' };
const SECOND_ROW = '{"date":"2026-07-19","id":"w0002","word":"casa"}';

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

describe('appendHistoryRecord — creating and extending', () => {
  it('creates the file with the first record', async () => {
    const path = join(workDir, 'created.jsonl');

    await appendHistoryRecord(path, RECORD);

    assert.equal(await readFile(path, 'utf8'), `${ROW}\n`);
  });

  it('writes compact JSON in the contract field order', async () => {
    const path = join(workDir, 'compact.jsonl');

    // Deliberately built in a different property order than the contract.
    await appendHistoryRecord(path, { word: 'hablar', id: 'w0001', date: '2026-07-18' });

    assert.equal(await readFile(path, 'utf8'), '{"date":"2026-07-18","id":"w0001","word":"hablar"}\n');
  });

  it('appends after an existing LF history', async () => {
    const path = await fixture('lf.jsonl', `${ROW}\n`);

    await appendHistoryRecord(path, SECOND);

    assert.equal(await readFile(path, 'utf8'), `${ROW}\n${SECOND_ROW}\n`);
  });

  it('adds the missing line boundary when the file has no final newline', async () => {
    const path = await fixture('no-newline.jsonl', ROW);

    await appendHistoryRecord(path, SECOND);

    assert.equal(await readFile(path, 'utf8'), `${ROW}\n${SECOND_ROW}\n`);
  });

  it('leaves existing CRLF bytes exactly as they were', async () => {
    const path = await fixture('crlf.jsonl', `${ROW}\r\n`);

    await appendHistoryRecord(path, SECOND);

    // The existing row keeps its CRLF; only the new row is written canonically.
    assert.equal(await readFile(path, 'utf8'), `${ROW}\r\n${SECOND_ROW}\n`);
  });

  it('leaves existing blank lines in place', async () => {
    const path = await fixture('blank.jsonl', `${ROW}\n\n\n`);

    await appendHistoryRecord(path, SECOND);

    assert.equal(await readFile(path, 'utf8'), `${ROW}\n\n\n${SECOND_ROW}\n`);
  });

  it('treats a completely empty file as a first write', async () => {
    const path = await fixture('empty.jsonl', '');

    await appendHistoryRecord(path, RECORD);

    assert.equal(await readFile(path, 'utf8'), `${ROW}\n`);
  });

  it('does not reorder or rewrite existing records', async () => {
    const existing =
      '{"date":"2026-07-19","id":"w0009","word":"casa"}\n' +
      '{"date":"2026-07-18","id":"w0002","word":"comer"}\n';
    const path = await fixture('unordered.jsonl', existing);

    await appendHistoryRecord(path, { date: '2026-07-20', id: 'w0003', word: 'vivir' });

    assert.equal(
      await readFile(path, 'utf8'),
      `${existing}{"date":"2026-07-20","id":"w0003","word":"vivir"}\n`,
    );
  });

  it('round-trips through loadHistory', async () => {
    const path = join(workDir, 'roundtrip.jsonl');

    await appendHistoryRecord(path, RECORD);
    await appendHistoryRecord(path, SECOND);

    assert.deepEqual(await loadHistory(path), [RECORD, SECOND]);
  });

  it('does not mutate the record it is given', async () => {
    const path = join(workDir, 'no-mutate.jsonl');
    const record = { date: '2026-07-18', id: 'w0001', word: 'hablar' };

    await appendHistoryRecord(path, record);

    assert.deepEqual(record, { date: '2026-07-18', id: 'w0001', word: 'hablar' });
  });

  it('leaves no temporary file behind', async () => {
    const dir = await mkdtemp(join(workDir, 'temp-check-'));
    const path = join(dir, 'history.jsonl');

    await appendHistoryRecord(path, RECORD);

    assert.deepEqual(await readdir(dir), ['history.jsonl']);
  });
});

describe('appendHistoryRecord — refusing', () => {
  it('rejects an invalid date on the new record', async () => {
    const path = join(workDir, 'reject-date.jsonl');

    await assert.rejects(
      () => appendHistoryRecord(path, { date: '2026-02-30', id: 'w0001', word: 'hablar' }),
      HistoryStoreError,
    );
  });

  it('rejects an invalid id on the new record', async () => {
    const path = join(workDir, 'reject-id.jsonl');

    await assert.rejects(
      () => appendHistoryRecord(path, { date: '2026-07-18', id: 'nope', word: 'hablar' }),
      HistoryStoreError,
    );
  });

  it('rejects an invalid word on the new record', async () => {
    const path = join(workDir, 'reject-word.jsonl');

    await assert.rejects(
      () => appendHistoryRecord(path, { date: '2026-07-18', id: 'w0001', word: 'Hablar' }),
      HistoryStoreError,
    );
  });

  it('keeps the validation failure as the cause', async () => {
    const path = join(workDir, 'reject-cause.jsonl');

    await assert.rejects(
      () => appendHistoryRecord(path, { date: '2026-07-18', id: 'w0001', word: ' hablar' }),
      (error: unknown) => {
        assert.ok(error instanceof HistoryStoreError);
        assert.ok(error.cause instanceof HistoryValidationError);
        return true;
      },
    );
  });

  it('does not create a file when the record is invalid', async () => {
    const path = join(workDir, 'never-created.jsonl');

    await assert.rejects(
      () => appendHistoryRecord(path, { date: 'nope', id: 'w0001', word: 'hablar' }),
      HistoryStoreError,
    );
    await assert.rejects(() => readFile(path, 'utf8'));
  });

  it('rejects a duplicate date', async () => {
    const path = await fixture('dup-date.jsonl', `${ROW}\n`);

    await assert.rejects(
      () => appendHistoryRecord(path, { date: '2026-07-18', id: 'w0002', word: 'comer' }),
      { name: 'HistoryStoreError', message: /one record per day/ },
    );
  });

  it('rejects a duplicate id', async () => {
    const path = await fixture('dup-id.jsonl', `${ROW}\n`);

    await assert.rejects(
      () => appendHistoryRecord(path, { date: '2026-07-19', id: 'w0001', word: 'comer' }),
      { name: 'HistoryStoreError', message: /never taught twice/ },
    );
  });

  it('rejects an exact duplicate rather than treating it as already done', async () => {
    const path = await fixture('dup-exact.jsonl', `${ROW}\n`);

    await assert.rejects(() => appendHistoryRecord(path, RECORD), HistoryStoreError);
  });

  it('leaves the file untouched after a duplicate is refused', async () => {
    const path = await fixture('dup-untouched.jsonl', `${ROW}\n`);

    await assert.rejects(() => appendHistoryRecord(path, RECORD), HistoryStoreError);

    assert.equal(await readFile(path, 'utf8'), `${ROW}\n`);
  });

  it('refuses to append to a file that is not valid JSONL', async () => {
    const path = await fixture('corrupt.jsonl', 'not json at all\n');

    // Existing corruption surfaces as itself, exactly as it does when reading.
    await assert.rejects(() => appendHistoryRecord(path, RECORD), HistoryValidationError);
    assert.equal(await readFile(path, 'utf8'), 'not json at all\n');
  });

  it('refuses to append to a file that violates the history contract', async () => {
    const path = await fixture(
      'contract.jsonl',
      '{"date":"2026-07-17","id":"w0005","word":"hablar","extra":1}\n',
    );

    await assert.rejects(() => appendHistoryRecord(path, RECORD), HistoryValidationError);
  });

  it('writes nothing when the existing history is corrupt', async () => {
    const original = '{"date":"2026-13-01","id":"w0001","word":"hablar"}\n';
    const path = await fixture('corrupt-untouched.jsonl', original);

    await assert.rejects(() => appendHistoryRecord(path, SECOND), HistoryValidationError);

    assert.equal(await readFile(path, 'utf8'), original);
  });

  it('fails loudly on a read failure that is not a missing file', async () => {
    // A directory where a file is expected: readable path, unreadable as a file.
    const path = join(workDir, 'a-directory.jsonl');
    await mkdir(path, { recursive: true });

    await assert.rejects(() => appendHistoryRecord(path, RECORD), (error: unknown) => {
      assert.ok(error instanceof HistoryStoreError);
      assert.match(error.message, /before appending/);
      assert.ok(error.cause !== undefined);
      return true;
    });
  });

  it('keeps the filesystem failure as the cause when the write cannot happen', async () => {
    // The target's directory does not exist, so the temporary file cannot be
    // created there.
    const path = join(workDir, 'no-such-dir', 'history.jsonl');

    await assert.rejects(() => appendHistoryRecord(path, RECORD), (error: unknown) => {
      assert.ok(error instanceof HistoryStoreError);
      assert.match(error.message, /temporary history file/);
      assert.equal((error.cause as { code?: string }).code, 'ENOENT');
      return true;
    });
  });
});
