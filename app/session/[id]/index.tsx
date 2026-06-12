import { useCallback, useEffect, useState } from "react";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  type ImperativeRouter,
} from "expo-router";
import { Alert, Modal, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { PressableRow } from "@/components/PressableRow";
import { appDb } from "@/db/bootstrap";
import {
  getExercise,
  listExercises,
  type ExerciseRow,
} from "@/repos/exercisesRepo";
import { getPlan, listPlanExercises } from "@/repos/plansRepo";
import {
  addExerciseToSession,
  deleteSession,
  finishWorkout,
  getSession,
  listSessionExercises,
  type SessionExerciseRow,
  type SessionRow,
} from "@/repos/sessionsRepo";
import { listSetsForSessionExercise } from "@/repos/setsRepo";
import { colors, fontFamilyMono, fontSize, touchTarget } from "@/theme/tokens";

interface ExerciseRowView {
  sessionExerciseId: number;
  exerciseId: number;
  name: string;
  done: number;
  planned: number;
}

/**
 * Session Screen: the live workout overview. Lists each exercise with
 * done/planned set counts, a live elapsed clock, an add-exercise picker,
 * and the Finish/Discard footer. Tapping a row opens its logging screen.
 */
export default function SessionScreen() {
  const router = useRouter();
  const sessionId = Number(useLocalSearchParams<{ id: string }>().id);
  const [session, setSession] = useState<SessionRow | undefined>(undefined);
  const [rows, setRows] = useState<ExerciseRowView[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const reload = useCallback(() => {
    const loaded = getSession(appDb, sessionId);
    setSession(loaded);
    setRows(loaded ? buildExerciseRows(loaded) : []);
  }, [sessionId]);
  useFocusEffect(reload);

  const addExercise = (exerciseId: number) => {
    addExerciseToSession(appDb, { sessionId, exerciseId, order: rows.length });
    setPickerOpen(false);
    reload();
  };

  if (!session) return null;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SessionHeader session={session} onMenu={() => discardMenu(router, sessionId)} />
      {rows.map((row) => (
        <ExerciseCountRow
          key={row.sessionExerciseId}
          row={row}
          onPress={() => router.push(`/session/${sessionId}/log/${row.sessionExerciseId}`)}
        />
      ))}
      <BrutalButton label="+ ADD EXERCISE" onPress={() => setPickerOpen(true)} />
      <View style={styles.footer}>
        <BrutalButton
          label="FINISH"
          variant="primary"
          onPress={() => finishAndLeave(router, sessionId)}
        />
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

/** Build the per-exercise done/planned view rows for a session, in order. */
function buildExerciseRows(session: SessionRow): ExerciseRowView[] {
  const planExercises = session.planId === null ? [] : listPlanExercises(appDb, session.planId);
  return listSessionExercises(appDb, session.id).map((se) => {
    const done = listSetsForSessionExercise(appDb, se.id).length;
    return {
      sessionExerciseId: se.id,
      exerciseId: se.exerciseId,
      name: getExercise(appDb, se.exerciseId)?.name ?? "?",
      done,
      planned: plannedFor(planExercises, se, done),
    };
  });
}

/** Planned sets = plan warmup+work for a match; else (or freestyle) = done. */
function plannedFor(
  planExercises: { exerciseId: number; warmupSets: number; workSets: number }[],
  se: SessionExerciseRow,
  done: number,
): number {
  const match = planExercises.find((pe) => pe.exerciseId === se.exerciseId);
  if (!match) return done;
  return match.warmupSets + match.workSets;
}

/** Finish the workout, then dismiss the whole session modal back to Today. */
function finishAndLeave(router: ImperativeRouter, sessionId: number): void {
  finishWorkout(appDb, sessionId, Date.now());
  leaveToToday(router);
}

/** Confirm + discard (the only irreversible action), then leave to Today. */
function discardMenu(router: ImperativeRouter, sessionId: number): void {
  Alert.alert("SESSION", undefined, [
    { text: "CANCEL", style: "cancel" },
    {
      text: "DISCARD",
      style: "destructive",
      onPress: () => confirmDiscard(router, sessionId),
    },
  ]);
}

function confirmDiscard(router: ImperativeRouter, sessionId: number): void {
  Alert.alert("DISCARD WORKOUT", "Delete this session and all its sets?", [
    { text: "CANCEL", style: "cancel" },
    {
      text: "DISCARD",
      style: "destructive",
      onPress: () => {
        deleteSession(appDb, sessionId);
        leaveToToday(router);
      },
    },
  ]);
}

/** Leave the fullScreenModal session stack back to Today (decision #3). */
function leaveToToday(router: ImperativeRouter): void {
  router.dismissAll();
}

function SessionHeader({
  session,
  onMenu,
}: {
  session: SessionRow;
  onMenu: () => void;
}) {
  const title =
    session.planId === null
      ? "FREESTYLE"
      : getPlan(appDb, session.planId)?.name.toUpperCase() ?? "FREESTYLE";
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <ElapsedClock startedAt={session.startedAt} />
      </View>
      <Pressable accessibilityLabel="session menu" style={styles.menu} onPress={onMenu}>
        <Text style={styles.menuDots}>⋯</Text>
      </Pressable>
    </View>
  );
}

/** Live H:MM:SS / M:SS clock, ticking every second off session.startedAt. */
function ElapsedClock({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <Text style={styles.clock}>{formatElapsed(now - startedAt)}</Text>;
}

/** Elapsed span as `H:MM:SS` past an hour, else `M:SS`. */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const seconds = pad(totalSeconds % 60);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  if (hours > 0) return `${hours}:${pad(minutes)}:${seconds}`;
  return `${minutes}:${seconds}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function ExerciseCountRow({ row, onPress }: { row: ExerciseRowView; onPress: () => void }) {
  return (
    <PressableRow onPress={onPress}>
      <Text style={styles.exerciseName}>{row.name}</Text>
      <Text style={styles.counts}>
        {row.done}/{row.planned}
      </Text>
    </PressableRow>
  );
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
        <Text style={styles.title}>ADD EXERCISE</Text>
        {available.map((exercise) => (
          <PressableRow key={exercise.id} onPress={() => onPick(exercise.id)}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.equipment}>{exercise.equipment}</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  clock: {
    color: colors.muted,
    fontSize: fontSize.body,
    fontFamily: fontFamilyMono,
  },
  menu: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  menuDots: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  exerciseName: { color: colors.fg, fontSize: fontSize.body },
  counts: { color: colors.muted, fontSize: fontSize.body, fontFamily: fontFamilyMono },
  equipment: { color: colors.muted, fontSize: fontSize.small },
  footer: { marginTop: 24 },
});
