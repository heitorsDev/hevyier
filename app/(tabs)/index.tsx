import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { PlanConfirmModal, type ConfirmModal } from "@/components/PlanConfirmModal";
import { PlanPickerList, type PlanMeta } from "@/components/PlanPickerList";
import { appDb } from "@/db/bootstrap";
import { formatDateHeader, formatDuration } from "@/domain/sessionFormat";
import { getExercise } from "@/repos/exercisesRepo";
import {
  getPlan,
  listPlans,
  listPlanExercises,
} from "@/repos/plansRepo";
import { getPlanIdForDay, listWeekSchedule } from "@/repos/scheduleRepo";
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
  planMetas: PlanMeta[];
  todayPlanId: number | null;
  hasAnySchedule: boolean;
  last: SessionRow | undefined;
  // Captured here (focus-read, not render) so the header date stays a pure
  // function of state — react-hooks/purity forbids Date.now() during render.
  headerMs: number;
}

function readTodayView(): TodayView {
  const active = findActiveSession(appDb);
  const plans = listPlans(appDb);
  const todayPlanId = active ? null : getPlanIdForDay(appDb, new Date().getDay());
  const hasAnySchedule = listWeekSchedule(appDb).some((r) => r.planId !== null);
  const planMetas = plans.map((plan) => ({
    plan,
    exerciseCount: listPlanExercises(appDb, plan.id).length,
  }));
  return {
    active,
    planMetas,
    todayPlanId,
    hasAnySchedule,
    last: findLastFinishedSession(appDb),
    headerMs: Date.now(),
  };
}

export default function TodayTab() {
  const router = useRouter();
  const [view, setView] = useState<TodayView>(readTodayView);
  const [modal, setModal] = useState<ConfirmModal | null>(null);

  useFocusEffect(useCallback(() => setView(readTodayView()), []));

  const openSession = useCallback(
    (sessionId: number) => router.push(`/session/${sessionId}`),
    [router],
  );

  const openModal = useCallback((planId: number) => {
    const plan = getPlan(appDb, planId);
    if (!plan) return;
    const exerciseNames = listPlanExercises(appDb, planId)
      .map((row) => getExercise(appDb, row.exerciseId)?.name)
      .filter((n): n is string => n !== undefined);
    setModal({ planId, planName: plan.name, exerciseNames });
  }, []);

  const startFromModal = useCallback(() => {
    if (!modal) return;
    setModal(null);
    openSession(startSessionFromPlan(appDb, modal.planId, Date.now()));
  }, [modal, openSession]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{formatDateHeader(view.headerMs)}</Text>

      {view.active ? (
        <BrutalButton
          label="RESUME SESSION"
          variant="primary"
          onPress={() => openSession(view.active!.id)}
        />
      ) : null}

      <PlanPickerList
        view={view}
        onPickPlan={openModal}
        onEmptySession={() =>
          openSession(startSession(appDb, null, Date.now()))
        }
      />

      {view.last ? <LastSessionBlock session={view.last} /> : null}

      <PlanConfirmModal
        modal={modal}
        onStart={startFromModal}
        onClose={() => setModal(null)}
      />
    </ScrollView>
  );
}

function LastSessionBlock({ session }: { session: SessionRow }) {
  const summary = summarizeSession(appDb, session.id);
  const planName =
    session.planId === null
      ? "FREESTYLE"
      : getPlan(appDb, session.planId)?.name.toUpperCase() ?? "FREESTYLE";
  const duration = formatDuration(
    (session.finishedAt ?? session.startedAt) - session.startedAt,
  );
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
  content: { padding: 16, gap: 16 },
  header: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 12,
  },
  last: {
    borderColor: colors.fg,
    borderWidth: border,
    padding: 16,
    gap: 8,
  },
  lastHeader: { color: colors.muted, fontSize: fontSize.small, fontWeight: "700", letterSpacing: 1 },
  lastLine: {
    color: colors.fg,
    fontSize: fontSize.body,
    fontFamily: fontFamilyMono,
  },
});
