let canvas, ctx;

const App = {
  state: "menu",
  save: null,
  game: null,
  lastLevel: null,
  pendingLevel: null,
  activeTutorial: null,
  stars: null,
  sessionReady: false,
  loopStarted: false,
  renderError: null,
  leaderboardLevelId: null,

  async init() {
    canvas = document.getElementById("game");
    if (!canvas) throw new Error("Game canvas missing");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    this.ctx = ctx;
    this.canvas = canvas;
    Input.init(canvas, null);
    MobileShell.init();
    PwaInstall.init();
    window.addEventListener("resize", () => applyViewport(canvas));
    await loadGameFont();
    try { AudioEngine.init({ musicVolume: 0.55, sfxVolume: 0.7 }); } catch {}
    UiIcons.load();
    this.bindEvents();
    this.bindNameForm();
    CreatorDom.init();

    Auth.init(() => this.startSession());

    document.getElementById("wrapper")?.classList.add("session-active");

    if (!this.loopStarted) {
      this.loopStarted = true;
      requestAnimationFrame((t) => this.loop(t));
    }
  },

  bindNameForm() {
    const play = () => this.tryLogin();

    document.getElementById("name-play")?.addEventListener("click", (e) => {
      e.preventDefault();
      play();
    });

    document.getElementById("name-cancel")?.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.hideNameScreen();
    });

    document.getElementById("name-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      play();
    });

    const nameInput = document.getElementById("player-name");
    const pinInput = document.getElementById("player-pin");

    nameInput?.addEventListener("input", () => Auth.updatePinHint(nameInput.value));
    nameInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        pinInput?.focus();
      }
    });

    pinInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        play();
      }
    });

    Auth.updatePinHint("");
  },

  tryLogin() {
    const name = document.getElementById("player-name")?.value || "";
    const pin = document.getElementById("player-pin")?.value || "";
    const guestSave = Auth.isLoggedIn() ? null : { ...this.save };
    Auth.setLoading(true);
    Auth.login(name, pin)
      .then((result) => {
        if (!result.ok) {
          Auth.setError(result.reason);
          return;
        }
        const nameInput = document.getElementById("player-name");
        if (nameInput) nameInput.value = result.name;
        this.startSession(guestSave);
      })
      .catch(() => Auth.setError("Login failed — try again"))
      .finally(() => Auth.setLoading(false));
  },

  startSession(guestSave = null) {
    try {
      this.renderError = null;
      if (guestSave && Auth.isLoggedIn()) {
        this.save = mergeGuestIntoAccount(guestSave, loadSave());
      } else {
        this.save = loadSave();
      }
      this.save.username = Auth.isLoggedIn() ? Auth.displayName : "Guest";
      writeSave(this.save);
      Input.save = this.save;
      this.stars = createStars();
      AudioEngine.setVolumes(this.save.settings);
      CreatorStore.init().catch(() => {});
      const communityParam = new URLSearchParams(window.location.search).get("community");
      if (communityParam) {
        CreatorUi.levelsTab = "community";
        this.state = "levels";
      }
      Auth.hideNameScreen();
      this.sessionReady = true;
      if (this.state !== "game" || !this.game?.running) {
        this.state = this.state === "settings" ? "settings" : "menu";
      }
      if (this.state === "menu") AudioEngine.startMenuMusic();
      if (Input.touchMode) MobileShell.syncRotatePrompt();
    } catch (err) {
      console.error(err);
      this.sessionReady = false;
      Auth.setError("Could not start — try again");
      Auth.showLoginScreen();
    }
  },

  showLogin() {
    Auth.showLoginScreen();
  },

  logout() {
    if (Auth.isLoggedIn()) writeSave(this.save);
    Auth.logout();
    this.save = loadSave();
    Input.save = this.save;
    AudioEngine.setVolumes(this.save.settings);
  },

  bindEvents() {
    canvas.addEventListener("pointerdown", (e) => {
      if (!this.sessionReady) return;
      const inGame = this.state === "game" && this.game?.running;
      const waitingStart = inGame && !this.game.started;
      if (!inGame && e.button !== 0) return;
      if (inGame && !waitingStart && e.button !== 0 && e.button !== 1 && e.button !== 2) return;

      e.preventDefault();
      canvas.setPointerCapture?.(e.pointerId);
      Input.syncPos(e.clientX, e.clientY);

      if (this.state === "gameover" && pointInRect(Input.mousePos, homeButtonRect())) {
        this.goHome();
        return;
      }

      if (inGame) {
        const button = Input.touchMode ? 0 : e.button;
        const clickResult = GameLogic.handleClick(this.game, button, Input.mousePos, performance.now());
        if (clickResult === "begin") this.beginGame(performance.now());
        return;
      }

      if (this.state === "creator" && CreatorUi.handlePointerDown(Input.mousePos)) return;

      if (Screens.scrollableState(this.state)) {
        Screens.beginScrollDrag(e.clientY);
        Screens.scrollDrag.dragged = false;
        return;
      }

      this.handlePointer();
    });

    canvas.addEventListener("contextmenu", (e) => {
      if (this.state === "game" && this.game?.running) e.preventDefault();
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!this.sessionReady) return;
      Input.syncPos(e.clientX, e.clientY);
      if (Screens.scrollDrag) {
        if (Screens.updateScrollDrag(e.clientY)) Screens.scrollDrag.dragged = true;
        return;
      }
      if (this.state === "settings" && Screens.draggingSlider) {
        Screens._handleSliderDrag(this.save, Input.mousePos);
      }
      if (this.state === "shop" && Screens.draggingBgSlider) {
        Screens._handleShopBgSliderDrag(this.save, Input.mousePos);
      }
      if (this.state === "creator" && CreatorRewardUi.draggingRewardSlider) {
        CreatorRewardUi._handleSliderDrag(CreatorStore.rewardDraft(), Input.mousePos);
      }
    });

    canvas.addEventListener("pointerup", (e) => {
      if (Screens.scrollDrag) {
        Input.syncPos(e.clientX, e.clientY);
        const dragged = Screens.endScrollDrag();
        if (!dragged) this.handlePointer();
        return;
      }
      Screens.draggingSlider = false;
      Screens.draggingBgSlider = false;
      CreatorRewardUi.draggingRewardSlider = false;
    });

    document.addEventListener("keydown", (e) => {
      if (!this.sessionReady) return;
      if (Screens.waitingKey) {
        Input.remapKey(Screens.waitingKey, e.code);
        Screens.waitingKey = null;
        e.preventDefault();
        return;
      }
      if (this.state === "game" && this.game?.running) {
        if (e.code === this.save.keys.ballKey || e.code === this.save.keys.bombKey) {
          const btn = e.code === this.save.keys.ballKey ? 0 : 2;
          const clickResult = GameLogic.handleClick(this.game, btn, Input.mousePos, performance.now());
          if (clickResult === "begin") this.beginGame(performance.now());
        }
      }
      if (e.key === "F11") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    });

    window.addEventListener("wheel", (e) => {
      if (App.state === "levels" || App.state === "shop" || App.state === "creator") {
        Screens.scrollList(e.deltaY * 0.6);
        e.preventDefault();
      }
    }, { passive: false });
  },

  handlePointer() {
    if (this.state === "game" && this.game?.running) return;
    Screens.handleClick(this.state, this.save, Input.mousePos);
  },

  goHome() {
    MobileShell.exitPlayMode();
    this.game = null;
    this.pendingLevel = null;
    this.activeTutorial = null;
    this.leaderboardLevelId = null;
    Screens.shareFeedback = "";
    Share.reset();
    this.state = "menu";
    AudioEngine.startMenuMusic();
  },

  openLevelLeaderboard(levelId) {
    this.leaderboardLevelId = levelId;
    refreshLeaderboard(levelId);
  },

  requestStartGame(level) {
    const tutorial = level.tutorial ? getTutorial(level.tutorial) : null;
    if (tutorial) {
      this.pendingLevel = level;
      this.activeTutorial = tutorial;
      this.state = "tutorial";
      return;
    }
    this.launchGame(level);
  },

  confirmTutorial() {
    const level = this.pendingLevel;
    this.pendingLevel = null;
    this.activeTutorial = null;
    if (!level) {
      this.state = "menu";
      return;
    }
    this.launchGame(level);
  },

  async launchGame(level) {
    AudioEngine.stopMusic();
    this.lastLevel = level;
    this.game = createGame(level, 0);
    if (level.playBg?.mediaId) {
      CreatorStore.getMediaUrl(level.playBg.mediaId).then((url) => {
        if (!url) return;
        level._bgMediaUrl = url;
        preloadBgMedia(url);
      });
    }
    this.state = "game";
    if (Input.touchMode) await MobileShell.enterPlayMode();
    await AudioEngine.resume();
  },

  beginGame(now) {
    if (!this.game || this.game.started) return;
    GameLogic.beginGame(this.game, now);
  },

  startNextLevel() {
    const next = getLevelById(this.lastLevel.id + 1);
    if (!isLevelUnlocked(this.save, next)) return;
    this.requestStartGame(next);
  },

  endGame(reason) {
    if (!this.game || this.state === "gameover") return;
    this.game.endReason = reason;
    this.game.failMessage = reason === "hearts"
      ? "OUT OF HEARTS"
      : reason === "exploded"
        ? "TARGET EXPLODED"
        : reason === "timing"
          ? "TOO SLOW"
          : pickFailMessage();
    GameLogic.finish(this.game, this.save);
    if (!this.game.level.community) refreshLeaderboard(this.game.level.id);
    Share.prepareShareCard(this.game);
    this.state = "gameover";
  },

  renderCursor(save) {
    if (Input.touchMode) return;
    drawCursor(this.ctx, Input.mousePos, getSkinById(save.equippedSkin));
  },

  loop(now) {
    const mousePos = Input.mousePos;
    const homeHovered = pointInRect(mousePos, homeButtonRect());

    if (!this.sessionReady) {
      drawBootMessage(this.ctx, GAME_NAME, ["Loading..."]);
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    if (this.renderError) {
      drawBootMessage(this.ctx, "LOAD ERROR", [this.renderError, "Refresh the page"]);
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    try {
      clearFrame(this.ctx);

      if (this.state === "gameover" && this.game) {
        Screens.drawGameOver(this.game, this.save, mousePos, now, homeHovered);
        this.renderCursor(this.save);
      } else if (this.state === "tutorial" && this.activeTutorial) {
        Screens.drawTutorial(this.activeTutorial, mousePos, now, this.save);
        this.renderCursor(this.save);
      } else if (this.state === "menu") {
        Screens.drawMenu(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "levels" && this.leaderboardLevelId) {
        Screens.drawLevelLeaderboard(this.save, this.leaderboardLevelId, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "levels") {
        Screens.drawLevels(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "creator") {
        CreatorUi.draw(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "infinite") {
        Screens.drawInfiniteSelect(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "shop") {
        Screens.drawShop(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "settings") {
        Screens.drawSettings(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "howto") {
        Screens.drawHowTo(mousePos, now, this.save);
        this.renderCursor(this.save);
      } else if (this.state === "game" && this.game?.running) {
        const reason = GameLogic.update(this.game, now);
        if (reason) {
          this.endGame(reason);
          Screens.drawGameOver(this.game, this.save, mousePos, now, homeHovered);
        } else {
          Screens.drawGameScreen(this.game, now, this.save);
        }
        this.renderCursor(this.save);
      } else {
        Screens.drawMenu(this.save, mousePos, now);
        this.renderCursor(this.save);
      }

    } catch (err) {
      console.error(err);
      this.renderError = err?.message || "Render failed";
      AudioEngine.stopMusic();
      Auth.showLoginScreen();
      Auth.setError(this.renderError);
    }

    requestAnimationFrame((t) => this.loop(t));
  },
};

function reportScriptError(label) {
  const message = `Missing file: ${label}. Redeploy the full game folder.`;
  const overlay = document.getElementById("name-overlay");
  const error = document.getElementById("name-error");
  if (overlay) overlay.classList.remove("hidden");
  if (error) error.textContent = message;
  console.error(message);
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.__cybertimeLoadError) {
    reportScriptError(window.__cybertimeLoadError);
    return;
  }
  App.init().catch((err) => {
    console.error(err);
    Auth.setError("Game failed to load — refresh the page");
    Auth.showLoginScreen();
  });
});
