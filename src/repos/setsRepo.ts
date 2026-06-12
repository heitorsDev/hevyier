import { asc, count, eq } from "drizzle-orm";

import type { DB } from "@/db/client";
import { sessionExercises, sets } from "@/db/schema";

export type SetRow = typeof sets.$inferSelect;

export interface SetDraft {
  sessionExerciseId: number;
  type: "warmup" | "work";
  weightKg: number;
  reps: number;
  loggedAt: number;
}

export function createSet(db: DB, draft: SetDraft): number {
  const inserted = db
    .insert(sets)
    .values(draft)
    .returning({ id: sets.id })
    .get();
  return inserted.id;
}

/** Un-✓ deletes the row; values live on in UI state (decision #5). */
export function deleteSet(db: DB, id: number): void {
  db.delete(sets).where(eq(sets.id, id)).run();
}

export function listSetsForSessionExercise(
  db: DB,
  sessionExerciseId: number,
): SetRow[] {
  return db
    .select()
    .from(sets)
    .where(eq(sets.sessionExerciseId, sessionExerciseId))
    .orderBy(asc(sets.id))
    .all();
}

/**
 * Logged-set count across all sessions — drives the archive-vs-delete
 * branch for exercises (decision #10).
 */
export function countSetsForExercise(db: DB, exerciseId: number): number {
  const row = db
    .select({ total: count() })
    .from(sets)
    .innerJoin(sessionExercises, eq(sets.sessionExerciseId, sessionExercises.id))
    .where(eq(sessionExercises.exerciseId, exerciseId))
    .get();
  return row?.total ?? 0;
}
