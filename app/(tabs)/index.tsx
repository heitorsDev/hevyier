import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView, Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { appDb } from "@/db/bootstrap";
import { formatDateHeader, formatDuration } from "@/domain/sessionFormat";
import { getExercise } from "@/repos/exercisesRepo";
import { getPlan, listPlanExercises } from "@/repos/plansRepo";
import { getPlanIdForDay } from "@/repos/scheduleRepo";
import {
  findActiveSession,
  findLastFinishedSession,
  startSession,
  startSessionFromPlan,
  summarizeSession,
  type SessionRow,
} from "@/repos/sessionsRepo";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

interface TodayView {
  active: SessionRow | undefined;
  planId: number | null;
  last: SessionRow | undefined;
  // Captured here (focus-read, not render) so the header date stays a pure
  // function of state — react-hooks/purity forbids Date.now() during render.
  headerMs: number;
}

// Re-read on every focus so a finished/abandoned session updates the CTA
// when the user returns from the session modal (decision #3).
function readTodayView(): TodayView {
  const active = findActiveSession(appDb);
  return {
    active,
    planId: active ? null : getPlanIdForDay(appDb, new Date().getDay()),
    last: findLastFinishedSession(appDb),
    headerMs: Date.now(),
  };
}

export default function TodayTab() {
  const router = useRouter();
  const [view, setView] = useState<TodayView>(readTodayView);
  const open = useCallback(
    (sessionId: number) => router.push(`/session/${sessionId}`),
    [router],
  );

  useFocusEffect(useCallback(() => setView(readTodayView()), []));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{formatDateHeader(view.headerMs)}</Text>
      <PrimaryBlock view={view} onOpen={open} />
      <BrutalButton label="START EMPTY SESSION" onPress={() => open(startSession(appDb, null, Date.now()))} />
      {view.last ? <LastSessionBlock session={view.last} /> : null}
    </ScrollView>
  );
}

/** Resume / start-from-plan / rest-day — the one block that varies by state. */
function PrimaryBlock({
  view,
  onOpen,
}: {
  view: TodayView;
  onOpen: (sessionId: number) => void;
}) {
  if (view.active) {
    return (
      <BrutalButton label="RESUME SESSION" variant="primary" onPress={() => onOpen(view.active!.id)} />
    );
  }
  if (view.planId === null) {
    return <Text style={styles.restDay}>REST DAY</Text>;
  }
  return <PlanBlock planId={view.planId} onOpen={onOpen} />;
}

function PlanBlock({
  planId,
  onOpen,
}: {
  planId: number;
  onOpen: (sessionId: number) => void;
}) {
  const plan = getPlan(appDb, planId);
  const names = exerciseNamesForPlan(planId);
  const start = () => onOpen(startSessionFromPlan(appDb, planId, Date.now()));
  return (
    <View style={styles.block}>
      <Text style={styles.planName}>{plan?.name.toUpperCase() ?? "PLAN"}</Text>
      {names.map((name, index) => (
        <Text key={index} style={styles.previewItem}>
          {name.toUpperCase()}
        </Text>
      ))}
      <BrutalButton label="START SESSION" variant="primary" onPress={start} />
    </View>
  );
}

/** Plan exercise names in plan order; unresolved ids drop out silently. */
function exerciseNamesForPlan(planId: number): string[] {
  return listPlanExercises(appDb, planId)
    .map((row) => getExercise(appDb, row.exerciseId)?.name)
    .filter((name): name is string => name !== undefined);
}

function LastSessionBlock({ session }: { session: SessionRow }) {
  const summary = summarizeSession(appDb, session.id);
  const planName =
    session.planId === null
      ? "FREESTYLE"
      : getPlan(appDb, session.planId)?.name.toUpperCase() ?? "FREESTYLE";
  const duration = formatDuration((session.finishedAt ?? session.startedAt) - session.startedAt);
  const volume = summary.workVolumeKg.toLocaleString("en-US");
  return (
    <View style={styles.last}>
      <Text style={styles.lastHeader}>LAST SESSION</Text>
      <Text style={styles.lastLine}>
        {formatDateHeader(session.startedAt)} · {planName}
      </Text>
      <Text style={styles.lastLine}>
        {duration} · {summary.totalSets} SETS · {volume} KG
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, gap: 12 },
  header: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 8,
  },
  block: { gap: 8 },
  planName: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  previewItem: { color: colors.muted, fontSize: fontSize.body },
  restDay: { color: colors.muted, fontSize: fontSize.large, fontWeight: "700" },
  last: {
    borderColor: colors.fg,
    borderWidth: border,
    padding: 12,
    gap: 6,
    marginTop: 8,
  },
  lastHeader: { color: colors.muted, fontSize: fontSize.small, letterSpacing: 1 },
  lastLine: { color: colors.fg, fontSize: fontSize.body, fontFamily: fontFamilyMono },
});
