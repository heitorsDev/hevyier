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
  // Container provides the outer frame; buttons draw only internal dividers.
  return (
    <View style={styles.strip}>
      <StepperButton label="−" onPress={decrement} disabled={value <= min} isLeft />
      <Text style={styles.value}>{format ? format(value) : String(value)}</Text>
      <StepperButton label="+" onPress={increment} disabled={false} isLeft={false} />
    </View>
  );
}

const REST = { bg: colors.bg, fg: colors.fg };
const PRESS = { bg: colors.fg, fg: colors.bg };

function StepperButton({
  label,
  onPress,
  disabled,
  isLeft,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  isLeft: boolean;
}) {
  const flash = usePressInvert(REST, PRESS);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label === "−" ? "decrement" : "increment"}
      disabled={disabled}
      onPress={onPress}
      onPressIn={flash.onPressIn}
      onPressOut={flash.onPressOut}
      style={[styles.btn, isLeft ? styles.leftBtn : styles.rightBtn, !disabled && flash.bgStyle]}
    >
      <AnimatedText style={[styles.btnLabel, disabled ? styles.disabledLabel : flash.labelStyle]}>
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
  btn: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  leftBtn: {
    borderRightColor: colors.fg,
    borderRightWidth: border,
  },
  rightBtn: {
    borderLeftColor: colors.fg,
    borderLeftWidth: border,
  },
  btnLabel: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  disabledLabel: { color: colors.disabled },
  value: {
    minWidth: touchTarget * 1.5,
    textAlign: "center",
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
});
