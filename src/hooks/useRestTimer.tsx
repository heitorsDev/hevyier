import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { appDb } from "@/db/bootstrap";
import type { DB } from "@/db/client";
import { expoRestNotifier, type RestNotifier } from "@/lib/restNotifier";
import { getRestTimerSeconds } from "@/repos/settingsRepo";

export type RestSetType = "warmup" | "work";

export interface RestState {
  endsAt: number;
  setType: RestSetType;
  exerciseName: string;
}

export interface RestTimerController {
  state: RestState | null;
  // `onCommit` is called when the timer ends or is dismissed, committing the
  // set to DB. If omitted (History edit mode), start is a no-op.
  start: (setType: RestSetType, exerciseName: string, onCommit?: () => void) => void;
  dismiss: () => void;
}

const RestTimerContext = createContext<RestTimerController | null>(null);

/**
 * Access the shared rest timer. Must be called under <RestTimerProvider>.
 *
 * Usage: `const { start } = useRestTimer(); start("work", "Bench", commit);`
 */
export function useRestTimer(): RestTimerController {
  const controller = useContext(RestTimerContext);
  if (!controller) {
    throw new Error(
      "useRestTimer() called outside <RestTimerProvider>; mount RestTimerProvider above this component",
    );
  }
  return controller;
}

export function RestTimerProvider(props: {
  children: React.ReactNode;
  notifier?: RestNotifier;
  db?: DB;
}): React.JSX.Element {
  const notifier = props.notifier ?? expoRestNotifier;
  const db = props.db ?? appDb;
  const [state, setState] = useState<RestState | null>(null);
  const pendingId = useRef<string | null>(null);
  // Incremented on every start() / dismiss() so an in-flight scheduleRestOver
  // that resolves after dismiss() still gets cancelled (race: ID arrives after
  // cancelPending was called with pendingId still null).
  const activeNonce = useRef(0);
  const permissionAsked = useRef(false);
  // The deferred set-commit from the most recent start() call.
  const onCommitRef = useRef<(() => void) | null>(null);

  // Logging a set must never throw because of notification I/O — every
  // async call is fire-and-forget with swallowed errors.
  const cancelPending = useCallback((): void => {
    const id = pendingId.current;
    if (!id) return;
    pendingId.current = null;
    notifier.cancel(id).catch(() => {});
  }, [notifier]);

  const ensurePermission = useCallback((): void => {
    if (permissionAsked.current) return;
    permissionAsked.current = true;
    notifier.requestPermission().catch(() => {});
  }, [notifier]);

  // Stable identities so consumers can list start/dismiss in effect deps
  // without re-firing on every render (an unstable start in a mount
  // effect loops setState forever).
  const start = useCallback(
    (setType: RestSetType, exerciseName: string, onCommit?: () => void): void => {
      const seconds = getRestTimerSeconds(db, setType);

      // If a previous set is still pending, commit it now before we move on.
      const prevCommit = onCommitRef.current;
      if (prevCommit) {
        onCommitRef.current = null;
        prevCommit();
      }

      // 0-second timer = "no rest" — commit immediately, no banner.
      if (seconds === 0) {
        onCommit?.();
        return;
      }

      onCommitRef.current = onCommit ?? null;

      const nonce = ++activeNonce.current;
      const endsAt = Date.now() + seconds * 1000;
      cancelPending();
      ensurePermission();
      notifier
        .scheduleRestOver(endsAt, exerciseName)
        .then((id) => {
          if (activeNonce.current === nonce) {
            pendingId.current = id;
          } else if (id) {
            // dismiss() or a newer start() fired before this resolved — cancel immediately.
            notifier.cancel(id).catch(() => {});
          }
        })
        .catch(() => {});
      setState({ endsAt, setType, exerciseName });
    },
    [db, notifier, cancelPending, ensurePermission],
  );

  const dismiss = useCallback((): void => {
    activeNonce.current++;
    cancelPending();
    const commit = onCommitRef.current;
    onCommitRef.current = null;
    commit?.();
    setState(null);
  }, [cancelPending]);

  const controller = useMemo(
    () => ({ state, start, dismiss }),
    [state, start, dismiss],
  );
  return (
    <RestTimerContext.Provider value={controller}>
      {props.children}
    </RestTimerContext.Provider>
  );
}
