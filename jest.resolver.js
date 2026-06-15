// Reanimated 4 + worklets under jest: the default resolver picks the
// `.native.ts` worklets entry, which throws "Native part of Worklets doesn't
// seem to be initialized" in the node test env. react-native-worklets ships a
// resolver that strips `native` extensions for worklets requests so the
// jest-safe variants load. jest allows a single resolver and jest-expo already
// sets @react-native/jest-preset's, so we apply the worklets fix then delegate.
const rnResolver = require("@react-native/jest-preset/jest/resolver");

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) => {
  if (
    options.basedir.includes("react-native-worklets") ||
    request.includes("react-native-worklets")
  ) {
    options = {
      ...options,
      extensions: options.extensions?.filter((ext) => !ext.includes("native")),
    };
  }
  return rnResolver(request, options);
};
