import { createExercise } from "@/repos/exercisesRepo";
import {
  addExerciseToPlan,
  createPlan,
  deletePlan,
  getPlan,
  listPlanExercises,
  listPlans,
  removeExerciseFromPlan,
  renamePlan,
  setPlanExerciseOrder,
  updatePlanExerciseSets,
} from "@/repos/plansRepo";
import { assignPlanToDay, getPlanIdForDay } from "@/repos/scheduleRepo";
import { getSession, startSession } from "@/repos/sessionsRepo";
import { seedDatabase } from "@/db/seed";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function createSquat(): number {
  return createExercise(fixture.db, {
    name: "Squat",
    equipment: "barbell",
    muscles: [{ group: "quads", subMuscle: "rectus_femoris" }],
  });
}

test("create, rename, list, get", () => {
  const id = createPlan(fixture.db, "Leg Day");
  renamePlan(fixture.db, id, "Lower Body");

  expect(getPlan(fixture.db, id)).toEqual({ id, name: "Lower Body" });
  expect(listPlans(fixture.db)).toHaveLength(1);
});

test("plan exercises: add, edit counts, reorder, remove, ordered list", () => {
  const planId = createPlan(fixture.db, "Leg Day");
  const squat = createSquat();
  const first = addExerciseToPlan(fixture.db, {
    planId,
    exerciseId: squat,
    order: 0,
    warmupSets: 2,
    workSets: 3,
  });
  const second = addExerciseToPlan(fixture.db, {
    planId,
    exerciseId: squat,
    order: 1,
    warmupSets: 0,
    workSets: 4,
  });

  updatePlanExerciseSets(fixture.db, first, { warmupSets: 1, workSets: 5 });
  // Swap rows: ordered listing must follow `order`, not insertion id.
  setPlanExerciseOrder(fixture.db, first, 2);

  const rows = listPlanExercises(fixture.db, planId);
  expect(rows.map((row) => row.id)).toEqual([second, first]);
  expect(rows[1]).toMatchObject({ warmupSets: 1, workSets: 5 });

  removeExerciseFromPlan(fixture.db, second);
  expect(listPlanExercises(fixture.db, planId)).toHaveLength(1);
});

test("delete plan cascades plan_exercises and nulls session + schedule refs", () => {
  seedDatabase(fixture.db); // schedule rows exist only after seeding
  const planId = createPlan(fixture.db, "Push Day");
  addExerciseToPlan(fixture.db, {
    planId,
    exerciseId: createSquat(),
    order: 0,
    warmupSets: 2,
    workSets: 3,
  });
  const sessionId = startSession(fixture.db, planId, 1_000);
  assignPlanToDay(fixture.db, 1, planId);

  deletePlan(fixture.db, planId);

  expect(getPlan(fixture.db, planId)).toBeUndefined();
  expect(listPlanExercises(fixture.db, planId)).toEqual([]);
  // FK SET NULL: history and the week grid survive the plan (decision #10).
  expect(getSession(fixture.db, sessionId)?.planId).toBeNull();
  expect(getPlanIdForDay(fixture.db, 1)).toBeNull();
});
