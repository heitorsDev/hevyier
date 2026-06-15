// victory-native renders through @shopify/react-native-skia, which on web
// needs CanvasKit (a ~7.7MB wasm) loaded into global before any chart
// mounts — it is NOT auto-loaded, so a CartesianChart would otherwise throw
// the moment analytics has data to plot. canvaskit.wasm is served
// same-origin from /canvaskit.wasm (see scripts/copy-canvaskit.js + the
// public/ dir); a CDN won't work because our COEP: require-corp header
// blocks cross-origin subresources that lack CORP.
//
// Web-only file: the skia web entry transitively requires `canvaskit-wasm`,
// whose `canvaskit.js` imports Node's `fs`. Bundling that into the native
// graph breaks `createBundleReleaseJsAndAssets` ("Unable to resolve module
// fs"), so the native counterpart (skiaWeb.ts) is a pure no-op and never
// references this entry. Metro picks this file only for the web platform.
export async function loadChartEngineWeb(): Promise<void> {
  const { LoadSkiaWeb } = await import(
    "@shopify/react-native-skia/lib/module/web"
  );
  await LoadSkiaWeb({ locateFile: (file: string) => `/${file}` });
}
