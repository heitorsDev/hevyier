import { useMemo, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

import { TrendLine } from "@/charts";
import { ExercisePicker } from "@/components/ExercisePicker";
import { PrBadgeRow } from "@/components/PrBadgeRow";
import { appDb } from "@/db/bootstrap";
import { prBadges } from "@/domain/analytics/prBadges";
import { maxWeightSeries, volumeSeries } from "@/domain/analytics/series";
import { weeklyStreak } from "@/domain/analytics/streak";
import { formatDateHeader } from "@/domain/sessionFormat";
import {
  sessionDatesForExercise,
  setsForExercise,
  type PerformedExercise,
} from "@/repos/analyticsRepo";
import { colors, fontFamilyMono, fontSize } from "@/theme/tokens";

/**
 * EXERCISE analytics: pick a performed exercise (recent first) → max-weight
 * line, volume line, three PR badges, last-performed date + weekly streak.
 * `nowMs` is threaded from the screen edge so streak/series stay pure.
 *
 * Usage: `<ExerciseAnalytics exercises={list} nowMs={now} />`
 */
export function ExerciseAnalytics({
  exercises,
  nowMs,
}: {
  exercises: PerformedExercise[];
  nowMs: number;
}) {
  const [selectedId, setSelectedId] = useState<number>(exercises[0].id);
  const data = useMemo(() => readExercise(selectedId, nowMs), [selectedId, nowMs]);
  return (
    <View style={styles.block}>
      <ExercisePicker exercises={exercises} selectedId={selectedId} onSelect={setSelectedId} />
      <TrendLine
        label="MAX WEIGHT"
        unit="kg"
        points={data.maxWeight.map((p) => ({ x: p.sessionDate, y: p.maxKg }))}
      />
      <TrendLine
        label="VOLUME"
        unit="kg"
        points={data.volume.map((p) => ({ x: p.sessionDate, y: p.volumeKg }))}
      />
      <PrBadgeRow label="HEAVIEST" value={heaviestText(data)} dateMs={data.badges.heaviestSet?.sessionDate ?? null} />
      <PrBadgeRow label="MOST REPS" value={mostRepsText(data)} dateMs={data.badges.mostRepsSet?.sessionDate ?? null} />
      <PrBadgeRow label="TOP VOLUME" value={topVolumeText(data)} dateMs={data.badges.highestVolumeSession?.sessionDate ?? null} />
      <Text style={styles.meta}>
        LAST {formatDateHeader(data.lastPerformedAt)} · STREAK {data.streak} WK
      </Text>
    </View>
  );
}

type ExerciseData = ReturnType<typeof readExercise>;

/** Pull + shape one exercise's analytics. nowMs passed for a pure streak. */
function readExercise(exerciseId: number, nowMs: number) {
  const sets = setsForExercise(appDb, exerciseId);
  const dates = sessionDatesForExercise(appDb, exerciseId);
  return {
    maxWeight: maxWeightSeries(sets),
    volume: volumeSeries(sets),
    badges: prBadges(sets),
    streak: weeklyStreak(dates, nowMs),
    lastPerformedAt: dates.length === 0 ? nowMs : Math.max(...dates),
  };
}

function heaviestText(data: ExerciseData): string {
  const pr = data.badges.heaviestSet;
  return pr === null ? "" : `${pr.weightKg} kg × ${pr.reps}`;
}

function mostRepsText(data: ExerciseData): string {
  const pr = data.badges.mostRepsSet;
  return pr === null ? "" : `${pr.reps} × ${pr.weightKg} kg`;
}

function topVolumeText(data: ExerciseData): string {
  const pr = data.badges.highestVolumeSession;
  return pr === null ? "" : `${pr.volumeKg.toLocaleString("en-US")} kg`;
}

const styles = StyleSheet.create({
  block: { gap: 12 },
  meta: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
    letterSpacing: 1,
  },
});
