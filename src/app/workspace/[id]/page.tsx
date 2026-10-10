import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { retryGeneration } from "../../actions/presentations";
import { sortSlides, type ImageCredit, type Slide } from "../../lib/slides";
import { SlideView } from "../../components/SlideView";
import { SubmitButton } from "../../components/ui/SubmitButton";
import { GeneratingOverlay } from "../../components/workspace/GeneratingOverlay";
import { ArrowLeft } from "lucide-react";
import BackToTop from "@/app/components/BackToTop";
import type { ThemeKey } from "../../lib/themes";


export const maxDuration = 60;

const ERRORS: Record<string, string> = {
  ai_busy: "The AI service is busy right now. Wait a minute, then try again.",
  generate_failed: "We couldn't generate your slides this time. Please try again.",
  rate_limit: "You've made several decks in the last hour. Please wait a little before trying again.",

};

export default async function PresentationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; detail?: string }>;
}) {
  const { id } = await params;
  const { error, detail } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: presentation }, { data: rows }] = await Promise.all([
    supabase.from("presentations").select("*").eq("id", id).single(),
    supabase.from("slides").select("*").eq("presentation_id", id),
  ]);
  if (!presentation) notFound();

  const slides = sortSlides((rows ?? []) as Slide[]);
  const style = {
    font_family: presentation.font_family as string,
    font_size: presentation.font_size as number,
    bg_color: presentation.bg_color as string,
    theme: (presentation.theme ?? "minimal") as ThemeKey,
  };

  const credits = Array.from(
    new Map(
      slides
        .filter((s): s is Slide & { image_credit: ImageCredit } => !!s.image_credit)
        .map((s) => [s.image_credit.name, s.image_credit])
    ).values()
  );

  const ready = presentation.status === "ready" && slides.length > 0;

  return (
    <main className="container-page py-8 sm:py-12">
      <Link href="/workspace" className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft /> Your presentations
      </Link>

      <BackToTop />

      <h1 className="section-title text-gradient mt-4 max-w-3xl">{slides[0]?.title || presentation.topic}</h1>
      <p className="mt-2 text-sm text-muted">
        {presentation.slide_count} slides · {presentation.font_family} · {presentation.font_size} pt
      </p>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {ERRORS[error] ?? "Something went wrong. Please try again."}
        </div>
      )}

      {ready && presentation.notice && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={`/workspace/${presentation.id}/edit`} className="btn btn-primary">
            Edit slides
          </Link>
          <a href={`/workspace/${presentation.id}/download`} className="btn btn-ghost">
            Download .pptx
          </a>
        </div>
      )}

      {process.env.NODE_ENV === "development" && detail && (
        <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          {detail}
        </pre>
      )}

      {!ready && (
        <div className="card mt-8 max-w-xl p-6 sm:p-8">
          <h2 className="text-lg font-medium">
            {presentation.status === "failed" ? "This presentation didn't finish generating" : "Nothing to show yet"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your settings are saved, so you don't need to fill in the form again.
          </p>
          <form action={retryGeneration} className="mt-6">
            <GeneratingOverlay />
            <input type="hidden" name="id" value={presentation.id} />
            <SubmitButton className="btn btn-primary btn-lg" pendingText="Generating…">
              Try again
            </SubmitButton>
          </form>
        </div>
      )}

      {ready && (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {slides.map((slide, i) => (
              <figure key={slide.id}>
                <div className="overflow-hidden rounded-xl ring-1 ring-line">
                  <SlideView slide={slide} style={style} eager={i < 2} />
                </div>
                <figcaption className="mt-2 text-xs text-subtle">Slide {i + 1}</figcaption>
              </figure>
            ))}
          </div>
          

          {credits.length > 0 && (
            <p className="mt-10 text-xs text-subtle">
              Photos by{" "}
              {credits.map((c, i) => (
                <span key={c.name}>
                  <a href={c.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
                    {c.name}
                  </a>
                  {i < credits.length - 1 ? ", " : ""}
                </span>
              ))}{" "}
              on{" "}
              <a
                href="https://unsplash.com/?utm_source=deckforge&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-fg"
              >
                Unsplash
              </a>
              .
            </p>
          )}
        </>
      )}
    </main>
  );
}