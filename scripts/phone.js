// Serves scripts/phone-frame.html on :8090 — a phone-sized iframe around the
// Expo dev server, so layout can be checked at real device dimensions without
// an Android emulator (this machine has no KVM).
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PAGE = path.join(__dirname, "phone-frame.html");
const PORT = 8090;

http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(PAGE));
  })
  .listen(PORT, () => console.log(`phone frame: http://localhost:${PORT}`));
