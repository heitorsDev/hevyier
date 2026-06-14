import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { appDb } from "@/db/bootstrap";
import { formatDateHeader, formatDuration } from "@/domain/sessionFormat";
import { getExercise } from "@/repos/exercisesRepo";
import {
  getPlan,
  listPlans,
  listPlanExercises,
  type PlanRow,
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
import { border, colors, fontFamilyMono, fontSize, touchTarget } from "@/theme/tokens";

interface PlanMeta {
  plan: PlanRow;
  exerciseCount: number;
}

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

interface ConfirmModal {
  planId: number;
  planName: string;
  exerciseNames: string[];
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
          onPress={() => openSession(view.active.id)}
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

function PlanPickerList({
  view,
  onPickPlan,
  onEmptySession,
}: {
  view: TodayView;
  onPickPlan: (planId: number) => void;
  onEmptySession: () => void;
}) {
  if (view.planMetas.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>NO PLANS YET.</Text>
        <Text style={styles.mutedText}>CREATE ONE IN THE PLANS TAB.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {!view.hasAnySchedule ? (
        <Text style={styles.nudge}>
          ASSIGN PLANS TO DAYS IN THE PLANS TAB FOR DAILY RECOMMENDATIONS.
        </Text>
      ) : null}
      {view.planMetas.map(({ plan, exerciseCount }) => (
        <PlanPickerRow
          key={plan.id}
          plan={plan}
          exerciseCount={exerciseCount}
          isToday={plan.id === view.todayPlanId}
          onPress={() => onPickPlan(plan.id)}
        />
      ))}
      <Pressable onPress={onEmptySession} style={styles.row}>
        <Text style={styles.rowName}>EMPTY SESSION</Text>
        <Text style={styles.rowSub}>FREESTYLE</Text>
      </Pressable>
    </View>
  );
}

function PlanPickerRow({
  plan,
  exerciseCount,
  isToday,
  onPress,
}: {
  plan: PlanRow;
  exerciseCount: number;
  isToday: boolean;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isToday) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [isToday, pulse]);

  const animatedBorder = isToday
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [colors.fg, colors.today] })
    : undefined;
  const animatedBg = isToday
    ? pulse.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", "rgba(0,255,0,0.08)"],
      })
    : undefined;

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.row,
          animatedBorder ? { borderColor: animatedBorder } : null,
          animatedBg ? { backgroundColor: animatedBg } : null,
        ]}
      >
        <Text style={[styles.rowName, isToday && styles.todayName]}>
          {plan.name.toUpperCase()}
          {isToday ? " — TODAY" : ""}
        </Text>
        <Text style={styles.rowSub}>{exerciseCount} EXERCISES</Text>
      </Animated.View>
    </Pressable>
  );
}

function PlanConfirmModal({
  modal,
  onStart,
  onClose,
}: {
  modal: ConfirmModal | null;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={modal !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>
            {modal?.planName.toUpperCase() ?? ""}
          </Text>
          {modal?.exerciseNames.map((name, i) => (
            <Text key={i} style={styles.sheetExercise}>
              {name.toUpperCase()}
            </Text>
          ))}
          <View style={styles.sheetActions}>
            <BrutalButton label="START" variant="primary" onPress={onStart} />
            <BrutalButton label="CANCEL" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  list: { gap: 8 },
  row: {
    borderColor: colors.fg,
    borderWidth: border,
    padding: 12,
    gap: 4,
    minHeight: touchTarget,
    justifyContent: "center",
  },
  rowName: {
    color: colors.fg,
    fontSize: fontSize.body,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
  },
  todayName: { color: colors.today },
  rowSub: { color: colors.muted, fontSize: fontSize.small },
  nudge: { color: colors.muted, fontSize: fontSize.small, letterSpacing: 0.5 },
  emptyState: { gap: 6 },
  emptyText: {
    color: colors.fg,
    fontSize: fontSize.body,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
  },
  mutedText: { color: colors.muted, fontSize: fontSize.small },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bg,
    borderColor: colors.fg,
    borderTopWidth: border,
    padding: 16,
    gap: 10,
  },
  sheetTitle: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 8,
  },
  sheetExercise: { color: colors.muted, fontSize: fontSize.body },
  sheetActions: { gap: 8, marginTop: 4 },
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
