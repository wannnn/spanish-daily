import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  HISTORY_FIELDS,
  HistoryValidationError,
  learnedIds,
  parseHistory,
} from './history.js';
import type { HistoryRecord } from './types.js';

/** A minimal valid record object; tests override the field under test. */
function record(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { date: '2026-07-18', id: 'w0001', word: 'hablar', ...overrides };
}

/** Render objects as JSONL. */
function jsonl(...objects: Record<string, unknown>[]): string {
  return objects.map((object) => JSON.stringify(object)).join('\n');
}

/** Assert the call throws a history error whose message mentions each fragment. */
function assertRejects(content: string, ...fragments: string[]): HistoryValidationError {
  let caught: unknown;
  try {
    parseHistory(content);
  } catch (error) {
    caught = error;
  }

  assert.ok(
    caught instanceof HistoryValidationError,
    `expected a HistoryValidationError, got: ${String(caught)}`,
  );

  for (const fragment of fragments) {
    assert.ok(
      caught.message.includes(fragment),
      `expected message to mention ${JSON.stringify(fragment)}, got: ${caught.message}`,
    );
  }
  return caught;
}

describe('parseHistory — valid input', () => {
  it('parses empty content as an empty history', () => {
    assert.deepEqual(parseHistory(''), []);
  });

  it('parses whitespace-only content as an empty history', () => {
    assert.deepEqual(parseHistory('\n\n   \n'), []);
  });

  it('parses one record', () => {
    assert.deepEqual(parseHistory(jsonl(record())), [
      { date: '2026-07-18', id: 'w0001', word: 'hablar' },
    ]);
  });

  it('parses multiple records in file order', () => {
    const content = jsonl(
      record(),
      record({ date: '2026-07-19', id: 'w0002', word: 'casa' }),
      record({ date: '2026-07-20', id: 'w0003', word: 'niño' }),
    );

    assert.deepEqual(parseHistory(content).map((r) => r.id), [
      'w0001',
      'w0002',
      'w0003',
    ]);
  });

  it('tolerates a trailing newline', () => {
    assert.equal(parseHistory(`${jsonl(record())}\n`).length, 1);
  });

  it('tolerates no trailing newline', () => {
    assert.equal(parseHistory(jsonl(record())).length, 1);
  });

  it('ignores blank and whitespace-only lines between records', () => {
    const content = [
      JSON.stringify(record()),
      '',
      '   ',
      JSON.stringify(record({ date: '2026-07-19', id: 'w0002', word: 'casa' })),
      '',
    ].join('\n');

    assert.equal(parseHistory(content).length, 2);
  });

  it('tolerates CRLF line endings', () => {
    const content = `${JSON.stringify(record())}\r\n${JSON.stringify(
      record({ date: '2026-07-19', id: 'w0002', word: 'casa' }),
    )}\r\n`;

    assert.equal(parseHistory(content).length, 2);
  });

  it('accepts dates that are not consecutive — a missed day is not an error', () => {
    const content = jsonl(
      record(),
      record({ date: '2026-08-01', id: 'w0002', word: 'casa' }),
    );

    assert.equal(parseHistory(content).length, 2);
  });

  it('accepts an id no longer expected to exist in the vocabulary', () => {
    assert.equal(parseHistory(jsonl(record({ id: 'w9999' }))).length, 1);
  });
});

describe('parseHistory — malformed lines', () => {
  it('rejects invalid JSON and names the line', () => {
    assertRejects('{ "date": "2026-07-18", }', 'history line 1', 'not valid JSON');
  });

  it('reports the correct line number for a later failure', () => {
    const content = [
      JSON.stringify(record()),
      JSON.stringify(record({ date: '2026-07-19', id: 'w0002', word: 'casa' })),
      'not json at all',
    ].join('\n');

    assertRejects(content, 'history line 3');
  });

  it('counts blank lines when numbering', () => {
    const content = ['', JSON.stringify(record()), '', 'broken'].join('\n');

    assertRejects(content, 'history line 4');
  });

  for (const [label, line] of [
    ['a string', '"hablar"'],
    ['a number', '7'],
    ['null', 'null'],
    ['an array', '["w0001"]'],
  ] as const) {
    it(`rejects a record that is ${label}`, () => {
      assertRejects(line, 'history line 1', 'must be a JSON object');
    });
  }
});

describe('parseHistory — field validation', () => {
  for (const field of HISTORY_FIELDS) {
    it(`rejects a record missing "${field}"`, () => {
      const incomplete = record();
      delete incomplete[field];

      const error = assertRejects(jsonl(incomplete), 'missing required', `"${field}"`);
      for (const allowed of HISTORY_FIELDS) {
        assert.ok(error.message.includes(`"${allowed}"`));
      }
    });
  }

  it('rejects an unknown field and lists the allowed fields', () => {
    assertRejects(
      jsonl(record({ lessonSchemaVersion: 1 })),
      'unknown field "lessonSchemaVersion"',
      '"date"',
      '"id"',
      '"word"',
    );
  });

  it('rejects a notionPageId — a projection identifier is not source of truth', () => {
    assertRejects(jsonl(record({ notionPageId: 'abc' })), 'unknown field "notionPageId"');
  });

  for (const [label, date] of [
    ['a non-date string', 'today'],
    ['an unpadded month', '2026-7-18'],
    ['a slash format', '2026/07/18'],
    ['a timestamp', '2026-07-18T00:00:00Z'],
    ['surrounding whitespace', ' 2026-07-18'],
  ] as const) {
    it(`rejects an invalid date format: ${label}`, () => {
      assertRejects(jsonl(record({ date })), '"date" must be a real calendar date');
    });
  }

  for (const [label, date] of [
    ['30 February', '2026-02-30'],
    ['29 February in a non-leap year', '2026-02-29'],
    ['month 13', '2026-13-01'],
    ['day 00', '2026-07-00'],
  ] as const) {
    it(`rejects an impossible date: ${label}`, () => {
      assertRejects(jsonl(record({ date })), '"date" must be a real calendar date');
    });
  }

  it('accepts a leap day in a leap year', () => {
    assert.equal(parseHistory(jsonl(record({ date: '2028-02-29' }))).length, 1);
  });

  it('rejects a non-string date', () => {
    assertRejects(jsonl(record({ date: 20260718 })), '"date" must be a string');
  });

  for (const [label, id] of [
    ['a missing w prefix', '0001'],
    ['fewer than four digits', 'w001'],
    ['an uppercase prefix', 'W0001'],
    ['trailing characters', 'w0001a'],
  ] as const) {
    it(`rejects an id with ${label}`, () => {
      assertRejects(jsonl(record({ id })), '"id" must be a "w" followed by');
    });
  }

  it('rejects a non-string id', () => {
    assertRejects(jsonl(record({ id: 1 })), '"id" must be a string');
  });

  for (const [label, word] of [
    ['an empty string', ''],
    ['leading whitespace', ' hablar'],
    ['trailing whitespace', 'hablar '],
    ['uppercase', 'Hablar'],
  ] as const) {
    it(`rejects a word that is ${label}`, () => {
      assertRejects(jsonl(record({ word })), '"word"');
    });
  }

  it('rejects a word that is not NFC-normalized', () => {
    assertRejects(jsonl(record({ word: 'nin\u0303o' })), 'NFC-normalized');
  });

  it('rejects a non-string word', () => {
    assertRejects(jsonl(record({ word: 42 })), '"word" must be a string');
  });
});

describe('parseHistory — duplicates', () => {
  it('rejects a duplicate date and names both lines', () => {
    const content = jsonl(record(), record({ id: 'w0002', word: 'casa' }));

    assertRejects(content, 'duplicate date "2026-07-18"', 'line 2', 'line 1');
  });

  it('rejects a duplicate id and names both lines', () => {
    const content = jsonl(record(), record({ date: '2026-07-19' }));

    assertRejects(content, 'duplicate id "w0001"', 'line 2', 'line 1');
  });

  it('detects duplicates that are far apart', () => {
    const content = jsonl(
      record(),
      record({ date: '2026-07-19', id: 'w0002', word: 'casa' }),
      record({ date: '2026-07-20', id: 'w0003', word: 'comer' }),
      record({ date: '2026-07-21', id: 'w0001', word: 'hablar' }),
    );

    assertRejects(content, 'duplicate id "w0001"', 'line 4');
  });

  it('allows the same word on different ids — homographs are distinct entries', () => {
    const content = jsonl(
      record({ date: '2026-07-18', id: 'w0001', word: 'bajo' }),
      record({ date: '2026-07-19', id: 'w0002', word: 'bajo' }),
    );

    assert.equal(parseHistory(content).length, 2);
  });
});

describe('parseHistory — whole-file rejection', () => {
  it('returns nothing when a later line is invalid', () => {
    const content = jsonl(
      record(),
      record({ date: '2026-07-19', id: 'w0002', word: 'casa' }),
      record({ date: '2026-07-20', id: 'bad-id', word: 'comer' }),
    );

    assertRejects(content, 'history line 3');
  });

  it('rejects the whole file when only the duplicate check fails', () => {
    // Every line is individually valid; only the cross-record rule is violated.
    const content = jsonl(record(), record({ id: 'w0002', word: 'casa' }));

    assert.throws(() => parseHistory(content), HistoryValidationError);
  });

  it('does not mutate the input string or share references', () => {
    const content = jsonl(record());
    const snapshot = content;

    const result = parseHistory(content);
    (result[0] as { date: string }).date = 'mutated';

    assert.equal(content, snapshot);
    assert.deepEqual(parseHistory(content)[0], {
      date: '2026-07-18',
      id: 'w0001',
      word: 'hablar',
    });
  });

  it('returns records carrying only the three contract fields', () => {
    const result = parseHistory(jsonl(record()));

    assert.deepEqual(Object.keys(result[0]!).sort(), ['date', 'id', 'word']);
  });
});

describe('learnedIds', () => {
  /** Build records directly, bypassing parsing. */
  function records(...ids: string[]): HistoryRecord[] {
    return ids.map((id, index) => ({
      date: `2026-07-${String(index + 1).padStart(2, '0')}`,
      id,
      word: `word${index}`,
    }));
  }

  it('derives an empty set from an empty history', () => {
    assert.equal(learnedIds([]).size, 0);
  });

  it('derives every id', () => {
    const learned = learnedIds(records('w0001', 'w0002', 'w0003'));

    assert.equal(learned.size, 3);
    assert.ok(learned.has('w0001'));
    assert.ok(learned.has('w0003'));
  });

  it('keeps an id that no longer exists in the vocabulary', () => {
    // The vocabulary is not consulted at all: what has been learned does not
    // become unlearned when a word leaves the curriculum.
    const learned = learnedIds(records('w0001', 'w9999'));

    assert.ok(learned.has('w9999'));
  });

  it('keys identity on id, never on word', () => {
    const sameWordDifferentIds: HistoryRecord[] = [
      { date: '2026-07-18', id: 'w0001', word: 'bajo' },
      { date: '2026-07-19', id: 'w0002', word: 'bajo' },
    ];

    const learned = learnedIds(sameWordDifferentIds);

    assert.equal(learned.size, 2);
    assert.ok(learned.has('w0001'));
    assert.ok(learned.has('w0002'));
  });

  it('collapses a repeated id — the set has no multiplicity', () => {
    // parseHistory rejects a repeated id, so this can only arise from records
    // built in memory; the derivation stays well defined either way.
    const learned = learnedIds([
      { date: '2026-07-18', id: 'w0001', word: 'hablar' },
      { date: '2026-07-19', id: 'w0001', word: 'hablar' },
    ]);

    assert.equal(learned.size, 1);
  });

  it('does not mutate the input', () => {
    const input = records('w0001', 'w0002');
    const snapshot = structuredClone(input);

    learnedIds(input);

    assert.deepEqual(input, snapshot);
  });

  it('returns an independent set on each call', () => {
    const input = records('w0001');
    const first = learnedIds(input) as Set<string>;
    first.add('w0002');

    assert.equal(learnedIds(input).size, 1);
  });
});
