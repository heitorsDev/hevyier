import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { View } from "@/components/ui/primitives";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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
  // Past zero the bar inverts — visible without reading the digits.
  const over = remaining <= 0;
  return (
    <View
      className={cn(
        "flex-row items-center justify-between gap-3 px-4 py-2 border-t border-fg",
        over ? "bg-fg" : "bg-bg",
      )}
    >
      <Text variant="label" className={over ? "text-bg" : undefined}>
        DESCANSO
      </Text>
      <Text variant="display" className={cn("font-mono", over && "text-bg")}>
        {formatClock(remaining)}
      </Text>
      <Button size="sm" className={over ? "border-bg" : undefined} onPress={onDismiss}>
        <Text className={over ? "text-bg" : undefined}>✕</Text>
      </Button>
    </View>
  );
}
