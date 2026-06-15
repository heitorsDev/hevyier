import { StyleSheet } from "react-native";

import {
  AnimatedPressable,
  AnimatedText,
  usePressInvert,
} from "@/components/usePressFlash";
import { border, colors, fontSize, touchTarget } from "@/theme/tokens";

/**
 * Selectable bordered chip — selected state inverts (white fill / black
 * text), matching the brutalist "on = filled" convention used elsewhere.
 * Pressing flashes toward the opposite of the current selection.
 *
 * Usage: `<Chip label="barbell" selected={eq === "barbell"} onPress={pick} />`
 */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  // Rest reflects the current selection; press flashes to the inverse.
  const rest = selected ? { bg: colors.fg, fg: colors.bg } : { bg: colors.bg, fg: colors.fg };
  const press = { bg: rest.fg, fg: rest.bg };
  const flash = usePressInvert(rest, press);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={flash.onPressIn}
      onPressOut={flash.onPressOut}
      style={[styles.chip, flash.bgStyle]}
    >
      <AnimatedText style={[styles.label, selected && styles.selectedWeight, flash.labelStyle]}>
        {label}
      </AnimatedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  label: { color: colors.fg, fontSize: fontSize.body },
  selectedWeight: { fontWeight: "700" },
});
