import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { border, colors, touchTarget } from "@/theme/tokens";

/**
 * Bordered, full-width tappable row — the table-like list primitive.
 * Borders collapse between adjacent rows: each row draws only its bottom
 * edge, so a stacked list reads as a single ruled table.
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
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {children}
    </Pressable>
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
