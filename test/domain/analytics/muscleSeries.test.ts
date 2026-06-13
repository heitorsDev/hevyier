import { groupSeries, subMuscleSeries } from "@/domain/analytics/muscleSeries";
import type { MuscleWeekVolume } from "@/domain/analytics/muscleVolume";

const weeks = [1_000, 2_000, 3_000];

function row(over: Partial<MuscleWeekVolume>): MuscleWeekVolume {
  return {
    weekStart: 1_000,
    group: "chest",
    subMuscle: "upper_chest",
    volumeKg: 100,
    ...over,
  };
}

describe("groupSeries", () => {
  it("sums sub-muscles per group per week, zero-filling empty weeks", () => {
    const rows = [
      row({ weekStart: 1_000, subMuscle: "upper_chest", volumeKg: 100 }),
      row({ weekStart: 1_000, subMuscle: "mid_chest", volumeKg: 50 }),
      row({ weekStart: 3_000, subMuscle: "upper_chest", volumeKg: 200 }),
    ];
    const [chest] = groupSeries(rows, weeks);
    expect(chest.group).toBe("chest");
    expect(chest.weekly).toEqual([
      { x: 1_000, y: 150 },
      { x: 2_000, y: 0 },
      { x: 3_000, y: 200 },
    ]);
    expect(chest.totalKg).toBe(350);
  });

  it("orders groups by total volume, biggest first", () => {
    const rows = [
      row({ group: "chest", subMuscle: "upper_chest", volumeKg: 100 }),
      row({ group: "back", subMuscle: "lats", volumeKg: 500 }),
    ];
    expect(groupSeries(rows, weeks).map((s) => s.group)).toEqual(["back", "chest"]);
  });
});

describe("subMuscleSeries", () => {
  it("splits one group into per-sub-muscle series, biggest first", () => {
    const rows = [
      row({ group: "chest", subMuscle: "upper_chest", weekStart: 1_000, volumeKg: 100 }),
      row({ group: "chest", subMuscle: "mid_chest", weekStart: 1_000, volumeKg: 400 }),
      row({ group: "back", subMuscle: "lats", weekStart: 1_000, volumeKg: 999 }),
    ];
    const series = subMuscleSeries(rows, "chest", weeks);
    expect(series.map((s) => s.subMuscle)).toEqual(["mid_chest", "upper_chest"]);
    expect(series[0].weekly[0]).toEqual({ x: 1_000, y: 400 });
  });
});
