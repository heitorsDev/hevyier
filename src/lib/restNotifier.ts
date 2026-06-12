import * as Notifications from "expo-notifications";

// Project-owned seam over expo-notifications so the rest-timer hook
// depends on this interface, never the SDK directly — tests inject a fake.
export interface RestNotifier {
  requestPermission(): Promise<boolean>;
  scheduleRestOver(endsAt: number, exerciseName: string): Promise<string | null>;
  cancel(id: string): Promise<void>;
}

const REST_CHANNEL_ID = "rest-timer";

// Foreground rest-over alerts are covered by the in-app banner
// (decision #6), so suppress the system banner/list while the app is
// open — no sound either, to avoid duplicate noise.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureRestChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(REST_CHANNEL_ID, {
    name: "Rest timer",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    enableVibrate: true,
  });
}

async function requestPermission(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

async function scheduleRestOver(
  endsAt: number,
  exerciseName: string,
): Promise<string | null> {
  await ensureRestChannel();
  const id = await Notifications.scheduleNotificationAsync({
    content: { title: "REST OVER", body: `next set: ${exerciseName}` },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(endsAt),
      channelId: REST_CHANNEL_ID,
    },
  });
  return id ?? null;
}

async function cancel(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Concrete RestNotifier backed by expo-notifications.
 *
 * Usage: `await expoRestNotifier.scheduleRestOver(Date.now() + 90000, "Bench")`
 */
export const expoRestNotifier: RestNotifier = {
  requestPermission,
  scheduleRestOver,
  cancel,
};
