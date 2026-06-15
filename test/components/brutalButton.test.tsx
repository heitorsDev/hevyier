import { fireEvent, render } from "@testing-library/react-native";

import { BrutalButton } from "@/components/BrutalButton";

test("BrutalButton fires onPress when tapped", () => {
  const onPress = jest.fn();
  const { getByText } = render(<BrutalButton label="SAVE" onPress={onPress} />);

  fireEvent.press(getByText("SAVE"));

  expect(onPress).toHaveBeenCalledTimes(1);
});

test("BrutalButton ignores taps when disabled", () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <BrutalButton label="SAVE" onPress={onPress} disabled />,
  );

  fireEvent.press(getByText("SAVE"));

  expect(onPress).not.toHaveBeenCalled();
});
