const CrazyGamesHooks = {
  _rewardPending: null,

  onGameOver(game, save) {
    if (!CrazyGamesSdk.enabled()) return;
    if (game.lastRewards?.success) {
      CrazyGamesSdk.submitScore(game.score);
    }
  },

  onMenu() {
    if (!CrazyGamesSdk.enabled()) return;
    CrazyGamesSdk.showMenuBanner();
  },

  onEnterGame() {
    if (!CrazyGamesSdk.enabled()) return;
    CrazyGamesSdk.hideBanners();
  },

  requestMidgameBefore(action) {
    if (!CrazyGamesSdk.enabled()) {
      action();
      return;
    }
    CrazyGamesSdk.requestMidgameAd({
      adFinished: action,
      adError: action,
    });
  },

  offerRewardedCoins(save, onDone) {
    if (!CrazyGamesSdk.enabled()) return;
    CrazyGamesSdk.requestRewardedAd({
      adFinished: () => {
        save.coins += 50;
        writeSave(save);
        onDone?.("Rewarded +50 coins!");
      },
      adError: () => onDone?.("Ad unavailable"),
    });
  },
};
