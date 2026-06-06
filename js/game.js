const GameLogic = {
  beginGame(game, now) {
    if (!game || game.started) return;
    game.started = true;
    game.startTime = now;
    game.graceUntil = now + 1500;
    game.currentTarget.activate(now);
    if (!game.infinite) game.timeLeft = game.timeLimit;
    AudioEngine.resetMusicVolume();
    AudioEngine.startLevelMusic(game.level, () => this.onBeatSpawn(game, performance.now()));
  },

  onBeatSpawn(game, now) {
    if (!game?.running || game.paused || !game.started) return;
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
    if (!game.started) {
      if (Input.resolveButton(button) !== "ball") return null;
      if (game.startTarget.checkClick(pos) === "HIT") return "begin";
      return null;
    }

    const action = Input.resolveButton(button);
    if (!action) return;

    const result = game.currentTarget.checkClick(pos);
    if (result === "MISS") {
      this._registerMiss(game, pos);
      return;
    }
    if (result !== "HIT") return;

    if (Input.touchMode && game.currentTarget.type === "ORANGE") {
      this._handleMobileOrange(game, action, now);
      return;
    }
    if (Input.touchMode && game.currentTarget.type === "BOMB") {
      this._handleMobileBomb(game, action, now);
      return;
    }

    if (game.currentTarget.type === "ORANGE") {
      this._handleOrange(game, action, now);
      return;
    }

    this._resolveHit(game, action, now);
  },

  _handleMobileBomb(game, action, now) {
    const target = game.currentTarget;
    if (action !== "ball") {
      target.mobileTapCount = 0;
      this._wrongHit(game, target);
      return;
    }

    target.mobileTapCount += 1;
    if (target.mobileTapCount < 2) {
      game.floatingTexts.push(new FloatingText(`${target.mobileTapCount}/2`, target.x, target.y - 20, COLORS.text, 0));
      AudioEngine.playDefuse();
      return;
    }

    target.mobileTapCount = 0;
    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.red, now);
  },

  _handleMobileOrange(game, action, now) {
    const target = game.currentTarget;
    if (action !== "ball") {
      target.mobileTapCount = 0;
      target.defused = false;
      this._wrongHit(game, target);
      return;
    }

    target.mobileTapCount += 1;
    if (target.mobileTapCount === 1) {
      game.floatingTexts.push(new FloatingText("1/3", target.x, target.y - 20, COLORS.text, 0));
      AudioEngine.playDefuse();
      return;
    }
    if (target.mobileTapCount === 2) {
      target.defused = true;
      target.confirmExpiresAt = now + 2200;
      game.floatingTexts.push(new FloatingText("2/3", target.x, target.y - 20, COLORS.text, 0));
      AudioEngine.playDefuse();
      return;
    }

    target.mobileTapCount = 0;
    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    const points = game.combo + 2;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.orange, now);
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
    if (target.mobileTapCount !== undefined) target.mobileTapCount = 0;
    if (target.defused) target.defused = false;
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
    if (!game.started) {
      game.startTarget.update();
      return null;
    }

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
    game.lastRewards = finishGameRewards(save, game);
    if (game.level.infinite) {
      updateInfiniteHighScore(save, musicLevelId(game.level), game.score);
    } else {
      updateHighScore(save, game.level.id, game.score);
    }
    return game.lastRewards;
  },

  drawHud(ctx, game, level, save) {
    ctx.font = gameFont(36);
    ctx.fillStyle = rgb(COLORS.text);
    ctx.fillText(`SCORE: ${game.score}`, 20, 55);

    if (!game.started) {
      ctx.fillStyle = rgb(COLORS.gold);
      const ready = game.infinite ? "INFINITE — READY" : `TIME: ${game.timeLimit}s`;
      ctx.fillText(ready, viewW() - ctx.measureText(ready).width - 20, 55);
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.fillText(`${level.name}  BPM ${level.bpm}`, 20, 82);
      return;
    }

    ctx.fillStyle = rgb(game.combo >= 3 ? COLORS.green : COLORS.text);
    const comboText = `COMBO: x${game.combo}`;
    ctx.fillText(comboText, (viewW() - ctx.measureText(comboText).width) / 2, 55);

    if (game.infinite) {
      const best = save.infiniteHighScores?.[String(musicLevelId(level))] || 0;
      ctx.fillStyle = rgb(COLORS.gold);
      const bestText = `BEST: ${best}`;
      ctx.fillText(bestText, viewW() - ctx.measureText(bestText).width - 20, 55);
    } else {
      ctx.fillStyle = rgb(game.timeLeft <= 10 ? COLORS.red : COLORS.text);
      const timeText = `TIME: ${game.timeLeft}s`;
      ctx.fillText(timeText, viewW() - ctx.measureText(timeText).width - 20, 55);

      ctx.font = gameFont(20);
      const goalMet = game.score >= level.passScore;
      ctx.fillStyle = rgb(goalMet ? COLORS.green : COLORS.gold);
      const goalText = `GOAL: ${game.score}/${level.passScore}`;
      ctx.fillText(goalText, viewW() - ctx.measureText(goalText).width - 20, 82);
    }

    ctx.font = game.infinite ? gameFont(36) : gameFont(20);
    ctx.fillStyle = rgb(COLORS.text);
    ctx.fillText(`${level.name}  BPM ${level.bpm}`, 20, 82);
  },

  drawMobileControls(ctx, level) {
    if (!Input.touchMode) return;
    Input.setMobileZones(null, null);
    const needsMultiTap = level.allowRed || level.allowOrange || level.sliderRed;
    if (!needsMultiTap) return;
    ctx.font = gameFont(16);
    ctx.fillStyle = rgb(COLORS.text);
    const hint = "RED: 2 taps  |  ORANGE: 3 taps";
    ctx.fillText(hint, (viewW() - ctx.measureText(hint).width) / 2, viewH() - 40);
  },
};
