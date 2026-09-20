import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Pressable, View } from "@/components/ui/primitives";
import { Text } from "@/components/ui/text";
import type { PlanExercise } from "@/data/plans";
import type { LoggedSet } from "@/data/store";

const WEIGHT_STEP = 2.5;
const FINE_STEP = 1.25;

type Props = {
  exercise: PlanExercise;
  logged: LoggedSet[];
  lastTime: LoggedSet[];
  onLog: (set: { weightKg: number; reps: number }) => void;
  onRemove: (index: number) => void;
};

function formatKg(kg: number): string {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(2).replace(/0$/, "");
}

/** One spreadsheet row: prescription header, logged set chips, and the
 *  keyboard-free pad that writes the next set. */
export function ExerciseBlock({ exercise, logged, lastTime, onLog, onRemove }: Props) {
  // Seed the pad from what was done most recently for this movement —
  // the common case is repeating or nudging the previous load.
  const seed = logged[logged.length - 1] ?? lastTime[lastTime.length - 1];
  const [weightKg, setWeightKg] = useState(seed?.weightKg ?? 20);
  const [reps, setReps] = useState(seed?.reps ?? 8);

  const done = logged.length >= exercise.sets;

  return (
    <View className="border-t border-border py-3 gap-1.5">
      <CardHeader>
        <Text variant="heading" className={done ? "text-muted-foreground" : undefined} numberOfLines={2}>
          {exercise.name}
        </Text>
        <Text variant="monoMuted">
          {exercise.sets}×{exercise.reps} · {exercise.rest}s
        </Text>
      </CardHeader>

      <CardHeader>
        <Text variant="muted">{exercise.focus}</Text>
        {lastTime.length > 0 && (
          <Text variant="monoMuted">
            ant: {lastTime.map((s) => `${formatKg(s.weightKg)}×${s.reps}`).join("  ")}
          </Text>
        )}
      </CardHeader>

      <View className="flex-row flex-wrap gap-1.5 mt-0.5">
        {logged.map((set, index) => (
          // Tap removes — the only way to undo, and cheaper than a menu.
          <Pressable key={index} onPress={() => onRemove(index)} hitSlop={4}>
            <Badge>
              <Text>
                {formatKg(set.weightKg)}×{set.reps}
              </Text>
            </Badge>
          </Pressable>
        ))}
        {Array.from({ length: Math.max(0, exercise.sets - logged.length) }).map((_, index) => (
          <Badge key={`slot-${index}`} variant="slot" />
        ))}
      </View>

      {/* Steppers and the log button sit on separate rows: at 360-393dp
          a single row clips the button off the right edge. */}
      <View className="flex-row items-center justify-between gap-2 mt-1">
        <View className="flex-row items-center gap-1.5">
          <Button variant="outline" size="icon" onPress={() => setWeightKg((w) => Math.max(0, w - WEIGHT_STEP))}>
            <Text>−</Text>
          </Button>
          <Text variant="display" className="font-mono min-w-14 text-center">
            {formatKg(weightKg)}
          </Text>
          <Button variant="outline" size="icon" onPress={() => setWeightKg((w) => w + WEIGHT_STEP)}>
            <Text>+</Text>
          </Button>
          <Text className="text-sm font-mono text-muted-foreground">kg</Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Button variant="outline" size="icon" onPress={() => setReps((r) => Math.max(1, r - 1))}>
            <Text>−</Text>
          </Button>
          <Text variant="display" className="font-mono min-w-14 text-center">
            {reps}
          </Text>
          <Button variant="outline" size="icon" onPress={() => setReps((r) => r + 1)}>
            <Text>+</Text>
          </Button>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Button variant="secondary" size="sm" onPress={() => setWeightKg((w) => Math.max(0, w - FINE_STEP))}>
          <Text>−{FINE_STEP}</Text>
        </Button>
        <Button variant="secondary" size="sm" onPress={() => setWeightKg((w) => w + FINE_STEP)}>
          <Text>+{FINE_STEP}</Text>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onPress={() => onLog({ weightKg, reps })}
        >
          <Text>✓</Text>
        </Button>
      </View>
    </View>
  );
}
