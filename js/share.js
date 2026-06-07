const SHARE_GAME_URL = "https://www.joseph-weiss.com/cybertime/";

const Share = {
  buildMessage(score, level) {
    if (level?.infinite) {
      return `I got ${score} points in CyberTime Infinite! Can you beat me?`;
    }
    return `I got ${score} points in CyberTime! Can you beat me?`;
  },

  async shareScore(score, level) {
    const message = this.buildMessage(score, level);
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
};
