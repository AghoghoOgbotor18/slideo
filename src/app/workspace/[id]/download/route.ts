import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { SLIDE_H, SLIDE_W, resolveLayout, sortSlides, type Box, type Slide, type Style } from "../../../lib/slides";
import type { ThemeKey } from "../../../lib/themes";

export const runtime = "nodejs";
export const maxDuration = 60;

const PX_PER_INCH = 120;
const hex = (c: string) => c.replace("#", "").toUpperCase();

/** Downloads an image for the file. Unsplash photos are cropped to the exact box, like the preview. */
async function loadImage(url: string, box: Box): Promise<string | null> {
  try {
    const src = url.includes("images.unsplash.com")
      ? `${url}${url.includes("?") ? "&" : "?"}w=${Math.round(box.w * PX_PER_INCH)}&h=${Math.round(box.h * PX_PER_INCH)}&q=80&fm=jpg&fit=crop&auto=format`
      : url; // our own uploads were already cropped to the right shape
    const res = await fetch(src, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0];
    return `${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Please sign in.", { status: 401 });

  const [{ data: p }, { data: rows }] = await Promise.all([
    supabase.from("presentations").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("slides").select("*").eq("presentation_id", id),
  ]);
  if (!p || p.status !== "ready" || !rows?.length) return new NextResponse("Presentation not found.", { status: 404 });

  const style: Style = {
    font_family: p.font_family,
    font_size: p.font_size,
    bg_color: p.bg_color,
    theme: (p.theme ?? "minimal") as ThemeKey,
  };
  const slides = sortSlides(rows as Slide[]);
  const layouts = slides.map((s) => resolveLayout(s, style));
  const images = await Promise.all(
    slides.map((s, i) => (s.image_url && layouts[i].image ? loadImage(s.image_url, layouts[i].image!) : Promise.resolve(null)))
  );

  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches, the same canvas as the preview
  pptx.title = slides[0]?.title || p.topic;
  pptx.author = p.author_name;
  pptx.company = "Slideo";

  slides.forEach((s, i) => {
    const L = layouts[i];
    const slide = pptx.addSlide();
    const font = style.font_family;
    const paint = (c: string) => hex(c === "text" ? L.textColor : c);

    slide.background = { color: hex(style.bg_color) };

    const decorations = (front: boolean) =>
      L.deco
        .filter((d) => !!d.front === front)
        .forEach((d) =>
          slide.addShape(d.shape === "ellipse" ? pptx.ShapeType.ellipse : pptx.ShapeType.rect, {
            ...d.box,
            fill: { color: paint(d.color), transparency: Math.round((1 - (d.opacity ?? 1)) * 100) },
            line: { type: "none" },
          })
        );

    // same drawing order as SlideView: shapes behind, image, dark overlay, shapes in front, text
    decorations(false);

    const image = images[i];
    if (image && L.image) slide.addImage({ data: image, ...L.image });
    if (L.mode === "hero" && L.image) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
        fill: { color: "000000", transparency: 50 },
        line: { type: "none" },
      });
    }

    decorations(true);

    slide.addText(s.title, {
      ...L.title,
      fontFace: font,
      fontSize: L.titleSize,
      bold: true,
      color: hex(L.textColor),
      align: L.titleAlign,
      valign: L.mode === "hero" ? "bottom" : "middle",
      margin: 0,
      lineSpacing: L.titleSize * 1.2,
    });

    const lines = s.bullets.filter((b) => b.trim());
    if (L.body && lines.length > 0) {
      const centered = L.mode === "hero" || L.mode === "closing";
      const code = (L.bullet.codePointAt(0) ?? 0x2022).toString(16).toUpperCase().padStart(4, "0");

      slide.addText(
        lines.map((line, n) => ({
          text: line,
          options: centered
            ? { breakLine: n < lines.length - 1 }
            : {
                bullet: { characterCode: code, indent: Math.round(L.bodySize * 1.3) },
                paraSpaceAfter: 10,
                breakLine: n < lines.length - 1,
              },
        })),
        {
          ...L.body,
          fontFace: font,
          fontSize: L.bodySize,
          color: hex(L.textColor),
          align: centered ? "center" : "left",
          valign: "top",
          margin: 0,
          lineSpacing: L.bodySize * 1.2,
        }
      );
    }

    if (L.credit && s.image_credit) {
      slide.addText(`Photo by ${s.image_credit.name} on Unsplash`, {
        ...L.credit,
        fontFace: font,
        fontSize: 9,
        color: hex(L.textColor),
        transparency: 30,
        align: L.mode === "hero" ? "right" : "left",
        valign: "top",
        margin: 0,
        wrap: false,
      });
    }

    if (s.notes) slide.addNotes(s.notes);
  });

  const file = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const name = (slides[0]?.title || p.topic).replace(/[^\w\- ]+/g, "").trim().slice(0, 60) || "Slideo presentation";

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${name}.pptx"`,
      "Cache-Control": "private, no-store",
    },
  });
}