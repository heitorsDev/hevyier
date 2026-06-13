// Typed query-row shapes the analytics domain fns operate on. Repos shape
// SQL rows into these; the domain stays free of Drizzle/react-native.

import type { MuscleGroup, SubMuscle } from "@/domain/muscles";

/**
 * One logged set as analytics sees it. `sessionDate` is the session's
 * day key (epoch ms at local midnight of `sessions.started_at`), NOT the
 * set's own `logged_at` — analytics buckets by session date so sets added
 * while editing history still land on the original session day (Phase 6.3).
 */
export interface AnalyticsSet {
  setId: number;
  sessionId: number;
  sessionDate: number;
  type: "warmup" | "work";
  weightKg: number;
  reps: number;
}

/** Targeted (group, sub_muscle) pairs per exercise, for volume attribution. */
export interface ExerciseMuscleMap {
  exerciseId: number;
  pairs: { group: MuscleGroup; subMuscle: SubMuscle }[];
}

export interface MaxWeightPoint {
  sessionDate: number;
  maxKg: number;
}

export interface VolumePoint {
  sessionDate: number;
  volumeKg: number;
}
