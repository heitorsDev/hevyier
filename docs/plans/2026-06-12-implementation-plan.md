# hevyier — Implementation Plan
_Date: 2026-06-12 · Implements: [2026-06-01-hevyier-design.md](./2026-06-01-hevyier-design.md)_

## Progress (as of 2026-06-13, branch `feat/exercises-plans-ui`, app version `1.1.0`)

| Phase | Status | Evidence |
|---|---|---|
| 0 — Bootstrap | ✅ Done | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `src/theme/tokens.ts`, `test/tabs-shell.test.tsx` |
| 1 — Data layer | ✅ Done | `src/db/{schema,client,seed,seedExercises}.ts`, `src/db/migrations/`, all `src/repos/*`, repo + seed tests |
| 2 — Exercises tab | ✅ Done | `app/(tabs)/exercises.tsx`, `app/exercise/[id].tsx`, `MuscleSelector`, `domain/exerciseForm.ts` (commit `17299a4`) |
| 3 — Plans, schedule, settings | ✅ Done | `app/(tabs)/plans.tsx`, `app/plan/[id].tsx`, `app/settings.tsx`, `domain/planReorder.ts` (commit `6d817fe`) |
| 4 — Session core | ✅ Done | `app/session/[id]/{index,log/[sessionExerciseId]}.tsx`, `app/(tabs)/index.tsx`, `SetRow`/`PlatePad`/`RepStepper`/`SetSection`, `domain/setRows.ts` (commits `e85c6aa`,`30c566d`,`01452c9`,`711b2ef`) |
| 5 — Rest timer, last-session, nudge | ✅ Done | `hooks/useRestTimer.tsx`, `lib/restNotifier.ts`, `RestTimerBanner`/`LastSessionBlock`/`NudgeBanner`, `domain/overloadNudge.ts`, `repos/exerciseHistoryRepo.ts` (commits `6bf25b5`,`1e64a4d`,`5855f1d`) |
| 6 — History | ✅ Done | `app/(tabs)/history.tsx`, `app/history/[id].tsx`, `domain/{historyList,historyDetail}.ts`, `repos/historyRepo.ts`, `History*` components (branch `feat/history`, merged) |
| 7 — Analytics | ✅ Done | `app/(tabs)/analytics.tsx`, `src/charts/{TrendLine,WeeklyBars,Heatmap}.tsx`, `src/domain/analytics/*`, `repos/analyticsRepo.ts`, `ExerciseAnalytics`/`MuscleVolumeBars`/`PrBadgeRow`/`ExercisePicker`/`AnalyticsSection` (branch `feat/analytics`, merged) |
| 8 — Distribution | 🚧 Blocked | deps installed + Android `package` set; no `eas.json`, no `runtimeVersion`/update URL. **Needs interactive `eas init`/`eas login` + physical device — cannot run headless.** |

Next up: Phase 8 (Distribution) — requires your EAS account auth (run `eas login` / `eas init` yourself), then APK build + on-device smoke checklist.

Phases 6 + 7 were built in parallel git worktrees (`feat/history`, `feat/analytics`) off `ac71ef5`, disjoint file sets, merged no-conflict. Combined verify: `npx tsc --noEmit` clean, `npm test` = 35 suites / 162 tests green. Caveat: chart wrappers (`src/charts/*`) render via victory-native + Skia (native-only) so they are mocked under jest — on-device chart render is an unverified manual smoke-check (Phase 8 territory).

## Decision Log (resolved 2026-06-12 interview)

| # | Topic | Decision |
|---|---|---|
| 1 | Platform | Android only. Local Gradle release APK for install — no EAS, no cloud, offline (revised 2026-06-13). No OTA: every change ships by rebuild + reinstall. Debug-key signing by default (solo sideload). |
| 2 | Set rows | Pre-created from plan counts, UI-state only until ✓ (row inserted into `sets` on ✓). "+ add set" button per section (warmup/work). Skipped/blank rows never persisted — vanish at finish. Plan counts never mutated by session deviations. |
| 3 | Session end | Explicit "Finish" button sets `finished_at`. Resume: on launch, `finished_at IS NULL` → Today tab shows "Resume session". "Discard" (menu) deletes session + sets, with confirm (irreversible). No auto-finish timeout. |
| 4 | Freestyle / deviations | Today tab secondary "Start empty session" action. "+ add exercise" (library picker) available in any session. Exercises with zero completed sets pruned from `session_exercises` at finish. |
| 5 | Set undo | ✓ is a toggle. Un-✓ deletes the `sets` row, values remain in controls. Re-✓ re-inserts and always restarts rest timer. No swipe/long-press gestures. |
| 6 | Rest timer | On ✓: store end timestamp, show in-app banner countdown, schedule local notification (expo-notifications) at expiry with vibration. New ✓ or dismiss cancels pending notification. No background ticking — timestamp only. |
| 7 | Last-session lookup | Most recent *finished* session containing ≥1 completed set of the exercise (any plan or freestyle). Overload nudge: ordered equality of work-set `[(weight, reps)]` lists across last 2 such sessions (count must match; warmups ignored). |
| 8 | History | Editable. Reuse Exercise Logging Screen in edit mode (rest timer + nudge disabled). Session delete with confirm. |
| 9 | Seed data | ~40 common exercises seeded at first launch (name, equipment, muscle mappings). Normal editable rows. |
| 10 | Referential integrity | Exercise with logged sets: archive (flag), hidden from pickers, history intact; zero history → hard delete. Plan delete: `sessions.plan_id` and `schedule.plan_id` → `ON DELETE SET NULL`. |
| 11 | Analytics semantics | Volume = work sets only, everywhere. Weeks start Monday. Charts: victory-native (Skia); heatmap = custom grid component. Chart lib wrapped behind thin project-owned interface. |
| 12 | UI direction | Brutalist grid: hard 1px borders, table-like rows, monospace numerals. White-on-black (pure black bg). Shared plate-button block below set list acting on the highlighted "active" set row. 44pt+ touch targets. |
| 13 | Muscle volume attribution | Exercise targeting multiple muscles credits **full** set volume to each targeted (group, sub_muscle) pair. No splitting/weighting. Standard practice, simple to reason about. |

## Stack

- Expo (latest SDK, managed workflow), TypeScript strict
- Expo Router (file-based, bottom tabs + full-screen session modal)
- expo-sqlite + Drizzle ORM, drizzle-kit migrations (bundled, run at startup)
- expo-notifications (rest timer)
- victory-native + @shopify/react-native-skia + react-native-reanimated (charts)
- jest-expo + @testing-library/react-native — test command: `npm test`

## Architecture

```
app/                      # Expo Router routes only (thin — no business logic)
  _layout.tsx             # root stack: (tabs), session modal group, settings
  (tabs)/
    _layout.tsx           # 5 bottom tabs, gear icon → /settings on all headers
    index.tsx             # Today
    history.tsx
    plans.tsx
    exercises.tsx
    analytics.tsx
  session/[id]/
    index.tsx             # Session Screen (exercise list)
    log/[sessionExerciseId].tsx   # Exercise Logging Screen
  exercise/[id].tsx       # exercise create/edit form ('new' = create)
  plan/[id].tsx           # plan editor
  settings.tsx
src/
  db/                     # schema.ts, client.ts, migrations/, seed.ts
  domain/                 # pure TS, zero react-native imports, fully unit-tested
  repos/                  # one repo per aggregate, db client injected as param
  components/             # brutalist primitives (see Phase 0/4)
  charts/                 # thin wrapper over victory-native + custom Heatmap
  theme/                  # tokens.ts
test/
```

Rules from CLAUDE.md apply throughout: functions 4–20 lines, files <500 lines, explicit types (no `any`), repos receive the db client as a parameter (never import a global), domain logic pure and unit-tested, structured logs only for debugging.

---

## Phases

### Phase 0 — Bootstrap ✅

**Goal**: empty but running app with navigation shell, theme, tooling. No features.

1. `git init`; then scaffold Expo app into repo root with `create-expo-app` (TypeScript template), keeping existing `docs/`, `CLAUDE.md`, `PRODUCT.md`.
2. Enable `strict: true` in tsconfig + path alias `@/* → src/*`.
3. Install runtime deps: `expo-sqlite`, `drizzle-orm`, `expo-notifications`, `victory-native`, `@shopify/react-native-skia`, `react-native-reanimated`, `expo-updates`. Dev deps: `drizzle-kit`, `jest-expo`, `@testing-library/react-native`, `babel-plugin-inline-import` (for bundling SQL migrations), eslint + prettier (Expo defaults).
4. `src/theme/tokens.ts`: `colors = { bg: '#000', fg: '#FFF', muted: '#888', disabled: '#444' }` (muted/disabled greys are the only non-pure values — used for LAST SESSION reference + archived items), `border = 1`, monospace font family for all numerals (system `monospace` on Android), type scale (3 sizes max), `touchTarget = 48` (dp; above iOS 44pt minimum). No rounded corners anywhere — `borderRadius` never set.
5. `app/_layout.tsx`: root `<Stack>` with `(tabs)`, `session` group as `presentation: 'fullScreenModal'`, `settings` + `exercise/[id]` + `plan/[id]` as cards. Status bar light-on-black.
6. `app/(tabs)/_layout.tsx`: 5 tabs (Today, History, Plans, Exercises, Analytics), black bar, white labels, gear `headerRight` linking to `/settings` on every tab. Placeholder screens.
7. Jest: `jest-expo` preset, one smoke test rendering tabs layout. `npm test` green.
8. **Done when**: app boots on Android device/emulator showing 5 empty tabs + settings route; `npm test` and `npx tsc --noEmit` pass.

### Phase 1 — Data layer ✅

**Goal**: full schema, migrations at startup, seed data, typed repos. No UI.

1. `src/db/schema.ts` (Drizzle sqlite-core), 9 tables exactly per spec:
   - `settings(key TEXT PK, value TEXT)`
   - `exercises(id, name, equipment, archived INTEGER default 0)` — archived added per decision #10
   - `exercise_muscles(id, exercise_id FK CASCADE, muscle_group TEXT, sub_muscle TEXT)`
   - `workout_plans(id, name)`
   - `plan_exercises(id, plan_id FK CASCADE, exercise_id FK RESTRICT, order, warmup_sets, work_sets)`
   - `schedule(day_of_week INTEGER PK 0–6, plan_id FK SET NULL nullable)` — 0 = Sunday (JS `Date.getDay()` convention; document in code comment)
   - `sessions(id, plan_id FK SET NULL nullable, started_at INTEGER ms, finished_at INTEGER ms nullable)`
   - `session_exercises(id, session_id FK CASCADE, exercise_id FK RESTRICT, order)`
   - `sets(id, session_exercise_id FK CASCADE, type TEXT 'warmup'|'work', weight_kg REAL, reps INTEGER, logged_at INTEGER ms)`
   All timestamps = integer epoch ms. Foreign keys ON; `PRAGMA foreign_keys = ON` at client open.
2. `drizzle.config.ts` + `drizzle-kit generate`; bundle migrations via `babel-plugin-inline-import` and run with Drizzle's `useMigrations` in root layout — render nothing until migrated (local DB = instant; no spinner per PRODUCT.md).
3. `src/domain/muscles.ts`: `MUSCLE_GROUPS` constant — exact map from spec (12 groups; forearms has empty sub-list, treated as single implicit sub-muscle `'forearms'` so the `(group, sub)` pair shape is uniform). Exported types `MuscleGroup`, `SubMuscle`.
4. `src/db/seed.ts`, run once guarded by `settings.seeded = '1'`:
   - Settings defaults: `global_warmup_sets = 2`, `global_work_sets = 3`, `rest_timer_warmup_seconds = 60`, `rest_timer_work_seconds = 150`.
   - 7 schedule rows, all `plan_id = NULL`.
   - ~40 exercises with equipment + muscle mappings: compound barbell (bench/incline bench/squat/front squat/deadlift/RDL/row/OHP), dumbbell (press/incline press/row/curl/hammer curl/lateral raise/rear-delt fly/shrug/RDL), cable (lat pulldown/seated row/triceps pushdown/overhead extension/fly/face pull/curl), machine (leg press/leg extension/leg curl/calf raise/chest press/pec deck/hack squat), bodyweight (pull-up/chin-up/dip/push-up/plank/hanging leg raise).
5. `src/repos/`: `exercisesRepo`, `plansRepo`, `scheduleRepo`, `sessionsRepo`, `setsRepo`, `settingsRepo`. Every function signature takes `db` as first param. `settingsRepo` exposes typed getters/setters (`getRestTimerSeconds(db, 'warmup' | 'work'): number`), never raw string keys at call sites.
6. Tests: repos run against in-memory SQLite in jest (better-sqlite3 driver behind same Drizzle schema); cover CRUD per repo, FK cascade behavior (delete plan → session.plan_id nulled; delete session → sets gone), seed idempotency (running twice inserts once).
7. **Done when**: app boots, DB migrated + seeded on fresh install; all repo tests green.

### Phase 2 — Exercises tab ✅

**Goal**: full exercise library CRUD with muscle targeting.

1. `app/(tabs)/exercises.tsx`: alphabetical list (name + equipment + muscle-group abbreviations in muted grey), search `TextInput` filter at top (keyboard acceptable here — library management happens at home, not mid-set), archived hidden by default, "SHOW ARCHIVED" toggle row at list bottom. Tap row → `/exercise/[id]`. "+ NEW" header action → `/exercise/new`.
2. `app/exercise/[id].tsx` form:
   - Name: text input (required, non-empty).
   - Equipment: single-select chip row — `barbell · dumbbell · cable · machine · bodyweight · other` (chips avoid keyboard; covers seed data).
   - Muscle selector (two-level, per spec): grid of 12 big-group cells; tap toggles selection and expands that group's sub-muscle chip row beneath it; each selected group needs ≥1 sub-muscle. Forearms auto-selects its implicit sub.
   - Validation: ≥1 `(group, sub)` pair total; error text states what's missing (per CLAUDE.md exception-message rule).
   - Save: upsert exercise + delete-and-reinsert its `exercise_muscles` rows in one transaction.
3. Archive/delete (decision #10): footer button. `setsRepo.countForExercise(db, id) > 0` → button reads "ARCHIVE" (toggle, no confirm — reversible); zero history → "DELETE" with confirm. Archived exercises excluded from all pickers (plan editor, add-exercise-to-session) but visible in history/analytics.
4. Tests: form validation logic (pure fn), repo round-trip of muscle pairs, archive-vs-delete branch.
5. **Done when**: can create, edit, archive, delete exercises on device; seeded library browsable + searchable.

### Phase 3 — Plans, schedule, settings ✅

**Goal**: plan CRUD, weekday assignment, global settings.

1. `app/(tabs)/plans.tsx`: plan list (name + exercise count + assigned weekdays as `MON·THU` tags); "+ NEW" creates and routes to editor. Below list: **schedule block** — 7 rows MON→SUN, each showing assigned plan name or `REST`; tap row → plan picker modal (existing plans + `REST` option) writing `schedule.plan_id`.
2. `app/plan/[id].tsx` editor:
   - Name input.
   - Exercise rows in `order`: name + warmup/work count steppers (`−/+`, floor 0) per row. Reorder via `▲▼` buttons per row (brutalist, no drag gesture lib).
   - "+ ADD EXERCISE" → picker (library minus archived minus already-in-plan). On add: `warmup_sets`/`work_sets` pre-filled from `settingsRepo` globals (decision: snapshot at add time, editable after — per spec).
   - Remove exercise from plan: `✕` per row, no confirm (plan edit is reversible; past sessions unaffected since sessions copy into `session_exercises`).
   - Delete plan: footer button, confirm, FK SET NULL handles history + schedule.
3. `app/settings.tsx`: 4 stepper rows — global warmup sets, global work sets (±1), warmup rest timer, work rest timer (±15 s, floor 0, value shown as `m:ss`). Writes through `settingsRepo` immediately (no save button).
4. Tests: reorder logic (pure fn producing new `order` values), schedule repo upsert, settings typed accessors.
5. **Done when**: can build a real plan, assign it to weekdays, tweak defaults.

### Phase 4 — Session core ✅

**Goal**: the product — start/resume/log/finish a workout, zero-keyboard.

1. **Repos**:
   - `sessionsRepo.startFromPlan(db, planId)`: insert session (`started_at = now`) + copy plan's exercises into `session_exercises` preserving order, in one transaction. `startEmpty(db)`: session with `plan_id = NULL`, no exercises.
   - `sessionsRepo.findActive(db)`: `finished_at IS NULL`, newest.
   - `sessionsRepo.finish(db, id)`: transaction — delete `session_exercises` with zero sets (decision #4 prune), set `finished_at = now`.
   - `sessionsRepo.discard(db, id)`: delete session (cascade wipes exercises + sets).
2. **Today tab** (`app/(tabs)/index.tsx`):
   - Header: today's date + weekday.
   - Active session exists → giant `RESUME SESSION` CTA (replaces everything else above the fold).
   - Else: today's schedule entry → plan name + exercise list preview + giant `START SESSION` CTA; rest day → `REST DAY` label.
   - Secondary small action: `START EMPTY SESSION` (always present).
   - Footer block: last finished session summary — date, plan name or `FREESTYLE`, duration, total sets, total work-set volume.
3. **Session Screen** (`app/session/[id]/index.tsx`):
   - Header: plan name (or `FREESTYLE`) + live elapsed time (derived from `started_at`, 1 s interval).
   - One bordered row per `session_exercise`: name + `done/planned` set counts (e.g. `3/5`; planned = warmup+work counts from plan_exercise when plan-based, else count of logged sets). Tap → logging screen.
   - `+ ADD EXERCISE` row → library picker (excludes archived; allows exercises already in session? No — exclude duplicates), appends with next `order`.
   - Footer: `FINISH` (primary; calls `finish`, routes back to Today — no confirm, finishing is the goal) and `DISCARD` behind a `⋯` menu with confirm dialog (only irreversible action, decision #3).
4. **Components** (each own file, <100 lines): `SetRow` (label cell, weight display cell, `RepStepper`, ✓ cell), `PlatePad` (two 5-button rows: `+2.5 +5 +10 +15 +20` / `−2.5 −5 −10 −15 −20`), `RepStepper` (`− n +`), `NumericField` (tappable mono number opening native numeric keyboard as fallback), `LastSessionBlock`, `NudgeBanner`, `RestTimerBanner` (Phase 5).
5. **Exercise Logging Screen** (`app/session/[id]/log/[sessionExerciseId].tsx`) — brutalist grid per approved mockup:
   - Local row state: `{ label, type, weightKg, reps, setId | null }[]`. Built by pure fn `buildSetRows(planWarmup, planWork, existingSets)` — existing sets (resume/edit) map to checked rows; remaining planned counts become blank rows. Labels: `W1…Wn` then `1…n`.
   - Blank rows start empty per spec (last session never pre-filled). Weight shows `—` until touched; PlatePad `+` from empty starts at the denomination value.
   - **Active row**: tap anywhere on a row selects it (inverted border or filled label cell). PlatePad + RepStepper act on active row. ✓ on a row also requires it; first unchecked row auto-active on mount.
   - **✓ toggle** (decision #5): unchecked + valid (weight > 0 OR bodyweight 0 allowed — weight ≥ 0 and reps ≥ 1) → insert via `setsRepo.create`, row inverts (white bg/black text = "green" of monochrome), rest timer starts (Phase 5; no-op until then), auto-advance active to next unchecked row. Checked → delete `sets` row, values stay in controls.
   - `+ ADD SET` button per section appends blank row with next label.
   - Footer: `← PREV` / `NEXT →` across `session_exercises` in order (disabled at ends), exercise name shown on the buttons.
   - **Edit mode** (decision #8): same route rendered for finished sessions from History with `mode=edit` — hides nudge + timer, otherwise identical.
6. Tests: `buildSetRows` (fresh, resume-partial, edit-finished cases), label sequencing with added sets, prune-on-finish, ✓ insert/delete round-trip, weight floor at 0.
7. **Done when**: full gym workout loggable end-to-end on device without ever opening keyboard; kill app mid-session → resume intact.

### Phase 5 — Rest timer, last-session reference, overload nudge ✅

**Goal**: the between-sets experience.

1. **Timer state**: small React context `RestTimerProvider` at session-modal level holding `{ endsAt: number, setType } | null`. No persistence — timestamp survives backgrounding because banner re-derives remaining from `Date.now()`; app killed mid-rest = timer gone (acceptable, notification still fires).
2. **On ✓**: duration = `settingsRepo.getRestTimerSeconds(db, type)`; set `endsAt = now + duration·1000`; cancel any pending notification; schedule local notification (`expo-notifications`) at `endsAt` — title `REST OVER`, body `next set: <exercise>`, Android channel `rest-timer` with vibration, no sound spam. Request notification permission lazily on first-ever ✓.
3. **`RestTimerBanner`**: fixed bar above footer on Session + Logging screens while timer active — `mm:ss` countdown (1 s interval from `endsAt`), inverted colors, full-width `✕ DISMISS` target cancels notification + clears state. Expiry in-foreground: banner flashes then clears (notification suppressed when app foregrounded — handle via notification handler returning no-alert when visible).
4. **`LastSessionBlock`**: query per decision #7 — latest finished session with ≥1 set of this exercise; render its sets greyed (`muted` token), read-only, labels as logged. Absent → omit block entirely (no empty-state copy, per PRODUCT.md).
5. **Overload nudge**: `src/domain/overloadNudge.ts` — `shouldNudge(workSetHistory: WeightReps[][]): boolean`: true iff ≥2 sessions and last two work-set lists are element-wise equal (same length, same ordered `(weight, reps)`). Repo supplies last 2 sessions' work sets; `NudgeBanner` renders spec copy above LastSessionBlock.
6. Tests: `shouldNudge` matrix (equal → true; 1 session / different length / different weight / different order → false), notification schedule/cancel mocked behind a project-owned `restNotifier` interface (named fake in tests, per CLAUDE.md).
7. **Done when**: ✓ a set → banner counts down; lock phone → vibrating notification at expiry; nudge appears after two identical sessions.

### Phase 6 — History ✅

**Goal**: browse, edit, delete past sessions.

1. `app/(tabs)/history.tsx`: sessions desc by `started_at`, month separator rows (`JUNE 2026`). Row: date, plan name or `FREESTYLE`, duration, `n sets · n,nnn kg` work volume. Tap → detail. Active (unfinished) session excluded.
2. Detail screen `app/history/[id].tsx`: header (date, duration, plan); per-exercise section listing sets `W1 60.0 × 10` style; tap exercise section → logging screen in `mode=edit` (Phase 4.5) — full ✓ toggle, add-set, value editing against historical session; nudge/timer off. Edits write immediately (no draft state).
3. Sets added during edit get `logged_at = now` (session's `started_at/finished_at` untouched — analytics keys off session date, not set timestamps; comment this in code).
4. Footer: `DELETE SESSION` with confirm (irreversible).
5. Empty-exercise cleanup: leaving edit mode prunes zero-set `session_exercises` (same `finish` prune fn reused).
6. Tests: history list aggregation query (volume/duration math), edit-mode prune reuse.
7. **Done when**: past mistakes fixable from History; junk sessions deletable.

### Phase 7 — Analytics ✅

**Goal**: every chart from spec, all free, all local.

1. `src/charts/`: `TrendLine` + `WeeklyBars` wrapping victory-native (monochrome: white strokes/fills on black, no gridlines beyond hairlines, mono axis labels); `Heatmap` custom — plain `View` grid, 7 rows × ~26 week-columns, cell opacity stepped by has-session (binary v1: `#FFF` session / `#222` none).
2. `src/domain/analytics/`: pure, unit-tested fns over typed query rows:
   - `maxWeightSeries(sets) → {sessionDate, maxKg}[]` (work sets).
   - `volumeSeries(sets) → {sessionDate, volumeKg}[]` (Σ weight×reps, work sets).
   - `prBadges(sets) → { heaviestSet, mostRepsSet, highestVolumeSession }`.
   - `weeklyVolumeByMuscle(sets, muscleMap) → { weekStart, group, subMuscle, volumeKg }[]` — Monday buckets (decision #11), full credit per targeted pair (decision #13).
   - `weeklyStreak(sessionDates, exerciseId) → number` — consecutive Monday-weeks containing the exercise, counting back from current week.
3. `app/(tabs)/analytics.tsx`, stacked sections:
   - **CONSISTENCY**: heatmap (last 6 months) at top.
   - **MUSCLE VOLUME**: bars per big group, last 8 weeks; tap group → inline drill-down to sub-muscle split for that group.
   - **EXERCISE**: exercise picker (recently-performed first) → max-weight line, volume line, 3 PR badge rows (value + date), last-performed date + weekly streak.
4. Performance: queries aggregate in SQL where trivial (sums/max via Drizzle), shape in domain fns; single-user data volume makes this instant — no caching layer.
5. Tests: every domain fn — week bucketing across year boundary, multi-muscle attribution, streak gaps, PR ties (earliest wins, document).
6. **Done when**: all spec analytics render from real logged data; tab opens with no perceptible delay.

### Phase 8 — Distribution ✅ (local Gradle, no EAS)

**Goal**: installed on your phone via a fully-local, offline APK build.

**Revised approach (2026-06-13): dropped EAS/OTA for simplicity.** No Expo
account, no cloud queue, no login. CNG release builds sign with the local
debug key by default — no keystore step needed for solo sideload. JS changes
ship by rebuild + reinstall (no OTA). `expo-updates` stays installed but inert
(no update URL configured). See `docs/BUILD.md` for the full runbook.

1. Build: `npm run apk` (= `expo prebuild --platform android` → regenerates the
   gitignored `android/` dir, then `./gradlew assembleRelease`). APK at
   `android/app/build/outputs/apk/release/app-release.apk`.
2. Install: `adb install -r <apk>` (or copy to phone + tap). `-r` reinstalls
   over the previous build — same debug signing key per machine, so it upgrades
   in place without losing the SQLite DB.
3. New build for any change (JS or native) — bump `version` in `package.json` +
   `app.json` together for native/SDK changes, rebuild, reinstall.
4. Smoke checklist on device: fresh install seeds DB → build plan → assign
   weekday → full session with timer (locked phone notification) → edit from
   history → analytics populated → kill mid-session + resume.
5. **Done when**: APK on phone, smoke checklist passes.

> **Tooling note**: `npm run apk` is unverified in this repo's CI — it needs a
> JDK + Android SDK on the build machine (the developer's box, not the agent
> sandbox). Optional portable keystore (for a stable upgrade key across
> machines) documented in `docs/BUILD.md`.

---

## Phase order rationale

Data layer before any UI (everything depends on it); Exercises before Plans (plans pick exercises); Plans before Sessions (sessions copy plans); timer/nudge split from session core so Phase 4 lands a usable logger fast; History before Analytics (analytics needs logged data to verify against); distribution last but APK can be sideloaded for gym field-testing from Phase 4 onward.

## Out of scope (unchanged from spec)
Cloud sync, social, multi-profile, body measurements, plate-math calculator.
