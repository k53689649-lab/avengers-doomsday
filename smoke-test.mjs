/* =========================================================
   冒烟测试:不依赖浏览器,用最小 DOM 桩验证渲染管线与留言板逻辑
   用法: node smoke-test.mjs
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")) + path.sep;
const read = p => fs.readFileSync(dir + p, "utf8");

function makeEl(id) {
  return {
    id: id || "", innerHTML: "", textContent: "", value: "", dataset: {}, style: {},
    className: "", href: "", src: "", rel: "", download: "", click() {}, remove() {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, appendChild() {}, querySelector: () => makeEl(),
    querySelectorAll: () => [], closest: () => null, scrollHeight: 100,
  };
}
function makeDoc() {
  const store = new Map(), listeners = {};
  return {
    readyState: "complete", _store: store,
    _fire(ev) { (listeners[ev] || []).forEach(cb => cb()); },
    querySelector(sel) { if (!store.has(sel)) store.set(sel, makeEl(sel)); return store.get(sel); },
    getElementById(id) { const s = "#" + id; if (!store.has(s)) store.set(s, makeEl(id)); return store.get(s); },
    querySelectorAll() { return []; },
    createElement(tag) { return makeEl(tag); },
    addEventListener(ev, cb) { (listeners[ev] = listeners[ev] || []).push(cb); },
    body: makeEl("body"), head: makeEl("head"),
  };
}

let ok = true;
function check(name, cond, extra = "") {
  console.log((cond ? "PASS " : "FAIL ") + name + (extra ? "  " + extra : ""));
  if (!cond) ok = false;
}

/* ---------- 1. 主站渲染 ---------- */
const filmsSrc = read("assets/js/data-films.js");
const charsSrc = read("assets/js/data-characters.js");
const appSrc = read("assets/js/app.js");
const configSrcTop = read("assets/js/site-config.js");
const charArtSrc = read("assets/js/data-char-art.js");
const data = new Function(filmsSrc + "\n" + charsSrc + "\nreturn {FILMS, TV_SHOWS, TRAILER_CHARS, PREDICTED_CHARS, EASTER_EGGS};")();
const extra = new Function("window", "document", configSrcTop + "\n" + charArtSrc + "\nreturn {SITE_CONFIG: window.SITE_CONFIG, CHAR_ART: CHAR_ART};")(
  { localStorage: { getItem: () => null, setItem() {} } }, {});
const docA = makeDoc();
const winA = {
  scrollTo() {}, scrollY: 0, pageYOffset: 0, addEventListener() {}, ...data,
  SITE_CONFIG: extra.SITE_CONFIG, CHAR_ART: extra.CHAR_ART,
  localStorage: { getItem: () => null, setItem() {} },
};
new Function("window", "document", filmsSrc + "\n" + charsSrc + "\n" + configSrcTop + "\n" + charArtSrc + "\n" + appSrc)(winA, docA);
docA._fire("DOMContentLoaded");

const q = sel => docA.querySelector(sel).innerHTML;
const countCards = (html, cls) => (html.match(new RegExp('class="' + cls + '"', "g")) || []).length;
const countBy = (html, token) => (html.match(new RegExp(token, "g")) || []).length;

const total = data.FILMS.length + data.TV_SHOWS.length;
check("作品卡片渲染 " + total + " 条", countCards(q("#filmsList"), "film-card") === total);
check("作品卡含封面与播放按钮", q("#filmsList").includes("film-poster") && q("#filmsList").includes("poster-play"));
check("播放按钮指向正版平台搜索", /v\.qq\.com\/x\/search\/\?q=/.test(q("#filmsList")));
check("待映影片显示锁而不是播放键", q("#filmsList").includes("poster-soon"));
check("平台选择器已渲染", q("#controls").includes("chip-platform") && q("#controls").includes("哔哩哔哩"));

/* 角色图鉴(PPT 式轮播) */
const trailerN = data.TRAILER_CHARS.length;
check("角色舞台已渲染首位角色", q("#castStage").includes("cast-img") && q("#castStage").includes("cast-body"));
check("角色计数显示 1 / " + trailerN, docA.querySelector("#castPos").textContent === "1 / " + trailerN);
check("角色分组标签渲染", q("#castTabs").includes("预告确认登场") && q("#castTabs").includes("预测登场"));
check("角色索引条 " + trailerN + " 个", countBy(q("#castStrip"), "strip-item") === trailerN);
check("立绘地址指向 chars 目录", /assets\/img\/chars\/doom\.svg/.test(q("#castStage")));

/* 轮播切换 + 平台切换(直接调用暴露的 API) */
winA.GuideApp.castGo(1);
check("切换到第二位角色", docA.querySelector("#castPos").textContent === "2 / " + trailerN);
winA.GuideApp.castGo(-1);
check("可以退回第一位", docA.querySelector("#castPos").textContent === "1 / " + trailerN);
check("切换分组到预测角色", (() => {
  winA.GuideApp.state.castTab = "predicted";
  winA.GuideApp.state.castIndex = 0;
  winA.GuideApp.renderCast();
  return docA.querySelector("#castPos").textContent === "1 / " + data.PREDICTED_CHARS.length;
})());
winA.GuideApp.state.castTab = "trailer";
winA.GuideApp.state.castIndex = 0;
winA.GuideApp.renderCast();

check("路线 / FAQ / 彩蛋 / 速览仍正常", countCards(q("#eggList"), "egg-card") === data.EASTER_EGGS.length &&
  countCards(q("#factGrid"), "fact-card") === 8 && countCards(q("#faqList"), "faq-item") === 8 && countCards(q("#routeList"), "route-item") === 12);
check("复联4加码臻享版条目存在", data.FILMS.some(f => f.id === "endgame2026"));
check("蜘蛛侠4含凤凰女揭示", (data.FILMS.find(f => f.id === "smbnd").plot || "").includes("琴·葛蕾"));
check("浩克在确认分组、不在预测分组", (() => {
  const inTrailer = data.TRAILER_CHARS.some(c => c.name.includes("绿巨人"));
  const inPredicted = data.PREDICTED_CHARS.some(c => c.name.includes("绿巨人"));
  return inTrailer && !inPredicted;
})());
check("每位角色都配了立绘", data.TRAILER_CHARS.concat(data.PREDICTED_CHARS).every(c => {
  const cfg = extra.CHAR_ART[c.name];
  return cfg && cfg.id && fs.existsSync(dir + "assets/img/chars/" + cfg.id + ".svg");
}));

/* ---------- 2. 留言板 ---------- */
const configSrc = read("assets/js/site-config.js");
const commentsSrc = read("assets/js/comments.js");
const mem = {};
const storage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const docB = makeDoc();
const winB = {
  localStorage: storage,
  sessionStorage: { getItem: () => null, setItem: () => {} },
  addEventListener() {}, confirm: () => true, prompt: () => "测试回复", alert: () => {},
  crypto: globalThis.crypto, TextEncoder: globalThis.TextEncoder,
};
new Function("window", "document", configSrc + "\n" + commentsSrc)(winB, docB);
const board = winB.CommentsBoard;
check("留言板初始化", !!board && typeof board.config.adminPassword === "string");
check("校验:过短内容被拒", board.validate("测试者", "短").ok === false);
check("校验:正常提问通过", board.validate("测试者", "请问复联5需要先补哪几部电影?").ok === true);
check("校验:广告词被拦截", board.validate("测试者", "加微信代刷票请找我哦").ok === false);
board.setComments([{ id: "x", name: "甲", content: "重复内容测试文本", ts: Date.now(), pinned: false }]);
check("校验:重复刷屏被拦截", board.validate("乙", "重复内容测试文本").ok === false);
board.setComments([{ id: "c1", name: "网友甲", content: "洛基那场戏在时间线哪个位置?", type: "提问", ts: Date.now(), pinned: true, reply: "" }]);
board.render();
check("留言列表渲染 + 置顶标记", docB.querySelector("#cmList").innerHTML.includes("网友甲") && docB.querySelector("#cmList").innerHTML.includes("已置顶"));
check("公告空态渲染", docB.querySelector("#announceList").innerHTML.includes("暂无公告"));
board.setAnnouncements([{ id: "a1", text: "测试公告:欢迎提问", time: "2026-08-27" }]);
board.render();
check("公告发布并渲染", docB.querySelector("#announceList").innerHTML.includes("测试公告"));

/* ---------- 2b. 站长密码流程(不写进代码,只存本浏览器) ---------- */
check("配置里不再存明文密码", !board.config.adminPassword);
const login = pwd => new Promise(res => board.attemptLogin(pwd, res));
const rShort = await login("123");
const rSet = await login("mypass123");
const rOk = await login("mypass123");
const rWrong = await login("wrong-password");
check("密码:过短被拒", rShort === "short");
check("密码:首次设置成功", rSet === "set");
check("密码:再次登录通过(SHA-256 校验)", rOk === "ok");
check("密码:错误密码被拒", rWrong === "wrong");
check("密码:已写入本浏览器摘要且非明文", (() => {
  const raw = mem["dd_admin_pwd_v1"] || "";
  return raw.length === 64 && raw !== "mypass123";
})());

/* 重置密码流程(用户在面板点「修改管理密码」) */
winB.prompt = () => "reset-pass-2026";
winB.alert = () => {};
board.changeAdminPwd();
await new Promise(r => setTimeout(r, 120));   // 哈希写入是异步的
const rOld = await login("mypass123");
const rNew = await login("reset-pass-2026");
check("重置密码:旧密码失效", rOld === "wrong");
check("重置密码:新密码生效", rNew === "ok");

/* ---------- 2c. 云端模式(Supabase)配置识别 ---------- */
check("normalizeComment 字段转换正确", (() => {
  const r = board.normalizeComment({
    id: "abc-123", name: "网友甲", content: "测试内容", type: "提问",
    reply: "", pinned: true, created_at: "2026-10-05T10:00:00Z",
  });
  return r.id === "abc-123" && r.pinned === true && typeof r.ts === "number" && r.ts > 0;
})());

/* 当前随站发布的配置:应当已是云端模式 */
if (board.cloudConfigured()) {
  check("云端模式:配置已被识别", true);
  check("云端模式:测试环境未联网时显示「连接中」", board.modeName() === "连接中");
  check("云端模式:未登录时无管理权限", board.isAdmin() === false);
} else {
  check("本地模式:未配置云端时进入本地模式", board.modeName() === "本地");
}

/* 反向验证:把 provider 改回空字符串,应回落到本地模式 */
const localCfgSrc = configSrc.replace('provider: "supabase",', 'provider: "",');
if (localCfgSrc !== configSrc) {
  const docL = makeDoc();
  const winL = {
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {} },
    addEventListener() {}, confirm: () => true, prompt: () => "", alert() {},
    crypto: globalThis.crypto, TextEncoder: globalThis.TextEncoder,
  };
  new Function("window", "document", localCfgSrc + "\n" + commentsSrc)(winL, docL);
  const boardL = winL.CommentsBoard;
  check("本地模式:关闭云端配置后回落正常", boardL.cloudConfigured() === false && boardL.modeName() === "本地");
  check("本地模式:渲染无异常", typeof docL.querySelector("#cloudStatus").innerHTML === "string");
}

/* ---------- 3. 页面文件与单文件版检查 ---------- */
const pages = ["index.html", "guide.html", "comments.html"];
for (const p of pages) {
  check("页面存在: " + p, fs.existsSync(dir + p));
}
const portal = read("index.html");
check("门户页含两个入口", portal.includes('href="guide.html"') && portal.includes('href="comments.html"'));
check("门户页含封面与倒计时", portal.includes("coverImg") && portal.includes("countdown"));
check("前瞻页已与首页解耦", read("guide.html").includes('href="index.html"') && read("guide.html").includes('class="brand"'));
check("留言板可返回首页", read("comments.html").includes('href="index.html"'));
check("原创封面插画存在", fs.existsSync(dir + "assets/img/cover.svg"));

for (const f of ["门户页-单文件版.html", "复仇者联盟5观影指南-单文件版.html", "留言提问板-单文件版.html"]) {
  if (!fs.existsSync(dir + f)) { console.log("SKIP 单文件版未构建: " + f); continue; }
  const html = read(f);
  check("单文件版无内部资源依赖: " + f, !/src="assets\//.test(html) && !/href="assets\//.test(html));
}

console.log(ok ? "\n✅ ALL TESTS PASSED" : "\n❌ SOME TESTS FAILED");
process.exit(ok ? 0 : 1);
