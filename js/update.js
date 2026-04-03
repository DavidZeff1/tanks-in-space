// ═══════════════════════════════════════════════════
// UPDATE (main game tick)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import {
  W,
  H,
  MAX_CD_MISSILE,
  MAX_CD_AOE,
  MAX_CD_SHIELD,
  LEVEL_DATA,
} from "./config.js";
import { dist, aabb, findNearestTarget } from "./utils.js";
import {
  addShake,
  updateShake,
  updateCombo,
  addScore,
  registerKill,
} from "./effects.js";
import { createParticles, createExplosion } from "./particles.js";
import { updateHP, updateHP2, applyPowerUp, applyPowerUpP2 } from "./hud.js";
import { saveLB } from "./ui.js";
import { PowerUp, SniperTank, HeavyTank, CloakDrone } from "./entities.js";

export function update() {
  // Story screen fade-in
  if (S.gameState === "STORY") {
    if (S.storyFade < 1) S.storyFade = Math.min(1, S.storyFade + 0.032);
    return;
  }
  if (S.gameState !== "PLAYING" || !S.player) return;
  S.frameCount++;

  updateShake();
  updateCombo();

  // Cooldowns
  if (S.cdMissile > 0) S.cdMissile--;
  if (S.cdAoe > 0) S.cdAoe--;
  if (S.cdShield > 0) S.cdShield--;
  document.getElementById("cd1").style.height =
    (S.cdMissile / MAX_CD_MISSILE) * 100 + "%";
  document.getElementById("cd2").style.height =
    (S.cdAoe / MAX_CD_AOE) * 100 + "%";
  document.getElementById("cd3").style.height =
    (S.cdShield / MAX_CD_SHIELD) * 100 + "%";

  // Shield
  if (S.shieldActive) {
    S.shieldTimer--;
    if (S.shieldTimer <= 0) S.shieldActive = false;
  }

  // Speed boost
  if (S.speedBoostTimer > 0) {
    S.speedBoostTimer--;
    if (S.speedBoostTimer === 0) S.player.speed = 3.5;
  }

  // Player 1
  if (S.player.cooldown > 0) S.player.cooldown--;
  S.player.angle = Math.atan2(S.mouse.y - S.player.y, S.mouse.x - S.player.x);
  let dx = 0,
    dy = 0;
  if (S.keys[S.bindings.up] || (!S.twoPlayerMode && S.keys["arrowup"]))
    dy -= S.player.speed;
  if (S.keys[S.bindings.down] || (!S.twoPlayerMode && S.keys["arrowdown"]))
    dy += S.player.speed;
  if (S.keys[S.bindings.left] || (!S.twoPlayerMode && S.keys["arrowleft"]))
    dx -= S.player.speed;
  if (S.keys[S.bindings.right] || (!S.twoPlayerMode && S.keys["arrowright"]))
    dx += S.player.speed;
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }
  if (S.player.hp > 0) {
    S.player.move(dx, dy);
  }
  if (S.mouse.isDown && S.player.hp > 0) S.player.shoot();

  // Player 2
  if (S.twoPlayerMode && S.player2 && S.player2.hp > 0) {
    if (S.player2.cooldown > 0) S.player2.cooldown--;
    if (S.p2CdMissile > 0) S.p2CdMissile--;
    if (S.p2CdAoe > 0) S.p2CdAoe--;
    if (S.p2CdShield > 0) S.p2CdShield--;
    document.getElementById("p2cd1").style.height =
      (S.p2CdMissile / MAX_CD_MISSILE) * 100 + "%";
    document.getElementById("p2cd2").style.height =
      (S.p2CdAoe / MAX_CD_AOE) * 100 + "%";
    document.getElementById("p2cd3").style.height =
      (S.p2CdShield / MAX_CD_SHIELD) * 100 + "%";
    if (S.p2ShieldActive) {
      S.p2ShieldTimer--;
      if (S.p2ShieldTimer <= 0) S.p2ShieldActive = false;
    }
    if (S.p2SpeedBoostTimer > 0) {
      S.p2SpeedBoostTimer--;
      if (S.p2SpeedBoostTimer === 0) S.player2.speed = 3.5;
    }
    const p2Target = findNearestTarget(S.player2.x, S.player2.y);
    let dx2 = 0,
      dy2 = 0;
    if (S.keys["arrowup"]) dy2 -= S.player2.speed;
    if (S.keys["arrowdown"]) dy2 += S.player2.speed;
    if (S.keys["arrowleft"]) dx2 -= S.player2.speed;
    if (S.keys["arrowright"]) dx2 += S.player2.speed;
    if (dx2 !== 0 && dy2 !== 0) {
      dx2 *= 0.707;
      dy2 *= 0.707;
    }
    S.player2.move(dx2, dy2);
    if (p2Target) {
      const targetAngle = Math.atan2(
        p2Target.y - S.player2.y,
        p2Target.x - S.player2.x,
      );
      let diff = targetAngle - S.player2.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      S.player2.angle += diff * 0.2;
    } else if (dx2 !== 0 || dy2 !== 0) {
      S.player2.angle = Math.atan2(dy2, dx2);
    }
    if (S.keys["shift"]) S.player2.shoot();
  }

  // Enemies
  for (let i = S.enemies.length - 1; i >= 0; i--) {
    const en = S.enemies[i];
    if (en.hp <= 0) {
      createExplosion(en.x, en.y, 40, 0);
      registerKill();
      const isSniper = en instanceof SniperTank;
      const isHeavy = en instanceof HeavyTank;
      addScore(isHeavy ? 200 : isSniper ? 150 : 100);
      const dropChance = isHeavy ? 0.55 : 0.35;
      if (Math.random() < dropChance)
        S.powerUps.push(
          new PowerUp(
            en.x,
            en.y,
            ["health", "speed", "shield"][Math.floor(Math.random() * 3)],
          ),
        );
      S.enemies.splice(i, 1);
      continue;
    }
    if (en.cooldown > 0) en.cooldown--;
    en.updateAI();
  }

  // Drones
  for (let i = S.drones.length - 1; i >= 0; i--) {
    const dr = S.drones[i];
    if (dr.dead) {
      createExplosion(dr.x, dr.y, 28, 0);
      registerKill();
      addScore(dr instanceof CloakDrone ? 75 : 50);
      S.drones.splice(i, 1);
      continue;
    }
    dr.update();
    const touchDist = dr.radius + S.player.size / 2;
    const droneDmg = dr instanceof CloakDrone ? 30 : 22;
    if (
      S.player.hp > 0 &&
      dist(dr.x, dr.y, S.player.x, S.player.y) < touchDist
    ) {
      if (S.shieldActive) {
        dr.dead = true;
        createParticles(dr.x, dr.y, "#00d4ff", 10);
      } else {
        S.player.hp -= droneDmg;
        dr.dead = true;
        updateHP();
        addShake(9);
      }
    }
    if (
      !dr.dead &&
      S.twoPlayerMode &&
      S.player2 &&
      S.player2.hp > 0 &&
      dist(dr.x, dr.y, S.player2.x, S.player2.y) <
        dr.radius + S.player2.size / 2
    ) {
      if (S.p2ShieldActive) {
        dr.dead = true;
        createParticles(dr.x, dr.y, "#f1c40f", 10);
      } else {
        S.player2.hp -= droneDmg;
        dr.dead = true;
        updateHP2();
        addShake(9);
      }
    }
  }

  // Boss
  if (S.boss) {
    if (S.boss.hp <= 0) {
      createExplosion(S.boss.x, S.boss.y, 220, 0);
      addScore(1200);
      registerKill();
      S.boss = null;
    } else {
      S.boss.update();
      document.getElementById("boss-hp-bar").style.width =
        Math.max(0, (S.boss.hp / S.boss.maxHp) * 100) + "%";
    }
  }

  // Bullets
  for (let i = S.bullets.length - 1; i >= 0; i--) {
    const b = S.bullets[i];
    b.update();
    if (b.dead) {
      S.bullets.splice(i, 1);
      continue;
    }
    const bRect = b.getRect();

    if (b.isPlayer) {
      for (let j = S.enemies.length - 1; j >= 0; j--) {
        if (aabb(bRect, S.enemies[j].getRect())) {
          if (b.isMissile) createExplosion(b.x, b.y, 82, 50);
          else {
            S.enemies[j].hp -= 10;
            createParticles(b.x, b.y, "#f39c12", 5);
          }
          b.dead = true;
          break;
        }
      }
      if (!b.dead) {
        for (let j = S.drones.length - 1; j >= 0; j--) {
          if (
            dist(b.x, b.y, S.drones[j].x, S.drones[j].y) <
            b.radius + S.drones[j].radius
          ) {
            if (b.isMissile) createExplosion(b.x, b.y, 82, 50);
            else S.drones[j].dead = true;
            b.dead = true;
            break;
          }
        }
      }
      if (!b.dead && S.boss && aabb(bRect, S.boss.getRect())) {
        if (b.isMissile) createExplosion(b.x, b.y, 82, 50);
        else {
          S.boss.hp -= 10;
          createParticles(b.x, b.y, "#9b59b6", 8);
          addScore(10);
        }
        b.dead = true;
      }
    } else {
      const bulletDmg = b.sniperDmg ? 20 : 10;
      if (S.player.hp > 0 && aabb(bRect, S.player.getRect())) {
        if (S.shieldActive) {
          createParticles(b.x, b.y, "#00d4ff", 8);
          b.dead = true;
        } else {
          S.player.hp -= bulletDmg;
          createParticles(b.x, b.y, "#e74c3c", 5);
          b.dead = true;
          updateHP();
          addShake(b.sniperDmg ? 8 : 5);
        }
      }
      if (
        !b.dead &&
        S.twoPlayerMode &&
        S.player2 &&
        S.player2.hp > 0 &&
        aabb(bRect, S.player2.getRect())
      ) {
        if (S.p2ShieldActive) {
          createParticles(b.x, b.y, "#f1c40f", 8);
          b.dead = true;
        } else {
          S.player2.hp -= bulletDmg;
          createParticles(b.x, b.y, "#e74c3c", 5);
          b.dead = true;
          updateHP2();
          addShake(b.sniperDmg ? 8 : 5);
        }
      }
    }
  }

  // Power-ups
  for (let i = S.powerUps.length - 1; i >= 0; i--) {
    const pu = S.powerUps[i];
    pu.update();
    if (pu.dead) {
      S.powerUps.splice(i, 1);
      continue;
    }
    let puPickedUp = false;
    if (
      S.player.hp > 0 &&
      dist(S.player.x, S.player.y, pu.x, pu.y) < S.player.size / 2 + pu.radius
    ) {
      applyPowerUp(pu.type);
      puPickedUp = true;
    }
    if (
      !puPickedUp &&
      S.twoPlayerMode &&
      S.player2 &&
      S.player2.hp > 0 &&
      dist(S.player2.x, S.player2.y, pu.x, pu.y) <
        S.player2.size / 2 + pu.radius
    ) {
      applyPowerUpP2(pu.type);
      puPickedUp = true;
    }
    if (puPickedUp) {
      createParticles(
        pu.x,
        pu.y,
        { health: "#2ecc71", speed: "#f1c40f", shield: "#00d4ff" }[pu.type],
        16,
      );
      S.powerUps.splice(i, 1);
    }
  }

  // Particles
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const p = S.particles[i];
    if (p.type === "ring") {
      p.r += (p.maxR - p.r) * 0.2;
      p.life--;
    } else {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    }
    if (p.life <= 0) S.particles.splice(i, 1);
  }

  document.getElementById("enemies-display").textContent =
    S.enemies.length + S.drones.length + (S.boss ? 1 : 0);

  // Level clear
  if (
    S.enemies.length === 0 &&
    S.drones.length === 0 &&
    !S.boss &&
    S.gameState === "PLAYING"
  ) {
    const isBossLevel =
      S.currentLevelIdx === LEVEL_DATA.length - 1 && !S.infiniteMode;
    if (isBossLevel) {
      S.gameState = "WIN";
      saveLB(S.player.name, S.score);
      document.getElementById("win-score").textContent =
        `ניקוד סופי: ${S.score.toLocaleString()}`;
      document.getElementById("win-screen").style.display = "block";
      document.getElementById("boss-ui").style.display = "none";
    } else {
      S.gameState = "LEVEL_END";
      const wave = S.infiniteMode
        ? `גל ${S.currentLevelIdx - LEVEL_DATA.length + 1}`
        : `שלב ${S.currentLevelIdx + 1}`;
      document.getElementById("level-title").textContent = `${wave} הושלם!`;
      document.getElementById("level-score-info").textContent =
        `ניקוד: ${S.score.toLocaleString()}`;
      document.getElementById("level-screen").style.display = "block";
    }
  }
}
