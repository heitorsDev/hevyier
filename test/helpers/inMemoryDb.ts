import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

import type { DB } from "@/db/client";

export interface InMemoryDb {
  db: DB;
  close: () => void;
}

/**
 * Fresh in-memory SQLite migrated with the app's real bundled
 * migrations — repo tests run against the exact production schema.
 *
 * Example:
 *   const { db, close } = openInMemoryDb();
 *   afterEach(close);
 */
export function openInMemoryDb(): InMemoryDb {
  const client = new Database(":memory:");
  // Mirror src/db/client.ts: FK actions (CASCADE/RESTRICT/SET NULL) are
  // inert until this pragma is on for the connection.
  client.pragma("foreign_keys = ON");
  const db = drizzle(client);
  migrate(db, {
    migrationsFolder: path.join(__dirname, "..", "..", "src", "db", "migrations"),
  });
  return { db, close: () => client.close() };
}
