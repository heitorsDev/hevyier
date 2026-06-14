import { fireEvent, render } from "@testing-library/react-native";

import { PlanPickerList, type PlanMeta } from "@/components/PlanPickerList";

const makePlan = (id: number, name: string) => ({ id, name });

const makeMeta = (id: number, name: string, count = 3): PlanMeta => ({
  plan: makePlan(id, name),
  exerciseCount: count,
});

const baseView = {
  planMetas: [] as PlanMeta[],
  todayPlanId: null as number | null,
  hasAnySchedule: false,
};

test("renders empty state when no plans", () => {
  const { getByText } = render(
    <PlanPickerList view={baseView} onPickPlan={jest.fn()} onEmptySession={jest.fn()} />,
  );
  expect(getByText("NO PLANS YET.")).toBeTruthy();
  expect(getByText("CREATE ONE IN THE PLANS TAB.")).toBeTruthy();
});

test("renders plan rows for each plan", () => {
  const view = {
    ...baseView,
    planMetas: [makeMeta(1, "Push Day"), makeMeta(2, "Pull Day")],
    hasAnySchedule: true,
  };
  const { getByText } = render(
    <PlanPickerList view={view} onPickPlan={jest.fn()} onEmptySession={jest.fn()} />,
  );
  expect(getByText("PUSH DAY")).toBeTruthy();
  expect(getByText("PULL DAY")).toBeTruthy();
});

test("highlights today plan with TODAY label", () => {
  const view = {
    ...baseView,
    planMetas: [makeMeta(1, "Push Day"), makeMeta(2, "Pull Day")],
    todayPlanId: 1,
    hasAnySchedule: true,
  };
  const { getByText, queryByText } = render(
    <PlanPickerList view={view} onPickPlan={jest.fn()} onEmptySession={jest.fn()} />,
  );
  expect(getByText("PUSH DAY — TODAY")).toBeTruthy();
  // Pull Day has no TODAY suffix
  expect(queryByText("PULL DAY — TODAY")).toBeNull();
});

test("calls onPickPlan with plan id when row pressed", () => {
  const onPickPlan = jest.fn();
  const view = {
    ...baseView,
    planMetas: [makeMeta(42, "Leg Day")],
    hasAnySchedule: true,
  };
  const { getByText } = render(
    <PlanPickerList view={view} onPickPlan={onPickPlan} onEmptySession={jest.fn()} />,
  );
  fireEvent.press(getByText("LEG DAY"));
  expect(onPickPlan).toHaveBeenCalledWith(42);
});

test("renders EMPTY SESSION row and calls onEmptySession on press", () => {
  const onEmptySession = jest.fn();
  const view = {
    ...baseView,
    planMetas: [makeMeta(1, "Push Day")],
    hasAnySchedule: true,
  };
  const { getByText } = render(
    <PlanPickerList view={view} onPickPlan={jest.fn()} onEmptySession={onEmptySession} />,
  );
  const emptyRow = getByText("EMPTY SESSION");
  expect(emptyRow).toBeTruthy();
  fireEvent.press(emptyRow);
  expect(onEmptySession).toHaveBeenCalled();
});
