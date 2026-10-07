import type { CSSProperties } from "react";
import { cssFont } from "../lib/presentation";
import { SLIDE_H, SLIDE_W, imgUrl, resolveLayout, type Box, type Slide, type Style } from "../lib/slides";

const box = (b: Box): CSSProperties => ({
  position: "absolute",
  left: `${(b.x / SLIDE_W) * 100}%`,
  top: `${(b.y / SLIDE_H) * 100}%`,
  width: `${(b.w / SLIDE_W) * 100}%`,
  height: `${(b.h / SLIDE_H) * 100}%`,
});

// points -> % of slide width (13.333in * 72 = 960pt)
const cq = (pt: number) => `${(pt / (SLIDE_W * 72)) * 100}cqw`;

export function SlideView({ slide, style, eager = false }: { slide: Slide; style: Style; eager?: boolean }) {
  const L = resolveLayout(slide, style);
  const lines = slide.bullets.filter((b) => b.trim());
  const hero = L.mode === "hero";
  const centered = hero || L.mode === "closing";

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{
        containerType: "inline-size",
        aspectRatio: `${SLIDE_W} / ${SLIDE_H}`,
        background: style.bg_color,
        color: L.textColor,
        fontFamily: cssFont(style.font_family),
      }}
    >
      {L.image && slide.image_url && (
        <div style={box(L.image)} className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl(slide.image_url, hero ? 1600 : 900)}
            alt=""
            loading={eager ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {hero && L.image && <div style={{ ...box(L.image), background: "rgba(0,0,0,0.5)" }} />}

      <div
        style={{
          ...box(L.title),
          display: "flex",
          alignItems: hero ? "flex-end" : "center",
          justifyContent: L.titleAlign === "center" ? "center" : "flex-start",
          textAlign: L.titleAlign,
          fontSize: cq(L.titleSize),
          fontWeight: 700,
          lineHeight: 1.2,
          overflow: "hidden",
        }}
      >
        <span>{slide.title}</span>
      </div>

      {L.body &&
        (centered ? (
          <div style={{ ...box(L.body), textAlign: "center", fontSize: cq(L.bodySize), lineHeight: 1.2, overflow: "hidden" }}>
            {lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : (
          <ul
            style={{
              ...box(L.body),
              fontSize: cq(L.bodySize),
              lineHeight: 1.2,
              listStyle: "disc",
              paddingLeft: "1.2em",
              overflow: "hidden",
            }}
          >
            {lines.map((line, i) => (
              <li key={i} style={{ marginBottom: `${10 / L.bodySize}em` }}>
                {line}
              </li>
            ))}
          </ul>
        ))}

      {L.credit && slide.image_credit && (
        <div
          style={{
            ...box(L.credit),
            fontSize: cq(9),
            opacity: 0.7,
            textAlign: hero ? "right" : "left",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          Photo by {slide.image_credit.name} on Unsplash
        </div>
      )}
    </div>
  );
}