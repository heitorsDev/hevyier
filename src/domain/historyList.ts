// Pure formatters + grouping for the History tab. No react-native imports
// so they stay unit-testable in plain jest. Volume is work sets only,
// everywhere (decision #11); duration keys off the session timestamps.

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

// A finished session as the History list needs it: identity + the totals
// the row renders. `planName` is null for freestyle sessions (decision #4).
export interface HistoryListItem {
  sessionId: number;
  startedAt: number;
  finishedAt: number;
  planName: string | null;
  totalSets: number;
  workVolumeKg: number;
}

// A list flattened into render rows: month separators interleaved with the
// session rows that fall under them, newest first.
export type HistoryRow =
  | { kind: "month"; key: string; label: string }
  | { kind: "session"; key: string; item: HistoryListItem };

function assertEpochMs(ms: number): void {
  if (Number.isFinite(ms) && ms >= 0) return;
  throw new Error(
    `epoch ms is ${ms}, expected a non-negative finite millisecond timestamp`,
  );
}

/**
 * Render an epoch-ms instant as a month separator label `JUNE 2026`
 * (full month name, all caps, four-digit year, local time).
 *
 * Example: monthHeaderLabel(Date.parse("2026-06-12")) → "JUNE 2026"
 */
export function monthHeaderLabel(ms: number): string {
  assertEpochMs(ms);
  const date = new Date(ms);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Stable month bucket key `YYYY-MM` for grouping/keys (local time). */
function monthKey(ms: number): string {
  const date = new Date(ms);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/**
 * Elapsed millisecond span of a finished session — `finished_at` minus
 * `started_at`. Throws if the session ended before it started, naming the
 * offending pair (a corrupt row should never silently read as 0:00).
 *
 * Example: sessionDurationMs({ startedAt: 0, finishedAt: 150_000 }) → 150000
 */
export function sessionDurationMs(item: {
  startedAt: number;
  finishedAt: number;
}): number {
  assertEpochMs(item.startedAt);
  assertEpochMs(item.finishedAt);
  if (item.finishedAt < item.startedAt) {
    throw new Error(
      `finishedAt ${item.finishedAt} precedes startedAt ${item.startedAt}, ` +
        `expected finishedAt >= startedAt`,
    );
  }
  return item.finishedAt - item.startedAt;
}

/**
 * The `n sets · n,nnn kg` summary line for a History row — total set count
 * (work + warmup) and work-set volume with thousands separators.
 *
 * Example: summaryLine({ totalSets: 12, workVolumeKg: 4250 }) →
 *   "12 SETS · 4,250 KG"
 */
export function summaryLine(item: {
  totalSets: number;
  workVolumeKg: number;
}): string {
  const volume = item.workVolumeKg.toLocaleString("en-US");
  return `${item.totalSets} SETS · ${volume} KG`;
}

/** Plan name or the `FREESTYLE` fallback, upper-cased for the row title. */
export function sessionTitle(planName: string | null): string {
  return planName === null ? "FREESTYLE" : planName.toUpperCase();
}

/**
 * Interleave month separators into a newest-first session list: a `month`
 * row precedes the first session of each calendar month. Input must already
 * be sorted by `startedAt` descending (the repo's order); this only inserts
 * boundaries, it never reorders.
 *
 * Example: groupByMonth([junSession, maySession]) →
 *   [{kind:"month",label:"JUNE 2026"}, {…jun}, {kind:"month",label:"MAY 2026"}, {…may}]
 */
export function groupByMonth(items: HistoryListItem[]): HistoryRow[] {
  const rows: HistoryRow[] = [];
  let lastKey: string | null = null;
  for (const item of items) {
    const key = monthKey(item.startedAt);
    if (key !== lastKey) {
      rows.push({ kind: "month", key: `m:${key}`, label: monthHeaderLabel(item.startedAt) });
      lastKey = key;
    }
    rows.push({ kind: "session", key: `s:${item.sessionId}`, item });
  }
  return rows;
}
