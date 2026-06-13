# hevyier

An open-source clone of [Hevy](https://www.hevy.com/), the gym-workout tracker.

Single-user, **local-only** Android app for logging your workouts. Built to fix
three things that annoyed me about Hevy and similar apps:

- **Set registration is too slow** — too many taps, keyboard-heavy, tiny touch
  targets. In hevyier, logging a set is fast and needs **zero keyboard** by default.
- **Analytics are paywalled** — here every chart and stat is free.
- **No ownership or extensibility** — your data lives in a local SQLite DB on
  your device. No account, no cloud, no sync, no tracking.

## Features

- **Today** — start a workout from your scheduled plan or freestyle, resume an
  active session, see your last session at a glance.
- **Plans** — build reusable workout plans and assign them to days of the week.
- **Library** — manage exercises tagged by equipment and muscle group.
- **History** — browse, edit, and delete past sessions.
- **Stats** — free analytics: charts and per-muscle-group volume series.

## Tech stack

- **Framework**: [Expo](https://expo.dev) (managed workflow), React Native
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based)
- **Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/), local only
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Charts**: [victory-native](https://commerce.nearform.com/open-source/victory-native/) + [Skia](https://shopify.github.io/react-native-skia/)

## Install (Android)

Releases are **signed Android APKs** published to
[GitHub Releases](https://github.com/heitorsDev/hevyier/releases).

1. Open the [latest release](https://github.com/heitorsDev/hevyier/releases/latest).
2. Download the `hevyier-vX.Y.Z.apk` asset.
3. On your phone, open the APK and allow installs from your browser/file manager
   when prompted ("Install unknown apps").
4. Install. Updates: download a newer APK and install over the top — the signing
   key is stable, so your data is preserved.

> iOS is not distributed. The app is Android-only for now.

## Develop

Requires Node 20+ and the Android SDK (Android Studio).

```bash
npm install        # install deps
npm start          # start Expo dev server
npm run android    # build + run on a device/emulator
npm test           # run Jest tests
npm run lint       # ESLint
```

### Build a release APK locally

```bash
npm run apk        # expo prebuild + gradlew assembleRelease
```

Signing config lives in `plugins/withReleaseSigning` and reads from
`HEVYIER_*` env vars. See [`docs/BUILD.md`](docs/BUILD.md) for build details and
[`docs/RELEASING.md`](docs/RELEASING.md) for the release runbook (tag `v*` →
CI builds and publishes the APK via `.github/workflows/release.yml`).

## License

Open source. See repository for details.
