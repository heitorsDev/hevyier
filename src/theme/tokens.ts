// Brutalist monochrome theme. Hard 1px borders, no rounded corners —
// `borderRadius` is intentionally absent from this app and must never be set.
// muted/disabled greys are the only non-pure values: muted = LAST SESSION
// reference rows, disabled = archived items / inactive controls.

export const colors = {
  bg: "#000",
  fg: "#FFF",
  muted: "#888",
  disabled: "#444",
} as const;

export const border = 1;

// All numerals render in monospace (system monospace on Android) so
// table-like set rows keep column alignment.
export const fontFamilyMono = "monospace";

// Type scale capped at 3 sizes. Sized for one-handed gym use —
// readable at arm's length, generous over default RN sizes.
export const fontSize = {
  small: 14,
  body: 18,
  large: 28,
} as const;

// dp; above the iOS 44pt minimum.
export const touchTarget = 48;

// Bottom tab bar height (dp). Taller than RN's ~50dp default so tab
// switches land reliably with thumbs mid-workout.
export const tabBarHeight = 64;
