const CreatorDom = {
  _nameRect: null,

  init() {
    const name = document.getElementById("creator-name-input");
    name?.addEventListener("input", () => {
      CreatorStore.draft().name = name.value.slice(0, 24);
    });

    document.getElementById("creator-music-input")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await CreatorStore.attachMusic(file);
      } catch (err) {
        console.error(err);
      }
      e.target.value = "";
    });

    document.getElementById("creator-reward-bg-input")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await CreatorStore.attachRewardBg(file);
      } catch (err) {
        console.error(err);
      }
      e.target.value = "";
    });

    document.getElementById("creator-reward-cursor-input")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await CreatorStore.attachRewardCursor(file);
      } catch (err) {
        console.error(err);
      }
      e.target.value = "";
    });

    document.getElementById("creator-share-copy")?.addEventListener("click", () => this._copyShareLink());
    document.getElementById("creator-share-native")?.addEventListener("click", () => this._nativeShare());
    document.getElementById("creator-share-close")?.addEventListener("click", () => this.hideShareModal());
  },

  setActive(state) {
    const showName = state === "creator" && CreatorUi.page === "stage";
    const nameEl = document.getElementById("creator-name-input");
    if (nameEl) nameEl.classList.toggle("hidden", !showName);
    if (!showName) this._nameRect = null;
  },

  syncNameField(draft) {
    const el = document.getElementById("creator-name-input");
    if (el && el.value !== draft.name) el.value = draft.name || "";
  },

  positionNameField(rect) {
    this._nameRect = rect;
    const el = document.getElementById("creator-name-input");
    const canvas = App?.canvas;
    if (!el || !canvas || !rect) return;
    const box = canvas.getBoundingClientRect();
    const sx = box.width / viewW();
    const sy = box.height / viewH();
    el.style.left = `${box.left + rect.x * sx}px`;
    el.style.top = `${box.top + rect.y * sy}px`;
    el.style.width = `${rect.w * sx}px`;
    el.style.height = `${rect.h * sy}px`;
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
