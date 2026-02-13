// Budget Panel - Paste this in browser console on OpenClaw webchat
// Or create bookmarklet: javascript:(function(){...})();

(function () {
  if (document.getElementById("budget-panel-widget")) {
    console.log("[Budget] Already loaded");
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    #budget-panel-widget {
      position: fixed; bottom: 20px; left: 20px; width: 240px;
      background: #1a1a2e; border: 1px solid #3a3a5a; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4); font-family: system-ui; font-size: 13px;
      color: #e0e0e0; z-index: 10000; overflow: hidden;
    }
    #budget-panel-widget.collapsed { width: 100px; }
    #budget-panel-widget.collapsed .bpw-content { display: none; }
    .bpw-header { display: flex; justify-content: space-between; padding: 8px 12px; background: #2a2a4a; cursor: move; }
    .bpw-title { font-weight: 600; }
    .bpw-toggle { background: none; border: none; color: #888; font-size: 16px; cursor: pointer; }
    .bpw-content { padding: 10px; }
    .bpw-row { margin-bottom: 10px; }
    .bpw-row:last-child { margin-bottom: 0; }
    .bpw-name { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .bpw-bar { height: 5px; background: #2a2a4a; border-radius: 3px; overflow: hidden; }
    .bpw-fill { height: 100%; border-radius: 3px; }
    .bpw-detail { font-size: 10px; color: #666; margin-top: 2px; }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "budget-panel-widget";
  panel.innerHTML = `
    <div class="bpw-header">
      <span class="bpw-title">🎛️ Budget</span>
      <button class="bpw-toggle">−</button>
    </div>
    <div class="bpw-content">Loading...</div>
  `;
  document.body.appendChild(panel);

  const toggle = panel.querySelector(".bpw-toggle");
  toggle.onclick = () => {
    panel.classList.toggle("collapsed");
    toggle.textContent = panel.classList.contains("collapsed") ? "+" : "−";
  };

  // Draggable
  let drag = false,
    ox = 0,
    oy = 0;
  panel.querySelector(".bpw-header").onmousedown = (e) => {
    if (e.target === toggle) {
      return;
    }
    drag = true;
    ox = e.clientX - panel.offsetLeft;
    oy = e.clientY - panel.offsetTop;
  };
  document.onmousemove = (e) => {
    if (drag) {
      panel.style.left = e.clientX - ox + "px";
      panel.style.top = e.clientY - oy + "px";
      panel.style.bottom = "auto";
    }
  };
  document.onmouseup = () => (drag = false);

  function color(p) {
    return p >= 90 ? "#ef4444" : p >= 70 ? "#f97316" : p >= 50 ? "#eab308" : "#22c55e";
  }
  function emoji(p) {
    return p >= 90 ? "🔴" : p >= 70 ? "🟠" : p >= 50 ? "🟡" : "🟢";
  }

  async function refresh() {
    try {
      const app = document.querySelector("openclaw-app");
      if (!app?.client?.request) {
        panel.querySelector(".bpw-content").textContent = "Connecting...";
        return;
      }
      const data = await app.client.request("budget.status", {});
      if (!data?.providers) {
        return;
      }
      panel.querySelector(".bpw-content").innerHTML = data.providers
        .map(
          (p) => `
        <div class="bpw-row">
          <div class="bpw-name"><span>${emoji(p.pct)} ${p.name}</span><span style="color:${color(p.pct)};font-weight:700">${p.pct.toFixed(0)}%</span></div>
          <div class="bpw-bar"><div class="bpw-fill" style="width:${Math.min(p.pct, 100)}%;background:${color(p.pct)}"></div></div>
          <div class="bpw-detail">${p.used} used · ${p.remaining} left</div>
        </div>
      `,
        )
        .join("");
    } catch (e) {
      console.error("[Budget]", e);
    }
  }

  setTimeout(refresh, 500);
  setInterval(refresh, 30000);
  console.log("[Budget Panel] ✓ Loaded");
})();
