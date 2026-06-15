const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * Prebuild-safe fix for the release build failing on a jitpack.io timeout.
 *
 * WHY this exists: `expo-updates` transitively depends on
 * `org.bouncycastle:bcutil-jdk15to18:1.81`, which itself declares a *dynamic*
 * version range for `bcprov-jdk15to18:[1.81,1.82)`. A dynamic range forces
 * Gradle to LIST available versions, which means fetching `maven-metadata.xml`
 * from *every* declared repository — including `jitpack.io`. jitpack times out
 * serving metadata for an artifact it doesn't host, and the whole
 * `:app:releaseRuntimeClasspath` resolution fails:
 *
 *   > Could not resolve org.bouncycastle:bcprov-jdk15to18:[1.81,1.82).
 *   > Failed to list versions ... Unable to load Maven meta-data from
 *     https://www.jitpack.io/.../bcprov-jdk15to18/maven-metadata.xml
 *   > Read timed out
 *
 * (Killed release v1.2.1 three times — see docs/RELEASING.md troubleshooting.)
 *
 * Forcing an exact `bcprov-jdk15to18` version overrides the dynamic selector,
 * so Gradle resolves the POM directly and never lists versions — jitpack is
 * never queried for it. `/android` is gitignored and regenerated on every
 * prebuild, so this must live in a config plugin rather than a hand-edit.
 *
 * Usage: registered in app.json under `expo.plugins`.
 */
const BCPROV_VERSION = "1.81";

const FORCE_BLOCK = `
// hevyier: pin bouncycastle to an exact version so Gradle never lists versions
// for the dynamic range [1.81,1.82) pulled in transitively by expo-updates.
// Version listing fetches maven-metadata.xml from every repo, including
// jitpack.io, which times out and fails the release build. See
// plugins/withJitpackBouncyCastleFix.js for the full explanation.
allprojects {
    configurations.all {
        resolutionStrategy {
            force "org.bouncycastle:bcprov-jdk15to18:${BCPROV_VERSION}"
        }
    }
}
`;

const FORCE_MARKER = 'force "org.bouncycastle:bcprov-jdk15to18:';

const withJitpackBouncyCastleFix = (config) =>
  withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      throw new Error(
        "withJitpackBouncyCastleFix: expected a groovy android/build.gradle, got " +
          cfg.modResults.language +
          ". Expo template changed; update plugins/withJitpackBouncyCastleFix.js.",
      );
    }
    if (!cfg.modResults.contents.includes(FORCE_MARKER)) {
      cfg.modResults.contents += FORCE_BLOCK;
    }
    return cfg;
  });

module.exports = withJitpackBouncyCastleFix;
