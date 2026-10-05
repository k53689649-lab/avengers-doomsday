/* =========================================================
   角色立绘配置:为每个角色指定 id(生成的文件名)、主题色、立绘造型
   —— 与 data-characters.js 里的角色按 name 一一对应
   —— build-character-art.mjs 会据此生成 assets/img/chars/<id>.svg
   —— 想换成自己的图:把图片存成 assets/img/chars/<id>.jpg 即可自动优先使用
   ========================================================= */
var CHAR_ART = {
  /* ---------- 预告确认登场 ---------- */
  "毁灭博士":            { id: "doom",        accent: "#2fd39a", accent2: "#0e5b43", art: "mask" },
  "雷神":                { id: "thor",        accent: "#6fb6ff", accent2: "#1b3f78", art: "hammer" },
  "美国队长(史蒂夫·罗杰斯?)": { id: "steve",  accent: "#3b7fe0", accent2: "#12224a", art: "shield" },
  "神奇先生(里德·理查兹)":  { id: "reed",      accent: "#4a86e8", accent2: "#141f4d", art: "stretch" },
  "隐形女侠":            { id: "sue",         accent: "#8fd8ff", accent2: "#123c5c", art: "forcefield" },
  "石头人(本·格里姆)":    { id: "thing",       accent: "#e08a3c", accent2: "#4a2408", art: "rock" },
  "霹雳火(强尼·斯通)":    { id: "johnny",      accent: "#ff7a2f", accent2: "#4d1a05", art: "flame" },
  "尚气":                { id: "shangchi",    accent: "#e0b23c", accent2: "#4a3208", art: "rings" },
  "牌皇":                { id: "gambit",      accent: "#e0554f", accent2: "#4a0f0d", art: "cards" },
  "X教授":               { id: "xavier",      accent: "#6fa8dc", accent2: "#12283d", art: "telepath" },
  "万磁王":              { id: "magneto",     accent: "#c0392b", accent2: "#3d0d08", art: "helmet" },
  "镭射眼(斯科特·萨默斯)": { id: "cyclops",    accent: "#f2c94c", accent2: "#4a3c05", art: "visor" },
  "X战警阵营(野兽/夜行者等)": { id: "xmen",    accent: "#e0b341", accent2: "#3f3006", art: "claw" },
  "洛基":                { id: "loki",        accent: "#3ddc84", accent2: "#0a3d24", art: "horns" },
  "新美国队长(山姆·威尔逊)": { id: "sam",       accent: "#4a90d9", accent2: "#0f2b45", art: "wings" },
  "冬兵(巴基·巴恩斯)":    { id: "bucky",       accent: "#9aa7b5", accent2: "#1d2530", art: "metalarm" },
  "叶莲娜·贝洛娃(黑寡妇)": { id: "yelena",      accent: "#e0475a", accent2: "#420a12", art: "hourglass" },
  "黑豹(苏睿)与姆巴库":    { id: "wakanda",     accent: "#8a6ce0", accent2: "#221449", art: "feline" },
  "纳摩":                { id: "namor",       accent: "#2fb3a8", accent2: "#083b38", art: "trident" },
  "蚁人(斯科特·朗)":      { id: "antman",      accent: "#d94b4b", accent2: "#3f0d0d", art: "antenna" },
  "绿巨人(布鲁斯·班纳)":  { id: "hulk",        accent: "#4cc24c", accent2: "#0d3a0d", art: "gamma" },
  "雷霆特工队":          { id: "thunderbolts", accent: "#c8ccd4", accent2: "#2a2f38", art: "bolt" },
  "哨兵军团":            { id: "sentinels",   accent: "#9fb4c8", accent2: "#202b38", art: "mech" },

  /* ---------- 预测登场 ---------- */
  "三代蜘蛛侠(荷兰弟/托比/加菲)": { id: "spiders", accent: "#e03b3b", accent2: "#3d0a0a", art: "web" },
  "奇异博士":            { id: "strange",     accent: "#e08a2f", accent2: "#3f2405", art: "cloak" },
  "死侍":                { id: "deadpool",    accent: "#d13b3b", accent2: "#3a0a0a", art: "mask" },
  "金刚狼":              { id: "wolverine",   accent: "#e0b331", accent2: "#403005", art: "claw" },
  "绿巨人(布鲁斯·班纳)备用": null,
  "绯红女巫":            { id: "scarletwitch", accent: "#d32f4a", accent2: "#3d0812", art: "chaos" },
  "王":                  { id: "wong",        accent: "#c98a3c", accent2: "#3d2607", art: "mystic" },
  "星爵":                { id: "starlord",    accent: "#8a6ce0", accent2: "#1e1145", art: "cosmic" }
};
