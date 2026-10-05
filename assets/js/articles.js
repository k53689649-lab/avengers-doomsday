/* =========================================================
   影迷投稿板块
   —— 文章列表 / 详情 / 投稿 / 文章评论(楼中楼)/ 点赞 / 收藏 / 站长审核
   —— 与留言板共用 Supabase 与访客标识(dd_visitor_v1)
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var CLOUD = CFG.cloud || {};
  var KEY_VISITOR = "dd_visitor_v1";     // 与留言板共用,保证同一浏览器点赞/收藏一致
  var KEY_LIKED = "dd_aliked_v1";
  var KEY_FAV = "dd_afav_v1";

  var sb = null, ready = false, user = null, v3 = null;
  var ARTICLES = [];
  var CACHE = { comms: {} };             // 文章评论缓存
  var state = {
    cat: "all", sort: "new", q: "",
    current: null, replyTo: null, mineMode: "mine"
  };
  var CATS = ["资讯", "预告解析", "剧情考据", "演员动态", "观后感"];
  var SORTS = [{ id: "new", name: "最新" }, { id: "hot", name: "最热" }, { id: "fav", name: "收藏最多" }];
  var MAX_LINKS = 3;

  /* ---------------- 工具 ---------------- */
  var memory = {};
  function store(k, v) {
    try {
      if (v === undefined) return window.localStorage.getItem(k);
      window.localStorage.setItem(k, String(v));
    } catch (e) { if (v === undefined) return memory[k] || null; memory[k] = String(v); }
    return null;
  }
  function readJSON(k, d) { try { return JSON.parse(store(k)) || d; } catch (e) { return d; } }
  function writeJSON(k, v) { store(k, JSON.stringify(v || [])); }
  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(d) {
    var t = d instanceof Date ? d : new Date(d);
    if (isNaN(t.getTime())) return "";
    function p(n) { return n < 10 ? "0" + n : "" + n; }
    return t.getFullYear() + "-" + p(t.getMonth() + 1) + "-" + p(t.getDate()) + " " + p(t.getHours()) + ":" + p(t.getMinutes());
  }
  function visitorId() {
    var v = store(KEY_VISITOR);
    if (!v) { v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); store(KEY_VISITOR, v); }
    return v;
  }
  function likedIds() { return readJSON(KEY_LIKED, []); }
  function favIds() { return readJSON(KEY_FAV, []); }
  function hasLiked(id) { return likedIds().indexOf(id) !== -1; }
  function hasFav(id) { return favIds().indexOf(id) !== -1; }
  function markLiked(id) { var a = likedIds(); if (a.indexOf(id) === -1) { a.push(id); writeJSON(KEY_LIKED, a); } }
  function unmarkLiked(id) { writeJSON(KEY_LIKED, likedIds().filter(function (x) { return x !== id; })); }
  function markFav(id, on) {
    var a = favIds().filter(function (x) { return x !== id; });
    if (on) a.push(id);
    writeJSON(KEY_FAV, a);
  }
  function tip(el, cls, text) { if (el) { el.className = "form-tip " + cls; el.textContent = text; } }
  function flash(text) { tip($("#arTip") || $("#acTip"), "ok", "✓ " + text); }

  /* 只允许 http/https,防止 javascript: 之类的注入 */
  function safeUrl(u) {
    var s = String(u || "").trim();
    if (!s) return "";
    if (!/^https?:\/\//i.test(s)) {
      if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(s)) s = "https://" + s; else return "";
    }
    try { var x = new URL(s); if (x.protocol !== "http:" && x.protocol !== "https:") return ""; return x.href; } catch (e) { return ""; }
  }
  function parseLinks(row) {
    var arr = row && row.links;
    if (typeof arr === "string") { try { arr = JSON.parse(arr); } catch (e) { arr = []; } }
    if (!Array.isArray(arr)) return [];
    return arr.map(function (l) {
      var url = safeUrl(l && l.url);
      return url ? { label: String((l && l.label) || "").slice(0, 40), url: url } : null;
    }).filter(Boolean).slice(0, 6);
  }
  function normArt(row) {
    return {
      id: row.id, title: row.title, author: row.author, category: row.category || "资讯",
      summary: row.summary || "", content: row.content || "", links: parseLinks(row),
      spoiler: !!row.spoiler, status: row.status, pinned: !!row.pinned,
      likes: Number(row.like_count || 0), favs: Number(row.favorite_count || 0),
      views: Number(row.view_count || 0), note: row.review_note || "",
      ts: Date.parse(row.created_at) || Date.now(),
      created: row.created_at
    };
  }
  function catClass(c) {
    return { "资讯": "c-info", "预告解析": "c-trailer", "剧情考据": "c-lore", "演员动态": "c-cast", "观后感": "c-review" }[c] || "c-info";
  }

  /* ---------------- Supabase ---------------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function loadLib() {
    if (window.supabase) return Promise.resolve();
    return loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2")
      .catch(function () { return loadScript("https://unpkg.com/@supabase/supabase-js@2"); });
  }
  function configured() { return !!(CLOUD.supabaseUrl && CLOUD.supabaseAnonKey); }

  function probeV3() {
    if (!ready) { v3 = false; toggleNotice(); return Promise.resolve(false); }
    return sb.from("articles").select("id").limit(1).then(function (r) {
      v3 = !r.error;
      toggleNotice();
      return v3;
    }).catch(function () { v3 = false; toggleNotice(); return false; });
  }
  function toggleNotice() {
    var sec = $("#v3NoticeSection");
    if (sec) sec.style.display = (ready && v3 === false) ? "" : "none";
  }
  function copyV3() {
    var url = "docs/supabase-migration-v3.sql";
    var fb = function (t) {
      try {
        var ta = document.createElement("textarea");
        ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        flash("升级脚本已复制 → 粘到 Supabase 的 SQL Editor 里点 Run");
      } catch (e) { window.open(url, "_blank"); }
    };
    fetch(url).then(function (r) { return r.text(); }).then(function (t) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { flash("升级脚本已复制 → 粘到 Supabase 的 SQL Editor 里点 Run"); }, function () { fb(t); });
      } else fb(t);
    }).catch(function () { window.open(url, "_blank"); });
  }

  /* ---------------- 加载数据 ---------------- */
  function loadArticles() {
    if (!ready || v3 === false) { ARTICLES = []; renderAll(); return Promise.resolve(); }
    return sb.from("articles").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(300)
      .then(function (r) {
        ARTICLES = (r.error ? [] : (r.data || [])).map(normArt);
        renderAll();
      });
  }
  function loadMyMarks() {
    if (!ready || v3 === false) return Promise.resolve();
    return Promise.all([
      sb.from("article_likes").select("article_id").eq("visitor_id", visitorId()),
      sb.from("article_favorites").select("article_id").eq("visitor_id", visitorId())
    ]).then(function (res) {
      if (!res[0].error && res[0].data) writeJSON(KEY_LIKED, res[0].data.map(function (x) { return x.article_id; }));
      if (!res[1].error && res[1].data) writeJSON(KEY_FAV, res[1].data.map(function (x) { return x.article_id; }));
      renderAll();
    }).catch(function () { });
  }

  /* ---------------- 统计 / 筛选 ---------------- */
  function renderStats() {
    var box = $("#artStats");
    if (!box) return;
    var likes = ARTICLES.reduce(function (s, a) { return s + a.likes; }, 0);
    var cm = ARTICLES.reduce(function (s, a) { return s + (a._cm || 0); }, 0);
    box.innerHTML =
      '<div class="stat"><b>' + ARTICLES.length + '</b><span>篇已发布投稿</span></div>' +
      '<div class="stat"><b>' + likes + '</b><span>累计点赞</span></div>' +
      '<div class="stat"><b>' + favIds().length + '</b><span>我收藏的</span></div>' +
      '<div class="stat"><b>' + (ready ? (v3 === false ? "待升级" : "云端") : "连接中") + '</b><span>数据模式</span></div>';
  }
  function renderFilters() {
    var cats = [{ id: "all", name: "全部分类" }].concat(CATS.map(function (c) { return { id: c, name: c }; }));
    var cb = $("#artCats");
    if (cb) cb.innerHTML = '<span class="filter-label">分类</span>' + cats.map(function (c) {
      return '<button class="chip' + (state.cat === c.id ? " active" : "") + '" data-cat="' + esc(c.id) + '">' + esc(c.name) + "</button>";
    }).join("");
    var sbx = $("#artSorts");
    if (sbx) sbx.innerHTML = '<span class="filter-label">排序</span>' + SORTS.map(function (s) {
      return '<button class="chip' + (state.sort === s.id ? " active" : "") + '" data-sort="' + esc(s.id) + '">' + esc(s.name) + "</button>";
    }).join("");
  }
  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = ARTICLES.filter(function (a) {
      if (state.cat !== "all" && a.category !== state.cat) return false;
      if (state.mineMode === "fav" && state.view === "mine" && !hasFav(a.id)) return false;
      if (!q) return true;
      return (a.title + " " + a.author + " " + a.summary + " " + a.content).toLowerCase().indexOf(q) !== -1;
    });
    list.sort(function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      if (state.sort === "hot") return b.likes - a.likes || b.ts - a.ts;
      if (state.sort === "fav") return b.favs - a.favs || b.ts - a.ts;
      return b.ts - a.ts;
    });
    return list;
  }

  /* ---------------- 列表 ---------------- */
  function cardHtml(a, opts) {
    opts = opts || {};
    var links = a.links.length ? '<span class="art-meta-item">🔗 ' + a.links.length + " 个链接</span>" : "";
    return '<article class="art-card" data-art="' + esc(a.id) + '">' +
      (a.pinned ? '<span class="art-pin">已置顶</span>' : "") +
      '<div class="art-card-head">' +
      '<span class="art-cat ' + catClass(a.category) + '">' + esc(a.category) + "</span>" +
      (a.spoiler ? '<span class="art-spoiler-tag">剧透</span>' : "") +
      (opts.statusTag || "") +
      '<span class="art-date">' + esc(fmt(a.created)) + "</span></div>" +
      '<h3 class="art-title">' + esc(a.title) + "</h3>" +
      (a.summary ? '<p class="art-summary">' + esc(a.summary) + "</p>" : "") +
      '<div class="art-meta">' +
      '<span class="art-meta-item">✍️ ' + esc(a.author) + "</span>" +
      '<span class="art-meta-item">👁 ' + a.views + "</span>" +
      '<span class="art-meta-item">❤ ' + a.likes + "</span>" +
      '<span class="art-meta-item">⭐ ' + a.favs + "</span>" +
      links +
      "</div>" +
      (opts.adminBar || "") +
      "</article>";
  }
  function renderList() {
    var list = filtered();
    var box = $("#artList");
    var cnt = $("#artCount"), empty = $("#artEmpty");
    if (cnt) cnt.textContent = "(" + list.length + " 篇)";
    if (!list.length) {
      box.innerHTML = "";
      if (empty) {
        empty.classList.remove("hidden");
        empty.textContent = !configured() ? "留言板未配置云端存储,投稿板块暂不可用。"
          : (ready && v3 === false) ? "投稿板块需要先完成一次数据库升级(见上方提示)。"
            : "还没有已发布的投稿 —— 点上面的「✍️ 我要投稿」来发第一篇吧!";
      }
      return;
    }
    if (empty) empty.classList.add("hidden");
    box.innerHTML = list.map(function (a) { return cardHtml(a); }).join("");
  }

  /* ---------------- 详情 ---------------- */
  function renderDetail(id) {
    var a = null;
    for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) a = ARTICLES[i];
    if (!a) { show("list"); return; }
    state.current = a;
    var links = a.links.length
      ? '<div class="art-links-view"><b>🔗 相关网址</b>' + a.links.map(function (l) {
        return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer nofollow">' +
          (l.label ? esc(l.label) + " — " : "") + esc(l.url.replace(/^https?:\/\//, "").slice(0, 60)) + "</a>";
      }).join("") + "</div>"
      : "";
    var paras = String(a.content).split(/\n{1,}/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");

    $("#artDetail").innerHTML =
      '<div class="art-card-head">' +
      '<span class="art-cat ' + catClass(a.category) + '">' + esc(a.category) + "</span>" +
      (a.spoiler ? '<span class="art-spoiler-tag">含剧透</span>' : "") +
      '<span class="art-date">' + esc(fmt(a.created)) + "</span></div>" +
      '<h1 class="art-detail-title">' + esc(a.title) + "</h1>" +
      '<div class="art-meta"><span class="art-meta-item">✍️ ' + esc(a.author) + "</span>" +
      '<span class="art-meta-item">👁 ' + a.views + " 次阅读</span>" +
      '<span class="art-meta-item">💬 <span id="artCmInline">…</span></span></div>' +
      '<div class="art-body">' + paras + "</div>" +
      links +
      '<div class="art-actions">' +
      '<button class="art-act' + (hasLiked(a.id) ? " on" : "") + '" id="artLikeBtn">' + (hasLiked(a.id) ? "❤" : "♡") + " 点赞 " + a.likes + "</button>" +
      '<button class="art-act' + (hasFav(a.id) ? " on fav" : "") + '" id="artFavBtn">' + (hasFav(a.id) ? "★" : "☆") + " " + (hasFav(a.id) ? "已收藏" : "收藏") + " " + a.favs + "</button>" +
      '<button class="art-act" id="artShareBtn">🔗 复制链接</button>' +
      "</div>";

    $("#artLikeBtn").addEventListener("click", function () { likeArticle(a.id); });
    $("#artFavBtn").addEventListener("click", function () { toggleFav(a.id); });
    $("#artShareBtn").addEventListener("click", function () {
      var u = location.origin + location.pathname + "#a=" + a.id;
      if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { flash("文章链接已复制,可以发给朋友了"); });
      else window.prompt("复制这个链接:", u);
    });

    /* 阅读数 +1(不阻塞渲染) */
    if (ready && v3 !== false) {
      sb.rpc("view_article", { p_article: a.id }).then(function (r) {
        if (!r.error && r.data != null) a.views = Number(r.data);
      }).catch(function () { });
    }
    loadComments(a.id);
  }

  /* ---------------- 文章评论(楼中楼 + 点赞) ---------------- */
  function loadComments(articleId) {
    var box = $("#artCmList");
    if (!box) return;
    if (!ready || v3 === false) { box.innerHTML = '<p class="cm-empty">评论需要云端数据库支持。</p>'; return; }
    box.innerHTML = '<p class="cm-empty">正在加载评论…</p>';
    return sb.from("comments").select("*").eq("article_id", articleId).order("created_at", { ascending: true }).limit(500)
      .then(function (r) {
        var list = (r.error ? [] : (r.data || [])).map(function (row) {
          return {
            id: row.id, name: row.name, content: row.content, ts: Date.parse(row.created_at) || Date.now(),
            parentId: row.parent_id || null, likes: Number(row.like_count || 0)
          };
        });
        CACHE.comms[articleId] = list;
        renderComments(articleId);
      });
  }
  function buildTree(list) {
    var tops = [], byParent = {};
    list.forEach(function (c) {
      if (c.parentId) (byParent[c.parentId] = byParent[c.parentId] || []).push(c); else tops.push(c);
    });
    tops.sort(function (a, b) { return b.ts - a.ts; });
    Object.keys(byParent).forEach(function (k) { byParent[k].sort(function (a, b) { return a.ts - b.ts; }); });
    return { tops: tops, children: byParent };
  }
  function renderComments(articleId) {
    var list = CACHE.comms[articleId] || [];
    var tree = buildTree(list);
    var cnt = $("#artCmCount");
    if (cnt) cnt.textContent = list.length ? "(" + list.length + " 条)" : "";
    var inline = $("#artCmInline");
    if (inline) inline.textContent = list.length;
    var box = $("#artCmList");
    if (!box) return;
    if (!list.length) { box.innerHTML = '<p class="cm-empty">还没有评论,来说第一句吧 👋</p>'; renderReplyBar(); return; }
    function nameOf(id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name; return "已删除"; }
    function item(c, isChild) {
      return '<article class="cm-item' + (isChild ? " cm-child" : "") + '" data-id="' + esc(c.id) + '">' +
        '<div class="cm-head"><span class="cm-name">' + esc(c.name) + "</span>" +
        (isChild ? '<span class="cm-at">回复 @' + esc(nameOf(c.parentId)) + "</span>" : "") +
        '<span class="cm-time">' + esc(fmt(c.ts)) + "</span></div>" +
        '<div class="cm-text">' + esc(c.content) + "</div>" +
        '<div class="cm-actions">' +
        '<button class="cm-like' + (hasLiked(c.id) ? " liked" : "") + '" data-act="clike" data-id="' + esc(c.id) + '">' +
        (hasLiked(c.id) ? "❤" : "♡") + " " + c.likes + "</button>" +
        '<button data-act="creply" data-id="' + esc(c.id) + '">回复</button>' +
        (user ? '<button class="danger" data-act="cdel" data-id="' + esc(c.id) + '">删除</button>' : "") +
        "</div></article>";
    }
    box.innerHTML = tree.tops.map(function (c) {
      var kids = tree.children[c.id] || [];
      return item(c, false) + (kids.length ? '<div class="cm-children">' + kids.map(function (k) { return item(k, true); }).join("") + "</div>" : "");
    }).join("");
    renderReplyBar();
  }
  function renderReplyBar() {
    var bar = $("#artReplyBar");
    if (!bar) return;
    if (!state.replyTo) { bar.classList.remove("show"); bar.innerHTML = ""; return; }
    bar.classList.add("show");
    bar.innerHTML = "正在回复 <b>@" + esc(state.replyTo.name) + "</b>" + ' <button type="button" data-act="ccancel">取消</button>';
  }
  function submitComment() {
    var nameEl = $("#acName"), contentEl = $("#acContent"), t = $("#acTip");
    var name = (nameEl ? nameEl.value : "").trim();
    var content = (contentEl ? contentEl.value : "").trim();
    if (name.length < 2 || name.length > 16) { tip(t, "err", "✕ 昵称需要 2-16 个字"); return; }
    if (content.length < 4) { tip(t, "err", "✕ 评论至少 4 个字"); return; }
    if (content.length > 500) { tip(t, "err", "✕ 评论最多 500 字"); return; }
    if (!ready || v3 === false) { tip(t, "err", "✕ 评论需要云端数据库支持"); return; }
    var a = state.current;
    if (!a) return;
    var row = { name: name, content: content, type: "评论", article_id: a.id };
    if (state.replyTo) row.parent_id = state.replyTo.id;
    tip(t, "", "正在发布…");
    sb.from("comments").insert([row]).then(function (r) {
      if (r.error) { tip(t, "err", "✕ 发布失败:" + r.error.message); return; }
      contentEl.value = ""; $("#acCounter").textContent = "0/500";
      state.replyTo = null; renderReplyBar();
      tip(t, "ok", "✓ 评论已发布");
      loadComments(a.id);
    });
  }
  function likeComment(id) {
    if (hasLiked(id)) { flash("你已经点过赞啦 👍"); return; }
    if (!ready) return;
    markLiked(id);
    var list = CACHE.comms[state.current.id] || [];
    list.forEach(function (c) { if (c.id === id) c.likes++; });
    renderComments(state.current.id);
    sb.rpc("like_comment", { p_comment: id, p_visitor: visitorId() }).then(function (r) {
      if (r.error) {
        unmarkLiked(id);
        var l2 = CACHE.comms[state.current.id] || [];
        l2.forEach(function (c) { if (c.id === id) c.likes = Math.max(0, c.likes - 1); });
        renderComments(state.current.id);
        flash("点赞失败:" + (r.error.message || ""));
        return;
      }
      var l3 = CACHE.comms[state.current.id] || [];
      l3.forEach(function (c) { if (c.id === id) c.likes = Number(r.data || c.likes); });
      renderComments(state.current.id);
    });
  }
  function delComment(id) {
    if (!window.confirm("确定删除这条评论?下面的回复会一起删除。")) return;
    sb.from("comments").delete().eq("id", id).then(function (r) {
      if (r.error) { window.alert("删除失败:" + r.error.message); return; }
      loadComments(state.current.id);
    });
  }

  /* ---------------- 文章点赞 / 收藏 ---------------- */
  function likeArticle(id) {
    if (hasLiked(id)) { flash("你已经赞过这篇了 👍"); return; }
    if (!ready || v3 === false) { flash("点赞需要先完成数据库升级"); return; }
    markLiked(id);
    var a = byId(id); if (a) a.likes++;
    refreshDetailActions(); renderList(); renderStats();
    sb.rpc("like_article", { p_article: id, p_visitor: visitorId() }).then(function (r) {
      if (r.error) {
        unmarkLiked(id);
        var a2 = byId(id); if (a2) a2.likes = Math.max(0, a2.likes - 1);
        refreshDetailActions(); renderList(); renderStats();
        flash("点赞失败:" + (r.error.message || ""));
        return;
      }
      var a3 = byId(id); if (a3) a3.likes = Number(r.data || 0);
      refreshDetailActions(); renderList(); renderStats();
    });
  }
  function toggleFav(id) {
    if (!ready || v3 === false) { flash("收藏需要先完成数据库升级"); return; }
    var on = !hasFav(id);
    markFav(id, on);
    var a = byId(id); if (a) a.favs = Math.max(0, a.favs + (on ? 1 : -1));
    refreshDetailActions(); renderList(); renderStats();
    var fn = on ? "favorite_article" : "unfavorite_article";
    sb.rpc(fn, { p_article: id, p_visitor: visitorId() }).then(function (r) {
      if (r.error) { markFav(id, !on); flash("操作失败:" + (r.error.message || "")); return; }
      var a2 = byId(id); if (a2) a2.favs = Number(r.data || 0);
      refreshDetailActions(); renderList(); renderStats();
      flash(on ? "已加入收藏,可在「我的收藏」里找到" : "已取消收藏");
    });
  }
  function byId(id) { for (var i = 0; i < ARTICLES.length; i++) if (ARTICLES[i].id === id) return ARTICLES[i]; return null; }
  function refreshDetailActions() {
    var a = state.current;
    if (!a || state.view !== "detail") return;
    var lb = $("#artLikeBtn"), fb = $("#artFavBtn");
    if (lb) { lb.classList.toggle("on", hasLiked(a.id)); lb.innerHTML = (hasLiked(a.id) ? "❤" : "♡") + " 点赞 " + a.likes; }
    if (fb) {
      fb.classList.toggle("on", hasFav(a.id)); fb.classList.toggle("fav", hasFav(a.id));
      fb.innerHTML = (hasFav(a.id) ? "★" : "☆") + " " + (hasFav(a.id) ? "已收藏" : "收藏") + " " + a.favs;
    }
  }

  /* ---------------- 投稿 ---------------- */
  function addLinkRow(label, url) {
    var box = $("#arLinkRows");
    if (!box) return;
    if (box.children.length >= MAX_LINKS) { tip($("#arTip"), "err", "✕ 最多 3 条链接"); return; }
    var row = document.createElement("div");
    row.className = "art-link-row";
    row.innerHTML = '<input class="al-label" type="text" maxlength="40" placeholder="链接名称(如:官方预告)" value="' + esc(label || "") + '" />' +
      '<input class="al-url" type="url" maxlength="500" placeholder="https://…" value="' + esc(url || "") + '" />' +
      '<button type="button" class="al-del" title="删除这条">✕</button>';
    box.appendChild(row);
  }
  function submitArticle() {
    var t = $("#arTip");
    var name = ($("#arName").value || "").trim();
    var title = ($("#arTitle").value || "").trim();
    var cat = $("#arCat").value || "资讯";
    var summary = ($("#arSummary").value || "").trim();
    var content = ($("#arContent").value || "").trim();
    var spoiler = !!($("#arSpoiler") && $("#arSpoiler").checked);

    if (name.length < 2 || name.length > 16) { tip(t, "err", "✕ 昵称需要 2-16 个字"); return; }
    if (title.length < 4 || title.length > 120) { tip(t, "err", "✕ 标题需要 4-120 个字"); return; }
    if (content.length < 20) { tip(t, "err", "✕ 正文至少 20 个字,请把资讯内容写清楚"); return; }

    var links = [];
    Array.prototype.forEach.call(document.querySelectorAll("#arLinkRows .art-link-row"), function (row) {
      var label = row.querySelector(".al-label").value.trim();
      var raw = row.querySelector(".al-url").value.trim();
      if (!raw) return;
      var url = safeUrl(raw);
      if (!url) { links.push({ bad: raw }); return; }
      links.push({ label: label || "", url: url });
    });
    var bad = links.filter(function (l) { return l.bad; });
    if (bad.length) { tip(t, "err", "✕ 网址只能是 http/https,请检查:" + bad[0].bad); return; }
    if (!ready || v3 === false) { tip(t, "err", "✕ 投稿需要先完成数据库升级(见页面顶部提示)"); return; }

    var row = {
      title: title, author: name, author_visitor: visitorId(), category: cat,
      summary: summary.slice(0, 120), content: content, links: links, spoiler: spoiler
    };
    tip(t, "", "正在提交…");
    sb.from("articles").insert([row]).then(function (r) {
      if (r.error) { tip(t, "err", "✕ 提交失败:" + r.error.message); return; }
      ["#arTitle", "#arSummary", "#arContent"].forEach(function (s) { var el = $(s); if (el) el.value = ""; });
      $("#arLinkRows").innerHTML = ""; addLinkRow();
      tip(t, "ok", "✓ 已提交,等待站长审核(通常 1-2 天);可在「📄 我的投稿」里查看状态");
    });
  }

  /* ---------------- 我的投稿 / 收藏 ---------------- */
  function renderMine() {
    var box = $("#mineList"), hint = $("#mineHint");
    if (!box) return;
    if (state.mineMode === "fav") {
      $("#mineTitle").textContent = "⭐ 我的收藏";
      var favs = ARTICLES.filter(function (a) { return hasFav(a.id); });
      if (hint) hint.textContent = favs.length ? "收藏只保存在你这台设备上,换设备看不到。" : "";
      box.innerHTML = favs.length ? favs.map(function (a) { return cardHtml(a); }).join("")
        : '<p class="cm-empty">还没有收藏 —— 打开一篇文章,点「☆ 收藏」就会出现在这里。</p>';
      return;
    }
    $("#mineTitle").textContent = "📄 我的投稿";
    if (hint) hint.textContent = "这里能看到你投过的文章和审核状态;投稿只按浏览器记录,换设备/清缓存后看不到。";
    if (!ready || v3 === false) { box.innerHTML = '<p class="cm-empty">需要云端数据库支持。</p>'; return; }
    box.innerHTML = '<p class="cm-empty">正在加载…</p>';
    sb.rpc("my_articles", { p_visitor: visitorId() }).then(function (r) {
      if (r.error) { box.innerHTML = '<p class="cm-empty">加载失败:' + esc(r.error.message) + "</p>"; return; }
      var list = (r.data || []).map(normArt);
      if (!list.length) { box.innerHTML = '<p class="cm-empty">还没有投过稿 —— 点「✍️ 我要投稿」写第一篇吧!</p>'; return; }
      box.innerHTML = list.map(function (a) {
        var tag = a.status === "approved" ? '<span class="art-status ok">已通过</span>'
          : a.status === "rejected" ? '<span class="art-status no">未通过</span>'
            : '<span class="art-status wait">待审核</span>';
        var note = a.note ? '<p class="art-note">站长备注:' + esc(a.note) + "</p>" : "";
        return cardHtml(a, { statusTag: tag }) + note;
      }).join("");
    });
  }

  /* ---------------- 站长管理 ---------------- */
  function syncAdmin() {
    var login = $("#artAdminLogin"), panel = $("#artAdminPanel");
    if (!login || !panel) return;
    var on = !!user;
    login.classList.toggle("hidden", on);
    panel.classList.toggle("hidden", !on);
    if (on) renderAdmin();
  }
  function renderAdmin() {
    if (!ready) return;
    sb.from("articles").select("*").order("created_at", { ascending: false }).limit(300).then(function (r) {
      if (r.error) { window.alert("读取失败:" + r.error.message); return; }
      var all = (r.data || []).map(normArt);
      var pend = all.filter(function (a) { return a.status === "pending"; });
      var pub = all.filter(function (a) { return a.status === "approved"; });
      var rej = all.filter(function (a) { return a.status === "rejected"; });
      $("#pendingCount").textContent = "(" + pend.length + " 篇)";
      $("#publishedCount").textContent = "(" + pub.length + " 篇已发布 · " + rej.length + " 篇未通过)";
      $("#pendingList").innerHTML = pend.length ? pend.map(function (a) {
        return cardHtml(a, {
          statusTag: '<span class="art-status wait">待审核</span>',
          adminBar: '<div class="art-admin-bar">' +
            '<button class="btn btn-primary btn-sm" data-admin="approve" data-id="' + esc(a.id) + '">✓ 通过</button>' +
            '<button class="btn btn-ghost btn-sm" data-admin="reject" data-id="' + esc(a.id) + '">✕ 驳回</button>' +
            '<button class="btn btn-ghost btn-sm" data-admin="del" data-id="' + esc(a.id) + '">删除</button>' +
            "</div>"
        });
      }).join("") : '<p class="cm-empty">没有待审核的投稿 🎉</p>';
      $("#publishedList").innerHTML = pub.concat(rej).map(function (a) {
        return cardHtml(a, {
          statusTag: a.status === "approved" ? '<span class="art-status ok">已发布</span>' : '<span class="art-status no">已驳回</span>',
          adminBar: '<div class="art-admin-bar">' +
            '<button class="btn btn-ghost btn-sm" data-admin="pin" data-id="' + esc(a.id) + '">' + (a.pinned ? "取消置顶" : "置顶") + "</button>" +
            (a.status === "rejected" ? '<button class="btn btn-ghost btn-sm" data-admin="approve" data-id="' + esc(a.id) + '">改为通过</button>' : "") +
            '<button class="btn btn-ghost btn-sm" data-admin="del" data-id="' + esc(a.id) + '">删除</button>' +
            "</div>"
        });
      }).join("") || '<p class="cm-empty">暂无已发布文章。</p>';
    });
  }
  function adminAct(act, id) {
    if (act === "approve") {
      sb.from("articles").update({ status: "approved", reviewed_at: new Date().toISOString(), review_note: "" }).eq("id", id)
        .then(function (r) { if (r.error) window.alert("操作失败:" + r.error.message); else { renderAdmin(); loadArticles(); } });
    } else if (act === "reject") {
      var note = window.prompt("驳回理由(会显示给投稿人,可留空):", "内容需要补充来源或修改标题");
      if (note === null) return;
      sb.from("articles").update({ status: "rejected", reviewed_at: new Date().toISOString(), review_note: note }).eq("id", id)
        .then(function (r) { if (r.error) window.alert("操作失败:" + r.error.message); else { renderAdmin(); loadArticles(); } });
    } else if (act === "pin") {
      sb.from("articles").select("pinned").eq("id", id).limit(1).then(function (r) {
        var cur = !r.error && r.data && r.data[0] ? !!r.data[0].pinned : false;
        return sb.from("articles").update({ pinned: !cur }).eq("id", id);
      }).then(function (r2) { if (r2 && r2.error) window.alert("操作失败:" + r2.error.message); else { renderAdmin(); loadArticles(); } });
    } else if (act === "del") {
      if (!window.confirm("确定删除这篇文章?它下面的评论会一起删除,不可恢复。")) return;
      sb.from("articles").delete().eq("id", id)
        .then(function (r) { if (r.error) window.alert("删除失败:" + r.error.message); else { renderAdmin(); loadArticles(); } });
    }
  }
  function adminLogin() {
    var email = ($("#artAdminEmail").value || "").trim();
    var pwd = $("#artAdminPwd").value || "";
    var t = $("#artAdminTip");
    if (!email || !pwd) { tip(t, "err", "✕ 请填写邮箱与密码"); return; }
    tip(t, "", "正在登录…");
    sb.auth.signInWithPassword({ email: email, password: pwd }).then(function (r) {
      if (r.error) { tip(t, "err", "✕ 登录失败:" + r.error.message); return; }
      user = r.data.user;
      tip(t, "ok", "✓ 登录成功");
      syncAdmin();
    });
  }
  function adminLogout() { sb.auth.signOut().then(function () { user = null; syncAdmin(); }); }

  /* ---------------- 视图切换 ---------------- */
  var VIEWS = ["list", "detail", "submit", "mine", "admin"];
  function show(v) {
    state.view = v;
    VIEWS.forEach(function (k) {
      var el = $("#art" + k.charAt(0).toUpperCase() + k.slice(1) + "View");
      if (el) el.classList.toggle("hidden", k !== v);
    });
    var tb = $("#artToolbar");
    if (tb) tb.classList.toggle("hidden", v === "detail");
    if (v === "mine") renderMine();
    if (v === "admin") syncAdmin();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function route() {
    var h = location.hash || "";
    var m = /^#a=([\w-]+)/.exec(h);
    if (m) { show("detail"); renderDetail(m[1]); return; }
    if (h === "#submit") { show("submit"); return; }
    if (h === "#mine") { state.mineMode = "mine"; show("mine"); return; }
    if (h === "#fav") { state.mineMode = "fav"; show("mine"); return; }
    if (h === "#admin") { show("admin"); return; }
    show("list");
  }
  function renderAll() { renderStats(); renderFilters(); renderList(); }

  /* ---------------- 事件 ---------------- */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target; if (!t || !t.closest) return;

      var card = t.closest("[data-art]");
      if (card && !t.closest("[data-admin]")) { location.hash = "a=" + card.dataset.art; return; }

      var cat = t.closest("[data-cat]");
      if (cat) { state.cat = cat.dataset.cat; renderFilters(); renderList(); return; }
      var srt = t.closest("[data-sort]");
      if (srt) { state.sort = srt.dataset.sort; renderFilters(); renderList(); return; }

      var ad = t.closest("[data-admin]");
      if (ad) { adminAct(ad.dataset.admin, ad.dataset.id); return; }

      var act = t.closest("[data-act]");
      if (act) {
        var id = act.dataset.id, what = act.dataset.act;
        if (what === "clike") likeComment(id);
        else if (what === "creply") {
          var list = CACHE.comms[state.current.id] || [];
          for (var i = 0; i < list.length; i++) if (list[i].id === id) state.replyTo = { id: id, name: list[i].name };
          renderReplyBar();
          var ta = $("#acContent"); if (ta) { ta.focus(); ta.scrollIntoView({ block: "center", behavior: "smooth" }); }
        } else if (what === "ccancel") { state.replyTo = null; renderReplyBar(); }
        else if (what === "cdel") delComment(id);
        return;
      }

      if (t.closest("#btnSubmit")) { location.hash = "submit"; return; }
      if (t.closest("#btnMine")) { location.hash = "mine"; return; }
      if (t.closest("#btnFav")) { location.hash = "fav"; return; }
      if (t.closest("#btnAdmin")) { location.hash = "admin"; return; }
      if (t.closest("#btnBack") || t.closest("#btnSubmitBack") || t.closest("#btnMineBack") || t.closest("#btnAdminBack")) {
        location.hash = ""; return;
      }
      if (t.closest("#arAddLink")) { addLinkRow(); return; }
      if (t.closest(".al-del")) { var r = t.closest(".art-link-row"); if (r) r.remove(); return; }
      if (t.closest("#v3Copy")) { copyV3(); return; }
      if (t.closest("#artAdminLoginBtn")) { adminLogin(); return; }
      if (t.closest("#artAdminLogout")) { adminLogout(); return; }
      var navL = t.closest(".nav a"); if (navL) $("#nav").classList.remove("open");
    });

    var si = $("#artSearch");
    if (si) si.addEventListener("input", function () { state.q = si.value; renderList(); });
    var ac = $("#acContent"), acc = $("#acCounter");
    if (ac && acc) ac.addEventListener("input", function () { acc.textContent = ac.value.length + "/500"; });
    var arc = $("#arContent"), arcC = $("#arCounter");
    if (arc && arcC) arc.addEventListener("input", function () { arcC.textContent = arc.value.length + "/20000"; });
    var asub = $("#acSubmit"); if (asub) asub.addEventListener("click", submitComment);
    var arsub = $("#arSubmit"); if (arsub) arsub.addEventListener("click", submitArticle);
    var nt = $("#navToggle"); if (nt) nt.addEventListener("click", function () { $("#nav").classList.toggle("open"); });
    window.addEventListener("hashchange", route);
  }

  /* ---------------- 启动 ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    bind();
    renderAll();
    addLinkRow();
    if (!configured()) { show("list"); renderList(); return; }
    loadLib().then(function () {
      sb = window.supabase.createClient(CLOUD.supabaseUrl, CLOUD.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      return sb.auth.getSession();
    }).then(function (s) {
      user = s && s.data && s.data.session ? s.data.session.user : null;
      ready = true;
      if (sb.auth.onAuthStateChange) {
        sb.auth.onAuthStateChange(function (_e, sess) { user = sess ? sess.user : null; syncAdmin(); });
      }
      return probeV3();
    }).then(function () {
      return loadArticles();
    }).then(function () {
      return loadMyMarks();
    }).then(function () {
      route();
    }).catch(function (e) {
      ready = false;
      var empty = $("#artEmpty");
      if (empty) { empty.classList.remove("hidden"); empty.textContent = "云端连接失败:" + ((e && e.message) || e); }
    });
  });

  /* 供测试使用 */
  window.ArticlesBoard = {
    state: state, safeUrl: safeUrl, normArt: normArt, parseLinks: parseLinks,
    cardHtml: cardHtml, buildTree: buildTree, CATS: CATS,
    setArticles: function (l) { ARTICLES = (l || []).map(function (x) { return x && x.links !== undefined && x.status ? normArt(x) : x; }); renderAll(); },
    setComments: function (articleId, list) { CACHE.comms[articleId] = list; renderComments(articleId); },
    setView: function (v) { show(v); }, openDetail: renderDetail,
    hasLiked: hasLiked, hasFav: hasFav, visitorId: visitorId
  };
})();
