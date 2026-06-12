import { shouldNudge, type WeightReps } from "@/domain/overloadNudge";

const oneByFive: WeightReps[] = [{ weightKg: 100, reps: 5 }];

describe("shouldNudge", () => {
  it("nudges when the last two work-set lists are identical", () => {
    expect(shouldNudge([oneByFive, oneByFive])).toBe(true);
  });

  it("ignores sessions beyond the most recent two", () => {
    const heavier: WeightReps[] = [{ weightKg: 105, reps: 5 }];
    expect(shouldNudge([oneByFive, oneByFive, heavier])).toBe(true);
  });

  it("does not nudge with fewer than two sessions", () => {
    expect(shouldNudge([])).toBe(false);
    expect(shouldNudge([oneByFive])).toBe(false);
  });

  it("does not nudge when set counts differ", () => {
    const twoSets: WeightReps[] = [
      { weightKg: 100, reps: 5 },
      { weightKg: 100, reps: 5 },
    ];
    expect(shouldNudge([oneByFive, twoSets])).toBe(false);
  });

  it("does not nudge when a weight differs", () => {
    expect(shouldNudge([oneByFive, [{ weightKg: 102.5, reps: 5 }]])).toBe(false);
  });

  it("does not nudge when reps differ", () => {
    expect(shouldNudge([oneByFive, [{ weightKg: 100, reps: 6 }]])).toBe(false);
  });

  it("does not nudge when ordered sets differ in position", () => {
    const ascending: WeightReps[] = [
      { weightKg: 100, reps: 5 },
      { weightKg: 110, reps: 3 },
    ];
    const descending: WeightReps[] = [
      { weightKg: 110, reps: 3 },
      { weightKg: 100, reps: 5 },
    ];
    expect(shouldNudge([ascending, descending])).toBe(false);
  });
});
