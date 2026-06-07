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
      this.velX = this.x < 0 ? 5 + level.id * 0.4 : -(5 + level.id * 0.4);
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

    if ((this.type === "ORANGE" && this.defused) || (this.type === "PURPLE" && this.purpleTapped)) {
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

    if (this.type === "PURPLE" && !this.purpleTapped) {
      ctx.font = gameFont(18);
      ctx.fillStyle = rgb(COLORS.gold);
      ctx.textAlign = "center";
      const hint = Input.touchMode ? "BOTH!" : "MID";
      ctx.fillText(hint, this.x, this.y + radius + 28);
      ctx.textAlign = "left";
    }
  }

  _touchBombColors() {
    if (this.type === "BOMB") {
      if (this.mobileTapCount === 0) return { main: COLORS.red, glow: COLORS.redGlow };
      return { main: COLORS.blue, glow: COLORS.blueGlow };
    }
    if (this.type === "ORANGE") {
      if (this.mobileTapCount === 0) return { main: COLORS.orange, glow: COLORS.orangeGlow };
      if (this.mobileTapCount === 1) return { main: COLORS.red, glow: COLORS.redGlow };
      return { main: COLORS.blue, glow: COLORS.blueGlow };
    }
    return null;
  }

  _colors() {
    if (this.type === "PURPLE") return { main: COLORS.purple, glow: COLORS.purpleGlow };
    if (this.type === "BALL") return { main: COLORS.blue, glow: COLORS.blueGlow };
    if (Input.touchMode) {
      const touchColors = this._touchBombColors();
      if (touchColors) return touchColors;
    }
    if (this.type === "ORANGE" && !Input.touchMode) {
      if (!this.defused) return { main: COLORS.orange, glow: COLORS.orangeGlow };
      return { main: COLORS.blue, glow: COLORS.blueGlow };
    }
    return { main: COLORS.red, glow: COLORS.redGlow };
  }
}

function createStartTarget() {
  const baseRadius = Input.touchMode ? 44 : 34;
  return {
    x: viewW() / 2,
    y: viewH() / 2,
    radius: Math.round(baseRadius * accessibilityScale()),
    pulseAngle: 0,
    update() {
      this.pulseAngle += 0.1;
    },
    checkClick(pos) {
      const dist = Math.hypot(this.x - pos.x, this.y - pos.y);
      if (dist <= this.radius + hitPadSize()) return "HIT";
      return "MISS";
    },
    draw(ctx) {
      const radius = this.radius + Math.sin(this.pulseAngle) * 5;
      ctx.strokeStyle = rgb(COLORS.blueGlow);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = rgb(COLORS.blue);
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgb(COLORS.text);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = gameFont(24);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText("CLICK TO START", this.x, this.y - radius - 22);
      ctx.textAlign = "left";
    },
  };
}

function createGame(level, now) {
  return {
    level,
    infinite: !!level.infinite,
    started: false,
    startTarget: createStartTarget(),
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
  };
}
