const REPLAY_VERSION = 1;
const REPLAY_CLIP_MS = 12000;
const REPLAY_OUTRO_MS = 2500;

const Replay = {
  attach(game) {
    game.replay = {
      version: REPLAY_VERSION,
      w: viewW(),
      h: viewH(),
      startedAt: 0,
      events: [],
    };
  },

  markStart(game, now) {
    if (!game?.replay) return;
    game.replay.startedAt = now;
    game.replay.w = viewW();
    game.replay.h = viewH();
  },

  time(game, now) {
    if (!game?.replay?.startedAt) return 0;
    return Math.max(0, now - game.replay.startedAt);
  },

  logSpawn(game, target, now, partner = null) {
    if (!game?.replay?.startedAt) return;
    const event = {
      t: this.time(game, now),
      type: "spawn",
      targetType: target.type,
      x: Math.round(target.x),
      y: Math.round(target.y),
      r: Math.round(target.radius),
      slider: !!target.isSlider,
      velX: target.isSlider ? target.velX : 0,
      hitZoneX: Math.round(target.hitZoneX),
    };
    if (partner) {
      event.partner = {
        x: Math.round(partner.x),
        y: Math.round(partner.y),
        r: Math.round(partner.radius),
      };
    }
    game.replay.events.push(event);
  },

  logHit(game, target, points, combo, now) {
    if (!game?.replay?.startedAt) return;
    game.replay.events.push({
      t: this.time(game, now),
      type: "hit",
      x: Math.round(target.x),
      y: Math.round(target.y),
      targetType: target.type,
      points,
      combo,
    });
  },

  logMiss(game, x, y, now) {
    if (!game?.replay?.startedAt) return;
    game.replay.events.push({
      t: this.time(game, now),
      type: "miss",
      x: Math.round(x),
      y: Math.round(y),
    });
  },

  finalize(game, success) {
    const replay = game?.replay;
    if (!replay) return null;

    replay.score = game.score;
    replay.success = !!success;
    replay.levelId = game.level.id;
    replay.levelName = game.level.name;
    replay.infinite = !!game.infinite;
    replay.comboPeak = game.comboPeak;

    const lastT = replay.events.length ? replay.events[replay.events.length - 1].t : 0;
    replay.clipStartMs = Math.max(0, lastT - REPLAY_CLIP_MS);
    replay.clipDurationMs = lastT - replay.clipStartMs + REPLAY_OUTRO_MS;
    replay.durationMs = replay.clipDurationMs;
    return replay;
  },

  forShare(game) {
    return game?.replay || null;
  },
};
