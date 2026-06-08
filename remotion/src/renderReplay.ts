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

const RENDER_TARGETS = [
  { container: "mp4" as const, videoCodec: "h264" as const, mime: "video/mp4", ext: "mp4" },
  { container: "webm" as const, videoCodec: "vp8" as const, mime: "video/webm", ext: "webm" },
];

export type ReplayRenderTarget = (typeof RENDER_TARGETS)[number];

export async function getReplayRenderTarget() {
  const issuesByTarget: Array<{ target: ReplayRenderTarget; issues: unknown[] }> = [];

  for (const target of RENDER_TARGETS) {
    const result = await canRenderMediaOnWeb({
      container: target.container,
      videoCodec: target.videoCodec,
      width: WIDTH,
      height: HEIGHT,
    });
    if (result.canRender) {
      return { canRender: true, target, issues: result.issues ?? [] };
    }
    issuesByTarget.push({ target, issues: (result.issues ?? []) as unknown[] });
  }

  const mergedIssues = issuesByTarget
    .flatMap((x) => x.issues)
    .map((i) => (typeof i === "string" ? i : JSON.stringify(i)))
    .slice(0, 10);

  return {
    canRender: false,
    target: null,
    issues: mergedIssues,
  };
}

export async function renderCyberTimeReplay(replay: ReplayData, target?: ReplayRenderTarget): Promise<Blob> {
  const chosen = target ?? (await getReplayRenderTarget()).target;
  if (!chosen) throw new Error("No replay render target available");

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
    container: chosen.container,
    videoCodec: chosen.videoCodec,
  });

  return getBlob();
}

export type { ReplayData };
