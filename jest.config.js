/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/test/**/*.test.{ts,tsx}"],
  // See jest.resolver.js: makes react-native-worklets load its jest-safe
  // (non-native) entry so Reanimated 4 hooks run under jest.
  resolver: "<rootDir>/jest.resolver.js",
};
