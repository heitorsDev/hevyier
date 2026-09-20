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
