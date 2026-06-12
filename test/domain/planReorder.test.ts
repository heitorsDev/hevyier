import {
  moveDown,
  moveUp,
  normalizeOrders,
  type Orderable,
} from "@/domain/planReorder";

function items(): Orderable[] {
  return [
    { id: 10, order: 0 },
    { id: 20, order: 1 },
    { id: 30, order: 2 },
  ];
}

test("normalizeOrders sorts by order and reassigns 0..n-1", () => {
  const result = normalizeOrders([
    { id: 1, order: 5 },
    { id: 2, order: 2 },
  ]);
  expect(result).toEqual([
    { id: 2, order: 0 },
    { id: 1, order: 1 },
  ]);
});

test("moveUp swaps with previous neighbour and renumbers", () => {
  expect(moveUp(items(), 20)).toEqual([
    { id: 20, order: 0 },
    { id: 10, order: 1 },
    { id: 30, order: 2 },
  ]);
});

test("moveDown swaps with next neighbour and renumbers", () => {
  expect(moveDown(items(), 20)).toEqual([
    { id: 10, order: 0 },
    { id: 30, order: 1 },
    { id: 20, order: 2 },
  ]);
});

test("moving an end item is a no-op clone", () => {
  expect(moveUp(items(), 10)).toEqual(items());
  expect(moveDown(items(), 30)).toEqual(items());
});

test("unknown id throws naming the id and that it must exist", () => {
  expect(() => moveUp(items(), 99)).toThrow(/id 99/);
  expect(() => moveDown(items(), 99)).toThrow(/must exist in the items list/);
});
