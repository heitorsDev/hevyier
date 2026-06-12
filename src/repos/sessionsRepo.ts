import { asc, count, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";

import type { DB } from "@/db/client";
import { planExercises, sessionExercises, sessions, sets } from "@/db/schema";

export type SessionRow = typeof sessions.$inferSelect;
export type SessionExerciseRow = typeof sessionExercises.$inferSelect;

export interface SessionSummary {
  totalSets: number;
  workVolumeKg: number;
}

/** planId null = freestyle session (decision #4). */
export function startSession(
  db: DB,
  planId: number | null,
  startedAt: number,
): number {
  const inserted = db
    .insert(sessions)
    .values({ planId, startedAt })
    .returning({ id: sessions.id })
    .get();
  return inserted.id;
}

/**
 * Begin a planned session: insert the session and copy the plan's
 * exercises into `session_exercises`, preserving order — all in one
 * transaction so a half-copied session can never exist (decision #4).
 * Plan-count snapshots stay in `plan_exercises`; the session only copies
 * the exercise list, never the counts.
 */
export function startSessionFromPlan(
  db: DB,
  planId: number,
  startedAt: number,
): number {
  return db.transaction((tx) => {
    const id = startSession(tx, planId, startedAt);
    const planRows = tx
      .select()
      .from(planExercises)
      .where(eq(planExercises.planId, planId))
      .orderBy(asc(planExercises.order))
      .all();
    for (const planRow of planRows) {
      addExerciseToSession(tx, {
        sessionId: id,
        exerciseId: planRow.exerciseId,
        order: planRow.order,
      });
    }
    return id;
  });
}

export function getSession(db: DB, id: number): SessionRow | undefined {
  return db.select().from(sessions).where(eq(sessions.id, id)).get();
}

export function listSessions(db: DB): SessionRow[] {
  return db.select().from(sessions).orderBy(desc(sessions.startedAt)).all();
}

/** Newest unfinished session — powers the Resume CTA (decision #3). */
export function findActiveSession(db: DB): SessionRow | undefined {
  return db
    .select()
    .from(sessions)
    .where(isNull(sessions.finishedAt))
    .orderBy(desc(sessions.startedAt))
    .limit(1)
    .get();
}

export function finishSession(db: DB, id: number, finishedAt: number): void {
  db.update(sessions).set({ finishedAt }).where(eq(sessions.id, id)).run();
}

/** Discard — FK cascade wipes session_exercises and their sets. */
export function deleteSession(db: DB, id: number): void {
  db.delete(sessions).where(eq(sessions.id, id)).run();
}

export function addExerciseToSession(
  db: DB,
  draft: { sessionId: number; exerciseId: number; order: number },
): number {
  const inserted = db
    .insert(sessionExercises)
    .values(draft)
    .returning({ id: sessionExercises.id })
    .get();
  return inserted.id;
}

export function listSessionExercises(
  db: DB,
  sessionId: number,
): SessionExerciseRow[] {
  return db
    .select()
    .from(sessionExercises)
    .where(eq(sessionExercises.sessionId, sessionId))
    .orderBy(asc(sessionExercises.order))
    .all();
}

export function removeSessionExercise(db: DB, sessionExerciseId: number): void {
  db.delete(sessionExercises)
    .where(eq(sessionExercises.id, sessionExerciseId))
    .run();
}

/**
 * Drop `session_exercises` that ended up with no logged sets — exercises
 * opened but never completed (decision #4). Reused on finish and when
 * leaving History edit mode (Phase 6).
 */
export function pruneEmptySessionExercises(db: DB, sessionId: number): void {
  const empties = db
    .select({ id: sessionExercises.id })
    .from(sessionExercises)
    .leftJoin(sets, eq(sets.sessionExerciseId, sessionExercises.id))
    .where(eq(sessionExercises.sessionId, sessionId))
    .groupBy(sessionExercises.id)
    .having(eq(count(sets.id), 0))
    .all();
  for (const row of empties) {
    removeSessionExercise(db, row.id);
  }
}

/**
 * Explicit Finish: prune empty exercises then stamp `finished_at`, in one
 * transaction so the session is never left half-pruned (decision #3).
 */
export function finishWorkout(db: DB, id: number, finishedAt: number): void {
  db.transaction((tx) => {
    pruneEmptySessionExercises(tx, id);
    finishSession(tx, id, finishedAt);
  });
}

/** Newest finished session — powers the Today footer + History. */
export function findLastFinishedSession(db: DB): SessionRow | undefined {
  return db
    .select()
    .from(sessions)
    .where(isNotNull(sessions.finishedAt))
    .orderBy(desc(sessions.startedAt))
    .limit(1)
    .get();
}

/**
 * Totals for a session footer/summary: every logged set counts toward
 * `totalSets`, but volume is work sets only (Σ weight×reps) — decision
 * #11, volume = work sets everywhere.
 *
 * Example: summarizeSession(db, id) → { totalSets: 12, workVolumeKg: 4250 }
 */
export function summarizeSession(db: DB, sessionId: number): SessionSummary {
  const row = db
    .select({
      totalSets: count(sets.id),
      workVolumeKg: sql<number>`coalesce(sum(case when ${sets.type} = 'work' then ${sets.weightKg} * ${sets.reps} else 0 end), 0)`,
    })
    .from(sets)
    .innerJoin(
      sessionExercises,
      eq(sets.sessionExerciseId, sessionExercises.id),
    )
    .where(eq(sessionExercises.sessionId, sessionId))
    .get();
  return {
    totalSets: row?.totalSets ?? 0,
    workVolumeKg: row?.workVolumeKg ?? 0,
  };
}
