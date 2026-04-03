// ═══════════════════════════════════════════════════
// INPUT (Keyboard & Mouse handlers)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, STORY_SLIDES } from "./config.js";
import { keyLabel, saveBindings, refreshBindingUI } from "./ui.js";
import { advanceStory } from "./story.js";
import {
  shootMissile,
  activateAoE,
  activateShield,
  p2ShootMissile,
  p2ActivateAoE,
  p2ActivateShield,
} from "./abilities.js";
import { pauseGame, resumeGame } from "./game.js";

export function initInput() {
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

    // Binding capture mode
    if (S.bindingTarget) {
      e.preventDefault();
      if (k === "escape") {
        document
          .getElementById("btn-" + S.bindingTarget)
          .classList.remove("listening");
        document.getElementById("btn-" + S.bindingTarget).textContent =
          keyLabel(S.bindings[S.bindingTarget]);
      } else {
        S.bindings[S.bindingTarget] = k;
        saveBindings();
        document
          .getElementById("btn-" + S.bindingTarget)
          .classList.remove("listening");
        refreshBindingUI();
      }
      S.bindingTarget = null;
      return;
    }

    if (S.gameState === "STORY") {
      if (k === " " || k === "enter" || k === "arrowright") {
        e.preventDefault();
        advanceStory();
      }
      return;
    }

    if (
      document.activeElement.id === "name-input" ||
      document.activeElement.id === "name-input2"
    )
      return;
    S.keys[k] = true;

    if (S.gameState === "PLAYING") {
      const scrollKeys = [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " ",
      ];
      if (scrollKeys.includes(k)) e.preventDefault();

      if (k === "escape") {
        pauseGame();
        e.preventDefault();
        return;
      }
      if (k === S.bindings.ability1 && S.cdMissile <= 0) {
        shootMissile();
        e.preventDefault();
      }
      if (k === S.bindings.ability2 && S.cdAoe <= 0) {
        activateAoE();
        e.preventDefault();
      }
      if (k === S.bindings.ability3 && S.cdShield <= 0) {
        activateShield();
        e.preventDefault();
      }
      // P2 abilities
      if (S.twoPlayerMode && S.player2 && S.player2.hp > 0) {
        if (k === "." && S.p2CdMissile <= 0) {
          p2ShootMissile();
          e.preventDefault();
        }
        if (k === "," && S.p2CdAoe <= 0) {
          p2ActivateAoE();
          e.preventDefault();
        }
        if (k === "/" && S.p2CdShield <= 0) {
          p2ActivateShield();
          e.preventDefault();
        }
      }
    } else if (S.gameState === "PAUSED") {
      if (k === "escape") {
        resumeGame();
        e.preventDefault();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (
      document.activeElement.id !== "name-input" &&
      document.activeElement.id !== "name-input2"
    )
      S.keys[e.key.toLowerCase()] = false;
  });

  S.canvas.addEventListener("mousemove", (e) => {
    const r = S.canvas.getBoundingClientRect();
    S.mouse.x = e.clientX - r.left;
    S.mouse.y = e.clientY - r.top;
  });

  S.canvas.addEventListener("mousedown", (e) => {
    if (S.gameState === "STORY") {
      const r = S.canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const slide = STORY_SLIDES[S.storySlideIdx];
      const btnW = slide.isLast ? 200 : 140;
      const btnH2 = 40;
      const btnX = W / 2 - btnW / 2;
      const btnY = 482;
      if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH2) {
        advanceStory();
      }
      return;
    }
    S.mouse.isDown = true;
  });

  S.canvas.addEventListener("mouseup", (e) => {
    if (S.gameState === "STORY") return;
    S.mouse.isDown = false;
  });

  S.canvas.addEventListener("mousemove", (e2) => {
    if (S.gameState === "STORY") {
      const r = S.canvas.getBoundingClientRect();
      const mx = e2.clientX - r.left;
      const my = e2.clientY - r.top;
      const slide = STORY_SLIDES[S.storySlideIdx];
      const btnW = slide.isLast ? 200 : 140;
      const btnH2 = 40;
      const btnX = W / 2 - btnW / 2;
      const btnY = 482;
      S.storyBtnHover =
        mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH2;
      S.canvas.style.cursor = S.storyBtnHover ? "pointer" : "default";
    }
  });
}
