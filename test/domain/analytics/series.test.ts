import { maxWeightSeries, volumeSeries } from "@/domain/analytics/series";
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

describe("maxWeightSeries", () => {
  it("takes the heaviest work set per session date, chronological", () => {
    const sets = [
      aset({ setId: 1, sessionDate: 2_000, weightKg: 100 }),
      aset({ setId: 2, sessionDate: 1_000, weightKg: 80 }),
      aset({ setId: 3, sessionDate: 1_000, weightKg: 90 }),
    ];
    expect(maxWeightSeries(sets)).toEqual([
      { sessionDate: 1_000, maxKg: 90 },
      { sessionDate: 2_000, maxKg: 100 },
    ]);
  });

  it("ignores warmup sets", () => {
    const sets = [
      aset({ setId: 1, type: "warmup", weightKg: 200 }),
      aset({ setId: 2, type: "work", weightKg: 60 }),
    ];
    expect(maxWeightSeries(sets)).toEqual([{ sessionDate: 1_000, maxKg: 60 }]);
  });

  it("is empty with no work sets", () => {
    expect(maxWeightSeries([aset({ type: "warmup" })])).toEqual([]);
  });
});

describe("volumeSeries", () => {
  it("sums weight×reps over work sets per session date", () => {
    const sets = [
      aset({ setId: 1, sessionDate: 1_000, weightKg: 60, reps: 10 }),
      aset({ setId: 2, sessionDate: 1_000, weightKg: 60, reps: 8 }),
      aset({ setId: 3, sessionDate: 2_000, weightKg: 100, reps: 5 }),
    ];
    expect(volumeSeries(sets)).toEqual([
      { sessionDate: 1_000, volumeKg: 1_080 },
      { sessionDate: 2_000, volumeKg: 500 },
    ]);
  });

  it("excludes warmups from volume", () => {
    const sets = [
      aset({ setId: 1, type: "warmup", weightKg: 20, reps: 10 }),
      aset({ setId: 2, type: "work", weightKg: 100, reps: 5 }),
    ];
    expect(volumeSeries(sets)).toEqual([{ sessionDate: 1_000, volumeKg: 500 }]);
  });
});
