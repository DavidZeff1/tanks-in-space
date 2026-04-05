// ═══════════════════════════════════════════════════
// SHARED MUTABLE STATE
// ═══════════════════════════════════════════════════

const S = {
  // DOM refs (set by main.js)
  canvas: null,
  ctx: null,
  vigCvs: null,
  vigCtx: null,

  // Background image
  bgImage: null,

  // Story
  storyImages: [],
  storyImgLoaded: [],
  storySlideIdx: 0,
  storyFade: 0,
  storyBtnHover: false,

  // Core game state
  gameState: "STORY",
  infiniteMode: false,

  // Entities
  player: null,
  player2: null,
  enemies: [],
  drones: [],
  bullets: [],
  walls: [],
  particles: [],
  powerUps: [],
  boss: null,

  // Input
  keys: {},
  mouse: { x: 400, y: 300, isDown: false },

  // Timing
  frameCount: 0,

  // P1 Cooldowns
  cdMissile: 0,
  cdAoe: 0,
  cdShield: 0,
  shieldActive: false,
  shieldTimer: 0,
  speedBoostTimer: 0,

  // P1 Weapon heat
  weaponHeat: 0,
  weaponOverheated: false,
  weaponOverheatTimer: 0,

  // Score
  score: 0,
  combo: 0,
  comboTimer: 0,

  // Screen shake
  shakeMag: 0,
  shakeX: 0,
  shakeY: 0,

  // Settings
  ricochetEnabled: true,

  // Two-player
  twoPlayerMode: false,
  p2CdMissile: 0,
  p2CdAoe: 0,
  p2CdShield: 0,
  p2ShieldActive: false,
  p2ShieldTimer: 0,
  p2SpeedBoostTimer: 0,

  // P2 Weapon heat
  p2WeaponHeat: 0,
  p2WeaponOverheated: false,
  p2WeaponOverheatTimer: 0,

  // Music
  bgMusic: null,

  // Bindings
  bindings: null,
  bindingTarget: null,
  bindingReturnScreen: "start-screen",

  // Level
  currentLevelIdx: 0,

  // Leaderboard
  lbReturnScreen: "start-screen",

  // Visual
  stars: [],
  groundRocks: [],
};

export default S;
