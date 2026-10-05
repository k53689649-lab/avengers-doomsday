/* =========================================================
   留言提问板 · 逻辑
   两种工作模式(自动判断):
   ① 云端模式 —— 配置 SITE_CONFIG.cloud(provider:"supabase")后启用:
      所有人共享同一份留言(谁都能看到所有提问与站长回复),
      站长用邮箱+密码登录 Supabase 账号管理(密码在服务器端校验,前端看不到);
   ② 本地模式 —— 未配置云端时的兜底:留言只存在访客自己的浏览器里(仅供演示)。
   ========================================================= */
(function () {
  "use strict";

  var rawCfg = window.SITE_CONFIG || {};
  var CFG = Object.assign({
    siteName: "毁灭之日 · 观影指南",
    adminPassword: "",
    walineServerURL: "",
    socialLogin: { wechat: false, qq: false },
    presetAnnouncements: [],
    limits: { maxLength: 500, minLength: 4, cooldownSeconds: 30, maxPerVisit: 20 },
    blockedWords: []
  }, rawCfg);
  CFG.cloud = Object.assign({
    provider: "",              // "" = 本地模式;"supabase" = 云端模式
    supabaseUrl: "",
    supabaseAnonKey: "",
    commentsTable: "comments",
    announceTable: "announcements"
  }, rawCfg.cloud || {});

  var KEY_CM = "dd_comments_v1";
  var KEY_ANN = "dd_announcements_v1";
  var KEY_LAST = "dd_last_post_v1";
  var KEY_COUNT = "dd_visit_count_v1";
  var KEY_ADMIN = "dd_admin_session_v1";
  var KEY_PWD = "dd_admin_pwd_v1";        // 本地模式下的站长密码(SHA-256 摘要,仅存本浏览器)
  var KEY_LIKED = "dd_liked_v1";          // 我点过赞的留言 id(本浏览器)
  var KEY_VISITOR = "dd_visitor_v1";      // 访客唯一标识(点赞去重用)
  var replyTarget = null;                 // 当前正在回复的目标 {id, name}
  var likeUnsupported = false;            // 数据库还没升级时,点赞降级
  var v2Ready = null;                     // 数据库是否已升级(楼中楼+点赞):null=未知

  /* ---------------- 云端状态 ---------------- */
  var sb = null;              // Supabase 客户端
  var cloudUser = null;       // 已登录的站长账号
  var cloudReady = false;
  var cloudComments = [];
  var cloudAnns = [];
  var cloudError = "";

  function cloudConfigured() {
    return CFG.cloud.provider === "supabase" && !!CFG.cloud.supabaseUrl && !!CFG.cloud.supabaseAnonKey;
  }
  function cloudMode() { return cloudConfigured() && cloudReady; }
  function modeName() {
    if (cloudMode()) return "云端";
    if (cloudConfigured() && !cloudReady) return "连接中";
    return "本地";
  }

  /* ---------------- 存储层(本地模式 / 内存兜底) ---------------- */
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

  /* ---------------- 数据读取(两种模式统一出口) ---------------- */
  function getComments() {
    return cloudMode() ? cloudComments : readJSON(KEY_CM, []);
  }
  function setComments(list) {
    if (cloudMode()) { cloudComments = list; return; }
    writeJSON(KEY_CM, list);
  }
  function getAnnouncements() {
    if (cloudMode()) return cloudAnns;
    var own = readJSON(KEY_ANN, null);
    if (own && own.length) return own;
    return (CFG.presetAnnouncements || []).map(function (a, i) {
      return { id: "preset" + i, text: a.text, time: a.time || "" };
    });
  }
  function setAnnouncements(list) {
    if (cloudMode()) { cloudAnns = list; return; }
    writeJSON(KEY_ANN, list);
  }

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
  function setTip(el, cls, text) { if (el) { el.className = "form-tip " + cls; el.textContent = text; } }

  /* ---------------- 访客标识 & 点赞记录(本浏览器) ---------------- */
  function visitorId() {
    var v = store(KEY_VISITOR);
    if (!v) { v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); store(KEY_VISITOR, v); }
    return v;
  }
  function likedIds() { return readJSON(KEY_LIKED, []) || []; }
  function hasLiked(id) { return likedIds().indexOf(id) !== -1; }
  function markLiked(id) {
    var a = likedIds();
    if (a.indexOf(id) === -1) { a.push(id); writeJSON(KEY_LIKED, a); }
  }
  function unmarkLiked(id) {
    writeJSON(KEY_LIKED, likedIds().filter(function (x) { return x !== id; }));
  }
  function bumpLikes(id, delta) {
    var list = getComments(), hit = false;
    list.forEach(function (c) { if (c.id === id) { c.likes = Math.max(0, Number(c.likes || 0) + delta); hit = true; } });
    if (hit) setComments(list);
  }

  /* 数据库升级后,把「我点过哪些赞」以数据库为准同步一次
     —— 避免升级前点赞失败留下的本地假记录,导致升级后点不动 */
  function syncMyLikes() {
    if (!cloudMode() || v2Ready !== true) return Promise.resolve();
    return sb.from("comment_likes").select("comment_id").eq("visitor_id", visitorId()).then(function (r) {
      if (!r.error && r.data) {
        writeJSON(KEY_LIKED, r.data.map(function (x) { return x.comment_id; }));
        renderAll();
      }
    }).catch(function () { });
  }

  /* ---------------- 检测数据库是否已升级(楼中楼 + 点赞) ---------------- */
  function probeV2() {
    if (!cloudMode()) { v2Ready = false; renderV2Banner(); return Promise.resolve(false); }
    return sb.from(CFG.cloud.commentsTable).select("parent_id,like_count").limit(1).then(function (r) {
      v2Ready = !r.error;
      renderV2Banner();
      return v2Ready;
    }).catch(function () { v2Ready = false; renderV2Banner(); return false; });
  }
  function renderV2Banner() {
    var el = $("#v2Banner");
    if (!el) return;
    /* 只在云端模式且确实探测到未升级时提示;本地模式不提示(否则会误导) */
    if (v2Ready !== false || !cloudMode()) { el.classList.remove("show"); el.innerHTML = ""; return; }
    el.classList.add("show");
    el.innerHTML =
      '<div class="v2b-head">⚠️ 楼中楼与点赞还没启用:数据库差一次升级(30 秒)</div>' +
      '<div class="v2b-body">现在留言、站长回复、置顶都正常,但<b>网友之间互相回复</b>和<b>点赞计数</b>需要先给数据库加两个字段。</div>' +
      '<div class="v2b-steps">① 打开 supabase.com → 进入你的项目　② 左侧 <b>SQL Editor</b> → <b>New query</b>　③ 粘贴下面的脚本 → 点 <b>Run</b>　④ 回到本页刷新</div>' +
      '<div class="v2b-actions">' +
      '<button type="button" id="v2Copy">📋 复制升级脚本</button>' +
      '<a href="docs/supabase-migration-v2.sql" target="_blank" rel="noopener">查看脚本原文</a>' +
      "</div>";
  }

  /* 一键复制升级脚本,省得手动找文件 */
  function copyMigrationSql() {
    var url = "docs/supabase-migration-v2.sql";
    var fallback = function (txt) {
      try {
        var ta = document.createElement("textarea");
        ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        flashTip("升级脚本已复制 → 粘到 Supabase 的 SQL Editor 里点 Run");
      } catch (e) { window.open(url, "_blank"); }
    };
    if (window.fetch) {
      fetch(url).then(function (r) { return r.text(); }).then(function (txt) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () {
            flashTip("升级脚本已复制 → 粘到 Supabase 的 SQL Editor 里点 Run");
          }, function () { fallback(txt); });
        } else { fallback(txt); }
      }).catch(function () { window.open(url, "_blank"); });
    } else { window.open(url, "_blank"); }
  }

  /* ---------------- 楼中楼:把平铺列表拼成树 ---------------- */
  function buildTree(list) {
    var tops = [], byParent = {};
    list.forEach(function (c) {
      if (c.parentId) { (byParent[c.parentId] = byParent[c.parentId] || []).push(c); }
      else { tops.push(c); }
    });
    tops.sort(function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return (b.ts || 0) - (a.ts || 0);
    });
    Object.keys(byParent).forEach(function (k) {
      byParent[k].sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    });
    return { tops: tops, children: byParent };
  }
  function commentName(id) {
    var f = getComments().filter(function (c) { return c.id === id; })[0];
    return f ? f.name : "已删除的留言";
  }

  /* ---------------- 点赞 ---------------- */
  function likeComment(id) {
    if (!id) return;
    if (hasLiked(id)) { flashTip("你已经点过赞啦 👍 换一个浏览器/无痕窗口可以再点一次"); return; }
    if (cloudMode() && v2Ready === false) {
      flashTip("点赞还没启用:数据库需要先升级(见页面顶部橙色提示里的升级步骤)");
      return;
    }
    /* 先按 +1 立刻反馈,失败再回滚 */
    markLiked(id);
    bumpLikes(id, 1);
    renderAll();

    if (cloudMode()) {
      sb.rpc("like_comment", { p_comment: id, p_visitor: visitorId() }).then(function (r) {
        if (r.error) {
          likeUnsupported = true;
          unmarkLiked(id); bumpLikes(id, -1); renderAll();
          flashTip("点赞失败:" + (r.error.message || "数据库未升级") + " —— 请先执行升级脚本");
          return;
        }
        var list = getComments(), hit = false;
        list.forEach(function (c) { if (c.id === id) { c.likes = Number(r.data || 0); hit = true; } });
        if (hit) setComments(list);
        renderAll();
      });
      return;
    }
  }
  function flashTip(text) {
    var el = $("#cmTip");
    if (el) { setTip(el, "ok", "✓ " + text); setTimeout(function () { if (el.textContent.indexOf(text) !== -1) setTip(el, "", ""); }, 4000); }
  }

  /* ---------------- 校验(两种模式共用) ---------------- */
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
    var dup = getComments().some(function (c) { return (c.content || "").trim() === content; });
    if (dup) return { ok: false, msg: "这条内容已经发过了,请勿重复刷屏" };
    var last = Number(store(KEY_LAST) || 0);
    var wait = CFG.limits.cooldownSeconds * 1000 - (Date.now() - last);
    if (last && wait > 0) return { ok: false, msg: "发布太频繁了,请 " + Math.ceil(wait / 1000) + " 秒后再试" };
    var cnt = Number(session(KEY_COUNT) || 0);
    if (cnt >= CFG.limits.maxPerVisit) return { ok: false, msg: "本次访问的留言数已达上限(" + CFG.limits.maxPerVisit + " 条),请稍后再来" };
    return { ok: true, name: name, content: content };
  }

  /* ---------------- 渲染 ---------------- */
  function renderStatus() {
    var box = $("#cloudStatus");
    if (!box) return;
    if (cloudMode()) {
      box.className = "cloud-status ok";
      box.innerHTML = "☁️ <b>云端已连接</b> —— 所有人的提问与回复都在这里,其他访客也能看到。";
    } else if (cloudConfigured() && !cloudReady) {
      box.className = "cloud-status pending";
      box.innerHTML = "⏳ 正在连接云端留言板…" + (cloudError ? "<br /><span class=\"cloud-err\">连接失败:" + esc(cloudError) + "</span>" : "");
    } else {
      box.className = "cloud-status local";
      box.innerHTML = "💾 <b>当前为本地模式(未配置云端)</b> —— 留言只保存在你自己的浏览器里,站长发不出去、也收不到别人的提问。" +
        "<br />站长若要让所有人共享留言,请按 README 的「Supabase 云端留言板」配置 <code>site-config.js</code>。";
    }
  }

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

  function renderComments() {
    var box = $("#cmList");
    if (!box) return;
    var list = getComments();
    var tree = buildTree(list);
    var replyCount = list.filter(function (c) { return !!c.parentId; }).length;
    var countEl = $("#cmCount");
    if (countEl) countEl.textContent = list.length ? "(" + list.length + " 条 · 含 " + replyCount + " 条回复)" : "";
    if (!list.length) {
      box.innerHTML = '<p class="cm-empty">' +
        (cloudConfigured() && !cloudReady ? "正在加载云端留言…" : "还没有留言,来做第一个提问的人吧 👋") +
        "</p>";
      renderReplyBar();
      return;
    }
    var admin = isAdmin();

    function itemHtml(c, isChild) {
      var liked = hasLiked(c.id);
      var parentName = isChild ? commentName(c.parentId) : "";
      return '<article class="cm-item' + (c.pinned ? " pinned" : "") + (isChild ? " cm-child" : "") +
        '" data-id="' + esc(c.id) + '">' +
        '<div class="cm-head">' +
        '<span class="cm-name">' + esc(c.name) + "</span>" +
        (isChild ? '<span class="cm-at">回复 @' + esc(parentName) + "</span>" : "") +
        (c.pinned ? '<span class="cm-badge pin">已置顶</span>' : "") +
        '<span class="cm-badge type">' + esc(c.type || "提问") + "</span>" +
        '<span class="cm-time">' + esc(fmt(c.ts)) + "</span>" +
        "</div>" +
        '<div class="cm-text">' + esc(c.content) + "</div>" +
        (c.reply ? '<div class="cm-reply"><b>站长回复:</b>' + esc(c.reply) + "</div>" : "") +
        '<div class="cm-actions">' +
        '<button class="cm-like' + (liked ? " liked" : "") + '" data-act="like" data-id="' + esc(c.id) + '" ' +
        'title="' + (liked ? "你已经赞过这条了" : "给这条留言点个赞") + '">' +
        (liked ? "❤" : "♡") + " " + Number(c.likes || 0) + "</button>" +
        '<button data-act="replyto" data-id="' + esc(c.id) + '">回复</button>' +
        (admin
          ? '<button data-act="pin" data-id="' + esc(c.id) + '">' + (c.pinned ? "取消置顶" : "置顶") + "</button>" +
          '<button data-act="reply" data-id="' + esc(c.id) + '">' + (c.reply ? "修改站长回复" : "站长回复") + "</button>" +
          '<button class="danger" data-act="del" data-id="' + esc(c.id) + '">删除</button>'
          : "") +
        "</div>" +
        "</article>";
    }

    box.innerHTML = tree.tops.map(function (c) {
      var kids = tree.children[c.id] || [];
      return itemHtml(c, false) +
        (kids.length ? '<div class="cm-children">' + kids.map(function (k) { return itemHtml(k, true); }).join("") + "</div>" : "");
    }).join("");
    renderReplyBar();
  }

  /* 正在回复谁:表单上方的一条提示 */
  function renderReplyBar() {
    var bar = $("#cmReplyBar");
    if (!bar) return;
    if (!replyTarget) { bar.classList.remove("show"); bar.innerHTML = ""; return; }
    bar.classList.add("show");
    bar.innerHTML = "正在回复 <b>@" + esc(replyTarget.name) + "</b> 的留言" +
      ' <button type="button" data-act="cancelreply">取消</button>';
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
      '<div class="stat"><b>' + modeName() + '</b><span>存储模式</span></div>';
  }

  function renderAll() { renderStatus(); renderAnnouncements(); renderComments(); renderStats(); }

  /* ---------------- 管理员状态 ---------------- */
  function isAdmin() {
    if (cloudConfigured()) return !!cloudUser;
    return session(KEY_ADMIN) === "1";
  }
  function setAdmin(v) { session(KEY_ADMIN, v ? "1" : "0"); }

  /* ---------------- 发布留言 ---------------- */
  function submit() {
    var nameEl = $("#cmName"), contentEl = $("#cmContent"), typeEl = $("#cmType"), tip = $("#cmTip");
    var v = validate(nameEl ? nameEl.value : "", contentEl ? contentEl.value : "");
    if (!v.ok) { setTip(tip, "err", "✕ " + v.msg); return false; }
    var type = (typeEl && typeEl.value) || "提问";

    if (cloudMode()) {
      setTip(tip, "", "正在发布…");
      var payload = { name: v.name, content: v.content, type: type };
      if (replyTarget) payload.parent_id = replyTarget.id;
      var afterOk = function () {
        store(KEY_LAST, String(Date.now()));
        session(KEY_COUNT, String(Number(session(KEY_COUNT) || 0) + 1));
        if (contentEl) contentEl.value = "";
        replyTarget = null;
        setTip(tip, "ok", "✓ 留言已发布,所有访客都能看到");
        return refreshCloud();
      };
      sb.from(CFG.cloud.commentsTable).insert([payload]).then(function (r) {
        if (r.error) {
          /* 数据库还没升级(没有 parent_id 列):明确报错,不悄悄降级成普通留言 */
          if (replyTarget && /parent_id|column|schema/i.test(r.error.message || "")) {
            setTip(tip, "err", "✕ 楼中楼还没启用:数据库需要先执行升级脚本(见页面顶部橙色提示),升级后再发一次即可");
            return;
          }
          setTip(tip, "err", "✕ 发布失败:" + r.error.message);
          return;
        }
        afterOk();
      });
      return true;
    }

    var list = getComments();
    list.push({
      id: uid(), name: v.name, content: v.content, type: type,
      ts: Date.now(), pinned: false, reply: "",
      parentId: replyTarget ? replyTarget.id : null, likes: 0
    });
    setComments(list);
    store(KEY_LAST, String(Date.now()));
    session(KEY_COUNT, String(Number(session(KEY_COUNT) || 0) + 1));
    if (contentEl) contentEl.value = "";
    replyTarget = null;
    setTip(tip, "ok", "✓ 留言已发布(当前为本地模式:仅你自己能看到)");
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
    if (cloudMode()) {
      var cur = getComments().filter(function (c) { return c.id === id; })[0];
      sb.from(CFG.cloud.commentsTable).update({ pinned: !(cur && cur.pinned) }).eq("id", id)
        .then(function (r) { if (r.error) window.alert("操作失败:" + r.error.message); else refreshCloud(); });
      return;
    }
    var f = findComment(id); if (!f) return;
    f.list[f.index].pinned = !f.list[f.index].pinned;
    setComments(f.list); renderAll();
  }
  function removeComment(id) {
    var kids = getComments().filter(function (c) { return c.parentId === id; }).length;
    var msg = kids ? "确定删除这条留言?它下面的 " + kids + " 条回复会一起删除,且不可恢复。" : "确定删除这条留言?删除后不可恢复。";
    if (!window.confirm(msg)) return;
    if (cloudMode()) {
      sb.from(CFG.cloud.commentsTable).delete().eq("id", id)
        .then(function (r) { if (r.error) window.alert("删除失败:" + r.error.message); else refreshCloud(); });
      return;
    }
    var f = findComment(id); if (!f) return;
    f.list = f.list.filter(function (c) { return c.id !== id && c.parentId !== id; });
    setComments(f.list); renderAll();
  }
  function replyComment(id) {
    var f = findComment(id);
    var cur = f ? (f.list[f.index].reply || "") : "";
    var txt = window.prompt("输入站长回复内容(留空则清除回复):", cur);
    if (txt === null) return;
    if (cloudMode()) {
      sb.from(CFG.cloud.commentsTable).update({ reply: txt.trim() }).eq("id", id)
        .then(function (r) { if (r.error) window.alert("回复失败:" + r.error.message); else refreshCloud(); });
      return;
    }
    if (!f) return;
    f.list[f.index].reply = txt.trim();
    setComments(f.list); renderAll();
  }
  function postAnnouncement() {
    var el = $("#annText"); if (!el) return;
    var text = (el.value || "").trim();
    if (text.length < 4) { window.alert("公告内容至少 4 个字"); return; }
    if (cloudMode()) {
      sb.from(CFG.cloud.announceTable).insert([{ text: text }]).then(function (r) {
        if (r.error) { window.alert("发布失败:" + r.error.message); return; }
        el.value = "";
        window.alert("公告已发布(所有访客可见)");
        refreshCloud();
      });
      return;
    }
    var list = getAnnouncements();
    list.unshift({ id: uid(), text: text, time: fmt(now()) });
    setAnnouncements(list);
    el.value = "";
    renderAll();
    window.alert("公告已发布(当前为本地模式:仅你自己可见)");
  }
  function exportData() {
    var data = { exportAt: fmt(now()), mode: modeName(), comments: getComments(), announcements: getAnnouncements() };
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
    if (cloudMode()) {
      sb.from(CFG.cloud.commentsTable).delete().neq("id", "00000000-0000-0000-0000-000000000000")
        .then(function (r) { if (r.error) window.alert("清空失败:" + r.error.message); else refreshCloud(); });
      return;
    }
    setComments([]); renderAll();
  }

  /* ---------------- 本地模式的站长密码(不写进代码) ---------------- */
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

  /* 登录核心逻辑(可测试):empty / short / set(首次设置) / ok / wrong */
  function attemptLogin(pwd, cb) {
    pwd = (pwd || "").trim();
    if (!pwd) return cb("empty");
    if (CFG.adminPassword) {
      var ok1 = pwd === CFG.adminPassword;
      setAdmin(ok1);
      return cb(ok1 ? "ok" : "wrong");
    }
    var saved = store(KEY_PWD);
    if (!saved) {
      if (pwd.length < 6) return cb("short");
      hashPwd(pwd, function (h) { store(KEY_PWD, h); setAdmin(true); cb("set"); });
      return;
    }
    hashPwd(pwd, function (h) {
      var ok2 = h === saved;
      setAdmin(ok2);
      cb(ok2 ? "ok" : "wrong");
    });
  }
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
    // 云端模式:用邮箱+密码登录 Supabase 账号;本地模式:用本机设置的密码
    var emailEl = $("#adminEmail"), emailLbl = $("#adminEmailLabel"), hint = $("#adminLoginHint");
    var cloud = cloudConfigured();
    if (emailEl) emailEl.style.display = cloud ? "block" : "none";
    if (emailLbl) emailLbl.style.display = cloud ? "block" : "none";
    if (hint) {
      hint.textContent = cloud
        ? "云端模式:请用站长 Supabase 账号(邮箱 + 密码)登录 —— 密码在服务器端校验,前端看不到,别人也无法冒充。"
        : "本地模式:首次使用即设置密码,密码只保存在你自己的浏览器里,不会上传。";
    }
    var cp = $("#changePwdBtn");
    if (cp) cp.style.display = cloud ? "none" : "inline-block";
  }
  function tryLogin() {
    var tip = $("#adminTip");
    var el = $("#adminPwd");
    var pwd = el ? el.value : "";

    if (cloudConfigured()) {
      var emailEl = $("#adminEmail");
      var email = emailEl ? emailEl.value.trim() : "";
      if (!email) { setTip(tip, "err", "✕ 请输入站长邮箱"); return; }
      if (!pwd) { setTip(tip, "err", "✕ 请输入密码"); return; }
      if (!sb) { setTip(tip, "err", "✕ 云端尚未连接完成,请稍候重试"); return; }
      setTip(tip, "", "正在登录…");
      sb.auth.signInWithPassword({ email: email, password: pwd }).then(function (r) {
        if (r.error) { setTip(tip, "err", "✕ 登录失败:" + r.error.message); return; }
        cloudUser = r.data && r.data.user ? r.data.user : null;
        if (el) el.value = "";
        syncAdminUI(); renderAll();
        setTip(tip, "ok", "✓ 已登录(管理员),现在可以回复/置顶/删除留言");
      });
      return;
    }

    var firstTime = !CFG.adminPassword && !hasLocalPassword();
    attemptLogin(pwd, function (res) {
      if (res === "empty") { setTip(tip, "err", "✕ 请输入密码"); return; }
      if (res === "short") { setTip(tip, "err", "✕ 密码至少 6 位"); return; }
      if (res === "wrong") { setTip(tip, "err", "✕ 密码错误"); return; }
      if (el) el.value = "";
      syncAdminUI(); renderAll();
      setTip(tip, "ok", res === "set"
        ? "✓ 已设置管理密码并进入管理模式(密码只保存在本浏览器,不会上传)"
        : "✓ 已进入管理模式");
      if (firstTime && res === "set") {
        window.alert("管理密码设置成功!\n\n请记住它 —— 密码以摘要形式保存在你自己的浏览器里,换浏览器或清除数据后需要重新设置。");
      }
    });
  }
  function logout() {
    if (cloudConfigured() && sb) {
      sb.auth.signOut().then(function () { cloudUser = null; syncAdminUI(); renderAll(); });
      return;
    }
    setAdmin(false); syncAdminUI(); renderAll();
  }

  /* ---------------- 登录入口说明 ---------------- */
  function handleLogin(provider) {
    var label = provider === "wechat" ? "微信" : "QQ";
    var plat = provider === "wechat" ? "微信开放平台「网站应用」" : "QQ 互联「网站应用」";
    var enabled = CFG.socialLogin && CFG.socialLogin[provider];
    var lines;
    if (enabled && CFG.walineServerURL) {
      lines = ["【" + label + "登录】已开启。", "", "请使用页面下方的留言框,点击登录按钮选择" + label + "授权即可。"];
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
        "本站当前使用『昵称留言』模式:无需登录,任何人都可以直接提问。"
      ];
    }
    window.alert(lines.join("\n"));
  }

  /* ---------------- Waline 云端模式(可选,另一种云端方案) ---------------- */
  function bootWaline() {
    if (!CFG.walineServerURL) return false;
    var wrap = $("#walineWrap"), localForm = $("#localFormSection"), localList = $("#localListSection");
    if (wrap) wrap.classList.remove("hidden");
    if (localForm) localForm.classList.add("hidden");
    if (localList) localList.classList.add("hidden");
    var note = $("#walineNote");
    if (note) note.textContent = "已连接云端留言板(Waline):" + CFG.walineServerURL + " —— 留言保存到云端数据库,所有访客可见;社交登录与后台管理请在 Waline 服务端配置。";
    try {
      var s = document.createElement("script");
      s.src = "https://unpkg.com/@waline/client@v3/dist/waline.js";
      s.onload = function () {
        if (window.Waline && window.Waline.init) {
          window.Waline.init({
            el: "#waline", serverURL: CFG.walineServerURL, lang: "zh-CN",
            meta: ["nick", "mail", "link"], requiredMeta: ["nick"], login: "enable", pageview: false
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

  /* ---------------- Supabase 云端:连接与同步 ---------------- */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("无法加载 " + src)); };
      document.head.appendChild(s);
      setTimeout(function () { reject(new Error("加载超时")); }, 12000);
    });
  }
  function loadSupabaseLib() {
    if (window.supabase) return Promise.resolve();
    var cdns = [
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
      "https://unpkg.com/@supabase/supabase-js@2"
    ];
    return cdns.reduce(function (chain, url) {
      return chain.catch(function () { return loadScript(url); });
    }, Promise.reject(new Error("start")));
  }
  function normalizeComment(row) {
    return {
      id: row.id, name: row.name, content: row.content,
      type: row.type || "提问", reply: row.reply || "",
      pinned: !!row.pinned, ts: Date.parse(row.created_at) || Date.now(),
      parentId: row.parent_id || null,                 /* 楼中楼:回复的父留言 */
      likes: Number(row.like_count || 0)               /* 点赞数 */
    };
  }
  function normalizeAnnouncement(row) {
    return { id: row.id, text: row.text, time: fmt(row.created_at) };
  }
  function refreshCloud() {
    if (!cloudMode()) return Promise.resolve();
    return Promise.all([
      sb.from(CFG.cloud.commentsTable).select("*").order("created_at", { ascending: false }).limit(500),
      sb.from(CFG.cloud.announceTable).select("*").order("created_at", { ascending: false }).limit(50)
    ]).then(function (res) {
      var c = res[0], a = res[1];
      if (c.error) { cloudError = c.error.message; }
      else { cloudComments = (c.data || []).map(normalizeComment); }
      if (!a.error) { cloudAnns = (a.data || []).map(normalizeAnnouncement); }
      renderAll();
    }).catch(function (e) { cloudError = e.message; renderAll(); });
  }
  function initCloud() {
    return loadSupabaseLib().then(function () {
      if (!window.supabase) throw new Error("supabase-js 未就绪");
      sb = window.supabase.createClient(CFG.cloud.supabaseUrl, CFG.cloud.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      return sb.auth.getSession();
    }).then(function (s) {
      cloudUser = s && s.data && s.data.session ? s.data.session.user : null;
      cloudReady = true;
      if (sb && sb.auth && sb.auth.onAuthStateChange) {
        sb.auth.onAuthStateChange(function (_evt, sess) {
          cloudUser = sess ? sess.user : null;
          syncAdminUI(); renderAll();
        });
      }
      renderAll();
      return refreshCloud().then(function () { return probeV2(); }).then(function () { return syncMyLikes(); });
    }).catch(function (e) {
      cloudError = (e && e.message) || String(e);
      cloudReady = false;
      renderAll();
    });
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
        var what = act.dataset.act;
        if (what === "pin") togglePin(id);
        else if (what === "del") removeComment(id);
        else if (what === "reply") replyComment(id);
        else if (what === "like") likeComment(id);
        else if (what === "replyto") {
          if (cloudMode() && v2Ready === false) {
            flashTip("楼中楼还没启用:数据库需要先升级(见页面顶部橙色提示),升级后任何人都能在这里互相回复");
            return;
          }
          var f = findComment(id);
          if (f) {
            replyTarget = { id: id, name: f.list[f.index].name };
            renderReplyBar();
            var ta = $("#cmContent");
            if (ta) { ta.focus(); ta.scrollIntoView({ block: "center", behavior: "smooth" }); }
          }
        } else if (what === "cancelreply") {
          replyTarget = null; renderReplyBar();
        }
        return;
      }
      if (t.closest("#adminToggle")) { openAdmin(); return; }
      if (t.closest("#v2Copy")) { copyMigrationSql(); return; }
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
    var lo = $("#logoutBtn"); if (lo) lo.addEventListener("click", logout);
    var back = document.createElement("button");
    back.id = "backTop"; back.textContent = "↑"; back.title = "回到顶部";
    document.body.appendChild(back);
    back.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    if (bootWaline()) { renderStatus(); renderAnnouncements(); renderStats(); bind(); return; }
    renderAll();
    bind();
    syncAdminUI();
    if (cloudConfigured()) initCloud();
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
    changeAdminPwd: changeAdminPwd,
    cloudConfigured: cloudConfigured, cloudMode: cloudMode, modeName: modeName,
    normalizeComment: normalizeComment,
    buildTree: buildTree, likeComment: likeComment, hasLiked: hasLiked,
    setV2State: function (v) { v2Ready = v; renderV2Banner(); },
    getV2State: function () { return v2Ready; },
    setReplyTarget: function (t) { replyTarget = t; renderReplyBar(); },
    getReplyTarget: function () { return replyTarget; }
  };
})();
