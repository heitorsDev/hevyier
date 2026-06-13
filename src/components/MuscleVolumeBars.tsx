import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

import { WeeklyBars } from "@/charts";
import type { MuscleWeekVolume } from "@/domain/analytics/muscleVolume";
import { groupSeries, subMuscleSeries } from "@/domain/analytics/muscleSeries";
import type { MuscleGroup } from "@/domain/muscles";
import { border, colors, fontFamilyMono, fontSize, touchTarget } from "@/theme/tokens";

/**
 * Weekly work-volume bars per big muscle group (last N weeks). Tapping a
 * group toggles an inline drill-down into its sub-muscle split (decision
 * #11). Pure pivots happen in domain/muscleSeries; this owns only layout +
 * the expand/collapse state.
 *
 * Usage: `<MuscleVolumeBars rows={weeklyVol} weekStarts={last8} />`
 */
export function MuscleVolumeBars({
  rows,
  weekStarts,
}: {
  rows: MuscleWeekVolume[];
  weekStarts: number[];
}) {
  const [openGroup, setOpenGroup] = useState<MuscleGroup | null>(null);
  const series = groupSeries(rows, weekStarts);
  if (series.length === 0) return <Text style={styles.empty}>NO VOLUME LOGGED</Text>;
  return (
    <View style={styles.list}>
      {series.map((group) => (
        <View key={group.group}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: openGroup === group.group }}
            onPress={() => setOpenGroup(openGroup === group.group ? null : group.group)}
          >
            <WeeklyBars
              label={`${group.group.toUpperCase()} · ${group.totalKg} KG`}
              unit="kg"
              points={group.weekly}
            />
          </Pressable>
          {openGroup === group.group ? (
            <Drilldown rows={rows} group={group.group} weekStarts={weekStarts} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Inline sub-muscle split for the tapped group. */
function Drilldown({
  rows,
  group,
  weekStarts,
}: {
  rows: MuscleWeekVolume[];
  group: MuscleGroup;
  weekStarts: number[];
}) {
  return (
    <View style={styles.drilldown}>
      {subMuscleSeries(rows, group, weekStarts).map((sub) => (
        <WeeklyBars
          key={sub.subMuscle}
          label={`${sub.subMuscle.toUpperCase()} · ${sub.totalKg} KG`}
          unit="kg"
          points={sub.weekly}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  drilldown: { gap: 8, paddingLeft: 12, borderColor: colors.muted, borderLeftWidth: border },
  empty: {
    minHeight: touchTarget,
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
  },
});
