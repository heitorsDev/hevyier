// Copies CanvasKit's wasm into public/ so the web build serves it
// same-origin at /canvaskit.wasm. Required by src/charts/skiaWeb.ts —
// @shopify/react-native-skia (via victory-native) needs CanvasKit on web,
// and our COEP: require-corp header forbids loading it from a CDN. Kept out
// of git (public/canvaskit.wasm is gitignored); regenerated on web:build.
const fs = require("fs");
const path = require("path");

const SRC = path.join(
  __dirname,
  "..",
  "node_modules",
  "canvaskit-wasm",
  "bin",
  "full",
  "canvaskit.wasm",
);
const DEST_DIR = path.join(__dirname, "..", "public");
const DEST = path.join(DEST_DIR, "canvaskit.wasm");

if (!fs.existsSync(SRC)) {
  throw new Error(
    `canvaskit.wasm not found at ${SRC}; expected canvaskit-wasm to be installed as a dep of @shopify/react-native-skia`,
  );
}
fs.mkdirSync(DEST_DIR, { recursive: true });
fs.copyFileSync(SRC, DEST);
console.log(`copied canvaskit.wasm -> ${path.relative(process.cwd(), DEST)}`);
