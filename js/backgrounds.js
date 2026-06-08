const CUSTOM_BG_STORE = "cybertime-custom-bg";
const CUSTOM_BG_MAX_BYTES = 6 * 1024 * 1024;

const CustomBackground = {
  async save(file) {
    if (file.size > CUSTOM_BG_MAX_BYTES) throw new Error("File too large (max 6MB)");
    const db = await this._openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put({ blob: file, type: file.type, at: Date.now() }, "active");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async load() {
    const db = await this._openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const req = tx.objectStore("files").get("active");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async clear() {
    const db = await this._openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").delete("active");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  _openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(CUSTOM_BG_STORE, 1);
      req.onupgradeneeded = () => req.result.createObjectStore("files");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
};

const BackgroundEngine = {
  _cache: new Map(),
  _custom: null,
  _customUrl: null,

  videoPath(bg) {
    if (!bg?.video) return null;
    return bg.video.startsWith("assets/") ? bg.video : `assets/backgrounds/${bg.video}`;
  },

  _makeVideo(src) {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.play().catch(() => {});
    return video;
  },

  async preload(bg) {
    if (!bg || bg.custom || this._cache.has(bg.id)) return;
    const src = this.videoPath(bg);
    if (!src) return;
    const video = this._makeVideo(src);
    this._cache.set(bg.id, video);
    await new Promise((resolve) => {
      if (video.readyState >= 2) { resolve(); return; }
      video.addEventListener("canplay", () => resolve(), { once: true });
      video.addEventListener("error", () => resolve(), { once: true });
    });
  },

  async preloadAll() {
    await Promise.all(BACKGROUNDS.filter((b) => !b.custom).map((b) => this.preload(b)));
    await this.loadCustom();
  },

  async loadCustom() {
    this._revokeCustom();
    const record = await CustomBackground.load().catch(() => null);
    if (!record?.blob) return;
    const url = URL.createObjectURL(record.blob);
    this._customUrl = url;
    if (record.type.startsWith("video/")) {
      const video = this._makeVideo(url);
      this._custom = { kind: "video", el: video };
      await new Promise((resolve) => {
        video.addEventListener("canplay", () => resolve(), { once: true });
        video.addEventListener("error", () => resolve(), { once: true });
      });
      return;
    }
    const img = new Image();
    img.src = url;
    this._custom = { kind: "image", el: img };
    await new Promise((resolve) => {
      if (img.complete) { resolve(); return; }
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  },

  async uploadCustom(file) {
    await CustomBackground.save(file);
    await this.loadCustom();
  },

  _revokeCustom() {
    if (this._customUrl) URL.revokeObjectURL(this._customUrl);
    this._customUrl = null;
    this._custom = null;
  },

  _activeMedia(bg, save) {
    if (bg?.custom && save?.ownedBackgrounds?.includes("custom") && save.equippedBackground === "custom") {
      return this._custom;
    }
    if (!bg?.video) return null;
    return { kind: "video", el: this._cache.get(bg.id) };
  },

  _drawCover(ctx, el, vw, vh) {
    const scale = Math.max(viewW() / vw, viewH() / vh);
    const w = vw * scale;
    const h = vh * scale;
    ctx.drawImage(el, (viewW() - w) / 2, (viewH() - h) / 2, w, h);
  },

  draw(ctx, bg, save) {
    const media = this._activeMedia(bg, save);
    if (!media?.el) return false;
    const el = media.el;
    const ready = media.kind === "video" ? el.readyState >= 2 : el.complete;
    if (!ready) return false;

    const vw = media.kind === "video" ? (el.videoWidth || 1280) : el.naturalWidth;
    const vh = media.kind === "video" ? (el.videoHeight || 720) : el.naturalHeight;
    this._drawCover(ctx, el, vw, vh);
    ctx.fillStyle = "rgba(5,5,15,0.32)";
    ctx.fillRect(0, 0, viewW(), viewH());
    return true;
  },

  drawThumb(ctx, x, y, w, h, bg, save) {
    const prev = save?.equippedBackground;
    const tempSave = prev === bg.id ? save : { ...save, equippedBackground: bg.id };
    const media = this._activeMedia(bg, tempSave);
    ctx.save();
    roundRect(ctx, x, y, w, h, 6);
    ctx.clip();
    if (media?.el) {
      const el = media.el;
      const ready = media.kind === "video" ? el.readyState >= 2 : el.complete;
      if (ready) {
        const vw = media.kind === "video" ? (el.videoWidth || 1280) : el.naturalWidth;
        const vh = media.kind === "video" ? (el.videoHeight || 720) : el.naturalHeight;
        const scale = Math.max(w / vw, h / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        ctx.drawImage(el, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        ctx.restore();
        return;
      }
    }
    if (!bg.custom) this.preload(bg);
    ctx.fillStyle = rgb(COLORS.bg);
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },
};

const LEGACY_BACKGROUND_IDS = {
  cyber: "grid-black",
  matrix: "grid-blue",
  sunset: "grid-neon",
  space: "neon-flow",
  retro: "wave",
};

function migrateBackgroundId(id) {
  return LEGACY_BACKGROUND_IDS[id] || id;
}
