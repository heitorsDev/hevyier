import { validateExerciseForm } from "@/domain/exerciseForm";
import {
  createExercise,
  getExercise,
  listMusclesForExercise,
  setExerciseArchived,
} from "@/repos/exercisesRepo";
import { addExerciseToSession, startSession } from "@/repos/sessionsRepo";
import { countSetsForExercise, createSet } from "@/repos/setsRepo";

import { openInMemoryDb, type InMemoryDb } from "./helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

const ROW_FORM = {
  name: "  Row  ",
  equipment: "cable",
  muscles: [
    { group: "back", subMuscle: "lats" },
    { group: "biceps", subMuscle: "biceps_long_head" },
  ],
} as const;

test("valid form round-trips through createExercise and reloads its pairs", () => {
  const result = validateExerciseForm({ ...ROW_FORM, muscles: [...ROW_FORM.muscles] });
  expect(result.ok).toBe(true);
  if (!result.ok) return;

  const id = createExercise(fixture.db, result.draft);

  expect(getExercise(fixture.db, id)).toMatchObject({ name: "Row", equipment: "cable" });
  expect(listMusclesForExercise(fixture.db, id)).toEqual([
    { group: "back", subMuscle: "lats" },
    { group: "biceps", subMuscle: "biceps_long_head" },
  ]);
});

test("archive flag flips and persists", () => {
  const id = createExercise(fixture.db, {
    name: "Row",
    equipment: "cable",
    muscles: [{ group: "back", subMuscle: "lats" }],
  });

  setExerciseArchived(fixture.db, id, true);
  expect(getExercise(fixture.db, id)?.archived).toBe(1);
  setExerciseArchived(fixture.db, id, false);
  expect(getExercise(fixture.db, id)?.archived).toBe(0);
});

test("logged sets pick the ARCHIVE branch (countSetsForExercise > 0)", () => {
  const id = createExercise(fixture.db, {
    name: "Row",
    equipment: "cable",
    muscles: [{ group: "back", subMuscle: "lats" }],
  });
  const sessionId = startSession(fixture.db, null, 1_000);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId: id,
    order: 0,
  });
  createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 60,
    reps: 10,
    loggedAt: 1_100,
  });

  expect(countSetsForExercise(fixture.db, id) > 0).toBe(true);
});
