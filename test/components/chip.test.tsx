import { fireEvent, render } from "@testing-library/react-native";

import { Chip } from "@/components/Chip";

test("Chip fires onPress when tapped", () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Chip label="barbell" selected={false} onPress={onPress} />,
  );

  fireEvent.press(getByText("barbell"));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("Chip renders its label when selected", () => {
  const { getByText } = render(
    <Chip label="dumbbell" selected onPress={jest.fn()} />,
  );

  expect(getByText("dumbbell")).toBeTruthy();
});
