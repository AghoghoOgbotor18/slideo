import Image from "next/image";
import type { CSSProperties } from "react";

export type SlideTheme = { bg: string; fg: string; photo: string };

type Props = {
  kind: "title" | "content";
  title: string;
  lines?: string[];
  byline?: string;
  theme: SlideTheme;
  flip?: boolean;
  className?: string;
  image?: string;
  imageAlt?: string;
};

export function MiniSlide({
  kind,
  title,
  lines = [],
  byline,
  theme,
  flip = false,
  className = "",
  image,
  imageAlt = "",
}: Props) {
  const frame: CSSProperties = {
    background: theme.bg,
    color: theme.fg,
    containerType: "inline-size",
    aspectRatio: "16 / 9",
  };

  if (kind === "title") {
    return (
      <div className={`relative overflow-hidden ${className}`} style={frame}>
        {image ? (
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: theme.photo }} />
        )}

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-[8cqw] text-center text-white">
          <p
            className="font-semibold leading-tight"
            style={{ fontSize: "7.5cqw" }}
          >
            {title}
          </p>

          {byline && (
            <p
              className="mt-[2cqw] opacity-80"
              style={{ fontSize: "3.2cqw" }}
            >
              {byline}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={frame}>
      <div
        className={`absolute inset-0 flex items-stretch gap-[4cqw] p-[6cqw] ${
          flip ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p
            className="font-semibold leading-tight"
            style={{ fontSize: "5.6cqw" }}
          >
            {title}
          </p>

          <ul
            className="mt-[2.4cqw] list-disc space-y-[1.2cqw] pl-[3cqw] opacity-85"
            style={{ fontSize: "3cqw", lineHeight: 1.25 }}
          >
            {lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>

        <div className="relative w-[38%] shrink-0 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 40vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: theme.photo }} />
          )}
        </div>
      </div>
    </div>
  );
}