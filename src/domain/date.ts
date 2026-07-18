/**
 * Calendar date logic — pure functions, no clock of their own.
 *
 * The system runs on Taiwan time, always (docs/architecture.md §11). The
 * timezone is a constant here, never an environment variable, and the host's
 * local timezone is never consulted: GitHub Actions runs in UTC, so "today"
 * must be computed explicitly in `Asia/Taipei`.
 *
 * The instant is always supplied by the caller. Nothing in this module reads the
 * current time, at import or otherwise.
 */

/** Taiwan observes no daylight saving, so this is UTC+8 year-round. */
export const TIMEZONE = 'Asia/Taipei';

/** Strict `YYYY-MM-DD`. Deliberately not lenient about width or separators. */
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Built once and reused. It captures the timezone, never a point in time, so it
 * stays deterministic across calls.
 */
const taipeiParts = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * The `Asia/Taipei` calendar date of a given instant, as `YYYY-MM-DD`.
 *
 * @param instant The point in time to convert, supplied by the caller.
 * @throws {RangeError} If the instant is an invalid Date.
 */
export function taipeiDate(instant: Date): string {
  // Assembled from parts rather than from a formatted string, so the output
  // never depends on how a locale happens to order or punctuate a date.
  const parts = taipeiParts.formatToParts(instant);
  const year = partValue(parts, 'year');
  const month = partValue(parts, 'month');
  const day = partValue(parts, 'day');

  return `${year}-${month}-${day}`;
}

/**
 * Whether a string is a strictly formatted, really existing calendar date.
 *
 * Format alone is not enough: `2026-02-30` matches the pattern but is not a day
 * that exists, so it is rejected.
 */
export function isCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (match === null) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Round-trip through UTC: a date that does not exist normalizes to a
  // different one (2026-02-30 becomes 2026-03-02), which the comparison catches.
  const utc = new Date(Date.UTC(year, month - 1, day));

  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

function partValue(parts: Intl.DateTimeFormatPart[], type: string): string {
  const part = parts.find((candidate) => candidate.type === type);
  if (part === undefined) {
    throw new Error(`Intl.DateTimeFormat did not produce a "${type}" part.`);
  }
  return part.value;
}
