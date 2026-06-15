import { createExercise } from "@/repos/exercisesRepo";
import {
  addExerciseToSession,
  deleteEmptyUnfinishedSessions,
  deleteSession,
  findActiveSession,
  finishSession,
  getSession,
  listSessionExercises,
  listSessions,
  removeSessionExercise,
  startSession,
} from "@/repos/sessionsRepo";
import { createSet, listSetsForSessionExercise } from "@/repos/setsRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

function createRow(): number {
  return createExercise(fixture.db, {
    name: "Barbell Row",
    equipment: "barbell",
    muscles: [{ group: "back", subMuscle: "lats" }],
  });
}

test("start, finish, list newest-first", () => {
  const older = startSession(fixture.db, null, 1_000);
  const newer = startSession(fixture.db, null, 2_000);
  finishSession(fixture.db, older, 5_000);

  expect(getSession(fixture.db, older)?.finishedAt).toBe(5_000);
  expect(listSessions(fixture.db).map((row) => row.id)).toEqual([newer, older]);
});

test("findActiveSession returns newest unfinished, none when all done", () => {
  const first = startSession(fixture.db, null, 1_000);
  const second = startSession(fixture.db, null, 2_000);

  expect(findActiveSession(fixture.db)?.id).toBe(second);

  finishSession(fixture.db, first, 3_000);
  finishSession(fixture.db, second, 3_000);
  expect(findActiveSession(fixture.db)).toBeUndefined();
});

test("session exercises: add, ordered list, remove", () => {
  const sessionId = startSession(fixture.db, null, 1_000);
  const exerciseId = createRow();
  const second = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId,
    order: 1,
  });
  const first = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId,
    order: 0,
  });

  expect(
    listSessionExercises(fixture.db, sessionId).map((row) => row.id),
  ).toEqual([first, second]);

  removeSessionExercise(fixture.db, first);
  expect(listSessionExercises(fixture.db, sessionId)).toHaveLength(1);
});

test("deleteEmptyUnfinishedSessions removes drafts with no logged sets", () => {
  const empty = startSession(fixture.db, null, 1_000);
  addExerciseToSession(fixture.db, {
    sessionId: empty,
    exerciseId: createRow(),
    order: 0,
  });

  deleteEmptyUnfinishedSessions(fixture.db);

  expect(getSession(fixture.db, empty)).toBeUndefined();
});

test("deleteEmptyUnfinishedSessions removes a draft with no exercises", () => {
  const bare = startSession(fixture.db, null, 1_000);

  deleteEmptyUnfinishedSessions(fixture.db);

  expect(getSession(fixture.db, bare)).toBeUndefined();
});

test("deleteEmptyUnfinishedSessions keeps an unfinished session with a set", () => {
  const live = startSession(fixture.db, null, 1_000);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId: live,
    exerciseId: createRow(),
    order: 0,
  });
  createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 60,
    reps: 10,
    loggedAt: 1_500,
  });

  deleteEmptyUnfinishedSessions(fixture.db);

  expect(findActiveSession(fixture.db)?.id).toBe(live);
});

test("deleteEmptyUnfinishedSessions keeps a finished empty session", () => {
  const done = startSession(fixture.db, null, 1_000);
  finishSession(fixture.db, done, 2_000);

  deleteEmptyUnfinishedSessions(fixture.db);

  expect(getSession(fixture.db, done)?.finishedAt).toBe(2_000);
});

test("delete session cascades exercises and their sets", () => {
  const sessionId = startSession(fixture.db, null, 1_000);
  const sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId: createRow(),
    order: 0,
  });
  createSet(fixture.db, {
    sessionExerciseId,
    type: "work",
    weightKg: 60,
    reps: 10,
    loggedAt: 1_500,
  });

  deleteSession(fixture.db, sessionId);

  expect(getSession(fixture.db, sessionId)).toBeUndefined();
  expect(listSessionExercises(fixture.db, sessionId)).toEqual([]);
  expect(listSetsForSessionExercise(fixture.db, sessionExerciseId)).toEqual([]);
});
