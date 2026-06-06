const CrazySDK = {
  ready: false,
  environment: "disabled",
  adPlaying: false,

  async init() {
    if (!window.CrazyGames?.SDK) {
      this.environment = "local";
      this.ready = true;
      return;
    }
    try {
      await Promise.race([
        window.CrazyGames.SDK.init(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      this.environment = window.CrazyGames.SDK.environment || "local";
      this.ready = true;
    } catch {
      this.environment = "local";
      this.ready = true;
    }
  },

  isAvailable() {
    return this.ready && !!window.CrazyGames?.SDK && this.environment !== "disabled";
  },

  hasData() {
    return this.isAvailable() && !!window.CrazyGames.SDK.data;
  },

  gameplayStart() {
    if (!this.isAvailable()) return;
    window.CrazyGames.SDK.game?.gameplayStart?.();
  },

  gameplayStop() {
    if (!this.isAvailable()) return;
    window.CrazyGames.SDK.game?.gameplayStop?.();
  },

  getCloudItem(key) {
    if (!this.hasData()) return null;
    try {
      return window.CrazyGames.SDK.data.getItem(key);
    } catch {
      return null;
    }
  },

  setCloudItem(key, value) {
    if (!this.hasData()) return;
    try {
      window.CrazyGames.SDK.data.setItem(key, value);
    } catch {}
  },

  async encryptScore(score, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const algorithm = { name: "AES-GCM", iv };
    const keyBytes = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
    const cryptoKey = await window.crypto.subtle.importKey("raw", keyBytes, algorithm, false, ["encrypt"]);
    const dataBuffer = new TextEncoder().encode(String(score));
    const encryptedBuffer = await window.crypto.subtle.encrypt(algorithm, cryptoKey, dataBuffer);
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    return btoa(String.fromCharCode(...combined));
  },

  async submitLevelScore(levelId, score) {
    if (!this.isAvailable() || !LEADERBOARD_ENCRYPTION_KEY) return;
    if (!window.CrazyGames.SDK.user?.submitScore) return;
    try {
      const encryptedScore = await this.encryptScore(score, LEADERBOARD_ENCRYPTION_KEY);
      window.CrazyGames.SDK.user.submitScore({ encryptedScore, score });
    } catch {}
  },

  requestMidgame(onDone) {
    this._requestAd("midgame", onDone, false);
  },

  requestRewarded(onDone) {
    this._requestAd("rewarded", onDone, true);
  },

  _requestAd(type, onDone, grantOnFinish) {
    if (!this.isAvailable()) {
      onDone(grantOnFinish);
      return;
    }
    const callbacks = {
      adStarted: () => {
        this.adPlaying = true;
        AudioEngine.stopMusic();
        if (App.game) App.game.paused = true;
      },
      adFinished: () => {
        this.adPlaying = false;
        if (App.game) App.game.paused = false;
        onDone(grantOnFinish);
      },
      adError: () => {
        this.adPlaying = false;
        if (App.game) App.game.paused = false;
        onDone(false);
      },
    };
    try {
      window.CrazyGames.SDK.ad.requestAd(type, callbacks);
    } catch {
      onDone(false);
    }
  },
};
