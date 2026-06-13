import { heatmapCells } from "@/domain/analytics/consistency";

function local(y: number, m: number, d: number): number {
  return new Date(y, m - 1, d, 12).getTime();
}

const now = local(2026, 6, 10); // Wednesday, week of Mon Jun 8

describe("heatmapCells", () => {
  it("produces weekCount × 7 cells", () => {
    expect(heatmapCells([], now, 26)).toHaveLength(26 * 7);
  });

  it("ends with the current week and marks today's cell", () => {
    const cells = heatmapCells([now], now, 4);
    const last = cells.filter((c) => c.weekIndex === 3);
    // Wednesday = weekday index 2 (Mon=0).
    expect(last.find((c) => c.weekday === 2)?.hasSession).toBe(true);
    expect(last.filter((c) => c.hasSession)).toHaveLength(1);
  });

  it("matches a session by its calendar day regardless of time of day", () => {
    const morning = new Date(2026, 5, 9, 6, 30).getTime(); // Tue Jun 9
    const cells = heatmapCells([morning], now, 2);
    const tuesdayThisWeek = cells.find(
      (c) => c.weekIndex === 1 && c.weekday === 1,
    );
    expect(tuesdayThisWeek?.hasSession).toBe(true);
  });

  it("leaves weeks with no session entirely empty", () => {
    const cells = heatmapCells([now], now, 4);
    expect(cells.filter((c) => c.weekIndex === 0 && c.hasSession)).toHaveLength(0);
  });

  it("rejects a non-positive weekCount with a descriptive message", () => {
    expect(() => heatmapCells([], now, 0)).toThrow(/weekCount is 0/);
  });
});
