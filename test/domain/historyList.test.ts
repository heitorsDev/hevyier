import {
  groupByMonth,
  monthHeaderLabel,
  sessionDurationMs,
  sessionTitle,
  summaryLine,
  type HistoryListItem,
} from "@/domain/historyList";

function item(over: Partial<HistoryListItem>): HistoryListItem {
  return {
    sessionId: 1,
    startedAt: new Date(2026, 5, 12, 9, 0).getTime(),
    finishedAt: new Date(2026, 5, 12, 10, 0).getTime(),
    planName: "Push",
    totalSets: 12,
    workVolumeKg: 4250,
    ...over,
  };
}

describe("monthHeaderLabel", () => {
  test("renders full month name and four-digit year, all caps", () => {
    const ms = new Date(2026, 5, 12).getTime();
    expect(monthHeaderLabel(ms)).toBe("JUNE 2026");
  });

  test("handles January boundary", () => {
    expect(monthHeaderLabel(new Date(2027, 0, 1).getTime())).toBe("JANUARY 2027");
  });

  test("throws on negative input naming the value", () => {
    expect(() => monthHeaderLabel(-1)).toThrow(/-1/);
  });
});

describe("sessionDurationMs", () => {
  test("is finishedAt minus startedAt", () => {
    expect(sessionDurationMs({ startedAt: 1_000, finishedAt: 151_000 })).toBe(150_000);
  });

  test("zero-length session is allowed", () => {
    expect(sessionDurationMs({ startedAt: 5_000, finishedAt: 5_000 })).toBe(0);
  });

  test("throws naming both values when finishedAt precedes startedAt", () => {
    expect(() => sessionDurationMs({ startedAt: 9_000, finishedAt: 1_000 })).toThrow(
      /1000.*9000/,
    );
  });
});

describe("summaryLine", () => {
  test("formats set count and work volume with thousands separators", () => {
    expect(summaryLine({ totalSets: 12, workVolumeKg: 4250 })).toBe("12 SETS · 4,250 KG");
  });

  test("zero volume freestyle session", () => {
    expect(summaryLine({ totalSets: 0, workVolumeKg: 0 })).toBe("0 SETS · 0 KG");
  });
});

describe("sessionTitle", () => {
  test("upper-cases a plan name", () => {
    expect(sessionTitle("Push Day")).toBe("PUSH DAY");
  });

  test("null plan renders FREESTYLE", () => {
    expect(sessionTitle(null)).toBe("FREESTYLE");
  });
});

describe("groupByMonth", () => {
  test("inserts a month separator before the first session of each month", () => {
    const jun = item({ sessionId: 2, startedAt: new Date(2026, 5, 20).getTime() });
    const junEarlier = item({ sessionId: 1, startedAt: new Date(2026, 5, 2).getTime() });
    const may = item({ sessionId: 0, startedAt: new Date(2026, 4, 28).getTime() });

    const rows = groupByMonth([jun, junEarlier, may]);

    expect(rows.map((r) => (r.kind === "month" ? r.label : `s${r.item.sessionId}`))).toEqual([
      "JUNE 2026",
      "s2",
      "s1",
      "MAY 2026",
      "s0",
    ]);
  });

  test("same month across years gets separate headers", () => {
    const jun2026 = item({ sessionId: 1, startedAt: new Date(2026, 5, 1).getTime() });
    const jun2025 = item({ sessionId: 0, startedAt: new Date(2025, 5, 1).getTime() });

    const rows = groupByMonth([jun2026, jun2025]);
    const headers = rows.filter((r) => r.kind === "month");
    expect(headers).toHaveLength(2);
  });

  test("empty list yields no rows", () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
