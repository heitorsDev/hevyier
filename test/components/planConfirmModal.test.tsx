import { fireEvent, render } from "@testing-library/react-native";

import { PlanConfirmModal, type ConfirmModal } from "@/components/PlanConfirmModal";

const modal: ConfirmModal = {
  planId: 1,
  planName: "Push Day",
  exerciseNames: ["Bench Press", "Overhead Press", "Tricep Dip"],
};

test("renders nothing when modal is null", () => {
  const { queryByText } = render(
    <PlanConfirmModal modal={null} onStart={jest.fn()} onClose={jest.fn()} />,
  );
  expect(queryByText("START")).toBeNull();
  expect(queryByText("CANCEL")).toBeNull();
});

test("shows plan name and exercise names when modal provided", () => {
  const { getByText } = render(
    <PlanConfirmModal modal={modal} onStart={jest.fn()} onClose={jest.fn()} />,
  );
  expect(getByText("PUSH DAY")).toBeTruthy();
  expect(getByText("BENCH PRESS")).toBeTruthy();
  expect(getByText("OVERHEAD PRESS")).toBeTruthy();
  expect(getByText("TRICEP DIP")).toBeTruthy();
});

test("calls onStart when START pressed", () => {
  const onStart = jest.fn();
  const { getByText } = render(
    <PlanConfirmModal modal={modal} onStart={onStart} onClose={jest.fn()} />,
  );
  fireEvent.press(getByText("START"));
  expect(onStart).toHaveBeenCalled();
});

test("calls onClose when CANCEL pressed", () => {
  const onClose = jest.fn();
  const { getByText } = render(
    <PlanConfirmModal modal={modal} onStart={jest.fn()} onClose={onClose} />,
  );
  fireEvent.press(getByText("CANCEL"));
  expect(onClose).toHaveBeenCalled();
});
