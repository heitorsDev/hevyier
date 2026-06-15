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
  // On a web deep-link / refresh there is no history to pop, so back() would
  // be a silent no-op (#13) — fall back to the tabs root instead.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));
  return (
    <Pressable onPress={goBack} accessibilityLabel="Go back">
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
