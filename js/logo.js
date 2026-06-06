const Logo = {
  img: null,
  ready: false,

  load() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.img = img;
        this.ready = true;
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = LOGO_PATH;
    });
  },

  draw(ctx, x, y, maxW, maxH) {
    if (!this.ready || !this.img) return false;
    const scale = Math.min(maxW / this.img.width, maxH / this.img.height);
    const w = this.img.width * scale;
    const h = this.img.height * scale;
    ctx.drawImage(this.img, x + (maxW - w) / 2, y + (maxH - h) / 2, w, h);
    return true;
  },

  drawHero(ctx) {
    return this.draw(ctx, 340, 16, 600, 140);
  },

  drawHeader(ctx) {
    return this.draw(ctx, 24, 8, 200, 72);
  },
};
