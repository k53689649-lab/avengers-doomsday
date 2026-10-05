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
const data = new Function(filmsSrc + "\n" + charsSrc + "\nreturn {FILMS, TV_SHOWS, TRAILER_CHARS, PREDICTED_CHARS, EASTER_EGGS};")();
const docA = makeDoc();
new Function("window", "document", filmsSrc + "\n" + charsSrc + "\n" + appSrc)(
  { scrollTo() {}, scrollY: 0, addEventListener() {}, ...data }, docA);
docA._fire("DOMContentLoaded");

const q = sel => docA.querySelector(sel).innerHTML;
const countCards = (html, cls) => (html.match(new RegExp('class="' + cls + '"', "g")) || []).length;

const total = data.FILMS.length + data.TV_SHOWS.length;
check("作品卡片渲染 " + total + " 条", countCards(q("#filmsList"), "film-card") === total);
check("确认角色卡片 " + data.TRAILER_CHARS.length + " 位", countCards(q("#trailerCharGrid"), "char-card") === data.TRAILER_CHARS.length);
check("预测角色卡片 " + data.PREDICTED_CHARS.length + " 位", countCards(q("#predictedCharGrid"), "char-card") === data.PREDICTED_CHARS.length);
check("彩蛋速报 " + data.EASTER_EGGS.length + " 条", countCards(q("#eggList"), "egg-card") === data.EASTER_EGGS.length);
check("速览卡片 / FAQ / 路线均渲染", countCards(q("#factGrid"), "fact-card") === 8 && countCards(q("#faqList"), "faq-item") === 7 && countCards(q("#routeList"), "route-item") === 12);
check("复联4加码臻享版条目存在", data.FILMS.some(f => f.id === "endgame2026"));
check("蜘蛛侠4含凤凰女揭示", (data.FILMS.find(f => f.id === "smbnd").plot || "").includes("琴·葛蕾"));
check("浩克在确认区、不在预测区", q("#trailerCharGrid").includes("绿巨人") && !q("#predictedCharGrid").includes("绿巨人"));

/* ---------- 2. 留言板 ---------- */
const configSrc = read("assets/js/site-config.js");
const commentsSrc = read("assets/js/comments.js");
const mem = {};
const storage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
const docB = makeDoc();
const winB = { localStorage: storage, sessionStorage: { getItem: () => null, setItem: () => {} }, addEventListener() {}, confirm: () => true, prompt: () => "测试回复", alert: () => {} };
new Function("window", "document", configSrc + "\n" + commentsSrc)(winB, docB);
const board = winB.CommentsBoard;
check("留言板初始化", !!board && board.config.adminPassword.length > 0);
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

/* ---------- 3. 单文件版检查 ---------- */
for (const f of ["复仇者联盟5观影指南-单文件版.html", "留言提问板-单文件版.html"]) {
  if (!fs.existsSync(dir + f)) { console.log("SKIP 单文件版未构建: " + f); continue; }
  const html = read(f);
  check("单文件版无外部依赖: " + f, !/src="assets\//.test(html) && !/href="assets\//.test(html));
}

console.log(ok ? "\n✅ ALL TESTS PASSED" : "\n❌ SOME TESTS FAILED");
process.exit(ok ? 0 : 1);
