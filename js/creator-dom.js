const CreatorDom = {
  _uploadStatus: "",

  init() {
    document.getElementById("creator-inline-name")?.addEventListener("input", (e) => {
      CreatorStore.draft().name = (e.target.value || "").slice(0, 24);
    });
    document.getElementById("creator-inline-name")?.addEventListener("focus", () => {
      document.body.classList.add("creator-form-open");
    });
    document.getElementById("creator-inline-name")?.addEventListener("blur", () => {
      document.body.classList.remove("creator-form-open");
    });

    document.getElementById("creator-music-file")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) this._handleMusicFile(file);
    });
    document.getElementById("creator-bg-file")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) this._handleRewardBgFile(file);
    });
    document.getElementById("creator-cursor-file")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) this._handleRewardCursorFile(file);
    });

    document.getElementById("community-search")?.addEventListener("input", (e) => {
      CreatorUi.communitySearch = e.target.value || "";
      Screens.resetScroll();
      CreatorStore.refreshCommunitySearch(CreatorUi.communitySearch).catch(() => {});
    });

    document.getElementById("creator-share-copy")?.addEventListener("click", () => this._copyShareLink());
    document.getElementById("creator-share-native")?.addEventListener("click", () => this._nativeShare());
    document.getElementById("creator-share-close")?.addEventListener("click", () => this.hideShareModal());
  },

  syncOverlays() {
    this._syncCommunitySearch();
    this._syncCreatorInputs();
  },

  _canvasRect() {
    return App.canvas?.getBoundingClientRect() || null;
  },

  _gameToScreen(rect) {
    const cr = this._canvasRect();
    if (!cr || !rect) return null;
    const scaleX = cr.width / viewW();
    const scaleY = cr.height / viewH();
    return {
      left: cr.left + rect.x * scaleX,
      top: cr.top + rect.y * scaleY,
      width: rect.w * scaleX,
      height: rect.h * scaleY,
    };
  },

  _onScreen(rect) {
    if (!rect) return false;
    return rect.y + rect.h > 72 && rect.y < viewH() - 16;
  },

  _place(el, gameRect) {
    if (!el) return;
    if (!this._onScreen(gameRect)) {
      el.classList.add("hidden");
      return;
    }
    const s = this._gameToScreen(gameRect);
    if (!s) {
      el.classList.add("hidden");
      return;
    }
    el.classList.remove("hidden");
    el.style.left = `${s.left}px`;
    el.style.top = `${s.top}px`;
    el.style.width = `${s.width}px`;
    el.style.height = `${s.height}px`;
  },

  _syncCommunitySearch() {
    const searchWrap = document.getElementById("community-search-wrap");
    const showSearch = App.state === "levels" && CreatorUi.levelsTab === "community";
    searchWrap?.classList.toggle("hidden", !showSearch);
    if (!showSearch || !searchWrap || !App.canvas) return;

    const rect = this._canvasRect();
    const scaleY = rect.height / viewH();
    const scaleX = rect.width / viewW();
    const searchY = CreatorUi.communitySearchY();
    searchWrap.style.left = `${rect.left + Screens.screenPad() * scaleX}px`;
    searchWrap.style.width = `${rect.width - Screens.screenPad() * 2 * scaleX}px`;
    searchWrap.style.top = `${rect.top + searchY * scaleY}px`;
  },

  _syncCreatorInputs() {
    const root = document.getElementById("creator-overlays");
    const nameInput = document.getElementById("creator-inline-name");
    const musicLabel = document.getElementById("creator-music-label");
    const bgLabel = document.getElementById("creator-bg-label");
    const cursorLabel = document.getElementById("creator-cursor-label");
    const inCreator = App.state === "creator";

    root?.classList.toggle("hidden", !inCreator);
    if (!inCreator) return;

    const page = CreatorUi.page;
    if (page === "stage") {
      const draft = CreatorStore.draft();
      if (nameInput && document.activeElement !== nameInput) {
        nameInput.value = draft.name || "";
      }
      this._place(nameInput, Screens.buttons.cgNameField);
      this._place(musicLabel, Screens.buttons.cgMusic);
      bgLabel?.classList.add("hidden");
      cursorLabel?.classList.add("hidden");
      return;
    }

    nameInput?.classList.add("hidden");
    musicLabel?.classList.add("hidden");
    if (page === "rewards") {
      this._place(bgLabel, Screens.buttons.cgrBgUpload);
      this._place(cursorLabel, Screens.buttons.cgrCursorUpload);
      return;
    }

    bgLabel?.classList.add("hidden");
    cursorLabel?.classList.add("hidden");
  },

  focusNameField() {
    const input = document.getElementById("creator-inline-name");
    if (!input || input.classList.contains("hidden")) return;
    input.focus({ preventScroll: true });
  },

  async _handleMusicFile(file) {
    this.setUploadStatus("Saving music…");
    try {
      await CreatorStore.attachMusic(file);
      const draft = CreatorStore.draft();
      const cloud = draft.musicPublicUrl ? " · cloud" : "";
      this.setUploadStatus(`Music ready: ${file.name}${cloud}`);
    } catch (err) {
      this.setUploadStatus(err.message || "Music upload failed");
    }
  },

  async _handleRewardBgFile(file) {
    this.setUploadStatus("Saving background…");
    try {
      await CreatorStore.attachRewardBg(file);
      const draft = CreatorStore.rewardDraft();
      const cloud = draft.bgPublicUrl ? " · cloud" : "";
      this.setUploadStatus(`Background ready: ${file.name}${cloud}`);
    } catch (err) {
      this.setUploadStatus(err.message || "Background upload failed");
    }
  },

  async _handleRewardCursorFile(file) {
    this.setUploadStatus("Saving cursor…");
    try {
      await CreatorStore.attachRewardCursor(file);
      const draft = CreatorStore.rewardDraft();
      const cloud = draft.cursorPublicUrl ? " · cloud" : "";
      this.setUploadStatus(`Cursor ready: ${file.name}${cloud}`);
    } catch (err) {
      this.setUploadStatus(err.message || "Cursor upload failed");
    }
  },

  setUploadStatus(message) {
    this._uploadStatus = message || "";
  },

  getUploadStatus() {
    return this._uploadStatus;
  },

  showShareModal(stageName, levelId) {
    const modal = document.getElementById("creator-share-modal");
    const text = document.getElementById("creator-share-text");
    if (!modal) return;
    const link = this.shareLink(levelId);
    if (text) {
      text.textContent = `Published "${stageName}"! Friends can play it in CyberTime → LEVELS → COMMUNITY.${link ? ` Link: ${link}` : ""}`;
    }
    modal.classList.remove("hidden");
    this._shareLevelId = levelId;
    this._shareStageName = stageName;
  },

  hideShareModal() {
    document.getElementById("creator-share-modal")?.classList.add("hidden");
  },

  shareLink(levelId) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?community=${encodeURIComponent(levelId)}`;
  },

  shareMessage(stageName) {
    return `I made a CyberTime stage: "${stageName}" — play it in Community Levels!`;
  },

  async _nativeShare() {
    const msg = this.shareMessage(this._shareStageName || "My Stage");
    const url = this.shareLink(this._shareLevelId);
    if (navigator.share) {
      try {
        await navigator.share({ title: "CyberTime Stage", text: msg, url });
        return;
      } catch {}
    }
    this._copyShareLink();
  },

  _copyShareLink() {
    const msg = `${this.shareMessage(this._shareStageName || "My Stage")} ${this.shareLink(this._shareLevelId)}`;
    navigator.clipboard?.writeText(msg.trim()).catch(() => {});
  },
};
