// ═══════════════════════════════════════════════════
// UI (Key Bindings, Leaderboard, Settings)
// ═══════════════════════════════════════════════════

import S from "./state.js";
import { DEFAULT_BINDINGS } from "./config.js";
import { applyMusic } from "./audio.js";

// ═══════════════════════════════════════════════════
// KEY BINDINGS
// ═══════════════════════════════════════════════════

export function loadBindings() {
  try {
    const s = localStorage.getItem("tis2_bindings");
    if (s) S.bindings = { ...DEFAULT_BINDINGS, ...JSON.parse(s) };
  } catch (_) {}
}

export function saveBindings() {
  localStorage.setItem("tis2_bindings", JSON.stringify(S.bindings));
}

export function keyLabel(k) {
  const map = {
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    escape: "ESC",
    " ": "SPC",
    shift: "SHF",
    control: "CTL",
    alt: "ALT",
    enter: "↵",
    backspace: "⌫",
    tab: "TAB",
  };
  return map[k] || k.toUpperCase();
}

export function refreshBindingUI() {
  ["up", "down", "left", "right", "ability1", "ability2", "ability3"].forEach(
    (a) => {
      const btn = document.getElementById("btn-" + a);
      if (btn) btn.textContent = keyLabel(S.bindings[a]);
    },
  );
  document.getElementById("key-ab1").textContent = keyLabel(
    S.bindings.ability1,
  );
  document.getElementById("key-ab2").textContent = keyLabel(
    S.bindings.ability2,
  );
  document.getElementById("key-ab3").textContent = keyLabel(
    S.bindings.ability3,
  );
  document.getElementById("lbl-up").textContent = keyLabel(S.bindings.up);
  document.getElementById("lbl-down").textContent = keyLabel(S.bindings.down);
  document.getElementById("lbl-left").textContent = keyLabel(S.bindings.left);
  document.getElementById("lbl-right").textContent = keyLabel(S.bindings.right);
  document.getElementById("lbl-ab1").textContent = keyLabel(
    S.bindings.ability1,
  );
  document.getElementById("lbl-ab2").textContent = keyLabel(
    S.bindings.ability2,
  );
  document.getElementById("lbl-ab3").textContent = keyLabel(
    S.bindings.ability3,
  );
}

export function startBind(action) {
  if (S.bindingTarget) {
    document
      .getElementById("btn-" + S.bindingTarget)
      .classList.remove("listening");
    document.getElementById("btn-" + S.bindingTarget).textContent = keyLabel(
      S.bindings[S.bindingTarget],
    );
  }
  S.bindingTarget = action;
  const btn = document.getElementById("btn-" + action);
  btn.textContent = "...";
  btn.classList.add("listening");
}

export function resetBindings() {
  S.bindings = { ...DEFAULT_BINDINGS };
  saveBindings();
  refreshBindingUI();
}

export function openBindings(returnScreen) {
  S.bindingReturnScreen = returnScreen;
  document.getElementById(returnScreen).style.display = "none";
  refreshBindingUI();
  document.getElementById("bindings-panel").style.display = "block";
}

export function closeBindings() {
  if (S.bindingTarget) {
    document
      .getElementById("btn-" + S.bindingTarget)
      .classList.remove("listening");
    document.getElementById("btn-" + S.bindingTarget).textContent = keyLabel(
      S.bindings[S.bindingTarget],
    );
    S.bindingTarget = null;
  }
  document.getElementById("bindings-panel").style.display = "none";
  document.getElementById(S.bindingReturnScreen).style.display = "block";
}

// ═══════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════

function getLocalLB() {
  try {
    return JSON.parse(localStorage.getItem("tis2_scores") || "[]");
  } catch (_) {
    return [];
  }
}

function saveLocalLB(lb) {
  localStorage.setItem("tis2_scores", JSON.stringify(lb.slice(0, 10)));
}

async function fetchRemoteLB() {
  const res = await fetch("/api/scores");
  if (!res.ok) throw new Error("API error");
  return await res.json();
}

export async function getLB() {
  try {
    const scores = await fetchRemoteLB();
    saveLocalLB(scores);
    return scores;
  } catch (_) {
    return getLocalLB();
  }
}

export async function saveLB(name, sc) {
  // Save locally immediately
  let lb = getLocalLB();
  lb.push({
    name,
    score: sc,
    date: new Date().toLocaleDateString("he-IL"),
  });
  lb.sort((a, b) => b.score - a.score);
  saveLocalLB(lb);

  // Save remotely
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score: sc }),
    });
    if (res.ok) {
      const scores = await res.json();
      saveLocalLB(scores);
    }
  } catch (_) {
    // Remote save failed — local copy is still saved
  }
}

function renderLBData(lb) {
  const ul = document.getElementById("lb-list");
  ul.innerHTML = lb.length
    ? lb
        .map(
          (e, i) =>
            `<li><span>${i + 1}. ${e.name}</span><span>${e.score.toLocaleString()}</span></li>`,
        )
        .join("")
    : '<li style="justify-content:center;color:#7aaac8;">אין עדיין שיאים</li>';
}

export async function renderLB() {
  renderLBData(getLocalLB());
  try {
    const scores = await fetchRemoteLB();
    saveLocalLB(scores);
    renderLBData(scores);
  } catch (_) {}
}

export function openLeaderboard(returnScreen) {
  S.lbReturnScreen = returnScreen;
  document.getElementById(returnScreen).style.display = "none";
  renderLB();
  document.getElementById("lb-panel").style.display = "block";
}

export function closeLeaderboard() {
  document.getElementById("lb-panel").style.display = "none";
  document.getElementById(S.lbReturnScreen).style.display = "block";
}

// ═══════════════════════════════════════════════════
// CREDITS
// ═══════════════════════════════════════════════════

export function openCredits(returnScreen) {
  S.creditsReturnScreen = returnScreen;
  document.getElementById(returnScreen).style.display = "none";
  document.getElementById("credits-panel").style.display = "block";
}

export function closeCredits() {
  document.getElementById("credits-panel").style.display = "none";
  document.getElementById(S.creditsReturnScreen).style.display = "block";
}

// ═══════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════

export function initSettings() {
  const savedMusic = localStorage.getItem("tis2_music") || "rhythmic";
  const radioEl = document.getElementById("music-" + savedMusic);
  if (radioEl) radioEl.checked = true;

  const savedRico = localStorage.getItem("tis2_ricochet");
  S.ricochetEnabled = savedRico === null ? true : savedRico === "1";
  const ricoEl = document.getElementById("ricochet-check");
  if (ricoEl) ricoEl.checked = S.ricochetEnabled;

  document.querySelectorAll('input[name="music-pref"]').forEach((r) => {
    r.addEventListener("change", () => applyMusic(r.value));
  });

  const ricoCheck = document.getElementById("ricochet-check");
  if (ricoCheck) {
    ricoCheck.addEventListener("change", () => {
      S.ricochetEnabled = ricoCheck.checked;
      localStorage.setItem("tis2_ricochet", S.ricochetEnabled ? "1" : "0");
    });
  }

  document.getElementById("start-screen").addEventListener(
    "click",
    () => {
      const sel = document.querySelector('input[name="music-pref"]:checked');
      if (sel && sel.value !== "mute") applyMusic(sel.value);
    },
    { once: true },
  );

  const tpCheck = document.getElementById("two-player-check");
  if (tpCheck) {
    tpCheck.addEventListener("change", () => {
      document.getElementById("p2-name-row").style.display = tpCheck.checked
        ? "block"
        : "none";
      document.getElementById("p2-controls-hint").style.display =
        tpCheck.checked ? "inline" : "none";
    });
  }
}

// ═══════════════════════════════════════════════════
// GENERAL UI
// ═══════════════════════════════════════════════════

export function hideAllUI() {
  document
    .querySelectorAll(".overlay")
    .forEach((el) => (el.style.display = "none"));
}

// Expose onclick handlers to global scope (for inline HTML handlers)
window.openBindings = openBindings;
window.closeBindings = closeBindings;
window.startBind = startBind;
window.resetBindings = resetBindings;
window.openLeaderboard = openLeaderboard;
window.closeLeaderboard = closeLeaderboard;
window.openCredits = openCredits;
window.closeCredits = closeCredits;
