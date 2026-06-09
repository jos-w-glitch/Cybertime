const CreatorRewardUi = {
  rewardSliders: null,
  draggingRewardSlider: false,

  drawRewards(save, mousePos, now) {
    Screens.resetButtons();
    drawBackground(App.ctx, now, getBackgroundById(save.equippedBackground), App.stars, save);
    const draft = CreatorStore.rewardDraft();
    const pad = Screens.screenPad();
    const cardW = viewW() - pad * 2;
    const gap = uiBtnGap();
    Screens.listMaxScroll = Math.max(0, 820 - (viewH() - 100));
    let y = 100 - Screens.scrollY;

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("CREATE REWARD", pad, 72);

    if (y > 80 && y < viewH()) {
      App.ctx.font = uiFont(16);
      App.ctx.fillStyle = rgb(COLORS.gold);
      App.ctx.fillText("REWARD NAME", pad + 12, y + 16);
      y += 24;
      const nameBtn = Screens.btn("cgrName", draft.name, pad + 12, y, cardW - 24, uiBtnHeight(40));
      drawNeonButton(App.ctx, nameBtn, draft.name, pointInRect(mousePos, nameBtn), true);
      y += uiBtnHeight(40) + gap;
    }

    if (y > 80 && y < viewH()) {
      App.ctx.fillStyle = rgb(COLORS.gold);
      App.ctx.fillText("BACKGROUND — upload image or video", pad + 12, y + 16);
      y += uiBtnGap(24);
      const bgBtn = Screens.btn("cgrBgUpload", draft.hasMedia ? "MEDIA READY" : "UPLOAD BG", pad + 12, y, cardW - 24, uiBtnHeight(40));
      drawNeonButton(App.ctx, bgBtn, draft.hasMedia ? (draft.mediaFileName || "MEDIA READY") : "UPLOAD BG", pointInRect(mousePos, bgBtn), true);
      y += uiBtnHeight(40) + gap;
    }

    if (y > 80 && y < viewH()) {
      App.ctx.fillStyle = rgb(COLORS.gold);
      App.ctx.fillText("CURSOR — upload PNG", pad + 12, y + 16);
      y += uiBtnGap(24);
      const curBtn = Screens.btn("cgrCursorUpload", draft.hasCursor ? "CURSOR READY" : "UPLOAD CURSOR", pad + 12, y, cardW - 24, uiBtnHeight(40));
      drawNeonButton(App.ctx, curBtn, draft.hasCursor ? "CURSOR READY" : "UPLOAD CURSOR", pointInRect(mousePos, curBtn), true);
      y += uiBtnHeight(40) + gap;
    }

    if (y > 80 && y < viewH()) {
      App.ctx.fillStyle = rgb(COLORS.gold);
      App.ctx.fillText("OR tune grid colors", pad + 12, y + 16);
      y += 28;
      this.rewardSliders = {};
      for (const [key, label] of [["bg", "BG"], ["grid", "GRID"], ["accent", "GLOW"]]) {
        const slider = { x: pad + 16, y: y + 8, w: cardW - 32, label };
        this.rewardSliders[key] = slider;
        const arr = draft[key];
        drawSlider(App.ctx, slider, Math.max(0.12, Math.min(1, arr[0] / 200)));
        y += 48;
      }
      y += 8;
    }

    if (y > 80 && y < viewH()) {
      drawNeonButton(App.ctx, Screens.btn("cgrSave", "SAVE REWARD", pad, y, cardW, uiBtnHeight(44)), "SAVE REWARD", pointInRect(mousePos, Screens.buttons.cgrSave), true);
      y += uiBtnHeight(44) + gap;
      drawNeonButton(App.ctx, Screens.btn("cgrBack", "BACK", pad, y, cardW, uiBtnHeight(40)), "BACK", pointInRect(mousePos, Screens.buttons.cgrBack), true);
      y += uiBtnHeight(40) + uiBtnGap(24);
    }

    Screens.listMaxScroll = Math.max(0, y + Screens.scrollY - (viewH() - 100));
    Screens.scrollY = Math.min(Screens.scrollY, Screens.listMaxScroll);
    Screens.finishButtons();
  },

  drawPickReward(save, mousePos, now) {
    Screens.resetButtons();
    drawBackground(App.ctx, now, getBackgroundById(save.equippedBackground), App.stars, save);
    const pad = Screens.screenPad();
    const rewards = CreatorStore.listRewards();
    const rowH = Input.touchMode ? 64 : 56;
    const rowGap = uiBtnGap(12);
    Screens.listMaxScroll = Math.max(0, 120 + rewards.length * (rowH + rowGap) - (viewH() - 120));

    App.ctx.font = gameFont(40);
    App.ctx.fillStyle = rgb(COLORS.blue);
    App.ctx.fillText("PICK REWARD", pad, 72);

    App.ctx.save();
    App.ctx.beginPath();
    App.ctx.rect(0, 100, viewW(), viewH() - 160);
    App.ctx.clip();

    rewards.forEach((r, i) => {
      const y = 110 + i * (rowH + rowGap) - Screens.scrollY;
      if (y + rowH < 100 || y > viewH() - 80) return;
      const btn = Screens.btn(`cgp-${r.id}`, r.name, pad, y, viewW() - pad * 2, uiBtnHeight(44));
      drawNeonButton(App.ctx, btn, r.name, pointInRect(mousePos, btn), true);
    });
    App.ctx.restore();

    const backH = uiBtnHeight(40);
    const gap = uiBtnGap(16);
    const backY = viewH() - uiBtnGap(24) - backH;
    const newY = backY - gap - backH;
    drawNeonButton(App.ctx, Screens.btn("cgpNew", "+ NEW REWARD", pad, newY, viewW() - pad * 2, backH), "+ NEW REWARD", pointInRect(mousePos, Screens.buttons.cgpNew), true);
    drawNeonButton(App.ctx, Screens.btn("cgpBack", "BACK", pad, backY, viewW() - pad * 2, backH), "BACK", pointInRect(mousePos, Screens.buttons.cgpBack), true);
    Screens.finishButtons();
  },

  handleRewardsClick(save, pos) {
    return this._handleRewardsClick(save, pos);
  },

  handlePointerDown() {
    return false;
  },

  _handleRewardsClick(save, pos) {
    const draft = CreatorStore.rewardDraft();
    if (Screens._hit("cgrBack", pos)) { CreatorUi.page = "stage"; return true; }
    if (Screens._hit("cgrName", pos)) {
      const names = ["STAGE REWARD", "NEON SKIN", "CREATOR BG", "RARE GRID", "MY PRIZE"];
      draft.name = names[(names.indexOf(draft.name) + 1) % names.length];
      return true;
    }
    if (Screens._hit("cgrBgUpload", pos)) return false;
    if (Screens._hit("cgrCursorUpload", pos)) return false;
    if (Screens._hit("cgrSave", pos)) {
      CreatorStore.saveRewardDraft().then(() => { CreatorUi.page = "pickReward"; });
      return true;
    }
    this._handleSliderDrag(draft, pos);
    return true;
  },

  handlePickClick(save, pos) {
    const draft = CreatorStore.draft();
    if (Screens._hit("cgpBack", pos)) { CreatorUi.page = "stage"; return true; }
    if (Screens._hit("cgpNew", pos)) { CreatorStore.resetRewardDraft(); CreatorUi.page = "rewards"; Screens.resetScroll(); return true; }
    for (const r of CreatorStore.listRewards()) {
      if (Screens._hit(`cgp-${r.id}`, pos)) {
        draft.rewardId = r.id;
        draft.rewardName = r.name;
        draft.rewardBg = r.bg;
        draft.rewardGrid = r.grid;
        draft.rewardAccent = r.accent;
        draft.rewardMediaId = r.mediaId || null;
        CreatorUi.page = "stage";
        return true;
      }
    }
    return true;
  },

  _handleSliderDrag(draft, pos) {
    const map = { bg: "bg", grid: "grid", accent: "accent" };
    const bases = { bg: [18, 8, 32], grid: [60, 30, 90], accent: [255, 80, 180] };
    for (const key of ["bg", "grid", "accent"]) {
      const slider = this.rewardSliders?.[key];
      if (!slider) continue;
      const track = { x: slider.x, y: slider.y - 10, w: slider.w, h: 28 };
      if (this.draggingRewardSlider || pointInRect(pos, track)) {
        this.draggingRewardSlider = true;
        const f = sliderValueFromPos(slider, pos);
        draft[map[key]] = bases[key].map((c) => Math.round(c * (0.15 + 0.85 * f)));
        return;
      }
    }
  },
};
