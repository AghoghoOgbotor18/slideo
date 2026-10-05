import SectionHeading from "../SectionHeading";
import { Check } from "../Icons";
import { MiniSlide } from "../mockups/MiniSlide";
import { THEMES } from "../mockups/themes";

export default function FormVisual() {
  return (
    <div className="space-y-3 rounded-xl border border-line bg-bg/60 p-4 text-xs">
      <div>
        <p className="mb-1 text-subtle">Topic</p>
        <div className="rounded-lg border border-line bg-white/5 px-3 py-2">The history of the internet</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-subtle">Font</p>
          <div className="rounded-lg border border-line bg-white/5 px-3 py-2">Calibri</div>
        </div>
        <div>
          <p className="mb-1 text-subtle">Slides</p>
          <div className="rounded-lg border border-line bg-white/5 px-3 py-2">12</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="mr-1 text-subtle">Background</p>
        {["#0e0b22", "#0b1220", "#0a1410"].map((c, i) => (
          <span
            key={c}
            className={`size-5 rounded-full ring-1 ring-white/15 ${i === 0 ? "ring-2 ring-brand-soft" : ""}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

function ProgressVisual() {
  const items: [string, boolean][] = [
    ["Writing your slides", true],
    ["Finding matching photos", true],
    ["Putting it all together", false],
  ];
  return (
    <ul className="space-y-3 rounded-xl border border-line bg-bg/60 p-4 text-sm">
      {items.map(([label, done]) => (
        <li key={label} className="flex items-center gap-3">
          <span
            className={`grid size-5 place-items-center rounded-full ${
              done ? "bg-brand text-white" : "border border-brand/60"
            }`}
          >
            {done ? <Check className="size-3" /> : <span className="size-1.5 animate-pulse rounded-full bg-brand-soft" />}
          </span>
          <span className={done ? "text-fg" : "text-muted"}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function EditVisual() {
  return (
    <div className="space-y-3 rounded-xl border border-line bg-bg/60 p-4">
      <div className="grid grid-cols-3 gap-2">
        <MiniSlide kind="title" title="Internet" theme={THEMES.violet} />
        <MiniSlide kind="content" title="Origins" lines={["ARPANET"]} theme={THEMES.violet} />
        <MiniSlide kind="content" title="The Web" lines={["1990s"]} theme={THEMES.violet} flip />
      </div>
      <div className="flex gap-2">
        <span className="btn btn-ghost h-8 flex-1 px-3 text-xs">Preview</span>
        <span className="btn btn-primary h-8 flex-1 px-3 text-xs">Download .pptx</span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Describe your deck",
    text: "Enter your topic, choose a font, text size and background colour, and pick how many slides you want.",
    visual: <FormVisual />,
  },
  {
    title: "AI builds it for you",
    text: "Gemini writes every slide and picks which ones need a photo. Unsplash supplies matching images.",
    visual: <ProgressVisual />,
  },
  {
    title: "Edit, preview, download",
    text: "Tweak the text, swap images, reorder slides, preview the result, then download your .pptx file.",
    visual: <EditVisual />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading badge="How it works" title="From blank page to finished slides in three steps">
          No templates to wrestle with and no design skills needed.
        </SectionHeading>

        <ol className="mt-14 grid gap-4 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card flex flex-col p-6 sm:p-7">
              <span className="grid size-8 place-items-center rounded-full bg-brand/15 text-sm font-medium text-brand-soft">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              <div className="mt-6 flex-1">{step.visual}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}