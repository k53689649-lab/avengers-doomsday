/* =========================================================
   把网站更新到 GitHub(纯 REST API,无需 git 直连)
   用途:本机到 github.com 的 443 直连若被网络环境拦截,可用本脚本推送。

   用法(PowerShell):
     $env:GH_TOKEN="ghp_你的令牌"
     node push-to-github.mjs

   可选环境变量:
     GH_OWNER   默认 k53689649-lab
     GH_REPO    默认 kumiko-doomsday
     GH_PRIVATE 默认 false(仅仓库不存在时用于创建)
     GH_PAGES   默认 false;设为 true 会在推送后尝试开启 GitHub Pages

   说明:脚本会把当前目录下所有文件(忽略 .git/node_modules)作为一次提交推送到 main 分支,
        中文文件名与中文内容均按 UTF-8 正确处理。
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const TOKEN = process.env.GH_TOKEN;
const OWNER = process.env.GH_OWNER || "k53689649-lab";
const REPO = process.env.GH_REPO || "kumiko-doomsday";
const PRIVATE = String(process.env.GH_PRIVATE || "false") === "true";
const ENABLE_PAGES = String(process.env.GH_PAGES || "false") === "true";
const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

if (!TOKEN) { console.error("缺少 GH_TOKEN 环境变量。示例:$env:GH_TOKEN=\"ghp_xxx\"; node push-to-github.mjs"); process.exit(1); }

const API = "https://api.github.com";
const H = {
  Authorization: "Bearer " + TOKEN,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "push-to-github",
  "Content-Type": "application/json; charset=utf-8",
};

async function api(method, url, body) {
  const res = await fetch(API + url, {
    method, headers: H,
    body: body ? Buffer.from(JSON.stringify(body), "utf8") : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* 非 JSON 响应 */ }
  return { ok: res.ok, status: res.status, json, text };
}

function walk(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", ".netlify"].includes(e.name)) continue;
    const rel = base ? base + "/" + e.name : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, rel));
    else out.push({ rel, full });
  }
  return out;
}

const me = await api("GET", "/user");
if (!me.ok) { console.error("令牌无效:" + me.status + " " + me.text.slice(0, 200)); process.exit(1); }
console.log("✓ 令牌有效,账号:" + me.json.login);

const repoInfo = await api("GET", `/repos/${OWNER}/${REPO}`);
if (!repoInfo.ok) {
  const created = await api("POST", "/user/repos", {
    name: REPO, private: PRIVATE, has_issues: true, has_wiki: false, auto_init: false,
    description: "《复仇者联盟5:毁灭之日》观影指南 —— 漫威全作品补课 + 角色图鉴 + 留言提问板(纯静态站)",
  });
  if (!created.ok) { console.error("创建仓库失败:" + created.status + " " + created.text.slice(0, 300)); process.exit(1); }
  console.log("✓ 仓库已创建:" + created.json.html_url);
} else {
  console.log("· 仓库已存在:" + repoInfo.json.html_url);
}

const files = walk(ROOT);
console.log("准备上传 " + files.length + " 个文件…");
const tree = [];
for (const f of files) {
  const b = await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
    content: fs.readFileSync(f.full).toString("base64"), encoding: "base64",
  });
  if (!b.ok) { console.error("上传失败 " + f.rel + ":" + b.status + " " + b.text.slice(0, 200)); process.exit(1); }
  tree.push({ path: f.rel, mode: "100644", type: "blob", sha: b.json.sha });
}

const ref = await api("GET", `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
const parents = ref.ok ? [ref.json.object.sha] : [];
let base_tree;
if (parents.length) {
  const head = await api("GET", `/repos/${OWNER}/${REPO}/git/commits/${parents[0]}`);
  if (head.ok) base_tree = head.json.tree.sha;
} else {
  // 空仓库需要先初始化一次提交,Git Data API 才能使用
  const init = await api("PUT", `/repos/${OWNER}/${REPO}/contents/.gitkeep`, { message: "chore: 初始化仓库", content: "", branch: "main" });
  if (!init.ok) { console.error("初始化空仓库失败:" + init.status + " " + init.text.slice(0, 200)); process.exit(1); }
  const ref2 = await api("GET", `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  parents.push(ref2.json.object.sha);
  const head2 = await api("GET", `/repos/${OWNER}/${REPO}/git/commits/${parents[0]}`);
  if (head2.ok) base_tree = head2.json.tree.sha;
}

const treeRes = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, base_tree ? { base_tree, tree } : { tree });
if (!treeRes.ok) { console.error("创建 tree 失败:" + treeRes.status + " " + treeRes.text.slice(0, 300)); process.exit(1); }

const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
const commitRes = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
  message: "update: 站点内容更新(" + stamp + ")",
  tree: treeRes.json.sha,
  parents,
});
if (!commitRes.ok) { console.error("创建 commit 失败:" + commitRes.status + " " + commitRes.text.slice(0, 300)); process.exit(1); }

const upd = await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/main`, { sha: commitRes.json.sha, force: false });
if (!upd.ok) { console.error("更新分支失败:" + upd.status + " " + upd.text.slice(0, 300)); process.exit(1); }

console.log("✓ 推送完成:https://github.com/" + OWNER + "/" + REPO);

if (ENABLE_PAGES) {
  const p = await api("POST", `/repos/${OWNER}/${REPO}/pages`, { source: { branch: "main", path: "/" } });
  console.log(p.ok || p.status === 409 ? "· Pages 已配置(若用 GitHub Actions 部署,请确认 .github/workflows/pages.yml 存在)" : "· Pages 配置跳过(" + p.status + ")");
}
