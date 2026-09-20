import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseBlock } from "@/components/ExerciseBlock";
import { Press } from "@/components/Press";
import { RestTimerBar, formatClock, useRestTimer } from "@/components/RestTimer";
import { planById } from "@/data/plans";
import {
  activeSession,
  addSet,
  finishSession,
  lastSetsFor,
  removeSet,
  startSession,
  totalSets,
  totalVolume,
  useDb,
} from "@/data/store";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

export default function DayScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const db = useDb();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rest = useRestTimer();
  const plan = planById(planId);

  const session = activeSession(db);
  // Finishing clears the active session while this screen is still mounted;
  // without the latch the effect below would immediately open a new one.
  const opened = useRef(false);
  if (session) opened.current = true;
  useEffect(() => {
    // Entering the screen directly (deep link, reload) with no session open
    // starts one, so the screen always has somewhere to write.
    if (!session && plan && !opened.current) {
      opened.current = true;
      startSession(plan.id, Date.now());
    }
  }, [session, plan]);

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!session) return;
    const tick = () => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  if (!plan) return null;
  if (!session) return null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>{plan.name}</Text>
        <Text style={styles.clock}>{formatClock(elapsed)}</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {plan.exercises.map((exercise) => (
          <ExerciseBlock
            key={exercise.name}
            exercise={exercise}
            logged={session.sets[exercise.name] ?? []}
            lastTime={lastSetsFor(db, exercise.name, session.id)}
            onLog={(set) => {
              addSet(session.id, exercise.name, { ...set, loggedAt: Date.now() });
              rest.start(exercise.rest);
            }}
            onRemove={(index) => removeSet(session.id, exercise.name, index)}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.summary}>
            {totalSets(session)} séries · {Math.round(totalVolume(session))} kg
          </Text>
          <Press
            filled
            label="FINALIZAR"
            onPress={() => {
              finishSession(session.id, Date.now());
              // Pop rather than push home, so home doesn't stack a second
              // entry (and grow a back arrow). replace covers deep links,
              // where there is nothing to pop to.
              if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
          />
        </View>
      </ScrollView>

      {rest.remaining !== null && (
        <View style={{ paddingBottom: insets.bottom }}>
          <RestTimerBar remaining={rest.remaining} onDismiss={rest.stop} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: border,
    borderBottomColor: colors.fg,
  },
  back: { color: colors.fg, fontSize: fontSize.large },
  title: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700", flex: 1 },
  clock: { color: colors.muted, fontFamily: fontFamilyMono, fontSize: fontSize.body },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16 },
  footer: { borderTopWidth: border, borderTopColor: colors.fg, paddingTop: 16, gap: 12 },
  summary: { color: colors.muted, fontFamily: fontFamilyMono, fontSize: fontSize.body },
});
