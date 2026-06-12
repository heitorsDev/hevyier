import { Link } from "expo-router";
import { Text, StyleSheet } from "react-native";

import { colors, fontSize, touchTarget } from "@/theme/tokens";

/**
 * Header-right gear linking to /settings, shown on every tab.
 * Usage: `headerRight: () => <SettingsGearLink />` in tab screenOptions.
 */
export function SettingsGearLink() {
  return (
    <Link href="/settings" accessibilityLabel="Settings">
      <Text style={styles.gear}>⚙</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  // lineHeight = touchTarget centers the glyph while guaranteeing the
  // full 48dp hit area in both axes.
  gear: {
    color: colors.fg,
    fontSize: fontSize.large,
    minWidth: touchTarget,
    lineHeight: touchTarget,
    textAlign: "center",
  },
});
