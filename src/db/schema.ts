import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// All timestamps across the schema are integer epoch milliseconds —
// SQLite has no date type and ms epochs compare/sort without parsing.

// Key-value store for app settings; typed access lives in settingsRepo.
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  equipment: text("equipment").notNull(),
  // Exercises with logged sets are archived (hidden from pickers) instead
  // of deleted, keeping history intact — decision #10 in the plan.
  archived: integer("archived").notNull().default(0),
});

export const exerciseMuscles = sqliteTable("exercise_muscles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  muscleGroup: text("muscle_group").notNull(),
  subMuscle: text("sub_muscle").notNull(),
});

export const workoutPlans = sqliteTable("workout_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const planExercises = sqliteTable("plan_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id")
    .notNull()
    .references(() => workoutPlans.id, { onDelete: "cascade" }),
  // RESTRICT: an exercise referenced by a plan must be archived, not
  // deleted — deletion is only allowed when nothing points at it.
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").notNull(),
  warmupSets: integer("warmup_sets").notNull(),
  workSets: integer("work_sets").notNull(),
});

export const schedule = sqliteTable("schedule", {
  // 0 = Sunday … 6 = Saturday, matching JS `Date.getDay()` so lookups
  // need no remapping. Exactly 7 rows exist (seeded once).
  dayOfWeek: integer("day_of_week").primaryKey(),
  // NULL = rest day. Plan deletion clears assignments via SET NULL.
  planId: integer("plan_id").references(() => workoutPlans.id, {
    onDelete: "set null",
  }),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // NULL = freestyle session, or the originating plan was deleted
  // (SET NULL keeps history when plans go away — decision #10).
  planId: integer("plan_id").references(() => workoutPlans.id, {
    onDelete: "set null",
  }),
  startedAt: integer("started_at").notNull(),
  // NULL while the session is active; set by the explicit Finish action.
  finishedAt: integer("finished_at"),
});

export const sessionExercises = sqliteTable("session_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").notNull(),
});

export const sets = sqliteTable("sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionExerciseId: integer("session_exercise_id")
    .notNull()
    .references(() => sessionExercises.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["warmup", "work"] }).notNull(),
  weightKg: real("weight_kg").notNull(),
  reps: integer("reps").notNull(),
  loggedAt: integer("logged_at").notNull(),
});
