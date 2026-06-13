import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { openDatabaseAsync, openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

const DB_NAME = "hevyier.db";

// Shared alias every repo accepts: both expo-sqlite (app) and
// better-sqlite3 (jest) produce a synchronous BaseSQLiteDatabase, so
// repos stay driver-agnostic. Transactions qualify too —
// SQLiteTransaction extends BaseSQLiteDatabase.
export type DB = BaseSQLiteDatabase<"sync", unknown>;

export function openAppDatabase(): ExpoSQLiteDatabase {
  const client: SQLiteDatabase = openDatabaseSync(DB_NAME);
  // SQLite leaves FK enforcement off per-connection by default; the
  // schema relies on CASCADE / RESTRICT / SET NULL actions.
  client.execSync("PRAGMA foreign_keys = ON");
  return drizzle(client);
}

/**
 * Web only: force the expo-sqlite web worker to load, compile its ~600KB
 * wasm module, and initialize the OPFS storage backend BEFORE the first
 * synchronous open. expo-sqlite's sync API busy-spins ~1M iterations
 * waiting for the worker (see node_modules/expo-sqlite/web/WorkerChannel.ts)
 * — far too short for a cold worker — so openDatabaseSync() throws
 * "Sync operation timeout" unless the shared worker is already warm. The
 * async open warms it; closing releases the OPFS access-handle lock so the
 * sync open can re-acquire it. No-op on native (sync open is instant there).
 *
 * Usage: `await warmUpWebDatabase();` once, before `openAppDatabase()`.
 */
export async function warmUpWebDatabase(): Promise<void> {
  if (Platform.OS !== "web") return;
  const warm = await openDatabaseAsync(DB_NAME);
  await warm.closeAsync();
}
