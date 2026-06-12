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
