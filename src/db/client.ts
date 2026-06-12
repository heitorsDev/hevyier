import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

// Shared alias every repo accepts: both expo-sqlite (app) and
// better-sqlite3 (jest) produce a synchronous BaseSQLiteDatabase, so
// repos stay driver-agnostic. Transactions qualify too —
// SQLiteTransaction extends BaseSQLiteDatabase.
export type DB = BaseSQLiteDatabase<"sync", unknown>;

export function openAppDatabase(): ExpoSQLiteDatabase {
  const client: SQLiteDatabase = openDatabaseSync("hevyier.db");
  // SQLite leaves FK enforcement off per-connection by default; the
  // schema relies on CASCADE / RESTRICT / SET NULL actions.
  client.execSync("PRAGMA foreign_keys = ON");
  return drizzle(client);
}
