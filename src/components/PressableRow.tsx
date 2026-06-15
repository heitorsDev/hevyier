import type { ReactNode } from "react";
import { StyleSheet } from "react-native";

import { AnimatedPressable, usePressFlashBg } from "@/components/usePressFlash";
import { border, colors, touchTarget } from "@/theme/tokens";

/**
 * Bordered, full-width tappable row — the table-like list primitive.
 * Borders collapse between adjacent rows: each row draws only its bottom
 * edge, so a stacked list reads as a single ruled table. Tapping flashes
 * the background white; children keep their own colors, so this is a
 * bg-only flash (their text can't be inverted generically).
 *
 * Usage: `<PressableRow onPress={open}><Text>…</Text></PressableRow>`
 */
export function PressableRow({
  onPress,
  children,
}: {
  onPress: () => void;
  children: ReactNode;
}) {
  const flash = usePressFlashBg(colors.bg, colors.fg);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={flash.onPressIn}
      onPressOut={flash.onPressOut}
      style={[styles.row, flash.bgStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderBottomWidth: border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
