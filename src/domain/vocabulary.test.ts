import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ALLOWED_FIELDS,
  validateVocabulary,
  VocabularyValidationError,
} from './vocabulary.js';

/** A minimal valid entry; individual tests override the field under test. */
function entry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: 'w0001', word: 'hablar', order: 1, pos: 'verb', ...overrides };
}

/** Assert the call throws a validation error whose message mentions each fragment. */
function assertRejects(
  raw: unknown,
  ...fragments: string[]
): VocabularyValidationError {
  let caught: unknown;
  try {
    validateVocabulary(raw);
  } catch (error) {
    caught = error;
  }

  assert.ok(
    caught instanceof VocabularyValidationError,
    `expected a VocabularyValidationError, got: ${String(caught)}`,
  );

  for (const fragment of fragments) {
    assert.ok(
      caught.message.includes(fragment),
      `expected message to mention ${JSON.stringify(fragment)}, got: ${caught.message}`,
    );
  }
  return caught;
}

describe('validateVocabulary — valid input', () => {
  it('accepts a well-formed vocabulary and preserves file order', () => {
    const result = validateVocabulary([
      entry(),
      entry({ id: 'w0002', word: 'casa', order: 2, pos: 'noun' }),
      entry({ id: 'w0003', word: 'niño', order: 10, pos: 'noun' }),
    ]);

    assert.deepEqual(result, [
      { id: 'w0001', word: 'hablar', order: 1, pos: 'verb' },
      { id: 'w0002', word: 'casa', order: 2, pos: 'noun' },
      { id: 'w0003', word: 'niño', order: 10, pos: 'noun' },
    ]);
  });

  it('accepts an empty vocabulary — it parses as an array and breaks no rule', () => {
    assert.deepEqual(validateVocabulary([]), []);
  });

  it('allows non-contiguous order, so words can be inserted without renumbering', () => {
    const result = validateVocabulary([
      entry({ order: 10 }),
      entry({ id: 'w0002', word: 'casa', order: 500, pos: 'noun' }),
    ]);

    assert.deepEqual(result.map((e) => e.order), [10, 500]);
  });

  it('allows a homograph: the same word with a different pos', () => {
    const result = validateVocabulary([
      entry({ id: 'w0001', word: 'bajo', order: 1, pos: 'adjective' }),
      entry({ id: 'w0002', word: 'bajo', order: 2, pos: 'preposition' }),
    ]);

    assert.equal(result.length, 2);
    assert.deepEqual(result.map((e) => e.pos), ['adjective', 'preposition']);
  });

  it('accepts every value of the POS enum', () => {
    const posValues = [
      'verb', 'noun', 'adjective', 'adverb', 'pronoun',
      'determiner', 'numeral', 'preposition', 'conjunction', 'interjection',
    ];
    const raw = posValues.map((pos, i) => ({
      id: `w${String(i + 1).padStart(4, '0')}`,
      word: `palabra${i}`,
      order: i + 1,
      pos,
    }));

    assert.equal(validateVocabulary(raw).length, posValues.length);
  });

  it('accepts ids longer than four digits', () => {
    const result = validateVocabulary([entry({ id: 'w123456' })]);
    assert.equal(result[0]?.id, 'w123456');
  });
});

describe('validateVocabulary — malformed top-level value', () => {
  for (const [label, raw] of [
    ['an object', { entries: [] }],
    ['a string', '[]'],
    ['null', null],
    ['a number', 42],
    ['undefined', undefined],
  ] as const) {
    it(`rejects ${label} at the top level`, () => {
      assertRejects(raw, 'must be a JSON array');
    });
  }
});

describe('validateVocabulary — malformed entry', () => {
  for (const [label, raw] of [
    ['a string', 'hablar'],
    ['null', null],
    ['a number', 7],
    ['an array', ['w0001', 'hablar']],
  ] as const) {
    it(`rejects an entry that is ${label}`, () => {
      assertRejects([raw], 'index 0', 'must be a JSON object');
    });
  }

  it('reports the index of the offending entry, not the first one', () => {
    assertRejects([entry(), entry({ id: 'w0002', order: 2 }), 'oops'], 'index 2');
  });
});

describe('validateVocabulary — missing fields', () => {
  for (const field of ALLOWED_FIELDS) {
    it(`rejects an entry missing "${field}"`, () => {
      const incomplete = entry();
      delete incomplete[field];

      const error = assertRejects([incomplete], 'missing required', `"${field}"`);
      // The message must list what a complete entry needs.
      for (const allowed of ALLOWED_FIELDS) {
        assert.ok(error.message.includes(`"${allowed}"`));
      }
    });
  }

  it('rejects an empty object and names every missing field', () => {
    assertRejects([{}], 'index 0', '"id"', '"word"', '"order"', '"pos"');
  });
});

describe('validateVocabulary — unknown fields', () => {
  it('rejects an unknown field and lists the allowed fields', () => {
    assertRejects(
      [entry({ cefr: 'A1' })],
      'unknown field "cefr"',
      'Allowed fields are "id", "word", "order", "pos"',
    );
  });

  it('locates the offending entry by id when the id is usable', () => {
    assertRejects([entry({ id: 'w0042', gender: 'f' })], 'Entry w0042');
  });

  it('falls back to the array position when the id is unusable', () => {
    assertRejects([entry({ id: 'nope', gender: 'f' })], 'Entry at index 0');
  });

  it('suggests a spelling for a near-miss field name', () => {
    assertRejects([entry({ oder: 1 })], 'unknown field "oder"', 'Did you mean "order"?');
  });

  it('suggests for other plausible typos', () => {
    assertRejects([entry({ wrod: 'x' })], 'Did you mean "word"?');
    assertRejects([entry({ Order: 1 })], 'Did you mean "order"?');
  });

  it('suggests a short field when the near-miss is genuinely near', () => {
    assertRejects([entry({ i: 'w0001' })], 'Did you mean "id"?');
  });

  it('does not suggest a short field for an unrelated short name', () => {
    // "xy" is two edits from "id" — but that is the whole of "id", so the
    // suggestion would be noise rather than a correction.
    const error = assertRejects([entry({ xy: 1 })], 'unknown field "xy"');
    assert.ok(
      !error.message.includes('Did you mean'),
      `expected no suggestion, got: ${error.message}`,
    );
  });

  it('omits a suggestion when nothing is close', () => {
    const error = assertRejects([entry({ frequency: 3 })], 'unknown field "frequency"');
    assert.ok(!error.message.includes('Did you mean'));
  });
});

describe('validateVocabulary — id', () => {
  for (const [label, id] of [
    ['a missing w prefix', '0001'],
    ['fewer than four digits', 'w001'],
    ['an uppercase prefix', 'W0001'],
    ['trailing characters', 'w0001a'],
    ['non-digits', 'wabcd'],
    ['an empty string', ''],
  ] as const) {
    it(`rejects an id with ${label}`, () => {
      assertRejects([entry({ id })], '"id" must match');
    });
  }

  it('rejects a non-string id', () => {
    assertRejects([entry({ id: 1 })], '"id" must be a string');
  });
});

describe('validateVocabulary — word', () => {
  it('rejects a non-string word', () => {
    assertRejects([entry({ word: 42 })], '"word" must be a string');
  });

  it('rejects an empty word', () => {
    assertRejects([entry({ word: '' })], 'must not be empty');
  });

  for (const word of [' hablar', 'hablar ', '\thablar']) {
    it(`rejects surrounding whitespace in ${JSON.stringify(word)}`, () => {
      assertRejects([entry({ word })], 'leading or trailing whitespace');
    });
  }

  it('rejects an uppercase word', () => {
    assertRejects([entry({ word: 'Hablar' })], 'must be lowercase');
  });

  it('rejects a word that is not NFC-normalized', () => {
    // "niño" written with a combining tilde (NFD) rather than precomposed U+00F1.
    const decomposed = 'nin\u0303o';
    assert.notEqual(decomposed, decomposed.normalize('NFC'));

    assertRejects([entry({ word: decomposed })], 'NFC-normalized');
  });

  it('accepts the NFC form of the same word', () => {
    const result = validateVocabulary([entry({ word: 'niño'.normalize('NFC') })]);
    assert.equal(result[0]?.word, 'niño');
  });
});

describe('validateVocabulary — order', () => {
  for (const [label, order] of [
    ['zero', 0],
    ['a negative number', -1],
  ] as const) {
    it(`rejects ${label}`, () => {
      assertRejects([entry({ order })], '"order" must be >= 1');
    });
  }

  for (const [label, order] of [
    ['a non-integer', 1.5],
    ['a numeric string', '1'],
    ['null', null],
    ['NaN', Number.NaN],
  ] as const) {
    it(`rejects ${label}`, () => {
      assertRejects([entry({ order })], '"order" must be an integer');
    });
  }
});

describe('validateVocabulary — pos', () => {
  it('rejects a value outside the enum and lists the enum', () => {
    assertRejects(
      [entry({ pos: 'article' })],
      '"pos" must be one of',
      '"determiner"',
      '"interjection"',
    );
  });

  it('rejects a differently-cased enum value — the set is closed', () => {
    assertRejects([entry({ pos: 'Verb' })], '"pos" must be one of');
  });

  it('rejects a non-string pos', () => {
    assertRejects([entry({ pos: 1 })], '"pos" must be a string');
  });
});

describe('validateVocabulary — duplicates', () => {
  it('rejects a duplicate id and reports both positions', () => {
    assertRejects(
      [entry(), entry({ order: 2, word: 'casa', pos: 'noun' })],
      'Duplicate "id" "w0001"',
      'index 1',
      'index 0',
    );
  });

  it('rejects a duplicate order and names both entries', () => {
    assertRejects(
      [entry(), entry({ id: 'w0002', word: 'casa', pos: 'noun' })],
      'Duplicate "order" 1',
      'w0001',
      'w0002',
    );
  });

  it('rejects a duplicate (word, pos) pair and names both entries', () => {
    assertRejects(
      [entry(), entry({ id: 'w0002', order: 2 })],
      'Duplicate (word, pos) pair',
      '"hablar"',
      '"verb"',
      'w0001',
      'w0002',
    );
  });

  it('detects duplicates that are far apart in the file', () => {
    const raw = [
      entry(),
      entry({ id: 'w0002', word: 'casa', order: 2, pos: 'noun' }),
      entry({ id: 'w0003', word: 'comer', order: 3, pos: 'verb' }),
      entry({ id: 'w0004', word: 'casa', order: 4, pos: 'noun' }),
    ];

    assertRejects(raw, 'Duplicate (word, pos) pair', 'w0002', 'w0004');
  });
});

describe('validateVocabulary — whole-file rejection', () => {
  it('returns nothing when a later entry is invalid — there is no partial accept', () => {
    const raw = [
      entry(),
      entry({ id: 'w0002', word: 'casa', order: 2, pos: 'noun' }),
      entry({ id: 'w0003', word: 'comer', order: 3, pos: 'not-a-pos' }),
    ];

    // The two valid entries above it are discarded with the rest — nothing is
    // returned, so there is no way for a caller to consume a partial result.
    assertRejects(raw, 'w0003', '"pos" must be one of');
  });

  it('rejects the whole file when only the duplicate check fails', () => {
    // Every entry is individually valid; only the cross-entry rule is violated.
    const raw = [entry(), entry({ id: 'w0002', word: 'casa', pos: 'noun' })];

    assert.throws(() => validateVocabulary(raw), VocabularyValidationError);
  });

  it('does not mutate the input', () => {
    const raw = [entry()];
    const snapshot = structuredClone(raw);

    validateVocabulary(raw);

    assert.deepEqual(raw, snapshot);
  });

  it('rejects a sparse array instead of returning undefined entries', () => {
    // The hole at index 1 is deliberate.
    const sparse = [entry(), , entry({ id: 'w0003', word: 'casa', order: 3, pos: 'noun' })];
    assert.equal(sparse.length, 3);

    assertRejects(sparse, 'index 1', 'must be a JSON object');
  });

  it('returns entries carrying only the four contract fields', () => {
    const result = validateVocabulary([entry()]);
    assert.deepEqual(Object.keys(result[0]!).sort(), ['id', 'order', 'pos', 'word']);
  });
});
