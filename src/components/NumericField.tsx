import { TextInput, StyleSheet } from "react-native";

import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

/**
 * Tappable mono weight cell — the keyboard fallback when the lifter wants
 * an exact number instead of plate-pad deltas. Shows `—` until touched;
 * whole kg render bare (`60`), fractions to one decimal (`62.5`). Empty
 * input stays null; negatives clamp to 0. `disabled` greys + locks it.
 *
 * Usage: `<NumericField weightKg={row.weightKg} onChange={setWeight} />`
 */
export function NumericField({
  weightKg,
  onChange,
  disabled = false,
}: {
  weightKg: number | null;
  onChange: (kg: number) => void;
  disabled?: boolean;
}) {
  const handleChange = (text: string) => {
    if (text.trim() === "") return;
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed)) return;
    onChange(parsed < 0 ? 0 : parsed);
  };
  return (
    <TextInput
      accessibilityLabel="weight in kilograms"
      editable={!disabled}
      keyboardType="numeric"
      selectTextOnFocus
      value={formatWeight(weightKg)}
      onChangeText={handleChange}
      style={[styles.cell, disabled && styles.disabled]}
    />
  );
}

function formatWeight(weightKg: number | null): string {
  if (weightKg === null) return "—";
  return Number.isInteger(weightKg) ? String(weightKg) : weightKg.toFixed(1);
}

const styles = StyleSheet.create({
  cell: {
    minWidth: touchTarget * 1.5,
    height: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    textAlign: "center",
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    padding: 0,
  },
  disabled: { borderColor: colors.disabled, color: colors.disabled },
});
