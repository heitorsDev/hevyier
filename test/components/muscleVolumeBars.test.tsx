import { fireEvent, render } from "@testing-library/react-native";

import { MuscleVolumeBars } from "@/components/MuscleVolumeBars";
import type { MuscleWeekVolume } from "@/domain/analytics/muscleVolume";

// Charts wrap victory-native + Skia (native-only under jest). Stub the
// project-owned wrapper to a plain label so this test can exercise the
// group/drill-down behaviour without the native renderer.
jest.mock("@/charts", () => ({
  WeeklyBars: ({ label }: { label: string }) => {
    const { Text: RNText } = require("react-native");
    return <RNText>{label}</RNText>;
  },
}));

const weekStarts = [1_000, 2_000];

const rows: MuscleWeekVolume[] = [
  { weekStart: 1_000, group: "chest", subMuscle: "upper_chest", volumeKg: 300 },
  { weekStart: 1_000, group: "chest", subMuscle: "mid_chest", volumeKg: 100 },
  { weekStart: 2_000, group: "back", subMuscle: "lats", volumeKg: 50 },
];

test("renders one bar per group, biggest total first", () => {
  const { getByText } = render(<MuscleVolumeBars rows={rows} weekStarts={weekStarts} />);
  // chest total 400 > back total 50.
  expect(getByText(/CHEST · 400 KG/)).toBeTruthy();
  expect(getByText(/BACK · 50 KG/)).toBeTruthy();
});

test("tapping a group toggles its sub-muscle drill-down", () => {
  const { getByText, queryByText } = render(
    <MuscleVolumeBars rows={rows} weekStarts={weekStarts} />,
  );
  expect(queryByText(/UPPER_CHEST/)).toBeNull();

  fireEvent.press(getByText(/CHEST · 400 KG/));
  expect(getByText(/UPPER_CHEST · 300 KG/)).toBeTruthy();
  expect(getByText(/MID_CHEST · 100 KG/)).toBeTruthy();

  fireEvent.press(getByText(/CHEST · 400 KG/));
  expect(queryByText(/UPPER_CHEST/)).toBeNull();
});

test("renders an empty state when no volume is logged", () => {
  const { getByText } = render(<MuscleVolumeBars rows={[]} weekStarts={weekStarts} />);
  expect(getByText("NO VOLUME LOGGED")).toBeTruthy();
});
