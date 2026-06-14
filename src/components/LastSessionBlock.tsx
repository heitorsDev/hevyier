import { useState, type JSX } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

import type { LoggedSetView } from "@/repos/exerciseHistoryRepo";
import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
} from "@/theme/tokens";

/**
 * Collapsible greyed LAST SESSION reference above the live set list.
 * Collapsed by default to keep the logging screen uncluttered; tap header to
 * expand. Warmups label `W1, W2, …` and work sets `1, 2, …`. Omitted when empty.
 *
 * Usage: `<LastSessionBlock sets={lastSets} />`
 */
export function LastSessionBlock({
  sets,
}: {
  sets: LoggedSetView[];
}): JSX.Element | null {
  const [collapsed, setCollapsed] = useState(true);

  if (sets.length === 0) return null;
  return (
    <View style={styles.block}>
      <Pressable
        style={styles.headerRow}
        onPress={() => setCollapsed((c) => !c)}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? "expand last session" : "collapse last session"}
      >
        <Text style={styles.header}>LAST SESSION</Text>
        <Text style={styles.toggle}>{collapsed ? "▸" : "▾"}</Text>
      </Pressable>
      {!collapsed &&
        labelSets(sets).map(({ label, set }, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.setText}>
              {set.weightKg}kg × {set.reps}
            </Text>
          </View>
        ))}
    </View>
  );
}

/** Pair each set with its per-type label (`W1…` for warmup, `1…` for work). */
function labelSets(
  sets: LoggedSetView[],
): { label: string; set: LoggedSetView }[] {
  let warmups = 0;
  let works = 0;
  return sets.map((set) => {
    if (set.type === "warmup") return { label: `W${++warmups}`, set };
    return { label: `${++works}`, set };
  });
}

const styles = StyleSheet.create({
  block: { borderColor: colors.muted, borderBottomWidth: border },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  header: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    fontWeight: "700",
  },
  toggle: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    fontWeight: "700",
  },
  // Compact rows — read-only, no tap needed, 28dp is enough.
  row: { height: 28, flexDirection: "row", alignItems: "center" },
  label: {
    width: 32,
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
  setText: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
});
