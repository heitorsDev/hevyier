import { Pressable, Text, View, StyleSheet } from "react-native";

import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

/**
 * `[−] value [+]` integer stepper. Clamps at `min` (floor); `step` sizes
 * each tap. `format` renders the value (e.g. seconds → "2:30"); raw int
 * shown by default.
 *
 * Usage: `<Stepper value={work} onChange={setWork} min={0} step={1} />`
 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  format,
}: {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  format?: (value: number) => string;
}) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(value + step);
  return (
    <View style={styles.row}>
      <StepperButton label="−" onPress={decrement} disabled={value <= min} />
      <Text style={styles.value}>{format ? format(value) : String(value)}</Text>
      <StepperButton label="+" onPress={increment} disabled={false} />
    </View>
  );
}

function StepperButton({
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
      accessibilityLabel={label === "−" ? "decrement" : "increment"}
      disabled={disabled}
      onPress={onPress}
      style={styles.stepButton}
    >
      <Text style={[styles.stepLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  stepButton: {
    width: touchTarget,
    height: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  disabledLabel: { color: colors.disabled },
  value: {
    minWidth: touchTarget * 1.5,
    textAlign: "center",
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
});
