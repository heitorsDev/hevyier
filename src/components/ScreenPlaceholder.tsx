import { Text, View, StyleSheet } from "react-native";

import { colors, fontSize } from "@/theme/tokens";

/**
 * Phase 0 stand-in body for routes whose real UI lands in later phases.
 * Usage: `<ScreenPlaceholder name="TODAY" />`
 */
export function ScreenPlaceholder({ name }: { name: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.label}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.muted,
    fontSize: fontSize.body,
  },
});
