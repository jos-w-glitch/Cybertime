const CrazyGamesBridge = {
  install() {
    if (window.CYBERTIME_PORTAL !== "crazygames") return;

    const origWriteSave = writeSave;
    writeSave = (data) => {
      if (CrazyGamesSdk.enabled()) CrazyGamesSdk.syncSave(data);
      return origWriteSave(data);
    };

    const origInit = App.init.bind(App);
    App.init = async function () {
      await origInit();
      CrazyGamesSdk.init();
    };

    const origStartSession = App.startSession.bind(App);
    App.startSession = function (guestSave) {
      origStartSession(guestSave);
      if (!App.sessionReady) return;
      CrazyGamesSdk.loadingStop();
      if (App.state === "menu") CrazyGamesHooks.onMenu();
    };

    const origGoHome = App.goHome.bind(App);
    App.goHome = function () {
      CrazyGamesSdk.gameplayStop();
      origGoHome();
      CrazyGamesHooks.onMenu();
    };

    const origLaunchGame = App.launchGame.bind(App);
    App.launchGame = async function (level) {
      CrazyGamesSdk.gameplayStop();
      CrazyGamesHooks.onEnterGame();
      await origLaunchGame(level);
    };

    const origBeginGame = App.beginGame.bind(App);
    App.beginGame = function (now) {
      origBeginGame(now);
      if (App.game?.started) CrazyGamesSdk.gameplayStart();
    };

    const origEndGame = App.endGame.bind(App);
    App.endGame = function (reason) {
      CrazyGamesSdk.gameplayStop();
      origEndGame(reason);
      if (App.game?.lastRewards?.success) CrazyGamesSdk.happytime();
      CrazyGamesHooks.onGameOver(App.game, App.save);
    };

    const origLoop = App.loop.bind(App);
    App.loop = function (now) {
      if (App.state === "cg-sdk" && App.sessionReady && !App.renderError) {
        const mousePos = Input.mousePos;
        try {
          clearFrame(App.ctx);
          CrazyGamesUi.draw(App.save, mousePos, now);
          App.renderCursor(App.save);
        } catch (err) {
          console.error(err);
          App.renderError = err?.message || "Render failed";
        }
        requestAnimationFrame((t) => App.loop(t));
        return;
      }
      origLoop(now);
    };

    window.addEventListener("wheel", (e) => {
      if (App.state !== "cg-sdk") return;
      CrazyGamesUi.scrollY = Math.max(0, Math.min(CrazyGamesUi.maxScroll, CrazyGamesUi.scrollY + e.deltaY * 0.6));
      e.preventDefault();
    }, { passive: false });

    this.installUiHooks();
  },

  installUiHooks() {
    const origDrawSettings = Screens.drawSettings.bind(Screens);
    Screens.drawSettings = function (save, mousePos, now) {
      origDrawSettings(save, mousePos, now);
      if (!CrazyGamesSdk.enabled()) return;
      const btnH = btnHeight(44);
      if (Input.touchMode) {
        const pad = Screens.screenPad();
        const btnW = viewW() - pad * 2;
        const stackGap = Screens.buttonStackGap();
        const y = 340 + (btnH + stackGap) * 3;
        drawNeonButton(App.ctx, Screens.btn("cgSdk", "SDK PANEL", pad, y, btnW, btnH), "SDK PANEL", pointInRect(mousePos, Screens.buttons.cgSdk), true);
      } else {
        drawNeonButton(App.ctx, Screens.btn("cgSdk", "SDK PANEL", 520, 490, 140, btnH), "SDK PANEL", pointInRect(mousePos, Screens.buttons.cgSdk), true);
      }
      Screens.finishButtons();
    };

    const origDrawGameOver = Screens.drawGameOver.bind(Screens);
    Screens.drawGameOver = function (game, save, mousePos, now, homeHovered) {
      origDrawGameOver(game, save, mousePos, now, homeHovered);
      if (!CrazyGamesSdk.enabled()) return;
      const anchor = Screens.buttons.next || Screens.buttons.restart;
      if (!anchor) return;
      const rewardBtn = Screens.btn("cgReward", "WATCH AD +50 COINS", null, anchor.y - btnHeight(48) - 12, null, btnHeight(44));
      drawNeonButton(App.ctx, rewardBtn, "WATCH AD +50 COINS", pointInRect(mousePos, rewardBtn), true);
      Screens.buttons.cgReward = rewardBtn;
      Screens.finishButtons();
    };

    const origHandleClick = Screens.handleClick.bind(Screens);
    Screens.handleClick = function (state, save, pos) {
      if (state === "cg-sdk") return CrazyGamesUi.handleClick(pos);
      if (state === "settings" && Screens._hit("cgSdk", pos)) {
        CrazyGamesUi.scrollY = 0;
        App.state = "cg-sdk";
        return true;
      }
      if (state === "gameover") {
        if (Screens._hit("cgReward", pos)) {
          CrazyGamesHooks.offerRewardedCoins(save, (msg) => {
            Screens.shareFeedback = msg;
            setTimeout(() => { Screens.shareFeedback = ""; }, 2500);
          });
          return true;
        }
        if (Screens._hit("next", pos)) {
          CrazyGamesHooks.requestMidgameBefore(() => App.startNextLevel());
          return true;
        }
        if (Screens._hit("restart", pos)) {
          CrazyGamesHooks.requestMidgameBefore(() => App.requestStartGame(App.lastLevel));
          return true;
        }
      }
      return origHandleClick(state, save, pos);
    };

    const origShopPurchase = Screens._handleShopPurchase.bind(Screens);
    Screens._handleShopPurchase = function (save, pos) {
      const items = Screens.shopTab === "skins" ? MOUSE_SKINS : BACKGROUNDS;
      for (const item of items) {
        if (Screens._hit(`buy-${item.id}`, pos)) {
          const handled = origShopPurchase(save, pos);
          if (handled && CrazyGamesSdk.enabled()) {
            CrazyGamesSdk.trackOrder({ orderId: `shop-${item.id}`, status: "done" });
          }
          return handled;
        }
      }
      return origShopPurchase(save, pos);
    };
  },
};

CrazyGamesBridge.install();
