const PromoUi = {
  draw(mousePos) {
    Screens.resetButtons();
    const lines = [
      "Play the full CyberTime experience",
      "on the official website:",
      "joseph-weiss.com/cybertime",
    ];
    const btnH = btnHeight(52);
    const gap = 16;
    const btnW = Input.touchMode ? Math.min(260, (viewW() - 80 - gap) / 2) : 200;
    const btnY = viewH() / 2 + 72;
    const startX = (viewW() - btnW * 2 - gap) / 2;
    const visit = Screens.btn("promoVisit", "VISIT SITE", startX, btnY, btnW, btnH);
    const later = Screens.btn("promoLater", "LATER", startX + btnW + gap, btnY, btnW, btnH);

    App.ctx.fillStyle = "rgba(0,0,0,0.72)";
    App.ctx.fillRect(0, 0, viewW(), viewH());

    const panelW = Math.min(760, viewW() - 40);
    const panelH = 80 + lines.length * 36 + 100;
    const panelX = (viewW() - panelW) / 2;
    const panelY = (viewH() - panelH) / 2;
    App.ctx.fillStyle = rgb(COLORS.bg);
    roundRect(App.ctx, panelX, panelY, panelW, panelH, 12);
    App.ctx.fill();
    App.ctx.strokeStyle = rgb(COLORS.gold);
    App.ctx.lineWidth = 3;
    roundRect(App.ctx, panelX, panelY, panelW, panelH, 12);
    App.ctx.stroke();

    App.ctx.font = gameFont(Input.touchMode ? 36 : 44);
    App.ctx.fillStyle = rgb(COLORS.gold);
    App.ctx.textAlign = "center";
    App.ctx.fillText("OFFICIAL SITE", viewW() / 2, panelY + 56);
    App.ctx.font = gameFont(Input.touchMode ? 20 : 24);
    App.ctx.fillStyle = rgb(COLORS.text);
    lines.forEach((line, i) => {
      App.ctx.fillText(line, viewW() / 2, panelY + 100 + i * 36);
    });
    App.ctx.textAlign = "left";

    drawNeonButton(App.ctx, visit, "VISIT SITE", pointInRect(mousePos, visit));
    drawNeonButton(App.ctx, later, "LATER", pointInRect(mousePos, later), true);
    Screens.finishButtons();
  },

  handleClick(pos) {
    if (!SitePromo.visible) return false;
    if (Screens._hit("promoVisit", pos)) {
      SitePromo.visit();
      return true;
    }
    if (Screens._hit("promoLater", pos)) {
      SitePromo.dismiss();
      return true;
    }
    return true;
  },
};
