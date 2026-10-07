"use client";

import { useRef, useState } from "react";
import { createPresentation } from "../../actions/presentations";
import { BG_PRESETS, FONTS, FONT_SIZES, LIMITS, cssFont, textColorFor, type FontName } from "../../lib/presentation";
import { SubmitButton } from "../ui/SubmitButton";
import { GeneratingOverlay } from "./GeneratingOverlay";

const STEPS = [
  { title: "What's it about?", hint: "Describe your topic. The more specific, the better your slides." },
  { title: "A few details", hint: "Who's presenting, and how long should it be?" },
  { title: "Make it yours", hint: "Pick a font, text size and background colour." },
];

const SUGGESTIONS = [
  "The history of the internet",
  "Introduction to marketing",
  "How the human heart works",
  "Starting a small business",
];

const LAST = STEPS.length - 1;
const cq = (pt: number) => `${(pt / 960) * 100}cqw`; // pt -> % of slide width (13.33in = 960pt)

const SLIDE_OPTIONS = Array.from(
  { length: LIMITS.slides.max - LIMITS.slides.min + 1 },
  (_, i) => LIMITS.slides.min + i
);

function Select({
  id,
  name,
  value,
  onChange,
  children,
}: {
  id: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input appearance-none pr-10"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export function NewPresentationWizard({ defaultName }: { defaultName: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(10);
  const [fontFamily, setFontFamily] = useState<FontName>("Calibri");
  const [fontSize, setFontSize] = useState(20);
  const [bg, setBg] = useState(BG_PRESETS[0].value);

  function next() {
    const form = formRef.current;
    if (!form) return;

    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      `[data-step="${step}"] input, [data-step="${step}"] textarea`
    );
    for (const field of Array.from(fields)) {
      if (!field.reportValidity()) return;
    }
    if (step === 0 && topic.trim().length < 3) {
      setError("Please describe your topic in at least a few characters.");
      return;
    }

    setError(null);
    setStep((s) => Math.min(s + 1, LAST));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  // Enter moves to the next step instead of submitting the whole form early.
  function onKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && step < LAST && target.tagName !== "BUTTON") {
      e.preventDefault();
      next();
    }
  }

  const contentSlides = slideCount - 4;
  const textColor = textColorFor(bg);

  return (
    <div>
      {/* progress */}
      <p className="text-xs text-subtle">
        Step {step + 1} of {STEPS.length}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-colors ${i <= step ? "bg-brand" : "bg-white/10"}`} />
        ))}
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight sm:text-2xl" aria-live="polite">
        {STEPS[step].title}
      </h2>
      <p className="mt-1 text-sm text-muted">{STEPS[step].hint}</p>

      <form ref={formRef} action={createPresentation} onKeyDown={onKeyDown} className="mt-8">
        <GeneratingOverlay />
        {/* STEP 1: topic */}
        <div data-step="0" hidden={step !== 0} className="space-y-4">
          <label htmlFor="topic" className="sr-only">
            Topic
          </label>
          <textarea
            id="topic"
            name="topic"
            required
            minLength={3}
            maxLength={200}
            rows={3}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError(null);
            }}
            placeholder="e.g. The history of the internet"
            className="input h-auto resize-none py-3 leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>Or start from an example:</span>
            <span>{topic.length}/200</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTopic(s);
                  setError(null);
                }}
                className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-muted transition hover:bg-white/10 hover:text-fg"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: details */}
        <div data-step="1" hidden={step !== 1} className="space-y-7">
          <div className="space-y-2">
            <label htmlFor="author_name" className="text-sm text-muted">
              Presenter name
            </label>
            <input
              id="author_name"
              name="author_name"
              type="text"
              required
              maxLength={80}
              defaultValue={defaultName}
              autoComplete="name"
              placeholder="Your name"
              className="input"
            />
            <p className="text-xs text-subtle">Shown on your title slide.</p>
          </div>

          {/* slide count */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="slide_count" className="text-sm text-muted">
                Number of slides
              </label>
              <Select id="slide_count" name="slide_count" value={slideCount} onChange={setSlideCount}>
                {SLIDE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} slides
                  </option>
                ))}
              </Select>
            </div>
            <p className="rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
              Title, introduction,{" "}
              <span className="text-fg">
                {contentSlides} content {contentSlides === 1 ? "slide" : "slides"}
              </span>
              , conclusion and a thank-you slide.
            </p>
          </div>
        </div>

        {/* STEP 3: style */}
        <div data-step="2" hidden={step !== 2} className="space-y-7">
          <fieldset>
            <legend className="mb-2 text-sm text-muted">Font style</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FONTS.map((f) => (
                <label key={f} className="cursor-pointer">
                  <input
                    type="radio"
                    name="font_family"
                    value={f}
                    checked={fontFamily === f}
                    onChange={() => setFontFamily(f)}
                    className="peer sr-only"
                  />
                  <span
                    style={{ fontFamily: cssFont(f) }}
                    className="block truncate rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 text-center text-sm transition peer-checked:border-brand peer-checked:bg-brand/15 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-soft"
                  >
                    {f}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="font_size" className="text-sm text-muted">
              Text size
            </label>
            <Select id="font_size" name="font_size" value={fontSize} onChange={setFontSize}>
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-subtle">Titles scale up automatically from this size. Check the preview below.</p>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm text-muted">Background colour</legend>
            <div className="flex flex-wrap items-center gap-3">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  aria-label={p.name}
                  aria-pressed={bg === p.value}
                  onClick={() => setBg(p.value)}
                  style={{ background: p.value }}
                  className={`size-9 rounded-full transition ${
                    bg === p.value
                      ? "ring-2 ring-brand-soft ring-offset-2 ring-offset-surface"
                      : "ring-1 ring-white/20 hover:scale-105"
                  }`}
                />
              ))}
              <label className="flex items-center gap-2 text-xs text-muted">
                Custom
                <input
                  type="color"
                  name="bg_color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-1"
                />
              </label>
            </div>
          </fieldset>

          {/* live preview (same sizing rules the real slides will use) */}
          <div>
            <p className="mb-2 text-xs text-subtle">Preview</p>
            <div className="overflow-hidden rounded-xl ring-1 ring-line" style={{ containerType: "inline-size" }}>
              <div
                className="flex flex-col justify-center"
                style={{
                  aspectRatio: "16 / 9",
                  background: bg,
                  color: textColor,
                  fontFamily: cssFont(fontFamily),
                  padding: "7cqw",
                }}
              >
                <p className="font-bold leading-tight" style={{ fontSize: cq(Math.round(fontSize * 1.8)) }}>
                  {topic.trim().slice(0, 50) || "Your slide title"}
                </p>
                <ul className="mt-[2cqw] list-disc pl-[3.5cqw]" style={{ fontSize: cq(fontSize), lineHeight: 1.2 }}>
                  <li>A first key point</li>
                  <li>A second key point</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* navigation */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn btn-ghost btn-lg">
              Back
            </button>
          ) : (
            <span />
          )}

          {step < LAST ? (
            <button type="button" onClick={next} className="btn btn-primary btn-lg">
              Next
            </button>
          ) : (
            <SubmitButton className="btn btn-primary btn-lg" pendingText="Generating…">
              Create presentation
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}