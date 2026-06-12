import { buildSetRows } from "@/domain/setRows";
import type { SetRow } from "@/repos/setsRepo";

function set(over: Partial<SetRow>): SetRow {
  return {
    id: 1,
    sessionExerciseId: 1,
    type: "work",
    weightKg: 60,
    reps: 10,
    loggedAt: 1_000,
    ...over,
  };
}

test("fresh session: planned counts become blank rows, warmups first", () => {
  const rows = buildSetRows(2, 3, []);

  expect(rows.map((r) => r.label)).toEqual(["W1", "W2", "1", "2", "3"]);
  expect(rows.every((r) => r.setId === null && r.weightKg === null)).toBe(true);
  expect(rows.map((r) => r.type)).toEqual([
    "warmup",
    "warmup",
    "work",
    "work",
    "work",
  ]);
});

test("resume-partial: existing sets become checked rows, rest blank", () => {
  const existing = [
    set({ id: 11, type: "warmup", weightKg: 20, reps: 12 }),
    set({ id: 12, type: "work", weightKg: 60, reps: 10 }),
  ];

  const rows = buildSetRows(2, 3, existing);

  expect(rows[0]).toMatchObject({ label: "W1", setId: 11, weightKg: 20 });
  expect(rows[1]).toMatchObject({ label: "W2", setId: null, weightKg: null });
  expect(rows[2]).toMatchObject({ label: "1", setId: 12, weightKg: 60 });
  expect(rows[3]).toMatchObject({ label: "2", setId: null });
});

test("edit-finished freestyle: no plan counts, logged sets still shown", () => {
  const existing = [
    set({ id: 21, type: "work", weightKg: 100, reps: 5 }),
    set({ id: 22, type: "work", weightKg: 100, reps: 5 }),
  ];

  const rows = buildSetRows(0, 0, existing);

  expect(rows.map((r) => r.label)).toEqual(["1", "2"]);
  expect(rows.map((r) => r.setId)).toEqual([21, 22]);
});

test("more logged than planned: extra rows keep sequential labels", () => {
  const existing = [
    set({ id: 31, type: "work", weightKg: 60, reps: 10 }),
    set({ id: 32, type: "work", weightKg: 60, reps: 9 }),
    set({ id: 33, type: "work", weightKg: 60, reps: 8 }),
  ];

  const rows = buildSetRows(0, 1, existing);

  expect(rows.map((r) => r.label)).toEqual(["1", "2", "3"]);
});
