import { Alert } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { appDb } from "@/db/bootstrap";
import {
  deleteExercise,
  setExerciseArchived,
} from "@/repos/exercisesRepo";
import { countSetsForExercise } from "@/repos/setsRepo";

// Logged sets make a hard delete unsafe (FK history), so the footer
// offers a reversible archive instead; only history-free exercises can
// be deleted (decision #10).
function hasLoggedSets(id: number): boolean {
  return countSetsForExercise(appDb, id) > 0;
}

function confirmDelete(id: number, onDone: () => void): void {
  Alert.alert("DELETE EXERCISE", "This cannot be undone.", [
    { text: "CANCEL", style: "cancel" },
    {
      text: "DELETE",
      style: "destructive",
      onPress: () => {
        deleteExercise(appDb, id);
        onDone();
      },
    },
  ]);
}

/**
 * Edit-mode footer: ARCHIVE/UNARCHIVE for exercises with logged sets
 * (no confirm — reversible), or DELETE with a confirm dialog otherwise.
 *
 * Usage: `<ExerciseDangerFooter id={5} archived={false} onDone={back} />`
 */
export function ExerciseDangerFooter({
  id,
  archived,
  onDone,
}: {
  id: number;
  archived: boolean;
  onDone: () => void;
}) {
  if (hasLoggedSets(id)) {
    return (
      <BrutalButton
        label={archived ? "UNARCHIVE" : "ARCHIVE"}
        variant="danger"
        onPress={() => {
          setExerciseArchived(appDb, id, !archived);
          onDone();
        }}
      />
    );
  }
  return (
    <BrutalButton
      label="DELETE"
      variant="danger"
      onPress={() => confirmDelete(id, onDone)}
    />
  );
}
