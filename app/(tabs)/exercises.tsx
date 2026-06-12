import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { ExerciseListItem } from "@/components/ExerciseListItem";
import { PressableRow } from "@/components/PressableRow";
import { SearchField } from "@/components/SearchField";
import { appDb } from "@/db/bootstrap";
import { groupAbbrev, selectedGroups } from "@/domain/exerciseForm";
import {
  listExercises,
  listMusclesForExercise,
  type ExerciseRow,
} from "@/repos/exercisesRepo";
import { colors, fontSize } from "@/theme/tokens";

// Row name + precomputed right-side meta string, so the FlatList renderer
// stays a pure mapping (no per-row DB calls in render).
interface LibraryEntry {
  row: ExerciseRow;
  meta: string;
}

/** "barbell · CHE · TRI" — equipment then group abbreviations, muted. */
function buildMeta(row: ExerciseRow): string {
  const pairs = listMusclesForExercise(appDb, row.id);
  const groups = selectedGroups(pairs).map(groupAbbrev);
  return [row.equipment, ...groups].join(" · ");
}

function loadLibrary(includeArchived: boolean): LibraryEntry[] {
  return listExercises(appDb, { includeArchived }).map((row) => ({
    row,
    meta: buildMeta(row),
  }));
}

function matchesQuery(entry: LibraryEntry, query: string): boolean {
  return entry.row.name.toLowerCase().includes(query.trim().toLowerCase());
}

export default function ExercisesTab() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [entries, setEntries] = useState<LibraryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      setEntries(loadLibrary(showArchived));
    }, [showArchived]),
  );

  const visible = useMemo(
    () => entries.filter((entry) => matchesQuery(entry, query)),
    [entries, query],
  );

  return (
    <View style={styles.screen}>
      <SearchField value={query} onChange={setQuery} placeholder="SEARCH" />
      <FlatList
        data={visible}
        keyExtractor={(entry) => String(entry.row.id)}
        ListHeaderComponent={
          <View style={styles.headerSlot}>
            <BrutalButton
              label="+ NEW"
              variant="primary"
              onPress={() => router.push("/exercise/new")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ExerciseListItem
            row={item.row}
            meta={item.meta}
            onPress={() => router.push(`/exercise/${item.row.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>NO EXERCISES</Text>}
        ListFooterComponent={
          <PressableRow onPress={() => setShowArchived((prev) => !prev)}>
            <Text style={styles.toggle}>
              {showArchived ? "HIDE ARCHIVED" : "SHOW ARCHIVED"}
            </Text>
          </PressableRow>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerSlot: { marginBottom: 8 },
  empty: { color: colors.muted, fontSize: fontSize.body, padding: 16 },
  toggle: { color: colors.fg, fontSize: fontSize.small, fontWeight: "700" },
});
