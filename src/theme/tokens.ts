// React Navigation's header options take plain style objects, not
// classNames, so the handful of values the native chrome needs are
// mirrored here. Everything else lives in global.css — keep these in sync
// with the @theme block there.
export const colors = {
  bg: "#000000",
  fg: "#FFFFFF",
} as const;

export const fontSize = {
  body: 18,
} as const;
