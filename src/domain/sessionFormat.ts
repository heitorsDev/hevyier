// Pure formatters for the Today tab header + last-session footer. No
// react-native imports so they stay unit-testable in plain jest.

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function assertEpochMs(ms: number): void {
  if (Number.isFinite(ms) && ms >= 0) return;
  throw new Error(
    `epoch ms is ${ms}, expected a non-negative finite millisecond timestamp`,
  );
}

/**
 * Render an epoch-ms instant as the brutalist header `WED 12 JUN`
 * (weekday, day-of-month, month — all caps, local time).
 *
 * Example: formatDateHeader(Date.parse("2026-06-12")) → "FRI 12 JUN"
 */
export function formatDateHeader(ms: number): string {
  assertEpochMs(ms);
  const date = new Date(ms);
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  return `${weekday} ${date.getDate()} ${month}`;
}

/**
 * Render an elapsed millisecond span as `H:MM` once it crosses an hour,
 * otherwise `M:SS`. Sub-minute spans still read as `0:SS`.
 *
 * Example: formatDuration(3_900_000) → "1:05"; formatDuration(150_000) → "2:30"
 */
export function formatDuration(ms: number): string {
  assertEpochMs(ms);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  if (hours > 0) return `${hours}:${pad(Math.floor(totalSeconds / 60) % 60)}`;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${pad(totalSeconds % 60)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
