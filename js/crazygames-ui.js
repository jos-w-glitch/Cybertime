const CrazyGamesUi = {
  scrollY: 0,
  maxScroll: 0,
  feedback: "",

  actions() {
    return [
      ["cgMidgame", "MIDGAME AD", () => CrazyGamesSdk.requestMidgameAd({ adFinished: () => this.flash("Midgame done") })],
      ["cgRewarded", "REWARDED AD", () => CrazyGamesSdk.requestRewardedAd({ adFinished: () => this.flash("Rewarded done") })],
      ["cgBanner", "REQUEST BANNER", () => { CrazyGamesSdk.requestBanner(); this.flash("Banner requested"); }],
      ["cgRespBanner", "RESPONSIVE BANNER", () => { CrazyGamesSdk.requestResponsiveBanner(); this.flash("Responsive banner"); }],
      ["cgClearBanner", "CLEAR BANNER", () => { CrazyGamesSdk.clearBanner(); this.flash("Banner cleared"); }],
      ["cgClearAll", "CLEAR ALL BANNERS", () => { CrazyGamesSdk.clearAllBanners(); this.flash("All cleared"); }],
      ["cgHappy", "HAPPYTIME", () => { CrazyGamesSdk.happytime(); this.flash("Happytime"); }],
      ["cgGpStart", "GAMEPLAY START", () => { CrazyGamesSdk.gameplayStart(); this.flash("Gameplay start"); }],
      ["cgGpStop", "GAMEPLAY STOP", () => { CrazyGamesSdk.gameplayStop(); this.flash("Gameplay stop"); }],
      ["cgLoadStart", "LOADING START", () => { CrazyGamesSdk.loadingStart(); this.flash("Loading start"); }],
      ["cgLoadStop", "LOADING STOP", () => { CrazyGamesSdk.loadingStop(); this.flash("Loading stop"); }],
      ["cgInvite", "INVITE LINK", () => this.flash(CrazyGamesSdk.inviteLink() || "Invite link")],
      ["cgRoom", "UPDATE ROOM", () => { CrazyGamesSdk.updateRoom(); this.flash("Room updated"); }],
      ["cgShowInv", "SHOW INVITE BTN", () => { CrazyGamesSdk.showInviteButton(); this.flash("Invite button"); }],
      ["cgHideInv", "HIDE INVITE BTN", () => { CrazyGamesSdk.hideInviteButton(); this.flash("Invite hidden"); }],
      ["cgAuth", "AUTH PROMPT", () => CrazyGamesSdk.showAuthPrompt().then((u) => this.flash(u?.username || "Auth done")).catch(() => this.flash("Auth failed"))],
      ["cgLink", "LINK ACCOUNT", () => CrazyGamesSdk.showAccountLinkPrompt().then((r) => this.flash(JSON.stringify(r))).catch(() => this.flash("Link failed"))],
      ["cgUser", "GET USER", () => CrazyGamesSdk.getUser().then((u) => this.flash(u?.username || "No user")).catch(() => this.flash("Get user failed"))],
      ["cgToken", "GET USER TOKEN", () => CrazyGamesSdk.getUserToken().then((t) => this.flash(t ? "Token OK" : "No token")).catch(() => this.flash("Token failed"))],
      ["cgXsolla", "GET XSOLLA TOKEN", () => CrazyGamesSdk.getXsollaUserToken().then((t) => this.flash(t ? "Xsolla OK" : "No token")).catch(() => this.flash("Xsolla failed"))],
      ["cgScore", "SUBMIT SCORE", () => CrazyGamesSdk.submitScore(100)],
      ["cgSet", "DATA SET", () => { CrazyGamesSdk.dataSetItem("cg-test", "1"); this.flash("Data set"); }],
      ["cgGet", "DATA GET", () => this.flash(CrazyGamesSdk.dataGetItem("cg-test") || "null")],
      ["cgRm", "DATA REMOVE", () => { CrazyGamesSdk.dataRemoveItem("cg-test"); this.flash("Data removed"); }],
      ["cgClr", "DATA CLEAR", () => { CrazyGamesSdk.dataClear(); this.flash("Data cleared"); }],
      ["cgOrder", "TRACK ORDER", () => { CrazyGamesSdk.trackOrder(); this.flash("Order tracked"); }],
    ];
  },

  flash(msg) {
    this.feedback = msg;
    CrazyGamesSdk.setFeedback(msg);
  },

  rowHeight() {
    return Input.touchMode ? 52 : 44;
  },

  updateScroll() {
    const rows = this.actions().length;
    const content = 150 + rows * (this.rowHeight() + 8);
    this.maxScroll = Math.max(0, content - (viewH() - 120));
    this.scrollY = Math.min(this.scrollY, this.maxScroll);
  },

  draw(save, mousePos, now) {
    Screens.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, App.stars);
    this.updateScroll();

    App.ctx.font = gameFont(Input.touchMode ? 36 : 44);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("CRAZYGAMES SDK", Input.touchMode ? 32 : 80, Input.touchMode ? 64 : 72);

    const pad = Input.touchMode ? 32 : 80;
    const btnW = viewW() - pad * 2;
    const btnH = this.rowHeight();
    let y = 120 - this.scrollY;

    this.actions().forEach(([id, label, run]) => {
      if (y + btnH > 100 && y < viewH() - 80) {
        const rect = Screens.btn(id, label, pad, y, btnW, btnH);
        drawNeonButton(App.ctx, rect, label, pointInRect(mousePos, rect), true);
      }
      y += btnH + 8;
    });

    if (this.feedback || CrazyGamesSdk._lastFeedback) {
      App.ctx.font = uiFont(16);
      App.ctx.fillStyle = rgb(COLORS.green);
      const note = this.feedback || CrazyGamesSdk._lastFeedback;
      App.ctx.fillText(note, pad, viewH() - 100);
    }

    drawNeonButton(App.ctx, Screens.btn("back", "BACK", null, viewH() - 70), "BACK", pointInRect(mousePos, Screens.buttons.back));
    Screens.finishButtons();
  },

  handleClick(pos) {
    if (Screens._hit("back", pos)) {
      App.state = "settings";
      return true;
    }
    for (const [id, , run] of this.actions()) {
      if (Screens._hit(id, pos)) {
        run();
        return true;
      }
    }
    return true;
  },
};
