/* =========================================================
   构建单文件版:把 CSS / JS 全部内联进 HTML
   产出可直接分享的单文件:
     1) 门户页-单文件版.html                 (封面 + 两个入口)
     2) 复仇者联盟5观影指南-单文件版.html      (前瞻主站)
     3) 留言提问板-单文件版.html              (留言板)
   用法: node build-single-file.mjs
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const read = p => fs.readFileSync(path.join(dir, p), "utf8");

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

/* 把角色立绘打包成 data URI,单文件版才能显示 */
function charArtDataScript() {
  const charsDir = path.join(dir, "assets/img/chars");
  if (!fs.existsSync(charsDir)) return "";
  const map = {};
  for (const f of fs.readdirSync(charsDir)) {
    if (!f.endsWith(".svg")) continue;
    map[f.replace(/\.svg$/, "")] = "data:image/svg+xml;base64," + fs.readFileSync(path.join(charsDir, f)).toString("base64");
  }
  return "<script>window.CHAR_ART_DATA=" + JSON.stringify(map) + ";</script>\n";
}

/* 把 103 张作品海报打包成 data URI,单文件版才能显示 */
function posterArtDataScript() {
  const postersDir = path.join(dir, "assets/img/posters");
  if (!fs.existsSync(postersDir)) return "";
  const map = {};
  for (const f of fs.readdirSync(postersDir)) {
    if (!f.endsWith(".svg")) continue;
    map[f.replace(/\.svg$/, "")] = "data:image/svg+xml;base64," + fs.readFileSync(path.join(postersDir, f)).toString("base64");
  }
  return "<script>window.POSTER_ART_DATA=" + JSON.stringify(map) + ";</script>\n";
}

function inline(pageFile) {
  let html = read(pageFile);
  html = html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (m, href) => {
    if (/^https?:/.test(href)) return m;
    return "<style>\n" + read(href) + "\n</style>";
  });
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    if (/^https?:/.test(src)) return m;
    return "<script>\n" + read(src) + "\n</script>";
  });
  // 单文件版:去掉响应式封面(只保留竖版原图),避免内联两张封面导致体积翻倍
  html = html.replace(/<source[^>]*srcset="assets\/img\/[^"]*"[^>]*>\s*/g, "");
  // 图片资源内联为 data URI(单文件版才能脱离文件夹独立运行)
  html = html.replace(/src="(assets\/img\/[^"]+)"/g, (m, src) => {
    let full = path.join(dir, src);
    if (!fs.existsSync(full)) {
      // 可选封面(cover.jpg)缺失时,回退到同名的原创插画 cover.svg
      const alt = full.replace(/\.[a-z0-9]+$/i, ".svg");
      if (fs.existsSync(alt)) full = alt; else return m;
    }
    const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    return 'src="data:' + mime + ";base64," + fs.readFileSync(full).toString("base64") + '"';
  });
  // <source srcset="..."> 里的图片(响应式封面)同样要内联
  html = html.replace(/srcset="(assets\/img\/[^"]+)"/g, (m, src) => {
    const full = path.join(dir, src);
    if (!fs.existsSync(full)) return m;
    const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    return 'srcset="data:' + mime + ";base64," + fs.readFileSync(full).toString("base64") + '"';
  });
  // CSS 里引用的背景图(如 body.photo-bg 的 bg-page.jpg)同样要内联
  html = html.replace(/url\((["']?)\.\.\/img\/([^"')]+)\1\)/g, (m, q, file) => {
    const full = path.join(dir, "assets/img", file);
    if (!fs.existsSync(full)) return m;
    const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    return "url(data:" + mime + ";base64," + fs.readFileSync(full).toString("base64") + ")";
  });
  html = html.replace(/url\((["']?)assets\/img\/([^"')]+)\1\)/g, (m, q, file) => {
    const full = path.join(dir, "assets/img", file);
    if (!fs.existsSync(full)) return m;
    const mime = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    return "url(data:" + mime + ";base64," + fs.readFileSync(full).toString("base64") + ")";
  });
  // 角色立绘 + 作品海报(仅前瞻页需要):注入 data URI 映射,放在 </body> 前
  if (pageFile === "guide.html") {
    const arts = charArtDataScript() + posterArtDataScript();
    if (arts) html = html.replace(/<\/body>/, arts + "</body>");
  }
  return html;
}

const files = {
  portal: "门户页-单文件版.html",
  guide: "复仇者联盟5观影指南-单文件版.html",
  comments: "留言提问板-单文件版.html",
};

const jobs = [
  { src: "index.html", out: files.portal, rewrite: true },
  { src: "guide.html", out: files.guide, rewrite: true },
  { src: "comments.html", out: files.comments, rewrite: true },
];

for (const job of jobs) {
  let html = inline(job.src);
  if (job.rewrite) {
    // 把页面间链接改到对应的单文件版,保证单文件之间可以互相跳转
    html = html.replace(/href="index\.html(#[^"]*)?"/g, 'href="' + encodeURI(files.portal) + '"');
    html = html.replace(/href="guide\.html(#[^"]*)?"/g, 'href="' + encodeURI(files.guide) + '"');
    html = html.replace(/href="comments\.html"/g, 'href="' + encodeURI(files.comments) + '"');
  }
  fs.writeFileSync(path.join(dir, job.out), html, "utf8");
  const leftOver = (html.match(/(src|href)="assets\//g) || []).length;
  console.log(
    "written: " + job.out + "  " + (html.length / 1024).toFixed(1) + "KB" +
    " | 残留内部资源引用: " + leftOver +
    " | 内联检查: " + (html.includes("<style>") && html.includes("<script>"))
  );
}
