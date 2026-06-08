import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { ReplayData } from "./replayTypes";
import { buildReplayFrame, spawnPosition } from "./buildReplayFrame";
import { COLORS, targetColor } from "./colors";

type Props = {
  replay: ReplayData;
};

function Grid() {
  const lines = [];
  for (let x = 0; x < 720; x += 50) lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={1280} stroke={COLORS.grid} strokeWidth={1} />);
  for (let y = 0; y < 1280; y += 50) lines.push(<line key={`h${y}`} x1={0} y1={y} x2={720} y2={y} stroke={COLORS.grid} strokeWidth={1} />);
  return <svg width={720} height={1280} style={{ position: "absolute", inset: 0 }}>{lines}</svg>;
}

function Orb({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 18px ${color}`,
        border: `3px solid ${COLORS.text}`,
      }}
    />
  );
}

export const ReplayComposition: React.FC<Props> = ({ replay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const absoluteTime = (replay.clipStartMs ?? 0) + timeMs;
  const state = buildReplayFrame(replay, timeMs);
  const active = spawnPosition(state.spawn, absoluteTime);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "sans-serif" }}>
      <Grid />

      {active?.slider && (
        <div
          style={{
            position: "absolute",
            left: active.hitZoneX - 2,
            top: active.y - 40,
            width: 4,
            height: 80,
            background: COLORS.gold,
            opacity: 0.5,
          }}
        />
      )}

      {active && !state.showOutro && <Orb x={active.x} y={active.y} r={active.r} color={targetColor(active.type)} />}
      {state.partner && !state.showOutro && (
        <Orb x={state.partner.x} y={state.partner.y} r={state.partner.r} color={COLORS.purple} />
      )}

      {state.pops.map((pop, i) => (
        <Orb key={`pop-${i}`} x={pop.x} y={pop.y - pop.age * 0.04} r={Math.max(8, pop.r - pop.age * 0.02)} color={pop.color} />
      ))}

      {state.floats.map((ft, i) => (
        <div
          key={`ft-${i}`}
          style={{
            position: "absolute",
            left: ft.x - 30,
            top: ft.y - ft.age * 0.05,
            width: 60,
            textAlign: "center",
            color: ft.color,
            fontSize: 28,
            fontWeight: 700,
            opacity: Math.max(0, 1 - ft.age / 900),
          }}
        >
          {ft.text}
        </div>
      ))}

      <div style={{ position: "absolute", left: 24, top: 24, color: COLORS.text, fontSize: 34, fontWeight: 700 }}>
        SCORE: {state.showOutro ? replay.score : state.score}
      </div>
      <div style={{ position: "absolute", left: 24, top: 68, color: COLORS.gold, fontSize: 22 }}>
        {replay.infinite ? "INFINITE" : replay.levelName}
      </div>
      <div style={{ position: "absolute", right: 24, top: 24, color: state.combo >= 3 ? COLORS.green : COLORS.text, fontSize: 30, fontWeight: 700 }}>
        COMBO x{state.combo}
      </div>

      {state.showOutro && (
        <AbsoluteFill style={{ background: "rgba(10,10,18,0.72)", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center", color: replay.success ? COLORS.green : COLORS.red, fontSize: 54, fontWeight: 800 }}>
            {replay.success ? "LEVEL COMPLETE" : "GAME OVER"}
          </div>
          <div style={{ marginTop: 24, color: COLORS.text, fontSize: 42, fontWeight: 700 }}>{replay.score} POINTS</div>
          <div style={{ marginTop: 18, color: COLORS.blue, fontSize: 48, fontWeight: 800, letterSpacing: 2 }}>CYBERTIME</div>
          <div style={{ marginTop: 10, color: COLORS.gold, fontSize: 22 }}>joseph-weiss.com/cybertime</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
