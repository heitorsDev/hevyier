import { seedDatabase } from "@/db/seed";
import { createPlan } from "@/repos/plansRepo";
import {
  assignPlanToDay,
  getPlanIdForDay,
  listWeekSchedule,
} from "@/repos/scheduleRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
  seedDatabase(fixture.db);
});
afterEach(() => fixture.close());

test("seed leaves 7 rest-day rows, Sunday (0) first", () => {
  const week = listWeekSchedule(fixture.db);

  expect(week.map((row) => row.dayOfWeek)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect(week.every((row) => row.planId === null)).toBe(true);
});

test("assigning and clearing a plan on a weekday", () => {
  const planId = createPlan(fixture.db, "Pull Day");

  assignPlanToDay(fixture.db, 3, planId);
  expect(getPlanIdForDay(fixture.db, 3)).toBe(planId);

  assignPlanToDay(fixture.db, 3, null);
  expect(getPlanIdForDay(fixture.db, 3)).toBeNull();
});

test("out-of-range day throws naming the value and expected shape", () => {
  expect(() => getPlanIdForDay(fixture.db, 7)).toThrow(
    /dayOfWeek is 7, expected integer 0–6/,
  );
  expect(() => assignPlanToDay(fixture.db, -1, null)).toThrow(/-1/);
});
