# hevyier

A gym logger for one person. Four fixed training days, transcribed from a
spreadsheet into `src/data/plans.ts`. Logging a set is three taps and never
opens a keyboard.

## Run

```bash
npx expo start --web   # browser, hot reload — the main loop
npx expo start         # Expo Go on the phone
npm run apk            # signed release APK
```

## Shape

| Path | Role |
| --- | --- |
| `src/data/plans.ts` | The four days. Editing a plan means editing this file. |
| `src/data/store.ts` | All persistence: one JSON blob in AsyncStorage. |
| `app/index.tsx` | Pick a day, resume a session, recent history. |
| `app/day/[planId].tsx` | The session screen — the spreadsheet, live. |
| `app/history/` | Past sessions. |

Sets are keyed by exercise *name*, so the "ant:" reference line follows a
movement across days without any join.

## UI

The component layer follows the shadcn/ui model, ported to React Native:
owned source in `src/components/ui/`, CVA variants, a `cn()` merge helper,
and a `components.json` describing the aliases. Styling is Tailwind 4 via
Nativewind 5.

The token schema is carried over from the magic-alliance shadcn config —
style `base-mira`, neutral base, 0.45rem radius — so both projects name
colour identically (`background`/`foreground` pairs, `primary`,
`secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`).
Only the dark palette is defined, and the values are the sRGB hex
equivalents of the source `oklch()` so they also work in the native style
engine. They live in the `@theme` block of `global.css`.

Two constraints worth knowing before editing:

- Import `View`/`Text`/`Pressable`/`ScrollView` from
  `@/components/ui/primitives`. The global `className` polyfill is disabled
  because it breaks RN 0.85's lazy `FlatList` getter.
- Tailwind's utilities are imported **unlayered** in `global.css`. React
  Native Web injects its own classes unlayered, and unlayered CSS always
  beats `@layer utilities` — layered utilities silently never apply.
