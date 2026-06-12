import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useDatabaseReady } from "@/db/bootstrap";
import { colors, fontSize } from "@/theme/tokens";

export default function RootLayout() {
  const databaseReady = useDatabaseReady();
  // Render nothing until migrated + seeded — the local DB finishes in
  // milliseconds, so a spinner would only flash (PRODUCT.md).
  if (!databaseReady) return null;
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.fg,
          headerTitleStyle: { fontSize: fontSize.large, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="session"
          options={{ presentation: "fullScreenModal", headerShown: false }}
        />
        <Stack.Screen name="settings" options={{ title: "SETTINGS" }} />
        <Stack.Screen name="exercise/[id]" options={{ title: "EXERCISE" }} />
        <Stack.Screen name="plan/[id]" options={{ title: "PLAN" }} />
      </Stack>
    </>
  );
}
