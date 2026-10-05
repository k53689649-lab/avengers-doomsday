import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.env.SITE_ROOT || "D:/tools/marvel-doomsday-prep");
const port = Number(process.env.PORT || 8901);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".md": "text/markdown; charset=utf-8" };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let fp = path.join(root, urlPath === "/" ? "index.html" : urlPath);
  if (!fp.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(fp)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, "0.0.0.0", () => {
  console.log("serving " + root + " at http://localhost:" + port + "/ (LAN: http://<本机IP>:" + port + "/)");
});
