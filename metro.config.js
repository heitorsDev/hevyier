// Nativewind compiles the Tailwind stylesheet at build time and needs to own
// the Metro transformer; global.css is the entry it reads.
//
// globalClassNamePolyfill is off deliberately. It patches React Native's
// export object to accept `className` on every component, which breaks RN
// 0.85's lazy `FlatList` getter ("Cannot read properties of undefined").
// Instead the UI layer imports pre-wrapped components from
// `react-native-css/components`, which touches nothing global.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  input: "./global.css",
  globalClassNamePolyfill: false,
});
