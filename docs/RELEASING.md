# Releasing Hevyier

Hevyier ships as a signed Android APK attached to a **GitHub Release**. Pushing
a `v*` git tag triggers `.github/workflows/release.yml`, which builds, signs, and
publishes the APK automatically. There is no Play Store, no EAS, no OTA.

---

## Agent runbook — "create a release"

When the user asks to cut a release, follow these steps exactly. Do **not**
invent a version or push without confirming the version number first.

1. **Confirm the version.** Ask the user for the target version, or propose one
   following semver from the last tag (`git tag | sort -V | tail -1`). Call it
   `X.Y.Z` below. The tag will be `vX.Y.Z`.

2. **Preflight — must all pass before tagging:**
   ```bash
   git switch main && git pull
   git status --porcelain        # must be empty (clean tree)
   npm run lint
   npm test
   ```
   If anything fails or the tree is dirty, stop and report — do not release.

3. **Bump the version** in **both** files so they match the tag. Leave
   `android.versionCode` as-is — CI sets it automatically from the build number.
   - `package.json` → `"version": "X.Y.Z"`
   - `app.json` → `"expo.version": "X.Y.Z"`

4. **Commit and push main:**
   ```bash
   git commit -am "chore: release vX.Y.Z"
   git push origin main
   ```

5. **Tag and push the tag** (this is what triggers the build):
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

6. **Watch the build** and report the result:
   ```bash
   gh run watch --exit-status                 # follows the running workflow
   gh release view vX.Y.Z --web               # the published release + APK
   ```
   If the run fails, fetch logs with `gh run view --log-failed`, diagnose, and
   report before retrying. To retry the same version, delete the tag locally and
   remotely, fix, and re-tag (see Troubleshooting).

7. **Report** the release URL and the APK asset name (`hevyier-vX.Y.Z.apk`).

---

## One-time setup (already done if a release has shipped before)

### 1. Create the repo
```bash
gh auth login                                  # interactive — run via `! gh auth login`
gh repo create heitor/hevyier --public --source=. --remote=origin --push
```

### 2. Generate the release keystore (do this ONCE, keep forever)
```bash
keytool -genkeypair -v -keystore hevyier-release.jks \
  -alias hevyier -keyalg RSA -keysize 2048 -validity 10000
```
> ⚠️ **Back this `.jks` file and its passwords up somewhere safe and permanent.**
> If you lose it you can never again publish an upgrade that installs over an
> existing Hevyier install — users would have to uninstall first. The keystore
> is gitignored and must never be committed.

### 3. Store the signing material as GitHub secrets
```bash
gh secret set ANDROID_KEYSTORE_BASE64 < <(base64 -w0 hevyier-release.jks)
gh secret set HEVYIER_STORE_PASSWORD   # keystore password (prompts)
gh secret set HEVYIER_KEY_ALIAS        # "hevyier"
gh secret set HEVYIER_KEY_PASSWORD     # key password
```

That's it. From now on, releases are just the runbook above.

---

## How signing survives prebuild

`/android` is gitignored and regenerated on every `expo prebuild`, so the
generated `app/build.gradle` signs `release` with the insecure shared **debug**
keystore. `plugins/withReleaseSigning.js` (registered in `app.json`) re-injects a
real `release` signingConfig on each prebuild that reads credentials from env
vars at Gradle time — so nothing secret is ever written to disk in the repo. The
same plugin stamps `android.versionCode` from `HEVYIER_VERSION_CODE`
(`github.run_number` in CI) so every build increments.

---

## Build it locally (optional, for testing)
```bash
HEVYIER_STORE_FILE=$PWD/hevyier-release.jks \
HEVYIER_STORE_PASSWORD=... HEVYIER_KEY_ALIAS=hevyier HEVYIER_KEY_PASSWORD=... \
npm run apk
# APK at android/app/build/outputs/apk/release/app-release.apk
```

---

## Troubleshooting

- **Re-run a failed release for the same version:**
  ```bash
  git push --delete origin vX.Y.Z && git tag -d vX.Y.Z   # remove the tag
  # fix the problem, commit, then re-tag and push as in the runbook
  ```
- **`INSTALL_FAILED_UPDATE_INCOMPATIBLE` on device:** the APK was signed with a
  different keystore than the installed one (e.g. an old debug-signed build).
  Uninstall the old app once; future upgrades will work.
- **`versionCode` did not increase:** only happens for local builds without
  `HEVYIER_VERSION_CODE` set. CI handles this automatically.
- **Workflow can't create the release:** confirm the repo has
  `Settings → Actions → Workflow permissions = Read and write`, and the four
  signing secrets exist (`gh secret list`).
