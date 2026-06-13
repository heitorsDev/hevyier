import type { JSX } from "react";
import { View, StyleSheet } from "react-native";

import type { HeatmapCell } from "@/domain/analytics/consistency";
import { border, colors } from "@/theme/tokens";

// Binary v1 (decision #11): a cell is white when it has a session, dark
// grey otherwise — no intensity steps. 7 weekday rows (Monday top), one
// column per week. Pure View grid; no victory-native, no Skia.
const CELL = 10;
const GAP = 2;
const NO_SESSION = "#222";

/**
 * Consistency grid: 7 rows (Mon→Sun) × `weekCount` week columns. Cells come
 * from `heatmapCells`; filled cells render white, empty render dark grey.
 *
 * Usage: `<Heatmap cells={heatmapCells(dates, now, 26)} weekCount={26} />`
 */
export function Heatmap({
  cells,
  weekCount,
}: {
  cells: HeatmapCell[];
  weekCount: number;
}): JSX.Element {
  const rows = Array.from({ length: 7 }, (_, weekday) =>
    cells.filter((cell) => cell.weekday === weekday).sort((a, b) => a.weekIndex - b.weekIndex),
  );
  return (
    <View accessibilityLabel="session consistency grid" style={styles.grid}>
      {rows.map((row, weekday) => (
        <View key={weekday} style={styles.row}>
          {fillRow(row, weekCount).map((hasSession, weekIndex) => (
            <View
              key={weekIndex}
              style={[styles.cell, { backgroundColor: hasSession ? colors.fg : NO_SESSION }]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Booleans for every column, padding short rows so columns stay aligned. */
function fillRow(row: HeatmapCell[], weekCount: number): boolean[] {
  const flags = new Array<boolean>(weekCount).fill(false);
  for (const cell of row) flags[cell.weekIndex] = cell.hasSession;
  return flags;
}

const styles = StyleSheet.create({
  grid: { gap: GAP, borderColor: colors.fg, borderWidth: border, padding: 8 },
  row: { flexDirection: "row", gap: GAP },
  cell: { width: CELL, height: CELL },
});
