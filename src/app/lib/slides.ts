import { textColorFor } from "./presentation";
import { THEMES, type Deco, type ThemeKey } from "./themes";

export type SlideType = "title" | "intro" | "content" | "conclusion" | "thanks";
export type SlideLayout = "background" | "image-left" | "image-right" | "text-only";

export type ImageCredit = { name: string; link: string; downloadLocation: string };

export type Slide = {
  id: string;
  presentation_id: string;
  position: number;
  type: SlideType;
  title: string;
  bullets: string[];
  notes: string;
  layout: SlideLayout;
  image_url: string | null;
  image_keyword: string | null;
  image_credit: ImageCredit | null;
};

export type Style = { font_family: string; font_size: number; bg_color: string; theme: ThemeKey };

// 16:9 widescreen, in inches (the same size PowerPoint's "Widescreen" uses)
export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

export type Box = { x: number; y: number; w: number; h: number };

export type Base = {
  mode: "hero" | "closing" | "text" | "image-left" | "image-right";
  title: Box;
  body: Box | null;
  image: Box | null;
  credit: Box | null;
  titleAlign: "left" | "center";
  titleSize: number;
  bodySize: number;
  textColor: string;
};

export type Resolved = Base & { deco: Deco[]; bullet: string };

/** Slides are ordered by position only, so they can be moved around in the editor later. */
export function sortSlides(slides: Slide[]) {
  return [...slides].sort((a, b) => a.position - b.position);
}

/** Unsplash images are resized by their CDN through URL parameters. */
export function imgUrl(raw: string, width: number) {
  return `${raw}${raw.includes("?") ? "&" : "?"}w=${width}&q=80&fm=jpg&fit=crop&auto=format`;
}

function baseLayout(slide: Slide, style: Style): Base {
  const size = style.font_size;
  const hasImage = !!slide.image_url;
  const base = textColorFor(style.bg_color);
  const creditBox = (box: Box) => (hasImage && slide.image_credit ? box : null);

  if (slide.type === "title") {
    return {
      mode: "hero",
      title: { x: 1, y: 1.9, w: 11.333, h: 2.2 },
      body: { x: 1, y: 4.3, w: 11.333, h: 1.0 },
      image: hasImage ? { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H } : null,
      credit: creditBox({ x: 7.8, y: 7.08, w: 5.2, h: 0.3 }),
      titleAlign: "center",
      titleSize: Math.min(Math.round(size * 2.6), 60),
      bodySize: Math.round(size * 1.2),
      textColor: hasImage ? "#FFFFFF" : base,
    };
  }

  if (slide.type === "thanks") {
    return {
      mode: "closing",
      title: { x: 1, y: 2.7, w: 11.333, h: 2.1 },
      body: null,
      image: null,
      credit: null,
      titleAlign: "center",
      titleSize: Math.min(Math.round(size * 2.8), 64),
      bodySize: size,
      textColor: base,
    };
  }

  const titleSize = Math.min(Math.round(size * 1.8), 44);
  const mode =
    hasImage && slide.layout === "image-left" ? "image-left" : hasImage && slide.layout === "image-right" ? "image-right" : "text";

  if (mode === "image-right") {
    return {
      mode, titleAlign: "left", titleSize, bodySize: size, textColor: base,
      title: { x: 0.7, y: 0.5, w: 7.0, h: 1.2 },
      body: { x: 0.7, y: 1.9, w: 7.0, h: 4.9 },
      image: { x: 8.2, y: 0.9, w: 4.43, h: 5.7 },
      credit: null,
    };
  }

  if (mode === "image-left") {
    return {
      mode, titleAlign: "left", titleSize, bodySize: size, textColor: base,
      title: { x: 5.7, y: 0.5, w: 6.93, h: 1.2 },
      body: { x: 5.7, y: 1.9, w: 6.93, h: 4.9 },
      image: { x: 0.7, y: 0.9, w: 4.43, h: 5.7 },
      credit: null,
    };
  }

  return {
    mode: "text", titleAlign: "left", titleSize, bodySize: size, textColor: base,
    title: { x: 0.7, y: 0.5, w: 11.93, h: 1.2 },
    body: { x: 0.7, y: 1.9, w: 11.93, h: 4.9 },
    image: null,
    credit: null,
  };
}

/** The layout plus the theme's decorations. SlideView and the PowerPoint export both read this. */
export function resolveLayout(slide: Slide, style: Style): Resolved {
  const base = baseLayout(slide, style);
  const theme = THEMES[style.theme] ?? THEMES.minimal;
  return { ...base, bullet: theme.bullet, deco: theme.deco(base) };
}