import { View, StyleSheet } from "react-native";

import { Chip } from "@/components/Chip";
import type { Equipment } from "@/domain/exerciseForm";

// Single-select equipment chips. Closed set mirrors validateExerciseForm.
const EQUIPMENT: readonly Equipment[] = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "other",
];

/**
 * Wrapping single-select row of equipment chips.
 *
 * Usage: `<EquipmentRow value={eq} onSelect={setEq} />`
 */
export function EquipmentRow({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (equipment: Equipment) => void;
}) {
  return (
    <View style={styles.wrap}>
      {EQUIPMENT.map((equipment) => (
        <Chip
          key={equipment}
          label={equipment}
          selected={value === equipment}
          onPress={() => onSelect(equipment)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
