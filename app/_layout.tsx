import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useDatabaseReady, useWebRuntimeWarm } from "@/db/bootstrap";
import { colors, fontSize } from "@/theme/tokens";

export default function RootLayout() {
  // Two-stage gate: on web the sqlite worker (wasm + OPFS) and CanvasKit
  // must warm up before any synchronous open / chart render. Native
  // returns warm immediately, so this collapses to the old single gate.
  const warm = useWebRuntimeWarm();
  if (!warm) return null;
  return <ReadyGate />;
}

function ReadyGate() {
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
        <Stack.Screen name="history/[id]" options={{ title: "SESSION" }} />
        <Stack.Screen name="exercise/[id]" options={{ title: "EXERCISE" }} />
        <Stack.Screen name="plan/[id]" options={{ title: "PLAN" }} />
      </Stack>
    </>
  );
}
