import {
  getGlobalSetCount,
  getRestTimerSeconds,
  isSeeded,
  markSeeded,
  setGlobalSetCount,
  setRestTimerSeconds,
} from "@/repos/settingsRepo";

import { openInMemoryDb, type InMemoryDb } from "../helpers/inMemoryDb";

let fixture: InMemoryDb;
beforeEach(() => {
  fixture = openInMemoryDb();
});
afterEach(() => fixture.close());

test("rest timer seconds round-trip per set type", () => {
  setRestTimerSeconds(fixture.db, "warmup", 60);
  setRestTimerSeconds(fixture.db, "work", 150);

  expect(getRestTimerSeconds(fixture.db, "warmup")).toBe(60);
  expect(getRestTimerSeconds(fixture.db, "work")).toBe(150);
});

test("global set counts round-trip and overwrite on re-set", () => {
  setGlobalSetCount(fixture.db, "warmup", 2);
  setGlobalSetCount(fixture.db, "work", 3);
  setGlobalSetCount(fixture.db, "work", 5);

  expect(getGlobalSetCount(fixture.db, "warmup")).toBe(2);
  expect(getGlobalSetCount(fixture.db, "work")).toBe(5);
});

test("reading a missing setting throws naming the key", () => {
  expect(() => getRestTimerSeconds(fixture.db, "work")).toThrow(
    /rest_timer_work_seconds/,
  );
});

test("seeded flag flips once marked", () => {
  expect(isSeeded(fixture.db)).toBe(false);
  markSeeded(fixture.db);
  expect(isSeeded(fixture.db)).toBe(true);
});
