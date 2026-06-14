import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SettingsGearLink } from "@/components/SettingsGearLink";
import { border, colors, fontSize, tabBarHeight, tabBarIconSize } from "@/theme/tokens";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(outline: IoniconName, filled: IoniconName) {
  const Icon = ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} size={tabBarIconSize} color={color as string} />
  );
  Icon.displayName = `TabIcon(${outline})`;
  return Icon;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

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
          height: tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: colors.fg,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: false,
        tabBarItemStyle: { justifyContent: "center", paddingHorizontal: 0 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "TODAY", tabBarIcon: tabIcon("today-outline", "today") }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "HISTORY", tabBarIcon: tabIcon("time-outline", "time") }}
      />
      <Tabs.Screen
        name="plans"
        options={{ title: "PLANS", tabBarIcon: tabIcon("clipboard-outline", "clipboard") }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: "LIBRARY", tabBarIcon: tabIcon("barbell-outline", "barbell") }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: "STATS", tabBarIcon: tabIcon("bar-chart-outline", "bar-chart") }}
      />
    </Tabs>
  );
}
