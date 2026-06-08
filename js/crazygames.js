const CrazyGamesSdk = {
  _adPlaying: false,
  _joinListener: null,
  _authListener: null,
  _lastFeedback: "",

  enabled() {
    return window.CYBERTIME_PORTAL === "crazygames" && !!window.CrazyGames?.SDK;
  },

  sdk() {
    return this.enabled() ? window.CrazyGames.SDK : null;
  },

  setFeedback(msg) {
    this._lastFeedback = msg;
    console.log("[CrazyGames]", msg);
  },

  call(module, method, ...args) {
    const sdk = this.sdk();
    if (!sdk?.[module]?.[method]) return null;
    try {
      return sdk[module][method](...args);
    } catch (err) {
      this.setFeedback(`${module}.${method} error`);
      console.warn(err);
      return null;
    }
  },

  wrapAdCallbacks(callbacks = {}) {
    return {
      adStarted: () => {
        this._adPlaying = true;
        this.gameplayStop();
        AudioEngine.stopMusic();
        callbacks.adStarted?.();
      },
      adFinished: () => {
        this._adPlaying = false;
        callbacks.adFinished?.();
      },
      adError: (error, errorData) => {
        this._adPlaying = false;
        callbacks.adError?.(error, errorData);
      },
    };
  },

  requestMidgameAd(callbacks) {
    this.call("ad", "requestAd", "midgame", this.wrapAdCallbacks(callbacks));
  },

  requestRewardedAd(callbacks) {
    this.call("ad", "requestAd", "rewarded", this.wrapAdCallbacks(callbacks));
  },

  requestBanner(width = 300, height = 250) {
    this.call("banner", "requestBanner", { id: CRAZYGAMES_BANNER_ID, width, height });
  },

  requestResponsiveBanner() {
    this.call("banner", "requestResponsiveBanner", CRAZYGAMES_RESPONSIVE_BANNER_ID);
  },

  clearBanner() {
    this.call("banner", "clearBanner", CRAZYGAMES_BANNER_ID);
  },

  clearAllBanners() {
    this.call("banner", "clearAllBanners");
  },

  loadingStart() {
    this.call("game", "sdkGameLoadingStart");
  },

  loadingStop() {
    this.call("game", "sdkGameLoadingStop");
  },

  gameplayStart() {
    if (!this._adPlaying) this.call("game", "gameplayStart");
  },

  gameplayStop() {
    this.call("game", "gameplayStop");
  },

  happytime() {
    this.call("game", "happytime");
  },

  inviteLink(params = { roomId: "demo" }) {
    return this.call("game", "inviteLink", params);
  },

  updateRoom(room = { roomId: "demo", isJoinable: true, inviteParams: { roomId: "demo" } }) {
    this.call("game", "updateRoom", room);
  },

  get inviteParams() {
    return this.sdk()?.game?.inviteParams ?? null;
  },

  showInviteButton(params = { roomId: "demo" }, callback) {
    return this.call("game", "showInviteButton", params, callback);
  },

  hideInviteButton() {
    this.call("game", "hideInviteButton");
  },

  addJoinRoomListener(listener) {
    this._joinListener = listener;
    this.call("game", "addJoinRoomListener", listener);
  },

  removeJoinRoomListener() {
    if (!this._joinListener) return;
    this.call("game", "removeJoinRoomListener", this._joinListener);
    this._joinListener = null;
  },

  async promiseUser(method) {
    const sdk = this.sdk();
    if (!sdk?.user?.[method]) return null;
    return new Promise((resolve, reject) => {
      sdk.user[method]((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  },

  showAuthPrompt() {
    return this.promiseUser("showAuthPrompt");
  },

  showAccountLinkPrompt() {
    return this.promiseUser("showAccountLinkPrompt");
  },

  getUser() {
    return this.promiseUser("getUser");
  },

  getUserToken() {
    return this.promiseUser("getUserToken");
  },

  getXsollaUserToken() {
    return this.promiseUser("getXsollaUserToken");
  },

  addAuthListener(listener) {
    this._authListener = listener;
    this.call("user", "addAuthListener", listener);
  },

  removeAuthListener() {
    if (!this._authListener) return;
    this.call("user", "removeAuthListener", this._authListener);
    this._authListener = null;
  },

  dataGetItem(key) {
    return this.call("data", "getItem", key);
  },

  dataSetItem(key, value) {
    this.call("data", "setItem", key, value);
  },

  dataRemoveItem(key) {
    this.call("data", "removeItem", key);
  },

  dataClear() {
    this.call("data", "clear");
  },

  trackOrder(order = { orderId: "demo-order", status: "done" }) {
    this.call("analytics", "trackOrder", "xsolla", order);
  },

  async encryptScore(score) {
    if (!CRAZYGAMES_LEADERBOARD_ENCRYPTION_KEY) return null;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const algorithm = { name: "AES-GCM", iv };
    const keyBytes = Uint8Array.from(atob(CRAZYGAMES_LEADERBOARD_ENCRYPTION_KEY), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, algorithm, false, ["encrypt"]);
    const dataBuffer = new TextEncoder().encode(String(score));
    const encryptedBuffer = await crypto.subtle.encrypt(algorithm, cryptoKey, dataBuffer);
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    return btoa(String.fromCharCode(...combined));
  },

  async submitScore(score) {
    if (!this.sdk()?.user?.submitScore) return;
    const encryptedScore = await this.encryptScore(score);
    if (!encryptedScore) {
      this.setFeedback("Set CRAZYGAMES_LEADERBOARD_ENCRYPTION_KEY to submit scores");
      return;
    }
    this.call("user", "submitScore", { encryptedScore, score });
    this.setFeedback(`Score submitted: ${score}`);
  },

  syncSave(save) {
    if (!this.sdk()?.data) return;
    try {
      this.dataSetItem(CRAZYGAMES_DATA_KEY, JSON.stringify(save));
    } catch {}
  },

  loadCloudSave() {
    if (!this.sdk()?.data) return null;
    try {
      const raw = this.dataGetItem(CRAZYGAMES_DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  showMenuBanner() {
    this.requestResponsiveBanner();
  },

  hideBanners() {
    this.clearAllBanners();
  },

  init() {
    if (!this.enabled()) return;
    this.addAuthListener((user) => {
      this.setFeedback(user ? `Logged in: ${user.username}` : "Auth listener");
    });
    this.addJoinRoomListener((params) => {
      this.setFeedback(`Join room: ${JSON.stringify(params)}`);
    });
    if (this.inviteParams) this.setFeedback(`Invite params: ${JSON.stringify(this.inviteParams)}`);
    const cloud = this.loadCloudSave();
    if (cloud) {
      try {
        writeSave(normalizeSave(cloud));
      } catch {}
    }
  },
};
