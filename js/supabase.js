const COMMUNITY_MEDIA_BUCKET = "community-media";

const CloudStore = {
  client: null,
  ready: false,
  pin: null,
  leaderboardCache: {},
  communityCache: null,

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

  communityPublicUrl(path) {
    if (!path || !this.client) return null;
    return this.client.storage.from(COMMUNITY_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  async uploadCommunityFile(prefix, kind, file) {
    if (!this.ready || !file) return null;
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${prefix}/${kind}.${ext}`;
    const { error } = await this.client.storage.from(COMMUNITY_MEDIA_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    });
    if (error) throw new Error(error.message || "Upload failed");
    return { path, url: this.communityPublicUrl(path) };
  },

  async publishCommunityLevel(playerName, levelMeta) {
    if (!this.ready || !this.pin) return { ok: false, reason: "Login required" };
    const { data, error } = await this.client.rpc("publish_community_level", {
      p_name: playerName,
      p_pin: this.pin,
      p_level: levelMeta,
    });
    if (error) return { ok: false, reason: "Cloud publish failed" };
    if (!data?.ok) return { ok: false, reason: data?.reason || "Cloud publish failed" };
    this.communityCache = null;
    return { ok: true, id: data.id };
  },

  async fetchCommunityLevels(search = "") {
    if (!this.ready) return null;
    const cacheKey = search.trim().toLowerCase();
    if (!cacheKey && this.communityCache) return this.communityCache;
    const { data, error } = await this.client.rpc("list_community_levels", {
      p_search: search.trim() || null,
    });
    if (error) return null;
    const rows = Array.isArray(data) ? data : [];
    if (!cacheKey) this.communityCache = rows;
    return rows;
  },
};
