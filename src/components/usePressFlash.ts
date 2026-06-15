import { Pressable, Text } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Press feedback for every tap target: a hard invert flash matching the
// app's brutalist "on = filled" convention (selected chips, checked rows).
// Fast in, slower out so a quick tap reads as a snap, not a fade.
const FLASH_IN_MS = 50;
const FLASH_OUT_MS = 130;

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const AnimatedText = Animated.createAnimatedComponent(Text);

export type InvertColors = { bg: string; fg: string };

/**
 * Drives a 0→1 press value with snap-in / settle-out timings. Private base
 * for the invert hooks below.
 */
function usePressProgress() {
  const progress = useSharedValue(0);
  const onPressIn = () => {
    progress.value = withTiming(1, { duration: FLASH_IN_MS });
  };
  const onPressOut = () => {
    progress.value = withTiming(0, { duration: FLASH_OUT_MS });
  };
  return { progress, onPressIn, onPressOut };
}

/**
 * Invert flash for a labeled tap target: swaps background and label color
 * between `rest` and `press` (typically inverses of each other).
 *
 * Usage: `const f = usePressInvert({bg, fg}, {bg: fg, fg: bg})` then spread
 * `f.onPressIn/onPressOut` on the pressable and apply `f.bgStyle` to it and
 * `f.labelStyle` to its `<AnimatedText>`.
 */
export function usePressInvert(rest: InvertColors, press: InvertColors) {
  const { progress, onPressIn, onPressOut } = usePressProgress();
  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [rest.bg, press.bg]),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [rest.fg, press.fg]),
  }));
  return { onPressIn, onPressOut, bgStyle, labelStyle };
}

/**
 * Background-only flash for rows with arbitrary children whose text colors
 * can't be inverted generically — the bg blinks to `pressBg` and back.
 *
 * Usage: `const f = usePressFlashBg(bg, fg)` then apply `f.bgStyle` to the
 * `<AnimatedPressable>` row.
 */
export function usePressFlashBg(restBg: string, pressBg: string) {
  const { progress, onPressIn, onPressOut } = usePressProgress();
  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [restBg, pressBg]),
  }));
  return { onPressIn, onPressOut, bgStyle };
}
