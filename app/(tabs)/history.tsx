import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ScrollView, Text, StyleSheet } from "react-native";

import { HistoryMonthHeader } from "@/components/HistoryMonthHeader";
import { HistorySessionRow } from "@/components/HistorySessionRow";
import { appDb } from "@/db/bootstrap";
import { groupByMonth, type HistoryRow } from "@/domain/historyList";
import { listFinishedSessions } from "@/repos/historyRepo";
import { colors, fontSize } from "@/theme/tokens";

/**
 * History tab: finished sessions newest-first, grouped under month
 * separators. Active (unfinished) sessions are excluded by the repo query.
 * Re-reads on focus so a delete/edit from the detail screen is reflected
 * when the user navigates back.
 */
export default function HistoryTab() {
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);

  useFocusEffect(
    useCallback(() => setRows(groupByMonth(listFinishedSessions(appDb))), []),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {rows.length === 0 ? <Text style={styles.empty}>NO SESSIONS YET</Text> : null}
      {rows.map((row) =>
        row.kind === "month" ? (
          <HistoryMonthHeader key={row.key} label={row.label} />
        ) : (
          <HistorySessionRow
            key={row.key}
            item={row.item}
            onPress={() => router.push(`/history/${row.item.sessionId}`)}
          />
        ),
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12 },
  empty: { color: colors.muted, fontSize: fontSize.body, marginTop: 24 },
});
