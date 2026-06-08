import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { ReplayComposition } from "./ReplayComposition";
import type { ReplayData } from "./replayTypes";

const FPS = 30;
const WIDTH = 720;
const HEIGHT = 1280;

function durationFrames(replay: ReplayData) {
  const ms = replay.clipDurationMs || replay.durationMs || 8000;
  return Math.max(FPS * 3, Math.ceil((ms / 1000) * FPS));
}

export async function canRenderReplayVideo() {
  const result = await canRenderMediaOnWeb({
    container: "mp4",
    videoCodec: "h264",
    width: WIDTH,
    height: HEIGHT,
  });
  return result.canRender;
}

export async function renderCyberTimeReplay(replay: ReplayData): Promise<Blob> {
  const durationInFrames = durationFrames(replay);
  const { getBlob } = await renderMediaOnWeb({
    composition: {
      id: "cybertime-replay",
      component: ReplayComposition,
      durationInFrames,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
      calculateMetadata: null,
    },
    inputProps: { replay },
    container: "mp4",
    videoCodec: "h264",
  });

  return getBlob();
}

export type { ReplayData };
