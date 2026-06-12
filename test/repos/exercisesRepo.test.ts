import {
  createExercise,
  deleteExercise,
  getExercise,
  listExercises,
  listMusclesForExercise,
  setExerciseArchived,
  updateExercise,
} from "@/repos/exercisesRepo";
import { addExerciseToPlan, createPlan } from "@/repos/plansRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function createBenchPress(): number {
  return createExercise(fixture.db, {
    name: "Bench Press",
    equipment: "barbell",
    muscles: [
      { group: "chest", subMuscle: "mid_chest" },
      { group: "triceps", subMuscle: "triceps_lateral_head" },
    ],
  });
}

test("create + get round-trips exercise with muscle pairs", () => {
  const id = createBenchPress();

  expect(getExercise(fixture.db, id)).toEqual({
    id,
    name: "Bench Press",
    equipment: "barbell",
    archived: 0,
  });
  expect(listMusclesForExercise(fixture.db, id)).toEqual([
    { group: "chest", subMuscle: "mid_chest" },
    { group: "triceps", subMuscle: "triceps_lateral_head" },
  ]);
});

test("update replaces name, equipment and muscle pairs", () => {
  const id = createBenchPress();

  updateExercise(fixture.db, id, {
    name: "Close-Grip Bench",
    equipment: "barbell",
    muscles: [{ group: "triceps", subMuscle: "triceps_medial_head" }],
  });

  expect(getExercise(fixture.db, id)?.name).toBe("Close-Grip Bench");
  expect(listMusclesForExercise(fixture.db, id)).toEqual([
    { group: "triceps", subMuscle: "triceps_medial_head" },
  ]);
});

test("list is alphabetical and hides archived unless asked", () => {
  const bench = createBenchPress();
  createExercise(fixture.db, {
    name: "Arnold Press",
    equipment: "dumbbell",
    muscles: [{ group: "shoulders", subMuscle: "front_delts" }],
  });
  setExerciseArchived(fixture.db, bench, true);

  expect(listExercises(fixture.db).map((row) => row.name)).toEqual([
    "Arnold Press",
  ]);
  expect(
    listExercises(fixture.db, { includeArchived: true }).map((r) => r.name),
  ).toEqual(["Arnold Press", "Bench Press"]);
});

test("delete removes exercise and cascades its muscle pairs", () => {
  const id = createBenchPress();

  deleteExercise(fixture.db, id);

  expect(getExercise(fixture.db, id)).toBeUndefined();
  expect(listMusclesForExercise(fixture.db, id)).toEqual([]);
});

test("delete is RESTRICTed while a plan references the exercise", () => {
  const exerciseId = createBenchPress();
  const planId = createPlan(fixture.db, "Push Day");
  addExerciseToPlan(fixture.db, {
    planId,
    exerciseId,
    order: 0,
    warmupSets: 2,
    workSets: 3,
  });

  expect(() => deleteExercise(fixture.db, exerciseId)).toThrow(/FOREIGN KEY/i);
});
