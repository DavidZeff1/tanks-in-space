// ═══════════════════════════════════════════════════
// ENTITY CLASSES (Tank, Drone, Boss, Boss2, Bullet, PowerUp)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, H } from "./config.js";
import { aabb, nearestLivingPlayer } from "./utils.js";
import {
  createParticles,
  spawnBounceParticle,
  createExplosion,
} from "./particles.js";
import { addShake } from "./effects.js";

// ═══════════════════════════════════════════════════
// TANK
// ═══════════════════════════════════════════════════
export class Tank {
  constructor(x, y, color, isPlayer, name = "", isP2 = false) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.color = color;
    this.isPlayer = isPlayer;
    this.isP2 = isP2;
    this.name = name;
    this.angle = 0;
    this.speed = isPlayer ? 3.5 : 1.35;
    this.hp = isPlayer ? 100 : 20;
    this.maxHp = this.hp;
    this.cooldown = 0;
    this.flankTimer = 30 + Math.random() * 60;
    this.flankDir = Math.random() < 0.5 ? 1 : -1;
    this.getRect = () => ({
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      w: this.size,
      h: this.size,
    });
  }

  move(dx, dy) {
    const r = this.getRect();
    const nx = { ...r, x: r.x + dx };
    if (!S.walls.some((w) => aabb(nx, w)) && nx.x >= 0 && nx.x + nx.w <= W)
      this.x += dx;
    const ny = { ...r, y: r.y + dy };
    if (!S.walls.some((w) => aabb(ny, w)) && ny.y >= 0 && ny.y + ny.h <= H)
      this.y += dy;
  }

  shoot() {
    if (this.cooldown <= 0) {
      const tx = this.x + Math.cos(this.angle) * this.size;
      const ty = this.y + Math.sin(this.angle) * this.size;
      const b = new Bullet(tx, ty, this.angle, this.isPlayer, false);
      b.isP2 = this.isP2;
      S.bullets.push(b);
      this.cooldown = this.isPlayer ? 12 : 75;
    }
  }

  updateAI() {
    const tgt = nearestLivingPlayer(this.x, this.y);
    if (!tgt) return;
    const d = Math.hypot(tgt.x - this.x, tgt.y - this.y);
    this.angle = Math.atan2(tgt.y - this.y, tgt.x - this.x);

    this.flankTimer--;
    if (this.flankTimer <= 0) {
      this.flankTimer = 60 + Math.random() * 90;
      this.flankDir = -this.flankDir;
    }

    if (d > 280) {
      const ma = this.angle + this.flankDir * 0.25;
      this.move(Math.cos(ma) * this.speed, Math.sin(ma) * this.speed);
    } else if (d > 120) {
      const sa = this.angle + (Math.PI / 2) * this.flankDir;
      this.move(
        Math.cos(sa) * this.speed * 0.8,
        Math.sin(sa) * this.speed * 0.8,
      );
    } else {
      this.move(
        -Math.cos(this.angle) * this.speed * 0.6,
        -Math.sin(this.angle) * this.speed * 0.6,
      );
    }

    if (Math.random() < 0.016) this.shoot();
  }

  draw() {
    const ctx = S.ctx;
    const s = this.size;
    const isP = this.isPlayer;
    const isP2 = this.isP2;
    const trackCol = "#16120C";
    const trackSeg = isP2 ? "#182838" : isP ? "#252D18" : "#2A1208";
    const hullDark = isP2 ? "#14284A" : isP ? "#2A3A1C" : "#4A1A08";
    const hullBase = isP2 ? "#1A4080" : isP ? "#4A6030" : "#7A2808";
    const hullLight = isP2 ? "#2060A0" : isP ? "#5A7840" : "#963218";
    const turrBase = isP2 ? "#163060" : isP ? "#3A4E26" : "#5C2010";
    const turrRim = isP2 ? "#1A4080" : isP ? "#4A6232" : "#7C2812";
    const barrelCol = isP2 ? "#0E2040" : isP ? "#283818" : "#381408";

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const myShieldActive = isP2 ? S.p2ShieldActive : S.shieldActive;
    if (isP && myShieldActive) {
      ctx.shadowColor = isP2 ? "#f1c40f" : "#00d4ff";
      ctx.shadowBlur = 28;
      ctx.strokeStyle = isP2 ? "rgba(241,196,15,0.55)" : "rgba(0,212,255,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, s + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Tracks
    const segH = (s - 4) / 5;
    ctx.fillStyle = trackCol;
    ctx.fillRect(-s / 2 - 5, -s / 2, 8, s);
    ctx.beginPath();
    ctx.arc(-s / 2 - 1, -s / 2 + 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s / 2 - 1, s / 2 - 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? trackSeg : trackCol;
      ctx.fillRect(-s / 2 - 4, -s / 2 + 2 + i * segH, 6, segH - 1);
    }
    ctx.fillStyle = trackCol;
    ctx.fillRect(s / 2 - 3, -s / 2, 8, s);
    ctx.beginPath();
    ctx.arc(s / 2 + 1, -s / 2 + 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s / 2 + 1, s / 2 - 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? trackSeg : trackCol;
      ctx.fillRect(s / 2 - 2, -s / 2 + 2 + i * segH, 6, segH - 1);
    }

    // Hull
    ctx.fillStyle = hullDark;
    ctx.fillRect(-s / 2 + 2, -s / 2 + 3, s - 4, s - 6);
    ctx.fillStyle = hullBase;
    ctx.fillRect(-s / 2 + 4, -s / 2 + 5, s - 8, s - 10);
    ctx.fillStyle = hullLight;
    ctx.fillRect(-s / 2 + 5, -s / 2 + 6, s - 10, 4);
    ctx.strokeStyle = hullDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s / 2 + 5, -s / 2 + 11);
    ctx.lineTo(s / 2 - 5, -s / 2 + 11);
    ctx.stroke();
    ctx.fillStyle = hullDark;
    ctx.fillRect(-s / 2 + 5, s / 2 - 10, s - 10, 4);
    ctx.fillStyle = hullDark;
    ctx.fillRect(-s / 2 + 2, s / 2 - 16, 4, 6);
    ctx.fillRect(s / 2 - 6, s / 2 - 16, 4, 6);

    // Turret
    ctx.fillStyle = hullDark;
    ctx.beginPath();
    ctx.arc(0, 0, s / 3 + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = turrBase;
    ctx.beginPath();
    ctx.arc(0, 0, s / 3 + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = turrRim;
    ctx.beginPath();
    ctx.arc(0, 0, s / 3 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hullDark;
    ctx.beginPath();
    ctx.arc(-1, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = turrBase;
    ctx.beginPath();
    ctx.arc(-1, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = trackSeg;
    ctx.beginPath();
    ctx.arc(-1, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Barrel
    ctx.fillStyle = hullDark;
    ctx.fillRect(-1, -4, s / 2 + 14, 8);
    ctx.fillStyle = barrelCol;
    ctx.fillRect(0, -3, s / 2 + 12, 6);
    ctx.fillStyle = hullBase;
    ctx.fillRect(s / 4, -2.5, s / 4 + 2, 2);
    ctx.fillStyle = hullDark;
    ctx.fillRect(s / 2 + 9, -4, 5, 8);
    ctx.fillStyle = trackCol;
    ctx.fillRect(s / 2 + 10, -3.5, 3, 7);

    ctx.restore();

    // Player name tag
    if (isP && this.name) {
      ctx.save();
      ctx.shadowColor = isP2 ? "#f1c40f" : "#00d4ff";
      ctx.shadowBlur = 8;
      ctx.fillStyle = isP2 ? "rgba(241,196,15,0.9)" : "rgba(0,212,255,0.9)";
      ctx.font = 'bold 12px "Segoe UI",Arial';
      ctx.textAlign = "center";
      ctx.fillText(this.name, this.x, this.y - s - 9);
      ctx.restore();
    }

    // Enemy HP bar
    if (!isP) {
      const hpPct = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(this.x - 16, this.y - 28, 32, 5);
      ctx.fillStyle =
        hpPct > 0.5 ? "#c0392b" : hpPct > 0.25 ? "#e67e22" : "#ff2200";
      ctx.fillRect(this.x - 16, this.y - 28, 32 * hpPct, 5);
    }
  }
}

// ═══════════════════════════════════════════════════
// DRONE
// ═══════════════════════════════════════════════════
export class Drone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.speed = 4.2;
    this.angle = 0;
    this.dead = false;
    this.getRect = () => ({
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2,
    });
  }

  update() {
    const tgt = nearestLivingPlayer(this.x, this.y);
    this.angle = Math.atan2(tgt.y - this.y, tgt.x - this.x);
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw() {
    const ctx = S.ctx;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.shadowColor = "#FF7020";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#1A1008";
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(3, 9);
    ctx.lineTo(-10, 7);
    ctx.lineTo(-10, -7);
    ctx.lineTo(3, -9);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#7A3010";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(1, 7);
    ctx.lineTo(-7, 5);
    ctx.lineTo(-7, -5);
    ctx.lineTo(1, -7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = "#FF6010";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#FF8020";
    ctx.beginPath();
    ctx.arc(-7, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#5A2808";
    ctx.fillRect(10, -1.5, 5, 3);
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════
// BOSS (Level 9)
// ═══════════════════════════════════════════════════
export class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 72;
    this.hp = 480;
    this.maxHp = 480;
    this.angle = 0;
    this.t = 0;
    this.cooldown = 0;
    this.droneCd = 200;
    this.phase = 1;
    this.getRect = () => ({
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      w: this.size,
      h: this.size,
    });
  }

  update() {
    const tgt = nearestLivingPlayer(this.x, this.y);
    this.angle = Math.atan2(tgt.y - this.y, tgt.x - this.x);
    if (this.hp < this.maxHp * 0.4 && this.phase === 1) {
      this.phase = 2;
      addShake(18);
      createParticles(this.x, this.y, "#e74c3c", 30);
    }
    const spd = this.phase === 2 ? 0.025 : 0.013;
    this.t += spd;
    this.x = W / 2 + Math.sin(this.t) * 260;
    this.y = 160 + Math.sin(this.t * 1.7) * 50;

    if (this.cooldown > 0) this.cooldown--;
    else {
      const spread = this.phase === 2 ? 4 : 2;
      for (let i = -spread; i <= spread; i++) {
        const a = this.angle + i * 0.09;
        const bx = this.x + (Math.cos(a) * this.size) / 2;
        const by = this.y + (Math.sin(a) * this.size) / 2;
        const b = new Bullet(bx, by, a, false, false);
        b.radius = this.phase === 2 ? 6 : 4;
        S.bullets.push(b);
      }
      this.cooldown = this.phase === 2 ? 52 : 80;
    }

    if (this.droneCd > 0) this.droneCd--;
    else {
      S.drones.push(new Drone(this.x, this.y + 45));
      this.droneCd = this.phase === 2 ? 150 : 240;
    }
  }

  draw() {
    const ctx = S.ctx;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const col = this.phase === 2 ? "#7a0f0f" : "#3a1a6a";
    ctx.shadowColor = this.phase === 2 ? "#e74c3c" : "#9b59b6";
    ctx.shadowBlur = 24;
    ctx.fillStyle = this.phase === 2 ? "#4a0808" : "#250a40";
    ctx.fillRect(
      -this.size / 2 - 10,
      -this.size / 2,
      this.size + 20,
      this.size,
    );
    ctx.fillStyle = col;
    ctx.fillRect(
      -this.size / 2,
      -this.size / 2 + 10,
      this.size,
      this.size - 20,
    );
    ctx.fillStyle = "#080810";
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.phase === 2 ? "#e74c3c" : "#9b59b6";
    ctx.fillRect(0, -7, this.size / 2 + 22, 14);
    ctx.fillRect(0, -16, this.size / 2 + 12, 8);
    if (this.phase === 2) {
      ctx.strokeStyle = "#ff6040";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        -this.size / 2 + 4,
        -this.size / 2 + 4,
        this.size - 8,
        this.size - 8,
      );
    }
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════
// BOSS2 (Final Boss - Level 20)
// ═══════════════════════════════════════════════════
export class Boss2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 82;
    this.hp = 1000;
    this.maxHp = 1000;
    this.angle = 0;
    this.t = 0;
    this.cooldown = 0;
    this.droneCd = 150;
    this.spawnCd = 380;
    this.phase = 1;
    this.getRect = () => ({
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      w: this.size,
      h: this.size,
    });
  }

  update() {
    const tgt = nearestLivingPlayer(this.x, this.y);
    this.angle = Math.atan2(tgt.y - this.y, tgt.x - this.x);

    if (this.hp < this.maxHp * 0.25 && this.phase < 3) {
      this.phase = 3;
      addShake(28);
      createParticles(this.x, this.y, "#ff0080", 45);
      createParticles(this.x, this.y, "#ffffff", 20);
    } else if (this.hp < this.maxHp * 0.55 && this.phase < 2) {
      this.phase = 2;
      addShake(20);
      createParticles(this.x, this.y, "#e74c3c", 35);
    }

    const spd = this.phase === 3 ? 0.052 : this.phase === 2 ? 0.036 : 0.02;
    this.t += spd;
    if (this.phase === 1) {
      this.x = W / 2 + Math.cos(this.t) * 265;
      this.y = 160 + Math.sin(this.t) * 85;
    } else if (this.phase === 2) {
      this.x = W / 2 + Math.sin(this.t) * 285;
      this.y = 200 + Math.sin(this.t * 2) * 115;
    } else {
      this.x = W / 2 + Math.sin(this.t * 1.4) * 295;
      this.y = 185 + Math.cos(this.t * 0.85) * 130;
    }

    if (this.cooldown > 0) this.cooldown--;
    else {
      const spread = this.phase === 3 ? 12 : this.phase === 2 ? 8 : 5;
      const cd = this.phase === 3 ? 22 : this.phase === 2 ? 36 : 52;
      for (let i = -spread; i <= spread; i += 2) {
        const a = this.angle + i * 0.07;
        const bx = this.x + (Math.cos(a) * this.size) / 2;
        const by = this.y + (Math.sin(a) * this.size) / 2;
        const b = new Bullet(bx, by, a, false, false);
        b.radius = this.phase === 3 ? 8 : 6;
        S.bullets.push(b);
      }
      if (this.phase >= 2) {
        const n = this.phase === 3 ? 12 : 8;
        for (let i = 0; i < n; i++) {
          const a = ((Math.PI * 2) / n) * i;
          const bx = this.x + (Math.cos(a) * this.size) / 2;
          const by = this.y + (Math.sin(a) * this.size) / 2;
          const b = new Bullet(bx, by, a, false, false);
          b.radius = 5;
          S.bullets.push(b);
        }
      }
      this.cooldown = cd;
    }

    if (this.droneCd > 0) this.droneCd--;
    else {
      S.drones.push(new Drone(this.x, this.y + 50));
      if (this.phase >= 2) S.drones.push(new Drone(this.x - 50, this.y));
      if (this.phase === 3) S.drones.push(new Drone(this.x + 50, this.y));
      this.droneCd = this.phase === 3 ? 75 : this.phase === 2 ? 110 : 170;
    }

    if (this.phase >= 2) {
      if (this.spawnCd > 0) this.spawnCd--;
      else {
        S.enemies.push(
          new Tank(
            50 + Math.random() * 700,
            50 + Math.random() * 200,
            "#c0392b",
            false,
          ),
        );
        this.spawnCd = this.phase === 3 ? 180 : 320;
      }
    }
  }

  draw() {
    const ctx = S.ctx;
    const glowCols = ["#cc44ff", "#ff0080", "#ff3300"];
    const bodyCols = ["#3a0a5a", "#7a0a40", "#4a0000"];
    const g = glowCols[this.phase - 1];
    const bc = bodyCols[this.phase - 1];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.shadowColor = g;
    ctx.shadowBlur = 32;

    ctx.fillStyle = "#0a0015";
    ctx.fillRect(
      -this.size / 2 - 14,
      -this.size / 2,
      this.size + 28,
      this.size,
    );
    ctx.fillStyle = bc;
    ctx.fillRect(
      -this.size / 2,
      -this.size / 2 + 10,
      this.size,
      this.size - 20,
    );
    ctx.fillStyle = "#080010";
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g;
    ctx.fillRect(0, -9, this.size / 2 + 30, 12);
    ctx.fillRect(0, -22, this.size / 2 + 20, 9);
    ctx.fillRect(0, 13, this.size / 2 + 20, 9);
    if (this.phase === 3) {
      ctx.strokeStyle = "rgba(255,50,50,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        -this.size / 2 + 4,
        -this.size / 2 + 4,
        this.size - 8,
        this.size - 8,
      );
      ctx.strokeRect(
        -this.size / 2 + 8,
        -this.size / 2 + 8,
        this.size - 16,
        this.size - 16,
      );
    }
    ctx.restore();

    if (this.phase >= 2) {
      ctx.save();
      ctx.fillStyle = g;
      ctx.shadowColor = g;
      ctx.shadowBlur = 12;
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        this.phase === 3 ? "☠ RAGE MODE ☠" : "⚡ PHASE 2 ⚡",
        this.x,
        this.y - this.size / 2 - 12,
      );
      ctx.restore();
    }
  }
}

// ═══════════════════════════════════════════════════
// BULLET
// ═══════════════════════════════════════════════════
export class Bullet {
  constructor(x, y, angle, isPlayer, isMissile) {
    this.x = x;
    this.y = y;
    this.isPlayer = isPlayer;
    this.isP2 = false;
    this.isMissile = isMissile;
    this.radius = isMissile ? 6 : 4;
    this.bounces = 0;
    this.maxBounces = isPlayer && !isMissile && S.ricochetEnabled ? 3 : 0;
    const spd = isMissile ? 12 : 8;
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;
    this.life = 350;
    this.dead = false;
    this.getRect = () => ({
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2,
    });
  }

  update() {
    const nx = this.x + this.vx;
    const rectX = {
      x: nx - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2,
    };
    if (
      S.walls.some((w) => aabb(rectX, w)) ||
      nx < this.radius ||
      nx > W - this.radius
    ) {
      if (this.bounces < this.maxBounces) {
        this.vx = -this.vx;
        this.bounces++;
        spawnBounceParticle(this.x, this.y);
      } else {
        this.dead = true;
        if (this.isMissile) createExplosion(this.x, this.y, 82, 50);
        else createParticles(this.x, this.y, "#4a6a7a", 5);
        return;
      }
    } else {
      this.x = nx;
    }

    const ny = this.y + this.vy;
    const rectY = {
      x: this.x - this.radius,
      y: ny - this.radius,
      w: this.radius * 2,
      h: this.radius * 2,
    };
    if (
      S.walls.some((w) => aabb(rectY, w)) ||
      ny < this.radius ||
      ny > H - this.radius
    ) {
      if (this.bounces < this.maxBounces) {
        this.vy = -this.vy;
        this.bounces++;
        spawnBounceParticle(this.x, this.y);
      } else {
        this.dead = true;
        if (this.isMissile) createExplosion(this.x, this.y, 82, 50);
        else createParticles(this.x, this.y, "#4a6a7a", 5);
        return;
      }
    } else {
      this.y = ny;
    }

    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw() {
    const ctx = S.ctx;
    if (this.isPlayer) {
      const pCol = this.isP2 ? "#f1c40f" : "#00d4ff";
      ctx.shadowColor = this.isMissile ? "#f39c12" : pCol;
      ctx.shadowBlur = this.isMissile ? 18 : 12;
    } else {
      ctx.shadowColor = "#e74c3c";
      ctx.shadowBlur = 8;
    }
    ctx.fillStyle = this.isMissile
      ? "#f39c12"
      : this.isPlayer
        ? this.isP2
          ? "#f1c40f"
          : "#00d4ff"
        : "#e74c3c";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (this.isMissile && this.isPlayer)
      createParticles(this.x, this.y, "#f39c12", 1);
  }
}

// ═══════════════════════════════════════════════════
// POWER-UP
// ═══════════════════════════════════════════════════
export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 14;
    this.age = 0;
    this.maxAge = 540;
    this.dead = false;
    this.getRect = () => ({
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2,
    });
  }

  update() {
    this.age++;
    if (this.age >= this.maxAge) this.dead = true;
  }

  draw() {
    const ctx = S.ctx;
    const fade =
      this.age > this.maxAge - 90 ? (this.maxAge - this.age) / 90 : 1;
    const scale = 1 + Math.sin(this.age * 0.12) * 0.11;
    const cols = {
      health: "#2ecc71",
      speed: "#f1c40f",
      shield: "#00d4ff",
    };
    const icons = { health: "♥", speed: "⚡", shield: "◈" };
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.shadowColor = cols[this.type];
    ctx.shadowBlur = 22;
    ctx.fillStyle = cols[this.type];
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icons[this.type], 0, 1);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
