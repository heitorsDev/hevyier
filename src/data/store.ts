import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

// Everything the app persists lives under one key as one JSON blob.
// The whole dataset is a few hundred KB at most after years of training,
// so there is no reason for a database, migrations, or a query layer.
const KEY = "hevyier:v2";

export type LoggedSet = {
  weightKg: number;
  reps: number;
  loggedAt: number;
};

export type Session = {
  id: string;
  planId: string;
  startedAt: number;
  /** null while the session is in progress. */
  finishedAt: number | null;
  /** Sets keyed by exercise name — the name is the identity, so history
   *  for an exercise follows it across plans without any join. */
  sets: Record<string, LoggedSet[]>;
};

type Db = { sessions: Session[] };

const EMPTY: Db = { sessions: [] };

let db: Db = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  // Fire and forget: the in-memory copy is the source of truth for the
  // session, and a dropped write only costs the last set on a hard kill.
  AsyncStorage.setItem(KEY, JSON.stringify(db)).catch(() => {});
}

function commit(next: Db) {
  db = next;
  emit();
  persist();
}

export async function hydrate() {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Db;
      // An unfinished session with nothing logged is an abandoned start —
      // dropping it on load keeps a stale "EM ANDAMENTO" card off the home
      // screen after the app is killed mid-navigation.
      db = {
        sessions: stored.sessions.filter((s) => s.finishedAt !== null || totalSets(s) > 0),
      };
    }
  } catch {
    db = EMPTY;
  }
  hydrated = true;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDb(): Db {
  return useSyncExternalStore(
    subscribe,
    () => db,
    () => db,
  );
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => hydrated,
  );
}

// --- reads -------------------------------------------------------------

export function activeSession(current: Db): Session | undefined {
  return current.sessions.find((s) => s.finishedAt === null);
}

export function sessionById(current: Db, id: string): Session | undefined {
  return current.sessions.find((s) => s.id === id);
}

/** Sets logged for `exercise` in the most recent finished session that
 *  contains it — the reference line shown above the input row. */
export function lastSetsFor(current: Db, exercise: string, excludeId?: string): LoggedSet[] {
  for (const session of [...current.sessions].sort((a, b) => b.startedAt - a.startedAt)) {
    if (session.id === excludeId) continue;
    const sets = session.sets[exercise];
    if (sets?.length) return sets;
  }
  return [];
}

export function finishedSessions(current: Db): Session[] {
  return current.sessions
    .filter((s) => s.finishedAt !== null)
    .sort((a, b) => b.startedAt - a.startedAt);
}

export function totalSets(session: Session): number {
  return Object.values(session.sets).reduce((n, sets) => n + sets.length, 0);
}

export function totalVolume(session: Session): number {
  return Object.values(session.sets)
    .flat()
    .reduce((kg, set) => kg + set.weightKg * set.reps, 0);
}

// --- writes ------------------------------------------------------------

export function startSession(planId: string, now: number): Session {
  const session: Session = {
    id: String(now),
    planId,
    startedAt: now,
    finishedAt: null,
    sets: {},
  };
  commit({ sessions: [session, ...db.sessions] });
  return session;
}

export function addSet(sessionId: string, exercise: string, set: LoggedSet) {
  commit({
    sessions: db.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, sets: { ...s.sets, [exercise]: [...(s.sets[exercise] ?? []), set] } }
        : s,
    ),
  });
}

export function removeSet(sessionId: string, exercise: string, index: number) {
  commit({
    sessions: db.sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            sets: {
              ...s.sets,
              [exercise]: (s.sets[exercise] ?? []).filter((_, i) => i !== index),
            },
          }
        : s,
    ),
  });
}

export function finishSession(sessionId: string, now: number) {
  commit({
    sessions: db.sessions
      // An abandoned session with nothing logged is noise, not history.
      .filter((s) => s.id !== sessionId || totalSets(s) > 0)
      .map((s) => (s.id === sessionId ? { ...s, finishedAt: now } : s)),
  });
}

export function deleteSession(sessionId: string) {
  commit({ sessions: db.sessions.filter((s) => s.id !== sessionId) });
}
