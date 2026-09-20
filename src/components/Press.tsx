import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { border, colors, fontFamilyMono, fontSize, touchTarget } from "@/theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  /** Filled reads as the primary action of its row. */
  filled?: boolean;
  style?: ViewStyle;
  small?: boolean;
};

/** The only button in the app. Hard border, no radius, inverts while held. */
export function Press({ label, onPress, filled, style, small }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        filled && styles.filled,
        // Held state inverts rather than fading — legible in gym lighting.
        pressed && styles.pressed,
        style,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.label,
            small && styles.labelSmall,
            (filled || pressed) && styles.labelInverted,
            filled && pressed && styles.label,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: touchTarget,
    height: touchTarget,
    borderWidth: border,
    borderColor: colors.fg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  small: { height: 36, minWidth: 36, paddingHorizontal: 8 },
  filled: { backgroundColor: colors.fg },
  pressed: { backgroundColor: colors.fg },
  label: {
    color: colors.fg,
    fontSize: fontSize.body,
    fontFamily: fontFamilyMono,
    fontWeight: "700",
  },
  labelSmall: { fontSize: fontSize.small },
  labelInverted: { color: colors.bg },
});
