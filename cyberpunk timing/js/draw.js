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
    x: ((clientX - rect.left) / rect.width) * BASE_WIDTH,
    y: ((clientY - rect.top) / rect.height) * BASE_HEIGHT,
  };
}

function createStars(count = 40) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * BASE_WIDTH,
    y: Math.random() * BASE_HEIGHT,
    speed: 0.5 + Math.random() * 1.5,
  }));
}

function drawBackground(ctx, now, bgTheme, stars) {
  ctx.fillStyle = rgb(bgTheme.bg);
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  ctx.strokeStyle = rgb(bgTheme.grid);
  ctx.lineWidth = 1;
  for (let x = 0; x < BASE_WIDTH; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, BASE_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < BASE_HEIGHT; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(BASE_WIDTH, y);
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
  ctx.font = small ? "bold 24px 'Courier New', monospace" : "bold 36px 'Courier New', monospace";
  ctx.fillStyle = rgb(COLORS.bg);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function buttonRect(ctx, label, x, y, w = null, h = 52) {
  ctx.font = "bold 36px 'Courier New', monospace";
  const width = w || ctx.measureText(label).width + 48;
  return { x: x ?? (BASE_WIDTH - width) / 2, y, w: width, h };
}

function drawSlider(ctx, slider, value) {
  const { x, y, w, label } = slider;
  ctx.font = "bold 22px 'Courier New', monospace";
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
  ctx.font = "bold 20px 'Courier New', monospace";
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
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillStyle = rgb(COLORS.gold);
  ctx.fillText(`COINS: ${save.coins}`, x, y);
}

function drawLeaderboardPanel(ctx, save, levelId, x, y) {
  const entries = getLeaderboard(save, levelId);
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillStyle = rgb(COLORS.gold);
  ctx.fillText(`STAGE ${levelId} LEADERBOARD`, x, y);
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillStyle = rgb(COLORS.text);
  if (!entries.length) {
    ctx.fillText("Be first on the board!", x, y + 30);
    return;
  }
  entries.slice(0, 5).forEach((entry, i) => {
    ctx.fillText(`${i + 1}. ${entry.name} — ${entry.score}`, x, y + 30 + i * 26);
  });
}

function homeButtonRect() {
  return { x: BASE_WIDTH - 130, y: 16, w: 110, h: 40 };
}

function drawHomeButton(ctx, mousePos, hovered) {
  drawNeonButton(ctx, homeButtonRect(), "HOME", hovered, true);
}

function drawModalPanel(ctx, title, lines, btnRect, btnLabel, btnHovered) {
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  const panelW = 760;
  const panelH = 80 + lines.length * 36 + 90;
  const panelX = (BASE_WIDTH - panelW) / 2;
  const panelY = (BASE_HEIGHT - panelH) / 2;

  ctx.fillStyle = rgb(COLORS.bg);
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.fill();
  ctx.strokeStyle = rgb(COLORS.blue);
  ctx.lineWidth = 3;
  roundRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.stroke();

  ctx.font = "bold 44px 'Courier New', monospace";
  ctx.fillStyle = rgb(COLORS.blue);
  ctx.textAlign = "center";
  ctx.fillText(title, BASE_WIDTH / 2, panelY + 56);

  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.fillStyle = rgb(COLORS.text);
  lines.forEach((line, i) => {
    ctx.fillText(line, BASE_WIDTH / 2, panelY + 100 + i * 36);
  });
  ctx.textAlign = "left";

  drawNeonButton(ctx, btnRect, btnLabel, btnHovered, true);
}
