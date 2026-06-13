import { Text, StyleSheet } from "react-native";

import { colors, fontFamilyMono, fontSize } from "@/theme/tokens";

/**
 * Month separator row on the History list, e.g. `JUNE 2026`. Muted, mono,
 * letter-spaced — a quiet ruler between the louder session rows.
 *
 * Usage: `<HistoryMonthHeader label="JUNE 2026" />`
 */
export function HistoryMonthHeader({ label }: { label: string }) {
  return <Text style={styles.header}>{label}</Text>;
}

const styles = StyleSheet.create({
  header: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    letterSpacing: 1,
    marginTop: 16,
    paddingBottom: 4,
  },
});
