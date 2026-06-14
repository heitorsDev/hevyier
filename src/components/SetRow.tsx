import { Pressable, Text, View, StyleSheet } from "react-native";

import { NumericField } from "@/components/NumericField";
import { RepStepper } from "@/components/RepStepper";
import type { SetRowState } from "@/domain/setRows";
import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

/**
 * One bordered logging row: label · weight · reps · ✓. Checked rows invert
 * (white fill, controls locked — un-✓ to edit); the active unchecked row
 * is emphasised. Tapping the label/weight body selects; ✓ toggles.
 *
 * Usage: `<SetRow row={r} isActive onSelect={pick} onWeightChange={…} … />`
 */
export function SetRow({
  row,
  isActive,
  onSelect,
  onWeightChange,
  onRepsChange,
  onToggleCheck,
}: {
  row: SetRowState;
  isActive: boolean;
  onSelect: () => void;
  onWeightChange: (kg: number) => void;
  onRepsChange: (reps: number) => void;
  onToggleCheck: () => void;
}) {
  const checked = row.setId !== null;
  const active = isActive && !checked;
  return (
    <View style={[styles.row, checked && styles.checkedRow]}>
      <Pressable style={styles.body} onPress={onSelect} disabled={checked}>
        <View style={[styles.labelCell, active && styles.activeCell]}>
          <Text
            style={[
              styles.label,
              (checked || active) && styles.invertedText,
            ]}
          >
            {row.label}
          </Text>
        </View>
        <NumericField
          weightKg={row.weightKg}
          onChange={onWeightChange}
          disabled={checked}
        />
      </Pressable>
      <RepStepper reps={row.reps} onChange={onRepsChange} disabled={checked} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="toggle set logged"
        style={styles.checkCell}
        onPress={onToggleCheck}
      >
        <Text style={[styles.check, checked && styles.invertedText]}>✓</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderBottomWidth: border,
    flexDirection: "row",
    alignItems: "center",
  },
  checkedRow: { backgroundColor: colors.fg },
  body: { flexDirection: "row", alignItems: "center", flex: 1 },
  labelCell: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCell: { backgroundColor: colors.fg },
  label: { color: colors.fg, fontFamily: fontFamilyMono, fontSize: fontSize.body },
  invertedText: { color: colors.bg },
  checkCell: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  check: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
});
