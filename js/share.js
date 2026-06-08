const SHARE_TEMPLATE_PATH = "assets/share-template.png";

const Share = {
  _imageBlob: null,
  _preparePromise: null,
  _status: "idle",
  _templateImage: null,

  reset() {
    this._imageBlob = null;
    this._preparePromise = null;
    this._status = "idle";
  },

  buildMessage(score, level) {
    if (level?.infinite) {
      return `I scored ${score} in CyberTime Infinite!`;
    }
    return `I scored ${score} on Stage ${level.id} in CyberTime!`;
  },

  shareLabel() {
    if (this._status === "preparing") return "PREPARING...";
    if (this._status === "ready") return "SHARE";
    if (this._status === "failed") return "SHARE UNAVAILABLE";
    return "SHARE";
  },

  stageLabel(level) {
    if (level?.infinite) return "INFINITE MODE";
    return `STAGE ${level.id} — ${level.name}`;
  },

  async loadTemplate() {
    if (this._templateImage) return this._templateImage;
    await loadGameFont();
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Share template failed to load"));
      img.src = SHARE_TEMPLATE_PATH;
    });
    this._templateImage = img;
    return img;
  },

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let drawY = y;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, drawY);
        line = word;
        drawY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, drawY);
    return drawY;
  },

  async renderShareImage(game) {
    const img = await this.loadTemplate();
    const scale = 3;
    const w = img.width * scale;
    const h = img.height * scale;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    const textX = w * 0.52;
    const maxW = w * 0.42;
    ctx.textAlign = "left";
    ctx.fillStyle = "#111";
    ctx.shadowColor = "rgba(255, 220, 0, 0.35)";
    ctx.shadowBlur = 4 * scale;

    ctx.font = `bold ${Math.round(26 * scale)}px '${GAME_FONT}', sans-serif`;
    ctx.fillText("SCORE", textX, h * 0.30);

    ctx.font = `bold ${Math.round(56 * scale)}px '${GAME_FONT}', sans-serif`;
    ctx.fillText(String(game.score), textX, h * 0.50);

    ctx.font = `bold ${Math.round(17 * scale)}px '${GAME_FONT}', sans-serif`;
    this.drawWrappedText(ctx, this.stageLabel(game.level), textX, h * 0.64, maxW, Math.round(22 * scale));

    ctx.shadowBlur = 0;
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
  },

  prepareShareCard(game) {
    this.reset();
    this._status = "preparing";
    this._preparePromise = this.renderShareImage(game)
      .then((blob) => {
        this._imageBlob = blob;
        this._status = blob ? "ready" : "failed";
        return blob;
      })
      .catch((err) => {
        console.warn("Share image failed", err);
        this._status = "failed";
        return null;
      });
    return this._preparePromise;
  },

  downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  async saveImageBlob(blob) {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "cybertime-score.png",
          types: [{ accept: { "image/png": [".png"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return "saved";
      } catch (err) {
        if (err?.name === "AbortError") return null;
      }
    }
    this.downloadBlob(blob, "cybertime-score.png");
    return "downloaded";
  },

  async shareImageFile(blob) {
    const file = new File([blob], "cybertime-score.png", { type: "image/png" });
    if (navigator.share) {
      const payloads = [
        { files: [file] },
        { title: "CyberTime", files: [file] },
      ];
      for (const payload of payloads) {
        if (navigator.canShare && !navigator.canShare(payload)) continue;
        try {
          await navigator.share(payload);
          return "shared";
        } catch (err) {
          if (err?.name === "AbortError") return null;
        }
      }
    }
    return this.saveImageBlob(blob);
  },

  async shareScore(game) {
    if (this._status === "failed") return "failed";

    let blob = this._imageBlob;
    if (!blob) {
      Screens.shareFeedback = "Creating image...";
      blob = await (this._preparePromise || this.prepareShareCard(game));
    }
    if (!blob) return "failed";

    const result = await this.shareImageFile(blob);
    return result || "failed";
  },
};
