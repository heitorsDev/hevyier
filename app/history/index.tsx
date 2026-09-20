import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { planById } from "@/data/plans";
import { finishedSessions, totalSets, totalVolume, useDb } from "@/data/store";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

export default function HistoryList() {
  const sessions = finishedSessions(useDb());
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {sessions.length === 0 && <Text style={styles.empty}>SEM SESSÕES</Text>}
      {sessions.map((session) => (
        <Link key={session.id} href={`/history/${session.id}`} asChild>
          <Pressable style={styles.row}>
            <Text style={styles.name}>{planById(session.planId)?.name ?? session.planId}</Text>
            <Text style={styles.meta}>
              {new Date(session.startedAt).toLocaleDateString("pt-BR")} · {totalSets(session)} séries ·{" "}
              {Math.round(totalVolume(session))} kg
            </Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  empty: { color: colors.disabled, fontFamily: fontFamilyMono },
  row: { borderTopWidth: border, borderTopColor: colors.fg, paddingVertical: 12, gap: 2 },
  name: { color: colors.fg, fontSize: fontSize.body, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono },
});
