import type { FontName } from "./presentation";
import type { Base, Box } from "./slides";

export const THEME_KEYS = ["minimal", "professional", "stylish", "creative", "playful"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

/** A shape behind (or in front of) the slide content. "text" means "use the slide's text colour". */
export type Deco = { shape: "rect" | "ellipse"; box: Box; color: string; opacity?: number; front?: boolean };

export type Theme = {
  label: string;
  bg: string; // suggested background when the theme is picked
  font: FontName; // suggested font when the theme is picked
  bullet: string; // one character
  deco: (L: Base) => Deco[];
};

const W = 13.333;
const H = 7.5;

const isHero = (L: Base) => L.mode === "hero";
const isClosing = (L: Base) => L.mode === "closing";
const under = (L: Base) => ({ x: L.title.x, y: L.title.y + L.title.h });

const dots = (x: number, y: number, front = false): Deco[] =>
  ["#fb923c", "#34d399", "#60a5fa"].map((color, i) => ({
    shape: "ellipse",
    box: { x: x + i * 0.54, y, w: 0.32, h: 0.32 },
    color,
    front,
  }));

export const THEMES: Record<ThemeKey, Theme> = {
  minimal: {
    label: "Minimalist",
    bg: "#ffffff",
    font: "Calibri",
    bullet: "–",
    deco: (L) => {
      if (isHero(L)) {
        return [{ shape: "rect", box: { x: (W - 1) / 2, y: 4.12, w: 1, h: 0.04 }, color: "text", front: true }];
      }
      if (isClosing(L)) {
        return [{ shape: "rect", box: { x: (W - 1) / 2, y: 4.9, w: 1, h: 0.04 }, color: "text" }];
      }
      const u = under(L);
      return [{ shape: "rect", box: { x: u.x, y: u.y, w: 0.9, h: 0.04 }, color: "text" }];
    },
  },

  professional: {
    label: "Professional",
    bg: "#0b1220",
    font: "Calibri",
    bullet: "▪",
    deco: (L) => {
      if (isHero(L) || isClosing(L)) {
        return [{ shape: "rect", box: { x: 0, y: H - 0.14, w: W, h: 0.14 }, color: "#2563eb", front: isHero(L) }];
      }
      return [
        { shape: "rect", box: { x: 0, y: 0, w: 0.22, h: H }, color: "#2563eb" },
        { shape: "rect", box: { x: 0.7, y: H - 0.45, w: W - 1.4, h: 0.02 }, color: "text", opacity: 0.25 },
      ];
    },
  },

  stylish: {
    label: "Stylish",
    bg: "#0e0b22",
    font: "Georgia",
    bullet: "◆",
    deco: (L) => {
      if (isHero(L) || isClosing(L)) {
        const front = isHero(L);
        return [
          { shape: "ellipse", box: { x: W - 3, y: -1.5, w: 4, h: 4 }, color: "#c084fc", opacity: 0.35, front },
          { shape: "ellipse", box: { x: -1, y: H - 2.2, w: 3.2, h: 3.2 }, color: "#f0abfc", opacity: 0.3, front },
        ];
      }
      return [
        { shape: "ellipse", box: { x: W - 1.6, y: H - 1.6, w: 3, h: 3 }, color: "#c084fc", opacity: 0.18 },
        { shape: "rect", box: { x: L.title.x - 0.35, y: L.title.y + 0.3, w: 0.1, h: 0.6 }, color: "#c084fc" },
      ];
    },
  },

  creative: {
    label: "Creative",
    bg: "#1f1020",
    font: "Trebuchet MS",
    bullet: "●",
    deco: (L) => {
      if (isHero(L) || isClosing(L)) {
        const front = isHero(L);
        return [
          { shape: "ellipse", box: { x: -1.4, y: -1.6, w: 4.2, h: 4.2 }, color: "#f43f5e", opacity: 0.5, front },
          { shape: "ellipse", box: { x: W - 2.4, y: H - 2.4, w: 3.6, h: 3.6 }, color: "#fbbf24", opacity: 0.45, front },
        ];
      }
      const u = under(L);
      return [
        { shape: "ellipse", box: { x: W - 2.2, y: -1.6, w: 3.6, h: 3.6 }, color: "#f43f5e", opacity: 0.28 },
        { shape: "rect", box: { x: u.x, y: u.y, w: 1.6, h: 0.09 }, color: "#fbbf24" },
      ];
    },
  },

  playful: {
    label: "Playful",
    bg: "#f6f3ec",
    font: "Verdana",
    bullet: "★",
    deco: (L) => {
      if (isHero(L)) return dots((W - 1.4) / 2, 0.8, true);
      if (isClosing(L)) return dots((W - 1.4) / 2, 2.0);
      return [
        { shape: "ellipse", box: { x: W - 1.4, y: H - 1.4, w: 2.4, h: 2.4 }, color: "#fb923c", opacity: 0.16 },
        ...dots(0.7, H - 0.6),
      ];
    },
  },
};