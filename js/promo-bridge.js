const PromoBridge = {
  install() {
    if (typeof SitePromo === "undefined") return;

    const origEndGame = App.endGame.bind(App);
    App.endGame = function (reason) {
      origEndGame(reason);
      SitePromo.onGameOver();
    };

    const origLoop = App.loop.bind(App);
    App.loop = function (now) {
      if (this.state === "menu") SitePromo.onEnterMenu(now);
      else SitePromo.onLeaveMenu();
      origLoop(now);
      if (this.sessionReady && !this.renderError && SitePromo.visible) {
        PromoUi.draw(Input.mousePos);
        this.renderCursor(this.save);
      }
    };

    const origHandleClick = Screens.handleClick.bind(Screens);
    Screens.handleClick = function (state, save, pos) {
      if (SitePromo.visible) return PromoUi.handleClick(pos);
      return origHandleClick(state, save, pos);
    };

    const origInit = App.init.bind(App);
    App.init = async function () {
      await origInit();
      App.canvas?.addEventListener("pointerdown", (e) => {
        if (!App.sessionReady || !SitePromo.visible) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        Input.syncPos(e.clientX, e.clientY);
        PromoUi.handleClick(Input.mousePos);
      }, true);
    };
  },
};

PromoBridge.install();
