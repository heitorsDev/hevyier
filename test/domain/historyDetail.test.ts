import { formatSetValue, toSetLines } from "@/domain/historyDetail";
import type { LoggedSetView } from "@/repos/exerciseHistoryRepo";

describe("formatSetValue", () => {
  test("weight to one decimal, reps as integer", () => {
    expect(formatSetValue({ weightKg: 60, reps: 10 })).toBe("60.0 × 10");
  });

  test("preserves fractional plates", () => {
    expect(formatSetValue({ weightKg: 62.5, reps: 8 })).toBe("62.5 × 8");
  });

  test("bodyweight zero is shown as 0.0", () => {
    expect(formatSetValue({ weightKg: 0, reps: 15 })).toBe("0.0 × 15");
  });
});

describe("toSetLines", () => {
  test("numbers warmups W1.. and work 1.. within their own type", () => {
    const sets: LoggedSetView[] = [
      { type: "warmup", weightKg: 20, reps: 12 },
      { type: "warmup", weightKg: 40, reps: 8 },
      { type: "work", weightKg: 60, reps: 10 },
      { type: "work", weightKg: 60, reps: 9 },
    ];

    expect(toSetLines(sets)).toEqual([
      { label: "W1", text: "20.0 × 12" },
      { label: "W2", text: "40.0 × 8" },
      { label: "1", text: "60.0 × 10" },
      { label: "2", text: "60.0 × 9" },
    ]);
  });

  test("empty sets yield no lines", () => {
    expect(toSetLines([])).toEqual([]);
  });
});
