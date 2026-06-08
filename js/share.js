const SHARE_GAME_URL = "https://www.joseph-weiss.com/cybertime/";

const Share = {
  _renderer: null,

  buildMessage(score, level) {
    if (level?.infinite) {
      return `I got ${score} points in CyberTime Infinite! Can you beat me?`;
    }
    return `I got ${score} points in CyberTime! Can you beat me?`;
  },

  async loadRenderer() {
    if (this._renderer) return this._renderer;
    this._renderer = await import("./replay/replay-render.js");
    return this._renderer;
  },

  downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  },

  async shareText(message) {
    const payload = `${message}\n${SHARE_GAME_URL}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "CyberTime", text: message, url: SHARE_GAME_URL });
        return "shared";
      } catch (err) {
        if (err?.name === "AbortError") return null;
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload);
        return "copied";
      } catch {}
    }

    return null;
  },

  async shareScore(game) {
    const score = game?.score ?? 0;
    const level = game?.level;
    const message = this.buildMessage(score, level);
    const replay = Replay.forShare(game);

    if (replay?.events?.length) {
      try {
        Screens.shareFeedback = "Creating replay...";
        const renderer = await this.loadRenderer();
        const supported = await renderer.canRenderReplayVideo();
        if (supported) {
          const blob = await renderer.renderCyberTimeReplay(replay);
          const file = new File([blob], "cybertime-replay.mp4", { type: "video/mp4" });
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: "CyberTime", text: message, files: [file] });
            return "shared";
          }
          this.downloadBlob(blob, "cybertime-replay.mp4");
          return "downloaded";
        }
      } catch (err) {
        console.warn("Remotion replay render failed", err);
      }
    }

    return this.shareText(message);
  },
};
