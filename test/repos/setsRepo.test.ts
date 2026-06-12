import { createExercise } from "@/repos/exercisesRepo";
import { addExerciseToSession, startSession } from "@/repos/sessionsRepo";
import {
  countSetsForExercise,
  createSet,
  deleteSet,
  listSetsForSessionExercise,
} from "@/repos/setsRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function createCurlSessionExercise(): {
  exerciseId: number;
  sessionExerciseId: number;
} {
  const exerciseId = createExercise(fixture.db, {
    name: "Dumbbell Curl",
    equipment: "dumbbell",
    muscles: [{ group: "biceps", subMuscle: "biceps_short_head" }],
  });
  const sessionId = startSession(fixture.db, null, 1_000);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId,
    order: 0,
  });
  return { exerciseId, sessionExerciseId };
}

test("create + list round-trips set values in insertion order", () => {
  const { sessionExerciseId } = createCurlSessionExercise();
  createSet(fixture.db, {
    sessionExerciseId,
    type: "warmup",
    weightKg: 8,
    reps: 15,
    loggedAt: 1_100,
  });
  createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 14,
    reps: 10,
    loggedAt: 1_200,
  });

  const rows = listSetsForSessionExercise(fixture.db, sessionExerciseId);
  expect(rows.map((row) => row.type)).toEqual(["warmup", "work"]);
  expect(rows[1]).toMatchObject({ weightKg: 14, reps: 10, loggedAt: 1_200 });
});

test("deleteSet removes only the un-✓'d row (decision #5)", () => {
  const { sessionExerciseId } = createCurlSessionExercise();
  const keep = createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 14,
    reps: 10,
    loggedAt: 1_100,
  });
  const undo = createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 14,
    reps: 8,
    loggedAt: 1_200,
  });

  deleteSet(fixture.db, undo);

  expect(
    listSetsForSessionExercise(fixture.db, sessionExerciseId).map((r) => r.id),
  ).toEqual([keep]);
});

test("countSetsForExercise spans sessions and ignores other exercises", () => {
  const curl = createCurlSessionExercise();
  const otherSession = startSession(fixture.db, null, 2_000);
  const curlAgain = addExerciseToSession(fixture.db, {
    sessionId: otherSession,
    exerciseId: curl.exerciseId,
    order: 0,
  });
  for (const sessionExerciseId of [curl.sessionExerciseId, curlAgain]) {
    createSet(fixture.db, {
      sessionExerciseId,
      type: "work",
      weightKg: 14,
      reps: 10,
      loggedAt: 2_100,
    });
  }

  expect(countSetsForExercise(fixture.db, curl.exerciseId)).toBe(2);

  const unrelated = createExercise(fixture.db, {
    name: "Plank",
    equipment: "bodyweight",
    muscles: [{ group: "abs", subMuscle: "upper_abs" }],
  });
  expect(countSetsForExercise(fixture.db, unrelated)).toBe(0);
});
