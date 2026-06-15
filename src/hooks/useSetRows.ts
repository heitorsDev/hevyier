import { useRef, useState } from "react";

import { appDb } from "@/db/bootstrap";
import {
  appendBlankSet,
  applyWeightDelta,
  buildSetRows,
  type SetRowState,
} from "@/domain/setRows";
import { getExercise } from "@/repos/exercisesRepo";
import { listPlanExercises } from "@/repos/plansRepo";
import {
  createSet,
  deleteSet,
  listSetsForSessionExercise,
} from "@/repos/setsRepo";
import { getSession, listSessionExercises } from "@/repos/sessionsRepo";

export interface SetRowsController {
  exerciseName: string;
  rows: SetRowState[];
  activeIndex: number;
  selectRow: (index: number) => void;
  setWeight: (index: number, kg: number) => void;
  setReps: (index: number, reps: number) => void;
  nudgeActiveWeight: (deltaKg: number) => void;
  toggleCheck: (index: number) => void;
  addSet: (type: "warmup" | "work") => void;
  flushUnsaved: () => void;
}

interface InitialState {
  exerciseName: string;
  rows: SetRowState[];
  activeIndex: number;
}

/**
 * Owns the logging screen's editable row state for one session_exercise.
 * Builds rows once (lazy init) from plan counts + already-logged sets so
 * re-renders never clobber in-progress edits; ✓ inserts the `sets` row
 * immediately and un-✓ deletes it (decision #5), while weight/reps live in
 * state until checked.
 *
 * `onSetChecked` fires after a set is checked and persisted, so the caller
 * can start the rest timer. Undefined in History edit mode so finished
 * sessions never start a timer.
 */
export function useSetRows(
  sessionId: number,
  sessionExerciseId: number,
  onSetChecked?: (type: "warmup" | "work", exerciseName: string) => void,
): SetRowsController {
  const [initial] = useState<InitialState>(() =>
    loadInitialState(sessionId, sessionExerciseId),
  );
  const [rows, setRows] = useState<SetRowState[]>(initial.rows);
  const [activeIndex, setActiveIndex] = useState<number>(initial.activeIndex);
  // Source of truth for reads inside event handlers. React state lags by a
  // render, and native touches queue: tapping reps/weight then ✓ in the same
  // frame would otherwise check against pre-update rows and drop the set
  // (#7 follow-up). The ref is written synchronously by every mutator, so ✓
  // always sees the freshest weight/reps regardless of render timing.
  const rowsRef = useRef<SetRowState[]>(rows);
  const mutate = (update: (prev: SetRowState[]) => SetRowState[]) => {
    const next = update(rowsRef.current);
    rowsRef.current = next;
    setRows(next);
  };
  const notifyChecked = onSetChecked
    ? (type: "warmup" | "work") => onSetChecked(type, initial.exerciseName)
    : undefined;

  const setWeight = (index: number, kg: number) =>
    mutate((prev) => patchRow(prev, index, (row) => ({ ...row, weightKg: kg })));
  const setReps = (index: number, reps: number) =>
    mutate((prev) => patchRow(prev, index, (row) => ({ ...row, reps })));
  const nudgeActiveWeight = (deltaKg: number) =>
    mutate((prev) =>
      patchRow(prev, activeIndex, (row) => ({
        ...row,
        weightKg: applyWeightDelta(row.weightKg, deltaKg),
      })),
    );

  const toggleCheck = (index: number) =>
    handleToggle(sessionExerciseId, rowsRef.current, index, mutate, setActiveIndex, notifyChecked);
  const addSet = (type: "warmup" | "work") =>
    mutate((prev) => appendBlankSet(prev, type));
  const flushUnsaved = () =>
    flushUnsavedRows(sessionExerciseId, rowsRef.current, mutate);

  return {
    exerciseName: initial.exerciseName,
    rows,
    activeIndex,
    selectRow: setActiveIndex,
    setWeight,
    setReps,
    nudgeActiveWeight,
    toggleCheck,
    addSet,
    flushUnsaved,
  };
}

/** Read DB once: exercise name, plan counts, existing sets → initial rows. */
function loadInitialState(
  sessionId: number,
  sessionExerciseId: number,
): InitialState {
  const session = getSession(appDb, sessionId);
  const se = listSessionExercises(appDb, sessionId).find(
    (row) => row.id === sessionExerciseId,
  );
  const exerciseName = se ? getExercise(appDb, se.exerciseId)?.name ?? "?" : "?";
  const { warmup, work } = plannedCounts(session?.planId ?? null, se?.exerciseId);
  const existing = listSetsForSessionExercise(appDb, sessionExerciseId);
  const rows = buildSetRows(warmup, work, existing);
  return { exerciseName, rows, activeIndex: firstBlankIndex(rows) };
}

/** Plan warmup/work counts for this exercise; freestyle/no-match → 0/0. */
function plannedCounts(
  planId: number | null,
  exerciseId: number | undefined,
): { warmup: number; work: number } {
  if (planId === null || exerciseId === undefined) return { warmup: 0, work: 0 };
  const match = listPlanExercises(appDb, planId).find(
    (pe) => pe.exerciseId === exerciseId,
  );
  if (!match) return { warmup: 0, work: 0 };
  return { warmup: match.warmupSets, work: match.workSets };
}

/** First blank (unchecked) row index, else 0. */
function firstBlankIndex(rows: SetRowState[]): number {
  const index = rows.findIndex((row) => row.setId === null);
  return index === -1 ? 0 : index;
}

/** ✓ toggle: a checked row un-checks (deletes); a blank valid row checks. */
function handleToggle(
  sessionExerciseId: number,
  rows: SetRowState[],
  index: number,
  mutate: MutateRows,
  setActiveIndex: (index: number) => void,
  onChecked: ((type: "warmup" | "work") => void) | undefined,
): void {
  const row = rows[index];
  if (row.setId !== null) {
    uncheckRow(mutate, index, row.setId);
    return;
  }
  checkRow(sessionExerciseId, rows, index, mutate, setActiveIndex, onChecked);
}

/** Un-check committed set: delete from DB; weight/reps stay (decision #5). */
function uncheckRow(mutate: MutateRows, index: number, setId: number): void {
  deleteSet(appDb, setId);
  mutate((prev) => patchRow(prev, index, (row) => ({ ...row, setId: null })));
}

/**
 * Check: validate, insert the `sets` row immediately (decision #5), fill its
 * setId, advance the active row, then notify so the caller can start the rest
 * timer. Persistence never depends on the timer — a killed app keeps the set.
 */
function checkRow(
  sessionExerciseId: number,
  rows: SetRowState[],
  index: number,
  mutate: MutateRows,
  setActiveIndex: (index: number) => void,
  onChecked: ((type: "warmup" | "work") => void) | undefined,
): void {
  const row = rows[index];
  if (!isCheckable(row)) return;

  const id = persistRow(sessionExerciseId, row);
  mutate((prev) => patchRow(prev, index, (current) => ({ ...current, setId: id })));
  setActiveIndex(nextBlankIndex(rows, index));
  onChecked?.(row.type);
}

/**
 * Safety net for the OK/✓ flow: on screen blur/unmount, persist every row
 * the lifter filled in but never checked. The user's loss bug was entered
 * sets vanishing on navigation when the ✓ press didn't commit; flushing here
 * makes that loss impossible. No timer, no active-row advance — we're leaving.
 * Already-checked (setId set) and incomplete (failed isCheckable) rows are
 * skipped, so a flush can never double-insert or write a partial set.
 */
function flushUnsavedRows(
  sessionExerciseId: number,
  rows: SetRowState[],
  mutate: MutateRows,
): void {
  rows.forEach((row, index) => {
    if (row.setId !== null || !isCheckable(row)) return;
    const id = persistRow(sessionExerciseId, row);
    mutate((prev) => patchRow(prev, index, (current) => ({ ...current, setId: id })));
  });
}

/** Insert a validated row's values as a `sets` row; returns the new id. */
function persistRow(sessionExerciseId: number, row: SetRowState): number {
  return createSet(appDb, {
    sessionExerciseId,
    type: row.type,
    weightKg: row.weightKg as number,
    reps: row.reps as number,
    loggedAt: Date.now(),
  });
}

/** Checkable iff weight ≥ 0 (bodyweight 0 allowed) and reps ≥ 1 (decision #5). */
function isCheckable(row: SetRowState): boolean {
  if (row.weightKg === null || row.weightKg < 0) return false;
  return row.reps !== null && row.reps >= 1;
}

/** Next blank row after `from`; falls back to `from` when none. */
function nextBlankIndex(rows: SetRowState[], from: number): number {
  for (let index = from + 1; index < rows.length; index++) {
    if (rows[index].setId === null) return index;
  }
  return from;
}

type MutateRows = (update: (prev: SetRowState[]) => SetRowState[]) => void;

/** Return a new row list with one row replaced by index via a pure updater. */
function patchRow(
  rows: SetRowState[],
  index: number,
  update: (row: SetRowState) => SetRowState,
): SetRowState[] {
  return rows.map((row, i) => (i === index ? update(row) : row));
}
