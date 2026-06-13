import { weeklyStreak } from "@/domain/analytics/streak";

function local(y: number, m: number, d: number): number {
  return new Date(y, m - 1, d, 12).getTime();
}

// "Now" anchored mid-week so day-of-week edges are exercised.
const now = local(2026, 6, 10); // Wednesday

describe("weeklyStreak", () => {
  it("is 0 when the exercise was not performed this week", () => {
    expect(weeklyStreak([local(2026, 6, 1)], now)).toBe(0);
  });

  it("counts the current week alone as 1", () => {
    expect(weeklyStreak([local(2026, 6, 9)], now)).toBe(1);
  });

  it("counts consecutive weeks back from the current week", () => {
    const dates = [
      local(2026, 6, 10), // this week
      local(2026, 6, 3), // last week
      local(2026, 5, 27), // two weeks ago
    ];
    expect(weeklyStreak(dates, now)).toBe(3);
  });

  it("stops at the first missing week (gap)", () => {
    const dates = [
      local(2026, 6, 10), // this week
      local(2026, 6, 3), // last week
      // two weeks ago missing
      local(2026, 5, 20), // three weeks ago — beyond the gap, ignored
    ];
    expect(weeklyStreak(dates, now)).toBe(2);
  });

  it("crosses the year boundary without breaking the streak", () => {
    const nowNewYear = local(2026, 1, 7); // Wed of week starting Jan 5
    const dates = [
      local(2026, 1, 6), // current week
      local(2025, 12, 30), // prior week (Dec 29 Monday)
    ];
    expect(weeklyStreak(dates, nowNewYear)).toBe(2);
  });

  it("is 0 with no session dates", () => {
    expect(weeklyStreak([], now)).toBe(0);
  });
});
