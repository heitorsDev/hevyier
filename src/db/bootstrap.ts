import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { loadChartEngineWeb } from "@/charts/skiaWeb";
import { openAppDatabase, warmUpWebDatabase } from "@/db/client";
import migrations from "@/db/migrations/migrations";
import { seedDatabase } from "@/db/seed";

// Single app-wide connection: expo-sqlite is synchronous and the app is
// single-user/local-only, so one connection suffices. Screens receive
// this and pass it into repos (repos never import it themselves).
//
// Opened lazily (live binding, not at import) because web must warm the
// sqlite worker first — see useWebDatabaseWarm + warmUpWebDatabase. On
// native the open is instant, so it happens on the first readiness render.
// Consumers only touch appDb from render code gated behind useDatabaseReady,
// by which point it is assigned.
export let appDb: ExpoSQLiteDatabase = undefined as unknown as ExpoSQLiteDatabase;

function ensureAppDbOpen(): void {
  if (!appDb) appDb = openAppDatabase();
}

/**
 * Web: true once the native-backed engines are ready — the sqlite worker
 * (wasm + OPFS, so the synchronous open in ensureAppDbOpen won't time out)
 * and CanvasKit (so victory-native charts can render). Native: true
 * immediately — both are real native modules there. Gate the app tree on
 * this BEFORE useDatabaseReady, so nothing runs cold on web.
 *
 * Example: if (!useWebRuntimeWarm()) return null;
 */
export function useWebRuntimeWarm(): boolean {
  const [warm, setWarm] = useState(Platform.OS !== "web");
  useEffect(() => {
    if (warm) return;
    let cancelled = false;
    Promise.all([warmUpWebDatabase(), loadChartEngineWeb()])
      .then(() => {
        if (!cancelled) setWarm(true);
      })
      .catch((err) => {
        console.error("web runtime warm-up failed:", err);
        if (!cancelled) setWarm(true);
      });
    return () => {
      cancelled = true;
    };
  }, [warm]);
  return warm;
}

/**
 * Runs bundled migrations then the one-time seed; true once both are
 * done. The root layout renders nothing until then (local DB = instant,
 * no spinner per PRODUCT.md). Must be mounted only after useWebDatabaseWarm
 * is true so the synchronous open below is safe on web.
 *
 * Example: if (!useDatabaseReady()) return null;
 */
export function useDatabaseReady(): boolean {
  ensureAppDbOpen();
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
