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
