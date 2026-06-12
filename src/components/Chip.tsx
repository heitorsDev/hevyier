import { Pressable, Text, StyleSheet } from "react-native";

import { border, colors, fontSize, touchTarget } from "@/theme/tokens";

/**
 * Selectable bordered chip — selected state inverts (white fill / black
 * text), matching the brutalist "on = filled" convention used elsewhere.
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
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
  selected: { backgroundColor: colors.fg },
  label: { color: colors.fg, fontSize: fontSize.body },
  selectedLabel: { color: colors.bg, fontWeight: "700" },
});
