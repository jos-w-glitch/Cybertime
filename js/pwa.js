const PwaInstall = {
  prompt: null,

  init() {
    if (window.CYBERTIME_PORTAL === "crazygames") return;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.prompt = e;
    });
    this.registerServiceWorker();
  },

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("/cybertime/sw.js", { scope: "/cybertime/" });
    } catch {}
  },

  isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches
      || window.matchMedia("(display-mode: fullscreen)").matches
      || navigator.standalone === true;
  },

  isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  canPromptInstall() {
    return !!this.prompt;
  },

  async promptInstall() {
    if (!this.prompt) return false;
    await this.prompt.prompt();
    await this.prompt.userChoice;
    this.prompt = null;
    return true;
  },

  iosHint() {
    return "Safari → Share (□↑) → Add to Home Screen";
  },
};
