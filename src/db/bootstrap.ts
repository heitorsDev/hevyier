import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";

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
  const [seeded, setSeeded] = useState<boolean>(false);
  useEffect(() => {
    if (!success) return;
    seedDatabase(appDb);
    setSeeded(true);
  }, [success]);
  if (error) {
    throw new Error(
      `database migration failed: ${error.message}; expected bundled migrations in src/db/migrations to apply cleanly`,
    );
  }
  return seeded;
}
