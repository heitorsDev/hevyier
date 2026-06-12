import { renderRouter, screen } from "expo-router/testing-library";

// Phase 0 smoke test: the real app/ directory mounts and the Today tab
// (initial route) renders inside the tabs shell.
test("tabs shell renders Today tab with all 5 tab labels", async () => {
  const result = renderRouter("app", { initialUrl: "/" });

  expect(result.getPathname()).toBe("/");
  // 'TODAY' appears in header title, tab label and placeholder body — use *All*.
  expect((await screen.findAllByText("TODAY")).length).toBeGreaterThan(0);
  for (const label of ["HISTORY", "PLANS", "LIBRARY", "STATS"]) {
    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
  }
});
