/* =========================================================
   留言提问板 · 逻辑
   - 默认模式:浏览器本地存储(适合演示与自用)
   - 云端模式:配置 SITE_CONFIG.walineServerURL 后自动启用 Waline(留言存云端、支持社交登录与后台管理)
   - 管理功能:置顶 / 删除 / 发布公告 / 导出数据
   ========================================================= */
(function () {
  "use strict";

  var CFG = Object.assign({
    siteName: "毁灭之日 · 观影指南",
    adminPassword: "doomsday2026",
    walineServerURL: "",
    socialLogin: { wechat: false, qq: false },
    presetAnnouncements: [],
    limits: { maxLength: 500, minLength: 4, cooldownSeconds: 30, maxPerVisit: 20 },
    blockedWords: []
  }, window.SITE_CONFIG || {});

  var KEY_CM = "dd_comments_v1";
  var KEY_ANN = "dd_announcements_v1";
  var KEY_LAST = "dd_last_post_v1";
  var KEY_COUNT = "dd_visit_count_v1";
  var KEY_ADMIN = "dd_admin_session_v1";
  var KEY_PWD = "dd_admin_pwd_v1";        // 站长密码(仅存本浏览器的 SHA-256 摘要)

  /* ---------------- 存储层(带内存兜底) ---------------- */
  var memory = {};
  function store(key, value) {
    try {
      if (value === undefined) {
        var raw = window.localStorage.getItem(key);
        return raw === null ? (memory[key] === undefined ? null : memory[key]) : raw;
      }
      memory[key] = value;
      window.localStorage.setItem(key, value);
      return value;
    } catch (e) {
      return value === undefined ? (memory[key] === undefined ? null : memory[key]) : value;
    }
  }
  function session(key, value) {
    try {
      if (value === undefined) return window.sessionStorage.getItem(key);
      window.sessionStorage.setItem(key, value);
      return value;
    } catch (e) { return null; }
  }
  function readJSON(key, fallback) {
    var raw = store(key);
    if (!raw) return fallback;
    try { var v = JSON.parse(raw); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeJSON(key, val) { store(key, JSON.stringify(val)); }

  function getComments() { return readJSON(KEY_CM, []); }
  function setComments(list) { writeJSON(KEY_CM, list); }
  function getAnnouncements() {
    var own = readJSON(KEY_ANN, null);
    if (own && own.length) return own;
    return (CFG.presetAnnouncements || []).map(function (a, i) {
      return { id: "preset" + i, text: a.text, time: a.time || "" };
    });
  }
  function setAnnouncements(list) { writeJSON(KEY_ANN, list); }

  /* ---------------- 工具 ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function now() { return new Date(); }
  function fmt(d) {
    var t = d instanceof Date ? d : new Date(d);
    if (isNaN(t.getTime())) return "";
    function p(n) { return n < 10 ? "0" + n : "" + n; }
    return t.getFullYear() + "-" + p(t.getMonth() + 1) + "-" + p(t.getDate()) + " " + p(t.getHours()) + ":" + p(t.getMinutes());
  }
  function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------------- 校验 ---------------- */
  function validate(name, content) {
    var L = CFG.limits;
    name = (name || "").trim();
    content = (content || "").trim();
    if (name.length < 2) return { ok: false, msg: "昵称至少 2 个字(可用网名,请勿使用真实姓名)" };
    if (name.length > 16) return { ok: false, msg: "昵称最多 16 个字" };
    if (content.length < L.minLength) return { ok: false, msg: "留言至少 " + L.minLength + " 个字,请把问题说清楚一点~" };
    if (content.length > L.maxLength) return { ok: false, msg: "留言最多 " + L.maxLength + " 个字" };
    if (/^(.)\1{3,}$/.test(content)) return { ok: false, msg: "请勿发布重复字符刷屏内容" };
    var low = (name + " " + content).toLowerCase();
    for (var i = 0; i < (CFG.blockedWords || []).length; i++) {
      if (low.indexOf(String(CFG.blockedWords[i]).toLowerCase()) !== -1) {
        return { ok: false, msg: "留言包含被禁止的内容(" + CFG.blockedWords[i] + "),请修改后再发布" };
      }
    }
    // 与已有留言完全重复 → 视为刷屏
    var dup = getComments().some(function (c) { return c.content.trim() === content; });
    if (dup) return { ok: false, msg: "这条内容已经发过了,请勿重复刷屏" };
    // 冷却时间
    var last = Number(store(KEY_LAST) || 0);
    var wait = CFG.limits.cooldownSeconds * 1000 - (Date.now() - last);
    if (last && wait > 0) return { ok: false, msg: "发布太频繁了,请 " + Math.ceil(wait / 1000) + " 秒后再试" };
    // 单次访问条数上限
    var cnt = Number(session(KEY_COUNT) || 0);
    if (cnt >= CFG.limits.maxPerVisit) return { ok: false, msg: "本次访问的留言数已达上限(" + CFG.limits.maxPerVisit + " 条),请稍后再来" };
    return { ok: true, name: name, content: content };
  }

  /* ---------------- 渲染:公告 ---------------- */
  function renderAnnouncements() {
    var box = $("#announceList");
    if (!box) return;
    var list = getAnnouncements();
    if (!list.length) {
      box.innerHTML = '<p class="announce-empty">暂无公告。站长登录后可在管理面板发布公告(会置顶显示在这里)。</p>';
      return;
    }
    box.innerHTML = list.map(function (a) {
      return '<div class="announce-item">' +
        '<div class="a-meta">📌 站长公告' + (a.time ? " · " + esc(a.time) : "") + "</div>" +
        '<div class="a-text">' + esc(a.text) + "</div></div>";
    }).join("");
  }

  /* ---------------- 渲染:留言列表 ---------------- */
  function renderComments() {
    var box = $("#cmList");
    if (!box) return;
    var list = getComments().slice().sort(function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return (b.ts || 0) - (a.ts || 0);
    });
    var countEl = $("#cmCount");
    if (countEl) countEl.textContent = list.length ? "(" + list.length + " 条)" : "";
    if (!list.length) {
      box.innerHTML = '<p class="cm-empty">还没有留言,来做第一个提问的人吧 👋</p>';
      return;
    }
    var admin = isAdmin();
    box.innerHTML = list.map(function (c) {
      return '<article class="cm-item' + (c.pinned ? " pinned" : "") + '" data-id="' + esc(c.id) + '">' +
        '<div class="cm-head">' +
        '<span class="cm-name">' + esc(c.name) + "</span>" +
        (c.admin ? '<span class="cm-badge admin">站长</span>' : "") +
        (c.pinned ? '<span class="cm-badge pin">已置顶</span>' : "") +
        '<span class="cm-badge type">' + esc(c.type || "提问") + "</span>" +
        '<span class="cm-time">' + esc(fmt(c.ts)) + "</span>" +
        "</div>" +
        '<div class="cm-text">' + esc(c.content) + "</div>" +
        (c.reply ? '<div class="cm-reply"><b>站长回复:</b>' + esc(c.reply) + "</div>" : "") +
        (admin ? '<div class="cm-actions">' +
          '<button data-act="pin" data-id="' + esc(c.id) + '">' + (c.pinned ? "取消置顶" : "置顶") + "</button>" +
          '<button data-act="reply" data-id="' + esc(c.id) + '">' + (c.reply ? "修改回复" : "回复") + "</button>" +
          '<button data-act="del" data-id="' + esc(c.id) + '">删除</button>' +
          "</div>" : "") +
        "</article>";
    }).join("");
  }

  function renderStats() {
    var box = $("#cmStats");
    if (!box) return;
    var list = getComments();
    var anns = getAnnouncements();
    box.innerHTML =
      '<div class="stat"><b>' + list.length + '</b><span>条留言</span></div>' +
      '<div class="stat"><b>' + list.filter(function (c) { return !c.reply; }).length + '</b><span>待回复</span></div>' +
      '<div class="stat"><b>' + anns.length + '</b><span>条公告</span></div>' +
      '<div class="stat"><b>' + (CFG.walineServerURL ? "云端" : "本地") + '</b><span>存储模式</span></div>';
  }

  function renderAll() { renderAnnouncements(); renderComments(); renderStats(); }

  /* ---------------- 管理员状态 ---------------- */
  function isAdmin() { return session(KEY_ADMIN) === "1"; }
  function setAdmin(v) { session(KEY_ADMIN, v ? "1" : "0"); }

  /* ---------------- 发布留言 ---------------- */
  function submit() {
    var nameEl = $("#cmName"), contentEl = $("#cmContent"), typeEl = $("#cmType"), tip = $("#cmTip");
    var v = validate(nameEl ? nameEl.value : "", contentEl ? contentEl.value : "");
    if (!v.ok) { if (tip) { tip.className = "form-tip err"; tip.textContent = "✕ " + v.msg; } return false; }
    var list = getComments();
    list.push({
      id: uid(), name: v.name, content: v.content,
      type: (typeEl && typeEl.value) || "提问",
      ts: Date.now(), pinned: false, admin: isAdmin(), reply: ""
    });
    setComments(list);
    store(KEY_LAST, String(Date.now()));
    session(KEY_COUNT, String(Number(session(KEY_COUNT) || 0) + 1));
    if (contentEl) contentEl.value = "";
    if (tip) { tip.className = "form-tip ok"; tip.textContent = "✓ 留言已发布" + (CFG.walineServerURL ? "" : "(当前为本地模式:仅你自己能看到)"); }
    renderAll();
    return true;
  }

  /* ---------------- 管理操作 ---------------- */
  function findComment(id) {
    var list = getComments();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return { list: list, index: i };
    return null;
  }
  function togglePin(id) {
    var f = findComment(id); if (!f) return;
    f.list[f.index].pinned = !f.list[f.index].pinned;
    setComments(f.list); renderAll();
  }
  function removeComment(id) {
    var f = findComment(id); if (!f) return;
    if (!window.confirm("确定删除这条留言?删除后不可恢复。")) return;
    f.list.splice(f.index, 1); setComments(f.list); renderAll();
  }
  function replyComment(id) {
    var f = findComment(id); if (!f) return;
    var cur = f.list[f.index].reply || "";
    var txt = window.prompt("输入站长回复内容(留空则清除回复):", cur);
    if (txt === null) return;
    f.list[f.index].reply = txt.trim();
    setComments(f.list); renderAll();
  }
  function postAnnouncement() {
    var el = $("#annText"); if (!el) return;
    var text = (el.value || "").trim();
    if (text.length < 4) { window.alert("公告内容至少 4 个字"); return; }
    var list = getAnnouncements();
    list.unshift({ id: uid(), text: text, time: fmt(now()) });
    setAnnouncements(list);
    el.value = "";
    renderAll();
    window.alert("公告已发布(显示在公告区最上方)");
  }
  function exportData() {
    var data = { exportAt: fmt(now()), comments: getComments(), announcements: getAnnouncements() };
    try {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "留言板备份-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { window.alert("导出失败:" + e.message); }
  }
  function clearAll() {
    if (!window.confirm("确定清空全部留言(公告保留)?此操作不可恢复!")) return;
    setComments([]); renderAll();
  }

  /* ---------------- 站长密码:不写进代码,存在本浏览器 ---------------- */
  function weakHash(s) {
    var h = 5381, i;
    for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return "weak:" + h.toString(16);
  }
  function hashPwd(pwd, cb) {
    var s = "doomsday-guide::" + String(pwd);
    var c = window.crypto;
    if (c && c.subtle && typeof window.TextEncoder !== "undefined") {
      c.subtle.digest("SHA-256", new window.TextEncoder().encode(s)).then(function (buf) {
        var bytes = new Uint8Array(buf), hex = "", i;
        for (i = 0; i < bytes.length; i++) hex += ("0" + bytes[i].toString(16)).slice(-2);
        cb(hex);
      }).catch(function () { cb(weakHash(s)); });
    } else {
      cb(weakHash(s));
    }
  }
  function hasLocalPassword() { return !!store(KEY_PWD); }

  /* 登录核心逻辑(可测试):
     返回 empty / short / set(首次设置成功) / ok / wrong */
  function attemptLogin(pwd, cb) {
    pwd = (pwd || "").trim();
    if (!pwd) return cb("empty");
    if (CFG.adminPassword) {                 // 兼容:配置里写死了固定密码(公开可见,不推荐)
      var good = pwd === CFG.adminPassword;
      setAdmin(good);
      return cb(good ? "ok" : "wrong");
    }
    var saved = store(KEY_PWD);
    if (!saved) {                            // 首次使用:设置密码
      if (pwd.length < 6) return cb("short");
      hashPwd(pwd, function (h) { store(KEY_PWD, h); setAdmin(true); cb("set"); });
      return;
    }
    hashPwd(pwd, function (h) {
      var good = h === saved;
      setAdmin(good);
      cb(good ? "ok" : "wrong");
    });
  }

  /* ---------------- 管理弹窗 ---------------- */
  function openAdmin() {
    var m = $("#adminModal"); if (!m) return;
    m.classList.add("open");
    syncAdminUI();
  }
  function closeAdmin() { var m = $("#adminModal"); if (m) m.classList.remove("open"); }
  function syncAdminUI() {
    var login = $("#adminLogin"), panel = $("#adminPanel");
    if (!login || !panel) return;
    var on = isAdmin();
    login.style.display = on ? "none" : "block";
    panel.style.display = on ? "block" : "none";
  }
  function tryLogin() {
    var el = $("#adminPwd"), tip = $("#adminTip");
    var pwd = el ? el.value : "";
    var firstTime = !CFG.adminPassword && !hasLocalPassword();
    attemptLogin(pwd, function (res) {
      if (!tip) return;
      if (res === "empty") { tip.className = "form-tip err"; tip.textContent = "✕ 请输入密码"; return; }
      if (res === "short") { tip.className = "form-tip err"; tip.textContent = "✕ 密码至少 6 位"; return; }
      if (res === "wrong") { tip.className = "form-tip err"; tip.textContent = "✕ 密码错误"; return; }
      if (el) el.value = "";
      syncAdminUI(); renderAll();
      tip.className = "form-tip ok";
      tip.textContent = res === "set"
        ? "✓ 已设置管理密码并进入管理模式(密码只保存在本浏览器,不会上传)"
        : "✓ 已进入管理模式";
      if (firstTime && res === "set") {
        window.alert("管理密码设置成功!\n\n请记住它 —— 密码以摘要形式保存在你自己的浏览器里:\n· 换浏览器 / 清除浏览数据后需要重新设置\n· 留言板接上 Waline 云端后,请改用 Waline 服务端后台管理");
      }
    });
  }

  /* 修改管理密码 */
  function changeAdminPwd() {
    var np = window.prompt("设置新的管理密码(至少 6 位,留空取消):", "");
    if (np === null) return;
    np = np.trim();
    if (np.length < 6) { window.alert("密码至少 6 位,未修改"); return; }
    hashPwd(np, function (h) {
      store(KEY_PWD, h);
      window.alert("✓ 管理密码已更新(仅保存在本浏览器)");
    });
  }

  /* ---------------- 登录入口说明 ---------------- */
  function handleLogin(provider) {
    var label = provider === "wechat" ? "微信" : "QQ";
    var plat = provider === "wechat" ? "微信开放平台「网站应用」" : "QQ 互联「网站应用」";
    var enabled = CFG.socialLogin && CFG.socialLogin[provider];
    var lines;
    if (enabled && CFG.walineServerURL) {
      lines = ["【" + label + "登录】已开启。", "", "请使用页面下方的留言框,点击登录按钮选择" + label + "授权即可。", "登录后你的昵称与头像会自动带上,并可收到回复提醒。"];
    } else {
      lines = [
        "【" + label + "登录】当前未开启 —— 说明如下",
        "",
        "为什么不能一键开通:" + plat + "要求【企业/组织主体】实名认证(微信需 300 元/年认证费)且网站需已完成 ICP 备案,个人开发者无法申请。",
        "",
        "个人站长可走的四条路(按推荐度):",
        "① 邮箱验证码登录 —— 最省事:部署 Waline 云留言板并开启邮箱注册,访客用邮箱收验证码即可发言,零资质要求;",
        "② 社交登录 —— Waline 服务端可开启 GitHub / 微博 等第三方一键授权登录;",
        "③ 微信小程序版留言板 —— 个人可免费注册小程序,在小程序内调用微信登录 + 云开发数据库,这是个人开发者唯一能真正使用「微信登录」的正规途径;",
        "④ 若日后有营业执照 —— 申请" + plat + ",把 AppID/密钥配置到 Waline 社交登录,即可实现网页扫码登录。",
        "",
        "本站当前使用『昵称留言』模式:无需登录,任何人都可以直接提问。",
        "部署步骤详见项目 README 的「留言板部署指南」。"
      ];
    }
    window.alert(lines.join("\n"));
  }

  /* ---------------- Waline 云端模式 ---------------- */
  function bootWaline() {
    if (!CFG.walineServerURL) return false;
    var wrap = $("#walineWrap"), localForm = $("#localFormSection"), localList = $("#localListSection");
    if (wrap) wrap.classList.remove("hidden");
    if (localForm) localForm.classList.add("hidden");
    if (localList) localList.classList.add("hidden");
    var note = $("#walineNote");
    if (note) {
      note.textContent = "已连接云端留言板(Waline):" + CFG.walineServerURL + " —— 留言会保存到云端数据库,所有访客可见;社交登录与后台管理请在 Waline 服务端配置。";
    }
    try {
      var s = document.createElement("script");
      s.src = "https://unpkg.com/@waline/client@v3/dist/waline.js";
      s.onload = function () {
        if (window.Waline && window.Waline.init) {
          window.Waline.init({
            el: "#waline",
            serverURL: CFG.walineServerURL,
            lang: "zh-CN",
            meta: ["nick", "mail", "link"],
            requiredMeta: ["nick"],
            login: "enable",
            pageview: false
          });
        }
      };
      document.body.appendChild(s);
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/@waline/client@v3/dist/waline.css";
      document.head.appendChild(link);
    } catch (e) { /* 离线环境忽略 */ }
    return true;
  }

  /* ---------------- 事件绑定 ---------------- */
  function bind() {
    var btnSubmit = $("#cmSubmit");
    if (btnSubmit) btnSubmit.addEventListener("click", submit);

    var ta = $("#cmContent"), counter = $("#cmCounter");
    if (ta && counter) {
      counter.textContent = "0/" + CFG.limits.maxLength;
      ta.addEventListener("input", function () {
        counter.textContent = ta.value.length + "/" + CFG.limits.maxLength;
      });
    }

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var loginBtn = t.closest("[data-provider]");
      if (loginBtn) { handleLogin(loginBtn.dataset.provider); return; }
      var act = t.closest("[data-act]");
      if (act) {
        var id = act.dataset.id;
        if (act.dataset.act === "pin") togglePin(id);
        else if (act.dataset.act === "del") removeComment(id);
        else if (act.dataset.act === "reply") replyComment(id);
        return;
      }
      if (t.closest("#adminToggle")) { openAdmin(); return; }
      if (t.closest("#adminClose")) { closeAdmin(); return; }
      if (t.closest("#adminModal") && !t.closest(".admin-box")) { closeAdmin(); return; }
    });

    var lb = $("#adminLoginBtn"); if (lb) lb.addEventListener("click", tryLogin);
    var cp = $("#changePwdBtn"); if (cp) cp.addEventListener("click", changeAdminPwd);
    var pwd = $("#adminPwd");
    if (pwd) pwd.addEventListener("keydown", function (e) { if (e.key === "Enter") tryLogin(); });
    var ab = $("#annPost"); if (ab) ab.addEventListener("click", postAnnouncement);
    var ex = $("#exportBtn"); if (ex) ex.addEventListener("click", exportData);
    var cl = $("#clearBtn"); if (cl) cl.addEventListener("click", clearAll);
    var lo = $("#logoutBtn");
    if (lo) lo.addEventListener("click", function () { setAdmin(false); syncAdminUI(); renderAll(); });
    var back = document.createElement("button");
    back.id = "backTop"; back.textContent = "↑"; back.title = "回到顶部";
    document.body.appendChild(back);
    back.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    if (bootWaline()) { renderAnnouncements(); renderStats(); bind(); return; }
    renderAll();
    bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* 供测试与站长调试使用 */
  window.CommentsBoard = {
    validate: validate, getComments: getComments, setComments: setComments,
    getAnnouncements: getAnnouncements, setAnnouncements: setAnnouncements,
    render: renderAll, isAdmin: isAdmin, setAdmin: setAdmin, config: CFG,
    attemptLogin: attemptLogin, hashPwd: hashPwd, hasLocalPassword: hasLocalPassword,
    changeAdminPwd: changeAdminPwd
  };
})();
