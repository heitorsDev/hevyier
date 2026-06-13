import { Text, View, StyleSheet } from "react-native";

import { colors, fontFamilyMono, fontSize, touchTarget } from "@/theme/tokens";

/**
 * One read-only set line in a History detail exercise section, e.g.
 * `W1 60.0 × 10` — mono label cell + value, white-on-black (taps happen on
 * the section, not the line).
 *
 * Usage: `<HistorySetLine label="W1" text="60.0 × 10" />`
 */
export function HistorySetLine({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  label: {
    width: touchTarget,
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
  value: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
});
