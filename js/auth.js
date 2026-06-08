const DEVICE_SESSION_KEY = "cybertime-device-session";

const Auth = {
  NAME_KEY: "cybertime-player-name",
  displayName: null,

  init(onReady) {
    migrateLegacyPlayers();
    CloudStore.init();
    const session = this.getDeviceSession();
    if (session?.name && session?.pin) {
      const nameEl = document.getElementById("player-name");
      const pinEl = document.getElementById("player-pin");
      if (nameEl) nameEl.value = session.name;
      if (pinEl) pinEl.value = session.pin;
      this.login(session.name, session.pin).then(() => {
        this.hideNameScreen();
        onReady(true);
      });
      return;
    }
    this.hideNameScreen();
    onReady(true);
  },

  rememberDevice(name, pin) {
    localStorage.setItem(DEVICE_SESSION_KEY, JSON.stringify({ name: name.trim(), pin }));
  },

  getDeviceSession() {
    try {
      const raw = localStorage.getItem(DEVICE_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearDeviceSession() {
    localStorage.removeItem(DEVICE_SESSION_KEY);
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
        this.rememberDevice(cloud.name, pinCheck.pin);
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
        this.rememberDevice(canonical, pin);
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
      this.rememberDevice(canonical, pin);
    } catch {
      return { ok: false, reason: "Allow storage for this site" };
    }
    return { ok: true, name: this.displayName, isNew: true };
  },

  logout() {
    this.displayName = null;
    CloudStore.setPin(null);
    this.clearDeviceSession();
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
