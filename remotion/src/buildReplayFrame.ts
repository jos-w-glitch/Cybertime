import type { ReplayData, ReplayFrame } from "./replayTypes";
import { targetColor } from "./colors";

const FRAME_MS = 1000 / 60;

function sliderX(spawn: Extract<ReplayData["events"][number], { type: "spawn" }>, timeMs: number) {
  if (!spawn.slider) return spawn.x;
  const elapsedFrames = (timeMs - spawn.t) / FRAME_MS;
  return spawn.x + spawn.velX * elapsedFrames;
}

export function buildReplayFrame(replay: ReplayData, timeMs: number): ReplayFrame {
  const clipStart = replay.clipStartMs ?? 0;
  const clipEnd = clipStart + (replay.clipDurationMs ?? replay.durationMs ?? 0);
  const absoluteTime = clipStart + timeMs;
  const outroStart = clipEnd - 2500;

  let score = 0;
  let combo = 0;
  let spawn: ReplayFrame["spawn"] = null;
  let partner: ReplayFrame["partner"] = null;
  const pops: ReplayFrame["pops"] = [];
  const floats: ReplayFrame["floats"] = [];

  for (const event of replay.events) {
    if (event.t > absoluteTime) break;

    if (event.type === "spawn") {
      spawn = event;
      partner = event.partner ?? null;
      continue;
    }

    if (event.type === "hit") {
      score += event.points;
      combo = event.combo;
      pops.push({
        x: event.x,
        y: event.y,
        r: 24,
        color: targetColor(event.targetType),
        age: absoluteTime - event.t,
      });
      floats.push({
        x: event.x,
        y: event.y - 24,
        text: `+${event.points}`,
        color: "#32ff64",
        age: absoluteTime - event.t,
      });
      continue;
    }

    combo = 0;
    floats.push({
      x: event.x,
      y: event.y - 24,
      text: "-1",
      color: "#ff0064",
      age: absoluteTime - event.t,
    });
  }

  return {
    score,
    combo,
    spawn,
    partner,
    pops: pops.filter((pop) => pop.age < 700),
    floats: floats.filter((ft) => ft.age < 900),
    showOutro: absoluteTime >= outroStart,
  };
}

export function spawnPosition(spawn: ReplayFrame["spawn"], absoluteTimeMs: number) {
  if (!spawn) return null;
  const x = sliderX(spawn, absoluteTimeMs);
  return { x, y: spawn.y, r: spawn.r, type: spawn.targetType, slider: spawn.slider, hitZoneX: spawn.hitZoneX };
}
