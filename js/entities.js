class FloatingText {
  constructor(text, x, y, color, value) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.value = value;
    this.speed = 5;
    this.isDone = false;
    this.targetX = 40;
    this.targetY = 30;
  }

  update() {
    const dirX = this.targetX - this.x;
    const dirY = this.targetY - this.y;
    const dist = Math.hypot(dirX, dirY);
    if (dist <= 15) {
      this.isDone = true;
      return;
    }
    this.x += (dirX / dist) * this.speed;
    this.y += (dirY / dist) * this.speed;
    this.speed += 0.25;
  }

  draw(ctx) {
    ctx.font = gameFont(26);
    ctx.fillStyle = rgb(this.color);
    ctx.fillText(this.text, this.x, this.y);
  }
}

class FlippedTarget {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    const direction = Math.random() < 0.5 ? -1 : 1;
    this.velX = direction * (4 + Math.random() * 4);
    this.velY = -(14 + Math.random() * 6);
    this.gravity = 0.7;
    this.isOffScreen = false;
  }

  update() {
    this.x += this.velX;
    this.velY += this.gravity;
    this.y += this.velY;
    if (this.y > viewH() + 50) this.isOffScreen = true;
  }

  draw(ctx) {
    ctx.strokeStyle = rgb(this.color);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

class GoldenBonus {
  constructor(game) {
    this.radius = Math.round((20 + Math.floor(Math.random() * 8)) * targetRadiusScale());
    this.pulseAngle = Math.random() * 360;
    this.expiresAt = 0;
    this._place(game);
  }

  _place(game) {
    const avoid = [game.currentTarget, game.nextTarget, game.purplePartner].filter(Boolean);
    for (let attempt = 0; attempt < 28; attempt++) {
      this.x = 80 + Math.random() * (viewW() - 160);
      this.y = 120 + Math.random() * (viewH() - 240);
      const clear = avoid.every((t) => Math.hypot(t.x - this.x, t.y - this.y) > (t.radius || 30) + this.radius + 56);
      if (clear) return;
    }
  }

  activate(now) {
    this.expiresAt = now + GOLDEN_BONUS_WINDOW_MS;
  }

  isExpired(now) {
    return now >= this.expiresAt;
  }

  checkClick(pos) {
    return Math.hypot(this.x - pos.x, this.y - pos.y) <= this.radius + hitPadSize();
  }

  draw(ctx, now) {
    this.pulseAngle += 0.14;
    const pulse = Math.sin(this.pulseAngle) * 4;
    const radius = this.radius + pulse;
    const life = Math.max(0, (this.expiresAt - now) / GOLDEN_BONUS_WINDOW_MS);

    ctx.strokeStyle = rgb(COLORS.gold, 0.35);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = rgb(COLORS.gold);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = rgb(COLORS.gold);
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgb(life < 0.3 ? COLORS.red : COLORS.text);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * life);
    ctx.stroke();

    ctx.font = gameFont(18);
    ctx.fillStyle = rgb([30, 24, 0]);
    ctx.textAlign = "center";
    ctx.fillText("BONUS", this.x, this.y + 6);
    ctx.textAlign = "left";
  }
}

class Target {
  constructor(level, isSlider = false) {
    this.type = this._pickType(level, isSlider);

    this.radius = (22 + Math.floor(Math.random() * 10)) * targetRadiusScale();
    this.isActive = false;
    this.isSlider = isSlider;
    this.defused = false;
    this.mobileTapCount = 0;
    this.purpleTapped = false;
    this.confirmExpiresAt = 0;
    this.hitZoneX = viewW() / 2;
    this.pulseAngle = Math.random() * 360;
    this.activatedAt = 0;
    this.expiresAt = 0;
    this.hitWindowMs = level.hitWindowMs;
    this.bombFuse = level.bombFuse;

    if (isSlider) {
      this.y = 180 + Math.random() * (viewH() - 340);
      this.x = Math.random() < 0.5 ? -40 : viewW() + 40;
      this.velX = this.x < 0 ? 5 + levelNumericId(level) * 0.4 : -(5 + levelNumericId(level) * 0.4);
    } else {
      this.x = 100 + Math.random() * (viewW() - 200);
      this.y = 140 + Math.random() * (viewH() - 280);
    }
  }

  _pickType(level, isSlider) {
    const rates = levelTargetRates(level);
    if (isSlider) {
      if (level.sliderRed && Math.random() < rates.sliderRed) return "BOMB";
      return "BALL";
    }
    if (!level.allowRed && !level.allowOrange && !level.allowPurple) return "BALL";
    const roll = Math.random();
    if (level.allowPurple && roll < rates.purple) return "PURPLE";
    if (level.allowOrange && roll < rates.purple + rates.orange) return "ORANGE";
    if (level.allowRed && roll < rates.purple + rates.orange + rates.red) return "BOMB";
    return "BALL";
  }

  activate(now) {
    this.isActive = true;
    this.defused = false;
    this.mobileTapCount = 0;
    this.purpleTapped = false;
    this.activatedAt = now;
    this.expiresAt = now + this.hitWindowMs;
    if (this.type === "BOMB" || this.type === "ORANGE") {
      this.bombExpires = now + this.bombFuse * 1000;
    }
  }

  msLeft(now) {
    if (!this.isActive) return this.hitWindowMs;
    return Math.max(0, this.expiresAt - now);
  }

  bombSecondsLeft(now) {
    if (!this.isBomb() || !this.isActive || this.defused) return this.bombFuse;
    return Math.max(0, (this.bombExpires - now) / 1000);
  }

  isBomb() {
    return this.type === "BOMB" || this.type === "ORANGE";
  }

  isExpired(now) {
    if (!this.isActive) return false;
    if (this.type === "ORANGE" && this.defused) {
      return now >= this.confirmExpiresAt;
    }
    if (this.isBomb() && !this.defused && this.bombSecondsLeft(now) <= 0) return true;
    return this.msLeft(now) <= 0;
  }

  update() {
    if (!this.isSlider || !this.isActive) return;
    this.x += this.velX;
    if (this.x < -80 || this.x > viewW() + 80) this.isOffScreen = true;
  }

  checkClick(pos) {
    const dist = Math.hypot(this.x - pos.x, this.y - pos.y);
    if (dist <= this.radius + hitPadSize()) return "HIT";
    if (dist <= this.radius + SAFE_ZONE_BORDER) return "SAFE_ZONE";
    return "MISS";
  }

  draw(ctx, now) {
    if (this.isSlider && this.isActive) {
      ctx.strokeStyle = rgb(COLORS.gold, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.hitZoneX, this.y - 40);
      ctx.lineTo(this.hitZoneX, this.y + 40);
      ctx.stroke();
    }

    let radius = this.radius;
    if (!this.isActive) {
      ctx.fillStyle = "rgb(35,35,45)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgb(COLORS.gray);
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const colors = this._colors();
    const mainColor = colors.main;
    const glowColor = colors.glow;
    const urgency = 1 - this.msLeft(now) / this.hitWindowMs;

    if (this.isBomb() && !this.defused) {
      this.pulseAngle += 0.12;
      radius += Math.floor((3 + 5 * urgency) * Math.sin(this.pulseAngle));
    }

    if (this.type === "ORANGE" && this.defused) {
      ctx.strokeStyle = rgb(COLORS.green);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.type === "PURPLE" && this.purpleTapped) {
      ctx.strokeStyle = rgb(COLORS.green);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgb(40,35,65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + SAFE_ZONE_BORDER, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = rgb(glowColor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = rgb(mainColor);
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();

    const ringPct = this.type === "ORANGE" && this.defused
      ? Math.max(0, (this.confirmExpiresAt - now) / 2200)
      : this.msLeft(now) / this.hitWindowMs;
    ctx.strokeStyle = rgb(ringPct < 0.3 ? COLORS.red : COLORS.text);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringPct);
    ctx.stroke();

    if (this.isBomb() && !this.defused) {
      const fuseLeft = this.bombSecondsLeft(now);
      ctx.font = gameFont(22);
      ctx.fillStyle = rgb(fuseLeft <= 1.5 ? COLORS.red : COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(String(Math.ceil(fuseLeft)), this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (this.type === "ORANGE" && this.defused) {
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.green);
      ctx.textAlign = "center";
      ctx.fillText(Input.touchMode ? `${this.mobileTapCount}/3` : "TAP!", this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (Input.touchMode && this.isBomb() && !this.defused && this.mobileTapCount > 0) {
      const needed = this.type === "ORANGE" ? 3 : 2;
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(`${this.mobileTapCount}/${needed}`, this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (this.type === "PURPLE" && !this.purpleTapped) {
      ctx.font = gameFont(18);
      ctx.fillStyle = rgb(COLORS.gold);
      ctx.textAlign = "center";
      const hint = Input.touchMode ? "BOTH!" : "MID";
      ctx.fillText(hint, this.x, this.y + radius + 28);
      ctx.textAlign = "left";
    }
  }

  _colors() {
    if (this.type === "PURPLE") return { main: COLORS.purple, glow: COLORS.purpleGlow };
    if (this.type === "BALL") return { main: COLORS.blue, glow: COLORS.blueGlow };
    if (this.type === "ORANGE") return { main: COLORS.orange, glow: COLORS.orangeGlow };
    return { main: COLORS.red, glow: COLORS.redGlow };
  }
}

function startTargetColors(type) {
  if (type === "PURPLE") return { main: COLORS.purple, glow: COLORS.purpleGlow };
  if (type === "BALL") return { main: COLORS.blue, glow: COLORS.blueGlow };
  if (type === "ORANGE") return { main: COLORS.orange, glow: COLORS.orangeGlow };
  return { main: COLORS.red, glow: COLORS.redGlow };
}

function drawStartOrb(ctx, x, y, radius, type, pulseAngle, opts = {}) {
  const colors = startTargetColors(type);
  let r = radius + Math.sin(pulseAngle) * 4;
  if (opts.bombPulse) r += Math.floor(3 * Math.sin(pulseAngle * 1.2));

  if (opts.defused) {
    ctx.strokeStyle = rgb(COLORS.green);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = rgb(colors.glow);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = rgb(colors.main);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgb(COLORS.text);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r + 10, 0, Math.PI * 2);
  ctx.stroke();
}

function createStartTarget(level) {
  const mechanic = levelStartMechanic(level);
  const baseRadius = Math.round((Input.touchMode ? 44 : 34) * accessibilityScale());
  const cx = viewW() / 2;
  const cy = viewH() / 2;
  const isSlider = mechanic === "SLIDER" || mechanic === "SLIDER_BOMB";
  const ballType = mechanic === "ORANGE" ? "ORANGE" : mechanic === "PURPLE" ? "PURPLE" : mechanic === "SLIDER_BOMB" ? "BOMB" : mechanic === "BOMB" ? "BOMB" : "BALL";

  const target = {
    mechanic,
    ballType,
    defused: false,
    mobileTapCount: 0,
    purpleTapMain: 0,
    purpleTapPartner: 0,
    pulseAngle: 0,
    radius: baseRadius,
    x: cx,
    y: cy,
    hitZoneX: cx,
    velX: 5 + levelNumericId(level) * 0.05,
    isSlider,
    partner: null,
  };

  if (mechanic === "PURPLE" && Input.touchMode) {
    target.x = cx - 110;
    target.partner = { x: cx + 110, y: cy, radius: baseRadius, tapped: false };
  }
  if (isSlider) {
    target.x = -40;
    target.y = cy;
  }

  target.update = function () {
    this.pulseAngle += 0.1;
    if (!this.isSlider) return;
    this.x += this.velX;
    if (this.x > viewW() + 40) this.x = -40;
  };

  target.checkClick = function (pos) {
    const dist = Math.hypot(this.x - pos.x, this.y - pos.y);
    if (dist <= this.radius + hitPadSize()) return "HIT";
    return "MISS";
  };

  target.checkPartnerClick = function (pos) {
    if (!this.partner) return "MISS";
    const dist = Math.hypot(this.partner.x - pos.x, this.partner.y - pos.y);
    if (dist <= this.partner.radius + hitPadSize()) return "HIT";
    return "MISS";
  };

  target.startHint = function () {
    if (this.mechanic === "BOMB") return Input.touchMode ? "TAP TWICE TO START" : "RIGHT CLICK TO START";
    if (this.mechanic === "ORANGE") {
      if (Input.touchMode) return this.mobileTapCount >= 2 ? "TAP AGAIN TO START" : "TAP THREE TIMES TO START";
      return this.defused ? "LEFT CLICK TO START" : "RIGHT CLICK TO START";
    }
    if (this.mechanic === "PURPLE") return Input.touchMode ? "TAP BOTH TO START" : "MIDDLE CLICK TO START";
    if (this.mechanic === "SLIDER") return Input.touchMode ? "TAP AT GOLD LINE" : "CLICK AT GOLD LINE";
    if (this.mechanic === "SLIDER_BOMB") return Input.touchMode ? "DOUBLE TAP AT LINE" : "RIGHT CLICK AT LINE";
    return Input.touchMode ? "TAP TO START" : "CLICK TO START";
  };

  target.draw = function (ctx) {
    if (this.isSlider) {
      ctx.strokeStyle = rgb(COLORS.gold, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.hitZoneX, this.y - 40);
      ctx.lineTo(this.hitZoneX, this.y + 40);
      ctx.stroke();
    }

    drawStartOrb(ctx, this.x, this.y, this.radius, this.ballType, this.pulseAngle, {
      bombPulse: this.ballType === "BOMB" && !this.defused,
      defused: this.defused,
    });

    if (this.partner) {
      drawStartOrb(ctx, this.partner.x, this.partner.y, this.partner.radius, "PURPLE", this.pulseAngle + 0.4);
    }

    if (Input.touchMode && this.ballType === "BOMB" && !this.defused && this.mobileTapCount > 0) {
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(`${this.mobileTapCount}/2`, this.x, this.y - this.radius - 14);
      ctx.textAlign = "left";
    }
    if (Input.touchMode && this.mechanic === "ORANGE" && this.mobileTapCount > 0) {
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(`${this.mobileTapCount}/3`, this.x, this.y - this.radius - 14);
      ctx.textAlign = "left";
    }

    const hintY = this.partner ? this.y - this.radius - 36 : this.y - this.radius - 22;
    ctx.font = gameFont(Input.touchMode ? 18 : 22);
    ctx.fillStyle = rgb(COLORS.text);
    ctx.textAlign = "center";
    ctx.fillText(this.startHint(), cx, hintY);
    ctx.textAlign = "left";
  };

  return target;
}

function createGame(level, now) {
  const game = {
    level,
    infinite: !!level.infinite,
    started: false,
    startTarget: createStartTarget(level),
    currentTarget: new Target(level, false),
    nextTarget: new Target(level, shouldSpawnSlider(level)),
    floatingTexts: [],
    flippedTargets: [],
    score: 0,
    combo: 0,
    comboPeak: 0,
    timeLimit: level.infinite ? 0 : STAGE_TIME_SECONDS,
    timeLeft: level.infinite ? null : STAGE_TIME_SECONDS,
    stageEndAt: 0,
    startTime: 0,
    running: true,
    paused: false,
    beatCount: 0,
    lastRewards: null,
    graceUntil: 0,
    purplePartner: null,
    purpleTapMain: 0,
    purpleTapPartner: 0,
    goldenBonus: null,
    lastGoldenCombo: 0,
    hearts: START_HEARTS,
  };
  return game;
}
