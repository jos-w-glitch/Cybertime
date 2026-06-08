export const COLORS = {
  bg: "#0a0a12",
  grid: "rgba(25, 20, 45, 0.8)",
  text: "#00ffc8",
  blue: "#00b4ff",
  blueGlow: "#0064ff",
  red: "#ff0064",
  orange: "#ff8c00",
  green: "#32ff64",
  gold: "#ffd23c",
  purple: "#b450ff",
};

export function targetColor(type: string) {
  if (type === "PURPLE") return COLORS.purple;
  if (type === "ORANGE") return COLORS.orange;
  if (type === "BOMB") return COLORS.red;
  return COLORS.blue;
}
