import Link from "next/link";
import { ArrowRight, Check, ImageIcon, Sparkles } from "../Icons";
import { EditorMockup } from "../mockups/EditorMockup";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-20 lg:pt-24">
      <div className="glow-brand -top-24" aria-hidden="true" />
      <div className="bg-grid absolute inset-x-0 top-0 h-[40rem]" aria-hidden="true" />

      <div className="container-page relative text-center">
        <Link href="/sign-up" className="badge group transition hover:bg-white/10">
          <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-medium text-brand-soft">New</span>
          AI slides with matching photos
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </Link>

        <h1 className="display text-gradient mx-auto mt-6 max-w-4xl">
          Turn any topic into a polished presentation
        </h1>
        <p className="lead mx-auto mt-6 max-w-2xl">
          Enter a topic, pick your style, and get a complete slide deck with matching photos. Edit anything you like,
          then download it as a PowerPoint file.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/sign-up" className="btn btn-primary btn-lg w-full sm:w-auto">
            Create your first deck <ArrowRight className="size-4" />
          </Link>
          <Link href="#how-it-works" className="btn btn-ghost btn-lg w-full sm:w-auto">
            See how it works
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          {["Free during early access", "No credit card", "Exports to .pptx"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 text-brand-soft" />
              {item}
            </li>
          ))}
        </ul>

        {/* product mockup */}
        <div className="relative mx-auto mt-14 max-w-5xl sm:mt-20">
          <div className="fade-bottom">
            <EditorMockup />
          </div>

          <div className="animate-float absolute -left-2 top-24 hidden items-center gap-3 rounded-2xl border border-line bg-surface-2/80 p-3 pr-5 shadow-2xl backdrop-blur-xl lg:flex xl:-left-12">
            <span className="grid size-9 place-items-center rounded-xl bg-brand/20 text-brand-soft">
              <Sparkles className="size-[18px]" />
            </span>
            <div className="text-left">
              <p className="text-sm font-medium">12 slides generated</p>
              <p className="text-xs text-muted">Introduction to conclusion</p>
            </div>
          </div>

          <div
            className="animate-float absolute -right-2 top-1/2 hidden items-center gap-3 rounded-2xl border border-line bg-surface-2/80 p-3 pr-5 shadow-2xl backdrop-blur-xl lg:flex xl:-right-12"
            style={{ animationDelay: "-3s" }}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <ImageIcon className="size-[18px]" />
            </span>
            <div className="text-left">
              <p className="text-sm font-medium">Photo matched</p>
              <p className="text-xs text-muted">Solar panels, rooftop</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}