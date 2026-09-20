import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PLANS, planById } from "@/data/plans";
import { activeSession, finishedSessions, startSession, totalSets, useDb } from "@/data/store";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

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
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      {active && (
        <Pressable style={styles.resume} onPress={() => open(active.planId)}>
          <Text style={styles.resumeLabel}>EM ANDAMENTO</Text>
          <Text style={styles.resumeName}>{planById(active.planId)?.name ?? active.planId}</Text>
          <Text style={styles.resumeMeta}>{totalSets(active)} séries</Text>
        </Pressable>
      )}

      {PLANS.map((plan) => (
        <Pressable key={plan.id} style={styles.row} onPress={() => open(plan.id)}>
          <Text style={styles.rowName}>{plan.name}</Text>
          <Text style={styles.rowMeta}>
            {plan.exercises.length} exercícios ·{" "}
            {plan.exercises.reduce((n, e) => n + e.sets, 0)} séries
          </Text>
        </Pressable>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ÚLTIMAS</Text>
        {recent.length === 0 && <Text style={styles.empty}>—</Text>}
        {recent.map((session) => (
          <Link key={session.id} href={`/history/${session.id}`} asChild>
            <Pressable style={styles.historyRow}>
              <Text style={styles.historyName}>
                {planById(session.planId)?.name ?? session.planId}
              </Text>
              <Text style={styles.historyMeta}>
                {new Date(session.startedAt).toLocaleDateString("pt-BR")} · {totalSets(session)}s
              </Text>
            </Pressable>
          </Link>
        ))}
        <Link href="/history" style={styles.more}>
          VER TUDO →
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 12 },
  resume: { borderWidth: border, borderColor: colors.today, padding: 14, gap: 2 },
  resumeLabel: { color: colors.today, fontSize: fontSize.small, letterSpacing: 2 },
  resumeName: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  resumeMeta: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono },
  row: { borderWidth: border, borderColor: colors.fg, padding: 14, gap: 2 },
  rowName: { color: colors.fg, fontSize: fontSize.large, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono },
  section: { marginTop: 12, gap: 8 },
  sectionTitle: { color: colors.muted, fontSize: fontSize.small, letterSpacing: 2 },
  empty: { color: colors.disabled, fontFamily: fontFamilyMono },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderTopWidth: border,
    borderTopColor: colors.disabled,
    paddingVertical: 10,
  },
  historyName: { color: colors.fg, fontSize: fontSize.body },
  historyMeta: { color: colors.muted, fontSize: fontSize.small, fontFamily: fontFamilyMono },
  more: { color: colors.muted, fontSize: fontSize.small, letterSpacing: 2, paddingTop: 8 },
});
