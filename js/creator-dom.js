const CreatorDom = {
  _nameSaveCb: null,

  init() {
    document.getElementById("creator-name-ok")?.addEventListener("click", (e) => {
      e.preventDefault();
      this._saveNameEditor();
    });
    document.getElementById("creator-name-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this._saveNameEditor();
      }
    });

    document.getElementById("creator-share-copy")?.addEventListener("click", () => this._copyShareLink());
    document.getElementById("creator-share-native")?.addEventListener("click", () => this._nativeShare());
    document.getElementById("creator-share-close")?.addEventListener("click", () => this.hideShareModal());
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

  openNameEditor(value, onSave) {
    const modal = document.getElementById("creator-name-modal");
    const input = document.getElementById("creator-name-input");
    if (!modal || !input) return;
    this._nameSaveCb = onSave;
    input.value = value || "";
    modal.classList.remove("hidden");
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  },

  closeNameEditor() {
    document.getElementById("creator-name-modal")?.classList.add("hidden");
    this._nameSaveCb = null;
  },

  _saveNameEditor() {
    const input = document.getElementById("creator-name-input");
    const name = input?.value?.trim().slice(0, 24) || "";
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
