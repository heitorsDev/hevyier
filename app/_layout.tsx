import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors, fontSize } from "@/theme/tokens";

export default function RootLayout() {
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
