// Native no-op: Skia is a real native module on iOS/Android, so CanvasKit
// never needs loading. This base file deliberately imports nothing from
// `@shopify/react-native-skia/lib/module/web` — that entry pulls in
// `canvaskit-wasm`, whose `canvaskit.js` requires Node's `fs` and breaks the
// native release bundle (`createBundleReleaseJsAndAssets`: "Unable to resolve
// module fs"). The web loader lives in skiaWeb.web.ts, which Metro resolves
// only for the web platform.
export async function loadChartEngineWeb(): Promise<void> {}
