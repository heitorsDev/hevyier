import { asc, desc, eq, isNotNull, sql } from "drizzle-orm";

import type { DB } from "@/db/client";
import type { HistoryListItem } from "@/domain/historyList";
import type { LoggedSetView } from "@/repos/exerciseHistoryRepo";
import {
  exercises,
  sessionExercises,
  sessions,
  sets,
  workoutPlans,
} from "@/db/schema";

// One exercise block on the detail screen: which session_exercise it is
// (the logging screen edits by this id), its display name, and its sets.
export interface HistoryExerciseDetail {
  sessionExerciseId: number;
  exerciseId: number;
  name: string;
  sets: LoggedSetView[];
}

/**
 * Every finished session with its row totals, newest first — the History
 * tab list (decision #8). Active (unfinished) sessions are excluded via the
 * `finished_at IS NOT NULL` filter. Totals are aggregated in SQL: every set
 * counts toward `totalSets`, but volume is work sets only (decision #11).
 * `planName` is null for freestyle sessions or deleted plans (SET NULL).
 *
 * Example: listFinishedSessions(db) →
 *   [{ sessionId: 7, startedAt: …, finishedAt: …, planName: "PUSH",
 *      totalSets: 12, workVolumeKg: 4250 }]
 */
export function listFinishedSessions(db: DB): HistoryListItem[] {
  const rows = db
    .select({
      sessionId: sessions.id,
      startedAt: sessions.startedAt,
      finishedAt: sessions.finishedAt,
      planName: workoutPlans.name,
      totalSets: sql<number>`coalesce(count(${sets.id}), 0)`,
      workVolumeKg: sql<number>`coalesce(sum(case when ${sets.type} = 'work' then ${sets.weightKg} * ${sets.reps} else 0 end), 0)`,
    })
    .from(sessions)
    .leftJoin(workoutPlans, eq(sessions.planId, workoutPlans.id))
    .leftJoin(sessionExercises, eq(sessionExercises.sessionId, sessions.id))
    .leftJoin(sets, eq(sets.sessionExerciseId, sessionExercises.id))
    .where(isNotNull(sessions.finishedAt))
    .groupBy(sessions.id)
    .orderBy(desc(sessions.startedAt))
    .all();
  // finished_at is non-null here (filtered above); narrow the type.
  return rows.map((row) => ({ ...row, finishedAt: row.finishedAt as number }));
}

/**
 * Per-exercise set breakdown for one session's detail screen, in session
 * order. Empty session_exercises (zero sets) still appear — they are pruned
 * when leaving edit mode, not hidden here.
 */
export function listSessionExerciseDetails(
  db: DB,
  sessionId: number,
): HistoryExerciseDetail[] {
  const exerciseRows = db
    .select({
      sessionExerciseId: sessionExercises.id,
      exerciseId: sessionExercises.exerciseId,
      name: exercises.name,
    })
    .from(sessionExercises)
    .innerJoin(exercises, eq(exercises.id, sessionExercises.exerciseId))
    .where(eq(sessionExercises.sessionId, sessionId))
    .orderBy(asc(sessionExercises.order))
    .all();
  return exerciseRows.map((row) => ({
    ...row,
    sets: setsFor(db, row.sessionExerciseId),
  }));
}

/** Logged sets for one session_exercise, ordered as logged (by set id). */
function setsFor(db: DB, sessionExerciseId: number): LoggedSetView[] {
  return db
    .select({ type: sets.type, weightKg: sets.weightKg, reps: sets.reps })
    .from(sets)
    .where(eq(sets.sessionExerciseId, sessionExerciseId))
    .orderBy(asc(sets.id))
    .all();
}

/** Resolve a finished session's plan name, or null for freestyle/deleted. */
export function planNameForSession(
  db: DB,
  sessionId: number,
): string | null {
  const row = db
    .select({ planName: workoutPlans.name })
    .from(sessions)
    .leftJoin(workoutPlans, eq(sessions.planId, workoutPlans.id))
    .where(eq(sessions.id, sessionId))
    .get();
  return row?.planName ?? null;
}
