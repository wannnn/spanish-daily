import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LESSON_SCHEMA_VERSION,
  LESSON_SECTIONS,
  LessonValidationError,
  lessonRelativePath,
  parseLesson,
  renderLesson,
  validateLessonBody,
} from './lesson.js';
import type { Lesson, LessonMetadata } from './types.js';

const BODY = [
  '## 基本資訊',
  '',
  '- **hablar** — 說話、講',
  '',
  '## 用法',
  '',
  '常見搭配：hablar con alguien。',
  '',
  '## 詞形變化',
  '',
  '| 人稱 | Presente |',
  '| --- | --- |',
  '| yo | hablo |',
  '',
  '## 例句',
  '',
  '1. Hablo español. — 我說西班牙語。',
  '',
  '## 延伸學習',
  '',
  '近義詞：decir、conversar。',
].join('\n');

function metadata(overrides: Partial<LessonMetadata> = {}): LessonMetadata {
  return {
    id: 'w0001',
    word: 'hablar',
    pos: 'verb',
    date: '2026-07-18',
    lessonSchemaVersion: LESSON_SCHEMA_VERSION,
    ...overrides,
  };
}

function lesson(overrides: Partial<Lesson> = {}): Lesson {
  return { metadata: metadata(), body: BODY, ...overrides };
}

/** A body built from the given headings, each with a line of content. */
function bodyOf(...headings: string[]): string {
  return headings.map((heading) => `${heading}\n\n內容。\n`).join('\n');
}

function assertRejects(run: () => unknown, ...fragments: string[]): LessonValidationError {
  let caught: unknown;
  try {
    run();
  } catch (error) {
    caught = error;
  }

  assert.ok(
    caught instanceof LessonValidationError,
    `expected a LessonValidationError, got: ${String(caught)}`,
  );

  for (const fragment of fragments) {
    assert.ok(
      caught.message.includes(fragment),
      `expected message to mention ${JSON.stringify(fragment)}, got: ${caught.message}`,
    );
  }
  return caught;
}

describe('renderLesson', () => {
  it('renders canonical frontmatter followed by the body', () => {
    const document = renderLesson(lesson());

    assert.ok(document.startsWith('---\n'));
    assert.ok(
      document.includes(
        [
          '---',
          'id: w0001',
          'word: hablar',
          'pos: verb',
          'date: 2026-07-18',
          'lesson_schema_version: 1',
          '---',
        ].join('\n'),
      ),
    );
  });

  it('emits frontmatter keys in a fixed order', () => {
    const keys = renderLesson(lesson())
      .split('\n')
      .slice(1, 6)
      .map((line) => line.split(':')[0]);

    assert.deepEqual(keys, ['id', 'word', 'pos', 'date', 'lesson_schema_version']);
  });

  it('separates frontmatter from the body with exactly one blank line', () => {
    const lines = renderLesson(lesson()).split('\n');
    const closing = lines.indexOf('---', 1);

    assert.equal(lines[closing + 1], '');
    assert.equal(lines[closing + 2], '## 基本資訊');
  });

  it('ends with exactly one trailing newline', () => {
    const document = renderLesson(lesson());

    assert.ok(document.endsWith('\n'));
    assert.ok(!document.endsWith('\n\n'));
  });

  it('is deterministic — repeated renders are byte-identical', () => {
    assert.equal(renderLesson(lesson()), renderLesson(lesson()));
  });

  it('normalizes surrounding blank lines in the body', () => {
    const padded = renderLesson(lesson({ body: `\n\n${BODY}\n\n\n` }));

    assert.equal(padded, renderLesson(lesson()));
  });

  it('does not alter the body content itself', () => {
    const document = renderLesson(lesson());

    assert.ok(document.includes('| yo | hablo |'));
    assert.ok(document.includes('1. Hablo español. — 我說西班牙語。'));
  });

  it('does not mutate its input', () => {
    const input = lesson();
    const snapshot = structuredClone(input);

    renderLesson(input);

    assert.deepEqual(input, snapshot);
  });

  it('rejects an invalid lesson rather than rendering it', () => {
    assertRejects(() => renderLesson(lesson({ metadata: metadata({ id: 'nope' }) })), '"id"');
    assertRejects(() => renderLesson(lesson({ body: '## 用法\n\n內容。' })), 'missing');
  });
});

describe('renderLesson — word encoding', () => {
  it('writes an ordinary word bare, exactly as the specification shows', () => {
    assert.ok(renderLesson(lesson()).includes('\nword: hablar\n'));
  });

  it('writes an accented word bare', () => {
    const document = renderLesson(
      lesson({ metadata: metadata({ word: 'niño'.normalize('NFC') }) }),
    );

    assert.ok(document.includes(`\nword: ${'niño'.normalize('NFC')}\n`));
  });

  for (const word of ['no', 'y', 'si']) {
    it(`quotes "${word}" when a YAML reader would resolve it to a non-string`, () => {
      const document = renderLesson(lesson({ metadata: metadata({ word }) }));
      const line = document.split('\n').find((l) => l.startsWith('word:'))!;

      // "si" is an ordinary word and stays bare; "no" and "y" are YAML 1.1
      // booleans and must not be written bare.
      const expected = word === 'si' ? 'word: si' : `word: "${word}"`;
      assert.equal(line, expected);

      assert.equal(parseLesson(document).metadata.word, word);
    });
  }

  for (const [label, word] of [
    ['a colon', 'a: b'],
    ['a leading hyphen', '-uno'],
    ['a quote', 'a"b'],
    ['a backslash', 'a\\b'],
    ['a hash', 'a #b'],
    ['a brace', '{a}'],
    ['a newline', 'a\nb'],
    ['digits only', '2'],
  ] as const) {
    it(`quotes and round-trips a word containing ${label}`, () => {
      const original = lesson({ metadata: metadata({ word }) });
      const document = renderLesson(original);
      const line = document.split('\n').find((l) => l.startsWith('word:'))!;

      assert.ok(line.startsWith('word: "'), `expected a quoted scalar, got: ${line}`);
      assert.equal(parseLesson(document).metadata.word, word);
    });
  }
});

describe('parseLesson — round trip', () => {
  it('recovers the metadata and body', () => {
    const original = lesson();
    const parsed = parseLesson(renderLesson(original));

    assert.deepEqual(parsed.metadata, original.metadata);
    assert.equal(parsed.body, original.body);
  });

  it('re-renders to identical output', () => {
    const document = renderLesson(lesson());

    assert.equal(renderLesson(parseLesson(document)), document);
  });

  it('normalizes a document with extra blank lines around the body', () => {
    const canonical = renderLesson(lesson());
    const loosened = canonical.replace('---\n\n## 基本資訊', '---\n\n\n\n## 基本資訊');

    assert.equal(renderLesson(parseLesson(loosened)), canonical);
  });

  it('tolerates CRLF line endings', () => {
    const parsed = parseLesson(renderLesson(lesson()).replace(/\n/g, '\r\n'));

    assert.deepEqual(parsed.metadata, metadata());
    assert.equal(parsed.body, BODY);
  });

  it('normalizes a CRLF document back to canonical LF output', () => {
    const canonical = renderLesson(lesson());
    const crlf = canonical.replace(/\n/g, '\r\n');

    assert.equal(renderLesson(parseLesson(crlf)), canonical);
  });

  it('renders the same bytes whether the body arrived with LF or CRLF', () => {
    // The rendered document is the canonical artifact, so line endings must not
    // make two byte-different files out of one lesson.
    const withCrlf = lesson({ body: BODY.replace(/\n/g, '\r\n') });

    assert.equal(renderLesson(withCrlf), renderLesson(lesson()));
    assert.ok(!renderLesson(withCrlf).includes('\r'));
  });

  it('returns a fresh object that does not alias the input', () => {
    const parsed = parseLesson(renderLesson(lesson()));

    assert.deepEqual(Object.keys(parsed).sort(), ['body', 'metadata']);
    assert.deepEqual(Object.keys(parsed.metadata).sort(), [
      'date',
      'id',
      'lessonSchemaVersion',
      'pos',
      'word',
    ]);
  });
});

describe('parseLesson — frontmatter failures', () => {
  it('rejects a document with no frontmatter', () => {
    assertRejects(() => parseLesson(BODY), 'must begin with');
  });

  it('rejects frontmatter that is never closed', () => {
    assertRejects(
      () => parseLesson('---\nid: w0001\nword: hablar\n'),
      'never closed',
    );
  });

  it('rejects a line that is not a key/value pair', () => {
    const broken = renderLesson(lesson()).replace('pos: verb', 'pos verb');

    assertRejects(() => parseLesson(broken), 'not a "key: value" pair');
  });

  it('rejects an unknown field and lists the allowed fields', () => {
    const broken = renderLesson(lesson()).replace(
      'pos: verb',
      'pos: verb\nprompt_version: 3',
    );

    assertRejects(() => parseLesson(broken), 'unknown field "prompt_version"', '"id"');
  });

  it('rejects an adapter-specific field', () => {
    const broken = renderLesson(lesson()).replace(
      'pos: verb',
      'pos: verb\nnotion_page_id: abc',
    );

    assertRejects(() => parseLesson(broken), 'unknown field "notion_page_id"');
  });

  for (const key of ['id', 'word', 'pos', 'date', 'lesson_schema_version']) {
    it(`rejects a document missing "${key}"`, () => {
      const broken = renderLesson(lesson())
        .split('\n')
        .filter((line) => !line.startsWith(`${key}:`))
        .join('\n');

      assertRejects(() => parseLesson(broken), 'missing', `"${key}"`);
    });
  }

  it('rejects a duplicate key', () => {
    const broken = renderLesson(lesson()).replace('pos: verb', 'pos: verb\npos: noun');

    assertRejects(() => parseLesson(broken), 'duplicate field "pos"');
  });

  it('rejects an invalid id', () => {
    const broken = renderLesson(lesson()).replace('id: w0001', 'id: 0001');

    assertRejects(() => parseLesson(broken), '"id"');
  });

  it('rejects an invalid word', () => {
    const broken = renderLesson(lesson()).replace('word: hablar', 'word: Hablar');

    assertRejects(() => parseLesson(broken), '"word"', 'lowercase');
  });

  it('rejects an invalid pos', () => {
    const broken = renderLesson(lesson()).replace('pos: verb', 'pos: article');

    assertRejects(() => parseLesson(broken), '"pos" must be one of');
  });

  it('rejects an invalid date', () => {
    const broken = renderLesson(lesson()).replace('date: 2026-07-18', 'date: 2026-02-30');

    assertRejects(() => parseLesson(broken), 'real calendar date');
  });

  it('rejects an unsupported schema version', () => {
    const broken = renderLesson(lesson()).replace(
      'lesson_schema_version: 1',
      'lesson_schema_version: 2',
    );

    assertRejects(() => parseLesson(broken), 'unsupported lesson_schema_version 2');
  });

  it('rejects a non-integer schema version', () => {
    const broken = renderLesson(lesson()).replace(
      'lesson_schema_version: 1',
      'lesson_schema_version: one',
    );

    assertRejects(() => parseLesson(broken), 'must be an integer');
  });

  it('rejects an unsupported escape in a quoted word', () => {
    const broken = renderLesson(lesson()).replace('word: hablar', 'word: "a\\tb"');

    assertRejects(() => parseLesson(broken), 'unsupported escape');
  });

  it('rejects an unterminated quoted word', () => {
    const broken = renderLesson(lesson()).replace('word: hablar', 'word: "hablar');

    assertRejects(() => parseLesson(broken), 'unterminated quote');
  });

  it('accepts a canonical bare word', () => {
    assert.equal(parseLesson(renderLesson(lesson())).metadata.word, 'hablar');
  });

  for (const [label, word] of [
    ['an embedded quote', 'hablar"x'],
    ['a YAML boolean token', 'no'],
    ['a colon', 'a: b'],
  ] as const) {
    it(`rejects ${label} written bare, since the renderer would quote it`, () => {
      const bare = renderLesson(lesson()).replace('word: hablar', `word: ${word}`);

      assertRejects(() => parseLesson(bare), 'not a canonical plain scalar');
    });

    it(`accepts ${label} in canonical quoted form`, () => {
      const quoted = renderLesson(lesson({ metadata: metadata({ word }) }));

      assert.equal(parseLesson(quoted).metadata.word, word);
    });
  }

  it('rejects a body that fails structural validation', () => {
    const broken = renderLesson(lesson()).replace('## 延伸學習', '## 延伸閱讀');

    assertRejects(() => parseLesson(broken), 'unexpected section');
  });
});

describe('validateLessonBody', () => {
  it('accepts the five sections in order', () => {
    assert.doesNotThrow(() => validateLessonBody(BODY));
  });

  it('accepts tables, lists, and subheadings inside a section', () => {
    const rich = [
      '## 基本資訊',
      '- 項目',
      '## 用法',
      '### 常見搭配',
      '1. 編號清單',
      '## 詞形變化',
      '| a | b |',
      '| --- | --- |',
      '| 1 | 2 |',
      '#### 更深的標題',
      '## 例句',
      '> 引用',
      '## 延伸學習',
      '**粗體**',
    ].join('\n');

    assert.doesNotThrow(() => validateLessonBody(rich));
  });

  for (const section of LESSON_SECTIONS) {
    it(`rejects a body missing ${section}`, () => {
      const remaining = LESSON_SECTIONS.filter((s) => s !== section);

      assertRejects(() => validateLessonBody(bodyOf(...remaining)), 'missing', section);
    });
  }

  it('rejects sections in the wrong order', () => {
    const swapped = bodyOf(
      '## 用法',
      '## 基本資訊',
      '## 詞形變化',
      '## 例句',
      '## 延伸學習',
    );

    assertRejects(() => validateLessonBody(swapped), 'out of order');
  });

  it('rejects a duplicated section', () => {
    const duplicated = bodyOf(...LESSON_SECTIONS, '## 用法');

    assertRejects(() => validateLessonBody(duplicated), 'repeats the section');
  });

  it('rejects an unknown section', () => {
    const extra = bodyOf(...LESSON_SECTIONS, '## 測驗');

    assertRejects(() => validateLessonBody(extra), 'unexpected section', '## 測驗');
  });

  it('gives a useful error for a misspelled heading', () => {
    const typo = BODY.replace('## 基本資訊', '## 基本資料');
    const error = assertRejects(() => validateLessonBody(typo), 'unexpected section');

    assert.ok(error.message.includes('## 基本資訊'), 'should list the expected sections');
    assert.ok(error.message.includes('misspelled'));
  });

  for (const [label, body] of [
    ['empty', ''],
    ['only whitespace', '   \n\n  '],
  ] as const) {
    it(`rejects a body that is ${label}`, () => {
      assertRejects(() => validateLessonBody(body), 'must not be empty');
    });
  }

  it('rejects a body carrying its own frontmatter', () => {
    const withFrontmatter = `---\nid: w0001\n---\n\n${BODY}`;

    assertRejects(() => validateLessonBody(withFrontmatter), 'must not contain frontmatter');
  });

  it('accepts a horizontal rule inside the body', () => {
    // `---` below the frontmatter is ordinary content, not another fence.
    const withRule = BODY.replace('## 例句', '---\n\n## 例句');

    assert.doesNotThrow(() => validateLessonBody(withRule));
    assert.equal(parseLesson(renderLesson(lesson({ body: withRule }))).body, withRule);
  });

  it('ignores a ## line inside a backtick code fence', () => {
    const fenced = BODY.replace(
      '常見搭配：hablar con alguien。',
      ['```', '## 這是程式碼，不是章節', '```'].join('\n'),
    );

    assert.doesNotThrow(() => validateLessonBody(fenced));
  });

  it('ignores a ## line inside a tilde code fence', () => {
    const fenced = BODY.replace(
      '常見搭配：hablar con alguien。',
      ['~~~', '## 這是程式碼，不是章節', '~~~'].join('\n'),
    );

    assert.doesNotThrow(() => validateLessonBody(fenced));
  });

  it('requires the closing fence to use the opening character', () => {
    // Opened with backticks, "closed" with tildes: still open, so it fails.
    const mismatched = BODY.replace(
      '常見搭配：hablar con alguien。',
      ['```', '## 內容', '~~~'].join('\n'),
    );

    assertRejects(() => validateLessonBody(mismatched), 'unclosed code fence');
  });

  it('still rejects an unexpected section outside a code fence', () => {
    const fencedPlusExtra = `${BODY.replace(
      '常見搭配：hablar con alguien。',
      ['```', '## 在圍籬內', '```'].join('\n'),
    )}\n\n## 測驗\n\n不該存在。`;

    assertRejects(() => validateLessonBody(fencedPlusExtra), 'unexpected section', '## 測驗');
  });

  it('fails loudly on an unclosed code fence', () => {
    const unclosed = `${BODY}\n\n\`\`\`\n## 永遠沒有關閉`;

    assertRejects(() => validateLessonBody(unclosed), 'unclosed code fence');
  });
});

describe('lessonRelativePath', () => {
  it('builds the canonical path', () => {
    assert.equal(lessonRelativePath(metadata()), 'lessons/2026/2026-07-18-w0001.md');
  });

  it('derives the year from the date', () => {
    assert.equal(
      lessonRelativePath(metadata({ date: '2027-01-01' })),
      'lessons/2027/2027-01-01-w0001.md',
    );
    assert.equal(
      lessonRelativePath(metadata({ date: '2026-12-31' })),
      'lessons/2026/2026-12-31-w0001.md',
    );
  });

  it('uses the id verbatim, including long ids', () => {
    assert.equal(
      lessonRelativePath(metadata({ id: 'w123456' })),
      'lessons/2026/2026-07-18-w123456.md',
    );
  });

  it('uses POSIX separators and stays relative', () => {
    const path = lessonRelativePath(metadata());

    assert.ok(!path.includes('\\'));
    assert.ok(!path.startsWith('/'));
    assert.ok(!path.includes('..'));
    assert.ok(path.startsWith('lessons/'));
  });

  it('has no usable path for invalid metadata', () => {
    assertRejects(() => lessonRelativePath(metadata({ id: '../escape' })), '"id"');
    assertRejects(() => lessonRelativePath(metadata({ id: '/w0001' })), '"id"');
    assertRejects(() => lessonRelativePath(metadata({ date: '2026-02-30' })), 'calendar date');
    assertRejects(() => lessonRelativePath(metadata({ date: '../../etc' })), 'calendar date');
  });
});
