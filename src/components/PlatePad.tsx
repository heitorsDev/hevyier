import { Pressable, Text, View, StyleSheet } from "react-native";

import { border, colors, fontFamilyMono, fontSize, touchTarget } from "@/theme/tokens";

const PLATES = [2.5, 5, 10, 15, 20] as const;

/**
 * Primary weight input: two rows of plate buttons that nudge the active
 * set row's weight up (top) or down (bottom). Press emits a signed delta;
 * the screen applies it. Zero-keyboard — the lifter never types here.
 *
 * Usage: `<PlatePad onDelta={(kg) => addWeight(kg)} />`
 */
export function PlatePad({ onDelta }: { onDelta: (deltaKg: number) => void }) {
  return (
    <View>
      {/* topRow has borderBottomWidth: 0 — bottom row's top border provides the shared middle line */}
      <View style={[styles.row, styles.topRow]}>
        {PLATES.map((plate, i) => (
          <PlateButton
            key={`+${plate}`}
            delta={plate}
            onDelta={onDelta}
            isLast={i === PLATES.length - 1}
          />
        ))}
      </View>
      <View style={styles.row}>
        {PLATES.map((plate, i) => (
          <PlateButton
            key={`-${plate}`}
            delta={-plate}
            onDelta={onDelta}
            isLast={i === PLATES.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

function PlateButton({
  delta,
  onDelta,
  isLast,
}: {
  delta: number;
  onDelta: (deltaKg: number) => void;
  isLast: boolean;
}) {
  const label = `${delta > 0 ? "+" : "−"}${Math.abs(delta)}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onDelta(delta)}
      style={[styles.button, isLast && styles.lastButton]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Outer row provides the frame; buttons draw only internal dividers.
  row: {
    flexDirection: "row",
    borderColor: colors.fg,
    borderWidth: border,
  },
  topRow: {
    borderBottomWidth: 0,
  },
  button: {
    flex: 1,
    height: touchTarget,
    borderRightColor: colors.fg,
    borderRightWidth: border,
    alignItems: "center",
    justifyContent: "center",
  },
  lastButton: {
    borderRightWidth: 0,
  },
  label: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontSize: fontSize.body,
    fontWeight: "700",
  },
});
