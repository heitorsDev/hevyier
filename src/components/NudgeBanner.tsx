import type { JSX } from "react";
import { Text, View, StyleSheet, type ViewStyle } from "react-native";

import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

const NUDGE_COPY = "Same as last 2 sessions — consider adding weight.";

/**
 * Progressive-overload nudge (decision #7): a bordered monochrome banner the
 * host renders above LastSessionBlock when overload is due. Static copy only.
 *
 * Usage: `<NudgeBanner />`
 */
export function NudgeBanner({ style }: { style?: ViewStyle }): JSX.Element {
  return (
    <View style={[styles.banner, style]}>
      <Text style={styles.text}>{NUDGE_COPY}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderColor: colors.fg,
    borderWidth: border,
    backgroundColor: colors.bg,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
});
