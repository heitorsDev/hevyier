import { Platform } from "react-native";

// victory-native renders through @shopify/react-native-skia, which on web
// needs CanvasKit (a ~7.7MB wasm) loaded into global before any chart
// mounts — it is NOT auto-loaded, so a CartesianChart would otherwise throw
// the moment analytics has data to plot. canvaskit.wasm is served
// same-origin from /canvaskit.wasm (see scripts/copy-canvaskit.js + the
// public/ dir); a CDN won't work because our COEP: require-corp header
// blocks cross-origin subresources that lack CORP.
//
// No-op on native, where Skia is a real native module.
export async function loadChartEngineWeb(): Promise<void> {
  if (Platform.OS !== "web") return;
  const { LoadSkiaWeb } = await import(
    "@shopify/react-native-skia/lib/module/web"
  );
  await LoadSkiaWeb({ locateFile: (file: string) => `/${file}` });
}
