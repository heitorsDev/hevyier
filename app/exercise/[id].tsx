import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { EquipmentRow } from "@/components/EquipmentRow";
import { ExerciseDangerFooter } from "@/components/ExerciseDangerFooter";
import { MuscleSelector } from "@/components/MuscleSelector";
import { appDb } from "@/db/bootstrap";
import {
  toggleMusclePair,
  validateExerciseForm,
  type Equipment,
  type ExerciseFormState,
} from "@/domain/exerciseForm";
import type { MuscleGroup, SubMuscle } from "@/domain/muscles";
import {
  createExercise,
  getExercise,
  listMusclesForExercise,
  updateExercise,
} from "@/repos/exercisesRepo";
import {
  border,
  colors,
  fontFamilyMono,
  fontSize,
  touchTarget,
} from "@/theme/tokens";

const EMPTY_FORM: ExerciseFormState = { name: "", equipment: "", muscles: [] };

// Edit mode hydrates from the repo; create mode starts empty. Called once
// via lazy useState initializer so focus re-renders don't clobber edits.
function initialForm(id: number | null): ExerciseFormState {
  if (id === null) return EMPTY_FORM;
  const row = getExercise(appDb, id);
  if (!row) return EMPTY_FORM;
  return { name: row.name, equipment: row.equipment, muscles: listMusclesForExercise(appDb, id) };
}

// "new" → create mode (null id); a numeric string → edit that exercise.
function parseExerciseId(raw: string): number | null {
  if (raw === "new") return null;
  const id = Number(raw);
  if (!Number.isInteger(id)) {
    throw new Error(`invalid exercise id "${raw}", expected "new" or an integer`);
  }
  return id;
}

export default function ExerciseFormScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const [id] = useState<number | null>(() => parseExerciseId(rawId));
  const [archived] = useState(() => (id === null ? false : getExercise(appDb, id)?.archived === 1));
  const [form, setForm] = useState<ExerciseFormState>(() => initialForm(id));
  const [error, setError] = useState<string | null>(null);

  function persist(): void {
    const result = validateExerciseForm(form);
    if (!result.ok) return setError(result.error);
    if (id === null) createExercise(appDb, result.draft);
    else updateExercise(appDb, id, result.draft);
    router.back();
  }

  function onToggleMuscle(group: MuscleGroup, sub: SubMuscle): void {
    setForm((prev) => ({ ...prev, muscles: toggleMusclePair(prev.muscles, group, sub) }));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>NAME</Text>
      <TextInput
        value={form.name}
        onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
        placeholder="EXERCISE NAME"
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        style={styles.nameInput}
      />

      <Text style={styles.label}>EQUIPMENT</Text>
      <EquipmentRow
        value={form.equipment}
        onSelect={(equipment: Equipment) => setForm((prev) => ({ ...prev, equipment }))}
      />

      <Text style={styles.label}>MUSCLES</Text>
      <MuscleSelector pairs={form.muscles} onToggle={onToggleMuscle} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <BrutalButton label="SAVE" variant="primary" onPress={persist} />

      {id !== null ? (
        <View style={styles.footer}>
          <ExerciseDangerFooter id={id} archived={archived} onDone={() => router.back()} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 12 },
  label: { color: colors.muted, fontSize: fontSize.small, fontWeight: "700", marginTop: 8 },
  nameInput: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    paddingHorizontal: 12,
  },
  error: { color: colors.fg, fontSize: fontSize.small },
  footer: { marginTop: 24 },
});
