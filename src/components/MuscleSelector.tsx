import { useState } from "react";
import { View, StyleSheet } from "react-native";

import { Chip } from "@/components/Chip";
import { isPairSelected, selectedGroups } from "@/domain/exerciseForm";
import {
  MUSCLE_GROUPS,
  subMusclesOf,
  type MuscleGroup,
  type MusclePair,
  type SubMuscle,
} from "@/domain/muscles";

const GROUPS = Object.keys(MUSCLE_GROUPS) as MuscleGroup[];

// Sub-muscle chips for one expanded group. Extracted so the parent map
// callback stays a one-liner (function-length rule).
function SubMuscleRow({
  group,
  pairs,
  onToggle,
}: {
  group: MuscleGroup;
  pairs: MusclePair[];
  onToggle: (group: MuscleGroup, sub: SubMuscle) => void;
}) {
  return (
    <View style={styles.subRow}>
      {subMusclesOf(group).map((sub) => (
        <Chip
          key={sub}
          label={sub}
          selected={isPairSelected(pairs, group, sub)}
          onPress={() => onToggle(group, sub)}
        />
      ))}
    </View>
  );
}

/**
 * Two-level muscle picker: tap a group to expand its sub-muscle chips,
 * tap a sub to toggle the (group, sub) pair. A group label highlights
 * when it has any selected sub.
 *
 * Usage: `<MuscleSelector pairs={pairs} onToggle={toggle} />`
 */
export function MuscleSelector({
  pairs,
  onToggle,
}: {
  pairs: MusclePair[];
  onToggle: (group: MuscleGroup, sub: SubMuscle) => void;
}) {
  const [expanded, setExpanded] = useState<MuscleGroup | null>(null);
  const active = selectedGroups(pairs);
  return (
    <View>
      <View style={styles.grid}>
        {GROUPS.map((group) => (
          <Chip
            key={group}
            label={group}
            selected={active.includes(group)}
            onPress={() => setExpanded((prev) => (prev === group ? null : group))}
          />
        ))}
      </View>
      {expanded ? (
        <SubMuscleRow group={expanded} pairs={pairs} onToggle={onToggle} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
});
