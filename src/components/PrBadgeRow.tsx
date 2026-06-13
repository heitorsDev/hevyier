import { Text, View, StyleSheet } from "react-native";

import { formatDateHeader } from "@/domain/sessionFormat";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

/**
 * One PR badge: a label, its value, and the date it was set. A null
 * `dateMs` (no record yet) shows the value as `—`.
 *
 * Usage: `<PrBadgeRow label="HEAVIEST" value="120 kg × 3" dateMs={d} />`
 */
export function PrBadgeRow({
  label,
  value,
  dateMs,
}: {
  label: string;
  value: string;
  dateMs: number | null;
}) {
  const present = dateMs !== null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{present ? value : "—"}</Text>
      <Text style={styles.date}>{present ? formatDateHeader(dateMs) : ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingVertical: 6,
  },
  label: {
    width: 96,
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    letterSpacing: 1,
  },
  value: {
    flex: 1,
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
  date: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
});
