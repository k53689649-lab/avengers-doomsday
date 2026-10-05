/* =========================================================
   粒子特效:毁灭博士的绿色魔法
   —— 点击迸发魔法火花 + 符文圈,筛选/搜索/切换角色都有反馈
   —— 只在需要时启动 rAF,空闲时完全停止(不占性能)
   —— 尊重系统「减少动态效果」设置
   ========================================================= */
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  var REDUCED = false;
  try { REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { }
  if (REDUCED) { window.DoomFX = { burst: function () { }, ring: function () { }, enabled: false }; return; }

  var COLORS = ["#2fd39a", "#8dffd0", "#3dffb0", "#1f9c6e", "#f7c948", "#c8ffe8"];

  var canvas, ctx, dpr = 1, parts = [], running = false, lastT = 0;

  function init() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.id = "doomFx";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:95";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize, { passive: true });
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  /* ---------- 粒子 ---------- */
  function spark(x, y, opts) {
    opts = opts || {};
    if (parts.length > 420) parts.splice(0, parts.length - 420);   /* 安全上限 */
    var ang = opts.angle != null ? opts.angle + rand(-0.7, 0.7) : rand(0, Math.PI * 2);
    var sp = rand(opts.speed ? opts.speed * 0.5 : 1.6, opts.speed || 4.6);
    parts.push({
      kind: "spark", x: x, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - rand(0, 1.2),
      life: 1, decay: rand(0.014, 0.032),
      size: rand(1.4, 3.4), color: Math.random() < 0.16 ? "#f7c948" : pick(COLORS)
    });
  }
  function ring(x, y, opts) {
    opts = opts || {};
    parts.push({
      kind: "ring", x: x, y: y, r: opts.r0 || 6, rMax: opts.rMax || rand(46, 76),
      life: 1, decay: opts.decay || 0.035, color: opts.color || "#2fd39a", w: opts.w || 2
    });
  }
  function rune(x, y, opts) {
    opts = opts || {};
    var n = opts.n || 4;
    for (var i = 0; i < n; i++) {
      parts.push({
        kind: "rune", x: x, y: y, a: (Math.PI * 2 / n) * i + rand(-0.3, 0.3),
        r: rand(14, 30), spin: rand(-0.05, 0.05), len: rand(5, 12),
        life: 1, decay: rand(0.018, 0.03), color: pick(COLORS)
      });
    }
  }
  function ember(x, y) {          /* 缓慢上升的魔法余烬 */
    parts.push({
      kind: "ember", x: x + rand(-14, 14), y: y + rand(-8, 8),
      vx: rand(-0.35, 0.35), vy: rand(-1.1, -0.45),
      life: 1, decay: rand(0.006, 0.013), size: rand(1, 2.4), color: pick(COLORS)
    });
  }

  /* ---------- 主循环 ---------- */
  function tick(t) {
    if (!running) return;
    var dt = Math.min(2.4, (t - (lastT || t)) / 16.67);
    lastT = t;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter";

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life -= p.decay * dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }

      if (p.kind === "spark") {
        p.vy += 0.024 * dt;                    /* 轻微重力 */
        p.vx *= 0.976; p.vy *= 0.976;          /* 阻尼 */
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, p.life) * 0.95;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, 6.2832); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.kind === "ember") {
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, p.life) * 0.7;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.2832); ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.kind === "ring") {
        p.r += (p.rMax - p.r) * 0.12 * dt;
        ctx.globalAlpha = Math.max(0, p.life) * 0.55;
        ctx.strokeStyle = p.color; ctx.lineWidth = p.w * p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.stroke();
      } else if (p.kind === "rune") {
        p.a += p.spin * dt; p.r += 0.5 * dt;
        var x1 = p.x + Math.cos(p.a) * p.r, y1 = p.y + Math.sin(p.a) * p.r;
        var x2 = p.x + Math.cos(p.a) * (p.r + p.len), y2 = p.y + Math.sin(p.a) * (p.r + p.len);
        ctx.globalAlpha = Math.max(0, p.life) * 0.8;
        ctx.strokeStyle = p.color; ctx.lineWidth = 1.8;
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (parts.length) { requestAnimationFrame(tick); }
    else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }
  function start() {
    init();
    if (running) return;
    running = true; lastT = 0;
    requestAnimationFrame(tick);
  }

  /* ---------- 对外接口 ---------- */
  function burst(x, y, opts) {
    opts = opts || {};
    var n = opts.n || 20;
    for (var i = 0; i < n; i++) spark(x, y, opts);
    ring(x, y, opts);
    rune(x, y, opts);
    for (var k = 0; k < Math.round(n / 3); k++) ember(x, y);
    start();
  }

  window.DoomFX = {
    enabled: true, burst: burst, ring: function (x, y, o) { ring(x, y, o); start(); },
    spark: function (x, y, o) { spark(x, y, o); start(); },
    ember: function (x, y) { ember(x, y); start(); },
    rune: function (x, y, o) { rune(x, y, o); start(); }
  };

  /* ---------- 自动绑定 ---------- */
  function bind() {
    document.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var t = e.target;
      var hot = t && t.closest && t.closest(".chip, .cast-tab, .cast-btn, .strip-item, .poster-tile, .route-tab, .choice, .trailer-pick, .trailer-poster, .faq-q, .nav a, .btn, button, a");
      burst(e.clientX, e.clientY, hot ? { n: 26, rMax: 88, w: 2.4 } : { n: 14, rMax: 54, w: 1.6 });
    }, { passive: true });

    /* 搜索框:聚焦时环绕符文,输入时冒火花 */
    document.addEventListener("focusin", function (e) {
      var el = e.target;
      if (!el || !el.classList || !el.classList.contains("search-input")) return;
      var r = el.getBoundingClientRect();
      ring(r.left + 26, r.top + r.height / 2, { rMax: 40, color: "#2fd39a", w: 2 });
      rune(r.right - 26, r.top + r.height / 2, { n: 3, color: "#8dffd0" });
    });
    document.addEventListener("input", function (e) {
      var el = e.target;
      if (!el || !el.classList || !el.classList.contains("search-input")) return;
      var r = el.getBoundingClientRect();
      for (var i = 0; i < 5; i++) spark(r.right - 22, r.top + r.height / 2, { angle: Math.PI * rand01(), speed: 2.6 });
      ember(r.right - 22, r.top + r.height / 2);
    });

    /* 角色轮播的上/下一位:从按钮方向飞出魔法 */
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var prev = t.closest("#castPrev"), next = t.closest("#castNext");
      if (!prev && !next) return;
      var el = prev || next, r = el.getBoundingClientRect();
      var x = prev ? r.left : r.right, y = r.top + r.height / 2;
      var ang = prev ? Math.PI : 0;
      for (var i = 0; i < 16; i++) spark(x, y, { angle: ang, speed: 5.2 });
      ring(r.left + r.width / 2, y, { rMax: 70 });
    });
  }
  function rand01() { return Math.random(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else { bind(); }
})();
