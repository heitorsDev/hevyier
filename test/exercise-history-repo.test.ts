import {
  findLastSessionSetsForExercise,
  lastTwoWorkSetLists,
} from "@/repos/exerciseHistoryRepo";
import { createExercise } from "@/repos/exercisesRepo";
import {
  addExerciseToSession,
  finishWorkout,
  startSession,
} from "@/repos/sessionsRepo";
import { createSet } from "@/repos/setsRepo";

import { openInMemoryDb, type InMemoryDb } from "./helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function makeExercise(name: string): number {
  return createExercise(fixture.db, {
    name,
    equipment: "barbell",
    muscles: [{ group: "chest", subMuscle: "mid_chest" }],
  });
}

interface WorkSet {
  weightKg: number;
  reps: number;
}

/** Log a finished session: one exercise, its warmup then work sets. */
function logSession(
  exerciseId: number,
  startedAt: number,
  warmups: WorkSet[],
  workSets: WorkSet[],
): void {
  const sessionId = startSession(fixture.db, null, startedAt);
  const seId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId,
    order: 0,
  });
  for (const set of warmups) {
    createSet(fixture.db, { sessionExerciseId: seId, type: "warmup", ...set, loggedAt: startedAt });
  }
  for (const set of workSets) {
    createSet(fixture.db, { sessionExerciseId: seId, type: "work", ...set, loggedAt: startedAt });
  }
  finishWorkout(fixture.db, sessionId, startedAt + 1);
}

test("findLastSessionSetsForExercise returns null with no history", () => {
  const bench = makeExercise("Bench");
  expect(findLastSessionSetsForExercise(fixture.db, bench)).toBeNull();
});

test("findLastSessionSetsForExercise returns newest finished session's sets in order", () => {
  const bench = makeExercise("Bench");
  logSession(bench, 1_000, [{ weightKg: 40, reps: 10 }], [{ weightKg: 90, reps: 5 }]);
  logSession(bench, 2_000, [{ weightKg: 60, reps: 10 }], [{ weightKg: 100, reps: 5 }]);

  expect(findLastSessionSetsForExercise(fixture.db, bench)).toEqual([
    { type: "warmup", weightKg: 60, reps: 10 },
    { type: "work", weightKg: 100, reps: 5 },
  ]);
});

test("findLastSessionSetsForExercise ignores active (unfinished) sessions", () => {
  const bench = makeExercise("Bench");
  logSession(bench, 1_000, [], [{ weightKg: 90, reps: 5 }]);
  const active = startSession(fixture.db, null, 5_000);
  const seId = addExerciseToSession(fixture.db, { sessionId: active, exerciseId: bench, order: 0 });
  createSet(fixture.db, { sessionExerciseId: seId, type: "work", weightKg: 200, reps: 1, loggedAt: 5_000 });

  const last = findLastSessionSetsForExercise(fixture.db, bench);
  expect(last).toEqual([{ type: "work", weightKg: 90, reps: 5 }]);
});

test("lastTwoWorkSetLists returns work sets of the two newest sessions, warmups excluded", () => {
  const bench = makeExercise("Bench");
  logSession(bench, 1_000, [{ weightKg: 40, reps: 10 }], [{ weightKg: 90, reps: 5 }]);
  logSession(bench, 2_000, [{ weightKg: 60, reps: 10 }], [{ weightKg: 100, reps: 5 }]);
  logSession(bench, 3_000, [{ weightKg: 60, reps: 10 }], [{ weightKg: 100, reps: 5 }]);

  expect(lastTwoWorkSetLists(fixture.db, bench)).toEqual([
    [{ weightKg: 100, reps: 5 }],
    [{ weightKg: 100, reps: 5 }],
  ]);
});

test("lastTwoWorkSetLists isolates one exercise from another in the same history", () => {
  const bench = makeExercise("Bench");
  const squat = makeExercise("Squat");
  logSession(bench, 1_000, [], [{ weightKg: 90, reps: 5 }]);
  logSession(squat, 2_000, [], [{ weightKg: 140, reps: 5 }]);

  expect(lastTwoWorkSetLists(fixture.db, bench)).toEqual([[{ weightKg: 90, reps: 5 }]]);
});
