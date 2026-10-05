/* =========================================================
   生成 Netlify 部署包(标准 ZIP,路径用 /,UTF-8 文件名)
   用途:拖到 https://app.netlify.com/drop 即可部署/更新站点
   用法:node build-netlify-zip.mjs
   输出:项目上一级目录下的 kumiko-doomsday-网站包.zip
   ========================================================= */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const OUT = path.join(DIR, "..", "kumiko-doomsday-网站包.zip");
const SKIP_DIRS = new Set([".git", "node_modules", ".netlify"]);

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function walk(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    if (e.isFile() && e.name.toLowerCase().endsWith(".zip")) continue;
    const rel = base ? base + "/" + e.name : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, rel));
    else out.push({ rel, full });
  }
  return out;
}

const files = walk(DIR);
const locals = [], centrals = [];
let offset = 0;
for (const f of files) {
  const data = fs.readFileSync(f.full);
  const compressed = zlib.deflateRawSync(data, { level: 9 });
  const nameBuf = Buffer.from(f.rel, "utf8");
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0x2821, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);
  locals.push(local, nameBuf, compressed);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0x2821, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(offset, 42);
  centrals.push(central, nameBuf);
  offset += local.length + nameBuf.length + compressed.length;
}
const centralBuf = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);
fs.writeFileSync(OUT, Buffer.concat([...locals, centralBuf, end]));

console.log("✓ 部署包已生成:" + OUT);
console.log("  文件数 " + files.length + " · 大小 " + (fs.statSync(OUT).size / 1024).toFixed(1) + "KB");
const cfg = fs.readFileSync(path.join(DIR, "assets/js/site-config.js"), "utf8");
console.log("  云端配置:" + (/provider:\s*"supabase"/.test(cfg) ? "已启用 ✓" : "未启用(仍是本地模式)"));
