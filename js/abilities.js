// ═══════════════════════════════════════════════════
// ABILITIES (P1 & P2)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import {
  MAX_CD_MISSILE,
  MAX_CD_AOE,
  MAX_CD_SHIELD,
  SHIELD_DURATION,
} from "./config.js";
import { Bullet } from "./entities.js";
import { createExplosion } from "./particles.js";
import { createParticles } from "./particles.js";

// ── P1 Abilities ──

export function shootMissile() {
  const tx = S.player.x + Math.cos(S.player.angle) * S.player.size;
  const ty = S.player.y + Math.sin(S.player.angle) * S.player.size;
  S.bullets.push(new Bullet(tx, ty, S.player.angle, true, true));
  S.cdMissile = MAX_CD_MISSILE;
}

export function activateAoE() {
  createExplosion(S.player.x, S.player.y, 155, 100);
  S.cdAoe = MAX_CD_AOE;
}

export function activateShield() {
  S.shieldActive = true;
  S.shieldTimer = SHIELD_DURATION;
  S.cdShield = MAX_CD_SHIELD;
  createParticles(S.player.x, S.player.y, "#00d4ff", 12);
}

// ── P2 Abilities ──

export function p2ShootMissile() {
  if (!S.player2 || S.player2.hp <= 0) return;
  const tx = S.player2.x + Math.cos(S.player2.angle) * S.player2.size;
  const ty = S.player2.y + Math.sin(S.player2.angle) * S.player2.size;
  const b = new Bullet(tx, ty, S.player2.angle, true, true);
  b.isP2 = true;
  S.bullets.push(b);
  S.p2CdMissile = MAX_CD_MISSILE;
}

export function p2ActivateAoE() {
  if (!S.player2 || S.player2.hp <= 0) return;
  createExplosion(S.player2.x, S.player2.y, 155, 100);
  S.p2CdAoe = MAX_CD_AOE;
}

export function p2ActivateShield() {
  if (!S.player2 || S.player2.hp <= 0) return;
  S.p2ShieldActive = true;
  S.p2ShieldTimer = SHIELD_DURATION;
  S.p2CdShield = MAX_CD_SHIELD;
  createParticles(S.player2.x, S.player2.y, "#f1c40f", 12);
}
