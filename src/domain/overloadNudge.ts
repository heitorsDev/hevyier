/**
 * Progressive-overload nudge logic (decision #7). Pure — the repo supplies
 * the work-set history; this module only decides whether to nudge.
 */

export interface WeightReps {
  weightKg: number;
  reps: number;
}

/**
 * True iff the last two sessions logged the *identical* ordered list of
 * work sets — same length, same (weight, reps) at every position. That is
 * the signal to suggest adding weight (spec: "Same as last 2 sessions").
 *
 * `history` is the per-session work-set lists, most-recent first; only the
 * first two entries matter. Warmups are excluded upstream (decision #7).
 *
 * Example: shouldNudge([[{weightKg:100,reps:5}], [{weightKg:100,reps:5}]]) → true
 */
export function shouldNudge(history: WeightReps[][]): boolean {
  if (history.length < 2) return false;
  return setListsEqual(history[0], history[1]);
}

function setListsEqual(a: WeightReps[], b: WeightReps[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((set, index) => sameSet(set, b[index]));
}

function sameSet(a: WeightReps, b: WeightReps): boolean {
  return a.weightKg === b.weightKg && a.reps === b.reps;
}
