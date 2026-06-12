import { Text, View, StyleSheet } from "react-native";

import { PressableRow } from "@/components/PressableRow";
import { colors, fontSize } from "@/theme/tokens";
import type { ExerciseRow } from "@/repos/exercisesRepo";

/**
 * One library row: name on the left, "equipment · GRP · GRP" meta on the
 * right in muted grey. Archived rows dim the name to `disabled`.
 *
 * Usage: `<ExerciseListItem row={ex} meta="barbell · CHE" onPress={open} />`
 */
export function ExerciseListItem({
  row,
  meta,
  onPress,
}: {
  row: ExerciseRow;
  meta: string;
  onPress: () => void;
}) {
  const archived = row.archived === 1;
  return (
    <PressableRow onPress={onPress}>
      <Text style={[styles.name, archived && styles.archived]} numberOfLines={1}>
        {row.name}
      </Text>
      <View style={styles.metaBox}>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </PressableRow>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.fg, fontSize: fontSize.body, flexShrink: 1, paddingRight: 8 },
  archived: { color: colors.disabled },
  metaBox: { flexShrink: 0, maxWidth: "45%" },
  meta: { color: colors.muted, fontSize: fontSize.small, textAlign: "right" },
});
