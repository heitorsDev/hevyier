// Per-exercise time series for the EXERCISE analytics section. Pure; input
// is already-typed work/warmup sets, one exercise's full history.

import type { AnalyticsSet, MaxWeightPoint, VolumePoint } from "./types";

/** Work sets only — volume is work sets everywhere (decision #11). */
function workSets(sets: AnalyticsSet[]): AnalyticsSet[] {
  return sets.filter((set) => set.type === "work");
}

/** Distinct session dates of `sets`, ascending. */
function sortedSessionDates(sets: AnalyticsSet[]): number[] {
  const dates = new Set(sets.map((set) => set.sessionDate));
  return [...dates].sort((a, b) => a - b);
}

/**
 * Heaviest work-set weight per session date, chronological — the
 * max-weight progression line.
 *
 * Example: maxWeightSeries([w100@day1, w105@day2]) → [{day1,100},{day2,105}]
 */
export function maxWeightSeries(sets: AnalyticsSet[]): MaxWeightPoint[] {
  const work = workSets(sets);
  return sortedSessionDates(work).map((sessionDate) => ({
    sessionDate,
    maxKg: Math.max(...sameDate(work, sessionDate).map((set) => set.weightKg)),
  }));
}

/**
 * Total work volume (Σ weight×reps) per session date, chronological — the
 * volume progression line.
 *
 * Example: volumeSeries([{w60,r10},{w60,r8}] same day) → [{date, 1080}]
 */
export function volumeSeries(sets: AnalyticsSet[]): VolumePoint[] {
  const work = workSets(sets);
  return sortedSessionDates(work).map((sessionDate) => ({
    sessionDate,
    volumeKg: sumVolume(sameDate(work, sessionDate)),
  }));
}

function sameDate(sets: AnalyticsSet[], sessionDate: number): AnalyticsSet[] {
  return sets.filter((set) => set.sessionDate === sessionDate);
}

function sumVolume(sets: AnalyticsSet[]): number {
  return sets.reduce((total, set) => total + set.weightKg * set.reps, 0);
}
