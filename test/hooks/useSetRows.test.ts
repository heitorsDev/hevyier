import { act, renderHook, type RenderHookResult } from "@testing-library/react-native";

import { createExercise } from "@/repos/exercisesRepo";
import { addExerciseToSession, startSession } from "@/repos/sessionsRepo";
import { listSetsForSessionExercise } from "@/repos/setsRepo";
import { useSetRows, type SetRowsController } from "@/hooks/useSetRows";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";
import type { DB } from "@/db/client";

type Rendered = RenderHookResult<SetRowsController, unknown>;

/** Add one work row and give it valid weight/reps so it passes isCheckable. */
async function addValidWorkRow(result: Rendered["result"]): Promise<void> {
  await act(async () => { result.current.addSet("work"); });
  await act(async () => { result.current.setWeight(0, 60); });
  await act(async () => { result.current.setReps(0, 10); });
}

// jest.mock is hoisted before imports, so the factory cannot close over
// module-level `let` variables unless they start with "mock" (case-insensitive).
// Use a `mockContainer` object whose `.db` reference is swapped in beforeEach.
const mockContainer: { db: DB | null } = { db: null };

jest.mock("@/db/bootstrap", () => ({
  get appDb() {
    return mockContainer.db;
  },
}));

let fixture: InMemoryDb;
let sessionId: number;
let sessionExerciseId: number;

beforeEach(() => {
  fixture = openInMemoryDb();
  mockContainer.db = fixture.db;

  const exerciseId = createExercise(fixture.db, {
    name: "Bench Press",
    equipment: "barbell",
    muscles: [{ group: "chest", subMuscle: "mid_chest" }],
  });
  sessionId = startSession(fixture.db, null, 1_000);
  sessionExerciseId = addExerciseToSession(fixture.db, {
    sessionId,
    exerciseId,
    order: 0,
  });
});

afterEach(() => fixture.close());

test("checking a valid row inserts the set into the DB immediately", async () => {
  const { result } = renderHook(() =>
    useSetRows(sessionId, sessionExerciseId, jest.fn()),
  );

  await addValidWorkRow(result);
  await act(async () => { result.current.toggleCheck(0); });

  const sets = listSetsForSessionExercise(fixture.db, sessionExerciseId);
  expect(sets).toHaveLength(1);
  expect(sets[0]).toMatchObject({ type: "work", weightKg: 60, reps: 10 });
  expect(result.current.rows[0].setId).toBe(sets[0].id);
});

test("onSetChecked fires with type + exercise name after a valid check", async () => {
  const onSetChecked = jest.fn();
  const { result } = renderHook(() =>
    useSetRows(sessionId, sessionExerciseId, onSetChecked),
  );

  await addValidWorkRow(result);
  await act(async () => { result.current.toggleCheck(0); });

  expect(onSetChecked).toHaveBeenCalledTimes(1);
  expect(onSetChecked).toHaveBeenCalledWith("work", "Bench Press");
});

test("checking a row with no reps inserts nothing and never notifies", async () => {
  const onSetChecked = jest.fn();
  const { result } = renderHook(() =>
    useSetRows(sessionId, sessionExerciseId, onSetChecked),
  );

  await act(async () => { result.current.addSet("work"); });
  await act(async () => { result.current.setWeight(0, 60); });
  // No reps → isCheckable false.
  await act(async () => { result.current.toggleCheck(0); });

  expect(listSetsForSessionExercise(fixture.db, sessionExerciseId)).toHaveLength(0);
  expect(result.current.rows[0].setId).toBeNull();
  expect(onSetChecked).not.toHaveBeenCalled();
});

test("unchecking a checked row deletes the set from the DB", async () => {
  const { result } = renderHook(() =>
    useSetRows(sessionId, sessionExerciseId, jest.fn()),
  );

  await addValidWorkRow(result);
  await act(async () => { result.current.toggleCheck(0); });
  expect(listSetsForSessionExercise(fixture.db, sessionExerciseId)).toHaveLength(1);

  await act(async () => { result.current.toggleCheck(0); });

  expect(listSetsForSessionExercise(fixture.db, sessionExerciseId)).toHaveLength(0);
  expect(result.current.rows[0].setId).toBeNull();
});

// Regression: the deferred-commit model silently dropped a set on a second
// tap (PR #2). With immediate persistence every tap is a real toggle, so a
// confused re-tap can only delete-then-reinsert — never lose the set.
test("re-checking after an uncheck re-inserts the set (toggle is lossless)", async () => {
  const { result } = renderHook(() =>
    useSetRows(sessionId, sessionExerciseId, jest.fn()),
  );

  await addValidWorkRow(result);
  await act(async () => { result.current.toggleCheck(0); }); // check  → 1
  await act(async () => { result.current.toggleCheck(0); }); // uncheck → 0
  await act(async () => { result.current.toggleCheck(0); }); // re-check → 1

  expect(listSetsForSessionExercise(fixture.db, sessionExerciseId)).toHaveLength(1);
  expect(result.current.rows[0].setId).not.toBeNull();
});
