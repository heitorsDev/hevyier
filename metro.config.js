// Metro config exists only to make the web target work. Two native deps
// ship WASM that the default config won't serve correctly:
//   - expo-sqlite: wa-sqlite.wasm must be bundled as an asset, and OPFS
//     (its persistent web storage) needs a cross-origin isolated page,
//     which requires the COOP/COEP headers below.
//   - @shopify/react-native-skia (via victory-native): CanvasKit WASM.
// Native builds ignore all of this.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Bundle .wasm as an asset instead of trying to parse it as JS.
config.resolver.assetExts.push("wasm");

// Cross-origin isolation: required for SharedArrayBuffer / OPFS, which
// expo-sqlite's web backend uses for synchronous persistent storage.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    return middleware(req, res, next);
  };
};

module.exports = config;
