import { asc, desc, eq, isNull } from "drizzle-orm";

import type { DB } from "@/db/client";
import { sessionExercises, sessions } from "@/db/schema";

export type SessionRow = typeof sessions.$inferSelect;
export type SessionExerciseRow = typeof sessionExercises.$inferSelect;

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
