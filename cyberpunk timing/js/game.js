const GameLogic = {
  onBeatSpawn(game, now) {
    if (!game?.running || game.paused) return;
    game.beatCount += 1;
    if (!game.currentTarget.isActive) {
      game.currentTarget.activate(now);
      return;
    }
    if (game.beatCount % 4 === 0) {
      game.nextTarget = new Target(game.level, shouldSpawnSlider(game.level));
    }
  },

  handleClick(game, button, pos, now) {
    const action = Input.resolveButton(button);
    if (!action) return;

    const result = game.currentTarget.checkClick(pos);
    if (result === "MISS") {
      this._registerMiss(game, pos);
      return;
    }
    if (result !== "HIT") return;

    if (game.currentTarget.type === "ORANGE") {
      this._handleOrange(game, action, now);
      return;
    }

    this._resolveHit(game, action, now);
  },

  _handleOrange(game, action, now) {
    const target = game.currentTarget;

    if (!target.defused) {
      if (action !== "bomb") {
        this._wrongHit(game, target);
        return;
      }
      target.defused = true;
      target.confirmExpiresAt = now + 2200;
      game.floatingTexts.push(new FloatingText("CLICK!", target.x, target.y - 20, COLORS.green, 0));
      AudioEngine.playDefuse();
      return;
    }

    if (action !== "ball") {
      this._wrongHit(game, target);
      return;
    }

    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo + 2;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.orange, now);
  },

  _resolveHit(game, action, now) {
    const target = game.currentTarget;
    const needsBall = target.type === "BALL";
    const isCorrect = (needsBall && action === "ball") || (!needsBall && action === "bomb");

    if (!isCorrect) {
      this._wrongHit(game, target);
      return;
    }

    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    const color = target.type === "BALL" ? COLORS.blue : COLORS.red;
    this._advanceTarget(game, target, color, now);
  },

  _wrongHit(game, target) {
    game.combo = 0;
    game.floatingTexts.push(new FloatingText("-1", target.x, target.y, COLORS.red, -1));
    AudioEngine.playMiss();
  },

  _advanceTarget(game, target, color, now) {
    game.flippedTargets.push(new FlippedTarget(target.x, target.y, target.radius, color));
    game.currentTarget = game.nextTarget;
    game.currentTarget.activate(now);
    game.nextTarget = new Target(game.level, shouldSpawnSlider(game.level));
  },

  _registerMiss(game, pos) {
    game.combo = 0;
    game.floatingTexts.push(new FloatingText("-1", pos.x, pos.y, COLORS.red, -1));
    AudioEngine.playMiss();
  },

  update(game, now) {
    if (!game?.running || game.paused) return null;

    const secondsPassed = (now - game.startTime) / 1000;
    if (game.infinite) {
      game.timeLeft = null;
    } else {
      game.timeLeft = Math.max(0, Math.floor(game.timeLimit - secondsPassed));
      if (game.timeLeft <= MUSIC_FADE_SECONDS) {
        AudioEngine.setMusicFade(game.timeLeft, MUSIC_FADE_SECONDS);
      }
      if (game.timeLeft <= 0) return "time";
    }
    if (game.currentTarget.isOffScreen) return "expired";
    if (!game.graceUntil || now > game.graceUntil) {
      if (game.currentTarget.isExpired(now)) return "expired";
    }

    game.currentTarget.update();

    for (const ft of [...game.floatingTexts]) {
      ft.update();
      if (ft.isDone && ft.value !== 0) {
        game.score += ft.value;
      }
      if (ft.isDone) {
        game.floatingTexts.splice(game.floatingTexts.indexOf(ft), 1);
      }
    }

    for (const pt of [...game.flippedTargets]) {
      pt.update();
      if (pt.isOffScreen) game.flippedTargets.splice(game.flippedTargets.indexOf(pt), 1);
    }
    return null;
  },

  finish(game, save) {
    game.running = false;
    AudioEngine.stopMusic();
    CrazySDK.gameplayStop();
    game.lastRewards = finishGameRewards(save, game);
    if (game.level.infinite) {
      updateInfiniteHighScore(save, musicLevelId(game.level), game.score);
    } else {
      updateHighScore(save, game.level.id, game.score);
    }
    return game.lastRewards;
  },

  drawHud(ctx, game, level, save) {
    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.fillStyle = rgb(COLORS.text);
    ctx.fillText(`SCORE: ${game.score}`, 20, 55);

    ctx.fillStyle = rgb(game.combo >= 3 ? COLORS.green : COLORS.text);
    const comboText = `COMBO: x${game.combo}`;
    ctx.fillText(comboText, (BASE_WIDTH - ctx.measureText(comboText).width) / 2, 55);

    if (game.infinite) {
      const best = save.infiniteHighScores?.[String(musicLevelId(level))] || 0;
      ctx.fillStyle = rgb(COLORS.gold);
      const bestText = `BEST: ${best}`;
      ctx.fillText(bestText, BASE_WIDTH - ctx.measureText(bestText).width - 20, 55);
    } else {
      ctx.fillStyle = rgb(game.timeLeft <= 10 ? COLORS.red : COLORS.text);
      const timeText = `TIME: ${game.timeLeft}s`;
      ctx.fillText(timeText, BASE_WIDTH - ctx.measureText(timeText).width - 20, 55);

      ctx.font = "bold 20px 'Courier New', monospace";
      const goalMet = game.score >= level.passScore;
      ctx.fillStyle = rgb(goalMet ? COLORS.green : COLORS.gold);
      const goalText = `GOAL: ${game.score}/${level.passScore}`;
      ctx.fillText(goalText, BASE_WIDTH - ctx.measureText(goalText).width - 20, 82);
    }

    ctx.font = game.infinite ? "bold 36px 'Courier New', monospace" : "bold 20px 'Courier New', monospace";
    ctx.fillStyle = rgb(COLORS.text);
    ctx.fillText(`${level.name}  BPM ${level.bpm}`, 20, 82);
  },

  drawMobileControls(ctx, level) {
    if (!Input.touchMode) return;
    const tap = { x: 40, y: BASE_HEIGHT - 110, w: 220, h: 70 };
    const defuse = { x: BASE_WIDTH - 260, y: BASE_HEIGHT - 110, w: 220, h: 70 };
    const needsDefuse = level.allowRed || level.allowOrange || level.sliderRed;

    drawNeonButton(ctx, tap, "TAP", false, true);
    if (needsDefuse) {
      Input.setMobileZones(tap, defuse);
      drawNeonButton(ctx, defuse, "DEFUSE", false, true);
      return;
    }
    Input.setMobileZones(tap, null);
  },
};
