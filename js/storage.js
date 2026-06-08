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
  ownedBackgrounds: ["grid-black"],
  equippedSkin: "default",
  equippedBackground: "grid-black",
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
  data.ownedBackgrounds = [...new Set(data.ownedBackgrounds.map(migrateBackgroundId))];
  data.equippedBackground = migrateBackgroundId(data.equippedBackground);
  if (!data.ownedBackgrounds.includes(data.equippedBackground)) data.equippedBackground = "grid-black";
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
  const success = timedOut && (game.hearts ?? 0) > 0;
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
