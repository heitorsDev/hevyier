import { asc, eq } from "drizzle-orm";

import type { DB } from "@/db/client";
import { schedule } from "@/db/schema";

export type ScheduleRow = typeof schedule.$inferSelect;

function assertDayOfWeek(dayOfWeek: number): void {
  if (Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6) return;
  throw new Error(
    `dayOfWeek is ${dayOfWeek}, expected integer 0–6 (0 = Sunday, JS Date.getDay())`,
  );
}

/** All 7 rows, Sunday (0) first — rows are seeded once and never deleted. */
export function listWeekSchedule(db: DB): ScheduleRow[] {
  return db.select().from(schedule).orderBy(asc(schedule.dayOfWeek)).all();
}

export function getPlanIdForDay(db: DB, dayOfWeek: number): number | null {
  assertDayOfWeek(dayOfWeek);
  const row = db
    .select()
    .from(schedule)
    .where(eq(schedule.dayOfWeek, dayOfWeek))
    .get();
  return row?.planId ?? null;
}

/** planId null = rest day. */
export function assignPlanToDay(
  db: DB,
  dayOfWeek: number,
  planId: number | null,
): void {
  assertDayOfWeek(dayOfWeek);
  db.update(schedule)
    .set({ planId })
    .where(eq(schedule.dayOfWeek, dayOfWeek))
    .run();
}
