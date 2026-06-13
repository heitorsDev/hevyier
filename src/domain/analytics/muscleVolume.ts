// Weekly work-volume aggregated per targeted muscle pair, for the MUSCLE
// VOLUME section. Pure. Decision #13: full set volume is credited to EACH
// targeted (group, sub_muscle) pair — no splitting or weighting.

import type { MuscleGroup, SubMuscle } from "@/domain/muscles";

import type { AnalyticsSet, ExerciseMuscleMap } from "./types";
import { mondayStartMs } from "./weeks";

export interface MuscleWeekVolume {
  weekStart: number;
  group: MuscleGroup;
  subMuscle: SubMuscle;
  volumeKg: number;
}

/** A set tagged with the exercise that produced it, so we can find its pairs. */
export interface ExerciseSet extends AnalyticsSet {
  exerciseId: number;
}

/**
 * Work volume per (Monday week, group, sub_muscle). Each work set's full
 * Σ weight×reps is added to every pair its exercise targets (decision #13),
 * so a multi-muscle lift double-counts intentionally. Warmups excluded.
 *
 * Example: a 600kg bench set on an exercise tagging (chest, upper_chest)
 *   and (triceps, triceps_long_head) → 600 credited to BOTH pairs.
 */
export function weeklyVolumeByMuscle(
  sets: ExerciseSet[],
  muscleMaps: ExerciseMuscleMap[],
): MuscleWeekVolume[] {
  const pairsByExercise = indexPairs(muscleMaps);
  const totals = new Map<string, MuscleWeekVolume>();
  for (const set of sets) {
    if (set.type !== "work") continue;
    creditSet(set, pairsByExercise.get(set.exerciseId) ?? [], totals);
  }
  return [...totals.values()];
}

function indexPairs(
  muscleMaps: ExerciseMuscleMap[],
): Map<number, ExerciseMuscleMap["pairs"]> {
  const index = new Map<number, ExerciseMuscleMap["pairs"]>();
  for (const map of muscleMaps) index.set(map.exerciseId, map.pairs);
  return index;
}

/** Add one set's full volume to each targeted pair's week bucket. */
function creditSet(
  set: ExerciseSet,
  pairs: ExerciseMuscleMap["pairs"],
  totals: Map<string, MuscleWeekVolume>,
): void {
  const weekStart = mondayStartMs(set.sessionDate);
  const volume = set.weightKg * set.reps;
  for (const pair of pairs) {
    const key = `${weekStart}|${pair.group}|${pair.subMuscle}`;
    const bucket = totals.get(key);
    if (bucket) {
      bucket.volumeKg += volume;
      continue;
    }
    totals.set(key, {
      weekStart,
      group: pair.group,
      subMuscle: pair.subMuscle,
      volumeKg: volume,
    });
  }
}
