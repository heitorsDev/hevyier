import { Stack } from "expo-router";

import { colors, fontSize } from "@/theme/tokens";

// Session flow lives in its own stack so the root layout can present the
// whole group as one fullScreenModal (Session Screen ↔ Logging Screen).
export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.fg,
        headerTitleStyle: { fontSize: fontSize.large, fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
