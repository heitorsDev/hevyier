import { useRouter } from "expo-router";
import { Pressable, Text, StyleSheet } from "react-native";

import { colors, fontSize, touchTarget } from "@/theme/tokens";

/**
 * Header-left back arrow that pops the current screen. Needed because the
 * platform default back control is absent on web (#13).
 * Usage: `headerLeft: () => <HeaderBackLink />` in a Stack.Screen's options.
 */
export function HeaderBackLink() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
      <Text style={styles.arrow}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // lineHeight = touchTarget centers the glyph while guaranteeing the
  // full 48dp hit area in both axes (mirrors SettingsGearLink).
  arrow: {
    color: colors.fg,
    fontSize: fontSize.large,
    minWidth: touchTarget,
    lineHeight: touchTarget,
    textAlign: "center",
  },
});
