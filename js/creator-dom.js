const CreatorDom = {
  _nameSaveCb: null,
  _uploadStatus: "",

  init() {
    document.getElementById("creator-name-save")?.addEventListener("click", (e) => {
      e.preventDefault();
      this._saveNameEditor();
    });
    document.getElementById("creator-name-cancel")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeNameEditor();
    });
    document.getElementById("creator-name-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this._saveNameEditor();
    });
    document.getElementById("creator-stage-name")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this._saveNameEditor();
      }
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
    const searchWrap = document.getElementById("community-search-wrap");
    const showSearch = App.state === "levels" && CreatorUi.levelsTab === "community";
    searchWrap?.classList.toggle("hidden", !showSearch);
    if (!showSearch || !searchWrap || !App.canvas) return;

    const rect = App.canvas.getBoundingClientRect();
    const scaleY = rect.height / viewH();
    const scaleX = rect.width / viewW();
    const searchY = CreatorUi.communitySearchY();
    searchWrap.style.left = `${rect.left + Screens.screenPad() * scaleX}px`;
    searchWrap.style.width = `${rect.width - Screens.screenPad() * 2 * scaleX}px`;
    searchWrap.style.top = `${rect.top + searchY * scaleY}px`;
  },

  pickFile(accept, onPick) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01";
    document.body.appendChild(input);
    const finish = () => input.remove();
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      finish();
      if (file) onPick(file);
    }, { once: true });
    input.click();
  },

  pickMusicFile() {
    this.pickFile("audio/*,audio/mpeg,audio/mp3,.mp3", (f) => this._handleMusicFile(f));
  },

  pickRewardBgFile() {
    this.pickFile("image/*,video/*,.png,.jpg,.jpeg,.webp,.mp4,.webm", (f) => this._handleRewardBgFile(f));
  },

  pickRewardCursorFile() {
    this.pickFile("image/png,image/jpeg,image/webp,.png,.jpg", (f) => this._handleRewardCursorFile(f));
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

  openNameEditor(value, onSave) {
    const overlay = document.getElementById("creator-name-overlay");
    const input = document.getElementById("creator-stage-name");
    const error = document.getElementById("creator-name-error");
    if (!overlay || !input) return;
    this._nameSaveCb = onSave;
    if (error) error.textContent = "";
    input.value = value || "";
    overlay.classList.remove("hidden");
    document.body.classList.add("creator-form-open");
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.select();
    });
  },

  closeNameEditor() {
    document.getElementById("creator-name-overlay")?.classList.add("hidden");
    document.body.classList.remove("creator-form-open");
    const error = document.getElementById("creator-name-error");
    if (error) error.textContent = "";
    this._nameSaveCb = null;
  },

  _saveNameEditor() {
    const input = document.getElementById("creator-stage-name");
    const name = input?.value?.trim().slice(0, 24) || "";
    if (!name) {
      const error = document.getElementById("creator-name-error");
      if (error) error.textContent = "Enter a stage name";
      return;
    }
    if (this._nameSaveCb) this._nameSaveCb(name);
    CreatorStore.draft().name = name;
    this.closeNameEditor();
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
