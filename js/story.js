// ═══════════════════════════════════════════════════
// STORY SCREEN
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { W, H, STORY_SLIDES } from "./config.js";
import { storyRoundRect } from "./utils.js";

export function initStory() {
  S.storyImgLoaded = new Array(STORY_SLIDES.length).fill(false);
  S.storyImages = STORY_SLIDES.map((s, idx) => {
    const img = new Image();
    img.onload = () => {
      S.storyImgLoaded[idx] = true;
    };
    img.onerror = () => {
      if (
        img.src.indexOf("data:") === -1 &&
        img.getAttribute("data-tried-fallback") !== "1"
      ) {
        img.setAttribute("data-tried-fallback", "1");
        img.src = s.fallback;
      }
    };
    img.src = s.imgSrc;
    return img;
  });
}

export function advanceStory() {
  if (S.storySlideIdx < STORY_SLIDES.length - 1) {
    S.storySlideIdx++;
    S.storyFade = 0;
  } else {
    S.gameState = "START";
    S.storySlideIdx = 0;
    S.storyFade = 0;
    document.getElementById("start-screen").style.display = "block";
  }
}

export function drawStoryScreen() {
  const ctx = S.ctx;
  const slide = STORY_SLIDES[S.storySlideIdx];
  const img = S.storyImages[S.storySlideIdx];

  ctx.fillStyle = "#080408";
  ctx.fillRect(0, 0, W, H);

  if (
    img &&
    img.naturalWidth > 0 &&
    (S.storyImgLoaded[S.storySlideIdx] || img.complete)
  ) {
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const iw = img.naturalWidth * scale,
      ih = img.naturalHeight * scale;
    ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
  } else {
    const fbg = ctx.createLinearGradient(0, 0, W, H);
    fbg.addColorStop(0, "#050812");
    fbg.addColorStop(0.4, "#0a1625");
    fbg.addColorStop(1, "#120820");
    ctx.fillStyle = fbg;
    ctx.fillRect(0, 0, W, H);
  }

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "rgba(4,2,8,0.10)");
  grad.addColorStop(0.4, "rgba(4,2,8,0.05)");
  grad.addColorStop(0.68, "rgba(2,1,6,0.48)");
  grad.addColorStop(1, "rgba(1,0,4,0.90)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(0,0,0,0.035)";
  for (let sy = 0; sy < H; sy += 3) ctx.fillRect(0, sy, W, 1);

  const PANEL_X = 80,
    PANEL_Y = 290;
  const PANEL_W = 640,
    PANEL_H = 270;
  const YEAR_Y = 316;
  const SEP_Y = 330;
  const TEXT_Y0 = 350;
  const LINE_H = 23;
  const BTN_Y = 482,
    BTN_H = 40;
  const DOT_Y = 547;

  ctx.save();
  ctx.globalAlpha = S.storyFade;

  ctx.fillStyle = "rgba(2,4,10,0.62)";
  storyRoundRect(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,180,160,0.22)";
  ctx.lineWidth = 1;
  storyRoundRect(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 10);
  ctx.stroke();

  ctx.font = 'bold 12px "Segoe UI", Tahoma, sans-serif';
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,175,45,0.90)";
  ctx.shadowColor = "rgba(255,140,0,0.55)";
  ctx.shadowBlur = 8;
  ctx.fillText(slide.year, W / 2, YEAR_Y);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(0,200,180,0.40)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150, SEP_Y);
  ctx.lineTo(W / 2 + 150, SEP_Y);
  ctx.stroke();

  let ty = TEXT_Y0;
  slide.lines.forEach((line) => {
    if (line === "") {
      ty += LINE_H * 0.5;
      return;
    }
    ctx.font = '15px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(215,228,242,0.93)";
    ctx.shadowColor = "rgba(0,0,0,0.95)";
    ctx.shadowBlur = 5;
    ctx.fillText(line, W / 2, ty);
    ctx.shadowBlur = 0;
    ty += LINE_H;
  });

  STORY_SLIDES.forEach((_, i) => {
    ctx.beginPath();
    ctx.arc(
      W / 2 + (i - 2) * 18,
      DOT_Y,
      i === S.storySlideIdx ? 5 : 3,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle =
      i === S.storySlideIdx ? "#00d4ff" : "rgba(255,255,255,0.28)";
    ctx.fill();
  });

  const btnLabel = slide.isLast ? "✦  צא לקרב!  ✦" : "המשך ←";
  const btnW = slide.isLast ? 200 : 140;
  const btnX = W / 2 - btnW / 2;

  if (S.storyBtnHover) {
    ctx.shadowColor = slide.isLast
      ? "rgba(255,200,40,0.65)"
      : "rgba(0,212,255,0.65)";
    ctx.shadowBlur = 20;
  }
  ctx.fillStyle = slide.isLast
    ? S.storyBtnHover
      ? "rgba(195,125,8,0.94)"
      : "rgba(130,75,4,0.88)"
    : S.storyBtnHover
      ? "rgba(8,58,110,0.96)"
      : "rgba(5,28,58,0.90)";
  storyRoundRect(ctx, btnX, BTN_Y, btnW, BTN_H, 8);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = slide.isLast
    ? "rgba(255,175,40,0.65)"
    : "rgba(0,200,180,0.55)";
  ctx.lineWidth = 1.5;
  storyRoundRect(ctx, btnX, BTN_Y, btnW, BTN_H, 8);
  ctx.stroke();

  ctx.font = `bold ${slide.isLast ? 15 : 14}px "Segoe UI", Tahoma, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = slide.isLast ? "#ffe070" : "#00d4ff";
  ctx.shadowColor = slide.isLast
    ? "rgba(255,200,0,0.5)"
    : "rgba(0,212,255,0.45)";
  ctx.shadowBlur = 7;
  ctx.fillText(btnLabel, W / 2, BTN_Y + 26);
  ctx.shadowBlur = 0;

  ctx.font = '10px "Segoe UI", Tahoma, sans-serif';
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillText("Space / Enter להדלגה", W / 2, H - 8);

  ctx.restore();
}
