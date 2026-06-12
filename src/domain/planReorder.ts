// Pure reordering for plan-exercise lists. No react-native imports — callers
// persist the returned `order` values via setPlanExerciseOrder. Kept total:
// moving an end item is a no-op clone rather than an error.

export type Orderable = { id: number; order: number };

/**
 * Sort by current order then reassign contiguous 0..n-1 values.
 *
 * Example: normalizeOrders([{id:1,order:5},{id:2,order:2}])
 *   → [{id:2,order:0},{id:1,order:1}]
 */
export function normalizeOrders<T extends Orderable>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

function indexOfOrThrow<T extends Orderable>(items: T[], id: number): number {
  const index = items.findIndex((item) => item.id === id);
  if (index >= 0) return index;
  throw new Error(
    `moveUp/moveDown got id ${id}, which must exist in the items list (ids: ${items
      .map((item) => item.id)
      .join(",")})`,
  );
}

function swapAndRenumber<T extends Orderable>(
  items: T[],
  index: number,
  neighbour: number,
): T[] {
  const sorted = normalizeOrders(items);
  const next = [...sorted];
  [next[index], next[neighbour]] = [next[neighbour], next[index]];
  return next.map((item, position) => ({ ...item, order: position }));
}

/** Swap the target one slot earlier; no-op clone if already first. */
export function moveUp<T extends Orderable>(items: T[], id: number): T[] {
  const sorted = normalizeOrders(items);
  const index = indexOfOrThrow(sorted, id);
  if (index === 0) return sorted;
  return swapAndRenumber(sorted, index, index - 1);
}

/** Swap the target one slot later; no-op clone if already last. */
export function moveDown<T extends Orderable>(items: T[], id: number): T[] {
  const sorted = normalizeOrders(items);
  const index = indexOfOrThrow(sorted, id);
  if (index === sorted.length - 1) return sorted;
  return swapAndRenumber(sorted, index, index + 1);
}
