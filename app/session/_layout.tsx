import { Stack } from "expo-router";

import { RestTimerProvider } from "@/hooks/useRestTimer";
import { colors, fontSize } from "@/theme/tokens";

// Session flow lives in its own stack so the root layout can present the
// whole group as one fullScreenModal (Session Screen ↔ Logging Screen).
// One RestTimerProvider wraps the stack so both screens share one timer.
export default function SessionLayout() {
  return (
    <RestTimerProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.fg,
          headerTitleStyle: { fontSize: fontSize.large, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* Session overview uses its own in-body header (plan name + live clock). */}
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
        <Stack.Screen name="[id]/log/[sessionExerciseId]" options={{ title: "EXERCISE" }} />
      </Stack>
    </RestTimerProvider>
  );
}
