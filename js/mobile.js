const MobileShell = {
  init() {
    if (!Input.isMobile) return;
    document.documentElement.classList.add("mobile-device");
    this.overlay = document.getElementById("rotate-overlay");
    this.bindViewport();
    this.syncRotatePrompt();
  },

  bindViewport() {
    const refresh = () => {
      this.syncRotatePrompt();
      if (App?.canvas) applyViewport(App.canvas);
    };

    window.visualViewport?.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("scroll", refresh);
    window.addEventListener("orientationchange", () => setTimeout(refresh, 150));
    window.addEventListener("resize", refresh);
  },

  isLandscape() {
    return window.innerWidth > window.innerHeight;
  },

  syncRotatePrompt() {
    if (!this.overlay) return;

    if (!Input?.touchMode) {
      this.overlay.classList.add("hidden");
      document.body.classList.remove("rotate-blocked");
      return;
    }

    const show = this.isLandscape();
    this.overlay.classList.toggle("hidden", !show);
    document.body.classList.toggle("rotate-blocked", show);
  },

  async enterPlayMode() {
    if (!Input.touchMode || Input.playMode) return;
    Input.playMode = true;
    document.body.classList.add("game-playing");
    this.hideBrowserChrome();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.({ navigationUI: "hide" });
      }
    } catch {}
    applyViewport(App.canvas);
  },

  exitPlayMode() {
    if (!Input.playMode) return;
    Input.playMode = false;
    document.body.classList.remove("game-playing");
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    applyViewport(App.canvas);
  },

  hideBrowserChrome() {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 1));
  },
};

function viewportSize() {
  const vp = window.visualViewport;
  if (Input.touchMode && vp) {
    return { w: vp.width, h: vp.height };
  }
  return { w: window.innerWidth, h: window.innerHeight };
}
