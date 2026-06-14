import { act, render, renderHook, screen } from "@testing-library/react-native";
import React from "react";

import { RestTimerBanner } from "@/components/RestTimerBanner";
import type { DB } from "@/db/client";
import {
  RestTimerProvider,
  useRestTimer,
  type RestTimerController,
} from "@/hooks/useRestTimer";
import type { RestNotifier } from "@/lib/restNotifier";
import { setRestTimerSeconds } from "@/repos/settingsRepo";

import { FakeRestNotifier } from "./lib/restNotifier.fake";
import { openInMemoryDb, type InMemoryDb } from "./helpers/inMemoryDb";

// Importing useRestTimer pulls in @/db/bootstrap, which opens the native
// expo-sqlite DB at module load — absent under jest. Tests inject their
// own in-memory db, so the real appDb is never exercised; stub it to a
// bare object just to satisfy the import. (jest.mock is hoisted above
// the imports above regardless of where it is written.)
jest.mock("@/db/bootstrap", () => ({ appDb: {} }));

let fixture: InMemoryDb;
let notifier: FakeRestNotifier;

beforeEach(() => {
  fixture = openInMemoryDb();
  setRestTimerSeconds(fixture.db, "work", 150);
  setRestTimerSeconds(fixture.db, "warmup", 60);
  notifier = new FakeRestNotifier();
});
afterEach(() => fixture.close());

function wrapperFor(db: DB) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <RestTimerProvider notifier={notifier} db={db}>
        {children}
      </RestTimerProvider>
    );
  };
}

function renderController() {
  return renderHook(() => useRestTimer(), { wrapper: wrapperFor(fixture.db) });
}

test("start sets endsAt in the future and schedules a notification", async () => {
  const { result } = renderController();
  const before = Date.now();

  await act(async () => result.current.start("work", "Bench"));

  const state = result.current.state as NonNullable<RestTimerController["state"]>;
  expect(state.exerciseName).toBe("Bench");
  expect(state.endsAt).toBeGreaterThan(before);
  // work rest = 150s, so endsAt is roughly 150_000ms ahead.
  expect(state.endsAt - before).toBeGreaterThanOrEqual(150_000);
  expect(notifier.scheduled).toHaveLength(1);
  expect(notifier.scheduled[0].exerciseName).toBe("Bench");
  expect(notifier.permissionRequested).toBe(true);
});

test("a second start cancels the first scheduled notification", async () => {
  const { result } = renderController();

  await act(async () => result.current.start("work", "Bench"));
  await act(async () => result.current.start("warmup", "Squat"));

  expect(notifier.scheduled).toHaveLength(2);
  expect(notifier.cancelled).toContain("notif-1");
});

test("dismiss clears state and cancels the pending notification", async () => {
  const { result } = renderController();

  await act(async () => result.current.start("work", "Bench"));
  await act(async () => result.current.dismiss());

  expect(result.current.state).toBeNull();
  expect(notifier.cancelled).toContain("notif-1");
});

test("dismiss cancels a notification that resolves after dismiss is called", async () => {
  // Race: scheduleRestOver resolves AFTER dismiss() runs, so cancelPending()
  // had no ID yet — the nonce mechanism must still cancel it.
  const cancelled: string[] = [];
  let resolveSchedule!: () => void;
  const racyNotifier: RestNotifier = {
    requestPermission: async () => true,
    scheduleRestOver: async (_endsAt: number, _name: string) =>
      new Promise<string | null>((resolve) => {
        resolveSchedule = () => resolve("notif-race");
      }),
    cancel: async (id: string) => {
      cancelled.push(id);
    },
  };

  const { result } = renderHook(() => useRestTimer(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <RestTimerProvider notifier={racyNotifier} db={fixture.db}>
        {children}
      </RestTimerProvider>
    ),
  });

  // Start without awaiting schedule resolution
  act(() => {
    result.current.start("work", "Bench");
  });

  // Dismiss before the notification ID arrives
  act(() => {
    result.current.dismiss();
  });
  expect(result.current.state).toBeNull();

  // Let the deferred schedule resolve — should be cancelled immediately
  await act(async () => {
    resolveSchedule();
  });

  expect(cancelled).toContain("notif-race");
});

test("useRestTimer throws when used outside a provider", () => {
  expect(() => renderHook(() => useRestTimer())).toThrow(/RestTimerProvider/);
});

test("RestTimerBanner renders null with no active timer", () => {
  render(
    <RestTimerProvider notifier={notifier} db={fixture.db}>
      <RestTimerBanner />
    </RestTimerProvider>,
  );

  expect(screen.queryByLabelText("DISMISS")).toBeNull();
});

test("RestTimerBanner shows a countdown while a timer is active", async () => {
  function Harness() {
    const { start } = useRestTimer();
    React.useEffect(() => start("work", "Bench"), [start]);
    return <RestTimerBanner />;
  }
  render(
    <RestTimerProvider notifier={notifier} db={fixture.db}>
      <Harness />
    </RestTimerProvider>,
  );

  expect(await screen.findByLabelText("DISMISS")).toBeTruthy();
  expect(screen.getByText(/^\d+:\d{2}$/)).toBeTruthy();
});

test("onCommit is called when the timer is dismissed", async () => {
  const { result } = renderController();
  const commit = jest.fn();

  await act(async () => result.current.start("work", "Bench", commit));
  expect(commit).not.toHaveBeenCalled();

  await act(async () => result.current.dismiss());
  expect(commit).toHaveBeenCalledTimes(1);
});

test("starting a new timer commits the previous pending set", async () => {
  const { result } = renderController();
  const commit1 = jest.fn();
  const commit2 = jest.fn();

  await act(async () => result.current.start("work", "Bench", commit1));
  expect(commit1).not.toHaveBeenCalled();

  await act(async () => result.current.start("warmup", "Squat", commit2));
  // Previous set committed when new timer starts.
  expect(commit1).toHaveBeenCalledTimes(1);
  expect(commit2).not.toHaveBeenCalled();
});

test("0-second timer commits immediately without showing a timer", async () => {
  setRestTimerSeconds(fixture.db, "work", 0);
  const { result } = renderController();
  const commit = jest.fn();

  await act(async () => result.current.start("work", "Bench", commit));

  expect(commit).toHaveBeenCalledTimes(1);
  expect(result.current.state).toBeNull();
});
