// Builds the CONSISTENCY heatmap grid: weeks as columns, weekdays as rows
// (Monday top). Pure — "now" passed in (react-hooks/purity rule).

import { mondayStartMs } from "./weeks";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** One day cell: its Monday-week column, weekday row (0=Mon..6=Sun), session flag. */
export interface HeatmapCell {
  weekIndex: number;
  weekday: number;
  hasSession: boolean;
}

/**
 * `weekCount` columns of 7 day-cells, oldest week first, ending with the
 * week of `nowMs`. A cell is filled when any session day key falls on it.
 *
 * Example: 26 weeks → 26×7 cells; cells whose day matches a `sessionDates`
 *   entry get `hasSession: true`.
 */
export function heatmapCells(
  sessionDates: number[],
  nowMs: number,
  weekCount: number,
): HeatmapCell[] {
  assertPositive(weekCount);
  const currentWeek = mondayStartMs(nowMs);
  const firstWeek = currentWeek - (weekCount - 1) * WEEK_MS;
  const performed = new Set(sessionDates.map(dayKey));
  return buildGrid(firstWeek, weekCount, performed);
}

function buildGrid(
  firstWeek: number,
  weekCount: number,
  performed: Set<number>,
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const day = firstWeek + weekIndex * WEEK_MS + weekday * DAY_MS;
      cells.push({ weekIndex, weekday, hasSession: performed.has(dayKey(day)) });
    }
  }
  return cells;
}

/** Local-midnight epoch ms of an instant — the day-equality key. */
function dayKey(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function assertPositive(weekCount: number): void {
  if (Number.isInteger(weekCount) && weekCount > 0) return;
  throw new Error(`weekCount is ${weekCount}, expected a positive integer`);
}
