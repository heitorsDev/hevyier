import { renderHook } from "@testing-library/react-native";

import { usePressFlashBg, usePressInvert } from "@/components/usePressFlash";

test("usePressInvert exposes press handlers and animated styles", () => {
  const { result } = renderHook(() =>
    usePressInvert({ bg: "#000", fg: "#FFF" }, { bg: "#FFF", fg: "#000" }),
  );

  expect(typeof result.current.onPressIn).toBe("function");
  expect(typeof result.current.onPressOut).toBe("function");
  expect(result.current.bgStyle).toBeTruthy();
  expect(result.current.labelStyle).toBeTruthy();
});

test("usePressInvert handlers run without throwing", () => {
  const { result } = renderHook(() =>
    usePressInvert({ bg: "#000", fg: "#FFF" }, { bg: "#FFF", fg: "#000" }),
  );

  expect(() => {
    result.current.onPressIn();
    result.current.onPressOut();
  }).not.toThrow();
});

test("usePressFlashBg exposes handlers and a bg style only", () => {
  const { result } = renderHook(() => usePressFlashBg("#000", "#FFF"));

  expect(typeof result.current.onPressIn).toBe("function");
  expect(result.current.bgStyle).toBeTruthy();
  expect("labelStyle" in result.current).toBe(false);
});
