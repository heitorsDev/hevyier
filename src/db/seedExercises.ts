import type { ExerciseDraft } from "@/repos/exercisesRepo";

// ~40 common exercises seeded at first launch (decision #9). Normal
// editable rows — users can rename, retarget, archive or delete them.
// Muscle pairs use the taxonomy in src/domain/muscles.ts.
export const SEED_EXERCISES: readonly ExerciseDraft[] = [
  // — barbell —
  {
    name: "Bench Press",
    equipment: "barbell",
    muscles: [
      { group: "chest", subMuscle: "mid_chest" },
      { group: "shoulders", subMuscle: "front_delts" },
      { group: "triceps", subMuscle: "triceps_lateral_head" },
    ],
  },
  {
    name: "Incline Bench Press",
    equipment: "barbell",
    muscles: [
      { group: "chest", subMuscle: "upper_chest" },
      { group: "shoulders", subMuscle: "front_delts" },
      { group: "triceps", subMuscle: "triceps_lateral_head" },
    ],
  },
  {
    name: "Squat",
    equipment: "barbell",
    muscles: [
      { group: "quads", subMuscle: "rectus_femoris" },
      { group: "quads", subMuscle: "vastus_lateralis" },
      { group: "glutes", subMuscle: "gluteus_maximus" },
    ],
  },
  {
    name: "Front Squat",
    equipment: "barbell",
    muscles: [
      { group: "quads", subMuscle: "rectus_femoris" },
      { group: "quads", subMuscle: "vastus_medialis" },
      { group: "abs", subMuscle: "upper_abs" },
    ],
  },
  {
    name: "Deadlift",
    equipment: "barbell",
    muscles: [
      { group: "back", subMuscle: "lower_back" },
      { group: "glutes", subMuscle: "gluteus_maximus" },
      { group: "hamstrings", subMuscle: "biceps_femoris" },
    ],
  },
  {
    name: "Romanian Deadlift",
    equipment: "barbell",
    muscles: [
      { group: "hamstrings", subMuscle: "biceps_femoris" },
      { group: "glutes", subMuscle: "gluteus_maximus" },
      { group: "back", subMuscle: "lower_back" },
    ],
  },
  {
    name: "Barbell Row",
    equipment: "barbell",
    muscles: [
      { group: "back", subMuscle: "lats" },
      { group: "back", subMuscle: "rhomboids" },
      { group: "biceps", subMuscle: "biceps_long_head" },
    ],
  },
  {
    name: "Overhead Press",
    equipment: "barbell",
    muscles: [
      { group: "shoulders", subMuscle: "front_delts" },
      { group: "shoulders", subMuscle: "side_delts" },
      { group: "triceps", subMuscle: "triceps_long_head" },
    ],
  },
  // — dumbbell —
  {
    name: "Dumbbell Bench Press",
    equipment: "dumbbell",
    muscles: [
      { group: "chest", subMuscle: "mid_chest" },
      { group: "shoulders", subMuscle: "front_delts" },
      { group: "triceps", subMuscle: "triceps_lateral_head" },
    ],
  },
  {
    name: "Incline Dumbbell Press",
    equipment: "dumbbell",
    muscles: [
      { group: "chest", subMuscle: "upper_chest" },
      { group: "shoulders", subMuscle: "front_delts" },
    ],
  },
  {
    name: "Dumbbell Row",
    equipment: "dumbbell",
    muscles: [
      { group: "back", subMuscle: "lats" },
      { group: "back", subMuscle: "rhomboids" },
      { group: "biceps", subMuscle: "biceps_long_head" },
    ],
  },
  {
    name: "Dumbbell Curl",
    equipment: "dumbbell",
    muscles: [
      { group: "biceps", subMuscle: "biceps_short_head" },
      { group: "biceps", subMuscle: "biceps_long_head" },
    ],
  },
  {
    name: "Hammer Curl",
    equipment: "dumbbell",
    muscles: [
      { group: "biceps", subMuscle: "brachialis" },
      { group: "forearms", subMuscle: "forearms" },
    ],
  },
  {
    name: "Lateral Raise",
    equipment: "dumbbell",
    muscles: [{ group: "shoulders", subMuscle: "side_delts" }],
  },
  {
    name: "Rear-Delt Fly",
    equipment: "dumbbell",
    muscles: [
      { group: "shoulders", subMuscle: "rear_delts" },
      { group: "back", subMuscle: "rhomboids" },
    ],
  },
  {
    name: "Dumbbell Shrug",
    equipment: "dumbbell",
    muscles: [
      { group: "back", subMuscle: "traps" },
      { group: "neck", subMuscle: "neck_extensors" },
    ],
  },
  {
    name: "Dumbbell Romanian Deadlift",
    equipment: "dumbbell",
    muscles: [
      { group: "hamstrings", subMuscle: "biceps_femoris" },
      { group: "glutes", subMuscle: "gluteus_maximus" },
    ],
  },
  // — cable —
  {
    name: "Lat Pulldown",
    equipment: "cable",
    muscles: [
      { group: "back", subMuscle: "lats" },
      { group: "biceps", subMuscle: "biceps_long_head" },
    ],
  },
  {
    name: "Seated Cable Row",
    equipment: "cable",
    muscles: [
      { group: "back", subMuscle: "rhomboids" },
      { group: "back", subMuscle: "lats" },
      { group: "biceps", subMuscle: "biceps_short_head" },
    ],
  },
  {
    name: "Triceps Pushdown",
    equipment: "cable",
    muscles: [
      { group: "triceps", subMuscle: "triceps_lateral_head" },
      { group: "triceps", subMuscle: "triceps_medial_head" },
    ],
  },
  {
    name: "Overhead Triceps Extension",
    equipment: "cable",
    muscles: [{ group: "triceps", subMuscle: "triceps_long_head" }],
  },
  {
    name: "Cable Fly",
    equipment: "cable",
    muscles: [{ group: "chest", subMuscle: "mid_chest" }],
  },
  {
    name: "Face Pull",
    equipment: "cable",
    muscles: [
      { group: "shoulders", subMuscle: "rear_delts" },
      { group: "back", subMuscle: "traps" },
    ],
  },
  {
    name: "Cable Curl",
    equipment: "cable",
    muscles: [{ group: "biceps", subMuscle: "biceps_short_head" }],
  },
  // — machine —
  {
    name: "Leg Press",
    equipment: "machine",
    muscles: [
      { group: "quads", subMuscle: "vastus_lateralis" },
      { group: "quads", subMuscle: "vastus_medialis" },
      { group: "glutes", subMuscle: "gluteus_maximus" },
    ],
  },
  {
    name: "Leg Extension",
    equipment: "machine",
    muscles: [
      { group: "quads", subMuscle: "rectus_femoris" },
      { group: "quads", subMuscle: "vastus_medialis" },
    ],
  },
  {
    name: "Leg Curl",
    equipment: "machine",
    muscles: [
      { group: "hamstrings", subMuscle: "biceps_femoris" },
      { group: "hamstrings", subMuscle: "semitendinosus" },
    ],
  },
  {
    name: "Calf Raise",
    equipment: "machine",
    muscles: [
      { group: "calves", subMuscle: "gastrocnemius" },
      { group: "calves", subMuscle: "soleus" },
    ],
  },
  {
    name: "Chest Press",
    equipment: "machine",
    muscles: [
      { group: "chest", subMuscle: "mid_chest" },
      { group: "triceps", subMuscle: "triceps_lateral_head" },
    ],
  },
  {
    name: "Pec Deck",
    equipment: "machine",
    muscles: [{ group: "chest", subMuscle: "mid_chest" }],
  },
  {
    name: "Hack Squat",
    equipment: "machine",
    muscles: [
      { group: "quads", subMuscle: "vastus_lateralis" },
      { group: "quads", subMuscle: "rectus_femoris" },
      { group: "glutes", subMuscle: "gluteus_maximus" },
    ],
  },
  // — bodyweight —
  {
    name: "Pull-Up",
    equipment: "bodyweight",
    muscles: [
      { group: "back", subMuscle: "lats" },
      { group: "biceps", subMuscle: "biceps_long_head" },
      { group: "forearms", subMuscle: "forearms" },
    ],
  },
  {
    name: "Chin-Up",
    equipment: "bodyweight",
    muscles: [
      { group: "back", subMuscle: "lats" },
      { group: "biceps", subMuscle: "biceps_short_head" },
    ],
  },
  {
    name: "Dip",
    equipment: "bodyweight",
    muscles: [
      { group: "chest", subMuscle: "lower_chest" },
      { group: "triceps", subMuscle: "triceps_long_head" },
      { group: "shoulders", subMuscle: "front_delts" },
    ],
  },
  {
    name: "Push-Up",
    equipment: "bodyweight",
    muscles: [
      { group: "chest", subMuscle: "mid_chest" },
      { group: "triceps", subMuscle: "triceps_lateral_head" },
      { group: "shoulders", subMuscle: "front_delts" },
    ],
  },
  {
    name: "Plank",
    equipment: "bodyweight",
    muscles: [
      { group: "abs", subMuscle: "upper_abs" },
      { group: "abs", subMuscle: "lower_abs" },
    ],
  },
  {
    name: "Hanging Leg Raise",
    equipment: "bodyweight",
    muscles: [
      { group: "abs", subMuscle: "lower_abs" },
      { group: "forearms", subMuscle: "forearms" },
    ],
  },
];
