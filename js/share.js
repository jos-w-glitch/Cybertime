const SHARE_BG = "#FCEE0A";
const SHARE_WIDTH = 1080;
const SHARE_HEIGHT = 840;

const Share = {
  _imageBlob: null,
  _preparePromise: null,
  _status: "idle",

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
    await loadGameFont();
    const w = SHARE_WIDTH;
    const h = SHARE_HEIGHT;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = SHARE_BG;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    ctx.textAlign = "center";
    ctx.fillStyle = "#111";

    ctx.font = `bold 52px '${GAME_FONT}', sans-serif`;
    ctx.fillText("CYBERTIME", cx, h * 0.22);

    ctx.font = `bold 44px '${GAME_FONT}', sans-serif`;
    ctx.fillText("SCORE", cx, h * 0.38);

    ctx.font = `bold 120px '${GAME_FONT}', sans-serif`;
    ctx.fillText(String(game.score), cx, h * 0.56);

    ctx.font = `bold 36px '${GAME_FONT}', sans-serif`;
    this.drawWrappedText(ctx, this.stageLabel(game.level), cx, h * 0.70, w * 0.85, 44);

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

  async openShareSheet(game, blob) {
    if (!navigator.share) return "unavailable";

    const text = this.buildMessage(game.score, game.level);
    const file = new File([blob], "cybertime-score.png", { type: "image/png" });
    const attempts = [
      { title: "CyberTime", text, files: [file] },
      { files: [file] },
      { title: "CyberTime", text },
      { text },
    ];

    for (const payload of attempts) {
      if (navigator.canShare && !navigator.canShare(payload)) continue;
      try {
        await navigator.share(payload);
        return "shared";
      } catch (err) {
        if (err?.name === "AbortError") return null;
      }
    }
    return "unavailable";
  },

  async shareScore(game) {
    if (this._status === "failed") return "failed";

    let blob = this._imageBlob;
    if (!blob) {
      Screens.shareFeedback = "Creating image...";
      blob = await (this._preparePromise || this.prepareShareCard(game));
    }
    if (!blob) return "failed";

    return (await this.openShareSheet(game, blob)) || "failed";
  },
};
