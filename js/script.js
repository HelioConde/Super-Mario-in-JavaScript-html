/* Platformer core — preserves the original DOM level and sprite assets. */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const player = $("#player");
  const overlay = $("#home");
  const logo = $("#logo1");
  const configPanel = $("#keyConfig");
  if (!player || !overlay) return;

  const defaults = { left: "ArrowLeft", right: "ArrowRight", jump: "Space", run: "ShiftLeft" };
  const loadKeys = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("marioControlsV2") || "null");
      return { ...defaults, ...(stored && typeof stored === "object" ? stored : {}) };
    } catch { return { ...defaults }; }
  };
  let controls = loadKeys();
  const keys = new Set();
  let touchAction = new Set();
  let state = "menu", paused = false, last = 0, animation = 0, platforms = [];
  let x = 0, y = 0, vy = 0, grounded = false, facing = 1, score = 0, falls = 0;
  const width = 35, height = 51, gravity = 1450, jumpSpeed = 555, walkSpeed = 245, runSpeed = 365;
  const level = $("#fase1");
  const worldWidth = level ? level.getBoundingClientRect().width : 12680;

  const style = document.createElement("style");
  style.textContent = `
    #home{display:grid;place-items:center;background:rgba(9,17,31,.94)!important;z-index:100!important}
    #logo1{position:static!important;display:flex!important;flex-direction:column;align-items:center;gap:15px;
      width:min(90vw,560px)!important;white-space:normal!important;line-height:1.5}
    #logo1 button,.mario-btn{background:#ffcf46;color:#18181b;border:2px solid #fff;border-radius:12px;
      padding:12px 22px;font:700 16px system-ui;cursor:pointer;box-shadow:0 4px 0 #995d05}
    #logo1 button:focus-visible,.mario-btn:focus-visible{outline:3px solid #48aaff;outline-offset:4px}
    #logo2{display:none!important}
    #player{border:0!important;pointer-events:none;will-change:left,top}
    .mario-hud{position:fixed;top:16px;left:16px;right:16px;z-index:50;display:none;
      align-items:center;justify-content:space-between;gap:10px;pointer-events:none;
      color:white;font:700 15px system-ui;text-shadow:0 2px 3px #000}
    .mario-hud button{pointer-events:auto;background:#20283e;color:white;border:1px solid #8c99b9;
      border-radius:9px;padding:10px 14px;cursor:pointer}
    .mario-touch{position:fixed;bottom:18px;left:12px;right:12px;display:none;z-index:60;
      justify-content:space-between;pointer-events:none}
    .mario-touch .group{display:flex;gap:9px}
    .mario-touch button{pointer-events:auto;touch-action:none;width:64px;height:64px;
      font:bold 24px system-ui;color:#fff;background:#172438d9;border:2px solid #ffffff90;border-radius:18px}
    #keyConfig{z-index:110!important;overflow:auto;max-height:80vh;box-sizing:border-box}
    @media(pointer:coarse),(max-width:700px){.mario-touch{display:flex}.mario-hud{font-size:12px}}
  `;
  document.head.appendChild(style);
  document.title = "Super Mario — Plataforma Web | Hélio Conde";
  document.documentElement.lang = "pt-BR";

  const hud = document.createElement("div");
  hud.className = "mario-hud";
  hud.innerHTML = '<span id="mario-stats">DISTÂNCIA 0% · QUEDAS 0</span><span><button id="mario-settings">Teclas</button> <button id="mario-reset">Reiniciar</button> <button id="mario-pause">Pausar</button></span>';
  document.body.appendChild(hud);
  const touch = document.createElement("div");
  touch.className = "mario-touch";
  touch.innerHTML = '<div class="group"><button data-action="left" aria-label="Esquerda">◀</button><button data-action="right" aria-label="Direita">▶</button></div><div class="group"><button data-action="run" aria-label="Correr">⚡</button><button data-action="jump" aria-label="Pular">▲</button></div>';
  document.body.appendChild(touch);

  function paintMenu(title, subtitle, label) {
    state = "menu"; paused = false; keys.clear(); touchAction.clear();
    overlay.style.display = "grid";
    hud.style.display = "none";
    touch.style.visibility = "hidden";
    logo.innerHTML = "";
    const heading = document.createElement("h1");
    heading.textContent = title;
    heading.style.cssText = "font:700 clamp(24px,5vw,42px) system-ui;color:#ffcf46;margin:0";
    const detail = document.createElement("p");
    detail.textContent = subtitle;
    detail.style.cssText = "font:16px/1.5 system-ui;color:#fff;max-width:460px";
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", start);
    logo.append(heading, detail, button);
    button.focus();
  }
  const floorSelector = '[class*="piso"]';
  function collectPlatforms() {
    platforms = [...document.querySelectorAll(floorSelector)].filter(el => /^piso\d/.test(el.className))
      .map(el => {
        const r = el.getBoundingClientRect();
        return { x: r.left + window.scrollX, y: r.top + window.scrollY,
          w: r.width, h: r.height };
      }).filter(p => p.w > 0 && p.h > 0).sort((a, b) => a.x - b.x);
  }
  function spawn() {
    collectPlatforms();
    const initial = platforms.find(p => p.x >= 0 && p.x < 700) || platforms[0];
    x = initial ? Math.max(8, initial.x + 10) : 80;
    y = initial ? initial.y - height : 150;
    vy = 0; grounded = !!initial; facing = 1; animation = 0;
    window.scrollTo({ left: Math.max(0, x - innerWidth * .25), top: 0, behavior: "instant" });
    draw();
  }
  function start() {
    if (state === "playing") return;
    overlay.style.display = "none";
    hud.style.display = "flex";
    touch.style.visibility = "visible";
    state = "playing"; paused = false; falls = 0; score = 0;
    spawn(); last = performance.now();
    const theme = $("#thema");
    if (theme) { theme.volume = .25; theme.loop = true; theme.play().catch(() => {}); }
  }
  function reset() { state = "menu"; start(); }
  function togglePause() {
    if (state !== "playing") return;
    paused = !paused; keys.clear(); touchAction.clear();
    $("#mario-pause").textContent = paused ? "Continuar" : "Pausar";
  }
  $("#mario-reset").addEventListener("click", reset);
  $("#mario-settings").addEventListener("click", () => { togglePause(); if (configPanel) configPanel.style.display = "block"; });
  $("#mario-pause").addEventListener("click", togglePause);

  function active(name) {
    const code = controls[name];
    return keys.has(code) || touchAction.has(name)
      || (name === "jump" && (keys.has("ArrowUp") || keys.has("KeyW")))
      || (name === "left" && keys.has("KeyA"))
      || (name === "right" && keys.has("KeyD"));
  }
  function jump() {
    if (state !== "playing" || paused || !grounded) return;
    grounded = false; vy = -jumpSpeed;
    const sound = $("#jump");
    if (sound) { sound.currentTime = 0; sound.play().catch(() => {}); }
  }
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input,textarea,select")) return;
    const relevant = Object.values(controls).includes(e.code) || ["ArrowUp","KeyW","KeyA","KeyD","Escape","KeyP","KeyR"].includes(e.code);
    if (relevant) e.preventDefault();
    if (e.repeat && ["Escape","KeyP","KeyR"].includes(e.code)) return;
    if (e.code === "Escape" || e.code === "KeyP") togglePause();
    if (e.code === "KeyR" && state === "playing") reset();
    if (e.code === controls.jump || e.code === "ArrowUp" || e.code === "KeyW") jump();
    keys.add(e.code);
    if (state === "menu" && (e.code === "Enter" || e.code === "Space")) {
      if (e.target.tagName !== "BUTTON") start();
    }
  });
  document.addEventListener("keyup", e => keys.delete(e.code));
  window.addEventListener("blur", () => { keys.clear(); touchAction.clear(); if (state === "playing" && !paused) togglePause(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "playing" && !paused) togglePause();
  });
  touch.querySelectorAll("button").forEach(button => {
    const action = button.dataset.action;
    const release = e => { if (e) e.preventDefault(); touchAction.delete(action); };
    button.addEventListener("pointerdown", e => {
      e.preventDefault(); button.setPointerCapture(e.pointerId);
      touchAction.add(action); if (action === "jump") jump();
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  function draw() {
    player.style.left = x + "px";
    player.style.top = y + "px";
    player.style.transform = facing < 0 ? "scaleX(-1)" : "none";
    const moving = active("left") || active("right");
    const sprite = !grounded ? "-532px -99px" : moving && Math.floor(animation * 8) % 2 ? "-836px 0px" : "-532px 0px";
    player.style.backgroundPosition = sprite;
    player.style.width = width + "px";
    player.style.height = height + "px";
    const percent = Math.min(100, Math.round(100 * x / Math.max(1, worldWidth - width)));
    $("#mario-stats").textContent = "PERCURSO " + percent + "% · QUEDAS " + falls;
  }
  function update(dt) {
    const dir = Number(active("right")) - Number(active("left"));
    if (dir) facing = dir;
    const oldX = x, oldY = y, oldBottom = y + height;
    x = Math.max(0, Math.min(worldWidth - width, x + dir * (active("run") ? runSpeed : walkSpeed) * dt));
    vy = Math.min(950, vy + gravity * dt);
    y += vy * dt;
    grounded = false;
    // Resolve only the top surface of each existing floor tile.
    for (const p of platforms) {
      if (p.x > Math.max(oldX, x) + width || p.x + p.w < Math.min(oldX, x)) continue;
      if (x + width <= p.x + 4 || x >= p.x + p.w - 4) continue;
      if (vy >= 0 && oldBottom <= p.y + 10 && y + height >= p.y) {
        y = p.y - height; vy = 0; grounded = true;
        break;
      }
    }
    if (y > Math.max(document.documentElement.scrollHeight, innerHeight) + 200) {
      falls++; spawn();
    }
    if (x >= worldWidth - width - 8) {
      score++;
      paintMenu("Fase concluída!", "Você chegou ao fim do cenário! Quedas: " + falls + ". Experimente novamente para melhorar.", "Jogar novamente");
    }
    animation += dt;
    draw();
    const cameraX = Math.max(0, Math.min(worldWidth - innerWidth, x - innerWidth * .42));
    window.scrollTo({ left: cameraX, top: 0, behavior: "instant" });
  }
  function frame(now) {
    const dt = Math.min(.033, Math.max(0, (now - last) / 1000));
    last = now;
    if (state === "playing" && !paused) update(dt);
    requestAnimationFrame(frame);
  }
  // Existing configuration panel is preserved, with a simple modern control mapping.
  const configButton = $("#config");
  if (configButton) configButton.addEventListener("click", () => { if (configPanel) configPanel.style.display = "block"; });
  $("#saveKeyReturn")?.addEventListener("click", () => { if (configPanel) configPanel.style.display = "none"; });
  // Keep the historical fields visible but use KeyboardEvent.code for consistent input.
  const mapping = { ArrowLeft: "left", ArrowRight: "right", Jump: "jump", Run: "run" };
  for (const [field, action] of Object.entries(mapping)) {
    const input = $("#" + field);
    if (!input) continue;
    input.value = controls[action];
    input.readOnly = true;
    input.addEventListener("keydown", e => {
      e.preventDefault(); e.stopPropagation();
      if (e.code === "Escape") return;
      controls[action] = e.code; input.value = e.code;
    });
  }
  $("#saveKeyConfig")?.addEventListener("click", () => {
    localStorage.setItem("marioControlsV2", JSON.stringify(controls));
    if (configPanel) configPanel.style.display = "none";
  });
  // Hide unused prototype control fields rather than displaying broken mappings.
  ["ArrowUp","ArrowDown","JumpSpin","Getting"].forEach(field => {
    const input = $("#" + field);
    if (input) { input.disabled = true; input.title = "Reservado para versões futuras"; }
  });

  const previousLabel = $("#pressMsg");
  if (previousLabel) previousLabel.textContent = "Protótipo revitalizado";
  paintMenu("SUPER MARIO — WEB", "Setas ou A/D para mover · Espaço ou W para pular · Shift para correr · P para pausar · R para reiniciar.", "Começar a jogar");
  requestAnimationFrame(frame);
})();
