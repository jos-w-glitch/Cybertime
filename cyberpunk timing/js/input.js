const Input = {
  mousePos: { x: 0, y: 0 },
  isMobile: false,
  touchMode: false,
  pendingButton: null,
  mobileZones: { tap: null, defuse: null },

  init(canvas, save) {
    this.canvas = canvas;
    this.save = save;
    this.isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    this.touchMode = this.isMobile;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  },

  syncPos(clientX, clientY) {
    this.mousePos = toGamePos(this.canvas, clientX, clientY);
  },

  setMobileZones(tap, defuse) {
    this.mobileZones.tap = tap;
    this.mobileZones.defuse = defuse;
  },

  _inMobileZone(zone, pos) {
    const rect = this.mobileZones[zone];
    return rect && pointInRect(pos, rect);
  },

  remapKey(action, keyCode) {
    if (action === "ball") this.save.keys.ballKey = keyCode;
    if (action === "bomb") this.save.keys.bombKey = keyCode;
    writeSave(this.save);
  },

  resolveButton(rawButton) {
    if (rawButton === this.save.keys.ball) return "ball";
    if (rawButton === this.save.keys.bomb) return "bomb";
    if (rawButton === 0) return "ball";
    if (rawButton === 2) return "bomb";
    return null;
  },
};
