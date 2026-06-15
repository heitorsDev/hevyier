import { useCallback, useRef, useState } from "react";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  type ImperativeRouter,
} from "expo-router";
import { ScrollView, Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { LastSessionBlock } from "@/components/LastSessionBlock";
import { NudgeBanner } from "@/components/NudgeBanner";
import { PlatePad } from "@/components/PlatePad";
import { RestTimerBanner } from "@/components/RestTimerBanner";
import { SetSection } from "@/components/SetSection";
import { appDb } from "@/db/bootstrap";
import type { SetRowState } from "@/domain/setRows";
import { shouldNudge } from "@/domain/overloadNudge";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useSetRows } from "@/hooks/useSetRows";
import {
  findLastSessionSetsForExercise,
  lastTwoWorkSetLists,
  type LoggedSetView,
} from "@/repos/exerciseHistoryRepo";
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

// The greyed last-session reference + overload nudge for this exercise.
// Null in History edit mode, where neither is shown (decision #8).
interface ReferenceView {
  lastSets: LoggedSetView[];
  nudge: boolean;
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

  const timer = useRestTimer();
  const setRows = useSetRows(
    sessionId,
    sessionExerciseId,
    editMode ? undefined : (type, name) => timer.start(type, name),
  );
  const [reference] = useState<ReferenceView | null>(() =>
    editMode ? null : loadReference(sessionId, sessionExerciseId),
  );
  const go = useCallback(
    (seId: number) => navigateTo(router, sessionId, seId, params.mode),
    [router, sessionId, params.mode],
  );
  // Flush on blur so an entered-but-unchecked set is never lost on navigation.
  // flushUnsaved reads live refs internally and its targets are stable across
  // renders, so capturing the first closure is correct; an empty-dep focus
  // effect then subscribes once and flushes on every blur/unmount.
  const flush = useRef(setRows.flushUnsaved);
  useFocusEffect(useCallback(() => () => flush.current(), []));
  const nav = neighbours(sessionId, sessionExerciseId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{setRows.exerciseName.toUpperCase()}</Text>
      {reference?.nudge ? <NudgeBanner /> : null}
      {reference ? <LastSessionBlock sets={reference.lastSets} /> : null}
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

      {/* History edit mode never starts a timer, so the banner stays null. */}
      {editMode ? null : <RestTimerBanner />}

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
 * Greyed last-session reference + overload nudge for the exercise behind
 * this session_exercise (decision #7). DB reads run once in the screen's
 * lazy initializer — never during render.
 */
function loadReference(
  sessionId: number,
  sessionExerciseId: number,
): ReferenceView {
  const se = listSessionExercises(appDb, sessionId).find(
    (row) => row.id === sessionExerciseId,
  );
  if (!se) return { lastSets: [], nudge: false };
  const lastSets = findLastSessionSetsForExercise(appDb, se.exerciseId) ?? [];
  const nudge = shouldNudge(lastTwoWorkSetLists(appDb, se.exerciseId));
  return { lastSets, nudge };
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
  content: { padding: 16, gap: 16 },
  title: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 12,
  },
  nav: { flexDirection: "row", gap: 8, marginTop: 24 },
  navButton: { flex: 1 },
});
