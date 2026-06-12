import { Pressable, Text, View, StyleSheet } from "react-native";

import { Stepper } from "@/components/Stepper";
import { border, colors, fontSize, touchTarget } from "@/theme/tokens";

/**
 * One editable plan-exercise row: name, warmup/work set Steppers, reorder
 * arrows (disabled at list ends) and a remove ✕.
 *
 * Usage: `<PlanExerciseEditorRow name="Squat" warmupSets={2} workSets={3} … />`
 */
export function PlanExerciseEditorRow({
  name,
  warmupSets,
  workSets,
  isFirst,
  isLast,
  onWarmupChange,
  onWorkChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  name: string;
  warmupSets: number;
  workSets: number;
  isFirst: boolean;
  isLast: boolean;
  onWarmupChange: (n: number) => void;
  onWorkChange: (n: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.controls}>
          <IconButton label="▲" onPress={onMoveUp} disabled={isFirst} />
          <IconButton label="▼" onPress={onMoveDown} disabled={isLast} />
          <IconButton label="✕" onPress={onRemove} disabled={false} />
        </View>
      </View>
      <View style={styles.stepperLine}>
        <LabeledStepper label="W" value={warmupSets} onChange={onWarmupChange} />
        <LabeledStepper label="WORK" value={workSets} onChange={onWorkChange} />
      </View>
    </View>
  );
}

function LabeledStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.labeled}>
      <Text style={styles.setLabel}>{label}</Text>
      <Stepper value={value} onChange={onChange} step={1} min={0} />
    </View>
  );
}

function IconButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={styles.icon}
    >
      <Text style={[styles.iconLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingVertical: 8,
    gap: 8,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { color: colors.fg, fontSize: fontSize.body, flexShrink: 1 },
  controls: { flexDirection: "row" },
  icon: {
    width: touchTarget,
    height: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    marginLeft: -border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: { color: colors.fg, fontSize: fontSize.body, fontWeight: "700" },
  disabledLabel: { color: colors.disabled },
  stepperLine: { flexDirection: "row", justifyContent: "space-between" },
  labeled: { flexDirection: "row", alignItems: "center", gap: 8 },
  setLabel: { color: colors.muted, fontSize: fontSize.small, fontWeight: "700" },
});
