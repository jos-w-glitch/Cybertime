const OFFICIAL_SITE_URL = "https://www.joseph-weiss.com/cybertime/";
const PROMO_COOLDOWN_MS = 10 * 60 * 1000;
const PROMO_MENU_WAIT_MS = 3 * 60 * 1000;
const PROMO_STORAGE_KEY = "cybertime-promo-dismissed";

const SitePromo = {
  visible: false,
  menuSince: 0,

  enabled() {
    const host = location.hostname.replace(/^www\./, "");
    return host !== "joseph-weiss.com" && !host.endsWith(".joseph-weiss.com");
  },

  lastDismissedAt() {
    return Number(localStorage.getItem(PROMO_STORAGE_KEY) || 0);
  },

  canShow() {
    if (!this.enabled()) return false;
    return Date.now() - this.lastDismissedAt() >= PROMO_COOLDOWN_MS;
  },

  tryShow() {
    if (this.visible || !this.canShow()) return;
    this.visible = true;
  },

  onEnterMenu(now) {
    if (!this.menuSince) this.menuSince = now;
    if (now - this.menuSince >= PROMO_MENU_WAIT_MS) this.tryShow();
  },

  onLeaveMenu() {
    this.menuSince = 0;
  },

  onGameOver() {
    this.tryShow();
  },

  dismiss() {
    this.visible = false;
    this.menuSince = 0;
    localStorage.setItem(PROMO_STORAGE_KEY, String(Date.now()));
  },

  visit() {
    window.open(OFFICIAL_SITE_URL, "_blank", "noopener,noreferrer");
    this.dismiss();
  },
};
