import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Press } from "@/components/Press";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

export function formatClock(seconds: number): string {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** Counts down from whatever `start` was last called with; keeps counting
 *  past zero into negative so an overlong rest is still visible. */
export function useRestTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (endsAt === null) return;
    interval.current = setInterval(() => setNow(Date.now()), 250);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [endsAt]);

  return {
    remaining: endsAt === null ? null : Math.round((endsAt - now) / 1000),
    start: (seconds: number) => {
      setNow(Date.now());
      setEndsAt(Date.now() + seconds * 1000);
    },
    stop: () => setEndsAt(null),
  };
}

type Props = { remaining: number; onDismiss: () => void };

export function RestTimerBar({ remaining, onDismiss }: Props) {
  const over = remaining <= 0;
  return (
    <View style={[styles.bar, over && styles.barOver]}>
      <Text style={[styles.label, over && styles.labelOver]}>DESCANSO</Text>
      <Text style={[styles.clock, over && styles.labelOver]}>{formatClock(remaining)}</Text>
      <Press small label="✕" onPress={onDismiss} style={over ? styles.dismissOver : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: border,
    borderTopColor: colors.fg,
    backgroundColor: colors.bg,
  },
  // Past zero the bar inverts — visible without reading the digits.
  barOver: { backgroundColor: colors.fg },
  label: { color: colors.muted, fontSize: fontSize.small, letterSpacing: 2 },
  labelOver: { color: colors.bg },
  clock: { color: colors.fg, fontFamily: fontFamilyMono, fontSize: fontSize.large, fontWeight: "700" },
  dismissOver: { borderColor: colors.bg },
});
