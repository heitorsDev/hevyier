import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Modal, ScrollView, Text, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { PressableRow } from "@/components/PressableRow";
import { appDb } from "@/db/bootstrap";
import {
  createPlan,
  listPlanExercises,
  listPlans,
  type PlanRow,
} from "@/repos/plansRepo";
import {
  assignPlanToDay,
  listWeekSchedule,
  type ScheduleRow,
} from "@/repos/scheduleRepo";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

// Sunday-first to match dayOfWeek 0..6; weekday rows render MON→SUN below.
const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Days assigned to a plan, joined `MON·THU`; empty string when none. */
function weekdayTagsForPlan(week: ScheduleRow[], planId: number): string {
  return week
    .filter((row) => row.planId === planId)
    .map((row) => WEEKDAY_LABELS[row.dayOfWeek])
    .join("·");
}

export default function PlansTab() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [week, setWeek] = useState<ScheduleRow[]>([]);
  const [pickerDay, setPickerDay] = useState<number | null>(null);

  const reload = useCallback(() => {
    setPlans(listPlans(appDb));
    setWeek(listWeekSchedule(appDb));
  }, []);
  useFocusEffect(reload);

  const createAndOpen = () => {
    const id = createPlan(appDb, "NEW PLAN");
    router.push(`/plan/${id}`);
  };

  const assign = (dayOfWeek: number, planId: number | null) => {
    assignPlanToDay(appDb, dayOfWeek, planId);
    setPickerDay(null);
    reload();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <BrutalButton label="+ NEW" variant="primary" onPress={createAndOpen} />
      {plans.map((plan) => (
        <PlanListRow
          key={plan.id}
          plan={plan}
          week={week}
          onPress={() => router.push(`/plan/${plan.id}`)}
        />
      ))}

      <Text style={styles.header}>SCHEDULE</Text>
      {WEEKDAY_DISPLAY_ORDER.map((dayOfWeek) => (
        <ScheduleDayRow
          key={dayOfWeek}
          dayOfWeek={dayOfWeek}
          planName={planNameForDay(plans, week, dayOfWeek)}
          onPress={() => setPickerDay(dayOfWeek)}
        />
      ))}

      <PlanPickerModal
        visible={pickerDay !== null}
        plans={plans}
        onPick={(planId) => assign(pickerDay as number, planId)}
        onClose={() => setPickerDay(null)}
      />
    </ScrollView>
  );
}

function planNameForDay(
  plans: PlanRow[],
  week: ScheduleRow[],
  dayOfWeek: number,
): string | null {
  const row = week.find((r) => r.dayOfWeek === dayOfWeek);
  if (!row || row.planId === null) return null;
  return plans.find((p) => p.id === row.planId)?.name ?? null;
}

function PlanListRow({
  plan,
  week,
  onPress,
}: {
  plan: PlanRow;
  week: ScheduleRow[];
  onPress: () => void;
}) {
  const count = listPlanExercises(appDb, plan.id).length;
  const tags = weekdayTagsForPlan(week, plan.id);
  return (
    <PressableRow onPress={onPress}>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.muted}>
        {count} EX{tags ? `  ${tags}` : ""}
      </Text>
    </PressableRow>
  );
}

function ScheduleDayRow({
  dayOfWeek,
  planName,
  onPress,
}: {
  dayOfWeek: number;
  planName: string | null;
  onPress: () => void;
}) {
  return (
    <PressableRow onPress={onPress}>
      <Text style={styles.planName}>{WEEKDAY_LABELS[dayOfWeek]}</Text>
      <Text style={planName ? styles.planName : styles.muted}>
        {planName ?? "REST"}
      </Text>
    </PressableRow>
  );
}

function PlanPickerModal({
  visible,
  plans,
  onPick,
  onClose,
}: {
  visible: boolean;
  plans: PlanRow[];
  onPick: (planId: number | null) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.header}>ASSIGN PLAN</Text>
        <PressableRow onPress={() => onPick(null)}>
          <Text style={styles.muted}>REST</Text>
        </PressableRow>
        {plans.map((plan) => (
          <PressableRow key={plan.id} onPress={() => onPick(plan.id)}>
            <Text style={styles.planName}>{plan.name}</Text>
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
  header: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    marginTop: 16,
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 4,
  },
  planName: { color: colors.fg, fontSize: fontSize.body },
  muted: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono },
});
