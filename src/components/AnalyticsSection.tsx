import type { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";

import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

/**
 * One titled stack on the Analytics tab (CONSISTENCY / MUSCLE VOLUME /
 * EXERCISE). Heading rule above its children; spacing owned here so the
 * sections read as a single ruled column.
 *
 * Usage: `<AnalyticsSection title="CONSISTENCY">…</AnalyticsSection>`
 */
export function AnalyticsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    fontWeight: "700",
    letterSpacing: 1,
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 6,
  },
});
