import { asc, eq } from "drizzle-orm";

import type { DB } from "@/db/client";
import { planExercises, workoutPlans } from "@/db/schema";

export type PlanRow = typeof workoutPlans.$inferSelect;
export type PlanExerciseRow = typeof planExercises.$inferSelect;

export interface PlanExerciseDraft {
  planId: number;
  exerciseId: number;
  order: number;
  warmupSets: number;
  workSets: number;
}

export function createPlan(db: DB, name: string): number {
  const inserted = db
    .insert(workoutPlans)
    .values({ name })
    .returning({ id: workoutPlans.id })
    .get();
  return inserted.id;
}

export function renamePlan(db: DB, id: number, name: string): void {
  db.update(workoutPlans).set({ name }).where(eq(workoutPlans.id, id)).run();
}

export function getPlan(db: DB, id: number): PlanRow | undefined {
  return db.select().from(workoutPlans).where(eq(workoutPlans.id, id)).get();
}

export function listPlans(db: DB): PlanRow[] {
  return db.select().from(workoutPlans).orderBy(asc(workoutPlans.name)).all();
}

/**
 * Cascades plan_exercises away; sessions.plan_id and schedule.plan_id
 * are nulled by the FK actions, so history and the week grid survive.
 */
export function deletePlan(db: DB, id: number): void {
  db.delete(workoutPlans).where(eq(workoutPlans.id, id)).run();
}

export function addExerciseToPlan(db: DB, draft: PlanExerciseDraft): number {
  const inserted = db
    .insert(planExercises)
    .values(draft)
    .returning({ id: planExercises.id })
    .get();
  return inserted.id;
}

export function updatePlanExerciseSets(
  db: DB,
  planExerciseId: number,
  counts: { warmupSets: number; workSets: number },
): void {
  db.update(planExercises)
    .set(counts)
    .where(eq(planExercises.id, planExerciseId))
    .run();
}

export function setPlanExerciseOrder(
  db: DB,
  planExerciseId: number,
  order: number,
): void {
  db.update(planExercises)
    .set({ order })
    .where(eq(planExercises.id, planExerciseId))
    .run();
}

export function removeExerciseFromPlan(db: DB, planExerciseId: number): void {
  db.delete(planExercises).where(eq(planExercises.id, planExerciseId)).run();
}

export function listPlanExercises(db: DB, planId: number): PlanExerciseRow[] {
  return db
    .select()
    .from(planExercises)
    .where(eq(planExercises.planId, planId))
    .orderBy(asc(planExercises.order))
    .all();
}
