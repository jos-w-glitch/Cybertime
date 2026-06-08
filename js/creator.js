const CREATOR_DB = "cybertime-creator";
const CREATOR_MUSIC_MAX = 8 * 1024 * 1024;

const CreatorStore = {
  _levels: [],
  _musicUrls: new Map(),
  _draft: null,

  draft() {
    if (!this._draft) this._draft = defaultCreatorDraft();
    return this._draft;
  },

  resetDraft() {
    this._draft = defaultCreatorDraft();
    return this._draft;
  },

  async init() {
    await this._loadAll();
  },

  list() {
    return this._levels.slice().sort((a, b) => b.createdAt - a.createdAt);
  },

  async saveDraft() {
    const draft = { ...this._draft };
    const pendingMusic = draft._pendingMusic;
    delete draft._pendingMusic;
    if (!draft.id) draft.id = `c_${Date.now()}`;
    draft.createdAt = Date.now();
    draft.author = Auth.displayName || "Guest";
    if (pendingMusic) {
      await this._putMusic(draft.id, pendingMusic);
      draft.hasMusic = true;
    }
    await this._putLevel(draft);
    await this._loadAll();
    this._draft = null;
    return draft.id;
  },

  async attachMusic(file) {
    if (!file || file.size > CREATOR_MUSIC_MAX) throw new Error("Music too large (max 8MB)");
    const draft = this.draft();
    if (!draft._pendingMusic) draft._pendingMusic = file;
    else draft._pendingMusic = file;
    draft.hasMusic = true;
  },

  async getMusicUrl(levelId) {
    if (this._musicUrls.has(levelId)) return this._musicUrls.get(levelId);
    const blob = await this._getMusic(levelId);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    this._musicUrls.set(levelId, url);
    return url;
  },

  async deleteLevel(id) {
    await this._deleteLevel(id);
    const url = this._musicUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    this._musicUrls.delete(id);
    await this._loadAll();
  },

  _openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(CREATOR_DB, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("levels");
        req.result.createObjectStore("music");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async _loadAll() {
    const db = await this._openDb();
    this._levels = await new Promise((resolve, reject) => {
      const tx = db.transaction("levels", "readonly");
      const req = tx.objectStore("levels").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async _putLevel(level) {
    const db = await this._openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("levels", "readwrite");
      tx.objectStore("levels").put(level, level.id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async _putMusic(levelId, file) {
    const db = await this._openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("music", "readwrite");
      tx.objectStore("music").put(file, levelId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async _getMusic(levelId) {
    const db = await this._openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("music", "readonly");
      const req = tx.objectStore("music").get(levelId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async _deleteLevel(id) {
    const db = await this._openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["levels", "music"], "readwrite");
      tx.objectStore("levels").delete(id);
      tx.objectStore("music").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};

function defaultCreatorDraft() {
  return {
    id: null,
    name: "MY STAGE",
    bpm: 96,
    hitWindowMs: 2200,
    bombFuse: 4,
    mechanicIndex: 1,
    rewardName: "STAGE REWARD",
    rewardBg: [18, 8, 32],
    rewardGrid: [60, 30, 90],
    rewardAccent: [255, 80, 180],
    hasMusic: false,
    createdAt: 0,
    author: "",
  };
}

function applyCreatorDraftToLevel(meta, musicUrl) {
  const preset = INFINITE_MECHANIC_PRESETS[meta.mechanicIndex ?? 0] || INFINITE_MECHANIC_PRESETS[0];
  const rewardId = `creator-bg-${meta.id}`;
  return {
    id: meta.id,
    communityId: meta.id,
    community: true,
    communityMusicUrl: musicUrl || null,
    name: meta.name,
    bpm: meta.bpm,
    hitWindowMs: meta.hitWindowMs,
    bombFuse: meta.bombFuse,
    duration: 30,
    sliders: preset.sliders,
    allowRed: preset.red,
    allowOrange: preset.orange,
    allowPurple: preset.purple,
    sliderRed: preset.sliderRed,
    redChance: preset.red ? INFINITE_MECHANIC_DEFAULTS.redChance : 0,
    orangeChance: preset.orange ? INFINITE_MECHANIC_DEFAULTS.orangeChance : 0,
    purpleChance: preset.purple ? INFINITE_MECHANIC_DEFAULTS.purpleChance : 0,
    sliderChance: preset.sliders ? INFINITE_MECHANIC_DEFAULTS.sliderChance : 0,
    sliderRedChance: preset.sliderRed ? INFINITE_MECHANIC_DEFAULTS.sliderRedChance : 0,
    passScore: 0,
    clearXp: 0,
    tutorial: null,
    featureHint: `Community — ${meta.author || "Creator"}`,
    rewardBgId: rewardId,
    rewardName: meta.rewardName,
    rewardBg: meta.rewardBg,
    rewardGrid: meta.rewardGrid,
    rewardAccent: meta.rewardAccent,
    playBg: { bg: meta.rewardBg, grid: meta.rewardGrid, accent: meta.rewardAccent },
  };
}

function unlockCommunityReward(save, level) {
  if (!level?.community || !level.rewardBgId) return;
  const bg = {
    id: level.rewardBgId,
    name: level.rewardName || "COMMUNITY BG",
    bg: level.rewardBg,
    grid: level.rewardGrid,
    accent: level.rewardAccent,
    price: 0,
  };
  if (!save.creatorBackgrounds) save.creatorBackgrounds = [];
  if (!save.creatorBackgrounds.some((b) => b.id === bg.id)) save.creatorBackgrounds.push(bg);
  if (!save.ownedBackgrounds.includes(bg.id)) save.ownedBackgrounds.push(bg.id);
  if (!save.clearedCommunity) save.clearedCommunity = [];
  if (!save.clearedCommunity.includes(level.communityId)) save.clearedCommunity.push(level.communityId);
}

function cycleCreatorBpm(draft, delta) {
  const steps = [72, 84, 96, 104, 112, 122, 128, 136, 142, 152, 160, 168];
  const idx = steps.findIndex((b) => b >= draft.bpm);
  const i = Math.max(0, (idx < 0 ? 0 : idx) + delta);
  draft.bpm = steps[Math.max(0, Math.min(steps.length - 1, i))];
}

function cycleCreatorMechanics(draft, delta) {
  const next = ((draft.mechanicIndex ?? 0) + delta + INFINITE_MECHANIC_PRESETS.length) % INFINITE_MECHANIC_PRESETS.length;
  draft.mechanicIndex = next;
}
