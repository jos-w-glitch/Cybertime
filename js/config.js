const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 720;
const MOBILE_WIDTH = 720;
const MOBILE_HEIGHT = 1280;

function viewW() {
  return Input?.touchMode ? MOBILE_WIDTH : DESKTOP_WIDTH;
}

function viewH() {
  return Input?.touchMode ? MOBILE_HEIGHT : DESKTOP_HEIGHT;
}

function mobileUiScale() {
  return Input?.touchMode ? 1.45 : 1;
}

function uiFont(size) {
  return gameFont(Math.round(size * mobileUiScale()));
}

function btnHeight(size = 52) {
  return Math.round(size * mobileUiScale());
}

function iconButtonSize() {
  return Math.round(ICON_BUTTON_SIZE * mobileUiScale());
}

const FPS = 60;
const SAFE_ZONE_BORDER = 25;
const SAVE_KEY = "cybertime";
const SAVES_KEY = "cybertime-saves";
const LEADERBOARDS_KEY = "cybertime-leaderboards";
const PLAYERS_KEY = "cybertime-players";
const ACTIVE_PLAYER_KEY = "cybertime-active-player";
const MIGRATION_KEY = "cybertime-migrated-v2";
const LEADERBOARDS_MIGRATION_KEY = "cybertime-leaderboards-migrated";
const GUEST_SAVE_KEY = "cybertime-guest-session";
const MAX_SAVED_PLAYERS = 12;
const LEADERBOARD_SIZE = 10;
const LEADERBOARD_FIRST_PRIZE = 500;
const GAME_NAME = "cybertime";
const GAME_FONT = "Cyberjunkies";
const FONT_PATH = "assets/fonts/Cyberjunkies.ttf";

function gameFont(size) {
  return `${size}px '${GAME_FONT}', sans-serif`;
}

async function loadGameFont() {
  if (!document.fonts) return;
  await document.fonts.load(gameFont(48));
}

const LOGO_PATH = "assets/logo.png";
const HOME_ICON_PATH = "assets/1.png";

const INFINITE_MECHANIC_PRESETS = [
  { name: "BLUE ONLY", red: false, orange: false, sliders: false, sliderRed: false },
  { name: "RED BOMBS", red: true, orange: false, sliders: false, sliderRed: false },
  { name: "ORANGE BOMBS", red: true, orange: true, sliders: false, sliderRed: false },
  { name: "SLIDERS", red: false, orange: false, sliders: true, sliderRed: false },
  { name: "RED SLIDERS", red: false, orange: false, sliders: true, sliderRed: true },
  { name: "FULL MIX", red: true, orange: true, sliders: true, sliderRed: true },
];
const ICON_BUTTON_SIZE = 56;
const ICON_BUTTON_RADIUS = 14;
const MUSIC_FADE_SECONDS = 5;
const STAGE_TIME_SECONDS = 30;

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
  { id: 1, name: "NEON START", bpm: 72, hitWindowMs: 2800, bombFuse: 5, duration: 30, sliders: false, allowRed: false, allowOrange: false, sliderRed: false, redChance: 0, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 10, clearXp: 60, musicId: "track1", tutorial: null, featureHint: "Blue balls only — learn the beat" },
  { id: 2, name: "WARM PULSE", bpm: 84, hitWindowMs: 2500, bombFuse: 4.5, duration: 30, sliders: false, allowRed: false, allowOrange: false, sliderRed: false, redChance: 0, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 14, clearXp: 80, musicId: "track2", tutorial: null, featureHint: "Blue balls only — faster timing" },
  { id: 3, name: "RED ALERT", bpm: 96, hitWindowMs: 2200, bombFuse: 4, duration: 30, sliders: false, allowRed: true, allowOrange: false, sliderRed: false, redChance: 0.25, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 18, clearXp: 95, musicId: "track3", tutorial: "red", featureHint: "~25% red bombs — learn defuse" },
  { id: 4, name: "PULSE DRIVE", bpm: 104, hitWindowMs: 2000, bombFuse: 3.8, duration: 30, sliders: false, allowRed: true, allowOrange: false, sliderRed: false, redChance: 0.38, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 22, clearXp: 110, musicId: "track4", tutorial: null, featureHint: "~38% red bombs — more pressure" },
  { id: 5, name: "ORANGE GLINT", bpm: 112, hitWindowMs: 1850, bombFuse: 3.5, duration: 30, sliders: false, allowRed: true, allowOrange: true, sliderRed: false, redChance: 0.12, orangeChance: 0.25, sliderChance: 0, sliderRedChance: 0, passScore: 26, clearXp: 125, musicId: "track5", tutorial: "orange", featureHint: "~25% orange — defuse then confirm" },
  { id: 6, name: "HYPER LOOP", bpm: 122, hitWindowMs: 1700, bombFuse: 3.2, duration: 30, sliders: false, allowRed: true, allowOrange: true, sliderRed: false, redChance: 0.15, orangeChance: 0.35, sliderChance: 0, sliderRedChance: 0, passScore: 32, clearXp: 140, musicId: "track6", tutorial: null, featureHint: "~35% orange — mixed bombs" },
  { id: 7, name: "SLIDE INTRO", bpm: 132, hitWindowMs: 1500, bombFuse: 3, duration: 30, sliders: true, allowRed: false, allowOrange: false, sliderRed: false, redChance: 0, orangeChance: 0, sliderChance: 0.4, sliderRedChance: 0, passScore: 38, clearXp: 165, musicId: "track7", tutorial: "sliders", featureHint: "~40% sliding blues" },
  { id: 8, name: "CHAOS CORE", bpm: 142, hitWindowMs: 1350, bombFuse: 2.8, duration: 30, sliders: true, allowRed: false, allowOrange: false, sliderRed: false, redChance: 0, orangeChance: 0, sliderChance: 0.55, sliderRedChance: 0, passScore: 44, clearXp: 185, musicId: "track8", tutorial: null, featureHint: "~55% sliding blues — faster slides" },
  { id: 9, name: "RED SLIDE", bpm: 152, hitWindowMs: 1200, bombFuse: 2.6, duration: 30, sliders: true, allowRed: false, allowOrange: false, sliderRed: true, redChance: 0, orangeChance: 0, sliderChance: 0.48, sliderRedChance: 0.3, passScore: 50, clearXp: 210, musicId: "track9", tutorial: "redSliders", featureHint: "~30% red sliders — defuse on the move" },
  { id: 10, name: "SLIDE BOMB", bpm: 160, hitWindowMs: 1100, bombFuse: 2.4, duration: 30, sliders: true, allowRed: false, allowOrange: false, sliderRed: true, redChance: 0, orangeChance: 0, sliderChance: 0.52, sliderRedChance: 0.42, passScore: 55, clearXp: 230, musicId: "track10", tutorial: null, featureHint: "~42% red sliders — harder mix" },
  { id: 11, name: "MIX MASTER", bpm: 162, hitWindowMs: 1000, bombFuse: 2.3, duration: 30, sliders: true, allowRed: true, allowOrange: true, sliderRed: true, redChance: 0.12, orangeChance: 0.1, sliderChance: 0.45, sliderRedChance: 0.25, passScore: 60, clearXp: 250, musicId: "track11", tutorial: null, featureHint: "All mechanics — moderate mix" },
  { id: 12, name: "FINAL SYNC", bpm: 168, hitWindowMs: 900, bombFuse: 2.2, duration: 30, sliders: true, allowRed: true, allowOrange: true, sliderRed: true, redChance: 0.14, orangeChance: 0.12, sliderChance: 0.55, sliderRedChance: 0.44, passScore: 68, clearXp: 280, musicId: "track12", tutorial: null, featureHint: "Everything combined — final test" },
];

const TUTORIALS = {
  red: {
    title: "NEW: RED BOMBS",
    lines: [
      "Red targets are BOMBS!",
      "RIGHT CLICK to defuse them.",
      "Never left-click a live bomb!",
    ],
    mobileLines: [
      "Red targets are BOMBS!",
      "TAP the bomb TWICE to defuse.",
      "One tap is not enough!",
    ],
  },
  orange: {
    title: "NEW: ORANGE BOMBS",
    lines: [
      "Orange bombs show up often here!",
      "RIGHT CLICK to defuse first.",
      "Then LEFT CLICK to confirm!",
    ],
    mobileLines: [
      "Orange bombs show up often here!",
      "TAP the bomb THREE times.",
      "Tap 1-2 defuse, tap 3 scores!",
    ],
  },
  sliders: {
    title: "NEW: SLIDING TARGETS",
    lines: [
      "Most targets now SLIDE across!",
      "LEFT CLICK blue balls at the gold line.",
      "This stage: sliding blues only.",
    ],
    mobileLines: [
      "Most targets now SLIDE across!",
      "TAP blue balls at the gold line.",
      "This stage: sliding blues only.",
    ],
  },
  redSliders: {
    title: "NEW: RED SLIDERS",
    lines: [
      "Many sliders are RED now!",
      "RIGHT CLICK moving red bombs.",
      "Keep your combo alive!",
    ],
    mobileLines: [
      "Many sliders are RED now!",
      "DOUBLE TAP moving red bombs.",
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

const MOUSE_SKINS = [
  { id: "default", name: "CROSSHAIR", price: 0, color: [0, 255, 200], style: "cross" },
  { id: "neon", name: "NEON RING", price: 280, color: [0, 180, 255], style: "ring" },
  { id: "laser", name: "LASER DOT", price: 450, color: [255, 0, 100], style: "dot" },
  { id: "pixel", name: "PIXEL ARC", price: 720, color: [50, 255, 100], style: "pixel" },
  { id: "gold", name: "GOLD STAR", price: 1000, color: [255, 210, 60], style: "star" },
];

const BACKGROUNDS = [
  { id: "cyber", name: "CYBER GRID", price: 0, bg: [10, 10, 18], grid: [25, 20, 45], accent: [0, 255, 200] },
  { id: "matrix", name: "MATRIX", price: 350, bg: [4, 12, 6], grid: [10, 40, 15], accent: [50, 255, 100] },
  { id: "sunset", name: "SUNSET", price: 550, bg: [28, 8, 32], grid: [80, 30, 60], accent: [255, 120, 40] },
  { id: "space", name: "DEEP SPACE", price: 800, bg: [5, 5, 20], grid: [30, 30, 80], accent: [120, 140, 255] },
  { id: "retro", name: "RETRO WAVE", price: 1200, bg: [15, 5, 35], grid: [100, 20, 120], accent: [255, 0, 180] },
];

const XP_PER_SCORE = 2;

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
  "Stages unlock mechanics two at a time",
  "Sliders appear from stage 7",
  "Build COMBO for bigger score & XP",
  "Beat the GOAL score before time runs out (30s)",
  "INFINITE mode — pick track + mechanics, survive!",
  "Earn COINS — clear stages for the best payout",
];

const HOW_TO_LINES_MOBILE = [
  "HOW TO PLAY",
  "",
  "TAP — hit blue balls",
  "RED bombs — tap twice on target",
  "ORANGE bombs — tap three times",
  "Targets appear on the BEAT — hit fast!",
  "Login in Settings to join leaderboards",
  "#1 on leaderboard earns bonus COINS!",
  "Build COMBO for bigger score & XP",
  "Beat the GOAL score before time runs out (30s)",
];

function getHowToLines() {
  return Input.touchMode ? HOW_TO_LINES_MOBILE : HOW_TO_LINES;
}

const INFINITE_MECHANIC_DEFAULTS = {
  redChance: RED_BOMB_CHANCE,
  orangeChance: ORANGE_BOMB_CHANCE,
  sliderChance: SLIDER_SPAWN_CHANCE,
  sliderRedChance: 0.35,
};

function buildInfiniteModeKey(trackId, mechanics) {
  const m = mechanics;
  return `${trackId}-r${m.red ? 1 : 0}o${m.orange ? 1 : 0}s${m.sliders ? 1 : 0}rs${m.sliderRed ? 1 : 0}`;
}

function applyInfiniteMechanicPreset(setup, index) {
  const preset = INFINITE_MECHANIC_PRESETS[index] || INFINITE_MECHANIC_PRESETS[0];
  setup.mechanicIndex = index;
  setup.red = preset.red;
  setup.orange = preset.orange;
  setup.sliders = preset.sliders;
  setup.sliderRed = preset.sliderRed;
}

function cycleInfiniteTrack(setup) {
  setup.trackId = setup.trackId >= LEVELS.length ? 1 : setup.trackId + 1;
}

function cycleInfiniteMechanics(setup) {
  const next = ((setup.mechanicIndex ?? 0) + 1) % INFINITE_MECHANIC_PRESETS.length;
  applyInfiniteMechanicPreset(setup, next);
}

function infiniteMechanicName(setup) {
  return INFINITE_MECHANIC_PRESETS[setup.mechanicIndex ?? 0]?.name || INFINITE_MECHANIC_PRESETS[0].name;
}

function createInfiniteLevel(sourceLevel, mechanics = {}) {
  const red = mechanics.red !== false;
  const orange = mechanics.orange !== false;
  const sliders = !!mechanics.sliders;
  const sliderRed = !!mechanics.sliderRed && sliders;
  const modeKey = buildInfiniteModeKey(sourceLevel.id, { red, orange, sliders, sliderRed });

  return {
    ...sourceLevel,
    infinite: true,
    musicSourceId: sourceLevel.id,
    infiniteModeKey: modeKey,
    name: `INFINITE — ${sourceLevel.name}`,
    duration: 0,
    passScore: 0,
    clearXp: 0,
    allowRed: red,
    allowOrange: orange,
    sliders,
    sliderRed,
    redChance: red ? INFINITE_MECHANIC_DEFAULTS.redChance : 0,
    orangeChance: orange ? INFINITE_MECHANIC_DEFAULTS.orangeChance : 0,
    sliderChance: sliders ? INFINITE_MECHANIC_DEFAULTS.sliderChance : 0,
    sliderRedChance: sliderRed ? INFINITE_MECHANIC_DEFAULTS.sliderRedChance : 0,
    tutorial: null,
  };
}

function shouldSpawnSlider(level) {
  if (!level.sliders) return false;
  const chance = level.sliderChance ?? SLIDER_SPAWN_CHANCE;
  return Math.random() < chance;
}

function levelTargetRates(level) {
  return {
    red: level.redChance ?? RED_BOMB_CHANCE,
    orange: level.orangeChance ?? ORANGE_BOMB_CHANCE,
    slider: level.sliderChance ?? SLIDER_SPAWN_CHANCE,
    sliderRed: level.sliderRedChance ?? 0.4,
  };
}

function musicLevelId(level) {
  if (level.infiniteModeKey) return level.infiniteModeKey;
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
  const tutorial = TUTORIALS[key];
  if (!tutorial) return null;
  const lines = Input.touchMode && tutorial.mobileLines ? tutorial.mobileLines : tutorial.lines;
  return { title: tutorial.title, lines };
}
