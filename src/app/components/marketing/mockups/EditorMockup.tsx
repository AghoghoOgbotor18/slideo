import { MiniSlide } from "./MiniSlide";
import { THEMES } from "./themes";

const t = THEMES.violet;
const label = "mb-1.5 text-[10px] uppercase tracking-wider text-subtle";

const THUMBS = [
  { kind: "title", title: "Renewable Energy", byline: "Alex Morgan" },
  { kind: "content", title: "Introduction", lines: ["Why it matters", "Where we are today"] },
  { kind: "content", title: "Solar Power", lines: ["Sunlight to electricity", "Falling costs"], flip: true },
  { kind: "content", title: "Wind Power", lines: ["Onshore and offshore", "Growing capacity"] },
] as const;

export function EditorMockup() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[0_40px_120px_-30px_rgba(124,92,255,0.45)]"
    >
      {/* window bar */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </div>
        <p className="mx-auto flex items-center gap-2 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Renewable Energy · Saved
        </p>
        <span className="btn btn-primary h-7 px-3 text-xs">Download</span>
      </div>

      <div className="grid sm:grid-cols-[120px_minmax(0,1fr)] md:grid-cols-[132px_minmax(0,1fr)_230px]">
        {/* slide strip */}
        <div className="hidden space-y-2.5 border-r border-line p-3 sm:block">
          {THUMBS.map((s, i) => (
            <div key={s.title} className={`rounded-md p-0.5 ${i === 2 ? "ring-2 ring-brand" : "ring-1 ring-line"}`}>
              <MiniSlide {...s} lines={"lines" in s ? [...s.lines] : undefined} theme={t} />
            </div>
          ))}
        </div>

        {/* canvas */}
        <div className="p-3 sm:p-6">
          <div className="overflow-hidden rounded-lg ring-1 ring-line">
            <MiniSlide
                kind="content"
                title="Pitch Deck"
                lines={[
                    "Problem statement",
                    "Proposed solution",
                    "Market opportunity",
                    "Business model",
                    "Financial projections",
                ]}
                theme={THEMES.violet}
                image="/images/ppt2.webp"
                imageAlt="powerpoint slides created by slideo"
            />
          </div>
          <p className="mt-3 text-center text-[11px] text-subtle">Slide 3 of 12</p>
        </div>

        {/* edit panel */}
        <div className="hidden space-y-4 border-l border-line p-4 md:block">
          <div>
            <p className={label}>Title</p>
            <div className="rounded-lg border border-line bg-white/5 px-3 py-2 text-xs">Solar Power</div>
          </div>
          <div>
            <p className={label}>Bullet points</p>
            <div className="space-y-1.5 rounded-lg border border-line bg-white/5 p-3 text-[11px] text-muted">
              <p>Panels turn sunlight into electricity</p>
              <p>Costs have fallen sharply in a decade</p>
              <p>Works on rooftops and solar farms</p>
            </div>
          </div>
          <div>
            <p className={label}>Image</p>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg" style={{ background: t.photo }} />
              <span className="btn btn-ghost h-8 px-3 text-xs">Change</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}