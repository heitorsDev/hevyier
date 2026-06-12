import { useCallback } from "react";
import {
  useLocalSearchParams,
  useRouter,
  type ImperativeRouter,
} from "expo-router";
import { ScrollView, Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { PlatePad } from "@/components/PlatePad";
import { SetSection } from "@/components/SetSection";
import { appDb } from "@/db/bootstrap";
import type { SetRowState } from "@/domain/setRows";
import { useSetRows } from "@/hooks/useSetRows";
import { getExercise } from "@/repos/exercisesRepo";
import {
  listSessionExercises,
  type SessionExerciseRow,
} from "@/repos/sessionsRepo";
import { border, colors, fontSize } from "@/theme/tokens";

interface NeighbourNav {
  prev: SessionExerciseRow | undefined;
  next: SessionExerciseRow | undefined;
}

/**
 * Exercise Logging Screen: zero-keyboard set logging for one
 * session_exercise. PlatePad drives the active row's weight; ✓ persists a
 * set and advances. PREV/NEXT walk the session's exercises in order.
 */
export default function ExerciseLoggingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    sessionExerciseId: string;
    mode?: string;
  }>();
  const sessionId = Number(params.id);
  const sessionExerciseId = Number(params.sessionExerciseId);
  const editMode = params.mode === "edit";

  const setRows = useSetRows(sessionId, sessionExerciseId);
  const go = useCallback(
    (seId: number) => navigateTo(router, sessionId, seId, params.mode),
    [router, sessionId, params.mode],
  );
  const nav = neighbours(sessionId, sessionExerciseId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{setRows.exerciseName.toUpperCase()}</Text>
      <SetSection
        title="WARMUP"
        type="warmup"
        rows={indexedOf(setRows.rows, "warmup")}
        activeIndex={setRows.activeIndex}
        onSelect={setRows.selectRow}
        onWeightChange={setRows.setWeight}
        onRepsChange={setRows.setReps}
        onToggleCheck={setRows.toggleCheck}
        onAddSet={setRows.addSet}
      />
      <SetSection
        title="WORK"
        type="work"
        rows={indexedOf(setRows.rows, "work")}
        activeIndex={setRows.activeIndex}
        onSelect={setRows.selectRow}
        onWeightChange={setRows.setWeight}
        onRepsChange={setRows.setReps}
        onToggleCheck={setRows.toggleCheck}
        onAddSet={setRows.addSet}
      />

      {/*
        editMode (History reuse, Phase 6/8) suppresses the live rest-timer
        and next-set nudge. Neither exists yet, so this gate is a no-op stub
        that future phases render inside.
      */}
      {editMode ? null : <RestTimerSlot />}

      <PlatePad onDelta={setRows.nudgeActiveWeight} />

      <View style={styles.nav}>
        <View style={styles.navButton}>
          <BrutalButton
            label={prevLabel(nav.prev)}
            disabled={!nav.prev}
            onPress={() => nav.prev && go(nav.prev.id)}
          />
        </View>
        <View style={styles.navButton}>
          <BrutalButton
            label={nextLabel(nav.next)}
            disabled={!nav.next}
            onPress={() => nav.next && go(nav.next.id)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Placeholder for the live workout's rest-timer / next-set nudge (Phase 5).
 * Renders nothing today; gated out in edit mode so History reuse never
 * shows a running timer.
 */
function RestTimerSlot() {
  return null;
}

/** Rows of one section paired with their absolute index in the full list. */
function indexedOf(
  rows: SetRowState[],
  type: "warmup" | "work",
): { row: SetRowState; index: number }[] {
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.type === type);
}

/** Previous/next session_exercise in plan order around the current one. */
function neighbours(
  sessionId: number,
  sessionExerciseId: number,
): NeighbourNav {
  const all = listSessionExercises(appDb, sessionId);
  const at = all.findIndex((se) => se.id === sessionExerciseId);
  return { prev: all[at - 1], next: all[at + 1] };
}

/** Replace (don't stack) the logging route, preserving the mode param. */
function navigateTo(
  router: ImperativeRouter,
  sessionId: number,
  seId: number,
  mode: string | undefined,
): void {
  const suffix = mode ? `?mode=${mode}` : "";
  router.replace(`/session/${sessionId}/log/${seId}${suffix}`);
}

function prevLabel(prev: SessionExerciseRow | undefined): string {
  if (!prev) return "← PREV";
  return `← ${nameFor(prev.exerciseId)}`;
}

function nextLabel(next: SessionExerciseRow | undefined): string {
  if (!next) return "NEXT →";
  return `${nameFor(next.exerciseId)} →`;
}

function nameFor(exerciseId: number): string {
  return getExercise(appDb, exerciseId)?.name.toUpperCase() ?? "?";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 12 },
  title: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 8,
  },
  nav: { flexDirection: "row", gap: 8, marginTop: 16 },
  navButton: { flex: 1 },
});
