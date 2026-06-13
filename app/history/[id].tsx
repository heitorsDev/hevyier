import { useCallback, useState } from "react";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
  type ImperativeRouter,
} from "expo-router";
import { Alert, ScrollView, Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { HistorySetLine } from "@/components/HistorySetLine";
import { PressableRow } from "@/components/PressableRow";
import { appDb } from "@/db/bootstrap";
import { toSetLines } from "@/domain/historyDetail";
import { sessionDurationMs, sessionTitle } from "@/domain/historyList";
import { formatDateHeader, formatDuration } from "@/domain/sessionFormat";
import {
  listSessionExerciseDetails,
  planNameForSession,
  type HistoryExerciseDetail,
} from "@/repos/historyRepo";
import {
  deleteSession,
  getSession,
  pruneEmptySessionExercises,
  type SessionRow,
} from "@/repos/sessionsRepo";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

interface DetailView {
  session: SessionRow;
  planName: string | null;
  exercises: HistoryExerciseDetail[];
}

/**
 * History detail: header (date, duration, plan) + one section per exercise
 * listing its sets. Tapping a section opens the Exercise Logging Screen in
 * edit mode (decision #8) — edits write immediately, so on return we re-read
 * and prune any exercise left with zero sets, reusing the finish-time prune
 * (decision #3/#4). Footer DELETE SESSION is the only irreversible action.
 */
export default function HistoryDetailScreen() {
  const router = useRouter();
  const sessionId = Number(useLocalSearchParams<{ id: string }>().id);
  const [view, setView] = useState<DetailView | null>(null);

  // Prune-then-reload on every focus: covers both first open and returning
  // from edit mode, where an exercise may have had its last set deleted.
  useFocusEffect(
    useCallback(() => {
      pruneEmptySessionExercises(appDb, sessionId);
      setView(loadDetail(sessionId));
    }, [sessionId]),
  );

  if (!view) return null;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <DetailHeader view={view} />
      {view.exercises.map((exercise) => (
        <ExerciseSection
          key={exercise.sessionExerciseId}
          exercise={exercise}
          onEdit={() => openEdit(router, sessionId, exercise.sessionExerciseId)}
        />
      ))}
      <View style={styles.footer}>
        <BrutalButton
          label="DELETE SESSION"
          variant="danger"
          onPress={() => confirmDelete(router, sessionId)}
        />
      </View>
    </ScrollView>
  );
}

/** Read the session, its plan name, and its per-exercise set breakdown. */
function loadDetail(sessionId: number): DetailView | null {
  const session = getSession(appDb, sessionId);
  if (!session) return null;
  return {
    session,
    planName: planNameForSession(appDb, sessionId),
    exercises: listSessionExerciseDetails(appDb, sessionId),
  };
}

/** Open the shared logging screen in edit mode for one session_exercise. */
function openEdit(
  router: ImperativeRouter,
  sessionId: number,
  sessionExerciseId: number,
): void {
  router.push(`/session/${sessionId}/log/${sessionExerciseId}?mode=edit`);
}

/** Confirm + delete (irreversible), then return to the History list. */
function confirmDelete(router: ImperativeRouter, sessionId: number): void {
  Alert.alert("DELETE SESSION", "Delete this session and all its sets?", [
    { text: "CANCEL", style: "cancel" },
    {
      text: "DELETE",
      style: "destructive",
      onPress: () => {
        deleteSession(appDb, sessionId);
        router.back();
      },
    },
  ]);
}

function DetailHeader({ view }: { view: DetailView }) {
  const { session } = view;
  const duration = formatDuration(
    sessionDurationMs({
      startedAt: session.startedAt,
      finishedAt: session.finishedAt ?? session.startedAt,
    }),
  );
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{formatDateHeader(session.startedAt)}</Text>
      <Text style={styles.sub}>
        {sessionTitle(view.planName)} · {duration}
      </Text>
    </View>
  );
}

function ExerciseSection({
  exercise,
  onEdit,
}: {
  exercise: HistoryExerciseDetail;
  onEdit: () => void;
}) {
  return (
    <PressableRow onPress={onEdit}>
      <View style={styles.section}>
        <Text style={styles.exerciseName}>{exercise.name.toUpperCase()}</Text>
        {toSetLines(exercise.sets).map((line, index) => (
          <HistorySetLine key={index} label={line.label} text={line.text} />
        ))}
      </View>
    </PressableRow>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 8 },
  header: {
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 8,
    gap: 4,
  },
  title: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
  },
  sub: { color: colors.muted, fontSize: fontSize.body, fontFamily: fontFamilyMono },
  section: { flex: 1, gap: 4, paddingVertical: 4 },
  exerciseName: { color: colors.fg, fontSize: fontSize.body, fontWeight: "700" },
  footer: { marginTop: 24 },
});
