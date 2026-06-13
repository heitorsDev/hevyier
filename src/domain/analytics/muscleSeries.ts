// Pivots flat weekly muscle-volume rows into chart-ready series for the
// MUSCLE VOLUME section. Pure; the screen passes the fixed week-start axis
// so every group's bars align to the same 8 columns.

import type { MuscleGroup, SubMuscle } from "@/domain/muscles";

import type { MuscleWeekVolume } from "./muscleVolume";

export interface GroupSeries {
  group: MuscleGroup;
  totalKg: number;
  weekly: { x: number; y: number }[];
}

export interface SubMuscleSeries {
  subMuscle: SubMuscle;
  totalKg: number;
  weekly: { x: number; y: number }[];
}

/**
 * Per-group weekly totals across `weekStarts`, biggest total first. A group
 * with no volume in the window is omitted. Each weekly point sums every
 * sub-muscle of the group in that week (group bar = its sub-muscles' total).
 */
export function groupSeries(
  rows: MuscleWeekVolume[],
  weekStarts: number[],
): GroupSeries[] {
  const groups = new Set(rows.map((row) => row.group));
  const series = [...groups].map((group) => ({
    group,
    weekly: weeklyTotals(rows.filter((row) => row.group === group), weekStarts),
    totalKg: sumWhere(rows, (row) => row.group === group),
  }));
  return series.sort((a, b) => b.totalKg - a.totalKg);
}

/** Per-sub-muscle weekly series for one group, biggest total first. */
export function subMuscleSeries(
  rows: MuscleWeekVolume[],
  group: MuscleGroup,
  weekStarts: number[],
): SubMuscleSeries[] {
  const inGroup = rows.filter((row) => row.group === group);
  const subs = new Set(inGroup.map((row) => row.subMuscle));
  const series = [...subs].map((subMuscle) => ({
    subMuscle,
    weekly: weeklyTotals(inGroup.filter((row) => row.subMuscle === subMuscle), weekStarts),
    totalKg: sumWhere(inGroup, (row) => row.subMuscle === subMuscle),
  }));
  return series.sort((a, b) => b.totalKg - a.totalKg);
}

/** One {x: weekStart, y: volume} point per week, zero-filled for empty weeks. */
function weeklyTotals(
  rows: MuscleWeekVolume[],
  weekStarts: number[],
): { x: number; y: number }[] {
  return weekStarts.map((weekStart) => ({
    x: weekStart,
    y: sumWhere(rows, (row) => row.weekStart === weekStart),
  }));
}

function sumWhere(
  rows: MuscleWeekVolume[],
  keep: (row: MuscleWeekVolume) => boolean,
): number {
  return rows.filter(keep).reduce((total, row) => total + row.volumeKg, 0);
}
