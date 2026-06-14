import { renderRouter, screen } from "expo-router/testing-library";

// The root layout boots the real database (expo-sqlite native module),
// which doesn't exist under jest — stub the bootstrap hook. Repo tests
// exercise the actual schema via better-sqlite3 instead.
jest.mock("@/db/bootstrap", () => ({
  useWebRuntimeWarm: (): boolean => true,
  useDatabaseReady: (): boolean => true,
  appDb: {},
}));

// The Today tab queries repos on mount; this smoke test only cares that
// the shell + tabs render, so stub the reads to an empty/rest-day state.
jest.mock("@/repos/sessionsRepo", () => ({
  findActiveSession: () => undefined,
  findLastFinishedSession: () => undefined,
  startSession: () => 1,
  startSessionFromPlan: () => 1,
  summarizeSession: () => ({ totalSets: 0, workVolumeKg: 0 }),
}));
jest.mock("@/repos/scheduleRepo", () => ({
  getPlanIdForDay: () => null,
  listWeekSchedule: () => [],
}));
jest.mock("@/repos/plansRepo", () => ({
  listPlans: () => [],
  listPlanExercises: () => [],
  getPlan: () => undefined,
}));

// Phase 0 smoke test: the real app/ directory mounts and the Today tab
// (initial route) renders inside the tabs shell.
test("tabs shell renders Today tab with all 5 tab labels", async () => {
  const result = renderRouter("app", { initialUrl: "/" });

  expect(result.getPathname()).toBe("/");
  // Tab bar uses icons only (tabBarShowLabel: false); labels live in
  // accessibilityLabel ("TODAY, tab, 1 of 5") rather than visible text.
  expect(await screen.findByLabelText("TODAY, tab, 1 of 5")).toBeTruthy();
  for (const [label, n] of [["HISTORY", 2], ["PLANS", 3], ["LIBRARY", 4], ["STATS", 5]] as const) {
    expect(screen.getByLabelText(`${label}, tab, ${n} of 5`)).toBeTruthy();
  }
});
