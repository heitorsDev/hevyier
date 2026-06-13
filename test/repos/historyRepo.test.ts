import { createExercise } from "@/repos/exercisesRepo";
import {
  listFinishedSessions,
  listSessionExerciseDetails,
  planNameForSession,
} from "@/repos/historyRepo";
import { createPlan } from "@/repos/plansRepo";
import {
  addExerciseToSession,
  finishSession,
  listSessionExercises,
  pruneEmptySessionExercises,
  startSession,
} from "@/repos/sessionsRepo";
import { createSet, deleteSet, listSetsForSessionExercise } from "@/repos/setsRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function squat(): number {
  return createExercise(fixture.db, {
    name: "Squat",
    equipment: "barbell",
    muscles: [{ group: "quads", subMuscle: "rectus_femoris" }],
  });
}

/** A finished session with one exercise: 1 warmup + 2 work sets. */
function seedFinishedSession(planId: number | null): {
  sessionId: number;
  sessionExerciseId: number;
} {
  const sessionId = startSession(fixture.db, planId, 1_000);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId: squat(),
    order: 0,
  });
  createSet(fixture.db, { sessionExerciseId, type: "warmup", weightKg: 40, reps: 10, loggedAt: 1_100 });
  createSet(fixture.db, { sessionExerciseId, type: "work", weightKg: 100, reps: 5, loggedAt: 1_200 });
  createSet(fixture.db, { sessionExerciseId, type: "work", weightKg: 100, reps: 5, loggedAt: 1_300 });
  finishSession(fixture.db, sessionId, 151_000);
  return { sessionId, sessionExerciseId };
}

test("aggregates totalSets (all) and workVolumeKg (work only)", () => {
  const planId = createPlan(fixture.db, "Leg Day");
  seedFinishedSession(planId);

  const [row] = listFinishedSessions(fixture.db);

  expect(row.totalSets).toBe(3); // warmup + 2 work
  expect(row.workVolumeKg).toBe(1000); // 100*5 + 100*5, warmup excluded
  expect(row.planName).toBe("Leg Day");
  expect(row.finishedAt).toBe(151_000);
});

test("freestyle session reports null planName", () => {
  seedFinishedSession(null);
  expect(listFinishedSessions(fixture.db)[0].planName).toBeNull();
});

test("excludes active (unfinished) sessions, newest finished first", () => {
  const older = startSession(fixture.db, null, 1_000);
  finishSession(fixture.db, older, 2_000);
  const newer = startSession(fixture.db, null, 5_000);
  finishSession(fixture.db, newer, 6_000);
  startSession(fixture.db, null, 9_000); // active, must not appear

  expect(listFinishedSessions(fixture.db).map((r) => r.sessionId)).toEqual([newer, older]);
});

test("a finished session with no sets still lists with zero totals", () => {
  const sessionId = startSession(fixture.db, null, 1_000);
  finishSession(fixture.db, sessionId, 2_000);

  const [row] = listFinishedSessions(fixture.db);
  expect(row).toMatchObject({ sessionId, totalSets: 0, workVolumeKg: 0 });
});

test("detail lists each exercise with its sets in session order", () => {
  const { sessionId, sessionExerciseId } = seedFinishedSession(null);

  const details = listSessionExerciseDetails(fixture.db, sessionId);

  expect(details).toHaveLength(1);
  expect(details[0]).toMatchObject({ sessionExerciseId, name: "Squat" });
  expect(details[0].sets).toEqual([
    { type: "warmup", weightKg: 40, reps: 10 },
    { type: "work", weightKg: 100, reps: 5 },
    { type: "work", weightKg: 100, reps: 5 },
  ]);
});

test("planNameForSession resolves plan or null", () => {
  const planId = createPlan(fixture.db, "Leg Day");
  const planned = seedFinishedSession(planId).sessionId;
  const free = seedFinishedSession(null).sessionId;

  expect(planNameForSession(fixture.db, planned)).toBe("Leg Day");
  expect(planNameForSession(fixture.db, free)).toBeNull();
});

// Edit-mode cleanup reuses sessionsRepo.pruneEmptySessionExercises: when an
// edit deletes the last set of an exercise, that session_exercise must drop.
test("edit-mode prune removes a session_exercise emptied by an edit", () => {
  const { sessionId, sessionExerciseId } = seedFinishedSession(null);
  // Simulate an edit that un-checks every set of the exercise.
  for (const set of listSetsForSessionExercise(fixture.db, sessionExerciseId)) {
    deleteSet(fixture.db, set.id);
  }

  pruneEmptySessionExercises(fixture.db, sessionId);

  expect(listSessionExercises(fixture.db, sessionId)).toEqual([]);
  expect(listSessionExerciseDetails(fixture.db, sessionId)).toEqual([]);
});

test("prune keeps exercises that still have sets", () => {
  const { sessionId } = seedFinishedSession(null);
  pruneEmptySessionExercises(fixture.db, sessionId);
  expect(listSessionExerciseDetails(fixture.db, sessionId)).toHaveLength(1);
});
