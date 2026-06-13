import {
  weeklyVolumeByMuscle,
  type ExerciseSet,
} from "@/domain/analytics/muscleVolume";
import { mondayStartMs } from "@/domain/analytics/weeks";
import type { ExerciseMuscleMap } from "@/domain/analytics/types";

function local(y: number, m: number, d: number): number {
  return new Date(y, m - 1, d, 12).getTime();
}

function eset(over: Partial<ExerciseSet>): ExerciseSet {
  return {
    setId: 1,
    sessionId: 1,
    sessionDate: local(2026, 6, 10),
    exerciseId: 1,
    type: "work",
    weightKg: 60,
    reps: 10,
    ...over,
  };
}

const benchMap: ExerciseMuscleMap = {
  exerciseId: 1,
  pairs: [
    { group: "chest", subMuscle: "upper_chest" },
    { group: "triceps", subMuscle: "triceps_long_head" },
  ],
};

describe("weeklyVolumeByMuscle", () => {
  it("credits full set volume to EVERY targeted pair (decision #13)", () => {
    const result = weeklyVolumeByMuscle([eset({ weightKg: 60, reps: 10 })], [benchMap]);
    const week = mondayStartMs(local(2026, 6, 10));
    expect(result).toContainEqual({
      weekStart: week,
      group: "chest",
      subMuscle: "upper_chest",
      volumeKg: 600,
    });
    expect(result).toContainEqual({
      weekStart: week,
      group: "triceps",
      subMuscle: "triceps_long_head",
      volumeKg: 600,
    });
  });

  it("buckets sets into Monday weeks across a year boundary", () => {
    const sets = [
      eset({ setId: 1, sessionDate: local(2025, 12, 30), weightKg: 50, reps: 10 }),
      eset({ setId: 2, sessionDate: local(2026, 1, 6), weightKg: 100, reps: 10 }),
    ];
    const single: ExerciseMuscleMap = {
      exerciseId: 1,
      pairs: [{ group: "chest", subMuscle: "upper_chest" }],
    };
    const result = weeklyVolumeByMuscle(sets, [single]);
    // Dec 30 2025 → Mon Dec 29; Jan 6 2026 → Mon Jan 5 → two buckets.
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.volumeKg).sort((a, b) => a - b)).toEqual([500, 1_000]);
  });

  it("ignores warmups and unmapped exercises", () => {
    const sets = [
      eset({ setId: 1, type: "warmup", weightKg: 20, reps: 10 }),
      eset({ setId: 2, exerciseId: 99, weightKg: 100, reps: 10 }),
    ];
    expect(weeklyVolumeByMuscle(sets, [benchMap])).toEqual([]);
  });
});
