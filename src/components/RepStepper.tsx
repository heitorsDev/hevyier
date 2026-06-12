import { Pressable, Text, View, StyleSheet } from "react-native";

import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

/**
 * `[−] reps [+]` rep counter for a set row. Shows `—` until first tap;
 * `+` seeds null→1 then increments, `−` floors at 1. `disabled` greys the
 * controls (e.g. while the row is checked) and ignores taps.
 *
 * Usage: `<RepStepper reps={row.reps} onChange={setReps} />`
 */
export function RepStepper({
  reps,
  onChange,
  disabled = false,
}: {
  reps: number | null;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const decrement = () => onChange(Math.max(1, (reps ?? 1) - 1));
  const increment = () => onChange(reps === null ? 1 : reps + 1);
  return (
    <View style={styles.row}>
      <RepButton label="−" onPress={decrement} disabled={disabled} />
      <Text style={[styles.value, disabled && styles.disabledLabel]}>
        {reps === null ? "—" : String(reps)}
      </Text>
      <RepButton label="+" onPress={increment} disabled={disabled} />
    </View>
  );
}

function RepButton({
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
      accessibilityLabel={label === "−" ? "decrement reps" : "increment reps"}
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={[styles.label, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  button: {
    width: touchTarget,
    height: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  disabledLabel: { color: colors.disabled },
  value: {
    minWidth: touchTarget,
    textAlign: "center",
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
});
