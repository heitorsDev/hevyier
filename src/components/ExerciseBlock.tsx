import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Press } from "@/components/Press";
import type { PlanExercise } from "@/data/plans";
import type { LoggedSet } from "@/data/store";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

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
    <View style={styles.block}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, done && styles.nameDone]} numberOfLines={2}>
          {exercise.name}
        </Text>
        <Text style={styles.prescription}>
          {exercise.sets}×{exercise.reps} · {exercise.rest}s
        </Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.focus}>{exercise.focus}</Text>
        {lastTime.length > 0 && (
          <Text style={styles.last}>
            ant: {lastTime.map((s) => `${formatKg(s.weightKg)}×${s.reps}`).join("  ")}
          </Text>
        )}
      </View>

      <View style={styles.chips}>
        {logged.map((set, index) => (
          // Tap removes — the only way to undo, and cheaper than a menu.
          <Pressable key={index} onPress={() => onRemove(index)} style={styles.chip} hitSlop={4}>
            <Text style={styles.chipText}>
              {formatKg(set.weightKg)}×{set.reps}
            </Text>
          </Pressable>
        ))}
        {Array.from({ length: Math.max(0, exercise.sets - logged.length) }).map((_, index) => (
          <View key={`slot-${index}`} style={styles.slot} />
        ))}
      </View>

      {/* Steppers and the log button sit on separate rows: at 360-393dp
          a single row clips the button off the right edge. */}
      <View style={styles.pad}>
        <View style={styles.padColumn}>
          <Press small label="−" onPress={() => setWeightKg((w) => Math.max(0, w - WEIGHT_STEP))} />
          <Text style={styles.value}>{formatKg(weightKg)}</Text>
          <Press small label="+" onPress={() => setWeightKg((w) => w + WEIGHT_STEP)} />
          <Text style={styles.unit}>kg</Text>
        </View>
        <View style={styles.padColumn}>
          <Press small label="−" onPress={() => setReps((r) => Math.max(1, r - 1))} />
          <Text style={styles.value}>{reps}</Text>
          <Press small label="+" onPress={() => setReps((r) => r + 1)} />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Press small label={`−${FINE_STEP}`} onPress={() => setWeightKg((w) => Math.max(0, w - FINE_STEP))} />
        <Press small label={`+${FINE_STEP}`} onPress={() => setWeightKg((w) => w + FINE_STEP)} />
        <Press
          filled
          label="✓"
          style={styles.logButton}
          onPress={() => onLog({ weightKg, reps })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderTopWidth: border,
    borderTopColor: colors.fg,
    paddingVertical: 12,
    gap: 6,
  },
  headerRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  name: { color: colors.fg, fontSize: fontSize.body, fontWeight: "700", flexShrink: 1 },
  nameDone: { color: colors.muted },
  prescription: { color: colors.fg, fontSize: fontSize.small, fontFamily: fontFamilyMono },
  focus: { color: colors.muted, fontSize: fontSize.small },
  last: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  chip: {
    borderWidth: border,
    borderColor: colors.fg,
    backgroundColor: colors.fg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { color: colors.bg, fontFamily: fontFamilyMono, fontSize: fontSize.small, fontWeight: "700" },
  slot: { borderWidth: border, borderColor: colors.disabled, width: 56, height: 26 },
  pad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  padColumn: { flexDirection: "row", alignItems: "center", gap: 6 },
  value: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.large,
    minWidth: 56,
    textAlign: "center",
  },
  logButton: { flex: 1, height: 36 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  unit: { color: colors.disabled, fontSize: fontSize.small, fontFamily: fontFamilyMono },
});
