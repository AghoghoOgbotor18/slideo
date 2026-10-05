import SectionHeading from "../SectionHeading";
import { Download, FileIcon, Grip } from "../Icons";
import { MiniSlide } from "../mockups/MiniSlide";
import { THEMES } from "../mockups/themes";

function FeatureCard({
  title,
  text,
  className = "",
  children,
}: {
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`card relative flex flex-col overflow-hidden p-6 transition hover:border-white/15 sm:p-8 ${className}`}>
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{text}</p>
      <div className="mt-6 flex-1">{children}</div>
    </article>
  );
}

const OUTLINE = [
  { mark: "01", label: "Title slide", tag: "Photo background" },
  { mark: "02", label: "Introduction", tag: "Always second" },
  { mark: "···", label: "Your content slides", tag: "As many as you need" },
  { mark: "11", label: "Conclusion", tag: "Second to last" },
  { mark: "12", label: "Thank you", tag: "Always last" },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading badge="Features" title="Everything you need to go from idea to finished deck">
          Gemini writes the content, Unsplash supplies the photos, and you stay in control the whole way.
        </SectionHeading>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <FeatureCard
            className="md:col-span-2 lg:col-span-4"
            title="A complete deck, in the right order"
            text="Every deck follows a proper structure, so you never get a random pile of slides."
          >
            <p className="mb-3 text-xs text-subtle">Example: a 12-slide deck</p>
            <ul className="space-y-2">
              {OUTLINE.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-6 min-w-6 place-items-center rounded-md bg-brand/15 px-1 text-[11px] text-brand-soft">
                      {row.mark}
                    </span>
                    {row.label}
                  </span>
                  <span className="hidden text-xs text-subtle sm:block">{row.tag}</span>
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            title="Photos that fit the text"
            text="AI decides which slides need an image and finds one that matches, placed right beside the words."
          >
            <div className="overflow-hidden rounded-xl ring-1 ring-line">
              <MiniSlide
                kind="content"
                title="Wind Power"
                lines={["Turbines convert wind to power", "Offshore farms are growing"]}
                theme={THEMES.ocean}
                image="/images/wind.webp"
                imageAlt="Wind turbines generating renewable energy"
                />
            </div>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            title="Edit anything"
            text="Change the words, swap a photo, or drag slides into a new order."
          >
            <ul className="space-y-2 text-sm">
              {["Solar Power", "Wind Power", "Hydro Power"].map((name, i) => (
                <li
                  key={name}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                    i === 1
                      ? "-rotate-1 scale-[1.03] border-brand/50 bg-brand/15 shadow-xl shadow-black/40"
                      : "border-line bg-white/[0.03]"
                  }`}
                >
                  <Grip className="size-4 text-subtle" />
                  {name}
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            title="Your style"
            text="Choose the font, text size, and background colour before you generate."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Calibri", "Georgia", "Verdana"].map((font, i) => (
                  <span
                    key={font}
                    style={{ fontFamily: font }}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${
                      i === 1 ? "border-brand/60 bg-brand/15 text-fg" : "border-line text-muted"
                    }`}
                  >
                    {font}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2.5">
                {["#0e0b22", "#0b1220", "#0a1410", "#1f1020", "#f6f3ec"].map((c, i) => (
                  <span
                    key={c}
                    className={`size-7 rounded-full ring-1 ring-white/15 ${
                      i === 0 ? "ring-2 ring-brand-soft ring-offset-2 ring-offset-surface" : ""
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            title="Download as .pptx"
            text="Get a real PowerPoint file that opens in PowerPoint, Keynote, and Google Slides."
          >
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white/[0.03] p-4">
              <span className="grid size-11 place-items-center rounded-lg bg-orange-500/15 text-orange-300">
                <FileIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Renewable-Energy.pptx</p>
                <p className="text-xs text-subtle">12 slides · Ready to present</p>
              </div>
              <Download className="size-5 text-muted" />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}