import { createExercise } from "@/repos/exercisesRepo";
import { addExerciseToPlan, createPlan } from "@/repos/plansRepo";
import {
  addExerciseToSession,
  finishWorkout,
  findLastFinishedSession,
  listSessionExercises,
  pruneEmptySessionExercises,
  startSession,
  startSessionFromPlan,
  summarizeSession,
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

test("startSessionFromPlan copies plan exercises preserving order", () => {
  const planId = createPlan(fixture.db, "Push");
  const bench = makeExercise("Bench");
  const ohp = makeExercise("OHP");
  addExerciseToPlan(fixture.db, { planId, exerciseId: ohp, order: 1, warmupSets: 2, workSets: 3 });
  addExerciseToPlan(fixture.db, { planId, exerciseId: bench, order: 0, warmupSets: 1, workSets: 3 });

  const sessionId = startSessionFromPlan(fixture.db, planId, 1_000);

  expect(
    listSessionExercises(fixture.db, sessionId).map((row) => row.exerciseId),
  ).toEqual([bench, ohp]);
});

test("finishWorkout prunes empty exercises and stamps finishedAt", () => {
  const sessionId = startSession(fixture.db, null, 1_000);
  const logged = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId: makeExercise("Bench"),
    order: 0,
  });
  const empty = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId: makeExercise("OHP"),
    order: 1,
  });
  createSet(fixture.db, { sessionExerciseId: logged, type: "work", weightKg: 60, reps: 10, loggedAt: 1_500 });

  finishWorkout(fixture.db, sessionId, 5_000);

  const remaining = listSessionExercises(fixture.db, sessionId).map((r) => r.id);
  expect(remaining).toEqual([logged]);
  expect(remaining).not.toContain(empty);
  expect(findLastFinishedSession(fixture.db)?.id).toBe(sessionId);
});

test("pruneEmptySessionExercises keeps exercises that have sets", () => {
  const sessionId = startSession(fixture.db, null, 1_000);
  const kept = addExerciseToSession(fixture.db, { sessionId, exerciseId: makeExercise("Row"), order: 0 });
  createSet(fixture.db, { sessionExerciseId: kept, type: "warmup", weightKg: 20, reps: 12, loggedAt: 1_200 });

  pruneEmptySessionExercises(fixture.db, sessionId);

  expect(listSessionExercises(fixture.db, sessionId)).toHaveLength(1);
});

test("summarizeSession counts all sets but volumes work sets only", () => {
  const sessionId = startSession(fixture.db, null, 1_000);
  const se = addExerciseToSession(fixture.db, { sessionId, exerciseId: makeExercise("Squat"), order: 0 });
  createSet(fixture.db, { sessionExerciseId: se, type: "warmup", weightKg: 40, reps: 10, loggedAt: 1_100 });
  createSet(fixture.db, { sessionExerciseId: se, type: "work", weightKg: 100, reps: 5, loggedAt: 1_200 });
  createSet(fixture.db, { sessionExerciseId: se, type: "work", weightKg: 100, reps: 5, loggedAt: 1_300 });

  expect(summarizeSession(fixture.db, sessionId)).toEqual({
    totalSets: 3,
    workVolumeKg: 1_000,
  });
});

test("findLastFinishedSession ignores the active session", () => {
  const done = startSession(fixture.db, null, 1_000);
  finishWorkout(fixture.db, done, 2_000);
  startSession(fixture.db, null, 3_000); // active, unfinished

  expect(findLastFinishedSession(fixture.db)?.id).toBe(done);
});
