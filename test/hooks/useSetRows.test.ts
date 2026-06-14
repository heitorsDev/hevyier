import { act, renderHook } from "@testing-library/react-native";

import { createExercise } from "@/repos/exercisesRepo";
import { addExerciseToSession, startSession } from "@/repos/sessionsRepo";
import { listSetsForSessionExercise } from "@/repos/setsRepo";
import { useSetRows } from "@/hooks/useSetRows";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";
import type { DB } from "@/db/client";

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

test("uncheck pending row: commit is NOT called after nonce is invalidated", async () => {
  // onSetChecked receives the deferred commit fn from the hook — we capture
  // it to call later and verify the nonce guard blocks the DB insert.
  let capturedCommit: (() => void) | null = null;
  const onSetChecked = jest.fn(
    (_type: "warmup" | "work", _name: string, commit: () => void) => {
      capturedCommit = commit;
    },
  );

  const { result } = renderHook(() =>
    useSetRows(sessionId, sessionExerciseId, onSetChecked),
  );

  // No plan → no planned rows. Add a work set so there is a row to check.
  await act(async () => { result.current.addSet("work"); });

  // Give row 0 valid weight/reps so it passes isCheckable.
  await act(async () => { result.current.setWeight(0, 60); });
  await act(async () => { result.current.setReps(0, 10); });

  // Check row 0 — becomes pending; onSetChecked receives the commit fn.
  await act(async () => { result.current.toggleCheck(0); });
  expect(result.current.rows[0].isPending).toBe(true);
  expect(onSetChecked).toHaveBeenCalledTimes(1);
  expect(capturedCommit).not.toBeNull();

  // Immediately uncheck (tap again) — increments nonce, cancels pending.
  await act(async () => { result.current.toggleCheck(0); });
  expect(result.current.rows[0].isPending).toBe(false);

  // Calling the captured commit fn must now be a no-op (nonce mismatch).
  act(() => { capturedCommit!(); });

  const sets = listSetsForSessionExercise(fixture.db, sessionExerciseId);
  expect(sets).toHaveLength(0);
});
