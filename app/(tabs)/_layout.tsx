import { Tabs } from "expo-router";

import { SettingsGearLink } from "@/components/SettingsGearLink";
import { border, colors, fontSize, tabBarHeight } from "@/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.fg,
        headerTitleStyle: { fontSize: fontSize.large, fontWeight: "700" },
        headerShadowVisible: false,
        headerRight: () => <SettingsGearLink />,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.fg,
          borderTopWidth: border,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: colors.fg,
        tabBarInactiveTintColor: colors.muted,
        // letterSpacing slightly negative: 9-char labels (EXERCISES,
        // ANALYTICS) must fit a 1/5 slot (~82dp) at bold weight on
        // narrow screens without ellipsis.
        tabBarLabelStyle: {
          fontSize: fontSize.small,
          fontWeight: "700",
          letterSpacing: -0.5,
          marginHorizontal: 0,
        },
        // Label-only tabs: zero icon space, labels center vertically in
        // the taller bar instead of hugging the bottom edge. Horizontal
        // padding zeroed so 9-char labels (EXERCISES, ANALYTICS) fit a
        // 1/5 slot on narrow screens without truncating.
        tabBarIconStyle: { display: "none" },
        tabBarItemStyle: { justifyContent: "center", paddingHorizontal: 0 },
        tabBarLabelPosition: "below-icon",
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "TODAY" }} />
      <Tabs.Screen name="history" options={{ title: "HISTORY" }} />
      <Tabs.Screen name="plans" options={{ title: "PLANS" }} />
      {/* Short names: 9-char labels ellipsize in a 1/5-width slot at
          bold 14 on ~400dp screens (EXERCIS…), and shrinking the font
          loses glanceability mid-workout. */}
      <Tabs.Screen name="exercises" options={{ title: "LIBRARY" }} />
      <Tabs.Screen name="analytics" options={{ title: "STATS" }} />
    </Tabs>
  );
}
