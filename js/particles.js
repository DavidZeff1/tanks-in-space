// ═══════════════════════════════════════════════════
// PARTICLES & EXPLOSIONS
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { dist } from "./utils.js";
import { addShake } from "./effects.js";
import { updateHP, updateHP2 } from "./hud.js";

export function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    S.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      life: 8 + Math.random() * 14,
      maxLife: 22,
      color,
    });
  }
}

export function spawnBounceParticle(x, y) {
  for (let i = 0; i < 4; i++) {
    S.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 6 + Math.random() * 8,
      maxLife: 14,
      color: "#00d4ff",
    });
  }
}

export function createExplosion(x, y, radius, damage) {
  addShake(Math.min(radius / 4.5, 16));
  createParticles(x, y, "#e74c3c", 14);
  createParticles(x, y, "#FF8C20", 16);
  createParticles(x, y, "#6A4520", 12);
  createParticles(x, y, "#f1c40f", 10);
  createParticles(x, y, "#C86020", 8);
  S.particles.push({
    type: "ring",
    x,
    y,
    r: 5,
    maxR: radius,
    life: 22,
    maxLife: 22,
  });

  S.enemies.forEach((en) => {
    if (dist(x, y, en.x, en.y) < radius) en.hp -= damage;
  });
  S.drones.forEach((dr) => {
    if (dist(x, y, dr.x, dr.y) < radius) dr.dead = true;
  });
  if (S.boss && dist(x, y, S.boss.x, S.boss.y) < radius + S.boss.size / 2)
    S.boss.hp -= damage;
  if (
    S.player &&
    dist(x, y, S.player.x, S.player.y) < radius &&
    !S.shieldActive
  ) {
    S.player.hp -= damage * 0.25;
    updateHP();
  }
  if (
    S.twoPlayerMode &&
    S.player2 &&
    S.player2.hp > 0 &&
    dist(x, y, S.player2.x, S.player2.y) < radius &&
    !S.p2ShieldActive
  ) {
    S.player2.hp -= damage * 0.25;
    updateHP2();
  }
}
