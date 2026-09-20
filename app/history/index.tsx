import { Link } from "expo-router";


import { Pressable, ScrollView, View } from "@/components/ui/primitives";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { planById } from "@/data/plans";
import { finishedSessions, totalSets, totalVolume, useDb } from "@/data/store";

export default function HistoryList() {
  const sessions = finishedSessions(useDb());
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      {sessions.length === 0 && <Text variant="monoMuted">SEM SESSÕES</Text>}
      {sessions.map((session) => (
        <Link key={session.id} href={`/history/${session.id}`} asChild>
          <Pressable>
            <Separator />
            <View className="py-3 gap-0.5">
              <Text variant="heading">
                {planById(session.planId)?.name ?? session.planId}
              </Text>
              <Text variant="monoMuted">
                {new Date(session.startedAt).toLocaleDateString("pt-BR")} ·{" "}
                {totalSets(session)} séries · {Math.round(totalVolume(session))} kg
              </Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
