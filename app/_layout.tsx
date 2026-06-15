import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View, Text, ActivityIndicator } from "react-native";

import { HeaderBackLink } from "@/components/HeaderBackLink";
import { useDatabaseReady, useWebRuntimeWarm } from "@/db/bootstrap";
import { colors, fontSize } from "@/theme/tokens";

export default function RootLayout() {
  // Two-stage gate: on web the sqlite worker (wasm + OPFS) and CanvasKit
  // must warm up before any synchronous open / chart render. Native
  // returns warm immediately, so this collapses to the old single gate.
  const warm = useWebRuntimeWarm();
  if (!warm) {
    // Web only: show loading while wasm modules compile (5-30s on first load).
    // Native returns warm=true immediately so this branch never executes there.
    if (Platform.OS === "web") return <WebLoadingScreen />;
    return null;
  }
  return <ReadyGate />;
}

function WebLoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", gap: 16 }}>
      <ActivityIndicator color={colors.fg} size="large" />
      <Text style={{ color: colors.fg, fontSize: fontSize.body, letterSpacing: 2 }}>LOADING</Text>
    </View>
  );
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
        <Stack.Screen
          name="exercise/[id]"
          options={{ title: "EXERCISE", headerLeft: () => <HeaderBackLink /> }}
        />
        <Stack.Screen name="plan/[id]" options={{ title: "PLAN" }} />
      </Stack>
    </>
  );
}
