import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, StyleSheet } from "react-native";

import { Heatmap } from "@/charts";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { ExerciseAnalytics } from "@/components/ExerciseAnalytics";
import { MuscleVolumeBars } from "@/components/MuscleVolumeBars";
import { appDb } from "@/db/bootstrap";
import { heatmapCells } from "@/domain/analytics/consistency";
import { weeklyVolumeByMuscle } from "@/domain/analytics/muscleVolume";
import { recentWeekStarts } from "@/domain/analytics/weeks";
import {
  exerciseSetsSince,
  exercisesByRecency,
  finishedSessionDates,
  muscleMapsForExercises,
  type PerformedExercise,
} from "@/repos/analyticsRepo";
import type { MuscleWeekVolume } from "@/domain/analytics/muscleVolume";
import type { HeatmapCell } from "@/domain/analytics/consistency";
import { colors, fontFamilyMono, fontSize } from "@/theme/tokens";

const HEATMAP_WEEKS = 26; // ~6 months
const VOLUME_WEEKS = 8;

interface AnalyticsView {
  cells: HeatmapCell[];
  muscleRows: MuscleWeekVolume[];
  weekStarts: number[];
  exercises: PerformedExercise[];
  // Captured at focus, not render — react-hooks/purity forbids the clock
  // in a render body; domain fns receive this `nowMs` so they stay pure.
  nowMs: number;
}

/** Re-read on focus so analytics reflect sessions finished since last view. */
function readAnalyticsView(): AnalyticsView {
  const nowMs = Date.now();
  const weekStarts = recentWeekStarts(nowMs, VOLUME_WEEKS);
  const sinceMs = weekStarts[0];
  const sets = exerciseSetsSince(appDb, sinceMs);
  const maps = muscleMapsForExercises(appDb, [...new Set(sets.map((s) => s.exerciseId))]);
  return {
    cells: heatmapCells(finishedSessionDates(appDb), nowMs, HEATMAP_WEEKS),
    muscleRows: weeklyVolumeByMuscle(sets, maps),
    weekStarts,
    exercises: exercisesByRecency(appDb),
    nowMs,
  };
}

export default function AnalyticsTab() {
  const [view, setView] = useState<AnalyticsView>(readAnalyticsView);
  useFocusEffect(useCallback(() => setView(readAnalyticsView()), []));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AnalyticsSection title="CONSISTENCY">
        <Heatmap cells={view.cells} weekCount={HEATMAP_WEEKS} />
      </AnalyticsSection>
      <AnalyticsSection title="MUSCLE VOLUME">
        <MuscleVolumeBars rows={view.muscleRows} weekStarts={view.weekStarts} />
      </AnalyticsSection>
      <AnalyticsSection title="EXERCISE">
        {view.exercises.length === 0 ? (
          <Text style={styles.empty}>NO EXERCISES LOGGED YET</Text>
        ) : (
          <ExerciseAnalytics exercises={view.exercises} nowMs={view.nowMs} />
        )}
      </AnalyticsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 20 },
  empty: { color: colors.muted, fontFamily: fontFamilyMono, fontSize: fontSize.body },
});
