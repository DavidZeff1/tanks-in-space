// ═══════════════════════════════════════════════════
// DRAW (main render function)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, H } from "./config.js";
import {
  drawGround,
  drawStars,
  drawVignette,
  drawOffscreenIndicators,
} from "./renderer.js";
import { drawStoryScreen } from "./story.js";

export function draw() {
  const ctx = S.ctx;
  ctx.save();
  ctx.translate(S.shakeX, S.shakeY);

  // Story screen
  if (S.gameState === "STORY") {
    ctx.restore();
    drawStoryScreen();
    return;
  }

  // Start screen
  if (S.gameState === "START") {
    ctx.fillStyle = "#16100A";
    ctx.fillRect(-8, -8, W + 16, H + 16);

    if (S.bgImage.complete && S.bgImage.naturalWidth > 0) {
      const scale = Math.max(
        W / S.bgImage.naturalWidth,
        H / S.bgImage.naturalHeight,
      );
      const iw = S.bgImage.naturalWidth * scale,
        ih = S.bgImage.naturalHeight * scale;
      ctx.drawImage(S.bgImage, (W - iw) / 2, (H - ih) / 2, iw, ih);
    } else {
      drawGround();
    }

    const vg = ctx.createRadialGradient(
      W / 2,
      H / 2,
      60,
      W / 2,
      H / 2,
      W * 0.7,
    );
    vg.addColorStop(0, "rgba(0,0,0,0.38)");
    vg.addColorStop(1, "rgba(0,0,0,0.78)");
    ctx.fillStyle = vg;
    ctx.fillRect(-8, -8, W + 16, H + 16);

    ctx.fillStyle = "rgba(0,0,0,0.04)";
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(-8, y, W + 16, 1);
    }

    drawStars();

    ctx.restore();
    drawVignette();
    return;
  }

  // Gameplay
  drawGround();

  // Walls
  S.walls.forEach((w) => {
    ctx.fillStyle = "#14191F";
    ctx.fillRect(w.x, w.y, w.w, w.h);
    const pw = 22;
    ctx.fillStyle = "#1C2430";
    for (let px = w.x + 2; px < w.x + w.w - 2; px += pw) {
      ctx.fillRect(px, w.y + 2, Math.min(pw - 2, w.x + w.w - px - 4), w.h - 4);
    }
    ctx.strokeStyle = "#253040";
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    const horiz = w.w >= w.h;
    ctx.strokeStyle = "rgba(0,200,180,0.38)";
    ctx.lineWidth = 1.5;
    if (horiz) {
      ctx.beginPath();
      ctx.moveTo(w.x + 4, w.y + 1.5);
      ctx.lineTo(w.x + w.w - 4, w.y + 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w.x + 4, w.y + w.h - 1.5);
      ctx.lineTo(w.x + w.w - 4, w.y + w.h - 1.5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(w.x + 1.5, w.y + 4);
      ctx.lineTo(w.x + 1.5, w.y + w.h - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w.x + w.w - 1.5, w.y + 4);
      ctx.lineTo(w.x + w.w - 1.5, w.y + w.h - 4);
      ctx.stroke();
    }
    ctx.fillStyle = "#2A3A4A";
    [
      [w.x + 3, w.y + 3],
      [w.x + w.w - 3, w.y + 3],
      [w.x + 3, w.y + w.h - 3],
      [w.x + w.w - 3, w.y + w.h - 3],
    ].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowColor = "#FF8020";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "rgba(255,120,30,0.75)";
    ctx.beginPath();
    ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  S.powerUps.forEach((pu) => pu.draw());
  S.bullets.forEach((b) => b.draw());
  S.enemies.forEach((e) => e.draw());
  S.drones.forEach((d) => d.draw());
  if (S.boss) S.boss.draw();
  if (S.player && S.player.hp > 0) S.player.draw();
  if (S.twoPlayerMode && S.player2 && S.player2.hp > 0) S.player2.draw();

  // Particles
  S.particles.forEach((p) => {
    if (p.type === "ring") {
      ctx.strokeStyle = `rgba(231,76,60,${(p.life / p.maxLife) * 0.9})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + p.life / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  drawOffscreenIndicators();

  ctx.restore();
  drawVignette();
}
