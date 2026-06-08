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

  buttonStackGap() {
    return Input.touchMode ? 20 : 12;
  },

  actionButtonWidth() {
    return Math.min(520, viewW() - this.screenPad() * 2);
  },

  actionButtonX(width = null) {
    const w = width ?? this.actionButtonWidth();
    return (viewW() - w) / 2;
  },

  bottomActionY(btnH = null) {
    const h = btnH ?? uiBtnHeight(48);
    return viewH() - 72 - h;
  },

  drawActionButton(id, label, y, mousePos, opts = {}) {
    const w = opts.w ?? this.actionButtonWidth();
    const h = opts.h ?? uiBtnHeight(opts.small ? 44 : 48);
    const x = opts.x ?? this.actionButtonX(w);
    const rect = this.btn(id, label, x, y, w, h);
    drawNeonButton(App.ctx, rect, label, pointInRect(mousePos, rect), !!opts.small);
    return rect;
  },

  menuGrid() {
    const fullW = this.actionButtonWidth();
    const x = this.actionButtonX(fullW);
    const gap = this.buttonStackGap();
    const colGap = gap;
    const halfW = (fullW - colGap) / 2;
    const primaryH = uiBtnHeight(58);
    const rowH = uiBtnHeight(46);
    let y = Input.touchMode ? 288 : 308;

    const slots = {
      start: { x, y, w: fullW, h: primaryH },
      levels: { x, y: y + primaryH + gap, w: halfW, h: rowH },
      creator: { x: x + halfW + colGap, y: y + primaryH + gap, w: halfW, h: rowH },
      infinite: { x, y: y + primaryH + gap + rowH + gap, w: halfW, h: rowH },
      shop: { x: x + halfW + colGap, y: y + primaryH + gap + rowH + gap, w: halfW, h: rowH },
      settings: { x, y: y + primaryH + gap + (rowH + gap) * 2, w: halfW, h: rowH },
      howto: { x: x + halfW + colGap, y: y + primaryH + gap + (rowH + gap) * 2, w: halfW, h: rowH },
    };
    const panel = {
      x: x - 18,
      y: slots.start.y - 18,
      w: fullW + 36,
      h: slots.howto.y + slots.howto.h - slots.start.y + 36,
    };
    return { slots, panel };
  },

  drawMenuSlot(id, label, slot, mousePos, small = true) {
    const rect = this.btn(id, label, slot.x, slot.y, slot.w, slot.h);
    drawNeonButton(App.ctx, rect, label, pointInRect(mousePos, rect), small);
    return rect;
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
    if (state === "shop" || state === "creator") return true;
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
    return listShopBackgrounds(Input.save || App.save).length + 1;
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

    const menu = this.menuGrid();
    drawUiPanel(App.ctx, menu.panel);
    this.drawMenuSlot("start", "START", menu.slots.start, mousePos, false);
    this.drawMenuSlot("levels", "LEVELS", menu.slots.levels, mousePos);
    CreatorUi.drawMenuSlot(menu.slots.creator, mousePos);
    this.drawMenuSlot("infinite", "INFINITE", menu.slots.infinite, mousePos);
    this.drawMenuSlot("shop", "SHOP", menu.slots.shop, mousePos);
    this.drawMenuSlot("settings", "SETTINGS", menu.slots.settings, mousePos);
    this.drawMenuSlot("howto", "HOW TO", menu.slots.howto, mousePos);

    if (Input.touchMode) {
      App.ctx.font = gameFont(16);
      App.ctx.fillStyle = rgb(COLORS.green);
      const mobileHint = "MOBILE — tap targets directly";
      App.ctx.fillText(mobileHint, (viewW() - App.ctx.measureText(mobileHint).width) / 2, viewH() - 40);
    }
    this.finishButtons();
  },

  drawLevels(save, mousePos, now) {
    CreatorUi.drawLevels(save, mousePos, now);
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

    const panelTop = Input.touchMode ? 128 : 158;
    const panelH = Input.touchMode ? 230 : 210;
    drawUiPanel(App.ctx, { x: blockX - 16, y: panelTop - 10, w: blockW + 32, h: panelH });

    let y = panelTop + 8;
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
    App.ctx.fillText(`BEST SCORE: ${best}`, blockX, panelTop + panelH + 12);

    const btnW = this.actionButtonWidth();
    const playH = uiBtnHeight(52);
    const backH = uiBtnHeight(44);
    const backY = this.bottomActionY(backH);
    const playY = backY - playH - this.buttonStackGap();
    this.drawActionButton("infPlay", "PLAY", playY, mousePos, { w: btnW, h: playH });
    this.drawActionButton("back", "BACK", backY, mousePos, { w: btnW, h: backH, small: true });
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
    const items = this.shopTab === "skins" ? MOUSE_SKINS : listShopBackgrounds(save);
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

    this.drawActionButton("back", "BACK", this.bottomActionY(), mousePos, {
      w: cardW,
      h: btnHeight(Input.touchMode ? 52 : 48),
      small: true,
    });
    this.finishButtons();
  },

  drawSettings(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);

    const pad = this.screenPad();
    const btnW = this.actionButtonWidth();
    const btnX = this.actionButtonX(btnW);
    const stackGap = this.buttonStackGap();
    const btnH = uiBtnHeight(44);
    const halfW = (btnW - stackGap) / 2;

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SETTINGS", pad, 80);

    const sliderW = btnW - 32;
    this.sliders.music = { x: btnX + 16, y: 130, w: sliderW, label: "MUSIC" };
    this.sliders.sfx = { x: btnX + 16, y: 200, w: sliderW, label: "SFX" };
    drawSlider(App.ctx, this.sliders.music, save.settings.musicVolume);
    drawSlider(App.ctx, this.sliders.sfx, save.settings.sfxVolume);

    App.ctx.font = uiFont(20);
    App.ctx.fillStyle = rgb(COLORS.text);
    const playerLine = Auth.isLoggedIn()
      ? `PLAYER: ${Auth.displayName}`
      : "GUEST — login to save progress";
    App.ctx.fillText(playerLine, btnX + 16, 268);

    let y = 300;
    drawUiPanel(App.ctx, { x: btnX - 16, y: y - 16, w: btnW + 32, h: btnH + stackGap + btnH + 40 });

    const accountLabel = Auth.isLoggedIn() ? "LOGOUT" : "LOGIN";
    this.drawMenuSlot("account", accountLabel, { x: btnX, y, w: halfW, h: btnH }, mousePos);
    this.drawMenuSlot("toggleMobile", Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", { x: btnX + halfW + stackGap, y, w: halfW, h: btnH }, mousePos);
    if (!PwaInstall.isStandalone() && Input.touchMode) {
      y += btnH + stackGap;
      const installLabel = PwaInstall.canPromptInstall() ? "INSTALL APP" : "ADD TO HOME";
      this.drawActionButton("installApp", installLabel, y, mousePos, { w: btnW, h: uiBtnHeight(44), small: true });
    }

    this.drawActionButton("back", "BACK", this.bottomActionY(), mousePos, { w: btnW, h: uiBtnHeight(44), small: true });
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

    this.drawActionButton("back", "BACK", this.bottomActionY(), mousePos, { small: true });
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
    const community = game.level.community;
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
          game.endReason === "exploded" ? "Target exploded — all hearts lost!" : null,
          game.endReason === "timing" ? "Missed the beat!" : null,
          `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
        ].filter(Boolean)
      : success && community
        ? [
            `SCORE: ${game.score}`,
            r.rewardUnlocked ? `UNLOCKED: ${r.rewardName || game.level.rewardName}!` : `Reward: ${game.level.rewardName}`,
            `+${r.xpGain} XP   +${r.coinGain} COINS`,
          ]
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
            game.endReason === "exploded" ? "Hit every target before it pops!" : null,
            game.endReason === "timing" ? "Hit targets on the beat!" : null,
            game.endReason === "hearts" ? "Ran out of hearts" : null,
            !game.endReason || (game.endReason !== "exploded" && game.endReason !== "timing" && game.endReason !== "hearts") ? "Keep your hearts!" : null,
            `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
          ].filter(Boolean);
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

    const btnY = this.bottomActionY();
    if (!infinite && !community) {
      const leaderboardY = canShare ? Math.min(blockY + 8, btnY - 170) : 330;
      drawLeaderboardPanel(App.ctx, save, game.level.id, 80, leaderboardY);
    }

    if (success && r.unlockedNext && !infinite && !community) {
      this.drawActionButton("next", "NEXT", btnY, mousePos);
    } else if (!success) {
      this.drawActionButton("restart", "RESTART", btnY, mousePos);
    } else {
      this.drawActionButton("restart", "RETRY", btnY, mousePos);
    }
    this.finishButtons();
  },

  handleClick(state, save, pos) {
    if (state === "menu") {
      if (this._hit("start", pos)) { App.requestStartGame(getLevelById(1)); return true; }
      if (this._hit("levels", pos)) { CreatorUi.levelsTab = "main"; this.resetScroll(); App.state = "levels"; return true; }
      if (this._hit("creator", pos)) {
        CreatorStore.resetDraft();
        CreatorUi.page = "stage";
        this.resetScroll();
        App.state = "creator";
        return true;
      }
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
      if (CreatorUi.handleLevelsClick(save, pos)) return true;
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "creator") {
      CreatorUi.handleClick(save, pos);
      return true;
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
      if (this._hit("toggleMobile", pos)) {
        Input.touchMode = !Input.touchMode;
        applyViewport(App.canvas);
        App.stars = createStars();
        MobileShell.syncRotatePrompt();
        if (App.canvas) App.canvas.style.cursor = Input.touchMode ? "default" : "none";
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
    const items = this.shopTab === "skins" ? MOUSE_SKINS : listShopBackgrounds(save);
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
