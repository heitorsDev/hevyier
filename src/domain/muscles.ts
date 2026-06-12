// Two-level muscle taxonomy used by exercise targeting and analytics.
// Exercises store (group, subMuscle) pairs; analytics credits full set
// volume to every targeted pair (decision #13 in the implementation plan).
export const MUSCLE_GROUPS = {
  chest: ["upper_chest", "mid_chest", "lower_chest"],
  back: ["lats", "traps", "rhomboids", "lower_back"],
  shoulders: ["front_delts", "side_delts", "rear_delts"],
  biceps: ["biceps_long_head", "biceps_short_head", "brachialis"],
  triceps: ["triceps_long_head", "triceps_lateral_head", "triceps_medial_head"],
  // Empty on purpose: forearms has no sub-split. subMusclesOf() exposes
  // the implicit "forearms" sub so the (group, sub) pair shape stays
  // uniform for storage and analytics.
  forearms: [],
  quads: ["rectus_femoris", "vastus_lateralis", "vastus_medialis"],
  hamstrings: ["biceps_femoris", "semitendinosus", "semimembranosus"],
  glutes: ["gluteus_maximus", "gluteus_medius", "gluteus_minimus"],
  calves: ["gastrocnemius", "soleus"],
  abs: ["upper_abs", "lower_abs", "obliques"],
  neck: ["neck_flexors", "neck_extensors"],
} as const satisfies Record<string, readonly string[]>;

export type MuscleGroup = keyof typeof MUSCLE_GROUPS;

type DeclaredSubMuscle = (typeof MUSCLE_GROUPS)[MuscleGroup][number];

// "forearms" is the implicit sub-muscle of its own (sub-less) group.
export type SubMuscle = DeclaredSubMuscle | "forearms";

export interface MusclePair {
  group: MuscleGroup;
  subMuscle: SubMuscle;
}

/**
 * Selectable sub-muscles for a group; sub-less groups (forearms) yield
 * the group name itself so callers always get ≥1 option.
 *
 * Example: subMusclesOf("forearms") → ["forearms"]
 */
export function subMusclesOf(group: MuscleGroup): readonly SubMuscle[] {
  const declared: readonly SubMuscle[] = MUSCLE_GROUPS[group];
  if (declared.length > 0) return declared;
  // Only forearms is declared sub-less, so the group name doubles as
  // its implicit sub-muscle.
  return ["forearms"];
}
