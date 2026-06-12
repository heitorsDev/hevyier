import { render } from "@testing-library/react-native";

import { NudgeBanner } from "@/components/NudgeBanner";

test("NudgeBanner renders the exact overload copy", () => {
  const { getByText } = render(<NudgeBanner />);
  getByText("Same as last 2 sessions — consider adding weight.");
});
