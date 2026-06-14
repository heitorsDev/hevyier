import { Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { SetRow } from "@/components/SetRow";
import type { SetRowState } from "@/domain/setRows";
import { colors, fontFamilyMono, fontSize } from "@/theme/tokens";

interface IndexedRow {
  row: SetRowState;
  index: number;
}

/**
 * One labelled section of the logging screen (WARMUP or WORK): a muted
 * header, its SetRows, and a `+ ADD SET` button. The add button always
 * renders — even with zero rows — so a freestyle/empty session (no plan
 * counts, no logged sets) can still grow its first set (decision #4).
 */
export function SetSection({
  title,
  type,
  rows,
  activeIndex,
  onSelect,
  onWeightChange,
  onRepsChange,
  onToggleCheck,
  onAddSet,
}: {
  title: string;
  type: "warmup" | "work";
  rows: IndexedRow[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onWeightChange: (index: number, kg: number) => void;
  onRepsChange: (index: number, reps: number) => void;
  onToggleCheck: (index: number) => void;
  onAddSet: (type: "warmup" | "work") => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.header}>{title}</Text>
      {rows.map(({ row, index }) => (
        <SetRow
          key={index}
          row={row}
          isActive={index === activeIndex}
          onSelect={() => onSelect(index)}
          onWeightChange={(kg) => onWeightChange(index, kg)}
          onRepsChange={(reps) => onRepsChange(index, reps)}
          onToggleCheck={() => onToggleCheck(index)}
        />
      ))}
      <BrutalButton label="+ ADD SET" onPress={() => onAddSet(type)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  header: {
    color: colors.muted,
    fontSize: fontSize.body,
    fontFamily: fontFamilyMono,
    fontWeight: "700",
  },
});
