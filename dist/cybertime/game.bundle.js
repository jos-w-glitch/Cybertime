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

function accessibilityScale() {
  return Input?.save?.settings?.accessibility ? 1.35 : 1;
}

function hitPadSize() {
  let pad = Input?.touchMode ? 22 : 4;
  if (Input?.save?.settings?.accessibility) pad += Input.touchMode ? 20 : 14;
  return pad;
}

function targetRadiusScale() {
  return (Input?.touchMode ? 1.35 : 1) * accessibilityScale();
}

function uiFont(size) {
  return gameFont(Math.round(size * mobileUiScale() * accessibilityScale()));
}

function btnHeight(size = 52) {
  return Math.round(size * mobileUiScale() * accessibilityScale());
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
  { name: "BLUE ONLY", red: false, orange: false, purple: false, sliders: false, sliderRed: false },
  { name: "RED BOMBS", red: true, orange: false, purple: false, sliders: false, sliderRed: false },
  { name: "ORANGE BOMBS", red: true, orange: true, purple: false, sliders: false, sliderRed: false },
  { name: "PURPLE DUAL", red: false, orange: false, purple: true, sliders: false, sliderRed: false },
  { name: "SLIDERS", red: false, orange: false, purple: false, sliders: true, sliderRed: false },
  { name: "RED SLIDERS", red: false, orange: false, purple: false, sliders: true, sliderRed: true },
  { name: "FULL MIX", red: true, orange: true, purple: true, sliders: true, sliderRed: true },
];
const ICON_BUTTON_SIZE = 56;
const ICON_BUTTON_RADIUS = 14;
const MUSIC_FADE_SECONDS = 5;
const STAGE_TIME_SECONDS = 30;
const PURPLE_DUAL_WINDOW_MS = 1000;

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
  purpleGlow: [120, 40, 200],
};

const LEVELS = [
  { id: 1, name: "NEON START", bpm: 72, hitWindowMs: 2800, bombFuse: 5, duration: 30, sliders: false, allowRed: false, allowOrange: false, sliderRed: false, redChance: 0, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 10, clearXp: 60, musicId: "track1", tutorial: null, featureHint: "Blue balls only — learn the beat" },
  { id: 2, name: "WARM PULSE", bpm: 84, hitWindowMs: 2500, bombFuse: 4.5, duration: 30, sliders: false, allowRed: false, allowOrange: false, sliderRed: false, redChance: 0, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 14, clearXp: 80, musicId: "track2", tutorial: null, featureHint: "Blue balls only — faster timing" },
  { id: 3, name: "RED ALERT", bpm: 96, hitWindowMs: 2200, bombFuse: 4, duration: 30, sliders: false, allowRed: true, allowOrange: false, sliderRed: false, redChance: 0.25, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 18, clearXp: 95, musicId: "track3", tutorial: "red", featureHint: "~25% red bombs — learn defuse" },
  { id: 4, name: "PULSE DRIVE", bpm: 104, hitWindowMs: 2000, bombFuse: 3.8, duration: 30, sliders: false, allowRed: true, allowOrange: false, sliderRed: false, redChance: 0.38, orangeChance: 0, sliderChance: 0, sliderRedChance: 0, passScore: 22, clearXp: 110, musicId: "track4", tutorial: null, featureHint: "~38% red bombs — more pressure" },
  { id: 5, name: "ORANGE GLINT", bpm: 112, hitWindowMs: 1850, bombFuse: 3.5, duration: 30, sliders: false, allowRed: true, allowOrange: true, sliderRed: false, redChance: 0.12, orangeChance: 0.25, sliderChance: 0, sliderRedChance: 0, passScore: 26, clearXp: 125, musicId: "track5", tutorial: "orange", featureHint: "~25% orange — defuse then confirm" },
  { id: 6, name: "HYPER LOOP", bpm: 122, hitWindowMs: 1700, bombFuse: 3.2, duration: 30, sliders: false, allowRed: true, allowOrange: true, sliderRed: false, redChance: 0.15, orangeChance: 0.35, sliderChance: 0, sliderRedChance: 0, passScore: 32, clearXp: 140, musicId: "track6", tutorial: null, featureHint: "~35% orange — mixed bombs" },
  { id: 7, name: "DUAL SYNC", bpm: 128, hitWindowMs: 1550, bombFuse: 3, duration: 30, sliders: false, allowRed: false, allowOrange: false, allowPurple: true, sliderRed: false, redChance: 0, orangeChance: 0, purpleChance: 0.35, sliderChance: 0, sliderRedChance: 0, passScore: 36, clearXp: 155, musicId: "track7", tutorial: "purple", featureHint: "~35% purple pairs — tap both at once" },
  { id: 8, name: "TWIN PULSE", bpm: 136, hitWindowMs: 1420, bombFuse: 2.9, duration: 30, sliders: false, allowRed: false, allowOrange: false, allowPurple: true, sliderRed: false, redChance: 0, orangeChance: 0, purpleChance: 0.5, sliderChance: 0, sliderRedChance: 0, passScore: 42, clearXp: 175, musicId: "track8", tutorial: null, featureHint: "~50% purple pairs — faster timing" },
  { id: 9, name: "SLIDE INTRO", bpm: 142, hitWindowMs: 1350, bombFuse: 2.8, duration: 30, sliders: true, allowRed: false, allowOrange: false, allowPurple: false, sliderRed: false, redChance: 0, orangeChance: 0, purpleChance: 0, sliderChance: 0.4, sliderRedChance: 0, passScore: 44, clearXp: 185, musicId: "track9", tutorial: "sliders", featureHint: "~40% sliding blues" },
  { id: 10, name: "CHAOS CORE", bpm: 152, hitWindowMs: 1200, bombFuse: 2.6, duration: 30, sliders: true, allowRed: false, allowOrange: false, allowPurple: false, sliderRed: false, redChance: 0, orangeChance: 0, purpleChance: 0, sliderChance: 0.55, sliderRedChance: 0, passScore: 50, clearXp: 210, musicId: "track10", tutorial: null, featureHint: "~55% sliding blues — faster slides" },
  { id: 11, name: "RED SLIDE", bpm: 160, hitWindowMs: 1100, bombFuse: 2.4, duration: 30, sliders: true, allowRed: false, allowOrange: false, allowPurple: false, sliderRed: true, redChance: 0, orangeChance: 0, purpleChance: 0, sliderChance: 0.48, sliderRedChance: 0.3, passScore: 55, clearXp: 230, musicId: "track11", tutorial: "redSliders", featureHint: "~30% red sliders — defuse on the move" },
  { id: 12, name: "FINAL SYNC", bpm: 168, hitWindowMs: 900, bombFuse: 2.2, duration: 30, sliders: true, allowRed: true, allowOrange: true, allowPurple: true, sliderRed: true, redChance: 0.12, orangeChance: 0.1, purpleChance: 0.08, sliderChance: 0.55, sliderRedChance: 0.44, passScore: 68, clearXp: 280, musicId: "track12", tutorial: null, featureHint: "Everything combined — final test" },
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
  purple: {
    title: "NEW: PURPLE DUAL",
    lines: [
      "Two PURPLE balls appear together!",
      "MIDDLE CLICK both within one second.",
      "One click is not enough — get both!",
    ],
    mobileLines: [
      "Two PURPLE balls appear together!",
      "TAP BOTH within one second.",
      "One tap is not enough — get both!",
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
const PURPLE_BOMB_CHANCE = 0.08;
const SLIDER_SPAWN_CHANCE = 0.35;

const HOW_TO_LINES = [
  "HOW TO PLAY",
  "",
  "LEFT CLICK  — hit blue balls",
  "RIGHT CLICK — defuse red bombs",
  "ORANGE bombs (rare): defuse, then click!",
  "PURPLE — middle-click BOTH balls within 1 second!",
  "Targets appear on the BEAT — hit fast!",
  "Stages unlock mechanics two at a time",
  "Purple pairs from stage 7, sliders from 9",
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
  "PURPLE — tap BOTH balls within 1 second!",
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
  purpleChance: PURPLE_BOMB_CHANCE,
  sliderChance: SLIDER_SPAWN_CHANCE,
  sliderRedChance: 0.35,
};

function buildInfiniteModeKey(trackId, mechanics) {
  const m = mechanics;
  return `${trackId}-r${m.red ? 1 : 0}o${m.orange ? 1 : 0}p${m.purple ? 1 : 0}s${m.sliders ? 1 : 0}rs${m.sliderRed ? 1 : 0}`;
}

function applyInfiniteMechanicPreset(setup, index) {
  const preset = INFINITE_MECHANIC_PRESETS[index] || INFINITE_MECHANIC_PRESETS[0];
  setup.mechanicIndex = index;
  setup.red = preset.red;
  setup.orange = preset.orange;
  setup.purple = preset.purple;
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
  const purple = !!mechanics.purple;
  const sliders = !!mechanics.sliders;
  const sliderRed = !!mechanics.sliderRed && sliders;
  const modeKey = buildInfiniteModeKey(sourceLevel.id, { red, orange, purple, sliders, sliderRed });

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
    allowPurple: purple,
    sliders,
    sliderRed,
    redChance: red ? INFINITE_MECHANIC_DEFAULTS.redChance : 0,
    orangeChance: orange ? INFINITE_MECHANIC_DEFAULTS.orangeChance : 0,
    purpleChance: purple ? INFINITE_MECHANIC_DEFAULTS.purpleChance : 0,
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
    purple: level.purpleChance ?? PURPLE_BOMB_CHANCE,
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
// Supabase → Project Settings → Data API → Project URL (not /rest/v1/)
const SUPABASE_URL = "https://lhbwdnzbopiwxnygippz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zFPc1xq1itMoRzFq-M-zTg_F_T6tgiF";
const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
const CloudStore = {
  client: null,
  ready: false,
  pin: null,
  leaderboardCache: {},

  init() {
    if (!SUPABASE_ENABLED || typeof supabase === "undefined") return false;
    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.ready = true;
    return true;
  },

  enabled() {
    return this.ready;
  },

  setPin(pin) {
    this.pin = pin;
  },

  async login(name, pin) {
    if (!this.ready) return null;
    const { data, error } = await this.client.rpc("login_player", {
      p_name: name,
      p_pin: pin,
    });
    if (error) return { ok: false, reason: "Cloud login failed" };
    if (!data?.ok) return { ok: false, reason: data?.reason || "Cloud login failed" };
    this.setPin(pin);
    return {
      ok: true,
      name: data.name,
      isNew: !!data.is_new,
      saveData: data.save_data || {},
    };
  },

  async pushSave(name, save) {
    if (!this.ready || !this.pin) return;
    const payload = { ...save };
    delete payload.pin;
    await this.client.rpc("save_player", {
      p_name: name,
      p_pin: this.pin,
      p_save: payload,
    });
  },

  async pushLeaderboard(name, levelId, score) {
    if (!this.ready || !this.pin) return;
    await this.client.rpc("upsert_leaderboard_entry", {
      p_name: name,
      p_pin: this.pin,
      p_level_id: levelId,
      p_score: score,
    });
    delete this.leaderboardCache[String(levelId)];
  },

  async fetchLeaderboard(levelId) {
    const key = String(levelId);
    if (this.leaderboardCache[key]) return this.leaderboardCache[key];
    if (!this.ready) return null;
    const { data, error } = await this.client.rpc("get_level_leaderboard", {
      p_level_id: levelId,
    });
    if (error) return null;
    const entries = Array.isArray(data) ? data : [];
    this.leaderboardCache[key] = entries;
    return entries;
  },
};
const Auth = {
  NAME_KEY: "cybertime-player-name",
  displayName: null,

  init(onReady) {
    migrateLegacyPlayers();
    CloudStore.init();
    this.hideNameScreen();
    onReady(true);
  },

  isLoggedIn() {
    return !!this.displayName;
  },

  listPlayers() {
    try {
      const raw = localStorage.getItem(PLAYERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch {
      return [];
    }
  },

  findPlayerKey(name) {
    const needle = name.trim().toLowerCase();
    if (!needle) return null;
    return this.listPlayers().find((p) => p.toLowerCase() === needle) || null;
  },

  playerExists(name) {
    const key = this.findPlayerKey(name) || name.trim();
    return !!readAllSaves()[key];
  },

  rememberPlayer(name) {
    const trimmed = name.trim();
    let players = this.listPlayers().filter((p) => p.toLowerCase() !== trimmed.toLowerCase());
    players.unshift(trimmed);
    if (players.length > MAX_SAVED_PLAYERS) players = players.slice(0, MAX_SAVED_PLAYERS);
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    localStorage.setItem(ACTIVE_PLAYER_KEY, trimmed);
    localStorage.setItem(this.NAME_KEY, trimmed);
    return trimmed;
  },

  validateName(name) {
    const trimmed = name.trim();
    if (!trimmed.length) return { ok: false, reason: "Enter a name" };
    if (trimmed.length > 16) return { ok: false, reason: "Name max 16 characters" };
    return { ok: true, name: trimmed };
  },

  validatePin(pin) {
    const trimmed = String(pin || "").trim();
    if (!/^\d{4}$/.test(trimmed)) return { ok: false, reason: "PIN must be 4 digits" };
    return { ok: true, pin: trimmed };
  },

  async login(name, pin) {
    const nameCheck = this.validateName(name);
    if (!nameCheck.ok) return nameCheck;
    const pinCheck = this.validatePin(pin);
    if (!pinCheck.ok) return pinCheck;

    if (CloudStore.enabled()) {
      const cloud = await CloudStore.login(nameCheck.name, pinCheck.pin);
      if (cloud?.ok) {
        applyCloudSave(cloud.name, cloud.saveData, pinCheck.pin);
        this.displayName = this.rememberPlayer(cloud.name);
        return { ok: true, name: this.displayName, isNew: cloud.isNew };
      }
      if (cloud) return cloud;
    }

    return this.loginLocal(nameCheck.name, pinCheck.pin);
  },

  loginLocal(name, pin) {
    const canonical = this.findPlayerKey(name) || name;
    const saves = readAllSaves();
    const existing = saves[canonical];

    if (existing) {
      if (existing.pin && existing.pin !== pin) {
        return { ok: false, reason: "Wrong PIN for this name" };
      }
      if (!existing.pin) existing.pin = pin;
      try {
        writeAllSaves(saves);
        CloudStore.setPin(pin);
        this.displayName = this.rememberPlayer(canonical);
      } catch {
        return { ok: false, reason: "Allow storage for this site" };
      }
      return { ok: true, name: this.displayName, isNew: false };
    }

    try {
      const save = defaultSave();
      save.pin = pin;
      save.username = canonical;
      saves[canonical] = save;
      writeAllSaves(saves);
      CloudStore.setPin(pin);
      this.displayName = this.rememberPlayer(canonical);
    } catch {
      return { ok: false, reason: "Allow storage for this site" };
    }
    return { ok: true, name: this.displayName, isNew: true };
  },

  logout() {
    this.displayName = null;
    CloudStore.setPin(null);
  },

  showLoginScreen() {
    document.getElementById("name-overlay")?.classList.remove("hidden");
    document.getElementById("name-cancel")?.classList.remove("hidden");
    document.getElementById("login-title")?.classList.remove("hidden");
    document.getElementById("name-panel")?.querySelector("p")?.classList.add("hidden");
    this.setError("");
    this.updatePinHint(document.getElementById("player-name")?.value || "");
  },

  hideNameScreen() {
    document.getElementById("name-overlay")?.classList.add("hidden");
    document.getElementById("name-cancel")?.classList.add("hidden");
    document.getElementById("login-title")?.classList.add("hidden");
    document.getElementById("name-panel")?.querySelector("p")?.classList.remove("hidden");
    this.setError("");
  },

  setError(message) {
    const el = document.getElementById("name-error");
    if (el) el.textContent = message || "";
  },

  updatePinHint(name) {
    const el = document.getElementById("pin-hint");
    if (!el) return;
    const trimmed = name?.trim();
    if (!trimmed) {
      el.textContent = CloudStore.enabled()
        ? "Name + PIN saves progress and leaderboard scores."
        : "New player? Pick a 4-digit PIN. Returning? Enter your PIN.";
      return;
    }
    el.textContent = this.playerExists(trimmed)
      ? "Enter your PIN to open this profile."
      : "New name — choose a 4-digit PIN to protect it.";
  },

  setLoading(loading) {
    document.querySelectorAll("#name-panel button, #name-panel input").forEach((el) => {
      el.disabled = loading;
    });
  },
};

function migrateLegacyPlayers() {
  if (localStorage.getItem(MIGRATION_KEY)) return;
  try {
    const saves = readAllSaves();
    const oldName = localStorage.getItem(Auth.NAME_KEY);
    const legacySave = localStorage.getItem(SAVE_KEY)
      || localStorage.getItem("cyberpunk-timing-v2")
      || localStorage.getItem("cyberpunk-timing");
    if (legacySave && oldName && !saves[oldName]) {
      Auth.displayName = oldName;
      saves[oldName] = normalizeSave(JSON.parse(legacySave));
      writeAllSaves(saves);
    }
    if (oldName) Auth.rememberPlayer(oldName);
    localStorage.setItem(MIGRATION_KEY, "1");
  } catch {}
}
const defaultSave = () => ({
  username: Auth.isLoggedIn() ? Auth.displayName : "Guest",
  xp: 0,
  coins: 15,
  highScores: {},
  infiniteHighScores: {},
  clearedLevels: [],
  leaderboards: {},
  leaderboardRewards: {},
  ownedSkins: ["default"],
  ownedBackgrounds: ["cyber"],
  equippedSkin: "default",
  equippedBackground: "cyber",
  keys: { ball: 0, bomb: 2, ballKey: "KeyZ", bombKey: "KeyX" },
  settings: { musicVolume: 0.55, sfxVolume: 0.7, accessibility: false },
});

function normalizeSave(raw) {
  const base = defaultSave();
  const data = { ...base, ...raw };
  data.username = Auth.isLoggedIn() ? (Auth.displayName || data.username) : "Guest";
  data.xp = Number.isFinite(data.xp) ? data.xp : 0;
  data.coins = Number.isFinite(data.coins) ? data.coins : base.coins;
  if (!data.highScores || typeof data.highScores !== "object") data.highScores = {};
  if (!data.infiniteHighScores || typeof data.infiniteHighScores !== "object") data.infiniteHighScores = {};
  if (!data.leaderboards || typeof data.leaderboards !== "object") data.leaderboards = {};
  if (!data.leaderboardRewards || typeof data.leaderboardRewards !== "object") data.leaderboardRewards = {};
  if (!Array.isArray(data.clearedLevels)) data.clearedLevels = [];
  if (!Array.isArray(data.ownedSkins)) data.ownedSkins = base.ownedSkins;
  if (!Array.isArray(data.ownedBackgrounds)) data.ownedBackgrounds = base.ownedBackgrounds;
  if (!data.settings || typeof data.settings !== "object") data.settings = { ...base.settings };
  data.settings.musicVolume = Number.isFinite(data.settings.musicVolume) ? data.settings.musicVolume : base.settings.musicVolume;
  data.settings.sfxVolume = Number.isFinite(data.settings.sfxVolume) ? data.settings.sfxVolume : base.settings.sfxVolume;
  data.settings.accessibility = !!data.settings.accessibility;
  if (!data.keys || typeof data.keys !== "object") data.keys = { ...base.keys };
  data.keys.ball = data.keys.ball ?? base.keys.ball;
  data.keys.bomb = data.keys.bomb ?? base.keys.bomb;
  data.keys.ballKey = data.keys.ballKey || base.keys.ballKey;
  data.keys.bombKey = data.keys.bombKey || base.keys.bombKey;
  if (!data.ownedSkins.includes(data.equippedSkin)) data.equippedSkin = "default";
  if (!data.ownedBackgrounds.includes(data.equippedBackground)) data.equippedBackground = "cyber";
  if (typeof data.pin === "string" && !/^\d{4}$/.test(data.pin)) delete data.pin;
  return data;
}

function readAllSaves() {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeAllSaves(saves) {
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
}

function readGlobalLeaderboards() {
  try {
    const raw = localStorage.getItem(LEADERBOARDS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeGlobalLeaderboards(boards) {
  localStorage.setItem(LEADERBOARDS_KEY, JSON.stringify(boards));
}

function upsertLeaderboardEntry(boards, levelId, name, score, at = Date.now()) {
  const key = String(levelId);
  const playerName = name.trim();
  if (!playerName) return;
  if (!boards[key]) boards[key] = [];
  const needle = playerName.toLowerCase();
  const existing = boards[key].find((entry) => entry.name.toLowerCase() === needle);
  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.at = at;
    }
  } else {
    boards[key].push({ name: playerName, score, at });
  }
  boards[key].sort((a, b) => b.score - a.score || b.at - a.at);
  boards[key] = boards[key].slice(0, LEADERBOARD_SIZE);
}

function migrateLeaderboardsToGlobal() {
  if (localStorage.getItem(LEADERBOARDS_MIGRATION_KEY)) return;
  const boards = readGlobalLeaderboards();
  const saves = readAllSaves();
  for (const playerSave of Object.values(saves)) {
    if (!playerSave?.leaderboards || typeof playerSave.leaderboards !== "object") continue;
    for (const [levelId, entries] of Object.entries(playerSave.leaderboards)) {
      if (!Array.isArray(entries)) continue;
      entries.forEach((entry) => {
        if (!entry?.name) return;
        upsertLeaderboardEntry(boards, levelId, entry.name, entry.score || 0, entry.at || 0);
      });
    }
  }
  writeGlobalLeaderboards(boards);
  localStorage.setItem(LEADERBOARDS_MIGRATION_KEY, "1");
}

function loadGuestSave() {
  try {
    const raw = sessionStorage.getItem(GUEST_SAVE_KEY);
    if (raw) return normalizeSave(JSON.parse(raw));
  } catch {}
  return normalizeSave(defaultSave());
}

function writeGuestSave(data) {
  data.username = "Guest";
  sessionStorage.setItem(GUEST_SAVE_KEY, JSON.stringify(data));
}

function mergeGuestIntoAccount(guestSave, accountSave) {
  for (const [id, score] of Object.entries(guestSave.highScores || {})) {
    const levelId = Number(id);
    accountSave.highScores[levelId] = Math.max(accountSave.highScores[levelId] || 0, score);
  }
  for (const [id, score] of Object.entries(guestSave.infiniteHighScores || {})) {
    accountSave.infiniteHighScores[id] = Math.max(accountSave.infiniteHighScores[id] || 0, score);
  }
  for (const levelId of guestSave.clearedLevels || []) {
    if (!accountSave.clearedLevels.includes(levelId)) {
      accountSave.clearedLevels.push(levelId);
    }
  }
  accountSave.coins = Math.max(accountSave.coins, guestSave.coins);
  accountSave.xp = Math.max(accountSave.xp, guestSave.xp);
  return accountSave;
}

function loadSave() {
  migrateLeaderboardsToGlobal();
  if (!Auth.isLoggedIn()) return loadGuestSave();
  const name = Auth.displayName;
  const saves = readAllSaves();
  const key = Auth.findPlayerKey(name) || name;
  if (saves[key]) return normalizeSave(saves[key]);
  return defaultSave();
}

function applyCloudSave(name, raw, pin) {
  const key = Auth.findPlayerKey(name) || name.trim();
  const save = normalizeSave({ ...defaultSave(), ...raw, pin, username: key });
  const saves = readAllSaves();
  saves[key] = save;
  writeAllSaves(saves);
  return save;
}

function writeSave(data) {
  if (!Auth.isLoggedIn()) {
    writeGuestSave(data);
    return;
  }
  const name = Auth.displayName;
  const key = Auth.findPlayerKey(name) || name;
  data.username = key;
  const saves = readAllSaves();
  saves[key] = data;
  writeAllSaves(saves);
  if (CloudStore.enabled()) CloudStore.pushSave(key, data);
}

let cloudLeaderboards = {};

async function refreshLeaderboard(levelId) {
  if (!CloudStore.enabled()) return;
  const entries = await CloudStore.fetchLeaderboard(levelId);
  if (entries) cloudLeaderboards[String(levelId)] = entries;
}

function calcCoinGain(score, success) {
  if (success) return Math.floor(score / 4) + 3;
  return Math.max(0, Math.floor(score / 15));
}

function finishGameRewards(save, game) {
  const level = game.level;
  const score = Math.max(0, game.score);
  let xpGain = score * XP_PER_SCORE + game.comboPeak * 5;

  if (level.infinite) {
    const key = String(musicLevelId(level));
    const prev = save.infiniteHighScores[key] || 0;
    const newBest = score > prev;
    const coinGain = calcCoinGain(score, false);
    save.xp += xpGain;
    save.coins += coinGain;
    writeSave(save);
    return {
      infinite: true,
      success: false,
      newBest,
      best: Math.max(prev, score),
      xpGain,
      coinGain,
      passScore: 0,
      needed: 0,
    };
  }

  let stageXp = 0;
  let cleared = false;
  let unlockedNext = false;
  let leaderboardPrize = 0;
  let isLeader = false;
  const timedOut = game.endReason === "time";
  const success = timedOut && score >= level.passScore;
  const coinGain = calcCoinGain(score, success);

  if (success) {
    cleared = true;
    stageXp = level.clearXp;
    xpGain += stageXp;
    if (!save.clearedLevels.includes(level.id)) {
      save.clearedLevels.push(level.id);
    }
    unlockedNext = level.id < LEVELS.length;
    if (Auth.isLoggedIn()) {
      const lb = addLeaderboardEntry(save, level.id, score);
      leaderboardPrize = lb.coinPrize || 0;
      isLeader = lb.isFirst || false;
    }
  }

  save.xp += xpGain;
  save.coins += coinGain + leaderboardPrize;
  writeSave(save);
  return {
    xpGain,
    coinGain: coinGain + leaderboardPrize,
    stageXp,
    cleared,
    success,
    unlockedNext,
    passScore: level.passScore,
    needed: Math.max(0, level.passScore - score),
    leaderboardPrize,
    isLeader,
    guestScore: !Auth.isLoggedIn(),
  };
}

function addLeaderboardEntry(save, levelId, score) {
  if (!Auth.isLoggedIn()) return { submitted: false, coinPrize: 0, isFirst: false };

  const name = Auth.displayName;
  const boards = readGlobalLeaderboards();
  const key = String(levelId);
  upsertLeaderboardEntry(boards, levelId, name, score);
  writeGlobalLeaderboards(boards);
  if (CloudStore.enabled()) CloudStore.pushLeaderboard(name, levelId, score);

  const entries = boards[key] || [];
  const top = entries[0];
  const isFirst = top?.name?.toLowerCase() === name.toLowerCase();
  let coinPrize = 0;
  const rewardKey = String(levelId);

  if (isFirst && !save.leaderboardRewards?.[rewardKey]) {
    coinPrize = LEADERBOARD_FIRST_PRIZE;
    if (!save.leaderboardRewards) save.leaderboardRewards = {};
    save.leaderboardRewards[rewardKey] = true;
  }

  return { submitted: true, coinPrize, isFirst };
}

function getLeaderboard(_save, levelId) {
  const key = String(levelId);
  if (cloudLeaderboards[key]) return cloudLeaderboards[key];
  migrateLeaderboardsToGlobal();
  return readGlobalLeaderboards()[key] || [];
}

function canAfford(save, price) {
  return save.coins >= price;
}

function purchaseItem(save, price, collection, id) {
  if (save[collection].includes(id)) return { ok: false, reason: "owned" };
  if (!canAfford(save, price)) return { ok: false, reason: "coins" };
  save.coins -= price;
  save[collection].push(id);
  writeSave(save);
  return { ok: true };
}

function updateHighScore(save, levelId, score) {
  const prev = save.highScores[levelId] || 0;
  if (score <= prev) return false;
  save.highScores[levelId] = score;
  writeSave(save);
  return true;
}

function updateInfiniteHighScore(save, musicId, score) {
  const key = String(musicId);
  const prev = save.infiniteHighScores[key] || 0;
  if (score <= prev) return false;
  save.infiniteHighScores[key] = score;
  writeSave(save);
  return true;
}

function pickFailMessage() {
  return FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];
}
const Input = {
  mousePos: { x: 0, y: 0 },
  isMobile: false,
  touchMode: false,
  playMode: false,
  pendingButton: null,
  mobileZones: { tap: null, defuse: null },

  init(canvas, save) {
    this.canvas = canvas;
    this.save = save;
    this.isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    this.touchMode = this.isMobile;
    applyViewport(canvas);
    canvas.style.cursor = this.touchMode ? "default" : "none";
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("auxclick", (e) => {
      if (e.button === 1) e.preventDefault();
    });
  },

  syncPos(clientX, clientY) {
    this.mousePos = toGamePos(this.canvas, clientX, clientY);
  },

  setMobileZones(tap, defuse) {
    this.mobileZones.tap = tap;
    this.mobileZones.defuse = defuse;
  },

  _inMobileZone(zone, pos) {
    const rect = this.mobileZones[zone];
    return rect && pointInRect(pos, rect);
  },

  remapKey(action, keyCode) {
    if (action === "ball") this.save.keys.ballKey = keyCode;
    if (action === "bomb") this.save.keys.bombKey = keyCode;
    writeSave(this.save);
  },

  resolveButton(rawButton) {
    if (rawButton === this.save.keys.ball) return "ball";
    if (rawButton === this.save.keys.bomb) return "bomb";
    if (rawButton === 0) return "ball";
    if (rawButton === 1) return "purple";
    if (rawButton === 2) return "bomb";
    return null;
  },
};
const MobileShell = {
  init() {
    if (!Input.isMobile) return;
    document.documentElement.classList.add("mobile-device");
    this.overlay = document.getElementById("rotate-overlay");
    this.bindViewport();
    this.syncRotatePrompt();
  },

  bindViewport() {
    const refresh = () => {
      this.syncRotatePrompt();
      if (App?.canvas) applyViewport(App.canvas);
    };

    window.visualViewport?.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("scroll", refresh);
    window.addEventListener("orientationchange", () => setTimeout(refresh, 150));
    window.addEventListener("resize", refresh);
  },

  isLandscape() {
    return window.innerWidth > window.innerHeight;
  },

  syncRotatePrompt() {
    if (!this.overlay) return;

    if (!Input?.touchMode) {
      this.overlay.classList.add("hidden");
      document.body.classList.remove("rotate-blocked");
      return;
    }

    const show = this.isLandscape();
    this.overlay.classList.toggle("hidden", !show);
    document.body.classList.toggle("rotate-blocked", show);
  },

  async enterPlayMode() {
    if (!Input.touchMode || Input.playMode) return;
    Input.playMode = true;
    document.body.classList.add("game-playing");
    this.hideBrowserChrome();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.({ navigationUI: "hide" });
      }
    } catch {}
    applyViewport(App.canvas);
  },

  exitPlayMode() {
    if (!Input.playMode) return;
    Input.playMode = false;
    document.body.classList.remove("game-playing");
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    applyViewport(App.canvas);
  },

  hideBrowserChrome() {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 1));
  },
};

function viewportSize() {
  const vp = window.visualViewport;
  if (Input.touchMode && vp) {
    return { w: vp.width, h: vp.height };
  }
  return { w: window.innerWidth, h: window.innerHeight };
}
const PwaInstall = {
  prompt: null,

  init() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.prompt = e;
    });
    this.registerServiceWorker();
  },

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("/cybertime/sw.js", { scope: "/cybertime/" });
    } catch {}
  },

  isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches
      || window.matchMedia("(display-mode: fullscreen)").matches
      || navigator.standalone === true;
  },

  isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  canPromptInstall() {
    return !!this.prompt;
  },

  async promptInstall() {
    if (!this.prompt) return false;
    await this.prompt.prompt();
    await this.prompt.userChoice;
    this.prompt = null;
    return true;
  },

  iosHint() {
    return "Safari → Share (□↑) → Add to Home Screen";
  },
};
function rgb(c, a = 1) {
  return a === 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function pointInRect(p, rect) {
  return p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h;
}

function toGamePos(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * viewW(),
    y: ((clientY - rect.top) / rect.height) * viewH(),
  };
}

function createStars(count = 40) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * viewW(),
    y: Math.random() * viewH(),
    speed: 0.5 + Math.random() * 1.5,
  }));
}

function clearFrame(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = rgb(COLORS.bg);
  ctx.fillRect(0, 0, viewW(), viewH());
}

function drawBootMessage(ctx, title, lines = []) {
  clearFrame(ctx);
  ctx.textAlign = "center";
  ctx.font = gameFont(48);
  ctx.fillStyle = rgb(COLORS.blue);
  ctx.fillText(title, viewW() / 2, viewH() / 2 - 20);
  ctx.font = gameFont(22);
  ctx.fillStyle = rgb(COLORS.text);
  lines.forEach((line, i) => {
    ctx.fillText(line, viewW() / 2, viewH() / 2 + 30 + i * 30);
  });
  ctx.textAlign = "left";
}

function fitCanvasToWindow(canvas) {
  const { w: availW, h: availH } = viewportSize();
  const ratio = viewW() / viewH();
  let w = availW;
  let h = w / ratio;
  if (h > availH) {
    h = availH;
    w = h * ratio;
  }
  canvas.style.width = `${Math.floor(w)}px`;
  canvas.style.height = `${Math.floor(h)}px`;
}

function applyViewport(canvas) {
  if (!canvas) return;
  if (Input?.touchMode) MobileShell.syncRotatePrompt();
  canvas.width = viewW();
  canvas.height = viewH();
  fitCanvasToWindow(canvas);
}

const UiIcons = {
  home: null,

  load() {
    this.home = this._loadImage(HOME_ICON_PATH);
  },

  _loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  },
};

function drawIconButton(ctx, rect, img, hovered) {
  const r = ICON_BUTTON_RADIUS;
  if (hovered) {
    ctx.fillStyle = rgb(COLORS.gold, 0.18);
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
    ctx.fill();
    ctx.strokeStyle = rgb(COLORS.gold);
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
    ctx.stroke();
  }
  if (img?.complete && img.naturalWidth > 0) {
    ctx.save();
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
    ctx.clip();
    const pad = 6;
    ctx.drawImage(img, rect.x + pad, rect.y + pad, rect.w - pad * 2, rect.h - pad * 2);
    ctx.restore();
    return;
  }
  ctx.fillStyle = rgb(COLORS.gray);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
  ctx.fill();
}

function drawBackground(ctx, now, bgTheme, stars) {
  ctx.fillStyle = rgb(bgTheme.bg);
  ctx.fillRect(0, 0, viewW(), viewH());

  ctx.strokeStyle = rgb(bgTheme.grid);
  ctx.lineWidth = 1;
  for (let x = 0; x < viewW(); x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewH());
    ctx.stroke();
  }
  for (let y = 0; y < viewH(); y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewW(), y);
    ctx.stroke();
  }

  for (const star of stars || []) {
    const alpha = 155 + 100 * Math.sin(now * 0.005 * star.speed);
    ctx.fillStyle = rgb([alpha, alpha, Math.min(255, alpha + 30)]);
    ctx.beginPath();
    ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCursor(ctx, pos, skin) {
  const { color, style } = skin;

  ctx.save();
  ctx.shadowColor = rgb(color, 0.8);
  ctx.shadowBlur = 14;
  ctx.strokeStyle = rgb(color);
  ctx.fillStyle = rgb(color);
  ctx.lineWidth = 3;

  if (style === "cross") {
    ctx.beginPath();
    ctx.moveTo(pos.x - 16, pos.y);
    ctx.lineTo(pos.x + 16, pos.y);
    ctx.moveTo(pos.x, pos.y - 16);
    ctx.lineTo(pos.x, pos.y + 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "ring") {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "dot") {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgb(color, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x - 22, pos.y);
    ctx.lineTo(pos.x + 22, pos.y);
    ctx.moveTo(pos.x, pos.y - 22);
    ctx.lineTo(pos.x, pos.y + 22);
    ctx.stroke();
  } else if (style === "pixel") {
    ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
    ctx.strokeStyle = rgb(color);
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x - 12, pos.y - 12, 24, 24);
  } else if (style === "star") {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 14 : 6;
      const px = pos.x + Math.cos(a) * r;
      const py = pos.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawNeonButton(ctx, rect, label, hovered, small = false) {
  ctx.fillStyle = rgb(hovered ? [0, 255, 150] : [0, 180, 120]);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.fill();
  ctx.strokeStyle = rgb(COLORS.text);
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.stroke();
  ctx.font = small ? uiFont(24) : uiFont(36);
  ctx.fillStyle = rgb(COLORS.bg);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function buttonRect(ctx, label, x, y, w = null, h = 52) {
  ctx.font = uiFont(36);
  const height = btnHeight(h);
  const width = w || ctx.measureText(label).width + Math.round(48 * mobileUiScale());
  return { x: x ?? (viewW() - width) / 2, y, w: width, h: height };
}

function drawSlider(ctx, slider, value) {
  const { x, y, w, label } = slider;
  ctx.font = gameFont(22);
  ctx.fillStyle = rgb(COLORS.text);
  ctx.fillText(`${label}: ${Math.round(value * 100)}%`, x, y - 8);
  ctx.fillStyle = rgb(COLORS.gray);
  roundRect(ctx, x, y, w, 12, 6);
  ctx.fill();
  ctx.fillStyle = rgb(COLORS.green);
  roundRect(ctx, x, y, w * value, 12, 6);
  ctx.fill();
  const knobX = x + w * value;
  ctx.beginPath();
  ctx.arc(knobX, y + 6, 10, 0, Math.PI * 2);
  ctx.fillStyle = rgb(COLORS.text);
  ctx.fill();
  return { x: knobX - 10, y: y - 4, w: 20, h: 20 };
}

function sliderValueFromPos(slider, pos) {
  return Math.max(0, Math.min(1, (pos.x - slider.x) / slider.w));
}

function drawXpBar(ctx, save, x, y, w) {
  const prog = xpProgress(save.xp);
  ctx.font = gameFont(20);
  ctx.fillStyle = rgb(COLORS.text);
  ctx.fillText(`LV ${prog.level}  XP ${save.xp}`, x, y);
  ctx.fillStyle = rgb(COLORS.gray);
  roundRect(ctx, x, y + 8, w, 10, 5);
  ctx.fill();
  ctx.fillStyle = rgb(COLORS.purple);
  roundRect(ctx, x, y + 8, w * prog.ratio, 10, 5);
  ctx.fill();
}

function drawCoins(ctx, save, x, y) {
  ctx.font = gameFont(24);
  ctx.fillStyle = rgb(COLORS.gold);
  ctx.fillText(`COINS: ${save.coins}`, x, y);
}

function drawLeaderboardPanel(ctx, save, levelId, x, y, maxEntries = 5) {
  const entries = getLeaderboard(save, levelId);
  ctx.font = gameFont(22);
  ctx.fillStyle = rgb(COLORS.gold);
  ctx.fillText(`STAGE ${levelId} TOP ${LEADERBOARD_SIZE}`, x, y);
  ctx.font = gameFont(16);
  ctx.fillStyle = rgb(COLORS.purple);
  if (!Auth.isLoggedIn()) {
    ctx.fillText("Guest — login to submit scores", x, y + 24);
  } else {
    ctx.fillText(`#1 prize: +${LEADERBOARD_FIRST_PRIZE} coins`, x, y + 24);
  }
  ctx.font = gameFont(18);
  ctx.fillStyle = rgb(COLORS.text);
  if (!entries.length) {
    ctx.fillText("Be first on the board!", x, y + 52);
    return;
  }
  entries.slice(0, maxEntries).forEach((entry, i) => {
    ctx.fillText(`${i + 1}. ${entry.name} — ${entry.score}`, x, y + 52 + i * 22);
  });
}

function homeButtonRect() {
  const size = iconButtonSize();
  return { x: viewW() - size - 16, y: 12, w: size, h: size };
}

function drawHomeButton(ctx, mousePos, hovered) {
  drawIconButton(ctx, homeButtonRect(), UiIcons.home, hovered);
}

function drawModalPanel(ctx, title, lines, btnRect, btnLabel, btnHovered) {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, viewW(), viewH());

  const panelW = 760;
  const panelH = 80 + lines.length * 36 + 90;
  const panelX = (viewW() - panelW) / 2;
  const panelY = (viewH() - panelH) / 2;

  ctx.fillStyle = rgb(COLORS.bg);
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.fill();
  ctx.strokeStyle = rgb(COLORS.blue);
  ctx.lineWidth = 3;
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.stroke();

  ctx.font = gameFont(44);
  ctx.fillStyle = rgb(COLORS.blue);
  ctx.textAlign = "center";
  ctx.fillText(title, viewW() / 2, panelY + 56);

  ctx.font = gameFont(24);
  ctx.fillStyle = rgb(COLORS.text);
  lines.forEach((line, i) => {
    ctx.fillText(line, viewW() / 2, panelY + 100 + i * 36);
  });
  ctx.textAlign = "left";

  drawNeonButton(ctx, btnRect, btnLabel, btnHovered, true);
}
class FloatingText {
  constructor(text, x, y, color, value) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.value = value;
    this.speed = 5;
    this.isDone = false;
    this.targetX = 40;
    this.targetY = 30;
  }

  update() {
    const dirX = this.targetX - this.x;
    const dirY = this.targetY - this.y;
    const dist = Math.hypot(dirX, dirY);
    if (dist <= 15) {
      this.isDone = true;
      return;
    }
    this.x += (dirX / dist) * this.speed;
    this.y += (dirY / dist) * this.speed;
    this.speed += 0.25;
  }

  draw(ctx) {
    ctx.font = gameFont(26);
    ctx.fillStyle = rgb(this.color);
    ctx.fillText(this.text, this.x, this.y);
  }
}

class FlippedTarget {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    const direction = Math.random() < 0.5 ? -1 : 1;
    this.velX = direction * (4 + Math.random() * 4);
    this.velY = -(14 + Math.random() * 6);
    this.gravity = 0.7;
    this.isOffScreen = false;
  }

  update() {
    this.x += this.velX;
    this.velY += this.gravity;
    this.y += this.velY;
    if (this.y > viewH() + 50) this.isOffScreen = true;
  }

  draw(ctx) {
    ctx.strokeStyle = rgb(this.color);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Target {
  constructor(level, isSlider = false) {
    this.type = this._pickType(level, isSlider);

    this.radius = (22 + Math.floor(Math.random() * 10)) * targetRadiusScale();
    this.isActive = false;
    this.isSlider = isSlider;
    this.defused = false;
    this.mobileTapCount = 0;
    this.purpleTapped = false;
    this.confirmExpiresAt = 0;
    this.hitZoneX = viewW() / 2;
    this.pulseAngle = Math.random() * 360;
    this.activatedAt = 0;
    this.expiresAt = 0;
    this.hitWindowMs = level.hitWindowMs;
    this.bombFuse = level.bombFuse;

    if (isSlider) {
      this.y = 180 + Math.random() * (viewH() - 340);
      this.x = Math.random() < 0.5 ? -40 : viewW() + 40;
      this.velX = this.x < 0 ? 5 + level.id * 0.4 : -(5 + level.id * 0.4);
    } else {
      this.x = 100 + Math.random() * (viewW() - 200);
      this.y = 140 + Math.random() * (viewH() - 280);
    }
  }

  _pickType(level, isSlider) {
    const rates = levelTargetRates(level);
    if (isSlider) {
      if (level.sliderRed && Math.random() < rates.sliderRed) return "BOMB";
      return "BALL";
    }
    if (!level.allowRed && !level.allowOrange && !level.allowPurple) return "BALL";
    const roll = Math.random();
    if (level.allowPurple && roll < rates.purple) return "PURPLE";
    if (level.allowOrange && roll < rates.purple + rates.orange) return "ORANGE";
    if (level.allowRed && roll < rates.purple + rates.orange + rates.red) return "BOMB";
    return "BALL";
  }

  activate(now) {
    this.isActive = true;
    this.defused = false;
    this.mobileTapCount = 0;
    this.purpleTapped = false;
    this.activatedAt = now;
    this.expiresAt = now + this.hitWindowMs;
    if (this.type === "BOMB" || this.type === "ORANGE") {
      this.bombExpires = now + this.bombFuse * 1000;
    }
  }

  msLeft(now) {
    if (!this.isActive) return this.hitWindowMs;
    return Math.max(0, this.expiresAt - now);
  }

  bombSecondsLeft(now) {
    if (!this.isBomb() || !this.isActive || this.defused) return this.bombFuse;
    return Math.max(0, (this.bombExpires - now) / 1000);
  }

  isBomb() {
    return this.type === "BOMB" || this.type === "ORANGE";
  }

  isExpired(now) {
    if (!this.isActive) return false;
    if (this.type === "ORANGE" && this.defused) {
      return now >= this.confirmExpiresAt;
    }
    if (this.isBomb() && !this.defused && this.bombSecondsLeft(now) <= 0) return true;
    return this.msLeft(now) <= 0;
  }

  update() {
    if (!this.isSlider || !this.isActive) return;
    this.x += this.velX;
    if (this.x < -80 || this.x > viewW() + 80) this.isOffScreen = true;
  }

  checkClick(pos) {
    const dist = Math.hypot(this.x - pos.x, this.y - pos.y);
    if (dist <= this.radius + hitPadSize()) return "HIT";
    if (dist <= this.radius + SAFE_ZONE_BORDER) return "SAFE_ZONE";
    return "MISS";
  }

  draw(ctx, now) {
    if (this.isSlider && this.isActive) {
      ctx.strokeStyle = rgb(COLORS.gold, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.hitZoneX, this.y - 40);
      ctx.lineTo(this.hitZoneX, this.y + 40);
      ctx.stroke();
    }

    let radius = this.radius;
    if (!this.isActive) {
      ctx.fillStyle = "rgb(35,35,45)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgb(COLORS.gray);
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const colors = this._colors();
    const mainColor = colors.main;
    const glowColor = colors.glow;
    const urgency = 1 - this.msLeft(now) / this.hitWindowMs;

    if (this.isBomb() && !this.defused) {
      this.pulseAngle += 0.12;
      radius += Math.floor((3 + 5 * urgency) * Math.sin(this.pulseAngle));
    }

    if (this.type === "ORANGE" && this.defused) {
      ctx.strokeStyle = rgb(COLORS.green);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.type === "PURPLE" && this.purpleTapped) {
      ctx.strokeStyle = rgb(COLORS.green);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgb(40,35,65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + SAFE_ZONE_BORDER, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = rgb(glowColor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = rgb(mainColor);
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    const ringPct = this.type === "ORANGE" && this.defused
      ? Math.max(0, (this.confirmExpiresAt - now) / 2200)
      : this.msLeft(now) / this.hitWindowMs;
    ctx.strokeStyle = rgb(ringPct < 0.3 ? COLORS.red : COLORS.text);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringPct);
    ctx.stroke();

    if (this.isBomb() && !this.defused) {
      const fuseLeft = this.bombSecondsLeft(now);
      ctx.font = gameFont(22);
      ctx.fillStyle = rgb(fuseLeft <= 1.5 ? COLORS.red : COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(String(Math.ceil(fuseLeft)), this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (this.type === "ORANGE" && this.defused) {
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.green);
      ctx.textAlign = "center";
      ctx.fillText(Input.touchMode ? `${this.mobileTapCount}/3` : "TAP!", this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (Input.touchMode && this.isBomb() && !this.defused && this.mobileTapCount > 0) {
      const needed = this.type === "ORANGE" ? 3 : 2;
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(`${this.mobileTapCount}/${needed}`, this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (this.type === "PURPLE" && !this.purpleTapped) {
      ctx.font = gameFont(18);
      ctx.fillStyle = rgb(COLORS.gold);
      ctx.textAlign = "center";
      const hint = Input.touchMode ? "BOTH!" : "MID";
      ctx.fillText(hint, this.x, this.y + radius + 28);
      ctx.textAlign = "left";
    }
  }

  _colors() {
    if (this.type === "PURPLE") return { main: COLORS.purple, glow: COLORS.purpleGlow };
    if (this.type === "BALL") return { main: COLORS.blue, glow: COLORS.blueGlow };
    if (this.type === "ORANGE") return { main: COLORS.orange, glow: COLORS.orangeGlow };
    return { main: COLORS.red, glow: COLORS.redGlow };
  }
}

function createStartTarget() {
  const baseRadius = Input.touchMode ? 44 : 34;
  return {
    x: viewW() / 2,
    y: viewH() / 2,
    radius: Math.round(baseRadius * accessibilityScale()),
    pulseAngle: 0,
    update() {
      this.pulseAngle += 0.1;
    },
    checkClick(pos) {
      const dist = Math.hypot(this.x - pos.x, this.y - pos.y);
      if (dist <= this.radius + hitPadSize()) return "HIT";
      return "MISS";
    },
    draw(ctx) {
      const radius = this.radius + Math.sin(this.pulseAngle) * 5;
      ctx.strokeStyle = rgb(COLORS.blueGlow);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = rgb(COLORS.blue);
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgb(COLORS.text);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = gameFont(24);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText("CLICK TO START", this.x, this.y - radius - 22);
      ctx.textAlign = "left";
    },
  };
}

function createGame(level, now) {
  return {
    level,
    infinite: !!level.infinite,
    started: false,
    startTarget: createStartTarget(),
    currentTarget: new Target(level, false),
    nextTarget: new Target(level, shouldSpawnSlider(level)),
    floatingTexts: [],
    flippedTargets: [],
    score: 0,
    combo: 0,
    comboPeak: 0,
    timeLimit: level.infinite ? 0 : STAGE_TIME_SECONDS,
    timeLeft: level.infinite ? null : STAGE_TIME_SECONDS,
    stageEndAt: 0,
    startTime: 0,
    running: true,
    paused: false,
    beatCount: 0,
    lastRewards: null,
    graceUntil: 0,
    purplePartner: null,
    purpleTapMain: 0,
    purpleTapPartner: 0,
  };
}
const AudioEngine = {
  ctx: null,
  musicGain: null,
  sfxGain: null,
  musicNodes: [],
  mp3Audio: null,
  beatInterval: null,
  onBeat: null,
  playing: false,
  mode: null,
  bpm: 80,
  baseMusicVolume: 0.55,
  baseSfxVolume: 0.7,

  init(settings) {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.setVolumes(settings);
    } catch {}
  },

  setVolumes(settings) {
    if (!this.musicGain) return;
    this.baseMusicVolume = settings.musicVolume;
    this.baseSfxVolume = settings.sfxVolume;
    this.musicGain.gain.value = settings.musicVolume;
    this.sfxGain.gain.value = settings.sfxVolume;
  },

  setMusicFade(secondsLeft, fadeDuration) {
    const ratio = Math.max(0, Math.min(1, secondsLeft / fadeDuration));
    const vol = this.baseMusicVolume * ratio;
    if (this.musicGain) this.musicGain.gain.value = vol;
    if (this.mp3Audio && !this.musicNodes.length) this.mp3Audio.volume = vol;
  },

  resetMusicVolume() {
    if (!this.musicGain) return;
    this.musicGain.gain.value = this.baseMusicVolume;
    if (this.mp3Audio && !this.musicNodes.length) this.mp3Audio.volume = this.baseMusicVolume;
  },

  async resume() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
  },

  stopMusic() {
    this.playing = false;
    this.mode = null;
    clearInterval(this.beatInterval);
    this.beatInterval = null;
    this.onBeat = null;
    for (const node of this.musicNodes) {
      try { node.stop?.(); node.disconnect?.(); } catch {}
    }
    this.musicNodes = [];
    if (this.mp3Audio) {
      this.mp3Audio.pause();
      this.mp3Audio = null;
    }
  },

  startMenuMusic() {
    this.stopMusic();
    this.mode = "menu";
    this.playing = true;
    this._playMusicFile(MUSIC_MENU, MENU_MUSIC_FALLBACK);
  },

  startLevelMusic(level, onBeat) {
    this.stopMusic();
    this.onBeat = onBeat;
    this.bpm = level.bpm;
    this.mode = "level";
    this.playing = true;
    this.resetMusicVolume();
    this._playMusicFile(MUSIC_LEVEL(level), null, () => {
      if (level.musicId === "track1") this._playMusicFile(null, MENU_MUSIC_FALLBACK);
      else if (this.ctx) this._playProceduralTrack(level.musicId, level.bpm);
    });
    const beatMs = 60000 / level.bpm;
    let beat = 0;
    this.onBeat?.(beat);
    this.beatInterval = setInterval(() => {
      if (!this.playing || this.mode !== "level") return;
      beat += 1;
      this.onBeat?.(beat);
    }, beatMs);
  },

  _playMusicFile(basePath, fallback, onFail) {
    const paths = [];
    if (basePath) {
      paths.push(`${basePath}.mp3`, `${basePath}.ogg`, `${basePath}.wav`);
    }
    if (fallback) paths.push(fallback);
    this._tryPlayPaths(paths, 0, onFail);
  },

  _tryPlayPaths(paths, index, onFail) {
    if (index >= paths.length) {
      onFail?.();
      return;
    }
    const audio = new Audio(paths[index]);
    audio.loop = true;
    const tryNext = () => this._tryPlayPaths(paths, index + 1, onFail);
    audio.addEventListener("error", tryNext, { once: true });
    audio.play().then(() => {
      this.mp3Audio = audio;
      if (this.ctx && this.musicGain) {
        try {
          const track = this.ctx.createMediaElementSource(audio);
          track.connect(this.musicGain);
          this.musicNodes.push(track);
        } catch {
          audio.volume = 0.55;
        }
      } else {
        audio.volume = 0.55;
      }
    }).catch(tryNext);
  },

  _playProceduralTrack(trackId, bpm) {
    const num = parseInt(String(trackId).replace("track", ""), 10) || 2;
    const p = {
      bass: 50 + num * 4,
      lead: 200 + num * 12,
      pad: 300 + num * 16,
    };
    const beatSec = 60 / bpm;
    const loopBeats = 16;
    const loopDur = beatSec * loopBeats;
    const now = this.ctx.currentTime;
    this._scheduleBassLoop(p.bass, beatSec, loopBeats, now, loopDur);
    this._scheduleLeadLoop(p.lead, beatSec, loopBeats, now, loopDur);
    this._schedulePad(p.pad, now, loopDur);
  },

  _scheduleBassLoop(freq, beatSec, beats, start, loopDur) {
    for (let i = 0; i < beats * 2; i++) {
      const t = start + (i % beats) * beatSec + Math.floor(i / beats) * loopDur;
      if (i % 2 === 0) this._playMusicTone(freq, t, beatSec * 0.4, "sine", 0.18);
    }
  },

  _scheduleLeadLoop(freq, beatSec, beats, start, loopDur) {
    const pattern = [0, 3, 2, 5, 7, 5, 3, 0];
    for (let loop = 0; loop < 2; loop++) {
      pattern.forEach((step, i) => {
        const t = start + loop * loopDur + step * beatSec;
        this._playMusicTone(freq * (1 + i * 0.02), t, beatSec * 0.15, "triangle", 0.06);
      });
    }
  },

  _schedulePad(freq, start, loopDur) {
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start + i * loopDur);
      gain.gain.linearRampToValueAtTime(0.035, start + i * loopDur + 0.3);
      gain.gain.linearRampToValueAtTime(0, start + (i + 1) * loopDur);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(start + i * loopDur);
      osc.stop(start + (i + 1) * loopDur);
      this.musicNodes.push(osc);
    }
  },

  _playMusicTone(freq, time, dur, type, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
    this.musicNodes.push(osc);
  },

  _playSfx(freq, dur, type, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch {}
    };
  },

  playHit() { this._playSfx(880, 0.08, "square", 0.12); },
  playMiss() { this._playSfx(120, 0.15, "sawtooth", 0.1); },
  playDefuse() { this._playSfx(440, 0.12, "triangle", 0.1); },
};
const GameLogic = {
  beginGame(game, now) {
    if (!game || game.started) return;
    game.started = true;
    game.startTime = now;
    game.graceUntil = now + 1500;
    game.currentTarget.activate(now);
    this._syncPurplePair(game, now);
    if (!game.infinite) {
      game.timeLimit = STAGE_TIME_SECONDS;
      game.stageEndAt = now + STAGE_TIME_SECONDS * 1000;
      game.timeLeft = STAGE_TIME_SECONDS;
    }
    AudioEngine.resetMusicVolume();
    AudioEngine.startLevelMusic(game.level, () => this.onBeatSpawn(game, performance.now()));
  },

  onBeatSpawn(game, now) {
    if (!game?.running || game.paused || !game.started) return;
    game.beatCount += 1;
    if (!game.currentTarget.isActive) {
      game.currentTarget.activate(now);
      return;
    }
    if (game.beatCount % 4 === 0) {
      game.nextTarget = new Target(game.level, shouldSpawnSlider(game.level));
    }
  },

  handleClick(game, button, pos, now) {
    if (!game.started) {
      if (Input.resolveButton(button) !== "ball") return null;
      if (game.startTarget.checkClick(pos) === "HIT") return "begin";
      return null;
    }

    const action = Input.resolveButton(button);
    if (!action) return;

    if (game.currentTarget.type === "PURPLE") {
      this._handlePurplePair(game, button, pos, now);
      return;
    }

    const result = game.currentTarget.checkClick(pos);
    if (result === "MISS") {
      this._registerMiss(game, pos);
      return;
    }
    if (result !== "HIT") return;

    if (Input.touchMode && game.currentTarget.type === "ORANGE") {
      this._handleMobileOrange(game, action, now);
      return;
    }
    if (Input.touchMode && game.currentTarget.type === "BOMB") {
      this._handleMobileBomb(game, action, now);
      return;
    }

    if (game.currentTarget.type === "ORANGE") {
      this._handleOrange(game, action, now);
      return;
    }

    this._resolveHit(game, action, now);
  },

  _handlePurplePair(game, button, pos, now) {
    const main = game.currentTarget;
    const partner = game.purplePartner;
    if (!partner) return;

    if (!Input.touchMode && Input.resolveButton(button) !== "purple") {
      const mainHit = main.checkClick(pos);
      const partnerHit = partner.checkClick(pos);
      if (mainHit === "HIT" || partnerHit === "HIT") this._wrongHit(game, main);
      return;
    }

    const mainHit = main.checkClick(pos);
    const partnerHit = partner.checkClick(pos);

    if (mainHit === "SAFE_ZONE" || partnerHit === "SAFE_ZONE") {
      this._resetPurplePair(game);
      this._registerMiss(game, pos);
      return;
    }
    if (mainHit !== "HIT" && partnerHit !== "HIT") return;

    if (mainHit === "HIT" && !game.purpleTapMain) {
      game.purpleTapMain = now;
      main.purpleTapped = true;
    }
    if (partnerHit === "HIT" && !game.purpleTapPartner) {
      game.purpleTapPartner = now;
      partner.purpleTapped = true;
    }

    if (!game.purpleTapMain || !game.purpleTapPartner) {
      AudioEngine.playDefuse();
      return;
    }
    if (Math.abs(game.purpleTapMain - game.purpleTapPartner) > PURPLE_DUAL_WINDOW_MS) {
      this._resetPurplePair(game);
      this._wrongHit(game, main);
      return;
    }

    this._resetPurplePair(game);
    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo + 1;
    game.floatingTexts.push(new FloatingText(`+${points}`, main.x, main.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, main, COLORS.purple, now);
    if (partner) game.flippedTargets.push(new FlippedTarget(partner.x, partner.y, partner.radius, COLORS.purple));
  },

  _resetPurplePair(game) {
    if (game.currentTarget?.type === "PURPLE") game.currentTarget.purpleTapped = false;
    if (game.purplePartner) game.purplePartner.purpleTapped = false;
    game.purplePartner = null;
    game.purpleTapMain = 0;
    game.purpleTapPartner = 0;
  },

  _syncPurplePair(game, now) {
    this._resetPurplePair(game);
    const target = game.currentTarget;
    if (target.type !== "PURPLE") return;

    const partner = new Target(game.level, false);
    partner.type = "PURPLE";
    let attempts = 0;
    while (attempts < 24) {
      partner.x = 100 + Math.random() * (viewW() - 200);
      partner.y = 140 + Math.random() * (viewH() - 280);
      if (Math.hypot(partner.x - target.x, partner.y - target.y) >= 140) break;
      attempts += 1;
    }
    partner.expiresAt = target.expiresAt;
    partner.activate(now);
    partner.expiresAt = target.expiresAt;
    game.purplePartner = partner;
  },

  _handleMobileBomb(game, action, now) {
    const target = game.currentTarget;
    if (action !== "ball") {
      target.mobileTapCount = 0;
      this._wrongHit(game, target);
      return;
    }

    target.mobileTapCount += 1;
    if (target.mobileTapCount < 2) {
      game.floatingTexts.push(new FloatingText(`${target.mobileTapCount}/2`, target.x, target.y - 20, COLORS.text, 0));
      AudioEngine.playDefuse();
      return;
    }

    target.mobileTapCount = 0;
    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.red, now);
  },

  _handleMobileOrange(game, action, now) {
    const target = game.currentTarget;
    if (action !== "ball") {
      target.mobileTapCount = 0;
      target.defused = false;
      this._wrongHit(game, target);
      return;
    }

    target.mobileTapCount += 1;
    if (target.mobileTapCount === 1) {
      game.floatingTexts.push(new FloatingText("1/3", target.x, target.y - 20, COLORS.text, 0));
      AudioEngine.playDefuse();
      return;
    }
    if (target.mobileTapCount === 2) {
      target.defused = true;
      target.confirmExpiresAt = now + 2200;
      game.floatingTexts.push(new FloatingText("2/3", target.x, target.y - 20, COLORS.text, 0));
      AudioEngine.playDefuse();
      return;
    }

    target.mobileTapCount = 0;
    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo + 2;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.orange, now);
  },

  _handleOrange(game, action, now) {
    const target = game.currentTarget;

    if (!target.defused) {
      if (action !== "bomb") {
        this._wrongHit(game, target);
        return;
      }
      target.defused = true;
      target.confirmExpiresAt = now + 2200;
      game.floatingTexts.push(new FloatingText("CLICK!", target.x, target.y - 20, COLORS.green, 0));
      AudioEngine.playDefuse();
      return;
    }

    if (action !== "ball") {
      this._wrongHit(game, target);
      return;
    }

    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo + 2;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.orange, now);
  },

  _resolveHit(game, action, now) {
    const target = game.currentTarget;
    const needsBall = target.type === "BALL";
    const isCorrect = (needsBall && action === "ball") || (!needsBall && action === "bomb");

    if (!isCorrect) {
      this._wrongHit(game, target);
      return;
    }

    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    const color = target.type === "BALL" ? COLORS.blue : COLORS.red;
    this._advanceTarget(game, target, color, now);
  },

  _wrongHit(game, target) {
    if (target.mobileTapCount !== undefined) target.mobileTapCount = 0;
    if (target.defused) target.defused = false;
    this._resetPurplePair(game);
    game.combo = 0;
    game.floatingTexts.push(new FloatingText("-1", target.x, target.y, COLORS.red, -1));
    AudioEngine.playMiss();
  },

  _advanceTarget(game, target, color, now) {
    this._resetPurplePair(game);
    game.flippedTargets.push(new FlippedTarget(target.x, target.y, target.radius, color));
    game.currentTarget = game.nextTarget;
    game.currentTarget.activate(now);
    this._syncPurplePair(game, now);
    game.nextTarget = new Target(game.level, shouldSpawnSlider(game.level));
  },

  _registerMiss(game, pos) {
    game.combo = 0;
    game.floatingTexts.push(new FloatingText("-1", pos.x, pos.y, COLORS.red, -1));
    AudioEngine.playMiss();
  },

  update(game, now) {
    if (!game?.running || game.paused) return null;
    if (!game.started) {
      game.startTarget.update();
      return null;
    }

    if (game.infinite) {
      game.timeLeft = null;
    } else {
      const msLeft = game.stageEndAt - now;
      const secondsLeft = msLeft / 1000;
      game.timeLeft = Math.max(0, Math.ceil(secondsLeft));
      if (secondsLeft <= MUSIC_FADE_SECONDS) {
        AudioEngine.setMusicFade(secondsLeft, MUSIC_FADE_SECONDS);
      }
      if (msLeft <= 0) return "time";
    }
    if (game.currentTarget.isOffScreen) return "expired";
    if (!game.graceUntil || now > game.graceUntil) {
      if (game.currentTarget.isExpired(now)) return "expired";
    }

    game.currentTarget.update();

    for (const ft of [...game.floatingTexts]) {
      ft.update();
      if (ft.isDone && ft.value !== 0) {
        game.score += ft.value;
      }
      if (ft.isDone) {
        game.floatingTexts.splice(game.floatingTexts.indexOf(ft), 1);
      }
    }

    for (const pt of [...game.flippedTargets]) {
      pt.update();
      if (pt.isOffScreen) game.flippedTargets.splice(game.flippedTargets.indexOf(pt), 1);
    }
    return null;
  },

  finish(game, save) {
    game.running = false;
    AudioEngine.stopMusic();
    game.lastRewards = finishGameRewards(save, game);
    if (game.level.infinite) {
      updateInfiniteHighScore(save, musicLevelId(game.level), game.score);
    } else {
      updateHighScore(save, game.level.id, game.score);
    }
    return game.lastRewards;
  },

  drawHud(ctx, game, level, save) {
    ctx.font = gameFont(36);
    ctx.fillStyle = rgb(COLORS.text);
    ctx.fillText(`SCORE: ${game.score}`, 20, 55);

    if (!game.started) {
      ctx.fillStyle = rgb(COLORS.gold);
      const ready = game.infinite ? "INFINITE — READY" : `TIME: ${STAGE_TIME_SECONDS}s`;
      ctx.fillText(ready, viewW() - ctx.measureText(ready).width - 20, 55);
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.fillText(`${level.name}  BPM ${level.bpm}`, 20, 82);
      return;
    }

    ctx.fillStyle = rgb(game.combo >= 3 ? COLORS.green : COLORS.text);
    const comboText = `COMBO: x${game.combo}`;
    ctx.fillText(comboText, (viewW() - ctx.measureText(comboText).width) / 2, 55);

    if (game.infinite) {
      const best = save.infiniteHighScores?.[String(musicLevelId(level))] || 0;
      ctx.fillStyle = rgb(COLORS.gold);
      const bestText = `BEST: ${best}`;
      ctx.fillText(bestText, viewW() - ctx.measureText(bestText).width - 20, 55);
    } else {
      ctx.fillStyle = rgb(game.timeLeft <= 10 ? COLORS.red : COLORS.text);
      const timeText = `TIME: ${game.timeLeft}s`;
      ctx.fillText(timeText, viewW() - ctx.measureText(timeText).width - 20, 55);

      ctx.font = gameFont(20);
      const goalMet = game.score >= level.passScore;
      ctx.fillStyle = rgb(goalMet ? COLORS.green : COLORS.gold);
      const goalText = `GOAL: ${game.score}/${level.passScore}`;
      ctx.fillText(goalText, viewW() - ctx.measureText(goalText).width - 20, 82);
    }

    ctx.font = game.infinite ? gameFont(36) : gameFont(20);
    ctx.fillStyle = rgb(COLORS.text);
    ctx.fillText(`${level.name}  BPM ${level.bpm}`, 20, 82);
  },

  drawMobileControls(ctx, level) {
    if (!Input.touchMode) return;
    Input.setMobileZones(null, null);
    const needsMultiTap = level.allowRed || level.allowOrange || level.allowPurple || level.sliderRed;
    if (!needsMultiTap) return;
    ctx.font = gameFont(16);
    ctx.fillStyle = rgb(COLORS.text);
    const hint = level.allowPurple
      ? "RED: 2 taps  |  ORANGE: 3 taps  |  PURPLE: get BOTH within 1s"
      : "RED: 2 taps  |  ORANGE: 3 taps";
    ctx.fillText(hint, (viewW() - ctx.measureText(hint).width) / 2, viewH() - 40);
  },
};
const SHARE_GAME_URL = "https://www.joseph-weiss.com/cybertime/";

const Share = {
  buildMessage(score, level) {
    if (level?.infinite) {
      return `I got ${score} points in CyberTime Infinite! Can you beat me?`;
    }
    return `I got ${score} points in CyberTime! Can you beat me?`;
  },

  async shareScore(score, level) {
    const message = this.buildMessage(score, level);
    const payload = `${message}\n${SHARE_GAME_URL}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "CyberTime", text: message, url: SHARE_GAME_URL });
        return "shared";
      } catch (err) {
        if (err?.name === "AbortError") return null;
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload);
        return "copied";
      } catch {}
    }

    return null;
  },
};
const Screens = {
  buttons: {},
  clickAreas: {},
  sliders: {},
  shopTab: "skins",
  selectedLevel: 1,
  waitingKey: null,
  scrollY: 0,
  listMaxScroll: 0,
  draggingSlider: false,
  scrollDrag: null,
  infiniteSetup: { trackId: 1, mechanicIndex: 2, red: true, orange: true, sliders: false, sliderRed: false },
  shareFeedback: "",

  resetButtons() {
    this.buttons = {};
  },

  btn(id, label, x, y, w = null, h = 52) {
    const rect = buttonRect(App.ctx, label, x, y, w, h);
    this.buttons[id] = rect;
    return rect;
  },

  menuLayout() {
    const count = 6;
    const headerBottom = Input.touchMode ? 252 : 268;
    const footer = Input.touchMode ? 40 : 28;
    const gap = Input.touchMode ? 14 : 10;
    const avail = viewH() - headerBottom - footer;
    const btnH = Math.min(btnHeight(Input.touchMode ? 62 : 56), Math.floor((avail - gap * (count - 1)) / count));
    const blockH = count * btnH + gap * (count - 1);
    return {
      pad: this.screenPad(),
      btnH,
      top: headerBottom + Math.floor((avail - blockH) / 2),
      gap,
      titleSize: Input.touchMode ? 80 : 92,
    };
  },

  menuBtnY(index) {
    const start = Input.touchMode ? 290 : 340;
    const gap = Input.touchMode ? 84 : 65;
    return start + index * gap;
  },

  playBtnSize() {
    return Input.touchMode ? { w: 180, h: 62 } : { w: 140, h: 44 };
  },

  listRowHeight() {
    return Input.touchMode ? 84 : 76;
  },

  listTop() {
    return 120;
  },

  listViewportHeight() {
    return viewH() - 160;
  },

  updateListScrollMax(count) {
    const content = this.listTop() + count * this.listRowHeight();
    this.listMaxScroll = Math.max(0, content - (viewH() - 90));
    this.scrollY = Math.min(this.scrollY, this.listMaxScroll);
  },

  scrollList(delta) {
    this.scrollY = Math.max(0, Math.min(this.listMaxScroll, this.scrollY + delta));
  },

  scrollableState(state) {
    if (!Input.touchMode) return false;
    return state === "levels" || state === "shop";
  },

  beginScrollDrag(y) {
    this.scrollDrag = { startY: y, startScroll: this.scrollY };
  },

  updateScrollDrag(y) {
    if (!this.scrollDrag) return false;
    const delta = this.scrollDrag.startY - y;
    this.scrollY = Math.max(0, Math.min(this.listMaxScroll, this.scrollDrag.startScroll + delta));
    return Math.abs(delta) > 8;
  },

  endScrollDrag() {
    const dragged = !!this.scrollDrag?.dragged;
    this.scrollDrag = null;
    return dragged;
  },

  resetScroll() {
    this.scrollY = 0;
    this.listMaxScroll = 0;
  },

  defaultInfiniteSetup() {
    const setup = { trackId: 1, mechanicIndex: 2 };
    applyInfiniteMechanicPreset(setup, setup.mechanicIndex);
    return setup;
  },

  drawInfiniteCycleBlock(label, valueText, btnId, x, y, w, mousePos) {
    const btnH = btnHeight(Input.touchMode ? 52 : 44);
    const labelSize = Input.touchMode ? 20 : 22;
    const valueSize = Input.touchMode ? 24 : 28;
    const labelY = y;
    const valueY = y + (Input.touchMode ? 34 : 38);
    const btnY = y + (Input.touchMode ? 68 : 72);

    App.ctx.font = uiFont(labelSize);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.fillText(label, x, labelY);

    App.ctx.font = uiFont(valueSize);
    App.ctx.fillStyle = rgb(COLORS.text);
    const valueW = App.ctx.measureText(valueText).width;
    App.ctx.fillText(valueText, x + (w - valueW) / 2, valueY);

    const rect = this.btn(btnId, "NEXT", x, btnY, w, btnH);
    drawNeonButton(App.ctx, rect, "NEXT", pointInRect(mousePos, rect), true);
    return btnY + btnH + (Input.touchMode ? 28 : 32);
  },

  screenPad() {
    return Input.touchMode ? 32 : 80;
  },

  shopRowHeight() {
    return Input.touchMode ? 168 : 130;
  },

  shopListTop() {
    return Input.touchMode ? 188 : 190;
  },

  updateShopScroll(count) {
    const content = this.shopListTop() + count * this.shopRowHeight();
    this.listMaxScroll = Math.max(0, content - (viewH() - 120));
    this.scrollY = Math.min(this.scrollY, this.listMaxScroll);
  },

  finishButtons() {
    this.clickAreas = { ...this.buttons };
  },

  canShareGame(game) {
    const r = game?.lastRewards;
    if (!r || game.score <= 0) return false;
    return r.success || r.infinite;
  },

  drawCenteredLines(ctx, lines, y, fontSize, color) {
    ctx.font = uiFont(fontSize);
    ctx.fillStyle = rgb(color);
    let drawY = y;
    lines.forEach((line) => {
      ctx.fillText(line, (viewW() - ctx.measureText(line).width) / 2, drawY);
      drawY += fontSize + 10;
    });
    return drawY;
  },

  drawMenu(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    const layout = this.menuLayout();

    App.ctx.font = gameFont(layout.titleSize);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText(GAME_NAME, (viewW() - App.ctx.measureText(GAME_NAME).width) / 2, Input.touchMode ? 100 : 110);

    App.ctx.font = uiFont(Input.touchMode ? 18 : 20);
    App.ctx.fillStyle = rgb(COLORS.gold);
    const userLine = Auth.isLoggedIn()
      ? `PLAYER: ${Auth.displayName}`
      : "GUEST — login in Settings for leaderboard";
    App.ctx.fillText(userLine, (viewW() - App.ctx.measureText(userLine).width) / 2, Input.touchMode ? 138 : 155);

    drawXpBar(App.ctx, save, layout.pad, Input.touchMode ? 168 : 178, Math.min(320, viewW() - layout.pad * 2 - 140));
    drawCoins(App.ctx, save, viewW() - layout.pad - 120, Input.touchMode ? 182 : 192);

    App.ctx.font = uiFont(Input.touchMode ? 22 : 28);
    App.ctx.fillStyle = rgb(COLORS.text);
    const best = save.highScores[1] || 0;
    const hs = `HIGH SCORE: ${best}`;
    App.ctx.fillText(hs, (viewW() - App.ctx.measureText(hs).width) / 2, Input.touchMode ? 228 : 248);

    const labels = [
      ["start", "START"],
      ["levels", "LEVELS"],
      ["infinite", "INFINITE"],
      ["shop", "SHOP"],
      ["settings", "SETTINGS"],
      ["howto", "HOW TO PLAY"],
    ];
    let y = layout.top;
    labels.forEach(([id, label]) => {
      const small = id === "howto";
      const rect = this.btn(id, label, null, y, null, layout.btnH);
      drawNeonButton(App.ctx, rect, label, pointInRect(mousePos, rect), small);
      y += layout.btnH + layout.gap;
    });

    if (Input.touchMode) {
      App.ctx.font = uiFont(14);
      App.ctx.fillStyle = rgb(COLORS.green);
      const mobileHint = "MOBILE — tap targets directly";
      App.ctx.fillText(mobileHint, (viewW() - App.ctx.measureText(mobileHint).width) / 2, viewH() - 24);
    }
    this.finishButtons();
  },

  drawLevels(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = gameFont(48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SELECT STAGE", 80, 80);
    App.ctx.font = gameFont(18);
    App.ctx.fillStyle = rgb(COLORS.gray);
    App.ctx.fillText(`${LEVELS.length} stages — ${Input.touchMode ? "swipe to scroll" : "scroll with mouse wheel"}`, 80, 108);

    this.updateListScrollMax(LEVELS.length);
    const rowH = this.listRowHeight();
    const top = this.listTop();
    const play = this.playBtnSize();

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, top - 8, viewW(), this.listViewportHeight());
    App.ctx.clip();

    LEVELS.forEach((level) => {
      const i = level.id - 1;
      const y = top + i * rowH - this.scrollY;
      if (y + rowH < top || y > viewH() - 40) return;

      const unlocked = isLevelUnlocked(save, level);
      const cleared = isLevelCleared(save, level.id);
      const hs = save.highScores[level.id] || 0;
      const rect = this.btn(`level-${level.id}`, unlocked ? "PLAY" : "LOCKED", viewW() - play.w - 24, y - 8, play.w, play.h);

      App.ctx.font = gameFont(26);
      App.ctx.fillStyle = rgb(unlocked ? COLORS.text : COLORS.gray);
      App.ctx.fillText(`${level.id}. ${level.name}${cleared ? " ✓" : ""}`, 80, y + 18);
      App.ctx.font = gameFont(16);
      App.ctx.fillText(`GOAL ${level.passScore} | 30s | HS ${hs}`, 80, y + 42);
      App.ctx.fillStyle = rgb(COLORS.purple);
      App.ctx.fillText(level.featureHint, 80, y + 62);

      if (unlocked) {
        drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
      } else {
        const prev = getLevelById(level.id - 1);
        App.ctx.fillStyle = rgb(COLORS.gray);
        App.ctx.fillText(`Clear stage ${prev.id} (${prev.passScore} pts)`, 80, y + 62);
      }
    });

    App.ctx.restore();

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, viewH() - 70), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawLevelLeaderboard(save, levelId, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    const level = getLevelById(levelId);
    const entries = getLeaderboard(save, levelId);
    const header = Auth.isLoggedIn()
      ? [`#1 prize: +${LEADERBOARD_FIRST_PRIZE} coins (once per stage)`]
      : ["Login to submit scores to the leaderboard"];
    const lines = entries.length
      ? entries.slice(0, LEADERBOARD_SIZE).map((entry, i) => `${i + 1}. ${entry.name} — ${entry.score}`)
      : ["No scores yet — clear this stage first!"];

    const btn = this.btn("lbClose", "BACK", null, null, 220, 52);
    btn.y = viewH() / 2 + 40 + (header.length + lines.length) * 36;
    drawModalPanel(
      App.ctx,
      `STAGE ${levelId} LEADERBOARD`,
      [level.name, "", ...header, "", ...lines],
      btn,
      "BACK",
      pointInRect(mousePos, btn),
    );
    this.finishButtons();
  },

  drawInfiniteSelect(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    const setup = this.infiniteSetup;
    const level = getLevelById(setup.trackId);
    const modeKey = buildInfiniteModeKey(setup.trackId, setup);
    const best = save.infiniteHighScores?.[modeKey] || 0;
    const pad = this.screenPad();
    const blockW = Input.touchMode ? viewW() - pad * 2 : 420;
    const blockX = Input.touchMode ? pad : 80;

    App.ctx.font = uiFont(Input.touchMode ? 40 : 48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("INFINITE MODE", blockX, Input.touchMode ? 72 : 80);
    App.ctx.font = uiFont(Input.touchMode ? 18 : 20);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText("Tap NEXT to cycle track and mechanics", blockX, Input.touchMode ? 102 : 115);

    let y = Input.touchMode ? 138 : 165;
    y = this.drawInfiniteCycleBlock(
      "TRACK",
      `${level.id}. ${level.name}`,
      "infCycleTrack",
      blockX,
      y,
      blockW,
      mousePos,
    );
    y = this.drawInfiniteCycleBlock(
      "MECHANICS",
      infiniteMechanicName(setup),
      "infCycleMechanics",
      blockX,
      y,
      blockW,
      mousePos,
    );

    App.ctx.font = uiFont(Input.touchMode ? 18 : 20);
    App.ctx.fillStyle = rgb(COLORS.green);
    App.ctx.fillText(`BEST SCORE: ${best}`, blockX, y + 8);

    const playW = Input.touchMode ? viewW() - pad * 2 : 260;
    const playX = Input.touchMode ? pad : null;
    const play = this.btn("infPlay", "PLAY", playX, viewH() - (Input.touchMode ? 200 : 150), playW, btnHeight(Input.touchMode ? 60 : 56));
    drawNeonButton(App.ctx, play, "PLAY", pointInRect(mousePos, play));
    drawNeonButton(
      App.ctx,
      this.btn("back", "BACK", playX, viewH() - (Input.touchMode ? 120 : 70), playW, btnHeight(52)),
      "BACK",
      pointInRect(mousePos, this.buttons.back),
    );
    this.finishButtons();
  },

  drawTutorial(tutorial, mousePos, now, save) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    const btn = this.btn("tutorialGo", "GOT IT", null, null, Input.touchMode ? 280 : 220, btnHeight(52));
    btn.y = viewH() / 2 + 80 + tutorial.lines.length * 18;
    drawModalPanel(
      App.ctx,
      tutorial.title,
      tutorial.lines,
      btn,
      "GOT IT",
      pointInRect(mousePos, btn),
    );
    this.buttons.tutorialGo = btn;
    this.finishButtons();
  },

  drawShop(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    const pad = this.screenPad();
    const items = this.shopTab === "skins" ? MOUSE_SKINS : BACKGROUNDS;

    if (Input.touchMode) {
      App.ctx.font = uiFont(40);
      App.ctx.fillStyle = rgb(COLORS.blue);
      App.ctx.fillText("SHOP", pad, 72);
      drawCoins(App.ctx, save, viewW() - 210, 72);

      const tabW = (viewW() - pad * 2 - 12) / 2;
      const tabH = btnHeight(48);
      drawNeonButton(App.ctx, this.btn("tabSkins", "SKINS", pad, 108, tabW, tabH), "SKINS", this.shopTab === "skins", true);
      drawNeonButton(App.ctx, this.btn("tabBgs", "BGS", pad + tabW + 12, 108, tabW, tabH), "BGS", this.shopTab === "backgrounds", true);

      this.updateShopScroll(items.length);
      const rowH = this.shopRowHeight();
      const listTop = this.shopListTop();
      const cardW = viewW() - pad * 2;
      const actionH = btnHeight(48);

      App.ctx.save();
      App.ctx.beginPath();
      App.ctx.rect(0, listTop - 8, viewW(), viewH() - listTop - 100);
      App.ctx.clip();

      items.forEach((item, i) => {
        const y = listTop + i * rowH - this.scrollY;
        if (y + rowH < listTop || y > viewH() - 80) return;

        const owned = this.shopTab === "skins"
          ? save.ownedSkins.includes(item.id)
          : save.ownedBackgrounds.includes(item.id);
        const equipped = this.shopTab === "skins"
          ? save.equippedSkin === item.id
          : save.equippedBackground === item.id;

        App.ctx.fillStyle = "rgba(20,20,32,0.55)";
        App.ctx.fillRect(pad, y, cardW, rowH - 12);

        App.ctx.font = uiFont(24);
        App.ctx.fillStyle = rgb(COLORS.text);
        App.ctx.fillText(item.name, pad + 16, y + 34);
        App.ctx.font = uiFont(17);
        App.ctx.fillStyle = rgb(owned ? COLORS.green : COLORS.gold);
        App.ctx.fillText(owned ? (equipped ? "EQUIPPED" : "OWNED") : `${item.price} COINS`, pad + 16, y + 62);

        if (this.shopTab === "skins") {
          drawCursor(App.ctx, { x: pad + cardW - 72, y: y + 28 }, item);
        } else {
          App.ctx.fillStyle = rgb(item.accent);
          App.ctx.fillRect(pad + cardW - 88, y + 18, 64, 36);
        }

        const actionY = y + rowH - actionH - 20;
        if (owned && !equipped) {
          drawNeonButton(App.ctx, this.btn(`equip-${item.id}`, "EQUIP", pad + 12, actionY, cardW - 24, actionH), "EQUIP", pointInRect(mousePos, this.buttons[`equip-${item.id}`]), true);
        } else if (!owned) {
          drawNeonButton(App.ctx, this.btn(`buy-${item.id}`, "BUY", pad + 12, actionY, cardW - 24, actionH), "BUY", pointInRect(mousePos, this.buttons[`buy-${item.id}`]), true);
        }
      });

      App.ctx.restore();
      drawNeonButton(App.ctx, this.btn("back", "BACK", pad, viewH() - 90, cardW, btnHeight(52)), "BACK", pointInRect(mousePos, this.buttons.back));
      this.finishButtons();
      return;
    }

    App.ctx.font = gameFont(48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SHOP", 80, 90);
    drawCoins(App.ctx, save, viewW() - 220, 90);

    drawNeonButton(App.ctx, this.btn("tabSkins", "MOUSE SKINS", 80, 120, 200, 40), "MOUSE SKINS", this.shopTab === "skins", true);
    drawNeonButton(App.ctx, this.btn("tabBgs", "BACKGROUNDS", 300, 120, 200, 40), "BACKGROUNDS", this.shopTab === "backgrounds", true);

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 80 + col * 580;
      const y = 190 + row * 130;
      const owned = this.shopTab === "skins"
        ? save.ownedSkins.includes(item.id)
        : save.ownedBackgrounds.includes(item.id);
      const equipped = this.shopTab === "skins"
        ? save.equippedSkin === item.id
        : save.equippedBackground === item.id;

      App.ctx.font = gameFont(24);
      App.ctx.fillStyle = rgb(COLORS.text);
      App.ctx.fillText(item.name, x, y);
      App.ctx.font = gameFont(18);
      App.ctx.fillStyle = rgb(owned ? COLORS.green : COLORS.gold);
      App.ctx.fillText(owned ? (equipped ? "EQUIPPED" : "OWNED") : `${item.price} COINS`, x, y + 28);

      if (this.shopTab === "skins") {
        drawCursor(App.ctx, { x: x + 400, y: y - 10 }, item);
      } else {
        App.ctx.fillStyle = rgb(item.accent);
        App.ctx.fillRect(x + 360, y - 24, 80, 40);
      }

      if (owned && !equipped) {
        drawNeonButton(App.ctx, this.btn(`equip-${item.id}`, "EQUIP", x + 320, y + 36, 120, 36), "EQUIP", pointInRect(mousePos, this.buttons[`equip-${item.id}`]), true);
      } else if (!owned) {
        drawNeonButton(App.ctx, this.btn(`buy-${item.id}`, "BUY", x + 320, y + 36, 120, 36), "BUY", pointInRect(mousePos, this.buttons[`buy-${item.id}`]), true);
      }
    });

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawSettings(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = gameFont(48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SETTINGS", 80, 90);

    this.sliders.music = { x: 80, y: 160, w: 400, label: "MUSIC" };
    this.sliders.sfx = { x: 80, y: 230, w: 400, label: "SFX" };
    drawSlider(App.ctx, this.sliders.music, save.settings.musicVolume);
    drawSlider(App.ctx, this.sliders.sfx, save.settings.sfxVolume);

    App.ctx.font = gameFont(24);
    App.ctx.fillStyle = rgb(COLORS.text);
    const playerLine = Auth.isLoggedIn()
      ? `PLAYER: ${Auth.displayName}`
      : "GUEST — scores won't appear on leaderboard";
    App.ctx.fillText(playerLine, 80, 310);
    if (!Input.touchMode) {
      App.ctx.fillText(`BALL: Mouse btn ${save.keys.ball} / Key ${save.keys.ballKey}`, 80, 350);
      App.ctx.fillText(`BOMB: Mouse btn ${save.keys.bomb} / Key ${save.keys.bombKey}`, 80, 390);
      drawNeonButton(App.ctx, this.btn("remapBall", "REMAP BALL KEY", 80, 420, 280, 44), this.waitingKey === "ball" ? "PRESS KEY..." : "REMAP BALL KEY", pointInRect(mousePos, this.buttons.remapBall), true);
      drawNeonButton(App.ctx, this.btn("remapBomb", "REMAP BOMB KEY", 380, 420, 280, 44), this.waitingKey === "bomb" ? "PRESS KEY..." : "REMAP BOMB KEY", pointInRect(mousePos, this.buttons.remapBomb), true);
    }

    const accountLabel = Auth.isLoggedIn() ? "LOGOUT" : "LOGIN";
    const accLabel = save.settings.accessibility ? "ACCESSIBILITY: ON" : "ACCESSIBILITY: OFF";
    const settingsY = Input.touchMode ? 360 : 490;
    drawNeonButton(App.ctx, this.btn("toggleAccessibility", accLabel, 80, settingsY - (Input.touchMode ? 0 : 70), Input.touchMode ? 420 : 580, btnHeight(44)), accLabel, pointInRect(mousePos, this.buttons.toggleAccessibility), true);
    drawNeonButton(App.ctx, this.btn("account", accountLabel, 80, settingsY, 180, btnHeight(44)), accountLabel, pointInRect(mousePos, this.buttons.account), true);
    drawNeonButton(App.ctx, this.btn("toggleMobile", Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", 280, settingsY, 220, btnHeight(44)), Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", pointInRect(mousePos, this.buttons.toggleMobile), true);

    if (Input.touchMode && !PwaInstall.isStandalone()) {
      const installY = settingsY + 70;
      const installLabel = PwaInstall.canPromptInstall() ? "INSTALL APP" : "ADD TO HOME";
      drawNeonButton(App.ctx, this.btn("installApp", installLabel, 80, installY, 420, btnHeight(48)), installLabel, pointInRect(mousePos, this.buttons.installApp), true);
      if (PwaInstall.isIos() && !PwaInstall.canPromptInstall()) {
        App.ctx.font = uiFont(15);
        App.ctx.fillStyle = rgb(COLORS.gray);
        App.ctx.fillText(PwaInstall.iosHint(), 80, installY + 72);
      }
    }

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, viewH() - 70), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawHowTo(mousePos, now, save) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    let y = 80;
    getHowToLines().forEach((line, i) => {
      if (!line) { y += 10; return; }
      App.ctx.font = i === 0 ? gameFont(40) : gameFont(22);
      App.ctx.fillStyle = rgb(i === 0 ? COLORS.blue : COLORS.text);
      App.ctx.fillText(line, (viewW() - App.ctx.measureText(line).width) / 2, y);
      y += i === 0 ? 44 : 32;
    });

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawGameScreen(game, now, save) {
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    if (!game.started) {
      game.startTarget.draw(App.ctx);
      GameLogic.drawHud(App.ctx, game, game.level, save);
      return;
    }
    game.nextTarget.draw(App.ctx, now);
    if (game.purplePartner?.isActive) game.purplePartner.draw(App.ctx, now);
    game.currentTarget.draw(App.ctx, now);
    game.flippedTargets.forEach((pt) => pt.draw(App.ctx));
    game.floatingTexts.forEach((ft) => ft.draw(App.ctx));
    GameLogic.drawHud(App.ctx, game, game.level, save);
    GameLogic.drawMobileControls(App.ctx, game.level);
  },

  drawGameOver(game, save, mousePos, now, homeHovered) {
    if (!game) return;
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    drawHomeButton(App.ctx, mousePos, homeHovered);
    this.buttons.home = homeButtonRect();

    const success = game.lastRewards?.success;
    const infinite = game.level.infinite;
    const title = success ? "LEVEL COMPLETE" : (game.failMessage || "GAME OVER");
    const titleColor = success ? COLORS.green : COLORS.red;

    App.ctx.font = success ? gameFont(58) : gameFont(52);
    App.ctx.fillStyle = rgb(titleColor);
    App.ctx.fillText(title, (viewW() - App.ctx.measureText(title).width) / 2, 130);

    const r = game.lastRewards || {};
    App.ctx.font = gameFont(28);
    App.ctx.fillStyle = rgb(COLORS.text);
    const statLines = infinite
      ? [
          `SCORE: ${game.score}`,
          r.newBest ? "NEW BEST!" : `BEST: ${r.best || 0}`,
          `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
        ]
      : success
        ? [
            `SCORE: ${game.score} / ${r.passScore}`,
            r.stageXp ? `+${r.xpGain} XP (+${r.stageXp} stage)` : `+${r.xpGain} XP`,
            `+${r.coinGain} COINS`,
            r.leaderboardPrize ? `#1 LEADERBOARD BONUS: +${r.leaderboardPrize} COINS!` : null,
            r.guestScore ? "Login to appear on leaderboard" : null,
          ].filter(Boolean)
        : [
            `SCORE: ${game.score} / ${r.passScore || game.level.passScore}`,
            game.endReason === "expired" ? "Too slow!" : `Need ${r.needed} more pts`,
            `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
          ];
    statLines.forEach((line, i) => {
      App.ctx.fillText(line, (viewW() - App.ctx.measureText(line).width) / 2, 200 + i * 36);
    });

    const canShare = this.canShareGame(game);
    let blockY = 200 + statLines.length * 36 + 24;
    if (canShare) {
      blockY = this.drawCenteredLines(
        App.ctx,
        [Share.buildMessage(game.score, game.level)],
        blockY,
        Input.touchMode ? 18 : 20,
        COLORS.gold,
      ) + 8;
      const shareBtn = this.btn("share", "SHARE", null, blockY, null, btnHeight(48));
      drawNeonButton(App.ctx, shareBtn, "SHARE", pointInRect(mousePos, shareBtn), true);
      blockY = shareBtn.y + shareBtn.h + 12;
      if (this.shareFeedback) {
        App.ctx.font = uiFont(16);
        App.ctx.fillStyle = rgb(COLORS.green);
        const note = this.shareFeedback;
        App.ctx.fillText(note, (viewW() - App.ctx.measureText(note).width) / 2, blockY);
        blockY += 24;
      }
    }

    const btnY = viewH() - (Input.touchMode ? 110 : 90);
    if (!infinite) {
      const leaderboardY = canShare ? Math.min(blockY + 8, btnY - 170) : 330;
      drawLeaderboardPanel(App.ctx, save, game.level.id, 80, leaderboardY);
    }

    if (success && r.unlockedNext && !infinite) {
      drawNeonButton(App.ctx, this.btn("next", "NEXT", null, btnY), "NEXT", pointInRect(mousePos, this.buttons.next));
    } else if (!success) {
      drawNeonButton(App.ctx, this.btn("restart", "RESTART", null, btnY), "RESTART", pointInRect(mousePos, this.buttons.restart));
    } else {
      drawNeonButton(App.ctx, this.btn("restart", "RETRY", null, btnY), "RETRY", pointInRect(mousePos, this.buttons.restart));
    }
    this.finishButtons();
  },

  handleClick(state, save, pos) {
    if (state === "menu") {
      if (this._hit("start", pos)) { App.requestStartGame(getLevelById(1)); return true; }
      if (this._hit("levels", pos)) { this.resetScroll(); App.state = "levels"; return true; }
      if (this._hit("infinite", pos)) {
        this.infiniteSetup = this.defaultInfiniteSetup();
        App.state = "infinite";
        return true;
      }
      if (this._hit("shop", pos)) { this.resetScroll(); App.state = "shop"; return true; }
      if (this._hit("settings", pos)) { App.state = "settings"; return true; }
      if (this._hit("howto", pos)) { App.state = "howto"; return true; }
    }

    if (state === "levels") {
      if (App.leaderboardLevelId) {
        if (this._hit("lbClose", pos)) {
          App.leaderboardLevelId = null;
          return true;
        }
        return true;
      }
      for (const level of LEVELS) {
        if (isLevelUnlocked(save, level) && this._hit(`level-${level.id}`, pos)) {
          App.requestStartGame(level);
          return true;
        }
      }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "infinite") {
      const setup = this.infiniteSetup;
      if (this._hit("infCycleTrack", pos)) {
        cycleInfiniteTrack(setup);
        return true;
      }
      if (this._hit("infCycleMechanics", pos)) {
        cycleInfiniteMechanics(setup);
        return true;
      }
      if (this._hit("infPlay", pos)) {
        App.launchGame(createInfiniteLevel(getLevelById(setup.trackId), setup));
        return true;
      }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "tutorial" && this._hit("tutorialGo", pos)) {
      App.confirmTutorial();
      return true;
    }

    if (state === "shop") {
      if (this._hit("tabSkins", pos)) { this.shopTab = "skins"; this.resetScroll(); return true; }
      if (this._hit("tabBgs", pos)) { this.shopTab = "backgrounds"; this.resetScroll(); return true; }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
      return this._handleShopPurchase(save, pos);
    }

    if (state === "settings") {
      if (this._hit("remapBall", pos)) { this.waitingKey = "ball"; return true; }
      if (this._hit("remapBomb", pos)) { this.waitingKey = "bomb"; return true; }
      if (this._hit("toggleMobile", pos)) {
        Input.touchMode = !Input.touchMode;
        applyViewport(App.canvas);
        App.stars = createStars();
        MobileShell.syncRotatePrompt();
        if (App.canvas) App.canvas.style.cursor = Input.touchMode ? "default" : "none";
        return true;
      }
      if (this._hit("toggleAccessibility", pos)) {
        save.settings.accessibility = !save.settings.accessibility;
        writeSave(save);
        return true;
      }
      if (this._hit("account", pos)) {
        if (Auth.isLoggedIn()) App.logout();
        else App.showLogin();
        return true;
      }
      if (this._hit("installApp", pos)) {
        if (PwaInstall.canPromptInstall()) PwaInstall.promptInstall();
        return true;
      }
      if (this._hit("back", pos)) { App.state = "menu"; this.waitingKey = null; return true; }
      this._handleSliderDrag(save, pos);
    }

    if (state === "howto" && this._hit("back", pos)) { App.state = "menu"; return true; }

    if (state === "gameover") {
      if (this._hit("home", pos)) { App.goHome(); return true; }
      if (this._hit("share", pos)) {
        Share.shareScore(App.game.score, App.game.level).then((result) => {
          if (result === "copied") {
            Screens.shareFeedback = "Copied to clipboard!";
            setTimeout(() => { Screens.shareFeedback = ""; }, 2500);
          }
        });
        return true;
      }
      if (this._hit("next", pos)) { App.startNextLevel(); return true; }
      if (this._hit("restart", pos)) { App.requestStartGame(App.lastLevel); return true; }
    }

    return false;
  },

  _hit(id, pos) {
    const rect = this.clickAreas[id] || this.buttons[id];
    return rect && pointInRect(pos, rect);
  },

  _handleShopPurchase(save, pos) {
    const items = this.shopTab === "skins" ? MOUSE_SKINS : BACKGROUNDS;
    for (const item of items) {
      if (this._hit(`buy-${item.id}`, pos)) {
        const col = this.shopTab === "skins" ? "ownedSkins" : "ownedBackgrounds";
        const result = purchaseItem(save, item.price, col, item.id);
        if (result.ok) {
          if (this.shopTab === "skins") save.equippedSkin = item.id;
          else save.equippedBackground = item.id;
          writeSave(save);
        }
        return true;
      }
      if (this._hit(`equip-${item.id}`, pos)) {
        if (this.shopTab === "skins") save.equippedSkin = item.id;
        else save.equippedBackground = item.id;
        writeSave(save);
        return true;
      }
    }
    return false;
  },

  _handleSliderDrag(save, pos) {
    for (const key of ["music", "sfx"]) {
      const slider = this.sliders[key];
      if (!slider) continue;
      const track = { x: slider.x, y: slider.y - 8, w: slider.w, h: 28 };
      if (this.draggingSlider || pointInRect(pos, track)) {
        this.draggingSlider = true;
        save.settings[`${key}Volume`] = sliderValueFromPos(slider, pos);
        writeSave(save);
        AudioEngine.setVolumes(save.settings);
        return;
      }
    }
  },
};
let canvas, ctx;

const App = {
  state: "menu",
  save: null,
  game: null,
  lastLevel: null,
  pendingLevel: null,
  activeTutorial: null,
  stars: null,
  sessionReady: false,
  loopStarted: false,
  renderError: null,
  leaderboardLevelId: null,

  async init() {
    canvas = document.getElementById("game");
    if (!canvas) throw new Error("Game canvas missing");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    this.ctx = ctx;
    this.canvas = canvas;
    Input.init(canvas, null);
    MobileShell.init();
    PwaInstall.init();
    window.addEventListener("resize", () => applyViewport(canvas));
    await loadGameFont();
    try { AudioEngine.init({ musicVolume: 0.55, sfxVolume: 0.7 }); } catch {}
    UiIcons.load();

    this.bindEvents();
    this.bindNameForm();

    Auth.init(() => this.startSession());

    document.getElementById("wrapper")?.classList.add("session-active");

    if (!this.loopStarted) {
      this.loopStarted = true;
      requestAnimationFrame((t) => this.loop(t));
    }
  },

  bindNameForm() {
    const play = () => this.tryLogin();

    document.getElementById("name-play")?.addEventListener("click", (e) => {
      e.preventDefault();
      play();
    });

    document.getElementById("name-cancel")?.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.hideNameScreen();
    });

    document.getElementById("name-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      play();
    });

    const nameInput = document.getElementById("player-name");
    const pinInput = document.getElementById("player-pin");

    nameInput?.addEventListener("input", () => Auth.updatePinHint(nameInput.value));
    nameInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        pinInput?.focus();
      }
    });

    pinInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        play();
      }
    });

    Auth.updatePinHint("");
  },

  tryLogin() {
    const name = document.getElementById("player-name")?.value || "";
    const pin = document.getElementById("player-pin")?.value || "";
    const guestSave = Auth.isLoggedIn() ? null : { ...this.save };
    Auth.setLoading(true);
    Auth.login(name, pin)
      .then((result) => {
        if (!result.ok) {
          Auth.setError(result.reason);
          return;
        }
        const nameInput = document.getElementById("player-name");
        if (nameInput) nameInput.value = result.name;
        this.startSession(guestSave);
      })
      .catch(() => Auth.setError("Login failed — try again"))
      .finally(() => Auth.setLoading(false));
  },

  startSession(guestSave = null) {
    try {
      this.renderError = null;
      if (guestSave && Auth.isLoggedIn()) {
        this.save = mergeGuestIntoAccount(guestSave, loadSave());
      } else {
        this.save = loadSave();
      }
      this.save.username = Auth.isLoggedIn() ? Auth.displayName : "Guest";
      writeSave(this.save);
      Input.save = this.save;
      this.stars = createStars();
      AudioEngine.setVolumes(this.save.settings);
      Auth.hideNameScreen();
      this.sessionReady = true;
      if (this.state !== "game" || !this.game?.running) {
        this.state = this.state === "settings" ? "settings" : "menu";
      }
      if (this.state === "menu") AudioEngine.startMenuMusic();
      if (Input.touchMode) MobileShell.syncRotatePrompt();
    } catch (err) {
      console.error(err);
      this.sessionReady = false;
      Auth.setError("Could not start — try again");
      Auth.showLoginScreen();
    }
  },

  showLogin() {
    Auth.showLoginScreen();
  },

  logout() {
    if (Auth.isLoggedIn()) writeSave(this.save);
    Auth.logout();
    this.save = loadSave();
    Input.save = this.save;
    AudioEngine.setVolumes(this.save.settings);
  },

  bindEvents() {
    canvas.addEventListener("pointerdown", (e) => {
      if (!this.sessionReady) return;
      const inGame = this.state === "game" && this.game?.running;
      if (!inGame && e.button !== 0) return;
      if (inGame && e.button !== 0 && e.button !== 1 && e.button !== 2) return;

      e.preventDefault();
      canvas.setPointerCapture?.(e.pointerId);
      Input.syncPos(e.clientX, e.clientY);

      if (this.state === "gameover" && pointInRect(Input.mousePos, homeButtonRect())) {
        this.goHome();
        return;
      }

      if (inGame) {
        const button = Input.touchMode ? 0 : e.button;
        const clickResult = GameLogic.handleClick(this.game, button, Input.mousePos, performance.now());
        if (clickResult === "begin") this.beginGame(performance.now());
        return;
      }

      if (Screens.scrollableState(this.state)) {
        Screens.beginScrollDrag(e.clientY);
        Screens.scrollDrag.dragged = false;
        return;
      }

      this.handlePointer();
    });

    canvas.addEventListener("contextmenu", (e) => {
      if (this.state === "game" && this.game?.running) e.preventDefault();
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!this.sessionReady) return;
      Input.syncPos(e.clientX, e.clientY);
      if (Screens.scrollDrag) {
        if (Screens.updateScrollDrag(e.clientY)) Screens.scrollDrag.dragged = true;
        return;
      }
      if (this.state === "settings" && Screens.draggingSlider) {
        Screens._handleSliderDrag(this.save, Input.mousePos);
      }
    });

    canvas.addEventListener("pointerup", (e) => {
      if (Screens.scrollDrag) {
        Input.syncPos(e.clientX, e.clientY);
        const dragged = Screens.endScrollDrag();
        if (!dragged) this.handlePointer();
        return;
      }
      Screens.draggingSlider = false;
    });

    document.addEventListener("keydown", (e) => {
      if (!this.sessionReady) return;
      if (Screens.waitingKey) {
        Input.remapKey(Screens.waitingKey, e.code);
        Screens.waitingKey = null;
        e.preventDefault();
        return;
      }
      if (this.state === "game" && this.game?.running) {
        if (e.code === this.save.keys.ballKey || e.code === this.save.keys.bombKey) {
          const btn = e.code === this.save.keys.ballKey ? 0 : 2;
          const clickResult = GameLogic.handleClick(this.game, btn, Input.mousePos, performance.now());
          if (clickResult === "begin") this.beginGame(performance.now());
        }
      }
      if (e.key === "F11") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    });

    window.addEventListener("wheel", (e) => {
      if (App.state === "levels" || App.state === "shop") {
        Screens.scrollList(e.deltaY * 0.6);
        e.preventDefault();
      }
    }, { passive: false });
  },

  handlePointer() {
    if (this.state === "game" && this.game?.running) return;
    Screens.handleClick(this.state, this.save, Input.mousePos);
  },

  goHome() {
    MobileShell.exitPlayMode();
    this.game = null;
    this.pendingLevel = null;
    this.activeTutorial = null;
    this.leaderboardLevelId = null;
    Screens.shareFeedback = "";
    this.state = "menu";
    AudioEngine.startMenuMusic();
  },

  openLevelLeaderboard(levelId) {
    this.leaderboardLevelId = levelId;
    refreshLeaderboard(levelId);
  },

  requestStartGame(level) {
    const tutorial = level.tutorial ? getTutorial(level.tutorial) : null;
    if (tutorial) {
      this.pendingLevel = level;
      this.activeTutorial = tutorial;
      this.state = "tutorial";
      return;
    }
    this.launchGame(level);
  },

  confirmTutorial() {
    const level = this.pendingLevel;
    this.pendingLevel = null;
    this.activeTutorial = null;
    if (!level) {
      this.state = "menu";
      return;
    }
    this.launchGame(level);
  },

  async launchGame(level) {
    AudioEngine.stopMusic();
    this.lastLevel = level;
    this.game = createGame(level, 0);
    this.state = "game";
    if (Input.touchMode) await MobileShell.enterPlayMode();
    await AudioEngine.resume();
  },

  beginGame(now) {
    if (!this.game || this.game.started) return;
    GameLogic.beginGame(this.game, now);
  },

  startNextLevel() {
    const next = getLevelById(this.lastLevel.id + 1);
    if (!isLevelUnlocked(this.save, next)) return;
    this.requestStartGame(next);
  },

  endGame(reason) {
    if (!this.game || this.state === "gameover") return;
    this.game.endReason = reason;
    this.game.failMessage = pickFailMessage();
    GameLogic.finish(this.game, this.save);
    refreshLeaderboard(this.game.level.id);
    this.state = "gameover";
  },

  renderCursor(save) {
    if (Input.touchMode) return;
    drawCursor(this.ctx, Input.mousePos, getSkinById(save.equippedSkin));
  },

  loop(now) {
    const mousePos = Input.mousePos;
    const homeHovered = pointInRect(mousePos, homeButtonRect());

    if (!this.sessionReady) {
      drawBootMessage(this.ctx, GAME_NAME, ["Loading..."]);
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    if (this.renderError) {
      drawBootMessage(this.ctx, "LOAD ERROR", [this.renderError, "Refresh the page"]);
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    try {
      clearFrame(this.ctx);
      if (this.state === "gameover" && this.game) {
        Screens.drawGameOver(this.game, this.save, mousePos, now, homeHovered);
        this.renderCursor(this.save);
      } else if (this.state === "tutorial" && this.activeTutorial) {
        Screens.drawTutorial(this.activeTutorial, mousePos, now, this.save);
        this.renderCursor(this.save);
      } else if (this.state === "menu") {
        Screens.drawMenu(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "levels" && this.leaderboardLevelId) {
        Screens.drawLevelLeaderboard(this.save, this.leaderboardLevelId, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "levels") {
        Screens.drawLevels(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "infinite") {
        Screens.drawInfiniteSelect(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "shop") {
        Screens.drawShop(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "settings") {
        Screens.drawSettings(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "howto") {
        Screens.drawHowTo(mousePos, now, this.save);
        this.renderCursor(this.save);
      } else if (this.state === "game" && this.game?.running) {
        const reason = GameLogic.update(this.game, now);
        if (reason) {
          this.endGame(reason);
          Screens.drawGameOver(this.game, this.save, mousePos, now, homeHovered);
        } else {
          Screens.drawGameScreen(this.game, now, this.save);
        }
        this.renderCursor(this.save);
      } else {
        Screens.drawMenu(this.save, mousePos, now);
        this.renderCursor(this.save);
      }
    } catch (err) {
      console.error(err);
      this.renderError = err?.message || "Render failed";
      AudioEngine.stopMusic();
      Auth.showLoginScreen();
      Auth.setError(this.renderError);
    }

    requestAnimationFrame((t) => this.loop(t));
  },
};

function reportScriptError(label) {
  const message = `Missing file: ${label}. Redeploy the full game folder.`;
  const overlay = document.getElementById("name-overlay");
  const error = document.getElementById("name-error");
  if (overlay) overlay.classList.remove("hidden");
  if (error) error.textContent = message;
  console.error(message);
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.__cybertimeLoadError) {
    reportScriptError(window.__cybertimeLoadError);
    return;
  }
  App.init().catch((err) => {
    console.error(err);
    Auth.setError("Game failed to load — refresh the page");
    Auth.showLoginScreen();
  });
});
