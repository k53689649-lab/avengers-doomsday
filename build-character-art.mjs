/* =========================================================
   生成角色立绘背景图(原创 SVG,每人一张)
   用法:node build-character-art.mjs
   输出:assets/img/chars/<id>.svg
   说明:想换成自己的图,把图片存成 assets/img/chars/<id>.jpg 即可(前端会优先用 jpg)
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const OUT_DIR = path.join(DIR, "assets/img/chars");

const load = f => fs.readFileSync(path.join(DIR, "assets/js", f), "utf8");
const ctx = {};
new Function("window", "document", load("data-characters.js") + "\n" + load("data-char-art.js") +
  "\nthis.TRAILER_CHARS=TRAILER_CHARS; this.PREDICTED_CHARS=PREDICTED_CHARS; this.CHAR_ART=CHAR_ART;")
  .call(ctx, {}, {});
const CHARS = [...ctx.TRAILER_CHARS, ...ctx.PREDICTED_CHARS].filter(c => ctx.CHAR_ART[c.name]);

/* ------------------ 造型片段 ------------------ */
const W = 900, H = 1200;
/* 人物剪影:用主题色渐变填充(发光的背影人物),深色背景上一眼能认出 */
const head = `<ellipse cx="450" cy="500" rx="134" ry="160" fill="url(#fig)"/>
  <rect x="396" y="640" width="108" height="90" fill="url(#fig)"/>
  <path d="M130 1200 C158 900 300 828 450 828 C600 828 742 900 770 1200 Z" fill="url(#fig)"/>`;

const rim = a => `<path d="M316 500 C316 412 374 340 450 340" fill="none" stroke="#ffffff" stroke-opacity=".38" stroke-width="8" filter="url(#soft2)"/>
  <path d="M584 500 C584 412 526 340 450 340" fill="none" stroke="${a}" stroke-opacity=".85" stroke-width="9" filter="url(#soft2)"/>
  <path d="M130 1200 C158 900 300 828 450 828" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="9" filter="url(#soft2)"/>`;

function face(a) {
  return `<g fill="#03100b" opacity=".85">
    <path d="M360 470 C400 448 438 458 452 482 C430 504 388 510 360 496 Z"/>
    <path d="M540 470 C500 448 462 458 448 482 C470 504 512 510 540 496 Z"/>
  </g>
  <g fill="#ffffff" opacity=".92">
    <path d="M368 476 C400 458 430 466 442 484 C424 498 394 502 368 490 Z"/>
    <path d="M532 476 C500 458 470 466 458 484 C476 498 506 502 532 490 Z"/>
  </g>`;
}
const ART = {
  mask: a => `${face(a)}<g fill="#0d3a2a" opacity=".85">
      <rect x="418" y="530" width="12" height="52" rx="4"/><rect x="444" y="530" width="12" height="58" rx="4"/>
      <rect x="470" y="530" width="12" height="52" rx="4"/></g>`,
  hammer: a => `<g transform="rotate(-18 700 620)" opacity=".85">
      <rect x="672" y="470" width="60" height="200" rx="10" fill="#3a3f47"/>
      <rect x="618" y="368" width="168" height="104" rx="14" fill="${a}" fill-opacity=".55" stroke="${a}" stroke-width="4"/>
      <path d="M700 300 L716 100 L684 100 Z" fill="#3a3f47" opacity=".0"/></g>
    <g stroke="${a}" stroke-opacity=".5" stroke-width="4" fill="none">
      <path d="M700 340 L690 210 L740 150"/><path d="M736 360 L780 250 L760 180"/></g>`,
  shield: a => `<g><circle cx="700" cy="640" r="132" fill="#22303d"/>
      <circle cx="700" cy="640" r="132" fill="none" stroke="${a}" stroke-width="10"/>
      <circle cx="700" cy="640" r="96" fill="none" stroke="#e8eef5" stroke-width="12" stroke-opacity=".75"/>
      <circle cx="700" cy="640" r="58" fill="${a}" fill-opacity=".8"/>
      <path d="M700 516 L724 610 L700 640 L676 610 Z" fill="#f2f6fa" opacity=".85"/></g>`,
  stretch: a => `<g stroke="${a}" stroke-width="16" fill="none" stroke-linecap="round" opacity=".6">
      <path d="M250 1080 C140 940 180 800 300 730"/><path d="M650 1080 C760 940 720 800 600 730"/></g>
    <circle cx="450" cy="470" r="150" fill="none" stroke="${a}" stroke-opacity=".25" stroke-width="3" stroke-dasharray="14 12"/>`,
  forcefield: a => `<g fill="none" stroke="${a}">
      <circle cx="450" cy="560" r="300" stroke-opacity=".28" stroke-width="4"/>
      <circle cx="450" cy="560" r="380" stroke-opacity=".18" stroke-width="3"/>
      <circle cx="450" cy="560" r="460" stroke-opacity=".10" stroke-width="3"/>
      <circle cx="450" cy="560" r="220" stroke-opacity=".40" stroke-width="5"/></g>`,
  rock: a => `<g fill="${a}" opacity=".28">
      <path d="M600 860 L700 820 L742 900 L676 950 Z"/><path d="M250 900 L340 858 L372 940 L286 982 Z"/>
      <path d="M640 1000 L740 962 L780 1050 L690 1096 Z"/></g>
    <path d="M168 1200 C192 872 318 748 450 748 C582 748 708 872 732 1200 Z" fill="none" stroke="${a}" stroke-opacity=".3" stroke-width="6"/>`,
  flame: a => `<g opacity=".8">
      <path d="M640 700 C700 600 660 520 720 430 C742 520 812 560 780 690 C758 780 690 800 640 700 Z" fill="${a}" fill-opacity=".5"/>
      <path d="M676 686 C712 616 690 566 726 508 C740 566 786 592 766 676 C754 726 706 740 676 686 Z" fill="#ffd08a" fill-opacity=".7"/></g>`,
  rings: a => `<g fill="none" stroke="${a}" stroke-width="12" stroke-opacity=".75">
      <ellipse cx="450" cy="700" rx="230" ry="70" transform="rotate(-14 450 700)"/>
      <ellipse cx="450" cy="760" rx="196" ry="58" transform="rotate(10 450 760)"/></g>
    <g fill="none" stroke="#ffd98a" stroke-width="4" stroke-opacity=".8"><circle cx="450" cy="470" r="168"/></g>`,
  cards: a => `<g>
      <rect x="600" y="820" width="90" height="130" rx="12" fill="#f2f6fa" transform="rotate(-16 645 885)" opacity=".85"/>
      <rect x="660" y="800" width="90" height="130" rx="12" fill="${a}" transform="rotate(8 705 865)" opacity=".75"/>
      <rect x="576" y="772" width="90" height="130" rx="12" fill="#20272e" transform="rotate(-34 621 837)" stroke="${a}" stroke-width="3"/></g>`,
  telepath: a => `<g fill="none" stroke="${a}" stroke-width="5" stroke-opacity=".55">
      <circle cx="450" cy="400" r="200" stroke-dasharray="10 14"/><circle cx="450" cy="400" r="262" stroke-dasharray="6 18"/></g>
    <g fill="${a}" opacity=".5"><circle cx="450" cy="190" r="7"/><circle cx="642" cy="400" r="6"/><circle cx="258" cy="400" r="6"/></g>`,
  helmet: a => `<g><path d="M322 470 C322 360 380 296 450 296 C520 296 578 360 578 470 Z" fill="#3a3f47"/>
      <path d="M330 462 C330 372 384 312 450 312 C516 312 570 372 570 462 Z" fill="${a}" fill-opacity=".35"/>
      <rect x="352" y="404" width="196" height="46" rx="10" fill="#101418"/>
      <path d="M300 470 L600 470" stroke="${a}" stroke-width="7" stroke-opacity=".7"/></g>`,
  visor: a => `<g><rect x="330" y="430" width="240" height="58" rx="16" fill="#101418"/>
      <rect x="344" y="442" width="212" height="34" rx="12" fill="${a}" fill-opacity=".85"/>
      <rect x="344" y="452" width="212" height="10" rx="6" fill="#ff7a7a" fill-opacity=".9"/></g>`,
  claw: a => `<g stroke="${a}" stroke-width="18" fill="none" stroke-linecap="round" opacity=".7">
      <path d="M180 700 C280 760 300 880 250 1000"/><path d="M240 700 C340 770 360 890 310 1010"/>
      <path d="M300 700 C400 780 420 900 370 1020"/></g>`,
  horns: a => `<g stroke="${a}" stroke-width="16" fill="none" stroke-linecap="round" opacity=".85">
      <path d="M382 350 C330 250 316 170 344 110"/><path d="M518 350 C570 250 584 170 556 110"/></g>
    <g fill="${a}" opacity=".35"><path d="M344 110 l-26 30 h52 Z"/><path d="M556 110 l-26 30 h52 Z"/></g>`,
  wings: a => `<g fill="${a}" opacity=".3" stroke="${a}" stroke-width="4">
      <path d="M300 760 C160 700 90 780 70 900 C160 880 200 930 214 1010 C280 930 300 850 300 760 Z"/>
      <path d="M600 760 C740 700 810 780 830 900 C740 880 700 930 686 1010 C620 930 600 850 600 760 Z"/></g>`,
  metalarm: a => `<g><path d="M640 820 C720 850 760 930 742 1040 C724 1130 660 1180 596 1180 L596 1080 C648 1076 682 1030 682 960 C682 900 660 866 620 848 Z" fill="#6c7784"/>
      <g stroke="${a}" stroke-width="5" fill="none" opacity=".8"><path d="M632 862 L700 902"/><path d="M620 926 L738 972"/><path d="M616 1000 L742 1040"/></g>
      <g fill="${a}" opacity=".9"><circle cx="700" cy="902" r="9"/><circle cx="736" cy="972" r="9"/><circle cx="740" cy="1040" r="9"/></g></g>`,
  hourglass: a => `<g><path d="M414 900 L486 900 L450 1012 Z" fill="${a}" fill-opacity=".85"/>
      <path d="M414 1124 L486 1124 L450 1012 Z" fill="${a}" fill-opacity=".5"/>
      <path d="M400 880 h100 M400 1144 h100" stroke="#e8eef5" stroke-width="7"/></g>
    <g stroke="${a}" stroke-opacity=".4" stroke-width="4" fill="none"><circle cx="450" cy="700" r="180" stroke-dasharray="8 16"/></g>`,
  feline: a => `<g fill="#0b0f14" stroke="${a}" stroke-width="4">
      <path d="M360 322 l-16 -86 l72 44 Z"/><path d="M540 322 l16 -86 l-72 44 Z"/></g>
    <g stroke="${a}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".65">
      <path d="M640 720 C700 790 706 900 660 990"/><path d="M690 700 C760 780 768 900 716 1000"/></g>`,
  trident: a => `<g stroke="${a}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".8">
      <path d="M700 1180 L700 560"/><path d="M620 620 L620 470"/><path d="M780 620 L780 470"/>
      <path d="M620 620 C620 560 640 520 700 500 C760 520 780 560 780 620"/></g>
    <g stroke="${a}" stroke-opacity=".35" stroke-width="5" fill="none"><path d="M240 1120 C320 1000 300 900 220 830"/><path d="M300 1160 C400 1020 380 900 300 800"/></g>`,
  antenna: a => `<g><path d="M382 330 C330 250 320 180 344 120" stroke="${a}" stroke-width="12" fill="none"/>
      <path d="M518 330 C570 250 580 180 556 120" stroke="${a}" stroke-width="12" fill="none"/>
      <circle cx="344" cy="116" r="14" fill="${a}"/><circle cx="556" cy="116" r="14" fill="${a}"/></g>
    <rect x="352" y="430" width="196" height="60" rx="18" fill="#101418"/>
    <rect x="366" y="444" width="168" height="32" rx="12" fill="${a}" fill-opacity=".8"/>`,
  gamma: a => `<g stroke="${a}" stroke-width="12" stroke-linecap="round" opacity=".6">
      <path d="M450 200 L450 90"/><path d="M330 240 L270 150"/><path d="M570 240 L630 150"/></g>
    <g fill="${a}" opacity=".28"><circle cx="450" cy="700" r="300"/><circle cx="450" cy="700" r="220"/></g>`,
  bolt: a => `<g fill="${a}" opacity=".8"><path d="M520 340 L400 620 L480 620 L380 900 L560 560 L470 560 L560 340 Z"/></g>
    <g fill="none" stroke="${a}" stroke-opacity=".35" stroke-width="5"><circle cx="450" cy="700" r="230"/></g>`,
  mech: a => `<g><rect x="352" y="352" width="196" height="150" rx="14" fill="#2b333c" stroke="${a}" stroke-width="5"/>
      <rect x="376" y="392" width="148" height="34" rx="8" fill="${a}" fill-opacity=".85"/>
      <rect x="376" y="444" width="148" height="12" rx="6" fill="${a}" fill-opacity=".4"/>
      <path d="M340 352 L300 300 M560 352 L600 300" stroke="${a}" stroke-width="7" opacity=".7"/>
      <circle cx="288" cy="286" r="12" fill="${a}"/><circle cx="612" cy="286" r="12" fill="${a}"/></g>`,
  web: a => `<g stroke="${a}" stroke-opacity=".45" stroke-width="3" fill="none">
      <circle cx="450" cy="520" r="150"/><circle cx="450" cy="520" r="260"/><circle cx="450" cy="520" r="370"/>
      <path d="M450 150 L450 900 M140 520 L760 520 M220 280 L680 760 M680 280 L220 760"/></g>`,
  cloak: a => `<g fill="${a}" opacity=".3" stroke="${a}" stroke-width="4">
      <path d="M170 1200 C150 940 250 790 450 748 C650 790 750 940 730 1200 Z"/>
      <path d="M330 790 C300 700 320 620 380 560 L450 660 L520 560 C580 620 600 700 570 790 Z" fill="${a}" fill-opacity=".45"/></g>`,
  chaos: a => `<g fill="none" stroke="${a}" stroke-width="8" opacity=".6">
      <path d="M450 700 C300 620 300 460 430 420 C560 380 620 500 540 560 C470 610 400 560 440 500"/>
      <path d="M450 900 C620 960 700 820 620 720" /></g>
    <g fill="${a}" opacity=".35"><circle cx="450" cy="700" r="300"/></g>`,
  mystic: a => `<g fill="none" stroke="${a}" stroke-width="4" opacity=".6">
      <circle cx="450" cy="600" r="260"/><circle cx="450" cy="600" r="190" stroke-dasharray="16 14"/>
      <path d="M450 340 L450 860 M190 600 L710 600 M266 416 L634 784 M634 416 L266 784"/></g>`,
  cosmic: a => `<g fill="#ffffff" opacity=".7">
      <circle cx="250" cy="300" r="4"/><circle cx="700" cy="260" r="3"/><circle cx="640" cy="880" r="4"/>
      <circle cx="280" cy="820" r="3"/><circle cx="760" cy="620" r="3"/><circle cx="180" cy="560" r="3"/></g>
    <g fill="none" stroke="${a}" stroke-width="7" opacity=".55"><ellipse cx="450" cy="640" rx="300" ry="90" transform="rotate(-18 450 640)"/></g>`
};

/* ------------------ 生成:透明背景「纯人像」抠图 ------------------ */
/* 需要画在人物「后面」的造型(氛围类);其余画在人物「前面」(五官/道具类) */
const BACK_ART = new Set(["web", "cloak", "telepath", "forcefield", "stretch", "chaos", "mystic", "cosmic", "gamma", "wings"]);

fs.mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
for (const c of CHARS) {
  const cfg = ctx.CHAR_ART[c.name];
  if (!cfg || !cfg.id) continue;
  const a = cfg.accent, a2 = cfg.accent2 || "#06231a";
  const art = (ART[cfg.art] || ART.mask)(a);
  const artBack = BACK_ART.has(cfg.art) ? art : "";
  const artFront = BACK_ART.has(cfg.art) ? "" : art;

  /* 只有人物本体 + 配件,没有任何背景色块/网格/文字 → 透明底,可直接当抠图用
     viewBox 收紧到人物范围,避免四周留白 */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="70 60 760 1140" width="760" height="1140" role="img" aria-label="${c.name} 人物立绘(透明底)">
  <defs>
    <linearGradient id="fig" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="${a}" stop-opacity=".98"/>
      <stop offset="45%" stop-color="${a}" stop-opacity=".72"/>
      <stop offset="100%" stop-color="${a2}" stop-opacity=".98"/>
    </linearGradient>
    <filter id="soft2" x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <g filter="url(#drop)">
    ${artBack}
    <g>${head}</g>
    ${rim(a)}
    ${artFront}
  </g>
</svg>`;
  fs.writeFileSync(path.join(OUT_DIR, cfg.id + ".svg"), svg, "utf8");
  count++;
}
console.log("OK - 生成 " + count + " 张透明底人物立绘 → assets/img/chars/");
console.log("   角色:" + CHARS.map(c => ctx.CHAR_ART[c.name].id).join(", "));
