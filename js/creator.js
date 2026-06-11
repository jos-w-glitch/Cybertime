const CREATOR_DB = "cybertime-creator";
const CREATOR_DB_VERSION = 2;
const CREATOR_MUSIC_MAX = 8 * 1024 * 1024;
const CREATOR_MEDIA_MAX = 12 * 1024 * 1024;

const CREATOR_MECH_KEYS = [
  { key: "red", label: "RED BOMBS" },
  { key: "orange", label: "ORANGE BOMBS" },
  { key: "purple", label: "PURPLE PAIRS" },
  { key: "sliders", label: "SLIDERS" },
  { key: "sliderRed", label: "RED SLIDERS", needs: "sliders" },
];

const CreatorStore = {
  _levels: [],
  _rewards: [],
  _musicUrls: new Map(),
  _mediaUrls: new Map(),
  _draft: null,
  _rewardDraft: null,

  draft() {
    if (!this._draft) this._draft = defaultCreatorDraft();
    return this._draft;
  },

  resetDraft() {
    this._draft = defaultCreatorDraft();
    return this._draft;
  },

  rewardDraft() {
    if (!this._rewardDraft) this._rewardDraft = defaultRewardDraft();
    return this._rewardDraft;
  },

  resetRewardDraft() {
    this._rewardDraft = defaultRewardDraft();
    return this._rewardDraft;
  },

  async init() {
    await this._loadAll();
    await this.refreshCommunitySearch("");
  },

  async refreshCommunitySearch(search) {
    if (!CloudStore.enabled()) return;
    const remote = await CloudStore.fetchCommunityLevels(search);
    if (remote) this._mergeRemoteLevels(remote);
  },

  filterLevels(search) {
    const q = (search || "").trim().toLowerCase();
    const all = this.list();
    if (!q) return all;
    return all.filter((level) =>
      level.name?.toLowerCase().includes(q) || (level.author || "").toLowerCase().includes(q)
    );
  },

  _mergeRemoteLevels(rows) {
    if (!Array.isArray(rows)) return;
    const byId = new Map(this._levels.map((level) => [level.id, level]));
    for (const row of rows) {
      const meta = this._remoteToMeta(row);
      if (meta?.id) byId.set(meta.id, meta);
    }
    this._levels = Array.from(byId.values());
  },

  _remoteToMeta(row) {
    const base = row.level_json && typeof row.level_json === "object" ? row.level_json : {};
    return {
      ...defaultCreatorDraft(),
      ...base,
      id: row.id,
      name: row.name || base.name || "MY STAGE",
      author: row.author || row.author_name || base.author || "Creator",
      createdAt: row.createdAt || Date.now(),
      musicPublicUrl: row.music_url || base.musicPublicUrl || null,
      rewardMediaUrl: row.reward_media_url || base.rewardMediaUrl || null,
      rewardCursorUrl: row.reward_cursor_url || base.rewardCursorUrl || null,
      musicSource: base.musicSource || (row.music_url ? "upload" : "track"),
      hasMusic: !!(row.music_url || base.hasMusic),
    };
  },

  getById(id) {
    return this._levels.find((level) => level.id === id) || null;
  },

  list() {
    return this._levels.slice().sort((a, b) => b.createdAt - a.createdAt);
  },

  listRewards() {
    return this._rewards.slice().sort((a, b) => b.createdAt - a.createdAt);
  },

  getReward(id) {
    return this._rewards.find((r) => r.id === id) || null;
  },

  async publishLevel() {
    const draft = this.draft();
    if (!draft.name?.trim()) throw new Error("Enter a stage name");
    const id = await this.saveDraft();
    const meta = this.getById(id);
    if (!meta) return id;

    const rewardUrls = await this._resolveRewardCloudUrls(meta);
    meta.rewardMediaUrl = rewardUrls.rewardMediaUrl;
    meta.rewardCursorUrl = rewardUrls.rewardCursorUrl;
    if (meta.musicSource === "upload" && !meta.musicPublicUrl) {
      const blob = await this._getMusic(id);
      if (blob) meta.musicPublicUrl = await this._uploadToCloud(id, "music", blob);
    }
    await this._putLevel(meta);

    if (CloudStore.enabled() && Auth.isLoggedIn()) {
      const result = await CloudStore.publishCommunityLevel(Auth.displayName, this._cloudPayload(meta));
      if (!result?.ok) throw new Error(result?.reason || "Cloud publish failed");
      await this.refreshCommunitySearch(CreatorUi.communitySearch || "");
      CreatorDom.setUploadStatus("Published to Community!");
    } else if (CloudStore.enabled()) {
      CreatorDom.setUploadStatus("Saved locally — login to share online");
    }
    return id;
  },

  _cloudPayload(meta) {
    return {
      ...meta,
      musicPublicUrl: meta.musicPublicUrl || "",
      rewardMediaUrl: meta.rewardMediaUrl || "",
      rewardCursorUrl: meta.rewardCursorUrl || "",
    };
  },

  async _resolveRewardCloudUrls(meta) {
    const reward = this.getReward(meta.rewardId);
    if (!reward) return { rewardMediaUrl: null, rewardCursorUrl: null };
    let rewardMediaUrl = reward.bgPublicUrl || meta.rewardMediaUrl || null;
    let rewardCursorUrl = reward.cursorPublicUrl || meta.rewardCursorUrl || null;
    if (reward.mediaId && !rewardMediaUrl) {
      const blob = await this._getMedia(reward.mediaId);
      if (blob) rewardMediaUrl = await this._uploadToCloud(meta.id, "reward-bg", blob);
    }
    if (reward.cursorId && !rewardCursorUrl) {
      const blob = await this._getMedia(reward.cursorId);
      if (blob) rewardCursorUrl = await this._uploadToCloud(meta.id, "reward-cursor", blob);
    }
    return { rewardMediaUrl, rewardCursorUrl };
  },

  async _uploadToCloud(prefix, kind, file) {
    if (!CloudStore.enabled()) return null;
    try {
      const result = await CloudStore.uploadCommunityFile(prefix, kind, file);
      return result?.url || null;
    } catch (err) {
      console.warn("Cloud upload failed", err);
      return null;
    }
  },

  async saveDraft() {
    const draft = { ...this._draft };
    const pendingMusic = draft._pendingMusic;
    delete draft._pendingMusic;
    if (!draft.name?.trim()) draft.name = "MY STAGE";
    if (!draft.id) draft.id = `c_${Date.now()}`;
    draft.createdAt = Date.now();
    draft.author = Auth.displayName || "Guest";
    if (pendingMusic) {
      await this._putMusic(draft.id, pendingMusic);
      draft.hasMusic = true;
      draft.musicSource = "upload";
      if (!draft.musicPublicUrl) {
        draft.musicPublicUrl = await this._uploadToCloud(draft.id, "music", pendingMusic);
      }
    }
    const reward = this.getReward(draft.rewardId);
    if (reward) {
      draft.rewardName = reward.name;
      draft.rewardBg = [...reward.bg];
      draft.rewardGrid = [...reward.grid];
      draft.rewardAccent = [...reward.accent];
      draft.rewardMediaId = reward.mediaId || null;
      draft.rewardMediaUrl = reward.bgPublicUrl || null;
    }
    await this._putLevel(draft);
    await this._loadAll();
    const id = draft.id;
    this._draft = null;
    return id;
  },

  async saveRewardDraft() {
    const draft = { ...this._rewardDraft };
    const pendingBg = draft._pendingBg;
    const pendingCursor = draft._pendingCursor;
    delete draft._pendingBg;
    delete draft._pendingCursor;
    if (!draft.id) draft.id = `r_${Date.now()}`;
    draft.createdAt = Date.now();
    if (pendingBg) {
      draft.mediaId = `${draft.id}-bg`;
      draft.mediaType = pendingBg.type.startsWith("video") ? "video" : "image";
      await this._putMedia(draft.mediaId, pendingBg);
      draft.hasMedia = true;
      draft.bgPublicUrl = await this._uploadToCloud(draft.id, "reward-bg", pendingBg);
    }
    if (pendingCursor) {
      draft.cursorId = `${draft.id}-cursor`;
      await this._putMedia(draft.cursorId, pendingCursor);
      draft.hasCursor = true;
      draft.cursorPublicUrl = await this._uploadToCloud(draft.id, "reward-cursor", pendingCursor);
    }
    await this._putReward(draft);
    await this._loadAll();
    this._rewardDraft = null;
    return draft.id;
  },

  async attachMusic(file) {
    if (!file || file.size > CREATOR_MUSIC_MAX) throw new Error("Music too large (max 8MB)");
    const draft = this.draft();
    if (!draft.id) draft.id = `c_${Date.now()}`;
    draft._pendingMusic = file;
    draft.musicFileName = file.name;
    draft.hasMusic = true;
    draft.musicSource = "upload";
    await this._putMusic(draft.id, file);
    draft._pendingMusic = null;
    draft.musicPublicUrl = await this._uploadToCloud(draft.id, "music", file);
    return draft;
  },

  async attachRewardBg(file) {
    if (!file || file.size > CREATOR_MEDIA_MAX) throw new Error("File too large (max 12MB)");
    const draft = this.rewardDraft();
    if (!draft.id) draft.id = `r_${Date.now()}`;
    draft._pendingBg = file;
    draft.mediaFileName = file.name;
    draft.hasMedia = true;
    draft.mediaId = `${draft.id}-bg`;
    draft.mediaType = file.type.startsWith("video") ? "video" : "image";
    await this._putMedia(draft.mediaId, file);
    draft._pendingBg = null;
    draft.bgPublicUrl = await this._uploadToCloud(draft.id, "reward-bg", file);
    return draft;
  },

  async attachRewardCursor(file) {
    if (!file || !file.type.startsWith("image/")) throw new Error("Cursor must be PNG/JPG");
    if (file.size > 2 * 1024 * 1024) throw new Error("Cursor image max 2MB");
    const draft = this.rewardDraft();
    if (!draft.id) draft.id = `r_${Date.now()}`;
    draft._pendingCursor = file;
    draft.hasCursor = true;
    draft.cursorId = `${draft.id}-cursor`;
    await this._putMedia(draft.cursorId, file);
    draft._pendingCursor = null;
    draft.cursorPublicUrl = await this._uploadToCloud(draft.id, "reward-cursor", file);
    return draft;
  },

  async getMusicUrl(levelId) {
    const meta = this.getById(levelId);
    if (meta?.musicPublicUrl) return meta.musicPublicUrl;
    if (this._musicUrls.has(levelId)) return this._musicUrls.get(levelId);
    const blob = await this._getMusic(levelId);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    this._musicUrls.set(levelId, url);
    return url;
  },

  async getMediaUrl(mediaId) {
    if (!mediaId) return null;
    if (this._mediaUrls.has(mediaId)) return this._mediaUrls.get(mediaId);
    const blob = await this._getMedia(mediaId);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    this._mediaUrls.set(mediaId, url);
    return url;
  },

  _openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(CREATOR_DB, CREATOR_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("levels")) db.createObjectStore("levels");
        if (!db.objectStoreNames.contains("music")) db.createObjectStore("music");
        if (!db.objectStoreNames.contains("rewards")) db.createObjectStore("rewards");
        if (!db.objectStoreNames.contains("rewardMedia")) db.createObjectStore("rewardMedia");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async _loadAll() {
    const db = await this._openDb();
    this._levels = await this._getAll(db, "levels");
    this._rewards = await this._getAll(db, "rewards");
  },

  async _getAll(db, store) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async _putLevel(level) {
    const db = await this._openDb();
    await this._put(db, "levels", level, level.id);
  },

  async _putReward(reward) {
    const db = await this._openDb();
    await this._put(db, "rewards", reward, reward.id);
  },

  async _put(db, store, value, key) {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async _putMusic(levelId, file) {
    const db = await this._openDb();
    await this._put(db, "music", file, levelId);
  },

  async _putMedia(mediaId, file) {
    const db = await this._openDb();
    await this._put(db, "rewardMedia", file, mediaId);
  },

  async _getMusic(levelId) {
    const db = await this._openDb();
    return this._get(db, "music", levelId);
  },

  async _getMedia(mediaId) {
    const db = await this._openDb();
    return this._get(db, "rewardMedia", mediaId);
  },

  async _get(db, store, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },
};

function defaultCreatorDraft() {
  return {
    id: null,
    name: "",
    bpm: 96,
    hitWindowMs: 2200,
    bombFuse: 4,
    mechanics: { red: true, orange: false, purple: false, sliders: false, sliderRed: false },
    musicSource: "track",
    musicTrackId: 3,
    hasMusic: false,
    musicFileName: "",
    musicPublicUrl: null,
    rewardId: null,
    rewardName: "STAGE REWARD",
    rewardBg: [18, 8, 32],
    rewardGrid: [60, 30, 90],
    rewardAccent: [255, 80, 180],
    rewardMediaUrl: null,
    createdAt: 0,
    author: "",
  };
}

function defaultRewardDraft() {
  return {
    id: null,
    name: "MY REWARD",
    bg: [18, 8, 32],
    grid: [60, 30, 90],
    accent: [255, 80, 180],
    hasMedia: false,
    hasCursor: false,
    mediaId: null,
    cursorId: null,
    mediaType: null,
    mediaFileName: "",
    bgPublicUrl: null,
    cursorPublicUrl: null,
    createdAt: 0,
  };
}

function applyCreatorDraftToLevel(meta, musicUrl) {
  const m = meta.mechanics || {};
  const sliders = !!m.sliders;
  const rewardId = `creator-bg-${meta.id}`;
  const level = {
    id: meta.id,
    communityId: meta.id,
    community: true,
    creatorTest: !!meta.creatorTest,
    communityMusicUrl: meta.musicSource === "upload" ? (musicUrl || meta.musicPublicUrl || null) : null,
    musicSourceId: meta.musicSource === "track" ? `track${meta.musicTrackId || 1}` : null,
    name: meta.name?.trim() || "MY STAGE",
    bpm: meta.bpm,
    hitWindowMs: meta.hitWindowMs,
    bombFuse: meta.bombFuse,
    duration: 30,
    sliders,
    allowRed: !!m.red,
    allowOrange: !!m.orange,
    allowPurple: !!m.purple,
    sliderRed: sliders && !!m.sliderRed,
    redChance: m.red ? INFINITE_MECHANIC_DEFAULTS.redChance : 0,
    orangeChance: m.orange ? INFINITE_MECHANIC_DEFAULTS.orangeChance : 0,
    purpleChance: m.purple ? INFINITE_MECHANIC_DEFAULTS.purpleChance : 0,
    sliderChance: sliders ? INFINITE_MECHANIC_DEFAULTS.sliderChance : 0,
    sliderRedChance: sliders && m.sliderRed ? INFINITE_MECHANIC_DEFAULTS.sliderRedChance : 0,
    passScore: 0,
    clearXp: 0,
    tutorial: null,
    featureHint: `Community — ${meta.author || "Creator"}`,
    rewardBgId: rewardId,
    rewardName: meta.rewardName,
    rewardBg: meta.rewardBg,
    rewardGrid: meta.rewardGrid,
    rewardAccent: meta.rewardAccent,
    rewardMediaId: meta.rewardMediaId || null,
    playBg: {
      bg: meta.rewardBg,
      grid: meta.rewardGrid,
      accent: meta.rewardAccent,
      mediaId: meta.rewardMediaId || null,
      mediaUrl: meta.rewardMediaUrl || null,
    },
  };
  return level;
}

function unlockCommunityReward(save, level) {
  if (!level?.community || !level.rewardBgId) return;
  const bg = {
    id: level.rewardBgId,
    name: level.rewardName || "COMMUNITY BG",
    bg: level.rewardBg,
    grid: level.rewardGrid,
    accent: level.rewardAccent,
    mediaId: level.rewardMediaId || null,
    price: 0,
  };
  if (!save.creatorBackgrounds) save.creatorBackgrounds = [];
  if (!save.creatorBackgrounds.some((b) => b.id === bg.id)) save.creatorBackgrounds.push(bg);
  if (!save.ownedBackgrounds.includes(bg.id)) save.ownedBackgrounds.push(bg.id);
  if (!save.clearedCommunity) save.clearedCommunity = [];
  if (!save.clearedCommunity.includes(level.communityId)) save.clearedCommunity.push(level.communityId);
}

function adjustCreatorBpm(draft, delta) {
  const steps = [72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 128, 136, 142, 152, 160, 168];
  const idx = steps.findIndex((b) => b >= draft.bpm);
  const i = Math.max(0, (idx < 0 ? 0 : idx) + delta);
  draft.bpm = steps[Math.max(0, Math.min(steps.length - 1, i))];
}

function toggleCreatorMechanic(draft, key) {
  if (!draft.mechanics) draft.mechanics = defaultCreatorDraft().mechanics;
  draft.mechanics[key] = !draft.mechanics[key];
  if (key === "sliders" && !draft.mechanics.sliders) draft.mechanics.sliderRed = false;
}

function cycleCreatorTrack(draft, delta) {
  draft.musicTrackId = ((draft.musicTrackId || 1) - 1 + delta + LEVELS.length) % LEVELS.length + 1;
  draft.musicSource = "track";
  draft.hasMusic = false;
  draft._pendingMusic = null;
  draft.musicFileName = "";
  draft.musicPublicUrl = null;
}
