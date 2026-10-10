import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Download, Plus, Trash2 } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { FONTS, FONT_SIZES, LIMITS } from "../../../lib/presentation";
import { SLIDE_H, SLIDE_W, sortSlides, type Slide, type Style } from "../../../lib/slides";
import { THEMES, THEME_KEYS, type ThemeKey } from "../../../lib/themes";
import { addSlide, deleteSlide, moveSlide, saveSlide, updateStyle } from "../../../actions/slides";
import { SlideView } from "../../../components/SlideView";
import { SubmitButton } from "../../../components/ui/SubmitButton";
import { ImageField } from "../../../components/editor/ImageField";
import BackToTop from "../../../components/BackToTop";

export const metadata = { title: "Edit slides" };

const HERO_RATIO = SLIDE_W / SLIDE_H;
const SIDE_RATIO = 4.43 / 5.7; // the same image box that lib/slides.ts uses

const LABEL: Record<Slide["type"], string> = {
  title: "Title slide",
  intro: "Introduction",
  content: "Content",
  conclusion: "Conclusion",
  thanks: "Thank you",
};

const fixed = (s?: Slide) => !s || s.type === "title" || s.type === "thanks";

const iconBtn =
  "inline-flex size-9 items-center justify-center rounded-full border border-line bg-white/[0.04] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

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
  if (presentation.status !== "ready") redirect(`/workspace/${id}`);

  const slides = sortSlides((rows ?? []) as Slide[]);
  const style: Style = {
    font_family: presentation.font_family as string,
    font_size: presentation.font_size as number,
    bg_color: presentation.bg_color as string,
    theme: (presentation.theme ?? "minimal") as ThemeKey,
  };

  const canAdd = slides.length < LIMITS.slides.max;
  const canDelete = slides.length > 3;

  const Ids = ({ slideId }: { slideId: string }) => (
    <>
      <input type="hidden" name="id" value={slideId} />
      <input type="hidden" name="presentation_id" value={id} />
    </>
  );

  return (
    <main className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/workspace/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
          <ArrowLeft className="size-4" /> Back to preview
        </Link>
        <a href={`/workspace/${id}/download`} className="btn btn-ghost">
          <Download className="size-4" /> Download .pptx
        </a>
      </div>

      <h1 className="section-title text-gradient mt-6">Edit your slides</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Press <span className="text-fg">Save slide</span> to keep your changes. They stay in your workspace, and nothing is
        downloaded until you choose to.
      </p>

      {(error === "upload" || error === "invalid") && (
        <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error === "upload"
            ? "That image couldn't be saved. Use a JPG, PNG or WebP under 4 MB."
            : "That slide couldn't be saved. Check the title isn't empty and try again."}
        </div>
    )}

      {/* design */}
      <details className="card mt-8 p-4 sm:p-6">
        <summary className="cursor-pointer text-sm font-medium">Design: theme, font and background</summary>
        <form action={updateStyle} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="presentation_id" value={id} />
          <div className="space-y-1.5">
            <label htmlFor="theme" className="text-sm text-muted">Theme</label>
            <select id="theme" name="theme" defaultValue={style.theme} className="input">
              {THEME_KEYS.map((k) => (
                <option key={k} value={k}>{THEMES[k].label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="font_family" className="text-sm text-muted">Font</label>
            <select id="font_family" name="font_family" defaultValue={style.font_family} className="input">
              {FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="font_size" className="text-sm text-muted">Text size</label>
            <select id="font_size" name="font_size" defaultValue={style.font_size} className="input">
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="bg_color" className="text-sm text-muted">Background colour</label>
            <input
              id="bg_color"
              name="bg_color"
              type="color"
              defaultValue={style.bg_color}
              className="h-12 w-full cursor-pointer rounded-xl border border-line bg-transparent p-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton className="btn btn-primary" pendingText="Applying…">Apply design</SubmitButton>
          </div>
        </form>
      </details>

      {/* slides */}
      <div className="mt-8 space-y-6">
        {slides.map((s, i) => {
          const movable = !fixed(s);
          const hasImageField = s.type !== "thanks";
          const sideLayout = s.type !== "title" && s.type !== "thanks";

          return (
            <div key={s.id}>
              <section id={`slide-${s.id}`} className="card scroll-mt-24 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted">
                    Slide {i + 1} · {LABEL[s.type]}
                  </p>

                  {movable && (
                    <div className="flex items-center gap-2">
                      <form action={moveSlide}>
                        <Ids slideId={s.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button className={iconBtn} aria-label="Move slide up" disabled={fixed(slides[i - 1])}>
                          <ArrowUp className="size-4" />
                        </button>
                      </form>
                      <form action={moveSlide}>
                        <Ids slideId={s.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button className={iconBtn} aria-label="Move slide down" disabled={fixed(slides[i + 1])}>
                          <ArrowDown className="size-4" />
                        </button>
                      </form>
                      {canDelete && (
                        <details className="relative">
                          <summary
                            className={`${iconBtn} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
                            aria-label="Delete slide"
                          >
                            <Trash2 className="size-4" />
                          </summary>
                          <form
                            action={deleteSlide}
                            className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-line bg-surface-2 p-3 shadow-xl"
                          >
                            <Ids slideId={s.id} />
                            <p className="text-xs text-muted">Delete this slide?</p>
                            <SubmitButton className="btn btn-ghost mt-2 w-full text-red-300" pendingText="Deleting…">
                              Yes, delete
                            </SubmitButton>
                          </form>
                        </details>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div className="overflow-hidden rounded-xl ring-1 ring-line lg:self-start">
                    <SlideView slide={s} style={style} eager={i < 2} />
                  </div>

                  <form action={saveSlide} className="space-y-4">
                    <Ids slideId={s.id} />

                    <div className="space-y-1.5">
                      <label htmlFor={`title-${s.id}`} className="text-sm text-muted">Title</label>
                      <input
                        id={`title-${s.id}`}
                        name="title"
                        required
                        maxLength={120}
                        defaultValue={s.title}
                        className="input"
                      />
                    </div>

                    {s.type !== "thanks" && (
                      <div className="space-y-1.5">
                        <label htmlFor={`bullets-${s.id}`} className="text-sm text-muted">
                          {s.type === "title" ? "Presenter name" : "Bullet points (one per line, up to 6)"}
                        </label>
                        <textarea
                          id={`bullets-${s.id}`}
                          name="bullets"
                          rows={s.type === "title" ? 2 : 6}
                          maxLength={3000}
                          defaultValue={s.bullets.join("\n")}
                          className="input h-auto resize-y py-3 leading-relaxed"
                        />
                      </div>
                    )}

                    {sideLayout && (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor={`notes-${s.id}`} className="text-sm text-muted">Speaker notes</label>
                          <textarea
                            id={`notes-${s.id}`}
                            name="notes"
                            rows={3}
                            maxLength={3000}
                            defaultValue={s.notes}
                            className="input h-auto resize-y py-3 leading-relaxed"
                          />
                          <p className="text-xs text-subtle">Included in the downloaded file, not shown on the slide.</p>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor={`layout-${s.id}`} className="text-sm text-muted">Layout</label>
                          <select id={`layout-${s.id}`} name="layout" defaultValue={s.layout} className="input">
                            <option value="text-only">Text only</option>
                            <option value="image-right">Image on the right</option>
                            <option value="image-left">Image on the left</option>
                          </select>
                        </div>
                      </>
                    )}
                    {!sideLayout && <input type="hidden" name="layout" value={s.layout} />}

                    {hasImageField && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted">
                          {s.type === "title" ? "Cover image" : "Image"}
                          {s.image_credit ? " (from Unsplash)" : ""}
                        </p>
                        <ImageField ratio={s.type === "title" ? HERO_RATIO : SIDE_RATIO} />
                        {s.image_url && (
                          <label className="flex items-center gap-2 text-sm text-muted">
                            <input type="checkbox" name="remove_image" className="size-4 accent-[var(--color-brand)]" />
                            Remove the current image to display no image on this slide
                          </label>
                        )}
                      </div>
                    )}

                    <SubmitButton className="btn btn-primary" pendingText="Saving…">Save slide</SubmitButton>
                  </form>
                </div>
              </section>

              {s.type !== "thanks" && canAdd && (
                <form action={addSlide} className="mt-3 flex justify-center">
                  <input type="hidden" name="after" value={s.id} />
                  <input type="hidden" name="presentation_id" value={id} />
                  <button className="btn btn-ghost">
                    <Plus className="size-4" /> Add a slide here
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <BackToTop />
    </main>
  );
}