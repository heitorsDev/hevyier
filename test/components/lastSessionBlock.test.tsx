import { render } from "@testing-library/react-native";

import { LastSessionBlock } from "@/components/LastSessionBlock";
import type { LoggedSetView } from "@/repos/exerciseHistoryRepo";

test("LastSessionBlock renders nothing when there are no sets", () => {
  const { queryByText } = render(<LastSessionBlock sets={[]} />);
  expect(queryByText("LAST SESSION")).toBeNull();
});

test("LastSessionBlock labels warmups and work sets independently", () => {
  const sets: LoggedSetView[] = [
    { type: "warmup", weightKg: 40, reps: 10 },
    { type: "warmup", weightKg: 60, reps: 8 },
    { type: "work", weightKg: 100, reps: 5 },
    { type: "work", weightKg: 100, reps: 4 },
  ];
  const { getByText } = render(<LastSessionBlock sets={sets} />);

  for (const label of ["W1", "W2", "1", "2"]) getByText(label);
  getByText("40kg × 10");
  getByText("60kg × 8");
  getByText("100kg × 5");
  getByText("100kg × 4");
});

test("LastSessionBlock renders decimal weight as-is", () => {
  const sets: LoggedSetView[] = [{ type: "work", weightKg: 62.5, reps: 6 }];
  const { getByText } = render(<LastSessionBlock sets={sets} />);
  getByText("62.5kg × 6");
});
