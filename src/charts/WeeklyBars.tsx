import type { JSX } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Bar, CartesianChart } from "victory-native";

import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

import type { ChartPoint } from "./types";

const CHART_HEIGHT = 160;

/**
 * Monochrome weekly bar chart over victory-native — white square-cornered
 * fills on black, hairline axes, no rounded corners (brutalist). Skia text
 * fonts are avoided; the caption/peak read as plain mono RN text. Empty
 * data renders nothing. Screens depend on this, never victory-native.
 *
 * Usage: `<WeeklyBars label="CHEST" unit="kg" points={weeklyVolume} />`
 */
export function WeeklyBars({
  label,
  unit,
  points,
}: {
  label: string;
  unit: string;
  points: ChartPoint[];
}): JSX.Element | null {
  if (points.length === 0) return null;
  const peak = Math.max(...points.map((point) => point.y));
  return (
    <View style={styles.block}>
      <Text style={styles.caption}>{label}</Text>
      <View style={styles.canvas}>
        <CartesianChart
          data={points}
          xKey="x"
          yKeys={["y"]}
          domain={{ y: [0, peak === 0 ? 1 : peak] }}
          axisOptions={{ lineColor: colors.disabled, lineWidth: border, font: null }}
        >
          {({ points: rendered, chartBounds }) => (
            <Bar
              points={rendered.y}
              chartBounds={chartBounds}
              color={colors.fg}
              innerPadding={0.25}
            />
          )}
        </CartesianChart>
      </View>
      <Text style={styles.range}>
        PEAK {peak} {unit}
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
