import type { JSX } from "react";
import { Text, View, StyleSheet } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

import type { ChartPoint } from "./types";

const CHART_HEIGHT = 160;

/**
 * Monochrome progression line over victory-native — white stroke on black,
 * hairline axes, no gridlines. Skia axis-label fonts need a loaded TTF, so
 * range labels are plain mono RN text instead (kept inside this wrapper so
 * screens never touch victory-native). Empty data renders nothing.
 *
 * Usage: `<TrendLine label="MAX WEIGHT" unit="kg" points={maxPts} />`
 */
export function TrendLine({
  label,
  unit,
  points,
}: {
  label: string;
  unit: string;
  points: ChartPoint[];
}): JSX.Element | null {
  if (points.length === 0) return null;
  const values = points.map((point) => point.y);
  return (
    <View style={styles.block}>
      <Text style={styles.caption}>{label}</Text>
      <View style={styles.canvas}>
        <CartesianChart
          data={points}
          xKey="x"
          yKeys={["y"]}
          axisOptions={{ lineColor: colors.disabled, lineWidth: border, font: null }}
        >
          {({ points: rendered }) => (
            <Line points={rendered.y} color={colors.fg} strokeWidth={2} />
          )}
        </CartesianChart>
      </View>
      <Text style={styles.range}>
        {Math.min(...values)}–{Math.max(...values)} {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { borderColor: colors.fg, borderWidth: border, padding: 8, gap: 4 },
  caption: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    letterSpacing: 1,
  },
  canvas: { height: CHART_HEIGHT },
  range: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    alignSelf: "flex-end",
  },
});
