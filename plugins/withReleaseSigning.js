const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Prebuild-safe Android release signing for Hevyier.
 *
 * WHY this exists: `/android` is gitignored and regenerated on every
 * `expo prebuild`, so hand-edits to `app/build.gradle` are wiped. The stock
 * template signs `release` with the insecure shared *debug* keystore, which
 * blocks in-place upgrades. This plugin re-applies a real `release`
 * signingConfig on each prebuild, reading credentials from env vars at Gradle
 * time so no keystore or password is ever committed.
 *
 * It also lets CI stamp `android.versionCode` from the build number via
 * HEVYIER_VERSION_CODE, since Android refuses to upgrade an APK whose
 * versionCode did not increase.
 *
 * Required env at `./gradlew assembleRelease` time (see docs/RELEASING.md):
 *   HEVYIER_STORE_FILE      absolute path to the .jks keystore
 *   HEVYIER_STORE_PASSWORD  keystore password
 *   HEVYIER_KEY_ALIAS       key alias inside the keystore
 *   HEVYIER_KEY_PASSWORD    key password
 *
 * Usage: registered in app.json under `expo.plugins` as "./plugins/withReleaseSigning".
 */
const RELEASE_SIGNING_CONFIG = `        release {
            storeFile file(System.getenv("HEVYIER_STORE_FILE") ?: "release.jks")
            storePassword System.getenv("HEVYIER_STORE_PASSWORD")
            keyAlias System.getenv("HEVYIER_KEY_ALIAS")
            keyPassword System.getenv("HEVYIER_KEY_PASSWORD")
        }
`;

function patchGradle(gradle) {
  if (gradle.includes('System.getenv("HEVYIER_STORE_FILE")')) {
    return gradle; // already patched this prebuild run
  }

  // 1. Add a `release` block right after the generated `debug` signingConfig.
  const debugSigningBlock =
    /(signingConfigs\s*\{\s*\n\s*debug\s*\{[\s\S]*?\n\s*\}\n)/;
  if (!debugSigningBlock.test(gradle)) {
    throw new Error(
      "withReleaseSigning: could not find `signingConfigs { debug { ... } }` in app/build.gradle. " +
        "Expo template changed; update plugins/withReleaseSigning.js.",
    );
  }
  gradle = gradle.replace(debugSigningBlock, `$1${RELEASE_SIGNING_CONFIG}`);

  // 2. Point the `release` buildType at the new release signingConfig.
  //    The template ships `signingConfig signingConfigs.debug` under both
  //    buildTypes; the release one is preceded by the "Caution!" comment.
  const releaseBuildType =
    /(\/\/ Caution![\s\S]*?signed-apk-android\.\n\s*)signingConfig signingConfigs\.debug/;
  if (!releaseBuildType.test(gradle)) {
    throw new Error(
      "withReleaseSigning: could not find the release buildType `signingConfig signingConfigs.debug`. " +
        "Expo template changed; update plugins/withReleaseSigning.js.",
    );
  }
  gradle = gradle.replace(releaseBuildType, "$1signingConfig signingConfigs.release");

  return gradle;
}

const withReleaseSigning = (config) => {
  // CI stamps the Android versionCode from the build number.
  const versionCode = process.env.HEVYIER_VERSION_CODE;
  if (versionCode) {
    config.android = config.android || {};
    config.android.versionCode = parseInt(versionCode, 10);
  }

  return withDangerousMod(config, [
    "android",
    async (cfg) => {
      const gradlePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "app",
        "build.gradle",
      );
      const gradle = fs.readFileSync(gradlePath, "utf8");
      fs.writeFileSync(gradlePath, patchGradle(gradle));
      return cfg;
    },
  ]);
};

module.exports = withReleaseSigning;
