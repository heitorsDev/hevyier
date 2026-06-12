import { Pressable, Text, View, StyleSheet } from "react-native";

import { border, colors, fontFamilyMono, touchTarget } from "@/theme/tokens";

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
      <View style={styles.row}>
        {PLATES.map((plate) => (
          <PlateButton key={`+${plate}`} delta={plate} onDelta={onDelta} />
        ))}
      </View>
      <View style={styles.row}>
        {PLATES.map((plate) => (
          <PlateButton key={`-${plate}`} delta={-plate} onDelta={onDelta} />
        ))}
      </View>
    </View>
  );
}

function PlateButton({
  delta,
  onDelta,
}: {
  delta: number;
  onDelta: (deltaKg: number) => void;
}) {
  const label = `${delta > 0 ? "+" : "−"}${Math.abs(delta)}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onDelta(delta)}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  button: {
    flex: 1,
    height: touchTarget,
    borderColor: colors.fg,
    borderWidth: border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.fg,
    fontFamily: fontFamilyMono,
    fontWeight: "700",
  },
});
