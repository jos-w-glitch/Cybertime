const GameLogic = {
  beginGame(game, now) {
    if (!game || game.started) return;
    game.started = true;
    game.startTime = now;
    game.graceUntil = now + 1500;
    game.currentTarget.activate(now);
    this._syncPurplePair(game, now);
    if (!game.infinite) {
      game.timeLimit = STAGE_TIME_SECONDS;
      game.stageEndAt = now + STAGE_TIME_SECONDS * 1000;
      game.timeLeft = STAGE_TIME_SECONDS;
    }
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

  _bumpCombo(game, now) {
    game.combo += 1;
    game.comboPeak = Math.max(game.comboPeak, game.combo);
    this._onComboMilestone(game, now);
  },

  _onComboMilestone(game, now) {
    if (!game.infinite || game.goldenBonus) return;
    if (game.combo < GOLDEN_BONUS_COMBO_STEP || game.combo % GOLDEN_BONUS_COMBO_STEP !== 0) return;
    if (game.lastGoldenCombo === game.combo) return;
    game.lastGoldenCombo = game.combo;
    const bonus = new GoldenBonus(game);
    bonus.activate(now);
    game.goldenBonus = bonus;
  },

  handleStartClick(game, button, pos, now) {
    const start = game.startTarget;
    if (!start) return null;

    const action = Input.resolveButton(button);
    const hit = start.checkClick(pos);
    const partnerHit = start.checkPartnerClick(pos);
    if (hit === "MISS" && partnerHit === "MISS") return null;

    if (start.mechanic === "BALL") {
      if (action !== "ball" || hit !== "HIT") return null;
      return "begin";
    }

    if (start.mechanic === "BOMB") {
      if (Input.touchMode) {
        if (action !== "ball") { start.mobileTapCount = 0; return null; }
        start.mobileTapCount += 1;
        if (start.mobileTapCount < 2) { AudioEngine.playDefuse(); return null; }
        return "begin";
      }
      if (action !== "bomb" || hit !== "HIT") return null;
      return "begin";
    }

    if (start.mechanic === "ORANGE") {
      if (Input.touchMode) {
        if (action !== "ball") { start.mobileTapCount = 0; start.defused = false; return null; }
        start.mobileTapCount += 1;
        if (start.mobileTapCount < 3) {
          if (start.mobileTapCount === 2) start.defused = true;
          AudioEngine.playDefuse();
          return null;
        }
        return "begin";
      }
      if (!start.defused) {
        if (action !== "bomb" || hit !== "HIT") return null;
        start.defused = true;
        AudioEngine.playDefuse();
        return null;
      }
      if (action !== "ball" || hit !== "HIT") return null;
      return "begin";
    }

    if (start.mechanic === "PURPLE") {
      if (Input.touchMode) {
        if (hit === "HIT" && !start.purpleTapMain) start.purpleTapMain = now;
        if (partnerHit === "HIT" && !start.purpleTapPartner) start.purpleTapPartner = now;
        if (!start.purpleTapMain || !start.purpleTapPartner) {
          AudioEngine.playDefuse();
          return null;
        }
        if (Math.abs(start.purpleTapMain - start.purpleTapPartner) > PURPLE_DUAL_WINDOW_MS) {
          start.purpleTapMain = 0;
          start.purpleTapPartner = 0;
          return null;
        }
        return "begin";
      }
      if (action !== "purple" || hit !== "HIT") return null;
      return "begin";
    }

    if (start.mechanic === "SLIDER" || start.mechanic === "SLIDER_BOMB") {
      if (hit !== "HIT" || Math.abs(start.x - start.hitZoneX) > 32) return null;
      if (start.mechanic === "SLIDER_BOMB") {
        if (Input.touchMode) {
          if (action !== "ball") { start.mobileTapCount = 0; return null; }
          start.mobileTapCount += 1;
          if (start.mobileTapCount < 2) { AudioEngine.playDefuse(); return null; }
          return "begin";
        }
        if (action !== "bomb") return null;
        return "begin";
      }
      if (action !== "ball") return null;
      return "begin";
    }

    return null;
  },

  handleClick(game, button, pos, now) {
    if (!game.started) return this.handleStartClick(game, button, pos, now);

    const action = Input.resolveButton(button);
    if (!action) return;

    if (this._tryCollectGoldenBonus(game, action, pos, now)) return;

    if (game.currentTarget.type === "PURPLE") {
      if (Input.touchMode) this._handlePurplePair(game, button, pos, now);
      else this._handleDesktopPurple(game, button, pos, now);
      return;
    }

    const result = game.currentTarget.checkClick(pos);
    if (result === "MISS" || (game.infinite && result === "SAFE_ZONE")) {
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

  _handlePurplePair(game, button, pos, now) {
    const main = game.currentTarget;
    const partner = game.purplePartner;
    if (!partner) return;

    const mainHit = main.checkClick(pos);
    const partnerHit = partner.checkClick(pos);

    if (mainHit === "SAFE_ZONE" || partnerHit === "SAFE_ZONE") {
      this._resetPurplePair(game);
      this._registerMiss(game, pos);
      return;
    }
    if (mainHit !== "HIT" && partnerHit !== "HIT") return;

    if (mainHit === "HIT" && !game.purpleTapMain) {
      game.purpleTapMain = now;
      main.purpleTapped = true;
    }
    if (partnerHit === "HIT" && !game.purpleTapPartner) {
      game.purpleTapPartner = now;
      partner.purpleTapped = true;
    }

    if (!game.purpleTapMain || !game.purpleTapPartner) {
      AudioEngine.playDefuse();
      return;
    }
    if (Math.abs(game.purpleTapMain - game.purpleTapPartner) > PURPLE_DUAL_WINDOW_MS) {
      this._resetPurplePair(game);
      this._wrongHit(game, main);
      return;
    }

    this._resetPurplePair(game);
    this._bumpCombo(game, now);
    const points = game.combo + 1;
    game.floatingTexts.push(new FloatingText(`+${points}`, main.x, main.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, main, COLORS.purple, now, game.combo + 1);
    if (partner) game.flippedTargets.push(new FlippedTarget(partner.x, partner.y, partner.radius, COLORS.purple));
  },

  _handleDesktopPurple(game, button, pos, now) {
    const target = game.currentTarget;
    const hit = target.checkClick(pos);
    if (hit === "SAFE_ZONE") {
      this._registerMiss(game, pos);
      return;
    }
    if (hit !== "HIT") return;

    if (Input.resolveButton(button) !== "purple") {
      this._wrongHit(game, target);
      return;
    }

    this._bumpCombo(game, now);
    const points = game.combo + 1;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.purple, now, points);
  },

  _resetPurplePair(game) {
    if (game.currentTarget?.type === "PURPLE") game.currentTarget.purpleTapped = false;
    if (game.purplePartner) game.purplePartner.purpleTapped = false;
    game.purplePartner = null;
    game.purpleTapMain = 0;
    game.purpleTapPartner = 0;
  },

  _syncPurplePair(game, now) {
    this._resetPurplePair(game);
    const target = game.currentTarget;
    if (target.type !== "PURPLE" || !Input.touchMode) return;

    const partner = new Target(game.level, false);
    partner.type = "PURPLE";
    let attempts = 0;
    while (attempts < 24) {
      partner.x = 100 + Math.random() * (viewW() - 200);
      partner.y = 140 + Math.random() * (viewH() - 280);
      if (Math.hypot(partner.x - target.x, partner.y - target.y) >= 140) break;
      attempts += 1;
    }
    partner.expiresAt = target.expiresAt;
    partner.activate(now);
    partner.expiresAt = target.expiresAt;
    game.purplePartner = partner;
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
    this._bumpCombo(game, now);
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
    this._bumpCombo(game, now);
    const points = game.combo + 2;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.orange, now, points);
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

    this._bumpCombo(game, now);
    const points = game.combo + 2;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    this._advanceTarget(game, target, COLORS.orange, now, points);
  },

  _resolveHit(game, action, now) {
    const target = game.currentTarget;
    const needsBall = target.type === "BALL";
    const isCorrect = (needsBall && action === "ball") || (!needsBall && action === "bomb");

    if (!isCorrect) {
      this._wrongHit(game, target);
      return;
    }

    this._bumpCombo(game, now);
    const points = game.combo;
    game.floatingTexts.push(new FloatingText(`+${points}`, target.x, target.y, COLORS.green, points));
    AudioEngine.playHit();
    const color = target.type === "BALL" ? COLORS.blue : COLORS.red;
    this._advanceTarget(game, target, color, now);
  },

  _wrongHit(game, target) {
    if (target.mobileTapCount !== undefined) target.mobileTapCount = 0;
    if (target.defused) target.defused = false;
    this._resetPurplePair(game);
    game.combo = 0;
    game.lastGoldenCombo = 0;
    game.floatingTexts.push(new FloatingText("-1", target.x, target.y, COLORS.red, -1));
    AudioEngine.playMiss();
  },

  _advanceTarget(game, target, color, now, points = game.combo) {
    this._resetPurplePair(game);
    game.flippedTargets.push(new FlippedTarget(target.x, target.y, target.radius, color));
    game.currentTarget = game.nextTarget;
    game.currentTarget.activate(now);
    this._syncPurplePair(game, now);
    game.nextTarget = new Target(game.level, shouldSpawnSlider(game.level));
  },

  _registerMiss(game, pos) {
    game.combo = 0;
    game.lastGoldenCombo = 0;
    game.floatingTexts.push(new FloatingText(game.infinite ? "MISS" : "-1", pos.x, pos.y, COLORS.red, 0));
    AudioEngine.playMiss();
    if (game.infinite) game.hearts -= 1;
  },

  _skipExpiredTarget(game, now) {
    this._resetPurplePair(game);
    game.currentTarget = game.nextTarget;
    game.currentTarget.activate(now);
    this._syncPurplePair(game, now);
    game.nextTarget = new Target(game.level, shouldSpawnSlider(game.level));
  },

  _tryCollectGoldenBonus(game, action, pos, now) {
    const bonus = game.goldenBonus;
    if (!bonus || bonus.isExpired(now) || !bonus.checkClick(pos)) return false;
    if (action !== "ball") return false;
    game.goldenBonus = null;
    const points = GOLDEN_BONUS_POINTS + Math.min(game.combo, 8);
    game.floatingTexts.push(new FloatingText(`+${points}`, bonus.x, bonus.y, COLORS.gold, points));
    AudioEngine.playHit();
    return true;
  },

  update(game, now) {
    if (!game?.running || game.paused) return null;
    if (!game.started) {
      game.startTarget.update();
      return null;
    }

    if (game.infinite) {
      game.timeLeft = null;
    } else {
      const msLeft = game.stageEndAt - now;
      const secondsLeft = msLeft / 1000;
      game.timeLeft = Math.max(0, Math.ceil(secondsLeft));
      if (secondsLeft <= MUSIC_FADE_SECONDS) {
        AudioEngine.setMusicFade(secondsLeft, MUSIC_FADE_SECONDS);
      }
      if (msLeft <= 0) return "time";
    }
    if (game.infinite && game.hearts <= 0) return "hearts";

    if (game.currentTarget.isOffScreen) {
      if (game.infinite) {
        game.hearts -= 1;
        if (game.hearts <= 0) return "hearts";
        this._skipExpiredTarget(game, now);
      } else {
        return "expired";
      }
    }
    if (!game.graceUntil || now > game.graceUntil) {
      if (game.currentTarget.isExpired(now)) {
        if (game.infinite) {
          game.combo = 0;
          game.lastGoldenCombo = 0;
          game.hearts -= 1;
          if (game.hearts <= 0) return "hearts";
          this._skipExpiredTarget(game, now);
        } else {
          return "expired";
        }
      }
    }

    game.currentTarget.update();
    if (game.goldenBonus?.isExpired(now)) game.goldenBonus = null;

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
      const ready = game.infinite ? "INFINITE — READY" : `TIME: ${STAGE_TIME_SECONDS}s`;
      ctx.fillText(ready, viewW() - ctx.measureText(ready).width - 20, 55);
      ctx.font = gameFont(20);
      ctx.fillStyle = rgb(COLORS.text);
      ctx.fillText(`${level.name}  BPM ${level.bpm}`, 20, 82);
      if (game.infinite) drawHearts(ctx, game.hearts, INFINITE_START_HEARTS);
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
      drawHearts(ctx, game.hearts, INFINITE_START_HEARTS);
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
    const needsMultiTap = level.allowRed || level.allowOrange || level.allowPurple || level.sliderRed;
    if (!needsMultiTap) return;
    ctx.font = gameFont(16);
    ctx.fillStyle = rgb(COLORS.text);
    const hint = level.allowPurple
      ? "RED: 2 taps  |  ORANGE: 3 taps  |  PURPLE: get BOTH within 1s"
      : "RED: 2 taps  |  ORANGE: 3 taps";
    ctx.fillText(hint, (viewW() - ctx.measureText(hint).width) / 2, viewH() - 40);
  },
};
