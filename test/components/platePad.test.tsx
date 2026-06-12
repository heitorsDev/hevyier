import { fireEvent, render } from "@testing-library/react-native";

import { PlatePad } from "@/components/PlatePad";

// `+` buttons only: the `−` labels use U+2212 (minus sign), so we drive
// the positive buttons and assert sign via the emitted delta instead of
// fighting the text matcher on the minus glyph.
test("PlatePad emits signed deltas for plate buttons", () => {
  const onDelta = jest.fn();
  const { getByText } = render(<PlatePad onDelta={onDelta} />);

  fireEvent.press(getByText("+5"));
  expect(onDelta).toHaveBeenCalledWith(5);

  fireEvent.press(getByText("+2.5"));
  expect(onDelta).toHaveBeenLastCalledWith(2.5);
});
