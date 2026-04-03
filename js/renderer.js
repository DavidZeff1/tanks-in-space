// ═══════════════════════════════════════════════════
// VISUAL RENDERING HELPERS (Stars, Ground, Vignette)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, H, STAR_LAYERS } from "./config.js";
import { aabb } from "./utils.js";

// ── Stars (start-screen background) ──

export function initStars() {
  S.stars = [];
  STAR_LAYERS.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      S.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        layer: li,
        tw: Math.random() * Math.PI * 2,
      });
    }
  });
}

export function drawStars() {
  const ctx = S.ctx;
  S.stars.forEach((s) => {
    const layer = STAR_LAYERS[s.layer];
    const alpha =
      layer.brightness + Math.sin(S.frameCount * 0.025 + s.tw) * 0.18;
    ctx.fillStyle = `rgba(200,220,255,${Math.max(0, Math.min(1, alpha))})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, layer.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ── Ground / Rocks (gameplay background) ──

export function initGroundRocks() {
  S.groundRocks = [];
  const rockCols = [
    "#3A2A1A",
    "#4A3828",
    "#2E2010",
    "#5A4838",
    "#3E2E18",
    "#6A5240",
    "#2A1E10",
  ];
  for (let i = 0; i < 55; i++) {
    const sides = 5 + Math.floor(Math.random() * 4);
    const baseR = 2 + Math.random() * 9;
    const verts = [];
    for (let j = 0; j < sides; j++) {
      const a = (j / sides) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
      const r = baseR * (0.6 + Math.random() * 0.6);
      verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    S.groundRocks.push({
      x: 10 + Math.random() * (W - 20),
      y: 10 + Math.random() * (H - 20),
      verts,
      color: rockCols[Math.floor(Math.random() * rockCols.length)],
      shadowAlpha: 0.3 + Math.random() * 0.3,
    });
  }
}

export function drawGround() {
  const ctx = S.ctx;
  ctx.fillStyle = "#4A3828";
  ctx.fillRect(-8, -8, W + 16, H + 16);

  [
    { x: 100, y: 110, rx: 210, ry: 140, a: 0.25 },
    { x: 580, y: 90, rx: 190, ry: 120, a: 0.2 },
    { x: 220, y: 390, rx: 230, ry: 140, a: 0.22 },
    { x: 650, y: 430, rx: 170, ry: 150, a: 0.18 },
    { x: 400, y: 290, rx: 260, ry: 185, a: 0.15 },
    { x: 720, y: 250, rx: 100, ry: 130, a: 0.2 },
    { x: 60, y: 440, rx: 130, ry: 100, a: 0.18 },
  ].forEach((p) => {
    ctx.fillStyle = `rgba(35,22,10,${p.a})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  S.groundRocks.forEach((rock) => {
    if (
      S.walls.some(
        (w) =>
          rock.x > w.x &&
          rock.x < w.x + w.w &&
          rock.y > w.y &&
          rock.y < w.y + w.h,
      )
    )
      return;
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${rock.shadowAlpha})`;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1.5;
    ctx.shadowOffsetY = 2.5;
    ctx.fillStyle = rock.color;
    ctx.beginPath();
    rock.verts.forEach(([vx, vy], j) => {
      j === 0
        ? ctx.moveTo(rock.x + vx, rock.y + vy)
        : ctx.lineTo(rock.x + vx, rock.y + vy);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

// ── Vignette (low-HP warning overlay) ──

export function drawVignette() {
  const { vigCtx } = S;
  if (!S.player || S.gameState === "START" || S.gameState === "STORY") return;
  let pct = S.player.hp / 100;
  if (S.twoPlayerMode && S.player2 && S.player2.hp > 0 && S.player.hp <= 0)
    pct = S.player2.hp / 100;
  else if (S.twoPlayerMode && S.player2 && S.player2.hp > 0)
    pct = Math.min(pct, S.player2.hp / 100);
  if (pct > 0.45) {
    vigCtx.clearRect(0, 0, W, H);
    return;
  }
  const intensity = (0.45 - pct) / 0.45;
  const pulse = 0.65 + Math.sin(S.frameCount * 0.1) * 0.35;
  vigCtx.clearRect(0, 0, W, H);
  const g = vigCtx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 460);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(180,0,0,${intensity * 0.65 * pulse})`);
  vigCtx.fillStyle = g;
  vigCtx.fillRect(0, 0, W, H);
}

// ── Offscreen enemy indicators ──

export function drawOffscreenIndicators() {
  const ctx = S.ctx;
  const ref =
    S.player && S.player.hp > 0
      ? S.player
      : S.twoPlayerMode && S.player2 && S.player2.hp > 0
        ? S.player2
        : S.player;
  if (!ref) return;
  const M = 22;
  const threats = [...S.enemies, ...S.drones, ...(S.boss ? [S.boss] : [])];
  threats.forEach((en) => {
    if (en.x > M && en.x < W - M && en.y > M && en.y < H - M) return;
    const cx = Math.max(M, Math.min(W - M, en.x));
    const cy = Math.max(M, Math.min(H - M, en.y));
    const angle = Math.atan2(en.y - ref.y, en.x - ref.x);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(231,76,60,0.85)";
    ctx.shadowColor = "#e74c3c";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, 5);
    ctx.lineTo(-6, -5);
    ctx.fill();
    ctx.restore();
  });
}
