import React, { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

import { useRestTimer } from "@/hooks/useRestTimer";
import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

function formatRemaining(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Inverted countdown bar shown while a rest timer runs; auto-dismisses
 * when time is up. Renders nothing when no timer is active.
 *
 * Usage: `<RestTimerBanner />` (inside <RestTimerProvider>)
 */
export function RestTimerBanner(): React.JSX.Element | null {
  const { state, dismiss } = useRestTimer();
  // Lazy initializer keeps Date.now() out of the render body.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!state) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state]);

  const remaining = state ? state.endsAt - now : 0;
  const isOver = remaining <= 0;

  useEffect(() => {
    if (state && isOver) dismiss();
  }, [state, isOver, dismiss]);

  if (!state) return null;
  const text = isOver ? "REST OVER" : formatRemaining(remaining);
  return (
    <View style={styles.bar}>
      <Text style={styles.countdown}>{text}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="DISMISS"
        onPress={dismiss}
        style={styles.dismiss}
      >
        <Text style={styles.dismissLabel}>✕ DISMISS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: "100%",
    backgroundColor: colors.fg,
    borderColor: colors.bg,
    borderWidth: border,
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  countdown: {
    color: colors.bg,
    fontSize: fontSize.large,
    fontFamily: fontFamilyMono,
    fontWeight: "700",
  },
  dismiss: {
    width: "100%",
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissLabel: {
    color: colors.bg,
    fontSize: fontSize.body,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
