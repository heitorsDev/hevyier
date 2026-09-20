import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Press } from "@/components/Press";
import { planById } from "@/data/plans";
import { deleteSession, sessionById, totalSets, totalVolume, useDb } from "@/data/store";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{plan?.name ?? session.planId}</Text>
      <Text style={styles.meta}>
        {new Date(session.startedAt).toLocaleString("pt-BR")} · {totalSets(session)} séries ·{" "}
        {Math.round(totalVolume(session))} kg
      </Text>

      {ordered.map((name) => (
        <View key={name} style={styles.block}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sets}>
            {session.sets[name].map((s) => `${s.weightKg}×${s.reps}`).join("   ")}
          </Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Press
          label="APAGAR SESSÃO"
          onPress={() => {
            deleteSession(session.id);
            router.back();
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 4 },
  title: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono, marginBottom: 8 },
  block: { borderTopWidth: border, borderTopColor: colors.fg, paddingVertical: 10, gap: 2 },
  name: { color: colors.fg, fontSize: fontSize.body },
  sets: { color: colors.muted, fontFamily: fontFamilyMono, fontSize: fontSize.body },
  footer: { marginTop: 24 },
});
