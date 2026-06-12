import {
  groupAbbrev,
  isPairSelected,
  selectedGroups,
  toggleMusclePair,
  validateExerciseForm,
  type ExerciseFormState,
} from "@/domain/exerciseForm";
import type { MusclePair } from "@/domain/muscles";

const VALID_PAIR: MusclePair = { group: "chest", subMuscle: "mid_chest" };

function formWith(overrides: Partial<ExerciseFormState>): ExerciseFormState {
  return { name: "Bench Press", equipment: "barbell", muscles: [VALID_PAIR], ...overrides };
}

describe("validateExerciseForm", () => {
  test("rejects an empty name and names the expected shape", () => {
    const result = validateExerciseForm(formWith({ name: "   " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/name is empty/);
  });

  test("rejects unknown equipment and echoes the offending value", () => {
    const result = validateExerciseForm(formWith({ equipment: "kettlebell" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("kettlebell");
  });

  test("rejects zero muscles", () => {
    const result = validateExerciseForm(formWith({ muscles: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/no muscles selected/);
  });

  test("accepts a valid form and trims the name into a draft", () => {
    const result = validateExerciseForm(formWith({ name: "  Squat  " }));
    expect(result).toEqual({
      ok: true,
      draft: { name: "Squat", equipment: "barbell", muscles: [VALID_PAIR] },
    });
  });
});

describe("toggleMusclePair", () => {
  test("adds a pair when absent", () => {
    expect(toggleMusclePair([], "back", "lats")).toEqual([
      { group: "back", subMuscle: "lats" },
    ]);
  });

  test("removes a pair when already present", () => {
    const pairs: MusclePair[] = [{ group: "back", subMuscle: "lats" }];
    expect(toggleMusclePair(pairs, "back", "lats")).toEqual([]);
  });
});

describe("isPairSelected / selectedGroups / groupAbbrev", () => {
  const pairs: MusclePair[] = [
    { group: "chest", subMuscle: "mid_chest" },
    { group: "triceps", subMuscle: "triceps_lateral_head" },
  ];

  test("isPairSelected matches on both group and sub", () => {
    expect(isPairSelected(pairs, "chest", "mid_chest")).toBe(true);
    expect(isPairSelected(pairs, "chest", "upper_chest")).toBe(false);
  });

  test("selectedGroups returns distinct groups", () => {
    const dup: MusclePair[] = [...pairs, { group: "chest", subMuscle: "upper_chest" }];
    expect(selectedGroups(dup)).toEqual(["chest", "triceps"]);
  });

  test("groupAbbrev is a 3-letter uppercase tag", () => {
    expect(groupAbbrev("chest")).toBe("CHE");
    expect(groupAbbrev("shoulders")).toBe("SHO");
  });
});
