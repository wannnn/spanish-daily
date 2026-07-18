import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { selectWord } from './selection.js';
import type { HistoryRecord, Pos, VocabularyEntry } from './types.js';

const TODAY = '2026-07-18';

function entry(
  id: string,
  order: number,
  word = `word${order}`,
  pos: Pos = 'verb',
): VocabularyEntry {
  return { id, word, order, pos };
}

function record(date: string, id: string, word = `word-${id}`): HistoryRecord {
  return { date, id, word };
}

/** The id of a `selected` result, or a readable failure. */
function selectedId(
  vocabulary: readonly VocabularyEntry[],
  history: readonly HistoryRecord[],
  today = TODAY,
): string {
  const result = selectWord(vocabulary, history, today);
  assert.equal(result.kind, 'selected', `expected a selection, got ${result.kind}`);
  return result.kind === 'selected' ? result.entry.id : '';
}

describe('selectWord — first selection', () => {
  it('selects the lowest order from an empty history', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2), entry('w0003', 3)];

    assert.equal(selectedId(vocabulary, []), 'w0001');
  });

  it('ignores the order of the vocabulary array', () => {
    const shuffled = [entry('w0003', 3), entry('w0001', 1), entry('w0002', 2)];
    const reversed = [entry('w0003', 3), entry('w0002', 2), entry('w0001', 1)];
    const sorted = [entry('w0001', 1), entry('w0002', 2), entry('w0003', 3)];

    assert.equal(selectedId(shuffled, []), 'w0001');
    assert.equal(selectedId(reversed, []), 'w0001');
    assert.equal(selectedId(sorted, []), 'w0001');
  });

  it('skips learned entries', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2), entry('w0003', 3)];
    const history = [
      record('2026-07-16', 'w0001'),
      record('2026-07-17', 'w0002'),
    ];

    assert.equal(selectedId(vocabulary, history), 'w0003');
  });

  it('respects gaps in order', () => {
    // Non-contiguous order is legal; the lowest remaining wins regardless.
    const vocabulary = [entry('w0001', 10), entry('w0002', 500), entry('w0003', 25)];

    assert.equal(selectedId(vocabulary, []), 'w0001');
    assert.equal(selectedId(vocabulary, [record('2026-07-17', 'w0001')]), 'w0003');
  });

  it('is deterministic across repeated calls', () => {
    const vocabulary = [entry('w0002', 2), entry('w0001', 1)];

    assert.equal(selectedId(vocabulary, []), selectedId(vocabulary, []));
  });

  it('distinguishes homographs by id, not by word', () => {
    // Same word, different pos and id — two independent learning units.
    const vocabulary = [
      entry('w0001', 1, 'bajo', 'adjective'),
      entry('w0002', 2, 'bajo', 'preposition'),
    ];
    const history = [record('2026-07-17', 'w0001', 'bajo')];

    // Learning the adjective must not mark the preposition as learned.
    assert.equal(selectedId(vocabulary, history), 'w0002');
  });
});

describe('selectWord — replay', () => {
  it("returns today's record when one exists", () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const todays = record(TODAY, 'w0001', 'hablar');
    const result = selectWord(vocabulary, [todays], TODAY);

    assert.equal(result.kind, 'replay');
    assert.deepEqual(result.kind === 'replay' ? result.record : undefined, todays);
  });

  it('replays even when the recorded id still exists in the vocabulary', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const result = selectWord(vocabulary, [record(TODAY, 'w0001')], TODAY);

    assert.equal(result.kind, 'replay');
  });

  it('replays when the recorded id has retired from the vocabulary', () => {
    // The word was removed from the curriculum after it was taught. The record
    // is self-describing, so replay does not need the vocabulary at all.
    const vocabulary = [entry('w0002', 2), entry('w0003', 3)];
    const retired = record(TODAY, 'w0001', 'hablar');
    const result = selectWord(vocabulary, [retired], TODAY);

    assert.equal(result.kind, 'replay');
    assert.deepEqual(result.kind === 'replay' ? result.record : undefined, retired);
  });

  it('does not select another word when replaying', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2), entry('w0003', 3)];
    const result = selectWord(vocabulary, [record(TODAY, 'w0001')], TODAY);

    assert.notEqual(result.kind, 'selected');
  });

  it('replays even when the vocabulary is exhausted', () => {
    const vocabulary = [entry('w0001', 1)];
    const result = selectWord(vocabulary, [record(TODAY, 'w0001')], TODAY);

    assert.equal(result.kind, 'replay');
  });

  it('replays even when the vocabulary is empty', () => {
    const result = selectWord([], [record(TODAY, 'w0001')], TODAY);

    assert.equal(result.kind, 'replay');
  });

  it('finds the record for today among many', () => {
    const vocabulary = [entry('w0004', 4)];
    const history = [
      record('2026-07-16', 'w0001'),
      record(TODAY, 'w0002', 'casa'),
      record('2026-07-17', 'w0003'),
    ];
    const result = selectWord(vocabulary, history, TODAY);

    assert.equal(result.kind === 'replay' ? result.record.id : undefined, 'w0002');
  });

  it('does not replay a different date', () => {
    const vocabulary = [entry('w0002', 2)];
    const history = [record('2026-07-17', 'w0001')];

    assert.equal(selectedId(vocabulary, history, TODAY), 'w0002');
  });
});

describe('selectWord — retired historical ids', () => {
  it('does not break normal selection', () => {
    // w9999 was taught, then removed from the vocabulary. It stays learned, and
    // selection carries on with the remaining words.
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const history = [
      record('2026-07-16', 'w9999', 'obsoleto'),
      record('2026-07-17', 'w0001'),
    ];

    assert.equal(selectedId(vocabulary, history), 'w0002');
  });

  it('counts as learned without appearing in the vocabulary', () => {
    const vocabulary = [entry('w0001', 1)];
    const history = [record('2026-07-16', 'w9999', 'obsoleto')];

    assert.equal(selectedId(vocabulary, history), 'w0001');
  });
});

describe('selectWord — exhausted', () => {
  it('reports exhaustion when every id has been learned', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const history = [
      record('2026-07-16', 'w0001'),
      record('2026-07-17', 'w0002'),
    ];

    assert.deepEqual(selectWord(vocabulary, history, TODAY), { kind: 'exhausted' });
  });

  it('reports exhaustion for an empty vocabulary', () => {
    assert.deepEqual(selectWord([], [], TODAY), { kind: 'exhausted' });
  });

  it('does not throw and does not return null or undefined', () => {
    const result = selectWord([], [], TODAY);

    assert.ok(result !== null && result !== undefined);
    assert.equal(result.kind, 'exhausted');
  });

  it('is not exhausted while any unlearned word remains', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const history = [record('2026-07-17', 'w0001')];

    assert.equal(selectWord(vocabulary, history, TODAY).kind, 'selected');
  });
});

describe('selectWord — purity', () => {
  it('does not mutate the vocabulary, including its order', () => {
    const vocabulary = [entry('w0003', 3), entry('w0001', 1), entry('w0002', 2)];
    const snapshot = structuredClone(vocabulary);

    selectWord(vocabulary, [], TODAY);

    assert.deepEqual(vocabulary, snapshot);
    assert.deepEqual(vocabulary.map((e) => e.id), ['w0003', 'w0001', 'w0002']);
  });

  it('does not mutate the history', () => {
    const history = [record('2026-07-16', 'w0001'), record(TODAY, 'w0002')];
    const snapshot = structuredClone(history);

    selectWord([entry('w0003', 3)], history, TODAY);

    assert.deepEqual(history, snapshot);
  });

  it('returns the record itself on replay, not a copy that could drift', () => {
    const todays = record(TODAY, 'w0001', 'hablar');
    const result = selectWord([], [todays], TODAY);

    assert.deepEqual(result.kind === 'replay' ? result.record : undefined, todays);
  });
});
