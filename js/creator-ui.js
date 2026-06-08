const CreatorUi = {
  levelsTab: "main",
  page: "stage",
  shareLevelId: null,
  rewardSliders: null,
  draggingRewardSlider: false,

  drawMenuSlot(slot, mousePos) {
    Screens.drawMenuSlot("creator", "CREATOR", slot, mousePos);
  },

  draw(save, mousePos, now) {
    if (this.page === "rewards") CreatorRewardUi.drawRewards(save, mousePos, now);
    else if (this.page === "pickReward") CreatorRewardUi.drawPickReward(save, mousePos, now);
    else this.drawStage(save, mousePos, now);
    CreatorDom.setActive(App.state);
  },

  drawLevels(save, mousePos, now) {
    Screens.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    const pad = Screens.screenPad();

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SELECT STAGE", pad, 76);

    const tabW = (viewW() - pad * 2 - 12) / 2;
    const tabY = 108;
    drawNeonButton(App.ctx, Screens.btn("lvMain", "MAIN", pad, tabY, tabW, uiBtnHeight(40)), "MAIN LEVELS", this.levelsTab === "main", true);
    drawNeonButton(App.ctx, Screens.btn("lvCommunity", "COMMUNITY", pad + tabW + 12, tabY, tabW, uiBtnHeight(40)), "COMMUNITY", this.levelsTab === "community", true);

    if (this.levelsTab === "main") this._drawMainLevels(save, mousePos, pad);
    else this._drawCommunityLevels(save, mousePos, pad, tabY);

    Screens.drawActionButton("back", "BACK", Screens.bottomActionY(), mousePos, { small: true });
    Screens.finishButtons();
  },

  _drawMainLevels(save, mousePos, pad) {
    const rowH = Screens.listRowHeight();
    const top = 175;
    const play = Screens.playBtnSize();
    Screens.listMaxScroll = Math.max(0, top + LEVELS.length * rowH - (viewH() - 90));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, top - 8, viewW(), viewH() - top - 80);
    App.ctx.clip();

    LEVELS.forEach((level) => {
      const y = top + (level.id - 1) * rowH - Screens.scrollY;
      if (y + rowH < top || y > viewH() - 80) return;
      const unlocked = isLevelUnlocked(save, level);
      const rect = Screens.btn(`level-${level.id}`, "PLAY", viewW() - play.w - 24, y - 8, play.w, play.h);
      App.ctx.font = gameFont(24);
      App.ctx.fillStyle = rgb(unlocked ? COLORS.text : COLORS.gray);
      App.ctx.fillText(`${level.id}. ${level.name}`, pad, y + 24);
      if (unlocked) drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
    });
    App.ctx.restore();
  },

  _drawCommunityLevels(save, mousePos, pad, tabY) {
    const levels = CreatorStore.list();
    const rowH = Screens.listRowHeight();
    const top = tabY + 55;
    const play = Screens.playBtnSize();
    Screens.listMaxScroll = Math.max(0, top + (levels.length + 1) * rowH - (viewH() - 90));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, top - 8, viewW(), viewH() - top - 80);
    App.ctx.clip();

    const createY = top - Screens.scrollY;
    if (createY + rowH >= top && createY <= viewH() - 80) {
      const btn = Screens.btn("openCreator", "+ CREATE", pad, createY, viewW() - pad * 2, uiBtnHeight(44));
      drawNeonButton(App.ctx, btn, "+ CREATE STAGE", pointInRect(mousePos, btn), true);
    }

    levels.forEach((meta, i) => {
      const y = top + (i + 1) * rowH - Screens.scrollY;
      if (y + rowH < top || y > viewH() - 80) return;
      const rect = Screens.btn(`clevel-${meta.id}`, "PLAY", viewW() - play.w - 24, y - 8, play.w, play.h);
      App.ctx.font = gameFont(22);
      App.ctx.fillText(`${meta.name}`, pad, y + 22);
      App.ctx.font = gameFont(16);
      App.ctx.fillStyle = rgb(COLORS.gray);
      App.ctx.fillText(`by ${meta.author || "Creator"}`, pad, y + 48);
      drawNeonButton(App.ctx, rect, "PLAY", pointInRect(mousePos, rect), true);
    });
    App.ctx.restore();
  },

  drawStage(save, mousePos, now) {
    Screens.resetButtons();
    drawBackground(App.ctx, now, getBackgroundById(save.equippedBackground), App.stars, save);
    const draft = CreatorStore.draft();
    CreatorDom.syncNameField(draft);
    const pad = Screens.screenPad();
    const cardW = viewW() - pad * 2;
    const rowH = 64;
    const contentH = 720;
    Screens.listMaxScroll = Math.max(0, contentH - (viewH() - 100));
    const scroll = Screens.scrollY;
    let y = 100 - scroll;

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("CREATE STAGE", pad, 72);

    y = this._rowLabel("STAGE NAME", pad, y, cardW);
    const nameRect = { x: pad + 12, y: y, w: cardW - 24, h: uiBtnHeight(40) };
    Screens.buttons.cgNameField = nameRect;
    App.ctx.strokeStyle = rgb(COLORS.gray);
    App.ctx.lineWidth = 2;
    roundRect(App.ctx, nameRect.x, nameRect.y, nameRect.w, nameRect.h, 8);
    App.ctx.stroke();
    CreatorDom.positionNameField(nameRect);
    y += uiBtnHeight(40) + 14;

    y = this._rowLabel("BPM", pad, y, cardW);
    const bpmY = y;
    drawNeonButton(App.ctx, Screens.btn("cgBpmDown", "◀", pad, bpmY, 52, uiBtnHeight(40)), "◀", pointInRect(mousePos, Screens.buttons.cgBpmDown), true);
    App.ctx.font = gameFont(28);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText(String(draft.bpm), pad + 70, bpmY + 28);
    drawNeonButton(App.ctx, Screens.btn("cgBpmUp", "▶", pad + 130, bpmY, 52, uiBtnHeight(40)), "▶", pointInRect(mousePos, Screens.buttons.cgBpmUp), true);
    y += uiBtnHeight(40) + 14;

    y = this._rowLabel("MECHANICS", pad, y, cardW);
    for (const item of CREATOR_MECH_KEYS) {
      if (item.needs && !draft.mechanics[item.needs]) continue;
      const on = !!draft.mechanics[item.key];
      const box = Screens.btn(`cgMech-${item.key}`, on ? "ON" : "OFF", pad + 12, y, cardW - 24, uiBtnHeight(36));
      drawNeonButton(App.ctx, box, `${on ? "☑" : "☐"} ${item.label}`, pointInRect(mousePos, box), true);
      y += uiBtnHeight(36) + 8;
    }
    y += 6;

    y = this._rowLabel("MUSIC", pad, y, cardW);
    const track = getLevelById(draft.musicTrackId || 1);
    const musicLabel = draft.musicSource === "upload" ? "CUSTOM UPLOAD" : `${track.id}. ${track.name}`;
    drawNeonButton(App.ctx, Screens.btn("cgTrackDown", "◀", pad, y, 52, uiBtnHeight(36)), "◀", pointInRect(mousePos, Screens.buttons.cgTrackDown), true);
    App.ctx.font = uiFont(18);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText(musicLabel, pad + 70, y + 24);
    drawNeonButton(App.ctx, Screens.btn("cgTrackUp", "▶", pad + cardW - 64, y, 52, uiBtnHeight(36)), "▶", pointInRect(mousePos, Screens.buttons.cgTrackUp), true);
    y += uiBtnHeight(36) + 8;
    drawNeonButton(App.ctx, Screens.btn("cgMusic", "UPLOAD MP3", pad + 12, y, cardW - 24, uiBtnHeight(36)), "UPLOAD MP3", pointInRect(mousePos, Screens.buttons.cgMusic), true);
    y += uiBtnHeight(36) + 14;

    y = this._rowLabel("REWARD", pad, y, cardW);
    const reward = CreatorStore.getReward(draft.rewardId);
    const rewardLine = reward ? reward.name : "None selected";
    drawNeonButton(App.ctx, Screens.btn("cgPickReward", rewardLine, pad + 12, y, cardW - 140, uiBtnHeight(40)), rewardLine, pointInRect(mousePos, Screens.buttons.cgPickReward), true);
    drawNeonButton(App.ctx, Screens.btn("cgEditRewards", "REWARDS", pad + cardW - 120, y, 108, uiBtnHeight(40)), "REWARDS", pointInRect(mousePos, Screens.buttons.cgEditRewards), true);
    y += uiBtnHeight(40) + 14;

    drawNeonButton(App.ctx, Screens.btn("cgTest", "TEST", pad, y, (cardW - 12) / 2, uiBtnHeight(44)), "TEST", pointInRect(mousePos, Screens.buttons.cgTest), true);
    drawNeonButton(App.ctx, Screens.btn("cgPublish", "PUBLISH", pad + (cardW + 12) / 2, y, (cardW - 12) / 2, uiBtnHeight(44)), "PUBLISH", pointInRect(mousePos, Screens.buttons.cgPublish), true);
    y += uiBtnHeight(44) + 10;
    drawNeonButton(App.ctx, Screens.btn("cgBack", "BACK", pad, y, cardW, uiBtnHeight(40)), "BACK", pointInRect(mousePos, Screens.buttons.cgBack), true);

    Screens.finishButtons();
  },

  _rowLabel(text, pad, y, cardW) {
    if (y < 90 || y > viewH()) return y;
    App.ctx.font = uiFont(16);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.fillText(text, pad + 12, y + 16);
    return y + 24;
  },

  async launchCommunity(meta) {
    const musicUrl = meta.musicSource === "upload" && meta.hasMusic ? await CreatorStore.getMusicUrl(meta.id) : null;
    App.launchGame(applyCreatorDraftToLevel(meta, musicUrl));
  },

  async testDraft() {
    const draft = { ...CreatorStore.draft(), id: "test", author: "Test" };
    let musicUrl = null;
    if (draft.musicSource === "upload") {
      if (draft._pendingMusic) musicUrl = URL.createObjectURL(draft._pendingMusic);
      else if (draft.hasMusic && draft.id) musicUrl = await CreatorStore.getMusicUrl(draft.id);
    }
    App.launchGame(applyCreatorDraftToLevel(draft, musicUrl));
  },

  handleLevelsClick(save, pos) {
    if (this._hit("lvMain", pos)) { this.levelsTab = "main"; Screens.resetScroll(); return true; }
    if (this._hit("lvCommunity", pos)) { this.levelsTab = "community"; Screens.resetScroll(); return true; }
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
      this.page = "stage";
      Screens.resetScroll();
      App.state = "creator";
      return true;
    }
    for (const meta of CreatorStore.list()) {
      if (this._hit(`clevel-${meta.id}`, pos)) { this.launchCommunity(meta); return true; }
    }
    return false;
  },

  handleClick(save, pos) {
    if (this.page === "rewards") return CreatorRewardUi.handleRewardsClick(save, pos);
    if (this.page === "pickReward") return CreatorRewardUi.handlePickClick(save, pos);
    return this._handleStageClick(save, pos);
  },

  _handleStageClick(save, pos) {
    const draft = CreatorStore.draft();
    if (this._hit("cgBack", pos)) { App.state = "levels"; this.levelsTab = "community"; return true; }
    if (this._hit("cgBpmDown", pos)) { adjustCreatorBpm(draft, -1); return true; }
    if (this._hit("cgBpmUp", pos)) { adjustCreatorBpm(draft, 1); return true; }
    if (this._hit("cgTrackDown", pos)) { cycleCreatorTrack(draft, -1); return true; }
    if (this._hit("cgTrackUp", pos)) { cycleCreatorTrack(draft, 1); return true; }
    if (this._hit("cgMusic", pos)) { document.getElementById("creator-music-input")?.click(); return true; }
    if (this._hit("cgEditRewards", pos)) { this.page = "rewards"; Screens.resetScroll(); return true; }
    if (this._hit("cgPickReward", pos)) { this.page = "pickReward"; Screens.resetScroll(); return true; }
    if (this._hit("cgTest", pos)) { this.testDraft(); return true; }
    if (this._hit("cgPublish", pos)) {
      const name = document.getElementById("creator-name-input")?.value?.trim() || draft.name;
      draft.name = name;
      CreatorStore.saveDraft().then((id) => {
        CreatorDom.showShareModal(name || "My Stage", id);
        App.state = "levels";
        this.levelsTab = "community";
        this.page = "stage";
      });
      return true;
    }
    for (const item of CREATOR_MECH_KEYS) {
      if (this._hit(`cgMech-${item.key}`, pos)) { toggleCreatorMechanic(draft, item.key); return true; }
    }
    return true;
  },

  _hit(id, pos) {
    return Screens._hit(id, pos);
  },
};
