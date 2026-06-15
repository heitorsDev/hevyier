import { StyleSheet } from "react-native";

import {
  AnimatedPressable,
  AnimatedText,
  usePressInvert,
} from "@/components/usePressFlash";
import { border, colors, fontSize, touchTarget } from "@/theme/tokens";

export type ButtonVariant = "default" | "primary" | "danger";

/**
 * Full-width bordered action button — the only button primitive in the app.
 * `primary` inverts (white fill / black text); `danger` keeps the outline
 * but its label is the caller's concern (e.g. "DELETE"). Pressing flashes
 * to the inverted colors and back.
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
  // Rest colors follow the variant; press inverts them.
  const rest = primary ? { bg: colors.fg, fg: colors.bg } : { bg: colors.bg, fg: colors.fg };
  const press = { bg: rest.fg, fg: rest.bg };
  const flash = usePressInvert(rest, press);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onPressIn={flash.onPressIn}
      onPressOut={flash.onPressOut}
      style={[
        styles.button,
        primary && styles.primary,
        !disabled && flash.bgStyle,
        disabled && styles.disabled,
      ]}
    >
      <AnimatedText
        style={[
          styles.label,
          primary && styles.primaryLabel,
          !disabled && flash.labelStyle,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </AnimatedText>
    </AnimatedPressable>
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
