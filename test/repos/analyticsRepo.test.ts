import { createExercise } from "@/repos/exercisesRepo";
import {
  addExerciseToSession,
  finishSession,
  startSession,
} from "@/repos/sessionsRepo";
import { createSet } from "@/repos/setsRepo";
import {
  exerciseSetsSince,
  exercisesByRecency,
  finishedSessionDates,
  muscleMapsForExercises,
  sessionDatesForExercise,
  setsForExercise,
} from "@/repos/analyticsRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function makeBench(): number {
  return createExercise(fixture.db, {
    name: "Barbell Bench Press",
    equipment: "barbell",
    muscles: [
      { group: "chest", subMuscle: "upper_chest" },
      { group: "triceps", subMuscle: "triceps_long_head" },
    ],
  });
}

/** Finished session with one exercise + given work sets; returns sessionId. */
function loggedSession(
  exerciseId: number,
  startedAt: number,
  workSets: { weightKg: number; reps: number }[],
): number {
  const sessionId = startSession(fixture.db, null, startedAt);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId,
    order: 0,
  });
  for (const set of workSets) {
    createSet(fixture.db, {
      sessionExerciseId,
      type: "work",
      weightKg: set.weightKg,
      reps: set.reps,
      loggedAt: startedAt + 1,
    });
  }
  finishSession(fixture.db, sessionId, startedAt + 1_000);
  return sessionId;
}

test("setsForExercise carries the session date, not logged_at, oldest first", () => {
  const bench = makeBench();
  loggedSession(bench, 2_000, [{ weightKg: 100, reps: 5 }]);
  loggedSession(bench, 1_000, [{ weightKg: 80, reps: 5 }]);

  const rows = setsForExercise(fixture.db, bench);
  expect(rows.map((r) => r.sessionDate)).toEqual([2_000, 1_000]);
  expect(rows.map((r) => r.weightKg)).toEqual([100, 80]);
});

test("setsForExercise excludes unfinished sessions", () => {
  const bench = makeBench();
  const active = startSession(fixture.db, null, 5_000);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId: active,
    exerciseId: bench,
    order: 0,
  });
  createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 60,
    reps: 10,
    loggedAt: 5_100,
  });

  expect(setsForExercise(fixture.db, bench)).toEqual([]);
});

test("sessionDatesForExercise returns distinct finished-session dates", () => {
  const bench = makeBench();
  loggedSession(bench, 1_000, [
    { weightKg: 60, reps: 10 },
    { weightKg: 60, reps: 8 },
  ]);
  loggedSession(bench, 2_000, [{ weightKg: 65, reps: 8 }]);

  expect(sessionDatesForExercise(fixture.db, bench).sort()).toEqual([1_000, 2_000]);
});

test("finishedSessionDates lists every finished session start", () => {
  const bench = makeBench();
  loggedSession(bench, 1_000, [{ weightKg: 60, reps: 10 }]);
  loggedSession(bench, 2_000, [{ weightKg: 60, reps: 10 }]);
  startSession(fixture.db, null, 9_000); // unfinished, excluded

  expect(finishedSessionDates(fixture.db).sort()).toEqual([1_000, 2_000]);
});

test("exerciseSetsSince tags exercise and respects the start window", () => {
  const bench = makeBench();
  loggedSession(bench, 1_000, [{ weightKg: 60, reps: 10 }]);
  loggedSession(bench, 5_000, [{ weightKg: 80, reps: 5 }]);

  const recent = exerciseSetsSince(fixture.db, 2_000);
  expect(recent).toHaveLength(1);
  expect(recent[0]).toMatchObject({ exerciseId: bench, weightKg: 80, sessionDate: 5_000 });
});

test("muscleMapsForExercises groups every targeted pair per exercise", () => {
  const bench = makeBench();
  const maps = muscleMapsForExercises(fixture.db, [bench]);

  expect(maps).toHaveLength(1);
  expect(maps[0].pairs).toEqual(
    expect.arrayContaining([
      { group: "chest", subMuscle: "upper_chest" },
      { group: "triceps", subMuscle: "triceps_long_head" },
    ]),
  );
});

test("exercisesByRecency orders most-recent first and skips never-performed", () => {
  const bench = makeBench();
  const curl = createExercise(fixture.db, {
    name: "Dumbbell Curl",
    equipment: "dumbbell",
    muscles: [{ group: "biceps", subMuscle: "biceps_short_head" }],
  });
  createExercise(fixture.db, {
    name: "Never Done",
    equipment: "machine",
    muscles: [{ group: "abs", subMuscle: "upper_abs" }],
  });
  loggedSession(bench, 1_000, [{ weightKg: 60, reps: 10 }]);
  loggedSession(curl, 3_000, [{ weightKg: 14, reps: 12 }]);

  const recent = exercisesByRecency(fixture.db);
  expect(recent.map((e) => e.id)).toEqual([curl, bench]);
  expect(recent[0].lastPerformedAt).toBe(3_000);
});
