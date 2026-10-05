/* =========================================================
   毁灭之日观影指南 — 渲染逻辑
   ========================================================= */
(function () {
  "use strict";

  var ALL = [].concat(FILMS, TV_SHOWS.map(function (t) { return Object.assign({}, t, { isTV: true }); }));

  var REL_LABEL = {
    direct: "直接相关", context: "重要背景", minor: "一般关联", info: "番外"
  };

  /* ---------------- 电影速览 ---------------- */
  var FACTS = [
    { label: "片名", value: "复仇者联盟5:毁灭之日", sub: "Avengers: Doomsday" },
    { label: "北美上映", value: "2026年12月18日", sub: "有改档传闻,以官方为准" },
    { label: "导演", value: "罗素兄弟", sub: "《美队2/3》《复联3/4》导演" },
    { label: "编剧", value: "Stephen McFeely", sub: "复联3/4 编剧" },
    { label: "核心反派", value: "毁灭博士", sub: "小罗伯特·唐尼 饰演" },
    { label: "剧情关键词", value: "三大宇宙碰撞", sub: "主宇宙 × X战警宇宙 × 第三宇宙" },
    { label: "视觉标志", value: "哨兵(Sentinel)军团", sub: "Doom 指挥的机器人大军" },
    { label: "官方卡司规模", value: "约 30+ 人", sub: "已公布名单仍在扩充" }
  ];

  /* ---------------- 观看路线 ---------------- */
  var ROUTES = {
    quick: {
      name: "速通路线(3天版)",
      desc: "只补最相关的:这 12 部看完全够看懂复联5主线。",
      items: [
        { t: "复仇者联盟3:无限战争", d: "灭霸与响指,多元宇宙伏笔开始" },
        { t: "复仇者联盟4:终局之战", d: "托尼之死与时间旅行的遗产" },
        { t: "蜘蛛侠:英雄无归", d: "多元宇宙第一次大规模穿帮" },
        { t: "奇异博士2:疯狂多元宇宙", d: "838宇宙与光照会" },
        { t: "死侍与金刚狼", d: "福克斯宇宙并入MCU的官方说明书" },
        { t: "神奇四侠:第一步", d: "毁灭博士的老对手与'娘家'" },
        { t: "蚁人与黄蜂女:量子狂潮", d: "征服者康与时间线乱局" },
        { t: "雷霆特工队*", d: "哨兵/虚无与瓦莲蒂娜的棋局" },
        { t: "美国队长4", d: "新复仇者的政治格局" },
        { t: "洛基(剧集)", d: "TVA、康之死、时间树——必看" },
        { t: "假如…?(剧集)", d: "多元宇宙的可视化教材" },
        { t: "X战警:逆转未来", d: "哨兵与时间线重写" }
      ]
    },
    mcu: {
      name: "漫威影业主线(完整)",
      desc: "按时间顺序把MCU全部看完,适合第一次系统补课。",
      items: [
        { t: "第一阶段:钢铁侠→复仇者联盟", d: "2008-2012,初代集结" },
        { t: "第二阶段:钢铁侠3→蚁人", d: "2013-2015,宝石与分裂伏笔" },
        { t: "第三阶段:美队3→英雄远征", d: "2016-2019,无限传奇高潮" },
        { t: "第四阶段:黑寡妇→黑豹2", d: "2021-2022,多元宇宙开启" },
        { t: "第五阶段:蚁人3→雷霆特工队*", d: "2023-2025,新复仇者成型" },
        { t: "第六阶段:神奇四侠→复联5/6", d: "2025-2027,多元宇宙大战" },
        { t: "穿插剧集:洛基/旺达幻视/假如…?", d: "多元宇宙三条关键线" }
      ]
    },
    all: {
      name: "全宇宙扩展(硬核版)",
      desc: "把福克斯、索尼与老漫威片也扫一遍,彩蛋全懂。",
      items: [
        { t: "X战警系:第一战→逆转未来→天启→黑凤凰", d: "福克斯变种人正史" },
        { t: "金刚狼系:金刚狼1-3", d: "罗根的一生与'最烂变体'" },
        { t: "死侍1-2", d: "打破第四面墙的破壁人" },
        { t: "神奇四侠(2005/2007)", d: "毁灭博士的真人起源" },
        { t: "托比/加菲蜘蛛侠六部", d: "多元宇宙蜘蛛侠的前世" },
        { t: "毒液1-3", d: "索尼宇宙与MCU的串门" },
        { t: "蜘蛛侠:平行宇宙/纵横宇宙", d: "动画版多元宇宙教材" },
        { t: "老漫威片:刀锋/夜魔侠/惩罚者等", d: "死侍与金刚狼里的老面孔" }
      ]
    }
  };

  /* ---------------- FAQ ---------------- */
  var FAQS = [
    {
      q: "不看之前的电影,能直接看复联5吗?",
      a: "能看懂'打起来',但会错过大量情绪与信息。《复联5》是40多年漫威改编史的大汇总:谁是谁、为什么他们一见面就能喊出彼此的名字、为什么唐尼的脸是毁灭博士、哨兵是什么——这些全靠前作。如果真的没时间,先用「速通路线」补最相关的 12 部。"
    },
    {
      q: "为什么小罗伯特·唐尼演毁灭博士?他不是钢铁侠吗?",
      a: "官方说法是唐尼本人主动请缨,想饰演漫威的'终极反派'(RDJ 在 SDCC 2024 现场亲自公布)。片名也从原定的《复仇者联盟5:康之王朝》改为《毁灭之日》。至于'毁灭博士是不是托尼·斯塔克的变体'——这是粉丝热门理论,官方未确认,但预告里那张熟悉的脸必然让这个联想挥之不去。"
    },
    {
      q: "「三个宇宙」到底指哪三个?",
      a: "官方剧情摘要只确认'三个截然不同的宇宙即将碰撞',没有逐个编号。最普遍的解读是:①MCU主宇宙(616);②福克斯X战警宇宙(约10005);③第三个宇宙——多数说法指向神奇四侠所在宇宙或其他已亮相的变体宇宙。具体阵容以正片为准。"
    },
    {
      q: "征服者康去哪了?",
      a: "原定主线反派。2023年《蚁人3》后,漫威把复联5从《康之王朝》改名为《毁灭之日》,主角换成毁灭博士;官方确认'康被Doom替代',但《洛基》第二季的铺垫没有被抹除——洛基接管的'时间树'依然是多元宇宙格局的总开关。"
    },
    {
      q: "预告里没出现的角色,是不是就不会出现了?",
      a: "不是。预告未露脸 ≠ 未参演:官方已公布的约30人卡司中,蜘蛛侠(荷兰弟)、奇异博士、绿巨人、绯红女巫、王、死侍、金刚狼等至今没有官方确认,也没有官方否认;部分媒体'预告缺席名单'与逐帧解析本身就存在分歧。另外重要提醒:第二支预告其实带来了历次最大的角色密度——洛基、X教授、万磁王、镭射眼、苏睿黑豹、姆巴库、纳摩、石头人、蚁人、瓦坎达阵营都在其中,所谓的'缺席'名单随时可能被下一支预告推翻。"
    },
    {
      q: "需要补哪些剧集?",
      a: "只推荐两部:①《洛基》(S1-S2)——TVA、康之死、时间树全部在这里,不看它复联5的多元宇宙设定会缺一角;②《假如…?》——多元宇宙的可视化教材。其余剧集(旺达幻视、猎鹰与冬兵、夜魔侠:重生等)按需补。"
    },
    {
      q: "索尼、福克斯、环球这些公司的作品跟复联5有关系吗?",
      a: "有,而且很重要:福克斯的X战警宇宙角色已确定在复联5登场(预告中牌皇、X战警阵营出现);索尼的蜘蛛侠/毒液宇宙是'跨界传闻'的富矿;老漫威片(刀锋、艾丽卡、夜魔侠等)的角色在《死侍与金刚狼》里已被官方'激活'为多元宇宙角色。本指南把所有片方的作品都收录并标注了关联度。"
    }
  ];

  /* ---------------- 工具 ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- 状态 ---------------- */
  var state = { q: "", studio: "all", rel: "all", status: "all" };

  var STUDIO_GROUPS = [
    { id: "all", name: "全部作品", match: function () { return true; } },
    { id: "mcu", name: "漫威影业", match: function (x) { return !x.isTV && (x.group === "mcu1" || x.group === "mcu2"); } },
    { id: "fox", name: "20世纪福克斯", match: function (x) { return !x.isTV && x.group === "fox"; } },
    { id: "sony", name: "索尼影业", match: function (x) { return !x.isTV && x.group === "sony"; } },
    { id: "other", name: "其他公司", match: function (x) { return !x.isTV && x.group === "other"; } },
    { id: "tv", name: "剧集(Disney+/精选)", match: function (x) { return !!x.isTV; } }
  ];

  var REL_GROUPS = [
    { id: "all", name: "全部关联度" },
    { id: "direct", name: "直接相关" },
    { id: "context", name: "重要背景" },
    { id: "minor", name: "一般关联" },
    { id: "info", name: "番外" }
  ];

  var STATUS_GROUPS = [
    { id: "all", name: "全部状态" },
    { id: "released", name: "已上映" },
    { id: "upcoming", name: "未上映/待映" }
  ];

  /* ---------------- 渲染:hero 统计 ---------------- */
  function renderHeroStats() {
    var films = FILMS.length;
    var stud = {};
    FILMS.forEach(function (f) { stud[f.studio] = 1; });
    var stCount = Object.keys(stud).length;
    $("#heroStats").innerHTML =
      '<div class="stat"><b>' + films + '</b><span>收录影视作品/剧集</span></div>' +
      '<div class="stat"><b>' + stCount + '家</b><span>出品/发行公司</span></div>' +
      '<div class="stat"><b>' + window.TRAILER_CHARS.length + '</b><span>预告确认登场角色</span></div>' +
      '<div class="stat"><b>' + window.PREDICTED_CHARS.length + '</b><span>大概率登场(预测)</span></div>' +
      '<div class="stat"><b>3个</b><span>即将碰撞的宇宙</span></div>';
  }

  /* ---------------- 渲染:速览 ---------------- */
  function renderFacts() {
    $("#filmFacts").textContent =
      "《复仇者联盟5:毁灭之日》由罗素兄弟执导,小罗伯特·唐尼饰演毁灭博士,2026年12月18日北美上映。官方剧情摘要:三个截然不同的宇宙即将碰撞,复仇者、X战警、神奇四侠站在同一条战线上。";
    $("#factGrid").innerHTML = FACTS.map(function (f) {
      return '<div class="fact-card"><div class="fact-label">' + esc(f.label) + '</div>' +
        '<div class="fact-value">' + esc(f.value) + '<small>' + esc(f.sub) + '</small></div></div>';
    }).join("");
  }

  /* ---------------- 渲染:彩蛋速报 ---------------- */
  function renderEggs() {
    var list = (window.EASTER_EGGS || []);
    $("#eggList").innerHTML = list.map(function (e) {
      return '<article class="egg-card">' +
        '<div class="egg-num">' + esc(e.n) + "</div>" +
        '<div class="egg-body">' +
        '<h3 class="egg-title">' + esc(e.title) + "</h3>" +
        '<p class="egg-film">' + esc(e.film) + "</p>" +
        '<p class="egg-text">' + esc(e.text) + "</p>" +
        '<p class="egg-rel">' + esc(e.rel) + "</p>" +
        "</div></article>";
    }).join("");
  }

  /* ---------------- 渲染:路线 ---------------- */
  function renderRoutes() {
    $("#routeTabs").innerHTML = Object.keys(ROUTES).map(function (id) {
      var r = ROUTES[id];
      return '<button class="route-tab' + (id === "quick" ? " active" : "") + '" data-route="' + id + '">' + esc(r.name) + "</button>";
    }).join("");
    renderRoute("quick");
  }
  function renderRoute(id) {
    var r = ROUTES[id];
    $("#routeList").innerHTML =
      '<p class="more-note" style="margin-bottom:14px">' + esc(r.desc) + "</p>" +
      r.items.map(function (it, i) {
        return '<div class="route-item"><div class="route-num">' + (i + 1) + "</div><div><h4>" + esc(it.t) + "</h4><p>" + esc(it.d) + "</p></div></div>";
      }).join("");
  }

  /* ---------------- 渲染:筛选器 ---------------- */
  function renderControls() {
    function chips(groups, key, label) {
      return '<div class="filter-group"><span class="filter-label">' + label + "</span>" +
        groups.map(function (g) {
          return '<button class="chip' + (state[key] === g.id ? " active" : "") + '" data-key="' + key + '" data-val="' + g.id + '">' + esc(g.name) + "</button>";
        }).join("") + "</div>";
    }
    $("#controls").innerHTML =
      '<div class="search-row"><input class="search-input" id="searchInput" type="search" placeholder="搜索片名 / 英文名 / 年份 / 简介关键词…" value="' + esc(state.q) + '" /></div>' +
      chips(STUDIO_GROUPS, "studio", "出品方") +
      chips(REL_GROUPS, "rel", "关联度") +
      chips(STATUS_GROUPS, "status", "状态");
  }

  /* ---------------- 渲染:影片列表 ---------------- */
  function relTag(rel) {
    var cls = { direct: "tag-direct", context: "tag-context", minor: "tag-minor", info: "tag-info" }[rel] || "tag-minor";
    return '<span class="tag ' + cls + '">' + (REL_LABEL[rel] || rel) + "</span>";
  }
  function filmHtml(f) {
    var statusTag = f.status === "upcoming"
      ? '<span class="tag tag-rumor">待映</span>'
      : '<span class="tag">已上映</span>';
    var tvTag = f.isTV ? '<span class="tag">剧集</span>' : "";
    return '<article class="film-card" data-id="' + esc(f.id) + '">' +
      '<div class="film-top"><h3 class="film-title">' + esc(f.title) +
      '<span>' + esc(f.en || "") + "</span></h3>" +
      '<div class="film-meta"><span class="tag tag-year">' + esc(f.year) + "</span>" + statusTag + tvTag + "</div></div>" +
      '<div class="film-meta">' + relTag(f.rel) + '<span class="tag">' + esc(f.studio) + "</span>" +
      (f.phase ? '<span class="tag">' + esc(f.phase) + "</span>" : "") + "</div>" +
      (f.plot ? '<p class="film-plot"><b>讲了什么:</b>' + esc(f.plot) + "</p>" : "") +
      (f.relation ? '<p class="film-relation"><span class="rel-label">与复联5的关系</span>' + esc(f.relation) + "</p>" : "") +
      "</article>";
  }
  function renderFilms() {
    var q = state.q.trim().toLowerCase();
    var list = ALL.filter(function (f) {
      if (state.status !== "all" && f.status !== state.status) return false;
      if (state.rel !== "all" && f.rel !== state.rel) return false;
      var sg = STUDIO_GROUPS.find(function (g) { return g.id === state.studio; });
      if (sg && !sg.match(f)) return false;
      if (!q) return true;
      var hay = [f.title, f.en, f.year, f.studio, f.phase, f.plot, f.relation].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    $("#filmsList").innerHTML = list.map(filmHtml).join("");
    $("#emptyTip").classList.toggle("hidden", list.length > 0);

    var ext = FILMS.filter(function (f) { return f.status === "upcoming"; });
    $("#filmsMore").innerHTML =
      '<h3>待映与说明</h3>' +
      ext.map(function (f) { return '<p class="more-note">· ' + esc(f.title) + "( " + esc(f.en) + " )— " + esc(f.plot) + "</p>"; }).join("") +
      '<p class="more-note" style="margin-top:10px">· 未收录说明:①1994年科尔曼版《神奇四侠》从未正式公映(仅按合约拍摄),仅作历史注脚收录;②1998年《复仇者》(费因斯/瑟曼)改编自英国同名间谍剧,与漫威无关,已排除;③各厂直发DVD的漫威动画长片(如《钢铁侠:科技达人》《终极复仇者》等)非院线作品,未收录;④2003年《夜魔侠》等老片与MCU不共享宇宙,但其角色已在《死侍与金刚狼》中以"老宇宙"身份回归。</p>';
  }

  /* ---------------- 渲染:角色 ---------------- */
  function charHtml(c) {
    var badge = c.badge
      ? (c.badge === "official"
        ? '<span class="tag tag-direct">官方确认</span>'
        : c.badge === "cast"
          ? '<span class="tag tag-context">官方官宣</span>'
          : c.badge === "rumor"
            ? '<span class="tag tag-rumor">传闻</span>'
            : "")
      : "";
    var prob = "";
    if (c.prob) {
      var cls = c.prob === "极高" ? "prob-high" : c.prob === "较高" ? "prob-mid" : "prob-low";
      prob = '<span class="prob ' + cls + '">登场概率:' + esc(c.prob) + "</span>";
    }
    return '<article class="char-card">' +
      '<div class="char-head"><h3 class="char-name">' + esc(c.name) +
      "<span>" + esc(c.en || "") + "</span></h3>" +
      '<div class="char-badges">' + badge + "</div></div>" +
      (c.actor ? '<p class="char-actor">演员:' + esc(c.actor) + "</p>" : "") +
      (c.appear ? '<p class="char-bio"><b>预告画面:</b>' + esc(c.appear) + "</p>" : "") +
      (c.bio ? '<p class="char-bio">' + esc(c.bio) + "</p>" : "") +
      (c.why ? '<p class="char-bio"><b>为什么与复联5有关:</b>' + esc(c.why) + "</p>" : "") +
      (c.evidence ? '<p class="char-evidence"><em>依据:</em>' + esc(c.evidence) + prob + "</p>" : "") +
      "</article>";
  }

  function renderTrailer() {
    $("#trailerCharGrid").innerHTML = window.TRAILER_CHARS.map(charHtml).join("");
    $("#trailerCastDesc").textContent =
      "已有三轮预告物料:①2026年4月CinemaCon先导片段(雷神对决毁灭博士);②7月20日首支正式预告——洛基、X教授、万磁王、镭射眼、苏睿黑豹、姆巴库、纳摩、石头人、叶莲娜等大规模集结;③8月15日前后发布的D23特别版(以毁灭博士与哨兵军团为主)。本区角色按全部已发布物料+观者反馈整理;不同物料轮次、各家逐帧解析存在版本分歧处均已标注,以正片为准。";
  }
  function renderPredicted() {
    $("#predictedCharGrid").innerHTML = window.PREDICTED_CHARS.map(charHtml).join("");
  }

  /* ---------------- 渲染:FAQ ---------------- */
  function renderFaq() {
    $("#faqList").innerHTML = FAQS.map(function (f, i) {
      return '<div class="faq-item" data-i="' + i + '"><button class="faq-q">' + esc(f.q) + "</button>" +
        '<div class="faq-a"><div class="faq-a-inner">' + f.a + "</div></div></div>";
    }).join("");
  }

  /* ---------------- 事件 ---------------- */
  function bind() {
    document.addEventListener("click", function (e) {
      var tab = e.target.closest(".route-tab");
      if (tab) { renderRoute(tab.dataset.route); document.querySelectorAll(".route-tab").forEach(function (b) { b.classList.toggle("active", b === tab); }); return; }
      var chip = e.target.closest(".chip");
      if (chip) {
        state[chip.dataset.key] = chip.dataset.val;
        document.querySelectorAll(".chip[data-key='" + chip.dataset.key + "']").forEach(function (b) { b.classList.toggle("active", b === chip); });
        renderFilms();
        return;
      }
      var q = e.target.closest(".faq-q");
      if (q) {
        var item = q.closest(".faq-item");
        var open = item.classList.toggle("open");
        var ans = item.querySelector(".faq-a");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0";
        return;
      }
      var navL = e.target.closest(".nav a");
      if (navL) { $("#nav").classList.remove("open"); }
    });
    $("#navToggle").addEventListener("click", function () { $("#nav").classList.toggle("open"); });
    var si = $("#searchInput");
    if (si) {
      si.addEventListener("input", function () {
        state.q = si.value;
        renderFilms();
      });
    }
    var bt = document.createElement("button");
    bt.id = "backTop"; bt.textContent = "↑"; bt.title = "回到顶部";
    document.body.appendChild(bt);
    bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    window.addEventListener("scroll", function () {
      bt.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
  }

  /* ---------------- 启动 ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderHeroStats();
    renderFacts();
    renderEggs();
    renderRoutes();
    renderControls();
    renderFilms();
    renderTrailer();
    renderPredicted();
    renderFaq();
    bind();
  });
})();
