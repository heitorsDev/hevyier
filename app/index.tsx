import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "@/components/ui/primitives";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { PLANS, planById } from "@/data/plans";
import { activeSession, finishedSessions, startSession, totalSets, useDb } from "@/data/store";

export default function Home() {
  const db = useDb();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const active = activeSession(db);
  const recent = finishedSessions(db).slice(0, 5);

  function open(planId: string) {
    // Resuming means reusing the open session rather than stacking a new
    // one — there is only ever one session in flight.
    if (!active) startSession(planId, Date.now());
    router.push(`/day/${active ? active.planId : planId}`);
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}
    >
      {active && (
        <Pressable onPress={() => open(active.planId)}>
          <Card className="border-accent">
            <Text variant="label" className="text-accent">
              EM ANDAMENTO
            </Text>
            <Text variant="display">{planById(active.planId)?.name ?? active.planId}</Text>
            <Text variant="monoMuted">{totalSets(active)} séries</Text>
          </Card>
        </Pressable>
      )}

      {PLANS.map((plan) => (
        <Pressable key={plan.id} onPress={() => open(plan.id)}>
          <Card>
            <Text variant="display">{plan.name}</Text>
            <Text variant="monoMuted">
              {plan.exercises.length} exercícios ·{" "}
              {plan.exercises.reduce((n, e) => n + e.sets, 0)} séries
            </Text>
          </Card>
        </Pressable>
      ))}

      <CardContent className="mt-3">
        <Text variant="label">ÚLTIMAS</Text>
        {recent.length === 0 && <Text variant="monoMuted">—</Text>}
        {recent.map((session) => (
          <Link key={session.id} href={`/history/${session.id}`} asChild>
            <Pressable>
              <Separator className="bg-disabled" />
              <CardHeader className="py-2.5">
                <Text>{planById(session.planId)?.name ?? session.planId}</Text>
                <Text variant="monoMuted">
                  {new Date(session.startedAt).toLocaleDateString("pt-BR")} ·{" "}
                  {totalSets(session)}s
                </Text>
              </CardHeader>
            </Pressable>
          </Link>
        ))}
        <View className="pt-2">
          <Link href="/history" asChild>
            <Pressable>
              <Text variant="label">VER TUDO →</Text>
            </Pressable>
          </Link>
        </View>
      </CardContent>

    </ScrollView>
  );
}
