// Consecutive Monday-week streak for an exercise, counting back from the
// current week. Pure — "now" is passed in (react-hooks/purity rule).

import { mondayStartMs, weeksBetween } from "./weeks";

/**
 * Number of consecutive Monday-weeks (ending with the current week) that
 * each contain at least one session of the exercise. Counts back from the
 * week of `nowMs`; stops at the first gap.
 *
 * `sessionDates` are epoch-ms session-day keys for sessions that logged
 * the exercise (any duplicates/extra dates are fine). A streak of 0 means
 * the exercise was not performed in the current week.
 *
 * Example: sessions in this week + last week, none before → 2.
 */
export function weeklyStreak(sessionDates: number[], nowMs: number): number {
  const performedWeeks = toWeekSet(sessionDates);
  const currentWeek = mondayStartMs(nowMs);
  let streak = 0;
  while (performedWeeks.has(currentWeek - streak * WEEK_MS)) streak += 1;
  return streak;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Distinct Monday-week starts the exercise was performed in. Built via
 * weeksBetween so DST-shifted spans still land on exact week boundaries.
 */
function toWeekSet(sessionDates: number[]): Set<number> {
  if (sessionDates.length === 0) return new Set();
  const weekStarts = sessionDates.map(mondayStartMs);
  const anchor = Math.min(...weekStarts);
  const aligned = weekStarts.map(
    (start) => anchor + weeksBetween(start, anchor) * WEEK_MS,
  );
  return new Set(aligned);
}
