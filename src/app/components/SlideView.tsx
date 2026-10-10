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

const cq = (pt: number) => `${(pt / (SLIDE_W * 72)) * 100}cqw`;

export function SlideView({ slide, style, eager = false }: { slide: Slide; style: Style; eager?: boolean }) {
  const L = resolveLayout(slide, style);
  const lines = slide.bullets.filter((b) => b.trim());
  const hero = L.mode === "hero";
  const centered = hero || L.mode === "closing";

  const decos = (front: boolean) =>
    L.deco
      .filter((d) => !!d.front === front)
      .map((d, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            ...box(d.box),
            background: d.color === "text" ? L.textColor : d.color,
            opacity: d.opacity ?? 1,
            borderRadius: d.shape === "ellipse" ? "50%" : 0,
          }}
        />
      ));

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
      {decos(false)}

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

      {decos(true)}

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
          <ul style={{ ...box(L.body), fontSize: cq(L.bodySize), lineHeight: 1.2, overflow: "hidden" }}>
            {lines.map((line, i) => (
              <li key={i} style={{ display: "flex", gap: "0.6em", marginBottom: `${10 / L.bodySize}em` }}>
                <span aria-hidden="true">{L.bullet}</span>
                <span>{line}</span>
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