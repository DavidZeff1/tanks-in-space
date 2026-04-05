// ═══════════════════════════════════════════════════
// HUD (HP bars, power-up application, game-over check)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import {
  MAX_CD_SHIELD,
  SHIELD_DURATION,
  HEAT_MAX,
  HEAT_OVERHEAT_LOCKOUT,
} from "./config.js";
import { addShake } from "./effects.js";
import { createExplosion } from "./particles.js";
import { saveLB } from "./ui.js";

export function updateHP() {
  const pct = Math.max(0, S.player.hp);
  document.getElementById("hp-bar").style.width = pct + "%";
  const bar = document.getElementById("hp-bar");
  if (pct < 30) bar.style.background = "linear-gradient(90deg,#c0392b,#e74c3c)";
  else if (pct < 60)
    bar.style.background = "linear-gradient(90deg,#e67e22,#f39c12)";
  else bar.style.background = "linear-gradient(90deg,#00ff88,#00cc66)";

  if (S.player.hp <= 0 && S.gameState === "PLAYING") {
    const p2alive = S.twoPlayerMode && S.player2 && S.player2.hp > 0;
    if (!p2alive) {
      S.gameState = "GAME_OVER";
      saveLB(S.player.name, S.score);
      document.getElementById("go-score").textContent =
        `ניקוד: ${S.score.toLocaleString()}`;
      document.getElementById("gameover-screen").style.display = "block";
    }
    addShake(22);
    createExplosion(S.player.x, S.player.y, 40, 0);
  }
}

export function updateHP2() {
  if (!S.player2) return;
  const pct = Math.max(0, S.player2.hp);
  document.getElementById("hp-bar2").style.width = pct + "%";
  const bar = document.getElementById("hp-bar2");
  if (pct < 30) bar.style.background = "linear-gradient(90deg,#c0392b,#e74c3c)";
  else if (pct < 60)
    bar.style.background = "linear-gradient(90deg,#e67e22,#f39c12)";
  else bar.style.background = "linear-gradient(90deg,#4a9fff,#2070d0)";

  if (S.player2.hp <= 0 && S.gameState === "PLAYING") {
    const p1alive = S.player && S.player.hp > 0;
    if (!p1alive) {
      S.gameState = "GAME_OVER";
      saveLB(S.player.name, S.score);
      document.getElementById("go-score").textContent =
        `ניקוד: ${S.score.toLocaleString()}`;
      document.getElementById("gameover-screen").style.display = "block";
    }
    addShake(22);
    createExplosion(S.player2.x, S.player2.y, 40, 0);
  }
}

export function applyPowerUp(type) {
  if (type === "health") {
    S.player.hp = Math.min(100, S.player.hp + 38);
    updateHP();
  } else if (type === "speed") {
    S.player.speed = 6.2;
    S.speedBoostTimer = 320;
  } else if (type === "shield") {
    S.shieldActive = true;
    S.shieldTimer = SHIELD_DURATION;
    S.cdShield = MAX_CD_SHIELD;
  }
}

export function applyPowerUpP2(type) {
  if (!S.player2) return;
  if (type === "health") {
    S.player2.hp = Math.min(100, S.player2.hp + 38);
    updateHP2();
  } else if (type === "speed") {
    S.player2.speed = 6.2;
    S.p2SpeedBoostTimer = 320;
  } else if (type === "shield") {
    S.p2ShieldActive = true;
    S.p2ShieldTimer = SHIELD_DURATION;
    S.p2CdShield = MAX_CD_SHIELD;
  }
}

export function updateHeatBar() {
  const bar = document.getElementById("heat-bar");
  if (!bar) return;
  if (S.weaponOverheated) {
    const pct = 100 - (S.weaponOverheatTimer / HEAT_OVERHEAT_LOCKOUT) * 100;
    bar.style.width = pct + "%";
    bar.style.background = "linear-gradient(90deg,#c0392b,#e74c3c)";
  } else {
    const pct = (S.weaponHeat / HEAT_MAX) * 100;
    bar.style.width = pct + "%";
    if (pct > 75)
      bar.style.background = "linear-gradient(90deg,#e67e22,#f39c12)";
    else bar.style.background = "linear-gradient(90deg,#3498db,#2980b9)";
  }
}

export function updateHeatBarP2() {
  const bar = document.getElementById("heat-bar2");
  if (!bar) return;
  if (S.p2WeaponOverheated) {
    const pct = 100 - (S.p2WeaponOverheatTimer / HEAT_OVERHEAT_LOCKOUT) * 100;
    bar.style.width = pct + "%";
    bar.style.background = "linear-gradient(90deg,#c0392b,#e74c3c)";
  } else {
    const pct = (S.p2WeaponHeat / HEAT_MAX) * 100;
    bar.style.width = pct + "%";
    if (pct > 75)
      bar.style.background = "linear-gradient(90deg,#e67e22,#f39c12)";
    else bar.style.background = "linear-gradient(90deg,#3498db,#2980b9)";
  }
}
