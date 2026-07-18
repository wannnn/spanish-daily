import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { VocabularyValidationError } from '../domain/vocabulary.js';
import { loadVocabulary, VocabularyLoadError } from './vocabularyStore.js';

let workDir: string;

before(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'spanish-daily-vocab-'));
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

describe('loadVocabulary', () => {
  it('reads, parses, and returns validated entries', async () => {
    const path = await fixture(
      'valid.json',
      JSON.stringify([
        { id: 'w0001', word: 'hablar', order: 1, pos: 'verb' },
        { id: 'w0002', word: 'casa', order: 2, pos: 'noun' },
      ]),
    );

    assert.deepEqual(await loadVocabulary(path), [
      { id: 'w0001', word: 'hablar', order: 1, pos: 'verb' },
      { id: 'w0002', word: 'casa', order: 2, pos: 'noun' },
    ]);
  });

  it('reads an empty vocabulary file', async () => {
    const path = await fixture('empty.json', '[]');
    assert.deepEqual(await loadVocabulary(path), []);
  });

  it('preserves accented characters through the round trip', async () => {
    const path = await fixture(
      'accents.json',
      JSON.stringify([{ id: 'w0001', word: 'niño', order: 1, pos: 'noun' }]),
    );

    const [entry] = await loadVocabulary(path);
    assert.equal(entry?.word, 'niño');
  });

  it('rejects invalid JSON', async () => {
    const path = await fixture('broken.json', '[{ "id": "w0001", }]');

    await assert.rejects(
      () => loadVocabulary(path),
      (error: unknown) => {
        assert.ok(error instanceof VocabularyLoadError);
        assert.match(error.message, /is not valid JSON/);
        assert.ok(error.message.includes(path), 'message should name the file');
        return true;
      },
    );
  });

  it('rejects an empty file — it is not valid JSON', async () => {
    const path = await fixture('blank.json', '');
    await assert.rejects(() => loadVocabulary(path), VocabularyLoadError);
  });

  it('reports a missing file distinctly from a contract violation', async () => {
    const path = join(workDir, 'does-not-exist.json');

    await assert.rejects(
      () => loadVocabulary(path),
      (error: unknown) => {
        assert.ok(error instanceof VocabularyLoadError);
        assert.match(error.message, /Cannot read vocabulary file/);
        return true;
      },
    );
  });

  it('surfaces contract violations from the domain layer unchanged', async () => {
    const path = await fixture(
      'unknown-field.json',
      JSON.stringify([{ id: 'w0001', word: 'hablar', order: 1, pos: 'verb', oder: 2 }]),
    );

    await assert.rejects(
      () => loadVocabulary(path),
      (error: unknown) => {
        // Not a load error: the file read and parsed fine, the data is wrong.
        assert.ok(error instanceof VocabularyValidationError);
        assert.match(error.message, /unknown field "oder"/);
        assert.match(error.message, /Did you mean "order"\?/);
        return true;
      },
    );
  });

  it('rejects a JSON document that is not an array', async () => {
    const path = await fixture('object.json', JSON.stringify({ words: [] }));

    await assert.rejects(() => loadVocabulary(path), VocabularyValidationError);
  });

  it('returns nothing when any entry is invalid — no partial load', async () => {
    const path = await fixture(
      'partial.json',
      JSON.stringify([
        { id: 'w0001', word: 'hablar', order: 1, pos: 'verb' },
        { id: 'w0002', word: 'casa', order: 2, pos: 'nown' },
      ]),
    );

    await assert.rejects(() => loadVocabulary(path), VocabularyValidationError);
  });
});
