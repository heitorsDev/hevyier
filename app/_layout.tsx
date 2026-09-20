import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { hydrate, useHydrated } from "@/data/store";
import { colors, fontSize } from "@/theme/tokens";

export default function RootLayout() {
  useEffect(() => {
    void hydrate();
  }, []);
  const hydrated = useHydrated();
  // Reading one AsyncStorage key takes milliseconds; a spinner would only
  // flash, so the tree simply waits (PRODUCT.md — speed over ceremony).
  if (!hydrated) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.fg,
          headerTitleStyle: { fontSize: fontSize.body, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "HEVYIER" }} />
        <Stack.Screen name="day/[planId]" options={{ headerShown: false }} />
        <Stack.Screen name="history/index" options={{ title: "HISTÓRICO" }} />
        <Stack.Screen name="history/[id]" options={{ title: "SESSÃO" }} />
      </Stack>
    </>
  );
}
