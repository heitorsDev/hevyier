import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, View, StyleSheet } from "react-native";

import { Stepper } from "@/components/Stepper";
import { appDb } from "@/db/bootstrap";
import { formatSeconds } from "@/domain/formatSeconds";
import {
  getGlobalSetCount,
  getRestTimerSeconds,
  setGlobalSetCount,
  setRestTimerSeconds,
} from "@/repos/settingsRepo";
import { border, colors, fontSize, touchTarget } from "@/theme/tokens";

interface SettingsValues {
  warmupSets: number;
  workSets: number;
  warmupRest: number;
  workRest: number;
}

function readSettings(): SettingsValues {
  return {
    warmupSets: getGlobalSetCount(appDb, "warmup"),
    workSets: getGlobalSetCount(appDb, "work"),
    warmupRest: getRestTimerSeconds(appDb, "warmup"),
    workRest: getRestTimerSeconds(appDb, "work"),
  };
}

export default function SettingsScreen() {
  const [values, setValues] = useState<SettingsValues>(readSettings);
  useFocusEffect(useCallback(() => setValues(readSettings()), []));

  const onWarmupSets = (n: number) => {
    setGlobalSetCount(appDb, "warmup", n);
    setValues((prev) => ({ ...prev, warmupSets: n }));
  };
  const onWorkSets = (n: number) => {
    setGlobalSetCount(appDb, "work", n);
    setValues((prev) => ({ ...prev, workSets: n }));
  };
  const onWarmupRest = (n: number) => {
    setRestTimerSeconds(appDb, "warmup", n);
    setValues((prev) => ({ ...prev, warmupRest: n }));
  };
  const onWorkRest = (n: number) => {
    setRestTimerSeconds(appDb, "work", n);
    setValues((prev) => ({ ...prev, workRest: n }));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SettingRow label="GLOBAL WARMUP SETS">
        <Stepper value={values.warmupSets} onChange={onWarmupSets} step={1} min={0} />
      </SettingRow>
      <SettingRow label="GLOBAL WORK SETS">
        <Stepper value={values.workSets} onChange={onWorkSets} step={1} min={0} />
      </SettingRow>
      <SettingRow label="WARMUP REST">
        <Stepper
          value={values.warmupRest}
          onChange={onWarmupRest}
          step={15}
          min={0}
          format={formatSeconds}
        />
      </SettingRow>
      <SettingRow label="WORK REST">
        <Stepper
          value={values.workRest}
          onChange={onWorkRest}
          step={15}
          min={0}
          format={formatSeconds}
        />
      </SettingRow>
    </ScrollView>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12 },
  row: {
    minHeight: touchTarget,
    borderColor: colors.fg,
    borderBottomWidth: border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: { color: colors.fg, fontSize: fontSize.body, flexShrink: 1 },
});
