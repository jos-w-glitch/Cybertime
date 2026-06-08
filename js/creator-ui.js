const CreatorUi = {
  levelsTab: "main",
  page: "stage",
  communitySearch: "",
  shareLevelId: null,
  rewardSliders: null,
  draggingRewardSlider: false,

  communitySearchY() {
    return 108 + uiBtnHeight(40) + uiBtnGap(14);
  },

  communityListTop() {
    return this.communitySearchY() + uiBtnHeight(44) + uiBtnGap(12);
  },

  drawMenuSlot(slot, mousePos) {
    Screens.drawMenuSlot("creator", "CREATOR", slot, mousePos);
  },

  draw(save, mousePos, now) {
    if (this.page === "rewards") CreatorRewardUi.drawRewards(save, mousePos, now);
    else if (this.page === "pickReward") CreatorRewardUi.drawPickReward(save, mousePos, now);
    else this.drawStage(save, mousePos, now);
  },

  handlePointerDown(pos) {
    if (this.page === "rewards") return CreatorRewardUi.handlePointerDown(pos);
    if (this.page === "stage") return this._stagePointerDown(pos);
    return false;
  },

  drawLevels(save, mousePos, now) {
    Screens.resetButtons();
    const bg = getBackgroundById(save.equippedBackground);
    drawBackground(App.ctx, now, bg, App.stars, save);
    const pad = Screens.screenPad();
    const gap = uiBtnGap();

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("SELECT STAGE", pad, 76);

    const tabW = (viewW() - pad * 2 - gap) / 2;
    const tabY = 108;
    drawNeonButton(App.ctx, Screens.btn("lvMain", "MAIN", pad, tabY, tabW, uiBtnHeight(40)), "MAIN LEVELS", this.levelsTab === "main", true);
    drawNeonButton(App.ctx, Screens.btn("lvCommunity", "COMMUNITY", pad + tabW + gap, tabY, tabW, uiBtnHeight(40)), "COMMUNITY", this.levelsTab === "community", true);

    if (this.levelsTab === "main") this._drawMainLevels(save, mousePos, pad);
    else this._drawCommunityLevels(save, mousePos, pad);

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

  _drawCommunityLevels(save, mousePos, pad) {
    const levels = CreatorStore.filterLevels(this.communitySearch);
    const rowH = Screens.listRowHeight();
    const top = this.communityListTop();
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
    const pad = Screens.screenPad();
    const cardW = viewW() - pad * 2;
    const gap = uiBtnGap();
    const scroll = Screens.scrollY;
    let y = 100 - scroll;

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("CREATE STAGE", pad, 72);

    y = this._rowLabel("STAGE NAME", pad, y, cardW);
    const nameH = uiBtnHeight(40);
    const nameRect = { x: pad + 12, y: y, w: cardW - 24, h: nameH };
    Screens.btn("cgNameField", "NAME", nameRect.x, nameRect.y, nameRect.w, nameRect.h);
    App.ctx.fillStyle = "rgba(18,18,28,0.85)";
    roundRect(App.ctx, nameRect.x, nameRect.y, nameRect.w, nameRect.h, 8);
    App.ctx.fill();
    App.ctx.strokeStyle = rgb(COLORS.gray);
    App.ctx.lineWidth = 2;
    roundRect(App.ctx, nameRect.x, nameRect.y, nameRect.w, nameRect.h, 8);
    App.ctx.stroke();
    App.ctx.font = uiFont(20);
    App.ctx.fillStyle = rgb(draft.name ? COLORS.text : COLORS.gray);
    App.ctx.fillText(draft.name || "Tap to enter name…", nameRect.x + 14, nameRect.y + nameH * 0.62);
    y += nameH + gap;

    y = this._rowLabel("BPM", pad, y, cardW);
    const bpmH = uiBtnHeight(40);
    const bpmY = y;
    drawNeonButton(App.ctx, Screens.btn("cgBpmDown", "◀", pad, bpmY, 52, bpmH), "◀", pointInRect(mousePos, Screens.buttons.cgBpmDown), true);
    App.ctx.font = gameFont(28);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText(String(draft.bpm), pad + 70, bpmY + bpmH * 0.68);
    drawNeonButton(App.ctx, Screens.btn("cgBpmUp", "▶", pad + 130, bpmY, 52, bpmH), "▶", pointInRect(mousePos, Screens.buttons.cgBpmUp), true);
    y += bpmH + gap;

    y = this._rowLabel("MECHANICS", pad, y, cardW);
    const mechH = uiBtnHeight(36);
    for (const item of CREATOR_MECH_KEYS) {
      if (item.needs && !draft.mechanics[item.needs]) continue;
      const on = !!draft.mechanics[item.key];
      const box = Screens.btn(`cgMech-${item.key}`, on ? "ON" : "OFF", pad + 12, y, cardW - 24, mechH);
      drawNeonButton(App.ctx, box, `${on ? "☑" : "☐"} ${item.label}`, pointInRect(mousePos, box), true);
      y += mechH + uiBtnGap(8);
    }
    y += uiBtnGap(6);

    y = this._rowLabel("MUSIC", pad, y, cardW);
    const track = getLevelById(draft.musicTrackId || 1);
    const trackH = uiBtnHeight(36);
    const musicLabel = draft.musicSource === "upload"
      ? (draft.musicFileName || "CUSTOM UPLOAD")
      : `${track.id}. ${track.name}`;
    drawNeonButton(App.ctx, Screens.btn("cgTrackDown", "◀", pad, y, 52, trackH), "◀", pointInRect(mousePos, Screens.buttons.cgTrackDown), true);
    App.ctx.font = uiFont(18);
    App.ctx.fillStyle = rgb(COLORS.text);
    App.ctx.fillText(musicLabel, pad + 70, y + trackH * 0.66);
    drawNeonButton(App.ctx, Screens.btn("cgTrackUp", "▶", pad + cardW - 64, y, 52, trackH), "▶", pointInRect(mousePos, Screens.buttons.cgTrackUp), true);
    y += trackH + uiBtnGap(8);
    drawNeonButton(App.ctx, Screens.btn("cgMusic", "UPLOAD MP3", pad + 12, y, cardW - 24, trackH), "UPLOAD MP3", pointInRect(mousePos, Screens.buttons.cgMusic), true);
    y += trackH + uiBtnGap(6);
    const status = CreatorDom.getUploadStatus();
    if (status && y > 90 && y < viewH()) {
      App.ctx.font = uiFont(14);
      App.ctx.fillStyle = rgb(COLORS.gold);
      App.ctx.fillText(status, pad + 12, y + 14);
      y += uiBtnGap(20);
    } else {
      y += uiBtnGap(8);
    }

    y = this._rowLabel("REWARD", pad, y, cardW);
    const reward = CreatorStore.getReward(draft.rewardId);
    const rewardLine = reward ? reward.name : "None selected";
    const rewardH = uiBtnHeight(40);
    if (Input.touchMode) {
      drawNeonButton(App.ctx, Screens.btn("cgPickReward", rewardLine, pad + 12, y, cardW - 24, rewardH), rewardLine, pointInRect(mousePos, Screens.buttons.cgPickReward), true);
      y += rewardH + uiBtnGap(8);
      drawNeonButton(App.ctx, Screens.btn("cgEditRewards", "REWARDS", pad + 12, y, cardW - 24, rewardH), "REWARDS", pointInRect(mousePos, Screens.buttons.cgEditRewards), true);
      y += rewardH + gap;
    } else {
      drawNeonButton(App.ctx, Screens.btn("cgPickReward", rewardLine, pad + 12, y, cardW - 140, rewardH), rewardLine, pointInRect(mousePos, Screens.buttons.cgPickReward), true);
      drawNeonButton(App.ctx, Screens.btn("cgEditRewards", "REWARDS", pad + cardW - 120, y, 108, rewardH), "REWARDS", pointInRect(mousePos, Screens.buttons.cgEditRewards), true);
      y += rewardH + gap;
    }

    const actionH = uiBtnHeight(44);
    drawNeonButton(App.ctx, Screens.btn("cgTest", "TEST", pad, y, (cardW - gap) / 2, actionH), "TEST", pointInRect(mousePos, Screens.buttons.cgTest), true);
    drawNeonButton(App.ctx, Screens.btn("cgPublish", "PUBLISH", pad + (cardW + gap) / 2, y, (cardW - gap) / 2, actionH), "PUBLISH", pointInRect(mousePos, Screens.buttons.cgPublish), true);
    y += actionH + uiBtnGap(10);
    const backH = uiBtnHeight(40);
    drawNeonButton(App.ctx, Screens.btn("cgBack", "BACK", pad, y, cardW, backH), "BACK", pointInRect(mousePos, Screens.buttons.cgBack), true);
    y += backH + uiBtnGap(24);

    Screens.listMaxScroll = Math.max(0, y + scroll - (viewH() - 100));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);
    Screens.finishButtons();
  },

  _rowLabel(text, pad, y, cardW) {
    if (y < 90 || y > viewH()) return y;
    App.ctx.font = uiFont(16);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.fillText(text, pad + 12, y + 16);
    return y + uiBtnGap(24);
  },

  async launchCommunity(meta) {
    let musicUrl = null;
    if (meta.musicSource === "upload" && meta.hasMusic) {
      musicUrl = meta.musicPublicUrl || await CreatorStore.getMusicUrl(meta.id);
    }
    App.launchGame(applyCreatorDraftToLevel(meta, musicUrl));
  },

  async testDraft() {
    const draft = { ...CreatorStore.draft(), author: "Test" };
    if (!draft.id) draft.id = `test_${Date.now()}`;
    let musicUrl = null;
    if (draft.musicSource === "upload") {
      if (draft._pendingMusic) musicUrl = URL.createObjectURL(draft._pendingMusic);
      else if (draft.musicPublicUrl) musicUrl = draft.musicPublicUrl;
      else if (draft.hasMusic) musicUrl = await CreatorStore.getMusicUrl(draft.id);
    }
    App.launchGame(applyCreatorDraftToLevel(draft, musicUrl));
  },

  handleLevelsClick(save, pos) {
    if (this._hit("lvMain", pos)) { this.levelsTab = "main"; Screens.resetScroll(); return true; }
    if (this._hit("lvCommunity", pos)) {
      this.levelsTab = "community";
      Screens.resetScroll();
      CreatorStore.refreshCommunitySearch(this.communitySearch).catch(() => {});
      return true;
    }
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
      CreatorDom.setUploadStatus("");
      this.page = "stage";
      Screens.resetScroll();
      App.state = "creator";
      return true;
    }
    for (const meta of CreatorStore.filterLevels(this.communitySearch)) {
      if (this._hit(`clevel-${meta.id}`, pos)) { this.launchCommunity(meta); return true; }
    }
    return false;
  },

  handleClick(save, pos) {
    if (this.page === "rewards") return CreatorRewardUi.handleRewardsClick(save, pos);
    if (this.page === "pickReward") return CreatorRewardUi.handlePickClick(save, pos);
    return this._handleStageClick(save, pos);
  },

  _stagePointerDown(pos) {
    const draft = CreatorStore.draft();
    if (this._hit("cgNameField", pos)) {
      CreatorDom.openNameEditor(draft.name, (name) => { draft.name = name; });
      return true;
    }
    if (this._hit("cgMusic", pos)) {
      CreatorDom.pickMusicFile();
      return true;
    }
    return false;
  },

  _handleStageClick(save, pos) {
    const draft = CreatorStore.draft();
    if (this._hit("cgBack", pos)) { App.state = "levels"; this.levelsTab = "community"; return true; }
    if (this._hit("cgBpmDown", pos)) { adjustCreatorBpm(draft, -1); return true; }
    if (this._hit("cgBpmUp", pos)) { adjustCreatorBpm(draft, 1); return true; }
    if (this._hit("cgTrackDown", pos)) { cycleCreatorTrack(draft, -1); return true; }
    if (this._hit("cgTrackUp", pos)) { cycleCreatorTrack(draft, 1); return true; }
    if (this._hit("cgMusic", pos)) return true;
    if (this._hit("cgEditRewards", pos)) { this.page = "rewards"; Screens.resetScroll(); return true; }
    if (this._hit("cgPickReward", pos)) { this.page = "pickReward"; Screens.resetScroll(); return true; }
    if (this._hit("cgTest", pos)) { this.testDraft(); return true; }
    if (this._hit("cgPublish", pos)) {
      if (!draft.name?.trim()) {
        CreatorDom.openNameEditor(draft.name, (name) => { draft.name = name; });
        return true;
      }
      const stageName = draft.name.trim();
      CreatorDom.setUploadStatus("Publishing…");
      CreatorStore.publishLevel()
        .then((id) => {
          CreatorDom.showShareModal(stageName, id);
          App.state = "levels";
          this.levelsTab = "community";
          this.page = "stage";
        })
        .catch((err) => CreatorDom.setUploadStatus(err.message || "Publish failed"));
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
