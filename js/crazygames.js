const CrazyGamesSdk = {
  enabled() {
    return window.CYBERTIME_PORTAL === "crazygames" && window.CrazyGames?.SDK?.game;
  },

  call(method) {
    if (!this.enabled()) return;
    try {
      window.CrazyGames.SDK.game[method]();
    } catch (err) {
      console.warn(`CrazyGames SDK ${method}`, err);
    }
  },

  loadingStart() {
    this.call("sdkGameLoadingStart");
  },

  loadingStop() {
    this.call("sdkGameLoadingStop");
  },

  gameplayStart() {
    this.call("gameplayStart");
  },

  gameplayStop() {
    this.call("gameplayStop");
  },

  happytime() {
    this.call("happytime");
  },
};
