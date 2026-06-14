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
  // Container provides the outer frame; buttons draw only internal dividers.
  return (
    <View style={styles.strip}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="decrement reps"
        disabled={disabled}
        onPress={decrement}
        style={styles.decBtn}
      >
        <Text style={[styles.btnLabel, disabled && styles.disabledText]}>−</Text>
      </Pressable>
      <Text style={[styles.value, disabled && styles.disabledText]}>
        {reps === null ? "—" : String(reps)}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="increment reps"
        disabled={disabled}
        onPress={increment}
        style={styles.incBtn}
      >
        <Text style={[styles.btnLabel, disabled && styles.disabledText]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.fg,
    borderWidth: border,
  },
  decBtn: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRightColor: colors.fg,
    borderRightWidth: border,
  },
  incBtn: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderLeftColor: colors.fg,
    borderLeftWidth: border,
  },
  btnLabel: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
  },
  value: {
    minWidth: touchTarget,
    textAlign: "center",
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
  disabledText: { color: colors.disabled },
});
