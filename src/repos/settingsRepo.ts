import { eq } from "drizzle-orm";

import type { DB } from "@/db/client";
import { settings } from "@/db/schema";

// The only place setting keys appear as strings — call sites go through
// the typed accessors below.
const SETTING_KEYS = {
  seeded: "seeded",
  warmupSetCount: "global_warmup_sets",
  workSetCount: "global_work_sets",
  warmupRestSeconds: "rest_timer_warmup_seconds",
  workRestSeconds: "rest_timer_work_seconds",
} as const;

export type SettingSetType = "warmup" | "work";

function readSettingValue(db: DB, key: string): string | undefined {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value;
}

function writeSettingValue(db: DB, key: string, value: string): void {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

function readIntSetting(db: DB, key: string): number {
  const raw = readSettingValue(db, key);
  const parsed = Number(raw);
  if (raw === undefined || !Number.isInteger(parsed)) {
    throw new Error(
      `setting "${key}" is ${JSON.stringify(raw)}, expected an integer string like "150"`,
    );
  }
  return parsed;
}

/**
 * Rest-timer duration after checking off a set of the given type.
 *
 * Example: getRestTimerSeconds(db, "work") → 150
 */
export function getRestTimerSeconds(db: DB, type: SettingSetType): number {
  const key =
    type === "warmup"
      ? SETTING_KEYS.warmupRestSeconds
      : SETTING_KEYS.workRestSeconds;
  return readIntSetting(db, key);
}

export function setRestTimerSeconds(
  db: DB,
  type: SettingSetType,
  seconds: number,
): void {
  const key =
    type === "warmup"
      ? SETTING_KEYS.warmupRestSeconds
      : SETTING_KEYS.workRestSeconds;
  writeSettingValue(db, key, String(seconds));
}

/**
 * Default set count pre-filled when adding an exercise to a plan.
 *
 * Example: getGlobalSetCount(db, "warmup") → 2
 */
export function getGlobalSetCount(db: DB, type: SettingSetType): number {
  const key =
    type === "warmup" ? SETTING_KEYS.warmupSetCount : SETTING_KEYS.workSetCount;
  return readIntSetting(db, key);
}

export function setGlobalSetCount(
  db: DB,
  type: SettingSetType,
  count: number,
): void {
  const key =
    type === "warmup" ? SETTING_KEYS.warmupSetCount : SETTING_KEYS.workSetCount;
  writeSettingValue(db, key, String(count));
}

export function isSeeded(db: DB): boolean {
  return readSettingValue(db, SETTING_KEYS.seeded) === "1";
}

export function markSeeded(db: DB): void {
  writeSettingValue(db, SETTING_KEYS.seeded, "1");
}
