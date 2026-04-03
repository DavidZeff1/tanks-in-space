// ═══════════════════════════════════════════════════
// MUSIC / AUDIO
// ═══════════════════════════════════════════════════

import S from "./state.js";

const MUSIC_SRCS = {
  rhythmic: "./music-rhythmic.mp3",
  calm: "./music-calm.mp3",
};

const MUSIC_SRCS_FALLBACK = {
  rhythmic: "http://localhost:8765/api/music?track=rhythmic",
  calm: "http://localhost:8765/api/music?track=calm",
};

export function initAudio() {
  S.bgMusic = new Audio();
  S.bgMusic.loop = true;
  S.bgMusic.volume = 0.55;
}

export function applyMusic(pref) {
  localStorage.setItem("tis2_music", pref);
  if (pref === "mute") {
    S.bgMusic.pause();
    return;
  }
  const src = MUSIC_SRCS[pref];
  if (S.bgMusic.getAttribute("data-track") !== pref) {
    S.bgMusic.setAttribute("data-track", pref);
    S.bgMusic.src = src;
    S.bgMusic.onerror = () => {
      S.bgMusic.onerror = null;
      S.bgMusic.src = MUSIC_SRCS_FALLBACK[pref];
      S.bgMusic.load();
      S.bgMusic.play().catch(() => {});
    };
    S.bgMusic.load();
  }
  S.bgMusic.play().catch(() => {});
}
