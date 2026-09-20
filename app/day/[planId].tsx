import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseBlock } from "@/components/ExerciseBlock";
import { RestTimerBar, formatClock, useRestTimer } from "@/components/RestTimer";
import { Button } from "@/components/ui/button";
import { Pressable, ScrollView, View } from "@/components/ui/primitives";
import { Text } from "@/components/ui/text";
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
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-4 py-2.5 border-b border-fg">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text variant="display">←</Text>
        </Pressable>
        <Text variant="display" className="flex-1">
          {plan.name}
        </Text>
        <Text variant="mono" className="text-muted">
          {formatClock(elapsed)}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
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

        <View className="border-t border-fg pt-4 gap-3">
          <Text variant="mono" className="text-muted">
            {totalSets(session)} séries · {Math.round(totalVolume(session))} kg
          </Text>
          <Button
            variant="primary"
            size="lg"
            onPress={() => {
              finishSession(session.id, Date.now());
              // Pop rather than push home, so home doesn't stack a second
              // entry (and grow a back arrow). replace covers deep links,
              // where there is nothing to pop to.
              if (router.canGoBack()) router.back();
              else router.replace("/");
            }}
          >
            <Text>FINALIZAR</Text>
          </Button>
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
