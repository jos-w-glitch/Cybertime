let canvas, ctx;

const App = {
  state: "menu",
  save: null,
  game: null,
  lastLevel: null,
  pendingLevel: null,
  activeTutorial: null,
  stars: null,

  async init() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    this.ctx = ctx;
    this.canvas = canvas;
    Input.init(canvas, null);
    try { AudioEngine.init({ musicVolume: 0.55, sfxVolume: 0.7 }); } catch {}

    await CrazySDK.init();
    this.save = loadSave();
    Input.save = this.save;
    this.stars = createStars();
    AudioEngine.setVolumes(this.save.settings);

    this.bindEvents();
    AudioEngine.startMenuMusic();
    requestAnimationFrame((t) => this.loop(t));
  },

  bindEvents() {
    canvas.addEventListener("pointerdown", (e) => {
      const inGame = this.state === "game" && this.game?.running;
      if (!inGame && e.button !== 0) return;
      if (inGame && e.button !== 0 && e.button !== 2) return;

      e.preventDefault();
      canvas.setPointerCapture?.(e.pointerId);
      Input.syncPos(e.clientX, e.clientY);

      if (this.state === "gameover" && pointInRect(Input.mousePos, homeButtonRect())) {
        this.goHome();
        return;
      }

      if (inGame) {
        const button = Input.touchMode && e.button === 0
          ? (Input._inMobileZone("defuse", Input.mousePos) ? 2 : 0)
          : e.button;
        GameLogic.handleClick(this.game, button, Input.mousePos, performance.now());
        return;
      }

      this.handlePointer();
    });

    canvas.addEventListener("contextmenu", (e) => {
      if (this.state === "game" && this.game?.running) e.preventDefault();
    });

    canvas.addEventListener("pointermove", (e) => {
      Input.syncPos(e.clientX, e.clientY);
      if (this.state === "settings" && Screens.draggingSlider) {
        Screens._handleSliderDrag(this.save, Input.mousePos);
      }
    });

    canvas.addEventListener("pointerup", () => {
      Screens.draggingSlider = false;
    });

    document.addEventListener("keydown", (e) => {
      if (Screens.waitingKey) {
        Input.remapKey(Screens.waitingKey, e.code);
        Screens.waitingKey = null;
        e.preventDefault();
        return;
      }
      if (this.state === "game" && this.game?.running) {
        if (e.code === this.save.keys.ballKey || e.code === this.save.keys.bombKey) {
          const btn = e.code === this.save.keys.ballKey ? 0 : 2;
          GameLogic.handleClick(this.game, btn, Input.mousePos, performance.now());
        }
      }
      if (e.key === "F11") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    });

    window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
  },

  handlePointer() {
    if (this.state === "game" && this.game?.running) return;
    Screens.handleClick(this.state, this.save, Input.mousePos);
  },

  goHome() {
    this.game = null;
    this.pendingLevel = null;
    this.activeTutorial = null;
    this.state = "menu";
    AudioEngine.startMenuMusic();
  },

  requestStartGame(level) {
    if (CrazySDK.adPlaying) return;
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
    if (CrazySDK.adPlaying) return;
    this.lastLevel = level;
    const now = performance.now();
    this.game = createGame(level, now);
    this.game.currentTarget.activate(now);
    this.game.graceUntil = now + 1500;
    this.state = "game";

    await AudioEngine.resume();
    AudioEngine.startLevelMusic(level, () => GameLogic.onBeatSpawn(this.game, performance.now()));
    CrazySDK.gameplayStart();
  },

  startNextLevel() {
    const next = getLevelById(this.lastLevel.id + 1);
    if (!isLevelUnlocked(this.save, next)) return;
    this.requestStartGame(next);
  },

  endGame(reason) {
    if (!this.game || this.state === "gameover") return;
    this.game.endReason = reason;
    this.game.failMessage = pickFailMessage();
    GameLogic.finish(this.game, this.save);
    this.state = "gameover";
    if (this.game.lastRewards?.success) CrazySDK.requestMidgame(() => {});
  },

  requestAdReward() {
    const cooldown = 60000;
    if (Date.now() - this.save.lastAdReward < cooldown) return;
    CrazySDK.requestRewarded((success) => {
      if (!success) return;
      this.save.coins += REWARDED_AD_COINS;
      this.save.xp += REWARDED_AD_XP;
      this.save.lastAdReward = Date.now();
      writeSave(this.save);
    });
  },

  renderCursor(save) {
    drawCursor(this.ctx, Input.mousePos, getSkinById(save.equippedSkin));
  },

  loop(now) {
    if (CrazySDK.adPlaying) {
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const mousePos = Input.mousePos;
    const homeHovered = pointInRect(mousePos, homeButtonRect());

    try {
      if (this.state === "gameover" && this.game) {
        Screens.drawGameOver(this.game, this.save, mousePos, now, homeHovered);
        this.renderCursor(this.save);
      } else if (this.state === "tutorial" && this.activeTutorial) {
        Screens.drawTutorial(this.activeTutorial, mousePos, now, this.save);
        this.renderCursor(this.save);
      } else if (this.state === "menu") {
        Screens.drawMenu(this.save, mousePos, now);
        this.renderCursor(this.save);
      } else if (this.state === "levels") {
        Screens.drawLevels(this.save, mousePos, now);
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
      }
    } catch (err) {
      console.error(err);
    }

    requestAnimationFrame((t) => this.loop(t));
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
