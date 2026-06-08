const LEGACY_VIDEO_BG_IDS = {
  "grid-black": "cyber",
  "grid-blue": "matrix",
  "grid-neon": "sunset",
  "neon-flow": "space",
  "minimal": "cyber",
  "wave": "retro",
  "topo": "space",
  "abstract": "retro",
  "glitch": "matrix",
  custom: "cyber",
};

function migrateBackgroundId(id) {
  return LEGACY_VIDEO_BG_IDS[id] || id;
}

function defaultBgTuning() {
  return { bg: 1, grid: 1, accent: 1 };
}

function resolveBackground(save) {
  const level = App?.game?.level;
  if (level?.playBg) {
    return {
      id: level.rewardBgId || "play",
      name: level.rewardName || "",
      bg: level.playBg.bg,
      grid: level.playBg.grid,
      accent: level.playBg.accent,
    };
  }
  const theme = getBackgroundById(save.equippedBackground);
  const t = { ...defaultBgTuning(), ...save.bgTuning };
  const scale = (rgb, factor) => rgb.map((c) => Math.round(c * (0.12 + 0.88 * factor)));
  return {
    ...theme,
    bg: scale(theme.bg, t.bg),
    grid: scale(theme.grid, t.grid),
    accent: scale(theme.accent, t.accent),
  };
}

const BgMediaCache = new Map();

function preloadBgMedia(url) {
  if (!url || BgMediaCache.has(url)) return;
  const img = new Image();
  img.onload = () => BgMediaCache.set(url, img);
  img.src = url;
}

function drawBackgroundSwatch(ctx, x, y, w, h, item, save) {
  const preview = item.id === save.equippedBackground
    ? resolveBackground(save)
    : { bg: item.bg, grid: item.grid, accent: item.accent };
  ctx.fillStyle = rgb(preview.bg);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = rgb(preview.grid);
  ctx.lineWidth = 1;
  for (let gx = x; gx < x + w; gx += 14) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  ctx.fillStyle = rgb(preview.accent);
  ctx.fillRect(x + w - 18, y + 6, 12, 12);
}
