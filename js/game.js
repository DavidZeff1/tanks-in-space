// ═══════════════════════════════════════════════════
// GAME MANAGEMENT
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, H, LEVEL_DATA, makeProceduralLevel } from "./config.js";
import { dist, aabb } from "./utils.js";
import {
  Tank,
  Drone,
  Boss,
  Boss2,
  SniperTank,
  HeavyTank,
  CloakDrone,
} from "./entities.js";
import { hideAllUI, refreshBindingUI, saveLB } from "./ui.js";
import { applyMusic } from "./audio.js";
import { updateHP, updateHP2 } from "./hud.js";

export function startGame() {
  let name = document.getElementById("name-input").value.trim();
  if (!name) name = "הטנק שלי";
  S.twoPlayerMode = document.getElementById("two-player-check").checked;
  S.ricochetEnabled = document.getElementById("ricochet-check").checked;
  localStorage.setItem("tis2_ricochet", S.ricochetEnabled ? "1" : "0");
  const selMusic = document.querySelector('input[name="music-pref"]:checked');
  if (selMusic) applyMusic(selMusic.value);
  S.infiniteMode = false;
  hideAllUI();
  S.currentLevelIdx = 0;
  S.score = 0;
  S.combo = 0;
  S.comboTimer = 0;
  document.getElementById("score-num").textContent = "0";
  document.getElementById("combo-display").textContent = "";
  S.player = new Tank(400, 500, "#00d4ff", true, name);
  if (S.twoPlayerMode) {
    let name2 = document.getElementById("name-input2").value.trim();
    if (!name2) name2 = "שחקן 2";
    S.player2 = new Tank(350, 500, "#4a9fff", true, name2, true);
    document.getElementById("p2-hud-box").style.display = "block";
    document.getElementById("p2-abilities").style.display = "flex";
  } else {
    S.player2 = null;
    document.getElementById("p2-hud-box").style.display = "none";
    document.getElementById("p2-abilities").style.display = "none";
  }
  S.keys = {};
  loadLevel();
  S.gameState = "PLAYING";
}

export function startInfinite() {
  S.infiniteMode = true;
  hideAllUI();
  S.currentLevelIdx = LEVEL_DATA.length;
  loadLevel();
  S.gameState = "PLAYING";
}

export function nextLevel() {
  hideAllUI();
  S.currentLevelIdx++;
  S.player.hp = Math.min(100, S.player.hp + 20);
  updateHP();
  if (S.twoPlayerMode && S.player2) {
    S.player2.hp = Math.min(100, S.player2.hp + 20);
    updateHP2();
  }
  S.score += S.currentLevelIdx * 250;
  document.getElementById("score-num").textContent = S.score.toLocaleString();
  loadLevel();
  S.gameState = "PLAYING";
}

export function pauseGame() {
  S.gameState = "PAUSED";
  document.getElementById("pause-screen").style.display = "block";
}

export function resumeGame() {
  document.getElementById("pause-screen").style.display = "none";
  document.getElementById("bindings-panel").style.display = "none";
  S.gameState = "PLAYING";
  S.bindingReturnScreen = "pause-screen";
}

export function resetGame() {
  hideAllUI();
  document.getElementById("start-screen").style.display = "block";
  document.getElementById("boss-ui").style.display = "none";
  document.getElementById("p2-hud-box").style.display = "none";
  document.getElementById("p2-abilities").style.display = "none";
  S.gameState = "START";
  S.shieldActive = false;
  S.shieldTimer = 0;
  S.p2ShieldActive = false;
  S.p2ShieldTimer = 0;
  S.player2 = null;
  refreshBindingUI();
}

export function loadLevel() {
  const data =
    S.currentLevelIdx < LEVEL_DATA.length
      ? LEVEL_DATA[S.currentLevelIdx]
      : makeProceduralLevel(S.currentLevelIdx);

  S.walls = data.walls || [];
  S.bullets = [];
  S.particles = [];
  S.enemies = [];
  S.drones = [];
  S.boss = null;
  S.powerUps = [];
  S.cdMissile = 0;
  S.cdAoe = 0;
  S.cdShield = 0;
  S.shieldActive = false;
  S.shieldTimer = 0;
  S.combo = 0;
  S.comboTimer = 0;
  S.speedBoostTimer = 0;
  S.keys = {};
  S.mouse.isDown = false;

  S.player.x = data.spawn.x;
  S.player.y = data.spawn.y;
  S.player.speed = 3.5;
  if (S.twoPlayerMode && S.player2) {
    S.player2.x = data.spawn.x - 50;
    S.player2.y = data.spawn.y;
    S.player2.speed = 3.5;
    if (S.player2.hp <= 0) {
      S.player2.hp = 100;
      S.player2.maxHp = 100;
    }
    S.p2CdMissile = 0;
    S.p2CdAoe = 0;
    S.p2CdShield = 0;
    S.p2ShieldActive = false;
    S.p2ShieldTimer = 0;
    S.p2SpeedBoostTimer = 0;
    updateHP2();
  }
  if (S.player.hp <= 0) {
    S.player.hp = 100;
    S.player.maxHp = 100;
    updateHP();
  }

  const lbl = S.infiniteMode
    ? `גל ${S.currentLevelIdx - LEVEL_DATA.length + 1}`
    : `${S.currentLevelIdx + 1}`;
  document.getElementById("level-display").textContent = lbl;
  document.getElementById("boss-ui").style.display =
    data.isBoss || data.isBoss2 ? "block" : "none";

  if (data.isBoss) {
    S.boss = new Boss(W / 2, 150);
    document.getElementById("boss-name").textContent = "⚠ COMMANDER OVERLORD ⚠";
  } else if (data.isBoss2) {
    S.boss = new Boss2(W / 2, 150);
    document.getElementById("boss-name").textContent = "☠ DARK DESTROYER ☠";
  } else {
    for (let i = 0; i < data.enemies; i++) {
      let ex, ey, safe;
      let attempts = 0;
      do {
        ex = 50 + Math.random() * 700;
        ey = 40 + Math.random() * 210;
        safe =
          dist(ex, ey, S.player.x, S.player.y) > 200 &&
          !S.walls.some((w) =>
            aabb({ x: ex - 15, y: ey - 15, w: 30, h: 30 }, w),
          );
        attempts++;
      } while (!safe && attempts < 50);
      S.enemies.push(new Tank(ex, ey, "#c0392b", false));
    }
    for (let i = 0; i < (data.snipers || 0); i++) {
      let ex, ey, safe;
      let attempts = 0;
      do {
        ex = 50 + Math.random() * 700;
        ey = 30 + Math.random() * 150;
        safe =
          dist(ex, ey, S.player.x, S.player.y) > 250 &&
          !S.walls.some((w) =>
            aabb({ x: ex - 14, y: ey - 14, w: 28, h: 28 }, w),
          );
        attempts++;
      } while (!safe && attempts < 50);
      S.enemies.push(new SniperTank(ex, ey));
    }
    for (let i = 0; i < (data.heavies || 0); i++) {
      let ex, ey, safe;
      let attempts = 0;
      do {
        ex = 50 + Math.random() * 700;
        ey = 40 + Math.random() * 200;
        safe =
          dist(ex, ey, S.player.x, S.player.y) > 200 &&
          !S.walls.some((w) =>
            aabb({ x: ex - 19, y: ey - 19, w: 38, h: 38 }, w),
          );
        attempts++;
      } while (!safe && attempts < 50);
      S.enemies.push(new HeavyTank(ex, ey));
    }
    for (let i = 0; i < (data.drones || 0); i++) {
      S.drones.push(
        new Drone(100 + Math.random() * 600, -40 - Math.random() * 70),
      );
    }
    for (let i = 0; i < (data.cloakDrones || 0); i++) {
      S.drones.push(
        new CloakDrone(100 + Math.random() * 600, -40 - Math.random() * 70),
      );
    }
  }
}

// Expose onclick handlers to global scope
window.startGame = startGame;
window.startInfinite = startInfinite;
window.nextLevel = nextLevel;
window.resetGame = resetGame;
window.resumeGame = resumeGame;
