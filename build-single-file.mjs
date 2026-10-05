/* =========================================================
   构建单文件版:把 CSS / JS 全部内联进 HTML
   产出两个可独立分享的文件:
     1) 复仇者联盟5观影指南-单文件版.html   (主站)
     2) 留言提问板-单文件版.html            (留言板)
   用法: node build-single-file.mjs
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const read = p => fs.readFileSync(path.join(dir, p), "utf8");

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
  return html;
}

const jobs = [
  ["index.html", "复仇者联盟5观影指南-单文件版.html"],
  ["comments.html", "留言提问板-单文件版.html"],
];

for (const [src, out] of jobs) {
  const html = inline(src);
  fs.writeFileSync(path.join(dir, out), html, "utf8");
  const leftOver = (html.match(/(src|href)="assets\//g) || []).length;
  console.log(
    "written: " + out + "  " + (html.length / 1024).toFixed(1) + "KB" +
    " | 残留外部引用: " + leftOver +
    " | 内联检查: " + (html.includes("<style>") && html.includes("<script>"))
  );
}
