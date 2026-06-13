import { prBadges } from "@/domain/analytics/prBadges";
import type { AnalyticsSet } from "@/domain/analytics/types";

function aset(over: Partial<AnalyticsSet>): AnalyticsSet {
  return {
    setId: 1,
    sessionId: 1,
    sessionDate: 1_000,
    type: "work",
    weightKg: 60,
    reps: 10,
    ...over,
  };
}

describe("prBadges", () => {
  it("returns null records when no work sets exist", () => {
    expect(prBadges([aset({ type: "warmup" })])).toEqual({
      heaviestSet: null,
      mostRepsSet: null,
      highestVolumeSession: null,
    });
  });

  it("finds heaviest set, most reps, and highest-volume session", () => {
    const sets = [
      aset({ setId: 1, sessionDate: 1_000, weightKg: 100, reps: 5 }),
      aset({ setId: 2, sessionDate: 1_000, weightKg: 60, reps: 12 }),
      aset({ setId: 3, sessionDate: 2_000, weightKg: 80, reps: 8 }),
      aset({ setId: 4, sessionDate: 2_000, weightKg: 80, reps: 8 }),
    ];
    const badges = prBadges(sets);
    expect(badges.heaviestSet).toEqual({ sessionDate: 1_000, weightKg: 100, reps: 5 });
    expect(badges.mostRepsSet).toEqual({ sessionDate: 1_000, weightKg: 60, reps: 12 });
    // day1 = 500+720 = 1220; day2 = 640+640 = 1280 → day2 wins.
    expect(badges.highestVolumeSession).toEqual({ sessionDate: 2_000, volumeKg: 1_280 });
  });

  it("breaks weight ties toward the earliest set (PR date = first time hit)", () => {
    const sets = [
      aset({ setId: 5, sessionDate: 3_000, weightKg: 120, reps: 3 }),
      aset({ setId: 1, sessionDate: 1_000, weightKg: 120, reps: 3 }),
    ];
    expect(prBadges(sets).heaviestSet).toEqual({
      sessionDate: 1_000,
      weightKg: 120,
      reps: 3,
    });
  });

  it("breaks same-day weight ties toward the lowest setId", () => {
    const sets = [
      aset({ setId: 9, sessionDate: 1_000, weightKg: 120, reps: 3 }),
      aset({ setId: 4, sessionDate: 1_000, weightKg: 120, reps: 4 }),
    ];
    // Both 120kg, same day → setId 4 (earliest) wins, carrying its reps.
    expect(prBadges(sets).heaviestSet).toEqual({
      sessionDate: 1_000,
      weightKg: 120,
      reps: 4,
    });
  });

  it("breaks volume ties toward the earliest session", () => {
    const sets = [
      aset({ setId: 1, sessionDate: 5_000, weightKg: 100, reps: 5 }),
      aset({ setId: 2, sessionDate: 1_000, weightKg: 50, reps: 10 }),
    ];
    // Both sessions = 500 volume → earlier session 1_000 wins.
    expect(prBadges(sets).highestVolumeSession).toEqual({
      sessionDate: 1_000,
      volumeKg: 500,
    });
  });
});
