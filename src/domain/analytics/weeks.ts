// Monday-week bucketing for analytics (decision #11: weeks start MONDAY).
// Pure — every "now" is passed in, never read from the clock, so these
// stay deterministic and unit-testable (react-hooks/purity rule).

const DAY_MS = 24 * 60 * 60 * 1000;

function assertEpochMs(ms: number): void {
  if (Number.isFinite(ms) && ms >= 0) return;
  throw new Error(
    `epoch ms is ${ms}, expected a non-negative finite millisecond timestamp`,
  );
}

/**
 * Epoch-ms of 00:00 local time on the Monday of the week containing `ms`.
 * JS `getDay()` is 0=Sunday…6=Saturday; we shift so Monday is the anchor
 * (Sunday counts as the *end* of the prior Monday-week).
 *
 * Example: a Wednesday → the preceding Monday's midnight.
 */
export function mondayStartMs(ms: number): number {
  assertEpochMs(ms);
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  const dayOfWeek = date.getDay();
  // Sunday (0) is 6 days after its Monday; Mon..Sat (1..6) are day-1.
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);
  return date.getTime();
}

/**
 * Whole Monday-weeks between two week-start instants, `later - earlier`.
 * Both inputs MUST already be `mondayStartMs` results. Crosses year
 * boundaries correctly because it counts elapsed days, not calendar weeks.
 *
 * Example: weeksBetween(monThisWeek, monThreeWeeksAgo) → 3
 */
export function weeksBetween(laterWeekStart: number, earlierWeekStart: number): number {
  assertEpochMs(laterWeekStart);
  assertEpochMs(earlierWeekStart);
  // Round: DST shifts a week-span by ±1h, never a half-week.
  return Math.round((laterWeekStart - earlierWeekStart) / (7 * DAY_MS));
}
