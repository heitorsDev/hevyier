import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { BrutalButton } from "@/components/BrutalButton";
import { border, colors, fontFamilyMono, fontSize } from "@/theme/tokens";

export interface ConfirmModal {
  planId: number;
  planName: string;
  exerciseNames: string[];
}

/**
 * Bottom-sheet modal to confirm starting a plan-based session.
 * Renders nothing (modal not visible) when `modal` is null.
 *
 * Usage: `<PlanConfirmModal modal={modal} onStart={start} onClose={close} />`
 */
export function PlanConfirmModal({
  modal,
  onStart,
  onClose,
}: {
  modal: ConfirmModal | null;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={modal !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>
            {modal?.planName.toUpperCase() ?? ""}
          </Text>
          {modal?.exerciseNames.map((name) => (
            <Text key={name} style={styles.sheetExercise}>
              {name.toUpperCase()}
            </Text>
          ))}
          <View style={styles.sheetActions}>
            <BrutalButton label="START" variant="primary" onPress={onStart} />
            <BrutalButton label="CANCEL" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bg,
    borderColor: colors.fg,
    borderTopWidth: border,
    padding: 16,
    gap: 10,
  },
  sheetTitle: {
    color: colors.fg,
    fontSize: fontSize.large,
    fontWeight: "700",
    fontFamily: fontFamilyMono,
    borderColor: colors.fg,
    borderBottomWidth: border,
    paddingBottom: 8,
  },
  sheetExercise: { color: colors.muted, fontSize: fontSize.body },
  sheetActions: { gap: 8, marginTop: 4 },
});
