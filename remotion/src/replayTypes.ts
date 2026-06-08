export type ReplayEvent =
  | {
      t: number;
      type: "spawn";
      targetType: string;
      x: number;
      y: number;
      r: number;
      slider: boolean;
      velX: number;
      hitZoneX: number;
      partner?: { x: number; y: number; r: number };
    }
  | {
      t: number;
      type: "hit";
      x: number;
      y: number;
      targetType: string;
      points: number;
      combo: number;
    }
  | {
      t: number;
      type: "miss";
      x: number;
      y: number;
    };

export type ReplayData = {
  version: number;
  w: number;
  h: number;
  score: number;
  success: boolean;
  levelId: number;
  levelName: string;
  infinite: boolean;
  comboPeak: number;
  clipStartMs: number;
  clipDurationMs: number;
  durationMs: number;
  events: ReplayEvent[];
};

export type ReplayFrame = {
  score: number;
  combo: number;
  spawn: Extract<ReplayEvent, { type: "spawn" }> | null;
  partner: { x: number; y: number; r: number } | null;
  pops: Array<{ x: number; y: number; r: number; color: string; age: number }>;
  floats: Array<{ x: number; y: number; text: string; color: string; age: number }>;
  showOutro: boolean;
};
