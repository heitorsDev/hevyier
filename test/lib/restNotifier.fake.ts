import type { RestNotifier } from "@/lib/restNotifier";

/**
 * In-memory RestNotifier recording every call so tests can assert
 * scheduling/cancellation without touching expo-notifications.
 *
 * Usage:
 *   const notifier = new FakeRestNotifier();
 *   await notifier.scheduleRestOver(Date.now() + 1000, "Bench"); // → "notif-1"
 */
export class FakeRestNotifier implements RestNotifier {
  permissionRequested = false;
  scheduled: { endsAt: number; exerciseName: string }[] = [];
  cancelled: string[] = [];
  private nextId = 1;

  async requestPermission(): Promise<boolean> {
    this.permissionRequested = true;
    return true;
  }

  async scheduleRestOver(
    endsAt: number,
    exerciseName: string,
  ): Promise<string | null> {
    this.scheduled.push({ endsAt, exerciseName });
    return `notif-${this.nextId++}`;
  }

  async cancel(id: string): Promise<void> {
    this.cancelled.push(id);
  }
}
