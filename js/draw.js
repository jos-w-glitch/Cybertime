function rgb(c, a = 1) {
  return a === 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function pointInRect(p, rect) {
  return p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h;
}

function toGamePos(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * viewW(),
    y: ((clientY - rect.top) / rect.height) * viewH(),
  };
}

function createStars(count = 40) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * viewW(),
    y: Math.random() * viewH(),
    speed: 0.5 + Math.random() * 1.5,
  }));
}

function clearFrame(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = rgb(COLORS.bg);
  ctx.fillRect(0, 0, viewW(), viewH());
}

function drawBootMessage(ctx, title, lines = []) {
  clearFrame(ctx);
  ctx.textAlign = "center";
  ctx.font = gameFont(48);
  ctx.fillStyle = rgb(COLORS.blue);
  ctx.fillText(title, viewW() / 2, viewH() / 2 - 20);
  ctx.font = gameFont(22);
  ctx.fillStyle = rgb(COLORS.text);
  lines.forEach((line, i) => {
    ctx.fillText(line, viewW() / 2, viewH() / 2 + 30 + i * 30);
  });
  ctx.textAlign = "left";
}

function fitCanvasToWindow(canvas) {
  const { w: availW, h: availH } = viewportSize();
  const ratio = viewW() / viewH();
  let w = availW;
  let h = w / ratio;
  if (h > availH) {
    h = availH;
    w = h * ratio;
  }
  canvas.style.width = `${Math.floor(w)}px`;
  canvas.style.height = `${Math.floor(h)}px`;
}

function applyViewport(canvas) {
  if (!canvas) return;
  if (Input?.touchMode) MobileShell.syncRotatePrompt();
  canvas.width = viewW();
  canvas.height = viewH();
  fitCanvasToWindow(canvas);
}

const UiIcons = {
  home: null,

  load() {
    this.home = this._loadImage(HOME_ICON_PATH);
  },

  _loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  },
};

function drawIconButton(ctx, rect, img, hovered) {
  const r = ICON_BUTTON_RADIUS;
  if (hovered) {
    ctx.fillStyle = rgb(COLORS.gold, 0.18);
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
    ctx.fill();
    ctx.strokeStyle = rgb(COLORS.gold);
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
    ctx.stroke();
  }
  if (img?.complete && img.naturalWidth > 0) {
    ctx.save();
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
    ctx.clip();
    const pad = 6;
    ctx.drawImage(img, rect.x + pad, rect.y + pad, rect.w - pad * 2, rect.h - pad * 2);
    ctx.restore();
    return;
  }
  ctx.fillStyle = rgb(COLORS.gray);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
  ctx.fill();
}

function drawBackground(ctx, now, bgTheme, stars) {
  ctx.fillStyle = rgb(bgTheme.bg);
  ctx.fillRect(0, 0, viewW(), viewH());

  ctx.strokeStyle = rgb(bgTheme.grid);
  ctx.lineWidth = 1;
  for (let x = 0; x < viewW(); x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewH());
    ctx.stroke();
  }
  for (let y = 0; y < viewH(); y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewW(), y);
    ctx.stroke();
  }

  for (const star of stars || []) {
    const alpha = 155 + 100 * Math.sin(now * 0.005 * star.speed);
    ctx.fillStyle = rgb([alpha, alpha, Math.min(255, alpha + 30)]);
    ctx.beginPath();
    ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCursor(ctx, pos, skin) {
  const { color, style } = skin;

  ctx.save();
  ctx.shadowColor = rgb(color, 0.8);
  ctx.shadowBlur = 14;
  ctx.strokeStyle = rgb(color);
  ctx.fillStyle = rgb(color);
  ctx.lineWidth = 3;

  if (style === "cross") {
    ctx.beginPath();
    ctx.moveTo(pos.x - 16, pos.y);
    ctx.lineTo(pos.x + 16, pos.y);
    ctx.moveTo(pos.x, pos.y - 16);
    ctx.lineTo(pos.x, pos.y + 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "ring") {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "dot") {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgb(color, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x - 22, pos.y);
    ctx.lineTo(pos.x + 22, pos.y);
    ctx.moveTo(pos.x, pos.y - 22);
    ctx.lineTo(pos.x, pos.y + 22);
    ctx.stroke();
  } else if (style === "pixel") {
    ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
    ctx.strokeStyle = rgb(color);
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x - 12, pos.y - 12, 24, 24);
  } else if (style === "star") {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 14 : 6;
      const px = pos.x + Math.cos(a) * r;
      const py = pos.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawNeonButton(ctx, rect, label, hovered, small = false) {
  ctx.fillStyle = rgb(hovered ? [0, 255, 150] : [0, 180, 120]);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.fill();
  ctx.strokeStyle = rgb(COLORS.text);
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.stroke();
  ctx.font = small ? uiFont(24) : uiFont(36);
  ctx.fillStyle = rgb(COLORS.bg);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function buttonRect(ctx, label, x, y, w = null, h = 52) {
  ctx.font = uiFont(36);
  const height = btnHeight(h);
  const width = w || ctx.measureText(label).width + Math.round(48 * mobileUiScale());
  return { x: x ?? (viewW() - width) / 2, y, w: width, h: height };
}

function drawSlider(ctx, slider, value) {
  const { x, y, w, label } = slider;
  ctx.font = gameFont(22);
  ctx.fillStyle = rgb(COLORS.text);
  ctx.fillText(`${label}: ${Math.round(value * 100)}%`, x, y - 8);
  ctx.fillStyle = rgb(COLORS.gray);
  roundRect(ctx, x, y, w, 12, 6);
  ctx.fill();
  ctx.fillStyle = rgb(COLORS.green);
  roundRect(ctx, x, y, w * value, 12, 6);
  ctx.fill();
  const knobX = x + w * value;
  ctx.beginPath();
  ctx.arc(knobX, y + 6, 10, 0, Math.PI * 2);
  ctx.fillStyle = rgb(COLORS.text);
  ctx.fill();
  return { x: knobX - 10, y: y - 4, w: 20, h: 20 };
}

function sliderValueFromPos(slider, pos) {
  return Math.max(0, Math.min(1, (pos.x - slider.x) / slider.w));
}

function drawXpBar(ctx, save, x, y, w) {
  const prog = xpProgress(save.xp);
  ctx.font = gameFont(20);
  ctx.fillStyle = rgb(COLORS.text);
  ctx.fillText(`LV ${prog.level}  XP ${save.xp}`, x, y);
  ctx.fillStyle = rgb(COLORS.gray);
  roundRect(ctx, x, y + 8, w, 10, 5);
  ctx.fill();
  ctx.fillStyle = rgb(COLORS.purple);
  roundRect(ctx, x, y + 8, w * prog.ratio, 10, 5);
  ctx.fill();
}

function drawCoins(ctx, save, x, y) {
  ctx.font = gameFont(24);
  ctx.fillStyle = rgb(COLORS.gold);
  ctx.fillText(`COINS: ${save.coins}`, x, y);
}

function drawLeaderboardPanel(ctx, save, levelId, x, y, maxEntries = 5) {
  const entries = getLeaderboard(save, levelId);
  ctx.font = gameFont(22);
  ctx.fillStyle = rgb(COLORS.gold);
  ctx.fillText(`STAGE ${levelId} TOP ${LEADERBOARD_SIZE}`, x, y);
  ctx.font = gameFont(16);
  ctx.fillStyle = rgb(COLORS.purple);
  if (!Auth.isLoggedIn()) {
    ctx.fillText("Guest — login to submit scores", x, y + 24);
  } else {
    ctx.fillText(`#1 prize: +${LEADERBOARD_FIRST_PRIZE} coins`, x, y + 24);
  }
  ctx.font = gameFont(18);
  ctx.fillStyle = rgb(COLORS.text);
  if (!entries.length) {
    ctx.fillText("Be first on the board!", x, y + 52);
    return;
  }
  entries.slice(0, maxEntries).forEach((entry, i) => {
    ctx.fillText(`${i + 1}. ${entry.name} — ${entry.score}`, x, y + 52 + i * 22);
  });
}

function homeButtonRect() {
  const size = iconButtonSize();
  return { x: viewW() - size - 16, y: 12, w: size, h: size };
}

function drawHomeButton(ctx, mousePos, hovered) {
  drawIconButton(ctx, homeButtonRect(), UiIcons.home, hovered);
}

function drawModalPanel(ctx, title, lines, btnRect, btnLabel, btnHovered) {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, viewW(), viewH());

  const panelW = 760;
  const panelH = 80 + lines.length * 36 + 90;
  const panelX = (viewW() - panelW) / 2;
  const panelY = (viewH() - panelH) / 2;

  ctx.fillStyle = rgb(COLORS.bg);
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.fill();
  ctx.strokeStyle = rgb(COLORS.blue);
  ctx.lineWidth = 3;
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.stroke();

  ctx.font = gameFont(44);
  ctx.fillStyle = rgb(COLORS.blue);
  ctx.textAlign = "center";
  ctx.fillText(title, viewW() / 2, panelY + 56);

  ctx.font = gameFont(24);
  ctx.fillStyle = rgb(COLORS.text);
  lines.forEach((line, i) => {
    ctx.fillText(line, viewW() / 2, panelY + 100 + i * 36);
  });
  ctx.textAlign = "left";

  drawNeonButton(ctx, btnRect, btnLabel, btnHovered, true);
}

function drawHearts(ctx, hearts, maxHearts) {
  const size = Math.round((Input.touchMode ? 30 : 26) * accessibilityScale());
  const gap = 10;
  const totalW = maxHearts * size + (maxHearts - 1) * gap;
  const baseX = (viewW() - totalW) / 2;
  const y = viewH() - (Input.touchMode ? 52 : 40);

  for (let i = 0; i < maxHearts; i++) {
    const filled = i < hearts;
    const x = baseX + i * (size + gap);
    ctx.save();
    ctx.translate(x + size / 2, y);
    ctx.scale(size / 24, size / 24);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(0, -2, -12, -2, -12, 6);
    ctx.bezierCurveTo(-12, 14, 0, 20, 0, 24);
    ctx.bezierCurveTo(0, 20, 12, 14, 12, 6);
    ctx.bezierCurveTo(12, -2, 0, -2, 0, 6);
    ctx.closePath();
    ctx.fillStyle = filled ? rgb(COLORS.red) : "rgba(60,40,50,0.9)";
    ctx.fill();
    ctx.strokeStyle = filled ? rgb([255, 120, 140]) : rgb(COLORS.gray);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}
