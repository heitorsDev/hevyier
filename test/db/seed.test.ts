import { seedDatabase } from "@/db/seed";
import { SEED_EXERCISES } from "@/db/seedExercises";
import {
  listExercises,
  listMusclesForExercise,
} from "@/repos/exercisesRepo";
import { listWeekSchedule } from "@/repos/scheduleRepo";
import {
  getGlobalSetCount,
  getRestTimerSeconds,
  isSeeded,
} from "@/repos/settingsRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

test("seed writes settings defaults from the plan", () => {
  seedDatabase(fixture.db);

  expect(getGlobalSetCount(fixture.db, "warmup")).toBe(2);
  expect(getGlobalSetCount(fixture.db, "work")).toBe(3);
  expect(getRestTimerSeconds(fixture.db, "warmup")).toBe(60);
  expect(getRestTimerSeconds(fixture.db, "work")).toBe(150);
  expect(isSeeded(fixture.db)).toBe(true);
});

test("seed creates 7 rest days and the full exercise library", () => {
  seedDatabase(fixture.db);

  expect(listWeekSchedule(fixture.db)).toHaveLength(7);

  const seeded = listExercises(fixture.db);
  expect(seeded).toHaveLength(SEED_EXERCISES.length);
  // Every seeded exercise carries ≥1 muscle pair — required by the
  // exercise form's validation later (Phase 2).
  for (const exercise of seeded) {
    expect(
      listMusclesForExercise(fixture.db, exercise.id).length,
    ).toBeGreaterThan(0);
  }
});

test("seeding twice inserts once (idempotent)", () => {
  seedDatabase(fixture.db);
  seedDatabase(fixture.db);

  expect(listExercises(fixture.db)).toHaveLength(SEED_EXERCISES.length);
  expect(listWeekSchedule(fixture.db)).toHaveLength(7);
});
