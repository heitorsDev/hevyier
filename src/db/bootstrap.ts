import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import { openAppDatabase } from "@/db/client";
import migrations from "@/db/migrations/migrations";
import { seedDatabase } from "@/db/seed";

// Single app-wide connection: expo-sqlite is synchronous and the app is
// single-user/local-only, so one connection suffices. Screens receive
// this and pass it into repos (repos never import it themselves).
export const appDb: ExpoSQLiteDatabase = openAppDatabase();

/**
 * Runs bundled migrations then the one-time seed; true once both are
 * done. The root layout renders nothing until then (local DB = instant,
 * no spinner per PRODUCT.md).
 *
 * Example: if (!useDatabaseReady()) return null;
 */
export function useDatabaseReady(): boolean {
  const { success, error } = useMigrations(appDb, migrations);
  if (error) {
    throw new Error(
      `database migration failed: ${error.message}; expected bundled migrations in src/db/migrations to apply cleanly`,
    );
  }
  if (!success) return false;
  runSeedOnce();
  return true;
}

// Seeding happens during the first migrated render, not in an effect:
// it is synchronous and idempotent (settings.seeded guard), and it must
// finish before any child screen queries the DB. The module flag only
// skips redundant guard checks on re-renders.
let seedHasRun = false;
function runSeedOnce(): void {
  if (seedHasRun) return;
  seedDatabase(appDb);
  seedHasRun = true;
}
