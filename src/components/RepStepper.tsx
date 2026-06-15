import { Text, View, StyleSheet } from "react-native";

import {
  AnimatedPressable,
  AnimatedText,
  usePressInvert,
} from "@/components/usePressFlash";
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
      <RepButton label="−" onPress={decrement} disabled={disabled} side="left" />
      <Text style={[styles.value, disabled && styles.disabledText]}>
        {reps === null ? "—" : String(reps)}
      </Text>
      <RepButton label="+" onPress={increment} disabled={disabled} side="right" />
    </View>
  );
}

const REST = { bg: colors.bg, fg: colors.fg };
const PRESS = { bg: colors.fg, fg: colors.bg };

function RepButton({
  label,
  onPress,
  disabled,
  side,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  side: "left" | "right";
}) {
  const flash = usePressInvert(REST, PRESS);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label === "−" ? "decrement reps" : "increment reps"}
      disabled={disabled}
      onPress={onPress}
      onPressIn={flash.onPressIn}
      onPressOut={flash.onPressOut}
      style={[side === "left" ? styles.decBtn : styles.incBtn, !disabled && flash.bgStyle]}
    >
      <AnimatedText style={[styles.btnLabel, disabled ? styles.disabledText : flash.labelStyle]}>
        {label}
      </AnimatedText>
    </AnimatedPressable>
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
