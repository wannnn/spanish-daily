import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isCalendarDate, taipeiDate, TIMEZONE } from './date.js';

/**
 * The UTC calendar date of the same instant. Used to show that `taipeiDate`
 * follows Taipei and not UTC — the timezone GitHub Actions actually runs in.
 */
function utcDate(instant: Date): string {
  return instant.toISOString().slice(0, 10);
}

describe('taipeiDate', () => {
  it('uses Asia/Taipei', () => {
    assert.equal(TIMEZONE, 'Asia/Taipei');
  });

  it('returns the Taipei date for a mid-day instant', () => {
    // 2026-07-18 04:00 UTC is 2026-07-18 12:00 in Taipei — same day either way.
    const instant = new Date('2026-07-18T04:00:00Z');

    assert.equal(taipeiDate(instant), '2026-07-18');
    assert.equal(utcDate(instant), '2026-07-18');
  });

  it('is already the next day in Taipei from 16:00 UTC', () => {
    // UTC+8: 16:00 UTC is midnight in Taipei, so the Taipei date has rolled over
    // while the UTC date has not. This is the case a UTC-based implementation
    // gets wrong.
    const instant = new Date('2026-07-18T16:00:00Z');

    assert.equal(taipeiDate(instant), '2026-07-19');
    assert.equal(utcDate(instant), '2026-07-18');
  });

  it('has not rolled over one minute before', () => {
    assert.equal(taipeiDate(new Date('2026-07-18T15:59:59Z')), '2026-07-18');
  });

  it('rolls over the year end', () => {
    // 2026-12-31 16:00 UTC is 2027-01-01 00:00 in Taipei.
    const instant = new Date('2026-12-31T16:00:00Z');

    assert.equal(taipeiDate(instant), '2027-01-01');
    assert.equal(utcDate(instant), '2026-12-31');
  });

  it('handles a leap day', () => {
    assert.equal(taipeiDate(new Date('2028-02-29T04:00:00Z')), '2028-02-29');
    // 2028-02-28 16:00 UTC is already 2028-02-29 in Taipei.
    assert.equal(taipeiDate(new Date('2028-02-28T16:00:00Z')), '2028-02-29');
  });

  it('zero-pads month and day', () => {
    assert.equal(taipeiDate(new Date('2026-01-05T04:00:00Z')), '2026-01-05');
  });

  /**
   * Host-independence: the formatter is constructed with an explicit
   * `timeZone`, so the host's local zone is never consulted. This test proves
   * the observable consequence — the same instant maps to a Taipei date that
   * differs from its UTC date — which cannot hold if the implementation had
   * fallen back to local or UTC time.
   */
  it('does not follow the host or UTC timezone', () => {
    const instant = new Date('2026-03-10T20:30:00Z');

    assert.equal(taipeiDate(instant), '2026-03-11');
    assert.notEqual(taipeiDate(instant), utcDate(instant));
  });

  it('is deterministic across calls', () => {
    const instant = new Date('2026-07-18T16:00:00Z');

    assert.equal(taipeiDate(instant), taipeiDate(instant));
  });

  it('rejects an invalid Date', () => {
    assert.throws(() => taipeiDate(new Date('not a date')), RangeError);
  });
});

describe('isCalendarDate', () => {
  for (const value of ['2026-07-18', '2026-01-01', '2026-12-31', '2028-02-29']) {
    it(`accepts ${value}`, () => {
      assert.equal(isCalendarDate(value), true);
    });
  }

  for (const [label, value] of [
    ['a day that does not exist', '2026-02-30'],
    ['a non-leap-year 29 February', '2026-02-29'],
    ['month 13', '2026-13-01'],
    ['month 00', '2026-00-10'],
    ['day 00', '2026-07-00'],
    ['day 32', '2026-07-32'],
    ['a two-digit year', '26-07-18'],
    ['an unpadded month', '2026-7-18'],
    ['an unpadded day', '2026-07-8'],
    ['slashes', '2026/07/18'],
    ['a trailing time', '2026-07-18T00:00:00Z'],
    ['surrounding whitespace', ' 2026-07-18'],
    ['an empty string', ''],
    ['a five-digit year', '12026-07-18'],
  ] as const) {
    it(`rejects ${label}`, () => {
      assert.equal(isCalendarDate(value), false);
    });
  }
});
