const Screens = {
  buttons: {},
  clickAreas: {},
  sliders: {},
  shopTab: "skins",
  selectedLevel: 1,
  waitingKey: null,
  scrollY: 0,
  draggingSlider: false,

  resetButtons() {
    this.buttons = {};
  },

  btn(id, label, x, y, w = null, h = 52) {
    const rect = buttonRect(App.ctx, label, x, y, w, h);
    this.buttons[id] = rect;
    return rect;
  },

  finishButtons() {
    this.clickAreas = { ...this.buttons };
  },

  drawMenu(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = "bold 72px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.blue);
    const title = "CYBERPUNK TIMING";
    App.ctx.fillText(title, (BASE_WIDTH - App.ctx.measureText(title).width) / 2, 120);

    drawXpBar(App.ctx, save, 80, 180, 280);
    drawCoins(App.ctx, save, BASE_WIDTH - 220, 195);

    App.ctx.font = "bold 40px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.text);
    const best = save.highScores[1] || 0;
    const hs = `HIGH SCORE: ${best}`;
    App.ctx.fillText(hs, (BASE_WIDTH - App.ctx.measureText(hs).width) / 2, 250);

    drawNeonButton(App.ctx, this.btn("start", "START", null, 320), "START", pointInRect(mousePos, this.buttons.start));
    drawNeonButton(App.ctx, this.btn("levels", "LEVELS", null, 385), "LEVELS", pointInRect(mousePos, this.buttons.levels));
    drawNeonButton(App.ctx, this.btn("infinite", "INFINITE", null, 450), "INFINITE", pointInRect(mousePos, this.buttons.infinite));
    drawNeonButton(App.ctx, this.btn("shop", "SHOP", null, 515), "SHOP", pointInRect(mousePos, this.buttons.shop));
    drawNeonButton(App.ctx, this.btn("settings", "SETTINGS", null, 580), "SETTINGS", pointInRect(mousePos, this.buttons.settings));
    drawNeonButton(App.ctx, this.btn("howto", "HOW TO PLAY", null, 645), "HOW TO PLAY", pointInRect(mousePos, this.buttons.howto), true);

    if (Input.isMobile) {
      App.ctx.font = "bold 18px 'Courier New', monospace";
      App.ctx.fillStyle = rgb(COLORS.green);
      App.ctx.fillText("MOBILE MODE ACTIVE", 80, BASE_HEIGHT - 50);
    }
    this.finishButtons();
  },

  drawLevels(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = "bold 48px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SELECT STAGE", 80, 90);

    LEVELS.forEach((level, i) => {
      const y = 130 + i * 95;
      const unlocked = isLevelUnlocked(save, level);
      const cleared = isLevelCleared(save, level.id);
      const hs = save.highScores[level.id] || 0;
      const rect = this.btn(`level-${level.id}`, unlocked ? "PLAY" : "LOCKED", BASE_WIDTH - 200, y - 30, 140, 44);

      App.ctx.font = "bold 28px 'Courier New', monospace";
      App.ctx.fillStyle = rgb(unlocked ? COLORS.text : COLORS.gray);
      App.ctx.fillText(`${level.id}. ${level.name}${cleared ? " ✓" : ""}`, 80, y);
      App.ctx.font = "bold 18px 'Courier New', monospace";
      App.ctx.fillText(`GOAL ${level.passScore} pts | 30s | HS ${hs}`, 80, y + 28);
      App.ctx.fillStyle = rgb(COLORS.purple);
      App.ctx.fillText(level.featureHint, 80, y + 50);
      App.ctx.fillStyle = rgb(unlocked ? COLORS.text : COLORS.gray);
      if (!unlocked) {
        const prev = getLevelById(level.id - 1);
        App.ctx.fillText(`Clear stage ${prev.id} with ${prev.passScore} pts first`, 80, y + 72);
      } else if (!cleared) {
        App.ctx.fillText(`Stage clear bonus: +${level.clearXp} XP`, 80, y + 72);
      }

      if (unlocked) {
        drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
      }
    });

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawInfiniteSelect(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = "bold 48px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("INFINITE MODE", 80, 90);
    App.ctx.font = "bold 22px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText("Pick a track — survive with blue, red & orange targets", 80, 125);

    LEVELS.forEach((level, i) => {
      const y = 160 + i * 95;
      const best = save.infiniteHighScores?.[String(level.id)] || 0;
      const rect = this.btn(`inf-${level.id}`, "PLAY", BASE_WIDTH - 200, y - 10, 140, 44);

      App.ctx.font = "bold 28px 'Courier New', monospace";
      App.ctx.fillStyle = rgb(COLORS.text);
      App.ctx.fillText(`${level.id}. ${level.name}`, 80, y);
      App.ctx.font = "bold 18px 'Courier New', monospace";
      App.ctx.fillText(`BPM ${level.bpm} | BEST ${best}`, 80, y + 28);
      drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
    });

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawTutorial(tutorial, mousePos, now, save) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    const btn = this.btn("tutorialGo", "GOT IT", null, null, 220, 52);
    btn.y = BASE_HEIGHT / 2 + 80 + tutorial.lines.length * 18;
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

  drawShop(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = "bold 48px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SHOP", 80, 90);
    drawCoins(App.ctx, save, BASE_WIDTH - 220, 90);

    drawNeonButton(App.ctx, this.btn("tabSkins", "MOUSE SKINS", 80, 120, 200, 40), "MOUSE SKINS", this.shopTab === "skins", true);
    drawNeonButton(App.ctx, this.btn("tabBgs", "BACKGROUNDS", 300, 120, 200, 40), "BACKGROUNDS", this.shopTab === "backgrounds", true);

    const items = this.shopTab === "skins" ? MOUSE_SKINS : BACKGROUNDS;
    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 80 + col * 580;
      const y = 190 + row * 130;
      const owned = this.shopTab === "skins"
        ? save.ownedSkins.includes(item.id)
        : save.ownedBackgrounds.includes(item.id);
      const equipped = this.shopTab === "skins"
        ? save.equippedSkin === item.id
        : save.equippedBackground === item.id;

      App.ctx.font = "bold 24px 'Courier New', monospace";
      App.ctx.fillStyle = rgb(COLORS.text);
      App.ctx.fillText(item.name, x, y);
      App.ctx.font = "bold 18px 'Courier New', monospace";
      App.ctx.fillStyle = rgb(owned ? COLORS.green : COLORS.gold);
      App.ctx.fillText(owned ? (equipped ? "EQUIPPED" : "OWNED") : `${item.price} COINS`, x, y + 28);

      if (this.shopTab === "skins") {
        drawCursor(App.ctx, { x: x + 400, y: y - 10 }, item);
      } else {
        App.ctx.fillStyle = rgb(item.accent);
        App.ctx.fillRect(x + 360, y - 24, 80, 40);
      }

      if (owned && !equipped) {
        drawNeonButton(App.ctx, this.btn(`equip-${item.id}`, "EQUIP", x + 320, y + 36, 120, 36), "EQUIP", pointInRect(mousePos, this.buttons[`equip-${item.id}`]), true);
      } else if (!owned) {
        drawNeonButton(App.ctx, this.btn(`buy-${item.id}`, "BUY", x + 320, y + 36, 120, 36), "BUY", pointInRect(mousePos, this.buttons[`buy-${item.id}`]), true);
      }
    });

    drawNeonButton(App.ctx, this.btn("adReward", "WATCH AD +75", 80, 580, 240, 44), "WATCH AD +75", pointInRect(mousePos, this.buttons.adReward), true);
    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawSettings(save, mousePos, now) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    App.ctx.font = "bold 48px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SETTINGS", 80, 90);

    this.sliders.music = { x: 80, y: 160, w: 400, label: "MUSIC" };
    this.sliders.sfx = { x: 80, y: 230, w: 400, label: "SFX" };
    drawSlider(App.ctx, this.sliders.music, save.settings.musicVolume);
    drawSlider(App.ctx, this.sliders.sfx, save.settings.sfxVolume);

    App.ctx.font = "bold 24px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText(`BALL: Mouse btn ${save.keys.ball} / Key ${save.keys.ballKey}`, 80, 310);
    App.ctx.fillText(`BOMB: Mouse btn ${save.keys.bomb} / Key ${save.keys.bombKey}`, 80, 350);

    drawNeonButton(App.ctx, this.btn("remapBall", "REMAP BALL KEY", 80, 380, 280, 44), this.waitingKey === "ball" ? "PRESS KEY..." : "REMAP BALL KEY", pointInRect(mousePos, this.buttons.remapBall), true);
    drawNeonButton(App.ctx, this.btn("remapBomb", "REMAP BOMB KEY", 380, 380, 280, 44), this.waitingKey === "bomb" ? "PRESS KEY..." : "REMAP BOMB KEY", pointInRect(mousePos, this.buttons.remapBomb), true);

    drawNeonButton(App.ctx, this.btn("toggleMobile", Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", 80, 450, 220, 44), Input.touchMode ? "MOBILE: ON" : "MOBILE: OFF", pointInRect(mousePos, this.buttons.toggleMobile), true);
    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawHowTo(mousePos, now, save) {
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);

    let y = 80;
    HOW_TO_LINES.forEach((line, i) => {
      if (!line) { y += 10; return; }
      App.ctx.font = i === 0 ? "bold 40px 'Courier New', monospace" : "bold 22px 'Courier New', monospace";
      App.ctx.fillStyle = rgb(i === 0 ? COLORS.blue : COLORS.text);
      App.ctx.fillText(line, (BASE_WIDTH - App.ctx.measureText(line).width) / 2, y);
      y += i === 0 ? 44 : 32;
    });

    drawNeonButton(App.ctx, this.btn("back", "BACK", null, 620), "BACK", pointInRect(mousePos, this.buttons.back));
    this.finishButtons();
  },

  drawGameScreen(game, now, save) {
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    game.nextTarget.draw(App.ctx, now);
    game.currentTarget.draw(App.ctx, now);
    game.flippedTargets.forEach((pt) => pt.draw(App.ctx));
    game.floatingTexts.forEach((ft) => ft.draw(App.ctx));
    GameLogic.drawHud(App.ctx, game, game.level, save);
    GameLogic.drawMobileControls(App.ctx, game.level);
  },

  drawGameOver(game, save, mousePos, now, homeHovered) {
    if (!game) return;
    this.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars);
    drawHomeButton(App.ctx, mousePos, homeHovered);
    this.buttons.home = homeButtonRect();

    const success = game.lastRewards?.success;
    const infinite = game.level.infinite;
    const title = success ? "LEVEL COMPLETE" : (game.failMessage || "GAME OVER");
    const titleColor = success ? COLORS.green : COLORS.red;

    App.ctx.font = success ? "bold 58px 'Courier New', monospace" : "bold 52px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(titleColor);
    App.ctx.fillText(title, (BASE_WIDTH - App.ctx.measureText(title).width) / 2, 130);

    const r = game.lastRewards || {};
    App.ctx.font = "bold 28px 'Courier New', monospace";
    App.ctx.fillStyle = rgb(COLORS.text);
    const statLines = infinite
      ? [
          `SCORE: ${game.score}`,
          r.newBest ? "NEW BEST!" : `BEST: ${r.best || 0}`,
          `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
        ]
      : success
        ? [
            `SCORE: ${game.score} / ${r.passScore}`,
            r.stageXp ? `+${r.xpGain} XP (+${r.stageXp} stage)` : `+${r.xpGain} XP`,
            `+${r.coinGain} COINS`,
          ]
        : [
            `SCORE: ${game.score} / ${r.passScore || game.level.passScore}`,
            game.endReason === "expired" ? "Too slow!" : `Need ${r.needed} more pts`,
            `+${r.xpGain || 0} XP   +${r.coinGain || 0} COINS`,
          ];
    statLines.forEach((line, i) => {
      App.ctx.fillText(line, (BASE_WIDTH - App.ctx.measureText(line).width) / 2, 200 + i * 36);
    });

    if (!infinite) drawLeaderboardPanel(App.ctx, save, game.level.id, 80, 330);

    if (success && r.unlockedNext && !infinite) {
      drawNeonButton(App.ctx, this.btn("next", "NEXT", null, 580), "NEXT", pointInRect(mousePos, this.buttons.next));
    } else if (!success) {
      drawNeonButton(App.ctx, this.btn("restart", "RESTART", null, 580), "RESTART", pointInRect(mousePos, this.buttons.restart));
    } else {
      drawNeonButton(App.ctx, this.btn("restart", "RETRY", null, 580), "RETRY", pointInRect(mousePos, this.buttons.restart));
    }
    this.finishButtons();
  },

  handleClick(state, save, pos) {
    if (state === "menu") {
      if (this._hit("start", pos)) { App.requestStartGame(getLevelById(1)); return true; }
      if (this._hit("levels", pos)) { App.state = "levels"; return true; }
      if (this._hit("infinite", pos)) { App.state = "infinite"; return true; }
      if (this._hit("shop", pos)) { App.state = "shop"; return true; }
      if (this._hit("settings", pos)) { App.state = "settings"; return true; }
      if (this._hit("howto", pos)) { App.state = "howto"; return true; }
    }

    if (state === "levels") {
      for (const level of LEVELS) {
        if (isLevelUnlocked(save, level) && this._hit(`level-${level.id}`, pos)) {
          App.requestStartGame(level);
          return true;
        }
      }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "infinite") {
      for (const level of LEVELS) {
        if (this._hit(`inf-${level.id}`, pos)) {
          App.launchGame(createInfiniteLevel(level));
          return true;
        }
      }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
    }

    if (state === "tutorial" && this._hit("tutorialGo", pos)) {
      App.confirmTutorial();
      return true;
    }

    if (state === "shop") {
      if (this._hit("tabSkins", pos)) { this.shopTab = "skins"; return true; }
      if (this._hit("tabBgs", pos)) { this.shopTab = "backgrounds"; return true; }
      if (this._hit("adReward", pos)) { App.requestAdReward(); return true; }
      if (this._hit("back", pos)) { App.state = "menu"; return true; }
      return this._handleShopPurchase(save, pos);
    }

    if (state === "settings") {
      if (this._hit("remapBall", pos)) { this.waitingKey = "ball"; return true; }
      if (this._hit("remapBomb", pos)) { this.waitingKey = "bomb"; return true; }
      if (this._hit("toggleMobile", pos)) { Input.touchMode = !Input.touchMode; return true; }
      if (this._hit("back", pos)) { App.state = "menu"; this.waitingKey = null; return true; }
      this._handleSliderDrag(save, pos);
    }

    if (state === "howto" && this._hit("back", pos)) { App.state = "menu"; return true; }

    if (state === "gameover") {
      if (this._hit("home", pos)) { App.goHome(); return true; }
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
          else save.equippedBackground = item.id;
          writeSave(save);
        }
        return true;
      }
      if (this._hit(`equip-${item.id}`, pos)) {
        if (this.shopTab === "skins") save.equippedSkin = item.id;
        else save.equippedBackground = item.id;
        writeSave(save);
        return true;
      }
    }
    return false;
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
