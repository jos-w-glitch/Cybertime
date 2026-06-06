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
    ctx.font = "bold 26px 'Courier New', monospace";
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
    if (this.y > BASE_HEIGHT + 50) this.isOffScreen = true;
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

    this.radius = 22 + Math.floor(Math.random() * 10);
    this.isActive = false;
    this.isSlider = isSlider;
    this.defused = false;
    this.confirmExpiresAt = 0;
    this.hitZoneX = BASE_WIDTH / 2;
    this.pulseAngle = Math.random() * 360;
    this.activatedAt = 0;
    this.expiresAt = 0;
    this.hitWindowMs = level.hitWindowMs;
    this.bombFuse = level.bombFuse;

    if (isSlider) {
      this.y = 180 + Math.random() * (BASE_HEIGHT - 340);
      this.x = Math.random() < 0.5 ? -40 : BASE_WIDTH + 40;
      this.velX = this.x < 0 ? 5 + level.id * 0.4 : -(5 + level.id * 0.4);
    } else {
      this.x = 100 + Math.random() * (BASE_WIDTH - 200);
      this.y = 140 + Math.random() * (BASE_HEIGHT - 280);
    }
  }

  _pickType(level, isSlider) {
    if (isSlider) {
      if (level.sliderRed && Math.random() < 0.4) return "BOMB";
      return "BALL";
    }
    if (!level.allowRed && !level.allowOrange) return "BALL";
    const roll = Math.random();
    if (level.allowOrange && roll < ORANGE_BOMB_CHANCE) return "ORANGE";
    if (level.allowRed && roll < ORANGE_BOMB_CHANCE + RED_BOMB_CHANCE) return "BOMB";
    return "BALL";
  }

  activate(now) {
    this.isActive = true;
    this.defused = false;
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
    if (this.x < -80 || this.x > BASE_WIDTH + 80) this.isOffScreen = true;
  }

  checkClick(pos) {
    const dist = Math.hypot(this.x - pos.x, this.y - pos.y);
    if (dist <= this.radius + 4) return "HIT";
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
      ctx.font = "bold 22px 'Courier New', monospace";
      ctx.fillStyle = rgb(fuseLeft <= 1.5 ? COLORS.red : COLORS.text);
      ctx.textAlign = "center";
      ctx.fillText(String(Math.ceil(fuseLeft)), this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }

    if (this.type === "ORANGE" && this.defused) {
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.fillStyle = rgb(COLORS.green);
      ctx.textAlign = "center";
      ctx.fillText("TAP!", this.x, this.y - radius - 14);
      ctx.textAlign = "left";
    }
  }

  _colors() {
    if (this.type === "BALL") return { main: COLORS.blue, glow: COLORS.blueGlow };
    if (this.type === "ORANGE") return { main: COLORS.orange, glow: COLORS.orangeGlow };
    return { main: COLORS.red, glow: COLORS.redGlow };
  }
}

function createGame(level, now) {
  return {
    level,
    infinite: !!level.infinite,
    currentTarget: new Target(level, false),
    nextTarget: new Target(level, shouldSpawnSlider(level)),
    floatingTexts: [],
    flippedTargets: [],
    score: 0,
    combo: 0,
    comboPeak: 0,
    timeLimit: level.duration,
    startTime: now,
    running: true,
    paused: false,
    beatCount: 0,
    lastRewards: null,
    graceUntil: now + 1500,
  };
}
