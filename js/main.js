// ═══════════════════════════════════════════════════
// MAIN (Entry point — init & game loop)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, H, DEFAULT_BINDINGS } from "./config.js";
import { initAudio } from "./audio.js";
import { initStory } from "./story.js";
import { initStars, initGroundRocks } from "./renderer.js";
import { loadBindings, refreshBindingUI, initSettings } from "./ui.js";
import { initInput } from "./input.js";
import { update } from "./update.js";
import { draw } from "./draw.js";

// Canvas setup
S.canvas = document.getElementById("gameCanvas");
S.ctx = S.canvas.getContext("2d");
S.vigCvs = document.getElementById("vigCanvas");
S.vigCtx = S.vigCvs.getContext("2d");

// Background image
S.bgImage = new Image();
S.bgImage.src = "./game-bg.png";
S.bgImage.onerror = () => {
  S.bgImage = { complete: false, naturalWidth: 0, naturalHeight: 0 };
};

// Bindings
S.bindings = { ...DEFAULT_BINDINGS };
loadBindings();
refreshBindingUI();

// Ricochet preference
const savedRico = localStorage.getItem("tis2_ricochet");
if (savedRico !== null) {
  S.ricochetEnabled = savedRico === "1";
  document.getElementById("ricochet-check").checked = S.ricochetEnabled;
}

// Initialize subsystems
initAudio();
initStory();
initStars();
initGroundRocks();
initSettings();
initInput();

// Mobile canvas scaling
function resizeCanvas() {
  if (!S.isMobile) return;
  const container = document.getElementById("game-container");
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  container.style.width = vw + "px";
  container.style.height = vh + "px";
  S.canvas.style.width = vw + "px";
  S.canvas.style.height = vh + "px";
  S.vigCvs.style.width = vw + "px";
  S.vigCvs.style.height = vh + "px";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
