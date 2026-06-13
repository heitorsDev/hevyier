// Pure formatters for the History detail screen's per-exercise set lines.
// No react-native imports — unit-tested in plain jest. Mirrors the logging
// screen's labelling: warmups `W1…Wn`, work `1…n`, numbered within type.

import type { LoggedSetView } from "@/repos/exerciseHistoryRepo";

// One labelled set line ready to render, e.g. `{ label: "W1", text: "60.0 × 10" }`.
export interface SetLine {
  label: string;
  text: string;
}

/**
 * Format a logged set's weight × reps as `60.0 × 10` — weight always to one
 * decimal (mono-column alignment), reps as an integer.
 *
 * Example: formatSetValue({ weightKg: 60, reps: 10, type: "work" }) → "60.0 × 10"
 */
export function formatSetValue(set: { weightKg: number; reps: number }): string {
  return `${set.weightKg.toFixed(1)} × ${set.reps}`;
}

/**
 * Turn a session_exercise's logged sets into labelled lines. Warmups label
 * `W1…Wn` and work sets `1…n`, each numbered within its own type in the
 * order supplied (the repo returns sets ordered as logged).
 *
 * Example: toSetLines([{type:"warmup",weightKg:20,reps:12}]) →
 *   [{ label: "W1", text: "20.0 × 12" }]
 */
export function toSetLines(sets: LoggedSetView[]): SetLine[] {
  let warmups = 0;
  let works = 0;
  return sets.map((set) => {
    const label = set.type === "warmup" ? `W${++warmups}` : `${++works}`;
    return { label, text: formatSetValue(set) };
  });
}
