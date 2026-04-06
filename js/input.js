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

/* ── Mobile detection ── */
function detectMobile() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

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

  /* ═══════════════════════════════════════════════════
     MOBILE TOUCH CONTROLS
     ═══════════════════════════════════════════════════ */
  if (detectMobile()) {
    S.isMobile = true;
    S.autoShoot = true;

    const mobileControls = document.getElementById("mobile-controls");
    if (mobileControls) mobileControls.style.display = "block";

    // Show mobile instructions, hide desktop ones
    const desktopHint = document.getElementById("desktop-controls");
    const mobileHint = document.getElementById("mobile-controls-hint");
    if (desktopHint) desktopHint.style.display = "none";
    if (mobileHint) mobileHint.style.display = "block";

    // Prevent default touch behaviors on canvas
    S.canvas.style.touchAction = "none";
    document.body.style.touchAction = "none";

    const joystickZone = document.getElementById("joystick-zone");
    const joystickBase = document.getElementById("joystick-base");
    const joystickThumb = document.getElementById("joystick-thumb");
    let joystickTouchId = null;
    const JOYSTICK_RADIUS = 50; // half of base size minus thumb half

    joystickZone.addEventListener(
      "touchstart",
      (e) => {
        if (joystickTouchId !== null) return; // already have a joystick touch
        const t = e.changedTouches[0];
        joystickTouchId = t.identifier;

        const rect = S.canvas.getBoundingClientRect();
        const tx = t.clientX - rect.left;
        const ty = t.clientY - rect.top;

        S.touch.active = true;
        S.touch.startX = tx;
        S.touch.startY = ty;
        S.touch.currentX = tx;
        S.touch.currentY = ty;
        S.touch.dx = 0;
        S.touch.dy = 0;

        // Position joystick base
        joystickBase.style.display = "flex";
        joystickBase.style.left = t.clientX - rect.left - 60 + "px";
        joystickBase.style.top = t.clientY - rect.top - 60 + "px";

        // Reset thumb
        joystickThumb.style.transform = "translate(-50%, -50%)";
        joystickThumb.style.top = "50%";
        joystickThumb.style.left = "50%";

        e.preventDefault();
      },
      { passive: false },
    );

    joystickZone.addEventListener(
      "touchmove",
      (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier !== joystickTouchId) continue;

          const rect = S.canvas.getBoundingClientRect();
          const tx = t.clientX - rect.left;
          const ty = t.clientY - rect.top;

          S.touch.currentX = tx;
          S.touch.currentY = ty;

          let rawDx = tx - S.touch.startX;
          let rawDy = ty - S.touch.startY;
          const magnitude = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

          // Clamp to radius
          if (magnitude > JOYSTICK_RADIUS) {
            rawDx = (rawDx / magnitude) * JOYSTICK_RADIUS;
            rawDy = (rawDy / magnitude) * JOYSTICK_RADIUS;
          }

          // Normalized -1 to 1
          S.touch.dx = rawDx / JOYSTICK_RADIUS;
          S.touch.dy = rawDy / JOYSTICK_RADIUS;

          // Move thumb visual
          joystickThumb.style.left = 50 + (rawDx / 60) * 50 + "%";
          joystickThumb.style.top = 50 + (rawDy / 60) * 50 + "%";
        }
        e.preventDefault();
      },
      { passive: false },
    );

    const endJoystick = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId) {
          joystickTouchId = null;
          S.touch.active = false;
          S.touch.dx = 0;
          S.touch.dy = 0;
          joystickBase.style.display = "none";
          break;
        }
      }
      e.preventDefault();
    };

    joystickZone.addEventListener("touchend", endJoystick, { passive: false });
    joystickZone.addEventListener("touchcancel", endJoystick, {
      passive: false,
    });

    // Mobile ability buttons
    document.getElementById("mob-ab1").addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (S.gameState === "PLAYING" && S.cdMissile <= 0) shootMissile();
      },
      { passive: false },
    );

    document.getElementById("mob-ab2").addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (S.gameState === "PLAYING" && S.cdAoe <= 0) activateAoE();
      },
      { passive: false },
    );

    document.getElementById("mob-ab3").addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (S.gameState === "PLAYING" && S.cdShield <= 0) activateShield();
      },
      { passive: false },
    );

    // Mobile pause button
    document.getElementById("mobile-pause-btn").addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (S.gameState === "PLAYING") pauseGame();
        else if (S.gameState === "PAUSED") resumeGame();
      },
      { passive: false },
    );

    // Allow tapping on story screen
    S.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (S.gameState === "STORY") {
          e.preventDefault();
          advanceStory();
        }
      },
      { passive: false },
    );
  }
}
