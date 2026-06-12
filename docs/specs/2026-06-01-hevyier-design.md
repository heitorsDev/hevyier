# hevyier — Design Spec
_Date: 2026-06-01_

## Overview

Single-user, local-only React Native (Expo) app for tracking gym workouts. Solves three problems with existing apps like Hevy: impractical set-registration UI (too many taps, keyboard-heavy, small touch targets), paywalled analytics, and no ownership/extensibility.

Core design principle: registering a set must be fast and require zero keyboard interaction by default.

---

## Tech Stack

- **Framework**: Expo (managed workflow)
- **Navigation**: Expo Router (file-based)
- **Database**: expo-sqlite v2
- **ORM**: Drizzle ORM (type-safe, lightweight, native expo-sqlite support)
- **Storage**: Local only, no cloud sync

---

## Data Model

### Tables

```sql
settings           — key TEXT PK, value TEXT
exercises          — id, name, equipment
exercise_muscles   — id, exercise_id, muscle_group TEXT, sub_muscle TEXT
workout_plans      — id, name
plan_exercises     — id, plan_id, exercise_id, order, warmup_sets, work_sets
schedule           — day_of_week INTEGER (0–6) PK, plan_id (nullable FK)
sessions           — id, plan_id (nullable FK), started_at, finished_at
session_exercises  — id, session_id, exercise_id, order
sets               — id, session_exercise_id, type TEXT ('warmup'|'work'), weight_kg REAL, reps INTEGER, logged_at
```

### Key rules

- `plan_exercises.warmup_sets` and `work_sets` are pre-filled from global settings (`settings` table keys: `global_warmup_sets`, `global_work_sets`) when an exercise is added to a plan. Editable per plan_exercise afterward.
- `sessions.plan_id` is nullable — supports freestyle sessions not tied to any plan.
- `schedule` is a 7-row table (one entry per day); a day with `plan_id = NULL` means rest day.
- `sets.type` is a display flag only ('warmup' | 'work'). Warmup sets labeled W1, W2…; work sets labeled 1, 2, 3…
- `settings` keys include `rest_timer_warmup_seconds` and `rest_timer_work_seconds` (integer seconds, user-configurable, no per-exercise override).
- `exercise_muscles` is a many-to-many join: one exercise can target multiple (muscle_group, sub_muscle) pairs. Both columns are keys into hardcoded app constants — never free text.

### Muscle group constants (hardcoded in app)

```
chest      → low chest | mid chest | high chest
back       → upper back | mid back | lower back | lats
shoulders  → front delt | side delt | rear delt
biceps     → short head | long head
triceps    → long head | lateral head | medial head
quads      → outer quad | inner quad | rectus femoris
hamstrings → biceps femoris | semitendinosus
glutes     → gluteus maximus | gluteus medius
calves     → gastrocnemius | soleus
core       → abs | obliques | lower abs
traps      → upper traps | mid traps | lower traps
forearms   → (no sub-groups)
```

"Big" muscle groups = the top-level keys (chest, back, shoulders, etc.).
"Small" muscle groups = the sub-options (low chest, side delt, etc.).

---

## Screen Architecture

### Bottom tab navigation (5 tabs)

| Tab | Purpose |
|---|---|
| **Today** | Today's scheduled plan, "Start Session" CTA, last session summary |
| **History** | Chronological list of past sessions, tap to view detail |
| **Plans** | CRUD workout plans, assign plans to days of week |
| **Exercises** | Exercise library CRUD; each exercise has name, equipment, and multi-select muscle group targets |
| **Analytics** | Progress tracking per exercise |

Settings (gear icon, accessible from any tab): global warmup/work set defaults, rest timer durations (warmup and work set separately).

### Active session (full-screen modal over tabs)

```
Session Screen
  └── Exercise list (plan order, scrollable)
       └── Tap any exercise → Exercise Logging Screen
```

Exercises are listed in plan order as the default flow, with Prev/Next navigation buttons. User can freely tap any exercise in any order — no linear lock.

### Exercise form — muscle group selection

Two-level multi-select:
1. Pick one or more big muscle groups (chest, back, shoulders, …)
2. For each selected group, pick one or more sub-muscles from its hardcoded options

An exercise must have at least one (muscle_group, sub_muscle) target. Selection is stored as rows in `exercise_muscles`.

---

## Core UX: Set Registration

### Exercise Logging Screen layout

```
[ Exercise Name ]
─────────────────────────────────────
LAST SESSION  (greyed, read-only)
  W1  60kg × 10
  W2  80kg × 8
  1   100kg × 5
  2   100kg × 4
─────────────────────────────────────
THIS SESSION
  W1  [weight control]  [rep control]  [ ✓ ]
  W2  [weight control]  [rep control]  [ ✓ ]
  1   [weight control]  [rep control]  [ ✓ ]
  2   [weight control]  [rep control]  [ ✓ ]
─────────────────────────────────────
[ ← Prev Exercise ]    [ Next Exercise → ]
```

- Input fields start **blank** — previous session data is reference only, never pre-filled.
- Tapping ✓ marks the set complete (row turns green) and starts the rest timer automatically.
- Progressive overload nudge shown above "LAST SESSION" when last 2+ sessions had identical weight × reps: _"Same as last 2 sessions — consider adding weight."_

### Rest timer

- Starts automatically after tapping ✓ on any set.
- Duration: `rest_timer_warmup_seconds` if set type is warmup; `rest_timer_work_seconds` if work set.
- Shown as a countdown overlay or persistent banner on the Exercise Logging Screen.
- User can dismiss early or let it expire naturally (no forced lock — user can log next set mid-timer).
- Configured in Settings (global only, no per-exercise override).

### Weight control

```
        [ 120 kg ]  ← tap to open numeric keyboard

  +  [ 2.5 ] [ 5 ] [ 10 ] [ 15 ] [ 20 ]
  −  [ 2.5 ] [ 5 ] [ 10 ] [ 15 ] [ 20 ]
```

- Plate denominations match standard gym plates: 2.5, 5, 10, 15, 20 kg.
- Tap `+` row button → adds that weight to current value.
- Tap `−` row button → subtracts that weight (floor: 0).
- Tap the number display → opens numeric keyboard for direct entry.

### Rep control

```
  [−]  [ 8 ]  [+]
```

- `±1` per tap.
- Tap the number → numeric keyboard.

---

## Analytics

### Per-exercise progress (Exercise detail + Analytics tab)

- Line chart: max weight per session over time
- Line chart: total volume (weight × reps summed across work sets) per session
- PR badges: heaviest single set, most reps in a set, highest volume session

### Volume by muscle group (Analytics tab)

- **By big muscle group**: total weekly volume (sets × reps × weight) per top-level group (chest, back, shoulders, etc.) — bar chart or stacked view across recent weeks
- **By sub-muscle**: drill down into a big group to see volume split across sub-muscles (e.g., chest → low chest vs mid chest vs high chest)
- Helps identify imbalances (e.g., overdeveloped anterior delt vs neglected rear delt)

### Consistency

- Heatmap calendar (GitHub-style): one cell per day, colored by session presence
- Per-exercise: date last performed + weekly streak (consecutive weeks the exercise appeared in a completed session)

### Progressive overload nudge

- Shown inline on Exercise Logging Screen (above last session reference)
- Logic: if last 2+ sessions for this exercise have identical weight and reps on all work sets → display nudge
- No AI, no complex algorithm — simple equality check

---

## Out of Scope (v1)

- Cloud sync or backup
- Social features
- Multiple user profiles
- Body weight / measurement tracking
- Barbell loading calculator (plate math)
