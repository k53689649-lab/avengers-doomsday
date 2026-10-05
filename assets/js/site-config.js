/* =========================================================
   站点配置 —— 站长在这里改
   ========================================================= */
window.SITE_CONFIG = {
  /* 站点名(留言板标题会用到) */
  siteName: "毁灭之日 · 观影指南",

  /* 管理密码
     ✅ 默认留空("") —— 密码不再写进代码!
        第一次点「站长管理」时,输入你自己想设的密码即可完成设置;
        密码以 SHA-256 摘要形式保存在**你自己的浏览器**里,不会上传,别人看源码也拿不到。
        注意:换浏览器或清除浏览数据后需要重新设置。
     ⚠️ 如果把这里填成固定密码,它会随网页一起被所有人下载看到 —— 除非你确实需要
        (例如想在多台设备上用同一个密码),否则建议保持留空。 */
  adminPassword: "",

  /* ============ 云端留言板(公开模式,推荐) ============
     配置后:所有人的提问与回复都存在云端,任何访客都能看到,站长可回复/置顶/删除。
     未配置:退化为「本地模式」——留言只存在各自的浏览器里(站长收不到别人的提问)。

     怎么填见 README 的「Supabase 云端留言板(公开模式)」:
       supabaseUrl     = https://xxxx.supabase.co
       supabaseAnonKey = eyJhbGciOi...   ← 这个 key 是设计上就可公开的,配合 RLS 策略保证安全
     ⚠️ 千万不要把 service_role key 填进来(那是最高权限密钥,只能放服务器)。
  */
  cloud: {
    provider: "supabase",            // 填 "supabase" 即启用云端模式
    supabaseUrl: "https://zmaakppcaqqpsgdealxj.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYWFrcHBjYXFxcHNnZGVhbHhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExODI2MDEsImV4cCI6MjEwNjc1ODYwMX0.-ndOsac4y9wkX0zyraMq9_tvWr4aAggX-T_-C7V4r94",
    commentsTable: "comments",
    announceTable: "announcements"
  },

  /* ============ 预告片(首页嵌入) ============
     bilibiliBvid: B 站视频号(BV 开头),填了就会在首页出现「点击播放」的预告片
     youtubeId:    油管视频 ID(可选,国内一般打不开,作为备用)
     想换成官方频道的预告:把对应视频的 BV 号填进来即可 */
  trailer: {
    bilibiliBvid: "BV1i6qPBwEFV",     // IGN 上传的《复联5》全新预告
    youtubeId: "",
    title: "《复仇者联盟5:毁灭之日》官方预告",
    note: "视频来自 B 站(IGN 上传的官方预告),版权归漫威/迪士尼所有"
  },

  /* ============ 哪里能看(作品库播放按钮) ============
     说明:本站不提供也不链接任何盗版资源。播放按钮会带着片名去「正版平台」搜索,
           由平台告诉你这部片子有没有上架、是否需要会员。
     想增删平台,直接改这个数组即可;
     url 里的 {q} 会替换成片名(中文名),{qen} 替换成英文名 */
  watchPlatforms: [
    { id: "qq",     name: "腾讯视频", url: "https://v.qq.com/x/search/?q={q}" },
    { id: "iqiyi",  name: "爱奇艺",   url: "https://so.iqiyi.com/so/q_{q}" },
    { id: "youku",  name: "优酷",     url: "https://so.youku.com/search_video/q_{q}" },
    { id: "bili",   name: "哔哩哔哩", url: "https://search.bilibili.com/all?keyword={q}" },
    { id: "disney", name: "Disney+",  url: "https://www.disneyplus.com/search?q={qen}" },
    { id: "jw",     name: "JustWatch", url: "https://www.justwatch.com/us/search?q={qen}" },
    { id: "douban", name: "豆瓣(看评分)", url: "https://search.douban.com/movie/subject_search?search_text={q}" }
  ],

  /* 默认打开哪个平台(对应上面 id;用户切换后会记住选择) */
  defaultWatchPlatform: "qq",

  /* Waline 云留言板地址(另一种云端方案,二选一即可;与上面的 cloud 不冲突) */
  walineServerURL: "",

  /* 登录入口开关:是否在页面上显示「微信登录 / QQ 登录」按钮
     说明:网站使用微信扫码登录需要「微信开放平台-网站应用」,个人开发者无法申请,
          需要企业主体 + 认证费;QQ 互联同理。因此这里默认显示按钮并给出说明,
          配置好 Waline 社交登录后把对应项改成 true 即可引导用户去登录。 */
  socialLogin: { wechat: false, qq: false },

  /* 公告(可在页面上由站长发布,也可以在下面预置一条)
     预置格式:{ text: "公告内容", time: "2026-08-27" } */
  presetAnnouncements: [],

  /* 留言限制 */
  limits: {
    maxLength: 500,        // 单条留言最大字数
    minLength: 4,          // 最小字数
    cooldownSeconds: 30,   // 两次留言间隔(秒),防刷屏
    maxPerVisit: 20        // 单次访问最多留言条数
  },

  /* 敏感词/禁止内容简单过滤(命中会被拒绝并提示)
     注意:这只是最基础的本地过滤,不能替代人工审核。 */
  blockedWords: ["代刷", "博彩", "赌博", "加微信", "私聊收费", "外挂", "出售账号", "贷款"]
};
