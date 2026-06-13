import { mondayStartMs, recentWeekStarts, weeksBetween } from "@/domain/analytics/weeks";

// Local-time constructor keeps these aligned with the production fns,
// which use the device's local calendar.
function local(y: number, m: number, d: number, h = 12): number {
  return new Date(y, m - 1, d, h).getTime();
}

describe("mondayStartMs", () => {
  it("returns Monday midnight for a midweek instant", () => {
    // 2026-06-10 is a Wednesday → Monday 2026-06-08.
    expect(mondayStartMs(local(2026, 6, 10))).toBe(local(2026, 6, 8, 0));
  });

  it("treats Sunday as the end of the prior Monday-week", () => {
    // 2026-06-14 is a Sunday → still 2026-06-08 Monday.
    expect(mondayStartMs(local(2026, 6, 14))).toBe(local(2026, 6, 8, 0));
  });

  it("is idempotent on a Monday", () => {
    const monday = local(2026, 6, 8, 0);
    expect(mondayStartMs(monday)).toBe(monday);
  });
});

describe("weeksBetween", () => {
  it("counts whole weeks across a year boundary", () => {
    // Mon Dec 29 2025 → Mon Jan 5 2026 is one week, spanning new year.
    const lastWeek = mondayStartMs(local(2025, 12, 30));
    const newYearWeek = mondayStartMs(local(2026, 1, 6));
    expect(weeksBetween(newYearWeek, lastWeek)).toBe(1);
  });

  it("counts multi-week spans", () => {
    const earlier = mondayStartMs(local(2026, 6, 1));
    const later = mondayStartMs(local(2026, 6, 22));
    expect(weeksBetween(later, earlier)).toBe(3);
  });
});

describe("recentWeekStarts", () => {
  it("returns `count` Mondays, oldest first, current week last", () => {
    const now = local(2026, 6, 10); // week of Mon Jun 8
    const weeks = recentWeekStarts(now, 4);
    expect(weeks).toHaveLength(4);
    expect(weeks[3]).toBe(mondayStartMs(now));
    expect(weeks[0]).toBe(mondayStartMs(local(2026, 5, 18)));
  });

  it("rejects a non-positive count", () => {
    expect(() => recentWeekStarts(local(2026, 6, 10), 0)).toThrow(/count is 0/);
  });
});
