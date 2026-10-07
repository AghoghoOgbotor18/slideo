import { z } from "zod";

// A .pptx file can't embed fonts, so we only offer ones installed on most Windows and Mac computers.
export const FONTS = [
  "Calibri",
  "Arial",
  "Segoe UI",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Georgia",
  "Times New Roman",
  "Cambria",
  "Garamond",
] as const;

export type FontName = (typeof FONTS)[number];

export const BG_PRESETS = [
  { name: "Midnight violet", value: "#0e0b22" },
  { name: "Deep navy", value: "#0b1220" },
  { name: "Forest", value: "#0a1410" },
  { name: "Plum", value: "#1f1020" },
  { name: "Charcoal", value: "#16161a" },
  { name: "Paper", value: "#f6f3ec" },
  { name: "White", value: "#ffffff" },
];

export const LIMITS = {
  slides: { min: 5, max: 20 },
  fontSize: { min: 14, max: 32 },
};

export const FONT_SIZES = [
  { value: 14, label: "14 pt (very small)" },
  { value: 16, label: "16 pt (small)" },
  { value: 18, label: "18 pt" },
  { value: 20, label: "20 pt (default)" },
  { value: 24, label: "24 pt (large)" },
  { value: 28, label: "28 pt (very large)" },
  { value: 32, label: "32 pt (largest)" },
];

export const createPresentationSchema = z.object({
  topic: z
    .string()
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .pipe(z.string().min(3).max(200)),
  author_name: z.string().trim().min(1).max(80),
  font_family: z.enum(FONTS),
  font_size: z.coerce.number().int().min(LIMITS.fontSize.min).max(LIMITS.fontSize.max),
  bg_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  slide_count: z.coerce.number().int().min(LIMITS.slides.min).max(LIMITS.slides.max),
});

/** Light or dark text, whichever reads better on the given background. */
export function textColorFor(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#0F172A" : "#FFFFFF";
}

const SERIF: string[] = ["Georgia", "Times New Roman", "Cambria", "Garamond"];

export function cssFont(font: string) {
  return `"${font}", ${SERIF.includes(font) ? "Georgia, serif" : "Arial, sans-serif"}`;
}