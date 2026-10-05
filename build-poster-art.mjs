/* =========================================================
   生成 103 张作品海报(原创 SVG 设计,不用任何官方素材)
   用法:node build-poster-art.mjs
   输出:assets/img/posters/<id>.svg
   想换成官方海报:把图存成 assets/img/posters/<id>.jpg / .png 即可自动优先使用
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const OUT_DIR = path.join(DIR, "assets/img/posters");
const ctx = {};
new Function("window", fs.readFileSync(path.join(DIR, "assets/js/data-films.js"), "utf8") +
  "\nthis.FILMS=FILMS; this.TV_SHOWS=TV_SHOWS;").call(ctx, {});
const ALL = [...ctx.FILMS, ...ctx.TV_SHOWS];

const W = 600, H = 900;

const REL = {
  direct: { c: "#e23636", name: "直接相关" },
  context: { c: "#4a90d9", name: "重要背景" },
  minor: { c: "#7a8894", name: "一般关联" },
  info: { c: "#5c6b7a", name: "番外" }
};
function studioColor(s) {
  const map = [[/福克斯/, "#4a7fd6"], [/索尼|哥伦比亚/, "#3b9ac4"], [/环球/, "#c08a2e"],
  [/新线/, "#7d5fff"], [/狮门/, "#8a6ce0"], [/迪士尼/, "#4aa3df"]];
  for (const [re, c] of map) if (re.test(s || "")) return c;
  return "#e23636";
}

/* ---------------- 主题图形(原创几何图案,非官方素材) ---------------- */
const M = {
  reactor: a => `<circle cx="300" cy="430" r="150" fill="none" stroke="${a}" stroke-width="10" opacity=".8"/>
    <circle cx="300" cy="430" r="104" fill="none" stroke="${a}" stroke-width="6"/>
    <circle cx="300" cy="430" r="62" fill="${a}" opacity=".55"/>
    <path d="M300 368 L356 462 L244 462 Z" fill="#0a0f14" opacity=".85"/>`,
  gamma: a => `<g stroke="${a}" stroke-width="12" stroke-linecap="round" opacity=".8">
    <path d="M300 250 L300 120"/><path d="M170 300 L70 230"/><path d="M430 300 L530 230"/>
    <path d="M150 440 L40 440"/><path d="M450 440 L560 440"/></g>
    <circle cx="300" cy="420" r="120" fill="${a}" opacity=".35"/>`,
  hammer: a => `<g transform="rotate(-18 300 430)">
    <rect x="278" y="300" width="44" height="250" rx="14" fill="${a}" opacity=".55"/>
    <rect x="180" y="220" width="240" height="110" rx="18" fill="none" stroke="${a}" stroke-width="10"/>
    <rect x="205" y="245" width="190" height="60" rx="10" fill="${a}" opacity=".3"/></g>`,
  shield: a => `<circle cx="300" cy="430" r="170" fill="none" stroke="${a}" stroke-width="12"/>
    <circle cx="300" cy="430" r="118" fill="none" stroke="${a}" stroke-width="8" opacity=".7"/>
    <circle cx="300" cy="430" r="64" fill="${a}" opacity=".35"/>
    <path d="M300 270 L330 400 L300 430 L270 400 Z" fill="${a}" opacity=".8"/>`,
  web: a => `<g stroke="${a}" stroke-width="4" fill="none" opacity=".75">
    <circle cx="300" cy="400" r="90"/><circle cx="300" cy="400" r="170"/><circle cx="300" cy="400" r="250"/>
    <path d="M300 150 L300 650 M50 400 L550 400 M120 200 L480 600 M480 200 L120 600"/></g>`,
  xgene: a => `<g stroke="${a}" stroke-width="42" stroke-linecap="round" opacity=".8">
    <path d="M170 250 L430 610"/><path d="M430 250 L170 610"/></g>
    <circle cx="300" cy="430" r="215" fill="none" stroke="${a}" stroke-width="6" opacity=".4"/>`,
  four: a => `<text x="300" y="560" text-anchor="middle" font-family="Georgia,serif" font-size="380"
    font-weight="700" fill="${a}" opacity=".55">4</text>
    <circle cx="300" cy="430" r="200" fill="none" stroke="${a}" stroke-width="8" opacity=".6"/>`,
  mask: a => `<path d="M170 300 C170 220 230 180 300 180 C370 180 430 220 430 300
    C430 420 380 560 300 620 C220 560 170 420 170 300 Z" fill="none" stroke="${a}" stroke-width="10" opacity=".8"/>
    <g fill="${a}" opacity=".7"><ellipse cx="242" cy="330" rx="34" ry="18"/><ellipse cx="358" cy="330" rx="34" ry="18"/></g>`,
  horns: a => `<g stroke="${a}" stroke-width="16" fill="none" stroke-linecap="round" opacity=".8">
    <path d="M240 300 C180 200 170 120 200 60"/><path d="M360 300 C420 200 430 120 400 60"/></g>
    <circle cx="300" cy="400" r="120" fill="none" stroke="${a}" stroke-width="8" opacity=".5"/>`,
  mandala: a => `<g fill="none" stroke="${a}" opacity=".75">
    <circle cx="300" cy="420" r="200" stroke-width="8"/><circle cx="300" cy="420" r="140" stroke-width="5" stroke-dasharray="14 12"/>
    <circle cx="300" cy="420" r="80" stroke-width="5"/>
    <path d="M300 220 L300 620 M100 420 L500 420 M160 280 L440 560 M440 280 L160 560" stroke-width="4"/></g>`,
  star: a => `<path d="M300 210 L352 372 L524 372 L386 474 L438 638 L300 538 L162 638 L214 474 L76 372 L248 372 Z"
    fill="none" stroke="${a}" stroke-width="10" opacity=".8"/>
    <circle cx="300" cy="430" r="215" fill="none" stroke="${a}" stroke-width="4" opacity=".35"/>`,
  panther: a => `<path d="M180 300 C180 220 240 180 300 180 C360 180 420 220 420 300 Z" fill="${a}" opacity=".35"/>
    <path d="M200 250 L180 150 L250 200 Z" fill="${a}" opacity=".7"/><path d="M400 250 L420 150 L350 200 Z" fill="${a}" opacity=".7"/>
    <g stroke="${a}" stroke-width="10" fill="none" opacity=".6"><path d="M180 500 C260 560 340 560 420 500"/></g>`,
  ant: a => `<g fill="none" stroke="${a}" stroke-width="9" opacity=".8">
    <ellipse cx="300" cy="430" rx="90" ry="110"/><path d="M210 430 L110 380 M210 460 L110 480 M390 430 L490 380 M390 460 L490 480"/></g>
    <circle cx="300" cy="330" r="40" fill="${a}" opacity=".6"/>`,
  symbiote: a => `<path d="M300 180 C420 200 470 320 440 440 C410 560 370 620 300 660 C230 620 190 560 160 440 C130 320 180 200 300 180 Z"
    fill="none" stroke="${a}" stroke-width="10" opacity=".8"/>
    <g fill="${a}" opacity=".7"><path d="M240 400 L280 440 L240 480 Z"/><path d="M360 400 L320 440 L360 480 Z"/></g>`,
  blade: a => `<g transform="rotate(-32 300 430)">
    <rect x="292" y="150" width="20" height="420" rx="6" fill="${a}" opacity=".75"/>
    <rect x="250" y="560" width="104" height="24" rx="8" fill="${a}" opacity=".5"/></g>`,
  flame: a => `<path d="M300 180 C400 300 350 360 400 440 C440 510 400 610 300 640 C200 610 160 510 200 440 C250 360 200 300 300 180 Z"
    fill="none" stroke="${a}" stroke-width="10" opacity=".8"/>
    <path d="M300 300 C350 370 320 400 350 460 C370 510 340 560 300 570 C260 560 230 510 250 460 C280 400 250 370 300 300 Z" fill="${a}" opacity=".4"/>`,
  rings: a => `<g fill="none" stroke="${a}" opacity=".8">
    <ellipse cx="300" cy="400" rx="190" ry="60" stroke-width="12" transform="rotate(-16 300 400)"/>
    <ellipse cx="300" cy="470" rx="160" ry="50" stroke-width="10" transform="rotate(12 300 470)"/>
    <ellipse cx="300" cy="540" rx="130" ry="40" stroke-width="8" transform="rotate(-6 300 540)"/></g>`,
  cosmic: a => `<g fill="${a}" opacity=".8"><circle cx="180" cy="260" r="6"/><circle cx="460" cy="300" r="5"/>
    <circle cx="360" cy="180" r="4"/><circle cx="150" cy="520" r="5"/><circle cx="470" cy="560" r="6"/></g>
    <g fill="none" stroke="${a}" opacity=".6"><circle cx="300" cy="430" r="180" stroke-width="6"/>
    <ellipse cx="300" cy="430" rx="230" ry="70" stroke-width="5" transform="rotate(-20 300 430)"/></g>`,
  stones: a => `<g opacity=".85">
    <circle cx="200" cy="330" r="34" fill="#8a5cf6"/><circle cx="300" cy="290" r="34" fill="#4a90d9"/>
    <circle cx="400" cy="330" r="34" fill="#e23636"/><circle cx="230" cy="460" r="34" fill="#f7c948"/>
    <circle cx="370" cy="460" r="34" fill="#2fd39a"/><circle cx="300" cy="560" r="34" fill="#ff7a2f"/></g>
    <circle cx="300" cy="430" r="215" fill="none" stroke="${a}" stroke-width="6" opacity=".5"/>`,
  avengers: a => `<text x="300" y="560" text-anchor="middle" font-family="Georgia,serif" font-size="380"
    font-weight="700" fill="none" stroke="${a}" stroke-width="8" opacity=".8">A</text>
    <path d="M300 200 L420 260 L420 400" fill="none" stroke="${a}" stroke-width="10" opacity=".6"/>`,
  hourglass: a => `<g fill="none" stroke="${a}" stroke-width="10" opacity=".8">
    <path d="M220 240 h160 M220 620 h160"/><path d="M230 250 L370 610 M370 250 L230 610"/></g>
    <path d="M300 430 L340 520 L260 520 Z" fill="${a}" opacity=".5"/>`,
  wings: a => `<g fill="none" stroke="${a}" stroke-width="9" opacity=".8">
    <path d="M280 300 C180 280 110 350 90 450 C180 430 220 470 230 540 C270 460 280 380 280 300 Z"/>
    <path d="M320 300 C420 280 490 350 510 450 C420 430 380 470 370 540 C330 460 320 380 320 300 Z"/></g>`,
  bolt: a => `<path d="M340 180 L200 470 L290 470 L180 720 L400 400 L300 400 L400 180 Z" fill="${a}" opacity=".6"/>`,
  mech: a => `<g fill="none" stroke="${a}" stroke-width="9" opacity=".8">
    <rect x="200" y="250" width="200" height="150" rx="16"/><rect x="228" y="292" width="144" height="36" rx="8" fill="${a}" opacity=".5"/>
    <path d="M180 250 L130 190 M420 250 L470 190"/></g><circle cx="130" cy="190" r="12" fill="${a}"/><circle cx="470" cy="190" r="12" fill="${a}"/>`,
  generic: a => `<g fill="none" stroke="${a}" opacity=".7">
    <rect x="150" y="260" width="300" height="340" rx="18" stroke-width="8"/>
    <path d="M150 400 H450 M300 260 V600" stroke-width="5" opacity=".5"/>
    <circle cx="375" cy="330" r="26" fill="${a}" opacity=".6" stroke="none"/></g>`
};

function motifKey(f) {
  const t = (f.title || "") + " " + (f.en || "");
  const rules = [
    [/复仇者/, "avengers"], [/无限战争|终局之战/, "stones"], [/钢铁侠/, "reactor"], [/浩克|无敌/, "gamma"],
    [/雷神/, "hammer"], [/美国队长|美队/, "shield"], [/蜘蛛/, "web"], [/X战警|金刚狼|死侍|变种|新变种/, "xgene"],
    [/神奇四侠/, "four"], [/洛基/, "horns"], [/奇异博士/, "mandala"], [/银河护卫队/, "star"],
    [/黑豹/, "panther"], [/蚁人/, "ant"], [/毒液/, "symbiote"], [/刀锋/, "blade"], [/恶灵骑士|霹雳火/, "flame"],
    [/尚气/, "rings"], [/永恒族/, "cosmic"], [/惊奇队长/, "star"], [/黑寡妇/, "hourglass"], [/猎鹰|冬兵/, "wings"],
    [/雷霆/, "bolt"], [/哨兵|奥创|机器人/, "mech"], [/卡特|特工/, "shield"]
  ];
  for (const [re, k] of rules) if (re.test(t)) return k;
  return "generic";
}

/* 中文标题断行:按长度自适应字号 */
function titleLines(title) {
  const t = String(title || "");
  const parts = t.split(/[:：]/).filter(Boolean);
  const lines = [];
  let font = 58;
  if (t.length <= 7) { lines.push(t); font = 62; }
  else if (t.length <= 14) {
    if (parts.length === 2) { lines.push(parts[0] + ":"); lines.push(parts[1]); }
    else { const mid = Math.ceil(t.length / 2); lines.push(t.slice(0, mid)); lines.push(t.slice(mid)); }
    font = 52;
  } else {
    if (parts.length >= 2) { lines.push(parts[0] + ":"); const rest = parts.slice(1).join(""); 
      const mid = Math.ceil(rest.length / 2); lines.push(rest.slice(0, mid)); lines.push(rest.slice(mid)); }
    else { const step = Math.ceil(t.length / 3); for (let i = 0; i < t.length; i += step) lines.push(t.slice(i, i + step)); }
    font = 42;
  }
  return { lines: lines.slice(0, 3), font };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let n = 0;
for (const f of ALL) {
  if (!f.id) continue;
  const a = studioColor(f.studio);
  const rel = REL[f.rel] || REL.minor;
  const { lines, font } = titleLines(f.title);
  const motif = (M[motifKey(f)] || M.generic)(a);

  /* 标题从底部往上排 */
  const baseY = 700;
  const lh = font * 1.24;
  const titleSvg = lines.map((ln, i) =>
    `<text x="52" y="${(baseY - (lines.length - 1 - i) * lh).toFixed(0)}" font-size="${font}" font-weight="900"
      fill="#ffffff" letter-spacing="1">${ln.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${f.title} 海报">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#0d141b"/><stop offset="52%" stop-color="#070b10"/><stop offset="100%" stop-color="#04070a"/>
    </linearGradient>
    <linearGradient id="plane" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}" stop-opacity=".42"/><stop offset="100%" stop-color="${a}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#04070a" stop-opacity="0"/><stop offset="100%" stop-color="#04070a" stop-opacity=".96"/>
    </linearGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#ffffff" opacity="0.028"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <path d="M0 ${H} L${W} ${H * 0.42} L${W} ${H} Z" fill="url(#plane)"/>
  <path d="M0 ${H * 0.72} L${W} ${H * 0.30} L${W} ${H * 0.30} L0 ${H * 0.72} Z" fill="${a}" opacity=".10"/>
  <g>${motif}</g>
  <rect width="${W}" height="${H}" fill="url(#foot)"/>
  <rect width="${W}" height="7" fill="${rel.c}"/>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#ffffff" stroke-opacity=".10"/>

  ${titleSvg}
  <text x="52" y="${(baseY + 44).toFixed(0)}" font-size="19" font-family="Georgia,serif" letter-spacing="2.5"
    fill="#9fb3c0">${String(f.en || "").toUpperCase().replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>
  <text x="52" y="${H - 42}" font-size="17" fill="#7d8f9c">${f.year} · ${String(f.studio).replace(/&/g, "&amp;")}</text>
  <g>
    <rect x="${W - 150}" y="${H - 62}" width="98" height="28" rx="14" fill="${rel.c}" opacity=".22"/>
    <text x="${W - 101}" y="${H - 42}" text-anchor="middle" font-size="14" fill="${rel.c}">${rel.name}</text>
  </g>
  ${f.isTV || /Disney\+/.test(f.studio || "") && !f.phase ? `<text x="${W - 52}" y="52" text-anchor="end" font-size="15" fill="#8fa4b8">剧集</text>` : ""}
  ${f.status === "upcoming" ? `<text x="${W - 52}" y="52" text-anchor="end" font-size="15" fill="#f7c948">待映</text>` : ""}
</svg>`;
  fs.writeFileSync(path.join(OUT_DIR, f.id + ".svg"), svg, "utf8");
  n++;
}
console.log("OK - 生成 " + n + " 张作品海报 → assets/img/posters/");
const kb = fs.readdirSync(OUT_DIR).reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0) / 1024;
console.log("   合计 " + kb.toFixed(0) + "KB(平均 " + (kb / n).toFixed(1) + "KB/张)");

/* ------------------ 官方海报覆盖清单 ------------------
   把官方海报存成 <id>.jpg / .png / .webp 放进本目录,就会自动优先使用。
   这里扫一遍目录生成 overrides.json,前端只读这一次(避免 103 张图逐个探测)。 */
const exts = [".jpg", ".jpeg", ".png", ".webp"];
const overrides = {};
for (const f of fs.readdirSync(OUT_DIR)) {
  const ext = path.extname(f).toLowerCase();
  if (!exts.includes(ext)) continue;
  const id = path.basename(f, ext);
  overrides[id] = f;
}
fs.writeFileSync(path.join(OUT_DIR, "overrides.json"), JSON.stringify(overrides), "utf8");
const ovCount = Object.keys(overrides).length;
console.log("OK - 覆盖清单 assets/img/posters/overrides.json(" + (ovCount ? ovCount + " 张自定义海报" : "暂无自定义海报,全部使用生成的 SVG") + ")");

/* ------------------ 海报替换清单 ------------------ */
const rowsMd = ALL.filter(f => f.id).map((f, i) =>
  "| " + (i + 1) + " | " + f.title + " | " + f.year + " | `" + f.id + ".jpg` |");
fs.writeFileSync(path.join(OUT_DIR, "图片清单.md"),
  `# 作品海报替换清单(${rowsMd.length} 部)

想换成**官方海报**:把图片存进本目录,文件名照下表即可,前端会自动优先使用 —— 不用改代码。

- 优先级:\`<id>.jpg\` / \`<id>.png\` / \`<id>.webp\`(读了 \`overrides.json\` 判断)→ 否则用生成的 SVG 海报
- 建议尺寸:竖版 2:3(例如 600×900 或 800×1200),单张尽量 < 300KB
- 加完图后重新运行一次 \`node build-poster-art.mjs\` 刷新清单即可

> ⚠️ 版权提醒:官方海报受版权保护,是否使用由站主自行决定。

| # | 作品 | 年份 | 放入本目录的文件名 |
|---|---|---|---|
${rowsMd.join("\n")}
`, "utf8");
console.log("OK - 已更新 assets/img/posters/图片清单.md");


