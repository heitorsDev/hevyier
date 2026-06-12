import { Pressable, Text, StyleSheet } from "react-native";

import { border, colors, fontSize, touchTarget } from "@/theme/tokens";

export type ButtonVariant = "default" | "primary" | "danger";

/**
 * Full-width bordered action button — the only button primitive in the app.
 * `primary` inverts (white fill / black text); `danger` keeps the outline
 * but its label is the caller's concern (e.g. "DELETE").
 *
 * Usage: `<BrutalButton label="SAVE" variant="primary" onPress={save} />`
 */
export function BrutalButton({
  label,
  onPress,
  variant = "default",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        primary && styles.primary,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          primary && styles.primaryLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: colors.fg },
  disabled: { borderColor: colors.disabled },
  label: {
    color: colors.fg,
    fontSize: fontSize.body,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  primaryLabel: { color: colors.bg },
  disabledLabel: { color: colors.disabled },
});
