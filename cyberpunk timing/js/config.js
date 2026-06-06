const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const FPS = 60;
const SAFE_ZONE_BORDER = 25;
const SAVE_KEY = "cyberpunk-timing-v2";
const MUSIC_FADE_SECONDS = 5;

const COLORS = {
  bg: [10, 10, 18],
  grid: [25, 20, 45],
  text: [0, 255, 200],
  gray: [60, 60, 75],
  blue: [0, 180, 255],
  blueGlow: [0, 100, 255],
  red: [255, 0, 100],
  redGlow: [180, 0, 50],
  orange: [255, 140, 0],
  orangeGlow: [200, 80, 0],
  green: [50, 255, 100],
  gold: [255, 210, 60],
  purple: [180, 80, 255],
};

const LEVELS = [
  { id: 1, name: "NEON START", bpm: 80, hitWindowMs: 2600, bombFuse: 5, duration: 30, sliders: false, allowRed: false, allowOrange: false, sliderRed: false, passScore: 12, clearXp: 75, musicId: "track1", tutorial: null, featureHint: "Blue balls only" },
  { id: 2, name: "PULSE DRIVE", bpm: 100, hitWindowMs: 2100, bombFuse: 4, duration: 30, sliders: false, allowRed: true, allowOrange: false, sliderRed: false, passScore: 22, clearXp: 110, musicId: "track2", tutorial: "red", featureHint: "Blue + red bombs" },
  { id: 3, name: "HYPER LOOP", bpm: 120, hitWindowMs: 1700, bombFuse: 3.5, duration: 30, sliders: false, allowRed: true, allowOrange: true, sliderRed: false, passScore: 35, clearXp: 150, musicId: "track3", tutorial: "orange", featureHint: "Blue + red + orange" },
  { id: 4, name: "CHAOS CORE", bpm: 140, hitWindowMs: 1300, bombFuse: 3, duration: 30, sliders: true, allowRed: false, allowOrange: false, sliderRed: false, passScore: 48, clearXp: 200, musicId: "track4", tutorial: "sliders", featureHint: "Sliding blue targets" },
  { id: 5, name: "FINAL SYNC", bpm: 165, hitWindowMs: 950, bombFuse: 2.5, duration: 30, sliders: true, allowRed: true, allowOrange: true, sliderRed: true, passScore: 60, clearXp: 260, musicId: "track5", tutorial: "redSliders", featureHint: "All targets + red sliders" },
];

const TUTORIALS = {
  red: {
    title: "NEW: RED BOMBS",
    lines: [
      "Red targets are BOMBS!",
      "RIGHT CLICK to defuse them.",
      "Never left-click a live bomb!",
    ],
  },
  orange: {
    title: "NEW: ORANGE BOMBS",
    lines: [
      "Orange bombs are rare.",
      "RIGHT CLICK to defuse first.",
      "Then LEFT CLICK to confirm!",
    ],
  },
  sliders: {
    title: "NEW: SLIDING TARGETS",
    lines: [
      "Targets now SLIDE across!",
      "Hit blue balls at the gold line.",
      "This stage: sliding blues only.",
    ],
  },
  redSliders: {
    title: "NEW: RED SLIDERS",
    lines: [
      "Sliders can be RED now!",
      "RIGHT CLICK moving red bombs.",
      "Keep your combo alive!",
    ],
  },
};

const MUSIC_MENU = "music/menu";
const MUSIC_LEVEL = (level) => `music/${level.musicSourceId || level.id}`;
const MENU_MUSIC_FALLBACK = "background music.mp3";

const FAIL_MESSAGES = [
  "YOU ARE A FAILURE",
  "WASTED",
  "WHY?",
  "TRY AGAIN",
  "NOT EVEN CLOSE",
];

const LEADERBOARD_ENCRYPTION_KEY = "";

const MOUSE_SKINS = [
  { id: "default", name: "CROSSHAIR", price: 0, color: [0, 255, 200], style: "cross" },
  { id: "neon", name: "NEON RING", price: 120, color: [0, 180, 255], style: "ring" },
  { id: "laser", name: "LASER DOT", price: 200, color: [255, 0, 100], style: "dot" },
  { id: "pixel", name: "PIXEL ARC", price: 350, color: [50, 255, 100], style: "pixel" },
  { id: "gold", name: "GOLD STAR", price: 500, color: [255, 210, 60], style: "star" },
];

const BACKGROUNDS = [
  { id: "cyber", name: "CYBER GRID", price: 0, bg: [10, 10, 18], grid: [25, 20, 45], accent: [0, 255, 200] },
  { id: "matrix", name: "MATRIX", price: 150, bg: [4, 12, 6], grid: [10, 40, 15], accent: [50, 255, 100] },
  { id: "sunset", name: "SUNSET", price: 250, bg: [28, 8, 32], grid: [80, 30, 60], accent: [255, 120, 40] },
  { id: "space", name: "DEEP SPACE", price: 400, bg: [5, 5, 20], grid: [30, 30, 80], accent: [120, 140, 255] },
  { id: "retro", name: "RETRO WAVE", price: 600, bg: [15, 5, 35], grid: [100, 20, 120], accent: [255, 0, 180] },
];

const XP_PER_SCORE = 2;
const COINS_PER_SCORE = 1;
const REWARDED_AD_COINS = 75;
const REWARDED_AD_XP = 40;

const ORANGE_BOMB_CHANCE = 0.03;
const RED_BOMB_CHANCE = 0.10;
const SLIDER_SPAWN_CHANCE = 0.35;

const HOW_TO_LINES = [
  "HOW TO PLAY",
  "",
  "LEFT CLICK  — hit blue balls",
  "RIGHT CLICK — defuse red bombs",
  "ORANGE bombs (rare): defuse, then click!",
  "Targets appear on the BEAT — hit fast!",
  "Stages unlock features one at a time",
  "Level 4+ adds SLIDING targets",
  "Build COMBO for bigger score & XP",
  "Beat the GOAL score before time runs out (30s)",
  "INFINITE mode — survive as long as you can!",
  "Earn COINS — buy skins & backgrounds",
];

function createInfiniteLevel(sourceLevel) {
  return {
    ...sourceLevel,
    infinite: true,
    musicSourceId: sourceLevel.id,
    name: `INFINITE — ${sourceLevel.name}`,
    duration: 0,
    passScore: 0,
    clearXp: 0,
    allowRed: true,
    allowOrange: true,
    sliders: false,
    sliderRed: false,
    tutorial: null,
  };
}

function shouldSpawnSlider(level) {
  return level.sliders && Math.random() < SLIDER_SPAWN_CHANCE;
}

function musicLevelId(level) {
  return level.musicSourceId || level.id;
}

function isLevelUnlocked(save, level) {
  if (level.id === 1) return true;
  return save.clearedLevels.includes(level.id - 1);
}

function isLevelCleared(save, levelId) {
  return save.clearedLevels.includes(levelId);
}

function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function playerLevelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level)) level += 1;
  return level - 1;
}

function xpProgress(xp) {
  const lvl = playerLevelFromXp(xp);
  const current = xpForLevel(lvl);
  const next = xpForLevel(lvl + 1);
  return { level: lvl, current, next, ratio: (xp - current) / (next - current) };
}

function getLevelById(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}

function getSkinById(id) {
  return MOUSE_SKINS.find((s) => s.id === id) || MOUSE_SKINS[0];
}

function getBackgroundById(id) {
  return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
}

function getTutorial(key) {
  return TUTORIALS[key] || null;
}
