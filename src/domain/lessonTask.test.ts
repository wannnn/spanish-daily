import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LESSON_SCHEMA_VERSION, LessonValidationError, renderLesson } from './lesson.js';
import {
  LessonAcceptanceError,
  LessonPreparationError,
  acceptGeneratedLesson,
  prepareLesson,
  type LessonGenerationTask,
} from './lessonTask.js';
import type { HistoryRecord, Lesson, Pos, VocabularyEntry } from './types.js';

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

/** The task of a `generate` result, or a readable failure. */
function taskFor(
  vocabulary: readonly VocabularyEntry[],
  history: readonly HistoryRecord[],
  today = TODAY,
): LessonGenerationTask {
  const result = prepareLesson(vocabulary, history, today);
  assert.equal(result.kind, 'generate', `expected a task, got ${result.kind}`);
  if (result.kind !== 'generate') throw new Error('unreachable');
  return result.task;
}

/**
 * A structurally valid body. The content is deliberately minimal: this suite
 * tests the gate, and the gate has no opinion about teaching material.
 */
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

function lesson(overrides: Partial<Lesson['metadata']> = {}, body = BODY): Lesson {
  return {
    metadata: {
      id: 'w0001',
      word: 'hablar',
      pos: 'verb',
      date: TODAY,
      lessonSchemaVersion: LESSON_SCHEMA_VERSION,
      ...overrides,
    },
    body,
  };
}

/** The task and the matching canonical document, the ordinary happy path. */
function canonicalCase(
  overrides: Partial<Lesson['metadata']> = {},
): { task: LessonGenerationTask; document: string } {
  const task = taskFor([entry('w0001', 1, 'hablar', 'verb')], []);
  return { task, document: renderLesson(lesson(overrides)) };
}

describe('prepareLesson — generate', () => {
  it('builds a task from the selected entry', () => {
    const task = taskFor([entry('w0001', 1, 'hablar', 'verb')], []);

    assert.deepEqual(task, {
      id: 'w0001',
      word: 'hablar',
      pos: 'verb',
      date: TODAY,
      lessonSchemaVersion: LESSON_SCHEMA_VERSION,
      targetPath: 'lessons/2026/2026-07-18-w0001.md',
    });
  });

  it('stamps the schema version this build writes', () => {
    const task = taskFor([entry('w0001', 1)], []);

    assert.equal(task.lessonSchemaVersion, LESSON_SCHEMA_VERSION);
  });

  it('derives the target path from the date and the id', () => {
    const task = taskFor([entry('w0042', 1)], [], '2031-01-09');

    assert.equal(task.targetPath, 'lessons/2031/2031-01-09-w0042.md');
  });

  it('carries no field beyond the generation contract', () => {
    const task = taskFor([entry('w0001', 7, 'hablar')], []);

    assert.deepEqual(Object.keys(task).sort(), [
      'date',
      'id',
      'lessonSchemaVersion',
      'pos',
      'targetPath',
      'word',
    ]);
    assert.equal('order' in task, false);
  });

  it('composes the lowest-order rule rather than restating it', () => {
    const vocabulary = [entry('w0001', 30), entry('w0002', 10), entry('w0003', 20)];

    assert.equal(taskFor(vocabulary, []).id, 'w0002');
  });

  it('skips words already learned on earlier days', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const history = [record('2026-07-17', 'w0001')];

    assert.equal(taskFor(vocabulary, history).id, 'w0002');
  });

  it('does not depend on the order of the vocabulary array', () => {
    const sorted = [entry('w0001', 1, 'uno'), entry('w0002', 2, 'dos')];
    const reversed = [entry('w0002', 2, 'dos'), entry('w0001', 1, 'uno')];

    assert.deepEqual(taskFor(reversed, []), taskFor(sorted, []));
  });

  it('distinguishes homographs by id, not by word', () => {
    const vocabulary = [
      entry('w0001', 1, 'bajo', 'adjective'),
      entry('w0002', 2, 'bajo', 'preposition'),
    ];
    const history = [record('2026-07-17', 'w0001', 'bajo')];

    const task = taskFor(vocabulary, history);

    assert.equal(task.id, 'w0002');
    assert.equal(task.pos, 'preposition');
    assert.equal(task.targetPath, 'lessons/2026/2026-07-18-w0002.md');
  });

  it('returns an identical task on repeated calls', () => {
    const vocabulary = [entry('w0001', 1, 'hablar')];

    assert.deepEqual(prepareLesson(vocabulary, [], TODAY), prepareLesson(vocabulary, [], TODAY));
  });
});

describe('prepareLesson — replay and exhaustion', () => {
  it('replays today without producing a task', () => {
    const history = [record(TODAY, 'w0001', 'hablar')];

    const result = prepareLesson([entry('w0001', 1, 'hablar')], history, TODAY);

    assert.equal(result.kind, 'replay');
    assert.equal('task' in result, false);
  });

  it('returns the exact record it was given', () => {
    const today = record(TODAY, 'w0001', 'hablar');

    const result = prepareLesson([], [record('2026-07-17', 'w0002'), today], TODAY);

    assert.equal(result.kind, 'replay');
    if (result.kind === 'replay') assert.equal(result.record, today);
  });

  it('replays a record whose id has retired from the vocabulary', () => {
    const retired = record(TODAY, 'w0009', 'antiguo');

    const result = prepareLesson([entry('w0001', 1)], [retired], TODAY);

    assert.equal(result.kind, 'replay');
    if (result.kind === 'replay') assert.deepEqual(result.record, retired);
  });

  it('replays even when the vocabulary is exhausted', () => {
    const result = prepareLesson([], [record(TODAY, 'w0001', 'hablar')], TODAY);

    assert.equal(result.kind, 'replay');
  });

  it('reports exhaustion when every word has been learned', () => {
    const vocabulary = [entry('w0001', 1), entry('w0002', 2)];
    const history = [record('2026-07-16', 'w0001'), record('2026-07-17', 'w0002')];

    assert.deepEqual(prepareLesson(vocabulary, history, TODAY), { kind: 'exhausted' });
  });

  it('reports exhaustion for an empty vocabulary', () => {
    assert.deepEqual(prepareLesson([], [], TODAY), { kind: 'exhausted' });
  });
});

describe('prepareLesson — inputs', () => {
  it('rejects a malformed date before selecting anything', () => {
    assert.throws(
      () => prepareLesson([entry('w0001', 1)], [], '18-07-2026'),
      LessonPreparationError,
    );
  });

  it('rejects a date that does not exist', () => {
    assert.throws(() => prepareLesson([entry('w0001', 1)], [], '2026-02-30'), {
      name: 'LessonPreparationError',
      message: /2026-02-30/,
    });
  });

  it('rejects an invalid date on the replay and exhausted paths too', () => {
    const history = [record('not-a-date', 'w0001')];

    assert.throws(() => prepareLesson([], history, 'not-a-date'), LessonPreparationError);
  });

  it('mutates neither the vocabulary nor the history', () => {
    const vocabulary = [entry('w0002', 2, 'comer'), entry('w0001', 1, 'hablar')];
    const history = [record('2026-07-17', 'w0003')];
    const before = JSON.stringify({ vocabulary, history });

    prepareLesson(vocabulary, history, TODAY);

    assert.equal(JSON.stringify({ vocabulary, history }), before);
  });
});

describe('acceptGeneratedLesson — accepting', () => {
  it('returns the parsed lesson', () => {
    const { task, document } = canonicalCase();

    const accepted = acceptGeneratedLesson(task, task.targetPath, document);

    assert.deepEqual(accepted.metadata, {
      id: 'w0001',
      word: 'hablar',
      pos: 'verb',
      date: TODAY,
      lessonSchemaVersion: LESSON_SCHEMA_VERSION,
    });
    assert.equal(accepted.body, BODY);
  });

  it('leaves the task and the document untouched', () => {
    const { task, document } = canonicalCase();
    const taskBefore = JSON.stringify(task);

    acceptGeneratedLesson(task, task.targetPath, document);

    assert.equal(JSON.stringify(task), taskBefore);
    assert.equal(document, renderLesson(lesson()));
  });

  it('accepts a thin lesson: structure is checked, teaching quality is not', () => {
    // Every section present and in order, each holding a single character. The
    // gate has no semantic opinion, so this is acceptable canonical data even
    // though it teaches nothing.
    const thin = [
      '## 基本資訊',
      'a',
      '',
      '## 用法',
      'a',
      '',
      '## 詞形變化',
      'a',
      '',
      '## 例句',
      'a',
      '',
      '## 延伸學習',
      'a',
    ].join('\n');

    const task = taskFor([entry('w0001', 1, 'hablar', 'verb')], []);
    const accepted = acceptGeneratedLesson(
      task,
      task.targetPath,
      renderLesson(lesson({}, thin)),
    );

    assert.equal(accepted.body, thin);
  });
});

describe('acceptGeneratedLesson — path', () => {
  it('rejects a document written anywhere but the target path', () => {
    const { task, document } = canonicalCase();

    assert.throws(
      () => acceptGeneratedLesson(task, 'lessons/2026/2026-07-18-w0002.md', document),
      { name: 'LessonAcceptanceError', message: /only "lessons\/2026\/2026-07-18-w0001\.md"/ },
    );
  });

  it('rejects a path that differs only by directory', () => {
    const { task, document } = canonicalCase();

    assert.throws(
      () => acceptGeneratedLesson(task, `./${task.targetPath}`, document),
      LessonAcceptanceError,
    );
  });
});

describe('acceptGeneratedLesson — structure', () => {
  it('rejects a document with no frontmatter', () => {
    const { task } = canonicalCase();

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, `${BODY}\n`),
      LessonAcceptanceError,
    );
  });

  it('rejects a document whose frontmatter is never closed', () => {
    const { task } = canonicalCase();
    const broken = `---\nid: w0001\nword: hablar\n\n${BODY}\n`;

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, broken),
      LessonAcceptanceError,
    );
  });

  it('rejects a body with a section missing', () => {
    const { task, document } = canonicalCase();
    // Built by editing the canonical bytes, not by rendering: the renderer
    // validates its input and would refuse to produce this document at all.
    const withoutExamples = document
      .split('\n')
      .filter((line) => line !== '## 例句' && !line.startsWith('Hablo'))
      .join('\n');

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, withoutExamples),
      LessonAcceptanceError,
    );
  });

  it('keeps the parse failure as the error cause', () => {
    const { task } = canonicalCase();

    try {
      acceptGeneratedLesson(task, task.targetPath, 'not a lesson at all\n');
      assert.fail('expected acceptance to reject the document');
    } catch (error) {
      assert.ok(error instanceof LessonAcceptanceError);
      assert.ok(error.cause instanceof LessonValidationError);
    }
  });

  it('never quotes the whole document into the error message', () => {
    const { task } = canonicalCase();
    const marker = 'DISTINCTIVE-BODY-MARKER';
    const document = `---\nid: w0001\n---\n\n## 基本資訊\n${marker}\n`;

    try {
      acceptGeneratedLesson(task, task.targetPath, document);
      assert.fail('expected acceptance to reject the document');
    } catch (error) {
      assert.ok(error instanceof LessonAcceptanceError);
      assert.equal(error.message.includes(marker), false);
    }
  });
});

describe('acceptGeneratedLesson — metadata', () => {
  it('rejects a mismatched id', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson({ id: 'w0002' }));

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, document), {
      name: 'LessonAcceptanceError',
      message: /"id" "w0002"/,
    });
  });

  it('rejects a mismatched word', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson({ word: 'comer' }));

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, document), {
      name: 'LessonAcceptanceError',
      message: /"word" "comer"/,
    });
  });

  it('rejects a mismatched pos', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson({ pos: 'noun' }));

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, document), {
      name: 'LessonAcceptanceError',
      message: /"pos" "noun"/,
    });
  });

  it('rejects a mismatched date', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson({ date: '2026-07-17' }));

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, document), {
      name: 'LessonAcceptanceError',
      message: /"date" "2026-07-17"/,
    });
  });

  it('rejects a schema version the task does not name', () => {
    // The document side is already pinned by the parser, so the reachable
    // mismatch is a task built for another schema version.
    const { task, document } = canonicalCase();
    const otherVersion: LessonGenerationTask = {
      ...task,
      lessonSchemaVersion: LESSON_SCHEMA_VERSION + 1,
    };

    assert.throws(() => acceptGeneratedLesson(otherVersion, task.targetPath, document), {
      name: 'LessonAcceptanceError',
      message: /"lessonSchemaVersion"/,
    });
  });

  it('rejects a document written to an unsupported schema version', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson()).replace(
      'lesson_schema_version: 1',
      'lesson_schema_version: 2',
    );

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, document),
      LessonAcceptanceError,
    );
  });
});

describe('acceptGeneratedLesson — canonical form', () => {
  it('accepts the renderer’s own bytes unchanged', () => {
    const { task, document } = canonicalCase();

    assert.equal(acceptGeneratedLesson(task, task.targetPath, document).body, BODY);
  });

  it('rejects a CRLF document even though the parser understands it', () => {
    const { task, document } = canonicalCase();

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, document.replace(/\n/g, '\r\n')), {
      name: 'LessonAcceptanceError',
      message: /CRLF/,
    });
  });

  it('rejects a document with no final newline', () => {
    const { task, document } = canonicalCase();

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, document.replace(/\n$/, '')),
      { name: 'LessonAcceptanceError', message: /does not end with a newline/ },
    );
  });

  it('rejects a document with extra trailing newlines', () => {
    const { task, document } = canonicalCase();

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, `${document}\n`), {
      name: 'LessonAcceptanceError',
      message: /more than one newline/,
    });
  });

  it('rejects a document with leading blank lines', () => {
    const { task, document } = canonicalCase();

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, `\n${document}`),
      LessonAcceptanceError,
    );
  });

  it('rejects non-canonical frontmatter spacing', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson()).replace('id: w0001', 'id:  w0001');

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, document),
      LessonAcceptanceError,
    );
  });

  it('rejects a word quoted where the renderer would write it bare', () => {
    const { task } = canonicalCase();
    const document = renderLesson(lesson()).replace('word: hablar', 'word: "hablar"');

    assert.throws(() => acceptGeneratedLesson(task, task.targetPath, document), {
      name: 'LessonAcceptanceError',
      message: /line \d+/,
    });
  });

  it('rejects a blank line inserted between the frontmatter and the body', () => {
    const { task, document } = canonicalCase();

    assert.throws(
      () => acceptGeneratedLesson(task, task.targetPath, document.replace('---\n\n##', '---\n\n\n##')),
      LessonAcceptanceError,
    );
  });
});
