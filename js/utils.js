// ═══════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════

import S from "./state.js";

export function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function aabb(r1, r2) {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

export function nearestLivingPlayer(x, y) {
  const p1a = S.player && S.player.hp > 0;
  const p2a = S.twoPlayerMode && S.player2 && S.player2.hp > 0;
  if (p1a && p2a)
    return dist(x, y, S.player.x, S.player.y) <=
      dist(x, y, S.player2.x, S.player2.y)
      ? S.player
      : S.player2;
  if (p1a) return S.player;
  if (p2a) return S.player2;
  return S.player;
}

export function findNearestTarget(x, y) {
  let closest = null,
    minD = Infinity;
  S.enemies.forEach((en) => {
    const d = dist(x, y, en.x, en.y);
    if (d < minD) {
      minD = d;
      closest = en;
    }
  });
  S.drones.forEach((dr) => {
    const d = dist(x, y, dr.x, dr.y);
    if (d < minD) {
      minD = d;
      closest = dr;
    }
  });
  if (S.boss) {
    const d = dist(x, y, S.boss.x, S.boss.y);
    if (d < minD) {
      minD = d;
      closest = S.boss;
    }
  }
  return closest;
}

export function storyRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
