import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { ScrollView, View } from "@/components/ui/primitives";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { planById } from "@/data/plans";
import { deleteSession, sessionById, totalSets, totalVolume, useDb } from "@/data/store";

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const router = useRouter();
  const session = sessionById(db, id);
  if (!session) return null;

  const plan = planById(session.planId);
  // Plan order is the reading order; anything logged outside the plan
  // (a substituted machine) still shows, appended after.
  const ordered = [
    ...(plan?.exercises.map((e) => e.name) ?? []),
    ...Object.keys(session.sets).filter((n) => !plan?.exercises.some((e) => e.name === n)),
  ].filter((name) => session.sets[name]?.length);

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 16, gap: 4 }}>
      <Text variant="display">{plan?.name ?? session.planId}</Text>
      <Text variant="monoMuted" className="mb-2">
        {new Date(session.startedAt).toLocaleString("pt-BR")} · {totalSets(session)} séries ·{" "}
        {Math.round(totalVolume(session))} kg
      </Text>

      {ordered.map((name) => (
        <View key={name}>
          <Separator />
          <View className="py-2.5 gap-0.5">
            <Text>{name}</Text>
            <Text variant="mono" className="text-muted">
              {session.sets[name].map((s) => `${s.weightKg}×${s.reps}`).join("   ")}
            </Text>
          </View>
        </View>
      ))}

      <View className="mt-6">
        <Button
          variant="danger"
          size="lg"
          onPress={() => {
            deleteSession(session.id);
            router.back();
          }}
        >
          <Text>APAGAR SESSÃO</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
