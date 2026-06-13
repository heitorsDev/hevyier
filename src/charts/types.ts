// Public chart interface owned by this project. Screen code imports ONLY
// these shapes + the wrapper components — never victory-native directly
// (decision #11: chart lib wrapped behind a thin project interface).

// Index signature included so the datum satisfies victory-native's
// `Record<string, unknown>` data constraint without leaking that detail.
/** One {x, y} datum. `x` is an epoch-ms date for trend/bar charts. */
export type ChartPoint = {
  x: number;
  y: number;
  [field: string]: number;
};
