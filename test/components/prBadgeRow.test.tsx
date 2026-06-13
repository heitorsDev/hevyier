import { render } from "@testing-library/react-native";

import { PrBadgeRow } from "@/components/PrBadgeRow";

test("shows the value and formatted date when a record exists", () => {
  const dateMs = new Date(2026, 5, 12, 12).getTime();
  const { getByText } = render(
    <PrBadgeRow label="HEAVIEST" value="120 kg × 3" dateMs={dateMs} />,
  );
  expect(getByText("120 kg × 3")).toBeTruthy();
  expect(getByText("FRI 12 JUN")).toBeTruthy();
});

test("shows an em-dash and no date when there is no record", () => {
  const { getByText, queryByText } = render(
    <PrBadgeRow label="HEAVIEST" value="" dateMs={null} />,
  );
  expect(getByText("—")).toBeTruthy();
  expect(queryByText(/JUN/)).toBeNull();
});
