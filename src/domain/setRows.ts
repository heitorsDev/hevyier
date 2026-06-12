import type { SetRow } from "@/repos/setsRepo";

// One editable line on the logging screen. `setId === null` means the row
// is blank/unchecked — no `sets` row exists yet; ✓ inserts one. weightKg /
// reps are null until the lifter touches the controls (blank rows start
// empty — last session is never pre-filled, decision #7).
export interface SetRowState {
  label: string;
  type: "warmup" | "work";
  weightKg: number | null;
  reps: number | null;
  setId: number | null;
}

/**
 * Build the logging screen's row list from plan counts + already-logged
 * sets. Existing sets become checked rows (in id order); the remaining
 * planned slots become blank rows. Warmups (`W1…Wn`) precede work (`1…n`).
 * Row count per section = max(planned, existing) so a finished/edited
 * session never hides logged sets even when it has no plan.
 *
 * Example: buildSetRows(1, 2, [workSet]) →
 *   [W1 blank, 1 ✓workSet, 2 blank]
 */
export function buildSetRows(
  planWarmup: number,
  planWork: number,
  existingSets: SetRow[],
): SetRowState[] {
  const warmups = existingSets.filter((set) => set.type === "warmup");
  const work = existingSets.filter((set) => set.type === "work");
  return [
    ...section("warmup", planWarmup, warmups),
    ...section("work", planWork, work),
  ];
}

function section(
  type: "warmup" | "work",
  planned: number,
  logged: SetRow[],
): SetRowState[] {
  const total = Math.max(planned, logged.length);
  const rows: SetRowState[] = [];
  for (let index = 0; index < total; index++) {
    rows.push(toRow(type, index, logged[index]));
  }
  return rows;
}

function toRow(
  type: "warmup" | "work",
  index: number,
  logged: SetRow | undefined,
): SetRowState {
  const label = type === "warmup" ? `W${index + 1}` : `${index + 1}`;
  if (!logged) {
    return { label, type, weightKg: null, reps: null, setId: null };
  }
  return {
    label,
    type,
    weightKg: logged.weightKg,
    reps: logged.reps,
    setId: logged.id,
  };
}

/**
 * Apply a PlatePad delta to the active row's weight, clamped at 0. A blank
 * row (null) counts as 0, so `+2.5` from blank yields 2.5 and no delta can
 * push weight negative (decision: bodyweight 0 is the floor).
 *
 * Example: applyWeightDelta(null, 2.5) → 2.5; applyWeightDelta(1, -5) → 0
 */
export function applyWeightDelta(current: number | null, deltaKg: number): number {
  return Math.max(0, (current ?? 0) + deltaKg);
}

/**
 * Append a blank set of `type` and relabel every row so warmups read
 * `W1…Wn` and work `1…n` in order (warmups always precede work). Returns a
 * new array; never mutates the input.
 *
 * Example: appendBlankSet([W1, 1], "work") → [W1, 1, 2]
 */
export function appendBlankSet(
  rows: SetRowState[],
  type: "warmup" | "work",
): SetRowState[] {
  const blank: SetRowState = { label: "", type, weightKg: null, reps: null, setId: null };
  return relabel([...rows, blank]);
}

/** Renumber rows in place-order: warmups `W1…Wn`, work `1…n`. */
function relabel(rows: SetRowState[]): SetRowState[] {
  let warmup = 0;
  let work = 0;
  return rows.map((row) => {
    const label = row.type === "warmup" ? `W${++warmup}` : `${++work}`;
    return { ...row, label };
  });
}
