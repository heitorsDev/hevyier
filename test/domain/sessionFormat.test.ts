import { formatDateHeader, formatDuration } from "@/domain/sessionFormat";

describe("formatDateHeader", () => {
  test("renders weekday day month, all caps", () => {
    // 2026-06-12 is a Friday (local-time construction).
    const ms = new Date(2026, 5, 12, 9, 30).getTime();
    expect(formatDateHeader(ms)).toBe("FRI 12 JUN");
  });

  test("handles single-digit day and January", () => {
    const ms = new Date(2026, 0, 1, 0, 0).getTime();
    expect(formatDateHeader(ms)).toBe("THU 1 JAN");
  });

  test("throws on negative input naming the value", () => {
    expect(() => formatDateHeader(-1)).toThrow(/-1/);
  });
});

describe("formatDuration", () => {
  test("renders M:SS below an hour", () => {
    expect(formatDuration(150_000)).toBe("2:30");
    expect(formatDuration(5_000)).toBe("0:05");
    expect(formatDuration(0)).toBe("0:00");
  });

  test("renders H:MM at or above an hour", () => {
    expect(formatDuration(3_900_000)).toBe("1:05");
    expect(formatDuration(3_600_000)).toBe("1:00");
  });

  test("throws on non-finite input naming the value", () => {
    expect(() => formatDuration(Number.NaN)).toThrow(/NaN/);
  });
});
