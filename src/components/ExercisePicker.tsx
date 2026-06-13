import { ScrollView, StyleSheet } from "react-native";

import { Chip } from "@/components/Chip";
import type { PerformedExercise } from "@/repos/analyticsRepo";

/**
 * Horizontal chip row of performed exercises (recently-performed first per
 * the repo order) for the EXERCISE analytics section. Selected chip inverts.
 *
 * Usage: `<ExercisePicker exercises={list} selectedId={id} onSelect={set} />`
 */
export function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
}: {
  exercises: PerformedExercise[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {exercises.map((exercise) => (
        <Chip
          key={exercise.id}
          label={exercise.name.toUpperCase()}
          selected={exercise.id === selectedId}
          onPress={() => onSelect(exercise.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
});
