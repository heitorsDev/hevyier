// Static server for the exported web build (dist/). Exists only because
// expo-sqlite's synchronous web backend uses SharedArrayBuffer, which the
// browser exposes only on a cross-origin-isolated page. That requires the
// COOP/COEP headers below on EVERY response, including the HTML document —
// something the Expo dev server's enhanceMiddleware does not cover for the
// top-level route. Run `npm run web` to build dist/ and serve it here.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "dist");
const PORT = Number(process.env.PORT) || 8085;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Resolve a request URL to a file inside ROOT, guarding against path
// traversal (`..`) escaping the build directory. Returns null if the
// resolved path leaves ROOT.
function resolveSafe(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const resolved = path.join(ROOT, clean);
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function send(res, status, body, contentType) {
  // Cross-origin isolation headers on every response — see file header.
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-origin",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const resolved = resolveSafe(req.url || "/");
  if (resolved === null) return send(res, 403, "forbidden", "text/plain");

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  // SPA fallback: unknown paths serve index.html so expo-router can route
  // client-side (e.g. deep links like /exercise/3 on a hard refresh).
  if (!fs.existsSync(filePath)) filePath = path.join(ROOT, "index.html");

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, "not found", "text/plain");
    const type = MIME[path.extname(filePath)] || "application/octet-stream";
    send(res, 200, data, type);
  });
});

server.listen(PORT, () => {
  console.log(`hevyier web build serving at http://localhost:${PORT}`);
});
