/* =========================================================
   毁灭之日观影指南 — 渲染逻辑
   板块:速览 / 彩蛋速报 / 观影路线 / 作品库(封面+播放按钮)/ 角色图鉴(PPT 式轮播)/ FAQ
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var WATCH = CFG.watchPlatforms || [
    { id: "qq", name: "腾讯视频", url: "https://v.qq.com/x/search/?q={q}" },
    { id: "iqiyi", name: "爱奇艺", url: "https://so.iqiyi.com/so/q_{q}" },
    { id: "youku", name: "优酷", url: "https://so.youku.com/search_video/q_{q}" },
    { id: "bili", name: "哔哩哔哩", url: "https://search.bilibili.com/all?keyword={q}" },
    { id: "douban", name: "豆瓣(看评分)", url: "https://search.douban.com/movie/subject_search?search_text={q}" }
  ];
  var KEY_PLATFORM = "dd_platform";

  var ALL = [].concat(FILMS, TV_SHOWS.map(function (t) { return Object.assign({}, t, { isTV: true }); }));

  var REL_LABEL = { direct: "直接相关", context: "重要背景", minor: "一般关联", info: "番外" };

  var STUDIO_COLOR = [
    [/漫威影业/, "#e23636"], [/福克斯/, "#4a7fd6"], [/索尼/, "#3b9ac4"],
    [/环球/, "#c08a2e"], [/新线/, "#7d5fff"], [/狮门/, "#8a6ce0"],
    [/迪士尼/, "#4aa3df"], [/哥伦比亚/, "#c46a2e"], [/康斯坦丁/, "#7a7a7a"], [/世纪电影/, "#7a7a7a"]
  ];
  function studioColor(s) {
    for (var i = 0; i < STUDIO_COLOR.length; i++) if (STUDIO_COLOR[i][0].test(s || "")) return STUDIO_COLOR[i][1];
    return "#5c6b7a";
  }

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
      q: "作品库里的 ▶ 播放按钮是干什么的?能免费看吗?",
      a: "那个按钮是带片名去『正版平台』(腾讯视频/爱奇艺/优酷/B站/Disney+等)搜索,由平台告诉你这部剧有没有上架、要不要会员——本站不提供也不链接任何盗版资源,原因很简单:盗版站既不稳定也违法。国内实际能原价看到漫威电影的地方主要是各视频平台的会员区,偶尔会有老片免费(带广告)。"
    },
    {
      q: "为什么作品库有的片子是灰色的/没有中文资源?",
      a: "一部分老片(比如1986年《霍华德鸭》、1990年的《美国队长》)在大陆基本没有正版渠道,标成「一般关联」或「番外」的条目本来就不用看,放心跳过。"
    }
  ];

  /* ---------------- 工具 ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, String(val));
    } catch (e) { /* 隐私模式忽略 */ }
    return null;
  }

  /* ---------------- 状态 ---------------- */
  var state = {
    q: "", studio: "all", rel: "all", status: "all",
    castTab: "trailer", castIndex: 0,
    platform: store(KEY_PLATFORM) || CFG.defaultWatchPlatform || (WATCH[0] && WATCH[0].id)
  };

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
    var filmCount = FILMS.length, tvCount = TV_SHOWS.length;
    var stud = {};
    FILMS.forEach(function (f) { stud[f.studio] = 1; });
    $("#heroStats").innerHTML =
      '<div class="stat"><b>' + filmCount + '</b><span>部影视作品</span></div>' +
      '<div class="stat"><b>' + tvCount + '</b><span>部精选剧集</span></div>' +
      '<div class="stat"><b>' + Object.keys(stud).length + '家</b><span>出品/发行公司</span></div>' +
      '<div class="stat"><b>' + (window.TRAILER_CHARS.length + window.PREDICTED_CHARS.length) + '</b><span>位角色图鉴</span></div>' +
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

  /* ---------------- 渲染:筛选器(含播放平台) ---------------- */
  function renderControls() {
    function chips(groups, key, label) {
      return '<div class="filter-group"><span class="filter-label">' + label + "</span>" +
        groups.map(function (g) {
          return '<button class="chip' + (state[key] === g.id ? " active" : "") + '" data-key="' + key + '" data-val="' + g.id + '">' + esc(g.name) + "</button>";
        }).join("") + "</div>";
    }
    var platformChips = '<div class="filter-group"><span class="filter-label">播放平台</span>' +
      WATCH.map(function (p) {
        return '<button class="chip chip-platform' + (state.platform === p.id ? " active" : "") + '" data-platform="' + esc(p.id) + '">' + esc(p.name) + "</button>";
      }).join("") + '<span class="chip-hint">(点作品卡上的 ▶ 会去这里搜索)</span></div>';

    $("#controls").innerHTML =
      '<div class="search-row"><input class="search-input" id="searchInput" type="search" placeholder="搜索片名 / 英文名 / 年份 / 简介关键词…" value="' + esc(state.q) + '" /></div>' +
      platformChips +
      chips(STUDIO_GROUPS, "studio", "出品方") +
      chips(REL_GROUPS, "rel", "关联度") +
      chips(STATUS_GROUPS, "status", "状态");
  }

  /* ---------------- 渲染:影片列表(封面 + 播放按钮) ---------------- */
  function relTag(rel) {
    var cls = { direct: "tag-direct", context: "tag-context", minor: "tag-minor", info: "tag-info" }[rel] || "tag-minor";
    return '<span class="tag ' + cls + '">' + (REL_LABEL[rel] || rel) + "</span>";
  }
  function currentPlatform() {
    for (var i = 0; i < WATCH.length; i++) if (WATCH[i].id === state.platform) return WATCH[i];
    return WATCH[0];
  }
  function watchUrl(f) {
    var p = currentPlatform();
    if (!p) return "#";
    return p.url.replace("{q}", encodeURIComponent(f.title)).replace("{qen}", encodeURIComponent(f.en || f.title));
  }
  function posterHtml(f) { return ""; }
  /* 播放按钮:带片名去正版平台搜索(本站不提供任何盗版资源) */
  function watchBtnHtml(f) {
    var p = currentPlatform();
    var pname = p ? p.name : "平台";
    if (f.status === "upcoming") {
      return '<span class="watch-btn watch-soon" title="还没上映">🔒 待上映</span>';
    }
    return '<a class="watch-btn" href="' + esc(watchUrl(f)) + '" target="_blank" rel="noopener noreferrer" ' +
      'title="去' + esc(pname) + '搜索这部剧">▶ 去' + esc(pname) + "查</a>";
  }
  function filmHtml(f) {
    var statusTag = f.status === "upcoming"
      ? '<span class="tag tag-rumor">待映</span>'
      : '<span class="tag">已上映</span>';
    var tvTag = f.isTV ? '<span class="tag">剧集</span>' : "";
    return '<article class="film-card" data-id="' + esc(f.id) + '">' +
      '<div class="film-top">' +
      '<h3 class="film-title">' + esc(f.title) +
      '<span>' + esc(f.en || "") + "</span></h3>" +
      watchBtnHtml(f) +
      "</div>" +
      '<div class="film-meta">' + statusTag + tvTag + relTag(f.rel) + '<span class="tag">' + esc(f.studio) + "</span>" +
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
      "<h3>待映与说明</h3>" +
      ext.map(function (f) { return '<p class="more-note">· ' + esc(f.title) + "( " + esc(f.en) + " )— " + esc(f.plot) + "</p>"; }).join("") +
      '<p class="more-note" style="margin-top:10px">· 关于播放按钮:点每张卡片右上角的 ▶ 会带片名去您选择的<b>正版平台</b>搜索(腾讯视频 / 爱奇艺 / 优酷 / B站 / Disney+ / JustWatch)。本站<b>不提供、也不链接任何盗版资源</b> —— 盗版站不稳定、随时失效,而且违法。</p>' +
      '<p class="more-note">· 未收录说明:①1994年科尔曼版《神奇四侠》从未正式公映(仅按合约拍摄),仅作历史注脚收录;②1998年《复仇者》(费因斯/瑟曼)改编自英国同名间谍剧,与漫威无关,已排除;③各厂直发DVD的漫威动画长片(如《钢铁侠:科技达人》《终极复仇者》等)非院线作品,未收录;④2003年《夜魔侠》等老片与MCU不共享宇宙,但其角色已在《死侍与金刚狼》中以"老宇宙"身份回归。</p>';
  }

  /* ---------------- 渲染:角色图鉴(一次一位) ---------------- */
  function charArtUrl(c) {
    var cfg = (window.CHAR_ART || {})[c.name];
    if (!cfg || !cfg.id) return "";
    if (window.CHAR_ART_DATA && window.CHAR_ART_DATA[cfg.id]) return window.CHAR_ART_DATA[cfg.id];
    return "assets/img/chars/" + cfg.id + ".svg";
  }
  function charArtId(c) {
    var cfg = (window.CHAR_ART || {})[c.name];
    return cfg && cfg.id ? cfg.id : "";
  }
  function castData() {
    return state.castTab === "predicted" ? window.PREDICTED_CHARS : window.TRAILER_CHARS;
  }
  function badgeHtml(c) {
    if (c.badge === "official") return '<span class="tag tag-direct">预告确认</span>';
    if (c.badge === "cast") return '<span class="tag tag-context">官方官宣</span>';
    if (c.badge === "rumor") return '<span class="tag tag-rumor">传闻推测</span>';
    return "";
  }
  function renderCastTabs() {
    var tabs = [
      { id: "trailer", name: "预告确认登场", n: window.TRAILER_CHARS.length },
      { id: "predicted", name: "预测登场", n: window.PREDICTED_CHARS.length }
    ];
    $("#castTabs").innerHTML = tabs.map(function (t) {
      return '<button class="cast-tab' + (state.castTab === t.id ? " active" : "") + '" data-cast-tab="' + t.id + '">' +
        esc(t.name) + " <em>" + t.n + "</em></button>";
    }).join("");
  }
  function renderCast() {
    var list = castData();
    if (!list.length) return;
    if (state.castIndex >= list.length) state.castIndex = 0;
    if (state.castIndex < 0) state.castIndex = list.length - 1;
    renderCastTabs();
    var c = list[state.castIndex];

    $("#castDesc").textContent = state.castTab === "predicted"
      ? "基于官方卡司、泄露设定、片场照与媒体报道的预测,标注了每条推断的依据与可信度。传闻仅供参考,以正片为准。"
      : "依据已发布的两支预告与官方卡司整理,每位角色的预告画面、背景介绍与「为什么与复联5有关」都在这里。";

    var art = charArtUrl(c), id = charArtId(c);
    $("#castStage").innerHTML =
      '<div class="cast-bg"><img class="cast-img" src="' + esc(art) + '" alt="' + esc(c.name) + ' 人物立绘" /></div>' +
      '<div class="cast-shade"></div>' +
      '<article class="cast-body">' +
      '<div class="cast-head"><h3 class="cast-name">' + esc(c.name) + "<span>" + esc(c.en || "") + "</span></h3>" +
      '<div class="cast-badges">' + badgeHtml(c) + (c.prob ? '<span class="tag tag-rumor">' + esc(c.prob) + "</span>" : "") + "</div></div>" +
      (c.actor ? '<p class="cast-actor">配音/出演:' + esc(c.actor) + "</p>" : "") +
      (c.appear ? '<p class="cast-text"><b>预告画面:</b>' + esc(c.appear) + "</p>" : "") +
      (c.bio ? '<p class="cast-text">' + esc(c.bio) + "</p>" : "") +
      (c.why ? '<p class="cast-text"><b>为什么与复联5有关:</b>' + esc(c.why) + "</p>" : "") +
      (c.evidence ? '<p class="cast-evidence">' + c.evidence + "</p>" : "") +
      "</article>";

    /* 想换成自己的透明底抠图:把 <id>.png(或 .jpg)放进 assets/img/chars/ 即可自动优先使用 */
    var img = $("#castStage .cast-img");
    if (img && id && typeof window.Image === "function") {
      var png = "assets/img/chars/" + id + ".png";
      var jpg = "assets/img/chars/" + id + ".jpg";
      var t1 = new window.Image();
      t1.onload = function () { img.src = png; };
      t1.onerror = function () {
        var t2 = new window.Image();
        t2.onload = function () { img.src = jpg; };
        t2.src = jpg;
      };
      t1.src = png;
    }

    $("#castPos").textContent = (state.castIndex + 1) + " / " + list.length;
    $("#castStrip").innerHTML = list.map(function (x, i) {
      var cfg = (window.CHAR_ART || {})[x.name];
      var thumb = cfg && cfg.id ? 'style="background-image:url(' + esc(charArtUrl(x)) + ')"' : "";
      return '<button class="strip-item' + (i === state.castIndex ? " active" : "") + '" data-cast-index="' + i +
        '" title="' + esc(x.name) + '" ' + thumb + '><span>' + esc(x.name.replace(/[()(].*$/, "").slice(0, 4)) + "</span></button>";
    }).join("");
  }
  function castGo(delta) {
    var list = castData();
    state.castIndex = (state.castIndex + delta + list.length) % list.length;
    renderCast();
    var stage = $("#castStage");
    if (stage && stage.scrollIntoView) {
      var top = stage.getBoundingClientRect().top + window.pageYOffset - 90;
      if (window.pageYOffset > top || top - window.pageYOffset > window.innerHeight) {
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    }
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
      var t = e.target;
      if (!t || !t.closest) return;

      var tab = t.closest(".route-tab");
      if (tab) {
        renderRoute(tab.dataset.route);
        document.querySelectorAll(".route-tab").forEach(function (b) { b.classList.toggle("active", b === tab); });
        return;
      }
      var pt = t.closest("[data-platform]");
      if (pt) {
        state.platform = pt.dataset.platform;
        store(KEY_PLATFORM, state.platform);
        document.querySelectorAll("[data-platform]").forEach(function (b) { b.classList.toggle("active", b === pt); });
        renderFilms();
        return;
      }
      var chip = t.closest(".chip");
      if (chip && chip.dataset.key) {
        state[chip.dataset.key] = chip.dataset.val;
        document.querySelectorAll('.chip[data-key="' + chip.dataset.key + '"]').forEach(function (b) { b.classList.toggle("active", b === chip); });
        renderFilms();
        return;
      }
      var ct = t.closest("[data-cast-tab]");
      if (ct) {
        state.castTab = ct.dataset.castTab;
        state.castIndex = 0;
        renderCast();
        return;
      }
      var si = t.closest("[data-cast-index]");
      if (si) { state.castIndex = Number(si.dataset.castIndex); renderCast(); return; }
      if (t.closest("#castPrev")) { castGo(-1); return; }
      if (t.closest("#castNext")) { castGo(1); return; }

      var q = t.closest(".faq-q");
      if (q) {
        var item = q.closest(".faq-item");
        var open = item.classList.toggle("open");
        var ans = item.querySelector(".faq-a");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0";
        return;
      }
      var navL = t.closest(".nav a");
      if (navL) { $("#nav").classList.remove("open"); }
    });

    document.addEventListener("keydown", function (e) {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "")) return;
      if (e.key === "ArrowLeft") castGo(-1);
      else if (e.key === "ArrowRight") castGo(1);
    });

    $("#navToggle").addEventListener("click", function () { $("#nav").classList.toggle("open"); });

    var si = $("#searchInput");
    if (si) si.addEventListener("input", function () { state.q = si.value; renderFilms(); });

    var bt = document.createElement("button");
    bt.id = "backTop"; bt.textContent = "↑"; bt.title = "回到顶部";
    document.body.appendChild(bt);
    bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    window.addEventListener("scroll", function () { bt.classList.toggle("show", window.scrollY > 600); }, { passive: true });
  }

  /* ---------------- 启动 ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderHeroStats();
    renderFacts();
    renderEggs();
    renderRoutes();
    renderControls();
    renderFilms();
    renderCast();
    renderFaq();
    bind();
  });

  /* 供测试使用 */
  window.GuideApp = {
    state: state, renderFilms: renderFilms, renderCast: renderCast, castGo: castGo,
    watchUrl: function (f) { return watchUrl(f); }, castData: castData, charArtUrl: charArtUrl
  };
})();
