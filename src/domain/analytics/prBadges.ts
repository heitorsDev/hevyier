// Personal-record badges for the EXERCISE section. Pure; over one
// exercise's full set history (work sets only — decision #11).
//
// TIE RULE: when two records match on the ranked metric, the EARLIEST
// wins — the first time you hit a number is the PR; matching it later
// does not reset the date. "Earliest" = lowest sessionDate, then lowest
// setId as a stable tiebreak within a day.

import type { AnalyticsSet } from "./types";

export interface SetRecord {
  sessionDate: number;
  weightKg: number;
  reps: number;
}

export interface SessionVolumeRecord {
  sessionDate: number;
  volumeKg: number;
}

export interface PrBadges {
  heaviestSet: SetRecord | null;
  mostRepsSet: SetRecord | null;
  highestVolumeSession: SessionVolumeRecord | null;
}

/**
 * The three PRs for an exercise. Null fields mean no work sets logged yet.
 *
 * Example: prBadges([{w100,r5},{w100,r8}]) → heaviest=earliest 100kg set,
 *   mostReps=8-rep set, highestVolume=that session's Σ.
 */
export function prBadges(sets: AnalyticsSet[]): PrBadges {
  const work = sets.filter((set) => set.type === "work");
  return {
    heaviestSet: bestSet(work, (set) => set.weightKg),
    mostRepsSet: bestSet(work, (set) => set.reps),
    highestVolumeSession: bestVolumeSession(work),
  };
}

/** Set maximising `metric`; ties broken toward the earliest occurrence. */
function bestSet(
  sets: AnalyticsSet[],
  metric: (set: AnalyticsSet) => number,
): SetRecord | null {
  let best: AnalyticsSet | null = null;
  for (const set of sets) {
    if (best === null || beats(set, best, metric(set), metric(best))) best = set;
  }
  return best === null ? null : toRecord(best);
}

/** Session with the highest work volume; earliest session wins ties. */
function bestVolumeSession(sets: AnalyticsSet[]): SessionVolumeRecord | null {
  const byDate = new Map<number, number>();
  for (const set of sets) {
    const prior = byDate.get(set.sessionDate) ?? 0;
    byDate.set(set.sessionDate, prior + set.weightKg * set.reps);
  }
  let best: SessionVolumeRecord | null = null;
  for (const [sessionDate, volumeKg] of byDate) {
    const beatsBest = best === null || volumeKg > best.volumeKg;
    const earlierTie = best !== null && volumeKg === best.volumeKg && sessionDate < best.sessionDate;
    if (beatsBest || earlierTie) best = { sessionDate, volumeKg };
  }
  return best;
}

/**
 * Does `candidate` (value `cv`) beat `current` (value `bv`)? Strictly
 * higher always wins; on an exact tie the earlier set wins (sessionDate,
 * then setId), so the incumbent is only replaced by something earlier.
 */
function beats(
  candidate: AnalyticsSet,
  current: AnalyticsSet,
  cv: number,
  bv: number,
): boolean {
  if (cv !== bv) return cv > bv;
  if (candidate.sessionDate !== current.sessionDate) {
    return candidate.sessionDate < current.sessionDate;
  }
  return candidate.setId < current.setId;
}

function toRecord(set: AnalyticsSet): SetRecord {
  return { sessionDate: set.sessionDate, weightKg: set.weightKg, reps: set.reps };
}
