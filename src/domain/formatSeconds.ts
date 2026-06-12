// Pure formatter for rest-timer durations. No react-native imports so it
// stays unit-testable in plain jest.

/**
 * Render a non-negative second count as `m:ss` (seconds zero-padded to 2).
 *
 * Example: formatSeconds(150) → "2:30"
 */
export function formatSeconds(total: number): string {
  if (!Number.isInteger(total) || total < 0) {
    throw new Error(
      `formatSeconds got ${total}, expected a non-negative integer second count`,
    );
  }
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
