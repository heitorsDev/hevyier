import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

import type { DB } from "@/db/client";
import type { WeightReps } from "@/domain/overloadNudge";
import { sessionExercises, sessions, sets } from "@/db/schema";

export interface LoggedSetView {
  type: "warmup" | "work";
  weightKg: number;
  reps: number;
}

/**
 * Sets logged for `exerciseId` in the most recent *finished* session that
 * contained at least one of them — the greyed LAST SESSION reference
 * (decision #7). Ordered as logged; null when the exercise has no history.
 */
export function findLastSessionSetsForExercise(
  db: DB,
  exerciseId: number,
): LoggedSetView[] | null {
  const session = findFinishedSessionsWithExercise(db, exerciseId, 1)[0];
  if (session === undefined) return null;
  return setsForExerciseInSession(db, session.id, exerciseId);
}

/**
 * Work-set (weight, reps) lists from the last two finished sessions
 * containing `exerciseId`, most-recent first — the input to
 * `shouldNudge` (decision #7). Warmups are excluded.
 */
export function lastTwoWorkSetLists(
  db: DB,
  exerciseId: number,
): WeightReps[][] {
  const recent = findFinishedSessionsWithExercise(db, exerciseId, 2);
  return recent.map((session) =>
    setsForExerciseInSession(db, session.id, exerciseId)
      .filter((set) => set.type === "work")
      .map(({ weightKg, reps }) => ({ weightKg, reps })),
  );
}

/** Finished sessions holding ≥1 logged set of the exercise, newest first. */
function findFinishedSessionsWithExercise(
  db: DB,
  exerciseId: number,
  limit: number,
): { id: number }[] {
  return db
    .selectDistinct({ id: sessions.id, startedAt: sessions.startedAt })
    .from(sessions)
    .innerJoin(sessionExercises, eq(sessionExercises.sessionId, sessions.id))
    .innerJoin(sets, eq(sets.sessionExerciseId, sessionExercises.id))
    .where(
      and(
        isNotNull(sessions.finishedAt),
        eq(sessionExercises.exerciseId, exerciseId),
      ),
    )
    .orderBy(desc(sessions.startedAt))
    .limit(limit)
    .all();
}

/** Every set of `exerciseId` within one session, ordered as logged. */
function setsForExerciseInSession(
  db: DB,
  sessionId: number,
  exerciseId: number,
): LoggedSetView[] {
  return db
    .select({ type: sets.type, weightKg: sets.weightKg, reps: sets.reps })
    .from(sets)
    .innerJoin(
      sessionExercises,
      eq(sets.sessionExerciseId, sessionExercises.id),
    )
    .where(
      and(
        eq(sessionExercises.sessionId, sessionId),
        eq(sessionExercises.exerciseId, exerciseId),
      ),
    )
    .orderBy(asc(sets.id))
    .all();
}
