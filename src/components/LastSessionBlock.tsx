import type { JSX } from "react";
import { Text, View, StyleSheet } from "react-native";

import type { LoggedSetView } from "@/repos/exerciseHistoryRepo";
import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

/**
 * Greyed, read-only LAST SESSION reference shown above the live set list
 * (decision #7). Warmups label `W1, W2, …` and work sets `1, 2, …`, each
 * numbered within its own type in list order. Omitted entirely when empty.
 *
 * Usage: `<LastSessionBlock sets={lastSets} />`
 */
export function LastSessionBlock({
  sets,
}: {
  sets: LoggedSetView[];
}): JSX.Element | null {
  if (sets.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.header}>LAST SESSION</Text>
      {labelSets(sets).map(({ label, set }, index) => (
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
  header: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    fontWeight: "700",
    paddingVertical: 6,
  },
  row: { minHeight: touchTarget, flexDirection: "row", alignItems: "center" },
  label: {
    width: touchTarget,
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
  setText: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
});
