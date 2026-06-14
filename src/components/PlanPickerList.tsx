import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { border, colors, fontFamilyMono, fontSize, GREEN, GREEN_PULSE_BG, touchTarget } from "@/theme/tokens";
import type { PlanRow } from "@/repos/plansRepo";

export interface PlanMeta {
  plan: PlanRow;
  exerciseCount: number;
  exerciseNames: string[];
}

export interface PlanPickerListView {
  planMetas: PlanMeta[];
  todayPlanId: number | null;
  hasAnySchedule: boolean;
}

/**
 * Scrollable list of plans the user can pick from before starting a session.
 * Highlights the day's recommended plan with a pulsing green border.
 * Shows an EMPTY SESSION row for freestyle sessions.
 *
 * Usage: `<PlanPickerList view={view} onPickPlan={openModal} onEmptySession={startEmpty} />`
 */
export function PlanPickerList({
  view,
  onPickPlan,
  onEmptySession,
}: {
  view: PlanPickerListView;
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
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [colors.fg, GREEN] })
    : undefined;
  const animatedBg = isToday
    ? pulse.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", GREEN_PULSE_BG],
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

const styles = StyleSheet.create({
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
  todayName: { color: GREEN },
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
});
