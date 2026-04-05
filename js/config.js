// ═══════════════════════════════════════════════════
// CONSTANTS & LEVEL DATA
// ═══════════════════════════════════════════════════

export const W = 800;
export const H = 600;

export const MAX_CD_MISSILE = 180;
export const MAX_CD_AOE = 300;
export const MAX_CD_SHIELD = 360;
export const SHIELD_DURATION = 200;
export const COMBO_WINDOW = 150;

// Weapon heat system
export const HEAT_MAX = 100;
export const HEAT_PER_SHOT = 12;
export const HEAT_REGEN = 0.6;
export const HEAT_OVERHEAT_LOCKOUT = 120; // frames (~2 sec at 60fps)

export const DEFAULT_BINDINGS = {
  up: "w",
  down: "s",
  left: "a",
  right: "d",
  ability1: "1",
  ability2: "2",
  ability3: "3",
};

export const STAR_LAYERS = [
  { count: 90, speed: 0.015, size: 0.5, brightness: 0.35 },
  { count: 55, speed: 0.04, size: 1.0, brightness: 0.6 },
  { count: 25, speed: 0.09, size: 1.6, brightness: 0.9 },
];

export const LEVEL_DATA = [
  {
    enemies: 3,
    drones: 0,
    snipers: 0,
    heavies: 0,
    cloakDrones: 0,
    spawn: { x: 400, y: 500 },
    walls: [],
  },
  {
    enemies: 4,
    drones: 0,
    snipers: 0,
    heavies: 0,
    cloakDrones: 0,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 200, y: 155, w: 400, h: 28 },
      { x: 200, y: 417, w: 400, h: 28 },
    ],
  },
  {
    enemies: 5,
    drones: 0,
    snipers: 0,
    heavies: 0,
    cloakDrones: 0,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 150, y: 100, w: 28, h: 400 },
      { x: 622, y: 100, w: 28, h: 400 },
      { x: 352, y: 252, w: 96, h: 96 },
    ],
  },
  {
    enemies: 5,
    drones: 0,
    snipers: 1,
    heavies: 0,
    cloakDrones: 0,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 100, y: 100, w: 140, h: 28 },
      { x: 560, y: 100, w: 140, h: 28 },
      { x: 100, y: 472, w: 140, h: 28 },
      { x: 560, y: 472, w: 140, h: 28 },
      { x: 382, y: 200, w: 28, h: 200 },
    ],
  },
  {
    enemies: 3,
    drones: 2,
    snipers: 0,
    heavies: 1,
    cloakDrones: 0,
    spawn: { x: 100, y: 100 },
    walls: [
      { x: 0, y: 300, w: 300, h: 28 },
      { x: 500, y: 300, w: 300, h: 28 },
    ],
  },
  {
    enemies: 3,
    drones: 3,
    snipers: 1,
    heavies: 0,
    cloakDrones: 2,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 200, y: 200, w: 400, h: 28 },
      { x: 382, y: 228, w: 28, h: 172 },
    ],
  },
  {
    enemies: 4,
    drones: 3,
    snipers: 1,
    heavies: 1,
    cloakDrones: 2,
    spawn: { x: 400, y: 300 },
    walls: [
      { x: 200, y: 100, w: 28, h: 400 },
      { x: 572, y: 100, w: 28, h: 400 },
      { x: 228, y: 100, w: 96, h: 28 },
      { x: 476, y: 472, w: 96, h: 28 },
    ],
  },
  {
    enemies: 4,
    drones: 4,
    snipers: 2,
    heavies: 1,
    cloakDrones: 3,
    spawn: { x: 700, y: 500 },
    walls: [
      { x: 100, y: 100, w: 100, h: 100 },
      { x: 350, y: 250, w: 100, h: 100 },
      { x: 600, y: 100, w: 100, h: 100 },
      { x: 100, y: 400, w: 100, h: 100 },
    ],
  },
  {
    enemies: 0,
    drones: 0,
    snipers: 0,
    heavies: 0,
    cloakDrones: 0,
    isBoss: true,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 150, y: 380, w: 100, h: 28 },
      { x: 550, y: 380, w: 100, h: 28 },
    ],
  },
  // ── Act II: Levels 10–18 ──
  {
    enemies: 4,
    drones: 4,
    snipers: 2,
    heavies: 1,
    cloakDrones: 3,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 0, y: 220, w: 200, h: 28 },
      { x: 600, y: 220, w: 200, h: 28 },
      { x: 310, y: 380, w: 180, h: 28 },
    ],
  },
  {
    enemies: 5,
    drones: 3,
    snipers: 2,
    heavies: 2,
    cloakDrones: 2,
    spawn: { x: 100, y: 100 },
    walls: [
      { x: 200, y: 140, w: 28, h: 320 },
      { x: 572, y: 140, w: 28, h: 320 },
      { x: 200, y: 460, w: 400, h: 28 },
    ],
  },
  {
    enemies: 4,
    drones: 5,
    snipers: 2,
    heavies: 1,
    cloakDrones: 4,
    spawn: { x: 700, y: 300 },
    walls: [
      { x: 100, y: 100, w: 200, h: 28 },
      { x: 500, y: 100, w: 200, h: 28 },
      { x: 100, y: 472, w: 200, h: 28 },
      { x: 500, y: 472, w: 200, h: 28 },
      { x: 372, y: 250, w: 56, h: 200 },
    ],
  },
  {
    enemies: 5,
    drones: 4,
    snipers: 3,
    heavies: 2,
    cloakDrones: 3,
    spawn: { x: 400, y: 550 },
    walls: [
      { x: 150, y: 150, w: 28, h: 280 },
      { x: 622, y: 150, w: 28, h: 280 },
      { x: 280, y: 150, w: 240, h: 28 },
    ],
  },
  {
    enemies: 5,
    drones: 5,
    snipers: 2,
    heavies: 2,
    cloakDrones: 4,
    spawn: { x: 50, y: 300 },
    walls: [
      { x: 200, y: 100, w: 400, h: 28 },
      { x: 200, y: 472, w: 400, h: 28 },
      { x: 372, y: 128, w: 28, h: 150 },
      { x: 372, y: 322, w: 28, h: 150 },
    ],
  },
  {
    enemies: 6,
    drones: 4,
    snipers: 3,
    heavies: 2,
    cloakDrones: 3,
    spawn: { x: 400, y: 550 },
    walls: [
      { x: 100, y: 200, w: 120, h: 28 },
      { x: 340, y: 200, w: 120, h: 28 },
      { x: 580, y: 200, w: 120, h: 28 },
      { x: 200, y: 380, w: 120, h: 28 },
      { x: 480, y: 380, w: 120, h: 28 },
    ],
  },
  {
    enemies: 5,
    drones: 6,
    snipers: 3,
    heavies: 2,
    cloakDrones: 4,
    spawn: { x: 700, y: 100 },
    walls: [
      { x: 0, y: 150, w: 250, h: 28 },
      { x: 0, y: 400, w: 250, h: 28 },
      { x: 550, y: 150, w: 250, h: 28 },
      { x: 550, y: 400, w: 250, h: 28 },
      { x: 372, y: 260, w: 28, h: 80 },
    ],
  },
  {
    enemies: 6,
    drones: 5,
    snipers: 4,
    heavies: 2,
    cloakDrones: 4,
    spawn: { x: 400, y: 300 },
    walls: [
      { x: 100, y: 100, w: 28, h: 180 },
      { x: 672, y: 100, w: 28, h: 180 },
      { x: 100, y: 420, w: 28, h: 180 },
      { x: 672, y: 420, w: 28, h: 180 },
      { x: 252, y: 272, w: 296, h: 28 },
    ],
  },
  {
    enemies: 5,
    drones: 6,
    snipers: 4,
    heavies: 3,
    cloakDrones: 5,
    spawn: { x: 50, y: 50 },
    walls: [
      { x: 200, y: 100, w: 28, h: 200 },
      { x: 572, y: 100, w: 28, h: 200 },
      { x: 200, y: 400, w: 28, h: 200 },
      { x: 572, y: 400, w: 28, h: 200 },
      { x: 300, y: 292, w: 200, h: 28 },
    ],
  },
  {
    enemies: 6,
    drones: 6,
    snipers: 4,
    heavies: 3,
    cloakDrones: 5,
    spawn: { x: 400, y: 500 },
    walls: [
      { x: 150, y: 100, w: 180, h: 28 },
      { x: 472, y: 100, w: 180, h: 28 },
      { x: 150, y: 472, w: 180, h: 28 },
      { x: 472, y: 472, w: 180, h: 28 },
      { x: 372, y: 252, w: 28, h: 96 },
    ],
  },
  // ── Final Boss ──
  {
    enemies: 0,
    drones: 0,
    snipers: 0,
    heavies: 0,
    cloakDrones: 0,
    isBoss2: true,
    spawn: { x: 400, y: 520 },
    walls: [
      { x: 100, y: 360, w: 120, h: 28 },
      { x: 580, y: 360, w: 120, h: 28 },
      { x: 300, y: 200, w: 200, h: 28 },
    ],
  },
];

export function makeProceduralLevel(idx) {
  const wave = idx - LEVEL_DATA.length + 1;
  const wCount = 3 + Math.floor(Math.random() * 4);
  const ws = [];
  for (let i = 0; i < wCount; i++) {
    const horiz = Math.random() > 0.5;
    ws.push({
      x: 80 + Math.floor(Math.random() * 580),
      y: 80 + Math.floor(Math.random() * 420),
      w: horiz ? 80 + Math.floor(Math.random() * 220) : 24,
      h: horiz ? 24 : 60 + Math.floor(Math.random() * 160),
    });
  }
  return {
    enemies: 4 + wave * 2,
    drones: 2 + wave,
    snipers: 1 + Math.floor(wave / 2),
    heavies: Math.floor(wave / 2),
    cloakDrones: 1 + Math.floor(wave * 0.7),
    spawn: { x: 400, y: 500 },
    walls: ws,
  };
}

export const STORY_SLIDES = [
  {
    imgSrc: "./story1.png",
    fallback: "/game/story1.png",
    year: "שנת ו'תתק\"ד לספירת הצוללים (3144 לספירה)",
    lines: [
      "האנושות פרצה את גבולות הגלקסיה —",
      "ומצאה שהיא אינה לבד.",
      "",
      "ממרחקי היקום קמה ברית הכוכבים,",
      "ציוויליזציה עתיקה, חמושה ואכזרית.",
      'הם קראו לעצמם: הכט"במים.',
    ],
  },
  {
    imgSrc: "./story2.png",
    fallback: "/game/story2.png",
    year: "17 בתשרי ו'תתק\"ד — מחוץ לכוכב ורדן-9",
    lines: [
      "ספינות צי האדמה זיהו אות לא מוכר.",
      'תוך שניות — פתחו הכט"במים באש.',
      "",
      'ספינת הדגל "ירושלים" התפוצצה בחושך.',
      "מלחמת הכוכבים הראשונה — פרצה.",
    ],
  },
  {
    imgSrc: "./story3.png",
    fallback: "/game/story3.png",
    year: "גדוד הטנקים המשוריינים-7",
    lines: [
      "כוח ההגנה הבין-כוכבי הגיב מיידית.",
      "מאה טנקים רובוטיים,",
      "מונחים מרחוק על-ידי טייסים אנושיים,",
      "נשלחו לחזית הסוערת.",
    ],
  },
  {
    imgSrc: "./story4.png",
    fallback: "/game/story4.png",
    year: "בין ענני האדים",
    lines: [
      'הכט"במים נלחמו בחכמה:',
      "ענני כיסוי, לכידות, ופשיטות פתע.",
      "",
      "בכל קרב — הישרדות של הטוב ביותר.",
      "אתה אחד מהם.",
    ],
  },
  {
    imgSrc: "./story5.webp",
    fallback: "/game/story5.webp",
    year: "הפקודה שלך, מפקד",
    lines: [
      "הבסיס פתוח. הטנק ממתין.",
      'הכט"במים מתקרבים מכל עבר.',
      "",
      "הגלקסיה סופרת עליך.",
      "אל תאכזב אותה.",
    ],
    isLast: true,
  },
];
