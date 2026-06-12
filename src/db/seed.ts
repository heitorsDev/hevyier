import type { DB } from "@/db/client";
import { schedule } from "@/db/schema";
import { SEED_EXERCISES } from "@/db/seedExercises";
import { createExercise } from "@/repos/exercisesRepo";
import {
  isSeeded,
  markSeeded,
  setGlobalSetCount,
  setRestTimerSeconds,
} from "@/repos/settingsRepo";

/**
 * One-time first-launch seed, guarded by settings.seeded = '1'.
 * Idempotent: calling again is a no-op. Runs in one transaction so a
 * crash mid-seed retries cleanly next launch.
 *
 * Example: seedDatabase(db) right after migrations succeed.
 */
export function seedDatabase(db: DB): void {
  if (isSeeded(db)) return;
  db.transaction((tx) => {
    insertDefaultSettings(tx);
    insertRestWeekSchedule(tx);
    insertSeedExercises(tx);
    markSeeded(tx);
  });
}

function insertDefaultSettings(db: DB): void {
  setGlobalSetCount(db, "warmup", 2);
  setGlobalSetCount(db, "work", 3);
  setRestTimerSeconds(db, "warmup", 60);
  setRestTimerSeconds(db, "work", 150);
}

// All 7 weekdays start unassigned (rest days); the Plans tab writes
// plan ids into these fixed rows later.
function insertRestWeekSchedule(db: DB): void {
  const restDays = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    planId: null,
  }));
  db.insert(schedule).values(restDays).run();
}

function insertSeedExercises(db: DB): void {
  for (const exercise of SEED_EXERCISES) {
    createExercise(db, exercise);
  }
}
