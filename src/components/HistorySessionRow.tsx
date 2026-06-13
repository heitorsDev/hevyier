import { Text, View, StyleSheet } from "react-native";

import { PressableRow } from "@/components/PressableRow";
import {
  sessionDurationMs,
  sessionTitle,
  summaryLine,
  type HistoryListItem,
} from "@/domain/historyList";
import { formatDateHeader, formatDuration } from "@/domain/sessionFormat";
import { colors, fontFamilyMono, fontSize } from "@/theme/tokens";

/**
 * One finished session on the History list: date + title on the top line,
 * duration + `n sets · n,nnn kg` summary on the muted second line. Whole row
 * taps through to the detail screen.
 *
 * Usage: `<HistorySessionRow item={item} onPress={() => open(item.sessionId)} />`
 */
export function HistorySessionRow({
  item,
  onPress,
}: {
  item: HistoryListItem;
  onPress: () => void;
}) {
  const duration = formatDuration(sessionDurationMs(item));
  return (
    <PressableRow onPress={onPress}>
      <View style={styles.body}>
        <Text style={styles.title}>
          {formatDateHeader(item.startedAt)} · {sessionTitle(item.planName)}
        </Text>
        <Text style={styles.summary}>
          {duration} · {summaryLine(item)}
        </Text>
      </View>
    </PressableRow>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: 4 },
  title: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    fontWeight: "700",
  },
  summary: {
    color: colors.muted,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.small,
  },
});
