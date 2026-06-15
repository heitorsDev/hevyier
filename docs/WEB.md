# Running hevyier on the web

The web target is for previewing in a desktop browser. It is **not** served
the way a normal Expo app is — read this before reaching for the IDE preview
button or `expo start`.

## TL;DR

```bash
npm run web        # build dist/ + copy canvaskit, then serve on :8085
```

Open <http://localhost:8085>. First load shows a brief loading screen while
the SQLite wasm worker + CanvasKit warm up (see `useWebRuntimeWarm`, PR #8).

**Do not** use `expo start --web`, `npm start` → web, or the editor's "preview"
button. They run the Expo dev server, which cannot make the page work — see
below.

## Why the dev server / IDE previews are broken

`expo-sqlite`'s synchronous web backend stores data in OPFS and drives it with
`SharedArrayBuffer`. Browsers only expose `SharedArrayBuffer` on a
**cross-origin isolated** page, which requires three response headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

`metro.config.js` sets these via `server.enhanceMiddleware` — but the Metro dev
server's middleware does **not** apply them to the top-level HTML document
response. Without isolation on the document itself, `SharedArrayBuffer` is
`undefined`, the sync sqlite open throws, and the console fills with errors.
The IDE preview buttons run this same dev server, so they fail identically.

The fix is to serve a static export from a server that sets the headers on
**every** response, including the document — that is `scripts/serve-web.js`.

## What `npm run web` actually does

`npm run web` = `web:build` then `web:serve`:

1. **`web:build`** (`scripts/copy-canvaskit.js` + `expo export --platform web`)
   - Copies `canvaskit-wasm`'s `canvaskit.wasm` into `public/` so it is served
     **same-origin** at `/canvaskit.wasm`. `COEP: require-corp` forbids loading
     it from a CDN, so it must ship with the build. (`public/canvaskit.wasm` is
     gitignored and regenerated each build.)
   - `expo export` writes the static site to `dist/`, bundling
     `wa-sqlite.wasm` as an asset (`metro.config.js` adds `wasm` to
     `assetExts`).
2. **`web:serve`** (`scripts/serve-web.js`)
   - A tiny static server on **port 8085** that sets COOP/COEP/CORP on every
     response and SPA-falls-back to `index.html` for client-side routing.

## Moving parts

| Piece | Role | Provenance |
| --- | --- | --- |
| `metro.config.js` | wasm assetExt + COOP/COEP middleware (dev only; insufficient for the document) | `d2b8514` |
| `scripts/serve-web.js` | static server with isolation headers on **every** response — the only correct way to serve web | `b0048c2` |
| `scripts/copy-canvaskit.js` | ships `canvaskit.wasm` same-origin (COEP forbids CDN) | `b0048c2` |
| `useWebRuntimeWarm` (`src/db/bootstrap.ts`) | gates the app tree on the wasm worker + CanvasKit being warm; shows a loading screen | PR #8 |
| `src/charts/skiaWeb.ts` vs `skiaWeb.web.ts` | native no-op keeps `canvaskit-wasm` (needs Node `fs`) out of the Android release bundle | PR #10 |

## Troubleshooting

- **`EADDRINUSE: :::8085`** — a previous `web:serve` is still running. Reuse it
  (open :8085) or kill it: `pkill -f serve-web.js`.
- **`SharedArrayBuffer is not defined` / sqlite open throws** — you're on the
  dev server (8081), not the static server (8085). Use `npm run web`.
- **`canvaskit.wasm` 404 or CORS error** — `web:build` wasn't run (no
  `public/canvaskit.wasm`), or you served `dist/` without `serve-web.js`.
- **Stale UI after a code change** — `npm run web` rebuilds `dist/` from
  scratch; re-run it (there is no hot reload on this path).
