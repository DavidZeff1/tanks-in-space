// ═══════════════════════════════════════════════════
// SCREEN SHAKE & SCORE / COMBO
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { COMBO_WINDOW } from "./config.js";

// ── Screen Shake ──

export function addShake(mag) {
  S.shakeMag = Math.max(S.shakeMag, mag);
}

export function updateShake() {
  if (S.shakeMag > 0.15) {
    S.shakeX = (Math.random() - 0.5) * S.shakeMag * 2;
    S.shakeY = (Math.random() - 0.5) * S.shakeMag * 2;
    S.shakeMag *= 0.78;
  } else {
    S.shakeX = S.shakeY = S.shakeMag = 0;
  }
}

// ── Score / Combo ──

export function addScore(base) {
  const mult = 1 + S.combo * 0.5;
  S.score += Math.round(base * mult);
  document.getElementById("score-num").textContent = S.score.toLocaleString();
}

export function registerKill() {
  S.combo++;
  S.comboTimer = COMBO_WINDOW;
  const el = document.getElementById("combo-display");
  if (S.combo > 1) {
    el.textContent = `x${S.combo} COMBO!`;
    el.style.color =
      S.combo >= 5 ? "#e74c3c" : S.combo >= 3 ? "#f1c40f" : "#f39c12";
    el.style.textShadow = `0 0 8px ${S.combo >= 5 ? "rgba(231,76,60,0.7)" : "rgba(241,196,15,0.7)"}`;
  }
}

export function updateCombo() {
  if (S.comboTimer > 0) {
    S.comboTimer--;
    if (S.comboTimer === 0) {
      S.combo = 0;
      document.getElementById("combo-display").textContent = "";
    }
  }
}
