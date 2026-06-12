// Pure form logic for the exercise create/edit screen. No react-native
// imports so the validation matrix and muscle-selector toggles are unit
// testable without a renderer.
import type { ExerciseDraft } from "@/repos/exercisesRepo";
import type { MuscleGroup, MusclePair, SubMuscle } from "@/domain/muscles";

export interface ExerciseFormState {
  name: string;
  equipment: string;
  muscles: MusclePair[];
}

// Closed equipment set — the chip row offers exactly these (decision: no
// free-text equipment, keeps analytics groupable).
const EQUIPMENT = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "other",
] as const;

export type Equipment = (typeof EQUIPMENT)[number];

export type ValidationResult =
  | { ok: true; draft: ExerciseDraft }
  | { ok: false; error: string };

function isEquipment(value: string): value is Equipment {
  return (EQUIPMENT as readonly string[]).includes(value);
}

/**
 * Validates a draft form into a persistable ExerciseDraft. Error text
 * always names the offending value and the expected shape.
 *
 * Usage: `const r = validateExerciseForm(state); if (r.ok) save(r.draft);`
 */
export function validateExerciseForm(state: ExerciseFormState): ValidationResult {
  const name = state.name.trim();
  if (name.length === 0) {
    return { ok: false, error: "name is empty, expected a non-empty exercise name" };
  }
  if (!isEquipment(state.equipment)) {
    return {
      ok: false,
      error: `equipment "${state.equipment}" is invalid, expected one of ${EQUIPMENT.join(" | ")}`,
    };
  }
  if (state.muscles.length === 0) {
    return {
      ok: false,
      error: "no muscles selected, expected at least one (group, sub-muscle) pair",
    };
  }
  return { ok: true, draft: { name, equipment: state.equipment, muscles: state.muscles } };
}

/** Add the (group, sub) pair if absent, remove it if already present. */
export function toggleMusclePair(
  pairs: MusclePair[],
  group: MuscleGroup,
  sub: SubMuscle,
): MusclePair[] {
  if (isPairSelected(pairs, group, sub)) {
    return pairs.filter((pair) => !(pair.group === group && pair.subMuscle === sub));
  }
  return [...pairs, { group, subMuscle: sub }];
}

export function isPairSelected(
  pairs: MusclePair[],
  group: MuscleGroup,
  sub: SubMuscle,
): boolean {
  return pairs.some((pair) => pair.group === group && pair.subMuscle === sub);
}

/** Distinct groups that have at least one selected sub-muscle. */
export function selectedGroups(pairs: MusclePair[]): MuscleGroup[] {
  const groups: MuscleGroup[] = [];
  for (const pair of pairs) {
    if (!groups.includes(pair.group)) groups.push(pair.group);
  }
  return groups;
}

/** 3-letter uppercase group tag for compact list display (chest → CHE). */
export function groupAbbrev(group: MuscleGroup): string {
  return group.slice(0, 3).toUpperCase();
}
