import type { SlideTheme } from "./MiniSlide";

export const THEMES = {
  violet: {
    bg: "#0e0b22",
    fg: "#f5f5fa",
    photo:
      "radial-gradient(circle at 25% 20%, rgba(255,255,255,.28), transparent 45%), linear-gradient(135deg,#2a1f6b,#7c5cff 60%,#22d3ee)",
  },
  ocean: {
    bg: "#0b1220",
    fg: "#eef4ff",
    photo:
      "radial-gradient(circle at 70% 20%, rgba(255,255,255,.3), transparent 45%), linear-gradient(135deg,#0b3b66,#1e90ff 60%,#7ee8fa)",
  },
  forest: {
    bg: "#0a1410",
    fg: "#effaf4",
    photo:
      "radial-gradient(circle at 30% 25%, rgba(255,255,255,.25), transparent 45%), linear-gradient(135deg,#0f3d2e,#22c55e 65%,#d9f99d)",
  },
  paper: {
    bg: "#f6f3ec",
    fg: "#1b1b1f",
    photo:
      "radial-gradient(circle at 70% 20%, rgba(255,255,255,.4), transparent 45%), linear-gradient(135deg,#f59e0b,#fb7185)",
  },
} satisfies Record<string, SlideTheme>;