import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { PlanExerciseEditorRow } from "@/components/PlanExerciseEditorRow";
import { PressableRow } from "@/components/PressableRow";
import { appDb } from "@/db/bootstrap";
import { moveDown, moveUp } from "@/domain/planReorder";
import {
  addExerciseToPlan,
  deletePlan,
  getPlan,
  listPlanExercises,
  removeExerciseFromPlan,
  renamePlan,
  setPlanExerciseOrder,
  updatePlanExerciseSets,
  type PlanExerciseRow,
} from "@/repos/plansRepo";
import {
  getExercise,
  listExercises,
  type ExerciseRow,
} from "@/repos/exercisesRepo";
import { getGlobalSetCount } from "@/repos/settingsRepo";
import { border, colors, fontSize } from "@/theme/tokens";

export default function PlanEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const planId = Number(params.id);
  const [name, setName] = useState("");
  const [rows, setRows] = useState<PlanExerciseRow[]>([]);
  const [savedRows, setSavedRows] = useState<PlanExerciseRow[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const reload = useCallback(() => {
    setName(getPlan(appDb, planId)?.name ?? "");
    const loaded = listPlanExercises(appDb, planId);
    setRows(loaded);
    setSavedRows(loaded);
  }, [planId]);
  useFocusEffect(reload);

  const savePlan = () => {
    renamePlan(appDb, planId, name);
    persistReorder(savedRows, rows);
    setSavedRows(rows);
  };

  const addExercise = (exerciseId: number) => {
    savePlan();
    addExerciseToPlan(appDb, {
      planId,
      exerciseId,
      order: rows.length,
      warmupSets: getGlobalSetCount(appDb, "warmup"),
      workSets: getGlobalSetCount(appDb, "work"),
    });
    setPickerOpen(false);
    reload();
  };
  const reorder = (next: PlanExerciseRow[]) => {
    setRows(next);
  };
  const confirmDelete = () => {
    Alert.alert("DELETE PLAN", `Delete "${name}"?`, [
      { text: "CANCEL", style: "cancel" },
      {
        text: "DELETE",
        style: "destructive",
        onPress: () => {
          deletePlan(appDb, planId);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={setName}
        placeholder="PLAN NAME"
        placeholderTextColor={colors.muted}
      />
      {rows.map((row, index) => (
        <PlanExerciseEditorRow
          key={row.id}
          name={getExercise(appDb, row.exerciseId)?.name ?? "?"}
          warmupSets={row.warmupSets}
          workSets={row.workSets}
          isFirst={index === 0}
          isLast={index === rows.length - 1}
          onWarmupChange={(n) => updateSets(row, "warmupSets", n, setRows)}
          onWorkChange={(n) => updateSets(row, "workSets", n, setRows)}
          onMoveUp={() => reorder(moveUp(rows, row.id))}
          onMoveDown={() => reorder(moveDown(rows, row.id))}
          onRemove={() => {
            savePlan();
            removeExerciseFromPlan(appDb, row.id);
            reload();
          }}
        />
      ))}
      <BrutalButton label="+ ADD EXERCISE" onPress={() => setPickerOpen(true)} />
      <View style={styles.footer}>
        <BrutalButton label="SAVE PLAN" onPress={savePlan} />
        <BrutalButton label="DELETE PLAN" variant="danger" onPress={confirmDelete} />
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        excludedIds={rows.map((row) => row.exerciseId)}
        onPick={addExercise}
        onClose={() => setPickerOpen(false)}
      />
    </ScrollView>
  );
}

/** Persist set count immediately; name/order still deferred to Save button. */
function updateSets(
  row: PlanExerciseRow,
  field: "warmupSets" | "workSets",
  value: number,
  setRows: React.Dispatch<React.SetStateAction<PlanExerciseRow[]>>,
): void {
  const next = { ...row, [field]: value };
  updatePlanExerciseSets(appDb, next.id, {
    warmupSets: next.warmupSets,
    workSets: next.workSets,
  });
  setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));
}

/** Write only rows whose order actually changed (avoids 7 no-op writes). */
function persistReorder(
  before: PlanExerciseRow[],
  after: PlanExerciseRow[],
): void {
  const previousOrder = new Map(before.map((row) => [row.id, row.order]));
  after
    .filter((row) => previousOrder.get(row.id) !== row.order)
    .forEach((row) => setPlanExerciseOrder(appDb, row.id, row.order));
}

function ExercisePickerModal({
  visible,
  excludedIds,
  onPick,
  onClose,
}: {
  visible: boolean;
  excludedIds: number[];
  onPick: (exerciseId: number) => void;
  onClose: () => void;
}) {
  const available: ExerciseRow[] = listExercises(appDb, {
    includeArchived: false,
  }).filter((exercise) => !excludedIds.includes(exercise.id));
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.header}>ADD EXERCISE</Text>
        {available.map((exercise) => (
          <PressableRow key={exercise.id} onPress={() => onPick(exercise.id)}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.muted}>{exercise.equipment}</Text>
          </PressableRow>
        ))}
        <BrutalButton label="CANCEL" onPress={onClose} />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 8 },
  nameInput: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    borderColor: colors.fg,
    borderWidth: border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  header: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 4,
  },
  exerciseName: { color: colors.fg, fontSize: fontSize.body },
  muted: { color: colors.muted, fontSize: fontSize.small },
  footer: { marginTop: 24, gap: 8 },
});
