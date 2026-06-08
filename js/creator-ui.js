const CreatorUi = {
  levelsTab: "main",
  rewardSliders: null,
  draggingRewardSlider: false,

  drawMenuSlot(slot, mousePos) {
    Screens.drawMenuSlot("creator", "CREATOR", slot, mousePos);
  },

  drawLevels(save, mousePos, now) {
    Screens.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    const pad = Screens.screenPad();

    App.ctx.font = gameFont(Input.touchMode ? 40 : 48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SELECT STAGE", pad, Input.touchMode ? 72 : 80);

    const tabW = Input.touchMode ? (viewW() - pad * 2 - 12) / 2 : 200;
    const tabY = Input.touchMode ? 108 : 115;
    drawNeonButton(App.ctx, Screens.btn("lvMain", "MAIN", pad, tabY, tabW, btnHeight(40)), "MAIN LEVELS", this.levelsTab === "main", true);
    drawNeonButton(App.ctx, Screens.btn("lvCommunity", "COMMUNITY", Input.touchMode ? pad + tabW + 12 : 300, tabY, tabW, btnHeight(40)), "COMMUNITY", this.levelsTab === "community", true);

    if (this.levelsTab === "main") this._drawMainLevels(save, mousePos, pad);
    else this._drawCommunityLevels(save, mousePos, pad, tabY);

    Screens.drawActionButton("back", "BACK", Screens.bottomActionY(), mousePos, { small: true });
    Screens.finishButtons();
  },

  _drawMainLevels(save, mousePos, pad) {
    App.ctx.font = gameFont(16);
    App.ctx.fillStyle = rgb(COLORS.gray);
    App.ctx.fillText(`${LEVELS.length} official stages`, pad, Input.touchMode ? 158 : 162);

    const rowH = Screens.listRowHeight();
    const top = Input.touchMode ? 175 : 180;
    const play = Screens.playBtnSize();
    const content = top + LEVELS.length * rowH;
    Screens.listMaxScroll = Math.max(0, content - (viewH() - 90));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, top - 8, viewW(), viewH() - top - 80);
    App.ctx.clip();

    LEVELS.forEach((level) => {
      const i = level.id - 1;
      const y = top + i * rowH - Screens.scrollY;
      if (y + rowH < top || y > viewH() - 40) return;

      const unlocked = isLevelUnlocked(save, level);
      const cleared = isLevelCleared(save, level.id);
      const hs = save.highScores[level.id] || 0;
      const rect = Screens.btn(`level-${level.id}`, unlocked ? "PLAY" : "LOCKED", viewW() - play.w - 24, y - 8, play.w, play.h);

      App.ctx.font = gameFont(26);
      App.ctx.fillStyle = rgb(unlocked ? COLORS.text : COLORS.gray);
      App.ctx.fillText(`${level.id}. ${level.name}${cleared ? " ✓" : ""}`, pad, y + 18);
      App.ctx.font = gameFont(16);
      App.ctx.fillText(`${START_HEARTS} hearts | 30s | HS ${hs}`, pad, y + 42);
      App.ctx.fillStyle = rgb(COLORS.purple);
      App.ctx.fillText(level.featureHint, pad, y + 62);

      if (unlocked) drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
      else {
        App.ctx.fillStyle = rgb(COLORS.gray);
        App.ctx.fillText("Clear previous stage", pad, y + 62);
      }
    });
    App.ctx.restore();
  },

  _drawCommunityLevels(save, mousePos, pad, tabY) {
    const levels = CreatorStore.list();
    const rowCount = levels.length + 1;
    const rowH = Screens.listRowHeight();
    const top = tabY + 55;
    const play = Screens.playBtnSize();
    const content = top + rowCount * rowH;
    Screens.listMaxScroll = Math.max(0, content - (viewH() - 90));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);

    App.ctx.font = gameFont(16);
    App.ctx.fillStyle = rgb(COLORS.gray);
    App.ctx.fillText(`${levels.length} community stages — scroll`, pad, top - 12);

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, top - 8, viewW(), viewH() - top - 80);
    App.ctx.clip();

    const createY = top - Screens.scrollY;
    if (createY + rowH >= top && createY <= viewH() - 80) {
      const createBtn = Screens.btn("openCreator", "+ CREATE STAGE", pad, createY, viewW() - pad * 2, btnHeight(48));
      drawNeonButton(App.ctx, createBtn, "+ CREATE STAGE", pointInRect(mousePos, createBtn), true);
    }

    levels.forEach((meta, i) => {
      const y = top + (i + 1) * rowH - Screens.scrollY;
      if (y + rowH < top || y > viewH() - 80) return;

      const cleared = (save.clearedCommunity || []).includes(meta.id);
      const hs = save.communityHighScores?.[meta.id] || 0;
      const rect = Screens.btn(`clevel-${meta.id}`, "PLAY", viewW() - play.w - 24, y - 8, play.w, play.h);

      App.ctx.font = gameFont(24);
      App.ctx.fillStyle = rgb(COLORS.text);
      App.ctx.fillText(`${meta.name}${cleared ? " ✓" : ""}`, pad, y + 18);
      App.ctx.font = gameFont(16);
      App.ctx.fillStyle = rgb(COLORS.gold);
      App.ctx.fillText(`Reward: ${meta.rewardName}${cleared ? " (unlocked)" : ""}`, pad, y + 42);
      App.ctx.fillStyle = rgb(COLORS.gray);
      App.ctx.fillText(`by ${meta.author || "Creator"} | HS ${hs}${meta.hasMusic ? " | custom music" : ""}`, pad, y + 62);

      drawBackgroundSwatch(App.ctx, viewW() - pad - 88, y + 8, 64, 36, {
        id: meta.id,
        bg: meta.rewardBg,
        grid: meta.rewardGrid,
        accent: meta.rewardAccent,
      }, save);

      drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
    });
    App.ctx.restore();
  },

  drawCreator(save, mousePos, now) {
    Screens.resetButtons();
    const draft = CreatorStore.draft();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    const pad = Screens.screenPad();
    const cardW = viewW() - pad * 2;

    App.ctx.font = gameFont(Input.touchMode ? 40 : 48);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("CYBERTIME CREATOR", pad, Input.touchMode ? 64 : 72);

    this._updateCreatorScroll();
    const startY = 110 - Screens.scrollY;

    let y = startY;
    y = this._drawCreatorRow("NAME", draft.name, "cgName", pad, y, cardW, mousePos);
    y = this._drawCreatorRow(`BPM: ${draft.bpm}`, "CHANGE BPM", "cgBpm", pad, y, cardW, mousePos);
    y = this._drawCreatorRow(infiniteMechanicName({ mechanicIndex: draft.mechanicIndex }), "MECHANICS", "cgMech", pad, y, cardW, mousePos);
    y = this._drawCreatorRow(draft.hasMusic ? "MUSIC: READY" : "MUSIC: NONE", "UPLOAD MUSIC", "cgMusic", pad, y, cardW, mousePos);
    y = this._drawCreatorRow(`REWARD: ${draft.rewardName}`, "RENAME REWARD", "cgRewardName", pad, y, cardW, mousePos);

    App.ctx.fillStyle = "rgba(20,20,32,0.55)";
    App.ctx.fillRect(pad, y, cardW, 188);
    App.ctx.font = uiFont(20);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.fillText("REWARD BACKGROUND (unlock on clear)", pad + 16, y + 28);
    this.rewardSliders = {};
    let sy = y + 44;
    const keys = [
      ["bg", "BG", draft.rewardBg],
      ["grid", "GRID", draft.rewardGrid],
      ["accent", "GLOW", draft.rewardAccent],
    ];
    for (const [key, label, rgbArr] of keys) {
      const slider = { x: pad + 16, y: sy + 16, w: cardW - 32, label };
      this.rewardSliders[key] = slider;
      const factor = Math.max(0.12, Math.min(1, rgbArr[0] / 200));
      drawSlider(App.ctx, slider, factor);
      sy += 52;
    }
    y = sy + 16;

    const btnH = btnHeight(44);
    const half = (cardW - 12) / 2;
    drawNeonButton(App.ctx, Screens.btn("cgTest", "TEST PLAY", pad, y, half, btnH), "TEST PLAY", pointInRect(mousePos, Screens.buttons.cgTest), true);
    drawNeonButton(App.ctx, Screens.btn("cgSave", "SAVE STAGE", pad + half + 12, y, half, btnH), "SAVE STAGE", pointInRect(mousePos, Screens.buttons.cgSave), true);
    y += btnH + 12;
    drawNeonButton(App.ctx, Screens.btn("cgBack", "BACK", pad, y, cardW, btnH), "BACK", pointInRect(mousePos, Screens.buttons.cgBack), true);

    drawBackgroundSwatch(App.ctx, viewW() - pad - 100, startY + 8, 80, 48, {
      id: "preview",
      bg: draft.rewardBg,
      grid: draft.rewardGrid,
      accent: draft.rewardAccent,
    }, save);

    Screens.finishButtons();
  },

  _drawCreatorRow(label, btnLabel, btnId, pad, y, cardW, mousePos) {
    App.ctx.fillStyle = "rgba(20,20,32,0.55)";
    App.ctx.fillRect(pad, y, cardW, 72);
    App.ctx.font = uiFont(20);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText(label, pad + 16, y + 30);
    const btn = Screens.btn(btnId, btnLabel, pad + cardW - 200, y + 16, 184, btnHeight(40));
    drawNeonButton(App.ctx, btn, btnLabel, pointInRect(mousePos, btn), true);
    return y + 80;
  },

  _updateCreatorScroll() {
    Screens.listMaxScroll = Math.max(0, 620 - (viewH() - 100));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);
  },

  async launchCommunity(meta) {
    const musicUrl = meta.hasMusic ? await CreatorStore.getMusicUrl(meta.id) : null;
    App.launchGame(applyCreatorDraftToLevel(meta, musicUrl));
  },

  async testDraft() {
    const draft = { ...CreatorStore.draft(), id: "test", author: "Test" };
    let musicUrl = null;
    if (draft._pendingMusic) musicUrl = URL.createObjectURL(draft._pendingMusic);
    else if (draft.hasMusic && draft.id) musicUrl = await CreatorStore.getMusicUrl(draft.id);
    App.launchGame(applyCreatorDraftToLevel(draft, musicUrl));
  },

  handleLevelsClick(save, pos) {
    if (this._hit("lvMain", pos)) { this.levelsTab = "main"; Screens.resetScroll(); return true; }
    if (this._hit("lvCommunity", pos)) { this.levelsTab = "community"; Screens.resetScroll(); return true; }
    if (App.leaderboardLevelId) return false;

    if (this.levelsTab === "main") {
      for (const level of LEVELS) {
        if (isLevelUnlocked(save, level) && this._hit(`level-${level.id}`, pos)) {
          App.requestStartGame(level);
          return true;
        }
      }
      return false;
    }

    if (this._hit("openCreator", pos)) {
      CreatorStore.resetDraft();
      Screens.resetScroll();
      App.state = "creator";
      return true;
    }
    for (const meta of CreatorStore.list()) {
      if (this._hit(`clevel-${meta.id}`, pos)) {
        this.launchCommunity(meta);
        return true;
      }
    }
    return false;
  },

  handleCreatorClick(save, pos) {
    const draft = CreatorStore.draft();
    if (this._hit("cgBack", pos)) { App.state = "levels"; this.levelsTab = "community"; return true; }
    if (this._hit("cgName", pos)) {
      const names = ["MY STAGE", "NEON RUN", "BEAT LAB", "CYBER PULSE", "CUSTOM"];
      const i = (names.indexOf(draft.name) + 1) % names.length;
      draft.name = names[i];
      return true;
    }
    if (this._hit("cgBpm", pos)) { cycleCreatorBpm(draft, 1); return true; }
    if (this._hit("cgMech", pos)) { cycleCreatorMechanics(draft, 1); return true; }
    if (this._hit("cgMusic", pos)) { document.getElementById("creator-music-input")?.click(); return true; }
    if (this._hit("cgRewardName", pos)) {
      const names = ["STAGE REWARD", "NEON SKIN", "CREATOR BG", "RARE GRID"];
      draft.rewardName = names[(names.indexOf(draft.rewardName) + 1) % names.length];
      return true;
    }
    if (this._hit("cgTest", pos)) { this.testDraft(); return true; }
    if (this._hit("cgSave", pos)) {
      CreatorStore.saveDraft().then(() => CreatorStore.init()).then(() => {
        App.state = "levels";
        this.levelsTab = "community";
      });
      return true;
    }
    this._handleRewardSliderDrag(draft, pos);
    return true;
  },

  _handleRewardSliderDrag(draft, pos) {
    if (!this.rewardSliders) return;
    const map = { bg: "rewardBg", grid: "rewardGrid", accent: "rewardAccent" };
    for (const key of ["bg", "grid", "accent"]) {
      const slider = this.rewardSliders[key];
      const track = { x: slider.x, y: slider.y - 10, w: slider.w, h: 28 };
      if (this.draggingRewardSlider || pointInRect(pos, track)) {
        this.draggingRewardSlider = true;
        const f = sliderValueFromPos(slider, pos);
        const base = key === "bg" ? [18, 8, 32] : key === "grid" ? [60, 30, 90] : [255, 80, 180];
        draft[map[key]] = base.map((c) => Math.round(c * (0.15 + 0.85 * f)));
        return;
      }
    }
  },

  _hit(id, pos) {
    return Screens._hit(id, pos);
  },
};
