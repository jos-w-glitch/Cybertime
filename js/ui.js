const Screens = {
  buttons: {},
  clickAreas: {},
  sliders: {},
  shopTab: "skins",
  selectedLevel: 1,
  waitingKey: null,
  scrollY: 0,
  listMaxScroll: 0,
  draggingSlider: false,
  draggingBgSlider: false,
  bgSliders: null,
  scrollDrag: null,
  infiniteSetup: { trackId: 1, mechanicIndex: 2, red: true, orange: true, sliders: false, sliderRed: false },
  shareFeedback: "",

  resetButtons() {
    this.buttons = {};
  },

  btn(id, label, x, y, w = null, h = 52) {
    const rect = buttonRect(App.ctx, label, x, y, w, h);
    this.buttons[id] = rect;
    return rect;
  },

  menuBtnY(index) {
    const start = Input.touchMode ? 290 : 340;
    const gap = Input.touchMode ? 84 : 65;
    return start + index * gap;
  },

  buttonStackGap() {
    return 12;
  },

  playBtnSize() {
    return Input.touchMode ? { w: 180, h: 62 } : { w: 140, h: 44 };
  },

  listRowHeight() {
    return Input.touchMode ? 84 : 76;
  },

  listTop() {
    return 120;
  },

  listViewportHeight() {
    return viewH() - 160;
  },

  updateListScrollMax(count) {
    const content = this.listTop() + count * this.listRowHeight();
    this.listMaxScroll = Math.max(0, content - (viewH() - 90));
    this.scrollY = Math.min(this.scrollY, this.listMaxScroll);
  },

  scrollList(delta) {
    this.scrollY = Math.max(0, Math.min(this.listMaxScroll, this.scrollY + delta));
  },

  scrollableState(state) {
    if (state === "shop") return true;
    if (!Input.touchMode) return false;
    return state === "levels";
  },

  beginScrollDrag(y) {
    this.scrollDrag = { startY: y, startScroll: this.scrollY };
  },

  updateScrollDrag(y) {
    if (!this.scrollDrag) return false;
    const delta = this.scrollDrag.startY - y;
    this.scrollY = Math.max(0, Math.min(this.listMaxScroll, this.scrollDrag.startScroll + delta));
    return Math.abs(delta) > 8;
  },

  endScrollDrag() {
    const dragged = !!this.scrollDrag?.dragged;
    this.scrollDrag = null;
    return dragged;
  },

  resetScroll() {
    this.scrollY = 0;
    this.listMaxScroll = 0;
  },

  defaultInfiniteSetup() {
    const setup = { trackId: 1, mechanicIndex: 2 };
    applyInfiniteMechanicPreset(setup, setup.mechanicIndex);
    return setup;
  },

  drawInfiniteCycleBlock(label, valueText, btnId, x, y, w, mousePos) {
    const btnH = btnHeight(Input.touchMode ? 52 : 44);
    const labelSize = Input.touchMode ? 20 : 22;
    const valueSize = Input.touchMode ? 24 : 28;
    const labelY = y;
    const valueY = y + (Input.touchMode ? 34 : 38);
    const btnY = y + (Input.touchMode ? 68 : 72);

    App.ctx.font = uiFont(labelSize);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.fillText(label, x, labelY);

    App.ctx.font = uiFont(valueSize);
    App.ctx.fillStyle = rgb(COLORS.text);
    const valueW = App.ctx.measureText(valueText).width;
    App.ctx.fillText(valueText, x + (w - valueW) / 2, valueY);

    const rect = this.btn(btnId, "NEXT", x, btnY, w, btnH);
    drawNeonButton(App.ctx, rect, "NEXT", pointInRect(mousePos, rect), true);
    return btnY + btnH + (Input.touchMode ? 28 : 32);
  },

  screenPad() {
    return Input.touchMode ? 32 : 80;
  },

  shopRowHeight() {
    return Input.touchMode ? 168 : 130;
  },

  shopListTop() {
    return Input.touchMode ? 188 : 190;
  },

  shopColorPanelHeight() {
    return this.shopTab === "backgrounds" ? 200 : 0;
  },

  shopItemCount() {
    if (this.shopTab === "skins") return MOUSE_SKINS.length;
    return BACKGROUNDS.length + 1;
  },

  updateShopScroll() {
    const content = this.shopListTop() + this.shopItemCount() * this.shopRowHeight() + this.shopColorPanelHeight();
    this.listMaxScroll = Math.max(0, content - (viewH() - 120));
    this.scrollY = Math.min(this.scrollY, this.listMaxScroll);
  },

  finishButtons() {
    this.clickAreas = { ...this.buttons };
  },

  canShareGame(game) {
    const r = game?.lastRewards;
    if (!r || game.score <= 0) return false;
    return r.success || r.infinite;
  },

  drawCenteredLines(ctx, lines, y, fontSize, color) {
    ctx.font = uiFont(fontSize);
    ctx.fillStyle = rgb(color);
    let drawY = y;
    lines.forEach((line) => {
      ctx.fillText(line, (viewW() - ctx.measureText(line).width) / 2, drawY);
      drawY += fontSize + 10;
    });
    return drawY;
  },

  drawMenu(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    App.ctx.font = gameFont(72);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText(GAME_NAME, (viewW() - App.ctx.measureText(GAME_NAME).width) / 2, 120);

    App.ctx.font = gameFont(22);
    App.ctx.fillStyle = rgb(COLORS.gold);
    const userLine = Auth.isLoggedIn()
      ? `PLAYER: ${Auth.displayName}`
      : "GUEST — login in Settings for leaderboard";
    App.ctx.fillText(userLine, (viewW() - App.ctx.measureText(userLine).width) / 2, 165);

    drawXpBar(App.ctx, save, 80, 200, 280);
    drawCoins(App.ctx, save, viewW() - 220, 215);

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.text);
    const best = save.highScores[1] || 0;
    const hs = `HIGH SCORE: ${best}`;
    App.ctx.fillText(hs, (viewW() - App.ctx.measureText(hs).width) / 2, 270);

    drawNeonButton(App.ctx, this.btn("start", "START", null, this.menuBtnY(0)), "START", pointInRect(mousePos, this.buttons.start));
    drawNeonButton(App.ctx, this.btn("levels", "LEVELS", null, this.menuBtnY(1)), "LEVELS", pointInRect(mousePos, this.buttons.levels));
    drawNeonButton(App.ctx, this.btn("infinite", "INFINITE", null, this.menuBtnY(2)), "INFINITE", pointInRect(mousePos, this.buttons.infinite));
    drawNeonButton(App.ctx, this.btn("shop", "SHOP", null, this.menuBtnY(3)), "SHOP", pointInRect(mousePos, this.buttons.shop));
    drawNeonButton(App.ctx, this.btn("settings", "SETTINGS", null, this.menuBtnY(4)), "SETTINGS", pointInRect(mousePos, this.buttons.settings));
    drawNeonButton(App.ctx, this.btn("howto", "HOW TO PLAY", null, this.menuBtnY(5)), "HOW TO PLAY", pointInRect(mousePos, this.buttons.howto), true);

    if (Input.touchMode) {
      App.ctx.font = gameFont(16);
      App.ctx.fillStyle = rgb(COLORS.green);
      const mobileHint = "MOBILE — tap targets directly";
      App.ctx.fillText(mobileHint, (viewW() - App.ctx.measureText(mobileHint).width) / 2, viewH() - 40);
    }
    this.finishButtons();
  },

  drawLevels(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    App.ctx.font = gameFont(48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SELECT STAGE", 80, 80);
    App.ctx.font = gameFont(18);
    App.ctx.fillStyle = rgb(COLORS.gray);
    App.ctx.fillText(`${LEVELS.length} stages — ${Input.touchMode ? "swipe to scroll" : "scroll with mouse wheel"}`, 80, 108);

    this.updateListScrollMax(LEVELS.length);
    const rowH = this.listRowHeight();
    const top = this.listTop();
    const play = this.playBtnSize();

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, top - 8, viewW(), this.listViewportHeight());
    App.ctx.clip();

    LEVELS.forEach((level) => {
      const i = level.id - 1;
      const y = top + i * rowH - this.scrollY;
      if (y + rowH < top || y > viewH() - 40) return;

      const unlocked = isLevelUnlocked(save, level);
      const cleared = isLevelCleared(save, level.id);
      const hs = save.highScores[level.id] || 0;
      const rect = this.btn(`level-${level.id}`, unlocked ? "PLAY" : "LOCKED", viewW() - play.w - 24, y - 8, play.w, play.h);

      App.ctx.font = gameFont(26);
      App.ctx.fillStyle = rgb(unlocked ? COLORS.text : COLORS.gray);
      App.ctx.fillText(`${level.id}. ${level.name}${cleared ? " ✓" : ""}`, 80, y + 18);
      App.ctx.font = gameFont(16);
      App.ctx.fillText(`${START_HEARTS} hearts | 30s | HS ${hs}`, 80, y + 42);
      App.ctx.fillStyle = rgb(COLORS.purple);
      App.ctx.fillText(level.featureHint, 80, y + 62);

      if (unlocked) {
        drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
      } else {
        const prev = getLevelById(level.id - 1);
        App.ctx.fillStyle = rgb(COLORS.gray);
        App.ctx.fillText(`Clear stage ${prev.id} first`, 80, y + 62);
      }
    });

    App.ctx.restore();

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, viewH() - 70), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawLevelLeaderboard(save, levelId, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    const level = getLevelById(levelId);
    const entries = getLeaderboard(save, levelId);
    const header = Auth.isLoggedIn()
      ? [`#1 prize: +${LEADERBOARD_FIRST_PRIZE} coins (once per stage)`]
      : ["Login to submit scores to the leaderboard"];
    const lines = entries.length
      ? entries.slice(0, LEADERBOARD_SIZE).map((entry, i) => `${i + 1}. ${entry.name} — ${entry.score}`)
      : ["No scores yet — clear this stage first!"];

    const btn = this.btn("lbClose", "BACK", null, null, 220, 52);
    btn.y = viewH() / 2 + 40 + (header.length + lines.length) * 36;
    drawModalPanel(
      App.ctx,
      `STAGE ${levelId} LEADERBOARD`,
      [level.name, "", ...header, "", ...lines],
      btn,
      "BACK",
      pointInRect(mousePos, btn),
    );
    this.finishButtons();
  },

  drawInfiniteSelect(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    const setup = this.infiniteSetup;
    const level = getLevelById(setup.trackId);
    const modeKey = buildInfiniteModeKey(setup.trackId, setup);
    const best = save.infiniteHighScores?.[modeKey] || 0;
    const pad = this.screenPad();
    const blockW = Input.touchMode ? viewW() - pad * 2 : 420;
    const blockX = Input.touchMode ? pad : 80;

    App.ctx.font = uiFont(Input.touchMode ? 40 : 48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("INFINITE MODE", blockX, Input.touchMode ? 72 : 80);
    App.ctx.font = uiFont(Input.touchMode ? 18 : 20);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText("Tap NEXT to cycle track and mechanics", blockX, Input.touchMode ? 102 : 115);

    let y = Input.touchMode ? 138 : 165;
    y = this.drawInfiniteCycleBlock(
      "TRACK",
      `${level.id}. ${level.name}`,
      "infCycleTrack",
      blockX,
      y,
      blockW,
      mousePos,
    );
    y = this.drawInfiniteCycleBlock(
      "MECHANICS",
      infiniteMechanicName(setup),
      "infCycleMechanics",
      blockX,
      y,
      blockW,
      mousePos,
    );

    App.ctx.font = uiFont(Input.touchMode ? 18 : 20);
    App.ctx.fillStyle = rgb(COLORS.green);
    App.ctx.fillText(`BEST SCORE: ${best}`, blockX, y + 8);

    const playW = Input.touchMode ? viewW() - pad * 2 : 260;
    const playX = Input.touchMode ? pad : null;
    const backY = viewH() - (Input.touchMode ? 90 : 70);
    const playY = backY - btnHeight(Input.touchMode ? 56 : 56) - this.buttonStackGap();
    const play = this.btn("infPlay", "PLAY", playX, playY, playW, btnHeight(Input.touchMode ? 56 : 56));
    drawNeonButton(App.ctx, play, "PLAY", pointInRect(mousePos, play));
    drawNeonButton(
      App.ctx,
      this.btn("back", "BACK", playX, backY, playW, btnHeight(52)),
      "BACK",
      pointInRect(mousePos, this.buttons.back),
    );
    this.finishButtons();
  },

  drawTutorial(tutorial, mousePos, now, save) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    const btn = this.btn("tutorialGo", "GOT IT", null, null, Input.touchMode ? 280 : 220, btnHeight(52));
    btn.y = viewH() / 2 + 80 + tutorial.lines.length * 18;
    drawModalPanel(
      App.ctx,
      tutorial.title,
      tutorial.lines,
      btn,
      "GOT IT",
      pointInRect(mousePos, btn),
    );
    this.buttons.tutorialGo = btn;
    this.finishButtons();
  },

  drawBgColorPanel(save, mousePos, y, pad, cardW) {
    App.ctx.fillStyle = "rgba(20,20,32,0.55)";
    App.ctx.fillRect(pad, y, cardW, 188);
    App.ctx.font = uiFont(Input.touchMode ? 22 : 24);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.fillText("FREE COLOR TUNE", pad + 16, y + 32);

    const sliderW = cardW - 32;
    const labels = { bg: "BACKGROUND", grid: "GRID", accent: "GLOW" };
    this.bgSliders = {};
    let sy = y + 48;
    for (const key of ["bg", "grid", "accent"]) {
      const slider = { x: pad + 16, y: sy + 20, w: sliderW - 32, label: labels[key] };
      this.bgSliders[key] = slider;
      drawSlider(App.ctx, slider, save.bgTuning?.[key] ?? 1);
      sy += 56;
    }
  },

  drawShop(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    const pad = this.screenPad();
    const items = this.shopTab === "skins" ? MOUSE_SKINS : BACKGROUNDS;
    const tabH = btnHeight(Input.touchMode ? 48 : 40);

    App.ctx.font = Input.touchMode ? uiFont(40) : gameFont(48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SHOP", pad, Input.touchMode ? 72 : 90);
    drawCoins(App.ctx, save, viewW() - (Input.touchMode ? 210 : 220), Input.touchMode ? 72 : 90);

    const tabW = Input.touchMode ? (viewW() - pad * 2 - 12) / 2 : 200;
    const tabY = Input.touchMode ? 108 : 120;
    const tabSkinsX = pad;
    const tabBgsX = Input.touchMode ? pad + tabW + 12 : 300;
    drawNeonButton(App.ctx, this.btn("tabSkins", Input.touchMode ? "SKINS" : "MOUSE SKINS", tabSkinsX, tabY, tabW, tabH), Input.touchMode ? "SKINS" : "MOUSE SKINS", this.shopTab === "skins", true);
    drawNeonButton(App.ctx, this.btn("tabBgs", Input.touchMode ? "BGS" : "BACKGROUNDS", tabBgsX, tabY, tabW, tabH), Input.touchMode ? "BGS" : "BACKGROUNDS", this.shopTab === "backgrounds", true);

    this.updateShopScroll();
    const rowH = this.shopRowHeight();
    const listTop = this.shopListTop();
    const cardW = viewW() - pad * 2;
    const actionH = btnHeight(Input.touchMode ? 48 : 36);
    const listBottom = viewH() - (Input.touchMode ? 100 : 90);

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, listTop - 8, viewW(), listBottom - listTop + 8);
    App.ctx.clip();

    items.forEach((item, i) => {
      const y = listTop + i * rowH - this.scrollY;
      if (y + rowH < listTop || y > listBottom) return;

      const owned = this.shopTab === "skins"
        ? save.ownedSkins.includes(item.id)
        : save.ownedBackgrounds.includes(item.id);
      const equipped = this.shopTab === "skins"
        ? save.equippedSkin === item.id
        : save.equippedBackground === item.id;

      App.ctx.fillStyle = "rgba(20,20,32,0.55)";
      App.ctx.fillRect(pad, y, cardW, rowH - 12);

      App.ctx.font = Input.touchMode ? uiFont(24) : gameFont(24);
      App.ctx.fillStyle = rgb(COLORS.text);
      App.ctx.fillText(item.name, pad + 16, y + 34);
      App.ctx.font = Input.touchMode ? uiFont(17) : gameFont(18);
      App.ctx.fillStyle = rgb(owned ? COLORS.green : COLORS.gold);
      App.ctx.fillText(owned ? (equipped ? "EQUIPPED" : "OWNED") : `${item.price} COINS`, pad + 16, y + 62);

      if (this.shopTab === "skins") {
        drawCursor(App.ctx, { x: pad + cardW - 72, y: y + 28 }, item);
      } else {
        drawBackgroundSwatch(App.ctx, pad + cardW - 88, y + 18, 64, 36, item, save);
      }

      const actionY = y + rowH - actionH - 20;
      if (owned && !equipped) {
        drawNeonButton(App.ctx, this.btn(`equip-${item.id}`, "EQUIP", pad + 12, actionY, cardW - 24, actionH), "EQUIP", pointInRect(mousePos, this.buttons[`equip-${item.id}`]), true);
      } else if (!owned) {
        drawNeonButton(App.ctx, this.btn(`buy-${item.id}`, "BUY", pad + 12, actionY, cardW - 24, actionH), "BUY", pointInRect(mousePos, this.buttons[`buy-${item.id}`]), true);
      }
    });

    if (this.shopTab === "backgrounds") {
      const panelY = listTop + items.length * rowH - this.scrollY;
      if (panelY + 188 >= listTop && panelY <= listBottom) {
        this.drawBgColorPanel(save, mousePos, panelY, pad, cardW);
      }
    }

    App.ctx.restore();

    const backY = viewH() - (Input.touchMode ? 90 : 70);
    const backW = Input.touchMode ? cardW : null;
    drawNeonButton(App.ctx, this.btn("back", "BACK", Input.touchMode ? pad : null, backY, backW, btnHeight(Input.touchMode ? 52 : 44)), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawSettings(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    App.ctx.font = gameFont(48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SETTINGS", 80, 90);

    this.sliders.music = { x: 80, y: 160, w: 400, label: "MUSIC" };
    this.sliders.sfx = { x: 80, y: 230, w: 400, label: "SFX" };
    drawSlider(App.ctx, this.sliders.music, save.settings.musicVolume);
    drawSlider(App.ctx, this.sliders.sfx, save.settings.sfxVolume);

    App.ctx.font = gameFont(24);
    App.ctx.fillStyle = rgb(COLORS.text);
    const playerLine = Auth.isLoggedIn()
      ? `PLAYER: ${Auth.displayName}`
      : "GUEST — scores won't appear on leaderboard";
    App.ctx.fillText(playerLine, 80, 310);
    if (!Input.touchMode) {
      App.ctx.fillText(`BALL: Mouse btn ${save.keys.ball} / Key ${save.keys.ballKey}`, 80, 350);
      App.ctx.fillText(`BOMB: Mouse btn ${save.keys.bomb} / Key ${save.keys.bombKey}`, 80, 390);
      drawNeonButton(App.ctx, this.btn("remapBall", "REMAP BALL KEY", 80, 420, 280, 44), this.waitingKey === "ball" ? "PRESS KEY..." : "REMAP BALL KEY", pointInRect(mousePos, this.buttons.remapBall), true);
      drawNeonButton(App.ctx, this.btn("remapBomb", "REMAP BOMB KEY", 380, 420, 280, 44), this.waitingKey === "bomb" ? "PRESS KEY..." : "REMAP BOMB KEY", pointInRect(mousePos, this.buttons.remapBomb), true);
    }

    const accountLabel = Auth.isLoggedIn() ? "LOGOUT" : "LOGIN";
    const accLabel = save.settings.accessibility ? "ACCESSIBILITY: ON" : "ACCESSIBILITY: OFF";
    const stackGap = this.buttonStackGap();
    const btnH = btnHeight(44);

    if (Input.touchMode) {
      const pad = this.screenPad();
      const btnW = viewW() - pad * 2;
      let y = 340;
      drawNeonButton(App.ctx, this.btn("toggleAccessibility", accLabel, pad, y, btnW, btnH), accLabel, pointInRect(mousePos, this.buttons.toggleAccessibility), true);
      y += btnH + stackGap;
      drawNeonButton(App.ctx, this.btn("account", accountLabel, pad, y, btnW, btnH), accountLabel, pointInRect(mousePos, this.buttons.account), true);
      y += btnH + stackGap;
      drawNeonButton(App.ctx, this.btn("toggleMobile", "MOBILE: ON", pad, y, btnW, btnH), "MOBILE: ON", pointInRect(mousePos, this.buttons.toggleMobile), true);
      if (!PwaInstall.isStandalone()) {
        y += btnH + stackGap;
        const installLabel = PwaInstall.canPromptInstall() ? "INSTALL APP" : "ADD TO HOME";
        drawNeonButton(App.ctx, this.btn("installApp", installLabel, pad, y, btnW, btnHeight(48)), installLabel, pointInRect(mousePos, this.buttons.installApp), true);
        if (PwaInstall.isIos() && !PwaInstall.canPromptInstall()) {
          App.ctx.font = uiFont(15);
          App.ctx.fillStyle = rgb(COLORS.gray);
          App.ctx.fillText(PwaInstall.iosHint(), pad, y + btnHeight(48) + 28);
        }
      }
    } else {
      const settingsY = 490;
      drawNeonButton(App.ctx, this.btn("toggleAccessibility", accLabel, 80, settingsY - 70, 580, btnH), accLabel, pointInRect(mousePos, this.buttons.toggleAccessibility), true);
      drawNeonButton(App.ctx, this.btn("account", accountLabel, 80, settingsY, 180, btnH), accountLabel, pointInRect(mousePos, this.buttons.account), true);
      drawNeonButton(App.ctx, this.btn("toggleMobile", Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", 280, settingsY, 220, btnH), Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", pointInRect(mousePos, this.buttons.toggleMobile), true);
    }

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, viewH() - 70), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawHowTo(mousePos, now, save) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    let y = 80;
    getHowToLines().forEach((line, i) => {
      if (!line) { y += 10; return; }
      App.ctx.font = i === 0 ? gameFont(40) : gameFont(22);
      App.ctx.fillStyle = rgb(i === 0 ? COLORS.blue : COLORS.text);
      App.ctx.fillText(line, (viewW() - App.ctx.measureText(line).width) / 2, y);
      y += i === 0 ? 44 : 32;
    });

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawGameScreen(game, now, save) {
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    if (!game.started) {
      game.startTarget.draw(App.ctx);
      GameLogic.drawHud(App.ctx, game, game.level, save);
      return;
    }
    game.nextTarget.draw(App.ctx, now);
    if (game.purplePartner?.isActive) game.purplePartner.draw(App.ctx, now);
    game.currentTarget.draw(App.ctx, now);
    game.goldenBonus?.draw(App.ctx, now);
    game.flippedTargets.forEach((pt) => pt.draw(App.ctx));
    game.floatingTexts.forEach((ft) => ft.draw(App.ctx));
    GameLogic.drawHud(App.ctx, game, game.level, save);
    GameLogic.drawMobileControls(App.ctx, game.level);
  },

  drawGameOver(game, save, mousePos, now, homeHovered) {
    if (!game) return;
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    drawHomeButton(App.ctx, mousePos, homeHovered);
    this.buttons.home = homeButtonRect();

    const success = game.lastRewards?.success;
    const infinite = game.level.infinite;
    const title = success ? "LEVEL COMPLETE" : (game.failMessage || "GAME OVER");
    const titleColor = success ? COLORS.green : COLORS.red;

    App.ctx.font = success ? gameFont(58) : gameFont(52);
    App.ctx.fillStyle = rgb(titleColor);
    App.ctx.fillText(title, (viewW() - App.ctx.measureText(title).width) / 2, 130);

    const r = game.lastRewards || {};
    App.ctx.font = gameFont(28);
    App.ctx.fillStyle = rgb(COLORS.text);
    const statLines = infinite
      ? [
          `SCORE: ${game.score}`,
          r.newBest ? "NEW BEST!" : `BEST: ${r.best || 0}`,
          game.endReason === "hearts" ? "Ran out of hearts" : null,
          `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
        ].filter(Boolean)
      : success
        ? [
            `SCORE: ${game.score}`,
            r.stageXp ? `+${r.xpGain} XP (+${r.stageXp} stage)` : `+${r.xpGain} XP`,
            `+${r.coinGain} COINS`,
            r.leaderboardPrize ? `#1 LEADERBOARD BONUS: +${r.leaderboardPrize} COINS!` : null,
            r.guestScore ? "Login to appear on leaderboard" : null,
          ].filter(Boolean)
        : [
            `SCORE: ${game.score}`,
            game.endReason === "hearts" ? "Ran out of hearts" : "Keep your hearts!",
            `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
          ];
    statLines.forEach((line, i) => {
      App.ctx.fillText(line, (viewW() - App.ctx.measureText(line).width) / 2, 200 + i * 36);
    });

    const canShare = this.canShareGame(game);
    let blockY = 200 + statLines.length * 36 + 24;
    if (canShare) {
      blockY = this.drawCenteredLines(
        App.ctx,
        [Share.buildMessage(game.score, game.level)],
        blockY,
        Input.touchMode ? 18 : 20,
        COLORS.gold,
      ) + 8;
      const shareBtn = this.btn("share", Share.shareLabel(), null, blockY, null, btnHeight(48));
      const shareReady = Share._status === "ready";
      drawNeonButton(App.ctx, shareBtn, Share.shareLabel(), pointInRect(mousePos, shareBtn) && shareReady, true);
      blockY = shareBtn.y + shareBtn.h + 12;
      if (this.shareFeedback) {
        App.ctx.font = uiFont(16);
        App.ctx.fillStyle = rgb(COLORS.green);
        const note = this.shareFeedback;
        App.ctx.fillText(note, (viewW() - App.ctx.measureText(note).width) / 2, blockY);
        blockY += 24;
      }
    }

    const btnY = viewH() - (Input.touchMode ? 110 : 90);
    if (!infinite) {
      const leaderboardY = canShare ? Math.min(blockY + 8, btnY - 170) : 330;
      drawLeaderboardPanel(App.ctx, save, game.level.id, 80, leaderboardY);
    }

    if (success && r.unlockedNext && !infinite) {
      drawNeonButton(App.ctx, this.btn("next", "NEXT", null, btnY), "NEXT", pointInRect(mousePos, this.buttons.next));
    } else if (!success) {
      drawNeonButton(App.ctx, this.btn("restart", "RESTART", null, btnY), "RESTART", pointInRect(mousePos, this.buttons.restart));
    } else {
      drawNeonButton(App.ctx, this.btn("restart", "RETRY", null, btnY), "RETRY", pointInRect(mousePos, this.buttons.restart));
    }
    this.finishButtons();
  },

  handleClick(state, save, pos) {
    if (state === "menu") {
      if (this._hit("start", pos)) { App.requestStartGame(getLevelById(1)); return true; }
      if (this._hit("levels", pos)) { this.resetScroll(); App.state = "levels"; return true; }
      if (this._hit("infinite", pos)) {
        this.infiniteSetup = this.defaultInfiniteSetup();
        App.state = "infinite";
        return true;
      }
      if (this._hit("shop", pos)) { this.resetScroll(); App.state = "shop"; return true; }
      if (this._hit("settings", pos)) { App.state = "settings"; return true; }
      if (this._hit("howto", pos)) { App.state = "howto"; return true; }
    }

    if (state === "levels") {
      if (App.leaderboardLevelId) {
        if (this._hit("lbClose", pos)) {
          App.leaderboardLevelId = null;
          return true;
        }
        return true;
      }
      for (const level of LEVELS) {
        if (isLevelUnlocked(save, level) && this._hit(`level-${level.id}`, pos)) {
          App.requestStartGame(level);
          return true;
        }
      }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "infinite") {
      const setup = this.infiniteSetup;
      if (this._hit("infCycleTrack", pos)) {
        cycleInfiniteTrack(setup);
        return true;
      }
      if (this._hit("infCycleMechanics", pos)) {
        cycleInfiniteMechanics(setup);
        return true;
      }
      if (this._hit("infPlay", pos)) {
        App.launchGame(createInfiniteLevel(getLevelById(setup.trackId), setup));
        return true;
      }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "tutorial" && this._hit("tutorialGo", pos)) {
      App.confirmTutorial();
      return true;
    }

    if (state === "shop") {
      if (this._hit("tabSkins", pos)) { this.shopTab = "skins"; this.resetScroll(); this.bgSliders = null; return true; }
      if (this._hit("tabBgs", pos)) { this.shopTab = "backgrounds"; this.resetScroll(); this.bgSliders = null; return true; }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
      if (this.shopTab === "backgrounds") {
        this._handleShopBgSliderDrag(save, pos);
        if (this.draggingBgSlider) return true;
      }
      return this._handleShopPurchase(save, pos);
    }

    if (state === "settings") {
      if (this._hit("remapBall", pos)) { this.waitingKey = "ball"; return true; }
      if (this._hit("remapBomb", pos)) { this.waitingKey = "bomb"; return true; }
      if (this._hit("toggleMobile", pos)) {
        Input.touchMode = !Input.touchMode;
        applyViewport(App.canvas);
        App.stars = createStars();
        MobileShell.syncRotatePrompt();
        if (App.canvas) App.canvas.style.cursor = Input.touchMode ? "default" : "none";
        return true;
      }
      if (this._hit("toggleAccessibility", pos)) {
        save.settings.accessibility = !save.settings.accessibility;
        writeSave(save);
        return true;
      }
      if (this._hit("account", pos)) {
        if (Auth.isLoggedIn()) App.logout();
        else App.showLogin();
        return true;
      }
      if (this._hit("installApp", pos)) {
        if (PwaInstall.canPromptInstall()) PwaInstall.promptInstall();
        return true;
      }
      if (this._hit("back", pos)) { App.state = "menu"; this.waitingKey = null; return true; }
      this._handleSliderDrag(save, pos);
    }

    if (state === "howto" && this._hit("back", pos)) { App.state = "menu"; return true; }

    if (state === "gameover") {
      if (this._hit("home", pos)) { App.goHome(); return true; }
      if (this._hit("share", pos)) {
        if (Share._status !== "ready") return true;
        Share.shareScore(App.game).then((result) => {
          if (result === "downloaded") {
            Screens.shareFeedback = "Image saved!";
          } else if (result === "saved") {
            Screens.shareFeedback = "Image saved!";
          } else if (result === "shared") {
            Screens.shareFeedback = "Image shared!";
          } else if (result === "failed") {
            Screens.shareFeedback = "Could not share image";
          } else {
            Screens.shareFeedback = "";
            return;
          }
          setTimeout(() => { Screens.shareFeedback = ""; }, 3000);
        });
        return true;
      }
      if (this._hit("next", pos)) { App.startNextLevel(); return true; }
      if (this._hit("restart", pos)) { App.requestStartGame(App.lastLevel); return true; }
    }

    return false;
  },

  _hit(id, pos) {
    const rect = this.clickAreas[id] || this.buttons[id];
    return rect && pointInRect(pos, rect);
  },

  _handleShopPurchase(save, pos) {
    const items = this.shopTab === "skins" ? MOUSE_SKINS : BACKGROUNDS;
    for (const item of items) {
      if (this._hit(`buy-${item.id}`, pos)) {
        const col = this.shopTab === "skins" ? "ownedSkins" : "ownedBackgrounds";
        const result = purchaseItem(save, item.price, col, item.id);
        if (result.ok) {
          if (this.shopTab === "skins") save.equippedSkin = item.id;
          else {
            save.equippedBackground = item.id;
            save.bgTuning = defaultBgTuning();
          }
          writeSave(save);
        }
        return true;
      }
      if (this._hit(`equip-${item.id}`, pos)) {
        if (this.shopTab === "skins") save.equippedSkin = item.id;
        else {
          save.equippedBackground = item.id;
          save.bgTuning = defaultBgTuning();
        }
        writeSave(save);
        return true;
      }
    }
    return false;
  },

  _handleShopBgSliderDrag(save, pos) {
    if (!this.bgSliders) return;
    for (const key of ["bg", "grid", "accent"]) {
      const slider = this.bgSliders[key];
      if (!slider) continue;
      const track = { x: slider.x, y: slider.y - 10, w: slider.w, h: 28 };
      if (this.draggingBgSlider || pointInRect(pos, track)) {
        this.draggingBgSlider = true;
        save.bgTuning = { ...defaultBgTuning(), ...save.bgTuning };
        save.bgTuning[key] = sliderValueFromPos(slider, pos);
        writeSave(save);
        return;
      }
    }
  },

  _handleSliderDrag(save, pos) {
    for (const key of ["music", "sfx"]) {
      const slider = this.sliders[key];
      if (!slider) continue;
      const track = { x: slider.x, y: slider.y - 8, w: slider.w, h: 28 };
      if (this.draggingSlider || pointInRect(pos, track)) {
        this.draggingSlider = true;
        save.settings[`${key}Volume`] = sliderValueFromPos(slider, pos);
        writeSave(save);
        AudioEngine.setVolumes(save.settings);
        return;
      }
    }
  },
};
