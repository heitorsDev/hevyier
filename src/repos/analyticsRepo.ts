import { and, asc, desc, eq, isNotNull, max, sql } from "drizzle-orm";

import type { DB } from "@/db/client";
import {
  exerciseMuscles,
  exercises,
  sessionExercises,
  sessions,
  sets,
} from "@/db/schema";
import type {
  AnalyticsSet,
  ExerciseMuscleMap,
} from "@/domain/analytics/types";
import type { ExerciseSet } from "@/domain/analytics/muscleVolume";

// Analytics keys off the SESSION date, not each set's `logged_at` — sets
// added while editing history must land on the original session day
// (Phase 6.3). `sessionDate` therefore carries `sessions.started_at`; the
// domain normalizes it to a day/week key.

/** Every logged set of one exercise across finished sessions, oldest set first. */
export function setsForExercise(db: DB, exerciseId: number): AnalyticsSet[] {
  return db
    .select({
      setId: sets.id,
      sessionId: sessions.id,
      sessionDate: sessions.startedAt,
      type: sets.type,
      weightKg: sets.weightKg,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(sessionExercises, eq(sets.sessionExerciseId, sessionExercises.id))
    .innerJoin(sessions, eq(sessionExercises.sessionId, sessions.id))
    .where(
      and(
        isNotNull(sessions.finishedAt),
        eq(sessionExercises.exerciseId, exerciseId),
      ),
    )
    .orderBy(asc(sets.id))
    .all();
}

/** Day keys of finished sessions that logged `exerciseId` — drives streak. */
export function sessionDatesForExercise(db: DB, exerciseId: number): number[] {
  const rows = db
    .selectDistinct({ sessionDate: sessions.startedAt })
    .from(sessions)
    .innerJoin(sessionExercises, eq(sessionExercises.sessionId, sessions.id))
    .where(
      and(
        isNotNull(sessions.finishedAt),
        eq(sessionExercises.exerciseId, exerciseId),
      ),
    )
    .all();
  return rows.map((row) => row.sessionDate);
}

/** Start instants of every finished session — drives the consistency heatmap. */
export function finishedSessionDates(db: DB): number[] {
  return db
    .select({ startedAt: sessions.startedAt })
    .from(sessions)
    .where(isNotNull(sessions.finishedAt))
    .all()
    .map((row) => row.startedAt);
}

/**
 * Every finished-session work/warmup set tagged with its exercise — the
 * input to weekly muscle-volume attribution. Filtered to a start instant
 * so the screen only pulls the recent window it charts.
 */
export function exerciseSetsSince(db: DB, sinceMs: number): ExerciseSet[] {
  return db
    .select({
      setId: sets.id,
      sessionId: sessions.id,
      sessionDate: sessions.startedAt,
      exerciseId: sessionExercises.exerciseId,
      type: sets.type,
      weightKg: sets.weightKg,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(sessionExercises, eq(sets.sessionExerciseId, sessionExercises.id))
    .innerJoin(sessions, eq(sessionExercises.sessionId, sessions.id))
    .where(and(isNotNull(sessions.finishedAt), sql`${sessions.startedAt} >= ${sinceMs}`))
    .all();
}

/** (group, sub_muscle) pairs for the given exercise ids — volume attribution map. */
export function muscleMapsForExercises(
  db: DB,
  exerciseIds: number[],
): ExerciseMuscleMap[] {
  if (exerciseIds.length === 0) return [];
  const rows = db
    .select({
      exerciseId: exerciseMuscles.exerciseId,
      group: exerciseMuscles.muscleGroup,
      subMuscle: exerciseMuscles.subMuscle,
    })
    .from(exerciseMuscles)
    .all();
  return groupPairsByExercise(rows.filter((row) => exerciseIds.includes(row.exerciseId)));
}

function groupPairsByExercise(
  rows: { exerciseId: number; group: ExerciseMuscleMap["pairs"][number]["group"]; subMuscle: ExerciseMuscleMap["pairs"][number]["subMuscle"] }[],
): ExerciseMuscleMap[] {
  const byExercise = new Map<number, ExerciseMuscleMap["pairs"]>();
  for (const row of rows) {
    const pairs = byExercise.get(row.exerciseId) ?? [];
    pairs.push({ group: row.group, subMuscle: row.subMuscle });
    byExercise.set(row.exerciseId, pairs);
  }
  return [...byExercise.entries()].map(([exerciseId, pairs]) => ({ exerciseId, pairs }));
}

export interface PerformedExercise {
  id: number;
  name: string;
  lastPerformedAt: number;
}

/**
 * Exercises with ≥1 logged set in a finished session, most-recently
 * performed first — the EXERCISE picker order (recent first). Archived
 * exercises are kept (history/analytics still surface them, decision #10).
 */
export function exercisesByRecency(db: DB): PerformedExercise[] {
  return db
    .select({
      id: exercises.id,
      name: exercises.name,
      lastPerformedAt: max(sessions.startedAt),
    })
    .from(exercises)
    .innerJoin(sessionExercises, eq(sessionExercises.exerciseId, exercises.id))
    .innerJoin(sets, eq(sets.sessionExerciseId, sessionExercises.id))
    .innerJoin(sessions, eq(sessionExercises.sessionId, sessions.id))
    .where(isNotNull(sessions.finishedAt))
    .groupBy(exercises.id)
    .orderBy(desc(max(sessions.startedAt)))
    .all()
    .map((row) => ({ id: row.id, name: row.name, lastPerformedAt: row.lastPerformedAt ?? 0 }));
}
