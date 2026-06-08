const Share = {
  _renderer: null,
  _videoBlob: null,
  _preparePromise: null,
  _status: "idle",

  reset() {
    this._videoBlob = null;
    this._preparePromise = null;
    this._status = "idle";
  },

  buildMessage(score, level) {
    if (level?.infinite) {
      return `I got ${score} points in CyberTime Infinite! Can you beat me?`;
    }
    return `I got ${score} points in CyberTime! Can you beat me?`;
  },

  shareLabel() {
    if (this._status === "preparing") return "PREPARING VIDEO...";
    if (this._status === "ready") return "SHARE VIDEO";
    if (this._status === "failed") return "VIDEO UNAVAILABLE";
    return "SHARE VIDEO";
  },

  async loadRenderer() {
    if (this._renderer) return this._renderer;
    this._renderer = await import("./replay/replay-render.js");
    return this._renderer;
  },

  async renderReplayBlob(replay) {
    const renderer = await this.loadRenderer();
    const supported = await renderer.canRenderReplayVideo();
    if (!supported) return null;
    return renderer.renderCyberTimeReplay(replay);
  },

  prepareReplay(game) {
    this.reset();
    const replay = Replay.forShare(game);
    if (!replay?.events?.length) {
      this._status = "failed";
      return Promise.resolve(null);
    }

    this._status = "preparing";
    this._preparePromise = this.renderReplayBlob(replay)
      .then((blob) => {
        this._videoBlob = blob;
        this._status = blob ? "ready" : "failed";
        return blob;
      })
      .catch((err) => {
        console.warn("Replay prepare failed", err);
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

  async saveVideoBlob(blob) {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "cybertime-replay.mp4",
          types: [{ accept: { "video/mp4": [".mp4"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return "saved";
      } catch (err) {
        if (err?.name === "AbortError") return null;
      }
    }

    this.downloadBlob(blob, "cybertime-replay.mp4");
    return "downloaded";
  },

  async shareVideoFile(blob) {
    const file = new File([blob], "cybertime-replay.mp4", { type: "video/mp4" });

    if (navigator.share) {
      const payloads = [
        { files: [file] },
        { title: "CyberTime Replay", files: [file] },
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

    return this.saveVideoBlob(blob);
  },

  async shareScore(game) {
    if (this._status === "failed") return "failed";

    let blob = this._videoBlob;
    if (!blob) {
      Screens.shareFeedback = "Finishing video...";
      blob = await (this._preparePromise || this.prepareReplay(game));
    }
    if (!blob) return "failed";

    const result = await this.shareVideoFile(blob);
    return result || "failed";
  },
};
