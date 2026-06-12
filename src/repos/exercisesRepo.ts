import { asc, eq } from "drizzle-orm";

import type { DB } from "@/db/client";
import { exerciseMuscles, exercises } from "@/db/schema";
import type { MusclePair } from "@/domain/muscles";

export type ExerciseRow = typeof exercises.$inferSelect;

export interface ExerciseDraft {
  name: string;
  equipment: string;
  muscles: MusclePair[];
}

export function createExercise(db: DB, draft: ExerciseDraft): number {
  return db.transaction((tx) => {
    const inserted = tx
      .insert(exercises)
      .values({ name: draft.name, equipment: draft.equipment })
      .returning({ id: exercises.id })
      .get();
    insertMusclePairs(tx, inserted.id, draft.muscles);
    return inserted.id;
  });
}

export function updateExercise(db: DB, id: number, draft: ExerciseDraft): void {
  db.transaction((tx) => {
    tx.update(exercises)
      .set({ name: draft.name, equipment: draft.equipment })
      .where(eq(exercises.id, id))
      .run();
    // Delete-and-reinsert keeps muscle sync trivial; pair counts are tiny.
    tx.delete(exerciseMuscles).where(eq(exerciseMuscles.exerciseId, id)).run();
    insertMusclePairs(tx, id, draft.muscles);
  });
}

function insertMusclePairs(db: DB, exerciseId: number, pairs: MusclePair[]): void {
  if (pairs.length === 0) return;
  const rows = pairs.map((pair) => ({
    exerciseId,
    muscleGroup: pair.group,
    subMuscle: pair.subMuscle,
  }));
  db.insert(exerciseMuscles).values(rows).run();
}

export function getExercise(db: DB, id: number): ExerciseRow | undefined {
  return db.select().from(exercises).where(eq(exercises.id, id)).get();
}

/** Alphabetical library list; archived rows hidden unless requested. */
export function listExercises(
  db: DB,
  options: { includeArchived: boolean } = { includeArchived: false },
): ExerciseRow[] {
  const query = db.select().from(exercises).orderBy(asc(exercises.name));
  if (options.includeArchived) return query.all();
  return query.where(eq(exercises.archived, 0)).all();
}

export function listMusclesForExercise(db: DB, exerciseId: number): MusclePair[] {
  const rows = db
    .select()
    .from(exerciseMuscles)
    .where(eq(exerciseMuscles.exerciseId, exerciseId))
    .all();
  return rows.map((row) => ({ group: row.muscleGroup, subMuscle: row.subMuscle }));
}

/** Archive = hide from pickers, keep history (decision #10). Reversible. */
export function setExerciseArchived(db: DB, id: number, archived: boolean): void {
  db.update(exercises)
    .set({ archived: archived ? 1 : 0 })
    .where(eq(exercises.id, id))
    .run();
}

/**
 * Hard delete — only valid for exercises with zero logged history;
 * plan/session references make this throw via FK RESTRICT.
 */
export function deleteExercise(db: DB, id: number): void {
  db.delete(exercises).where(eq(exercises.id, id)).run();
}
