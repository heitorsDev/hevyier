import { seedDatabase } from "@/db/seed";
import { createPlan } from "@/repos/plansRepo";
import {
  assignPlanToDay,
  getPlanIdForDay,
  listWeekSchedule,
} from "@/repos/scheduleRepo";
import {
  getGlobalSetCount,
  getRestTimerSeconds,
  setGlobalSetCount,
  setRestTimerSeconds,
} from "@/repos/settingsRepo";

import { openInMemoryDb, type InMemoryDb } from "./helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
  // Seed creates the 7 schedule rows assignPlanToDay updates in place.
  seedDatabase(fixture.db);
});
afterEach(() => fixture.close());

test("schedule assign and clear round-trips per weekday", () => {
  const planId = createPlan(fixture.db, "Push Day");

  assignPlanToDay(fixture.db, 1, planId);
  expect(getPlanIdForDay(fixture.db, 1)).toBe(planId);

  assignPlanToDay(fixture.db, 1, null);
  expect(getPlanIdForDay(fixture.db, 1)).toBeNull();
  expect(listWeekSchedule(fixture.db)).toHaveLength(7);
});

test("global set counts round-trip through typed accessors", () => {
  setGlobalSetCount(fixture.db, "warmup", 4);
  setGlobalSetCount(fixture.db, "work", 6);

  expect(getGlobalSetCount(fixture.db, "warmup")).toBe(4);
  expect(getGlobalSetCount(fixture.db, "work")).toBe(6);
});

test("rest timer seconds round-trip through typed accessors", () => {
  setRestTimerSeconds(fixture.db, "warmup", 45);
  setRestTimerSeconds(fixture.db, "work", 150);

  expect(getRestTimerSeconds(fixture.db, "warmup")).toBe(45);
  expect(getRestTimerSeconds(fixture.db, "work")).toBe(150);
});
