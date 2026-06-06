const defaultSave = () => ({
  xp: 0,
  coins: 50,
  highScores: {},
  infiniteHighScores: {},
  clearedLevels: [],
  leaderboards: {},
  ownedSkins: ["default"],
  ownedBackgrounds: ["cyber"],
  equippedSkin: "default",
  equippedBackground: "cyber",
  keys: { ball: 0, bomb: 2, ballKey: "KeyZ", bombKey: "KeyX" },
  settings: { musicVolume: 0.55, sfxVolume: 0.7 },
  lastAdReward: 0,
});

function loadSave() {
  try {
    const cloudRaw = CrazySDK.getCloudItem?.(SAVE_KEY);
    const localRaw = localStorage.getItem(SAVE_KEY);
    const raw = cloudRaw || localRaw;
    if (!raw) return defaultSave();
    const data = { ...defaultSave(), ...JSON.parse(raw) };
    if (!Array.isArray(data.clearedLevels)) data.clearedLevels = [];
    if (!data.leaderboards || typeof data.leaderboards !== "object") data.leaderboards = {};
    if (!data.infiniteHighScores || typeof data.infiniteHighScores !== "object") data.infiniteHighScores = {};
    return data;
  } catch {
    return defaultSave();
  }
}

function writeSave(data) {
  const json = JSON.stringify(data);
  localStorage.setItem(SAVE_KEY, json);
  CrazySDK.setCloudItem?.(SAVE_KEY, json);
}

function finishGameRewards(save, game) {
  const level = game.level;
  const score = Math.max(0, game.score);
  const coinGain = score * COINS_PER_SCORE + Math.floor(game.comboPeak / 3) * 2;
  let xpGain = score * XP_PER_SCORE + game.comboPeak * 5;

  if (level.infinite) {
    const key = String(musicLevelId(level));
    const prev = save.infiniteHighScores[key] || 0;
    const newBest = score > prev;
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
  const timedOut = game.endReason === "time";
  const success = timedOut && score >= level.passScore;

  if (success) {
    cleared = true;
    stageXp = level.clearXp;
    xpGain += stageXp;
    if (!save.clearedLevels.includes(level.id)) {
      save.clearedLevels.push(level.id);
    }
    unlockedNext = level.id < LEVELS.length;
    addLeaderboardEntry(save, level.id, score);
    CrazySDK.submitLevelScore?.(level.id, score);
  }

  save.xp += xpGain;
  save.coins += coinGain;
  writeSave(save);
  return {
    xpGain,
    coinGain,
    stageXp,
    cleared,
    success,
    unlockedNext,
    passScore: level.passScore,
    needed: Math.max(0, level.passScore - score),
  };
}

function addLeaderboardEntry(save, levelId, score) {
  const key = String(levelId);
  if (!save.leaderboards[key]) save.leaderboards[key] = [];
  save.leaderboards[key].push({ name: "YOU", score, at: Date.now() });
  save.leaderboards[key].sort((a, b) => b.score - a.score);
  save.leaderboards[key] = save.leaderboards[key].slice(0, 8);
}

function getLeaderboard(save, levelId) {
  return save.leaderboards?.[String(levelId)] || [];
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
