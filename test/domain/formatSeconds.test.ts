import { formatSeconds } from "@/domain/formatSeconds";

test("formats whole minutes and zero", () => {
  expect(formatSeconds(0)).toBe("0:00");
  expect(formatSeconds(60)).toBe("1:00");
});

test("zero-pads seconds under ten", () => {
  expect(formatSeconds(5)).toBe("0:05");
  expect(formatSeconds(150)).toBe("2:30");
});

test("throws on negative or non-integer input naming the value", () => {
  expect(() => formatSeconds(-1)).toThrow(/-1/);
  expect(() => formatSeconds(1.5)).toThrow(/1\.5/);
});
