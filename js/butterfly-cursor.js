/* 光标跟随蝴蝶特效 —— 一群粉色蝴蝶追着鼠标飞舞 */
(function () {
  "use strict";

  // 蝴蝶数量与颜色(嫩粉色系)
  var COLORS = ["#ff9ec4", "#ffb6c1", "#ffc0d9", "#ff85a2", "#ffd1dc"];
  var COUNT = 6;

  var target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var butterflies = [];

  // 生成一只蝴蝶(用内联 SVG，可自由换色)
  function makeSVG(color) {
    return (
      '<svg viewBox="0 0 64 64" width="26" height="26" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="wing-l"><path d="M32 32 C10 6 -2 14 6 30 C-2 40 14 52 32 34 Z" fill="' + color + '" opacity="0.9"/></g>' +
      '<g class="wing-r"><path d="M32 32 C54 6 66 14 58 30 C66 40 50 52 32 34 Z" fill="' + color + '" opacity="0.9"/></g>' +
      '<rect x="31" y="14" width="2" height="30" rx="1" fill="#7a4b5e"/>' +
      "</svg>"
    );
  }

  // 样式(拍翅膀动画 + 定位)
  var style = document.createElement("style");
  style.textContent =
    ".bf-cursor{position:fixed;top:0;left:0;pointer-events:none;z-index:99999;" +
    "will-change:transform;transition:transform .05s linear;}" +
    ".bf-cursor .wing-l{transform-origin:32px 32px;animation:bfFlapL .28s ease-in-out infinite;}" +
    ".bf-cursor .wing-r{transform-origin:32px 32px;animation:bfFlapR .28s ease-in-out infinite;}" +
    "@keyframes bfFlapL{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.35)}}" +
    "@keyframes bfFlapR{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.35)}}";
  document.head.appendChild(style);

  function createButterflies() {
    for (var i = 0; i < COUNT; i++) {
      var el = document.createElement("div");
      el.className = "bf-cursor";
      el.innerHTML = makeSVG(COLORS[i % COLORS.length]);
      // 让翅膀拍动有先后错落
      var svg = el.firstChild;
      svg.style.animationDelay = (i * 0.04) + "s";
      document.body.appendChild(el);
      butterflies.push({
        el: el,
        x: target.x,
        y: target.y,
        // 每只跟随速度略不同，形成拖尾散开效果
        ease: 0.12 - i * 0.012,
        // 环绕偏移相位
        phase: (Math.PI * 2 / COUNT) * i,
      });
    }
  }

  var t = 0;
  function animate() {
    t += 0.06;
    // 从后往前，每只追前一只(第一只追鼠标)，形成蜿蜒队列
    var leadX = target.x;
    var leadY = target.y;
    for (var i = 0; i < butterflies.length; i++) {
      var b = butterflies[i];
      // 在跟随点周围加一点绕圈飘动
      var orbit = 14 + i * 4;
      var tx = leadX + Math.cos(t + b.phase) * orbit;
      var ty = leadY + Math.sin(t + b.phase) * orbit;
      b.x += (tx - b.x) * (b.ease + 0.06);
      b.y += (ty - b.y) * (b.ease + 0.06);
      // 朝向移动方向轻微旋转
      var angle = Math.atan2(ty - b.y, tx - b.x);
      b.el.style.transform =
        "translate(" + (b.x - 13) + "px," + (b.y - 13) + "px) rotate(" + angle + "rad)";
      leadX = b.x;
      leadY = b.y;
    }
    requestAnimationFrame(animate);
  }

  function onMove(e) {
    var p = e.touches ? e.touches[0] : e;
    target.x = p.clientX;
    target.y = p.clientY;
  }

  function init() {
    if (!document.body) {
      return setTimeout(init, 100);
    }
    // 触屏设备不启用，避免遮挡
    createButterflies();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    animate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
