import { useState } from "react";

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
  const notifyChecked = onSetChecked
    ? (type: "warmup" | "work") => onSetChecked(type, initial.exerciseName)
    : undefined;

  const setWeight = (index: number, kg: number) =>
    patchRow(setRows, index, (row) => ({ ...row, weightKg: kg }));
  const setReps = (index: number, reps: number) =>
    patchRow(setRows, index, (row) => ({ ...row, reps }));
  const nudgeActiveWeight = (deltaKg: number) =>
    patchRow(setRows, activeIndex, (row) => ({
      ...row,
      weightKg: applyWeightDelta(row.weightKg, deltaKg),
    }));

  const toggleCheck = (index: number) =>
    handleToggle(sessionExerciseId, rows, index, setRows, setActiveIndex, notifyChecked);
  const addSet = (type: "warmup" | "work") =>
    setRows((prev) => appendBlankSet(prev, type));

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
  setRows: SetStateRows,
  setActiveIndex: (index: number) => void,
  onChecked: ((type: "warmup" | "work") => void) | undefined,
): void {
  const row = rows[index];
  if (row.setId !== null) {
    uncheckRow(setRows, index, row.setId);
    return;
  }
  checkRow(sessionExerciseId, rows, index, setRows, setActiveIndex, onChecked);
}

/** Un-check committed set: delete from DB; weight/reps stay (decision #5). */
function uncheckRow(setRows: SetStateRows, index: number, setId: number): void {
  deleteSet(appDb, setId);
  patchRow(setRows, index, (row) => ({ ...row, setId: null }));
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
  setRows: SetStateRows,
  setActiveIndex: (index: number) => void,
  onChecked: ((type: "warmup" | "work") => void) | undefined,
): void {
  const row = rows[index];
  if (!isCheckable(row)) return;

  const id = createSet(appDb, {
    sessionExerciseId,
    type: row.type,
    weightKg: row.weightKg as number,
    reps: row.reps as number,
    loggedAt: Date.now(),
  });
  patchRow(setRows, index, (current) => ({ ...current, setId: id }));
  setActiveIndex(nextBlankIndex(rows, index));
  onChecked?.(row.type);
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

type SetStateRows = (updater: (prev: SetRowState[]) => SetRowState[]) => void;

/** Replace one row by index via a pure updater. */
function patchRow(
  setRows: SetStateRows,
  index: number,
  update: (row: SetRowState) => SetRowState,
): void {
  setRows((prev) => prev.map((row, i) => (i === index ? update(row) : row)));
}
